/**
 * Decoration, the second set.
 *
 *   • rings()      — rings that expand outward from a point and fade.
 *   • hexGrid()    — a honeycomb lattice that lights up near the pointer.
 *   • plusGrid()   — a field of small plus marks.
 *   • diagonals()  — hatching that travels, with a soft edge.
 *   • topography() — contour lines, drifting.
 *   • circuit()    — traces with pulses running along them.
 *   • vignette()   — an edge darkening that deepens as you scroll in.
 *   • halftone()   — a dot matrix whose dots grow toward the pointer.
 *
 * `decor.js` holds the first six. The rule is the same here and it is the only
 * rule that matters for ornament: none of it carries meaning, so all of it is
 * `aria-hidden`, none of it is in the tab order, and every one of these stops
 * completely under reduced motion rather than merely slowing down.
 *
 * Five of the eight are a single painted layer with no per-frame JavaScript at
 * all. The three that do run a frame callback — the two that follow the
 * pointer and the one that reads the scroll — say so in their own comment and
 * share the one `onFrame` loop the whole library uses.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import {
  clamp, dataNumber, dataString, onFrame, prefersReducedMotion, resolveElements, whileVisible,
} from "../core/motion.js";

const SVG = "http://www.w3.org/2000/svg";

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
 * Rings that expand outward from a point and fade.
 *
 * Concentric circles on one CSS animation at different negative delays, so all
 * of them are phases of a single rule rather than a stack of separate
 * keyframes — and adding a ring costs a `<i>` rather than another animation.
 *
 * They scale rather than change radius, which keeps the whole effect on the
 * compositor. A ring that animates `width` repaints its parent every frame.
 */
