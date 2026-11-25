// Night 9: a flashy rival stall opens across the alley. Guests leave 25% sooner, but the ones you
// keep tip more. Half the crates moved to the floor-side counter and the woks sit by the bin,
// so the long walk is the price of every fried dish.
export const NIGHT_9 = {
  id: 9,
  name: 'Rival Stall',
  place: 'Gang Mawar, facing Neon Noodle',
  seconds: 200,
  menu: ['nasi_goreng', 'gado_gado', 'udang_bakar', 'tahu_telor', 'mie_udang', 'nasi_campur', 'nasi_udang', 'tahu_penyet', 'sate_udang', 'nasi_lalap'],
  regulars: ['darto', 'sari', 'ayu', 'udin', 'han', 'lusi', 'rina', 'mei', 'agus', 'ratna'],
  spawn: { first: 3, start: 12, end: 7 },
  patience: { start: 58, end: 44 },
  goals: [640, 940, 1240],
  twist: 'Guests leave 25% sooner; tips x1.3 for the ones you keep.',
  patienceMul: 0.75,
  tipMul: 1.3,
  vip: 'ratna',
  map: [
    '#rnecta#WWX##',
    'B...........S',
    '#...PPP.....S',
    'B...###...#.S',
    'M.......#.#.S',
    'M...........#',
    '#...........#',
    '#ghlp#GGG##D#',
  ],
};
