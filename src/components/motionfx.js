/**
 * Motion primitives.
 *
 *   • drag()     — pick anything up, throw it, watch it settle back.
 *   • shuffle()  — a grid that rearranges itself when you filter it.
 *   • confetti() — a burst, on demand.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import {
  clamp, dataNumber, dataString, EASE, lerp, onFrame,
  prefersReducedMotion, resolveElements,
} from "../core/motion.js";

/**
 * Pick anything up, throw it, watch it settle back.
 *
 * Pointer capture means the drag survives the pointer leaving the element,
 * which is the bug in most hand-rolled drags: move fast and the thing is left
 * stranded because `pointermove` stopped arriving. The throw carries on with
 * friction and then springs home, and the whole thing is `transform` only, so
 * nothing around it moves.
 *
 * Arrow keys nudge it, because a control only usable by dragging is a control
 * some people cannot use at all.
 *
 *   <div data-rm-drag>Throw me</div>
 */
export function drag(target = "[data-rm-drag]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { friction = 0.92, spring = 0.09, bounds = 160, step = 24, label = "Draggable" } = options;
  const cleanups = [];

  for (const element of elements) {
    const limit = dataNumber(element, "rmBounds", bounds);
    element.classList.add("rm-drag");
    if (!element.hasAttribute("tabindex")) element.tabIndex = 0;
    element.setAttribute("aria-label", dataString(element, "rmLabel", label));

    const at = { x: 0, y: 0 };
    const goal = { x: 0, y: 0 };
    const velocity = { x: 0, y: 0 };
    let dragging = false;
    let last = { x: 0, y: 0 };

    const render = () => {
      element.style.transform =
        Math.abs(at.x) < 0.05 && Math.abs(at.y) < 0.05
          ? ""
          : `translate3d(${at.x.toFixed(1)}px, ${at.y.toFixed(1)}px, 0)`;
    };

    const onDown = (event) => {
      dragging = true;
      last = { x: event.clientX, y: event.clientY };
      velocity.x = velocity.y = 0;
      element.classList.add("is-dragging");
      element.setPointerCapture?.(event.pointerId);
    };
    const onMove = (event) => {
      if (!dragging) return;
      velocity.x = event.clientX - last.x;
      velocity.y = event.clientY - last.y;
      last = { x: event.clientX, y: event.clientY };
      at.x = clamp(at.x + velocity.x, -limit, limit);
      at.y = clamp(at.y + velocity.y, -limit, limit);
      goal.x = at.x;
      goal.y = at.y;
      render();
    };
    const onUp = () => {
      dragging = false;
      element.classList.remove("is-dragging");
      goal.x = 0;
      goal.y = 0;
    };

    const onKey = (event) => {
      const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
      if (!(event.key in moves)) return;
      event.preventDefault();
      at.x = clamp(at.x + moves[event.key][0], -limit, limit);
      at.y = clamp(at.y + moves[event.key][1], -limit, limit);
      goal.x = at.x;
      goal.y = at.y;
      render();
      // Let it fall home again after a beat, so the keyboard behaves like the
      // pointer does rather than parking it off-centre forever.
      setTimeout(() => { goal.x = 0; goal.y = 0; }, 500);
    };

    element.addEventListener("pointerdown", onDown);
    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerup", onUp);
    element.addEventListener("pointercancel", onUp);
    element.addEventListener("keydown", onKey);

    const stopFrame = onFrame(() => {
      if (dragging) return;
      if (Math.abs(velocity.x) > 0.2 || Math.abs(velocity.y) > 0.2) {
        velocity.x *= friction;
        velocity.y *= friction;
        at.x = clamp(at.x + velocity.x, -limit, limit);
        at.y = clamp(at.y + velocity.y, -limit, limit);
        render();
        return;
      }
      if (Math.abs(at.x - goal.x) > 0.05 || Math.abs(at.y - goal.y) > 0.05) {
        const rate = prefersReducedMotion() ? 1 : spring;
        at.x = lerp(at.x, goal.x, rate);
        at.y = lerp(at.y, goal.y, rate);
        render();
      }
    });

    cleanups.push(() => {
      stopFrame();
      element.removeEventListener("pointerdown", onDown);
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerup", onUp);
      element.removeEventListener("pointercancel", onUp);
      element.removeEventListener("keydown", onKey);
      element.classList.remove("rm-drag", "is-dragging");
      element.style.transform = "";
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A grid that rearranges itself when you filter it.
 *
 * The filtered gallery everyone builds, done with a FLIP: measure where every
 * item is, change what is shown, measure again, then animate each item from
 * its old box to its new one. Items travel to their new places instead of the
 * grid blinking into a different arrangement — and because it is a FLIP, the
 * layout itself is still plain CSS grid doing the work.
 *
 *   <div data-rm-shuffle>
 *     <div data-rm-shuffle-filters>
 *       <button data-rm-filter="all" aria-pressed="true">All</button>
 *       <button data-rm-filter="web">Web</button>
 *     </div>
 *     <div data-rm-shuffle-grid>
 *       <article data-rm-tags="web">…</article>
 *     </div>
 *   </div>
 */
export function shuffle(target = "[data-rm-shuffle]", options = {}) {
  const groups = resolveElements(target);
  if (!groups.length) return () => {};

  const {
    filters = "[data-rm-filter]",
    grid = "[data-rm-shuffle-grid]",
    item = "[data-rm-tags]",
    duration = 520,
    stagger = 22,
    easing = EASE.out,
  } = options;
  const cleanups = [];

  for (const group of groups) {
    const buttons = [...group.querySelectorAll(filters)];
    const board = group.querySelector(grid);
    if (!buttons.length || !board) continue;
    const items = [...board.querySelectorAll(item)];
    if (!items.length) continue;

    group.classList.add("rm-shuffle");
    board.classList.add("rm-shuffle-grid");
    items.forEach((one) => one.classList.add("rm-shuffle-item"));

    const apply = (tag) => {
      // FLIP: first, read where everything is right now.
      const before = new Map(items.map((one) => [one, one.getBoundingClientRect()]));

      for (const one of items) {
        const tags = (one.dataset.rmTags ?? "").split(/\s+/).filter(Boolean);
        one.hidden = tag !== "all" && !tags.includes(tag);
      }

      if (prefersReducedMotion()) return;

      // Last: read where they ended up, then invert and play.
      let index = 0;
      for (const one of items) {
        if (one.hidden) continue;
        const from = before.get(one);
        const to = one.getBoundingClientRect();
        const dx = from.left - to.left;
        const dy = from.top - to.top;
        const appearing = from.width === 0 || from.height === 0;

        one.animate(
          appearing
            ? [{ opacity: 0, transform: "scale(0.92)" }, { opacity: 1, transform: "scale(1)" }]
            : [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0, 0)" }],
          { duration, delay: Math.min(index * stagger, 220), easing, fill: "backwards" },
        );
        index++;
      }
    };

    const handlers = [];
    for (const button of buttons) {
      const click = () => {
        buttons.forEach((one) => one.setAttribute("aria-pressed", String(one === button)));
        apply(button.dataset.rmFilter ?? "all");
      };
      button.addEventListener("click", click);
      if (!button.hasAttribute("aria-pressed")) button.setAttribute("aria-pressed", "false");
      handlers.push(() => button.removeEventListener("click", click));
    }

    cleanups.push(() => {
      handlers.forEach((off) => off());
      items.forEach((one) => { one.hidden = false; one.classList.remove("rm-shuffle-item"); });
      board.classList.remove("rm-shuffle-grid");
      group.classList.remove("rm-shuffle");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A burst, on demand.
 *
 * Pieces are plain elements on Web Animations, removed the moment they finish,
 * so a page cannot accumulate them. Each piece gets its own arc — a horizontal
 * throw plus gravity — rather than travelling in a straight line, which is
 * what makes it read as confetti and not as a firework.
 *
 * Returns a `fire()` you can call from wherever the good news arrives.
 */
export function confetti(options = {}) {
  const {
    count = 60,
    colors = ["#2aa7e4", "#f4d738", "#d28c65", "#f1eee9"],
    spread = 260,
    gravity = 420,
    duration = 1400,
    size = 8,
  } = options;

  const layer = document.createElement("div");
  layer.className = "rm-confetti";
  layer.setAttribute("aria-hidden", "true");
  document.body.appendChild(layer);

  /** @param {{x?: number, y?: number}} at viewport coordinates */
  const fire = (at = {}) => {
    if (prefersReducedMotion()) return;
    const x = at.x ?? innerWidth / 2;
    const y = at.y ?? innerHeight / 2;

    for (let i = 0; i < count; i++) {
      const piece = document.createElement("i");
      piece.style.left = `${x}px`;
      piece.style.top = `${y}px`;
      piece.style.width = `${size}px`;
      piece.style.height = `${size * (0.4 + Math.random() * 0.8)}px`;
      piece.style.background = colors[i % colors.length];
      layer.appendChild(piece);

      const angle = (Math.random() - 0.5) * Math.PI;
      const throwX = Math.sin(angle) * spread * (0.4 + Math.random());
      const lift = -spread * (0.5 + Math.random() * 0.7);
      const life = duration * (0.7 + Math.random() * 0.6);

      piece
        .animate(
          [
            { transform: "translate(-50%, -50%) rotate(0deg)", opacity: 1 },
            {
              transform:
                `translate(calc(-50% + ${throwX.toFixed(0)}px), calc(-50% + ${(lift * 0.6).toFixed(0)}px)) ` +
                `rotate(${(Math.random() * 540 - 270).toFixed(0)}deg)`,
              opacity: 1,
              offset: 0.35,
            },
            {
              transform:
                `translate(calc(-50% + ${(throwX * 1.4).toFixed(0)}px), calc(-50% + ${gravity.toFixed(0)}px)) ` +
                `rotate(${(Math.random() * 900 - 450).toFixed(0)}deg)`,
              opacity: 0,
            },
          ],
          { duration: life, easing: "cubic-bezier(0.16, 0.6, 0.4, 1)" },
        )
        .finished.then(() => piece.remove())
        .catch(() => piece.remove());
    }
  };

  fire.stop = () => layer.remove();
  return fire;
}
