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

import { init, cursor, target, crosshair, splash, waves, retroGrid, dotGrid } from "../src/index.js";

init();

/* ── Fields ────────────────────────────────────────────────────────────── */

waves("#hero-field", { lines: 20, amplitude: 24, color: "rgba(42,167,228,0.22)" });
waves("#field-waves", { lines: 12, amplitude: 16, wavelength: 220, color: "rgba(42,167,228,0.4)" });
retroGrid("#field-retro", { cell: 34, speed: 9000 });
dotGrid("#field-dots", { gap: 20, color: "rgba(255,255,255,0.16)" });

/* ── Cursor picker ─────────────────────────────────────────────────────── */

// A custom cursor is a page-level decision, so init() does not make it. This
// page makes it, and lets you change your mind.
const CURSORS = { cursor, target, crosshair, splash };
let stopCursor = target();

document.querySelector(".cursor-picker")?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-cursor]");
  if (!button) return;

  stopCursor?.();
  stopCursor = CURSORS[button.dataset.cursor]?.() ?? null;

  for (const other of button.parentElement.children) {
    other.setAttribute("aria-pressed", String(other === button));
  }
});

/* ── Copy to clipboard ─────────────────────────────────────────────────── */

const toast = document.querySelector(".toast");
let toastTimer = 0;

function say(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 1800);
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
