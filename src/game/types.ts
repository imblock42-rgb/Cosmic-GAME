/**
 * Void Station: Beyond the Event Horizon
 * Game Data Types & Enums
 */

export type ItemRarity = 'common' | 'rare' | 'epic' | 'relic';
export type ItemCategory = 'module' | 'raw' | 'artifact' | 'gear';

export type IconType =
  | 'titanium_ore'
  | 'hyper_alloy'
  | 'void_crystal'
  | 'energy_cell'
  | 'bio_gel'
  | 'solar_module'
  | 'shield_module'
  | 'plasma_cannon'
  | 'hydroponic_bay'
  | 'drone_hangar'
  | 'scanner_dish'
  | 'void_relic';

export interface InventoryItem {
  id: string;
  name: string;
  category: ItemCategory;
  rarity: ItemRarity;
  iconType: IconType;
  description: string;
  stats?: {
    powerDraw?: number;    // negative = generates, positive = consumes
    oxygenGen?: number;
    hullBonus?: number;
    shieldBonus?: number;
    attackPower?: number;
    defense?: number;
  };
  quantity: number;
  marketValue: number;
}

export type ModuleSlotType = 'core' | 'shield' | 'life_support' | 'weapon' | 'hangar' | 'scanner';

export interface StationSlot {
  id: string;
  name: string;
  slotType: ModuleSlotType;
  installedItem: InventoryItem | null;
  isActive: boolean;
}

export interface Quest {
  id: string;
  npcId: 'vex' | 'elira' | 'kallo';
  title: string;
  description: string;
  objectiveText: string;
  targetType: 'collect_item' | 'install_module' | 'explore_node' | 'defeat_enemy';
  targetKey: string;
  targetCount: number;
  currentCount: number;
  reward: {
    titanium: number;
    voidCrystals: number;
    energy: number;
    item?: InventoryItem;
  };
  completed: boolean;
  claimed: boolean;
}

export interface DialogueChoice {
  text: string;
  replyText: string;
  action?: 'accept_quest' | 'trade' | 'heal_hull' | 'threat_reduce';
  questId?: string;
  cost?: { titanium?: number; voidCrystals?: number };
  reward?: { titanium?: number; voidCrystals?: number };
}

export interface DialogueNode {
  id: string;
  npcText: string;
  choices: DialogueChoice[];
}

export interface NPCProfile {
  id: 'vex' | 'elira' | 'kallo';
  name: string;
  role: string;
  title: string;
  description: string;
  reputation: number; // 0 - 100
  accentColor: string;
  dialogueTree: Record<string, DialogueNode>;
  activeDialogueId: string;
}

export type SectorNodeType =
  | 'derelict'
  | 'asteroid_field'
  | 'void_anomaly'
  | 'pirate_corvette'
  | 'alien_beacon'
  | 'research_probe';

export interface SectorNode {
  id: string;
  name: string;
  type: SectorNodeType;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  threat: number; // 0-100
  scanned: boolean;
  explored: boolean;
  resourceYield: {
    titanium: number;
    voidCrystals: number;
  };
  description: string;
  encounterType?: 'combat' | 'scavenge' | 'mystery';
}

export interface StationStats {
  titanium: number;
  energy: number;
  maxEnergy: number;
  voidCrystals: number;
  oxygen: number;
  maxOxygen: number;
  hull: number;
  maxHull: number;
  threatLevel: number;
  cycle: number;
  crewCount: number;
}
