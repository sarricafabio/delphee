// Serialising mutex with a minimum inter-task gap.
//
// Delphi throttles a single session at roughly 1 req/sec; burst past that and
// it starts returning 5xx or stalling. We serialise every outbound request and
// enforce a gap measured between task *ends*, so a slow request doesn't get an
// extra penalty on top of its own latency.

export interface Throttle {
  run<T>(fn: () => Promise<T>): Promise<T>;
}

export function createThrottle(minGapMs: number): Throttle {
  const queue: Array<() => void> = [];
  let active = false;
  let lastReleaseAt = 0;

  function pump(): void {
    if (active || queue.length === 0) return;
    active = true;
    const now = Date.now();
    const wait = Math.max(0, lastReleaseAt + minGapMs - now);
    setTimeout(() => {
      const task = queue.shift();
      // Measure the gap from when we release this task, not when it finishes.
      lastReleaseAt = Date.now();
      active = false;
      task?.();
      // Allow the next task to be scheduled once this one is dispatched.
      pump();
    }, wait);
  }

  return {
    run<T>(fn: () => Promise<T>): Promise<T> {
      return new Promise<T>((resolve, reject) => {
        queue.push(() => {
          fn().then(resolve, reject);
        });
        pump();
      });
    },
  };
}
