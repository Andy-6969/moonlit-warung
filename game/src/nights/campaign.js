// The ten-night campaign, in order. Each night file holds its own kitchen map, menu, crowd and twist.
import { NIGHT_1 } from './night-1-opening.js';
import { NIGHT_2 } from './night-2-rain-on-the-tarp.js';
import { NIGHT_3 } from './night-3-lantern-festival.js';
import { NIGHT_4 } from './night-4-power-flicker.js';
import { NIGHT_5 } from './night-5-the-critic.js';
import { NIGHT_6 } from './night-6-monsoon-market.js';
import { NIGHT_7 } from './night-7-sahur-shift.js';
import { NIGHT_8 } from './night-8-football-final.js';
import { NIGHT_9 } from './night-9-rival-stall.js';
import { NIGHT_10 } from './night-10-grand-bazaar.js';

export const NIGHTS = [NIGHT_1, NIGHT_2, NIGHT_3, NIGHT_4, NIGHT_5, NIGHT_6, NIGHT_7, NIGHT_8, NIGHT_9, NIGHT_10];
export const LAST_NIGHT = NIGHTS.length - 1;

/** Stars a night's takings earn against its three goals. */
export function starsFor(night, takings) {
  return night.goals.filter(g => takings >= g).length;
}

/** The dishes a night adds to the menu since the one before it. */
export function newDishes(index) {
  const before = index > 0 ? new Set(NIGHTS[index - 1].menu) : new Set();
  return NIGHTS[index].menu.filter(r => !before.has(r));
}
