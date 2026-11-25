// The recipe book: all twelve dishes with the route each part takes through the kitchen,
// crate to station to plate, so you can see which dishes share a wok or a grill.
import { W, H } from '../core/screen.js';
import { RECIPES } from '../food/recipes.js';
import { CHOP, GRIND, GRILL, WOK, nameOf } from '../food/ingredients.js';
import { drawDish, drawFood } from '../art/food-art.js';
import { drawSky } from '../art/street-art.js';
import { drawLogo } from '../ui/hud.js';
import { panel, button, clicked, inside } from '../ui/widgets.js';

/** The chain that makes a plate part, e.g. sate = chicken > board > grill. */
export function routeOf(part) {
  const back = (table, id) => Object.keys(table).find(k => table[k] === id);
  const grillFrom = back(GRILL, part);
  if (grillFrom) return [back(CHOP, grillFrom), 'board', 'grill'];
  const wokFrom = back(WOK, part);
  if (wokFrom) {
    const ins = wokFrom.split('+');
    if (ins.includes('tofu_cubes')) return ['tofu', 'board', 'wok'];
    return [...ins, 'wok'];
  }
  const chopFrom = back(CHOP, part);
  if (chopFrom) return [chopFrom, 'board'];
  const grindFrom = back(GRIND, part);
  if (grindFrom) return [grindFrom, 'cobek'];
  return [part];
}

const STATION_WORDS = new Set(['board', 'grill', 'wok', 'cobek']);
const card = i => ({ x: 30 + (i % 4) * 307, y: 92 + Math.floor(i / 4) * 196, w: 297, h: 186 });

export function createBookScene(app) {
  const back = { id: 'back', label: 'Back', x: 1080, y: 24, w: 170, h: 44, primary: true, key: 'ESC', size: 18 };
  const scene = { hot: null };
  scene.update = (dt, input) => {
    scene.hot = inside(input.mouse, back) ? back : null;
    if (clicked(input, [back]) || input.hit('Escape') || input.hit('Space')) app.goBack();
  };
  scene.draw = (ctx, t) => drawBook(ctx, t, scene, back);
  return scene;
}

export function drawBook(ctx, t, scene, back) {
  drawSky(ctx, 0, 0, W, H, t, false);
  drawLogo(ctx, 30, 46, 30);
  ctx.fillStyle = '#ffe9c4'; ctx.font = 'bold 22px Georgia, serif'; ctx.textAlign = 'left'; ctx.fillText('Recipe book · 12 dishes from 10 crates, 4 stations', 360, 46);
  RECIPES.forEach((r, i) => {
    const c = card(i);
    panel(ctx, c.x, c.y, c.w, c.h, 'rgba(251,243,226,0.96)', '#c9a26a');
    drawDish(ctx, r.id, c.x + 62, c.y + 66, 104);
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#3b2314'; ctx.font = 'bold 18px Georgia, serif'; ctx.fillText(r.name, c.x + 122, c.y + 26);
    ctx.fillStyle = '#b8560f'; ctx.font = 'bold 14px Trebuchet MS, sans-serif'; ctx.fillText(`${r.price} coins`, c.x + 122, c.y + 48);
    r.parts.forEach((p, k) => {
      const y = c.y + 76 + k * 26;
      const chain = routeOf(p);
      let x = c.x + 122;
      chain.forEach((step, j) => {
        if (STATION_WORDS.has(step)) {
          ctx.fillStyle = '#5a3a1a'; ctx.font = 'bold 11px Trebuchet MS, sans-serif';
          const w = ctx.measureText(step).width + 8;
          ctx.fillStyle = '#e8d2a8'; ctx.fillRect(x, y - 8, w, 16); ctx.fillStyle = '#5a3a1a'; ctx.fillText(step, x + 4, y);
          x += w + 4;
        } else { drawFood(ctx, step, x + 10, y, 24); x += 22; }
        if (j < chain.length - 1) { ctx.fillStyle = '#a07a4a'; ctx.font = 'bold 12px Trebuchet MS, sans-serif'; ctx.fillText('›', x, y); x += 9; }
      });
      if (x < c.x + c.w - 70) { ctx.fillStyle = '#3b2314'; ctx.font = '11px Trebuchet MS, sans-serif'; ctx.fillText(`= ${nameOf(p)}`, x + 2, y); }
      else drawFood(ctx, p, x + 12, y, 24);
    });
    ctx.fillStyle = '#7a5a3a'; ctx.font = 'italic 12px Georgia, serif'; ctx.fillText(r.blurb, c.x + 14, c.y + c.h - 14);
  });
  if (back) button(ctx, back, scene?.hot === back, t);
}
