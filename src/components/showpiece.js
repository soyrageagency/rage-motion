/**
 * Showpiece components — the ones people screenshot.
 *
 *   • typewriter()  — a phrase types itself, deletes, and the next one follows.
 *   • waveText()    — characters lift in a wave that follows the pointer.
 *   • magnetLines() — a field of lines that all turn to face the pointer.
 *   • ripple()      — a ring expands from wherever you click.
 *
 * These are deliberately louder than the rest of the kit. Each one is built so
 * that being loud is the only expensive thing about it: no per-element
 * listeners, no work while off screen, and a resting state that is legible on
 * its own — because a headline that only makes sense mid-animation is a
 * headline nobody reads.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import {
  clamp, dataNumber, dataString, EASE, lerp, onFrame,
  prefersReducedMotion, resolveElements,
} from "../core/motion.js";
import { split } from "../core/split.js";

/**
 * A phrase types itself out, pauses, deletes, and the next one follows.
 *
 * The rotating tagline every landing page wants, done without the two things
 * that usually ruin it. First, the accessible name is the full list of phrases
 * written once, and the animated span is `aria-hidden` — otherwise a screen
 * reader announces every single keystroke. Second, the element reserves the
 * width of the longest phrase, so the line beside it does not jitter left and
 * right for the rest of the visit.
 *
 *   <span data-rm-type="Diseño|Desarrollo|Motion"></span>
 */
export function typewriter(target = "[data-rm-type]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const {
    phrases = [],
    typeSpeed = 62,
    deleteSpeed = 32,
    holdFull = 1700,
    holdEmpty = 320,
    caret = true,
    loop = true,
  } = options;

  const timers = [];

  for (const element of elements) {
    const list = (dataString(element, "rmType", "") || "")
      .split("|")
      .map((phrase) => phrase.trim())
      .filter(Boolean);
    const words = list.length ? list : phrases;
    if (!words.length) continue;

    element.classList.add("rm-type");
    element.setAttribute("aria-label", words.join(", "));

    const out = document.createElement("span");
    out.className = "rm-type-text";
    out.setAttribute("aria-hidden", "true");

    // Reserve the widest phrase. A sizer holding the longest string at zero
    // height gives the element a stable width without hardcoding one.
    const sizer = document.createElement("span");
    sizer.className = "rm-type-sizer";
    sizer.setAttribute("aria-hidden", "true");
    sizer.textContent = words.reduce((longest, word) => (word.length > longest.length ? word : longest), "");

    element.replaceChildren(sizer, out);
    if (caret) element.classList.add("has-caret");

    // Reduced motion gets the first phrase, still. The information is the
    // phrase, not the typing.
    if (prefersReducedMotion()) {
      out.textContent = words[0];
      continue;
    }

    let index = 0;
    let length = 0;
    let deleting = false;
    let timer = 0;

    const tick = () => {
      const word = words[index];
      out.textContent = word.slice(0, length);

      let wait = deleting ? deleteSpeed : typeSpeed;
      if (!deleting && length === word.length) {
        if (!loop && index === words.length - 1) return;
        deleting = true;
        wait = dataNumber(element, "rmHold", holdFull);
      } else if (deleting && length === 0) {
        deleting = false;
        index = (index + 1) % words.length;
        wait = holdEmpty;
      } else {
        length += deleting ? -1 : 1;
        // A tiny jitter keeps it from sounding like a machine gun.
        wait += Math.random() * 34;
      }

      timer = setTimeout(tick, wait);
    };

    timer = setTimeout(tick, 400);
    timers.push(() => {
      clearTimeout(timer);
      element.classList.remove("rm-type", "has-caret");
      element.textContent = words[0];
      element.removeAttribute("aria-label");
    });
  }

  return () => timers.forEach((stop) => stop());
}

