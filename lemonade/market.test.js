const assert = require('assert');
const m = require('./market');

// Matches the design table (marketing level 1).
const rows = [[0.10, 8.0, 5.6, 0.56], [0.25, 3.2, 0.64, 0.16], [0.50, 1.6, 0.16, 0.08], [1.00, 0.8, 0, 0]];
for (const [p, d, sps, rps] of rows) {
  const f = m.forecast(p);
  assert(Math.abs(f.demand - d) < 0.01, `demand @${p}`);
  assert(Math.abs(f.salesPerSec - sps) < 0.01, `sales/s @${p}: ${f.salesPerSec}`);
  assert(Math.abs(f.revenuePerSec - rps) < 0.01, `rev/s @${p}`);
}

// Supply caps sales: no stock, no sales.
let s = m.newState(); s.production = 0; s.price = 0.10;
for (let i = 0; i < 1000; i++) m.tick(s, () => 0);
assert.strictEqual(s.sold, 0);

// Stock is consumed and never goes negative.
s = m.newState(); s.production = 0; s.stock = 5; s.price = 0.10;
for (let i = 0; i < 100; i++) m.tick(s, () => 0);
assert.strictEqual(s.stock, 0); assert.strictEqual(s.sold, 5);

// Long run averages near the forecast.
s = m.newState(); s.production = 100; s.price = 0.25; s.maxStock = 1e9;
let seed = 1; const rng = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
for (let i = 0; i < 100000; i++) m.tick(s, rng);
const avg = s.sold / 10000;
assert(Math.abs(avg - 0.64) < 0.1, `avg ${avg}`);

// Marketing lets you charge ~2x for the same sales (level 8).
const a = m.forecast(0.25).salesPerSec, b = m.forecast(0.49, { mktLvl: 8 }).salesPerSec;
assert(Math.abs(a - b) < 0.1);
assert.strictEqual(m.marketingCost(1), 100);

console.log('all tests passed');
