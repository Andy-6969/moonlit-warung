// The order board: paper tickets pegged to a string over the kitchen, one per seated guest, each with
// the guest's face and mood, the dish drawn, its parts ticked off, and a patience bar that drains.
import { RECIPE_BY_ID } from '../food/recipes.js';
import { REGULARS, moodOf } from '../service/customers.js';
import { drawFace } from '../art/people-art.js';
import { drawDish, drawFood } from '../art/food-art.js';

export const RAIL = { x: 14, y: 64, h: 128, w: 1252 };
const TW = 200, TH = 118, GAP = 8;

export function ticketRect(i) {
  return { x: RAIL.x + 8 + i * (TW + GAP), y: RAIL.y + 6, w: TW, h: TH };
}

/** `heldParts`: parts on the plate the chef carries, ticked on the matching tickets. */
export function drawTicketRail(ctx, run, t, heldParts = []) {
  ctx.fillStyle = '#2a1c2e'; ctx.fillRect(0, RAIL.y - 4, 1280, RAIL.h + 4);
  ctx.strokeStyle = '#c9a26a'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, RAIL.y + 6); ctx.lineTo(1280, RAIL.y + 6); ctx.stroke();
  const sorted = [...run.tickets].sort((a, b) => a.born - b.born);
  sorted.forEach((tk, i) => drawTicket(ctx, tk, ticketRect(i), t, heldParts));
  if (!sorted.length) {
    ctx.fillStyle = 'rgba(255,233,196,0.6)'; ctx.font = 'italic 18px Georgia, serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('The rail is empty... the street smells your wok and comes closer.', 30, RAIL.y + 64);
  }
}

export function drawTicket(ctx, tk, r, t, heldParts = []) {
  const recipe = RECIPE_BY_ID[tk.recipe];
  const share = tk.patience / tk.max;
  const m = moodOf(share);
  const urgent = share < 0.25;
  const sway = Math.sin(t * 2 + tk.id) * 0.012 + (urgent ? Math.sin(t * 30) * 0.02 : 0);
  ctx.save();
  ctx.translate(r.x + r.w / 2, r.y - tk.enter * 60);
  ctx.rotate(sway);
  ctx.translate(-r.w / 2, 0);
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(4, 6, r.w, r.h);
  ctx.fillStyle = tk.vip ? '#fff1c8' : '#fbf3e2';
  ctx.strokeStyle = tk.vip ? '#d4a017' : '#3b2314'; ctx.lineWidth = tk.vip ? 4 : 2;
  ctx.beginPath(); ctx.roundRect(0, 0, r.w, r.h, 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#c9a26a'; ctx.fillRect(r.w / 2 - 7, -8, 14, 16);
  ctx.strokeStyle = '#3b2314'; ctx.lineWidth = 1.5; ctx.strokeRect(r.w / 2 - 7, -8, 14, 16);
  drawFace(ctx, tk.who, 26, 30, 34, m.face, false);
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#3b2314'; ctx.font = 'bold 13px Trebuchet MS, sans-serif';
  ctx.fillText(REGULARS[tk.who].name, 48, 18);
  ctx.fillStyle = m.color === '#f2c94c' ? '#b8860b' : m.color; ctx.font = 'bold 11px Trebuchet MS, sans-serif';
  ctx.fillText(tk.vip ? `${m.label}  CRITIC x3` : m.label, 48, 34);
  drawDish(ctx, tk.recipe, 40, 74, 62);
  ctx.fillStyle = '#3b2314'; ctx.font = 'bold 14px Georgia, serif';
  ctx.fillText(recipe.name, 76, 56);
  recipe.parts.forEach((p, i) => {
    const px = 86 + i * 28, py = 82;
    ctx.fillStyle = '#efe4cc'; ctx.beginPath(); ctx.arc(px, py, 12, 0, Math.PI * 2); ctx.fill();
    drawFood(ctx, p, px, py, 26);
    if (heldParts.includes(p)) {
      ctx.fillStyle = '#2f9a3a'; ctx.beginPath(); ctx.arc(px + 9, py - 9, 6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px + 6, py - 9); ctx.lineTo(px + 8.5, py - 6.5); ctx.lineTo(px + 12, py - 12); ctx.stroke();
    }
  });
  ctx.fillStyle = '#e2d6bd'; ctx.fillRect(8, r.h - 14, r.w - 16, 8);
  ctx.fillStyle = m.color; ctx.fillRect(8, r.h - 14, (r.w - 16) * Math.max(0, share), 8);
  ctx.fillStyle = '#3b2314'; ctx.font = 'bold 11px Trebuchet MS, sans-serif'; ctx.textAlign = 'right';
  ctx.fillText(`${Math.ceil(tk.patience)}s`, r.w - 8, 34);
  ctx.restore();
}
