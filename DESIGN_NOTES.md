# Lemonade Empire — Design Notes (v2, machete'd)

A child's lemonade stand grows into a multinational lemonade empire.
Incremental, text-based, built around a management system.
The product is always lemonade.

This replaces the earlier notes. Most of them were Universal Paperclips
re-skinned one-to-one, and almost all of that has been cut.

---

## 1. Core concept

- Start as a kid with a stand. End as a global company.
- The fun is **exponential growth, new discoveries, text-based mechanics, and surprise turns**.
- The game is about **management**: each stage, the player stops doing what
  they did last stage and takes on a new job one level up.
- Lemonade throughout. No product change, no diversification.

## 2. Core mechanic: price against elastic demand

The best part of the opening is setting a price against a demand curve that
keeps moving. Marketing lifts demand, so the player must reprice. Everything
else in the game should plug into this loop.

### 2.1 What the reference game does (from `index_3.html`)

Reference: Universal Paperclips, lines 9444–9445, 9703–9706, 8238, 8267.

**Demand**, recalculated every tick:
```
marketing = 1.1 ^ (marketingLvl - 1)
demand    = (0.8 / price) * marketing * marketingEffectiveness * demandBoost
```

**Sales**, every 100 ms (10 ticks per second):
```
with probability demand / 100:
    sell floor(0.7 * demand ^ 1.15) units      // capped at unsold stock
```

**Marketing**: each level costs double the last (starts at 100) and adds 10% to demand.

**Price**: starts at 0.25 and moves in steps of 0.01.

### 2.2 In plain JavaScript

```js
const demand = (price, mktLvl = 1, effect = 1, boost = 1) =>
  (0.8 / price) * Math.pow(1.1, mktLvl - 1) * effect * boost;

function tick(state) {                       // runs 10 times a second
  const d = demand(state.price, state.mktLvl);
  if (Math.random() < d / 100) {
    const wanted = Math.floor(0.7 * Math.pow(d, 1.15));
    const sold = Math.min(wanted, state.stock);   // production caps sales
    state.stock -= sold;
    state.cash  += sold * state.price;
  }
}
```

### 2.3 The maths

Expected sales per second ≈ `10 × (d/100) × 0.7 × d^1.15 = 0.07 × d^2.15`.
Since `d ≈ 0.8 / price`, **sales fall like `price^-2.15`**. Demand is
elastic: a 10% price rise loses about 20% of sales.

Revenue per second is `price × sales ∝ price^-1.15`. **Revenue rises as price
falls.** Nothing in the formula rewards a high price by itself.

Worked numbers (marketing level 1):

| Price | Demand | Units per sale | Sales / sec | Revenue / sec |
|---|---|---|---|---|
| $0.10 | 8.0 | 7 | 5.60 | $0.56 |
| $0.25 | 3.2 | 2 | 0.64 | $0.16 |
| $0.50 | 1.6 | 1 | 0.16 | $0.08 |
| $1.00 | 0.8 | 0 | 0.00 | $0.00 |

At $1.00 the player sells nothing at all, because the `floor` rounds to 0.

### 2.4 Why the player still has a decision

Sales are capped by **stock**, which is production. So the target price is
the **lowest price that still clears what you produce** without selling out:

- Price too high: demand falls below production and stock piles up.
- Price too low: demand exceeds production, you sell out and give away margin.
- Production goes up: lower the price to clear it.
- Marketing goes up: raise the price and still clear it.

Marketing example. At level 8 the multiplier is `1.1^7 ≈ 1.95`:

| Price | Marketing level | Demand | Sales / sec |
|---|---|---|---|
| $0.25 | 1 | 3.20 | 0.64 |
| $0.25 | 8 | 6.24 | 3.12 |
| $0.49 | 8 | ≈3.2 | ≈0.64 |

Eight levels of marketing let the player charge about twice the price for the
same sales. It cost `100 × (2^7 − 1) = 12,700` to get there. Doubling cost for
+10% demand is what makes the player eventually stop buying ads.

### 2.5 Things that make this easy to get wrong

