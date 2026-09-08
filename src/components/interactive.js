/**
 * Interactive set pieces.
 *
 *   • compare() — a before/after image slider you can also drive with a key.
 *   • panels()  — a row of panels where the hovered one takes the room.
 *   • skew()    — content leans with scroll velocity and springs back.
 *   • orbit()   — items circling a centre, at their own speeds.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import {
  clamp, dataNumber, dataString, lerp, onFrame,
  prefersReducedMotion, resolveElements,
} from "../core/motion.js";

/**
 * A before/after slider.
 *
 * Nearly every version of this on the web is pointer-only, which makes it
 * useless to anyone on a keyboard and invisible to a screen reader. This one
 * is a real `role="slider"` with arrow keys, Home and End, and an announced
 * value — the drag is an enhancement on top, not the only way in.
 *
 *   <div data-rm-compare>
 *     <img data-rm-before src="…" alt="Before">
 *     <img data-rm-after  src="…" alt="After">
 *   </div>
 */
export function compare(target = "[data-rm-compare]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { start = 50, step = 4, label = "Compare before and after" } = options;
  const cleanups = [];

  for (const element of elements) {
    const after = element.querySelector("[data-rm-after]");
    if (!after) continue;

    element.classList.add("rm-compare");
    let value = clamp(dataNumber(element, "rmCompare", start), 0, 100);

    const handle = document.createElement("div");
    handle.className = "rm-compare-handle";
    handle.tabIndex = 0;
    handle.setAttribute("role", "slider");
    handle.setAttribute("aria-label", dataString(element, "rmLabel", label));
    handle.setAttribute("aria-valuemin", "0");
    handle.setAttribute("aria-valuemax", "100");
    element.appendChild(handle);

    const apply = () => {
      element.style.setProperty("--rm-compare", `${value}%`);
      handle.setAttribute("aria-valuenow", String(Math.round(value)));
      handle.setAttribute("aria-valuetext", `${Math.round(value)}% después`);
    };
    apply();

    const setFrom = (clientX) => {
      const box = element.getBoundingClientRect();
      value = clamp(((clientX - box.left) / box.width) * 100, 0, 100);
      apply();
    };

    let dragging = false;
    const onDown = (event) => {
      dragging = true;
      element.setPointerCapture?.(event.pointerId);
      setFrom(event.clientX);
    };
    const onMove = (event) => { if (dragging) setFrom(event.clientX); };
    const onUp = () => { dragging = false; };

    const onKey = (event) => {
      const jump = event.shiftKey ? step * 4 : step;
      const moves = {
        ArrowLeft: -jump, ArrowRight: jump,
        ArrowDown: -jump, ArrowUp: jump,
        Home: -100, End: 100,
      };
      if (!(event.key in moves)) return;
      event.preventDefault();
      value = clamp(value + moves[event.key], 0, 100);
      apply();
    };

    element.addEventListener("pointerdown", onDown);
    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerup", onUp);
    element.addEventListener("pointercancel", onUp);
    handle.addEventListener("keydown", onKey);

    cleanups.push(() => {
      element.removeEventListener("pointerdown", onDown);
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerup", onUp);
      element.removeEventListener("pointercancel", onUp);
      handle.remove();
      element.classList.remove("rm-compare");
      element.style.removeProperty("--rm-compare");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A row of panels where the one you point at takes the room.
 *
 * The expansion is `flex-grow`, transitioned in CSS, so the browser owns the
 * animation. Focus counts as well as hover — a keyboard user tabbing through
 * a row of links should see the same thing a mouse user does, and that costs
 * one extra event listener.
 */
export function panels(target = "[data-rm-panels]", options = {}) {
  const containers = resolveElements(target);
  if (!containers.length) return () => {};

  const { selector = "[data-rm-panel]", grow = 3.2, duration = 620 } = options;
  const cleanups = [];

  for (const container of containers) {
    const items = [...container.querySelectorAll(selector)];
    if (!items.length) continue;

    container.classList.add("rm-panels");
    container.style.setProperty("--rm-panels-grow", String(dataNumber(container, "rmPanels", grow)));
    container.style.setProperty("--rm-panels-duration", `${prefersReducedMotion() ? 0 : duration}ms`);
    items.forEach((item) => item.classList.add("rm-panel"));

    const activate = (item) => {
      for (const other of items) other.classList.toggle("is-open", other === item);
    };
    const clear = () => items.forEach((item) => item.classList.remove("is-open"));

    const handlers = [];
    for (const item of items) {
      const enter = () => activate(item);
      item.addEventListener("pointerenter", enter);
      item.addEventListener("focusin", enter);
      handlers.push(() => {
        item.removeEventListener("pointerenter", enter);
        item.removeEventListener("focusin", enter);
      });
    }
    container.addEventListener("pointerleave", clear);

    cleanups.push(() => {
      handlers.forEach((off) => off());
      container.removeEventListener("pointerleave", clear);
      container.classList.remove("rm-panels");
      items.forEach((item) => item.classList.remove("rm-panel", "is-open"));
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Content leans with scroll velocity and springs back when you stop.
 *
 * The single most recognisable "smooth scrolling site" effect, and the usual
 * implementation hijacks the scroll itself — replacing the browser's scrolling
 * with a JavaScript one, which breaks the scrollbar, find-in-page and every
 * accessibility affordance built on native scroll. This does not touch
 * scrolling at all. It reads the velocity and skews the content, which is the
 * part you actually see.
 *
 * The skew is clamped hard: past about 8 degrees text stops being readable
 * during a fast flick, and it reads as a bug rather than a flourish.
 */
export function skew(target = "[data-rm-skew]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length || prefersReducedMotion()) return () => {};

  const { strength = 0.35, max = 7, ease = 0.12 } = options;

  const items = elements.map((element) => ({
    element,
    strength: dataNumber(element, "rmSkew", strength),
    current: 0,
  }));

  let lastY = scrollY;
  let velocity = 0;

  const stopFrame = onFrame(() => {
    const y = scrollY;
    velocity = y - lastY;
    lastY = y;

    for (const item of items) {
      const goal = clamp(velocity * item.strength, -max, max);
      item.current = lerp(item.current, goal, ease);
      item.element.style.transform =
        Math.abs(item.current) < 0.01 ? "" : `skewY(${item.current.toFixed(2)}deg)`;
    }
  });

  return () => {
    stopFrame();
    items.forEach((item) => { item.element.style.transform = ""; });
  };
}

/**
 * Items circling a centre.
 *
 * Positions are written as a rotation on the ring and a counter-rotation on
 * the item, so logos and text stay upright while they travel — an orbit where
 * everything tumbles is a novelty, and unreadable. Each ring is one CSS
 * animation, so the whole thing costs nothing per frame.
 *
 *   <div data-rm-orbit data-rm-radius="140">
 *     <span>…</span><span>…</span><span>…</span>
 *   </div>
 */
export function orbit(target = "[data-rm-orbit]", options = {}) {
  const containers = resolveElements(target);
  if (!containers.length) return () => {};

  const { radius = 130, duration = 24000, reverse = false, tilt = 0 } = options;
  const cleanups = [];

  for (const container of containers) {
    const items = [...container.children];
    if (!items.length) continue;

    const r = dataNumber(container, "rmRadius", radius);
    const span = dataNumber(container, "rmDuration", duration);
    const backwards = dataString(container, "rmReverse", reverse ? "true" : "false") === "true";

    container.classList.add("rm-orbit");
    container.style.setProperty("--rm-orbit-radius", `${r}px`);
    container.style.setProperty("--rm-orbit-duration", `${span}ms`);
    container.style.setProperty("--rm-orbit-tilt", `${dataNumber(container, "rmLean", tilt)}deg`);
    if (backwards) container.classList.add("is-reverse");
    if (prefersReducedMotion()) container.classList.add("is-still");

    items.forEach((item, index) => {
      item.classList.add("rm-orbit-item");
      // Spread evenly, and hand each item its own angle so CSS can place it
      // without a wrapper element per orbiting thing.
      item.style.setProperty("--rm-orbit-angle", `${(index / items.length) * 360}deg`);
    });

    cleanups.push(() => {
      container.classList.remove("rm-orbit", "is-reverse", "is-still");
      items.forEach((item) => {
        item.classList.remove("rm-orbit-item");
        item.style.removeProperty("--rm-orbit-angle");
      });
    });
  }

  return () => cleanups.forEach((stop) => stop());
}
