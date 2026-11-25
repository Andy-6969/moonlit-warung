// One night of service from the first ticket to closing time: builds the kitchen from the night's map,
// applies the stall's upgrades and runs the clock, orders and stations every frame.
import { NIGHTS, starsFor } from '../nights/campaign.js';
import { buildKitchen } from '../kitchen/grid.js';
import { makeChef } from '../kitchen/chef.js';
import { tickStations } from '../kitchen/stations.js';
import { tickOrders } from './orders.js';
import { stallModifiers } from '../stall/upgrades.js';
import { seededRandom } from '../core/screen.js';

export function createRun(index, save, fx, seed = 7 + index * 101) {
  const night = NIGHTS[index];
  const k = buildKitchen(night.map);
  const mods = stallModifiers(save.upgrades);
  return {
    index, night, k, mods, fx,
    chef: makeChef(k),
    rng: seededRandom(seed),
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
    stats: { served: 0, missed: 0, perfect: 0, nearMiss: 0, bestCombo: 0, tips: 0, wrong: 0, burnt: 0 },
    over: false,
  };
}

export function secondsLeft(run) {
  return Math.max(0, run.night.seconds - run.time);
}

export function updateRun(run, dt) {
  if (run.over) return;
  run.time += dt;
  tickOrders(run, dt);
  tickStations(run, dt);
  if (run.time - run.lastServe > run.mods.comboWindow && run.combo > 0) run.combo = 0;
  if (run.time >= run.night.seconds) {
    run.over = true;
    run.stars = starsFor(run.night, run.takings);
    run.fx.emit('closing', { stars: run.stars });
  }
}
