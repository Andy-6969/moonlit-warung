// Faces of the regulars (with a mood you can read from the mouth and brows) and the cook in her
// red batik headband, seen from above as she works the line.
import { REGULARS } from '../service/customers.js';

const INK = '#3b2314';

function hat(ctx, who, x, y, s) {
  const c = who.hatColor || '#333';
  ctx.fillStyle = c; ctx.strokeStyle = INK; ctx.lineWidth = 2;
  switch (who.hat) {
    case 'cap':
      ctx.beginPath(); ctx.arc(x, y - s * 0.12, s * 0.33, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(x + s * 0.2, y - s * 0.12, s * 0.22, s * 0.06, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      break;
    case 'scarf':
    case 'hijab':
      ctx.beginPath(); ctx.arc(x, y, s * 0.4, Math.PI * 0.95, Math.PI * 2.05); ctx.lineTo(x + s * 0.42, y + s * 0.45); ctx.lineTo(x - s * 0.42, y + s * 0.45); ctx.closePath(); ctx.fill(); ctx.stroke();
      if (who.hat === 'scarf') { ctx.fillStyle = 'rgba(255,220,120,0.7)'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(x - s * 0.28 + i * s * 0.14, y - s * 0.28 + (i % 2) * 6, 3, 0, Math.PI * 2); ctx.fill(); } }
      break;
    case 'boonie':
      ctx.beginPath(); ctx.ellipse(x, y - s * 0.18, s * 0.46, s * 0.1, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y - s * 0.2, s * 0.27, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      break;
    case 'nurse':
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(x - s * 0.22, y - s * 0.45, s * 0.44, s * 0.16, 4); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#d33'; ctx.fillRect(x - 3, y - s * 0.43, 6, s * 0.12); ctx.fillRect(x - s * 0.06, y - s * 0.39, s * 0.12, 5);
      break;
    case 'bun':
      ctx.fillStyle = who.hair; ctx.beginPath(); ctx.arc(x, y - s * 0.4, s * 0.13, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      break;
    default: break;
  }
}

/** A regular's portrait. `mood` is the face level from moodOf: 2 cheerful ... -1 fuming. */
export function drawFace(ctx, id, x, y, s, mood = 2, shoulders = true) {
  const who = REGULARS[id];
  ctx.save();
  if (shoulders) {
    ctx.fillStyle = who.shirt; ctx.strokeStyle = INK; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(x, y + s * 0.62, s * 0.5, s * 0.3, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  if (who.hat !== 'hijab' && who.hat !== 'scarf') {
    ctx.fillStyle = who.hair; ctx.beginPath(); ctx.arc(x, y - s * 0.04, s * 0.36, Math.PI * 0.9, Math.PI * 2.1); ctx.fill();
  }
  if (who.hat === 'hijab' || who.hat === 'scarf') hat(ctx, who, x, y, s);
  const face = mood < 0 ? '#e9876a' : who.skin;
  ctx.fillStyle = face; ctx.strokeStyle = INK; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(x, y + s * 0.04, s * 0.3, s * 0.34, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  if (who.hair && who.hat !== 'hijab' && who.hat !== 'scarf') {
    ctx.fillStyle = who.hair; ctx.beginPath(); ctx.ellipse(x - s * 0.08, y - s * 0.24, s * 0.26, s * 0.1, -0.3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = 'rgba(230,90,80,0.35)';
  ctx.beginPath(); ctx.arc(x - s * 0.18, y + s * 0.12, s * 0.06, 0, Math.PI * 2); ctx.arc(x + s * 0.18, y + s * 0.12, s * 0.06, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = INK;
  const ey = y - s * 0.02;
  if (who.hat === 'shades') {
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.roundRect(x - s * 0.27, ey - s * 0.07, s * 0.24, s * 0.12, 4); ctx.roundRect(x + s * 0.03, ey - s * 0.07, s * 0.24, s * 0.12, 4); ctx.fill();
    ctx.fillRect(x - s * 0.04, ey - s * 0.04, s * 0.08, 3);
  } else {
    ctx.beginPath(); ctx.arc(x - s * 0.12, ey, s * 0.04, 0, Math.PI * 2); ctx.arc(x + s * 0.12, ey, s * 0.04, 0, Math.PI * 2); ctx.fill();
    if (who.glasses) { ctx.strokeStyle = INK; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(x - s * 0.12, ey, s * 0.09, 0, Math.PI * 2); ctx.moveTo(x + s * 0.21, ey); ctx.arc(x + s * 0.12, ey, s * 0.09, 0, Math.PI * 2); ctx.stroke(); }
  }
  ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
  if (mood <= 0) {
    const tilt = mood < 0 ? 0.09 : 0.04;
    ctx.beginPath(); ctx.moveTo(x - s * 0.2, ey - s * 0.12 - tilt * s); ctx.lineTo(x - s * 0.06, ey - s * 0.09); ctx.moveTo(x + s * 0.2, ey - s * 0.12 - tilt * s); ctx.lineTo(x + s * 0.06, ey - s * 0.09); ctx.stroke();
  }
  ctx.beginPath();
  const my = y + s * 0.2;
  if (mood >= 2) ctx.arc(x, my - s * 0.04, s * 0.1, 0.15 * Math.PI, 0.85 * Math.PI);
  else if (mood === 1) { ctx.moveTo(x - s * 0.08, my); ctx.lineTo(x + s * 0.08, my); }
  else if (mood === 0) ctx.arc(x, my + s * 0.08, s * 0.08, 1.2 * Math.PI, 1.8 * Math.PI);
  else { ctx.arc(x, my + s * 0.1, s * 0.11, 1.15 * Math.PI, 1.85 * Math.PI); }
  ctx.stroke();
  if (who.hat !== 'hijab' && who.hat !== 'scarf') hat(ctx, who, x, y, s);
  if (mood < 0) {
    ctx.strokeStyle = '#d0201a'; ctx.lineWidth = 2.5;
    const vx = x + s * 0.28, vy = y - s * 0.3;
    ctx.beginPath(); ctx.moveTo(vx - 6, vy - 2); ctx.lineTo(vx - 2, vy - 2); ctx.lineTo(vx - 2, vy - 6); ctx.moveTo(vx + 6, vy - 2); ctx.lineTo(vx + 2, vy - 2); ctx.lineTo(vx + 2, vy - 6);
    ctx.moveTo(vx - 6, vy + 2); ctx.lineTo(vx - 2, vy + 2); ctx.lineTo(vx - 2, vy + 6); ctx.moveTo(vx + 6, vy + 2); ctx.lineTo(vx + 2, vy + 2); ctx.lineTo(vx + 2, vy + 6); ctx.stroke();
  }
  ctx.restore();
}

/** The cook, seen from above: headband, apron, arms out toward whatever she carries. */
export function drawChef(ctx, chef, x, y, t, holdingDraw) {
  ctx.save();
  const bob = chef.moving ? Math.sin(chef.step * Math.PI) * 2 : 0;
  const busy = chef.busy > 0 ? Math.sin(t * 50) * 3 : 0;
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(x, y + 18, 22, 9, 0, 0, Math.PI * 2); ctx.fill();
  const fx = chef.dir.x, fy = chef.dir.y;
  ctx.translate(x, y + bob);
  ctx.scale(1.3, 1.3);
  ctx.fillStyle = '#f5ecd8'; ctx.strokeStyle = INK; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 6, 20, 16, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#2f6f6a'; ctx.beginPath(); ctx.ellipse(0, 8, 13, 11, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e8b48a';
  const hx = fx * 18 + busy, hy = fy * 14 + 4;
  ctx.beginPath(); ctx.arc(hx - fy * 12, hy + fx * 4, 6, 0, Math.PI * 2); ctx.arc(hx + fy * 12, hy - fx * 4 + 2, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#d9a07a'; ctx.beginPath(); ctx.arc(fx * 3, -8 + fy * 3, 14, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#1d1512'; ctx.beginPath(); ctx.arc(-fx * 2, -10 - fy * 2, 12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#c62f24'; ctx.beginPath(); ctx.ellipse(-fx * 2, -12 - fy * 2, 13, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#f2c14e'; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.arc(-fx * 2 + i * 6, -12 - fy * 2, 1.8, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = '#c62f24'; ctx.beginPath(); ctx.moveTo(-fx * 10 - 4, -6 - fy * 10); ctx.lineTo(-fx * 18 - 6, -2 - fy * 18 + Math.sin(t * 8) * 2); ctx.lineTo(-fx * 16, 2 - fy * 16); ctx.fill();
  ctx.restore();
  if (holdingDraw) holdingDraw(x + fx * 22, y - 30 + bob + fy * 6);
}
