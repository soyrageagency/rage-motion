/**
 * Typography with technique behind it.
 *
 *   • pressure() — variable-font axes bend toward the pointer, per character.
 *   • morph()    — one word becomes another; shared letters travel, the rest fade.
 *   • curve()    — text set along an arc, optionally turning.
 *   • odometer() — digits roll like a mechanical counter.
 *
 * These are the four text effects that are actually hard. Everything else in
 * this file's neighbours — fades, staggers, scrambles — is a stagger loop with
 * a costume on. These need measurement: character centres, a match between two
 * strings, a path length, a digit column. That is the difference between an
 * effect that reads as craft and one that reads as a template.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import {
  clamp, dataNumber, dataString, EASE, lerp, onFrame,
  prefersReducedMotion, resolveElements, watch,
} from "../core/motion.js";
import { split } from "../core/split.js";

/**
 * Variable-font axes that bend toward the pointer.
 *
 * Each character's weight and width follow how near the pointer is, so the
 * word thickens under your cursor and thins away from it. It only works with a
 * variable font — with a static face the axes are ignored and nothing moves,
 * which is why this checks for one and says so in the console rather than
 * failing silently.
 *
 *   <h1 data-rm-pressure style="font-family: 'Bricolage Grotesque'">Pressure</h1>
 */
