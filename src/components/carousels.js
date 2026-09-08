/**
 * Seven more carousels.
 *
 *   • coverflow()  — a deck seen at an angle, the front one square on.
 *   • thumbs()     — a main frame and a strip, each driving the other.
 *   • autoplay()   — it advances itself, and stops the moment you touch it.
 *   • wheel()      — items around a wheel that turns under the pointer.
 *   • peek()       — the next slide showing at the edge, so you know it is there.
 *   • ticker()     — rows travelling in opposite directions.
 *   • slideshow()  — one frame at a time, cross-faded, with real controls.
 *
 * `gallery.js` has the drag-and-momentum carousel; these are the shapes it
 * cannot be. What they share is where the state lives: every one of them is
 * driven by the browser's own scrolling or by an index that is also written
 * into the DOM, so none of them can end up showing one slide while believing
 * it is on another — the failure that makes a carousel feel broken even when
 * every frame is correct.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import {
  clamp, dataNumber, dataString, lerp, onFrame,
  prefersReducedMotion, resolveElements, keepInView,
} from "../core/motion.js";

/**
 * A deck seen at an angle, the front one square on.
 *
 * Built on a real scroller, so the wheel, the trackpad and the scrollbar all
 * work; the 3D is computed from each slide's distance to the centre of the
 * viewport rather than from an index, which is why it stays smooth mid-flick
 * instead of snapping between whole slides.
 *
 *   <div data-rm-coverflow><figure>…</figure><figure>…</figure></div>
 */
export function coverflow(target = "[data-rm-coverflow]", options = {}) {
  const rails = resolveElements(target);
  if (!rails.length) return () => {};

  const { selector = ":scope > *", angle = 42, depth = 160, fade = 0.45, label = "Gallery" } = options;
  const groups = [];

  for (const rail of rails) {
    const slides = [...rail.querySelectorAll(selector)];
    if (slides.length < 2) continue;

    rail.classList.add("rm-coverflow");
    rail.setAttribute("role", "region");
    rail.setAttribute("aria-roledescription", "carousel");
    rail.setAttribute("aria-label", dataString(rail, "rmLabel", label));
    if (!rail.hasAttribute("tabindex")) rail.tabIndex = 0;
    slides.forEach((slide) => slide.classList.add("rm-coverflow-slide"));

    const onKey = (event) => {
      const step = rail.clientWidth * 0.5;
      if (event.key === "ArrowRight") rail.scrollBy({ left: step, behavior: "smooth" });
      else if (event.key === "ArrowLeft") rail.scrollBy({ left: -step, behavior: "smooth" });
      else return;
      event.preventDefault();
    };
    rail.addEventListener("keydown", onKey);

    groups.push({ rail, slides, onKey });
  }
  if (!groups.length) return () => {};

  const still = prefersReducedMotion();
  const stopFrame = still ? () => {} : onFrame(() => {
    for (const { rail, slides } of groups) {
      const box = rail.getBoundingClientRect();
      if (box.bottom < 0 || box.top > innerHeight) continue;
      const middle = box.left + box.width / 2;

      for (const slide of slides) {
        const rect = slide.getBoundingClientRect();
        // -1 at the left edge, 0 dead centre, 1 at the right edge.
        const offset = clamp((rect.left + rect.width / 2 - middle) / (box.width / 2), -1, 1);
        const away = Math.abs(offset);
        slide.style.transform =
          `perspective(1200px) rotateY(${(-offset * angle).toFixed(2)}deg) ` +
          `translateZ(${(-away * depth).toFixed(1)}px) scale(${(1 - away * 0.12).toFixed(3)})`;
        slide.style.opacity = (1 - away * fade).toFixed(3);
        slide.style.zIndex = String(100 - Math.round(away * 100));
        slide.classList.toggle("is-front", away < 0.18);
      }
    }
  });

  return () => {
    stopFrame();
    groups.forEach(({ rail, slides, onKey }) => {
      rail.removeEventListener("keydown", onKey);
      rail.classList.remove("rm-coverflow");
      slides.forEach((slide) => {
        slide.classList.remove("rm-coverflow-slide", "is-front");
        slide.style.transform = "";
        slide.style.opacity = "";
        slide.style.zIndex = "";
      });
    });
  };
}

