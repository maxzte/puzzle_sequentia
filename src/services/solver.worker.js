import { solveLongestChain } from '../models/solver.js';

let activeSignal = { aborted: false };

self.onmessage = function (event) {
  const { type, fragments } = event.data;

  if (type === 'start') {
    activeSignal = { aborted: false };

    try {
      const solution = solveLongestChain(fragments, {
        signal: activeSignal,
        onProgress: (progress) => {
          self.postMessage({
            type: 'progress',
            data: progress,
          });
        },
      });

      self.postMessage({
        type: 'done',
        data: solution,
      });
    } catch (err) {
      self.postMessage({
        type: 'error',
        error: err.message || 'An unexpected error occurred in solver worker.',
      });
    }
  } else if (type === 'abort') {
    activeSignal.aborted = true;
    self.postMessage({ type: 'aborted' });
  }
};

