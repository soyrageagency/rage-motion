/**
 * Numbers, drawn — the second set.
 *
 *   • areaChart()      — a filled trend that is drawn, not scaled.
 *   • stepChart()      — a value that holds until it changes.
 *   • candlestick()    — open, high, low and close, in one mark.
 *   • waterfall()      — how a total was arrived at.
 *   • radar()          — a shape made of several scales at once.
 *   • heatCalendar()   — a year of days, one square each.
 *   • bulletChart()    — a measure against its target.
 *   • funnel()         — the stages, and the drop between them.
 *   • treemap()        — parts of a whole, sized by area.
 *   • progressRings()  — concentric rings, activity style.
 *   • comparisonBars() — two series back to back on one scale.
 *   • sparkBars()      — a bar sparkline the size of a word.
 *   • deltaBadge()     — up or down, with a real sign.
 *   • bigNumber()      — a headline figure that counts up.
 *   • rangeBar()       — a band with a marker in it.
 *   • pieSlices()      — real arcs, not rotated half-discs.
 *   • scatterPlot()    — points, and the line they imply.
 *   • timelineChart()  — spans of time on one shared scale.
 *   • meterRow()       — many small meters, each announced.
 *   • numberTicker()   — a figure that rolls to its new value.
 *
 * Every one of these reads its numbers out of the markup. That is the whole
 * discipline: the page still says what it says with JavaScript switched off,
 * there is no second copy of the data to drift from the first, and the figures
 * stay searchable, selectable and translatable. A chart whose numbers exist
 * only in a script is a picture, and nobody can read a picture.
 *
 * So the SVG is always `aria-hidden` and always sits over the real list or
 * table it was built from. The drawing is decoration for people who can see it;
 * the markup underneath is the content. Where a component adds a figure of its
 * own — a drop-off percentage, a spelled-out delta — it writes real text.
 *
 * Everything draws with `stroke-dashoffset` rather than by scaling, including
 * the bars: a bar here is a thick `<line>` uncovered along its length, not a
 * rect stretched from zero. Scaling a rect scales its stroke and its corners
 * with it, so the shape is the wrong weight for every frame except the last.
 * The dash arithmetic is made trivial by `pathLength="1"`, which tells the
 * browser to treat any shape — a line, an arc, a polygon, a curve — as being
 * exactly one unit long, so the same two lines of code reveal all of them and
 * nothing has to call `getTotalLength()`.
 *
 * Nothing animates a width, a height or a font size. Under reduced motion every
 * chart is simply already drawn.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import {
  clamp, dataNumber, dataString, EASE, onFrame, prefersReducedMotion, resolveElements, whileVisible, watch,
} from "../core/motion.js";

const SVG = "http://www.w3.org/2000/svg";

/** The default series colours, taken from the palette tokens. */
const PALETTE = ["#2aa7e4", "#d28c65", "#f4d738", "#6c695f", "#9ec8de", "#0e0e0e"];

/** Build an SVG node with its attributes in one go. */
function node(name, attributes) {
  const made = document.createElementNS(SVG, name);
  for (const [key, value] of Object.entries(attributes)) made.setAttribute(key, String(value));
  return made;
}

/**
 * The drawing surface.
 *
 * Always `aria-hidden` and never focusable: the numbers are in the markup
 * underneath, and a screen reader that walks into an SVG full of coordinates
 * gets nothing a person could use.
 *
 * There is one sizing rule and no exceptions to it: the viewBox is built at the
 * proportions the chart wants to be drawn at, so every surface in the module
 * scales uniformly and none of them is ever given a fixed CSS height. The
 * alternative — `preserveAspectRatio="none"` and `vector-effect:
 * non-scaling-stroke` to rescue the line weights — is deliberately not used
 * here, because non-scaling strokes move the dash pattern into screen units and
 * that turns every `pathLength` reveal in this file into a row of dashes.
 */
function surface(width, height) {
  return node("svg", { viewBox: `0 0 ${width} ${height}`, "aria-hidden": "true", focusable: "false" });
}

/**
 * Put the drawing where it belongs, and name it.
 *
 * A chart mounted straight onto its own `<ul>` cannot keep the SVG inside it —
 * a list may only contain list items, and a browser asked to do it anyway ends
 * up with a DOM nobody can style reliably. So when the mount is itself a list
 * or a table the surface goes immediately before it instead. Either way the
 * drawing sits above the numbers it was made from.
 */
function mount(holder, svg, name) {
  svg.setAttribute("class", `rm-${name}-svg`);
  if (/^(UL|OL|TABLE|DL)$/.test(holder.tagName) && holder.parentNode) {
    holder.parentNode.insertBefore(svg, holder);
  } else {
    holder.prepend(svg);
  }
}

/**
 * Reveal any shape along its own length.
 *
 * `pathLength="1"` re-scales the browser's idea of how long the shape is, so a
 * line, a circle, a polygon and a bezier all measure exactly one unit and the
 * same dash pair uncovers every one of them. Without it each shape needs a
 * `getTotalLength()` call, which forces layout and answers wrongly for a shape
 * that is not in the document yet.
 *
 * The undrawn state is set here, immediately before the animation starts, and
 * never in the stylesheet — a chart that is blank until a script runs is a
 * chart that is blank when the script fails.
 */
function reveal(shape, { duration = 900, delay = 0, easing = EASE.out } = {}) {
  shape.setAttribute("pathLength", "1");
  shape.style.strokeDasharray = "1";
  if (prefersReducedMotion()) { shape.style.strokeDashoffset = "0"; return null; }
  shape.style.strokeDashoffset = "1";
  return shape.animate(
    [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }],
    { duration, delay, easing, fill: "forwards" },
  );
}

/** Fade a filled shape in behind a stroke that is drawing. */
function fadeIn(shape, to, { duration = 700, delay = 0 } = {}) {
  shape.setAttribute("fill-opacity", String(to));
  if (prefersReducedMotion()) return null;
  return shape.animate(
    [{ fillOpacity: 0 }, { fillOpacity: to }],
    { duration, delay, easing: EASE.out, fill: "backwards" },
  );
}

/** A number off an element: its attribute if it has one, otherwise its text. */
function numberOn(element, attribute) {
  const raw = element.getAttribute(attribute);
  if (raw === null || raw.trim() === "") return null;
  const value = Number(raw.replace(/[\s,]/g, ""));
  return Number.isFinite(value) ? value : null;
}

/** The rows an author wrote, and the number on each of them. */
function readRows(holder, selector) {
  return [...holder.querySelectorAll(selector)]
    .map((row) => ({ row, value: numberOn(row, "data-rm-value") ?? Number(row.textContent.replace(/[^\d.-]/g, "")) }))
    .filter((one) => Number.isFinite(one.value));
}

/**
 * A bare series of numbers.
 *
 * Rows first, because a list of `<li data-rm-value="4">Mon</li>` is readable
 * prose; the comma-separated attribute is the fallback for a sparkline-sized
 * chart where a list would be heavier than the thing it describes.
 */
function readSeries(holder, selector) {
  const rows = readRows(holder, selector);
  if (rows.length) return rows.map((one) => one.value);
  return (dataString(holder, "rmValues", "") || "")
    .split(",")
    .map((one) => Number(one.trim()))
    .filter((one) => Number.isFinite(one));
}

/** The real list or table a chart was built from, if the author wrote one. */
function sourceIn(holder) {
  return holder.querySelector("ul, ol, table, dl");
}

/** A moment on a timeline: a plain number, or anything `Date` understands. */
function moment(raw) {
  if (raw === null || raw === undefined || raw.trim?.() === "") return null;
  const asNumber = Number(raw);
  if (Number.isFinite(asNumber)) return asNumber;
  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Group digits the way the visitor's locale does, at a fixed width. */
function formatted(value, places, before, after) {
  const body = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: places,
    maximumFractionDigits: places,
  }).format(value);
  return `${before}${body}${after}`;
}

/**
 * A filled trend that is drawn, not scaled.
 *
 * The line is a real path through the values in the markup and it is uncovered
 * left to right with `stroke-dashoffset`, so it keeps one weight the whole way
 * across. The shaded area underneath cannot be dash-drawn — a fill has no
 * length — so it fades in behind the line instead of being scaled up from the
 * axis, which is the usual shortcut and the reason so many of these charts look
 * squashed for the first two-thirds of their animation.
 *
 *   <div data-rm-area-chart>
 *     <ol><li data-rm-value="12">Jan</li><li data-rm-value="19">Feb</li></ol>
 *   </div>
 */
