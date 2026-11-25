// Every food item the kitchen knows: raw goods from the crates, the parts they become at each station,
// and the plate components that recipes are built from. Station rules live here as plain tables.

export const RAW = {
  rice: { name: 'Steamed rice', crate: 'Rice pot', plateable: true },
  noodles: { name: 'Egg noodles', crate: 'Noodles' },
  egg: { name: 'Duck egg', crate: 'Eggs' },
  chicken: { name: 'Chicken thigh', crate: 'Chicken' },
  prawn: { name: 'Tiger prawn', crate: 'Prawns' },
  tofu: { name: 'Tofu block', crate: 'Tofu' },
  greens: { name: 'Water spinach', crate: 'Greens' },
  chili: { name: 'Red chili', crate: 'Chilies' },
  peanut: { name: 'Peanuts', crate: 'Peanuts' },
  lime: { name: 'Calamansi', crate: 'Limes' },
};

export const PARTS = {
  diced_chicken: { name: 'Diced chicken' },
  peeled_prawn: { name: 'Peeled prawn' },
  tofu_cubes: { name: 'Tofu cubes' },
  chopped_greens: { name: 'Chopped greens', plateable: true },
  lime_wedge: { name: 'Lime wedge', plateable: true },
  sambal: { name: 'Sambal', plateable: true },
  peanut_sauce: { name: 'Peanut sauce', plateable: true },
  fried_rice: { name: 'Fried rice', plateable: true },
  fried_noodles: { name: 'Fried noodles', plateable: true },
  fried_egg: { name: 'Fried egg', plateable: true },
  fried_tofu: { name: 'Fried tofu', plateable: true },
  sate: { name: 'Sate skewers', plateable: true },
  grilled_prawn: { name: 'Grilled prawn', plateable: true },
  burnt: { name: 'Burnt mess' },
};

/** Chopping board: one raw item becomes one prepared part after a few knife taps. */
export const CHOP = { chicken: 'diced_chicken', prawn: 'peeled_prawn', tofu: 'tofu_cubes', greens: 'chopped_greens', lime: 'lime_wedge' };

/** Stone mortar (cobek): pound to a paste. */
export const GRIND = { chili: 'sambal', peanut: 'peanut_sauce' };

/** Wok: what goes in together decides what comes out (contents sorted and joined by +). */
export const WOK = { 'egg+rice': 'fried_rice', 'egg+noodles': 'fried_noodles', egg: 'fried_egg', tofu_cubes: 'fried_tofu' };

/** Charcoal grill. */
export const GRILL = { diced_chicken: 'sate', peeled_prawn: 'grilled_prawn' };

export function nameOf(id) {
  return (RAW[id] || PARTS[id] || { name: id }).name;
}

export function isPlateable(id) {
  return !!(RAW[id]?.plateable || PARTS[id]?.plateable);
}

/** The wok result its contents make now, or null while they make nothing yet. */
export function wokResult(contents) {
  return WOK[[...contents].sort().join('+')] || null;
}

/** Whether adding `id` to the wok could still lead to a dish the wok knows. */
export function wokAccepts(contents, id) {
  const next = [...contents, id].sort();
  return Object.keys(WOK).some(k => {
    const want = k.split('+');
    return next.every(x => want.includes(x)) && next.length <= want.length;
  });
}

/** Which station turns this item into something else: shown as a hint over the chef's head. */
export function nextStationFor(id) {
  if (CHOP[id]) return 'board';
  if (GRIND[id]) return 'mortar';
  if (GRILL[id]) return 'grill';
  if (id === 'egg' || id === 'noodles' || id === 'tofu_cubes') return 'wok';
  if (id === 'burnt') return 'bin';
  return 'plate';
}
