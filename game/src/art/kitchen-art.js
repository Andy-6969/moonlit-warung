// The stall itself: terracotta floor, teak counters, and every station drawn so it reads at a glance
// (a big picture of what it holds, a label tag, and a progress ring while it works).
import { KITCHEN, tileCenter } from '../core/screen.js';
import { drawFood, drawPlate, drawSteam } from './food-art.js';
import { RAW } from '../food/ingredients.js';
import { STATION_LABELS } from '../kitchen/grid.js';
import { recipeOfPlate } from '../food/recipes.js';

const T = KITCHEN.tile;
const INK = '#3b2314';
let burnDelay = 7;

export function drawFloor(ctx, k, dark) {
  for (let r = 0; r < k.rows; r++) for (let c = 0; c < k.cols; c++) {
    const x = KITCHEN.x + c * T, y = KITCHEN.y + r * T;
    const alt = (c + r) % 2;
    ctx.fillStyle = alt ? '#c7754a' : '#b9673f';
    ctx.fillRect(x, y, T, T);
    ctx.strokeStyle = 'rgba(80,30,10,0.35)'; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, T - 2, T - 2);
    ctx.fillStyle = 'rgba(255,230,190,0.08)';
    ctx.beginPath(); ctx.moveTo(x + T / 2, y + 10); ctx.lineTo(x + T - 10, y + T / 2); ctx.lineTo(x + T / 2, y + T - 10); ctx.lineTo(x + 10, y + T / 2); ctx.closePath(); ctx.fill();
  }
  if (dark) { ctx.fillStyle = 'rgba(10,10,40,0.28)'; ctx.fillRect(KITCHEN.x, KITCHEN.y, k.cols * T, k.rows * T); }
}

function counterBlock(ctx, x, y, top = '#a8703f', face = '#7c4a24') {
  ctx.fillStyle = face; ctx.fillRect(x, y + T - 14, T, 14);
  ctx.fillStyle = top; ctx.fillRect(x, y, T, T - 12);
  ctx.strokeStyle = 'rgba(60,30,10,0.35)'; ctx.lineWidth = 1;
  for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x, y + i * 14); ctx.lineTo(x + T, y + i * 14 + 2); ctx.stroke(); }
  ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, T - 2, T - 2);
}

function ring(ctx, x, y, r, p, color, back = 'rgba(0,0,0,0.45)') {
  ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.strokeStyle = back; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = color; ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p); ctx.stroke();
}

function tag(ctx, x, y, text, bg = '#2b1d14', fg = '#ffe9c4') {
  ctx.font = 'bold 11px Trebuchet MS, sans-serif';
  const w = ctx.measureText(text).width + 10;
  ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(x - w / 2, y - 8, w, 16, 5); ctx.fill();
  ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x, y + 0.5);
}

function crate(ctx, st, x, y) {
  ctx.fillStyle = '#8a5a2b'; ctx.fillRect(x + 4, y + 6, T - 8, T - 14);
  ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(x + 4, y + 6, T - 8, T - 14);
  ctx.fillStyle = '#5e3a1a'; ctx.fillRect(x + 8, y + 10, T - 16, T - 22);
  const s = T * 0.86 * (1 + st.pop * 0.18);
  drawFood(ctx, st.ing, x + T / 2, y + T / 2 - 2, s);
  tag(ctx, x + T / 2, y + T - 7, RAW[st.ing].crate);
}

function board(ctx, st, x, y, t) {
  const sx = (Math.random() - 0.5) * st.shake * 4;
  ctx.fillStyle = '#e2b679'; ctx.strokeStyle = INK; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(x + 8 + sx, y + 10, T - 16, T - 24, 8); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(120,70,30,0.35)'; ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(x + 14, y + 20 + i * 10); ctx.lineTo(x + T - 14, y + 18 + i * 10); ctx.stroke(); }
  ctx.fillStyle = '#d8dde4'; ctx.strokeStyle = INK;
  ctx.save(); ctx.translate(x + T - 16 + sx, y + 18); ctx.rotate(0.6 - st.shake * 0.8);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(24, -4); ctx.lineTo(24, 6); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#4a2a14'; ctx.fillRect(-12, -2, 12, 6);
  ctx.restore();
  if (st.item) drawFood(ctx, st.item.id, x + T / 2 + sx, y + T / 2 - 4, T * 0.62);
  if (st.item && st.progress > 0) ring(ctx, x + T / 2, y + T / 2 - 4, T * 0.36, st.progress, '#7fe07a');
  tag(ctx, x + T / 2, y + T - 7, 'Board');
}

