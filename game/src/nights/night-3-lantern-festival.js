// Night 3: the lantern festival fills the street. Prawns, chili and lime arrive, the crowd is bigger
// and less patient, and a festival rush lands in the middle of service.
export const NIGHT_3 = {
  id: 3,
  name: 'Lantern Festival',
  place: 'Jalan Pelita riverside',
  seconds: 180,
  menu: ['nasi_goreng', 'mie_goreng', 'sate_ayam', 'gado_gado', 'udang_bakar', 'nasi_sate'],
  regulars: ['darto', 'sari', 'joko', 'ayu', 'udin'],
  spawn: { first: 3, start: 16, end: 9 },
  patience: { start: 62, end: 46 },
  goals: [320, 520, 700],
  twist: 'Festival rush at the halfway bell: orders come twice as fast.',
  events: [{ at: 0.72, id: 'street_band' }],
  rush: { from: 0.45, to: 0.7, factor: 0.5 },
  map: [
    '#rnectaghlpX#',
    'B...........S',
    '#..PP...PP..S',
    'B..##...##..S',
    'M...........S',
    '#...........#',
    'M...........#',
    '#WW##GGG##D##',
  ],
};
