// The route planner: pick a ticket (click it, or press 1-6) and the kitchen numbers the stations its
// dish needs in a walking order from where the cook stands: crates, board or cobek, wok or grill,
// a plate, then the pass. Parts already on the plate you carry are skipped.
import { RECIPE_BY_ID } from '../food/recipes.js';
import { CHOP, GRIND, GRILL, WOK, RAW } from '../food/ingredients.js';
import { tileCenter } from '../core/screen.js';

const back = (table, id) => Object.keys(table).find(k => table[k] === id);

/** The station kinds (in order) that make one plate part, e.g. sate: chicken crate, board, grill. */
export function stepsForPart(part) {
  const grillFrom = back(GRILL, part);
  if (grillFrom) return [{ crate: back(CHOP, grillFrom) }, { kind: 'board' }, { kind: 'grill' }];
  const wokFrom = back(WOK, part);
  if (wokFrom) {
    if (wokFrom === 'tofu_cubes') return [{ crate: 'tofu' }, { kind: 'board' }, { kind: 'wok' }];
    return [...wokFrom.split('+').map(c => ({ crate: c })), { kind: 'wok' }];
  }
  if (back(CHOP, part)) return [{ crate: back(CHOP, part) }, { kind: 'board' }];
  if (back(GRIND, part)) return [{ crate: back(GRIND, part) }, { kind: 'mortar' }];
  return [{ crate: part }];
}

function nearest(run, from, pred) {
  let best = null, bd = Infinity;
  for (const st of run.k.stations) {
    if (!pred(st)) continue;
    const d = Math.abs(st.col - from.c) + Math.abs(st.row - from.r);
    if (d < bd) { bd = d; best = st; }
  }
  return best;
}

/** Ordered stops for a recipe: [{ st, label }], one badge per station, in a sensible walking order. */
export function planFor(run, recipeId) {
  const recipe = RECIPE_BY_ID[recipeId];
  const carried = run.chef.held?.id === 'plate' ? run.chef.held.parts : [];
  const held = carried.every(p => recipe.parts.includes(p)) ? carried : [];
  const stops = [];
  let at = { c: Math.floor(run.chef.x), r: Math.floor(run.chef.y) };
  const add = (st, label) => {
    if (!st || stops.some(s => s.st === st)) return;
    stops.push({ st, label });
    at = { c: st.col, r: st.row };
  };
  for (const part of recipe.parts) {
    if (held.includes(part)) continue;
    for (const step of stepsForPart(part)) {
      if (step.crate) add(nearest(run, at, s => s.kind === 'crate' && s.ing === step.crate), 'take');
      else add(nearest(run, at, s => s.kind === step.kind), step.kind);
    }
  }
  if (!held.length) add(nearest(run, at, s => s.kind === 'plates'), 'plate');
  add(nearest(run, at, s => s.kind === 'pass'), 'serve');
  return stops;
}

const SHORT = { board: 'Board', mortar: 'Cobek', wok: 'Wok', grill: 'Grill', plates: 'Plate', pass: 'Serve' };
const stopName = st => (st.kind === 'crate' ? RAW[st.ing].crate : SHORT[st.kind] || st.kind);

/** The route as words across the top of the kitchen floor: which ticket, how many stops left, in order. */
export function drawRouteBanner(ctx, stops, slot, dish, guest, x, y, maxW) {
  if (!stops.length) return;
  ctx.save();
  ctx.font = 'bold 13px Trebuchet MS, sans-serif';
  const head = `ROUTE ${slot}`, title = `${dish} for ${guest}`, left = `${stops.length} stop${stops.length > 1 ? 's' : ''} left`;
  const chain = stops.map((s, i) => `${i + 1} ${stopName(s.st)}`).join('  ›  ');
  const w = Math.min(maxW, 92 + ctx.measureText(title).width + ctx.measureText(left).width + 40);
  ctx.fillStyle = 'rgba(12,30,48,0.9)'; ctx.strokeStyle = '#7fd0ff'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(x, y, Math.max(w, Math.min(maxW, ctx.measureText(chain).width * 0.86 + 24)), 44, 8); ctx.fill(); ctx.stroke();
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#7fd0ff'; ctx.beginPath(); ctx.roundRect(x + 8, y + 5, 74, 18, 5); ctx.fill();
  ctx.fillStyle = '#0c2236'; ctx.fillText(head, x + 14, y + 14);
  ctx.fillStyle = '#fff3dc'; ctx.fillText(title, x + 92, y + 14);
  ctx.fillStyle = '#ffcf5a'; ctx.fillText(left, x + 102 + ctx.measureText(title).width, y + 14);
  ctx.font = '11px Trebuchet MS, sans-serif'; ctx.fillStyle = '#bfe6ff';
  ctx.fillText(chain, x + 10, y + 33, maxW - 20);
  ctx.restore();
}

/** Numbered badges over the planned stations, joined by a faint line. */
export function drawRoutePlan(ctx, stops, t, color = '#7fd0ff') {
  if (!stops.length) return;
  const pts = stops.map(s => tileCenter(s.st.col, s.st.row));
  ctx.save();
  ctx.strokeStyle = 'rgba(127,208,255,0.45)'; ctx.lineWidth = 3; ctx.setLineDash([4, 8]); ctx.lineDashOffset = -t * 25;
  ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y - 22) : ctx.moveTo(p.x, p.y - 22))); ctx.stroke();
  ctx.setLineDash([]);
  pts.forEach((p, i) => {
    const pulse = 1 + 0.08 * Math.sin(t * 5 - i * 0.6);
    ctx.save(); ctx.translate(p.x + 22, p.y - 24); ctx.scale(pulse, pulse);
    ctx.fillStyle = color; ctx.strokeStyle = '#12304a'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#0c2236'; ctx.font = 'bold 14px Trebuchet MS, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(i + 1), 0, 1);
    ctx.restore();
  });
  ctx.restore();
}
