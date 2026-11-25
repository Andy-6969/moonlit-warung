// Night 5: Ibu Ratna, the city's harshest food critic, takes a stool. Her ticket pays triple
// and her patience is short; the plating island is boxed in, so plan the walk around it.
export const NIGHT_5 = {
  id: 5,
  name: 'The Food Critic',
  place: 'Alun-Alun square',
  seconds: 180,
  menu: ['nasi_goreng', 'mie_goreng', 'sate_ayam', 'udang_bakar', 'tahu_telor', 'mie_udang', 'telor_balado'],
  regulars: ['darto', 'joko', 'ayu', 'udin', 'han', 'lusi', 'ratna'],
  spawn: { first: 3, start: 14, end: 8 },
  patience: { start: 58, end: 44 },
  goals: [420, 640, 860],
  twist: 'The critic orders twice: triple pay, half patience.',
  vip: 'ratna',
  map: [
    '#rnectaghlpX#',
    '#...........S',
    'B..#PPPP#...S',
    '#..#....#...S',
    'B..#.##.#...S',
    'M...........#',
    'M...........#',
    '#WWW##GGG#D##',
  ],
};
