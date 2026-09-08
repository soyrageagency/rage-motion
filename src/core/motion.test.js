/**
 * Unit tests for the pure helpers.
 *
 * Everything else in this library needs a document, and is covered by
 * `npm run check`, which runs the demo in a real browser. What is testable
 * without one is the arithmetic — and the arithmetic is where an off-by-one
 * turns into an effect that is subtly wrong on every page that uses it.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { clamp, EASE, lerp, mapRange } from "./motion.js";

test("clamp holds a value inside its range", () => {
  assert.equal(clamp(0.5), 0.5);
  assert.equal(clamp(-3), 0);
  assert.equal(clamp(9), 1);
  assert.equal(clamp(15, 0, 10), 10);
  assert.equal(clamp(-15, -10, 10), -10);
});

test("lerp reaches both ends exactly", () => {
  // Exactness at the ends matters: a component that never quite arrives leaves
  // a transform on the element forever, and with it a composited layer.
  assert.equal(lerp(0, 100, 0), 0);
  assert.equal(lerp(0, 100, 1), 100);
  assert.equal(lerp(20, 40, 0.5), 30);
  assert.equal(lerp(-10, 10, 0.5), 0);
});

test("mapRange moves a value between two ranges", () => {
  assert.equal(mapRange(5, 0, 10, 0, 100), 50);
  assert.equal(mapRange(0, 0, 10, 20, 40), 20);
  assert.equal(mapRange(10, 0, 10, 20, 40), 40);
  // Inverted output ranges are how "further down the page means less opacity"
  // is expressed, so they have to work.
  assert.equal(mapRange(5, 0, 10, 100, 0), 50);
});

test("mapRange survives a zero-width input range", () => {
  // A collapsed element gives a zero-height box, and this is the arithmetic
  // that would otherwise return NaN and write "NaNpx" into a transform.
  const result = mapRange(5, 4, 4, 0, 1);
  assert.ok(Number.isFinite(result), `expected a finite number, got ${result}`);
});

test("the easing curves are usable CSS", () => {
  for (const [name, value] of Object.entries(EASE)) {
    // `linear(…)` is the spring: a sampled curve, which CSS accepts and
    // `cubic-bezier` cannot express because it overshoots past 1.
    assert.match(
      value,
      /^(cubic-bezier\(|linear\(|linear$|ease)/,
      `${name} is not a CSS easing: ${value}`,
    );
  }
});
