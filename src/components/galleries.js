/**
 * Galleries — twenty ways to show a set of pictures.
 *
 *   • masonry()      — a column grid that settles with a FLIP when it reflows.
 *   • swipeStack()   — a pile you throw away, by hand or by keyboard.
 *   • filmstrip()    — a strip with sprocket holes and real inertia.
 *   • hoverPeek()    — a list of titles that floats its picture by the pointer.
 *   • polaroids()    — scattered prints that straighten when you reach them.
 *   • foldGallery()  — panels that open sideways, one at a time.
 *   • gridZoom()     — a tile that grows to fill the grid, and comes back.
 *   • crossfade()    — a slideshow that is really a tablist.
 *   • parallaxGrid() — tiles drifting at their own rates as you scroll.
 *   • tiltGrid()     — every tile leaning toward the pointer.
 *   • maskReveal()   — a picture uncovered by a shape as you scroll.
 *   • slats()        — a picture assembled from vertical strips.
 *   • zoomStrip()    — a row where whatever is centred is largest.
 *   • spiralGallery() — items on a spiral that turns with the page.
 *   • imageWall()    — a wall you drag around, with weight.
 *   • flipGrid()     — cards turning over in sequence as they arrive.
 *   • peelStack()    — a pile you peel through, one print at a time.
 *   • focusGrid()    — reach for one tile and the rest stand back.
 *   • ribbon()       — pictures along a curve, moving with the scroll.
 *   • contactSheet() — a sheet of frames, one of which opens.
 *
 * A gallery is mostly images, and images are the one thing on a page that a
 * visitor is definitely waiting for. So three rules run through all twenty:
 *
 *   • Nothing here hides an image until a script decides to show it. Every one
 *     of these degrades to a plain, readable set of pictures with the
 *     JavaScript removed, because a gallery that needs a script to be visible
 *     is a gallery that is blank on the slowest connections.
 *   • Nothing animates a width or a height. Where a tile appears to grow, it
 *     is a FLIP — measure, change, invert, play — so the layout settles once
 *     and the animation is a transform over the top of it.
 *   • Everything that can be pointed at can be reached. Drag has a keyboard
 *     equivalent, hover has a focus equivalent, and anything that opens closes
 *     on Escape and hands focus back.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import {
  clamp, dataNumber, dataString, EASE, lerp, onFrame,
  prefersReducedMotion, resolveElements, watch, whileVisible,
} from "../core/motion.js";

/** The children a gallery is about. */
function itemsOf(holder, selector) {
  return selector ? [...holder.querySelectorAll(selector)] : [...holder.children];
}

/**
 * Play a FLIP from a set of remembered boxes.
 *
 * Measure before the change, call this after it. Each element is put back
 * where it was with a transform and then released, so the layout has already
 * settled and the animation is pure compositing over the top of it.
 */
function flipFrom(boxes, duration = 460) {
  if (prefersReducedMotion()) return;
  for (const [element, was] of boxes) {
    const now = element.getBoundingClientRect();
    const dx = was.left - now.left;
    const dy = was.top - now.top;
    const sx = was.width / (now.width || 1);
    const sy = was.height / (now.height || 1);
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 && Math.abs(sx - 1) < 0.01 && Math.abs(sy - 1) < 0.01) continue;
    element.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
        { transform: "none" },
      ],
      { duration, easing: EASE.out },
    );
  }
}

/** Remember where a set of elements are, for a FLIP. */
const measure = (elements) => elements.map((el) => [el, el.getBoundingClientRect()]);

/**
 * A column grid that settles with a FLIP when it reflows.
 *
 * Balanced by height rather than dealt round-robin, so the columns end level
 * instead of one running long — the arithmetic is trivial and it is the whole
 * difference between a masonry that looks composed and one that looks like a
 * bug. When the column count changes, every tile that moves plays a FLIP from
 * where it was, so a resize reads as a rearrangement rather than a jump cut.
 *
 *   <div data-rm-masonry data-rm-columns="3">…</div>
 */
