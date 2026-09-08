/**
 * The modern-phone shapes.
 *
 *   • island()      — a pill that swells to hold whatever is happening.
 *   • sheet()       — a panel you drag up from the bottom and flick away.
 *   • segmented()   — a segmented control with an indicator that travels.
 *   • frosted()     — a bar that frosts only once there is something behind it.
 *   • springModal() — a dialog that arrives on a spring and leaves the way it came.
 *   • actionSheet() — a stack of choices from the bottom edge.
 *   • toast()       — a notice that stacks, waits, and can be dismissed.
 *   • contextMenu() — a menu on right-click that still opens with a keyboard.
 *
 * These are the shapes people learned from their phone, and the reason they
 * feel expensive there is not the blur — it is that every one of them is
 * interruptible. You can catch a sheet mid-flight, drag it back, dismiss it
 * halfway. So none of these plays an animation you have to wait out: the sheet
 * follows your finger, the island resizes to its content rather than to a
 * fixed keyframe, and the modal can be closed while it is still arriving.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import { EASE, prefersReducedMotion, resolveElements } from "../core/motion.js";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * A pill that swells to hold whatever is happening.
 *
 * The trick everybody remembers is the shape change, and the trick that makes
 * it work is that the size is never hardcoded: the pill is measured against
 * its own content each time it changes, so a two-word status and a full row of
 * controls both get a shape that fits. A fixed set of keyframes gives you one
 * message that looks right.
 *
 * It is a live region, so the status is announced as well as shown.
 *
 *   <div data-rm-island><span data-rm-island-content>Ready</span></div>
 *   island.rmShow("<b>Uploading</b> 40%");
 */
