// The event bus between the kitchen and the senses: every thing that happens at a station
// (chop, sizzle, plate, serve, walk-out...) gets its sound, its particles and its callout here.
import { burst, callout, kick } from './particles.js';
import { SFX } from './audio.js';
import { tileCenter } from '../core/screen.js';
import { REGULARS } from '../service/customers.js';
import { nameOf } from '../food/ingredients.js';
import { SEAT_Y } from '../art/street-art.js';

export function makeFx(feel, onStatus = () => {}) {
  const fx = {
    log: [],
    emit(type, d = {}) {
      const at = d.at ? tileCenter(d.at.col, d.at.row) : null;
      fx.log.push(type);
      switch (type) {
        case 'chop':
          SFX.chop(d.progress); burst(feel, at.x, at.y - 6, d.at.item && /greens|lime/.test(d.at.item.id) ? 'greens' : 'chips', 6); kick(feel, 2);
          callout(feel, at.x, at.y - 40, `${Math.round(d.progress * 100)}%`, '#bff5a8', 16, 0.45);
          break;
        case 'grind': SFX.grind(); burst(feel, at.x, at.y, 'paste', 5); kick(feel, 2); break;
        case 'prepDone': SFX.prepDone(); callout(feel, at.x, at.y - 44, nameOf(d.id), '#bff5a8', 18); break;
        case 'pickup': SFX.pickup(); break;
        case 'drop': SFX.drop(); break;
        case 'sizzle': SFX.sizzle(); burst(feel, at.x, at.y, 'sparks', 12); break;
        case 'cooked': SFX.cooked(); callout(feel, at.x, at.y - 46, `${nameOf(d.id)} ready!`, '#ffe68a', 18); break;
        case 'burnt': SFX.burnt(); burst(feel, at.x, at.y, 'smoke', 14); callout(feel, at.x, at.y - 46, 'BURNT!', '#ff5a3a', 26); kick(feel, 5); break;
        case 'plate': SFX.plate(); burst(feel, at.x, at.y, 'sparks', 5); break;
        case 'plateDone': SFX.plateDone(); burst(feel, at.x, at.y, 'confetti', 16); callout(feel, at.x, at.y - 50, `${d.dish.name}!`, '#ffcf5a', 24); break;
        case 'serve': {
          SFX.serve(d.combo);
          burst(feel, at.x, at.y, 'coins', 18);
          kick(feel, 4 + Math.min(6, d.combo));
          callout(feel, at.x - 40, at.y - 30, `+${d.pay}`, '#ffcf3a', 32, 1.4);
          if (d.combo > 1) callout(feel, at.x - 40, at.y - 70, `RUSH x${d.combo}`, '#ff7a4a', 28, 1.4);
          if (d.perfect) callout(feel, 1020, SEAT_Y(d.ticket.seat) - 30, 'PERFECT!', '#7fe07a', 26, 1.4);
          if (d.nearMiss) callout(feel, 1020, SEAT_Y(d.ticket.seat) - 30, `NEAR MISS! ${d.secondsLeft.toFixed(1)}s`, '#ffb04a', 24, 1.6);
          onStatus(`Served ${d.dish.name} to ${REGULARS[d.ticket.who].name} for ${d.pay} coins`);
          break;
        }
        case 'reject': SFX.reject(); if (at) callout(feel, at.x, at.y - 48, d.text, '#ff9a8a', 16, 1.4); onStatus(d.text); break;
        case 'order': SFX.order(); onStatus(`${REGULARS[d.ticket.who].name} orders`); break;
        case 'walkout': SFX.walkout(); kick(feel, 6, '#ff2a1a'); callout(feel, 1040, SEAT_Y(d.ticket.seat) - 30, 'WALKED OUT', '#ff5a3a', 22, 1.6); break;
        case 'bin': SFX.bin(); burst(feel, at.x, at.y, 'smoke', 6); break;
        case 'closing': SFX.gong(); break;
        default: break;
      }
    },
  };
  return fx;
}
