/**
 * Application State Store.
 * Provides unidirectional data flow and observable state transitions.
 * 
 * @typedef {'idle' | 'loading' | 'ready' | 'running' | 'finished' | 'stopped' | 'error'} AppStatus
 * 
 * @typedef {'validation' | 'system' | null} ErrorType
 * 
 * @typedef {Object} AppState
 * @property {AppStatus} status
 * @property {string} loadingMessage
 * @property {string} sourceLabel
 * @property {string[]} fragments
 * @property {{ chainCount: number, digitsCount: number, elapsed: string }} metrics
 * @property {string} result
 * @property {string} errorMessage
 * @property {ErrorType} errorType
 * @property {boolean} copied
 * @property {boolean} errorCopied
 */

export class Store {
  /**
   * @param {Partial<AppState>} [initialState]
   */
  constructor(initialState = {}) {
    /** @type {AppState} */
    this.state = {
      status: 'idle',
      loadingMessage: '',
      sourceLabel: '',
      fragments: [],
      metrics: { chainCount: 0, digitsCount: 0, elapsed: '0.0s' },
      result: '',
      errorMessage: '',
      errorType: null,
      copied: false,
      errorCopied: false,
      ...initialState,
    };

    /** @type {Set<(state: AppState) => void>} */
    this.listeners = new Set();
  }

  /**
   * Returns current snapshot of application state.
   * @returns {AppState}
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Subscribes a listener callback to state updates.
   * @param {(state: AppState) => void} listener
   * @returns {() => void} Unsubscribe function
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Updates state partially and notifies all registered subscribers.
   * @param {Partial<AppState>} partialState
   */
  setState(partialState) {
    this.state = {
      ...this.state,
      ...partialState,
      metrics: {
        ...this.state.metrics,
        ...(partialState.metrics || {}),
      },
    };

    this.notify();
  }

  /**
   * Notifies all subscribers with the updated state.
   */
  notify() {
    const currentState = this.getState();
    for (const listener of this.listeners) {
      listener(currentState);
    }
  }

  /**
   * Puts store into loading state.
   * @param {string} [message='Reading & parsing file...']
   */
  startLoading(message = 'Reading & parsing file...') {
    this.setState({
      status: 'loading',
      loadingMessage: message,
      errorMessage: '',
    });
  }

  /**
   * Sets new input fragments after successful load/validation.
   * @param {string[]} fragments
   * @param {string} sourceLabel
   */
  setInputFragments(fragments, sourceLabel) {
    this.setState({
      status: 'ready',
      loadingMessage: '',
      fragments,
      sourceLabel,
      errorMessage: '',
      errorType: null,
      result: '',
      metrics: { chainCount: 0, digitsCount: 0, elapsed: '0.0s' },
    });
  }

  /**
   * Sets error and resets loading state.
   * @param {string} errorMsg
   * @param {ErrorType} [errorType='system']
   */
  setError(errorMsg, errorType = 'system') {
    this.setState({
      status: 'error',
      loadingMessage: '',
      fragments: [],
      errorMessage: errorMsg,
      errorType,
      errorCopied: false,
    });
  }

  /**
   * Clears input and resets to idle.
   */
  clearInput() {
    this.setState({
      status: 'idle',
      loadingMessage: '',
      fragments: [],
      sourceLabel: '',
      errorMessage: '',
      errorType: null,
      result: '',
      metrics: { chainCount: 0, digitsCount: 0, elapsed: '0.0s' },
    });
  }

  /**
   * Marks state as solving in progress.
   */
  startSolving() {
    this.setState({
      status: 'running',
      loadingMessage: '',
      errorMessage: '',
      // Preserve existing result during re-solve to prevent UI layout shift
      result: this.state.result || '',
      metrics: {
        chainCount: this.state.result ? this.state.metrics.chainCount : 0,
        digitsCount: this.state.result ? this.state.metrics.digitsCount : 0,
        elapsed: '0.0s',
      },
      copied: false,
    });
  }

  /**
   * Updates only elapsed time metric during solving.
   * @param {string} elapsed
   */
  updateElapsed(elapsed) {
    if (this.state.status === 'running') {
      this.setState({
        metrics: {
          ...this.state.metrics,
          elapsed,
        },
      });
    }
  }

  /**
   * Updates solver progress metrics and current best result.
   * @param {{ count: number, length: number, result: string, elapsed: string }} progress
   */
  updateProgress(progress) {
    this.setState({
      metrics: {
        chainCount: progress.count,
        digitsCount: progress.length,
        elapsed: progress.elapsed,
      },
      result: progress.result,
    });
  }

  /**
   * Marks solving as finished.
   * @param {{ count: number, length: number, result: string, elapsed: string }} final
   */
  finishSolving(final) {
    this.setState({
      status: 'finished',
      metrics: {
        chainCount: final.count,
        digitsCount: final.length,
        elapsed: final.elapsed,
      },
      result: final.result,
    });
  }

  /**
   * Marks solving as manually stopped.
   */
  stopSolving() {
    this.setState({
      status: 'stopped',
    });
  }

  /**
   * Marks copied state with optional timeout reset.
   * @param {boolean} isCopied
   */
  setCopied(isCopied) {
    this.setState({ copied: isCopied });
  }

  /**
   * Marks error report copied state with optional timeout reset.
   * @param {boolean} isCopied
   */
  setErrorCopied(isCopied) {
    this.setState({ errorCopied: isCopied });
  }
}
