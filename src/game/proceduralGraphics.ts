/**
 * Void Station: Beyond the Event Horizon
 * High-Detail Procedural Pixel-Art Rendering Engine
 *
 * ABSOLUTELY ZERO EMOJIS, TEXT CHARACTERS, OR PRIMITIVE SHAPES.
 * Pure procedural Canvas raster routines with custom retro-futuristic palettes,
 * dithering, specular highlights, panel seams, and multi-layer shading.
 */

import { IconType, ItemRarity } from './types.ts';

// Sci-Fi Palette Constants
export const PALETTE = {
  voidBlack: '#03050a',
  spaceDark: '#080d1a',
  spaceMid: '#121c33',
  spaceDeepBlue: '#1c2e54',
  
  hullDark: '#1a2233',
  hullMid: '#2d3a54',
  hullLight: '#475b82',
  hullHighlight: '#7590c2',
  hullWhite: '#dbe7ff',

  cyanDark: '#003a4d',
  cyanMid: '#00839e',
  cyanBright: '#00d5ff',
  cyanGlow: '#80ebff',
  cyanPure: '#ffffff',

  goldDark: '#4d2e00',
  goldMid: '#996000',
  goldBright: '#ffaa00',
  goldGlow: '#ffd780',

  purpleDark: '#2b0942',
  purpleMid: '#691e9e',
  purpleBright: '#b83bfa',
  purpleGlow: '#e49eff',

  redDark: '#4a0808',
  redMid: '#9e1919',
  redBright: '#ff3333',
  redGlow: '#ff9999',

  greenDark: '#0a3d1b',
  greenMid: '#1c823d',
  greenBright: '#2ee66b',
  greenGlow: '#9effbf',
};

// Rarity Palette Mapping
export const RARITY_COLORS: Record<ItemRarity, { main: string; glow: string; border: string }> = {
  common: { main: '#7590c2', glow: '#475b82', border: '#2d3a54' },
  rare: { main: '#00d5ff', glow: '#00839e', border: '#003a4d' },
  epic: { main: '#b83bfa', glow: '#691e9e', border: '#2b0942' },
  relic: { main: '#ffaa00', glow: '#996000', border: '#4d2e00' },
};

// Helper: Fill Pixel Rectangle
export function fillPix(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
}

// Helper: 2x2 Checkerboard Dithering for Smooth Shading
export function ditherRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  c1: string,
  c2: string,
  invert = false
) {
  const startX = Math.floor(x);
  const startY = Math.floor(y);
  const endX = startX + Math.floor(w);
  const endY = startY + Math.floor(h);

  for (let py = startY; py < endY; py += 2) {
    for (let px = startX; px < endX; px += 2) {
      const condition = ((px / 2 + py / 2) % 2 === 0) !== invert;
      ctx.fillStyle = condition ? c1 : c2;
      ctx.fillRect(px, py, 2, 2);
    }
  }
}

/**
 * Draws a high-detail procedural pixel item icon inside a square area
 */
