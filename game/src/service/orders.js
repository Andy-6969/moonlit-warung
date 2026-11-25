// The ticket rail: who sits down, what they order and how long they will wait. Pressure grows by
// the clock (tickets come faster, patience shrinks, rushes hit), never by adding new chores.
import { REGULARS, pickCustomer, pickDish } from './customers.js';
import { lerp } from '../core/screen.js';

let nextTicketId = 1;

/** Whether the night's clock is inside one of its rush windows. */
export function inRush(night, progress) {
  const r = night.rush;
  if (!r) return false;
  if (progress >= r.from && progress <= r.to) return true;
  return !!(r.again && progress >= r.again.from && progress <= r.again.to);
}

function freeSeat(run) {
  for (let i = 0; i < run.mods.seats; i++) if (!run.seats[i]) return i;
  return -1;
}

export function spawnTicket(run, forced = {}) {
  const seat = forced.seat ?? freeSeat(run);
  if (seat < 0) return null;
  const night = run.night;
  const progress = Math.min(1, run.time / (night.ramp || night.seconds));
  const seated = run.tickets.map(t => t.who);
  const vipDue = night.vip && run.vipSpawned < 2 && progress > (run.vipSpawned ? 0.62 : 0.28);
  const who = forced.who || (vipDue ? night.vip : pickCustomer(run.rng, night, seated));
  const vip = !!REGULARS[who].vip;
  if (vip) run.vipSpawned++;
  const recipe = forced.recipe || pickDish(run.rng, night, who);
  const max = lerp(night.patience.start, night.patience.end, progress) * run.mods.patience / REGULARS[who].temper * (vip ? 0.75 : 1);
  const t = { id: nextTicketId++, recipe, who, seat, max, patience: forced.patience ?? max, born: run.time, vip, enter: 1 };
  run.tickets.push(t);
  run.seats[seat] = { who, ticket: t.id, state: 'waiting', anim: 1 };
  run.fx.emit('order', { ticket: t });
  return t;
}

export function tickOrders(run, dt) {
  const night = run.night;
  const progress = Math.min(1, run.time / (night.ramp || night.seconds));
  run.rush = inRush(night, run.time / night.seconds);
  if (run.time >= run.nextSpawn && run.time < night.seconds - 6) {
    if (spawnTicket(run)) {
      const gap = lerp(night.spawn.start, night.spawn.end, progress) * (run.rush ? night.rush.factor : 1) * (run.spawnMul || 1);
      run.nextSpawn = run.time + gap * (0.8 + run.rng() * 0.4);
    } else run.nextSpawn = run.time + 1;
  }
  const drain = run.rush ? run.mods.rushCalm : 1;
  for (const t of [...run.tickets]) {
    t.enter = Math.max(0, t.enter - dt * 3);
    t.patience -= dt * drain;
    if (t.patience <= 0) {
      run.tickets.splice(run.tickets.indexOf(t), 1);
      run.seats[t.seat] = { who: t.who, state: 'leaving-angry', anim: 1.6 };
      run.stats.missed++;
      run.walkouts.push(t.who);
      run.combo = 0;
      run.fx.emit('walkout', { ticket: t });
    }
  }
  for (let i = 0; i < run.seats.length; i++) {
    const s = run.seats[i];
    if (!s || s.state === 'waiting') continue;
    s.anim -= dt;
    if (s.anim <= 0) run.seats[i] = null;
  }
}
