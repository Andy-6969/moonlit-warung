// Night 7: the pre-dawn sahur shift. A sleepy street and generous tips, until the whole
// neighbourhood wakes at once for the last meal before sunrise. The plating mats sit in a
// narrow corridor between two counters, so plates go down in the middle of the walk.
export const NIGHT_7 = {
  id: 7,
  name: 'Sahur Shift',
  place: 'Kampung Melayu, 3 a.m.',
  seconds: 195,
  menu: ['nasi_goreng', 'mie_goreng', 'mie_telor', 'nasi_lalap', 'tahu_penyet', 'telor_balado', 'gado_gado', 'sate_ayam'],
  regulars: ['han', 'agus', 'mei', 'wayan', 'rina', 'joko', 'sari'],
  spawn: { first: 4, start: 15, end: 8 },
  patience: { start: 60, end: 46 },
  goals: [520, 760, 1000],
  twist: 'Tips x1.5 all night; at 3:30 everyone wakes up hungry.',
  tipMul: 1.5,
  rush: { from: 0.62, to: 0.92, factor: 0.42 },
  map: [
    '#rnectaghlpX#',
    'B...........S',
    '#...##.##...S',
    'B...#P.P#...S',
    'M...#P.P#...S',
    '#...........#',
    'M...........#',
    '#WW#GG##WG#D#',
  ],
};
