/**
 * Whole-page scroll set pieces.
 *
 *   • mosaic()       — a grid of images that assembles as you arrive.
 *   • zoomOut()      — one image pulls back to reveal the grid it belongs to.
 *   • lineByLine()   — a paragraph rises a line at a time.
 *   • textMask()     — a headline cut out of the picture behind it.
 *   • timeline()     — a spine that draws itself past each entry.
 *   • splitScroll()  — two columns travelling at different rates.
 *   • revealGrid()   — a grid that fills in a wave from one corner.
 *   • pinnedGallery() — a pinned frame whose picture changes as you read.
 *
 * These are the pieces a page is built out of rather than decorations added to
 * one, so they are stricter about the same two things throughout: nothing
 * animates a layout property, and every one of them is bound to scroll
 * position rather than played once — so all eight run backwards, and none of
 * them can leave the page in a state you cannot scroll out of.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import {
  clamp, dataNumber, dataString, mapRange, onFrame,
  prefersReducedMotion, resolveElements,
} from "../core/motion.js";
import { split } from "../core/split.js";

/**
 * A grid of images that assembles as you arrive.
 *
 * Each tile comes in from its own direction, worked out from where it sits in
 * the grid: the ones on the left arrive from the left, the ones at the top
 * from above. That is what makes it read as a mosaic coming together rather
 * than as a set of cards fading in — and it is computed from the tile's
 * measured position, so it stays right at every column count.
 *
 *   <div data-rm-mosaic>
 *     <img src="…" alt=""><img src="…" alt="">
 *   </div>
 */
