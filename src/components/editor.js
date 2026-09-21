/**
 * Writing and editing surfaces — the chrome around the text.
 *
 *   • editorToolbar()    — a real toolbar: one tab stop, arrows inside it.
 *   • bubbleMenu()       — formatting at the selection, reachable without a mouse.
 *   • slashMenu()        — a command palette a character opens, filtering as you type.
 *   • mentionPicker()    — a real combobox that inserts the name it announced.
 *   • blockHandle()      — drag to reorder blocks, and move them from the keyboard.
 *   • fencedCode()        — a fenced block with a language label and a copy button.
 *   • markdownPreview()  — two panes, scroll linked, neither fighting the other.
 *   • findReplace()      — search over the text without rewriting the text.
 *   • commentThread()    — anchored to a range, opened by a real disclosure.
 *   • suggestion()       — a tracked change with accept and reject.
 *   • versionChip()      — when this version was, in words that stay true.
 *   • outlinePane()      — the headings as a real tree, marking where you are.
 *   • wordCount()        — announced politely, and only once it starts to matter.
 *   • autosaveBadge()    — saving, saved, failed, as text rather than a colour.
 *   • selectionToolbar() — actions for selected text, docked rather than floating.
 *   • typewriterMode()   — the caret line stays put and the page moves under it.
 *
 * None of this is a rich-text engine. Every component here sits beside a
 * writing surface — a `<textarea>`, or an element with `contenteditable` — and
 * none of them owns the text. That boundary is deliberate: the moment a
 * component starts rewriting the document to do its job it also destroys the
 * caret, the undo stack and the selection, which is how most editor chrome
 * ends up fighting the editor it decorates. So `findReplace` highlights with
 * the CSS Custom Highlight API rather than wrapping matches in spans,
 * `commentThread` marks a range that is already in the markup rather than
 * inventing one, and the caret is measured, never nudged with a probe node.
 *
 * Two further rules run through the whole file. An editor is used for hours at
 * a time by people who are typing, so nothing here may steal focus or
 * interrupt: the menus keep the caret in the surface and drive themselves with
 * `aria-activedescendant`, and the counters go quiet until a number actually
 * matters. And an editor is used by people who cannot see it, so every state
 * that is drawn is also said — "saved", "12 matches", "moved to position 2 of
 * 5" — because a green tick and a highlighted rectangle are not messages.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import {
  clamp, dataNumber, dataString, EASE, keepInView, lerp, onFrame,
  prefersReducedMotion, resolveElements, whileVisible,
} from "../core/motion.js";

/** An id for the `aria-` wiring that needs one, without demanding it in markup. */
const uid = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

/** A live region owned by one component and removed with it. */
function announcer(holder, tone = "polite") {
  // A `<span>` rather than a `<p>`: these are appended inside `<pre>` and
  // inside running sentences, where a block element is invalid markup.
  const said = document.createElement("span");
  said.className = "rm-editor-live";
  said.setAttribute("aria-live", tone);
  said.setAttribute("role", tone === "assertive" ? "alert" : "status");
  holder.appendChild(said);
  return said;
}

/** Text that is read but never drawn — the spoken half of a visual signal. */
function quiet(text) {
  const span = document.createElement("span");
  span.className = "rm-editor-quiet";
  span.textContent = text;
  return span;
}

/** Is this surface a form field, rather than a `contenteditable` element? */
const isField = (el) => el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement;

/** The text of a surface, whichever of the two kinds it is. */
const readText = (el) => (isField(el) ? el.value : el.textContent ?? "");

/**
 * The writing surface a panel is attached to.
 *
 * The attribute carries an id — `data-rm-slash-menu="draft"` — because a panel
 * and its surface are usually siblings in the markup rather than nested, and
 * an id reference is the only wiring that survives being moved around. Failing
 * that, the first element matching the `surface` option is used, which is what
 * a single-editor page wants.
 */
function surfaceFor(panel, attribute, selector) {
  const id = panel.getAttribute(attribute);
  const named = id ? document.getElementById(id) : null;
  return named ?? (selector ? document.querySelector(selector) : null);
}

/**
 * Where the caret is, in viewport coordinates.
 *
 * For a `contenteditable` the selection can be measured directly. The tempting
 * fix when a collapsed range at the start of a line measures as a zero-sized
 * rectangle is to insert a zero-width span and measure that — never do it: the
 * probe lands in the document, in the undo stack, and in whatever the author
 * later saves. Falling back to the first client rect, and then to the line box
 * of the surface itself, is worse arithmetic and a document nobody corrupted.
 */
function caretRect(surface) {
  if (isField(surface)) return fieldCaretRect(surface);

  const selection = document.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  if (!surface.contains(range.startContainer)) return null;

  const rects = range.getClientRects();
  if (rects.length) return rects[rects.length - 1];
  const box = range.getBoundingClientRect();
  if (box.width || box.height) return box;
  return null;
}

/** Computed properties a mirror needs before it wraps text the same way. */
const MIRROR_PROPERTIES = [
  "boxSizing", "borderBottomWidth", "borderLeftWidth", "borderRightWidth", "borderTopWidth",
  "fontFamily", "fontSize", "fontStretch", "fontStyle", "fontVariant", "fontWeight",
  "letterSpacing", "lineHeight", "paddingBottom", "paddingLeft", "paddingRight", "paddingTop",
  "tabSize", "textIndent", "textTransform", "wordSpacing",
];

/**
 * Where the caret is inside a `<textarea>`.
 *
 * A textarea has no selection geometry at all — `getClientRects` on a range
 * inside one returns nothing, because its text is not in the document tree. So
 * the standard answer is a mirror: an offscreen div wearing the same font,
 * padding, border and width, filled with the text up to the caret plus one
 * marker, measured, and thrown away. Guessing instead from `line-height` times
 * the number of newlines is the version that looks right until the first
 * wrapped line and is then wrong for the rest of the document.
 */
function fieldCaretRect(field) {
  const style = getComputedStyle(field);
  const mirror = document.createElement("div");
  for (const name of MIRROR_PROPERTIES) mirror.style[name] = style[name];
  // Set from script, never a stylesheet: this is a measuring instrument, not
  // content, and it must never be something a missing script leaves on screen.
  mirror.style.position = "absolute";
  mirror.style.top = "0";
  mirror.style.left = "-9999px";
  mirror.style.visibility = "hidden";
  mirror.style.whiteSpace = "pre-wrap";
  mirror.style.overflowWrap = "break-word";
  mirror.style.width = `${field.clientWidth}px`;

  const at = field.selectionStart ?? 0;
  mirror.textContent = field.value.slice(0, at);
  const mark = document.createElement("span");
  // A marker with nothing in it has no height, so it borrows the next
  // character — or a full stop when the caret is at the very end.
  mark.textContent = field.value.slice(at, at + 1) || ".";
  mirror.appendChild(mark);

  document.body.appendChild(mirror);
  const spot = mark.getBoundingClientRect();
  const frame = mirror.getBoundingClientRect();
  mirror.remove();

  const box = field.getBoundingClientRect();
  return new DOMRect(
    box.left + (spot.left - frame.left) - field.scrollLeft,
    box.top + (spot.top - frame.top) - field.scrollTop,
    spot.width,
    spot.height,
  );
}

/** The text between the start of the surface and the caret. */
function beforeCaret(surface) {
  if (isField(surface)) return surface.value.slice(0, surface.selectionStart ?? 0);

  const selection = document.getSelection();
  if (!selection || !selection.focusNode || !surface.contains(selection.focusNode)) return "";
  const range = document.createRange();
  range.selectNodeContents(surface);
  range.setEnd(selection.focusNode, selection.focusOffset);
  return range.toString();
}

/**
 * Take `howMany` characters back from the caret and put `insert` there.
 *
 * Both surfaces get a real `input` event afterwards, because a programmatic
 * change that does not fire one is a change the page around it never hears
 * about — the autosave never runs and the word count never moves. In a
 * `contenteditable` this assumes the trigger and the query are in one text
 * node, which is exactly what typing produces.
 */
function replaceBeforeCaret(surface, howMany, insert) {
  if (isField(surface)) {
    const at = surface.selectionStart ?? 0;
    surface.setRangeText(insert, Math.max(0, at - howMany), at, "end");
    surface.dispatchEvent(new Event("input", { bubbles: true }));
    return;
  }

  const selection = document.getSelection();
  const node = selection?.focusNode;
  if (!node || node.nodeType !== Node.TEXT_NODE) return;

  const at = selection.focusOffset;
  const range = document.createRange();
  range.setStart(node, Math.max(0, at - howMany));
  range.setEnd(node, at);
  range.deleteContents();
  if (insert) {
    const text = document.createTextNode(insert);
    range.insertNode(text);
    range.setStartAfter(text);
  }
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
  surface.dispatchEvent(new InputEvent("input", { bubbles: true }));
}

/**
 * One tab stop for a group of controls, arrows to move between them.
 *
 * A toolbar with fifteen buttons in the tab order is fifteen presses between
 * the text and whatever comes after it. The roving tabindex is the fix the
 * ARIA practices describe and almost nobody implements: exactly one control is
 * reachable with Tab, and the arrow keys move within the group.
 */
function roving(container, getItems, orientation = "horizontal") {
  const before = new Map();
  for (const item of getItems()) before.set(item, item.getAttribute("tabindex"));

  const usable = () => getItems().filter((item) => !item.disabled && !item.hidden);
  const focusOn = (item) => {
    for (const other of getItems()) other.tabIndex = other === item ? 0 : -1;
  };
  focusOn(usable()[0] ?? null);

  const onKey = (event) => {
    const list = usable();
    const at = list.indexOf(document.activeElement);
    if (at < 0) return;

    const onward = orientation === "vertical" ? "ArrowDown" : "ArrowRight";
    const back = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
    let to = -1;
    if (event.key === onward) to = (at + 1) % list.length;
    else if (event.key === back) to = (at - 1 + list.length) % list.length;
    else if (event.key === "Home") to = 0;
    else if (event.key === "End") to = list.length - 1;
    if (to < 0) return;

    event.preventDefault();
    focusOn(list[to]);
    list[to].focus();
  };

  const onFocusIn = (event) => {
    const item = getItems().find((one) => one === event.target || one.contains(event.target));
    if (item) focusOn(item);
  };

  container.addEventListener("keydown", onKey);
  container.addEventListener("focusin", onFocusIn);

  return () => {
    container.removeEventListener("keydown", onKey);
    container.removeEventListener("focusin", onFocusIn);
    for (const [item, was] of before) {
      if (was === null) item.removeAttribute("tabindex");
      else item.setAttribute("tabindex", was);
    }
  };
}

/** Move a floating panel to a point, using transform alone. */
function placeAt(panel, x, y, margin = 8) {
  const box = panel.getBoundingClientRect();
  const left = clamp(x - box.width / 2, margin, Math.max(margin, innerWidth - box.width - margin));
  const top = clamp(y, margin, Math.max(margin, innerHeight - box.height - margin));
  panel.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
}

