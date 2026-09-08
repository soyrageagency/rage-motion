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

export { reveal, REVEAL_EFFECTS } from "./components/reveal.js";
export { buttonKit, BUTTON_STYLES } from "./components/button-kit.js";
export { textReveal } from "./components/text.js";
export { decrypt, glitch, shiny, countUp } from "./components/text-effects.js";
export { pressure, morph, curve, odometer, highlight, outline, rollText, countdown } from "./components/type.js";
export { typewriter, waveText, magnetLines, ripple } from "./components/showpiece.js";
export { cursor, splash, magnetic, target, crosshair } from "./components/cursor.js";
export { spotlight, tilt, border } from "./components/cards.js";
export { beam, trail, glare, electric, blurEdge } from "./components/surface.js";
export { meteors, sparkles, lamp, beams } from "./components/panelfx.js";
export { accordion, flip, expand, lightbox } from "./components/disclose.js";
export { drag, shuffle, confetti } from "./components/motionfx.js";
export { waves, retroGrid, dotGrid, grain } from "./components/field.js";
export { parallax, progress, horizontal, stack, scrub } from "./components/scroll.js";
export { tracing, flatten, sticky } from "./components/scrollfx.js";
export { imageReveal, pixelate, hoverPreview, marquee } from "./components/media.js";
export { carousel, ring, deck, imageTrail, scratch, dock } from "./components/gallery.js";
export { compare, panels, skew, orbit } from "./components/interactive.js";
export { fill, shimmer, spark, swap, underline, press, halo, strokeDraw } from "./components/buttons.js";
export { scrollbar, dropdown, tooltip, toggle } from "./components/chrome.js";
export { dots, stripes, corners, scanline, mesh, starfield } from "./components/decor.js";
export { pill, gooey, condense, overlay, tabs, scrollSpy, progressRing } from "./components/nav.js";
export { command, sidebar, rail, bottomNav, mega } from "./components/navbars.js";
export {
  coverflow, thumbs, autoplay, wheel, peek, ticker, slideshow,
} from "./components/carousels.js";
export {
  island, sheet, segmented, frosted, springModal, actionSheet, toast, contextMenu,
} from "./components/ui.js";
export {
  skeleton, spinner, SPINNER_KINDS, progressBar, dotsLoader, pulseDot, badgeCount, emptyState,
} from "./components/feedback.js";
export { sparkline, bars, donut, gauge, stat, stars } from "./components/data.js";
export {
  circleNav, curtainNav, hoverSpread, breadcrumbs, treeNav, splitNav, stackNav, dotNav,
} from "./components/menus.js";
export {
  INPUT_LOOKS, inputKit, searchField, tagsField, selectField, clearable, maskField, inlineEdit,
} from "./components/inputs.js";
export {
  cartoonCursor, blobCursor, trailCursor, sayCursor, spotlightCursor, arrowCursor, lensCursor,
} from "./components/cursors.js";
export {
  masonry, swipeStack, filmstrip, hoverPeek, polaroids, foldGallery, gridZoom,
  crossfade, parallaxGrid, tiltGrid, maskReveal, slats, zoomStrip, spiralGallery,
  imageWall, flipGrid, peelStack, focusGrid, ribbon, contactSheet,
} from "./components/galleries.js";
export {
  rings, hexGrid, plusGrid, diagonals, topography, circuit, vignette, halftone,
} from "./components/texture.js";
export {
  floatLabel, autoGrow, charCount, passwordToggle, validate, rangeFill, fileDrop,
  stepper, fieldFocus, submitState, mascot, successButton, otp, padlock,
} from "./components/forms.js";
export { cardKit, CARD_LOOKS, layers, edgeLight, fan, cardParallax } from "./components/card-kit.js";
export {
  mosaic, zoomOut, lineByLine, textMask, timeline, splitScroll, revealGrid, pinnedGallery,
} from "./components/pagefx.js";
export { pageTransition, transitionTo } from "./components/transitions.js";

