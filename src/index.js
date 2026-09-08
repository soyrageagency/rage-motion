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
  toastStack, snackbar, banner, inlineAlert, pushCard, bell,
  counter, presenceDot, ribbonAlert, statusBar, progressToast, undoBar,
  confirmSheet, countdownNote, stackedAvatars, typingDots, liveTicker, pillAlert,
  cornerToast, soundBadge,
} from "./components/notify.js";
export {
  taskList, taskCheck, taskReorder, taskGroup, kanban, taskProgress,
  taskFilter, subtasks, taskDue, taskPriority, taskAssignee, taskSwipe,
  taskUndo, taskCount, taskEmpty, taskSearch, taskBulk, taskTimer,
  taskStreak, taskNote,
} from "./components/tasks.js";
export {
  areaChart, stepChart, candlestick, waterfall, radar, heatCalendar,
  bulletChart, funnel, treemap, progressRings, comparisonBars, sparkBars,
  deltaBadge, bigNumber, rangeBar, pieSlices, scatterPlot, timelineChart,
  meterRow, numberTicker,
} from "./components/metrics.js";
export {
  strengthMeter, sliderPair, ratingSlider, colourField, dateField, signaturePad,
  switchRow, quantityStepper, consentBox, formProgress, errorSummary,
} from "./components/forms2.js";
export {
  avatar, avatarUpload, profileCard, profileHeader, userMenu, accountSwitcher,
  presenceRing, followButton, bioReveal, socialRow, statsRow, badgeRow,
  profileTabs, coverParallax, identityChip,
} from "./components/profile.js";
export {
  scrollCounter, scrollRotate, scrollScale, scrollBlur, scrollColour, pinSteps,
  scrollDraw, depthLayers, scrollSnapSections, revealMaskScroll, marqueeScroll, scrollGradient,
  scrollSplit, scrollZoomPin, scrollTypeScale,
} from "./components/scroll2.js";
export {
  productCard, productGallery, productZoom, colourSwatches, sizePicker, priceTag,
  discountBadge, stockMeter, ratingStars, reviewSummary, addToCart, wishlistHeart,
  compareTray, quickView, productTabs, variantPicker, breadcrumbTrail, sortBar,
  filterPanel, resultCount,
} from "./components/shop.js";
export {
  cartDrawer, cartLine, cartTotals, cartEmpty, cartBadge, miniCart,
  freeShippingBar, couponField, checkoutSteps, orderSummary, paymentMethods, addressForm,
  deliveryOptions, giftNote, orderConfirm, orderTracking, returnRequest, invoiceRow,
  saveForLater, recentlyViewed,
} from "./components/cart.js";
export {
  pricingTable, planToggle, featureMatrix, savingsBadge, quoteCard, logoWall,
  ratingRow, faqList, helpTip, shortcutSheet, tourStep, checklistCard,
  welcomeCard, footerColumns, announcementRow, megaFooter, sortableTable, stickyHeaderTable,
  rowExpand, tableEmpty, codeBlock, diffView, apiRow, uptimeDots,
  changelogFeed, bentoGrid, splitPanel, stickyAside, dividerMark, sectionMark,
} from "./components/extras.js";
export {
  heroBanner, collectionGrid, lookbook, categoryTiles, saleCountdown, bundleBuilder,
  sizeGuide, stockNotify, productVideo, swatchGallery, badgeStack, trustRow,
  shippingEstimate, recentlyBought, crossSell, upsellRow, giftCard, loyaltyPoints,
  referralBox, subscribeBox,
} from "./components/storefront.js";
export {
  orderList, orderCard, orderStatusPill, trackingMap, deliverySlot, addressBook,
  addressCard, paymentCards, subscriptionCard, pauseSubscription, invoiceList, downloadRow,
  wishlistGrid, reviewForm, reviewCard, questionAnswer, supportTicket, chatBubble,
  refundStatus, accountNav,
} from "./components/account.js";
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
  toastStack, snackbar, banner, inlineAlert, pushCard, bell,
  counter, presenceDot, ribbonAlert, statusBar, progressToast, undoBar,
  confirmSheet, countdownNote, stackedAvatars, typingDots, liveTicker, pillAlert,
  cornerToast, soundBadge,
} from "./components/notify.js";
import {
  taskList, taskCheck, taskReorder, taskGroup, kanban, taskProgress,
  taskFilter, subtasks, taskDue, taskPriority, taskAssignee, taskSwipe,
  taskUndo, taskCount, taskEmpty, taskSearch, taskBulk, taskTimer,
  taskStreak, taskNote,
} from "./components/tasks.js";
import {
  areaChart, stepChart, candlestick, waterfall, radar, heatCalendar,
  bulletChart, funnel, treemap, progressRings, comparisonBars, sparkBars,
  deltaBadge, bigNumber, rangeBar, pieSlices, scatterPlot, timelineChart,
  meterRow, numberTicker,
} from "./components/metrics.js";
import {
  strengthMeter, sliderPair, ratingSlider, colourField, dateField, signaturePad,
  switchRow, quantityStepper, consentBox, formProgress, errorSummary,
} from "./components/forms2.js";
import {
  avatar, avatarUpload, profileCard, profileHeader, userMenu, accountSwitcher,
  presenceRing, followButton, bioReveal, socialRow, statsRow, badgeRow,
  profileTabs, coverParallax, identityChip,
} from "./components/profile.js";
import {
  scrollCounter, scrollRotate, scrollScale, scrollBlur, scrollColour, pinSteps,
  scrollDraw, depthLayers, scrollSnapSections, revealMaskScroll, marqueeScroll, scrollGradient,
  scrollSplit, scrollZoomPin, scrollTypeScale,
} from "./components/scroll2.js";
import {
  productCard, productGallery, productZoom, colourSwatches, sizePicker, priceTag,
  discountBadge, stockMeter, ratingStars, reviewSummary, addToCart, wishlistHeart,
  compareTray, quickView, productTabs, variantPicker, breadcrumbTrail, sortBar,
  filterPanel, resultCount,
} from "./components/shop.js";
import {
  cartDrawer, cartLine, cartTotals, cartEmpty, cartBadge, miniCart,
  freeShippingBar, couponField, checkoutSteps, orderSummary, paymentMethods, addressForm,
  deliveryOptions, giftNote, orderConfirm, orderTracking, returnRequest, invoiceRow,
  saveForLater, recentlyViewed,
} from "./components/cart.js";
import {
  pricingTable, planToggle, featureMatrix, savingsBadge, quoteCard, logoWall,
  ratingRow, faqList, helpTip, shortcutSheet, tourStep, checklistCard,
  welcomeCard, footerColumns, announcementRow, megaFooter, sortableTable, stickyHeaderTable,
  rowExpand, tableEmpty, codeBlock, diffView, apiRow, uptimeDots,
  changelogFeed, bentoGrid, splitPanel, stickyAside, dividerMark, sectionMark,
} from "./components/extras.js";
import {
  heroBanner, collectionGrid, lookbook, categoryTiles, saleCountdown, bundleBuilder,
  sizeGuide, stockNotify, productVideo, swatchGallery, badgeStack, trustRow,
  shippingEstimate, recentlyBought, crossSell, upsellRow, giftCard, loyaltyPoints,
  referralBox, subscribeBox,
} from "./components/storefront.js";
import {
  orderList, orderCard, orderStatusPill, trackingMap, deliverySlot, addressBook,
  addressCard, paymentCards, subscriptionCard, pauseSubscription, invoiceList, downloadRow,
  wishlistGrid, reviewForm, reviewCard, questionAnswer, supportTicket, chatBubble,
  refundStatus, accountNav,
} from "./components/account.js";
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

    toastStack("[data-rm-toast-stack]", options.toastStack),
    snackbar("[data-rm-snackbar]", options.snackbar),
    banner("[data-rm-banner]", options.banner),
    inlineAlert("[data-rm-inline-alert]", options.inlineAlert),
    pushCard("[data-rm-push-card]", options.pushCard),
    bell("[data-rm-bell]", options.bell),
    counter("[data-rm-counter]", options.counter),
    presenceDot("[data-rm-presence]", options.presenceDot),
    ribbonAlert("[data-rm-ribbon-alert]", options.ribbonAlert),
    statusBar("[data-rm-status-bar]", options.statusBar),
    progressToast("[data-rm-progress-toast]", options.progressToast),
    undoBar("[data-rm-undo-bar]", options.undoBar),
    confirmSheet("[data-rm-confirm-sheet]", options.confirmSheet),
    countdownNote("[data-rm-countdown-note]", options.countdownNote),
    stackedAvatars("[data-rm-stacked-avatars]", options.stackedAvatars),
    typingDots("[data-rm-typing]", options.typingDots),
    liveTicker("[data-rm-live-ticker]", options.liveTicker),
    pillAlert("[data-rm-pill-alert]", options.pillAlert),
    cornerToast("[data-rm-corner-toast]", options.cornerToast),
    soundBadge("[data-rm-sound-badge]", options.soundBadge),

    taskList("[data-rm-task-list]", options.taskList),
    taskCheck("[data-rm-task-check]", options.taskCheck),
    taskReorder("[data-rm-task-reorder]", options.taskReorder),
    taskGroup("[data-rm-task-group]", options.taskGroup),
    kanban("[data-rm-kanban]", options.kanban),
    taskProgress("[data-rm-task-progress]", options.taskProgress),
    taskFilter("[data-rm-task-filter]", options.taskFilter),
    subtasks("[data-rm-subtasks]", options.subtasks),
    taskDue("[data-rm-task-due]", options.taskDue),
    taskPriority("[data-rm-task-priority]", options.taskPriority),
    taskAssignee("[data-rm-task-assignee]", options.taskAssignee),
    taskSwipe("[data-rm-task-swipe]", options.taskSwipe),
    taskUndo("[data-rm-task-undo]", options.taskUndo),
    taskCount("[data-rm-task-count]", options.taskCount),
    taskEmpty("[data-rm-task-empty]", options.taskEmpty),
    taskSearch("[data-rm-task-search]", options.taskSearch),
    taskBulk("[data-rm-task-bulk]", options.taskBulk),
    taskTimer("[data-rm-task-timer]", options.taskTimer),
    taskStreak("[data-rm-task-streak]", options.taskStreak),
    taskNote("[data-rm-task-note]", options.taskNote),

    areaChart("[data-rm-area-chart]", options.areaChart),
    stepChart("[data-rm-step-chart]", options.stepChart),
    candlestick("[data-rm-candles]", options.candlestick),
    waterfall("[data-rm-waterfall]", options.waterfall),
    radar("[data-rm-radar]", options.radar),
    heatCalendar("[data-rm-heat-calendar]", options.heatCalendar),
    bulletChart("[data-rm-bullet]", options.bulletChart),
    funnel("[data-rm-funnel]", options.funnel),
    treemap("[data-rm-treemap]", options.treemap),
    progressRings("[data-rm-activity-rings]", options.progressRings),
    comparisonBars("[data-rm-compare-bars]", options.comparisonBars),
    sparkBars("[data-rm-spark-bars]", options.sparkBars),
    deltaBadge("[data-rm-delta-badge]", options.deltaBadge),
    bigNumber("[data-rm-big-number]", options.bigNumber),
    rangeBar("[data-rm-range-bar]", options.rangeBar),
    pieSlices("[data-rm-pie]", options.pieSlices),
    scatterPlot("[data-rm-scatter]", options.scatterPlot),
    timelineChart("[data-rm-timeline-chart]", options.timelineChart),
    meterRow("[data-rm-meters]", options.meterRow),
    numberTicker("[data-rm-number-ticker]", options.numberTicker),

    strengthMeter("[data-rm-strength-meter]", options.strengthMeter),
    sliderPair("[data-rm-slider-pair]", options.sliderPair),
    ratingSlider("[data-rm-rating-slider]", options.ratingSlider),
    colourField("[data-rm-colour]", options.colourField),
    dateField("[data-rm-date-field]", options.dateField),
    signaturePad("[data-rm-signature]", options.signaturePad),
    switchRow("[data-rm-switch-row]", options.switchRow),
    quantityStepper("[data-rm-quantity]", options.quantityStepper),
    consentBox("[data-rm-consent]", options.consentBox),
    formProgress("[data-rm-form-progress]", options.formProgress),
    errorSummary("[data-rm-error-summary]", options.errorSummary),

    avatar("[data-rm-avatar]", options.avatar),
    avatarUpload("[data-rm-avatar-upload]", options.avatarUpload),
    profileCard("[data-rm-profile-card]", options.profileCard),
    profileHeader("[data-rm-profile-header]", options.profileHeader),
    userMenu("[data-rm-user-menu]", options.userMenu),
    accountSwitcher("[data-rm-account-switcher]", options.accountSwitcher),
    presenceRing("[data-rm-presence-ring]", options.presenceRing),
    followButton("[data-rm-follow]", options.followButton),
    bioReveal("[data-rm-bio]", options.bioReveal),
    socialRow("[data-rm-social]", options.socialRow),
    statsRow("[data-rm-stats]", options.statsRow),
    badgeRow("[data-rm-badges]", options.badgeRow),
    profileTabs("[data-rm-profile-tabs]", options.profileTabs),
    coverParallax("[data-rm-cover]", options.coverParallax),
    identityChip("[data-rm-identity]", options.identityChip),

    scrollCounter("[data-rm-scroll-count]", options.scrollCounter),
    scrollRotate("[data-rm-scroll-rotate]", options.scrollRotate),
    scrollScale("[data-rm-scroll-scale]", options.scrollScale),
    scrollBlur("[data-rm-scroll-blur]", options.scrollBlur),
    scrollColour("[data-rm-scroll-colour]", options.scrollColour),
    pinSteps("[data-rm-pin-steps]", options.pinSteps),
    scrollDraw("[data-rm-scroll-draw]", options.scrollDraw),
    depthLayers("[data-rm-scroll-depth]", options.depthLayers),
    scrollSnapSections("[data-rm-snap-sections]", options.scrollSnapSections),
    revealMaskScroll("[data-rm-scroll-mask]", options.revealMaskScroll),
    marqueeScroll("[data-rm-scroll-marquee]", options.marqueeScroll),
    scrollGradient("[data-rm-scroll-gradient]", options.scrollGradient),
    scrollSplit("[data-rm-scroll-split]", options.scrollSplit),
    scrollZoomPin("[data-rm-scroll-zoom]", options.scrollZoomPin),
    scrollTypeScale("[data-rm-scroll-type]", options.scrollTypeScale),

    productCard("[data-rm-product-card]", options.productCard),
    productGallery("[data-rm-product-gallery]", options.productGallery),
    productZoom("[data-rm-product-zoom]", options.productZoom),
    colourSwatches("[data-rm-swatches]", options.colourSwatches),
    sizePicker("[data-rm-size-picker]", options.sizePicker),
    priceTag("[data-rm-price-tag]", options.priceTag),
    discountBadge("[data-rm-discount-badge]", options.discountBadge),
    stockMeter("[data-rm-stock-meter]", options.stockMeter),
    ratingStars("[data-rm-rating-stars]", options.ratingStars),
    reviewSummary("[data-rm-review-summary]", options.reviewSummary),
    addToCart("[data-rm-add-to-cart]", options.addToCart),
    wishlistHeart("[data-rm-wishlist]", options.wishlistHeart),
    compareTray("[data-rm-compare-tray]", options.compareTray),
    quickView("[data-rm-quick-view]", options.quickView),
    productTabs("[data-rm-product-tabs]", options.productTabs),
    variantPicker("[data-rm-variant-picker]", options.variantPicker),
    breadcrumbTrail("[data-rm-breadcrumb-trail]", options.breadcrumbTrail),
    sortBar("[data-rm-sort-bar]", options.sortBar),
    filterPanel("[data-rm-filter-panel]", options.filterPanel),
    resultCount("[data-rm-result-count]", options.resultCount),

    cartDrawer("[data-rm-cart-drawer]", options.cartDrawer),
    cartLine("[data-rm-cart-line]", options.cartLine),
    cartTotals("[data-rm-cart-totals]", options.cartTotals),
    cartEmpty("[data-rm-cart-empty]", options.cartEmpty),
    cartBadge("[data-rm-cart-badge]", options.cartBadge),
    miniCart("[data-rm-mini-cart]", options.miniCart),
    freeShippingBar("[data-rm-free-shipping]", options.freeShippingBar),
    couponField("[data-rm-coupon]", options.couponField),
    checkoutSteps("[data-rm-checkout-steps]", options.checkoutSteps),
    orderSummary("[data-rm-order-summary]", options.orderSummary),
    paymentMethods("[data-rm-payment-methods]", options.paymentMethods),
    addressForm("[data-rm-address-form]", options.addressForm),
    deliveryOptions("[data-rm-delivery-options]", options.deliveryOptions),
    giftNote("[data-rm-gift-note]", options.giftNote),
    orderConfirm("[data-rm-order-confirm]", options.orderConfirm),
    orderTracking("[data-rm-order-tracking]", options.orderTracking),
    returnRequest("[data-rm-return-request]", options.returnRequest),
    invoiceRow("[data-rm-invoice-row]", options.invoiceRow),
    saveForLater("[data-rm-save-for-later]", options.saveForLater),
    recentlyViewed("[data-rm-recently-viewed]", options.recentlyViewed),

    pricingTable("[data-rm-pricing]", options.pricingTable),
    planToggle("[data-rm-plan-toggle]", options.planToggle),
    featureMatrix("[data-rm-feature-matrix]", options.featureMatrix),
    savingsBadge("[data-rm-savings]", options.savingsBadge),
    quoteCard("[data-rm-quote]", options.quoteCard),
    logoWall("[data-rm-logo-wall]", options.logoWall),
    ratingRow("[data-rm-rating-row]", options.ratingRow),
    faqList("[data-rm-faq]", options.faqList),
    helpTip("[data-rm-help-tip]", options.helpTip),
    shortcutSheet("[data-rm-shortcuts]", options.shortcutSheet),
    tourStep("[data-rm-tour]", options.tourStep),
    checklistCard("[data-rm-checklist]", options.checklistCard),
    welcomeCard("[data-rm-welcome]", options.welcomeCard),
    footerColumns("[data-rm-footer-columns]", options.footerColumns),
    announcementRow("[data-rm-announcement]", options.announcementRow),
    megaFooter("[data-rm-mega-footer]", options.megaFooter),
    sortableTable("[data-rm-sortable]", options.sortableTable),
    stickyHeaderTable("[data-rm-sticky-head]", options.stickyHeaderTable),
    rowExpand("[data-rm-row-expand]", options.rowExpand),
    tableEmpty("[data-rm-table-empty]", options.tableEmpty),
    codeBlock("[data-rm-code]", options.codeBlock),
    diffView("[data-rm-diff]", options.diffView),
    apiRow("[data-rm-api-row]", options.apiRow),
    uptimeDots("[data-rm-uptime]", options.uptimeDots),
    changelogFeed("[data-rm-changelog]", options.changelogFeed),
    bentoGrid("[data-rm-bento]", options.bentoGrid),
    splitPanel("[data-rm-split-panel]", options.splitPanel),
    stickyAside("[data-rm-sticky-aside]", options.stickyAside),
    dividerMark("[data-rm-divider]", options.dividerMark),
    sectionMark("[data-rm-section-mark]", options.sectionMark),

    heroBanner("[data-rm-hero-banner]", options.heroBanner),
    collectionGrid("[data-rm-collection-grid]", options.collectionGrid),
    lookbook("[data-rm-lookbook]", options.lookbook),
    categoryTiles("[data-rm-category-tiles]", options.categoryTiles),
    saleCountdown("[data-rm-sale-countdown]", options.saleCountdown),
    bundleBuilder("[data-rm-bundle-builder]", options.bundleBuilder),
    sizeGuide("[data-rm-size-guide]", options.sizeGuide),
    stockNotify("[data-rm-stock-notify]", options.stockNotify),
    productVideo("[data-rm-product-video]", options.productVideo),
    swatchGallery("[data-rm-swatch-gallery]", options.swatchGallery),
    badgeStack("[data-rm-badge-stack]", options.badgeStack),
    trustRow("[data-rm-trust-row]", options.trustRow),
    shippingEstimate("[data-rm-shipping-estimate]", options.shippingEstimate),
    recentlyBought("[data-rm-recently-bought]", options.recentlyBought),
    crossSell("[data-rm-cross-sell]", options.crossSell),
    upsellRow("[data-rm-upsell-row]", options.upsellRow),
    giftCard("[data-rm-gift-card]", options.giftCard),
    loyaltyPoints("[data-rm-loyalty-points]", options.loyaltyPoints),
    referralBox("[data-rm-referral-box]", options.referralBox),
    subscribeBox("[data-rm-subscribe-box]", options.subscribeBox),

    orderList("[data-rm-order-list]", options.orderList),
    orderCard("[data-rm-order-card]", options.orderCard),
    orderStatusPill("[data-rm-order-status]", options.orderStatusPill),
    trackingMap("[data-rm-tracking-map]", options.trackingMap),
    deliverySlot("[data-rm-delivery-slot]", options.deliverySlot),
    addressBook("[data-rm-address-book]", options.addressBook),
    addressCard("[data-rm-address-card]", options.addressCard),
    paymentCards("[data-rm-payment-cards]", options.paymentCards),
    subscriptionCard("[data-rm-subscription-card]", options.subscriptionCard),
    pauseSubscription("[data-rm-pause-subscription]", options.pauseSubscription),
    invoiceList("[data-rm-invoice-list]", options.invoiceList),
    downloadRow("[data-rm-download-row]", options.downloadRow),
    wishlistGrid("[data-rm-wishlist-grid]", options.wishlistGrid),
    reviewForm("[data-rm-review-form]", options.reviewForm),
    reviewCard("[data-rm-review-card]", options.reviewCard),
    questionAnswer("[data-rm-question-answer]", options.questionAnswer),
    supportTicket("[data-rm-support-ticket]", options.supportTicket),
    chatBubble("[data-rm-chat-bubble]", options.chatBubble),
    refundStatus("[data-rm-refund-status]", options.refundStatus),
    accountNav("[data-rm-account-nav]", options.accountNav),

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