export function island(target = "[data-rm-island]", options = {}) {
  const pills = resolveElements(target);
  if (!pills.length) return () => {};

  const { content = "[data-rm-island-content]", duration = 520, hold = 3200 } = options;
  const cleanups = [];

  for (const pill of pills) {
    const slot = pill.querySelector(content) ?? pill;
    pill.classList.add("rm-island");
    pill.setAttribute("aria-live", "polite");
    pill.style.setProperty("--rm-island-duration", `${prefersReducedMotion() ? 0 : duration}ms`);

    let timer = 0;
    const resize = () => {
      // Measure what is actually in there, then let the transition carry the
      // box to it. Nothing about the size is written by hand.
      const box = slot.getBoundingClientRect();
      pill.style.setProperty("--rm-island-width", `${Math.ceil(box.width)}px`);
      pill.style.setProperty("--rm-island-height", `${Math.ceil(box.height)}px`);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(slot);
    resize();

    pill.rmShow = (html, keep = hold) => {
      clearTimeout(timer);
      slot.innerHTML = html;
      pill.classList.add("is-open");
      resize();
      if (keep > 0) timer = setTimeout(() => pill.classList.remove("is-open"), keep);
    };
    pill.rmClose = () => {
      clearTimeout(timer);
      pill.classList.remove("is-open");
    };

    cleanups.push(() => {
      clearTimeout(timer);
      observer.disconnect();
      delete pill.rmShow;
      delete pill.rmClose;
      pill.classList.remove("rm-island", "is-open");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A panel you drag up from the bottom and flick away.
 *
 * The sheet follows the finger while you hold it, and on release it decides
 * from the distance AND the speed of the throw — a short fast flick dismisses,
 * a long slow drag that stops halfway springs back. Distance alone is the
 * version that refuses to close when you clearly meant it to.
 *
 * It is a dialog: focus moves in and is trapped, Escape closes, focus returns,
 * the page behind is inert.
 *
 *   <button data-rm-sheet-open aria-controls="s">Open</button>
 *   <div id="s" data-rm-sheet hidden>…</div>
 */
export function sheet(target = "[data-rm-sheet]", options = {}) {
  const panels = resolveElements(target);
  if (!panels.length) return () => {};

  const { trigger = "[data-rm-sheet-open]", duration = 420, dismissAt = 0.4, flick = 0.6 } = options;
  const cleanups = [];

  for (const panel of panels) {
    const buttons = panel.id
      ? [...document.querySelectorAll(`${trigger}[aria-controls="${panel.id}"]`)]
      : [...document.querySelectorAll(trigger)];
    if (!buttons.length) continue;

    panel.classList.add("rm-sheet");
    panel.hidden = true;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.style.setProperty("--rm-sheet-duration", `${prefersReducedMotion() ? 0 : duration}ms`);

    const grip = document.createElement("div");
    grip.className = "rm-sheet-grip";
    grip.setAttribute("aria-hidden", "true");
    panel.prepend(grip);

    const scrim = document.createElement("div");
    scrim.className = "rm-sheet-scrim";
    scrim.hidden = true;
    panel.before(scrim);

    let open = false;
    let returnTo = null;
    let dragging = false;
    let startY = 0;
    let travelled = 0;
    let lastY = 0;
    let lastAt = 0;
    let speed = 0;

    const show = () => {
      if (open) return;
      open = true;
      returnTo = document.activeElement;
      panel.hidden = false;
      scrim.hidden = false;
      requestAnimationFrame(() => { panel.classList.add("is-open"); scrim.classList.add("is-open"); });
      buttons.forEach((one) => one.setAttribute("aria-expanded", "true"));
      document.documentElement.classList.add("rm-sheet-locked");
      for (const sibling of document.body.children) {
        if (sibling !== panel && sibling !== scrim) sibling.inert = true;
      }
      (panel.querySelector(FOCUSABLE) ?? panel).focus?.({ preventScroll: true });
    };

    const close = () => {
      if (!open) return;
      open = false;
      panel.style.transform = "";
      panel.classList.remove("is-open");
      scrim.classList.remove("is-open");
      buttons.forEach((one) => one.setAttribute("aria-expanded", "false"));
      document.documentElement.classList.remove("rm-sheet-locked");
      for (const sibling of document.body.children) sibling.inert = false;
      const finish = () => { panel.hidden = true; scrim.hidden = true; };
      if (prefersReducedMotion()) finish();
      else setTimeout(finish, duration);
      if (returnTo instanceof HTMLElement) returnTo.focus({ preventScroll: true });
    };

    const onDown = (event) => {
      dragging = true;
      startY = event.clientY;
      lastY = event.clientY;
      lastAt = performance.now();
      speed = 0;
      panel.classList.add("is-dragging");
      grip.setPointerCapture?.(event.pointerId);
    };
    const onMove = (event) => {
      if (!dragging) return;
      travelled = Math.max(0, event.clientY - startY);
      const now = performance.now();
      // Pixels per millisecond, which is what decides a flick from a drag.
      if (now > lastAt) speed = (event.clientY - lastY) / (now - lastAt);
      lastY = event.clientY;
      lastAt = now;
      panel.style.transform = `translateY(${travelled}px)`;
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      panel.classList.remove("is-dragging");
      const height = panel.getBoundingClientRect().height || 1;
      // Distance OR speed: a short fast flick should dismiss, and a slow drag
      // that stopped halfway should not.
      if (travelled / height > dismissAt || speed > flick) close();
      else panel.style.transform = "";
      travelled = 0;
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
    grip.addEventListener("pointerdown", onDown);
    grip.addEventListener("pointermove", onMove);
    grip.addEventListener("pointerup", onUp);
    grip.addEventListener("pointercancel", onUp);
    document.addEventListener("keydown", onKey);

    cleanups.push(() => {
      close();
      buttons.forEach((one) => one.removeEventListener("click", toggle));
      document.removeEventListener("keydown", onKey);
      grip.remove();
      scrim.remove();
      panel.classList.remove("rm-sheet", "is-open", "is-dragging");
      panel.hidden = false;
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A segmented control with an indicator that travels.
 *
 * Real radio inputs underneath, so it is one control in the tab order, the
 * arrow keys move between options for free, and it submits with the form. The
 * version built from buttons has to reimplement all three and usually
 * reimplements none.
 *
 *   <div data-rm-segmented>
 *     <label><input type="radio" name="view" checked> Grid</label>
 *     <label><input type="radio" name="view"> List</label>
 *   </div>
 */
export function segmented(target = "[data-rm-segmented]", options = {}) {
  const groups = resolveElements(target);
  if (!groups.length) return () => {};

  const { duration = 380 } = options;
  const cleanups = [];

  for (const group of groups) {
    const inputs = [...group.querySelectorAll('input[type="radio"]')];
    if (inputs.length < 2) continue;

    group.classList.add("rm-segmented");
    group.style.setProperty("--rm-segmented-duration", `${prefersReducedMotion() ? 0 : duration}ms`);
    if (!group.hasAttribute("role")) group.setAttribute("role", "radiogroup");

    const pip = document.createElement("span");
    pip.className = "rm-segmented-pip";
    pip.setAttribute("aria-hidden", "true");
    group.prepend(pip);

    const place = () => {
      const chosen = inputs.find((one) => one.checked) ?? inputs[0];
      const label = chosen.closest("label") ?? chosen;
      const groupBox = group.getBoundingClientRect();
      const box = label.getBoundingClientRect();
      pip.style.width = `${box.width}px`;
      pip.style.height = `${box.height}px`;
      pip.style.transform = `translate(${box.left - groupBox.left}px, ${box.top - groupBox.top}px)`;
      inputs.forEach((one) => (one.closest("label") ?? one).classList.toggle("is-current", one.checked));
    };
    place();

    const onChange = () => place();
    inputs.forEach((one) => one.addEventListener("change", onChange));
    const resizeObserver = new ResizeObserver(place);
    resizeObserver.observe(group);
    document.fonts?.ready.then(place).catch(() => {});

    cleanups.push(() => {
      inputs.forEach((one) => one.removeEventListener("change", onChange));
      resizeObserver.disconnect();
      pip.remove();
      group.classList.remove("rm-segmented");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A bar that frosts only once there is something behind it.
 *
 * At the top of the page it is transparent and weightless; the moment content
 * has scrolled under it, the blur and the hairline arrive. Frosting a bar that
 * has nothing behind it is the commonest way this effect looks cheap — you get
 * a grey stripe over a plain background for no reason.
 */
export function frosted(target = "[data-rm-frosted]", options = {}) {
  const bars = resolveElements(target);
  if (!bars.length) return () => {};

  const { after = 12, blur = 16 } = options;

  for (const bar of bars) {
    bar.classList.add("rm-frosted");
    bar.style.setProperty("--rm-frosted-blur", `${blur}px`);
  }

  // A sentinel above the bar: when it leaves, there is something underneath.
  const mark = document.createElement("div");
  mark.className = "rm-frosted-mark";
  mark.setAttribute("aria-hidden", "true");
  mark.style.height = `${after}px`;
  document.body.prepend(mark);

  const observer = new IntersectionObserver(([entry]) => {
    bars.forEach((bar) => bar.classList.toggle("is-frosted", !entry.isIntersecting));
  });
  observer.observe(mark);

  return () => {
    observer.disconnect();
    mark.remove();
    bars.forEach((bar) => bar.classList.remove("rm-frosted", "is-frosted"));
  };
}

/**
 * A dialog that arrives on a spring and leaves the way it came.
 *
 * Built on the real `<dialog>` element, so the browser supplies the top layer,
 * the backdrop, the focus trap, Escape and the return of focus — all four of
 * which every hand-rolled modal has to write, and most write wrong. This adds
 * the movement and nothing else.
 *
 *   <button data-rm-modal-open aria-controls="m">Open</button>
 *   <dialog id="m" data-rm-modal>…</dialog>
 */
export function springModal(target = "[data-rm-modal]", options = {}) {
  const dialogs = resolveElements(target);
  if (!dialogs.length) return () => {};

  const { trigger = "[data-rm-modal-open]", close = "[data-rm-modal-close]", duration = 480 } = options;
  const cleanups = [];

  for (const dialog of dialogs) {
    if (typeof dialog.showModal !== "function") continue;

    const buttons = dialog.id
      ? [...document.querySelectorAll(`${trigger}[aria-controls="${dialog.id}"]`)]
      : [...document.querySelectorAll(trigger)];

    dialog.classList.add("rm-modal");
    dialog.style.setProperty("--rm-modal-duration", `${prefersReducedMotion() ? 0 : duration}ms`);

    const open = () => {
      dialog.showModal();
      if (prefersReducedMotion()) return;
      dialog.animate(
        [
          { opacity: 0, transform: "translateY(18px) scale(0.96)" },
          { opacity: 1, transform: "translateY(0) scale(1)" },
        ],
        { duration, easing: EASE.spring },
      );
    };

    const shut = () => {
      if (prefersReducedMotion()) { dialog.close(); return; }
      dialog
        .animate(
          [
            { opacity: 1, transform: "translateY(0) scale(1)" },
            { opacity: 0, transform: "translateY(12px) scale(0.97)" },
          ],
          { duration: duration * 0.55, easing: EASE.out },
        )
        .finished.then(() => dialog.close())
        .catch(() => dialog.close());
    };

    buttons.forEach((one) => one.addEventListener("click", open));
    const closers = [...dialog.querySelectorAll(close)];
    closers.forEach((one) => one.addEventListener("click", shut));
    // A click on the backdrop is a click on the dialog itself, and nothing else.
    const onBackdrop = (event) => { if (event.target === dialog) shut(); };
    dialog.addEventListener("click", onBackdrop);

    cleanups.push(() => {
      buttons.forEach((one) => one.removeEventListener("click", open));
      closers.forEach((one) => one.removeEventListener("click", shut));
      dialog.removeEventListener("click", onBackdrop);
      dialog.classList.remove("rm-modal");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A stack of choices from the bottom edge.
 *
 * The phone's action sheet: options stacked, the destructive one apart, cancel
 * at the bottom in its own group. Arrow keys move between them and Escape
 * cancels, so it is a menu rather than a list of buttons that happens to be at
 * the bottom of the screen.
 */
export function actionSheet(target = "[data-rm-actions]", options = {}) {
  const sheets = resolveElements(target);
  if (!sheets.length) return () => {};

  const { trigger = "[data-rm-actions-open]", item = "button, a[href]", duration = 380 } = options;
  const cleanups = [];

  for (const panel of sheets) {
    const buttons = panel.id
      ? [...document.querySelectorAll(`${trigger}[aria-controls="${panel.id}"]`)]
      : [...document.querySelectorAll(trigger)];
    const items = [...panel.querySelectorAll(item)];
    if (!buttons.length || !items.length) continue;

    panel.classList.add("rm-actions");
    panel.hidden = true;
    panel.setAttribute("role", "menu");
    panel.style.setProperty("--rm-actions-duration", `${prefersReducedMotion() ? 0 : duration}ms`);
    items.forEach((one, index) => {
      one.setAttribute("role", "menuitem");
      one.style.setProperty("--rm-actions-index", String(index));
    });

    const scrim = document.createElement("div");
    scrim.className = "rm-actions-scrim";
    scrim.hidden = true;
    panel.before(scrim);

    let open = false;
    let at = 0;
    let returnTo = null;

    const show = () => {
      if (open) return;
      open = true;
      returnTo = document.activeElement;
      panel.hidden = false;
      scrim.hidden = false;
      requestAnimationFrame(() => { panel.classList.add("is-open"); scrim.classList.add("is-open"); });
      at = 0;
      items[0].focus();
    };
    const hide = () => {
      if (!open) return;
      open = false;
      panel.classList.remove("is-open");
      scrim.classList.remove("is-open");
      const finish = () => { panel.hidden = true; scrim.hidden = true; };
      if (prefersReducedMotion()) finish();
      else setTimeout(finish, duration);
      if (returnTo instanceof HTMLElement) returnTo.focus({ preventScroll: true });
    };

    const onKey = (event) => {
      if (!open) return;
      if (event.key === "Escape") { event.preventDefault(); hide(); return; }
      const moves = { ArrowDown: 1, ArrowUp: -1 };
      if (!(event.key in moves)) return;
      event.preventDefault();
      at = (at + moves[event.key] + items.length) % items.length;
      items[at].focus();
    };

    buttons.forEach((one) => one.addEventListener("click", show));
    scrim.addEventListener("click", hide);
    items.forEach((one) => one.addEventListener("click", hide));
    document.addEventListener("keydown", onKey);

    cleanups.push(() => {
      hide();
      buttons.forEach((one) => one.removeEventListener("click", show));
      items.forEach((one) => one.removeEventListener("click", hide));
      document.removeEventListener("keydown", onKey);
      scrim.remove();
      panel.classList.remove("rm-actions", "is-open");
      panel.hidden = false;
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A notice that stacks, waits, and can be dismissed.
 *
 * Returns a `push()` rather than reading the DOM, because a toast is something
 * your code decides to say, not something the markup already contains. They
 * stack from the newest, each carries its own timer, and hovering the stack
 * pauses every timer in it — otherwise the one you are reading disappears
 * while you read it.
 *
 * The region is `aria-live`, so a toast is heard as well as seen.
 */
export function toast(options = {}) {
  const { life = 4200, max = 4, position = "bottom-right" } = options;

  const stack = document.createElement("div");
  stack.className = `rm-toasts is-${position}`;
  stack.setAttribute("role", "status");
  stack.setAttribute("aria-live", "polite");
  document.body.appendChild(stack);

  const timers = new Map();
  let paused = false;

  const drop = (note) => {
    clearTimeout(timers.get(note));
    timers.delete(note);
    note.classList.remove("is-in");
    setTimeout(() => note.remove(), prefersReducedMotion() ? 0 : 260);
  };

  const arm = (note, keep) => {
    if (paused || keep <= 0) return;
    timers.set(note, setTimeout(() => drop(note), keep));
  };

  stack.addEventListener("pointerenter", () => {
    paused = true;
    timers.forEach((timer) => clearTimeout(timer));
  });
  stack.addEventListener("pointerleave", () => {
    paused = false;
    [...stack.children].forEach((note) => arm(note, life));
  });

  /** @param {string} message @param {{ keep?: number, kind?: string }} how */
  const push = (message, how = {}) => {
    const note = document.createElement("div");
    note.className = `rm-toast is-${how.kind ?? "plain"}`;
    note.innerHTML = `<span>${message}</span>`;

    const close = document.createElement("button");
    close.type = "button";
    close.className = "rm-toast-close";
    close.setAttribute("aria-label", "Dismiss");
    close.textContent = "×";
    close.addEventListener("click", () => drop(note));
    note.appendChild(close);

    stack.prepend(note);
    requestAnimationFrame(() => note.classList.add("is-in"));
    arm(note, how.keep ?? life);

    // Oldest first out, so the stack never grows past what fits.
    while (stack.children.length > max) drop(stack.lastElementChild);
    return note;
  };

  push.stop = () => {
    timers.forEach((timer) => clearTimeout(timer));
    stack.remove();
  };
  return push;
}

/**
 * A menu on right-click that still opens with a keyboard.
 *
 * The context menu everybody builds forgets that a context menu has a keyboard
 * opening — the Menu key, and Shift-F10 — and that the browser's own menu
 * should come back when you hold Shift. Both are here, along with arrow keys,
 * Escape, and a menu that flips when it would open past the edge of the
 * window.
 *
 *   <div data-rm-context aria-controls="menu">…</div>
 *   <div id="menu" data-rm-context-menu hidden>…</div>
 */
export function contextMenu(target = "[data-rm-context]", options = {}) {
  const zones = resolveElements(target);
  if (!zones.length) return () => {};

  const { menu = "[data-rm-context-menu]", item = "button, a[href]" } = options;
  const cleanups = [];

  for (const zone of zones) {
    const panel = zone.getAttribute("aria-controls")
      ? document.getElementById(zone.getAttribute("aria-controls"))
      : document.querySelector(menu);
    if (!panel) continue;

    const items = [...panel.querySelectorAll(item)];
    if (!items.length) continue;

    zone.classList.add("rm-context");
    panel.classList.add("rm-context-menu");
    panel.hidden = true;
    panel.setAttribute("role", "menu");

    /*
     * Icons come out of the markup, never out of a script.
     *
     * An item can carry `data-rm-icon` holding either a character — an emoji, a
     * dingbat, anything the page's font can draw — or the id of an inline
     * <svg><symbol>, written as "#trash". The first is a span, the second a
     * <use>, and both are marked aria-hidden with the item's own text left to
     * do the announcing. That is the whole point: an icon that is the label is
     * an item a screen reader reads as nothing at all.
     *
     * Doing it this way rather than shipping an icon set means the page keeps
     * whatever icons it already has, and the kit stays at zero dependencies.
     */
    const drawn = [];
    items.forEach((one) => {
      one.setAttribute("role", "menuitem");
      const icon = one.getAttribute("data-rm-icon");
      if (!icon) return;

      let mark;
      if (icon.startsWith("#")) {
        mark = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        mark.setAttribute("class", "rm-context-icon");
        mark.setAttribute("viewBox", one.getAttribute("data-rm-icon-box") ?? "0 0 24 24");
        const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
        use.setAttribute("href", icon);
        mark.appendChild(use);
      } else {
        mark = document.createElement("span");
        mark.className = "rm-context-icon";
        mark.textContent = icon;
      }
      mark.setAttribute("aria-hidden", "true");
      one.prepend(mark);
      drawn.push(mark);
    });

    let at = 0;
    let returnTo = null;

    const openAt = (x, y) => {
      returnTo = document.activeElement;
      panel.hidden = false;
      panel.classList.add("is-open");
      const box = panel.getBoundingClientRect();
      // Flip rather than overflow: a menu you cannot reach is worse than one
      // on the other side of the pointer.
      const left = x + box.width > innerWidth ? x - box.width : x;
      const top = y + box.height > innerHeight ? y - box.height : y;
      panel.style.left = `${Math.max(8, left)}px`;
      panel.style.top = `${Math.max(8, top)}px`;
      at = 0;
      items[0].focus();
    };

    const hide = () => {
      if (panel.hidden) return;
      panel.classList.remove("is-open");
      panel.hidden = true;
      if (returnTo instanceof HTMLElement) returnTo.focus({ preventScroll: true });
    };

    const onContext = (event) => {
      // Shift gives the browser's own menu back, which is the escape hatch.
      if (event.shiftKey) return;
      event.preventDefault();
      openAt(event.clientX, event.clientY);
    };

    const onZoneKey = (event) => {
      const wanted = event.key === "ContextMenu" || (event.shiftKey && event.key === "F10");
      if (!wanted) return;
      event.preventDefault();
      const box = zone.getBoundingClientRect();
      openAt(box.left + 12, box.top + 12);
    };

    const onKey = (event) => {
      if (panel.hidden) return;
      if (event.key === "Escape") { event.preventDefault(); hide(); return; }
      const moves = { ArrowDown: 1, ArrowUp: -1 };
      if (!(event.key in moves)) return;
      event.preventDefault();
      at = (at + moves[event.key] + items.length) % items.length;
      items[at].focus();
    };

    zone.addEventListener("contextmenu", onContext);
    zone.addEventListener("keydown", onZoneKey);
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", (event) => {
      if (!panel.hidden && !panel.contains(event.target)) hide();
    });
    items.forEach((one) => one.addEventListener("click", hide));

    cleanups.push(() => {
      hide();
      drawn.forEach((mark) => mark.remove());
      zone.removeEventListener("contextmenu", onContext);
      zone.removeEventListener("keydown", onZoneKey);
      document.removeEventListener("keydown", onKey);
      zone.classList.remove("rm-context");
      panel.classList.remove("rm-context-menu", "is-open");
      panel.hidden = false;
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

