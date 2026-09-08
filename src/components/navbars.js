/**
 * Navigation, the larger pieces.
 *
 *   • command()   — a ⌘K palette that filters and moves on the keyboard.
 *   • sidebar()   — a drawer that slides in and gives focus back.
 *   • rail()      — a vertical rail with a marker that travels.
 *   • bottomNav() — a bottom bar with an indicator that follows.
 *   • mega()      — a wide panel under a top-level item, with hover intent.
 *
 * `nav.js` holds the small pieces — an indicator, a header that condenses,
 * tabs. These are the ones with state, and state is where navigation stops
 * being decoration and starts being something you can lock a visitor out of.
 * So each one here answers the same three questions in its own comment: what
 * takes focus, what gives it back, and what Escape does.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import {
  dataNumber, dataString, onFrame, prefersReducedMotion, resolveElements,
} from "../core/motion.js";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * A command palette.
 *
 * Opens on ⌘K or Ctrl-K, filters as you type, moves with the arrow keys,
 * commits on Enter and closes on Escape. Focus goes into the field and comes
 * back to whatever had it; the rest of the page is `inert` while it is open.
 *
 * The filter is a plain substring match over the item's own text, so the
 * markup stays the source of truth and there is no parallel list to keep in
 * sync — the commonest bug in every hand-rolled palette.
 *
 *   <div data-rm-command hidden>
 *     <input data-rm-command-input placeholder="Search…">
 *     <div data-rm-command-list>
 *       <a href="/work">Work</a><a href="/about">About</a>
 *     </div>
 *   </div>
 */
