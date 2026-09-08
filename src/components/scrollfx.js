/**
 * Scroll set pieces.
 *
 *   • tracing() — a line that draws itself down an article as you read.
 *   • flatten() — a panel tilted in perspective that lies flat as you arrive.
 *   • sticky()  — one pinned visual that changes as the text beside it scrolls.
 *
 * All three share the one scroll read per frame that the rest of the kit uses,
 * and none of them touches the browser's scrolling. Every effect in this file
 * is something you can also just scroll past — there is no state you can get
 * stuck in, and nothing that only works if you arrive from the top.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import {
  clamp, dataNumber, dataString, lerp, mapRange, onFrame,
  prefersReducedMotion, resolveElements,
} from "../core/motion.js";

const SVG = "http://www.w3.org/2000/svg";

/**
 * A line that draws itself down an article as you read.
 *
 * The path is the full height of the content and the stroke is revealed with
 * `stroke-dashoffset`, so the line is genuinely drawn rather than a div being
 * stretched — which is why it can curve, and why the glowing head can sit
 * exactly on it.
 *
 *   <article data-rm-tracing>…</article>
 */
export function tracing(target = "[data-rm-tracing]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { color = "#2aa7e4", track = "rgba(120,120,120,0.18)", width = 2, wobble = 14 } = options;
  const items = [];

  for (const element of elements) {
    element.classList.add("rm-tracing");

    const svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.classList.add("rm-tracing-line");
    svg.setAttribute("fill", "none");
    svg.setAttribute("preserveAspectRatio", "none");

    const base = document.createElementNS(SVG, "path");
    base.setAttribute("stroke", dataString(element, "rmTrack", track));
    base.setAttribute("stroke-width", String(width));
    const drawn = document.createElementNS(SVG, "path");
    drawn.setAttribute("stroke", dataString(element, "rmColor", color));
    drawn.setAttribute("stroke-width", String(width));
    drawn.setAttribute("stroke-linecap", "round");

    const head = document.createElement("span");
    head.className = "rm-tracing-head";
    head.setAttribute("aria-hidden", "true");
    head.style.background = dataString(element, "rmColor", color);

    svg.append(base, drawn);
    element.append(svg, head);

    const item = { element, svg, base, drawn, head, length: 0, height: 0 };

    const measure = () => {
      const box = element.getBoundingClientRect();
      item.height = box.height;
      svg.setAttribute("viewBox", `0 0 24 ${box.height}`);
      svg.setAttribute("width", "24");
      svg.setAttribute("height", String(box.height));
      // A gentle S rather than a ruler: it reads as drawn by hand, and it is
      // the reason for using a path at all.
      const bend = dataNumber(element, "rmWobble", wobble);
      const d =
        `M 12 0 C ${12 + bend} ${box.height * 0.25}, ${12 - bend} ${box.height * 0.55}, ` +
        `12 ${box.height * 0.75} S ${12 + bend} ${box.height * 0.95}, 12 ${box.height}`;
      base.setAttribute("d", d);
      drawn.setAttribute("d", d);
      item.length = drawn.getTotalLength();
      drawn.style.strokeDasharray = String(item.length);
      drawn.style.strokeDashoffset = String(item.length);
    };
    measure();

    item.resizeObserver = new ResizeObserver(measure);
    item.resizeObserver.observe(element);
    items.push(item);
  }
  if (!items.length) return () => {};

  const paint = () => {
    for (const item of items) {
      const box = item.element.getBoundingClientRect();
      if (box.bottom < 0 || box.top > innerHeight) continue;
      // Drawn from where the article's top passes the middle of the screen,
      // to where its bottom does — so the line tracks reading, not scrolling.
      const progress = clamp(
        mapRange(box.top, innerHeight * 0.55, -box.height + innerHeight * 0.45, 0, 1),
      );
      item.drawn.style.strokeDashoffset = String(item.length * (1 - progress));
      item.head.style.transform = `translate3d(0, ${(progress * item.height).toFixed(1)}px, 0)`;
      item.head.style.opacity = progress > 0.001 && progress < 0.999 ? "1" : "0";
    }
  };

  if (prefersReducedMotion()) {
    // The line is decoration; drawing it as you scroll is the decoration's
    // decoration. Show it complete.
    items.forEach((item) => {
      item.drawn.style.strokeDashoffset = "0";
      item.head.style.opacity = "0";
    });
    return () => items.forEach((item) => {
      item.resizeObserver.disconnect();
      item.svg.remove();
      item.head.remove();
      item.element.classList.remove("rm-tracing");
    });
  }

  const stopFrame = onFrame(paint);
  return () => {
    stopFrame();
    items.forEach((item) => {
      item.resizeObserver.disconnect();
      item.svg.remove();
      item.head.remove();
      item.element.classList.remove("rm-tracing");
    });
  };
}

