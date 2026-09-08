/**
 * Scroll-driven components.
 *
 *   • parallax()   — layers move at different rates as the page scrolls.
 *   • progress()   — a reading-progress bar.
 *   • horizontal() — a section that scrolls sideways while it is pinned.
 *   • stack()      — cards that pile up and scale back as you pass them.
 *   • scrub()      — bind any CSS custom property to scroll position.
 *
 * Where the browser supports CSS scroll-driven animations these hand the work
 * to the compositor and touch no JavaScript per frame at all. Where it does
 * not, they fall back to a single shared rAF loop reading one cached scroll
 * position — never a scroll listener per element, which is how these effects
 * usually end up janking a page.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import {
  clamp, dataNumber, dataString, mapRange, onFrame,
  prefersReducedMotion, resolveElements, supportsScrollTimeline,
} from "../core/motion.js";

/**
 * One scroll position, read once per frame and shared.
 *
 * Every component below reads from here. Reading `scrollY` or calling
 * `getBoundingClientRect` inside separate handlers is what turns four
 * independent effects into four forced layout passes per frame.
 */
const readers = new Set();
let scrollTask = null;

function onScroll(reader) {
  readers.add(reader);
  if (!scrollTask) {
    scrollTask = onFrame(() => {
      const y = scrollY;
      const height = innerHeight;
      for (const read of readers) read(y, height);
    });
  }
  return () => {
    readers.delete(reader);
    if (!readers.size && scrollTask) { scrollTask(); scrollTask = null; }
  };
}

/**
 * Move elements at a different rate from the page.
 *
 * Speed is a multiplier of the scroll distance: 0.2 drifts gently behind, a
 * negative value moves against the scroll. Kept small on purpose — a layer
 * that travels further than its container leaves a visible gap at the edges,
 * which is the most common way parallax goes wrong.
 */
export function parallax(target = "[data-rm-parallax]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length || prefersReducedMotion()) return () => {};

  const { speed = 0.18, axis = "y" } = options;
  const items = elements.map((element) => ({
    element,
    speed: dataNumber(element, "rmParallax", speed),
    axis: dataString(element, "rmAxis", axis),
    top: 0,
    height: 0,
  }));

  const measure = () => {
    for (const item of items) {
      const box = item.element.getBoundingClientRect();
      item.top = box.top + scrollY;
      item.height = box.height;
    }
  };
  measure();

  const resizeObserver = new ResizeObserver(measure);
  resizeObserver.observe(document.body);

  const stop = onScroll((y, viewport) => {
    for (const item of items) {
      // Only move what is on screen; everything else is wasted work.
      if (item.top + item.height < y - viewport || item.top > y + viewport * 2) continue;
      // Distance from the element's centre to the viewport's centre, so the
      // offset is zero when the element is centred rather than at page top.
      const distance = item.top + item.height / 2 - (y + viewport / 2);
      const shift = -distance * item.speed;
      item.element.style.transform =
        item.axis === "x" ? `translate3d(${shift.toFixed(1)}px,0,0)` : `translate3d(0,${shift.toFixed(1)}px,0)`;
    }
  });

  return () => {
    stop();
    resizeObserver.disconnect();
    items.forEach((item) => { item.element.style.transform = ""; });
  };
}

/**
 * A reading-progress bar.
 *
 * Uses a native scroll timeline where available, so the bar is driven by the
 * compositor and stays perfectly in step with the scrollbar even during a
 * fling on a busy page.
 */
export function progress(target = "[data-rm-progress]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { color = "#2AA7E4", height = 3 } = options;

  for (const element of elements) {
    element.classList.add("rm-progress");
    element.style.setProperty("--rm-progress-color", dataString(element, "rmColor", color));
    element.style.setProperty("--rm-progress-height", `${height}px`);
    element.setAttribute("role", "progressbar");
    element.setAttribute("aria-hidden", "true");
  }

  if (supportsScrollTimeline()) {
    elements.forEach((el) => el.classList.add("rm-progress-native"));
    return () => elements.forEach((el) => el.classList.remove("rm-progress", "rm-progress-native"));
  }

  const stop = onScroll(() => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const ratio = max > 0 ? clamp(scrollY / max) : 0;
    elements.forEach((el) => el.style.setProperty("--rm-progress-value", ratio.toFixed(4)));
  });

  return () => {
    stop();
    elements.forEach((el) => el.classList.remove("rm-progress"));
  };
}

/**
 * A section that scrolls sideways while pinned.
 *
 * The wrapper is given a height proportional to the track's width, so vertical
 * scroll distance maps to horizontal travel. Doing it this way keeps native
 * scrolling — including keyboard, trackpad momentum and the scrollbar itself —
 * rather than hijacking the wheel event, which breaks all three.
 */
