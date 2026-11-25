// Shared UI pieces for the menu screens: chunky buttons, panels and wrapped text.

export function panel(ctx, x, y, w, h, fill = 'rgba(29,18,36,0.92)', edge = '#c9a26a') {
  ctx.fillStyle = fill; ctx.strokeStyle = edge; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 14); ctx.fill(); ctx.stroke();
}

export function button(ctx, b, hot, t = 0) {
  const lift = hot ? 2 : 0;
  ctx.fillStyle = '#3b2314'; ctx.beginPath(); ctx.roundRect(b.x, b.y + 5, b.w, b.h, 12); ctx.fill();
  ctx.fillStyle = b.primary ? (hot ? '#ff8a4a' : '#e8622f') : (hot ? '#5a4470' : '#43305a');
  ctx.beginPath(); ctx.roundRect(b.x, b.y - lift, b.w, b.h, 12); ctx.fill();
  ctx.strokeStyle = '#ffe9c4'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#fff6e6'; ctx.font = `bold ${b.size || 20}px Trebuchet MS, sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2 - lift);
  if (b.key) {
    ctx.font = 'bold 11px Trebuchet MS, sans-serif'; ctx.fillStyle = 'rgba(255,246,230,0.7)';
    ctx.fillText(b.key, b.x + b.w - 18, b.y + b.h - 10 - lift);
  }
}

export const inside = (p, b) => p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h;

/** Which of the buttons was clicked this frame, if any. */
export function clicked(input, buttons) {
  for (const c of input.clicks) for (const b of buttons) if (inside(c, b)) return b;
  return null;
}

export function wrap(ctx, text, x, y, maxW, lineH) {
  const words = text.split(' ');
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line, x, y); line = w; y += lineH; }
    else line = test;
  }
  if (line) ctx.fillText(line, x, y);
  return y + lineH;
}