export function pressure(target = "[data-rm-pressure]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length || prefersReducedMotion()) return () => {};
  if (typeof matchMedia === "function" && !matchMedia("(pointer: fine)").matches) return () => {};

  const {
    radius = 240,
    weight = [200, 900],
    width = [85, 125],
    ease = 0.16,
    axes = { wght: "wght", wdth: "wdth" },
  } = options;

  const cleanups = [];

  for (const element of elements) {
    const chars = split(element, "chars");
    if (!chars.length) continue;
    element.classList.add("rm-pressure");

    const reach = dataNumber(element, "rmRadius", radius);
    const centres = chars.map(() => ({ x: 0, y: 0 }));
    const current = chars.map(() => 0);

    const measure = () => {
      const box = element.getBoundingClientRect();
      chars.forEach((char, i) => {
        const rect = char.getBoundingClientRect();
        centres[i].x = rect.left - box.left + rect.width / 2;
        centres[i].y = rect.top - box.top + rect.height / 2;
      });
    };
    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(element);

    let pointer = { x: -9999, y: -9999 };
    const onMove = (event) => {
      const box = element.getBoundingClientRect();
      pointer = { x: event.clientX - box.left, y: event.clientY - box.top };
    };
    const onLeave = () => { pointer = { x: -9999, y: -9999 }; };
    addEventListener("pointermove", onMove, { passive: true });
    element.addEventListener("pointerleave", onLeave);

    const stopFrame = onFrame(() => {
      chars.forEach((char, i) => {
        const distance = Math.hypot(centres[i].x - pointer.x, centres[i].y - pointer.y);
        const force = distance > reach ? 0 : 1 - distance / reach;
        current[i] = lerp(current[i], force, ease);
        if (current[i] < 0.002 && force === 0) {
          char.style.fontVariationSettings = "";
          return;
        }
        const w = Math.round(lerp(weight[0], weight[1], current[i]));
        const d = Math.round(lerp(width[0], width[1], current[i]));
        char.style.fontVariationSettings = `"${axes.wght}" ${w}, "${axes.wdth}" ${d}`;
      });
    });

    cleanups.push(() => {
      stopFrame();
      resizeObserver.disconnect();
      removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
      element.classList.remove("rm-pressure");
      chars.forEach((char) => { char.style.fontVariationSettings = ""; });
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Morph one word into the next.
 *
 * Letters the two words share slide from where they were to where they now
 * belong; the rest blur away and in. That is what separates this from a
 * cross-fade, and it needs a real match between the strings plus a FLIP —
 * measure the new positions, offset each shared letter back to its old one,
 * then release.
 *
 * The element reserves the width of the longest word, so nothing beside it
 * moves while the words change.
 *
 *   <span data-rm-morph="Design|Motion|Craft"></span>
 */
export function morph(target = "[data-rm-morph]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { words = [], hold = 2200, duration = 700, easing = EASE.out } = options;
  const cleanups = [];

  for (const element of elements) {
    const list = (dataString(element, "rmMorph", "") || "")
      .split("|").map((word) => word.trim()).filter(Boolean);
    const all = list.length ? list : words;
    if (all.length < 2) continue;

    element.classList.add("rm-morph");
    element.setAttribute("aria-label", all.join(", "));

    const sizer = document.createElement("span");
    sizer.className = "rm-morph-sizer";
    sizer.setAttribute("aria-hidden", "true");
    sizer.textContent = all.reduce((longest, word) => (word.length > longest.length ? word : longest), "");

    const stage = document.createElement("span");
    stage.className = "rm-morph-stage";
    stage.setAttribute("aria-hidden", "true");
    // Stage first: a grid takes its baseline from the first item, and a
    // zero-height sizer would give the whole box a baseline near its top —
    // which drops the visible word below anything it sits beside.
    element.replaceChildren(stage, sizer);

    /** Render a word as individual character spans. */
    const draw = (word) => {
      stage.replaceChildren(
        ...[...word].map((letter) => {
          const span = document.createElement("span");
          span.className = "rm-morph-char";
          span.textContent = letter;
          return span;
        }),
      );
      return [...stage.children];
    };

    let index = 0;
    let chars = draw(all[0]);

    if (prefersReducedMotion()) {
      // The words themselves are the content; cycling them is the decoration.
      // Show the first and stop.
      continue;
    }

    /**
     * Pair up letters the two words share, left to right.
     *
     * Greedy and in order on purpose: matching "motion" to "notion" should
     * keep the "otion" travelling together, not scatter letters to whichever
     * copy of themselves happens to be nearest.
     */
    const pair = (from, to) => {
      const pairs = new Map();
      let cursor = 0;
      for (let i = 0; i < to.length; i++) {
        for (let j = cursor; j < from.length; j++) {
          if (from[j] === to[i]) {
            pairs.set(i, j);
            cursor = j + 1;
            break;
          }
        }
      }
      return pairs;
    };

    let timer = 0;
    const step = () => {
      const from = all[index];
      const next = all[(index + 1) % all.length];
      index = (index + 1) % all.length;

      const oldChars = chars;
      const oldBoxes = oldChars.map((char) => char.getBoundingClientRect());
      const pairs = pair(from, next);

      // Old letters stay on screen, taken out of flow, so the new ones can be
      // measured in their final positions.
      const stageBox = stage.getBoundingClientRect();
      oldChars.forEach((char, i) => {
        char.style.position = "absolute";
        char.style.left = `${oldBoxes[i].left - stageBox.left}px`;
        char.style.top = `${oldBoxes[i].top - stageBox.top}px`;
      });

      const newChars = [...oldChars, ...draw(next)];
      stage.prepend(...oldChars);
      chars = newChars.slice(oldChars.length);

      const newBoxes = chars.map((char) => char.getBoundingClientRect());

      chars.forEach((char, i) => {
        const partner = pairs.get(i);
        if (partner === undefined) {
          char.animate(
            [{ opacity: 0, filter: "blur(6px)", transform: "translateY(0.22em)" },
             { opacity: 1, filter: "blur(0px)", transform: "translateY(0)" }],
            { duration, delay: duration * 0.25, easing, fill: "backwards" },
          );
          return;
        }
        // FLIP: start where the shared letter was, land where it belongs.
        const dx = oldBoxes[partner].left - newBoxes[i].left;
        const dy = oldBoxes[partner].top - newBoxes[i].top;
        char.animate(
          [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0, 0)" }],
          { duration, easing },
        );
      });

      const matched = new Set(pairs.values());
      let leaving = oldChars.length;
      for (const [i, char] of oldChars.entries()) {
        const done = () => {
          char.remove();
          leaving--;
        };
        if (matched.has(i)) {
          // Its replacement is travelling in its place; this copy just goes.
          char.animate([{ opacity: 1 }, { opacity: 0 }], { duration: duration * 0.35, fill: "forwards" })
            .finished.then(done).catch(done);
        } else {
          char.animate(
            [{ opacity: 1, filter: "blur(0px)" }, { opacity: 0, filter: "blur(6px)", transform: "translateY(-0.22em)" }],
            { duration: duration * 0.6, easing, fill: "forwards" },
          ).finished.then(done).catch(done);
        }
      }

      timer = setTimeout(step, hold + duration);
    };

    timer = setTimeout(step, hold);
    cleanups.push(() => {
      clearTimeout(timer);
      element.classList.remove("rm-morph");
      element.textContent = all[0];
      element.removeAttribute("aria-label");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Text set along an arc.
 *
 * A real `<textPath>`, so the letters follow the curve with correct spacing
 * rather than being rotated one by one — which is what every "circular text"
 * snippet does, and why they all have the letters leaning wrong at the sides.
 * The original string stays as the accessible name.
 *
 *   <span data-rm-curve="140" data-rm-spin="18000">Available for work</span>
 */
export function curve(target = "[data-rm-curve]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { radius = 130, spin = 0, letterSpacing = "0.12em" } = options;
  const cleanups = [];
  let id = 0;

  for (const element of elements) {
    const text = element.textContent?.trim() ?? "";
    if (!text) continue;

    const r = dataNumber(element, "rmCurve", radius);
    const turn = dataNumber(element, "rmSpin", spin);
    const size = (r + 24) * 2;
    const path = `M ${size / 2} ${size / 2 - r} A ${r} ${r} 0 1 1 ${size / 2 - 0.01} ${size / 2 - r}`;
    const pathId = `rm-curve-${++id}`;

    element.setAttribute("aria-label", text);
    element.classList.add("rm-curve");
    element.style.setProperty("--rm-curve-size", `${size}px`);

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML =
      `<defs><path id="${pathId}" d="${path}" fill="none"/></defs>` +
      `<text style="letter-spacing:${letterSpacing}">` +
      `<textPath href="#${pathId}" startOffset="0%">` +
      text.replace(/&/g, "&amp;").replace(/</g, "&lt;") +
      "</textPath></text>";

    element.replaceChildren(svg);
    if (turn > 0 && !prefersReducedMotion()) {
      element.classList.add("is-spinning");
      element.style.setProperty("--rm-curve-spin", `${turn}ms`);
    }

    cleanups.push(() => {
      element.classList.remove("rm-curve", "is-spinning");
      element.textContent = text;
      element.removeAttribute("aria-label");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Digits that roll into place like a mechanical counter.
 *
 * Each digit is a column of 0–9 that slides; separators and symbols stay put.
 * Columns further right travel further, so the number settles from the left
 * the way a real odometer does instead of every digit landing at once.
 *
 *   <strong data-rm-odometer>128,400</strong>
 */
export function odometer(target = "[data-rm-odometer]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { duration = 1500, stagger = 90, threshold = 0.5, easing = EASE.out } = options;
  const cleanups = [];

  for (const element of elements) {
    const source = element.textContent?.trim() ?? "";
    if (!/\d/.test(source)) continue;

    element.setAttribute("aria-label", source);
    element.classList.add("rm-odometer");

    const columns = [];
    const fragment = document.createDocumentFragment();

    for (const character of source) {
      if (!/\d/.test(character)) {
        const fixed = document.createElement("span");
        fixed.className = "rm-odometer-fixed";
        fixed.setAttribute("aria-hidden", "true");
        fixed.textContent = character;
        fragment.appendChild(fixed);
        continue;
      }
      const column = document.createElement("span");
      column.className = "rm-odometer-column";
      column.setAttribute("aria-hidden", "true");
      const strip = document.createElement("span");
      strip.className = "rm-odometer-strip";
      // Two full runs of 0–9 so a digit can travel more than one revolution
      // before landing, which is what makes it feel geared rather than nudged.
      strip.innerHTML = [...Array(20)].map((_, i) => `<span>${i % 10}</span>`).join("");
      column.appendChild(strip);
      fragment.appendChild(column);
      columns.push({ strip, digit: Number(character) });
    }

    element.replaceChildren(fragment);

    const settle = () => {
      columns.forEach(({ strip, digit }, index) => {
        const target_ = 10 + digit; // second run, so it rolls a full turn first
        if (prefersReducedMotion()) {
          strip.style.transform = `translateY(${-digit * 5}%)`;
          return;
        }
        strip.animate(
          [{ transform: "translateY(0%)" }, { transform: `translateY(${-target_ * 5}%)` }],
          { duration, delay: index * stagger, easing, fill: "forwards" },
        );
      });
    };

    cleanups.push(watch(element, settle, { threshold, once: true }));
    cleanups.push(() => {
      element.classList.remove("rm-odometer");
      element.textContent = source;
      element.removeAttribute("aria-label");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * Text that lights up word by word as it crosses the viewport.
 *
 * The paragraph is fully readable the whole time — the dim state is a muted
 * colour, never `opacity: 0`. An effect that hides prose until you scroll far
 * enough is a reading tax, and it is the version of this that everyone ships.
 *
 *   <p data-rm-highlight>Long paragraph that fills as you scroll…</p>
 */
export function highlight(target = "[data-rm-highlight]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { dim = 0.28, start = 0.85, end = 0.35 } = options;
  const groups = [];

  for (const element of elements) {
    const words = split(element, "words");
    if (!words.length) continue;
    element.classList.add("rm-highlight");
    element.style.setProperty("--rm-highlight-dim", String(dataNumber(element, "rmDim", dim)));
    words.forEach((word) => word.classList.add("rm-highlight-word"));
    groups.push({ element, words });
  }
  if (!groups.length) return () => {};

  if (prefersReducedMotion()) {
    groups.forEach(({ words }) => words.forEach((word) => word.classList.add("is-lit")));
    return () => groups.forEach(({ element, words }) => {
      element.classList.remove("rm-highlight");
      words.forEach((word) => word.classList.remove("rm-highlight-word", "is-lit"));
    });
  }

  const stopFrame = onFrame(() => {
    for (const { element, words } of groups) {
      const box = element.getBoundingClientRect();
      if (box.bottom < 0 || box.top > innerHeight) continue;
      // How far the block has crossed, from `start` of the viewport to `end`.
      const progress = clamp(
        (innerHeight * start - box.top) / Math.max(1, box.height + innerHeight * (start - end)),
      );
      const lit = Math.round(progress * words.length);
      words.forEach((word, i) => word.classList.toggle("is-lit", i < lit));
    }
  });

  return () => {
    stopFrame();
    groups.forEach(({ element, words }) => {
      element.classList.remove("rm-highlight");
      words.forEach((word) => word.classList.remove("rm-highlight-word", "is-lit"));
    });
  };
}
