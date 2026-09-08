/*
 * The demo page's own script.
 *
 * Deliberately thin. Everything in the catalogue is started by the library's
 * `init()` from the markup attributes — if this file grew a special case, the
 * page would stop being an honest demonstration of what you get.
 *
 * What is called by hand is only what `init()` deliberately leaves alone: the
 * generative fields, which belong to one element rather than to every match on
 * a page, and the cursors, which are a page-level decision.
 *
 * Crafted by SoyRage Agency — https://soyrage.es/
 */

import {
  init, cursor, target, crosshair, splash, waves, retroGrid, dotGrid, confetti,
  cartoonCursor, blobCursor, trailCursor, sayCursor, spotlightCursor, arrowCursor, lensCursor,
  REVEAL_EFFECTS, BUTTON_STYLES, CARD_LOOKS, INPUT_LOOKS, toast,
} from "../src/index.js";

/* ── The two big grids ─────────────────────────────────────────────────── */

/*
 * Built from the library's own exported lists rather than written out by
 * hand, so the page cannot claim an effect the kit does not have — or quietly
 * miss one it does. Add a name to the table in reveal.js and a tile appears
 * here on the next reload.
 */
function fillGrid(id, names, build) {
  const holder = document.querySelector(id);
  if (!holder) return;
  holder.append(...names.map(build));
}

fillGrid("#effect-grid", REVEAL_EFFECTS, (name) => {
  const tile = document.createElement("div");
  tile.className = "effect-tile";
  tile.dataset.rmReveal = name;
  tile.innerHTML = `<b>${name}</b>`;
  return tile;
});

fillGrid("#card-grid", CARD_LOOKS, (name) => {
  const card = document.createElement("article");
  card.className = "look-card";
  card.dataset.rmCardKit = name;
  card.tabIndex = 0;
  card.innerHTML =
    `<span class="look-media"></span><h4>${name}</h4>` +
    `<span class="look-meta" data-rm-card-meta>hover or focus</span>`;
  return card;
});

fillGrid("#button-grid", BUTTON_STYLES, (name) => {
  const cell = document.createElement("div");
  cell.className = "button-cell";
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.rmBtn = name;
  button.dataset.rmTwin = "→";
  button.textContent = name;
  const label = document.createElement("span");
  label.className = "button-cell-name";
  label.textContent = name;
  cell.append(button, label);
  return cell;
});

fillGrid("#input-grid", INPUT_LOOKS, (name) => {
  const holder = document.createElement("label");
  holder.className = "input-cell";
  holder.dataset.rmInput = name;
  const caption = document.createElement("span");
  caption.textContent = name;
  const field = document.createElement("input");
  field.type = "text";
  field.placeholder = "Type here";
  field.setAttribute("aria-label", name);
  holder.append(caption, field);
  return holder;
});

init();

/* ── Fields ────────────────────────────────────────────────────────────── */

waves("#hero-field", { lines: 20, amplitude: 24, color: "rgba(42,167,228,0.22)" });
waves("#field-waves", { lines: 12, amplitude: 16, wavelength: 220, color: "rgba(42,167,228,0.4)" });
retroGrid("#field-retro", { cell: 34, speed: 9000 });
dotGrid("#field-dots", { gap: 20, color: "rgba(255,255,255,0.16)" });

/* ── The demos that need a caller ─────────────────────────────────────── */

// island, toast and badgeCount all hand back a method rather than deciding for
// you when something has happened, so the page supplies the moment.
const islandPill = document.querySelector("[data-rm-island]");
const islandStates = [
  ["<b>Uploading</b> · 40%", 2600],
  ["<b>Saved</b> to drafts", 2400],
  ["<b>Now playing</b> · Motion", 3000],
];
let islandAt = 0;
document.querySelector("#island-demo")?.addEventListener("click", () => {
  const [html, keep] = islandStates[islandAt % islandStates.length];
  islandAt++;
  islandPill?.rmShow?.(html, keep);
});

const push = toast();
const notices = [
  ["Copied to your clipboard", "good"],
  ["That did not send — try again", "bad"],
  ["Three files queued", "plain"],
];
let noticeAt = 0;
document.querySelector("#toast-demo")?.addEventListener("click", () => {
  const [message, kind] = notices[noticeAt % notices.length];
  noticeAt++;
  push(message, { kind });
});

const badge = document.querySelector("#badge-demo");
let unread = 3;
setInterval(() => {
  unread = (unread % 9) + 1;
  badge?.rmSet?.(unread);
}, 3400);

/* ── The form demos ─────────────────────────────────────────────────────── */

// Both of these hand back a method rather than deciding for you what counts as
// success, so the page supplies the rule — here, a passcode and a pretend
// request.
const successDemo = document.querySelector("#success-demo");
successDemo?.addEventListener("click", () => {
  successDemo.rmBusy?.();
  setTimeout(() => successDemo.rmSuccess?.(), 900);
});

const lockWrap = document.querySelector("[data-rm-lock]");
const lockInput = document.querySelector("#lock-input");
lockInput?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  if (lockInput.value === "1234") lockWrap?.rmUnlock?.();
  else lockWrap?.rmDeny?.();
});

/* ── Confetti ──────────────────────────────────────────────────────────── */

// confetti() hands back a fire() rather than binding itself to anything, so
// the page decides what counts as good news.
const fire = confetti();
document.querySelector("#confetti-button")?.addEventListener("click", (event) => {
  fire({ x: event.clientX, y: event.clientY });
});

/* ── Cursor picker ─────────────────────────────────────────────────────── */

// A custom cursor is a page-level decision, so init() does not make it. This
// page makes it, and lets you change your mind.
const CURSORS = {
  cursor, target, crosshair, splash,
  cartoonCursor, blobCursor, trailCursor, sayCursor, spotlightCursor, arrowCursor, lensCursor,
};
// The page starts on the system cursor. Replacing someone pointer before they
// have asked is the fastest way to make a site feel broken, and half the point
// of shipping four of these is that a site should pick one deliberately.
let stopCursor = null;

const pickers = [...document.querySelectorAll(".cursor-picker")];
for (const picker of pickers) {
  picker.addEventListener("click", (event) => {
    const button = event.target.closest("[data-cursor]");
    if (!button) return;

    stopCursor?.();
    stopCursor = CURSORS[button.dataset.cursor]?.() ?? null;

    // Both pickers show the same state, wherever you changed it.
    const chosen = button.dataset.cursor;
    for (const other of pickers.flatMap((one) => [...one.children])) {
      other.setAttribute("aria-pressed", String(other.dataset.cursor === chosen));
    }
  });
}

/* ── Copy to clipboard ─────────────────────────────────────────────────── */

const copyNotice = document.querySelector(".toast");
let toastTimer = 0;

function say(message) {
  if (!copyNotice) return;
  copyNotice.textContent = message;
  copyNotice.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { copyNotice.hidden = true; }, 1800);
}

// One listener for the page rather than one per button, which is the same
// reason the components do it that way.
document.addEventListener("click", async (event) => {
  const trigger = event.target.closest("[data-copy]");
  if (!trigger) return;

  try {
    await navigator.clipboard.writeText(trigger.dataset.copy);
    say("Copied");
  } catch {
    // Clipboard access is refused in plenty of ordinary situations — an
    // insecure origin, a browser setting, a page without focus. Say so rather
    // than pretending it worked.
    say("Clipboard blocked — select it and copy");
    return;
  }

  trigger.classList.add("is-done");
  setTimeout(() => trigger.classList.remove("is-done"), 1200);
});
