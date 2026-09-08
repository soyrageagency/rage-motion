/**
 * Cursors, the playful set.
 *
 *   • cartoonCursor()   — a gloved cartoon hand that points, grabs and squashes.
 *   • blobCursor()      — a blob that lags, stretches along its own velocity
 *                         and settles.
 *   • trailCursor()     — a comet of dots, each chasing the one in front.
 *   • sayCursor()       — the cursor becomes a word over anything that has one.
 *   • spotlightCursor() — the page dims except where you are pointing.
 *   • arrowCursor()     — a sharp arrow that points the way you are moving.
 *   • lensCursor()      — a circle that magnifies whatever is under it.
 *
 * `cursor.js` holds the restrained set. These are the ones with a personality,
 * and they follow exactly the same three rules, because a cursor is the one
 * piece of a page a visitor is holding:
 *
 *   • The real pointer is only taken away once the replacement is on screen
 *     and moving. A page whose script failed must never be a page with no
 *     cursor.
 *   • Touch devices get nothing at all. There is no pointer to follow, and a
 *     shape parked in the corner of a phone is noise with a frame cost.
 *   • Reduced motion keeps the cursor and drops the lag, the stretch and the
 *     trail — the parts that move independently of the hand.
 *
 * All seven share the library's one animation frame, and every one of them
 * moves with `transform` alone.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import { clamp, lerp, onFrame, prefersReducedMotion } from "../core/motion.js";

/** Is there a real pointer to follow? */
function hasFinePointer() {
  return typeof matchMedia === "function" && matchMedia("(pointer: fine)").matches;
}

/**
 * The shared skeleton: a fixed layer, a pointer to follow, and the promise
 * that the real cursor comes back when the component is taken away.
 *
 * `build` receives the layer and returns `{ frame, cleanup }`. Every cursor in
 * this file is that plus its own maths, which is why none of them repeats the
 * wake-up rule, the touch rule or the teardown.
 */
function mountCursor(className, build, { hide = true } = {}) {
  if (!hasFinePointer()) return () => {};

  const layer = document.createElement("div");
  layer.className = className;
  layer.setAttribute("aria-hidden", "true");
  document.body.appendChild(layer);

  const pointer = { x: innerWidth / 2, y: innerHeight / 2 };
  let awake = false;
  const made = build(layer, pointer);

  const onMove = (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    if (awake) return;
    awake = true;
    // Only now: the replacement exists and is where the hand is.
    if (hide) document.documentElement.classList.add("rm-cursor-active");
    layer.classList.add("is-visible");
  };
  const onLeave = () => layer.classList.remove("is-visible");
  const onEnter = () => { if (awake) layer.classList.add("is-visible"); };

  addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("pointerleave", onLeave);
  document.addEventListener("pointerenter", onEnter);

  const stopFrame = made.frame ? onFrame(made.frame) : () => {};

  return () => {
    stopFrame();
    removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerleave", onLeave);
    document.removeEventListener("pointerenter", onEnter);
    made.cleanup?.();
    layer.remove();
    document.documentElement.classList.remove("rm-cursor-active");
  };
}

/**
 * A gloved cartoon hand that points, grabs and squashes.
 *
 * The hand is drawn once as SVG and then only ever transformed — it points
 * while travelling, curls into a fist while the button is down, and squashes
 * along its direction of travel when it is moving fast. The squash is a scale
 * on two axes with a rotation, which is the whole language of hand-drawn
 * animation and costs nothing at all.
 *
 * It leans into the direction of movement rather than staying upright, so the
 * hand reads as being thrown across the screen rather than dragged.
 */