/**
 * Play the difference between where things were and where they now are.
 *
 * The invert half of a FLIP. The reorder has already happened in the DOM and
 * every block is already in its final place; this animates the gap with a
 * transform, so a list can rearrange itself without a single frame of animated
 * `top` or `height`.
 */
function flipAll(boxes, duration = 260, skip = null) {
  if (prefersReducedMotion()) return;
  for (const [element, was] of boxes) {
    if (element === skip || !element.isConnected) continue;
    const now = element.getBoundingClientRect();
    const dx = was.left - now.left;
    const dy = was.top - now.top;
    if (!dx && !dy) continue;
    element.animate(
      [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }],
      { duration, easing: EASE.out },
    );
  }
}

/**
 * A real toolbar: one tab stop, arrows inside it.
 *
 * `role="toolbar"` with a roving tabindex, so Tab enters the group once and
 * lands back in the text, and the arrows move between bold, italic and the
 * rest. Any button that already carries `aria-pressed` is treated as a toggle
 * and flipped on click, which is the attribute that makes "bold is on" a fact
 * rather than a shade of grey. The press feedback is a scale on the button, so
 * the row never reflows as states change.
 *
 * The usual version is a `<div>` of buttons with a class for the active one:
 * fifteen tab stops, no announced state, and no way to tell an enabled button
 * from a pressed one without looking.
 *
 *   <div data-rm-editor-toolbar data-rm-label="Formatting">
 *     <button type="button" aria-pressed="false">Bold</button>
 *   </div>
 */
