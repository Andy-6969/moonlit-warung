// Every sound is synthesised with WebAudio at the moment it plays (no files): a knife tock, a stone
// pound, oil sizzle, the brass serve bell, coins, a grumble when a guest walks out, the closing gong.

let ac = null;
let master = null;
let muted = false;

export function unlockAudio() {
  if (ac) { if (ac.state === 'suspended') ac.resume(); return ac; }
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  ac = new Ctx();
  master = ac.createGain(); master.gain.value = 0.5; master.connect(ac.destination);
  return ac;
}

export function audioContext() { return ac; }
export function masterOut() { return master; }
export function toggleMute() { muted = !muted; if (master) master.gain.value = muted ? 0 : 0.5; return muted; }

function tone(freq, dur, type = 'sine', vol = 0.3, slide = 0, delay = 0) {
  if (!ac || muted) return;
  const t0 = ac.currentTime + delay;
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t0);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
  g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + dur + 0.05);
}

function noise(dur, vol = 0.2, filterFreq = 2000, type = 'bandpass', delay = 0) {
  if (!ac || muted) return;
  const t0 = ac.currentTime + delay;
  const len = Math.floor(ac.sampleRate * dur);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ac.createBufferSource(); src.buffer = buf;
  const f = ac.createBiquadFilter(); f.type = type; f.frequency.value = filterFreq;
  const g = ac.createGain(); g.gain.value = vol;
  src.connect(f); f.connect(g); g.connect(master); src.start(t0);
}

export const SFX = {
  chop: p => { noise(0.05, 0.5, 3200); tone(180 + p * 120, 0.06, 'triangle', 0.25); },
  grind: () => { noise(0.12, 0.35, 500, 'lowpass'); tone(90, 0.1, 'sine', 0.3); },
  prepDone: () => { tone(880, 0.08, 'triangle', 0.2); tone(1320, 0.12, 'triangle', 0.18, 0, 0.06); },
  pickup: () => tone(520, 0.06, 'square', 0.08, 120),
  drop: () => tone(300, 0.07, 'triangle', 0.15, -80),
  sizzle: () => noise(0.6, 0.22, 5000, 'highpass'),
  cooked: () => { tone(660, 0.1, 'sine', 0.2); tone(990, 0.15, 'sine', 0.15, 0, 0.08); },
  burnt: () => { noise(0.5, 0.3, 300, 'lowpass'); tone(110, 0.4, 'sawtooth', 0.12, -40); },
  plate: () => tone(1046, 0.09, 'sine', 0.18),
  plateDone: () => { tone(1046, 0.1, 'sine', 0.2); tone(1318, 0.1, 'sine', 0.2, 0, 0.07); tone(1568, 0.2, 'sine', 0.2, 0, 0.14); },
  serve: combo => { tone(1760, 0.9, 'sine', 0.25); tone(2637, 0.6, 'sine', 0.08); for (let i = 0; i < Math.min(5, combo); i++) tone(784 * Math.pow(1.122, i), 0.08, 'square', 0.06, 0, 0.05 + i * 0.05); },
  reject: () => { tone(160, 0.12, 'square', 0.12); tone(120, 0.16, 'square', 0.12, 0, 0.1); },
  order: () => { tone(1200, 0.05, 'triangle', 0.12); tone(1500, 0.05, 'triangle', 0.12, 0, 0.06); },
  walkout: () => { tone(220, 0.3, 'sawtooth', 0.12, -120); noise(0.2, 0.15, 800); },
  bin: () => noise(0.15, 0.25, 900, 'lowpass'),
  tick: () => tone(2000, 0.03, 'square', 0.06),
  gong: () => { tone(98, 2.5, 'sine', 0.35); tone(196, 2.0, 'sine', 0.15); tone(147, 2.2, 'triangle', 0.08); },
  click: () => tone(700, 0.04, 'triangle', 0.12),
};