export function masonry(target = "[data-rm-masonry]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { columns = 3, gap = 14, min = 220 } = options;
  const cleanups = [];

  for (const holder of holders) {
    const tiles = itemsOf(holder);
    if (!tiles.length) continue;

    holder.classList.add("rm-masonry");
    holder.style.setProperty("--rm-masonry-gap", `${dataNumber(holder, "rmGap", gap)}px`);
    const most = Math.max(1, dataNumber(holder, "rmColumns", columns));
    const narrowest = dataNumber(holder, "rmMin", min);

    let lanes = [];
    const build = (animate) => {
      const boxes = animate ? measure(tiles) : null;
      const count = Math.max(1, Math.min(most, Math.floor(holder.clientWidth / narrowest) || 1));
      if (lanes.length === count) return;

      lanes.forEach((lane) => lane.remove());
      lanes = Array.from({ length: count }, () => {
        const lane = document.createElement("div");
        lane.className = "rm-masonry-lane";
        holder.appendChild(lane);
        return lane;
      });

      // Balanced by height: the next tile goes wherever there is most room.
      const heights = new Array(count).fill(0);
      for (const tile of tiles) {
        let shortest = 0;
        for (let i = 1; i < count; i++) if (heights[i] < heights[shortest]) shortest = i;
        lanes[shortest].appendChild(tile);
        heights[shortest] += tile.getBoundingClientRect().height || 1;
      }
      if (boxes) flipFrom(boxes);
    };

    build(false);
    const onResize = () => build(true);
    addEventListener("resize", onResize);

    cleanups.push(() => {
      removeEventListener("resize", onResize);
      tiles.forEach((tile) => holder.appendChild(tile));
      lanes.forEach((lane) => lane.remove());
      holder.classList.remove("rm-masonry");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A pile you throw away, by hand or by keyboard.
 *
 * The card follows the hand while it is held and leaves in the direction it
 * was travelling, so the throw is the gesture rather than a canned animation
 * played after one. Left and right arrows do the same thing, and the pile is a
 * real list with a live region announcing what is on top — a stack you can
 * only operate by dragging is a stack half your visitors cannot use at all.
 *
 *   <div data-rm-swipe-stack><article>…</article></div>
 */
export function swipeStack(target = "[data-rm-swipe-stack]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { throwAt = 110, lift = 12, duration = 380 } = options;
  const cleanups = [];

  for (const holder of holders) {
    const cards = itemsOf(holder);
    if (cards.length < 2) continue;

    holder.classList.add("rm-swipe-stack");
    holder.tabIndex = 0;
    holder.setAttribute("role", "group");
    holder.setAttribute("aria-roledescription", "card stack");
    holder.setAttribute("aria-keyshortcuts", "ArrowLeft ArrowRight");

    const said = document.createElement("p");
    said.className = "rm-swipe-stack-live";
    said.setAttribute("aria-live", "polite");
    holder.appendChild(said);

    let order = cards.map((_, i) => i);
    const place = () => {
      order.forEach((card, position) => {
        const el = cards[card];
        el.classList.add("rm-swipe-stack-card");
        el.style.transform = `translateY(${position * lift}px) scale(${1 - position * 0.04})`;
        el.style.zIndex = String(cards.length - position);
        el.style.opacity = position > 2 ? "0" : "1";
        el.inert = position !== 0;
      });
      said.textContent = `Card ${order[0] + 1} of ${cards.length}`;
    };
    place();

    const send = (way) => {
      const top = cards[order[0]];
      const away = () => { order = [...order.slice(1), order[0]]; place(); };
      if (prefersReducedMotion()) { away(); return; }
      top.animate(
        [
          { transform: top.style.transform, opacity: 1 },
          { transform: `translate(${way * 130}%, -10%) rotate(${way * 16}deg)`, opacity: 0 },
        ],
        { duration, easing: EASE.inOut },
      ).finished.then(away, away);
    };

    let holding = false;
    let from = 0;
    let moved = 0;

    const onDown = (event) => {
      if (event.button > 0) return;
      holding = true;
      from = event.clientX;
      moved = 0;
      holder.setPointerCapture?.(event.pointerId);
    };
    const onMove = (event) => {
      if (!holding) return;
      moved = event.clientX - from;
      const top = cards[order[0]];
      top.style.transform = `translateX(${moved}px) rotate(${(moved / 22).toFixed(2)}deg)`;
    };
    const onUp = (event) => {
      if (!holding) return;
      holding = false;
      holder.releasePointerCapture?.(event.pointerId);
      if (Math.abs(moved) > throwAt) send(Math.sign(moved));
      else place();
    };
    const onKey = (event) => {
      if (event.key === "ArrowLeft") { event.preventDefault(); send(-1); }
      else if (event.key === "ArrowRight") { event.preventDefault(); send(1); }
    };

    holder.addEventListener("pointerdown", onDown);
    holder.addEventListener("pointermove", onMove);
    holder.addEventListener("pointerup", onUp);
    holder.addEventListener("pointercancel", onUp);
    holder.addEventListener("keydown", onKey);

    cleanups.push(() => {
      holder.removeEventListener("pointerdown", onDown);
      holder.removeEventListener("pointermove", onMove);
      holder.removeEventListener("pointerup", onUp);
      holder.removeEventListener("pointercancel", onUp);
      holder.removeEventListener("keydown", onKey);
      said.remove();
      cards.forEach((card) => {
        card.classList.remove("rm-swipe-stack-card");
        card.style.cssText = "";
        card.inert = false;
      });
      holder.classList.remove("rm-swipe-stack");
      holder.removeAttribute("role");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A strip with sprocket holes and real inertia.
 *
 * Native scrolling underneath — so it keeps momentum, snapping, a trackpad,
 * a scrollbar and every accessibility affordance the platform provides — with
 * a drag added on top for the mouse. The sprocket holes are one repeating
 * gradient rather than a hundred elements.
 *
 *   <div data-rm-filmstrip>…</div>
 */
export function filmstrip(target = "[data-rm-filmstrip]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { label = "Film strip" } = options;
  const cleanups = [];

  for (const holder of holders) {
    holder.classList.add("rm-filmstrip");
    holder.setAttribute("role", "region");
    holder.setAttribute("aria-label", dataString(holder, "rmLabel", label));
    holder.tabIndex = 0;

    const frames = itemsOf(holder);
    frames.forEach((frame) => frame.classList.add("rm-filmstrip-frame"));

    let holding = false;
    let from = 0;
    let started = 0;

    const onDown = (event) => {
      if (event.button > 0) return;
      holding = true;
      from = event.clientX;
      started = holder.scrollLeft;
      holder.classList.add("is-dragging");
      holder.setPointerCapture?.(event.pointerId);
    };
    const onMove = (event) => {
      if (!holding) return;
      holder.scrollLeft = started - (event.clientX - from);
    };
    const onUp = (event) => {
      if (!holding) return;
      holding = false;
      holder.classList.remove("is-dragging");
      holder.releasePointerCapture?.(event.pointerId);
    };

    holder.addEventListener("pointerdown", onDown);
    holder.addEventListener("pointermove", onMove);
    holder.addEventListener("pointerup", onUp);
    holder.addEventListener("pointercancel", onUp);

    cleanups.push(() => {
      holder.removeEventListener("pointerdown", onDown);
      holder.removeEventListener("pointermove", onMove);
      holder.removeEventListener("pointerup", onUp);
      holder.removeEventListener("pointercancel", onUp);
      frames.forEach((frame) => frame.classList.remove("rm-filmstrip-frame"));
      holder.classList.remove("rm-filmstrip", "is-dragging");
      holder.removeAttribute("role");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A list of titles that floats its picture by the pointer.
 *
 * One shared image element rather than one per row, with the source swapped as
 * you move, so a hundred-row index costs one node and one decode at a time.
 * The picture lags the pointer, which is what makes it feel attached rather
 * than teleported.
 *
 * Focus shows it too, pinned beside the focused row instead of at a pointer
 * that is not there.
 *
 *   <ul data-rm-hover-peek><li data-rm-peek-src="/a.jpg">Title</li></ul>
 */
export function hoverPeek(target = "[data-rm-hover-peek]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { ease = 0.16, attribute = "data-rm-peek-src" } = options;
  const cleanups = [];

  for (const holder of holders) {
    const rows = itemsOf(holder).filter((row) => row.hasAttribute(attribute));
    if (!rows.length) continue;

    holder.classList.add("rm-hover-peek");
    const float = document.createElement("img");
    float.className = "rm-hover-peek-image";
    float.alt = "";
    float.setAttribute("aria-hidden", "true");
    float.decoding = "async";
    holder.appendChild(float);

    const at = { x: 0, y: 0 };
    const want = { x: 0, y: 0 };
    let showing = false;

    const show = (row, x, y) => {
      const src = row.getAttribute(attribute);
      if (float.getAttribute("src") !== src) float.setAttribute("src", src);
      const box = holder.getBoundingClientRect();
      want.x = x - box.left;
      want.y = y - box.top;
      if (!showing) { at.x = want.x; at.y = want.y; showing = true; }
      holder.classList.add("is-peeking");
    };
    const hide = () => { showing = false; holder.classList.remove("is-peeking"); };

    const onMove = (event) => {
      const row = event.target.closest?.(`[${attribute}]`);
      if (row && holder.contains(row)) show(row, event.clientX, event.clientY);
      else hide();
    };
    const onFocus = (event) => {
      const row = event.target.closest?.(`[${attribute}]`);
      if (!row) return;
      const box = row.getBoundingClientRect();
      show(row, box.right - 40, box.top + box.height / 2);
    };

    holder.addEventListener("pointermove", onMove);
    holder.addEventListener("pointerleave", hide);
    holder.addEventListener("focusin", onFocus);
    holder.addEventListener("focusout", hide);

    const soft = prefersReducedMotion();
    const stopFrame = onFrame(() => {
      if (!showing) return;
      at.x = soft ? want.x : lerp(at.x, want.x, ease);
      at.y = soft ? want.y : lerp(at.y, want.y, ease);
      float.style.transform = `translate3d(${at.x.toFixed(1)}px, ${at.y.toFixed(1)}px, 0) translate(-50%, -50%)`;
    });

    cleanups.push(() => {
      stopFrame();
      holder.removeEventListener("pointermove", onMove);
      holder.removeEventListener("pointerleave", hide);
      holder.removeEventListener("focusin", onFocus);
      holder.removeEventListener("focusout", hide);
      float.remove();
      holder.classList.remove("rm-hover-peek", "is-peeking");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Scattered prints that straighten when you reach them.
 *
 * The scatter is seeded from each print's position in the set rather than
 * random, so the arrangement is the same on every load — a gallery that
 * reshuffles itself on reload is a gallery that draws attention to its own
 * cleverness. Reaching one lifts it, squares it up and brings it to the front.
 *
 *   <div data-rm-polaroids><figure>…</figure></div>
 */
export function polaroids(target = "[data-rm-polaroids]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { spread = 7, shift = 10 } = options;
  const cleanups = [];

  for (const holder of holders) {
    const prints = itemsOf(holder);
    if (!prints.length) continue;

    holder.classList.add("rm-polaroids");
    const tilt = dataNumber(holder, "rmSpread", spread);
    const nudge = dataNumber(holder, "rmShift", shift);

    prints.forEach((print, i) => {
      print.classList.add("rm-polaroids-print");
      if (!print.hasAttribute("tabindex") && !print.querySelector("a, button")) print.tabIndex = 0;
      // Seeded from the index: the same wall every time.
      const angle = ((i % 2 ? 1 : -1) * tilt * (0.5 + ((i * 37) % 100) / 200)).toFixed(2);
      const drop = (((i * 53) % 100) / 100 - 0.5) * nudge * 2;
      print.style.setProperty("--rm-polaroids-angle", `${angle}deg`);
      print.style.setProperty("--rm-polaroids-drop", `${drop.toFixed(1)}px`);
      print.style.zIndex = String(i + 1);
    });

    cleanups.push(() => {
      prints.forEach((print) => {
        print.classList.remove("rm-polaroids-print");
        print.style.removeProperty("--rm-polaroids-angle");
        print.style.removeProperty("--rm-polaroids-drop");
        print.style.zIndex = "";
      });
      holder.classList.remove("rm-polaroids");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Panels that open sideways, one at a time.
 *
 * The widths are `flex-grow` on a flex row, so the browser distributes the
 * space and the panels always exactly fill the strip however many there are.
 * A version that sets percentage widths has to be told the count and is one
 * rounding error from a gap at the end.
 *
 * Keyboard focus opens a panel just as hovering does.
 *
 *   <div data-rm-fold><figure>…</figure></div>
 */
export function foldGallery(target = "[data-rm-fold]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { open = 3 } = options;
  const cleanups = [];

  for (const holder of holders) {
    const panels = itemsOf(holder);
    if (panels.length < 2) continue;

    holder.classList.add("rm-fold");
    holder.style.setProperty("--rm-fold-open", String(dataNumber(holder, "rmOpen", open)));
    panels.forEach((panel) => {
      panel.classList.add("rm-fold-panel");
      if (!panel.hasAttribute("tabindex") && !panel.querySelector("a, button")) panel.tabIndex = 0;
    });

    cleanups.push(() => {
      panels.forEach((panel) => panel.classList.remove("rm-fold-panel"));
      holder.classList.remove("rm-fold");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A tile that grows to fill the grid, and comes back.
 *
 * A FLIP in both directions: the tile is promoted, the layout settles at the
 * new size, and only then is the tile animated from where it was. Nothing
 * animates a width, so the grid never reflows mid-flight and the picture never
 * squashes.
 *
 * Escape closes it and focus goes back to the tile that opened.
 *
 *   <div data-rm-grid-zoom><button>…</button></div>
 */
export function gridZoom(target = "[data-rm-grid-zoom]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { duration = 480 } = options;
  const cleanups = [];

  for (const holder of holders) {
    const tiles = itemsOf(holder);
    if (!tiles.length) continue;

    holder.classList.add("rm-grid-zoom");
    tiles.forEach((tile) => {
      tile.classList.add("rm-grid-zoom-tile");
      tile.setAttribute("aria-expanded", "false");
      if (!tile.hasAttribute("tabindex") && tile.tagName !== "BUTTON") tile.tabIndex = 0;
    });

    let openTile = null;

    const set = (tile) => {
      const boxes = measure(tiles);
      if (openTile) openTile.classList.remove("is-open");
      openTile?.setAttribute("aria-expanded", "false");
      openTile = openTile === tile ? null : tile;
      if (openTile) {
        openTile.classList.add("is-open");
        openTile.setAttribute("aria-expanded", "true");
      }
      holder.classList.toggle("has-open", Boolean(openTile));
      flipFrom(boxes, duration);
    };

    const onClick = (event) => {
      const tile = event.target.closest(".rm-grid-zoom-tile");
      if (tile && holder.contains(tile)) set(tile);
    };
    const onKey = (event) => {
      if (event.key === "Escape" && openTile) {
        const was = openTile;
        event.preventDefault();
        set(openTile);
        was.focus();
      }
    };

    holder.addEventListener("click", onClick);
    holder.addEventListener("keydown", onKey);

    cleanups.push(() => {
      holder.removeEventListener("click", onClick);
      holder.removeEventListener("keydown", onKey);
      tiles.forEach((tile) => {
        tile.classList.remove("rm-grid-zoom-tile", "is-open");
        tile.removeAttribute("aria-expanded");
      });
      holder.classList.remove("rm-grid-zoom", "has-open");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A slideshow that is really a tablist.
 *
 * The frames crossfade with `opacity` and the dots are real tabs — arrow keys,
 * Home and End, `aria-selected`, one tab stop for the set. A slideshow whose
 * controls are anonymous divs is a slideshow a keyboard cannot operate, which
 * is most of them.
 *
 *   <div data-rm-crossfade><img>…</div>
 */
export function crossfade(target = "[data-rm-crossfade]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { interval = 4200, duration = 700, label = "Slideshow" } = options;
  const cleanups = [];

  for (const holder of holders) {
    const frames = itemsOf(holder);
    if (frames.length < 2) continue;

    holder.classList.add("rm-crossfade");
    holder.setAttribute("aria-roledescription", "carousel");
    holder.setAttribute("aria-label", dataString(holder, "rmLabel", label));
    holder.style.setProperty("--rm-crossfade-duration", `${prefersReducedMotion() ? 0 : duration}ms`);
    frames.forEach((frame) => frame.classList.add("rm-crossfade-frame"));

    const tabs = document.createElement("div");
    tabs.className = "rm-crossfade-dots";
    tabs.setAttribute("role", "tablist");
    tabs.setAttribute("aria-label", `${dataString(holder, "rmLabel", label)} frames`);
    holder.appendChild(tabs);

    let at = 0;
    const dots = frames.map((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "rm-crossfade-dot";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", `Frame ${i + 1}`);
      tabs.appendChild(dot);
      return dot;
    });

    const show = (index) => {
      at = (index + frames.length) % frames.length;
      frames.forEach((frame, i) => frame.classList.toggle("is-current", i === at));
      dots.forEach((dot, i) => {
        dot.setAttribute("aria-selected", String(i === at));
        dot.tabIndex = i === at ? 0 : -1;
      });
    };
    show(0);

    dots.forEach((dot, i) => dot.addEventListener("click", () => show(i)));
    const onKey = (event) => {
      const moves = { ArrowRight: 1, ArrowLeft: -1, Home: -at, End: frames.length - 1 - at };
      if (!(event.key in moves)) return;
      event.preventDefault();
      show(at + moves[event.key]);
      dots[at].focus();
    };
    tabs.addEventListener("keydown", onKey);

    const every = dataNumber(holder, "rmInterval", interval);
    const watching = prefersReducedMotion()
      ? () => {}
      : whileVisible(holder, () => {
        const timer = setInterval(() => show(at + 1), every);
        return () => clearInterval(timer);
      });

    cleanups.push(() => {
      watching();
      tabs.removeEventListener("keydown", onKey);
      tabs.remove();
      frames.forEach((frame) => frame.classList.remove("rm-crossfade-frame", "is-current"));
      holder.classList.remove("rm-crossfade");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * Tiles drifting at their own rates as you scroll.
 *
 * One scroll read for the whole grid and one transform per tile, with the
 * rates assigned by column so the drift reads as depth rather than as noise.
 * Every tile has room reserved for its travel, so nothing is ever clipped at
 * the top or bottom of its cell.
 *
 *   <div data-rm-parallax-grid><img>…</div>
 */
export function parallaxGrid(target = "[data-rm-parallax-grid]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { travel = 40, columns = 3 } = options;
  const cleanups = [];

  for (const holder of holders) {
    const tiles = itemsOf(holder);
    if (!tiles.length) continue;
    holder.classList.add("rm-parallax-grid");
    tiles.forEach((tile) => tile.classList.add("rm-parallax-grid-tile"));

    if (prefersReducedMotion()) {
      cleanups.push(() => {
        tiles.forEach((tile) => tile.classList.remove("rm-parallax-grid-tile"));
        holder.classList.remove("rm-parallax-grid");
      });
      continue;
    }

    const far = dataNumber(holder, "rmTravel", travel);
    const across = Math.max(1, dataNumber(holder, "rmColumns", columns));
    // Column 0 travels most, the middle least: depth, not noise.
    const rates = tiles.map((_, i) => {
      const column = i % across;
      return (column % 2 ? -1 : 1) * (0.4 + (column / across) * 0.6);
    });

    cleanups.push(whileVisible(holder, () => onFrame(() => {
      const box = holder.getBoundingClientRect();
      const through = clamp((innerHeight - box.top) / (innerHeight + box.height), 0, 1) - 0.5;
      tiles.forEach((tile, i) => {
        tile.style.transform = `translate3d(0, ${(through * far * rates[i]).toFixed(2)}px, 0)`;
      });
    })));

    cleanups.push(() => {
      tiles.forEach((tile) => {
        tile.style.transform = "";
        tile.classList.remove("rm-parallax-grid-tile");
      });
      holder.classList.remove("rm-parallax-grid");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * Every tile leaning toward the pointer.
 *
 * One listener on the grid rather than one per tile, and one shared frame for
 * all of them — a grid of forty tiles with forty listeners and forty rAF loops
 * is the usual version, and it is why those grids stutter.
 *
 *   <div data-rm-tilt-grid><figure>…</figure></div>
 */
export function tiltGrid(target = "[data-rm-tilt-grid]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { lean = 9, ease = 0.16 } = options;
  const cleanups = [];

  for (const holder of holders) {
    const tiles = itemsOf(holder);
    if (!tiles.length || prefersReducedMotion()) continue;

    holder.classList.add("rm-tilt-grid");
    tiles.forEach((tile) => tile.classList.add("rm-tilt-grid-tile"));
    const most = dataNumber(holder, "rmLean", lean);

    let pointer = null;
    const state = tiles.map(() => ({ x: 0, y: 0 }));

    const onMove = (event) => { pointer = { x: event.clientX, y: event.clientY }; };
    const onLeave = () => { pointer = null; };
    holder.addEventListener("pointermove", onMove);
    holder.addEventListener("pointerleave", onLeave);

    const stopFrame = onFrame(() => {
      tiles.forEach((tile, i) => {
        let wantX = 0;
        let wantY = 0;
        if (pointer) {
          const box = tile.getBoundingClientRect();
          const cx = box.left + box.width / 2;
          const cy = box.top + box.height / 2;
          wantY = clamp((pointer.x - cx) / (box.width || 1), -1, 1) * most;
          wantX = clamp((cy - pointer.y) / (box.height || 1), -1, 1) * most;
        }
        const at = state[i];
        at.x = lerp(at.x, wantX, ease);
        at.y = lerp(at.y, wantY, ease);
        tile.style.transform = `perspective(700px) rotateX(${at.x.toFixed(2)}deg) rotateY(${at.y.toFixed(2)}deg)`;
      });
    });

    cleanups.push(() => {
      stopFrame();
      holder.removeEventListener("pointermove", onMove);
      holder.removeEventListener("pointerleave", onLeave);
      tiles.forEach((tile) => {
        tile.style.transform = "";
        tile.classList.remove("rm-tilt-grid-tile");
      });
      holder.classList.remove("rm-tilt-grid");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A picture uncovered by a shape as you scroll.
 *
 * `clip-path` on the image itself, so the picture is never moved, scaled or
 * duplicated — what changes is how much of it you are allowed to see. The
 * shape is a circle, a wipe or a set of bars, and all three are the same one
 * property with different values.
 *
 *   <figure data-rm-mask-reveal="circle"><img></figure>
 */
export function maskReveal(target = "[data-rm-mask-reveal]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const SHAPES = {
    circle: (t) => `circle(${(t * 78).toFixed(1)}% at 50% 50%)`,
    wipe: (t) => `inset(0 ${((1 - t) * 100).toFixed(1)}% 0 0)`,
    bars: (t) => `inset(${((1 - t) * 50).toFixed(1)}% 0 ${((1 - t) * 50).toFixed(1)}% 0)`,
    corner: (t) => `polygon(0 0, ${(t * 140).toFixed(1)}% 0, 0 ${(t * 140).toFixed(1)}%)`,
  };

  const { shape = "circle" } = options;
  const cleanups = [];

  for (const holder of holders) {
    const image = holder.querySelector("img, video, picture") ?? holder.firstElementChild;
    if (!image) continue;

    const want = dataString(holder, "rmMaskReveal", shape);
    const draw = SHAPES[want] ?? SHAPES[shape];
    holder.classList.add("rm-mask-reveal");

    if (prefersReducedMotion()) {
      cleanups.push(() => holder.classList.remove("rm-mask-reveal"));
      continue;
    }

    /*
     * Never fully hidden. A start state of circle(0%) means the picture is
     * invisible until a scroll happens — and stays invisible for good if the
     * script fails after this line, or if the figure is already on screen and
     * the page never moves. The floor is the smallest amount that still reads
     * as "there is a picture here".
     */
    const FLOOR = 0.14;
    image.style.clipPath = draw(FLOOR);
    cleanups.push(whileVisible(holder, () => onFrame(() => {
      const box = holder.getBoundingClientRect();
      const through = clamp((innerHeight - box.top) / (innerHeight * 0.8 + box.height * 0.4), FLOOR, 1);
      image.style.clipPath = draw(through);
    })));

    cleanups.push(() => {
      image.style.clipPath = "";
      holder.classList.remove("rm-mask-reveal");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * A picture assembled from vertical strips.
 *
 * The image is drawn once per slat as a background at an offset, so there is
 * one download and no cropping arithmetic in the markup. The slats arrive with
 * a stagger; the picture is complete and readable the moment they land.
 *
 *   <div data-rm-slats="8" data-rm-src="/photo.jpg"></div>
 */
export function slats(target = "[data-rm-slats]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { count = 8, duration = 900, stagger = 70 } = options;
  const cleanups = [];

  for (const holder of holders) {
    const source = dataString(holder, "rmSrc", "")
      || holder.querySelector("img")?.getAttribute("src");
    if (!source) continue;

    const many = clamp(dataNumber(holder, "rmSlats", count), 2, 24);
    holder.classList.add("rm-slats");

    // The original image stays in the markup, hidden from the layout but not
    // from the document: alt text, indexing and a no-script view all survive.
    const original = holder.querySelector("img");
    if (original) original.classList.add("rm-slats-source");

    const made = [];
    for (let i = 0; i < many; i++) {
      const slat = document.createElement("span");
      slat.className = "rm-slats-slat";
      slat.setAttribute("aria-hidden", "true");
      slat.style.backgroundImage = `url("${source}")`;
      slat.style.backgroundSize = `${many * 100}% 100%`;
      slat.style.backgroundPosition = `${(i / (many - 1)) * 100}% 50%`;
      holder.appendChild(slat);
      made.push(slat);
    }

    if (!prefersReducedMotion()) {
      cleanups.push(watch(holder, () => {
        made.forEach((slat, i) => {
          slat.animate(
            [
              { transform: `translateY(${i % 2 ? 100 : -100}%)`, opacity: 0 },
              { transform: "none", opacity: 1 },
            ],
            { duration, delay: i * stagger, easing: EASE.out, fill: "backwards" },
          );
        });
      }, { threshold: 0.25, once: true }));
    }

    cleanups.push(() => {
      made.forEach((slat) => slat.remove());
      original?.classList.remove("rm-slats-source");
      holder.classList.remove("rm-slats");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * A row where whatever is centred is largest.
 *
 * Scale from the distance to the middle of the frame, read once per frame for
 * the whole row. It is native scrolling underneath, so the momentum, the
 * snapping and the scrollbar are the platform's rather than an imitation.
 *
 *   <div data-rm-zoom-strip><img>…</div>
 */
export function zoomStrip(target = "[data-rm-zoom-strip]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { grow = 0.22, reach = 1.1 } = options;
  const cleanups = [];

  for (const holder of holders) {
    const items = itemsOf(holder);
    if (items.length < 2) continue;

    holder.classList.add("rm-zoom-strip");
    items.forEach((item) => item.classList.add("rm-zoom-strip-item"));

    if (prefersReducedMotion()) {
      cleanups.push(() => {
        items.forEach((item) => item.classList.remove("rm-zoom-strip-item"));
        holder.classList.remove("rm-zoom-strip");
      });
      continue;
    }

    const most = dataNumber(holder, "rmZoomStrip", grow);
    cleanups.push(whileVisible(holder, () => onFrame(() => {
      const box = holder.getBoundingClientRect();
      const middle = box.left + box.width / 2;
      const span = (box.width / 2) * reach;
      items.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const away = Math.abs(rect.left + rect.width / 2 - middle);
        const near = clamp(1 - away / span, 0, 1);
        item.style.transform = `scale(${(1 + near * most).toFixed(3)})`;
        item.style.zIndex = String(Math.round(near * 10));
      });
    })));

    cleanups.push(() => {
      items.forEach((item) => {
        item.style.transform = "";
        item.style.zIndex = "";
        item.classList.remove("rm-zoom-strip-item");
      });
      holder.classList.remove("rm-zoom-strip");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * Items on a spiral that turns with the page.
 *
 * Each item is placed by angle and radius from its index, so the shape is
 * arithmetic rather than a hundred hand-set positions, and adding an item
 * extends the spiral for free. The whole thing rotates as you scroll past.
 *
 *   <div data-rm-spiral><img>…</div>
 */
export function spiralGallery(target = "[data-rm-spiral]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { turns = 1.6, radius = 190, spin = 90 } = options;
  const cleanups = [];

  for (const holder of holders) {
    const items = itemsOf(holder);
    if (!items.length) continue;

    holder.classList.add("rm-spiral");
    const arc = dataNumber(holder, "rmTurns", turns) * 360;
    const reach = dataNumber(holder, "rmRadius", radius);

    const places = items.map((item, i) => {
      item.classList.add("rm-spiral-item");
      const share = items.length > 1 ? i / (items.length - 1) : 0;
      const angle = (share * arc * Math.PI) / 180;
      const out = reach * (0.35 + share * 0.65);
      return { item, x: Math.cos(angle) * out, y: Math.sin(angle) * out, share };
    });
    places.forEach(({ item, x, y }) => {
      item.style.setProperty("--rm-spiral-x", `${x.toFixed(1)}px`);
      item.style.setProperty("--rm-spiral-y", `${y.toFixed(1)}px`);
    });

    if (prefersReducedMotion()) {
      cleanups.push(() => {
        items.forEach((item) => item.classList.remove("rm-spiral-item"));
        holder.classList.remove("rm-spiral");
      });
      continue;
    }

    const turn = dataNumber(holder, "rmSpin", spin);
    cleanups.push(whileVisible(holder, () => onFrame(() => {
      const box = holder.getBoundingClientRect();
      const through = clamp((innerHeight - box.top) / (innerHeight + box.height), 0, 1) - 0.5;
      holder.style.setProperty("--rm-spiral-turn", `${(through * turn).toFixed(2)}deg`);
    })));

    cleanups.push(() => {
      items.forEach((item) => {
        item.classList.remove("rm-spiral-item");
        item.style.removeProperty("--rm-spiral-x");
        item.style.removeProperty("--rm-spiral-y");
      });
      holder.classList.remove("rm-spiral");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * A wall you drag around, with weight.
 *
 * Two axes of drag on one transform, and the throw keeps its velocity and eases
 * out rather than stopping dead under your finger. The arrow keys move it too,
 * because a wall that can only be dragged is a wall a keyboard cannot see.
 *
 *   <div data-rm-image-wall><img>…</div>
 */
export function imageWall(target = "[data-rm-image-wall]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { friction = 0.92, step = 90, label = "Image wall" } = options;
  const cleanups = [];

  for (const holder of holders) {
    const inner = holder.firstElementChild;
    if (!inner) continue;

    holder.classList.add("rm-image-wall");
    holder.tabIndex = 0;
    holder.setAttribute("role", "group");
    holder.setAttribute("aria-label", dataString(holder, "rmLabel", label));
    holder.setAttribute("aria-keyshortcuts", "ArrowUp ArrowDown ArrowLeft ArrowRight");
    inner.classList.add("rm-image-wall-inner");

    const at = { x: 0, y: 0 };
    const speed = { x: 0, y: 0 };
    let holding = false;
    let last = { x: 0, y: 0 };
    const soft = prefersReducedMotion();

    const onDown = (event) => {
      if (event.button > 0) return;
      holding = true;
      last = { x: event.clientX, y: event.clientY };
      speed.x = 0;
      speed.y = 0;
      holder.classList.add("is-dragging");
      holder.setPointerCapture?.(event.pointerId);
    };
    const onMove = (event) => {
      if (!holding) return;
      speed.x = event.clientX - last.x;
      speed.y = event.clientY - last.y;
      at.x += speed.x;
      at.y += speed.y;
      last = { x: event.clientX, y: event.clientY };
    };
    const onUp = (event) => {
      if (!holding) return;
      holding = false;
      holder.classList.remove("is-dragging");
      holder.releasePointerCapture?.(event.pointerId);
    };
    const onKey = (event) => {
      const moves = {
        ArrowLeft: [step, 0], ArrowRight: [-step, 0],
        ArrowUp: [0, step], ArrowDown: [0, -step],
      };
      const move = moves[event.key];
      if (!move) return;
      event.preventDefault();
      at.x += move[0];
      at.y += move[1];
    };

    holder.addEventListener("pointerdown", onDown);
    holder.addEventListener("pointermove", onMove);
    holder.addEventListener("pointerup", onUp);
    holder.addEventListener("pointercancel", onUp);
    holder.addEventListener("keydown", onKey);

    const stopFrame = onFrame(() => {
      if (!holding && !soft) {
        // The throw keeps going and eases out, rather than stopping dead.
        at.x += speed.x;
        at.y += speed.y;
        speed.x *= friction;
        speed.y *= friction;
        if (Math.abs(speed.x) < 0.02) speed.x = 0;
        if (Math.abs(speed.y) < 0.02) speed.y = 0;
      }
      inner.style.transform = `translate3d(${at.x.toFixed(1)}px, ${at.y.toFixed(1)}px, 0)`;
    });

    cleanups.push(() => {
      stopFrame();
      holder.removeEventListener("pointerdown", onDown);
      holder.removeEventListener("pointermove", onMove);
      holder.removeEventListener("pointerup", onUp);
      holder.removeEventListener("pointercancel", onUp);
      holder.removeEventListener("keydown", onKey);
      inner.style.transform = "";
      inner.classList.remove("rm-image-wall-inner");
      holder.classList.remove("rm-image-wall", "is-dragging");
      holder.removeAttribute("role");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Cards turning over in sequence as they arrive.
 *
 * Both faces are in the markup and both are real content, so the back of a
 * card is text a search engine and a screen reader can both read. The turn is
 * `rotateY` on a preserved-3d parent, which is one transform rather than a
 * cross-fade between two absolutely positioned copies.
 *
 *   <div data-rm-flip-grid><article><div>…</div><div>…</div></article></div>
 */
export function flipGrid(target = "[data-rm-flip-grid]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { duration = 700, stagger = 110 } = options;
  const cleanups = [];

  for (const holder of holders) {
    const cards = itemsOf(holder);
    if (!cards.length) continue;

    holder.classList.add("rm-flip-grid");
    const built = [];
    for (const card of cards) {
      const faces = [...card.children];
      if (faces.length < 2) continue;
      card.classList.add("rm-flip-grid-card");
      faces[0].classList.add("rm-flip-grid-front");
      faces[1].classList.add("rm-flip-grid-back");
      built.push(card);
    }
    if (!built.length) continue;

    if (!prefersReducedMotion()) {
      cleanups.push(watch(holder, () => {
        built.forEach((card, i) => {
          card.animate(
            [{ transform: "rotateY(180deg)" }, { transform: "rotateY(0deg)" }],
            { duration, delay: i * stagger, easing: EASE.out, fill: "backwards" },
          );
        });
      }, { threshold: 0.2, once: true }));
    }

    cleanups.push(() => {
      built.forEach((card) => {
        card.classList.remove("rm-flip-grid-card");
        [...card.children].forEach((face) =>
          face.classList.remove("rm-flip-grid-front", "rm-flip-grid-back"));
      });
      holder.classList.remove("rm-flip-grid");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * A pile you peel through, one print at a time.
 *
 * The top print lifts and slides away to the back, so the pile never empties
 * and the order is preserved. A button does the same thing, and the pile
 * announces which print is showing — the gesture is the flourish, not the
 * only way in.
 *
 *   <div data-rm-peel><figure>…</figure></div>
 */
export function peelStack(target = "[data-rm-peel]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { duration = 520, offset = 9, label = "Next print" } = options;
  const cleanups = [];

  for (const holder of holders) {
    const prints = itemsOf(holder);
    if (prints.length < 2) continue;

    holder.classList.add("rm-peel");
    let order = prints.map((_, i) => i);

    const next = document.createElement("button");
    next.type = "button";
    next.className = "rm-peel-next";
    next.textContent = dataString(holder, "rmLabel", label);
    holder.appendChild(next);

    const said = document.createElement("p");
    said.className = "rm-peel-live";
    said.setAttribute("aria-live", "polite");
    holder.appendChild(said);

    const place = () => {
      order.forEach((print, position) => {
        const el = prints[print];
        el.classList.add("rm-peel-print");
        el.style.transform = `translate(${position * offset}px, ${position * offset}px) rotate(${position * 1.4}deg)`;
        el.style.zIndex = String(prints.length - position);
        el.inert = position !== 0;
      });
      said.textContent = `Print ${order[0] + 1} of ${prints.length}`;
    };
    place();

    const peel = () => {
      const top = prints[order[0]];
      const away = () => { order = [...order.slice(1), order[0]]; place(); };
      if (prefersReducedMotion()) { away(); return; }
      top.animate(
        [
          { transform: top.style.transform },
          { transform: "translate(-46%, -12%) rotate(-13deg)", offset: 0.55 },
          { transform: `translate(${(prints.length - 1) * offset}px, ${(prints.length - 1) * offset}px) rotate(${(prints.length - 1) * 1.4}deg)` },
        ],
        { duration, easing: EASE.inOut },
      );
      setTimeout(away, duration * 0.55);
    };

    next.addEventListener("click", peel);

    cleanups.push(() => {
      next.removeEventListener("click", peel);
      next.remove();
      said.remove();
      prints.forEach((print) => {
        print.classList.remove("rm-peel-print");
        print.style.cssText = "";
        print.inert = false;
      });
      holder.classList.remove("rm-peel");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Reach for one tile and the rest stand back.
 *
 * The others dim and shrink slightly rather than the reached one growing, so
 * the grid never changes size and nothing reflows — the emphasis comes from
 * everything else giving way, which is both cheaper and calmer.
 *
 * Focus does it too, so tabbing through the grid reads the same as pointing.
 *
 *   <div data-rm-focus-grid><figure>…</figure></div>
 */
export function focusGrid(target = "[data-rm-focus-grid]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { dim = 0.42, shrink = 0.04 } = options;
  const cleanups = [];

  for (const holder of holders) {
    const tiles = itemsOf(holder);
    if (tiles.length < 2) continue;

    holder.classList.add("rm-focus-grid");
    holder.style.setProperty("--rm-focus-grid-dim", String(dataNumber(holder, "rmDim", dim)));
    holder.style.setProperty("--rm-focus-grid-shrink", String(1 - shrink));
    tiles.forEach((tile) => {
      tile.classList.add("rm-focus-grid-tile");
      if (!tile.hasAttribute("tabindex") && !tile.querySelector("a, button")) tile.tabIndex = 0;
    });

    const mark = (which) => {
      holder.classList.toggle("has-focus", Boolean(which));
      tiles.forEach((tile) => tile.classList.toggle("is-reached", tile === which));
    };

    const onOver = (event) => {
      const tile = event.target.closest(".rm-focus-grid-tile");
      mark(tile && holder.contains(tile) ? tile : null);
    };
    const onOut = () => mark(null);

    holder.addEventListener("pointerover", onOver);
    holder.addEventListener("pointerleave", onOut);
    holder.addEventListener("focusin", onOver);
    holder.addEventListener("focusout", onOut);

    cleanups.push(() => {
      holder.removeEventListener("pointerover", onOver);
      holder.removeEventListener("pointerleave", onOut);
      holder.removeEventListener("focusin", onOver);
      holder.removeEventListener("focusout", onOut);
      tiles.forEach((tile) => tile.classList.remove("rm-focus-grid-tile", "is-reached"));
      holder.classList.remove("rm-focus-grid", "has-focus");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Pictures along a curve, moving with the scroll.
 *
 * `offset-path` puts each item on a real path and `offset-distance` moves it
 * along — so the curve is one declaration and the items follow it exactly,
 * corners included. The version with hand-computed positions has to be redone
 * every time the shape changes.
 *
 *   <div data-rm-ribbon><img>…</div>
 */
export function ribbon(target = "[data-rm-ribbon]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { travel = 55, spread = 70 } = options;
  const cleanups = [];

  for (const holder of holders) {
    const items = itemsOf(holder);
    if (!items.length) continue;

    holder.classList.add("rm-ribbon");
    items.forEach((item, i) => {
      item.classList.add("rm-ribbon-item");
      // Spread along the path, then the scroll slides the whole set together.
      item.style.setProperty("--rm-ribbon-at", `${((i / items.length) * spread).toFixed(2)}%`);
    });

    if (prefersReducedMotion()) {
      cleanups.push(() => {
        items.forEach((item) => item.classList.remove("rm-ribbon-item"));
        holder.classList.remove("rm-ribbon");
      });
      continue;
    }

    const far = dataNumber(holder, "rmTravel", travel);
    cleanups.push(whileVisible(holder, () => onFrame(() => {
      const box = holder.getBoundingClientRect();
      const through = clamp((innerHeight - box.top) / (innerHeight + box.height), 0, 1);
      holder.style.setProperty("--rm-ribbon-slide", `${(through * far).toFixed(2)}%`);
    })));

    cleanups.push(() => {
      items.forEach((item) => {
        item.classList.remove("rm-ribbon-item");
        item.style.removeProperty("--rm-ribbon-at");
      });
      holder.classList.remove("rm-ribbon");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * A sheet of frames, one of which opens.
 *
 * The contact sheet stays exactly where it is and the chosen frame is drawn
 * over it from its own position — a FLIP again, so the sheet never reflows and
 * the frame appears to grow out of where it was rather than fading in on top.
 *
 * It is a dialog while it is open: focus goes in, the rest is inert, Escape
 * closes it and focus comes back to the frame you opened.
 *
 *   <div data-rm-contact-sheet><button><img></button></div>
 */
export function contactSheet(target = "[data-rm-contact-sheet]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { duration = 460 } = options;
  const cleanups = [];

  for (const holder of holders) {
    const frames = itemsOf(holder);
    if (!frames.length) continue;

    holder.classList.add("rm-contact-sheet");
    frames.forEach((frame) => frame.classList.add("rm-contact-sheet-frame"));

    const stage = document.createElement("div");
    stage.className = "rm-contact-sheet-stage";
    stage.setAttribute("role", "dialog");
    stage.setAttribute("aria-modal", "true");
    stage.hidden = true;
    holder.appendChild(stage);

    let opener = null;
    let sealed = [];

    const close = () => {
      if (stage.hidden) return;
      stage.hidden = true;
      stage.replaceChildren();
      holder.classList.remove("has-open");
      sealed.forEach((node) => { node.inert = false; });
      sealed = [];
      opener?.focus();
      opener = null;
    };

    const open = (frame) => {
      const image = frame.querySelector("img");
      if (!image) return;
      opener = frame;

      const shown = image.cloneNode(true);
      shown.className = "rm-contact-sheet-shown";
      const shut = document.createElement("button");
      shut.type = "button";
      shut.className = "rm-contact-sheet-close";
      shut.setAttribute("aria-label", "Close");
      shut.textContent = "×";
      stage.replaceChildren(shown, shut);
      stage.hidden = false;
      holder.classList.add("has-open");

      // FLIP from the thumbnail's own box: it grows out of where it was.
      if (!prefersReducedMotion()) {
        const was = image.getBoundingClientRect();
        const now = shown.getBoundingClientRect();
        shown.animate(
          [
            {
              transform:
                `translate(${was.left - now.left}px, ${was.top - now.top}px) ` +
                `scale(${was.width / (now.width || 1)}, ${was.height / (now.height || 1)})`,
            },
            { transform: "none" },
          ],
          { duration, easing: EASE.out },
        );
      }

      sealed = [...holder.children].filter((node) => node !== stage);
      sealed.forEach((node) => { node.inert = true; });
      shut.focus();
      shut.addEventListener("click", close);
    };

    const onClick = (event) => {
      const frame = event.target.closest(".rm-contact-sheet-frame");
      if (frame && holder.contains(frame)) open(frame);
    };
    const onKey = (event) => { if (event.key === "Escape") { event.preventDefault(); close(); } };

    holder.addEventListener("click", onClick);
    holder.addEventListener("keydown", onKey);

    cleanups.push(() => {
      holder.removeEventListener("click", onClick);
      holder.removeEventListener("keydown", onKey);
      sealed.forEach((node) => { node.inert = false; });
      stage.remove();
      frames.forEach((frame) => frame.classList.remove("rm-contact-sheet-frame"));
      holder.classList.remove("rm-contact-sheet", "has-open");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}