export function editorToolbar(target = "[data-rm-editor-toolbar]", options = {}) {
  const bars = resolveElements(target);
  if (!bars.length) return () => {};

  const { label = "Formatting", orientation = "horizontal", items = "button" } = options;
  const cleanups = [];

  for (const bar of bars) {
    const way = dataString(bar, "rmOrientation", orientation) === "vertical" ? "vertical" : "horizontal";
    bar.classList.add("rm-editor-toolbar", `is-${way}`);
    bar.setAttribute("role", "toolbar");
    bar.setAttribute("aria-orientation", way);
    bar.setAttribute("aria-label", dataString(bar, "rmLabel", label));

    const buttons = [...bar.querySelectorAll(items)];
    for (const button of buttons) {
      if (button.tagName === "BUTTON" && !button.hasAttribute("type")) button.type = "button";
      button.classList.add("rm-editor-toolbar-button");
    }

    const stopRoving = roving(bar, () => buttons, way);

    const onClick = (event) => {
      const button = buttons.find((one) => one === event.target || one.contains(event.target));
      if (!button || !button.hasAttribute("aria-pressed")) return;
      const on = button.getAttribute("aria-pressed") !== "true";
      button.setAttribute("aria-pressed", String(on));
      if (prefersReducedMotion()) return;
      button.animate(
        [{ transform: "scale(0.9)" }, { transform: "none" }],
        { duration: 260, easing: EASE.spring },
      );
    };
    bar.addEventListener("click", onClick);

    cleanups.push(() => {
      bar.removeEventListener("click", onClick);
      stopRoving();
      buttons.forEach((button) => button.classList.remove("rm-editor-toolbar-button"));
      bar.classList.remove("rm-editor-toolbar", `is-${way}`);
      bar.removeAttribute("role");
      bar.removeAttribute("aria-orientation");
      bar.removeAttribute("aria-label");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Formatting at the selection, reachable without a mouse.
 *
 * It appears above whatever is selected, positioned with a transform on a
 * fixed element so nothing in the document moves to make room for it. The part
 * everybody forgets is the keyboard: selecting with Shift and the arrow keys
 * is how a great many people select anything, and a bar that only responds to
 * `mouseup` never appears for them. Alt+F10 — the same key that reaches a
 * toolbar in every desktop application — moves focus into it, and Escape hands
 * focus back to the exact spot in the text it came from.
 *
 * It is hidden from script on mount, never from the stylesheet, so a page
 * whose JavaScript failed shows a plain row of buttons rather than nothing.
 *
 *   <div data-rm-bubble-menu="draft">
 *     <button type="button" aria-pressed="false">Bold</button>
 *   </div>
 */
export function bubbleMenu(target = "[data-rm-bubble-menu]", options = {}) {
  const menus = resolveElements(target);
  if (!menus.length) return () => {};

  const {
    surface: surfaceSelector = "[data-rm-editor-surface]",
    label = "Formatting for the selection",
    offset = 10,
    items = "button",
  } = options;
  const cleanups = [];

  for (const menu of menus) {
    const surface = surfaceFor(menu, "data-rm-bubble-menu", surfaceSelector);
    if (!surface) continue;

    const gap = dataNumber(menu, "rmOffset", offset);
    menu.classList.add("rm-bubble-menu");
    menu.setAttribute("role", "toolbar");
    menu.setAttribute("aria-label", dataString(menu, "rmLabel", label));
    menu.hidden = true;

    const buttons = [...menu.querySelectorAll(items)];
    for (const button of buttons) {
      if (button.tagName === "BUTTON" && !button.hasAttribute("type")) button.type = "button";
    }
    const stopRoving = roving(menu, () => buttons, "horizontal");

    let open = false;

    const selectionBox = () => {
      if (isField(surface)) {
        const from = surface.selectionStart ?? 0;
        const to = surface.selectionEnd ?? 0;
        return from === to ? null : fieldCaretRect(surface);
      }
      const selection = document.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) return null;
      const range = selection.getRangeAt(0);
      if (!surface.contains(range.commonAncestorContainer)) return null;
      const box = range.getBoundingClientRect();
      return box.width || box.height ? box : null;
    };

    const place = () => {
      const box = selectionBox();
      if (!box) return false;
      // Measured while it is on screen; a hidden element has no size.
      placeAt(menu, box.left + box.width / 2, box.top - menu.offsetHeight - gap);
      return true;
    };

    const show = () => {
      const was = open;
      menu.hidden = false;
      if (!place()) { if (!was) menu.hidden = true; return; }
      open = true;
      if (was || prefersReducedMotion()) return;
      menu.animate(
        [{ opacity: 0, transform: `${menu.style.transform} scale(0.94)` }, { opacity: 1 }],
        { duration: 180, easing: EASE.out },
      );
    };

    const hide = () => {
      if (!open) return;
      open = false;
      menu.hidden = true;
    };

    const sync = () => {
      if (menu.contains(document.activeElement)) return;
      if (selectionBox()) show();
      else hide();
    };

    const onSelectionChange = () => sync();
    const onKeyInSurface = (event) => {
      if (event.altKey && event.key === "F10") {
        event.preventDefault();
        show();
        buttons[0]?.focus();
      }
    };
    const onKeyInMenu = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      hide();
      surface.focus();
    };
    const onScroll = () => { if (open) place(); };

    document.addEventListener("selectionchange", onSelectionChange);
    surface.addEventListener("keydown", onKeyInSurface);
    surface.addEventListener("blur", sync);
    menu.addEventListener("keydown", onKeyInMenu);
    addEventListener("scroll", onScroll, { passive: true, capture: true });
    addEventListener("resize", onScroll);

    cleanups.push(() => {
      document.removeEventListener("selectionchange", onSelectionChange);
      surface.removeEventListener("keydown", onKeyInSurface);
      surface.removeEventListener("blur", sync);
      menu.removeEventListener("keydown", onKeyInMenu);
      removeEventListener("scroll", onScroll, { capture: true });
      removeEventListener("resize", onScroll);
      stopRoving();
      menu.hidden = false;
      menu.style.transform = "";
      menu.classList.remove("rm-bubble-menu");
      menu.removeAttribute("role");
      menu.removeAttribute("aria-label");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * The shared machinery behind the slash menu and the mention picker.
 *
 * Both are the same thing: a character typed in the text opens a listbox, the
 * characters after it filter it, and the caret never leaves the surface. That
 * last point is why this is built on `aria-activedescendant` — moving real
 * focus into the list would take the caret out of the document and end the
 * typing session, which is the bug in every version built out of a menu of
 * buttons.
 */
function triggerMenu(panel, surface, config) {
  const {
    kind, trigger, label, noMatch, allowSpace, optionSelector, offset, onPick,
  } = config;

  const options = [...panel.querySelectorAll(optionSelector)];
  if (!options.length) return () => {};

  const listId = panel.id || (panel.id = uid(`rm-${kind}`));
  panel.classList.add(`rm-${kind}`);
  panel.setAttribute("role", "listbox");
  panel.setAttribute("aria-label", label);
  panel.hidden = true;

  const wasTabIndex = new Map();
  options.forEach((option, index) => {
    wasTabIndex.set(option, option.getAttribute("tabindex"));
    if (!option.id) option.id = `${listId}-option-${index}`;
    option.classList.add(`rm-${kind}-option`);
    option.setAttribute("role", "option");
    option.setAttribute("aria-selected", "false");
    option.tabIndex = -1;
  });

  // An `<li>`, not a `<p>`: the panel is a `<ul>` in both documented uses and
  // it carries `role="listbox"`, so a bare paragraph is both invalid markup
  // and outside the ARIA content model — the one sentence that exists to be
  // read out would be the one thing not reliably exposed. It is an `option`
  // that cannot be chosen, and it is created after `options` is queried, so it
  // never enters the match list.
  const empty = document.createElement("li");
  empty.className = `rm-${kind}-empty`;
  empty.setAttribute("role", "option");
  empty.setAttribute("aria-disabled", "true");
  empty.textContent = noMatch;
  empty.hidden = true;
  panel.appendChild(empty);

  const before = {
    role: surface.getAttribute("role"),
    autocomplete: surface.getAttribute("aria-autocomplete"),
    haspopup: surface.getAttribute("aria-haspopup"),
    controls: surface.getAttribute("aria-controls"),
    expanded: surface.getAttribute("aria-expanded"),
  };
  // A `<textarea>` already has a text role the browser exposes properly, so
  // only a `contenteditable` div needs to be told what it is.
  if (!isField(surface)) surface.setAttribute("role", "combobox");
  surface.setAttribute("aria-autocomplete", "list");
  surface.setAttribute("aria-haspopup", "listbox");
  surface.setAttribute("aria-controls", listId);
  surface.setAttribute("aria-expanded", "false");

  let open = false;
  let query = "";
  let matches = [];
  let active = -1;

  const textOf = (option) => (option.textContent ?? "").trim();

  const setActive = (index) => {
    matches.forEach((option) => option.setAttribute("aria-selected", "false"));
    active = matches.length ? clamp(index, 0, matches.length - 1) : -1;
    if (active < 0) { surface.removeAttribute("aria-activedescendant"); return; }
    const option = matches[active];
    option.setAttribute("aria-selected", "true");
    surface.setAttribute("aria-activedescendant", option.id);
    keepInView(panel, option, "auto");
  };

  const place = () => {
    const box = caretRect(surface);
    if (!box) return;
    placeAt(panel, box.left + box.width / 2, box.bottom + offset);
  };

  const close = () => {
    if (!open) return;
    open = false;
    query = "";
    panel.hidden = true;
    surface.setAttribute("aria-expanded", "false");
    surface.removeAttribute("aria-activedescendant");
  };

  const filter = () => {
    const needle = query.trim().toLowerCase();
    matches = options.filter((option) => {
      const hit = !needle || textOf(option).toLowerCase().includes(needle);
      option.hidden = !hit;
      return hit;
    });
    empty.hidden = matches.length > 0;
    setActive(0);
  };

  const show = () => {
    const first = !open;
    open = true;
    panel.hidden = false;
    surface.setAttribute("aria-expanded", "true");
    filter();
    place();
    if (first && !prefersReducedMotion()) {
      panel.animate(
        [{ opacity: 0, transform: `${panel.style.transform} translateY(-6px)` }, { opacity: 1 }],
        { duration: 160, easing: EASE.out },
      );
    }
  };

  const pick = (option) => {
    if (!option) return;
    onPick(option, query, trigger);
    close();
  };

  const onInput = () => {
    const text = beforeCaret(surface);
    const at = text.lastIndexOf(trigger);
    if (at < 0) { close(); return; }

    // The trigger only counts at the start of a word. Without this an email
    // address opens the mention picker halfway through every domain.
    const previous = at === 0 ? "\n" : text[at - 1];
    if (!/\s/.test(previous)) { close(); return; }

    const typed = text.slice(at + trigger.length);
    if (/\n/.test(typed) || (!allowSpace && /\s/.test(typed)) || typed.length > 32) { close(); return; }

    query = typed;
    show();
  };

  const onKeyDown = (event) => {
    if (!open) return;
    if (event.key === "ArrowDown") { event.preventDefault(); setActive(active + 1); }
    else if (event.key === "ArrowUp") { event.preventDefault(); setActive(active - 1); }
    else if (event.key === "Home") { event.preventDefault(); setActive(0); }
    else if (event.key === "End") { event.preventDefault(); setActive(matches.length - 1); }
    else if (event.key === "Enter" || event.key === "Tab") {
      if (active < 0) return;
      event.preventDefault();
      pick(matches[active]);
    } else if (event.key === "Escape") {
      // Escape closes the list and leaves the typed text alone: somebody may
      // have meant to write a slash.
      event.preventDefault();
      close();
    }
  };

  // `mousedown` rather than `click`, and prevented, so the surface never loses
  // the caret on the way to choosing an option.
  const onPointerDown = (event) => {
    const option = matches.find((one) => one === event.target || one.contains(event.target));
    if (!option) return;
    event.preventDefault();
    pick(option);
  };

  const onScroll = () => { if (open) place(); };
  const onBlur = () => close();

  surface.addEventListener("input", onInput);
  surface.addEventListener("keydown", onKeyDown);
  surface.addEventListener("blur", onBlur);
  panel.addEventListener("mousedown", onPointerDown);
  addEventListener("scroll", onScroll, { passive: true, capture: true });
  addEventListener("resize", onScroll);

  return () => {
    surface.removeEventListener("input", onInput);
    surface.removeEventListener("keydown", onKeyDown);
    surface.removeEventListener("blur", onBlur);
    panel.removeEventListener("mousedown", onPointerDown);
    removeEventListener("scroll", onScroll, { capture: true });
    removeEventListener("resize", onScroll);

    empty.remove();
    for (const [option, was] of wasTabIndex) {
      option.hidden = false;
      option.classList.remove(`rm-${kind}-option`);
      option.removeAttribute("role");
      option.removeAttribute("aria-selected");
      if (was === null) option.removeAttribute("tabindex");
      else option.setAttribute("tabindex", was);
    }
    for (const [name, value] of Object.entries({
      role: before.role,
      "aria-autocomplete": before.autocomplete,
      "aria-haspopup": before.haspopup,
      "aria-controls": before.controls,
      "aria-expanded": before.expanded,
    })) {
      if (value === null) surface.removeAttribute(name);
      else surface.setAttribute(name, value);
    }
    surface.removeAttribute("aria-activedescendant");
    panel.hidden = false;
    panel.style.transform = "";
    panel.classList.remove(`rm-${kind}`);
    panel.removeAttribute("role");
    panel.removeAttribute("aria-label");
  };
}

/**
 * A command palette a character opens, filtering as you type.
 *
 * The commands are in the markup, so the list is real content before anything
 * runs and the filter is doing nothing more than hiding rows. Typing "/" at
 * the start of a word opens it, the letters after it narrow it, Enter runs the
 * command and takes the "/heading" text back out of the document, and Escape
 * leaves the text exactly as typed — because sometimes a slash is a slash.
 *
 * Each command fires an `rm-slash-pick` event carrying its value, which is how
 * a page wires it to whatever it actually does.
 *
 *   <ul data-rm-slash-menu="draft">
 *     <li data-rm-value="h2">Heading</li>
 *   </ul>
 */
export function slashMenu(target = "[data-rm-slash-menu]", options = {}) {
  const panels = resolveElements(target);
  if (!panels.length) return () => {};

  const {
    surface: surfaceSelector = "[data-rm-editor-surface]",
    trigger = "/",
    label = "Commands",
    noMatch = "No matching command",
    offset = 6,
    optionSelector = "li, [role=\"option\"]",
  } = options;
  const cleanups = [];

  for (const panel of panels) {
    const surface = surfaceFor(panel, "data-rm-slash-menu", surfaceSelector);
    if (!surface) continue;

    cleanups.push(triggerMenu(panel, surface, {
      kind: "slash-menu",
      trigger: dataString(panel, "rmTrigger", trigger),
      label: dataString(panel, "rmLabel", label),
      noMatch: dataString(panel, "rmNoMatch", noMatch),
      allowSpace: false,
      optionSelector,
      offset: dataNumber(panel, "rmOffset", offset),
      onPick: (option, query, character) => {
        replaceBeforeCaret(surface, character.length + query.length, "");
        const value = dataString(option, "rmValue", (option.textContent ?? "").trim());
        panel.dispatchEvent(new CustomEvent("rm-slash-pick", {
          bubbles: true,
          detail: { value, option, surface },
        }));
      },
    }));
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A real combobox that inserts the name it announced.
 *
 * Same machinery as the slash menu with two differences that matter: the query
 * may contain a space, because people have two names, and choosing somebody
 * writes their name into the text rather than firing an event for the page to
 * interpret. The name written is `data-rm-value` when it is there, so the
 * document can carry a handle while the list shows a person.
 *
 *   <ul data-rm-mention-picker="draft">
 *     <li data-rm-value="@nora">Nora Vale — Design</li>
 *   </ul>
 */
export function mentionPicker(target = "[data-rm-mention-picker]", options = {}) {
  const panels = resolveElements(target);
  if (!panels.length) return () => {};

  const {
    surface: surfaceSelector = "[data-rm-editor-surface]",
    trigger = "@",
    label = "People",
    noMatch = "No matching person",
    offset = 6,
    optionSelector = "li, [role=\"option\"]",
  } = options;
  const cleanups = [];

  for (const panel of panels) {
    const surface = surfaceFor(panel, "data-rm-mention-picker", surfaceSelector);
    if (!surface) continue;

    // Outside the panel, deliberately. `pick()` writes the confirmation and
    // then closes the panel in the same task, and the closed panel is
    // `display: none` — a live region whose subtree is taken out of the render
    // tree before the mutation is ever flushed announces nothing at all.
    const heard = announcer(panel.parentElement ?? document.body, "polite");

    cleanups.push(triggerMenu(panel, surface, {
      kind: "mention-picker",
      trigger: dataString(panel, "rmTrigger", trigger),
      label: dataString(panel, "rmLabel", label),
      noMatch: dataString(panel, "rmNoMatch", noMatch),
      allowSpace: true,
      optionSelector,
      offset: dataNumber(panel, "rmOffset", offset),
      onPick: (option, query, character) => {
        const shown = (option.textContent ?? "").trim();
        const written = dataString(option, "rmValue", `${character}${shown}`);
        replaceBeforeCaret(surface, character.length + query.length, `${written} `);
        heard.textContent = `${shown} mentioned`;
      },
    }));

    cleanups.push(() => heard.remove());
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Drag to reorder blocks, and move them from the keyboard.
 *
 * The handle is a real `<button>` sitting in the margin, absolutely positioned
 * so it costs the paragraph no width. Space picks a block up, the arrow keys
 * move it, Space drops it and Escape puts it back where it started — the
 * keyboard half of a drag, which a `draggable="true"` div does not have at all
 * and cannot be given.
 *
 * Every move is a FLIP: the DOM order changes first and the blocks that shifted
 * animate from where they used to be, so nothing is ever animated by its
 * position and the reorder is correct the instant it happens. Each move is
 * announced — "Moved to position 2 of 5" — because a block quietly sliding is
 * no information at all if you cannot see it.
 *
 *   <div data-rm-block-handle><p>First</p><p>Second</p></div>
 */
export function blockHandle(target = "[data-rm-block-handle]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { label = "Move block", duration = 260, blocks: blockSelector = ":scope > *" } = options;
  const cleanups = [];

  for (const holder of holders) {
    const blocks = [...holder.querySelectorAll(blockSelector)];
    if (blocks.length < 2) continue;

    const speed = dataNumber(holder, "rmDuration", duration);
    holder.classList.add("rm-block-handle");
    const heard = announcer(holder, "polite");

    const how = document.createElement("p");
    how.className = "rm-editor-quiet";
    how.id = uid("rm-block-how");
    how.textContent = "Press Space to pick this block up, the arrow keys to move it, "
      + "Space again to drop it and Escape to put it back.";
    holder.appendChild(how);

    const grips = new Map();
    // The default selector is `:scope > *`, and this component has just put
    // two element children of its own into the holder — the live region and
    // the instructions. Left in, they would be counted as blocks: every
    // announcement would overstate the total by two, and the last real block
    // could be dragged past them and the FLIP would try to animate them.
    const mine = new Set([heard, how]);
    const order = () => [...holder.querySelectorAll(blockSelector)]
      .filter((el) => !mine.has(el));
    const boxesOf = () => order().map((block) => [block, block.getBoundingClientRect()]);

    const describe = () => {
      const list = order();
      list.forEach((block, index) => {
        const grip = grips.get(block);
        if (!grip) return;
        const words = (block.textContent ?? "").trim().slice(0, 40) || "block";
        grip.setAttribute("aria-label", `${dataString(holder, "rmLabel", label)}: ${words}. `
          + `Position ${index + 1} of ${list.length}.`);
      });
    };

    const moveTo = (block, index) => {
      const list = order();
      const to = clamp(index, 0, list.length - 1);
      const from = list.indexOf(block);
      if (to === from) return false;
      const boxes = boxesOf();
      if (to > from) list[to].after(block);
      else list[to].before(block);
      flipAll(boxes, speed);
      describe();
      heard.textContent = `Moved to position ${to + 1} of ${list.length}`;
      return true;
    };

    for (const block of blocks) {
      block.classList.add("rm-block-handle-block");

      const grip = document.createElement("button");
      grip.type = "button";
      grip.className = "rm-block-handle-grip";
      grip.setAttribute("aria-describedby", how.id);
      grip.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true">'
        + '<circle cx="6" cy="3" r="1.4"/><circle cx="10" cy="3" r="1.4"/>'
        + '<circle cx="6" cy="8" r="1.4"/><circle cx="10" cy="8" r="1.4"/>'
        + '<circle cx="6" cy="13" r="1.4"/><circle cx="10" cy="13" r="1.4"/></svg>';
      block.prepend(grip);
      grips.set(block, grip);

      let picked = false;
      let startedAt = 0;

      const onKey = (event) => {
        const list = order();
        const at = list.indexOf(block);
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          picked = !picked;
          if (picked) startedAt = at;
          block.classList.toggle("is-picked", picked);
          heard.textContent = picked
            ? `Picked up. Position ${at + 1} of ${list.length}.`
            : `Dropped at position ${at + 1} of ${list.length}.`;
        } else if (picked && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
          event.preventDefault();
          moveTo(block, at + (event.key === "ArrowDown" ? 1 : -1));
          grip.focus();
        } else if (picked && event.key === "Escape") {
          event.preventDefault();
          moveTo(block, startedAt);
          picked = false;
          block.classList.remove("is-picked");
          heard.textContent = "Move cancelled";
        }
      };

      let dragging = false;
      let from = 0;

      const onDown = (event) => {
        if (event.button > 0) return;
        dragging = true;
        from = event.clientY;
        block.classList.add("is-dragging");
        grip.setPointerCapture?.(event.pointerId);
      };

      const onMove = (event) => {
        if (!dragging) return;
        const dy = event.clientY - from;
        block.style.transform = `translateY(${dy}px)`;

        const list = order();
        const at = list.indexOf(block);
        const here = block.getBoundingClientRect();
        const middle = here.top + here.height / 2;
        const neighbour = list[dy > 0 ? at + 1 : at - 1];
        if (!neighbour) return;
        const theirs = neighbour.getBoundingClientRect();
        const crossed = dy > 0 ? middle > theirs.top + theirs.height / 2
          : middle < theirs.top + theirs.height / 2;
        if (!crossed) return;

        const boxes = boxesOf();
        if (dy > 0) neighbour.after(block);
        else neighbour.before(block);
        // The dragged block keeps the pointer's transform; only the ones it
        // displaced are played back into place.
        flipAll(boxes, speed, block);
        from = event.clientY;
        block.style.transform = "translateY(0px)";
        describe();
      };

      const onUp = (event) => {
        if (!dragging) return;
        dragging = false;
        grip.releasePointerCapture?.(event.pointerId);
        block.classList.remove("is-dragging");
        block.style.transform = "";
        const list = order();
        heard.textContent = `Dropped at position ${list.indexOf(block) + 1} of ${list.length}`;
      };

      grip.addEventListener("keydown", onKey);
      grip.addEventListener("pointerdown", onDown);
      grip.addEventListener("pointermove", onMove);
      grip.addEventListener("pointerup", onUp);
      grip.addEventListener("pointercancel", onUp);

      cleanups.push(() => {
        grip.removeEventListener("keydown", onKey);
        grip.removeEventListener("pointerdown", onDown);
        grip.removeEventListener("pointermove", onMove);
        grip.removeEventListener("pointerup", onUp);
        grip.removeEventListener("pointercancel", onUp);
        grip.remove();
        block.style.transform = "";
        block.classList.remove("rm-block-handle-block", "is-picked", "is-dragging");
      });
    }

    describe();

    cleanups.push(() => {
      heard.remove();
      how.remove();
      holder.classList.remove("rm-block-handle");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A fenced block with a language label and a copy button.
 *
 * The label and the button are absolutely positioned over the corner of the
 * block, so adding them does not change a single column of the code beneath.
 * The button holds both of its words — "Copy" and "Copied" — stacked in one
 * grid cell, which means it is as wide as the longer of the two from the
 * moment it mounts and the confirmation never resizes the corner it sits in.
 *
 * The confirmation is also announced, once, in a polite region. And when the
 * clipboard is unavailable — an insecure origin, an old browser, a locked-down
 * one — it selects the code and says which keys to press instead of silently
 * doing nothing, which is what a bare `navigator.clipboard.writeText` does.
 *
 *   <pre data-rm-code-block data-rm-lang="JavaScript"><code>…</code></pre>
 */
export function fencedCode(target = "[data-rm-code-block]", options = {}) {
  const blocks = resolveElements(target);
  if (!blocks.length) return () => {};

  const { lang = "", copy = "Copy", copied = "Copied", numbers = false } = options;
  const cleanups = [];

  for (const block of blocks) {
    const language = dataString(block, "rmLang", lang);
    // The chrome, the live region and the gutter all live inside `block`, so
    // `source` must never be `block` itself: it is what gets copied, counted
    // and selected, and falling back to the container would copy the line
    // numbers, the language label and the words "Copy" and "Copied" along with
    // the snippet. A `<pre>` with no `<code>` therefore gets one, wrapped
    // round what is already there and unwrapped again on cleanup.
    let source = block.querySelector("code");
    const wrapped = !source;
    if (!source) {
      source = document.createElement("code");
      while (block.firstChild) source.appendChild(block.firstChild);
      block.appendChild(source);
    }
    block.classList.add("rm-code-block");

    // A `<span>`, because the target is a `<pre>`, which takes phrasing
    // content only. `.rm-code-block-chrome` is `display: flex`, so it lays
    // out exactly as a `<div>` would have.
    const chrome = document.createElement("span");
    chrome.className = "rm-code-block-chrome";

    if (language) {
      const tag = document.createElement("span");
      tag.className = "rm-code-block-lang";
      tag.textContent = language;
      chrome.appendChild(tag);
    }

    const heard = announcer(block, "polite");

    const button = document.createElement("button");
    button.type = "button";
    button.className = "rm-code-block-copy";
    const restLabel = document.createElement("span");
    restLabel.textContent = dataString(block, "rmLabel", copy);
    const doneLabel = document.createElement("span");
    doneLabel.className = "is-done";
    doneLabel.textContent = copied;
    doneLabel.setAttribute("aria-hidden", "true");
    button.append(restLabel, doneLabel);
    button.setAttribute("aria-label", language ? `Copy this ${language} snippet` : "Copy this snippet");
    chrome.appendChild(button);
    block.appendChild(chrome);

    let settle = 0;
    const onClick = async () => {
      const text = source.textContent ?? "";
      let done = false;
      try {
        await navigator.clipboard.writeText(text);
        done = true;
      } catch {
        // No clipboard: select it, and say what to press. Doing nothing here
        // is the difference between a snippet and a decoration.
        const range = document.createRange();
        range.selectNodeContents(source);
        const selection = document.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      heard.textContent = done ? copied : "Selected. Press Control or Command and C to copy.";
      button.classList.toggle("is-done", done);
      clearTimeout(settle);
      settle = setTimeout(() => button.classList.remove("is-done"), 1800);
      if (done && !prefersReducedMotion()) {
        button.animate(
          [{ transform: "scale(0.92)" }, { transform: "none" }],
          { duration: 300, easing: EASE.spring },
        );
      }
    };
    button.addEventListener("click", onClick);

    let gutter = null;
    if (numbers || block.hasAttribute("data-rm-numbers")) {
      const lines = (source.textContent ?? "").replace(/\n$/, "").split("\n").length;
      gutter = document.createElement("span");
      gutter.className = "rm-code-block-gutter";
      // Decoration: the numbers are not part of the code and must never be
      // copied along with it, so they are hidden from assistive technology too.
      gutter.setAttribute("aria-hidden", "true");
      for (let i = 1; i <= lines; i++) {
        const number = document.createElement("i");
        number.textContent = String(i);
        gutter.appendChild(number);
      }
      block.prepend(gutter);
      block.classList.add("is-numbered");
    }

    cleanups.push(() => {
      clearTimeout(settle);
      button.removeEventListener("click", onClick);
      chrome.remove();
      heard.remove();
      gutter?.remove();
      block.classList.remove("rm-code-block", "is-numbered");
      // Only unwrap the `<code>` if it was this module that put it there.
      if (wrapped && source.parentElement === block) {
        while (source.firstChild) block.insertBefore(source.firstChild, source);
        source.remove();
      }
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Two panes, scroll linked, neither fighting the other.
 *
 * The naive version listens for scroll on both panes and sets the other one's
 * `scrollTop` from it. That is a feedback loop: setting the other pane fires
 * its scroll event, which sets the first back, and the result judders and
 * fights the wheel. The fix is a lease — whichever pane the visitor touched
 * owns the link for a moment, and the follower's own scroll events are ignored
 * for as long as it holds.
 *
 * `mode="block"` lines the panes up by matching block index rather than by
 * fraction of total height, which is what keeps a long code sample from
 * throwing the preview half a page out. The preview is explicitly
 * `aria-live="off"`: making it a live region means every keystroke re-reads the
 * whole document, which is how a screen-reader user is driven out of an editor.
 *
 *   <div data-rm-markdown-preview>
 *     <textarea data-rm-md-source></textarea>
 *     <div data-rm-md-preview></div>
 *   </div>
 */
export function markdownPreview(target = "[data-rm-markdown-preview]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const {
    source: sourceSelector = "[data-rm-md-source]",
    preview: previewSelector = "[data-rm-md-preview]",
    mode = "fraction",
    lease = 120,
  } = options;
  const cleanups = [];

  for (const holder of holders) {
    const source = holder.querySelector(sourceSelector);
    const preview = holder.querySelector(previewSelector);
    if (!source || !preview) continue;

    const how = dataString(holder, "rmMode", mode) === "block" ? "block" : "fraction";
    const hold = dataNumber(holder, "rmLease", lease);
    holder.classList.add("rm-markdown-preview");
    source.classList.add("rm-markdown-preview-source");
    preview.classList.add("rm-markdown-preview-view");

    // Record which of the two names this module invented, so the cleanup can
    // take back exactly those and leave an author's own label alone.
    const namedSource = !source.hasAttribute("aria-label");
    const namedPreview = !preview.hasAttribute("aria-label");
    if (namedSource) source.setAttribute("aria-label", "Markdown source");
    preview.setAttribute("role", "region");
    if (namedPreview) preview.setAttribute("aria-label", "Preview");
    preview.setAttribute("aria-live", "off");

    let driver = null;
    let until = 0;

    const fraction = (pane) => {
      const room = pane.scrollHeight - pane.clientHeight;
      return room > 0 ? pane.scrollTop / room : 0;
    };

    const byBlock = (from, to) => {
      const theirs = [...to.children];
      const mine = [...from.children];
      if (!theirs.length || !mine.length) return null;
      const middle = from.scrollTop + from.clientHeight * 0.3;
      let index = 0;
      for (let i = 0; i < mine.length; i++) {
        if (mine[i].offsetTop <= middle) index = i;
      }
      const mate = theirs[Math.min(index, theirs.length - 1)];
      return mate.offsetTop - to.clientHeight * 0.3;
    };

    const byFraction = (from, to) => fraction(from) * (to.scrollHeight - to.clientHeight);

    const link = (from, to) => () => {
      const now = performance.now();
      if (driver && driver !== from && now < until) return;
      driver = from;
      until = now + hold;

      // A textarea has no child elements to line up, so a pair that includes
      // one always maps by fraction however the option is set — and that is
      // true of *either* pane, which is the point the guard used to miss: in
      // the documented `mode="block"` setup the preview's own scroll matched
      // against a textarea produced no goal at all and the link was dead in
      // that direction. An empty pane falls back the same way rather than
      // giving up.
      const canBlock = how === "block" && !isField(from) && !isField(to);
      const goal = canBlock ? byBlock(from, to) : byFraction(from, to);
      const land = goal === null ? byFraction(from, to) : goal;
      to.scrollTop = clamp(land, 0, to.scrollHeight - to.clientHeight);
    };

    const fromSource = link(source, preview);
    const fromPreview = link(preview, source);
    source.addEventListener("scroll", fromSource, { passive: true });
    preview.addEventListener("scroll", fromPreview, { passive: true });

    // Typing scrolls the source; the preview should follow that too.
    const onInput = () => fromSource();
    source.addEventListener("input", onInput);

    holder.rmSync = () => fromSource();

    cleanups.push(() => {
      source.removeEventListener("scroll", fromSource);
      preview.removeEventListener("scroll", fromPreview);
      source.removeEventListener("input", onInput);
      delete holder.rmSync;
      preview.removeAttribute("aria-live");
      preview.removeAttribute("role");
      if (namedSource) source.removeAttribute("aria-label");
      if (namedPreview) preview.removeAttribute("aria-label");
      holder.classList.remove("rm-markdown-preview");
      source.classList.remove("rm-markdown-preview-source");
      preview.classList.remove("rm-markdown-preview-view");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/** Every text node under a root, in document order. */
function textNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const found = [];
  let node = walker.nextNode();
  while (node) {
    if (node.nodeValue) found.push(node);
    node = walker.nextNode();
  }
  return found;
}

/**
 * The one registered highlight name.
 *
 * `::highlight()` takes a literal name, not a custom property, so the name has
 * to be a constant the stylesheet can spell. Two search panels on one page
 * therefore share it, which is the correct behaviour anyway: two sets of
 * matches painted in the same colour would be indistinguishable.
 */
const HIGHLIGHT = "rm-find-match";

/** Turn an index into the joined text back into a node and an offset. */
function spotAt(map, index) {
  for (let i = map.length - 1; i >= 0; i--) {
    if (index >= map[i].at) return { node: map[i].node, offset: index - map[i].at };
  }
  return null;
}

/**
 * Search over the text without rewriting the text.
 *
 * Highlighting matches by wrapping them in `<span>`s is the version everybody
 * writes first, and it destroys the document: the caret jumps, the undo stack
 * fills with edits nobody made, and what gets saved has the search results in
 * it. This uses the CSS Custom Highlight API instead — a `Highlight` of
 * `Range` objects, painted by `::highlight()`, with not one node added. Where
 * that is unsupported, and in a `<textarea>`, where ranges cannot reach, it
 * falls back to selecting the match, which moves the view and says the same
 * thing.
 *
 * The match count is a polite live region with a delay on it, so it speaks the
 * total once the typing settles rather than counting out loud per keystroke.
 *
 *   <div data-rm-find-replace="draft"></div>
 */
export function findReplace(target = "[data-rm-find-replace]", options = {}) {
  const panels = resolveElements(target);
  if (!panels.length) return () => {};

  const {
    surface: surfaceSelector = "[data-rm-editor-surface]",
    label = "Find in document",
    placeholder = "Find",
    replace = true,
    settle = 400,
    caseSensitive = false,
  } = options;
  const cleanups = [];

  const paints = typeof CSS !== "undefined" && typeof Highlight === "function" && CSS.highlights;

  for (const panel of panels) {
    const surface = surfaceFor(panel, "data-rm-find-replace", surfaceSelector);
    if (!surface) continue;

    const sensitive = dataString(panel, "rmCase", caseSensitive ? "on" : "off") === "on";
    const canReplace = replace && dataString(panel, "rmReplace", "on") !== "off";
    panel.classList.add("rm-find-replace");
    panel.setAttribute("role", "search");
    panel.setAttribute("aria-label", dataString(panel, "rmLabel", label));

    const findField = document.createElement("input");
    findField.type = "search";
    findField.className = "rm-find-replace-field";
    findField.setAttribute("aria-label", dataString(panel, "rmPlaceholder", placeholder));
    findField.placeholder = dataString(panel, "rmPlaceholder", placeholder);

    const count = document.createElement("output");
    count.className = "rm-find-replace-count";
    count.setAttribute("aria-live", "polite");
    count.textContent = "";

    const previous = document.createElement("button");
    previous.type = "button";
    previous.className = "rm-find-replace-step";
    previous.append(quiet("Previous match"));
    previous.append(document.createTextNode("↑"));

    const next = document.createElement("button");
    next.type = "button";
    next.className = "rm-find-replace-step";
    next.append(quiet("Next match"));
    next.append(document.createTextNode("↓"));

    const row = document.createElement("div");
    row.className = "rm-find-replace-row";
    row.append(findField, count, previous, next);
    panel.appendChild(row);

    let replaceField = null;
    if (canReplace) {
      replaceField = document.createElement("input");
      replaceField.type = "text";
      replaceField.className = "rm-find-replace-field";
      replaceField.setAttribute("aria-label", "Replace with");
      replaceField.placeholder = "Replace with";

      const one = document.createElement("button");
      one.type = "button";
      one.className = "rm-find-replace-action";
      one.textContent = "Replace";

      const all = document.createElement("button");
      all.type = "button";
      all.className = "rm-find-replace-action";
      all.textContent = "Replace all";

      const second = document.createElement("div");
      second.className = "rm-find-replace-row";
      second.append(replaceField, one, all);
      panel.appendChild(second);

      one.addEventListener("click", () => applyOne());
      all.addEventListener("click", () => applyAll());
      cleanups.push(() => second.remove());
    }

    let hits = [];
    let at = -1;
    let timer = 0;

    const clearPaint = () => { if (paints) CSS.highlights.delete(HIGHLIGHT); };

    const gather = () => {
      const needle = findField.value;
      hits = [];
      if (!needle) return;

      if (isField(surface)) {
        const hay = sensitive ? surface.value : surface.value.toLowerCase();
        const pin = sensitive ? needle : needle.toLowerCase();
        let index = hay.indexOf(pin);
        while (index >= 0) {
          hits.push({ start: index, end: index + pin.length });
          index = hay.indexOf(pin, index + pin.length);
        }
        return;
      }

      const nodes = textNodes(surface);
      let joined = "";
      const map = [];
      for (const node of nodes) {
        map.push({ node, at: joined.length });
        joined += node.nodeValue;
      }
      const hay = sensitive ? joined : joined.toLowerCase();
      const pin = sensitive ? needle : needle.toLowerCase();
      let index = hay.indexOf(pin);
      while (index >= 0) {
        const from = spotAt(map, index);
        const to = spotAt(map, index + pin.length);
        if (from && to) {
          const range = document.createRange();
          range.setStart(from.node, from.offset);
          range.setEnd(to.node, to.offset);
          hits.push(range);
        }
        index = hay.indexOf(pin, index + pin.length);
      }
    };

    const paint = () => {
      if (!paints || isField(surface)) return;
      const ranges = hits.filter((hit) => hit instanceof Range);
      if (!ranges.length) { clearPaint(); return; }
      CSS.highlights.set(HIGHLIGHT, new Highlight(...ranges));
    };

    // Every write to the readout goes through here, and every write cancels
    // the pending total first. Without that, stepping to a match writes
    // "3 of 12" and the settle timer from the search that found them fires a
    // moment later and overwrites it with "12 matches" — so the position is
    // both drawn for a fraction of a second and announced as the wrong thing.
    const say = (text) => {
      clearTimeout(timer);
      count.textContent = text;
    };

    const go = (index) => {
      if (!hits.length) return;
      at = (index + hits.length) % hits.length;
      const hit = hits[at];
      if (isField(surface)) {
        surface.focus();
        surface.setSelectionRange(hit.start, hit.end);
      } else {
        const selection = document.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(hit.cloneRange());
        const box = hit.getBoundingClientRect();
        if (box.top < 0 || box.bottom > innerHeight) {
          hit.startContainer.parentElement?.scrollIntoView({ block: "center" });
        }
      }
      say(`${at + 1} of ${hits.length}`);
    };

    const search = () => {
      gather();
      paint();
      at = hits.length ? 0 : -1;
      clearTimeout(timer);
      // The number is drawn at once and said a moment later: a live region
      // that speaks on every keystroke is a live region nobody can type past.
      timer = setTimeout(() => {
        count.textContent = !findField.value
          ? ""
          : hits.length
            ? `${hits.length} ${hits.length === 1 ? "match" : "matches"}`
            : "No matches";
      }, dataNumber(panel, "rmSettle", settle));
    };

    function applyOne() {
      if (at < 0 || !hits.length || !replaceField) return;
      const hit = hits[at];
      const text = replaceField.value;
      if (isField(surface)) {
        surface.setRangeText(text, hit.start, hit.end, "end");
        surface.dispatchEvent(new Event("input", { bubbles: true }));
      } else {
        hit.deleteContents();
        hit.insertNode(document.createTextNode(text));
        surface.dispatchEvent(new InputEvent("input", { bubbles: true }));
      }
      search();
    }

    function applyAll() {
      if (!replaceField || !hits.length) return;
      const many = hits.length;
      // Backwards, so replacing one match cannot move the offsets of the ones
      // still to come.
      for (let i = hits.length - 1; i >= 0; i--) {
        const hit = hits[i];
        if (isField(surface)) {
          surface.setRangeText(replaceField.value, hit.start, hit.end, "preserve");
        } else {
          hit.deleteContents();
          hit.insertNode(document.createTextNode(replaceField.value));
        }
      }
      surface.dispatchEvent(new (isField(surface) ? Event : InputEvent)("input", { bubbles: true }));
      search();
      say(`${many} replaced`);
    }

    const onInput = () => search();
    const onKey = (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      go(at + (event.shiftKey ? -1 : 1));
    };
    const onNext = () => go(at + 1);
    const onPrevious = () => go(at - 1);

    findField.addEventListener("input", onInput);
    findField.addEventListener("keydown", onKey);
    next.addEventListener("click", onNext);
    previous.addEventListener("click", onPrevious);

    cleanups.push(() => {
      clearTimeout(timer);
      clearPaint();
      findField.removeEventListener("input", onInput);
      findField.removeEventListener("keydown", onKey);
      next.removeEventListener("click", onNext);
      previous.removeEventListener("click", onPrevious);
      row.remove();
      panel.classList.remove("rm-find-replace");
      panel.removeAttribute("role");
      panel.removeAttribute("aria-label");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Anchored to a range, opened by a real disclosure.
 *
 * The anchor is already in the markup — a `<mark>` around the words being
 * discussed — so the comment survives the script not running and the text
 * still reads. This wires the two together with `aria-details`, which is the
 * one relationship that says "there is a remark about this passage" rather
 * than pasting the whole thread into the paragraph's accessible description.
 *
 * The panel opens with `grid-template-rows: 0fr → 1fr`, the only honest way to
 * transition to a height nobody can know in advance, and the button carries
 * `aria-expanded` so the state is a fact rather than a chevron. Resolving says
 * "resolved" in words; a thread that goes grey has told half its readers
 * nothing.
 *
 *   <aside data-rm-comment-thread="para-3">…</aside>
 */
export function commentThread(target = "[data-rm-comment-thread]", options = {}) {
  const threads = resolveElements(target);
  if (!threads.length) return () => {};

  const { open = false, label = "Comment", resolveLabel = "Resolve" } = options;
  const cleanups = [];

  for (const thread of threads) {
    const anchor = document.getElementById(thread.getAttribute("data-rm-comment-thread") ?? "");
    const id = thread.id || (thread.id = uid("rm-thread"));
    thread.classList.add("rm-comment-thread");

    const head = thread.firstElementChild;
    const title = (head?.textContent ?? dataString(thread, "rmLabel", label)).trim();

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "rm-comment-thread-toggle";
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = title;

    const body = document.createElement("div");
    body.className = "rm-comment-thread-body";
    const inner = document.createElement("div");
    inner.className = "rm-comment-thread-inner";
    // Everything that was in the thread moves inside the collapsible half; the
    // heading becomes the button that controls it.
    while (thread.firstChild) inner.appendChild(thread.firstChild);
    const liftedHead = head && head.textContent.trim() === title ? head : null;
    liftedHead?.remove();
    body.appendChild(inner);

    const resolve = document.createElement("button");
    resolve.type = "button";
    resolve.className = "rm-comment-thread-resolve";
    resolve.setAttribute("aria-pressed", "false");
    resolve.textContent = dataString(thread, "rmResolveLabel", resolveLabel);
    inner.appendChild(resolve);

    const heard = announcer(thread, "polite");
    thread.append(toggle, body);
    body.id = `${id}-body`;
    toggle.setAttribute("aria-controls", body.id);

    const anchorBefore = {
      role: anchor?.getAttribute("role") ?? null,
      tabindex: anchor?.getAttribute("tabindex") ?? null,
    };

    const setOpen = (on) => {
      thread.classList.toggle("is-open", on);
      toggle.setAttribute("aria-expanded", String(on));
      anchor?.setAttribute("aria-expanded", String(on));
    };
    setOpen(dataString(thread, "rmState", open ? "open" : "closed") === "open");

    const onToggle = () => setOpen(toggle.getAttribute("aria-expanded") !== "true");
    toggle.addEventListener("click", onToggle);

    const onResolve = () => {
      const done = resolve.getAttribute("aria-pressed") !== "true";
      resolve.setAttribute("aria-pressed", String(done));
      thread.classList.toggle("is-resolved", done);
      heard.textContent = done ? `${title} resolved` : `${title} reopened`;
    };
    resolve.addEventListener("click", onResolve);

    let onAnchorClick = null;
    let onAnchorKey = null;
    if (anchor) {
      anchor.classList.add("rm-comment-thread-anchor");
      // `aria-details` points at the discussion; `role="button"` is the honest
      // description of a passage that opens something when pressed.
      anchor.setAttribute("aria-details", id);
      anchor.setAttribute("role", "button");
      anchor.setAttribute("aria-controls", body.id);
      anchor.tabIndex = 0;

      onAnchorClick = () => { setOpen(true); toggle.focus(); };
      onAnchorKey = (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        onAnchorClick();
      };
      anchor.addEventListener("click", onAnchorClick);
      anchor.addEventListener("keydown", onAnchorKey);
    }

    cleanups.push(() => {
      toggle.removeEventListener("click", onToggle);
      resolve.removeEventListener("click", onResolve);
      if (anchor) {
        if (onAnchorClick) anchor.removeEventListener("click", onAnchorClick);
        if (onAnchorKey) anchor.removeEventListener("keydown", onAnchorKey);
        anchor.classList.remove("rm-comment-thread-anchor");
        anchor.removeAttribute("aria-details");
        anchor.removeAttribute("aria-controls");
        anchor.removeAttribute("aria-expanded");
        if (anchorBefore.role === null) anchor.removeAttribute("role");
        else anchor.setAttribute("role", anchorBefore.role);
        if (anchorBefore.tabindex === null) anchor.removeAttribute("tabindex");
        else anchor.setAttribute("tabindex", anchorBefore.tabindex);
      }
      resolve.remove();
      heard.remove();
      toggle.remove();
      while (inner.firstChild) thread.appendChild(inner.firstChild);
      if (liftedHead) thread.prepend(liftedHead);
      body.remove();
      thread.classList.remove("rm-comment-thread", "is-open", "is-resolved");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A tracked change with accept and reject.
 *
 * The change itself is `<ins>` or `<del>` in the markup, which is what those
 * elements are for: a screen reader says "insertion" and "deletion" without
 * being told, and the document still makes sense with the stylesheet off. This
 * adds the two buttons, the group label that says whose change it is, and the
 * arithmetic of applying it — accepting an insertion unwraps it and keeps the
 * words, rejecting one takes them out, and a deletion is the same two answers
 * the other way round.
 *
 * Applying it reflows the paragraph, which is unavoidable and is the point, so
 * the blocks after it are played from where they were with a FLIP rather than
 * jumping. Note that cleanup removes the chrome but never un-applies a change:
 * a decision somebody made is not decoration to be tidied away.
 *
 *   <ins data-rm-suggestion="insert" data-rm-author="Nora">quarterly</ins>
 */
export function suggestion(target = "[data-rm-suggestion]", options = {}) {
  const marks = resolveElements(target);
  if (!marks.length) return () => {};

  const { kind = "insert", author = "Someone", accept = "Accept", reject = "Reject" } = options;
  const cleanups = [];

  for (const mark of marks) {
    const how = dataString(mark, "rmSuggestion", kind) === "delete" ? "delete" : "insert";
    const who = dataString(mark, "rmAuthor", author);
    const words = (mark.textContent ?? "").trim();

    mark.classList.add("rm-suggestion", `is-${how}`);
    mark.setAttribute("role", "group");
    mark.setAttribute("aria-label",
      `${how === "insert" ? "Insertion" : "Deletion"} suggested by ${who}: ${words}`);

    const heard = announcer(mark.parentElement ?? mark, "polite");

    const actions = document.createElement("span");
    actions.className = "rm-suggestion-actions";

    const yes = document.createElement("button");
    yes.type = "button";
    yes.className = "rm-suggestion-accept";
    yes.append(quiet(`${accept} ${how === "insert" ? "insertion" : "deletion"} of ${words}`));
    yes.append(document.createTextNode("✓"));

    const no = document.createElement("button");
    no.type = "button";
    no.className = "rm-suggestion-reject";
    no.append(quiet(`${reject} ${how === "insert" ? "insertion" : "deletion"} of ${words}`));
    no.append(document.createTextNode("×"));

    actions.append(yes, no);
    mark.appendChild(actions);

    const settle = () => {
      const parent = mark.parentElement;
      const after = parent ? [...(parent.parentElement?.children ?? [])] : [];
      return after.map((one) => [one, one.getBoundingClientRect()]);
    };

    const finish = (keepText, said) => {
      const boxes = settle();
      actions.remove();
      if (keepText) {
        const text = document.createTextNode(words);
        mark.replaceWith(text);
      } else {
        mark.remove();
      }
      flipAll(boxes, 280);
      heard.textContent = said;
    };

    const apply = (agreed) => {
      const keepText = how === "insert" ? agreed : !agreed;
      const said = `${agreed ? "Accepted" : "Rejected"} ${how === "insert" ? "insertion" : "deletion"} of ${words}`;
      if (prefersReducedMotion()) { finish(keepText, said); return; }
      mark.animate(
        [{ opacity: 1 }, { opacity: keepText ? 1 : 0 }],
        { duration: 200, easing: EASE.inOut, fill: "forwards" },
      ).finished.then(() => finish(keepText, said), () => finish(keepText, said));
    };

    const onYes = () => apply(true);
    const onNo = () => apply(false);
    yes.addEventListener("click", onYes);
    no.addEventListener("click", onNo);

    cleanups.push(() => {
      yes.removeEventListener("click", onYes);
      no.removeEventListener("click", onNo);
      actions.remove();
      heard.remove();
      mark.classList.remove("rm-suggestion", `is-${how}`);
      mark.removeAttribute("role");
      mark.removeAttribute("aria-label");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/** Units big enough to be worth naming, largest first. */
const SPANS = [
  ["year", 31536000000], ["month", 2592000000], ["week", 604800000],
  ["day", 86400000], ["hour", 3600000], ["minute", 60000],
];

/** "3 minutes ago", in the visitor's language, without a date library. */
function inWords(then, now, locale) {
  try {
    const format = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    const gap = then - now;
    for (const [unit, size] of SPANS) {
      if (Math.abs(gap) >= size) return format.format(Math.round(gap / size), unit);
    }
    return format.format(0, "minute");
  } catch {
    return new Date(then).toLocaleString(locale);
  }
}

/**
 * When this version was, in words that stay true.
 *
 * "2 minutes ago" is a sentence with a shelf life, and the usual version
 * writes it once on load and lets it rot until the page reloads — by which
 * time it says two minutes about something from last Tuesday. This recomputes
 * it on a timer, and the timer runs only while the chip is on screen and the
 * tab is in front, so a sidebar of forty versions is not forty timers in a
 * background tab.
 *
 * The machine-readable stamp lives in a real `<time datetime>`, so the exact
 * moment is available even though the drawn text is relative, and the chip
 * that is being viewed carries `aria-current="true"` rather than a colour.
 *
 *   <button data-rm-version-chip="2026-09-21T09:12:00Z" type="button">Draft</button>
 */
export function versionChip(target = "[data-rm-version-chip]", options = {}) {
  const chips = resolveElements(target);
  if (!chips.length) return () => {};

  const { locale = undefined, every = 30000, label = "Version" } = options;
  const cleanups = [];

  for (const chip of chips) {
    const stamp = Date.parse(chip.getAttribute("data-rm-version-chip") ?? "");
    if (!Number.isFinite(stamp)) continue;

    const name = (chip.textContent ?? "").trim() || dataString(chip, "rmLabel", label);
    const tongue = dataString(chip, "rmLocale", locale);
    chip.classList.add("rm-version-chip");
    if (chip.tagName === "BUTTON" && !chip.hasAttribute("type")) chip.type = "button";

    const title = document.createElement("span");
    title.className = "rm-version-chip-name";
    title.textContent = name;

    const when = document.createElement("time");
    when.className = "rm-version-chip-when";
    when.dateTime = new Date(stamp).toISOString();

    chip.replaceChildren(title, when);

    const draw = () => { when.textContent = inWords(stamp, Date.now(), tongue); };
    draw();

    chip.rmMark = (current) => {
      chip.classList.toggle("is-current", current);
      if (current) chip.setAttribute("aria-current", "true");
      else chip.removeAttribute("aria-current");
    };
    chip.rmMark(chip.hasAttribute("aria-current"));

    cleanups.push(whileVisible(chip, () => {
      const timer = setInterval(draw, dataNumber(chip, "rmEvery", every));
      return () => clearInterval(timer);
    }));

    cleanups.push(() => {
      delete chip.rmMark;
      chip.textContent = name;
      chip.classList.remove("rm-version-chip", "is-current");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * The headings as a real tree, marking where you are.
 *
 * Built from the document's own `<h2>`–`<h4>`, so the outline cannot disagree
 * with the text. It is a genuine `role="tree"`: one tab stop, up and down to
 * move, right and left to open and close a branch, `aria-level` on every item
 * and `aria-expanded` on the ones with children. The common version is a flat
 * `<ul>` of links with indentation applied by padding, which tells assistive
 * technology nothing about the structure it is drawing.
 *
 * Where you are is `aria-current="location"` driven by an IntersectionObserver
 * on the headings themselves, not by a scroll listener doing arithmetic every
 * frame.
 *
 *   <nav data-rm-outline-pane="draft"></nav>
 */
export function outlinePane(target = "[data-rm-outline-pane]", options = {}) {
  const panes = resolveElements(target);
  if (!panes.length) return () => {};

  const {
    surface: surfaceSelector = "[data-rm-editor-surface]",
    headings = "h2, h3, h4",
    label = "Document outline",
  } = options;
  const cleanups = [];

  for (const pane of panes) {
    const surface = surfaceFor(pane, "data-rm-outline-pane", surfaceSelector);
    if (!surface) continue;

    const found = [...surface.querySelectorAll(dataString(pane, "rmHeadings", headings))];
    if (!found.length) continue;

    pane.classList.add("rm-outline-pane");
    pane.setAttribute("aria-label", dataString(pane, "rmLabel", label));

    const tree = document.createElement("ul");
    tree.className = "rm-outline-pane-tree";
    tree.setAttribute("role", "tree");
    tree.setAttribute("aria-label", dataString(pane, "rmLabel", label));

    const made = [];
    const items = [];
    const byHeading = new Map();

    // Nesting from the heading levels themselves: a deeper heading becomes a
    // group inside the last shallower one.
    const stack = [{ level: 1, list: tree, item: null }];
    found.forEach((heading, index) => {
      const level = Number(heading.tagName.slice(1)) || 2;
      while (stack.length > 1 && level <= stack[stack.length - 1].level) stack.pop();

      let parent = stack[stack.length - 1];
      if (parent.item && !parent.group) {
        const group = document.createElement("ul");
        group.className = "rm-outline-pane-group";
        group.setAttribute("role", "group");
        parent.item.appendChild(group);
        parent.item.setAttribute("aria-expanded", "true");
        parent.group = group;
      }
      const list = parent.group ?? parent.list;

      if (!heading.id) { heading.id = uid("rm-heading"); made.push(heading); }

      const item = document.createElement("li");
      item.className = "rm-outline-pane-item";
      item.setAttribute("role", "treeitem");
      item.setAttribute("aria-level", String(Math.max(1, level - 1)));
      item.tabIndex = index === 0 ? 0 : -1;
      item.dataset.rmHeading = heading.id;

      const text = document.createElement("span");
      text.className = "rm-outline-pane-text";
      text.textContent = (heading.textContent ?? "").trim();
      item.appendChild(text);

      list.appendChild(item);
      items.push(item);
      byHeading.set(heading, item);
      stack.push({ level, list, item, group: null });
    });

    pane.appendChild(tree);

    const focusOn = (item) => {
      items.forEach((one) => { one.tabIndex = one === item ? 0 : -1; });
      item.focus();
    };

    const visible = () => items.filter((item) => item.offsetParent !== null || item === document.activeElement);

    const jump = (item) => {
      const heading = document.getElementById(item.dataset.rmHeading ?? "");
      heading?.scrollIntoView({ block: "start", behavior: prefersReducedMotion() ? "auto" : "smooth" });
      heading?.setAttribute("tabindex", "-1");
      heading?.focus({ preventScroll: true });
    };

    const onKey = (event) => {
      const item = event.target.closest?.("[role=\"treeitem\"]");
      if (!item) return;
      const list = visible();
      const at = list.indexOf(item);
      const group = item.querySelector(":scope > [role=\"group\"]");

      if (event.key === "ArrowDown" && at < list.length - 1) { event.preventDefault(); focusOn(list[at + 1]); }
      else if (event.key === "ArrowUp" && at > 0) { event.preventDefault(); focusOn(list[at - 1]); }
      else if (event.key === "Home") { event.preventDefault(); focusOn(list[0]); }
      else if (event.key === "End") { event.preventDefault(); focusOn(list[list.length - 1]); }
      else if (event.key === "ArrowRight" && group) {
        event.preventDefault();
        group.hidden = false;
        item.setAttribute("aria-expanded", "true");
      } else if (event.key === "ArrowLeft" && group && item.getAttribute("aria-expanded") === "true") {
        event.preventDefault();
        group.hidden = true;
        item.setAttribute("aria-expanded", "false");
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        jump(item);
      }
    };

    const onClick = (event) => {
      const item = event.target.closest?.("[role=\"treeitem\"]");
      if (!item) return;
      focusOn(item);
      jump(item);
    };

    tree.addEventListener("keydown", onKey);
    tree.addEventListener("click", onClick);

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const item = byHeading.get(entry.target);
        if (!item) continue;
        items.forEach((one) => {
          one.classList.remove("is-current");
          one.removeAttribute("aria-current");
        });
        item.classList.add("is-current");
        item.setAttribute("aria-current", "location");
        keepInView(pane, item, "auto");
      }
    }, { rootMargin: "0px 0px -70% 0px" });
    found.forEach((heading) => observer.observe(heading));

    cleanups.push(() => {
      observer.disconnect();
      tree.removeEventListener("keydown", onKey);
      tree.removeEventListener("click", onClick);
      tree.remove();
      made.forEach((heading) => heading.removeAttribute("id"));
      found.forEach((heading) => heading.removeAttribute("tabindex"));
      pane.classList.remove("rm-outline-pane");
      pane.removeAttribute("aria-label");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Announced politely, and only once it starts to matter.
 *
 * The counter is drawn on every keystroke and said almost never. That split is
 * the entire component: a word count wrapped in `aria-live` narrates every
 * letter typed and makes the editor unusable with a screen reader on, which is
 * a bug you will not find unless you turn one on. So the number lives in an
 * ordinary element, and a separate polite region receives a sentence only when
 * the count crosses the threshold you set, hits the limit, or goes over it.
 *
 * Counting is a split on whitespace, which is the honest approximation; it says
 * "words" rather than pretending to a precision it does not have.
 *
 *   <p data-rm-word-count="draft" data-rm-limit="300"></p>
 */
export function wordCount(target = "[data-rm-word-count]", options = {}) {
  const meters = resolveElements(target);
  if (!meters.length) return () => {};

  const {
    surface: surfaceSelector = "[data-rm-editor-surface]",
    limit = 0,
    announceAt = 0.9,
    unit = "words",
    settle = 500,
  } = options;
  const cleanups = [];

  for (const meter of meters) {
    const surface = surfaceFor(meter, "data-rm-word-count", surfaceSelector);
    if (!surface) continue;

    const cap = dataNumber(meter, "rmLimit", limit);
    const from = clamp(dataNumber(meter, "rmAnnounceAt", announceAt), 0, 1);
    const measure = dataString(meter, "rmUnit", unit) === "characters" ? "characters" : "words";

    meter.classList.add("rm-word-count");
    const number = document.createElement("span");
    number.className = "rm-word-count-number";
    const suffix = document.createElement("span");
    suffix.className = "rm-word-count-unit";
    meter.replaceChildren(number, suffix);

    // Outside the meter on purpose: `role="meter"` makes its children
    // presentational, and a live region nobody can reach is a silent one.
    const heard = announcer(meter.parentElement ?? meter, "polite");
    let timer = 0;
    let saidAt = "";

    const count = () => {
      const text = readText(surface);
      return measure === "characters" ? text.length : (text.trim().match(/\S+/g) ?? []).length;
    };

    const draw = () => {
      const now = count();
      number.textContent = String(now);
      suffix.textContent = cap ? ` of ${cap} ${measure}` : ` ${measure}`;

      const near = cap > 0 && now >= cap * from && now < cap;
      const over = cap > 0 && now >= cap;
      meter.classList.toggle("is-near", near);
      meter.classList.toggle("is-over", over);
      if (cap > 0) {
        meter.setAttribute("role", "meter");
        meter.setAttribute("aria-valuemin", "0");
        meter.setAttribute("aria-valuemax", String(cap));
        meter.setAttribute("aria-valuenow", String(now));
        meter.setAttribute("aria-valuetext", `${now} of ${cap} ${measure}`);
      }

      const state = over ? "over" : near ? "near" : "quiet";
      if (state === "quiet" || state === saidAt) { saidAt = state; return; }
      saidAt = state;
      clearTimeout(timer);
      timer = setTimeout(() => {
        heard.textContent = over
          ? `Over the limit: ${now} of ${cap} ${measure}`
          : `${cap - now} ${measure} left`;
      }, dataNumber(meter, "rmSettle", settle));
    };

    draw();
    const onInput = () => draw();
    surface.addEventListener("input", onInput);
    meter.rmSync = draw;

    cleanups.push(() => {
      clearTimeout(timer);
      surface.removeEventListener("input", onInput);
      delete meter.rmSync;
      heard.remove();
      meter.replaceChildren();
      meter.classList.remove("rm-word-count", "is-near", "is-over");
      ["role", "aria-valuemin", "aria-valuemax", "aria-valuenow", "aria-valuetext"]
        .forEach((name) => meter.removeAttribute(name));
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Saving, saved, failed, as text rather than a colour.
 *
 * All three words are laid out in the same grid cell from the moment it
 * mounts, so the badge is as wide as the longest of them and a state change is
 * a crossfade rather than a reflow that nudges whatever sits beside it. The
 * version that sets `textContent` resizes the header on every save.
 *
 * "Saved" is polite and "could not save" is assertive, because one is news and
 * the other is an interruption worth making — and the failed state grows a
 * real retry button, since telling somebody their work did not save and
 * offering them nothing to do about it is the cruellest pattern in software.
 *
 *   <p data-rm-autosave-badge></p>
 *   badge.rmSet("saved");
 */
export function autosaveBadge(target = "[data-rm-autosave-badge]", options = {}) {
  const badges = resolveElements(target);
  if (!badges.length) return () => {};

  const {
    saving = "Saving…", saved = "Saved", failed = "Could not save",
    retry = "Try again", state = "saved",
  } = options;
  const cleanups = [];

  for (const badge of badges) {
    badge.classList.add("rm-autosave-badge");

    const words = { saving, saved, failed };
    const stack = document.createElement("span");
    stack.className = "rm-autosave-badge-stack";
    stack.setAttribute("aria-hidden", "true");
    const faces = {};
    for (const [name, text] of Object.entries(words)) {
      const face = document.createElement("span");
      face.className = "rm-autosave-badge-state";
      face.textContent = text;
      faces[name] = face;
      stack.appendChild(face);
    }

    // The drawn words are decoration; this is the sentence that gets spoken,
    // and it is replaced rather than appended so nothing is said twice.
    const heard = announcer(badge, "polite");

    const again = document.createElement("button");
    again.type = "button";
    again.className = "rm-autosave-badge-retry";
    again.textContent = dataString(badge, "rmRetryLabel", retry);
    again.hidden = true;

    badge.replaceChildren(stack, again, heard);

    let now = "";
    const set = (next) => {
      const name = words[next] ? next : "saved";
      if (name === now) return;
      now = name;
      for (const [key, face] of Object.entries(faces)) face.classList.toggle("is-on", key === name);
      badge.classList.remove("is-saving", "is-saved", "is-failed");
      badge.classList.add(`is-${name}`);
      again.hidden = name !== "failed";

      // Failure is the only state worth interrupting for.
      const urgent = name === "failed";
      heard.setAttribute("aria-live", urgent ? "assertive" : "polite");
      heard.setAttribute("role", urgent ? "alert" : "status");
      heard.textContent = words[name];

      if (prefersReducedMotion()) return;
      faces[name].animate(
        [{ opacity: 0, transform: "translateY(4px)" }, { opacity: 1, transform: "none" }],
        { duration: 240, easing: EASE.out },
      );
    };

    set(dataString(badge, "rmState", state));
    badge.rmSet = set;

    const onRetry = () => {
      set("saving");
      badge.dispatchEvent(new CustomEvent("rm-autosave-retry", { bubbles: true }));
    };
    again.addEventListener("click", onRetry);

    cleanups.push(() => {
      again.removeEventListener("click", onRetry);
      delete badge.rmSet;
      badge.replaceChildren();
      badge.classList.remove("rm-autosave-badge", "is-saving", "is-saved", "is-failed");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Actions for selected text, docked rather than floating.
 *
 * The opposite decision to `bubbleMenu`, and on a reading surface it is the
 * right one: a bar that follows the selection on a touch screen lands under
 * the operating system's own selection handles and under the thumb holding
 * them. This one docks to an edge, so it is always in the same place, always
 * reachable, and never covering what was just selected.
 *
 * It sits after the region in the markup, which means Tab reaches it from the
 * text with no key nobody knows about, and Escape clears the selection and
 * puts focus back. Buttons marked `data-rm-select-action="copy"` are wired up
 * here; everything else is the page's own business, handed the selected text
 * through the `rm-selection-action` event.
 *
 *   <div data-rm-selection-toolbar="article">
 *     <button type="button" data-rm-select-action="copy">Copy</button>
 *   </div>
 */
export function selectionToolbar(target = "[data-rm-selection-toolbar]", options = {}) {
  const bars = resolveElements(target);
  if (!bars.length) return () => {};

  const {
    surface: surfaceSelector = "[data-rm-editor-surface]",
    label = "Actions for the selected text",
    dock = "bottom",
    items = "button",
  } = options;
  const cleanups = [];

  for (const bar of bars) {
    const surface = surfaceFor(bar, "data-rm-selection-toolbar", surfaceSelector);
    if (!surface) continue;

    const where = dataString(bar, "rmDockTo", dock) === "top" ? "top" : "bottom";
    bar.classList.add("rm-selection-toolbar", `is-${where}`);
    bar.setAttribute("role", "toolbar");
    bar.setAttribute("aria-label", dataString(bar, "rmLabel", label));
    bar.hidden = true;

    const buttons = [...bar.querySelectorAll(items)];
    for (const button of buttons) {
      if (button.tagName === "BUTTON" && !button.hasAttribute("type")) button.type = "button";
    }
    const stopRoving = roving(bar, () => buttons, "horizontal");
    const heard = announcer(bar, "polite");

    const selected = () => {
      if (isField(surface)) {
        const from = surface.selectionStart ?? 0;
        const to = surface.selectionEnd ?? 0;
        return surface.value.slice(from, to);
      }
      const selection = document.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) return "";
      if (!surface.contains(selection.getRangeAt(0).commonAncestorContainer)) return "";
      return selection.toString();
    };

    bar.rmText = selected;

    const sync = () => {
      if (bar.contains(document.activeElement)) return;
      const text = selected().trim();
      const show = text.length > 0;
      if (show === !bar.hidden) return;
      bar.hidden = !show;
      if (!show || prefersReducedMotion()) return;
      bar.animate(
        [{ opacity: 0, transform: `translateY(${where === "bottom" ? 12 : -12}px)` },
          { opacity: 1, transform: "none" }],
        { duration: 220, easing: EASE.out },
      );
    };

    const onClick = async (event) => {
      const button = buttons.find((one) => one === event.target || one.contains(event.target));
      if (!button) return;
      const text = selected();
      const action = dataString(button, "rmSelectAction", "");
      if (action === "copy") {
        try {
          await navigator.clipboard.writeText(text);
          heard.textContent = "Copied";
        } catch {
          heard.textContent = "Press Control or Command and C to copy.";
        }
      }
      bar.dispatchEvent(new CustomEvent("rm-selection-action", {
        bubbles: true,
        detail: { action, text, button },
      }));
    };

    const onKey = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      bar.hidden = true;
      surface.focus();
    };

    document.addEventListener("selectionchange", sync);
    bar.addEventListener("click", onClick);
    bar.addEventListener("keydown", onKey);

    cleanups.push(() => {
      document.removeEventListener("selectionchange", sync);
      bar.removeEventListener("click", onClick);
      bar.removeEventListener("keydown", onKey);
      stopRoving();
      heard.remove();
      delete bar.rmText;
      bar.hidden = false;
      bar.classList.remove("rm-selection-toolbar", `is-${where}`);
      bar.removeAttribute("role");
      bar.removeAttribute("aria-label");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * The caret line stays put and the page moves under it.
 *
 * Typing normally pushes the caret down to the bottom edge and leaves it
 * there, which is the least comfortable line on the screen to read. This keeps
 * it at a fixed height — a little above the middle by default — by scrolling
 * the container instead. Scroll position is not a layout property: nothing
 * reflows, nothing repaints beyond what scrolling already costs.
 *
 * The easing is a lerp on one shared rAF, running only while the surface is on
 * screen and the tab is in front, so the loop is not spinning behind a
 * different window. Under reduced motion it snaps to the same position rather
 * than gliding, because the point is where the line ends up, not the journey.
 *
 *   <div data-rm-typewriter contenteditable="true" data-rm-anchor="0.4">…</div>
 */
export function typewriterMode(target = "[data-rm-typewriter]", options = {}) {
  const surfaces = resolveElements(target);
  if (!surfaces.length) return () => {};

  const { anchor = 0.42, glide = 0.18, dim = false, scroller: scrollerSelector = "" } = options;
  const cleanups = [];

  for (const surface of surfaces) {
    const hold = clamp(dataNumber(surface, "rmAnchor", anchor), 0.1, 0.9);
    const ease = clamp(dataNumber(surface, "rmGlide", glide), 0.02, 1);
    const dims = dataString(surface, "rmDim", dim ? "on" : "off") === "on";

    const named = dataString(surface, "rmScroller", scrollerSelector);
    const scroller = (named && document.querySelector(named))
      || (surface.scrollHeight > surface.clientHeight ? surface : null)
      || surface.closest(".rm-markdown-preview-source")
      || document.scrollingElement
      || document.documentElement;

    surface.classList.add("rm-typewriter");
    if (dims) surface.classList.add("is-dimmed");

    let wanted = null;

    const measure = () => {
      const focused = document.activeElement === surface || surface.contains(document.activeElement);
      if (!focused) return;
      const box = caretRect(surface);
      if (!box) return;

      const view = scroller === document.scrollingElement || scroller === document.documentElement
        ? { top: 0, height: innerHeight }
        : (() => {
          const rect = scroller.getBoundingClientRect();
          return { top: rect.top, height: rect.height };
        })();

      const line = box.top + box.height / 2;
      const goal = view.top + view.height * hold;
      const room = scroller.scrollHeight - scroller.clientHeight;
      wanted = clamp(scroller.scrollTop + (line - goal), 0, Math.max(0, room));

      if (!dims) return;
      // Only the paragraph the caret is in stays at full strength; opacity, so
      // nothing moves and nothing is hidden from anything that reads the page.
      const here = document.getSelection()?.focusNode;
      const block = here ? (here.nodeType === Node.TEXT_NODE ? here.parentElement : here) : null;
      for (const child of surface.children) {
        child.classList.toggle("is-focus-line", Boolean(block && child.contains(block)));
      }
    };

    const onInput = () => measure();
    const onSelect = () => measure();
    surface.addEventListener("input", onInput);
    surface.addEventListener("keyup", onSelect);
    surface.addEventListener("click", onSelect);
    document.addEventListener("selectionchange", onSelect);

    cleanups.push(whileVisible(surface, () => onFrame(() => {
      if (wanted === null) return;
      if (prefersReducedMotion()) { scroller.scrollTop = wanted; wanted = null; return; }
      const gap = wanted - scroller.scrollTop;
      if (Math.abs(gap) < 0.5) { scroller.scrollTop = wanted; wanted = null; return; }
      scroller.scrollTop = lerp(scroller.scrollTop, wanted, ease);
    })));

    cleanups.push(() => {
      surface.removeEventListener("input", onInput);
      surface.removeEventListener("keyup", onSelect);
      surface.removeEventListener("click", onSelect);
      document.removeEventListener("selectionchange", onSelect);
      for (const child of surface.children) child.classList.remove("is-focus-line");
      surface.classList.remove("rm-typewriter", "is-dimmed");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}
