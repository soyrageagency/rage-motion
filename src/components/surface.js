/**
 * Surfaces, borders and the light that moves across them.
 *
 *   • beam()      — an animated curve drawn between two elements.
 *   • trail()     — a light that travels an element's own border.
 *   • glare()     — a sheen that tracks the pointer across a surface.
 *   • electric()  — a border that crackles, via a real SVG displacement filter.
 *   • blurEdge()  — a progressive blur, the way a camera does it.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import {
  dataNumber, dataString, onFrame, prefersReducedMotion, resolveElements,
} from "../core/motion.js";

const SVG = "http://www.w3.org/2000/svg";
let uid = 0;

/**
 * Draw an animated curve between two elements.
 *
 * The connector every product diagram wants and nobody builds properly: the
 * path is recomputed from the two elements' live positions, so it survives a
 * resize, a reflow, or a card being added — rather than being a hardcoded `d`
 * attribute that is wrong on every viewport but the one it was drawn on.
 *
 *   <div data-rm-beam data-rm-from="#api" data-rm-to="#db"></div>
 */
export function beam(target = "[data-rm-beam]", options = {}) {
  const containers = resolveElements(target);
  if (!containers.length) return () => {};

  const {
    from, to, curvature = 0.3, width = 2,
    color = "rgba(120,120,120,0.25)", glow = "#2aa7e4", duration = 3200, reverse = false,
  } = options;

  const cleanups = [];

  for (const container of containers) {
    const start = document.querySelector(dataString(container, "rmFrom", from ?? ""));
    const end = document.querySelector(dataString(container, "rmTo", to ?? ""));
    if (!start || !end) continue;

    container.classList.add("rm-beam");
    const id = `rm-beam-${++uid}`;

    const svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("fill", "none");
    const base = document.createElementNS(SVG, "path");
    base.setAttribute("stroke", dataString(container, "rmColor", color));
    base.setAttribute("stroke-width", String(width));
    base.setAttribute("stroke-linecap", "round");
    const lit = document.createElementNS(SVG, "path");
    lit.setAttribute("stroke", `url(#${id})`);
    lit.setAttribute("stroke-width", String(width + 0.5));
    lit.setAttribute("stroke-linecap", "round");

    // A short bright segment travelling a long dark path: one gradient with
    // moving stops, not a second element chasing the first.
    svg.innerHTML =
      `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="0">` +
      `<stop stop-color="${glow}" stop-opacity="0"/>` +
      `<stop stop-color="${glow}"/>` +
      `<stop offset="0.4" stop-color="${glow}"/>` +
      `<stop offset="1" stop-color="${glow}" stop-opacity="0"/>` +
      "</linearGradient></defs>";
    svg.append(base, lit);
    container.appendChild(svg);

    const gradient = svg.querySelector(`#${id}`);
    let path = { x1: 0, y1: 0, x2: 0, y2: 0 };

    const measure = () => {
      const box = container.getBoundingClientRect();
      const a = start.getBoundingClientRect();
      const b = end.getBoundingClientRect();
      svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
      svg.setAttribute("width", String(box.width));
      svg.setAttribute("height", String(box.height));

      const x1 = a.left - box.left + a.width / 2;
      const y1 = a.top - box.top + a.height / 2;
      const x2 = b.left - box.left + b.width / 2;
      const y2 = b.top - box.top + b.height / 2;
      // Bow the curve perpendicular to the run, so two elements side by side
      // arc over rather than sagging into an S.
      const lift = Math.hypot(x2 - x1, y2 - y1) * curvature;
      const d = `M ${x1},${y1} Q ${(x1 + x2) / 2},${(y1 + y2) / 2 - lift} ${x2},${y2}`;
      base.setAttribute("d", d);
      lit.setAttribute("d", d);
      path = { x1, y1, x2, y2 };
    };
    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(container);
    resizeObserver.observe(start);
    resizeObserver.observe(end);

    let stopFrame = () => {};
    if (!prefersReducedMotion()) {
      const span = dataNumber(container, "rmDuration", duration);
      const backwards = dataString(container, "rmReverse", reverse ? "true" : "false") === "true";
      stopFrame = onFrame((now) => {
        const t = ((now % span) / span) * (backwards ? -1 : 1);
        const head = backwards ? 1 + t : t;
        // Sweep the gradient's own coordinates along the line the path spans.
        gradient.setAttribute("x1", String(path.x1 + (path.x2 - path.x1) * (head - 0.35)));
        gradient.setAttribute("y1", String(path.y1 + (path.y2 - path.y1) * (head - 0.35)));
        gradient.setAttribute("x2", String(path.x1 + (path.x2 - path.x1) * head));
        gradient.setAttribute("y2", String(path.y1 + (path.y2 - path.y1) * head));
      });
    } else {
      lit.remove();
    }

    cleanups.push(() => {
      stopFrame();
      resizeObserver.disconnect();
      svg.remove();
      container.classList.remove("rm-beam");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A light that travels an element's own border.
 *
 * Uses `offset-path` with the element's real rectangle and corner radius, so
 * the light follows the actual shape — including rounded corners — instead of
 * the usual trick of spinning a conic gradient behind the box, which visibly
 * speeds up at the corners and slows down along the sides.
 *
 * Where `offset-path` is unsupported the element simply keeps its border.
 */
export function trail(target = "[data-rm-trail]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const supported =
    typeof CSS !== "undefined" && CSS.supports?.("offset-path", "rect(0px 100% 100% 0px round 8px)");
  if (!supported || prefersReducedMotion()) return () => {};

  const { size = 60, color = "#2aa7e4", duration = 4000 } = options;
  const cleanups = [];

  for (const element of elements) {
    element.classList.add("rm-trail");
    const radius = getComputedStyle(element).borderTopLeftRadius || "0px";

    const light = document.createElement("span");
    light.className = "rm-trail-light";
    light.setAttribute("aria-hidden", "true");
    light.style.setProperty("--rm-trail-size", `${dataNumber(element, "rmSize", size)}px`);
    light.style.setProperty("--rm-trail-color", dataString(element, "rmColor", color));
    light.style.setProperty("--rm-trail-duration", `${dataNumber(element, "rmDuration", duration)}ms`);
    light.style.offsetPath = `rect(0px 100% 100% 0px round ${radius})`;
    element.appendChild(light);

    cleanups.push(() => {
      light.remove();
      element.classList.remove("rm-trail");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A sheen that tracks the pointer across a surface.
 *
 * The highlight's angle follows where the pointer is, so the card reads as a
 * physical panel catching a light rather than a rectangle with a gradient
 * fading in. One listener serves every surface in the set.
 */
export function glare(target = "[data-rm-glare]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { intensity = 0.35, size = 130 } = options;

  for (const element of elements) {
    element.classList.add("rm-glare");
    element.style.setProperty("--rm-glare-intensity", String(dataNumber(element, "rmIntensity", intensity)));
    element.style.setProperty("--rm-glare-size", `${size}%`);
  }

  const onMove = (event) => {
    for (const element of elements) {
      const box = element.getBoundingClientRect();
      if (event.clientX < box.left - 40 || event.clientX > box.right + 40) continue;
      if (event.clientY < box.top - 40 || event.clientY > box.bottom + 40) continue;
      const x = ((event.clientX - box.left) / box.width) * 100;
      const y = ((event.clientY - box.top) / box.height) * 100;
      element.style.setProperty("--rm-glare-x", `${x.toFixed(1)}%`);
      element.style.setProperty("--rm-glare-y", `${y.toFixed(1)}%`);
      // Angle the sheen away from the pointer, so it sweeps rather than sits.
      element.style.setProperty("--rm-glare-angle", `${(x * 1.8 - 90).toFixed(1)}deg`);
    }
  };
  addEventListener("pointermove", onMove, { passive: true });

  return () => {
    removeEventListener("pointermove", onMove);
    elements.forEach((element) => element.classList.remove("rm-glare"));
  };
}

/**
 * A border that crackles.
 *
 * A real `feTurbulence` + `feDisplacementMap`, which is what makes the edge
 * ripple like current rather than wobble like a scaled outline. The noise seed
 * is stepped about twelve times a second on purpose: the effect is meant to
 * flicker, and stepping it every frame costs four times as much filter work
 * for something the eye reads as identical.
 */
export function electric(target = "[data-rm-electric]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { color = "#2aa7e4", width = 2, scale = 14, frequency = 0.02, fps = 12 } = options;
  const cleanups = [];

  for (const element of elements) {
    const id = `rm-electric-${++uid}`;
    element.classList.add("rm-electric");
    element.style.setProperty("--rm-electric-color", dataString(element, "rmColor", color));
    element.style.setProperty("--rm-electric-width", `${width}px`);

    const svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.classList.add("rm-electric-defs");
    svg.innerHTML =
      `<filter id="${id}" x="-30%" y="-30%" width="160%" height="160%">` +
      `<feTurbulence type="fractalNoise" baseFrequency="${frequency}" numOctaves="2" seed="1" result="noise"/>` +
      `<feDisplacementMap in="SourceGraphic" in2="noise" scale="${scale}" xChannelSelector="R" yChannelSelector="G"/>` +
      "</filter>";
    element.appendChild(svg);

    const edge = document.createElement("span");
    edge.className = "rm-electric-edge";
    edge.setAttribute("aria-hidden", "true");
    edge.style.filter = `url(#${id})`;
    element.appendChild(edge);

    let stopFrame = () => {};
    if (!prefersReducedMotion()) {
      const noise = svg.querySelector("feTurbulence");
      const every = 1000 / fps;
      let last = 0;
      stopFrame = onFrame((now) => {
        if (now - last < every) return;
        last = now;
        noise.setAttribute("seed", String(Math.floor(Math.random() * 100)));
      });
    }

    cleanups.push(() => {
      stopFrame();
      svg.remove();
      edge.remove();
      element.classList.remove("rm-electric");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A progressive blur, the way a camera does it.
 *
 * Stacked layers, each blurred more than the last and masked to a narrower
 * band, so focus falls off gradually. A single `backdrop-filter` with a mask —
 * the usual approach — blurs everything by the same amount and just fades the
 * blurred copy in, which looks like a smear rather than depth.
 *
 * Put one over the top or bottom of a scrolling area.
 */
export function blurEdge(target = "[data-rm-blur-edge]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};
  if (typeof CSS === "undefined" || !CSS.supports?.("backdrop-filter", "blur(1px)")) return () => {};

  const { layers = 5, strength = 8, position = "bottom" } = options;
  const cleanups = [];

  for (const element of elements) {
    const count = Math.min(8, dataNumber(element, "rmDepthLayers", layers));
    const side = dataString(element, "rmBlurEdge", position);
    element.classList.add("rm-blur-edge", `is-${side === "top" ? "top" : "bottom"}`);

    const built = [];
    for (let i = 0; i < count; i++) {
      const layer = document.createElement("span");
      layer.setAttribute("aria-hidden", "true");
      // Each layer blurs twice as hard over half the band of the one before.
      const blur = (strength / count) * 2 ** i;
      const from = (i / count) * 100;
      const to = ((i + 1) / count) * 100;
      const direction = side === "top" ? "to top" : "to bottom";
      layer.style.backdropFilter = `blur(${blur.toFixed(2)}px)`;
      layer.style.mask = `linear-gradient(${direction}, transparent ${from}%, #000 ${to}%)`;
      element.appendChild(layer);
      built.push(layer);
    }

    cleanups.push(() => {
      built.forEach((layer) => layer.remove());
      element.classList.remove("rm-blur-edge", "is-top", "is-bottom");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}
