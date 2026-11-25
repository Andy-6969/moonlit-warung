// Twelve stall upgrades bought with the night's takings between nights. Each changes one number
// the kitchen reads (chop taps, cook speed, walk speed, patience, tips), never adds a new chore.

export const UPGRADES = [
  { id: 'knife', name: 'Whetstone Knife', icon: 'knife', cost: 90, text: 'Chop in 3 taps, not 4.', apply: m => { m.chopTaps = 3; } },
  { id: 'cobek', name: 'Granite Cobek', icon: 'mortar', cost: 90, text: 'Pound sambal and sauce in 3 taps.', apply: m => { m.grindTaps = 3; } },
  { id: 'sandals', name: 'Rubber Sandals', icon: 'sandal', cost: 110, text: 'Walk 15% faster.', apply: m => { m.walk *= 1.15; } },
  { id: 'burner', name: 'Jet Burner', icon: 'flame', cost: 140, text: 'Woks cook 30% faster.', apply: m => { m.wok *= 1.3; } },
  { id: 'coconut', name: 'Coconut Charcoal', icon: 'coal', cost: 140, text: 'Grills cook 30% faster.', apply: m => { m.grill *= 1.3; } },
  { id: 'stools', name: 'Plastic Stools', icon: 'stool', cost: 120, text: 'Customers wait 15% longer.', apply: m => { m.patience *= 1.15; } },
  { id: 'bell', name: 'Brass Bell', icon: 'bell', cost: 100, text: 'Rush combo window +3 s.', apply: m => { m.comboWindow += 3; } },
  { id: 'leaf', name: 'Banana Leaf Plates', icon: 'leaf', cost: 130, text: 'Tips +20%.', apply: m => { m.tip *= 1.2; } },
  { id: 'guard', name: 'Clay Burn Guard', icon: 'shield', cost: 100, text: 'Food burns 4 s later.', apply: m => { m.burnDelay += 4; } },
  { id: 'radio', name: 'Kroncong Radio', icon: 'radio', cost: 150, text: 'Rush hour drains patience 20% slower.', apply: m => { m.rushCalm = 0.8; } },
  { id: 'lantern', name: 'Paper Lantern Sign', icon: 'lantern', cost: 160, text: 'One more stool: up to 6 tickets.', apply: m => { m.seats = 6; } },
  { id: 'jar', name: 'Tip Jar', icon: 'jar', cost: 120, text: '+6 coins for each perfect plate.', apply: m => { m.perfectBonus += 6; } },
];

/** The kitchen's numbers with the owned upgrades applied. */
export function stallModifiers(owned) {
  const m = { chopTaps: 4, grindTaps: 4, walk: 1, wok: 1, grill: 1, patience: 1, comboWindow: 9, tip: 1, burnDelay: 7, rushCalm: 1, seats: 5, perfectBonus: 0, drain: 1 };
  for (const u of UPGRADES) if (owned.includes(u.id)) u.apply(m);
  return m;
}
