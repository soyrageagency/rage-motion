/**
 * Admin consoles and data tables.
 *
 *   • dataGrid()      — a real table with sticky headers, resizable columns and announced selection.
 *   • columnPicker()  — which columns are showing, as real checkboxes.
 *   • bulkBar()       — a toolbar that appears when rows are selected, and says how many.
 *   • savedViews()    — the views you keep, with the current one marked rather than merely coloured.
 *   • queryBar()      — a filter expression built from real form controls.
 *   • keyboardMap()   — a shortcut sheet that reads the bindings the page actually declares.
 *   • logStream()     — lines arriving that do not fight you when you have scrolled up.
 *   • metricTile()    — one figure, its delta in words, rolled on arrival.
 *   • healthGrid()    — many services at a glance, each with a word as well as a colour.
 *   • auditRow()      — who did what to which thing, and how long ago.
 *   • envSwitch()     — a guarded control: production asks first, and reverts if you say no.
 *   • roleBadge()     — a role, with what it may do, on hover and on focus.
 *   • quotaMeter()    — usage against a limit, with the thresholds named out loud.
 *   • jobQueue()      — running, queued and failed, with real progress on each.
 *   • diffTable()     — before and after, with the kind of change written down.
 *   • exportMenu()    — a real menu of formats, with the work that follows announced.
 *
 * An operations console is the one interface people live inside for eight hours
 * a day, which changes what "good" means. Delight is worth nothing here and
 * predictability is worth everything: nothing may move that the operator did
 * not move, nothing may reflow while they are reaching for it, and no state may
 * exist only as a colour. Every component in this file therefore states its
 * condition in words — "degraded", "over limit", "3 rows selected", "failed" —
 * and uses colour as a second, redundant channel rather than the only one.
 *
 * The second rule is that a console is a keyboard instrument. Every control
 * that can be dragged can also be nudged with the arrow keys, every set of
 * related controls has a roving tabindex so Tab passes over it in one press,
 * every overlay traps focus and gives it back, and Escape always means the same
 * thing. A column you can only resize with a mouse is a column half the
 * operations team cannot resize.
 *
 * The third is that nothing here animates a size. Rows appear, panels open,
 * chips are removed and services re-sort themselves, and all of it is done with
 * a FLIP — measure, change, invert, play — or with a grid track going from
 * `0fr` to `1fr`. A table that animates its column widths repaints the entire
 * grid sixty times a second and drops frames on the machines these consoles are
 * actually used on.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import {
  clamp, dataNumber, dataString, EASE, keepInView, onFrame, prefersReducedMotion,
  resolveElements, whileVisible,
} from "../core/motion.js";

/** An id for the `aria-` wiring that needs one, without demanding it in markup. */
const uid = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * A live region owned by one component and removed with it.
 *
 * Tables and lists cannot legally hold a stray paragraph — a `<p>` inside a
 * `<ul>` is a parse error that browsers recover from by moving the node, which
 * is how a live region ends up outside the component it belongs to — so on
 * those the region is inserted as a sibling instead.
 */
function announcer(holder, tone = "polite") {
  const said = document.createElement("p");
  said.className = "rm-console-live";
  said.setAttribute("aria-live", tone);
  said.setAttribute("role", tone === "assertive" ? "alert" : "status");
  if (/^(UL|OL|TABLE|THEAD|TBODY|TR|DL|SELECT)$/.test(holder.tagName)) {
    holder.parentNode?.insertBefore(said, holder.nextSibling);
  } else {
    holder.appendChild(said);
  }
  return said;
}

/** Text that is read but never drawn — the spoken half of a visual signal. */
function said(text) {
  const span = document.createElement("span");
  span.className = "rm-console-said";
  span.textContent = text;
  return span;
}

/**
 * Move an element from where it was to where it now is, using only transform.
 *
 * The invert half of a FLIP. The layout change has already happened and the
 * element is already in its final place; this plays the difference. It is how
 * everything in this file appears to slide, grow or re-sort without a single
 * animated width.
 */
function flip(element, was, duration = 300) {
  if (prefersReducedMotion()) return;
  const now = element.getBoundingClientRect();
  if (!now.width || !now.height || !was.width || !was.height) return;
  const dx = was.left - now.left;
  const dy = was.top - now.top;
  if (!dx && !dy) return;
  element.animate(
    [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }],
    { duration, easing: EASE.out },
  );
}

/** Snapshot a set of elements' boxes, for the F and L of a FLIP. */
const boxesOf = (elements) => elements.map((element) => [element, element.getBoundingClientRect()]);

/** Play the difference for every element that actually moved. */
function flipAll(boxes, duration = 300) {
  for (const [element, was] of boxes) {
    if (element.isConnected) flip(element, was, duration);
  }
}

/** Everything inside `root` that a Tab press can reach. */
function focusable(root) {
  return [...root.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), '
    + 'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )].filter((el) => !el.hidden && (el.offsetParent !== null || el === document.activeElement));
}

/**
 * A roving tabindex over a set of sibling controls.
 *
 * A toolbar of nine buttons that are each separately tabbable costs nine Tab
 * presses to walk past. One tab stop and arrow keys inside is both the ARIA
 * pattern and, far more importantly, what anybody who uses this console all day
 * already expects from every other console they have used.
 */
function roving(items, { horizontal = true, onMove } = {}) {
  if (!items.length) return () => {};
  items.forEach((item, i) => { item.tabIndex = i === 0 ? 0 : -1; });

  const focusAt = (index) => {
    const next = (index + items.length) % items.length;
    items.forEach((item, i) => { item.tabIndex = i === next ? 0 : -1; });
    items[next].focus();
    onMove?.(items[next], next);
  };

  const prevKey = horizontal ? "ArrowLeft" : "ArrowUp";
  const nextKey = horizontal ? "ArrowRight" : "ArrowDown";

  const onKey = (event) => {
    const at = items.indexOf(event.currentTarget);
    if (at < 0) return;
    if (event.key === nextKey) { event.preventDefault(); focusAt(at + 1); }
    else if (event.key === prevKey) { event.preventDefault(); focusAt(at - 1); }
    else if (event.key === "Home") { event.preventDefault(); focusAt(0); }
    else if (event.key === "End") { event.preventDefault(); focusAt(items.length - 1); }
  };

  const onFocus = (event) => {
    const at = items.indexOf(event.currentTarget);
    if (at >= 0) items.forEach((item, i) => { item.tabIndex = i === at ? 0 : -1; });
  };

  items.forEach((item) => {
    item.addEventListener("keydown", onKey);
    item.addEventListener("focus", onFocus);
  });

  return () => items.forEach((item) => {
    item.removeEventListener("keydown", onKey);
    item.removeEventListener("focus", onFocus);
    item.removeAttribute("tabindex");
  });
}

/**
 * A real modal: focus in, the rest of the page inert, focus back on the way out.
 *
 * `inert` on the siblings rather than `aria-hidden` on them, because `inert`
 * also removes them from the tab order and from pointer events. Half the modal
 * implementations in the world set `aria-hidden` and then wonder why Tab walks
 * out of the dialog and into the page behind it.
 */
