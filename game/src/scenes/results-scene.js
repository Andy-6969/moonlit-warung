// Closing time: the night's stars, the ledger of plates, tips, combos and walk-outs, and what the
// regulars said on their way home. The takings go into the stall purse for upgrades.
import { W, H } from '../core/screen.js';
import { drawSky, drawLanterns } from '../art/street-art.js';
import { drawDish } from '../art/food-art.js';
import { drawFace } from '../art/people-art.js';
import { REGULARS } from '../service/customers.js';
import { LAST_NIGHT } from '../nights/campaign.js';
import { star } from '../ui/hud.js';
import { panel, button, clicked, inside } from '../ui/widgets.js';

export function createResultsScene(app, result) {
  const buttons = [
    { id: 'next', label: result.index < LAST_NIGHT ? 'Next night' : 'Back to the map', x: 860, y: 690, w: 230, h: 54, primary: true, key: 'SPACE' },
    { id: 'shop', label: 'Upgrades', x: 1100, y: 690, w: 150, h: 54, size: 18 },
    { id: 'retry', label: 'Retry', x: 740, y: 690, w: 110, h: 54, size: 18 },
  ];
  const scene = { hot: null, age: 0 };
  scene.update = (dt, input) => {
    scene.age += dt;
    scene.hot = buttons.find(b => inside(input.mouse, b)) || null;
    const b = clicked(input, buttons);
    if (input.hit('Space') || input.hit('Enter') || b?.id === 'next') {
      if (result.index < LAST_NIGHT && app.save.unlocked > result.index) { app.save.selected = result.index + 1; }
      app.goto('map');
    } else if (b?.id === 'shop') app.goto('shop');
    else if (b?.id === 'retry') app.startNight(result.index);
  };
  scene.draw = (ctx, t) => drawResults(ctx, t, result, scene, buttons);
  return scene;
}

export function drawResults(ctx, t, r, scene, buttons) {
  drawSky(ctx, 0, 0, W, H, t, false);
  drawLanterns(ctx, -20, W + 20, 10, t, 14);
  panel(ctx, 40, 70, 640, 700);
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffcf5a'; ctx.font = 'bold 16px Trebuchet MS, sans-serif'; ctx.fillText(r.night.endless ? 'ENDLESS NIGHT · THE STALL CLOSES' : `NIGHT ${r.night.id} OF 10 · CLOSING TIME`, 70, 104);
  ctx.fillStyle = '#fff3dc'; ctx.font = 'bold 40px Georgia, serif'; ctx.fillText(r.night.name, 70, 146);
  const shown = Math.min(r.stars, Math.floor((scene?.age ?? 9) / 0.4));
  for (let i = 0; i < 3; i++) {
    const big = i < shown;
    ctx.save(); ctx.translate(120 + i * 96, 222); const pop = big ? 1 + Math.max(0, 0.3 - ((scene?.age ?? 9) - i * 0.4)) : 1; ctx.scale(pop, pop);
    star(ctx, 0, 0, 40, big); ctx.restore();
  }
  ctx.fillStyle = '#ffe9c4'; ctx.font = 'bold 20px Trebuchet MS, sans-serif';
  ctx.fillText(['Rough night...', 'The street noticed you', 'A crowd favourite', 'Legend of the night market'][r.stars], 400, 210);
  ctx.font = '14px Trebuchet MS, sans-serif'; ctx.fillStyle = 'rgba(255,233,196,0.7)';
  ctx.fillText(`goals ${r.night.goals.join(' / ')}`, 400, 236);
  const s = r.stats;
  const rows = [
    ['Plates served', s.served, '#ffe9c4'], ['Perfect plates (cheerful guests)', s.perfect, '#7fe07a'], ['Near misses saved', s.nearMiss, '#ffb04a'],
    ['Best rush combo', `x${s.bestCombo}`, '#ff7a4a'], ['Tips', `+${s.tips}`, '#ffcf5a'], ['Walk-outs', s.missed, '#ff6a5a'],
    ['Wrong dishes sent', s.wrong, '#ff9a8a'], ['Burnt pans', s.burnt, '#c0a090'],
  ];
  rows.forEach(([label, v, c], i) => {
    const y = 300 + i * 38;
    ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.07)'; ctx.fillRect(66, y - 17, 590, 34);
    ctx.fillStyle = '#ffe9c4'; ctx.font = '18px Trebuchet MS, sans-serif'; ctx.textAlign = 'left'; ctx.fillText(label, 80, y);
    ctx.fillStyle = c; ctx.font = 'bold 22px Trebuchet MS, sans-serif'; ctx.textAlign = 'right'; ctx.fillText(String(v), 640, y);
  });
  ctx.textAlign = 'left'; ctx.fillStyle = '#ffcf5a'; ctx.font = 'bold 30px Georgia, serif'; ctx.fillText(`Takings: ${r.takings} coins`, 70, 640);
  ctx.fillStyle = 'rgba(255,233,196,0.8)'; ctx.font = '15px Trebuchet MS, sans-serif'; ctx.fillText(`Into the stall purse: ${r.purse} coins to spend on upgrades`, 70, 676);
  ctx.fillText(r.stars ? (r.index < LAST_NIGHT ? `Night ${r.index + 2} unlocked` : 'Campaign complete: the full moon is yours') : 'Earn one star to unlock the next night', 70, 704);
  panel(ctx, 710, 70, 540, 600);
  ctx.fillStyle = '#ffcf5a'; ctx.font = 'bold 16px Trebuchet MS, sans-serif'; ctx.textAlign = 'left'; ctx.fillText('WHAT THE REGULARS SAID', 736, 104);
  const reviews = pickReviews(r.reviews, r.walkouts);
  reviews.forEach((rv, i) => {
    const y = 160 + i * 98;
    drawFace(ctx, rv.who, 770, y, 56, rv.stars >= 3 ? 2 : rv.stars === 2 ? 1 : rv.stars === 1 ? 0 : -1);
    ctx.fillStyle = '#fff3dc'; ctx.font = 'bold 16px Trebuchet MS, sans-serif'; ctx.textAlign = 'left'; ctx.fillText(REGULARS[rv.who].name, 812, y - 22);
    for (let k = 0; k < 3; k++) star(ctx, 1000 + k * 20, y - 22, 8, rv.stars > k);
    ctx.fillStyle = rv.stars ? '#e9cfa8' : '#ff8a7a'; ctx.font = 'italic 17px Georgia, serif'; ctx.fillText(`"${rv.text}"`, 812, y + 4);
    if (rv.dish) drawDish(ctx, rv.dish, 1200, y, 56);
  });
  if (buttons) for (const b of buttons) button(ctx, b, scene?.hot === b, t);
}

function pickReviews(reviews, walkouts = []) {
  const best = [...reviews].sort((a, b) => b.stars - a.stars);
  const seen = new Set();
  const out = [];
  for (const rv of [...best.slice(0, 3), ...walkouts.slice(0, 1).map(w => ({ who: w, text: REGULARS[w].lines.angry, stars: 0 })), ...best.slice(3)]) {
    if (seen.has(rv.who) || out.length >= 5) continue;
    seen.add(rv.who); out.push(rv);
  }
  return out;
}
