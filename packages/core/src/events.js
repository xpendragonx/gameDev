// Tiny publish/subscribe bus. Events are queued and delivered after the tick
// so that module order never changes what a handler sees mid-tick.
export function createBus() {
  const handlers = new Map();
  let queue = [];
  return {
    on(name, fn) {
      if (!handlers.has(name)) handlers.set(name, []);
      handlers.get(name).push(fn);
    },
    emit(name, payload) { queue.push({ name, payload }); },
    flush(deliver, limit = 1000) {
      let n = 0;
      while (queue.length) {
        if (++n > limit) throw new Error('Event loop: too many chained events');
        const batch = queue;
        queue = [];
        for (const { name, payload } of batch) {
          for (const fn of handlers.get(name) ?? []) deliver(fn, payload);
        }
      }
    },
  };
}
