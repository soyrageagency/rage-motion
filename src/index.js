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
export { pressure, morph, curve, odometer, highlight } from "./components/type.js";
export { typewriter, waveText, magnetLines, ripple } from "./components/showpiece.js";
export { cursor, splash, magnetic, target, crosshair } from "./components/cursor.js";
export { spotlight, tilt, border } from "./components/cards.js";
export { beam, trail, glare, electric, blurEdge } from "./components/surface.js";
export { waves, retroGrid, dotGrid, grain } from "./components/field.js";
export { parallax, progress, horizontal, stack, scrub } from "./components/scroll.js";
export { tracing, flatten, sticky } from "./components/scrollfx.js";
export { imageReveal, pixelate, hoverPreview, marquee } from "./components/media.js";
export { carousel, ring, deck, imageTrail, scratch, dock } from "./components/gallery.js";
export { compare, panels, skew, orbit } from "./components/interactive.js";
export { fill, shimmer, spark, swap } from "./components/buttons.js";
export { pill, gooey, condense, overlay, tabs } from "./components/nav.js";
export { pageTransition, transitionTo } from "./components/transitions.js";

import { reveal } from "./components/reveal.js";
import { textReveal } from "./components/text.js";
import { decrypt, glitch, shiny, countUp } from "./components/text-effects.js";
import { pressure, morph, curve, odometer, highlight } from "./components/type.js";
import { typewriter, waveText, magnetLines, ripple } from "./components/showpiece.js";
import { magnetic } from "./components/cursor.js";
import { spotlight, tilt, border } from "./components/cards.js";
import { beam, trail, glare, electric, blurEdge } from "./components/surface.js";
import { parallax, progress, horizontal, stack, scrub } from "./components/scroll.js";
import { tracing, flatten, sticky } from "./components/scrollfx.js";
import { imageReveal, pixelate, hoverPreview, marquee } from "./components/media.js";
import { carousel, ring, deck, imageTrail, scratch, dock } from "./components/gallery.js";
import { compare, panels, skew, orbit } from "./components/interactive.js";
import { fill, shimmer, spark, swap } from "./components/buttons.js";
import { pill, gooey, condense, overlay, tabs } from "./components/nav.js";

/**
 * Start every component that is driven purely by markup.
 *
 * Deliberately excludes the ones that change the whole page — the custom
 * cursors, the pointer trail, grain, the generative fields, page transitions.
 * Those are decisions a site makes on purpose, not defaults that should switch
 * themselves on because a script was loaded.
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
    pressure("[data-rm-pressure]", options.pressure),
    morph("[data-rm-morph]", options.morph),
    curve("[data-rm-curve]", options.curve),
    odometer("[data-rm-odometer]", options.odometer),
    highlight("[data-rm-highlight]", options.highlight),
    typewriter("[data-rm-type]", options.typewriter),
    waveText("[data-rm-wave]", options.wave),
    magnetLines("[data-rm-lines]", options.lines),
    ripple("[data-rm-ripple]", options.ripple),
    magnetic("[data-rm-magnetic]", options.magnetic),
    spotlight("[data-rm-spotlight]", options.spotlight),
    tilt("[data-rm-tilt]", options.tilt),
    border("[data-rm-border]", options.border),
    beam("[data-rm-beam]", options.beam),
    trail("[data-rm-trail]", options.trail),
    glare("[data-rm-glare]", options.glare),
    electric("[data-rm-electric]", options.electric),
    blurEdge("[data-rm-blur-edge]", options.blurEdge),
    parallax("[data-rm-parallax]", options.parallax),
    progress("[data-rm-progress]", options.progress),
    horizontal("[data-rm-horizontal]", options.horizontal),
    stack("[data-rm-stack]", options.stack),
    scrub("[data-rm-scrub]", options.scrub),
    tracing("[data-rm-tracing]", options.tracing),
    flatten("[data-rm-flatten]", options.flatten),
    sticky("[data-rm-sticky]", options.sticky),
    imageReveal("[data-rm-image-reveal]", options.imageReveal),
    pixelate("[data-rm-pixel]", options.pixelate),
    hoverPreview("[data-rm-preview]", options.hoverPreview),
    marquee("[data-rm-marquee]", options.marquee),
    carousel("[data-rm-carousel]", options.carousel),
    ring("[data-rm-ring]", options.ring),
    deck("[data-rm-deck]", options.deck),
    imageTrail("[data-rm-image-trail]", options.imageTrail),
    scratch("[data-rm-scratch]", options.scratch),
    dock("[data-rm-dock]", options.dock),
    compare("[data-rm-compare]", options.compare),
    panels("[data-rm-panels]", options.panels),
    skew("[data-rm-skew]", options.skew),
    orbit("[data-rm-orbit]", options.orbit),
    fill("[data-rm-fill]", options.fill),
    shimmer("[data-rm-shimmer]", options.shimmer),
    spark("[data-rm-spark]", options.spark),
    swap("[data-rm-swap]", options.swap),
    pill("[data-rm-pill]", options.pill),
    gooey("[data-rm-gooey]", options.gooey),
    condense("[data-rm-condense]", options.condense),
    overlay("[data-rm-overlay]", options.overlay),
    tabs("[data-rm-tabs]", options.tabs),
  ];
  return () => stops.forEach((stop) => stop?.());
}
