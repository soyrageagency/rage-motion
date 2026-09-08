/**
 * Shared motion primitives.
 *
 * Two decisions live here that shape everything built on top.
 *
 * First: `prefers-reduced-motion` is honoured by default, not as an option
 * somebody remembers to switch on. A visitor who has asked their operating
 * system for less movement has usually done so because motion makes them ill,
 * and a portfolio effect is not worth that. Reduced motion does not mean *no*
 * feedback — elements still arrive, they just arrive instantly and without
 * travel, so nothing disappears and no layout depends on an animation running.
 *
 * Second: no dependencies. Most kits in this space are GSAP wrappers, which
 * makes every snippet unusable until you have added a library and read its
 * licence. Everything here is native: IntersectionObserver, Web Animations,
 * CSS scroll-driven timelines and View Transitions.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

/** Does this visitor want less movement? Re-read each time; it can change. */
export function prefersReducedMotion() {
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Call `handler` whenever the reduced-motion preference changes. */
export function onMotionPreferenceChange(handler) {
  if (typeof matchMedia !== "function") return () => {};
  const query = matchMedia("(prefers-reduced-motion: reduce)");
  const listener = () => handler(query.matches);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}

/** Does the browser support CSS scroll-driven animations natively? */
export function supportsScrollTimeline() {
  return typeof CSS !== "undefined" && CSS.supports?.("animation-timeline: view()") === true;
}

/** Does the browser support the View Transitions API? */
export function supportsViewTransitions() {
  return typeof document !== "undefined" && typeof document.startViewTransition === "function";
}

/**
 * Easing curves.
 *
 * `out` variants for things arriving (fast then settling, which reads as
 * responsive) and `inOut` for things moving between two states.
 */
export const EASE = {
  out: "cubic-bezier(0.22, 1, 0.36, 1)",
  outSoft: "cubic-bezier(0.33, 1, 0.68, 1)",
  inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
  spring: "linear(0, 0.42 12%, 0.85 25%, 1.03 38%, 1.05 47%, 1 62%, 0.995 78%, 1)",
};

/** Clamp a number into a range. */
export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

/** Linear interpolation. */
export const lerp = (from, to, amount) => from + (to - from) * amount;

/** Map a value from one range to another, clamped. */
export const mapRange = (value, inMin, inMax, outMin, outMax) =>
  outMin + (clamp((value - inMin) / (inMax - inMin)) * (outMax - outMin));

/**
 * Watch elements and run `enter` the first time each becomes visible.
 *
 * `IntersectionObserver` rather than scroll listeners: the browser does the
 * work off the main thread, so a page with two hundred watched elements still
 * scrolls at full rate.
 *
 * @param {string|Element|NodeList|Element[]} target
 * @param {(el: Element) => void} enter
 * @param {{ threshold?: number, margin?: string, once?: boolean, leave?: (el: Element) => void }} options
 * @returns {() => void} stop watching
 */
export function watch(target, enter, options = {}) {
  const { threshold = 0.15, margin = "0px 0px -10% 0px", once = true, leave } = options;
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  // Without IntersectionObserver, show everything immediately. A missing API
  // must never leave content invisible.
  if (typeof IntersectionObserver !== "function") {
    elements.forEach(enter);
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          enter(entry.target);
          if (once) observer.unobserve(entry.target);
        } else if (leave) {
          leave(entry.target);
        }
      }
    },
    { threshold, rootMargin: margin },
  );

  elements.forEach((el) => observer.observe(el));
  return () => observer.disconnect();
}

/** Accept a selector, an element, a NodeList or an array. */
export function resolveElements(target) {
  if (!target) return [];
  if (typeof target === "string") return [...document.querySelectorAll(target)];
  if (target instanceof Element) return [target];
  return [...target].filter((el) => el instanceof Element);
}

/**
 * A requestAnimationFrame loop that only runs while it has work.
 *
 * Several components want per-frame updates (cursor, parallax). One shared
 * loop keeps them in the same frame and stops entirely when the last one
 * unsubscribes, instead of leaving an idle rAF spinning forever.
 */
const tasks = new Set();
let frame = null;

function tick(now) {
  for (const task of tasks) task(now);
  frame = tasks.size ? requestAnimationFrame(tick) : null;
}

/** Add a per-frame task. Returns a function that removes it. */
export function onFrame(task) {
  tasks.add(task);
  if (frame === null) frame = requestAnimationFrame(tick);
  return () => {
    tasks.delete(task);
    if (!tasks.size && frame !== null) {
      cancelAnimationFrame(frame);
      frame = null;
    }
  };
}

/**
 * Animate an element, respecting the motion preference.
 *
 * Under reduced motion the element jumps straight to its final state rather
 * than being skipped: something built to fade in from below must still end up
 * visible and in place.
 *
 * @returns {Animation|null} the running animation, or null when it was skipped
 */
export function animate(element, keyframes, options = {}) {
  const { duration = 700, delay = 0, easing = EASE.out, fill = "both", ...rest } = options;

  if (prefersReducedMotion()) {
    const final = Array.isArray(keyframes) ? keyframes[keyframes.length - 1] : keyframes;
    for (const [property, value] of Object.entries(final)) {
      if (property === "offset" || property === "easing") continue;
      element.style[property] = Array.isArray(value) ? value[value.length - 1] : value;
    }
    return null;
  }

  return element.animate(keyframes, { duration, delay, easing, fill, ...rest });
}

/**
 * Read a numeric option from a data attribute.
 *
 * Every component can be driven entirely from markup, so a snippet can be
 * pasted into a page and configured without touching JavaScript.
 */
export function dataNumber(element, name, fallback) {
  const raw = element.dataset[name];
  if (raw === undefined || raw === "") return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

/** Read a string option from a data attribute. */
export function dataString(element, name, fallback) {
  const raw = element.dataset[name];
  return raw === undefined || raw === "" ? fallback : raw;
}
