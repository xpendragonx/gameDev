import { describe, it, expect } from 'vitest';
import { createEngine, createRng } from './index.js';

const counter = {
  id: 'counter', version: 1,
  config: { step: 1 },
  init: () => ({ n: 0 }),
  tick: (ctx) => { ctx.state.n += ctx.config.step; },
};

describe('rng', () => {
  it('is repeatable for the same seed and differs between seeds', () => {
    const a = createRng(7), b = createRng(7), c = createRng(8);
    const seqA = [a(), a(), a()], seqB = [b(), b(), b()];
    expect(seqA).toEqual(seqB);
    expect([c(), c(), c()]).not.toEqual(seqA);
    expect(seqA.every((x) => x >= 0 && x < 1)).toBe(true);
  });
});

describe('engine', () => {
  it('ticks modules and applies config overrides', () => {
    const e = createEngine({ modules: [counter], config: { counter: { step: 5 } } });
    e.tick(3);
    expect(e.state.counter.n).toBe(15);
    expect(e.tickCount).toBe(3);
  });

  it('runs required modules first, regardless of list order', () => {
    const log = [];
    const a = { id: 'a', tick: () => log.push('a') };
    const b = { id: 'b', requires: ['a'], tick: () => log.push('b') };
    createEngine({ modules: [b, a] }).tick();
    expect(log).toEqual(['a', 'b']);
  });

  it('rejects missing, duplicate and cyclic modules', () => {
    expect(() => createEngine({ modules: [{ id: 'x', requires: ['nope'] }] })).toThrow(/missing module/);
    expect(() => createEngine({ modules: [counter, counter] })).toThrow(/Duplicate/);
    const p = { id: 'p', requires: ['q'] }, q = { id: 'q', requires: ['p'] };
    expect(() => createEngine({ modules: [p, q] })).toThrow(/cycle/);
  });

  it('only lets a module read modules it requires', () => {
    const spy = { id: 'spy', tick: (ctx) => ctx.read('counter') };
    const e = createEngine({ modules: [counter, spy] });
    expect(() => e.tick()).toThrow(/without listing/);
  });

  it('delivers events after the tick, to subscribed modules', () => {
    const seen = [];
    const sender = { id: 'sender', tick: (ctx) => { if (ctx.tick === 1) ctx.emit('ping', 42); } };
    const listener = { id: 'listener', on: { ping: (ctx, p) => seen.push(p) } };
    const e = createEngine({ modules: [sender, listener] });
    e.tick(3);
    expect(seen).toEqual([42]);
  });

  it('stops runaway event chains', () => {
    const loop = { id: 'loop', on: { x: (ctx) => ctx.emit('x') } };
    const e = createEngine({ modules: [loop] });
    expect(() => e.emit('x')).toThrow(/too many/);
  });

  it('is deterministic for the same seed', () => {
    const rolls = { id: 'rolls', init: () => ({ v: [] }), tick: (ctx) => ctx.state.v.push(ctx.rng()) };
    const run = (seed) => { const e = createEngine({ modules: [rolls], seed }); e.tick(5); return e.state.rolls.v; };
    expect(run(3)).toEqual(run(3));
    expect(run(3)).not.toEqual(run(4));
  });
});

describe('save and load', () => {
  it('round-trips state, tick count and random sequence', () => {
    const rolls = { id: 'rolls', init: () => ({ v: [] }), tick: (ctx) => ctx.state.v.push(ctx.rng()) };
    const a = createEngine({ modules: [counter, rolls], seed: 9 });
    a.tick(4);
    const saved = a.save();
    a.tick(4);
    const b = createEngine({ modules: [counter, rolls], seed: 9 });
    b.load(saved);
    b.tick(4);
    expect(b.state).toEqual(a.state);
    expect(b.tickCount).toBe(8);
  });

  it('migrates an older slice and refuses one with no migration', () => {
    const v1 = { id: 'm', version: 1, init: () => ({ cash: 5 }) };
    const old = createEngine({ modules: [v1] }).save();
    const v2 = { id: 'm', version: 2, init: () => ({ money: 0 }), migrate: (s) => ({ money: s.cash }) };
    const e = createEngine({ modules: [v2] });
    e.load(old);
    expect(e.state.m).toEqual({ money: 5 });
    const noMigrate = { id: 'm', version: 2, init: () => ({}) };
    expect(() => createEngine({ modules: [noMigrate] }).load(old)).toThrow(/migrate/);
  });

  it('keeps fresh state for modules added after the save', () => {
    const old = createEngine({ modules: [counter] }).save();
    const added = { id: 'added', init: () => ({ ok: true }) };
    const e = createEngine({ modules: [counter, added] });
    e.load(old);
    expect(e.state.added).toEqual({ ok: true });
  });
});

import { validateModule } from './index.js';
describe('validateModule', () => {
  it('accepts a good module and flags bad ones', () => {
    expect(validateModule(counter)).toEqual([]);
    expect(validateModule({ id: '' })).not.toEqual([]);
    expect(validateModule({ id: 'x', tikc: () => {} })).toEqual(['unknown field "tikc"']);
    expect(validateModule({ id: 'x', version: 2 })).toEqual(['version > 1 requires migrate()']);
  });
});
