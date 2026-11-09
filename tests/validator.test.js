import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAndValidateInput } from '../src/models/validator.js';

test('parseAndValidateInput: parses valid multiline digits', () => {
  const input = `608017\n248460\n962282`;
  const res = parseAndValidateInput(input);
  assert.equal(res.success, true);
  assert.deepEqual(res.fragments, ['608017', '248460', '962282']);
});

test('parseAndValidateInput: handles Windows CRLF and ignores empty lines', () => {
  const input = `\r\n  123456  \r\n\r\n654321\r\n  \r\n`;
  const res = parseAndValidateInput(input);
  assert.equal(res.success, true);
  assert.deepEqual(res.fragments, ['123456', '654321']);
});

test('parseAndValidateInput: rejects non-numeric input', () => {
  const input = `123456\n12ab56\n789012`;
  const res = parseAndValidateInput(input);
  assert.equal(res.success, false);
  assert.match(res.error, /Invalid character on line 2/);
  assert.equal(res.line, 2);
});

test('parseAndValidateInput: rejects fragments with length < 2', () => {
  const input = `123456\n7\n789012`;
  const res = parseAndValidateInput(input);
  assert.equal(res.success, false);
  assert.match(res.error, /too short/);
  assert.equal(res.line, 2);
});

test('parseAndValidateInput: rejects inputs with fewer than 2 fragments', () => {
  const input = `123456\n`;
  const res = parseAndValidateInput(input);
  assert.equal(res.success, false);
  assert.match(res.error, /at least 2 numeric fragments/);
});

test('parseAndValidateInput: rejects empty input', () => {
  const input = `   \n\n  \t  \n`;
  const res = parseAndValidateInput(input);
  assert.equal(res.success, false);
  assert.match(res.error, /empty/);
});

test('parseAndValidateInput: rejects non-string input', () => {
  // @ts-expect-error testing invalid type
  const res = parseAndValidateInput(null);
  assert.equal(res.success, false);
});

