/**
 * Fifty-two button styles.
 *
 *   <button data-rm-btn="brutal">Ship it</button>
 *   <a class="cta" data-rm-btn="fill-up" href="/start">Start</a>
 *
 * One component with a named look, not fifty-two components. They share the
 * same guarantees, which is the reason to build it this way: none of them
 * replaces the element, adds a click handler or swallows an event, so focus
 * rings, keyboard activation, form submission and middle-clicking a link all
 * behave exactly as they did. Adding a look is a line in a table and a rule in
 * the stylesheet, not another file to keep correct.
 *
 * Nearly all of them are pure CSS on `:hover` and `:focus-visible` — both, so
 * the effect is not a mouse-only reward. The handful that need a second copy
 * of the label to slide, or a sheet to fill from an edge, say so in the table
 * below and get exactly the extra element they need and nothing more.
 *
 * Every look moves `transform`, `opacity`, `filter`, `clip-path` or a
 * background. None of them animates a width, a padding or a font size, so no
 * button in this file can push the layout around while you point at it.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import { dataString, prefersReducedMotion, resolveElements } from "../core/motion.js";

/**
 * What each look needs beyond a class.
 *
 *   sheet — a filling panel behind the label
 *   twin  — a second copy of the label, `aria-hidden`, to slide in
 *   rail  — a thin bar under the label
 */
const NEEDS = {
  "fill-up": "sheet",
  "fill-down": "sheet",
  "fill-left": "sheet",
  "fill-right": "sheet",
  "fill-center": "sheet",
  "fill-diagonal": "sheet",
  "fill-split": "sheet",
  curtain: "sheet",
  sweep: "sheet",
  shine: "sheet",
  glass: "sheet",
  gradient: "sheet",
  scan: "sheet",
  "slide-up": "twin",
  "slide-down": "twin",
  "slide-left": "twin",
  arrow: "twin",
  slice: "twin",
  "loading-bar": "rail",
  "rail-grow": "rail",
  progress: "rail",
};

/** Every look, in the order the documentation lists them. */
export const BUTTON_STYLES = [
  // Surface
  "solid", "outline", "ghost", "soft", "glass", "inset", "depth", "brutal", "brutal-move",
  // Filling
  "fill-up", "fill-down", "fill-left", "fill-right", "fill-center", "fill-diagonal",
  "fill-split", "curtain",
  // Light
  "glow", "neon", "neon-flicker", "sweep", "shine", "gradient", "scan", "pulse",
  // Edges
  "border-grow", "border-dash", "corner-cut", "double", "notch",
  // Motion
  "lift", "sink", "squish", "jelly", "wobble", "tilt3d", "nudge", "rotate-in",
  // Label
  "slide-up", "slide-down", "slide-left", "slice", "arrow", "track", "caps",
  "strike", "caret",
  // Progress
  "loading-bar", "rail-grow", "progress",
  // Texture
  "dots", "stripes",
];

const KNOWN = new Set(BUTTON_STYLES);

/**
 * Apply a named button look.
 *
 * @param {string|Element|NodeList|Element[]} target
 * @param {{ style?: string }} options
 * @returns {() => void} stop
 */
export function buttonKit(target = "[data-rm-btn]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { style = "solid" } = options;
  const cleanups = [];

  for (const element of elements) {
    const want = dataString(element, "rmBtn", style);
    const name = KNOWN.has(want) ? want : style;

    element.classList.add("rm-btn", `is-${name}`);
    if (prefersReducedMotion()) element.classList.add("is-still");

    const added = [];
    const needs = NEEDS[name];

    if (needs === "sheet") {
      const sheet = document.createElement("span");
      sheet.className = "rm-btn-sheet";
      sheet.setAttribute("aria-hidden", "true");
      element.prepend(sheet);
      added.push(sheet);
    }

    if (needs === "twin") {
      // The label has to become an element before a copy of it can slide, and
      // the copy is aria-hidden so the button is still announced once.
      const label = element.textContent ?? "";
      const original = element.innerHTML;
      const face = document.createElement("span");
      face.className = "rm-btn-face";
      face.textContent = label;
      const twin = document.createElement("span");
      twin.className = "rm-btn-twin";
      twin.setAttribute("aria-hidden", "true");
      twin.textContent = dataString(element, "rmTwin", label);
      element.replaceChildren(face, twin);
      cleanups.push(() => { element.innerHTML = original; });
    }

    if (needs === "rail") {
      const rail = document.createElement("span");
      rail.className = "rm-btn-rail";
      rail.setAttribute("aria-hidden", "true");
      element.appendChild(rail);
      added.push(rail);
    }

    cleanups.push(() => {
      added.forEach((node) => node.remove());
      element.classList.remove("rm-btn", `is-${name}`, "is-still");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}
