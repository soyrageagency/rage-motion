/**
 * Media and list effects — the agency-portfolio staples.
 *
 *   • imageReveal()  — a curtain wipes away to uncover an image.
 *   • pixelate()     — a pixel grid dissolves on hover.
 *   • hoverPreview() — a list of links that shows a floating image per row.
 *   • marquee()      — an infinite ticker that never jumps.
 *   • ticker()       — the same, driven by scroll direction.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import {
  clamp, dataNumber, dataString, EASE, lerp, loopWhileVisible, onFrame,
  prefersReducedMotion, resolveElements,
} from "../core/motion.js";

/**
 * Uncover an image with a sliding curtain.
 *
 * The image is also scaled slightly and settles back as the curtain leaves,
 * which is what stops it looking like a rectangle sliding off a static
 * picture.
 */
export function imageReveal(target = "[data-rm-image-reveal]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const {
    direction = "left", duration = 1100, color = "#0E0E0E",
    threshold = 0.25, easing = EASE.inOut, zoom = 1.12,
  } = options;

  const AXIS = {
    left: ["inset(0 100% 0 0)", "inset(0 0 0 0)", "inset(0 0 0 100%)"],
    right: ["inset(0 0 0 100%)", "inset(0 0 0 0)", "inset(0 100% 0 0)"],
    up: ["inset(100% 0 0 0)", "inset(0 0 0 0)", "inset(0 0 100% 0)"],
    down: ["inset(0 0 100% 0)", "inset(0 0 0 0)", "inset(100% 0 0 0)"],
  };

  const cleanups = [];

  for (const element of elements) {
    const dir = dataString(element, "rmImageReveal", direction);
    const [, mid, out] = AXIS[dir] ?? AXIS.left;
    element.classList.add("rm-image-reveal");

    const curtain = document.createElement("span");
    curtain.className = "rm-curtain";
    curtain.setAttribute("aria-hidden", "true");
    curtain.style.background = dataString(element, "rmColor", color);
    element.appendChild(curtain);

    const media = element.querySelector("img, video, picture");
    if (media && !prefersReducedMotion()) {
      media.style.transform = `scale(${zoom})`;
      media.style.willChange = "transform";
    }

    const run = () => {
      const span = dataNumber(element, "rmDuration", duration);
      if (prefersReducedMotion()) {
        curtain.remove();
        if (media) media.style.transform = "";
        element.classList.add("rm-revealed");
        return;
      }
      curtain.animate([{ clipPath: mid }, { clipPath: out }], {
        duration: span, easing, fill: "forwards",
      }).finished.then(() => curtain.remove()).catch(() => curtain.remove());

      if (media) {
        media.animate([{ transform: `scale(${zoom})` }, { transform: "scale(1)" }], {
          duration: span * 1.25, easing, fill: "forwards",
        }).finished.then(() => {
          media.style.transform = "";
          media.style.willChange = "";
        }).catch(() => {});
      }
      element.classList.add("rm-revealed");
    };

    cleanups.push(loopWhileVisible(element, run, dataNumber(element, "rmLoop", 0)));
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A pixel grid that dissolves on hover.
 *
 * Built from real elements rather than a canvas so the pixels can be styled,
 * and capped at a sane count — a 40×40 grid is 1,600 nodes per card, which is
 * fine once and ruinous on a page of twelve.
 */
export function pixelate(target = "[data-rm-pixel]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { columns = 14, color = "#0E0E0E", duration = 620, stagger = 14 } = options;
  const cleanups = [];

  for (const element of elements) {
    const cols = Math.min(24, dataNumber(element, "rmColumns", columns));
    const box = element.getBoundingClientRect();
    const rows = Math.max(1, Math.round((box.height / Math.max(1, box.width)) * cols));

    element.classList.add("rm-pixel");
    const grid = document.createElement("span");
    grid.className = "rm-pixel-grid";
    grid.setAttribute("aria-hidden", "true");
    grid.style.setProperty("--rm-pixel-cols", String(cols));
    grid.style.setProperty("--rm-pixel-rows", String(rows));

    const cells = [];
    for (let i = 0; i < cols * rows; i++) {
      const cell = document.createElement("i");
      cell.style.background = dataString(element, "rmColor", color);
      grid.appendChild(cell);
      cells.push(cell);
    }
    element.appendChild(grid);

    // A random order per card, so two cards side by side do not dissolve in
    // lockstep — that is what makes it read as a grid rather than an effect.
    const order = cells.map((_, i) => i).sort(() => Math.random() - 0.5);

    const play = (show) => {
      if (prefersReducedMotion()) {
        cells.forEach((cell) => { cell.style.opacity = show ? "1" : "0"; });
        return;
      }
      order.forEach((index, position) => {
        cells[index].animate(
          [{ opacity: show ? 0 : 1 }, { opacity: show ? 1 : 0 }],
          { duration, delay: (position / cells.length) * stagger * cols, fill: "forwards", easing: "linear" },
        );
      });
    };

    const onEnter = () => play(true);
    const onLeave = () => play(false);
    element.addEventListener("pointerenter", onEnter);
    element.addEventListener("pointerleave", onLeave);

    cleanups.push(() => {
      element.removeEventListener("pointerenter", onEnter);
      element.removeEventListener("pointerleave", onLeave);
      grid.remove();
      element.classList.remove("rm-pixel");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A list of links, each showing a floating image as you hover it.
 *
 * The signature interaction of a studio index page. One shared floating
 * element rather than one per row, and it lags behind the pointer so it feels
 * carried rather than pinned.
 */
export function hoverPreview(target = "[data-rm-preview]", options = {}) {
  const containers = resolveElements(target);
  if (!containers.length) return () => {};
  if (typeof matchMedia === "function" && !matchMedia("(pointer: fine)").matches) return () => {};

  const { selector = "[data-rm-preview-src]", width = 300, ease = 0.14, rotate = 6 } = options;
  const cleanups = [];

  for (const container of containers) {
    const rows = [...container.querySelectorAll(selector)];
    if (!rows.length) continue;

    const floater = document.createElement("div");
    floater.className = "rm-preview";
    floater.setAttribute("aria-hidden", "true");
    floater.style.setProperty("--rm-preview-width", `${width}px`);
    const image = document.createElement("img");
    image.alt = "";
    image.loading = "lazy";
    floater.appendChild(image);
    container.appendChild(floater);

    const pointer = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let active = false;
    let lastX = 0;

    const onMove = (event) => {
      const box = container.getBoundingClientRect();
      pointer.x = event.clientX - box.left;
      pointer.y = event.clientY - box.top;
    };

    const enterRow = (row) => {
      const src = row.dataset.rmPreviewSrc;
      if (!src) return;
      image.src = src;
      active = true;
      floater.classList.add("is-visible");
    };
    const leaveRow = () => {
      active = false;
      floater.classList.remove("is-visible");
    };

    container.addEventListener("pointermove", onMove, { passive: true });
    for (const row of rows) {
      row.addEventListener("pointerenter", () => enterRow(row));
      row.addEventListener("pointerleave", leaveRow);
    }

    const reduced = prefersReducedMotion();
    const stopFrame = onFrame(() => {
      if (!active && !floater.classList.contains("is-visible")) return;
      const follow = reduced ? 1 : ease;
      current.x = lerp(current.x, pointer.x, follow);
      current.y = lerp(current.y, pointer.y, follow);
      // Tilt with horizontal velocity: the image leans into the movement.
      const velocity = clamp((current.x - lastX) / 12, -1, 1);
      lastX = current.x;
      floater.style.transform =
        `translate3d(${current.x.toFixed(1)}px, ${current.y.toFixed(1)}px, 0) translate(-50%, -50%) ` +
        `rotate(${reduced ? 0 : (velocity * rotate).toFixed(2)}deg)`;
    });

    cleanups.push(() => {
      stopFrame();
      container.removeEventListener("pointermove", onMove);
      floater.remove();
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A strip that moves, and knows what you are doing to it.
 *
 * Most marquees are one CSS animation on a duplicated row. That version cannot
 * be dragged, cannot respond to the page, snaps between moving and stopped,
 * and has a hard edge where the content is guillotined at the container. This
 * one is built around a single velocity that everything writes to and that
 * eases toward what it is asked for, so the influences compose instead of
 * fighting:
 *
 *   • the resting speed
 *   • the page's own scrolling, which speeds the strip up and — going back up
 *     the page — reverses it, so the two motions read as one system
 *   • the pointer resting on it, which slows it almost to a stop rather than
 *     freezing it dead
 *   • a finger or a mouse dragging it, which hands over its own velocity on
 *     release, so a flick keeps going
 *
 * The strip skews with its velocity and straightens as it settles, which is
 * inertia rendered rather than described, and it fades at both edges instead
 * of cutting the content off at a hard boundary.
 *
 * Two details that decide whether it is usable: `touch-action: pan-y` means a
 * vertical swipe still scrolls the page — a horizontal strip that eats the
 * page scroll is the commonest way this component ruins a phone — and a drag
 * that actually travelled swallows the click at the end of it, so dragging
 * past a link does not open it.
 *
 * Under reduced motion it stops entirely and becomes a plain scrollable row,
 * because the content was always the point.
 *
 *   <div data-rm-marquee data-rm-speed="80">…</div>
 */
export function marquee(target = "[data-rm-marquee]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const {
    speed = 60,
    direction = "left",
    gap = 48,
    fade = 12,
    drag = true,
    scrollBoost = 2.2,
    scrollFlip = true,
    skew = 0.9,
    hoverSlow = 0.15,
  } = options;
  const cleanups = [];

  for (const element of elements) {
    const original = element.innerHTML;
    const space = dataNumber(element, "rmGap", gap);
    const base = dataNumber(element, "rmSpeed", speed);
    /*
     * Four directions, two axes, one set of arithmetic.
     *
     * A vertical marquee is not a different component — it is the same track
     * measured on the other side and translated on the other axis. Writing it
     * as a second component is how you end up with two of everything: two
     * wrap conditions, two drag handlers, two places for the seam bug to live.
     * So the axis is a pair of numbers and the rest of the file does not know
     * which way it is pointing.
     */
    const way = dataString(element, "rmDirection", direction);
    const vertical = way === "up" || way === "down";
    const facing = way === "right" || way === "down" ? 1 : -1;
    element.classList.toggle("is-vertical", vertical);

    element.classList.add("rm-marquee");
    element.style.setProperty("--rm-marquee-fade", `${dataNumber(element, "rmFade", fade)}%`);

    const track = document.createElement("div");
    track.className = "rm-marquee-track";
    track.style.gap = `${space}px`;

    const group = document.createElement("div");
    group.className = "rm-marquee-group";
    group.style.gap = `${space}px`;
    group.innerHTML = original;
    track.appendChild(group);
    element.replaceChildren(track);

    let copyWidth = 0;
    const fill = () => {
      // Rebuild from one copy, then add copies until the track is at least
      // twice the viewport: enough that a reset is never visible.
      track.replaceChildren(group);
      const box = group.getBoundingClientRect();
      copyWidth = (vertical ? box.height : box.width) + space;
      if (copyWidth <= 0) return;
      const needed = Math.ceil(((vertical ? innerHeight : innerWidth) * 2) / copyWidth);
      for (let i = 0; i < needed; i++) {
        const clone = group.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        track.appendChild(clone);
      }
    };
    fill();
    const onResize = () => fill();
    addEventListener("resize", onResize);

    /*
     * Reduced motion leaves the content in place and scrollable, rather than
     * an endlessly moving strip that cannot be read.
     */
    if (prefersReducedMotion()) {
      element.classList.add("is-static");
      cleanups.push(() => {
        removeEventListener("resize", onResize);
        element.classList.remove("rm-marquee", "is-static");
        element.innerHTML = original;
      });
      continue;
    }

    let offset = facing === -1 ? 0 : -copyWidth;
    let last = 0;

    /*
     * One velocity, eased.
     *
     * Everything that can influence the strip — the resting speed, the page's
     * scrolling, the pointer resting on it, a finger dragging it — writes to
     * `wanted`, and the actual velocity chases it. That is what makes it stop
     * and start like something with weight instead of snapping between
     * states, and it means the inputs compose instead of fighting.
     */
    let velocity = base * facing;
    let hovering = false;

    // How fast the page itself is moving, in pixels per second.
    let scrollWas = scrollY;
    let scrollRate = 0;
    const onScroll = () => {
      const now = scrollY;
      scrollRate = now - scrollWas;
      scrollWas = now;
    };
    addEventListener("scroll", onScroll, { passive: true });

    const onEnter = () => { hovering = true; };
    const onLeave = () => { hovering = false; };
    element.addEventListener("pointerenter", onEnter);
    element.addEventListener("pointerleave", onLeave);
    element.addEventListener("focusin", onEnter);
    element.addEventListener("focusout", onLeave);

    /*
     * Dragging.
     *
     * Pointer events rather than mouse and touch separately, and the strip is
     * released with whatever velocity the hand had, so a flick keeps going.
     * `touch-action: pan-y` in the stylesheet means a vertical swipe still
     * scrolls the page — a horizontal strip that eats the page scroll is the
     * commonest way this component ruins a phone.
     */
    let dragging = false;
    let dragFrom = 0;
    let dragAt = 0;
    let flung = 0;

    const onDown = (event) => {
      if (!drag || event.button > 0) return;
      dragging = true;
      dragFrom = vertical ? event.clientY : event.clientX;
      dragAt = dragFrom;
      flung = 0;
      element.classList.add("is-dragging");
      element.setPointerCapture?.(event.pointerId);
    };
    const along = (event) => (vertical ? event.clientY : event.clientX);
    const onMove = (event) => {
      if (!dragging) return;
      const moved = along(event) - dragAt;
      dragAt = along(event);
      offset += moved;
      flung = moved;
    };
    const onUp = (event) => {
      if (!dragging) return;
      dragging = false;
      element.classList.remove("is-dragging");
      element.releasePointerCapture?.(event.pointerId);
      // A flick hands its speed to the strip; a slow drag hands over nothing.
      velocity += flung * 18;
      // A drag that went nowhere was a click, and a click on a link is a link.
      if (Math.abs((vertical ? event.clientY : event.clientX) - dragFrom) > 6) {
        const swallow = (click) => { click.preventDefault(); click.stopPropagation(); };
        element.addEventListener("click", swallow, { capture: true, once: true });
        setTimeout(() => element.removeEventListener("click", swallow, { capture: true }), 0);
      }
    };

    if (drag) {
      element.addEventListener("pointerdown", onDown);
      element.addEventListener("pointermove", onMove);
      element.addEventListener("pointerup", onUp);
      element.addEventListener("pointercancel", onUp);
    }

    const boost = dataNumber(element, "rmBoost", scrollBoost);
    const lean = dataNumber(element, "rmLean", skew);

    const stopFrame = onFrame((now) => {
      const delta = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      if (copyWidth <= 0) return;

      // The page's own scrolling drives the strip: faster while you move, and
      // reversed when you go back up, so the two motions read as one system
      // rather than two things happening at once.
      const pushed = scrollRate * boost * 60;
      const heading = scrollFlip && scrollRate !== 0 ? (scrollRate > 0 ? facing : -facing) : facing;
      const wanted = dragging ? 0 : (base * heading) + (pushed * heading * (heading === facing ? 1 : -1));
      const target = hovering && !dragging ? wanted * hoverSlow : wanted;

      velocity = lerp(velocity, target, dragging ? 0.4 : 0.06);
      scrollRate *= 0.86;

      if (!dragging) offset += velocity * delta;

      // Wrap by exactly one copy, so the seam always lands on identical
      // content — in both directions, because the strip can now reverse.
      while (offset <= -copyWidth) offset += copyWidth;
      while (offset > 0) offset -= copyWidth;

      // Skew with the velocity: the strip leans into its own movement and
      // straightens as it settles. It is a transform, so it costs nothing.
      const tilt = clamp((velocity / 900) * lean, -6, 6);
      // The lean is across the direction of travel, whichever that is.
      track.style.transform = vertical
        ? `translate3d(0, ${offset.toFixed(2)}px, 0) skewY(${tilt.toFixed(2)}deg)`
        : `translate3d(${offset.toFixed(2)}px, 0, 0) skewX(${tilt.toFixed(2)}deg)`;
    });

    cleanups.push(() => {
      stopFrame();
      removeEventListener("resize", onResize);
      removeEventListener("scroll", onScroll);
      element.removeEventListener("pointerenter", onEnter);
      element.removeEventListener("pointerleave", onLeave);
      element.removeEventListener("focusin", onEnter);
      element.removeEventListener("focusout", onLeave);
      element.removeEventListener("pointerdown", onDown);
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerup", onUp);
      element.removeEventListener("pointercancel", onUp);
      element.classList.remove("rm-marquee", "is-dragging");
      element.innerHTML = original;
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

