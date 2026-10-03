import assert from "node:assert/strict";
import test from "node:test";
import { calculateRice, formatRiceScore, rankByRice } from "../src/rice.ts";

test("calculates the specified example and converts confidence percent to decimal", () => {
  const result = calculateRice({ reach: 1000, impact: 2, confidence: 80, effort: 2 });
  assert.equal(result.valid, true);
  if (!result.valid) return;
  assert.equal(result.breakdown.confidenceDecimal, 0.8);
  assert.equal(result.breakdown.score, 800);
});

test("keeps full precision until display formatting", () => {
  const result = calculateRice({ reach: 1, impact: 1, confidence: 33.333, effort: 3 });
  assert.equal(result.valid, true);
  if (!result.valid) return;
  assert.notEqual(result.breakdown.score, Number(result.breakdown.score.toFixed(2)));
  assert.equal(formatRiceScore(12.345, "en-US"), "12.35");
});

test("rejects invalid inputs safely", () => {
  const invalidInputs = [
    { reach: 1, impact: 1, confidence: 80, effort: 0 },
    { reach: -1, impact: 1, confidence: 80, effort: 1 },
    { reach: 1, impact: 1, confidence: 101, effort: 1 },
    { reach: Number.NaN, impact: 1, confidence: 80, effort: 1 },
    { reach: Number.MAX_VALUE, impact: Number.MAX_VALUE, confidence: 100, effort: 0.1 },
  ];
  for (const inputs of invalidInputs) {
    const result = calculateRice(inputs);
    assert.equal(result.valid, false);
    if (!result.valid) assert.ok(result.reason.length > 0);
  }
});

test("ranks by unrounded score from highest to lowest", () => {
  const ranked = rankByRice([
    { id: "low", reach: 10, impact: 1, confidence: 100, effort: 2 },
    { id: "high", reach: 1000, impact: 2, confidence: 80, effort: 2 },
    { id: "middle", reach: 100, impact: 1, confidence: 80, effort: 2 },
  ]);
  assert.deepEqual(ranked.map((row) => row.item.id), ["high", "middle", "low"]);
  assert.deepEqual(ranked.map((row) => row.rank), [1, 2, 3]);
});

test("breaks score ties by lower effort, then higher confidence, then insertion order", () => {
  const ranked = rankByRice([
    { id: "higher-effort", reach: 180, impact: 1, confidence: 100, effort: 2 },
    { id: "lower-confidence", reach: 100, impact: 1, confidence: 90, effort: 1 },
    { id: "first-original", reach: 90, impact: 1, confidence: 100, effort: 1 },
    { id: "second-original", reach: 90, impact: 1, confidence: 100, effort: 1 },
  ]);
  assert.deepEqual(ranked.map((row) => row.item.id), ["first-original", "second-original", "lower-confidence", "higher-effort"]);
});

test("keeps invalid features last and does not assign them a rank", () => {
  const ranked = rankByRice([
    { id: "invalid", reach: 1, impact: 1, confidence: 80, effort: 0 },
    { id: "valid", reach: 1, impact: 1, confidence: 80, effort: 1 },
  ]);
  assert.deepEqual(ranked.map((row) => row.item.id), ["valid", "invalid"]);
  assert.deepEqual(ranked.map((row) => row.rank), [1, null]);
});
