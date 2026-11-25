// Headless check of the kitchen rules: for every night, cook and serve each dish on its menu
// through the real station code (crate > board/cobek > wok/grill > plate > pass), and run each
// night's clock to closing time. usage: node tools/simtest.mjs
import { NIGHTS } from '../game/src/nights/campaign.js';
import { createRun, updateRun } from '../game/src/service/night-run.js';
import { interact } from '../game/src/kitchen/stations.js';
import { spawnTicket } from '../game/src/service/orders.js';
import { RECIPE_BY_ID } from '../game/src/food/recipes.js';
import { routeOf } from '../game/src/scenes/book-scene.js';
import { routeTo } from '../game/src/kitchen/grid.js';

const fx = { emit() {} };
let failures = 0;
const fail = msg => { failures++; console.log('FAIL', msg); };

function station(run, kind, pred = () => true) {
  return run.k.stations.find(s => s.kind === kind && pred(s));
}
function crate(run, ing) { return station(run, 'crate', s => s.ing === ing); }
function freeCounter(run) { return station(run, 'mat', s => !s.item) || station(run, 'counter', s => !s.item); }
function use(run, st, what) {
  if (!st) { fail(`${run.night.name}: no station for ${what}`); return false; }
  return interact(run, st);
}
function cookOn(run, kind) {
  const st = station(run, kind, s => s.state !== 'idle');
  for (let i = 0; i < 600 && st.state !== 'done'; i++) updateRun(run, 1 / 60);
  return st;
}

/** Makes one plate part and adds it to the plate on `mat`. */
function makePart(run, part, mat) {
  const chain = routeOf(part);
  const raws = chain.filter(s => !['board', 'cobek', 'wok', 'grill'].includes(s));
  const steps = chain.filter(s => ['board', 'cobek', 'wok', 'grill'].includes(s));
  if (!steps.length) { use(run, crate(run, part), part); return use(run, mat, 'plate'); }
  if (steps[steps.length - 1] === 'wok' && raws.length > 1) {
    const wok = station(run, 'wok', s => s.state === 'idle');
    for (const r of raws) { use(run, crate(run, r), r); use(run, wok, 'wok'); }
    cookOn(run, 'wok');
    use(run, wok, 'take'); return use(run, mat, 'plate');
  }
  use(run, crate(run, raws[0]), raws[0]);
  for (const s of steps) {
    if (s === 'board' || s === 'cobek') {
      const top = station(run, s === 'board' ? 'board' : 'mortar', x => !x.item);
      use(run, top, s);
      for (let i = 0; i < 6 && top.item && (top.item.id === raws[0]); i++) use(run, top, 'tap');
      use(run, top, 'take');
    } else {
      const fire = station(run, s, x => x.state === 'idle');
      use(run, fire, s); cookOn(run, s); use(run, fire, 'take');
    }
  }
  return use(run, mat, 'plate');
}

for (let n = 0; n < NIGHTS.length; n++) {
  const night = NIGHTS[n];
  const save = { upgrades: [] };
  const run = createRun(n, save, fx);
  for (const s of run.k.stations) {
    const reach = routeTo(run.k, { c: Math.floor(run.chef.x), r: Math.floor(run.chef.y) }, s);
    if (!reach && s.kind !== 'counter') fail(`${night.name}: ${s.kind} at ${s.id} cannot be reached`);
  }
  for (const rid of night.menu) {
    run.tickets.length = 0; run.seats.fill(null);
    spawnTicket(run, { recipe: rid, who: night.regulars[0], seat: 0 });
    const mat = freeCounter(run);
    use(run, station(run, 'plates'), 'plates');
    use(run, mat, 'set plate');
    for (const p of RECIPE_BY_ID[rid].parts) makePart(run, p, mat);
    use(run, mat, 'lift plate');
    const before = run.stats.served;
    use(run, station(run, 'pass'), 'pass');
    if (run.stats.served !== before + 1) fail(`${night.name}: could not serve ${rid} (held ${JSON.stringify(run.chef.held)})`);
    run.chef.held = null;
  }
  const full = createRun(n, save, fx);
  let spawned = 0;
  const orig = full.fx; full.fx = { emit: (t, d) => { if (t === 'order') spawned++; } };
  for (let i = 0; i < (night.seconds + 2) * 60; i++) updateRun(full, 1 / 60);
  if (!full.over) fail(`${night.name}: never closed`);
  console.log(`night ${n + 1} ${night.name}: ${night.menu.length} dishes cooked and served; full night ${spawned} tickets, ${full.stats.missed} walk-outs with nobody cooking`);
}
console.log(failures ? `${failures} failures` : 'all nights pass');
process.exit(failures ? 1 : 0);
