/**
 * Showpiece text effects.
 *
 *   • decrypt()  — text resolves out of scrambled characters.
 *   • glitch()   — RGB-split displacement, on hover or on a loop.
 *   • shiny()    — a highlight sweeps across the letterforms.
 *   • countUp()  — numbers roll to their value when they scroll into view.
 *
 * All four replace or obscure real text, which is the trap: a heading that is
 * gibberish for a second is gibberish to a screen reader for as long as it is
 * being read. Every effect here keeps the true text as the accessible name and
 * marks the animated glyphs `aria-hidden`, so assistive technology gets the
 * finished sentence immediately and the decoration stays decoration.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import {
  dataNumber, dataString, loopWhileVisible, onFrame,
  prefersReducedMotion, resolveElements,
} from "../core/motion.js";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+=/\\<>[]{}";

/**
 * Resolve text out of noise, character by character.
 *
 * Each character settles at its own moment, left to right, so the line reads
 * as decoding rather than as a single flip.
 */
export function decrypt(target = "[data-rm-decrypt]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { speed = 34, revealPerFrame = 0.6, glyphs = GLYPHS, once = true, threshold = 0.4 } = options;
  const cleanups = [];

  for (const element of elements) {
    const text = element.textContent ?? "";
    element.setAttribute("aria-label", text.trim());

    const run = () => {
      if (prefersReducedMotion()) {
        element.textContent = text;
        return;
      }
      const output = document.createElement("span");
      output.setAttribute("aria-hidden", "true");
      element.replaceChildren(output);

      let settled = 0;
      let lastTick = 0;
      const rate = dataNumber(element, "rmSpeed", speed);
      const perFrame = dataNumber(element, "rmRate", revealPerFrame);

      const stopFrame = onFrame((now) => {
        if (now - lastTick < rate) return;
        lastTick = now;
        settled += perFrame;

        let out = "";
        for (let i = 0; i < text.length; i++) {
          // Whitespace never scrambles: a line whose spaces move is unreadable
          // and reflows on every frame.
          if (/\s/.test(text[i]) || i < settled) out += text[i];
          else out += glyphs[(Math.random() * glyphs.length) | 0];
        }
        output.textContent = out;

        if (settled >= text.length) {
          stopFrame();
          element.textContent = text;
          element.classList.add("rm-revealed");
        }
      });
      cleanups.push(stopFrame);
    };

    cleanups.push(loopWhileVisible(element, run, dataNumber(element, "rmLoop", 0)));
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * RGB-split glitch.
 *
 * Built from two `::before`/`::after` copies of the text driven by CSS, so the
 * effect costs nothing per frame — the only JavaScript is setting the text as
 * a custom property and deciding when it runs.
 */
/** The trigger modes glitch actually implements. */
const MODES = new Set(["hover", "loop", "always"]);

export function glitch(target = "[data-rm-glitch]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { trigger = "hover", interval = 3800 } = options;
  const timers = [];

  for (const element of elements) {
    const text = element.textContent ?? "";
    element.dataset.rmGlitchText = text;
    element.classList.add("rm-glitch");
    element.setAttribute("aria-label", text.trim());

    if (prefersReducedMotion()) continue;

    // An unrecognised mode falls back to the default rather than being
    // silently ignored. The demo asked for "auto" for months and simply got
    // nothing, which is the worst way for a component to disagree with you.
    const want = dataString(element, "rmGlitch", trigger);
    const mode = MODES.has(want) ? want : trigger;
    if (mode === "always") {
      element.classList.add("is-glitching");
    } else if (mode === "hover") {
      /*
       * The default mode, and until now the only one that did nothing: the
       * component handled "always" and "loop" and silently ignored the value
       * it falls back to, so a plain <span data-rm-glitch> never glitched.
       *
       * Focus as well as hover, so the effect is not something only a mouse
       * user is shown.
       */
      const on = () => element.classList.add("is-glitching");
      const off = () => element.classList.remove("is-glitching");
      element.addEventListener("pointerenter", on);
      element.addEventListener("pointerleave", off);
      element.addEventListener("focusin", on);
      element.addEventListener("focusout", off);
      timers.push(() => {
        element.removeEventListener("pointerenter", on);
        element.removeEventListener("pointerleave", off);
        element.removeEventListener("focusin", on);
        element.removeEventListener("focusout", off);
      });
    } else if (mode === "loop") {
      // Short bursts on a loop: continuous glitching stops registering after
      // a few seconds and just makes the text hard to read.
      const every = dataNumber(element, "rmInterval", interval);
      const timer = setInterval(() => {
        element.classList.add("is-glitching");
        setTimeout(() => element.classList.remove("is-glitching"), 420);
      }, every);
      timers.push(() => clearInterval(timer));
    }
  }

  return () => {
    timers.forEach((stop) => stop());
    elements.forEach((el) => el.classList.remove("rm-glitch", "is-glitching"));
  };
}

/**
 * A highlight sweeping across the text.
 *
 * Pure CSS: a moving gradient clipped to the glyphs. Included as a function so
 * it can be applied to a selector like everything else, and so the colours can
 * be set once in JavaScript rather than repeated in a stylesheet.
 */
export function shiny(target = "[data-rm-shiny]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { base = "#6b7280", highlight = "#ffffff", duration = 3200, width = 30 } = options;

  for (const element of elements) {
    element.classList.add("rm-shiny");
    element.style.setProperty("--rm-shiny-base", dataString(element, "rmBase", base));
    element.style.setProperty("--rm-shiny-highlight", dataString(element, "rmSheen", highlight));
    element.style.setProperty("--rm-shiny-duration", `${dataNumber(element, "rmDuration", duration)}ms`);
    element.style.setProperty("--rm-shiny-width", `${width}%`);
  }

  return () => elements.forEach((el) => el.classList.remove("rm-shiny"));
}

/**
 * Count a number up when it scrolls into view.
 *
 * The element's existing text is parsed for its value and its formatting, so
 * "€1,250+" counts to 1250 and keeps both the symbol and the plus. Writing the
 * target in a data attribute and the prefix in markup is the usual API and it
 * always drifts out of sync with what is displayed.
 */
export function countUp(target = "[data-rm-count]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { duration = 1800, threshold = 0.5, once = true } = options;
  const cleanups = [];

  for (const element of elements) {
    const source = element.textContent ?? "";
    const match = source.match(/-?[\d.,]+/);
    if (!match) continue;

    const raw = match[0];
    // Decide the decimal separator from the string itself rather than assuming
    // a locale: "1.250" is one thousand two hundred and fifty in Spanish.
    const decimalSep = /,\d{1,2}$/.test(raw) ? "," : ".";
    const value = Number(
      decimalSep === ","
        ? raw.replace(/\./g, "").replace(",", ".")
        : raw.replace(/,/g, ""),
    );
    if (!Number.isFinite(value)) continue;

    const decimals = (raw.split(decimalSep)[1] ?? "").length;
    const grouped = /[.,]\d{3}\b/.test(raw);
    const prefix = source.slice(0, match.index);
    const suffix = source.slice(match.index + raw.length);
    const format = (n) => {
      const fixed = n.toFixed(decimals);
      if (!grouped) return prefix + fixed.replace(".", decimalSep) + suffix;
      const [whole, fraction] = fixed.split(".");
      const groupSep = decimalSep === "," ? "." : ",";
      const withGroups = whole.replace(/\B(?=(\d{3})+(?!\d))/g, groupSep);
      return prefix + (fraction ? `${withGroups}${decimalSep}${fraction}` : withGroups) + suffix;
    };

    element.setAttribute("aria-label", source.trim());
    // Reserve the final width so the surrounding layout cannot jump as digits
    // are added.
    element.style.display = "inline-block";
    element.style.minWidth = `${element.getBoundingClientRect().width}px`;

    const run = () => {
      if (prefersReducedMotion()) return;
      const span = dataNumber(element, "rmDuration", duration);
      const started = performance.now();
      const stopFrame = onFrame((now) => {
        const progress = Math.min(1, (now - started) / span);
        // Ease out: the number slows as it approaches its value, which reads
        // as arriving rather than stopping dead.
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = format(value * eased);
        if (progress === 1) {
          stopFrame();
          element.textContent = source;
          element.classList.add("rm-revealed");
        }
      });
      cleanups.push(stopFrame);
    };

    if (!prefersReducedMotion()) element.textContent = format(0);
    cleanups.push(loopWhileVisible(element, run, dataNumber(element, "rmLoop", 0)));
  }

  return () => cleanups.forEach((stop) => stop?.());
}
