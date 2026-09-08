/**
 * The component catalogue the MCP server serves.
 *
 * This file is deliberately hand-written rather than parsed out of the source.
 * A parser would give you the signatures; what an assistant actually needs is
 * the markup that drives each component, one example that works when pasted,
 * and the sentence explaining why the component is shaped the way it is — so it
 * stops "improving" the parts that look accidental.
 *
 * Source is never duplicated here. `file` points at the real module and the
 * server reads it at call time, so what the assistant receives is always the
 * shipped implementation.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

export const TOKENS = {
  Palette: {
    "--rm-ink": "#0e0e0e",
    "--rm-cream": "#f1eee9",
    "--rm-muted": "#6c695f",
    "--rm-accent": "#2aa7e4",
    "--rm-terracotta": "#d28c65",
    "--rm-yellow": "#f4d738",
  },
  Type: {
    "--rm-display": '"Bricolage Grotesque", "Archivo Expanded", system-ui, sans-serif',
    "--rm-body": 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
    "--rm-mono": '"JetBrains Mono", ui-monospace, SFMono-Regular, Consolas, monospace',
  },
  Shape: {
    "--rm-radius-sm": "4px",
    "--rm-radius": "24px",
    "--rm-radius-lg": "36px",
    "--rm-radius-pill": "999px",
  },
  Motion: {
    "--rm-ease-out": "cubic-bezier(0.22, 1, 0.36, 1)",
    "--rm-ease-in-out": "cubic-bezier(0.65, 0, 0.35, 1)",
  },
};

const REVEAL = "src/components/reveal.js";
const TEXT = "src/components/text.js";
const EFFECTS = "src/components/text-effects.js";
const CURSOR = "src/components/cursor.js";
const CARDS = "src/components/cards.js";
const BACKGROUNDS = "src/components/backgrounds.js";
const SCROLL = "src/components/scroll.js";
const MEDIA = "src/components/media.js";
const SHOWPIECE = "src/components/showpiece.js";
const INTERACTIVE = "src/components/interactive.js";
const TRANSITIONS = "src/components/transitions.js";

export const CATALOGUE = [
  {
    name: "reveal",
    category: "reveal",
    file: REVEAL,
    attribute: "data-rm-reveal",
    summary: "Elements enter as they scroll into view.",
    notes:
      "The starting state is applied from JavaScript, not CSS. If the script " +
      "never loads the content is simply un-animated rather than invisible — " +
      "which is the failure mode of every `.hidden { opacity: 0 }` reveal.",
    example:
      '<div data-rm-reveal="up" data-rm-delay="120">…</div>\n' +
      '<ul data-rm-reveal="up" data-rm-stagger="80">\n' +
      "  <li>…</li><li>…</li><li>…</li>\n" +
      "</ul>",
    usage: 'import { reveal } from "@soyrageagency/rage-motion";\nconst stop = reveal();',
    options: [
      { name: "from", type: "up | down | left | right | scale | fade", default: '"up"', about: "Direction it travels in." },
      { name: "duration", type: "number", default: "750", about: "Milliseconds." },
      { name: "delay", type: "number", default: "0", about: "Before it starts." },
      { name: "stagger", type: "number", default: "0", about: "Per child, when the target has children." },
      { name: "threshold", type: "number", default: "0.15", about: "How much must be visible to trigger." },
      { name: "once", type: "boolean", default: "true", about: "Set false to replay when scrolled back to." },
    ],
  },
  {
    name: "textReveal",
    category: "text",
    file: TEXT,
    attribute: "data-rm-text",
    summary: "Headlines that animate in by character, word or line.",
    notes:
      "Splitting text usually destroys the accessible name and breaks " +
      "copy-paste. This keeps the original string as `aria-label`, marks the " +
      "pieces `aria-hidden`, and nests characters inside word wrappers so lines " +
      "still break correctly. The total stagger is budgeted at 900ms however " +
      "long the headline is — an unbudgeted per-character stagger is why long " +
      "headlines take four seconds to finish.",
    example:
      '<h1 data-rm-text="chars" data-rm-effect="rise">Award-grade motion</h1>\n' +
      '<p data-rm-text="words" data-rm-effect="blur">One word at a time.</p>',
    usage: 'import { textReveal } from "@soyrageagency/rage-motion";\ntextReveal();',
    options: [
      { name: "by", type: "chars | words | lines", default: '"chars"', about: "Split granularity." },
      { name: "effect", type: "rise | fade | scale | blur | flip", default: '"rise"', about: "How each piece enters." },
      { name: "duration", type: "number", default: "800", about: "Per piece." },
      { name: "stagger", type: "number", default: "26", about: "Between pieces, capped so the whole run stays under 900ms." },
      { name: "delay", type: "number", default: "0", about: "Before the first piece." },
    ],
  },
  {
    name: "decrypt",
    category: "text",
    file: EFFECTS,
    attribute: "data-rm-decrypt",
    summary: "Text resolves out of scrambling glyphs.",
    notes: "Width is reserved from the final string, so the line never reflows while it settles.",
    example: '<span data-rm-decrypt data-rm-speed="34">SoyRage Agency</span>',
    usage: 'import { decrypt } from "@soyrageagency/rage-motion";\ndecrypt();',
    options: [
      { name: "speed", type: "number", default: "34", about: "Milliseconds per scramble frame." },
      { name: "revealPerFrame", type: "number", default: "0.6", about: "Characters locked in per frame." },
      { name: "once", type: "boolean", default: "true", about: "Set false to re-run on re-entry." },
    ],
  },
  {
    name: "glitch",
    category: "text",
    file: EFFECTS,
    attribute: "data-rm-glitch",
    summary: "RGB-split glitch on hover, or on an interval.",
    notes: "The offset copies are CSS pseudo-elements fed by a data attribute, so no extra DOM is created.",
    example: '<h2 data-rm-glitch="hover">404</h2>\n<h2 data-rm-glitch="auto" data-rm-interval="3000">LIVE</h2>',
    usage: 'import { glitch } from "@soyrageagency/rage-motion";\nglitch();',
    options: [
      { name: "trigger", type: "hover | auto", default: '"hover"', about: "What sets it off." },
      { name: "interval", type: "number", default: "3800", about: "Between bursts in auto mode." },
    ],
  },
  {
    name: "shiny",
    category: "text",
    file: EFFECTS,
    attribute: "data-rm-shiny",
    summary: "A highlight sweeps across the text, forever.",
    notes: "A moving background clipped to the glyphs — one compositor-only property, no per-frame JavaScript.",
    example: '<span data-rm-shiny data-rm-highlight="#f4d738">Available for work</span>',
    usage: 'import { shiny } from "@soyrageagency/rage-motion";\nshiny();',
    options: [
      { name: "base", type: "colour", default: '"#6b7280"', about: "The resting colour." },
      { name: "highlight", type: "colour", default: '"#ffffff"', about: "The sweep." },
      { name: "duration", type: "number", default: "3200", about: "One pass." },
    ],
  },
  {
    name: "countUp",
    category: "text",
    file: EFFECTS,
    attribute: "data-rm-count",
    summary: "A number counts to its value when it scrolls into view.",
    notes:
      "The target value AND its formatting are read from the text already in " +
      "the element, including which separator is the decimal one — so 1.250 " +
      "counts as Spanish and 1,250 as English, and a % or € survives. Width is " +
      "reserved so the layout does not shuffle as digits appear.",
    example: "<strong data-rm-count>1.250</strong>\n<strong data-rm-count>98%</strong>",
    usage: 'import { countUp } from "@soyrageagency/rage-motion";\ncountUp();',
    options: [
      { name: "duration", type: "number", default: "1800", about: "The full count." },
      { name: "threshold", type: "number", default: "0.5", about: "Visibility needed to start." },
    ],
  },
  {
    name: "cursor",
    category: "cursor",
    file: CURSOR,
    attribute: null,
    summary: "A dot with a ring that lags behind it, growing over links.",
    notes:
      "The real cursor is only hidden once the pointer has actually moved, so a " +
      "keyboard or touch visitor is never left with no cursor at all. Coarse " +
      "pointers opt out entirely.",
    example: "<!-- no markup: a custom cursor is a page-level decision -->",
    usage: 'import { cursor } from "@soyrageagency/rage-motion";\nconst stop = cursor({ blend: "difference" });',
    options: [
      { name: "size", type: "number", default: "10", about: "The dot." },
      { name: "ringSize", type: "number", default: "38", about: "The trailing ring." },
      { name: "ease", type: "number", default: "0.16", about: "How far behind the ring lags. Lower is looser." },
      { name: "hoverScale", type: "number", default: "2.4", about: "Ring growth over a link." },
      { name: "hoverTargets", type: "selector", default: '"a, button, [data-rm-cursor-hover], …"', about: "What counts as hoverable." },
    ],
  },
  {
    name: "splash",
    category: "cursor",
    file: CURSOR,
    attribute: null,
    summary: "A liquid colour trail that follows the pointer.",
    notes: "Blobs on a canvas under a gooey filter. Showpiece work — one per site, on the landing page.",
    example: "<!-- no markup -->",
    usage: 'import { splash } from "@soyrageagency/rage-motion";\nconst stop = splash({ colors: ["#2aa7e4", "#d28c65"] });',
    options: [
      { name: "count", type: "number", default: "18", about: "Blobs in the trail." },
      { name: "radius", type: "number", default: "26", about: "Blob size." },
      { name: "ease", type: "number", default: "0.22", about: "Trail looseness." },
      { name: "blend", type: "string", default: '"screen"', about: "Mix-blend mode against the page." },
    ],
  },
  {
    name: "magnetic",
    category: "cursor",
    file: CURSOR,
    attribute: "data-rm-magnetic",
    summary: "Buttons lean toward the pointer as it approaches.",
    notes: "Pull is proportional to distance inside a radius, so the button attracts rather than snapping.",
    example: '<button data-rm-magnetic="0.4" data-rm-radius="140">Hablemos</button>',
    usage: 'import { magnetic } from "@soyrageagency/rage-motion";\nmagnetic();',
    options: [
      { name: "strength", type: "number", default: "0.35", about: "Fraction of the distance it travels." },
      { name: "radius", type: "number", default: "120", about: "Where the pull starts, in pixels." },
    ],
  },
  {
    name: "spotlight",
    category: "cards",
    file: CARDS,
    attribute: "data-rm-spotlight",
    summary: "A glow follows the pointer across a card, and lights its border.",
    notes:
      "One `pointermove` listener serves the whole set rather than one per card, " +
      "so a twenty-card grid still costs a single handler.",
    example: '<article data-rm-spotlight data-rm-size="380">…</article>',
    usage: 'import { spotlight } from "@soyrageagency/rage-motion";\nspotlight();',
    options: [
      { name: "size", type: "number", default: "320", about: "Glow diameter." },
      { name: "color", type: "colour", default: '"rgba(59,158,240,0.16)"', about: "The glow." },
      { name: "border", type: "colour", default: '"rgba(59,158,240,0.5)"', about: "The lit edge." },
    ],
  },
  {
    name: "tilt",
    category: "cards",
    file: CARDS,
    attribute: "data-rm-tilt",
    summary: "3D tilt toward the pointer, with a glare that tracks it.",
    notes:
      "Capped at 10 degrees. Past roughly twelve the card reads as a gimmick and " +
      "the text inside becomes genuinely harder to read.",
    example: '<article data-rm-tilt="8">…</article>',
    usage: 'import { tilt } from "@soyrageagency/rage-motion";\ntilt();',
    options: [
      { name: "max", type: "number", default: "10", about: "Degrees at the corner." },
      { name: "scale", type: "number", default: "1.02", about: "Lift on hover." },
      { name: "glare", type: "boolean", default: "true", about: "The moving sheen." },
      { name: "perspective", type: "number", default: "900", about: "Lower is a stronger perspective." },
    ],
  },
  {
    name: "border",
    category: "cards",
    file: CARDS,
    attribute: "data-rm-border",
    summary: "A gradient that rotates around the card's edge.",
    notes:
      "Uses `@property` to register the angle so the browser can interpolate it — " +
      "a conic gradient animated any other way steps rather than sweeps.",
    example: '<article data-rm-border data-rm-duration="5000">…</article>',
    usage: 'import { border } from "@soyrageagency/rage-motion";\nborder();',
    options: [
      { name: "colors", type: "string[]", default: "blue → violet → pink → blue", about: "Repeat the first colour last for a seamless loop." },
      { name: "width", type: "number", default: "1.5", about: "Border thickness." },
      { name: "duration", type: "number", default: "4000", about: "One rotation." },
    ],
  },
  {
    name: "aurora",
    category: "background",
    file: BACKGROUNDS,
    attribute: null,
    summary: "Slow drifting colour behind a section.",
    notes: "CSS, not canvas: the compositor runs it without touching the main thread.",
    example: '<section class="hero">…</section>',
    usage: 'import { aurora } from "@soyrageagency/rage-motion";\naurora(".hero", { colors: ["#2aa7e4", "#d28c65", "#f4d738"] });',
    options: [
      { name: "colors", type: "string[]", default: "blue, violet, pink", about: "One blurred blob each." },
      { name: "blur", type: "number", default: "90", about: "Pixels." },
      { name: "speed", type: "number", default: "18000", about: "One drift cycle." },
      { name: "opacity", type: "number", default: "0.55", about: "Keep it under whatever the text needs for contrast." },
    ],
  },
  {
    name: "particles",
    category: "background",
    file: BACKGROUNDS,
    attribute: null,
    summary: "A constellation field that links to the pointer.",
    notes:
      "Stops painting when the tab is hidden or the section scrolls away, and " +
      "caps the device pixel ratio at 2. Under reduced motion the field and the " +
      "pointer links stay; only the drift stops.",
    example: '<section id="hero">…</section>',
    usage: 'import { particles } from "@soyrageagency/rage-motion";\nparticles("#hero", { color: "#2aa7e4" });',
    options: [
      { name: "maxParticles", type: "number", default: "140", about: "Hard cap; the count also scales with area." },
      { name: "linkDistance", type: "number", default: "130", about: "How near two dots must be to draw a line." },
      { name: "pointerRadius", type: "number", default: "150", about: "Reach of the pointer links." },
      { name: "speed", type: "number", default: "0.22", about: "Drift." },
    ],
  },
  {
    name: "grain",
    category: "background",
    file: BACKGROUNDS,
    attribute: null,
    summary: "Film grain over the page.",
    notes:
      "Generated once into a 128px tile and moved, not regenerated per frame. A " +
      "per-frame grain is the most expensive subtle effect on the web and at 4% " +
      "opacity nobody can tell the difference.",
    example: "<!-- no markup: applied to the body -->",
    usage: 'import { grain } from "@soyrageagency/rage-motion";\ngrain(document.body, { opacity: 0.045 });',
    options: [
      { name: "opacity", type: "number", default: "0.045", about: "Above ~0.08 it stops being texture and starts being noise." },
      { name: "tile", type: "number", default: "128", about: "Texture size." },
    ],
  },
  {
    name: "parallax",
    category: "scroll",
    file: SCROLL,
    attribute: "data-rm-parallax",
    summary: "Layers move at different rates as the page scrolls.",
    notes:
      "The offset is zero when the element is centred in the viewport, not at the " +
      "top of the page — which is what stops a layer being visibly displaced the " +
      "moment it appears. Every scroll component shares one cached read per frame.",
    example: '<img data-rm-parallax="0.25" src="…" alt="">\n<div data-rm-parallax="-0.1">moves against the scroll</div>',
    usage: 'import { parallax } from "@soyrageagency/rage-motion";\nparallax();',
    options: [
      { name: "speed", type: "number", default: "0.18", about: "Multiplier. Keep it small or the layer leaves a gap at the edges." },
      { name: "axis", type: "x | y", default: '"y"', about: "Direction of travel." },
    ],
  },
  {
    name: "progress",
    category: "scroll",
    file: SCROLL,
    attribute: "data-rm-progress",
    summary: "A reading-progress bar.",
    notes: "Uses a native scroll timeline where supported, so it stays in step even during a fling.",
    example: '<div data-rm-progress data-rm-color="#2aa7e4"></div>',
    usage: 'import { progress } from "@soyrageagency/rage-motion";\nprogress();',
    options: [
      { name: "color", type: "colour", default: '"#2AA7E4"', about: "The filled bar." },
      { name: "height", type: "number", default: "3", about: "Pixels." },
    ],
  },
  {
    name: "horizontal",
    category: "scroll",
    file: SCROLL,
    attribute: "data-rm-horizontal",
    summary: "A section that scrolls sideways while pinned.",
    notes:
      "Vertical scroll distance is mapped to horizontal travel by giving the " +
      "wrapper height. It never hijacks the wheel event, so the trackpad, the " +
      "keyboard and the scrollbar all keep working.",
    example:
      "<section data-rm-horizontal>\n" +
      "  <div data-rm-track>\n" +
      "    <article>…</article><article>…</article>\n" +
      "  </div>\n" +
      "</section>",
    usage: 'import { horizontal } from "@soyrageagency/rage-motion";\nhorizontal();',
    options: [{ name: "selector", type: "selector", default: '"[data-rm-track]"', about: "The strip that moves." }],
  },
  {
    name: "stack",
    category: "scroll",
    file: SCROLL,
    attribute: "data-rm-stack",
    summary: "Cards pile up, shrinking and dimming as you pass them.",
    notes: "The sticking is CSS `position: sticky`; only scale and brightness are computed.",
    example:
      "<div data-rm-stack>\n" +
      "  <article data-rm-card>…</article>\n" +
      "  <article data-rm-card>…</article>\n" +
      "</div>",
    usage: 'import { stack } from "@soyrageagency/rage-motion";\nstack();',
    options: [
      { name: "top", type: "number", default: "80", about: "Where the first card sticks." },
      { name: "scaleStep", type: "number", default: "0.04", about: "Shrink per card in front." },
      { name: "dim", type: "number", default: "0.35", about: "Darkening of buried cards." },
    ],
  },
  {
    name: "scrub",
    category: "scroll",
    file: SCROLL,
    attribute: "data-rm-scrub",
    summary: "Bind a CSS custom property to scroll position.",
    notes:
      "The escape hatch. `--rm-progress` runs 0 → 1 as the element crosses the " +
      "viewport and the stylesheet decides what that means, so anything " +
      "expressible in CSS becomes scroll-driven without another component.",
    example:
      '<div data-rm-scrub\n' +
      '     style="opacity: var(--rm-progress);\n' +
      '            transform: scale(calc(0.8 + var(--rm-progress) * 0.2))">…</div>',
    usage: 'import { scrub } from "@soyrageagency/rage-motion";\nscrub();',
    options: [{ name: "property", type: "string", default: '"--rm-progress"', about: "The property written." }],
  },
  {
    name: "imageReveal",
    category: "media",
    file: MEDIA,
    attribute: "data-rm-image-reveal",
    summary: "A curtain wipes away to uncover an image.",
    notes:
      "The image is also scaled and settles back as the curtain leaves. Without " +
      "that it reads as a rectangle sliding off a static picture.",
    example: '<figure data-rm-image-reveal="left" data-rm-color="#0e0e0e">\n  <img src="…" alt="">\n</figure>',
    usage: 'import { imageReveal } from "@soyrageagency/rage-motion";\nimageReveal();',
    options: [
      { name: "direction", type: "left | right | up | down", default: '"left"', about: "Where the curtain exits." },
      { name: "duration", type: "number", default: "1100", about: "The wipe." },
      { name: "zoom", type: "number", default: "1.12", about: "Starting scale of the image." },
    ],
  },
  {
    name: "pixelate",
    category: "media",
    file: MEDIA,
    attribute: "data-rm-pixel",
    summary: "A pixel grid dissolves on hover.",
    notes:
      "Real elements, not canvas, so the pixels can be styled — capped at 24 " +
      "columns, because a 40×40 grid is 1,600 nodes per card and ruinous on a " +
      "page of twelve. Each card dissolves in its own random order so two side " +
      "by side do not move in lockstep.",
    example: '<article data-rm-pixel data-rm-columns="16">…</article>',
    usage: 'import { pixelate } from "@soyrageagency/rage-motion";\npixelate();',
    options: [
      { name: "columns", type: "number", default: "14", about: "Clamped to 24." },
      { name: "color", type: "colour", default: '"#0E0E0E"', about: "The pixels." },
      { name: "stagger", type: "number", default: "14", about: "Spread of the dissolve." },
    ],
  },
  {
    name: "hoverPreview",
    category: "media",
    file: MEDIA,
    attribute: "data-rm-preview",
    summary: "A link list that floats an image beside the pointer.",
    notes:
      "The signature studio-index interaction. One shared floating element for " +
      "the whole list, lagging behind the pointer and tilting into its velocity, " +
      "so it feels carried rather than pinned. Fine pointers only.",
    example:
      "<ul data-rm-preview>\n" +
      '  <li data-rm-preview-src="/work/one.jpg"><a href="#">Proyecto uno</a></li>\n' +
      '  <li data-rm-preview-src="/work/two.jpg"><a href="#">Proyecto dos</a></li>\n' +
      "</ul>",
    usage: 'import { hoverPreview } from "@soyrageagency/rage-motion";\nhoverPreview();',
    options: [
      { name: "width", type: "number", default: "300", about: "The floating image." },
      { name: "ease", type: "number", default: "0.14", about: "How far behind it trails." },
      { name: "rotate", type: "number", default: "6", about: "Maximum lean, in degrees." },
    ],
  },
  {
    name: "marquee",
    category: "media",
    file: MEDIA,
    attribute: "data-rm-marquee",
    summary: "An infinite ticker that never jumps.",
    notes:
      "Content is duplicated until the track is twice the viewport, then wrapped " +
      "by exactly one copy width. Animating a single copy to -100% is the usual " +
      "shortcut and it visibly jumps whenever the content is narrower than the " +
      "screen. Under reduced motion it becomes a static, readable strip.",
    example:
      '<div data-rm-marquee data-rm-speed="80" data-rm-direction="left">\n' +
      "  <span>Diseño</span><span>Desarrollo</span><span>Motion</span>\n" +
      "</div>",
    usage: 'import { marquee } from "@soyrageagency/rage-motion";\nmarquee();',
    options: [
      { name: "speed", type: "number", default: "60", about: "Pixels per second — not a duration, so lines of different lengths still match." },
      { name: "direction", type: "left | right", default: '"left"', about: "Travel." },
      { name: "pauseOnHover", type: "boolean", default: "true", about: "Stop so links can be clicked." },
      { name: "gap", type: "number", default: "48", about: "Between items." },
    ],
  },
  {
    name: "typewriter",
    category: "showpiece",
    file: SHOWPIECE,
    attribute: "data-rm-type",
    summary: "A phrase types itself, deletes, and the next one follows.",
    notes:
      "The rotating tagline, without the two things that usually ruin it. The " +
      "accessible name is the whole list of phrases written once and the " +
      "animated span is `aria-hidden`, so a screen reader is not read every " +
      "keystroke. And the element reserves the width of the longest phrase, so " +
      "whatever sits beside it does not jitter for the rest of the visit.",
    example: '<span data-rm-type="Diseño|Desarrollo|Motion"></span>',
    usage: 'import { typewriter } from "@soyrageagency/rage-motion";\ntypewriter();',
    options: [
      { name: "typeSpeed", type: "number", default: "62", about: "Milliseconds per character." },
      { name: "deleteSpeed", type: "number", default: "32", about: "Deleting is faster than typing, as it is in life." },
      { name: "holdFull", type: "number", default: "1700", about: "Pause on a finished phrase." },
      { name: "loop", type: "boolean", default: "true", about: "Set false to stop on the last phrase." },
    ],
  },
  {
    name: "waveText",
    category: "showpiece",
    file: SHOWPIECE,
    attribute: "data-rm-wave",
    summary: "Characters lift in a wave that follows the pointer.",
    notes:
      "The lift falls off over a radius on a cosine curve, so neighbours move " +
      "too — a per-glyph on/off reads as a stutter, not a wave. Character " +
      "positions are measured once and on resize, never per frame.",
    example: '<h2 data-rm-wave data-rm-lift="20">Pásame el ratón por encima</h2>',
    usage: 'import { waveText } from "@soyrageagency/rage-motion";\nwaveText();',
    options: [
      { name: "radius", type: "number", default: "120", about: "How wide the wave reaches." },
      { name: "lift", type: "number", default: "16", about: "Peak rise, in pixels." },
      { name: "scale", type: "number", default: "0.35", about: "Growth at the peak." },
    ],
  },
  {
    name: "magnetLines",
    category: "showpiece",
    file: SHOWPIECE,
    attribute: "data-rm-lines",
    summary: "A field of lines that all turn to face the pointer.",
    notes:
      "One listener for the whole grid, and each line is a single `rotate`. " +
      "Rotation always takes the short way round — without that the field " +
      "spins backwards through 360 degrees every time the pointer crosses " +
      "behind a line, which is the giveaway of every copy of this effect.",
    example: '<div data-rm-lines data-rm-columns="16" data-rm-rows="10"></div>',
    usage: 'import { magnetLines } from "@soyrageagency/rage-motion";\nmagnetLines();',
    options: [
      { name: "columns", type: "number", default: "14", about: "Clamped to 30." },
      { name: "rows", type: "number", default: "9", about: "Clamped to 30." },
      { name: "length", type: "number", default: "22", about: "Line length in pixels." },
      { name: "ease", type: "number", default: "0.22", about: "How lazily they swing round." },
    ],
  },
  {
    name: "ripple",
    category: "showpiece",
    file: SHOWPIECE,
    attribute: "data-rm-ripple",
    summary: "A ring expands from wherever you click.",
    notes:
      "Sized to reach the furthest corner, so it always covers the element " +
      "whatever the aspect ratio, and removed when its animation finishes " +
      "rather than on a timer — a backgrounded tab cannot leave a pile behind.",
    example: '<button data-rm-ripple data-rm-color="#2aa7e4">Enviar</button>',
    usage: 'import { ripple } from "@soyrageagency/rage-motion";\nripple();',
    options: [
      { name: "color", type: "colour", default: '"currentColor"', about: "The ring." },
      { name: "duration", type: "number", default: "620", about: "The expansion." },
      { name: "opacity", type: "number", default: "0.25", about: "Starting opacity." },
    ],
  },
  {
    name: "compare",
    category: "interactive",
    file: INTERACTIVE,
    attribute: "data-rm-compare",
    summary: "A before/after slider, keyboard included.",
    notes:
      "Nearly every version of this on the web is pointer-only, which makes it " +
      "useless on a keyboard and invisible to a screen reader. This is a real " +
      "`role=\"slider\"` with arrows, Home and End and an announced value; the " +
      "drag is the enhancement, not the only way in.",
    example:
      "<div data-rm-compare>\n" +
      '  <img data-rm-before src="before.jpg" alt="Antes">\n' +
      '  <img data-rm-after src="after.jpg" alt="Después">\n' +
      "</div>",
    usage: 'import { compare } from "@soyrageagency/rage-motion";\ncompare();',
    options: [
      { name: "start", type: "number", default: "50", about: "Opening position, 0–100." },
      { name: "step", type: "number", default: "4", about: "Per arrow key; ×4 with shift." },
      { name: "label", type: "string", default: '"Compare before and after"', about: "The accessible name." },
    ],
  },
  {
    name: "panels",
    category: "interactive",
    file: INTERACTIVE,
    attribute: "data-rm-panels",
    summary: "A row of panels where the one you point at takes the room.",
    notes:
      "The expansion is `flex-grow` transitioned in CSS, so the browser owns " +
      "the animation. Focus opens a panel as well as hover, which is one extra " +
      "listener and the difference between working and not for a keyboard user.",
    example:
      "<div data-rm-panels data-rm-grow=\"4\">\n" +
      '  <a data-rm-panel href="#"><img src="…" alt=""></a>\n' +
      '  <a data-rm-panel href="#"><img src="…" alt=""></a>\n' +
      "</div>",
    usage: 'import { panels } from "@soyrageagency/rage-motion";\npanels();',
    options: [
      { name: "grow", type: "number", default: "3.2", about: "How much room the open panel takes." },
      { name: "duration", type: "number", default: "620", about: "The expansion." },
    ],
  },
  {
    name: "skew",
    category: "interactive",
    file: INTERACTIVE,
    attribute: "data-rm-skew",
    summary: "Content leans with scroll velocity and springs back.",
    notes:
      "The recognisable 'smooth scrolling site' lean, without the smooth-scroll " +
      "hijack that usually comes with it — this never replaces the browser's " +
      "scrolling, so the scrollbar, find-in-page and keyboard all keep working. " +
      "Clamped to 7 degrees, past which text stops being readable during a flick.",
    example: '<section data-rm-skew="0.4">…</section>',
    usage: 'import { skew } from "@soyrageagency/rage-motion";\nskew();',
    options: [
      { name: "strength", type: "number", default: "0.35", about: "Degrees per pixel of velocity." },
      { name: "max", type: "number", default: "7", about: "Hard clamp." },
      { name: "ease", type: "number", default: "0.12", about: "How slowly it springs back." },
    ],
  },
  {
    name: "orbit",
    category: "interactive",
    file: INTERACTIVE,
    attribute: "data-rm-orbit",
    summary: "Items circling a centre, staying upright as they travel.",
    notes:
      "The ring rotates and each item counter-rotates, so logos and text stay " +
      "the right way up — an orbit where everything tumbles is unreadable. Two " +
      "CSS animations for the whole thing, nothing per frame.",
    example:
      '<div data-rm-orbit data-rm-radius="140" data-rm-duration="30000">\n' +
      "  <span>React</span><span>Node</span><span>Motion</span>\n" +
      "</div>",
    usage: 'import { orbit } from "@soyrageagency/rage-motion";\norbit();',
    options: [
      { name: "radius", type: "number", default: "130", about: "Ring radius." },
      { name: "duration", type: "number", default: "24000", about: "One full turn." },
      { name: "reverse", type: "boolean", default: "false", about: "Anticlockwise." },
      { name: "tilt", type: "number", default: "0", about: "X-axis tilt, for a perspective ring." },
    ],
  },
  {
    name: "pageTransition",
    category: "transition",
    file: TRANSITIONS,
    attribute: null,
    summary: "Cross-fade between pages with the View Transitions API.",
    notes:
      "It never traps navigation: modified clicks, external links, downloads and " +
      "targets all fall through to the browser, and where the API is missing it " +
      "simply navigates. A transition that swallows a cmd-click is worse than no " +
      "transition.",
    example: "<!-- no markup: call it once per page -->",
    usage: 'import { pageTransition } from "@soyrageagency/rage-motion";\npageTransition({ duration: 520 });',
    options: [
      { name: "selector", type: "selector", default: '"a[href]"', about: "Links it intercepts." },
      { name: "duration", type: "number", default: "520", about: "The cross-fade." },
    ],
  },
];

/** Find a component by name, ignoring case and punctuation. */
export function findComponent(name) {
  const key = String(name ?? "").toLowerCase().replace(/[^a-z]/g, "");
  if (!key) return null;
  return CATALOGUE.find((c) => c.name.toLowerCase().replace(/[^a-z]/g, "") === key) ?? null;
}
