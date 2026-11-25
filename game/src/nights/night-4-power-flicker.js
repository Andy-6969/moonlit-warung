// Night 4: the generator coughs and the stall is rebuilt back to front: the crates sit by your feet
// and the fire is at the far wall, so every route through the kitchen has to be learned again.
export const NIGHT_4 = {
  id: 4,
  name: 'Power Flicker',
  place: 'Terminal Lama bus yard',
  seconds: 180,
  menu: ['nasi_goreng', 'sate_ayam', 'gado_gado', 'udang_bakar', 'nasi_sate', 'tahu_telor'],
  regulars: ['sari', 'joko', 'ayu', 'udin', 'han'],
  spawn: { first: 3, start: 15, end: 9 },
  patience: { start: 60, end: 45 },
  goals: [360, 560, 760],
  twist: 'Mirrored stall: crates at the front, fire at the back.',
  dark: true,
  rush: { from: 0.6, to: 0.8, factor: 0.55 },
  map: [
    '##WW##GG##DX#',
    '#...........S',
    'B....PPP....S',
    'B....###....S',
    '#...........S',
    'M...........#',
    '#...........#',
    '#rnectaghlp##',
  ],
};
