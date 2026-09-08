/**
 * Page chrome — the parts of an interface that are not content.
 *
 *   • scrollbar() — a styled scrollbar that still behaves like a scrollbar.
 *   • dropdown()  — a menu button with real keyboard semantics.
 *   • tooltip()   — a hint that is announced as well as shown.
 *   • toggle()    — a switch that is a real checkbox underneath.
 *
 * Everything here is the kind of component that is usually replaced rather
 * than decorated: a div pretending to be a scrollbar, a div pretending to be a
 * menu, a div pretending to be a checkbox. Each of those throws away keyboard
 * support, assistive-technology support and, in the scrollbar's case, the
 * ability to scroll. So none of these replace anything — they style what is
 * already there, or they wire the real ARIA pattern onto real elements.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import { dataString, prefersReducedMotion, resolveElements } from "../core/motion.js";

const STYLES = ["thin", "pill", "accent", "ghost", "inset"];

/**
 * A styled scrollbar that still behaves like a scrollbar.
 *
 * This applies a class and nothing else. The styling itself is CSS —
 * `scrollbar-width` and `scrollbar-color` where they are supported, and
 * `::-webkit-scrollbar` where they are not — because a scrollbar cannot be
 * styled from JavaScript and, far more importantly, should not be rebuilt in
 * JavaScript. The div-with-a-drag-handle version everyone ships loses the
 * mouse wheel's page-jump, the keyboard, the right-click menu, momentum and
 * every assistive technology that knows what a scrollbar is.
 *
 * Five looks ship: thin, pill, accent, ghost (appears on hover) and inset.
 *
 *   <body data-rm-scrollbar="accent">
 *   <div class="panel" data-rm-scrollbar="ghost">…</div>
 */
export function scrollbar(target = "[data-rm-scrollbar]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { style = "thin", color, track } = options;
  const applied = [];

  for (const element of elements) {
    const want = dataString(element, "rmScrollbar", style);
    const name = STYLES.includes(want) ? want : style;

    // The page's scrollbar belongs to the root element, not to <body>, so a
    // request on the body is redirected rather than silently doing nothing.
    const host = element === document.body ? document.documentElement : element;
    host.classList.add("rm-scrollbar", `is-${name}`);
    if (color) host.style.setProperty("--rm-scrollbar-color", color);
    if (track) host.style.setProperty("--rm-scrollbar-track", track);
    applied.push({ host, name });
  }

  return () => applied.forEach(({ host, name }) => host.classList.remove("rm-scrollbar", `is-${name}`));
}

/**
 * A menu button.
 *
 * The full pattern, because a dropdown is where a homemade one hurts most:
 * `aria-haspopup` and `aria-expanded` on the button, `role="menu"` on the
 * list, arrow keys and Home and End moving a roving focus through the items,
 * Escape closing and returning focus, a click anywhere else closing it, and
 * the menu flipping above the button when there is no room below.
 *
 *   <div data-rm-dropdown>
 *     <button data-rm-dropdown-button>Sort</button>
 *     <div data-rm-dropdown-menu>
 *       <button>Newest</button><button>Oldest</button>
 *     </div>
 *   </div>
 */
