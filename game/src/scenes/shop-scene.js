// The stall workshop: spend the purse on twelve upgrades. Each card says the one number it changes.
import { W, H } from '../core/screen.js';
import { UPGRADES } from '../stall/upgrades.js';
import { writeSave } from '../core/save.js';
import { drawSky } from '../art/street-art.js';
import { drawUpgradeIcon } from '../art/icons.js';
import { drawLogo } from '../ui/hud.js';
import { panel, button, clicked, inside, wrap } from '../ui/widgets.js';
import { SFX } from '../feel/audio.js';

const card = i => ({ x: 40 + (i % 4) * 302, y: 120 + Math.floor(i / 4) * 178, w: 290, h: 166 });

export function createShopScene(app) {
  const save = app.save;
  const back = { id: 'back', label: 'Back to the map', x: 980, y: 680, w: 260, h: 54, primary: true, key: 'ESC' };
  const scene = { hot: null, flash: null };
  scene.update = (dt, input) => {
    scene.hot = inside(input.mouse, back) ? back : null;
    for (const c of input.clicks) {
      UPGRADES.forEach((u, i) => {
        if (!inside(c, card(i))) return;
        if (save.upgrades.includes(u.id)) return;
        if (save.purse < u.cost) { scene.flash = { i, bad: true, life: 0.6 }; SFX.reject(); return; }
        save.purse -= u.cost; save.upgrades.push(u.id); writeSave(save);
        scene.flash = { i, bad: false, life: 0.8 }; SFX.plateDone();
      });
    }
    if (scene.flash) { scene.flash.life -= dt; if (scene.flash.life <= 0) scene.flash = null; }
    if (clicked(input, [back]) || input.hit('Escape') || input.hit('Space')) app.goto('map');
  };
  scene.draw = (ctx, t) => drawShop(ctx, t, save, scene, back, input => input);
  return scene;
}

export function drawShop(ctx, t, save, scene, back) {
  drawSky(ctx, 0, 0, W, H, t, false);
  drawLogo(ctx, 40, 44, 30);
  ctx.fillStyle = '#ffe9c4'; ctx.font = 'bold 22px Georgia, serif'; ctx.textAlign = 'left';
  ctx.fillText('Stall upgrades', 360, 44);
  ctx.fillStyle = '#ffcf5a'; ctx.font = 'bold 24px Trebuchet MS, sans-serif'; ctx.textAlign = 'right';
  ctx.fillText(`Purse: ${save.purse} coins`, 1240, 44);
  ctx.fillStyle = 'rgba(255,233,196,0.7)'; ctx.font = '14px Trebuchet MS, sans-serif'; ctx.textAlign = 'left';
  ctx.fillText(`${save.upgrades.length} of ${UPGRADES.length} owned · every upgrade changes a number, never adds a chore`, 40, 84);
  UPGRADES.forEach((u, i) => {
    const r = card(i), owned = save.upgrades.includes(u.id), afford = save.purse >= u.cost;
    const fl = scene?.flash?.i === i ? scene.flash : null;
    panel(ctx, r.x, r.y, r.w, r.h, owned ? 'rgba(40,70,40,0.92)' : 'rgba(29,18,36,0.92)', fl ? (fl.bad ? '#ff4a3a' : '#7fe07a') : owned ? '#7fe07a' : afford ? '#ffcf5a' : '#6a5a70');
    ctx.fillStyle = '#efe4cc'; ctx.beginPath(); ctx.arc(r.x + 52, r.y + 60, 36, 0, Math.PI * 2); ctx.fill();
    drawUpgradeIcon(ctx, u.icon, r.x + 52, r.y + 60, 56);
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff3dc'; ctx.font = 'bold 18px Georgia, serif'; ctx.fillText(u.name, r.x + 100, r.y + 32);
    ctx.fillStyle = '#e9cfa8'; ctx.font = '14px Trebuchet MS, sans-serif'; wrap(ctx, u.text, r.x + 100, r.y + 60, 175, 18);
    ctx.font = 'bold 17px Trebuchet MS, sans-serif';
    ctx.fillStyle = owned ? '#7fe07a' : afford ? '#ffcf5a' : '#a89aa8';
    ctx.fillText(owned ? 'OWNED' : `${u.cost} coins`, r.x + 100, r.y + 136);
    if (!owned) { ctx.fillStyle = 'rgba(255,233,196,0.6)'; ctx.font = '12px Trebuchet MS, sans-serif'; ctx.textAlign = 'right'; ctx.fillText(afford ? 'click to buy' : 'save up', r.x + r.w - 14, r.y + 136); }
  });
  if (back) button(ctx, back, scene?.hot === back, t);
}
