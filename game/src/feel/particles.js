// Juice: knife chips, oil sparks, steam puffs, coin bursts, floating callouts (+38, PERFECT, NEAR MISS)
// and a little screen shake, so every chop and every serve answers the moment it happens.

export function makeFeel() {
  return { parts: [], texts: [], shake: 0, flash: 0, flashColor: '#fff' };
}

export function burst(feel, x, y, kind, n = 10) {
  const palette = {
    chips: ['#f7c4bd', '#e2b679', '#ffffff'],
    greens: ['#4f9a3a', '#8fcf6a'],
    sparks: ['#ffd24a', '#ff8a2a', '#fff3a0'],
    coins: ['#ffcf3a', '#ffe68a', '#e0a020'],
    smoke: ['#555', '#777', '#999'],
    paste: ['#c81e16', '#7a4519', '#e0452b'],
    confetti: ['#ff5a3a', '#ffcf3a', '#5ab05a', '#3a8ad9', '#ff7aa8'],
  }[kind] || ['#fff'];
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, sp = 60 + Math.random() * (kind === 'coins' || kind === 'confetti' ? 260 : 160);
    feel.parts.push({
      x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (kind === 'smoke' ? 40 : 120),
      g: kind === 'smoke' ? -30 : 520, life: kind === 'smoke' ? 1.2 : 0.7 + Math.random() * 0.4, age: 0,
      size: kind === 'smoke' ? 10 + Math.random() * 8 : 3 + Math.random() * 4,
      color: palette[i % palette.length], kind,
    });
  }
}

export function callout(feel, x, y, text, color = '#ffe9c4', size = 24, life = 1.2) {
  feel.texts.push({ x, y, text, color, size, life, age: 0 });
}

export function kick(feel, amount, flashColor) {
  feel.shake = Math.max(feel.shake, amount);
  if (flashColor) { feel.flash = 0.35; feel.flashColor = flashColor; }
}

export function tickFeel(feel, dt) {
  for (const p of feel.parts) { p.age += dt; p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.98; }
  feel.parts = feel.parts.filter(p => p.age < p.life);
  for (const tx of feel.texts) { tx.age += dt; tx.y -= 38 * dt; }
  feel.texts = feel.texts.filter(tx => tx.age < tx.life);
  feel.shake = Math.max(0, feel.shake - dt * 30);
  feel.flash = Math.max(0, feel.flash - dt);
}

export function drawFeel(ctx, feel) {
  for (const p of feel.parts) {
    const a = 1 - p.age / p.life;
    ctx.globalAlpha = p.kind === 'smoke' ? a * 0.5 : a;
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (p.kind === 'smoke' ? 1 + p.age : 1), 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  for (const tx of feel.texts) {
    const a = Math.min(1, (1 - tx.age / tx.life) * 2.5);
    const pop = tx.age < 0.12 ? 1 + (0.12 - tx.age) * 4 : 1;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(tx.x, tx.y); ctx.scale(pop, pop);
    ctx.font = `bold ${tx.size}px Trebuchet MS, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(30,12,8,0.9)'; ctx.strokeText(tx.text, 0, 0);
    ctx.fillStyle = tx.color; ctx.fillText(tx.text, 0, 0);
    ctx.restore();
  }
}

export function drawFlash(ctx, feel, w, h) {
  if (feel.flash <= 0) return;
  ctx.globalAlpha = feel.flash * 0.6;
  ctx.fillStyle = feel.flashColor; ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 1;
}
