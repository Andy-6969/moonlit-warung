// Keyboard and mouse, mapped onto the 1280 x 800 stage however the window is scaled.
import { W, H } from './screen.js';

export function makeInput(canvas) {
  const input = {
    down: new Set(), pressed: new Set(), clicks: [], mouse: { x: -1, y: -1, down: false },
    axis() {
      const d = this.down;
      return {
        x: (d.has('ArrowRight') || d.has('KeyD') ? 1 : 0) - (d.has('ArrowLeft') || d.has('KeyA') ? 1 : 0),
        y: (d.has('ArrowDown') || d.has('KeyS') ? 1 : 0) - (d.has('ArrowUp') || d.has('KeyW') ? 1 : 0),
      };
    },
    hit(code) { return this.pressed.has(code); },
    endFrame() { this.pressed.clear(); this.clicks.length = 0; },
  };
  const toStage = e => {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) };
  };
  window.addEventListener('keydown', e => {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    if (!input.down.has(e.code)) input.pressed.add(e.code);
    input.down.add(e.code);
  });
  window.addEventListener('keyup', e => input.down.delete(e.code));
  window.addEventListener('blur', () => input.down.clear());
  canvas.addEventListener('mousemove', e => Object.assign(input.mouse, toStage(e)));
  canvas.addEventListener('mousedown', e => { const p = toStage(e); Object.assign(input.mouse, p, { down: true }); input.clicks.push(p); });
  window.addEventListener('mouseup', () => { input.mouse.down = false; });
  return input;
}

/** Fits the stage inside the window, keeping its 16:10 shape. */
export function fitCanvas(canvas) {
  const fit = () => {
    const s = Math.min(window.innerWidth / W, window.innerHeight / H);
    canvas.style.width = `${Math.floor(W * s)}px`;
    canvas.style.height = `${Math.floor(H * s)}px`;
  };
  window.addEventListener('resize', fit);
  fit();
}
