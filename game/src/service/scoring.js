// Serving a plate at the pass: match it to the most impatient ticket for that dish, pay the price,
// a tip by how happy the guest still is, and a rush combo for serves that come back to back.
import { recipeOfPlate, missingParts } from '../food/recipes.js';
import { nameOf } from '../food/ingredients.js';
import { REGULARS } from './customers.js';

export const COMBO_STEP = 0.25;
export const COMBO_CAP = 2.5;

export function comboMultiplier(combo) {
  return Math.min(COMBO_CAP, 1 + COMBO_STEP * Math.max(0, combo - 1));
}

export function serveAtPass(run, pass) {
  const plate = run.chef.held;
  const dish = recipeOfPlate(plate.parts);
  if (!dish) {
    const m = missingParts(plate.parts, run.night.menu);
    run.fx.emit('reject', { at: pass, text: m ? `${m.recipe.name} still needs ${m.miss.map(nameOf).join(' + ')}` : 'An empty plate?' });
    return false;
  }
  const waiting = run.tickets.filter(t => t.recipe === dish.id).sort((a, b) => a.patience - b.patience);
  if (!waiting.length) {
    run.stats.wrong++;
    run.fx.emit('reject', { at: pass, text: `Nobody ordered ${dish.name}` });
    return false;
  }
  const t = waiting[0];
  const share = t.patience / t.max;
  const quick = run.time - run.lastServe <= run.mods.comboWindow;
  run.combo = quick ? run.combo + 1 : 1;
  run.lastServe = run.time;
  run.stats.bestCombo = Math.max(run.stats.bestCombo, run.combo);
  const base = dish.price * (t.vip ? 3 : 1);
  const tip = Math.round(base * 0.5 * share * run.mods.tip);
  const perfect = share > 0.66;
  const nearMiss = share < 0.18;
  const pay = Math.round((base + tip) * comboMultiplier(run.combo)) + (perfect ? run.mods.perfectBonus : 0);
  run.takings += pay;
  run.stats.served++;
  run.stats.tips += tip;
  if (perfect) run.stats.perfect++;
  if (nearMiss) run.stats.nearMiss++;
  run.tickets.splice(run.tickets.indexOf(t), 1);
  run.seats[t.seat] = { who: t.who, state: 'eating', anim: 2.2, dish: dish.id };
  run.chef.held = null;
  const guest = REGULARS[t.who];
  run.reviews.push({ who: t.who, text: perfect ? guest.lines.happy : nearMiss ? 'Just in time...' : 'Not bad.', stars: perfect ? 3 : nearMiss ? 1 : 2, dish: dish.id });
  run.fx.emit('serve', { at: pass, ticket: t, dish, pay, tip, combo: run.combo, perfect, nearMiss, secondsLeft: t.patience });
  return true;
}
