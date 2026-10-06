# lemon-market: module spec

**Purpose:** the changing price of a crate of lemons. A copy of the Paperclips wire-price
rule (`index_3.html` lines 5889-5904), scaled to our economy. The player waits for a dip.

**Module id:** `lemon-market` | **Version:** 1 | **Requires:** none

All money is **cents**. Only `base` may be fractional.

## Config (defaults, all tunable)
| Key | Default | Meaning | Paperclips equivalent |
|---|---|---|---|
| `crateSize` | 100 | lemons per crate | 1000 (wire per spool) |
| `startBase` | 200 | starting base price of a crate, cents | 20 |
| `swing` | 60 | wobble size, cents | 6 |
| `floor` | 150 | base stops decaying at or below this, cents | 15 |
| `changeChance` | 0.015 | chance per tick that the price changes | .015 |
| `decayEveryTicks` | 250 | ticks between base decays | 250 |
| `decayDivisor` | 1000 | each decay removes `base / decayDivisor` | 1000 |
| `bumpPerCrate` | 0.05 | cents added to base per crate bought | 0.05 (scaled for the 10x smaller crate) |

## State (version 1)
| Field | Type | Start | Meaning |
|---|---|---|---|
| `open` | boolean | false | market wobble is switched on |
| `base` | number | `startBase` | slow-moving centre of the price |
| `counter` | integer | 0 | steps through the sine wobble |
| `timer` | integer | 0 | ticks since last decay or purchase |
| `price` | integer | `startBase` | **current crate price in cents** (the number other modules read) |
| `crateSize` | integer | `crateSize` | copied from config so other modules can read it |
| `startBase` | integer | `startBase` | copied from config so other modules can judge cheap or dear |

## Behaviour
**While `open` is false:** nothing changes; `price` stays at `startBase`.

**Each tick while open:**
1. `timer += 1`.
2. If `timer > decayEveryTicks` and `base > floor`: `base -= base / decayDivisor`, `timer = 0`. (Like the original, base can end just under the floor; the decay only checks before it runs. `price` is **not** recomputed here.)
3. Roll `rng()` once. If it is below `changeChance`: `counter += 1`, `price = ceil(base + swing * sin(counter))`.

`price` changes **only** in step 3, exactly like the original. Decay and purchase bumps show up at the next wobble.

## Events handled
- `market-open`: set `open = true`. Does not change `price` until the first wobble.
- `lemons-bought { crates }`: `base += bumpPerCrate * crates`, `timer = 0`. Applies even if the market is not open yet.

## Events emitted
None. (The UI reads `price`; the neighbor reads `price` and `base`.)

## Acceptance tests (plain English)
1. Before `market-open`, 5,000 ticks leave `price` at 200 and `counter` at 0.
2. With `changeChance: 1` after opening, `price` changes every tick and always stays within `base - swing` (rounded up) to `base + swing`.
3. With `changeChance: 0`, `price` never changes however long it runs, but `base` still decays.
4. Base decays by `base / 1000` exactly once per 250 ticks above the floor, and stops decaying once at or below the floor.
5. `lemons-bought { crates: 3 }` raises `base` by 0.15 and resets `timer` to 0; a purchase just before a decay delays that decay.
6. The same seed gives the same price sequence; a different seed gives a different one.
7. Save then load mid-run gives an identical future.
8. Config overrides are respected (for example `startBase: 400`).
9. `validateModule` passes.

## Not in scope
Cash, lemon inventory, buying (done by `stage1-stand`), price history or charts, spoilage.

## Open question for the owner
The original rounds to whole units on a base of 20 (steps of about 5%). Rounding to the cent here gives smoother
prices than the original. Round to 10 cents instead to feel exactly like Paperclips? Default: cent.