export function cartoonCursor(options = {}) {
  const { size = 42, ease = 0.24, squash = 0.3 } = options;

  return mountCursor("rm-cartoon-cursor", (layer, pointer) => {
    layer.style.setProperty("--rm-cartoon-size", `${size}px`);
    layer.innerHTML =
      '<svg viewBox="0 0 64 72" class="rm-cartoon-hand">' +
      // One path for the mitten, one for the cuff; thick outline, flat fill.
      '<path class="rm-cartoon-glove" d="M20 30 V14 a6 6 0 0 1 12 0 V28 V10 a6 6 0 0 1 12 0 V30 V18 a6 6 0 0 1 12 0 V44 ' +
      "c0 14-8 24-22 24 C20 68 12 60 10 50 L4 34 a6 6 0 0 1 10-6 l6 8 Z\"/>" +
      '<path class="rm-cartoon-cuff" d="M14 58 h34 v6 H14 Z"/>' +
      "</svg>";

    const at = { x: pointer.x, y: pointer.y };
    const soft = prefersReducedMotion();
    const hand = layer.querySelector(".rm-cartoon-hand");
    let grabbing = false;
    // Upright at rest. Taking the angle raw every frame means a standing hand
    // reads atan2(0, 0) — zero — and sits pointing off to one side.
    let heading = 0;

    const onDown = () => { grabbing = true; layer.classList.add("is-grabbing"); };
    const onUp = () => { grabbing = false; layer.classList.remove("is-grabbing"); };
    addEventListener("pointerdown", onDown, { passive: true });
    addEventListener("pointerup", onUp, { passive: true });

    return {
      frame: () => {
        const wasX = at.x;
        const wasY = at.y;
        if (soft) { at.x = pointer.x; at.y = pointer.y; }
        else { at.x = lerp(at.x, pointer.x, ease); at.y = lerp(at.y, pointer.y, ease); }

        layer.style.transform = `translate3d(${at.x.toFixed(1)}px, ${at.y.toFixed(1)}px, 0)`;

        if (soft) return;
        // Squash and stretch along the direction of travel: faster means
        // longer and thinner, which is the oldest trick in animation.
        const dx = at.x - wasX;
        const dy = at.y - wasY;
        const travelled = Math.hypot(dx, dy);
        const speed = Math.min(travelled / 24, 1);

        // Below this the direction is noise, so the hand keeps the heading it
        // had rather than swinging around a standing pointer. It also unwinds
        // the short way, never through 350 degrees to travel ten.
        if (travelled > 0.7) {
          const want = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
          heading += (((want - heading + 540) % 360) - 180) * 0.18;
        } else {
          heading += (0 - heading) * 0.08;
        }

        const stretch = 1 + speed * squash;
        const thin = 1 - speed * squash * 0.7;
        const grab = grabbing ? 0.82 : 1;
        hand.style.transform =
          `rotate(${heading.toFixed(1)}deg) scale(${(thin * grab).toFixed(3)}, ${(stretch * grab).toFixed(3)})`;
      },
      cleanup: () => {
        removeEventListener("pointerdown", onDown);
        removeEventListener("pointerup", onUp);
      },
    };
  });
}

/**
 * A blob that lags, stretches along its own velocity and settles.
 *
 * The stretch is computed from how far the blob moved this frame, not from the
 * pointer's speed, so it eases out on its own after the hand stops — the shape
 * is the physics rather than an approximation of it.
 */
export function blobCursor(options = {}) {
  const { size = 34, ease = 0.15, stretch = 0.55 } = options;

  return mountCursor("rm-blob-cursor", (layer, pointer) => {
    layer.style.setProperty("--rm-blob-size", `${size}px`);
    layer.innerHTML = '<span class="rm-blob-cursor-body"></span>';

    const body = layer.querySelector(".rm-blob-cursor-body");
    const at = { x: pointer.x, y: pointer.y };
    const soft = prefersReducedMotion();

    return {
      frame: () => {
        const wasX = at.x;
        const wasY = at.y;
        at.x = soft ? pointer.x : lerp(at.x, pointer.x, ease);
        at.y = soft ? pointer.y : lerp(at.y, pointer.y, ease);
        layer.style.transform = `translate3d(${at.x.toFixed(1)}px, ${at.y.toFixed(1)}px, 0)`;
        if (soft) return;

        const dx = at.x - wasX;
        const dy = at.y - wasY;
        const speed = clamp(Math.hypot(dx, dy) / 30, 0, 1);
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        body.style.transform =
          `rotate(${angle.toFixed(1)}deg) scale(${(1 + speed * stretch).toFixed(3)}, ${(1 - speed * stretch * 0.6).toFixed(3)})`;
      },
    };
  });
}

