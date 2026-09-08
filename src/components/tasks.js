/**
 * Task lists and boards — twenty ways to keep track of what is left.
 *
 *   • taskList()     — checkable items that strike through and settle.
 *   • taskCheck()    — a tick that draws itself.
 *   • taskReorder()  — drag to reorder, and move by keyboard.
 *   • taskGroup()    — a collapsible section of tasks.
 *   • kanban()       — columns you drag between, or move between by keyboard.
 *   • taskProgress() — a real progress bar over a list.
 *   • taskFilter()   — chips that filter the list and FLIP what is left.
 *   • subtasks()     — nested tasks with a progress ring on the parent.
 *   • taskDue()      — a due date that changes tone as it approaches.
 *   • taskPriority() — a real select, drawn as a flag.
 *   • taskAssignee() — an avatar picker that is a real listbox.
 *   • taskSwipe()    — swipe to complete, with a button that does the same.
 *   • taskUndo()     — completing is undoable, in the row it happened in.
 *   • taskCount()    — a live count of what is left.
 *   • taskEmpty()    — the all-done state, arriving.
 *   • taskSearch()   — filter as you type, announced once you stop.
 *   • taskBulk()     — select many, act once.
 *   • taskTimer()    — time spent on a task.
 *   • taskStreak()   — consecutive days, drawn.
 *   • taskNote()     — an inline note that expands in place.
 *
 * A task list is a thing people operate rather than read, so the discipline
 * here is about state rather than arrival. Every completion is a real
 * `role="checkbox"` with `aria-checked`, every count is a sentence rather than
 * a bare number, every progress bar carries `aria-valuenow` and an
 * `aria-valuetext` that says "three of eight" instead of "37". Anything you can
 * drag you can also move with the keyboard, and the keyboard route is the one
 * that gets the announcement — a board that can only be operated by holding
 * down a mouse button is a board half the people who need it cannot use.
 *
 * Nothing here animates a size. Rows that move, move by transform after the
 * fact: measure, change, invert, play. The one place a box genuinely has to
 * change size is `taskGroup`, which interpolates a grid track because a section
 * of unknown height cannot be revealed any other way — and it says so, rather
 * than guessing a `max-height` and getting the easing wrong for every section
 * that is not exactly that tall.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import {
  clamp, dataNumber, dataString, EASE, onFrame, prefersReducedMotion, resolveElements, watch,
  whileVisible,
} from "../core/motion.js";

/* ── Shared plumbing ─────────────────────────────────────────────────────── */

/** A live region owned by one component, created once and spoken to by name. */
function speaker(holder, tone = "polite") {
  const said = document.createElement("p");
  said.className = "rm-task-live";
  said.setAttribute("aria-live", tone);
  said.setAttribute("role", tone === "assertive" ? "alert" : "status");
  holder.appendChild(said);
  return said;
}

/**
 * Set an attribute now and put back exactly what was there on cleanup.
 *
 * A component that removes `aria-label` when it stops has quietly deleted the
 * author's own label, which is worse than the leftover it was tidying. The
 * difference between "there was nothing here" and "there was something else
 * here" is the whole job, so it is recorded rather than assumed.
 */
function setAttr(element, name, value) {
  const had = element.getAttribute(name);
  element.setAttribute(name, value);
  return () => {
    if (had === null) element.removeAttribute(name);
    else element.setAttribute(name, had);
  };
}

/** Say something, and say it again even when the words have not changed. */
function say(region, words) {
  if (!region) return;
  // An identical string is not re-announced by most screen readers, which is
  // wrong when the same thing has genuinely happened twice. The zero-width
  // space makes each message a new one without changing what is read out.
  region.textContent = region.textContent === words ? `${words}​` : words;
}

/**
 * The rows a list owns.
 *
 * Direct children when any of them match, because a nested list of subtasks
 * belongs to the subtask component and must never be counted twice by the
 * parent. Only when the rows are wrapped in something does this fall back to
 * searching the whole subtree.
 */
function rows(list, selector = "li") {
  const direct = [...list.children].filter((el) => el.matches(selector));
  return direct.length ? direct : [...list.querySelectorAll(selector)];
}

/** Is this row finished? Read from whatever the markup happens to use. */
function isDone(item) {
  // `data-rm-done` is spelled two ways across the kit and both are honest. This
  // module writes "true" and "false" because it toggles the value; the
  // checklist in extras.js marks a finished row with the bare attribute, which
  // is what its own examples show. Markup pasted from one into the other has to
  // read the same way in both, so presence counts as done and only an explicit
  // "false" does not — and even then the checkbox below still gets a say.
  if (item.hasAttribute("data-rm-done") && item.dataset.rmDone !== "false") return true;
  if (item.getAttribute("aria-checked") === "true") return true;
  const box = item.querySelector('[role="checkbox"], input[type="checkbox"]');
  if (!box) return false;
  return box.getAttribute("aria-checked") === "true" || box.checked === true;
}

/** Is this row currently on the page at all? Filtering hides rows, not deletes. */
const isShown = (item) => !item.hidden && item.dataset.rmFiltered !== "true";

/**
 * Call `handler` whenever anything about the list's tasks changes.
 *
 * Attribute mutations rather than a custom event, so a list driven by somebody
 * else's code — a framework, a form, plain markup edited by hand — still drives
 * the counters and progress bars sitting next to it. `class` is deliberately
 * not watched: components in here add classes of their own, and watching for
 * them is how an observer ends up calling itself forever.
 */
function onTaskChange(list, handler) {
  const observer = new MutationObserver(handler);
  observer.observe(list, {
    childList: true,
    subtree: true,
    attributeFilter: ["aria-checked", "data-rm-done", "data-rm-filtered", "hidden", "checked"],
  });
  const onInput = () => handler();
  list.addEventListener("change", onInput);
  return () => {
    observer.disconnect();
    list.removeEventListener("change", onInput);
  };
}

/**
 * Find the list a satellite component is about.
 *
 * The attribute value is an id when there is one, because that is explicit and
 * survives the markup being moved. Without it, the nearest list in the same
 * section — which is right often enough to make the attribute optional and
 * never so clever that it is hard to predict.
 */
function listFor(element, attribute) {
  const id = element.getAttribute(attribute);
  if (id) {
    const named = document.getElementById(id);
    if (named) return named;
  }
  const near = element.parentElement?.querySelector("ul, ol");
  if (near) return near;
  return element.closest("section, article, form, div, body")?.querySelector("ul, ol") ?? null;
}

/**
 * Measure, change, invert, play.
 *
 * The only honest way to move rows about. The DOM changes in one go and every
 * row that ended up somewhere else is animated from where it used to be with a
 * transform, so the list is correct on the frame the change happens and the
 * motion is decoration on top of a finished layout. Animating the layout itself
 * — heights, margins, `top` — reflows the page on every frame and drops rows on
 * a long list.
 */
function flip(items, mutate, { duration = 320, easing = EASE.out } = {}) {
  const before = new Map();
  for (const item of items) before.set(item, item.getBoundingClientRect());

  mutate();

  if (prefersReducedMotion()) return;
  for (const item of items) {
    if (!item.isConnected) continue;
    const was = before.get(item);
    const now = item.getBoundingClientRect();
    if (!now.width && !now.height) continue;

    // It was hidden a moment ago, so there is no "from" position to slide from.
    // Arriving in place is the honest reading of what happened.
    if (!was || (!was.width && !was.height)) {
      item.animate(
        [{ opacity: 0, transform: "scale(0.96)" }, { opacity: 1, transform: "none" }],
        { duration, easing },
      );
      continue;
    }

    const dx = was.left - now.left;
    const dy = was.top - now.top;
    if (!dx && !dy) continue;
    item.animate(
      [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }],
      { duration, easing },
    );
  }
}

/** The tick, as one path that can be drawn rather than as a glyph. */
function tickSvg(className) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M5 12.5 10 17.4 19.2 7");
  // `pathLength="1"` normalises the geometry, so a dash offset of 1 is "not
  // drawn" whatever the real length of the stroke is. Without it every icon
  // needs its own magic number measured by hand.
  path.setAttribute("pathLength", "1");
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "currentColor");
  path.setAttribute("stroke-width", "2.6");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");
  path.setAttribute("class", className);
  svg.appendChild(path);
  return { svg, path };
}

/** The text of a row, without the buttons that were added around it. */
function labelOf(item) {
  return item.querySelector(".rm-task-list-label") ?? item;
}

/* ── Components ──────────────────────────────────────────────────────────── */

/**
 * Checkable items that strike through and settle.
 *
 * The line through a completed task is drawn as a rule scaled across the label
 * from its left edge, not as `text-decoration` — which cannot be animated at
 * all, so the usual version snaps a line across the text and calls it a
 * transition. Scaling a rule also means the row's box never changes, so
 * completing the top task of forty does not nudge the other thirty-nine.
 *
 * Each box is a real `role="checkbox"` on a `<button type="button">` with
 * `aria-checked`, and the change is announced with the task's own name, so
 * "Buy milk, checked" rather than a click nobody hears.
 *
 *   <ul data-rm-task-list>
 *     <li>Buy milk</li>
 *     <li data-rm-done="true">Book the van</li>
 *   </ul>
 */
