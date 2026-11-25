// The stall's progress between sessions: nights unlocked, best stars per night, the purse and upgrades.
const KEY = 'moonlit-warung-save-v1';

export function freshSave() {
  return { unlocked: 0, stars: [0, 0, 0, 0, 0, 0, 0], purse: 0, upgrades: [], selected: 0 };
}

export function loadSave() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && Array.isArray(s.stars)) return { ...freshSave(), ...s };
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
  if (stars > 0 && save.unlocked < index + 1 && index < 6) save.unlocked = index + 1;
  writeSave(save);
}
