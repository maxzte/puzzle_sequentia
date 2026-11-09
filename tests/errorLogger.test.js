import test from 'node:test';
import assert from 'node:assert/strict';
import { ErrorLogger } from '../src/services/errorLogger.js';

test('ErrorLogger: records errors with environment and timestamp', () => {
  const logger = new ErrorLogger();
  const entry = logger.recordError(new Error('Sample test error'), { fragmentsCount: 42 });

  assert.ok(entry.id.startsWith('err_'));
  assert.equal(entry.message, 'Sample test error');
  assert.equal(entry.context.fragmentsCount, 42);
  assert.ok(entry.timestamp);
  assert.ok(logger.getLogs().length > 0);
});

test('ErrorLogger: handles string errors gracefully', () => {
  const logger = new ErrorLogger();
  const entry = logger.recordError('String based error message');

  assert.equal(entry.message, 'String based error message');
  assert.equal(entry.stack, '');
});

test('ErrorLogger: formats error into Markdown GitHub issue report', () => {
  const logger = new ErrorLogger();
  const entry = logger.recordError(new Error('Worker computation timed out'), {
    action: 'solve',
    fragmentsCount: 142,
  });

  const markdown = logger.formatErrorReportMarkdown(entry);
  assert.match(markdown, /### Bug Report \/ Diagnostic Log/);
  assert.match(markdown, /Worker computation timed out/);
  assert.match(markdown, /"fragmentsCount": 142/);
});

test('ErrorLogger: ring buffer caps at maximum logs limit', () => {
  const logger = new ErrorLogger();
  for (let i = 0; i < 30; i++) {
    logger.recordError(`Error number ${i}`);
  }

  assert.equal(logger.getLogs().length, 20);
  assert.equal(logger.getLogs()[0].message, 'Error number 29');
});

