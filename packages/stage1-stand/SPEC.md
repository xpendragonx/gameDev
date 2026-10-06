# stage1-stand: module spec

**Purpose:** the whole Stage 1 game: squeeze cups, buy lemons, set a price, buy marketing,
and reach the cash target that unlocks "The Business" (Stage 2).

**Module id:** `stage1-stand` | **Version:** 1 | **Requires:** `lemon-market`
**Imports (library):** `@lemonade/demand`

All money is **cents** (integers). The player never sees the demand curve, only results.

## Config (defaults; all marked TUNE are expected to change after the simulator runs)
| Key | Default | Meaning |
|---|---|---|
| `startCash` | 0 | cents |
| `startLemons` | 20 | enough for the first half-minute |
| `startPriceCents` | 25 | per DESIGN_NOTES |
| `minPriceCents` / `maxPriceCents` | 1 / 500 | price limits |
| `priceStepCents` | 1 | size of one nudge |
| `lemonsPerCup` | 1 | |
| `marketingBaseCostCents` | 2500 | TUNE: first level costs $25 (DESIGN_NOTES says 100; $100 is out of reach in five minutes by hand) |
| `marketingGrowth` | 2 | each level costs double the last |
| `marketOpensAfterCups` | 25 | total cups sold before lemon prices start moving |
| `businessUnlockCents` | 10000 | TUNE: cash that unlocks Stage 2 ($100; aim is about five to six minutes by hand) |
| `demandBase`, `effectiveness`, `boost` | 0.8, 1, 1 | passed to `demand()` |

## State (version 1)
| Field | Type | Start | Meaning |
|---|---|---|---|
| `cash` | integer | `startCash` | cents |
| `lemons` | integer | `startLemons` | |
| `cups` | integer | 0 | cups squeezed and ready to sell (**stock**) |
| `priceCents` | integer | `startPriceCents` | cup price |
| `marketingLevel` | integer | 1 | |
| `totalCupsSold` | integer | 0 | |
| `totalSquoze` | integer | 0 | cups squeezed by hand |
| `marketOpened` | boolean | false | |
| `businessUnlocked` | boolean | false | |
| `recent` | integer[60] | zeros | cups sold in each of the last 60 seconds, newest last. The UI shows "cups per minute" from this. |

## Events handled (the UI sends these)
| Event | Payload | Rule |
|---|---|---|
| `stand/squeeze` | none | If `lemons >= lemonsPerCup`: `lemons -= lemonsPerCup`, `cups += 1`, `totalSquoze += 1`. Otherwise do nothing. |
| `stand/set-price` | `{ cents }` | Clamp to min/max, round to integer. |
| `stand/nudge-price` | `{ steps }` (+/-) | `priceCents += steps * priceStepCents`, clamped. |
| `stand/buy-crate` | `{ crates = 1 }` | Cost is `lemon-market.price * crates` (read from `lemon-market`). If `cash` covers it: deduct, `lemons += crateSize * crates` (`crateSize` read from `lemon-market` state), emit `lemons-bought`. Else do nothing. |
| `stand/buy-marketing` | none | Cost is `marketingCostCents(level, ...)`. If affordable: deduct, `marketingLevel += 1`, emit `marketing-bought`. |


## Each tick
1. `d = demand({ priceCents, marketingLevel, ... })`.
2. `{ wanted, sold } = rollSale({ d, stock: cups, rng })`.
3. If `sold > 0`: `cups -= sold`, `cash += sold * priceCents`, `totalCupsSold += sold`, add to the current `recent` bucket, emit `sale { units, cents }`.
4. If `wanted > sold`: emit `stockout { wanted, had: cups_before }`.
5. Every 10th tick: shift `recent` left and append 0.
6. If `!marketOpened` and `totalCupsSold >= marketOpensAfterCups`: set it true and emit `market-open`.
7. If `!businessUnlocked` and `cash >= businessUnlockCents`: set it true and emit `business-unlocked`.

## Events emitted
`sale`, `stockout`, `lemons-bought { crates, priceCents }`, `marketing-bought { level }`, `market-open`, `business-unlocked`.

## Acceptance tests (plain English)
1. Start state matches config. Squeezing with zero lemons does nothing.
2. Squeezing turns one lemon into one cup.
3. Price clamps at the minimum and maximum; `set-price` rounds fractions.
4. Buying a crate with too little cash changes nothing; with enough cash it deducts the crate price **as it is at that moment** and adds the crate's lemons.
5. With a fixed seed, price 25, level 1 and unlimited cups, average cash per second over a long run is within 5% of 0.64 x 25 cents (16c/s).
6. A sale never sells more cups than exist; when demand wants more, `stockout` is emitted and cash rises only for what was sold.
7. At price 100 nothing ever sells (the floor), even over a long run.
8. Marketing: each purchase costs double the last, adds one level, and is refused if unaffordable.
9. `market-open` fires exactly once, when total cups sold first reaches 25; `lemon-market` then starts moving (integration test with both modules).
10. `business-unlocked` fires exactly once, when cash first reaches the target.
11. `recent` keeps exactly 60 entries and its sum equals cups sold in the last minute.
12. Save then load mid-run gives an identical future. `validateModule` passes.

## Not in scope
UI, hints (`neighbor`), staff or locations (Stage 2), the demand-curve reveal, weather.

## Open questions for the owner
1. Is $0 start cash with 20 lemons right, or should the player start with a little money?
2. Is "cup stock" visible, or only "cups per minute"? (Default: both, the stock is the key to learning to reprice.)