/**
 * A comet of dots, each chasing the one in front.
 *
 * A chain rather than a history buffer: dot one follows the pointer, dot two
 * follows dot one, and so on. That is a handful of numbers per frame instead
 * of a queue of past positions, and it keeps its shape at any frame rate —
 * a recorded trail bunches up the moment a frame is dropped.
 */
export function trailCursor(options = {}) {
  const { count = 8, size = 14, ease = 0.32, color = "#2aa7e4" } = options;

  return mountCursor("rm-trail-cursor", (layer, pointer) => {
    const many = clamp(count, 2, 24);
    layer.style.setProperty("--rm-trail-cursor-size", `${size}px`);
    layer.style.setProperty("--rm-trail-cursor-color", color);

    const links = [];
    for (let i = 0; i < many; i++) {
      const dot = document.createElement("span");
      dot.className = "rm-trail-cursor-dot";
      // Each one smaller and fainter than the one before it.
      const share = 1 - i / many;
      dot.style.setProperty("--rm-trail-cursor-share", share.toFixed(3));
      layer.appendChild(dot);
      links.push({ dot, x: pointer.x, y: pointer.y });
    }

    const soft = prefersReducedMotion();

    return {
      frame: () => {
        let leadX = pointer.x;
        let leadY = pointer.y;
        for (const link of links) {
          link.x = soft ? leadX : lerp(link.x, leadX, ease);
          link.y = soft ? leadY : lerp(link.y, leadY, ease);
          link.dot.style.transform = `translate3d(${link.x.toFixed(1)}px, ${link.y.toFixed(1)}px, 0)`;
          leadX = link.x;
          leadY = link.y;
        }
      },
    };
  }, { hide: false });
}

/**
 * The cursor becomes a word over anything that has one.
 *
 * A pill that reads "drag", "play", "open" — whatever the element says in
 * `data-rm-say`. The word is the point, so it is read from the markup rather
 * than configured in a script, and the element keeps whatever accessible name
 * it already had: this is a flourish for people using a pointer, never the
 * only place the affordance is stated.
 */
export function sayCursor(options = {}) {
  const { attribute = "data-rm-say", ease = 0.2 } = options;

  return mountCursor("rm-say-cursor", (layer, pointer) => {
    layer.innerHTML = '<span class="rm-say-cursor-word"></span>';
    const word = layer.querySelector(".rm-say-cursor-word");
    const at = { x: pointer.x, y: pointer.y };
    const soft = prefersReducedMotion();

    const onOver = (event) => {
      const holder = event.target.closest?.(`[${attribute}]`);
      const text = holder?.getAttribute(attribute);
      if (text) {
        word.textContent = text;
        layer.classList.add("is-saying");
      } else {
        layer.classList.remove("is-saying");
      }
    };
    addEventListener("pointerover", onOver, { passive: true });

    return {
      frame: () => {
        at.x = soft ? pointer.x : lerp(at.x, pointer.x, ease);
        at.y = soft ? pointer.y : lerp(at.y, pointer.y, ease);
        layer.style.transform = `translate3d(${at.x.toFixed(1)}px, ${at.y.toFixed(1)}px, 0)`;
      },
      cleanup: () => removeEventListener("pointerover", onOver),
    };
  }, { hide: false });
}

/**
 * The page dims except where you are pointing.
 *
 * One fixed layer with a radial-gradient mask following two custom properties,
 * so the whole effect is two numbers a frame over a single composited layer —
 * not a canvas, and not a hole punched by redrawing anything.
 *
 * It never goes fully opaque, because a spotlight that hides the page is a
 * page nobody can read while they look for the switch.
 */
