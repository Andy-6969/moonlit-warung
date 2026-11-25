// The service HUD: the night and its clock across the top (a moon dial that drains, red and ticking in
// the last 20 seconds), takings against the three star goals, and along the bottom what you hold,
// what it needs next, the rush combo and the controls.
import { secondsLeft } from '../service/night-run.js';
import { comboMultiplier } from '../service/scoring.js';
import { drawFood, drawPlate } from '../art/food-art.js';
import { nameOf, nextStationFor } from '../food/ingredients.js';
import { recipeOfPlate, missingParts } from '../food/recipes.js';
import { ENDLESS_STRIKES } from '../service/difficulty.js';
import { EVENTS } from '../service/events.js';

const CREAM = '#ffe9c4';

export function drawLogo(ctx, x, y, size = 26) {
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.font = `bold ${size}px Georgia, serif`;
  ctx.fillStyle = '#ffcf5a'; ctx.fillText('MOONLIT', x, y);
  const w = ctx.measureText('MOONLIT ').width;
  ctx.fillStyle = '#ff7a4a'; ctx.fillText('WARUNG', x + w, y);
}

export function star(ctx, x, y, r, filled) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fillStyle = filled ? '#ffcf3a' : 'rgba(255,255,255,0.12)'; ctx.fill();
  ctx.strokeStyle = filled ? '#8a5a00' : 'rgba(255,233,196,0.5)'; ctx.lineWidth = 2; ctx.stroke();
}

export function drawTopBar(ctx, run, t) {
  const g = ctx.createLinearGradient(0, 0, 0, 60);
  g.addColorStop(0, '#2b1830'); g.addColorStop(1, '#1d1224');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1280, 60);
  drawLogo(ctx, 18, 22, 24);
  ctx.fillStyle = CREAM; ctx.font = '14px Trebuchet MS, sans-serif';
  ctx.fillText(`${run.night.endless ? 'Endless' : `Night ${run.night.id} of 10`} · ${run.night.name} · ${run.difficulty?.name || 'Classic'}`, 18, 46);

  drawEventCard(ctx, run, t);
  if (run.night.endless) return drawEndlessClock(ctx, run, t);
  const left = secondsLeft(run), share = left / run.night.seconds;
  const late = left <= 20;
  const cx = 640, cy = 30;
  const pulse = late ? 1 + 0.08 * Math.max(0, Math.sin(t * 12)) : 1;
  ctx.save(); ctx.translate(cx - 70, cy); ctx.scale(pulse, pulse);
  ctx.fillStyle = '#120c1c'; ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = late ? '#ff4a3a' : '#ffe9a8';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 21, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * share); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = CREAM; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
  const mm = Math.floor(left / 60), ss = Math.floor(left % 60);
  ctx.font = `bold ${late ? 36 : 32}px Trebuchet MS, sans-serif`; ctx.textAlign = 'left';
  ctx.fillStyle = late ? '#ff5a4a' : CREAM;
  ctx.fillText(`${mm}:${String(ss).padStart(2, '0')}`, cx - 36, cy + 2);
  ctx.font = 'bold 11px Trebuchet MS, sans-serif'; ctx.fillStyle = 'rgba(255,233,196,0.7)';
  ctx.fillText(run.rush ? 'RUSH HOUR' : 'UNTIL CLOSING', cx + 54, cy + 2);

  const goals = run.night.goals, top = goals[2];
  const bx = 900, bw = 250, by = 36;
  ctx.font = 'bold 22px Trebuchet MS, sans-serif'; ctx.textAlign = 'right'; ctx.fillStyle = '#ffcf5a';
  ctx.fillText(`${run.takings}`, 1262, 22);
  ctx.font = '12px Trebuchet MS, sans-serif'; ctx.fillStyle = CREAM; ctx.fillText('coins tonight', 1262, 44);
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(bx, by - 5, bw, 10);
  ctx.fillStyle = '#ffcf5a'; ctx.fillRect(bx, by - 5, bw * Math.min(1, run.takings / top), 10);
  goals.forEach(gv => star(ctx, bx + bw * (gv / top), by, 11, run.takings >= gv));
  ctx.fillStyle = CREAM; ctx.font = '11px Trebuchet MS, sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('star goals', bx, 14);
}

