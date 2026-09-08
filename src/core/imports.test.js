/**
 * Every helper a module uses must be a helper that module imports.
 *
 * This exists because of a real bug: `outline()` called `mapRange` without
 * importing it. Nothing caught it — `node --check` only parses, the module
 * loads fine, and the reference is inside a per-frame callback, so the page
 * mounted, looked alive, and threw a ReferenceError sixty times a second with
 * one component silently dead.
 *
 * A linter would find this. There is no linter, on purpose — the kit has no
 * dependencies and that includes its own toolchain — so the check lives here,
 * in about thirty lines, and runs with everything else.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const components = resolve(dirname(fileURLToPath(import.meta.url)), "../components");

/** Everything a component can import from the core. */
const HELPERS = [
  "clamp", "lerp", "mapRange", "dataNumber", "dataString", "onFrame", "watch",
  "whileVisible", "loopWhileVisible", "prefersReducedMotion", "resolveElements",
  "animate", "EASE", "supportsScrollTimeline", "supportsViewTransitions",
  "onMotionPreferenceChange", "split", "unsplit", "resplitOnResize",
];

const files = readdirSync(components).filter((name) => name.endsWith(".js") && !name.endsWith(".test.js"));

test("there are component modules to check", () => {
  assert.ok(files.length > 10, `only found ${files.length} modules`);
});

test("every core helper a module calls is one it imports", () => {
  const missing = [];

  for (const file of files) {
    const source = readFileSync(join(components, file), "utf8");
    // The import block is everything before the first declaration.
    const head = source.slice(0, Math.max(source.indexOf("export function"), 0) || source.length);

    for (const name of HELPERS) {
      // A call, but not a property access — `this.clamp(` is not our clamp.
      const used = new RegExp(`[^\\w.]${name}\\s*\\(`).test(source) ||
        (name === "EASE" && /[^\w.]EASE\./.test(source));
      if (!used) continue;
      const imported = new RegExp(`[{,\\s]${name}[,\\s}]`).test(head);
      if (!imported) missing.push(`${file}: uses ${name} but never imports it`);
    }
  }

  assert.deepEqual(missing, [], missing.join("\n"));
});

test("no module imports a helper it never uses", () => {
  const unused = [];

  for (const file of files) {
    const source = readFileSync(join(components, file), "utf8");
    const block = source.match(/import \{([\s\S]*?)\} from "\.\.\/core\/motion\.js";/);
    if (!block) continue;

    for (const name of block[1].split(",").map((one) => one.trim()).filter(Boolean)) {
      const used = new RegExp(`[^\\w.]${name}\\s*\\(`).test(source) ||
        (name === "EASE" && /[^\w.]EASE\./.test(source));
      if (!used) unused.push(`${file}: imports ${name} but never uses it`);
    }
  }

  assert.deepEqual(unused, [], unused.join("\n"));
});
