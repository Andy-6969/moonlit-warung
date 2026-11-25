// The cook: walks the kitchen with WASD or arrows, or follows a clicked route, and always faces
// the station it will use next. Positions are in tile units (0.5 = centre of the first tile).
import { isFloor, stationAt, routeTo } from './grid.js';

const RADIUS = 0.3;
const BASE_SPEED = 4.4; // tiles per second

export function makeChef(k) {
  const mc = Math.floor(k.cols / 2), mr = Math.floor(k.rows / 2);
  let best = null;
  for (let r = 0; r < k.rows; r++) for (let c = 0; c < k.cols; c++) {
    if (!isFloor(k, c, r)) continue;
    const d = Math.abs(c - mc) + Math.abs(r - mr);
    if (!best || d < best.d) best = { c, r, d };
  }
  return { x: best.c + 0.5, y: best.r + 0.5, dir: { x: 0, y: -1 }, held: null, route: [], goal: null, step: 0, moving: false, busy: 0 };
}

export const chefTile = chef => ({ c: Math.floor(chef.x), r: Math.floor(chef.y) });

function blocked(k, x, y) {
  for (const [ox, oy] of [[-RADIUS, -RADIUS], [RADIUS, -RADIUS], [-RADIUS, RADIUS], [RADIUS, RADIUS]]) {
    if (!isFloor(k, Math.floor(x + ox), Math.floor(y + oy))) return true;
  }
  return false;
}

/** Walk one frame. `axis` is the keyboard vector; with none, the chef follows its clicked route. */
export function moveChef(chef, k, axis, dt, walkMod) {
  const speed = BASE_SPEED * walkMod;
  let vx = axis.x, vy = axis.y;
  if (vx || vy) {
    chef.route = [];
  } else if (chef.route.length) {
    const next = chef.route[0];
    const tx = next.c + 0.5 - chef.x, ty = next.r + 0.5 - chef.y;
    const d = Math.hypot(tx, ty);
    if (d < 0.08) { chef.x = next.c + 0.5; chef.y = next.r + 0.5; chef.route.shift(); }
    else { vx = tx / d; vy = ty / d; }
  }
  const len = Math.hypot(vx, vy);
  chef.moving = len > 0;
  if (!len) return false;
  vx /= len; vy /= len;
  chef.dir = Math.abs(vx) > Math.abs(vy) ? { x: Math.sign(vx), y: 0 } : { x: 0, y: Math.sign(vy) };
  const nx = chef.x + vx * speed * dt, ny = chef.y + vy * speed * dt;
  if (!blocked(k, nx, chef.y)) chef.x = nx;
  if (!blocked(k, chef.x, ny)) chef.y = ny;
  chef.step += dt * speed * 2.2;
  return true;
}

/** The station the chef will use: the one it faces, else the nearest one beside it. */
export function targetStation(chef, k) {
  const { c, r } = chefTile(chef);
  const ahead = stationAt(k, c + chef.dir.x, r + chef.dir.y);
  if (ahead) return ahead;
  const around = [[1, 0], [-1, 0], [0, 1], [0, -1]]
    .map(([dx, dy]) => ({ s: stationAt(k, c + dx, r + dy), dot: dx * chef.dir.x + dy * chef.dir.y, dx, dy }))
    .filter(o => o.s)
    .sort((a, b) => b.dot - a.dot);
  return around.length && around[0].dot >= 0 ? around[0].s : null;
}

/** Plans the walk to a clicked station (or floor tile); arrival faces the station. */
export function planRoute(chef, k, goal) {
  const path = routeTo(k, chefTile(chef), goal);
  if (!path) return false;
  chef.route = path.slice(1);
  chef.goal = goal.kind ? goal : null;
  return true;
}

/** Turns the chef to face a station from the tile it stands on. */
export function faceStation(chef, st) {
  const { c, r } = chefTile(chef);
  chef.dir = { x: Math.sign(st.col - c), y: Math.sign(st.row - r) };
  if (chef.dir.x && chef.dir.y) chef.dir.y = 0;
}
