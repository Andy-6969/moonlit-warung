// The market map: seven nights strung along the river like lanterns. Pick one to see its menu,
// its twist, who comes to eat and the three star goals, then open the stall.
import { W, H } from '../core/screen.js';
import { NIGHTS, newDishes } from '../nights/campaign.js';
import { RECIPE_BY_ID } from '../food/recipes.js';
import { drawSky, drawMoon } from '../art/street-art.js';
import { drawDish } from '../art/food-art.js';
import { drawFace } from '../art/people-art.js';
import { drawLogo, star } from '../ui/hud.js';
import { panel, button, clicked, inside, wrap } from '../ui/widgets.js';

export const NODES = [[110, 640], [230, 520], [150, 390], [300, 290], [450, 380], [500, 560], [610, 450]];

export function createMapScene(app) {
  const save = app.save;
  const buttons = [
    { id: 'cook', label: 'Cook this night', x: 820, y: 690, w: 260, h: 54, primary: true, key: 'SPACE' },
    { id: 'shop', label: 'Upgrades', x: 1090, y: 690, w: 160, h: 54, size: 18 },
    { id: 'book', label: 'Recipes', x: 690, y: 700, w: 120, h: 44, size: 16 },
  ];
  const scene = { hot: null, hotNode: -1 };
  scene.update = (dt, input) => {
    scene.hot = buttons.find(b => inside(input.mouse, b)) || null;
    scene.hotNode = NODES.findIndex(([x, y]) => Math.hypot(input.mouse.x - x, input.mouse.y - y) < 36);
    for (const c of input.clicks) {
      const i = NODES.findIndex(([x, y]) => Math.hypot(c.x - x, c.y - y) < 36);
      if (i >= 0 && i <= save.unlocked) save.selected = i;
    }
    if (input.hit('ArrowRight') || input.hit('KeyD')) save.selected = Math.min(save.unlocked, save.selected + 1);
    if (input.hit('ArrowLeft') || input.hit('KeyA')) save.selected = Math.max(0, save.selected - 1);
    const b = clicked(input, buttons);
    if (input.hit('Space') || input.hit('Enter') || b?.id === 'cook') app.startNight(save.selected);
    else if (b?.id === 'shop') app.goto('shop');
    else if (b?.id === 'book') app.goto('book');
    else if (input.hit('Escape')) app.goto('title');
  };
  scene.draw = (ctx, t) => drawMap(ctx, t, save, scene, buttons);
  return scene;
}

export function drawMap(ctx, t, save, scene, buttons) {
  drawSky(ctx, 0, 0, W, H, t, false);
  drawMoon(ctx, 600, 110, 44);
  drawLogo(ctx, 30, 40, 30);
  ctx.fillStyle = '#ffe9c4'; ctx.font = '16px Trebuchet MS, sans-serif'; ctx.textAlign = 'left';
  ctx.fillText(`Market map · purse ${save.purse} coins · ${save.stars.reduce((a, b) => a + b, 0)} of 21 stars`, 30, 72);
  ctx.strokeStyle = '#2f6fb0'; ctx.lineWidth = 34; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); NODES.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
  ctx.strokeStyle = '#4a8ad0'; ctx.lineWidth = 22; ctx.stroke();
  ctx.setLineDash([10, 12]); ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 3; ctx.lineDashOffset = -t * 20; ctx.stroke(); ctx.setLineDash([]);
  NODES.forEach(([x, y], i) => {
    const open = i <= save.unlocked, sel = save.selected === i;
    ctx.save();
    if (open) { ctx.shadowColor = '#ffb43a'; ctx.shadowBlur = sel ? 36 : 16; }
    ctx.fillStyle = open ? (sel ? '#ffcf3a' : '#ff7a3a') : '#4b3a55';
    ctx.beginPath(); ctx.ellipse(x, y, sel ? 32 : 26, sel ? 38 : 31, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = '#3b1a10'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#3b1a10'; ctx.font = 'bold 24px Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(open ? String(i + 1) : '?', x, y + 1);
    for (let s = 0; s < 3; s++) star(ctx, x - 20 + s * 20, y + 48, 8, save.stars[i] > s);
    ctx.fillStyle = open ? '#ffe9c4' : 'rgba(255,233,196,0.4)'; ctx.font = 'bold 13px Trebuchet MS, sans-serif';
    ctx.fillText(NIGHTS[i].name, x, y - 50);
  });
  const n = NIGHTS[save.selected];
  panel(ctx, 690, 30, 570, 650);
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffcf5a'; ctx.font = 'bold 15px Trebuchet MS, sans-serif'; ctx.fillText(`NIGHT ${n.id} OF 7 · ${Math.floor(n.seconds / 60)}:${String(n.seconds % 60).padStart(2, '0')} of service`, 716, 62);
  ctx.fillStyle = '#fff3dc'; ctx.font = 'bold 36px Georgia, serif'; ctx.fillText(n.name, 716, 100);
  ctx.fillStyle = '#e9cfa8'; ctx.font = 'italic 17px Georgia, serif'; ctx.fillText(n.place, 716, 134);
  ctx.fillStyle = '#ff9a6a'; ctx.font = 'bold 16px Trebuchet MS, sans-serif'; wrap(ctx, `Twist: ${n.twist}`, 716, 166, 520, 20);
  ctx.fillStyle = '#ffe9c4'; ctx.font = 'bold 14px Trebuchet MS, sans-serif'; ctx.fillText(`MENU: ${n.menu.length} DISHES`, 716, 214);
  const fresh = newDishes(save.selected);
  n.menu.forEach((rid, i) => {
    const x = 748 + (i % 6) * 86, y = 262 + Math.floor(i / 6) * 96;
    drawDish(ctx, rid, x, y, 70, fresh.includes(rid) ? 0.8 : 0);
    ctx.fillStyle = fresh.includes(rid) ? '#ffcf5a' : '#e9cfa8'; ctx.font = 'bold 11px Trebuchet MS, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(RECIPE_BY_ID[rid].name.slice(0, 14), x, y + 38);
    if (fresh.includes(rid)) { ctx.fillStyle = '#ff7a4a'; ctx.fillText('NEW', x + 24, y - 30); }
    ctx.textAlign = 'left';
  });
  ctx.fillStyle = '#ffe9c4'; ctx.font = 'bold 14px Trebuchet MS, sans-serif'; ctx.fillText('REGULARS TONIGHT', 716, 470);
  n.regulars.forEach((id, i) => drawFace(ctx, id, 740 + i * 58, 520, 46, 2));
  ctx.fillStyle = '#ffe9c4'; ctx.font = 'bold 14px Trebuchet MS, sans-serif'; ctx.fillText('STAR GOALS', 716, 596);
  n.goals.forEach((g, i) => {
    for (let s = 0; s <= i; s++) star(ctx, 730 + i * 170 + s * 22, 630, 10, save.stars[save.selected] > i);
    ctx.fillStyle = '#ffcf5a'; ctx.font = 'bold 18px Trebuchet MS, sans-serif'; ctx.fillText(`${g}`, 730 + i * 170 + (i + 1) * 22, 631);
  });
  if (buttons) for (const b of buttons) button(ctx, b, scene?.hot === b, t);
}
