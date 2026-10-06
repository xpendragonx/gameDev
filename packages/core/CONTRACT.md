# Module contract

Every game component is a **module**: a plain object the engine runs. Core knows
only this shape, so parts built separately fit together.

```js
export const myModule = {
  id: 'lemon-market',        // unique, kebab-case
  version: 1,                // version of THIS module's saved state
  requires: ['stage1-stand'],// modules whose state you may read (also sets run order)
  config: { ... },           // every tunable number, with defaults
  init(ctx) { return {...} },// returns the module's starting state slice
  tick(ctx) { ... },         // called every tick (100 ms), in dependency order
  on: { 'event-name'(ctx, payload) { ... } },
  migrate(oldState, fromVersion) { return newState },  // required when version > 1
};
```

`ctx` gives you: `state` (your slice, mutate it directly), `config` (your config
plus any override), `read(id)` (another module's state, only if in `requires`;
treat as read-only), `rng()` (random number 0-1), `emit(name, payload)`, `tick`
(tick count) and `dt` (seconds per tick, always 0.1).

## Rules
1. **No DOM, no `window`, no `Math.random()`, no `Date.now()` in a module.** Use `ctx.rng()` and the tick count.
2. **Only write your own state.** Change other modules by emitting events they handle.
3. **No imports from other modules.** Talk through state (`read`) and events. The one exception is a **library package** (below).
4. **No hard-coded numbers.** They go in `config` so they can be tuned and simulated.
5. **State must be plain JSON** (numbers, strings, booleans, arrays, plain objects).
6. **Changing the shape of your state means bumping `version` and writing `migrate`.**
7. **Every module has a `SPEC.md` and tests**, and passes `validateModule`.

## Engine decisions (change here first if you want them different)
- **Fixed 100 ms tick.** 10 ticks per second. Economy math assumes this.
- **Events** are queued during a tick and delivered after all modules have ticked. Chains longer than 1000 events throw.
- **Randomness** is one seeded generator shared by the engine and saved with the game, so a seed plus saved state replays exactly.
- **Save** is versioned JSON (`engine.save()` / `engine.load()`). Storage (localStorage) is the app's job, not core's.
- **Modules added after a save** start fresh. **Slices with an older version** must migrate or loading fails loudly.
- **No offline progress** yet. A hidden browser tab simply runs slower; catching up is a later feature.

## Library packages
Pure formula code shared by several modules (for example `demand`) is a **library
package**, not a module. A library has no state, no ticks and no events, imports nothing
from other packages, and is never added to the registry. Modules may import libraries
directly. Libraries take every constant as a parameter with a default, and have tests
and a `SPEC.md` like any module.
