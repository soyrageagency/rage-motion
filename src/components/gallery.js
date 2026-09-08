/**
 * Carousels and galleries that are worth dragging.
 *
 *   • carousel()  — drag with momentum and snap, keyboard included.
 *   • ring()      — a cylinder of images you spin.
 *   • deck()      — a stack of cards; the front one flies to the back.
 *   • imageTrail() — images left behind the pointer.
 *   • scratch()   — scratch a panel away to reveal what is under it.
 *   • dock()      — items that magnify as the pointer passes.
 *
 * The carousel is the component most likely to be bad on any given site, and
 * it is bad in the same ways every time: it cannot be dragged, it cannot be
 * reached with a keyboard, it hijacks the wheel, and it announces nothing. All
 * six of these are built from real pointer events with real momentum, and the
 * two that carry content — carousel and ring — are operable without a pointer
 * at all.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import {
  dataNumber, dataString, EASE, lerp, onFrame,
  prefersReducedMotion, resolveElements, whileVisible,
} from "../core/motion.js";

/**
 * A carousel you drag, with momentum and a snap at the end of the throw.
 *
 * Built on the browser's own scrolling — `overflow-x` with scroll snap — and
 * the drag only adds pointer support on top. That is the whole trick: the
 * wheel, the trackpad, the scrollbar, the keyboard, find-in-page and every
 * assistive technology keep working, because none of them were replaced. The
 * usual transform-based carousel throws all of that away to gain nothing.
 *
 *   <div data-rm-carousel>
 *     <article>…</article><article>…</article>
 *   </div>
 */
