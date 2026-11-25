// The twelve dishes of the warung. Each is a set of plate components; many share parts,
// so one wok of fried rice or one grill of sate can feed several different tickets.

export const RECIPES = [
  { id: 'nasi_goreng', name: 'Nasi Goreng', parts: ['fried_rice', 'fried_egg'], price: 28, blurb: 'Wok fried rice crowned with a crisp duck egg.' },
  { id: 'mie_goreng', name: 'Mie Goreng', parts: ['fried_noodles', 'chopped_greens'], price: 26, blurb: 'Smoky egg noodles tossed with water spinach.' },
  { id: 'sate_ayam', name: 'Sate Ayam', parts: ['sate', 'peanut_sauce'], price: 30, blurb: 'Charcoal chicken skewers under warm peanut sauce.' },
  { id: 'gado_gado', name: 'Gado-Gado', parts: ['chopped_greens', 'fried_tofu', 'peanut_sauce'], price: 32, blurb: 'Greens and golden tofu drowned in peanut sauce.' },
  { id: 'udang_bakar', name: 'Udang Bakar', parts: ['grilled_prawn', 'sambal', 'lime_wedge'], price: 36, blurb: 'Grilled prawns, fiery sambal, a squeeze of lime.' },
  { id: 'nasi_sate', name: 'Nasi Sate', parts: ['rice', 'sate', 'sambal'], price: 34, blurb: 'Steamed rice, skewers and a spoon of sambal.' },
  { id: 'tahu_telor', name: 'Tahu Telor', parts: ['fried_tofu', 'fried_egg', 'peanut_sauce'], price: 33, blurb: 'Tofu and egg, the night-shift favourite.' },
  { id: 'mie_udang', name: 'Mie Udang', parts: ['fried_noodles', 'grilled_prawn', 'sambal'], price: 40, blurb: 'Noodles heaped with grilled prawns and heat.' },
  { id: 'nasi_campur', name: 'Nasi Campur', parts: ['rice', 'fried_tofu', 'sate', 'sambal'], price: 46, blurb: 'A little of everything around a rice dome.' },
  { id: 'nasi_udang', name: 'Nasi Goreng Udang', parts: ['fried_rice', 'grilled_prawn', 'lime_wedge'], price: 42, blurb: 'Fried rice with prawns and bright lime.' },
  { id: 'telor_balado', name: 'Telor Balado', parts: ['rice', 'fried_egg', 'sambal'], price: 30, blurb: 'Fried egg smothered in red chili sambal.' },
  { id: 'moonlit_feast', name: 'Moonlit Feast', parts: ['fried_rice', 'sate', 'grilled_prawn', 'peanut_sauce'], price: 58, blurb: 'The house platter for a full-moon crowd.' },
];

export const RECIPE_BY_ID = Object.fromEntries(RECIPES.map(r => [r.id, r]));

const keyOf = parts => [...parts].sort().join('+');
const BY_KEY = Object.fromEntries(RECIPES.map(r => [keyOf(r.parts), r]));

/** The recipe a plate's parts make exactly, or null. */
export function recipeOfPlate(parts) {
  return BY_KEY[keyOf(parts)] || null;
}

/** Whether a plate could still become one of the dishes on tonight's menu with `id` added. */
export function plateAccepts(parts, id, menu) {
  if (parts.includes(id)) return false;
  const next = [...parts, id];
  return menu.some(rid => {
    const want = RECIPE_BY_ID[rid].parts;
    return next.every(p => want.includes(p));
  });
}

/** The parts a plate still lacks for the closest dish on tonight's menu (for the plate's hint). */
export function missingParts(parts, menu) {
  let best = null;
  for (const rid of menu) {
    const want = RECIPE_BY_ID[rid].parts;
    if (!parts.every(p => want.includes(p))) continue;
    const miss = want.filter(p => !parts.includes(p));
    if (!best || miss.length < best.miss.length) best = { recipe: RECIPE_BY_ID[rid], miss };
  }
  return best;
}
