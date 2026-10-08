// Lemonade market, a straight port of the Universal Paperclips economy
// (reference: index_3.html). Clips -> cups, wire -> lemons, AutoClippers ->
// Auto Squeezers. Pure logic, no I/O. Formulas follow DESIGN_NOTES.md.

const TICKS_PER_SECOND = 10;   // sales roll every 100 ms, like the reference

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
// Lemons (bought by the crate) -> squeeze -> cups (stock) -> sold.

const LEMON_SUPPLY = 1000;       // lemons per crate         (wireSupply)
const LEMON_START_BASE = 20;     // base crate price         (wireBasePrice)
const LEMON_FLOOR = 15;          // base never decays below  (wireBasePrice > 15)
const LEMON_SWING = 6;           // price = base + 6*sin(n)  (wireAdjust)
const LEMON_REF_PRICE = 20;      // "normal" crate price for CHEAP/PRICEY labels

// Auto Squeezer = AutoClipper. Cost after each purchase: 1.1^count + 5.
const SQUEEZER_BASE_COST = 5;
const squeezerCost = (count) => (count === 0 ? SQUEEZER_BASE_COST : Math.pow(1.1, count) + 5);

// "Improved AutoClippers" projects: clipperBoost += .25, .50, .75, then 5.
// The reference pays in Operations; Operations are cut here, so the same
// numbers are paid in dollars.
const BOOSTS = [
  { cost: 750,  add: 0.25 },
  { cost: 2500, add: 0.50 },
  { cost: 5000, add: 0.75 },
  { cost: 6000, add: 5.00 },
];

// MegaClippers: unlocked at 75 AutoClippers (12,000 ops in the reference),
// then cost 1.07^count * 1000 each and make 500 clips/s.
const MEGA_UNLOCK_SQUEEZERS = 75;
const MEGA_UNLOCK_COST = 12000;
const MEGA_RATE = 500;
const megaCost = (count) => Math.pow(1.07, count) * 1000;

const newState = () => ({
  cash: 0, stock: 0, lemons: LEMON_SUPPLY, price: 0.25, mktLvl: 1,
  adCost: 100,
  squeezers: 0, boostLvl: 0, boost: 1, megaUnlocked: false, megas: 0,
  made: 0, sold: 0,
  lemonBase: LEMON_START_BASE, lemonPrice: LEMON_START_BASE,
  _lemonWave: 0, _lemonTimer: 0,
});

// The button: 1 lemon -> 1 cup. Also used for auto production (fractional).
function squeeze(s, n = 1) {
  const made = Math.min(n, s.lemons);
  if (made <= 0) return false;
  s.lemons -= made; s.stock += made; s.made += made;
  return true;
}

// Cups per second from machines.
const autoRate = (s) => s.boost * s.squeezers + s.megas * MEGA_RATE;

function buySqueezer(s) {
  const cost = squeezerCost(s.squeezers);
  if (s.cash < cost) return false;
  s.cash -= cost; s.squeezers++;
  return true;
}

const boostCost = (s) => (s.boostLvl < BOOSTS.length && s.squeezers >= 1 ? BOOSTS[s.boostLvl].cost : null);

function buyBoost(s) {
  const cost = boostCost(s);
  if (cost === null || s.cash < cost) return false;
  s.cash -= cost; s.boost += BOOSTS[s.boostLvl].add; s.boostLvl++;
  return true;
}

function buyMega(s) {
  if (s.squeezers < MEGA_UNLOCK_SQUEEZERS) return false;
  if (!s.megaUnlocked) {
    if (s.cash < MEGA_UNLOCK_COST) return false;
    s.cash -= MEGA_UNLOCK_COST; s.megaUnlocked = true;
    return true;
  }
  const cost = megaCost(s.megas);
  if (s.cash < cost) return false;
  s.cash -= cost; s.megas++;
  return true;
}

// ---- Lemon price: cheap times and expensive times -----------------------
// adjustWirePrice / buyWire from the reference. A sine wave around a base
// price that updates at random moments; buying pushes the base up and it
// slowly decays back down while you are not buying.

function adjustLemonPrice(s, rng = Math.random) {
  s._lemonTimer++;
  if (s._lemonTimer > 25 && s.lemonBase > LEMON_FLOOR) {    // 250 ticks of 10 ms
    s.lemonBase -= s.lemonBase / 1000;
    s._lemonTimer = 0;
  }
  if (rng() < 0.14) {                                        // .015 per 10 ms tick
    s._lemonWave++;
    s.lemonPrice = Math.ceil(s.lemonBase + LEMON_SWING * Math.sin(s._lemonWave));
  }
}

function lemonTrend(s) {
  if (s.lemonPrice <= LEMON_REF_PRICE - 3) return 'cheap';
  if (s.lemonPrice >= LEMON_REF_PRICE + 3) return 'pricey';
  return 'normal';
}

// Buy a crate of lemons at the current price.
function buyLemons(s) {
  if (s.cash < s.lemonPrice) return false;
  s.cash -= s.lemonPrice; s.lemons += LEMON_SUPPLY;
  s._lemonTimer = 0;
  s.lemonBase += 0.05;
  return true;
}

// "Beg for More Wire" in the reference: if you are broke, out of lemons and out
// of cups, a free crate is offered so the game can never soft-lock.
const isStuck = (s) => s.lemons < 1 && s.stock < 1 && s.cash < s.lemonPrice;
function begForLemons(s) {
  if (!isStuck(s)) return false;
  s.lemons = LEMON_SUPPLY;
  return true;
}

// ---- Game loop -----------------------------------------------------------

// Advance one tick (1/10 s). `rng` is injectable for tests.
function tick(s, rng = Math.random) {
  adjustLemonPrice(s, rng);
  squeeze(s, autoRate(s) / TICKS_PER_SECOND);

  // Demand: a chance of a sale this tick, sale size grows with demand.
  const d = demand(s.price, { mktLvl: s.mktLvl });
  let sold = 0;
  if (rng() < d / 100) {
    sold = Math.min(unitsPerSale(d), s.stock);   // stock caps sales
    s.stock -= sold;
    s.cash = Math.floor((s.cash + sold * s.price) * 1000) / 1000;
    s.sold += sold;
  }
  return { demand: d, sold };
}

// Marketing: each level costs double the last (starts at 100), +10% demand.
function buyMarketing(s) {
  if (s.cash < s.adCost) return false;
  s.cash -= s.adCost; s.mktLvl++; s.adCost = Math.floor(s.adCost * 2);
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

const api = { TICKS_PER_SECOND, LEMON_SUPPLY, LEMON_REF_PRICE, BOOSTS, MEGA_UNLOCK_SQUEEZERS, MEGA_UNLOCK_COST, MEGA_RATE,
  demand, unitsPerSale, forecast, newState, tick, squeeze, autoRate, squeezerCost, buySqueezer,
  boostCost, buyBoost, megaCost, buyMega, adjustLemonPrice, lemonTrend, buyLemons, isStuck, begForLemons,
  buyMarketing, setPrice, clearingPrice };
if (typeof module !== "undefined") module.exports = api;
else window.LemonadeMarket = api;