export function drawPixelItemIcon(
  ctx: CanvasRenderingContext2D,
  iconType: IconType,
  rarity: ItemRarity,
  x: number,
  y: number,
  size = 48
) {
  ctx.save();
  ctx.imageSmoothingEnabled = false;

  const scale = size / 32;
  const p = (val: number) => Math.floor(val * scale);

  // Background slot frame
  fillPix(ctx, x, y, size, size, '#090e1c');
  fillPix(ctx, x + 2, y + 2, size - 4, size - 4, '#0e172e');

  // Sub-grid pattern
  for (let gy = 4; gy < size - 4; gy += 4) {
    fillPix(ctx, x + 2, y + gy, size - 4, 1, '#15213f');
  }
  for (let gx = 4; gx < size - 4; gx += 4) {
    fillPix(ctx, x + gx, y + 2, 1, size - 4, '#15213f');
  }

  // Draw Specific Item
  const cx = x + size / 2;
  const cy = y + size / 2;

  switch (iconType) {
    case 'titanium_ore': {
      // Faceted Raw Titanium Meteor Chunk
      // Dark rock silhouette
      fillPix(ctx, cx - p(10), cy - p(7), p(20), p(15), '#1a2233');
      fillPix(ctx, cx - p(8), cy - p(9), p(16), p(19), '#1a2233');

      // Shaded facets
      fillPix(ctx, cx - p(7), cy - p(6), p(14), p(12), '#2d3a54');
      fillPix(ctx, cx - p(5), cy - p(4), p(10), p(8), '#475b82');
      // Bright metallic mineral veins
      fillPix(ctx, cx - p(4), cy - p(5), p(8), p(3), '#7590c2');
      fillPix(ctx, cx - p(2), cy - p(3), p(5), p(2), '#dbe7ff');
      // Titanium blue-cyan luster crystal points
      fillPix(ctx, cx + p(2), cy + p(1), p(4), p(4), '#00d5ff');
      fillPix(ctx, cx + p(3), cy + p(2), p(2), p(2), '#ffffff');
      fillPix(ctx, cx - p(6), cy + p(1), p(3), p(3), '#00839e');
      break;
    }

    case 'hyper_alloy': {
      // High-Tech Stamped Titanium Ingot
      // Base ingot plate with bevel
      fillPix(ctx, cx - p(11), cy - p(6), p(22), p(12), '#1a2233');
      fillPix(ctx, cx - p(10), cy - p(5), p(20), p(10), '#475b82');
      // Upper highlight strip
      fillPix(ctx, cx - p(9), cy - p(4), p(18), p(3), '#7590c2');
      fillPix(ctx, cx - p(8), cy - p(3), p(16), p(1), '#dbe7ff');
      // Lower shaded chamfer
      fillPix(ctx, cx - p(9), cy + p(2), p(18), p(2), '#2d3a54');
      // Stamped serial grooves & cyber circuit pins
      fillPix(ctx, cx - p(6), cy - p(1), p(3), p(2), '#00d5ff');
      fillPix(ctx, cx - p(1), cy - p(1), p(3), p(2), '#00d5ff');
      fillPix(ctx, cx + p(4), cy - p(1), p(3), p(2), '#00d5ff');
      // Corner titanium security rivets
      fillPix(ctx, cx - p(8), cy - p(4), p(2), p(2), '#dbe7ff');
      fillPix(ctx, cx + p(6), cy - p(4), p(2), p(2), '#dbe7ff');
      fillPix(ctx, cx - p(8), cy + p(2), p(2), p(2), '#1a2233');
      fillPix(ctx, cx + p(6), cy + p(2), p(2), p(2), '#1a2233');
      break;
    }

    case 'void_crystal': {
      // Obsidian-Violet Void Resonance Shard
      // Silhouette
      fillPix(ctx, cx - p(8), cy - p(10), p(16), p(20), '#150424');
      // Main central spire
      fillPix(ctx, cx - p(3), cy - p(9), p(6), p(18), '#691e9e');
      fillPix(ctx, cx - p(1), cy - p(7), p(3), p(14), '#b83bfa');
      fillPix(ctx, cx, cy - p(5), p(1), p(10), '#f3c4ff');
      // Flanking crystal shards
      fillPix(ctx, cx - p(7), cy - p(4), p(4), p(11), '#47146b');
      fillPix(ctx, cx - p(6), cy - p(2), p(2), p(7), '#9e2bd4');
      fillPix(ctx, cx + p(3), cy - p(6), p(4), p(13), '#47146b');
      fillPix(ctx, cx + p(4), cy - p(4), p(2), p(9), '#9e2bd4');
      // Void spark particles
      fillPix(ctx, cx - p(8), cy - p(7), p(2), p(2), '#e49eff');
      fillPix(ctx, cx + p(7), cy + p(4), p(2), p(2), '#e49eff');
      break;
    }

    case 'energy_cell': {
      // Plasma containment cylinder
      // Metallic end caps
      fillPix(ctx, cx - p(6), cy - p(11), p(12), p(3), '#ffaa00');
      fillPix(ctx, cx - p(4), cy - p(12), p(8), p(1), '#ffd780');
      fillPix(ctx, cx - p(6), cy + p(8), p(12), p(3), '#996000');
      // Glass body
      fillPix(ctx, cx - p(5), cy - p(8), p(10), p(16), '#003a4d');
      // High-energy glowing cyan core
      fillPix(ctx, cx - p(3), cy - p(6), p(6), p(12), '#00d5ff');
      fillPix(ctx, cx - p(1), cy - p(5), p(2), p(10), '#ffffff');
      // Magnetic containment rings
      fillPix(ctx, cx - p(6), cy - p(3), p(12), p(2), '#2d3a54');
      fillPix(ctx, cx - p(6), cy + p(3), p(12), p(2), '#2d3a54');
      // Energy gauge ticks
      fillPix(ctx, cx + p(2), cy - p(7), p(1), p(1), '#80ebff');
      fillPix(ctx, cx + p(2), cy - p(1), p(1), p(1), '#80ebff');
      fillPix(ctx, cx + p(2), cy + p(5), p(1), p(1), '#80ebff');
      break;
    }

    case 'bio_gel': {
      // Oxygen Bio-Cultivation Canister
      fillPix(ctx, cx - p(7), cy - p(9), p(14), p(18), '#052e16');
      fillPix(ctx, cx - p(5), cy - p(7), p(10), p(14), '#166534');
      // Bioluminescent algae fluid
      fillPix(ctx, cx - p(4), cy - p(4), p(8), p(10), '#22c55e');
      fillPix(ctx, cx - p(3), cy - p(2), p(6), p(7), '#4ade80');
      // Micro-bubbles
      fillPix(ctx, cx - p(2), cy - p(3), p(2), p(2), '#bbf7d0');
      fillPix(ctx, cx + p(1), cy + p(1), p(2), p(2), '#ffffff');
      // Glass sheen highlight
      fillPix(ctx, cx - p(4), cy - p(6), p(2), p(12), '#bbf7d0');
      // Top pressure valve
      fillPix(ctx, cx - p(4), cy - p(11), p(8), p(2), '#718096');
      break;
    }

    case 'solar_module': {
      // Multi-segment Photovoltaic Wing
      // Center armature rod
      fillPix(ctx, cx - p(1), cy - p(11), p(2), p(22), '#7590c2');
      // Solar panel plates (left & right)
      fillPix(ctx, cx - p(10), cy - p(8), p(8), p(16), '#003a4d');
      fillPix(ctx, cx + p(2), cy - p(8), p(8), p(16), '#003a4d');
      // Blue silicon cells
      fillPix(ctx, cx - p(9), cy - p(7), p(6), p(14), '#00839e');
      fillPix(ctx, cx + p(3), cy - p(7), p(6), p(14), '#00839e');
      // Gold conductor busbars
      fillPix(ctx, cx - p(8), cy - p(3), p(5), p(1), '#ffaa00');
      fillPix(ctx, cx - p(8), cy + p(2), p(5), p(1), '#ffaa00');
      fillPix(ctx, cx + p(4), cy - p(3), p(5), p(1), '#ffaa00');
      fillPix(ctx, cx + p(4), cy + p(2), p(5), p(1), '#ffaa00');
      // Edge glints
      fillPix(ctx, cx - p(9), cy - p(7), p(6), p(1), '#00d5ff');
      fillPix(ctx, cx + p(3), cy - p(7), p(6), p(1), '#00d5ff');
      break;
    }

    case 'shield_module': {
      // Hexagonal Deflector Matrix
      // Outer hex frame
      fillPix(ctx, cx - p(8), cy - p(7), p(16), p(14), '#003a4d');
      fillPix(ctx, cx - p(6), cy - p(9), p(12), p(18), '#003a4d');
      // Inner hex field
      fillPix(ctx, cx - p(6), cy - p(5), p(12), p(10), '#00839e');
      fillPix(ctx, cx - p(4), cy - p(7), p(8), p(14), '#00839e');
      // Pulsing cyan plasma core
      fillPix(ctx, cx - p(3), cy - p(3), p(6), p(6), '#00d5ff');
      fillPix(ctx, cx - p(1), cy - p(1), p(2), p(2), '#ffffff');
      // Magnetic vector coils
      fillPix(ctx, cx - p(7), cy - p(1), p(3), p(2), '#b83bfa');
      fillPix(ctx, cx + p(4), cy - p(1), p(3), p(2), '#b83bfa');
      fillPix(ctx, cx - p(1), cy - p(7), p(2), p(3), '#b83bfa');
      fillPix(ctx, cx - p(1), cy + p(4), p(2), p(3), '#b83bfa');
      break;
    }

    case 'plasma_cannon': {
      // Dual-Barrel Railgun Turret
      // Turret base chassis
      fillPix(ctx, cx - p(8), cy + p(2), p(16), p(7), '#2d3a54');
      fillPix(ctx, cx - p(6), cy, p(12), p(3), '#475b82');
      // Twin accelerator barrels
      fillPix(ctx, cx - p(6), cy - p(11), p(4), p(11), '#1a2233');
      fillPix(ctx, cx + p(2), cy - p(11), p(4), p(11), '#1a2233');
      // Barrel rail highlight
      fillPix(ctx, cx - p(5), cy - p(10), p(2), p(10), '#7590c2');
      fillPix(ctx, cx + p(3), cy - p(10), p(2), p(10), '#7590c2');
      // Energy muzzle tips
      fillPix(ctx, cx - p(5), cy - p(11), p(2), p(2), '#ff3333');
      fillPix(ctx, cx + p(3), cy - p(11), p(2), p(2), '#ff3333');
      // Heat sink radiators
      fillPix(ctx, cx - p(8), cy + p(4), p(16), p(1), '#ffaa00');
      fillPix(ctx, cx - p(8), cy + p(6), p(16), p(1), '#ffaa00');
      break;
    }

    case 'hydroponic_bay': {
      // Station Greenhouse Biome Dome
      // Dome glass arc
      fillPix(ctx, cx - p(8), cy - p(6), p(16), p(14), '#003a4d');
      fillPix(ctx, cx - p(6), cy - p(9), p(12), p(16), '#00839e');
      // Interior plants
      fillPix(ctx, cx - p(5), cy - p(3), p(10), p(9), '#166534');
      fillPix(ctx, cx - p(4), cy - p(1), p(8), p(6), '#2ee66b');
      // Sunlight LED grow strip
      fillPix(ctx, cx - p(4), cy - p(8), p(8), p(2), '#fef08a');
      // Mechanical support base
      fillPix(ctx, cx - p(10), cy + p(6), p(20), p(4), '#2d3a54');
      fillPix(ctx, cx - p(9), cy + p(7), p(18), p(2), '#7590c2');
      break;
    }

    case 'drone_hangar': {
      // Drone Bay Door with Hazard Stripes
      // Bay frame
      fillPix(ctx, cx - p(10), cy - p(9), p(20), p(18), '#1a2233');
      fillPix(ctx, cx - p(8), cy - p(7), p(16), p(14), '#0e172e');
      // Hazard chevrons on threshold
      fillPix(ctx, cx - p(8), cy + p(5), p(4), p(2), '#ffaa00');
      fillPix(ctx, cx - p(2), cy + p(5), p(4), p(2), '#ffaa00');
      fillPix(ctx, cx + p(4), cy + p(5), p(4), p(2), '#ffaa00');
      // Miniature drone inside
      fillPix(ctx, cx - p(4), cy - p(3), p(8), p(5), '#475b82');
      fillPix(ctx, cx - p(2), cy - p(2), p(4), p(3), '#ffaa00');
      fillPix(ctx, cx - p(1), cy - p(1), p(2), p(1), '#00d5ff');
      // Gantry launch crane
      fillPix(ctx, cx - p(1), cy - p(7), p(2), p(4), '#ffaa00');
      break;
    }

    case 'scanner_dish': {
      // Quantum Array Antenna
      // Parabolic radar dish
      fillPix(ctx, cx - p(9), cy - p(7), p(18), p(8), '#2d3a54');
      fillPix(ctx, cx - p(7), cy - p(5), p(14), p(5), '#475b82');
      fillPix(ctx, cx - p(5), cy - p(3), p(10), p(3), '#00d5ff');
      // Central emitter horn
      fillPix(ctx, cx - p(1), cy - p(11), p(2), p(8), '#7590c2');
      fillPix(ctx, cx - p(2), cy - p(11), p(4), p(2), '#00d5ff');
      fillPix(ctx, cx - p(1), cy - p(11), p(2), p(1), '#ffffff');
      // Swivel pedestal mount
      fillPix(ctx, cx - p(3), cy + p(1), p(6), p(6), '#1a2233');
      fillPix(ctx, cx - p(6), cy + p(7), p(12), p(3), '#475b82');
      break;
    }

    case 'void_relic': {
      // Ancient Alien Octahedron Artifact
      fillPix(ctx, cx - p(8), cy - p(8), p(16), p(16), '#150424');
      // Carved alien runes with pulsating golden glow
      fillPix(ctx, cx - p(6), cy - p(2), p(12), p(4), '#ffaa00');
      fillPix(ctx, cx - p(2), cy - p(6), p(4), p(12), '#ffaa00');
      fillPix(ctx, cx - p(1), cy - p(1), p(2), p(2), '#ffd780');
      // Outer gravitational distortion aura
      fillPix(ctx, cx - p(9), cy - p(9), p(2), p(2), '#b83bfa');
      fillPix(ctx, cx + p(7), cy - p(9), p(2), p(2), '#b83bfa');
      fillPix(ctx, cx - p(9), cy + p(7), p(2), p(2), '#b83bfa');
      fillPix(ctx, cx + p(7), cy + p(7), p(2), p(2), '#b83bfa');
      break;
    }
  }

  // Rarity Border Accent
  const rc = RARITY_COLORS[rarity];
  ctx.strokeStyle = rc.main;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);

  // Corner neon notches
  fillPix(ctx, x, y, 3, 3, rc.main);
  fillPix(ctx, x + size - 3, y, 3, 3, rc.main);
  fillPix(ctx, x, y + size - 3, 3, 3, rc.main);
  fillPix(ctx, x + size - 3, y + size - 3, 3, 3, rc.main);

  ctx.restore();
}

