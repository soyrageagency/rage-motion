/**
 * rage-motion — every component, one import.
 *
 *   import { init } from "@soyrageagency/rage-motion";
 *   import "@soyrageagency/rage-motion/css";
 *   init();
 *
 * Or take one file. Each component is standalone and depends only on
 * `core/motion.js`, so copying a single file plus the core into a project
 * works — which is how most people will actually use this.
 *
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

export * from "./core/motion.js";
export { split, unsplit } from "./core/split.js";

export { reveal } from "./components/reveal.js";
export { textReveal } from "./components/text.js";
export { decrypt, glitch, shiny, countUp } from "./components/text-effects.js";
export { cursor, splash, magnetic } from "./components/cursor.js";
export { spotlight, tilt, border } from "./components/cards.js";
export { aurora, particles, grain } from "./components/backgrounds.js";
export { parallax, progress, horizontal, stack, scrub } from "./components/scroll.js";
export { imageReveal, pixelate, hoverPreview, marquee } from "./components/media.js";
export { typewriter, waveText, magnetLines, ripple } from "./components/showpiece.js";
export { compare, panels, skew, orbit } from "./components/interactive.js";
export { pageTransition, transitionTo } from "./components/transitions.js";

import { reveal } from "./components/reveal.js";
import { textReveal } from "./components/text.js";
import { decrypt, glitch, shiny, countUp } from "./components/text-effects.js";
import { magnetic } from "./components/cursor.js";
import { spotlight, tilt, border } from "./components/cards.js";
import { parallax, progress, horizontal, stack, scrub } from "./components/scroll.js";
import { imageReveal, pixelate, hoverPreview, marquee } from "./components/media.js";
import { typewriter, waveText, magnetLines, ripple } from "./components/showpiece.js";
import { compare, panels, skew, orbit } from "./components/interactive.js";

/**
 * Start every component that is driven purely by markup.
 *
 * Deliberately excludes the ones that change the whole page — the custom
 * cursor, the pointer trail, grain, page transitions. Those are decisions a
 * site makes on purpose, not defaults that should switch themselves on because
 * a script was loaded.
 *
 * @returns {() => void} stop everything it started
 */
export function init(options = {}) {
  const stops = [
    reveal("[data-rm-reveal]", options.reveal),
    textReveal("[data-rm-text]", options.text),
    decrypt("[data-rm-decrypt]", options.decrypt),
    glitch("[data-rm-glitch]", options.glitch),
    shiny("[data-rm-shiny]", options.shiny),
    countUp("[data-rm-count]", options.count),
    magnetic("[data-rm-magnetic]", options.magnetic),
    spotlight("[data-rm-spotlight]", options.spotlight),
    tilt("[data-rm-tilt]", options.tilt),
    border("[data-rm-border]", options.border),
    parallax("[data-rm-parallax]", options.parallax),
    progress("[data-rm-progress]", options.progress),
    horizontal("[data-rm-horizontal]", options.horizontal),
    stack("[data-rm-stack]", options.stack),
    scrub("[data-rm-scrub]", options.scrub),
    imageReveal("[data-rm-image-reveal]", options.imageReveal),
    pixelate("[data-rm-pixel]", options.pixelate),
    hoverPreview("[data-rm-preview]", options.hoverPreview),
    marquee("[data-rm-marquee]", options.marquee),
    typewriter("[data-rm-type]", options.typewriter),
    waveText("[data-rm-wave]", options.wave),
    magnetLines("[data-rm-lines]", options.lines),
    ripple("[data-rm-ripple]", options.ripple),
    compare("[data-rm-compare]", options.compare),
    panels("[data-rm-panels]", options.panels),
    skew("[data-rm-skew]", options.skew),
    orbit("[data-rm-orbit]", options.orbit),
  ];
  return () => stops.forEach((stop) => stop?.());
}
