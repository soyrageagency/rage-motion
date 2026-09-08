/**
 * Guards against the catalogue drifting away from the library.
 *
 * The catalogue is written by hand, which is the right trade — an assistant
 * needs the markup and the reasoning, and no parser produces those. The cost
 * is that a new component can ship without ever reaching the assistants that
 * would use it, and nobody would notice. This is the check that notices.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { CATALOGUE, findComponent } from "./catalogue.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// The library imports browser APIs inside its functions but never at module
// scope, so reading the barrel as text is enough — and avoids needing a DOM.
const barrel = readFileSync(resolve(root, "src/index.js"), "utf8");

/**
 * Component names the barrel re-exports from `components/`.
 *
 * The pattern has to span lines: a long export list gets wrapped, and a
 * single-line regex silently reports those files as exporting nothing — which
 * would let this guard pass by seeing less rather than by finding less.
 */
const exported = [...barrel.matchAll(/export \{([^}]*)\} from "\.\/components\/[^"]+";/g)]
  .flatMap((match) => match[1].split(",").map((name) => name.trim()))
  .filter(Boolean);

test("the barrel exports something to check", () => {
  assert.ok(exported.length > 20, `only found ${exported.length} exported components`);
});

test("every exported component is in the catalogue", () => {
  // Not components: `transitionTo` is a helper documented with
  // `pageTransition`, and the two SHOUTING exports are the lists of named
  // variants that `reveal` and `buttonKit` document in their own entries.
  const helpers = new Set(["transitionTo", "REVEAL_EFFECTS", "BUTTON_STYLES", "CARD_LOOKS", "SPINNER_KINDS", "INPUT_LOOKS"]);
  const missing = exported.filter((name) => !helpers.has(name) && !findComponent(name));
  assert.deepEqual(missing, [], `not served over MCP: ${missing.join(", ")}`);
});

test("every catalogued component is really exported", () => {
  const unknown = CATALOGUE.map((c) => c.name).filter((name) => !exported.includes(name));
  assert.deepEqual(unknown, [], `catalogued but not exported: ${unknown.join(", ")}`);
});

test("every catalogue entry is complete", () => {
  for (const component of CATALOGUE) {
    assert.ok(component.summary?.length > 20, `${component.name}: summary too thin`);
    assert.ok(component.example?.length > 10, `${component.name}: no example`);
    assert.ok(component.usage?.includes("import"), `${component.name}: usage does not import anything`);
    assert.ok(Array.isArray(component.options), `${component.name}: options must be an array`);
    assert.ok(component.file.startsWith("src/components/"), `${component.name}: odd file path`);
  }
});

test("a markup attribute, where claimed, appears in the example", () => {
  for (const component of CATALOGUE) {
    if (!component.attribute) continue;
    assert.ok(
      component.example.includes(component.attribute),
      `${component.name}: claims ${component.attribute} but the example does not use it`,
    );
  }
});

test("the attribute a component claims is one its source actually reads", () => {
  for (const component of CATALOGUE) {
    if (!component.attribute) continue;
    const source = readFileSync(resolve(root, component.file), "utf8");
    assert.ok(
      source.includes(component.attribute),
      `${component.name}: ${component.attribute} never appears in ${component.file}`,
    );
  }
});

test("the stylesheet has a rule for every class the components add", () => {
  const css = readFileSync(resolve(root, "src/styles/rage-motion.css"), "utf8");
  // Classes the components add at runtime; each needs styling to do anything.
  for (const className of ["rm-type", "rm-lines", "rm-compare", "rm-panel", "rm-orbit", "rm-ripple"]) {
    assert.ok(css.includes(`.${className}`), `${className} has no rule in the stylesheet`);
  }
});

test("the README names every component that exists", () => {
  // The README is the only page most people read, so a component missing from
  // it has effectively not shipped. Backticks, so `bars` does not match the
  // word "bars" in a sentence.
  const readme = readFileSync(resolve(root, "README.md"), "utf8");
  const missing = CATALOGUE.map((c) => c.name).filter((name) => !readme.includes(`\`${name}\``));
  assert.deepEqual(missing, [], `not in the README: ${missing.join(", ")}`);
});

test("the counts the README claims are the counts that exist", () => {
  const readme = readFileSync(resolve(root, "README.md"), "utf8");
  assert.ok(
    readme.includes(`${CATALOGUE.length} animation components`),
    `the README headline does not say ${CATALOGUE.length}`,
  );
  assert.ok(
    readme.includes(`## The ${CATALOGUE.length} components`),
    `the component section does not say ${CATALOGUE.length}`,
  );
});

test("every image in an example has a source and a description", () => {
  /*
   * The generic HTML scanner cannot read this file — it is a JavaScript module
   * of documentation strings, and it flags the prose as markup: a note
   * explaining that a component deliberately does *not* animate height reads,
   * to a regex, exactly like one that does. So that scanner is switched off for
   * this file and the check it was doing lives here instead, where it can tell
   * an example from a sentence about one.
   *
   * It matters because an example is what an assistant copies into somebody's
   * page. A bare <img> there ships as a broken-image box, and alt="" tells a
   * screen reader that a gallery photograph is decoration.
   */
  const bad = [];
  for (const component of CATALOGUE) {
    for (const [tag] of component.example.matchAll(/<img\b[^>]*>/g)) {
      if (!/\bsrc="[^"]+"/.test(tag)) bad.push(`${component.name}: no src — ${tag}`);
      else if (!/\balt="[^"]+"/.test(tag)) bad.push(`${component.name}: no alt text — ${tag}`);
    }
  }
  assert.deepEqual(bad, [], `images in examples:\n  ${bad.join("\n  ")}`);
});

test("an example is markup, and the JavaScript lives in usage", () => {
  // A <script> inside an example refers to variables the snippet never
  // declares, so copying it pastes code that throws on its first line.
  const scripted = CATALOGUE.filter((c) => /<script[\s>]/.test(c.example)).map((c) => c.name);
  assert.deepEqual(scripted, [], `examples containing a script: ${scripted.join(", ")}`);
});
