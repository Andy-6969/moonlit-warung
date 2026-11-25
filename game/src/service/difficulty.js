// Three difficulties (they scale patience, order pace and burn time) and the Endless night:
// no clock, every dish on the menu, a crowd that keeps growing until three guests walk out.
import { NIGHT_10 } from '../nights/night-10-grand-bazaar.js';

export const DIFFICULTIES = [
  { id: 'santai', name: 'Santai', text: 'guests wait 30% longer, orders come 20% slower', patience: 1.3, spawn: 1.2, burn: 2, color: '#7fd47a' },
  { id: 'classic', name: 'Classic', text: 'the night market as it is', patience: 1, spawn: 1, burn: 0, color: '#ffcf5a' },
  { id: 'pedas', name: 'Pedas', text: 'guests wait 25% less, food burns 2 s sooner', patience: 0.75, spawn: 0.9, burn: -2, color: '#ff6a4a' },
];

export const ENDLESS_STRIKES = 3;

export const ENDLESS = {
  id: 'E',
  name: 'Endless Night',
  place: 'Moon Harbour, until sunrise',
  seconds: 3600,
  ramp: 420,
  endless: true,
  menu: NIGHT_10.menu,
  regulars: NIGHT_10.regulars,
  spawn: { first: 2, start: 14, end: 5 },
  patience: { start: 62, end: 34 },
  goals: [800, 1600, 2400],
  twist: `No clock: the crowd never stops. ${ENDLESS_STRIKES} walk-outs close the stall.`,
  vip: 'ratna',
  map: NIGHT_10.map,
};
