/**
 * Text splitting for staggered reveals.
 *
 * Wrapping every character in a span is the standard trick and it quietly
 * breaks three things, so this handles all three:
 *
 *   • Screen readers. A heading split into forty spans is announced as forty
 *     fragments. The original text is restored to the element as an
 *     `aria-label` and the pieces are hidden from the accessibility tree, so
 *     the heading is still read as one sentence.
 *   • Text selection and copy. Splitting into inline-blocks without care
 *     inserts spaces that were never there. Words keep their real spaces.
 *   • Line breaks. Splitting by character before layout means a word can wrap
 *     mid-word. Characters are wrapped inside word wrappers, so words stay
 *     unbreakable.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

const ORIGINAL = new WeakMap();

/**
 * Split an element's text into animatable pieces.
 *
 * @param {Element} element
 * @param {"chars"|"words"|"lines"} by
 * @returns {HTMLElement[]} the pieces, in reading order
 */
export function split(element, by = "words") {
  const text = ORIGINAL.get(element) ?? element.textContent ?? "";
  ORIGINAL.set(element, text);

  // The visible text becomes decoration; the accessible name carries meaning.
  if (!element.hasAttribute("aria-label")) element.setAttribute("aria-label", text.trim());

  if (by === "lines") return splitLines(element, text);

  const words = text.split(/(\s+)/);
  const fragment = document.createDocumentFragment();
  const pieces = [];

  for (const word of words) {
    if (!word) continue;
    if (/^\s+$/.test(word)) {
      // Keep real whitespace as a text node so copy-paste stays correct.
      fragment.appendChild(document.createTextNode(word));
      continue;
    }

    const wordEl = document.createElement("span");
    wordEl.className = "rm-word";
    wordEl.setAttribute("aria-hidden", "true");

    if (by === "chars") {
      for (const char of [...word]) {
        const charEl = document.createElement("span");
        charEl.className = "rm-char";
        charEl.textContent = char;
        wordEl.appendChild(charEl);
        pieces.push(charEl);
      }
    } else {
      wordEl.textContent = word;
      pieces.push(wordEl);
    }

    fragment.appendChild(wordEl);
  }

  element.replaceChildren(fragment);
  element.classList.add("rm-split");
  return pieces;
}

/**
 * Split into visual lines.
 *
 * Lines only exist after layout, so this measures where words actually landed
 * and groups by vertical position. It follows that a resize invalidates the
 * result — `resplitOnResize` below handles that.
 */
function splitLines(element, text) {
  const words = split(element, "words");
  const lines = [];
  let current = null;
  let lastTop = null;

  for (const word of words) {
    const top = Math.round(word.getBoundingClientRect().top);
    if (lastTop === null || Math.abs(top - lastTop) > 2) {
      current = [];
      lines.push(current);
      lastTop = top;
    }
    current.push(word);
  }

  const fragment = document.createDocumentFragment();
  const lineElements = [];
  for (const line of lines) {
    const lineEl = document.createElement("span");
    lineEl.className = "rm-line";
    lineEl.setAttribute("aria-hidden", "true");
    line.forEach((word, index) => {
      if (index > 0) lineEl.appendChild(document.createTextNode(" "));
      lineEl.appendChild(word);
    });
    fragment.appendChild(lineEl);
    lineElements.push(lineEl);
  }

  element.replaceChildren(fragment);
  element.classList.add("rm-split", "rm-split-lines");
  ORIGINAL.set(element, text);
  return lineElements;
}

/** Put an element's original text back and remove the wrappers. */
export function unsplit(element) {
  const text = ORIGINAL.get(element);
  if (text === undefined) return;
  element.textContent = text;
  element.classList.remove("rm-split", "rm-split-lines");
  element.removeAttribute("aria-label");
  ORIGINAL.delete(element);
}

/**
 * Re-split on resize, for line splitting only.
 *
 * Debounced, and only when the width actually changed: a mobile browser fires
 * resize when the address bar hides, and re-splitting on that would restart
 * the animation for no reason.
 */
export function resplitOnResize(element, by, onResplit) {
  if (by !== "lines") return () => {};
  let width = window.innerWidth;
  let timer;

  const handler = () => {
    if (window.innerWidth === width) return;
    width = window.innerWidth;
    clearTimeout(timer);
    timer = setTimeout(() => {
      unsplit(element);
      onResplit(split(element, "lines"));
    }, 150);
  };

  window.addEventListener("resize", handler);
  return () => {
    window.removeEventListener("resize", handler);
    clearTimeout(timer);
  };
}
