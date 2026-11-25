// What each station does when the chef uses it, and how woks and grills cook over time.
// One key (Space / E, or a click) does the obvious thing: take, put down, chop, pound, add, plate, serve.
import { CHOP, GRIND, GRILL, wokAccepts, wokResult, isPlateable, nameOf } from '../food/ingredients.js';
import { serveAtPass } from '../service/scoring.js';
import { plateAccepts, recipeOfPlate } from '../food/recipes.js';

const WOK_SECONDS = 5;
const GRILL_SECONDS = 6.5;

const plate = () => ({ id: 'plate', parts: [] });

/** Adds a component to a plate if tonight's menu has a dish it fits; tells why not otherwise. */
function addToPlate(run, p, id, at) {
  if (!isPlateable(id)) return reject(run, at, `${nameOf(id)} needs cooking first`);
  if (!plateAccepts(p.parts, id, run.night.menu)) return reject(run, at, `No dish tonight takes ${nameOf(id)} with that`);
  p.parts.push(id);
  const dish = recipeOfPlate(p.parts);
  run.fx.emit(dish ? 'plateDone' : 'plate', { at, dish });
  return true;
}

function reject(run, at, text) {
  run.fx.emit('reject', { at, text });
  return false;
}

export function interact(run, st) {
  const chef = run.chef;
  const held = chef.held;
  const at = st;
  switch (st.kind) {
    case 'crate':
      if (!held) { chef.held = { id: st.ing }; run.fx.emit('pickup', { at }); st.pop = 1; return true; }
      if (held.id === st.ing) { chef.held = null; run.fx.emit('drop', { at }); return true; }
      if (held.id === 'plate' && st.ing === 'rice') return addToPlate(run, held, 'rice', at);
      return reject(run, at, 'Hands full');
    case 'plates':
      if (!held) { chef.held = plate(); run.fx.emit('pickup', { at }); st.pop = 1; return true; }
      return reject(run, at, 'Hands full');
    case 'bin':
      if (!held) return reject(run, at, 'Nothing to throw away');
      chef.held = null; run.fx.emit('bin', { at, what: held.id });
      if (held.id === 'burnt') run.stats.burnt++;
      return true;
    case 'pass':
      if (held?.id !== 'plate') return reject(run, at, held ? 'Plate it first' : 'Bring a finished plate');
      return serveAtPass(run, st);
    case 'board':
    case 'mortar':
      return useWorktop(run, st, CHOP, st.kind === 'board' ? run.mods.chopTaps : run.mods.grindTaps);
    case 'wok':
    case 'grill':
      return useFire(run, st);
    default:
      return useCounter(run, st);
  }
}

function useCounter(run, st) {
  const chef = run.chef, held = chef.held, at = st;
  if (!held && st.item) { chef.held = st.item; st.item = null; run.fx.emit('pickup', { at }); return true; }
  if (held && !st.item) { st.item = held; chef.held = null; run.fx.emit('drop', { at }); st.pop = 1; return true; }
  if (held && st.item?.id === 'plate' && held.id !== 'plate') {
    if (addToPlate(run, st.item, held.id, at)) { chef.held = null; st.pop = 1; return true; }
    return false;
  }
  if (held?.id === 'plate' && st.item && st.item.id !== 'plate') {
    if (addToPlate(run, held, st.item.id, at)) { st.item = null; return true; }
    return false;
  }
  return reject(run, at, 'No room here');
}

/** Board and mortar: put a raw item down, tap to work it, pick up (or plate) the result. */
function useWorktop(run, st, _table, taps) {
  const chef = run.chef, held = chef.held, at = st;
  const table = st.kind === 'board' ? CHOP : GRIND;
  if (st.item && table[st.item.id]) {
    st.progress += 1 / taps;
    st.shake = 1;
    run.fx.emit(st.kind === 'board' ? 'chop' : 'grind', { at, progress: Math.min(1, st.progress) });
    if (st.progress >= 0.999) {
      st.item = { id: table[st.item.id] };
      st.progress = 0;
      run.fx.emit('prepDone', { at, id: st.item.id });
    }
    chef.busy = 0.12;
    return true;
  }
  if (!st.item && held && table[held.id]) { st.item = held; chef.held = null; st.progress = 0; run.fx.emit('drop', { at }); return true; }
  if (!st.item && held) return reject(run, at, st.kind === 'board' ? `${nameOf(held.id)} does not need chopping` : `${nameOf(held.id)} does not go in the cobek`);
  if (st.item && !held) { chef.held = st.item; st.item = null; run.fx.emit('pickup', { at }); return true; }
  if (st.item && held?.id === 'plate') { if (addToPlate(run, held, st.item.id, at)) { st.item = null; return true; } return false; }
  return reject(run, at, 'Hands full');
}

/** Wok and grill: add ingredients, wait for the sizzle, take the food before it burns. */
function useFire(run, st) {
  const chef = run.chef, held = chef.held, at = st;
  if (st.state === 'done' || st.state === 'burnt') {
    const food = st.state === 'burnt' ? 'burnt' : st.result;
    if (!held) { chef.held = { id: food }; clearFire(st); run.fx.emit('pickup', { at }); return true; }
    if (held.id === 'plate' && food !== 'burnt') { if (addToPlate(run, held, food, at)) { clearFire(st); return true; } return false; }
    return reject(run, at, 'Hands full');
  }
  if (!held) return reject(run, at, st.contents.length ? 'Still cooking...' : `Bring something to ${st.kind === 'wok' ? 'fry' : 'grill'}`);
  if (st.kind === 'grill') {
    if (st.contents.length) return reject(run, at, 'The grill is busy');
    if (!GRILL[held.id]) return reject(run, at, held.id === 'chicken' || held.id === 'prawn' ? 'Chop it on the board first' : `${nameOf(held.id)} does not go on the grill`);
    st.contents = [held.id]; st.result = GRILL[held.id];
  } else {
    if (!wokAccepts(st.contents, held.id)) return reject(run, at, held.id === 'tofu' ? 'Cube the tofu first' : `${nameOf(held.id)} does not fry with that`);
    st.contents.push(held.id);
    st.result = wokResult(st.contents);
  }
  chef.held = null;
  st.state = st.result ? 'cooking' : 'waiting';
  st.burn = 0;
  run.fx.emit('sizzle', { at });
  return true;
}

function clearFire(st) {
  st.contents = []; st.cook = 0; st.burn = 0; st.state = 'idle'; st.result = null;
}

/** Cooks woks and grills; done food starts to smoke and then burns if left on the fire. */
export function tickStations(run, dt) {
  for (const st of run.k.stations) {
    st.shake = Math.max(0, st.shake - dt * 6);
    st.pop = Math.max(0, st.pop - dt * 4);
    if (st.kind !== 'wok' && st.kind !== 'grill') continue;
    if (st.state === 'cooking') {
      const secs = st.kind === 'wok' ? WOK_SECONDS / run.mods.wok : GRILL_SECONDS / (run.mods.grill * (run.night.grillSpeed || 1));
      st.cook += dt / secs;
      if (st.cook >= 1) { st.cook = 1; st.state = 'done'; run.fx.emit('cooked', { at: st, id: st.result }); }
    } else if (st.state === 'done') {
      st.burn += dt;
      if (st.burn >= run.mods.burnDelay) { st.state = 'burnt'; run.fx.emit('burnt', { at: st }); }
    }
  }
}
