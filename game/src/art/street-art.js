// The night market outside the pass: indigo sky, a full moon, strings of paper lanterns, the stalls
// across the street and the plastic stools where the regulars wait with their moods on their faces.
import { STREET, W } from '../core/screen.js';
import { drawFace } from './people-art.js';
import { drawDish } from './food-art.js';
import { REGULARS, moodOf } from '../service/customers.js';

export const SEAT_Y = i => STREET.y + 122 + i * 76;

export function drawSky(ctx, x, y, w, h, t, rain) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#141a3d'); g.addColorStop(1, '#2c2459');
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  for (let i = 0; i < 40; i++) {
    const sx = x + ((i * 97) % w), sy = y + ((i * 53) % Math.max(1, h * 0.7));
    ctx.fillStyle = `rgba(255,255,230,${0.3 + 0.3 * Math.sin(t * 2 + i)})`; ctx.fillRect(sx, sy, 2, 2);
  }
  if (rain) {
    ctx.strokeStyle = 'rgba(180,210,255,0.6)'; ctx.lineWidth = 2;
    for (let i = 0; i < 110; i++) {
      const rx = x + ((i * 61 + t * 400) % w), ry = y + ((i * 37 + t * 900) % h);
      ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 4, ry + 14); ctx.stroke();
    }
  }
}

export function drawLanterns(ctx, x0, x1, y, t, count = 9) {
  ctx.strokeStyle = '#1b1430'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.quadraticCurveTo((x0 + x1) / 2, y + 26, x1, y); ctx.stroke();
  const colors = ['#ff5a3a', '#ffb43a', '#ff7aa8', '#ffd84a'];
  for (let i = 0; i < count; i++) {
    const u = (i + 0.5) / count;
    const lx = x0 + (x1 - x0) * u;
    const ly = y + 26 * 4 * u * (1 - u) * 0.5 + 6 + Math.sin(t * 2 + i) * 1.5;
    const c = colors[i % colors.length];
    ctx.save();
    ctx.shadowColor = c; ctx.shadowBlur = 18;
    ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(lx, ly + 10, 9, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = 'rgba(60,20,10,0.6)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(lx - 9, ly + 10); ctx.lineTo(lx + 9, ly + 10); ctx.stroke();
    ctx.fillStyle = '#3a1a10'; ctx.fillRect(lx - 4, ly - 3, 8, 3); ctx.fillRect(lx - 4, ly + 21, 8, 3);
  }
}

export function drawMoon(ctx, x, y, r) {
  ctx.save();
  ctx.shadowColor = '#fff3c4'; ctx.shadowBlur = 30;
  ctx.fillStyle = '#fff1c1'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.fillStyle = 'rgba(220,200,150,0.5)';
  ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.2, r * 0.18, 0, Math.PI * 2); ctx.arc(x + r * 0.25, y + r * 0.25, r * 0.12, 0, Math.PI * 2); ctx.fill();
}

function farStalls(ctx, x, y, w, t) {
  const roofs = ['#d94a3a', '#3a8ad9', '#e0a530', '#5ab05a'];
  for (let i = 0; i < 4; i++) {
    const sx = x + 10 + i * (w / 4), sw = w / 4 - 16;
    ctx.fillStyle = '#1e1838'; ctx.fillRect(sx, y + 22, sw, 46);
    ctx.fillStyle = roofs[i]; ctx.beginPath(); ctx.moveTo(sx - 6, y + 24); ctx.lineTo(sx + sw / 2, y + 4); ctx.lineTo(sx + sw + 6, y + 24); ctx.fill();
    ctx.fillStyle = `rgba(255,210,120,${0.55 + 0.2 * Math.sin(t * 3 + i)})`; ctx.fillRect(sx + 6, y + 32, sw - 12, 16);
  }
}

