// Market events: a short twist that breaks over the stall mid-night and bends the rules for about
// twenty seconds (a gas surge, hot coals, a tour bus, a street band, a gust of wind). Each night from
// Night 2 on gets one or two at set points of the clock; Endless rolls four. The stall's modifiers are
// changed while the event runs and put back exactly when it ends.
import { spawnTicket } from './orders.js';

export const EVENTS = {
  gas_surge: {
    name: 'GAS SURGE', text: 'Woks fry 40% faster but burn sooner', secs: 20, color: '#ff8a3a',
    apply(m) { m.wok *= 1.4; m.burnDelay *= 0.6; },
  },
  hot_coals: {
    name: 'HOT COALS', text: 'Grills run 50% faster but burn sooner', secs: 20, color: '#ff5a3a',
    apply(m) { m.grill *= 1.5; m.burnDelay *= 0.6; },
  },
  tour_bus: {
    name: 'TOUR BUS', text: 'Three guests at once, tips x1.5', secs: 18, color: '#ffcf5a', burst: 3,
    apply(m) { m.tip *= 1.5; },
  },
  street_band: {
    name: 'STREET BAND', text: 'Guests sway along, patience lasts', secs: 22, color: '#7fe07a',
    apply(m) { m.drain *= 0.6; },
  },
  gusty_wind: {
    name: 'GUSTY WIND', text: 'Guests fret: patience drains faster', secs: 18, color: '#9ad0ff',
    apply(m) { m.drain *= 1.3; },
  },
};

const POOL = Object.keys(EVENTS);

/** The night's events in clock order: its own list if it names one, else a seeded roll. */
export function scheduleEvents(night, index, rng) {
  if (night.events) return night.events.map(e => ({ ...e }));
  if (index === 0) return [];
  const count = night.endless ? 4 : index >= 5 ? 2 : 1;
  const out = [];
  for (let i = 0; i < count; i++) out.push({ at: (i + 1) / (count + 1) + 0.05, id: POOL[Math.floor(rng() * POOL.length)] });
  return out;
}

/** What the market map says about a night's events before it starts. */
export function eventsPreview(night, index) {
  if (night.events) return `Market events: ${night.events.map(e => EVENTS[e.id].name).join(' · ')}`;
  if (index === 0) return 'No market events: a calm first night';
  const count = index >= 5 ? 2 : 1;
  return `Market events: ${count} surprise${count > 1 ? 's' : ''} (gas surge, hot coals, tour bus, band, wind)`;
}

export function startEvent(run, id) {
  const ev = EVENTS[id];
  run.event = { id, left: ev.secs, secs: ev.secs, saved: { ...run.mods } };
  ev.apply(run.mods);
  for (let i = 0; i < (ev.burst || 0); i++) spawnTicket(run);
  run.stats.events++;
  run.fx.emit('event', { id, name: ev.name, text: ev.text, color: ev.color });
}

function endEvent(run) {
  Object.assign(run.mods, run.event.saved);
  run.fx.emit('event-end', { id: run.event.id });
  run.event = null;
}

/** Runs the current event's clock, or starts the next one when its moment comes (never in the last 25 s). */
export function tickEvents(run, dt) {
  if (run.event) {
    run.event.left -= dt;
    if (run.event.left <= 0) endEvent(run);
    return;
  }
  const next = run.eventQueue[0];
  if (next && run.time >= next.at * run.night.seconds && run.time < run.night.seconds - 25) {
    run.eventQueue.shift();
    startEvent(run, next.id);
  }
}
