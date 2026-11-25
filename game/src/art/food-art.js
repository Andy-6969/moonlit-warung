// Hand-drawn food: every raw good, prepared part and finished plate is painted here with canvas paths,
// gradients and a warm ink outline, so a dish reads at a glance even when the screen is shrunk.
import { RECIPE_BY_ID } from '../food/recipes.js';

const INK = '#3b2314';

function ell(ctx, x, y, rx, ry, fill, stroke = INK, lw = 2) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.stroke(); }
}

function gloss(ctx, x, y, rx, ry, a = 0.55) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, -0.5, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255,255,255,${a})`;
  ctx.fill();
}

function wobble(ctx, x, y, r, n, amp, seed, fill, stroke = INK) {
  ctx.beginPath();
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (1 + amp * Math.sin(a * 3 + seed) * Math.cos(a * 2 + seed * 1.7));
    const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr * 0.82;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.lineWidth = 2; ctx.strokeStyle = stroke; ctx.stroke(); }
}

function speckle(ctx, x, y, rx, ry, colors, count, seed) {
  let s = seed;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  for (let i = 0; i < count; i++) {
    const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd());
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.ellipse(x + Math.cos(a) * rx * d, y + Math.sin(a) * ry * d, 1.6 + rnd() * 1.8, 1.2 + rnd() * 1.2, rnd() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function riceDome(ctx, x, y, s, base, grains, seed) {
  const g = ctx.createRadialGradient(x - s * 0.12, y - s * 0.16, s * 0.05, x, y, s * 0.42);
  g.addColorStop(0, base[0]); g.addColorStop(1, base[1]);
  wobble(ctx, x, y, s * 0.36, 28, 0.05, seed, g);
  speckle(ctx, x, y - 2, s * 0.3, s * 0.22, grains, 26, seed * 7 + 3);
}

function bowl(ctx, x, y, s, sauce, bits) {
  ell(ctx, x, y + s * 0.04, s * 0.2, s * 0.15, '#c4693a');
  ell(ctx, x, y, s * 0.2, s * 0.13, '#e9d3b4');
  const g = ctx.createRadialGradient(x - s * 0.05, y - s * 0.04, 1, x, y, s * 0.17);
  g.addColorStop(0, sauce[0]); g.addColorStop(1, sauce[1]);
  ell(ctx, x, y + 1, s * 0.155, s * 0.1, g, null);
  speckle(ctx, x, y + 1, s * 0.11, s * 0.06, bits, 8, Math.round(x + y));
  gloss(ctx, x - s * 0.06, y - s * 0.02, s * 0.05, s * 0.02, 0.7);
}

function skewer(ctx, x, y, s, meat, char) {
  ctx.strokeStyle = '#c99a5b'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x - s * 0.4, y + s * 0.05); ctx.lineTo(x + s * 0.4, y - s * 0.05); ctx.stroke();
  for (let i = 0; i < 4; i++) {
    const cx = x - s * 0.22 + i * s * 0.14, cy = y + s * 0.03 - i * s * 0.018;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(0.2 * (i % 2 ? 1 : -1));
    ctx.beginPath(); ctx.roundRect(-s * 0.07, -s * 0.06, s * 0.14, s * 0.12, 4);
    ctx.fillStyle = meat; ctx.fill(); ctx.lineWidth = 1.6; ctx.strokeStyle = INK; ctx.stroke();
    if (char) { ctx.strokeStyle = char; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-s * 0.05, -s * 0.02); ctx.lineTo(s * 0.05, -s * 0.04); ctx.moveTo(-s * 0.05, s * 0.03); ctx.lineTo(s * 0.05, s * 0.01); ctx.stroke(); }
    ctx.restore();
  }
}

function prawnCurl(ctx, x, y, s, body, light, charred) {
  ctx.save(); ctx.translate(x, y);
  ctx.lineCap = 'round';
  ctx.strokeStyle = INK; ctx.lineWidth = s * 0.2;
  ctx.beginPath(); ctx.arc(0, 0, s * 0.17, Math.PI * 0.15, Math.PI * 1.55); ctx.stroke();
  ctx.strokeStyle = body; ctx.lineWidth = s * 0.16;
  ctx.beginPath(); ctx.arc(0, 0, s * 0.17, Math.PI * 0.15, Math.PI * 1.55); ctx.stroke();
  ctx.strokeStyle = light; ctx.lineWidth = s * 0.04;
  ctx.beginPath(); ctx.arc(0, 0, s * 0.2, Math.PI * 0.3, Math.PI * 1.4); ctx.stroke();
  ctx.strokeStyle = 'rgba(59,35,20,0.6)'; ctx.lineWidth = 1.5;
  for (let i = 0; i < 5; i++) {
    const a = Math.PI * (0.35 + i * 0.25);
    ctx.beginPath(); ctx.moveTo(Math.cos(a) * s * 0.1, Math.sin(a) * s * 0.1); ctx.lineTo(Math.cos(a) * s * 0.25, Math.sin(a) * s * 0.25); ctx.stroke();
  }
  ctx.fillStyle = body; ctx.strokeStyle = INK; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(s * 0.17, -s * 0.02); ctx.lineTo(s * 0.32, -s * 0.12); ctx.lineTo(s * 0.3, s * 0.08); ctx.closePath(); ctx.fill(); ctx.stroke();
  if (charred) { ctx.strokeStyle = '#5a2a12'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-s * 0.2, -s * 0.05); ctx.lineTo(-s * 0.08, -s * 0.16); ctx.moveTo(-s * 0.12, s * 0.12); ctx.lineTo(s * 0.02, -s * 0.02); ctx.stroke(); }
  ctx.restore();
}

function cubes(ctx, x, y, s, top, side, n = 5) {
  const pos = [[-0.14, 0.02], [0.02, -0.08], [0.15, 0.04], [-0.02, 0.12], [0.12, -0.16], [-0.18, -0.12]];
  for (let i = 0; i < n; i++) {
    const [dx, dy] = pos[i];
    const cx = x + dx * s, cy = y + dy * s, c = s * 0.09;
    ctx.fillStyle = side; ctx.strokeStyle = INK; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.rect(cx - c, cy - c * 0.4, c * 2, c * 1.6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = top;
    ctx.beginPath(); ctx.rect(cx - c, cy - c * 1.1, c * 2, c * 0.8); ctx.fill(); ctx.stroke();
  }
}

function leafPile(ctx, x, y, s, n, seed) {
  for (let i = 0; i < n; i++) {
    const a = seed + i * 2.399, d = s * 0.18 * Math.sqrt((i + 1) / n);
    const lx = x + Math.cos(a) * d, ly = y + Math.sin(a) * d * 0.8;
    ctx.save(); ctx.translate(lx, ly); ctx.rotate(a * 1.3);
    ctx.beginPath(); ctx.ellipse(0, 0, s * 0.11, s * 0.05, 0, 0, Math.PI * 2);
    ctx.fillStyle = i % 3 ? '#3f9a3a' : '#69c04f'; ctx.fill(); ctx.lineWidth = 1.3; ctx.strokeStyle = '#1f4a1b'; ctx.stroke();
    ctx.strokeStyle = '#b8e39a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-s * 0.09, 0); ctx.lineTo(s * 0.09, 0); ctx.stroke();
    ctx.restore();
  }
}

function noodleNest(ctx, x, y, s, color, dark, bits) {
  wobble(ctx, x, y, s * 0.34, 24, 0.07, 2, dark);
  ctx.lineWidth = 2.6; ctx.lineCap = 'round';
  for (let i = 0; i < 9; i++) {
    ctx.strokeStyle = i % 2 ? color : '#f0c66a';
    ctx.beginPath();
    const yy = y - s * 0.2 + i * s * 0.05;
    for (let t = 0; t <= 12; t++) {
      const xx = x - s * 0.26 + (t / 12) * s * 0.52;
      const w = Math.sin(t * 1.4 + i) * s * 0.03;
      t ? ctx.lineTo(xx, yy + w) : ctx.moveTo(xx, yy + w);
    }
    ctx.stroke();
  }
  if (bits) speckle(ctx, x, y, s * 0.24, s * 0.18, bits, 12, 5);
}

function friedEgg(ctx, x, y, s) {
  wobble(ctx, x, y, s * 0.3, 26, 0.12, 4, '#c9822b', null);
  wobble(ctx, x, y, s * 0.27, 26, 0.12, 4, '#fffaf0');
  const g = ctx.createRadialGradient(x - s * 0.04, y - s * 0.05, 1, x, y - s * 0.02, s * 0.12);
  g.addColorStop(0, '#ffd25a'); g.addColorStop(1, '#f08a12');
  ell(ctx, x + s * 0.02, y - s * 0.02, s * 0.11, s * 0.1, g);
  gloss(ctx, x - s * 0.02, y - s * 0.06, s * 0.04, s * 0.02, 0.85);
}

/** Paints one food item, raw or prepared, centred at (x, y), fitting in a box of size s. */
export function drawFood(ctx, id, x, y, s) {
  ctx.save();
  switch (id) {
    case 'rice': riceDome(ctx, x, y, s, ['#ffffff', '#dfe3ea'], ['#c8ccd6', '#ffffff'], 1); break;
    case 'fried_rice': riceDome(ctx, x, y, s, ['#f2b65a', '#c4772a'], ['#e0452b', '#4f9a3a', '#7a3d1a', '#ffd88a'], 3); gloss(ctx, x - s * 0.1, y - s * 0.1, s * 0.08, s * 0.03, 0.4); break;
    case 'noodles': noodleNest(ctx, x, y, s, '#f6d37a', '#e9b955', null); break;
    case 'fried_noodles': noodleNest(ctx, x, y, s, '#a8601f', '#6e3a14', ['#4f9a3a', '#e0452b', '#4f9a3a']); break;
    case 'egg':
      ell(ctx, x - s * 0.1, y + s * 0.02, s * 0.13, s * 0.17, '#d9efe6'); gloss(ctx, x - s * 0.14, y - s * 0.06, s * 0.03, s * 0.05);
      ell(ctx, x + s * 0.12, y - s * 0.02, s * 0.13, s * 0.17, '#cfe8dd'); gloss(ctx, x + s * 0.08, y - s * 0.1, s * 0.03, s * 0.05);
      break;
    case 'fried_egg': friedEgg(ctx, x, y, s); break;
    case 'chicken':
      wobble(ctx, x, y, s * 0.28, 22, 0.15, 1, '#f2a3a0'); gloss(ctx, x - s * 0.08, y - s * 0.08, s * 0.08, s * 0.04, 0.4);
      ell(ctx, x + s * 0.06, y + s * 0.02, s * 0.12, s * 0.07, '#f7c7bd', null);
      break;
    case 'diced_chicken': cubes(ctx, x, y, s, '#f7c4bd', '#e58e88', 6); break;
    case 'sate':
      skewer(ctx, x, y - s * 0.12, s, '#9a4b1e', '#3a1a0a'); skewer(ctx, x, y + s * 0.02, s, '#a5541f', '#3a1a0a'); skewer(ctx, x, y + s * 0.16, s, '#93451b', '#3a1a0a');
      break;
    case 'prawn': prawnCurl(ctx, x, y, s, '#8aa2b8', '#c4d6e4', false); break;
    case 'peeled_prawn': prawnCurl(ctx, x, y, s, '#f4c1b0', '#fff0ea', false); break;
    case 'grilled_prawn': prawnCurl(ctx, x - s * 0.08, y + s * 0.02, s * 0.85, '#f26b2a', '#ffc08a', true); prawnCurl(ctx, x + s * 0.12, y - s * 0.04, s * 0.85, '#ef5f24', '#ffc08a', true); break;
    case 'tofu':
      ctx.fillStyle = '#efe2c0'; ctx.strokeStyle = INK; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(x - s * 0.26, y - s * 0.16, s * 0.52, s * 0.34, 5); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fbf4e2'; ctx.beginPath(); ctx.roundRect(x - s * 0.26, y - s * 0.16, s * 0.52, s * 0.12, 5); ctx.fill(); ctx.stroke();
      break;
    case 'tofu_cubes': cubes(ctx, x, y, s, '#fbf4e2', '#e6d6ae', 6); break;
    case 'fried_tofu': cubes(ctx, x, y, s, '#e9a640', '#b86a1f', 5); gloss(ctx, x - s * 0.1, y - s * 0.1, s * 0.05, s * 0.02, 0.5); break;
    case 'greens':
      for (let i = 0; i < 5; i++) {
        ctx.save(); ctx.translate(x - s * 0.12 + i * s * 0.06, y + s * 0.2); ctx.rotate(-0.5 + i * 0.25);
        ctx.strokeStyle = '#8fcf6a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -s * 0.25); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(0, -s * 0.33, s * 0.06, s * 0.13, 0, 0, Math.PI * 2); ctx.fillStyle = '#3f9a3a'; ctx.fill(); ctx.strokeStyle = '#1f4a1b'; ctx.lineWidth = 1.4; ctx.stroke();
        ctx.restore();
      }
      break;
    case 'chopped_greens': leafPile(ctx, x, y, s, 14, 1.3); break;
    case 'chili':
      for (const [dx, rot, c] of [[-0.08, -0.4, '#e02b20'], [0.09, 0.3, '#c81e16']]) {
        ctx.save(); ctx.translate(x + dx * s, y); ctx.rotate(rot);
        ctx.beginPath(); ctx.moveTo(0, -s * 0.22); ctx.quadraticCurveTo(s * 0.1, 0, 0, s * 0.26); ctx.quadraticCurveTo(-s * 0.06, 0, 0, -s * 0.22);
        ctx.fillStyle = c; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.6; ctx.stroke();
        ctx.fillStyle = '#3f8a2a'; ctx.fillRect(-s * 0.03, -s * 0.28, s * 0.06, s * 0.07);
        gloss(ctx, s * 0.02, -s * 0.06, s * 0.015, s * 0.07, 0.6);
        ctx.restore();
      }
      break;
    case 'sambal': bowl(ctx, x, y, s * 1.5, ['#ff5a3a', '#a8160c'], ['#ffd2a0', '#5a0a05']); break;
    case 'peanut':
      for (let i = 0; i < 5; i++) {
        const px = x - s * 0.16 + (i % 3) * s * 0.16, py = y - s * 0.07 + Math.floor(i / 3) * s * 0.16;
        ctx.save(); ctx.translate(px, py); ctx.rotate(i * 0.9);
        ell(ctx, -s * 0.04, 0, s * 0.06, s * 0.05, '#d9b07a', INK, 1.4); ell(ctx, s * 0.04, 0, s * 0.06, s * 0.05, '#d9b07a', INK, 1.4);
        ctx.restore();
      }
      break;
    case 'peanut_sauce': bowl(ctx, x, y, s * 1.5, ['#c98a45', '#7a4519'], ['#e8c48a', '#5a3010']); break;
    case 'lime':
      ell(ctx, x, y, s * 0.24, s * 0.22, '#7bc043'); ell(ctx, x, y, s * 0.17, s * 0.15, '#9bd65e', null);
      gloss(ctx, x - s * 0.08, y - s * 0.08, s * 0.05, s * 0.03, 0.6);
      break;
    case 'lime_wedge':
      ctx.beginPath(); ctx.moveTo(x - s * 0.2, y + s * 0.08); ctx.arc(x, y + s * 0.08, s * 0.2, Math.PI, Math.PI * 2); ctx.closePath();
      ctx.fillStyle = '#5c9e2e'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.8; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - s * 0.16, y + s * 0.08); ctx.arc(x, y + s * 0.08, s * 0.16, Math.PI, Math.PI * 2); ctx.closePath();
      ctx.fillStyle = '#d9f0a0'; ctx.fill();
      ctx.strokeStyle = '#8cc05a'; ctx.lineWidth = 1.2;
      for (let i = 1; i < 4; i++) { const a = Math.PI + i * Math.PI / 4; ctx.beginPath(); ctx.moveTo(x, y + s * 0.08); ctx.lineTo(x + Math.cos(a) * s * 0.15, y + s * 0.08 + Math.sin(a) * s * 0.15); ctx.stroke(); }
      break;
    case 'burnt':
      wobble(ctx, x, y + s * 0.04, s * 0.26, 18, 0.2, 6, '#2a221d');
      speckle(ctx, x, y, s * 0.2, s * 0.12, ['#4a3a30', '#120d0a', '#ff6a1a'], 12, 9);
      ctx.strokeStyle = 'rgba(200,200,200,0.7)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x - s * 0.08, y - s * 0.12); ctx.bezierCurveTo(x - s * 0.2, y - s * 0.25, x + s * 0.05, y - s * 0.3, x - s * 0.04, y - s * 0.42); ctx.stroke();
      break;
    case 'plate': drawPlate(ctx, { parts: [] }, x, y, s); break;
    default:
      ell(ctx, x, y, s * 0.2, s * 0.2, '#bbb');
  }
  ctx.restore();
}

// Where each part sits on a plate: the base in the middle, toppings on it, skewers and prawns at the side,
// sauces in little clay bowls at the rim, lime at the front.
const SLOT = {
  rice: 'base', fried_rice: 'base', fried_noodles: 'base', chopped_greens: 'base',
  fried_egg: 'top', fried_tofu: 'top',
  sate: 'side', grilled_prawn: 'side',
  sambal: 'bowl', peanut_sauce: 'bowl',
  lime_wedge: 'garnish',
};
const SPOTS = {
  base: [[-0.04, 0.02, 0.62], [0.12, 0.08, 0.5]],
  top: [[0.06, -0.08, 0.5], [-0.12, 0.1, 0.44]],
  side: [[0.12, 0.13, 0.62], [-0.05, 0.2, 0.56]],
  bowl: [[-0.24, -0.16, 0.5], [0.26, -0.18, 0.5]],
  garnish: [[-0.27, 0.17, 0.4], [0.28, 0.2, 0.4]],
};
const ORDER = ['base', 'side', 'top', 'bowl', 'garnish'];

/** A banana-leaf plate with whatever parts are on it, laid out like a served dish. */
export function drawPlate(ctx, plate, x, y, s, glow = 0) {
  ctx.save();
  if (glow) {
    ctx.shadowColor = `rgba(255,214,90,${0.9 * glow})`;
    ctx.shadowBlur = 22 * glow;
  }
  ell(ctx, x, y + s * 0.04, s * 0.47, s * 0.38, '#b9b2a6', null);
  ell(ctx, x, y, s * 0.47, s * 0.38, '#fbf7ef', INK, 2.2);
  ctx.shadowBlur = 0;
  ell(ctx, x, y, s * 0.38, s * 0.3, '#efe8da', null);
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.35);
  ctx.beginPath(); ctx.ellipse(0, 0, s * 0.4, s * 0.2, 0, 0, Math.PI * 2);
  const lg = ctx.createLinearGradient(-s * 0.4, 0, s * 0.4, 0);
  lg.addColorStop(0, '#3e8f2f'); lg.addColorStop(0.5, '#5fb043'); lg.addColorStop(1, '#3e8f2f');
  ctx.fillStyle = lg; ctx.fill(); ctx.strokeStyle = '#24561c'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.strokeStyle = 'rgba(220,255,190,0.6)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(-s * 0.38, 0); ctx.lineTo(s * 0.38, 0); ctx.stroke();
  for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * s * 0.1, 0); ctx.lineTo(i * s * 0.1 + s * 0.06, -s * 0.15); ctx.moveTo(i * s * 0.1, 0); ctx.lineTo(i * s * 0.1 + s * 0.06, s * 0.15); ctx.stroke(); }
  ctx.restore();
  const used = {};
  const parts = [...plate.parts].sort((a, b) => ORDER.indexOf(SLOT[a]) - ORDER.indexOf(SLOT[b]));
  for (const p of parts) {
    const slot = SLOT[p] || 'base';
    const i = used[slot] = (used[slot] ?? -1) + 1;
    const [dx, dy, k] = SPOTS[slot][Math.min(i, 1)];
    drawFood(ctx, p, x + dx * s, y + dy * s, s * k);
  }
  ctx.restore();
}

/** A finished dish of a recipe (for tickets, the menu book and the results screen). */
export function drawDish(ctx, recipeId, x, y, s, glow = 0) {
  drawPlate(ctx, { parts: RECIPE_BY_ID[recipeId].parts }, x, y, s, glow);
}

/** Wisps of steam over hot food; `t` is the clock so they drift. */
export function drawSteam(ctx, x, y, s, t, alpha = 0.6) {
  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const ph = (t * 0.8 + i * 0.33) % 1;
    ctx.strokeStyle = `rgba(255,255,255,${alpha * (1 - ph)})`;
    ctx.lineWidth = 3 + s * 0.03;
    const bx = x + (i - 1) * s * 0.18, by = y - ph * s * 0.6;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.bezierCurveTo(bx + s * 0.08, by - s * 0.1, bx - s * 0.08, by - s * 0.18, bx + s * 0.02, by - s * 0.28);
    ctx.stroke();
  }
  ctx.restore();
}
