/**
 * Void Station: Beyond the Event Horizon
 * Tactical Space Battle & Combat Encounter View
 */

import React, { useRef, useEffect, useState } from 'react';
import { CombatState } from '../game/rules.ts';
import { drawPixelShip } from '../game/proceduralGraphics.ts';
import { soundEngine } from '../game/audio.ts';

interface CombatViewProps {
  combat: CombatState;
  onCombatAction: (action: 'fire_plasma' | 'boost_shields' | 'emp_disrupt' | 'hyper_dodge') => void;
  onFlee: () => void;
  combatLogs: string[];
}

export const CombatView: React.FC<CombatViewProps> = ({
  combat,
  onCombatAction,
  onFlee,
  combatLogs,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fxState, setFxState] = useState<'idle' | 'player_shoot' | 'enemy_shoot' | 'hit'>('idle');

  // Combat Canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.05;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Deep space grid with dark nebula
      ctx.fillStyle = '#03050e';
      ctx.fillRect(0, 0, w, h);

      // Distant stars
      for (let i = 0; i < 30; i++) {
        const sx = ((i * 123) % w);
        const sy = ((i * 87) % h);
        ctx.fillStyle = i % 2 === 0 ? '#00d5ff' : '#ffffff';
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      // Draw Player Interceptor (Left side)
      const playerX = w * 0.25;
      const playerY = h * 0.55 + Math.sin(t * 1.5) * 5;
      drawPixelShip(ctx, 'player_shuttle', playerX, playerY, 1.4, t);

      // Draw Enemy Vessel (Right side)
      const enemyX = w * 0.75;
      const enemyY = h * 0.45 + Math.cos(t * 1.2) * 6;
      const enemyType = combat.enemyName.includes('аномали') ? 'void_leviathan' : 'pirate_corvette';
      drawPixelShip(ctx, enemyType, enemyX, enemyY, 1.4, t);

      // Laser beams FX when active
      if (fxState === 'player_shoot') {
        ctx.strokeStyle = '#00d5ff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(playerX + 20, playerY);
        ctx.lineTo(enemyX - 20, enemyY);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(enemyX - 25, enemyY - 5, 10, 10);
      } else if (fxState === 'enemy_shoot') {
        ctx.strokeStyle = '#ff3333';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(enemyX - 20, enemyY);
        ctx.lineTo(playerX + 20, playerY);
        ctx.stroke();

        ctx.fillStyle = '#ffd780';
        ctx.fillRect(playerX + 15, playerY - 5, 10, 10);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [fxState, combat.enemyName]);

  const handleAction = (action: 'fire_plasma' | 'boost_shields' | 'emp_disrupt' | 'hyper_dodge') => {
    if (action === 'fire_plasma') {
      soundEngine.playLaser();
      setFxState('player_shoot');
      setTimeout(() => {
        soundEngine.playExplosion();
        setFxState('enemy_shoot');
        setTimeout(() => setFxState('idle'), 300);
      }, 250);
    } else if (action === 'boost_shields') {
      soundEngine.playShieldHit();
    } else if (action === 'emp_disrupt') {
      soundEngine.playAlarm();
    } else if (action === 'hyper_dodge') {
      soundEngine.playWarp();
    }

    onCombatAction(action);
  };

  const playerHullPct = Math.max(0, (combat.playerHull / combat.playerMaxHull) * 100);
  const playerShieldPct = Math.max(0, (combat.playerShield / combat.playerMaxShield) * 100);
  const enemyHullPct = Math.max(0, (combat.enemyHull / combat.enemyMaxHull) * 100);
  const enemyShieldPct = Math.max(0, (combat.enemyShield / combat.enemyMaxShield) * 100);

  return (
    <div className="w-full h-full flex flex-col gap-3 p-3 sm:p-4 pt-28 sm:pt-20 pb-20 sm:pb-16 text-[#dbe7ff] select-none overflow-y-auto">
      {/* Combat Header with Enemy Telegraph */}
      <div className="w-full flex items-center justify-between p-3 bg-[#1a0808]/90 border-2 border-[#ff3333] shadow-[0_0_20px_rgba(255,51,51,0.35)]">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-[#ff3333] animate-ping" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-['Chakra_Petch']">
            ТАКТИЧЕСКИЙ БОЙ: {combat.enemyName.toUpperCase()}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#ffaa00] font-bold">
            НАМЕРЕНИЕ ВРАГА: {combat.enemyAttackTelegraph} ({combat.enemyIntentPower} УРОНА)
          </span>
          <span className="text-xs text-[#dbe7ff] font-mono">РАУНД #{combat.turn}</span>
        </div>
      </div>

      {/* Main Visual Arena & Ship Statuses */}
      <div className="relative w-full h-64 sm:h-72 md:h-80 bg-[#02040c] border border-[#2d3a54] overflow-hidden flex items-center justify-center">
        <canvas ref={canvasRef} width={680} height={320} className="w-full h-full object-contain" />

        {/* Player Status Cluster (Left) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 bg-[#060c1d]/85 border border-[#00839e] p-2 w-44 sm:w-56">
          <span className="text-[10px] text-[#00d5ff] font-bold uppercase">КОРАБЛЬ КОМАНДИРА</span>
          {/* Hull */}
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-[#94a3b8]">КОРПУС:</span>
            <span className="font-bold text-[#e2e8f0] tabular-nums">
              {combat.playerHull} / {combat.playerMaxHull}
            </span>
          </div>
          <div className="w-full h-2 bg-[#1a2233] border border-[#2d3a54]">
            <div className="h-full bg-[#00d5ff] transition-all" style={{ width: `${playerHullPct}%` }} />
          </div>

          {/* Shield */}
          <div className="flex items-center justify-between text-[10px] mt-1">
            <span className="text-[#94a3b8]">ЩИТ:</span>
            <span className="font-bold text-[#80ebff] tabular-nums">
              {combat.playerShield} / {combat.playerMaxShield}
            </span>
          </div>
          <div className="w-full h-2 bg-[#1a2233] border border-[#2d3a54]">
            <div className="h-full bg-[#80ebff] transition-all" style={{ width: `${playerShieldPct}%` }} />
          </div>

          <div className="flex items-center justify-between text-[10px] mt-1 text-[#ffaa00]">
            <span>ЭНЕРГИЯ СИСТЕМ:</span>
            <span className="font-bold tabular-nums">{combat.playerEnergy} ед.</span>
          </div>
        </div>

        {/* Enemy Status Cluster (Right) */}
        <div className="absolute top-3 right-3 flex flex-col gap-1 bg-[#060c1d]/85 border border-[#ff3333] p-2 w-44 sm:w-56 text-right">
          <span className="text-[10px] text-[#ff3333] font-bold uppercase">{combat.enemyName}</span>
          {/* Enemy Hull */}
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-bold text-[#e2e8f0] tabular-nums">
              {combat.enemyHull} / {combat.enemyMaxHull}
            </span>
            <span className="text-[#94a3b8]">КОРПУС:</span>
          </div>
          <div className="w-full h-2 bg-[#1a2233] border border-[#2d3a54]">
            <div className="h-full bg-[#ff3333] transition-all" style={{ width: `${enemyHullPct}%` }} />
          </div>

          {/* Enemy Shield */}
          <div className="flex items-center justify-between text-[10px] mt-1">
            <span className="font-bold text-[#e49eff] tabular-nums">
              {combat.enemyShield} / {combat.enemyMaxShield}
            </span>
            <span className="text-[#94a3b8]">ЩИТ:</span>
          </div>
          <div className="w-full h-2 bg-[#1a2233] border border-[#2d3a54]">
            <div className="h-full bg-[#b83bfa] transition-all" style={{ width: `${enemyShieldPct}%` }} />
          </div>
        </div>
      </div>

      {/* Action Command Center & Combat Logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
        {/* Commands Grid */}
        <div className="flex flex-col gap-2 p-3 bg-[#060c1d]/90 border border-[#00839e]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#00d5ff]">
            Тактические приказы орудийной палубы:
          </span>

          <div className="grid grid-cols-2 gap-2 flex-1">
            <button
              onClick={() => handleAction('fire_plasma')}
              disabled={combat.playerEnergy < 12}
              className={`p-2.5 flex flex-col items-center justify-center gap-1 border font-bold text-xs uppercase cursor-pointer transition-all ${
                combat.playerEnergy >= 12
                  ? 'bg-[#152342] hover:bg-[#00839e] hover:text-[#03050a] text-[#00d5ff] border-[#00d5ff] active:scale-95'
                  : 'bg-[#0f172a] text-[#64748b] border-[#1e293b] cursor-not-allowed'
              }`}
            >
              <span>💥 Плазменный залп</span>
              <span className="text-[9px] opacity-75 font-normal">Расход: 12 эн. (Урон ~30)</span>
            </button>

            <button
              onClick={() => handleAction('boost_shields')}
              disabled={combat.playerEnergy < 10}
              className={`p-2.5 flex flex-col items-center justify-center gap-1 border font-bold text-xs uppercase cursor-pointer transition-all ${
                combat.playerEnergy >= 10
                  ? 'bg-[#152342] hover:bg-[#00839e] hover:text-[#03050a] text-[#80ebff] border-[#80ebff] active:scale-95'
                  : 'bg-[#0f172a] text-[#64748b] border-[#1e293b] cursor-not-allowed'
              }`}
            >
              <span>🛡 Перезарядка щита</span>
              <span className="text-[9px] opacity-75 font-normal">Расход: 10 эн. (+25 щита)</span>
            </button>

            <button
              onClick={() => handleAction('emp_disrupt')}
              disabled={combat.playerEnergy < 15}
              className={`p-2.5 flex flex-col items-center justify-center gap-1 border font-bold text-xs uppercase cursor-pointer transition-all ${
                combat.playerEnergy >= 15
                  ? 'bg-[#152342] hover:bg-[#00839e] hover:text-[#03050a] text-[#ffaa00] border-[#ffaa00] active:scale-95'
                  : 'bg-[#0f172a] text-[#64748b] border-[#1e293b] cursor-not-allowed'
              }`}
            >
              <span>⚡ ЭМИ-срыв наведения</span>
              <span className="text-[9px] opacity-75 font-normal">Расход: 15 эн. (-60% урона врага)</span>
            </button>

            <button
              onClick={() => handleAction('hyper_dodge')}
              disabled={combat.playerEnergy < 8}
              className={`p-2.5 flex flex-col items-center justify-center gap-1 border font-bold text-xs uppercase cursor-pointer transition-all ${
                combat.playerEnergy >= 8
                  ? 'bg-[#152342] hover:bg-[#00839e] hover:text-[#03050a] text-[#34d399] border-[#34d399] active:scale-95'
                  : 'bg-[#0f172a] text-[#64748b] border-[#1e293b] cursor-not-allowed'
              }`}
            >
              <span>🔄 Маневровое уклонение</span>
              <span className="text-[9px] opacity-75 font-normal">Расход: 8 эн. (-80% входящего урона)</span>
            </button>
          </div>

          <button
            onClick={() => {
              soundEngine.playWarp();
              onFlee();
            }}
            className="w-full py-2 bg-[#1e293b] hover:bg-[#991b1b] text-white font-bold text-xs uppercase transition-all cursor-pointer border border-[#ff3333]"
          >
            🚀 Экстренный отход к станции
          </button>
        </div>

        {/* Combat Chronology Logs */}
        <div className="flex flex-col p-3 bg-[#030610] border border-[#1a233a] overflow-hidden">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#ffaa00] pb-1 border-b border-[#1e293b]">
            Хроника боя:
          </span>
          <div className="flex flex-col-reverse gap-1.5 my-1 overflow-y-auto max-h-[140px] text-xs font-mono">
            {combatLogs.map((log, idx) => (
              <span key={idx} className="text-[#94a3b8] leading-tight">
                › {log}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
