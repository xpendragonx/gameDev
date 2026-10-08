// Terminal demo: node demo.js
// Keys: [s] squeeze [b] buy lemons [a] squeezer [u] improve [g] mega [+]/[-] price [m] marketing [q] quit
const m = require('./market');
const { render } = require('./view');
const s = m.newState();

process.stdin.setRawMode && process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', (k) => {
  k = String(k);
  if (k === 'q' || k === '\x03') { console.log(); process.exit(); }
  if (k === 's' || k === ' ') m.squeeze(s);
  if (k === 'b') m.buyLemons(s);
  if (k === 'a') m.buySqueezer(s);
  if (k === 'r') m.begForLemons(s);
  if (k === 'u') m.buyBoost(s);
  if (k === 'g') m.buyMega(s);
  if (k === '+' || k === '=') m.setPrice(s, s.price + 0.01);
  if (k === '-') m.setPrice(s, s.price - 0.01);
  if (k === 'm') m.buyMarketing(s);
});
setInterval(() => {
  m.tick(s);
  process.stdout.write('\x1b[2J\x1b[H' + render(s, m) + '\n');
}, 1000 / m.TICKS_PER_SECOND);
