import test from "node:test";
import assert from "node:assert/strict";
import { calculate, calculateRange } from "../src/calculator.js";

test("calculates Canada Llama 3 70B 5% fallback monthly cost", () => {
  const result = calculate({ volumeMode:"users", users:1000, chatsPerDay:10, days:30, fallbackRate:5, inputTokens:1500, outputTokens:250, inputPrice:3.05, outputPrice:4.03 });
  assert.equal(result.totalChats, 300000);
  assert.equal(result.cloudChats, 15000);
  assert.ok(Math.abs(result.costPerChat - 0.0055825) < 1e-12);
  assert.ok(Math.abs(result.monthlyCost - 83.7375) < 1e-9);
});

test("uses direct monthly chat input", () => {
  const result = calculate({ volumeMode:"chats", monthlyChats:5000, fallbackRate:10, inputTokens:1000, outputTokens:500, inputPrice:1, outputPrice:2 });
  assert.equal(result.cloudChats, 500);
  assert.equal(result.monthlyCost, 1);
});

test("calculates a lower and upper token range", () => {
  const result = calculateRange({ volumeMode:"chats", monthlyChats:1000, fallbackRate:10, lowerInputTokens:1000, lowerOutputTokens:100, upperInputTokens:2000, upperOutputTokens:200, inputPrice:1, outputPrice:2 });
  assert.equal(result.lower.cloudChats, 100);
  assert.equal(result.lower.totalTokens, 1100);
  assert.equal(result.upper.totalTokens, 2200);
  assert.ok(Math.abs(result.lower.monthlyCost - 0.12) < 1e-12);
  assert.ok(Math.abs(result.upper.monthlyCost - 0.24) < 1e-12);
});