export function carousel(target = "[data-rm-carousel]", options = {}) {
  const containers = resolveElements(target);
  if (!containers.length) return () => {};

  const { selector = ":scope > *", friction = 0.94, label = "Carousel" } = options;
  const cleanups = [];

  for (const container of containers) {
    const items = [...container.querySelectorAll(selector)];
    if (items.length < 2) continue;

    container.classList.add("rm-carousel");
    container.setAttribute("role", "region");
    container.setAttribute("aria-roledescription", "carousel");
    container.setAttribute("aria-label", dataString(container, "rmLabel", label));
    // Focusable, so the arrow keys reach it without a mouse.
    if (!container.hasAttribute("tabindex")) container.tabIndex = 0;
    items.forEach((item) => item.classList.add("rm-carousel-item"));

    let dragging = false;
    let startX = 0;
    let startScroll = 0;
    let velocity = 0;
    let lastX = 0;
    let glide = null;

    const stopGlide = () => { glide?.(); glide = null; };

    const onDown = (event) => {
      if (event.pointerType === "touch") return; // native touch scrolling is better
      stopGlide();
      dragging = true;
      startX = event.clientX;
      lastX = event.clientX;
      startScroll = container.scrollLeft;
      velocity = 0;
      container.classList.add("is-dragging");
      container.setPointerCapture?.(event.pointerId);
    };

    const onMove = (event) => {
      if (!dragging) return;
      event.preventDefault();
      const delta = event.clientX - startX;
      container.scrollLeft = startScroll - delta;
      velocity = event.clientX - lastX;
      lastX = event.clientX;
    };

    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      container.classList.remove("is-dragging");
      if (prefersReducedMotion() || Math.abs(velocity) < 2) return;

      // Carry the throw, then let scroll snap take the last few pixels.
      let speed = velocity;
      glide = onFrame(() => {
        speed *= friction;
        container.scrollLeft -= speed;
        if (Math.abs(speed) < 0.4) stopGlide();
      });
    };

    const onKey = (event) => {
      const step = container.clientWidth * 0.8;
      if (event.key === "ArrowRight") container.scrollBy({ left: step, behavior: "smooth" });
      else if (event.key === "ArrowLeft") container.scrollBy({ left: -step, behavior: "smooth" });
      else return;
      event.preventDefault();
    };

    container.addEventListener("pointerdown", onDown);
    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerup", onUp);
    container.addEventListener("pointercancel", onUp);
    container.addEventListener("keydown", onKey);

    cleanups.push(() => {
      stopGlide();
      container.removeEventListener("pointerdown", onDown);
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerup", onUp);
      container.removeEventListener("pointercancel", onUp);
      container.removeEventListener("keydown", onKey);
      container.classList.remove("rm-carousel", "is-dragging");
      items.forEach((item) => item.classList.remove("rm-carousel-item"));
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A cylinder of images you spin.
 *
 * Items sit around a circle in 3D and the ring turns; the ones at the back are
 * dimmed and stay behind. Drag has momentum and the arrow keys step one item,
 * so it is not a mouse-only toy.
 *
 *   <div data-rm-ring data-rm-radius="380">
 *     <img src="…" alt="…"><img src="…" alt="…">
 *   </div>
 */
export function ring(target = "[data-rm-ring]", options = {}) {
  const containers = resolveElements(target);
  if (!containers.length) return () => {};

  const { radius = 340, friction = 0.94, sensitivity = 0.35, label = "Gallery" } = options;
  const cleanups = [];

  for (const container of containers) {
    const items = [...container.children];
    if (items.length < 3) continue;

    const r = dataNumber(container, "rmRadius", radius);
    const stepAngle = 360 / items.length;

    container.classList.add("rm-ring");
    container.setAttribute("role", "region");
    container.setAttribute("aria-label", dataString(container, "rmLabel", label));
    if (!container.hasAttribute("tabindex")) container.tabIndex = 0;
    container.style.setProperty("--rm-ring-radius", `${r}px`);

    const stage = document.createElement("div");
    stage.className = "rm-ring-stage";
    items.forEach((item, index) => {
      item.classList.add("rm-ring-item");
      item.style.setProperty("--rm-ring-angle", `${index * stepAngle}deg`);
      stage.appendChild(item);
    });
    container.appendChild(stage);

    let angle = 0;
    let goal = 0;
    let dragging = false;
    let lastX = 0;
    let velocity = 0;

    const render = () => {
      stage.style.transform = `translateZ(${-r}px) rotateY(${angle.toFixed(2)}deg)`;
      for (const [index, item] of items.entries()) {
        // How close this item is to facing the viewer, 0 to 1.
        const facing = Math.cos(((index * stepAngle + angle) * Math.PI) / 180);
        item.style.opacity = String(0.28 + Math.max(0, facing) * 0.72);
        item.classList.toggle("is-front", facing > 0.85);
      }
    };
    render();

    const onDown = (event) => {
      dragging = true;
      lastX = event.clientX;
      velocity = 0;
      container.classList.add("is-dragging");
      container.setPointerCapture?.(event.pointerId);
    };
    const onMove = (event) => {
      if (!dragging) return;
      velocity = (event.clientX - lastX) * sensitivity;
      lastX = event.clientX;
      angle += velocity;
      goal = angle;
      render();
    };
    const onUp = () => { dragging = false; container.classList.remove("is-dragging"); };

    const onKey = (event) => {
      if (event.key === "ArrowRight") goal -= stepAngle;
      else if (event.key === "ArrowLeft") goal += stepAngle;
      else return;
      event.preventDefault();
    };

    container.addEventListener("pointerdown", onDown);
    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerup", onUp);
    container.addEventListener("pointercancel", onUp);
    container.addEventListener("keydown", onKey);

    const stopFrame = onFrame(() => {
      if (dragging) return;
      if (Math.abs(velocity) > 0.05) {
        velocity *= friction;
        angle += velocity;
        goal = angle;
        render();
        return;
      }
      if (Math.abs(goal - angle) > 0.05) {
        angle = lerp(angle, goal, prefersReducedMotion() ? 1 : 0.12);
        render();
      }
    });

    cleanups.push(() => {
      stopFrame();
      container.removeEventListener("pointerdown", onDown);
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerup", onUp);
      container.removeEventListener("pointercancel", onUp);
      container.removeEventListener("keydown", onKey);
      items.forEach((item) => {
        item.classList.remove("rm-ring-item", "is-front");
        item.style.opacity = "";
        container.appendChild(item);
      });
      stage.remove();
      container.classList.remove("rm-ring", "is-dragging");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A stack of cards where the front one flies out and lands at the back.
 *
 * The order is a CSS custom property per card rather than a re-sorted DOM, so
 * the cards keep their identity: focus stays where it was, a video inside one
 * keeps playing, and nothing reloads because it was reinserted.
 */
export function deck(target = "[data-rm-deck]", options = {}) {
  const containers = resolveElements(target);
  if (!containers.length) return () => {};

  const { interval = 3800, offset = 16, scale = 0.05, duration = 700 } = options;
  const cleanups = [];

  for (const container of containers) {
    const cards = [...container.children];
    if (cards.length < 2) continue;

    container.classList.add("rm-deck");
    container.style.setProperty("--rm-deck-offset", `${offset}px`);
    container.style.setProperty("--rm-deck-scale", String(scale));
    cards.forEach((card) => card.classList.add("rm-deck-card"));

    let order = cards.map((_, index) => index);
    const place = () => {
      order.forEach((cardIndex, position) => {
        cards[cardIndex].style.setProperty("--rm-deck-index", String(position));
        cards[cardIndex].style.zIndex = String(cards.length - position);
      });
    };
    place();

    if (prefersReducedMotion()) {
      // A deck that shuffles itself is decoration; the cards are the content.
      cleanups.push(() => {
        container.classList.remove("rm-deck");
        cards.forEach((card) => card.classList.remove("rm-deck-card"));
      });
      continue;
    }

    const advance = () => {
      const front = cards[order[0]];
      front.animate(
        [
          { transform: "translateX(0) rotate(0deg)", opacity: 1 },
          { transform: "translateX(-58%) rotate(-7deg)", opacity: 0, offset: 0.55 },
          { transform: "translateX(0) rotate(0deg)", opacity: 1 },
        ],
        { duration, easing: EASE.inOut },
      );
      // Swap halfway, while the card is out of sight.
      setTimeout(() => {
        order = [...order.slice(1), order[0]];
        place();
      }, duration * 0.55);
    };

    /*
     * While it is on screen, not from the moment the script ran. A deck that
     * has been shuffling itself in a section nobody has scrolled to is both a
     * wasted frame budget and an arbitrary starting position.
     *
     * It no longer stops on hover either. Pausing under the pointer is right
     * for a marquee of text somebody is trying to read; on a deck of cards it
     * simply means the effect freezes the moment anyone leans in to look at
     * it, which reads as broken. Keyboard focus still holds it, because that
     * is somebody working through the cards rather than watching them.
     */
    let timer = 0;
    const start = () => { if (!timer) timer = setInterval(advance, interval); };
    const stop = () => { clearInterval(timer); timer = 0; };
    const watching = whileVisible(container, () => { start(); return stop; });
    container.addEventListener("focusin", stop);
    container.addEventListener("focusout", start);

    cleanups.push(() => {
      stop();
      watching();
      container.removeEventListener("focusin", stop);
      container.removeEventListener("focusout", start);
      container.classList.remove("rm-deck");
      cards.forEach((card) => {
        card.classList.remove("rm-deck-card");
        card.style.zIndex = "";
      });
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Images left behind the pointer.
 *
 * New images appear only after the pointer has travelled a set distance, not
 * on every move event — which is what stops a fast sweep from spawning two
 * hundred nodes in a second. The pool is fixed and reused in rotation, so the
 * DOM never grows however long anyone plays with it.
 *
 *   <section data-rm-image-trail data-rm-images="/a.jpg,/b.jpg,/c.jpg">
 */
export function imageTrail(target = "[data-rm-image-trail]", options = {}) {
  const containers = resolveElements(target);
  if (!containers.length) return () => {};
  if (typeof matchMedia === "function" && !matchMedia("(pointer: fine)").matches) return () => {};
  if (prefersReducedMotion()) return () => {};

  const { images = [], distance = 110, life = 900, width = 190 } = options;
  const cleanups = [];

  for (const container of containers) {
    const sources = (dataString(container, "rmImages", "") || "")
      .split(",").map((source) => source.trim()).filter(Boolean);
    const all = sources.length ? sources : images;
    if (!all.length) continue;

    container.classList.add("rm-image-trail");

    // One node per source, reused. The trail is a rotation through the pool.
    const pool = all.map((source) => {
      const image = document.createElement("img");
      image.className = "rm-image-trail-item";
      image.src = source;
      image.alt = "";
      image.loading = "lazy";
      image.setAttribute("aria-hidden", "true");
      image.style.width = `${dataNumber(container, "rmWidth", width)}px`;
      container.appendChild(image);
      return image;
    });

    let index = 0;
    let last = null;

    const onMove = (event) => {
      const box = container.getBoundingClientRect();
      const x = event.clientX - box.left;
      const y = event.clientY - box.top;
      if (last && Math.hypot(x - last.x, y - last.y) < distance) return;
      last = { x, y };

      const image = pool[index % pool.length];
      index++;
      image.style.left = `${x}px`;
      image.style.top = `${y}px`;
      image.animate(
        [
          { opacity: 0, transform: "translate(-50%, -50%) scale(0.75)" },
          { opacity: 1, transform: "translate(-50%, -50%) scale(1)", offset: 0.18 },
          { opacity: 0, transform: "translate(-50%, -50%) scale(0.94) translateY(24px)" },
        ],
        { duration: life, easing: EASE.out },
      );
    };

    container.addEventListener("pointermove", onMove, { passive: true });
    cleanups.push(() => {
      container.removeEventListener("pointermove", onMove);
      pool.forEach((image) => image.remove());
      container.classList.remove("rm-image-trail");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Scratch a panel away to reveal what is under it.
 *
 * A canvas erased with `destination-out`, which is the only way to get a real
 * brush edge; the erased area is sampled every so often, and once enough is
 * gone the rest fades so nobody has to scrub the corners.
 *
 * There is a button underneath for anyone who cannot drag — a reveal that can
 * only be reached by scrubbing is a reveal some people never see.
 */
export function scratch(target = "[data-rm-scratch]", options = {}) {
  const containers = resolveElements(target);
  if (!containers.length) return () => {};

  const { brush = 34, threshold = 0.5, cover = "#0e0e0e", hint = "Scratch to reveal" } = options;
  const cleanups = [];

  for (const container of containers) {
    container.classList.add("rm-scratch");

    const canvas = document.createElement("canvas");
    canvas.className = "rm-scratch-layer";
    canvas.setAttribute("aria-hidden", "true");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    const reveal = document.createElement("button");
    reveal.type = "button";
    reveal.className = "rm-scratch-reveal";
    reveal.textContent = dataString(container, "rmHint", hint);

    const paint = () => {
      const box = container.getBoundingClientRect();
      canvas.width = Math.max(1, box.width);
      canvas.height = Math.max(1, box.height);
      ctx.fillStyle = dataString(container, "rmColor", cover);
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    container.append(canvas, reveal);
    paint();

    const done = () => {
      container.classList.add("is-revealed");
      canvas.style.opacity = "0";
      reveal.remove();
    };
    reveal.addEventListener("click", done);

    if (prefersReducedMotion()) {
      // Scrubbing is the flourish; what is underneath is the point.
      done();
      cleanups.push(() => { canvas.remove(); container.classList.remove("rm-scratch", "is-revealed"); });
      continue;
    }

    let scrubbing = false;
    let checked = 0;

    const erase = (event) => {
      if (!scrubbing) return;
      const box = canvas.getBoundingClientRect();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(event.clientX - box.left, event.clientY - box.top, brush, 0, Math.PI * 2);
      ctx.fill();

      // Sampling every pixel every move is pointless work; every third of a
      // second is more than enough to notice the panel is mostly gone.
      const now = performance.now();
      if (now - checked < 300) return;
      checked = now;
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let clear = 0;
      for (let i = 3; i < pixels.length; i += 64) if (pixels[i] < 40) clear++;
      if (clear / (pixels.length / 64) > threshold) done();
    };

    const start = (event) => { scrubbing = true; canvas.setPointerCapture?.(event.pointerId); erase(event); };
    const stop = () => { scrubbing = false; };

    canvas.addEventListener("pointerdown", start);
    canvas.addEventListener("pointermove", erase);
    canvas.addEventListener("pointerup", stop);
    canvas.addEventListener("pointercancel", stop);
    addEventListener("resize", paint);

    cleanups.push(() => {
      canvas.removeEventListener("pointerdown", start);
      canvas.removeEventListener("pointermove", erase);
      canvas.removeEventListener("pointerup", stop);
      canvas.removeEventListener("pointercancel", stop);
      removeEventListener("resize", paint);
      canvas.remove();
      reveal.remove();
      container.classList.remove("rm-scratch", "is-revealed");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A row of items that magnify as the pointer passes.
 *
 * The magnification falls off over a distance rather than switching on per
 * item, which is the difference between the dock feeling elastic and feeling
 * like a row of buttons with a hover state. Scale only — the row's layout
 * never changes, so nothing beside it shifts.
 */
export function dock(target = "[data-rm-dock]", options = {}) {
  const containers = resolveElements(target);
  if (!containers.length) return () => {};

  const { selector = ":scope > *", magnify = 1.75, reach = 130, ease = 0.18 } = options;
  const cleanups = [];

  for (const container of containers) {
    const items = [...container.querySelectorAll(selector)];
    if (!items.length) continue;

    container.classList.add("rm-dock");
    items.forEach((item) => item.classList.add("rm-dock-item"));

    if (prefersReducedMotion()) {
      cleanups.push(() => {
        container.classList.remove("rm-dock");
        items.forEach((item) => item.classList.remove("rm-dock-item"));
      });
      continue;
    }

    const centres = items.map(() => 0);
    const current = items.map(() => 1);

    const measure = () => {
      const box = container.getBoundingClientRect();
      items.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        centres[index] = rect.left - box.left + rect.width / 2;
      });
    };
    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(container);

    let pointerX = -9999;
    let inside = false;
    const onMove = (event) => {
      pointerX = event.clientX - container.getBoundingClientRect().left;
      inside = true;
    };
    const onLeave = () => { inside = false; };
    container.addEventListener("pointermove", onMove, { passive: true });
    container.addEventListener("pointerleave", onLeave);

    const stopFrame = onFrame(() => {
      items.forEach((item, index) => {
        const distance = inside ? Math.abs(centres[index] - pointerX) : Infinity;
        const force = distance > reach ? 0 : (Math.cos((distance / reach) * Math.PI) + 1) / 2;
        const goal = 1 + force * (magnify - 1);
        current[index] = lerp(current[index], goal, ease);
        item.style.transform =
          current[index] < 1.002 ? "" : `scale(${current[index].toFixed(3)}) translateY(${(-(current[index] - 1) * 14).toFixed(1)}px)`;
      });
    });

    cleanups.push(() => {
      stopFrame();
      resizeObserver.disconnect();
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerleave", onLeave);
      container.classList.remove("rm-dock");
      items.forEach((item) => {
        item.classList.remove("rm-dock-item");
        item.style.transform = "";
      });
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

