import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseAndValidateInput } from "../src/models/validator.js";
import { solveLongestChain, validateSequence } from "../src/models/solver.js";

test("142-item sample benchmark: finds a valid long sequence", () => {
  const content = readFileSync(
    new URL("../public/sample.txt", import.meta.url),
    "utf-8",
  );
  const parsed = parseAndValidateInput(content);
  assert.equal(parsed.success, true);
  assert.equal(parsed.fragments.length, 142);

  // Run solver with an iteration budget for fast unit testing execution
  const res = solveLongestChain(parsed.fragments, { maxIterations: 50000 });

  assert.ok(res.count > 10, `Expected chain length > 10, got ${res.count}`);
  assert.equal(validateSequence(res.chain, parsed.fragments), true);

  // Verify all chosen fragments are unique
  const uniqueIndices = new Set(res.chain);
  assert.equal(uniqueIndices.size, res.chain.length);

  // Verify math: length in characters must equal 6 + (count - 1) * 4
  const expectedLength = 6 + (res.count - 1) * 4;
  assert.equal(res.result.length, expectedLength);
});
