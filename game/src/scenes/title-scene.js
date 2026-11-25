// The title: the stall glowing under the moon, a Moonlit Feast steaming on the counter, and the way in.
import { W, H } from '../core/screen.js';
import { drawSky, drawLanterns, drawMoon } from '../art/street-art.js';
import { drawDish, drawSteam } from '../art/food-art.js';
import { drawFace } from '../art/people-art.js';
import { drawLogo } from '../ui/hud.js';
import { button, clicked, inside } from '../ui/widgets.js';

export function createTitleScene(app) {
  const buttons = [
    { id: 'play', label: 'Open the stall', x: 470, y: 520, w: 340, h: 58, primary: true, key: 'SPACE', size: 24 },
    { id: 'book', label: 'Recipe book', x: 470, y: 594, w: 165, h: 46, size: 17 },
    { id: 'shop', label: 'Stall upgrades', x: 645, y: 594, w: 165, h: 46, size: 17 },
  ];
  const scene = { hot: null };
  scene.update = (dt, input) => {
    scene.hot = buttons.find(b => inside(input.mouse, b)) || null;
    const b = clicked(input, buttons);
    if (input.hit('Space') || input.hit('Enter') || b?.id === 'play') app.goto('map');
    else if (b?.id === 'book') app.goto('book');
    else if (b?.id === 'shop') app.goto('shop');
  };
  scene.draw = (ctx, t) => {
    drawSky(ctx, 0, 0, W, H, t, false);
    drawMoon(ctx, 1080, 130, 70);
    drawLanterns(ctx, -20, W + 20, 40, t, 14);
    ctx.fillStyle = '#1c1430';
    for (let i = 0; i < 8; i++) { const x = i * 170 - 20; ctx.beginPath(); ctx.moveTo(x, 470); ctx.lineTo(x + 85, 380 - (i % 3) * 20); ctx.lineTo(x + 170, 470); ctx.fill(); }
    ctx.fillStyle = '#2a1d3a'; ctx.fillRect(0, 470, W, H - 470);
    ctx.fillStyle = '#7c4a24'; ctx.fillRect(140, 400, 1000, 30);
    ctx.fillStyle = '#a8703f'; ctx.fillRect(140, 392, 1000, 14);
    ctx.fillStyle = '#c62f24'; ctx.beginPath(); ctx.moveTo(110, 240); ctx.lineTo(1170, 240); ctx.lineTo(1140, 290); ctx.lineTo(140, 290); ctx.fill();
    for (let i = 0; i < 20; i++) { ctx.fillStyle = i % 2 ? '#f5ecd8' : '#c62f24'; ctx.beginPath(); ctx.arc(150 + i * 52.5, 290, 26, 0, Math.PI); ctx.fill(); }
    drawLogo(ctx, 360, 180, 76);
    ctx.textAlign = 'center'; ctx.fillStyle = '#ffe9c4'; ctx.font = 'italic 22px Georgia, serif';
    ctx.fillText('a night-market cooking game', W / 2, 232);
    drawDish(ctx, 'moonlit_feast', 640, 370, 190, 0.6 + 0.4 * Math.sin(t * 2));
    drawSteam(ctx, 640, 320, 160, t, 0.6);
    drawDish(ctx, 'sate_ayam', 410, 380, 120);
    drawDish(ctx, 'nasi_goreng', 870, 380, 120);
    drawFace(ctx, 'darto', 200, 470, 70, 2); drawFace(ctx, 'sari', 1080, 470, 70, 2); drawFace(ctx, 'joko', 300, 480, 56, 1); drawFace(ctx, 'ayu', 980, 482, 56, 2);
    for (const b of buttons) button(ctx, b, scene.hot === b, t);
    ctx.fillStyle = '#ffcf5a'; ctx.font = 'bold 18px Trebuchet MS, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('7 nights · 12 recipes · 9 regulars · 12 stall upgrades', W / 2, 690);
    ctx.fillStyle = 'rgba(255,233,196,0.7)'; ctx.font = '15px Trebuchet MS, sans-serif';
    ctx.fillText('Keyboard: WASD or arrows to walk, SPACE to use a station (tap to chop). Mouse: click a station and the cook walks there.', W / 2, 726);
  };
  return scene;
}
