/**
 * Page transitions.
 *
 * Built on the View Transitions API, which is supported in Chrome, Safari and
 * Firefox. The browser takes a snapshot of the old page, a snapshot of the
 * new one, and cross-fades between them — including matching elements that
 * exist in both, which is what makes a thumbnail appear to grow into a hero.
 *
 * Two rules:
 *
 *   • Never trap navigation. If the API is missing, or the fetch fails, the
 *     link works normally. A transition layer that swallows clicks when
 *     something goes wrong is worse than no transition.
 *   • Never intercept a link the visitor meant to open elsewhere: a new tab,
 *     a download, an external host, or a modified click.
 *
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import { prefersReducedMotion, supportsViewTransitions } from "../core/motion.js";

/** Should this click be handled as an in-page transition? */
function isInternalNavigation(event, link) {
  if (event.defaultPrevented) return false;
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (!link || link.target === "_blank" || link.hasAttribute("download")) return false;
  if (link.dataset.rmNoTransition !== undefined) return false;
  const url = new URL(link.href, location.href);
  if (url.origin !== location.origin) return false;
  // A same-page anchor is a scroll, not a navigation.
  if (url.pathname === location.pathname && url.hash) return false;
  return true;
}

/**
 * Swap to another URL with a view transition.
 *
 * Fetches the document, replaces the body, updates the head's title, and
 * pushes history — the minimum that makes a multi-page site feel continuous
 * without becoming a single-page app.
 */
export async function transitionTo(url, { push = true } = {}) {
  const response = await fetch(url, { headers: { "X-Requested-With": "rage-motion" } });
  if (!response.ok) throw new Error(`Navigation to ${url} failed with ${response.status}`);
  const html = await response.text();
  const next = new DOMParser().parseFromString(html, "text/html");

  const apply = () => {
    document.title = next.title;
    document.body.replaceWith(next.body);
    if (push) history.pushState({}, "", url);
    scrollTo({ top: 0, behavior: "instant" });
    // Anything listening can re-initialise components on the new body.
    dispatchEvent(new CustomEvent("rm:navigated", { detail: { url } }));
  };

  if (!supportsViewTransitions() || prefersReducedMotion()) {
    apply();
    return;
  }
  await document.startViewTransition(apply).finished.catch(() => {});
}

/**
 * Intercept internal links and navigate with a transition.
 *
 * @param {object} options
 * @returns {() => void} stop intercepting
 */
export function pageTransition(options = {}) {
  const { selector = "a[href]", duration = 520 } = options;

  document.documentElement.style.setProperty("--rm-transition-duration", `${duration}ms`);
  document.documentElement.classList.add("rm-transitions");

  const onClick = (event) => {
    const link = event.target.closest?.(selector);
    if (!isInternalNavigation(event, link)) return;
    event.preventDefault();
    // A failed transition must still navigate: fall back to a normal load.
    transitionTo(link.href).catch(() => { location.href = link.href; });
  };

  const onPop = () => {
    transitionTo(location.href, { push: false }).catch(() => location.reload());
  };

  document.addEventListener("click", onClick);
  addEventListener("popstate", onPop);

  return () => {
    document.removeEventListener("click", onClick);
    removeEventListener("popstate", onPop);
    document.documentElement.classList.remove("rm-transitions");
  };
}