/** The market event in play: its name, what it changes and a draining bar; else the next one coming. */
function drawEventCard(ctx, run, t) {
  const x = 288, y = 6, w = 246, h = 48;
  const ev = run.event && EVENTS[run.event.id];
  const next = !ev && run.eventQueue?.[0];
  if (!ev && !next) return;
  ctx.fillStyle = ev ? 'rgba(40,18,30,0.95)' : 'rgba(40,28,52,0.7)';
  ctx.strokeStyle = ev ? ev.color : 'rgba(255,233,196,0.3)'; ctx.lineWidth = ev ? 2 + Math.max(0, Math.sin(t * 6)) : 1;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 8); ctx.fill(); ctx.stroke();
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  if (!ev) {
    const inSecs = Math.max(0, Math.ceil(next.at * run.night.seconds - run.time));
    const coming = EVENTS[next.id];
    ctx.fillStyle = 'rgba(255,233,196,0.6)'; ctx.font = 'bold 10px Trebuchet MS, sans-serif'; ctx.fillText('NEXT MARKET EVENT', x + 10, y + 15);
    ctx.fillStyle = coming.color; ctx.font = 'bold 13px Trebuchet MS, sans-serif'; ctx.fillText(`${coming.name} in ${inSecs}s`, x + 10, y + 33);
    return;
  }
  ctx.fillStyle = ev.color; ctx.font = 'bold 10px Trebuchet MS, sans-serif'; ctx.fillText('EVENT', x + 10, y + 13);
  ctx.font = 'bold 14px Trebuchet MS, sans-serif'; ctx.fillText(ev.name, x + 52, y + 13);
  ctx.textAlign = 'right'; ctx.fillStyle = CREAM; ctx.fillText(`0:${String(Math.ceil(run.event.left)).padStart(2, '0')}`, x + w - 10, y + 13);
  ctx.textAlign = 'left'; ctx.font = '12px Trebuchet MS, sans-serif'; ctx.fillText(ev.text, x + 10, y + 30);
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(x + 10, y + 40, w - 20, 4);
  ctx.fillStyle = ev.color; ctx.fillRect(x + 10, y + 40, (w - 20) * run.event.left / run.event.secs, 4);
}

/** Endless: a count-up clock and the three walk-out strikes instead of closing time and star goals. */
function drawEndlessClock(ctx, run, t) {
  const m = Math.floor(run.time / 60), s = Math.floor(run.time % 60);
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.font = 'bold 32px Trebuchet MS, sans-serif'; ctx.fillStyle = CREAM;
  ctx.fillText(`${m}:${String(s).padStart(2, '0')}`, 570, 30);
  ctx.font = 'bold 11px Trebuchet MS, sans-serif'; ctx.fillStyle = 'rgba(255,233,196,0.7)'; ctx.fillText('ENDLESS · OPEN FOR', 680, 22);
  for (let i = 0; i < ENDLESS_STRIKES; i++) {
    const hit = i < run.stats.missed;
    ctx.fillStyle = hit ? '#ff4a3a' : 'rgba(255,255,255,0.15)'; ctx.beginPath(); ctx.arc(690 + i * 22, 42, 8, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = CREAM; ctx.lineWidth = 1.5; ctx.stroke();
  }
  ctx.font = 'bold 22px Trebuchet MS, sans-serif'; ctx.textAlign = 'right'; ctx.fillStyle = '#ffcf5a';
  ctx.fillText(`${run.takings}`, 1262, 22);
  ctx.font = '12px Trebuchet MS, sans-serif'; ctx.fillStyle = CREAM; ctx.fillText('coins · walk-outs end the night', 1262, 44);
}

/** What the held item still needs, as a short instruction. */
export function heldHint(run) {
  const h = run.chef.held;
  if (!h) return 'Hands free: grab from a crate or take a leaf plate';
  if (h.id === 'plate') {
    if (!h.parts.length) return 'Empty plate: set it on a counter or add food to it';
    const dish = recipeOfPlate(h.parts);
    if (dish) return `${dish.name} is ready: carry it to the SERVE pass`;
    const m = missingParts(h.parts, run.night.menu);
    return m ? `${m.recipe.name}: still needs ${m.miss.map(nameOf).join(' + ')}` : 'This plate fits no dish tonight';
  }
  const next = nextStationFor(h.id);
  const where = { board: 'chop it on a board', mortar: 'pound it in the cobek', grill: 'put it on the grill', wok: 'fry it in a wok', bin: 'throw it in the scraps', plate: 'put it on a plate' }[next];
  return `${nameOf(h.id)}: ${where}`;
}

/** An empty open palm: the cook's hands are free. */
function drawOpenHand(ctx, x, y) {
  ctx.fillStyle = '#e8b88a'; ctx.strokeStyle = '#6b3f22'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(x - 8, y - 4, 16, 14, 5); ctx.fill(); ctx.stroke();
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.roundRect(x - 8 + i * 4.2, y - 13 + (i === 0 || i === 3 ? 2 : 0), 3.6, 11, 2); ctx.fill(); ctx.stroke(); }
  ctx.save(); ctx.translate(x - 9, y + 1); ctx.rotate(-0.7);
  ctx.beginPath(); ctx.roundRect(-2, -8, 4, 10, 2); ctx.fill(); ctx.stroke(); ctx.restore();
}

