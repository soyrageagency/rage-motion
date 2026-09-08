/**
 * Text reveals.
 *
 * Headlines that assemble themselves as they arrive — the single most
 * recognisable effect in award-site work, and the one with the most ways to
 * quietly damage a page.
 *
 * The splitting layer (`core/split.js`) keeps the text readable to screen
 * readers, copy-pasteable, and unbreakable mid-word. This layer adds the two
 * remaining rules:
 *
 *   • A headline must never be invisible for long. The whole stagger is
 *     budgeted, so a forty-character heading does not take four seconds to
 *     finish just because each character was given a hundred milliseconds.
 *   • Under reduced motion the text is simply there. No fade, no travel, no
 *     delay — a person who asked for less movement should not wait for a
 *     heading to spell itself out.
 *
 * Usage, from markup alone:
 *   <h1 data-rm-text="chars">Award-grade motion</h1>
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import { animate, dataNumber, dataString, EASE, prefersReducedMotion, resolveElements, watch } from "../core/motion.js";
import { resplitOnResize, split } from "../core/split.js";

/** The motion each piece performs. */
const EFFECTS = {
  // A mask reveal: the piece slides up from behind its own line box.
  rise: {
    from: { transform: "translate3d(0, 110%, 0)" },
    to: { transform: "translate3d(0, 0, 0)" },
    clip: true,
  },
  fade: {
    from: { opacity: 0, transform: "translate3d(0, 0.35em, 0)" },
    to: { opacity: 1, transform: "translate3d(0, 0, 0)" },
  },
  scale: {
    from: { opacity: 0, transform: "scale(0.7)" },
    to: { opacity: 1, transform: "scale(1)" },
  },
  blur: {
    from: { opacity: 0, filter: "blur(12px)" },
    to: { opacity: 1, filter: "blur(0px)" },
  },
  flip: {
    from: { opacity: 0, transform: "rotateX(-85deg)" },
    to: { opacity: 1, transform: "rotateX(0deg)" },
  },
};

/**
 * The whole reveal should finish inside this, however many pieces there are.
 *
 * Past roughly a second, a headline that has not finished arriving stops
 * reading as craft and starts reading as a slow page.
 */
const MAX_TOTAL_STAGGER = 900;

/**
 * Animate text as it scrolls into view.
 *
 * @param {string|Element|NodeList|Element[]} target
 * @param {object} options
 * @returns {() => void} stop
 */
export function textReveal(target = "[data-rm-text]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const {
    by = "chars",
    effect = "rise",
    duration = 800,
    stagger = 26,
    delay = 0,
    threshold = 0.2,
    easing = EASE.out,
    once = true,
  } = options;

  const cleanups = [];

  for (const element of elements) {
    const splitBy = dataString(element, "rmText", by);
    const effectName = dataString(element, "rmEffect", effect);
    const motion = EFFECTS[effectName] ?? EFFECTS.rise;

    let pieces = split(element, splitBy);

    // A mask reveal needs something to be masked by, and the mask has to sit
    // on the wrapper rather than the moving piece.
    if (motion.clip) element.classList.add("rm-text-clip");

    const hide = (list) => {
      if (prefersReducedMotion()) return;
      for (const piece of list) {
        for (const [property, value] of Object.entries(motion.from)) piece.style[property] = value;
      }
    };
    hide(pieces);

    const play = (list) => {
      const step = Math.min(stagger, MAX_TOTAL_STAGGER / Math.max(1, list.length));
      list.forEach((piece, index) => {
        const animation = animate(piece, [motion.from, motion.to], {
          duration: dataNumber(element, "rmDuration", duration),
          delay: dataNumber(element, "rmDelay", delay) + index * step,
          easing,
        });
        const settle = () => {
          for (const property of Object.keys(motion.from)) piece.style[property] = "";
          piece.style.willChange = "";
        };
        if (animation) animation.finished.then(settle).catch(settle);
        else settle();
      });
      element.classList.add("rm-revealed");
    };

    cleanups.push(
      watch(element, () => play(pieces), { threshold, once }),
      // Line splitting depends on layout, so a width change invalidates it.
      resplitOnResize(element, splitBy, (next) => {
        pieces = next;
        if (element.classList.contains("rm-revealed")) return;
        hide(pieces);
      }),
    );
  }

  return () => cleanups.forEach((stop) => stop());
}
