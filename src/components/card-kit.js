/**
 * Twenty-four card looks, and four cards that do something.
 *
 *   <article data-rm-card-kit="lift-glow">…</article>
 *
 * The kit is the same bargain the button kit makes: one component with a named
 * look, so all twenty-four share the guarantees rather than each re-earning
 * them. None of them animates a width, a height, a padding or a margin, which
 * is what stops a grid of cards reflowing every time the pointer crosses one —
 * the single most common way a "nice" card hover ruins a page.
 *
 * The four components at the end are cards that need JavaScript because they
 * measure something: layers that move against each other, a border that
 * follows the pointer round the edge, a stack that fans out, and a card whose
 * content parallaxes as the page scrolls.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import {
  clamp, dataNumber, dataString, lerp, onFrame,
  prefersReducedMotion, resolveElements,
} from "../core/motion.js";

/** Every card look, in the order the documentation lists them. */
export const CARD_LOOKS = [
  // Raise
  "lift", "lift-glow", "lift-shadow", "float", "press-in", "settle",
  // Edge
  "edge-line", "edge-grow", "corner-fold", "notch", "frame", "outline-draw",
  // Light
  "sheen", "gradient-edge", "glow-ring", "spot", "beam-top", "vignette",
  // Content
  "zoom-media", "pan-media", "reveal-meta", "slide-title", "blur-out", "split",
];

const KNOWN = new Set(CARD_LOOKS);

/**
 * Apply a named card look.
 *
 * @param {string|Element|NodeList|Element[]} target
 * @param {{ look?: string }} options
 * @returns {() => void} stop
 */
export function cardKit(target = "[data-rm-card-kit]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { look = "lift" } = options;
  const applied = [];

  for (const element of elements) {
    const want = dataString(element, "rmCardKit", look);
    const name = KNOWN.has(want) ? want : look;
    element.classList.add("rm-card", `is-${name}`);
    if (prefersReducedMotion()) element.classList.add("is-still");
    applied.push({ element, name });
  }

  return () => applied.forEach(({ element, name }) =>
    element.classList.remove("rm-card", `is-${name}`, "is-still"));
}

/**
 * A card whose layers move against each other.
 *
 * Each child marked with a depth moves a different amount as the pointer
 * crosses the card, so the art, the title and the badge separate. Depth is a
 * multiplier rather than a pixel value, which means the effect is the same on
 * a small card and a large one — a fixed offset looks right on exactly one
 * size and wrong on every other.
 *
 *   <article data-rm-layers>
 *     <img data-rm-depth="0.2" src="…" alt="">
 *     <h3 data-rm-depth="0.6">Title</h3>
 *     <span data-rm-depth="1">New</span>
 *   </article>
 */
