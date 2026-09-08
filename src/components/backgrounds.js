/**
 * Generative backgrounds.
 *
 *   • aurora()    — slow drifting colour, rendered in CSS.
 *   • particles() — a constellation field that reacts to the pointer.
 *   • grain()     — film grain, as a tiled noise texture.
 *
 * Backgrounds are where award-site work most often ruins a page, because they
 * run forever whether or not anyone is looking. Everything here:
 *
 *   • stops when the tab is hidden, and when it scrolls out of view;
 *   • caps the device pixel ratio, since a 3× canvas is nine times the pixels
 *     for a blurred field nobody can resolve anyway;
 *   • falls back to a still gradient under reduced motion, rather than
 *     vanishing and leaving white text on white.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import { onFrame, prefersReducedMotion } from "../core/motion.js";

/**
 * Run `start` only while `element` is on screen and the tab is visible.
 *
 * Both conditions matter and they are independent: a background that keeps
 * painting in a hidden tab drains a laptop battery for nobody, and one that
 * keeps painting after it has scrolled away burns frames the visible content
 * needs.
 */
function whileVisible(element, start) {
  let stopTask = null;
  let onScreen = false;

  const sync = () => {
    const shouldRun = onScreen && !document.hidden;
    if (shouldRun && !stopTask) stopTask = start();
    else if (!shouldRun && stopTask) { stopTask(); stopTask = null; }
  };

  const observer = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    sync();
  });
  observer.observe(element);

  document.addEventListener("visibilitychange", sync);

  return () => {
    observer.disconnect();
    document.removeEventListener("visibilitychange", sync);
    stopTask?.();
    stopTask = null;
  };
}

/**
 * A drifting aurora.
 *
 * Three blurred radial gradients on long, offset animations. Done in CSS
 * rather than canvas because the compositor can run it without touching the
 * main thread at all — a canvas version would look identical and cost a frame
 * budget this does not.
 */
export function aurora(target, options = {}) {
  const host = typeof target === "string" ? document.querySelector(target) : target;
  if (!host) return () => {};

  const {
    colors = ["#3b9ef0", "#7b5cf0", "#f05c9e"],
    blur = 90,
    speed = 18000,
    opacity = 0.55,
  } = options;

  const layer = document.createElement("div");
  layer.className = "rm-aurora";
  layer.setAttribute("aria-hidden", "true");
  layer.style.setProperty("--rm-aurora-blur", `${blur}px`);
  layer.style.setProperty("--rm-aurora-speed", `${speed}ms`);
  layer.style.setProperty("--rm-aurora-opacity", String(opacity));
  layer.innerHTML = colors
    .map((color, i) => `<span style="--rm-aurora-color:${color};--rm-aurora-index:${i}"></span>`)
    .join("");

  if (prefersReducedMotion()) layer.classList.add("is-still");
  host.prepend(layer);

  return () => layer.remove();
}

/**
 * A particle constellation that reacts to the pointer.
 *
 * Lines are drawn between near neighbours, which is what turns a dot field
 * into something that reads as a network. The neighbour search is capped by
 * distance and the particle count scales with the viewport, so a phone does
 * not run the same load as a desktop.
 */
export function particles(target, options = {}) {
  const host = typeof target === "string" ? document.querySelector(target) : target;
  if (!host) return () => {};

  const {
    density = 0.00008,
    maxParticles = 140,
    color = "#3b9ef0",
    linkDistance = 130,
    speed = 0.22,
    pointerRadius = 150,
    size = 1.8,
  } = options;

  const canvas = document.createElement("canvas");
  canvas.className = "rm-particles";
  canvas.setAttribute("aria-hidden", "true");
  host.prepend(canvas);
  const ctx = canvas.getContext("2d");

  let width = 0;
  let height = 0;
  let field = [];

  const build = () => {
    const box = host.getBoundingClientRect();
    // Cap the ratio: a 3× canvas is nine times the pixels to fill each frame.
    const dpr = Math.min(devicePixelRatio || 1, 2);
    width = Math.max(1, box.width);
    height = Math.max(1, box.height);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(maxParticles, Math.round(width * height * density));
    field = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
    }));
  };
  build();

  const resizeObserver = new ResizeObserver(build);
  resizeObserver.observe(host);

  const pointer = { x: -9999, y: -9999 };
  const onMove = (event) => {
    const box = host.getBoundingClientRect();
    pointer.x = event.clientX - box.left;
    pointer.y = event.clientY - box.top;
  };
  const onLeave = () => { pointer.x = -9999; pointer.y = -9999; };
  host.addEventListener("pointermove", onMove, { passive: true });
  host.addEventListener("pointerleave", onLeave);

  const draw = (moving) => {
    ctx.clearRect(0, 0, width, height);

    for (const p of field) {
      if (moving) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      }
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.85;
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Neighbour links. O(n²) over a capped, small n — with 140 particles that
    // is ten thousand cheap comparisons, well inside a frame.
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    for (let i = 0; i < field.length; i++) {
      for (let j = i + 1; j < field.length; j++) {
        const dx = field[i].x - field[j].x;
        const dy = field[i].y - field[j].y;
        const distance = Math.hypot(dx, dy);
        if (distance > linkDistance) continue;
        ctx.globalAlpha = (1 - distance / linkDistance) * 0.32;
        ctx.beginPath();
        ctx.moveTo(field[i].x, field[i].y);
        ctx.lineTo(field[j].x, field[j].y);
        ctx.stroke();
      }
      // A link to the pointer, so the field acknowledges the visitor.
      const pdx = field[i].x - pointer.x;
      const pdy = field[i].y - pointer.y;
      const pd = Math.hypot(pdx, pdy);
      if (pd < pointerRadius) {
        ctx.globalAlpha = (1 - pd / pointerRadius) * 0.55;
        ctx.beginPath();
        ctx.moveTo(field[i].x, field[i].y);
        ctx.lineTo(pointer.x, pointer.y);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  };

  // Reduced motion keeps the constellation and the pointer links, and stops
  // the drift. The visual stays; the perpetual movement goes.
  const still = prefersReducedMotion();
  const stopVisibility = whileVisible(host, () => onFrame(() => draw(!still)));
  if (still) draw(false);

  return () => {
    stopVisibility();
    resizeObserver.disconnect();
    host.removeEventListener("pointermove", onMove);
    host.removeEventListener("pointerleave", onLeave);
    canvas.remove();
  };
}

/**
 * Film grain.
 *
 * Generated once into a small tiled texture rather than animated per frame.
 * A grain layer that regenerates every frame is the single most expensive
 * "subtle" effect on the web, and at normal opacity nobody can tell.
 */
export function grain(target = document.body, options = {}) {
  const host = typeof target === "string" ? document.querySelector(target) : target;
  if (!host) return () => {};

  const { opacity = 0.045, tile = 128, animate: shift = true } = options;

  const source = document.createElement("canvas");
  source.width = tile;
  source.height = tile;
  const ctx = source.getContext("2d");
  const image = ctx.createImageData(tile, tile);
  for (let i = 0; i < image.data.length; i += 4) {
    const value = 128 + (Math.random() - 0.5) * 255;
    image.data[i] = image.data[i + 1] = image.data[i + 2] = value;
    image.data[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);

  const layer = document.createElement("div");
  layer.className = "rm-grain";
  layer.setAttribute("aria-hidden", "true");
  layer.style.backgroundImage = `url(${source.toDataURL()})`;
  layer.style.opacity = String(opacity);
  if (shift && !prefersReducedMotion()) layer.classList.add("is-moving");
  host.appendChild(layer);

  return () => layer.remove();
}
