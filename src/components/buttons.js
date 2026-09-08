/**
 * Buttons worth pressing.
 *
 *   • fill()    — a hover fill that enters from the edge you came in through.
 *   • shimmer() — a light that runs the length of the button.
 *   • spark()   — a burst of particles at the point of the click.
 *   • swap()    — the label slides out and its twin slides in.
 *
 * Every one of these decorates a real `<button>` or `<a>`. None of them
 * replaces the element, adds a click handler, or swallows an event — so focus
 * rings, keyboard activation, form submission and middle-clicking a link all
 * behave exactly as they did before. A button that looks superb and cannot be
 * submitted with the keyboard is a worse button.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import {
  dataNumber, dataString, EASE, prefersReducedMotion, resolveElements,
} from "../core/motion.js";

/**
 * A fill that enters from whichever edge the pointer crossed.
 *
 * Come in from the left and the colour sweeps in from the left; leave upward
 * and it retreats upward. That is the whole idea, and it takes real work:
 * comparing the pointer's position to the element's centre in both axes,
 * normalised by the element's own proportions, because otherwise a wide button
 * reports "top" for a pointer that plainly came in from the side.
 *
 *   <a class="btn" data-rm-fill>Start</a>
 */
export function fill(target = "[data-rm-fill]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { color = "#2aa7e4", duration = 420 } = options;
  const cleanups = [];

  /** Which edge a pointer at (x, y) is nearest, in the element's own scale. */
  const edgeFrom = (event, box) => {
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    // Scale by the aspect ratio so a 300×40 button is not "top" from everywhere.
    return Math.abs(x) * (box.width / box.height) > Math.abs(y)
      ? (x > 0 ? "right" : "left")
      : (y > 0 ? "bottom" : "top");
  };

  const ORIGIN = {
    left: "0% 50%", right: "100% 50%", top: "50% 0%", bottom: "50% 100%",
  };

  for (const element of elements) {
    element.classList.add("rm-fill");
    element.style.setProperty("--rm-fill-color", dataString(element, "rmColor", color));
    element.style.setProperty("--rm-fill-duration", `${prefersReducedMotion() ? 0 : dataNumber(element, "rmDuration", duration)}ms`);

    const sheet = document.createElement("span");
    sheet.className = "rm-fill-sheet";
    sheet.setAttribute("aria-hidden", "true");
    element.prepend(sheet);

    const enter = (event) => {
      const edge = edgeFrom(event, element.getBoundingClientRect());
      sheet.style.transformOrigin = ORIGIN[edge];
      sheet.style.transform = edge === "left" || edge === "right" ? "scaleX(0)" : "scaleY(0)";
      // Force the start state to land before the transition to 1.
      void sheet.offsetWidth;
      sheet.style.transform = "scale(1)";
    };

    const leave = (event) => {
      const edge = edgeFrom(event, element.getBoundingClientRect());
      sheet.style.transformOrigin = ORIGIN[edge];
      sheet.style.transform = edge === "left" || edge === "right" ? "scaleX(0)" : "scaleY(0)";
    };

    element.addEventListener("pointerenter", enter);
    element.addEventListener("pointerleave", leave);
    // Keyboard focus has no edge to come from, so it fills from the middle.
    const focus = () => { sheet.style.transformOrigin = "50% 50%"; sheet.style.transform = "scale(1)"; };
    const blur = () => { sheet.style.transform = "scale(0)"; };
    element.addEventListener("focus", focus);
    element.addEventListener("blur", blur);

    cleanups.push(() => {
      element.removeEventListener("pointerenter", enter);
      element.removeEventListener("pointerleave", leave);
      element.removeEventListener("focus", focus);
      element.removeEventListener("blur", blur);
      sheet.remove();
      element.classList.remove("rm-fill");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A light that runs the length of the button.
 *
 * One moving gradient masked to the border, in CSS, so it runs on the
 * compositor. Use it on the one button on the page that matters — a shimmer on
 * every button is a page that looks like it is loading.
 */
export function shimmer(target = "[data-rm-shimmer]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { color = "#ffffff", duration = 2600, width = 90 } = options;

  for (const element of elements) {
    element.classList.add("rm-shimmer");
    element.style.setProperty("--rm-shimmer-color", dataString(element, "rmColor", color));
    element.style.setProperty("--rm-shimmer-width", `${width}px`);
    element.style.setProperty("--rm-shimmer-duration", `${dataNumber(element, "rmDuration", duration)}ms`);
  }

  return () => elements.forEach((element) => element.classList.remove("rm-shimmer"));
}

/**
 * A burst of particles at the point of the click.
 *
 * Drawn with the Web Animations API on a handful of spans that remove
 * themselves when finished, so nothing accumulates however much anyone clicks.
 * It fires on `pointerdown` rather than `click`, because the reward for
 * pressing should arrive when you press.
 */
export function spark(target = "[data-rm-spark]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length || prefersReducedMotion()) return () => {};

  const { count = 12, distance = 46, size = 3, color = "currentColor", duration = 540 } = options;
  const cleanups = [];

  for (const element of elements) {
    element.classList.add("rm-spark");

    const burst = (event) => {
      const box = element.getBoundingClientRect();
      const x = event.clientX - box.left;
      const y = event.clientY - box.top;
      const many = dataNumber(element, "rmCount", count);

      for (let i = 0; i < many; i++) {
        const particle = document.createElement("i");
        particle.className = "rm-spark-bit";
        particle.setAttribute("aria-hidden", "true");
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.width = particle.style.height = `${size}px`;
        particle.style.background = dataString(element, "rmColor", color);
        element.appendChild(particle);

        // Spread evenly with a little jitter, so it reads as a burst rather
        // than a wheel of spokes.
        const angle = (i / many) * Math.PI * 2 + Math.random() * 0.5;
        const reach = distance * (0.6 + Math.random() * 0.7);
        particle
          .animate(
            [
              { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
              {
                transform: `translate(-50%, -50%) translate(${Math.cos(angle) * reach}px, ${Math.sin(angle) * reach}px) scale(0)`,
                opacity: 0,
              },
            ],
            { duration: duration * (0.7 + Math.random() * 0.6), easing: EASE.out },
          )
          .finished.then(() => particle.remove())
          .catch(() => particle.remove());
      }
    };

    element.addEventListener("pointerdown", burst);
    cleanups.push(() => {
      element.removeEventListener("pointerdown", burst);
      element.querySelectorAll(".rm-spark-bit").forEach((bit) => bit.remove());
      element.classList.remove("rm-spark");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * The label slides out and its twin slides in.
 *
 * The duplicate is `aria-hidden`, so the button is still announced once. Both
 * copies are laid on top of each other in a grid cell rather than absolutely
 * positioned, which means the button keeps sizing itself to its own text and
 * cannot collapse when the label changes.
 *
 *   <button data-rm-swap>Download</button>
 */
export function swap(target = "[data-rm-swap]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { duration = 380 } = options;
  const cleanups = [];

  for (const element of elements) {
    const label = element.textContent?.trim() ?? "";
    if (!label) continue;

    const original = element.innerHTML;
    element.classList.add("rm-swap");
    element.style.setProperty("--rm-swap-duration", `${prefersReducedMotion() ? 0 : duration}ms`);

    const first = document.createElement("span");
    first.className = "rm-swap-face";
    first.textContent = label;

    const second = document.createElement("span");
    second.className = "rm-swap-face is-next";
    second.setAttribute("aria-hidden", "true");
    second.textContent = dataString(element, "rmSwap", label);

    element.replaceChildren(first, second);

    cleanups.push(() => {
      element.classList.remove("rm-swap");
      element.innerHTML = original;
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * An underline that draws from the side you came in through.
 *
 * The link equivalent of `fill`: enter from the left and the rule grows from
 * the left, leave to the right and it retreats to the right. It is one
 * `transform-origin` swap, and it is the difference between a link that feels
 * physical and one with a `text-decoration` toggle.
 *
 *   <a class="link" data-rm-underline href="/work">Work</a>
 */
export function underline(target = "[data-rm-underline]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { color = "currentColor", thickness = 1.5, duration = 340 } = options;
  const cleanups = [];

  for (const element of elements) {
    element.classList.add("rm-underline");
    element.style.setProperty("--rm-underline-color", dataString(element, "rmColor", color));
    element.style.setProperty("--rm-underline-thickness", `${thickness}px`);
    element.style.setProperty("--rm-underline-duration", `${prefersReducedMotion() ? 0 : duration}ms`);

    const side = (event) => {
      const box = element.getBoundingClientRect();
      return event.clientX - box.left < box.width / 2 ? "left" : "right";
    };
    const enter = (event) => {
      element.style.setProperty("--rm-underline-origin", side(event));
      element.classList.add("is-on");
    };
    const leave = (event) => {
      element.style.setProperty("--rm-underline-origin", side(event));
      element.classList.remove("is-on");
    };
    // Focus has no side to come from, so it grows from the middle.
    const focus = () => {
      element.style.setProperty("--rm-underline-origin", "center");
      element.classList.add("is-on");
    };
    const blur = () => element.classList.remove("is-on");

    element.addEventListener("pointerenter", enter);
    element.addEventListener("pointerleave", leave);
    element.addEventListener("focus", focus);
    element.addEventListener("blur", blur);

    cleanups.push(() => {
      element.removeEventListener("pointerenter", enter);
      element.removeEventListener("pointerleave", leave);
      element.removeEventListener("focus", focus);
      element.removeEventListener("blur", blur);
      element.classList.remove("rm-underline", "is-on");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A button with depth that actually depresses.
 *
 * A hard offset shadow, and on press the button moves into it. The travel and
 * the shadow shrink by the same amount, so the bottom edge stays put and only
 * the face moves — which is what makes it read as a key going down rather than
 * as a rectangle sliding.
 */
export function press(target = "[data-rm-press]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { depth = 4, color = "#0e0e0e", duration = 120 } = options;

  for (const element of elements) {
    element.classList.add("rm-press");
    element.style.setProperty("--rm-press-depth", `${dataNumber(element, "rmDepth", depth)}px`);
    element.style.setProperty("--rm-press-color", dataString(element, "rmColor", color));
    element.style.setProperty("--rm-press-duration", `${prefersReducedMotion() ? 0 : duration}ms`);
  }

  return () => elements.forEach((element) => element.classList.remove("rm-press"));
}

/**
 * A glow that follows the pointer inside the button.
 *
 * The same idea as `spotlight` but sized for a control, and it fades out
 * rather than snapping off, so leaving the button does not read as a light
 * being switched off. One shared listener for the whole set.
 */
export function halo(target = "[data-rm-halo]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { size = 120, color = "rgba(255,255,255,0.28)" } = options;

  for (const element of elements) {
    element.classList.add("rm-halo");
    element.style.setProperty("--rm-halo-size", `${dataNumber(element, "rmSize", size)}px`);
    element.style.setProperty("--rm-halo-color", dataString(element, "rmColor", color));
  }

  const onMove = (event) => {
    for (const element of elements) {
      const box = element.getBoundingClientRect();
      if (event.clientX < box.left - 30 || event.clientX > box.right + 30) continue;
      if (event.clientY < box.top - 30 || event.clientY > box.bottom + 30) continue;
      element.style.setProperty("--rm-halo-x", `${event.clientX - box.left}px`);
      element.style.setProperty("--rm-halo-y", `${event.clientY - box.top}px`);
    }
  };
  addEventListener("pointermove", onMove, { passive: true });

  return () => {
    removeEventListener("pointermove", onMove);
    elements.forEach((element) => element.classList.remove("rm-halo"));
  };
}

/**
 * An outline that draws itself around the button on hover.
 *
 * A real SVG rectangle revealed with `stroke-dashoffset`, so the line travels
 * around the shape from one corner. A CSS border can only fade in; it has no
 * concept of a start and an end, which is why every CSS version of this is
 * four separate elements pretending to be one line.
 *
 * The rectangle is re-measured on resize, so it stays on the button when the
 * label changes or the font swaps.
 */
export function strokeDraw(target = "[data-rm-stroke]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { color = "#2aa7e4", width = 1.5, duration = 520, radius } = options;
  const cleanups = [];

  for (const element of elements) {
    element.classList.add("rm-stroke");
    element.style.setProperty("--rm-stroke-duration", `${prefersReducedMotion() ? 0 : duration}ms`);

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.classList.add("rm-stroke-svg");
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("fill", "none");
    rect.setAttribute("stroke", dataString(element, "rmColor", color));
    rect.setAttribute("stroke-width", String(width));
    svg.appendChild(rect);
    element.appendChild(svg);

    const measure = () => {
      const box = element.getBoundingClientRect();
      if (!box.width || !box.height) return;
      const round = radius ?? (parseFloat(getComputedStyle(element).borderTopLeftRadius) || 0);
      svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
      rect.setAttribute("x", String(width / 2));
      rect.setAttribute("y", String(width / 2));
      rect.setAttribute("width", String(Math.max(0, box.width - width)));
      rect.setAttribute("height", String(Math.max(0, box.height - width)));
      rect.setAttribute("rx", String(Math.max(0, round - width / 2)));
      const length = rect.getTotalLength();
      element.style.setProperty("--rm-stroke-length", String(Math.round(length)));
    };
    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(element);

    cleanups.push(() => {
      resizeObserver.disconnect();
      svg.remove();
      element.classList.remove("rm-stroke");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}
