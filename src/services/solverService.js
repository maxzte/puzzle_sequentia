import SolverWorker from './solver.worker.js?worker';

/**
 * Solver background service managing the Web Worker and elapsed performance timer.
 * Completely decoupled from the DOM.
 */
export class SolverService {
  constructor() {
    /** @type {Worker | null} */
    this.worker = null;
    /** @type {number | null} */
    this.timerInterval = null;
    /** @type {number} */
    this.startTime = 0;
  }

  /**
   * Returns current elapsed time formatted as string (e.g., '1.2s').
   * @returns {string}
   */
  getElapsedFormatted() {
    if (!this.startTime) return '0.0s';
    const elapsedSec = ((performance.now() - this.startTime) / 1000).toFixed(1);
    return `${elapsedSec}s`;
  }

  /**
   * Starts solver worker with the provided fragments.
   * 
   * @param {string[]} fragments
   * @param {Object} callbacks
   * @param {(data: { count: number, length: number, result: string, elapsed: string }) => void} callbacks.onProgress
   * @param {(data: { count: number, length: number, result: string, elapsed: string }) => void} callbacks.onDone
   * @param {(err: Error) => void} callbacks.onError
   */
  start(fragments, { onProgress, onDone, onError }) {
    this.stop();

    this.startTime = performance.now();
    this.timerInterval = setInterval(() => {
      // Periodic timer tick
    }, 100);

    try {
      this.worker = new SolverWorker();

      this.worker.onmessage = (e) => {
        const { type, data, error } = e.data;
        const elapsed = this.getElapsedFormatted();

        if (type === 'progress') {
          onProgress?.({ ...data, elapsed });
        } else if (type === 'done') {
          this.clearTimer();
          onDone?.({ ...data, elapsed });
        } else if (type === 'error') {
          this.stop();
          onError?.(new Error(error || 'Worker error'));
        }
      };

      this.worker.onerror = (err) => {
        this.stop();
        onError?.(new Error(err.message || 'Worker runtime error'));
      };

      this.worker.postMessage({
        type: 'start',
        fragments,
      });
    } catch (err) {
      this.stop();
      onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  }

  /**
   * Clears the timer interval.
   */
  clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /**
   * Stops active worker and clears timer.
   */
  stop() {
    this.clearTimer();
    if (this.worker) {
      this.worker.postMessage({ type: 'abort' });
      this.worker.terminate();
      this.worker = null;
    }
  }

  /**
   * Whether the worker is currently running.
   * @returns {boolean}
   */
  isRunning() {
    return this.worker !== null;
  }
}
