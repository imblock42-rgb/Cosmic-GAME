/**
 * Void Station: Beyond the Event Horizon
 * Core Game Rules & Pure Calculations (Decoupled for deterministic unit testing)
 */

export interface Resources {
  titanium: number;
  energy: number;
  maxEnergy: number;
  voidCrystals: number;
  oxygen: number;
  maxOxygen: number;
  hull: number;
  maxHull: number;
}

export interface ModuleItem {
  id: string;
  name: string;
  type: 'core' | 'shield' | 'life_support' | 'weapon' | 'hangar' | 'scanner';
  tier: number;
  powerDraw: number;     // negative means generates power, positive means consumes
  oxygenGen: number;    // positive generates oxygen, negative drains
  hullBonus: number;
  shieldBonus: number;
  defense: number;
  attackPower: number;
  description: string;
}

export interface CraftingRecipe {
  id: string;
  resultItemId: string;
  name: string;
  description: string;
  cost: {
    titanium: number;
    voidCrystals: number;
    energy: number;
  };
}

/**
 * Calculates net energy production and consumption
 */
export function calculateEnergyBalance(modules: ModuleItem[], baseGen = 25): { generated: number; consumed: number; net: number } {
  let generated = baseGen;
  let consumed = 0;

  for (const m of modules) {
    if (m.powerDraw < 0) {
      generated += Math.abs(m.powerDraw);
    } else {
      consumed += m.powerDraw;
    }
  }

  return {
    generated,
    consumed,
    net: generated - consumed,
  };
}

/**
 * Calculates oxygen generation and crew drain
 */
export function calculateOxygenBalance(modules: ModuleItem[], crewCount = 4): { generated: number; consumed: number; net: number } {
  let generated = 0;
  const consumed = crewCount * 1.5;

  for (const m of modules) {
    if (m.oxygenGen > 0) {
      generated += m.oxygenGen;
    }
  }

  return {
    generated,
    consumed,
    net: generated - consumed,
  };
}

/**
 * Advances station simulation by one tick / cycle
 */
export function advanceSimulationStep(
  resources: Resources,
  modules: ModuleItem[],
  crewCount: number,
  threatLevel: number
): { nextResources: Resources; alert: string | null } {
  const energyBal = calculateEnergyBalance(modules);
  const oxygenBal = calculateOxygenBalance(modules, crewCount);

  let nextEnergy = resources.energy + energyBal.net;
  nextEnergy = Math.max(0, Math.min(resources.maxEnergy, nextEnergy));

  // If energy reaches 0, oxygen production drops by 75%
  const effectiveO2Net = nextEnergy <= 0 ? (oxygenBal.generated * 0.25 - oxygenBal.consumed) : oxygenBal.net;
  let nextOxygen = resources.oxygen + effectiveO2Net;
  nextOxygen = Math.max(0, Math.min(resources.maxOxygen, nextOxygen));

  let nextHull = resources.hull;
  let alert: string | null = null;

  // Suffocation hull/crew damage if oxygen reaches 0
  if (nextOxygen <= 0) {
    nextHull = Math.max(0, nextHull - 5);
    alert = 'КРИТИЧЕСКАЯ ТРЕВОГА: Запасы кислорода истощены! Повреждение жилого отсека.';
  } else if (threatLevel >= 80) {
    // Void radiation damage if threat is extreme
    const voidDamage = Math.floor((threatLevel - 70) * 0.2);
    nextHull = Math.max(0, nextHull - voidDamage);
    if (voidDamage > 0) {
      alert = 'ВНИМАНИЕ: Аномальная гравитационная волна воздействует на обшивку!';
    }
  }

  return {
    nextResources: {
      ...resources,
      energy: nextEnergy,
      oxygen: nextOxygen,
      hull: nextHull,
    },
    alert,
  };
}

/**
 * Checks if the player has enough resources to craft an item
 */
export function canAffordCraft(resources: Resources, recipe: CraftingRecipe): boolean {
  return (
    resources.titanium >= recipe.cost.titanium &&
    resources.voidCrystals >= recipe.cost.voidCrystals &&
    resources.energy >= recipe.cost.energy
  );
}

/**
 * Deducts craft cost from resources
 */
export function deductCraftCost(resources: Resources, recipe: CraftingRecipe): Resources {
  if (!canAffordCraft(resources, recipe)) {
    throw new Error('Недостаточно ресурсов для сборки модуля');
  }

  return {
    ...resources,
    titanium: resources.titanium - recipe.cost.titanium,
    voidCrystals: resources.voidCrystals - recipe.cost.voidCrystals,
    energy: resources.energy - recipe.cost.energy,
  };
}

/**
 * Calculates tactical combat turn resolution
 */
export interface CombatState {
  playerHull: number;
  playerMaxHull: number;
  playerShield: number;
  playerMaxShield: number;
  playerEnergy: number;
  enemyName: string;
  enemyHull: number;
  enemyMaxHull: number;
  enemyShield: number;
  enemyMaxShield: number;
  enemyAttackTelegraph: string;
  enemyIntentPower: number;
  turn: number;
}

