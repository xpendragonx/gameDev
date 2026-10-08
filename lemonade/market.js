// Lemonade market: price vs. elastic demand, capped by supply (stock).
// Pure logic, no I/O, so it can be dropped into the rest of the game.
// Formulas follow DESIGN_NOTES.md sections 2 and 3.

const TICKS_PER_SECOND = 10;

// ---- Demand (selling side) --------------------------------------------

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

// ---- Supply (making side) ----------------------------------------------
// Lemons (bought) -> squeeze -> cups (stock) -> sold.

const LEMON_REF_PRICE = 0.10;   // "normal" lemon price; trend labels compare to this
const LEMON_FLOOR = 0.075;      // base price never decays below this
const LEMON_SWING = 0.03;       // price wobbles +/- this around the base
const LEMON_BATCH = 10;         // lemons per purchase
const MAX_LEMONS = 200;

// Auto squeezer: level 1 is the purchase, levels 2-6 are the 5 upgrades.
// AUTO_COSTS[i] is the price of going from level i to level i+1.
// Same math as index_3.html: the first AutoClipper costs $5 and makes 1 clip/s
// (clipperCost = 1.1^level + 5 after each purchase), and each "Improved
// AutoClippers" boost adds +25% of the base rate (clipperBoost += .25).
const AUTO_RATES = [0, 1.0, 1.25, 1.5, 1.75, 2.0, 2.25];   // cups per second
const AUTO_MAX = AUTO_RATES.length - 1;
const AUTO_COST_BASE = 5;

const newState = () => ({
  cash: 0, stock: 0, lemons: 20, price: 0.25, mktLvl: 1,
  autoLvl: 0,
  maxStock: 100,          // cup storage cap
  made: 0, sold: 0,
  lemonBase: LEMON_REF_PRICE, lemonPrice: LEMON_REF_PRICE,
  _lemonWave: 0, _lemonTimer: 0,
  _frac: 0,               // fractional auto-squeezing carried between ticks
});

// Squeeze one lemon into one cup (the button; also used by the auto squeezer).
function squeeze(s) {
  if (s.lemons < 1 || s.stock >= s.maxStock) return false;
  s.lemons--; s.stock++; s.made++;
  return true;
}

const autoRate = (s) => AUTO_RATES[s.autoLvl];
const autoCost = (s) => {
  if (s.autoLvl >= AUTO_MAX) return null;
  if (s.autoLvl === 0) return AUTO_COST_BASE;
  return Math.round((Math.pow(1.1, s.autoLvl) + AUTO_COST_BASE) * 100) / 100;   // reference: 1.1^level + 5
};

// Buy the auto squeezer, or its next upgrade. Costs money.
function buyAuto(s) {
  const cost = autoCost(s);
  if (cost === null || s.cash < cost) return false;
  s.cash -= cost; s.autoLvl++;
  return true;
}

// ---- Lemon price: cheap times and expensive times -----------------------
// Same idea as the wire price in the reference game: a sine wave around a
// base price that updates at random moments, buying pushes the base up, and
// the base slowly decays back down while you are not buying.

function adjustLemonPrice(s, rng = Math.random) {
  s._lemonTimer++;
  if (s._lemonTimer > 25 && s.lemonBase > LEMON_FLOOR) {   // ~2.5 s without buying
    s.lemonBase -= s.lemonBase / 1000;
    s._lemonTimer = 0;
  }
  if (rng() < 0.02) {                                       // a new "market mood" ~every 5 s
    s._lemonWave += 0.4;
    s.lemonPrice = Math.ceil((s.lemonBase + LEMON_SWING * Math.sin(s._lemonWave)) * 100) / 100;
  }
}

function lemonTrend(s) {
  if (s.lemonPrice <= LEMON_REF_PRICE - 0.015) return 'cheap';
  if (s.lemonPrice >= LEMON_REF_PRICE + 0.015) return 'pricey';
  return 'normal';
}

// Buy a batch of lemons at the current price. Returns false if you can't.
function buyLemons(s, n = LEMON_BATCH) {
  const cost = n * s.lemonPrice;
  if (s.cash < cost || s.lemons + n > MAX_LEMONS) return false;
  s.cash -= cost; s.lemons += n;
  s._lemonTimer = 0;
  s.lemonBase += s.lemonBase * 0.0025 * n / LEMON_BATCH;    // buying pushes the price up
  return true;
}

// ---- Game loop -----------------------------------------------------------

// Advance one tick (1/10 s). `rng` is injectable for tests.
function tick(s, rng = Math.random) {
  adjustLemonPrice(s, rng);

  // Auto squeezer: makes cups only while it has lemons and room.
  s._frac += autoRate(s) / TICKS_PER_SECOND;
  while (s._frac >= 1 - 1e-9) { s._frac = Math.max(0, s._frac - 1); if (!squeeze(s)) { s._frac = 0; break; } }

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

const api = { TICKS_PER_SECOND, LEMON_BATCH, LEMON_REF_PRICE, MAX_LEMONS, AUTO_RATES, AUTO_MAX,
  demand, unitsPerSale, forecast, newState, tick, squeeze, autoRate, autoCost, buyAuto,
  adjustLemonPrice, lemonTrend, buyLemons, marketingCost, buyMarketing, setPrice, clearingPrice };
if (typeof module !== "undefined") module.exports = api;
else window.LemonadeMarket = api;