/**
 * Animated High-Detail Procedural Pixel Portraits for the 3 NPCs
 */
export function drawNPCPortrait(
  ctx: CanvasRenderingContext2D,
  npcId: 'vex' | 'elira' | 'kallo',
  x: number,
  y: number,
  width: number,
  height: number,
  time: number
) {
  ctx.save();
  ctx.imageSmoothingEnabled = false;

  const scale = width / 64;
  const p = (v: number) => Math.floor(v * scale);
  const cx = x + width / 2;
  const cy = y + height / 2;

  // Background terminal portrait frame
  fillPix(ctx, x, y, width, height, '#060a14');
  // Cyber scanline grid in background
  for (let gy = 0; gy < height; gy += 4) {
    fillPix(ctx, x, y + gy, width, 1, '#0e172a');
  }

  const blink = Math.sin(time * 1.5) > 0.96;
  const breath = Math.sin(time * 2) * 1.5;

  if (npcId === 'vex') {
    // Senior Engineer Vex (Cyborg Mechanic)
    // Dark mechanic overall collar & shoulders
    fillPix(ctx, cx - p(20), cy + p(16) + breath, p(40), p(16), '#1a2233');
    fillPix(ctx, cx - p(18), cy + p(18) + breath, p(36), p(14), '#3b2f21'); // Industrial leather vest
    fillPix(ctx, cx - p(8), cy + p(14) + breath, p(16), p(6), '#d97706'); // High-vis collar

    // Exposed neck cybernetic cables
    fillPix(ctx, cx - p(7), cy + p(11), p(2), p(5), '#ffaa00');
    fillPix(ctx, cx + p(5), cy + p(11), p(2), p(5), '#00d5ff');
    fillPix(ctx, cx - p(2), cy + p(12), p(4), p(4), '#475b82');

    // Head base (weathered skin tone)
    fillPix(ctx, cx - p(12), cy - p(14), p(24), p(26), '#ab7a52');
    fillPix(ctx, cx - p(10), cy - p(16), p(20), p(28), '#ab7a52');
    // Chin & jaw
    fillPix(ctx, cx - p(7), cy + p(9), p(14), p(4), '#8f5c38');

    // Left face: Titanium cybernetic skull plate
    fillPix(ctx, cx - p(12), cy - p(16), p(12), p(22), '#475b82');
    fillPix(ctx, cx - p(10), cy - p(14), p(9), p(18), '#7590c2');
    // Seam rivets
    fillPix(ctx, cx - p(1), cy - p(14), p(2), p(2), '#dbe7ff');
    fillPix(ctx, cx - p(1), cy - p(6), p(2), p(2), '#dbe7ff');
    fillPix(ctx, cx - p(1), cy + p(2), p(2), p(2), '#dbe7ff');

    // Cybernetic Ocular Lens (left eye)
    fillPix(ctx, cx - p(9), cy - p(4), p(8), p(8), '#1a2233');
    fillPix(ctx, cx - p(8), cy - p(3), p(6), p(6), '#ff3333');
    // Sweeping laser focal beam in eye
    const sweep = Math.sin(time * 4) * 2;
    fillPix(ctx, cx - p(6) + sweep, cy - p(2), p(2), p(4), '#ffffff');

    // Human right eye
    if (!blink) {
      fillPix(ctx, cx + p(3), cy - p(3), p(6), p(4), '#26190f');
      fillPix(ctx, cx + p(4), cy - p(2), p(2), p(2), '#475b82'); // Blue-grey iris
      fillPix(ctx, cx + p(5), cy - p(3), p(1), p(1), '#ffffff'); // Glint
    } else {
      fillPix(ctx, cx + p(2), cy - p(2), p(8), p(2), '#6e4324'); // Closed eyelid
    }

    // Weathered facial features
    fillPix(ctx, cx, cy - p(1), p(2), p(6), '#6e4324'); // Nose ridge
    fillPix(ctx, cx - p(3), cy + p(6), p(8), p(2), '#543016'); // Determined mouth

    // Bandana / Forehead strap
    fillPix(ctx, cx - p(13), cy - p(16), p(26), p(5), '#994411');
    fillPix(ctx, cx - p(12), cy - p(15), p(24), p(2), '#d97706');

    // Diagnostic LEDs on temple
    const led1 = Math.floor(time * 3) % 2 === 0 ? '#22c55e' : '#14532d';
    const led2 = Math.floor(time * 2) % 2 === 0 ? '#00d5ff' : '#0e7490';
    fillPix(ctx, cx - p(11), cy - p(10), p(2), p(2), led1);
    fillPix(ctx, cx - p(11), cy - p(7), p(2), p(2), led2);
  } else if (npcId === 'elira') {
    // Navigator Elira (Alien Astrogator)
    // Exploration deep-space flight suit
    fillPix(ctx, cx - p(20), cy + p(16) + breath, p(40), p(16), '#0e172a');
    fillPix(ctx, cx - p(18), cy + p(18) + breath, p(36), p(14), '#1e293b');
    // Neon astral rank collar
    fillPix(ctx, cx - p(10), cy + p(14) + breath, p(20), p(3), '#00d5ff');

    // Slender neck
    fillPix(ctx, cx - p(5), cy + p(10), p(10), p(7), '#9370db');

    // Alien face: Smooth iridescent lavender-cyan skin
    fillPix(ctx, cx - p(11), cy - p(14), p(22), p(24), '#7b68ee');
    fillPix(ctx, cx - p(9), cy - p(16), p(18), p(27), '#9370db');
    fillPix(ctx, cx - p(5), cy + p(9), p(10), p(4), '#6a5acd'); // Pointed chin

    // Deep cosmic midnight hair
    fillPix(ctx, cx - p(14), cy - p(18), p(28), p(8), '#1e1b4b');
    fillPix(ctx, cx - p(14), cy - p(12), p(5), p(22), '#1e1b4b');
    fillPix(ctx, cx + p(9), cy - p(12), p(5), p(22), '#1e1b4b');
    // Stardust sparkles in hair
    if (Math.sin(time * 3) > 0) fillPix(ctx, cx - p(12), cy - p(5), p(2), p(2), '#80ebff');
    if (Math.cos(time * 2) > 0) fillPix(ctx, cx + p(11), cy - p(2), p(2), p(2), '#e49eff');

    // Bioluminescent constellation freckles on cheeks
    const glowConstellation = Math.sin(time * 3) * 0.5 + 0.5 > 0.4 ? '#80ebff' : '#4338ca';
    fillPix(ctx, cx - p(7), cy + p(2), p(2), p(2), glowConstellation);
    fillPix(ctx, cx - p(5), cy + p(4), p(1), p(1), glowConstellation);
    fillPix(ctx, cx + p(6), cy + p(2), p(2), p(2), glowConstellation);
    fillPix(ctx, cx + p(4), cy + p(4), p(1), p(1), glowConstellation);

    // Holographic Visor with Star Coordinates
    fillPix(ctx, cx - p(10), cy - p(5), p(20), p(7), 'rgba(0, 213, 255, 0.35)');
    fillPix(ctx, cx - p(11), cy - p(6), p(22), p(1), '#00d5ff');
    fillPix(ctx, cx - p(11), cy + p(2), p(22), p(1), '#00d5ff');
    // Star reticle moving across visor
    const starPos = Math.floor(Math.sin(time * 1.8) * 6);
    fillPix(ctx, cx + starPos - p(1), cy - p(3), p(3), p(3), '#ffffff');

    // Eyes visible through visor
    if (!blink) {
      fillPix(ctx, cx - p(7), cy - p(3), p(4), p(3), '#e49eff'); // Violet starlight eyes
      fillPix(ctx, cx + p(3), cy - p(3), p(4), p(3), '#e49eff');
    }

    // Delicate features
    fillPix(ctx, cx - p(2), cy + p(6), p(5), p(1), '#4c1d95'); // Soft smile
  } else if (npcId === 'kallo') {
    // Shadow Contraband Broker Kallo (Deserter / Rogue)
    // Dark tattered cowl shoulders
    fillPix(ctx, cx - p(22), cy + p(15) + breath, p(44), p(17), '#090d16');
    fillPix(ctx, cx - p(18), cy + p(17) + breath, p(36), p(15), '#131b2e');

    // Contraband Void Vials strapped across chest
    fillPix(ctx, cx - p(8), cy + p(17) + breath, p(3), p(6), '#b83bfa');
    fillPix(ctx, cx - p(3), cy + p(18) + breath, p(3), p(6), '#00d5ff');
    fillPix(ctx, cx + p(2), cy + p(17) + breath, p(3), p(6), '#ffaa00');

    // Cowl Hood casting deep shadow
    fillPix(ctx, cx - p(15), cy - p(19), p(30), p(14), '#090d16');
    fillPix(ctx, cx - p(16), cy - p(15), p(6), p(25), '#090d16');
    fillPix(ctx, cx + p(10), cy - p(15), p(6), p(25), '#090d16');

    // Shaded face
    fillPix(ctx, cx - p(10), cy - p(12), p(20), p(20), '#1a2233');
    fillPix(ctx, cx - p(8), cy - p(8), p(16), p(14), '#2d3a54');

    // Rebreather Gas Mask on lower face
    fillPix(ctx, cx - p(9), cy + p(2), p(18), p(12), '#111827');
    fillPix(ctx, cx - p(7), cy + p(4), p(14), p(8), '#374151');
    // Filter canisters with copper rings
    fillPix(ctx, cx - p(8), cy + p(5), p(4), p(6), '#996000');
    fillPix(ctx, cx + p(4), cy + p(5), p(4), p(6), '#996000');
    // Exhaust grill
    fillPix(ctx, cx - p(2), cy + p(6), p(4), p(4), '#111827');
    // Vapor puff from mask
    if (Math.sin(time * 3) > 0.6) {
      fillPix(ctx, cx - p(3), cy + p(12), p(6), p(2), 'rgba(200, 220, 255, 0.4)');
    }

    // Shadowed sharp right eye
    if (!blink) {
      fillPix(ctx, cx + p(2), cy - p(4), p(5), p(3), '#ffaa00'); // Shrewd golden iris
      fillPix(ctx, cx + p(3), cy - p(3), p(2), p(2), '#ffffff');
    }

    // Contraband Cyber Monocle (left eye)
    fillPix(ctx, cx - p(8), cy - p(5), p(7), p(7), '#4d2e00');
    fillPix(ctx, cx - p(7), cy - p(4), p(5), p(5), '#ffaa00');
    fillPix(ctx, cx - p(6), cy - p(3), p(3), p(3), '#ffd780');
    // Reticle crosshair
    fillPix(ctx, cx - p(5), cy - p(5), p(1), p(7), '#4d2e00');
    fillPix(ctx, cx - p(8), cy - p(2), p(7), p(1), '#4d2e00');
  }

  // Outer border with Sci-Fi cyan bracket notches
  ctx.strokeStyle = npcId === 'vex' ? '#ffaa00' : npcId === 'elira' ? '#00d5ff' : '#c044ff';
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, width - 2, height - 2);

  fillPix(ctx, x, y, 4, 4, ctx.strokeStyle);
  fillPix(ctx, x + width - 4, y, 4, 4, ctx.strokeStyle);
  fillPix(ctx, x, y + height - 4, 4, 4, ctx.strokeStyle);
  fillPix(ctx, x + width - 4, y + height - 4, 4, 4, ctx.strokeStyle);

  ctx.restore();
}