/** Paving stones in staggered rows; on a rain night the low spots hold puddles that catch the lanterns. */
function drawPaving(ctx, x, y, w, h, t, rain) {
  ctx.fillStyle = '#3b2a4a'; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(20,10,30,0.45)'; ctx.lineWidth = 2;
  for (let row = 0, py = y; py < y + h; row++, py += 34) {
    ctx.beginPath(); ctx.moveTo(x, py); ctx.lineTo(x + w, py); ctx.stroke();
    for (let px = x + (row % 2 ? 26 : 0); px < x + w; px += 52) { ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py + 34); ctx.stroke(); }
  }
  if (!rain) return;
  for (let i = 0; i < 5; i++) {
    const px = x + 70 + ((i * 131) % (w - 110)), py = y + 40 + ((i * 197) % (h - 70));
    ctx.fillStyle = 'rgba(120,150,220,0.28)'; ctx.beginPath(); ctx.ellipse(px, py, 34, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(255,200,120,${0.18 + 0.08 * Math.sin(t * 3 + i)})`; ctx.beginPath(); ctx.ellipse(px - 6, py - 1, 12, 3, 0, 0, Math.PI * 2); ctx.fill();
  }
}

/** A plastic warung stool seen from the front: round seat, splayed legs. Locked stools are dim with a padlock. */
function drawStool(ctx, cx, cy, usable) {
  const top = usable ? '#d6453a' : '#4b3a55', leg = usable ? '#a8302a' : '#3a2c44';
  ctx.strokeStyle = leg; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx - 14, cy + 2); ctx.lineTo(cx - 19, cy + 24); ctx.moveTo(cx + 14, cy + 2); ctx.lineTo(cx + 19, cy + 24);
  ctx.moveTo(cx - 5, cy + 4); ctx.lineTo(cx - 6, cy + 22); ctx.moveTo(cx + 5, cy + 4); ctx.lineTo(cx + 6, cy + 22); ctx.stroke();
  ctx.lineCap = 'butt';
  ctx.fillStyle = leg; ctx.beginPath(); ctx.ellipse(cx, cy + 3, 21, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = top; ctx.beginPath(); ctx.ellipse(cx, cy, 21, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.ellipse(cx - 6, cy - 2, 8, 2, 0, 0, Math.PI * 2); ctx.fill();
  if (usable) return;
  ctx.fillStyle = '#8a7a99'; ctx.fillRect(cx - 6, cy - 18, 12, 10);
  ctx.strokeStyle = '#8a7a99'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy - 18, 4, Math.PI, 0); ctx.stroke();
}

/** The street side: backdrop, the bar counter, and each stool with its guest, mood and order. */
export function drawStreet(ctx, run, t) {
  const { x, y, w, h } = STREET;
  const rain = run.night.weather === 'rain';
  drawSky(ctx, x, y, w, h, t, rain);
  drawMoon(ctx, x + w - 46, y + 40, 22);
  farStalls(ctx, x, y + 6, w, t);
  drawPaving(ctx, x, y + 80, w, h - 80, t, rain);
  ctx.fillStyle = '#6b3f22'; ctx.fillRect(x, y + 80, 34, h - 80);
  ctx.strokeStyle = '#3b2314'; ctx.lineWidth = 2; ctx.strokeRect(x, y + 80, 34, h - 80);
  for (let i = 0; i < 6; i++) {
    const sy = SEAT_Y(i);
    const seat = run.seats[i];
    drawStool(ctx, x + 70, sy + 34, i < run.mods.seats);
    if (!seat) continue;
    const ticket = run.tickets.find(tk => tk.id === seat.ticket);
    let mood = 2, bob = 0, alpha = 1;
    if (ticket) mood = moodOf(ticket.patience / ticket.max).face;
    if (seat.state === 'leaving-angry') { mood = -1; alpha = Math.min(1, seat.anim); bob = (1 - Math.min(1, seat.anim)) * 30; }
    if (seat.state === 'eating') { mood = 2; bob = Math.sin(t * 10) * 2; alpha = Math.min(1, seat.anim); }
    ctx.globalAlpha = alpha;
    drawFace(ctx, seat.who, x + 70 + bob, sy + 6, 52, mood);
    ctx.globalAlpha = 1;
    const who = REGULARS[seat.who];
    ctx.font = 'bold 13px Trebuchet MS, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffe9c4'; ctx.fillText(who.name, x + 106, sy - 18);
    if (ticket) {
      const share = ticket.patience / ticket.max, m = moodOf(share);
      ctx.fillStyle = m.color; ctx.font = 'bold 12px Trebuchet MS, sans-serif'; ctx.fillText(m.label, x + 106, sy - 2);
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(x + 106, sy + 10, 120, 8);
      ctx.fillStyle = m.color; ctx.fillRect(x + 106, sy + 10, 120 * share, 8);
      ctx.fillStyle = '#fff8e8'; ctx.strokeStyle = '#3b2314'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x + 280, sy + 4, 30, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 252, sy + 14); ctx.lineTo(x + 236, sy + 22); ctx.lineTo(x + 256, sy + 20); ctx.fill();
      drawDish(ctx, ticket.recipe, x + 280, sy + 4, 50);
      if (share < 0.3 && Math.sin(t * 12) > 0) {
        ctx.fillStyle = '#ff4a3a'; ctx.font = 'bold 22px Trebuchet MS, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('!', x + 70, sy - 36);
      }
    } else if (seat.state === 'eating') {
      ctx.fillStyle = '#7fd47a'; ctx.font = 'bold 12px Trebuchet MS, sans-serif'; ctx.fillText('"' + who.lines.happy + '"', x + 106, sy + 2);
    } else if (seat.state === 'leaving-angry') {
      ctx.fillStyle = '#ff6a5a'; ctx.font = 'bold 12px Trebuchet MS, sans-serif'; ctx.fillText('"' + who.lines.angry + '"', x + 106, sy + 2);
    }
  }
  ctx.fillStyle = 'rgba(255,190,90,0.10)'; ctx.fillRect(x, y, Math.min(w, W - x), h);
  if (run.night.weather === 'rain') {
    ctx.strokeStyle = 'rgba(180,210,255,0.55)'; ctx.lineWidth = 2;
    for (let i = 0; i < 70; i++) {
      const rx = x + ((i * 47 + t * 300) % w), ry = y + ((i * 83 + t * 800) % h);
      ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 4, ry + 16); ctx.stroke();
    }
    ctx.fillStyle = '#ffe9c4'; ctx.font = 'bold 13px Trebuchet MS, sans-serif'; ctx.textAlign = 'right';
    ctx.fillText('RAIN: grill runs 25% slower', x + w - 8, y + h - 12);
  }
}
