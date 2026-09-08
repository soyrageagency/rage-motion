/**
 * Navigation.
 *
 *   • pill()     — an indicator that slides to whatever link you point at.
 *   • gooey()    — the same idea, but the indicator stretches and splits.
 *   • condense() — a header that shrinks on the way down and returns on the way up.
 *   • overlay()  — a full-screen menu that opens from its own button.
 *   • tabs()     — panels that slide in from the direction you came from.
 *
 * Navigation is the one place where a nice animation most often breaks the
 * site. So the rules here are strict: nothing replaces a link or a button,
 * nothing intercepts a click, the current page is still marked with
 * `aria-current`, and the overlay traps focus, closes on Escape, restores
 * focus where it was, and marks the rest of the page inert while it is open.
 * A menu you cannot leave with the keyboard is not a menu.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import {
  dataNumber, dataString, EASE, onFrame, prefersReducedMotion, resolveElements,
} from "../core/motion.js";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * An indicator that slides to whatever link you point at.
 *
 * One element that is measured against the target link and moved with a
 * transform, so the travel is smooth between items of different widths. The
 * usual approach — a `::after` underline on each link, cross-fading — cannot
 * travel at all, which is the entire appeal of this pattern.
 *
 * It returns to the current page's link when the pointer leaves, so the
 * navigation never ends up pointing at nothing.
 *
 *   <nav data-rm-pill>
 *     <a href="/" aria-current="page">Work</a><a href="/about">About</a>
 *   </nav>
 */
