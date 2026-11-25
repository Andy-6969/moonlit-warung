// A night of service on screen: reads the keyboard and mouse, walks the cook, uses stations,
// and paints the whole kitchen, rail, street and HUD every frame.
import { moveChef, targetStation, planRoute, faceStation, chefTile } from '../kitchen/chef.js';
import { interact } from '../kitchen/stations.js';
import { createRun, updateRun, secondsLeft } from '../service/night-run.js';
import { stationAt } from '../kitchen/grid.js';
import { W, H, KITCHEN, tileCenter } from '../core/screen.js';
import { drawFloor, drawStations, stationLabel } from '../art/kitchen-art.js';
import { drawChef } from '../art/people-art.js';
import { drawFood, drawPlate } from '../art/food-art.js';
import { drawStreet } from '../art/street-art.js';
import { drawTicketRail } from '../ui/ticket-rail.js';
import { drawTopBar, drawBottomBar, drawBanner } from '../ui/hud.js';
import { makeFx } from '../feel/reactions.js';
import { makeFeel, tickFeel, drawFeel, drawFlash } from '../feel/particles.js';
import { SFX } from '../feel/audio.js';
import { setMusicTempo } from '../feel/music.js';
import { newDishes } from '../nights/campaign.js';
import { RECIPE_BY_ID } from '../food/recipes.js';
import { drawDish } from '../art/food-art.js';

export function createCookScene(app, index, opts = {}) {
  const feel = makeFeel();
  const fx = makeFx(feel, app.status);
  const run = createRun(index, app.save, fx, opts.seed);
  const scene = { run, feel, intro: opts.skipIntro ? 0 : 3.2, banner: null, paused: false, closing: 0, hover: null, chopHold: 0, lastTick: -1, wasRush: false };

  function useStation(st) {
    if (!st) return;
    faceStation(run.chef, st);
    interact(run, st);
  }

  scene.update = (dt, input) => {
    tickFeel(feel, dt);
    if (input.hit('KeyP') || input.hit('Escape')) scene.paused = !scene.paused;
    if (scene.paused) { if (input.clicks.length) scene.paused = false; return; }
    if (scene.intro > 0) {
      scene.intro -= dt;
      if (input.hit('Space') || input.hit('Enter') || input.clicks.length) scene.intro = 0;
      return;
    }
    if (run.over) {
      scene.closing += dt;
      if (scene.closing > 2.2) app.finishNight(run);
      return;
    }
    updateRun(run, dt);
    const chef = run.chef;
    chef.busy = Math.max(0, chef.busy - dt);
    moveChef(chef, run.k, input.axis(), dt, run.mods.walk);
    if (chef.goal && !chef.route.length) { const g = chef.goal; chef.goal = null; useStation(g); }

    const target = targetStation(chef, run.k);
    if (input.hit('Space') || input.hit('KeyE')) { useStation(target); scene.chopHold = 0; }
    else if ((input.down.has('Space') || input.down.has('KeyE')) && target && (target.kind === 'board' || target.kind === 'mortar') && target.item) {
      scene.chopHold += dt;
      if (scene.chopHold > 0.16) { scene.chopHold = 0; useStation(target); }
    }

    const m = input.mouse;
    const c = Math.floor((m.x - KITCHEN.x) / KITCHEN.tile), r = Math.floor((m.y - KITCHEN.y) / KITCHEN.tile);
    scene.hover = stationAt(run.k, c, r);
    for (const click of input.clicks) {
      const cc = Math.floor((click.x - KITCHEN.x) / KITCHEN.tile), rr = Math.floor((click.y - KITCHEN.y) / KITCHEN.tile);
      if (cc < 0 || rr < 0 || cc >= run.k.cols || rr >= run.k.rows) continue;
      const st = stationAt(run.k, cc, rr);
      const here = chefTile(chef);
      if (st && Math.abs(st.col - here.c) + Math.abs(st.row - here.r) === 1) useStation(st);
      else planRoute(chef, run.k, st || { col: cc, row: rr });
    }

    if (run.rush && !scene.wasRush) scene.banner = { text: 'RUSH HOUR!', sub: 'The street floods in: orders come twice as fast', life: 2.4, color: '#ff7a4a' };
    scene.wasRush = run.rush;
    const left = Math.ceil(secondsLeft(run));
    if (left <= 20 && left !== scene.lastTick) { scene.lastTick = left; SFX.tick(); if (left === 20) scene.banner = { text: 'LAST 20 SECONDS', sub: 'Plate what you have, the gong is coming', life: 2, color: '#ff5a4a' }; }
    setMusicTempo(run.rush || left <= 20 ? 1.35 : 1);
    if (scene.banner) { scene.banner.life -= dt; if (scene.banner.life <= 0) scene.banner = null; }
  };

  scene.draw = (ctx, t) => {
    ctx.fillStyle = '#140d1a'; ctx.fillRect(0, 0, W, H);
    ctx.save();
    if (feel.shake) ctx.translate((Math.random() - 0.5) * feel.shake, (Math.random() - 0.5) * feel.shake);
    drawTopBar(ctx, run, t);
    const plateParts = run.chef.held?.id === 'plate' ? run.chef.held.parts : [];
    drawTicketRail(ctx, run, t, plateParts);
    drawFloor(ctx, run.k, run.night.dark && Math.sin(t * 7) > 0.9);
    const target = run.over || run.chef.route.length ? null : targetStation(run.chef, run.k);
    drawStations(ctx, run.k, t, target, run.mods.burnDelay);
    drawRoute(ctx, run.chef, t);
    const p = { x: KITCHEN.x + run.chef.x * KITCHEN.tile, y: KITCHEN.y + run.chef.y * KITCHEN.tile };
    drawChef(ctx, run.chef, p.x, p.y, t, (hx, hy) => {
      const h = run.chef.held;
      if (!h) return;
      if (h.id === 'plate') drawPlate(ctx, h, hx, hy, 62);
      else drawFood(ctx, h.id, hx, hy, 46);
    });
    drawStreet(ctx, run, t);
    if (scene.hover && !run.over) hoverTip(ctx, scene.hover);
    drawFeel(ctx, feel);
    ctx.restore();
    drawBottomBar(ctx, run, t);
    if (scene.banner) drawBanner(ctx, scene.banner.text, scene.banner.sub, t, scene.banner.color);
    if (run.over) drawBanner(ctx, 'CLOSING TIME', `${run.stats.served} plates served · ${run.takings} coins`, t, '#ffcf5a');
    if (scene.intro > 0) drawIntro(ctx, run, index, t);
    if (scene.paused) drawBanner(ctx, 'PAUSED', 'Press P or click to keep cooking', t, '#9ad0ff');
    drawFlash(ctx, feel, W, H);
  };
  return scene;
}

