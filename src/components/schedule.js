/**
 * Calendars and time.
 *
 *   • monthGrid()          — a real table of a month, walked with the arrow keys.
 *   • weekGrid()           — seven columns, chosen by keyboard, counted out loud.
 *   • dayTimeline()        — hours down the side, events placed by their own times.
 *   • nowLine()            — a line at the current minute, and only on the right day.
 *   • miniCalendar()       — a dense month that says how much is on each day.
 *   • dateRange()          — two dates that cannot contradict each other.
 *   • timePicker()         — a real time input with a drawn face beside it.
 *   • durationField()      — hours and minutes, added up and said in words.
 *   • timezonePill()       — the offset expressed as "two hours ahead of you".
 *   • availabilityGrid()   — slots painted with a drag, and picked with a keyboard.
 *   • bookingSlots()       — real radios, with the full ones still reachable.
 *   • recurrenceBuilder()  — "every two weeks on Tuesday", from real form controls.
 *   • agendaList()         — grouped by day, with headings that know they are stuck.
 *   • deadlinePill()       — a tone that changes, and a sentence that explains it.
 *   • eventChip()          — overlapping events laid side by side instead of on top.
 *   • weekStrip()          — a horizontal week that scrolls itself and nothing else.
 *
 * Dates are the part of an interface that is wrong most often, and almost
 * always for the same three reasons.
 *
 * The first is that the layout is computed from the clock. A month grid built
 * from `Date.now()` renders differently depending on when the page was opened,
 * which means it cannot be cached, cannot be server-rendered, and cannot be
 * tested. So nothing here invents a date: every component reads the real date
 * out of the markup, from a `<time datetime="…">` element or a `data-rm-date`
 * attribute, and the only two components that consult the clock at all are the
 * two whose entire subject is the present moment — `nowLine` and
 * `deadlinePill`. Both of those check the markup's date first and draw nothing
 * if it does not apply.
 *
 * The second is `new Date("2026-03-03")`. A bare date string is parsed as UTC
 * midnight, so in any zone west of Greenwich it is the evening before, and a
 * calendar built that way is off by one day for about half the planet for about
 * half the year. Everything here goes through `parseStamp`, which splits a
 * date-only value by hand into a local date and leaves anything carrying a time
 * to the normal parser.
 *
 * The third is that a grid is a shape, not a sentence. A cell announced as
 * "row 3, column 5" has told a screen reader nothing; every day cell in this
 * file carries an `aria-label` formatted by `Intl.DateTimeFormat` from its own
 * `datetime`, so what gets read out is "Tuesday, 3 March 2026" — and, where
 * there is something on that day, how much.
 *
 * Nothing in this file animates a box. Selection markers move by FLIP, fills
 * are `scaleX`, disclosure is `grid-template-rows: 0fr → 1fr`, and a slot
 * painted during a drag changes colour and nothing else.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import {
  clamp, dataNumber, dataString, EASE, keepInView, mapRange, onFrame,
  prefersReducedMotion, resolveElements, watch, whileVisible,
} from "../core/motion.js";

/** An id for the `aria-` wiring that needs one, without demanding it in markup. */
const uid = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

/** A live region owned by one component and removed with it. */
function announcer(holder, tone = "polite") {
  const said = document.createElement("p");
  said.className = "rm-schedule-live";
  said.setAttribute("aria-live", tone);
  said.setAttribute("role", tone === "assertive" ? "alert" : "status");
  holder.appendChild(said);
  return said;
}

/** Text that is read but never drawn — the spoken half of a visual signal. */
function said(text) {
  const span = document.createElement("span");
  span.className = "rm-schedule-said";
  span.textContent = text;
  return span;
}

/**
 * Turn a `datetime` value into a local Date.
 *
 * The whole reason this function exists is the first line of it. `new
 * Date("2026-03-03")` is defined to mean midnight UTC, so west of Greenwich it
 * lands on the 2nd and every calendar built on it is off by one. A value that
 * carries a time is unambiguous and goes to the normal parser.
 */
function parseStamp(value) {
  if (!value) return null;
  const plain = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value).trim());
  if (plain) return new Date(Number(plain[1]), Number(plain[2]) - 1, Number(plain[3]));
  const at = new Date(value);
  return Number.isNaN(at.getTime()) ? null : at;
}

/**
 * A date's own YYYY-MM-DD, in the visitor's zone.
 *
 * `toISOString().slice(0, 10)` is the same off-by-one bug going the other way:
 * it converts to UTC first, so an event at 23:00 in Madrid is filed under
 * tomorrow. This builds the string from the local fields.
 */
function dayKey(date) {
  if (!date) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Minutes since local midnight. */
const minutesOfDay = (date) => date.getHours() * 60 + date.getMinutes();

/**
 * A formatter, or a plain fallback when the locale or zone is not recognised.
 *
 * `Intl.DateTimeFormat` throws on a bad locale and on a bad time zone, and a
 * calendar that throws while labelling its cells leaves the whole grid
 * unlabelled. Every call here can fail safely.
 */
function formatter(locale, options) {
  try {
    return new Intl.DateTimeFormat(locale || undefined, options);
  } catch {
    try {
      return new Intl.DateTimeFormat(undefined, options);
    } catch {
      return null;
    }
  }
}

/** Format a date, falling back to something readable rather than to nothing. */
function say(locale, options, date, fallback = "") {
  if (!date) return fallback;
  const fmt = formatter(locale, options);
  if (!fmt) return fallback || date.toDateString();
  try {
    return fmt.format(date);
  } catch {
    return fallback || date.toDateString();
  }
}

/**
 * "Today", "Tomorrow" or "Yesterday" in the page's own language.
 *
 * `Intl.RelativeTimeFormat` with `numeric: "auto"` is the only thing that
 * turns -1, 0 and 1 into words rather than into "in 1 day", and it is why a
 * Spanish agenda says "Mañana" instead of the English the source was written
 * in. It gives lower case, so the first letter is raised for a heading; a
 * locale it does not recognise falls back to the visitor's own, and only then
 * to the plain English word.
 */
function relativeDay(locale, days) {
  const plain = days === 0 ? "Today" : days === 1 ? "Tomorrow" : days === -1 ? "Yesterday" : "";
  if (!plain) return "";
  const rise = (text) => (text ? text.charAt(0).toLocaleUpperCase(locale || undefined) + text.slice(1) : "");
  try {
    return rise(new Intl.RelativeTimeFormat(locale || undefined, { numeric: "auto" }).format(days, "day"));
  } catch {
    try {
      return rise(new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }).format(days, "day"));
    } catch {
      return plain;
    }
  }
}

/** Join a list the way the language does — "Monday, Tuesday and Thursday". */
function joinWords(locale, items) {
  try {
    return new Intl.ListFormat(locale || undefined, { style: "long", type: "conjunction" }).format(items);
  } catch {
    return items.join(", ");
  }
}

/** The first `<time datetime>` inside an element, as a Date. */
function stampIn(element, index = 0) {
  const stamps = element.querySelectorAll("time[datetime]");
  return stamps[index] ? parseStamp(stamps[index].getAttribute("datetime")) : null;
}

/**
 * The date an element is about: its own `data-rm-date`, or the nearest
 * ancestor that declares one, or its first `<time>`.
 */
function dateOf(element) {
  const own = element.getAttribute("data-rm-date");
  if (own) return parseStamp(own);
  const host = element.closest("[data-rm-date]");
  if (host) return parseStamp(host.getAttribute("data-rm-date"));
  return stampIn(element);
}

/**
 * A real table of a month, walked with the arrow keys.
 *
 * The markup is an actual `<table>` with an actual header row, because a month
 * *is* a table: seven named columns and one row per week, and a screen reader
 * that knows that can tell you which weekday a cell is in without you counting.
 * The roles are written out explicitly — `grid`, `row`, `columnheader`,
 * `gridcell` — since the moment a table becomes a grid its children need the
 * grid's own roles rather than the table's.
 *
 * The keyboard is the whole point. Arrow keys move one day, up and down move a
 * week, Home and End go to the ends of the visible week, and PageUp and
 * PageDown mean a month — they fire a cancelable `rm-month-change` event
 * carrying the delta, so the page that owns the data can render the next month
 * and call `preventDefault()`. Only one cell is ever in the tab order, which is
 * what stops a month from costing forty tabs to cross.
 *
 * The selection marker is one element that FLIPs from the old cell to the new
 * one. The usual version toggles a background colour on each cell, which is
 * free but reads as two unrelated flashes; moving a single marker is the thing
 * that tells you your selection travelled.
 *
 *   <table data-rm-month-grid data-rm-today="2026-03-17">…</table>
 */
