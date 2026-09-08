/**
 * Things that open.
 *
 *   • accordion() — sections that expand without measuring anything.
 *   • flip()      — a card with a back, turned by pointer or keyboard.
 *   • expand()    — a card that grows into a dialog, from where it was.
 *   • lightbox()  — an image that opens full screen, from its own thumbnail.
 *
 * This is the family that is almost always wrong on the web, in two specific
 * ways. Height is animated by measuring `scrollHeight` and writing pixels,
 * which breaks the moment the content reflows. And the thing that opens is a
 * different element from the thing you clicked, so it appears from nowhere,
 * takes focus from nobody and gives it back to nobody.
 *
 * So: heights animate with `grid-template-rows: 0fr → 1fr`, which needs no
 * measurement at all, and the two dialog components use FLIP — the panel is
 * the card, moved, so it grows out of exactly where you pressed and shrinks
 * back into it.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import { dataNumber, dataString, EASE, prefersReducedMotion, resolveElements } from "../core/motion.js";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Sections that expand and collapse.
 *
 * The height animation is `grid-template-rows` from `0fr` to `1fr`, so nothing
 * is measured and nothing is hardcoded: the panel can contain an image that
 * loads late, a font that swaps, or text that rewraps, and the animation stays
 * correct. Every version built on `scrollHeight` breaks on all three.
 *
 *   <div data-rm-accordion>
 *     <section>
 *       <button data-rm-accordion-head>What it costs</button>
 *       <div data-rm-accordion-body>…</div>
 *     </section>
 *   </div>
 */