/**
 * Characters lift in a wave that follows the pointer.
 *
 * The effect only reads as a wave if a character reacts to its neighbours'
 * distance too, so the lift falls off smoothly over a radius rather than
 * switching on per glyph. Positions are measured once and re-measured on
 * resize; measuring them per frame would be a layout read per character.
 */
export function waveText(target = "[data-rm-wave]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length || prefersReducedMotion()) return () => {};
  if (typeof matchMedia === "function" && !matchMedia("(pointer: fine)").matches) return () => {};

  const { radius = 120, lift = 16, scale = 0.35, ease = 0.2 } = options;
  const cleanups = [];

  for (const element of elements) {
    const chars = split(element, "chars");
    if (!chars.length) continue;
    element.classList.add("rm-wave");

    const reach = dataNumber(element, "rmRadius", radius);
    const height = dataNumber(element, "rmLift", lift);
    const centres = new Array(chars.length).fill(0);
    const current = new Array(chars.length).fill(0);
    let target_ = new Array(chars.length).fill(0);
    let box = { left: 0, top: 0 };
    let pointerX = -9999;
    let inside = false;

    const measure = () => {
      box = element.getBoundingClientRect();
      chars.forEach((char, i) => {
        const rect = char.getBoundingClientRect();
        centres[i] = rect.left - box.left + rect.width / 2;
      });
    };
    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(element);

    const onMove = (event) => {
      pointerX = event.clientX - element.getBoundingClientRect().left;
      inside = true;
    };
    const onLeave = () => { inside = false; };
    element.addEventListener("pointermove", onMove, { passive: true });
    element.addEventListener("pointerleave", onLeave);

    const stopFrame = onFrame(() => {
      target_ = centres.map((centre) => {
        if (!inside) return 0;
        const distance = Math.abs(centre - pointerX);
        // Cosine falloff: zero at the edge of the radius, one at the pointer,
        // and smooth in between, which is what makes it a wave and not a bump.
        return distance > reach ? 0 : (Math.cos((distance / reach) * Math.PI) + 1) / 2;
      });

      let settled = true;
      chars.forEach((char, i) => {
        current[i] = lerp(current[i], target_[i], ease);
        if (current[i] > 0.001) settled = false;
        char.style.transform =
          `translate3d(0, ${(-current[i] * height).toFixed(2)}px, 0) scale(${(1 + current[i] * scale).toFixed(3)})`;
      });
      // Clear the transforms entirely once at rest, so a page of these is not
      // holding hundreds of composited layers open for nothing.
      if (settled && !inside) chars.forEach((char) => { char.style.transform = ""; });
    });

    cleanups.push(() => {
      stopFrame();
      resizeObserver.disconnect();
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
      element.classList.remove("rm-wave");
      chars.forEach((char) => { char.style.transform = ""; });
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A field of short lines that all turn to face the pointer.
 *
 * Cheap and hypnotic: one listener for the whole grid, and each line is a
 * single `rotate`, which the compositor handles without a layout pass. The
 * count is capped because a 40×40 field is 1,600 elements being written every
 * frame, and past roughly 400 you cannot see the difference anyway.
 */
export function magnetLines(target = "[data-rm-lines]", options = {}) {
  const containers = resolveElements(target);
  if (!containers.length) return () => {};

  const { columns = 14, rows = 9, length = 22, thickness = 2, color = "currentColor", ease = 0.22 } = options;
  const cleanups = [];

  for (const container of containers) {
    const cols = clamp(dataNumber(container, "rmColumns", columns), 2, 30);
    const rowCount = clamp(dataNumber(container, "rmRows", rows), 2, 30);

    container.classList.add("rm-lines");
    container.setAttribute("aria-hidden", "true");
    container.style.setProperty("--rm-lines-cols", String(cols));
    container.style.setProperty("--rm-lines-rows", String(rowCount));
    container.style.setProperty("--rm-lines-length", `${length}px`);
    container.style.setProperty("--rm-lines-thickness", `${thickness}px`);
    container.style.setProperty("--rm-lines-color", dataString(container, "rmColor", color));

    const lines = [];
    for (let i = 0; i < cols * rowCount; i++) {
      const line = document.createElement("i");
      container.appendChild(line);
      lines.push({ element: line, x: 0, y: 0, angle: -90, goal: -90 });
    }

    const measure = () => {
      const box = container.getBoundingClientRect();
      for (const line of lines) {
        const rect = line.element.getBoundingClientRect();
        line.x = rect.left - box.left + rect.width / 2;
        line.y = rect.top - box.top + rect.height / 2;
      }
    };
    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(container);

    // Rest pointing at the container's own centre. Left at the CSS default the
    // whole field is a grid of identical dashes until someone happens to move a
    // pointer over it — which on a touch screen is never, and in a screenshot
    // always. A radial fan reads as designed even when nothing is happening.
    const box = container.getBoundingClientRect();
    let pointer = { x: box.width / 2, y: box.height / 2 };
    const onMove = (event) => {
      const bounds = container.getBoundingClientRect();
      pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    };
    addEventListener("pointermove", onMove, { passive: true });

    const reduced = prefersReducedMotion();
    const stopFrame = onFrame(() => {
      for (const line of lines) {
        const goal = (Math.atan2(pointer.y - line.y, pointer.x - line.x) * 180) / Math.PI;
        // Take the short way round, or the whole field spins backwards through
        // 360 degrees whenever the pointer crosses behind a line.
        let delta = ((goal - line.angle + 540) % 360) - 180;
        line.angle += reduced ? delta : delta * ease;
        line.element.style.transform = `rotate(${line.angle.toFixed(1)}deg)`;
      }
    });

    cleanups.push(() => {
      stopFrame();
      resizeObserver.disconnect();
      removeEventListener("pointermove", onMove);
      container.classList.remove("rm-lines");
      container.replaceChildren();
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A ring expands from wherever you click.
 *
 * Attached to the container, not to each button, so it keeps working for
 * elements added later. The ring is removed when its animation finishes rather
 * than on a timer, so a backgrounded tab cannot leave a pile of them behind.
 */
export function ripple(target = "[data-rm-ripple]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { color = "currentColor", duration = 620, opacity = 0.25 } = options;
  const cleanups = [];

  for (const element of elements) {
    element.classList.add("rm-ripple");

    const onDown = (event) => {
      if (prefersReducedMotion()) return;
      const box = element.getBoundingClientRect();
      const x = event.clientX - box.left;
      const y = event.clientY - box.top;
      // Reach the furthest corner, so the ring always covers the element.
      const size = Math.max(
        Math.hypot(x, y),
        Math.hypot(box.width - x, y),
        Math.hypot(x, box.height - y),
        Math.hypot(box.width - x, box.height - y),
      ) * 2;

      const ring = document.createElement("span");
      ring.className = "rm-ripple-ring";
      ring.setAttribute("aria-hidden", "true");
      ring.style.left = `${x}px`;
      ring.style.top = `${y}px`;
      ring.style.width = ring.style.height = `${size}px`;
      ring.style.background = dataString(element, "rmColor", color);
      element.appendChild(ring);

      const animation = ring.animate(
        [
          { transform: "translate(-50%, -50%) scale(0)", opacity },
          { transform: "translate(-50%, -50%) scale(1)", opacity: 0 },
        ],
        { duration: dataNumber(element, "rmDuration", duration), easing: EASE.out },
      );
      animation.finished.then(() => ring.remove()).catch(() => ring.remove());
    };

    element.addEventListener("pointerdown", onDown);
    cleanups.push(() => {
      element.removeEventListener("pointerdown", onDown);
      element.classList.remove("rm-ripple");
      element.querySelectorAll(".rm-ripple-ring").forEach((ring) => ring.remove());
    });
  }

  return () => cleanups.forEach((stop) => stop());
}
