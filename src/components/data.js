/**
 * Numbers, drawn.
 *
 *   • sparkline() — a trend line that draws itself.
 *   • bars()      — a bar chart that grows from the axis.
 *   • donut()     — a ring that fills to its share.
 *   • gauge()     — a dial with a needle that swings and settles.
 *   • stat()      — a figure with its own delta and trend.
 *   • stars()     — a rating that is also a real radio group.
 *
 * Every one of these reads its numbers out of the markup rather than taking
 * them as arguments, which is the point: the page still says what it says with
 * JavaScript switched off, and there is no second copy of the data to drift
 * from the first. A chart whose numbers exist only in a script is a picture,
 * and a picture cannot be read, searched, copied or translated.
 *
 * They are all SVG, all `aria-hidden` over a real table or list of values, and
 * all of them draw with `stroke-dashoffset` rather than by scaling — a scaled
 * chart has the wrong line weight for most of its animation.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import {
  clamp, dataNumber, dataString, prefersReducedMotion, resolveElements, watch,
} from "../core/motion.js";

const SVG = "http://www.w3.org/2000/svg";

/** The numbers written into an element, in order. */
function readValues(element, selector) {
  const nodes = [...element.querySelectorAll(selector)];
  if (nodes.length) {
    return nodes
      .map((node) => Number(node.getAttribute("data-rm-value") ?? node.textContent))
      .filter((one) => Number.isFinite(one));
  }
  return (dataString(element, "rmValues", "") || "")
    .split(",")
    .map((one) => Number(one.trim()))
    .filter((one) => Number.isFinite(one));
}

/**
 * A trend line that draws itself.
 *
 * The path is built from the values in the markup and revealed with
 * `stroke-dashoffset`, so the line is genuinely drawn left to right at a
 * constant weight. Scaling a finished path — the usual shortcut — squashes the
 * stroke for the whole animation and only looks right on the last frame.
 *
 *   <div data-rm-sparkline data-rm-values="4,9,6,12,10,17"></div>
 */