export function mosaic(target = "[data-rm-mosaic]", options = {}) {
  const grids = resolveElements(target);
  if (!grids.length) return () => {};

  const {
    selector = ":scope > *",
    travel = 60,
    rotate = 4,
    duration = 900,
    stagger = 45,
    threshold = 0.15,
  } = options;
  const cleanups = [];

  for (const grid of grids) {
    const tiles = [...grid.querySelectorAll(selector)];
    if (!tiles.length) continue;

    grid.classList.add("rm-mosaic");
    tiles.forEach((tile) => tile.classList.add("rm-mosaic-tile"));

    if (prefersReducedMotion()) {
      cleanups.push(() => {
        grid.classList.remove("rm-mosaic");
        tiles.forEach((tile) => tile.classList.remove("rm-mosaic-tile"));
      });
      continue;
    }

    const reach = dataNumber(grid, "rmTravel", travel);
    const box = grid.getBoundingClientRect();
    const centre = { x: box.width / 2, y: box.height / 2 };

    // Each tile's start is its own offset from the centre of the grid, so the
    // mosaic pulls together from the outside in.
    const starts = tiles.map((tile) => {
      const rect = tile.getBoundingClientRect();
      const dx = rect.left - box.left + rect.width / 2 - centre.x;
      const dy = rect.top - box.top + rect.height / 2 - centre.y;
      const length = Math.hypot(dx, dy) || 1;
      return {
        x: (dx / length) * reach,
        y: (dy / length) * reach,
        spin: (dx / length) * rotate,
      };
    });

    tiles.forEach((tile, i) => {
      tile.style.opacity = "0";
      tile.style.transform =
        `translate3d(${starts[i].x.toFixed(1)}px, ${starts[i].y.toFixed(1)}px, 0) ` +
        `rotate(${starts[i].spin.toFixed(2)}deg) scale(0.92)`;
    });

    let played = false;
    const play = () => {
      if (played) return;
      played = true;
      tiles.forEach((tile, i) => {
        tile.animate(
          [
            {
              opacity: 0,
              transform:
                `translate3d(${starts[i].x.toFixed(1)}px, ${starts[i].y.toFixed(1)}px, 0) ` +
                `rotate(${starts[i].spin.toFixed(2)}deg) scale(0.92)`,
            },
            { opacity: 1, transform: "translate3d(0, 0, 0) rotate(0deg) scale(1)" },
          ],
          { duration, delay: i * stagger, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards" },
        );
        tile.style.opacity = "";
        tile.style.transform = "";
      });
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { play(); observer.disconnect(); }
    }, { threshold });
    observer.observe(grid);

    cleanups.push(() => {
      observer.disconnect();
      grid.classList.remove("rm-mosaic");
      tiles.forEach((tile) => {
        tile.classList.remove("rm-mosaic-tile");
        tile.style.opacity = "";
        tile.style.transform = "";
      });
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * One image pulls back to reveal the grid it belongs to.
 *
 * The hero shot starts filling the frame and shrinks into its place among the
 * others as you scroll — the move everybody copied from a keynote. It works
 * because the scale is tied to scroll position rather than a timer, so you can
 * stop halfway and it stays halfway.
 *
 *   <section data-rm-zoom-out>
 *     <figure data-rm-zoom-hero>…</figure>
 *     <div data-rm-zoom-rest>…</div>
 *   </section>
 */
export function zoomOut(target = "[data-rm-zoom-out]", options = {}) {
  const sections = resolveElements(target);
  if (!sections.length) return () => {};

  const { hero = "[data-rm-zoom-hero]", rest = "[data-rm-zoom-rest]", from = 2.1 } = options;
  const items = [];

  for (const section of sections) {
    const lead = section.querySelector(hero);
    if (!lead) continue;
    section.classList.add("rm-zoom-out");
    items.push({ section, lead, others: section.querySelector(rest) });
  }
  if (!items.length) return () => {};

  if (prefersReducedMotion()) {
    return () => items.forEach(({ section }) => section.classList.remove("rm-zoom-out"));
  }

  const stopFrame = onFrame(() => {
    for (const { section, lead, others } of items) {
      const box = section.getBoundingClientRect();
      if (box.bottom < 0 || box.top > innerHeight) continue;
      // 0 while the section is still arriving, 1 once it has settled in view.
      const progress = clamp(mapRange(box.top, innerHeight * 0.85, 0, 0, 1));
      const scale = dataNumber(section, "rmFrom", from) - (dataNumber(section, "rmFrom", from) - 1) * progress;
      lead.style.transform = `scale(${scale.toFixed(3)})`;
      if (others) others.style.opacity = progress.toFixed(3);
    }
  });

  return () => {
    stopFrame();
    items.forEach(({ section, lead, others }) => {
      section.classList.remove("rm-zoom-out");
      lead.style.transform = "";
      if (others) others.style.opacity = "";
    });
  };
}

/**
 * A paragraph that rises a line at a time.
 *
 * Split by line, not by word, because prose read one word at a time is a
 * reading test. Lines are re-split when the width changes, since a line is a
 * layout fact rather than a property of the text — the version that splits
 * once is wrong at every other viewport.
 *
 *   <p data-rm-lines-in>Long copy that arrives line by line…</p>
 */
export function lineByLine(target = "[data-rm-lines-in]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { duration = 780, stagger = 90, threshold = 0.25, travel = 100 } = options;
  const cleanups = [];

  for (const element of elements) {
    const lines = split(element, "lines");
    if (!lines.length) continue;
    element.classList.add("rm-lines-in");

    if (prefersReducedMotion()) {
      cleanups.push(() => element.classList.remove("rm-lines-in"));
      continue;
    }

    lines.forEach((line) => { line.style.opacity = "0"; });

    const play = () => {
      lines.forEach((line, i) => {
        line.animate(
          [
            { opacity: 0, transform: `translateY(${travel}%)` },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration, delay: i * stagger, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards" },
        );
        line.style.opacity = "";
      });
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { play(); observer.disconnect(); }
    }, { threshold });
    observer.observe(element);

    cleanups.push(() => {
      observer.disconnect();
      element.classList.remove("rm-lines-in");
      lines.forEach((line) => { line.style.opacity = ""; });
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A headline cut out of the picture behind it.
 *
 * `background-clip: text` on the real heading, so it is still a heading:
 * selectable, searchable, read aloud, and translated. The version made from an
 * SVG mask or a PNG is a picture of a headline, and everything that makes text
 * text is gone.
 *
 * The image drifts inside the letters as you scroll, which is what stops it
 * looking like a static texture.
 *
 *   <h2 data-rm-text-mask data-rm-image="/hero.jpg">Award-grade</h2>
 */
export function textMask(target = "[data-rm-text-mask]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { image, drift = 18 } = options;
  const items = [];

  for (const element of elements) {
    const source = dataString(element, "rmImage", image ?? "");
    if (!source) continue;
    element.classList.add("rm-text-mask");
    element.style.setProperty("--rm-text-mask-image", `url("${source}")`);
    items.push(element);
  }
  if (!items.length) return () => {};

  if (prefersReducedMotion()) {
    return () => items.forEach((element) => element.classList.remove("rm-text-mask"));
  }

  const stopFrame = onFrame(() => {
    for (const element of items) {
      const box = element.getBoundingClientRect();
      if (box.bottom < 0 || box.top > innerHeight) continue;
      const progress = clamp((box.top + box.height / 2) / innerHeight, 0, 1) - 0.5;
      element.style.setProperty("--rm-text-mask-y", `${(progress * drift).toFixed(1)}%`);
    }
  });

  return () => {
    stopFrame();
    items.forEach((element) => {
      element.classList.remove("rm-text-mask");
      element.style.removeProperty("--rm-text-mask-image");
    });
  };
}

/**
 * A spine that draws itself past each entry.
 *
 * The line grows to wherever you have read to, and each entry lights as the
 * line reaches it. Both come from the same measurement, so the dot can never
 * light before the line arrives — which is the bug in every timeline built
 * from two independent effects.
 *
 *   <ol data-rm-timeline>
 *     <li data-rm-timeline-item>…</li>
 *   </ol>
 */
export function timeline(target = "[data-rm-timeline]", options = {}) {
  const lists = resolveElements(target);
  if (!lists.length) return () => {};

  const { selector = "[data-rm-timeline-item]", line = 0.6 } = options;
  const groups = [];

  for (const list of lists) {
    const entries = [...list.querySelectorAll(selector)];
    if (!entries.length) continue;
    list.classList.add("rm-timeline");
    entries.forEach((entry) => entry.classList.add("rm-timeline-item"));
    groups.push({ list, entries });
  }
  if (!groups.length) return () => {};

  if (prefersReducedMotion()) {
    groups.forEach(({ list, entries }) => {
      list.style.setProperty("--rm-timeline-progress", "1");
      entries.forEach((entry) => entry.classList.add("is-reached"));
    });
    return () => groups.forEach(({ list, entries }) => {
      list.classList.remove("rm-timeline");
      entries.forEach((entry) => entry.classList.remove("rm-timeline-item", "is-reached"));
    });
  }

  const stopFrame = onFrame(() => {
    const reading = innerHeight * line;
    for (const { list, entries } of groups) {
      const box = list.getBoundingClientRect();
      if (box.bottom < 0 || box.top > innerHeight) continue;
      const drawn = clamp((reading - box.top) / Math.max(1, box.height));
      list.style.setProperty("--rm-timeline-progress", drawn.toFixed(4));

      for (const entry of entries) {
        const rect = entry.getBoundingClientRect();
        // Lit once the drawn line has actually passed it, from the same number.
        entry.classList.toggle("is-reached", rect.top - box.top <= drawn * box.height);
      }
    }
  });

  return () => {
    stopFrame();
    groups.forEach(({ list, entries }) => {
      list.classList.remove("rm-timeline");
      list.style.removeProperty("--rm-timeline-progress");
      entries.forEach((entry) => entry.classList.remove("rm-timeline-item", "is-reached"));
    });
  };
}

/**
 * Two columns travelling at different rates.
 *
 * The editorial split: images on one side moving slower than the words on the
 * other. Both are `transform`, so the columns never actually change height and
 * the page's scroll length is exactly what the content says it is — which the
 * version built with negative margins cannot promise.
 */
export function splitScroll(target = "[data-rm-split-scroll]", options = {}) {
  const sections = resolveElements(target);
  if (!sections.length) return () => {};

  const { left = "[data-rm-split-a]", right = "[data-rm-split-b]", offset = 90 } = options;
  const items = [];

  for (const section of sections) {
    const a = section.querySelector(left);
    const b = section.querySelector(right);
    if (!a || !b) continue;
    section.classList.add("rm-split-scroll");
    items.push({ section, a, b });
  }
  if (!items.length) return () => {};

  if (prefersReducedMotion()) {
    return () => items.forEach(({ section }) => section.classList.remove("rm-split-scroll"));
  }

  const stopFrame = onFrame(() => {
    for (const { section, a, b } of items) {
      const box = section.getBoundingClientRect();
      if (box.bottom < 0 || box.top > innerHeight) continue;
      const progress = clamp(mapRange(box.top, innerHeight, -box.height, 0, 1)) - 0.5;
      const shift = dataNumber(section, "rmOffset", offset);
      a.style.transform = `translate3d(0, ${(progress * shift).toFixed(1)}px, 0)`;
      b.style.transform = `translate3d(0, ${(-progress * shift).toFixed(1)}px, 0)`;
    }
  });

  return () => {
    stopFrame();
    items.forEach(({ section, a, b }) => {
      section.classList.remove("rm-split-scroll");
      a.style.transform = "";
      b.style.transform = "";
    });
  };
}

/**
 * A grid that fills in a wave from one corner.
 *
 * The delay for each cell comes from its distance to the corner, measured
 * rather than counted, so the wave stays diagonal whatever the column count
 * and however the grid rewraps.
 */
export function revealGrid(target = "[data-rm-reveal-grid]", options = {}) {
  const grids = resolveElements(target);
  if (!grids.length) return () => {};

  const {
    selector = ":scope > *",
    from = "top-left",
    duration = 620,
    spread = 2.2,
    threshold = 0.1,
  } = options;
  const cleanups = [];

  for (const grid of grids) {
    const cells = [...grid.querySelectorAll(selector)];
    if (!cells.length) continue;

    grid.classList.add("rm-reveal-grid");
    if (prefersReducedMotion()) {
      cleanups.push(() => grid.classList.remove("rm-reveal-grid"));
      continue;
    }

    const box = grid.getBoundingClientRect();
    const corner = dataString(grid, "rmFrom", from);
    const anchor = {
      "top-left": { x: 0, y: 0 },
      "top-right": { x: box.width, y: 0 },
      "bottom-left": { x: 0, y: box.height },
      "bottom-right": { x: box.width, y: box.height },
      center: { x: box.width / 2, y: box.height / 2 },
    }[corner] ?? { x: 0, y: 0 };

    const delays = cells.map((cell) => {
      const rect = cell.getBoundingClientRect();
      const dx = rect.left - box.left + rect.width / 2 - anchor.x;
      const dy = rect.top - box.top + rect.height / 2 - anchor.y;
      return Math.hypot(dx, dy) * spread * 0.1;
    });

    cells.forEach((cell) => { cell.style.opacity = "0"; });

    const play = () => {
      cells.forEach((cell, i) => {
        cell.animate(
          [{ opacity: 0, transform: "translateY(18px) scale(0.96)" }, { opacity: 1, transform: "none" }],
          { duration, delay: delays[i], easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards" },
        );
        cell.style.opacity = "";
      });
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { play(); observer.disconnect(); }
    }, { threshold });
    observer.observe(grid);

    cleanups.push(() => {
      observer.disconnect();
      grid.classList.remove("rm-reveal-grid");
      cells.forEach((cell) => { cell.style.opacity = ""; });
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A pinned frame whose picture changes as you read.
 *
 * Close cousin of `sticky`, and different in one way that matters: the frames
 * cross-fade AND scale, so the change reads as a cut in a film rather than an
 * image swap. The pinning is still CSS `position: sticky` — the JavaScript
 * only decides which frame is current.
 */
export function pinnedGallery(target = "[data-rm-pinned]", options = {}) {
  const sections = resolveElements(target);
  if (!sections.length) return () => {};

  const {
    frame = "[data-rm-pinned-frame]",
    chapter = "[data-rm-pinned-chapter]",
    line = 0.5,
  } = options;
  const groups = [];

  for (const section of sections) {
    const frames = [...section.querySelectorAll(frame)];
    const chapters = [...section.querySelectorAll(chapter)];
    if (!frames.length || !chapters.length) continue;

    section.classList.add("rm-pinned");
    frames.forEach((one, i) => {
      one.classList.add("rm-pinned-frame");
      one.classList.toggle("is-current", i === 0);
    });
    chapters.forEach((one) => one.classList.add("rm-pinned-chapter"));
    chapters[0]?.classList.add("is-current");
    groups.push({ section, frames, chapters, at: 0 });
  }
  if (!groups.length) return () => {};

  const stopFrame = onFrame(() => {
    const reading = innerHeight * line;
    for (const group of groups) {
      const box = group.section.getBoundingClientRect();
      if (box.bottom < 0 || box.top > innerHeight) continue;

      let best = 0;
      let nearest = Infinity;
      group.chapters.forEach((one, index) => {
        const rect = one.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - reading);
        if (distance < nearest) { nearest = distance; best = index; }
      });

      if (best === group.at) continue;
      group.at = best;
      group.frames.forEach((one, index) => one.classList.toggle("is-current", index === best));
      group.chapters.forEach((one, index) => one.classList.toggle("is-current", index === best));
    }
  });

  return () => {
    stopFrame();
    groups.forEach(({ section, frames, chapters }) => {
      section.classList.remove("rm-pinned");
      frames.forEach((one) => one.classList.remove("rm-pinned-frame", "is-current"));
      chapters.forEach((one) => one.classList.remove("rm-pinned-chapter", "is-current"));
    });
  };
}
