/*
 * The demo page's own script.
 *
 * Deliberately thin. Everything that moves on this page is started by the
 * library's `init()` from the markup attributes — if this file grew a special
 * case, the page would stop being an honest demonstration of what you get.
 *
 * Crafted by SoyRage Agency — https://soyrage.es/
 */

import { init, cursor, magnetLines } from "../src/index.js";

init();

// The custom cursor is excluded from init() on purpose — it is a page-wide
// decision, not a default. This page makes it, for fine pointers only.
if (matchMedia("(pointer: fine)").matches) cursor({ blend: "difference" });

// The line field in the hero sits outside the grid init() walks, and wants a
// denser grid than the default.
magnetLines(".hero-lines", { columns: 18, rows: 7, length: 26 });

/* ── Copy to clipboard ─────────────────────────────────────────────────── */

const toast = document.querySelector(".toast");
let toastTimer = 0;

function say(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 2000);
}

// One listener for the page rather than one per button, which is the same
// reason the components do it that way.
document.addEventListener("click", async (event) => {
  const trigger = event.target.closest("[data-copy]");
  if (!trigger) return;

  const text = trigger.dataset.copy;
  try {
    await navigator.clipboard.writeText(text);
    say("Copiado");
  } catch {
    // Clipboard access is refused in plenty of ordinary situations — an
    // insecure origin, a browser setting, a page without focus. Select the
    // text instead so there is still a way to take it.
    say("Selecciónalo y cópialo: " + text);
    return;
  }

  trigger.classList.add("is-done");
  setTimeout(() => trigger.classList.remove("is-done"), 1400);
});