/**
 * Procedural Space Station in Orbit View
 */
export function drawPixelStation(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale = 1.0,
  time = 0,
  hasShield = true,
  threat = 20
) {
  ctx.save();
  ctx.imageSmoothingEnabled = false;

  const p = (v: number) => Math.floor(v * scale);

  // 1. Deflector Shield Bubble (if active)
  if (hasShield) {
    const pulse = Math.sin(time * 2) * 4;
    const shieldR = p(95) + pulse;
    ctx.strokeStyle = `rgba(0, 213, 255, ${0.35 + Math.sin(time * 3) * 0.15})`;
    ctx.lineWidth = 2;

    // Hexagonal Shield Matrix
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 + time * 0.1;
      const hx = cx + Math.cos(angle) * shieldR;
      const hy = cy + Math.sin(angle) * shieldR;
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.stroke();

    // Internal shield shimmer rings
    ctx.beginPath();
    ctx.arc(cx, cy, shieldR - 10, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 213, 255, 0.12)';
    ctx.stroke();
  }

  // 2. Solar Array Wings (Left and Right)
  const wingSpan = p(85);
  const wingHeight = p(22);
  const panelAngle = Math.sin(time * 0.2) * 2;

  // Left Wing Mount Arm
  fillPix(ctx, cx - wingSpan - p(20), cy - p(3), wingSpan + p(20), p(6), '#2d3a54');
  fillPix(ctx, cx - wingSpan - p(20), cy - p(1), wingSpan + p(20), p(2), '#7590c2');
  // Left Solar Panels (3 segmented blocks)
  for (let s = 0; s < 3; s++) {
    const px = cx - wingSpan + s * p(26) - p(10);
    fillPix(ctx, px, cy - wingHeight / 2 + panelAngle, p(22), wingHeight, '#003a4d');
    fillPix(ctx, px + 2, cy - wingHeight / 2 + 2 + panelAngle, p(18), wingHeight - 4, '#00839e');
    // Gold busbar traces
    fillPix(ctx, px + 2, cy + panelAngle, p(18), p(2), '#ffaa00');
    fillPix(ctx, px + p(10), cy - wingHeight / 2 + 2 + panelAngle, p(2), wingHeight - 4, '#ffaa00');
  }

  // Right Wing Mount Arm
  fillPix(ctx, cx, cy - p(3), wingSpan + p(20), p(6), '#2d3a54');
  fillPix(ctx, cx, cy - p(1), wingSpan + p(20), p(2), '#7590c2');
  // Right Solar Panels
  for (let s = 0; s < 3; s++) {
    const px = cx + p(18) + s * p(26);
    fillPix(ctx, px, cy - wingHeight / 2 - panelAngle, p(22), wingHeight, '#003a4d');
    fillPix(ctx, px + 2, cy - wingHeight / 2 + 2 - panelAngle, p(18), wingHeight - 4, '#00839e');
    // Gold traces
    fillPix(ctx, px + 2, cy - panelAngle, p(18), p(2), '#ffaa00');
    fillPix(ctx, px + p(10), cy - wingHeight / 2 + 2 - panelAngle, p(2), wingHeight - 4, '#ffaa00');
  }

  // 3. Rotating Habitat Centrifuge Ring
  const ringRadius = p(55);
  const ringRot = time * 0.4;
  for (let pod = 0; pod < 8; pod++) {
    const angle = (pod * Math.PI) / 4 + ringRot;
    const rx = cx + Math.cos(angle) * ringRadius;
    const ry = cy + Math.sin(angle) * (ringRadius * 0.45); // isometric tilt

    // Structural spoke from hub
    ctx.strokeStyle = '#2d3a54';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(rx, ry);
    ctx.stroke();

    // Habitat Pod Module
    fillPix(ctx, rx - p(7), ry - p(5), p(14), p(10), '#1a2233');
    fillPix(ctx, rx - p(5), ry - p(3), p(10), p(6), '#475b82');
    // Illuminated habitat windows
    fillPix(ctx, rx - p(3), ry - p(1), p(2), p(2), '#fef08a');
    fillPix(ctx, rx + p(1), ry - p(1), p(2), p(2), '#fef08a');
  }

  // 4. Central Command Citadel Hub
  // Outer armored bulkheads
  fillPix(ctx, cx - p(26), cy - p(35), p(52), p(70), '#1a2233');
  fillPix(ctx, cx - p(22), cy - p(32), p(44), p(64), '#2d3a54');
  fillPix(ctx, cx - p(18), cy - p(28), p(36), p(56), '#475b82');
  fillPix(ctx, cx - p(14), cy - p(24), p(28), p(48), '#7590c2');

  // Observation Bridge Dome (Upper Hub)
  fillPix(ctx, cx - p(12), cy - p(32), p(24), p(10), '#003a4d');
  fillPix(ctx, cx - p(10), cy - p(30), p(20), p(6), '#00d5ff');
  fillPix(ctx, cx - p(6), cy - p(29), p(12), p(4), '#ffffff');

  // Lower Drone Bay & Docking Clamp Aperture
  fillPix(ctx, cx - p(16), cy + p(18), p(32), p(14), '#0e172a');
  // Yellow safety chevrons
  fillPix(ctx, cx - p(14), cy + p(28), p(6), p(3), '#ffaa00');
  fillPix(ctx, cx - p(3), cy + p(28), p(6), p(3), '#ffaa00');
  fillPix(ctx, cx + p(8), cy + p(28), p(6), p(3), '#ffaa00');

  // Plasma Battery Sockets (turrets on sides)
  fillPix(ctx, cx - p(28), cy - p(12), p(6), p(16), '#1a2233');
  fillPix(ctx, cx - p(32), cy - p(8), p(4), p(3), '#ff3333');
  fillPix(ctx, cx + p(22), cy - p(12), p(6), p(16), '#1a2233');
  fillPix(ctx, cx + p(28), cy - p(8), p(4), p(3), '#ff3333');

  // Blinking Antenna Beacon at Station Top
  fillPix(ctx, cx - p(1), cy - p(45), p(2), p(12), '#7590c2');
  const beaconOn = Math.floor(time * 3) % 2 === 0;
  fillPix(ctx, cx - p(2), cy - p(47), p(4), p(4), beaconOn ? '#ff3333' : '#4a0808');

  // RCS Thruster Vapor Puffs
  if (Math.sin(time * 5) > 0.7) {
    fillPix(ctx, cx - p(24), cy - p(28), p(3), p(2), '#80ebff');
    fillPix(ctx, cx + p(21), cy + p(16), p(3), p(2), '#80ebff');
  }

  // Mining Drone Patrol in orbit around station
  const droneAngle = time * 0.8;
  const droneX = cx + Math.cos(droneAngle) * p(75);
  const droneY = cy + Math.sin(droneAngle) * p(40);
  fillPix(ctx, droneX - p(4), droneY - p(3), p(8), p(6), '#ffaa00');
  fillPix(ctx, droneX - p(2), droneY - p(2), p(4), p(4), '#2d3a54');
  fillPix(ctx, droneX - p(1), droneY - p(1), p(2), p(2), '#00d5ff');
  // Drone engine trail
  fillPix(ctx, droneX + Math.sin(droneAngle) * 6, droneY - Math.cos(droneAngle) * 6, p(2), p(2), '#00d5ff');

  ctx.restore();
}