export function pill(target = "[data-rm-pill]", options = {}) {
  const navs = resolveElements(target);
  if (!navs.length) return () => {};

  const { selector = "a, button", duration = 420 } = options;
  const cleanups = [];

  for (const nav of navs) {
    const items = [...nav.querySelectorAll(selector)];
    if (items.length < 2) continue;

    nav.classList.add("rm-pill");
    const indicator = document.createElement("span");
    indicator.className = "rm-pill-indicator";
    indicator.setAttribute("aria-hidden", "true");
    indicator.style.setProperty("--rm-pill-duration", `${prefersReducedMotion() ? 0 : dataNumber(nav, "rmDuration", duration)}ms`);
    nav.prepend(indicator);

    // The resting place: whatever the page says is current, or the first item.
    const home = () => items.find((item) => item.getAttribute("aria-current")) ?? items[0];

    const moveTo = (item) => {
      if (!item) return;
      const navBox = nav.getBoundingClientRect();
      const box = item.getBoundingClientRect();
      indicator.style.width = `${box.width}px`;
      indicator.style.height = `${box.height}px`;
      indicator.style.transform = `translate3d(${box.left - navBox.left}px, ${box.top - navBox.top}px, 0)`;
      indicator.style.opacity = "1";
    };

    const settle = () => moveTo(home());
    settle();

    const handlers = [];
    for (const item of items) {
      const enter = () => moveTo(item);
      item.addEventListener("pointerenter", enter);
      item.addEventListener("focus", enter);
      handlers.push(() => {
        item.removeEventListener("pointerenter", enter);
        item.removeEventListener("focus", enter);
      });
    }
    nav.addEventListener("pointerleave", settle);
    nav.addEventListener("focusout", settle);

    // Fonts land after first paint and change every width; measure again.
    const resizeObserver = new ResizeObserver(settle);
    resizeObserver.observe(nav);
    document.fonts?.ready.then(settle).catch(() => {});

    cleanups.push(() => {
      handlers.forEach((off) => off());
      nav.removeEventListener("pointerleave", settle);
      nav.removeEventListener("focusout", settle);
      resizeObserver.disconnect();
      indicator.remove();
      nav.classList.remove("rm-pill");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * The sliding indicator, but liquid.
 *
 * Two blobs under an SVG gooey filter: one leads, one lags, and the filter
 * fuses them into a single stretching shape. That is why it looks like liquid
 * rather than a box being scaled — the stretch is a consequence of two things
 * moving at different speeds, not a keyframe pretending.
 */
export function gooey(target = "[data-rm-gooey]", options = {}) {
  const navs = resolveElements(target);
  if (!navs.length) return () => {};

  const { selector = "a, button", color = "#2aa7e4", lead = 0.34, lag = 0.15 } = options;
  const cleanups = [];
  let uid = 0;

  for (const nav of navs) {
    const items = [...nav.querySelectorAll(selector)];
    if (items.length < 2) continue;

    const id = `rm-gooey-${++uid}`;
    nav.classList.add("rm-gooey");

    const layer = document.createElement("span");
    layer.className = "rm-gooey-layer";
    layer.setAttribute("aria-hidden", "true");
    layer.style.filter = `url(#${id})`;
    layer.innerHTML = '<i class="rm-gooey-blob"></i><i class="rm-gooey-blob"></i>';
    layer.style.setProperty("--rm-gooey-color", dataString(nav, "rmColor", color));

    const defs = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    defs.classList.add("rm-gooey-defs");
    defs.setAttribute("aria-hidden", "true");
    defs.innerHTML =
      `<filter id="${id}">` +
      '<feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur"/>' +
      // The matrix pushes the blurred alpha to hard edges, which is what fuses
      // two overlapping blobs into one shape instead of a soft cloud.
      '<feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -11"/>' +
      "</filter>";

    nav.prepend(layer, defs);
    const blobs = [...layer.querySelectorAll(".rm-gooey-blob")];

    const goal = { x: 0, y: 0, w: 0, h: 0 };
    const at = blobs.map(() => ({ x: 0, y: 0, w: 0, h: 0 }));

    const aim = (item) => {
      const navBox = nav.getBoundingClientRect();
      const box = item.getBoundingClientRect();
      goal.x = box.left - navBox.left;
      goal.y = box.top - navBox.top;
      goal.w = box.width;
      goal.h = box.height;
    };

    const home = () => items.find((item) => item.getAttribute("aria-current")) ?? items[0];
    aim(home());
    at.forEach((blob) => Object.assign(blob, goal));

    const handlers = [];
    for (const item of items) {
      const enter = () => aim(item);
      item.addEventListener("pointerenter", enter);
      item.addEventListener("focus", enter);
      handlers.push(() => {
        item.removeEventListener("pointerenter", enter);
        item.removeEventListener("focus", enter);
      });
    }
    const settle = () => aim(home());
    nav.addEventListener("pointerleave", settle);
    nav.addEventListener("focusout", settle);

    const speeds = [lead, lag];
    const stopFrame = onFrame(() => {
      blobs.forEach((blob, index) => {
        const rate = prefersReducedMotion() ? 1 : speeds[index];
        const state = at[index];
        state.x += (goal.x - state.x) * rate;
        state.y += (goal.y - state.y) * rate;
        state.w += (goal.w - state.w) * rate;
        state.h += (goal.h - state.h) * rate;
        blob.style.width = `${state.w.toFixed(1)}px`;
        blob.style.height = `${state.h.toFixed(1)}px`;
        blob.style.transform = `translate3d(${state.x.toFixed(1)}px, ${state.y.toFixed(1)}px, 0)`;
      });
    });

    cleanups.push(() => {
      stopFrame();
      handlers.forEach((off) => off());
      nav.removeEventListener("pointerleave", settle);
      nav.removeEventListener("focusout", settle);
      layer.remove();
      defs.remove();
      nav.classList.remove("rm-gooey");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A header that shrinks on the way down and comes back on the way up.
 *
 * Two independent states, and keeping them independent is the point: `is-small`
 * once you are past the fold, `is-hidden` only while you are actively scrolling
 * down. A header that hides purely by scroll position is the one that vanishes
 * when you are trying to reach it.
 *
 * It never hides while anything inside it has focus, so tabbing into the
 * navigation cannot make it disappear.
 */
export function condense(target = "[data-rm-condense]", options = {}) {
  const headers = resolveElements(target);
  if (!headers.length) return () => {};

  const { after = 80, hideAfter = 240, tolerance = 6 } = options;

  let last = scrollY;
  const stopFrame = onFrame(() => {
    const y = scrollY;
    const delta = y - last;
    if (Math.abs(delta) < tolerance) return;
    last = y;

    for (const header of headers) {
      const small = y > dataNumber(header, "rmAfter", after);
      header.classList.toggle("is-small", small);
      const hide =
        delta > 0 &&
        y > dataNumber(header, "rmHideAfter", hideAfter) &&
        !header.contains(document.activeElement);
      header.classList.toggle("is-hidden", hide && !prefersReducedMotion());
    }
  });

  headers.forEach((header) => header.classList.add("rm-condense"));

  return () => {
    stopFrame();
    headers.forEach((header) => header.classList.remove("rm-condense", "is-small", "is-hidden"));
  };
}

/**
 * A full-screen menu that opens out of its own button.
 *
 * The panel is clipped to a circle centred on the button and grown to cover
 * the viewport, so the menu genuinely comes from the thing you pressed rather
 * than sliding in from an edge for no reason.
 *
 * The accessibility is the part worth copying: `aria-expanded` on the trigger,
 * focus moved into the panel and trapped there, Escape closes, focus returns
 * to the button, the rest of the page is `inert` so a screen reader cannot
 * wander behind the overlay, and the body cannot scroll underneath.
 *
 *   <button data-rm-overlay-open aria-controls="menu">Menu</button>
 *   <div id="menu" data-rm-overlay hidden>
 *     <a href="/work">Work</a><a href="/about">About</a>
 *   </div>
 */
export function overlay(target = "[data-rm-overlay]", options = {}) {
  const panels = resolveElements(target);
  if (!panels.length) return () => {};

  const { trigger = "[data-rm-overlay-open]", stagger = 70, duration = 620 } = options;
  const cleanups = [];

  for (const panel of panels) {
    // More than one button may open the same menu — one in the header, one in
    // the page — so every match is wired, and the one actually pressed decides
    // where the panel grows from.
    const buttons = panel.id
      ? [...document.querySelectorAll(`${trigger}[aria-controls="${panel.id}"]`)]
      : [...document.querySelectorAll(trigger)];
    if (!buttons.length) continue;
    const button = buttons[0];

    panel.classList.add("rm-overlay");
    panel.hidden = true;
    buttons.forEach((one) => one.setAttribute("aria-expanded", "false"));

    const links = [...panel.querySelectorAll(FOCUSABLE)];
    let open = false;
    let returnTo = null;

    let from = button;
    const setOrigin = () => {
      const box = from.getBoundingClientRect();
      panel.style.setProperty("--rm-overlay-x", `${box.left + box.width / 2}px`);
      panel.style.setProperty("--rm-overlay-y", `${box.top + box.height / 2}px`);
    };

    const onKey = (event) => {
      if (!open) return;
      if (event.key === "Escape") { close(); return; }
      if (event.key !== "Tab" || !links.length) return;
      // Keep Tab inside the panel while it is covering the page.
      const first = links[0];
      const last_ = links[links.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last_.focus();
      } else if (!event.shiftKey && document.activeElement === last_) {
        event.preventDefault();
        first.focus();
      }
    };

    function show() {
      if (open) return;
      open = true;
      returnTo = document.activeElement;
      setOrigin();
      panel.hidden = false;
      // Let the browser lay the panel out before the clip animates.
      requestAnimationFrame(() => panel.classList.add("is-open"));
      buttons.forEach((one) => one.setAttribute("aria-expanded", "true"));
      document.documentElement.classList.add("rm-overlay-locked");
      // Everything except the panel, including whatever holds the trigger.
      // The button is behind a full-screen overlay at this point, so leaving
      // its branch reachable would let a screen reader wander behind the menu
      // — which is the whole thing this is here to prevent. It is cleared
      // before focus is handed back.
      for (const sibling of document.body.children) {
        if (sibling !== panel) sibling.inert = true;
      }
      if (!prefersReducedMotion()) {
        links.forEach((link, index) => {
          link.animate(
            [{ opacity: 0, transform: "translateY(28px)" }, { opacity: 1, transform: "translateY(0)" }],
            { duration, delay: 120 + index * stagger, easing: EASE.out, fill: "backwards" },
          );
        });
      }
      links[0]?.focus({ preventScroll: true });
    }

    function close() {
      if (!open) return;
      open = false;
      panel.classList.remove("is-open");
      buttons.forEach((one) => one.setAttribute("aria-expanded", "false"));
      document.documentElement.classList.remove("rm-overlay-locked");
      for (const sibling of document.body.children) sibling.inert = false;

      const finish = () => { panel.hidden = true; };
      if (prefersReducedMotion()) finish();
      else setTimeout(finish, duration * 0.7);
      if (returnTo instanceof HTMLElement) returnTo.focus({ preventScroll: true });
      else from.focus({ preventScroll: true });
    }

    const toggle = (event) => {
      from = event.currentTarget;
      if (open) close();
      else show();
    };
    buttons.forEach((one) => one.addEventListener("click", toggle));
    document.addEventListener("keydown", onKey);
    addEventListener("resize", setOrigin);
    // A link inside the menu should close it on the way out.
    panel.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest("a[href]")) close();
    });

    cleanups.push(() => {
      close();
      buttons.forEach((one) => one.removeEventListener("click", toggle));
      document.removeEventListener("keydown", onKey);
      removeEventListener("resize", setOrigin);
      panel.classList.remove("rm-overlay", "is-open");
      panel.hidden = false;
      buttons.forEach((one) => one.removeAttribute("aria-expanded"));
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Tabs whose panels slide in from the direction you came from.
 *
 * Move right along the tabs and the panel arrives from the right; move back
 * and it comes from the left. It costs one comparison and it is the difference
 * between tabs that feel spatial and tabs that blink.
 *
 * Built on the real tab pattern: `role="tablist"`, arrow keys, roving
 * `tabindex`, and panels that are genuinely hidden when inactive.
 *
 *   <div data-rm-tabs>
 *     <div data-rm-tab-list><button data-rm-tab>One</button>…</div>
 *     <div data-rm-tab-panel>…</div>
 *   </div>
 */
export function tabs(target = "[data-rm-tabs]", options = {}) {
  const groups = resolveElements(target);
  if (!groups.length) return () => {};

  const {
    tab = "[data-rm-tab]", panel = "[data-rm-tab-panel]", duration = 420, distance = 26,
  } = options;
  const cleanups = [];
  let uid = 0;

  for (const group of groups) {
    const buttons = [...group.querySelectorAll(tab)];
    const panels = [...group.querySelectorAll(panel)];
    if (buttons.length < 2 || buttons.length !== panels.length) continue;

    const list = buttons[0].parentElement;
    list?.setAttribute("role", "tablist");
    group.classList.add("rm-tabs");

    const id = ++uid;
    buttons.forEach((button, index) => {
      button.setAttribute("role", "tab");
      button.id = button.id || `rm-tab-${id}-${index}`;
      panels[index].id = panels[index].id || `rm-tabpanel-${id}-${index}`;
      button.setAttribute("aria-controls", panels[index].id);
      panels[index].setAttribute("role", "tabpanel");
      panels[index].setAttribute("aria-labelledby", button.id);
      panels[index].classList.add("rm-tab-panel");
    });

    let current = 0;
    const select = (next, viaKeyboard = false) => {
      if (next === current) return;
      const backwards = next < current;
      current = next;

      buttons.forEach((button, index) => {
        const on = index === next;
        button.setAttribute("aria-selected", String(on));
        button.tabIndex = on ? 0 : -1;
        button.classList.toggle("is-current", on);
      });
      panels.forEach((item, index) => {
        const on = index === next;
        item.hidden = !on;
        if (!on || prefersReducedMotion()) return;
        item.animate(
          [
            { opacity: 0, transform: `translateX(${backwards ? -distance : distance}px)` },
            { opacity: 1, transform: "translateX(0)" },
          ],
          { duration, easing: EASE.out },
        );
      });
      if (viaKeyboard) buttons[next].focus();
    };

    // Set the resting state without animating into it.
    buttons.forEach((button, index) => {
      button.setAttribute("aria-selected", String(index === 0));
      button.tabIndex = index === 0 ? 0 : -1;
      button.classList.toggle("is-current", index === 0);
      panels[index].hidden = index !== 0;
    });

    const handlers = [];
    buttons.forEach((button, index) => {
      const click = () => select(index);
      button.addEventListener("click", click);
      handlers.push(() => button.removeEventListener("click", click));
    });

    const onKey = (event) => {
      const moves = { ArrowRight: 1, ArrowLeft: -1, Home: -Infinity, End: Infinity };
      if (!(event.key in moves)) return;
      event.preventDefault();
      const step = moves[event.key];
      const next =
        step === -Infinity ? 0
          : step === Infinity ? buttons.length - 1
            : (current + step + buttons.length) % buttons.length;
      select(next, true);
    };
    list?.addEventListener("keydown", onKey);

    cleanups.push(() => {
      handlers.forEach((off) => off());
      list?.removeEventListener("keydown", onKey);
      group.classList.remove("rm-tabs");
      panels.forEach((item) => { item.hidden = false; item.classList.remove("rm-tab-panel"); });
      buttons.forEach((button) => button.classList.remove("is-current"));
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Mark the navigation link for whatever section you are reading.
 *
 * It sets `aria-current="true"` and nothing else — no classes of its own, no
 * indicator. That is the whole design: `pill` and `gooey` already rest on the
 * current link, so putting the two together makes the indicator follow the
 * page as you scroll, and none of the three had to know about the others.
 *
 * Whichever section is nearest the reading line wins, rather than testing
 * ranges, so there is never a scroll position where nothing is marked.
 *
 *   <nav data-rm-spy data-rm-pill>
 *     <a href="#work">Work</a><a href="#about">About</a>
 *   </nav>
 */
export function scrollSpy(target = "[data-rm-spy]", options = {}) {
  const navs = resolveElements(target);
  if (!navs.length) return () => {};

  const { selector = 'a[href^="#"]', line = 0.32 } = options;
  const groups = [];

  for (const nav of navs) {
    const links = [...nav.querySelectorAll(selector)];
    const pairs = links
      .map((link) => ({ link, section: document.querySelector(link.getAttribute("href")) }))
      .filter((pair) => pair.section);
    if (pairs.length > 1) groups.push({ nav, pairs, current: -1 });
  }
  if (!groups.length) return () => {};

  const stopFrame = onFrame(() => {
    const reading = innerHeight * line;
    for (const group of groups) {
      let best = 0;
      let bestDistance = Infinity;
      group.pairs.forEach((pair, index) => {
        const box = pair.section.getBoundingClientRect();
        // Distance from the section's top to the reading line, but a section
        // you are inside always beats one you have not reached.
        const distance = box.top <= reading && box.bottom > reading
          ? 0
          : Math.abs(box.top - reading);
        if (distance < bestDistance) { bestDistance = distance; best = index; }
      });

      if (best === group.current) continue;
      group.current = best;
      group.pairs.forEach(({ link }, index) => {
        if (index === best) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    }
  });

  return () => {
    stopFrame();
    groups.forEach(({ pairs }) => pairs.forEach(({ link }) => link.removeAttribute("aria-current")));
  };
}

/**
 * A ring that fills as the page scrolls.
 *
 * `stroke-dasharray` on a real circle, so the ring is drawn rather than
 * approximated by rotating two half-discs — which is the usual trick and the
 * reason those versions cannot be given a rounded cap.
 *
 * It is decoration for a number that is already announced by the page, so it
 * is `aria-hidden` and never becomes the only way to know where you are.
 *
 *   <a href="#top" data-rm-ring-progress>Top</a>
 */
export function progressRing(target = "[data-rm-ring-progress]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { size = 44, width = 2, color = "#2aa7e4", track = "rgba(255,255,255,0.14)" } = options;
  const rings = [];

  for (const element of elements) {
    const box = dataNumber(element, "rmSize", size);
    const radius = (box - width) / 2;
    const length = 2 * Math.PI * radius;

    element.classList.add("rm-ring-progress");
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${box} ${box}`);
    svg.setAttribute("width", String(box));
    svg.setAttribute("height", String(box));
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML =
      `<circle cx="${box / 2}" cy="${box / 2}" r="${radius}" fill="none" stroke="${dataString(element, "rmTrack", track)}" stroke-width="${width}"/>` +
      `<circle class="rm-ring-progress-arc" cx="${box / 2}" cy="${box / 2}" r="${radius}" fill="none" ` +
      `stroke="${dataString(element, "rmColor", color)}" stroke-width="${width}" stroke-linecap="round" ` +
      `stroke-dasharray="${length.toFixed(2)}" stroke-dashoffset="${length.toFixed(2)}" ` +
      `transform="rotate(-90 ${box / 2} ${box / 2})"/>`;
    element.prepend(svg);
    rings.push({ element, svg, arc: svg.querySelector(".rm-ring-progress-arc"), length });
  }

  const stopFrame = onFrame(() => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const ratio = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    for (const ring of rings) {
      ring.arc.setAttribute("stroke-dashoffset", (ring.length * (1 - ratio)).toFixed(2));
    }
  });

  return () => {
    stopFrame();
    rings.forEach((ring) => {
      ring.svg.remove();
      ring.element.classList.remove("rm-ring-progress");
    });
  };
}
