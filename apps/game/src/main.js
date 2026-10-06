import { createEngine, TICK_MS } from '@lemonade/core';
import { modules } from './registry.js';

const engine = createEngine({ modules, seed: Date.now() });
setInterval(() => engine.tick(), TICK_MS);
document.getElementById('out').textContent =
  `Engine running with ${modules.length} module(s).`;