/**
 * A panel tilted away in perspective that lies flat as you reach it.
 *
 * The screenshot-on-a-laptop move. It works because the rotation is tied to
 * how far the panel has crossed the viewport rather than to a timer, so
 * scrolling back up puts it back — an animation that only plays forwards feels
 * broken the moment anyone scrolls the other way.
 *
 *   <div data-rm-flatten><img src="…" alt=""></div>
 */
export function flatten(target = "[data-rm-flatten]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { angle = 32, scale = 0.86, perspective = 1400, lift = 40 } = options;

  for (const element of elements) {
    element.classList.add("rm-flatten");
    element.style.setProperty("--rm-flatten-perspective", `${perspective}px`);
  }

  if (prefersReducedMotion()) {
    return () => elements.forEach((element) => element.classList.remove("rm-flatten"));
  }

  const stopFrame = onFrame(() => {
    for (const element of elements) {
      const box = element.getBoundingClientRect();
      if (box.bottom < -200 || box.top > innerHeight + 200) continue;
      // 0 while it is still low on the screen, 1 once it has settled in view.
      const progress = clamp(mapRange(box.top, innerHeight * 0.9, innerHeight * 0.2, 0, 1));
      const tilt = dataNumber(element, "rmFlatten", angle) * (1 - progress);
      const size = lerp(scale, 1, progress);
      element.style.transform =
        `rotateX(${tilt.toFixed(2)}deg) scale(${size.toFixed(3)}) translateY(${((1 - progress) * lift).toFixed(1)}px)`;
    }
  });

  return () => {
    stopFrame();
    elements.forEach((element) => {
      element.classList.remove("rm-flatten");
      element.style.transform = "";
    });
  };
}

/**
 * One pinned visual that changes as the text beside it scrolls.
 *
 * The visual sticks with CSS `position: sticky`; the only JavaScript decides
 * which panel is currently in the reading position and swaps the visual to
 * match. The panels remain ordinary stacked content, so on a narrow screen you
 * take the sticky rule away in CSS and it degrades to a normal article — no
 * JavaScript branch, no separate mobile path.
 *
 *   <section data-rm-sticky>
 *     <div data-rm-sticky-media>
 *       <img data-rm-sticky-frame src="one.jpg" alt="">
 *       <img data-rm-sticky-frame src="two.jpg" alt="">
 *     </div>
 *     <div data-rm-sticky-panel>…</div>
 *     <div data-rm-sticky-panel>…</div>
 *   </section>
 */
export function sticky(target = "[data-rm-sticky]", options = {}) {
  const sections = resolveElements(target);
  if (!sections.length) return () => {};

  const {
    panels = "[data-rm-sticky-panel]",
    frames = "[data-rm-sticky-frame]",
    line = 0.45,
  } = options;

  const groups = [];

  for (const section of sections) {
    const panelList = [...section.querySelectorAll(panels)];
    const frameList = [...section.querySelectorAll(frames)];
    if (!panelList.length) continue;

    section.classList.add("rm-sticky");
    panelList.forEach((panel) => panel.classList.add("rm-sticky-panel"));
    frameList.forEach((frame, index) => {
      frame.classList.add("rm-sticky-frame");
      frame.classList.toggle("is-current", index === 0);
    });
    panelList[0]?.classList.add("is-current");
    groups.push({ section, panelList, frameList, current: 0 });
  }
  if (!groups.length) return () => {};

  const stopFrame = onFrame(() => {
    for (const group of groups) {
      const box = group.section.getBoundingClientRect();
      if (box.bottom < 0 || box.top > innerHeight) continue;

      // Whichever panel's middle is nearest the reading line wins. Comparing
      // distances rather than testing ranges means there is never a scroll
      // position where no panel is current.
      const reading = innerHeight * line;
      let best = 0;
      let bestDistance = Infinity;
      group.panelList.forEach((panel, index) => {
        const rect = panel.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - reading);
        if (distance < bestDistance) { bestDistance = distance; best = index; }
      });

      if (best === group.current) continue;
      group.current = best;
      group.panelList.forEach((panel, index) => panel.classList.toggle("is-current", index === best));
      group.frameList.forEach((frame, index) => frame.classList.toggle("is-current", index === best));
    }
  });

  return () => {
    stopFrame();
    groups.forEach(({ section, panelList, frameList }) => {
      section.classList.remove("rm-sticky");
      panelList.forEach((panel) => panel.classList.remove("rm-sticky-panel", "is-current"));
      frameList.forEach((frame) => frame.classList.remove("rm-sticky-frame", "is-current"));
    });
  };
}
