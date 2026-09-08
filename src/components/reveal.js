/**
 * Scroll reveals — forty-four of them.
 *
 * Elements arrive as they enter the viewport. The most-used effect in the
 * genre and the one most often done badly, in two specific ways this avoids:
 *
 *   • Content that never appears. If the observer never fires — a browser
 *     without support, an element already on screen at load, JavaScript that
 *     failed — the element must still be visible. Nothing here hides content
 *     from CSS alone; the hidden state is applied by script, so if the script
 *     does not run the page is simply un-animated rather than blank.
 *   • Layout shift. Movement is `transform`, `opacity`, `filter` and
 *     `clip-path` — never `top`, `height` or `margin` — so a reveal cannot
 *     push its neighbours around mid-scroll.
 *
 * The forty-four are one component with a named start state, not forty-four
 * components. They share the trigger, the reduced-motion handling, the
 * stagger budget and the settle, so a new one is a line in a table rather
 * than another file to keep correct.
 *
 * Usage, from markup alone:
 *   <div data-rm-reveal="unfold" data-rm-delay="100">…</div>
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import { animate, dataNumber, dataString, EASE, prefersReducedMotion, resolveElements, watch } from "../core/motion.js";

/**
 * Where an element comes from.
 *
 * `from` is the start state and the only thing most entries need: the end
 * state is derived from it, because the end of a reveal is always "no
 * transform, no blur, nothing clipped". `origin` is applied once and never
 * animated, since a moving transform-origin is a different effect entirely
 * and never the one you wanted.
 *
 * Perspective is written into the transform rather than onto the parent, so
 * every 3D entry works on its own without the page having to prepare for it.
 */
const EFFECTS = {
  // Straight travel
  up: { transform: "translate3d(0, 28px, 0)" },
  down: { transform: "translate3d(0, -28px, 0)" },
  left: { transform: "translate3d(-32px, 0, 0)" },
  right: { transform: "translate3d(32px, 0, 0)" },
  "up-far": { transform: "translate3d(0, 90px, 0)" },
  "down-far": { transform: "translate3d(0, -90px, 0)" },
  "left-far": { transform: "translate3d(-110px, 0, 0)" },
  "right-far": { transform: "translate3d(110px, 0, 0)" },
  glide: { transform: "translate3d(0, 70px, 0)", easing: EASE.outSoft },

  // Scale
  fade: {},
  scale: { transform: "scale(0.94)" },
  zoom: { transform: "scale(0.62)" },
  shrink: { transform: "scale(1.16)" },
  pop: { transform: "scale(0.7)", easing: EASE.spring },
  rise: { transform: "translate3d(0, 34px, 0) scale(0.96)" },
  drop: { transform: "translate3d(0, -34px, 0) scale(0.96)" },
  "spring-up": { transform: "translate3d(0, 46px, 0)", easing: EASE.spring },
  "spring-left": { transform: "translate3d(-46px, 0, 0)", easing: EASE.spring },

  // Blur
  blur: { filter: "blur(10px)", transform: "translate3d(0, 14px, 0)" },
  "blur-only": { filter: "blur(14px)" },
  "blur-up": { filter: "blur(12px)", transform: "translate3d(0, 40px, 0)" },
  "blur-scale": { filter: "blur(10px)", transform: "scale(1.08)" },
  "drift-left": { filter: "blur(6px)", transform: "translate3d(-30px, 0, 0)" },
  "drift-right": { filter: "blur(6px)", transform: "translate3d(30px, 0, 0)" },

  // Rotation in the plane
  "tilt-left": { transform: "rotate(-6deg) scale(0.96)" },
  "tilt-right": { transform: "rotate(6deg) scale(0.96)" },
  "roll-left": { transform: "rotate(-24deg) translate3d(-46px, 0, 0)" },
  "roll-right": { transform: "rotate(24deg) translate3d(46px, 0, 0)" },
  swing: { transform: "rotate(-9deg) translate3d(0, 22px, 0)", origin: "50% 0%", easing: EASE.spring },
  twist: { transform: "rotate(180deg) scale(0.6)" },
  spin: { transform: "rotate(-100deg) scale(0.8)" },
  "skew-x": { transform: "skewX(14deg) translate3d(-28px, 0, 0)" },
  "skew-y": { transform: "skewY(9deg) translate3d(0, 28px, 0)" },

  // Rotation in space
  "flip-x": { transform: "perspective(900px) rotateX(-72deg)" },
  "flip-y": { transform: "perspective(900px) rotateY(72deg)" },
  unfold: { transform: "perspective(900px) rotateX(-88deg)", origin: "50% 0%" },
  "fold-up": { transform: "perspective(900px) rotateX(88deg)", origin: "50% 100%" },
  door: { transform: "perspective(900px) rotateY(-88deg)", origin: "0% 50%" },
  "door-right": { transform: "perspective(900px) rotateY(88deg)", origin: "100% 50%" },
  corner: { transform: "perspective(900px) rotate3d(1, 1, 0, -46deg)", origin: "0% 0%" },
  "lift-3d": { transform: "perspective(900px) rotateX(24deg) translate3d(0, 40px, -60px)" },

  // Clipped
  "curtain-up": { clipPath: "inset(100% 0 0 0)" },
  "curtain-down": { clipPath: "inset(0 0 100% 0)" },
  "curtain-left": { clipPath: "inset(0 100% 0 0)" },
  "curtain-right": { clipPath: "inset(0 0 0 100%)" },
  iris: { clipPath: "circle(0% at 50% 50%)" },
  "wipe-diagonal": { clipPath: "polygon(0 0, 0 0, 0 0, 0 0)" },
  mask: { clipPath: "inset(0 0 100% 0)", transform: "translate3d(0, 24px, 0)" },
  slat: { clipPath: "inset(0 0 100% 0)", transform: "perspective(900px) rotateX(-40deg)", origin: "50% 100%" },

  none: {},
};