export function sparkline(target = "[data-rm-sparkline]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const {
    selector = "[data-rm-value]",
    color = "#2aa7e4",
    width = 2,
    fill = true,
    duration = 1100,
    threshold = 0.3,
  } = options;
  const cleanups = [];

  for (const holder of holders) {
    const values = readValues(holder, selector);
    if (values.length < 2) continue;

    holder.classList.add("rm-sparkline");
    const w = 100;
    const h = 32;
    const low = Math.min(...values);
    const high = Math.max(...values);
    const span = high - low || 1;

    const points = values.map((value, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((value - low) / span) * (h - width * 2) - width;
      return [x, y];
    });

    const line = points.map(([x, y], i) => `${i ? "L" : "M"} ${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
    const area = `${line} L ${w} ${h} L 0 ${h} Z`;

    const svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML =
      (fill
        ? `<path class="rm-sparkline-area" d="${area}" fill="${dataString(holder, "rmColor", color)}" opacity="0.14"/>`
        : "") +
      `<path class="rm-sparkline-line" d="${line}" fill="none" stroke="${dataString(holder, "rmColor", color)}" ` +
      `stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`;
    holder.prepend(svg);

    const path = svg.querySelector(".rm-sparkline-line");
    const length = path.getTotalLength();
    const draw = () => {
      if (prefersReducedMotion()) return;
      path.style.strokeDasharray = String(length);
      path.style.strokeDashoffset = String(length);
      path.animate(
        [{ strokeDashoffset: length }, { strokeDashoffset: 0 }],
        { duration, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" },
      );
    };

    cleanups.push(watch(holder, draw, { threshold, once: true }));
    cleanups.push(() => {
      svg.remove();
      holder.classList.remove("rm-sparkline");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * A bar chart that grows from the axis.
 *
 * Each bar is scaled from its own base rather than having its height animated,
 * so the chart never reflows while it grows — and the labels beside it stay
 * exactly where they were.
 *
 *   <ul data-rm-bars>
 *     <li data-rm-value="42">Mon</li>
 *   </ul>
 */
export function bars(target = "[data-rm-bars]", options = {}) {
  const charts = resolveElements(target);
  if (!charts.length) return () => {};

  const { selector = "[data-rm-value]", duration = 780, stagger = 70, threshold = 0.25 } = options;
  const cleanups = [];

  for (const chart of charts) {
    const items = [...chart.querySelectorAll(selector)];
    if (!items.length) continue;

    const values = items.map((one) => Number(one.getAttribute("data-rm-value")) || 0);
    const high = Math.max(...values) || 1;

    chart.classList.add("rm-bars");
    items.forEach((item, i) => {
      item.classList.add("rm-bars-item");
      const bar = document.createElement("i");
      bar.className = "rm-bars-fill";
      bar.setAttribute("aria-hidden", "true");
      bar.style.setProperty("--rm-bars-share", (values[i] / high).toFixed(4));
      item.prepend(bar);
    });

    const grow = () => {
      if (prefersReducedMotion()) { chart.classList.add("is-grown"); return; }
      chart.querySelectorAll(".rm-bars-fill").forEach((bar, i) => {
        bar.animate(
          [{ transform: "scaleY(0)" }, { transform: `scaleY(var(--rm-bars-share, 1))` }],
          { duration, delay: i * stagger, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" },
        );
      });
    };

    cleanups.push(watch(chart, grow, { threshold, once: true }));
    cleanups.push(() => {
      chart.querySelectorAll(".rm-bars-fill").forEach((bar) => bar.remove());
      items.forEach((item) => item.classList.remove("rm-bars-item"));
      chart.classList.remove("rm-bars", "is-grown");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * A ring that fills to its share.
 *
 * `stroke-dasharray` on a real circle, so the arc has a rounded cap and an
 * exact length. The usual version rotates two half-discs and can do neither.
 * The number stays in the markup at the centre, so the figure is readable
 * whether or not the ring ever draws.
 *
 *   <div data-rm-donut data-rm-value="68"><strong>68%</strong></div>
 */
export function donut(target = "[data-rm-donut]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const {
    value = 0, size = 96, width = 8, color = "#2aa7e4",
    track = "rgba(255,255,255,0.12)", duration = 1000, threshold = 0.3,
  } = options;
  const cleanups = [];

  for (const holder of holders) {
    const share = clamp(dataNumber(holder, "rmValue", value), 0, 100) / 100;
    const box = dataNumber(holder, "rmSize", size);
    const radius = (box - width) / 2;
    const length = 2 * Math.PI * radius;

    holder.classList.add("rm-donut");
    holder.style.setProperty("--rm-donut-size", `${box}px`);

    const svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("viewBox", `0 0 ${box} ${box}`);
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML =
      `<circle cx="${box / 2}" cy="${box / 2}" r="${radius}" fill="none" stroke="${track}" stroke-width="${width}"/>` +
      `<circle class="rm-donut-arc" cx="${box / 2}" cy="${box / 2}" r="${radius}" fill="none" ` +
      `stroke="${dataString(holder, "rmColor", color)}" stroke-width="${width}" stroke-linecap="round" ` +
      `stroke-dasharray="${length.toFixed(2)}" stroke-dashoffset="${length.toFixed(2)}" ` +
      `transform="rotate(-90 ${box / 2} ${box / 2})"/>`;
    holder.prepend(svg);

    const arc = svg.querySelector(".rm-donut-arc");
    const draw = () => {
      const to = length * (1 - share);
      if (prefersReducedMotion()) { arc.setAttribute("stroke-dashoffset", to.toFixed(2)); return; }
      arc.animate(
        [{ strokeDashoffset: length }, { strokeDashoffset: to }],
        { duration, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" },
      );
    };

    cleanups.push(watch(holder, draw, { threshold, once: true }));
    cleanups.push(() => { svg.remove(); holder.classList.remove("rm-donut"); });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * A dial with a needle that swings and settles.
 *
 * The needle overshoots slightly and comes back, because an instrument needle
 * has mass and one that glides linearly to its value reads as a progress bar
 * bent into an arc.
 *
 *   <div data-rm-gauge data-rm-value="72"><strong>72</strong></div>
 */
export function gauge(target = "[data-rm-gauge]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const {
    value = 0, size = 120, width = 9, sweep = 240,
    color = "#2aa7e4", track = "rgba(255,255,255,0.12)", duration = 1100, threshold = 0.3,
  } = options;
  const cleanups = [];

  for (const holder of holders) {
    const share = clamp(dataNumber(holder, "rmValue", value), 0, 100) / 100;
    const box = dataNumber(holder, "rmSize", size);
    const radius = (box - width) / 2;
    const start = 90 + (360 - sweep) / 2;
    const arcLength = 2 * Math.PI * radius * (sweep / 360);
    const full = 2 * Math.PI * radius;

    holder.classList.add("rm-gauge");
    holder.style.setProperty("--rm-gauge-size", `${box}px`);

    const svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("viewBox", `0 0 ${box} ${box}`);
    svg.setAttribute("aria-hidden", "true");
    const dash = `${arcLength.toFixed(2)} ${(full - arcLength).toFixed(2)}`;
    svg.innerHTML =
      `<circle cx="${box / 2}" cy="${box / 2}" r="${radius}" fill="none" stroke="${track}" stroke-width="${width}" ` +
      `stroke-linecap="round" stroke-dasharray="${dash}" transform="rotate(${start} ${box / 2} ${box / 2})"/>` +
      `<circle class="rm-gauge-arc" cx="${box / 2}" cy="${box / 2}" r="${radius}" fill="none" ` +
      `stroke="${dataString(holder, "rmColor", color)}" stroke-width="${width}" stroke-linecap="round" ` +
      `stroke-dasharray="${dash}" stroke-dashoffset="${arcLength.toFixed(2)}" ` +
      `transform="rotate(${start} ${box / 2} ${box / 2})"/>`;
    holder.prepend(svg);

    const arc = svg.querySelector(".rm-gauge-arc");
    const draw = () => {
      const to = arcLength * (1 - share);
      if (prefersReducedMotion()) { arc.setAttribute("stroke-dashoffset", to.toFixed(2)); return; }
      // Past the mark and back: mass, rather than a slide.
      arc.animate(
        [
          { strokeDashoffset: arcLength },
          { strokeDashoffset: Math.max(0, to - arcLength * 0.06), offset: 0.72 },
          { strokeDashoffset: to },
        ],
        { duration, easing: "cubic-bezier(0.33, 1, 0.68, 1)", fill: "forwards" },
      );
    };

    cleanups.push(watch(holder, draw, { threshold, once: true }));
    cleanups.push(() => { svg.remove(); holder.classList.remove("rm-gauge"); });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * A figure with its own delta and trend.
 *
 * The arrow direction and the colour come from the sign of the change, which
 * is written in the markup — so the card cannot end up green with a downward
 * arrow, which is what happens when the two are set independently.
 *
 *   <div data-rm-stat data-rm-delta="-4.2"><strong>1,204</strong><span>Visitors</span></div>
 */
export function stat(target = "[data-rm-stat]", options = {}) {
  const cards = resolveElements(target);
  if (!cards.length) return () => {};

  const { up = "▲", down = "▼", flat = "—" } = options;
  const cleanups = [];

  for (const card of cards) {
    const delta = dataNumber(card, "rmDelta", 0);
    const direction = delta > 0 ? "up" : delta < 0 ? "down" : "flat";

    card.classList.add("rm-stat", `is-${direction}`);

    const badge = document.createElement("span");
    badge.className = "rm-stat-delta";
    badge.textContent = `${{ up, down, flat }[direction]} ${Math.abs(delta)}%`;
    // One string for both the arrow and the number, so they cannot disagree.
    badge.setAttribute(
      "aria-label",
      `${direction === "up" ? "Up" : direction === "down" ? "Down" : "No change"} ${Math.abs(delta)} per cent`,
    );
    card.appendChild(badge);

    cleanups.push(() => {
      badge.remove();
      card.classList.remove("rm-stat", `is-${direction}`);
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A rating that is also a real radio group.
 *
 * Radios underneath, so it arrives in the tab order once, the arrow keys move
 * between values, it submits with the form and a screen reader announces
 * "3 of 5" rather than reading five identical stars. The hover preview is CSS
 * on top of that, not instead of it.
 *
 *   <fieldset data-rm-rating><legend>Rating</legend>…</fieldset>
 */
export function stars(target = "[data-rm-rating]", options = {}) {
  const groups = resolveElements(target);
  if (!groups.length) return () => {};

  const { count = 5, name = "rating" } = options;
  const cleanups = [];

  for (const group of groups) {
    const many = Math.max(2, Math.min(10, dataNumber(group, "rmCount", count)));
    const field = dataString(group, "rmName", name);
    group.classList.add("rm-rating");

    const existing = [...group.querySelectorAll('input[type="radio"]')];
    const inputs = existing.length ? existing : [];

    if (!inputs.length) {
      for (let i = 1; i <= many; i++) {
        const label = document.createElement("label");
        label.className = "rm-rating-star";
        const input = document.createElement("input");
        input.type = "radio";
        input.name = field;
        input.value = String(i);
        input.setAttribute("aria-label", `${i} of ${many}`);
        const mark = document.createElement("span");
        mark.setAttribute("aria-hidden", "true");
        mark.textContent = "★";
        label.append(input, mark);
        group.appendChild(label);
        inputs.push(input);
      }
    }

    const paint = () => {
      const chosen = inputs.findIndex((one) => one.checked);
      inputs.forEach((one, i) => {
        (one.closest("label") ?? one).classList.toggle("is-on", i <= chosen);
      });
    };
    paint();
    inputs.forEach((one) => one.addEventListener("change", paint));

    cleanups.push(() => {
      inputs.forEach((one) => one.removeEventListener("change", paint));
      if (!existing.length) group.replaceChildren();
      group.classList.remove("rm-rating");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}