/**
 * Procedural Combat Ships (Player Fleet & Enemies)
 */
export function drawPixelShip(
  ctx: CanvasRenderingContext2D,
  type: 'player_shuttle' | 'pirate_corvette' | 'void_leviathan' | 'derelict_freighter',
  cx: number,
  cy: number,
  scale = 1.0,
  time = 0
) {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  const p = (v: number) => Math.floor(v * scale);

  if (type === 'player_shuttle') {
    // Sleek Frontier Recon Interceptor
    // Delta Wing Hull
    fillPix(ctx, cx - p(16), cy + p(8), p(32), p(8), '#1a2233');
    fillPix(ctx, cx - p(12), cy, p(24), p(12), '#2d3a54');
    fillPix(ctx, cx - p(8), cy - p(10), p(16), p(18), '#475b82');
    fillPix(ctx, cx - p(4), cy - p(18), p(8), p(16), '#7590c2');
    fillPix(ctx, cx - p(2), cy - p(22), p(4), p(6), '#dbe7ff'); // Nose needle

    // Cyan Ion Engines
    fillPix(ctx, cx - p(10), cy + p(16), p(6), p(4), '#00839e');
    fillPix(ctx, cx + p(4), cy + p(16), p(6), p(4), '#00839e');
    // Pulsing flame trail
    const flameH = p(6) + Math.sin(time * 15) * p(3);
    fillPix(ctx, cx - p(9), cy + p(20), p(4), flameH, '#00d5ff');
    fillPix(ctx, cx + p(5), cy + p(20), p(4), flameH, '#00d5ff');
    fillPix(ctx, cx - p(8), cy + p(20), p(2), flameH - 2, '#ffffff');
    fillPix(ctx, cx + p(6), cy + p(20), p(2), flameH - 2, '#ffffff');

    // Cockpit canopy
    fillPix(ctx, cx - p(3), cy - p(8), p(6), p(8), '#00d5ff');
    fillPix(ctx, cx - p(1), cy - p(7), p(2), p(4), '#ffffff');

    // Wingtip laser cannons
    fillPix(ctx, cx - p(16), cy - p(4), p(2), p(12), '#ffaa00');
    fillPix(ctx, cx + p(14), cy - p(4), p(2), p(12), '#ffaa00');
  } else if (type === 'pirate_corvette') {
    // Aggressive Crimson & Charcoal Pirate Raider
    fillPix(ctx, cx - p(24), cy - p(6), p(48), p(18), '#111827');
    fillPix(ctx, cx - p(18), cy - p(14), p(36), p(24), '#1f2937');
    fillPix(ctx, cx - p(12), cy - p(22), p(24), p(30), '#374151');

    // Crimson War Paint Chevrons
    fillPix(ctx, cx - p(16), cy - p(8), p(6), p(14), '#991b1b');
    fillPix(ctx, cx + p(10), cy - p(8), p(6), p(14), '#991b1b');
    fillPix(ctx, cx - p(6), cy - p(16), p(12), p(6), '#dc2626');

    // Forward Heavy Prow Spikes
    fillPix(ctx, cx - p(14), cy - p(26), p(4), p(10), '#718096');
    fillPix(ctx, cx + p(10), cy - p(26), p(4), p(10), '#718096');

    // Glowing Red Sensor Visor
    fillPix(ctx, cx - p(8), cy - p(6), p(16), p(3), '#ff3333');
    fillPix(ctx, cx - p(4), cy - p(5), p(8), p(1), '#ffffff');

    // Dual Thrusters
    fillPix(ctx, cx - p(14), cy + p(12), p(8), p(4), '#451a03');
    fillPix(ctx, cx + p(6), cy + p(12), p(8), p(4), '#451a03');
    const flame = p(5) + Math.sin(time * 18) * p(3);
    fillPix(ctx, cx - p(12), cy + p(16), p(4), flame, '#f59e0b');
    fillPix(ctx, cx + p(8), cy + p(16), p(4), flame, '#f59e0b');
  } else if (type === 'void_leviathan') {
    // Eldritch Anomaly Entity with crystalline carapace and undulating cosmic tendrils
    const pulse = Math.sin(time * 3) * p(4);
    // Outer shadow mist
    fillPix(ctx, cx - p(26), cy - p(20) + pulse, p(52), p(40), '#150424');
    fillPix(ctx, cx - p(20), cy - p(24) + pulse, p(40), p(48), '#2b0942');

    // Crystalline carapace shell
    fillPix(ctx, cx - p(14), cy - p(16), p(28), p(32), '#531878');
    fillPix(ctx, cx - p(8), cy - p(10), p(16), p(20), '#8b2cb8');

    // Central pulsing Void Eye
    fillPix(ctx, cx - p(6), cy - p(4), p(12), p(8), '#000000');
    fillPix(ctx, cx - p(3), cy - p(3), p(6), p(6), '#b83bfa');
    fillPix(ctx, cx - p(1), cy - p(2), p(2), p(4), '#ffffff');

    // Undulating Tendrils
    for (let t = 0; t < 5; t++) {
      const tx = cx - p(18) + t * p(9);
      const ty = cy + p(16) + Math.sin(time * 4 + t) * p(8);
      fillPix(ctx, tx, ty, p(3), p(12), '#b83bfa');
      fillPix(ctx, tx + 1, ty + p(10), p(2), p(6), '#e49eff');
    }
  } else if (type === 'derelict_freighter') {
    // Massive scarred cargo vessel adrift
    fillPix(ctx, cx - p(28), cy - p(18), p(56), p(36), '#1e293b');
    fillPix(ctx, cx - p(22), cy - p(14), p(44), p(28), '#334155');

    // Cargo Container Pods (rusted orange & olive)
    fillPix(ctx, cx - p(18), cy - p(10), p(10), p(8), '#92400e');
    fillPix(ctx, cx - p(6), cy - p(10), p(10), p(8), '#3f6212');
    fillPix(ctx, cx + p(6), cy - p(10), p(10), p(8), '#92400e');

    // Hull breach gap with exposed girders
    fillPix(ctx, cx - p(4), cy - p(2), p(12), p(10), '#03050a');
    fillPix(ctx, cx - p(2), cy, p(8), p(2), '#64748b'); // Bent girder
    // Flickering short-circuit sparks
    if (Math.sin(time * 8) > 0.8) {
      fillPix(ctx, cx + p(2), cy - p(1), p(2), p(2), '#00d5ff');
      fillPix(ctx, cx + p(4), cy + p(3), p(2), p(2), '#ffffff');
    }
  }

  ctx.restore();
}

