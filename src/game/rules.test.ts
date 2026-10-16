import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateEnergyBalance,
  calculateOxygenBalance,
  advanceSimulationStep,
  canAffordCraft,
  deductCraftCost,
  resolveCombatTurn,
  type ModuleItem,
  type Resources,
  type CraftingRecipe,
  type CombatState,
} from './rules.ts';

test('calculateEnergyBalance calculates net production and consumption correctly', () => {
  const modules: ModuleItem[] = [
    {
      id: 'solar_1',
      name: 'Солнечная панель',
      type: 'core',
      tier: 1,
      powerDraw: -20, // generates 20
      oxygenGen: 0,
      hullBonus: 10,
      shieldBonus: 0,
      defense: 2,
      attackPower: 0,
      description: 'Generates power',
    },
    {
      id: 'shield_1',
      name: 'Щит Бездны',
      type: 'shield',
      tier: 1,
      powerDraw: 15, // consumes 15
      oxygenGen: 0,
      hullBonus: 0,
      shieldBonus: 30,
      defense: 10,
      attackPower: 0,
      description: 'Shield generator',
    },
  ];

  const balance = calculateEnergyBalance(modules, 10);
  assert.equal(balance.generated, 30); // 10 base + 20 from solar
  assert.equal(balance.consumed, 15);
  assert.equal(balance.net, 15);
});

test('calculateOxygenBalance calculates generation and crew drain', () => {
  const modules: ModuleItem[] = [
    {
      id: 'hydro_1',
      name: 'Гидропонный отсек',
      type: 'life_support',
      tier: 1,
      powerDraw: 5,
      oxygenGen: 8,
      hullBonus: 5,
      shieldBonus: 0,
      defense: 0,
      attackPower: 0,
      description: 'Generates O2',
    },
  ];

  const balance = calculateOxygenBalance(modules, 4); // 4 * 1.5 = 6 consumed
  assert.equal(balance.generated, 8);
  assert.equal(balance.consumed, 6);
  assert.equal(balance.net, 2);
});

test('advanceSimulationStep handles suffocation damage when oxygen drops to zero', () => {
  const res: Resources = {
    titanium: 50,
    energy: 50,
    maxEnergy: 100,
    voidCrystals: 10,
    oxygen: 0,
    maxOxygen: 100,
    hull: 100,
    maxHull: 100,
  };

  const modules: ModuleItem[] = []; // 0 oxygen generated, drain is active
  const result = advanceSimulationStep(res, modules, 4, 10);
  assert.equal(result.nextResources.hull, 95); // 100 - 5
  assert.ok(result.alert?.includes('кислород'));
});

test('canAffordCraft and deductCraftCost work properly', () => {
  const res: Resources = {
    titanium: 40,
    energy: 50,
    maxEnergy: 100,
    voidCrystals: 5,
    oxygen: 100,
    maxOxygen: 100,
    hull: 100,
    maxHull: 100,
  };

  const recipe: CraftingRecipe = {
    id: 'craft_laser',
    resultItemId: 'laser_mk2',
    name: 'Плазменное орудие Mk II',
    description: 'Улучшенная турель',
    cost: {
      titanium: 30,
      voidCrystals: 3,
      energy: 20,
    },
  };

  assert.equal(canAffordCraft(res, recipe), true);
  const nextRes = deductCraftCost(res, recipe);
  assert.equal(nextRes.titanium, 10);
  assert.equal(nextRes.voidCrystals, 2);
  assert.equal(nextRes.energy, 30);
});

test('resolveCombatTurn handles player plasma fire and enemy damage absorption', () => {
  const initialCombat: CombatState = {
    playerHull: 100,
    playerMaxHull: 100,
    playerShield: 50,
    playerMaxShield: 50,
    playerEnergy: 40,
    enemyName: 'Пиратский рейдер',
    enemyHull: 50,
    enemyMaxHull: 50,
    enemyShield: 10,
    enemyMaxShield: 20,
    enemyAttackTelegraph: 'Запуск ракет',
    enemyIntentPower: 15,
    turn: 1,
  };

  const { nextState, playerWon, playerLost } = resolveCombatTurn(initialCombat, 'fire_plasma', 25);
  // Plasma does 30 damage: 10 to enemy shield, 20 to enemy hull => enemy hull becomes 30
  assert.equal(nextState.enemyShield, 0);
  assert.equal(nextState.enemyHull, 30);
  // Enemy attacks with 15 power: absorbed by player's 50 shield => player shield becomes 35, hull unchanged 100
  assert.equal(nextState.playerShield, 35);
  assert.equal(nextState.playerHull, 100);
  assert.equal(playerWon, false);
  assert.equal(playerLost, false);
});
