// Copy this folder to packages/<name>/ and rename. See packages/core/CONTRACT.md.
export const config = {
  // every tunable number lives here
  step: 1,
};

export const exampleModule = {
  id: 'example',
  version: 1,
  requires: [],
  config,
  init: () => ({ n: 0 }),
  tick: (ctx) => {
    ctx.state.n += ctx.config.step;
  },
  on: {},
};
