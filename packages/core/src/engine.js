import { createRng } from './rng.js';
import { createBus } from './events.js';

export const TICK_MS = 100;       // fixed step: 10 ticks per second
export const SAVE_VERSION = 1;

function order(modules) {
  const byId = new Map();
  for (const m of modules) {
    if (!m.id) throw new Error('Module is missing an id');
    if (byId.has(m.id)) throw new Error(`Duplicate module id: ${m.id}`);
    byId.set(m.id, m);
  }
  const sorted = [], state = new Map();
  const visit = (m, path) => {
    if (state.get(m.id) === 2) return;
    if (state.get(m.id) === 1) throw new Error(`Dependency cycle: ${[...path, m.id].join(' -> ')}`);
    state.set(m.id, 1);
    for (const dep of m.requires ?? []) {
      const d = byId.get(dep);
      if (!d) throw new Error(`Module "${m.id}" requires missing module "${dep}"`);
      visit(d, [...path, m.id]);
    }
    state.set(m.id, 2);
    sorted.push(m);
  };
  modules.forEach((m) => visit(m, []));
  return sorted;
}

export function createEngine({ modules, seed = 1, config = {} }) {
  const mods = order(modules);
  const rng = createRng(seed);
  const bus = createBus();
  const state = {};
  let tickCount = 0;

  const ctxFor = (m) => ({
    id: m.id,
    state: state[m.id],
    config: { ...(m.config ?? {}), ...(config[m.id] ?? {}) },
    read: (id) => {
      if (!(m.requires ?? []).includes(id)) {
        throw new Error(`Module "${m.id}" read "${id}" without listing it in requires`);
      }
      return state[id];
    },
    rng,
    emit: (name, payload) => bus.emit(name, payload),
    tick: tickCount,
    dt: TICK_MS / 1000,
  });

  for (const m of mods) {
    state[m.id] = m.init ? m.init(ctxFor(m)) ?? {} : {};
  }
  // Modules subscribe once; handlers get a fresh ctx on every delivery.
  for (const m of mods) {
    for (const [name, fn] of Object.entries(m.on ?? {})) {
      bus.on(name, (payload) => fn(ctxFor(m), payload));
    }
  }
  const deliver = (fn, payload) => fn(payload);

  const engine = {
    get state() { return state; },
    get tickCount() { return tickCount; },
    on: (name, fn) => bus.on(name, fn),
    emit: (name, payload) => { bus.emit(name, payload); bus.flush(deliver); },
    tick(n = 1) {
      for (let i = 0; i < n; i++) {
        for (const m of mods) if (m.tick) m.tick(ctxFor(m));
        tickCount++;
        bus.flush(deliver);
      }
    },
    save() {
      const slices = {};
      for (const m of mods) slices[m.id] = { version: m.version ?? 1, state: state[m.id] };
      return JSON.stringify({ saveVersion: SAVE_VERSION, tickCount, rng: rng.getState(), modules: slices });
    },
    load(json) {
      const data = JSON.parse(json);
      if (data.saveVersion !== SAVE_VERSION) throw new Error(`Unsupported save version ${data.saveVersion}`);
      for (const m of mods) {
        const slice = data.modules?.[m.id];
        if (!slice) continue;                      // new module: keep its fresh init state
        const target = m.version ?? 1;
        if (slice.version > target) throw new Error(`Save for "${m.id}" is newer than the game`);
        let s = slice.state;
        if (slice.version < target) {
          if (!m.migrate) throw new Error(`Module "${m.id}" needs migrate() for v${slice.version} -> v${target}`);
          s = m.migrate(s, slice.version);
        }
        state[m.id] = s;
      }
      tickCount = data.tickCount ?? 0;
      rng.setState(data.rng ?? seed);
    },
  };
  return engine;
}
