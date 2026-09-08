/**
 * Interactive cards.
 *
 *   • spotlight() — a light follows the pointer across the card's surface.
 *   • tilt()      — the card leans in 3D towards the pointer, with a glare.
 *   • border()    — a conic gradient runs around the card's edge on hover.
 *
 * All three are driven by CSS custom properties updated on pointer move, so
 * the browser interpolates and composites; JavaScript only writes two numbers.
 * Setting `transform` or `background` directly from a pointer handler is the
 * usual approach and it forces a style recalculation on every single event.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import { clamp, dataNumber, lerp, onFrame, prefersReducedMotion, resolveElements } from "../core/motion.js";

/** Is there a real pointer? Hover effects are meaningless without one. */
const fine = () => typeof matchMedia === "function" && matchMedia("(pointer: fine)").matches;

/**
 * A radial highlight that follows the pointer over a card.
 *
 * Works on a group: one listener for the whole set rather than one per card,
 * which matters on a grid of thirty.
 */
export function spotlight(target = "[data-rm-spotlight]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length || !fine()) return () => {};

  const { size = 320, color = "rgba(59,158,240,0.16)", border = "rgba(59,158,240,0.5)" } = options;

  for (const element of elements) {
    element.classList.add("rm-spotlight");
    element.style.setProperty("--rm-spot-size", `${dataNumber(element, "rmSize", size)}px`);
    element.style.setProperty("--rm-spot-color", color);
    element.style.setProperty("--rm-spot-border", border);
  }

  const onMove = (event) => {
    for (const element of elements) {
      const box = element.getBoundingClientRect();
      // Skip cards nowhere near the pointer: on a long page most of them are
      // off screen and updating them is wasted work.
      if (box.bottom < 0 || box.top > innerHeight) continue;
      element.style.setProperty("--rm-spot-x", `${event.clientX - box.left}px`);
      element.style.setProperty("--rm-spot-y", `${event.clientY - box.top}px`);
    }
  };

  addEventListener("pointermove", onMove, { passive: true });
  return () => {
    removeEventListener("pointermove", onMove);
    elements.forEach((el) => el.classList.remove("rm-spotlight"));
  };
}

/**
 * 3D tilt towards the pointer.
 *
 * The rotation is deliberately small. Past about fifteen degrees the text on a
 * card becomes genuinely hard to read, and the effect stops feeling like depth
 * and starts feeling like a gimmick.
 */
export function tilt(target = "[data-rm-tilt]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length || !fine() || prefersReducedMotion()) return () => {};

  const { max = 10, scale = 1.02, ease = 0.14, glare = true, perspective = 900 } = options;
  const cleanups = [];

  for (const element of elements) {
    const limit = dataNumber(element, "rmTilt", max);
    element.classList.add("rm-tilt");
    element.style.setProperty("--rm-tilt-perspective", `${perspective}px`);

    let glareEl = null;
    if (glare) {
      glareEl = document.createElement("span");
      glareEl.className = "rm-tilt-glare";
      glareEl.setAttribute("aria-hidden", "true");
      element.appendChild(glareEl);
    }

    const goal = { x: 0, y: 0, scale: 1, gx: 50, gy: 50, glare: 0 };
    const current = { ...goal };
    let active = false;

    const onEnter = () => { active = true; goal.scale = scale; goal.glare = 1; };
    const onLeave = () => {
      active = false;
      goal.x = 0; goal.y = 0; goal.scale = 1; goal.glare = 0;
    };
    const onMove = (event) => {
      if (!active) return;
      const box = element.getBoundingClientRect();
      const px = (event.clientX - box.left) / box.width;
      const py = (event.clientY - box.top) / box.height;
      goal.y = (px - 0.5) * 2 * limit;
      goal.x = -(py - 0.5) * 2 * limit;
      goal.gx = clamp(px, 0, 1) * 100;
      goal.gy = clamp(py, 0, 1) * 100;
    };

    element.addEventListener("pointerenter", onEnter);
    element.addEventListener("pointerleave", onLeave);
    element.addEventListener("pointermove", onMove, { passive: true });

    const stopFrame = onFrame(() => {
      let moved = false;
      for (const key of ["x", "y", "scale", "gx", "gy", "glare"]) {
        const next = lerp(current[key], goal[key], ease);
        if (Math.abs(next - current[key]) > 0.001) moved = true;
        current[key] = next;
      }
      if (!moved && !active) return;
      element.style.transform =
        `perspective(var(--rm-tilt-perspective)) rotateX(${current.x.toFixed(2)}deg) ` +
        `rotateY(${current.y.toFixed(2)}deg) scale(${current.scale.toFixed(3)})`;
      if (glareEl) {
        glareEl.style.opacity = current.glare.toFixed(3);
        glareEl.style.setProperty("--rm-glare-x", `${current.gx.toFixed(1)}%`);
        glareEl.style.setProperty("--rm-glare-y", `${current.gy.toFixed(1)}%`);
      }
    });

    cleanups.push(() => {
      stopFrame();
      element.removeEventListener("pointerenter", onEnter);
      element.removeEventListener("pointerleave", onLeave);
      element.removeEventListener("pointermove", onMove);
      element.style.transform = "";
      element.classList.remove("rm-tilt");
      glareEl?.remove();
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * An animated conic-gradient border.
 *
 * Uses `@property` so the angle is a genuinely animatable custom property; the
 * stylesheet registers it. Without that registration a browser cannot
 * interpolate an angle and the border jumps instead of rotating.
 */
export function border(target = "[data-rm-border]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { colors = ["#3b9ef0", "#7b5cf0", "#f05c9e", "#3b9ef0"], width = 1.5, duration = 4000 } = options;

  for (const element of elements) {
    element.classList.add("rm-border");
    element.style.setProperty("--rm-border-gradient", colors.join(", "));
    element.style.setProperty("--rm-border-width", `${width}px`);
    element.style.setProperty("--rm-border-duration", `${dataNumber(element, "rmDuration", duration)}ms`);
  }

  return () => elements.forEach((el) => el.classList.remove("rm-border"));
}
