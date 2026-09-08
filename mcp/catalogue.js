/**
 * The component catalogue the MCP server serves.
 *
 * Hand-written on purpose. A parser would give you the signatures; what an
 * assistant actually needs is the markup that drives each component, one
 * example that works when pasted, and the sentence explaining why the
 * component is shaped the way it is — so it stops "improving" the parts that
 * look accidental.
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
const TYPE = "src/components/type.js";
const SHOWPIECE = "src/components/showpiece.js";
const CURSOR = "src/components/cursor.js";
const CARDS = "src/components/cards.js";
const SURFACE = "src/components/surface.js";
const FIELD = "src/components/field.js";
const SCROLL = "src/components/scroll.js";
const SCROLLFX = "src/components/scrollfx.js";
const MEDIA = "src/components/media.js";
const GALLERY = "src/components/gallery.js";
const INTERACTIVE = "src/components/interactive.js";
const BUTTONS = "src/components/buttons.js";
const NAV = "src/components/nav.js";
const PANELFX = "src/components/panelfx.js";
const DISCLOSE = "src/components/disclose.js";
const MOTIONFX = "src/components/motionfx.js";
const BUTTONKIT = "src/components/button-kit.js";
const NAVBARS = "src/components/navbars.js";
const FORMS = "src/components/forms.js";
const CARDKIT = "src/components/card-kit.js";
const PAGEFX = "src/components/pagefx.js";
const CAROUSELS = "src/components/carousels.js";
const UI = "src/components/ui.js";
const FEEDBACK = "src/components/feedback.js";
const DATA = "src/components/data.js";
const CHROME = "src/components/chrome.js";
const DECOR = "src/components/decor.js";
const TRANSITIONS = "src/components/transitions.js";

const option = (name, type, dflt, about) => ({ name, type, default: dflt, about });

export const CATALOGUE = [
  // ── Entrances ────────────────────────────────────────────────────────────
  {
    name: "reveal",
    category: "reveal",
    file: REVEAL,
    attribute: "data-rm-reveal",
    summary: "Elements enter as they scroll into view — fifty named entrances.",
    notes:
      "The starting state is applied from JavaScript, not CSS. If the script " +
      "never loads the content is simply un-animated rather than invisible — " +
      "which is the failure mode of every `.hidden { opacity: 0 }` reveal.\n\n" +
      "Fifty named start states share this one component, so they also share " +
      "the trigger, the reduced-motion handling and the settle: up, down, left, " +
      "right and their -far variants, glide, fade, scale, zoom, shrink, pop, " +
      "rise, drop, spring-up, spring-left, blur, blur-only, blur-up, " +
      "blur-scale, drift-left, drift-right, tilt-left, tilt-right, roll-left, " +
      "roll-right, swing, twist, spin, skew-x, skew-y, flip-x, flip-y, unfold, " +
      "fold-up, door, door-right, corner, lift-3d, curtain-up, curtain-down, " +
      "curtain-left, curtain-right, iris, wipe-diagonal, mask, slat, none. " +
      "REVEAL_EFFECTS exports the list.",
    example:
      '<div data-rm-reveal="up" data-rm-delay="120">…</div>\n' +
      '<ul data-rm-reveal="up" data-rm-stagger="80"><li>…</li><li>…</li></ul>',
    usage: 'import { reveal } from "@soyrageagency/rage-motion";\nconst stop = reveal();',
    options: [
      option("from", "up | down | left | right | scale | fade", '"up"', "Direction it travels in."),
      option("duration", "number", "750", "Milliseconds."),
      option("delay", "number", "0", "Before it starts."),
      option("stagger", "number", "0", "Per child, when the target has children."),
      option("threshold", "number", "0.15", "How much must be visible to trigger."),
    ],
  },

  // ── Text ─────────────────────────────────────────────────────────────────
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
      "long the headline is.",
    example:
      '<h1 data-rm-text="chars" data-rm-effect="rise">Award-grade motion</h1>\n' +
      '<p data-rm-text="words" data-rm-effect="blur">One word at a time.</p>',
    usage: 'import { textReveal } from "@soyrageagency/rage-motion";\ntextReveal();',
    options: [
      option("by", "chars | words | lines", '"chars"', "Split granularity."),
      option("effect", "rise | fade | scale | blur | flip", '"rise"', "How each piece enters."),
      option("duration", "number", "800", "Per piece."),
      option("stagger", "number", "26", "Between pieces, capped so the run stays under 900ms."),
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
      option("speed", "number", "34", "Milliseconds per scramble frame."),
      option("revealPerFrame", "number", "0.6", "Characters locked in per frame."),
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
      option("trigger", "hover | auto", '"hover"', "What sets it off."),
      option("interval", "number", "3800", "Between bursts in auto mode."),
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
      option("base", "colour", '"#6b7280"', "The resting colour — set it dark enough to read."),
      option("highlight", "colour", '"#ffffff"', "The sweep."),
      option("duration", "number", "3200", "One pass."),
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
      "the element, including which separator is the decimal one. Width is " +
      "reserved so the layout does not shuffle as digits appear.",
    example: "<strong data-rm-count>1,250</strong>\n<strong data-rm-count>98%</strong>",
    usage: 'import { countUp } from "@soyrageagency/rage-motion";\ncountUp();',
    options: [option("duration", "number", "1800", "The full count.")],
  },
  {
    name: "pressure",
    category: "text",
    file: TYPE,
    attribute: "data-rm-pressure",
    summary: "Variable-font axes bend toward the pointer, per character.",
    notes:
      "The word thickens under the cursor and thins away from it, by animating " +
      "the real `wght` and `wdth` axes rather than faking weight with a scale. " +
      "It needs a variable font — with a static face the axes are ignored and " +
      "nothing moves.",
    example: '<h1 data-rm-pressure data-rm-radius="280">Pressure</h1>',
    usage: 'import { pressure } from "@soyrageagency/rage-motion";\npressure();',
    options: [
      option("radius", "number", "240", "How far the influence reaches."),
      option("weight", "[number, number]", "[200, 900]", "The wght axis range."),
      option("width", "[number, number]", "[85, 125]", "The wdth axis range."),
    ],
  },
  {
    name: "morph",
    category: "text",
    file: TYPE,
    attribute: "data-rm-morph",
    summary: "One word becomes the next; shared letters travel, the rest fade.",
    notes:
      "Letters the two words have in common slide from where they were to " +
      "where they now belong, which needs a real match between the strings and " +
      "a FLIP. That is what separates it from a cross-fade. The element " +
      "reserves the width of the longest word, so nothing beside it moves.",
    example: '<span data-rm-morph="Design|Motion|Craft"></span>',
    usage: 'import { morph } from "@soyrageagency/rage-motion";\nmorph();',
    options: [
      option("hold", "number", "2200", "How long each word stays."),
      option("duration", "number", "700", "The morph itself."),
    ],
  },
  {
    name: "curve",
    category: "text",
    file: TYPE,
    attribute: "data-rm-curve",
    summary: "Text set along an arc, optionally turning.",
    notes:
      "A real `<textPath>`, so letters follow the curve with correct spacing " +
      "instead of being rotated one at a time — which is why every hand-rolled " +
      "circular text has the letters leaning wrong at the sides.",
    example: '<span data-rm-curve="120" data-rm-spin="18000">Available for work · </span>',
    usage: 'import { curve } from "@soyrageagency/rage-motion";\ncurve();',
    options: [
      option("radius", "number", "130", "Circle radius in pixels."),
      option("spin", "number", "0", "Milliseconds per turn; 0 to hold still."),
    ],
  },
  {
    name: "odometer",
    category: "text",
    file: TYPE,
    attribute: "data-rm-odometer",
    summary: "Digits roll into place like a mechanical counter.",
    notes:
      "Each digit is a column of 0–9 that slides, and columns further right " +
      "start later, so the number settles from the left the way a real " +
      "odometer does rather than every digit landing at once.",
    example: "<strong data-rm-odometer>128,400</strong>",
    usage: 'import { odometer } from "@soyrageagency/rage-motion";\nodometer();',
    options: [
      option("duration", "number", "1500", "Per column."),
      option("stagger", "number", "90", "Between columns."),
    ],
  },
  {
    name: "highlight",
    category: "text",
    file: TYPE,
    attribute: "data-rm-highlight",
    summary: "A paragraph lights up word by word as it crosses the viewport.",
    notes:
      "The unlit state is a muted colour, never `opacity: 0`. Prose that is " +
      "unreadable until you have scrolled far enough is a reading tax, and " +
      "that is the version of this effect everyone ships.",
    example: "<p data-rm-highlight>A long paragraph that fills in as you scroll past it.</p>",
    usage: 'import { highlight } from "@soyrageagency/rage-motion";\nhighlight();',
    options: [option("dim", "number", "0.28", "How faint the unlit words are.")],
  },
  {
    name: "typewriter",
    category: "showpiece",
    file: SHOWPIECE,
    attribute: "data-rm-type",
    summary: "A phrase types itself, deletes, and the next one follows.",
    notes:
      "The accessible name is the whole list of phrases written once and the " +
      "animated span is `aria-hidden`, so a screen reader is not read every " +
      "keystroke. The element reserves the width of the longest phrase.",
    example: '<span data-rm-type="Design|Development|Motion"></span>',
    usage: 'import { typewriter } from "@soyrageagency/rage-motion";\ntypewriter();',
    options: [
      option("typeSpeed", "number", "62", "Milliseconds per character."),
      option("holdFull", "number", "1700", "Pause on a finished phrase."),
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
      "too — a per-glyph on/off reads as a stutter, not a wave.",
    example: '<h2 data-rm-wave data-rm-lift="20">Hover me</h2>',
    usage: 'import { waveText } from "@soyrageagency/rage-motion";\nwaveText();',
    options: [
      option("radius", "number", "120", "How wide the wave reaches."),
      option("lift", "number", "16", "Peak rise, in pixels."),
    ],
  },

  // ── Cursor ───────────────────────────────────────────────────────────────
  {
    name: "cursor",
    category: "cursor",
    file: CURSOR,
    attribute: null,
    summary: "A dot with a ring that lags behind it, growing over links.",
    notes:
      "The real cursor is only hidden once the pointer has actually moved, so " +
      "a keyboard or touch visitor is never left with no cursor at all.",
    example: "<!-- no markup: a custom cursor is a page-level decision -->",
    usage: 'import { cursor } from "@soyrageagency/rage-motion";\nconst stop = cursor({ blend: "difference" });',
    options: [
      option("size", "number", "10", "The dot."),
      option("ringSize", "number", "38", "The trailing ring."),
      option("ease", "number", "0.16", "How far behind the ring lags."),
    ],
  },
  {
    name: "target",
    category: "cursor",
    file: CURSOR,
    attribute: null,
    summary: "A bracket that snaps around whatever you point at.",
    notes:
      "Four corners holding a small square while travelling, springing open to " +
      "frame a link. It reads the target's own border radius, so a pill is " +
      "framed as a pill. One element and one transform, not four racing ones.",
    example: "<!-- no markup: page-level -->",
    usage: 'import { target } from "@soyrageagency/rage-motion";\nconst stop = target();',
    options: [
      option("size", "number", "22", "Resting square."),
      option("padding", "number", "8", "Breathing room around a locked target."),
      option("targets", "selector", '"a, button, …"', "What it snaps to."),
    ],
  },
  {
    name: "crosshair",
    category: "cursor",
    file: CURSOR,
    attribute: null,
    summary: "Full-width crosshairs with a live coordinate readout.",
    notes: "Reads like a design tool, and costs two transforms a frame.",
    example: "<!-- no markup: page-level -->",
    usage: 'import { crosshair } from "@soyrageagency/rage-motion";\nconst stop = crosshair();',
    options: [option("readout", "boolean", "true", "Show the coordinates.")],
  },
  {
    name: "splash",
    category: "cursor",
    file: CURSOR,
    attribute: null,
    summary: "A liquid colour trail that follows the pointer.",
    notes: "Blobs on a canvas under a gooey filter. One per site, on the landing page.",
    example: "<!-- no markup -->",
    usage: 'import { splash } from "@soyrageagency/rage-motion";\nconst stop = splash();',
    options: [option("count", "number", "18", "Blobs in the trail.")],
  },
  {
    name: "magnetic",
    category: "cursor",
    file: CURSOR,
    attribute: "data-rm-magnetic",
    summary: "Buttons lean toward the pointer as it approaches.",
    notes: "Pull is proportional to distance inside a radius, so it attracts rather than snapping.",
    example: '<button data-rm-magnetic="0.4" data-rm-radius="140">Talk to us</button>',
    usage: 'import { magnetic } from "@soyrageagency/rage-motion";\nmagnetic();',
    options: [
      option("strength", "number", "0.35", "Fraction of the distance it travels."),
      option("radius", "number", "120", "Where the pull starts."),
    ],
  },

  // ── Cards and surfaces ───────────────────────────────────────────────────
  {
    name: "spotlight",
    category: "cards",
    file: CARDS,
    attribute: "data-rm-spotlight",
    summary: "A glow follows the pointer across a card, and lights its border.",
    notes: "One `pointermove` listener serves the whole set, so a twenty-card grid costs one handler.",
    example: '<article data-rm-spotlight data-rm-size="380">…</article>',
    usage: 'import { spotlight } from "@soyrageagency/rage-motion";\nspotlight();',
    options: [option("size", "number", "320", "Glow diameter.")],
  },
  {
    name: "tilt",
    category: "cards",
    file: CARDS,
    attribute: "data-rm-tilt",
    summary: "3D tilt toward the pointer, with a glare that tracks it.",
    notes: "Capped at 10 degrees. Past twelve the card reads as a gimmick and the text gets harder to read.",
    example: '<article data-rm-tilt="8">…</article>',
    usage: 'import { tilt } from "@soyrageagency/rage-motion";\ntilt();',
    options: [
      option("max", "number", "10", "Degrees at the corner."),
      option("glare", "boolean", "true", "The moving sheen."),
    ],
  },
  {
    name: "border",
    category: "cards",
    file: CARDS,
    attribute: "data-rm-border",
    summary: "A gradient that rotates around the card's edge.",
    notes: "Uses `@property` to register the angle, or the conic gradient steps rather than sweeps.",
    example: '<article data-rm-border data-rm-duration="5000">…</article>',
    usage: 'import { border } from "@soyrageagency/rage-motion";\nborder();',
    options: [option("duration", "number", "4000", "One rotation.")],
  },
  {
    name: "beam",
    category: "surface",
    file: SURFACE,
    attribute: "data-rm-beam",
    summary: "An animated curve drawn between two elements.",
    notes:
      "The path is recomputed from the two elements' live positions, so it " +
      "survives a resize, a reflow, or a card being added — unlike the " +
      "hardcoded `d` attribute that is wrong on every viewport but one.",
    example: '<div data-rm-beam data-rm-from="#api" data-rm-to="#db"></div>',
    usage: 'import { beam } from "@soyrageagency/rage-motion";\nbeam();',
    options: [
      option("curvature", "number", "0.3", "How far the curve bows."),
      option("duration", "number", "3200", "One travel of the light."),
    ],
  },
  {
    name: "trail",
    category: "surface",
    file: SURFACE,
    attribute: "data-rm-trail",
    summary: "A light that travels an element's own border.",
    notes:
      "`offset-path` with the element's real rectangle and radius, so the light " +
      "follows the actual shape at an even speed. The usual trick — spinning a " +
      "conic gradient behind the box — visibly speeds up at the corners.",
    example: '<article data-rm-trail data-rm-size="80">…</article>',
    usage: 'import { trail } from "@soyrageagency/rage-motion";\ntrail();',
    options: [
      option("size", "number", "60", "Length of the light."),
      option("duration", "number", "4000", "One lap."),
    ],
  },
  {
    name: "glare",
    category: "surface",
    file: SURFACE,
    attribute: "data-rm-glare",
    summary: "A sheen that tracks the pointer across a surface.",
    notes: "The highlight's angle follows the pointer, so the card reads as a panel catching light.",
    example: "<article data-rm-glare>…</article>",
    usage: 'import { glare } from "@soyrageagency/rage-motion";\nglare();',
    options: [option("intensity", "number", "0.35", "How strong the sheen is.")],
  },
  {
    name: "electric",
    category: "surface",
    file: SURFACE,
    attribute: "data-rm-electric",
    summary: "A border that crackles, via a real SVG displacement filter.",
    notes:
      "`feTurbulence` plus `feDisplacementMap`, which is what makes the edge " +
      "ripple like current instead of wobbling like a scaled outline. The seed " +
      "steps twelve times a second — every frame costs four times as much " +
      "filter work for something the eye reads as identical.",
    example: "<article data-rm-electric>…</article>",
    usage: 'import { electric } from "@soyrageagency/rage-motion";\nelectric();',
    options: [
      option("scale", "number", "14", "How far the edge displaces."),
      option("fps", "number", "12", "How often the noise re-seeds."),
    ],
  },
  {
    name: "blurEdge",
    category: "surface",
    file: SURFACE,
    attribute: "data-rm-blur-edge",
    summary: "A progressive blur, the way a camera does it.",
    notes:
      "Stacked layers, each blurred more and masked to a narrower band, so " +
      "focus falls off gradually. One `backdrop-filter` with a mask — the usual " +
      "approach — blurs everything equally and looks like a smear.",
    example: '<div data-rm-blur-edge="bottom" data-rm-layers="6"></div>',
    usage: 'import { blurEdge } from "@soyrageagency/rage-motion";\nblurEdge();',
    options: [
      option("layers", "number", "5", "More layers, smoother falloff."),
      option("position", "top | bottom", '"bottom"', "Which edge fades."),
    ],
  },

  // ── Fields ───────────────────────────────────────────────────────────────
  {
    name: "waves",
    category: "background",
    file: FIELD,
    attribute: null,
    summary: "A field of lines flowing, parting around the pointer.",
    notes:
      "Points are spaced by pixel budget rather than by count, so a phone draws " +
      "a coarser field instead of the same work at a quarter of the frame rate. " +
      "Stops entirely when the section is off screen or the tab is hidden.",
    example: '<section class="hero">…</section>',
    usage: 'import { waves } from "@soyrageagency/rage-motion";\nwaves(".hero", { color: "rgba(42,167,228,0.3)" });',
    options: [
      option("lines", "number", "26", "How many."),
      option("amplitude", "number", "26", "Wave height."),
      option("pointerRadius", "number", "190", "How far the pointer parts them."),
    ],
  },
  {
    name: "retroGrid",
    category: "background",
    file: FIELD,
    attribute: null,
    summary: "A grid running to the horizon.",
    notes: "Pure CSS: a perspective plane with a scrolling gradient. No canvas, nothing per frame.",
    example: '<section class="hero">…</section>',
    usage: 'import { retroGrid } from "@soyrageagency/rage-motion";\nretroGrid(".hero");',
    options: [
      option("cell", "number", "60", "Grid square size."),
      option("angle", "number", "65", "How far the plane lies back."),
    ],
  },
  {
    name: "dotGrid",
    category: "background",
    file: FIELD,
    attribute: null,
    summary: "A dot matrix that reacts to the pointer.",
    notes:
      "One canvas and one pass per frame. Built from DOM elements — the usual " +
      "way — it is a thousand nodes with a thousand transforms, which is why " +
      "that version stutters.",
    example: '<section class="panel">…</section>',
    usage: 'import { dotGrid } from "@soyrageagency/rage-motion";\ndotGrid(".panel");',
    options: [
      option("gap", "number", "26", "Spacing."),
      option("radius", "number", "150", "Pointer influence."),
    ],
  },
  {
    name: "grain",
    category: "background",
    file: FIELD,
    attribute: null,
    summary: "Film grain over the page.",
    notes:
      "Generated once into a 128px tile and moved, not regenerated per frame. " +
      "A per-frame grain is the most expensive subtle effect on the web.",
    example: "<!-- no markup: applied to the body -->",
    usage: 'import { grain } from "@soyrageagency/rage-motion";\ngrain(document.body, { opacity: 0.045 });',
    options: [option("opacity", "number", "0.045", "Above ~0.08 it stops being texture.")],
  },

  // ── Scroll ───────────────────────────────────────────────────────────────
  {
    name: "parallax",
    category: "scroll",
    file: SCROLL,
    attribute: "data-rm-parallax",
    summary: "Layers move at different rates as the page scrolls.",
    notes:
      "The offset is zero when the element is centred in the viewport, not at " +
      "page top — which is what stops a layer being visibly displaced the " +
      "moment it appears. Every scroll component shares one read per frame.",
    example: '<img data-rm-parallax="0.25" src="…" alt="">',
    usage: 'import { parallax } from "@soyrageagency/rage-motion";\nparallax();',
    options: [option("speed", "number", "0.18", "Multiplier. Keep it small.")],
  },
  {
    name: "progress",
    category: "scroll",
    file: SCROLL,
    attribute: "data-rm-progress",
    summary: "A reading-progress bar.",
    notes: "Uses a native scroll timeline where supported, so it stays in step during a fling.",
    example: '<div data-rm-progress data-rm-color="#2aa7e4"></div>',
    usage: 'import { progress } from "@soyrageagency/rage-motion";\nprogress();',
    options: [option("height", "number", "3", "Pixels.")],
  },
  {
    name: "horizontal",
    category: "scroll",
    file: SCROLL,
    attribute: "data-rm-horizontal",
    summary: "A section that scrolls sideways while pinned.",
    notes:
      "Vertical distance is mapped to horizontal travel by giving the wrapper " +
      "height. It never hijacks the wheel, so trackpad, keyboard and scrollbar " +
      "keep working.",
    example: "<section data-rm-horizontal><div data-rm-track>…</div></section>",
    usage: 'import { horizontal } from "@soyrageagency/rage-motion";\nhorizontal();',
    options: [option("selector", "selector", '"[data-rm-track]"', "The strip that moves.")],
  },
  {
    name: "stack",
    category: "scroll",
    file: SCROLL,
    attribute: "data-rm-stack",
    summary: "Cards pile up, shrinking and dimming as you pass them.",
    notes: "The sticking is CSS `position: sticky`; only scale and brightness are computed.",
    example: "<div data-rm-stack><article data-rm-card>…</article></div>",
    usage: 'import { stack } from "@soyrageagency/rage-motion";\nstack();',
    options: [option("top", "number", "80", "Where the first card sticks.")],
  },
  {
    name: "scrub",
    category: "scroll",
    file: SCROLL,
    attribute: "data-rm-scrub",
    summary: "Bind a CSS custom property to scroll position.",
    notes:
      "The escape hatch. `--rm-progress` runs 0 → 1 as the element crosses the " +
      "viewport and the stylesheet decides what that means.",
    example: '<div data-rm-scrub style="opacity: var(--rm-progress)">…</div>',
    usage: 'import { scrub } from "@soyrageagency/rage-motion";\nscrub();',
    options: [option("property", "string", '"--rm-progress"', "The property written.")],
  },
  {
    name: "tracing",
    category: "scroll",
    file: SCROLLFX,
    attribute: "data-rm-tracing",
    summary: "A line that draws itself down an article as you read.",
    notes:
      "A real path revealed with `stroke-dashoffset`, which is why it can curve " +
      "and why the glowing head can sit exactly on it. Tied to reading " +
      "position, so scrolling back up un-draws it.",
    example: "<article data-rm-tracing>…</article>",
    usage: 'import { tracing } from "@soyrageagency/rage-motion";\ntracing();',
    options: [option("wobble", "number", "14", "How much the line bends.")],
  },
  {
    name: "flatten",
    category: "scroll",
    file: SCROLLFX,
    attribute: "data-rm-flatten",
    summary: "A panel tilted in perspective that lies flat as you arrive.",
    notes:
      "Tied to how far the panel has crossed the viewport rather than to a " +
      "timer, so scrolling back up puts it back. An animation that only plays " +
      "forwards feels broken the moment anyone scrolls the other way.",
    example: '<div data-rm-flatten><img src="…" alt=""></div>',
    usage: 'import { flatten } from "@soyrageagency/rage-motion";\nflatten();',
    options: [option("angle", "number", "32", "Starting tilt, in degrees.")],
  },
  {
    name: "sticky",
    category: "scroll",
    file: SCROLLFX,
    attribute: "data-rm-sticky",
    summary: "One pinned visual that changes as the text beside it scrolls.",
    notes:
      "The pin is CSS `position: sticky`; the only JavaScript picks which panel " +
      "is in the reading position. Take the sticky rule away in a media query " +
      "and it degrades to a normal article — no second code path.",
    example:
      "<section data-rm-sticky>\n" +
      '  <div data-rm-sticky-media><img data-rm-sticky-frame src="…" alt=""></div>\n' +
      "  <div data-rm-sticky-panel>…</div>\n" +
      "</section>",
    usage: 'import { sticky } from "@soyrageagency/rage-motion";\nsticky();',
    options: [option("line", "number", "0.45", "Where the reading line sits, 0–1.")],
  },
  {
    name: "skew",
    category: "scroll",
    file: INTERACTIVE,
    attribute: "data-rm-skew",
    summary: "Content leans with scroll velocity and springs back.",
    notes:
      "The recognisable smooth-scroll lean without the smooth-scroll hijack: it " +
      "never replaces the browser's scrolling, so the scrollbar, find-in-page " +
      "and keyboard keep working. Clamped to 7 degrees.",
    example: '<section data-rm-skew="0.4">…</section>',
    usage: 'import { skew } from "@soyrageagency/rage-motion";\nskew();',
    options: [option("max", "number", "7", "Hard clamp, in degrees.")],
  },

  // ── Media ────────────────────────────────────────────────────────────────
  {
    name: "imageReveal",
    category: "media",
    file: MEDIA,
    attribute: "data-rm-image-reveal",
    summary: "A curtain wipes away to uncover an image.",
    notes: "The image also scales and settles back, or it reads as a rectangle sliding off a static picture.",
    example: '<figure data-rm-image-reveal="left"><img src="…" alt=""></figure>',
    usage: 'import { imageReveal } from "@soyrageagency/rage-motion";\nimageReveal();',
    options: [option("direction", "left | right | up | down", '"left"', "Where the curtain exits.")],
  },
  {
    name: "pixelate",
    category: "media",
    file: MEDIA,
    attribute: "data-rm-pixel",
    summary: "A pixel grid dissolves on hover.",
    notes:
      "Capped at 24 columns: a 40×40 grid is 1,600 nodes per card. Each card " +
      "dissolves in its own random order so two side by side do not move in " +
      "lockstep.",
    example: '<article data-rm-pixel data-rm-columns="16">…</article>',
    usage: 'import { pixelate } from "@soyrageagency/rage-motion";\npixelate();',
    options: [option("columns", "number", "14", "Clamped to 24.")],
  },
  {
    name: "hoverPreview",
    category: "media",
    file: MEDIA,
    attribute: "data-rm-preview",
    summary: "A link list that floats an image beside the pointer.",
    notes:
      "One shared floating element for the whole list, lagging behind the " +
      "pointer and tilting into its velocity, so it feels carried rather than " +
      "pinned.",
    example: '<ul data-rm-preview><li data-rm-preview-src="/one.jpg"><a href="#">One</a></li></ul>',
    usage: 'import { hoverPreview } from "@soyrageagency/rage-motion";\nhoverPreview();',
    options: [option("width", "number", "300", "The floating image.")],
  },
  {
    name: "marquee",
    category: "media",
    file: MEDIA,
    attribute: "data-rm-marquee",
    summary: "An infinite ticker that never jumps.",
    notes:
      "Content is duplicated until the track is twice the viewport, then " +
      "wrapped by exactly one copy width. Animating a single copy to -100% is " +
      "the usual shortcut and it jumps whenever the content is narrower than " +
      "the screen. Speed is pixels per second, so lines of different lengths " +
      "still match. Use it sparingly: a band of slogans sliding past is the " +
      "single most template-looking thing you can put on a page.",
    example: '<div data-rm-marquee data-rm-speed="80"><span>…</span></div>',
    usage: 'import { marquee } from "@soyrageagency/rage-motion";\nmarquee();',
    options: [
      option("speed", "number", "60", "Pixels per second."),
      option("pauseOnHover", "boolean", "true", "Stop so links can be clicked."),
    ],
  },

  // ── Galleries and carousels ──────────────────────────────────────────────
  {
    name: "carousel",
    category: "gallery",
    file: GALLERY,
    attribute: "data-rm-carousel",
    summary: "Drag with momentum and snap, keyboard included.",
    notes:
      "Built on the browser's own scrolling — `overflow-x` with scroll snap — " +
      "and the drag only adds pointer support on top. Wheel, trackpad, " +
      "scrollbar, keyboard, find-in-page and assistive technology all keep " +
      "working because none of them were replaced. The transform-based " +
      "carousel everyone writes throws all of that away to gain nothing.",
    example: "<div data-rm-carousel><article>…</article><article>…</article></div>",
    usage: 'import { carousel } from "@soyrageagency/rage-motion";\ncarousel();',
    options: [
      option("friction", "number", "0.94", "How long the throw carries."),
      option("label", "string", '"Carousel"', "The accessible name."),
    ],
  },
  {
    name: "ring",
    category: "gallery",
    file: GALLERY,
    attribute: "data-rm-ring",
    summary: "A cylinder of images you spin.",
    notes:
      "Items sit around a circle in 3D; the ones at the back dim and stay " +
      "behind. Drag has momentum and the arrow keys step one item, so it is " +
      "not a mouse-only toy.",
    example: '<div data-rm-ring data-rm-radius="380"><img src="…" alt=""></div>',
    usage: 'import { ring } from "@soyrageagency/rage-motion";\nring();',
    options: [option("radius", "number", "340", "How far out the items sit.")],
  },
  {
    name: "deck",
    category: "gallery",
    file: GALLERY,
    attribute: "data-rm-deck",
    summary: "A stack of cards; the front one flies out and lands at the back.",
    notes:
      "The order is a custom property per card rather than a re-sorted DOM, so " +
      "cards keep their identity: focus stays put, a video inside one keeps " +
      "playing, and nothing reloads because it was reinserted.",
    example: "<div data-rm-deck><article>…</article><article>…</article></div>",
    usage: 'import { deck } from "@soyrageagency/rage-motion";\ndeck();',
    options: [option("interval", "number", "3800", "Between shuffles; pauses on hover and focus.")],
  },
  {
    name: "imageTrail",
    category: "gallery",
    file: GALLERY,
    attribute: "data-rm-image-trail",
    summary: "Images left behind the pointer.",
    notes:
      "New images appear only after the pointer has travelled a set distance, " +
      "and the pool is fixed and reused in rotation — so a fast sweep cannot " +
      "spawn two hundred nodes and the DOM never grows.",
    example: '<section data-rm-image-trail data-rm-images="/a.jpg,/b.jpg,/c.jpg">…</section>',
    usage: 'import { imageTrail } from "@soyrageagency/rage-motion";\nimageTrail();',
    options: [option("distance", "number", "110", "Travel between images.")],
  },
  {
    name: "scratch",
    category: "gallery",
    file: GALLERY,
    attribute: "data-rm-scratch",
    summary: "Scratch a panel away to reveal what is under it.",
    notes:
      "A canvas erased with `destination-out`, which is the only way to get a " +
      "real brush edge. There is a button underneath for anyone who cannot " +
      "drag — a reveal reachable only by scrubbing is one some people never see.",
    example: "<div data-rm-scratch><img src=\"…\" alt=\"\"></div>",
    usage: 'import { scratch } from "@soyrageagency/rage-motion";\nscratch();',
    options: [option("threshold", "number", "0.5", "How much must be cleared before the rest fades.")],
  },
  {
    name: "dock",
    category: "gallery",
    file: GALLERY,
    attribute: "data-rm-dock",
    summary: "Items that magnify as the pointer passes.",
    notes:
      "Magnification falls off over a distance rather than switching on per " +
      "item, which is what makes it elastic instead of a row of hover states. " +
      "Scale only, so the row's layout never changes.",
    example: "<nav data-rm-dock><a href=\"#\">…</a><a href=\"#\">…</a></nav>",
    usage: 'import { dock } from "@soyrageagency/rage-motion";\ndock();',
    options: [option("magnify", "number", "1.75", "Peak scale.")],
  },
  {
    name: "compare",
    category: "gallery",
    file: INTERACTIVE,
    attribute: "data-rm-compare",
    summary: "A before/after slider, keyboard included.",
    notes:
      "Nearly every version of this is pointer-only, which makes it useless on " +
      "a keyboard and invisible to a screen reader. This is a real " +
      '`role="slider"` with arrows, Home and End and an announced value.',
    example: '<div data-rm-compare><img data-rm-before src="…" alt=""><img data-rm-after src="…" alt=""></div>',
    usage: 'import { compare } from "@soyrageagency/rage-motion";\ncompare();',
    options: [option("start", "number", "50", "Opening position, 0–100.")],
  },
  {
    name: "panels",
    category: "gallery",
    file: INTERACTIVE,
    attribute: "data-rm-panels",
    summary: "A row of panels where the one you point at takes the room.",
    notes:
      "The expansion is `flex-grow` transitioned in CSS, so the browser owns " +
      "the animation. Focus opens a panel as well as hover.",
    example: '<div data-rm-panels><a data-rm-panel href="#">…</a></div>',
    usage: 'import { panels } from "@soyrageagency/rage-motion";\npanels();',
    options: [option("grow", "number", "3.2", "How much room the open panel takes.")],
  },
  {
    name: "orbit",
    category: "gallery",
    file: INTERACTIVE,
    attribute: "data-rm-orbit",
    summary: "Items circling a centre, staying upright as they travel.",
    notes: "The ring rotates and each item counter-rotates, so logos and text stay readable.",
    example: '<div data-rm-orbit data-rm-radius="140"><span>…</span></div>',
    usage: 'import { orbit } from "@soyrageagency/rage-motion";\norbit();',
    options: [option("duration", "number", "24000", "One full turn.")],
  },
  {
    name: "ripple",
    category: "gallery",
    file: SHOWPIECE,
    attribute: "data-rm-ripple",
    summary: "A ring expands from wherever you click.",
    notes: "Sized to reach the furthest corner, and removed when its animation finishes rather than on a timer.",
    example: "<button data-rm-ripple>Send</button>",
    usage: 'import { ripple } from "@soyrageagency/rage-motion";\nripple();',
    options: [option("duration", "number", "620", "The expansion.")],
  },
  {
    name: "magnetLines",
    category: "gallery",
    file: SHOWPIECE,
    attribute: "data-rm-lines",
    summary: "A field of lines that all turn to face the pointer.",
    notes:
      "Rotation always takes the short way round — without that the field spins " +
      "backwards through 360 degrees every time the pointer crosses behind a " +
      "line, which is the giveaway of every copy of this effect. At rest they " +
      "fan toward the centre, so it looks designed before anyone touches it.",
    example: '<div data-rm-lines data-rm-columns="16" data-rm-rows="10"></div>',
    usage: 'import { magnetLines } from "@soyrageagency/rage-motion";\nmagnetLines();',
    options: [option("columns", "number", "14", "Clamped to 30.")],
  },

  // ── Buttons ──────────────────────────────────────────────────────────────
  {
    name: "fill",
    category: "button",
    file: BUTTONS,
    attribute: "data-rm-fill",
    summary: "A hover fill that enters from the edge you came in through.",
    notes:
      "Come in from the left and the colour sweeps in from the left. It takes " +
      "comparing the pointer to the element's centre in both axes, normalised " +
      "by the element's proportions — otherwise a wide button reports 'top' " +
      "for a pointer that plainly came in from the side. Keyboard focus has no " +
      "edge, so it fills from the middle.",
    example: '<a class="btn" data-rm-fill href="/start">Start</a>',
    usage: 'import { fill } from "@soyrageagency/rage-motion";\nfill();',
    options: [option("color", "colour", '"#2aa7e4"', "The fill.")],
  },
  {
    name: "shimmer",
    category: "button",
    file: BUTTONS,
    attribute: "data-rm-shimmer",
    summary: "A light that runs the length of the button.",
    notes: "Use it on the one button that matters. A shimmer on every button is a page that looks like it is loading.",
    example: "<button data-rm-shimmer>Get started</button>",
    usage: 'import { shimmer } from "@soyrageagency/rage-motion";\nshimmer();',
    options: [option("duration", "number", "2600", "One pass.")],
  },
  {
    name: "spark",
    category: "button",
    file: BUTTONS,
    attribute: "data-rm-spark",
    summary: "A burst of particles at the point of the click.",
    notes:
      "Fires on `pointerdown`, not `click`: the reward for pressing should " +
      "arrive when you press. The particles remove themselves when finished, so " +
      "nothing accumulates however much anyone clicks.",
    example: "<button data-rm-spark>Subscribe</button>",
    usage: 'import { spark } from "@soyrageagency/rage-motion";\nspark();',
    options: [option("count", "number", "12", "Particles per burst.")],
  },
  {
    name: "swap",
    category: "button",
    file: BUTTONS,
    attribute: "data-rm-swap",
    summary: "The label slides out and its twin slides in.",
    notes:
      "The duplicate is `aria-hidden`, so the button is announced once. Both " +
      "copies share a grid cell rather than being absolutely positioned, so the " +
      "button keeps sizing itself to its own text.",
    example: '<button data-rm-swap="Downloading…">Download</button>',
    usage: 'import { swap } from "@soyrageagency/rage-motion";\nswap();',
    options: [option("duration", "number", "380", "The slide.")],
  },

  // ── Navigation ───────────────────────────────────────────────────────────
  {
    name: "pill",
    category: "nav",
    file: NAV,
    attribute: "data-rm-pill",
    summary: "An indicator that slides to whatever link you point at.",
    notes:
      "One element measured against the target link and moved with a transform, " +
      "so it travels smoothly between items of different widths. The usual " +
      "`::after` underline per link cannot travel at all, which is the entire " +
      "appeal of the pattern. It returns to the `aria-current` link on leave.",
    example: '<nav data-rm-pill><a href="/" aria-current="page">Work</a><a href="/about">About</a></nav>',
    usage: 'import { pill } from "@soyrageagency/rage-motion";\npill();',
    options: [option("duration", "number", "420", "The travel.")],
  },
  {
    name: "gooey",
    category: "nav",
    file: NAV,
    attribute: "data-rm-gooey",
    summary: "The sliding indicator, but liquid.",
    notes:
      "Two blobs under an SVG gooey filter: one leads, one lags, and the filter " +
      "fuses them into one stretching shape. The stretch is a consequence of " +
      "two things moving at different speeds, not a keyframe pretending.",
    example: '<nav data-rm-gooey><a href="/" aria-current="page">Work</a><a href="/about">About</a></nav>',
    usage: 'import { gooey } from "@soyrageagency/rage-motion";\ngooey();',
    options: [
      option("lead", "number", "0.34", "How fast the leading blob follows."),
      option("lag", "number", "0.15", "How far the trailing blob falls behind."),
    ],
  },
  {
    name: "condense",
    category: "nav",
    file: NAV,
    attribute: "data-rm-condense",
    summary: "A header that shrinks on the way down and returns on the way up.",
    notes:
      "Two independent states: `is-small` past the fold, `is-hidden` only while " +
      "actively scrolling down. A header that hides purely by scroll position " +
      "is the one that vanishes when you are reaching for it. It never hides " +
      "while anything inside it has focus.",
    example: "<header data-rm-condense>…</header>",
    usage: 'import { condense } from "@soyrageagency/rage-motion";\ncondense();',
    options: [
      option("after", "number", "80", "Scroll distance before it shrinks."),
      option("hideAfter", "number", "240", "Before it may hide."),
    ],
  },
  {
    name: "overlay",
    category: "nav",
    file: NAV,
    attribute: "data-rm-overlay",
    summary: "A full-screen menu that opens out of its own button.",
    notes:
      "Clipped to a circle centred on the button and grown to cover the " +
      "viewport, so the menu comes from the thing you pressed. The " +
      "accessibility is the part worth copying: `aria-expanded`, focus moved in " +
      "and trapped, Escape closes, focus returns to the button, the rest of the " +
      "page is `inert`, and the body cannot scroll underneath.",
    example:
      '<button data-rm-overlay-open aria-controls="menu">Menu</button>\n' +
      '<div id="menu" data-rm-overlay hidden><a href="/work">Work</a></div>',
    usage: 'import { overlay } from "@soyrageagency/rage-motion";\noverlay();',
    options: [option("stagger", "number", "70", "Between links as they arrive.")],
  },
  {
    name: "tabs",
    category: "nav",
    file: NAV,
    attribute: "data-rm-tabs",
    summary: "Panels that slide in from the direction you came from.",
    notes:
      "Move right along the tabs and the panel arrives from the right. It costs " +
      "one comparison and it is the difference between tabs that feel spatial " +
      "and tabs that blink. Built on the real tab pattern: `role=\"tablist\"`, " +
      "arrow keys, roving tabindex, panels genuinely hidden when inactive.",
    example:
      "<div data-rm-tabs>\n" +
      "  <div><button data-rm-tab>One</button><button data-rm-tab>Two</button></div>\n" +
      "  <div data-rm-tab-panel>…</div><div data-rm-tab-panel>…</div>\n" +
      "</div>",
    usage: 'import { tabs } from "@soyrageagency/rage-motion";\ntabs();',
    options: [option("distance", "number", "26", "How far the panel travels in.")],
  },

  // ── Panel effects ────────────────────────────────────────────────────────
  {
    name: "meteors",
    category: "background",
    file: PANELFX,
    attribute: "data-rm-meteors",
    summary: "Streaks falling across a section.",
    notes:
      "Each meteor gets its own delay, duration and length from a seeded " +
      "sequence, so the shower never lines up into a visible pattern — which " +
      "is exactly what happens when they share one animation and only the " +
      "position differs.",
    example: '<section data-rm-meteors="18">…</section>',
    usage: 'import { meteors } from "@soyrageagency/rage-motion";\nmeteors();',
    options: [option("count", "number", "14", "Clamped to 40."), option("speed", "number", "4200", "Base fall time.")],
  },
  {
    name: "sparkles",
    category: "background",
    file: PANELFX,
    attribute: "data-rm-sparkles",
    summary: "Points that twinkle and drift over an element.",
    notes:
      "Negative animation delays start every point part-way through, so the " +
      "field is already alive on the first frame instead of blinking on " +
      "together — and a point at full brightness is a different size from its " +
      "neighbour, which is what stops it looking like dust.",
    example: "<h1 data-rm-sparkles>Launch day</h1>",
    usage: 'import { sparkles } from "@soyrageagency/rage-motion";\nsparkles();',
    options: [option("count", "number", "26", "Clamped to 60."), option("color", "colour", '"#f4d738"', "The points.")],
  },
  {
    name: "lamp",
    category: "background",
    file: PANELFX,
    attribute: "data-rm-lamp",
    summary: "A cone of light thrown from one edge.",
    notes:
      "Two mirrored halves of a conic gradient meeting at a hairline, which " +
      "gives the light a hard source and a soft spill. A blurred radial " +
      "gradient — the usual approach — reads as a smudge in the corner.",
    example: '<section data-rm-lamp="top" data-rm-color="#2aa7e4">…</section>',
    usage: 'import { lamp } from "@soyrageagency/rage-motion";\nlamp();',
    options: [option("spread", "number", "42", "How wide the cone opens."), option("from", "top | bottom", '"top"', "Which edge it hangs from.")],
  },
  {
    name: "beams",
    category: "background",
    file: PANELFX,
    attribute: "data-rm-beams",
    summary: "Vertical shafts sweeping through a dark panel.",
    notes:
      "Masked to fade at both ends, which is the difference between light and " +
      "a set of moving stripes. Each shaft has its own width, opacity and " +
      "period.",
    example: "<section data-rm-beams>…</section>",
    usage: 'import { beams } from "@soyrageagency/rage-motion";\nbeams();',
    options: [option("count", "number", "7", "Clamped to 20."), option("tilt", "number", "12", "Degrees off vertical.")],
  },

  // ── Disclosure ───────────────────────────────────────────────────────────
  {
    name: "accordion",
    category: "disclosure",
    file: DISCLOSE,
    attribute: "data-rm-accordion",
    summary: "Sections that expand without measuring anything.",
    notes:
      "The height animates with `grid-template-rows: 0fr → 1fr`, so nothing is " +
      "measured and nothing is hardcoded: the panel can contain an image that " +
      "loads late, a font that swaps, or text that rewraps, and the animation " +
      "stays correct. Every version built on `scrollHeight` breaks on all three.",
    example:
      "<div data-rm-accordion>\n" +
      "  <section>\n" +
      "    <button data-rm-accordion-head>What it costs</button>\n" +
      "    <div data-rm-accordion-body>…</div>\n" +
      "  </section>\n" +
      "</div>",
    usage: 'import { accordion } from "@soyrageagency/rage-motion";\naccordion();',
    options: [option("single", "boolean", "true", "Close the others when one opens.")],
  },
  {
    name: "flip",
    category: "disclosure",
    file: DISCLOSE,
    attribute: "data-rm-flip",
    summary: "A card with a back, turned by pointer or keyboard.",
    notes:
      "A flip card that only answers to hover hides half its content from " +
      "anyone not using a mouse, so this is a real control: role, " +
      "`aria-pressed`, Enter and Space. The hidden face is `inert`, so nobody " +
      "tabs into something they cannot see. The faces share a grid cell, so the " +
      "card sizes to the taller one and never clips the other.",
    example:
      "<div data-rm-flip>\n  <div data-rm-flip-front>…</div>\n  <div data-rm-flip-back>…</div>\n</div>",
    usage: 'import { flip } from "@soyrageagency/rage-motion";\nflip();',
    options: [option("axis", "x | y", '"y"', "Which way it turns."), option("duration", "number", "620", "The turn.")],
  },
  {
    name: "expand",
    category: "disclosure",
    file: DISCLOSE,
    attribute: "data-rm-expand",
    summary: "A card that grows into a dialog, out of exactly where you pressed.",
    notes:
      "The card itself becomes the dialog — not a copy, and not some other " +
      "element fading in from the middle of the screen. A placeholder holds its " +
      "place so nothing below jumps, and it FLIPs from its old box to its new " +
      "one, which is why anything inside it survives the transition. It is a " +
      "real dialog while open: focus moved in and trapped, Escape closes, focus " +
      "returns to the card.",
    example:
      "<article data-rm-expand>\n  <h3>Title</h3>\n  <div data-rm-expand-more hidden>The long version…</div>\n</article>",
    usage: 'import { expand } from "@soyrageagency/rage-motion";\nexpand();',
    options: [option("width", "number", "720", "Opened width, capped to the viewport.")],
  },
  {
    name: "lightbox",
    category: "disclosure",
    file: DISCLOSE,
    attribute: "data-rm-lightbox",
    summary: "An image that opens full screen, out of its own thumbnail.",
    notes:
      "The same FLIP as `expand`, so the picture grows from where it was rather " +
      "than cross-fading in. Escape or a click closes it and focus goes back to " +
      "the thumbnail.",
    example: '<img data-rm-lightbox src="small.jpg" alt="…">',
    usage: 'import { lightbox } from "@soyrageagency/rage-motion";\nlightbox();',
    options: [option("duration", "number", "480", "The grow.")],
  },

  // ── Motion primitives ────────────────────────────────────────────────────
  {
    name: "drag",
    category: "gallery",
    file: MOTIONFX,
    attribute: "data-rm-drag",
    summary: "Pick anything up, throw it, watch it settle back.",
    notes:
      "Pointer capture means the drag survives the pointer leaving the element, " +
      "which is the bug in most hand-rolled drags: move fast and the thing is " +
      "stranded because `pointermove` stopped arriving. Arrow keys nudge it, " +
      "because a control only usable by dragging is one some people cannot use.",
    example: "<div data-rm-drag>Throw me</div>",
    usage: 'import { drag } from "@soyrageagency/rage-motion";\ndrag();',
    options: [option("bounds", "number", "160", "How far it can travel."), option("spring", "number", "0.09", "How quickly it comes home.")],
  },
  {
    name: "shuffle",
    category: "gallery",
    file: MOTIONFX,
    attribute: "data-rm-shuffle",
    summary: "A grid that rearranges itself when you filter it.",
    notes:
      "A FLIP: measure where every item is, change what is shown, measure " +
      "again, animate each from its old box to its new one. Items travel to " +
      "their new places instead of the grid blinking into a different " +
      "arrangement — and the layout is still plain CSS grid doing the work.",
    example:
      "<div data-rm-shuffle>\n" +
      '  <button data-rm-filter="all" aria-pressed="true">All</button>\n' +
      '  <button data-rm-filter="web">Web</button>\n' +
      "  <div data-rm-shuffle-grid>\n" +
      '    <article data-rm-tags="web">…</article>\n' +
      "  </div>\n" +
      "</div>",
    usage: 'import { shuffle } from "@soyrageagency/rage-motion";\nshuffle();',
    options: [option("duration", "number", "520", "The travel."), option("stagger", "number", "22", "Between items, capped at 220ms total.")],
  },
  {
    name: "confetti",
    category: "button",
    file: MOTIONFX,
    attribute: null,
    summary: "A burst of confetti at any point you name.",
    notes:
      "Each piece gets its own arc — a horizontal throw plus gravity — rather " +
      "than a straight line, which is what makes it read as confetti and not a " +
      "firework. Pieces remove themselves the moment they finish, so a page " +
      "cannot accumulate them. Returns a `fire()` to call when the good news " +
      "arrives.",
    example: "<!-- no markup: call fire() from your own handler -->",
    usage:
      'import { confetti } from "@soyrageagency/rage-motion";\n' +
      "const fire = confetti();\n" +
      'button.addEventListener("click", (e) => fire({ x: e.clientX, y: e.clientY }));',
    options: [option("count", "number", "60", "Pieces per burst."), option("gravity", "number", "420", "How far they fall.")],
  },

  // ── More typography ──────────────────────────────────────────────────────
  {
    name: "outline",
    category: "text",
    file: TYPE,
    attribute: "data-rm-outline",
    summary: "Outlined text that fills as it crosses the viewport.",
    notes:
      "One element: a stroke for the empty part and a gradient clipped to the " +
      "glyphs for the filled part. Two stacked copies of the text — the usual " +
      "fake — double the antialiasing on every edge, which is why those " +
      "versions look blurry as they fill.",
    example: "<h2 data-rm-outline>Scroll to fill</h2>",
    usage: 'import { outline } from "@soyrageagency/rage-motion";\noutline();',
    options: [option("stroke", "colour", '"rgba(241,238,233,0.28)"', "The empty outline.")],
  },
  {
    name: "rollText",
    category: "text",
    file: TYPE,
    attribute: "data-rm-roll",
    summary: "A word that rolls to its replacement.",
    notes:
      "Both faces are real text in the flow, sharing a grid cell, so the " +
      "element still sizes itself. The usual version absolutely positions the " +
      "back face, which collapses the box and hides the second label from " +
      "everything but a mouse.",
    example: '<a data-rm-roll="Get in touch" href="/contact">Contact</a>',
    usage: 'import { rollText } from "@soyrageagency/rage-motion";\nrollText();',
    options: [option("axis", "x | y", '"x"', "Roll vertically or sideways.")],
  },
  {
    name: "countdown",
    category: "text",
    file: TYPE,
    attribute: "data-rm-countdown",
    summary: "A live countdown on rolling digit columns.",
    notes:
      "The target is read from `datetime`, so the markup carries a real " +
      "machine-readable date and the page still says something useful with no " +
      "JavaScript at all. It ticks once a second, because nothing below a " +
      "second is visible on a clock.",
    example: '<time data-rm-countdown datetime="2027-01-01T00:00:00Z">1 January</time>',
    usage: 'import { countdown } from "@soyrageagency/rage-motion";\ncountdown();',
    options: [option("done", "string", '"Now"', "Shown when it reaches zero.")],
  },

  // ── More navigation ──────────────────────────────────────────────────────
  {
    name: "scrollSpy",
    category: "nav",
    file: NAV,
    attribute: "data-rm-spy",
    summary: "Marks the navigation link for whatever section you are reading.",
    notes:
      "It sets `aria-current` and nothing else — no classes, no indicator of " +
      "its own. That is the design: `pill` and `gooey` already rest on the " +
      "current link, so putting them together makes the indicator follow the " +
      "page as you scroll, and none of the three had to know about the others.",
    example: '<nav data-rm-spy data-rm-pill><a href="#work">Work</a><a href="#about">About</a></nav>',
    usage: 'import { scrollSpy } from "@soyrageagency/rage-motion";\nscrollSpy();',
    options: [option("line", "number", "0.32", "Where the reading line sits, 0-1.")],
  },
  {
    name: "progressRing",
    category: "nav",
    file: NAV,
    attribute: "data-rm-ring-progress",
    summary: "A ring that fills as the page scrolls.",
    notes:
      "`stroke-dasharray` on a real circle, so the ring is drawn rather than " +
      "approximated by rotating two half-discs — which is the usual trick and " +
      "why those versions cannot have a rounded cap. It is `aria-hidden`: " +
      "decoration for something the page already announces.",
    example: '<a href="#top" data-rm-ring-progress>Top</a>',
    usage: 'import { progressRing } from "@soyrageagency/rage-motion";\nprogressRing();',
    options: [option("size", "number", "44", "Outer diameter."), option("width", "number", "2", "Stroke.")],
  },

  // ── Page chrome ──────────────────────────────────────────────────────────
  {
    name: "scrollbar",
    category: "chrome",
    file: CHROME,
    attribute: "data-rm-scrollbar",
    summary: "A styled scrollbar that still behaves like a scrollbar.",
    notes:
      "It applies a class; the styling is CSS, using `scrollbar-width` and " +
      "`scrollbar-color` where they work and `::-webkit-scrollbar` where they " +
      "do not. Nothing is rebuilt in JavaScript, because the div-with-a-handle " +
      "version everyone ships loses the wheel's page-jump, the keyboard, the " +
      "context menu, momentum and every assistive technology that knows what a " +
      "scrollbar is. Five looks: thin, pill, accent, ghost and inset.",
    example: '<body data-rm-scrollbar="accent">\n<div class="panel" data-rm-scrollbar="ghost">…</div>',
    usage: 'import { scrollbar } from "@soyrageagency/rage-motion";\nscrollbar();',
    options: [
      option("style", "thin | pill | accent | ghost | inset", '"thin"', "Which look."),
      option("color", "colour", "unset", "Overrides the thumb."),
    ],
  },
  {
    name: "dropdown",
    category: "chrome",
    file: CHROME,
    attribute: "data-rm-dropdown",
    summary: "A menu button with real keyboard semantics.",
    notes:
      "The whole pattern, because a homemade dropdown hurts most: " +
      "`aria-haspopup` and `aria-expanded`, `role=\"menu\"`, arrow keys with " +
      "Home and End moving a roving focus, Escape closing and returning focus, " +
      "a click anywhere else closing it, and the menu flipping above the button " +
      "when there is no room below — measured against the viewport rather than " +
      "assumed.",
    example:
      "<div data-rm-dropdown>\n" +
      "  <button data-rm-dropdown-button>Sort</button>\n" +
      "  <div data-rm-dropdown-menu><button>Newest</button><button>Oldest</button></div>\n" +
      "</div>",
    usage: 'import { dropdown } from "@soyrageagency/rage-motion";\ndropdown();',
    options: [option("duration", "number", "220", "The open.")],
  },
  {
    name: "tooltip",
    category: "chrome",
    file: CHROME,
    attribute: "data-rm-tooltip",
    summary: "A hint that is announced as well as shown.",
    notes:
      "Wired with `aria-describedby` and `role=\"tooltip\"`, so a screen reader " +
      "reads it too — a title replacement that only appears on hover is " +
      "invisible to everyone not using a mouse, which is the entire point of a " +
      "tooltip. It shows on focus and hides on Escape, both of which the " +
      "browser's own `title` does and almost every replacement forgets.",
    example: '<button data-rm-tooltip="Copies to your clipboard">Copy</button>',
    usage: 'import { tooltip } from "@soyrageagency/rage-motion";\ntooltip();',
    options: [option("placement", "top | bottom", '"top"', "Which side it sits."), option("delay", "number", "120", "Before it appears.")],
  },
  {
    name: "toggle",
    category: "chrome",
    file: CHROME,
    attribute: "data-rm-toggle",
    summary: "A switch that is a real checkbox underneath.",
    notes:
      "The input is still there, still focusable, still submitted with the " +
      "form, still announced as a checkbox — it is only visually replaced. " +
      "Every switch built from a div loses all four, and usually gains a click " +
      "handler that does not fire on Space.",
    example: '<label data-rm-toggle><input type="checkbox"> Dark mode</label>',
    usage: 'import { toggle } from "@soyrageagency/rage-motion";\ntoggle();',
    options: [option("duration", "number", "260", "The throw.")],
  },

  // ── Decoration ───────────────────────────────────────────────────────────
  {
    name: "dots",
    category: "background",
    file: DECOR,
    attribute: "data-rm-dots",
    summary: "A dot field, drifting.",
    notes:
      "A repeating radial gradient, not elements — one paint for the whole " +
      "field however large it is, where a DOM version is one node per dot and a " +
      "canvas version is a frame budget for something that never changes shape.",
    example: '<section data-rm-dots data-rm-gap="26">…</section>',
    usage: 'import { dots } from "@soyrageagency/rage-motion";\ndots();',
    options: [option("gap", "number", "22", "Spacing."), option("speed", "number", "24000", "One drift cycle.")],
  },
  {
    name: "stripes",
    category: "background",
    file: DECOR,
    attribute: "data-rm-stripes",
    summary: "Diagonal hatching that travels.",
    notes:
      "A repeating linear gradient moved by background-position, which the " +
      "compositor handles alone. Good for a work-in-progress band, a disabled " +
      "state, or anywhere a flat block wants texture.",
    example: '<div data-rm-stripes data-rm-width="12">…</div>',
    usage: 'import { stripes } from "@soyrageagency/rage-motion";\nstripes();',
    options: [option("width", "number", "10", "Stripe width."), option("angle", "number", "45", "Degrees.")],
  },
  {
    name: "corners",
    category: "surface",
    file: DECOR,
    attribute: "data-rm-corners",
    summary: "Brackets that draw themselves around an element.",
    notes:
      "Drawn on hover and on focus-within, so a keyboard user gets the same " +
      "emphasis a mouse user does. Corners rather than a border because a " +
      "border changes the box; these sit outside it and cannot move anything.",
    example: "<article data-rm-corners>…</article>",
    usage: 'import { corners } from "@soyrageagency/rage-motion";\ncorners();',
    options: [option("size", "number", "16", "Bracket length."), option("offset", "number", "8", "How far outside the box.")],
  },
  {
    name: "scanline",
    category: "background",
    file: DECOR,
    attribute: "data-rm-scanline",
    summary: "A CRT line passing down a panel.",
    notes:
      "One gradient sliding on a loop over a faint rule pattern. Overdone it is " +
      "a costume; at low opacity on a dark panel it just adds the sense that " +
      "something is live.",
    example: "<div data-rm-scanline>…</div>",
    usage: 'import { scanline } from "@soyrageagency/rage-motion";\nscanline();',
    options: [option("speed", "number", "5200", "One pass."), option("lines", "boolean", "true", "The rule pattern under it.")],
  },
  {
    name: "mesh",
    category: "background",
    file: DECOR,
    attribute: "data-rm-mesh",
    summary: "A mesh gradient that moves, in CSS.",
    notes:
      "Four radial gradients on long offset transforms under a blur. The blur " +
      "is what makes it a mesh rather than four visible blobs, and doing it in " +
      "CSS means the compositor animates it with no main-thread work — a canvas " +
      "mesh looks the same and costs a budget you will want elsewhere.",
    example: "<section data-rm-mesh>…</section>",
    usage: 'import { mesh } from "@soyrageagency/rage-motion";\nmesh();',
    options: [option("blur", "number", "70", "How far the colours bleed."), option("opacity", "number", "0.5", "Keep it under the text's contrast floor.")],
  },
  {
    name: "starfield",
    category: "background",
    file: DECOR,
    attribute: "data-rm-stars",
    summary: "Depth, on a canvas, with parallax on scroll.",
    notes:
      "Canvas rather than CSS because this is the one thing the other " +
      "decorations are not: hundreds of independent points at three depths " +
      "drifting at different rates. The nearer layer moves further with scroll, " +
      "which is the whole illusion. It stops when the section is off screen.",
    example: "<section data-rm-stars>…</section>",
    usage: 'import { starfield } from "@soyrageagency/rage-motion";\nstarfield();',
    options: [option("count", "number", "160", "Clamped to 400."), option("parallax", "number", "0.22", "How much depth the scroll gives.")],
  },

  // ── More buttons ─────────────────────────────────────────────────────────
  {
    name: "underline",
    category: "button",
    file: BUTTONS,
    attribute: "data-rm-underline",
    summary: "An underline that draws from the side you came in through.",
    notes:
      "The link equivalent of `fill`: enter from the left and the rule grows " +
      "from the left, leave to the right and it retreats that way. One " +
      "`transform-origin` swap, and the difference between a link that feels " +
      "physical and a `text-decoration` toggle. Focus grows it from the middle, " +
      "because focus has no side to come from.",
    example: '<a class="link" data-rm-underline href="/work">Work</a>',
    usage: 'import { underline } from "@soyrageagency/rage-motion";\nunderline();',
    options: [option("thickness", "number", "1.5", "Rule weight."), option("duration", "number", "340", "The draw.")],
  },
  {
    name: "press",
    category: "button",
    file: BUTTONS,
    attribute: "data-rm-press",
    summary: "A button with depth that actually depresses.",
    notes:
      "The face travels exactly the distance the shadow loses, so the bottom " +
      "edge stays where it was and only the key moves — which is what makes it " +
      "read as a key going down rather than a rectangle sliding.",
    example: '<button data-rm-press data-rm-depth="5">Buy</button>',
    usage: 'import { press } from "@soyrageagency/rage-motion";\npress();',
    options: [option("depth", "number", "4", "How far it sits above its shadow.")],
  },
  {
    name: "halo",
    category: "button",
    file: BUTTONS,
    attribute: "data-rm-halo",
    summary: "A glow that follows the pointer inside the button.",
    notes:
      "`spotlight` sized for a control, and it fades rather than snapping off, " +
      "so leaving the button does not read as a light being switched off. One " +
      "shared listener for the whole set.",
    example: "<button data-rm-halo>Hover me</button>",
    usage: 'import { halo } from "@soyrageagency/rage-motion";\nhalo();',
    options: [option("size", "number", "120", "Glow diameter.")],
  },
  {
    name: "strokeDraw",
    category: "button",
    file: BUTTONS,
    attribute: "data-rm-stroke",
    summary: "An outline that draws itself around the button on hover.",
    notes:
      "A real SVG rectangle revealed with `stroke-dashoffset`, so the line " +
      "travels around the shape from one corner. A CSS border can only fade in " +
      "— it has no start and no end, which is why every CSS version of this is " +
      "four elements pretending to be one line. The rectangle is re-measured on " +
      "resize, so it stays on the button when the label or the font changes.",
    example: "<button data-rm-stroke>Read the docs</button>",
    usage: 'import { strokeDraw } from "@soyrageagency/rage-motion";\nstrokeDraw();',
    options: [option("duration", "number", "520", "One lap."), option("width", "number", "1.5", "Stroke weight.")],
  },

  // ── Button kit ───────────────────────────────────────────────────────────
  {
    name: "buttonKit",
    category: "button",
    file: BUTTONKIT,
    attribute: "data-rm-btn",
    summary: "Fifty-two named button looks, on one component.",
    notes:
      "One component with a named look, not fifty-two components — they share " +
      "the same guarantee, which is the reason to build it this way: none " +
      "replaces the element, adds a click handler or swallows an event, so " +
      "focus rings, keyboard activation, form submission and middle-clicking a " +
      "link all still work. Every look answers to `:hover` AND `:focus-visible`, " +
      "because a button that only rewards a mouse is half a button. None of " +
      "them animates a width, a padding or a font size, so no look in the kit " +
      "can push the layout around while you point at it.\n\n" +
      "Surface: solid, outline, ghost, soft, glass, inset, depth, brutal, " +
      "brutal-move. Filling: fill-up, fill-down, fill-left, fill-right, " +
      "fill-center, fill-diagonal, fill-split, curtain. Light: glow, neon, " +
      "neon-flicker, sweep, shine, gradient, scan, pulse. Edges: border-grow, " +
      "border-dash, corner-cut, double, notch. Motion: lift, sink, squish, " +
      "jelly, wobble, tilt3d, nudge, rotate-in. Label: slide-up, slide-down, " +
      "slide-left, slice, arrow, track, caps, strike, caret. Progress: " +
      "loading-bar, rail-grow, progress. Texture: dots, stripes.",
    example:
      '<button data-rm-btn="brutal">Ship it</button>\n' +
      '<a class="cta" data-rm-btn="fill-up" href="/start">Start</a>\n' +
      '<button data-rm-btn="slide-up" data-rm-twin="Let\'s go">Contact</button>',
    usage: 'import { buttonKit, BUTTON_STYLES } from "@soyrageagency/rage-motion";\nbuttonKit();\n// BUTTON_STYLES is the list of names, if you want to render a picker.',
    options: [option("style", "one of BUTTON_STYLES", '"solid"', "The fallback when the attribute names something unknown.")],
  },

  // ── Large navigation ─────────────────────────────────────────────────────
  {
    name: "command",
    category: "nav",
    file: NAVBARS,
    attribute: "data-rm-command",
    summary: "A ⌘K palette that filters and moves on the keyboard.",
    notes:
      "Opens on ⌘K or Ctrl-K, filters as you type, moves with the arrows, " +
      "commits on Enter, closes on Escape. Focus goes into the field and comes " +
      "back to whatever had it, and the page behind is inert. The filter is a " +
      "substring match over each item's own text, so the markup stays the " +
      "source of truth — there is no parallel list to keep in sync, which is " +
      "the commonest bug in every hand-rolled palette.",
    example:
      "<div data-rm-command hidden>\n" +
      '  <input data-rm-command-input placeholder="Search…">\n' +
      '  <div data-rm-command-list><a href="/work">Work</a><a href="/about">About</a></div>\n' +
      "</div>",
    usage: 'import { command } from "@soyrageagency/rage-motion";\ncommand();',
    options: [option("key", "string", '"k"', "The shortcut, with cmd or ctrl."), option("empty", "string", '"Nothing matches"', "Shown when the filter finds nothing.")],
  },
  {
    name: "sidebar",
    category: "nav",
    file: NAVBARS,
    attribute: "data-rm-sidebar",
    summary: "A drawer that slides in and gives focus back.",
    notes:
      "A drawer is a dialog that happens to be against an edge, and treating it " +
      "as decoration is how it becomes a trap. So: focus moves in and is " +
      "trapped, Escape closes, focus returns to the button, the page behind is " +
      "inert and cannot scroll.",
    example:
      '<button data-rm-sidebar-open aria-controls="drawer">Menu</button>\n' +
      '<aside id="drawer" data-rm-sidebar="left" hidden>…</aside>',
    usage: 'import { sidebar } from "@soyrageagency/rage-motion";\nsidebar();',
    options: [option("side", "left | right", '"left"', "Which edge it comes from.")],
  },
  {
    name: "rail",
    category: "nav",
    file: NAVBARS,
    attribute: "data-rm-rail",
    summary: "A vertical rail with a marker that travels.",
    notes:
      "It rests on `aria-current`, so `scrollSpy` drives it for free and the " +
      "rail never has to know what a section is — the same trick `pill` uses, " +
      "and the reason all three compose. It watches the attribute with a " +
      "MutationObserver rather than the scroll position, so there is never a " +
      "second opinion about which section you are in.",
    example: '<nav data-rm-rail data-rm-spy><a href="#one">One</a><a href="#two">Two</a></nav>',
    usage: 'import { rail, scrollSpy } from "@soyrageagency/rage-motion";\nrail();\nscrollSpy();',
    options: [option("duration", "number", "420", "The travel.")],
  },
  {
    name: "bottomNav",
    category: "nav",
    file: NAVBARS,
    attribute: "data-rm-bottom",
    summary: "A bottom bar with an indicator that follows.",
    notes:
      "The phone tab bar. The indicator is measured against the current item " +
      "and moved with a transform, and the bar hides on the way down and " +
      "returns on the way up — but never while anything inside it has focus, so " +
      "tabbing into the navigation cannot make it disappear.",
    example: '<nav data-rm-bottom><a href="#a" aria-current="true">Home</a><a href="#b">Search</a></nav>',
    usage: 'import { bottomNav } from "@soyrageagency/rage-motion";\nbottomNav();',
    options: [option("hideOnScroll", "boolean", "true", "Whether it gets out of the way.")],
  },
  {
    name: "mega",
    category: "nav",
    file: NAVBARS,
    attribute: "data-rm-mega",
    summary: "A wide panel under a top-level item, with hover intent.",
    notes:
      "It opens after a short delay and closes after a longer one, so dragging " +
      "the pointer diagonally toward the panel does not snap it shut halfway — " +
      "the single thing that makes most mega menus infuriating. Focus opens it " +
      "and Escape closes it, and the trigger carries `aria-expanded`, so it is " +
      "a disclosure rather than a hover trick.",
    example:
      "<nav data-rm-mega>\n" +
      "  <div data-rm-mega-item>\n" +
      "    <button data-rm-mega-trigger>Products</button>\n" +
      "    <div data-rm-mega-panel>…</div>\n" +
      "  </div>\n" +
      "</nav>",
    usage: 'import { mega } from "@soyrageagency/rage-motion";\nmega();',
    options: [option("openDelay", "number", "90", "Hover intent in."), option("closeDelay", "number", "260", "Hover intent out.")],
  },

  // ── Forms ────────────────────────────────────────────────────────────────
  {
    name: "floatLabel",
    category: "form",
    file: FORMS,
    attribute: "data-rm-float",
    summary: "A label that rises out of the field and stays up.",
    notes:
      "Staying up while there is a value is the whole difficulty — a label that " +
      "drops back over typed text is the version everyone ships. The `<label>` " +
      "is untouched, so clicking it still focuses the field and it is still the " +
      "field's accessible name. `:placeholder-shown` answers \"is this empty?\" " +
      "in CSS, so the raised state needs no JavaScript.",
    example: '<div data-rm-float><input id="email" type="email" placeholder=" "><label for="email">Email</label></div>',
    usage: 'import { floatLabel } from "@soyrageagency/rage-motion";\nfloatLabel();',
    options: [option("duration", "number", "220", "The rise.")],
  },
  {
    name: "autoGrow",
    category: "form",
    file: FORMS,
    attribute: "data-rm-grow",
    summary: "A textarea that grows with its content, measuring nothing.",
    notes:
      "The wrapper is a grid sized by an invisible copy of the text and the " +
      "textarea fills it. Nothing is measured, so it is correct on the first " +
      "paint, after a font swap, after a paste and at every width — where the " +
      "`scrollHeight` version is a frame late on all four.",
    example: '<div data-rm-grow><textarea rows="2"></textarea></div>',
    usage: 'import { autoGrow } from "@soyrageagency/rage-motion";\nautoGrow();',
    options: [],
  },
  {
    name: "charCount",
    category: "form",
    file: FORMS,
    attribute: "data-rm-count-chars",
    summary: "A live character counter that is announced, not only shown.",
    notes:
      "It stays silent until the field is near its limit and only then starts " +
      "speaking, because a counter that announces every keystroke is unusable " +
      "with a screen reader on.",
    example: '<textarea maxlength="280" data-rm-count-chars></textarea>',
    usage: 'import { charCount } from "@soyrageagency/rage-motion";\ncharCount();',
    options: [option("warnAt", "number", "0.8", "Share of the limit before it warns.")],
  },
  {
    name: "passwordToggle",
    category: "form",
    file: FORMS,
    attribute: "data-rm-password",
    summary: "Show and hide a password, as a real pressed button.",
    notes:
      "`aria-pressed`, so the state is announced rather than implied by an " +
      "icon. Focus and the caret position are restored after the type changes, " +
      "because switching `type` resets the selection and losing your place " +
      "mid-password is exactly the moment you did not want it.",
    example: '<div data-rm-password><input type="password"></div>',
    usage: 'import { passwordToggle } from "@soyrageagency/rage-motion";\npasswordToggle();',
    options: [option("show", "string", '"Show password"', "The label when hidden.")],
  },
  {
    name: "validate",
    category: "form",
    file: FORMS,
    attribute: "data-rm-validate",
    summary: "Inline validation wired into the field itself.",
    notes:
      "It uses the browser's own constraint validation rather than a second set " +
      "of rules that will drift from the ones the server enforces. The message " +
      "is linked with `aria-describedby` and the field marked `aria-invalid`, " +
      "so the error is part of the field rather than red text near it. It waits " +
      "for blur before the first complaint: telling someone their email is " +
      "invalid after one letter is true and useless.",
    example: '<form data-rm-validate><input type="email" required></form>',
    usage: 'import { validate } from "@soyrageagency/rage-motion";\nvalidate();',
    options: [],
  },
  {
    name: "rangeFill",
    category: "form",
    file: FORMS,
    attribute: "data-rm-range",
    summary: "A range input with a filled track.",
    notes:
      "The input is untouched: still a range, still keyboard-operable, still " +
      "announced with its value. A custom property carries the position and the " +
      "stylesheet paints the fill, so there is no second element pretending to " +
      "be a slider and no drag handling to get wrong.",
    example: '<input type="range" data-rm-range min="0" max="100">',
    usage: 'import { rangeFill } from "@soyrageagency/rage-motion";\nrangeFill();',
    options: [option("output", "boolean", "true", "Show the value beside it.")],
  },
  {
    name: "fileDrop",
    category: "form",
    file: FORMS,
    attribute: "data-rm-drop",
    summary: "A drop zone that is still a file input.",
    notes:
      "Dragging is added on top and the input keeps its own button, so the " +
      "field can be reached with a keyboard. A drop zone with the input hidden " +
      "behind `display: none` is a control nobody can use without a mouse, and " +
      "it is the usual shape of this component.",
    example: '<label data-rm-drop><input type="file"> Drop a file</label>',
    usage: 'import { fileDrop } from "@soyrageagency/rage-motion";\nfileDrop();',
    options: [option("empty", "string", '"No file chosen"', "Shown before a choice.")],
  },
  {
    name: "stepper",
    category: "form",
    file: FORMS,
    attribute: "data-rm-steps",
    summary: "A multi-step form with a progress line.",
    notes:
      "Each step is genuinely hidden when inactive, so a screen reader cannot " +
      "wander into step three from step one and the browser will not try to " +
      "validate a field nobody can see. Moving forward runs the browser's own " +
      "validation on the current step only.",
    example: "<form data-rm-steps><fieldset data-rm-step>…</fieldset><button data-rm-step-next>Next</button></form>",
    usage: 'import { stepper } from "@soyrageagency/rage-motion";\nstepper();',
    options: [option("duration", "number", "320", "The slide between steps.")],
  },
  {
    name: "fieldFocus",
    category: "form",
    file: FORMS,
    attribute: "data-rm-field-focus",
    summary: "A focus ring that draws itself around the field.",
    notes:
      "Decoration on top of the real focus outline, never instead of it: it is " +
      "drawn on `:focus-visible`, so it appears for the keyboard and stays out " +
      "of the mouse's way, and removing the component leaves the field's own " +
      "focus style intact.",
    example: "<input data-rm-field-focus>",
    usage: 'import { fieldFocus } from "@soyrageagency/rage-motion";\nfieldFocus();',
    options: [option("color", "colour", '"#2aa7e4"', "The ring.")],
  },
  {
    name: "submitState",
    category: "form",
    file: FORMS,
    attribute: "data-rm-submit",
    summary: "A submit button that shows it is working.",
    notes:
      "`aria-busy` and a disabled state while the form is in flight, so a " +
      "second click cannot double-submit and the wait is announced rather than " +
      "only spinning. Call `button.rmSettle(ok)` when your request finishes.",
    example: "<button data-rm-submit>Send</button>",
    usage: 'import { submitState } from "@soyrageagency/rage-motion";\nsubmitState();',
    options: [option("busy", "string", '"Working…"', "The label while it waits.")],
  },
  {
    name: "mascot",
    category: "form",
    file: FORMS,
    attribute: "data-rm-mascot",
    summary: "A face that covers its eyes while you type your password.",
    notes:
      "The one everybody knows, and it earns its place: it makes the most " +
      "anxious field on any form say, in a way you feel rather than read, that " +
      "nobody is looking. It watches while you type your email, hides when the " +
      "password takes focus, and peeks when you press show — so the animation " +
      "is telling you the truth about the field's state rather than playing a " +
      "loop. Inline SVG, so it inherits the page's colour and needs no asset.",
    example: '<div data-rm-mascot><input type="email"><input type="password"></div>',
    usage: 'import { mascot } from "@soyrageagency/rage-motion";\nmascot();',
    options: [option("size", "number", "96", "How big the face is.")],
  },
  {
    name: "successButton",
    category: "form",
    file: FORMS,
    attribute: "data-rm-success",
    summary: "A submit button that collapses into a drawn tick.",
    notes:
      "The label goes, the button pulls into a circle, and the tick draws " +
      "itself with `stroke-dashoffset` — a real path being drawn rather than an " +
      "icon fading in, which is the difference between the moment landing and " +
      "it merely happening. It stays a real button: `aria-busy` while it works, " +
      "the result announced, and reversible, because a dead circle after a " +
      "failure is worse than no feedback. Call `rmSuccess()` or `rmFail()`.",
    example: "<button data-rm-success>Create account</button>",
    usage:
      'import { successButton } from "@soyrageagency/rage-motion";\n' +
      "successButton();\n" +
      "// then, when your request settles:\nbutton.rmSuccess();",
    options: [option("hold", "number", "1800", "How long the tick stays before it resets.")],
  },
  {
    name: "otp",
    category: "form",
    file: FORMS,
    attribute: "data-rm-otp",
    summary: "A one-time code, one box per digit.",
    notes:
      "Typing advances, Backspace on an empty box steps back, arrows move, and " +
      "pasting a whole code fills every box at once — which is what people " +
      "actually do with a code and what almost every version of this drops. The " +
      "first box carries `autocomplete=\"one-time-code\"`, so a phone offers the " +
      "code straight from the message.",
    example: '<div data-rm-otp data-rm-length="6"></div>',
    usage: 'import { otp } from "@soyrageagency/rage-motion";\notp();',
    options: [option("length", "number", "6", "Boxes, clamped to 10.")],
  },
  {
    name: "padlock",
    category: "form",
    file: FORMS,
    attribute: "data-rm-lock",
    summary: "A padlock that opens when the answer is right and slams when it is not.",
    notes:
      "The shackle lifts and swings about its hinge, the body kicks, and the " +
      "whole thing settles — or it slams and the field shakes. Two states, both " +
      "physical, because right and wrong are the two things this control has to " +
      "say and a colour change says neither loudly enough. The lock is " +
      "`aria-hidden` and the result is announced, so it is never the only way " +
      "to know. Call `wrapper.rmUnlock()` or `wrapper.rmDeny()`.",
    example: '<div data-rm-lock><input type="password"></div>',
    usage: 'import { padlock } from "@soyrageagency/rage-motion";\npadlock();\n// wrapper.rmUnlock();',
    options: [option("size", "number", "68", "How big the lock is.")],
  },

  // ── Cards ────────────────────────────────────────────────────────────────
  {
    name: "cardKit",
    category: "cards",
    file: CARDKIT,
    attribute: "data-rm-card-kit",
    summary: "Twenty-four named card looks, on one component.",
    notes:
      "The same bargain the button kit makes: one component with a named look, " +
      "so all twenty-four share the guarantees rather than each re-earning " +
      "them. None animates a width, a height, a padding or a margin, which is " +
      "what stops a grid of cards reflowing every time the pointer crosses one " +
      "— the commonest way a nice card hover ruins a page. Every look answers " +
      "to `:hover` and `:focus-within`.\n\n" +
      "Raise: lift, lift-glow, lift-shadow, float, press-in, settle. Edge: " +
      "edge-line, edge-grow, corner-fold, notch, frame, outline-draw. Light: " +
      "sheen, gradient-edge, glow-ring, spot, beam-top, vignette. Content: " +
      "zoom-media, pan-media, reveal-meta, slide-title, blur-out, split. " +
      "CARD_LOOKS exports the list.",
    example: '<article data-rm-card-kit="lift-glow">…</article>',
    usage: 'import { cardKit, CARD_LOOKS } from "@soyrageagency/rage-motion";\ncardKit();',
    options: [option("look", "one of CARD_LOOKS", '"lift"', "The fallback for an unknown name.")],
  },
  {
    name: "layers",
    category: "cards",
    file: CARDKIT,
    attribute: "data-rm-layers",
    summary: "A card whose layers move against each other.",
    notes:
      "Depth is a multiplier rather than a pixel value, so the effect is the " +
      "same on a small card and a large one — a fixed offset looks right on " +
      "exactly one size and wrong on every other.",
    example: '<article data-rm-layers><img data-rm-depth="0.2" src="…" alt=""><h3 data-rm-depth="0.6">Title</h3></article>',
    usage: 'import { layers } from "@soyrageagency/rage-motion";\nlayers();',
    options: [option("travel", "number", "18", "How far the deepest layer moves.")],
  },
  {
    name: "edgeLight",
    category: "cards",
    file: CARDKIT,
    attribute: "data-rm-edge",
    summary: "A border highlight that follows the pointer around the edge.",
    notes:
      "The angle from the card's centre to the pointer is written to a custom " +
      "property and a conic gradient points at it. One listener for the set, " +
      "one property write per card per frame, and the gradient composites — " +
      "which is why a grid of twenty costs about what one does.",
    example: "<article data-rm-edge>…</article>",
    usage: 'import { edgeLight } from "@soyrageagency/rage-motion";\nedgeLight();',
    options: [option("spread", "number", "60", "How wide the lit arc is, in degrees.")],
  },
  {
    name: "fan",
    category: "cards",
    file: CARDKIT,
    attribute: "data-rm-fan",
    summary: "A stack of cards that fans out.",
    notes:
      "The fan is computed from the number of cards and measured from the " +
      "middle, so three cards and seven cards both open evenly and both look " +
      "deliberate.",
    example: "<div data-rm-fan><article>…</article><article>…</article></div>",
    usage: 'import { fan } from "@soyrageagency/rage-motion";\nfan();',
    options: [option("angle", "number", "7", "Degrees between cards.")],
  },
  {
    name: "cardParallax",
    category: "cards",
    file: CARDKIT,
    attribute: "data-rm-card-parallax",
    summary: "A card whose media drifts as the page scrolls.",
    notes:
      "Bound to how far the card has crossed the viewport, so it runs backwards " +
      "on the way up, and it only computes for cards actually on screen.",
    example: '<article data-rm-card-parallax><img src="…" alt=""></article>',
    usage: 'import { cardParallax } from "@soyrageagency/rage-motion";\ncardParallax();',
    options: [option("travel", "number", "28", "How far the media drifts.")],
  },

  // ── Page set pieces ──────────────────────────────────────────────────────
  {
    name: "mosaic",
    category: "scroll",
    file: PAGEFX,
    attribute: "data-rm-mosaic",
    summary: "A grid of images that assembles as you arrive.",
    notes:
      "Each tile comes in from its own direction, worked out from where it sits " +
      "relative to the middle of the grid — measured, not counted, so it stays " +
      "right at every column count. That is what makes it read as a mosaic " +
      "coming together rather than a set of cards fading in.",
    example: '<div data-rm-mosaic><img src="…" alt=""><img src="…" alt=""></div>',
    usage: 'import { mosaic } from "@soyrageagency/rage-motion";\nmosaic();',
    options: [option("travel", "number", "60", "How far the outer tiles start from."), option("stagger", "number", "45", "Between tiles.")],
  },
  {
    name: "zoomOut",
    category: "scroll",
    file: PAGEFX,
    attribute: "data-rm-zoom-out",
    summary: "One image pulls back to reveal the grid it belongs to.",
    notes:
      "The move everybody copied from a keynote. It works because the scale is " +
      "tied to scroll position rather than a timer, so you can stop halfway and " +
      "it stays halfway.",
    example: "<section data-rm-zoom-out><figure data-rm-zoom-hero>…</figure><div data-rm-zoom-rest>…</div></section>",
    usage: 'import { zoomOut } from "@soyrageagency/rage-motion";\nzoomOut();',
    options: [option("from", "number", "2.1", "Starting scale of the hero.")],
  },
  {
    name: "lineByLine",
    category: "scroll",
    file: PAGEFX,
    attribute: "data-rm-lines-in",
    summary: "A paragraph that rises a line at a time.",
    notes:
      "Split by line, not by word, because prose read one word at a time is a " +
      "reading test. Lines are re-split when the width changes, since a line is " +
      "a layout fact rather than a property of the text — the version that " +
      "splits once is wrong at every other viewport.",
    example: "<p data-rm-lines-in>Long copy that arrives line by line…</p>",
    usage: 'import { lineByLine } from "@soyrageagency/rage-motion";\nlineByLine();',
    options: [option("stagger", "number", "90", "Between lines.")],
  },
  {
    name: "textMask",
    category: "scroll",
    file: PAGEFX,
    attribute: "data-rm-text-mask",
    summary: "A headline cut out of the picture behind it.",
    notes:
      "`background-clip: text` on the real heading, so it is still a heading: " +
      "selectable, searchable, read aloud and translated. The version made from " +
      "an SVG mask or a PNG is a picture of a headline, and everything that " +
      "makes text text is gone. The image drifts inside the letters as you " +
      "scroll, which stops it looking like a static texture.",
    example: '<h2 data-rm-text-mask data-rm-image="/hero.jpg">Award-grade</h2>',
    usage: 'import { textMask } from "@soyrageagency/rage-motion";\ntextMask();',
    options: [option("drift", "number", "18", "How far the picture moves inside the letters.")],
  },
  {
    name: "timeline",
    category: "scroll",
    file: PAGEFX,
    attribute: "data-rm-timeline",
    summary: "A spine that draws itself past each entry.",
    notes:
      "The line and the dots come from the same measurement, so a dot can never " +
      "light before the line reaches it — which is the bug in every timeline " +
      "built from two independent effects.",
    example: "<ol data-rm-timeline><li data-rm-timeline-item>…</li></ol>",
    usage: 'import { timeline } from "@soyrageagency/rage-motion";\ntimeline();',
    options: [option("line", "number", "0.6", "Where the reading line sits, 0-1.")],
  },
  {
    name: "splitScroll",
    category: "scroll",
    file: PAGEFX,
    attribute: "data-rm-split-scroll",
    summary: "Two columns travelling at different rates.",
    notes:
      "Both columns move with `transform`, so they never change height and the " +
      "page's scroll length is exactly what the content says it is — which the " +
      "version built with negative margins cannot promise.",
    example: "<section data-rm-split-scroll><div data-rm-split-a>…</div><div data-rm-split-b>…</div></section>",
    usage: 'import { splitScroll } from "@soyrageagency/rage-motion";\nsplitScroll();',
    options: [option("offset", "number", "90", "How far apart they travel.")],
  },
  {
    name: "revealGrid",
    category: "scroll",
    file: PAGEFX,
    attribute: "data-rm-reveal-grid",
    summary: "A grid that fills in a wave from one corner.",
    notes:
      "Each cell's delay comes from its measured distance to the corner, so the " +
      "wave stays diagonal whatever the column count and however the grid " +
      "rewraps.",
    example: '<div data-rm-reveal-grid data-rm-from="top-left">…</div>',
    usage: 'import { revealGrid } from "@soyrageagency/rage-motion";\nrevealGrid();',
    options: [option("from", "corner or center", '"top-left"', "Where the wave starts.")],
  },
  {
    name: "pinnedGallery",
    category: "scroll",
    file: PAGEFX,
    attribute: "data-rm-pinned",
    summary: "A pinned frame whose picture changes as you read.",
    notes:
      "Close cousin of `sticky`, different in one way that matters: the frames " +
      "cross-fade and scale together, so the change reads as a cut in a film " +
      "rather than an image swap. The pinning is still CSS.",
    example: "<section data-rm-pinned><img data-rm-pinned-frame src=\"…\" alt=\"\"><div data-rm-pinned-chapter>…</div></section>",
    usage: 'import { pinnedGallery } from "@soyrageagency/rage-motion";\npinnedGallery();',
    options: [option("line", "number", "0.5", "Where the reading line sits, 0-1.")],
  },

  // ── More carousels ───────────────────────────────────────────────────────
  {
    name: "coverflow",
    category: "gallery",
    file: CAROUSELS,
    attribute: "data-rm-coverflow",
    summary: "A deck seen at an angle, the front one square on.",
    notes:
      "Built on a real scroller, so the wheel, the trackpad and the scrollbar " +
      "all work. The 3D is computed from each slide's distance to the centre of " +
      "the viewport rather than from an index, which is why it stays smooth " +
      "mid-flick instead of snapping between whole slides.",
    example: "<div data-rm-coverflow><figure>…</figure><figure>…</figure></div>",
    usage: 'import { coverflow } from "@soyrageagency/rage-motion";\ncoverflow();',
    options: [option("angle", "number", "42", "Degrees at the edges."), option("depth", "number", "160", "How far back the outer slides sit.")],
  },
  {
    name: "thumbs",
    category: "gallery",
    file: CAROUSELS,
    attribute: "data-rm-thumbs",
    summary: "A main frame and a strip, each driving the other.",
    notes:
      "Both directions, which is the part usually missing: picking a thumbnail " +
      "moves the frame, and scrolling the frame moves the highlight and scrolls " +
      "it into view. Whichever slide is nearest the middle wins, so a " +
      "half-scrolled frame still has a highlight rather than none.",
    example:
      "<div data-rm-thumbs>\n" +
      "  <div data-rm-thumbs-main>…</div>\n" +
      "  <div data-rm-thumbs-strip><button>…</button></div>\n" +
      "</div>",
    usage: 'import { thumbs } from "@soyrageagency/rage-motion";\nthumbs();',
    options: [],
  },
  {
    name: "autoplay",
    category: "gallery",
    file: CAROUSELS,
    attribute: "data-rm-autoplay",
    summary: "A carousel that advances itself, and stops the moment you touch it.",
    notes:
      "It pauses on hover, on focus anywhere inside, and when the tab is hidden " +
      "— and it ships a real pause button, because an auto-advancing carousel " +
      "with no way to stop it fails the one accessibility requirement everybody " +
      "knows about and nobody implements. The ring shows how long is left, so " +
      "the movement is never a surprise.",
    example: "<div data-rm-autoplay data-rm-interval=\"5000\">…</div>",
    usage: 'import { autoplay } from "@soyrageagency/rage-motion";\nautoplay();',
    options: [option("interval", "number", "4200", "Between advances.")],
  },
  {
    name: "wheel",
    category: "gallery",
    file: CAROUSELS,
    attribute: "data-rm-wheel",
    summary: "Items around a wheel that turns under the pointer.",
    notes:
      "The radial menu: the whole wheel rotates toward whichever item you point " +
      "at, so the one you want travels to you rather than you chasing it round " +
      "the rim. Arrow keys step one notch, which is the part a radial menu " +
      "almost always forgets.",
    example: '<div data-rm-wheel data-rm-radius="150"><a href="#">…</a></div>',
    usage: 'import { wheel } from "@soyrageagency/rage-motion";\nwheel();',
    options: [option("radius", "number", "130", "How far out the items sit.")],
  },
  {
    name: "peek",
    category: "gallery",
    file: CAROUSELS,
    attribute: "data-rm-peek",
    summary: "The next slide showing at the edge, so you know it is there.",
    notes:
      "Scroll padding rather than a transform: the slides genuinely sit in a " +
      "narrower scroll port, so snapping, the scrollbar and keyboard scrolling " +
      "all agree with what you can see. The usual version fakes the peek with a " +
      "negative margin and then fights its own snap points.",
    example: '<div data-rm-peek data-rm-peek="80">…</div>',
    usage: 'import { peek } from "@soyrageagency/rage-motion";\npeek();',
    options: [option("amount", "number", "64", "How much of the neighbours shows.")],
  },
  {
    name: "ticker",
    category: "gallery",
    file: CAROUSELS,
    attribute: "data-rm-ticker",
    summary: "Rows travelling in opposite directions.",
    notes:
      "Each band moves the other way from the one above, which is what turns a " +
      "single sliding strip into something that reads as texture. Every row is " +
      "duplicated until it is twice the viewport and wrapped by exactly one " +
      "copy, so no row can show a seam.",
    example: "<div data-rm-ticker><div data-rm-ticker-row>…</div><div data-rm-ticker-row>…</div></div>",
    usage: 'import { ticker } from "@soyrageagency/rage-motion";\nticker();',
    options: [option("speed", "number", "40", "Pixels per second."), option("gap", "number", "28", "Between items.")],
  },
  {
    name: "slideshow",
    category: "gallery",
    file: CAROUSELS,
    attribute: "data-rm-slideshow",
    summary: "One frame at a time, with real controls.",
    notes:
      "The plain slideshow done properly: previous and next are buttons, the " +
      "dots are a tablist, the current frame is the only one not `hidden`, and " +
      "the change is announced. Every one of those is missing from the version " +
      "built out of divs and a `setInterval`.",
    example: "<div data-rm-slideshow><div data-rm-slide>…</div><div data-rm-slide>…</div></div>",
    usage: 'import { slideshow } from "@soyrageagency/rage-motion";\nslideshow();',
    options: [option("duration", "number", "520", "The cross-fade.")],
  },

  // ── Phone shapes ─────────────────────────────────────────────────────────
  {
    name: "island",
    category: "chrome",
    file: UI,
    attribute: "data-rm-island",
    summary: "A pill that swells to hold whatever is happening.",
    notes:
      "The trick everybody remembers is the shape change; the trick that makes " +
      "it work is that the size is never hardcoded. The pill is measured " +
      "against its own content each time, so a two-word status and a full row " +
      "of controls both get a shape that fits — a fixed set of keyframes gives " +
      "you one message that looks right. It is a live region, so the status is " +
      "announced as well as shown.",
    example: "<div data-rm-island><span data-rm-island-content>Ready</span></div>",
    usage: 'import { island } from "@soyrageagency/rage-motion";\nisland();\n// pill.rmShow("<b>Uploading</b> 40%");',
    options: [option("hold", "number", "3200", "How long a message stays before it closes.")],
  },
  {
    name: "sheet",
    category: "chrome",
    file: UI,
    attribute: "data-rm-sheet",
    summary: "A panel you drag up from the bottom and flick away.",
    notes:
      "It follows the finger while you hold it, and on release decides from the " +
      "distance AND the speed of the throw — a short fast flick dismisses, a " +
      "slow drag that stopped halfway springs back. Distance alone is the " +
      "version that refuses to close when you clearly meant it to. It is a real " +
      "dialog: focus in and trapped, Escape closes, focus returns, page inert.",
    example: '<button data-rm-sheet-open aria-controls="s">Open</button>\n<div id="s" data-rm-sheet hidden>…</div>',
    usage: 'import { sheet } from "@soyrageagency/rage-motion";\nsheet();',
    options: [option("dismissAt", "number", "0.4", "Share of its height before a drag dismisses."), option("flick", "number", "0.6", "Pixels per millisecond that count as a flick.")],
  },
  {
    name: "segmented",
    category: "chrome",
    file: UI,
    attribute: "data-rm-segmented",
    summary: "A segmented control with an indicator that travels.",
    notes:
      "Real radio inputs underneath, so it is one stop in the tab order, the " +
      "arrow keys move between options for free, and it submits with the form. " +
      "The version built from buttons has to reimplement all three and usually " +
      "reimplements none.",
    example: '<div data-rm-segmented><label><input type="radio" name="v" checked> Grid</label></div>',
    usage: 'import { segmented } from "@soyrageagency/rage-motion";\nsegmented();',
    options: [option("duration", "number", "380", "The travel.")],
  },
  {
    name: "frosted",
    category: "chrome",
    file: UI,
    attribute: "data-rm-frosted",
    summary: "A bar that frosts only once there is something behind it.",
    notes:
      "At the top of the page it is transparent; the moment content has " +
      "scrolled under it, the blur arrives. Frosting a bar with nothing behind " +
      "it is the commonest way this looks cheap — a grey stripe over a plain " +
      "background for no reason. A sentinel above the bar decides, so there is " +
      "no scroll handler.",
    example: "<header data-rm-frosted>…</header>",
    usage: 'import { frosted } from "@soyrageagency/rage-motion";\nfrosted();',
    options: [option("after", "number", "12", "Pixels of scroll before it frosts.")],
  },
  {
    name: "springModal",
    category: "chrome",
    file: UI,
    attribute: "data-rm-modal",
    summary: "A dialog that arrives on a spring and leaves the way it came.",
    notes:
      "Built on the real `<dialog>`, so the browser supplies the top layer, the " +
      "backdrop, the focus trap, Escape and the return of focus — all four of " +
      "which a hand-rolled modal has to write and most write wrong. This adds " +
      "the movement and nothing else.",
    example: '<dialog id="m" data-rm-modal>…</dialog>',
    usage: 'import { springModal } from "@soyrageagency/rage-motion";\nspringModal();',
    options: [option("duration", "number", "480", "The arrival.")],
  },
  {
    name: "actionSheet",
    category: "chrome",
    file: UI,
    attribute: "data-rm-actions",
    summary: "A stack of choices from the bottom edge.",
    notes:
      "Arrow keys move between the options and Escape cancels, so it is a menu " +
      "rather than a list of buttons that happens to sit at the bottom of the " +
      "screen. Each choice arrives a beat after the one above it.",
    example: '<div id="a" data-rm-actions hidden><button>Share</button><button>Delete</button></div>',
    usage: 'import { actionSheet } from "@soyrageagency/rage-motion";\nactionSheet();',
    options: [option("duration", "number", "380", "The rise.")],
  },
  {
    name: "toast",
    category: "chrome",
    file: UI,
    attribute: null,
    summary: "A notice that stacks, waits, and can be dismissed.",
    notes:
      "Returns a `push()` rather than reading the DOM, because a toast is " +
      "something your code decides to say. Hovering the stack pauses every " +
      "timer in it — otherwise the one you are reading disappears while you " +
      "read it. The region is `aria-live`, so a toast is heard as well as seen.",
    example: "<!-- no markup: call push() from your own code -->",
    usage:
      'import { toast } from "@soyrageagency/rage-motion";\n' +
      "const push = toast();\n" +
      'push("Saved", { kind: "good" });',
    options: [option("life", "number", "4200", "How long each notice waits."), option("max", "number", "4", "How many stack before the oldest goes.")],
  },
  {
    name: "contextMenu",
    category: "chrome",
    file: UI,
    attribute: "data-rm-context",
    summary: "A menu on right-click that still opens with a keyboard.",
    notes:
      "The version everybody builds forgets that a context menu has a keyboard " +
      "opening — the Menu key and Shift-F10 — and that holding Shift should " +
      "give the browser's own menu back. Both are here, with arrow keys, Escape " +
      "and a menu that flips rather than opening past the edge of the window.",
    example: '<div data-rm-context aria-controls="m">…</div>\n<div id="m" data-rm-context-menu hidden>…</div>',
    usage: 'import { contextMenu } from "@soyrageagency/rage-motion";\ncontextMenu();',
    options: [],
  },

  // ── Feedback ─────────────────────────────────────────────────────────────
  {
    name: "skeleton",
    category: "feedback",
    file: FEEDBACK,
    attribute: "data-rm-skeleton",
    summary: "A placeholder that has the shape of what is coming.",
    notes:
      "The region carries `aria-busy`, so the wait is announced rather than " +
      "being a silent grey rectangle. A skeleton that is the wrong height is a " +
      "layout shift you built on purpose, so the last line is short the way a " +
      "real paragraph ends. Call `holder.rmReady()` when the content lands.",
    example: '<div data-rm-skeleton data-rm-rows="3">…</div>',
    usage: 'import { skeleton } from "@soyrageagency/rage-motion";\nskeleton();',
    options: [option("lines", "number", "3", "Clamped to 12.")],
  },
  {
    name: "spinner",
    category: "feedback",
    file: FEEDBACK,
    attribute: "data-rm-spinner",
    summary: "Six spinners, one component.",
    notes:
      "All six are CSS, so they cost nothing per frame, and all six are " +
      "`role=\"status\"` with a label — a spinner is the only thing on screen " +
      "when it appears, and if it says nothing then nothing is being said. " +
      "Under reduced motion they stop turning and stay visible, because the " +
      "message is \"still working\", not \"here is a wheel\". Kinds: ring, arc, " +
      "dual, bars, orbit, pulse. SPINNER_KINDS exports the list.",
    example: '<span data-rm-spinner="arc"></span>',
    usage: 'import { spinner, SPINNER_KINDS } from "@soyrageagency/rage-motion";\nspinner();',
    options: [option("kind", "one of SPINNER_KINDS", '"ring"', "The shape."), option("size", "number", "24", "Pixels.")],
  },
  {
    name: "progressBar",
    category: "feedback",
    file: FEEDBACK,
    attribute: "data-rm-progress-bar",
    summary: "A determinate bar that is announced.",
    notes:
      "A real `role=\"progressbar\"` with `aria-valuenow`, so the number reaches " +
      "anything that reads the page — the version made of two divs tells a " +
      "screen reader nothing however smoothly it animates. Call `bar.rmSet(72)`.",
    example: '<div data-rm-progress-bar data-rm-value="40"></div>',
    usage: 'import { progressBar } from "@soyrageagency/rage-motion";\nprogressBar();',
    options: [option("value", "number", "0", "Starting percentage.")],
  },
  {
    name: "dotsLoader",
    category: "feedback",
    file: FEEDBACK,
    attribute: "data-rm-dots-loader",
    summary: "Three dots, for when a spinner is too much.",
    notes:
      "For something small — a message sending, a field checking itself. Each " +
      "dot is on the same animation at a different delay, which is one rule " +
      "rather than three.",
    example: "<span data-rm-dots-loader></span>",
    usage: 'import { dotsLoader } from "@soyrageagency/rage-motion";\ndotsLoader();',
    options: [option("count", "number", "3", "How many dots.")],
  },
  {
    name: "pulseDot",
    category: "feedback",
    file: FEEDBACK,
    attribute: "data-rm-status",
    summary: "A status light that says what it means.",
    notes:
      "The colour is decoration; the text beside it is the message. A dot on " +
      "its own is a colour, and a meaningful colour means nothing to anyone who " +
      "cannot distinguish it. Only the genuinely live states pulse. States: " +
      "live, busy, down, idle.",
    example: '<span data-rm-status="live">All systems go</span>',
    usage: 'import { pulseDot } from "@soyrageagency/rage-motion";\npulseDot();',
    options: [option("state", "live | busy | down | idle", '"live"', "The default state.")],
  },
  {
    name: "badgeCount",
    category: "feedback",
    file: FEEDBACK,
    attribute: "data-rm-badge",
    summary: "A count that flips when it changes.",
    notes:
      "The old number leaves upward and the new one arrives from below, so 2 to " +
      "3 reads as a change rather than a redraw. A live region, so the new " +
      "count is announced. Call `badge.rmSet(4)`.",
    example: "<span data-rm-badge>3</span>",
    usage: 'import { badgeCount } from "@soyrageagency/rage-motion";\nbadgeCount();',
    options: [option("duration", "number", "320", "The flip.")],
  },
  {
    name: "emptyState",
    category: "feedback",
    file: FEEDBACK,
    attribute: "data-rm-empty",
    summary: "The screen with nothing on it, arriving gracefully.",
    notes:
      "An empty state is the moment a product either explains itself or looks " +
      "broken, so this arrives in sequence rather than appearing, and it " +
      "insists on being a region — an illustration and a shrug is not an empty " +
      "state.",
    example: "<div data-rm-empty><h3>Nothing here yet</h3><p>…</p><a href=\"#\">Add one</a></div>",
    usage: 'import { emptyState } from "@soyrageagency/rage-motion";\nemptyState();',
    options: [option("duration", "number", "620", "Per part.")],
  },

  // ── Data ─────────────────────────────────────────────────────────────────
  {
    name: "sparkline",
    category: "data",
    file: DATA,
    attribute: "data-rm-sparkline",
    summary: "A trend line that draws itself.",
    notes:
      "The numbers come out of the markup, so the page still says what it says " +
      "with JavaScript off and there is no second copy of the data to drift. " +
      "The line is revealed with `stroke-dashoffset` at a constant weight — " +
      "scaling a finished path squashes the stroke for the whole animation and " +
      "only looks right on the last frame.",
    example: '<div data-rm-sparkline data-rm-values="4,9,6,12,10,17"></div>',
    usage: 'import { sparkline } from "@soyrageagency/rage-motion";\nsparkline();',
    options: [option("fill", "boolean", "true", "Shade under the line."), option("duration", "number", "1100", "The draw.")],
  },
  {
    name: "bars",
    category: "data",
    file: DATA,
    attribute: "data-rm-bars",
    summary: "A bar chart that grows from the axis.",
    notes:
      "Each bar is scaled from its own base rather than having its height " +
      "animated, so the chart never reflows while it grows and the labels stay " +
      "exactly where they were.",
    example: '<ul data-rm-bars><li data-rm-value="42">Mon</li></ul>',
    usage: 'import { bars } from "@soyrageagency/rage-motion";\nbars();',
    options: [option("stagger", "number", "70", "Between bars.")],
  },
  {
    name: "donut",
    category: "data",
    file: DATA,
    attribute: "data-rm-donut",
    summary: "A ring that fills to its share.",
    notes:
      "`stroke-dasharray` on a real circle, so the arc has a rounded cap and an " +
      "exact length; the usual two-half-discs trick can do neither. The number " +
      "stays in the markup at the centre, so the figure reads whether or not " +
      "the ring ever draws.",
    example: '<div data-rm-donut data-rm-value="68"><strong>68%</strong></div>',
    usage: 'import { donut } from "@soyrageagency/rage-motion";\ndonut();',
    options: [option("size", "number", "96", "Diameter."), option("width", "number", "8", "Ring weight.")],
  },
  {
    name: "gauge",
    category: "data",
    file: DATA,
    attribute: "data-rm-gauge",
    summary: "A dial with a needle that swings and settles.",
    notes:
      "It goes a little past the mark and comes back, because an instrument " +
      "needle has mass — one that glides linearly to its value reads as a " +
      "progress bar bent into an arc.",
    example: '<div data-rm-gauge data-rm-value="72"><strong>72</strong></div>',
    usage: 'import { gauge } from "@soyrageagency/rage-motion";\ngauge();',
    options: [option("sweep", "number", "240", "Degrees of dial."), option("size", "number", "120", "Diameter.")],
  },
  {
    name: "stat",
    category: "data",
    file: DATA,
    attribute: "data-rm-stat",
    summary: "A figure with its own delta and trend.",
    notes:
      "The arrow and the colour both come from the sign of the change written " +
      "in the markup, so the card cannot end up green with a downward arrow — " +
      "which is what happens when the two are set independently.",
    example: '<div data-rm-stat data-rm-delta="-4.2"><strong>1,204</strong><span>Visitors</span></div>',
    usage: 'import { stat } from "@soyrageagency/rage-motion";\nstat();',
    options: [],
  },
  {
    name: "stars",
    category: "data",
    file: DATA,
    attribute: "data-rm-rating",
    summary: "A rating that is also a real radio group.",
    notes:
      "Radios underneath, so it is one stop in the tab order, the arrows move " +
      "between values, it submits with the form, and a screen reader announces " +
      "\"3 of 5\" rather than reading five identical stars. The hover preview is " +
      "CSS on top of that, not instead of it.",
    example: "<fieldset data-rm-rating><legend>Rating</legend></fieldset>",
    usage: 'import { stars } from "@soyrageagency/rage-motion";\nstars();',
    options: [option("count", "number", "5", "Clamped to 10.")],
  },

  // ── Pages ────────────────────────────────────────────────────────────────
  {
    name: "pageTransition",
    category: "transition",
    file: TRANSITIONS,
    attribute: null,
    summary: "Cross-fade between pages with the View Transitions API.",
    notes:
      "It never traps navigation: modified clicks, external links, downloads " +
      "and targets all fall through to the browser, and where the API is " +
      "missing it simply navigates. A transition that swallows a cmd-click is " +
      "worse than no transition.",
    example: "<!-- no markup: call it once per page -->",
    usage: 'import { pageTransition } from "@soyrageagency/rage-motion";\npageTransition({ duration: 520 });',
    options: [option("duration", "number", "520", "The cross-fade.")],
  },
];

/** Find a component by name, ignoring case and punctuation. */
export function findComponent(name) {
  const key = String(name ?? "").toLowerCase().replace(/[^a-z]/g, "");
  if (!key) return null;
  return CATALOGUE.find((c) => c.name.toLowerCase().replace(/[^a-z]/g, "") === key) ?? null;
}
