// The stall's progress between sessions: nights unlocked, best stars per night, the purse and upgrades.
import { NIGHTS, LAST_NIGHT } from '../nights/campaign.js';

const KEY = 'moonlit-warung-save-v1';

export function freshSave() {
  return { unlocked: 0, stars: new Array(NIGHTS.length).fill(0), purse: 0, upgrades: [], selected: 0, difficulty: 1, bestEndless: 0 };
}

export function loadSave() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && Array.isArray(s.stars)) {
      const stars = NIGHTS.map((_, i) => s.stars[i] || 0);
      return { ...freshSave(), ...s, stars };
    }
  } catch { /* storage blocked: play without saving */ }
  return freshSave();
}

export function writeSave(save) {
  try { localStorage.setItem(KEY, JSON.stringify(save)); } catch { /* ignore */ }
}

/** Banks a finished night: best stars, purse, next night unlocked once it earns a star. */
export function bankNight(save, index, takings, stars) {
  save.stars[index] = Math.max(save.stars[index], stars);
  save.purse += takings;
  if (stars > 0 && save.unlocked < index + 1 && index < LAST_NIGHT) save.unlocked = index + 1;
  writeSave(save);
}
