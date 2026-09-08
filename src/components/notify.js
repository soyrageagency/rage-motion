/**
 * Notifications — twenty ways to tell someone something.
 *
 *   • toastStack()   — toasts that stack, collapse and expand.
 *   • snackbar()     — one message at a time, with an action.
 *   • banner()       — a page-wide notice that pushes nothing.
 *   • inlineAlert()  — a message that belongs to the thing it is about.
 *   • pushCard()     — an arriving notification, phone style.
 *   • bell()         — a bell that rings when the count changes.
 *   • counter()      — an unread count that rolls.
 *   • presenceDot()  — someone is here, and it says so.
 *   • ribbonAlert()  — a corner ribbon for a status.
 *   • statusBar()    — a strip that changes colour and says why.
 *   • progressToast() — a toast that is also a progress bar.
 *   • undoBar()      — the one notification that has a job to do.
 *   • confirmSheet() — a decision, asked properly.
 *   • countdownNote() — a notice that expires, visibly.
 *   • stackedAvatars() — who is in this, and how many more.
 *   • typingDots()   — someone is writing.
 *   • liveTicker()   — events arriving in order.
 *   • pillAlert()    — a small, quiet, dismissible thing.
 *   • cornerToast()  — a toast in a corner you choose.
 *   • soundBadge()   — a badge that pulses when it changes.
 *
 * A notification is an interruption, so every one of these has to answer the
 * same question: what happens to somebody who cannot see it? The answer here
 * is always the same — a real live region, politeness chosen by urgency
 * (`polite` for news, `assertive` only for something going wrong), a real
 * button to dismiss rather than a click handler on a div, and focus left
 * exactly where the visitor put it. A toast that steals focus interrupts
 * typing; a toast that announces nothing is a toast half your visitors never
 * receive.
 *
 * Nothing here animates a height. Stacks move by transform, so a toast
 * arriving never reflows the page behind it.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import {
  clamp, dataNumber, dataString, EASE, prefersReducedMotion, resolveElements, whileVisible,
} from "../core/motion.js";

/** A live region that is created once and reused. */
function speaker(holder, tone = "polite") {
  const said = document.createElement("p");
  said.className = "rm-notify-live";
  said.setAttribute("aria-live", tone);
  said.setAttribute("role", tone === "assertive" ? "alert" : "status");
  holder.appendChild(said);
  return said;
}

/**
 * Toasts that stack, collapse and expand.
 *
 * Newer toasts sit in front and the ones behind peek out, scaled and offset —
 * the pile is a stack of real elements at their real positions with a
 * transform each, so nothing reflows as they arrive and leave. Hovering or
 * focusing the pile fans it out so every message can be read and dismissed.
 *
 * Each toast is a `role="status"` in a polite live region: they are announced
 * in the order they arrive without interrupting anything.
 *
 *   <div data-rm-toast-stack></div>
 *   stack.rmPush("Saved", { action: "Undo", onAction: undo });
 */
