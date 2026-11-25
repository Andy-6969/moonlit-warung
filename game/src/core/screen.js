// The fixed 1280 x 800 stage everything is drawn on, and where the kitchen sits on it.
export const W = 1280;
export const H = 800;

/** The kitchen grid: 13 x 8 tiles of 70 px, left of the street counter. */
export const KITCHEN = { x: 20, y: 196, tile: 70, cols: 13, rows: 8 };

/** The street side where customers sit on stools facing the pass. */
export const STREET = { x: 940, y: 196, w: 330, h: 560 };

/** Tile column/row centre to stage pixels. */
export function tileCenter(col, row) {
  return { x: KITCHEN.x + (col + 0.5) * KITCHEN.tile, y: KITCHEN.y + (row + 0.5) * KITCHEN.tile };
}

/** A small seeded random generator (mulberry32), so nights and screenshots replay the same. */
export function seededRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
