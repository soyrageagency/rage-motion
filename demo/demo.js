/*
 * The demo page's own script.
 *
 * Deliberately thin. Everything that moves on this page is started by the
 * library's `init()` from the markup attributes — if this file grew a special
 * case, the page would stop being an honest demonstration of what you get.
 *
 * The only things called by hand are the ones `init()` deliberately leaves
 * alone: page-level decisions a site has to make on purpose.
 *
 * Crafted by SoyRage Agency — https://soyrage.es/
 */

import { init, target, waves } from "../src/index.js";

init();

// A custom cursor is a page-level decision, so it is excluded from init().
// This page makes it, for fine pointers only.
target();

// The hero field takes an element rather than a selector set, because a
// generative background belongs to one section, not to every match on a page.
waves("#hero-field", { lines: 22, amplitude: 22, color: "rgba(42,167,228,0.28)" });

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
    say("Copied");
  } catch {
    // Clipboard access is refused in plenty of ordinary situations — an
    // insecure origin, a browser setting, a page without focus. Say so rather
    // than pretending it worked.
    say("Clipboard blocked — select it and copy");
    return;
  }

  trigger.classList.add("is-done");
  setTimeout(() => trigger.classList.remove("is-done"), 1400);
});