export function toastStack(target = "[data-rm-toast-stack]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { life = 4200, max = 4, offset = 12, shrink = 0.05 } = options;
  const cleanups = [];

  for (const holder of holders) {
    holder.classList.add("rm-toast-stack");
    holder.setAttribute("aria-live", "polite");
    holder.setAttribute("role", "region");
    holder.setAttribute("aria-label", dataString(holder, "rmLabel", "Notifications"));

    const live = [];
    const place = () => {
      live.forEach((toast, i) => {
        toast.style.setProperty("--rm-toast-index", String(i));
        toast.style.transform = `translateY(${-i * offset}px) scale(${1 - i * shrink})`;
        toast.style.zIndex = String(100 - i);
        toast.style.opacity = i < max ? "1" : "0";
        toast.inert = i > 0;
      });
    };

    const drop = (toast) => {
      const at = live.indexOf(toast);
      if (at < 0) return;
      live.splice(at, 1);
      const done = () => { toast.remove(); place(); };
      if (prefersReducedMotion()) done();
      else {
        toast.animate(
          [{ opacity: 1, transform: toast.style.transform }, { opacity: 0, transform: "translateY(14px) scale(0.94)" }],
          { duration: 240, easing: EASE.inOut, fill: "forwards" },
        ).finished.then(done, done);
      }
    };

    holder.rmPush = (message, { action, onAction, tone = "polite", timeout = life } = {}) => {
      const toast = document.createElement("div");
      toast.className = "rm-toast-stack-item";
      toast.setAttribute("role", tone === "assertive" ? "alert" : "status");

      const text = document.createElement("p");
      text.textContent = message;
      toast.appendChild(text);

      if (action) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "rm-toast-stack-action";
        button.textContent = action;
        button.addEventListener("click", () => { onAction?.(); drop(toast); });
        toast.appendChild(button);
      }

      const shut = document.createElement("button");
      shut.type = "button";
      shut.className = "rm-toast-stack-close";
      shut.setAttribute("aria-label", "Dismiss");
      shut.textContent = "×";
      shut.addEventListener("click", () => drop(toast));
      toast.appendChild(shut);

      holder.prepend(toast);
      live.unshift(toast);
      place();

      if (!prefersReducedMotion()) {
        toast.animate(
          [{ opacity: 0, transform: "translateY(18px) scale(0.96)" }, { opacity: 1, transform: toast.style.transform }],
          { duration: 320, easing: EASE.out },
        );
      }
      if (timeout > 0) setTimeout(() => drop(toast), timeout);
      return toast;
    };

    const fan = (on) => holder.classList.toggle("is-fanned", on);
    const onEnter = () => fan(true);
    const onLeave = () => fan(false);
    holder.addEventListener("pointerenter", onEnter);
    holder.addEventListener("pointerleave", onLeave);
    holder.addEventListener("focusin", onEnter);
    holder.addEventListener("focusout", onLeave);

    cleanups.push(() => {
      holder.removeEventListener("pointerenter", onEnter);
      holder.removeEventListener("pointerleave", onLeave);
      holder.removeEventListener("focusin", onEnter);
      holder.removeEventListener("focusout", onLeave);
      delete holder.rmPush;
      live.forEach((toast) => toast.remove());
      holder.classList.remove("rm-toast-stack", "is-fanned");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * One message at a time, with an action.
 *
 * The snackbar is the discipline the toast pile lacks: one message, replaced
 * rather than queued, so a burst of events cannot bury the screen. The action
 * is a real button inside the live region, so it is both announced and
 * reachable by keyboard the moment it appears.
 *
 *   <div data-rm-snackbar></div>
 *   bar.rmShow("Copied", { action: "Undo", onAction: undo });
 */
export function snackbar(target = "[data-rm-snackbar]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { life = 5000 } = options;
  const cleanups = [];

  for (const holder of holders) {
    holder.classList.add("rm-snackbar");
    holder.setAttribute("role", "status");
    holder.setAttribute("aria-live", "polite");
    holder.hidden = true;
    let timer = 0;

    const hide = () => {
      clearTimeout(timer);
      if (prefersReducedMotion()) { holder.hidden = true; return; }
      holder.animate(
        [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(12px)" }],
        { duration: 220, easing: EASE.inOut, fill: "forwards" },
      ).finished.then(() => { holder.hidden = true; }, () => { holder.hidden = true; });
    };

    holder.rmShow = (message, { action, onAction, timeout = life } = {}) => {
      clearTimeout(timer);
      holder.replaceChildren();

      const text = document.createElement("p");
      text.textContent = message;
      holder.appendChild(text);

      if (action) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "rm-snackbar-action";
        button.textContent = action;
        button.addEventListener("click", () => { onAction?.(); hide(); });
        holder.appendChild(button);
      }

      holder.hidden = false;
      if (!prefersReducedMotion()) {
        holder.animate(
          [{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }],
          { duration: 280, easing: EASE.out },
        );
      }
      if (timeout > 0) timer = setTimeout(hide, timeout);
    };

    cleanups.push(() => {
      clearTimeout(timer);
      delete holder.rmShow;
      holder.hidden = false;
      holder.classList.remove("rm-snackbar");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A page-wide notice that pushes nothing.
 *
 * It slides down over the page rather than inserting itself above it, so
 * nothing below moves and nobody loses their place mid-sentence. Dismissing it
 * is a real button, and the notice is `role="region"` with a label rather than
 * an anonymous strip of colour.
 *
 *   <div data-rm-banner>Scheduled maintenance at 22:00.</div>
 */
export function banner(target = "[data-rm-banner]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { label = "Notice", dismissible = true } = options;
  const cleanups = [];

  for (const holder of holders) {
    holder.classList.add("rm-banner");
    holder.setAttribute("role", "region");
    holder.setAttribute("aria-label", dataString(holder, "rmLabel", label));

    let shut = null;
    if (dismissible) {
      shut = document.createElement("button");
      shut.type = "button";
      shut.className = "rm-banner-close";
      shut.setAttribute("aria-label", "Dismiss this notice");
      shut.textContent = "×";
      shut.addEventListener("click", () => {
        if (prefersReducedMotion()) { holder.hidden = true; return; }
        holder.animate(
          [{ transform: "none", opacity: 1 }, { transform: "translateY(-100%)", opacity: 0 }],
          { duration: 300, easing: EASE.inOut, fill: "forwards" },
        ).finished.then(() => { holder.hidden = true; }, () => { holder.hidden = true; });
      });
      holder.appendChild(shut);
    }

    if (!prefersReducedMotion()) {
      holder.animate(
        [{ transform: "translateY(-100%)" }, { transform: "none" }],
        { duration: 420, easing: EASE.out },
      );
    }

    cleanups.push(() => {
      shut?.remove();
      holder.hidden = false;
      holder.classList.remove("rm-banner");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A message that belongs to the thing it is about.
 *
 * Wired to a field with `aria-describedby`, so a screen reader reads the
 * message as part of the field rather than as a stray sentence somewhere on
 * the page. That one attribute is the difference between an error message and
 * an error message somebody can actually act on.
 *
 *   <p data-rm-inline-alert="email-field" data-rm-tone="error">…</p>
 */
export function inlineAlert(target = "[data-rm-inline-alert]", options = {}) {
  const notes = resolveElements(target);
  if (!notes.length) return () => {};

  const { tone = "info" } = options;
  const cleanups = [];

  for (const note of notes) {
    const kind = dataString(note, "rmTone", tone);
    note.classList.add("rm-inline-alert", `is-${kind}`);
    note.setAttribute("role", kind === "error" ? "alert" : "status");

    if (!note.id) note.id = `rm-alert-${Math.random().toString(36).slice(2, 8)}`;
    const forId = note.getAttribute("data-rm-inline-alert");
    const field = forId ? document.getElementById(forId) : null;
    const had = field?.getAttribute("aria-describedby") ?? null;
    if (field) {
      field.setAttribute("aria-describedby", had ? `${had} ${note.id}` : note.id);
      if (kind === "error") field.setAttribute("aria-invalid", "true");
    }

    if (!prefersReducedMotion()) {
      note.animate(
        [{ opacity: 0, transform: "translateY(-4px)" }, { opacity: 1, transform: "none" }],
        { duration: 240, easing: EASE.out },
      );
    }

    cleanups.push(() => {
      if (field) {
        if (had) field.setAttribute("aria-describedby", had);
        else field.removeAttribute("aria-describedby");
        field.removeAttribute("aria-invalid");
      }
      note.classList.remove("rm-inline-alert", `is-${kind}`);
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * An arriving notification, phone style.
 *
 * Drops in with a spring, and can be dismissed by dragging it up or with a
 * button. The drag is the flourish; the button is how it actually works for
 * most people, which is the right way round.
 *
 *   <div data-rm-push-card>…</div>
 */
export function pushCard(target = "[data-rm-push-card]", options = {}) {
  const cards = resolveElements(target);
  if (!cards.length) return () => {};

  const { throwAt = 40 } = options;
  const cleanups = [];

  for (const card of cards) {
    card.classList.add("rm-push-card");
    card.setAttribute("role", "status");
    card.setAttribute("aria-live", "polite");

    const shut = document.createElement("button");
    shut.type = "button";
    shut.className = "rm-push-card-close";
    shut.setAttribute("aria-label", "Dismiss");
    shut.textContent = "×";
    card.appendChild(shut);

    const away = () => {
      if (prefersReducedMotion()) { card.hidden = true; return; }
      card.animate(
        [{ transform: card.style.transform || "none", opacity: 1 }, { transform: "translateY(-120%)", opacity: 0 }],
        { duration: 300, easing: EASE.inOut, fill: "forwards" },
      ).finished.then(() => { card.hidden = true; }, () => { card.hidden = true; });
    };
    shut.addEventListener("click", away);

    let holding = false;
    let from = 0;
    let moved = 0;
    const onDown = (event) => {
      if (event.button > 0 || event.target === shut) return;
      holding = true;
      from = event.clientY;
      moved = 0;
      card.setPointerCapture?.(event.pointerId);
    };
    const onMove = (event) => {
      if (!holding) return;
      moved = Math.min(0, event.clientY - from);
      card.style.transform = `translateY(${moved}px)`;
    };
    const onUp = (event) => {
      if (!holding) return;
      holding = false;
      card.releasePointerCapture?.(event.pointerId);
      if (-moved > throwAt) away();
      else card.style.transform = "";
    };

    card.addEventListener("pointerdown", onDown);
    card.addEventListener("pointermove", onMove);
    card.addEventListener("pointerup", onUp);
    card.addEventListener("pointercancel", onUp);

    if (!prefersReducedMotion()) {
      card.animate(
        [{ transform: "translateY(-140%)", opacity: 0 }, { transform: "none", opacity: 1 }],
        { duration: 620, easing: EASE.spring },
      );
    }

    cleanups.push(() => {
      card.removeEventListener("pointerdown", onDown);
      card.removeEventListener("pointermove", onMove);
      card.removeEventListener("pointerup", onUp);
      card.removeEventListener("pointercancel", onUp);
      shut.remove();
      card.style.transform = "";
      card.hidden = false;
      card.classList.remove("rm-push-card");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A bell that rings when the count changes.
 *
 * The swing is a transform on the bell alone, so the count beside it stays
 * perfectly still and legible while it happens — a bell that shakes its own
 * label is a bell you cannot read at the moment you most want to.
 *
 *   <button data-rm-bell data-rm-count="3">…</button>
 *   bell.rmSet(4);
 */
export function bell(target = "[data-rm-bell]", options = {}) {
  const bells = resolveElements(target);
  if (!bells.length) return () => {};

  const { label = "Notifications" } = options;
  const cleanups = [];

  for (const holder of bells) {
    holder.classList.add("rm-bell");
    const shape = document.createElement("span");
    shape.className = "rm-bell-shape";
    shape.setAttribute("aria-hidden", "true");
    shape.innerHTML =
      '<svg viewBox="0 0 24 24"><path d="M12 3a5 5 0 0 0-5 5v4l-2 3h14l-2-3V8a5 5 0 0 0-5-5Z" ' +
      'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<path d="M10 18a2 2 0 0 0 4 0" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';

    const count = document.createElement("span");
    count.className = "rm-bell-count";
    let value = dataNumber(holder, "rmBell", 0);
    count.textContent = String(value);
    count.hidden = value === 0;

    holder.prepend(shape);
    holder.appendChild(count);
    holder.setAttribute("aria-label", `${dataString(holder, "rmLabel", label)}: ${value}`);

    holder.rmSet = (next) => {
      value = next;
      count.textContent = String(next);
      count.hidden = next === 0;
      holder.setAttribute("aria-label", `${dataString(holder, "rmLabel", label)}: ${next}`);
      if (prefersReducedMotion()) return;
      shape.animate(
        [
          { transform: "rotate(0deg)" }, { transform: "rotate(14deg)" },
          { transform: "rotate(-11deg)" }, { transform: "rotate(7deg)" },
          { transform: "rotate(0deg)" },
        ],
        { duration: 620, easing: EASE.out },
      );
    };

    cleanups.push(() => {
      delete holder.rmSet;
      shape.remove();
      count.remove();
      holder.classList.remove("rm-bell");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * An unread count that rolls.
 *
 * The old number leaves and the new one arrives from the direction the count
 * moved — up for more, down for fewer — so the change reads as a change rather
 * than a redraw. The value is in a polite live region, announced once.
 *
 *   <span data-rm-counter>3</span>
 */
export function counter(target = "[data-rm-counter]", options = {}) {
  const counters = resolveElements(target);
  if (!counters.length) return () => {};

  const { duration = 320 } = options;
  const cleanups = [];

  for (const holder of counters) {
    const start = Number(holder.textContent.trim()) || 0;
    holder.classList.add("rm-counter");
    holder.setAttribute("aria-live", "polite");
    holder.style.setProperty("--rm-counter-duration", `${prefersReducedMotion() ? 0 : duration}ms`);

    const face = document.createElement("span");
    face.className = "rm-counter-face";
    face.textContent = String(start);
    holder.replaceChildren(face);
    let value = start;

    holder.rmSet = (next) => {
      if (next === value) return;
      const up = next > value;
      value = next;
      if (prefersReducedMotion()) { face.textContent = String(next); return; }

      const leaving = face.cloneNode(true);
      leaving.classList.add("is-leaving");
      holder.appendChild(leaving);
      leaving.animate(
        [{ transform: "none", opacity: 1 }, { transform: `translateY(${up ? -100 : 100}%)`, opacity: 0 }],
        { duration, easing: EASE.out, fill: "forwards" },
      ).finished.then(() => leaving.remove(), () => leaving.remove());

      face.textContent = String(next);
      face.animate(
        [{ transform: `translateY(${up ? 100 : -100}%)`, opacity: 0 }, { transform: "none", opacity: 1 }],
        { duration, easing: EASE.out },
      );
    };

    cleanups.push(() => {
      delete holder.rmSet;
      holder.textContent = String(start);
      holder.classList.remove("rm-counter");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Someone is here, and it says so.
 *
 * The dot is decoration; the text beside it is the message. A status carried
 * only by a colour is a status invisible to anyone who cannot distinguish that
 * colour from the one next to it, so this always renders a word.
 *
 *   <span data-rm-presence="online">Ana</span>
 */
export function presenceDot(target = "[data-rm-presence]", options = {}) {
  const marks = resolveElements(target);
  if (!marks.length) return () => {};

  const { state = "online" } = options;
  const WORDS = { online: "online", away: "away", busy: "busy", offline: "offline" };
  const cleanups = [];

  for (const mark of marks) {
    const kind = dataString(mark, "rmPresence", state);
    mark.classList.add("rm-presence", `is-${kind}`);

    const dot = document.createElement("i");
    dot.className = "rm-presence-dot";
    dot.setAttribute("aria-hidden", "true");
    const word = document.createElement("span");
    word.className = "rm-presence-word";
    word.textContent = ` (${WORDS[kind] ?? kind})`;
    mark.prepend(dot);
    mark.appendChild(word);

    cleanups.push(() => {
      dot.remove();
      word.remove();
      mark.classList.remove("rm-presence", `is-${kind}`);
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A corner ribbon for a status.
 *
 * Rotated with a transform on its own layer, so the box it decorates is
 * unchanged and nothing around it moves. The word is real text, not an image,
 * so it is readable, selectable and translatable.
 *
 *   <article data-rm-ribbon-alert="New">…</article>
 */
export function ribbonAlert(target = "[data-rm-ribbon-alert]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { text = "New", corner = "top-right" } = options;
  const cleanups = [];

  for (const holder of holders) {
    holder.classList.add("rm-ribbon-alert");
    const where = dataString(holder, "rmCorner", corner);
    const flag = document.createElement("span");
    flag.className = `rm-ribbon-alert-flag is-${where}`;
    flag.textContent = dataString(holder, "rmRibbonAlert", text);
    holder.appendChild(flag);

    cleanups.push(() => {
      flag.remove();
      holder.classList.remove("rm-ribbon-alert");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A strip that changes colour and says why.
 *
 * `aria-live` set from the tone: something going wrong is assertive, anything
 * else is polite. Getting that the wrong way round means either an
 * interruption for nothing, or silence when it matters.
 *
 *   <div data-rm-status-bar="ok">All systems normal</div>
 */
export function statusBar(target = "[data-rm-status-bar]", options = {}) {
  const bars = resolveElements(target);
  if (!bars.length) return () => {};

  const { tone = "ok" } = options;
  const cleanups = [];

  for (const bar of bars) {
    let kind = dataString(bar, "rmStatusBar", tone);
    bar.classList.add("rm-status-bar", `is-${kind}`);
    bar.setAttribute("role", kind === "down" ? "alert" : "status");
    bar.setAttribute("aria-live", kind === "down" ? "assertive" : "polite");

    bar.rmSet = (nextTone, message) => {
      bar.classList.remove(`is-${kind}`);
      kind = nextTone;
      bar.classList.add(`is-${kind}`);
      bar.setAttribute("aria-live", kind === "down" ? "assertive" : "polite");
      if (message !== undefined) bar.textContent = message;
      if (prefersReducedMotion()) return;
      bar.animate(
        [{ transform: "scaleY(0.7)" }, { transform: "none" }],
        { duration: 300, easing: EASE.out },
      );
    };

    cleanups.push(() => {
      delete bar.rmSet;
      bar.classList.remove("rm-status-bar", `is-${kind}`);
      bar.removeAttribute("role");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A toast that is also a progress bar.
 *
 * The bar is a real `role="progressbar"` with `aria-valuenow`, so the number
 * is available rather than merely drawn, and the message says what is being
 * waited for. "Loading…" with a bar is a shrug; "Uploading 3 of 8" is a
 * status.
 *
 *   <div data-rm-progress-toast>Uploading</div>
 *   toast.rmSet(40);
 */
export function progressToast(target = "[data-rm-progress-toast]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { label = "Progress" } = options;
  const cleanups = [];

  for (const holder of holders) {
    holder.classList.add("rm-progress-toast");
    holder.setAttribute("role", "status");
    holder.setAttribute("aria-live", "polite");

    const bar = document.createElement("div");
    bar.className = "rm-progress-toast-bar";
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", "100");
    bar.setAttribute("aria-label", dataString(holder, "rmLabel", label));
    const fill = document.createElement("i");
    bar.appendChild(fill);
    holder.appendChild(bar);

    holder.rmSet = (value) => {
      const at = clamp(value, 0, 100);
      bar.style.setProperty("--rm-progress-toast-value", `${at}%`);
      bar.setAttribute("aria-valuenow", String(Math.round(at)));
    };
    holder.rmSet(dataNumber(holder, "rmValue", 0));

    cleanups.push(() => {
      delete holder.rmSet;
      bar.remove();
      holder.classList.remove("rm-progress-toast");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * The one notification that has a job to do.
 *
 * An undo bar is the only kind of toast worth interrupting for, so this one is
 * built around its button: the button is the first thing in the tab order
 * inside it, the countdown is visible, and the bar does not disappear while
 * the pointer or the keyboard is on it — losing an undo because you were
 * reading it is the worst possible outcome.
 *
 *   <div data-rm-undo-bar>Message deleted</div>
 *   bar.rmShow("Message deleted", restore);
 */
export function undoBar(target = "[data-rm-undo-bar]", options = {}) {
  const bars = resolveElements(target);
  if (!bars.length) return () => {};

  const { life = 7000, label = "Undo" } = options;
  const cleanups = [];

  for (const bar of bars) {
    bar.classList.add("rm-undo-bar");
    bar.setAttribute("role", "status");
    bar.setAttribute("aria-live", "polite");
    bar.hidden = true;

    let timer = 0;
    let paused = false;
    let left = life;
    let tick = 0;

    const hide = () => { clearInterval(tick); clearTimeout(timer); bar.hidden = true; };

    bar.rmShow = (message, onUndo) => {
      clearInterval(tick);
      clearTimeout(timer);
      left = dataNumber(bar, "rmLife", life);
      bar.replaceChildren();

      const undo = document.createElement("button");
      undo.type = "button";
      undo.className = "rm-undo-bar-action";
      undo.textContent = dataString(bar, "rmLabel", label);
      undo.addEventListener("click", () => { onUndo?.(); hide(); });

      const text = document.createElement("p");
      text.textContent = message;

      const ring = document.createElement("span");
      ring.className = "rm-undo-bar-ring";
      ring.setAttribute("aria-hidden", "true");

      // The button first: it is the reason the bar exists.
      bar.append(undo, text, ring);
      bar.hidden = false;

      // It never expires while somebody is reading it.
      tick = setInterval(() => {
        if (paused) return;
        left -= 100;
        ring.style.setProperty("--rm-undo-left", String(clamp(left / dataNumber(bar, "rmLife", life), 0, 1)));
        if (left <= 0) hide();
      }, 100);
    };

    const hold = () => { paused = true; };
    const release = () => { paused = false; };
    bar.addEventListener("pointerenter", hold);
    bar.addEventListener("pointerleave", release);
    bar.addEventListener("focusin", hold);
    bar.addEventListener("focusout", release);

    cleanups.push(() => {
      hide();
      bar.removeEventListener("pointerenter", hold);
      bar.removeEventListener("pointerleave", release);
      bar.removeEventListener("focusin", hold);
      bar.removeEventListener("focusout", release);
      delete bar.rmShow;
      bar.hidden = false;
      bar.classList.remove("rm-undo-bar");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A decision, asked properly.
 *
 * A real `role="alertdialog"`: focus goes to the safer of the two answers,
 * Escape cancels, the rest of the page is inert, and focus returns to whatever
 * asked. The destructive button is never the one focused by default, because
 * the muscle memory of pressing Enter should not be able to delete anything.
 *
 *   <div data-rm-confirm-sheet hidden>…</div>
 *   sheet.rmAsk("Delete this?", { onYes });
 */
export function confirmSheet(target = "[data-rm-confirm-sheet]", options = {}) {
  const sheets = resolveElements(target);
  if (!sheets.length) return () => {};

  const { yes = "Delete", no = "Cancel" } = options;
  const cleanups = [];

  for (const sheet of sheets) {
    sheet.classList.add("rm-confirm-sheet");
    sheet.setAttribute("role", "alertdialog");
    sheet.setAttribute("aria-modal", "true");
    sheet.hidden = true;

    let opener = null;
    let sealed = [];

    const close = () => {
      if (sheet.hidden) return;
      sheet.hidden = true;
      sealed.forEach((node) => { node.inert = false; });
      sealed = [];
      opener?.focus();
      opener = null;
    };

    sheet.rmAsk = (question, { onYes, onNo, yesLabel = yes, noLabel = no } = {}) => {
      opener = document.activeElement;
      sheet.replaceChildren();

      const text = document.createElement("p");
      text.id = `rm-confirm-${Math.random().toString(36).slice(2, 8)}`;
      text.textContent = question;
      sheet.setAttribute("aria-describedby", text.id);

      const row = document.createElement("div");
      row.className = "rm-confirm-sheet-row";

      const cancel = document.createElement("button");
      cancel.type = "button";
      cancel.className = "rm-confirm-sheet-no";
      cancel.textContent = noLabel;
      cancel.addEventListener("click", () => { onNo?.(); close(); });

      const go = document.createElement("button");
      go.type = "button";
      go.className = "rm-confirm-sheet-yes";
      go.textContent = yesLabel;
      go.addEventListener("click", () => { onYes?.(); close(); });

      row.append(cancel, go);
      sheet.append(text, row);
      sheet.hidden = false;

      sealed = [...document.body.children].filter((n) => n !== sheet && !n.contains(sheet));
      sealed.forEach((node) => { node.inert = true; });

      // The safe answer takes focus. Enter must never be able to destroy.
      cancel.focus();

      if (!prefersReducedMotion()) {
        sheet.animate(
          [{ opacity: 0, transform: "translateY(16px) scale(0.97)" }, { opacity: 1, transform: "none" }],
          { duration: 320, easing: EASE.out },
        );
      }
    };

    const onKey = (event) => {
      if (event.key === "Escape" && !sheet.hidden) { event.preventDefault(); close(); }
    };
    document.addEventListener("keydown", onKey);

    cleanups.push(() => {
      document.removeEventListener("keydown", onKey);
      sealed.forEach((node) => { node.inert = false; });
      delete sheet.rmAsk;
      sheet.hidden = false;
      sheet.classList.remove("rm-confirm-sheet");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A notice that expires, visibly.
 *
 * The remaining time is drawn as a ring and stated as text, because a ring
 * alone is a countdown nobody can read out. It pauses when reached, for the
 * same reason the undo bar does.
 *
 *   <div data-rm-countdown-note data-rm-seconds="20">Session ends in</div>
 */
export function countdownNote(target = "[data-rm-countdown-note]", options = {}) {
  const notes = resolveElements(target);
  if (!notes.length) return () => {};

  const { seconds = 30 } = options;
  const cleanups = [];

  for (const note of notes) {
    const total = dataNumber(note, "rmSeconds", seconds);
    note.classList.add("rm-countdown-note");
    note.setAttribute("role", "status");
    note.setAttribute("aria-live", "polite");

    const time = document.createElement("strong");
    time.className = "rm-countdown-note-time";
    const ring = document.createElement("span");
    ring.className = "rm-countdown-note-ring";
    ring.setAttribute("aria-hidden", "true");
    note.append(time, ring);

    let left = total;
    const draw = () => {
      time.textContent = `${left}s`;
      ring.style.setProperty("--rm-countdown-left", (left / total).toFixed(3));
    };
    draw();

    cleanups.push(whileVisible(note, () => {
      const timer = setInterval(() => {
        left = Math.max(0, left - 1);
        draw();
        if (left === 0) clearInterval(timer);
      }, 1000);
      return () => clearInterval(timer);
    }));

    cleanups.push(() => {
      time.remove();
      ring.remove();
      note.classList.remove("rm-countdown-note");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * Who is in this, and how many more.
 *
 * The overflow count is real text inside the list, so "and four others" is
 * something a screen reader says rather than a circle it skips. The avatars
 * fan apart when reached, which is a transform on each rather than a change in
 * the row's width.
 *
 *   <ul data-rm-stacked-avatars><li><img></li></ul>
 */
export function stackedAvatars(target = "[data-rm-stacked-avatars]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { show = 4, overlap = 12 } = options;
  const cleanups = [];

  for (const holder of holders) {
    const faces = [...holder.children];
    if (!faces.length) continue;

    holder.classList.add("rm-stacked-avatars");
    holder.style.setProperty("--rm-stacked-overlap", `${dataNumber(holder, "rmOverlap", overlap)}px`);
    const many = dataNumber(holder, "rmShow", show);

    faces.forEach((face, i) => {
      face.classList.add("rm-stacked-avatars-face");
      face.style.zIndex = String(faces.length - i);
      face.hidden = i >= many;
    });

    let more = null;
    if (faces.length > many) {
      more = document.createElement("li");
      more.className = "rm-stacked-avatars-more";
      more.textContent = `+${faces.length - many}`;
      more.setAttribute("aria-label", `and ${faces.length - many} others`);
      holder.appendChild(more);
    }

    cleanups.push(() => {
      more?.remove();
      faces.forEach((face) => {
        face.classList.remove("rm-stacked-avatars-face");
        face.hidden = false;
        face.style.zIndex = "";
      });
      holder.classList.remove("rm-stacked-avatars");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Someone is writing.
 *
 * Three dots on one animation at three delays, and a real sentence in a live
 * region beside them — "Ana is typing" is the message; the dots are the
 * decoration. Under reduced motion the dots stop and the sentence stays.
 *
 *   <p data-rm-typing>Ana is typing</p>
 */
export function typingDots(target = "[data-rm-typing]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { count = 3 } = options;
  const cleanups = [];

  for (const holder of holders) {
    holder.classList.add("rm-typing");
    holder.setAttribute("role", "status");
    holder.setAttribute("aria-live", "polite");

    const dots = document.createElement("span");
    dots.className = "rm-typing-dots";
    dots.setAttribute("aria-hidden", "true");
    for (let i = 0; i < count; i++) {
      const dot = document.createElement("i");
      dot.style.animationDelay = `${i * 170}ms`;
      dots.appendChild(dot);
    }
    if (prefersReducedMotion()) dots.classList.add("is-still");
    holder.appendChild(dots);

    cleanups.push(() => {
      dots.remove();
      holder.classList.remove("rm-typing");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Events arriving in order.
 *
 * New entries are prepended and the ones below shift down with a FLIP, so the
 * list never jumps and the eye keeps its place. It is an ordered list with a
 * polite live region, so the arrival is announced once, in order.
 *
 *   <ol data-rm-live-ticker></ol>
 *   ticker.rmAdd("Build passed");
 */
export function liveTicker(target = "[data-rm-live-ticker]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { max = 6, duration = 380 } = options;
  const cleanups = [];

  for (const holder of holders) {
    holder.classList.add("rm-live-ticker");
    holder.setAttribute("aria-live", "polite");
    const limit = dataNumber(holder, "rmMax", max);

    holder.rmAdd = (message) => {
      const rows = [...holder.children];
      const boxes = rows.map((row) => [row, row.getBoundingClientRect()]);

      const row = document.createElement("li");
      row.className = "rm-live-ticker-row";
      row.textContent = message;
      holder.prepend(row);
      while (holder.children.length > limit) holder.lastElementChild.remove();

      if (prefersReducedMotion()) return row;
      // The rows that stayed slide from where they were: no jump.
      for (const [element, was] of boxes) {
        if (!element.isConnected) continue;
        const now = element.getBoundingClientRect();
        const dy = was.top - now.top;
        if (!dy) continue;
        element.animate(
          [{ transform: `translateY(${dy}px)` }, { transform: "none" }],
          { duration, easing: EASE.out },
        );
      }
      row.animate(
        [{ opacity: 0, transform: "translateY(-10px)" }, { opacity: 1, transform: "none" }],
        { duration, easing: EASE.out },
      );
      return row;
    };

    cleanups.push(() => {
      delete holder.rmAdd;
      holder.classList.remove("rm-live-ticker");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A small, quiet, dismissible thing.
 *
 * The least a notification can be and still be one: a word, a colour and a
 * real close button. It shrinks away from its own centre rather than
 * collapsing its height, so the row it sits in does not twitch.
 *
 *   <span data-rm-pill-alert="new">Beta</span>
 */
export function pillAlert(target = "[data-rm-pill-alert]", options = {}) {
  const pills = resolveElements(target);
  if (!pills.length) return () => {};

  const { tone = "info", dismissible = true } = options;
  const cleanups = [];

  for (const pill of pills) {
    const kind = dataString(pill, "rmPillAlert", tone);
    pill.classList.add("rm-pill-alert", `is-${kind}`);

    let shut = null;
    if (dismissible) {
      shut = document.createElement("button");
      shut.type = "button";
      shut.className = "rm-pill-alert-close";
      shut.setAttribute("aria-label", `Dismiss ${pill.textContent.trim()}`);
      shut.textContent = "×";
      shut.addEventListener("click", () => {
        if (prefersReducedMotion()) { pill.hidden = true; return; }
        pill.animate(
          [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(0.7)" }],
          { duration: 200, easing: EASE.inOut, fill: "forwards" },
        ).finished.then(() => { pill.hidden = true; }, () => { pill.hidden = true; });
      });
      pill.appendChild(shut);
    }

    cleanups.push(() => {
      shut?.remove();
      pill.hidden = false;
      pill.classList.remove("rm-pill-alert", `is-${kind}`);
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A toast in a corner you choose.
 *
 * The corner decides which way it arrives from, so a toast in the bottom right
 * slides up from the bottom right rather than in from an arbitrary direction —
 * motion that agrees with position is motion nobody has to think about.
 *
 *   <div data-rm-corner-toast="bottom-right"></div>
 */
export function cornerToast(target = "[data-rm-corner-toast]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const FROM = {
    "top-left": "translate(-16px, -16px)",
    "top-right": "translate(16px, -16px)",
    "bottom-left": "translate(-16px, 16px)",
    "bottom-right": "translate(16px, 16px)",
  };

  const { corner = "bottom-right", life = 3600 } = options;
  const cleanups = [];

  for (const holder of holders) {
    const where = dataString(holder, "rmCornerToast", corner);
    holder.classList.add("rm-corner-toast", `is-${where}`);
    holder.setAttribute("role", "status");
    holder.setAttribute("aria-live", "polite");
    holder.hidden = true;
    let timer = 0;

    holder.rmShow = (message, timeout = life) => {
      clearTimeout(timer);
      holder.textContent = message;
      holder.hidden = false;
      if (!prefersReducedMotion()) {
        holder.animate(
          [{ opacity: 0, transform: FROM[where] ?? FROM["bottom-right"] }, { opacity: 1, transform: "none" }],
          { duration: 320, easing: EASE.out },
        );
      }
      if (timeout > 0) timer = setTimeout(() => { holder.hidden = true; }, timeout);
    };

    cleanups.push(() => {
      clearTimeout(timer);
      delete holder.rmShow;
      holder.hidden = false;
      holder.classList.remove("rm-corner-toast", `is-${where}`);
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A badge that pulses when it changes.
 *
 * One ring expanding out of the badge, so the badge itself never moves and
 * whatever it is attached to never shifts. The pulse is the only announcement
 * that is purely visual here — the count itself is in a live region.
 *
 *   <span data-rm-sound-badge>2</span>
 */
export function soundBadge(target = "[data-rm-sound-badge]", options = {}) {
  const badges = resolveElements(target);
  if (!badges.length) return () => {};

  const { duration = 720 } = options;
  const cleanups = [];

  for (const badge of badges) {
    badge.classList.add("rm-sound-badge");
    badge.setAttribute("aria-live", "polite");
    const ring = document.createElement("i");
    ring.className = "rm-sound-badge-ring";
    ring.setAttribute("aria-hidden", "true");
    badge.appendChild(ring);

    badge.rmSet = (next) => {
      const face = badge.firstChild;
      if (face && face.nodeType === Node.TEXT_NODE) face.textContent = String(next);
      else badge.insertBefore(document.createTextNode(String(next)), ring);
      if (prefersReducedMotion()) return;
      ring.animate(
        [{ transform: "scale(0.6)", opacity: 0.7 }, { transform: "scale(2.2)", opacity: 0 }],
        { duration, easing: EASE.out },
      );
    };

    cleanups.push(() => {
      delete badge.rmSet;
      ring.remove();
      badge.classList.remove("rm-sound-badge");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}