/** The finished state for whatever the start state disturbed. */
const RESTING = {
  transform: "translate3d(0, 0, 0) scale(1) rotate(0deg)",
  filter: "blur(0px)",
  clipPath: "inset(0 0 0 0)",
};

/** Some end states cannot be expressed by the generic resting value. */
const SETTLED = {
  iris: { clipPath: "circle(150% at 50% 50%)" },
  "wipe-diagonal": { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" },
};

/** Every effect name, in the order they are documented. */
export const REVEAL_EFFECTS = Object.keys(EFFECTS);

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

  /** The start state for one element, and the end state that undoes it. */
  const statesFor = (el) => {
    const name = dataString(el, "rmReveal", from);
    const effect = EFFECTS[name] ?? EFFECTS.up;
    const start = {};
    const end = {};
    for (const property of ["transform", "filter", "clipPath"]) {
      if (!(property in effect)) continue;
      start[property] = effect[property];
      end[property] = SETTLED[name]?.[property] ?? RESTING[property];
    }
    return { name, effect, start, end };
  };

  // Hide from JavaScript, not from CSS: content stays visible when the script
  // does not run at all.
  for (const el of elements) {
    if (prefersReducedMotion()) break;
    const { effect, start } = statesFor(el);
    el.style.opacity = "0";
    for (const [property, value] of Object.entries(start)) el.style[property] = value;
    if (effect.origin) el.style.transformOrigin = effect.origin;
    el.style.willChange = "transform, opacity";
  }

  let index = 0;
  const played = new WeakSet();

  const enter = (el) => {
    if (played.has(el)) return;
    played.add(el);

    const { effect, start, end } = statesFor(el);
    const own = dataNumber(el, "rmDelay", null);
    const wait = own ?? delay + index * stagger;
    index++;

    const animation = animate(
      el,
      [{ opacity: 0, ...start }, { opacity: 1, ...end }],
      {
        duration: dataNumber(el, "rmDuration", duration),
        delay: wait,
        easing: effect.easing ?? easing,
      },
    );

    const settle = () => {
      // Leaving will-change set forever costs memory on long pages.
      el.style.willChange = "";
      el.style.opacity = "";
      el.style.transform = "";
      el.style.filter = "";
      el.style.clipPath = "";
      el.style.transformOrigin = "";
      el.classList.add("rm-revealed");
    };
    if (animation) animation.finished.then(settle).catch(settle);
    else settle();
  };

  const stop = watch(elements, enter, { threshold, margin, once });

  /*
   * Anything already on screen when the page loads animates in straight away.
   *
   * The trigger margin pulls the bottom of the band up, so that elements
   * arriving from below start a little after they appear. On first paint that
   * same margin leaves anything sitting in the lower slice of the first
   * viewport untouched — visible space on the landing screen, blank, until the
   * visitor scrolls. Which is precisely the thing this library refuses to do.
   */
  requestAnimationFrame(() => {
    for (const el of elements) {
      const box = el.getBoundingClientRect();
      if (box.top < innerHeight && box.bottom > 0) enter(el);
    }
  });

  return () => {
    stop();
    elements.forEach((el) => {
      el.style.opacity = "";
      el.style.transform = "";
      el.style.filter = "";
      el.style.clipPath = "";
      el.style.transformOrigin = "";
      el.style.willChange = "";
    });
  };
}
