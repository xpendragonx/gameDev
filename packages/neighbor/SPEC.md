# neighbor: module spec

**Purpose:** the grandparent-or-neighbor character who gives short hints so the player learns
to price, buy lemons well and use marketing. Never a tutorial: one hint at a time, each once.

**Module id:** `neighbor` | **Version:** 1 | **Requires:** `stage1-stand`, `lemon-market`

The character's name and voice are a **creative placeholder** (see questions). Hint wording below is a draft.

## Config
| Key | Default | Meaning |
|---|---|---|
| `minGapTicks` | 300 | minimum 30 s between hints (the welcome ignores this) |
| `displayTicks` | 200 | how long the current hint stays on screen |
| `pileUpCups` | 30 | unsold cups that count as a pile-up |
| `stockoutsForHint` | 3 | stockouts within 20 s before the sold-out hint |
| `cheapRatio` / `dearRatio` | 0.9 / 1.1 | lemon price vs. `lemon-market.startBase` counted as cheap or dear |

## State (version 1)
| Field | Type | Meaning |
|---|---|---|
| `seen` | string[] | ids of hints already shown |
| `current` | `{ id, text, tick } or null` | hint on screen now |
| `lastTick` | integer | tick the last hint appeared (-infinity at start, stored as null) |
| `recentStockouts` | integer[] | ticks of recent `stockout` events |

## Hint list (priority order; the first eligible wins)
| id | Fires when | Draft text |
|---|---|---|
| `welcome` | tick 0 | "Well hello there! Squeeze a few lemons and sell cups. A quarter sounds about right to start." |
| `first-sale` | `totalCupsSold >= 1` | "Your first customer! Folks pay what they think a cup is worth." |
| `low-lemons` | `lemons < 5` and cash covers a crate | "Running low on lemons, dear. Crates are in the shop." |
| `pile-up` | `cups >= pileUpCups` and nothing sold in the last 10 s | "Lots of cups sitting there. Maybe the price is a bit steep?" |
| `sold-out` | `stockoutsForHint` stockouts in the last 20 s | "Sold out again! If folks line up, you could ask a little more." |
| `lemons-cheap` | market open and `price <= startBase * cheapRatio` (`startBase` read from `lemon-market` state) | "Lemons are cheap this week. Might be a good time to stock up." |
| `lemons-dear` | market open and `price >= startBase * dearRatio` | "Lemons are dear right now. I'd wait a bit if I had enough." |
| `marketing-ready` | cash covers marketing | "A few flyers would bring more folks by. More customers, and you can charge more." |
| `marketing-first` | `marketingLevel == 2` | "More customers than before. Try nudging your price up a few cents." |
| `near-target` | cash >= 80% of `businessUnlockCents` | "You're doing so well. Soon you won't be able to run this all by yourself!" |
| `business` | `businessUnlocked` | "Look at you, a real business! Time to get some help." |

## Rules
1. Check once per tick (or every 10 ticks). Show the first eligible hint **not in `seen`** if `tick - lastTick >= minGapTicks` (or it is the welcome).
2. Showing a hint: set `current`, add its id to `seen`, set `lastTick`.
3. `current` clears after `displayTicks`.
4. `stockout` events are stored in `recentStockouts`; entries older than 20 s are dropped.
5. Hints depend only on state the module can read, never on UI.

## Acceptance tests (plain English)
1. The welcome appears on tick 0 and never again.
2. No hint appears within `minGapTicks` of the previous one, however many conditions are true.
3. Every hint appears at most once, including after save and load.
4. `sold-out` fires only after 3 stockouts within 20 s, not 2, and not 3 spread over a minute.
5. `pile-up` does not fire while cups are selling.
6. `lemons-cheap` and `lemons-dear` never fire before the market opens.
7. With two eligible hints, the one higher in the table shows first.
8. `current` clears after `displayTicks`.
9. `validateModule` passes.

## Not in scope
Illustrations, sound, rendering. Hint copy can be edited without touching logic (copy lives in one data file, `src/hints.js`).

## Open questions for the owner
1. Name and personality of the neighbor? (Warm and slightly funny, or plain and brief?)
2. Should hints stay available in a log the player can reread? (Default: no, the neighbor just talks.)
