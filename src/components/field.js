/**
 * Backgrounds that are not the same background everyone else shipped.
 *
 *   • waves()     — a field of lines flowing, parting around the pointer.
 *   • retroGrid() — a perspective grid running to the horizon.
 *   • dotGrid()   — a dot matrix that reacts to the pointer.
 *   • grain()     — film grain, as a tiled texture.
 *
 * The two backgrounds this file replaces — a blurred three-colour aurora and a
 * constellation of dots joined by lines — were dropped on purpose. They are
 * the two most-generated backgrounds on the web, they say nothing about the
 * site they are on, and any visitor who has seen a landing page this year has
 * seen both. What is here reads as a choice instead.
 *
 * Everything in this file:
 *
 *   • stops painting when the tab is hidden or the section scrolls away;
 *   • caps the device pixel ratio, since a 3× canvas is nine times the pixels
 *     for a field nobody is inspecting closely;
 *   • holds still under reduced motion rather than disappearing, so text over
 *     it keeps its background and its contrast.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import {
  clamp, dataNumber, onFrame, prefersReducedMotion, whileVisible,
} from "../core/motion.js";

const host = (target) => (typeof target === "string" ? document.querySelector(target) : target);

/** A canvas sized to its host, at a sane pixel ratio. */
function surface(parent, className) {
  const canvas = document.createElement("canvas");
  canvas.className = className;
  canvas.setAttribute("aria-hidden", "true");
  parent.prepend(canvas);
  const ctx = canvas.getContext("2d");

  let width = 0;
  let height = 0;
  const fit = () => {
    const box = parent.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    width = Math.max(1, box.width);
    height = Math.max(1, box.height);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  fit();

  return { canvas, ctx, fit, get width() { return width; }, get height() { return height; } };
}

/**
 * A field of lines flowing across the section, parting around the pointer.
 *
 * Each line is a sine with its own phase and a slow drift, and the pointer
 * pushes the nearest points aside with a falloff — so the field behaves like
 * cloth being brushed rather than a set of independent wiggles. Points are
 * spaced by pixel budget, not by count, so a phone draws a coarser field
 * instead of the same work at a quarter of the frame rate.
 */
export function waves(target, options = {}) {
  const parent = host(target);
  if (!parent) return () => {};

  const {
    color = "rgba(42,167,228,0.30)",
    lines = 26,
    amplitude = 26,
    wavelength = 340,
    speed = 0.00022,
    pointerRadius = 190,
    pointerLift = 34,
    lineWidth = 1,
  } = options;

  const layer = surface(parent, "rm-waves");
  const { ctx } = layer;
  const resizeObserver = new ResizeObserver(layer.fit);
  resizeObserver.observe(parent);

  const pointer = { x: -9999, y: -9999 };
  const onMove = (event) => {
    const box = parent.getBoundingClientRect();
    pointer.x = event.clientX - box.left;
    pointer.y = event.clientY - box.top;
  };
  const onLeave = () => { pointer.x = -9999; pointer.y = -9999; };
  parent.addEventListener("pointermove", onMove, { passive: true });
  parent.addEventListener("pointerleave", onLeave);

  const draw = (time) => {
    const { width, height } = layer;
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;

    const gap = height / (lines + 1);
    // One point every 12px or so: fine enough to read as a curve, coarse
    // enough that a wide monitor is not drawing three thousand segments.
    const step = Math.max(8, Math.round(width / 90));

    for (let i = 1; i <= lines; i++) {
      const baseY = gap * i;
      const phase = i * 0.6;
      ctx.beginPath();
      for (let x = 0; x <= width + step; x += step) {
        const wave = Math.sin(x / wavelength + time * speed + phase) * amplitude;
        // Lines further down move a little more, which gives the field depth.
        const depth = 0.4 + (i / lines) * 0.8;
        let y = baseY + wave * depth;

        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance < pointerRadius) {
          // Push away from the pointer, strongest at the centre.
          const force = (1 - distance / pointerRadius) ** 2;
          y += (dy / (distance || 1)) * force * pointerLift;
        }

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  };

  const still = prefersReducedMotion();
  const stopVisibility = whileVisible(parent, () => onFrame((now) => draw(still ? 0 : now)));
  if (still) draw(0);

  return () => {
    stopVisibility();
    resizeObserver.disconnect();
    parent.removeEventListener("pointermove", onMove);
    parent.removeEventListener("pointerleave", onLeave);
    layer.canvas.remove();
  };
}

/**
 * A grid running to the horizon.
 *
 * Pure CSS: a plane rotated in perspective with a repeating gradient scrolling
 * along it, and a fade where it meets the horizon. No canvas, no per-frame
 * work — the compositor animates it on its own thread, so it costs nothing
 * even behind a busy page.
 */
export function retroGrid(target, options = {}) {
  const parent = host(target);
  if (!parent) return () => {};

  const {
    color = "rgba(42,167,228,0.35)", cell = 60, speed = 12000, angle = 65, fade = 0.85,
  } = options;

  const layer = document.createElement("div");
  layer.className = "rm-retro";
  layer.setAttribute("aria-hidden", "true");
  layer.style.setProperty("--rm-retro-color", color);
  layer.style.setProperty("--rm-retro-cell", `${cell}px`);
  layer.style.setProperty("--rm-retro-speed", `${speed}ms`);
  layer.style.setProperty("--rm-retro-angle", `${angle}deg`);
  layer.style.setProperty("--rm-retro-fade", String(fade));
  layer.innerHTML = '<div class="rm-retro-plane"></div>';
  if (prefersReducedMotion()) layer.classList.add("is-still");

  parent.prepend(layer);
  return () => layer.remove();
}

/**
 * A dot matrix that reacts to the pointer.
 *
 * Dots near the pointer grow and shift away from it, and settle back on a
 * spring. The whole grid is one canvas and one pass per frame — the version of
 * this built from DOM elements is a thousand nodes with a thousand transforms,
 * and it is why that version stutters on a laptop.
 */
export function dotGrid(target, options = {}) {
  const parent = host(target);
  if (!parent) return () => {};

  const {
    gap = 26, dot = 1.6, color = "rgba(108,105,95,0.5)", active = "#2aa7e4",
    radius = 150, push = 12, grow = 2.6, ease = 0.14,
  } = options;

  const layer = surface(parent, "rm-dots");
  const { ctx } = layer;
  let points = [];

  const build = () => {
    layer.fit();
    points = [];
    const cols = Math.ceil(layer.width / gap);
    const rows = Math.ceil(layer.height / gap);
    const offsetX = (layer.width - (cols - 1) * gap) / 2;
    const offsetY = (layer.height - (rows - 1) * gap) / 2;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        points.push({ x: offsetX + x * gap, y: offsetY + y * gap, dx: 0, dy: 0, force: 0 });
      }
    }
  };
  build();

  const resizeObserver = new ResizeObserver(build);
  resizeObserver.observe(parent);

  const pointer = { x: -9999, y: -9999 };
  const onMove = (event) => {
    const box = parent.getBoundingClientRect();
    pointer.x = event.clientX - box.left;
    pointer.y = event.clientY - box.top;
  };
  const onLeave = () => { pointer.x = -9999; pointer.y = -9999; };
  parent.addEventListener("pointermove", onMove, { passive: true });
  parent.addEventListener("pointerleave", onLeave);

  const draw = (react) => {
    ctx.clearRect(0, 0, layer.width, layer.height);
    for (const point of points) {
      let goalForce = 0;
      let goalX = 0;
      let goalY = 0;

      if (react) {
        const dx = point.x - pointer.x;
        const dy = point.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance < radius) {
          goalForce = 1 - distance / radius;
          goalX = (dx / (distance || 1)) * goalForce * push;
          goalY = (dy / (distance || 1)) * goalForce * push;
        }
      }

      point.force += (goalForce - point.force) * ease;
      point.dx += (goalX - point.dx) * ease;
      point.dy += (goalY - point.dy) * ease;

      ctx.beginPath();
      ctx.fillStyle = point.force > 0.05 ? active : color;
      ctx.globalAlpha = 0.45 + point.force * 0.55;
      ctx.arc(point.x + point.dx, point.y + point.dy, dot * (1 + point.force * grow), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  // Reduced motion keeps the matrix and drops the reaction: the texture is the
  // point, the springiness is the flourish.
  const still = prefersReducedMotion();
  const stopVisibility = whileVisible(parent, () => onFrame(() => draw(!still)));
  if (still) draw(false);

  return () => {
    stopVisibility();
    resizeObserver.disconnect();
    parent.removeEventListener("pointermove", onMove);
    parent.removeEventListener("pointerleave", onLeave);
    layer.canvas.remove();
  };
}

/**
 * Film grain.
 *
 * Generated once into a small tiled texture and moved, rather than regenerated
 * per frame. A grain layer that redraws every frame is the most expensive
 * "subtle" effect on the web, and at four per cent opacity nobody can tell the
 * difference.
 */
export function grain(target = document.body, options = {}) {
  const parent = host(target);
  if (!parent) return () => {};

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
  layer.style.opacity = String(clamp(dataNumber(parent, "rmOpacity", opacity), 0, 0.2));
  if (shift && !prefersReducedMotion()) layer.classList.add("is-moving");
  parent.appendChild(layer);

  return () => layer.remove();
}

