// Turns a night's text map into the kitchen: a grid of floor and stations, plus the route finder
// the chef uses when you click a station across the room.

export const CRATE_KEYS = { r: 'rice', n: 'noodles', e: 'egg', c: 'chicken', p: 'prawn', t: 'tofu', g: 'greens', h: 'chili', a: 'peanut', l: 'lime' };
const STATION_KEYS = { '#': 'counter', P: 'mat', B: 'board', M: 'mortar', W: 'wok', G: 'grill', D: 'plates', X: 'bin', S: 'pass' };

export const STATION_LABELS = {
  counter: 'Counter', mat: 'Plating mat', board: 'Chopping board', mortar: 'Cobek mortar', wok: 'Wok', grill: 'Charcoal grill',
  plates: 'Leaf plates', bin: 'Scrap bin', pass: 'Serving pass', crate: 'Crate',
};

export function buildKitchen(map) {
  const rows = map.length;
  const cols = map[0].length;
  const tiles = [];
  const stations = [];
  for (let r = 0; r < rows; r++) {
    tiles.push([]);
    for (let c = 0; c < cols; c++) {
      const ch = map[r][c];
      let st = null;
      if (CRATE_KEYS[ch]) st = { kind: 'crate', ing: CRATE_KEYS[ch] };
      else if (STATION_KEYS[ch]) st = { kind: STATION_KEYS[ch] };
      if (st) {
        Object.assign(st, { id: `${c},${r}`, col: c, row: r, item: null, contents: [], progress: 0, cook: 0, burn: 0, state: 'idle', shake: 0, pop: 0 });
        stations.push(st);
      }
      tiles[r].push(st);
    }
  }
  return { cols, rows, tiles, stations };
}

export function isFloor(k, c, r) {
  return c >= 0 && r >= 0 && c < k.cols && r < k.rows && k.tiles[r][c] === null;
}

export function stationAt(k, c, r) {
  if (c < 0 || r < 0 || c >= k.cols || r >= k.rows) return null;
  return k.tiles[r][c];
}

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

/** Breadth-first route over floor tiles to a tile beside `station` (or to a floor tile itself). */
export function routeTo(k, from, goal) {
  const key = (c, r) => r * k.cols + c;
  const isGoal = goal.kind
    ? (c, r) => DIRS.some(([dx, dy]) => c + dx === goal.col && r + dy === goal.row)
    : (c, r) => c === goal.col && r === goal.row;
  const prev = new Map([[key(from.c, from.r), null]]);
  const queue = [[from.c, from.r]];
  while (queue.length) {
    const [c, r] = queue.shift();
    if (isGoal(c, r)) {
      const path = [];
      let at = key(c, r);
      while (at !== null) { path.unshift({ c: at % k.cols, r: Math.floor(at / k.cols) }); at = prev.get(at); }
      return path;
    }
    for (const [dx, dy] of DIRS) {
      const nc = c + dx, nr = r + dy;
      if (!isFloor(k, nc, nr) || prev.has(key(nc, nr))) continue;
      prev.set(key(nc, nr), key(c, r));
      queue.push([nc, nr]);
    }
  }
  return null;
}

/** All stations of one kind (woks, grills...), for hints and staging. */
export function stationsOf(k, kind) {
  return k.stations.filter(s => s.kind === kind);
}