/**
 * Animated Parallax Cosmic Background with Event Horizon Black Hole & Nebula
 */
export function drawParallaxCosmicBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  threat = 20
) {
  ctx.save();
  ctx.imageSmoothingEnabled = false;

  // 1. Deep Void Canvas Base
  ctx.fillStyle = '#040711';
  ctx.fillRect(0, 0, width, height);

  // 2. Event Horizon Anomaly (Right-side cosmic centerpiece)
  const holeX = width * 0.78;
  const holeY = height * 0.45;
  const holeR = Math.min(width, height) * 0.22;

  // Blazing Accretion Disk Glow (Distorted Ellipse)
  const diskGrad = ctx.createRadialGradient(holeX, holeY, holeR * 0.6, holeX, holeY, holeR * 2.2);
  diskGrad.addColorStop(0, 'rgba(0, 0, 0, 0.95)');
  diskGrad.addColorStop(0.3, threat > 50 ? 'rgba(255, 60, 60, 0.45)' : 'rgba(0, 213, 255, 0.35)');
  diskGrad.addColorStop(0.6, 'rgba(184, 59, 250, 0.25)');
  diskGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = diskGrad;
  ctx.beginPath();
  ctx.ellipse(holeX, holeY, holeR * 2.2, holeR * 0.9, -0.25, 0, Math.PI * 2);
  ctx.fill();

  // Swirling Relativistic Jet Rays
  ctx.save();
  ctx.translate(holeX, holeY);
  ctx.rotate(time * 0.08);
  for (let r = 0; r < 12; r++) {
    const angle = (r * Math.PI) / 6;
    ctx.strokeStyle = r % 2 === 0 ? 'rgba(0, 213, 255, 0.15)' : 'rgba(255, 170, 0, 0.12)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * (holeR * 0.9), Math.sin(angle) * (holeR * 0.5));
    ctx.lineTo(Math.cos(angle) * (holeR * 1.8), Math.sin(angle) * (holeR * 0.8));
    ctx.stroke();
  }
  ctx.restore();

  // Pure Black Singularity Core
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(holeX, holeY, holeR * 0.72, 0, Math.PI * 2);
  ctx.fill();

  // Gravitational Lensing Rim
  ctx.strokeStyle = threat > 50 ? 'rgba(255, 80, 80, 0.8)' : 'rgba(0, 213, 255, 0.75)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(holeX, holeY, holeR * 0.73, 0, Math.PI * 2);
  ctx.stroke();

  // 3. Multi-layer Starfield
  // Deterministic procedural stars using pseudo-hash
  const starCount = 80;
  for (let i = 0; i < starCount; i++) {
    const seed = i * 9973;
    const sx = (seed % 1000) * (width / 1000);
    const sy = ((seed * 31) % 1000) * (height / 1000);
    const size = (i % 7 === 0) ? 3 : (i % 3 === 0) ? 2 : 1;
    const twinkle = Math.sin(time * 2 + i) * 0.5 + 0.5;

    if (twinkle > 0.2) {
      const starColor = i % 5 === 0 ? '#00d5ff' : i % 8 === 0 ? '#ffaa00' : i % 11 === 0 ? '#e49eff' : '#ffffff';
      fillPix(ctx, sx, sy, size, size, starColor);

      // Cross glare on bright stars
      if (size === 3 && twinkle > 0.7) {
        fillPix(ctx, sx - 2, sy + 1, 5, 1, 'rgba(255, 255, 255, 0.6)');
        fillPix(ctx, sx + 1, sy - 2, 1, 5, 'rgba(255, 255, 255, 0.6)');
      }
    }
  }

  // 4. Drifting Asteroid Belt
  const asteroidCount = 8;
  for (let a = 0; a < asteroidCount; a++) {
    const aX = ((a * 180 + time * 8) % (width + 100)) - 50;
    const aY = height * 0.75 + Math.sin(a * 4 + time * 0.3) * 35;
    const aSize = 10 + (a % 4) * 6;

    // Rock base
    fillPix(ctx, aX, aY, aSize, aSize, '#1e293b');
    fillPix(ctx, aX + 2, aY + 2, aSize - 4, aSize - 4, '#334155');
    // Lit rim facet
    fillPix(ctx, aX + 1, aY + 1, aSize - 2, 2, '#64748b');
    // Shaded crater
    fillPix(ctx, aX + aSize / 3, aY + aSize / 3, aSize / 3, aSize / 3, '#0f172a');
  }

  ctx.restore();
}