/**
 * A main frame and a strip of thumbnails, each driving the other.
 *
 * Both directions, which is the part usually missing: picking a thumbnail
 * moves the main frame, and scrolling the main frame moves the highlight in
 * the strip and scrolls it into view. The thumbnails are real buttons with
 * `aria-current`, so the strip is navigation rather than decoration.
 */
export function thumbs(target = "[data-rm-thumbs]", options = {}) {
  const groups = resolveElements(target);
  if (!groups.length) return () => {};

  const {
    main = "[data-rm-thumbs-main]",
    strip = "[data-rm-thumbs-strip]",
    slide = ":scope > *",
    thumb = "button, a",
  } = options;
  const cleanups = [];

  for (const group of groups) {
    const frame = group.querySelector(main);
    const bar = group.querySelector(strip);
    if (!frame || !bar) continue;

    const slides = [...frame.querySelectorAll(slide)];
    const picks = [...bar.querySelectorAll(thumb)];
    if (slides.length < 2 || slides.length !== picks.length) continue;

    group.classList.add("rm-thumbs");
    frame.classList.add("rm-thumbs-main");
    bar.classList.add("rm-thumbs-strip");
    picks.forEach((pick, index) => {
      pick.setAttribute("aria-label", pick.getAttribute("aria-label") ?? `Show item ${index + 1}`);
    });

    let at = -1;
    const mark = (index) => {
      if (index === at) return;
      at = index;
      picks.forEach((pick, i) => {
        pick.classList.toggle("is-current", i === at);
        if (i === at) pick.setAttribute("aria-current", "true");
        else pick.removeAttribute("aria-current");
      });
      // Only the strip moves. scrollIntoView would take the page with it.
      keepInView(bar, picks[at]);
    };

    const handlers = picks.map((pick, index) => {
      const click = (event) => {
        event.preventDefault();
        keepInView(frame, slides[index], prefersReducedMotion() ? "auto" : "smooth");
        mark(index);
      };
      pick.addEventListener("click", click);
      return () => pick.removeEventListener("click", click);
    });

    // Which slide is nearest the middle wins, so a half-scrolled frame still
    // has a highlight rather than none.
    const observer = new IntersectionObserver(
      () => {
        const box = frame.getBoundingClientRect();
        const middle = box.left + box.width / 2;
        let best = 0;
        let nearest = Infinity;
        slides.forEach((one, index) => {
          const rect = one.getBoundingClientRect();
          const distance = Math.abs(rect.left + rect.width / 2 - middle);
          if (distance < nearest) { nearest = distance; best = index; }
        });
        mark(best);
      },
      { root: frame, threshold: [0.4, 0.6] },
    );
    slides.forEach((one) => observer.observe(one));
    mark(0);

    cleanups.push(() => {
      handlers.forEach((off) => off());
      observer.disconnect();
      group.classList.remove("rm-thumbs");
      frame.classList.remove("rm-thumbs-main");
      bar.classList.remove("rm-thumbs-strip");
      picks.forEach((pick) => {
        pick.classList.remove("is-current");
        pick.removeAttribute("aria-current");
      });
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A carousel that advances itself, and stops the moment you touch it.
 *
 * It pauses on hover, on focus anywhere inside, and when the tab is hidden —
 * and it exposes a real pause button, because an auto-advancing carousel with
 * no way to stop it fails the one accessibility requirement everybody knows
 * about and nobody implements.
 *
 * The progress ring shows how long is left, so the movement is never a
 * surprise.
 */
export function autoplay(target = "[data-rm-autoplay]", options = {}) {
  const rails = resolveElements(target);
  if (!rails.length) return () => {};

  const { selector = ":scope > *", interval = 4200, pauseLabel = "Pause", playLabel = "Play" } = options;
  const cleanups = [];

  for (const rail of rails) {
    const slides = [...rail.querySelectorAll(selector)];
    if (slides.length < 2) continue;

    const every = dataNumber(rail, "rmInterval", interval);
    rail.classList.add("rm-autoplay");
    rail.style.setProperty("--rm-autoplay-interval", `${every}ms`);

    const control = document.createElement("button");
    control.type = "button";
    control.className = "rm-autoplay-control";
    control.innerHTML = '<span class="rm-autoplay-ring"></span><span class="rm-autoplay-icon"></span>';
    control.setAttribute("aria-label", pauseLabel);
    control.setAttribute("aria-pressed", "false");
    rail.after(control);

    let at = 0;
    let timer = 0;
    let stopped = prefersReducedMotion();

    const go = () => {
      at = (at + 1) % slides.length;
      keepInView(rail, slides[at], prefersReducedMotion() ? "auto" : "smooth");
    };

    const start = () => {
      if (stopped || timer) return;
      timer = setInterval(go, every);
      rail.classList.add("is-running");
    };
    const halt = () => {
      clearInterval(timer);
      timer = 0;
      rail.classList.remove("is-running");
    };

    const onControl = () => {
      stopped = !stopped;
      control.setAttribute("aria-pressed", String(stopped));
      control.setAttribute("aria-label", stopped ? playLabel : pauseLabel);
      control.classList.toggle("is-paused", stopped);
      if (stopped) halt();
      else start();
    };

    const onVisibility = () => (document.hidden ? halt() : start());

    control.addEventListener("click", onControl);
    rail.addEventListener("pointerenter", halt);
    rail.addEventListener("pointerleave", start);
    rail.addEventListener("focusin", halt);
    rail.addEventListener("focusout", start);
    document.addEventListener("visibilitychange", onVisibility);
    start();

    cleanups.push(() => {
      halt();
      control.removeEventListener("click", onControl);
      rail.removeEventListener("pointerenter", halt);
      rail.removeEventListener("pointerleave", start);
      rail.removeEventListener("focusin", halt);
      rail.removeEventListener("focusout", start);
      document.removeEventListener("visibilitychange", onVisibility);
      control.remove();
      rail.classList.remove("rm-autoplay", "is-running");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Items around a wheel that turns under the pointer.
 *
 * The radial menu. Items sit on a circle and the whole wheel rotates toward
 * whichever one you point at, so the item you want travels to you rather than
 * you chasing it around the rim. Arrow keys step one notch, which is the part
 * a radial menu almost always forgets.
 */
export function wheel(target = "[data-rm-wheel]", options = {}) {
  const wheels = resolveElements(target);
  if (!wheels.length) return () => {};

  const { selector = ":scope > *", radius = 130, ease = 0.14 } = options;
  const cleanups = [];

  for (const holder of wheels) {
    const items = [...holder.querySelectorAll(selector)];
    if (items.length < 3) continue;

    const r = dataNumber(holder, "rmRadius", radius);
    const step = 360 / items.length;

    holder.classList.add("rm-wheel");
    holder.style.setProperty("--rm-wheel-radius", `${r}px`);
    if (!holder.hasAttribute("tabindex")) holder.tabIndex = 0;
    items.forEach((item, index) => {
      item.classList.add("rm-wheel-item");
      item.style.setProperty("--rm-wheel-angle", `${index * step}deg`);
    });

    let at = 0;
    let goal = 0;

    const render = () => {
      holder.style.setProperty("--rm-wheel-turn", `${at.toFixed(2)}deg`);
      items.forEach((item, index) => {
        // How close this item is to the top of the wheel.
        const facing = Math.cos(((index * step + at - 90) * Math.PI) / 180);
        item.classList.toggle("is-front", facing > 0.86);
      });
    };
    render();

    const handlers = items.map((item, index) => {
      const enter = () => { goal = -index * step; };
      item.addEventListener("pointerenter", enter);
      item.addEventListener("focus", enter);
      return () => {
        item.removeEventListener("pointerenter", enter);
        item.removeEventListener("focus", enter);
      };
    });

    const onKey = (event) => {
      if (event.key === "ArrowRight") goal -= step;
      else if (event.key === "ArrowLeft") goal += step;
      else return;
      event.preventDefault();
    };
    holder.addEventListener("keydown", onKey);

    const stopFrame = onFrame(() => {
      if (Math.abs(goal - at) < 0.05) return;
      at = lerp(at, goal, prefersReducedMotion() ? 1 : ease);
      render();
    });

    cleanups.push(() => {
      stopFrame();
      handlers.forEach((off) => off());
      holder.removeEventListener("keydown", onKey);
      holder.classList.remove("rm-wheel");
      items.forEach((item) => item.classList.remove("rm-wheel-item", "is-front"));
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * The next slide showing at the edge, so you know it is there.
 *
 * Scroll padding rather than a transform: the slides genuinely sit inside a
 * narrower scroll port, so snapping, the scrollbar and keyboard scrolling all
 * agree with what you can see. The usual version fakes the peek with a
 * negative margin and then has to fight its own snap points.
 */
export function peek(target = "[data-rm-peek]", options = {}) {
  const rails = resolveElements(target);
  if (!rails.length) return () => {};

  const { amount = 64, selector = ":scope > *" } = options;
  const applied = [];

  for (const rail of rails) {
    const slides = [...rail.querySelectorAll(selector)];
    if (slides.length < 2) continue;

    rail.classList.add("rm-peek");
    rail.style.setProperty("--rm-peek", `${dataNumber(rail, "rmPeek", amount)}px`);
    slides.forEach((slide) => slide.classList.add("rm-peek-slide"));
    applied.push({ rail, slides });
  }

  return () => applied.forEach(({ rail, slides }) => {
    rail.classList.remove("rm-peek");
    slides.forEach((slide) => slide.classList.remove("rm-peek-slide"));
  });
}

/**
 * Rows travelling in opposite directions.
 *
 * Two or three bands, each moving the other way from the one above, which is
 * what turns a single sliding strip into something that reads as texture. Each
 * row is duplicated until it is twice the viewport and wrapped by exactly one
 * copy, so no row can ever show a seam.
 */
export function ticker(target = "[data-rm-ticker]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { row = "[data-rm-ticker-row]", speed = 40, gap = 28 } = options;
  const cleanups = [];

  for (const holder of holders) {
    const rows = [...holder.querySelectorAll(row)];
    if (!rows.length) continue;

    holder.classList.add("rm-ticker");
    const states = [];

    rows.forEach((strip, index) => {
      const original = strip.innerHTML;
      strip.classList.add("rm-ticker-row");
      strip.style.gap = `${gap}px`;

      const group = document.createElement("div");
      group.className = "rm-ticker-group";
      group.style.gap = `${gap}px`;
      group.innerHTML = original;
      strip.replaceChildren(group);

      let copyWidth = 0;
      const fill = () => {
        strip.replaceChildren(group);
        copyWidth = group.getBoundingClientRect().width + gap;
        if (copyWidth <= 0) return;
        const needed = Math.ceil((innerWidth * 2) / copyWidth);
        for (let i = 0; i < needed; i++) {
          const clone = group.cloneNode(true);
          clone.setAttribute("aria-hidden", "true");
          strip.appendChild(clone);
        }
      };
      fill();
      addEventListener("resize", fill);

      // Alternate direction row by row: that is the whole effect.
      const direction = index % 2 === 0 ? -1 : 1;
      const rate = dataNumber(strip, "rmSpeed", speed);
      states.push({ strip, fill, offset: direction === -1 ? 0 : -copyWidth, direction, rate, get width() { return copyWidth; } });
    });

    if (prefersReducedMotion()) {
      holder.classList.add("is-static");
      cleanups.push(() => {
        states.forEach(({ fill }) => removeEventListener("resize", fill));
        holder.classList.remove("rm-ticker", "is-static");
      });
      continue;
    }

    let last = 0;
    const stopFrame = onFrame((now) => {
      const delta = last ? (now - last) / 1000 : 0;
      last = now;
      for (const state of states) {
        if (state.width <= 0) continue;
        state.offset += state.direction * state.rate * delta;
        if (state.offset <= -state.width) state.offset += state.width;
        if (state.offset >= 0 && state.direction === 1) state.offset -= state.width;
        state.strip.style.transform = `translate3d(${state.offset.toFixed(2)}px,0,0)`;
      }
    });

    cleanups.push(() => {
      stopFrame();
      states.forEach(({ fill }) => removeEventListener("resize", fill));
      holder.classList.remove("rm-ticker");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * One frame at a time, cross-faded, with real controls.
 *
 * The plain slideshow, done properly: previous and next are buttons, the dots
 * are a `tablist`, the current frame is the only one not `hidden`, and the
 * change is announced through a live region. Every one of those is missing
 * from the version built out of divs and a `setInterval`.
 */
export function slideshow(target = "[data-rm-slideshow]", options = {}) {
  const shows = resolveElements(target);
  if (!shows.length) return () => {};

  const { slide = "[data-rm-slide]", duration = 520, label = "Slideshow" } = options;
  const cleanups = [];

  for (const show of shows) {
    const slides = [...show.querySelectorAll(slide)];
    if (slides.length < 2) continue;

    show.classList.add("rm-slideshow");
    show.setAttribute("role", "region");
    show.setAttribute("aria-roledescription", "carousel");
    show.setAttribute("aria-label", dataString(show, "rmLabel", label));
    show.style.setProperty("--rm-slideshow-duration", `${prefersReducedMotion() ? 0 : duration}ms`);

    const controls = document.createElement("div");
    controls.className = "rm-slideshow-controls";
    const previous = document.createElement("button");
    previous.type = "button";
    previous.className = "rm-slideshow-prev";
    previous.setAttribute("aria-label", "Previous");
    previous.textContent = "←";
    const next = document.createElement("button");
    next.type = "button";
    next.className = "rm-slideshow-next";
    next.setAttribute("aria-label", "Next");
    next.textContent = "→";

    const dots = document.createElement("div");
    dots.className = "rm-slideshow-dots";
    dots.setAttribute("role", "tablist");
    const buttons = slides.map((one, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", `Slide ${index + 1} of ${slides.length}`);
      dots.appendChild(dot);
      return dot;
    });

    const live = document.createElement("span");
    live.className = "rm-slideshow-live";
    live.setAttribute("aria-live", "polite");

    controls.append(previous, dots, next, live);
    show.appendChild(controls);
    slides.forEach((one) => one.classList.add("rm-slideshow-slide"));

    let at = 0;
    const go = (index) => {
      at = (index + slides.length) % slides.length;
      slides.forEach((one, i) => {
        one.classList.toggle("is-current", i === at);
        one.hidden = i !== at;
      });
      buttons.forEach((dot, i) => {
        dot.classList.toggle("is-current", i === at);
        dot.setAttribute("aria-selected", String(i === at));
      });
      live.textContent = `Slide ${at + 1} of ${slides.length}`;
    };
    go(0);

    const onPrevious = () => go(at - 1);
    const onNext = () => go(at + 1);
    previous.addEventListener("click", onPrevious);
    next.addEventListener("click", onNext);
    const dotHandlers = buttons.map((dot, index) => {
      const click = () => go(index);
      dot.addEventListener("click", click);
      return () => dot.removeEventListener("click", click);
    });

    cleanups.push(() => {
      previous.removeEventListener("click", onPrevious);
      next.removeEventListener("click", onNext);
      dotHandlers.forEach((off) => off());
      controls.remove();
      slides.forEach((one) => {
        one.classList.remove("rm-slideshow-slide", "is-current");
        one.hidden = false;
      });
      show.classList.remove("rm-slideshow");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}