function drawRoute(ctx, chef, t) {
  if (!chef.route.length) return;
  const pts = [{ x: KITCHEN.x + chef.x * KITCHEN.tile, y: KITCHEN.y + chef.y * KITCHEN.tile }, ...chef.route.map(s => tileCenter(s.c, s.r))];
  if (chef.goal) { const g = tileCenter(chef.goal.col, chef.goal.row); const last = pts[pts.length - 1]; pts.push({ x: (last.x + g.x) / 2, y: (last.y + g.y) / 2 }); }
  ctx.strokeStyle = 'rgba(255,246,168,0.55)'; ctx.lineWidth = 4; ctx.setLineDash([10, 10]); ctx.lineDashOffset = -t * 40;
  ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(255,246,168,0.95)';
  pts.slice(1).forEach((c, i) => { ctx.beginPath(); ctx.arc(c.x, c.y, 6 + Math.sin(t * 8 - i) * 1.5, 0, Math.PI * 2); ctx.fill(); });
}

function hoverTip(ctx, st) {
  const c = tileCenter(st.col, st.row);
  const text = stationLabel(st);
  ctx.font = 'bold 13px Trebuchet MS, sans-serif';
  const w = ctx.measureText(text).width + 14;
  ctx.fillStyle = 'rgba(20,10,30,0.85)'; ctx.beginPath(); ctx.roundRect(c.x - w / 2, c.y - 52, w, 20, 6); ctx.fill();
  ctx.fillStyle = '#fff6a8'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, c.x, c.y - 42);
}

function drawIntro(ctx, run, index, t) {
  ctx.fillStyle = 'rgba(12,8,20,0.82)'; ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffcf5a'; ctx.font = 'bold 22px Trebuchet MS, sans-serif'; ctx.fillText(`NIGHT ${run.night.id} OF 7`, W / 2, 230);
  ctx.fillStyle = '#fff3dc'; ctx.font = 'bold 56px Georgia, serif'; ctx.fillText(run.night.name, W / 2, 290);
  ctx.fillStyle = '#e9cfa8'; ctx.font = 'italic 20px Georgia, serif'; ctx.fillText(run.night.place, W / 2, 336);
  ctx.fillStyle = '#ff9a6a'; ctx.font = 'bold 20px Trebuchet MS, sans-serif'; ctx.fillText(run.night.twist, W / 2, 380);
  const fresh = newDishes(index);
  ctx.fillStyle = '#fff3dc'; ctx.font = '16px Trebuchet MS, sans-serif'; ctx.fillText(fresh.length ? 'New on the menu tonight' : 'Same menu, bigger crowd', W / 2, 430);
  fresh.forEach((rid, i) => {
    const x = W / 2 + (i - (fresh.length - 1) / 2) * 170;
    drawDish(ctx, rid, x, 500, 110);
    ctx.fillStyle = '#ffe9c4'; ctx.font = 'bold 16px Georgia, serif'; ctx.fillText(RECIPE_BY_ID[rid].name, x, 568);
  });
  ctx.fillStyle = 'rgba(255,233,196,0.7)'; ctx.font = '14px Trebuchet MS, sans-serif';
  ctx.fillText('Press SPACE or click to open the stall', W / 2, 640);
}
