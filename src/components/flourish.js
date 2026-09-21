/**
 * Showpiece controls and patterns.
 *
 *   • liquidButton()     — a gooey fill that merges with the pointer.
 *   • flipButton()       — one 3D card, two real faces, one of them announced.
 *   • copyButton()       — copies, and the clipboard becomes a tick.
 *   • themeToggle()      — a sun that a moving mask turns into a moon.
 *   • countButton()      — a figure that spins up and stays readable doing it.
 *   • flipCard()         — a card that turns on hover and on focus alike.
 *   • managementBar()    — a bar that morphs between nothing and a selection.
 *   • pinList()          — pinned rows travel to the top and stay marked.
 *   • previewLinkCard()  — a link floats a card that never leaves the viewport.
 *   • fileTree()         — folders opening to their own height, with arrow keys.
 *   • presenceRow()      — people arriving at a document, announced once each.
 *   • morphIcon()        — one path interpolating between two shapes.
 *
 * These are the loud ones, and loud is where accessibility usually goes to die.
 * So the discipline in this file is the opposite of decorative: every control
 * here is a real `<button>` with a real accessible name, every state a browser
 * cannot infer is carried by `aria-pressed` or `aria-expanded`, everything that
 * answers a pointer also answers focus, and everything that can be dragged can
 * also be driven from the keyboard. The flourish is what you see; the markup
 * underneath is the markup you would have written without it.
 *
 * Nothing in here animates a box. Where something appears to grow — the
 * management bar changing its mind, a pinned row climbing the list — it is a
 * FLIP: measure, change, invert, play. Where something opens to a height it
 * cannot know, it is `grid-template-rows: 0fr -> 1fr`. And where a shape
 * becomes another shape, it is one path being interpolated, never two images
 * crossfading, because a crossfade of two icons is two icons plus a moment in
 * the middle where neither of them is anything.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import {
  clamp, dataNumber, dataString, EASE, lerp, onFrame,
  prefersReducedMotion, resolveElements, whileVisible,
} from "../core/motion.js";

const SVG = "http://www.w3.org/2000/svg";

/** A short id, for the filter and mask references that need one. */
const uid = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

/** A visually hidden announcer, created once per component and reused. */
function announcer(holder, tone = "polite") {
  const said = document.createElement("p");
  said.className = "rm-flourish-live";
  said.setAttribute("aria-live", tone);
  said.setAttribute("role", "status");
  holder.appendChild(said);
  return said;
}

/**
 * Can this browser interpolate an SVG path?
 *
 * `d` is a CSS property in every current engine, which is what makes a real
 * shape-to-shape morph possible with no library at all. Where it is missing the
 * shape still changes — it simply changes at once, which is the correct
 * degradation for an icon.
 */
const canMorphPath = () =>
  typeof CSS !== "undefined" && CSS.supports?.("d", 'path("M 0 0")') === true;

/**
 * Interpolate one path into another.
 *
 * The destination is written to the attribute *first*, so the finished shape is
 * in the DOM whether or not the animation runs and the animation is only ever
 * the journey. Both strings must carry the same commands in the same order —
 * every pair in this file does, with degenerate points (a line to where you
 * already are) standing in wherever one shape has fewer corners than the other.
 * Mismatched commands are what makes a morph snap.
 */
function morphPath(path, from, to, duration) {
  path.setAttribute("d", to);
  if (prefersReducedMotion() || !canMorphPath()) return null;
  return path.animate(
    [{ d: `path("${from}")` }, { d: `path("${to}")` }],
    { duration, easing: EASE.inOut },
  );
}

/**
 * Measure, let `act` change the DOM, then play every row back from where it was.
 *
 * The one honest way to move things inside a list. The alternatives either do
 * not animate at all — `order` is not interpolable — or transition `top` and
 * relayout the whole column on every frame.
 */
function flipRows(rows, act, duration) {
  const boxes = rows.map((row) => [row, row.getBoundingClientRect()]);
  act();
  if (prefersReducedMotion()) return;
  for (const [row, was] of boxes) {
    if (!row.isConnected) continue;
    const now = row.getBoundingClientRect();
    const dy = was.top - now.top;
    const dx = was.left - now.left;
    if (!dx && !dy) continue;
    row.animate(
      [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }],
      { duration, easing: EASE.out },
    );
  }
}

/** Thousands separators, without pulling in a formatter. */
const figure = (value) => String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/**
 * A gooey fill that merges with the pointer.
 *
 * Two blobs — a pool anchored to the bottom of the button and a drop that
 * follows the pointer — share one `feGaussianBlur` and one `feColorMatrix`
 * whose alpha row is steep enough to act as a threshold. Blurring two shapes
 * and then re-hardening the result is what makes them reach for each other and
 * fuse; that is the whole trick, and it costs one filter rather than any
 * per-frame geometry.
 *
 * The filter goes on a wrapper that contains nothing but the blobs. Put it on
 * the button itself and it eats the label: text is antialiased, the blur
 * spreads those soft edges into the glyph interiors, and the threshold then
 * rounds what is left into lumps. The label sits in a sibling layer above the
 * filtered one, untouched, which is why it stays crisp at any blur radius.
 *
 * On focus there is no pointer to merge with, so the pool simply rises — the
 * merging is a bonus for people using a mouse, not the state itself.
 *
 *   <button type="button" data-rm-liquid-button>Send it</button>
 */