export function monthGrid(target = "[data-rm-month-grid]", options = {}) {
  const tables = resolveElements(target);
  if (!tables.length) return () => {};

  const { locale = "", label = "Month", duration = 260 } = options;
  const cleanups = [];

  for (const table of tables) {
    const days = [...table.querySelectorAll("td")].filter((cell) => cell.querySelector("time[datetime]"));
    if (!days.length) continue;

    const tongue = dataString(table, "rmLocale", locale);
    const speed = prefersReducedMotion() ? 0 : dataNumber(table, "rmDuration", duration);
    const todayKey = dataString(table, "rmToday", "");

    table.classList.add("rm-month-grid");
    table.setAttribute("role", "grid");
    table.setAttribute("aria-label", dataString(table, "rmLabel", label));

    for (const row of table.querySelectorAll("tr")) row.setAttribute("role", "row");
    for (const head of table.querySelectorAll("th")) head.setAttribute("role", "columnheader");

    const marker = document.createElement("span");
    marker.className = "rm-month-grid-marker";
    marker.setAttribute("aria-hidden", "true");

    let at = 0;
    let chosen = -1;
    // `aria-selected` is read out of the markup below, which makes it an
    // author input rather than something this module owns; the value found is
    // kept so the cleanup can hand the page its own selection back.
    const hadSelected = new Map();

    days.forEach((cell, i) => {
      const date = stampIn(cell);
      hadSelected.set(cell, cell.getAttribute("aria-selected"));
      cell.classList.add("rm-month-grid-day");
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("tabindex", "-1");
      // "Tuesday, 3 March 2026", not "row four, column two".
      cell.setAttribute("aria-label", say(tongue, { dateStyle: "full" }, date, cell.textContent.trim()));
      if (date && todayKey && dayKey(date) === todayKey) {
        cell.setAttribute("aria-current", "date");
        cell.classList.add("is-today");
      }
      if (cell.getAttribute("aria-selected") === "true") chosen = i;
    });

    if (chosen < 0) chosen = days.findIndex((cell) => cell.classList.contains("is-today"));
    at = chosen < 0 ? 0 : chosen;
    days[at].setAttribute("tabindex", "0");
    if (chosen >= 0) days[chosen].appendChild(marker);

    const focusAt = (next) => {
      const to = clamp(next, 0, days.length - 1);
      if (to === at) return;
      days[at].setAttribute("tabindex", "-1");
      at = to;
      days[at].setAttribute("tabindex", "0");
      days[at].focus();
    };

    const choose = (index) => {
      const cell = days[index];
      if (!cell) return;
      // Measure before the move: this is the F and the L of a FLIP, and the
      // only reason the marker appears to travel rather than blink.
      const was = marker.isConnected ? marker.getBoundingClientRect() : null;
      days.forEach((one) => { one.removeAttribute("aria-selected"); one.classList.remove("is-chosen"); });
      cell.setAttribute("aria-selected", "true");
      cell.classList.add("is-chosen");
      cell.appendChild(marker);
      chosen = index;

      if (was && speed) {
        const now = marker.getBoundingClientRect();
        marker.animate(
          [
            { transform: `translate(${was.left - now.left}px, ${was.top - now.top}px)` },
            { transform: "none" },
          ],
          { duration: speed, easing: EASE.out },
        );
      } else if (speed) {
        marker.animate([{ transform: "scale(0.4)", opacity: 0 }, { transform: "none", opacity: 1 }],
          { duration: speed, easing: EASE.out });
      }

      const date = stampIn(cell);
      table.dispatchEvent(new CustomEvent("rm-date-select", {
        bubbles: true,
        detail: { date, iso: dayKey(date), cell },
      }));
    };

    /** The day cells that share a row with `cell` — what Home and End mean. */
    const weekOf = (cell) => days.filter((one) => one.parentElement === cell.parentElement);

    const onKey = (event) => {
      const cell = event.target.closest("td");
      const index = days.indexOf(cell);
      if (index < 0) return;

      const week = weekOf(cell);
      let handled = true;
      switch (event.key) {
        case "ArrowRight": focusAt(index + 1); break;
        case "ArrowLeft": focusAt(index - 1); break;
        case "ArrowDown": focusAt(index + 7); break;
        case "ArrowUp": focusAt(index - 7); break;
        case "Home": focusAt(days.indexOf(week[0])); break;
        case "End": focusAt(days.indexOf(week[week.length - 1])); break;
        case "PageUp":
        case "PageDown": {
          const delta = event.key === "PageDown" ? 1 : -1;
          const moved = table.dispatchEvent(new CustomEvent("rm-month-change", {
            bubbles: true, cancelable: true, detail: { delta, from: stampIn(cell) },
          }));
          // Nobody re-rendered, so the honest thing is to go to the end of the
          // month we can actually see rather than pretend we moved.
          if (moved) focusAt(delta > 0 ? days.length - 1 : 0);
          break;
        }
        case "Enter":
        case " ": choose(index); break;
        default: handled = false;
      }
      if (handled) event.preventDefault();
    };

    const onClick = (event) => {
      const cell = event.target.closest("td");
      const index = days.indexOf(cell);
      if (index < 0) return;
      focusAt(index);
      choose(index);
    };

    table.addEventListener("keydown", onKey);
    table.addEventListener("click", onClick);

    cleanups.push(() => {
      table.removeEventListener("keydown", onKey);
      table.removeEventListener("click", onClick);
      marker.remove();
      for (const row of table.querySelectorAll("tr")) row.removeAttribute("role");
      for (const head of table.querySelectorAll("th")) head.removeAttribute("role");
      days.forEach((cell) => {
        cell.classList.remove("rm-month-grid-day", "is-today", "is-chosen");
        cell.removeAttribute("role");
        cell.removeAttribute("tabindex");
        cell.removeAttribute("aria-label");
        cell.removeAttribute("aria-current");
        const was = hadSelected.get(cell);
        if (was === null || was === undefined) cell.removeAttribute("aria-selected");
        else cell.setAttribute("aria-selected", was);
      });
      table.classList.remove("rm-month-grid");
      table.removeAttribute("role");
      table.removeAttribute("aria-label");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Seven columns, chosen by keyboard, counted out loud.
 *
 * A week view's real information is not "here are some boxes" — it is how much
 * is on each day, and a column of stacked rectangles conveys that to exactly
 * the people who can see it. So each day's header gains a spoken count: "Tuesday
 * 3 March, two events". Picking a column is a roving tabindex across the
 * headers, which is one tab stop for the week instead of seven.
 *
 * Choosing a day staggers that column's events in with a transform. The naive
 * version highlights the column by setting a background on every cell in it,
 * which repaints the entire table; here the chosen column carries one class and
 * the events move themselves.
 *
 *   <table data-rm-week-grid data-rm-today="2026-03-03">…</table>
 */
export function weekGrid(target = "[data-rm-week-grid]", options = {}) {
  const tables = resolveElements(target);
  if (!tables.length) return () => {};

  const { locale = "", label = "Week", item = "li", stagger = 60 } = options;
  const cleanups = [];

  for (const table of tables) {
    const heads = [...table.querySelectorAll("thead th")].filter((th) => th.querySelector("time[datetime]"));
    if (!heads.length) continue;

    const tongue = dataString(table, "rmLocale", locale);
    const pick = dataString(table, "rmItem", item);
    const gap = prefersReducedMotion() ? 0 : dataNumber(table, "rmStagger", stagger);
    const todayKey = dataString(table, "rmToday", "");

    table.classList.add("rm-week-grid");
    table.setAttribute("aria-label", dataString(table, "rmLabel", label));
    const live = announcer(table.parentElement ?? table);

    /** Every cell sitting under one header, by column index. */
    const columnAt = (index) => (index < 0 ? [] : [...table.querySelectorAll("tbody tr")]
      .map((row) => [...row.children][index])
      .filter(Boolean));

    // `heads` is filtered down to the dated headers, so its position in that
    // list is not the column it occupies. Any week view with an hour gutter
    // has a stub header first, and using the filtered index would hand Monday
    // the gutter's cells and leave the last day unreachable.
    const headRow = table.querySelector("thead tr");
    const columnOf = (head) => (headRow ? [...headRow.children].indexOf(head) : -1);
    const hadScope = new Map();

    let at = 0;
    heads.forEach((head, i) => {
      const date = stampIn(head);
      const events = columnAt(columnOf(head)).reduce((total, cell) => total + cell.querySelectorAll(pick).length, 0);
      const name = say(tongue, { weekday: "long", day: "numeric", month: "long" }, date, head.textContent.trim());

      head.classList.add("rm-week-grid-head");
      head.setAttribute("tabindex", "-1");
      hadScope.set(head, head.getAttribute("scope"));
      head.setAttribute("scope", "col");
      // The count lives in the `aria-label` and nowhere else. A hidden span
      // saying the same thing would never be announced, because a label
      // replaces the element's subtree for the accessible name — two
      // mechanisms, one of them dead.
      head.setAttribute("aria-label", `${name}, ${events === 1 ? "1 event" : `${events} events`}`);
      if (date && todayKey && dayKey(date) === todayKey) {
        head.setAttribute("aria-current", "date");
        head.classList.add("is-today");
        at = i;
      }
    });
    heads[at].setAttribute("tabindex", "0");

    const show = (index) => {
      heads.forEach((head, i) => {
        head.setAttribute("aria-selected", i === index ? "true" : "false");
        head.classList.toggle("is-chosen", i === index);
        columnAt(columnOf(head)).forEach((cell) => cell.classList.toggle("is-chosen", i === index));
      });

      const rows = columnAt(columnOf(heads[index])).flatMap((cell) => [...cell.querySelectorAll(pick)]);
      if (gap) {
        rows.forEach((row, i) => row.animate(
          [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }],
          { duration: 320, delay: i * gap, easing: EASE.out },
        ));
      }
      live.textContent = `${heads[index].getAttribute("aria-label")} selected.`;
    };

    const focusAt = (next) => {
      const to = clamp(next, 0, heads.length - 1);
      heads[at].setAttribute("tabindex", "-1");
      at = to;
      heads[at].setAttribute("tabindex", "0");
      heads[at].focus();
    };

    const onKey = (event) => {
      const head = event.target.closest("th");
      const index = heads.indexOf(head);
      if (index < 0) return;
      let handled = true;
      switch (event.key) {
        case "ArrowRight": focusAt(index + 1); break;
        case "ArrowLeft": focusAt(index - 1); break;
        case "Home": focusAt(0); break;
        case "End": focusAt(heads.length - 1); break;
        case "Enter": case " ": show(index); break;
        default: handled = false;
      }
      if (handled) event.preventDefault();
    };

    const onClick = (event) => {
      const head = event.target.closest("th");
      const index = heads.indexOf(head);
      if (index < 0) return;
      focusAt(index);
      show(index);
    };

    table.addEventListener("keydown", onKey);
    table.addEventListener("click", onClick);

    cleanups.push(() => {
      table.removeEventListener("keydown", onKey);
      table.removeEventListener("click", onClick);
      live.remove();
      heads.forEach((head) => {
        head.classList.remove("rm-week-grid-head", "is-today", "is-chosen");
        head.removeAttribute("tabindex");
        head.removeAttribute("aria-label");
        head.removeAttribute("aria-selected");
        head.removeAttribute("aria-current");
        const was = hadScope.get(head);
        if (was === null || was === undefined) head.removeAttribute("scope");
        else head.setAttribute("scope", was);
        columnAt(columnOf(head)).forEach((cell) => cell.classList.remove("is-chosen"));
      });
      table.classList.remove("rm-week-grid");
      table.removeAttribute("aria-label");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Hours down the side, events placed by their own times.
 *
 * The ruler is drawn from the hour window the markup declares, and every event
 * is positioned from the `<time datetime>` pair it already contains — a start
 * and an end, written once, used by the layout and read by the screen reader.
 * The usual version puts the position in a style attribute and the time in a
 * label and lets them drift apart; here there is one source and the label is
 * generated from it, so they cannot disagree.
 *
 * Placement is a percentage of the window, not pixels, so the day rescales with
 * its container without a single line of JavaScript running. The ruler itself
 * is `aria-hidden`: the hours are a drawing, and every event states its own
 * time in words, so reading the hours out twice would only be noise.
 *
 *   <div data-rm-day-timeline data-rm-hour-from="8" data-rm-hour-to="19">…</div>
 */
export function dayTimeline(target = "[data-rm-day-timeline]", options = {}) {
  const days = resolveElements(target);
  if (!days.length) return () => {};

  const { hourFrom = 8, hourTo = 20, item = "li", locale = "", label = "Day" } = options;
  const cleanups = [];

  for (const day of days) {
    const from = clamp(dataNumber(day, "rmHourFrom", hourFrom), 0, 23) * 60;
    const to = clamp(dataNumber(day, "rmHourTo", hourTo), 1, 24) * 60;
    const span = Math.max(60, to - from);
    const tongue = dataString(day, "rmLocale", locale);
    const events = [...day.querySelectorAll(dataString(day, "rmItem", item))];

    day.classList.add("rm-day-timeline");
    day.setAttribute("role", "group");
    day.setAttribute("aria-label", dataString(day, "rmLabel", label));
    day.style.setProperty("--rm-day-timeline-hours", String(Math.round(span / 60)));

    const ruler = document.createElement("ul");
    ruler.className = "rm-day-timeline-ruler";
    ruler.setAttribute("aria-hidden", "true");
    for (let hour = Math.ceil(from / 60); hour <= Math.floor(to / 60); hour++) {
      const mark = document.createElement("li");
      mark.style.setProperty("--rm-day-timeline-at", `${((hour * 60 - from) / span) * 100}%`);
      mark.textContent = `${String(hour).padStart(2, "0")}:00`;
      ruler.appendChild(mark);
    }
    day.prepend(ruler);

    const clock = { hour: "2-digit", minute: "2-digit" };
    for (const event of events) {
      const start = stampIn(event, 0);
      const end = stampIn(event, 1) ?? start;
      if (!start) continue;

      const top = clamp(mapRange(minutesOfDay(start), from, to, 0, 100), 0, 100);
      const tail = clamp(mapRange(minutesOfDay(end), from, to, 0, 100), 0, 100);
      event.classList.add("rm-day-timeline-event");
      event.style.setProperty("--rm-day-timeline-top", `${top}%`);
      event.style.setProperty("--rm-day-timeline-size", `${Math.max(2.5, tail - top)}%`);
      event.setAttribute(
        "aria-label",
        `${event.textContent.replace(/\s+/g, " ").trim()}, ${say(tongue, clock, start)} to ${say(tongue, clock, end)}`,
      );
    }

    // They wipe in from the top, which is the direction a day is read in.
    cleanups.push(watch(day, () => {
      if (prefersReducedMotion()) return;
      events.forEach((event, i) => event.animate(
        [
          { opacity: 0, clipPath: "inset(0 0 100% 0)", transform: "translateY(-4px)" },
          { opacity: 1, clipPath: "inset(0 0 0 0)", transform: "none" },
        ],
        { duration: 420, delay: i * 55, easing: EASE.out },
      ));
    }, { threshold: 0.2, once: true }));

    cleanups.push(() => {
      ruler.remove();
      events.forEach((event) => {
        event.classList.remove("rm-day-timeline-event");
        event.style.removeProperty("--rm-day-timeline-top");
        event.style.removeProperty("--rm-day-timeline-size");
        event.removeAttribute("aria-label");
      });
      day.style.removeProperty("--rm-day-timeline-hours");
      day.classList.remove("rm-day-timeline");
      day.removeAttribute("role");
      day.removeAttribute("aria-label");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * A line at the current minute, and only on the right day.
 *
 * This is the one component in the file allowed to read the clock, and the
 * first thing it does with it is check whether it should exist at all: a "now"
 * line drawn on next Tuesday's column is worse than no line, because it looks
 * authoritative. If the day it sits in is not today, it hides — and because the
 * stylesheet gives it a `display`, there is an explicit `[hidden]` rule to go
 * with it, or the line would still be laid out and still be in the way.
 *
 * The position updates through the shared frame loop rather than a `setInterval`
 * of its own, wrapped in `whileVisible` so a calendar scrolled off screen or in
 * a background tab costs nothing. The frame task recomputes only when the
 * minute actually changes; sixty recalculations a second of a value that moves
 * once a minute is the usual waste here.
 *
 * It is a `role="separator"` with a name, not a live region. A time that
 * announces itself every sixty seconds is a screen reader nobody can use.
 *
 *   <div data-rm-now-line data-rm-date="2026-03-03" data-rm-hour-from="8"></div>
 */
export function nowLine(target = "[data-rm-now-line]", options = {}) {
  const lines = resolveElements(target);
  if (!lines.length) return () => {};

  const { hourFrom = 8, hourTo = 20, locale = "", label = "Now" } = options;
  const cleanups = [];

  for (const line of lines) {
    const host = line.closest("[data-rm-hour-from]") ?? line;
    const from = clamp(dataNumber(host, "rmHourFrom", hourFrom), 0, 23) * 60;
    const to = clamp(dataNumber(host, "rmHourTo", hourTo), 1, 24) * 60;
    const tongue = dataString(line, "rmLocale", locale);
    const name = dataString(line, "rmLabel", label);
    const day = dateOf(line);

    line.classList.add("rm-now-line");
    line.setAttribute("role", "separator");
    line.setAttribute("aria-orientation", "horizontal");

    // The markup decides the day; the clock only decides where on it.
    const belongs = () => !day || dayKey(day) === dayKey(new Date());
    let lastMinute = -1;

    const draw = () => {
      const now = new Date();
      const minutes = minutesOfDay(now);
      if (minutes === lastMinute) return;
      lastMinute = minutes;

      const inside = belongs() && minutes >= from && minutes <= to;
      line.hidden = !inside;
      if (!inside) return;
      line.style.setProperty("--rm-now-line-at", `${mapRange(minutes, from, to, 0, 100)}%`);
      line.setAttribute("aria-label", `${name}, ${say(tongue, { hour: "2-digit", minute: "2-digit" }, now)}`);
    };
    draw();

    // Watch the host, never the line. Outside the hour window `draw()` hides
    // the line, a hidden element has no box, and an IntersectionObserver on a
    // box-less element reports "not visible" for ever — so a page opened at
    // 07:45 would never start the frame task that would un-hide it at 08:00.
    // The host is always laid out, so the clock keeps being read.
    cleanups.push(whileVisible(host === line ? (line.parentElement ?? line) : host, () => onFrame(draw)));
    cleanups.push(() => {
      line.hidden = false;
      line.style.removeProperty("--rm-now-line-at");
      line.classList.remove("rm-now-line");
      line.removeAttribute("role");
      line.removeAttribute("aria-orientation");
      line.removeAttribute("aria-label");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * A dense month that says how much is on each day.
 *
 * The dots are the point and the dots are also the problem: three coloured
 * circles under the 14th mean "three meetings" to somebody looking at them and
 * absolutely nothing to anybody else. So the count comes from a real
 * `data-rm-events` number in the markup, at most three dots are drawn, and the
 * cell's `aria-label` says the whole truth — "Saturday, 14 March 2026, 5
 * events" — whatever the drawing had room for.
 *
 * It is deliberately read-only. A month this small cannot carry a usable hit
 * target, and a calendar that is both tiny and clickable is a calendar people
 * mis-tap; when a day needs to be chosen, `monthGrid` is the one with the
 * keyboard.
 *
 *   <table data-rm-mini-calendar data-rm-today="2026-03-17">…</table>
 */
export function miniCalendar(target = "[data-rm-mini-calendar]", options = {}) {
  const tables = resolveElements(target);
  if (!tables.length) return () => {};

  const { locale = "", label = "Month at a glance", max = 3 } = options;
  const cleanups = [];

  for (const table of tables) {
    const cells = [...table.querySelectorAll("td")].filter((cell) => cell.querySelector("time[datetime]"));
    if (!cells.length) continue;

    const tongue = dataString(table, "rmLocale", locale);
    const most = clamp(dataNumber(table, "rmMax", max), 1, 5);
    const todayKey = dataString(table, "rmToday", "");

    table.classList.add("rm-mini-calendar");
    table.setAttribute("aria-label", dataString(table, "rmLabel", label));

    const added = [];
    cells.forEach((cell) => {
      const date = stampIn(cell);
      const count = Math.max(0, Math.round(dataNumber(cell, "rmEvents", 0)));
      const name = say(tongue, { dateStyle: "full" }, date, cell.textContent.trim());

      cell.classList.add("rm-mini-calendar-day");
      cell.setAttribute("aria-label", count ? `${name}, ${count === 1 ? "1 event" : `${count} events`}` : name);
      if (date && todayKey && dayKey(date) === todayKey) {
        cell.setAttribute("aria-current", "date");
        cell.classList.add("is-today");
      }
      if (!count) return;

      const dots = document.createElement("span");
      dots.className = "rm-mini-calendar-dots";
      dots.setAttribute("aria-hidden", "true");
      for (let i = 0; i < Math.min(count, most); i++) dots.appendChild(document.createElement("i"));
      if (count > most) dots.classList.add("is-overflowing");
      cell.appendChild(dots);
      added.push(dots);
    });

    cleanups.push(watch(table, () => {
      if (prefersReducedMotion()) return;
      added.forEach((dots, i) => dots.animate(
        [{ opacity: 0, transform: "scale(0.3)" }, { opacity: 1, transform: "none" }],
        { duration: 360, delay: i * 24, easing: EASE.spring },
      ));
    }, { threshold: 0.2, once: true }));

    cleanups.push(() => {
      added.forEach((dots) => dots.remove());
      cells.forEach((cell) => {
        cell.classList.remove("rm-mini-calendar-day", "is-today");
        cell.removeAttribute("aria-label");
        cell.removeAttribute("aria-current");
      });
      table.classList.remove("rm-mini-calendar");
      table.removeAttribute("aria-label");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * Two dates that cannot contradict each other.
 *
 * Both halves are real `<input type="date">` elements, which means the native
 * picker, the native keyboard, type-ahead and form submission all still work —
 * everything the two-divs-and-a-popup rebuild throws away. What this adds is
 * the relationship between them: the start's `max` is kept at the end's value
 * and the end's `min` at the start's, so the browser itself refuses an
 * impossible range in its own picker, in its own language, before any of our
 * code runs.
 *
 * The length is stated in words in a polite live region — "5 nights, 3 to 8
 * March" — because a highlighted band between two boxes is not a number anyone
 * can read out. The band itself is a `scaleX` on a full-width rule, so a range
 * growing from two nights to nine reflows nothing.
 *
 *   <div data-rm-date-range data-rm-max="14">…</div>
 */
export function dateRange(target = "[data-rm-date-range]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { locale = "", label = "Dates", max = 30, min = 1 } = options;
  const cleanups = [];

  for (const holder of holders) {
    const fields = [...holder.querySelectorAll('input[type="date"]')];
    const start = fields.find((one) => dataString(one, "rmUnit", "") === "start") ?? fields[0];
    const end = fields.find((one) => dataString(one, "rmUnit", "") === "end") ?? fields[1];
    if (!start || !end) continue;

    const tongue = dataString(holder, "rmLocale", locale);
    const longest = Math.max(1, dataNumber(holder, "rmMax", max));
    const shortest = Math.max(0, dataNumber(holder, "rmMin", min));

    holder.classList.add("rm-date-range");
    holder.setAttribute("role", "group");
    holder.setAttribute("aria-label", dataString(holder, "rmLabel", label));

    const bar = document.createElement("span");
    bar.className = "rm-date-range-bar";
    bar.setAttribute("aria-hidden", "true");
    const note = document.createElement("p");
    note.className = "rm-date-range-note";
    note.hidden = true;
    holder.append(bar, note);
    const live = announcer(holder);

    const hadStartMax = start.getAttribute("max");
    const hadEndMin = end.getAttribute("min");

    const sync = () => {
      const from = parseStamp(start.value);
      const to = parseStamp(end.value);

      if (to) start.max = end.value; else if (hadStartMax) start.max = hadStartMax; else start.removeAttribute("max");
      if (from) end.min = start.value; else if (hadEndMin) end.min = hadEndMin; else end.removeAttribute("min");

      if (!from || !to) { bar.style.setProperty("--rm-date-range-fill", "0"); note.hidden = true; return; }

      const nights = Math.round((to - from) / 86400000);
      bar.style.setProperty("--rm-date-range-fill", String(clamp(nights / longest, 0, 1)));

      // A typed value can still be nonsense even with min and max set, because
      // the attributes constrain the picker, not the keyboard.
      const wrong = nights < 0 ? "The end date is before the start date."
        : nights < shortest ? `This booking needs at least ${shortest === 1 ? "1 night" : `${shortest} nights`}.`
          : "";
      note.textContent = wrong;
      note.hidden = !wrong;
      end.setAttribute("aria-invalid", wrong ? "true" : "false");
      if (wrong) { live.textContent = wrong; return; }

      const range = { day: "numeric", month: "long", year: "numeric" };
      live.textContent = `${nights === 1 ? "1 night" : `${nights} nights`}, `
        + `${say(tongue, range, from)} to ${say(tongue, range, to)}.`;
    };

    start.addEventListener("change", sync);
    end.addEventListener("change", sync);
    sync();

    cleanups.push(() => {
      start.removeEventListener("change", sync);
      end.removeEventListener("change", sync);
      if (hadStartMax) start.max = hadStartMax; else start.removeAttribute("max");
      if (hadEndMin) end.min = hadEndMin; else end.removeAttribute("min");
      end.removeAttribute("aria-invalid");
      bar.remove();
      note.remove();
      live.remove();
      holder.classList.remove("rm-date-range");
      holder.removeAttribute("role");
      holder.removeAttribute("aria-label");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A real time input with a drawn face beside it.
 *
 * The `<input type="time">` is the control; the clock is a picture of it. That
 * order matters, because every keyboard, every screen reader and every phone
 * already knows what a time input is, and the drawn face knows nothing until we
 * teach it. Dragging a hand is a pointer convenience layered on top — the input
 * stays visible, stays focusable and stays the thing the form submits.
 *
 * The hands take the short way round. A hand driven straight from
 * `rotate(minutes * 6deg)` unwinds nearly all the way backwards when the clock
 * passes the hour, because 354 degrees and −6 degrees are the same place but
 * not the same journey; this keeps a running angle and adds the smaller of the
 * two deltas.
 *
 * The face is `aria-hidden` and its `color` is inherited, not fixed, so it is
 * not a black drawing on a dark page.
 *
 *   <div data-rm-time-picker data-rm-step="5">…</div>
 */
export function timePicker(target = "[data-rm-time-picker]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { step = 5, duration = 420, label = "Time" } = options;
  const cleanups = [];

  for (const holder of holders) {
    const field = holder.querySelector('input[type="time"]');
    if (!field) continue;

    const snap = clamp(dataNumber(holder, "rmStep", step), 1, 30);
    const speed = prefersReducedMotion() ? 0 : dataNumber(holder, "rmDuration", duration);

    holder.classList.add("rm-time-picker");
    holder.setAttribute("role", "group");
    holder.setAttribute("aria-label", dataString(holder, "rmLabel", label));
    holder.style.setProperty("--rm-time-picker-duration", `${speed}ms`);

    const face = document.createElement("div");
    face.className = "rm-time-picker-face";
    face.setAttribute("aria-hidden", "true");
    face.innerHTML =
      '<svg viewBox="-50 -50 100 100"><circle r="46" fill="none" stroke="currentColor" stroke-width="1.5"'
      + ' opacity="0.35"/><circle r="30" fill="none" stroke="currentColor" stroke-width="1" opacity="0.15"/>'
      + '<line class="rm-time-picker-hour" x1="0" y1="0" x2="0" y2="-24" stroke="currentColor"'
      + ' stroke-width="3.4" stroke-linecap="round"/>'
      + '<line class="rm-time-picker-minute" x1="0" y1="0" x2="0" y2="-40" stroke="currentColor"'
      + ' stroke-width="2" stroke-linecap="round"/>'
      + '<circle r="2.6" fill="currentColor"/></svg>';
    holder.appendChild(face);

    const hourHand = face.querySelector(".rm-time-picker-hour");
    const minuteHand = face.querySelector(".rm-time-picker-minute");
    let hourAngle = 0;
    let minuteAngle = 0;

    /** Add the smaller of the two ways round, so a hand never unwinds. */
    const shortest = (current, wanted) => current + (((wanted - current) % 360) + 540) % 360 - 180;

    const draw = () => {
      const [h, m] = (field.value || "00:00").split(":").map(Number);
      if (!Number.isFinite(h) || !Number.isFinite(m)) return;
      hourAngle = shortest(hourAngle, ((h % 12) + m / 60) * 30);
      minuteAngle = shortest(minuteAngle, m * 6);
      hourHand.style.transform = `rotate(${hourAngle}deg)`;
      minuteHand.style.transform = `rotate(${minuteAngle}deg)`;
    };
    draw();

    const write = (hours, minutes) => {
      field.value = `${String(clamp(hours, 0, 23)).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
      field.dispatchEvent(new Event("input", { bubbles: true }));
      field.dispatchEvent(new Event("change", { bubbles: true }));
      draw();
    };

    let dragging = false;
    const angleAt = (event) => {
      const box = face.getBoundingClientRect();
      const x = event.clientX - (box.left + box.width / 2);
      const y = event.clientY - (box.top + box.height / 2);
      return { turn: ((Math.atan2(x, -y) * 180) / Math.PI + 360) % 360, far: Math.hypot(x, y) / (box.width / 2) };
    };

    const apply = (event) => {
      const { turn, far } = angleAt(event);
      const [h = 0, m = 0] = (field.value || "00:00").split(":").map(Number);
      // Outer ring is minutes, inner disc is hours: one gesture, two jobs, and
      // the boundary is where the second ring is drawn.
      if (far > 0.55) write(h, Math.round(turn / 6 / snap) * snap % 60);
      else {
        const wanted = Math.round(turn / 30) % 12;
        write(h >= 12 ? wanted + 12 : wanted, m);
      }
    };

    const onDown = (event) => {
      if (event.button > 0) return;
      dragging = true;
      face.setPointerCapture?.(event.pointerId);
      apply(event);
    };
    const onMove = (event) => { if (dragging) apply(event); };
    const onUp = (event) => {
      if (!dragging) return;
      dragging = false;
      face.releasePointerCapture?.(event.pointerId);
    };

    face.addEventListener("pointerdown", onDown);
    face.addEventListener("pointermove", onMove);
    face.addEventListener("pointerup", onUp);
    face.addEventListener("pointercancel", onUp);
    field.addEventListener("input", draw);

    cleanups.push(() => {
      face.removeEventListener("pointerdown", onDown);
      face.removeEventListener("pointermove", onMove);
      face.removeEventListener("pointerup", onUp);
      face.removeEventListener("pointercancel", onUp);
      field.removeEventListener("input", draw);
      face.remove();
      holder.style.removeProperty("--rm-time-picker-duration");
      holder.classList.remove("rm-time-picker");
      holder.removeAttribute("role");
      holder.removeAttribute("aria-label");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Hours and minutes, added up and said in words.
 *
 * Two real number inputs, because "90" typed into a single minutes box is how
 * people actually enter an hour and a half and a masked `hh:mm` text field
 * fights them for it. The total goes into a hidden input as plain minutes, so
 * the form posts one unambiguous number rather than a string somebody has to
 * parse on the server.
 *
 * The summary is the part usually left out: "1 hour 30 minutes" in a polite
 * live region, so the running total is available to someone who cannot see the
 * bar beside it. The bar is a `scaleX` against a declared maximum, which is why
 * a duration growing past the limit clamps visually without the row changing
 * size.
 *
 *   <div data-rm-duration-field data-rm-max="480">…</div>
 */
export function durationField(target = "[data-rm-duration-field]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { max = 480, name = "duration", label = "Duration" } = options;
  const cleanups = [];

  for (const holder of holders) {
    const fields = [...holder.querySelectorAll("input")];
    const hours = fields.find((one) => dataString(one, "rmUnit", "") === "hours") ?? fields[0];
    const minutes = fields.find((one) => dataString(one, "rmUnit", "") === "minutes") ?? fields[1];
    if (!hours || !minutes) continue;

    const ceiling = Math.max(15, dataNumber(holder, "rmMax", max));

    holder.classList.add("rm-duration-field");
    holder.setAttribute("role", "group");
    holder.setAttribute("aria-label", dataString(holder, "rmLabel", label));

    const bar = document.createElement("span");
    bar.className = "rm-duration-field-bar";
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", String(ceiling));
    bar.setAttribute("aria-label", "Of the maximum");

    const total = document.createElement("input");
    total.type = "hidden";
    total.name = dataString(holder, "rmName", name);

    holder.append(bar, total);
    const live = announcer(holder);

    const sync = () => {
      const h = Math.max(0, Math.round(Number(hours.value) || 0));
      const m = Math.max(0, Math.round(Number(minutes.value) || 0));
      const sum = h * 60 + m;
      total.value = String(sum);
      bar.style.setProperty("--rm-duration-field-fill", String(clamp(sum / ceiling, 0, 1)));
      bar.setAttribute("aria-valuenow", String(sum));

      const words = [];
      if (h) words.push(h === 1 ? "1 hour" : `${h} hours`);
      if (m) words.push(m === 1 ? "1 minute" : `${m} minutes`);
      const spoken = words.length ? words.join(" ") : "no time set";
      bar.setAttribute("aria-valuetext", spoken);
      live.textContent = sum > ceiling ? `${spoken}, over the maximum.` : spoken;
      holder.classList.toggle("is-over", sum > ceiling);
    };

    hours.addEventListener("input", sync);
    minutes.addEventListener("input", sync);
    sync();

    cleanups.push(() => {
      hours.removeEventListener("input", sync);
      minutes.removeEventListener("input", sync);
      bar.remove();
      total.remove();
      live.remove();
      holder.classList.remove("rm-duration-field", "is-over");
      holder.removeAttribute("role");
      holder.removeAttribute("aria-label");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * The offset expressed as "two hours ahead of you".
 *
 * "+02:00" is a fact about a database, not an answer to the question anybody is
 * actually asking, which is always some version of "so is that before or after
 * lunch for me". This works out the real offset between the named zone and the
 * reader's own, at the specific instant in the markup — not at page load, which
 * would be wrong on either side of a daylight-saving change — and writes the
 * difference in words.
 *
 * The offset is measured by formatting the same instant twice and subtracting,
 * because there is no API that hands you a zone's offset directly and the
 * common shortcut of parsing `toLocaleString` output breaks in any locale that
 * does not write dates the American way. An unknown zone falls back to showing
 * the zone name rather than throwing and leaving an empty pill.
 *
 *   <span data-rm-timezone-pill="Europe/Madrid"><time datetime="…">15:00</time></span>
 */
export function timezonePill(target = "[data-rm-timezone-pill]", options = {}) {
  const pills = resolveElements(target);
  if (!pills.length) return () => {};

  const { zone = "UTC", locale = "" } = options;
  const cleanups = [];

  /** A zone's offset in minutes at one instant, by formatting and subtracting. */
  const offsetAt = (date, name) => {
    const fmt = formatter("en-US", {
      timeZone: name, hour12: false,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
    if (!fmt) return null;
    try {
      const part = Object.fromEntries(fmt.formatToParts(date).map((one) => [one.type, one.value]));
      const asIf = Date.UTC(
        Number(part.year), Number(part.month) - 1, Number(part.day),
        Number(part.hour) % 24, Number(part.minute), Number(part.second),
      );
      return Math.round((asIf - date.getTime()) / 60000);
    } catch {
      return null;
    }
  };

  for (const pill of pills) {
    const name = dataString(pill, "rmTimezonePill", zone);
    const tongue = dataString(pill, "rmLocale", locale);
    const when = stampIn(pill) ?? new Date();

    pill.classList.add("rm-timezone-pill");

    const there = offsetAt(when, name);
    const here = -when.getTimezoneOffset();
    const gap = there === null ? null : there - here;

    let words;
    if (gap === null) words = `time zone ${name}`;
    else if (gap === 0) words = "the same time as you";
    else {
      const size = Math.abs(gap);
      const h = Math.floor(size / 60);
      const m = size % 60;
      const parts = [];
      if (h) parts.push(h === 1 ? "1 hour" : `${h} hours`);
      if (m) parts.push(m === 1 ? "1 minute" : `${m} minutes`);
      words = `${parts.join(" ")} ${gap > 0 ? "ahead of" : "behind"} you`;
    }

    const local = there === null
      ? ""
      : say(tongue, { timeZone: name, hour: "2-digit", minute: "2-digit" }, when);

    const detail = document.createElement("span");
    detail.className = "rm-timezone-pill-detail";
    detail.textContent = local ? ` · ${local} · ${words}` : ` · ${words}`;
    pill.appendChild(detail);
    pill.classList.add(gap === null ? "is-unknown" : gap === 0 ? "is-level" : gap > 0 ? "is-ahead" : "is-behind");

    cleanups.push(() => {
      detail.remove();
      pill.classList.remove("rm-timezone-pill", "is-unknown", "is-level", "is-ahead", "is-behind");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Slots painted with a drag, and picked with a keyboard.
 *
 * Dragging across a grid is the fastest way to choose eleven half-hours, and it
 * is also the input method that excludes the most people, so the keyboard here
 * is not a fallback: it is a `role="grid"` with a roving tabindex, arrow keys,
 * Space to toggle and Shift with an arrow to paint a run. Every cell's name is
 * built from its own row and column headers, so it is heard as "Tuesday 3
 * March, 09:00" rather than as a coordinate.
 *
 * Two details make the drag behave. The pointer is captured on the table, so a
 * gesture that wanders off the edge still delivers its `pointerup` and the grid
 * does not stay stuck in painting mode forever — the single most common bug in
 * hand-rolled versions of this. And painting is skipped for touch pointers, one
 * tap toggling one cell instead, because the alternative is `touch-action:
 * none` across the whole grid and a page that cannot be scrolled past it.
 *
 *   <table data-rm-availability-grid>…</table>
 */
export function availabilityGrid(target = "[data-rm-availability-grid]", options = {}) {
  const tables = resolveElements(target);
  if (!tables.length) return () => {};

  const { locale = "", label = "Availability" } = options;
  const cleanups = [];

  for (const table of tables) {
    const cells = [...table.querySelectorAll("tbody td")];
    if (!cells.length) continue;

    const tongue = dataString(table, "rmLocale", locale);
    const headRow = table.querySelector("thead tr");

    table.classList.add("rm-availability-grid");
    table.setAttribute("role", "grid");
    table.setAttribute("aria-multiselectable", "true");
    table.setAttribute("aria-label", dataString(table, "rmLabel", label));
    for (const row of table.querySelectorAll("tr")) row.setAttribute("role", "row");
    // An availability grid has both kinds of header — days across the top and
    // hours down the side — and calling the hour stubs column headers sends a
    // screen reader's header-navigation walking the clock as if it were the
    // week. Position decides which is which.
    for (const head of table.querySelectorAll("th")) {
      head.setAttribute("role", head.closest("thead") ? "columnheader" : "rowheader");
    }

    const live = announcer(table.parentElement ?? table);

    /** The text a header contributes, formatted from its `<time>` where it has one. */
    const headWords = (cell, opts) => {
      const date = stampIn(cell);
      return date ? say(tongue, opts, date, cell.textContent.trim()) : cell.textContent.trim();
    };

    const hadSelected = new Map();

    cells.forEach((cell) => {
      const row = cell.parentElement;
      const column = [...row.children].indexOf(cell);
      const rowHead = row.querySelector("th");
      // The column index comes from the body row, so it has to be looked up in
      // the header row's own children. Indexing a filtered `th` list with it
      // shifts every cell by however many stub cells the header carries, which
      // is how a grid ends up telling you Monday is Tuesday.
      const candidate = headRow ? headRow.children[column] : null;
      const colHead = candidate && candidate.tagName === "TH" ? candidate : null;
      const when = [
        colHead ? headWords(colHead, { weekday: "long", day: "numeric", month: "long" }) : "",
        rowHead ? headWords(rowHead, { hour: "2-digit", minute: "2-digit" }) : "",
      ].filter(Boolean).join(", ");

      cell.classList.add("rm-availability-grid-cell");
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("tabindex", "-1");
      // The markup's own pre-selected slots are an input, so the value found
      // here is kept and put back on cleanup rather than wiped.
      hadSelected.set(cell, cell.getAttribute("aria-selected"));
      cell.setAttribute("aria-selected", cell.getAttribute("aria-selected") === "true" ? "true" : "false");
      cell.setAttribute("aria-label", when || "Slot");
    });
    let at = 0;
    cells[0].setAttribute("tabindex", "0");

    const count = () => cells.filter((cell) => cell.getAttribute("aria-selected") === "true").length;

    const paint = (cell, on) => {
      if (!cell || cell.getAttribute("aria-selected") === String(on)) return;
      cell.setAttribute("aria-selected", String(on));
      cell.classList.toggle("is-picked", on);
      if (!prefersReducedMotion()) {
        cell.animate([{ transform: "scale(0.88)" }, { transform: "none" }], { duration: 200, easing: EASE.out });
      }
    };

    const report = (cell) => {
      const total = count();
      live.textContent = `${cell.getAttribute("aria-label")} `
        + `${cell.getAttribute("aria-selected") === "true" ? "selected" : "cleared"}. `
        + `${total === 1 ? "1 slot" : `${total} slots`} chosen.`;
    };

    const columns = Math.max(1, [...table.querySelectorAll("tbody tr")][0]?.querySelectorAll("td").length ?? 1);

    const focusAt = (next) => {
      const to = clamp(next, 0, cells.length - 1);
      cells[at].setAttribute("tabindex", "-1");
      at = to;
      cells[at].setAttribute("tabindex", "0");
      cells[at].focus();
    };

    let painting = false;
    let wanted = true;

    const cellFrom = (event) => {
      const under = document.elementFromPoint(event.clientX, event.clientY);
      const cell = under?.closest?.("td");
      return cell && table.contains(cell) && cells.includes(cell) ? cell : null;
    };

    const onDown = (event) => {
      const cell = event.target.closest("td");
      if (!cell || !cells.includes(cell) || event.button > 0) return;
      focusAt(cells.indexOf(cell));
      wanted = cell.getAttribute("aria-selected") !== "true";
      paint(cell, wanted);
      report(cell);
      // A finger gets one tap per cell; claiming the gesture would cost the
      // page its scroll.
      if (event.pointerType === "touch") return;
      painting = true;
      table.setPointerCapture?.(event.pointerId);
    };

    const onMove = (event) => {
      if (!painting) return;
      const cell = cellFrom(event);
      if (cell) paint(cell, wanted);
    };

    const onUp = (event) => {
      if (!painting) return;
      painting = false;
      table.releasePointerCapture?.(event.pointerId);
      live.textContent = `${count() === 1 ? "1 slot" : `${count()} slots`} chosen.`;
    };

    const onKey = (event) => {
      const cell = event.target.closest("td");
      const index = cells.indexOf(cell);
      if (index < 0) return;
      let handled = true;
      switch (event.key) {
        case "ArrowRight": focusAt(index + 1); break;
        case "ArrowLeft": focusAt(index - 1); break;
        case "ArrowDown": focusAt(index + columns); break;
        case "ArrowUp": focusAt(index - columns); break;
        case "Home": focusAt(index - (index % columns)); break;
        case "End": focusAt(index - (index % columns) + columns - 1); break;
        case " ": case "Enter":
          paint(cell, cell.getAttribute("aria-selected") !== "true");
          report(cell);
          break;
        default: handled = false;
      }
      // Shift with an arrow paints the run it travels, which is the keyboard's
      // version of a drag rather than a second-class substitute for one.
      if (handled && event.shiftKey && event.key.startsWith("Arrow")) {
        paint(cells[at], cells[index].getAttribute("aria-selected") === "true");
        report(cells[at]);
      }
      if (handled) event.preventDefault();
    };

    table.addEventListener("pointerdown", onDown);
    table.addEventListener("pointermove", onMove);
    table.addEventListener("pointerup", onUp);
    table.addEventListener("pointercancel", onUp);
    table.addEventListener("keydown", onKey);

    cleanups.push(() => {
      table.removeEventListener("pointerdown", onDown);
      table.removeEventListener("pointermove", onMove);
      table.removeEventListener("pointerup", onUp);
      table.removeEventListener("pointercancel", onUp);
      table.removeEventListener("keydown", onKey);
      live.remove();
      for (const row of table.querySelectorAll("tr")) row.removeAttribute("role");
      for (const head of table.querySelectorAll("th")) head.removeAttribute("role");
      cells.forEach((cell) => {
        cell.classList.remove("rm-availability-grid-cell", "is-picked");
        cell.removeAttribute("role");
        cell.removeAttribute("tabindex");
        cell.removeAttribute("aria-label");
        const was = hadSelected.get(cell);
        if (was === null || was === undefined) cell.removeAttribute("aria-selected");
        else cell.setAttribute("aria-selected", was);
      });
      table.classList.remove("rm-availability-grid");
      table.removeAttribute("role");
      table.removeAttribute("aria-multiselectable");
      table.removeAttribute("aria-label");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Real radios, with the full ones still reachable.
 *
 * Every slot is an `<input type="radio">` in one named group, so the arrow keys
 * work, the form submits a value, and voice control can say "click ten
 * o'clock". The interesting decision is the unavailable ones: they are marked
 * `aria-disabled` and left in the tab order rather than given the `disabled`
 * attribute, because `disabled` removes a control from the keyboard entirely —
 * so a keyboard visitor tabs from 09:30 to 11:00 and is never told that 10:00
 * exists and is full. Selection is refused in the change handler instead, and
 * the refusal is spoken.
 *
 * "Full" is a word appended to the label, not a colour. The stagger on arrival
 * is a transform, so a list of twenty times does not reflow twenty times.
 *
 *   <fieldset data-rm-booking-slots>…</fieldset>
 */
export function bookingSlots(target = "[data-rm-booking-slots]", options = {}) {
  const groups = resolveElements(target);
  if (!groups.length) return () => {};

  const { locale = "", label = "Available times", stagger = 45 } = options;
  const cleanups = [];

  for (const group of groups) {
    const radios = [...group.querySelectorAll('input[type="radio"]')];
    if (!radios.length) continue;

    const tongue = dataString(group, "rmLocale", locale);
    const gap = prefersReducedMotion() ? 0 : dataNumber(group, "rmStagger", stagger);

    group.classList.add("rm-booking-slots");
    group.setAttribute("role", "radiogroup");
    group.setAttribute("aria-label", dataString(group, "rmLabel", label));
    const live = announcer(group);

    const marks = [];
    // Only the radios this pass actually named or disabled, so an author's own
    // hand-written label survives a mount and unmount.
    const named = [];
    const barred = [];
    let last = radios.find((one) => one.checked) ?? null;

    radios.forEach((radio) => {
      const row = radio.closest("li, label") ?? radio;
      const date = stampIn(row);
      const spoken = date ? say(tongue, { weekday: "long", hour: "2-digit", minute: "2-digit" }, date) : "";
      const full = dataString(row, "rmFull", "") === "true";

      row.classList.add("rm-booking-slots-slot");
      if (spoken) {
        radio.setAttribute("aria-label", spoken);
        named.push(radio);
      }
      if (!full) return;

      radio.setAttribute("aria-disabled", "true");
      barred.push(radio);
      row.classList.add("is-full");
      const word = said(" — full");
      (radio.closest("label") ?? row).appendChild(word);
      marks.push(word);
      const shown = document.createElement("span");
      shown.className = "rm-booking-slots-full";
      shown.setAttribute("aria-hidden", "true");
      shown.textContent = "Full";
      row.appendChild(shown);
      marks.push(shown);
    });

    const onChange = (event) => {
      const radio = event.target;
      if (!radios.includes(radio)) return;
      if (radio.getAttribute("aria-disabled") === "true") {
        radio.checked = false;
        if (last) last.checked = true;
        live.textContent = `${radio.getAttribute("aria-label") || radio.value} is already booked.`;
        if (!prefersReducedMotion()) {
          radio.closest("li, label")?.animate(
            [{ transform: "translateX(0)" }, { transform: "translateX(-5px)" },
              { transform: "translateX(4px)" }, { transform: "none" }],
            { duration: 280, easing: EASE.out },
          );
        }
        return;
      }
      last = radio;
      live.textContent = `${radio.getAttribute("aria-label") || radio.value} selected.`;
    };

    group.addEventListener("change", onChange);

    cleanups.push(watch(group, () => {
      if (!gap) return;
      radios.forEach((radio, i) => (radio.closest("li, label") ?? radio).animate(
        [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }],
        { duration: 340, delay: i * gap, easing: EASE.out },
      ));
    }, { threshold: 0.2, once: true }));

    cleanups.push(() => {
      group.removeEventListener("change", onChange);
      marks.forEach((mark) => mark.remove());
      live.remove();
      named.forEach((radio) => radio.removeAttribute("aria-label"));
      barred.forEach((radio) => radio.removeAttribute("aria-disabled"));
      radios.forEach((radio) => {
        (radio.closest("li, label") ?? radio).classList.remove("rm-booking-slots-slot", "is-full");
      });
      group.classList.remove("rm-booking-slots");
      group.removeAttribute("role");
      group.removeAttribute("aria-label");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * "Every two weeks on Tuesday", from real form controls.
 *
 * The controls are built here rather than taken from the markup, and that is
 * the one place in this file where that is the right answer: the sentence and
 * the RRULE are generated from the values, so an author-written option reading
 * "fortnightly" would produce a rule nothing could render. What the markup
 * supplies is the starting configuration, in `data-rm-freq`, `data-rm-interval`
 * and `data-rm-days`, so a saved rule can be handed back without JavaScript.
 *
 * The weekday row only applies to a weekly rule, and it collapses with
 * `grid-template-rows: 0fr → 1fr` — the one honest way to animate a box of
 * unknown height without touching `height`. Collapsed, it is also `inert`,
 * which takes it out of the tab order and out of the accessibility tree
 * together; hiding it with overflow alone leaves seven invisible checkboxes
 * that a keyboard still walks through.
 *
 *   <div data-rm-recurrence data-rm-freq="weekly" data-rm-days="2,4"></div>
 */
export function recurrenceBuilder(target = "[data-rm-recurrence]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { locale = "", label = "Repeat", name = "rrule", weekStart = 1 } = options;
  const CODES = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
  const UNITS = { daily: ["day", "days"], weekly: ["week", "weeks"], monthly: ["month", "months"], yearly: ["year", "years"] };
  const cleanups = [];

  for (const holder of holders) {
    const tongue = dataString(holder, "rmLocale", locale);
    const first = clamp(dataNumber(holder, "rmWeekStart", weekStart), 0, 6);
    const wanted = dataString(holder, "rmFreq", "weekly").toLowerCase();
    const freq = UNITS[wanted] ? wanted : "weekly";
    const every = Math.max(1, Math.round(dataNumber(holder, "rmInterval", 1)));
    const picked = new Set(
      dataString(holder, "rmDays", "").split(",").map((one) => Number(one.trim()))
        .filter((one) => Number.isInteger(one) && one >= 0 && one <= 6),
    );

    holder.classList.add("rm-recurrence");
    holder.setAttribute("role", "group");
    holder.setAttribute("aria-label", dataString(holder, "rmLabel", label));

    const row = document.createElement("div");
    row.className = "rm-recurrence-row";

    const count = document.createElement("input");
    count.type = "number";
    count.min = "1";
    count.max = "99";
    count.value = String(every);
    count.className = "rm-recurrence-interval";
    count.setAttribute("aria-label", "Repeat every");

    const kind = document.createElement("select");
    kind.className = "rm-recurrence-freq";
    kind.setAttribute("aria-label", "Repeat frequency");
    for (const key of Object.keys(UNITS)) {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = key[0].toUpperCase() + key.slice(1);
      kind.appendChild(option);
    }
    kind.value = freq;
    row.append(count, kind);

    // Weekday names from the locale, off a known week rather than a hard-coded
    // English list — a Spanish page should not be offered "Mon".
    const dayNames = [];
    for (let i = 0; i < 7; i++) {
      const sunday = new Date(2024, 0, 7 + i);
      dayNames.push({
        short: say(tongue, { weekday: "short" }, sunday),
        long: say(tongue, { weekday: "long" }, sunday),
      });
    }

    const shell = document.createElement("div");
    shell.className = "rm-recurrence-shell";
    const inner = document.createElement("div");
    inner.className = "rm-recurrence-inner";
    const dayRow = document.createElement("div");
    dayRow.className = "rm-recurrence-days";
    dayRow.setAttribute("role", "group");
    dayRow.setAttribute("aria-label", "Days of the week");

    const boxes = [];
    for (let i = 0; i < 7; i++) {
      const index = (first + i) % 7;
      const tag = document.createElement("label");
      tag.className = "rm-recurrence-day";
      const box = document.createElement("input");
      box.type = "checkbox";
      box.value = String(index);
      box.checked = picked.has(index);
      box.setAttribute("aria-label", dayNames[index].long);
      const face = document.createElement("span");
      face.textContent = dayNames[index].short;
      tag.append(box, face);
      dayRow.appendChild(tag);
      boxes.push(box);
    }
    inner.appendChild(dayRow);
    shell.appendChild(inner);

    const rule = document.createElement("input");
    rule.type = "hidden";
    rule.name = dataString(holder, "rmName", name);

    const sentence = document.createElement("p");
    sentence.className = "rm-recurrence-sentence";
    sentence.setAttribute("role", "status");
    sentence.setAttribute("aria-live", "polite");

    holder.append(row, shell, rule, sentence);

    const sync = () => {
      const n = clamp(Math.round(Number(count.value) || 1), 1, 99);
      const which = UNITS[kind.value] ? kind.value : "weekly";
      const on = boxes.filter((box) => box.checked).map((box) => Number(box.value)).sort((a, b) => a - b);

      const weekly = which === "weekly";
      shell.classList.toggle("is-open", weekly);
      // Collapsed means gone: out of the layout and out of the tab order.
      inner.inert = !weekly;

      const unit = UNITS[which][n === 1 ? 0 : 1];
      const days = weekly && on.length ? ` on ${joinWords(tongue, on.map((i) => dayNames[i].long))}` : "";
      sentence.textContent = `Every ${n === 1 ? "" : `${n} `}${unit}${days}.`;

      rule.value = `FREQ=${which.toUpperCase()};INTERVAL=${n}`
        + (weekly && on.length ? `;BYDAY=${on.map((i) => CODES[i]).join(",")}` : "");
      holder.dispatchEvent(new CustomEvent("rm-recurrence-change", {
        bubbles: true, detail: { rule: rule.value, words: sentence.textContent },
      }));
    };

    count.addEventListener("input", sync);
    kind.addEventListener("change", sync);
    dayRow.addEventListener("change", sync);
    sync();

    cleanups.push(() => {
      count.removeEventListener("input", sync);
      kind.removeEventListener("change", sync);
      dayRow.removeEventListener("change", sync);
      row.remove();
      shell.remove();
      rule.remove();
      sentence.remove();
      holder.classList.remove("rm-recurrence");
      holder.removeAttribute("role");
      holder.removeAttribute("aria-label");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Grouped by day, with headings that know they are stuck.
 *
 * Each day is a `<section>` with a real heading, so the agenda has a document
 * outline and a screen reader can jump day to day. The relative words — "Today",
 * "Tomorrow", "Yesterday", or whatever `data-rm-locale` calls them — are put in
 * front of the existing heading rather than
 * replacing it, so "3 March" is still there for anyone reading it a week
 * later, and the comparison is made against `data-rm-today` when the page
 * declares one, which is what lets a cached or server-rendered agenda be right.
 *
 * There is no `:stuck` selector in CSS, so the class on a pinned heading comes
 * from an IntersectionObserver watching a zero-height sentinel above it: when
 * the sentinel leaves the top of the scroller, the heading has taken its place.
 * The usual version listens to `scroll` and measures, which is a layout read on
 * every frame of every scroll.
 *
 *   <div data-rm-agenda-list data-rm-today="2026-03-03">…</div>
 */
export function agendaList(target = "[data-rm-agenda-list]", options = {}) {
  const lists = resolveElements(target);
  if (!lists.length) return () => {};

  const { group = "section", item = "li", locale = "", stagger = 50, label = "Agenda" } = options;
  const cleanups = [];

  for (const list of lists) {
    const groups = [...list.querySelectorAll(dataString(list, "rmGroup", group))];
    if (!groups.length) continue;

    const tongue = dataString(list, "rmLocale", locale);
    const pick = dataString(list, "rmItem", item);
    const gap = prefersReducedMotion() ? 0 : dataNumber(list, "rmStagger", stagger);
    const todayKey = dataString(list, "rmToday", dayKey(new Date()));

    list.classList.add("rm-agenda-list");
    list.setAttribute("role", "region");
    list.setAttribute("aria-label", dataString(list, "rmLabel", label));

    const added = [];
    const observers = [];

    for (const section of groups) {
      const heading = section.querySelector("h1, h2, h3, h4, h5, h6");
      const date = stampIn(section);
      if (!heading) continue;

      if (!heading.id) heading.id = uid("rm-agenda");
      section.setAttribute("aria-labelledby", heading.id);
      heading.classList.add("rm-agenda-list-heading");
      section.classList.add("rm-agenda-list-group");

      if (date) {
        const days = Math.round((parseStamp(dayKey(date)) - parseStamp(todayKey)) / 86400000);
        const word = relativeDay(tongue, days);
        if (word) {
          const tag = document.createElement("span");
          tag.className = "rm-agenda-list-when";
          // One node, carrying its own trailing space, so removing it on
          // cleanup leaves the author's heading exactly as it was found.
          tag.textContent = `${word} `;
          heading.prepend(tag);
          added.push(tag);
          if (days === 0) section.setAttribute("aria-current", "date");
        }
      }

      const sentinel = document.createElement("span");
      sentinel.className = "rm-agenda-list-sentinel";
      sentinel.setAttribute("aria-hidden", "true");
      section.prepend(sentinel);
      added.push(sentinel);

      if (typeof IntersectionObserver === "function") {
        const watcher = new IntersectionObserver(
          ([entry]) => heading.classList.toggle("is-stuck", !entry.isIntersecting && entry.boundingClientRect.top < 0),
          { threshold: 0 },
        );
        watcher.observe(sentinel);
        observers.push(watcher);
      }

      cleanups.push(watch(section, () => {
        if (!gap) return;
        [...section.querySelectorAll(pick)].forEach((entry, i) => entry.animate(
          [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }],
          { duration: 360, delay: i * gap, easing: EASE.out },
        ));
      }, { threshold: 0.15, once: true }));
    }

    cleanups.push(() => {
      observers.forEach((watcher) => watcher.disconnect());
      added.forEach((node) => node.remove());
      groups.forEach((section) => {
        section.classList.remove("rm-agenda-list-group");
        section.removeAttribute("aria-labelledby");
        section.removeAttribute("aria-current");
        section.querySelector("h1, h2, h3, h4, h5, h6")?.classList.remove("rm-agenda-list-heading", "is-stuck");
      });
      list.classList.remove("rm-agenda-list");
      list.removeAttribute("role");
      list.removeAttribute("aria-label");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * A tone that changes, and a sentence that explains it.
 *
 * An amber pill means "soon" to the person who designed it and nothing at all
 * to anyone else, so the words come first here: "due in 2 days", "overdue by 3
 * hours", generated with `Intl.RelativeTimeFormat` in the page's own language
 * and appended as real text. The colour is then allowed to agree with the
 * sentence, which is the correct order of those two decisions.
 *
 * The deadline itself is read from a `<time datetime>` in the markup, never
 * computed, so the pill is identical on the server and in the browser; only the
 * comparison against now is live. It re-checks once a minute and only while it
 * is on screen, because a page of forty deadlines does not need forty timers
 * running in a background tab.
 *
 *   <span data-rm-deadline-pill data-rm-soon="48"><time datetime="…">5 March</time></span>
 */
export function deadlinePill(target = "[data-rm-deadline-pill]", options = {}) {
  const pills = resolveElements(target);
  if (!pills.length) return () => {};

  const { soon = 72, urgent = 12, locale = "" } = options;
  const TONES = ["is-far", "is-soon", "is-urgent", "is-overdue"];
  const cleanups = [];

  for (const pill of pills) {
    const due = stampIn(pill);
    if (!due) continue;

    const tongue = dataString(pill, "rmLocale", locale);
    const soonAt = Math.max(1, dataNumber(pill, "rmSoon", soon)) * 60;
    const urgentAt = Math.max(1, dataNumber(pill, "rmUrgent", urgent)) * 60;

    pill.classList.add("rm-deadline-pill");
    const words = document.createElement("span");
    words.className = "rm-deadline-pill-words";
    pill.appendChild(words);

    let relative;
    try {
      relative = new Intl.RelativeTimeFormat(tongue || undefined, { numeric: "auto" });
    } catch {
      relative = null;
    }

    const draw = () => {
      const left = Math.round((due.getTime() - Date.now()) / 60000);
      const size = Math.abs(left);
      const [value, unit] = size < 60 ? [left, "minute"]
        : size < 60 * 48 ? [Math.round(left / 60), "hour"]
          : [Math.round(left / 1440), "day"];

      const phrase = relative ? relative.format(value, unit) : `${value} ${unit}s`;
      words.textContent = left < 0 ? ` — overdue, ${phrase}` : ` — due ${phrase}`;

      const tone = left < 0 ? "is-overdue" : left <= urgentAt ? "is-urgent" : left <= soonAt ? "is-soon" : "is-far";
      if (!pill.classList.contains(tone)) {
        pill.classList.remove(...TONES);
        pill.classList.add(tone);
        if (!prefersReducedMotion()) {
          pill.animate([{ transform: "scale(1.06)" }, { transform: "none" }], { duration: 260, easing: EASE.out });
        }
      }
    };
    draw();

    cleanups.push(whileVisible(pill, () => {
      const timer = setInterval(draw, 60000);
      draw();
      return () => clearInterval(timer);
    }));

    cleanups.push(() => {
      words.remove();
      pill.classList.remove("rm-deadline-pill", ...TONES);
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * Overlapping events laid side by side instead of on top of each other.
 *
 * Placing events by time is arithmetic anybody can do; the part that is
 * routinely skipped is what happens when two of them touch. The naive version
 * gives every event the full column width and stacks them, and a ten o'clock
 * meeting disappears behind a nine-thirty one. This does the sweep: events are
 * sorted by start, grouped into clusters that genuinely overlap, and each is
 * given the first free lane in its cluster, with the cluster's lane count
 * written alongside it so the CSS can divide the column.
 *
 * Lane and width are set once, as custom properties, and never animated — the
 * entrance is a transform from a stacked position into the lane, which is why
 * eleven colliding events settle without a single reflow. An event whose end is
 * missing or before its start is treated as thirty minutes long rather than
 * being dropped, because an event with a bad end time is still an event
 * somebody has.
 *
 *   <ol data-rm-event-chip data-rm-hour-from="9" data-rm-hour-to="18">…</ol>
 */
export function eventChip(target = "[data-rm-event-chip]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { hourFrom = 8, hourTo = 20, item = "li", locale = "", duration = 460 } = options;
  const cleanups = [];

  for (const holder of holders) {
    const from = clamp(dataNumber(holder, "rmHourFrom", hourFrom), 0, 23) * 60;
    const to = clamp(dataNumber(holder, "rmHourTo", hourTo), 1, 24) * 60;
    const span = Math.max(60, to - from);
    const tongue = dataString(holder, "rmLocale", locale);
    const speed = prefersReducedMotion() ? 0 : dataNumber(holder, "rmDuration", duration);
    const chips = [...holder.querySelectorAll(dataString(holder, "rmItem", item))];
    if (!chips.length) continue;

    holder.classList.add("rm-event-chip-set");

    const placed = chips.map((chip) => {
      const start = stampIn(chip, 0);
      const end = stampIn(chip, 1);
      if (!start) return null;
      const begins = minutesOfDay(start);
      const ends = end && minutesOfDay(end) > begins ? minutesOfDay(end) : begins + 30;
      return { chip, begins, ends, start, end };
    }).filter(Boolean).sort((a, b) => a.begins - b.begins || a.ends - b.ends);

    // One sweep: a cluster ends the moment an event starts after everything in
    // it has finished, and only inside a cluster do lanes have to be shared.
    let cluster = [];
    let clusterEnd = -Infinity;
    const clusters = [];
    for (const one of placed) {
      if (one.begins >= clusterEnd && cluster.length) { clusters.push(cluster); cluster = []; }
      cluster.push(one);
      clusterEnd = Math.max(clusterEnd, one.ends);
    }
    if (cluster.length) clusters.push(cluster);

    const clock = { hour: "2-digit", minute: "2-digit" };
    for (const group of clusters) {
      const lanes = [];
      for (const one of group) {
        let lane = lanes.findIndex((free) => free <= one.begins);
        if (lane < 0) { lane = lanes.length; lanes.push(0); }
        lanes[lane] = one.ends;
        one.lane = lane;
      }
      for (const one of group) {
        const top = clamp(mapRange(one.begins, from, to, 0, 100), 0, 100);
        const tail = clamp(mapRange(one.ends, from, to, 0, 100), 0, 100);
        one.chip.classList.add("rm-event-chip");
        one.chip.style.setProperty("--rm-event-chip-top", `${top}%`);
        one.chip.style.setProperty("--rm-event-chip-size", `${Math.max(2.5, tail - top)}%`);
        one.chip.style.setProperty("--rm-event-chip-lane", String(one.lane));
        one.chip.style.setProperty("--rm-event-chip-lanes", String(lanes.length));
        one.chip.setAttribute(
          "aria-label",
          `${one.chip.textContent.replace(/\s+/g, " ").trim()}, `
          + `${say(tongue, clock, one.start)} to ${say(tongue, clock, one.end ?? one.start)}`
          + (lanes.length > 1 ? `, ${lanes.length} overlapping events` : ""),
        );
      }
    }

    cleanups.push(watch(holder, () => {
      if (!speed) return;
      placed.forEach((one, i) => one.chip.animate(
        [
          { opacity: 0, transform: `translateX(${-one.lane * 8 - 6}px) scale(0.96)` },
          { opacity: 1, transform: "none" },
        ],
        { duration: speed, delay: i * 40, easing: EASE.out },
      ));
    }, { threshold: 0.2, once: true }));

    cleanups.push(() => {
      placed.forEach((one) => {
        one.chip.classList.remove("rm-event-chip");
        one.chip.style.removeProperty("--rm-event-chip-top");
        one.chip.style.removeProperty("--rm-event-chip-size");
        one.chip.style.removeProperty("--rm-event-chip-lane");
        one.chip.style.removeProperty("--rm-event-chip-lanes");
        one.chip.removeAttribute("aria-label");
      });
      holder.classList.remove("rm-event-chip-set");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * A horizontal week that scrolls itself and nothing else.
 *
 * A strip of days is a single choice from a set, so it is a real radio group:
 * `role="radiogroup"`, `role="radio"` on each day, arrow keys, Home and End,
 * and one tab stop for the whole strip. Days are `<button>`s so they are
 * clickable and focusable without any of the div-and-tabindex arrangements that
 * lose the Enter key.
 *
 * Keeping the chosen day visible uses `keepInView` rather than
 * `scrollIntoView`, and that is the entire reason the helper exists:
 * `scrollIntoView` walks up and scrolls every scrollable ancestor including the
 * document, so a strip that highlights today on mount throws the whole page
 * down to wherever the strip happens to be. This scrolls the one box that
 * should move.
 *
 * The fades at the ends are masks driven by two classes, recalculated on scroll
 * and on resize, because a strip that fades at an edge it has already reached
 * is claiming there is more to see when there is not.
 *
 *   <div data-rm-week-strip data-rm-today="2026-03-03">…</div>
 */
export function weekStrip(target = "[data-rm-week-strip]", options = {}) {
  const strips = resolveElements(target);
  if (!strips.length) return () => {};

  const { locale = "", label = "Choose a day", item = "button" } = options;
  const cleanups = [];

  for (const strip of strips) {
    const days = [...strip.querySelectorAll(dataString(strip, "rmItem", item))];
    if (!days.length) continue;

    const tongue = dataString(strip, "rmLocale", locale);
    const todayKey = dataString(strip, "rmToday", "");
    const rail = days[0].closest("ul, ol, div") ?? strip;

    strip.classList.add("rm-week-strip");
    strip.setAttribute("role", "radiogroup");
    strip.setAttribute("aria-label", dataString(strip, "rmLabel", label));

    let at = 0;
    days.forEach((day, i) => {
      const date = stampIn(day);
      day.classList.add("rm-week-strip-day");
      day.setAttribute("role", "radio");
      day.setAttribute("tabindex", "-1");
      day.setAttribute("aria-checked", "false");
      // A label replaces the button's subtree for the accessible name, so the
      // second line authors put in these buttons — "5 events", "Free" — has to
      // be folded back in or it is thrown away, and a voice-control user who
      // says "click five events" matches nothing on the page.
      const stamp = day.querySelector("time[datetime]");
      const dated = say(tongue, { dateStyle: "full" }, date, day.textContent.trim());
      const rest = date && stamp
        ? day.textContent.replace(stamp.textContent, " ").replace(/\s+/g, " ").trim()
        : "";
      day.setAttribute("aria-label", rest ? `${dated}, ${rest}` : dated);
      if (date && todayKey && dayKey(date) === todayKey) {
        day.setAttribute("aria-current", "date");
        day.classList.add("is-today");
        at = i;
      }
    });

    const choose = (index, move = true) => {
      days.forEach((day, i) => {
        day.setAttribute("aria-checked", i === index ? "true" : "false");
        day.setAttribute("tabindex", i === index ? "0" : "-1");
        day.classList.toggle("is-chosen", i === index);
      });
      at = index;
      if (move) days[index].focus();
      keepInView(rail, days[index], prefersReducedMotion() ? "auto" : "smooth");
      strip.dispatchEvent(new CustomEvent("rm-date-select", {
        bubbles: true, detail: { date: stampIn(days[index]), iso: dayKey(stampIn(days[index])) },
      }));
    };

    const onKey = (event) => {
      const index = days.indexOf(event.target.closest(dataString(strip, "rmItem", item)));
      if (index < 0) return;
      let handled = true;
      switch (event.key) {
        case "ArrowRight": case "ArrowDown": choose(clamp(index + 1, 0, days.length - 1)); break;
        case "ArrowLeft": case "ArrowUp": choose(clamp(index - 1, 0, days.length - 1)); break;
        case "Home": choose(0); break;
        case "End": choose(days.length - 1); break;
        case " ": case "Enter": choose(index); break;
        default: handled = false;
      }
      if (handled) event.preventDefault();
    };

    const onClick = (event) => {
      const index = days.indexOf(event.target.closest(dataString(strip, "rmItem", item)));
      if (index >= 0) choose(index, false);
    };

    const edges = () => {
      strip.classList.toggle("is-scrolled-start", rail.scrollLeft > 4);
      strip.classList.toggle("is-scrolled-end", rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 4);
    };

    strip.addEventListener("keydown", onKey);
    strip.addEventListener("click", onClick);
    rail.addEventListener("scroll", edges, { passive: true });

    let sizer = null;
    if (typeof ResizeObserver === "function") {
      sizer = new ResizeObserver(edges);
      sizer.observe(rail);
    }

    days[at].setAttribute("tabindex", "0");
    keepInView(rail, days[at], "auto");
    edges();

    cleanups.push(() => {
      strip.removeEventListener("keydown", onKey);
      strip.removeEventListener("click", onClick);
      rail.removeEventListener("scroll", edges);
      sizer?.disconnect();
      days.forEach((day) => {
        day.classList.remove("rm-week-strip-day", "is-today", "is-chosen");
        day.removeAttribute("role");
        day.removeAttribute("tabindex");
        day.removeAttribute("aria-checked");
        day.removeAttribute("aria-label");
        day.removeAttribute("aria-current");
      });
      strip.classList.remove("rm-week-strip", "is-scrolled-start", "is-scrolled-end");
      strip.removeAttribute("role");
      strip.removeAttribute("aria-label");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}