export function accordion(target = "[data-rm-accordion]", options = {}) {
  const groups = resolveElements(target);
  if (!groups.length) return () => {};

  const {
    head = "[data-rm-accordion-head]",
    body = "[data-rm-accordion-body]",
    single = true,
    duration = 380,
  } = options;
  const cleanups = [];
  let uid = 0;

  for (const group of groups) {
    const heads = [...group.querySelectorAll(head)];
    const bodies = [...group.querySelectorAll(body)];
    if (!heads.length || heads.length !== bodies.length) continue;

    const only = dataString(group, "rmSingle", single ? "true" : "false") === "true";
    group.classList.add("rm-accordion");
    group.style.setProperty("--rm-accordion-duration", `${prefersReducedMotion() ? 0 : duration}ms`);

    const id = ++uid;
    const inner = bodies.map((panel, index) => {
      panel.classList.add("rm-accordion-body");
      panel.id = panel.id || `rm-acc-panel-${id}-${index}`;
      // One wrapper so the outer box can be the animated grid row while the
      // content keeps its own natural height inside it.
      const wrap = document.createElement("div");
      wrap.className = "rm-accordion-inner";
      wrap.append(...panel.childNodes);
      panel.appendChild(wrap);

      const button = heads[index];
      button.classList.add("rm-accordion-head");
      button.id = button.id || `rm-acc-head-${id}-${index}`;
      button.setAttribute("aria-controls", panel.id);
      button.setAttribute("aria-expanded", "false");
      panel.setAttribute("role", "region");
      panel.setAttribute("aria-labelledby", button.id);
      return wrap;
    });
    void inner;

    const setOpen = (index, open) => {
      heads[index].setAttribute("aria-expanded", String(open));
      heads[index].classList.toggle("is-open", open);
      bodies[index].classList.toggle("is-open", open);
    };

    const handlers = [];
    heads.forEach((button, index) => {
      const click = () => {
        const open = button.getAttribute("aria-expanded") !== "true";
        if (only && open) heads.forEach((_, other) => other !== index && setOpen(other, false));
        setOpen(index, open);
      };
      button.addEventListener("click", click);
      handlers.push(() => button.removeEventListener("click", click));
    });

    cleanups.push(() => {
      handlers.forEach((off) => off());
      group.classList.remove("rm-accordion");
      heads.forEach((button) => {
        button.classList.remove("rm-accordion-head", "is-open");
        button.removeAttribute("aria-expanded");
      });
      bodies.forEach((panel) => panel.classList.remove("rm-accordion-body", "is-open"));
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A card with a back.
 *
 * Turned by pointer and by keyboard, because a flip card that only responds to
 * hover hides half its content from anyone not using a mouse. The two faces
 * share a grid cell rather than being absolutely positioned, so the card sizes
 * itself to whichever face is taller and never clips the other one.
 *
 *   <div data-rm-flip>
 *     <div data-rm-flip-front>…</div>
 *     <div data-rm-flip-back>…</div>
 *   </div>
 */
export function flip(target = "[data-rm-flip]", options = {}) {
  const cards = resolveElements(target);
  if (!cards.length) return () => {};

  const {
    front = "[data-rm-flip-front]",
    back = "[data-rm-flip-back]",
    axis = "y",
    duration = 620,
  } = options;
  const cleanups = [];

  for (const card of cards) {
    const faceFront = card.querySelector(front);
    const faceBack = card.querySelector(back);
    if (!faceFront || !faceBack) continue;

    card.classList.add("rm-flip", `is-${dataString(card, "rmAxis", axis) === "x" ? "x" : "y"}`);
    card.style.setProperty("--rm-flip-duration", `${prefersReducedMotion() ? 0 : duration}ms`);
    faceFront.classList.add("rm-flip-face", "is-front");
    faceBack.classList.add("rm-flip-face", "is-back");

    // Operable and announced: it is a control, so it says so.
    if (!card.hasAttribute("tabindex")) card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-pressed", "false");

    const set = (turned) => {
      card.classList.toggle("is-turned", turned);
      card.setAttribute("aria-pressed", String(turned));
      // The hidden face is taken out of the tab order, so a keyboard user does
      // not land on something they cannot see.
      faceFront.inert = turned;
      faceBack.inert = !turned;
    };
    set(false);

    const toggle = () => set(card.getAttribute("aria-pressed") !== "true");
    const onKey = (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      toggle();
    };
    const enter = () => set(true);
    const leave = () => set(false);

    card.addEventListener("click", toggle);
    card.addEventListener("keydown", onKey);
    card.addEventListener("pointerenter", enter);
    card.addEventListener("pointerleave", leave);

    cleanups.push(() => {
      card.removeEventListener("click", toggle);
      card.removeEventListener("keydown", onKey);
      card.removeEventListener("pointerenter", enter);
      card.removeEventListener("pointerleave", leave);
      card.classList.remove("rm-flip", "is-x", "is-y", "is-turned");
      card.removeAttribute("role");
      card.removeAttribute("aria-pressed");
      faceFront.classList.remove("rm-flip-face", "is-front");
      faceBack.classList.remove("rm-flip-face", "is-back");
      faceFront.inert = false;
      faceBack.inert = false;
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Move `element` from where it is now to where it will be, and let go.
 *
 * The FLIP both dialog components are built on: read the box before the change
 * and after it, apply the difference as a transform, then animate that away.
 * The element genuinely travels, which is why anything inside it — a playing
 * video, a scroll position, focus — survives the transition.
 */
function flipFrom(element, before, duration, easing) {
  const after = element.getBoundingClientRect();
  const dx = before.left - after.left;
  const dy = before.top - after.top;
  const sx = before.width / Math.max(1, after.width);
  const sy = before.height / Math.max(1, after.height);

  return element.animate(
    [
      { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`, transformOrigin: "top left" },
      { transform: "translate(0, 0) scale(1, 1)", transformOrigin: "top left" },
    ],
    { duration, easing, fill: "none" },
  );
}

/**
 * A card that grows into a dialog, out of exactly where you pressed.
 *
 * The card itself becomes the dialog — it is not a copy, and it is not a
 * different element that fades in from the middle of the screen. A placeholder
 * holds its place in the layout so nothing below jumps, and the card FLIPs
 * from its old box to its new one.
 *
 * It is a real dialog while open: labelled, focus moved in and trapped,
 * Escape closes, focus returns to the card, and the backdrop is clickable.
 *
 *   <article data-rm-expand>
 *     <h3>Title</h3>
 *     <div data-rm-expand-more hidden>The long version…</div>
 *   </article>
 */
export function expand(target = "[data-rm-expand]", options = {}) {
  const cards = resolveElements(target);
  if (!cards.length) return () => {};

  const { more = "[data-rm-expand-more]", width = 720, duration = 520, easing = EASE.inOut } = options;
  const cleanups = [];

  const backdrop = document.createElement("div");
  backdrop.className = "rm-expand-backdrop";
  backdrop.hidden = true;

  let openCard = null;
  let placeholder = null;
  let returnTo = null;

  const close = () => {
    if (!openCard) return;
    const card = openCard;
    const before = card.getBoundingClientRect();

    card.classList.remove("is-expanded");
    card.removeAttribute("role");
    card.removeAttribute("aria-modal");
    card.style.removeProperty("--rm-expand-width");
    card.querySelector(more)?.setAttribute("hidden", "");
    placeholder?.replaceWith(card);
    placeholder = null;
    openCard = null;
    backdrop.hidden = true;
    document.documentElement.classList.remove("rm-expand-locked");

    if (!prefersReducedMotion()) flipFrom(card, before, duration, easing);
    if (returnTo instanceof HTMLElement) returnTo.focus({ preventScroll: true });
    else card.focus?.({ preventScroll: true });
  };

  const open = (card) => {
    if (openCard) close();
    const before = card.getBoundingClientRect();
    returnTo = document.activeElement;

    // Hold the gap so the page below does not collapse upward.
    placeholder = document.createElement("div");
    placeholder.className = "rm-expand-placeholder";
    placeholder.style.width = `${before.width}px`;
    placeholder.style.height = `${before.height}px`;
    card.replaceWith(placeholder);

    document.body.appendChild(card);
    card.classList.add("is-expanded");
    card.style.setProperty("--rm-expand-width", `${dataNumber(card, "rmWidth", width)}px`);
    card.setAttribute("role", "dialog");
    card.setAttribute("aria-modal", "true");
    card.querySelector(more)?.removeAttribute("hidden");
    backdrop.hidden = false;
    document.documentElement.classList.add("rm-expand-locked");
    openCard = card;

    if (!prefersReducedMotion()) flipFrom(card, before, duration, easing);
    (card.querySelector(FOCUSABLE) ?? card).focus?.({ preventScroll: true });
  };

  const onKey = (event) => {
    if (!openCard) return;
    if (event.key === "Escape") { close(); return; }
    if (event.key !== "Tab") return;
    const stops = [...openCard.querySelectorAll(FOCUSABLE)];
    if (!stops.length) return;
    const first = stops[0];
    const last = stops[stops.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };

  document.body.appendChild(backdrop);
  backdrop.addEventListener("click", close);
  document.addEventListener("keydown", onKey);

  for (const card of cards) {
    card.classList.add("rm-expand");
    if (!card.hasAttribute("tabindex")) card.tabIndex = 0;
    card.querySelector(more)?.setAttribute("hidden", "");

    const activate = (event) => {
      // Leave real controls inside the card alone.
      if (event.target instanceof Element && event.target.closest("a[href], button")) return;
      if (openCard === card) return;
      open(card);
    };
    const onCardKey = (event) => {
      if (event.key !== "Enter" || openCard === card) return;
      event.preventDefault();
      open(card);
    };

    card.addEventListener("click", activate);
    card.addEventListener("keydown", onCardKey);
    cleanups.push(() => {
      card.removeEventListener("click", activate);
      card.removeEventListener("keydown", onCardKey);
      card.classList.remove("rm-expand", "is-expanded");
    });
  }

  return () => {
    close();
    cleanups.forEach((stop) => stop());
    document.removeEventListener("keydown", onKey);
    backdrop.remove();
  };
}

/**
 * An image that opens full screen, out of its own thumbnail.
 *
 * The same FLIP as `expand`, on the image itself, so the picture appears to
 * grow rather than cross-fade. Escape and a click anywhere close it, and focus
 * goes back to the thumbnail.
 *
 *   <img data-rm-lightbox src="small.jpg" alt="…">
 */
export function lightbox(target = "[data-rm-lightbox]", options = {}) {
  const images = resolveElements(target);
  if (!images.length) return () => {};

  const { duration = 480, easing = EASE.inOut } = options;

  const stage = document.createElement("div");
  stage.className = "rm-lightbox";
  stage.hidden = true;
  stage.setAttribute("role", "dialog");
  stage.setAttribute("aria-modal", "true");
  const big = document.createElement("img");
  stage.appendChild(big);
  document.body.appendChild(stage);

  let returnTo = null;

  const close = () => {
    if (stage.hidden) return;
    stage.hidden = true;
    document.documentElement.classList.remove("rm-expand-locked");
    if (returnTo instanceof HTMLElement) returnTo.focus({ preventScroll: true });
  };

  const open = (image) => {
    returnTo = image;
    big.src = image.currentSrc || image.src;
    big.alt = image.alt;
    stage.setAttribute("aria-label", image.alt || "Image");
    stage.hidden = false;
    document.documentElement.classList.add("rm-expand-locked");

    if (!prefersReducedMotion()) flipFrom(big, image.getBoundingClientRect(), duration, easing);
    stage.focus?.({ preventScroll: true });
  };

  const onKey = (event) => { if (event.key === "Escape") close(); };
  stage.addEventListener("click", close);
  document.addEventListener("keydown", onKey);

  const handlers = [];
  for (const image of images) {
    image.classList.add("rm-lightbox-thumb");
    if (!image.hasAttribute("tabindex")) image.tabIndex = 0;
    image.setAttribute("role", "button");

    const click = () => open(image);
    const key = (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      open(image);
    };
    image.addEventListener("click", click);
    image.addEventListener("keydown", key);
    handlers.push(() => {
      image.removeEventListener("click", click);
      image.removeEventListener("keydown", key);
      image.classList.remove("rm-lightbox-thumb");
      image.removeAttribute("role");
    });
  }

  return () => {
    close();
    handlers.forEach((off) => off());
    document.removeEventListener("keydown", onKey);
    stage.remove();
  };
}
