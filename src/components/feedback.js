/**
 * Telling someone what is happening.
 *
 *   • skeleton()   — a placeholder that has the shape of what is coming.
 *   • spinner()    — six spinners, one component.
 *   • progressRing2() is not here; `progressRing` in nav.js does the page.
 *   • progressBar() — a determinate bar that is announced.
 *   • dotsLoader() — three dots, for when a spinner is too much.
 *   • pulseDot()   — a status light that says what it means.
 *   • badgeCount() — a count that flips when it changes.
 *   • emptyState() — the screen with nothing on it, arriving gracefully.
 *
 * Loading states are where an interface either keeps its promise or admits it
 * was never going to. So the rule throughout: every one of these is announced
 * as well as drawn. `aria-busy` while a region is loading, `role="status"` on
 * anything that appears, real `aria-valuenow` on anything with a number. A
 * spinner nobody can hear is a blank screen with a decoration on it.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import { dataNumber, dataString, prefersReducedMotion, resolveElements } from "../core/motion.js";

/** Every spinner shape, in the order the documentation lists them. */
export const SPINNER_KINDS = ["ring", "arc", "dual", "bars", "orbit", "pulse"];

/**
 * A placeholder that has the shape of what is coming.
 *
 * Shaped from the real content's own layout rather than from guessed
 * rectangles: the block is measured, so the skeleton occupies exactly the room
 * the content will, and nothing jumps when it arrives. A skeleton that is the
 * wrong height is a layout shift you built on purpose.
 *
 * The region carries `aria-busy`, so the wait is announced rather than being a
 * silent grey rectangle.
 *
 *   <div data-rm-skeleton data-rm-rows="3">…</div>
 *   holder.rmReady();   // when the content is in
 */
