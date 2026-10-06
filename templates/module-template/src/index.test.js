import { describe, it, expect } from 'vitest';
import { createEngine, validateModule } from '@lemonade/core';
import { exampleModule } from './index.js';

describe('example module', () => {
  it('follows the contract', () => {
    expect(validateModule(exampleModule)).toEqual([]);
  });
  it('does its job', () => {
    const e = createEngine({ modules: [exampleModule] });
    e.tick(10);
    expect(e.state.example.n).toBe(10);
  });
});