export function areaChart(target = "[data-rm-area-chart]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const {
    selector = "[data-rm-value]", color = "#2aa7e4", thickness = 0.5,
    smooth = true, duration = 1200, threshold = 0.25,
  } = options;
  const cleanups = [];

  for (const holder of holders) {
    const values = readSeries(holder, selector);
    if (values.length < 2) continue;

    const w = 100;
    const h = 30;
    const ink = dataString(holder, "rmColor", color);
    const weight = dataNumber(holder, "rmThickness", thickness);
    const curved = dataString(holder, "rmSmooth", smooth ? "on" : "off") !== "off";
    const low = Math.min(0, ...values);
    const high = Math.max(...values);
    const span = high - low || 1;

    const points = values.map((value, i) => [
      (i / (values.length - 1)) * w,
      h - ((value - low) / span) * (h - 3) - 1.5,
    ]);

    // A midpoint curve rather than a spline through the points: it never
    // overshoots, so a smoothed chart cannot imply a value the data never had.
    let line = `M ${points[0][0].toFixed(2)} ${points[0][1].toFixed(2)}`;
    for (let i = 1; i < points.length; i++) {
      const [x, y] = points[i];
      if (!curved) { line += ` L ${x.toFixed(2)} ${y.toFixed(2)}`; continue; }
      const [px, py] = points[i - 1];
      const mx = (px + x) / 2;
      line += ` C ${mx.toFixed(2)} ${py.toFixed(2)} ${mx.toFixed(2)} ${y.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)}`;
    }

    holder.classList.add("rm-area-chart");
    const list = sourceIn(holder);
    list?.classList.add("rm-area-chart-data");

    // Scaled uniformly, with the weight in the drawing's own units. Stretching
    // it to an arbitrary box would need `vector-effect: non-scaling-stroke`,
    // and that moves the dash pattern into screen units, which leaves a
    // `pathLength` reveal drawing a broken line rather than a whole one.
    const svg = surface(w, h);
    const area = node("path", { class: "rm-area-chart-area", d: `${line} L ${w} ${h} L 0 ${h} Z`, fill: ink, "fill-opacity": "0" });
    const path = node("path", {
      class: "rm-area-chart-line",
      d: line,
      fill: "none",
      stroke: ink,
      "stroke-width": weight,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    });
    svg.append(area, path);
    mount(holder, svg, "area-chart");

    const draw = () => {
      reveal(path, { duration: dataNumber(holder, "rmDuration", duration) });
      fadeIn(area, 0.16, { duration: duration * 0.8, delay: duration * 0.25 });
    };

    cleanups.push(watch(holder, draw, { threshold, once: true }));
    cleanups.push(() => {
      svg.remove();
      list?.classList.remove("rm-area-chart-data");
      holder.classList.remove("rm-area-chart");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * A value that holds until it changes.
 *
 * The same series as an area chart, drawn as steps rather than as a slope,
 * because for a price, a headcount or a rate the value did not travel between
 * the readings — it sat still and then jumped. A smoothed line through those
 * points draws several months of numbers that never existed, which is the one
 * thing a chart must not do.
 *
 * Drawn with `stroke-dashoffset` along the whole staircase, so the horizontals
 * and the verticals appear in the order they happened.
 *
 *   <div data-rm-step-chart data-rm-values="4,4,9,9,7,12"></div>
 */
export function stepChart(target = "[data-rm-step-chart]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const {
    selector = "[data-rm-value]", color = "#d28c65", thickness = 0.5,
    duration = 1200, threshold = 0.25,
  } = options;
  const cleanups = [];

  for (const holder of holders) {
    const values = readSeries(holder, selector);
    if (values.length < 2) continue;

    const w = 100;
    const h = 30;
    const ink = dataString(holder, "rmColor", color);
    const low = Math.min(...values);
    const high = Math.max(...values);
    const span = high - low || 1;
    const step = w / (values.length - 1);
    const at = (value) => h - ((value - low) / span) * (h - 3) - 1.5;

    let line = `M 0 ${at(values[0]).toFixed(2)}`;
    for (let i = 1; i < values.length; i++) {
      const x = (i * step).toFixed(2);
      line += ` H ${x} V ${at(values[i]).toFixed(2)}`;
    }

    holder.classList.add("rm-step-chart");
    const list = sourceIn(holder);
    list?.classList.add("rm-step-chart-data");

    const svg = surface(w, h);
    const path = node("path", {
      class: "rm-step-chart-line",
      d: line,
      fill: "none",
      stroke: ink,
      "stroke-width": dataNumber(holder, "rmThickness", thickness),
      "stroke-linecap": "square",
      "stroke-linejoin": "miter",
    });
    svg.append(path);
    mount(holder, svg, "step-chart");

    cleanups.push(watch(holder, () => reveal(path, { duration: dataNumber(holder, "rmDuration", duration) }), {
      threshold, once: true,
    }));
    cleanups.push(() => {
      svg.remove();
      list?.classList.remove("rm-step-chart-data");
      holder.classList.remove("rm-step-chart");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * Open, high, low and close, in one mark.
 *
 * The body is a thick `<line>` from open to close rather than a `<rect>`,
 * which is what lets it be uncovered with `stroke-dashoffset` at a constant
 * width. A rect can only be scaled, and a scaled rect takes its stroke and its
 * corner radius with it, so every frame but the last has the wrong weight.
 *
 * Direction is a class as well as a colour: red and green are the two hues most
 * often confused, and a chart that carries its meaning only in them says
 * nothing to a good number of the people reading it. The real values stay in
 * the table underneath.
 *
 *   <div data-rm-candles>
 *     <table><tr data-rm-open="10" data-rm-high="14" data-rm-low="9" data-rm-close="13"><td>Mon</td></tr></table>
 *   </div>
 */
export function candlestick(target = "[data-rm-candles]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const {
    selector = "[data-rm-open]", up = "#2aa7e4", down = "#d28c65",
    duration = 620, stagger = 45, threshold = 0.2,
  } = options;
  const cleanups = [];

  for (const holder of holders) {
    const bars = [...holder.querySelectorAll(selector)]
      .map((row) => ({
        row,
        open: numberOn(row, "data-rm-open"),
        high: numberOn(row, "data-rm-high"),
        low: numberOn(row, "data-rm-low"),
        close: numberOn(row, "data-rm-close"),
      }))
      .filter((one) => [one.open, one.high, one.low, one.close].every((v) => v !== null));
    if (!bars.length) continue;

    const w = 100;
    const h = 46;
    const low = Math.min(...bars.map((one) => one.low));
    const high = Math.max(...bars.map((one) => one.high));
    const span = high - low || 1;
    const slot = w / bars.length;
    const body = Math.min(7, slot * 0.55);
    const at = (value) => h - ((value - low) / span) * (h - 4) - 2;

    holder.classList.add("rm-candles");
    const list = sourceIn(holder);
    list?.classList.add("rm-candles-data");

    const svg = surface(w, h);
    const drawn = [];
    bars.forEach((one, i) => {
      const x = slot * i + slot / 2;
      const rising = one.close >= one.open;
      const ink = rising ? dataString(holder, "rmColor", up) : down;
      one.row.classList.add(rising ? "is-up" : "is-down");

      const wick = node("line", {
        class: "rm-candles-wick", x1: x.toFixed(2), x2: x.toFixed(2),
        y1: at(one.high).toFixed(2), y2: at(one.low).toFixed(2),
        stroke: ink, "stroke-width": "1",
      });
      // A day that opened and closed at the same price still has to be visible,
      // so the body never collapses to nothing.
      const top = at(Math.max(one.open, one.close));
      const bottom = Math.max(at(Math.min(one.open, one.close)), top + 0.7);
      const block = node("line", {
        class: "rm-candles-body", x1: x.toFixed(2), x2: x.toFixed(2),
        y1: top.toFixed(2), y2: bottom.toFixed(2),
        stroke: ink, "stroke-width": body.toFixed(2), "stroke-linecap": "butt",
      });
      svg.append(wick, block);
      drawn.push([wick, block, i]);
    });
    mount(holder, svg, "candles");

    const draw = () => {
      for (const [wick, block, i] of drawn) {
        reveal(wick, { duration, delay: i * stagger });
        reveal(block, { duration, delay: i * stagger + 60 });
      }
    };

    cleanups.push(watch(holder, draw, { threshold, once: true }));
    cleanups.push(() => {
      svg.remove();
      bars.forEach((one) => one.row.classList.remove("is-up", "is-down"));
      list?.classList.remove("rm-candles-data");
      holder.classList.remove("rm-candles");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * How a total was arrived at.
 *
 * Each bar starts where the last one finished, so the running total is correct
 * at every point of the animation as well as at the end. The common version
 * grows all the bars from zero at once, which looks tidy and means the picture
 * is arithmetically wrong for the whole of its duration — the one thing a
 * waterfall exists to get right.
 *
 * A row marked `data-rm-total` is drawn from the axis instead: it is a sum, not
 * another step.
 *
 *   <ul data-rm-waterfall>
 *     <li data-rm-value="120">Opening</li>
 *     <li data-rm-value="-30">Churn</li>
 *     <li data-rm-value="90" data-rm-total>Closing</li>
 *   </ul>
 */
export function waterfall(target = "[data-rm-waterfall]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const {
    selector = "[data-rm-value]", rise = "#2aa7e4", fall = "#d28c65", total = "#6c695f",
    duration = 520, stagger = 130, threshold = 0.2,
  } = options;
  const cleanups = [];

  for (const holder of holders) {
    const rows = readRows(holder, selector);
    if (!rows.length) continue;

    // Walk the series once to find where every bar begins and ends.
    const steps = [];
    let running = 0;
    for (const { row, value } of rows) {
      const isTotal = row.hasAttribute("data-rm-total");
      const from = isTotal ? 0 : running;
      const to = isTotal ? value : running + value;
      if (!isTotal) running = to;
      steps.push({ row, from, to, isTotal, value });
    }

    const w = 100;
    const h = 46;
    const low = Math.min(0, ...steps.flatMap((one) => [one.from, one.to]));
    const high = Math.max(0, ...steps.flatMap((one) => [one.from, one.to]));
    const span = high - low || 1;
    const slot = w / steps.length;
    const width = Math.min(11, slot * 0.6);
    const at = (value) => h - ((value - low) / span) * (h - 4) - 2;

    holder.classList.add("rm-waterfall");

    const svg = surface(w, h);
    const drawn = [];
    steps.forEach((step, i) => {
      const x = slot * i + slot / 2;
      const ink = step.isTotal ? total : step.value >= 0 ? rise : fall;
      step.row.classList.add(step.isTotal ? "is-total" : step.value >= 0 ? "is-rise" : "is-fall");

      if (i > 0 && !step.isTotal) {
        svg.append(node("line", {
          class: "rm-waterfall-link",
          x1: (slot * (i - 1) + slot / 2 + width / 2).toFixed(2), x2: (x - width / 2).toFixed(2),
          y1: at(step.from).toFixed(2), y2: at(step.from).toFixed(2),
          stroke: "currentColor", "stroke-width": "0.6", "stroke-dasharray": "2 2", opacity: "0.35",
        }));
      }

      const bar = node("line", {
        class: "rm-waterfall-bar", x1: x.toFixed(2), x2: x.toFixed(2),
        y1: at(step.from).toFixed(2), y2: at(step.to).toFixed(2),
        stroke: ink, "stroke-width": width.toFixed(2), "stroke-linecap": "butt",
      });
      svg.append(bar);
      drawn.push([bar, i]);
    });
    mount(holder, svg, "waterfall");

    const draw = () => drawn.forEach(([bar, i]) => reveal(bar, { duration, delay: i * stagger }));

    cleanups.push(watch(holder, draw, { threshold, once: true }));
    cleanups.push(() => {
      svg.remove();
      steps.forEach((step) => step.row.classList.remove("is-total", "is-rise", "is-fall"));
      holder.classList.remove("rm-waterfall");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * A shape made of several scales at once.
 *
 * The outline is drawn round the polygon with `stroke-dashoffset` and the fill
 * fades in behind it. The obvious alternative — scaling the finished polygon up
 * from the centre — is wrong twice over: the stroke thickens as it grows, and
 * the shape passes through every smaller version of itself, which reads as the
 * values changing rather than as the chart appearing.
 *
 * The grid rings are drawn first and faintly, because a radar chart without its
 * scale is a decoration. The axis names stay in the list underneath.
 *
 *   <div data-rm-radar data-rm-max="100">
 *     <ul><li data-rm-value="80">Speed</li><li data-rm-value="55">Range</li>…</ul>
 *   </div>
 */
export function radar(target = "[data-rm-radar]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const {
    selector = "[data-rm-value]", color = "#2aa7e4", max = 100,
    levels = 4, duration = 1100, threshold = 0.25,
  } = options;
  const cleanups = [];

  for (const holder of holders) {
    const values = readSeries(holder, selector);
    if (values.length < 3) continue;

    const box = 100;
    const mid = box / 2;
    const radius = mid - 6;
    const top = Math.max(dataNumber(holder, "rmMax", max), ...values) || 1;
    const rings = clamp(dataNumber(holder, "rmLevels", levels), 1, 8);
    const ink = dataString(holder, "rmColor", color);
    const corner = (i, r) => {
      const angle = (i / values.length) * Math.PI * 2 - Math.PI / 2;
      return [mid + Math.cos(angle) * r, mid + Math.sin(angle) * r];
    };

    holder.classList.add("rm-radar");
    const list = sourceIn(holder);
    list?.classList.add("rm-radar-data");

    const svg = surface(box, box);
    for (let ring = 1; ring <= rings; ring++) {
      const r = (radius * ring) / rings;
      svg.append(node("polygon", {
        class: "rm-radar-ring",
        points: values.map((_, i) => corner(i, r).map((n) => n.toFixed(2)).join(",")).join(" "),
        fill: "none", stroke: "currentColor", "stroke-width": "0.5", opacity: "0.2",
      }));
    }
    values.forEach((_, i) => {
      const [x, y] = corner(i, radius);
      svg.append(node("line", {
        class: "rm-radar-spoke", x1: mid, y1: mid, x2: x.toFixed(2), y2: y.toFixed(2),
        stroke: "currentColor", "stroke-width": "0.5", opacity: "0.2",
      }));
    });

    const points = values
      .map((value, i) => corner(i, (clamp(value, 0, top) / top) * radius).map((n) => n.toFixed(2)).join(","))
      .join(" ");
    const skin = node("polygon", { class: "rm-radar-area", points, fill: ink, "fill-opacity": "0" });
    const edge = node("polygon", {
      class: "rm-radar-edge", points, fill: "none", stroke: ink,
      "stroke-width": "1.6", "stroke-linejoin": "round",
    });
    svg.append(skin, edge);
    mount(holder, svg, "radar");

    const draw = () => {
      reveal(edge, { duration: dataNumber(holder, "rmDuration", duration) });
      fadeIn(skin, 0.2, { duration: duration * 0.7, delay: duration * 0.4 });
    };

    cleanups.push(watch(holder, draw, { threshold, once: true }));
    cleanups.push(() => {
      svg.remove();
      list?.classList.remove("rm-radar-data");
      holder.classList.remove("rm-radar");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * A year of days, one square each.
 *
 * The counts are quantised into a handful of levels rather than mapped onto a
 * continuous ramp, because forty shades of one hue are forty shades nobody can
 * tell apart — the contribution grids that work all use five steps, and this
 * one says which step each day is on in its own `<title>` as well.
 *
 * Cells arrive on a diagonal sweep of `opacity` and a scale about their own
 * centre, so a year of squares costs one animation each and no layout at all.
 * The dates and counts stay in the list, which is the only version of this
 * chart anyone can read out loud.
 *
 *   <div data-rm-heat-calendar>
 *     <ul><li data-rm-date="2025-01-06" data-rm-value="4">4 commits</li>…</ul>
 *   </div>
 */
export function heatCalendar(target = "[data-rm-heat-calendar]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const {
    selector = "[data-rm-value]", color = "#2aa7e4", levels = 4,
    gap = 1.4, duration = 420, threshold = 0.15,
  } = options;
  const cleanups = [];

  for (const holder of holders) {
    const rows = readRows(holder, selector);
    if (!rows.length) continue;

    const steps = clamp(dataNumber(holder, "rmLevels", levels), 2, 6);
    const spacing = dataNumber(holder, "rmGap", gap);
    const ink = dataString(holder, "rmColor", color);
    const high = Math.max(...rows.map((one) => one.value)) || 1;

    // A date puts a day in its real column and weekday row; without one the
    // squares simply run in order, which is still an honest calendar strip.
    //
    // The origin is the earliest date in the set, not the first row in document
    // order. Taking it from position looks identical for a list written oldest
    // first and collapses the whole grid into one column for a list written
    // newest first, which is an ordinary way to write an activity feed: every
    // offset then comes out negative, the widest column is still row zero's own
    // zero, and the surface is sized one cell across with the year clipped away
    // outside it. Nothing throws; you simply get one square.
    const stamps = rows.map(({ row }) => moment(row.getAttribute("data-rm-date"))).filter((one) => one !== null);
    const first = stamps.length === rows.length ? Math.min(...stamps) : null;
    const placed = rows.map(({ row, value }, i) => {
      const when = moment(row.getAttribute("data-rm-date"));
      if (when === null || first === null) return { row, value, column: Math.floor(i / 7), line: i % 7 };
      const day = new Date(when);
      const days = Math.round((when - first) / 86400000);
      return { row, value, column: Math.floor((days + new Date(first).getDay()) / 7), line: day.getDay() };
    });

    const columns = Math.max(...placed.map((one) => one.column)) + 1;
    const cell = 10;
    const pitch = cell + spacing;

    holder.classList.add("rm-heat-calendar");
    const list = sourceIn(holder);
    list?.classList.add("rm-heat-calendar-data");

    const svg = surface(columns * pitch, 7 * pitch);
    const cells = [];
    for (const one of placed) {
      const level = one.value <= 0 ? 0 : Math.max(1, Math.ceil((one.value / high) * steps));
      const square = node("rect", {
        class: `rm-heat-calendar-cell is-level-${level}`,
        x: (one.column * pitch).toFixed(2), y: (one.line * pitch).toFixed(2),
        width: cell, height: cell, rx: 2,
        fill: ink, "fill-opacity": (level === 0 ? 0.08 : 0.2 + (level / steps) * 0.8).toFixed(3),
      });
      const title = node("title", {});
      title.textContent = `${one.row.getAttribute("data-rm-date") ?? ""} ${one.value}`.trim();
      square.append(title);
      svg.append(square);
      cells.push([square, one.column, one.line]);
      one.level = level;
      one.row.classList.add(`is-level-${level}`);
    }
    mount(holder, svg, "heat-calendar");

    const draw = () => {
      if (prefersReducedMotion()) return;
      for (const [square, column, line] of cells) {
        square.animate(
          [{ opacity: 0, transform: "scale(0.3)" }, { opacity: 1, transform: "none" }],
          { duration, delay: column * 14 + line * 9, easing: EASE.out, fill: "backwards" },
        );
      }
    };

    cleanups.push(watch(holder, draw, { threshold, once: true }));
    cleanups.push(() => {
      svg.remove();
      placed.forEach((one) => one.row.classList.remove(`is-level-${one.level}`));
      list?.classList.remove("rm-heat-calendar-data");
      holder.classList.remove("rm-heat-calendar");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * A measure against its target.
 *
 * A bullet graph says in one strip what a dial takes a whole card to say, and
 * it says the thing a dial cannot: whether the number is where it was supposed
 * to be. The comparative tick is the entire point, so it is drawn last, on top,
 * and it is also spelled out in the label.
 *
 * The measure is a thick `<line>` uncovered from the axis; the qualitative
 * bands behind it are static and deliberately colourless, because a background
 * that competes with the measure defeats the design.
 *
 *   <div data-rm-bullet data-rm-value="72" data-rm-target="85" data-rm-bands="40,70,100">
 *     Revenue
 *   </div>
 */
export function bulletChart(target = "[data-rm-bullet]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const {
    value = 0, max = 100, bands = "50,75,100", color = "#0e0e0e",
    duration = 900, threshold = 0.3, label = "Measure",
  } = options;
  const cleanups = [];

  for (const holder of holders) {
    const now = dataNumber(holder, "rmValue", value);
    const top = dataNumber(holder, "rmMax", max) || 1;
    const aim = dataNumber(holder, "rmTarget", NaN);
    const stops = dataString(holder, "rmBands", bands)
      .split(",").map((one) => Number(one.trim())).filter(Number.isFinite);

    const w = 100;
    const h = 3.2;
    const ink = dataString(holder, "rmColor", color);
    const name = dataString(holder, "rmLabel", holder.textContent.trim() || label);

    holder.classList.add("rm-bullet");
    holder.setAttribute("role", "img");
    const said = Number.isFinite(aim)
      ? `${name}: ${now} of ${top}, target ${aim}`
      : `${name}: ${now} of ${top}`;
    holder.setAttribute("aria-label", said);

    // The viewBox carries the proportions the strip wants to be drawn at, so it
    // can scale uniformly. Stretching it instead would need
    // `vector-effect: non-scaling-stroke`, and that quietly moves the dash
    // pattern into screen units, which turns a `pathLength` reveal into a row
    // of dashes.
    const svg = surface(w, h);
    stops.forEach((stop, i) => {
      svg.append(node("rect", {
        class: `rm-bullet-band is-band-${i}`, x: 0, y: 0,
        width: ((clamp(stop, 0, top) / top) * w).toFixed(2), height: h,
        fill: "currentColor", "fill-opacity": (0.16 - i * 0.045).toFixed(3),
      }));
    });
    const measure = node("line", {
      class: "rm-bullet-measure", x1: 0, x2: ((clamp(now, 0, top) / top) * w).toFixed(2),
      y1: h / 2, y2: h / 2, stroke: ink, "stroke-width": (h * 0.46).toFixed(2), "stroke-linecap": "butt",
    });
    svg.append(measure);

    let tick = null;
    if (Number.isFinite(aim)) {
      const x = ((clamp(aim, 0, top) / top) * w).toFixed(2);
      tick = node("line", {
        class: "rm-bullet-target", x1: x, x2: x, y1: h * 0.05, y2: h * 0.95,
        stroke: ink, "stroke-width": "0.55",
      });
      svg.append(tick);
    }
    mount(holder, svg, "bullet");

    const draw = () => {
      reveal(measure, { duration: dataNumber(holder, "rmDuration", duration) });
      if (tick && !prefersReducedMotion()) {
        tick.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, delay: duration * 0.7, easing: EASE.out, fill: "backwards" });
      }
    };

    cleanups.push(watch(holder, draw, { threshold, once: true }));
    cleanups.push(() => {
      svg.remove();
      holder.removeAttribute("role");
      holder.removeAttribute("aria-label");
      holder.classList.remove("rm-bullet");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * The stages, and the drop between them.
 *
 * The number people actually want from a funnel is the one nobody draws: how
 * much was lost at each step. So it is computed from the markup and written
 * into each stage as real text — not painted into the SVG, where it would be
 * unreadable, untranslatable and invisible to a screen reader.
 *
 * The trapezoids are laid out once at their final widths and only their
 * outlines move, drawn with `stroke-dashoffset` while the fills fade behind
 * them. Nothing animates a width, so a funnel arriving cannot shove the labels
 * beside it around.
 *
 *   <ol data-rm-funnel>
 *     <li data-rm-value="4200">Visited</li><li data-rm-value="1800">Signed up</li>
 *   </ol>
 */
export function funnel(target = "[data-rm-funnel]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const {
    selector = "[data-rm-value]", color = "#2aa7e4",
    duration = 620, stagger = 120, threshold = 0.2, drops = true,
  } = options;
  const cleanups = [];

  for (const holder of holders) {
    const rows = readRows(holder, selector);
    if (rows.length < 2) continue;

    const w = 100;
    const band = 22;
    const h = band * rows.length;
    const ink = dataString(holder, "rmColor", color);
    const high = Math.max(...rows.map((one) => one.value)) || 1;
    const half = (value) => (clamp(value / high, 0, 1) * w) / 2;

    holder.classList.add("rm-funnel");

    const svg = surface(w, h);
    const stages = [];
    rows.forEach(({ value }, i) => {
      const next = rows[i + 1]?.value ?? value * 0.82;
      const top = band * i;
      const bottom = top + band - 1.5;
      const a = half(value);
      const b = half(next);
      const points = [
        `${(w / 2 - a).toFixed(2)},${top}`, `${(w / 2 + a).toFixed(2)},${top}`,
        `${(w / 2 + b).toFixed(2)},${bottom}`, `${(w / 2 - b).toFixed(2)},${bottom}`,
      ].join(" ");
      const skin = node("polygon", { class: "rm-funnel-fill", points, fill: ink, "fill-opacity": "0" });
      const edge = node("polygon", {
        class: "rm-funnel-edge", points, fill: "none", stroke: ink,
        "stroke-width": "1", "stroke-linejoin": "round",
      });
      svg.append(skin, edge);
      stages.push([skin, edge, i]);
    });
    mount(holder, svg, "funnel");

    // The drop-off, as text, on the stage it belongs to.
    const notes = [];
    if (drops) {
      rows.forEach(({ row, value }, i) => {
        if (i === 0) return;
        const before = rows[i - 1].value || 1;
        const share = ((value / before) - 1) * 100;
        const note = document.createElement("span");
        note.className = "rm-funnel-drop";
        note.textContent = `${share < 0 ? "−" : "+"}${Math.abs(share).toFixed(1)}%`;
        note.setAttribute("aria-label", `${share < 0 ? "down" : "up"} ${Math.abs(share).toFixed(1)} per cent on the stage before`);
        row.appendChild(note);
        notes.push(note);
      });
    }

    const draw = () => {
      for (const [skin, edge, i] of stages) {
        reveal(edge, { duration, delay: i * stagger });
        fadeIn(skin, 0.85 - i * 0.12, { duration, delay: i * stagger + 120 });
      }
    };

    cleanups.push(watch(holder, draw, { threshold, once: true }));
    cleanups.push(() => {
      svg.remove();
      notes.forEach((note) => note.remove());
      holder.classList.remove("rm-funnel");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * Parts of a whole, sized by area.
 *
 * Laid out with the squarified algorithm, which keeps every tile as close to
 * square as it can. The naive slice-and-dice split — cut the whole strip for
 * each value in turn — produces slivers a hundred times longer than they are
 * wide, and nobody can compare the areas of two slivers, which is the only job
 * a treemap has.
 *
 * The tiles are positioned once at their true sizes; the reveal is an outline
 * drawn with `stroke-dashoffset` and a fill that fades behind it, so no width
 * or height is ever animated. The names and values stay in the list beside it.
 *
 *   <div data-rm-treemap>
 *     <ul><li data-rm-value="45">Search</li><li data-rm-value="25">Direct</li></ul>
 *   </div>
 */
export function treemap(target = "[data-rm-treemap]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const {
    selector = "[data-rm-value]", palette = PALETTE, ratio = 0.62,
    duration = 640, stagger = 90, threshold = 0.2,
  } = options;
  const cleanups = [];

  for (const holder of holders) {
    const rows = readRows(holder, selector).filter((one) => one.value > 0);
    if (!rows.length) continue;

    const w = 100;
    // `data-rm-ratio`, not `data-rm-size`: this is a proportion, and everywhere
    // else in the module `data-rm-size` is a pixel dimension. One name meaning
    // two things is how an author copies `data-rm-size="120"` off the rings
    // example and gets a surface a hundred and twenty times taller than wide.
    const h = Math.max(20, w * dataNumber(holder, "rmRatio", ratio));
    const sum = rows.reduce((all, one) => all + one.value, 0) || 1;
    const sorted = [...rows].sort((a, b) => b.value - a.value);

    // Squarify: fill a row of tiles while doing so improves the worst aspect
    // ratio in it, and start a new row the moment it stops.
    const tiles = [];
    let free = { x: 0, y: 0, w, h };
    let queue = sorted.map((one) => ({ ...one, area: (one.value / sum) * w * h }));
    const worst = (row, side) => {
      const total = row.reduce((all, one) => all + one.area, 0);
      const big = Math.max(...row.map((one) => one.area));
      const small = Math.min(...row.map((one) => one.area));
      return Math.max((side * side * big) / (total * total), (total * total) / (side * side * small));
    };

    while (queue.length) {
      const side = Math.min(free.w, free.h);
      const row = [queue[0]];
      let rest = queue.slice(1);
      while (rest.length && worst([...row, rest[0]], side) <= worst(row, side)) {
        row.push(rest[0]);
        rest = rest.slice(1);
      }
      const total = row.reduce((all, one) => all + one.area, 0);
      const depth = total / side;
      let along = 0;
      for (const one of row) {
        const length = one.area / depth;
        if (free.w >= free.h) {
          tiles.push({ ...one, x: free.x, y: free.y + along, w: depth, h: length });
        } else {
          tiles.push({ ...one, x: free.x + along, y: free.y, w: length, h: depth });
        }
        along += length;
      }
      if (free.w >= free.h) free = { x: free.x + depth, y: free.y, w: free.w - depth, h: free.h };
      else free = { x: free.x, y: free.y + depth, w: free.w, h: free.h - depth };
      queue = rest;
    }

    holder.classList.add("rm-treemap");
    const list = sourceIn(holder);
    list?.classList.add("rm-treemap-data");

    const svg = surface(w, h);
    const drawn = [];
    tiles.forEach((tile, i) => {
      const ink = tile.row.getAttribute("data-rm-color") ?? palette[i % palette.length];
      const box = { x: tile.x + 0.5, y: tile.y + 0.5, width: Math.max(0, tile.w - 1), height: Math.max(0, tile.h - 1), rx: 1.5 };
      const skin = node("rect", { class: "rm-treemap-tile", ...box, fill: ink, "fill-opacity": "0" });
      const edge = node("rect", { class: "rm-treemap-edge", ...box, fill: "none", stroke: ink, "stroke-width": "1" });
      svg.append(skin, edge);
      drawn.push([skin, edge, i]);

      const swatch = document.createElement("i");
      swatch.className = "rm-treemap-swatch";
      swatch.setAttribute("aria-hidden", "true");
      swatch.style.background = ink;
      tile.row.prepend(swatch);
    });
    mount(holder, svg, "treemap");

    const draw = () => {
      for (const [skin, edge, i] of drawn) {
        reveal(edge, { duration, delay: i * stagger });
        fadeIn(skin, 0.82, { duration, delay: i * stagger + 100 });
      }
    };

    cleanups.push(watch(holder, draw, { threshold, once: true }));
    cleanups.push(() => {
      svg.remove();
      holder.querySelectorAll(".rm-treemap-swatch").forEach((one) => one.remove());
      list?.classList.remove("rm-treemap-data");
      holder.classList.remove("rm-treemap");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * Concentric rings, activity style.
 *
 * Every ring is a real arc — one `<circle>` with `pathLength="1"` and a dash
 * pair — so the ends are properly rounded and the length is exact. The version
 * built from two rotated half-discs can have neither, and breaks entirely the
 * moment a ring passes a hundred per cent.
 *
 * The rings share a single SVG so they cannot drift out of true, and each one's
 * value is carried by its own list item as a `role="progressbar"`. Rings are a
 * picture; the list is the reading.
 *
 *   <div data-rm-activity-rings>
 *     <ul><li data-rm-value="86">Move</li><li data-rm-value="120">Exercise</li></ul>
 *   </div>
 */
export function progressRings(target = "[data-rm-activity-rings]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const {
    selector = "[data-rm-value]", palette = PALETTE, size = 120, thickness = 11,
    gap = 3.5, duration = 1200, stagger = 130, threshold = 0.3,
  } = options;
  const cleanups = [];

  for (const holder of holders) {
    const rows = readRows(holder, selector);
    if (!rows.length) continue;

    const box = dataNumber(holder, "rmSize", size);
    const weight = dataNumber(holder, "rmThickness", thickness);
    const spacing = dataNumber(holder, "rmGap", gap);
    const mid = box / 2;

    holder.classList.add("rm-activity-rings");
    holder.style.setProperty("--rm-activity-rings-size", `${box}px`);
    const list = sourceIn(holder);
    list?.classList.add("rm-activity-rings-data");

    const svg = surface(box, box);
    const arcs = [];
    rows.forEach(({ row, value }, i) => {
      const radius = mid - weight / 2 - i * (weight + spacing);
      if (radius <= weight) return;
      const ink = row.getAttribute("data-rm-color") ?? palette[i % palette.length];
      const share = clamp(value / (numberOn(row, "data-rm-max") ?? 100), 0, 1);

      svg.append(node("circle", {
        class: "rm-activity-rings-track", cx: mid, cy: mid, r: radius.toFixed(2),
        fill: "none", stroke: ink, "stroke-opacity": "0.16", "stroke-width": weight,
      }));
      const arc = node("circle", {
        class: "rm-activity-rings-arc", cx: mid, cy: mid, r: radius.toFixed(2), pathLength: "1",
        fill: "none", stroke: ink, "stroke-width": weight, "stroke-linecap": "round",
        "stroke-dasharray": `${share.toFixed(4)} ${(1 - share).toFixed(4)}`,
        transform: `rotate(-90 ${mid} ${mid})`,
      });
      svg.append(arc);
      arcs.push([arc, share, i]);

      row.classList.add("rm-activity-rings-row");
      row.setAttribute("role", "progressbar");
      row.setAttribute("aria-valuemin", "0");
      row.setAttribute("aria-valuemax", String(numberOn(row, "data-rm-max") ?? 100));
      row.setAttribute("aria-valuenow", String(value));
      row.style.setProperty("--rm-activity-rings-ink", ink);
    });
    mount(holder, svg, "activity-rings");

    const draw = () => {
      if (prefersReducedMotion()) return;
      for (const [arc, share, i] of arcs) {
        // The dash pair itself grows: an arc has no "start" a dashoffset could
        // sweep, so the length of the visible dash is what has to change.
        arc.animate(
          [{ strokeDasharray: "0 1" }, { strokeDasharray: `${share.toFixed(4)} ${(1 - share).toFixed(4)}` }],
          { duration, delay: i * stagger, easing: EASE.out, fill: "backwards" },
        );
      }
    };

    cleanups.push(watch(holder, draw, { threshold, once: true }));
    cleanups.push(() => {
      svg.remove();
      rows.forEach(({ row }) => {
        row.classList.remove("rm-activity-rings-row");
        row.removeAttribute("role");
        row.removeAttribute("aria-valuemin");
        row.removeAttribute("aria-valuemax");
        row.removeAttribute("aria-valuenow");
        row.style.removeProperty("--rm-activity-rings-ink");
      });
      list?.classList.remove("rm-activity-rings-data");
      holder.style.removeProperty("--rm-activity-rings-size");
      holder.classList.remove("rm-activity-rings");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * Two series back to back on one scale.
 *
 * Both sides are measured against the larger of the two maxima, which is the
 * whole argument for the chart: scale each half to its own maximum — the
 * mistake almost every back-to-back chart makes — and a series a tenth the size
 * of the other appears to match it exactly.
 *
 * Each half grows outward from the centre gutter as a thick `<line>` uncovered
 * with `stroke-dashoffset`, so nothing is scaled and nothing reflows. The gutter
 * is a separator and not a label column: the names stay in the list under the
 * drawing, where they can be read, selected and translated, rather than being
 * redrawn as SVG text nobody can copy.
 *
 *   <ul data-rm-compare-bars>
 *     <li data-rm-left="42" data-rm-right="61">Mon</li>
 *   </ul>
 */
export function comparisonBars(target = "[data-rm-compare-bars]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const {
    selector = "[data-rm-left]", left = "#2aa7e4", right = "#d28c65",
    gap = 14, duration = 700, stagger = 80, threshold = 0.2,
  } = options;
  const cleanups = [];

  for (const holder of holders) {
    const rows = [...holder.querySelectorAll(selector)]
      .map((row) => ({ row, a: numberOn(row, "data-rm-left"), b: numberOn(row, "data-rm-right") }))
      .filter((one) => one.a !== null && one.b !== null);
    if (!rows.length) continue;

    const w = 100;
    const line = 12;
    const h = line * rows.length;
    const gutter = dataNumber(holder, "rmGap", gap);
    const arm = (w - gutter) / 2;
    // One scale for both sides. This single line is the component.
    const high = Math.max(...rows.flatMap((one) => [one.a, one.b])) || 1;

    holder.classList.add("rm-compare-bars");

    const svg = surface(w, h);
    const drawn = [];
    rows.forEach(({ a, b }, i) => {
      const y = line * i + line / 2;
      const mid = w / 2;
      const barA = node("line", {
        class: "rm-compare-bars-left", x1: mid - gutter / 2, x2: (mid - gutter / 2 - (a / high) * arm).toFixed(2),
        y1: y, y2: y, stroke: dataString(holder, "rmColor", left), "stroke-width": line * 0.6, "stroke-linecap": "butt",
      });
      const barB = node("line", {
        class: "rm-compare-bars-right", x1: mid + gutter / 2, x2: (mid + gutter / 2 + (b / high) * arm).toFixed(2),
        y1: y, y2: y, stroke: right, "stroke-width": line * 0.6, "stroke-linecap": "butt",
      });
      svg.append(barA, barB);
      drawn.push([barA, barB, i]);
    });
    mount(holder, svg, "compare-bars");

    const draw = () => drawn.forEach(([barA, barB, i]) => {
      reveal(barA, { duration, delay: i * stagger });
      reveal(barB, { duration, delay: i * stagger });
    });

    cleanups.push(watch(holder, draw, { threshold, once: true }));
    cleanups.push(() => {
      svg.remove();
      holder.classList.remove("rm-compare-bars");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * A bar sparkline the size of a word.
 *
 * Bars rather than a line, because for counts — messages a day, builds an hour
 * — the gaps between the readings are real and a line paints over them. The
 * highest and lowest bars get their own classes and their own colours, the peak
 * in the accent and the trough muted back, since the point of a chart this small
 * is the shape and its extremes, and picking those out by eye at fourteen pixels
 * tall is not something anyone should be asked to do.
 *
 * Each bar is a thick `<line>` uncovered from the baseline, so a strip of forty
 * costs forty dash animations and no layout.
 *
 *   <span data-rm-spark-bars data-rm-values="3,7,4,9,6,11,8"></span>
 */
export function sparkBars(target = "[data-rm-spark-bars]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const {
    selector = "[data-rm-value]", color = "#2aa7e4", peak = "#d28c65",
    duration = 480, stagger = 26, threshold = 0.2,
  } = options;
  const cleanups = [];

  for (const holder of holders) {
    const values = readSeries(holder, selector);
    if (!values.length) continue;

    const w = Math.max(24, values.length * 4);
    // Roughly two and a half times as wide as it is tall, whatever the count:
    // a sparkline has to sit on a line of text without stretching it.
    const h = Math.max(8, w / 2.4);
    const slot = w / values.length;
    const ink = dataString(holder, "rmColor", color);
    const high = Math.max(...values);
    const low = Math.min(...values);
    const floor = Math.min(0, low);
    const span = high - floor || 1;
    // Where zero sits once the scale has been widened to hold a negative floor.
    // Scaling against a span that includes the negatives while still drawing
    // every bar up from the bottom edge is the quiet mistake here: it mis-sizes
    // the positive bars and sends the negative ones out through the foot of the
    // viewBox, where `overflow: visible` lets them cross the line of text
    // underneath. With one origin, negatives hang below it and positives rise.
    const base = h - ((0 - floor) / span) * (h - 1);

    holder.classList.add("rm-spark-bars");
    holder.setAttribute("role", "img");
    holder.setAttribute(
      "aria-label",
      dataString(holder, "rmLabel", `${values.length} readings, from ${low} to ${high}`),
    );

    const svg = surface(w, h);
    const drawn = [];
    values.forEach((value, i) => {
      const x = slot * i + slot / 2;
      const bar = node("line", {
        class: `rm-spark-bars-bar${value === high ? " is-high" : value === low ? " is-low" : ""}`,
        x1: x.toFixed(2), x2: x.toFixed(2), y1: base.toFixed(2), y2: (base - (value / span) * (h - 1)).toFixed(2),
        stroke: value === high ? peak : ink, "stroke-width": (slot * 0.6).toFixed(2), "stroke-linecap": "butt",
      });
      svg.append(bar);
      drawn.push([bar, i]);
    });
    mount(holder, svg, "spark-bars");

    const draw = () => drawn.forEach(([bar, i]) => reveal(bar, { duration, delay: i * stagger }));

    cleanups.push(watch(holder, draw, { threshold, once: true }));
    cleanups.push(() => {
      svg.remove();
      holder.removeAttribute("role");
      holder.removeAttribute("aria-label");
      holder.classList.remove("rm-spark-bars");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * Up or down, with a real sign.
 *
 * One number in the markup decides the arrow, the colour, the class and the
 * spoken label, so the badge cannot end up green with a downward arrow — which
 * is exactly what happens when a template sets the two independently. Zero is
 * flat, not up.
 *
 * The sign is a real minus, U+2212, not a hyphen: a hyphen in a proportional
 * face is a shorter, lower mark that reads as punctuation, and screen readers
 * treat the two differently. The badge arrives on a transform in the direction
 * it means.
 *
 *   <span data-rm-delta-badge="-4.2"></span>
 */
export function deltaBadge(target = "[data-rm-delta-badge]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const {
    up = "▲", down = "▼", flat = "—", suffix = "%", decimals = 1, duration = 420,
  } = options;
  const cleanups = [];

  for (const holder of holders) {
    const delta = dataNumber(holder, "rmDeltaBadge", dataNumber(holder, "rmValue", NaN));
    if (!Number.isFinite(delta)) continue;

    const places = clamp(dataNumber(holder, "rmDecimals", decimals), 0, 4);
    const unit = dataString(holder, "rmSuffix", suffix);
    const way = delta > 0 ? "up" : delta < 0 ? "down" : "flat";
    const size = Math.abs(delta).toFixed(places);

    holder.classList.add("rm-delta-badge", `is-${way}`);

    const arrow = document.createElement("span");
    arrow.className = "rm-delta-badge-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = { up, down, flat }[way];

    const figure = document.createElement("span");
    figure.className = "rm-delta-badge-figure";
    figure.setAttribute("aria-hidden", "true");
    figure.textContent = `${way === "down" ? "−" : way === "up" ? "+" : ""}${size}${unit}`;

    // The spoken version says the direction in words, because "▼ 4.2%" is read
    // out as either nothing at all or as a black triangle.
    const said = document.createElement("span");
    said.className = "rm-delta-badge-value";
    said.textContent = `${way === "up" ? "up" : way === "down" ? "down" : "no change,"} ${size}${unit === "%" ? " per cent" : unit}`;

    const was = holder.innerHTML;
    holder.replaceChildren(arrow, figure, said);

    if (!prefersReducedMotion()) {
      const from = way === "down" ? 5 : way === "up" ? -5 : 0;
      arrow.animate(
        [{ opacity: 0, transform: `translateY(${from}px)` }, { opacity: 1, transform: "none" }],
        { duration, easing: EASE.out },
      );
    }

    cleanups.push(() => {
      holder.innerHTML = was;
      holder.classList.remove("rm-delta-badge", `is-${way}`);
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A headline figure that counts up.
 *
 * The counting face is `aria-hidden` and a second, unmoving copy of the real
 * figure sits beside it for anything that reads the page. The usual count-up
 * animates the text of a live element, so a screen reader announces sixty
 * intermediate numbers on the way to one — and reflows its container on every
 * frame, because "9" and "1,204" are not the same width.
 *
 * The digits are tabular, the count runs on the shared frame loop and only
 * while the figure is on screen, and it runs once. Under reduced motion the
 * number is simply the number.
 *
 *   <strong data-rm-big-number>1,204</strong>
 */
export function bigNumber(target = "[data-rm-big-number]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { duration = 1600, decimals = 0, prefix = "", suffix = "" } = options;
  const cleanups = [];

  for (const holder of holders) {
    const written = holder.textContent.trim();
    const final = dataNumber(holder, "rmBigNumber", Number(written.replace(/[^\d.-]/g, "")));
    if (!Number.isFinite(final)) continue;

    const places = clamp(dataNumber(holder, "rmDecimals", decimals), 0, 6);
    const before = dataString(holder, "rmPrefix", prefix);
    const after = dataString(holder, "rmSuffix", suffix);
    const span = Math.max(1, dataNumber(holder, "rmDuration", duration));

    holder.classList.add("rm-big-number");

    const face = document.createElement("span");
    face.className = "rm-big-number-face";
    face.setAttribute("aria-hidden", "true");
    face.textContent = written;

    const said = document.createElement("span");
    said.className = "rm-big-number-value";
    said.textContent = written;

    const was = holder.innerHTML;
    holder.replaceChildren(face, said);

    let spent = prefersReducedMotion();
    const play = () => {
      if (spent) return () => {};
      spent = true;
      let from = 0;
      const stop = onFrame((now) => {
        if (!from) from = now;
        const t = clamp((now - from) / span, 0, 1);
        const eased = 1 - (1 - t) ** 3;
        face.textContent = formatted(final * eased, places, before, after);
        // The last frame restores the author's own string, so a hand-formatted
        // figure keeps its formatting rather than being replaced by ours.
        if (t >= 1) { face.textContent = written; stop(); }
      });
      return stop;
    };

    cleanups.push(whileVisible(holder, play));
    cleanups.push(() => {
      holder.innerHTML = was;
      holder.classList.remove("rm-big-number");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * A band with a marker in it.
 *
 * A minimum, a maximum and where the value actually sits — the shape you want
 * for a temperature range, a salary band or a delivery estimate, and the shape
 * a single bar cannot express. The band is drawn from its low end with
 * `stroke-dashoffset` and the marker arrives afterwards, so it lands on a band
 * that already exists rather than racing it.
 *
 * It is one `role="img"` with a sentence for a label, because "42" on its own
 * is not the information: "42, in a range from 10 to 90" is.
 *
 *   <div data-rm-range-bar data-rm-low="32" data-rm-high="68" data-rm-value="47"
 *        data-rm-min="0" data-rm-max="100">Delivery window</div>
 */
export function rangeBar(target = "[data-rm-range-bar]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const {
    min = 0, max = 100, color = "#2aa7e4", duration = 780, threshold = 0.3, label = "Range",
  } = options;
  const cleanups = [];

  for (const holder of holders) {
    const floor = dataNumber(holder, "rmMin", min);
    const ceiling = dataNumber(holder, "rmMax", max);
    const scale = ceiling - floor || 1;
    const low = dataNumber(holder, "rmLow", floor);
    const high = dataNumber(holder, "rmHigh", ceiling);
    const now = dataNumber(holder, "rmValue", NaN);

    const w = 100;
    const h = 2.8;
    const ink = dataString(holder, "rmColor", color);
    const name = dataString(holder, "rmLabel", holder.textContent.trim() || label);
    const at = (value) => (clamp((value - floor) / scale, 0, 1) * w);

    holder.classList.add("rm-range-bar");
    holder.setAttribute("role", "img");
    holder.setAttribute(
      "aria-label",
      Number.isFinite(now)
        ? `${name}: ${now}, in a band from ${low} to ${high}`
        : `${name}: from ${low} to ${high}`,
    );

    const svg = surface(w, h);
    svg.append(node("line", {
      class: "rm-range-bar-track", x1: 0, x2: w, y1: h / 2, y2: h / 2,
      stroke: "currentColor", "stroke-opacity": "0.14",
      "stroke-width": (h * 0.7).toFixed(2), "stroke-linecap": "round",
    }));
    const band = node("line", {
      class: "rm-range-bar-band", x1: at(low).toFixed(2), x2: at(high).toFixed(2), y1: h / 2, y2: h / 2,
      stroke: ink, "stroke-width": (h * 0.7).toFixed(2), "stroke-linecap": "round",
    });
    svg.append(band);

    // A tick rather than a dot, and drawn like everything else: the marker is
    // uncovered from the middle out once the band it sits on exists.
    let marker = null;
    if (Number.isFinite(now)) {
      const x = at(now).toFixed(2);
      marker = node("line", {
        class: "rm-range-bar-marker", x1: x, x2: x, y1: 0, y2: h,
        stroke: "var(--rm-ink, #0e0e0e)", "stroke-width": "0.7", "stroke-linecap": "round",
      });
      svg.append(marker);
    }
    mount(holder, svg, "range-bar");

    const draw = () => {
      reveal(band, { duration: dataNumber(holder, "rmDuration", duration) });
      if (marker) reveal(marker, { duration: 300, delay: duration * 0.7 });
    };

    cleanups.push(watch(holder, draw, { threshold, once: true }));
    cleanups.push(() => {
      svg.remove();
      holder.removeAttribute("role");
      holder.removeAttribute("aria-label");
      holder.classList.remove("rm-range-bar");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * Real arcs, not rotated half-discs.
 *
 * Each slice is one `<circle>` with `pathLength="1"` and a dash pair, rotated
 * to its start angle. The half-disc trick that most pie charts use cannot round
 * a cap, cannot leave a gap between slices, needs a second element and a clip
 * as soon as a slice passes fifty per cent, and quietly draws the wrong thing
 * when it does.
 *
 * Slices sweep by growing the dash itself, because an arc has no start for a
 * dashoffset to travel from. The legend swatches take their colours from the
 * same array as the slices, so a legend cannot disagree with its chart.
 *
 *   <div data-rm-pie>
 *     <ul><li data-rm-value="42">Direct</li><li data-rm-value="31">Search</li></ul>
 *   </div>
 */
export function pieSlices(target = "[data-rm-pie]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const {
    selector = "[data-rm-value]", palette = PALETTE, size = 100, thickness = 0,
    gap = 0.004, duration = 900, stagger = 110, threshold = 0.25,
  } = options;
  const cleanups = [];

  for (const holder of holders) {
    const rows = readRows(holder, selector).filter((one) => one.value > 0);
    if (!rows.length) continue;

    const box = dataNumber(holder, "rmSize", size);
    const mid = box / 2;
    // A thickness of zero means a filled pie: a stroke as wide as the radius,
    // drawn on a circle of half that radius, closes the middle exactly.
    const ring = dataNumber(holder, "rmThickness", thickness);
    const weight = ring > 0 ? ring : mid;
    const radius = ring > 0 ? mid - ring / 2 : mid / 2;
    const sum = rows.reduce((all, one) => all + one.value, 0) || 1;

    holder.classList.add("rm-pie");
    holder.style.setProperty("--rm-pie-size", `${box}px`);
    const list = sourceIn(holder);
    list?.classList.add("rm-pie-data");

    const svg = surface(box, box);
    const arcs = [];
    let turned = 0;
    rows.forEach(({ row, value }, i) => {
      const share = Math.max(0, value / sum - gap);
      const ink = row.getAttribute("data-rm-color") ?? palette[i % palette.length];
      const arc = node("circle", {
        class: "rm-pie-slice", cx: mid, cy: mid, r: radius.toFixed(2), pathLength: "1",
        fill: "none", stroke: ink, "stroke-width": weight.toFixed(2),
        "stroke-dasharray": `${share.toFixed(4)} ${(1 - share).toFixed(4)}`,
        transform: `rotate(${(turned * 360 - 90).toFixed(2)} ${mid} ${mid})`,
      });
      svg.append(arc);
      arcs.push([arc, share, i]);
      turned += value / sum;

      const swatch = document.createElement("i");
      swatch.className = "rm-pie-swatch";
      swatch.setAttribute("aria-hidden", "true");
      swatch.style.background = ink;
      row.prepend(swatch);

      const note = document.createElement("span");
      note.className = "rm-pie-share";
      note.textContent = ` ${((value / sum) * 100).toFixed(1)}%`;
      row.appendChild(note);
    });
    mount(holder, svg, "pie");

    const draw = () => {
      if (prefersReducedMotion()) return;
      for (const [arc, share, i] of arcs) {
        arc.animate(
          [{ strokeDasharray: "0 1" }, { strokeDasharray: `${share.toFixed(4)} ${(1 - share).toFixed(4)}` }],
          { duration, delay: i * stagger, easing: EASE.out, fill: "backwards" },
        );
      }
    };

    cleanups.push(watch(holder, draw, { threshold, once: true }));
    cleanups.push(() => {
      svg.remove();
      holder.querySelectorAll(".rm-pie-swatch, .rm-pie-share").forEach((one) => one.remove());
      list?.classList.remove("rm-pie-data");
      holder.style.removeProperty("--rm-pie-size");
      holder.classList.remove("rm-pie");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * Points, and the line they imply.
 *
 * The trend line is computed by least squares from the same numbers the dots
 * came from, rather than being an extra path somebody drew by eye and now has
 * to remember to update. It is drawn with `stroke-dashoffset` after the dots
 * have landed, which is also the order in which the argument should be made:
 * here is the data, and here is what it suggests.
 *
 * The dots scale up about their own centres, which is a transform on a
 * `fill-box`, so a hundred points cost a hundred compositor animations and no
 * layout at all.
 *
 *   <div data-rm-scatter>
 *     <ul><li data-rm-x="3" data-rm-y="14">Batch A</li>…</ul>
 *   </div>
 */
export function scatterPlot(target = "[data-rm-scatter]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const {
    selector = "[data-rm-x]", color = "#2aa7e4", trend = true,
    duration = 420, stagger = 24, threshold = 0.2,
  } = options;
  const cleanups = [];

  for (const holder of holders) {
    const points = [...holder.querySelectorAll(selector)]
      .map((row) => ({ row, x: numberOn(row, "data-rm-x"), y: numberOn(row, "data-rm-y") }))
      .filter((one) => one.x !== null && one.y !== null);
    if (points.length < 2) continue;

    const w = 100;
    const h = 62;
    const pad = 4;
    const ink = dataString(holder, "rmColor", color);
    const xs = points.map((one) => one.x);
    const ys = points.map((one) => one.y);
    const xLow = Math.min(...xs);
    const xHigh = Math.max(...xs);
    const yLow = Math.min(...ys);
    const yHigh = Math.max(...ys);
    const xSpan = xHigh - xLow || 1;
    const ySpan = yHigh - yLow || 1;
    const px = (x) => pad + ((x - xLow) / xSpan) * (w - pad * 2);
    const py = (y) => h - pad - ((y - yLow) / ySpan) * (h - pad * 2);

    holder.classList.add("rm-scatter");
    const list = sourceIn(holder);
    list?.classList.add("rm-scatter-data");

    const svg = surface(w, h);
    let fit = null;
    if (dataString(holder, "rmTrend", trend ? "on" : "off") !== "off") {
      const n = points.length;
      const sx = xs.reduce((a, b) => a + b, 0);
      const sy = ys.reduce((a, b) => a + b, 0);
      const sxy = points.reduce((all, one) => all + one.x * one.y, 0);
      const sxx = points.reduce((all, one) => all + one.x * one.x, 0);
      const bottom = n * sxx - sx * sx;
      if (bottom !== 0) {
        const slope = (n * sxy - sx * sy) / bottom;
        const intercept = (sy - slope * sx) / n;
        fit = node("line", {
          class: "rm-scatter-trend",
          x1: px(xLow).toFixed(2), y1: py(slope * xLow + intercept).toFixed(2),
          x2: px(xHigh).toFixed(2), y2: py(slope * xHigh + intercept).toFixed(2),
          stroke: ink, "stroke-opacity": "0.5", "stroke-width": "1", "stroke-linecap": "round",
        });
        svg.append(fit);
      }
    }

    const dots = points.map((one, i) => {
      const dot = node("circle", {
        class: "rm-scatter-dot", cx: px(one.x).toFixed(2), cy: py(one.y).toFixed(2), r: 2.2,
        fill: ink, "fill-opacity": "0.8",
      });
      svg.append(dot);
      return [dot, i];
    });
    mount(holder, svg, "scatter");

    const draw = () => {
      if (!prefersReducedMotion()) {
        for (const [dot, i] of dots) {
          dot.animate(
            [{ opacity: 0, transform: "scale(0)" }, { opacity: 1, transform: "none" }],
            { duration, delay: i * stagger, easing: EASE.spring, fill: "backwards" },
          );
        }
      }
      if (fit) reveal(fit, { duration: 800, delay: prefersReducedMotion() ? 0 : dots.length * stagger });
    };

    cleanups.push(watch(holder, draw, { threshold, once: true }));
    cleanups.push(() => {
      svg.remove();
      list?.classList.remove("rm-scatter-data");
      holder.classList.remove("rm-scatter");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * Spans of time on one shared scale.
 *
 * Every row is measured against the same start and end, worked out from all the
 * rows together, so the columns line up. The version that gives each row a
 * percentage of its own — which is what happens when the markup carries widths
 * rather than dates — produces a chart where two bars of the same length are
 * two different lengths of time, and nobody notices until a plan is made from
 * it.
 *
 * Dates are parsed once with `Date.parse`, so an ISO date and a plain number
 * both work; bars are thick lines uncovered from their start.
 *
 *   <ol data-rm-timeline-chart>
 *     <li data-rm-start="2025-01-01" data-rm-end="2025-03-15">Discovery</li>
 *   </ol>
 */
export function timelineChart(target = "[data-rm-timeline-chart]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const {
    selector = "[data-rm-start]", palette = PALETTE,
    duration = 720, stagger = 110, threshold = 0.2,
  } = options;
  const cleanups = [];

  for (const holder of holders) {
    const rows = [...holder.querySelectorAll(selector)]
      .map((row) => ({
        row,
        from: moment(row.getAttribute("data-rm-start")),
        to: moment(row.getAttribute("data-rm-end")),
      }))
      .filter((one) => one.from !== null && one.to !== null);
    if (!rows.length) continue;

    const w = 100;
    const line = 12;
    const h = line * rows.length;
    const first = Math.min(...rows.map((one) => one.from));
    const last = Math.max(...rows.map((one) => one.to));
    const scale = last - first || 1;
    const at = (moment_) => ((moment_ - first) / scale) * w;

    holder.classList.add("rm-timeline-chart");

    const svg = surface(w, h);
    const drawn = [];
    rows.forEach(({ row, from, to }, i) => {
      const y = line * i + line / 2;
      const ink = row.getAttribute("data-rm-color") ?? palette[i % palette.length];
      const bar = node("line", {
        class: "rm-timeline-chart-bar",
        x1: at(from).toFixed(2), x2: Math.max(at(to), at(from) + 1.5).toFixed(2), y1: y, y2: y,
        stroke: ink, "stroke-width": line * 0.5, "stroke-linecap": "round",
      });
      svg.append(bar);
      drawn.push([bar, i]);
      row.classList.add("rm-timeline-chart-row");
      row.style.setProperty("--rm-timeline-chart-ink", ink);
    });
    mount(holder, svg, "timeline-chart");

    const draw = () => drawn.forEach(([bar, i]) => reveal(bar, { duration, delay: i * stagger }));

    cleanups.push(watch(holder, draw, { threshold, once: true }));
    cleanups.push(() => {
      svg.remove();
      rows.forEach(({ row }) => {
        row.classList.remove("rm-timeline-chart-row");
        row.style.removeProperty("--rm-timeline-chart-ink");
      });
      holder.classList.remove("rm-timeline-chart");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * Many small meters, each announced.
 *
 * Every row is its own `role="progressbar"` with `aria-valuenow` and an
 * `aria-valuetext` carrying the unit, so a screen reader says "Search, 72 of
 * 100 requests" rather than reading a decorative grey rectangle out as nothing.
 * A row of divs with a width per cent — the usual build — tells it nothing at
 * all, however carefully the widths were calculated.
 *
 * The fills are thick lines uncovered along their length, one small SVG per
 * row, staggered down the list so the eye follows the order the rows are in.
 *
 *   <ul data-rm-meters>
 *     <li data-rm-value="72" data-rm-max="100" data-rm-unit="requests">Search</li>
 *   </ul>
 */
export function meterRow(target = "[data-rm-meters]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const {
    selector = "[data-rm-value]", color = "#2aa7e4", max = 100,
    duration = 760, stagger = 90, threshold = 0.2,
  } = options;
  const cleanups = [];

  for (const holder of holders) {
    const rows = readRows(holder, selector);
    if (!rows.length) continue;

    const shared = dataNumber(holder, "rmMax", max);
    const ink = dataString(holder, "rmColor", color);

    holder.classList.add("rm-meters");

    const made = [];
    rows.forEach(({ row, value }, i) => {
      const top = numberOn(row, "data-rm-max") ?? shared;
      const unit = row.getAttribute("data-rm-unit") ?? "";
      const share = clamp(value / (top || 1), 0, 1);

      row.classList.add("rm-meters-row");
      row.setAttribute("role", "progressbar");
      row.setAttribute("aria-valuemin", "0");
      row.setAttribute("aria-valuemax", String(top));
      row.setAttribute("aria-valuenow", String(value));
      row.setAttribute("aria-valuetext", `${value} of ${top}${unit ? ` ${unit}` : ""}`);

      const svg = surface(100, 1.6);
      svg.setAttribute("class", "rm-meters-svg");
      svg.append(node("line", {
        class: "rm-meters-track",
        x1: 0, x2: 100, y1: 0.8, y2: 0.8, stroke: "currentColor",
        "stroke-opacity": "0.14", "stroke-width": "1.3", "stroke-linecap": "round",
      }));
      const fill = node("line", {
        class: "rm-meters-fill", x1: 0, x2: Math.max(0.6, share * 100).toFixed(2), y1: 0.8, y2: 0.8,
        stroke: row.getAttribute("data-rm-color") ?? ink, "stroke-width": "1.3", "stroke-linecap": "round",
      });
      svg.append(fill);
      row.appendChild(svg);
      made.push({ row, svg, fill, i });
    });

    const draw = () => made.forEach(({ fill, i }) => reveal(fill, { duration, delay: i * stagger }));

    cleanups.push(watch(holder, draw, { threshold, once: true }));
    cleanups.push(() => {
      made.forEach(({ row, svg }) => {
        svg.remove();
        row.classList.remove("rm-meters-row");
        ["role", "aria-valuemin", "aria-valuemax", "aria-valuenow", "aria-valuetext"]
          .forEach((name) => row.removeAttribute(name));
      });
      holder.classList.remove("rm-meters");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * A figure that rolls to its new value.
 *
 * Each digit is a column of ten glyphs moved by `translateY`, so nothing is
 * measured, nothing reflows and only the digits that actually changed move —
 * going from 1,299 to 1,300 rolls three columns and leaves the rest alone. The
 * version that rewrites the whole string every frame repaints text sixty times
 * a second and changes its own width as it goes, which drags everything beside
 * it back and forth.
 *
 * The columns are `aria-hidden` and the real figure sits beside them as plain
 * text, updated once per change rather than once per frame, so the value is
 * announced as a value instead of as a slot machine.
 *
 *   <span data-rm-number-ticker>1,204</span>
 *   ticker.rmSet(1310);
 */
export function numberTicker(target = "[data-rm-number-ticker]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { duration = 760, stagger = 55, decimals = 0, prefix = "", suffix = "" } = options;
  const cleanups = [];

  for (const holder of holders) {
    const written = holder.textContent.trim();
    const start = dataNumber(holder, "rmNumberTicker", Number(written.replace(/[^\d.-]/g, "")));
    if (!Number.isFinite(start)) continue;

    const places = clamp(dataNumber(holder, "rmDecimals", decimals), 0, 6);
    const before = dataString(holder, "rmPrefix", prefix);
    const after = dataString(holder, "rmSuffix", suffix);
    const roll = Math.max(1, dataNumber(holder, "rmDuration", duration));

    holder.classList.add("rm-number-ticker");
    const was = holder.innerHTML;

    const face = document.createElement("span");
    face.className = "rm-number-ticker-face";
    face.setAttribute("aria-hidden", "true");
    const said = document.createElement("span");
    said.className = "rm-number-ticker-value";
    holder.replaceChildren(face, said);

    let showing = "";
    let columns = [];

    /** Build the columns for a string, reusing nothing: the shape changed. */
    const build = (text) => {
      face.replaceChildren();
      columns = [...text].map((glyph) => {
        if (!/\d/.test(glyph)) {
          const fixed = document.createElement("span");
          fixed.className = "rm-number-ticker-fixed";
          fixed.textContent = glyph;
          face.appendChild(fixed);
          return null;
        }
        const column = document.createElement("span");
        column.className = "rm-number-ticker-column";
        const strip = document.createElement("span");
        strip.className = "rm-number-ticker-strip";
        for (let d = 0; d <= 9; d++) {
          const cell = document.createElement("span");
          cell.textContent = String(d);
          strip.appendChild(cell);
        }
        strip.style.transform = `translateY(-${Number(glyph) * 10}%)`;
        column.appendChild(strip);
        face.appendChild(column);
        return strip;
      });
    };

    const showText = (text, { animate = true } = {}) => {
      const rebuilt = text.length !== showing.length;
      const previous = showing;
      showing = text;
      said.textContent = text;
      if (rebuilt) { build(text); if (!animate) return; }

      [...text].forEach((glyph, i) => {
        const strip = columns[i];
        if (!strip || !/\d/.test(glyph)) return;
        const to = `translateY(-${Number(glyph) * 10}%)`;
        const from = rebuilt || !/\d/.test(previous[i] ?? "")
          ? "translateY(0%)"
          : `translateY(-${Number(previous[i]) * 10}%)`;
        strip.style.transform = to;
        if (!animate || prefersReducedMotion() || from === to) return;
        strip.animate([{ transform: from }, { transform: to }], {
          duration: roll, delay: i * stagger, easing: EASE.out,
        });
      });
    };

    // The author's own string first, grouping and all. Only a value that
    // arrives later is formatted by us, because only then is there no written
    // version to defer to.
    showText(written, { animate: false });
    holder.rmSet = (next) => {
      if (Number.isFinite(next)) showText(formatted(next, places, before, after));
    };

    // The entrance roll only plays where it can be seen, and only once.
    let spent = prefersReducedMotion();
    cleanups.push(whileVisible(holder, () => {
      if (spent) return () => {};
      spent = true;
      const text = showing;
      showing = "";
      showText(text);
      return () => {};
    }));

    cleanups.push(() => {
      delete holder.rmSet;
      holder.innerHTML = was;
      holder.classList.remove("rm-number-ticker");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}
