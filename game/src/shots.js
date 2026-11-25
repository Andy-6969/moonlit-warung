// Screenshot staging (?shot=cook|map|results|shop|book|title): sets the real game state for one
// moment of play and draws a single frame with the game's own scene code, with a fixed seed.
import { createCookScene } from './scenes/cook-scene.js';
import { createMapScene } from './scenes/map-scene.js';
import { createResultsScene } from './scenes/results-scene.js';
import { createShopScene } from './scenes/shop-scene.js';
import { createBookScene } from './scenes/book-scene.js';
import { createTitleScene } from './scenes/title-scene.js';
import { spawnTicket } from './service/orders.js';
import { startEvent } from './service/events.js';
import { stationAt } from './kitchen/grid.js';
import { tickFeel } from './feel/particles.js';
import { NIGHTS } from './nights/campaign.js';

function seedRandom(seed) {
  let s = seed;
  Math.random = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

function put(run, c, r, fields) {
  Object.assign(stationAt(run.k, c, r), fields);
}

/** Night 7 at the second rush: six guests on the rail, every station busy, a combo running. */
function stageService(app, plannedGuest = 'sari') {
  app.save.upgrades = ['knife', 'leaf', 'stools', 'bell', 'lantern', 'burner'];
  const scene = createCookScene(app, 9, { skipIntro: true, seed: 11 });
  const run = scene.run;
  run.time = 164;
  const guests = [
    ['ratna', 'moonlit_feast', 0.56, 4],
    ['darto', 'nasi_goreng', 0.86, 0],
    ['udin', 'udang_bakar', 0.13, 1],
    ['joko', 'mie_udang', 0.36, 2],
    ['sari', 'gado_gado', 0.74, 3],
  ];
  guests.forEach(([who, recipe, share, seat], i) => {
    const t = spawnTicket(run, { who, recipe, seat });
    t.patience = t.max * share; t.born = i; t.enter = 0;
    if (who === plannedGuest) scene.planTicket = t.id;
  });
  put(run, 0, 1, { item: { id: 'chicken' }, progress: 0.5, shake: 0.6 });
  put(run, 0, 4, { item: { id: 'chili' }, progress: 0.25 });
  put(run, 1, 7, { contents: ['rice', 'egg'], result: 'fried_rice', state: 'cooking', cook: 0.62 });
  put(run, 2, 7, { contents: ['egg'], result: 'fried_egg', state: 'done', cook: 1, burn: 1 });
  put(run, 5, 5, { contents: ['noodles', 'egg'], result: 'fried_noodles', state: 'done', cook: 1, burn: 5.6 });
  put(run, 5, 7, { contents: ['diced_chicken'], result: 'sate', state: 'cooking', cook: 0.4 });
  put(run, 6, 5, { contents: ['peeled_prawn'], result: 'grilled_prawn', state: 'done', cook: 1, burn: 2 });
  put(run, 7, 5, { contents: ['diced_chicken'], result: 'sate', state: 'cooking', cook: 0.78 });
  put(run, 6, 7, { contents: ['diced_chicken'], result: 'sate', state: 'burnt', cook: 1, burn: 9 });
  put(run, 2, 2, { item: { id: 'plate', parts: ['fried_rice', 'fried_egg'] } });
  put(run, 3, 2, { item: { id: 'plate', parts: ['rice', 'sate'] } });
  put(run, 4, 2, { item: { id: 'sambal' } });
  put(run, 8, 2, { item: { id: 'plate', parts: ['fried_rice', 'sate', 'grilled_prawn'] } });
  put(run, 10, 2, { item: { id: 'peanut_sauce' } });
  run.chef.x = 8.5; run.chef.y = 4.5; run.chef.dir = { x: 1, y: 0 }; run.chef.moving = true; run.chef.step = 0.5;
  run.chef.route = [{ c: 9, r: 4 }, { c: 10, r: 4 }, { c: 11, r: 4 }];
  run.chef.goal = stationAt(run.k, 12, 4);
  run.chef.held = { id: 'plate', parts: ['grilled_prawn', 'sambal', 'lime_wedge'] };
  run.takings = 774; run.combo = 3; run.lastServe = run.time - 2.5; run.rush = true;
  run.eventQueue = [];
  startEvent(run, 'gas_surge');   // the second market event of the night broke 7 s ago
  run.event.left = 13;
  run.stats.served = 14;
  const fx = run.fx;
  run.seats[5] = { who: 'lusi', state: 'eating', anim: 2, dish: 'mie_udang' };
  fx.emit('serve', { at: stationAt(run.k, 12, 3), ticket: { seat: 5, who: 'lusi' }, dish: { name: 'Mie Udang' }, pay: 126, tip: 18, combo: 3, perfect: true, nearMiss: false, secondsLeft: 30 });
  fx.emit('chop', { at: stationAt(run.k, 0, 1), progress: 0.5 });
  fx.emit('sizzle', { at: stationAt(run.k, 1, 7) });
  fx.emit('burnt', { at: stationAt(run.k, 6, 7) });
  tickFeel(scene.feel, 0.12);
  scene.feel.shake = 0; scene.feel.flash = 0;
  return { scene, t: 12.3 };
}

/** Night 2 in the rain: a smaller crowd, the cook pounding peanut sauce, a gado-gado half built. */
function stageRain(app, shotOpts = {}) {
  app.save.upgrades = ['knife'];
  const scene = createCookScene(app, 1, { skipIntro: true, seed: 3 });
  const run = scene.run;
  run.time = 70;
  [['ayu', 'sate_ayam', 0.7, 0], ['joko', 'gado_gado', 0.3, 1], ['darto', 'nasi_goreng', 0.9, 2], ['sari', 'gado_gado', 0.55, 3]].forEach(([who, recipe, share, seat], i) => {
    const t = spawnTicket(run, { who, recipe, seat });
    t.patience = t.max * share; t.born = i; t.enter = 0;
    if (who === 'joko') scene.planTicket = t.id;
  });
  put(run, 0, 5, { item: { id: 'peanut' }, progress: 0.75, shake: 1 });
  put(run, 7, 7, { contents: ['diced_chicken'], result: 'sate', state: 'cooking', cook: 0.55 });
  put(run, 1, 7, { contents: ['tofu_cubes'], result: 'fried_tofu', state: 'done', cook: 1, burn: 1 });
  put(run, 6, 3, { item: { id: 'plate', parts: ['chopped_greens'] } });
  put(run, 7, 3, { item: { id: 'plate', parts: ['fried_rice', 'fried_egg'] } });
  run.chef.x = 1.5; run.chef.y = 5.5; run.chef.dir = { x: -1, y: 0 }; run.chef.busy = 0.1;
  run.takings = 238; run.combo = 2; run.lastServe = run.time - 4;
  if (shotOpts.rainEvent) {   // the night's gusty wind has just blown in over the market
    run.time = run.eventQueue[0].at * run.night.seconds + 5;
    run.eventQueue = [];
    startEvent(run, 'gusty_wind');
    run.event.left = 13;
  }
  run.fx.emit('grind', { at: stationAt(run.k, 0, 5) });
  tickFeel(scene.feel, 0.1);
  scene.feel.shake = 0; scene.feel.flash = 0;
  return { scene, t: 7.7 };
}

/** Night 4, the mirrored stall in a power flicker: fire at the back, crates at the front, the critic-free crowd restless. */
function stageFlicker(app) {
  app.save.upgrades = ['knife', 'leaf', 'stools'];
  const scene = createCookScene(app, 3, { skipIntro: true, seed: 9 });
  const run = scene.run;
  run.time = 120;
  [['han', 'tahu_telor', 0.8, 0], ['udin', 'udang_bakar', 0.22, 1], ['ayu', 'nasi_sate', 0.5, 2], ['joko', 'nasi_goreng', 0.62, 3], ['sari', 'gado_gado', 0.4, 4]].forEach(([who, recipe, share, seat], i) => {
    const t = spawnTicket(run, { who, recipe, seat });
    t.patience = t.max * share; t.born = i; t.enter = 0;
  });
  put(run, 2, 0, { contents: ['tofu_cubes'], result: 'fried_tofu', state: 'cooking', cook: 0.7 });
  put(run, 3, 0, { contents: ['egg'], result: 'fried_egg', state: 'done', cook: 1, burn: 2 });
  put(run, 6, 0, { contents: ['peeled_prawn'], result: 'grilled_prawn', state: 'cooking', cook: 0.35 });
  put(run, 7, 0, { contents: ['diced_chicken'], result: 'sate', state: 'done', cook: 1, burn: 6.2 });
  put(run, 0, 2, { item: { id: 'lime' }, progress: 0.5 });
  put(run, 5, 2, { item: { id: 'plate', parts: ['fried_tofu', 'peanut_sauce'] } });
  put(run, 6, 2, { item: { id: 'plate', parts: ['rice', 'sambal'] } });
  run.chef.x = 7.5; run.chef.y = 1.5; run.chef.dir = { x: 0, y: -1 };
  run.chef.held = { id: 'plate', parts: [] };
  run.takings = 402; run.combo = 0; run.lastServe = run.time - 20;
  run.fx.emit('cooked', { at: stationAt(run.k, 3, 0), id: 'fried_egg' });
  run.fx.emit('walkout', { ticket: { seat: 5, who: 'lusi' } });
  run.seats[5] = { who: 'lusi', state: 'leaving-angry', anim: 1.2 };
  tickFeel(scene.feel, 0.2);
  scene.feel.shake = 0; scene.feel.flash = 0;
  scene.forceDark = true;
  return { scene, t: 21.1 };
}

const SAVE_MIDWAY = { unlocked: 6, stars: [3, 3, 2, 3, 3, 2, 0, 0, 0, 0], purse: 410, upgrades: ['knife', 'leaf', 'stools', 'bell'], selected: 6, difficulty: 1, bestEndless: 1340 };

export function stageShot(app, name, ctx) {
  seedRandom(20261125);
  let staged;
  if (name === 'cook') staged = stageService(app);
  else if (name === 'rain') staged = stageRain(app);
  else if (name === 'wind') staged = stageRain(app, { rainEvent: true });
  else if (name === 'flicker') staged = stageFlicker(app);
  else if (name === 'map') { Object.assign(app.save, SAVE_MIDWAY); staged = { scene: createMapScene(app), t: 3.1 }; }
  else if (name === 'shop') { Object.assign(app.save, SAVE_MIDWAY); staged = { scene: createShopScene(app), t: 2 }; }
  else if (name === 'book') staged = { scene: createBookScene(app), t: 2 };
  else if (name === 'results') {
    Object.assign(app.save, SAVE_MIDWAY);
    const result = {
      index: 3, night: NIGHTS[3], stars: 3, takings: 806, purse: 1216,
      stats: { served: 19, perfect: 11, nearMiss: 3, bestCombo: 5, tips: 238, missed: 1, wrong: 1, burnt: 1 },
      reviews: [
        { who: 'han', text: 'Like 1975 again.', stars: 3, dish: 'tahu_telor' },
        { who: 'ayu', text: 'Wangi sekali!', stars: 3, dish: 'sate_ayam' },
        { who: 'udin', text: 'Sea-fresh, good job.', stars: 3, dish: 'udang_bakar' },
        { who: 'joko', text: 'Just in time...', stars: 1, dish: 'nasi_goreng' },
      ],
      walkouts: ['sari'],
    };
    staged = { scene: createResultsScene(app, result), t: 4 };
    staged.scene.age = 9;
  } else staged = { scene: createTitleScene(app), t: 1.2 };
  staged.scene.draw(ctx, staged.t);
  document.title = `shot ready: ${name}`;
}