export function spotlightCursor(options = {}) {
  const { radius = 190, dim = 0.62, ease = 0.22 } = options;

  return mountCursor("rm-spotlight-cursor", (layer, pointer) => {
    layer.style.setProperty("--rm-spotlight-cursor-radius", `${radius}px`);
    layer.style.setProperty("--rm-spotlight-cursor-dim", String(clamp(dim, 0, 0.85)));

    const at = { x: pointer.x, y: pointer.y };
    const soft = prefersReducedMotion();

    return {
      frame: () => {
        at.x = soft ? pointer.x : lerp(at.x, pointer.x, ease);
        at.y = soft ? pointer.y : lerp(at.y, pointer.y, ease);
        layer.style.setProperty("--rm-spotlight-cursor-x", `${at.x.toFixed(1)}px`);
        layer.style.setProperty("--rm-spotlight-cursor-y", `${at.y.toFixed(1)}px`);
      },
    };
  }, { hide: false });
}

/**
 * A sharp arrow that points the way you are moving.
 *
 * The angle is smoothed across frames rather than taken raw, because a raw
 * angle from a nearly-still pointer is noise and the arrow spins. Below a
 * minimum speed it simply keeps the heading it had, which is what makes it
 * feel deliberate instead of nervous.
 */
export function arrowCursor(options = {}) {
  const { size = 26, ease = 0.3, turn = 0.2, color = "#f1eee9" } = options;

  return mountCursor("rm-arrow-cursor", (layer, pointer) => {
    layer.style.setProperty("--rm-arrow-cursor-size", `${size}px`);
    layer.style.setProperty("--rm-arrow-cursor-color", color);
    layer.innerHTML =
      '<svg viewBox="0 0 24 24" class="rm-arrow-cursor-mark">' +
      '<path d="M12 2 L20 21 L12 16 L4 21 Z"/></svg>';

    const mark = layer.querySelector(".rm-arrow-cursor-mark");
    const at = { x: pointer.x, y: pointer.y };
    const soft = prefersReducedMotion();
    let heading = 0;

    return {
      frame: () => {
        const wasX = at.x;
        const wasY = at.y;
        at.x = soft ? pointer.x : lerp(at.x, pointer.x, ease);
        at.y = soft ? pointer.y : lerp(at.y, pointer.y, ease);
        layer.style.transform = `translate3d(${at.x.toFixed(1)}px, ${at.y.toFixed(1)}px, 0)`;
        if (soft) return;

        const dx = at.x - wasX;
        const dy = at.y - wasY;
        // Below this, the direction is noise and the arrow would spin.
        if (Math.hypot(dx, dy) > 0.6) {
          const want = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
          // Take the shorter way round, so it never unwinds the long way.
          let delta = ((want - heading + 540) % 360) - 180;
          heading += delta * turn;
        }
        mark.style.transform = `rotate(${heading.toFixed(1)}deg)`;
      },
    };
  });
}

/**
 * A circle that magnifies whatever is under it.
 *
 * `backdrop-filter` on a circular layer, so it magnifies the real page — live
 * text, live video, whatever is there — rather than a second copy of it. There
 * is no duplicate DOM to keep in sync and nothing to go stale.
 *
 * The scale is modest on purpose: a lens that magnifies heavily has to be
 * placed precisely, and a lens attached to the pointer never can be.
 */
export function lensCursor(options = {}) {
  const { size = 120, zoom = 1.35, ease = 0.2 } = options;

  return mountCursor("rm-lens-cursor", (layer, pointer) => {
    layer.style.setProperty("--rm-lens-cursor-size", `${size}px`);
    layer.style.setProperty("--rm-lens-cursor-zoom", String(clamp(zoom, 1, 2)));

    const at = { x: pointer.x, y: pointer.y };
    const soft = prefersReducedMotion();

    return {
      frame: () => {
        at.x = soft ? pointer.x : lerp(at.x, pointer.x, ease);
        at.y = soft ? pointer.y : lerp(at.y, pointer.y, ease);
        layer.style.transform = `translate3d(${at.x.toFixed(1)}px, ${at.y.toFixed(1)}px, 0)`;
      },
    };
  }, { hide: false });
}