- **The floor.** `floor(0.7 × d^1.15)` is 0 when demand is below about 1.4.
- **Sales are random.** Each tick is a chance of a sale. Averages follow the
  formula, but a short run does not.
- **Stock caps sales.** The formula has no supply term. The cap is in the sell step.
- **Marketing is a trade-off,** not a free boost.

## 2.6 Supply side: lemons, squeezing and the variable lemon price

Cups come from lemons. This gives the player a second price to watch: the
price they **pay** for lemons.

- **Squeeze a Cup button:** 1 lemon becomes 1 cup in stock.
- **Auto Squeezer:** costs money ($10), then squeezes 1 cup per second. It
  stops when lemons run out or cup storage is full.
- **5 upgrade levels:** each costs money and adds 0.2 cups/s.

| Level | Rate (cups/s) | Cost to reach |
|---|---|---|
| 1 (buy) | 1.0 | $10 |
| 2 | 1.2 | $20 |
| 3 | 1.4 | $40 |
| 4 | 1.6 | $80 |
| 5 | 1.8 | $160 |
| 6 | 2.0 | $320 |

**Variable lemon price.** The price to buy lemons moves, so there are
*expensive times* and *cheap times* to buy. It copies the wire price in
the reference game (`adjustWirePrice`, `buyWire`):

```
price = ceil(100 * (base + 0.03 * sin(wave))) / 100
wave += 0.4 at random moments (about every 5 seconds)
base  = 0.10 to start
```

- The price swings between roughly $0.07 and $0.13 around the base.
- **Buying pushes the base up** (+0.25% per 10 lemons), so spamming the buy
  button costs more.
- **Base decays slowly** back toward a floor of $0.075 while the player is not buying.
- The UI labels the price CHEAP or PRICEY, compared with a normal $0.10.
- Lemons come in batches of 10 and storage holds 200, so the player can
  stock up when cheap and wait out the expensive times.

Margin check: a cup sells for $0.25 and costs one lemon, $0.07 to $0.13. If
the player drops the cup price toward $0.10 to clear stock, a pricey lemon
wipes out the profit. Supply cost and demand now pull on the same decision.

## 3. Stages

Each stage adds a new job and a new kind of decision. All of them act on the
price/demand loop above.

| Stage | Player's job | Hands off |
|---|---|---|
| 1. The Stand | Squeeze cups, set the price, buy lemons | |
| 2. The Business | Hire staff, open locations, buy marketing | Squeezing and serving |
| 3. The Company | Run it through managers. Raise money on the stock market. | Day-to-day locations |
| 4. The Empire | Fight rival companies for lemon-growing regions | Whole regions |

Plan to automate pricing in Stage 2 or 3: a pricing manager the player hires,
then directs, so the skill learned by hand becomes a policy.

## 4. Two features

- **Stock market (Stage 3).** *Open:* your own company's shares (raise cash, get diluted),
  or trading other stocks. Leaning toward the first.
- **Region battles (Stage 4).** Contest lemon-growing regions with rivals. *Open:*
  automatic resolution over time (leaning) or turn-based on a map.

## 5. Kept from the first build

- The manual **"Squeeze a Cup"** start.
- The cost scaling, demand curve and production math.

## 6. Cut

- Trust, the "supercomputer," Operations/Ideas, and the ~85-project list.
- The six math-problem projects, flavor projects and Coherent Extrapolated Volition.
- Oil, refining and power throttling.
- Honor, Army Discipline, the Strategy Engine and the Investment Engine.
- The simulation reveal, New Game+ and the credits screen.
- Diversifying away from lemonade.

## 7. Open questions

1. How should the player learn market forces? No approach is chosen yet.
2. Does the player see the demand curve, or only its results?
3. Does the sell price vary by day or weather (a moving best price), or only by marketing and production? (The lemon *buy* price already varies, see 2.6.)
4. The exact stages between the stand and the empire, and what changes in each.
5. Is there an ending?
6. Stock market and region battle details (see section 4).
7. Where the existing `lemonade-empire/` code lives. It is in `xpendragonx/A.I.Artist`
   and is not available in this repo yet.

## 8. Next step

Work on the **first five minutes of Stage 1**, built around section 2, before anything else.