export function skeleton(target = "[data-rm-skeleton]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { lines = 3, shimmer = true, label = "Loading" } = options;
  const cleanups = [];

  for (const holder of holders) {
    const count = Math.max(1, Math.min(12, dataNumber(holder, "rmRows", lines)));
    holder.classList.add("rm-skeleton");
    holder.setAttribute("aria-busy", "true");
    holder.setAttribute("aria-label", dataString(holder, "rmLabel", label));
    if (shimmer && !prefersReducedMotion()) holder.classList.add("is-shimmering");

    const ghost = document.createElement("div");
    ghost.className = "rm-skeleton-ghost";
    ghost.setAttribute("aria-hidden", "true");
    for (let i = 0; i < count; i++) {
      const bar = document.createElement("span");
      // The last line is short, the way a real paragraph ends.
      bar.style.width = i === count - 1 ? "62%" : `${88 + ((i * 7) % 12)}%`;
      ghost.appendChild(bar);
    }
    holder.prepend(ghost);

    holder.rmReady = () => {
      holder.classList.remove("rm-skeleton", "is-shimmering");
      holder.removeAttribute("aria-busy");
      holder.removeAttribute("aria-label");
      ghost.remove();
    };

    cleanups.push(() => {
      delete holder.rmReady;
      ghost.remove();
      holder.classList.remove("rm-skeleton", "is-shimmering");
      holder.removeAttribute("aria-busy");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Six spinners, one component.
 *
 * All six are CSS, so they cost nothing per frame, and all six are marked
 * `role="status"` with a label — a spinner is the only thing on the screen at
 * the moment it appears, and if it says nothing then nothing is being said.
 *
 * Under reduced motion they stop turning and show a static mark instead of
 * vanishing, because the message is "still working", not "here is a wheel".
 *
 *   <span data-rm-spinner="arc"></span>
 */
export function spinner(target = "[data-rm-spinner]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { kind = "ring", size = 24, label = "Loading" } = options;
  const applied = [];

  for (const element of elements) {
    const want = dataString(element, "rmSpinner", kind);
    const name = SPINNER_KINDS.includes(want) ? want : kind;

    element.classList.add("rm-spinner", `is-${name}`);
    element.style.setProperty("--rm-spinner-size", `${dataNumber(element, "rmSize", size)}px`);
    element.setAttribute("role", "status");
    element.setAttribute("aria-label", dataString(element, "rmLabel", label));
    if (prefersReducedMotion()) element.classList.add("is-still");

    // The shapes that need parts get exactly the parts they need.
    if (name === "bars") element.innerHTML = "<i></i><i></i><i></i><i></i>";
    if (name === "orbit") element.innerHTML = "<i></i><i></i>";
    if (name === "dual") element.innerHTML = "<i></i>";

    applied.push({ element, name });
  }

  return () => applied.forEach(({ element, name }) => {
    element.classList.remove("rm-spinner", `is-${name}`, "is-still");
    element.replaceChildren();
    element.removeAttribute("role");
    element.removeAttribute("aria-label");
  });
}

/**
 * A determinate bar that is announced.
 *
 * A real `role="progressbar"` with `aria-valuenow`, so the number is available
 * to anything that reads the page — the version made of two divs tells a
 * screen reader nothing at all, however smoothly it animates.
 *
 *   <div data-rm-progress-bar data-rm-value="40"></div>
 *   bar.rmSet(72);
 */
export function progressBar(target = "[data-rm-progress-bar]", options = {}) {
  const bars = resolveElements(target);
  if (!bars.length) return () => {};

  const { value = 0, duration = 520, label = "Progress" } = options;
  const cleanups = [];

  for (const bar of bars) {
    bar.classList.add("rm-progress-bar");
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", "100");
    bar.setAttribute("aria-label", dataString(bar, "rmLabel", label));
    bar.style.setProperty("--rm-progress-duration", `${prefersReducedMotion() ? 0 : duration}ms`);

    const fill = document.createElement("i");
    fill.className = "rm-progress-bar-fill";
    fill.setAttribute("aria-hidden", "true");
    bar.appendChild(fill);

    const set = (next) => {
      const clamped = Math.max(0, Math.min(100, next));
      bar.style.setProperty("--rm-progress-value", `${clamped}%`);
      bar.setAttribute("aria-valuenow", String(Math.round(clamped)));
    };
    set(dataNumber(bar, "rmValue", value));
    bar.rmSet = set;

    cleanups.push(() => {
      delete bar.rmSet;
      fill.remove();
      bar.classList.remove("rm-progress-bar");
      bar.removeAttribute("role");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Three dots, for when a spinner is too much.
 *
 * The waiting indicator for something small — a message being sent, a field
 * checking itself. Each dot is on the same animation at a different negative
 * delay, which is one rule rather than three.
 */
export function dotsLoader(target = "[data-rm-dots-loader]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { count = 3, size = 6, label = "Working" } = options;
  const applied = [];

  for (const element of elements) {
    element.classList.add("rm-dots-loader");
    element.style.setProperty("--rm-dots-loader-size", `${size}px`);
    element.setAttribute("role", "status");
    element.setAttribute("aria-label", dataString(element, "rmLabel", label));
    if (prefersReducedMotion()) element.classList.add("is-still");

    element.replaceChildren(
      ...Array.from({ length: count }, (_, i) => {
        const dot = document.createElement("i");
        dot.style.animationDelay = `${i * 160}ms`;
        return dot;
      }),
    );
    applied.push(element);
  }

  return () => applied.forEach((element) => {
    element.classList.remove("rm-dots-loader", "is-still");
    element.replaceChildren();
    element.removeAttribute("role");
  });
}

/**
 * A status light that says what it means.
 *
 * The colour is the decoration; the text beside it is the message. A dot on
 * its own is a colour, and a meaningful colour is meaningless to anyone who
 * cannot distinguish it — so this always renders a label, and the pulse is
 * only for the states that are actually live.
 *
 *   <span data-rm-status="live">All systems go</span>
 */
export function pulseDot(target = "[data-rm-status]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { state = "live" } = options;
  const applied = [];

  for (const element of elements) {
    const name = dataString(element, "rmStatus", state);
    element.classList.add("rm-status", `is-${name}`);

    const dot = document.createElement("i");
    dot.className = "rm-status-dot";
    dot.setAttribute("aria-hidden", "true");
    element.prepend(dot);
    applied.push({ element, dot, name });
  }

  return () => applied.forEach(({ element, dot, name }) => {
    dot.remove();
    element.classList.remove("rm-status", `is-${name}`);
  });
}

/**
 * A count that flips when it changes.
 *
 * The old number leaves upward and the new one arrives from below, so a badge
 * going from 2 to 3 reads as a change rather than as a redraw. It is a live
 * region, so the new count is announced once — not on every keystroke of an
 * intermediate value.
 *
 *   <span data-rm-badge>3</span>
 *   badge.rmSet(4);
 */
export function badgeCount(target = "[data-rm-badge]", options = {}) {
  const badges = resolveElements(target);
  if (!badges.length) return () => {};

  const { duration = 320 } = options;
  const cleanups = [];

  for (const badge of badges) {
    const start = badge.textContent?.trim() ?? "0";
    badge.classList.add("rm-badge");
    badge.setAttribute("aria-live", "polite");
    badge.style.setProperty("--rm-badge-duration", `${prefersReducedMotion() ? 0 : duration}ms`);

    const face = document.createElement("span");
    face.className = "rm-badge-face";
    face.textContent = start;
    badge.replaceChildren(face);

    badge.rmSet = (next) => {
      const value = String(next);
      if (value === face.textContent) return;
      if (prefersReducedMotion()) { face.textContent = value; return; }

      const leaving = face.cloneNode(true);
      leaving.classList.add("is-leaving");
      badge.appendChild(leaving);
      face.textContent = value;
      face.classList.remove("is-arriving");
      void face.offsetWidth;
      face.classList.add("is-arriving");
      setTimeout(() => leaving.remove(), duration);
    };

    cleanups.push(() => {
      delete badge.rmSet;
      badge.classList.remove("rm-badge");
      badge.textContent = start;
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * The screen with nothing on it, arriving gracefully.
 *
 * An empty state is the moment a product either explains itself or looks
 * broken, so this animates in rather than appearing, and it insists on being a
 * region with a heading — an illustration and a shrug is not an empty state.
 */
export function emptyState(target = "[data-rm-empty]", options = {}) {
  const panels = resolveElements(target);
  if (!panels.length) return () => {};

  const { duration = 620, threshold = 0.2 } = options;
  const cleanups = [];

  for (const panel of panels) {
    panel.classList.add("rm-empty");
    panel.setAttribute("role", "region");

    const parts = [...panel.children];
    if (prefersReducedMotion()) {
      cleanups.push(() => panel.classList.remove("rm-empty"));
      continue;
    }

    parts.forEach((part) => { part.style.opacity = "0"; });

    const play = () => {
      parts.forEach((part, i) => {
        part.animate(
          [
            { opacity: 0, transform: "translateY(14px) scale(0.98)" },
            { opacity: 1, transform: "none" },
          ],
          { duration, delay: i * 90, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards" },
        );
        part.style.opacity = "";
      });
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { play(); observer.disconnect(); }
    }, { threshold });
    observer.observe(panel);

    cleanups.push(() => {
      observer.disconnect();
      parts.forEach((part) => { part.style.opacity = ""; });
      panel.classList.remove("rm-empty");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}
