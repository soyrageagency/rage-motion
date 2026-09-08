/**
 * Text boxes worth typing into.
 *
 *   • inputKit()    — twenty-four named looks for a field.
 *   • searchField() — a search that opens out of its own icon.
 *   • tagsField()   — chips you can add and remove from the keyboard.
 *   • selectField() — a listbox built on a real `<select>`.
 *   • clearable()   — a clear button that is there only when it can do
 *                     something.
 *   • maskField()   — formatting that does not fight the caret.
 *   • inlineEdit()  — text that becomes a field where it stands.
 *
 * A field is the one control a visitor is asked to work inside rather than
 * merely at, so every look in here has to survive being *used*: the caret has
 * to stay where the typist put it, the box must not change size as characters
 * arrive, and autofill, spellcheck, paste, undo and a password manager all
 * have to keep working. That rules out the usual approach — replacing the
 * input with a contenteditable div, or redrawing its value on every keystroke
 * — so nothing here does either. The real `<input>` is always the thing you
 * are typing into, and the look is applied around it.
 *
 * The same follows for the components: `selectField` is a real `<select>` with
 * a drawn listbox in front of it, `tagsField` keeps a real field for the text
 * being typed, and `maskField` reformats without ever moving the caret to the
 * end. Each says in its own comment which of these it had to be careful about.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import { dataString, EASE, prefersReducedMotion, resolveElements } from "../core/motion.js";

/**
 * Every field look, in the order the documentation lists them.
 *
 * Exported so a page can build a gallery from the library rather than from a
 * list it typed out and will forget to update.
 */
export const INPUT_LOOKS = [
  "outline", "underline", "filled", "soft", "glass", "inset",
  "brutal", "notch", "bracket", "terminal", "glow", "gradient",
  "dashed", "lift", "slot", "pill", "sweep", "corner",
  "shadow", "ghost", "stamp", "rail", "frame", "caret",
];

const KNOWN = new Set(INPUT_LOOKS);

/**
 * What each look needs beyond a class.
 *
 *   rule    — a bar under the field, to grow or sweep
 *   corners — four brackets that close in on focus
 */
const NEEDS = {
  underline: "rule",
  sweep: "rule",
  rail: "rule",
  bracket: "corners",
  frame: "corners",
};

/** The control a field wrapper is about. */
function controlIn(holder, selector = "input, textarea, select") {
  return holder.matches?.(selector) ? holder : holder.querySelector(selector);
}

/**
 * Twenty-four named looks for a field.
 *
 *   <label data-rm-input="terminal"><span>Command</span><input></label>
 *
 * One component with a named look rather than twenty-four components, for the
 * same reason `buttonKit` is one: they share their guarantees. None of them
 * replaces the control, intercepts a keystroke or rewrites a value, so
 * autofill, paste, undo, spellcheck, a password manager and the native
 * validation bubble all still work — which is most of what a text box is for.
 *
 * Every look moves `transform`, `opacity`, `filter`, `clip-path`, a background
 * or a border *colour*. None animates a width, a padding or a font size, so no
 * field in this file can shove the form around while it is being filled in,
 * and no line of text reflows under the caret.
 *
 * All of them respond to `:focus-within` as well as `:hover`, because a field
 * is reached by keyboard at least as often as by pointer.
 */
