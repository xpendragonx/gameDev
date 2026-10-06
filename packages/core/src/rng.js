// Seedable random numbers (mulberry32). Modules must use ctx.rng(), never
// Math.random(), so tests and the headless simulator are repeatable.
export function createRng(seed = 1) {
  let s = seed >>> 0;
  const rng = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  rng.getState = () => s;
  rng.setState = (v) => { s = v >>> 0; };
  return rng;
}