export function drawBottomBar(ctx, run, t) {
  ctx.fillStyle = '#1d1224'; ctx.fillRect(0, 758, 1280, 42);
  ctx.fillStyle = '#2f2238'; ctx.beginPath(); ctx.roundRect(12, 762, 50, 34, 6); ctx.fill();
  const h = run.chef.held;
  if (h) h.id === 'plate' ? drawPlate(ctx, h, 37, 779, 44) : drawFood(ctx, h.id, 37, 779, 36);
  else drawOpenHand(ctx, 37, 781);
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffcf5a'; ctx.font = 'bold 12px Trebuchet MS, sans-serif'; ctx.fillText('HOLDING', 72, 770);
  ctx.fillStyle = CREAM; ctx.font = 'bold 15px Trebuchet MS, sans-serif'; ctx.fillText(heldHint(run), 72, 788);

  const cx = 640;
  const mult = comboMultiplier(run.combo);
  const window = run.mods.comboWindow;
  const left = Math.max(0, window - (run.time - run.lastServe));
  ctx.fillStyle = run.combo > 1 ? '#ff7a4a' : 'rgba(255,233,196,0.5)';
  ctx.font = `bold ${run.combo > 1 ? 20 : 15}px Trebuchet MS, sans-serif`;
  ctx.fillText(run.combo > 1 ? `RUSH COMBO x${run.combo}  +${Math.round((mult - 1) * 100)}%` : 'Serve back to back for a rush combo', cx, 776);
  if (run.combo > 0) {
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(cx, 790, 200, 5);
    ctx.fillStyle = '#ff7a4a'; ctx.fillRect(cx, 790, 200 * (left / window), 5);
  }
  ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(255,233,196,0.7)'; ctx.font = '12px Trebuchet MS, sans-serif';
  ctx.fillText('WASD / arrows: walk · SPACE: use, tap to chop', 1268, 771);
  ctx.fillText('Mouse: click a station to walk there · P: pause', 1268, 789);
}

/** A banner across the kitchen ("RUSH HOUR!", "LAST 20 SECONDS"). */
export function drawBanner(ctx, text, sub, t, color = '#ff7a4a') {
  const y = 470;
  ctx.save();
  ctx.globalAlpha = 0.92;
  ctx.fillStyle = 'rgba(20,10,30,0.82)'; ctx.fillRect(20, y - 40, 910, 80);
  ctx.fillStyle = color; ctx.fillRect(20, y - 40, 910, 5); ctx.fillRect(20, y + 35, 910, 5);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = 'bold 42px Georgia, serif'; ctx.fillStyle = color; ctx.fillText(text, 475, y - 6);
  ctx.font = '16px Trebuchet MS, sans-serif'; ctx.fillStyle = CREAM; ctx.fillText(sub, 475, y + 24);
  ctx.restore();
}