import { reveal } from "./components/reveal.js";
import { buttonKit } from "./components/button-kit.js";
import { textReveal } from "./components/text.js";
import { decrypt, glitch, shiny, countUp } from "./components/text-effects.js";
import { pressure, morph, curve, odometer, highlight, outline, rollText, countdown } from "./components/type.js";
import { typewriter, waveText, magnetLines, ripple } from "./components/showpiece.js";
import { magnetic } from "./components/cursor.js";
import { spotlight, tilt, border } from "./components/cards.js";
import { beam, trail, glare, electric, blurEdge } from "./components/surface.js";
import { meteors, sparkles, lamp, beams } from "./components/panelfx.js";
import { accordion, flip, expand, lightbox } from "./components/disclose.js";
import { drag, shuffle } from "./components/motionfx.js";
import { parallax, progress, horizontal, stack, scrub } from "./components/scroll.js";
import { tracing, flatten, sticky } from "./components/scrollfx.js";
import { imageReveal, pixelate, hoverPreview, marquee } from "./components/media.js";
import { carousel, ring, deck, imageTrail, scratch, dock } from "./components/gallery.js";
import { compare, panels, skew, orbit } from "./components/interactive.js";
import { fill, shimmer, spark, swap, underline, press, halo, strokeDraw } from "./components/buttons.js";
import { scrollbar, dropdown, tooltip, toggle } from "./components/chrome.js";
import { dots, stripes, corners, scanline, mesh, starfield } from "./components/decor.js";
import { pill, gooey, condense, overlay, tabs, scrollSpy, progressRing } from "./components/nav.js";
import { command, sidebar, rail, bottomNav, mega } from "./components/navbars.js";
import {
  coverflow, thumbs, autoplay, wheel, peek, ticker, slideshow,
} from "./components/carousels.js";
import {
  island, sheet, segmented, frosted, springModal, actionSheet, contextMenu,
} from "./components/ui.js";
import {
  skeleton, spinner, progressBar, dotsLoader, pulseDot, badgeCount, emptyState,
} from "./components/feedback.js";
import { sparkline, bars, donut, gauge, stat, stars } from "./components/data.js";
import {
  circleNav, curtainNav, hoverSpread, breadcrumbs, treeNav, splitNav, stackNav, dotNav,
} from "./components/menus.js";
import {
  inputKit, searchField, tagsField, selectField, clearable, maskField, inlineEdit,
} from "./components/inputs.js";
import {
  masonry, swipeStack, filmstrip, hoverPeek, polaroids, foldGallery, gridZoom,
  crossfade, parallaxGrid, tiltGrid, maskReveal, slats, zoomStrip, spiralGallery,
  imageWall, flipGrid, peelStack, focusGrid, ribbon, contactSheet,
} from "./components/galleries.js";
import {
  rings, hexGrid, plusGrid, diagonals, topography, circuit, vignette, halftone,
} from "./components/texture.js";
import {
  floatLabel, autoGrow, charCount, passwordToggle, validate, rangeFill, fileDrop,
  stepper, fieldFocus, submitState, mascot, successButton, otp, padlock,
} from "./components/forms.js";
import { cardKit, layers, edgeLight, fan, cardParallax } from "./components/card-kit.js";
import {
  mosaic, zoomOut, lineByLine, textMask, timeline, splitScroll, revealGrid, pinnedGallery,
} from "./components/pagefx.js";


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
    buttonKit("[data-rm-btn]", options.buttonKit),
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
    outline("[data-rm-outline]", options.outline),
    rollText("[data-rm-roll]", options.roll),
    countdown("[data-rm-countdown]", options.countdown),
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
    meteors("[data-rm-meteors]", options.meteors),
    sparkles("[data-rm-sparkles]", options.sparkles),
    lamp("[data-rm-lamp]", options.lamp),
    beams("[data-rm-beams]", options.beams),
    accordion("[data-rm-accordion]", options.accordion),
    flip("[data-rm-flip]", options.flip),
    expand("[data-rm-expand]", options.expand),
    lightbox("[data-rm-lightbox]", options.lightbox),
    drag("[data-rm-drag]", options.drag),
    shuffle("[data-rm-shuffle]", options.shuffle),
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
    underline("[data-rm-underline]", options.underline),
    press("[data-rm-press]", options.press),
    halo("[data-rm-halo]", options.halo),
    strokeDraw("[data-rm-stroke]", options.strokeDraw),
    scrollbar("[data-rm-scrollbar]", options.scrollbar),
    dropdown("[data-rm-dropdown]", options.dropdown),
    tooltip("[data-rm-tooltip]", options.tooltip),
    toggle("[data-rm-toggle]", options.toggle),
    dots("[data-rm-dots]", options.dots),
    stripes("[data-rm-stripes]", options.stripes),
    corners("[data-rm-corners]", options.corners),
    scanline("[data-rm-scanline]", options.scanline),
    mesh("[data-rm-mesh]", options.mesh),
    starfield("[data-rm-stars]", options.starfield),
    pill("[data-rm-pill]", options.pill),
    gooey("[data-rm-gooey]", options.gooey),
    condense("[data-rm-condense]", options.condense),
    overlay("[data-rm-overlay]", options.overlay),
    tabs("[data-rm-tabs]", options.tabs),
    scrollSpy("[data-rm-spy]", options.scrollSpy),
    progressRing("[data-rm-ring-progress]", options.progressRing),
    command("[data-rm-command]", options.command),
    sidebar("[data-rm-sidebar]", options.sidebar),
    rail("[data-rm-rail]", options.rail),
    bottomNav("[data-rm-bottom]", options.bottomNav),
    mega("[data-rm-mega]", options.mega),
    coverflow("[data-rm-coverflow]", options.coverflow),
    thumbs("[data-rm-thumbs]", options.thumbs),
    autoplay("[data-rm-autoplay]", options.autoplay),
    wheel("[data-rm-wheel]", options.wheel),
    peek("[data-rm-peek]", options.peek),
    ticker("[data-rm-ticker]", options.ticker),
    slideshow("[data-rm-slideshow]", options.slideshow),
    island("[data-rm-island]", options.island),
    sheet("[data-rm-sheet]", options.sheet),
    segmented("[data-rm-segmented]", options.segmented),
    frosted("[data-rm-frosted]", options.frosted),
    springModal("[data-rm-modal]", options.springModal),
    actionSheet("[data-rm-actions]", options.actionSheet),
    contextMenu("[data-rm-context]", options.contextMenu),
    skeleton("[data-rm-skeleton]", options.skeleton),
    spinner("[data-rm-spinner]", options.spinner),
    progressBar("[data-rm-progress-bar]", options.progressBar),
    dotsLoader("[data-rm-dots-loader]", options.dotsLoader),
    pulseDot("[data-rm-status]", options.pulseDot),
    badgeCount("[data-rm-badge]", options.badgeCount),
    emptyState("[data-rm-empty]", options.emptyState),
    sparkline("[data-rm-sparkline]", options.sparkline),
    bars("[data-rm-bars]", options.bars),
    donut("[data-rm-donut]", options.donut),
    gauge("[data-rm-gauge]", options.gauge),
    stat("[data-rm-stat]", options.stat),
    stars("[data-rm-rating]", options.stars),

    masonry("[data-rm-masonry]", options.masonry),
    swipeStack("[data-rm-swipe-stack]", options.swipeStack),
    filmstrip("[data-rm-filmstrip]", options.filmstrip),
    hoverPeek("[data-rm-hover-peek]", options.hoverPeek),
    polaroids("[data-rm-polaroids]", options.polaroids),
    foldGallery("[data-rm-fold]", options.foldGallery),
    gridZoom("[data-rm-grid-zoom]", options.gridZoom),
    crossfade("[data-rm-crossfade]", options.crossfade),
    parallaxGrid("[data-rm-parallax-grid]", options.parallaxGrid),
    tiltGrid("[data-rm-tilt-grid]", options.tiltGrid),
    maskReveal("[data-rm-mask-reveal]", options.maskReveal),
    slats("[data-rm-slats]", options.slats),
    zoomStrip("[data-rm-zoom-strip]", options.zoomStrip),
    spiralGallery("[data-rm-spiral]", options.spiralGallery),
    imageWall("[data-rm-image-wall]", options.imageWall),
    flipGrid("[data-rm-flip-grid]", options.flipGrid),
    peelStack("[data-rm-peel]", options.peelStack),
    focusGrid("[data-rm-focus-grid]", options.focusGrid),
    ribbon("[data-rm-ribbon]", options.ribbon),
    contactSheet("[data-rm-contact-sheet]", options.contactSheet),

    inputKit("[data-rm-input]", options.inputKit),
    searchField("[data-rm-search]", options.searchField),
    tagsField("[data-rm-tags]", options.tagsField),
    selectField("[data-rm-select]", options.selectField),
    clearable("[data-rm-clearable]", options.clearable),
    maskField("[data-rm-mask]", options.maskField),
    inlineEdit("[data-rm-inline-edit]", options.inlineEdit),

    circleNav("[data-rm-circle-nav]", options.circleNav),
    curtainNav("[data-rm-curtain-nav]", options.curtainNav),
    hoverSpread("[data-rm-hover-spread]", options.hoverSpread),
    breadcrumbs("[data-rm-breadcrumbs]", options.breadcrumbs),
    treeNav("[data-rm-tree]", options.treeNav),
    splitNav("[data-rm-split-nav]", options.splitNav),
    stackNav("[data-rm-stack-nav]", options.stackNav),
    dotNav("[data-rm-dot-nav]", options.dotNav),

    rings("[data-rm-rings]", options.rings),
    hexGrid("[data-rm-hex]", options.hexGrid),
    plusGrid("[data-rm-plus]", options.plusGrid),
    diagonals("[data-rm-diagonals]", options.diagonals),
    topography("[data-rm-topography]", options.topography),
    circuit("[data-rm-circuit]", options.circuit),
    vignette("[data-rm-vignette]", options.vignette),
    halftone("[data-rm-halftone]", options.halftone),
    floatLabel("[data-rm-float]", options.floatLabel),
    autoGrow("[data-rm-grow]", options.autoGrow),
    charCount("[data-rm-count-chars]", options.charCount),
    passwordToggle("[data-rm-password]", options.passwordToggle),
    validate("[data-rm-validate]", options.validate),
    rangeFill("[data-rm-range]", options.rangeFill),
    fileDrop("[data-rm-drop]", options.fileDrop),
    stepper("[data-rm-steps]", options.stepper),
    fieldFocus("[data-rm-field-focus]", options.fieldFocus),
    submitState("[data-rm-submit]", options.submitState),
    mascot("[data-rm-mascot]", options.mascot),
    successButton("[data-rm-success]", options.successButton),
    otp("[data-rm-otp]", options.otp),
    padlock("[data-rm-lock]", options.padlock),
    cardKit("[data-rm-card-kit]", options.cardKit),
    layers("[data-rm-layers]", options.layers),
    edgeLight("[data-rm-edge]", options.edgeLight),
    fan("[data-rm-fan]", options.fan),
    cardParallax("[data-rm-card-parallax]", options.cardParallax),
    mosaic("[data-rm-mosaic]", options.mosaic),
    zoomOut("[data-rm-zoom-out]", options.zoomOut),
    lineByLine("[data-rm-lines-in]", options.lineByLine),
    textMask("[data-rm-text-mask]", options.textMask),
    timeline("[data-rm-timeline]", options.timeline),
    splitScroll("[data-rm-split-scroll]", options.splitScroll),
    revealGrid("[data-rm-reveal-grid]", options.revealGrid),
    pinnedGallery("[data-rm-pinned]", options.pinnedGallery),
  ];
  return () => stops.forEach((stop) => stop?.());
}
