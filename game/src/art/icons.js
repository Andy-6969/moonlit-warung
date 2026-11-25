// Small painted icons for the twelve stall upgrades.
const INK = '#3b2314';

export function drawUpgradeIcon(ctx, icon, x, y, s) {
  ctx.save(); ctx.translate(x, y);
  ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
  const f = (c) => { ctx.fillStyle = c; ctx.fill(); ctx.stroke(); };
  ctx.beginPath();
  switch (icon) {
    case 'knife': ctx.moveTo(-s * 0.4, s * 0.1); ctx.lineTo(s * 0.25, -s * 0.2); ctx.lineTo(s * 0.3, -s * 0.05); ctx.closePath(); f('#e8edf2'); ctx.beginPath(); ctx.roundRect(-s * 0.48, s * 0.06, s * 0.2, s * 0.12, 3); f('#6b3a1a'); break;
    case 'mortar': ctx.ellipse(0, s * 0.1, s * 0.36, s * 0.22, 0, 0, Math.PI * 2); f('#7a7471'); ctx.beginPath(); ctx.roundRect(s * 0.05, -s * 0.42, s * 0.12, s * 0.42, 5); f('#9d9692'); break;
    case 'sandal': ctx.ellipse(-s * 0.15, 0, s * 0.14, s * 0.36, 0.2, 0, Math.PI * 2); f('#3a8ad9'); ctx.beginPath(); ctx.ellipse(s * 0.17, 0, s * 0.14, s * 0.36, -0.2, 0, Math.PI * 2); f('#3a8ad9'); break;
    case 'flame': ctx.moveTo(0, -s * 0.42); ctx.quadraticCurveTo(s * 0.4, 0, 0, s * 0.38); ctx.quadraticCurveTo(-s * 0.4, 0, 0, -s * 0.42); f('#ff8a2a'); ctx.beginPath(); ctx.moveTo(0, -s * 0.1); ctx.quadraticCurveTo(s * 0.18, s * 0.1, 0, s * 0.3); ctx.quadraticCurveTo(-s * 0.18, s * 0.1, 0, -s * 0.1); f('#3aa0ff'); break;
    case 'coal': for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-s * 0.2 + i * s * 0.2, (i % 2) * s * 0.1, s * 0.16, 0, Math.PI * 2); f(i === 1 ? '#ff6a2a' : '#3a2a22'); } break;
    case 'stool': ctx.ellipse(0, -s * 0.18, s * 0.34, s * 0.12, 0, 0, Math.PI * 2); f('#d6453a'); ctx.beginPath(); ctx.moveTo(-s * 0.28, -s * 0.12); ctx.lineTo(-s * 0.32, s * 0.38); ctx.moveTo(s * 0.28, -s * 0.12); ctx.lineTo(s * 0.32, s * 0.38); ctx.stroke(); break;
    case 'bell': ctx.moveTo(-s * 0.34, s * 0.22); ctx.quadraticCurveTo(-s * 0.3, -s * 0.38, 0, -s * 0.38); ctx.quadraticCurveTo(s * 0.3, -s * 0.38, s * 0.34, s * 0.22); ctx.closePath(); f('#e0b030'); ctx.beginPath(); ctx.arc(0, s * 0.3, s * 0.08, 0, Math.PI * 2); f('#a07a10'); break;
    case 'leaf': ctx.ellipse(0, 0, s * 0.42, s * 0.2, -0.5, 0, Math.PI * 2); f('#4f9a3a'); ctx.beginPath(); ctx.moveTo(-s * 0.34, s * 0.18); ctx.lineTo(s * 0.34, -s * 0.18); ctx.stroke(); break;
    case 'shield': ctx.moveTo(0, -s * 0.4); ctx.lineTo(s * 0.34, -s * 0.24); ctx.lineTo(s * 0.26, s * 0.18); ctx.lineTo(0, s * 0.4); ctx.lineTo(-s * 0.26, s * 0.18); ctx.lineTo(-s * 0.34, -s * 0.24); ctx.closePath(); f('#c4693a'); break;
    case 'radio': ctx.roundRect(-s * 0.4, -s * 0.22, s * 0.8, s * 0.5, 6); f('#8a5a2b'); ctx.beginPath(); ctx.arc(-s * 0.15, s * 0.03, s * 0.14, 0, Math.PI * 2); f('#2b1d14'); ctx.beginPath(); ctx.moveTo(s * 0.2, -s * 0.22); ctx.lineTo(s * 0.36, -s * 0.46); ctx.stroke(); break;
    case 'lantern': ctx.ellipse(0, 0, s * 0.26, s * 0.34, 0, 0, Math.PI * 2); f('#ff5a3a'); ctx.beginPath(); ctx.rect(-s * 0.12, -s * 0.42, s * 0.24, s * 0.08); f('#3a1a10'); break;
    case 'jar': ctx.roundRect(-s * 0.28, -s * 0.26, s * 0.56, s * 0.64, 8); f('#bfe3f0'); ctx.beginPath(); ctx.arc(0, s * 0.12, s * 0.12, 0, Math.PI * 2); f('#ffcf3a'); break;
    default: ctx.arc(0, 0, s * 0.3, 0, Math.PI * 2); f('#999');
  }
  ctx.restore();
}
