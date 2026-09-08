/**
 * Scroll reveals.
 *
 * Elements arrive as they enter the viewport. The most-used effect in the
 * genre and the one most often done badly, in two specific ways this avoids:
 *
 *   • Content that never appears. If the observer never fires — a browser
 *     without support, an element already on screen at load, JavaScript that
 *     failed — the element must still be visible. Nothing here hides content
 *     from CSS alone; the hidden state is applied by script, so if the script
 *     does not run the page is simply un-animated rather than blank.
 *   • Layout shift. Movement is done with `transform`, never with `top` or
 *     `margin`, so a reveal cannot push its neighbours around mid-scroll.
 *
 * Usage, from markup alone:
 *   <div data-rm-reveal="up" data-rm-delay="100">…</div>
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import { animate, dataNumber, dataString, EASE, prefersReducedMotion, resolveElements, watch } from "../core/motion.js";

/** Where an element travels from. */
const FROM = {
  up: { transform: "translate3d(0, 28px, 0)" },
  down: { transform: "translate3d(0, -28px, 0)" },
  left: { transform: "translate3d(-32px, 0, 0)" },
  right: { transform: "translate3d(32px, 0, 0)" },
  scale: { transform: "scale(0.94)" },
  blur: { filter: "blur(10px)", transform: "translate3d(0, 14px, 0)" },
  none: {},
};

/**
 * Reveal elements as they scroll into view.
 *
 * @param {string|Element|NodeList|Element[]} target
 * @param {object} options
 * @returns {() => void} stop
 */
export function reveal(target = "[data-rm-reveal]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const {
    from = "up",
    duration = 750,
    delay = 0,
    stagger = 0,
    threshold = 0.15,
    margin = "0px 0px -12% 0px",
    once = true,
    easing = EASE.out,
  } = options;

  // Hide from JavaScript, not from CSS: content stays visible when the script
  // does not run at all.
  const prepare = (el, direction) => {
    if (prefersReducedMotion()) return;
    const start = FROM[direction] ?? FROM.up;
    el.style.opacity = "0";
    if (start.transform) el.style.transform = start.transform;
    if (start.filter) el.style.filter = start.filter;
    el.style.willChange = "transform, opacity";
  };

  elements.forEach((el) => prepare(el, dataString(el, "rmReveal", from)));

  let index = 0;
  const stop = watch(
    elements,
    (el) => {
      const direction = dataString(el, "rmReveal", from);
      const start = FROM[direction] ?? FROM.up;
      const own = dataNumber(el, "rmDelay", null);
      const wait = own ?? delay + index * stagger;
      index++;

      const animation = animate(
        el,
        [
          { opacity: 0, ...start },
          { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)", filter: "blur(0px)" },
        ],
        { duration: dataNumber(el, "rmDuration", duration), delay: wait, easing },
      );

      const settle = () => {
        // Leaving will-change set forever costs memory on long pages.
        el.style.willChange = "";
        el.style.opacity = "";
        el.style.transform = "";
        el.style.filter = "";
        el.classList.add("rm-revealed");
      };
      if (animation) animation.finished.then(settle).catch(settle);
      else settle();
    },
    { threshold, margin, once },
  );

  return () => {
    stop();
    elements.forEach((el) => {
      el.style.opacity = "";
      el.style.transform = "";
      el.style.filter = "";
      el.style.willChange = "";
    });
  };
}
