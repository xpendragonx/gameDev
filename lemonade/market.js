// Lemonade market: price vs. elastic demand, capped by supply (stock).
// Pure logic, no I/O, so it can be dropped into the rest of the game.
// Formulas follow DESIGN_NOTES.md section 2.

const TICKS_PER_SECOND = 10;

const demand = (price, { mktLvl = 1, effect = 1, boost = 1 } = {}) =>
  (0.8 / price) * Math.pow(1.1, mktLvl - 1) * effect * boost;

const unitsPerSale = (d) => Math.floor(0.7 * Math.pow(d, 1.15));

// Expected values (no randomness), for UI previews and balancing.
function forecast(price, opts) {
  const d = demand(price, opts);
  const units = unitsPerSale(d);
  const salesPerSec = TICKS_PER_SECOND * Math.min(d / 100, 1) * units;
  return { demand: d, unitsPerSale: units, salesPerSec, revenuePerSec: salesPerSec * price };
}

const newState = () => ({
  cash: 0, stock: 0, price: 0.25, mktLvl: 1,
  production: 0.5,        // cups made per second (the supply side)
  maxStock: 100,          // storage cap
  made: 0, sold: 0,
  _frac: 0,               // fractional production carried between ticks
});

// Advance one tick (1/10 s). `rng` is injectable for tests.
function tick(s, rng = Math.random) {
  // Supply: production fills stock up to the storage cap.
  s._frac += s.production / TICKS_PER_SECOND;
  const made = Math.min(Math.floor(s._frac), s.maxStock - s.stock);
  s._frac -= Math.floor(s._frac);
  if (made > 0) { s.stock += made; s.made += made; }

  // Demand: a chance of a sale this tick, sale size grows with demand.
  const d = demand(s.price, { mktLvl: s.mktLvl });
  let sold = 0;
  if (rng() < d / 100) {
    sold = Math.min(unitsPerSale(d), s.stock);   // stock caps sales
    s.stock -= sold;
    s.cash += sold * s.price;
    s.sold += sold;
  }
  return { demand: d, sold };
}

const marketingCost = (lvl) => 100 * Math.pow(2, lvl - 1);

function buyMarketing(s) {
  const cost = marketingCost(s.mktLvl);
  if (s.cash < cost) return false;
  s.cash -= cost; s.mktLvl++;
  return true;
}

const setPrice = (s, p) => { s.price = Math.max(0.01, Math.round(p * 100) / 100); };

// "Lowest price that still clears production" — the notes' target price.
function clearingPrice(production, opts) {
  for (let c = 1; c <= 10000; c++) {
    if (forecast(c / 100, opts).salesPerSec <= production) return c / 100;
  }
  return 100;
}

module.exports = { TICKS_PER_SECOND, demand, unitsPerSale, forecast, newState, tick,
  marketingCost, buyMarketing, setPrice, clearingPrice };
