const assert = require('assert');
const m = require('./market');
const { render } = require('./view');
let seed = 1; const rng = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const close = (a, b, e = 0.01) => Math.abs(a - b) < e;

// Matches the design table (marketing level 1).
for (const [p, d, sps, rps] of [[0.10, 8.0, 5.6, 0.56], [0.25, 3.2, 0.64, 0.16], [0.50, 1.6, 0.16, 0.08], [1.00, 0.8, 0, 0]]) {
  const f = m.forecast(p);
  assert(close(f.demand, d) && close(f.salesPerSec, sps) && close(f.revenuePerSec, rps), `table @${p}`);
}

// Starts like the reference: 1000 lemons (wire), $0, no machines.
let s = m.newState();
assert.strictEqual(s.lemons, 1000); assert.strictEqual(s.cash, 0); assert.strictEqual(m.autoRate(s), 0);

// Squeeze button: one lemon -> one cup, needs a lemon.
m.squeeze(s); assert.strictEqual(s.lemons, 999); assert.strictEqual(s.stock, 1);
s.lemons = 0; assert(!m.squeeze(s));

// Stock caps sales and never goes negative.
s = m.newState(); s.price = 0.10; for (let i = 0; i < 1000; i++) m.tick(s, () => 0.5 < 0 ? 1 : 0);
assert.strictEqual(s.sold, 0);
s = m.newState(); s.stock = 5; s.price = 0.10; for (let i = 0; i < 100; i++) m.tick(s, () => 0);
assert.strictEqual(s.stock, 0); assert.strictEqual(s.sold, 5);

// Long run averages near the forecast.
s = m.newState(); s.stock = 1e9; s.price = 0.25;
for (let i = 0; i < 100000; i++) m.tick(s, rng);
assert(close(s.sold / 10000, 0.64, 0.1), `avg ${s.sold / 10000}`);

// Marketing: doubling cost from 100, ~2x price for the same sales at level 8.
assert(close(m.forecast(0.25).salesPerSec, m.forecast(0.49, { mktLvl: 8 }).salesPerSec, 0.1));
s = m.newState(); s.cash = 1e6; for (let i = 0; i < 4; i++) m.buyMarketing(s);
assert.strictEqual(s.adCost, 1600); assert.strictEqual(s.mktLvl, 5);

// Auto squeezers = AutoClippers: cost 5 then 1.1^n + 5, +1 cup/s each.
assert.strictEqual(m.squeezerCost(0), 5);
assert(close(m.squeezerCost(1), 6.1) && close(m.squeezerCost(10), 7.5937));
s = m.newState(); assert(!m.buySqueezer(s)); s.cash = 5; assert(m.buySqueezer(s)); assert.strictEqual(s.cash, 0);
s.price = 100; for (let i = 0; i < 100; i++) m.tick(s, () => 1);            // 10 s
assert(close(s.stock, 10, 0.001) && close(s.lemons, 990, 0.001), `stock ${s.stock}`);
s.cash = 1e6; for (let i = 0; i < 9; i++) m.buySqueezer(s);
assert.strictEqual(m.autoRate(s), 10);
s.lemons = 0.5; s.stock = 0; m.tick(s, () => 1); m.tick(s, () => 1);
assert(close(s.stock, 0.5, 0.001), 'cannot squeeze without lemons');

// Improved squeezers: +.25, +.5, +.75, +5, paid in dollars, in order.
s = m.newState(); s.cash = 1e6; assert(!m.buyBoost(s), 'needs a squeezer first'); m.buySqueezer(s);
const mult = []; while (m.boostCost(s) !== null) { assert(m.buyBoost(s)); mult.push(s.boost); }
assert.deepStrictEqual(mult, [1.25, 1.75, 2.5, 7.5]); assert(!m.buyBoost(s));
s = m.newState(); s.cash = 749; m.buySqueezer(s); assert(!m.buyBoost(s), 'costs money');

// Mega squeezers: locked until 75 squeezers, then unlock fee, then 1.07^n * 1000 for 500/s.
s = m.newState(); s.cash = 1e9; assert(!m.buyMega(s)); s.squeezers = 75;
assert(m.buyMega(s)); assert(s.megaUnlocked && s.megas === 0); assert(m.buyMega(s));
assert.strictEqual(s.megas, 1); assert.strictEqual(m.autoRate(s), 75 + 500);
assert(close(m.megaCost(1), 1070, 0.01));

// Lemon crate: 1000 lemons, ~$20 +/- 6, buying raises the base, trend labels.
s = m.newState(); s.cash = 20; s.lemonPrice = 20; s.lemons = 0;
assert(m.buyLemons(s)); assert.strictEqual(s.lemons, 1000); assert.strictEqual(s.cash, 0);
assert(close(s.lemonBase, 20.05)); assert(!m.buyLemons(s), 'broke');
s = m.newState(); let lo = 99, hi = 0;
for (let i = 0; i < 20000; i++) { m.adjustLemonPrice(s, rng); lo = Math.min(lo, s.lemonPrice); hi = Math.max(hi, s.lemonPrice); }
assert(lo <= 17 && hi >= 23, `price range ${lo}..${hi}`); assert(lo >= 9 && hi <= 27);
s.lemonPrice = 16; assert.strictEqual(m.lemonTrend(s), 'cheap');
s.lemonPrice = 24; assert.strictEqual(m.lemonTrend(s), 'pricey');

// Never soft-locks: broke + no lemons + no cups -> free crate.
s = m.newState(); s.lemons = 0; s.cash = 3; assert(m.isStuck(s)); assert(m.begForLemons(s)); assert.strictEqual(s.lemons, 1000);
assert(!m.begForLemons(s), 'only when stuck');

assert(/squeeze/i.test(render(m.newState(), m)));
console.log('all tests passed');