export function inputKit(target = "[data-rm-input]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { look = "outline" } = options;
  const cleanups = [];

  for (const holder of holders) {
    const field = controlIn(holder);
    if (!field) continue;

    const want = dataString(holder, "rmInput", look);
    const name = KNOWN.has(want) ? want : look;

    holder.classList.add("rm-input", `is-${name}`);
    field.classList.add("rm-input-field");
    if (prefersReducedMotion()) holder.classList.add("is-still");

    const added = [];
    const needs = NEEDS[name];

    if (needs === "rule") {
      const rule = document.createElement("i");
      rule.className = "rm-input-rule";
      rule.setAttribute("aria-hidden", "true");
      holder.appendChild(rule);
      added.push(rule);
    }

    if (needs === "corners") {
      // Four separate marks rather than a border, because a border changes the
      // box and would move the text inside it by a pixel on focus.
      for (const side of ["tl", "tr", "bl", "br"]) {
        const mark = document.createElement("i");
        mark.className = `rm-input-corner is-${side}`;
        mark.setAttribute("aria-hidden", "true");
        holder.appendChild(mark);
        added.push(mark);
      }
    }

    // `:placeholder-shown` cannot see a value put there by autofill or by a
    // script, so the filled state is tracked as well as styled.
    const mark = () => holder.classList.toggle("has-value", Boolean(field.value));
    mark();
    field.addEventListener("input", mark);
    field.addEventListener("change", mark);

    cleanups.push(() => {
      field.removeEventListener("input", mark);
      field.removeEventListener("change", mark);
      added.forEach((node) => node.remove());
      field.classList.remove("rm-input-field");
      holder.classList.remove("rm-input", `is-${name}`, "is-still", "has-value");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A search that opens out of its own icon.
 *
 * The field is always present and always the full width it will end up; what
 * changes is a `clip-path` over it and a `transform` on the icon. So the
 * header does not reflow when the search opens, nothing beside it jumps, and
 * the input can be typed into the instant it is reachable rather than after a
 * width transition has finished.
 *
 * It stays open while it holds a value — closing a search that found something
 * throws away the visitor's work — and Escape clears it and closes it, which
 * is what Escape means in a search box everywhere else.
 *
 *   <form data-rm-search><button type="button">Search</button><input></form>
 */
export function searchField(target = "[data-rm-search]", options = {}) {
  const forms = resolveElements(target);
  if (!forms.length) return () => {};

  const { label = "Search" } = options;
  const cleanups = [];

  for (const form of forms) {
    const field = controlIn(form, "input");
    const trigger = form.querySelector("button, [data-rm-search-trigger]");
    if (!field || !trigger) continue;

    form.classList.add("rm-search");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-label", dataString(form, "rmLabel", label));
    if (!field.getAttribute("aria-label")) field.setAttribute("aria-label", label);

    let open = false;
    const set = (next) => {
      open = next;
      form.classList.toggle("is-open", open);
      trigger.setAttribute("aria-expanded", String(open));
      // Out of the tab order while it is shut: a field nobody can see is not
      // somewhere the keyboard should stop.
      field.tabIndex = open ? 0 : -1;
    };
    set(false);

    const onTrigger = () => {
      set(!open);
      if (open) field.focus();
    };
    const onBlur = () => {
      // Keep it open while it holds something worth keeping.
      if (!field.value) set(false);
    };
    const onKey = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      field.value = "";
      set(false);
      trigger.focus();
    };

    trigger.addEventListener("click", onTrigger);
    field.addEventListener("blur", onBlur);
    field.addEventListener("keydown", onKey);

    cleanups.push(() => {
      trigger.removeEventListener("click", onTrigger);
      field.removeEventListener("blur", onBlur);
      field.removeEventListener("keydown", onKey);
      field.tabIndex = 0;
      form.classList.remove("rm-search", "is-open");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Chips you can add and remove from the keyboard.
 *
 * Enter or a comma commits what is typed; Backspace in an empty field removes
 * the last chip, and every chip has a real remove button of its own. The chips
 * are not decoration around a hidden value — they are the value, kept in sync
 * with a real hidden input so the form submits what is on the screen.
 *
 * Additions and removals are announced through a polite live region. A tag
 * that only appears visually is a tag that some of your visitors just lost.
 *
 *   <div data-rm-tags data-rm-name="topics"><input></div>
 */
export function tagsField(target = "[data-rm-tags]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { name = "tags", separator = ",", max = 12 } = options;
  const cleanups = [];

  for (const holder of holders) {
    const field = controlIn(holder, "input");
    if (!field) continue;

    holder.classList.add("rm-tags");
    const list = document.createElement("ul");
    list.className = "rm-tags-list";
    holder.prepend(list);

    const store = document.createElement("input");
    store.type = "hidden";
    store.name = dataString(holder, "rmName", name);
    holder.appendChild(store);

    const said = document.createElement("span");
    said.className = "rm-tags-live";
    said.setAttribute("aria-live", "polite");
    holder.appendChild(said);

    const tags = [];

    const save = () => { store.value = tags.join(separator); };

    const draw = (text, animate) => {
      const item = document.createElement("li");
      item.className = "rm-tags-tag";
      const label = document.createElement("span");
      label.textContent = text;
      const drop = document.createElement("button");
      drop.type = "button";
      drop.className = "rm-tags-drop";
      drop.setAttribute("aria-label", `Remove ${text}`);
      drop.textContent = "×";
      item.append(label, drop);
      list.appendChild(item);

      if (animate && !prefersReducedMotion()) {
        item.animate(
          [{ opacity: 0, transform: "scale(0.8)" }, { opacity: 1, transform: "none" }],
          { duration: 260, easing: EASE.out },
        );
      }
      return item;
    };

    const remove = (text, item) => {
      const at = tags.indexOf(text);
      if (at < 0) return;
      tags.splice(at, 1);
      save();
      said.textContent = `${text} removed`;

      const done = () => item.remove();
      if (prefersReducedMotion()) done();
      else {
        item.animate(
          [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(0.8)" }],
          { duration: 200, easing: EASE.inOut, fill: "forwards" },
        ).finished.then(done, done);
      }
    };

    const add = (raw) => {
      const text = raw.trim();
      if (!text || tags.includes(text) || tags.length >= max) return false;
      tags.push(text);
      save();
      said.textContent = `${text} added`;
      draw(text, true);
      return true;
    };

    // Anything already in the field when the page loads becomes chips, so the
    // component works on a form the server has filled in.
    field.value.split(separator).forEach((one) => add(one));
    field.value = "";

    const onKey = (event) => {
      if (event.key === "Enter" || event.key === separator) {
        event.preventDefault();
        if (add(field.value)) field.value = "";
        return;
      }
      if (event.key === "Backspace" && !field.value && tags.length) {
        const last = list.lastElementChild;
        if (last) remove(tags[tags.length - 1], last);
      }
    };

    const onClick = (event) => {
      const drop = event.target.closest(".rm-tags-drop");
      if (!drop) return;
      const item = drop.closest(".rm-tags-tag");
      remove(item.querySelector("span").textContent, item);
      field.focus();
    };

    field.addEventListener("keydown", onKey);
    list.addEventListener("click", onClick);

    cleanups.push(() => {
      field.removeEventListener("keydown", onKey);
      list.removeEventListener("click", onClick);
      list.remove();
      store.remove();
      said.remove();
      holder.classList.remove("rm-tags");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A listbox built on a real `<select>`.
 *
 * The `<select>` stays, keeps the value and submits with the form; what is
 * drawn is a face showing the current option. Clicking the face opens the
 * native menu on every platform that has one, so a phone gets its own wheel
 * and a screen reader gets the control it already knows — the drawn part is
 * only ever the part you could safely lose.
 *
 * This is the opposite of the usual custom select, which reimplements the
 * whole thing in divs and then spends a thousand lines failing to be a select.
 *
 *   <label data-rm-select><span>Plan</span><select>…</select></label>
 */
export function selectField(target = "[data-rm-select]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { placeholder = "Choose" } = options;
  const cleanups = [];

  for (const holder of holders) {
    const field = controlIn(holder, "select");
    if (!field) continue;

    holder.classList.add("rm-select");
    field.classList.add("rm-select-native");

    const face = document.createElement("span");
    face.className = "rm-select-face";
    // The face is decoration over a control that already says all of this.
    face.setAttribute("aria-hidden", "true");
    const text = document.createElement("span");
    text.className = "rm-select-text";
    const caret = document.createElement("i");
    caret.className = "rm-select-caret";
    face.append(text, caret);
    holder.appendChild(face);

    const show = () => {
      const chosen = field.selectedOptions[0];
      text.textContent = chosen ? chosen.textContent : dataString(holder, "rmPlaceholder", placeholder);
      holder.classList.toggle("is-chosen", Boolean(chosen && chosen.value));
    };
    show();

    const bump = () => {
      show();
      if (prefersReducedMotion()) return;
      text.animate(
        [{ opacity: 0, transform: "translateY(4px)" }, { opacity: 1, transform: "none" }],
        { duration: 220, easing: EASE.out },
      );
    };

    field.addEventListener("change", bump);

    cleanups.push(() => {
      field.removeEventListener("change", bump);
      face.remove();
      field.classList.remove("rm-select-native");
      holder.classList.remove("rm-select", "is-chosen");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A clear button that is there only when it can do something.
 *
 * It appears when the field has a value and goes when it does not, so it never
 * offers to undo nothing. Clearing returns focus to the field, because the
 * next thing a person does after clearing a box is type in it.
 *
 * The button is `type="button"`, which is the whole bug in most hand-rolled
 * versions: inside a form, a button without a type submits it.
 *
 *   <div data-rm-clearable><input></div>
 */
export function clearable(target = "[data-rm-clearable]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { label = "Clear" } = options;
  const cleanups = [];

  for (const holder of holders) {
    const field = controlIn(holder, "input, textarea");
    if (!field) continue;

    holder.classList.add("rm-clearable");
    const drop = document.createElement("button");
    drop.type = "button";
    drop.className = "rm-clearable-drop";
    drop.setAttribute("aria-label", dataString(holder, "rmLabel", label));
    drop.textContent = "×";
    holder.appendChild(drop);

    const show = () => {
      const has = Boolean(field.value);
      holder.classList.toggle("is-clearable", has);
      drop.tabIndex = has ? 0 : -1;
      drop.setAttribute("aria-hidden", String(!has));
    };
    show();

    const wipe = () => {
      field.value = "";
      // A programmatic change fires neither event, and anything else watching
      // the field — a counter, a validator, a filter — is waiting for them.
      field.dispatchEvent(new Event("input", { bubbles: true }));
      field.dispatchEvent(new Event("change", { bubbles: true }));
      show();
      field.focus();
    };

    field.addEventListener("input", show);
    field.addEventListener("change", show);
    drop.addEventListener("click", wipe);

    cleanups.push(() => {
      field.removeEventListener("input", show);
      field.removeEventListener("change", show);
      drop.removeEventListener("click", wipe);
      drop.remove();
      holder.classList.remove("rm-clearable", "is-clearable");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Formatting that does not fight the caret.
 *
 * Card numbers and phone numbers are far easier to check when they are
 * grouped, and every naive implementation makes them impossible to edit: it
 * rewrites the value and the caret jumps to the end, so correcting the second
 * digit of a card number means retyping the rest of it.
 *
 * This counts how many real characters sit before the caret, reformats, then
 * puts the caret back after that many real characters. Typing in the middle,
 * deleting in the middle and pasting all keep their place.
 *
 *   <input data-rm-mask="#### #### #### ####" inputmode="numeric">
 */
export function maskField(target = "[data-rm-mask]", options = {}) {
  const fields = resolveElements(target);
  if (!fields.length) return () => {};

  const { pattern = "#### #### #### ####" } = options;
  const cleanups = [];

  for (const field of fields) {
    const shape = dataString(field, "rmMask", pattern);
    field.classList.add("rm-mask");
    if (!field.getAttribute("inputmode") && !/[A-Za-z]/.test(shape.replace(/#/g, ""))) {
      field.setAttribute("inputmode", "numeric");
    }

    const clean = (value) => value.replace(/[^0-9A-Za-z]/g, "");

    const apply = (raw) => {
      const source = clean(raw);
      let out = "";
      let at = 0;
      for (const slot of shape) {
        if (at >= source.length) break;
        if (slot === "#") { out += source[at]; at += 1; } else { out += slot; }
      }
      return out;
    };

    const format = () => {
      const before = field.selectionStart ?? field.value.length;
      // How many real characters are to the left of the caret right now.
      const kept = clean(field.value.slice(0, before)).length;

      const next = apply(field.value);
      if (next === field.value) return;
      field.value = next;

      // Walk forward until that many real characters have been passed.
      let seen = 0;
      let put = next.length;
      for (let i = 0; i < next.length; i++) {
        if (/[0-9A-Za-z]/.test(next[i])) seen += 1;
        if (seen === kept) { put = i + 1; break; }
      }
      if (kept === 0) put = 0;
      field.setSelectionRange(put, put);
    };

    format();
    field.addEventListener("input", format);

    cleanups.push(() => {
      field.removeEventListener("input", format);
      field.classList.remove("rm-mask");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Text that becomes a field where it stands.
 *
 * The field is placed over the text at the same size and typeface, so nothing
 * moves when editing begins — the word you clicked stays exactly where you
 * clicked it. That is the entire point of editing in place, and the version
 * that swaps in a differently sized input loses it.
 *
 * Enter commits, Escape restores what was there, and blur commits. The button
 * that starts it is a real button, so it is reachable and announced as
 * editable rather than being a div waiting for a click.
 *
 *   <div data-rm-inline-edit><button>Untitled project</button></div>
 */
export function inlineEdit(target = "[data-rm-inline-edit]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { label = "Edit" } = options;
  const cleanups = [];

  for (const holder of holders) {
    const trigger = holder.querySelector("button");
    if (!trigger) continue;

    holder.classList.add("rm-inline-edit");
    trigger.classList.add("rm-inline-edit-text");
    trigger.setAttribute("aria-label", `${dataString(holder, "rmLabel", label)}: ${trigger.textContent.trim()}`);

    const field = document.createElement("input");
    field.type = "text";
    field.className = "rm-inline-edit-field";
    field.hidden = true;
    field.setAttribute("aria-label", dataString(holder, "rmLabel", label));
    holder.appendChild(field);

    let was = "";

    const stop = (commit) => {
      const text = commit && field.value.trim() ? field.value.trim() : was;
      trigger.textContent = text;
      trigger.setAttribute("aria-label", `${dataString(holder, "rmLabel", label)}: ${text}`);
      field.hidden = true;
      trigger.hidden = false;
      holder.classList.remove("is-editing");
      trigger.focus();
    };

    const start = () => {
      was = trigger.textContent.trim();
      field.value = was;
      trigger.hidden = true;
      field.hidden = false;
      holder.classList.add("is-editing");
      field.focus();
      field.select();
      if (!prefersReducedMotion()) {
        field.animate(
          [{ opacity: 0 }, { opacity: 1 }],
          { duration: 160, easing: EASE.out },
        );
      }
    };

    const onKey = (event) => {
      if (event.key === "Enter") { event.preventDefault(); stop(true); }
      else if (event.key === "Escape") { event.preventDefault(); stop(false); }
    };
    const onBlur = () => { if (!field.hidden) stop(true); };

    trigger.addEventListener("click", start);
    field.addEventListener("keydown", onKey);
    field.addEventListener("blur", onBlur);

    cleanups.push(() => {
      trigger.removeEventListener("click", start);
      field.removeEventListener("keydown", onKey);
      field.removeEventListener("blur", onBlur);
      field.remove();
      trigger.hidden = false;
      trigger.classList.remove("rm-inline-edit-text");
      holder.classList.remove("rm-inline-edit", "is-editing");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}