export function command(target = "[data-rm-command]", options = {}) {
  const panels = resolveElements(target);
  if (!panels.length) return () => {};

  const {
    input = "[data-rm-command-input]",
    list = "[data-rm-command-list]",
    item = "a[href], button",
    trigger = "[data-rm-command-open]",
    key = "k",
    empty = "Nothing matches",
  } = options;
  const cleanups = [];

  for (const panel of panels) {
    const field = panel.querySelector(input);
    const board = panel.querySelector(list);
    if (!field || !board) continue;

    const items = [...board.querySelectorAll(item)];
    if (!items.length) continue;

    panel.classList.add("rm-command");
    panel.hidden = true;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    field.setAttribute("role", "combobox");
    field.setAttribute("aria-expanded", "true");
    field.setAttribute("aria-autocomplete", "list");
    board.setAttribute("role", "listbox");
    items.forEach((one) => one.setAttribute("role", "option"));

    const nothing = document.createElement("p");
    nothing.className = "rm-command-empty";
    nothing.textContent = empty;
    nothing.hidden = true;
    board.after(nothing);

    let open = false;
    let at = 0;
    let returnTo = null;

    const visible = () => items.filter((one) => !one.hidden);

    const mark = () => {
      const shown = visible();
      at = Math.max(0, Math.min(at, shown.length - 1));
      items.forEach((one) => {
        one.classList.remove("is-active");
        one.setAttribute("aria-selected", "false");
      });
      const current = shown[at];
      if (!current) return;
      current.classList.add("is-active");
      current.setAttribute("aria-selected", "true");
      field.setAttribute("aria-activedescendant", current.id || "");
      current.scrollIntoView({ block: "nearest" });
    };

    const filter = () => {
      const query = field.value.trim().toLowerCase();
      for (const one of items) {
        one.hidden = query !== "" && !(one.textContent ?? "").toLowerCase().includes(query);
      }
      nothing.hidden = visible().length > 0;
      at = 0;
      mark();
    };

    const show = () => {
      if (open) return;
      open = true;
      returnTo = document.activeElement;
      panel.hidden = false;
      requestAnimationFrame(() => panel.classList.add("is-open"));
      document.documentElement.classList.add("rm-command-locked");
      for (const sibling of document.body.children) {
        if (sibling !== panel) sibling.inert = true;
      }
      field.value = "";
      filter();
      field.focus({ preventScroll: true });
    };

    const close = () => {
      if (!open) return;
      open = false;
      panel.classList.remove("is-open");
      document.documentElement.classList.remove("rm-command-locked");
      for (const sibling of document.body.children) sibling.inert = false;
      const finish = () => { panel.hidden = true; };
      if (prefersReducedMotion()) finish();
      else setTimeout(finish, 200);
      if (returnTo instanceof HTMLElement) returnTo.focus({ preventScroll: true });
    };

    const onGlobalKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === key) {
        event.preventDefault();
        open ? close() : show();
        return;
      }
      if (!open) return;
      if (event.key === "Escape") { event.preventDefault(); close(); return; }
      const moves = { ArrowDown: 1, ArrowUp: -1 };
      if (event.key in moves) {
        event.preventDefault();
        const shown = visible();
        at = (at + moves[event.key] + shown.length) % Math.max(1, shown.length);
        mark();
        return;
      }
      if (event.key === "Enter") {
        const current = visible()[at];
        if (!current) return;
        event.preventDefault();
        current.click();
        close();
      }
    };

    const openers = [...document.querySelectorAll(trigger)];
    openers.forEach((one) => one.addEventListener("click", show));
    field.addEventListener("input", filter);
    document.addEventListener("keydown", onGlobalKey);
    panel.addEventListener("click", (event) => { if (event.target === panel) close(); });

    cleanups.push(() => {
      close();
      openers.forEach((one) => one.removeEventListener("click", show));
      field.removeEventListener("input", filter);
      document.removeEventListener("keydown", onGlobalKey);
      nothing.remove();
      panel.classList.remove("rm-command", "is-open");
      panel.hidden = false;
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A drawer that slides in from an edge.
 *
 * Focus moves in and is trapped, Escape closes, focus returns to the button,
 * the page behind is `inert` and cannot scroll. Which is the same contract the
 * full-screen overlay makes — a drawer is a dialog that happens to be against
 * an edge, and treating it as decoration is how it becomes a trap.
 *
 *   <button data-rm-sidebar-open aria-controls="drawer">Menu</button>
 *   <aside id="drawer" data-rm-sidebar="left" hidden>…</aside>
 */
export function sidebar(target = "[data-rm-sidebar]", options = {}) {
  const panels = resolveElements(target);
  if (!panels.length) return () => {};

  const { trigger = "[data-rm-sidebar-open]", side = "left", duration = 380 } = options;
  const cleanups = [];

  for (const panel of panels) {
    const buttons = panel.id
      ? [...document.querySelectorAll(`${trigger}[aria-controls="${panel.id}"]`)]
      : [...document.querySelectorAll(trigger)];
    if (!buttons.length) continue;

    const edge = dataString(panel, "rmSidebar", side) === "right" ? "right" : "left";
    panel.classList.add("rm-sidebar", `is-${edge}`);
    panel.hidden = true;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.style.setProperty("--rm-sidebar-duration", `${prefersReducedMotion() ? 0 : duration}ms`);
    buttons.forEach((one) => one.setAttribute("aria-expanded", "false"));

    const scrim = document.createElement("div");
    scrim.className = "rm-sidebar-scrim";
    scrim.hidden = true;
    panel.before(scrim);

    let open = false;
    let returnTo = null;

    const show = () => {
      if (open) return;
      open = true;
      returnTo = document.activeElement;
      panel.hidden = false;
      scrim.hidden = false;
      requestAnimationFrame(() => { panel.classList.add("is-open"); scrim.classList.add("is-open"); });
      buttons.forEach((one) => one.setAttribute("aria-expanded", "true"));
      document.documentElement.classList.add("rm-command-locked");
      for (const sibling of document.body.children) {
        if (sibling !== panel && sibling !== scrim) sibling.inert = true;
      }
      (panel.querySelector(FOCUSABLE) ?? panel).focus?.({ preventScroll: true });
    };

    const close = () => {
      if (!open) return;
      open = false;
      panel.classList.remove("is-open");
      scrim.classList.remove("is-open");
      buttons.forEach((one) => one.setAttribute("aria-expanded", "false"));
      document.documentElement.classList.remove("rm-command-locked");
      for (const sibling of document.body.children) sibling.inert = false;
      const finish = () => { panel.hidden = true; scrim.hidden = true; };
      if (prefersReducedMotion()) finish();
      else setTimeout(finish, duration);
      if (returnTo instanceof HTMLElement) returnTo.focus({ preventScroll: true });
    };

    const onKey = (event) => {
      if (!open) return;
      if (event.key === "Escape") { close(); return; }
      if (event.key !== "Tab") return;
      const stops = [...panel.querySelectorAll(FOCUSABLE)];
      if (!stops.length) return;
      const first = stops[0];
      const last = stops[stops.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };

    const toggle = () => (open ? close() : show());
    buttons.forEach((one) => one.addEventListener("click", toggle));
    scrim.addEventListener("click", close);
    document.addEventListener("keydown", onKey);

    cleanups.push(() => {
      close();
      buttons.forEach((one) => one.removeEventListener("click", toggle));
      document.removeEventListener("keydown", onKey);
      scrim.remove();
      panel.classList.remove("rm-sidebar", "is-left", "is-right", "is-open");
      panel.hidden = false;
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A vertical rail with a marker that travels.
 *
 * The section-dot navigation of a long page. It rests on `aria-current`, which
 * means `scrollSpy` drives it for free and the rail never has to know what a
 * section is — the same trick `pill` uses, and the reason all three compose.
 */
export function rail(target = "[data-rm-rail]", options = {}) {
  const rails = resolveElements(target);
  if (!rails.length) return () => {};

  const { selector = "a", duration = 420 } = options;
  const cleanups = [];

  for (const bar of rails) {
    const links = [...bar.querySelectorAll(selector)];
    if (links.length < 2) continue;

    bar.classList.add("rm-rail");
    const marker = document.createElement("span");
    marker.className = "rm-rail-marker";
    marker.setAttribute("aria-hidden", "true");
    marker.style.setProperty("--rm-rail-duration", `${prefersReducedMotion() ? 0 : duration}ms`);
    bar.prepend(marker);

    links.forEach((link) => {
      const dot = document.createElement("i");
      dot.className = "rm-rail-dot";
      dot.setAttribute("aria-hidden", "true");
      link.prepend(dot);
    });

    const place = () => {
      const current = links.find((one) => one.getAttribute("aria-current")) ?? links[0];
      const barBox = bar.getBoundingClientRect();
      const box = current.getBoundingClientRect();
      marker.style.height = `${box.height}px`;
      marker.style.transform = `translateY(${box.top - barBox.top}px)`;
    };
    place();

    // aria-current is written by whatever is driving the page, so watch the
    // attribute rather than the scroll position: one observer, no second
    // opinion about which section you are in.
    const observer = new MutationObserver(place);
    links.forEach((one) => observer.observe(one, { attributes: true, attributeFilter: ["aria-current"] }));
    const resizeObserver = new ResizeObserver(place);
    resizeObserver.observe(bar);

    cleanups.push(() => {
      observer.disconnect();
      resizeObserver.disconnect();
      marker.remove();
      bar.querySelectorAll(".rm-rail-dot").forEach((dot) => dot.remove());
      bar.classList.remove("rm-rail");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A bottom bar with an indicator that follows.
 *
 * The phone tab bar. The indicator is measured against the current item and
 * moved with a transform, and the bar hides itself when you scroll down and
 * returns when you scroll up — but never while something inside it has focus,
 * so tabbing into the navigation cannot make it disappear.
 */
export function bottomNav(target = "[data-rm-bottom]", options = {}) {
  const bars = resolveElements(target);
  if (!bars.length) return () => {};

  const { selector = "a, button", hideOnScroll = true, duration = 380 } = options;
  const groups = [];

  for (const bar of bars) {
    const items = [...bar.querySelectorAll(selector)];
    if (items.length < 2) continue;

    bar.classList.add("rm-bottom");
    const pip = document.createElement("span");
    pip.className = "rm-bottom-pip";
    pip.setAttribute("aria-hidden", "true");
    pip.style.setProperty("--rm-bottom-duration", `${prefersReducedMotion() ? 0 : duration}ms`);
    bar.prepend(pip);

    const place = () => {
      const current = items.find((one) => one.getAttribute("aria-current")) ?? items[0];
      const barBox = bar.getBoundingClientRect();
      const box = current.getBoundingClientRect();
      pip.style.width = `${box.width}px`;
      pip.style.transform = `translateX(${box.left - barBox.left}px)`;
    };
    place();

    const observer = new MutationObserver(place);
    items.forEach((one) => observer.observe(one, { attributes: true, attributeFilter: ["aria-current"] }));
    const resizeObserver = new ResizeObserver(place);
    resizeObserver.observe(bar);
    items.forEach((one) => one.addEventListener("click", () => {
      items.forEach((other) => other.removeAttribute("aria-current"));
      one.setAttribute("aria-current", "true");
    }));

    groups.push({ bar, observer, resizeObserver, pip });
  }
  if (!groups.length) return () => {};

  let last = scrollY;
  const stopFrame = hideOnScroll
    ? onFrame(() => {
        const y = scrollY;
        const delta = y - last;
        if (Math.abs(delta) < 6) return;
        last = y;
        for (const { bar } of groups) {
          const hide = delta > 0 && y > dataNumber(bar, "rmHideAfter", 200) && !bar.contains(document.activeElement);
          bar.classList.toggle("is-hidden", hide && !prefersReducedMotion());
        }
      })
    : () => {};

  return () => {
    stopFrame();
    groups.forEach(({ bar, observer, resizeObserver, pip }) => {
      observer.disconnect();
      resizeObserver.disconnect();
      pip.remove();
      bar.classList.remove("rm-bottom", "is-hidden");
    });
  };
}

/**
 * A wide panel under a top-level item.
 *
 * With hover intent: it opens after a short delay and closes after a longer
 * one, so dragging the pointer diagonally toward the panel does not snap it
 * shut halfway — the single thing that makes most mega menus infuriating.
 *
 * Keyboard opens it on focus and closes it on Escape, and the trigger carries
 * `aria-expanded`, so it is a disclosure rather than a hover trick.
 *
 *   <nav data-rm-mega>
 *     <div data-rm-mega-item>
 *       <button data-rm-mega-trigger>Products</button>
 *       <div data-rm-mega-panel>…</div>
 *     </div>
 *   </nav>
 */
export function mega(target = "[data-rm-mega]", options = {}) {
  const navs = resolveElements(target);
  if (!navs.length) return () => {};

  const {
    item = "[data-rm-mega-item]",
    trigger = "[data-rm-mega-trigger]",
    panel = "[data-rm-mega-panel]",
    openDelay = 90,
    closeDelay = 260,
  } = options;
  const cleanups = [];
  let uid = 0;

  for (const nav of navs) {
    const groups = [...nav.querySelectorAll(item)];
    if (!groups.length) continue;
    nav.classList.add("rm-mega");

    for (const group of groups) {
      const button = group.querySelector(trigger);
      const board = group.querySelector(panel);
      if (!button || !board) continue;

      board.id = board.id || `rm-mega-${++uid}`;
      board.classList.add("rm-mega-panel");
      board.hidden = true;
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-controls", board.id);
      group.classList.add("rm-mega-item");

      let openTimer = 0;
      let closeTimer = 0;

      const show = () => {
        clearTimeout(closeTimer);
        openTimer = setTimeout(() => {
          board.hidden = false;
          requestAnimationFrame(() => group.classList.add("is-open"));
          button.setAttribute("aria-expanded", "true");
        }, openDelay);
      };

      const hide = () => {
        clearTimeout(openTimer);
        closeTimer = setTimeout(() => {
          group.classList.remove("is-open");
          button.setAttribute("aria-expanded", "false");
          const finish = () => { board.hidden = true; };
          if (prefersReducedMotion()) finish();
          else setTimeout(finish, 200);
        }, closeDelay);
      };

      const onKey = (event) => {
        if (event.key === "Escape") { clearTimeout(openTimer); hide(); button.focus(); }
      };

      group.addEventListener("pointerenter", show);
      group.addEventListener("pointerleave", hide);
      group.addEventListener("focusin", show);
      group.addEventListener("focusout", (event) => {
        if (!group.contains(event.relatedTarget)) hide();
      });
      group.addEventListener("keydown", onKey);
      button.addEventListener("click", (event) => {
        event.preventDefault();
        button.getAttribute("aria-expanded") === "true" ? hide() : show();
      });

      cleanups.push(() => {
        clearTimeout(openTimer);
        clearTimeout(closeTimer);
        group.classList.remove("rm-mega-item", "is-open");
        board.classList.remove("rm-mega-panel");
        board.hidden = false;
        button.removeAttribute("aria-expanded");
      });
    }

    cleanups.push(() => nav.classList.remove("rm-mega"));
  }

  return () => cleanups.forEach((stop) => stop());
}
