// Moonlit Warung: boots the stage, runs the fixed-step loop and switches between the scenes
// (title, market map, a night of service, closing-time results, stall upgrades, recipe book).
import { RECIPES } from './food/recipes.js';
import { REGULARS } from './service/customers.js';
import { createCookScene } from './scenes/cook-scene.js';
import { UPGRADES } from './stall/upgrades.js';
import { NIGHTS } from './nights/campaign.js';
import { W, H } from './core/screen.js';
import { makeInput, fitCanvas } from './core/input.js';
import { loadSave, bankNight, writeSave } from './core/save.js';
import { createMapScene } from './scenes/map-scene.js';
import { createResultsScene } from './scenes/results-scene.js';
import { createShopScene } from './scenes/shop-scene.js';
import { createBookScene } from './scenes/book-scene.js';
import { createTitleScene } from './scenes/title-scene.js';
import { unlockAudio, toggleMute } from './feel/audio.js';
import { startMusic } from './feel/music.js';
import { stageShot } from './shots.js';

const STEP = 1 / 60;
const canvas = document.getElementById('warung');
canvas.width = W;
canvas.height = H;
const ctx = canvas.getContext('2d');
const statusLine = document.getElementById('status');
fitCanvas(canvas);
const input = makeInput(canvas);

const app = {
  save: loadSave(),
  scene: null,
  sceneName: 'title',
  previous: 'title',
  status(text) { statusLine.textContent = text; },
  goto(name) {
    const make = { title: createTitleScene, map: createMapScene, shop: createShopScene, book: createBookScene }[name];
    app.previous = app.sceneName;
    app.sceneName = name;
    app.scene = make(app);
  },
  goBack() { app.goto(app.previous === 'book' ? 'map' : app.previous); },
  startNight(index) {
    app.previous = app.sceneName;
    app.sceneName = 'cook';
    app.scene = createCookScene(app, index);
  },
  startEndless() { app.startNight('endless'); },
  finishNight(run) {
    if (run.night.endless) {
      app.save.bestEndless = Math.max(app.save.bestEndless || 0, run.takings);
      app.save.purse += run.takings;
      writeSave(app.save);
    } else bankNight(app.save, run.index, run.takings, run.stars);
    app.sceneName = 'results';
    app.scene = createResultsScene(app, resultOf(run, app.save));
  },
};

export function resultOf(run, save) {
  return { index: run.index, night: run.night, stars: run.stars, stats: run.stats, takings: run.takings, reviews: run.reviews, walkouts: run.walkouts, purse: save.purse };
}

window.warung = app; // read by tools/playtest.py to check real mouse and keyboard play
app.status(`Moonlit Warung: ${NIGHTS.length} nights, ${RECIPES.length} recipes, ${Object.keys(REGULARS).length} regulars, ${UPGRADES.length} stall upgrades`);

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  stageShot(app, shot, ctx);
} else {
  app.goto('title');
  let last = performance.now(), acc = 0;
  const frame = now => {
    acc += Math.min(0.25, (now - last) / 1000);
    last = now;
    if (input.clicks.length || input.pressed.size) { unlockAudio(); startMusic(); }
    if (input.hit('KeyM')) toggleMute();
    while (acc >= STEP) { app.scene.update(STEP, input); input.endFrame(); acc -= STEP; }
    app.scene.draw(ctx, now / 1000);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