export function rings(target = "[data-rm-rings]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { count = 4, size = 220, speed = 4200, color = "rgba(42,167,228,0.30)" } = options;
  const cleanups = [];

  for (const element of elements) {
    const still = prefersReducedMotion();
    const layer = layerFor(element, "rm-rings", still);
    const many = clamp(dataNumber(element, "rmRings", count), 1, 8);
    const beat = dataNumber(element, "rmSpeed", speed);

    layer.style.setProperty("--rm-rings-size", `${dataNumber(element, "rmSize", size)}px`);
    layer.style.setProperty("--rm-rings-speed", `${beat}ms`);
    layer.style.setProperty("--rm-rings-color", dataString(element, "rmColor", color));

    for (let i = 0; i < many; i++) {
      const ring = document.createElement("i");
      // A negative delay starts each ring already part-way through the cycle,
      // so the field is full on the first frame instead of filling up.
      ring.style.animationDelay = `${-(beat / many) * i}ms`;
      layer.appendChild(ring);
    }

    cleanups.push(() => { layer.remove(); element.classList.remove("rm-rings-host"); });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A honeycomb lattice that lights up near the pointer.
 *
 * The lattice is one SVG `<pattern>` — one node however large the panel is —
 * and the light is a radial gradient mask that follows the pointer through two
 * custom properties. So the whole effect is two numbers per frame, written to
 * a layer that has nothing else in it, rather than a class toggled on hundreds
 * of cells.
 *
 * Off the pointer and under reduced motion the lattice is simply there, at a
 * fixed brightness: the pattern is the decoration, the light is the bonus.
 */
export function hexGrid(target = "[data-rm-hex]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { size = 26, color = "rgba(255,255,255,0.10)", glow = 180 } = options;
  const cleanups = [];

  for (const element of elements) {
    const still = prefersReducedMotion();
    const layer = layerFor(element, "rm-hex", still);
    const side = clamp(dataNumber(element, "rmSize", size), 8, 120);
    const w = side * Math.sqrt(3);
    const h = side * 1.5;

    const svg = document.createElementNS(SVG, "svg");
    const id = `rm-hex-${Math.random().toString(36).slice(2, 8)}`;
    svg.setAttribute("aria-hidden", "true");
    // Two half-offset rows make a honeycomb tile that repeats seamlessly.
    svg.innerHTML =
      `<defs><pattern id="${id}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" patternUnits="userSpaceOnUse">` +
      `<path d="M ${(w / 2).toFixed(2)} 0 L ${w.toFixed(2)} ${(side / 2).toFixed(2)} L ${w.toFixed(2)} ${(side * 1.5).toFixed(2)}` +
      ` M ${(w / 2).toFixed(2)} 0 L 0 ${(side / 2).toFixed(2)} L 0 ${(side * 1.5).toFixed(2)}" ` +
      `fill="none" stroke="${dataString(element, "rmColor", color)}" stroke-width="1"/>` +
      `</pattern></defs><rect width="100%" height="100%" fill="url(#${id})"/>`;
    layer.appendChild(svg);
    layer.style.setProperty("--rm-hex-glow", `${dataNumber(element, "rmGlow", glow)}px`);

    if (still) {
      cleanups.push(() => { layer.remove(); element.classList.remove("rm-hex-host"); });
      continue;
    }

    let x = 0;
    let y = 0;
    let moved = false;

    // One frame callback, and only while the pointer is actually over it.
    const stop = onFrame(() => {
      if (!moved) return;
      moved = false;
      layer.style.setProperty("--rm-hex-x", `${x}px`);
      layer.style.setProperty("--rm-hex-y", `${y}px`);
    });

    const onMove = (event) => {
      const box = element.getBoundingClientRect();
      x = event.clientX - box.left;
      y = event.clientY - box.top;
      moved = true;
      layer.classList.add("is-lit");
    };
    const onLeave = () => layer.classList.remove("is-lit");

    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerleave", onLeave);

    cleanups.push(() => {
      stop();
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
      layer.remove();
      element.classList.remove("rm-hex-host");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A field of small plus marks.
 *
 * One SVG `<pattern>` holding a single cross, which is the whole component: one
 * node however large the panel is, no frames and no canvas. A linear gradient
 * is uniform along one of its axes, so two crossed gradients can only ever make
 * a corner — the mark has to be drawn rather than composited.
 *
 * The field drifts by translating that one layer, which the compositor handles
 * on its own thread.
 */
export function plusGrid(target = "[data-rm-plus]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { gap = 34, arm = 5, color = "rgba(255,255,255,0.14)", speed = 26000 } = options;
  const cleanups = [];

  for (const element of elements) {
    const layer = layerFor(element, "rm-plus", prefersReducedMotion());
    const step = clamp(dataNumber(element, "rmGap", gap), 8, 160);
    const half = clamp(dataNumber(element, "rmArm", arm), 1, step / 2) / 2;
    const mid = step / 2;

    const svg = document.createElementNS(SVG, "svg");
    const id = `rm-plus-${Math.random().toString(36).slice(2, 8)}`;
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML =
      `<defs><pattern id="${id}" width="${step}" height="${step}" patternUnits="userSpaceOnUse">` +
      `<path d="M ${(mid - half).toFixed(2)} ${mid} H ${(mid + half).toFixed(2)} ` +
      `M ${mid} ${(mid - half).toFixed(2)} V ${(mid + half).toFixed(2)}" ` +
      `stroke="${dataString(element, "rmColor", color)}" stroke-width="1" fill="none"/>` +
      `</pattern></defs><rect width="100%" height="100%" fill="url(#${id})"/>`;
    layer.appendChild(svg);
    layer.style.setProperty("--rm-plus-step", `${step}px`);
    layer.style.setProperty("--rm-plus-speed", `${speed}ms`);

    cleanups.push(() => { layer.remove(); element.classList.remove("rm-plus-host"); });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Hatching that travels, with a soft edge.
 *
 * `stripes` in `decor.js` fills its element edge to edge; this one is masked to
 * fade out at both ends, so it can sit under real text without the text
 * landing on a hard boundary. Same one-gradient cost.
 */
export function diagonals(target = "[data-rm-diagonals]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const {
    width = 14, angle = 135, color = "rgba(255,255,255,0.05)", speed = 2600, fade = 22,
  } = options;
  const cleanups = [];

  for (const element of elements) {
    const layer = layerFor(element, "rm-diagonals", prefersReducedMotion());
    layer.style.setProperty("--rm-diagonals-width", `${dataNumber(element, "rmWidth", width)}px`);
    layer.style.setProperty("--rm-diagonals-angle", `${dataNumber(element, "rmAngle", angle)}deg`);
    layer.style.setProperty("--rm-diagonals-color", dataString(element, "rmColor", color));
    layer.style.setProperty("--rm-diagonals-speed", `${speed}ms`);
    layer.style.setProperty("--rm-diagonals-fade", `${fade}%`);
    cleanups.push(() => { layer.remove(); element.classList.remove("rm-diagonals-host"); });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Contour lines, drifting.
 *
 * Concentric rounded paths built once from a seeded wobble, then moved as a
 * whole. Seeded rather than random so the same panel draws the same map on
 * every load — a background that is different on every reload is a background
 * that draws attention to itself, which is the one thing it must not do.
 */
export function topography(target = "[data-rm-topography]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const {
    lines = 9, color = "rgba(255,255,255,0.08)", speed = 34000, seed = 7,
  } = options;
  const cleanups = [];

  for (const element of elements) {
    const still = prefersReducedMotion();
    const layer = layerFor(element, "rm-topography", still);
    const many = clamp(dataNumber(element, "rmContours", lines), 2, 24);
    let noise = dataNumber(element, "rmSeed", seed) || 1;
    // A tiny deterministic generator: same seed, same map, every time.
    const next = () => {
      noise = (noise * 1103515245 + 12345) % 2147483648;
      return noise / 2147483648;
    };

    const svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("viewBox", "0 0 200 120");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");

    let paint = "";
    for (let i = 0; i < many; i++) {
      const grow = i / many;
      const steps = 16;
      const points = [];
      for (let t = 0; t < steps; t++) {
        const angle = (t / steps) * Math.PI * 2;
        const reach = 26 + grow * 62 + (next() - 0.5) * 10;
        points.push([100 + Math.cos(angle) * reach * 1.5, 60 + Math.sin(angle) * reach]);
      }
      // Every point becomes a control point and every midpoint an anchor, so
      // the ring closes smoothly instead of showing a seam and a corner.
      const at = (n) => points[(n + points.length) % points.length];
      const mid = (n) => [(at(n)[0] + at(n + 1)[0]) / 2, (at(n)[1] + at(n + 1)[1]) / 2];
      let d = `M ${mid(-1)[0].toFixed(1)} ${mid(-1)[1].toFixed(1)}`;
      for (let t = 0; t < points.length; t++) {
        const [cx, cy] = at(t);
        const [mx, my] = mid(t);
        d += ` Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
      }
      paint += `<path d="${d} Z" fill="none" stroke="${dataString(element, "rmColor", color)}" stroke-width="0.7"/>`;
    }
    svg.innerHTML = paint;
    layer.appendChild(svg);
    layer.style.setProperty("--rm-topography-speed", `${speed}ms`);

    cleanups.push(() => { layer.remove(); element.classList.remove("rm-topography-host"); });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Traces with pulses running along them.
 *
 * The pulse is a short `stroke-dasharray` segment moved by `stroke-dashoffset`
 * along the trace's own path, so it follows every corner exactly — no keyframed
 * coordinates to keep in step with the shape, and changing the trace changes
 * the route for free.
 *
 * It runs only while the panel is on screen: a circuit board animating in a
 * section nobody has scrolled to is a battery being spent on nothing.
 */
export function circuit(target = "[data-rm-circuit]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const {
    color = "rgba(255,255,255,0.10)",
    pulse = "rgba(42,167,228,0.95)",
    speed = 3200,
    traces = 5,
  } = options;
  const cleanups = [];

  // Fixed routes, so the board reads as a board rather than as noise.
  const ROUTES = [
    "M 0 20 L 46 20 L 60 34 L 132 34 L 146 20 L 200 20",
    "M 0 52 L 28 52 L 42 66 L 96 66 L 110 52 L 200 52",
    "M 0 86 L 64 86 L 78 72 L 150 72 L 164 86 L 200 86",
    "M 20 0 L 20 28 L 34 42 L 34 120",
    "M 168 0 L 168 44 L 154 58 L 154 120",
    "M 96 0 L 96 18 L 110 32 L 110 120",
  ];

  for (const element of elements) {
    const still = prefersReducedMotion();
    const layer = layerFor(element, "rm-circuit", still);
    const many = clamp(dataNumber(element, "rmTraces", traces), 1, ROUTES.length);
    const beat = dataNumber(element, "rmSpeed", speed);

    const svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("viewBox", "0 0 200 120");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = ROUTES.slice(0, many)
      .map((d) => (
        `<path class="rm-circuit-trace" d="${d}" fill="none" stroke="${dataString(element, "rmColor", color)}" stroke-width="1"/>` +
        `<path class="rm-circuit-pulse" d="${d}" fill="none" stroke="${dataString(element, "rmPulse", pulse)}" ` +
        `stroke-width="1.6" stroke-linecap="round"/>`
      ))
      .join("");
    layer.appendChild(svg);

    if (still) {
      cleanups.push(() => { layer.remove(); element.classList.remove("rm-circuit-host"); });
      continue;
    }

    const pulses = [...svg.querySelectorAll(".rm-circuit-pulse")];
    const runs = pulses.map((path) => {
      const length = path.getTotalLength();
      // A short lit segment, and a gap the length of the whole trace.
      path.style.strokeDasharray = `${Math.max(10, length * 0.12)} ${length}`;
      return { path, length };
    });

    cleanups.push(whileVisible(element, () => {
      const playing = runs.map(({ path, length }, i) => path.animate(
        [{ strokeDashoffset: length }, { strokeDashoffset: -length * 0.12 }],
        { duration: beat, delay: i * (beat / runs.length), iterations: Infinity, easing: "linear" },
      ));
      return () => playing.forEach((one) => one.cancel());
    }));

    cleanups.push(() => { layer.remove(); element.classList.remove("rm-circuit-host"); });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * An edge darkening that deepens as you scroll in.
 *
 * A single inset shadow on one layer, with its strength driven by how far
 * through the element the page has scrolled. It reads the shared scroll
 * position rather than taking its own measurement, so adding it to a page
 * costs no extra layout work in the frame.
 *
 * Under reduced motion it settles at its mid strength instead of disappearing:
 * a vignette is contrast, and contrast is not motion.
 */
export function vignette(target = "[data-rm-vignette]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { strength = 0.55, spread = 34 } = options;
  const cleanups = [];

  for (const element of elements) {
    const still = prefersReducedMotion();
    const layer = layerFor(element, "rm-vignette", still);
    const most = dataNumber(element, "rmStrength", strength);
    layer.style.setProperty("--rm-vignette-spread", `${dataNumber(element, "rmSpread", spread)}%`);

    if (still) {
      layer.style.setProperty("--rm-vignette-strength", String(most * 0.6));
      cleanups.push(() => { layer.remove(); element.classList.remove("rm-vignette-host"); });
      continue;
    }

    layer.style.setProperty("--rm-vignette-strength", "0");
    cleanups.push(whileVisible(element, () => onFrame(() => {
      const box = element.getBoundingClientRect();
      const through = clamp(1 - Math.abs(box.top + box.height / 2 - innerHeight / 2) / innerHeight, 0, 1);
      layer.style.setProperty("--rm-vignette-strength", (through * most).toFixed(3));
    })));

    cleanups.push(() => { layer.remove(); element.classList.remove("rm-vignette-host"); });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * A dot matrix whose dots grow toward the pointer.
 *
 * The classic halftone, done as one radial-gradient layer whose dot size is a
 * custom property and whose growth is a mask centred on the pointer. One
 * element and two numbers a frame — the version made of a thousand `<span>`s
 * costs a thousand style recalculations to do the same thing.
 */
export function halftone(target = "[data-rm-halftone]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const {
    gap = 12, dot = 1.6, color = "rgba(255,255,255,0.22)", reach = 190,
  } = options;
  const cleanups = [];

  for (const element of elements) {
    const still = prefersReducedMotion();
    const layer = layerFor(element, "rm-halftone", still);
    layer.style.setProperty("--rm-halftone-gap", `${dataNumber(element, "rmGap", gap)}px`);
    layer.style.setProperty("--rm-halftone-dot", `${dataNumber(element, "rmDot", dot)}px`);
    layer.style.setProperty("--rm-halftone-color", dataString(element, "rmColor", color));
    layer.style.setProperty("--rm-halftone-reach", `${dataNumber(element, "rmReach", reach)}px`);

    if (still) {
      cleanups.push(() => { layer.remove(); element.classList.remove("rm-halftone-host"); });
      continue;
    }

    let x = 0;
    let y = 0;
    let moved = false;

    const stop = onFrame(() => {
      if (!moved) return;
      moved = false;
      layer.style.setProperty("--rm-halftone-x", `${x}px`);
      layer.style.setProperty("--rm-halftone-y", `${y}px`);
    });

    const onMove = (event) => {
      const box = element.getBoundingClientRect();
      x = event.clientX - box.left;
      y = event.clientY - box.top;
      moved = true;
      layer.classList.add("is-lit");
    };
    const onLeave = () => layer.classList.remove("is-lit");

    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerleave", onLeave);

    cleanups.push(() => {
      stop();
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
      layer.remove();
      element.classList.remove("rm-halftone-host");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}