export function resolveCombatTurn(
  state: CombatState,
  action: 'fire_plasma' | 'boost_shields' | 'emp_disrupt' | 'hyper_dodge',
  weaponPower: number
): { nextState: CombatState; log: string; playerWon: boolean; playerLost: boolean } {
  let {
    playerHull,
    playerMaxHull,
    playerShield,
    playerMaxShield,
    playerEnergy,
    enemyName,
    enemyHull,
    enemyMaxHull,
    enemyShield,
    enemyMaxShield,
    enemyIntentPower,
    turn,
  } = state;

  const logs: string[] = [];

  // Player phase
  if (action === 'fire_plasma') {
    const cost = 12;
    if (playerEnergy >= cost) {
      playerEnergy -= cost;
      const dmg = Math.round(weaponPower * 1.2);
      if (enemyShield > 0) {
        const shieldDmg = Math.min(enemyShield, dmg);
        enemyShield -= shieldDmg;
        const remainder = dmg - shieldDmg;
        enemyHull = Math.max(0, enemyHull - remainder);
        logs.push(`Плазменный залп пробил ${shieldDmg} щита и нанес ${remainder} урона обшивке ${enemyName}!`);
      } else {
        enemyHull = Math.max(0, enemyHull - dmg);
        logs.push(`Прямое попадание плазмы! Нанесено ${dmg} критического урона корпусу ${enemyName}.`);
      }
    } else {
      logs.push('Недостаточно энергии на орудийный залп! Снаряды не выпущены.');
    }
  } else if (action === 'boost_shields') {
    const cost = 10;
    if (playerEnergy >= cost) {
      playerEnergy -= cost;
      const recharge = 25;
      playerShield = Math.min(playerMaxShield, playerShield + recharge);
      logs.push(`Энергия перенаправлена в защитный контур! +${recharge} щита.`);
    }
  } else if (action === 'emp_disrupt') {
    const cost = 15;
    if (playerEnergy >= cost) {
      playerEnergy -= cost;
      enemyIntentPower = Math.max(0, Math.round(enemyIntentPower * 0.4));
      if (enemyShield > 0) {
        enemyShield = Math.max(0, enemyShield - 15);
      }
      logs.push(`ЭМИ-импульс сорвал наведение орудий противника! Урон атаки снижен.`);
    }
  } else if (action === 'hyper_dodge') {
    const cost = 8;
    if (playerEnergy >= cost) {
      playerEnergy -= cost;
      enemyIntentPower = Math.round(enemyIntentPower * 0.2);
      logs.push(`Станция активировала маневровые импульсы уклонения!`);
    }
  }

  // Check enemy defeat before enemy turn
  if (enemyHull <= 0) {
    logs.push(`Вражеский корабль ${enemyName} уничтожен! Угроза ликвидирована.`);
    return {
      nextState: {
        playerHull,
        playerMaxHull,
        playerShield,
        playerMaxShield,
        playerEnergy: Math.min(100, playerEnergy + 10),
        enemyName,
        enemyHull: 0,
        enemyMaxHull,
        enemyShield,
        enemyMaxShield,
        enemyAttackTelegraph: 'Уничтожен',
        enemyIntentPower: 0,
        turn: turn + 1,
      },
      log: logs.join(' '),
      playerWon: true,
      playerLost: false,
    };
  }

  // Enemy phase
  const incomingDmg = enemyIntentPower;
  if (incomingDmg > 0) {
    if (playerShield > 0) {
      const absorbed = Math.min(playerShield, incomingDmg);
      playerShield -= absorbed;
      const leak = incomingDmg - absorbed;
      playerHull = Math.max(0, playerHull - leak);
      logs.push(`Атака ${enemyName}: поглощено щитом ${absorbed}, урон корпусу ${leak}.`);
    } else {
      playerHull = Math.max(0, playerHull - incomingDmg);
      logs.push(`Атака ${enemyName} сотрясла станцию: корпус получил ${incomingDmg} урона!`);
    }
  }

  // Natural energy recharge per turn
  playerEnergy = Math.min(100, playerEnergy + 15);

  // Next enemy telegraph
  const telegraphs = [
    { text: 'Фокусировка квантового излучателя', pwr: 22 },
    { text: 'Запуск тяжелых торпед Бездны', pwr: 30 },
    { text: 'Рассеянный лазерный огонь', pwr: 14 },
    { text: 'Перегрузка антиматерии', pwr: 26 },
  ];
  const nextTelegraph = telegraphs[(turn + 1) % telegraphs.length];

  const playerLost = playerHull <= 0;
  if (playerLost) {
    logs.push(`Критический сбой корпуса станции! Оборона прорвана.`);
  }

  return {
    nextState: {
      playerHull,
      playerMaxHull,
      playerShield,
      playerMaxShield,
      playerEnergy,
      enemyName,
      enemyHull,
      enemyMaxHull,
      enemyShield,
      enemyMaxShield,
      enemyAttackTelegraph: nextTelegraph.text,
      enemyIntentPower: nextTelegraph.pwr,
      turn: turn + 1,
    },
    log: logs.join(' '),
    playerWon: false,
    playerLost,
  };
}