function modal(panel) {
  let opener = null;
  let sealed = [];

  const trap = (event) => {
    if (event.key !== "Tab") return;
    const reachable = focusable(panel);
    if (!reachable.length) return;
    const first = reachable[0];
    const last = reachable[reachable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };

  return {
    open(focusTarget) {
      opener = document.activeElement;
      sealed = [...document.body.children].filter((node) => node !== panel && !node.contains(panel));
      sealed.forEach((node) => { node.inert = true; });
      panel.addEventListener("keydown", trap);
      (focusTarget ?? focusable(panel)[0])?.focus();
    },
    close() {
      panel.removeEventListener("keydown", trap);
      sealed.forEach((node) => { node.inert = false; });
      sealed = [];
      opener?.focus();
      opener = null;
    },
    release() {
      panel.removeEventListener("keydown", trap);
      sealed.forEach((node) => { node.inert = false; });
      sealed = [];
    },
  };
}

/** Grow a panel open by interpolating its grid track, never its height. */
function openPanel(panel, duration) {
  panel.hidden = false;
  if (prefersReducedMotion()) { panel.classList.add("is-open"); return; }
  panel.classList.add("is-open");
  panel.animate(
    [{ opacity: 0, transform: "translateY(-6px) scale(0.99)" }, { opacity: 1, transform: "none" }],
    { duration, easing: EASE.out },
  );
}

/** Close it again, and only then take it out of the tree. */
function closePanel(panel, duration) {
  const done = () => { panel.hidden = true; panel.classList.remove("is-open"); };
  if (prefersReducedMotion()) { done(); return; }
  panel.animate(
    [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-6px) scale(0.99)" }],
    { duration: Math.round(duration * 0.7), easing: EASE.inOut, fill: "forwards" },
  ).finished.then(done, done);
}

/**
 * A real table with sticky headers, resizable columns and announced selection.
 *
 * Three things here are usually got wrong, and all three are load-bearing.
 *
 * The sticky header is `position: sticky` on the header cells, not a second
 * cloned table floating above the first. A clone has to be kept in sync with
 * every column resize, every sort and every re-render, it is announced twice by
 * a screen reader, and it drifts by a pixel on any zoom level that is not 100%.
 *
 * Column widths are written into a real `<colgroup>` as custom properties. The
 * moment the first column is resized every column is frozen at the width it
 * currently has and the table switches to `table-layout: fixed` — otherwise
 * setting one column's width makes the browser redistribute all the others, and
 * dragging one edge visibly jerks the four columns beside it. The drag itself
 * is not animated and deliberately so: a resize handle that eases behind the
 * pointer feels broken. Pointer moves are coalesced into the shared frame loop,
 * so a fast drag does one layout per frame rather than one per event.
 *
 * Selection is a roving tabindex over the rows with `aria-selected` and a
 * polite count, so "3 of 40 rows selected" is spoken rather than inferred from
 * a shade of blue. The selected state is also written to `data-rm-selected`,
 * which is how bulkBar finds out without either component knowing about the
 * other.
 *
 *   <div data-rm-data-grid data-rm-mode="multiple"><table>…</table></div>
 */
export function dataGrid(target = "[data-rm-data-grid]", options = {}) {
  const roots = resolveElements(target);
  if (!roots.length) return () => {};

  const { label = "Data grid", min = 72, step = 16, mode = "multiple" } = options;
  const cleanups = [];

  for (const root of roots) {
    const table = root.querySelector("table");
    if (!table) continue;

    const heads = [...table.querySelectorAll("thead th")];
    const rows = [...table.querySelectorAll("tbody tr")];
    const smallest = dataNumber(root, "rmMin", min);
    const nudge = dataNumber(root, "rmStep", step);
    const picking = dataString(root, "rmMode", mode);
    const selects = picking === "single" || picking === "multiple";

    root.classList.add("rm-data-grid");
    root.setAttribute("role", "region");
    root.setAttribute("tabindex", "0");
    root.setAttribute("aria-label", dataString(root, "rmLabel", label));
    table.classList.add("rm-data-grid-table");
    const live = announcer(root);

    /* ── Column widths ─────────────────────────────────────────────────── */

    let group = table.querySelector("colgroup");
    const ownGroup = !group;
    if (ownGroup && heads.length) {
      group = document.createElement("colgroup");
      table.prepend(group);
    }

    /*
     * Every column gets a `<col>` pointing at its own custom property, and
     * that has to happen whether the group is ours or the author's.
     *
     * Wiring only our own group looks harmless and is not: `freeze()` still
     * writes `--rm-grid-col-N` onto the root, still switches the table to
     * `table-layout: fixed`, and the grip still announces "Customer column,
     * 240 pixels" — while nothing on the page reads the property, so the
     * column never moves. A handle that reports a width it did not apply is
     * worse than no handle, because the operator believes it.
     *
     * Pre-existing cols and their inline widths are recorded so cleanup can
     * hand the author's markup back exactly as it was found.
     */
    const addedCols = [];
    const widthWas = new Map();
    if (group && heads.length) {
      const existing = [...group.querySelectorAll("col")];
      heads.forEach((_, i) => {
        let col = existing[i];
        if (col) widthWas.set(col, col.getAttribute("style"));
        else {
          col = document.createElement("col");
          group.appendChild(col);
          addedCols.push(col);
        }
        col.style.width = `var(--rm-grid-col-${i}, auto)`;
      });
    }

    const natural = [];
    let frozen = false;
    const freeze = () => {
      if (frozen || !heads.length) return;
      // Every column at once. Freezing only the one being dragged lets the
      // browser reallocate the rest, and the whole table twitches.
      heads.forEach((th, i) => { natural[i] = Math.round(th.getBoundingClientRect().width); });
      natural.forEach((width, i) => root.style.setProperty(`--rm-grid-col-${i}`, `${width}px`));
      table.classList.add("is-sized");
      frozen = true;
    };

    const widthOf = (index) => {
      const raw = root.style.getPropertyValue(`--rm-grid-col-${index}`);
      return Number.parseFloat(raw) || natural[index] || smallest;
    };

    const setWidth = (index, value) => {
      const next = Math.max(smallest, Math.round(value));
      root.style.setProperty(`--rm-grid-col-${index}`, `${next}px`);
      return next;
    };

    const grips = [];
    heads.forEach((th, index) => {
      th.classList.add("rm-data-grid-head");
      const grip = document.createElement("button");
      grip.type = "button";
      grip.className = "rm-data-grid-grip";
      // A bare handle with no text is a control nobody can name. The column's
      // own heading is the only sensible name for it.
      grip.setAttribute("aria-label", `Resize the ${th.textContent.trim() || `column ${index + 1}`} column`);
      th.appendChild(grip);
      grips.push(grip);

      let dragging = false;
      let fromX = 0;
      let fromWidth = 0;
      let wantX = 0;
      let stopFrame = null;

      const apply = () => {
        setWidth(index, fromWidth + (wantX - fromX));
      };

      const onDown = (event) => {
        if (event.button > 0) return;
        event.preventDefault();
        freeze();
        dragging = true;
        fromX = event.clientX;
        wantX = event.clientX;
        fromWidth = widthOf(index);
        root.classList.add("is-resizing");
        grip.setPointerCapture?.(event.pointerId);
        // One layout per frame, however fast the pointer is moving.
        stopFrame = onFrame(apply);
      };

      const onMove = (event) => { if (dragging) wantX = event.clientX; };

      const onUp = (event) => {
        if (!dragging) return;
        dragging = false;
        grip.releasePointerCapture?.(event.pointerId);
        stopFrame?.();
        stopFrame = null;
        apply();
        root.classList.remove("is-resizing");
        live.textContent = `${th.textContent.trim()} column, ${Math.round(widthOf(index))} pixels`;
      };

      const onKey = (event) => {
        const big = event.shiftKey ? 4 : 1;
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
          freeze();
          const delta = (event.key === "ArrowRight" ? nudge : -nudge) * big;
          const next = setWidth(index, widthOf(index) + delta);
          live.textContent = `${th.textContent.trim()} column, ${next} pixels`;
        } else if (event.key === "Home") {
          event.preventDefault();
          freeze();
          const next = setWidth(index, natural[index] ?? smallest);
          live.textContent = `${th.textContent.trim()} column reset to ${next} pixels`;
        }
      };

      grip.addEventListener("pointerdown", onDown);
      grip.addEventListener("pointermove", onMove);
      grip.addEventListener("pointerup", onUp);
      grip.addEventListener("pointercancel", onUp);
      grip.addEventListener("keydown", onKey);

      cleanups.push(() => {
        stopFrame?.();
        grip.removeEventListener("pointerdown", onDown);
        grip.removeEventListener("pointermove", onMove);
        grip.removeEventListener("pointerup", onUp);
        grip.removeEventListener("pointercancel", onUp);
        grip.removeEventListener("keydown", onKey);
      });
    });

    /* ── Selection ─────────────────────────────────────────────────────── */

    let stopRoving = () => {};
    const say = () => {
      const picked = rows.filter((row) => row.getAttribute("data-rm-selected") === "true").length;
      live.textContent = picked === 0
        ? "No rows selected"
        : `${picked} of ${rows.length} row${rows.length === 1 ? "" : "s"} selected`;
    };

    const mark = (row, on) => {
      row.setAttribute("aria-selected", on ? "true" : "false");
      row.setAttribute("data-rm-selected", on ? "true" : "false");
      row.classList.toggle("is-selected", on);
    };

    const toggle = (row) => {
      const on = row.getAttribute("data-rm-selected") !== "true";
      if (picking === "single") rows.forEach((other) => mark(other, false));
      mark(row, on);
      say();
    };

    const onRowKey = (event) => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        toggle(event.currentTarget);
      } else if (event.key === "Escape") {
        rows.forEach((row) => mark(row, false));
        say();
      }
    };
    const onRowClick = (event) => toggle(event.currentTarget);

    if (selects && rows.length) {
      // `role="grid"` is what makes row-level selection legal; a plain table
      // has no notion of a selected row at all.
      table.setAttribute("role", "grid");
      if (picking === "multiple") table.setAttribute("aria-multiselectable", "true");
      rows.forEach((row) => {
        row.classList.add("rm-data-grid-row");
        mark(row, row.getAttribute("data-rm-selected") === "true");
        row.addEventListener("keydown", onRowKey);
        row.addEventListener("click", onRowClick);
      });
      // Arrow keys walk the rows, and the row is brought into view inside the
      // grid's own scroller — never by scrolling the whole page to it.
      stopRoving = roving(rows, {
        horizontal: false,
        onMove: (row) => keepInView(root, row, prefersReducedMotion() ? "auto" : "smooth"),
      });
      say();
    }

    cleanups.push(() => {
      stopRoving();
      rows.forEach((row) => {
        row.removeEventListener("keydown", onRowKey);
        row.removeEventListener("click", onRowClick);
        row.classList.remove("rm-data-grid-row", "is-selected");
        row.removeAttribute("aria-selected");
        row.removeAttribute("data-rm-selected");
      });
      grips.forEach((grip) => grip.remove());
      heads.forEach((th) => th.classList.remove("rm-data-grid-head"));
      heads.forEach((_, i) => root.style.removeProperty(`--rm-grid-col-${i}`));
      if (ownGroup) group?.remove();
      else {
        addedCols.forEach((col) => col.remove());
        widthWas.forEach((style, col) => {
          if (style === null) col.removeAttribute("style");
          else col.setAttribute("style", style);
        });
      }
      live.remove();
      table.classList.remove("rm-data-grid-table", "is-sized");
      table.removeAttribute("role");
      table.removeAttribute("aria-multiselectable");
      root.classList.remove("rm-data-grid", "is-resizing");
      root.removeAttribute("role");
      root.removeAttribute("tabindex");
      root.removeAttribute("aria-label");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Which columns are showing, as real checkboxes.
 *
 * The checkboxes are genuine `<input type="checkbox">` elements in a real
 * `<fieldset>`, so the whole thing works with a screen reader's forms mode, with
 * voice control and with a keyboard, none of which is true of the div-and-
 * `aria-checked` rebuild this control is usually given.
 *
 * Hiding a column means hiding every cell in it, not just the header — the
 * naive version sets the `<col>` to `display: none` and is then surprised that
 * the data is still there, because a column element cannot hide anything but
 * its own backgrounds and borders. The panel is taken out of the flow entirely,
 * so opening it does not push the table it is describing down the page.
 *
 *   <div data-rm-column-picker="orders"><button type="button">Columns</button></div>
 */
export function columnPicker(target = "[data-rm-column-picker]", options = {}) {
  const roots = resolveElements(target);
  if (!roots.length) return () => {};

  const { label = "Columns", duration = 240, onChange } = options;
  const cleanups = [];

  for (const root of roots) {
    const tableId = root.getAttribute("data-rm-column-picker");
    const table = tableId ? document.getElementById(tableId)?.closest("table")
      ?? document.getElementById(tableId)?.querySelector("table") ?? document.getElementById(tableId) : null;
    if (!table || table.tagName !== "TABLE") continue;

    const trigger = root.querySelector("button") ?? document.createElement("button");
    const ownTrigger = !root.contains(trigger);
    // `stamp()` takes the trigger's text over to carry the count, so whatever
    // the author wrote there — "Show or hide columns" — has to be kept and put
    // back. Without this an unmount leaves a button reading "Columns (4 of 4)"
    // for a component that is no longer on the page.
    const wasLabel = trigger.textContent;
    if (ownTrigger) {
      trigger.type = "button";
      trigger.textContent = dataString(root, "rmLabel", label);
      root.appendChild(trigger);
    }

    const heads = [...table.querySelectorAll("thead th")];
    if (!heads.length) continue;

    table.classList.add("rm-column-picker-table");
    root.classList.add("rm-column-picker");
    trigger.classList.add("rm-column-picker-trigger");
    trigger.setAttribute("aria-expanded", "false");

    const panel = document.createElement("div");
    panel.className = "rm-column-picker-panel";
    panel.id = uid("rm-columns");
    panel.hidden = true;
    trigger.setAttribute("aria-controls", panel.id);

    const set = document.createElement("fieldset");
    const legend = document.createElement("legend");
    legend.textContent = dataString(root, "rmLabel", label);
    set.appendChild(legend);

    const live = announcer(root);
    const boxes = [];

    const cellsFor = (index) => [
      ...table.querySelectorAll(`thead tr > *:nth-child(${index + 1})`),
      ...table.querySelectorAll(`tbody tr > *:nth-child(${index + 1})`),
      ...table.querySelectorAll(`tfoot tr > *:nth-child(${index + 1})`),
    ];

    /*
     * Hiding and showing goes through here so that the previous `hidden` value
     * of every cell we touch is recorded. Cleanup then restores exactly those
     * cells to exactly what they were, rather than sweeping `hidden = false`
     * across the whole table — which un-hid columns the author had hidden in
     * their own markup and that this component never touched.
     */
    const wasHidden = new Map();
    const showColumn = (index, on) => {
      cellsFor(index).forEach((cell) => {
        if (cell.hidden === !on) return;
        if (!wasHidden.has(cell)) wasHidden.set(cell, cell.hidden);
        cell.hidden = !on;
      });
    };

    const countShown = () => boxes.filter((box) => box.checked).length;
    const stamp = () => {
      trigger.textContent = `${dataString(root, "rmLabel", label)} (${countShown()} of ${heads.length})`;
    };

    heads.forEach((th, index) => {
      const name = th.textContent.trim() || `Column ${index + 1}`;
      const row = document.createElement("label");
      row.className = "rm-column-picker-option";
      const box = document.createElement("input");
      box.type = "checkbox";
      // Read the column's real state rather than asserting it. A column the
      // author shipped hidden must arrive with its box unticked, or the panel
      // reports four of four showing over a table displaying three.
      box.checked = !cellsFor(index)[0]?.hidden;
      const text = document.createElement("span");
      text.textContent = name;
      row.append(box, text);
      set.appendChild(row);
      boxes.push(box);

      box.addEventListener("change", () => {
        // The last visible column cannot be switched off — a table with no
        // columns is a table that looks broken rather than filtered.
        if (!box.checked && countShown() === 0) {
          box.checked = true;
          live.textContent = "At least one column has to stay visible";
          return;
        }
        showColumn(index, box.checked);
        stamp();
        live.textContent = `${name} ${box.checked ? "shown" : "hidden"}, ${countShown()} of ${heads.length} columns showing`;
        onChange?.(name, box.checked, table);
      });
    });

    const reset = document.createElement("button");
    reset.type = "button";
    reset.className = "rm-column-picker-reset";
    reset.textContent = "Show all";
    reset.addEventListener("click", () => {
      boxes.forEach((box, index) => {
        box.checked = true;
        showColumn(index, true);
      });
      stamp();
      live.textContent = `All ${heads.length} columns showing`;
    });

    panel.append(set, reset);
    root.appendChild(panel);
    stamp();

    const shut = () => {
      if (panel.hidden) return;
      trigger.setAttribute("aria-expanded", "false");
      closePanel(panel, dataNumber(root, "rmDuration", duration));
    };
    const open = () => {
      trigger.setAttribute("aria-expanded", "true");
      openPanel(panel, dataNumber(root, "rmDuration", duration));
      boxes[0]?.focus();
    };

    const onTrigger = () => (panel.hidden ? open() : shut());
    const onKey = (event) => {
      if (event.key === "Escape" && !panel.hidden) { event.preventDefault(); shut(); trigger.focus(); }
    };
    const onAway = (event) => { if (!root.contains(event.target)) shut(); };

    trigger.addEventListener("click", onTrigger);
    root.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onAway);

    cleanups.push(() => {
      trigger.removeEventListener("click", onTrigger);
      root.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onAway);
      wasHidden.forEach((hidden, cell) => { cell.hidden = hidden; });
      panel.remove();
      live.remove();
      if (ownTrigger) trigger.remove();
      else {
        trigger.textContent = wasLabel;
        trigger.classList.remove("rm-column-picker-trigger");
        trigger.removeAttribute("aria-expanded");
        trigger.removeAttribute("aria-controls");
      }
      table.classList.remove("rm-column-picker-table");
      root.classList.remove("rm-column-picker");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A toolbar that appears when rows are selected, and says how many.
 *
 * It finds out about the selection by watching `data-rm-selected` with a
 * MutationObserver rather than by being handed a callback, so it works with
 * dataGrid, with a hand-rolled table, and with a list of cards, and neither side
 * has to know the other exists.
 *
 * It is a real `role="toolbar"` with one tab stop and arrow keys inside, which
 * matters more here than almost anywhere else: a bulk bar appears while your
 * hands are already on the keyboard, and eight separately tabbable buttons
 * between the table and the rest of the page is eight presses you did not ask
 * for. The bar is fixed over the content rather than inserted above it, so the
 * rows you were reading do not jump down the page at the moment you select one.
 *
 *   <div data-rm-bulk-bar="orders" hidden><button type="button">Archive</button></div>
 */
export function bulkBar(target = "[data-rm-bulk-bar]", options = {}) {
  const bars = resolveElements(target);
  if (!bars.length) return () => {};

  const { label = "Bulk actions", noun = "row", duration = 260 } = options;
  const cleanups = [];

  for (const bar of bars) {
    const scopeId = bar.getAttribute("data-rm-bulk-bar");
    const scope = (scopeId && document.getElementById(scopeId)) || document.body;
    const word = dataString(bar, "rmUnit", noun);
    const span = dataNumber(bar, "rmDuration", duration);

    bar.classList.add("rm-bulk-bar");
    bar.setAttribute("role", "toolbar");
    bar.setAttribute("aria-label", dataString(bar, "rmLabel", label));
    if (scopeId) bar.setAttribute("aria-controls", scopeId);
    // A bulk bar is normally shipped `hidden` in the markup, precisely so the
    // page is not showing a row of loose action buttons before anything is
    // selected. Cleanup must therefore put that value back rather than reveal
    // it: an unstyled, unlabelled toolbar left mid-page is not "undone".
    const barWasHidden = bar.hidden;
    bar.hidden = true;

    const count = document.createElement("p");
    count.className = "rm-bulk-bar-count";
    bar.prepend(count);

    const clear = document.createElement("button");
    clear.type = "button";
    clear.className = "rm-bulk-bar-clear";
    clear.textContent = "Clear selection";
    clear.addEventListener("click", () => {
      scope.querySelectorAll('[data-rm-selected="true"]').forEach((row) => {
        row.setAttribute("data-rm-selected", "false");
        row.setAttribute("aria-selected", "false");
        row.classList.remove("is-selected");
      });
    });
    bar.appendChild(clear);

    const live = announcer(bar);
    const buttons = [...bar.querySelectorAll("button")];
    const stopRoving = roving(buttons);

    let shown = false;
    const sync = () => {
      const picked = scope.querySelectorAll('[data-rm-selected="true"]').length;
      count.textContent = `${picked} ${word}${picked === 1 ? "" : "s"} selected`;
      if (picked > 0 && !shown) {
        shown = true;
        bar.hidden = false;
        if (!prefersReducedMotion()) {
          bar.animate(
            [{ opacity: 0, transform: "translateY(120%)" }, { opacity: 1, transform: "none" }],
            { duration: span, easing: EASE.out },
          );
        }
      } else if (picked === 0 && shown) {
        shown = false;
        const done = () => { bar.hidden = true; };
        if (prefersReducedMotion()) done();
        else {
          bar.animate(
            [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(120%)" }],
            { duration: Math.round(span * 0.8), easing: EASE.inOut, fill: "forwards" },
          ).finished.then(done, done);
        }
      }
      // The count changes far more often than the bar appears, so it is spoken
      // politely and only when there is something selected to speak about.
      if (picked > 0) live.textContent = count.textContent;
    };

    const observer = new MutationObserver(sync);
    observer.observe(scope, { subtree: true, attributes: true, attributeFilter: ["data-rm-selected"] });
    sync();

    cleanups.push(() => {
      observer.disconnect();
      stopRoving();
      count.remove();
      clear.remove();
      live.remove();
      bar.hidden = barWasHidden;
      bar.classList.remove("rm-bulk-bar");
      bar.removeAttribute("role");
      bar.removeAttribute("aria-label");
      bar.removeAttribute("aria-controls");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * The views you keep, with the current one marked rather than merely coloured.
 *
 * `aria-current="true"` on the chosen view, which is the attribute that exists
 * for exactly this — one of several similar things being the one you are
 * looking at. Tabs would be wrong: these do not each own a panel, they all
 * reconfigure the same table.
 *
 * The underline is a single element moved and scaled by transform between the
 * chips, so switching views costs one composited animation rather than a
 * repaint of every chip's border. Removing a view FLIPs the chips that remain,
 * so the row closes up visibly instead of snapping and leaving you unsure which
 * one went.
 *
 *   <div data-rm-saved-views><button type="button" aria-current="true">All</button></div>
 */
export function savedViews(target = "[data-rm-saved-views]", options = {}) {
  const roots = resolveElements(target);
  if (!roots.length) return () => {};

  const { label = "Saved views", duration = 320, onSelect } = options;
  const cleanups = [];

  for (const root of roots) {
    root.classList.add("rm-saved-views");
    root.setAttribute("role", "group");
    root.setAttribute("aria-label", dataString(root, "rmLabel", label));
    const span = dataNumber(root, "rmDuration", duration);

    const marker = document.createElement("span");
    marker.className = "rm-saved-views-marker";
    marker.setAttribute("aria-hidden", "true");
    root.appendChild(marker);

    const live = announcer(root);
    let chips = [...root.querySelectorAll("button")];
    let stopRoving = () => {};
    let current = chips.find((chip) => chip.getAttribute("aria-current") === "true") ?? chips[0] ?? null;

    const place = (animated) => {
      if (!current) { marker.hidden = true; return; }
      marker.hidden = false;
      const base = root.getBoundingClientRect();
      const box = current.getBoundingClientRect();
      const x = box.left - base.left;
      const w = box.width;
      if (!w) return;
      const to = `translateX(${x}px) scaleX(${w / 100})`;
      if (animated && !prefersReducedMotion()) {
        marker.animate([{ transform: marker.style.transform || to }, { transform: to }], {
          duration: span, easing: EASE.out,
        });
      }
      marker.style.transform = to;
    };

    const choose = (chip, animated = true) => {
      if (!chip) return;
      chips.forEach((one) => one.removeAttribute("aria-current"));
      chip.setAttribute("aria-current", "true");
      current = chip;
      place(animated);
      live.textContent = `${chip.textContent.trim()} view`;
      onSelect?.(chip.textContent.trim(), chip);
    };

    const onClick = (event) => choose(event.currentTarget);

    const wire = () => {
      stopRoving();
      chips = [...root.querySelectorAll("button.rm-saved-views-chip, button:not(.rm-saved-views-drop)")]
        .filter((chip) => chip.parentElement === root);
      chips.forEach((chip) => {
        chip.classList.add("rm-saved-views-chip");
        chip.removeEventListener("click", onClick);
        chip.addEventListener("click", onClick);
      });
      stopRoving = roving(chips);
    };

    wire();
    place(false);

    /** Add a view, with a remove button that names the view it removes. */
    root.rmAdd = (name) => {
      const was = boxesOf(chips);
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "rm-saved-views-chip";
      chip.textContent = name;
      root.insertBefore(chip, marker);
      wire();
      flipAll(was, span);
      if (!prefersReducedMotion()) {
        chip.animate([{ opacity: 0, transform: "scale(0.9)" }, { opacity: 1, transform: "none" }],
          { duration: span, easing: EASE.out });
      }
      live.textContent = `${name} view saved`;
      return chip;
    };

    /** Remove one, and close the row up where it stood. */
    root.rmRemove = (name) => {
      const chip = chips.find((one) => one.textContent.trim() === name);
      if (!chip) return;
      const others = chips.filter((one) => one !== chip);
      const was = boxesOf(others);
      chip.remove();
      if (current === chip) current = others[0] ?? null;
      wire();
      if (current) current.setAttribute("aria-current", "true");
      flipAll(was, span);
      place(true);
      live.textContent = `${name} view removed`;
    };

    /** Select by name, for restoring a view from a URL. */
    root.rmSelect = (name) => choose(chips.find((one) => one.textContent.trim() === name));

    // Chips move when the window changes width, and the marker has to follow.
    const observer = new ResizeObserver(() => place(false));
    observer.observe(root);

    cleanups.push(() => {
      observer.disconnect();
      stopRoving();
      chips.forEach((chip) => {
        chip.removeEventListener("click", onClick);
        chip.classList.remove("rm-saved-views-chip");
      });
      delete root.rmAdd;
      delete root.rmRemove;
      delete root.rmSelect;
      marker.remove();
      live.remove();
      root.classList.remove("rm-saved-views");
      root.removeAttribute("role");
      root.removeAttribute("aria-label");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A filter expression built from real form controls.
 *
 * Not a text box pretending to be a query language. Every condition is a
 * `<select>` for the field, a `<select>` for the operator and an `<input>` for
 * the value, which means the operators are discoverable, the fields cannot be
 * misspelled, and the whole thing submits as a form with no JavaScript at all.
 * A free-text "status:open AND amount>500" box looks clever in a screenshot and
 * costs every user a syntax error the first four times they use it.
 *
 * New conditions are cloned from the first row in the markup, and every `id` in
 * the clone is rewritten along with the `for` and `aria-describedby` that point
 * at it. The usual implementation clones the row and quietly leaves five labels
 * all pointing at the first row's input, so clicking any of them focuses the
 * wrong field — invisible to the eye, fatal to a screen reader.
 *
 *   <form data-rm-query-bar><ol><li>…</li></ol></form>
 */
export function queryBar(target = "[data-rm-query-bar]", options = {}) {
  const roots = resolveElements(target);
  if (!roots.length) return () => {};

  const { label = "Filter", addLabel = "Add condition", duration = 280, onChange } = options;
  const cleanups = [];

  for (const root of roots) {
    const list = root.querySelector("ol, ul");
    const first = list?.firstElementChild;
    if (!list || !first) continue;

    root.classList.add("rm-query-bar");
    root.setAttribute("role", "search");
    root.setAttribute("aria-label", dataString(root, "rmLabel", label));
    list.classList.add("rm-query-bar-list");
    const span = dataNumber(root, "rmDuration", duration);
    const joiner = dataString(root, "rmMode", "and");

    const live = announcer(root);
    const summary = document.createElement("p");
    summary.className = "rm-query-bar-summary";
    root.appendChild(summary);

    const rowsOf = () => [...list.children];

    const describe = () => {
      const parts = rowsOf().map((row) => {
        const controls = [...row.querySelectorAll("select, input")];
        return controls.map((control) => {
          if (control.tagName === "SELECT") return control.options[control.selectedIndex]?.text.trim() ?? "";
          return control.value.trim();
        }).filter(Boolean).join(" ");
      }).filter(Boolean);
      const text = parts.length ? parts.join(` ${joiner} `) : "No conditions";
      summary.textContent = text;
      return text;
    };

    /** Give a cloned row its own ids, and repoint everything that referenced them. */
    const rename = (row) => {
      const map = new Map();
      row.querySelectorAll("[id]").forEach((node) => {
        const fresh = uid("rm-query");
        map.set(node.id, fresh);
        node.id = fresh;
      });
      row.querySelectorAll("[for]").forEach((node) => {
        const to = map.get(node.getAttribute("for"));
        if (to) node.setAttribute("for", to);
      });
      ["aria-describedby", "aria-labelledby", "aria-controls"].forEach((name) => {
        row.querySelectorAll(`[${name}]`).forEach((node) => {
          const to = node.getAttribute(name).split(/\s+/).map((one) => map.get(one) ?? one).join(" ");
          node.setAttribute(name, to);
        });
      });
    };

    const addRemove = (row) => {
      if (row.querySelector(".rm-query-bar-remove")) return;
      const drop = document.createElement("button");
      drop.type = "button";
      drop.className = "rm-query-bar-remove";
      const field = row.querySelector("select");
      const name = field?.options[field.selectedIndex]?.text.trim() ?? "condition";
      drop.setAttribute("aria-label", `Remove the ${name} condition`);
      drop.textContent = "Remove";
      drop.addEventListener("click", () => {
        if (rowsOf().length === 1) { live.textContent = "The last condition cannot be removed"; return; }
        const others = rowsOf().filter((one) => one !== row);
        const was = boxesOf(others);
        const back = row.previousElementSibling ?? row.nextElementSibling;
        row.remove();
        flipAll(was, span);
        back?.querySelector("button, select, input")?.focus();
        live.textContent = `Condition removed. ${describe()}`;
        onChange?.(describe(), root);
      });
      row.appendChild(drop);
    };

    rowsOf().forEach((row) => { row.classList.add("rm-query-bar-row"); addRemove(row); });

    const add = document.createElement("button");
    add.type = "button";
    add.className = "rm-query-bar-add";
    add.textContent = addLabel;
    add.addEventListener("click", () => {
      const was = boxesOf(rowsOf());
      const row = first.cloneNode(true);
      rename(row);
      row.querySelectorAll("input").forEach((input) => { input.value = ""; });
      row.querySelectorAll("select").forEach((select) => { select.selectedIndex = 0; });
      row.querySelector(".rm-query-bar-remove")?.remove();
      list.appendChild(row);
      addRemove(row);
      flipAll(was, span);
      if (!prefersReducedMotion()) {
        row.animate([{ opacity: 0, transform: "translateY(-8px)" }, { opacity: 1, transform: "none" }],
          { duration: span, easing: EASE.out });
      }
      row.querySelector("select, input")?.focus();
      live.textContent = `Condition added. ${describe()}`;
      onChange?.(describe(), root);
    });
    root.appendChild(add);

    const onEdit = () => { live.textContent = describe(); onChange?.(describe(), root); };
    list.addEventListener("change", onEdit);
    describe();

    cleanups.push(() => {
      list.removeEventListener("change", onEdit);
      rowsOf().forEach((row) => {
        row.classList.remove("rm-query-bar-row");
        row.querySelector(".rm-query-bar-remove")?.remove();
      });
      add.remove();
      summary.remove();
      live.remove();
      list.classList.remove("rm-query-bar-list");
      root.classList.remove("rm-query-bar");
      root.removeAttribute("role");
      root.removeAttribute("aria-label");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A shortcut sheet that reads the bindings the page actually declares.
 *
 * The list is built at open time from every element carrying
 * `data-rm-binding`, using that element's own accessible name as the
 * description. A hand-written sheet is a second copy of the truth and it starts
 * drifting the first time somebody changes a binding and forgets the help
 * screen — which is the same week, every time.
 *
 * It is a real modal: the page behind it is `inert`, Tab cannot walk out of it,
 * Escape closes it, and focus goes back to whatever opened it. The hotkey is
 * ignored while you are typing, because a console with a single-key shortcut
 * that fires inside a search box is a console you cannot search in.
 *
 *   <div data-rm-keyboard-map hidden></div>
 *   <button type="button" data-rm-binding="g o" data-rm-group="Go to">Orders</button>
 */
export function keyboardMap(target = "[data-rm-keyboard-map]", options = {}) {
  const sheets = resolveElements(target);
  if (!sheets.length) return () => {};

  const { label = "Keyboard shortcuts", hotkey = "?", source = "[data-rm-binding]" } = options;
  const cleanups = [];

  for (const sheet of sheets) {
    const key = dataString(sheet, "rmHotkey", hotkey);
    sheet.classList.add("rm-keyboard-map");
    sheet.setAttribute("role", "dialog");
    sheet.setAttribute("aria-modal", "true");
    sheet.setAttribute("aria-label", dataString(sheet, "rmLabel", label));
    // The documented markup for the sheet carries `hidden`, so revealing it on
    // unmount would drop an empty modal shell into the middle of the page.
    const sheetWasHidden = sheet.hidden;
    sheet.hidden = true;

    const guard = modal(sheet);

    const build = () => {
      sheet.replaceChildren();

      const head = document.createElement("h2");
      head.className = "rm-keyboard-map-title";
      head.textContent = dataString(sheet, "rmLabel", label);

      const shut = document.createElement("button");
      shut.type = "button";
      shut.className = "rm-keyboard-map-close";
      shut.setAttribute("aria-label", "Close the shortcut sheet");
      shut.textContent = "×";
      shut.addEventListener("click", () => sheet.rmClose());

      sheet.append(head, shut);

      const groups = new Map();
      for (const node of document.querySelectorAll(source)) {
        if (sheet.contains(node)) continue;
        const binding = dataString(node, "rmBinding", "");
        if (!binding) continue;
        const name = node.getAttribute("aria-label")
          ?? node.getAttribute("title")
          ?? node.textContent.trim();
        if (!name) continue;
        const where = dataString(node, "rmGroup", "General");
        if (!groups.has(where)) groups.set(where, []);
        groups.get(where).push({ binding, name });
      }

      if (!groups.size) {
        const none = document.createElement("p");
        none.className = "rm-keyboard-map-none";
        none.textContent = "This page declares no keyboard shortcuts.";
        sheet.appendChild(none);
        return;
      }

      for (const [where, items] of groups) {
        const section = document.createElement("section");
        section.className = "rm-keyboard-map-group";
        const title = document.createElement("h3");
        title.textContent = where;
        const rows = document.createElement("dl");
        for (const { binding, name } of items) {
          const term = document.createElement("dt");
          term.textContent = name;
          const keys = document.createElement("dd");
          // Split on spaces so "g o" renders as two keys pressed in sequence
          // and "ctrl+k" renders as one chord.
          binding.split(/\s+/).forEach((one, i) => {
            if (i) keys.appendChild(document.createTextNode(" then "));
            const kbd = document.createElement("kbd");
            kbd.textContent = one;
            keys.appendChild(kbd);
          });
          rows.append(term, keys);
        }
        section.append(title, rows);
        sheet.appendChild(section);
      }
    };

    sheet.rmOpen = () => {
      if (!sheet.hidden) return;
      build();
      sheet.hidden = false;
      guard.open(sheet.querySelector(".rm-keyboard-map-close"));
      if (!prefersReducedMotion()) {
        sheet.animate(
          [{ opacity: 0, transform: "translateY(12px) scale(0.98)" }, { opacity: 1, transform: "none" }],
          { duration: 260, easing: EASE.out },
        );
      }
    };

    sheet.rmClose = () => {
      if (sheet.hidden) return;
      const done = () => { sheet.hidden = true; };
      guard.close();
      if (prefersReducedMotion()) done();
      else {
        sheet.animate(
          [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(12px) scale(0.98)" }],
          { duration: 180, easing: EASE.inOut, fill: "forwards" },
        ).finished.then(done, done);
      }
    };

    const typing = (node) => node instanceof HTMLElement
      && (/^(INPUT|TEXTAREA|SELECT)$/.test(node.tagName) || node.isContentEditable);

    const onKey = (event) => {
      if (event.key === "Escape" && !sheet.hidden) { event.preventDefault(); sheet.rmClose(); return; }
      if (event.key !== key || event.ctrlKey || event.metaKey || event.altKey) return;
      if (typing(document.activeElement)) return;
      event.preventDefault();
      if (sheet.hidden) sheet.rmOpen(); else sheet.rmClose();
    };
    document.addEventListener("keydown", onKey);

    cleanups.push(() => {
      document.removeEventListener("keydown", onKey);
      guard.release();
      delete sheet.rmOpen;
      delete sheet.rmClose;
      sheet.replaceChildren();
      sheet.hidden = sheetWasHidden;
      sheet.classList.remove("rm-keyboard-map");
      sheet.removeAttribute("role");
      sheet.removeAttribute("aria-modal");
      sheet.removeAttribute("aria-label");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Lines arriving that do not fight you when you have scrolled up.
 *
 * The whole component is one rule: follow the tail only while the viewer is
 * already at the tail. Scroll up to read something and the stream stops moving,
 * a real button appears saying how many lines have arrived since, and pressing
 * it takes you back down and re-attaches. Every log viewer that scrolls to the
 * bottom unconditionally is unusable the moment anything is actually happening.
 *
 * The subtle half is trimming. When the oldest lines are dropped to keep the
 * buffer bounded, the content above the viewport shrinks and the browser
 * silently drags the scroll position with it — so the line you were reading
 * walks up the screen. The height removed is measured and subtracted from
 * `scrollTop`, which holds it exactly still.
 *
 * `role="log"` with `aria-live="off"` by default, on purpose: a thousand lines
 * a minute in a live region is not accessibility, it is a denial of service.
 *
 *   <div data-rm-log-stream data-rm-max="500"><ol></ol></div>
 */
export function logStream(target = "[data-rm-log-stream]", options = {}) {
  const roots = resolveElements(target);
  if (!roots.length) return () => {};

  const { max = 500, threshold = 24, announce = false, label = "Log" } = options;
  const cleanups = [];

  for (const root of roots) {
    let list = root.querySelector("ol, ul");
    const ownList = !list;
    if (ownList) {
      list = document.createElement("ol");
      root.appendChild(list);
    }

    const limit = Math.max(20, dataNumber(root, "rmMax", max));
    const slack = dataNumber(root, "rmThreshold", threshold);
    const speak = dataString(root, "rmAnnounce", announce ? "polite" : "off");

    root.classList.add("rm-log-stream");
    root.setAttribute("role", "log");
    root.setAttribute("tabindex", "0");
    // The container is `aria-live="off"` whatever `data-rm-announce` says, and
    // the explicit off is not redundant: `role="log"` carries an implicit
    // polite live region, so without this every appended line is queued for
    // speech. `data-rm-announce="polite"` does not change that — it gates the
    // component's own announcer below, which speaks errors and nothing else.
    root.setAttribute("aria-live", "off");
    root.setAttribute("aria-label", dataString(root, "rmLabel", label));
    list.classList.add("rm-log-stream-list");

    const jump = document.createElement("button");
    jump.type = "button";
    jump.className = "rm-log-stream-jump";
    jump.hidden = true;
    root.appendChild(jump);

    const live = announcer(root);
    let stuck = true;
    let pending = 0;

    const atTail = () => root.scrollHeight - root.scrollTop - root.clientHeight <= slack;

    const showJump = () => {
      jump.textContent = `${pending} new line${pending === 1 ? "" : "s"} — jump to latest`;
      if (jump.hidden) {
        jump.hidden = false;
        if (!prefersReducedMotion()) {
          jump.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }],
            { duration: 220, easing: EASE.out });
        }
      }
    };

    const toTail = () => {
      root.scrollTop = root.scrollHeight;
      pending = 0;
      stuck = true;
      jump.hidden = true;
    };
    jump.addEventListener("click", () => { toTail(); root.focus(); });

    const onScroll = () => {
      stuck = atTail();
      if (stuck && pending) { pending = 0; jump.hidden = true; }
    };
    root.addEventListener("scroll", onScroll, { passive: true });

    /** Append one line. `level` is a word as well as a colour. */
    root.rmAppend = (text, { level = "info", at = new Date() } = {}) => {
      const line = document.createElement("li");
      line.className = `rm-log-stream-line is-${level}`;
      const when = document.createElement("time");
      when.dateTime = at.toISOString();
      when.textContent = at.toTimeString().slice(0, 8);
      const tag = document.createElement("span");
      tag.className = "rm-log-stream-level";
      tag.textContent = level;
      const body = document.createElement("span");
      body.className = "rm-log-stream-text";
      body.textContent = text;
      line.append(when, tag, body);
      list.appendChild(line);

      // Trim from the top, then put the scroll position back where it was.
      let removed = 0;
      while (list.children.length > limit) {
        const old = list.firstElementChild;
        removed += old.getBoundingClientRect().height;
        old.remove();
      }
      if (removed && !stuck) root.scrollTop = Math.max(0, root.scrollTop - removed);

      if (stuck) {
        root.scrollTop = root.scrollHeight;
        if (!prefersReducedMotion()) {
          line.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, easing: EASE.out });
        }
      } else {
        pending += 1;
        showJump();
      }
      if (speak !== "off" && level === "error") live.textContent = `Error: ${text}`;
      return line;
    };

    /** Empty the buffer without losing the viewer's place in the world. */
    root.rmClear = () => {
      list.replaceChildren();
      pending = 0;
      stuck = true;
      jump.hidden = true;
      live.textContent = "Log cleared";
    };

    cleanups.push(() => {
      root.removeEventListener("scroll", onScroll);
      delete root.rmAppend;
      delete root.rmClear;
      jump.remove();
      live.remove();
      if (ownList) list.remove();
      else list.classList.remove("rm-log-stream-list");
      root.classList.remove("rm-log-stream");
      root.removeAttribute("role");
      root.removeAttribute("tabindex");
      root.removeAttribute("aria-live");
      root.removeAttribute("aria-label");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * One figure, its delta in words, rolled on arrival.
 *
 * The number is in the markup and stays there — the roll is a decoration over
 * the top of it. The drawn face is `aria-hidden` and the real value sits in a
 * visually hidden span, so a screen reader is told "1,284 orders" once rather
 * than being read a stream of intermediate numbers as they tick past, which is
 * what happens when the live element is the one being animated.
 *
 * The delta is written out: "up 12.4% on last week", not a green triangle. A
 * triangle is a shape whose meaning is a colour convention, and the convention
 * is not the same everywhere — in several markets a red arrow up is good news.
 *
 * The roll runs on the shared frame loop and only while the tile is on screen,
 * so a dashboard of forty tiles costs one rAF and no work for the thirty-two
 * below the fold.
 *
 *   <article data-rm-metric-tile data-rm-delta="12.4"><strong>1,284</strong></article>
 */
export function metricTile(target = "[data-rm-metric-tile]", options = {}) {
  const tiles = resolveElements(target);
  if (!tiles.length) return () => {};

  const { figure = "strong", duration = 900, locale = undefined } = options;
  const cleanups = [];

  for (const tile of tiles) {
    const face = tile.querySelector(figure);
    if (!face) continue;

    tile.classList.add("rm-metric-tile");
    const span = dataNumber(tile, "rmDuration", duration);
    const raw = face.textContent.trim();

    // Group separators out, the first dot kept as the decimal point. Anything
    // that is not a plain number after that is left exactly as the author
    // wrote it and simply does not roll.
    const match = raw.match(/-?\d[\d., \s]*/);
    const cleaned = match ? match[0].replace(/[\s, ]/g, "") : "";
    const value = Number(cleaned);
    const decimals = cleaned.includes(".") ? cleaned.split(".")[1].length : 0;
    const prefix = match ? raw.slice(0, match.index) : "";
    const suffix = match ? raw.slice(match.index + match[0].length) : "";

    const spoken = said(raw);
    let stopRoll = () => {};

    if (Number.isFinite(value) && match) {
      face.setAttribute("aria-hidden", "true");
      face.after(spoken);

      const format = (at) => {
        const text = new Intl.NumberFormat(locale, {
          minimumFractionDigits: decimals, maximumFractionDigits: decimals,
        }).format(at);
        face.textContent = `${prefix}${text}${suffix}`;
      };

      if (prefersReducedMotion()) {
        face.textContent = raw;
      } else {
        stopRoll = whileVisible(tile, () => {
          const from = dataNumber(tile, "rmFrom", 0);
          const started = performance.now();
          let done = false;
          const stop = onFrame((now) => {
            if (done) return;
            const t = clamp((now - started) / span, 0, 1);
            // Ease out: the number settles rather than stopping dead.
            const eased = 1 - ((1 - t) ** 3);
            format(from + ((value - from) * eased));
            if (t >= 1) { done = true; face.textContent = raw; stop(); }
          });
          return stop;
        });
      }
    }

    // The change, written down.
    const delta = dataNumber(tile, "rmDelta", NaN);
    let note = null;
    if (Number.isFinite(delta)) {
      note = document.createElement("p");
      const direction = delta > 0 ? "up" : delta < 0 ? "down" : "level";
      note.className = `rm-metric-tile-delta is-${direction}`;
      const about = dataString(tile, "rmAbout", "on the previous period");
      note.textContent = delta === 0
        ? `No change ${about}`
        : `${direction === "up" ? "Up" : "Down"} ${Math.abs(delta)}% ${about}`;
      tile.appendChild(note);
    }

    cleanups.push(() => {
      stopRoll();
      spoken.remove();
      note?.remove();
      face.removeAttribute("aria-hidden");
      face.textContent = raw;
      tile.classList.remove("rm-metric-tile");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Many services at a glance, each with a word as well as a colour.
 *
 * The status board is the canonical place colour is used as the only signal,
 * and the canonical place that fails: red and green are the commonest pair of
 * colours people cannot tell apart, and a wall of fifty dots is exactly the
 * situation where you need to be sure. So every tile states its condition —
 * operational, degraded, outage, unknown — and the colour is the second copy.
 *
 * A summary line above the grid counts the states, politely for good news and
 * assertively when something is actually down, which is the one case worth
 * interrupting somebody for.
 *
 * With `data-rm-sort="worst"` a service that fails moves to the front, and the
 * tiles that shift do it with a FLIP so you can see which one moved and where
 * it came from. A grid that silently reorders itself is a grid you have to
 * re-read from the top.
 *
 *   <ul data-rm-health-grid data-rm-sort="worst"><li data-rm-state="up">API</li></ul>
 */
export function healthGrid(target = "[data-rm-health-grid]", options = {}) {
  const grids = resolveElements(target);
  if (!grids.length) return () => {};

  const { label = "Service health", duration = 340, sort = "none" } = options;
  const WORDS = { up: "operational", degraded: "degraded", down: "outage", unknown: "unknown" };
  const RANK = { down: 0, degraded: 1, unknown: 2, up: 3 };
  const cleanups = [];

  for (const grid of grids) {
    const items = [...grid.children];
    if (!items.length) continue;

    grid.classList.add("rm-health-grid");
    grid.setAttribute("role", "list");
    grid.setAttribute("aria-label", dataString(grid, "rmLabel", label));
    const span = dataNumber(grid, "rmDuration", duration);
    const order = dataString(grid, "rmSort", sort);

    const live = announcer(grid);
    const summary = document.createElement("p");
    summary.className = "rm-health-grid-summary";
    grid.parentNode?.insertBefore(summary, grid);

    const dressed = new Map();
    const dress = (item) => {
      const state = dataString(item, "rmState", "unknown");
      const name = item.getAttribute("data-rm-name") ?? item.firstChild?.textContent?.trim() ?? "";
      let parts = dressed.get(item);
      if (!parts) {
        const dot = document.createElement("i");
        dot.className = "rm-health-grid-dot";
        dot.setAttribute("aria-hidden", "true");
        const word = document.createElement("span");
        word.className = "rm-health-grid-word";
        item.prepend(dot);
        item.appendChild(word);
        parts = { dot, word, name };
        dressed.set(item, parts);
      }
      item.classList.add("rm-health-grid-item");
      [...Object.keys(WORDS)].forEach((one) => item.classList.toggle(`is-${one}`, one === state));
      parts.word.textContent = WORDS[state] ?? state;
      return state;
    };

    const tally = () => {
      const counts = { up: 0, degraded: 0, down: 0, unknown: 0 };
      items.forEach((item) => { counts[dataString(item, "rmState", "unknown")] += 1; });
      const bits = [];
      if (counts.up) bits.push(`${counts.up} operational`);
      if (counts.degraded) bits.push(`${counts.degraded} degraded`);
      if (counts.down) bits.push(`${counts.down} in outage`);
      if (counts.unknown) bits.push(`${counts.unknown} unknown`);
      summary.textContent = `${items.length} services: ${bits.join(", ")}`;
      return counts;
    };

    const arrange = () => {
      if (order !== "worst") return;
      const was = boxesOf(items);
      [...items]
        .sort((a, b) => (RANK[dataString(a, "rmState", "unknown")] ?? 9)
          - (RANK[dataString(b, "rmState", "unknown")] ?? 9))
        .forEach((item) => grid.appendChild(item));
      flipAll(was, span);
    };

    items.forEach(dress);
    tally();
    arrange();

    /** Set one service's state by name, and say so. */
    grid.rmSet = (name, state) => {
      const item = items.find((one) => dressed.get(one)?.name === name);
      if (!item) return;
      item.setAttribute("data-rm-state", state);
      dress(item);
      arrange();
      const counts = tally();
      const urgent = state === "down";
      live.setAttribute("aria-live", urgent ? "assertive" : "polite");
      live.setAttribute("role", urgent ? "alert" : "status");
      live.textContent = `${name} is ${WORDS[state] ?? state}. ${counts.down} in outage.`;
    };

    cleanups.push(() => {
      delete grid.rmSet;
      // `arrange()` re-sorted the author's children in the document. `items`
      // was captured in source order at mount, so replaying it puts the
      // document back the way it was found — otherwise unmounting leaves the
      // page permanently in this component's sort order.
      items.forEach((item) => grid.appendChild(item));
      dressed.forEach(({ dot, word }) => { dot.remove(); word.remove(); });
      items.forEach((item) => {
        item.classList.remove("rm-health-grid-item", ...Object.keys(WORDS).map((one) => `is-${one}`));
      });
      summary.remove();
      live.remove();
      grid.classList.remove("rm-health-grid");
      grid.removeAttribute("role");
      grid.removeAttribute("aria-label");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Who did what to which thing, and how long ago.
 *
 * The time is the whole problem with an audit log. "2 hours ago" is what you
 * want to read and useless for anything else; a timestamp is what you want to
 * copy into a ticket and impossible to scan. So the machine-readable value
 * stays in `<time datetime>` where a parser can reach it, the absolute time
 * goes into `title` for the pointer *and* into a focusable note wired with
 * `aria-describedby` — `title` on its own does not exist for a keyboard — and
 * the visible text becomes relative and refreshes itself.
 *
 * It refreshes only while the row is on screen. An audit page is a thousand
 * rows long, and a thousand timers rewriting text in a document nobody is
 * looking at is a fan spinning up for nothing.
 *
 * A row that has just arrived flashes its background — a colour change, so no
 * layout is touched and the row beneath it does not move a pixel.
 *
 *   <li data-rm-audit-row data-rm-level="warning">…<time datetime="…">…</time></li>
 */
export function auditRow(target = "[data-rm-audit-row]", options = {}) {
  const rows = resolveElements(target);
  if (!rows.length) return () => {};

  const { locale = undefined, every = 30000, level = "info" } = options;
  const UNITS = [
    [60, "second", 1],
    [3600, "minute", 60],
    [86400, "hour", 3600],
    [2592000, "day", 86400],
  ];
  const cleanups = [];

  for (const row of rows) {
    // `kind` is read from the author's own attribute and only wanted for the
    // class, so it is not written back. Echoing it looks tidy and turns the
    // cleanup into vandalism: removing an attribute the author wrote means a
    // mount/unmount cycle silently deletes `data-rm-level="danger"` from the
    // markup, and the next mount reads the default and draws the wrong rule.
    const kind = dataString(row, "rmLevel", level);
    row.classList.add("rm-audit-row", `is-${kind}`);

    const stamp = row.querySelector("time[datetime]");
    const was = stamp?.textContent ?? "";
    const hadTitle = stamp?.getAttribute("title") ?? null;
    let stopClock = () => {};
    let releaseNote = () => {};

    if (stamp) {
      const at = new Date(stamp.getAttribute("datetime"));
      if (!Number.isNaN(at.valueOf())) {
        const absolute = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "medium" }).format(at);
        stamp.setAttribute("title", absolute);
        stamp.classList.add("rm-audit-row-time");

        /*
         * `title` alone is a mouse-only affordance, and this component was
         * guilty of exactly the failure roleBadge refuses two screens down:
         * the absolute timestamp the doc promises "can be hovered and copied"
         * did not exist at all for a keyboard operator, while `cursor: help`
         * advertised an affordance they had no way of using.
         *
         * So the title stays for the pointer, and the same string is also a
         * real note: the `<time>` becomes focusable, `aria-describedby` points
         * at the note so the value is read out as part of the element, and the
         * note opens on `focusin` as well as `pointerenter`. Escape closes it,
         * because a note that only closes when focus leaves is a note you
         * cannot dismiss while reading the row it belongs to.
         */
        const note = document.createElement("span");
        note.className = "rm-audit-row-note";
        note.id = uid("rm-audit");
        note.setAttribute("role", "note");
        note.textContent = absolute;
        note.hidden = true;

        const hadTab = stamp.getAttribute("tabindex");
        const hadDescribed = stamp.getAttribute("aria-describedby");
        stamp.setAttribute("tabindex", "0");
        stamp.setAttribute("aria-describedby", note.id);
        stamp.after(note);

        const openNote = () => {
          if (!note.hidden) return;
          note.hidden = false;
          if (prefersReducedMotion()) return;
          note.animate(
            [{ opacity: 0, transform: "translateY(-4px)" }, { opacity: 1, transform: "none" }],
            { duration: 160, easing: EASE.out },
          );
        };
        const shutNote = () => { note.hidden = true; };
        const onNoteKey = (event) => { if (event.key === "Escape") shutNote(); };

        stamp.addEventListener("pointerenter", openNote);
        stamp.addEventListener("pointerleave", shutNote);
        stamp.addEventListener("focusin", openNote);
        stamp.addEventListener("focusout", shutNote);
        stamp.addEventListener("keydown", onNoteKey);

        releaseNote = () => {
          stamp.removeEventListener("pointerenter", openNote);
          stamp.removeEventListener("pointerleave", shutNote);
          stamp.removeEventListener("focusin", openNote);
          stamp.removeEventListener("focusout", shutNote);
          stamp.removeEventListener("keydown", onNoteKey);
          note.remove();
          if (hadTab === null) stamp.removeAttribute("tabindex");
          else stamp.setAttribute("tabindex", hadTab);
          if (hadDescribed === null) stamp.removeAttribute("aria-describedby");
          else stamp.setAttribute("aria-describedby", hadDescribed);
        };

        const relative = () => {
          const seconds = Math.round((Date.now() - at.valueOf()) / 1000);
          if (seconds < 5) return "just now";
          const unit = UNITS.find(([bound]) => seconds < bound) ?? [0, "month", 2592000];
          const amount = Math.floor(seconds / unit[2]);
          return `${amount} ${unit[1]}${amount === 1 ? "" : "s"} ago`;
        };

        stamp.textContent = relative();
        stopClock = whileVisible(row, () => {
          const timer = setInterval(() => { stamp.textContent = relative(); }, every);
          return () => clearInterval(timer);
        });
      }
    }

    /** Mark this row as newly arrived. Colour only — nothing moves. */
    row.rmFlash = () => {
      if (prefersReducedMotion()) return;
      row.animate(
        [{ backgroundColor: "color-mix(in srgb, var(--rm-yellow) 38%, transparent)" },
          { backgroundColor: "transparent" }],
        { duration: 1400, easing: EASE.out },
      );
    };

    cleanups.push(() => {
      stopClock();
      releaseNote();
      delete row.rmFlash;
      if (stamp) {
        stamp.textContent = was;
        stamp.classList.remove("rm-audit-row-time");
        if (hadTitle) stamp.setAttribute("title", hadTitle); else stamp.removeAttribute("title");
      }
      row.classList.remove("rm-audit-row", `is-${kind}`);
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A guarded control: production asks first, and reverts if you say no.
 *
 * The ordering is the entire point. The usual guard fires the change, then puts
 * up a dialog, and if you cancel it tries to put the control back — by which
 * time the app has already switched environment, a request has gone out, and
 * the select is showing something that is not true. Here the change is caught,
 * the previous value is restored immediately, and only a confirmed answer
 * applies the new one.
 *
 * Confirmation is a typed name rather than an OK button, because an OK button
 * on a dialog you have seen forty times is a button you press without reading.
 * Typing "production" cannot be done by reflex. The dialog is a real
 * `alertdialog` with the page inert behind it, Escape cancels, and focus goes
 * back to the control either way.
 *
 *   <div data-rm-env-switch data-rm-guard="production"><select>…</select></div>
 */
export function envSwitch(target = "[data-rm-env-switch]", options = {}) {
  const roots = resolveElements(target);
  if (!roots.length) return () => {};

  const { guarded = "production", label = "Environment", onChange } = options;
  const cleanups = [];

  for (const root of roots) {
    const select = root.querySelector("select");
    if (!select) continue;

    root.classList.add("rm-env-switch");
    select.classList.add("rm-env-switch-select");
    // A name is only invented when the author has not provided one — and it is
    // remembered as ours, because an `aria-label` this component left behind
    // outlives it and then beats any real `<label>` the author adds later.
    const namedByUs = !select.getAttribute("aria-label")
      && !(select.id && root.querySelector(`label[for="${select.id}"]`));
    if (namedByUs) {
      select.setAttribute("aria-label", dataString(root, "rmLabel", label));
    }

    const needsAsking = dataString(root, "rmGuard", guarded)
      .split(",").map((one) => one.trim().toLowerCase()).filter(Boolean);

    const sheet = document.createElement("div");
    sheet.className = "rm-env-switch-sheet";
    sheet.setAttribute("role", "alertdialog");
    sheet.setAttribute("aria-modal", "true");
    sheet.hidden = true;
    root.appendChild(sheet);

    const live = announcer(root);
    const guard = modal(sheet);
    let previous = select.value;
    let asking = false;

    const stamp = () => {
      const chosen = select.options[select.selectedIndex];
      const word = (chosen?.value ?? "").toLowerCase();
      root.setAttribute("data-rm-env-current", word);
      root.classList.toggle("is-guarded", needsAsking.includes(word));
    };
    stamp();

    const shut = () => {
      if (sheet.hidden) return;
      sheet.hidden = true;
      sheet.replaceChildren();
      guard.close();
      asking = false;
    };

    const ask = (value, name) => {
      asking = true;
      sheet.replaceChildren();

      const title = document.createElement("h2");
      title.id = uid("rm-env");
      title.textContent = `Switch to ${name}?`;
      sheet.setAttribute("aria-labelledby", title.id);

      const warn = document.createElement("p");
      warn.id = uid("rm-env");
      warn.textContent = `Anything you do next affects ${name}. Type ${name} to confirm.`;
      sheet.setAttribute("aria-describedby", warn.id);

      const field = document.createElement("input");
      field.type = "text";
      field.className = "rm-env-switch-field";
      field.autocomplete = "off";
      field.setAttribute("aria-label", `Type ${name} to confirm`);

      const row = document.createElement("div");
      row.className = "rm-env-switch-row";

      const cancel = document.createElement("button");
      cancel.type = "button";
      cancel.className = "rm-env-switch-no";
      cancel.textContent = "Stay where I am";

      const go = document.createElement("button");
      go.type = "button";
      go.className = "rm-env-switch-yes";
      go.textContent = `Switch to ${name}`;
      go.disabled = true;

      field.addEventListener("input", () => {
        go.disabled = field.value.trim().toLowerCase() !== name.toLowerCase();
      });

      cancel.addEventListener("click", () => {
        shut();
        live.textContent = `Still on ${select.options[select.selectedIndex]?.text ?? previous}`;
        select.focus();
      });

      go.addEventListener("click", () => {
        select.value = value;
        previous = value;
        stamp();
        shut();
        live.setAttribute("aria-live", "assertive");
        live.setAttribute("role", "alert");
        live.textContent = `Now on ${name}`;
        select.focus();
        onChange?.(value, select);
      });

      row.append(cancel, go);
      sheet.append(title, warn, field, row);
      sheet.hidden = false;
      // The safe answer is where focus lands, and the destructive one is
      // disabled until something deliberate has been typed.
      guard.open(cancel);
      if (!prefersReducedMotion()) {
        sheet.animate(
          [{ opacity: 0, transform: "scale(0.97)" }, { opacity: 1, transform: "none" }],
          { duration: 220, easing: EASE.out },
        );
      }
    };

    const onSelect = () => {
      if (asking) return;
      const chosen = select.options[select.selectedIndex];
      const value = select.value;
      const word = value.toLowerCase();
      if (!needsAsking.includes(word)) {
        previous = value;
        stamp();
        live.setAttribute("aria-live", "polite");
        live.setAttribute("role", "status");
        live.textContent = `Now on ${chosen?.text ?? value}`;
        onChange?.(value, select);
        return;
      }
      // Put it back before asking. The control must never show a state the
      // application is not actually in.
      select.value = previous;
      stamp();
      ask(value, chosen?.text?.trim() ?? value);
    };

    const onKey = (event) => {
      if (event.key === "Escape" && !sheet.hidden) {
        event.preventDefault();
        shut();
        select.focus();
      }
    };

    select.addEventListener("change", onSelect);
    root.addEventListener("keydown", onKey);

    cleanups.push(() => {
      select.removeEventListener("change", onSelect);
      root.removeEventListener("keydown", onKey);
      guard.release();
      sheet.remove();
      live.remove();
      select.classList.remove("rm-env-switch-select");
      if (namedByUs) select.removeAttribute("aria-label");
      root.classList.remove("rm-env-switch", "is-guarded");
      root.removeAttribute("data-rm-env-current");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A role, with what it may do, on hover and on focus.
 *
 * "Editor" tells nobody anything useful on its own, so the badge carries the
 * permissions behind it. The catch is that the usual version shows them on
 * hover, which means the information does not exist for anybody using a
 * keyboard, a screen reader or a touch screen — three audiences, one of which
 * is most of them.
 *
 * So the badge is a `<button type="button">` when it has something to say, the
 * panel opens on focus as well as hover, `aria-expanded` reports the state, the
 * panel is wired with `aria-describedby`, and Escape closes it. The panel is
 * positioned out of the flow so a table of forty people does not reflow when
 * one badge is reached.
 *
 *   <span data-rm-role-badge="editor" data-rm-about="Can edit and publish">Editor</span>
 */
export function roleBadge(target = "[data-rm-role-badge]", options = {}) {
  const badges = resolveElements(target);
  if (!badges.length) return () => {};

  const { tone = "neutral" } = options;
  const TONES = { owner: "owner", admin: "admin", editor: "editor", viewer: "viewer", billing: "billing" };
  const cleanups = [];

  for (const badge of badges) {
    const kind = dataString(badge, "rmRoleBadge", tone);
    const about = dataString(badge, "rmAbout", "");
    badge.classList.add("rm-role-badge", `is-${TONES[kind] ?? "neutral"}`);

    if (!about) {
      cleanups.push(() => badge.classList.remove("rm-role-badge", `is-${TONES[kind] ?? "neutral"}`));
      continue;
    }

    const word = badge.textContent.trim();
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "rm-role-badge-trigger";
    trigger.textContent = word;
    trigger.setAttribute("aria-expanded", "false");

    const panel = document.createElement("span");
    panel.className = "rm-role-badge-panel";
    panel.id = uid("rm-role");
    panel.setAttribute("role", "note");
    panel.textContent = about;
    panel.hidden = true;
    trigger.setAttribute("aria-describedby", panel.id);

    badge.replaceChildren(trigger, panel);

    const open = () => {
      if (!panel.hidden) return;
      panel.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      if (prefersReducedMotion()) return;
      panel.animate([{ opacity: 0, transform: "translateY(-4px)" }, { opacity: 1, transform: "none" }],
        { duration: 180, easing: EASE.out });
    };
    const shut = () => {
      if (panel.hidden) return;
      panel.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
    };
    const flip2 = () => (panel.hidden ? open() : shut());
    const onKey = (event) => { if (event.key === "Escape") { shut(); trigger.focus(); } };
    const onLeave = (event) => { if (!badge.contains(event.relatedTarget)) shut(); };

    trigger.addEventListener("click", flip2);
    badge.addEventListener("pointerenter", open);
    badge.addEventListener("pointerleave", shut);
    badge.addEventListener("focusin", open);
    badge.addEventListener("focusout", onLeave);
    badge.addEventListener("keydown", onKey);

    cleanups.push(() => {
      trigger.removeEventListener("click", flip2);
      badge.removeEventListener("pointerenter", open);
      badge.removeEventListener("pointerleave", shut);
      badge.removeEventListener("focusin", open);
      badge.removeEventListener("focusout", onLeave);
      badge.removeEventListener("keydown", onKey);
      badge.textContent = word;
      badge.classList.remove("rm-role-badge", `is-${TONES[kind] ?? "neutral"}`);
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Usage against a limit, with the thresholds named out loud.
 *
 * A bar is a rectangle. What somebody actually needs to know is "820 of 1,000
 * API calls — 82%, approaching the limit", and that sentence is what goes into
 * `aria-valuetext`, because `aria-valuenow="82"` on its own is read as a bare
 * number with no unit and no judgement attached to it.
 *
 * The three bands each have a name as well as a colour, and crossing into the
 * last one is announced assertively — running out of quota is one of the few
 * things in a console worth interrupting somebody for. Crossing back down is
 * polite. The fill is `scaleX` from the left on a full-width track, so nothing
 * in the row it sits in is re-laid-out as the number moves.
 *
 *   <div data-rm-quota-meter data-rm-used="820" data-rm-limit="1000" data-rm-unit="API calls"></div>
 */
export function quotaMeter(target = "[data-rm-quota-meter]", options = {}) {
  const meters = resolveElements(target);
  if (!meters.length) return () => {};

  const {
    unit = "units", used = 0, limit: ceiling = 100,
    warn = 75, critical = 90, duration = 520, locale = undefined,
  } = options;
  const cleanups = [];

  for (const meter of meters) {
    // The ceiling was hard-coded at 100 here, which made `data-rm-limit` the
    // only way to state it and left a caller configuring the component from
    // JavaScript with no way to say what the allowance actually is.
    const limit = Math.max(1, dataNumber(meter, "rmLimit", ceiling));
    const noun = dataString(meter, "rmUnit", unit);
    const near = dataNumber(meter, "rmWarn", warn);
    const over = dataNumber(meter, "rmCritical", critical);
    const span = dataNumber(meter, "rmDuration", duration);

    meter.classList.add("rm-quota-meter");

    const track = document.createElement("div");
    track.className = "rm-quota-meter-track";
    track.setAttribute("role", "progressbar");
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", "100");
    const fill = document.createElement("i");
    fill.className = "rm-quota-meter-fill";
    track.appendChild(fill);

    const words = document.createElement("p");
    words.className = "rm-quota-meter-words";

    const live = announcer(meter);
    meter.append(track, words);

    const format = (value) => new Intl.NumberFormat(locale).format(Math.round(value));
    let band = "";

    const draw = (used) => {
      const share = clamp((used / limit) * 100, 0, 100);
      const state = share >= over ? "critical" : share >= near ? "warning" : "steady";
      const judgement = state === "critical" ? "over the safe limit"
        : state === "warning" ? "approaching the limit" : "within the limit";
      const sentence = `${format(used)} of ${format(limit)} ${noun} — ${Math.round(share)}%, ${judgement}`;

      meter.classList.remove("is-steady", "is-warning", "is-critical");
      meter.classList.add(`is-${state}`);
      words.textContent = sentence;
      track.setAttribute("aria-valuenow", String(Math.round(share)));
      track.setAttribute("aria-valuetext", sentence);
      track.setAttribute("aria-label", `${noun} used`);
      fill.style.setProperty("--rm-quota-fill", (share / 100).toFixed(4));
      fill.style.setProperty("--rm-quota-duration", `${prefersReducedMotion() ? 0 : span}ms`);

      if (state !== band) {
        const urgent = state === "critical";
        live.setAttribute("aria-live", urgent ? "assertive" : "polite");
        live.setAttribute("role", urgent ? "alert" : "status");
        if (band) live.textContent = sentence;
        band = state;
      }
    };

    draw(dataNumber(meter, "rmUsed", used));

    /** Update the usage. The limit is fixed; only consumption moves. */
    meter.rmSet = (used) => draw(used);

    cleanups.push(() => {
      delete meter.rmSet;
      track.remove();
      words.remove();
      live.remove();
      meter.classList.remove("rm-quota-meter", "is-steady", "is-warning", "is-critical");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Running, queued and failed, with real progress on each.
 *
 * Every job carries a word for its state and a `role="progressbar"` with a real
 * `aria-valuenow` when there is a number to give, and no `aria-valuenow` at all
 * when there is not — an indeterminate bar reporting `aria-valuenow="0"` is
 * read as "0 percent", which is a lie about a job that is running fine.
 *
 * Jobs re-sort so the running ones are at the top and the failed ones are
 * impossible to miss, and the rows that move do it with a FLIP rather than
 * jumping, so you can follow a job from the queue into the running set. A
 * failure is announced assertively and offers a real retry button; everything
 * else is polite.
 *
 * Under reduced motion the indeterminate bar stops sweeping and simply sits
 * there, because the word beside it already says "running" — the sweep was
 * never carrying the meaning.
 *
 *   <ul data-rm-job-queue><li data-rm-state="running" data-rm-value="62">Rebuild index</li></ul>
 */
export function jobQueue(target = "[data-rm-job-queue]", options = {}) {
  const queues = resolveElements(target);
  if (!queues.length) return () => {};

  const { label = "Jobs", duration = 320, onRetry } = options;
  const WORDS = { running: "running", queued: "queued", failed: "failed", done: "finished" };
  const RANK = { failed: 0, running: 1, queued: 2, done: 3 };
  const cleanups = [];

  for (const queue of queues) {
    const jobs = [...queue.children];
    if (!jobs.length) continue;

    queue.classList.add("rm-job-queue");
    queue.setAttribute("role", "list");
    queue.setAttribute("aria-label", dataString(queue, "rmLabel", label));
    const span = dataNumber(queue, "rmDuration", duration);

    const live = announcer(queue);
    const summary = document.createElement("p");
    summary.className = "rm-job-queue-summary";
    queue.parentNode?.insertBefore(summary, queue);

    const parts = new Map();

    const dress = (job) => {
      const state = dataString(job, "rmState", "queued");
      const value = dataNumber(job, "rmValue", NaN);
      let kit = parts.get(job);
      if (!kit) {
        const name = job.textContent.trim();
        const word = document.createElement("span");
        word.className = "rm-job-queue-word";
        const track = document.createElement("span");
        track.className = "rm-job-queue-track";
        track.setAttribute("role", "progressbar");
        track.setAttribute("aria-label", `${name} progress`);
        track.setAttribute("aria-valuemin", "0");
        track.setAttribute("aria-valuemax", "100");
        const fill = document.createElement("i");
        fill.className = "rm-job-queue-fill";
        track.appendChild(fill);
        const retry = document.createElement("button");
        retry.type = "button";
        retry.className = "rm-job-queue-retry";
        retry.textContent = "Retry";
        retry.setAttribute("aria-label", `Retry ${name}`);
        retry.hidden = true;
        retry.addEventListener("click", () => onRetry?.(name, job));
        job.append(word, track, retry);
        kit = { word, track, fill, retry, name };
        parts.set(job, kit);
      }

      job.classList.add("rm-job-queue-job");
      Object.keys(WORDS).forEach((one) => job.classList.toggle(`is-${one}`, one === state));
      kit.word.textContent = WORDS[state] ?? state;
      kit.retry.hidden = state !== "failed";

      const known = Number.isFinite(value);
      const at = known ? clamp(value, 0, 100) : 0;
      kit.track.classList.toggle("is-indeterminate", !known && state === "running");
      kit.fill.style.setProperty("--rm-job-fill", known ? (at / 100).toFixed(4) : "0.35");
      if (known) {
        kit.track.setAttribute("aria-valuenow", String(Math.round(at)));
        kit.track.setAttribute("aria-valuetext", `${Math.round(at)}% complete`);
      } else {
        // No number to give, so none is claimed.
        kit.track.removeAttribute("aria-valuenow");
        kit.track.setAttribute("aria-valuetext", WORDS[state] ?? state);
      }
      return state;
    };

    const tally = () => {
      const counts = { running: 0, queued: 0, failed: 0, done: 0 };
      jobs.forEach((job) => { counts[dataString(job, "rmState", "queued")] += 1; });
      summary.textContent = `${counts.running} running, ${counts.queued} queued, `
        + `${counts.failed} failed, ${counts.done} finished`;
      return counts;
    };

    const arrange = () => {
      const was = boxesOf(jobs);
      [...jobs]
        .sort((a, b) => (RANK[dataString(a, "rmState", "queued")] ?? 9)
          - (RANK[dataString(b, "rmState", "queued")] ?? 9))
        .forEach((job) => queue.appendChild(job));
      flipAll(was, span);
    };

    jobs.forEach(dress);
    tally();
    arrange();

    /** Move a job on. Failures interrupt; everything else waits its turn. */
    queue.rmSet = (name, { state, value } = {}) => {
      const job = jobs.find((one) => parts.get(one)?.name === name);
      if (!job) return;
      if (state) job.setAttribute("data-rm-state", state);
      if (value !== undefined) job.setAttribute("data-rm-value", String(value));
      const now = dress(job);
      if (state) arrange();
      tally();
      const urgent = now === "failed";
      live.setAttribute("aria-live", urgent ? "assertive" : "polite");
      live.setAttribute("role", urgent ? "alert" : "status");
      live.textContent = `${name} ${WORDS[now] ?? now}`;
    };

    cleanups.push(() => {
      delete queue.rmSet;
      // The queue is sorted on mount and again on every `rmSet`, so the
      // document order almost certainly is not the author's any more. `jobs`
      // holds the source order; replaying it hands the markup back unsorted.
      jobs.forEach((job) => queue.appendChild(job));
      parts.forEach(({ word, track, retry }) => { word.remove(); track.remove(); retry.remove(); });
      jobs.forEach((job) => {
        job.classList.remove("rm-job-queue-job", ...Object.keys(WORDS).map((one) => `is-${one}`));
      });
      summary.remove();
      live.remove();
      queue.classList.remove("rm-job-queue");
      queue.removeAttribute("role");
      queue.removeAttribute("aria-label");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Before and after, with the kind of change written down.
 *
 * Every diff view in existence uses red and green and nothing else, and every
 * one of them is unreadable to the eight percent of men who cannot separate
 * those two colours — in a table whose entire content is the difference between
 * them. So each row states its change in a real cell: added, removed, changed,
 * unchanged. The colour stays, as the second signal it should always have been.
 *
 * The old value is struck through visually and prefixed "was" for a screen
 * reader, because `text-decoration: line-through` has no spoken equivalent at
 * all — a struck price is simply read as the price.
 *
 * Unchanged rows are hidden behind a real toggle with `aria-pressed`, and when
 * they appear the rows below FLIP into their new positions rather than the
 * table jumping by four hundred pixels.
 *
 *   <table data-rm-diff-table><tr data-rm-change="changed">…</tr></table>
 */
export function diffTable(target = "[data-rm-diff-table]", options = {}) {
  const tables = resolveElements(target);
  if (!tables.length) return () => {};

  const { label = "Changes", duration = 300, showUnchanged = false } = options;
  const WORDS = { added: "Added", removed: "Removed", changed: "Changed", same: "Unchanged" };
  const cleanups = [];

  for (const table of tables) {
    const rows = [...table.querySelectorAll("tbody tr")];
    if (!rows.length) continue;

    table.classList.add("rm-diff-table");
    table.setAttribute("aria-label", dataString(table, "rmLabel", label));
    const span = dataNumber(table, "rmDuration", duration);

    const live = announcer(table);
    const summary = document.createElement("p");
    summary.className = "rm-diff-table-summary";
    table.parentNode?.insertBefore(summary, table);

    const counts = { added: 0, removed: 0, changed: 0, same: 0 };
    const marks = [];
    const spokens = [];
    const kinds = new Map();

    rows.forEach((row) => {
      /*
       * Normalised once, at the top, and that one value drives the count, the
       * class, the word and the hiding alike.
       *
       * Feeding the raw attribute to the class while the count and the cell
       * fell back to "same" was the bug: `data-rm-change="modified"` was
       * tallied as unchanged, labelled "Unchanged", and given the class
       * `is-modified` — a class with no colour behind it and no entry in the
       * cleanup's removal list, so it also survived unmount.
       */
      const raw = dataString(row, "rmChange", "same");
      const change = raw in WORDS ? raw : "same";
      kinds.set(row, change);
      counts[change] += 1;
      row.classList.add("rm-diff-table-row", `is-${change}`);

      // The word, in a cell of its own, so it is part of the row rather than a
      // property of its background.
      const cell = document.createElement("td");
      cell.className = "rm-diff-table-mark";
      cell.textContent = WORDS[change];
      row.prepend(cell);
      marks.push(cell);

      const before = row.querySelector("[data-rm-before]");
      if (before && change === "changed") {
        before.classList.add("rm-diff-table-before");
        const spoken = said("was ");
        before.prepend(spoken);
        spokens.push(spoken);
      }
    });

    // The header needs a cell for the new column, or every row is one out.
    const headRow = table.querySelector("thead tr");
    let headCell = null;
    if (headRow) {
      headCell = document.createElement("th");
      headCell.scope = "col";
      headCell.className = "rm-diff-table-mark";
      headCell.textContent = "Change";
      headRow.prepend(headCell);
    }

    summary.textContent = `${rows.length} fields: ${counts.changed} changed, `
      + `${counts.added} added, ${counts.removed} removed, ${counts.same} unchanged`;

    let showing = dataString(table, "rmMode", showUnchanged ? "all" : "changed") === "all";
    const sames = rows.filter((row) => kinds.get(row) === "same");

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "rm-diff-table-toggle";
    summary.appendChild(toggle);

    const hiddenWas = new Map();
    const apply = (animated) => {
      const moving = rows.filter((row) => !sames.includes(row));
      const was = boxesOf(moving);
      sames.forEach((row) => {
        if (row.hidden === !showing) return;
        // The first value we find is the author's, and it is the one cleanup
        // has to put back: a row the author shipped hidden must not be
        // revealed by this component going away.
        if (!hiddenWas.has(row)) hiddenWas.set(row, row.hidden);
        row.hidden = !showing;
      });
      toggle.setAttribute("aria-pressed", showing ? "true" : "false");
      toggle.textContent = showing
        ? `Hide the ${counts.same} unchanged field${counts.same === 1 ? "" : "s"}`
        : `Show the ${counts.same} unchanged field${counts.same === 1 ? "" : "s"}`;
      if (animated) {
        flipAll(was, span);
        live.textContent = showing ? "Unchanged fields shown" : "Unchanged fields hidden";
      }
    };

    toggle.addEventListener("click", () => { showing = !showing; apply(true); });
    apply(false);

    cleanups.push(() => {
      marks.forEach((cell) => cell.remove());
      spokens.forEach((one) => one.remove());
      headCell?.remove();
      hiddenWas.forEach((hidden, row) => { row.hidden = hidden; });
      rows.forEach((row) => {
        row.classList.remove("rm-diff-table-row",
          ...Object.keys(WORDS).map((one) => `is-${one}`));
        row.querySelector("[data-rm-before]")?.classList.remove("rm-diff-table-before");
      });
      summary.remove();
      live.remove();
      table.classList.remove("rm-diff-table");
      table.removeAttribute("aria-label");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A real menu of formats, with the work that follows announced.
 *
 * `role="menu"` with real `menuitem` buttons, arrow keys, Home and End,
 * type-ahead on the first letter, Escape back to the trigger, and a click
 * anywhere else to dismiss. A `<div>` with a click handler has none of that, and
 * an export control is exactly where somebody in a hurry reaches for the
 * keyboard.
 *
 * The important half is what happens after the choice. Exporting takes seconds,
 * so the trigger gets `aria-busy`, the live region says "Preparing the CSV
 * export" and then says when it is ready. The usual version closes the menu and
 * nothing happens for four seconds, which is indistinguishable from a broken
 * button and gets clicked three more times.
 *
 * The format buttons live in the markup, so with no JavaScript at all the page
 * still shows a list of working export links.
 *
 *   <div data-rm-export-menu><button type="button">Export</button><ul>…</ul></div>
 */
export function exportMenu(target = "[data-rm-export-menu]", options = {}) {
  const roots = resolveElements(target);
  if (!roots.length) return () => {};

  const { label = "Export", duration = 200, onExport } = options;
  const cleanups = [];

  for (const root of roots) {
    const trigger = root.querySelector("button");
    const list = root.querySelector("ul, ol");
    if (!trigger || !list) continue;

    const items = [...list.querySelectorAll("button")];
    if (!items.length) continue;

    root.classList.add("rm-export-menu");
    trigger.classList.add("rm-export-menu-trigger");
    trigger.setAttribute("aria-haspopup", "menu");
    trigger.setAttribute("aria-expanded", "false");
    const span = dataNumber(root, "rmDuration", duration);

    list.classList.add("rm-export-menu-list");
    list.id = list.id || uid("rm-export");
    list.setAttribute("role", "menu");
    list.setAttribute("aria-label", dataString(root, "rmLabel", label));
    // The list is a working set of export links without JavaScript, so it may
    // well arrive visible — and it may equally arrive `hidden`. Either way the
    // author's value is what cleanup owes them back.
    const listWasHidden = list.hidden;
    list.hidden = true;
    trigger.setAttribute("aria-controls", list.id);

    [...list.children].forEach((li) => li.setAttribute("role", "none"));
    items.forEach((item) => {
      item.setAttribute("role", "menuitem");
      item.classList.add("rm-export-menu-item");
      item.tabIndex = -1;
    });

    const live = announcer(root);
    let at = 0;

    const focusAt = (index) => {
      at = (index + items.length) % items.length;
      items[at].focus();
    };

    const open = () => {
      if (!list.hidden) return;
      trigger.setAttribute("aria-expanded", "true");
      openPanel(list, span);
      focusAt(0);
    };

    const shut = (restore = true) => {
      if (list.hidden) return;
      trigger.setAttribute("aria-expanded", "false");
      closePanel(list, span);
      if (restore) trigger.focus();
    };

    const choose = (item) => {
      const format = dataString(item, "rmFormat", item.textContent.trim());
      shut();
      trigger.setAttribute("aria-busy", "true");
      root.classList.add("is-working");
      live.textContent = `Preparing the ${format} export`;
      onExport?.(format, item);
    };

    /** The caller says when the file is ready; the component says it out loud. */
    root.rmDone = (message) => {
      trigger.removeAttribute("aria-busy");
      root.classList.remove("is-working");
      live.textContent = message ?? "Export ready";
    };

    const onTrigger = () => (list.hidden ? open() : shut());
    const onTriggerKey = (event) => {
      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    };

    const onMenuKey = (event) => {
      if (event.key === "ArrowDown") { event.preventDefault(); focusAt(at + 1); }
      else if (event.key === "ArrowUp") { event.preventDefault(); focusAt(at - 1); }
      else if (event.key === "Home") { event.preventDefault(); focusAt(0); }
      else if (event.key === "End") { event.preventDefault(); focusAt(items.length - 1); }
      else if (event.key === "Escape") { event.preventDefault(); shut(); }
      else if (event.key === "Tab") { shut(false); }
      else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        // Type-ahead: the one menu affordance everybody uses without noticing.
        // Modifiers are excluded because a bare letter match plus
        // `preventDefault()` swallows the browser's own chords — with a
        // "PDF report" item in the list, Ctrl+P stops printing the page.
        const letter = event.key.toLowerCase();
        const found = items.findIndex((item, i) =>
          i > at && item.textContent.trim().toLowerCase().startsWith(letter));
        const wrapped = found >= 0 ? found
          : items.findIndex((item) => item.textContent.trim().toLowerCase().startsWith(letter));
        if (wrapped >= 0) { event.preventDefault(); focusAt(wrapped); }
      }
    };

    const onItemClick = (event) => choose(event.currentTarget);
    const onItemFocus = (event) => { at = items.indexOf(event.currentTarget); };
    const onAway = (event) => { if (!root.contains(event.target)) shut(false); };

    trigger.addEventListener("click", onTrigger);
    trigger.addEventListener("keydown", onTriggerKey);
    list.addEventListener("keydown", onMenuKey);
    items.forEach((item) => {
      item.addEventListener("click", onItemClick);
      item.addEventListener("focus", onItemFocus);
    });
    document.addEventListener("pointerdown", onAway);

    cleanups.push(() => {
      trigger.removeEventListener("click", onTrigger);
      trigger.removeEventListener("keydown", onTriggerKey);
      list.removeEventListener("keydown", onMenuKey);
      items.forEach((item) => {
        item.removeEventListener("click", onItemClick);
        item.removeEventListener("focus", onItemFocus);
        item.removeAttribute("role");
        item.removeAttribute("tabindex");
        item.classList.remove("rm-export-menu-item");
      });
      [...list.children].forEach((li) => li.removeAttribute("role"));
      delete root.rmDone;
      live.remove();
      list.hidden = listWasHidden;
      list.classList.remove("rm-export-menu-list", "is-open");
      list.removeAttribute("role");
      list.removeAttribute("aria-label");
      trigger.classList.remove("rm-export-menu-trigger");
      trigger.removeAttribute("aria-haspopup");
      trigger.removeAttribute("aria-expanded");
      trigger.removeAttribute("aria-controls");
      trigger.removeAttribute("aria-busy");
      root.classList.remove("rm-export-menu", "is-working");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}
