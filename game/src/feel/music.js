// An original night-market loop: a five-note scale played on bright metallic bells over a soft gong
// pulse, scheduled ahead with WebAudio. It quickens when a rush hits and the clock runs low.
import { audioContext, masterOut } from './audio.js';

const SCALE = [293.7, 329.6, 392.0, 440.0, 523.3, 587.3, 659.3, 784.0];
const MELODY = [0, 2, 3, 2, 4, 3, 2, 0, 5, 4, 3, 4, 2, 3, 1, 0, 3, 4, 5, 7, 5, 4, 3, 2, 4, 3, 2, 3, 1, 2, 0, 0];

let timer = null;
let step = 0;
let next = 0;
let tempo = 1;
let on = true;

function bell(ac, out, f, t, vol) {
  for (const [mul, v] of [[1, vol], [2.76, vol * 0.3], [5.4, vol * 0.12]]) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine'; o.frequency.value = f * mul;
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0005, t + 0.9 / mul + 0.2);
    o.connect(g); g.connect(out); o.start(t); o.stop(t + 1.2);
  }
}

export function setMusicTempo(x) { tempo = x; }
export function setMusicOn(x) { on = x; }

export function startMusic() {
  const ac = audioContext();
  if (!ac || timer) return;
  const out = ac.createGain(); out.gain.value = 0.16; out.connect(masterOut());
  next = ac.currentTime + 0.1;
  timer = setInterval(() => {
    while (next < ac.currentTime + 0.3) {
      const beat = 0.26 / tempo;
      if (on) {
        const n = MELODY[step % MELODY.length];
        if (step % 2 === 0 || tempo > 1.1) bell(ac, out, SCALE[n], next, 0.22);
        if (step % 8 === 0) bell(ac, out, SCALE[0] / 4, next, 0.5);
        if (step % 4 === 2) bell(ac, out, SCALE[(n + 2) % SCALE.length] / 2, next, 0.1);
      }
      next += beat; step++;
    }
  }, 60);
}
