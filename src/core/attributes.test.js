/**
 * Guards against two components claiming the same `data-rm-` attribute.
 *
 * This has now happened four times, and every time it was invisible in review
 * and obvious on the page: `skeleton` read `data-rm-lines`, which `magnetLines`
 * mounts on, so every skeleton also became a magnetic line field. `stars`
 * mounted on `data-rm-stars`, which `starfield` already owned. `topography`
 * reached for `data-rm-lines` again. And `panels` reads `data-rm-grow` as an
 * option while `autoGrow` mounts on it, so the panels demo was quietly also a
 * growing textarea.
 *
 * Nothing else catches it. Every unit test passes, each module is correct on
 * its own, and the page merely looks wrong.
 *
 * The rule this holds is the narrow one that matters. Sharing an *option* name
 * across modules is fine and deliberate — `duration`, `size`, `color` and
 * `gap` mean the same thing everywhere and are only ever read from an element
 * a component already mounted on. What is never fine is one module's mounting
 * attribute — the one that decides what a component attaches to — being read
 * or mounted on by another. That is two components fighting over the same
 * element, which is what all four bugs were.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const componentDir = resolve(here, "../components");

/** camelCase dataset key → the attribute an author actually writes. */
const attributeFor = (key) => `data-${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`).toLowerCase()}`;

/** What a module mounts on, and what it reads as an option. */
function attributesIn(source) {
  const mounts = new Set();
  const reads = new Set();
  // Only the default target — what a component mounts on across the whole
  // page. A selector passed as an option (`selector = "[data-rm-value]"`) is
  // searched inside a component that already mounted, so it cannot collide.
  for (const [, name] of source.matchAll(/target = "\[(data-rm-[a-z-]+)\]"/g)) mounts.add(name);
  for (const [, key] of source.matchAll(/data(?:Number|String)\(\s*[\w.]+,\s*"(rm[A-Za-z]+)"/g)) {
    reads.add(attributeFor(key));
  }
  return { mounts, reads };
}

const modules = readdirSync(componentDir)
  .filter((name) => name.endsWith(".js") && !name.endsWith(".test.js"))
  .map((name) => ({ name, ...attributesIn(readFileSync(resolve(componentDir, name), "utf8")) }));

test("there are component modules to check", () => {
  assert.ok(modules.length > 20, `only found ${modules.length} modules`);
});

test("no two modules mount on the same attribute", () => {
  const owners = new Map();
  for (const { name, mounts } of modules) {
    for (const attribute of mounts) {
      if (!owners.has(attribute)) owners.set(attribute, []);
      owners.get(attribute).push(name);
    }
  }

  const clashes = [...owners]
    .filter(([, files]) => files.length > 1)
    .map(([attribute, files]) => `${attribute} — ${files.join(" and ")}`);

  assert.deepEqual(clashes, [], `mounted twice:\n  ${clashes.join("\n  ")}`);
});

test("nobody reads an attribute another module mounts on", () => {
  const mounted = new Map();
  for (const { name, mounts } of modules) {
    for (const attribute of mounts) mounted.set(attribute, name);
  }

  const clashes = [];
  for (const { name, reads } of modules) {
    for (const attribute of reads) {
      const owner = mounted.get(attribute);
      // Reading your own mounting attribute is how a value-carrying selector
      // works — `data-rm-spinner="arc"` is the shape as well as the mount.
      if (owner && owner !== name) clashes.push(`${attribute} — ${name} reads what ${owner} mounts on`);
    }
  }

  assert.deepEqual(clashes, [], `attributes fought over:\n  ${clashes.join("\n  ")}`);
});
