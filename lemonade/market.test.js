const assert = require('assert');
const m = require('./market');
const { render } = require('./view');

// Matches the design table (marketing level 1).
const rows = [[0.10, 8.0, 5.6, 0.56], [0.25, 3.2, 0.64, 0.16], [0.50, 1.6, 0.16, 0.08], [1.00, 0.8, 0, 0]];
for (const [p, d, sps, rps] of rows) {
  const f = m.forecast(p);
  assert(Math.abs(f.demand - d) < 0.01, `demand @${p}`);
  assert(Math.abs(f.salesPerSec - sps) < 0.01, `sales/s @${p}: ${f.salesPerSec}`);
  assert(Math.abs(f.revenuePerSec - rps) < 0.01, `rev/s @${p}`);
}

// Supply caps sales: no stock, no sales.
let s = m.newState(); s.price = 0.10;
for (let i = 0; i < 1000; i++) m.tick(s, () => 0.5 < 0 ? 1 : 0);
assert.strictEqual(s.sold, 0);

// Stock is consumed and never goes negative.
s = m.newState(); s.stock = 5; s.price = 0.10;
for (let i = 0; i < 100; i++) m.tick(s, () => 0);
assert.strictEqual(s.stock, 0); assert.strictEqual(s.sold, 5);

// Long run averages near the forecast.
s = m.newState(); s.stock = 1e9; s.maxStock = 1e9; s.price = 0.25;
let seed = 1; const rng = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
for (let i = 0; i < 100000; i++) m.tick(s, rng);
const avg = s.sold / 10000;
assert(Math.abs(avg - 0.64) < 0.1, `avg ${avg}`);

// Marketing lets you charge ~2x for the same sales (level 8).
const a = m.forecast(0.25).salesPerSec, b = m.forecast(0.49, { mktLvl: 8 }).salesPerSec;
assert(Math.abs(a - b) < 0.1);
assert.strictEqual(m.marketingCost(1), 100);

// Squeeze button: one lemon -> one cup.
s = m.newState();
assert(m.squeeze(s)); assert.strictEqual(s.lemons, 19); assert.strictEqual(s.stock, 1);
s.lemons = 0; assert(!m.squeeze(s));                       // needs a lemon
s = m.newState(); s.stock = s.maxStock; assert(!m.squeeze(s)); // needs room

// Auto squeezer costs money, then makes ~1 cup/s using lemons.
s = m.newState();
assert(!m.buyAuto(s), 'cannot afford');
s.cash = 5; assert(m.buyAuto(s)); assert.strictEqual(s.cash, 0); assert.strictEqual(s.autoLvl, 1);
s.price = 100;                                             // nobody buys, isolate production
for (let i = 0; i < 100; i++) m.tick(s, () => 1);          // 10 s
assert.strictEqual(s.stock, 10); assert.strictEqual(s.lemons, 10);
s.lemons = 0; for (let i = 0; i < 50; i++) m.tick(s, () => 1);
assert.strictEqual(s.stock, 10, 'idle without lemons');

// 5 upgrades, each costs money and is faster; then maxed.
s = m.newState(); s.cash = 1e6; m.buyAuto(s);
let last = m.autoRate(s);
for (let i = 0; i < 5; i++) {
  const before = s.cash, cost = m.autoCost(s);
  assert(cost > 0 && m.buyAuto(s)); assert(Math.abs(before - s.cash - cost) < 1e-9);
  assert(m.autoRate(s) > last); last = m.autoRate(s);
}
assert.strictEqual(m.autoCost(s), null); assert(!m.buyAuto(s));
// Cost matches the reference formula 1.1^level + 5: 5, 6.10, 6.21, 6.33, 6.46, 6.61.
s = m.newState(); const seen = [];
s.cash = 1e6; while (m.autoCost(s) !== null) { seen.push(m.autoCost(s)); m.buyAuto(s); }
assert.deepStrictEqual(seen, [5, 6.10, 6.21, 6.33, 6.46, 6.61]); assert.strictEqual(last, 2.25);

// Buying lemons costs the current price; price moves around and trends.
s = m.newState(); s.cash = 1; s.lemonPrice = 0.10;
assert(m.buyLemons(s)); assert.strictEqual(s.lemons, 30); assert(Math.abs(s.cash - 0) < 1e-9);
assert(!m.buyLemons(s), 'broke');
s = m.newState(); s.stock = s.maxStock;
let lo = 1, hi = 0; seed = 7;
for (let i = 0; i < 20000; i++) { m.adjustLemonPrice(s, rng); lo = Math.min(lo, s.lemonPrice); hi = Math.max(hi, s.lemonPrice); }
assert(lo <= 0.085 && hi >= 0.115, `price range ${lo}..${hi}`);   // both cheap and pricey times happen
assert(lo >= 0.04 && hi <= 0.14);
s.lemonPrice = 0.08; assert.strictEqual(m.lemonTrend(s), 'cheap');
s.lemonPrice = 0.12; assert.strictEqual(m.lemonTrend(s), 'pricey');
s = m.newState(); const b0 = s.lemonBase; s.cash = 100; m.buyLemons(s); assert(s.lemonBase > b0, 'buying raises price');

assert(render(m.newState(), m).includes('Squeeze') || render(m.newState(), m).includes('squeeze'));
console.log('all tests passed');
