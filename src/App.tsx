/**
 * Void Station: Beyond the Event Horizon
 * Main Application Hub & 60 FPS Canvas Simulation Controller
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TitleScreen } from './components/TitleScreen.tsx';
import { HUD, ActiveTab } from './components/HUD.tsx';
import { StationView } from './components/StationView.tsx';
import { InventoryView } from './components/InventoryView.tsx';
import { SectorMapView } from './components/SectorMapView.tsx';
import { NPCLogView } from './components/NPCLogView.tsx';
import { CombatView } from './components/CombatView.tsx';
import { PauseModal, GameOverModal, VictoryModal } from './components/StatusModals.tsx';
import { LoreModal } from './components/LoreModal.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';

import {
  INITIAL_STATS,
  INITIAL_ITEMS,
  INITIAL_SLOTS,
  INITIAL_NPCS,
  INITIAL_QUESTS,
  INITIAL_SECTOR_NODES,
} from './game/initialData.ts';
import {
  advanceSimulationStep,
  calculateEnergyBalance,
  calculateOxygenBalance,
  deductCraftCost,
  resolveCombatTurn,
  CombatState,
  CraftingRecipe,
  ModuleItem,
} from './game/rules.ts';
import { drawParallaxCosmicBackground } from './game/proceduralGraphics.ts';
import { soundEngine } from './game/audio.ts';
import { DialogueChoice, InventoryItem, SectorNode, StationSlot, StationStats } from './game/types.ts';

export default function App() {
  // Master Game State
  const [gameState, setGameState] = useState<'title' | 'playing' | 'paused' | 'gameover' | 'victory'>('title');
  const [activeTab, setActiveTab] = useState<ActiveTab>('station');

  // Gameplay Simulation State
  const [stats, setStats] = useState<StationStats>(INITIAL_STATS);
  const [slots, setSlots] = useState<StationSlot[]>(INITIAL_SLOTS);
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_ITEMS);
  const [npcs, setNpcs] = useState(INITIAL_NPCS);
  const [quests, setQuests] = useState(INITIAL_QUESTS);
  const [nodes, setNodes] = useState<SectorNode[]>(INITIAL_SECTOR_NODES);

  // Combat State
  const [combat, setCombat] = useState<CombatState | null>(null);
  const [combatLogs, setCombatLogs] = useState<string[]>([]);

  // Telemetry Alerts
  const [activeAlert, setActiveAlert] = useState<string | null>(null);
  const [gameOverReason, setGameOverReason] = useState<string>('Критическое разрушение корпуса станции.');

  // Modals
  const [isLoreOpen, setIsLoreOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [scanlinesEnabled, setScanlinesEnabled] = useState(true);

  // Canvas Ref
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);

  // Sync dataset.state with body
  useEffect(() => {
    document.body.dataset.state = gameState;
  }, [gameState]);

  // Support ?autostart=1
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      setGameState('playing');
      soundEngine.startAmbient();
    }
  }, []);

  // Clamped 60fps Canvas Background Loop
  useEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();
    let elapsed = 0;

    const isHeadless =
      typeof navigator !== 'undefined' &&
      (navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent));

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const loop = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.05);
      elapsed += dt;

      drawParallaxCosmicBackground(ctx, canvas.width, canvas.height, elapsed, stats.threatLevel);

      // In headless mode throttle frame-rate to 15fps to prevent CPU overload
      if (isHeadless) {
        setTimeout(() => {
          animId = requestAnimationFrame(loop);
        }, 66);
      } else {
        animId = requestAnimationFrame(loop);
      }
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [stats.threatLevel]);

  // Keyboard Hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        if (gameState === 'title') {
          soundEngine.startAmbient();
          setGameState('playing');
        }
      } else if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (gameState === 'playing') {
          setGameState('paused');
        } else if (gameState === 'paused') {
          setGameState('playing');
        }
      } else if (e.key === 'm' || e.key === 'M') {
        const nextMute = soundEngine.toggleMute();
        setIsMuted(nextMute);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Calculate Net Energy & Oxygen
  const installedModules: ModuleItem[] = slots
    .filter((s) => s.installedItem !== null)
    .map((s) => {
      const it = s.installedItem!;
      return {
        id: it.id,
        name: it.name,
        type: s.slotType,
        tier: 1,
        powerDraw: it.stats?.powerDraw ?? 0,
        oxygenGen: it.stats?.oxygenGen ?? 0,
        hullBonus: it.stats?.hullBonus ?? 0,
        shieldBonus: it.stats?.shieldBonus ?? 0,
        defense: it.stats?.defense ?? 0,
        attackPower: it.stats?.attackPower ?? 0,
        description: it.description,
      };
    });

  const energyBalance = calculateEnergyBalance(installedModules);
  const oxygenBalance = calculateOxygenBalance(installedModules, stats.crewCount);

  // Advance Station Cycle
  const handleAdvanceCycle = useCallback(() => {
    soundEngine.playBeep(580, 'sine', 0.1);

    const { nextResources, alert } = advanceSimulationStep(
      stats,
      installedModules,
      stats.crewCount,
      stats.threatLevel
    );

    setActiveAlert(alert);

    // Check Victory (if player has Ancient Relic and Quantum Scanner)
    const hasRelic = items.some((it) => it.iconType === 'void_relic');
    const hasScanner = slots.some((s) => s.slotType === 'scanner' && s.installedItem !== null);
    if (hasRelic && hasScanner && stats.cycle >= 5) {
      soundEngine.playWarp();
      setGameState('victory');
      return;
    }

    // Check Loss
    if (nextResources.hull <= 0) {
      soundEngine.playExplosion();
      setGameOverReason(
        nextResources.oxygen <= 0
          ? 'Запасы кислорода иссякли. Экипаж задохнулся в вакууме.'
          : 'Корпус станции не выдержал гравитационного прилива сингулярности.'
      );
      setGameState('gameover');
      return;
    }

    // Slightly increase anomaly threat over cycles
    const nextThreat = Math.min(100, stats.threatLevel + Math.floor(Math.random() * 4));

    setStats({
      ...nextResources,
      threatLevel: nextThreat,
      cycle: stats.cycle + 1,
      crewCount: stats.crewCount,
    });
  }, [stats, installedModules, items, slots]);

  // Actions from Station View
  const handleLaunchDrone = () => {
    if (stats.energy >= 10) {
      setStats((prev) => ({
        ...prev,
        energy: prev.energy - 10,
        titanium: prev.titanium + 25,
      }));
    }
  };

  const handleBoostShields = () => {
    if (stats.energy >= 15) {
      setStats((prev) => ({
        ...prev,
        energy: prev.energy - 15,
        hull: Math.min(prev.maxHull, prev.hull + 10),
      }));
    }
  };

  const handleScanAnomaly = () => {
    if (stats.energy >= 12) {
      setStats((prev) => ({
        ...prev,
        energy: prev.energy - 12,
        threatLevel: Math.max(5, prev.threatLevel - 15),
        voidCrystals: prev.voidCrystals + 2,
      }));
    }
  };

  // Inventory & Crafting Actions
  const handleEquipItem = (slotId: string, item: InventoryItem) => {
    setSlots((prev) =>
      prev.map((slot) => {
        if (slot.id === slotId) {
          return { ...slot, installedItem: item, isActive: true };
        }
        return slot;
      })
    );
    // Remove from inventory
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === item.id);
      if (idx === -1) return prev;
      if (prev[idx].quantity > 1) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity - 1 };
        return copy;
      }
      return prev.filter((i) => i.id !== item.id);
    });
  };

  const handleUnequipSlot = (slotId: string) => {
    const slot = slots.find((s) => s.id === slotId);
    if (!slot || !slot.installedItem) return;

    const unequipped = slot.installedItem;
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, installedItem: null, isActive: false } : s))
    );

    // Return to inventory
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === unequipped.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + 1 };
        return copy;
      }
      return [...prev, unequipped];
    });
  };

  const handleCraftItem = (recipe: CraftingRecipe) => {
    const nextRes = deductCraftCost(stats, recipe);
    setStats((prev) => ({
      ...prev,
      titanium: nextRes.titanium,
      voidCrystals: nextRes.voidCrystals,
      energy: nextRes.energy,
    }));

    // Create item in inventory
    const newItem: InventoryItem = {
      id: `${recipe.resultItemId}_${Date.now()}`,
      name: recipe.name,
      category: 'module',
      rarity: recipe.resultItemId.includes('relic') ? 'relic' : 'epic',
      iconType: recipe.resultItemId.includes('solar')
        ? 'solar_module'
        : recipe.resultItemId.includes('shield')
        ? 'shield_module'
        : recipe.resultItemId.includes('drone')
        ? 'drone_hangar'
        : recipe.resultItemId.includes('scanner')
        ? 'scanner_dish'
        : recipe.resultItemId.includes('plasma')
        ? 'plasma_cannon'
        : 'hyper_alloy',
      description: recipe.description,
      quantity: 1,
      marketValue: 120,
      stats: {
        powerDraw: recipe.resultItemId.includes('solar') ? -35 : 12,
        shieldBonus: recipe.resultItemId.includes('shield') ? 100 : 0,
        attackPower: recipe.resultItemId.includes('plasma') ? 45 : 0,
        hullBonus: recipe.resultItemId.includes('hyper') ? 20 : 0,
      },
    };

    setItems((prev) => [...prev, newItem]);
  };

  // Sector Map Actions
  const handleScanNode = (nodeId: string) => {
    if (stats.energy >= 8) {
      setStats((prev) => ({ ...prev, energy: prev.energy - 8 }));
      setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, scanned: true } : n)));
    }
  };

  const handleExploreNode = (node: SectorNode) => {
    if (stats.energy < 15) return;
    setStats((prev) => ({ ...prev, energy: prev.energy - 15 }));

    if (node.encounterType === 'combat') {
      // Trigger Tactical Combat
      const newCombat: CombatState = {
        playerHull: Math.round(stats.hull),
        playerMaxHull: stats.maxHull,
        playerShield: 50,
        playerMaxShield: 50,
        playerEnergy: 60,
        enemyName: node.name,
        enemyHull: 80,
        enemyMaxHull: 80,
        enemyShield: 30,
        enemyMaxShield: 30,
        enemyAttackTelegraph: 'Запуск тяжелых торпед Бездны',
        enemyIntentPower: 24,
        turn: 1,
      };
      setCombat(newCombat);
      setCombatLogs([`Обнаружен вражеский контакт в зоне «${node.name}»! Орудийные батареи приведены в готовность.`]);
      setActiveTab('combat');
    } else {
      // Scavenge / Mystery yield
      setStats((prev) => ({
        ...prev,
        titanium: prev.titanium + node.resourceYield.titanium,
        voidCrystals: prev.voidCrystals + node.resourceYield.voidCrystals,
      }));
      setNodes((prev) => prev.map((n) => (n.id === node.id ? { ...n, explored: true, scanned: true } : n)));

      // Advance quest if relevant
      setQuests((prev) =>
        prev.map((q) => {
          if (q.targetType === 'explore_node') {
            const nextCount = q.currentCount + 1;
            return {
              ...q,
              currentCount: nextCount,
              completed: nextCount >= q.targetCount,
            };
          }
          return q;
        })
      );
    }
  };

  // Combat Turn Actions
  const handleCombatAction = (action: 'fire_plasma' | 'boost_shields' | 'emp_disrupt' | 'hyper_dodge') => {
    if (!combat) return;

    const weaponModule = slots.find((s) => s.slotType === 'weapon' && s.installedItem !== null);
    const weaponPower = weaponModule?.installedItem?.stats?.attackPower || 25;

    const { nextState, log, playerWon, playerLost } = resolveCombatTurn(combat, action, weaponPower);
    setCombat(nextState);
    setCombatLogs((prev) => [log, ...prev]);

    if (playerWon) {
      // Reward player
      setStats((prev) => ({
        ...prev,
        titanium: prev.titanium + 60,
        voidCrystals: prev.voidCrystals + 10,
        hull: nextState.playerHull,
      }));
      // Mark nodes explored
      setNodes((prev) =>
        prev.map((n) => (n.name === combat.enemyName ? { ...n, explored: true } : n))
      );
      // Quest progress
      setQuests((prev) =>
        prev.map((q) => {
          if (q.targetType === 'defeat_enemy') {
            return { ...q, currentCount: q.currentCount + 1, completed: true };
          }
          return q;
        })
      );
      setTimeout(() => {
        setCombat(null);
        setActiveTab('map');
      }, 1500);
    } else if (playerLost) {
      soundEngine.playExplosion();
      setGameOverReason(`Корабль был уничтожен в бою против «${combat.enemyName}».`);
      setGameState('gameover');
    }
  };

  const handleFleeCombat = () => {
    setCombat(null);
    setActiveTab('station');
  };

  // NPC Actions
  const handleDialogueAction = (choice: DialogueChoice, npcId: 'vex' | 'elira' | 'kallo') => {
    if (choice.cost?.titanium && stats.titanium < choice.cost.titanium) {
      soundEngine.playAlarm();
      return;
    }

    if (choice.action === 'heal_hull') {
      setStats((prev) => ({
        ...prev,
        titanium: prev.titanium - (choice.cost?.titanium || 0),
        hull: Math.min(prev.maxHull, prev.hull + 30),
      }));
    } else if (choice.action === 'trade') {
      setStats((prev) => ({
        ...prev,
        titanium: prev.titanium - (choice.cost?.titanium || 0),
        voidCrystals: prev.voidCrystals + (choice.reward?.voidCrystals || 0),
      }));
    }

    // Boost reputation
    setNpcs((prev) => ({
      ...prev,
      [npcId]: {
        ...prev[npcId],
        reputation: Math.min(100, prev[npcId].reputation + 5),
      },
    }));
  };

  const handleAcceptQuest = (questId: string) => {
    setQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, currentCount: 0 } : q))
    );
  };

  const handleClaimQuestReward = (questId: string) => {
    const q = quests.find((quest) => quest.id === questId);
    if (!q || !q.completed || q.claimed) return;

    setStats((prev) => ({
      ...prev,
      titanium: prev.titanium + q.reward.titanium,
      voidCrystals: prev.voidCrystals + q.reward.voidCrystals,
      energy: Math.min(prev.maxEnergy, prev.energy + q.reward.energy),
    }));

    setQuests((prev) =>
      prev.map((quest) => (quest.id === questId ? { ...quest, claimed: true } : quest))
    );
  };

  const handleRestartGame = () => {
    setStats(INITIAL_STATS);
    setSlots(INITIAL_SLOTS);
    setItems(INITIAL_ITEMS);
    setNpcs(INITIAL_NPCS);
    setQuests(INITIAL_QUESTS);
    setNodes(INITIAL_SECTOR_NODES);
    setCombat(null);
    setActiveAlert(null);
    setActiveTab('station');
    setGameState('playing');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#030611] font-['Chakra_Petch',sans-serif]">
      {/* 1. Underlying 60 FPS Procedural Canvas Viewport */}
      <canvas
        ref={bgCanvasRef}
        data-testid="game-canvas"
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* CRT Scanline Filter Overlay (Toggleable in Settings) */}
      {scanlinesEnabled && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-40 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px]"
        />
      )}

      {/* 2. Main Title Screen Shell */}
      {gameState === 'title' && (
        <TitleScreen
          onStartGame={() => {
            soundEngine.startAmbient();
            setGameState('playing');
          }}
          onOpenLore={() => setIsLoreOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {/* 3. In-Game State & HUD */}
      {gameState === 'playing' && (
        <>
          <HUD
            stats={stats}
            netEnergy={energyBalance.net}
            netOxygen={oxygenBalance.net}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onAdvanceCycle={handleAdvanceCycle}
            onTogglePause={() => setGameState('paused')}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenLore={() => setIsLoreOpen(true)}
            isMuted={isMuted}
            onToggleMute={() => {
              const nextMute = soundEngine.toggleMute();
              setIsMuted(nextMute);
            }}
            inCombat={combat !== null}
            activeAlert={activeAlert}
          />

          {/* Tab Views */}
          <main className="relative w-full h-full z-10">
            {activeTab === 'station' && (
              <StationView
                slots={slots}
                stats={stats}
                onLaunchDrone={handleLaunchDrone}
                onBoostShields={handleBoostShields}
                onScanAnomaly={handleScanAnomaly}
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryView
                items={items}
                slots={slots}
                stats={stats}
                onEquipItem={handleEquipItem}
                onUnequipSlot={handleUnequipSlot}
                onCraftItem={handleCraftItem}
              />
            )}

            {activeTab === 'map' && (
              <SectorMapView
                nodes={nodes}
                stats={stats}
                onScanNode={handleScanNode}
                onExploreNode={handleExploreNode}
              />
            )}

            {activeTab === 'crew' && (
              <NPCLogView
                npcs={npcs}
                quests={quests}
                stats={stats}
                onAcceptQuest={handleAcceptQuest}
                onClaimQuestReward={handleClaimQuestReward}
                onDialogueAction={handleDialogueAction}
              />
            )}

            {activeTab === 'combat' && combat && (
              <CombatView
                combat={combat}
                onCombatAction={handleCombatAction}
                onFlee={handleFleeCombat}
                combatLogs={combatLogs}
              />
            )}
          </main>
        </>
      )}

      {/* 4. Modals */}
      {gameState === 'paused' && (
        <PauseModal
          onResume={() => setGameState('playing')}
          onRestart={handleRestartGame}
          onExitToTitle={() => setGameState('title')}
        />
      )}

      {gameState === 'gameover' && (
        <GameOverModal
          stats={stats}
          reason={gameOverReason}
          onRetry={handleRestartGame}
        />
      )}

      {gameState === 'victory' && (
        <VictoryModal
          stats={stats}
          onContinue={() => setGameState('playing')}
          onExit={() => setGameState('title')}
        />
      )}

      {isLoreOpen && <LoreModal onClose={() => setIsLoreOpen(false)} />}

      {isSettingsOpen && (
        <SettingsModal
          onClose={() => setIsSettingsOpen(false)}
          isMuted={isMuted}
          onToggleMute={() => {
            const nextMute = soundEngine.toggleMute();
            setIsMuted(nextMute);
          }}
          scanlinesEnabled={scanlinesEnabled}
          onToggleScanlines={() => setScanlinesEnabled(!scanlinesEnabled)}
        />
      )}
    </div>
  );
}