export function liquidButton(target = "[data-rm-liquid-button]", options = {}) {
  const buttons = resolveElements(target);
  if (!buttons.length) return () => {};

  const { duration = 520, blur = 7, size = 46 } = options;
  const cleanups = [];

  for (const button of buttons) {
    button.classList.add("rm-liquid-button");
    const id = uid("rm-goo");
    const radius = clamp(dataNumber(button, "rmBlur", blur), 1, 20);

    // The label is whatever was already inside, lifted into its own unfiltered
    // layer. Nothing is replaced, so the button reads the same with the script
    // taken away again.
    const label = document.createElement("span");
    label.className = "rm-liquid-button-label";
    while (button.firstChild) label.appendChild(button.firstChild);

    const defs = document.createElementNS(SVG, "svg");
    defs.setAttribute("aria-hidden", "true");
    defs.setAttribute("focusable", "false");
    defs.classList.add("rm-liquid-button-defs");
    defs.innerHTML =
      `<filter id="${id}" x="-40%" y="-40%" width="180%" height="180%" color-interpolation-filters="sRGB">` +
      `<feGaussianBlur in="SourceGraphic" stdDeviation="${radius}" result="soft"/>` +
      '<feColorMatrix in="soft" mode="matrix" ' +
      // Identity on colour; the alpha row is the threshold that re-hardens the
      // blurred edges back into one silhouette.
      'values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"/>' +
      "</filter>";

    const goo = document.createElement("span");
    goo.className = "rm-liquid-button-goo";
    goo.setAttribute("aria-hidden", "true");
    goo.style.filter = `url(#${id})`;
    const pool = document.createElement("i");
    pool.className = "rm-liquid-button-pool";
    const drop = document.createElement("i");
    drop.className = "rm-liquid-button-drop";
    goo.append(pool, drop);

    button.style.setProperty(
      "--rm-liquid-duration",
      `${prefersReducedMotion() ? 0 : dataNumber(button, "rmDuration", duration)}ms`,
    );
    button.style.setProperty("--rm-liquid-size", `${dataNumber(button, "rmSize", size)}px`);
    button.append(defs, goo, label);

    let x = 0;
    let y = 0;
    let moved = false;
    let stopFrame = null;

    // The frame task exists only while the pointer is actually inside, so a
    // page of these costs nothing at rest — and a button cannot be hovered
    // while it is off screen, which is the one case `whileVisible` would guard.
    const write = () => {
      if (!moved) return;
      moved = false;
      goo.style.setProperty("--rm-liquid-x", `${x}px`);
      goo.style.setProperty("--rm-liquid-y", `${y}px`);
    };

    const track = (event) => {
      const box = button.getBoundingClientRect();
      x = event.clientX - box.left;
      y = event.clientY - box.top;
      moved = true;
    };

    const onEnter = (event) => {
      button.classList.add("is-wet");
      if (prefersReducedMotion()) return;
      track(event);
      write();
      stopFrame ??= onFrame(write);
    };
    const onMove = (event) => { if (stopFrame) track(event); };
    const onLeave = () => {
      button.classList.remove("is-wet");
      stopFrame?.();
      stopFrame = null;
    };
    // Focus gets the fill without the drop: there is no pointer to merge with.
    const onFocus = () => button.classList.add("is-wet");
    const onBlur = () => { if (!button.matches(":hover")) onLeave(); };

    button.addEventListener("pointerenter", onEnter);
    button.addEventListener("pointermove", onMove);
    button.addEventListener("pointerleave", onLeave);
    button.addEventListener("focus", onFocus);
    button.addEventListener("blur", onBlur);

    cleanups.push(() => {
      stopFrame?.();
      button.removeEventListener("pointerenter", onEnter);
      button.removeEventListener("pointermove", onMove);
      button.removeEventListener("pointerleave", onLeave);
      button.removeEventListener("focus", onFocus);
      button.removeEventListener("blur", onBlur);
      while (label.firstChild) button.appendChild(label.firstChild);
      defs.remove();
      goo.remove();
      label.remove();
      button.style.removeProperty("--rm-liquid-duration");
      button.style.removeProperty("--rm-liquid-size");
      button.classList.remove("rm-liquid-button", "is-wet");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * One 3D card, two real faces, one of them announced.
 *
 * The two element children already inside the button become the two faces of a
 * single `preserve-3d` card, turned by one `rotate3d`. Both are real content —
 * "Follow" and "Following" are both in the page, both selectable, both
 * translatable — which is the difference between this and the usual version
 * where the second state is a string living in a script.
 *
 * Exactly one face is announced at a time: the hidden one is `aria-hidden` and
 * `inert`, and the button itself carries `aria-pressed`. Without that a screen
 * reader reads "Follow Following" as one control, which says nothing about
 * which of the two is currently true.
 *
 *   <button type="button" data-rm-flip-button><span>Follow</span><span>Following</span></button>
 */
export function flipButton(target = "[data-rm-flip-button]", options = {}) {
  const buttons = resolveElements(target);
  if (!buttons.length) return () => {};

  const { duration = 460, axis = "y" } = options;
  const cleanups = [];

  for (const button of buttons) {
    const faces = [...button.children].filter((node) => node instanceof Element);
    if (faces.length < 2) continue;

    const [front, back] = faces;
    const turn = dataString(button, "rmAxis", axis) === "x" ? "1 0 0" : "0 1 0";

    button.classList.add("rm-flip-button");
    if (button.tagName === "BUTTON" && !button.getAttribute("type")) button.type = "button";
    button.style.setProperty("--rm-flip-button-axis", turn);
    button.style.setProperty(
      "--rm-flip-button-duration",
      `${prefersReducedMotion() ? 0 : dataNumber(button, "rmDuration", duration)}ms`,
    );

    const card = document.createElement("span");
    card.className = "rm-flip-button-card";
    front.classList.add("rm-flip-button-face", "is-front");
    back.classList.add("rm-flip-button-face", "is-back");
    card.append(front, back);
    button.appendChild(card);

    let on = button.getAttribute("aria-pressed") === "true";
    const show = () => {
      button.setAttribute("aria-pressed", String(on));
      button.classList.toggle("is-turned", on);
      front.setAttribute("aria-hidden", String(on));
      back.setAttribute("aria-hidden", String(!on));
      front.inert = on;
      back.inert = !on;
    };
    show();

    const onClick = () => { on = !on; show(); };
    button.addEventListener("click", onClick);

    cleanups.push(() => {
      button.removeEventListener("click", onClick);
      front.classList.remove("rm-flip-button-face", "is-front");
      back.classList.remove("rm-flip-button-face", "is-back");
      for (const face of [front, back]) {
        face.removeAttribute("aria-hidden");
        face.inert = false;
        button.appendChild(face);
      }
      card.remove();
      button.removeAttribute("aria-pressed");
      button.style.removeProperty("--rm-flip-button-axis");
      button.style.removeProperty("--rm-flip-button-duration");
      button.classList.remove("rm-flip-button", "is-turned");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Copies, and the clipboard becomes a tick.
 *
 * The icon is one path with five corners, and the copied state is those same
 * five corners rearranged into a tick — the rectangle's bottom-left corner
 * walks down to become the heel, its right side straightens out into the long
 * arm, and the little clip at the top fades. Because it is one element
 * interpolating, there is never a frame showing two icons at half opacity,
 * which is exactly what swapping two images gives you.
 *
 * The result is announced once, through a live region written after the copy
 * resolves. The button's own name never changes: rewriting the label of the
 * control somebody has just pressed makes several screen readers announce the
 * press twice, and leaves the name wrong for whoever arrives next.
 *
 *   <button type="button" data-rm-copy-button="#snippet">Copy</button>
 */
export function copyButton(target = "[data-rm-copy-button]", options = {}) {
  const buttons = resolveElements(target);
  if (!buttons.length) return () => {};

  const { duration = 380, done = "Copied to clipboard", reset = 2200 } = options;
  const cleanups = [];

  // Five corners each. The clipboard body is a rectangle written as an open
  // polyline so that both shapes really are the same five points.
  const CLIP = "M 7 6 L 17 6 L 17 19.5 L 7 19.5 L 7 6";
  const TICK = "M 5 12 L 9.5 16.5 L 13.5 12 L 15.5 9.5 L 19 6";

  for (const button of buttons) {
    button.classList.add("rm-copy-button");
    if (button.tagName === "BUTTON" && !button.getAttribute("type")) button.type = "button";

    const icon = document.createElementNS(SVG, "svg");
    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("aria-hidden", "true");
    icon.setAttribute("focusable", "false");
    icon.classList.add("rm-copy-button-icon");
    icon.innerHTML =
      '<path class="rm-copy-button-tab" d="M 9.5 3.5 L 14.5 3.5 L 14.5 6 L 9.5 6 L 9.5 3.5"/>' +
      `<path class="rm-copy-button-body" d="${CLIP}"/>`;
    button.prepend(icon);

    const body = icon.querySelector(".rm-copy-button-body");
    const said = announcer(button);
    const ms = dataNumber(button, "rmDuration", duration);
    const back = dataNumber(button, "rmReset", reset);
    const message = dataString(button, "rmDone", done);
    let timer = 0;
    let running = null;

    /** Where the text comes from: a selector, or the attribute's own value. */
    const source = () => {
      const value = dataString(button, "rmCopyButton", "");
      if (!value) return "";
      let from = null;
      // A bad selector is a `SyntaxError`, not a reason to lose the click.
      try { from = document.querySelector(value); } catch { from = null; }
      if (from) return (from.value ?? from.textContent ?? "").trim();
      return value;
    };

    /** Clipboard API first; a selected off-screen field where it is refused. */
    const copy = async (text) => {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          return true;
        }
      } catch { /* A denied permission is not a reason to do nothing at all. */ }
      const shim = document.createElement("textarea");
      shim.value = text;
      shim.setAttribute("readonly", "");
      shim.className = "rm-copy-button-shim";
      document.body.appendChild(shim);
      shim.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch { ok = false; }
      shim.remove();
      return ok;
    };

    const onClick = async () => {
      const text = source();
      if (!text) return;
      const ok = await copy(text);
      if (!ok) return;

      clearTimeout(timer);
      running?.cancel();
      button.classList.add("is-copied");
      running = morphPath(body, CLIP, TICK, ms);
      // One write, one announcement. Setting a live region to the string it
      // already holds says nothing, so it is cleared before it is filled.
      said.textContent = "";
      said.textContent = message;

      timer = setTimeout(() => {
        button.classList.remove("is-copied");
        running?.cancel();
        running = morphPath(body, TICK, CLIP, ms);
        said.textContent = "";
      }, back);
    };

    button.addEventListener("click", onClick);

    cleanups.push(() => {
      clearTimeout(timer);
      running?.cancel();
      button.removeEventListener("click", onClick);
      icon.remove();
      said.remove();
      button.classList.remove("rm-copy-button", "is-copied");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A sun that a moving mask turns into a moon.
 *
 * One disc, one mask. A second circle inside the mask slides across the disc
 * and bites a crescent out of it while the rays shrink into the middle behind
 * it. So the sun does not fade into a moon — it becomes one, and there is no
 * frame in which the icon is two half-transparent icons stacked up. The bite
 * travels by `transform` rather than by animating `cx`, which keeps the whole
 * thing on the compositor.
 *
 * It is a real `<button>` with a real name and `aria-pressed`, because the only
 * thing worse than a theme switch nobody can find is one that announces itself
 * as "button". Persistence is deliberately left to the page: a component that
 * writes to storage is a component with opinions about somebody's session.
 *
 *   <button type="button" data-rm-theme-toggle></button>
 */
export function themeToggle(target = "[data-rm-theme-toggle]", options = {}) {
  const buttons = resolveElements(target);
  if (!buttons.length) return () => {};

  const {
    attribute = "data-theme", dark = "dark", light = "light",
    label = "Dark theme", duration = 480, onChange,
  } = options;
  const cleanups = [];

  for (const button of buttons) {
    button.classList.add("rm-theme-toggle");
    if (button.tagName === "BUTTON" && !button.getAttribute("type")) button.type = "button";

    const attr = dataString(button, "rmAttribute", attribute);
    const onName = dataString(button, "rmDark", dark);
    const offName = dataString(button, "rmLight", light);
    const root = document.documentElement;
    const had = root.getAttribute(attr);

    const id = uid("rm-moon");
    const icon = document.createElementNS(SVG, "svg");
    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("aria-hidden", "true");
    icon.setAttribute("focusable", "false");
    icon.classList.add("rm-theme-toggle-icon");
    // Eight rays in one group, so they scale away together rather than eight
    // animations doing the same thing at the same time.
    const rays = Array.from({ length: 8 }, (_, i) => {
      const angle = (i * Math.PI) / 4;
      const x1 = (12 + Math.cos(angle) * 8.6).toFixed(2);
      const y1 = (12 + Math.sin(angle) * 8.6).toFixed(2);
      const x2 = (12 + Math.cos(angle) * 11).toFixed(2);
      const y2 = (12 + Math.sin(angle) * 11).toFixed(2);
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
    }).join("");
    icon.innerHTML =
      `<defs><mask id="${id}">` +
      '<rect x="0" y="0" width="24" height="24" fill="#fff"/>' +
      '<circle class="rm-theme-toggle-bite" cx="12" cy="12" r="8" fill="#000"/>' +
      "</mask></defs>" +
      `<g class="rm-theme-toggle-rays">${rays}</g>` +
      `<circle class="rm-theme-toggle-disc" cx="12" cy="12" r="6" mask="url(#${id})"/>`;
    button.prepend(icon);

    button.style.setProperty(
      "--rm-theme-toggle-duration",
      `${prefersReducedMotion() ? 0 : dataNumber(button, "rmDuration", duration)}ms`,
    );

    // The starting state is whatever the page already says, and failing that
    // whatever the system says. Assuming "light" flashes a white icon on a dark
    // page for one frame, which is the tell of a switch bolted on afterwards.
    let on = had ? had === onName
      : (typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches);

    const show = () => {
      button.setAttribute("aria-pressed", String(on));
      button.setAttribute("aria-label", dataString(button, "rmLabel", label));
      button.classList.toggle("is-dark", on);
      root.setAttribute(attr, on ? onName : offName);
    };
    show();

    const onClick = () => { on = !on; show(); onChange?.(on ? onName : offName); };
    button.addEventListener("click", onClick);

    cleanups.push(() => {
      button.removeEventListener("click", onClick);
      if (had === null) root.removeAttribute(attr);
      else root.setAttribute(attr, had);
      icon.remove();
      button.removeAttribute("aria-pressed");
      button.removeAttribute("aria-label");
      button.style.removeProperty("--rm-theme-toggle-duration");
      button.classList.remove("rm-theme-toggle", "is-dark");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A figure that spins up and stays readable doing it.
 *
 * The number is tweened as a number and written as text, so every single frame
 * shows a plausible figure: 1,284 arrives through 400 and through 900. The
 * rolling-digit-strip version looks expensive and is unreadable for the whole
 * second it runs, which is a strange thing to do to the one piece of
 * information the control exists to carry.
 *
 * The ramp rides the library's shared frame loop inside `whileVisible`, so a
 * page of counts is not tweening anything in a section nobody has scrolled to.
 * The accessible name is set to the final value straight away — nobody should
 * have to sit and listen to a count being counted.
 *
 *   <button type="button" data-rm-count-button data-rm-value="1284">Stars</button>
 */
export function countButton(target = "[data-rm-count-button]", options = {}) {
  const buttons = resolveElements(target);
  if (!buttons.length) return () => {};

  const { duration = 900, label = "Star", value = 0 } = options;
  const cleanups = [];

  for (const button of buttons) {
    button.classList.add("rm-count-button");
    if (button.tagName === "BUTTON" && !button.getAttribute("type")) button.type = "button";

    const name = dataString(button, "rmLabel", label);
    const ms = dataNumber(button, "rmDuration", duration);
    let total = dataNumber(button, "rmValue", value);
    let on = button.getAttribute("aria-pressed") === "true";

    const star = document.createElementNS(SVG, "svg");
    star.setAttribute("viewBox", "0 0 24 24");
    star.setAttribute("aria-hidden", "true");
    star.setAttribute("focusable", "false");
    star.classList.add("rm-count-button-star");
    star.innerHTML =
      '<path d="M12 3.6 14.6 9l5.9.85-4.25 4.15 1 5.9L12 17.1 6.75 19.9l1-5.9L3.5 9.85 9.4 9Z"/>';

    const face = document.createElement("span");
    face.className = "rm-count-button-figure";
    face.setAttribute("aria-hidden", "true");
    face.textContent = figure(total);

    // Whatever the author wrote inside becomes the word beside the figure.
    const word = document.createElement("span");
    word.className = "rm-count-button-word";
    while (button.firstChild) word.appendChild(button.firstChild);
    button.append(star, word, face);

    const speak = () => {
      button.setAttribute("aria-pressed", String(on));
      button.setAttribute("aria-label", `${name}: ${figure(total)}`);
      button.classList.toggle("is-on", on);
    };
    speak();

    let from = 0;
    let began = 0;
    let flying = false;

    const draw = (at) => { face.textContent = figure(at); };

    const ramp = () => {
      if (prefersReducedMotion() || ms <= 0) { draw(total); return; }
      from = Number(face.textContent.replace(/,/g, "")) || 0;
      began = 0;
      flying = true;
    };

    // One task for the lifetime of the component, returning immediately unless
    // a ramp is actually in flight. Cheaper than adding and removing a task.
    cleanups.push(whileVisible(button, () => {
      // Arriving on screen is what starts the first count.
      ramp();
      const stop = onFrame((now) => {
        if (!flying) return;
        if (!began) began = now;
        const t = clamp((now - began) / ms);
        draw(lerp(from, total, 1 - (1 - t) ** 3));
        if (t >= 1) { flying = false; draw(total); }
      });
      return () => { flying = false; stop(); };
    }));

    const onClick = () => {
      on = !on;
      total += on ? 1 : -1;
      speak();
      ramp();
      if (prefersReducedMotion()) { draw(total); return; }
      star.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.35)" }, { transform: "scale(1)" }],
        { duration: 340, easing: EASE.spring },
      );
    };
    button.addEventListener("click", onClick);

    cleanups.push(() => {
      button.removeEventListener("click", onClick);
      while (word.firstChild) button.appendChild(word.firstChild);
      star.remove();
      word.remove();
      face.remove();
      button.removeAttribute("aria-pressed");
      button.removeAttribute("aria-label");
      button.classList.remove("rm-count-button", "is-on");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * A card that turns on hover and on focus alike.
 *
 * Both faces are in the markup, so the back of the card is text a search engine
 * indexes and a screen reader reads in place — not a string a script paints on
 * later. The turn is one `rotate3d` on a `preserve-3d` wrapper, a single
 * compositor transform rather than a crossfade between two absolutely
 * positioned copies of the same box.
 *
 * The keyboard is the part the usual hover-only version gets wrong twice over.
 * Here the card is reachable, `focusin` turns it exactly as hovering does, and
 * the face pointing away is `inert` so its links are not sitting invisibly in
 * the tab order behind the front. The moment the card turns, the back stops
 * being inert, so carrying on tabbing walks straight into it.
 *
 *   <article data-rm-flip-card><div>Front</div><div>Back</div></article>
 */
export function flipCard(target = "[data-rm-flip-card]", options = {}) {
  const cards = resolveElements(target);
  if (!cards.length) return () => {};

  const { duration = 680, axis = "y" } = options;
  const cleanups = [];

  for (const card of cards) {
    const faces = [...card.children].filter((node) => node instanceof Element);
    if (faces.length < 2) continue;

    const [front, back] = faces;
    const turn = dataString(card, "rmAxis", axis) === "x" ? "1 0 0" : "0 1 0";

    card.classList.add("rm-flip-card");
    card.style.setProperty("--rm-flip-card-axis", turn);
    card.style.setProperty(
      "--rm-flip-card-duration",
      `${prefersReducedMotion() ? 0 : dataNumber(card, "rmDuration", duration)}ms`,
    );

    const inner = document.createElement("div");
    inner.className = "rm-flip-card-inner";
    front.classList.add("rm-flip-card-face", "is-front");
    back.classList.add("rm-flip-card-face", "is-back");
    inner.append(front, back);
    card.appendChild(inner);

    // Focusable only if the author has not already put something focusable
    // inside — otherwise the card and its own link are two stops for one thing.
    const hadTab = card.getAttribute("tabindex");
    const ownFocus = card.querySelector("a[href], button, input, select, textarea, [tabindex]");
    if (!ownFocus && hadTab === null) card.setAttribute("tabindex", "0");

    const turned = (on) => {
      card.classList.toggle("is-turned", on);
      back.inert = !on;
      front.inert = on;
    };
    turned(false);

    const onEnter = () => turned(true);
    const onLeave = () => { if (!card.matches(":focus-within")) turned(false); };
    const onFocusIn = () => turned(true);
    const onFocusOut = () => { if (!card.matches(":hover")) turned(false); };

    card.addEventListener("pointerenter", onEnter);
    card.addEventListener("pointerleave", onLeave);
    card.addEventListener("focusin", onFocusIn);
    card.addEventListener("focusout", onFocusOut);

    cleanups.push(() => {
      card.removeEventListener("pointerenter", onEnter);
      card.removeEventListener("pointerleave", onLeave);
      card.removeEventListener("focusin", onFocusIn);
      card.removeEventListener("focusout", onFocusOut);
      for (const face of [front, back]) {
        face.classList.remove("rm-flip-card-face", "is-front", "is-back");
        face.inert = false;
        card.appendChild(face);
      }
      inner.remove();
      if (!ownFocus && hadTab === null) card.removeAttribute("tabindex");
      card.style.removeProperty("--rm-flip-card-axis");
      card.style.removeProperty("--rm-flip-card-duration");
      card.classList.remove("rm-flip-card", "is-turned");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A bar that morphs between nothing and a selection.
 *
 * "Nothing selected" and "Three selected, here is what you can do" are two
 * different widths, and the honest route between them is a FLIP: measure the
 * pill, swap the faces, measure again, then play the difference back as a
 * `translate` and a `scale`. Transitioning `width` instead relayouts and
 * repaints everything inside the bar on every frame of the change.
 *
 * The scale goes on the painted shell — background, border, shadow, and no text
 * whatsoever — and the body inside it is scaled by the inverse. That is the
 * part people leave out, and it is exactly why their morphing bar squashes its
 * own label horizontally on the way across.
 *
 * It is a real `role="toolbar"`: the arrow keys walk the buttons, only one of
 * them is a tab stop, Escape clears the selection, and the count is announced
 * politely once per change rather than on every tick of a checkbox.
 *
 *   <div data-rm-management-bar>
 *     <p data-rm-bar-face="idle">Nothing selected</p>
 *     <div data-rm-bar-face="selected">…</div>
 *   </div>
 */
export function managementBar(target = "[data-rm-management-bar]", options = {}) {
  const bars = resolveElements(target);
  if (!bars.length) return () => {};

  const { duration = 420, label = "Selection actions", onClear } = options;
  const cleanups = [];

  for (const bar of bars) {
    const idle = bar.querySelector('[data-rm-bar-face="idle"]');
    const busy = bar.querySelector('[data-rm-bar-face="selected"]');
    if (!idle || !busy) continue;

    bar.classList.add("rm-management-bar");
    bar.setAttribute("role", "toolbar");
    bar.setAttribute("aria-label", dataString(bar, "rmLabel", label));
    bar.setAttribute("aria-orientation", "horizontal");

    const shell = document.createElement("div");
    shell.className = "rm-management-bar-shell";
    const body = document.createElement("div");
    body.className = "rm-management-bar-body";
    idle.classList.add("rm-management-bar-face");
    busy.classList.add("rm-management-bar-face");
    body.append(idle, busy);
    shell.appendChild(body);
    bar.appendChild(shell);

    const said = announcer(bar);
    const ms = dataNumber(bar, "rmDuration", duration);
    let count = 0;

    const keys = () => [...busy.querySelectorAll("button:not([disabled])")];
    const roving = () => keys().forEach((key, i) => { key.tabIndex = i === 0 ? 0 : -1; });

    const paint = () => {
      idle.hidden = count > 0;
      busy.hidden = count === 0;
      bar.classList.toggle("is-busy", count > 0);
      for (const slot of busy.querySelectorAll("[data-rm-bar-count]")) {
        slot.textContent = String(count);
      }
      roving();
    };
    paint();

    bar.rmSelect = (next) => {
      const want = Math.max(0, Math.round(next));
      if (want === count) return;
      count = want;
      // Measure the shell, swap the faces, measure again, invert, play.
      const was = shell.getBoundingClientRect();
      paint();
      const now = shell.getBoundingClientRect();
      said.textContent = count === 0 ? "Nothing selected" : `${count} selected`;

      if (prefersReducedMotion() || !was.width || !now.width) return;
      const sx = was.width / now.width;
      const sy = was.height / now.height;
      const dx = (was.left + was.width / 2) - (now.left + now.width / 2);
      shell.animate(
        [{ transform: `translateX(${dx}px) scale(${sx}, ${sy})` }, { transform: "none" }],
        { duration: ms, easing: EASE.out },
      );
      // The inverse, so the text inside never stretches with the box.
      body.animate(
        [{ transform: `scale(${1 / sx}, ${1 / sy})` }, { transform: "none" }],
        { duration: ms, easing: EASE.out },
      );
    };

    const onKey = (event) => {
      if (event.key === "Escape" && count > 0) {
        event.preventDefault();
        bar.rmSelect(0);
        onClear?.();
        return;
      }
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      const stops = keys();
      const at = stops.indexOf(document.activeElement);
      if (at < 0) return;
      event.preventDefault();
      const next = stops[(at + (event.key === "ArrowRight" ? 1 : stops.length - 1)) % stops.length];
      stops.forEach((key) => { key.tabIndex = -1; });
      next.tabIndex = 0;
      next.focus();
    };
    bar.addEventListener("keydown", onKey);

    cleanups.push(() => {
      bar.removeEventListener("keydown", onKey);
      keys().forEach((key) => key.removeAttribute("tabindex"));
      delete bar.rmSelect;
      for (const face of [idle, busy]) {
        face.classList.remove("rm-management-bar-face");
        face.hidden = false;
        bar.appendChild(face);
      }
      shell.remove();
      said.remove();
      bar.removeAttribute("role");
      bar.removeAttribute("aria-label");
      bar.removeAttribute("aria-orientation");
      bar.classList.remove("rm-management-bar", "is-busy");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Pinned rows travel to the top and stay marked.
 *
 * Pinning reorders the real DOM and then plays every row back from where it
 * was, so the pinned one visibly climbs past the others instead of teleporting
 * — and because the order in the document is the order on the screen, the list
 * still makes sense to anything that is not looking at it.
 *
 * Two ways in, on purpose. The drag is the nice one; the button is the one that
 * works with a keyboard, a switch, a screen reader and a trackpad somebody is
 * not confident with, and it carries `aria-pressed` so the state is a fact
 * rather than a shade of grey. A drag-only affordance is a feature that half of
 * your visitors simply do not have.
 *
 *   <ul data-rm-pin-list><li>Brief.pdf</li><li>Invoice.pdf</li></ul>
 */
export function pinList(target = "[data-rm-pin-list]", options = {}) {
  const lists = resolveElements(target);
  if (!lists.length) return () => {};

  const { duration = 420, distance = 34 } = options;
  const cleanups = [];

  for (const list of lists) {
    const rows = [...list.children].filter((node) => node instanceof Element);
    if (!rows.length) continue;

    list.classList.add("rm-pin-list");
    const ms = dataNumber(list, "rmDuration", duration);
    const throwAt = dataNumber(list, "rmDistance", distance);
    const said = announcer(list);
    const order = new Map(rows.map((row, i) => [row, i]));
    const pinned = new Set();
    const pins = [];

    const reorder = () => {
      const next = [...order.keys()].sort((a, b) => {
        const byPin = Number(pinned.has(b)) - Number(pinned.has(a));
        return byPin || order.get(a) - order.get(b);
      });
      flipRows([...order.keys()], () => next.forEach((row) => list.appendChild(row)), ms);
    };

    const setPin = (row, on, name) => {
      if (on) pinned.add(row); else pinned.delete(row);
      row.classList.toggle("is-pinned", on);
      row.querySelector(".rm-pin-list-pin")?.setAttribute("aria-pressed", String(on));
      reorder();
      said.textContent = "";
      said.textContent = `${name} ${on ? "pinned to the top" : "unpinned"}`;
    };

    for (const row of rows) {
      row.classList.add("rm-pin-list-row");
      const name = row.textContent.trim() || "Item";

      const pin = document.createElement("button");
      pin.type = "button";
      pin.className = "rm-pin-list-pin";
      pin.setAttribute("aria-pressed", "false");
      // An icon-only control with a name, because "button" is not a label.
      pin.setAttribute("aria-label", `Pin ${name}`);
      pin.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
        '<path d="M9 3h6l-1 6 4 4H6l4-4Z"/><path d="M12 13v8"/></svg>';
      pin.addEventListener("click", () => setPin(row, !pinned.has(row), name));
      row.appendChild(pin);
      pins.push(pin);

      // The drag: lift the row, and releasing it above where it started pins
      // it. It is a shortcut to the button, never the only route.
      let holding = false;
      let start = 0;
      let moved = 0;
      const onDown = (event) => {
        if (event.button > 0 || event.target.closest("button, a[href]")) return;
        holding = true;
        start = event.clientY;
        moved = 0;
        row.classList.add("is-lifting");
        row.setPointerCapture?.(event.pointerId);
      };
      const onMove = (event) => {
        if (!holding) return;
        moved = event.clientY - start;
        row.style.transform = `translateY(${moved}px)`;
      };
      const onUp = (event) => {
        if (!holding) return;
        holding = false;
        row.releasePointerCapture?.(event.pointerId);
        row.classList.remove("is-lifting");
        row.style.transform = "";
        if (moved < -throwAt && !pinned.has(row)) setPin(row, true, name);
        else if (moved > throwAt && pinned.has(row)) setPin(row, false, name);
      };
      row.addEventListener("pointerdown", onDown);
      row.addEventListener("pointermove", onMove);
      row.addEventListener("pointerup", onUp);
      row.addEventListener("pointercancel", onUp);

      cleanups.push(() => {
        row.removeEventListener("pointerdown", onDown);
        row.removeEventListener("pointermove", onMove);
        row.removeEventListener("pointerup", onUp);
        row.removeEventListener("pointercancel", onUp);
      });
    }

    cleanups.push(() => {
      pins.forEach((pin) => pin.remove());
      said.remove();
      // Back into the order the author wrote them in.
      [...order.keys()]
        .sort((a, b) => order.get(a) - order.get(b))
        .forEach((row) => {
          row.classList.remove("rm-pin-list-row", "is-pinned", "is-lifting");
          row.style.transform = "";
          list.appendChild(row);
        });
      list.classList.remove("rm-pin-list");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A link floats a card that never leaves the viewport.
 *
 * One card, created once and moved between links, rather than one card per
 * link. A page of forty footnotes is then forty attributes and one node — the
 * per-link version is forty absolutely positioned cards, forty images the
 * browser may well decide to fetch, and a stutter the first time you scroll.
 *
 * Position is arithmetic on two rectangles: centred on the link, clamped to the
 * viewport with a margin, and flipped to below the link when there is no room
 * above it. A card that opens off the edge of a phone is a card nobody sees.
 *
 * It is announced to nobody. The card is `aria-hidden` and never takes focus,
 * because the link already says where it goes and the picture adds nothing a
 * screen reader wants read out on the way past.
 *
 *   <a href="/work/atlas" data-rm-preview-link
 *      data-rm-card-title="Atlas — identity and site"
 *      data-rm-card-image="/work/atlas-cover.jpg">Atlas</a>
 */
export function previewLinkCard(target = "[data-rm-preview-link]", options = {}) {
  const links = resolveElements(target);
  if (!links.length) return () => {};

  const { delay = 140, width = 260, offset = 12 } = options;

  const card = document.createElement("div");
  card.className = "rm-preview-link-card";
  card.setAttribute("aria-hidden", "true");
  card.hidden = true;
  document.body.appendChild(card);

  const picture = document.createElement("img");
  picture.className = "rm-preview-link-image";
  picture.alt = "";
  picture.decoding = "async";
  const title = document.createElement("strong");
  title.className = "rm-preview-link-title";
  const where = document.createElement("span");
  where.className = "rm-preview-link-where";
  card.append(picture, title, where);

  const canHover = typeof matchMedia === "function" ? matchMedia("(hover: hover)").matches : true;
  const cleanups = [];
  let timer = 0;

  const place = (link) => {
    const box = link.getBoundingClientRect();
    const own = card.getBoundingClientRect();
    const gap = dataNumber(link, "rmOffset", offset);
    const left = clamp(
      box.left + box.width / 2 - own.width / 2,
      8,
      Math.max(8, innerWidth - own.width - 8),
    );
    // Above when it fits, below when it does not.
    const above = box.top - own.height - gap;
    const top = above < 8 ? box.bottom + gap : above;
    card.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
  };

  const show = (link) => {
    const src = dataString(link, "rmCardImage", "");
    picture.hidden = !src;
    if (src) picture.src = src;
    title.textContent = dataString(link, "rmCardTitle", link.textContent.trim());
    where.textContent = link.getAttribute("href") ?? "";
    card.style.setProperty("--rm-preview-link-width", `${dataNumber(link, "rmWidth", width)}px`);

    card.hidden = false;
    // Measured after it is laid out, or its own height is zero and it lands
    // one card's worth too high.
    place(link);
    card.classList.add("is-open");
    if (prefersReducedMotion()) return;
    card.animate(
      [{ opacity: 0, scale: "0.96" }, { opacity: 1, scale: "1" }],
      { duration: 220, easing: EASE.out },
    );
  };

  const hide = () => {
    clearTimeout(timer);
    card.classList.remove("is-open");
    card.hidden = true;
  };

  for (const link of links) {
    link.classList.add("rm-preview-link");
    const wait = dataNumber(link, "rmDelay", delay);

    const onIn = () => {
      clearTimeout(timer);
      timer = setTimeout(() => show(link), wait);
    };
    // Focus opens it at once: a keyboard has no way to hover patiently.
    const onFocus = () => { clearTimeout(timer); show(link); };

    if (canHover) {
      link.addEventListener("pointerenter", onIn);
      link.addEventListener("pointerleave", hide);
    }
    link.addEventListener("focus", onFocus);
    link.addEventListener("blur", hide);

    cleanups.push(() => {
      link.removeEventListener("pointerenter", onIn);
      link.removeEventListener("pointerleave", hide);
      link.removeEventListener("focus", onFocus);
      link.removeEventListener("blur", hide);
      link.classList.remove("rm-preview-link");
    });
  }

  // Anything that moves the page moves the card's anchor, so the card goes.
  addEventListener("scroll", hide, { passive: true });
  addEventListener("resize", hide);

  return () => {
    clearTimeout(timer);
    removeEventListener("scroll", hide);
    removeEventListener("resize", hide);
    cleanups.forEach((stop) => stop());
    card.remove();
  };
}

/**
 * Folders opening to their own height, with arrow keys.
 *
 * A folder does not know how tall it is, and nothing in CSS used to be able to
 * animate to an unknown height. `grid-template-rows: 0fr -> 1fr` can: the
 * drawer is a one-row grid and the row goes from no share of the space to all
 * of it, so the transition runs between two track sizes rather than between two
 * pixel heights somebody had to measure first. Where a browser cannot
 * interpolate it, the folder snaps open — never stuck shut.
 *
 * The indent guides are one `repeating-linear-gradient` on the tree, drawn only
 * as far across as the deepest level actually goes. The obvious implementation
 * puts a bordered spacer inside every row at every level, which on a real
 * project tree is a few thousand elements drawing a few thousand hairlines.
 *
 * It is a genuine `role="tree"`: one tab stop with a roving `tabindex`, arrow
 * keys down and up through what is visible, right to open or descend, left to
 * close or climb, Home and End, and `aria-expanded` on every folder so that a
 * screen reader knows what is shut. A closed drawer is `inert`, so the rows
 * inside it are not quietly still in the tab order.
 *
 *   <ul data-rm-file-tree><li>src<ul><li>motion.js</li></ul></li></ul>
 */
export function fileTree(target = "[data-rm-file-tree]", options = {}) {
  const trees = resolveElements(target);
  if (!trees.length) return () => {};

  const { indent = 18, duration = 300, open = 1 } = options;
  const cleanups = [];

  for (const tree of trees) {
    tree.classList.add("rm-file-tree");
    tree.setAttribute("role", "tree");
    tree.style.setProperty("--rm-file-tree-indent", `${dataNumber(tree, "rmIndent", indent)}px`);
    tree.style.setProperty(
      "--rm-file-tree-duration",
      `${prefersReducedMotion() ? 0 : dataNumber(tree, "rmDuration", duration)}ms`,
    );
    const depthOpen = dataNumber(tree, "rmOpen", open);

    const drawers = [];
    let deepest = 0;

    /** Wrap every nested list in a drawer, and mark up the rows. */
    const walk = (list, depth) => {
      deepest = Math.max(deepest, depth);
      for (const row of [...list.children]) {
        if (!(row instanceof Element)) continue;
        row.classList.add("rm-file-tree-row");
        row.setAttribute("role", "treeitem");
        row.tabIndex = -1;

        const kids = row.querySelector(":scope > ul, :scope > ol");
        if (!kids) { row.classList.add("is-file"); continue; }

        row.classList.add("is-folder");
        kids.setAttribute("role", "group");
        const drawer = document.createElement("div");
        drawer.className = "rm-file-tree-drawer";
        kids.before(drawer);
        drawer.appendChild(kids);
        drawers.push(drawer);

        const shut = depth >= depthOpen;
        row.setAttribute("aria-expanded", String(!shut));
        drawer.classList.toggle("is-open", !shut);
        drawer.inert = shut;

        walk(kids, depth + 1);
      }
    };
    walk(tree, 0);
    tree.style.setProperty("--rm-file-tree-depth", String(deepest));

    const drawerOf = (row) => row.querySelector(":scope > .rm-file-tree-drawer");
    const isOpen = (row) => row.getAttribute("aria-expanded") === "true";

    const setOpen = (row, on) => {
      const drawer = drawerOf(row);
      if (!drawer) return;
      row.setAttribute("aria-expanded", String(on));
      drawer.classList.toggle("is-open", on);
      drawer.inert = !on;
    };

    /** Every row not sitting inside something closed, top to bottom. */
    const visible = () => [...tree.querySelectorAll('[role="treeitem"]')]
      .filter((row) => {
        for (let up = row.parentElement; up && up !== tree; up = up.parentElement) {
          if (up.classList.contains("rm-file-tree-drawer") && !up.classList.contains("is-open")) {
            return false;
          }
        }
        return true;
      });

    const focusRow = (row) => {
      if (!row) return;
      for (const other of tree.querySelectorAll('[role="treeitem"]')) other.tabIndex = -1;
      row.tabIndex = 0;
      row.focus();
    };
    // One tab stop into the whole tree, which is the entire point of a roving
    // index: Tab reaches the tree, the arrows move about inside it.
    const first = tree.querySelector('[role="treeitem"]');
    if (first) first.tabIndex = 0;

    const onKey = (event) => {
      const row = event.target.closest('[role="treeitem"]');
      if (!row || !tree.contains(row)) return;
      const rows = visible();
      const at = rows.indexOf(row);

      switch (event.key) {
        case "ArrowDown": event.preventDefault(); focusRow(rows[at + 1]); break;
        case "ArrowUp": event.preventDefault(); focusRow(rows[at - 1]); break;
        case "Home": event.preventDefault(); focusRow(rows[0]); break;
        case "End": event.preventDefault(); focusRow(rows[rows.length - 1]); break;
        case "ArrowRight":
          event.preventDefault();
          if (drawerOf(row) && !isOpen(row)) setOpen(row, true);
          else focusRow(rows[at + 1]);
          break;
        case "ArrowLeft":
          event.preventDefault();
          if (drawerOf(row) && isOpen(row)) setOpen(row, false);
          else focusRow(row.parentElement?.closest('[role="treeitem"]'));
          break;
        case "Enter":
        case " ":
          if (!drawerOf(row)) return;
          event.preventDefault();
          setOpen(row, !isOpen(row));
          break;
        default: return;
      }
    };

    const onClick = (event) => {
      const row = event.target.closest('[role="treeitem"]');
      if (!row || !tree.contains(row) || !drawerOf(row)) return;
      setOpen(row, !isOpen(row));
      focusRow(row);
    };

    tree.addEventListener("keydown", onKey);
    tree.addEventListener("click", onClick);

    cleanups.push(() => {
      tree.removeEventListener("keydown", onKey);
      tree.removeEventListener("click", onClick);
      for (const drawer of drawers) {
        drawer.inert = false;
        const kids = drawer.firstElementChild;
        if (kids) { kids.removeAttribute("role"); drawer.before(kids); }
        drawer.remove();
      }
      for (const row of tree.querySelectorAll('[role="treeitem"]')) {
        row.classList.remove("rm-file-tree-row", "is-folder", "is-file");
        row.removeAttribute("role");
        row.removeAttribute("aria-expanded");
        row.removeAttribute("tabindex");
      }
      tree.removeAttribute("role");
      tree.style.removeProperty("--rm-file-tree-indent");
      tree.style.removeProperty("--rm-file-tree-duration");
      tree.style.removeProperty("--rm-file-tree-depth");
      tree.classList.remove("rm-file-tree");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * People arriving at a document, announced once each.
 *
 * Every avatar has the person's name beside it as real text, and the image
 * carries `alt=""` because the name is already there — an avatar with the name
 * in its `alt` and the same name next to it is the name read out twice. The
 * overflow is a sentence, "and three others", not a circle with a number in it
 * that a screen reader walks straight past.
 *
 * An arrival is announced once, politely, through one live region the row owns.
 * Putting `aria-live` on the list itself announces the whole row again every
 * time anybody moves, because a FLIP reorders real nodes and the live region
 * dutifully reads every one of them back to you.
 *
 *   <ul data-rm-presence-row><li><img src="/people/ana.jpg" alt=""><span>Ana</span></li></ul>
 */
export function presenceRow(target = "[data-rm-presence-row]", options = {}) {
  const rows = resolveElements(target);
  if (!rows.length) return () => {};

  const { duration = 420, max = 5, label = "People in this document" } = options;
  const cleanups = [];

  for (const row of rows) {
    row.classList.add("rm-presence-row");
    row.setAttribute("role", "list");
    row.setAttribute("aria-label", dataString(row, "rmLabel", label));

    const said = announcer(row);
    const ms = dataNumber(row, "rmDuration", duration);
    const many = Math.max(1, dataNumber(row, "rmMax", max));
    const started = [...row.children].filter((node) => node instanceof Element && node !== said);
    let more = null;

    const people = () => [...row.children]
      .filter((node) => node instanceof Element && node !== more && node !== said);

    const trim = () => {
      const all = people();
      all.forEach((one, i) => {
        one.classList.add("rm-presence-row-person");
        one.hidden = i >= many;
      });
      const over = Math.max(0, all.length - many);
      if (over && !more) {
        more = document.createElement("li");
        more.className = "rm-presence-row-more";
        row.appendChild(more);
      }
      if (more) {
        more.hidden = over === 0;
        more.textContent = over ? `and ${over} ${over === 1 ? "other" : "others"}` : "";
      }
    };
    trim();

    row.rmArrive = (name, src) => {
      const one = document.createElement("li");
      one.className = "rm-presence-row-person";
      const face = document.createElement("img");
      if (src) face.src = src;
      // Empty alt on purpose: the name is right there beside it as text.
      face.alt = "";
      face.decoding = "async";
      const word = document.createElement("span");
      word.textContent = name;
      one.append(face, word);

      // Always ahead of the announcer and the overflow sentence, both of which
      // live at the end of the row.
      flipRows(people(), () => {
        row.insertBefore(one, said);
        trim();
      }, ms);

      said.textContent = "";
      said.textContent = `${name} joined`;
      if (!prefersReducedMotion() && !one.hidden) {
        one.animate(
          [{ opacity: 0, transform: "scale(0.6)" }, { opacity: 1, transform: "none" }],
          { duration: ms, easing: EASE.spring },
        );
      }
      return one;
    };

    row.rmLeave = (name) => {
      const one = people().find((node) => node.textContent.trim() === name);
      if (!one) return;
      const go = () => {
        flipRows(people().filter((node) => node !== one), () => { one.remove(); trim(); }, ms);
        said.textContent = "";
        said.textContent = `${name} left`;
      };
      if (prefersReducedMotion()) { go(); return; }
      one.animate(
        [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(0.6)" }],
        { duration: 200, easing: EASE.inOut, fill: "forwards" },
      ).finished.then(go, go);
    };

    cleanups.push(() => {
      delete row.rmArrive;
      delete row.rmLeave;
      more?.remove();
      said.remove();
      // Only the people the author wrote stay; anybody who arrived, leaves.
      for (const one of people()) {
        if (started.includes(one)) {
          one.classList.remove("rm-presence-row-person");
          one.hidden = false;
        } else one.remove();
      }
      row.removeAttribute("role");
      row.removeAttribute("aria-label");
      row.classList.remove("rm-presence-row");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * One path interpolating between two shapes.
 *
 * A rotating hamburger is the version that can only ever become an X, because
 * all it can do is rotate the three bars it already has. Here both states are
 * path data carrying the same commands in the same order, so the top bar
 * travels into one diagonal, the bottom into the other, and the middle bar
 * collapses into a point that is genuinely nowhere. The same skeleton turns a
 * play triangle into two pause bars, a plus into a minus, and a chevron over.
 *
 * Every pair is written with matching commands on purpose — where one shape has
 * fewer corners it gets a degenerate point, a line to where it already is.
 * Interpolating mismatched paths is what makes a morph jump halfway through,
 * and it is the reason most of these end up done as two crossfading icons.
 *
 * It is a real toggle: `aria-expanded` for the pairs that open something and
 * `aria-pressed` for the ones that are simply on or off, with a name for each
 * state, because an icon-only control with no name is a control nobody can use.
 *
 *   <button type="button" data-rm-morph-icon="menu"></button>
 */
export function morphIcon(target = "[data-rm-morph-icon]", options = {}) {
  const buttons = resolveElements(target);
  if (!buttons.length) return () => {};

  const { duration = 380, shape = "menu" } = options;

  const SHAPES = {
    menu: {
      off: "M 4 7 L 20 7 M 4 12 L 20 12 M 4 17 L 20 17",
      on: "M 6 6 L 18 18 M 12 12 L 12 12 M 6 18 L 18 6",
      filled: false,
      names: ["Open menu", "Close menu"],
      flag: "aria-expanded",
    },
    play: {
      off: "M 8 5 L 12.5 7.9 L 12.5 16.1 L 8 19 Z M 12.5 7.9 L 17 11.9 L 17 12.1 L 12.5 16.1 Z",
      on: "M 8 5 L 11 5 L 11 19 L 8 19 Z M 14 5 L 17 5 L 17 19 L 14 19 Z",
      filled: true,
      names: ["Play", "Pause"],
      flag: "aria-pressed",
    },
    plus: {
      off: "M 12 5 L 12 19 M 5 12 L 19 12",
      on: "M 12 12 L 12 12 M 5 12 L 19 12",
      filled: false,
      names: ["Expand", "Collapse"],
      flag: "aria-expanded",
    },
    chevron: {
      off: "M 6 10 L 12 16 L 18 10",
      on: "M 6 14 L 12 8 L 18 14",
      filled: false,
      names: ["Show more", "Show less"],
      flag: "aria-expanded",
    },
  };

  const cleanups = [];

  for (const button of buttons) {
    // An unrecognised name is a typo, not a request for nothing at all.
    const pair = SHAPES[dataString(button, "rmMorphIcon", shape)] ?? SHAPES.menu;
    const flag = dataString(button, "rmState", "") === "pressed" ? "aria-pressed" : pair.flag;

    button.classList.add("rm-morph-icon", pair.filled ? "is-filled" : "is-stroked");
    if (button.tagName === "BUTTON" && !button.getAttribute("type")) button.type = "button";

    const icon = document.createElementNS(SVG, "svg");
    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("aria-hidden", "true");
    icon.setAttribute("focusable", "false");
    icon.classList.add("rm-morph-icon-art");
    icon.innerHTML = `<path class="rm-morph-icon-path" d="${pair.off}"/>`;
    button.prepend(icon);

    const path = icon.querySelector(".rm-morph-icon-path");
    const ms = dataNumber(button, "rmDuration", duration);
    const names = [
      dataString(button, "rmLabel", pair.names[0]),
      dataString(button, "rmDone", pair.names[1]),
    ];

    let on = button.getAttribute(flag) === "true";
    let running = null;

    const show = (moving) => {
      button.setAttribute(flag, String(on));
      button.setAttribute("aria-label", names[on ? 1 : 0]);
      button.classList.toggle("is-on", on);
      running?.cancel();
      if (moving) running = morphPath(path, on ? pair.off : pair.on, on ? pair.on : pair.off, ms);
      else path.setAttribute("d", on ? pair.on : pair.off);
    };
    show(false);

    const onClick = () => { on = !on; show(true); };
    button.addEventListener("click", onClick);

    cleanups.push(() => {
      running?.cancel();
      button.removeEventListener("click", onClick);
      icon.remove();
      button.removeAttribute(flag);
      button.removeAttribute("aria-label");
      button.classList.remove("rm-morph-icon", "is-filled", "is-stroked", "is-on");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}