export function taskList(target = "[data-rm-task-list]", options = {}) {
  const lists = resolveElements(target);
  if (!lists.length) return () => {};

  const { item = "li", duration = 380, label = "Tasks" } = options;
  const cleanups = [];

  for (const list of lists) {
    const selector = dataString(list, "rmItem", item);
    const span = dataNumber(list, "rmDuration", duration);
    list.classList.add("rm-task-list");
    const unlabel = setAttr(list, "aria-label", dataString(list, "rmLabel", label));
    list.style.setProperty("--rm-task-strike-duration", `${prefersReducedMotion() ? 0 : span}ms`);

    const region = speaker(list.parentElement ?? list);
    const built = [];

    for (const row of rows(list, selector)) {
      row.classList.add("rm-task-list-row");
      const was = row.getAttribute("data-rm-done");

      // The label is wrapped so the strike has something exactly the width of
      // the text to travel across. Wrapping the whole row would draw the line
      // through the checkbox as well.
      //
      // Only the nodes ahead of a nested list are taken. A row with subtasks
      // under it is the shape this module is built for, and swallowing that
      // list into the label would give the checkbox an accessible name made of
      // the task plus every subtask beneath it — "Ship the site Copy
      // Photography" — and draw the strike rule across the sublist as well as
      // across the task's own words. The nested list stays a sibling.
      const text = document.createElement("span");
      text.className = "rm-task-list-label";
      const own = [];
      for (const node of row.childNodes) {
        if (node.nodeType === Node.ELEMENT_NODE && (node.tagName === "UL" || node.tagName === "OL")) break;
        own.push(node);
      }
      text.append(...own);
      row.prepend(text);

      const box = document.createElement("button");
      box.type = "button";
      box.className = "rm-task-list-box";
      box.setAttribute("role", "checkbox");
      const { svg } = tickSvg("rm-task-list-tick");
      box.appendChild(svg);
      row.prepend(box);

      // The accessible name of the checkbox is the task, so it is never read
      // out as an anonymous "checkbox" in a list of nineteen other ones.
      const name = text.textContent.trim();
      box.setAttribute("aria-label", name);

      const paint = (done, announce) => {
        row.dataset.rmDone = done ? "true" : "false";
        row.classList.toggle("is-done", done);
        box.setAttribute("aria-checked", done ? "true" : "false");
        if (announce) say(region, `${name}${done ? " done" : " not done"}`);
        if (done && !prefersReducedMotion()) {
          box.animate(
            [{ transform: "scale(0.82)" }, { transform: "scale(1.08)" }, { transform: "none" }],
            { duration: 320, easing: EASE.out },
          );
        }
      };

      paint(isDone(row), false);
      const onClick = () => paint(row.dataset.rmDone !== "true", true);
      box.addEventListener("click", onClick);
      built.push({ row, text, box, onClick, was });
    }

    list.rmSet = (row, done) => {
      const found = built.find((entry) => entry.row === row);
      if (!found) return;
      found.box.setAttribute("aria-checked", done ? "true" : "false");
      row.dataset.rmDone = done ? "true" : "false";
      row.classList.toggle("is-done", done);
    };
    list.rmDone = () => built.filter(({ row }) => isDone(row)).length;

    cleanups.push(() => {
      delete list.rmSet;
      delete list.rmDone;
      region.remove();
      unlabel();
      for (const { row, text, box, onClick, was } of built) {
        box.removeEventListener("click", onClick);
        box.remove();
        // Put back in place rather than appended: the label went in ahead of a
        // nested list of subtasks, and it has to come out ahead of it too.
        text.replaceWith(...text.childNodes);
        row.classList.remove("rm-task-list-row", "is-done");
        // The authored state goes back, not merely away: a row that arrived
        // already ticked is still ticked once this component has let go of it.
        if (was === null) delete row.dataset.rmDone;
        else row.setAttribute("data-rm-done", was);
      }
      list.classList.remove("rm-task-list");
      list.style.removeProperty("--rm-task-strike-duration");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A tick that draws itself.
 *
 * One path with `pathLength="1"`, so the dash array is 1 and the offset goes
 * from 1 to 0 whatever the real geometry measures — the version with a
 * hand-measured `stroke-dasharray: 22.4` breaks the moment anybody changes the
 * icon or the stroke width. Unchecking rubs the line back out the way it came
 * rather than switching it off, which is the difference between a state change
 * and a redraw.
 *
 * The mark is `aria-hidden`; the button around it carries the state, so nothing
 * depends on a screen reader understanding an SVG.
 *
 *   <button type="button" data-rm-task-check aria-label="Send the invoice"></button>
 */
export function taskCheck(target = "[data-rm-task-check]", options = {}) {
  const marks = resolveElements(target);
  if (!marks.length) return () => {};

  const { duration = 420, label = "Done" } = options;
  const cleanups = [];

  for (const mark of marks) {
    const span = dataNumber(mark, "rmDuration", duration);
    const isButton = mark.tagName === "BUTTON";
    // Whatever the author already wrote is recorded before anything is touched.
    // A `type="submit"` control inside a form that comes back a plain button
    // once this component lets go is a form that has quietly lost its submit,
    // and a row that arrived carrying `data-rm-done` is a row that should still
    // be ticked afterwards.
    const wasDone = mark.getAttribute("data-rm-done");

    // A real button if the markup gave one; otherwise one is made, because the
    // alternative is a div with a click handler that the keyboard cannot reach.
    const box = isButton ? mark : document.createElement("button");
    const untype = setAttr(box, "type", "button");
    if (!isButton) mark.appendChild(box);
    box.classList.add("rm-task-check");
    box.setAttribute("role", "checkbox");
    // Only a name this component invented is a name this component may remove,
    // so the restore is kept rather than assumed.
    const unlabel = !box.hasAttribute("aria-label") && !box.textContent.trim()
      ? setAttr(box, "aria-label", dataString(mark, "rmLabel", label))
      : null;

    const { svg, path } = tickSvg("rm-task-check-tick");
    box.appendChild(svg);

    let done = mark.dataset.rmDone === "true" || box.getAttribute("aria-checked") === "true";
    // Start state from JavaScript: an undrawn tick is a dash offset set here,
    // never a rule in the stylesheet that leaves the mark invisible if the
    // script never runs.
    path.style.strokeDasharray = "1";
    path.style.strokeDashoffset = done ? "0" : "1";
    box.setAttribute("aria-checked", done ? "true" : "false");

    const draw = (next) => {
      done = next;
      box.setAttribute("aria-checked", done ? "true" : "false");
      mark.dataset.rmDone = done ? "true" : "false";
      box.classList.toggle("is-checked", done);
      if (prefersReducedMotion()) {
        path.style.strokeDashoffset = done ? "0" : "1";
        return;
      }
      path.animate(
        [{ strokeDashoffset: done ? 1 : 0 }, { strokeDashoffset: done ? 0 : 1 }],
        { duration: span, easing: done ? EASE.out : EASE.inOut, fill: "forwards" },
      );
    };

    const onClick = () => draw(!done);
    box.addEventListener("click", onClick);
    box.rmSet = draw;

    cleanups.push(() => {
      box.removeEventListener("click", onClick);
      delete box.rmSet;
      svg.remove();
      path.style.strokeDasharray = "";
      path.style.strokeDashoffset = "";
      box.classList.remove("rm-task-check", "is-checked");
      box.removeAttribute("role");
      box.removeAttribute("aria-checked");
      unlabel?.();
      untype();
      if (!isButton) box.remove();
      if (wasDone === null) delete mark.dataset.rmDone;
      else mark.setAttribute("data-rm-done", wasDone);
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Drag to reorder, and move by keyboard.
 *
 * The drag is the flourish and the keyboard is the feature. Every row has a
 * handle that is a real button; Alt with the up and down arrows moves the row
 * it belongs to, and each move is announced as "Buy milk, position 2 of 7" so
 * somebody who cannot see the list still knows where the thing they are holding
 * has ended up. A reorder that only exists under a held mouse button is a
 * reorder most keyboard and switch users simply cannot perform.
 *
 * Both routes end in the same place: the DOM order changes once and the rows
 * that moved are FLIPped from where they were. The dragged row's transform is
 * recomputed from its live layout position each move, so it stays exactly under
 * the finger even after the DOM has been rearranged beneath it.
 *
 *   <ul data-rm-task-reorder>
 *     <li>Draft the brief</li>
 *   </ul>
 */
export function taskReorder(target = "[data-rm-task-reorder]", options = {}) {
  const lists = resolveElements(target);
  if (!lists.length) return () => {};

  const { item = "li", duration = 300, label = "Reorderable tasks" } = options;
  const cleanups = [];

  for (const list of lists) {
    const selector = dataString(list, "rmItem", item);
    const span = dataNumber(list, "rmDuration", duration);
    list.classList.add("rm-task-reorder");
    const unlabel = setAttr(list, "aria-label", dataString(list, "rmLabel", label));

    const region = speaker(list.parentElement ?? list);
    const built = [];
    const siblings = () => rows(list, selector);

    const announce = (row) => {
      const all = siblings();
      const name = labelOf(row).textContent.trim();
      say(region, `${name}, position ${all.indexOf(row) + 1} of ${all.length}`);
    };

    const move = (row, by) => {
      const all = siblings();
      const at = all.indexOf(row);
      const to = clamp(at + by, 0, all.length - 1);
      if (to === at) return;
      flip(all, () => {
        if (by < 0) list.insertBefore(row, all[to]);
        else all[to].after(row);
      }, { duration: span });
      announce(row);
    };

    for (const row of siblings()) {
      row.classList.add("rm-task-reorder-row");

      const grip = document.createElement("button");
      grip.type = "button";
      grip.className = "rm-task-reorder-grip";
      grip.innerHTML = '<span aria-hidden="true">⠿</span>';
      grip.setAttribute("aria-label", `Reorder ${labelOf(row).textContent.trim()}`);
      row.prepend(grip);

      const onKey = (event) => {
        // Alt is the modifier because the bare arrows belong to the browser:
        // stealing them from a list means somebody cannot scroll past it.
        if (!event.altKey || (event.key !== "ArrowUp" && event.key !== "ArrowDown")) return;
        event.preventDefault();
        move(row, event.key === "ArrowUp" ? -1 : 1);
        grip.focus();
      };
      grip.addEventListener("keydown", onKey);

      let grabY = 0;
      let dragging = false;

      const place = (event) => {
        // Cleared first so the layout position is the real one rather than the
        // one the last transform put it in. Two reads per pointer move is a
        // fair price for a row that never drifts away from the finger.
        row.style.transform = "";
        const home = row.getBoundingClientRect();
        row.style.transform = `translateY(${event.clientY - grabY - home.top}px)`;
        return home;
      };

      const onDown = (event) => {
        if (event.button > 0) return;
        dragging = true;
        grabY = event.clientY - row.getBoundingClientRect().top;
        row.classList.add("is-dragging");
        grip.setPointerCapture?.(event.pointerId);
        event.preventDefault();
      };

      const onMove = (event) => {
        if (!dragging) return;
        place(event);
        const others = siblings().filter((other) => other !== row);
        const over = others.find((other) => {
          const box = other.getBoundingClientRect();
          return event.clientY > box.top && event.clientY < box.bottom;
        });
        if (!over) return;
        const box = over.getBoundingClientRect();
        const after = event.clientY > box.top + box.height / 2;
        flip(others, () => {
          if (after) over.after(row);
          else list.insertBefore(row, over);
        }, { duration: span });
        place(event);
      };

      const onUp = (event) => {
        if (!dragging) return;
        dragging = false;
        grip.releasePointerCapture?.(event.pointerId);
        row.classList.remove("is-dragging");
        const was = row.getBoundingClientRect();
        row.style.transform = "";
        const now = row.getBoundingClientRect();
        if (!prefersReducedMotion() && was.top !== now.top) {
          row.animate(
            [{ transform: `translateY(${was.top - now.top}px)` }, { transform: "none" }],
            { duration: span, easing: EASE.out },
          );
        }
        announce(row);
      };

      grip.addEventListener("pointerdown", onDown);
      grip.addEventListener("pointermove", onMove);
      grip.addEventListener("pointerup", onUp);
      grip.addEventListener("pointercancel", onUp);
      built.push({ row, grip, onKey, onDown, onMove, onUp });
    }

    list.rmMove = move;

    cleanups.push(() => {
      delete list.rmMove;
      region.remove();
      unlabel();
      for (const entry of built) {
        entry.grip.removeEventListener("keydown", entry.onKey);
        entry.grip.removeEventListener("pointerdown", entry.onDown);
        entry.grip.removeEventListener("pointermove", entry.onMove);
        entry.grip.removeEventListener("pointerup", entry.onUp);
        entry.grip.removeEventListener("pointercancel", entry.onUp);
        entry.grip.remove();
        entry.row.style.transform = "";
        entry.row.classList.remove("rm-task-reorder-row", "is-dragging");
      }
      list.classList.remove("rm-task-reorder");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A collapsible section of tasks.
 *
 * The one place in this module where a box genuinely changes size, because a
 * section of unknown height cannot be revealed without doing so. It interpolates
 * a grid track from `0fr` to `1fr` rather than guessing a `max-height`: the
 * guess makes the easing wrong for every section shorter than the guess, and
 * clips every section taller than it. The track is animated by CSS, so the work
 * happens off the main thread as far as the browser can manage it.
 *
 * `taskNote`, at the bottom of this file, solves what looks like the same
 * problem — reveal a block of unknown height — with a clip-path played at the
 * block's final size, and it is right to. A note lives inside a row, so growing
 * it would shove every task below it down the page. A section panel is the
 * opposite case: it is the last thing in its own section, and the sections
 * after it are *supposed* to move up when it closes. Clipping a panel that
 * still occupies its full height would leave a collapsed section holding a
 * screen of empty space, which is not a collapse at all. One reflow, bounded by
 * the sections below it, is the honest cost of the interaction.
 *
 * The header is a real `<button>` with `aria-expanded` and `aria-controls`, and
 * the panel is `inert` while closed so Tab cannot land inside something nobody
 * can see. The count stays in the header, so collapsing a section never hides
 * how much is in it.
 *
 *   <section data-rm-task-group data-rm-open="false">
 *     <h3>This week</h3>
 *     <ul><li>Send the invoice</li></ul>
 *   </section>
 */
export function taskGroup(target = "[data-rm-task-group]", options = {}) {
  const groups = resolveElements(target);
  if (!groups.length) return () => {};

  const { open = true, duration = 320, item = "li" } = options;
  const cleanups = [];
  let seq = 0;

  for (const group of groups) {
    const head = group.firstElementChild;
    if (!head) continue;

    const span = dataNumber(group, "rmDuration", duration);
    const wanted = dataString(group, "rmOpen", String(open)) !== "false";
    group.classList.add("rm-task-group");
    group.style.setProperty("--rm-task-group-duration", `${prefersReducedMotion() ? 0 : span}ms`);

    // Everything after the heading becomes the panel. Two nested boxes are
    // needed: the outer one owns the grid track, the inner one is what gets
    // measured by it, and `min-height: 0` on the inner box is what lets the
    // track actually reach zero.
    const panel = document.createElement("div");
    panel.className = "rm-task-group-panel";
    const inner = document.createElement("div");
    inner.className = "rm-task-group-inner";
    panel.appendChild(inner);
    while (head.nextSibling) inner.appendChild(head.nextSibling);
    group.appendChild(panel);
    panel.id = panel.id || `rm-task-group-${(seq += 1)}`;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "rm-task-group-head";
    button.setAttribute("aria-controls", panel.id);
    button.append(...head.childNodes);

    const count = document.createElement("span");
    count.className = "rm-task-group-count";
    const left = rows(inner.querySelector("ul, ol") ?? inner, dataString(group, "rmItem", item))
      .filter((row) => !isDone(row)).length;
    count.textContent = String(left);
    count.setAttribute("aria-label", `${left} not done`);
    button.appendChild(count);

    const chevron = document.createElement("span");
    chevron.className = "rm-task-group-chevron";
    chevron.setAttribute("aria-hidden", "true");
    button.appendChild(chevron);
    head.appendChild(button);

    const set = (next) => {
      group.classList.toggle("is-open", next);
      button.setAttribute("aria-expanded", next ? "true" : "false");
      panel.inert = !next;
    };
    set(wanted);

    const onClick = () => set(button.getAttribute("aria-expanded") !== "true");
    button.addEventListener("click", onClick);
    group.rmSet = set;

    cleanups.push(() => {
      button.removeEventListener("click", onClick);
      delete group.rmSet;
      head.append(...button.childNodes);
      count.remove();
      chevron.remove();
      button.remove();
      while (inner.firstChild) group.appendChild(inner.firstChild);
      panel.remove();
      group.classList.remove("rm-task-group", "is-open");
      group.style.removeProperty("--rm-task-group-duration");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Columns you drag between, or move between by keyboard.
 *
 * A board is the interaction most often built as mouse-only, and it is the one
 * where that hurts most, because moving a card between columns is the entire
 * point of the thing. So every card is focusable, Space picks it up, the arrow
 * keys move it between and within columns, Space puts it down and Escape puts
 * it back where it started. Each of those says out loud what happened and where
 * the card now is.
 *
 * Columns are labelled groups and the cards inside are a list, so the structure
 * is readable rather than a wall of nested divs. All movement is a FLIP after
 * the DOM has already changed, so the board is never mid-animation when it is
 * read.
 *
 *   <div data-rm-kanban>
 *     <section data-rm-column="To do"><h3>To do</h3><ul><li>Write copy</li></ul></section>
 *     <section data-rm-column="Doing"><h3>Doing</h3><ul></ul></section>
 *   </div>
 */
export function kanban(target = "[data-rm-kanban]", options = {}) {
  const boards = resolveElements(target);
  if (!boards.length) return () => {};

  const { card = "li", duration = 320, label = "Board" } = options;
  const cleanups = [];

  for (const board of boards) {
    // Nothing is touched before it is known there is something to do. A board
    // with no columns yet — markup still being rendered, a template that came
    // back empty — must be left exactly as it was found, and a `continue` after
    // the first mutation is a class, a role and a live region nobody can undo,
    // because the cleanup for them was never pushed.
    const columns = [...board.querySelectorAll("[data-rm-column]")];
    if (!columns.length) continue;

    const selector = dataString(board, "rmItem", card);
    const span = dataNumber(board, "rmDuration", duration);
    board.classList.add("rm-kanban");
    board.setAttribute("role", "group");
    const restore = [setAttr(board, "aria-label", dataString(board, "rmLabel", label))];

    const region = speaker(board.parentElement ?? board);

    const wells = columns.map((column, i) => {
      const name = dataString(column, "rmColumn", `Column ${i + 1}`);
      column.classList.add("rm-kanban-column");
      column.setAttribute("role", "group");
      restore.push(setAttr(column, "aria-label", name));
      const well = column.querySelector("ul, ol") ?? column;
      well.classList.add("rm-kanban-well");
      return { column, well, name };
    });

    const cardsIn = (well) => rows(well, selector);
    const all = () => wells.flatMap(({ well }) => cardsIn(well));
    const wellOf = (node) => wells.find(({ well }) => well.contains(node));

    let held = null;
    let home = null;

    const report = (node) => {
      const place = wellOf(node);
      if (!place) return;
      const list = cardsIn(place.well);
      say(region, `${labelOf(node).textContent.trim()}, ${place.name}, ${list.indexOf(node) + 1} of ${list.length}`);
    };

    const put = (node, well, index) => {
      const affected = all();
      flip(affected, () => {
        const list = cardsIn(well).filter((other) => other !== node);
        const at = clamp(index, 0, list.length);
        if (at >= list.length) well.appendChild(node);
        else well.insertBefore(node, list[at]);
      }, { duration: span });
    };

    const focusOn = (node) => {
      for (const other of all()) other.tabIndex = other === node ? 0 : -1;
      node.focus();
    };

    const onKey = (event) => {
      const node = event.target.closest(selector);
      if (!node || !board.contains(node)) return;
      const place = wellOf(node);
      if (!place) return;
      const list = cardsIn(place.well);
      const at = list.indexOf(node);
      const columnAt = wells.indexOf(place);

      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        if (held === node) {
          held = null;
          home = null;
          node.classList.remove("is-held");
          node.setAttribute("aria-roledescription", "Task card");
          say(region, "Dropped");
        } else {
          held = node;
          home = { well: place.well, index: at };
          node.classList.add("is-held");
          say(region, `${labelOf(node).textContent.trim()} grabbed. Arrow keys to move, space to drop, escape to cancel.`);
        }
        return;
      }

      if (event.key === "Escape" && held === node) {
        event.preventDefault();
        put(node, home.well, home.index);
        held = null;
        home = null;
        node.classList.remove("is-held");
        say(region, "Move cancelled");
        focusOn(node);
        return;
      }

      const across = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0;
      const along = event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0;
      if (!across && !along) return;
      event.preventDefault();

      if (!held) {
        // Nothing is grabbed, so the arrows move focus rather than the card.
        const next = across
          ? cardsIn(wells[clamp(columnAt + across, 0, wells.length - 1)].well)[0]
          : list[clamp(at + along, 0, list.length - 1)];
        if (next) focusOn(next);
        return;
      }

      if (across) put(node, wells[clamp(columnAt + across, 0, wells.length - 1)].well, at);
      else put(node, place.well, at + along);
      focusOn(node);
      report(node);
    };

    let grabX = 0;
    let grabY = 0;
    let dragged = null;

    const settle = (node, event) => {
      node.style.transform = "";
      const box = node.getBoundingClientRect();
      node.style.transform = `translate(${event.clientX - grabX - box.left}px, ${event.clientY - grabY - box.top}px)`;
    };

    const onDown = (event) => {
      const node = event.target.closest(selector);
      if (!node || event.button > 0 || event.target.closest("button, a, input")) return;
      dragged = node;
      const box = node.getBoundingClientRect();
      grabX = event.clientX - box.left;
      grabY = event.clientY - box.top;
      node.classList.add("is-dragging");
      node.setPointerCapture?.(event.pointerId);
    };

    const onMove = (event) => {
      if (!dragged) return;
      settle(dragged, event);
      const over = wells.find(({ well }) => {
        const box = well.getBoundingClientRect();
        return event.clientX >= box.left && event.clientX <= box.right;
      });
      if (!over) return;
      const list = cardsIn(over.well).filter((other) => other !== dragged);
      let index = list.length;
      for (let i = 0; i < list.length; i += 1) {
        const box = list[i].getBoundingClientRect();
        if (event.clientY < box.top + box.height / 2) { index = i; break; }
      }
      const place = wellOf(dragged);
      if (place?.well === over.well && cardsIn(over.well).indexOf(dragged) === index) return;
      put(dragged, over.well, index);
      settle(dragged, event);
    };

    const onUp = (event) => {
      if (!dragged) return;
      const node = dragged;
      dragged = null;
      node.releasePointerCapture?.(event.pointerId);
      node.classList.remove("is-dragging");
      const was = node.getBoundingClientRect();
      node.style.transform = "";
      const now = node.getBoundingClientRect();
      if (!prefersReducedMotion() && (was.left !== now.left || was.top !== now.top)) {
        node.animate(
          [{ transform: `translate(${was.left - now.left}px, ${was.top - now.top}px)` }, { transform: "none" }],
          { duration: span, easing: EASE.out },
        );
      }
      report(node);
    };

    all().forEach((node, i) => {
      node.classList.add("rm-kanban-card");
      node.tabIndex = i === 0 ? 0 : -1;
      node.setAttribute("aria-roledescription", "Task card");
    });

    board.addEventListener("keydown", onKey);
    board.addEventListener("pointerdown", onDown);
    board.addEventListener("pointermove", onMove);
    board.addEventListener("pointerup", onUp);
    board.addEventListener("pointercancel", onUp);

    cleanups.push(() => {
      board.removeEventListener("keydown", onKey);
      board.removeEventListener("pointerdown", onDown);
      board.removeEventListener("pointermove", onMove);
      board.removeEventListener("pointerup", onUp);
      board.removeEventListener("pointercancel", onUp);
      region.remove();
      for (const node of all()) {
        node.classList.remove("rm-kanban-card", "is-dragging", "is-held");
        node.style.transform = "";
        node.removeAttribute("tabindex");
        node.removeAttribute("aria-roledescription");
      }
      for (const { column, well } of wells) {
        column.classList.remove("rm-kanban-column");
        column.removeAttribute("role");
        well.classList.remove("rm-kanban-well");
      }
      restore.forEach((put) => put());
      board.classList.remove("rm-kanban");
      board.removeAttribute("role");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A real progress bar over a list.
 *
 * It counts the list rather than being told a number, so it cannot disagree
 * with what is on the screen — the usual version takes a percentage as a prop
 * and drifts the moment anything else changes a task. The fill is a `scaleX`
 * from the left edge, not an animated width, so it costs one composited
 * transform per change instead of a reflow of everything beside it.
 *
 * It is a `role="progressbar"` with `aria-valuetext` set to "3 of 8 tasks
 * complete", because "37" is a number and not an answer. It is deliberately not
 * a live region: a bar that announces itself on every tick talks over the thing
 * the visitor is actually doing.
 *
 *   <div data-rm-task-progress="today"></div>
 *   <ul id="today" data-rm-task-list>…</ul>
 */
export function taskProgress(target = "[data-rm-task-progress]", options = {}) {
  const bars = resolveElements(target);
  if (!bars.length) return () => {};

  const { item = "li", label = "Tasks complete", duration = 420 } = options;
  const cleanups = [];

  for (const bar of bars) {
    const list = listFor(bar, "data-rm-task-progress");
    if (!list) continue;

    const selector = dataString(bar, "rmItem", item);
    bar.classList.add("rm-task-progress");
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", "100");
    const unlabel = setAttr(bar, "aria-label", dataString(bar, "rmLabel", label));
    bar.style.setProperty(
      "--rm-task-progress-duration",
      `${prefersReducedMotion() ? 0 : dataNumber(bar, "rmDuration", duration)}ms`,
    );

    const fill = document.createElement("i");
    fill.className = "rm-task-progress-fill";
    fill.setAttribute("aria-hidden", "true");
    bar.appendChild(fill);

    const read = () => {
      const all = rows(list, selector).filter(isShown);
      const done = all.filter(isDone).length;
      const percent = all.length ? (done / all.length) * 100 : 0;
      bar.style.setProperty("--rm-task-progress-value", (percent / 100).toFixed(4));
      bar.setAttribute("aria-valuenow", String(Math.round(percent)));
      bar.setAttribute("aria-valuetext", `${done} of ${all.length} tasks complete`);
      bar.classList.toggle("is-complete", all.length > 0 && done === all.length);
    };
    read();

    const stop = onTaskChange(list, read);
    cleanups.push(() => {
      stop();
      unlabel();
      fill.remove();
      bar.classList.remove("rm-task-progress", "is-complete");
      for (const gone of ["role", "aria-valuemin", "aria-valuemax", "aria-valuenow", "aria-valuetext"]) {
        bar.removeAttribute(gone);
      }
      bar.style.removeProperty("--rm-task-progress-value");
      bar.style.removeProperty("--rm-task-progress-duration");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Chips that filter the list and FLIP what is left.
 *
 * Hiding rows is instant and the motion is the correction afterwards: the rows
 * that survived are measured, the filter is applied, and the survivors are
 * animated from where they used to be. Fading the whole list out and back in is
 * the common shortcut and it is worse in every way — the list is unreadable for
 * the duration and nothing tells you which rows actually left.
 *
 * The chips are a labelled group of buttons carrying `aria-pressed`, not a set
 * of tabs and not links, and the result is announced as a count so the effect of
 * pressing one is audible.
 *
 *   <div data-rm-task-filter="today">
 *     <button type="button" data-rm-match="all">All</button>
 *     <button type="button" data-rm-match="open">Open</button>
 *     <button type="button" data-rm-match="admin">Admin</button>
 *   </div>
 *   <ul id="today"><li data-rm-filter="admin">File the VAT</li></ul>
 */
export function taskFilter(target = "[data-rm-task-filter]", options = {}) {
  const groups = resolveElements(target);
  if (!groups.length) return () => {};

  const { item = "li", duration = 300, label = "Filter tasks" } = options;
  const cleanups = [];

  for (const group of groups) {
    const list = listFor(group, "data-rm-task-filter");
    if (!list) continue;

    // Same discipline as the board: resolve first, mutate second. A chip group
    // whose buttons have not been rendered yet would otherwise be left classed,
    // re-roled, relabelled and carrying an orphan live region that the returned
    // cleanup was never given the chance to remove.
    const chips = [...group.querySelectorAll("button")];
    if (!chips.length) continue;

    const selector = dataString(group, "rmItem", item);
    const span = dataNumber(group, "rmDuration", duration);
    group.classList.add("rm-task-filter");
    group.setAttribute("role", "group");
    const unlabel = setAttr(group, "aria-label", dataString(group, "rmLabel", label));

    const region = speaker(group.parentElement ?? group);

    const matches = (row, want) => {
      if (want === "all") return true;
      if (want === "done") return isDone(row);
      if (want === "open") return !isDone(row);
      // The row's own tags, read the way every other option in the kit is read
      // rather than off `dataset` by hand — a read that goes through
      // `dataString` is a read the collision test can see. Splitting an empty
      // string yields one empty entry, so the blanks are dropped: an untagged
      // row belongs to no tag rather than to a tag called "".
      const tags = dataString(row, "rmFilter", "").split(/\s+/).filter(Boolean);
      return tags.includes(want);
    };

    const apply = (want, announce = true) => {
      const all = rows(list, selector);
      let shown = 0;
      flip(all, () => {
        for (const row of all) {
          const keep = matches(row, want);
          row.dataset.rmFiltered = keep ? "false" : "true";
          row.hidden = !keep;
          if (keep) shown += 1;
        }
      }, { duration: span });
      for (const chip of chips) {
        chip.setAttribute("aria-pressed", dataString(chip, "rmMatch", "all") === want ? "true" : "false");
      }
      if (announce) say(region, `${shown} of ${all.length} tasks shown`);
    };

    const handlers = chips.map((chip) => {
      chip.classList.add("rm-task-filter-chip");
      const onClick = () => apply(dataString(chip, "rmMatch", "all"));
      chip.addEventListener("click", onClick);
      return { chip, onClick };
    });

    // The first chip is the resting state, and it is applied from here so the
    // list is never filtered by a stylesheet before the script has run. It is
    // applied silently: nothing has happened yet, and a page carrying a filter,
    // a search and a bulk bar would otherwise read a visitor three counts
    // before they had touched anything. An announcement answers an action.
    apply(dataString(chips[0], "rmMatch", "all"), false);
    group.rmApply = apply;

    cleanups.push(() => {
      delete group.rmApply;
      region.remove();
      unlabel();
      for (const { chip, onClick } of handlers) {
        chip.removeEventListener("click", onClick);
        chip.classList.remove("rm-task-filter-chip");
        chip.removeAttribute("aria-pressed");
      }
      for (const row of rows(list, selector)) {
        row.hidden = false;
        delete row.dataset.rmFiltered;
      }
      group.classList.remove("rm-task-filter");
      group.removeAttribute("role");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Nested tasks with a progress ring on the parent.
 *
 * The ring is a circle with `pathLength="1"`, so "three of five" is a dash
 * offset of 0.4 and not a circumference computed from a radius somebody will
 * change later. It sits beside the parent task and carries the count as text in
 * `aria-valuetext`, because a ring on its own is a picture of progress rather
 * than a statement of it.
 *
 * The nested list gets its own label naming the parent, so a screen reader user
 * landing in it knows whose subtasks these are instead of finding a second
 * anonymous list of checkboxes.
 *
 *   <li data-rm-subtasks>
 *     Ship the site
 *     <ul><li data-rm-done="true">Copy</li><li>Photography</li></ul>
 *   </li>
 */
export function subtasks(target = "[data-rm-subtasks]", options = {}) {
  const parents = resolveElements(target);
  if (!parents.length) return () => {};

  const { item = "li", duration = 480 } = options;
  const cleanups = [];

  for (const parent of parents) {
    const nested = parent.querySelector("ul, ol");
    if (!nested) continue;

    const selector = dataString(parent, "rmItem", item);
    const span = dataNumber(parent, "rmDuration", duration);
    parent.classList.add("rm-subtasks");
    nested.classList.add("rm-subtasks-list");

    const name = [...parent.childNodes]
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent.trim())
      .join(" ")
      .trim() || "Task";
    // Through `setAttr`, so a list that arrived with a label of its own gets
    // that label back rather than losing it to this component's tidying up.
    const unlabel = setAttr(nested, "aria-label", `Subtasks of ${name}`);

    const ring = document.createElement("span");
    ring.className = "rm-subtasks-ring";
    ring.setAttribute("role", "progressbar");
    ring.setAttribute("aria-valuemin", "0");
    ring.setAttribute("aria-valuemax", "100");
    ring.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.4" opacity="0.2"/>' +
      '<circle class="rm-subtasks-arc" cx="12" cy="12" r="9" pathLength="1" fill="none" ' +
      'stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
    const arc = ring.querySelector(".rm-subtasks-arc");
    arc.style.strokeDasharray = "1";
    arc.style.strokeDashoffset = "1";
    nested.before(ring);

    let at = 1;
    const read = () => {
      const all = rows(nested, selector);
      const done = all.filter(isDone).length;
      const fraction = all.length ? done / all.length : 0;
      ring.setAttribute("aria-valuenow", String(Math.round(fraction * 100)));
      ring.setAttribute("aria-valuetext", `${done} of ${all.length} subtasks done`);
      ring.classList.toggle("is-complete", all.length > 0 && done === all.length);
      const to = 1 - fraction;
      if (prefersReducedMotion()) { arc.style.strokeDashoffset = String(to); at = to; return; }
      arc.animate(
        [{ strokeDashoffset: at }, { strokeDashoffset: to }],
        { duration: span, easing: EASE.out, fill: "forwards" },
      );
      at = to;
    };
    read();

    const stop = onTaskChange(nested, read);
    cleanups.push(() => {
      stop();
      ring.remove();
      nested.classList.remove("rm-subtasks-list");
      unlabel();
      parent.classList.remove("rm-subtasks");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A due date that changes tone as it approaches.
 *
 * The machine-readable date stays in the `datetime` attribute and the visible
 * text becomes a relative phrase from `Intl.RelativeTimeFormat`, so "in 3 days"
 * is produced in the visitor's own language rather than assembled from English
 * fragments. Colour is never the message: the phrase itself changes, and the
 * overdue state says "overdue" in words as well as in red.
 *
 * It re-reads while it is on screen, so a tab left open overnight does not
 * still claim something is due tomorrow — and it stops entirely when scrolled
 * away, which is what most "live" timestamps forget to do.
 *
 *   <time data-rm-task-due datetime="2026-09-12">12 September</time>
 */
export function taskDue(target = "[data-rm-task-due]", options = {}) {
  const stamps = resolveElements(target);
  if (!stamps.length) return () => {};

  const { soon = 2, every = 60 } = options;
  const cleanups = [];

  for (const stamp of stamps) {
    const raw = stamp.getAttribute("datetime") || dataString(stamp, "rmTaskDue", "");
    const when = new Date(raw);
    if (Number.isNaN(when.getTime())) continue;

    const near = dataNumber(stamp, "rmSoon", soon);
    const original = stamp.textContent;
    stamp.classList.add("rm-task-due");

    const format = typeof Intl !== "undefined" && Intl.RelativeTimeFormat
      ? new Intl.RelativeTimeFormat(undefined, { numeric: "auto" })
      : null;

    let tone = "";
    const read = () => {
      const days = Math.round((when.getTime() - Date.now()) / 86400000);
      const next = days < 0 ? "late" : days === 0 ? "today" : days <= near ? "soon" : "far";
      if (next !== tone) {
        if (tone) stamp.classList.remove(`is-${tone}`);
        tone = next;
        stamp.classList.add(`is-${tone}`);
        if (!prefersReducedMotion()) {
          stamp.animate(
            [{ transform: "scale(0.94)" }, { transform: "none" }],
            { duration: 260, easing: EASE.out },
          );
        }
      }
      const phrase = format ? format.format(days, "day") : `${days} days`;
      stamp.textContent = tone === "late" ? `${phrase} — overdue` : phrase;
    };
    read();

    // Only while it can be seen. A due date recalculating in a background tab
    // is work nobody will ever look at.
    cleanups.push(whileVisible(stamp, () => {
      const timer = setInterval(read, Math.max(1, dataNumber(stamp, "rmSeconds", every)) * 1000);
      return () => clearInterval(timer);
    }));

    cleanups.push(() => {
      stamp.textContent = original;
      stamp.classList.remove("rm-task-due", `is-${tone}`);
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * A real select, drawn as a flag.
 *
 * The `<select>` is kept and made transparent on top of the flag rather than
 * replaced by a listbox of divs. That keeps the native picker on a phone, the
 * type-ahead on a keyboard, the value in the surrounding form and the label
 * association a designer's version throws away in exchange for a nicer arrow.
 *
 * The flag reads the value and hoists itself when it changes — a transform on
 * the pennant alone, so the row it sits in never moves. An unrecognised level
 * keeps its real value in the form and falls back to the neutral colour rather
 * than being dropped.
 *
 *   <label data-rm-task-priority>Priority
 *     <select><option value="low">Low</option><option value="high">High</option></select>
 *   </label>
 */
export function taskPriority(target = "[data-rm-task-priority]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const LEVELS = ["low", "medium", "high", "urgent"];
  const { level = "medium" } = options;
  const cleanups = [];

  for (const holder of holders) {
    const select = holder.querySelector("select");
    if (!select) continue;

    const fallback = dataString(holder, "rmLevel", level);
    holder.classList.add("rm-task-priority");
    // The select keeps the value, the keyboard and the phone's native picker;
    // the flag is what anybody sees. It is faded out from here rather than in
    // the stylesheet because it is the author's own markup: on a page where
    // this script never ran it stays an ordinary, visible, working select
    // instead of an invisible control sitting on top of nothing.
    select.style.opacity = "0";

    const flag = document.createElement("span");
    flag.className = "rm-task-priority-flag";
    flag.setAttribute("aria-hidden", "true");
    flag.innerHTML =
      '<svg viewBox="0 0 24 24" focusable="false"><path d="M6 21V4h11l-2.4 4L17 12H6" ' +
      'fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    select.before(flag);

    let tone = "";
    const paint = (animated) => {
      const value = select.value;
      const next = LEVELS.includes(value) ? value : (LEVELS.includes(fallback) ? fallback : "medium");
      if (tone) holder.classList.remove(`is-${tone}`);
      tone = next;
      holder.classList.add(`is-${tone}`);
      if (animated && !prefersReducedMotion()) {
        flag.animate(
          [
            { transform: "translateY(3px) rotate(-8deg)" },
            { transform: "translateY(-2px) rotate(3deg)" },
            { transform: "none" },
          ],
          { duration: 420, easing: EASE.spring },
        );
      }
    };
    paint(false);

    const onChange = () => paint(true);
    select.addEventListener("change", onChange);

    cleanups.push(() => {
      select.removeEventListener("change", onChange);
      flag.remove();
      select.style.removeProperty("opacity");
      holder.classList.remove("rm-task-priority", `is-${tone}`);
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * An avatar picker that is a real listbox.
 *
 * A button with `aria-haspopup="listbox"` and `aria-expanded`, a list of
 * `role="option"` items carrying `aria-selected`, arrow keys, Home and End,
 * Escape to close, and focus put back on the button afterwards. The usual
 * avatar picker is a div of images with click handlers, which is invisible to
 * the keyboard and silent to a screen reader.
 *
 * Names are always rendered as text alongside the picture, because a face is
 * not an accessible name and initials are not either.
 *
 *   <div data-rm-task-assignee>
 *     <ul><li data-rm-name="Ana Ruiz"></li><li data-rm-name="Tom Vale"></li></ul>
 *   </div>
 */
export function taskAssignee(target = "[data-rm-task-assignee]", options = {}) {
  const pickers = resolveElements(target);
  if (!pickers.length) return () => {};

  const { label = "Assignee", empty = "Unassigned" } = options;
  const cleanups = [];
  let seq = 0;

  for (const picker of pickers) {
    const list = picker.querySelector("ul, ol");
    if (!list) continue;

    const items = [...list.children];
    if (!items.length) continue;

    picker.classList.add("rm-task-assignee");
    const mine = !list.id;
    if (mine) list.id = `rm-task-assignee-${(seq += 1)}-list`;
    // Added to, never assigned over: `className = "…"` destroys whatever the
    // author had on the list, and the cleanup that then blanks it destroys it
    // permanently instead of putting anything back.
    list.classList.add("rm-task-assignee-list");
    list.setAttribute("role", "listbox");
    list.setAttribute("aria-label", dataString(picker, "rmLabel", label));
    list.hidden = true;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "rm-task-assignee-button";
    button.setAttribute("aria-haspopup", "listbox");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", list.id);

    const face = document.createElement("span");
    face.className = "rm-task-assignee-face";
    const who = document.createElement("span");
    who.className = "rm-task-assignee-name";
    who.textContent = dataString(picker, "rmPlaceholder", empty);
    button.append(face, who);
    list.before(button);

    const names = items.map((option) => {
      option.classList.add("rm-task-assignee-option");
      option.setAttribute("role", "option");
      option.setAttribute("aria-selected", "false");
      option.tabIndex = -1;
      const name = dataString(option, "rmName", option.textContent.trim() || "Someone");
      // A face is not an accessible name and initials are not one either, so an
      // empty option is given the person's name as real text.
      const filled = !option.textContent.trim();
      if (filled) option.textContent = name;
      return { option, name, filled };
    });

    const open = (on) => {
      list.hidden = !on;
      button.setAttribute("aria-expanded", on ? "true" : "false");
      if (!on) return;
      const chosen = names.find(({ option }) => option.getAttribute("aria-selected") === "true");
      (chosen?.option ?? names[0].option).focus();
      if (!prefersReducedMotion()) {
        list.animate(
          [{ opacity: 0, transform: "translateY(-6px) scale(0.98)" }, { opacity: 1, transform: "none" }],
          { duration: 200, easing: EASE.out },
        );
      }
    };

    const choose = (name) => {
      for (const entry of names) {
        entry.option.setAttribute("aria-selected", entry.name === name ? "true" : "false");
      }
      who.textContent = name;
      open(false);
      button.focus();
      if (prefersReducedMotion()) return;
      face.animate(
        [{ opacity: 0, transform: "scale(0.7)" }, { opacity: 1, transform: "none" }],
        { duration: 300, easing: EASE.out },
      );
    };

    const onButton = () => open(list.hidden);
    const onList = (event) => {
      const option = event.target.closest('[role="option"]');
      if (option) choose(names.find((entry) => entry.option === option).name);
    };
    const onKey = (event) => {
      if (list.hidden) return;
      const at = names.findIndex(({ option }) => option === document.activeElement);
      if (event.key === "Escape") { event.preventDefault(); open(false); button.focus(); return; }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (at >= 0) choose(names[at].name);
        return;
      }
      const to = event.key === "ArrowDown" ? at + 1
        : event.key === "ArrowUp" ? at - 1
          : event.key === "Home" ? 0
            : event.key === "End" ? names.length - 1 : null;
      if (to === null) return;
      event.preventDefault();
      names[clamp(to, 0, names.length - 1)].option.focus();
    };
    const onAway = (event) => {
      if (!picker.contains(event.target)) open(false);
    };

    button.addEventListener("click", onButton);
    list.addEventListener("click", onList);
    picker.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onAway);
    picker.rmChoose = choose;

    cleanups.push(() => {
      button.removeEventListener("click", onButton);
      list.removeEventListener("click", onList);
      picker.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onAway);
      delete picker.rmChoose;
      button.remove();
      list.hidden = false;
      list.classList.remove("rm-task-assignee-list");
      list.removeAttribute("role");
      list.removeAttribute("aria-label");
      if (mine) list.removeAttribute("id");
      for (const { option, filled } of names) {
        option.classList.remove("rm-task-assignee-option");
        option.removeAttribute("role");
        option.removeAttribute("aria-selected");
        option.removeAttribute("tabindex");
        if (filled) option.textContent = "";
      }
      picker.classList.remove("rm-task-assignee");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Swipe to complete, with a button that does the same.
 *
 * The swipe is a transform on the row and the action behind it is revealed by
 * the row moving off it, so nothing resizes and the list underneath stays
 * exactly where it was. Past the threshold the row commits; short of it, it
 * springs back — and it springs back rather than snapping, because a gesture
 * that refuses without acknowledgement feels broken.
 *
 * A gesture is not an interface on its own, so the same action is always a real
 * button in the row. Swiping is the shortcut for people who can; the button is
 * how it actually works.
 *
 *   <li data-rm-task-swipe>Reply to the brief</li>
 */
export function taskSwipe(target = "[data-rm-task-swipe]", options = {}) {
  const items = resolveElements(target);
  if (!items.length) return () => {};

  const { threshold = 96, label = "Complete" } = options;
  const cleanups = [];

  for (const row of items) {
    const reach = dataNumber(row, "rmThreshold", threshold);
    const name = dataString(row, "rmLabel", label);
    row.classList.add("rm-task-swipe");

    // The face is what travels; the row itself never moves, so the list around
    // it keeps its geometry however far the gesture goes.
    const sheet = document.createElement("span");
    sheet.className = "rm-task-swipe-face";
    sheet.append(...row.childNodes);
    row.appendChild(sheet);

    const action = document.createElement("button");
    action.type = "button";
    action.className = "rm-task-swipe-action";
    action.textContent = name;
    action.setAttribute("aria-label", `${name}: ${sheet.textContent.trim()}`);
    row.appendChild(action);

    const region = speaker(row);

    const complete = () => {
      row.dataset.rmDone = "true";
      row.classList.add("is-done");
      say(region, `${sheet.textContent.trim()} completed`);
      if (prefersReducedMotion()) { sheet.style.transform = "none"; return; }
      sheet.animate(
        [{ transform: sheet.style.transform || "none" }, { transform: "none" }],
        { duration: 320, easing: EASE.spring },
      ).finished.then(() => { sheet.style.transform = ""; }, () => {});
    };

    let holding = false;
    let from = 0;
    let moved = 0;

    const onDown = (event) => {
      if (event.button > 0 || event.target === action) return;
      holding = true;
      from = event.clientX;
      moved = 0;
      row.setPointerCapture?.(event.pointerId);
    };
    const onMove = (event) => {
      if (!holding) return;
      moved = Math.max(0, event.clientX - from);
      sheet.style.transform = `translateX(${moved}px)`;
      row.classList.toggle("is-armed", moved > reach);
    };
    const onUp = (event) => {
      if (!holding) return;
      holding = false;
      row.releasePointerCapture?.(event.pointerId);
      row.classList.remove("is-armed");
      if (moved > reach) { complete(); return; }
      if (prefersReducedMotion()) { sheet.style.transform = ""; return; }
      sheet.animate(
        [{ transform: `translateX(${moved}px)` }, { transform: "none" }],
        { duration: 420, easing: EASE.spring },
      ).finished.then(() => { sheet.style.transform = ""; }, () => { sheet.style.transform = ""; });
    };

    action.addEventListener("click", complete);
    row.addEventListener("pointerdown", onDown);
    row.addEventListener("pointermove", onMove);
    row.addEventListener("pointerup", onUp);
    row.addEventListener("pointercancel", onUp);

    cleanups.push(() => {
      action.removeEventListener("click", complete);
      row.removeEventListener("pointerdown", onDown);
      row.removeEventListener("pointermove", onMove);
      row.removeEventListener("pointerup", onUp);
      row.removeEventListener("pointercancel", onUp);
      region.remove();
      action.remove();
      row.append(...sheet.childNodes);
      sheet.remove();
      row.classList.remove("rm-task-swipe", "is-done", "is-armed");
      delete row.dataset.rmDone;
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Completing is undoable, in the row it happened in.
 *
 * The row is marked done and held for a moment before anything is actually
 * committed, with the undo offered in the row itself rather than in a toast in
 * a corner. That matters because the toast is somewhere else on the screen, it
 * expires while you are still looking at the thing that changed, and on a phone
 * it usually covers the next task down.
 *
 * The undo button is inserted immediately after the row's own controls, so Tab
 * reaches it next; Control-Z inside the list undoes the most recent one; and
 * the countdown pauses whenever a pointer or the keyboard is on the row, since
 * losing an undo because you stopped to read it is the worst outcome available.
 *
 *   <ul data-rm-task-undo>…</ul>
 *   list.rmComplete(row, () => remove(row));
 */
export function taskUndo(target = "[data-rm-task-undo]", options = {}) {
  const lists = resolveElements(target);
  if (!lists.length) return () => {};

  const { life = 6000, label = "Undo" } = options;
  const cleanups = [];

  for (const list of lists) {
    const span = dataNumber(list, "rmLife", life);
    const name = dataString(list, "rmLabel", label);
    list.classList.add("rm-task-undo");

    const region = speaker(list.parentElement ?? list);
    const pending = [];

    const finish = (entry, restore) => {
      const at = pending.indexOf(entry);
      if (at < 0) return;
      pending.splice(at, 1);
      clearInterval(entry.timer);
      entry.button.remove();
      entry.row.classList.remove("is-pending");
      if (restore) {
        // Back to exactly what the row said before it was completed, which for
        // most rows is nothing at all. Writing "false" instead would leave the
        // list littered with an attribute the author never put there — and
        // `taskSwipe` deletes its own on the way out, so the inconsistency
        // would be inside this one file.
        if (entry.was === null) delete entry.row.dataset.rmDone;
        else entry.row.setAttribute("data-rm-done", entry.was);
        entry.row.classList.remove("is-done");
        say(region, `${entry.name} restored`);
        entry.onRestore?.();
      } else {
        entry.onCommit?.();
      }
    };

    list.rmComplete = (row, onCommit, onRestore) => {
      if (!row || !list.contains(row)) return;
      const text = labelOf(row).textContent.trim();
      const was = row.getAttribute("data-rm-done");
      row.dataset.rmDone = "true";
      row.classList.add("is-done", "is-pending");

      const button = document.createElement("button");
      button.type = "button";
      button.className = "rm-task-undo-button";
      button.setAttribute("aria-label", `${name}: ${text}`);
      button.textContent = name;

      const ring = document.createElement("span");
      ring.className = "rm-task-undo-ring";
      ring.setAttribute("aria-hidden", "true");
      button.appendChild(ring);

      const anchor = row.querySelector('button, [role="checkbox"]');
      if (anchor) anchor.after(button);
      else row.prepend(button);

      const entry = { row, button, name: text, onCommit, onRestore, timer: 0, left: span, was };
      button.addEventListener("click", () => finish(entry, true));

      entry.timer = setInterval(() => {
        if (entry.paused) return;
        entry.left -= 100;
        ring.style.setProperty("--rm-task-undo-left", clamp(entry.left / span, 0, 1).toFixed(3));
        if (entry.left <= 0) finish(entry, false);
      }, 100);

      pending.push(entry);
      say(region, `${text} completed. ${name} available.`);
      return entry;
    };

    list.rmUndoLast = () => { if (pending.length) finish(pending[pending.length - 1], true); };

    const hold = (event) => {
      const entry = pending.find((p) => p.row.contains(event.target));
      if (entry) entry.paused = true;
    };
    const release = (event) => {
      const entry = pending.find((p) => p.row.contains(event.target));
      if (entry) entry.paused = false;
    };
    const onKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        list.rmUndoLast();
      }
    };

    list.addEventListener("pointerover", hold);
    list.addEventListener("pointerout", release);
    list.addEventListener("focusin", hold);
    list.addEventListener("focusout", release);
    list.addEventListener("keydown", onKey);

    cleanups.push(() => {
      list.removeEventListener("pointerover", hold);
      list.removeEventListener("pointerout", release);
      list.removeEventListener("focusin", hold);
      list.removeEventListener("focusout", release);
      list.removeEventListener("keydown", onKey);
      [...pending].forEach((entry) => finish(entry, true));
      delete list.rmComplete;
      delete list.rmUndoLast;
      region.remove();
      list.classList.remove("rm-task-undo");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A live count of what is left.
 *
 * The number rolls in the direction it moved — up for more, down for fewer — so
 * the change reads as a change. The digit is a transform on a duplicated face,
 * so the sentence around it never reflows while it happens; a count that
 * re-lays-out its own line every time a task is ticked makes the whole list
 * twitch.
 *
 * What is announced is the sentence, not the digit: "4 tasks left" rather than
 * "4", which on its own is a number a screen reader reads with no idea what it
 * counts.
 *
 *   <p data-rm-task-count="today"></p>
 */
export function taskCount(target = "[data-rm-task-count]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { item = "li", duration = 320, word = "left" } = options;
  const cleanups = [];

  for (const holder of holders) {
    const list = listFor(holder, "data-rm-task-count");
    if (!list) continue;

    const selector = dataString(holder, "rmItem", item);
    const span = dataNumber(holder, "rmDuration", duration);
    const tail = dataString(holder, "rmLabel", word);
    holder.classList.add("rm-task-count");
    holder.setAttribute("aria-live", "polite");
    holder.setAttribute("role", "status");

    const digits = document.createElement("span");
    digits.className = "rm-task-count-digits";
    const said = document.createElement("span");
    said.className = "rm-task-live";
    // Whatever was in the holder is kept, not merely thrown away: an element
    // that arrived with a placeholder in it has that placeholder back once this
    // component has finished with it.
    const wasChildren = [...holder.childNodes];
    holder.replaceChildren(digits, said);

    let value = null;
    const read = () => {
      const all = rows(list, selector).filter(isShown);
      const next = all.filter((row) => !isDone(row)).length;
      if (next === value) return;
      const up = value !== null && next > value;
      const first = value === null;
      value = next;

      // The visible digits are `aria-hidden` and the sentence lives in the
      // live region beside them, so the roll animation is never read out as
      // two numbers arriving in quick succession.
      digits.setAttribute("aria-hidden", "true");
      said.textContent = `${next} ${next === 1 ? tail.replace(/s\b/, "") : tail}`;

      if (first || prefersReducedMotion()) { digits.textContent = String(next); return; }
      const leaving = document.createElement("span");
      leaving.className = "rm-task-count-leaving";
      // The clone goes into a polite live region, and a node added to one is
      // announced. Without this the outgoing digit is read as a bare number
      // beside the sentence — the exact "two numbers in quick succession" the
      // `aria-hidden` on `digits` above exists to prevent.
      leaving.setAttribute("aria-hidden", "true");
      leaving.textContent = digits.textContent;
      digits.after(leaving);
      leaving.animate(
        [{ transform: "none", opacity: 1 }, { transform: `translateY(${up ? -100 : 100}%)`, opacity: 0 }],
        { duration: span, easing: EASE.out, fill: "forwards" },
      ).finished.then(() => leaving.remove(), () => leaving.remove());

      digits.textContent = String(next);
      digits.animate(
        [{ transform: `translateY(${up ? 100 : -100}%)`, opacity: 0 }, { transform: "none", opacity: 1 }],
        { duration: span, easing: EASE.out },
      );
    };
    read();

    const stop = onTaskChange(list, read);
    cleanups.push(() => {
      stop();
      holder.replaceChildren(...wasChildren);
      holder.classList.remove("rm-task-count");
      holder.removeAttribute("aria-live");
      holder.removeAttribute("role");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * The all-done state, arriving.
 *
 * It watches the list rather than being switched on, so it cannot be left up
 * over a list that has since gained a task. When it arrives its parts stagger
 * in and the tick draws itself; when a task comes back it goes away without
 * ceremony, because arriving is the moment worth marking and leaving is not.
 *
 * The panel is a labelled region announced politely, which is the point: the
 * end of a list is the one moment a task app has something genuinely good to
 * say, and saying it only in pixels means most people never hear it.
 *
 *   <div data-rm-task-empty="today"><h3>All done</h3><p>Nothing left today.</p></div>
 */
export function taskEmpty(target = "[data-rm-task-empty]", options = {}) {
  const panels = resolveElements(target);
  if (!panels.length) return () => {};

  const { item = "li", duration = 560, stagger = 90 } = options;
  const cleanups = [];

  for (const panel of panels) {
    const list = listFor(panel, "data-rm-task-empty");
    if (!list) continue;

    const selector = dataString(panel, "rmItem", item);
    const span = dataNumber(panel, "rmDuration", duration);
    const step = dataNumber(panel, "rmDelay", stagger);
    panel.classList.add("rm-task-empty");
    panel.setAttribute("role", "status");
    panel.setAttribute("aria-live", "polite");

    const { svg, path } = tickSvg("rm-task-empty-tick");
    svg.classList.add("rm-task-empty-mark");
    path.style.strokeDasharray = "1";
    path.style.strokeDashoffset = "1";
    panel.prepend(svg);

    const parts = [...panel.children].filter((part) => part !== svg);
    let shown = null;

    const read = () => {
      const all = rows(list, selector).filter(isShown);
      const done = all.length > 0 && all.every(isDone);
      if (done === shown) return;
      shown = done;
      panel.hidden = !done;
      if (!done) return;

      if (prefersReducedMotion()) {
        // Jump to the finished state. Nothing is left part-drawn or invisible.
        path.style.strokeDashoffset = "0";
        parts.forEach((part) => { part.style.opacity = ""; });
        return;
      }
      path.animate(
        [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }],
        { duration: span, easing: EASE.out, fill: "forwards" },
      );
      parts.forEach((part, i) => {
        part.animate(
          [{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "none" }],
          { duration: span, delay: 120 + i * step, easing: EASE.out, fill: "backwards" },
        );
      });
    };
    read();

    const stop = onTaskChange(list, read);
    cleanups.push(() => {
      stop();
      svg.remove();
      parts.forEach((part) => { part.style.opacity = ""; });
      panel.hidden = false;
      panel.classList.remove("rm-task-empty");
      panel.removeAttribute("role");
      panel.removeAttribute("aria-live");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Filter as you type, announced once you stop.
 *
 * A real `<input type="search">` wired to the list with `aria-controls`, and
 * the result count announced on a debounce rather than on every keystroke —
 * announcing each one turns a search box into a stutter of half-finished
 * numbers, which is why so many people switch the live region off entirely and
 * end up announcing nothing at all.
 *
 * Matches are wrapped in `<mark>`, which carries meaning rather than merely a
 * yellow background, and the surviving rows are FLIPped up into the gaps left
 * by the ones that went.
 *
 *   <input type="search" data-rm-task-search="today" placeholder="Filter tasks">
 */
export function taskSearch(target = "[data-rm-task-search]", options = {}) {
  const inputs = resolveElements(target);
  if (!inputs.length) return () => {};

  const { item = "li", wait = 200, duration = 280, label = "Filter tasks" } = options;
  const cleanups = [];

  for (const input of inputs) {
    const list = listFor(input, "data-rm-task-search");
    if (!list) continue;

    const selector = dataString(input, "rmItem", item);
    const span = dataNumber(input, "rmDuration", duration);
    const pause = dataNumber(input, "rmDelay", wait);
    input.classList.add("rm-task-search");
    // A search input rather than a text one, so the platform gives it the
    // clear button and the keyboard people expect from a filter box.
    if (input.tagName === "INPUT" && !input.hasAttribute("type")) input.type = "search";
    const unlabel = setAttr(input, "aria-label", dataString(input, "rmLabel", label));
    if (list.id) input.setAttribute("aria-controls", list.id);

    const region = speaker(input.parentElement ?? document.body);
    const originals = new Map();
    for (const row of rows(list, selector)) originals.set(row, labelOf(row).textContent);

    let timer = 0;
    const run = (announce = true) => {
      const query = input.value.trim().toLowerCase();
      const all = rows(list, selector);
      let shown = 0;

      flip(all, () => {
        for (const row of all) {
          const text = originals.get(row) ?? labelOf(row).textContent;
          const at = query ? text.toLowerCase().indexOf(query) : -1;
          const keep = !query || at >= 0;
          row.dataset.rmFiltered = keep ? "false" : "true";
          row.hidden = !keep;
          if (keep) shown += 1;

          // Only a node whose whole content is the label is rewritten. A row
          // with buttons inside it keeps its markup and simply filters.
          const node = labelOf(row);
          if (node.children.length) continue;
          if (at >= 0 && query) {
            node.replaceChildren(
              document.createTextNode(text.slice(0, at)),
              Object.assign(document.createElement("mark"), { textContent: text.slice(at, at + query.length) }),
              document.createTextNode(text.slice(at + query.length)),
            );
          } else {
            node.textContent = text;
          }
        }
      }, { duration: span });

      clearTimeout(timer);
      if (!announce) return;
      timer = setTimeout(() => say(region, `${shown} of ${all.length} tasks match`), pause);
    };

    const onInput = () => run();
    const onKey = (event) => {
      // Escape clears a search box on every platform that has one. Doing it
      // here means the list comes back without reaching for the mouse.
      if (event.key === "Escape" && input.value) { event.preventDefault(); input.value = ""; run(); }
    };
    input.addEventListener("input", onInput);
    input.addEventListener("keydown", onKey);
    // The first pass exists to honour a box the browser restored a value into,
    // not to tell anybody anything. It says nothing: a count read out before
    // the visitor has typed a character is an answer to a question nobody
    // asked, and on a page with a filter and a bulk bar as well it is three.
    run(false);

    cleanups.push(() => {
      clearTimeout(timer);
      input.removeEventListener("input", onInput);
      input.removeEventListener("keydown", onKey);
      region.remove();
      for (const [row, text] of originals) {
        row.hidden = false;
        delete row.dataset.rmFiltered;
        const node = labelOf(row);
        if (!node.children.length || node.querySelector("mark")) node.textContent = text;
      }
      unlabel();
      input.classList.remove("rm-task-search");
      input.removeAttribute("aria-controls");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Select many, act once.
 *
 * Selection is a second `role="checkbox"` per row with its own name — "Select
 * Buy milk", not another anonymous box beside the one that completes it — and
 * the header box goes to `aria-checked="mixed"` when some but not all are
 * chosen, which is the whole reason the mixed state exists and the thing
 * almost every custom implementation leaves out.
 *
 * Shift-clicking extends the range the way every file manager does, and the
 * toolbar arrives by transform over the list rather than by being inserted into
 * it, so choosing a task never pushes the rest of them down the page.
 *
 *   <div data-rm-task-bulk="today"><button type="button">Delete</button></div>
 */
export function taskBulk(target = "[data-rm-task-bulk]", options = {}) {
  const bars = resolveElements(target);
  if (!bars.length) return () => {};

  const { item = "li", label = "Bulk actions" } = options;
  const cleanups = [];

  for (const bar of bars) {
    const list = listFor(bar, "data-rm-task-bulk");
    if (!list) continue;

    const selector = dataString(bar, "rmItem", item);
    bar.classList.add("rm-task-bulk");
    bar.setAttribute("role", "toolbar");
    const unlabel = setAttr(bar, "aria-label", dataString(bar, "rmLabel", label));

    const region = speaker(bar.parentElement ?? bar);
    const all = document.createElement("button");
    all.type = "button";
    all.className = "rm-task-bulk-all";
    all.setAttribute("role", "checkbox");
    all.setAttribute("aria-checked", "false");
    all.setAttribute("aria-label", "Select all tasks");

    const count = document.createElement("span");
    count.className = "rm-task-bulk-count";
    count.setAttribute("aria-hidden", "true");

    // The actions are wrapped so they alone can be made inert while nothing is
    // selected. Making the whole toolbar inert would take the "select all" box
    // with it, which is the one control that is useful when nothing is chosen.
    const actions = document.createElement("div");
    actions.className = "rm-task-bulk-actions";
    actions.append(...bar.childNodes);
    bar.append(all, count, actions);

    const boxes = rows(list, selector).map((row) => {
      const box = document.createElement("button");
      box.type = "button";
      box.className = "rm-task-bulk-box";
      box.setAttribute("role", "checkbox");
      box.setAttribute("aria-checked", "false");
      box.setAttribute("aria-label", `Select ${labelOf(row).textContent.trim()}`);
      row.appendChild(box);
      return { row, box };
    });

    let anchor = 0;
    const chosen = () => boxes.filter(({ box }) => box.getAttribute("aria-checked") === "true");

    const sync = (announce = true) => {
      const picked = chosen();
      count.textContent = `${picked.length} selected`;
      all.setAttribute(
        "aria-checked",
        picked.length === 0 ? "false" : picked.length === boxes.length ? "true" : "mixed",
      );
      const on = picked.length > 0;
      bar.classList.toggle("is-active", on);
      // The resting state is written from here rather than held by the
      // stylesheet. This toolbar is the author's own markup: a rule that starts
      // it at zero opacity is a row of buttons that stays invisible on any page
      // whose script did not run. The stylesheet owns the transition; the two
      // ends of it are set in JavaScript, and cleanup takes them off again.
      bar.style.opacity = on ? "1" : "0";
      bar.style.visibility = on ? "visible" : "hidden";
      bar.style.transform = on ? "none" : "translateY(12px)";
      actions.inert = !on;
      if (announce) say(region, `${picked.length} of ${boxes.length} tasks selected`);
    };

    const set = (entry, on) => {
      entry.box.setAttribute("aria-checked", on ? "true" : "false");
      entry.row.classList.toggle("is-selected", on);
    };

    const handlers = boxes.map((entry, i) => {
      const onClick = (event) => {
        const on = entry.box.getAttribute("aria-checked") !== "true";
        if (event.shiftKey) {
          const [from, to] = anchor < i ? [anchor, i] : [i, anchor];
          for (let n = from; n <= to; n += 1) set(boxes[n], on);
        } else {
          set(entry, on);
          anchor = i;
        }
        sync();
      };
      entry.box.addEventListener("click", onClick);
      return { box: entry.box, onClick };
    });

    const onAll = () => {
      const on = all.getAttribute("aria-checked") !== "true";
      boxes.forEach((entry) => set(entry, on));
      sync();
    };
    all.addEventListener("click", onAll);
    // Silent on mount: "0 of 11 tasks selected" is not news, it is the state of
    // a page nobody has touched yet.
    sync(false);

    bar.rmSelected = () => chosen().map(({ row }) => row);

    cleanups.push(() => {
      all.removeEventListener("click", onAll);
      handlers.forEach(({ box, onClick }) => box.removeEventListener("click", onClick));
      boxes.forEach(({ row, box }) => { box.remove(); row.classList.remove("is-selected"); });
      all.remove();
      count.remove();
      region.remove();
      delete bar.rmSelected;
      actions.inert = false;
      bar.append(...actions.childNodes);
      actions.remove();
      unlabel();
      bar.style.removeProperty("opacity");
      bar.style.removeProperty("visibility");
      bar.style.removeProperty("transform");
      bar.classList.remove("rm-task-bulk", "is-active");
      bar.removeAttribute("role");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Time spent on a task.
 *
 * The elapsed time is derived from a wall-clock stamp rather than counted up
 * frame by frame, so a tab that was throttled in the background comes back
 * showing the real figure instead of however many frames it happened to get.
 * The redraw runs on the shared frame loop and only while the timer is on
 * screen, so twenty of these on a page cost one loop between them and nothing
 * at all once they scroll away.
 *
 * It is `role="timer"` with `aria-live="off"`: a running clock that announces
 * itself every second is unusable, so the figure is spoken once, when it is
 * stopped, which is when it means something.
 *
 *   <div data-rm-task-timer data-rm-seconds="0"></div>
 */
export function taskTimer(target = "[data-rm-task-timer]", options = {}) {
  const timers = resolveElements(target);
  if (!timers.length) return () => {};

  const { label = "Time on task" } = options;
  const cleanups = [];

  for (const holder of timers) {
    holder.classList.add("rm-task-timer");
    holder.setAttribute("role", "timer");
    holder.setAttribute("aria-live", "off");
    const unlabel = setAttr(holder, "aria-label", dataString(holder, "rmLabel", label));

    const face = document.createElement("output");
    face.className = "rm-task-timer-face";
    // `<output>` has an implicit `role="status"`, and a status is a polite live
    // region whatever the element around it says — politeness is taken from the
    // nearest element that declares it, so the `aria-live="off"` on the holder
    // never reaches inside. Without this the clock repaints on the shared frame
    // loop and announces itself sixty times a second, which is the exact thing
    // this component is built not to do. The figure is spoken once, on pause,
    // from the live region beside it.
    face.setAttribute("aria-live", "off");
    const region = speaker(holder);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "rm-task-timer-button";
    button.setAttribute("aria-pressed", "false");
    button.textContent = "Start";
    holder.append(face, button);

    let base = dataNumber(holder, "rmSeconds", 0) * 1000;
    let since = 0;
    let running = false;
    let stopLoop = null;

    const spell = (ms) => {
      const total = Math.floor(ms / 1000);
      const m = String(Math.floor(total / 60)).padStart(2, "0");
      const s = String(total % 60).padStart(2, "0");
      return `${m}:${s}`;
    };
    const elapsed = () => base + (running ? Date.now() - since : 0);
    const paint = () => { face.textContent = spell(elapsed()); };
    paint();

    const run = (on) => {
      running = on;
      button.setAttribute("aria-pressed", on ? "true" : "false");
      button.textContent = on ? "Pause" : "Start";
      holder.classList.toggle("is-running", on);
      if (on) {
        since = Date.now();
        stopLoop = whileVisible(holder, () => onFrame(paint));
      } else {
        base = elapsed();
        since = 0;
        stopLoop?.();
        stopLoop = null;
        paint();
        say(region, `Paused at ${spell(base)}`);
      }
    };

    const onClick = () => run(!running);
    button.addEventListener("click", onClick);
    holder.rmReset = () => { if (running) run(false); base = 0; paint(); };

    cleanups.push(() => {
      button.removeEventListener("click", onClick);
      stopLoop?.();
      delete holder.rmReset;
      face.remove();
      button.remove();
      region.remove();
      unlabel();
      holder.classList.remove("rm-task-timer", "is-running");
      holder.removeAttribute("role");
      holder.removeAttribute("aria-live");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Consecutive days, drawn.
 *
 * The run of days is a polyline drawn once as it arrives, `pathLength="1"` so
 * the offset is the fraction of the streak completed however many days are
 * shown. Each day is a real list item with a name — "Tuesday, done" — because
 * the row of dots is the decoration and the record is the information.
 *
 * It draws only when it comes into view, once, rather than on load. A streak
 * chart that has already finished animating before you scroll to it is one
 * nobody ever sees.
 *
 *   <div data-rm-task-streak data-rm-days="1,1,1,0,1,1,1"></div>
 */
export function taskStreak(target = "[data-rm-task-streak]", options = {}) {
  const charts = resolveElements(target);
  if (!charts.length) return () => {};

  const { duration = 900, names = "Mon,Tue,Wed,Thu,Fri,Sat,Sun" } = options;
  const cleanups = [];

  for (const chart of charts) {
    const days = dataString(chart, "rmDays", "")
      .split(",")
      .map((value) => value.trim())
      .filter((value) => value !== "")
      .map((value) => value === "1" || value === "true");
    if (!days.length) continue;

    const span = dataNumber(chart, "rmDuration", duration);
    const words = dataString(chart, "rmLabel", names).split(",");
    chart.classList.add("rm-task-streak");

    // The current run, counted from the end backwards — the number people mean
    // when they say "streak".
    let run = 0;
    for (let i = days.length - 1; i >= 0 && days[i]; i -= 1) run += 1;

    const line = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    line.setAttribute("class", "rm-task-streak-line");
    line.setAttribute("viewBox", `0 0 ${days.length * 10} 10`);
    line.setAttribute("preserveAspectRatio", "none");
    line.setAttribute("aria-hidden", "true");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", `M5 5 H ${days.length * 10 - 5}`);
    path.setAttribute("pathLength", "1");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("stroke-linecap", "round");
    line.appendChild(path);

    const list = document.createElement("ul");
    list.className = "rm-task-streak-days";
    list.setAttribute("aria-label", `${run} day streak`);
    days.forEach((done, i) => {
      const cell = document.createElement("li");
      cell.className = `rm-task-streak-day${done ? " is-done" : ""}`;
      cell.textContent = (words[i] ?? `Day ${i + 1}`).trim();
      cell.setAttribute("aria-label", `${(words[i] ?? `Day ${i + 1}`).trim()}, ${done ? "done" : "missed"}`);
      list.appendChild(cell);
    });
    chart.append(line, list);

    const reach = days.length > 1 ? clamp(run / days.length, 0, 1) : 1;
    path.style.strokeDasharray = "1";
    path.style.strokeDashoffset = prefersReducedMotion() ? String(1 - reach) : "1";

    cleanups.push(watch(chart, () => {
      if (prefersReducedMotion()) return;
      path.animate(
        [{ strokeDashoffset: 1 }, { strokeDashoffset: 1 - reach }],
        { duration: span, easing: EASE.out, fill: "forwards" },
      );
    }, { threshold: 0.3, once: true }));

    cleanups.push(() => {
      line.remove();
      list.remove();
      chart.classList.remove("rm-task-streak");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * An inline note that expands in place.
 *
 * The row takes its final size on the frame the note opens, and only the ink
 * animates — a clip-path wipe and a short lift on the note itself. That is the
 * opposite of the usual height transition, and deliberately so: interpolating
 * the height of a row in the middle of a list drags every row below it through
 * a few hundred intermediate positions, which is what makes long lists stutter
 * and what makes a click on the row beneath land somewhere unexpected.
 *
 * The trigger is a real button with `aria-expanded` and `aria-controls`, focus
 * moves into the note when it opens, and Escape closes it and puts focus back
 * on the button that opened it.
 *
 *   <p data-rm-task-note="Notes">Client wants the blue version by Friday.</p>
 */
export function taskNote(target = "[data-rm-task-note]", options = {}) {
  const notes = resolveElements(target);
  if (!notes.length) return () => {};

  const { label = "Note", duration = 300, open = false } = options;
  const cleanups = [];
  let seq = 0;

  for (const note of notes) {
    const span = dataNumber(note, "rmDuration", duration);
    const name = dataString(note, "rmTaskNote", label);
    note.classList.add("rm-task-note");
    const mine = !note.id;
    if (mine) note.id = `rm-task-note-${(seq += 1)}`;
    note.tabIndex = -1;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "rm-task-note-toggle";
    button.setAttribute("aria-controls", note.id);
    button.textContent = name;
    note.before(button);

    const set = (on, moveFocus) => {
      button.setAttribute("aria-expanded", on ? "true" : "false");
      note.classList.toggle("is-open", on);
      if (on) {
        note.hidden = false;
        if (moveFocus) note.focus();
        if (prefersReducedMotion()) return;
        note.animate(
          [
            { clipPath: "inset(0 0 100% 0)", opacity: 0, transform: "translateY(-6px)" },
            { clipPath: "inset(0 0 0 0)", opacity: 1, transform: "none" },
          ],
          { duration: span, easing: EASE.out },
        );
        return;
      }
      if (prefersReducedMotion()) { note.hidden = true; return; }
      note.animate(
        [
          { clipPath: "inset(0 0 0 0)", opacity: 1 },
          { clipPath: "inset(0 0 100% 0)", opacity: 0 },
        ],
        { duration: Math.round(span * 0.7), easing: EASE.inOut },
      ).finished.then(() => { note.hidden = true; }, () => { note.hidden = true; });
    };

    // Start state from here, never from the stylesheet: a note hidden by CSS is
    // a note that stays hidden for anybody whose script never loaded.
    set(dataString(note, "rmOpen", String(open)) !== "false", false);

    const onClick = () => set(button.getAttribute("aria-expanded") !== "true", true);
    const onKey = (event) => {
      if (event.key !== "Escape" || button.getAttribute("aria-expanded") !== "true") return;
      event.preventDefault();
      set(false, false);
      button.focus();
    };
    button.addEventListener("click", onClick);
    note.addEventListener("keydown", onKey);

    cleanups.push(() => {
      button.removeEventListener("click", onClick);
      note.removeEventListener("keydown", onKey);
      button.remove();
      note.hidden = false;
      note.removeAttribute("tabindex");
      if (mine) note.removeAttribute("id");
      note.classList.remove("rm-task-note", "is-open");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}