function mortar(ctx, st, x, y) {
  const sy = st.shake * 3;
  ctx.fillStyle = '#5b5552'; ctx.strokeStyle = INK; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(x + T / 2, y + T / 2, T * 0.36, T * 0.28, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#7a7471'; ctx.beginPath(); ctx.ellipse(x + T / 2, y + T / 2 - 2, T * 0.28, T * 0.2, 0, 0, Math.PI * 2); ctx.fill();
  if (st.item) drawFood(ctx, st.item.id, x + T / 2, y + T / 2 - 2, T * 0.5);
  ctx.fillStyle = '#8d8682'; ctx.save(); ctx.translate(x + T * 0.68, y + T * 0.28 + sy); ctx.rotate(-0.7);
  ctx.beginPath(); ctx.roundRect(-5, -16, 10, 30, 5); ctx.fill(); ctx.stroke(); ctx.restore();
  if (st.item && st.progress > 0) ring(ctx, x + T / 2, y + T / 2, T * 0.36, st.progress, '#ffb04a');
  tag(ctx, x + T / 2, y + T - 7, 'Cobek');
}

function flames(ctx, x, y, w, t, hot) {
  for (let i = 0; i < 7; i++) {
    const fx = x - w / 2 + (i + 0.5) * (w / 7);
    const h = (hot ? 12 : 6) + Math.sin(t * 18 + i * 1.7) * 4;
    ctx.fillStyle = i % 2 ? '#3aa0ff' : '#ff9a2a';
    ctx.beginPath(); ctx.moveTo(fx - 4, y); ctx.quadraticCurveTo(fx, y - h * 1.4, fx + 4, y); ctx.fill();
  }
}

function wok(ctx, st, x, y, t) {
  const cx = x + T / 2, cy = y + T / 2;
  ctx.fillStyle = '#2d2d33'; ctx.fillRect(x + 6, y + 8, T - 12, T - 18);
  ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(x + 6, y + 8, T - 12, T - 18);
  const busy = st.state === 'cooking' || st.state === 'done';
  if (st.contents.length || st.state !== 'idle') flames(ctx, cx, cy + T * 0.3, T * 0.6, t, busy);
  const g = ctx.createRadialGradient(cx - 6, cy - 8, 2, cx, cy, T * 0.36);
  g.addColorStop(0, '#6b6b72'); g.addColorStop(1, '#151518');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, T * 0.34, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#3a2416'; ctx.fillRect(cx + T * 0.3, cy - 4, T * 0.22, 8);
  const shownId = st.state === 'done' ? st.result : st.state === 'burnt' ? 'burnt' : null;
  if (shownId) drawFood(ctx, shownId, cx, cy, T * 0.55);
  else st.contents.forEach((id, i) => drawFood(ctx, id, cx + (i - (st.contents.length - 1) / 2) * 14, cy + Math.sin(t * 9 + i) * 2, T * 0.42));
  if (st.state === 'cooking') { ring(ctx, cx, cy, T * 0.4, st.cook, '#ffd24a'); drawSteam(ctx, cx, cy - 8, T * 0.6, t, 0.45); }
  if (st.state === 'waiting') tag(ctx, cx, y + 14, '+ egg?', '#7a1f1f');
  fireState(ctx, st, cx, cy, t);
  tag(ctx, cx, y + T - 7, 'Wok');
}

function grill(ctx, st, x, y, t) {
  const cx = x + T / 2, cy = y + T / 2;
  ctx.fillStyle = '#3a2a22'; ctx.strokeStyle = INK; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(x + 5, y + 8, T - 10, T - 18, 4); ctx.fill(); ctx.stroke();
  for (let i = 0; i < 9; i++) {
    const glow = 0.5 + 0.5 * Math.sin(t * 3 + i * 1.9);
    ctx.fillStyle = `rgb(${200 + glow * 55},${60 + glow * 70},${20})`;
    ctx.beginPath(); ctx.arc(x + 14 + (i % 3) * 20, y + 18 + Math.floor(i / 3) * 12, 5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.strokeStyle = '#a7a7ad'; ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(x + 10 + i * 12, y + 10); ctx.lineTo(x + 10 + i * 12, y + T - 12); ctx.stroke(); }
  const shownId = st.state === 'done' ? st.result : st.state === 'burnt' ? 'burnt' : st.contents[0];
  if (shownId) drawFood(ctx, shownId, cx, cy - 2, T * 0.62);
  if (st.state === 'cooking') { ring(ctx, cx, cy, T * 0.4, st.cook, '#ff8a3a'); drawSteam(ctx, cx, cy - 6, T * 0.6, t, 0.35); }
  fireState(ctx, st, cx, cy, t);
  tag(ctx, cx, y + T - 7, 'Grill');
}

/** Done food glows and then smokes before it burns: the warning you can see across the room. */
function fireState(ctx, st, cx, cy, t) {
  if (st.state === 'done') {
    const left = 1 - st.burn / burnDelay;
    ring(ctx, cx, cy, T * 0.4, Math.max(0, left), left > 0.4 ? '#7fe07a' : '#ff4a3a');
    if (left < 0.45 && Math.sin(t * 16) > 0) tag(ctx, cx, cy - T * 0.52, 'TAKE IT!', '#c0261d', '#fff');
    else tag(ctx, cx, cy - T * 0.52, 'READY', '#2f7d2c', '#fff');
  }
  if (st.state === 'burnt') {
    drawSteam(ctx, cx, cy - 6, T * 0.8, t, 0.85);
    tag(ctx, cx, cy - T * 0.52, 'BURNT', '#111', '#ff6a4a');
  }
}

function plates(ctx, st, x, y) {
  counterBlock(ctx, x, y);
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = '#fbf7ef'; ctx.strokeStyle = INK; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.ellipse(x + T / 2, y + T / 2 + 8 - i * 5, T * 0.34, T * 0.22, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  drawPlate(ctx, { parts: [] }, x + T / 2, y + T / 2 - 12, T * (0.7 + st.pop * 0.12));
  tag(ctx, x + T / 2, y + T - 7, 'Plates');
}

function bin(ctx, st, x, y) {
  counterBlock(ctx, x, y);
  ctx.fillStyle = '#b98a4a'; ctx.strokeStyle = INK; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(x + T / 2, y + T / 2 - 4, T * 0.3, T * 0.24, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#2b1d14'; ctx.beginPath(); ctx.ellipse(x + T / 2, y + T / 2 - 4, T * 0.22, T * 0.16, 0, 0, Math.PI * 2); ctx.fill();
  tag(ctx, x + T / 2, y + T - 7, 'Scraps');
}

function pass(ctx, st, x, y, t) {
  ctx.fillStyle = '#d9a441'; ctx.fillRect(x, y, T, T);
  ctx.fillStyle = '#f4d27a'; ctx.fillRect(x + 4, y + 4, T - 8, T - 8);
  ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, T - 2, T - 2);
  ctx.fillStyle = 'rgba(120,60,10,0.5)';
  const a = (t * 2) % 1;
  for (let i = 0; i < 2; i++) {
    const ax = x + 18 + ((i * 0.5 + a) % 1) * 30;
    ctx.beginPath(); ctx.moveTo(ax, y + T / 2 - 9); ctx.lineTo(ax + 10, y + T / 2); ctx.lineTo(ax, y + T / 2 + 9); ctx.fill();
  }
  tag(ctx, x + T / 2, y + T - 9, 'SERVE', '#7a1f1f', '#ffe9c4');
}

/** Draws every station of the kitchen; `target` gets a bright outline (where Space will act). */
export function drawStations(ctx, k, t, target, burnAfter = 7) {
  burnDelay = burnAfter;
  for (const st of k.stations) {
    const x = KITCHEN.x + st.col * T, y = KITCHEN.y + st.row * T;
    switch (st.kind) {
      case 'crate': counterBlock(ctx, x, y, '#7c5230', '#5a3818'); crate(ctx, st, x, y); break;
      case 'board': counterBlock(ctx, x, y); board(ctx, st, x, y, t); break;
      case 'mortar': counterBlock(ctx, x, y); mortar(ctx, st, x, y); break;
      case 'wok': wok(ctx, st, x, y, t); break;
      case 'grill': grill(ctx, st, x, y, t); break;
      case 'plates': plates(ctx, st, x, y); break;
      case 'bin': bin(ctx, st, x, y); break;
      case 'pass': pass(ctx, st, x, y, t); break;
      case 'mat':
        counterBlock(ctx, x, y);
        ctx.fillStyle = '#4f9a3a'; ctx.strokeStyle = '#24561c'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(x + 6, y + 6, T - 12, T - 20, 10); ctx.fill(); ctx.stroke();
        break;
      default: counterBlock(ctx, x, y);
    }
    if (st.item && st.kind !== 'board' && st.kind !== 'mortar') {
      const s = T * (0.95 + st.pop * 0.15);
      if (st.item.id === 'plate') {
        const dish = recipeOfPlate(st.item.parts);
        drawPlate(ctx, st.item, x + T / 2, y + T / 2 - 4, s, dish ? 0.7 + 0.3 * Math.sin(t * 4) : 0);
        if (dish) tag(ctx, x + T / 2, y + 8, `${dish.name} ✓`, '#2f7d2c', '#fff');
        else if (st.item.parts.length) tag(ctx, x + T / 2, y + 8, `${st.item.parts.length} part${st.item.parts.length > 1 ? 's' : ''}...`, '#6a4a1a', '#ffe9c4');
      } else drawFood(ctx, st.item.id, x + T / 2, y + T / 2 - 4, T * 0.66);
    }
    if (target === st) {
      ctx.strokeStyle = '#fff6a8'; ctx.lineWidth = 4; ctx.setLineDash([8, 5]); ctx.lineDashOffset = -t * 30;
      ctx.strokeRect(x + 3, y + 3, T - 6, T - 6); ctx.setLineDash([]);
    }
  }
}

export function stationLabel(st) {
  return st.kind === 'crate' ? RAW[st.ing].crate : STATION_LABELS[st.kind];
}

export { tileCenter };
