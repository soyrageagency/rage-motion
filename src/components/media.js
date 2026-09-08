/**
 * Media and list effects — the agency-portfolio staples.
 *
 *   • imageReveal()  — a curtain wipes away to uncover an image.
 *   • pixelate()     — a pixel grid dissolves on hover.
 *   • hoverPreview() — a list of links that shows a floating image per row.
 *   • marquee()      — an infinite ticker that never jumps.
 *   • ticker()       — the same, driven by scroll direction.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import {
  clamp, dataNumber, dataString, EASE, lerp, onFrame,
  prefersReducedMotion, resolveElements, watch,
} from "../core/motion.js";

/**
 * Uncover an image with a sliding curtain.
 *
 * The image is also scaled slightly and settles back as the curtain leaves,
 * which is what stops it looking like a rectangle sliding off a static
 * picture.
 */
export function imageReveal(target = "[data-rm-image-reveal]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const {
    direction = "left", duration = 1100, color = "#0E0E0E",
    threshold = 0.25, easing = EASE.inOut, zoom = 1.12,
  } = options;

  const AXIS = {
    left: ["inset(0 100% 0 0)", "inset(0 0 0 0)", "inset(0 0 0 100%)"],
    right: ["inset(0 0 0 100%)", "inset(0 0 0 0)", "inset(0 100% 0 0)"],
    up: ["inset(100% 0 0 0)", "inset(0 0 0 0)", "inset(0 0 100% 0)"],
    down: ["inset(0 0 100% 0)", "inset(0 0 0 0)", "inset(100% 0 0 0)"],
  };

  const cleanups = [];

  for (const element of elements) {
    const dir = dataString(element, "rmImageReveal", direction);
    const [, mid, out] = AXIS[dir] ?? AXIS.left;
    element.classList.add("rm-image-reveal");

    const curtain = document.createElement("span");
    curtain.className = "rm-curtain";
    curtain.setAttribute("aria-hidden", "true");
    curtain.style.background = dataString(element, "rmColor", color);
    element.appendChild(curtain);

    const media = element.querySelector("img, video, picture");
    if (media && !prefersReducedMotion()) {
      media.style.transform = `scale(${zoom})`;
      media.style.willChange = "transform";
    }

    const run = () => {
      const span = dataNumber(element, "rmDuration", duration);
      if (prefersReducedMotion()) {
        curtain.remove();
        if (media) media.style.transform = "";
        element.classList.add("rm-revealed");
        return;
      }
      curtain.animate([{ clipPath: mid }, { clipPath: out }], {
        duration: span, easing, fill: "forwards",
      }).finished.then(() => curtain.remove()).catch(() => curtain.remove());

      if (media) {
        media.animate([{ transform: `scale(${zoom})` }, { transform: "scale(1)" }], {
          duration: span * 1.25, easing, fill: "forwards",
        }).finished.then(() => {
          media.style.transform = "";
          media.style.willChange = "";
        }).catch(() => {});
      }
      element.classList.add("rm-revealed");
    };

    cleanups.push(watch(element, run, { threshold, once: true }));
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A pixel grid that dissolves on hover.
 *
 * Built from real elements rather than a canvas so the pixels can be styled,
 * and capped at a sane count — a 40×40 grid is 1,600 nodes per card, which is
 * fine once and ruinous on a page of twelve.
 */
export function pixelate(target = "[data-rm-pixel]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { columns = 14, color = "#0E0E0E", duration = 620, stagger = 14 } = options;
  const cleanups = [];

  for (const element of elements) {
    const cols = Math.min(24, dataNumber(element, "rmColumns", columns));
    const box = element.getBoundingClientRect();
    const rows = Math.max(1, Math.round((box.height / Math.max(1, box.width)) * cols));

    element.classList.add("rm-pixel");
    const grid = document.createElement("span");
    grid.className = "rm-pixel-grid";
    grid.setAttribute("aria-hidden", "true");
    grid.style.setProperty("--rm-pixel-cols", String(cols));
    grid.style.setProperty("--rm-pixel-rows", String(rows));

    const cells = [];
    for (let i = 0; i < cols * rows; i++) {
      const cell = document.createElement("i");
      cell.style.background = dataString(element, "rmColor", color);
      grid.appendChild(cell);
      cells.push(cell);
    }
    element.appendChild(grid);

    // A random order per card, so two cards side by side do not dissolve in
    // lockstep — that is what makes it read as a grid rather than an effect.
    const order = cells.map((_, i) => i).sort(() => Math.random() - 0.5);

    const play = (show) => {
      if (prefersReducedMotion()) {
        cells.forEach((cell) => { cell.style.opacity = show ? "1" : "0"; });
        return;
      }
      order.forEach((index, position) => {
        cells[index].animate(
          [{ opacity: show ? 0 : 1 }, { opacity: show ? 1 : 0 }],
          { duration, delay: (position / cells.length) * stagger * cols, fill: "forwards", easing: "linear" },
        );
      });
    };

    const onEnter = () => play(true);
    const onLeave = () => play(false);
    element.addEventListener("pointerenter", onEnter);
    element.addEventListener("pointerleave", onLeave);

    cleanups.push(() => {
      element.removeEventListener("pointerenter", onEnter);
      element.removeEventListener("pointerleave", onLeave);
      grid.remove();
      element.classList.remove("rm-pixel");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A list of links, each showing a floating image as you hover it.
 *
 * The signature interaction of a studio index page. One shared floating
 * element rather than one per row, and it lags behind the pointer so it feels
 * carried rather than pinned.
 */
export function hoverPreview(target = "[data-rm-preview]", options = {}) {
  const containers = resolveElements(target);
  if (!containers.length) return () => {};
  if (typeof matchMedia === "function" && !matchMedia("(pointer: fine)").matches) return () => {};

  const { selector = "[data-rm-preview-src]", width = 300, ease = 0.14, rotate = 6 } = options;
  const cleanups = [];

  for (const container of containers) {
    const rows = [...container.querySelectorAll(selector)];
    if (!rows.length) continue;

    const floater = document.createElement("div");
    floater.className = "rm-preview";
    floater.setAttribute("aria-hidden", "true");
    floater.style.setProperty("--rm-preview-width", `${width}px`);
    const image = document.createElement("img");
    image.alt = "";
    image.loading = "lazy";
    floater.appendChild(image);
    container.appendChild(floater);

    const pointer = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let active = false;
    let lastX = 0;

    const onMove = (event) => {
      const box = container.getBoundingClientRect();
      pointer.x = event.clientX - box.left;
      pointer.y = event.clientY - box.top;
    };

    const enterRow = (row) => {
      const src = row.dataset.rmPreviewSrc;
      if (!src) return;
      image.src = src;
      active = true;
      floater.classList.add("is-visible");
    };
    const leaveRow = () => {
      active = false;
      floater.classList.remove("is-visible");
    };

    container.addEventListener("pointermove", onMove, { passive: true });
    for (const row of rows) {
      row.addEventListener("pointerenter", () => enterRow(row));
      row.addEventListener("pointerleave", leaveRow);
    }

    const reduced = prefersReducedMotion();
    const stopFrame = onFrame(() => {
      if (!active && !floater.classList.contains("is-visible")) return;
      const follow = reduced ? 1 : ease;
      current.x = lerp(current.x, pointer.x, follow);
      current.y = lerp(current.y, pointer.y, follow);
      // Tilt with horizontal velocity: the image leans into the movement.
      const velocity = clamp((current.x - lastX) / 12, -1, 1);
      lastX = current.x;
      floater.style.transform =
        `translate3d(${current.x.toFixed(1)}px, ${current.y.toFixed(1)}px, 0) translate(-50%, -50%) ` +
        `rotate(${reduced ? 0 : (velocity * rotate).toFixed(2)}deg)`;
    });

    cleanups.push(() => {
      stopFrame();
      container.removeEventListener("pointermove", onMove);
      floater.remove();
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * An infinite marquee.
 *
 * The content is duplicated until it comfortably exceeds the viewport, then
 * translated by exactly one copy's width and reset. Animating to `-100%` of a
 * single copy is the common shortcut and it visibly jumps whenever the content
 * is narrower than the screen.
 */
export function marquee(target = "[data-rm-marquee]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { speed = 60, direction = "left", pauseOnHover = true, gap = 48 } = options;
  const cleanups = [];

  for (const element of elements) {
    const original = element.innerHTML;
    const pxPerSecond = dataNumber(element, "rmSpeed", speed);
    const dir = dataString(element, "rmDirection", direction) === "right" ? 1 : -1;

    element.classList.add("rm-marquee");
    const track = document.createElement("div");
    track.className = "rm-marquee-track";
    track.style.gap = `${gap}px`;

    const group = document.createElement("div");
    group.className = "rm-marquee-group";
    group.style.gap = `${gap}px`;
    group.innerHTML = original;
    track.appendChild(group);
    element.replaceChildren(track);

    let copyWidth = 0;
    const fill = () => {
      // Rebuild from one copy, then add copies until the track is at least
      // twice the viewport: enough that a reset is never visible.
      track.replaceChildren(group);
      copyWidth = group.getBoundingClientRect().width + gap;
      if (copyWidth <= 0) return;
      const needed = Math.ceil((innerWidth * 2) / copyWidth);
      for (let i = 0; i < needed; i++) {
        const clone = group.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        track.appendChild(clone);
      }
    };
    fill();
    addEventListener("resize", fill);

    let offset = dir === -1 ? 0 : -copyWidth;
    let last = 0;
    let paused = false;

    if (pauseOnHover) {
      element.addEventListener("pointerenter", () => { paused = true; });
      element.addEventListener("pointerleave", () => { paused = false; });
    }

    // Reduced motion leaves the content in place and scrollable, rather than
    // an endlessly moving strip that cannot be read.
    if (prefersReducedMotion()) {
      element.classList.add("is-static");
      cleanups.push(() => { removeEventListener("resize", fill); element.innerHTML = original; });
      continue;
    }

    const stopFrame = onFrame((now) => {
      const delta = last ? (now - last) / 1000 : 0;
      last = now;
      if (!paused && copyWidth > 0) {
        offset += dir * pxPerSecond * delta;
        // Wrap by exactly one copy, so the seam always lands on identical content.
        if (offset <= -copyWidth) offset += copyWidth;
        if (offset >= 0 && dir === 1) offset -= copyWidth;
      }
      track.style.transform = `translate3d(${offset.toFixed(2)}px,0,0)`;
    });

    cleanups.push(() => {
      stopFrame();
      removeEventListener("resize", fill);
      element.classList.remove("rm-marquee");
      element.innerHTML = original;
    });
  }

  return () => cleanups.forEach((stop) => stop());
}
