// The nine regulars of the night market. Each has a face, a favourite dish, a temper and a few lines;
// their mood is read straight off how much patience their ticket has left.

export const REGULARS = {
  darto: { name: 'Pak Darto', role: 'becak driver', skin: '#b9784f', hair: '#2a2320', hat: 'cap', hatColor: '#d2442f', shirt: '#2f6fb0', fav: 'nasi_goreng', temper: 1.0,
    lines: { order: 'Nasi goreng, pedas!', wait: 'My becak is double-parked...', angry: 'Forget it!', happy: 'Mantap, Pak!' } },
  sari: { name: 'Bu Sari', role: 'batik seller', skin: '#c98b5f', hair: '#1d1716', hat: 'scarf', hatColor: '#9b3d7a', shirt: '#c9822b', fav: 'gado_gado', temper: 0.9,
    lines: { order: 'Extra peanut sauce, ya.', wait: 'Still waiting, dear.', angry: 'I will tell the whole market.', happy: 'Just like my mother made.' } },
  joko: { name: 'Mas Joko', role: 'night student', skin: '#d6a07a', hair: '#151515', hat: 'none', glasses: true, shirt: '#3a8a5c', fav: 'mie_goreng', temper: 1.25,
    lines: { order: 'Mie goreng before my exam!', wait: 'Exam in ten minutes...', angry: 'I failed AND I am hungry.', happy: 'Brain fuel!' } },
  ayu: { name: 'Neng Ayu', role: 'florist', skin: '#e0ac86', hair: '#2b1a12', hat: 'hijab', hatColor: '#3fa39a', shirt: '#f0e0c8', fav: 'sate_ayam', temper: 0.95,
    lines: { order: 'Sate, no rush... a little rush.', wait: 'The flowers are wilting.', angry: 'Never again!', happy: 'Wangi sekali!' } },
  udin: { name: 'Bang Udin', role: 'fisherman', skin: '#9c6440', hair: '#1a1410', hat: 'boonie', hatColor: '#6e7f3a', shirt: '#e3c34a', fav: 'udang_bakar', temper: 1.05,
    lines: { order: 'Prawns as big as my boat.', wait: 'I caught these faster.', angry: 'Back to sea!', happy: 'Sea-fresh, good job.' } },
  han: { name: 'Opa Han', role: 'retired tailor', skin: '#e2b896', hair: '#e8e4dc', hat: 'none', glasses: true, shirt: '#8a6a4f', fav: 'tahu_telor', temper: 0.7,
    lines: { order: 'Tahu telor, slowly, slowly.', wait: 'I have all night.', angry: 'Even I have limits.', happy: 'Like 1975 again.' } },
  lusi: { name: 'Mbak Lusi', role: 'bank teller', skin: '#d9a27c', hair: '#3a2418', hat: 'bun', shirt: '#e8e8f0', fav: 'mie_udang', temper: 1.15,
    lines: { order: 'Mie udang, I counted the minutes.', wait: 'That is 4 minutes 12.', angry: 'Overdrawn patience.', happy: 'Balance restored.' } },
  rina: { name: 'Kak Rina', role: 'night nurse', skin: '#c88a62', hair: '#20160f', hat: 'nurse', hatColor: '#ffffff', shirt: '#7fb6d6', fav: 'nasi_campur', temper: 1.1,
    lines: { order: 'Nasi campur, shift starts soon.', wait: 'Pagers are beeping...', angry: 'Code red, I am off.', happy: 'You saved a life. Mine.' } },
  ratna: { name: 'Ibu Ratna', role: 'food critic', skin: '#dcae8c', hair: '#0f0b0a', hat: 'shades', hatColor: '#111111', shirt: '#7a1f3d', fav: 'moonlit_feast', temper: 1.6, vip: true,
    lines: { order: 'Impress me.', wait: 'Tick. Tock.', angry: 'One star. Generous.', happy: 'Five stars. Write that down.' } },
};

export const REGULAR_IDS = Object.keys(REGULARS);

/** A mood the ticket and the stool show, from the share of patience left. */
export function moodOf(share) {
  if (share > 0.66) return { label: 'CHEERFUL', color: '#7fd47a', face: 2 };
  if (share > 0.4) return { label: 'WAITING', color: '#f2c94c', face: 1 };
  if (share > 0.18) return { label: 'RESTLESS', color: '#f2994a', face: 0 };
  return { label: 'FUMING', color: '#eb5757', face: -1 };
}

/** Picks who sits down next: a regular not already seated, leaning to their favourite dish on tonight's menu. */
export function pickCustomer(rng, night, seatedIds) {
  const free = night.regulars.filter(id => !seatedIds.includes(id));
  const pool = free.length ? free : night.regulars;
  return pool[Math.floor(rng() * pool.length)];
}

export function pickDish(rng, night, customerId) {
  const fav = REGULARS[customerId].fav;
  if (night.menu.includes(fav) && rng() < 0.4) return fav;
  return night.menu[Math.floor(rng() * night.menu.length)];
}