export function horizontal(target = "[data-rm-horizontal]", options = {}) {
  const sections = resolveElements(target);
  if (!sections.length) return () => {};

  const { selector = "[data-rm-track]" } = options;
  const items = [];

  for (const section of sections) {
    const track = section.querySelector(selector) ?? section.firstElementChild;
    if (!track) continue;
    section.classList.add("rm-horizontal");
    track.classList.add("rm-horizontal-track");
    items.push({ section, track, distance: 0 });
  }
  if (!items.length) return () => {};

  const measure = () => {
    for (const item of items) {
      item.distance = Math.max(0, item.track.scrollWidth - innerWidth);
      // The extra scroll length needed to travel that distance sideways.
      item.section.style.height = `${innerHeight + item.distance}px`;
    }
  };
  measure();
  addEventListener("resize", measure);

  const reduced = prefersReducedMotion();
  const stop = onScroll((y, viewport) => {
    for (const item of items) {
      const box = item.section.getBoundingClientRect();
      const progressed = clamp(-box.top / Math.max(1, box.height - viewport));
      // Under reduced motion the track simply scrolls normally: it becomes a
      // plain horizontally-scrollable strip rather than a pinned effect.
      item.track.style.transform = reduced ? "" : `translate3d(${(-progressed * item.distance).toFixed(1)}px,0,0)`;
    }
  });

  if (reduced) items.forEach((item) => {
    item.section.style.height = "";
    item.section.classList.add("is-reduced");
  });

  return () => {
    stop();
    removeEventListener("resize", measure);
    items.forEach((item) => {
      item.section.classList.remove("rm-horizontal", "is-reduced");
      item.section.style.height = "";
      item.track.classList.remove("rm-horizontal-track");
      item.track.style.transform = "";
    });
  };
}

/**
 * Cards that stack: each sticks, then shrinks and dims as the next arrives.
 *
 * The sticking is CSS `position: sticky`, not JavaScript. Only the scale and
 * opacity are computed, and only for cards currently on screen.
 */
export function stack(target = "[data-rm-stack]", options = {}) {
  const containers = resolveElements(target);
  if (!containers.length) return () => {};

  const { selector = "[data-rm-card]", top = 80, step = 26, scaleStep = 0.04, dim = 0.35 } = options;
  const groups = [];

  for (const container of containers) {
    const cards = [...container.querySelectorAll(selector)];
    if (!cards.length) continue;
    container.classList.add("rm-stack");
    /*
     * How far apart the cards stick is the whole legibility of the pile.
     *
     * Twelve pixels — the old default — leaves a sliver of each passed card
     * showing, which reads as a rendering fault rather than as a stack. The
     * step wants to be at least a line of text tall, so what stays visible is
     * something you can actually recognise: a number, a title, an edge with
     * meaning on it.
     */
    const apart = Math.max(0, dataNumber(container, "rmStep", step));
    cards.forEach((card, index) => {
      card.classList.add("rm-stack-card");
      card.style.top = `${top + index * apart}px`;
      card.style.zIndex = String(index + 1);
    });
    groups.push({ container, cards, apart });
  }
  if (!groups.length) return () => {};

  if (prefersReducedMotion()) {
    return () => groups.forEach((g) => {
      g.container.classList.remove("rm-stack");
      g.cards.forEach((c) => c.classList.remove("rm-stack-card"));
    });
  }

  const stop = onScroll((y, viewport) => {
    for (const { cards, apart } of groups) {
      cards.forEach((card, index) => {
        const box = card.getBoundingClientRect();
        if (box.bottom < 0 || box.top > viewport) return;
        const remaining = cards.length - 1 - index;
        if (remaining === 0) { card.style.transform = ""; card.style.filter = ""; return; }
        // How far this card has been travelled past, 0 to 1.
        const passed = clamp(mapRange(box.top, top + index * apart, -box.height * 0.5, 0, 1));
        card.style.transform = `scale(${(1 - passed * scaleStep * Math.min(remaining, 3)).toFixed(4)})`;
        card.style.filter = `brightness(${(1 - passed * dim).toFixed(3)})`;
      });
    }
  });

  return () => {
    stop();
    groups.forEach((g) => {
      g.container.classList.remove("rm-stack");
      g.cards.forEach((c) => {
        c.classList.remove("rm-stack-card");
        c.style.transform = "";
        c.style.filter = "";
        c.style.top = "";
        c.style.zIndex = "";
      });
    });
  };
}

/**
 * Bind a CSS custom property to how far an element has crossed the viewport.
 *
 * The escape hatch: `--rm-progress` goes 0 → 1 as the element travels through,
 * and the stylesheet decides what that means. Anything expressible in CSS
 * becomes scroll-driven without another JavaScript component.
 *
 *   <div data-rm-scrub style="opacity: var(--rm-progress)">
 */
export function scrub(target = "[data-rm-scrub]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { property = "--rm-progress", from = "cover", to = "cover" } = options;
  void from; void to;

  const stop = onScroll((y, viewport) => {
    for (const element of elements) {
      const box = element.getBoundingClientRect();
      if (box.bottom < 0 || box.top > viewport) continue;
      // 0 when the element's top touches the bottom of the viewport, 1 when
      // its bottom touches the top: the full crossing.
      const ratio = clamp(mapRange(box.top, viewport, -box.height, 0, 1));
      element.style.setProperty(dataString(element, "rmProperty", property), ratio.toFixed(4));
    }
  });

  return () => {
    stop();
    elements.forEach((el) => el.style.removeProperty(property));
  };
}
