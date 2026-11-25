// Night 8: the football final on a big screen across the street. Guests glance at the match and
// wait less, and the final whistle sends the whole crowd to the counter for the last third.
// Three pillars of plating mats split the floor into lanes.
export const NIGHT_8 = {
  id: 8,
  name: 'Football Final',
  place: 'Lapangan Merdeka big screen',
  seconds: 200,
  menu: ['nasi_goreng', 'mie_goreng', 'sate_ayam', 'udang_bakar', 'nasi_sate', 'mie_udang', 'mie_telor', 'sate_udang', 'nasi_campur'],
  regulars: ['darto', 'joko', 'udin', 'agus', 'wayan', 'lusi', 'ayu', 'mei'],
  spawn: { first: 3, start: 13, end: 7.5 },
  patience: { start: 56, end: 42 },
  goals: [600, 880, 1150],
  twist: 'Guests wait 20% less; the final whistle starts a rush.',
  patienceMul: 0.8,
  rush: { from: 0.66, to: 1, factor: 0.45 },
  map: [
    '#rnectaghlpX#',
    'B...........S',
    '#..#..#..#..S',
    'B..P..P..P..S',
    'M..#..#..#..S',
    'M...........#',
    '#...........#',
    '#WWW#GGG#D#D#',
  ],
};
