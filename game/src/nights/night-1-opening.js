// Night 1: the stall's first night at Pasar Senja. Three dishes, a roomy kitchen, a gentle crowd.
// Map legend (13 x 8): # counter, . floor, P plating mat, B board, M mortar, W wok, G grill, D plates,
// X bin, S serving pass; lower-case letters are crates (see kitchen/grid.js CRATE_KEYS).
export const NIGHT_1 = {
  id: 1,
  name: 'Opening Night',
  place: 'Pasar Senja car park',
  seconds: 150,
  menu: ['nasi_goreng', 'mie_goreng', 'sate_ayam'],
  regulars: ['darto', 'sari', 'joko'],
  spawn: { first: 4, start: 20, end: 13 },
  patience: { start: 70, end: 58 },
  goals: [160, 280, 400],
  twist: 'Learn the line: wok, grill, board and mortar.',
  map: [
    '#rneca#g#D#X#',
    '#...........S',
    'B...........S',
    '#....PPP....S',
    'B....###....#',
    'M...........#',
    '#...........#',
    '##WW##GG##D##',
  ],
};
