import test from 'node:test';
import assert from 'node:assert/strict';
import {
  reconstructSequence,
  validateSequence,
  solveLongestChain,
} from '../src/models/solver.js';

test('reconstructSequence: joins overlapping fragments correctly', () => {
  const fragments = ['248460', '608017', '177092'];
  const chain = [0, 1, 2];
  const result = reconstructSequence(chain, fragments);
  assert.equal(result, '24846080177092');
  assert.equal(validateSequence(chain, fragments), true);
});

test('solveLongestChain: solves assignment example correctly', () => {
  const fragments = ['608017', '248460', '962282', '994725', '177092'];
  const solution = solveLongestChain(fragments);

  assert.equal(solution.count, 3);
  assert.equal(solution.result, '24846080177092');
  assert.equal(solution.length, 14);
  assert.equal(validateSequence(solution.chain, fragments), true);
});

test('solveLongestChain: enforces each fragment is used at most once', () => {
  // Graph with cycles: 123456 -> 567812 -> 123456 (cycle)
  const fragments = ['123456', '567812', '129999'];
  const solution = solveLongestChain(fragments);

  // Even though 12 connects to 123456, index 0 cannot be reused!
  const chainSet = new Set(solution.chain);
  assert.equal(chainSet.size, solution.chain.length);
  assert.equal(validateSequence(solution.chain, fragments), true);
});

test('solveLongestChain: handles empty fragments list', () => {
  const solution = solveLongestChain([]);
  assert.equal(solution.count, 0);
  assert.equal(solution.result, '');
});

test('solveLongestChain: supports abort signal', () => {
  const fragments = ['123456', '567890'];
  const signal = { aborted: true };
  const solution = solveLongestChain(fragments, { signal });
  assert.equal(solution.completed, false);
});

test('solveLongestChain: streams progress updates via onProgress callback', () => {
  const fragments = ['248460', '608017', '177092'];
  const progressReports = [];
  solveLongestChain(fragments, {
    onProgress: (p) => progressReports.push(p),
  });

  assert.ok(progressReports.length > 0);
  assert.equal(progressReports[progressReports.length - 1].count, 3);
  assert.equal(progressReports[progressReports.length - 1].result, '24846080177092');
});
