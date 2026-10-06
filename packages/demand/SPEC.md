# demand: library spec

**Kind:** library package (pure functions, **not** a module). No state, no ticks, no events.
Modules import it; it imports nothing. Source of the maths: `DESIGN_NOTES.md` section 2.

**Purpose:** the price-against-demand rules, in one tested place, so every module and the
headless simulator use identical numbers.

## Functions (all exported from `src/index.js`)

All prices are **cents** (integers). Constants are parameters with the defaults below, never hidden.

| Function | Returns | Rule |
|---|---|---|
| `demand({ priceCents, marketingLevel = 1, effectiveness = 1, boost = 1, baseDemand = 0.8 })` | number | `(baseDemand / (priceCents / 100)) * 1.1^(marketingLevel - 1) * effectiveness * boost`. Throws if `priceCents <= 0` or `marketingLevel < 1`. |
| `saleChance(d)` | 0..1 | `min(1, d / 100)` (probability of a sale on one tick) |
| `unitsPerSale(d)` | integer >= 0 | `floor(0.7 * d^1.15)` |
| `rollSale({ d, stock, rng })` | `{ wanted, sold }` | If `rng() < saleChance(d)`, `wanted = unitsPerSale(d)`, else `wanted = 0`. `sold = min(wanted, stock)`. Calls `rng()` exactly once per call. |
| `expectedSalesPerSecond(d, ticksPerSecond = 10)` | number | `ticksPerSecond * saleChance(d) * unitsPerSale(d)` (uses the floored units, so it matches what the game actually does) |
| `marketingCostCents(level, baseCostCents = 10000, growth = 2)` | integer | Cost to go from `level` to `level + 1`: `baseCostCents * growth^(level - 1)` |

## Acceptance tests (plain English)
1. At marketing level 1: price 10c gives demand 8.0 and 7 units per sale; 25c gives 3.2 and 2; 50c gives 1.6 and 1; 100c gives 0.8 and **0 units** (the floor). These match the table in `DESIGN_NOTES.md` 2.3.
2. At 25c, level 8 gives demand about 6.24 (3.2 x 1.1^7).
3. Demand falls as price rises and rises with marketing level.
4. `rollSale` never sells more than `stock`, and returns `sold: 0` when stock is 0.
5. `rollSale` is repeatable: the same seeded `rng` sequence gives the same results.
6. Over 200,000 simulated ticks with a seeded rng at 25c, level 1, unlimited stock, average sales per second is within 5% of `expectedSalesPerSecond` (0.64).
7. With defaults, the cost to leave levels 1, 2 and 3 is 10,000, 20,000 and 40,000 cents ($100, $200, $400), and the total to reach level 8 is 1,270,000 cents ($12,700). A different `baseCostCents` scales every level.
8. Invalid input (price 0, negative level) throws a clear error.

## Not in scope
Cash, stock, price controls, UI. Those belong to `stage1-stand`.
