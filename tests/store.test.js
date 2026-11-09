import test from 'node:test';
import assert from 'node:assert/strict';
import { Store } from '../src/models/store.js';

test('Store: initializes with default idle state', () => {
  const store = new Store();
  const state = store.getState();

  assert.equal(state.status, 'idle');
  assert.equal(state.loadingMessage, '');
  assert.deepEqual(state.fragments, []);
  assert.equal(state.result, '');
  assert.equal(state.errorMessage, '');
  assert.equal(state.copied, false);
});

test('Store: handles loading state transition', () => {
  const store = new Store();
  let latestState = null;
  store.subscribe((s) => { latestState = s; });

  store.startLoading('Fetching data...');
  assert.equal(latestState.status, 'loading');
  assert.equal(latestState.loadingMessage, 'Fetching data...');

  // From loading to ready
  store.setInputFragments(['123456'], 'sample.txt');
  assert.equal(latestState.status, 'ready');
  assert.equal(latestState.loadingMessage, '');

  // From loading to error
  store.startLoading('Loading another file...');
  assert.equal(latestState.status, 'loading');
  store.setError('Corrupt file');
  assert.equal(latestState.status, 'error');
  assert.equal(latestState.errorMessage, 'Corrupt file');
  assert.equal(latestState.loadingMessage, '');
});

test('Store: notify subscribers on setInputFragments', () => {
  const store = new Store();
  let callCount = 0;
  let receivedState = null;

  store.subscribe((state) => {
    callCount++;
    receivedState = state;
  });

  store.setInputFragments(['123456', '567890'], 'test.txt');

  assert.equal(callCount, 1);
  assert.equal(receivedState.status, 'ready');
  assert.deepEqual(receivedState.fragments, ['123456', '567890']);
  assert.equal(receivedState.sourceLabel, 'test.txt');
});

test('Store: supports unsubscribe callback', () => {
  const store = new Store();
  let callCount = 0;

  const unsubscribe = store.subscribe(() => {
    callCount++;
  });

  store.setError('Error 1');
  assert.equal(callCount, 1);

  unsubscribe();
  store.setError('Error 2');
  assert.equal(callCount, 1);
});

test('Store: state transitions for solving lifecycle', () => {
  const store = new Store();

  store.setInputFragments(['123456', '567890'], 'test');
  assert.equal(store.getState().status, 'ready');

  store.startSolving();
  assert.equal(store.getState().status, 'running');

  store.updateProgress({ count: 2, length: 10, result: '1234567890', elapsed: '0.1s' });
  assert.equal(store.getState().metrics.chainCount, 2);
  assert.equal(store.getState().result, '1234567890');

  store.finishSolving({ count: 2, length: 10, result: '1234567890', elapsed: '0.2s' });
  assert.equal(store.getState().status, 'finished');

  store.stopSolving();
  assert.equal(store.getState().status, 'stopped');
});

test('Store: copied state toggle', () => {
  const store = new Store();
  assert.equal(store.getState().copied, false);

  store.setCopied(true);
  assert.equal(store.getState().copied, true);

  store.setCopied(false);
  assert.equal(store.getState().copied, false);
});

test('Store: errorCopied state toggle', () => {
  const store = new Store();
  assert.equal(store.getState().errorCopied, false);

  store.setErrorCopied(true);
  assert.equal(store.getState().errorCopied, true);

  store.setErrorCopied(false);
  assert.equal(store.getState().errorCopied, false);
});

