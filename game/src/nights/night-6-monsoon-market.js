// Night 6: the monsoon market squeezes the stall around a concrete pillar. The kitchen splits in two
// halves joined by two gaps; the second wok and grill stand on the far side of the pillar.
export const NIGHT_6 = {
  id: 6,
  name: 'Monsoon Market',
  place: 'Pasar Basah under the flyover',
  seconds: 195,
  menu: ['nasi_goreng', 'mie_goreng', 'gado_gado', 'udang_bakar', 'nasi_sate', 'mie_udang', 'nasi_campur', 'nasi_udang'],
  regulars: ['darto', 'sari', 'ayu', 'udin', 'han', 'lusi', 'rina'],
  spawn: { first: 3, start: 13, end: 7.5 },
  patience: { start: 58, end: 42 },
  goals: [520, 760, 1000],
  twist: 'A pillar splits the kitchen: pick your side.',
  weather: 'rain',
  rush: { from: 0.5, to: 0.75, factor: 0.55 },
  map: [
    '#rnectaghlpX#',
    'B...........S',
    '#.PP..#..PP.S',
    'B.##.....##.S',
    'M.....#.....S',
    '#.....#.....#',
    'M..W..#..G..#',
    '#WW####GG#D##',
  ],
};
