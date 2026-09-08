/**
 * Decoration.
 *
 *   • dots()     — a dot field, drifting.
 *   • stripes()  — diagonal hatching that travels.
 *   • corners()  — brackets that draw themselves around an element.
 *   • scanline() — a CRT line passing down a panel.
 *   • mesh()     — a mesh gradient that moves, in CSS.
 *   • starfield() — depth, on a canvas, with parallax on scroll.
 *
 * All of it is ornament with no content in it, so all of it is `aria-hidden`
 * and all of it stops entirely under reduced motion. Four of the six are pure
 * CSS with no per-frame JavaScript at all; the two that are not say why in
 * their own comment.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import {
  dataNumber, dataString, onFrame, prefersReducedMotion, resolveElements, whileVisible,
} from "../core/motion.js";

/** Add an `aria-hidden` layer behind an element's content. */
function layerFor(element, className, still) {
  element.classList.add(`${className}-host`);
  const layer = document.createElement("div");
  layer.className = className;
  layer.setAttribute("aria-hidden", "true");
  if (still) layer.classList.add("is-still");
  element.prepend(layer);
  return layer;
}

/**
 * A dot field, drifting.
 *
 * A repeating radial gradient rather than elements — one paint for the whole
 * field however large it is, where a DOM version is one node per dot and a
 * canvas version is a frame budget for something that never changes shape.
 */