export function layers(target = "[data-rm-layers]", options = {}) {
  const cards = resolveElements(target);
  if (!cards.length || prefersReducedMotion()) return () => {};
  if (typeof matchMedia === "function" && !matchMedia("(pointer: fine)").matches) return () => {};

  const { selector = "[data-rm-depth]", travel = 18, ease = 0.14, tilt = 5 } = options;
  const cleanups = [];

  for (const card of cards) {
    const pieces = [...card.querySelectorAll(selector)];
    if (!pieces.length) continue;

    card.classList.add("rm-layers");
    const depths = pieces.map((piece) => dataNumber(piece, "rmDepth", 0.5));
    const pointer = { x: 0, y: 0 };
    const at = { x: 0, y: 0 };
    let inside = false;

    const onMove = (event) => {
      const box = card.getBoundingClientRect();
      pointer.x = (event.clientX - box.left) / box.width - 0.5;
      pointer.y = (event.clientY - box.top) / box.height - 0.5;
      inside = true;
    };
    const onLeave = () => { inside = false; pointer.x = 0; pointer.y = 0; };
    card.addEventListener("pointermove", onMove, { passive: true });
    card.addEventListener("pointerleave", onLeave);

    const stopFrame = onFrame(() => {
      at.x = lerp(at.x, pointer.x, ease);
      at.y = lerp(at.y, pointer.y, ease);
      const settled = Math.abs(at.x) < 0.001 && Math.abs(at.y) < 0.001;

      card.style.transform = settled && !inside
        ? ""
        : `perspective(900px) rotateY(${(at.x * tilt).toFixed(2)}deg) rotateX(${(-at.y * tilt).toFixed(2)}deg)`;

      pieces.forEach((piece, i) => {
        piece.style.transform = settled && !inside
          ? ""
          : `translate3d(${(at.x * travel * depths[i]).toFixed(1)}px, ${(at.y * travel * depths[i]).toFixed(1)}px, 0)`;
      });
    });

    cleanups.push(() => {
      stopFrame();
      card.removeEventListener("pointermove", onMove);
      card.removeEventListener("pointerleave", onLeave);
      card.classList.remove("rm-layers");
      card.style.transform = "";
      pieces.forEach((piece) => { piece.style.transform = ""; });
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A border highlight that follows the pointer around the edge.
 *
 * The angle is computed from where the pointer is relative to the card's
 * centre and written to a custom property, so a conic gradient can point at
 * it. One listener for the whole set, one property write per card per frame,
 * and the gradient itself is composited — which is why a grid of twenty of
 * these costs about the same as one.
 */
export function edgeLight(target = "[data-rm-edge]", options = {}) {
  const cards = resolveElements(target);
  if (!cards.length) return () => {};

  const { color = "#2aa7e4", width = 1.5, spread = 60 } = options;

  for (const card of cards) {
    card.classList.add("rm-edge");
    card.style.setProperty("--rm-edge-color", dataString(card, "rmColor", color));
    card.style.setProperty("--rm-edge-width", `${width}px`);
    card.style.setProperty("--rm-edge-spread", `${spread}deg`);
  }

  const onMove = (event) => {
    for (const card of cards) {
      const box = card.getBoundingClientRect();
      if (event.clientX < box.left - 60 || event.clientX > box.right + 60) continue;
      if (event.clientY < box.top - 60 || event.clientY > box.bottom + 60) continue;
      const x = event.clientX - (box.left + box.width / 2);
      const y = event.clientY - (box.top + box.height / 2);
      card.style.setProperty("--rm-edge-angle", `${((Math.atan2(y, x) * 180) / Math.PI + 90).toFixed(1)}deg`);
    }
  };
  addEventListener("pointermove", onMove, { passive: true });

  return () => {
    removeEventListener("pointermove", onMove);
    cards.forEach((card) => card.classList.remove("rm-edge"));
  };
}

/**
 * A stack of cards that fans out.
 *
 * Closed it is a neat pile; hovered or focused it spreads, each card rotating
 * a little more than the last. The fan is computed from the number of cards
 * rather than hardcoded, so three cards and seven cards both look deliberate.
 */
export function fan(target = "[data-rm-fan]", options = {}) {
  const stacks = resolveElements(target);
  if (!stacks.length) return () => {};

  const { selector = ":scope > *", angle = 7, shift = 26, lift = 10 } = options;
  const cleanups = [];

  for (const stack of stacks) {
    const cards = [...stack.querySelectorAll(selector)];
    if (cards.length < 2) continue;

    stack.classList.add("rm-fan");
    const middle = (cards.length - 1) / 2;

    cards.forEach((card, index) => {
      card.classList.add("rm-fan-card");
      // Measured from the middle, so the pile opens evenly both ways.
      const offset = index - middle;
      card.style.setProperty("--rm-fan-angle", `${(offset * angle).toFixed(2)}deg`);
      card.style.setProperty("--rm-fan-shift", `${(offset * shift).toFixed(1)}px`);
      card.style.setProperty("--rm-fan-lift", `${(Math.abs(offset) * -lift).toFixed(1)}px`);
      card.style.zIndex = String(cards.length - Math.abs(Math.round(offset)));
    });

    cleanups.push(() => {
      stack.classList.remove("rm-fan");
      cards.forEach((card) => {
        card.classList.remove("rm-fan-card");
        card.style.zIndex = "";
      });
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A card whose contents drift as the page scrolls.
 *
 * The media inside moves against the frame, so the card has depth while you
 * scroll past rather than only when you point at it. It is bound to how far
 * the card has crossed the viewport, which means it runs backwards on the way
 * up — and it only computes for cards that are actually on screen.
 */
export function cardParallax(target = "[data-rm-card-parallax]", options = {}) {
  const cards = resolveElements(target);
  if (!cards.length || prefersReducedMotion()) return () => {};

  const { selector = "img, video, [data-rm-card-media]", travel = 28 } = options;
  const items = [];

  for (const card of cards) {
    const media = card.querySelector(selector);
    if (!media) continue;
    card.classList.add("rm-card-parallax");
    items.push({ card, media });
  }
  if (!items.length) return () => {};

  const stopFrame = onFrame(() => {
    for (const { card, media } of items) {
      const box = card.getBoundingClientRect();
      if (box.bottom < 0 || box.top > innerHeight) continue;
      // -0.5 to 0.5 as the card crosses, so the drift is centred on the middle
      // of the screen rather than starting at the top of the page.
      const progress = clamp((box.top + box.height / 2) / innerHeight, 0, 1) - 0.5;
      media.style.transform = `translate3d(0, ${(progress * travel).toFixed(1)}px, 0) scale(1.12)`;
    }
  });

  return () => {
    stopFrame();
    items.forEach(({ card, media }) => {
      card.classList.remove("rm-card-parallax");
      media.style.transform = "";
    });
  };
}
