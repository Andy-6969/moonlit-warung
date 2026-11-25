// One night of service from the first ticket to closing time: builds the kitchen from the night's map,
// applies the stall's upgrades and runs the clock, orders and stations every frame.
import { scheduleEvents, tickEvents } from './events.js';
import { tickOrders } from './orders.js';
import { DIFFICULTIES, ENDLESS, ENDLESS_STRIKES } from './difficulty.js';
import { stallModifiers } from '../stall/upgrades.js';
import { buildKitchen } from '../kitchen/grid.js';
import { makeChef } from '../kitchen/chef.js';
import { tickStations } from '../kitchen/stations.js';
import { seededRandom } from '../core/screen.js';
import { NIGHTS, starsFor } from '../nights/campaign.js';

export function createRun(index, save, fx, seed = 7 + (index === 'endless' ? 999 : index) * 101) {
  const night = index === 'endless' ? ENDLESS : NIGHTS[index];
  const k = buildKitchen(night.map);
  const mods = stallModifiers(save.upgrades);
  const diff = DIFFICULTIES[save.difficulty ?? 1];
  mods.patience *= diff.patience * (night.patienceMul || 1);
  mods.tip *= night.tipMul || 1;
  mods.burnDelay += diff.burn;
  const rng = seededRandom(seed);
  return {
    spawnMul: diff.spawn,
    difficulty: diff,
    index, night, k, mods, fx,
    chef: makeChef(k),
    rng,
    eventQueue: scheduleEvents(night, index === 'endless' ? 99 : index, rng),
    event: null,
    time: 0,
    nextSpawn: night.spawn.first,
    tickets: [],
    seats: new Array(6).fill(null),
    takings: 0,
    combo: 0,
    lastServe: -99,
    rush: false,
    vipSpawned: 0,
    reviews: [],
    walkouts: [],
    stats: { served: 0, missed: 0, perfect: 0, nearMiss: 0, bestCombo: 0, tips: 0, wrong: 0, burnt: 0, events: 0 },
    over: false,
  };
}

export function secondsLeft(run) {
  return Math.max(0, run.night.seconds - run.time);
}

export function updateRun(run, dt) {
  if (run.over) return;
  run.time += dt;
  tickEvents(run, dt);
  tickOrders(run, dt);
  tickStations(run, dt);
  if (run.time - run.lastServe > run.mods.comboWindow && run.combo > 0) run.combo = 0;
  const endlessDone = run.night.endless && run.stats.missed >= ENDLESS_STRIKES;
  if (run.time >= run.night.seconds || endlessDone) {
    run.over = true;
    run.stars = starsFor(run.night, run.takings);
    run.fx.emit('closing', { stars: run.stars });
  }
}