export function dots(target = "[data-rm-dots]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { gap = 22, size = 1.4, color = "rgba(255,255,255,0.16)", speed = 24000 } = options;
  const cleanups = [];

  for (const element of elements) {
    const layer = layerFor(element, "rm-dots-decor", prefersReducedMotion());
    layer.style.setProperty("--rm-dots-gap", `${dataNumber(element, "rmGap", gap)}px`);
    layer.style.setProperty("--rm-dots-size", `${size}px`);
    layer.style.setProperty("--rm-dots-color", dataString(element, "rmColor", color));
    layer.style.setProperty("--rm-dots-speed", `${speed}ms`);
    cleanups.push(() => { layer.remove(); element.classList.remove("rm-dots-decor-host"); });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Diagonal hatching that travels.
 *
 * A repeating linear gradient moved by background-position, which the
 * compositor handles on its own. Useful for a "work in progress" band, a
 * disabled state, or anywhere a flat block wants texture.
 */
export function stripes(target = "[data-rm-stripes]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { width = 10, angle = 45, color = "rgba(255,255,255,0.06)", speed = 1600 } = options;
  const cleanups = [];

  for (const element of elements) {
    const layer = layerFor(element, "rm-stripes", prefersReducedMotion());
    layer.style.setProperty("--rm-stripes-width", `${dataNumber(element, "rmWidth", width)}px`);
    layer.style.setProperty("--rm-stripes-angle", `${angle}deg`);
    layer.style.setProperty("--rm-stripes-color", dataString(element, "rmColor", color));
    layer.style.setProperty("--rm-stripes-speed", `${speed}ms`);
    cleanups.push(() => { layer.remove(); element.classList.remove("rm-stripes-host"); });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Brackets that draw themselves around an element.
 *
 * Four corners on `clip-path`, drawn on hover or on focus-within so a keyboard
 * user gets the same emphasis a mouse user does. Corners rather than a border
 * because a border changes the box; these sit outside it and cannot move
 * anything.
 */
export function corners(target = "[data-rm-corners]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { size = 16, width = 1.5, color = "#2aa7e4", offset = 8, duration = 320 } = options;
  const cleanups = [];

  for (const element of elements) {
    element.classList.add("rm-corners");
    element.style.setProperty("--rm-corners-size", `${dataNumber(element, "rmSize", size)}px`);
    element.style.setProperty("--rm-corners-width", `${width}px`);
    element.style.setProperty("--rm-corners-color", dataString(element, "rmColor", color));
    element.style.setProperty("--rm-corners-offset", `${offset}px`);
    element.style.setProperty("--rm-corners-duration", `${prefersReducedMotion() ? 0 : duration}ms`);

    const layer = document.createElement("span");
    layer.className = "rm-corners-layer";
    layer.setAttribute("aria-hidden", "true");
    layer.innerHTML = "<i></i><i></i><i></i><i></i>";
    element.appendChild(layer);

    cleanups.push(() => { layer.remove(); element.classList.remove("rm-corners"); });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A CRT line passing down a panel.
 *
 * One gradient sliding on a loop, with a faint horizontal rule pattern under
 * it. Overdone it is a costume; at low opacity over a dark panel it just adds
 * the sense that something is live.
 */
export function scanline(target = "[data-rm-scanline]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { color = "rgba(42,167,228,0.5)", speed = 5200, lines = true } = options;
  const cleanups = [];

  for (const element of elements) {
    const layer = layerFor(element, "rm-scanline", prefersReducedMotion());
    layer.style.setProperty("--rm-scanline-color", dataString(element, "rmColor", color));
    layer.style.setProperty("--rm-scanline-speed", `${dataNumber(element, "rmSpeed", speed)}ms`);
    layer.innerHTML = '<i class="rm-scanline-bar"></i>';
    if (lines) layer.classList.add("has-lines");
    cleanups.push(() => { layer.remove(); element.classList.remove("rm-scanline-host"); });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A mesh gradient that moves, in CSS.
 *
 * Four radial gradients on long, offset transforms under a blur. The blur is
 * what makes it a mesh rather than four visible blobs, and doing it in CSS
 * means the compositor animates it without a frame of main-thread work — a
 * canvas mesh looks the same and costs a budget you will want elsewhere.
 */
export function mesh(target = "[data-rm-mesh]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const {
    colors = ["#2aa7e4", "#7b5cf0", "#d28c65", "#f4d738"],
    blur = 70,
    speed = 22000,
    opacity = 0.5,
  } = options;
  const cleanups = [];

  for (const element of elements) {
    const layer = layerFor(element, "rm-mesh", prefersReducedMotion());
    layer.style.setProperty("--rm-mesh-blur", `${blur}px`);
    layer.style.setProperty("--rm-mesh-speed", `${dataNumber(element, "rmSpeed", speed)}ms`);
    layer.style.setProperty("--rm-mesh-opacity", String(opacity));
    layer.innerHTML = colors
      .map((color, i) => `<i style="--rm-mesh-color:${color};--rm-mesh-index:${i}"></i>`)
      .join("");
    cleanups.push(() => { layer.remove(); element.classList.remove("rm-mesh-host"); });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Depth, on a canvas, with parallax on scroll.
 *
 * This one is canvas rather than CSS because it is the one thing the others
 * are not: hundreds of independent points at three depths, drifting at
 * different rates. As DOM that is hundreds of nodes; as one canvas it is a
 * single pass, and it stops entirely when the section is off screen.
 *
 * The nearer layer moves further with scroll, which is the whole illusion.
 */
export function starfield(target = "[data-rm-stars]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { count = 160, color = "#f1eee9", drift = 0.04, parallax = 0.22, layers = 3 } = options;
  const cleanups = [];

  for (const element of elements) {
    element.classList.add("rm-stars-host");
    const canvas = document.createElement("canvas");
    canvas.className = "rm-stars";
    canvas.setAttribute("aria-hidden", "true");
    element.prepend(canvas);
    const ctx = canvas.getContext("2d");

    let width = 0;
    let height = 0;
    let stars = [];

    const build = () => {
      const box = element.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      width = Math.max(1, box.width);
      height = Math.max(1, box.height);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const many = Math.min(400, dataNumber(element, "rmStars", count));
      stars = Array.from({ length: many }, () => {
        const depth = 1 + Math.floor(Math.random() * layers);
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          depth,
          size: 0.5 + (layers - depth + 1) * 0.45,
          alpha: 0.25 + ((layers - depth + 1) / layers) * 0.6,
        };
      });
    };
    build();

    const resizeObserver = new ResizeObserver(build);
    resizeObserver.observe(element);

    const still = prefersReducedMotion();
    const draw = (now) => {
      const box = element.getBoundingClientRect();
      // How far this section has travelled through the viewport, -1 to 1.
      const travel = still ? 0 : (innerHeight / 2 - (box.top + box.height / 2)) / innerHeight;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = dataString(element, "rmColor", color);
      for (const star of stars) {
        const shift = travel * parallax * 100 * (layers - star.depth + 1);
        const wander = still ? 0 : Math.sin(now * drift * 0.001 + star.x) * star.depth;
        // Wrap rather than clamp, so nothing piles up at an edge.
        const y = ((star.y + shift + wander) % height + height) % height;
        ctx.globalAlpha = star.alpha;
        ctx.beginPath();
        ctx.arc(star.x, y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const stopVisibility = whileVisible(element, () => onFrame(draw));
    if (still) draw(0);

    cleanups.push(() => {
      stopVisibility();
      resizeObserver.disconnect();
      canvas.remove();
      element.classList.remove("rm-stars-host");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}
