// Terminal demo: node demo.js
// Keys: [+]/[-] price  [m] buy marketing  [q] quit
const m = require('./market');
const s = m.newState();
s.production = 1;

function draw(last) {
  const f = m.forecast(s.price, { mktLvl: s.mktLvl });
  const bar = (v, max, w = 20) => '#'.repeat(Math.round(Math.min(v / max, 1) * w)).padEnd(w, '.');
  process.stdout.write('\x1b[2J\x1b[H' + [
    '   ___  LEMONADE STAND',
    '  (o o) cash $' + s.cash.toFixed(2) + '   sold ' + s.sold,
    '',
    ` price   $${s.price.toFixed(2)}   [+] [-]`,
    ` demand  ${bar(f.demand, 10)} ${f.demand.toFixed(2)}`,
    ` supply  ${bar(s.production, 10)} ${s.production.toFixed(1)} cups/s made`,
    ` stock   ${bar(s.stock, s.maxStock)} ${s.stock}/${s.maxStock}`,
    '',
    ` expected sales ${f.salesPerSec.toFixed(2)}/s  revenue $${f.revenuePerSec.toFixed(2)}/s`,
    ` sells out price ~$${m.clearingPrice(s.production, { mktLvl: s.mktLvl }).toFixed(2)}`,
    ` marketing lvl ${s.mktLvl}  [m] buy $${m.marketingCost(s.mktLvl)}`,
    '',
    s.stock >= s.maxStock ? ' !! Stock piling up: price too high' :
    s.stock === 0 ? ' !! Sold out: price too low' : '',
  ].join('\n') + '\n');
}

process.stdin.setRawMode && process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', (k) => {
  k = String(k);
  if (k === 'q' || k === '\x03') { console.log(); process.exit(); }
  if (k === '+' || k === '=') m.setPrice(s, s.price + 0.01);
  if (k === '-') m.setPrice(s, s.price - 0.01);
  if (k === 'm') m.buyMarketing(s);
});
setInterval(() => { m.tick(s); draw(); }, 1000 / m.TICKS_PER_SECOND);