export function dropdown(target = "[data-rm-dropdown]", options = {}) {
  const groups = resolveElements(target);
  if (!groups.length) return () => {};

  const {
    button = "[data-rm-dropdown-button]",
    menu = "[data-rm-dropdown-menu]",
    item = "button, a[href], [role='menuitem']",
    duration = 220,
  } = options;
  const cleanups = [];
  let uid = 0;

  for (const group of groups) {
    const trigger = group.querySelector(button);
    const panel = group.querySelector(menu);
    if (!trigger || !panel) continue;

    const items = [...panel.querySelectorAll(item)];
    if (!items.length) continue;

    const id = `rm-menu-${++uid}`;
    group.classList.add("rm-dropdown");
    panel.classList.add("rm-dropdown-menu");
    panel.id = panel.id || id;
    panel.setAttribute("role", "menu");
    panel.hidden = true;
    trigger.setAttribute("aria-haspopup", "true");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", panel.id);
    group.style.setProperty("--rm-dropdown-duration", `${prefersReducedMotion() ? 0 : duration}ms`);

    items.forEach((one, index) => {
      one.setAttribute("role", "menuitem");
      one.tabIndex = index === 0 ? 0 : -1;
    });

    let open = false;
    let at = 0;

    const focusItem = (index) => {
      at = (index + items.length) % items.length;
      items.forEach((one, i) => { one.tabIndex = i === at ? 0 : -1; });
      items[at].focus();
    };

    const place = () => {
      // Flip above when there is not enough room below. Measured against the
      // real viewport rather than assumed, so a button near the fold works.
      const box = trigger.getBoundingClientRect();
      const room = innerHeight - box.bottom;
      group.classList.toggle("is-above", room < panel.offsetHeight + 16 && box.top > room);
    };

    const show = () => {
      if (open) return;
      open = true;
      panel.hidden = false;
      place();
      requestAnimationFrame(() => group.classList.add("is-open"));
      trigger.setAttribute("aria-expanded", "true");
      focusItem(0);
    };

    const close = ({ restore = true } = {}) => {
      if (!open) return;
      open = false;
      group.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
      const finish = () => { panel.hidden = true; };
      if (prefersReducedMotion()) finish();
      else setTimeout(finish, duration);
      if (restore) trigger.focus({ preventScroll: true });
    };

    const onTrigger = () => (open ? close() : show());

    const onKey = (event) => {
      if (!open) {
        if (event.key !== "ArrowDown" && event.key !== "Enter" && event.key !== " ") return;
        if (document.activeElement !== trigger) return;
        event.preventDefault();
        show();
        return;
      }
      const moves = { ArrowDown: 1, ArrowUp: -1 };
      if (event.key in moves) { event.preventDefault(); focusItem(at + moves[event.key]); return; }
      if (event.key === "Home") { event.preventDefault(); focusItem(0); return; }
      if (event.key === "End") { event.preventDefault(); focusItem(items.length - 1); return; }
      if (event.key === "Escape") { event.preventDefault(); close(); return; }
      if (event.key === "Tab") close({ restore: false });
    };

    const onOutside = (event) => {
      if (!open || group.contains(event.target)) return;
      close({ restore: false });
    };

    trigger.addEventListener("click", onTrigger);
    group.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onOutside);
    addEventListener("resize", place);
    // A choice closes the menu, which is what a menu is for.
    items.forEach((one) => one.addEventListener("click", () => close()));

    cleanups.push(() => {
      close({ restore: false });
      trigger.removeEventListener("click", onTrigger);
      group.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onOutside);
      removeEventListener("resize", place);
      group.classList.remove("rm-dropdown", "is-open", "is-above");
      panel.classList.remove("rm-dropdown-menu");
      panel.hidden = false;
      trigger.removeAttribute("aria-haspopup");
      trigger.removeAttribute("aria-expanded");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A hint that is announced as well as shown.
 *
 * The label lives in a `role="tooltip"` element wired up with
 * `aria-describedby`, so a screen reader reads it too — a title-attribute
 * replacement that only appears on hover is invisible to everyone who is not
 * using a mouse, which is the entire point of a tooltip.
 *
 * It also shows on focus and hides on Escape, both of which the browser's own
 * `title` does and almost every replacement forgets.
 *
 *   <button data-rm-tooltip="Copies to your clipboard">Copy</button>
 */
export function tooltip(target = "[data-rm-tooltip]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { placement = "top", delay = 120 } = options;
  const cleanups = [];
  let uid = 0;

  for (const element of elements) {
    const text = dataString(element, "rmTooltip", "");
    if (!text) continue;

    const bubble = document.createElement("span");
    bubble.className = "rm-tooltip";
    bubble.id = `rm-tip-${++uid}`;
    bubble.setAttribute("role", "tooltip");
    bubble.textContent = text;
    bubble.hidden = true;

    element.classList.add("rm-tooltip-host", `is-${dataString(element, "rmPlacement", placement)}`);
    element.setAttribute("aria-describedby", bubble.id);
    element.appendChild(bubble);

    let timer = 0;
    const show = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        bubble.hidden = false;
        requestAnimationFrame(() => bubble.classList.add("is-open"));
      }, delay);
    };
    const hide = () => {
      clearTimeout(timer);
      bubble.classList.remove("is-open");
      bubble.hidden = true;
    };
    const onKey = (event) => { if (event.key === "Escape") hide(); };

    element.addEventListener("pointerenter", show);
    element.addEventListener("pointerleave", hide);
    element.addEventListener("focus", show);
    element.addEventListener("blur", hide);
    element.addEventListener("keydown", onKey);

    cleanups.push(() => {
      clearTimeout(timer);
      element.removeEventListener("pointerenter", show);
      element.removeEventListener("pointerleave", hide);
      element.removeEventListener("focus", show);
      element.removeEventListener("blur", hide);
      element.removeEventListener("keydown", onKey);
      bubble.remove();
      element.classList.remove("rm-tooltip-host");
      element.removeAttribute("aria-describedby");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A switch that is a real checkbox underneath.
 *
 * The input is still there, still focusable, still submitted with the form,
 * still announced as a checkbox — it is only visually replaced. Every switch
 * built from a div loses all four, and usually gains a `click` handler that
 * does not fire on Space.
 *
 *   <label data-rm-toggle><input type="checkbox"> Dark mode</label>
 */
export function toggle(target = "[data-rm-toggle]", options = {}) {
  const labels = resolveElements(target);
  if (!labels.length) return () => {};

  const { duration = 260 } = options;
  const cleanups = [];

  for (const label of labels) {
    const input = label.querySelector('input[type="checkbox"]');
    if (!input) continue;

    label.classList.add("rm-toggle");
    label.style.setProperty("--rm-toggle-duration", `${prefersReducedMotion() ? 0 : duration}ms`);
    input.classList.add("rm-toggle-input");

    const track = document.createElement("span");
    track.className = "rm-toggle-track";
    track.setAttribute("aria-hidden", "true");
    track.innerHTML = '<i class="rm-toggle-knob"></i>';
    input.after(track);

    cleanups.push(() => {
      track.remove();
      input.classList.remove("rm-toggle-input");
      label.classList.remove("rm-toggle");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}
