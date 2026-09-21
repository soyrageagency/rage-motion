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
const MENUS = "src/components/menus.js";
const INPUTS = "src/components/inputs.js";
const CURSORS2 = "src/components/cursors.js";
const GALLERIES = "src/components/galleries.js";
const MOD_EDITOR = "src/components/editor.js";
const MOD_SCHEDULE = "src/components/schedule.js";
const MOD_CONSOLE = "src/components/console.js";
const MOD_PLAYER = "src/components/player.js";
const MOD_STOREFRONT = "src/components/storefront.js";
const MOD_ACCOUNT = "src/components/account.js";
const MOD_NOTIFY = "src/components/notify.js";
const MOD_TASKS = "src/components/tasks.js";
const MOD_METRICS = "src/components/metrics.js";
const MOD_FORMS2 = "src/components/forms2.js";
const MOD_PROFILE = "src/components/profile.js";
const MOD_SCROLL2 = "src/components/scroll2.js";
const MOD_SHOP = "src/components/shop.js";
const MOD_CART = "src/components/cart.js";
const MOD_EXTRAS = "src/components/extras.js";
const TEXTURE = "src/components/texture.js";

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
    example: '<img data-rm-parallax="0.25" src="/plate-01.jpg" alt="Plate one">',
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
    example: '<div data-rm-flatten><img src="/plate-01.jpg" alt="Plate one"></div>',
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
      '  <div data-rm-sticky-media><img data-rm-sticky-frame src="/plate-01.jpg" alt="Plate one"></div>\n' +
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
    example: '<figure data-rm-image-reveal="left"><img src="/plate-01.jpg" alt="Plate one"></figure>',
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
    example: '<div data-rm-ring data-rm-radius="380"><img src="/plate-01.jpg" alt="Plate one"></div>',
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
    example: "<div data-rm-scratch><img src=\"/plate-01.jpg\" alt=\"Plate one\"></div>",
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
    example: '<div data-rm-compare><img data-rm-before src="/plate-01.jpg" alt="Plate one"><img data-rm-after src="/plate-01.jpg" alt="Plate one"></div>',
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
    example: '<article data-rm-layers><img data-rm-depth="0.2" src="/plate-01.jpg" alt="Plate one"><h3 data-rm-depth="0.6">Title</h3></article>',
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
    example: '<article data-rm-card-parallax><img src="/plate-01.jpg" alt="Plate one"></article>',
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
    example: '<div data-rm-mosaic><img src="/plate-01.jpg" alt="Plate one"><img src="/plate-01.jpg" alt="Plate one"></div>',
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
    example: "<section data-rm-pinned><img data-rm-pinned-frame src=\"/plate-01.jpg\" alt=\"Plate one\"><div data-rm-pinned-chapter>…</div></section>",
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
    options: [option("out-of", "number", "5", "Clamped to 10.")],
  },

  // ── Notifications ──
  {
    name: "toastStack",
    category: "notify",
    file: MOD_NOTIFY,
    attribute: "data-rm-toast-stack",
    summary: "Notifications — twenty ways to tell someone something.",
    notes:
      "• toastStack() — toasts that stack, collapse and expand. • snackbar() — one message at a time, with an action. • banner() — a page-wide notice that pushes nothing. • inlineAlert() — a message that belongs to the thing it is about. • pushCard() — an arriving notification, phone style. • bell() — a bell that rings when the count changes. • counter() — an unread count that rolls. • presenceDot() — someone is here, and it says so. • ribbonAlert() — a corner ribbon for a status. • statusBar() — a strip that changes colour and says why. • progressToast() — a toast that is also a progress bar. • undoBar() — the one notification that has a job to do.",
    example: "<div data-rm-toast-stack></div>",
    usage: "import { toastStack } from \"@soyrageagency/rage-motion\";\ntoastStack();",
    options: [

    ],
  },
  {
    name: "snackbar",
    category: "notify",
    file: MOD_NOTIFY,
    attribute: "data-rm-snackbar",
    summary: "One message at a time, with an action.",
    notes:
      "The snackbar is the discipline the toast pile lacks: one message, replaced rather than queued, so a burst of events cannot bury the screen. The action is a real button inside the live region, so it is both announced and reachable by keyboard the moment it appears.",
    example: "<div data-rm-snackbar></div>",
    usage: "import { snackbar } from \"@soyrageagency/rage-motion\";\nsnackbar();",
    options: [

    ],
  },
  {
    name: "banner",
    category: "notify",
    file: MOD_NOTIFY,
    attribute: "data-rm-banner",
    summary: "A page-wide notice that pushes nothing.",
    notes:
      "It slides down over the page rather than inserting itself above it, so nothing below moves and nobody loses their place mid-sentence. Dismissing it is a real button, and the notice is `role=\"region\"` with a label rather than an anonymous strip of colour.",
    example: "<div data-rm-banner>Scheduled maintenance at 22:00.</div>",
    usage: "import { banner } from \"@soyrageagency/rage-motion\";\nbanner();",
    options: [

    ],
  },
  {
    name: "inlineAlert",
    category: "notify",
    file: MOD_NOTIFY,
    attribute: "data-rm-inline-alert",
    summary: "A message that belongs to the thing it is about.",
    notes:
      "Wired to a field with `aria-describedby`, so a screen reader reads the message as part of the field rather than as a stray sentence somewhere on the page. That one attribute is the difference between an error message and an error message somebody can actually act on.",
    example: "<p data-rm-inline-alert=\"email-field\" data-rm-tone=\"error\">…</p>",
    usage: "import { inlineAlert } from \"@soyrageagency/rage-motion\";\ninlineAlert();",
    options: [

    ],
  },
  {
    name: "pushCard",
    category: "notify",
    file: MOD_NOTIFY,
    attribute: "data-rm-push-card",
    summary: "An arriving notification, phone style.",
    notes:
      "Drops in with a spring, and can be dismissed by dragging it up or with a button. The drag is the flourish; the button is how it actually works for most people, which is the right way round.",
    example: "<div data-rm-push-card>…</div>",
    usage: "import { pushCard } from \"@soyrageagency/rage-motion\";\npushCard();",
    options: [

    ],
  },
  {
    name: "bell",
    category: "notify",
    file: MOD_NOTIFY,
    attribute: "data-rm-bell",
    summary: "A bell that rings when the count changes.",
    notes:
      "The swing is a transform on the bell alone, so the count beside it stays perfectly still and legible while it happens — a bell that shakes its own label is a bell you cannot read at the moment you most want to.",
    example: "<button data-rm-bell data-rm-count=\"3\">…</button>",
    usage: "import { bell } from \"@soyrageagency/rage-motion\";\nbell();",
    options: [

    ],
  },
  {
    name: "counter",
    category: "notify",
    file: MOD_NOTIFY,
    attribute: "data-rm-counter",
    summary: "An unread count that rolls.",
    notes:
      "The old number leaves and the new one arrives from the direction the count moved — up for more, down for fewer — so the change reads as a change rather than a redraw. The value is in a polite live region, announced once.",
    example: "<span data-rm-counter>3</span>",
    usage: "import { counter } from \"@soyrageagency/rage-motion\";\ncounter();",
    options: [

    ],
  },
  {
    name: "presenceDot",
    category: "notify",
    file: MOD_NOTIFY,
    attribute: "data-rm-presence",
    summary: "Someone is here, and it says so.",
    notes:
      "The dot is decoration; the text beside it is the message. A status carried only by a colour is a status invisible to anyone who cannot distinguish that colour from the one next to it, so this always renders a word.",
    example: "<span data-rm-presence=\"online\">Ana</span>",
    usage: "import { presenceDot } from \"@soyrageagency/rage-motion\";\npresenceDot();",
    options: [

    ],
  },
  {
    name: "ribbonAlert",
    category: "notify",
    file: MOD_NOTIFY,
    attribute: "data-rm-ribbon-alert",
    summary: "A corner ribbon for a status.",
    notes:
      "Rotated with a transform on its own layer, so the box it decorates is unchanged and nothing around it moves. The word is real text, not an image, so it is readable, selectable and translatable.",
    example: "<article data-rm-ribbon-alert=\"New\">…</article>",
    usage: "import { ribbonAlert } from \"@soyrageagency/rage-motion\";\nribbonAlert();",
    options: [

    ],
  },
  {
    name: "statusBar",
    category: "notify",
    file: MOD_NOTIFY,
    attribute: "data-rm-status-bar",
    summary: "A strip that changes colour and says why.",
    notes:
      "`aria-live` set from the tone: something going wrong is assertive, anything else is polite. Getting that the wrong way round means either an interruption for nothing, or silence when it matters.",
    example: "<div data-rm-status-bar=\"ok\">All systems normal</div>",
    usage: "import { statusBar } from \"@soyrageagency/rage-motion\";\nstatusBar();",
    options: [

    ],
  },
  {
    name: "progressToast",
    category: "notify",
    file: MOD_NOTIFY,
    attribute: "data-rm-progress-toast",
    summary: "A toast that is also a progress bar.",
    notes:
      "The bar is a real `role=\"progressbar\"` with `aria-valuenow`, so the number is available rather than merely drawn, and the message says what is being waited for. \"Loading…\" with a bar is a shrug; \"Uploading 3 of 8\" is a status.",
    example: "<div data-rm-progress-toast>Uploading</div>",
    usage: "import { progressToast } from \"@soyrageagency/rage-motion\";\nprogressToast();",
    options: [

    ],
  },
  {
    name: "undoBar",
    category: "notify",
    file: MOD_NOTIFY,
    attribute: "data-rm-undo-bar",
    summary: "The one notification that has a job to do.",
    notes:
      "An undo bar is the only kind of toast worth interrupting for, so this one is built around its button: the button is the first thing in the tab order inside it, the countdown is visible, and the bar does not disappear while the pointer or the keyboard is on it — losing an undo because you were reading it is the worst possible outcome.",
    example: "<div data-rm-undo-bar>Message deleted</div>",
    usage: "import { undoBar } from \"@soyrageagency/rage-motion\";\nundoBar();",
    options: [

    ],
  },
  {
    name: "confirmSheet",
    category: "notify",
    file: MOD_NOTIFY,
    attribute: "data-rm-confirm-sheet",
    summary: "A decision, asked properly.",
    notes:
      "A real `role=\"alertdialog\"`: focus goes to the safer of the two answers, Escape cancels, the rest of the page is inert, and focus returns to whatever asked. The destructive button is never the one focused by default, because the muscle memory of pressing Enter should not be able to delete anything.",
    example: "<div data-rm-confirm-sheet hidden>…</div>",
    usage: "import { confirmSheet } from \"@soyrageagency/rage-motion\";\nconfirmSheet();",
    options: [

    ],
  },
  {
    name: "countdownNote",
    category: "notify",
    file: MOD_NOTIFY,
    attribute: "data-rm-countdown-note",
    summary: "A notice that expires, visibly.",
    notes:
      "The remaining time is drawn as a ring and stated as text, because a ring alone is a countdown nobody can read out. It pauses when reached, for the same reason the undo bar does.",
    example: "<div data-rm-countdown-note data-rm-seconds=\"20\">Session ends in</div>",
    usage: "import { countdownNote } from \"@soyrageagency/rage-motion\";\ncountdownNote();",
    options: [

    ],
  },
  {
    name: "stackedAvatars",
    category: "notify",
    file: MOD_NOTIFY,
    attribute: "data-rm-stacked-avatars",
    summary: "Who is in this, and how many more.",
    notes:
      "The overflow count is real text inside the list, so \"and four others\" is something a screen reader says rather than a circle it skips. The avatars fan apart when reached, which is a transform on each rather than a change in the row's width.",
    example: "<ul data-rm-stacked-avatars><li><img src=\"/faces/ana.jpg\" alt=\"Ana Ruiz\"></li></ul>",
    usage: "import { stackedAvatars } from \"@soyrageagency/rage-motion\";\nstackedAvatars();",
    options: [

    ],
  },
  {
    name: "typingDots",
    category: "notify",
    file: MOD_NOTIFY,
    attribute: "data-rm-typing",
    summary: "Someone is writing, said in a sentence rather than in dots.",
    notes:
      "Three dots on one animation at three delays, and a real sentence in a live region beside them — \"Ana is typing\" is the message; the dots are the decoration. Under reduced motion the dots stop and the sentence stays.",
    example: "<p data-rm-typing>Ana is typing</p>",
    usage: "import { typingDots } from \"@soyrageagency/rage-motion\";\ntypingDots();",
    options: [

    ],
  },
  {
    name: "liveTicker",
    category: "notify",
    file: MOD_NOTIFY,
    attribute: "data-rm-live-ticker",
    summary: "Events arriving in order.",
    notes:
      "New entries are prepended and the ones below shift down with a FLIP, so the list never jumps and the eye keeps its place. It is an ordered list with a polite live region, so the arrival is announced once, in order.",
    example: "<ol data-rm-live-ticker></ol>",
    usage: "import { liveTicker } from \"@soyrageagency/rage-motion\";\nliveTicker();",
    options: [

    ],
  },
  {
    name: "pillAlert",
    category: "notify",
    file: MOD_NOTIFY,
    attribute: "data-rm-pill-alert",
    summary: "A small, quiet, dismissible thing.",
    notes:
      "The least a notification can be and still be one: a word, a colour and a real close button. It shrinks away from its own centre rather than collapsing its height, so the row it sits in does not twitch.",
    example: "<span data-rm-pill-alert=\"new\">Beta</span>",
    usage: "import { pillAlert } from \"@soyrageagency/rage-motion\";\npillAlert();",
    options: [

    ],
  },
  {
    name: "cornerToast",
    category: "notify",
    file: MOD_NOTIFY,
    attribute: "data-rm-corner-toast",
    summary: "A toast in a corner you choose.",
    notes:
      "The corner decides which way it arrives from, so a toast in the bottom right slides up from the bottom right rather than in from an arbitrary direction — motion that agrees with position is motion nobody has to think about.",
    example: "<div data-rm-corner-toast=\"bottom-right\"></div>",
    usage: "import { cornerToast } from \"@soyrageagency/rage-motion\";\ncornerToast();",
    options: [

    ],
  },
  {
    name: "soundBadge",
    category: "notify",
    file: MOD_NOTIFY,
    attribute: "data-rm-sound-badge",
    summary: "A badge that pulses when it changes.",
    notes:
      "One ring expanding out of the badge, so the badge itself never moves and whatever it is attached to never shifts. The pulse is the only announcement that is purely visual here — the count itself is in a live region.",
    example: "<span data-rm-sound-badge>2</span>",
    usage: "import { soundBadge } from \"@soyrageagency/rage-motion\";\nsoundBadge();",
    options: [

    ],
  },

  // ── Task lists and boards ──
  {
    name: "taskList",
    category: "tasks",
    file: MOD_TASKS,
    attribute: "data-rm-task-list",
    summary: "Checkable task rows that strike through and settle when they are completed.",
    notes:
      "The strike is a rule scaled across the label from its left edge, because `text-decoration: line-through` cannot be animated at all — the usual version snaps a line across the text and calls it a transition. Scaling a pseudo-element also leaves the row's box untouched, so ticking the first of forty tasks does not nudge the other thirty-nine down the page. Each box is a real `<button type=\"button\" role=\"checkbox\">` whose accessible name is the task itself, so it is never read out as the fourteenth anonymous checkbox in a list. The change is announced with the task's name, and the completed state is written to `data-rm-done` as well as `aria-checked`, which is what lets taskProgress, taskCount and taskEmpty read the same list without being told anything.",
    example: "<ul data-rm-task-list data-rm-label=\"Today\">\n  <li>Buy milk</li>\n  <li data-rm-done=\"true\">Book the van</li>\n</ul>",
    usage: "import { taskList } from \"@soyrageagency/rage-motion\";\ntaskList();",
    options: [
      option("item", "string", "\"li\"", "Selector for the rows inside the list."),
      option("duration", "number", "380", "Milliseconds for the strike and the settle."),
      option("label", "string", "\"Tasks\"", "Accessible name for the list."),
    ],
  },
  {
    name: "taskCheck",
    category: "tasks",
    file: MOD_TASKS,
    attribute: "data-rm-task-check",
    summary: "A tick that draws itself along its own stroke.",
    notes:
      "The path carries `pathLength=\"1\"`, which normalises the geometry so a dash offset of 1 means undrawn whatever the real length measures — the version with a hand-counted `stroke-dasharray: 22.4` breaks the moment anybody edits the icon or changes the stroke width. Unchecking rubs the line back out the way it came instead of switching it off, which is the difference between a state change you can follow and a redraw you cannot. The mark is `aria-hidden` and the button around it carries `role=\"checkbox\"` and `aria-checked`, so nothing depends on a screen reader making sense of an SVG. The starting dash offset is set from JavaScript rather than the stylesheet, so a page whose script never ran shows a plain empty box rather than a control that looks broken.",
    example: "<button type=\"button\" data-rm-task-check aria-label=\"Send the invoice\"></button>",
    usage: "import { taskCheck } from \"@soyrageagency/rage-motion\";\ntaskCheck();",
    options: [
      option("duration", "number", "420", "Milliseconds to draw or undraw the tick."),
      option("label", "string", "\"Done\"", "Used only when the element has no name of its own."),
    ],
  },
  {
    name: "taskReorder",
    category: "tasks",
    file: MOD_TASKS,
    attribute: "data-rm-task-reorder",
    summary: "Reorder tasks by dragging a handle, or with Alt and the arrow keys.",
    notes:
      "The drag is the flourish and the keyboard is the feature: a reorder that only exists under a held mouse button is one most keyboard and switch users simply cannot perform. Alt with the up and down arrows moves the row, and each move is announced as \"Buy milk, position 2 of 7\", so somebody who cannot see the list still knows where the thing they are holding ended up. Both routes end in the same place — the DOM order changes once, and every row that moved is FLIPped from where it was, so the list is correct on the frame the change happens and the motion is decoration over a finished layout. The dragged row's transform is recomputed from its live layout position on every pointer move, which is why it stays exactly under the finger even after the DOM has been rearranged underneath it.",
    example: "<ul data-rm-task-reorder>\n  <li>Draft the brief</li>\n  <li>Book the studio</li>\n</ul>",
    usage: "import { taskReorder } from \"@soyrageagency/rage-motion\";\ntaskReorder();",
    options: [
      option("item", "string", "\"li\"", "Selector for the reorderable rows."),
      option("duration", "number", "300", "Milliseconds for the FLIP settle."),
      option("label", "string", "\"Reorderable tasks\"", "Accessible name for the list."),
    ],
  },
  {
    name: "taskGroup",
    category: "tasks",
    file: MOD_TASKS,
    attribute: "data-rm-task-group",
    summary: "A collapsible section of tasks that opens by interpolating a grid track.",
    notes:
      "This is the one component here that lets a box change size, because a section of unknown height cannot be revealed without doing so, and it interpolates `grid-template-rows` from `0fr` to `1fr` rather than guessing a `max-height`. The guess is what makes the easing wrong for every section shorter than the number and clips every section taller than it; the grid track is measured by the browser from the real content. The inner box needs `min-height: 0` or the track can never actually reach zero, which is the single reason this technique gets reported as not working. The header is a real button with `aria-expanded` and `aria-controls`, the panel is `inert` while closed so Tab cannot land inside something nobody can see, and the count of unfinished tasks stays in the header so collapsing a section never hides how much is in it.",
    example: "<section data-rm-task-group data-rm-open=\"false\">\n  <h3>This week</h3>\n  <ul><li>Send the invoice</li></ul>\n</section>",
    usage: "import { taskGroup } from \"@soyrageagency/rage-motion\";\ntaskGroup();",
    options: [
      option("open", "boolean", "true", "Resting state; `data-rm-open=\"false\"` starts it closed."),
      option("duration", "number", "320", "Milliseconds for the track to interpolate."),
      option("item", "string", "\"li\"", "What to count for the header badge."),
    ],
  },
  {
    name: "kanban",
    category: "tasks",
    file: MOD_TASKS,
    attribute: "data-rm-kanban",
    summary: "A board of columns you can drag cards between, or move between by keyboard.",
    notes:
      "A board is the interaction most often shipped as mouse-only and the one where that hurts most, since moving a card between columns is the entire point of the thing. Every card is focusable: Space picks it up, the arrow keys move it within and between columns, Space puts it down and Escape puts it back where it started — and each of those says out loud what happened and where the card now is. All movement is a FLIP applied after the DOM has already changed, so the board is never caught mid-animation when it is read, and the dragged card's transform is recomputed from its live position each move so it never drifts away from the pointer. Columns are labelled groups containing a real list, so the structure is navigable rather than a wall of nested divs.",
    example: "<div data-rm-kanban>\n  <section data-rm-column=\"To do\"><h3>To do</h3><ul><li>Write copy</li></ul></section>\n  <section data-rm-column=\"Doing\"><h3>Doing</h3><ul></ul></section>\n</div>",
    usage: "import { kanban } from \"@soyrageagency/rage-motion\";\nkanban();",
    options: [
      option("card", "string", "\"li\"", "Selector for the cards inside each column."),
      option("duration", "number", "320", "Milliseconds for a card to settle into its new slot."),
      option("label", "string", "\"Board\"", "Accessible name for the board as a whole."),
    ],
  },
  {
    name: "taskProgress",
    category: "tasks",
    file: MOD_TASKS,
    attribute: "data-rm-task-progress",
    summary: "A real progress bar that counts the list it sits above.",
    notes:
      "It counts the tasks rather than being handed a percentage, so it cannot disagree with what is on the screen — the usual version takes a number as a prop and drifts the moment anything else completes a task. The fill is a `scaleX` from the left edge rather than an animated width, which costs one composited transform per change instead of a reflow of everything beside it. It is a `role=\"progressbar\"` with `aria-valuetext` reading \"3 of 8 tasks complete\", because 37 is a number and not an answer. It is deliberately not a live region: a bar that announces itself on every tick talks straight over whatever the visitor is actually doing.",
    example: "<div data-rm-task-progress=\"today\"></div>\n<ul id=\"today\" data-rm-task-list><li>Buy milk</li></ul>",
    usage: "import { taskProgress } from \"@soyrageagency/rage-motion\";\ntaskProgress();",
    options: [
      option("item", "string", "\"li\"", "Selector for the rows it counts."),
      option("label", "string", "\"Tasks complete\"", "Accessible name for the bar."),
      option("duration", "number", "420", "Milliseconds for the fill to move."),
    ],
  },
  {
    name: "taskFilter",
    category: "tasks",
    file: MOD_TASKS,
    attribute: "data-rm-task-filter",
    summary: "Filter chips that hide rows instantly and FLIP the survivors into place.",
    notes:
      "Hiding is instant and the motion is the correction afterwards: the rows are measured, the filter is applied, and the survivors are animated from where they used to be. Fading the whole list out and back in is the common shortcut and it is worse in every way, because the list is unreadable for the duration and nothing tells you which rows actually left. The chips are a labelled group of buttons carrying `aria-pressed` rather than tabs or links, and the result is announced as \"4 of 11 tasks shown\" so pressing one has an audible effect. The resting filter is applied from JavaScript on mount, so the list is never filtered by a stylesheet before the script has run.",
    example: "<div data-rm-task-filter=\"today\">\n  <button type=\"button\" data-rm-match=\"all\">All</button>\n  <button type=\"button\" data-rm-match=\"open\">Open</button>\n  <button type=\"button\" data-rm-match=\"admin\">Admin</button>\n</div>\n<ul id=\"today\"><li data-rm-filter=\"admin\">File the VAT</li></ul>",
    usage: "import { taskFilter } from \"@soyrageagency/rage-motion\";\ntaskFilter();",
    options: [
      option("item", "string", "\"li\"", "Selector for the rows being filtered."),
      option("duration", "number", "300", "Milliseconds for the survivors to slide up."),
      option("label", "string", "\"Filter tasks\"", "Accessible name for the chip group."),
    ],
  },
  {
    name: "subtasks",
    category: "tasks",
    file: MOD_TASKS,
    attribute: "data-rm-subtasks",
    summary: "A nested list of subtasks with a progress ring on the parent.",
    notes:
      "The ring is a circle with `pathLength=\"1\"`, so three of five is a dash offset of 0.4 rather than a circumference computed from a radius somebody is going to change later. It carries the count in `aria-valuetext`, because a ring on its own is a picture of progress and not a statement of it. The nested list is given a label naming its parent — \"Subtasks of Ship the site\" — so a screen reader user landing in it knows whose subtasks these are instead of finding a second anonymous run of checkboxes. Counting deliberately uses direct children only, so a parent list and its nested one never double-count the same rows.",
    example: "<li data-rm-subtasks>\n  Ship the site\n  <ul><li data-rm-done=\"true\">Copy</li><li>Photography</li></ul>\n</li>",
    usage: "import { subtasks } from \"@soyrageagency/rage-motion\";\nsubtasks();",
    options: [
      option("item", "string", "\"li\"", "Selector for the subtask rows."),
      option("duration", "number", "480", "Milliseconds for the ring to sweep to its new value."),
    ],
  },
  {
    name: "taskDue",
    category: "tasks",
    file: MOD_TASKS,
    attribute: "data-rm-task-due",
    summary: "A due date that rewrites itself as a relative phrase and changes tone as it approaches.",
    notes:
      "The machine-readable date stays in the `datetime` attribute while the visible text becomes a phrase from `Intl.RelativeTimeFormat`, so \"in 3 days\" is produced in the visitor's own language rather than assembled from English fragments. Colour is never the message: the phrase itself changes, and the overdue state says the word \"overdue\" as well as turning red, because a status carried only by a colour is a status invisible to whoever cannot distinguish it. It re-reads on an interval so a tab left open overnight does not still claim something is due tomorrow, and the interval only runs while the element is on screen and the tab is in front — which is exactly what most live timestamps forget to do.",
    example: "<time data-rm-task-due datetime=\"2026-09-12\" data-rm-soon=\"3\">12 September</time>",
    usage: "import { taskDue } from \"@soyrageagency/rage-motion\";\ntaskDue();",
    options: [
      option("soon", "number", "2", "How many days ahead counts as soon."),
      option("every", "number", "60", "Seconds between re-reads while it is visible."),
    ],
  },
  {
    name: "taskPriority",
    category: "tasks",
    file: MOD_TASKS,
    attribute: "data-rm-task-priority",
    summary: "A real select, drawn as a flag.",
    notes:
      "The `<select>` is kept and laid transparently over the flag rather than replaced by a listbox of divs, so it still owns the form value, the keyboard type-ahead, the label association and the native picker on a phone — all the things a designer's replacement trades away for a nicer arrow. The flag reflects the value and hoists itself when it changes, and that is a transform on the pennant alone so the row it sits in never moves. `:focus-within` puts the focus ring on the flag, since the control that actually has focus is invisible by design. An unrecognised level keeps its real value in the form and falls back to the neutral colour rather than being dropped on the floor.",
    example: "<label data-rm-task-priority>Priority\n  <select><option value=\"low\">Low</option><option value=\"high\">High</option></select>\n</label>",
    usage: "import { taskPriority } from \"@soyrageagency/rage-motion\";\ntaskPriority();",
    options: [
      option("level", "low | medium | high | urgent", "\"medium\"", "Tone used when the select's value is not one of the known levels."),
    ],
  },
  {
    name: "taskAssignee",
    category: "tasks",
    file: MOD_TASKS,
    attribute: "data-rm-task-assignee",
    summary: "An avatar picker built as a real listbox.",
    notes:
      "A button with `aria-haspopup=\"listbox\"` and `aria-expanded`, options carrying `role=\"option\"` and `aria-selected`, arrow keys, Home and End, Escape to close and focus put back on the button afterwards. The usual avatar picker is a row of images with click handlers, which is unreachable by keyboard and silent to a screen reader — a face is not an accessible name, and initials are not one either, so the chosen person's name is always rendered as text beside the picture. Closing on an outside pointer press is handled at the document level and removed on cleanup, so a page with a dozen of these does not leak a dozen listeners. The new avatar cross-fades in place, which costs one opacity and one scale rather than a re-layout of the row.",
    example: "<div data-rm-task-assignee>\n  <ul><li data-rm-name=\"Ana Ruiz\"></li><li data-rm-name=\"Tom Vale\"></li></ul>\n</div>",
    usage: "import { taskAssignee } from \"@soyrageagency/rage-motion\";\ntaskAssignee();",
    options: [
      option("label", "string", "\"Assignee\"", "Accessible name for the listbox."),
      option("empty", "string", "\"Unassigned\"", "Shown before anybody is chosen."),
    ],
  },
  {
    name: "taskSwipe",
    category: "tasks",
    file: MOD_TASKS,
    attribute: "data-rm-task-swipe",
    summary: "Swipe a row to complete it, with a button that does exactly the same thing.",
    notes:
      "The face of the row translates off the action sitting behind it, so nothing resizes and the rows below stay precisely where they were however far the gesture travels. Short of the threshold it springs back rather than snapping, because a gesture that refuses without acknowledging you feels broken. A gesture is not an interface on its own, so the same action is always present as a real button in the row: swiping is the shortcut for people who can, and the button is how it actually works for everyone else. `touch-action: pan-y` on the row keeps vertical scrolling with the browser while the horizontal axis comes to the component, which is what stops a swipe list from feeling like it is fighting the page.",
    example: "<li data-rm-task-swipe data-rm-threshold=\"110\">Reply to the brief</li>",
    usage: "import { taskSwipe } from \"@soyrageagency/rage-motion\";\ntaskSwipe();",
    options: [
      option("threshold", "number", "96", "Pixels of travel before the swipe commits."),
      option("label", "string", "\"Complete\"", "Text and accessible name for the button behind the row."),
    ],
  },
  {
    name: "taskUndo",
    category: "tasks",
    file: MOD_TASKS,
    attribute: "data-rm-task-undo",
    summary: "Completing a task is undoable, in the row it happened in.",
    notes:
      "The row is marked done and held for a moment before anything commits, with the undo offered in the row itself rather than in a toast in a corner — the toast is somewhere else on the screen, it expires while you are still looking at the thing that changed, and on a phone it usually covers the next task down. The undo button is inserted immediately after the row's own controls so Tab reaches it next, and Control-Z anywhere inside the list undoes the most recent completion. The countdown pauses whenever a pointer or the keyboard is on the row, because losing an undo because you stopped to read it is the worst outcome available. The remaining time is drawn as a conic sweep fed by a single 0–1 custom property, so nothing is resized once per tick.",
    example: "<ul data-rm-task-undo data-rm-life=\"8000\">…</ul>",
    usage: "import { taskUndo } from \"@soyrageagency/rage-motion\";\ntaskUndo();\n\nlist.rmComplete(row, () => remove(row));",
    options: [
      option("life", "number", "6000", "Milliseconds before the completion commits."),
      option("label", "string", "\"Undo\"", "Text on the undo button."),
    ],
  },
  {
    name: "taskCount",
    category: "tasks",
    file: MOD_TASKS,
    attribute: "data-rm-task-count",
    summary: "A live count of the tasks still left, rolling in the direction it moved.",
    notes:
      "The old digit leaves and the new one arrives from the direction the count travelled — up for more, down for fewer — so the change reads as a change rather than a redraw. Both are transforms on a duplicated face inside a clipped box, so the sentence around the number never reflows; a count that re-lays-out its own line every time a task is ticked makes the whole list twitch. What gets announced is the sentence, not the digit: \"4 tasks left\" rather than \"4\", which on its own is a number a screen reader reads with no idea what it counts. The visible digits are `aria-hidden` precisely so the roll is not announced as two numbers arriving in quick succession.",
    example: "<p data-rm-task-count=\"today\" data-rm-label=\"tasks left\"></p>",
    usage: "import { taskCount } from \"@soyrageagency/rage-motion\";\ntaskCount();",
    options: [
      option("item", "string", "\"li\"", "Selector for the rows it counts."),
      option("duration", "number", "320", "Milliseconds for the digit to roll."),
      option("word", "string", "\"left\"", "The word after the number; singularised automatically at one."),
    ],
  },
  {
    name: "taskEmpty",
    category: "tasks",
    file: MOD_TASKS,
    attribute: "data-rm-task-empty",
    summary: "The all-done state, arriving when the list finally empties.",
    notes:
      "It watches the list rather than being switched on by hand, so it cannot be left up over a list that has since gained a task. When it arrives its parts stagger in and the tick draws itself along its own stroke; when a task comes back it leaves without ceremony, because arriving is the moment worth marking and going away is not. Under reduced motion it jumps to the finished state with the tick fully drawn and every part at full opacity — never blank, which is what a naive `opacity: 0` start state leaves behind. The panel is a polite live region, and that is the real point: the end of a list is the one moment a task app has something genuinely good to say, and saying it only in pixels means most people never hear it.",
    example: "<div data-rm-task-empty=\"today\">\n  <h3>All done</h3>\n  <p>Nothing left today.</p>\n</div>",
    usage: "import { taskEmpty } from \"@soyrageagency/rage-motion\";\ntaskEmpty();",
    options: [
      option("item", "string", "\"li\"", "Selector for the rows it watches."),
      option("duration", "number", "560", "Milliseconds per part and for the tick."),
      option("stagger", "number", "90", "Milliseconds between the parts arriving."),
    ],
  },
  {
    name: "taskSearch",
    category: "tasks",
    file: MOD_TASKS,
    attribute: "data-rm-task-search",
    summary: "Filter tasks as you type, with the result count announced once you stop.",
    notes:
      "A real `<input type=\"search\">` wired to the list with `aria-controls`, and the count announced on a debounce rather than on every keystroke — announcing each one turns a filter box into a stutter of half-finished numbers, which is why so many teams switch the live region off and end up announcing nothing at all. Matches are wrapped in `<mark>`, which carries meaning rather than merely a yellow background, and the original text is kept so highlighting can be undone exactly rather than reconstructed. Rows that contain buttons are filtered but never rewritten, so a search box can be dropped over a list built by taskList without eating its checkboxes. Escape clears the box, which is what the key does in every native search field.",
    example: "<input type=\"search\" data-rm-task-search=\"today\" placeholder=\"Filter tasks\">",
    usage: "import { taskSearch } from \"@soyrageagency/rage-motion\";\ntaskSearch();",
    options: [
      option("item", "string", "\"li\"", "Selector for the rows being filtered."),
      option("wait", "number", "200", "Milliseconds of quiet before the count is announced."),
      option("duration", "number", "280", "Milliseconds for the survivors to slide up."),
      option("label", "string", "\"Filter tasks\"", "Accessible name for the input."),
    ],
  },
  {
    name: "taskBulk",
    category: "tasks",
    file: MOD_TASKS,
    attribute: "data-rm-task-bulk",
    summary: "Select many tasks and act on them once, with a toolbar that pushes nothing.",
    notes:
      "Selection is a second `role=\"checkbox\"` per row with its own name — \"Select Buy milk\", not another anonymous box next to the one that completes it — and the header box goes to `aria-checked=\"mixed\"` when some but not all are chosen, which is the entire reason that state exists and the thing almost every custom checkbox leaves out. Shift-clicking extends the range from the last anchor the way every file manager has done for thirty years, and the same toggles work from the keyboard because they are buttons. The toolbar is always in the layout and only ever moves, so choosing a task never pushes the rest of them down the page, and only the action buttons are made `inert` while nothing is selected — making the whole bar inert would take the select-all box with it, which is the one control that matters when nothing is chosen yet.",
    example: "<div data-rm-task-bulk=\"today\">\n  <button type=\"button\">Delete</button>\n  <button type=\"button\">Move</button>\n</div>",
    usage: "import { taskBulk } from \"@soyrageagency/rage-motion\";\ntaskBulk();",
    options: [
      option("item", "string", "\"li\"", "Selector for the selectable rows."),
      option("label", "string", "\"Bulk actions\"", "Accessible name for the toolbar."),
    ],
  },
  {
    name: "taskTimer",
    category: "tasks",
    file: MOD_TASKS,
    attribute: "data-rm-task-timer",
    summary: "Time spent on a task, counted from the clock rather than from frames.",
    notes:
      "The elapsed figure is derived from a wall-clock stamp instead of being incremented once per frame, so a tab that was throttled in the background comes back showing the real time rather than however many frames it happened to be given. The redraw runs on the kit's shared frame loop and only while the timer is on screen, so twenty of these on a page cost one loop between them and nothing at all once they scroll away. It is `role=\"timer\"` with `aria-live=\"off\"`, because a running clock that announces itself every second is unusable — the figure is spoken once, when it is paused, which is when it means something. The face uses tabular figures, since proportional digits change width as they count and produce a layout shift sixty times a minute.",
    example: "<div data-rm-task-timer data-rm-seconds=\"0\"></div>",
    usage: "import { taskTimer } from \"@soyrageagency/rage-motion\";\ntaskTimer();",
    options: [
      option("label", "string", "\"Time on task\"", "Accessible name for the timer."),
    ],
  },
  {
    name: "taskStreak",
    category: "tasks",
    file: MOD_TASKS,
    attribute: "data-rm-task-streak",
    summary: "Consecutive days, drawn as a line along the run.",
    notes:
      "The run is a polyline with `pathLength=\"1\"`, so the dash offset is the fraction of the week completed however many days are shown, and no length has to be measured by hand. Each day is a real list item with a name — \"Tuesday, done\" — because the row of dots is the decoration and the record is the information; a chart whose only content is coloured circles says nothing to anyone who cannot see them. It draws once, when it comes into view, rather than on load: a streak that has already finished animating before you scroll to it is one nobody ever sees. Under reduced motion the line is set to its final length immediately, so the streak is still shown rather than left as a blank rail.",
    example: "<div data-rm-task-streak data-rm-days=\"1,1,1,0,1,1,1\"></div>",
    usage: "import { taskStreak } from \"@soyrageagency/rage-motion\";\ntaskStreak();",
    options: [
      option("duration", "number", "900", "Milliseconds to draw the line."),
      option("names", "string", "\"Mon,Tue,Wed,Thu,Fri,Sat,Sun\"", "Comma-separated day labels; overridden by data-rm-label."),
    ],
  },
  {
    name: "taskNote",
    category: "tasks",
    file: MOD_TASKS,
    attribute: "data-rm-task-note",
    summary: "An inline note that expands in place without dragging the list through it.",
    notes:
    // impeccable-disable-next-line layout-transition: prose arguing against one
      "The row takes its final size on the frame the note opens and only the ink animates — a clip-path wipe and a short lift on the note itself. That is deliberately the opposite of the usual height transition: interpolating the height of a row in the middle of a list drags every row below it through a few hundred intermediate positions, which is what makes long lists stutter and what makes a click on the row beneath land somewhere unexpected. The trigger is a real button with `aria-expanded` and `aria-controls`, focus moves into the note when it opens, and Escape closes it and puts focus back on the button that opened it. The resting state is applied from JavaScript, so a note hidden by a stylesheet can never stay hidden for somebody whose script failed to load.",
    example: "<p data-rm-task-note=\"Notes\">Client wants the blue version by Friday.</p>",
    usage: "import { taskNote } from \"@soyrageagency/rage-motion\";\ntaskNote();",
    options: [
      option("label", "string", "\"Note\"", "Text on the toggle; also the attribute's own value."),
      option("duration", "number", "300", "Milliseconds for the wipe."),
      option("open", "boolean", "false", "Resting state; `data-rm-open=\"true\"` starts it open."),
    ],
  },

  // ── Numbers, drawn — the second set ──
  {
    name: "areaChart",
    category: "metrics",
    file: MOD_METRICS,
    attribute: "data-rm-area-chart",
    summary: "A filled trend that is drawn, not scaled.",
    notes:
      "The values come out of a real list in the markup, so the page still says what it says with JavaScript off and there is no second copy of the data to drift from the first. The line is a path uncovered left to right with stroke-dashoffset, which keeps one weight the whole way across; the usual shortcut scales a finished path up from the axis and so has the wrong line weight for every frame except the last. The shaded area cannot be dash-drawn because a fill has no length, so it fades in behind the line instead of being stretched. Smoothing uses midpoint curves rather than a spline through the points, because a spline overshoots and would draw values the data never had.",
    example: "<div data-rm-area-chart><ol><li data-rm-value=\"12\">Jan</li><li data-rm-value=\"19\">Feb</li><li data-rm-value=\"8\">Mar</li></ol></div>",
    usage: "import { areaChart } from \"@soyrageagency/rage-motion\";\nareaChart();",
    options: [
      option("smooth", "boolean", "true", "Curve between points, or join them straight."),
      option("thickness", "number", "0.5", "Line weight in chart units; the chart is 100 wide."),
      option("color", "string", "#2aa7e4", "Also settable per chart with data-rm-color."),
      option("duration", "number", "1200", "How long the line takes to draw."),
    ],
  },
  {
    name: "stepChart",
    category: "metrics",
    file: MOD_METRICS,
    attribute: "data-rm-step-chart",
    summary: "A value that holds until it changes.",
    notes:
      "The right chart for a price, a headcount or a rate: the number did not travel between the readings, it sat still and then jumped. A smoothed line through those same points draws months of values that never existed, which is the one thing a chart must not do, and it is the default in most libraries. The staircase is a single path revealed with stroke-dashoffset, so the horizontals and the verticals appear in the order the changes happened. Values can come from a list of list items or, for something small, from a comma-separated data-rm-values.",
    example: "<div data-rm-step-chart data-rm-values=\"4,4,9,9,7,12\"></div>",
    usage: "import { stepChart } from \"@soyrageagency/rage-motion\";\nstepChart();",
    options: [
      option("thickness", "number", "0.5", "Line weight in chart units; the chart is 100 wide."),
      option("color", "string", "#d28c65", "Also settable per chart with data-rm-color."),
      option("duration", "number", "1200", "How long the staircase takes to draw."),
      option("threshold", "number", "0.25", "How much must be on screen before it draws."),
    ],
  },
  {
    name: "candlestick",
    category: "metrics",
    file: MOD_METRICS,
    attribute: "data-rm-candles",
    summary: "Open, high, low and close, in one mark.",
    notes:
      "Each body is a thick line rather than a rect, which is what lets it be uncovered with stroke-dashoffset at a constant width; a rect can only be scaled, and a scaled rect takes its stroke and its corner radius with it. Direction is written as a class on the source row as well as a colour, because red and green are the two hues most often confused and a chart carrying its meaning only in them says nothing to a fair number of readers. A day that opened and closed at the same price still gets a visible body rather than collapsing to nothing. The four numbers live on the table row as data-rm-open, -high, -low and -close, so the table remains the readable version.",
    example: "<div data-rm-candles><table><tr data-rm-open=\"10\" data-rm-high=\"14\" data-rm-low=\"9\" data-rm-close=\"13\"><td>Mon</td></tr></table></div>",
    usage: "import { candlestick } from \"@soyrageagency/rage-motion\";\ncandlestick();",
    options: [
      option("up", "string", "#2aa7e4", "Colour for a close above the open."),
      option("down", "string", "#d28c65", "Colour for a close below it."),
      option("stagger", "number", "45", "Between one candle and the next."),
      option("duration", "number", "620", "Per candle."),
    ],
  },
  {
    name: "waterfall",
    category: "metrics",
    file: MOD_METRICS,
    attribute: "data-rm-waterfall",
    summary: "How a total was arrived at.",
    notes:
      "Each bar starts where the last one finished, so the running total is arithmetically correct at every moment of the animation and not only at the end. The common implementation grows every bar from zero at once, which looks tidy and makes the picture wrong for the whole of its duration — the one thing a waterfall exists to get right. Bars are thick lines uncovered from the running baseline, with dotted connectors drawn between them, so nothing is scaled and no layout moves. A row marked data-rm-total is drawn from the axis instead, because a sum is not another step.",
    example: "<ul data-rm-waterfall><li data-rm-value=\"120\">Opening</li><li data-rm-value=\"-30\">Churn</li><li data-rm-value=\"90\" data-rm-total>Closing</li></ul>",
    usage: "import { waterfall } from \"@soyrageagency/rage-motion\";\nwaterfall();",
    options: [
      option("rise", "string", "#2aa7e4", "Colour for a positive step."),
      option("fall", "string", "#d28c65", "Colour for a negative one."),
      option("total", "string", "#6c695f", "Colour for a data-rm-total bar."),
      option("stagger", "number", "130", "Between steps; they draw in sequence."),
    ],
  },
  {
    name: "radar",
    category: "metrics",
    file: MOD_METRICS,
    attribute: "data-rm-radar",
    summary: "A shape made of several scales at once.",
    notes:
      "The outline is drawn round the polygon with stroke-dashoffset and the fill fades in behind it. Scaling the finished polygon up from the centre — the obvious alternative — is wrong twice over: the stroke thickens as it grows, and the shape passes through every smaller version of itself, which reads as the values changing rather than as the chart arriving. Grid rings and spokes are drawn first and faintly, because a radar chart without its scale is a decoration rather than a measurement. Axis names stay in the list underneath, which doubles as the legend.",
    example: "<div data-rm-radar data-rm-max=\"100\"><ul><li data-rm-value=\"80\">Speed</li><li data-rm-value=\"55\">Range</li><li data-rm-value=\"90\">Power</li></ul></div>",
    usage: "import { radar } from \"@soyrageagency/rage-motion\";\nradar();",
    options: [
      option("max", "number", "100", "Full scale; raised if a value exceeds it."),
      option("levels", "number", "4", "Grid rings, clamped to 8."),
      option("color", "string", "#2aa7e4", "Outline and fill."),
      option("duration", "number", "1100", "How long the outline takes."),
    ],
  },
  {
    name: "heatCalendar",
    category: "metrics",
    file: MOD_METRICS,
    attribute: "data-rm-heat-calendar",
    summary: "A year of days, one square each.",
    notes:
      "Counts are quantised into a handful of levels rather than mapped onto a continuous ramp, because forty shades of one hue are forty shades nobody can tell apart — every contribution grid that works uses about five steps. Dates put each day in its real weekday row and week column, measured from the earliest date in the set rather than from whichever day happens to be listed first, so a feed written newest first grids exactly as one written oldest first; without a date the squares simply run in order, which is still an honest strip. Cells arrive on a diagonal sweep of opacity and a scale about their own centre, so a year of squares costs one compositor animation each and no layout at all. The SVG is sized by its height and scrolls sideways, so the cells keep their size instead of swelling to fill a wide page.",
    example: "<div data-rm-heat-calendar>\n<ul>\n  <li data-rm-date=\"2025-01-06\" data-rm-value=\"0\">0 commits on 2025-01-06</li>\n  <li data-rm-date=\"2025-01-07\" data-rm-value=\"3\">3 commits on 2025-01-07</li>\n  <li data-rm-date=\"2025-01-08\" data-rm-value=\"5\">5 commits on 2025-01-08</li>\n  <li data-rm-date=\"2025-01-09\" data-rm-value=\"2\">2 commits on 2025-01-09</li>\n  <li data-rm-date=\"2025-01-10\" data-rm-value=\"4\">4 commits on 2025-01-10</li>\n  <li data-rm-date=\"2025-01-11\" data-rm-value=\"1\">1 commits on 2025-01-11</li>\n  <li data-rm-date=\"2025-01-12\" data-rm-value=\"0\">0 commits on 2025-01-12</li>\n  <li data-rm-date=\"2025-01-13\" data-rm-value=\"0\">0 commits on 2025-01-13</li>\n  <li data-rm-date=\"2025-01-14\" data-rm-value=\"4\">4 commits on 2025-01-14</li>\n  <li data-rm-date=\"2025-01-15\" data-rm-value=\"6\">6 commits on 2025-01-15</li>\n  <li data-rm-date=\"2025-01-16\" data-rm-value=\"3\">3 commits on 2025-01-16</li>\n  <li data-rm-date=\"2025-01-17\" data-rm-value=\"5\">5 commits on 2025-01-17</li>\n  <li data-rm-date=\"2025-01-18\" data-rm-value=\"2\">2 commits on 2025-01-18</li>\n  <li data-rm-date=\"2025-01-19\" data-rm-value=\"0\">0 commits on 2025-01-19</li>\n  <li data-rm-date=\"2025-01-20\" data-rm-value=\"1\">1 commits on 2025-01-20</li>\n  <li data-rm-date=\"2025-01-21\" data-rm-value=\"7\">7 commits on 2025-01-21</li>\n  <li data-rm-date=\"2025-01-22\" data-rm-value=\"9\">9 commits on 2025-01-22</li>\n  <li data-rm-date=\"2025-01-23\" data-rm-value=\"8\">8 commits on 2025-01-23</li>\n  <li data-rm-date=\"2025-01-24\" data-rm-value=\"6\">6 commits on 2025-01-24</li>\n  <li data-rm-date=\"2025-01-25\" data-rm-value=\"2\">2 commits on 2025-01-25</li>\n  <li data-rm-date=\"2025-01-26\" data-rm-value=\"0\">0 commits on 2025-01-26</li>\n  <li data-rm-date=\"2025-01-27\" data-rm-value=\"0\">0 commits on 2025-01-27</li>\n  <li data-rm-date=\"2025-01-28\" data-rm-value=\"5\">5 commits on 2025-01-28</li>\n  <li data-rm-date=\"2025-01-29\" data-rm-value=\"8\">8 commits on 2025-01-29</li>\n  <li data-rm-date=\"2025-01-30\" data-rm-value=\"11\">11 commits on 2025-01-30</li>\n  <li data-rm-date=\"2025-01-31\" data-rm-value=\"7\">7 commits on 2025-01-31</li>\n  <li data-rm-date=\"2025-02-01\" data-rm-value=\"3\">3 commits on 2025-02-01</li>\n  <li data-rm-date=\"2025-02-02\" data-rm-value=\"1\">1 commits on 2025-02-02</li>\n  <li data-rm-date=\"2025-02-03\" data-rm-value=\"2\">2 commits on 2025-02-03</li>\n  <li data-rm-date=\"2025-02-04\" data-rm-value=\"6\">6 commits on 2025-02-04</li>\n  <li data-rm-date=\"2025-02-05\" data-rm-value=\"9\">9 commits on 2025-02-05</li>\n  <li data-rm-date=\"2025-02-06\" data-rm-value=\"12\">12 commits on 2025-02-06</li>\n  <li data-rm-date=\"2025-02-07\" data-rm-value=\"8\">8 commits on 2025-02-07</li>\n  <li data-rm-date=\"2025-02-08\" data-rm-value=\"4\">4 commits on 2025-02-08</li>\n  <li data-rm-date=\"2025-02-09\" data-rm-value=\"0\">0 commits on 2025-02-09</li>\n  <li data-rm-date=\"2025-02-10\" data-rm-value=\"0\">0 commits on 2025-02-10</li>\n  <li data-rm-date=\"2025-02-11\" data-rm-value=\"3\">3 commits on 2025-02-11</li>\n  <li data-rm-date=\"2025-02-12\" data-rm-value=\"5\">5 commits on 2025-02-12</li>\n  <li data-rm-date=\"2025-02-13\" data-rm-value=\"4\">4 commits on 2025-02-13</li>\n  <li data-rm-date=\"2025-02-14\" data-rm-value=\"6\">6 commits on 2025-02-14</li>\n  <li data-rm-date=\"2025-02-15\" data-rm-value=\"2\">2 commits on 2025-02-15</li>\n  <li data-rm-date=\"2025-02-16\" data-rm-value=\"0\">0 commits on 2025-02-16</li>\n  <li data-rm-date=\"2025-02-17\" data-rm-value=\"1\">1 commits on 2025-02-17</li>\n  <li data-rm-date=\"2025-02-18\" data-rm-value=\"4\">4 commits on 2025-02-18</li>\n  <li data-rm-date=\"2025-02-19\" data-rm-value=\"7\">7 commits on 2025-02-19</li>\n  <li data-rm-date=\"2025-02-20\" data-rm-value=\"5\">5 commits on 2025-02-20</li>\n  <li data-rm-date=\"2025-02-21\" data-rm-value=\"3\">3 commits on 2025-02-21</li>\n  <li data-rm-date=\"2025-02-22\" data-rm-value=\"2\">2 commits on 2025-02-22</li>\n  <li data-rm-date=\"2025-02-23\" data-rm-value=\"0\">0 commits on 2025-02-23</li>\n  <li data-rm-date=\"2025-02-24\" data-rm-value=\"0\">0 commits on 2025-02-24</li>\n  <li data-rm-date=\"2025-02-25\" data-rm-value=\"2\">2 commits on 2025-02-25</li>\n  <li data-rm-date=\"2025-02-26\" data-rm-value=\"4\">4 commits on 2025-02-26</li>\n  <li data-rm-date=\"2025-02-27\" data-rm-value=\"3\">3 commits on 2025-02-27</li>\n  <li data-rm-date=\"2025-02-28\" data-rm-value=\"5\">5 commits on 2025-02-28</li>\n  <li data-rm-date=\"2025-03-01\" data-rm-value=\"1\">1 commits on 2025-03-01</li>\n  <li data-rm-date=\"2025-03-02\" data-rm-value=\"0\">0 commits on 2025-03-02</li>\n  <li data-rm-date=\"2025-03-03\" data-rm-value=\"0\">0 commits on 2025-03-03</li>\n  <li data-rm-date=\"2025-03-04\" data-rm-value=\"6\">6 commits on 2025-03-04</li>\n  <li data-rm-date=\"2025-03-05\" data-rm-value=\"8\">8 commits on 2025-03-05</li>\n  <li data-rm-date=\"2025-03-06\" data-rm-value=\"5\">5 commits on 2025-03-06</li>\n  <li data-rm-date=\"2025-03-07\" data-rm-value=\"4\">4 commits on 2025-03-07</li>\n  <li data-rm-date=\"2025-03-08\" data-rm-value=\"2\">2 commits on 2025-03-08</li>\n  <li data-rm-date=\"2025-03-09\" data-rm-value=\"1\">1 commits on 2025-03-09</li>\n  <li data-rm-date=\"2025-03-10\" data-rm-value=\"0\">0 commits on 2025-03-10</li>\n  <li data-rm-date=\"2025-03-11\" data-rm-value=\"3\">3 commits on 2025-03-11</li>\n  <li data-rm-date=\"2025-03-12\" data-rm-value=\"5\">5 commits on 2025-03-12</li>\n  <li data-rm-date=\"2025-03-13\" data-rm-value=\"7\">7 commits on 2025-03-13</li>\n  <li data-rm-date=\"2025-03-14\" data-rm-value=\"4\">4 commits on 2025-03-14</li>\n  <li data-rm-date=\"2025-03-15\" data-rm-value=\"2\">2 commits on 2025-03-15</li>\n  <li data-rm-date=\"2025-03-16\" data-rm-value=\"1\">1 commits on 2025-03-16</li>\n  <li data-rm-date=\"2025-03-17\" data-rm-value=\"0\">0 commits on 2025-03-17</li>\n</ul>\n</div>",
    usage: "import { heatCalendar } from \"@soyrageagency/rage-motion\";\nheatCalendar();",
    options: [
      option("levels", "number", "4", "Steps above zero, clamped between 2 and 6."),
      option("gap", "number", "1.4", "Between squares, in chart units."),
      option("color", "string", "#2aa7e4", "The hue every level is a share of."),
      option("duration", "number", "420", "Per cell."),
    ],
  },
  {
    name: "bulletChart",
    category: "metrics",
    file: MOD_METRICS,
    attribute: "data-rm-bullet",
    summary: "A measure against its target.",
    notes:
      "A bullet graph says in one strip what a dial takes a whole card to say, and it says the thing a dial cannot: whether the number is where it was supposed to be. The comparative tick is the entire point of the design, so it is drawn last, on top, and it is spelled out in the aria-label as well rather than left as a mark only sighted readers get. The measure is a thick line uncovered from the axis; the qualitative bands behind it are static and deliberately colourless, because a background that competes with the measure defeats the chart. Its viewBox carries the strip's proportions so it scales uniformly — giving a shallow SVG both a full width and a fixed CSS height letterboxes it.",
    example: "<div data-rm-bullet data-rm-value=\"72\" data-rm-target=\"85\" data-rm-bands=\"40,70,100\">Revenue</div>",
    usage: "import { bulletChart } from \"@soyrageagency/rage-motion\";\nbulletChart();",
    options: [
      option("max", "number", "100", "Full scale for the strip."),
      option("bands", "string", "50,75,100", "Qualitative ranges, low to high."),
      option("color", "string", "#0e0e0e", "The measure and its target tick."),
      option("duration", "number", "900", "How long the measure takes."),
    ],
  },
  {
    name: "funnel",
    category: "metrics",
    file: MOD_METRICS,
    attribute: "data-rm-funnel",
    summary: "The stages, and the drop between them.",
    notes:
      "The number people actually want from a funnel is the one nobody draws: how much was lost at each step. It is computed from the markup and written into each stage as real text, not painted into the SVG where it would be unreadable, untranslatable and invisible to a screen reader. The trapezoids are laid out once at their final widths and only their outlines move, drawn with stroke-dashoffset while the fills come up behind them, so nothing animates a width and the labels beside the chart never shift. Stage values are read from list items, which stay as the readable version of the same figures.",
    example: "<ol data-rm-funnel><li data-rm-value=\"4200\">Visited</li><li data-rm-value=\"1800\">Signed up</li><li data-rm-value=\"640\">Paid</li></ol>",
    usage: "import { funnel } from \"@soyrageagency/rage-motion\";\nfunnel();",
    options: [
      option("drops", "boolean", "true", "Write the drop-off into each stage as text."),
      option("color", "string", "#2aa7e4", "Fill and outline; stages step down in opacity."),
      option("stagger", "number", "120", "Between stages."),
      option("duration", "number", "620", "Per stage."),
    ],
  },
  {
    name: "treemap",
    category: "metrics",
    file: MOD_METRICS,
    attribute: "data-rm-treemap",
    summary: "Parts of a whole, sized by area.",
    notes:
      "Laid out with the squarified algorithm, which keeps every tile as close to square as it can. The naive slice-and-dice split — cut the whole strip for each value in turn — produces slivers a hundred times longer than they are wide, and nobody can compare the areas of two slivers, which is the only job a treemap has. Tiles are positioned once at their true sizes and revealed by an outline drawn with stroke-dashoffset over a fill that fades in, so no width or height is ever animated. Each source row gets a swatch in the tile's own colour, so the legend cannot disagree with the chart.",
    example: "<div data-rm-treemap><ul><li data-rm-value=\"45\">Search</li><li data-rm-value=\"25\">Direct</li><li data-rm-value=\"18\">Social</li></ul></div>",
    usage: "import { treemap } from \"@soyrageagency/rage-motion\";\ntreemap();",
    options: [
      option("palette", "string[]", "the token palette", "Cycled per tile; data-rm-color on a row wins."),
      option("ratio", "number", "0.62", "Height as a share of width; data-rm-ratio on the holder wins. Not data-rm-size, which means a pixel dimension everywhere else in this set."),
      option("stagger", "number", "90", "Between tiles, largest first."),
      option("duration", "number", "640", "Per tile."),
    ],
  },
  {
    name: "progressRings",
    category: "metrics",
    file: MOD_METRICS,
    attribute: "data-rm-activity-rings",
    summary: "Concentric rings, activity style.",
    notes:
      "Every ring is a real arc — one circle with pathLength=\"1\" and a dash pair — so the ends are properly rounded and the length is exact. The version built from two rotated half-discs can have neither, needs a clip as soon as a ring passes fifty per cent, and breaks outright past a hundred. The rings share one SVG so they cannot drift out of true, and each ring's value is carried by its own list item as a role=\"progressbar\" with aria-valuenow rather than being locked inside the drawing. Slices grow by animating the dash pair itself, because an arc has no start for a dashoffset to sweep from.",
    example: "<div data-rm-activity-rings><ul><li data-rm-value=\"86\">Move</li><li data-rm-value=\"120\">Exercise</li><li data-rm-value=\"40\">Stand</li></ul></div>",
    usage: "import { progressRings } from \"@soyrageagency/rage-motion\";\nprogressRings();",
    options: [
      option("size", "number", "120", "Outer diameter in pixels."),
      option("thickness", "number", "11", "Ring weight."),
      option("gap", "number", "3.5", "Between rings."),
      option("stagger", "number", "130", "Between rings, outermost first."),
    ],
  },
  {
    name: "comparisonBars",
    category: "metrics",
    file: MOD_METRICS,
    attribute: "data-rm-compare-bars",
    summary: "Two series back to back on one scale.",
    notes:
      "Both sides are measured against the larger of the two maxima, and that single decision is the whole component: scale each half to its own maximum — the mistake almost every back-to-back chart makes — and a series a tenth the size of the other appears to match it exactly. Each half grows outward from the centre gutter as a thick line uncovered with stroke-dashoffset, so nothing is scaled and nothing reflows. The gutter is a separator holding the two series apart, not a label column: the row names stay in the list under the drawing, as real text that can be selected, searched and translated rather than SVG text nobody can copy. The two figures live on each row as data-rm-left and data-rm-right, so the list stays the readable version of the comparison.",
    example: "<ul data-rm-compare-bars>\n  <li data-rm-left=\"42\" data-rm-right=\"61\">Mon</li>\n  <li data-rm-left=\"58\" data-rm-right=\"47\">Tue</li>\n  <li data-rm-left=\"35\" data-rm-right=\"72\">Wed</li>\n  <li data-rm-left=\"66\" data-rm-right=\"54\">Thu</li>\n  <li data-rm-left=\"49\" data-rm-right=\"38\">Fri</li>\n</ul>",
    usage: "import { comparisonBars } from \"@soyrageagency/rage-motion\";\ncomparisonBars();",
    options: [
      option("left", "string", "#2aa7e4", "Colour of the left-hand series."),
      option("right", "string", "#d28c65", "Colour of the right-hand one."),
      option("gap", "number", "14", "The centre gutter, in chart units."),
      option("stagger", "number", "80", "Between rows."),
    ],
  },
  {
    name: "sparkBars",
    category: "metrics",
    file: MOD_METRICS,
    attribute: "data-rm-spark-bars",
    summary: "A bar sparkline the size of a word.",
    notes:
      "Bars rather than a line, because for counts — messages a day, builds an hour — the gaps between readings are real and a line paints over them. The highest and lowest bars get their own classes and their own colours, the peak in the configured accent and the trough muted back, since the point of a chart this small is its shape and its extremes, and picking those out by eye at fourteen pixels tall is not something to ask of anyone. Each bar is a thick line uncovered from a baseline, so a strip of forty costs forty dash animations and no layout; where the series goes negative that baseline is the real zero of the widened scale rather than the foot of the viewBox, so the negatives hang below it and the positives are not silently mis-scaled against a span they were never drawn from. It is sized by its line height rather than by its column, so it sits inside a sentence without stretching it, and carries a role=\"img\" label saying how many readings and what range.",
    example: "<span data-rm-spark-bars data-rm-values=\"3,7,4,9,6,11,8\"></span>",
    usage: "import { sparkBars } from \"@soyrageagency/rage-motion\";\nsparkBars();",
    options: [
      option("color", "string", "#2aa7e4", "Every bar but the peak."),
      option("peak", "string", "#d28c65", "The highest bar."),
      option("stagger", "number", "26", "Between bars, left to right."),
      option("duration", "number", "480", "Per bar."),
    ],
  },
  {
    name: "deltaBadge",
    category: "metrics",
    file: MOD_METRICS,
    attribute: "data-rm-delta-badge",
    summary: "Up or down, with a real sign.",
    notes:
      "One number in the markup decides the arrow, the colour, the class and the spoken label together, so the badge cannot end up green with a downward arrow — which is exactly what happens when a template sets the two independently. Zero is flat, not up. The sign is a real minus, U+2212, rather than a hyphen: a hyphen in a proportional face is a shorter, lower mark that reads as punctuation, and screen readers treat the two differently. The visible arrow is aria-hidden and a spelled-out phrase sits beside it, because \"▼ 4.2%\" is announced either as nothing at all or as a black triangle.",
    example: "<span data-rm-delta-badge=\"-4.2\"></span>",
    usage: "import { deltaBadge } from \"@soyrageagency/rage-motion\";\ndeltaBadge();",
    options: [
      option("decimals", "number", "1", "Places on the figure, clamped to 4."),
      option("suffix", "string", "%", "Unit after the number."),
      option("up", "string", "▲", "Mark for a rise; down and flat match it."),
      option("duration", "number", "420", "The arrow's arrival."),
    ],
  },
  {
    name: "bigNumber",
    category: "metrics",
    file: MOD_METRICS,
    attribute: "data-rm-big-number",
    summary: "A headline figure that counts up.",
    notes:
      "The counting face is aria-hidden and a second, unmoving copy of the real figure sits beside it for anything that reads the page. The usual count-up animates the text of a live element, so a screen reader announces sixty intermediate numbers on the way to one, and it reflows its container on every frame because \"9\" and \"1,204\" are not the same width. Digits here are tabular, the count runs on the kit's shared frame loop and only while the figure is on screen, and it runs once. The last frame restores the author's own string, so hand-formatted figures keep their formatting rather than being replaced by ours, and under reduced motion the number is simply the number.",
    example: "<strong data-rm-big-number>1,204</strong>",
    usage: "import { bigNumber } from \"@soyrageagency/rage-motion\";\nbigNumber();",
    options: [
      option("duration", "number", "1600", "The whole count."),
      option("decimals", "number", "0", "Places while counting, clamped to 6."),
      option("prefix", "string", "\"\"", "In front of the figure, such as a currency."),
      option("suffix", "string", "\"\"", "After it, such as a unit."),
    ],
  },
  {
    name: "rangeBar",
    category: "metrics",
    file: MOD_METRICS,
    attribute: "data-rm-range-bar",
    summary: "A band with a marker in it.",
    notes:
      "A minimum, a maximum and where the value actually sits: the shape you want for a temperature range, a salary band or a delivery estimate, and the shape a single bar cannot express. The band is uncovered from its low end with stroke-dashoffset and the marker is drawn afterwards, so the tick lands on a band that already exists rather than racing it. The marker is a tick rather than a dot because both are drawn the same way, and it keeps its shape at any width. It is one role=\"img\" with a sentence for a label, because \"47\" alone is not the information — \"47, in a band from 32 to 68\" is.",
    example: "<div data-rm-range-bar data-rm-low=\"32\" data-rm-high=\"68\" data-rm-value=\"47\" data-rm-min=\"0\" data-rm-max=\"100\">Delivery window</div>",
    usage: "import { rangeBar } from \"@soyrageagency/rage-motion\";\nrangeBar();",
    options: [
      option("min", "number", "0", "Left-hand end of the scale."),
      option("max", "number", "100", "Right-hand end."),
      option("color", "string", "#2aa7e4", "The band itself."),
      option("duration", "number", "780", "How long the band takes to draw."),
    ],
  },
  {
    name: "pieSlices",
    category: "metrics",
    file: MOD_METRICS,
    attribute: "data-rm-pie",
    summary: "Real arcs, not rotated half-discs.",
    notes:
      "Each slice is one circle with pathLength=\"1\" and a dash pair, rotated to its start angle. The half-disc trick most pie charts use cannot round a cap, cannot leave a gap between slices, needs a second element and a clip the moment a slice passes fifty per cent, and quietly draws the wrong thing when it does. Slices sweep by growing the dash itself, because an arc has no start for a dashoffset to travel from. A thickness of zero gives a filled pie — a stroke as wide as the radius on a circle of half that radius closes the middle exactly — and any other value gives a ring; the legend swatches and percentages are written into the source list so it cannot disagree with the drawing.",
    example: "<div data-rm-pie><ul><li data-rm-value=\"42\">Direct</li><li data-rm-value=\"31\">Search</li><li data-rm-value=\"27\">Social</li></ul></div>",
    usage: "import { pieSlices } from \"@soyrageagency/rage-motion\";\npieSlices();",
    options: [
      option("size", "number", "100", "Diameter in pixels."),
      option("thickness", "number", "0", "Ring weight; 0 fills the middle."),
      option("gap", "number", "0.004", "Between slices, as a share of the circle."),
      option("stagger", "number", "110", "Between slices, clockwise."),
    ],
  },
  {
    name: "scatterPlot",
    category: "metrics",
    file: MOD_METRICS,
    attribute: "data-rm-scatter",
    summary: "Points, and the line they imply.",
    notes:
      "The trend line is computed by least squares from the same numbers the dots came from, rather than being an extra path somebody drew by eye and now has to remember to update when the data changes. It is drawn with stroke-dashoffset after the dots have landed, which is also the order the argument should be made in: here is the data, and here is what it suggests. The dots scale up about their own centres on a fill-box transform, so a hundred points cost a hundred compositor animations and no layout. Coordinates live on the list items as data-rm-x and data-rm-y, so the pairs are still readable without the drawing.",
    example: "<div data-rm-scatter><ul><li data-rm-x=\"3\" data-rm-y=\"14\">Batch A</li><li data-rm-x=\"6\" data-rm-y=\"19\">Batch B</li></ul></div>",
    usage: "import { scatterPlot } from \"@soyrageagency/rage-motion\";\nscatterPlot();",
    options: [
      option("trend", "boolean", "true", "Draw the least-squares line."),
      option("color", "string", "#2aa7e4", "Dots and trend line."),
      option("stagger", "number", "24", "Between points."),
      option("duration", "number", "420", "Per point."),
    ],
  },
  {
    name: "timelineChart",
    category: "metrics",
    file: MOD_METRICS,
    attribute: "data-rm-timeline-chart",
    summary: "Spans of time on one shared scale.",
    notes:
      "Every row is measured against the same start and end, worked out from all the rows together, so the columns line up. The version that gives each row a percentage of its own — which is what happens when the markup carries widths rather than dates — produces a chart where two bars of the same length are two different lengths of time, and nobody notices until a plan is made from it. Dates are parsed once, so an ISO date and a plain number both work, and bars are thick lines uncovered from their start rather than rects that stretch. Each row keeps its own colour as a custom property, so the list below reads as the legend.",
    example: "<ol data-rm-timeline-chart>\n  <li data-rm-start=\"2025-01-01\" data-rm-end=\"2025-03-15\">Discovery</li>\n  <li data-rm-start=\"2025-02-20\" data-rm-end=\"2025-05-30\">Design</li>\n  <li data-rm-start=\"2025-04-15\" data-rm-end=\"2025-08-10\">Build</li>\n  <li data-rm-start=\"2025-07-01\" data-rm-end=\"2025-09-20\">Launch</li>\n</ol>",
    usage: "import { timelineChart } from \"@soyrageagency/rage-motion\";\ntimelineChart();",
    options: [
      option("palette", "string[]", "the token palette", "Cycled per row; data-rm-color on a row wins."),
      option("stagger", "number", "110", "Between rows, top down."),
      option("duration", "number", "720", "Per bar."),
      option("threshold", "number", "0.2", "How much must be on screen before it draws."),
    ],
  },
  {
    name: "meterRow",
    category: "metrics",
    file: MOD_METRICS,
    attribute: "data-rm-meters",
    summary: "Many small meters, each announced.",
    notes:
      "Every row is its own role=\"progressbar\" with aria-valuenow and an aria-valuetext carrying the unit, so a screen reader says \"Search, 72 of 100 requests\" rather than reading a decorative grey rectangle out as nothing. A row of divs with a width percentage — the usual build — tells it nothing at all, however carefully the widths were worked out. The fills are thick lines uncovered along their length, one small SVG per row, staggered down the list so the eye follows the order the rows are already in. A row can carry its own data-rm-max and data-rm-color when the series do not share a scale.",
    example: "<ul data-rm-meters>\n  <li data-rm-value=\"72\" data-rm-max=\"100\" data-rm-unit=\"requests\">Search</li>\n  <li data-rm-value=\"44\" data-rm-max=\"100\" data-rm-unit=\"requests\">Direct</li>\n  <li data-rm-value=\"91\" data-rm-max=\"100\" data-rm-unit=\"requests\">Social</li>\n  <li data-rm-value=\"28\" data-rm-max=\"100\" data-rm-unit=\"requests\">Email</li>\n</ul>",
    usage: "import { meterRow } from \"@soyrageagency/rage-motion\";\nmeterRow();",
    options: [
      option("max", "number", "100", "Shared full scale; a row can override it."),
      option("color", "string", "#2aa7e4", "Fill colour for every row."),
      option("stagger", "number", "90", "Between rows."),
      option("duration", "number", "760", "Per meter."),
    ],
  },
  {
    name: "numberTicker",
    category: "metrics",
    file: MOD_METRICS,
    attribute: "data-rm-number-ticker",
    summary: "A figure that rolls to its new value.",
    notes:
      "Each digit is a column of ten glyphs moved by translateY, so nothing is measured, nothing reflows, and only the digits that actually changed move — going from 1,299 to 1,300 rolls three columns and leaves the rest alone. The version that rewrites the whole string every frame repaints text sixty times a second and changes its own width as it goes, dragging everything beside it back and forth. The columns are aria-hidden with the real figure beside them as plain text, updated once per change rather than once per frame, so the value is announced as a value instead of as a slot machine. It renders the author's own string first, grouping and all, and only formats figures that arrive later through rmSet.",
    example: "<span data-rm-number-ticker>1,204</span>",
    usage: "import { numberTicker } from \"@soyrageagency/rage-motion\";\nnumberTicker();",
    options: [
      option("duration", "number", "760", "One column's roll."),
      option("stagger", "number", "55", "Between columns, left to right."),
      option("decimals", "number", "0", "Places on a value set later."),
      option("prefix", "string", "\"\"", "In front of the figure; suffix follows it."),
    ],
  },

  // ── Creative forms, the second set ──
  {
    name: "strengthMeter",
    category: "forms2",
    file: MOD_FORMS2,
    attribute: "data-rm-strength-meter",
    summary: "A password strength bar that is announced, not just coloured.",
    notes:
      "The usual strength meter is a coloured bar and nothing more, which means the one group most in need of the warning — anyone who cannot distinguish the colours — is told nothing at all. This mounts on the real password field, inserts a bar with role=\"progressbar\" whose aria-valuetext says the word rather than the number, prints the same word as visible text, and wires the whole thing to the field with aria-describedby so it is read as part of the field. Segments fill by scaling a full-size layer from the left, so the pill ends stay round and the form below never moves as you type. The announcement is debounced and fires only when the level itself changes, because a live region wired straight to the input event stutters on every keystroke and gets switched off. The value is read, scored against length and character variety, and discarded — nothing is kept and nothing is transmitted.",
    example: "<input type=\"password\" data-rm-strength-meter data-rm-levels=\"4\">",
    usage: "import { strengthMeter } from \"@soyrageagency/rage-motion\";\nstrengthMeter();",
    options: [
      option("levels", "number", "4", "How many segments the bar has; also readable as data-rm-levels, clamped to 2–6."),
      option("label", "string", "\"Password strength\"", "What the bar calls itself when announced."),
      option("words", "string[]", "[\"Too short\",\"Weak\",\"Fair\",\"Good\",\"Strong\"]", "The words stretched across the levels; the last one is always the top."),
      option("duration", "number", "380", "How long a segment takes to fill. Zero under reduced motion."),
    ],
  },
  {
    name: "sliderPair",
    category: "forms2",
    file: MOD_FORMS2,
    attribute: "data-rm-slider-pair",
    summary: "A two-handle range built from two real range inputs.",
    notes:
      "Almost every dual-handle slider on the web is two divs and a great deal of pointer arithmetic, and the result cannot be tabbed to, cannot be nudged with an arrow key, posts nothing with the form and announces nothing. This lays two genuine input[type=range] elements over one track, so Home, End, Page Up, the arrow keys and the whole mobile behaviour belong to the browser. Two details decide whether it works: the inputs are pointer-events: none with only their thumbs clickable, or the upper one swallows every click aimed at the lower, and the input nearest the pointer is raised before the press lands, or both handles at the same end leave the buried one unreachable forever — that second bug is the single most common failure of the widget. The selection is drawn with translateX and scaleX, never a width, and the pair is a role=\"group\" with a debounced polite readout of both ends.",
    example: "<div data-rm-slider-pair data-rm-min-gap=\"5\" data-rm-unit=\"£\"><input type=\"range\" min=\"0\" max=\"100\" value=\"20\"><input type=\"range\" min=\"0\" max=\"100\" value=\"80\"></div>",
    usage: "import { sliderPair } from \"@soyrageagency/rage-motion\";\nsliderPair();",
    options: [
      option("minGap", "number", "0", "Smallest allowed distance between the handles; data-rm-min-gap."),
      option("label", "string", "\"Range\"", "Names the group and prefixes each handle's label."),
      option("unit", "string", "\"\"", "Appended to each value in the spoken readout, e.g. \"£\" or \"km\"."),
    ],
  },
  {
    name: "ratingSlider",
    category: "forms2",
    file: MOD_FORMS2,
    attribute: "data-rm-rating-slider",
    summary: "Stars drawn over a real slider, so the keyboard works.",
    notes:
      "Star ratings are nearly always a row of buttons or, worse, spans with click handlers, and then somebody bolts arrow keys back on badly. A range input already has arrow keys, Home and End, a draggable touch target and a value that posts with the form, so the stars here are painted on top of one rather than replacing it. The filled row is revealed with clip-path, which costs no layout, and a third faint row previews a hovered value — as its own layer, because clipping the dim row for the preview makes the unrated stars vanish, which is the bug you see in most implementations. aria-valuetext carries the sentence, \"4 out of 5, Great\", since aria-valuenow alone announces a bare number that means nothing in a form full of them. The preview layer is deliberately pointer-only: a pointer has to hover somewhere before it commits, whereas an arrow key commits the value outright, so the lit row and the spoken sentence follow it directly and there is nothing left to preview. Only the star that just lit up pops; a whole row bouncing on every arrow press is noise.",
    example: "<input type=\"range\" data-rm-rating-slider min=\"0\" max=\"5\" step=\"1\" value=\"3\">",
    usage: "import { ratingSlider } from \"@soyrageagency/rage-motion\";\nratingSlider();",
    options: [
      option("label", "string", "\"Rating\"", "Used as the input's accessible name when it has none."),
      option("words", "string[]", "[\"Not rated\",\"Poor\",\"Fair\",\"Good\",\"Great\",\"Excellent\"]", "Spread over the scale; also as a comma list in data-rm-words."),
      option("scale", "number", "the input's max, or 5", "How many stars, via data-rm-scale."),
    ],
  },
  {
    name: "colourField",
    category: "forms2",
    file: MOD_FORMS2,
    attribute: "data-rm-colour",
    summary: "A real colour input with a drawn swatch behind it.",
    notes:
      "input[type=color] renders differently in every browser and cannot be styled, so the standard response is display: none on the input and a div people click instead — which removes the only element on the page that opens the operating system's colour picker from the keyboard. Here the input keeps its full box and its focus and is simply made transparent, with the swatch painted underneath and the ring driven by :focus-within, so Tab and then Enter still open the real picker. The hex value is printed on the swatch and its ink colour is chosen from the swatch's own Rec. 709 luminance, so it stays legible on black and on yellow alike. It reaches assistive technology through aria-describedby rather than aria-label, because a label would override the wrapping <label> and leave a visible word such as Accent out of the accessible name entirely — a WCAG 2.5.3 failure that stops voice control dead. The announcement is bound to change rather than input, because dragging inside a picker fires hundreds of input events and a live region attached to them is unusable.",
    example: "<label data-rm-colour>Accent <input type=\"color\" value=\"#e0533d\"></label>",
    usage: "import { colourField } from \"@soyrageagency/rage-motion\";\ncolourField();",
    options: [
      option("label", "string", "\"Colour\"", "Prefixes the spoken value."),
      option("format", "\"hex\" | \"rgb\"", "\"hex\"", "How the value is written on the swatch; an unknown value falls back to hex."),
    ],
  },
  {
    name: "dateField",
    category: "forms2",
    file: MOD_FORMS2,
    attribute: "data-rm-date-field",
    summary: "A real date input with a drawn calendar face beside it.",
    notes:
      "Hand-built calendars are the most expensive accessibility mistake in forms: a grid of divs with no role=\"grid\", no arrow-key navigation, no month announcement, and no way to simply type a date you already know. input[type=date] has all of that, localised, plus the platform picker on a phone, so the input is left exactly as the browser made it and only a small card is drawn next to it. The card is aria-hidden decoration; the real work is a polite live region that reads the value back in full — \"Friday, 3 October 2025\" — which catches a transposed day and month before submission rather than after. The date is built from its parts rather than passed to new Date(), because a bare ISO date is parsed as UTC and lands on the previous day for anyone west of Greenwich. The card's top sheet turns on rotateX, a transform on a fixed box that moves nothing around it.",
    example: "<label data-rm-date-field>Delivery <input type=\"date\"></label>",
    usage: "import { dateField } from \"@soyrageagency/rage-motion\";\ndateField();",
    options: [
      option("label", "string", "\"Date\"", "Prefixes the spoken date."),
      option("format", "\"full\" | \"long\" | \"medium\" | \"short\"", "\"long\"", "dateStyle for the readout; anything else falls back to long."),
      option("locale", "string", "the browser's", "A BCP 47 tag for the readout, via data-rm-locale."),
    ],
  },
  {
    name: "signaturePad",
    category: "forms2",
    file: MOD_FORMS2,
    attribute: "data-rm-signature",
    summary: "Draw a signature with a pointer, or type your name instead.",
    notes:
      "A canvas you sign with a finger is inherently pointer-only, and shipping one alone excludes everyone using a keyboard, a switch or a screen reader. The answer is not a warning but a second, equal route: a real labelled text input that renders the typed name into the same canvas in the same hand, so both paths produce the same artefact and neither is the apology version. Drawing is coalesced — pointer moves are collected and flushed once per frame through the shared rAF, using getCoalescedEvents so a stylus reporting at 240Hz gives every sample without 240 paints a second — and the loop runs only while the pad is on screen. A ResizeObserver rescales the bitmap by the device pixel ratio and repaints the stored strokes, which is the difference between a crisp line and a blurred one on every phone of the last decade. Strokes are smoothed with quadratic curves through the midpoints, because a polyline of raw samples looks like a seismograph rather than a name.",
    example: "<div data-rm-signature data-rm-pen=\"#1b1b1b\"></div>",
    usage: "import { signaturePad } from \"@soyrageagency/rage-motion\";\nsignaturePad();",
    options: [
      option("label", "string", "\"Signature\"", "Names the group."),
      option("ink", "colour", "\"#1b1b1b\"", "The stroke colour; data-rm-pen."),
      option("weight", "number", "2.4", "Stroke width in CSS pixels; data-rm-weight."),
    ],
  },
  {
    name: "switchRow",
    category: "forms2",
    file: MOD_FORMS2,
    attribute: "data-rm-switch-row",
    summary: "A labelled switch row that is a real checkbox.",
    notes:
      "The switch is the control most often faked, and faking it costs more than it appears: a div with role=\"switch\" and a click handler does not submit with the form, does not respond to its own label being clicked, does not restore on a back navigation, and usually forgets that Space has to toggle it. This is a genuine input[type=checkbox] given role=\"switch\", which is the one substitution the specification actually blesses, with aria-checked kept in step for engines that lag. The state is written as a word beside the track as well as drawn, because a switch read only from the position of its knob has no label for anyone who cannot see the knob. The knob travels on translateX inside a fixed track, so nothing in the row reflows as it moves, and because the whole row lives inside the label the tap target is the row rather than a fourteen-pixel circle.",
    example: "<label data-rm-switch-row data-rm-on=\"On\" data-rm-off=\"Off\"><input type=\"checkbox\"> Email me about updates</label>",
    usage: "import { switchRow } from \"@soyrageagency/rage-motion\";\nswitchRow();",
    options: [
      option("on", "string", "\"On\"", "The word shown when checked; data-rm-on."),
      option("off", "string", "\"Off\"", "The word shown when unchecked; data-rm-off."),
      option("duration", "number", "260", "How long the knob takes to travel. Zero under reduced motion."),
    ],
  },
  {
    name: "quantityStepper",
    category: "forms2",
    file: MOD_FORMS2,
    attribute: "data-rm-quantity",
    summary: "Plus and minus around a real number input.",
    notes:
      "Keeping input[type=number] is what makes this work on a phone, since it is the reason the numeric keypad appears, and what makes it work from a keyboard, since the up and down arrows already step it — the buttons exist for the thumb, not instead of the field. They are real button[type=button] elements, because inside a form a bare button submits it, which is how a quantity control ends up placing an order. min, max and step are read from the input itself rather than from data attributes, so the browser's validation and the component can never disagree about the bounds. Holding a button repeats with acceleration and a slow first beat, so a single deliberate press does not overshoot, while keyboard activation is detected by the click's zero detail and gets exactly one clean step. Every change dispatches real input and change events, so anything else bound to the field hears about it, and the value is announced politely with \"minimum\" or \"maximum\" appended so the reason a button stopped working is spoken rather than only drawn in grey.",
    example: "<div data-rm-quantity><label for=\"qty\">Quantity</label><input id=\"qty\" type=\"number\" min=\"1\" max=\"9\" value=\"1\"></div>",
    usage: "import { quantityStepper } from \"@soyrageagency/rage-motion\";\nquantityStepper();",
    options: [
      option("label", "string", "\"Quantity\"", "Names the group and both buttons."),
      option("delay", "number", "420", "Pause before a held button starts repeating; data-rm-hold."),
      option("repeat", "number", "110", "Fastest interval the repeat accelerates to; data-rm-repeat."),
    ],
  },
  {
    name: "consentBox",
    category: "forms2",
    file: MOD_FORMS2,
    attribute: "data-rm-consent",
    summary: "A checkbox that unlocks once the terms have actually been reached.",
    notes:
      "The scroll-to-agree gate is normally one line — unlock when scrollTop plus clientHeight reaches scrollHeight — and that line locks out everybody who never scrolls. A screen reader reads a panel by moving a virtual cursor, a switch user tabs through it, and neither necessarily moves the scrollbar at all, so they reach the end of the terms with the checkbox still disabled and no way to discover why. This opens the gate on either of two signals: an end marker becoming visible inside the panel, or that same marker taking focus, and the marker is a real focusable sentence so tabbing works as reliably as dragging. The panel itself gets tabindex=\"0\" so it can be scrolled from the keyboard, a role and a label, and the \"more below\" hint is a mask on the same box rather than a size change, so unlocking never nudges the page. Set data-rm-reach=\"open\" to keep the terms readable without gating the checkbox at all.",
    example: "<div data-rm-consent><div data-rm-consent-terms>…the terms…</div><label><input type=\"checkbox\"> I agree</label></div>",
    usage: "import { consentBox } from \"@soyrageagency/rage-motion\";\nconsentBox();",
    options: [
      option("terms", "selector", "\"[data-rm-consent-terms]\"", "The scrollable panel; falls back to the first child."),
      option("label", "string", "\"Terms and conditions\"", "Names the terms region."),
      option("reach", "\"scroll\" | \"open\"", "\"scroll\"", "Whether the checkbox is gated at all; an unknown value falls back to scroll."),
      option("locked", "string", "\"Read to the end of the terms to continue.\"", "The note describing the field while it is locked; data-rm-locked-note."),
    ],
  },
  {
    name: "formProgress",
    category: "forms2",
    file: MOD_FORMS2,
    attribute: "data-rm-form-progress",
    summary: "Multi-step progress drawn over real fieldsets.",
    notes:
      "Steps are fieldset elements with a legend, which is not decoration: the legend names the group to a screen reader and is what this reads to build the progress bar's aria-valuetext, so \"Step 2 of 4, Delivery\" is announced instead of a bare 50%. Inactive steps are genuinely hidden and inert, so nobody tabs into a step they have not reached — though neither attribute exempts their fields from constraint validation, since only disabled, readonly and a few barred input types do. Each step is therefore validated on the way out by rmNext(), and a form with required fields spread across steps should be paired with errorSummary(), which switches the native submit-time check off; without it a submit from the last step can fail on an empty field in a hidden earlier one, and since the browser cannot focus what it cannot show the submit dies with the reason in the console and nothing on screen. The markers are a roving tabindex group — one Tab stop for the whole journey, arrows and Home and End along it, aria-current=\"step\" on the one you are on — and steps ahead stay focusable but aria-disabled, because seeing how far there is to go is the point of a progress indicator and a marker you cannot land on tells you nothing. Steps are different heights, so the tallest is measured once at mount while everything is still in the layout and that height is reserved; animating the height on every move is how these normally make the page jump.",
    example: "<form data-rm-form-progress><fieldset data-rm-form-step><legend>Details</legend>…</fieldset><fieldset data-rm-form-step><legend>Delivery</legend>…</fieldset></form>",
    usage: "import { formProgress } from \"@soyrageagency/rage-motion\";\nformProgress();",
    options: [
      option("step", "selector", "\"[data-rm-form-step]\"", "The fieldsets that make up the journey."),
      option("label", "string", "\"Progress\"", "Names the marker group and the progress bar."),
      option("duration", "number", "360", "How long an arriving step takes to settle; data-rm-duration."),
    ],
  },
  {
    name: "errorSummary",
    category: "forms2",
    file: MOD_FORMS2,
    attribute: "data-rm-error-summary",
    summary: "A list of errors at the top of the form that links to each field.",
    notes:
      "This is the single most useful accessibility pattern in forms and the one most often left out: colouring six fields red says only that something is wrong somewhere below the fold, whereas a summary says what, how many, and takes you there. Each entry is a real anchor to the field's id, so it works before any script has run, and the click handler exists only to land focus on the field rather than merely scrolling near it — for a radio group it targets the first radio, which is the thing that is actually focusable. The summary takes focus when it appears and is deliberately not role=\"alert\": doing both makes a screen reader read the whole list twice, once as an interruption and once on arrival, which is why the pattern has a reputation for being noisy. Each failing field gets aria-invalid and an aria-describedby pointing at its own line in the list, and native validation is switched off while mounted — the browser's bubble shows one field at a time, vanishes on the next keypress and cannot be read back — then restored exactly as it was on cleanup.",
    example: "<div data-rm-error-summary=\"signup\"></div><form id=\"signup\">…</form>",
    usage: "import { errorSummary } from \"@soyrageagency/rage-motion\";\nerrorSummary();",
    options: [
      option("heading", "string", "\"There is a problem\"", "The summary's heading; data-rm-heading."),
      option("label", "string", "\"Errors\"", "Names the summary region."),
    ],
  },

  // ── Profile and identity ──
  {
    name: "avatar",
    category: "profile",
    file: MOD_PROFILE,
    attribute: "data-rm-avatar",
    summary: "An avatar that draws initials from the name first and lays the picture over them.",
    notes:
      "The initials are not a fallback swapped in after a failure; they are rendered first and the image is composited on top, so a slow network shows a legible circle and a 404 simply never covers it. The tone is a hash of the name rather than a random colour, which is what makes the same person recognisable across a page even before their photograph loads. The wrapper carries the name once as role=\"img\" with an aria-label and the inner img is given an empty alt, so nobody hears the name twice. The usual version is a background-image on a div, which has no alt text, no error event to react to, and leaves an anonymous grey disc when the URL is wrong.",
    example: "<span data-rm-avatar=\"/faces/nora.jpg\" data-rm-name=\"Nora Vale\" data-rm-size=\"64\"></span>",
    usage: "import { avatar } from \"@soyrageagency/rage-motion\";\navatar();",
    options: [
      option("size", "number", "48", "Diameter in pixels, or data-rm-size per avatar."),
      option("name", "string", "\"Unnamed person\"", "Used for the accessible name, the initials and the colour; data-rm-name per avatar."),
      option("duration", "number", "320", "Crossfade of the picture over the initials once it loads."),
      option("tones", "number", "4", "How many swatches the name hash chooses between."),
    ],
  },
  {
    name: "avatarUpload",
    category: "profile",
    file: MOD_PROFILE,
    attribute: "data-rm-avatar-upload",
    summary: "A picture you can drop in, or choose with a real button.",
    notes:
      "The drop zone is the flourish and the button is how most people will actually do it, so the control is a real <button type=\"button\"> driving a real file input rather than a div with a drop listener — that version cannot be operated from a keyboard at all, which is the commonest bug in an upload control. The file input is deliberately taken out of the tab order and hidden from assistive technology, because leaving both it and the button reachable gives one job two stops and no way to tell them apart. The preview is a fixed square that exists before anything is chosen, so accepting a file crossfades a source instead of inserting an element and shoving the rest of the form down the page. Both outcomes are announced: a chosen file politely, a rejected non-image assertively with the reason and the formats that would work.",
    example: "<div data-rm-avatar-upload data-rm-name=\"Nora Vale\" data-rm-size=\"120\"></div>",
    usage: "import { avatarUpload } from \"@soyrageagency/rage-motion\";\navatarUpload();",
    options: [
      option("label", "string", "\"Choose a picture\"", "Button text; data-rm-label per element."),
      option("accept", "string", "\"image/*\"", "Accepted types; data-rm-accept per element."),
      option("size", "number", "96", "Preview diameter in pixels; data-rm-size per element."),
    ],
  },
  {
    name: "profileCard",
    category: "profile",
    file: MOD_PROFILE,
    attribute: "data-rm-profile-card",
    summary: "A profile card that opens in place with a measured FLIP rather than a guessed height.",
    notes:
      "Opening measures the card, un-hides the detail, measures again, and plays the difference back as a transform, so the browser lays the card out exactly once and the animation itself costs nothing. The children are moved into one inner element purely so it can carry the inverse scale — without that counter-scale a card growing 1.6× stretches the name inside it like a funhouse mirror on the way open. The alternative everyone reaches for, transitioning max-height, has to invent a number larger than the content, so it either clips somebody's job title or spends the first half of the animation travelling through empty space. The detail panel is closed from JavaScript with the hidden property, never from CSS, so with the script removed the whole card is simply readable.",
    example: "<article data-rm-profile-card>\n  <h3>Nora Vale</h3>\n  <div data-rm-card-detail>Field recordist. Rivers, mostly.</div>\n</article>",
    usage: "import { profileCard } from \"@soyrageagency/rage-motion\";\nprofileCard();",
    options: [
      option("detail", "string", "\"[data-rm-card-detail]\"", "Selector for the part that appears when the card opens."),
      option("toggle", "string", "\"[data-rm-card-toggle]\"", "Your own toggle button; one is created if there isn't one."),
      option("duration", "number", "520", "Length of the FLIP."),
      option("open", "string", "\"More about this person\"", "Toggle label when closed; data-rm-label per card."),
      option("close", "string", "\"Less\"", "Toggle label when open."),
    ],
  },
  {
    name: "profileHeader",
    category: "profile",
    file: MOD_PROFILE,
    attribute: "data-rm-profile-header",
    summary: "A cover that drifts on scroll behind an avatar that barely moves.",
    notes:
      "Two layers on one scroll position at different rates, both driven by transform, which is the whole of what parallax honestly is. The cover is overscaled by exactly the distance it will travel before it moves at all, so no empty strip can appear at its edge — that flickering line is the giveaway of every banner built by transforming an image that fits its frame exactly. The per-frame work goes through the shared rAF loop and only runs while the header is on screen, so scrolling to the bottom of a long profile costs nothing. Under reduced motion no listener is attached at all and both layers sit exactly where they belong, fully visible.",
    example: "<header data-rm-profile-header data-rm-name=\"Nora Vale\" data-rm-depth=\"56\">\n  <img data-rm-header-cover src=\"/covers/river.jpg\" alt=\"Plate one\">\n  <span data-rm-avatar=\"/faces/nora.jpg\" data-rm-name=\"Nora Vale\"></span>\n</header>",
    usage: "import { profileHeader } from \"@soyrageagency/rage-motion\";\nprofileHeader();",
    options: [
      option("cover", "string", "\"[data-rm-header-cover]\"", "Selector for the image behind everything."),
      option("face", "string", "\"[data-rm-avatar]\"", "Selector for the avatar that counter-drifts."),
      option("depth", "number", "48", "Pixels the cover travels; data-rm-depth per header."),
      option("lift", "number", "14", "Pixels the avatar travels the other way; data-rm-lift per header."),
    ],
  },
  {
    name: "userMenu",
    category: "profile",
    file: MOD_PROFILE,
    attribute: "data-rm-user-menu",
    summary: "A real menu hanging off an avatar, complete from the keyboard.",
    notes:
      "The full menu pattern rather than a styled dropdown: aria-haspopup on the trigger, role=\"menu\" on the list, every item a menuitem at tabindex -1 with the arrows moving focus, Home and End at the ends, and first-letter typeahead walking forward through matches. Escape closes it and puts focus back on the avatar, and Tab moves focus to the trigger before hiding the menu so the browser's own Tab carries on out from there rather than restarting at the top of the document, which is what hiding an ancestor of the focused element does. Any li wrapping a menu item is given role=\"none\" first, because a menu may only own menuitems and an intervening listitem quietly breaks the count of items the menu reports. Opening grows the panel from its top-right corner, the corner it is attached to, so the motion agrees with the geometry instead of arriving from nowhere. The div-with-a-class version announces nothing, cannot be driven by keyboard at all, and leaves focus stranded on the page when it closes.",
    example: "<div data-rm-user-menu data-rm-label=\"Nora Vale's account\">\n  <button type=\"button\"><span data-rm-avatar data-rm-name=\"Nora Vale\"></span></button>\n  <ul data-rm-menu-list>\n    <li><a href=\"/profile\">Profile</a></li>\n    <li><button type=\"button\">Sign out</button></li>\n  </ul>\n</div>",
    usage: "import { userMenu } from \"@soyrageagency/rage-motion\";\nuserMenu();",
    options: [
      option("list", "string", "\"[data-rm-menu-list]\"", "Selector for the menu; falls back to the trigger's next sibling."),
      option("duration", "number", "220", "Length of the open animation."),
      option("label", "string", "\"Account menu\"", "Accessible name for the trigger and the menu; data-rm-label per element."),
    ],
  },
  {
    name: "accountSwitcher",
    category: "profile",
    file: MOD_PROFILE,
    attribute: "data-rm-account-switcher",
    summary: "A listbox of accounts with a mark that slides from the old one to the new.",
    notes:
      "A listbox rather than a menu, because one of the accounts is always the current answer and aria-selected is the attribute that says so — a menu of commands cannot express a current state. The mark showing which account is live is one element translated between rows, not a tick drawn in every row and cross-faded, which throws away the one thing the movement exists to explain: that the selection went from there to here. Arrows, Home, End, Enter, Space and Escape all behave the way the platform listbox behaves, and focus returns to the trigger when it closes. Switching is announced through a polite live region and rewrites the trigger's own text, because changing somebody's account under them without saying so is how people post from the wrong one — and a button still reading the old name is the loudest way of not saying so. The text it rewrites is a span with the class rm-account-switcher-face: write one yourself to keep the name beside an avatar, or leave it out and whatever the button already says gets wrapped in one on mount and unwrapped again on teardown.",
    example: "<div data-rm-account-switcher>\n  <button type=\"button\"><span class=\"rm-account-switcher-face\">Nora Vale</span></button>\n  <ul data-rm-account-list>\n    <li data-rm-account=\"nora\" aria-selected=\"true\">Nora Vale</li>\n    <li data-rm-account=\"riverlog\">Riverlog Studio</li>\n  </ul>\n</div>",
    usage: "import { accountSwitcher } from \"@soyrageagency/rage-motion\";\naccountSwitcher();",
    options: [
      option("list", "string", "\"[data-rm-account-list]\"", "Selector for the list of accounts."),
      option("option", "string", "\"[data-rm-account]\"", "Selector for one account row."),
      option("duration", "number", "320", "How long the mark takes to travel between rows."),
      option("label", "string", "\"Switch account\"", "Accessible name for the listbox; data-rm-label per element."),
    ],
  },
  {
    name: "presenceRing",
    category: "profile",
    file: MOD_PROFILE,
    attribute: "data-rm-presence-ring",
    summary: "A status ring around an avatar that also says the status in a word.",
    notes:
      "The ring and the pulse are separate layers over the avatar, so the pulse scales a ring and never the face — an indicator that makes somebody's photograph throb is one you learn to look away from. Only the genuinely live states pulse; away and offline are still, and that stillness is itself information. The word is always rendered as real text inside the element, visually hidden by default because a ring is a compact thing, so what gets announced is \"Nora Vale, online\" rather than a name and a colour nobody mentioned; data-rm-word=\"visible\" promotes it to a caption. An unrecognised state falls back to the default rather than becoming a class nobody wrote any CSS for.",
    example: "<span data-rm-presence-ring=\"online\" data-rm-name=\"Nora Vale\">\n  <span data-rm-avatar=\"/faces/nora.jpg\" data-rm-name=\"Nora Vale\"></span>\n</span>",
    usage: "import { presenceRing } from \"@soyrageagency/rage-motion\";\npresenceRing();",
    options: [
      option("state", "string", "\"online\"", "online, away, busy or offline; the value of data-rm-presence-ring wins."),
      option("words", "object", "{}", "Override the word rendered for any state, for translation."),
    ],
  },
  {
    name: "followButton",
    category: "profile",
    file: MOD_PROFILE,
    attribute: "data-rm-follow",
    summary: "Follow, following and unfollow-on-hover as one state machine that announces itself.",
    notes:
      "All three labels live in the same grid cell, stacked, so the button is as wide as its widest word from the moment it mounts and switching states changes nothing but opacity; the version that sets textContent resizes, and a row of profile cards visibly reflows every time anybody follows anyone. State is carried by aria-pressed on a button whose accessible name never changes, which is the pattern screen readers announce correctly — swapping the name under a focused control means a reader describing a different button than the one being pressed. The \"Unfollow\" that appears on hover or focus is purely visual; pressing is still the same toggle, so nobody ends up with two meanings for one press. The result goes out through a polite live region, so no one has to press it a second time to discover what the first press did.",
    example: "<button type=\"button\" data-rm-follow=\"no\" data-rm-name=\"Nora Vale\">Follow</button>",
    usage: "import { followButton } from \"@soyrageagency/rage-motion\";\nfollowButton();",
    options: [
      option("follow", "string", "\"Follow\"", "Label when not following; data-rm-follow-word per button."),
      option("following", "string", "\"Following\"", "Label when following; data-rm-following-word per button."),
      option("unfollow", "string", "\"Unfollow\"", "Label shown on hover or focus while following; data-rm-unfollow-word per button."),
      option("name", "string", "\"this person\"", "Who is being followed, for the name and the announcement; data-rm-name per button."),
      option("duration", "number", "260", "Label change and press feedback."),
      option("onChange", "function", "undefined", "Called with (following, button) after every toggle."),
    ],
  },
  {
    name: "bioReveal",
    category: "profile",
    file: MOD_PROFILE,
    attribute: "data-rm-bio",
    summary: "A bio that opens to whatever height it happens to be.",
    notes:
      "grid-template-rows from 0fr to 1fr is the only honest way to transition to a height nobody can know in advance: the browser interpolates the track, so the text is never clipped at a guessed max-height and the paragraph can be any length at any width. It is the one place in this module where a box genuinely changes size, which is deliberate — a disclosure is supposed to move the page beneath it, unlike a toast or a tab. While closed the body is inert, so a link inside a bio nobody can see is not a focus stop somebody tabs into and gets lost in; that mismatch between what is visible and what is focusable is the usual bug in a collapsed region. aria-expanded and aria-controls tie the button to the region, and with the script removed the bio is simply a paragraph.",
    example: "<div data-rm-bio data-rm-label=\"Read Nora's bio\">\n  <p>Nora Vale has been recording rivers since 2016. Mostly at dawn.</p>\n</div>",
    usage: "import { bioReveal } from \"@soyrageagency/rage-motion\";\nbioReveal();",
    options: [
      option("open", "string", "\"Read full bio\"", "Button label while collapsed; data-rm-label per element."),
      option("close", "string", "\"Show less\"", "Button label while expanded."),
      option("duration", "number", "420", "Length of the open, set to zero under reduced motion."),
    ],
  },
  {
    name: "socialRow",
    category: "profile",
    file: MOD_PROFILE,
    attribute: "data-rm-social",
    summary: "A row of icon links that are not anonymous squares to anything reading the page.",
    notes:
      "Every link is given a name built from the network and the person — \"Nora Vale on Mastodon\" — because a row of icon links with no text is, to a screen reader, a row of links called \"link\", which is the most common accessibility failure on a profile page. Anything opening in a new tab says so in its own name and gets rel=\"noopener noreferrer\", which is the security half of the same courtesy. The lift happens identically on focus and on hover, so keyboard users get the same feedback rather than none at all, and the row plays in with a small stagger the first time it is scrolled to. An author's own icon markup is never touched; only an empty link gets a neutral mark, because brand glyphs are somebody else's trademark and not ours to ship.",
    example: "<ul data-rm-social data-rm-name=\"Nora Vale\">\n  <li><a href=\"https://example.org/@nora\" data-rm-network=\"Mastodon\" target=\"_blank\"></a></li>\n  <li><a href=\"https://example.com/nora\" data-rm-network=\"Riverlog\"></a></li>\n</ul>",
    usage: "import { socialRow } from \"@soyrageagency/rage-motion\";\nsocialRow();",
    options: [
      option("name", "string", "\"this person\"", "Whose links these are; data-rm-name on the row."),
      option("duration", "number", "420", "Entrance length per link."),
      option("stagger", "number", "60", "Milliseconds between links arriving."),
      option("label", "string", "\"Elsewhere\"", "Accessible name for the row; data-rm-label on the row."),
    ],
  },
  {
    name: "statsRow",
    category: "profile",
    file: MOD_PROFILE,
    attribute: "data-rm-stats",
    summary: "Followers and posts counting up, with the real figures never leaving the page.",
    notes:
      "The final figure is written as an aria-label and as hidden text before a single frame runs, and the counting digits are aria-hidden, so a screen reader hears \"12,480 followers\" once instead of every intermediate number on the way there. That is the bug in nearly every count-up on the web: it is a slot machine wired straight into a live region. The digits are set in tabular figures so the row does not jitter as the numbers change width, the count runs on the shared frame loop only while the row is on screen, and it counts once — scrolling back to a stat that has already arrived must not send it to zero, because the number is a fact rather than a loop. Under reduced motion the figures are simply there, formatted in the visitor's own locale by Intl.NumberFormat.",
    example: "<dl data-rm-stats>\n  <div><dt>Followers</dt><dd data-rm-stat-value>12480</dd></div>\n  <div><dt>Recordings</dt><dd data-rm-stat-value data-rm-suffix=\"+\">318</dd></div>\n</dl>",
    usage: "import { statsRow } from \"@soyrageagency/rage-motion\";\nstatsRow();",
    options: [
      option("value", "string", "\"[data-rm-stat-value]\"", "Selector for the figure inside each stat."),
      option("duration", "number", "1200", "Length of the count; data-rm-duration on the row."),
      option("stagger", "number", "120", "Milliseconds between one figure starting and the next."),
    ],
  },
  {
    name: "badgeRow",
    category: "profile",
    file: MOD_PROFILE,
    attribute: "data-rm-badges",
    summary: "Achievement badges with real titles instead of mystery pictures.",
    notes:
      "Each badge becomes a real button carrying its title as its accessible name, so the caption appears on focus exactly as it does on hover and the whole row can be tabbed through — an achievement whose meaning only exists in a tooltip is an achievement most people never learn. The caption is absolutely positioned, so revealing it never pushes the badges around, and the title is in the markup whether or not anybody hovers anything. Locked badges are desaturated with a filter and also say \"locked\" in their name, because grey and colour are the same badge to a good number of people. The entrance pops each badge in on a spring with a stagger the first time the row is scrolled to, and under reduced motion they are simply present.",
    example: "<ul data-rm-badges>\n  <li data-rm-title=\"Thousand rivers\">🏅</li>\n  <li data-rm-title=\"Dawn chorus\" data-rm-locked=\"yes\">🌅</li>\n</ul>",
    usage: "import { badgeRow } from \"@soyrageagency/rage-motion\";\nbadgeRow();",
    options: [
      option("duration", "number", "460", "Entrance length per badge."),
      option("stagger", "number", "70", "Milliseconds between badges arriving."),
      option("label", "string", "\"Achievements\"", "Accessible name for the row; data-rm-label on the row."),
    ],
  },
  {
    name: "profileTabs",
    category: "profile",
    file: MOD_PROFILE,
    attribute: "data-rm-profile-tabs",
    summary: "A real tablist over the sections of a profile, with an underline that translates.",
    notes:
      "The complete pattern: role=\"tablist\", exactly one tab at tabindex 0 with the rest at -1, arrows moving both focus and selection, Home and End at the ends, and each panel tied to its tab in both directions with aria-controls and aria-labelledby. The underline is one element moved with translateX and scaleX from a fixed base width, because animating left and width is layout and would reflow the whole strip on every frame of what is only a decoration. Panels are hidden with the hidden property from JavaScript rather than a CSS rule, so with the script removed every section of the profile is simply on the page. A ResizeObserver re-measures the bar when the strip changes size, which is what stops the underline drifting off its tab after a font loads or the window narrows.",
    example: "<div data-rm-profile-tabs>\n  <div data-rm-profile-tablist>\n    <button type=\"button\" data-rm-profile-tab aria-selected=\"true\">Recordings</button>\n    <button type=\"button\" data-rm-profile-tab>About</button>\n  </div>\n  <section data-rm-profile-panel>…</section>\n  <section data-rm-profile-panel>…</section>\n</div>",
    usage: "import { profileTabs } from \"@soyrageagency/rage-motion\";\nprofileTabs();",
    options: [
      option("list", "string", "\"[data-rm-profile-tablist]\"", "Selector for the strip that becomes the tablist."),
      option("tab", "string", "\"[data-rm-profile-tab]\"", "Selector for each tab."),
      option("panel", "string", "\"[data-rm-profile-panel]\"", "Selector for each panel, in the same order as the tabs."),
      option("duration", "number", "380", "Underline travel and panel crossfade."),
      option("label", "string", "\"Profile sections\"", "Accessible name for the tablist; data-rm-label per element."),
      option("base", "number", "100", "Base width in pixels the underline is scaled from."),
    ],
  },
  {
    name: "coverParallax",
    category: "profile",
    file: MOD_PROFILE,
    attribute: "data-rm-cover",
    summary: "A cover image with depth and no edge ever exposed.",
    notes:
      "The image is scaled by precisely the distance it is going to travel before it moves at all, which is the whole trick — a cover transformed at its natural size slides a strip of background in at one edge, and every parallax banner that flashes a pale line as you scroll past it has skipped this arithmetic. There is no scroll listener: the box is read once per frame inside the shared rAF loop, and that loop only runs while the frame is on screen and the tab is in front, so a page of covers does not burn a battery in the background. The write is a single translate3d, so the browser composites it without touching layout. Under reduced motion nothing is attached at all and the cover sits still and fully visible, which is the finished state rather than a suppressed one.",
    example: "<div data-rm-cover data-rm-depth=\"60\"><img src=\"/covers/river.jpg\" alt=\"Plate one\"></div>",
    usage: "import { coverParallax } from \"@soyrageagency/rage-motion\";\ncoverParallax();",
    options: [
      option("image", "string", "\"img\"", "Selector for the image inside the frame."),
      option("depth", "number", "60", "Pixels of travel; data-rm-depth per cover."),
    ],
  },
  {
    name: "identityChip",
    category: "profile",
    file: MOD_PROFILE,
    attribute: "data-rm-identity",
    summary: "A compact user pill that reveals a card when you hover or focus it.",
    notes:
      "The card is absolutely positioned above the chip inside a wrapper the component adds, so revealing it moves nothing in the sentence or table row the chip sits in — the version that expands the pill itself reflows every line around it and pushes the thing you were about to click. Keeping the card a sibling rather than a child matters as much as the positioning: a chip is usually a link, a link's accessible name is computed from its contents, and a card inside it would rename the link to the whole card the moment it opened while aria-describedby read that same text out again. It opens on hover and on focus on the same delay and closes on Escape, because a hovercard that only answers to a pointer is information keyboard users are simply never given. The card is referenced by aria-describedby, which works perfectly well on a hidden element outside the link, so the detail belongs to the chip's description whether or not it is on screen. The initials disc uses the same name hash as the avatar, so one person is one colour everywhere on the page.",
    example: "<a data-rm-identity href=\"/nora\" data-rm-name=\"Nora Vale\" data-rm-handle=\"@nora\" data-rm-note=\"Field recordist, Lisbon\">Nora Vale</a>",
    usage: "import { identityChip } from \"@soyrageagency/rage-motion\";\nidentityChip();",
    options: [
      option("delay", "number", "180", "Milliseconds before the card appears, on both hover and focus."),
      option("duration", "number", "220", "Length of the card's entrance."),
      option("name", "string", "\"Unnamed person\"", "Fallback name; data-rm-name per chip, with data-rm-handle and data-rm-note for the rest."),
    ],
  },

  // ── Scroll animation, the second set ──
  {
    name: "scrollCounter",
    category: "scroll2",
    file: MOD_SCROLL2,
    attribute: "data-rm-scroll-count",
    summary: "A figure that counts up as you scroll to it and keeps the value it reached.",
    notes:
      "The number is bound to scroll position rather than to a duration, so it cannot finish while it is still below the fold and cannot be caught halfway once you have read past it. It ratchets by default, because a statistic that runs backwards when you scroll up reads as a bug rather than as an effect; data-rm-rewind=\"yes\" opts into the two-way version. The usual implementation puts aria-live=\"polite\" on the digits themselves, which queues several hundred intermediate numbers for a screen reader to announce one at a time — here the digits are aria-hidden and only the settled total is announced, four hundred milliseconds after the last change. The digits sit on tabular figures so the box never twitches as glyph widths change, and under reduced motion the total is simply drawn at mount.",
    example: "<p data-rm-scroll-count data-rm-to=\"1240\" data-rm-suffix=\" projects\"></p>",
    usage: "import { scrollCounter } from \"@soyrageagency/rage-motion\";\nscrollCounter();",
    options: [
      option("from", "number", "0", "Value at the start of the band (data-rm-from)."),
      option("to", "number", "100", "Value at the end of the band (data-rm-to)."),
      option("decimals", "number", "0", "Fraction digits, 0 to 6 (data-rm-decimals)."),
      option("prefix", "string", "\"\"", "Text before the figure, such as a currency mark (data-rm-prefix)."),
      option("suffix", "string", "\"\"", "Text after the figure, such as a unit (data-rm-suffix)."),
      option("rewind", "\"yes\" | \"no\"", "\"no\"", "Whether the figure may count back down (data-rm-rewind)."),
      option("start", "number", "0.92", "Viewport fraction where counting begins, 1 is the bottom edge (data-rm-start)."),
      option("end", "number", "0.45", "Viewport fraction where the total is reached (data-rm-end)."),
    ],
  },
  {
    name: "scrollRotate",
    category: "scroll2",
    file: MOD_SCROLL2,
    attribute: "data-rm-scroll-rotate",
    summary: "An element that turns upright as it climbs to reading height.",
    notes:
      "It starts tilted and finishes square, which is the only sensible way round: the resting state is the finished state, so reduced motion, a missing IntersectionObserver and a fast flick past all land on a page that looks typeset rather than knocked askew. Effects that end rotated leave a card somebody has to read at an angle for as long as they sit there. The turn is a transform, so no reflow can be triggered by it and neighbours never move. data-rm-axis swaps the flat rotation for a hinge on x or y, with the perspective written into the element's own transform rather than expected on a parent the author may not have.",
    example: "<figure data-rm-scroll-rotate data-rm-angle=\"-12\">…</figure>",
    usage: "import { scrollRotate } from \"@soyrageagency/rage-motion\";\nscrollRotate();",
    options: [
      option("angle", "number", "10", "Degrees of tilt at the start of the band (data-rm-angle)."),
      option("axis", "\"x\" | \"y\" | \"z\"", "\"z\"", "Flat turn, or a hinge on x or y with perspective (data-rm-axis)."),
      option("start", "number", "1", "Viewport fraction where the turn begins (data-rm-start)."),
      option("end", "number", "0.4", "Viewport fraction where it is upright (data-rm-end)."),
    ],
  },
  {
    name: "scrollScale",
    category: "scroll2",
    file: MOD_SCROLL2,
    attribute: "data-rm-scroll-scale",
    summary: "A block that grows into its own size as it enters the viewport.",
    notes:
      "Scale, never width and height: the element's layout box is unchanged throughout, so nothing around it reflows and each frame costs a composite instead of a full layout pass over everything below. The width-animated version is the one that stutters on a phone, because it relayouts the entire subtree sixty times a second for a purely visual effect. It ends at scale 1, so the rest state is the element at exactly the size the design specified and nothing is left permanently magnified. Set data-rm-origin when the block is anchored to an edge rather than centred, so it appears to grow out of the correct corner.",
    example: "<div data-rm-scroll-scale data-rm-from=\"0.88\">…</div>",
    usage: "import { scrollScale } from \"@soyrageagency/rage-motion\";\nscrollScale();",
    options: [
      option("from", "number", "0.9", "Scale at the start of the band (data-rm-from)."),
      option("origin", "\"left\" | \"centre\" | \"right\" | \"top\" | \"bottom\"", "\"center\"", "The point it grows from (data-rm-origin)."),
      option("start", "number", "0.95", "Viewport fraction where scaling begins (data-rm-start)."),
      option("end", "number", "0.45", "Viewport fraction where it reaches full size (data-rm-end)."),
    ],
  },
  {
    name: "scrollBlur",
    category: "scroll2",
    file: MOD_SCROLL2,
    attribute: "data-rm-scroll-blur",
    summary: "Focus pulled into sharpness as an image arrives on screen.",
    notes:
      "A filter on the element itself, ending at zero blur. Two things usually go wrong: reaching for backdrop-filter, which blurs everything painted behind the element and costs far more than blurring the element alone, and applying it to text, which is unreadable rather than atmospheric — so this is meant for media and the radius is capped where it stays cheap. Below a twentieth of a pixel the filter is dropped entirely rather than left at zero, because a filter that is doing nothing still keeps the element on its own compositing layer for the rest of the session. Remember that a filtered element becomes a containing block for fixed descendants, so nothing sticky should live inside one.",
    example: "<img data-rm-scroll-blur data-rm-blur=\"14\" src=\"/plate-01.jpg\" alt=\"…\">",
    usage: "import { scrollBlur } from \"@soyrageagency/rage-motion\";\nscrollBlur();",
    options: [
      option("blur", "number", "12", "Blur radius in pixels at the start, capped at 40 (data-rm-blur)."),
      option("start", "number", "1", "Viewport fraction where the blur begins to lift (data-rm-start)."),
      option("end", "number", "0.5", "Viewport fraction where it is sharp (data-rm-end)."),
    ],
  },
  {
    name: "scrollColour",
    category: "scroll2",
    file: MOD_SCROLL2,
    attribute: "data-rm-scroll-colour",
    summary: "A section that shifts its whole palette as you pass through it.",
    notes:
      "Two custom properties, a ground and an ink, are interpolated and written to the section once per frame; the stylesheet spends them, so one write drives the entire subtree including borders and rules, and any descendant opts in by naming the property rather than by being enumerated in JavaScript. Interpolating the ink alongside the ground is the part usually skipped, and skipping it is what turns a light-to-dark section into several seconds of near-black text on a near-black field. Colours are parsed from hex or rgb() and anything unparseable falls back to the defaults rather than writing rgb(NaN NaN NaN) and blanking the section. The stylesheet's fallbacks are the kit's tokens, so a section the script never reached still has a palette.",
    example: "<section data-rm-scroll-colour data-rm-from=\"#f7f3ec\" data-rm-to=\"#1b1b1b\" data-rm-ink-from=\"#1b1b1b\" data-rm-ink-to=\"#f7f3ec\">…</section>",
    usage: "import { scrollColour } from \"@soyrageagency/rage-motion\";\nscrollColour();",
    options: [
      option("from", "string", "\"#f6f1e7\"", "Ground colour at the top of the band (data-rm-from)."),
      option("to", "string", "\"#1c1b19\"", "Ground colour at the bottom (data-rm-to)."),
      option("inkFrom", "string", "\"#1c1b19\"", "Text colour at the top (data-rm-ink-from)."),
      option("inkTo", "string", "\"#f6f1e7\"", "Text colour at the bottom (data-rm-ink-to)."),
      option("start", "number", "0.85", "Viewport fraction where the shift begins (data-rm-start)."),
      option("end", "number", "0.15", "Viewport fraction where it completes (data-rm-end)."),
    ],
  },
  {
    name: "pinSteps",
    category: "scroll2",
    file: MOD_SCROLL2,
    attribute: "data-rm-pin-steps",
    summary: "A panel that pins while the scroll steps through its content one card at a time.",
    notes:
      "The section is tall, an inner stage is position: sticky, and scroll position picks the current step — the pin is CSS, so the scrollbar keeps meaning what it says and a resize cannot strand the panel, which is the failure mode of every position: fixed implementation. Steps that are not showing are inert as well as transparent, because a transparent step still holds its links in the tab order and sending focus somewhere invisible is how a keyboard visitor gets lost. The active step carries aria-current=\"step\" and a polite live region says \"Step 2 of 5\" once per change, which is discrete enough to announce without becoming chatter. Under reduced motion the stacking is abandoned entirely and the steps become an ordinary readable column, because a pile of absolutely positioned panels with one visible is an accessibility problem dressed as an effect.",
    example: "<section data-rm-pin-steps data-rm-travel=\"110\"><article>…</article><article>…</article></section>",
    usage: "import { pinSteps } from \"@soyrageagency/rage-motion\";\npinSteps();",
    options: [
      option("travel", "number", "90", "vh of scroll each step is given, so 90 is a little under one screen per step (data-rm-travel)."),
    ],
  },
  {
    name: "scrollDraw",
    category: "scroll2",
    file: MOD_SCROLL2,
    attribute: "data-rm-scroll-draw",
    summary: "An SVG path drawn stroke by stroke as the scroll advances.",
    notes:
      "The line is measured with getTotalLength() and revealed by moving stroke-dashoffset, a paint-only property: no geometry changes, nothing reflows, and the drawing is exact rather than approximated by a rectangle sliding over the top, which is the version that fails the moment the path is not axis-aligned. Several shapes in one drawing are staggered so they arrive in document order and it reads as a hand moving rather than as everything appearing at once. Lengths are re-measured by a ResizeObserver, because a path in an SVG without a fixed viewBox genuinely changes length when its box does and a dash array cached at load is wrong for the rest of the session. Under reduced motion the drawing is complete at mount, and cleanup removes the dash properties entirely so an author's own dashes survive.",
    example: "<svg data-rm-scroll-draw viewBox=\"0 0 200 80\" aria-hidden=\"true\"><path d=\"M4 60 C 60 4, 140 4, 196 60\"/></svg>",
    usage: "import { scrollDraw } from \"@soyrageagency/rage-motion\";\nscrollDraw();",
    options: [
      option("shapes", "string", "\"path, polyline, line, circle, ellipse, rect\"", "Selector for the shapes to draw, searched inside the SVG."),
      option("stagger", "number", "0.25", "How much consecutive shapes overlap, 0 sequential to 1 together (data-rm-stagger)."),
      option("start", "number", "0.9", "Viewport fraction where drawing begins (data-rm-start)."),
      option("end", "number", "0.35", "Viewport fraction where it is complete (data-rm-end)."),
    ],
  },
  {
    name: "depthLayers",
    category: "scroll2",
    file: MOD_SCROLL2,
    attribute: "data-rm-scroll-depth",
    summary: "Several layers drifting at different rates from a single scroll measurement.",
    notes:
      "The whole point is the arithmetic: one getBoundingClientRect on the frame per frame, then a transform written to each child at its own rate. The version that goes wrong gives every layer its own scroll listener and its own measurement, so six layers mean six forced layouts inside a handler that fires more often than the screen refreshes — the classic parallax page that scrolls at fifteen frames a second. Rates default to the child's index so a stack works with no configuration at all, and data-rm-rate on any layer overrides it. Progress is measured from the middle of the pass rather than the start, so every layer is at rest when the frame is centred and the drift is symmetric either side; that is also the state reduced motion draws, since jumping to the end of the pass would leave the stack visibly offset.",
    example: "<div data-rm-scroll-depth data-rm-travel=\"120\"><img data-rm-rate=\"0.2\" src=\"/plate-01.jpg\" alt=\"Plate one\"><img data-rm-rate=\"0.7\" src=\"/plate-01.jpg\" alt=\"Plate one\"></div>",
    usage: "import { depthLayers } from \"@soyrageagency/rage-motion\";\ndepthLayers();",
    options: [
      option("travel", "number", "90", "Pixels either side of rest that a layer at rate 1 drifts, so 90 is 180px of travel across the whole pass (data-rm-travel)."),
      option("axis", "\"x\" | \"y\"", "\"y\"", "Direction of the drift (data-rm-axis)."),
      option("rate", "number", "index ÷ layers", "Per-layer multiplier, set on each child (data-rm-rate)."),
    ],
  },
  {
    name: "scrollSnapSections",
    category: "scroll2",
    file: MOD_SCROLL2,
    attribute: "data-rm-snap-sections",
    summary: "Full-height sections that snap as you scroll, with a keyboard-operable nav.",
    notes:
      "The snapping is pure CSS — scroll-snap-type on the frame, scroll-snap-align on the panels — so the browser keeps ownership of momentum, inertia and trackpad feel, none of which a JavaScript reimplementation ever gets right. All the script does is say where you are: one scrollTop read per frame against offsets cached once and refreshed by a ResizeObserver, rather than measuring every panel every frame. The nav is a row of real buttons carrying the panels' own headings as text on a roving tabindex with arrow, Home and End keys, and the current one has aria-current=\"true\"; the usual version is a column of unlabelled divs with click handlers, unreachable by keyboard and silent to a screen reader. Under reduced motion the jumps are instant and snapping relaxes to proximity, because forced snapping is itself movement nobody asked for.",
    example: "<div data-rm-snap-sections data-rm-snap=\"proximity\"><section><h2>One</h2></section><section><h2>Two</h2></section></div>",
    usage: "import { scrollSnapSections } from \"@soyrageagency/rage-motion\";\nscrollSnapSections();",
    options: [
      option("snap", "\"mandatory\" | \"proximity\" | \"none\"", "\"mandatory\"", "Strictness of the snapping (data-rm-snap)."),
      option("label", "string", "\"Sections\"", "Accessible name for the section nav (data-rm-label)."),
    ],
  },
  {
    name: "revealMaskScroll",
    category: "scroll2",
    file: MOD_SCROLL2,
    attribute: "data-rm-scroll-mask",
    summary: "A clip-path wipe driven by scroll position rather than by a timer.",
    notes:
      "clip-path: inset() moves on the compositor and never touches layout, so nothing below the wipe shifts by a pixel while it plays, and binding the inset to scroll position rather than to a duration stops it running to a schedule that has nothing to do with where the reader is. A clip is a hiding mechanism, so this component carries a guard rather than a promise: the per-frame loop only runs while the element is observed on screen, and an element can pass clean through the viewport between two rendering opportunities, or be skipped by a jump to an anchor or a restored scroll position, leaving nothing to reopen it. A second observer therefore opens the clip for good as soon as the element is reported above the fold, which is long after the band would have finished, so it can never open early on an ordinary scroll. The stylesheet never clips anything by itself and reduced motion opens it at mount; at the end the clip property is removed rather than set to zero, so the element stops being a clipping container and shadows spill properly again.",
    example: "<figure data-rm-scroll-mask data-rm-direction=\"left\" data-rm-radius=\"18\">…</figure>",
    usage: "import { revealMaskScroll } from \"@soyrageagency/rage-motion\";\nrevealMaskScroll();",
    options: [
      option("direction", "\"bottom\" | \"top\" | \"left\" | \"right\"", "\"bottom\"", "The edge the content is revealed from (data-rm-direction)."),
      option("radius", "number", "0", "Corner radius on the clip, in pixels (data-rm-radius)."),
      option("start", "number", "0.95", "Viewport fraction where the wipe begins (data-rm-start)."),
      option("end", "number", "0.5", "Viewport fraction where it is fully open (data-rm-end)."),
    ],
  },
  {
    name: "marqueeScroll",
    category: "scroll2",
    file: MOD_SCROLL2,
    attribute: "data-rm-scroll-marquee",
    summary: "A strip of content whose speed and direction are the scroll itself.",
    notes:
      "There is no animation and no timer: the belt moves by exactly the distance the page moved, multiplied by a rate, so stopping the scroll stops the strip dead and scrolling back sends it the other way. That coupling is the whole effect and it cannot be faked with a CSS keyframe and an animation-play-state toggle, which can only ever pause and resume at a fixed speed. The delta is taken from the strip's own box rather than from scrollY, so it behaves identically inside a nested scroller, and the reference is dropped whenever the strip leaves the screen so it cannot lurch by the whole distance the page travelled while it was away. The content is duplicated once for the seam and the duplicate is aria-hidden, inert and unselectable — a marquee that reads itself out twice and puts a second set of unreachable links in the tab order is the usual and entirely avoidable bug.",
    example: "<div data-rm-scroll-marquee data-rm-speed=\"1.4\"><span>Design</span><span>Motion</span></div>",
    usage: "import { marqueeScroll } from \"@soyrageagency/rage-motion\";\nmarqueeScroll();",
    options: [
      option("speed", "number", "1", "Multiplier on the scroll distance (data-rm-speed)."),
      option("direction", "\"left\" | \"right\"", "\"left\"", "Which way the belt travels when scrolling down (data-rm-direction)."),
    ],
  },
  {
    name: "scrollGradient",
    category: "scroll2",
    file: MOD_SCROLL2,
    attribute: "data-rm-scroll-gradient",
    summary: "A background gradient that rotates and crossfades as you descend a section.",
    notes:
      "Two oversized gradient layers, one over the other, rotated by transform and crossfaded by opacity — both compositor properties, so the section repaints nothing per frame. The obvious implementation animates background-position or the gradient's own angle, and both repaint the whole painted area every frame; on a full-bleed section that is comfortably the most expensive thing on the page. The layers are inserted as aria-hidden decoration and the section is given a stacking context in the stylesheet, so real content stays above them without anyone hand-writing a z-index. Each layer is inset by sixty per cent so rotation never exposes a corner, and colours given in the markup win over the kit's tokens.",
    example: "<section data-rm-scroll-gradient data-rm-from=\"#e8623c\" data-rm-to=\"#1b3a2f\" data-rm-turns=\"90\">…</section>",
    usage: "import { scrollGradient } from \"@soyrageagency/rage-motion\";\nscrollGradient();",
    options: [
      option("from", "string", "token", "Tint of the first layer; falls back to --rm-terracotta (data-rm-from)."),
      option("to", "string", "token", "Tint of the layer that fades in; falls back to --rm-accent (data-rm-to)."),
      option("angle", "number", "0", "Starting rotation in degrees (data-rm-angle)."),
      option("turns", "number", "60", "Degrees the gradient rotates across the section (data-rm-turns)."),
    ],
  },
  {
    name: "scrollSplit",
    category: "scroll2",
    file: MOD_SCROLL2,
    attribute: "data-rm-scroll-split",
    summary: "Two halves that part as you scroll to reveal what sits behind them.",
    notes:
      "The first two children slide apart by a percentage of their own size, which is a transform and therefore free; the third child onwards is whatever the parting reveals and is never touched by the script. Building this with width or a negative margin relayouts the page every frame and, worse, fights any text inside the halves, which rebreaks line by line as they move. The halves finish fully apart, so the reduced-motion state is open and the revealed content is plainly visible — the trap is making the finished state the closed one, so the thing the effect exists to show is only ever glimpsed mid-scroll. data-rm-axis=\"y\" changes the arrangement as well as the direction of travel — the halves are stacked one above the other in the grid and part upwards and downwards — because sliding two side-by-side columns vertically is not a vertical split.",
    example: "<section data-rm-scroll-split data-rm-travel=\"60\"><div>Left</div><div>Right</div><p>Behind</p></section>",
    usage: "import { scrollSplit } from \"@soyrageagency/rage-motion\";\nscrollSplit();",
    options: [
      option("travel", "number", "55", "How far each half moves, as a percentage of its own size (data-rm-travel)."),
      option("axis", "\"x\" | \"y\"", "\"x\"", "Side-by-side halves parting sideways, or stacked halves parting up and down (data-rm-axis)."),
      option("start", "number", "0.85", "Viewport fraction where the parting begins (data-rm-start)."),
      option("end", "number", "0.2", "Viewport fraction where it is fully open (data-rm-end)."),
    ],
  },
  {
    name: "scrollZoomPin",
    category: "scroll2",
    file: MOD_SCROLL2,
    attribute: "data-rm-scroll-zoom",
    summary: "A pinned figure that settles out of an over-scale as the section passes.",
    notes:
      "The section is tall, the frame inside it is sticky, and the artwork starts larger than its frame and comes to rest at its natural size. Ending at scale 1 rather than zoomed in matters more than it sounds: the last frame of the effect is the state a visitor sits and looks at, and it should be the composition the designer actually chose rather than an arbitrary crop of it. The pin is position: sticky, so the page is never hijacked and there is no placeholder to keep in sync — maintaining that placeholder is most of the code in a position: fixed implementation and it is what always breaks on a resize or an orientation change. One rect read per frame drives the scale, and reduced motion draws the settled frame at mount.",
    example: "<section data-rm-scroll-zoom data-rm-from=\"1.4\"><div><img src=\"/plate-01.jpg\" alt=\"…\"></div></section>",
    usage: "import { scrollZoomPin } from \"@soyrageagency/rage-motion\";\nscrollZoomPin();",
    options: [
      option("from", "number", "1.35", "Scale at the start of the pin, never below 1 (data-rm-from)."),
      option("travel", "number", "160", "vh of scroll the pin lasts, so 160 is a screen and a half of dwell (data-rm-travel)."),
    ],
  },
  {
    name: "scrollTypeScale",
    category: "scroll2",
    file: MOD_SCROLL2,
    attribute: "data-rm-scroll-type",
    summary: "A headline that shrinks into its typeset size without reflowing the page.",
    notes:
      "Type that changes size on scroll is nearly always built by animating font-size, and that is a layout pass per frame across the whole document below it: lines rebreak, the page height changes, and on a long page the scroll position itself drifts under the reader. This uses a transform instead, so the element keeps exactly the box it was laid out in and only the painted glyphs change size. It scales down to 1 rather than up from it, so the resting state is the heading at its designed size and the visual overflow only happens while the effect is running. The origin defaults to the left edge, where text in a left-aligned column is anchored — centring the origin makes a heading appear to slide sideways as it settles.",
    example: "<h2 data-rm-scroll-type data-rm-from=\"1.3\">A larger idea</h2>",
    usage: "import { scrollTypeScale } from \"@soyrageagency/rage-motion\";\nscrollTypeScale();",
    options: [
      option("from", "number", "1.25", "Scale at the start of the band, minimum 0.25 (data-rm-from)."),
      option("origin", "\"left\" | \"centre\" | \"right\"", "\"left\"", "The point the type scales about (data-rm-origin)."),
      option("start", "number", "1", "Viewport fraction where the scaling begins (data-rm-start)."),
      option("end", "number", "0.4", "Viewport fraction where it settles (data-rm-end)."),
    ],
  },

  // ── Ecommerce — product and catalogue ──
  {
    name: "productCard",
    category: "shop",
    file: MOD_SHOP,
    attribute: "data-rm-product-card",
    summary: "A product tile where the whole card is clickable but only the title is the link.",
    notes:
    // impeccable-disable-next-line broken-image: prose naming the tag
      "The card stretches the title's own anchor over itself with a pseudo element and lifts every other control onto a higher layer, so the price, the badge and the quick-add button keep their own clicks. Wrapping the entire card in one <a> — the usual shortcut — produces a single link whose accessible name is the title, the price, the rating and the word 'Add' read out in sequence, and it makes a nested quick-add button invalid markup. The second photograph is swapped into the same <img> rather than stacked behind it, so there is one element with one alt text and one place to look; it is preloaded first, because assigning src directly gives you a white flash while the file downloads. The hover lift is a transform on the card alone and it also fires on focusin, so a keyboard visitor gets the same second look rather than a dead tile.",
    example: "<article data-rm-product-card data-rm-image=\"/back.jpg\" data-rm-lift=\"8\">\n  <img src=\"/front.jpg\" alt=\"Linen shirt, front\">\n  <h3><a href=\"/p/linen-shirt\">Linen shirt</a></h3>\n  <p data-rm-price-tag data-rm-price=\"68\"></p>\n  <button type=\"button\" data-rm-add-to-cart>Add to bag</button>\n</article>",
    usage: "import { productCard } from \"@soyrageagency/rage-motion\";\nproductCard();",
    options: [
      option("image", "string", "\"\"", "data-rm-image: a second photograph swapped in on hover and on focus."),
      option("lift", "number", "6", "Pixels the card rises by, as a transform."),
      option("duration", "number", "420", "Lift and settle, in milliseconds."),
    ],
  },
  {
    name: "productGallery",
    category: "shop",
    file: MOD_SHOP,
    attribute: "data-rm-product-gallery",
    summary: "Thumbnails and a main image, with a roving tabindex and announced changes.",
    notes:
      "The thumbnails are real buttons under one roving tabindex: a single tab stop for the strip, arrows between frames, Home and End for the ends, and aria-current on the frame being shown. Built from clickable divs it has either no tab stops at all or one per photograph, and a gallery of twelve angles then costs twelve Tab presses to walk past. The large file is decoded before the swap, so the main image never blanks between frames — assign src directly and the previous photograph disappears while the next one downloads, which on a slow connection is most of a second of nothing. Each change the visitor makes is announced as 'image 3 of 6' plus the alt text, because a swap that says nothing is a control that appears not to work; the first paint deliberately writes nothing, since a live region that is already in the document announces its first fill and a product page should not open by reading out which photograph it happens to be showing. keepInView scrolls only the strip rather than throwing the whole page down to it.",
    example: "<div data-rm-product-gallery data-rm-label=\"Linen shirt photographs\">\n  <img src=\"/large-1.jpg\" alt=\"Linen shirt, front\">\n  <ul>\n    <li><button type=\"button\" data-rm-src=\"/large-1.jpg\"><img src=\"/t1.jpg\" alt=\"Front\"></button></li>\n    <li><button type=\"button\" data-rm-src=\"/large-2.jpg\"><img src=\"/t2.jpg\" alt=\"Back\"></button></li>\n  </ul>\n</div>",
    usage: "import { productGallery } from \"@soyrageagency/rage-motion\";\nproductGallery();",
    options: [
      option("src", "string", "the thumbnail's own src", "data-rm-src on each thumbnail button: the large file to swap into the main image."),
      option("duration", "number", "360", "Crossfade of the main image."),
      option("label", "string", "\"Product images\"", "data-rm-label: names the group."),
    ],
  },
  {
    name: "productZoom",
    category: "shop",
    file: MOD_SHOP,
    attribute: "data-rm-product-zoom",
    summary: "The real photograph magnified inside its own frame, with no second copy of it.",
    notes:
    // impeccable-disable-next-line broken-image: prose naming the tag
      "The frame clips and the one <img> already inside it scales around the point under the pointer, so the magnifier is the picture you can already see rather than a floating panel showing a different file. The usual implementation drops in a second, much larger <img> and moves its background-position, which downloads the image twice, doubles the decoded bitmap in memory on a phone, and puts a duplicate of the alt text into the accessibility tree for nothing. The focal point is eased on the shared rAF loop rather than written straight from the pointer event, so a fast flick glides instead of snapping, and the whole loop is wrapped in whileVisible so a page of these costs zero frames once scrolled past. It is driven by a real toggle button with aria-pressed, and once on, the arrow keys pan and Escape turns it off, so the effect is not pointer-only.",
    example: "<figure data-rm-product-zoom data-rm-zoom=\"2.6\" data-rm-glide=\"0.2\">\n  <img src=\"/shirt.jpg\" alt=\"Linen shirt, close weave\">\n</figure>",
    usage: "import { productZoom } from \"@soyrageagency/rage-motion\";\nproductZoom();",
    options: [
      option("zoom", "number", "2.2", "data-rm-zoom: magnification, clamped to at least 1."),
      option("glide", "number", "0.18", "data-rm-glide: how fast the focal point chases the pointer, 0.02 to 1."),
      option("label", "string", "\"Magnify image\"", "data-rm-label: the toggle button's text."),
    ],
  },
  {
    name: "colourSwatches",
    category: "shop",
    file: MOD_SHOP,
    attribute: "data-rm-swatches",
    summary: "Colour chips built on real radio inputs, with the colour's name in text.",
    notes:
      "Each chip is an <input type=\"radio\"> inside a labelled fieldset, shrunk to a pixel rather than display:none, which is what keeps its focus ring, its arrow-key cycling and its form value — a hidden input has none of the three, and that is exactly what the div-based swatch grid throws away. Every label carries the colour's name as text and not only as a background, because a swatch is a colour and a colour is not a name to anybody who cannot see it or cannot tell two of them apart. One selection ring serves the whole group and FLIPs from the old chip to the new one, so what looks like an outline growing across the row is a measured transform with no layout work; transitioning the ring's own left and width instead re-lays-out the row on every frame of a decoration. A ResizeObserver re-measures when the row wraps, since a position taken from a measurement is only correct until the container changes.",
    example: "<fieldset data-rm-swatches>\n  <legend>Colour</legend>\n  <label><input type=\"radio\" name=\"colour\" value=\"ochre\" data-rm-color=\"#c9922f\" checked> Ochre</label>\n  <label><input type=\"radio\" name=\"colour\" value=\"ink\" data-rm-color=\"#101014\"> Ink</label>\n</fieldset>",
    usage: "import { colourSwatches } from \"@soyrageagency/rage-motion\";\ncolourSwatches();",
    options: [
      option("duration", "number", "340", "How long the ring takes to FLIP between chips."),
      option("color", "string", "\"currentColor\"", "data-rm-color on each input: the chip's fill."),
    ],
  },
  {
    name: "sizePicker",
    category: "shop",
    file: MOD_SHOP,
    attribute: "data-rm-size-picker",
    summary: "Real size radios where out of stock is disabled and actually said out loud.",
    notes:
      "A sold-out size gets disabled, which removes it from the arrow-key cycle for free, and it also gets the words 'out of stock' as text that is read but not drawn. That second half is what nearly every implementation misses: a diagonal line through 'M' is a visual convention with no spoken equivalent, so without it a screen reader announces 'M, dimmed' and leaves the visitor to guess whether the size is gone, not stocked, or simply not chosen yet. Choosing a size announces it in a polite live region, because on most product pages the visible consequence of the choice — the price, the delivery date, the button label — happens somewhere else on the screen. The stripes and the strike-through remain, because a sighted shopper should be able to scan the row in one glance; they are just no longer the only signal.",
    example: "<fieldset data-rm-size-picker>\n  <legend>Size</legend>\n  <label><input type=\"radio\" name=\"size\" value=\"s\"> S</label>\n  <label><input type=\"radio\" name=\"size\" value=\"m\" data-rm-sold-out=\"true\"> M</label>\n  <label><input type=\"radio\" name=\"size\" value=\"l\"> L</label>\n</fieldset>",
    usage: "import { sizePicker } from \"@soyrageagency/rage-motion\";\nsizePicker();",
    options: [
      option("soldOutText", "string", "\"out of stock\"", "The spoken half of the strike-through."),
      option("soldOut", "\"true\" | \"false\"", "\"false\"", "data-rm-sold-out on an input: disables it and announces why."),
      option("label", "string", "—", "data-rm-label on an input: overrides the sold-out wording for that size."),
    ],
  },
  {
    name: "priceTag",
    category: "shop",
    file: MOD_SHOP,
    attribute: "data-rm-price-tag",
    summary: "A price with a struck original and a name that says 'now', 'was' and the saving.",
    notes:
      "text-decoration: line-through is drawn and nothing more, so to a screen reader a sale price is two unrelated numbers in a row, which is the worst possible impression to give about money. The tag builds its own accessible name from Intl.NumberFormat with currencyDisplay: 'name' — 'now 24 euros, was 40 euros, save 40 percent' — and marks the visible parts aria-hidden so the figure is announced once rather than three times. Updating the price rolls the new figure in and the old one out on transforms inside a fixed box with tabular numerals, so a live price under a variant picker never nudges the buy button beside it. An unrecognised currency or locale falls back to the plain number instead of throwing, because a price that fails to format must still be a price rather than an empty element.",
    example: "<p data-rm-price-tag data-rm-price=\"24\" data-rm-was=\"40\" data-rm-currency=\"EUR\"></p>",
    usage: "import { priceTag } from \"@soyrageagency/rage-motion\";\npriceTag();\n\ndocument.querySelector(\"[data-rm-price-tag]\").rmSet(19.5, 40);",
    options: [
      option("price", "number", "0", "data-rm-price: what it costs now."),
      option("was", "number", "0", "data-rm-was: the original; ignored unless it is higher."),
      option("currency", "string", "\"EUR\"", "data-rm-currency: any ISO 4217 code."),
      option("locale", "string", "navigator.language", "data-rm-locale: decides grouping, symbol placement and the spoken name."),
      option("duration", "number", "300", "The roll when rmSet changes the figure."),
    ],
  },
  {
    name: "discountBadge",
    category: "shop",
    file: MOD_SHOP,
    attribute: "data-rm-discount-badge",
    summary: "A percentage-off flash that scales out of its own centre.",
    notes:
      "It scales from nothing rather than growing a box, so pinning one to a card cannot reflow the tile it decorates — a badge that changes the flow shoves the price sideways at the exact moment somebody is reading it. The accessible name spells out what the number means: '-40%' beside a price reads aloud as 'minus forty percent', which is not what the shop is offering and is not how anybody says it. At zero or below it hides itself rather than rendering '−0%', since a badge announcing no discount is worse than no badge. rmSet re-pops it, so a variant change that alters the saving is visible as a change rather than a silent redraw.",
    example: "<span data-rm-discount-badge=\"40\"></span>",
    usage: "import { discountBadge } from \"@soyrageagency/rage-motion\";\ndiscountBadge();",
    options: [
      option("percent", "number", "0", "data-rm-discount-badge: the saving; hidden at zero or below."),
      option("label", "string", "\"off\"", "data-rm-label: the word after the number in the spoken name."),
      option("duration", "number", "480", "The pop, on a spring curve."),
    ],
  },
  {
    name: "stockMeter",
    category: "shop",
    file: MOD_SHOP,
    attribute: "data-rm-stock-meter",
    summary: "How many are left, drawn as a bar and announced as a sentence.",
    notes:
      "A real role=\"progressbar\" carrying aria-valuenow, aria-valuemax and — the one that matters here — aria-valuetext, so it is read as '3 of 20 left' rather than as '15 percent'. Percentage is the wrong unit for scarcity: nobody buys faster because a bar is fifteen percent full, and the raw count is the thing the shopper actually needs. The fill is a scaleX on a bar that is already at full width, so dropping the stock is one composited frame rather than a re-layout of the row, and the transition duration is set to zero under reduced motion instead of the bar being skipped. Crossing the low threshold changes the colour and the wording together, because a colour on its own is a warning only some of the audience receives.",
    example: "<div data-rm-stock-meter data-rm-left=\"3\" data-rm-max=\"20\" data-rm-low=\"5\"></div>",
    usage: "import { stockMeter } from \"@soyrageagency/rage-motion\";\nstockMeter();",
    options: [
      option("left", "number", "0", "data-rm-left: how many remain."),
      option("max", "number", "10", "data-rm-max: the full shelf, for the bar and aria-valuemax."),
      option("low", "number", "3", "data-rm-low: at or below this it turns and says 'Only n left'."),
      option("duration", "number", "520", "The scaleX transition."),
    ],
  },
  {
    name: "ratingStars",
    category: "shop",
    file: MOD_SHOP,
    attribute: "data-rm-rating-stars",
    summary: "A read-only score drawn as clipped stars with the number written beside it.",
    notes:
      "A filled copy of the star row sits exactly over a grey one and is clipped with clip-path, so 4.3 stars is genuinely four and a third rather than a rounded four, and the partial star costs nothing to redraw because the clip is on its own layer. The stars are aria-hidden and the score is a sentence — '4.3 out of 5' — since labelling the row '★★★★☆' reads out as five identical words or as nothing at all, and it hides the decimal the number actually contains. It fills once, when the row arrives, using watch with once: true rather than whileVisible — the latter restarts its task on every re-entry and on every return to the tab, so a settled score would re-fill from zero each time you scrolled back to it. This is display only: it takes no input and exposes no radio group, which is deliberate, because a rating widget somebody can accidentally set is a rating widget that lies.",
    example: "<p data-rm-rating-stars data-rm-score=\"4.3\" data-rm-out-of=\"5\"></p>",
    usage: "import { ratingStars } from \"@soyrageagency/rage-motion\";\nratingStars();",
    options: [
      option("score", "number", "0", "data-rm-score: the average, decimals kept."),
      option("outOf", "number", "5", "data-rm-out-of: how many stars there are."),
      option("glyph", "string", "\"★\"", "The character repeated to build both rows."),
    ],
  },
  {
    name: "reviewSummary",
    category: "shop",
    file: MOD_SHOP,
    attribute: "data-rm-review-summary",
    summary: "The rating distribution as bars that grow by transform when they arrive.",
    notes:
      "Each row renders as '5 stars, 128, 62%' in real text with the bar marked aria-hidden beside it, because a bar chart with no numbers is a picture and a picture is not a summary. The bars grow with scaleX from a left origin the first time the block comes into view — watch with once: true, not whileVisible, so a static distribution does not re-grow from zero every time you scroll back or switch tabs and start looking like live data — and five rows animate without the browser touching layout once, where the version that transitions width re-lays-out the whole panel on every frame. The share is taken from the total number of reviews, not from the largest row: scaling every chart to its own biggest bar makes each product look as though it has one dominant rating, which is a flattering lie a shop should not be told by its own component. Under reduced motion the bars are simply already at their share rather than being skipped, so the chart is never blank.",
    example: "<ul data-rm-review-summary>\n  <li data-rm-value=\"128\">5</li>\n  <li data-rm-value=\"40\">4</li>\n  <li data-rm-value=\"12\">3</li>\n  <li data-rm-value=\"4\">2</li>\n  <li data-rm-value=\"6\">1</li>\n</ul>",
    usage: "import { reviewSummary } from \"@soyrageagency/rage-motion\";\nreviewSummary();",
    options: [
      option("value", "number", "0", "data-rm-value on each row: how many reviews gave that score."),
      option("duration", "number", "760", "data-rm-duration: how long each bar takes to reach its share."),
      option("label", "string", "\"Rating distribution\"", "data-rm-label: names the group."),
    ],
  },
  {
    name: "addToCart",
    category: "shop",
    file: MOD_SHOP,
    attribute: "data-rm-add-to-cart",
    summary: "A buy button that confirms, then returns, without ever changing width.",
    notes:
      "The three faces — the label, the wait and the tick — share one grid cell, so the button is already as wide as its widest state and switching between them is opacity and transform only. Swapping textContent instead, which is the first thing everybody writes, resizes the button mid-click and slides it out from under the pointer, which on a phone means the confirmation tap lands on the card underneath. While it is working it is aria-disabled rather than disabled, because a disabled button loses focus and losing focus at the moment of the click drops a keyboard visitor back to the top of a two-hundred-card catalogue. The result is announced in a live region beside the button and nowhere else: all three faces are aria-hidden and the button keeps one fixed aria-label, because faces left in the accessibility tree are the button's computed name, and a name that changes to 'Adding…' and then 'Added' underneath a live region saying the same thing announces one click twice.",
    example: "<button type=\"button\" data-rm-add-to-cart data-rm-done=\"Added to bag\" data-rm-hold=\"2000\">Add to bag</button>",
    usage: "import { addToCart } from \"@soyrageagency/rage-motion\";\naddToCart();\n\naddToCart(\"[data-rm-add-to-cart]\", { onAdd: () => fetch(\"/cart\", { method: \"POST\" }) });",
    options: [
      option("onAdd", "(button) => void | Promise", "undefined", "Called on click; a promise holds the wait state until it settles."),
      option("busyText", "string", "\"Adding…\"", "data-rm-hint: the waiting face."),
      option("doneText", "string", "\"Added\"", "data-rm-done: the confirmation face."),
      option("hold", "number", "1800", "data-rm-hold: how long the tick stays before it returns to idle."),
    ],
  },
  {
    name: "wishlistHeart",
    category: "shop",
    file: MOD_SHOP,
    attribute: "data-rm-wishlist",
    summary: "A save toggle whose state is aria-pressed and whose name never changes.",
    notes:
      "The accessible name stays 'Save for later' in both states and the state lives entirely in aria-pressed, which is what a toggle button is for. Swapping the label to 'Saved' as well — the common version — has a screen reader announce 'Saved, pressed', telling the visitor the same thing twice while telling them nothing about what pressing it again will do. The pop is a scale on the heart plus one ring expanding out of it, both on their own layers and both absolutely positioned, so a grid of cards behind never shifts by a pixel. Under reduced motion the heart simply fills, which is the entire message; nothing is hidden and nothing waits for an animation that will not run.",
    example: "<button type=\"button\" data-rm-wishlist aria-label=\"Save for later\" data-rm-pressed=\"false\"></button>",
    usage: "import { wishlistHeart } from \"@soyrageagency/rage-motion\";\nwishlistHeart();",
    options: [
      option("label", "string", "\"Save for later\"", "data-rm-label: the name, used in both states."),
      option("pressed", "\"true\" | \"false\"", "\"false\"", "data-rm-pressed: the state it starts in."),
      option("onToggle", "(on, button) => void", "undefined", "Called with the new state after every press."),
    ],
  },
  {
    name: "compareTray",
    category: "shop",
    file: MOD_SHOP,
    attribute: "data-rm-compare-tray",
    summary: "A fixed shelf of chosen products that slides over the catalogue, never into it.",
    notes:
      "The tray is fixed and translates up from below, so adding the first product does not push the grid up by seventy pixels and take the row somebody was reading with it. When empty it is hidden and inert together: a tray that is only transformed off screen is still in the tab order and still collects focus from nowhere, which is the bug in most sticky bars. Removing an item FLIPs the survivors from their previously measured positions, so the row closes up rather than jumping, and each removal has its own real button with a name that says which product it drops. The count is announced politely rather than assertively, because the tray is a side effect of a click that happened somewhere else and should never interrupt what is being read.",
    example: "<div data-rm-compare-tray data-rm-max=\"4\"></div>",
    usage: "import { compareTray } from \"@soyrageagency/rage-motion\";\ncompareTray();\n\nconst tray = document.querySelector(\"[data-rm-compare-tray]\");\ntray.rmAdd(\"sku-1\", { label: \"Linen shirt\", image: \"/t1.jpg\" });\ntray.rmRemove(\"sku-1\");",
    options: [
      option("max", "number", "4", "data-rm-max: how many fit before rmAdd refuses."),
      option("label", "string", "\"Compare\"", "data-rm-label: names the region."),
      option("duration", "number", "320", "Arrival, and the FLIP the survivors play on removal."),
    ],
  },
  {
    name: "quickView",
    category: "shop",
    file: MOD_SHOP,
    attribute: "data-rm-quick-view",
    summary: "A product dialog that seals the page, traps focus and gives it back.",
    notes:
      "Openers are found by aria-controls pointing at the dialog, so the wiring is the same attribute that already tells assistive technology what the button does — there is no second bespoke attribute and therefore no way for the two to disagree. The rest of the page is set inert while it is open, which removes it from the tab order, from the screen reader's virtual cursor and from find-in-page in one move; the hand-rolled Tab-wrapping trap does only the first of those and leaves the catalogue readable underneath. Escape closes it, the backdrop closes it, and focus returns to the button that opened it, which is the failure people notice most: close a quick view without it and you are back at the top of a catalogue of two hundred cards. Every opener's aria-expanded is flipped on open and back on close rather than being stamped once at mount, since a trigger permanently claiming its dialog is collapsed tells the visitor who tabs back to it the opposite of the truth. It labels itself from its own heading where there is one, falling back to a given label, so the dialog is never announced as just 'dialog'.",
    example: "<button type=\"button\" aria-controls=\"quick-1\">Quick view</button>\n<div id=\"quick-1\" data-rm-quick-view hidden>\n  <h2>Linen shirt</h2>\n  <p>Heavyweight, garment dyed.</p>\n</div>",
    usage: "import { quickView } from \"@soyrageagency/rage-motion\";\nquickView();",
    options: [
      option("label", "string", "\"Quick view\"", "data-rm-label: used only when the dialog has no heading."),
      option("duration", "number", "320", "Veil fade and panel arrival."),
    ],
  },
  {
    name: "productTabs",
    category: "shop",
    file: MOD_SHOP,
    attribute: "data-rm-product-tabs",
    summary: "Description, details and reviews as a real tablist with a sliding underline.",
    notes:
      "A proper tablist: one tab stop for the whole set, arrows to move between tabs, Home and End for the ends, aria-selected on the chosen one and aria-controls pointing at a panel that is a real tabpanel. Buttons that merely toggle a class are announced as a row of buttons with nothing to say they are alternatives for one region, so a screen reader visitor has no idea that pressing one hides the others. The underline is a single element that FLIPs from tab to tab — measured, then moved with translate and scaleX — rather than a bar whose left and width are transitioned, which is a layout animation running on every frame of a decoration. Panels are toggled with the hidden attribute and never with a stylesheet, so before the script runs all of the content is present, in order, and readable.",
    example: "<div data-rm-product-tabs>\n  <div>\n    <button type=\"button\" aria-controls=\"p1\">Details</button>\n    <button type=\"button\" aria-controls=\"p2\">Delivery</button>\n  </div>\n  <section id=\"p1\">Heavyweight linen.</section>\n  <section id=\"p2\">Free over €60.</section>\n</div>",
    usage: "import { productTabs } from \"@soyrageagency/rage-motion\";\nproductTabs();",
    options: [
      option("duration", "number", "340", "data-rm-duration: underline FLIP and panel crossfade."),
      option("label", "string", "\"Product information\"", "data-rm-label: names the tablist."),
    ],
  },
  {
    name: "variantPicker",
    category: "shop",
    file: MOD_SHOP,
    attribute: "data-rm-variant-picker",
    summary: "Several radio groups combined into one announced answer about availability.",
    notes:
      "Colour and size are two groups, but what a shopper needs to know is whether this particular pair exists and what it costs, so the picker watches every group inside it, assembles the combination, asks the page about it and says the whole sentence once — 'Ochre, medium. In stock, €68' — instead of leaving two separate announcements and a price that changed silently elsewhere. Combinations that do not exist are marked aria-disabled rather than disabled, deliberately: a shopper should still be able to land on 'ochre, medium' and be told it is unavailable, which is information, whereas a disabled radio is skipped by the arrow keys and the reason is never given. Once the visitor has touched it and a group is still unanswered it says so rather than guessing, but it writes nothing at all on mount, because a live region that is already in the document announces its first fill and a product page should not greet you by reading out its own instructions. An unknown availability is treated as available, since a picker that hides everything until the server replies looks broken on first paint. It composes with colourSwatches and sizePicker rather than replacing them.",
    example: "<div data-rm-variant-picker>\n  <fieldset data-rm-swatches><legend>Colour</legend>…</fieldset>\n  <fieldset data-rm-size-picker><legend>Size</legend>…</fieldset>\n</div>",
    usage: "import { variantPicker } from \"@soyrageagency/rage-motion\";\nvariantPicker();\n\nvariantPicker(\"[data-rm-variant-picker]\", {\n  available: ({ colour, size }) => ({ inStock: !(colour === \"ink\" && size === \"m\"), price: \"€68\" }),\n});",
    options: [
      option("available", "(parts) => boolean | { inStock, price }", "undefined", "Asked on every change; unknown means available."),
      option("label", "string", "\"Options\"", "data-rm-label: names the group."),
      option("value", "string", "input.value", "data-rm-value on an input: the key passed to `available` and to rmMark."),
    ],
  },
  {
    name: "breadcrumbTrail",
    category: "shop",
    file: MOD_SHOP,
    attribute: "data-rm-breadcrumb-trail",
    summary: "A breadcrumb that folds its middle behind a button instead of an ellipsis.",
    notes:
      "When the row genuinely runs out of room — measured with a ResizeObserver, not guessed at a breakpoint — the middle steps collapse behind a real button with aria-expanded, so the hidden levels can be got back. The usual fix is text-overflow: ellipsis, which throws the information away for everyone who can see it while a screen reader still reads the full string anyway, which is the worst of both. Expanding is a FLIP: the hidden steps are un-hidden, everything is measured in its new place, and each surviving crumb is played from where it used to be, so a trail that doubles in length does it in one composited pass with no animated width. The last crumb carries aria-current=\"page\", which is the attribute that actually tells a listener where in the catalogue they are standing.",
    example: "<nav data-rm-breadcrumb-trail data-rm-keep=\"1\">\n  <ol>\n    <li><a href=\"/\">Home</a></li>\n    <li><a href=\"/clothing\">Clothing</a></li>\n    <li><a href=\"/clothing/shirts\">Shirts</a></li>\n    <li>Linen shirt</li>\n  </ol>\n</nav>",
    usage: "import { breadcrumbTrail } from \"@soyrageagency/rage-motion\";\nbreadcrumbTrail();",
    options: [
      option("keep", "number", "1", "data-rm-keep: how many leading crumbs survive the fold."),
      option("label", "string", "\"Breadcrumb\"", "data-rm-label: names the navigation landmark."),
      option("duration", "number", "320", "The FLIP when the middle unfolds."),
    ],
  },
  {
    name: "sortBar",
    category: "shop",
    file: MOD_SHOP,
    attribute: "data-rm-sort-bar",
    summary: "A native select for sort order, styled but never rebuilt, with the change announced.",
    notes:
      "This deliberately does not replace the control. A native select already has type-ahead, Home and End, the platform picker on a phone, voice control on the desktop and a value that submits with the form; every div-and-listbox rebuild gives up at least two of those, and usually the two nobody thought to test. The component styles the wrapper and the select's own box, checks that it has a label or gives it one, and otherwise stays out of the way. What it adds is the missing half: changing the sort order re-orders a grid somewhere below and by default nothing says so, so the new order is announced politely — quietly enough not to interrupt, loudly enough that the control does not appear inert.",
    example: "<div data-rm-sort-bar data-rm-label=\"Sorted by\">\n  <label for=\"sort\">Sort by</label>\n  <select id=\"sort\">\n    <option value=\"new\">Newest</option>\n    <option value=\"asc\">Price, low to high</option>\n  </select>\n</div>",
    usage: "import { sortBar } from \"@soyrageagency/rage-motion\";\nsortBar();",
    options: [
      option("label", "string", "\"Sorted by\"", "data-rm-label: the prefix in the announcement, and the fallback name."),
      option("onSort", "(value, select) => void", "undefined", "Called with the new value after each change."),
    ],
  },
  {
    name: "filterPanel",
    category: "shop",
    file: MOD_SHOP,
    attribute: "data-rm-filter-panel",
    summary: "A filter disclosure with real checkboxes that opens without moving the catalogue.",
    notes:
      "The panel is absolutely positioned, out of the flow, and opens with clip-path and a small translate — which is the whole point of the component. The popular version animates height from 0 to auto, or grid-template-rows from 0fr to 1fr, and both of those re-lay-out every product below the filter on every frame of the animation; here the grid behind does not move at all. The trigger is a button with aria-expanded and aria-controls, the choices are real checkboxes inside a labelled group, Escape closes the panel and hands focus back to the trigger, and a click anywhere outside closes it too. The number of active filters is kept on the trigger so it is legible while the panel is shut, which is the state it spends most of its life in.",
    example: "<div data-rm-filter-panel data-rm-open=\"false\">\n  <button type=\"button\" aria-controls=\"f-size\">Size</button>\n  <div id=\"f-size\">\n    <label><input type=\"checkbox\" value=\"s\"> Small</label>\n    <label><input type=\"checkbox\" value=\"m\"> Medium</label>\n  </div>\n</div>",
    usage: "import { filterPanel } from \"@soyrageagency/rage-motion\";\nfilterPanel();",
    options: [
      option("open", "\"true\" | \"false\"", "\"false\"", "data-rm-open: whether it starts expanded."),
      option("duration", "number", "280", "data-rm-duration: the clip-path reveal."),
      option("onChange", "(values) => void", "undefined", "Called with the checked values after every tick."),
    ],
  },
  {
    name: "resultCount",
    category: "shop",
    file: MOD_SHOP,
    attribute: "data-rm-result-count",
    summary: "A live '42 products' that rolls on transform and is announced once filtering settles.",
    notes:
      "The debounce is the component. A live region takes every value it is given literally, so a price slider that fires a change per pixel produces forty announcements in a row and blocks anything more useful from being said for the next half minute; waiting until the number stops moving turns that into one sentence. The digits roll on a transform inside an overflow-hidden box with tabular numerals, so the toolbar around it does not twitch as the count drops from 128 to 9. It is role=\"status\" and aria-live=\"polite\" rather than assertive, because a result count is the consequence of something the visitor just did and never an emergency. Under reduced motion the number simply changes, still announced, still correct.",
    example: "<p data-rm-result-count data-rm-value=\"42\" data-rm-noun=\"products\" data-rm-delay=\"400\"></p>",
    usage: "import { resultCount } from \"@soyrageagency/rage-motion\";\nresultCount();\n\ndocument.querySelector(\"[data-rm-result-count]\").rmSet(18);",
    options: [
      option("value", "number", "0", "data-rm-value: the count it starts at."),
      option("noun", "string", "\"products\"", "data-rm-noun: the word after the number."),
      option("delay", "number", "400", "data-rm-delay: how long the value must hold still before it is announced."),
      option("duration", "number", "300", "data-rm-duration: the digit roll."),
    ],
  },

  // ── Ecommerce — cart, checkout and order ──
  {
    name: "cartDrawer",
    category: "cart",
    file: MOD_CART,
    attribute: "data-rm-cart-drawer",
    summary: "The basket as a real dialog: focus trapped, Escape closes, focus handed back.",
    notes:
      "A cart drawer is a modal whether or not it is built as one, and the usual version is a div that slid in — which means Tab walks straight out of the basket into the product grid behind it, where a screen reader user is now reading content they cannot see. This sets role=\"dialog\" with aria-modal, makes every other child of body inert while it is open, cycles Tab inside, closes on Escape, and returns focus to the button that opened it rather than dropping it on the document. It slides on a transform, so opening the basket never reflows the page behind it and the product list keeps its scroll position exactly. Triggers are wired by aria-controls pointing at the drawer's id, so their aria-expanded stays truthful without any extra markup. The scrim is deliberately excluded from the inert sweep — sealing your own overlay is the classic version of this bug, and the symptom is an overlay that looks clickable and silently does nothing.",
    example: "<button aria-controls=\"basket\">Basket</button>\n<aside id=\"basket\" data-rm-cart-drawer data-rm-side=\"right\" data-rm-label=\"Your basket\">\n  <h2>Your basket</h2>\n  <ul data-rm-cart-lines></ul>\n</aside>",
    usage: "import { cartDrawer } from \"@soyrageagency/rage-motion\";\ncartDrawer();",
    options: [
      option("side", "left | right", "\"right\"", "Which edge it comes from. data-rm-side."),
      option("label", "string", "\"Your basket\"", "The dialog's accessible name. data-rm-label."),
      option("open", "boolean", "false", "data-rm-open=\"true\" opens it on mount."),
      option("duration", "number", "380", "Slide in, milliseconds. The close is deliberately faster."),
    ],
  },
  {
    name: "cartLine",
    category: "cart",
    file: MOD_CART,
    attribute: "data-rm-cart-line",
    summary: "A line item with a real quantity stepper and a remove button.",
    notes:
      "The stepper is two real buttons around a real input[type=number], which means it can be typed into, arrowed, and announced as \"quantity, 2\" — the usual pair of clickable spans is none of those things and cannot be reached by keyboard at all. The buttons disable themselves at the ends of the range instead of silently refusing, so the limit is visible before it is hit. The line's own price is a polite live region while the running total is not, because the button you just pressed should report itself immediately whereas the total should wait until you have stopped pressing; getting this the wrong way round is what makes a basket read itself out four times while you hold the plus key. Removing a line FLIPs the lines below it — measure, remove, invert, play — rather than animating a height, and then places focus on the next remove button, since dropping focus on the body after a deletion is how a keyboard user loses the list entirely. Each change dispatches a bubbling rm-cart-change event, which is what cartTotals listens for.",
    example: "<ul>\n  <li data-rm-cart-line data-rm-price=\"24\" data-rm-qty=\"2\" data-rm-currency=\"GBP\">\n    <h3>Very Loud Tote (demo product)</h3>\n  </li>\n</ul>",
    usage: "import { cartLine } from \"@soyrageagency/rage-motion\";\ncartLine();",
    options: [
      option("price", "number", "0", "Unit price. data-rm-price, per line."),
      option("qty", "number", "1", "Starting quantity. data-rm-qty, and kept in sync by the component."),
      option("min", "number", "0", "Lowest quantity. data-rm-min."),
      option("max", "number", "99", "Highest quantity. data-rm-max."),
      option("currency", "string", "\"GBP\"", "ISO code passed to Intl. data-rm-currency."),
    ],
  },
  {
    name: "cartTotals",
    category: "cart",
    file: MOD_CART,
    attribute: "data-rm-cart-totals",
    summary: "A subtotal that recomputes from the lines, rolls to its new value and is announced.",
    notes:
      "The figure counts from the old amount to the new one on the shared frame loop rather than snapping, because a total that jumps from one number to another gives no sense of which direction it went — and the count runs inside whileVisible, so a totals row scrolled out of sight stops burning frames and simply writes the final figure. The announcement is debounced: holding a stepper fires a dozen changes a second and a live region that repeats every one of them is unusable, so the sentence is spoken once the pressing stops. A MutationObserver watches for lines being added or removed, which keeps the total right even when a framework replaces the markup wholesale, and it deliberately ignores mutations inside the totals row itself — without that filter, painting the counting figure is a mutation, which triggers a recount, which paints again, forever. The figures are a dl so each label is bound to its amount; a grid of divs looks identical and reads as a wall of unattached numbers. It re-broadcasts an rm-cart-total event on document, which is how a badge in the header and a free-delivery bar in the drawer stay right without knowing about each other.",
    example: "<div data-rm-cart-totals data-rm-shipping=\"4.95\" data-rm-currency=\"GBP\"></div>",
    usage: "import { cartTotals } from \"@soyrageagency/rage-motion\";\ncartTotals();",
    options: [
      option("scope", "selector | null", "null", "Where to look for lines. Defaults to the whole document."),
      option("lines", "selector", "\"[data-rm-cart-line]\"", "What counts as a line."),
      option("currency", "string", "\"GBP\"", "ISO code passed to Intl. data-rm-currency."),
      option("shipping", "number", "0", "Added to the total; 0 renders as Free. data-rm-shipping."),
      option("settle", "number", "700", "Quiet period before the total is announced, milliseconds."),
    ],
  },
  {
    name: "cartEmpty",
    category: "cart",
    file: MOD_CART,
    attribute: "data-rm-cart-empty",
    summary: "The basket with nothing in it, swapped in and said out loud.",
    notes:
      "An empty basket is a state change rather than a page: the list emptied while the visitor was standing there, so the panel is role=\"status\" and the sentence is actually announced instead of merely appearing. A MutationObserver on the list means it stays correct regardless of what emptied it — this kit, a framework re-render, or a fetch that swapped the markup — which is the failure mode of the version that only toggles when its own remove button is pressed. The panel is hidden from JavaScript on mount rather than in the stylesheet, so a full basket is never briefly shown an empty message by a CSS file that loaded first, and a page whose script never arrives shows both rather than neither. It arrives with a transform and an opacity fade, so nothing around it reflows on the swap.",
    example: "<ul id=\"basket-lines\">…</ul>\n<div data-rm-cart-empty=\"#basket-lines\">\n  <h2>Nothing in here yet</h2>\n  <p>Everything in this demo shop is invented.</p>\n</div>",
    usage: "import { cartEmpty } from \"@soyrageagency/rage-motion\";\ncartEmpty();",
    options: [
      option("list", "selector", "the previous sibling", "The list to watch. The attribute's own value: data-rm-cart-empty=\"#basket-lines\"."),
      option("duration", "number", "420", "The arrival, milliseconds."),
    ],
  },
  {
    name: "cartBadge",
    category: "cart",
    file: MOD_CART,
    attribute: "data-rm-cart-badge",
    summary: "A count on the cart icon that rolls when it changes.",
    notes:
      "Two faces occupy the same grid cell: the old number leaves upward and the new one arrives from below, so going from 2 to 3 reads as an increase rather than as a redraw. The digits sit in a fixed, tabular slot, which is why the header does not shift when the count reaches double figures — the badge is one of the few places where an unconstrained number really will move the navigation around it. The accessible name carries the whole sentence, \"Basket, 3 items\", because a bare 3 beside an icon tells a screen reader three of what, and at zero it says \"empty\" rather than hiding the information along with the pill. It listens for the rm-cart-total event, so a badge in a header stays right without being wired to anything by hand.",
    example: "<a href=\"/basket\" data-rm-cart-badge=\"3\" data-rm-label=\"Basket\">Basket</a>",
    usage: "import { cartBadge } from \"@soyrageagency/rage-motion\";\ncartBadge();",
    options: [
      option("count", "number", "0", "Starting count. The attribute's own value: data-rm-cart-badge=\"3\"."),
      option("label", "string", "\"Basket\"", "The noun in the accessible name. data-rm-label."),
      option("duration", "number", "320", "The roll, milliseconds. data-rm-duration."),
    ],
  },
  {
    name: "miniCart",
    category: "cart",
    file: MOD_CART,
    attribute: "data-rm-mini-cart",
    summary: "A basket preview that opens on hover and, just as importantly, on focus.",
    notes:
      "Every hover behaviour here is also a focus behaviour, because a preview that exists only under a pointer does not exist on a keyboard or on a touchscreen — that single omission is what makes most mini carts decorative rather than useful. The trigger is a real button with aria-expanded and aria-controls, so the panel is announced as something that opened rather than as content that materialised, and Escape closes it and returns focus to the trigger. Closing is delayed by a grace period and the panel carries an invisible bridge across the gap beneath it, since a preview that shuts the instant the cursor leaves the button is a preview nobody can actually reach. The panel is hidden from JavaScript on mount, never from CSS.",
    example: "<div data-rm-mini-cart data-rm-delay=\"220\">\n  <button aria-controls=\"peek\">Basket (2)</button>\n  <div id=\"peek\">\n    <p>Two invented items.</p>\n  </div>\n</div>",
    usage: "import { miniCart } from \"@soyrageagency/rage-motion\";\nminiCart();",
    options: [
      option("delay", "number", "220", "Grace period before it closes, milliseconds. data-rm-delay."),
      option("duration", "number", "240", "The open, milliseconds."),
    ],
  },
  {
    name: "freeShippingBar",
    category: "cart",
    file: MOD_CART,
    attribute: "data-rm-free-shipping",
    summary: "Progress towards a delivery threshold, with the remaining gap in words.",
    notes:
      "It is a real role=\"progressbar\", and the part that matters is aria-valuetext: \"£14.00 to go for free delivery\" is the message, whereas aria-valuenow on its own announces \"62\" and means nothing to anybody. The fill is a scaleX from the left edge rather than a width, so it animates on the compositor and cannot nudge the price sitting beside it — a width transition on a bar in a flex row visibly drags its neighbours. The threshold moment gets exactly one pulse and one polite announcement, and re-arms only if the total drops back below the line, which is the fix for the usual version that re-fires its celebration on every subsequent quantity nudge. It listens for the rm-cart-total event, so it tracks a basket it was never introduced to.",
    example: "<div data-rm-free-shipping data-rm-threshold=\"50\" data-rm-total=\"36\" data-rm-currency=\"GBP\"></div>",
    usage: "import { freeShippingBar } from \"@soyrageagency/rage-motion\";\nfreeShippingBar();",
    options: [
      option("threshold", "number", "50", "The amount that unlocks free delivery. data-rm-threshold."),
      option("total", "number", "0", "Starting basket total. data-rm-total."),
      option("currency", "string", "\"GBP\"", "ISO code passed to Intl. data-rm-currency."),
      option("label", "string", "\"Free delivery progress\"", "The progressbar's accessible name. data-rm-label."),
    ],
  },
  {
    name: "couponField",
    category: "cart",
    file: MOD_CART,
    attribute: "data-rm-coupon",
    summary: "A discount code field with a properly announced applied and rejected state.",
    notes:
      "The two outcomes are announced differently on purpose: an accepted code is polite news, a rejected one is an alert, because it is something the visitor has to act on before they can go any further. After a rejection the field keeps focus with aria-invalid set and the reason wired through aria-describedby, so the message is read as part of the field rather than as a stray red sentence somewhere above it — the usual version announces nothing and simply turns a border red. The shake is a transform and nothing else, and it is skipped entirely under reduced motion, where the message does all the work anyway. Enter is handled explicitly when the component is not mounted on a form, because in a plain div a text field's Enter key does nothing at all, which is why so many coupon boxes can only be used with a mouse. The accepted codes are a demonstration list on the element; real validation belongs on a server and nothing here should be mistaken for it.",
    example: "<form data-rm-coupon data-rm-codes=\"RAGE10,SPRINGDEMO\" data-rm-label=\"Discount code\"></form>",
    usage: "import { couponField } from \"@soyrageagency/rage-motion\";\ncouponField();",
    options: [
      option("codes", "string", "\"\"", "Comma-separated demonstration codes. data-rm-codes."),
      option("label", "string", "\"Discount code\"", "The field's visible label. data-rm-label."),
      option("placeholder", "string", "\"Enter a code\"", "Placeholder text. data-rm-placeholder."),
    ],
  },
  {
    name: "checkoutSteps",
    category: "cart",
    file: MOD_CART,
    attribute: "data-rm-checkout-steps",
    summary: "A multi-step form built from real fieldsets, validated a step at a time.",
    notes:
      "Each step is a fieldset with a legend, which is what makes the group announce itself when focus enters it; a stack of divs with headings loses that grouping entirely. Moving on runs the browser's own checkValidity() across that step only, so nobody is told about a mistake on a page they have not reached, and focus lands on the new step's legend rather than staying on a Continue button that has just changed meaning. The tallest step is measured once and every step is given that minimum height, so the page does not lurch as the form changes shape — that is a layout property set a single time, never animated, and a ResizeObserver re-measures it when the column width changes rather than polling. Hidden steps get inert as well as hidden, so a stray programmatic focus cannot land on a field nobody can see. The incoming step slides in on a transform; the container itself never resizes, which is the whole point of the measurement.",
    example: "<form data-rm-checkout-steps data-rm-step=\"1\">\n  <fieldset><legend>Contact</legend>…</fieldset>\n  <fieldset><legend>Delivery</legend>…</fieldset>\n  <fieldset><legend>Review</legend>…</fieldset>\n</form>",
    usage: "import { checkoutSteps } from \"@soyrageagency/rage-motion\";\ncheckoutSteps();",
    options: [
      option("step", "number", "1", "Which step to start on, counting from 1. data-rm-step."),
      option("label", "string", "\"Checkout\"", "Names the progress rail. data-rm-label."),
      option("duration", "number", "320", "The step change, milliseconds."),
    ],
  },
  {
    name: "orderSummary",
    category: "cart",
    file: MOD_CART,
    attribute: "data-rm-order-summary",
    summary: "The order figures, foldable, with no height animation anywhere.",
    notes:
      "The disclosure button lives inside the heading, which is the pattern that keeps the heading in the document outline while making it operable — wrapping the heading in a button destroys the outline, and putting the button beside it leaves a heading nobody can activate. Opening and closing does not animate a height: the panel is shown or hidden outright and everything below it is put back with a FLIP, which is cheaper than a height transition and honest about the fact that the page really did change size. Under reduced motion the FLIP is skipped and the fold is instant, which is exactly right — the content is never left mid-transition or invisible. The chevron rotates rather than swapping glyphs, so there is no reflow and no second icon to keep in sync.",
    example: "<section data-rm-order-summary data-rm-open=\"true\">\n  <h2>Order summary</h2>\n  <dl>\n    <dt>Subtotal</dt><dd>£48.00</dd>\n    <dt>Delivery</dt><dd>Free</dd>\n  </dl>\n</section>",
    usage: "import { orderSummary } from \"@soyrageagency/rage-motion\";\norderSummary();",
    options: [
      option("open", "boolean", "true", "Whether it starts open. data-rm-open=\"false\" to fold it."),
      option("duration", "number", "300", "The FLIP of everything below, milliseconds."),
    ],
  },
  {
    name: "paymentMethods",
    category: "cart",
    file: MOD_CART,
    attribute: "data-rm-payment-methods",
    summary: "A card-styled picker that is a genuine radio group and chooses a method only.",
    notes:
      "This selects a method — the same kind of choice as a delivery speed — and it never asks for, holds or checks a card number, a CVV or a bank detail; anything that touches real card data belongs in a payment provider's own hosted fields, never in a component kit, and every name in the example is invented. Underneath the card styling there is a real radio group, so arrow keys move between options, the group announces \"2 of 4\", and a form submits the chosen value with no JavaScript at all — all of which the div-with-a-click-handler version has to rebuild badly. The selected card is marked by an indicator that FLIPs from the previous card to the new one, so the eye follows the choice rather than hunting for which box changed colour, and the selection is also carried by a border and by the radio itself, never by colour alone. The indicator is absolutely positioned and sized from a measurement, so writing its size cannot reflow anything, and a ResizeObserver re-places it when the column reflows.",
    example: "<fieldset data-rm-payment-methods>\n  <legend>How would you like to pay?</legend>\n  <label><input type=\"radio\" name=\"method\" value=\"card\" checked> Card</label>\n  <label><input type=\"radio\" name=\"method\" value=\"invoice\"> Invoice (demo)</label>\n  <label><input type=\"radio\" name=\"method\" value=\"collect\"> Pay on collection</label>\n</fieldset>",
    usage: "import { paymentMethods } from \"@soyrageagency/rage-motion\";\npaymentMethods();",
    options: [
      option("label", "string", "\"Payment method\"", "Used only when there is no legend to name the group. data-rm-label."),
      option("duration", "number", "320", "The marker's travel between cards, milliseconds."),
    ],
  },
  {
    name: "addressForm",
    category: "cart",
    file: MOD_CART,
    attribute: "data-rm-address-form",
    summary: "A real address form with a real error summary that takes focus.",
    notes:
      "The browser's own validation bubble appears beside one field, vanishes on the next click and is announced inconsistently, which is why every serious checkout replaces it; here novalidate turns it off and the errors are gathered into a summary at the top of the form. That summary is a role=\"alert\" list of links, each pointing at the field it describes, and focus moves to it on submit so the whole list is read at once rather than one problem at a time. Each field also gets aria-invalid and an aria-describedby pointing at its own message, so the reason is available again when the visitor arrives at the field itself. The error clears the moment the field is edited, because leaving a red border on something somebody has just fixed teaches them to ignore red. Nothing is submitted anywhere — it is a demonstration of the pattern, not a delivery address service.",
    example: "<form data-rm-address-form>\n  <label for=\"line1\">Address line 1</label>\n  <input id=\"line1\" name=\"line1\" autocomplete=\"address-line1\" required>\n  <label for=\"postcode\">Postcode</label>\n  <input id=\"postcode\" name=\"postcode\" autocomplete=\"postal-code\" required>\n  <button type=\"submit\">Save address</button>\n</form>",
    usage: "import { addressForm } from \"@soyrageagency/rage-motion\";\naddressForm();",
    options: [
      option("label", "string", "\"There is a problem\"", "The error summary's heading. data-rm-summary."),
    ],
  },
  {
    name: "deliveryOptions",
    category: "cart",
    file: MOD_CART,
    attribute: "data-rm-delivery-options",
    summary: "Delivery speeds and prices as real radios, with the consequence announced.",
    notes:
      "Another genuine radio group, because the arrow-key behaviour, the \"3 of 3\" and the plain form submission all come free with the right element and have to be rebuilt badly with the wrong one. What this adds is the consequence: choosing a speed changes the arrival date and the price, and both are announced politely, since a visitor who cannot see the card highlight otherwise has no idea anything happened at all. The dates are computed from today rather than written into the markup, so a demonstration never shows a delivery date in the past — a small thing that instantly makes a shop look abandoned. Choosing an option also dispatches rm-cart-change, so a totals row can react to it. The chosen card lifts on a transform; the price and date sit in a tabular column so switching options cannot reflow the row.",
    example: "<fieldset data-rm-delivery-options data-rm-currency=\"GBP\">\n  <legend>Delivery</legend>\n  <label><input type=\"radio\" name=\"ship\" data-rm-price=\"0\" data-rm-days=\"5\" checked> Standard</label>\n  <label><input type=\"radio\" name=\"ship\" data-rm-price=\"4.95\" data-rm-days=\"2\"> Express</label>\n</fieldset>",
    usage: "import { deliveryOptions } from \"@soyrageagency/rage-motion\";\ndeliveryOptions();",
    options: [
      option("price", "number", "0", "Cost of that option. data-rm-price, on each radio."),
      option("days", "number", "3", "Days from today to the arrival date. data-rm-days, on each radio."),
      option("currency", "string", "\"GBP\"", "ISO code passed to Intl. data-rm-currency."),
      option("label", "string", "\"Delivery speed\"", "Used only when there is no legend. data-rm-label."),
    ],
  },
  {
    name: "giftNote",
    category: "cart",
    file: MOD_CART,
    attribute: "data-rm-gift-note",
    summary: "An optional gift message, revealed without a jump and counted without a racket.",
    notes:
      "A checkbox that reveals a textarea, done properly: the checkbox carries aria-expanded and aria-controls, the textarea is genuinely out of the tab order while hidden, and everything below the box is FLIPped back into place instead of having a height animated. Focus moves into the textarea on reveal, because a keyboard user who ticks a box and is left where they were has no idea a field appeared. The character counter is the interesting part — announcing every keystroke makes a live region unbearable, so the count is always visible but only spoken in the last stretch and then only at intervals, once it has become news. The limit is enforced with maxlength rather than by trimming on submit, so nobody types a paragraph that is silently thrown away.",
    example: "<div data-rm-gift-note data-rm-max=\"200\" data-rm-label=\"Add a gift message\"></div>",
    usage: "import { giftNote } from \"@soyrageagency/rage-motion\";\ngiftNote();",
    options: [
      option("max", "number", "200", "Character limit, enforced natively. data-rm-max."),
      option("label", "string", "\"Add a gift message\"", "The checkbox label and the textarea's name. data-rm-label."),
      option("placeholder", "string", "\"Your message\"", "Placeholder text. data-rm-placeholder."),
    ],
  },
  {
    name: "orderConfirm",
    category: "cart",
    file: MOD_CART,
    attribute: "data-rm-order-confirm",
    summary: "The success state, focused, announced, and legible without any animation.",
    notes:
      "The end of a checkout is one of the few moments where moving focus is unambiguously correct — the page has effectively changed — so focus goes to the confirmation heading, and the panel is a polite role=\"status\" so the outcome is read even to somebody who was looking elsewhere when it arrived. The tick draws itself with stroke-dashoffset, which is geometry rather than layout, and the dash is applied from JavaScript at the moment it is going to animate: leaving a stroke-dasharray in the stylesheet would mean a tick that is an invisible line for anyone whose script never ran, which is the same mistake as starting at opacity 0. Under reduced motion the mark is simply already drawn and nothing moves. The reference shown is deliberately fictional and no order is placed anywhere.",
    example: "<div data-rm-order-confirm data-rm-order=\"RM-DEMO-4821\" hidden>\n  <h2>Order placed</h2>\n  <p>A demonstration confirmation for an invented shop.</p>\n</div>",
    usage: "import { orderConfirm } from \"@soyrageagency/rage-motion\";\norderConfirm();",
    options: [
      option("order", "string", "\"RM-DEMO-0000\"", "The fictional reference to show. data-rm-order."),
      option("duration", "number", "720", "The full draw of the tick, milliseconds."),
    ],
  },
  {
    name: "orderTracking",
    category: "cart",
    file: MOD_CART,
    attribute: "data-rm-order-tracking",
    summary: "A stepped delivery tracker that states each stage in words, not just ticks.",
    notes:
      "Every stage renders its state as text — done, in progress, still to come — because a row of coloured circles is a picture of a status rather than a status, and it is unreadable to anyone who cannot separate the filled circles from the empty ones. The current stage carries aria-current=\"step\", which is what lets assistive technology jump straight to where the parcel actually is instead of reading four stages and leaving you to work it out. The connecting line fills with a scaleX from its left edge, so a change of stage animates on the compositor and cannot nudge the addresses printed beneath it. Stage names are read from the markup before anything is added to them, so the announcement says \"Packed, step 2 of 4\" rather than reading back the state word it just inserted.",
    example: "<ol data-rm-order-tracking data-rm-stage=\"2\">\n  <li>Ordered</li>\n  <li>Packed</li>\n  <li>Out for delivery</li>\n  <li>Delivered</li>\n</ol>",
    usage: "import { orderTracking } from \"@soyrageagency/rage-motion\";\norderTracking();",
    options: [
      option("stage", "number", "1", "The current stage, counting from 1. data-rm-stage."),
      option("label", "string", "\"Order progress\"", "Names the list. data-rm-label."),
    ],
  },
  {
    name: "returnRequest",
    category: "cart",
    file: MOD_CART,
    attribute: "data-rm-return-request",
    summary: "A returns form: a reason, a conditional note and a fictional reference.",
    notes:
      "A returns form is where a shop usually resorts to a div masquerading as a dropdown; this is a fieldset of radios with a legend, so the question is announced with the answers and arrow keys work. The free-text box appears only for the reason that needs one, revealed with a FLIP and then focused, so a keyboard user is not left wondering where the new field went — a conditional field that appears silently below the fold is a field nobody fills in. Submitting swaps the form for a confirmation, moves focus to it and makes the form inert, so a stray Shift+Tab cannot wander back into controls that no longer apply. The reference is obviously invented and nothing is sent anywhere.",
    example: "<form data-rm-return-request data-rm-reasons=\"Too small,Not as described,Faulty,Other\"></form>",
    usage: "import { returnRequest } from \"@soyrageagency/rage-motion\";\nreturnRequest();",
    options: [
      option("reasons", "string", "\"Too small,Not as described,Faulty,Other\"", "Comma-separated reasons. \"Other\" reveals the note. data-rm-reasons."),
      option("label", "string", "\"Why are you returning it?\"", "The fieldset's legend. data-rm-label."),
    ],
  },
  {
    name: "invoiceRow",
    category: "cart",
    file: MOD_CART,
    attribute: "data-rm-invoice-row",
    summary: "A table row that opens to show its detail, inside a real table.",
    notes:
      "It stays inside a real table because an invoice is tabular data, and a grid of divs loses every row and column relationship the moment it is read aloud — the amount stops belonging to the invoice number. The detail is a second tr toggled with hidden, and the button that opens it carries aria-expanded and aria-controls, so the relationship is stated rather than implied by proximity. The rows below are FLIPped into their new positions instead of a height being animated, which is the only honest way to animate a table that genuinely changed size. The status is a word first and a colour second: \"Paid\" in blue is fine, blue on its own is a status only some of your visitors receive.",
    example: "<table>\n  <tr data-rm-invoice-row data-rm-state=\"paid\">\n    <td>INV-DEMO-004</td><td>£48.00</td>\n  </tr>\n  <tr><td colspan=\"2\">Two invented items, delivered.</td></tr>\n</table>",
    usage: "import { invoiceRow } from \"@soyrageagency/rage-motion\";\ninvoiceRow();",
    options: [
      option("state", "paid | due | overdue | refunded", "\"paid\"", "The status word and its colour. data-rm-state."),
      option("duration", "number", "300", "The FLIP of the rows below, milliseconds."),
    ],
  },
  {
    name: "saveForLater",
    category: "cart",
    file: MOD_CART,
    attribute: "data-rm-save-for-later",
    summary: "An item moving between the basket and a saved list, by FLIP.",
    notes:
      "The move is the whole component, and it is the thing the naive version gets wrong twice: it animates a height in both lists, and it leaves focus on a button that no longer exists in the place it was. Here the item is measured, moved, inverted and released, so it appears to travel from one list to the other while the browser lays out exactly once — and focus is deliberately placed on the same item's button in its new home, so a keyboard user follows it across rather than being dumped at the top of the document. The move is announced politely, since without it the only feedback is a card vanishing from under the pointer. The button's own wording flips between \"Save for later\" and \"Move to basket\", and the original text is remembered so the cleanup really does put the markup back.",
    example: "<div data-rm-save-for-later>\n  <ul id=\"basket\">\n    <li><h3>Invented Mug</h3><button type=\"button\" data-rm-save>Save for later</button></li>\n  </ul>\n  <ul id=\"saved\"></ul>\n</div>",
    usage: "import { saveForLater } from \"@soyrageagency/rage-motion\";\nsaveForLater();",
    options: [
      option("toggle", "selector", "\"[data-rm-save]\"", "The button inside each item that moves it."),
      option("duration", "number", "380", "The travel between lists, milliseconds."),
    ],
  },
  {
    name: "recentlyViewed",
    category: "cart",
    file: MOD_CART,
    attribute: "data-rm-recently-viewed",
    summary: "A horizontal rail of recent products that scrolls itself and nothing else.",
    notes:
      "Tabbing to a card off the right-hand edge has to bring it into view, and scrollIntoView does that by scrolling every scrollable ancestor including the page — so focusing a thumbnail throws the whole document to wherever the rail happens to be. keepInView does the arithmetic on the one box that should move, which is the difference between a rail that behaves and a page that jumps under the visitor. The arrow buttons are real buttons with real labels, and their disabled state and the edge fades are read from scrollLeft on the shared frame loop inside whileVisible, so a rail below the fold costs nothing at all. The fades are a mask whose length is a 0/1 flag rather than an overlay element, because an overlay sits on top of the links and eats their clicks.",
    example: "<ul data-rm-recently-viewed data-rm-label=\"Recently viewed\">\n  <li><a href=\"#\"><img src=\"/demo-1.jpg\" alt=\"Plate one\"> Invented Mug</a></li>\n  <li><a href=\"#\"><img src=\"/demo-2.jpg\" alt=\"Plate one\"> Very Loud Tote</a></li>\n</ul>",
    usage: "import { recentlyViewed } from \"@soyrageagency/rage-motion\";\nrecentlyViewed();",
    options: [
      option("label", "string", "\"Recently viewed\"", "Names the region. data-rm-label."),
      option("step", "number", "0.8", "How much of the rail's width one arrow press scrolls."),
    ],
  },

  // ── Thirty more, across the kit ──
  {
    name: "pricingTable",
    category: "extras",
    file: MOD_EXTRAS,
    attribute: "data-rm-pricing",
    summary: "Plan cards side by side, with the recommended one marked in the accessibility tree rather than only in colour.",
    notes:
      "The recommended plan is the entire commercial point of a pricing table, and the usual implementation communicates it with a border and a scale — both of which are invisible to a screen reader and to anyone with a high-contrast theme on. This adds `aria-current=\"true\"` and the literal word \"recommended\" into the plan's heading, so the emphasis survives being read aloud. The hover lift is a transform on the card, not a change in padding or scale of the grid track, which is what stops the neighbouring cards from twitching as the pointer crosses them. Cards arrive in a stagger from a start state written by JavaScript, never by the stylesheet, because a pricing table that is blank when the script fails is a pricing table that costs money.",
    example: "<div data-rm-pricing>\n  <article data-rm-plan><h3>Starter</h3><p class=\"price\">£0</p></article>\n  <article data-rm-plan=\"recommended\"><h3>Studio</h3><p class=\"price\">£24</p></article>\n  <article data-rm-plan><h3>Agency</h3><p class=\"price\">£78</p></article>\n</div>",
    usage: "import { pricingTable } from \"@soyrageagency/rage-motion\";\npricingTable();",
    options: [
      option("stagger", "number", "90", "Milliseconds between each card arriving. Also `data-rm-delay`."),
      option("duration", "number", "620", "How long one card takes to arrive."),
      option("label", "string", "\"Pricing plans\"", "Accessible name for the list. Also `data-rm-label`."),
    ],
  },
  {
    name: "planToggle",
    category: "extras",
    file: MOD_EXTRAS,
    attribute: "data-rm-plan-toggle",
    summary: "A monthly/yearly switch built as a real radio group, with a pill that travels by transform.",
    notes:
      "Nearly every billing toggle on the web is two divs and a class, which means it cannot be reached by Tab, cannot be operated by keyboard and announces nothing about which period is selected. This is a `role=\"radiogroup\"` with roving tabindex: one Tab stop for the whole control, arrow keys to move between the choices, and `aria-checked` carrying the answer. The travelling pill is a one-pixel element moved with `translateX` and stretched with `scaleX(width)`, so switching costs a composited transform instead of a layout pass on the row. Prices are swapped by rewriting elements marked `data-rm-price` from their own `data-rm-monthly` and `data-rm-yearly` attributes, which keeps a real, correct price in the HTML before any script runs.",
    example: "<div data-rm-plan-toggle>\n  <button type=\"button\" aria-checked=\"true\">Monthly</button>\n  <button type=\"button\">Yearly</button>\n</div>\n<span data-rm-price data-rm-monthly=\"£24\" data-rm-yearly=\"£240\">£24</span>",
    usage: "import { planToggle } from \"@soyrageagency/rage-motion\";\nplanToggle();",
    options: [
      option("label", "string", "\"Billing period\"", "Accessible name for the radio group. Also `data-rm-label`."),
      option("duration", "number", "340", "How long the pill takes to travel between choices."),
    ],
  },
  {
    name: "featureMatrix",
    category: "extras",
    file: MOD_EXTRAS,
    attribute: "data-rm-feature-matrix",
    summary: "A comparison table with a column beam that follows the pointer and the keyboard, and ticks that say what they mean.",
    notes:
      "The failure mode of a feature matrix is losing your place: eleven columns of identical marks, and by the third row nobody knows which plan they are reading. The fix here is a single absolutely positioned beam moved with `translateX` and `scaleX` to the hovered or focused column, so highlighting costs one transform instead of a class written to ninety cells on every pointer move. The second fix is semantic: `✓` is punctuation to a screen reader, so every mark is replaced with a hidden \"Included\" or \"Not included\" and the glyph itself is `aria-hidden`. Header cells get `scope=\"col\"` and the feature-name column gets `scope=\"row\"` where it is a `th`, which is what lets assistive technology announce \"Studio, unlimited projects, included\" rather than reading a wall of symbols. The beam follows `focusin` as well as `pointerover`, because the links and buttons inside a comparison table are how a keyboard user reads across it.",
    example: "<table data-rm-feature-matrix>\n  <thead><tr><th>Feature</th><th>Starter</th><th>Studio</th></tr></thead>\n  <tbody><tr><th scope=\"row\">Custom domain</th><td>—</td><td>✓</td></tr></tbody>\n</table>",
    usage: "import { featureMatrix } from \"@soyrageagency/rage-motion\";\nfeatureMatrix();",
    options: [
      option("yes", "string", "\"Included\"", "The hidden word given to a tick."),
      option("no", "string", "\"Not included\"", "The hidden word given to a dash."),
    ],
  },
  {
    name: "savingsBadge",
    category: "extras",
    file: MOD_EXTRAS,
    attribute: "data-rm-savings",
    summary: "A \"save 20%\" badge that pops when it changes and is announced politely.",
    notes:
      "This badge sits beside a billing toggle, which means it changes at the exact moment the visitor does something — that makes it news, and news that is only painted is news a large part of the audience never receives. It is therefore a `role=\"status\"` in a polite live region rather than a decorated span. The pop is a scale on the badge alone, so the price it sits next to never moves a pixel; the common version animates a width or a padding and shoves the whole price row sideways every time the plan changes. `rmHide(true)` fades and scales it away rather than setting `display: none`, so the row it lives in keeps its height.",
    example: "<span data-rm-savings=\"20\" data-rm-unit=\"%\">Save 20%</span>",
    usage: "import { savingsBadge } from \"@soyrageagency/rage-motion\";\nsavingsBadge();",
    options: [
      option("prefix", "string", "\"Save \"", "Text before the figure. Also `data-rm-prefix`."),
      option("unit", "string", "\"%\"", "Text after the figure. Also `data-rm-unit`."),
      option("duration", "number", "520", "Length of the pop when the value changes."),
    ],
  },
  {
    name: "quoteCard",
    category: "extras",
    file: MOD_EXTRAS,
    attribute: "data-rm-quote",
    summary: "A testimonial that stays a real blockquote, revealed with a clip-path wipe.",
    notes:
      "Giant decorative quotation marks are the house style for testimonials and also the standard way to have a screen reader read a punctuation character before every quote on the page, so the mark here is `aria-hidden` and the structure underneath stays a `<blockquote>` with its attribution in a `<figcaption>` or `<cite>`. The reveal is a `clip-path` inset wipe rather than a fade, which reads as a card being uncovered; a fade on a block of text reads as a page that has not finished loading, and on a slow connection that is exactly the wrong signal. The attribution follows roughly halfway through the wipe, which is the order the eye takes it in anyway. Under reduced motion nothing is clipped and nothing is faded, because a quote that never appears is worse than a quote that appears instantly.",
    example: "<figure data-rm-quote>\n  <blockquote>They rebuilt our checkout in a fortnight.</blockquote>\n  <figcaption>Ana Ruiz, Head of Product</figcaption>\n</figure>",
    usage: "import { quoteCard } from \"@soyrageagency/rage-motion\";\nquoteCard();",
    options: [
      option("duration", "number", "780", "Length of the wipe."),
      option("mark", "string", "\"“\"", "The decorative glyph. Also `data-rm-mark`."),
    ],
  },
  {
    name: "logoWall",
    category: "extras",
    file: MOD_EXTRAS,
    attribute: "data-rm-logo-wall",
    summary: "Customer logos arriving in a diagonal wave computed from where they actually landed.",
    notes:
      "The delay for each logo comes from its measured x plus y inside the wall, not from its index in the list, which is the difference between a wave that still sweeps diagonally after the grid wraps to two columns on a phone and one that turns into a meaningless left-to-right flicker at every width except the designer's. Logos rest desaturated and come to full strength on hover and on focus — they are almost always links, and a link that only responds to a pointer has no keyboard state at all. The whole wall gets an accessible name so it is announced as a group rather than as a run of unrelated images. Under reduced motion the logos are simply there at full strength, with no start state written at all.",
    example: "<ul data-rm-logo-wall>\n  <li><img src=\"acme.svg\" alt=\"Acme\"></li>\n  <li><img src=\"globex.svg\" alt=\"Globex\"></li>\n</ul>",
    usage: "import { logoWall } from \"@soyrageagency/rage-motion\";\nlogoWall();",
    options: [
      option("duration", "number", "620", "How long one logo takes to arrive."),
      option("speed", "number", "0.55", "Milliseconds of delay per pixel along the diagonal. Also `data-rm-speed`."),
      option("label", "string", "\"Customers\"", "Accessible name for the wall. Also `data-rm-label`."),
    ],
  },
  {
    name: "ratingRow",
    category: "extras",
    file: MOD_EXTRAS,
    attribute: "data-rm-rating-row",
    summary: "A read-only star rating that draws fractions exactly, as one labelled image.",
    notes:
      "A 4.3 rendered as four stars is a rating rounded away, so the filled row sits over the empty row and is cut with a `clip-path` inset — any fraction draws precisely and the animation is a clip rather than a scale, which keeps the star shapes correct throughout. The whole row is one `role=\"img\"` labelled \"4.3 out of 5\"; five separate star elements are read as five things, which is five times the noise for none of the information. This is deliberately not an input: use `stars()` from data.js when the visitor is doing the rating, and this when the number is a fact already known. The numeric readout beside the stars is `aria-hidden` because the row's label already says it, and hearing the score twice is worse than hearing it once.",
    example: "<span data-rm-rating-row data-rm-score=\"4.3\" data-rm-out-of=\"5\">4.3</span>",
    usage: "import { ratingRow } from \"@soyrageagency/rage-motion\";\nratingRow();",
    options: [
      option("score", "number", "0", "The rating. Also `data-rm-score`."),
      option("outOf", "number", "5", "How many stars in total. Also `data-rm-out-of`."),
      option("duration", "number", "720", "How long the fill takes to reach the score."),
    ],
  },
  {
    name: "faqList",
    category: "extras",
    file: MOD_EXTRAS,
    attribute: "data-rm-faq",
    summary: "Questions that open with no measured heights, plus a filter that reports how many matched.",
    notes:
      "Two things are usually wrong with an FAQ. The question is a div with a click handler, so it is unreachable by keyboard; and the answer's height is animated by writing measured pixels, which breaks the instant the text reflows or a font loads late. Here the button is placed inside the existing heading rather than replacing it, so the document outline survives and the operable element is still a real `<button>` with `aria-expanded` and `aria-controls`, and the answer opens with `grid-template-rows: 0fr → 1fr`, which needs no measurement at all. The optional filter is what makes this more than an accordion: it writes \"3 of 12 questions match…\" into a polite live region, because a search box that silently removes rows tells a non-sighted visitor absolutely nothing about what just happened.",
    example: "<div data-rm-faq>\n  <input data-rm-faq-filter type=\"search\" aria-label=\"Filter questions\">\n  <div><h3 data-rm-faq-q>Can I cancel?</h3><div data-rm-faq-a>Any time.</div></div>\n</div>",
    usage: "import { faqList } from \"@soyrageagency/rage-motion\";\nfaqList();",
    options: [
      option("single", "boolean", "true", "Open one at a time. Set `data-rm-single=\"false\"` to allow several."),
      option("duration", "number", "320", "How long an answer takes to open."),
    ],
  },
  {
    name: "helpTip",
    category: "extras",
    file: MOD_EXTRAS,
    attribute: "data-rm-help-tip",
    summary: "An inline \"?\" that opens an explanation and keeps it open long enough to read.",
    notes:
      "A tooltip that closes when the pointer leaves the trigger is unusable for anything longer than three words and simply does not exist on a touch screen, so this is a disclosure rather than a tooltip: a real button with `aria-expanded` pointing at the bubble, opened by click or Enter, closed by Escape or a click outside, and left open while you read it. The bubble is measured once it is in the layout and pushed back inside the window with a `translateX`, so its position comes from real geometry rather than from a guess about which side of the screen the component sits on. Escape stops propagating so it closes the tip without also closing whatever dialog the tip happens to be inside. The bubble text comes from the mounting attribute, which means the explanation is in the markup and translatable rather than hidden in a script.",
    example: "<span data-rm-help-tip=\"Prices exclude VAT and are billed in GBP.\">Total</span>",
    usage: "import { helpTip } from \"@soyrageagency/rage-motion\";\nhelpTip();",
    options: [
      option("label", "string", "\"More information\"", "Accessible name for the button. Also `data-rm-label`."),
      option("glyph", "string", "\"?\"", "The character drawn in the button."),
    ],
  },
  {
    name: "shortcutSheet",
    category: "extras",
    file: MOD_EXTRAS,
    attribute: "data-rm-shortcuts",
    summary: "A keyboard-shortcuts dialog on \"?\", with a real focus trap and a real escape.",
    notes:
      "Every product with shortcuts needs this sheet, and it is usually the least accessible thing in the product — a div that appears, traps nothing and cannot be dismissed without a mouse. This is a `role=\"dialog\"` with `aria-modal`, the rest of the body made `inert` while it is up, Tab cycling inside it, Escape closing it and focus returned to whatever was focused before. It also refuses to open while the visitor is typing in an input, textarea, select or contenteditable, since a shortcut sheet that appears every time somebody types a question mark into a search field is a bug with a keyboard hint attached. Keys in `<dd>` elements are wrapped in `<kbd>`, which is both correct markup and the reason they can be styled as keys without a class on each one.",
    example: "<div data-rm-shortcuts hidden>\n  <dl><dt>Search</dt><dd>/</dd><dt>New</dt><dd>N</dd></dl>\n</div>",
    usage: "import { shortcutSheet } from \"@soyrageagency/rage-motion\";\nshortcutSheet();",
    options: [
      option("key", "string", "\"?\"", "The key that opens it. Also `data-rm-key`."),
      option("label", "string", "\"Keyboard shortcuts\"", "Accessible name for the dialog. Also `data-rm-label`."),
    ],
  },
  {
    name: "tourStep",
    category: "extras",
    file: MOD_EXTRAS,
    attribute: "data-rm-tour",
    summary: "A product tour whose spotlight is a clip-path hole that tracks the real element it points at.",
    notes:
      "The hole in the dimming layer is a `clip-path` polygon cut around the anchor's measured box, not a resized element, which matters because anchors move: a sticky header settles, an image finishes loading, the page scrolls. The cut-out and the panel's `translate` are refreshed on the shared frame loop, and that loop lives inside `whileVisible` on the panel — a hidden panel does not intersect, so the tour costs nothing at all when it is closed. The panel is a `role=\"dialog\"` with a live \"Step 2 of 4\" count and Escape ends the tour with focus returned to whatever started it, because a tour that hijacks focus and cannot be escaped is a modal wearing a friendlier name. The panel flips above the anchor when there is no room below it, measured rather than assumed.",
    example: "<div data-rm-tour hidden>\n  <div data-rm-tour-step data-rm-anchor=\"#save\">Save your work here.</div>\n  <div data-rm-tour-step data-rm-anchor=\"#share\">And share it from here.</div>\n</div>",
    usage: "import { tourStep } from \"@soyrageagency/rage-motion\";\ntourStep();\n\ntour.rmStart();",
    options: [
      option("pad", "number", "8", "Pixels of breathing room around the highlighted element. Also `data-rm-pad`."),
      option("label", "string", "\"Product tour\"", "Accessible name for the dialog. Also `data-rm-label`."),
    ],
  },
  {
    name: "checklistCard",
    category: "extras",
    file: MOD_EXTRAS,
    attribute: "data-rm-checklist",
    summary: "An onboarding checklist with a progress bar that fills by scaleX and items that say \"done\" out loud.",
    notes:
      "A list where completion is carried by a green circle reads identically at 0% and 100% to anyone using the page without sight, so every item carries the words \"done\" or \"to do\" in hidden text and the bar is a `role=\"progressbar\"` with both `aria-valuenow` and an `aria-valuetext` of \"3 of 5 complete\". The bar fills with `scaleX` on a full-width layer rather than by animating a width, because a width transition on a bar inside a card reflows the card on every frame of it. The tick draws with `stroke-dashoffset`, which is the only way to make a check mark that still looks drawn rather than scaled at any size. `rmTick(index)` updates the item, the bar, the announced text and the pop together, so the four never drift apart.",
    example: "<ul data-rm-checklist>\n  <li data-rm-done>Create an account</li>\n  <li>Invite your team</li>\n  <li>Connect a repository</li>\n</ul>",
    usage: "import { checklistCard } from \"@soyrageagency/rage-motion\";\nchecklistCard();",
    options: [
      option("label", "string", "\"Getting started\"", "Accessible name for the list and its progress bar. Also `data-rm-label`."),
      option("duration", "number", "520", "How long the bar takes to reach its new share."),
    ],
  },
  {
    name: "welcomeCard",
    category: "extras",
    file: MOD_EXTRAS,
    attribute: "data-rm-welcome",
    summary: "A first-run card whose contents arrive on a spring and which hands focus on when it is dismissed.",
    notes:
      "The start state for the stagger is written by JavaScript, so with the script blocked the welcome message is simply visible rather than being an invisible block that a brand-new visitor cannot find — which is the worst possible page on which to get that wrong. Dismissal is the part usually done badly: the card is often holding focus when it goes, and hiding a focused element drops the visitor at the top of the document. This moves focus to the next heading or link first and hides the card second. The dismiss control is a real `<button type=\"button\">` with a descriptive label rather than a bare × on a span.",
    example: "<section data-rm-welcome>\n  <h2>Welcome to the studio</h2>\n  <p>Three things worth doing first.</p>\n</section>",
    usage: "import { welcomeCard } from \"@soyrageagency/rage-motion\";\nwelcomeCard();",
    options: [
      option("stagger", "number", "90", "Milliseconds between each child arriving. Also `data-rm-delay`."),
      option("duration", "number", "720", "How long one child takes to arrive."),
      option("dismissible", "boolean", "true", "Whether to add the close button."),
    ],
  },
  {
    name: "footerColumns",
    category: "extras",
    file: MOD_EXTRAS,
    attribute: "data-rm-footer-columns",
    summary: "Footer link columns that fold into accordions on narrow screens — one footer, not two.",
    notes:
      "The trap here is building a wide footer and a stacked accordion footer and shipping both, so every link exists twice in the accessibility tree and a screen reader user walks the whole footer, twice. This is one footer that changes behaviour at a breakpoint watched with `matchMedia`, not with a resize listener. Below it, each heading gains a real button with `aria-expanded`; above it the button is disabled and `aria-expanded` is removed entirely, because leaving the attribute behind means the markup claims a column is collapsed while it is plainly open. The fold is `grid-template-rows: 0fr → 1fr`, so a column with eleven links opens exactly as smoothly as one with three and nothing is ever measured.",
    example: "<div data-rm-footer-columns data-rm-breakpoint=\"720\">\n  <div><h3>Product</h3><ul><li><a href=\"/pricing\">Pricing</a></li></ul></div>\n  <div><h3>Company</h3><ul><li><a href=\"/about\">About</a></li></ul></div>\n</div>",
    usage: "import { footerColumns } from \"@soyrageagency/rage-motion\";\nfooterColumns();",
    options: [
      option("breakpoint", "number", "720", "Width in pixels below which the columns fold. Also `data-rm-breakpoint`."),
      option("duration", "number", "300", "How long a column takes to unfold."),
    ],
  },
  {
    name: "announcementRow",
    category: "extras",
    file: MOD_EXTRAS,
    attribute: "data-rm-announcement",
    summary: "A top strip that rotates between messages without ever changing its own height.",
    notes:
      "Every message is stacked in the same CSS grid cell, so the strip is as tall as its tallest message from the very first frame and rotating cannot nudge the page down; the naive version swaps a text node, and the header changes height the moment a longer sentence comes round, shoving the whole document. The rotation runs inside `whileVisible`, so it stops entirely when the strip scrolls away or the tab goes to the background rather than ticking forever in a hidden tab. It pauses on hover and on focus, which is what makes a link inside a rotating strip actually clickable. The live region is polite: an announcement bar is news, not an emergency, and `assertive` here would interrupt whatever the visitor is reading every few seconds.",
    example: "<div data-rm-announcement data-rm-interval=\"6000\">\n  <p>Free shipping this week</p>\n  <p>New: dark mode is live</p>\n</div>",
    usage: "import { announcementRow } from \"@soyrageagency/rage-motion\";\nannouncementRow();",
    options: [
      option("interval", "number", "5200", "Milliseconds each message is shown. Also `data-rm-interval`."),
      option("duration", "number", "420", "Length of the cross-fade between messages."),
      option("label", "string", "\"Announcements\"", "Accessible name for the region. Also `data-rm-label`."),
    ],
  },
  {
    name: "megaFooter",
    category: "extras",
    file: MOD_EXTRAS,
    attribute: "data-rm-mega-footer",
    summary: "The oversized wordmark footer, moved by the footer's own position on the shared frame loop.",
    notes:
      "The wordmark rises and settles as the footer comes into view, driven by `getBoundingClientRect` mapped through `mapRange` on the one shared rAF the kit runs — not a scroll listener, and not a second animation loop. The work lives inside `whileVisible`, so it stops the instant the footer is behind you, which matters because this sits at the bottom of every page on the site. The wordmark is `aria-hidden` and the real site name stays in a heading above it: a three-hundred-pixel logotype is decoration, and repeating the company name to a screen reader at the end of every page is pure noise. Under reduced motion the mark is simply drawn in place with no transform written at all.",
    example: "<footer data-rm-mega-footer data-rm-word=\"SoyRage\">\n  <h2>SoyRage Agency</h2>\n</footer>",
    usage: "import { megaFooter } from \"@soyrageagency/rage-motion\";\nmegaFooter();",
    options: [
      option("travel", "number", "70", "How far in pixels the wordmark rises. Also `data-rm-travel`."),
      option("word", "string", "\"\"", "Text for the wordmark when the markup does not supply one. Also `data-rm-word`."),
    ],
  },
  {
    name: "sortableTable",
    category: "extras",
    file: MOD_EXTRAS,
    attribute: "data-rm-sortable",
    summary: "Click a header to sort, and the rows FLIP from where they were to where they now are.",
    notes:
      "Sorting is the moment a table stops being trustworthy: the rows change instantly and you cannot tell whether your row moved or disappeared. So every row's top is measured, the DOM is reordered, and each row is animated from its old position with a `translateY` — a FLIP, in which nothing changes size and only a transform runs. The control is a real `<button>` inside the `<th>`, because a `th` with a click handler is not operable by keyboard, and the `th` carries `aria-sort`, which is the attribute assistive technology actually reads to say \"sorted ascending\". Cells may carry `data-rm-value` to sort on a machine value while displaying a formatted one, and an unrecognised `data-rm-sort` falls back to comparing as text rather than being silently ignored.",
    example: "<table data-rm-sortable>\n  <thead><tr><th data-rm-sort=\"text\">Client</th><th data-rm-sort=\"number\">MRR</th></tr></thead>\n  <tbody><tr><td>Acme</td><td data-rm-value=\"2400\">£2,400</td></tr></tbody>\n</table>",
    usage: "import { sortableTable } from \"@soyrageagency/rage-motion\";\nsortableTable();",
    options: [
      option("duration", "number", "420", "How long the rows take to travel to their new places."),
    ],
  },
  {
    name: "stickyHeaderTable",
    category: "extras",
    file: MOD_EXTRAS,
    attribute: "data-rm-sticky-head",
    summary: "A table header that sticks, with a shadow that appears only at the moment it detaches.",
    notes:
      "`position: sticky` does the sticking on its own; the only thing JavaScript adds is knowing *when* it stuck, and that is done with a one-pixel sentinel and an IntersectionObserver rather than a scroll listener — so there is no per-frame work anywhere in this component and nothing runs while the table is off screen. A permanent shadow under a header is a shadow that lies about whether anything is scrolled. It also repairs semantics on the way past by adding `scope=\"col\"` to header cells that lack it, which is what lets a screen reader announce the column name before each value instead of reading a grid of bare numbers. The sticky offset is a custom property, so a table under a fixed site header can be told how far down to stop.",
    example: "<table data-rm-sticky-head data-rm-top=\"64\">\n  <thead><tr><th>Invoice</th><th>Amount</th></tr></thead>\n  <tbody>…</tbody>\n</table>",
    usage: "import { stickyHeaderTable } from \"@soyrageagency/rage-motion\";\nstickyHeaderTable();",
    options: [
      option("top", "number", "0", "Pixels from the top of the viewport where the header stops. Also `data-rm-top`."),
    ],
  },
  {
    name: "rowExpand",
    category: "extras",
    file: MOD_EXTRAS,
    attribute: "data-rm-row-expand",
    summary: "A table row with a detail row underneath it, opened without measuring a height.",
    notes:
      "The detail row lives in the table's own markup, so it is real content that exists without JavaScript and sits in the correct place in the reading order; the common alternative builds a floating panel on click, which puts the detail outside the table entirely and orphans it from the row it describes. Opening uses `grid-template-rows: 0fr → 1fr` inside the detail cell, so the row grows with nothing measured — which matters more in a table than anywhere else, because a measured height computed before a column reflows is a height that is simply wrong. The trigger is a real button whose `aria-controls` points at the detail row's id and whose `aria-expanded` says what state it is in, so a screen reader user knows there is more before they open it.",
    example: "<table data-rm-row-expand>\n  <tbody>\n    <tr data-rm-row><td>INV-0042</td><td>£1,200</td></tr>\n    <tr data-rm-row-detail><td colspan=\"2\">Paid 3 September by card ending 4242.</td></tr>\n  </tbody>\n</table>",
    usage: "import { rowExpand } from \"@soyrageagency/rage-motion\";\nrowExpand();",
    options: [
      option("duration", "number", "300", "How long the detail row takes to open."),
      option("label", "string", "\"Show details\"", "Accessible name for the toggle. Also `data-rm-label` on the row."),
    ],
  },
  {
    name: "tableEmpty",
    category: "extras",
    file: MOD_EXTRAS,
    attribute: "data-rm-table-empty",
    summary: "A no-results state that lives inside the table instead of replacing it.",
    notes:
      "An empty state built by hiding the table and showing a div beside it throws away the header, which is exactly the information somebody needs to understand what they searched. This keeps the table intact and puts one row inside the existing `<tbody>` with a `colspan` counted from the real header row, so the message spans correctly at any column count instead of being wedged into the first column. The message is a polite `role=\"status\"`, because \"no results\" is the answer to something the visitor just did and must not be a silent redraw. `rmRestore()` puts the original rows back exactly, which is what makes it safe to call on every keystroke of a filter.",
    example: "<table data-rm-table-empty data-rm-table-empty=\"No invoices match that filter\">\n  <thead><tr><th>Invoice</th><th>Amount</th></tr></thead>\n  <tbody>…</tbody>\n</table>",
    usage: "import { tableEmpty } from \"@soyrageagency/rage-motion\";\ntableEmpty();",
    options: [
      option("message", "string", "\"Nothing to show\"", "Default text for the empty row. Also the value of `data-rm-table-empty`."),
    ],
  },
  {
    name: "codeBlock",
    category: "extras",
    file: MOD_EXTRAS,
    attribute: "data-rm-code",
    summary: "A code sample with a copy button that announces the copy and a `<pre>` a keyboard can scroll.",
    notes:
      "Two details separate this from the usual snippet block. The confirmation goes into a live region, because a button that changes from an icon to a tick confirms nothing to somebody who cannot see it — and confirming the copy is the entire job of the control. And the `<pre>` is given `tabindex=\"0\"` with a label, because a horizontally scrolling code block that cannot receive focus is a block a keyboard user cannot scroll at all, which is a genuine WCAG failure hiding in almost every documentation site. Clipboard writes fall back to the old selection trick when `navigator.clipboard` is refused, which it is on insecure origins and inside some embeds; a copy button that silently does nothing is worse than an ugly fallback. Line numbers, when asked for, go in an `aria-hidden` gutter outside the `<code>`, so copying gives you the code rather than the code with a column of digits welded to it.",
    example: "<div data-rm-code data-rm-lang=\"js\" data-rm-numbers=\"true\">\n  <pre><code>import { codeBlock } from \"@soyrageagency/rage-motion\";</code></pre>\n</div>",
    usage: "import { codeBlock } from \"@soyrageagency/rage-motion\";\ncodeBlock();",
    options: [
      option("label", "string", "\"Copy code\"", "Accessible name for the copy button. Also `data-rm-label`."),
      option("numbers", "boolean", "false", "Draw a line-number gutter. Also `data-rm-numbers`."),
      option("said", "string", "\"Copied to clipboard\"", "What the live region announces on a successful copy."),
    ],
  },
  {
    name: "diffView",
    category: "extras",
    file: MOD_EXTRAS,
    attribute: "data-rm-diff",
    summary: "Added and removed lines carried by a word and a sign, not only by red and green.",
    notes:
      "A diff carried by two background colours is unreadable to a large minority of the people looking at it and to everybody using a screen reader, so each changed line gets a hidden \"added\" or \"removed\" and a `+` or `−` in a gutter that is `aria-hidden` — the sign is visible without being spoken twice. The reveal runs down the block one line at a time on a transform and opacity, which reads as a patch being applied rather than as content loading. Nothing about the block's size changes while it plays, so a two-hundred-line diff does not push the page around as it reveals. An unrecognised `data-rm-line` value falls back to being treated as context rather than throwing the line away.",
    example: "<div data-rm-diff>\n  <div data-rm-line=\"ctx\">function total(items) {</div>\n  <div data-rm-line=\"del\">  return items.length;</div>\n  <div data-rm-line=\"add\">  return items.reduce(sum, 0);</div>\n</div>",
    usage: "import { diffView } from \"@soyrageagency/rage-motion\";\ndiffView();",
    options: [
      option("stagger", "number", "26", "Milliseconds between lines revealing. Also `data-rm-delay`."),
      option("duration", "number", "320", "How long one line takes to arrive."),
      option("label", "string", "\"Changes\"", "Accessible name for the block. Also `data-rm-label`."),
    ],
  },
  {
    name: "apiRow",
    category: "extras",
    file: MOD_EXTRAS,
    attribute: "data-rm-api-row",
    summary: "One endpoint in a reference: a coloured method badge, an expandable body, and a stable linkable id.",
    notes:
      "API references are read by people arriving from a link somebody pasted them, so the row derives a stable id from its method and path and opens itself when the page's hash matches — arriving at `#post-v1-charges` and finding a closed accordion is the single most annoying thing a reference can do, and it also listens for `hashchange` so in-page links behave the same. The method is a coloured badge with the word still inside it, because POST in orange and DELETE in red are the same shape to anyone who cannot separate those two hues. The summary and the detail are wired with `aria-controls` and `aria-expanded` rather than merely sitting next to each other, and the body opens with `grid-template-rows: 0fr → 1fr` so a parameter table of any length opens without a measured height. An unrecognised method falls back to `get` rather than producing an unstyled badge.",
    example: "<div data-rm-api-row data-rm-method=\"post\" data-rm-path=\"/v1/charges\">\n  <div data-rm-api-detail><p>Creates a charge.</p></div>\n</div>",
    usage: "import { apiRow } from \"@soyrageagency/rage-motion\";\napiRow();",
    options: [
      option("duration", "number", "300", "How long the detail takes to open."),
      option("methods", "string[]", "[\"get\",\"post\",\"put\",\"patch\",\"delete\"]", "Recognised verbs; anything else falls back to get. Set with `data-rm-method`."),
    ],
  },
  {
    name: "uptimeDots",
    category: "extras",
    file: MOD_EXTRAS,
    attribute: "data-rm-uptime",
    summary: "Ninety days of status in one strip, announced as a single sentence rather than ninety elements.",
    notes:
      "Ninety separate bars is ninety things for a screen reader to walk through, so the strip is one `role=\"img\"` labelled \"Uptime: 99.6% over the last 90 days\" — the sentence somebody actually wants — with the individual bars decorative underneath it. The bars grow with `scaleY` from a bottom origin rather than by animating a height, staggered across the strip so it fills left to right without the row ever changing size. Real history is read from child elements carrying `data-rm-state` where the markup provides it, so the page holds the data rather than a script inventing it from a percentage. The strip is focusable and the per-day readout goes into a polite live region, which is what makes the detail available to a keyboard as well as to a pointer.",
    example: "<div data-rm-uptime data-rm-days=\"90\" data-rm-value=\"99.6\">\n  <span data-rm-state=\"up\"></span><span data-rm-state=\"down\"></span>\n</div>",
    usage: "import { uptimeDots } from \"@soyrageagency/rage-motion\";\nuptimeDots();",
    options: [
      option("days", "number", "90", "How many bars to draw. Also `data-rm-days`."),
      option("value", "number", "100", "Uptime percentage, used for the label and for generated bars. Set with `data-rm-value`."),
      option("duration", "number", "520", "How long one bar takes to grow."),
      option("label", "string", "\"Uptime\"", "Name used in the summary sentence. Also `data-rm-label`."),
    ],
  },
  {
    name: "changelogFeed",
    category: "extras",
    file: MOD_EXTRAS,
    attribute: "data-rm-changelog",
    summary: "Dated entries down a rail that fills as the feed passes through the viewport.",
    notes:
      "The rail's fill is a `scaleY` tied to how far the feed has travelled through the window, computed on the shared frame loop and only while the feed is on screen — so a changelog with two hundred entries is not running a scroll handler for the whole page. Entries reveal as they arrive rather than all at once, which is what makes the rail read as a timeline instead of a decorative line beside a list. Dates are promoted to real `<time datetime>` elements from `data-rm-when`, because \"3/9\" is ambiguous to a parser and to about half the world. Under reduced motion the rail is drawn full and every entry is simply present, since a timeline whose entries never appear is a blank page.",
    example: "<ol data-rm-changelog>\n  <li data-rm-when=\"2026-09-03\"><span data-rm-date>3 September</span><h3>v2.1</h3><p>Sortable tables.</p></li>\n</ol>",
    usage: "import { changelogFeed } from \"@soyrageagency/rage-motion\";\nchangelogFeed();",
    options: [
      option("duration", "number", "560", "How long one entry takes to arrive."),
      option("label", "string", "\"Changelog\"", "Accessible name for the feed. Also `data-rm-label`."),
    ],
  },
  {
    name: "bentoGrid",
    category: "extras",
    file: MOD_EXTRAS,
    attribute: "data-rm-bento",
    summary: "Tiles that arrive in a measured wave and dim for the one you are pointing at or focused on.",
    notes:
      "The arrival stagger is derived from each tile's measured position rather than its index, so the wave still sweeps top-left to bottom-right after the grid reflows to a single column — an index-based stagger is correct only at the width it was designed at. Dimming is done by putting one class on the grid and letting CSS fade the siblings, which is a single style recalculation instead of a transform written to eleven elements on every pointer move. Focus is handled identically to hover through `focusin` and `focusout`, since bento tiles are nearly always links and a grid that only reacts to a pointer has no keyboard state whatsoever. Tile widths come from `data-rm-span` fed into a custom property, so the layout is authored in the markup rather than in a pile of nth-child rules.",
    example: "<div data-rm-bento>\n  <a class=\"tile\" data-rm-span=\"2\" href=\"/work\">Selected work</a>\n  <a class=\"tile\" href=\"/about\">Studio</a>\n</div>",
    usage: "import { bentoGrid } from \"@soyrageagency/rage-motion\";\nbentoGrid();",
    options: [
      option("duration", "number", "640", "How long one tile takes to arrive."),
      option("speed", "number", "0.5", "Milliseconds of delay per pixel along the diagonal. Also `data-rm-speed`."),
    ],
  },
  {
    name: "splitPanel",
    category: "extras",
    file: MOD_EXTRAS,
    attribute: "data-rm-split-panel",
    summary: "A draggable divider that moves a ghost line while dragging and commits the layout once, on release.",
    notes:
      "Dragging a splitter normally rewrites the column widths on every pointer move, which reflows both panes and everything inside them sixty times a second; on a pane holding a table or an editor that is visibly janky and on a slow device it is unusable. Here the drag moves a ghost line by `translateX` alone and the real split is committed once, on release — the layout changes exactly one time per drag. The handle is a real `role=\"separator\"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and an `aria-valuetext` sentence, focusable, moved by the arrow keys and sent to the extremes by Home and End, because a splitter that only answers a pointer is a layout nobody using a keyboard can adjust. Pointer capture keeps the drag alive when the pointer leaves the handle, which is the difference between a splitter that follows your hand and one that gives up halfway across.",
    example: "<div data-rm-split-panel data-rm-at=\"40\" data-rm-min=\"20\" data-rm-max=\"80\">\n  <div>Files</div>\n  <div data-rm-split-handle></div>\n  <div>Editor</div>\n</div>",
    usage: "import { splitPanel } from \"@soyrageagency/rage-motion\";\nsplitPanel();",
    options: [
      option("at", "number", "50", "Starting split as a percentage. Also `data-rm-at`."),
      option("min", "number", "15", "Smallest percentage for the first pane. Also `data-rm-min`."),
      option("max", "number", "85", "Largest percentage for the first pane. Also `data-rm-max`."),
      option("step", "number", "2", "Percentage moved by one arrow-key press. Also `data-rm-step`."),
      option("label", "string", "\"Resize panels\"", "Accessible name for the separator. Also `data-rm-label`."),
    ],
  },
  {
    name: "stickyAside",
    category: "extras",
    file: MOD_EXTRAS,
    attribute: "data-rm-sticky-aside",
    summary: "A sidebar that sticks under a fixed header and steps back before it reaches the footer.",
    notes:
      "`position: sticky` handles the sticking; the two things it cannot do are know how far down the page begins under a fixed header and know when it has reached the end of its column. Both are supplied here — the offset as a custom property, the end with a sentinel and an IntersectionObserver — so there is no scroll listener and no per-frame work anywhere in the component, which is why it is safe to leave on a documentation page with thousands of headings. The usual version binds a scroll handler and recalculates offsets on every frame, and on a long page that is the single biggest cause of a sluggish scroll. This component deliberately does not touch `aria-current` on any link inside it: deciding which section is current belongs to whatever knows about the page, and two components fighting over that attribute is a bug nobody enjoys finding.",
    example: "<aside data-rm-sticky-aside data-rm-top=\"88\" aria-label=\"On this page\">\n  <ul><li><a href=\"#intro\">Intro</a></li></ul>\n</aside>",
    usage: "import { stickyAside } from \"@soyrageagency/rage-motion\";\nstickyAside();",
    options: [
      option("top", "number", "24", "Pixels from the top of the viewport where it stops. Also `data-rm-top`."),
      option("label", "string", "\"Section navigation\"", "Accessible name, only applied when the markup has none. Also `data-rm-label`."),
    ],
  },
  {
    name: "dividerMark",
    category: "extras",
    file: MOD_EXTRAS,
    attribute: "data-rm-divider",
    summary: "A section rule that draws itself with a constant stroke weight and is a real separator.",
    notes:
      "The line is an SVG stroke drawn with `stroke-dashoffset`, which keeps its weight constant for the whole animation; the version that scales a div from zero width has a line that is the wrong thickness for most of its travel, and on a hairline against a light background that is plainly visible. `vector-effect: non-scaling-stroke` keeps it honest at any container width. It is also given `role=\"separator\"` with an orientation, so it actually divides the document rather than only looking as though it does — a decorative hairline between two sections is a section break assistive technology never hears about. The optional centre glyph arrives on a spring halfway through the draw, and is `aria-hidden` because it is punctuation, not content.",
    example: "<div data-rm-divider data-rm-mark=\"§\"></div>",
    usage: "import { dividerMark } from \"@soyrageagency/rage-motion\";\ndividerMark();",
    options: [
      option("duration", "number", "900", "How long the line takes to draw. Also `data-rm-duration`."),
      option("mark", "string", "\"\"", "Optional glyph in the middle of the rule. Also `data-rm-mark`."),
    ],
  },
  {
    name: "sectionMark",
    category: "extras",
    file: MOD_EXTRAS,
    attribute: "data-rm-section-mark",
    summary: "A numbered section label that counts itself from document order and marks the section you are in.",
    notes:
      "The numbers are counted from document order rather than written into the markup, so inserting a section in the middle does not mean renumbering everything after it by hand — which is the commonest source of a page that reads \"01, 02, 02, 04\". The number itself is `aria-hidden`, because a screen reader should get the section's own heading, not \"zero three\" recited in front of it. What it does get is `aria-current=\"true\"` on the mark for the section in view, which is a real statement about position rather than a colour change nobody else can perceive. The current section is found with an IntersectionObserver whose root margin brackets the middle band of the viewport, so exactly one section is ever current instead of three fighting over it.",
    example: "<section>\n  <span data-rm-section-mark>Selected work</span>\n  <h2>Recent projects</h2>\n</section>",
    usage: "import { sectionMark } from \"@soyrageagency/rage-motion\";\nsectionMark();",
    options: [
      option("pad", "number", "2", "How many digits the number is padded to. Also `data-rm-pad`."),
      option("from", "number", "1", "The number the first mark starts at."),
    ],
  },

  // ── Ecommerce — storefront and merchandising ──
  {
    name: "heroBanner",
    category: "storefront",
    file: MOD_STOREFRONT,
    attribute: "data-rm-hero-banner",
    summary: "A campaign banner whose heading is a real heading, arriving in a stagger over drifting artwork.",
    notes:
      "The start state is written from JavaScript and cleared the moment the entrance finishes, so a banner whose bundle never arrives is simply an un-animated banner rather than a blank hero. The usual build puts `opacity: 0` on the copy in the stylesheet and reveals it with a class, which turns a slow network, a blocked script or a JavaScript error into an empty box at the top of the shop — the most expensive failure a storefront has. The artwork drifts a few pixels against the scroll as one task on the shared frame loop, wrapped in `whileVisible` so it stops dead once the banner is off screen; the copy is deliberately excluded from that drift, because text sliding under its own headline is unreadable while it moves. The heading is found rather than generated, and the banner is labelled by it, so the region is announced by the campaign's own words.",
    example: "<section data-rm-hero-banner data-rm-depth=\"26\" data-rm-stagger=\"90\">\n  <img src=\"/shop/atelier-window.jpg\" alt=\"A workbench of unglazed beakers beside a tall window\">\n  <h1>The winter table</h1>\n  <p>Stoneware thrown in small batches at the Cloudberry Studio, a shop that does not exist.</p>\n  <a href=\"/collections/winter-table\">See the collection</a>\n</section>",
    usage: "import { heroBanner } from \"@soyrageagency/rage-motion\";\nheroBanner();",
    options: [
      option("duration", "number", "760", "Milliseconds for each line of copy to arrive."),
      option("stagger", "number", "90", "Milliseconds between one line and the next."),
      option("depth", "number", "24", "Pixels of parallax travel on the artwork. 0 switches it off."),
      option("lift", "number", "18", "Pixels each line of copy rises through."),
    ],
  },
  {
    name: "collectionGrid",
    category: "storefront",
    file: MOD_STOREFRONT,
    attribute: "data-rm-collection-grid",
    summary: "A product grid that arrives in order and closes its gaps by FLIP when it is filtered.",
    notes:
      "Filtering is the moment a catalogue normally throws away the visitor's place: cards vanish, survivors snap into new cells, and whatever somebody was reading is four rows further up. Here every survivor is measured before and after the change and played from where it used to be, so the grid closes up in one composited pass and the eye can follow a card across it. The arrival stagger runs once through `watch`, not `whileVisible` — a grid that re-animates from nothing each time you scroll back up reads as a page reloading itself. The new count goes to a polite live region, because the result of pressing a filter is a number and nobody should have to go hunting for it.",
    example: "<div data-rm-collection-grid data-rm-min=\"240\" data-rm-stagger=\"60\" data-rm-noun=\"pieces\">\n  <article data-tone=\"ochre\"><img src=\"/shop/beaker-ochre.jpg\" alt=\"Ochre stoneware beaker\"><h3>Ochre beaker</h3><p>€24</p></article>\n  <article data-tone=\"ink\"><img src=\"/shop/beaker-ink.jpg\" alt=\"Ink stoneware beaker\"><h3>Ink beaker</h3><p>€24</p></article>\n  <article data-tone=\"ochre\"><img src=\"/shop/jug-ochre.jpg\" alt=\"Ochre stoneware jug\"><h3>Ochre jug</h3><p>€38</p></article>\n</div>",
    usage: "import { collectionGrid } from \"@soyrageagency/rage-motion\";\ncollectionGrid();",
    options: [
      option("stagger", "number", "60", "Milliseconds between cards on arrival."),
      option("duration", "number", "620", "Milliseconds for the arrival and for the filter FLIP."),
      option("min", "number", "220", "Narrowest a column may be, in pixels, before the grid drops one."),
      option("noun", "string", "\"products\"", "What the announced count counts."),
    ],
  },
  {
    name: "lookbook",
    category: "storefront",
    file: MOD_STOREFRONT,
    attribute: "data-rm-lookbook",
    summary: "Shoppable hotspots on a photograph that are genuinely buttons, with names you can read.",
    notes:
      "A lookbook is navigation drawn on a picture, which is why it is almost always inaccessible: an absolutely positioned div with a click handler has no name, no role, no tab stop and no keyboard. Every hotspot here is a `<button type=\"button\">` carrying the product name as text that stays on screen, with `aria-expanded`, `aria-controls`, a roving tabindex across the set, and Escape handing focus back to the spot that opened the card. Position is written once from `data-rm-at=\"x,y\"` as percentages — that is placement, not animation — and everything that moves afterwards is a transform, including the pulse ring. The card is `hidden` between openings rather than pushed off screen, because a card that is only translated away still takes clicks and still collects a Tab press from nowhere.",
    example: "<figure data-rm-lookbook data-rm-label=\"Shop the winter table\">\n  <img src=\"/shop/lookbook-window.jpg\" alt=\"A table set with stoneware and linen beside a window\">\n  <button type=\"button\" data-rm-at=\"34,58\" aria-controls=\"look-beaker\">Ochre beaker</button>\n  <button type=\"button\" data-rm-at=\"68,41\" aria-controls=\"look-jug\">Stoneware jug</button>\n  <div id=\"look-beaker\"><h3>Ochre beaker</h3><p>Stoneware, 300ml. €24.</p><a href=\"/p/ochre-beaker\">See it</a></div>\n  <div id=\"look-jug\"><h3>Stoneware jug</h3><p>One litre, dishwasher safe. €38.</p><a href=\"/p/stoneware-jug\">See it</a></div>\n</figure>",
    usage: "import { lookbook } from \"@soyrageagency/rage-motion\";\nlookbook();",
    options: [
      option("duration", "number", "320", "Milliseconds for a card to scale open."),
      option("label", "string", "\"Shop this picture\"", "Name for the group of hotspots."),
    ],
  },
  {
    name: "categoryTiles",
    category: "storefront",
    file: MOD_STOREFRONT,
    attribute: "data-rm-category-tiles",
    summary: "Category tiles whose accessible name is the category, with a zoom that costs no layout.",
    notes:
      "Each tile is one `<a>` around a photograph and a heading, and the link is pointed at the heading with `aria-labelledby` — so it is announced as \"Stoneware, link\" rather than the alt text, the heading and the word \"shop\" run together, which is what a link wrapped around a whole tile produces. When the alt text repeats the heading exactly it is emptied, because a picture beside its own caption is decoration and reading it twice helps nobody. The zoom is a scale on the image inside a clipped frame, applied on hover and on focus alike; `background-size` is the reflex and it is a paint over a large bitmap every frame, where a transform on a layer is neither. The tile matching the current path gets `aria-current=\"page\"`, which costs a line and is the only way a listener can tell where they already are.",
    example: "<nav data-rm-category-tiles data-rm-zoom=\"1.08\" aria-label=\"Collections\">\n  <a href=\"/collections/stoneware\"><img src=\"/shop/tile-stoneware.jpg\" alt=\"A shelf of unglazed stoneware beakers\"><h3>Stoneware</h3></a>\n  <a href=\"/collections/linen\"><img src=\"/shop/tile-linen.jpg\" alt=\"Folded linen cloths in oat and clay\"><h3>Linen</h3></a>\n  <a href=\"/collections/glass\"><img src=\"/shop/tile-glass.jpg\" alt=\"Hand-blown glass tumblers on a windowsill\"><h3>Glass</h3></a>\n</nav>",
    usage: "import { categoryTiles } from \"@soyrageagency/rage-motion\";\ncategoryTiles();",
    options: [
      option("zoom", "number", "1.07", "Scale the photograph reaches on hover or focus."),
      option("stagger", "number", "70", "Milliseconds between tiles arriving."),
      option("duration", "number", "620", "Milliseconds for each tile to arrive."),
    ],
  },
  {
    name: "saleCountdown",
    category: "storefront",
    file: MOD_STOREFRONT,
    attribute: "data-rm-sale-countdown",
    summary: "A countdown that keeps the promise in words and says what happens when it reaches zero.",
    notes:
      "Most sale clocks are four numbers and no sentence, which tells a shopper that something is running out but never what — so this keeps the author's own line as the heading, draws the clock beneath it, and always carries a plain statement of what changes at zero, swapping to that statement when the time is up instead of resting on four zeroes forever. The announcement is the part almost everybody gets wrong: a live region wired to a clock speaks a number every second, which blocks every other message on the page and makes a screen reader useless while the banner is visible. Here the digits are `aria-hidden` and a polite region speaks once a minute in words, plus once when the offer ends. The tick is one task on the shared frame loop inside `whileVisible`, and a cell is only rewritten when its number actually changed; an unparseable end date leaves the author's markup untouched rather than counting down from nothing.",
    example: "<p data-rm-sale-countdown\n   data-rm-ends=\"2027-01-06T09:00:00Z\"\n   data-rm-over=\"The winter sale has ended. Prices are back to full.\"\n   data-rm-announce=\"120\">Winter sale ends in</p>",
    usage: "import { saleCountdown } from \"@soyrageagency/rage-motion\";\nsaleCountdown();",
    options: [
      option("ends", "string", "\"\"", "When it finishes, as any date string Date.parse understands. Unreadable values leave the markup alone."),
      option("over", "string", "\"This offer has ended. Prices are back to full.\"", "The sentence shown and spoken at zero."),
      option("note", "string", "\"When the clock reaches zero the sale prices come off.\"", "The standing line saying what zero means."),
      option("announce", "number", "60", "Seconds between spoken updates. Never lower than 5."),
    ],
  },
  {
    name: "bundleBuilder",
    category: "storefront",
    file: MOD_STOREFRONT,
    attribute: "data-rm-bundle-builder",
    summary: "Pick several items, see one price, and read the saving as a sentence rather than a badge.",
    notes:
      "The choices are real checkboxes in a real fieldset with a legend, and nothing is ever disabled. The tempting shortcut is switching off the remaining boxes once a bundle is full, which leaves a row of dead controls with no explanation; saying \"three chosen, add one more to save 15%\" costs a sentence and tells somebody what to do next. The total repaints on every tick but is only spoken once the pressing stops, because a live region reads every value it is handed and a shopper ticking six boxes would otherwise hear six totals over each other. The figure rolls on a transform inside a cell whose width is fixed by tabular figures, so the saving beside it never shifts sideways mid-read, and the spoken form uses `currencyDisplay: \"name\"` so \"€61.20\" is heard as euros rather than as a symbol.",
    example: "<fieldset data-rm-bundle-builder data-rm-min=\"3\" data-rm-save=\"15\" data-rm-currency=\"EUR\">\n  <legend>Build a bundle, save 15%</legend>\n  <label><input type=\"checkbox\" data-rm-price=\"24\" checked> Ochre beaker — €24</label>\n  <label><input type=\"checkbox\" data-rm-price=\"18\"> Linen cloth — €18</label>\n  <label><input type=\"checkbox\" data-rm-price=\"38\"> Stoneware jug — €38</label>\n  <label><input type=\"checkbox\" data-rm-price=\"12\"> Beeswax candle — €12</label>\n</fieldset>",
    usage: "import { bundleBuilder } from \"@soyrageagency/rage-motion\";\nbundleBuilder();",
    options: [
      option("currency", "string", "\"EUR\"", "ISO code used to format the total."),
      option("locale", "string", "the page language", "Formatting locale for the figures."),
      option("min", "number", "3", "How many must be chosen before the saving applies."),
      option("save", "number", "10", "Percentage off once the minimum is reached."),
      option("delay", "number", "420", "Milliseconds of quiet before the total is announced."),
      option("duration", "number", "300", "Milliseconds for the figure to roll."),
    ],
  },
  {
    name: "sizeGuide",
    category: "storefront",
    file: MOD_STOREFRONT,
    attribute: "data-rm-size-guide",
    summary: "A size guide as a modal dialog around a real table, with the scopes filled in.",
    notes:
      "A size guide is a table, and a table only works if the browser can tell which cell belongs to which heading — so this fills in the missing `scope` attributes, `col` across the head and `row` down the first column. The fashionable version built from divs and a CSS grid is read cell by cell with no idea which measurement belongs to which size, and there is no attribute you can add afterwards to repair it. The dialog opens from any `[aria-controls]` button and makes the rest of the page `inert`, which removes it from the tab order, the virtual cursor and find-in-page in one go; a hand-rolled Tab-wrapping trap does only the first of those. If the table carries several `<tbody data-rm-unit>` bodies a real radio group switches between them, rather than converting numbers behind the visitor's back.",
    example: "<button type=\"button\" aria-controls=\"guide-shirt\">Size guide</button>\n<div id=\"guide-shirt\" data-rm-size-guide data-rm-unit=\"cm\">\n  <h2>Linen shirt — size guide</h2>\n  <table>\n    <thead><tr><th>Size</th><th>Chest</th><th>Length</th></tr></thead>\n    <tbody data-rm-unit=\"cm\"><tr><th>S</th><td>96</td><td>70</td></tr><tr><th>M</th><td>104</td><td>72</td></tr></tbody>\n    <tbody data-rm-unit=\"in\"><tr><th>S</th><td>38</td><td>27.5</td></tr><tr><th>M</th><td>41</td><td>28.5</td></tr></tbody>\n  </table>\n</div>",
    usage: "import { sizeGuide } from \"@soyrageagency/rage-motion\";\nsizeGuide();",
    options: [
      option("label", "string", "\"Size guide\"", "Dialog name when there is no heading inside it."),
      option("duration", "number", "320", "Milliseconds for the dialog to arrive."),
      option("unit", "string", "the first tbody's unit", "Which set of figures is shown first."),
    ],
  },
  {
    name: "stockNotify",
    category: "storefront",
    file: MOD_STOREFRONT,
    attribute: "data-rm-stock-notify",
    summary: "A \"tell me when it is back\" form whose confirmation does not move the page.",
    notes:
      "The form and its confirmation share one grid cell, so the box is already as tall as the taller of them and confirming does not shove the product page down by eighty pixels. The inactive face is `visibility: hidden` rather than `display: none`, which takes it out of the tab order and the accessibility tree while it keeps holding the space open. Validation is the browser's own `checkValidity` on a real `<input type=\"email\" required>`, but the message is ours, in a `role=\"alert\"` wired through `aria-describedby` and `aria-invalid` — the native bubble vanishes at the next click, is not reliably read by assistive technology, and cannot be styled or translated. Nothing is transmitted by the component: with no `action` on the form the submit is prevented and the confirmation is drawn locally, and with a real `action` it gets out of the way entirely.",
    example: "<form data-rm-stock-notify data-rm-name=\"Ochre beaker\" data-rm-done=\"Thank you. We will write as soon as it is back.\">\n  <label for=\"back-in-1\">Email address</label>\n  <input id=\"back-in-1\" type=\"email\" name=\"email\" autocomplete=\"email\" required>\n  <button type=\"submit\">Tell me when it is back</button>\n</form>",
    usage: "import { stockNotify } from \"@soyrageagency/rage-motion\";\nstockNotify();",
    options: [
      option("doneText", "string", "\"Thank you. We will email you once it is back.\"", "The confirmation, also read by `data-rm-done`."),
      option("errorText", "string", "\"Enter an email address so we know where to write.\"", "Shown when the field fails validation."),
      option("name", "string", "\"\"", "Product name added to the spoken confirmation."),
    ],
  },
  {
    name: "productVideo",
    category: "storefront",
    file: MOD_STOREFRONT,
    attribute: "data-rm-product-video",
    summary: "A muted looping product clip with a poster, a real pause button and no off-screen cost.",
    notes:
      "Autoplay is only ever allowed to be silent, so the component sets `muted`, `loop` and `playsinline` itself rather than trusting the markup — `playsinline` is the one everybody forgets, and without it an iPhone takes the clip full screen the instant it starts, on top of the product page. The `play()` promise is caught, because a browser is entitled to refuse and an unhandled rejection there is a console error for a feature that was always optional. A loop running longer than five seconds must be stoppable, so there is a real button, and its label changes between \"Play\" and \"Pause\" — the opposite of the rule for a wishlist heart, and deliberately: a heart's state changes so its name stays put, while here the action changes so the name must follow. Under reduced motion nothing plays at all and the video rests on its poster, which is a picture rather than a blank box.",
    example: "<figure data-rm-product-video data-rm-label=\"the beaker being thrown\">\n  <video src=\"/shop/throwing-a-beaker.mp4\" poster=\"/shop/throwing-a-beaker.jpg\"></video>\n  <figcaption>The ochre beaker, thrown and trimmed in one sitting.</figcaption>\n</figure>",
    usage: "import { productVideo } from \"@soyrageagency/rage-motion\";\nproductVideo();",
    options: [
      option("play", "boolean", "true", "Whether it starts by itself. Reduced motion overrides this to false."),
      option("label", "string", "\"product video\"", "Words after \"Play\" and \"Pause\" on the button."),
    ],
  },
  {
    name: "swatchGallery",
    category: "storefront",
    file: MOD_STOREFRONT,
    attribute: "data-rm-swatch-gallery",
    summary: "One photograph, one alt text, and a real radio group that changes both.",
    notes:
    // impeccable-disable-next-line broken-image: prose naming the tag
      "The usual build stacks one `<img>` per colour and toggles `display`, which downloads every variant before anybody has chosen and leaves five copies of nearly the same alt text in the accessibility tree. Swapping the source of a single element keeps the picture to one node and one description. The next file is decoded before it is swapped in, so the frame never blanks between colours — assigning `src` directly is what produces the white flash people blame on a slow server. The alt is rewritten to name the colour and the change is announced politely, because a control whose only effect is a picture changing does nothing whatsoever for somebody who cannot see the picture. Nothing is announced on mount: the region is already in the document, so its first fill would sound like a choice somebody just made.",
    example: "<div data-rm-swatch-gallery>\n  <img src=\"/shop/beaker-ochre.jpg\" alt=\"Ceramic beaker in ochre\">\n  <fieldset>\n    <legend>Colour</legend>\n    <label><input type=\"radio\" name=\"beaker\" value=\"ochre\" checked data-rm-color=\"#c9922f\" data-rm-src=\"/shop/beaker-ochre.jpg\" data-rm-alt=\"Ceramic beaker in ochre\"> Ochre</label>\n    <label><input type=\"radio\" name=\"beaker\" value=\"ink\" data-rm-color=\"#101014\" data-rm-src=\"/shop/beaker-ink.jpg\" data-rm-alt=\"Ceramic beaker in ink\"> Ink</label>\n  </fieldset>\n</div>",
    usage: "import { swatchGallery } from \"@soyrageagency/rage-motion\";\nswatchGallery();",
    options: [
      option("duration", "number", "380", "Milliseconds for the photograph to cross-fade."),
    ],
  },
  {
    name: "badgeStack",
    category: "storefront",
    file: MOD_STOREFRONT,
    attribute: "data-rm-badge-stack",
    summary: "New, sale and low stock as real text, sorted by urgency and folded behind a real button.",
    notes:
      "Every badge is a real list item with a real sentence in it — \"only 3 left\", not a red dot; \"30% off this week\", not a slash through a price. Colour decorates the words rather than carrying the message, which is the whole difference between a badge somebody can act on and a coloured rectangle. Cards have room for two labels and shops always have four, so the stack sorts by urgency, shows what fits, and folds the rest behind a `<button aria-expanded>`; unfolding is a FLIP, so the row grows without a frame of animated width and the card beneath never jumps. `overflow: hidden` is the usual fix and it throws the remaining labels away visually while leaving them in the tree to be read out anyway. The explicit `role=\"list\"` is there because Safari drops the list role from any list styled without bullets, which is every badge row ever built.",
    example: "<ul data-rm-badge-stack data-rm-max=\"2\">\n  <li data-rm-tone=\"new\">New in</li>\n  <li data-rm-tone=\"sale\">30% off this week</li>\n  <li data-rm-tone=\"low\">Only 3 left</li>\n  <li data-rm-tone=\"info\">Made in Valencia</li>\n</ul>",
    usage: "import { badgeStack } from \"@soyrageagency/rage-motion\";\nbadgeStack();",
    options: [
      option("max", "number", "2", "How many badges show before the rest fold away."),
      option("stagger", "number", "80", "Milliseconds between badges popping in."),
      option("duration", "number", "420", "Milliseconds for a badge to pop and for the unfold FLIP."),
      option("label", "string", "\"Labels\"", "Name for the list of badges."),
    ],
  },
  {
    name: "trustRow",
    category: "storefront",
    file: MOD_STOREFRONT,
    attribute: "data-rm-trust-row",
    summary: "Delivery and returns promises that arrive once, keep their list role, and say it in words.",
    notes:
      "Three or four promises in a row is the most-copied pattern in ecommerce and the one most often built from bare divs with an icon and four words. Two things go wrong. `list-style: none` makes Safari drop the list role, so \"3 promises\" becomes three unrelated sentences, which is why the roles are put back explicitly. And the icon ends up carrying the meaning: a lorry glyph means nothing spoken, so every icon inside a promise is marked `aria-hidden`, given an empty alt where it is an image, and the text is left to do the work. The row arrives once, staggered, from a small translate — never on a loop, because a trust row that re-animates every time it scrolls past reads as an advert rather than as a fact about the shop.",
    example: "<ul data-rm-trust-row data-rm-stagger=\"90\">\n  <li><strong>Free delivery over €60</strong><span>Standard post, 2 to 4 working days.</span></li>\n  <li><strong>60-day returns</strong><span>Unused and in its box. We pay for the label.</span></li>\n  <li><strong>Made in Valencia</strong><span>Thrown, glazed and packed in one workshop.</span></li>\n</ul>",
    usage: "import { trustRow } from \"@soyrageagency/rage-motion\";\ntrustRow();",
    options: [
      option("stagger", "number", "90", "Milliseconds between promises arriving."),
      option("duration", "number", "620", "Milliseconds for each promise to arrive."),
      option("label", "string", "\"Our promises\"", "Name for the list."),
    ],
  },
  {
    name: "shippingEstimate",
    category: "storefront",
    file: MOD_STOREFRONT,
    attribute: "data-rm-shipping-estimate",
    summary: "An arrival window given as real dates, counted in working days and labelled an estimate.",
    notes:
      "\"Ships in 2 to 4 days\" answers a question nobody asked. What a shopper wants to know is whether it arrives before Saturday, so this counts the author's lead time in working days from a real cut-off hour, skips weekends, and writes the answer as dates — each one a `<time datetime>` so the machine-readable form sits beside the human one. It prints the word \"estimate\" in text that cannot be configured away, because a date stated with confidence is a promise and this component knows nothing about the courier. The refresh runs on a slow interval inside `whileVisible` rather than the frame loop: nothing here changes faster than once a minute, and a per-frame timer for that is pure battery. The live region only speaks when the sentence has genuinely changed, so it does not repeat itself sixty times an hour.",
    example: "<p data-rm-shipping-estimate data-rm-min=\"2\" data-rm-max=\"4\" data-rm-cutoff=\"15\"></p>",
    usage: "import { shippingEstimate } from \"@soyrageagency/rage-motion\";\nshippingEstimate();",
    options: [
      option("min", "number", "2", "Soonest arrival, in working days after dispatch."),
      option("max", "number", "4", "Latest arrival, in working days after dispatch."),
      option("cutoff", "number", "15", "Hour of the day, 0 to 23, after which orders go out the next working day."),
      option("locale", "string", "the page language", "Locale used to name the days and months."),
    ],
  },
  {
    name: "recentlyBought",
    category: "storefront",
    file: MOD_STOREFRONT,
    attribute: "data-rm-recently-bought",
    summary: "Social proof that rotates only what the author wrote, stamped illustrative and pausable.",
    notes:
      "This component never invents anybody. It rotates the notices already in the markup and stamps the row with a visible line saying the examples are illustrative — text, not a tooltip, and added even when the author forgot it. Presenting a made-up name and town as a real order is a lie about another person's purchase and, in most of Europe, a complaint away from being an illegal one. The rotation is solved twice for accessibility: a button pauses it, because anything moving for more than five seconds must be stoppable, and a second button shows every notice at once and stops the rotation for good, since otherwise a screen reader only ever gets whichever notice happened to be showing. The list is explicitly `aria-live=\"off\"` — a rotator wired to a live region interrupts the page with an advert every few seconds.",
    example: "<div data-rm-recently-bought data-rm-interval=\"6000\" data-rm-note=\"Illustrative examples from a fictional shop, not real orders.\">\n  <ul>\n    <li>Someone in Bristol chose the Ochre Beaker — about an hour ago</li>\n    <li>Someone in Leeds chose the Linen Cloth — this morning</li>\n    <li>Someone in Cork chose the Stoneware Jug — yesterday</li>\n  </ul>\n</div>",
    usage: "import { recentlyBought } from \"@soyrageagency/rage-motion\";\nrecentlyBought();",
    options: [
      option("interval", "number", "6000", "Milliseconds between notices. Never below 2000."),
      option("note", "string", "\"Illustrative examples, not real orders.\"", "The disclaimer, always rendered as visible text."),
      option("label", "string", "\"Recent activity, illustrative\"", "Name for the region."),
    ],
  },
  {
    name: "crossSell",
    category: "storefront",
    file: MOD_STOREFRONT,
    attribute: "data-rm-cross-sell",
    summary: "A \"goes well with\" rail you can reach, page and read from the keyboard alone.",
    notes:
      "A horizontal strip is a scroll container, and a scroll container with no tab stop is content a keyboard cannot reach at all — so the rail itself gets `tabindex=\"0\"` and a name, which is the fix most carousels are missing. On top of that sit two real buttons that page by the rail's own width and go `disabled` at each end, kept honest by a passive scroll listener and a `ResizeObserver` rather than by arithmetic done once on mount. Focus landing on an item that is off screen is handled with `keepInView`, which scrolls only the box that should move; `scrollIntoView` is the reflex here and it walks every scrollable ancestor including the page, so tabbing through a cross-sell rail throws the whole product page around. The position is announced politely once scrolling settles, never during it.",
    example: "<section data-rm-cross-sell>\n  <h2>Goes well with</h2>\n  <ul>\n    <li><a href=\"/p/linen-cloth\"><img src=\"/shop/linen-cloth.jpg\" alt=\"Folded linen cloth in oat\"><span>Linen cloth — €18</span></a></li>\n    <li><a href=\"/p/stoneware-jug\"><img src=\"/shop/stoneware-jug.jpg\" alt=\"Stoneware jug in ochre\"><span>Stoneware jug — €38</span></a></li>\n    <li><a href=\"/p/beeswax-candle\"><img src=\"/shop/beeswax-candle.jpg\" alt=\"Beeswax candle in a glass\"><span>Beeswax candle — €12</span></a></li>\n  </ul>\n</section>",
    usage: "import { crossSell } from \"@soyrageagency/rage-motion\";\ncrossSell();",
    options: [
      option("label", "string", "the heading, else \"Goes well with\"", "Name for the rail and its paging buttons."),
      option("delay", "number", "350", "Milliseconds of stillness before the position is announced."),
    ],
  },
  {
    name: "upsellRow",
    category: "storefront",
    file: MOD_STOREFRONT,
    attribute: "data-rm-upsell-row",
    summary: "Tiers as real radios, with the upgrade priced as a difference rather than a second total.",
    notes:
      "An upsell row is a choice between tiers, so it is a radio group — not three clickable cards, which is what it usually is. Cards give you no group semantics, no arrow keys, no value in the form and no way to tell which is chosen except by looking at a border. The ring marking the choice FLIPs between labels, so what looks like a box growing is a measured transform with no layout work at all. The upgrade is priced against the cheapest tier — \"18 euros more than Standard\" — because the number somebody is actually deciding about is the gap, and reading two totals and subtracting them is work the page should have done. Any \"our pick\" flag comes from the markup and is rendered as words, so it is a recommendation somebody wrote rather than a coloured border implying one.",
    example: "<fieldset data-rm-upsell-row data-rm-currency=\"EUR\">\n  <legend>Choose your finish</legend>\n  <label><input type=\"radio\" name=\"finish\" value=\"standard\" checked data-rm-price=\"48\"> Standard glaze</label>\n  <label><input type=\"radio\" name=\"finish\" value=\"reactive\" data-rm-price=\"66\" data-rm-pick=\"true\"> Reactive glaze</label>\n  <label><input type=\"radio\" name=\"finish\" value=\"gold\" data-rm-price=\"96\"> Gold rim, hand painted</label>\n</fieldset>",
    usage: "import { upsellRow } from \"@soyrageagency/rage-motion\";\nupsellRow();",
    options: [
      option("currency", "string", "\"EUR\"", "ISO code used to format the difference."),
      option("locale", "string", "the page language", "Formatting locale for the figures."),
      option("duration", "number", "340", "Milliseconds for the ring to move between tiers."),
      option("pickText", "string", "\"Our pick\"", "Words on the flag, for any option carrying data-rm-pick."),
    ],
  },
  {
    name: "giftCard",
    category: "storefront",
    file: MOD_STOREFRONT,
    attribute: "data-rm-gift-card",
    summary: "An amount, a message and a preview that turns — and never a code of any kind.",
    notes:
      "A gift card code is money, so this component has no idea what one looks like: it does not mint, read, store or check one, and there is no field for it. Choosing an amount from a real radio group and carrying a short message is the whole presentational job. The preview is `aria-hidden` and the state is spoken once, debounced, by a polite region — a preview that updates on every keystroke and is also in the accessibility tree reads the message back one character at a time. The character counter is silent for the same reason and only speaks at the moment the limit is reached, which is the one time it is news. The card turns on `rotateY` alone, so nothing around it reflows as the amount changes.",
    example: "<form data-rm-gift-card data-rm-currency=\"EUR\">\n  <fieldset>\n    <legend>Amount</legend>\n    <label><input type=\"radio\" name=\"amount\" value=\"25\" checked> €25</label>\n    <label><input type=\"radio\" name=\"amount\" value=\"50\"> €50</label>\n    <label><input type=\"radio\" name=\"amount\" value=\"100\"> €100</label>\n  </fieldset>\n  <label for=\"gift-message\">Message (optional)</label>\n  <textarea id=\"gift-message\" maxlength=\"120\" rows=\"3\"></textarea>\n</form>",
    usage: "import { giftCard } from \"@soyrageagency/rage-motion\";\ngiftCard();",
    options: [
      option("currency", "string", "\"EUR\"", "ISO code used to format the amount."),
      option("locale", "string", "the page language", "Formatting locale for the amount."),
      option("delay", "number", "500", "Milliseconds of quiet before the card is described aloud."),
      option("duration", "number", "520", "Milliseconds for the card to turn when the amount changes."),
    ],
  },
  {
    name: "loyaltyPoints",
    category: "storefront",
    file: MOD_STOREFRONT,
    attribute: "data-rm-loyalty-points",
    summary: "A points balance with the gap to the next tier, drawn on a bar and said out loud.",
    notes:
      "A real `role=\"progressbar\"` with `aria-valuenow`, `aria-valuemax` and — the one that matters — `aria-valuetext`, so it reads \"320 of 500 points, 180 to free delivery\" instead of \"64 percent\". Nobody has ever wanted a percentage of a loyalty scheme; the useful number is the gap, and the gap is precisely the thing a bar on its own can never say. The fill is a `scaleX` on a bar that is already full width, so awarding points costs one composited frame rather than a re-layout of the panel, and the balance rolls behind a fixed cell of tabular figures. Tiers written into the markup become real text pinned along the track with `aria-current` on the next one to reach — the version drawn as unlabelled notches tells a sighted visitor there is something to aim at and everybody else nothing at all.",
    example: "<div data-rm-loyalty-points data-rm-value=\"320\" data-rm-max=\"500\" data-rm-reward=\"free delivery\">\n  <ul>\n    <li data-rm-value=\"250\">Free postcard</li>\n    <li data-rm-value=\"500\">Free delivery</li>\n  </ul>\n</div>",
    usage: "import { loyaltyPoints } from \"@soyrageagency/rage-motion\";\nloyaltyPoints();",
    options: [
      option("value", "number", "0", "Points held now. `el.rmSet(n)` changes it afterwards."),
      option("max", "number", "500", "Points at the top of the bar."),
      option("reward", "string", "\"your next reward\"", "What the top of the bar is called when there are no tiers."),
      option("duration", "number", "620", "Milliseconds for the bar to fill."),
    ],
  },
  {
    name: "referralBox",
    category: "storefront",
    file: MOD_STOREFRONT,
    attribute: "data-rm-referral-box",
    summary: "A referral link with a copy button whose accessible name never changes.",
    notes:
      "The button is always called \"Copy link\". The version everybody writes swaps the label to \"Copied!\" for two seconds, which changes the button's accessible name underneath a live region that has just said the same thing, so the result is announced twice — and it leaves anybody who tabs back a moment later reading a label about the past rather than about what pressing it will do. The confirmation belongs in the polite region and in the tick beside it, which fades on opacity alone. The clipboard API needs a secure context and a real gesture and can still refuse, so the fallback is not silence: the field is selected and the region says which keys to press. The link itself is a readonly `<input>` with a real `<label>`, because it has to be selectable and readable before it can be copyable.",
    example: "<div data-rm-referral-box data-rm-done=\"Link copied. Send it to a friend.\">\n  <label for=\"referral-1\">Your referral link</label>\n  <input id=\"referral-1\" readonly value=\"https://example.test/r/fictional-code-4821\">\n</div>",
    usage: "import { referralBox } from \"@soyrageagency/rage-motion\";\nreferralBox();",
    options: [
      option("label", "string", "\"Copy link\"", "The button's name. It stays this, always."),
      option("doneText", "string", "\"Link copied to the clipboard.\"", "What the polite region says on success."),
      option("hold", "number", "2400", "Milliseconds the tick stays before fading."),
    ],
  },
  {
    name: "subscribeBox",
    category: "storefront",
    file: MOD_STOREFRONT,
    attribute: "data-rm-subscribe-box",
    summary: "A newsletter form with a real label, a real consent box and a real error summary.",
    notes:
      "Native validation is switched off and reimplemented on purpose, which sounds backwards until you watch somebody use the browser's own bubble: it appears on one field at a time, disappears at the next click, is not reliably read by assistive technology, and cannot be translated or styled. So the form is `novalidate`, `checkValidity` still does the judging, and the verdict goes into a `role=\"alert\"` summary listing each problem as a link straight to its field — the pattern government services settled on because it is the only one that works on a form with more than one error, and the links move focus rather than merely jumping the scroll. The consent box is a real `required` checkbox with the promise written beside it as text, never pre-ticked and never buried in a link. Nothing is transmitted: with no `action` the submit is prevented and the confirmation is drawn in a face sharing the form's grid cell, so the page below never moves.",
    example: "<form data-rm-subscribe-box data-rm-done=\"You are on the list. The first letter goes out on Friday.\">\n  <label for=\"letter-email\">Email address</label>\n  <input id=\"letter-email\" type=\"email\" name=\"email\" autocomplete=\"email\" required>\n  <label><input type=\"checkbox\" name=\"consent\" required> Yes, send me the letter about once a month. Unsubscribe any time.</label>\n  <button type=\"submit\">Subscribe</button>\n</form>",
    usage: "import { subscribeBox } from \"@soyrageagency/rage-motion\";\nsubscribeBox();",
    options: [
      option("doneText", "string", "\"You are on the list. Look out for the first letter.\"", "The confirmation, also read by `data-rm-done`."),
      option("errorText", "string", "\"There is a problem\"", "Heading on the error summary."),
      option("label", "string", "\"Newsletter\"", "Name for the form."),
    ],
  },

  // ── Ecommerce — account, orders and support ──
  {
    name: "orderList",
    category: "account",
    file: MOD_ACCOUNT,
    attribute: "data-rm-order-list",
    summary: "An order history whose filter closes the list up with a FLIP instead of a reflow.",
    notes:
      "Filtering an order history is a list that genuinely changes length, so there is nothing to cross-fade: the rows are measured, the filtered ones are hidden in a single mutation, and the survivors are played back from their old positions on a transform. The version that transitions each row's height instead runs a full layout pass on every frame of the animation, and it runs it on the rows the visitor is still reading. Rows arrive staggered the first time the list is seen and never again, because watch with once is the right primitive here — whileVisible would re-animate a settled order history every time you scrolled back to it, which reads as data still loading. The new count is announced politely afterwards, since a filter that silently removes eleven rows is a control that appears to have done nothing at all.",
    example: "<ul data-rm-order-list data-rm-stagger=\"70\" data-rm-label=\"Your orders\">\n  <li data-rm-state=\"delivered\">Order RM-0031 — delivered 8 April 2031</li>\n  <li data-rm-state=\"shipped\">Order RM-0032 — on its way</li>\n  <li data-rm-state=\"cancelled\">Order RM-0029 — cancelled</li>\n</ul>",
    usage: "import { orderList } from \"@soyrageagency/rage-motion\";\norderList();",
    options: [
      option("stagger", "number", "70", "data-rm-stagger: milliseconds between each row arriving."),
      option("duration", "number", "460", "data-rm-duration: how long one row takes to arrive."),
      option("label", "string", "\"Your orders\"", "data-rm-label: names the list; an existing aria-label is kept and restored."),
      option("state", "string", "\"\"", "data-rm-state on each row: the value rmFilter() matches against."),
    ],
  },
  {
    name: "orderCard",
    category: "account",
    file: MOD_ACCOUNT,
    attribute: "data-rm-order-card",
    summary: "One order, opening to its items with a clip-path wipe rather than a height animation.",
    notes:
      "The detail is toggled with hidden and revealed with a clip-path inset and a small translate, so the layout changes exactly once — on the frame the panel appears — rather than on every frame of a three-hundred-millisecond height transition. The 0fr-to-1fr grid trick that has replaced height animations everywhere has the same cost and the same symptom: every card below this one judders for the length of the animation. The trigger is a real button with aria-expanded and aria-controls, and its accessible name says which order it belongs to, because a page of these is otherwise a column of buttons all called 'Show items'. Before the script runs the detail is simply in the document in reading order, which is what an order looks like with no JavaScript at all.",
    example: "<article data-rm-order-card data-rm-more=\"Show items\" data-rm-less=\"Hide items\">\n  <h3>Order RM-0031 (invented)</h3>\n  <p>Placed 4 April 2031 · £48.00</p>\n  <div data-rm-detail>\n    <ul><li>Kelp mug × 2</li><li>Bracken tea towel × 1</li></ul>\n  </div>\n</article>",
    usage: "import { orderCard } from \"@soyrageagency/rage-motion\";\norderCard();",
    options: [
      option("detail", "selector", "required", "data-rm-detail on the panel to open; a card without one is skipped."),
      option("open", "\"true\" | \"false\"", "\"false\"", "data-rm-open: start with the detail showing."),
      option("duration", "number", "320", "data-rm-duration: length of the clip-path wipe."),
      option("moreText", "string", "\"Show items\"", "data-rm-more: the trigger's text while shut."),
      option("lessText", "string", "\"Hide items\"", "data-rm-less: the trigger's text while open."),
    ],
  },
  {
    name: "orderStatusPill",
    category: "account",
    file: MOD_ACCOUNT,
    attribute: "data-rm-order-status",
    summary: "An order state written as a word, with the colour and the dot's shape as second cues.",
    notes:
      "Amber for packing and green for delivered is a convention that reaches almost nobody who needs it: it is invisible to a screen reader, unreliable for the eight per cent of men with a colour vision deficiency, and gone entirely in a forced-colours theme. So the pill's own text is the word, the dot is aria-hidden decoration, and the dot changes shape as well as hue so the difference survives in greyscale. It is a role=\"status\", which announces changes and stays silent on load, and the words 'Order status' are carried by a span that is read but not drawn — otherwise an update is heard as one bare word arriving from nowhere. An unrecognised state falls back to the default rather than rendering an empty pill, because a typo in the markup should not produce a blank badge on a live page.",
    example: "<p>Order RM-0032 <span data-rm-order-status data-rm-state=\"shipped\"></span></p>",
    usage: "import { orderStatusPill } from \"@soyrageagency/rage-motion\";\norderStatusPill();",
    options: [
      option("state", "\"placed\" | \"packed\" | \"shipped\" | \"delivered\" | \"cancelled\" | \"refunded\"", "\"placed\"", "data-rm-state: which state to draw; anything unrecognised falls back to this."),
      option("prefix", "string", "\"Order status\"", "data-rm-prefix: the spoken-only words before the state."),
    ],
  },
  {
    name: "trackingMap",
    category: "account",
    file: MOD_ACCOUNT,
    attribute: "data-rm-tracking-map",
    summary: "An abstract parcel route in inline SVG, with the stops as real text beside it.",
    notes:
      "This deliberately embeds no map service. A parcel tracker does not need a street plan, and dropping a third-party map into an account page costs a megabyte of script, an API key and a request to somebody else's servers carrying the visitor's address — all for a picture of a line with four dots on it. The real content is the ordered list of stops the author wrote, which stays in the document and carries aria-current=\"step\" on the one reached; the drawing is aria-hidden decoration on top. The completed part of the route is a second coloured copy of the same line revealed by clip-path, and the marker rides along it on a transform eased on the shared frame loop, so the whole animation is two composited properties and no layout — the loop is wrapped in whileVisible, so a page listing six parcels costs nothing once it has scrolled away.",
    example: "<div data-rm-tracking-map data-rm-at=\"2\" data-rm-label=\"Where RM-0032 is\">\n  <ol>\n    <li>Collected</li>\n    <li>At the depot</li>\n    <li>Out for delivery</li>\n    <li>Delivered</li>\n  </ol>\n</div>",
    usage: "import { trackingMap } from \"@soyrageagency/rage-motion\";\ntrackingMap();",
    options: [
      option("at", "number", "0", "data-rm-at: index of the stop reached so far, clamped to the list."),
      option("follow", "number", "0.08", "data-rm-glide: how fast the marker chases its target, 0.01 to 1."),
      option("label", "string", "\"Delivery route\"", "data-rm-label: names the group; an existing aria-label is kept and restored."),
    ],
  },
  {
    name: "deliverySlot",
    category: "account",
    file: MOD_ACCOUNT,
    attribute: "data-rm-delivery-slot",
    summary: "Delivery windows as real radio inputs, with a fully booked slot said out loud.",
    notes:
      "A slot picker is a radio group and nothing more exotic, so it is built from input type=\"radio\" inside a labelled fieldset — which brings arrow-key cycling, a focus ring, a form value and a group name for free. The grid of clickable divs that usually replaces it has none of the four, and it fails silently: the visitor picks a slot, the form submits without one, and the parcel arrives on a day nobody chose. A slot with nothing left is disabled, which removes it from the arrow-key cycle for free, and it also carries the words 'fully booked' as text that is read but not drawn — that second half is what everybody forgets, because a greyed-out tile is announced as 'Thursday, dimmed' and the visitor is left to guess why. The inputs are clipped rather than display:none, since a hidden input keeps none of the behaviour that made it worth using.",
    example: "<fieldset data-rm-delivery-slot>\n  <legend>Choose a delivery slot</legend>\n  <label><input type=\"radio\" name=\"slot\" value=\"thu-am\"> Thursday, 9am to 12pm</label>\n  <label><input type=\"radio\" name=\"slot\" value=\"thu-pm\" data-rm-full=\"true\"> Thursday, 1pm to 6pm</label>\n  <label><input type=\"radio\" name=\"slot\" value=\"fri-am\"> Friday, 9am to 12pm</label>\n</fieldset>",
    usage: "import { deliverySlot } from \"@soyrageagency/rage-motion\";\ndeliverySlot();",
    options: [
      option("full", "\"true\" | \"false\"", "\"false\"", "data-rm-full on an input: marks the slot booked, disabling it and saying so."),
      option("fullText", "string", "\"fully booked\"", "data-rm-label on a full input: the spoken-only reason it cannot be chosen."),
    ],
  },
  {
    name: "addressBook",
    category: "account",
    file: MOD_ACCOUNT,
    attribute: "data-rm-address-book",
    summary: "Saved addresses as one radio group, with the new default promoted to the top by FLIP.",
    notes:
      "The addresses are a single radio group, so exactly one can be the default, the arrow keys move between them and the choice submits with the form. Choosing a new default moves that card to the top — which is genuinely useful, because the default is the one people look for — and the cards it passes are measured first and played back from where they were, so a re-order that really happens looks like one movement rather than a jump. The chosen card carries the word 'Default' as text and not only as a heavier border, since a border weight is not a message. The announcement names the address rather than saying 'selected', because 'selected' on its own is useless in a list of five places you have lived.",
    example: "<fieldset data-rm-address-book data-rm-promote=\"true\">\n  <legend>Delivery addresses</legend>\n  <label><input type=\"radio\" name=\"address\" value=\"home\" checked> Flat 2, 14 Bracken Row, Leeds LS0 0AA</label>\n  <label><input type=\"radio\" name=\"address\" value=\"work\"> Unit 9, Kelp Yard, Hull HU0 0BB</label>\n</fieldset>",
    usage: "import { addressBook } from \"@soyrageagency/rage-motion\";\naddressBook();",
    options: [
      option("promote", "\"true\" | \"false\"", "\"true\"", "data-rm-promote: move the new default to the top of the list."),
      option("duration", "number", "360", "data-rm-duration: how long the cards take to FLIP into their new order."),
      option("defaultWord", "string", "\"Default\"", "data-rm-default-word: the spoken-only flag on the chosen address."),
    ],
  },
  {
    name: "addressCard",
    category: "account",
    file: MOD_ACCOUNT,
    attribute: "data-rm-address-card",
    summary: "An address block whose edit and remove buttons quieten on hover but never leave the page.",
    notes:
      "Actions that appear on hover are nearly always built by giving them display:none until the card is hovered, and that deletes them for everyone who is not holding a mouse: a keyboard Tab skips them, a touch screen has no hover state to offer, and a screen reader is never told the card can be edited at all. Here the buttons are always in the document and always in the tab order; the script adds one class, and the stylesheet fades them only under that class, bringing them back on :hover and on :focus-within together. That also means the start state comes from JavaScript rather than the stylesheet, so a page whose script never arrives shows two perfectly ordinary visible buttons. Each button's accessible name picks up the address it belongs to, because 'Edit' three times down a column is three identical buttons.",
    example: "<article data-rm-address-card data-rm-default=\"true\">\n  <h3>Home</h3>\n  <address>Flat 2, 14 Bracken Row, Leeds LS0 0AA</address>\n  <button type=\"button\">Edit</button>\n  <button type=\"button\">Remove</button>\n</article>",
    usage: "import { addressCard } from \"@soyrageagency/rage-motion\";\naddressCard();",
    options: [
      option("quiet", "\"true\" | \"false\"", "\"true\"", "data-rm-quiet: fade the actions until the card is hovered or focused."),
      option("default", "\"true\" | \"false\"", "\"false\"", "data-rm-default: mark this card as the default address, in words."),
      option("defaultWord", "string", "\"Default address\"", "data-rm-default-word: the text of that flag."),
    ],
  },
  {
    name: "paymentCards",
    category: "account",
    file: MOD_ACCOUNT,
    attribute: "data-rm-payment-cards",
    summary: "Saved payment methods as a radio group — a brand, a masked stub, and no digit ever collected.",
    notes:
      "This picks a saved method and stops. It is a radio group, the same shape as choosing a delivery slot, and it has no field for a card number, no expiry, no security code and nowhere at all to type one — a deliberate hard boundary, because a component kit has no business near a real card and a demo that looks like a payment form teaches the wrong pattern to whoever pastes it next. The guard is enforced rather than merely documented: whatever data-rm-masked contains is reduced to its last four digits behind bullets before anything is drawn, so an author who pastes a full sixteen-digit string into the markup gets four characters back. The brand is written as a word beside the stub because a bare logo is unreadable to a screen reader and indistinguishable from the next logo at small sizes, and the bullets themselves are aria-hidden so the row is announced as 'Fable Bank debit, ending 0000'.",
    example: "<fieldset data-rm-payment-cards>\n  <legend>Pay with a saved method</legend>\n  <label><input type=\"radio\" name=\"method\" value=\"a\" data-rm-brand=\"Fable Bank debit (invented)\" data-rm-masked=\"0000\" checked></label>\n  <label><input type=\"radio\" name=\"method\" value=\"b\" data-rm-brand=\"Kelp Credit Union (invented)\" data-rm-masked=\"0001\"></label>\n</fieldset>",
    usage: "import { paymentCards } from \"@soyrageagency/rage-motion\";\npaymentCards();",
    options: [
      option("brand", "string", "\"Saved method\"", "data-rm-brand on an input: the method's name, drawn as a word."),
      option("masked", "string", "\"\"", "data-rm-masked on an input: reduced to at most four digits behind bullets before it is drawn."),
      option("label", "string", "\"Saved payment methods\"", "data-rm-label: names the group when there is no legend."),
    ],
  },
  {
    name: "subscriptionCard",
    category: "account",
    file: MOD_ACCOUNT,
    attribute: "data-rm-subscription-card",
    summary: "How far through a subscription cycle, as a scaleX bar and as a sentence.",
    notes:
      "The bar is a role=\"progressbar\" whose fill is a scaleX on an element that is already full width, so moving it costs one composited frame instead of a re-layout of the card. What matters more is the aria-valuetext: read as a percentage, 'forty per cent' tells a subscriber nothing, whereas 'day 12 of 30, next delivery 4 May' is the entire answer they opened the page for. Skipping the next delivery is a real toggle button with aria-pressed and a name that never changes, so it is announced as 'Skip the next delivery, pressed' rather than as a button that renamed itself and left the visitor guessing what pressing it again would do. The bar fills once, on arrival, via watch with once — whileVisible would re-fill it from zero every time the card came back on screen, which makes a settled cycle look like live data.",
    example: "<article data-rm-subscription-card data-rm-day=\"12\" data-rm-cycle=\"30\" data-rm-next=\"4 May\">\n  <h3>Kelp coffee, every month (invented)</h3>\n  <p>£14.00 a month, cancel whenever you like.</p>\n</article>",
    usage: "import { subscriptionCard } from \"@soyrageagency/rage-motion\";\nsubscriptionCard();",
    options: [
      option("day", "number", "0", "data-rm-day: days elapsed in the current cycle."),
      option("cycle", "number", "30", "data-rm-cycle: days in a full cycle, at least 1."),
      option("next", "string", "\"\"", "data-rm-next: when the next delivery is due, in words."),
      option("duration", "number", "620", "data-rm-duration: how long the bar takes to fill on arrival."),
      option("skipLabel", "string", "\"Skip the next delivery\"", "data-rm-skip-label: the toggle's fixed name."),
    ],
  },
  {
    name: "pauseSubscription",
    category: "account",
    file: MOD_ACCOUNT,
    attribute: "data-rm-pause-subscription",
    summary: "A two-step disclosure that asks how long to pause and then answers with a date.",
    notes:
      "Pausing a subscription is one of the few destructive-feeling controls in an account, so it is a two-step disclosure rather than a single button: press, choose a length from real radios, confirm. The panel is toggled with hidden and opens with a clip-path wipe, so the card beneath does not judder through a height transition, and Escape closes it and hands focus back to the trigger it came from — losing that return is the failure people notice most. The confirmation is a date rather than a state, because 'paused' tells you nothing you can act on while 'paused until 4 August, deliveries resume automatically' is the whole message, formatted by Intl.DateTimeFormat so it is right in the visitor's own locale. The trigger's name does change here, deliberately: unlike a symmetrical toggle, resuming is a different action from pausing and deserves its own word.",
    example: "<div data-rm-pause-subscription data-rm-months=\"2\">\n  <p>Kelp coffee, every month (invented)</p>\n</div>",
    usage: "import { pauseSubscription } from \"@soyrageagency/rage-motion\";\npauseSubscription();",
    options: [
      option("months", "number", "1", "data-rm-months: which length is pre-selected, 1 to 12."),
      option("choices", "number[]", "[1, 2, 3]", "The pause lengths offered as radios."),
      option("duration", "number", "300", "data-rm-duration: length of the panel's clip-path wipe."),
      option("onPause", "(months, element) => void", "undefined", "Called when the pause is confirmed."),
    ],
  },
  {
    name: "invoiceList",
    category: "account",
    file: MOD_ACCOUNT,
    attribute: "data-rm-invoice-list",
    summary: "Invoices filtered by a native select built from the years actually in the markup.",
    notes:
      "The filter is the browser's own select, and the options are read from the rows rather than written twice, so they cannot go stale. That choice is the component: a native select brings type-ahead, Home and End, the platform picker on a phone and voice control on a desktop, and every div-and-listbox rebuild gives up at least two of those — usually the two nobody tested. Filtering FLIPs the surviving rows so the table closes up in one movement rather than snapping, and the running total is recomputed with Intl.NumberFormat and announced politely once, instead of each disappearing row announcing itself. A total drawn but not spoken is the other half of the same mistake, which is why the same sentence goes to the eye and to the live region.",
    example: "<div data-rm-invoice-list data-rm-currency=\"GBP\">\n  <ul>\n    <li data-rm-year=\"2031\" data-rm-amount=\"48\">RM-0031 — 4 April 2031 — £48.00</li>\n    <li data-rm-year=\"2031\" data-rm-amount=\"14\">RM-0033 — 2 May 2031 — £14.00</li>\n    <li data-rm-year=\"2030\" data-rm-amount=\"112.5\">RM-0022 — 9 November 2030 — £112.50</li>\n  </ul>\n</div>",
    usage: "import { invoiceList } from \"@soyrageagency/rage-motion\";\ninvoiceList();",
    options: [
      option("year", "string", "\"\"", "data-rm-year on each row: the value the filter matches, and the source of the options."),
      option("amount", "number", "0", "data-rm-amount on each row: added into the visible total."),
      option("currency", "string", "\"GBP\"", "data-rm-currency: ISO code passed to Intl.NumberFormat."),
      option("label", "string", "\"Filter by year\"", "data-rm-label: the select's own label text."),
      option("allWord", "string", "\"All years\"", "The text of the unfiltered option."),
    ],
  },
  {
    name: "downloadRow",
    category: "account",
    file: MOD_ACCOUNT,
    attribute: "data-rm-download-row",
    summary: "A file row with a determinate progress bar that refuses to read itself out.",
    notes:
      "The bar is a real role=\"progressbar\" with aria-valuenow, and that is exactly why it is not inside a live region: a percentage in a live region is announced on every value it is given, so a download ticking from 1 to 100 interrupts a screen reader a hundred times and drowns out everything else on the page. A progressbar is polled by assistive technology rather than announced, so only the start and the finish are spoken, which is the whole of what anybody needs to hear. The fill is a scaleX on a track that is already full width, so nothing about the row reflows as it advances, and the file's type and size are written as text beside the name because 'PDF, 284 KB' is information and a red rectangle is not. The component never fetches anything itself — the page drives it through rmProgress, which keeps the presentation and the transfer in separate hands.",
    example: "<ul>\n  <li data-rm-download-row data-rm-file=\"statement-april.pdf\" data-rm-size=\"PDF, 284 KB\">\n    <h3>April statement (invented)</h3>\n  </li>\n</ul>",
    usage: "import { downloadRow } from \"@soyrageagency/rage-motion\";\ndownloadRow();",
    options: [
      option("file", "string", "\"\"", "data-rm-file: the file's name, used when the row has no heading."),
      option("size", "string", "\"\"", "data-rm-size: the type and weight, drawn as text."),
      option("buttonText", "string", "\"Download\"", "data-rm-button: the button's own word."),
      option("onDownload", "(element) => Promise|void", "undefined", "Called on click; a returned promise settles the bar at 100 per cent."),
    ],
  },
  {
    name: "wishlistGrid",
    category: "account",
    file: MOD_ACCOUNT,
    attribute: "data-rm-wishlist-grid",
    summary: "Saved items where removing one FLIPs the rest and hands focus somewhere sensible.",
    notes:
      "Deleting a card from a grid is where keyboard users are most often dropped: the element holding focus is removed, focus falls back to the body, and the next Tab press starts again from the top of a page of forty saved products. So the next focus target is decided before the removal happens — the following item's remove button, or the previous one at the end of the list, or the empty-state message when the last item goes. The survivors FLIP into their new positions, which is the only way to make a grid re-flow legible rather than a snap that loses your place. The empty state is toggled with hidden from JavaScript and given an explicit [hidden] rule, never left sitting behind display:none in the stylesheet, so a page whose script fails shows the real grid instead of a blank column.",
    example: "<ul data-rm-wishlist-grid data-rm-label=\"Saved items\">\n  <li>\n    <img src=\"/photos/kelp-mug.jpg\" alt=\"Glazed stoneware mug in a deep sea green\">\n    <h3>Kelp mug</h3>\n  </li>\n  <li>\n    <img src=\"/photos/bracken-towel.jpg\" alt=\"Linen tea towel with a printed bracken pattern\">\n    <h3>Bracken tea towel</h3>\n  </li>\n</ul>",
    usage: "import { wishlistGrid } from \"@soyrageagency/rage-motion\";\nwishlistGrid();",
    options: [
      option("duration", "number", "340", "data-rm-duration: how long the survivors take to FLIP."),
      option("label", "string", "\"Saved items\"", "data-rm-label: names the grid; an existing aria-label is kept and restored."),
      option("emptyText", "string", "\"Nothing saved yet.\"", "data-rm-empty-text: shown and focused when the last item goes."),
    ],
  },
  {
    name: "reviewForm",
    category: "account",
    file: MOD_ACCOUNT,
    attribute: "data-rm-review-form",
    summary: "A real form with a radio-based rating input and an error summary that takes focus.",
    notes:
      "The rating is five input type=\"radio\" in a fieldset with a legend, clipped rather than display:none so they keep their focus ring, their arrow keys and their form value; every label says '3 stars' in text and the glyphs are aria-hidden decoration. The row of clickable spans that usually stands in for this cannot be reached from a keyboard, cannot be submitted, and is announced as five identical images. On a failed submit an error summary appears at the top with a link to each offending field and takes focus, which is the pattern that actually works — an error rendered quietly beside a control forty lines down is one nobody finds. It is the single assertive region in the module, because a validation failure is the one thing here worth interrupting for; the character counter beside the textarea is polite, since a running count that interrupts on every keystroke is unusable.",
    example: "<form data-rm-review-form data-rm-limit=\"600\" data-rm-scale=\"5\">\n  <label for=\"review-body\">Your review</label>\n  <textarea id=\"review-body\" name=\"body\"></textarea>\n  <button type=\"submit\">Post review</button>\n</form>",
    usage: "import { reviewForm } from \"@soyrageagency/rage-motion\";\nreviewForm();",
    options: [
      option("scale", "number", "5", "data-rm-scale: how many rating radios to build."),
      option("limit", "number", "600", "data-rm-limit: characters allowed in the textarea; 0 turns the counter off."),
      option("glyph", "string", "\"★\"", "The decorative mark repeated in each rating label."),
      option("onSubmit", "({ rating, body }, form) => void", "undefined", "Called only once the form passes its own checks."),
    ],
  },
  {
    name: "reviewCard",
    category: "account",
    file: MOD_ACCOUNT,
    attribute: "data-rm-review-card",
    summary: "A clamped review body that expands from a measurement, with a helpful count that rolls.",
    notes:
      "The body is line-clamped and opened by a real button with aria-expanded, but only when there is genuinely something hidden: the component measures the body's full height against its clamped height and removes the button when the review is short, because a 'read more' that reveals nothing teaches people to stop trusting the control. The measurement is repeated by a ResizeObserver, since whether four lines overflow depends on the column width and the font size, not on a character count. Expanding is a FLIP on the card — the clamp comes off, the new size is measured, and the card is played from its old one — so the reviews below move once instead of on every frame of a height transition. 'Helpful' is a toggle with aria-pressed and a fixed accessible name, and its number rolls inside a tabular slot that cannot change width, so the button never twitches under the pointer.",
    example: "<article data-rm-review-card data-rm-clamp=\"4\" data-rm-helpful=\"12\">\n  <h3>Sturdier than it looks</h3>\n  <p>Bought this for the studio and it has survived a winter of being knocked off the bench. The glaze has one chip and that was entirely my fault.</p>\n</article>",
    usage: "import { reviewCard } from \"@soyrageagency/rage-motion\";\nreviewCard();",
    options: [
      option("clampLines", "number", "4", "data-rm-clamp: lines shown before the body is cut off."),
      option("duration", "number", "340", "data-rm-duration: how long the card takes to FLIP open."),
      option("helpful", "number", "0", "data-rm-helpful: the starting count on the helpful toggle."),
      option("helpfulLabel", "string", "\"Mark this review helpful\"", "data-rm-helpful-label: the toggle's fixed accessible name."),
    ],
  },
  {
    name: "questionAnswer",
    category: "account",
    file: MOD_ACCOUNT,
    attribute: "data-rm-question-answer",
    summary: "Answers to a product question that re-sort by vote, moved by transform.",
    notes:
      "A question with several answers is a list whose order is the information, so a vote that changes the order has to show the change happening — otherwise the page silently rearranges itself and the visitor loses the answer they were halfway through reading. The re-order is a FLIP: every answer is measured, the whole list is re-appended in one mutation, and each one is played back from where it was. The vote is a real toggle button with aria-pressed and a fixed accessible name, and the outcome is announced as a position — 'moved to position 1 of 4, 13 votes' — because a number quietly incrementing somewhere off screen is not feedback. The seller's own answer keeps the top regardless of votes and says so in words rather than relying on a border colour nobody can hear.",
    example: "<section data-rm-question-answer>\n  <h3>Does the lid fit the older size?</h3>\n  <ul>\n    <li data-rm-votes=\"8\">Yes — mine fits the 2029 one exactly.</li>\n    <li data-rm-votes=\"3\" data-rm-seller=\"true\">The lid is shared across both sizes.</li>\n    <li data-rm-votes=\"1\">Fits, but it is a firmer push than the new one.</li>\n  </ul>\n</section>",
    usage: "import { questionAnswer } from \"@soyrageagency/rage-motion\";\nquestionAnswer();",
    options: [
      option("votes", "number", "0", "data-rm-votes on each answer: its starting score."),
      option("seller", "\"true\" | \"false\"", "\"false\"", "data-rm-seller on an answer: pins it above the rest and flags it in words."),
      option("duration", "number", "380", "data-rm-duration: how long the answers take to FLIP into a new order."),
      option("voteLabel", "string", "\"Mark this answer useful\"", "data-rm-vote-label: the fixed name on every vote button."),
      option("sellerWord", "string", "\"Answer from the seller\"", "data-rm-seller-word: the text of the seller flag."),
    ],
  },
  {
    name: "supportTicket",
    category: "account",
    file: MOD_ACCOUNT,
    attribute: "data-rm-support-ticket",
    summary: "A ticket with a conversation and a reply box, both of which hand focus back.",
    notes:
      "Two disclosures on one card, and the component is really about where focus goes. Opening the reply moves focus into the textarea, because a box that appears and leaves the cursor forty elements away is a box nobody types into, and Escape closes it and puts focus back on the button that opened it — being dropped at the top of a ticket list is the fastest way to lose a support conversation. Both panels are toggled with hidden and opened with a clip-path wipe rather than a height transition, so the ticket below does not judder while one above it expands. The 'updated 3 hours ago' line is Intl.RelativeTimeFormat from a plain number of hours, so the platform translates it instead of the string being hard-coded in English, and the machine-readable instant goes into a time element's datetime for anything parsing the page.",
    example: "<article data-rm-support-ticket data-rm-ref=\"RM-TKT-0044\" data-rm-state=\"open\" data-rm-since=\"3\">\n  <h3>Parcel marked delivered but not here</h3>\n  <div data-rm-thread>\n    <p>Thanks for getting in touch — we have asked the courier for the drop-off photograph.</p>\n  </div>\n</article>",
    usage: "import { supportTicket } from \"@soyrageagency/rage-motion\";\nsupportTicket();",
    options: [
      option("ref", "string", "\"\"", "data-rm-ref: the ticket reference, drawn as text."),
      option("state", "\"open\" | \"answered\" | \"resolved\"", "\"open\"", "data-rm-state: the ticket's state, written as a word."),
      option("since", "number", "0", "data-rm-since: hours since the last update, formatted by Intl.RelativeTimeFormat."),
      option("duration", "number", "300", "data-rm-duration: length of each panel's clip-path wipe."),
      option("onReply", "(text, element) => void", "undefined", "Called with the reply text when Send is pressed."),
    ],
  },
  {
    name: "chatBubble",
    category: "account",
    file: MOD_ACCOUNT,
    attribute: "data-rm-chat-bubble",
    summary: "A message thread that only scrolls to the newest message when you were already at the bottom.",
    notes:
      "This mounts on the thread rather than on one bubble, because a bubble cannot answer the question that matters: was the reader at the bottom when the message arrived? A thread that scrolls to the newest message unconditionally yanks the page away from somebody reading six messages back, every single time, and it is the most complained-about behaviour in every support chat ever shipped — so the pin is checked first and a reader who has scrolled up is offered a button instead. The scroll itself goes through keepInView, which moves this container and nothing else; scrollIntoView walks up and scrolls every scrollable ancestor including the page. The thread is a role=\"log\" with aria-live=\"polite\" and aria-relevant=\"additions\", so arriving messages are read in order without interrupting, and each bubble names its author in text rather than relying on which side of the column it happens to sit on.",
    example: "<ul data-rm-chat-bubble data-rm-label=\"Conversation about RM-TKT-0044\">\n  <li data-rm-from=\"them\" data-rm-author=\"Ines at support\"><p>Thanks for the photograph.</p></li>\n  <li data-rm-from=\"you\" data-rm-author=\"You\"><p>No problem — the box was empty when it arrived.</p></li>\n</ul>",
    usage: "import { chatBubble } from \"@soyrageagency/rage-motion\";\nchatBubble();",
    options: [
      option("from", "\"you\" | \"them\"", "\"them\"", "data-rm-from on each bubble: which side of the thread it belongs to."),
      option("author", "string", "\"\"", "data-rm-author on each bubble: written above the message as text."),
      option("duration", "number", "320", "data-rm-duration: how long an arriving bubble takes to settle."),
      option("label", "string", "\"Conversation\"", "data-rm-label: names the log; an existing aria-label is kept and restored."),
      option("newText", "string", "\"New message\"", "data-rm-new-text: the button offered to a reader who has scrolled up."),
    ],
  },
  {
    name: "refundStatus",
    category: "account",
    file: MOD_ACCOUNT,
    attribute: "data-rm-refund-status",
    summary: "Three refund stages filled by clip-path, with the whole answer said in one line.",
    notes:
      "A refund is the most anxious thing in an account, so the component's whole job is one complete sentence: which stage it has reached, how much, where the money goes back to and roughly when. A row of ticks answers none of those and a bare 'processing' answers the least useful one. The filled bar is a coloured copy of the same three-stage track revealed with a clip-path inset, which is a paint-only property — the usual build animates the fill's width, which re-lays-out the row on every frame, and on a page listing four refunds that is four rows on every frame. Where the money returns to is described as 'the method you paid with' and never as a card number, because this component has no business knowing one; an unrecognised stage falls back to the first rather than drawing an empty track.",
    example: "<div data-rm-refund-status data-rm-stage=\"approved\" data-rm-amount=\"48\" data-rm-currency=\"GBP\" data-rm-days=\"5\"></div>",
    usage: "import { refundStatus } from \"@soyrageagency/rage-motion\";\nrefundStatus();",
    options: [
      option("stage", "\"requested\" | \"approved\" | \"paid\"", "\"requested\"", "data-rm-stage: how far the refund has got; anything else falls back to the first."),
      option("amount", "number", "0", "data-rm-amount: the sum, formatted by Intl.NumberFormat; 0 leaves it out."),
      option("currency", "string", "\"GBP\"", "data-rm-currency: ISO code for the amount."),
      option("days", "number", "5", "data-rm-days: working days quoted once the refund is sent."),
      option("duration", "number", "620", "data-rm-duration: how long the clip-path fill takes on arrival."),
    ],
  },
  {
    name: "accountNav",
    category: "account",
    file: MOD_ACCOUNT,
    attribute: "data-rm-account-nav",
    summary: "An account side nav with aria-current, a marker that FLIPs, and unread counts in words.",
    notes:
      "The current page is marked with aria-current=\"page\", which is the attribute that actually tells anybody where they are — a class called is-active is a paint job and nothing more. When no data-rm-current is given the component matches the links against the document's own pathname, so the nav is correct on every page without the markup being edited per page. The marker is one element that FLIPs from link to link, measured and then moved with a transform, rather than a bar whose top and height are transitioned, which would be a layout animation on every frame of a decoration; a ResizeObserver re-measures when the column reflows, since a position taken from a measurement is only true until the container changes. Unread counts are drawn as a number and read as '3 new', because a bare '3' beside 'Orders' could mean anything at all.",
    example: "<nav data-rm-account-nav data-rm-current=\"/account/orders\" data-rm-label=\"Account\">\n  <a href=\"/account\">Overview</a>\n  <a href=\"/account/orders\" data-rm-tally=\"3\">Orders</a>\n  <a href=\"/account/addresses\">Addresses</a>\n  <a href=\"/account/support\" data-rm-tally=\"1\" data-rm-word=\"unread\">Support</a>\n</nav>",
    usage: "import { accountNav } from \"@soyrageagency/rage-motion\";\naccountNav();",
    options: [
      option("current", "string", "\"\"", "data-rm-current: the href of the current page; falls back to matching location.pathname."),
      option("tally", "number", "0", "data-rm-tally on a link: an unread count, drawn as a badge and spoken as words."),
      option("word", "string", "\"new\"", "data-rm-word on a link: the noun read after the count."),
      option("duration", "number", "340", "data-rm-duration: how long the marker takes to FLIP between links."),
      option("label", "string", "\"Account\"", "data-rm-label: names the navigation landmark."),
    ],
  },

  // ── Writing and editing surfaces ──
  {
    name: "editorToolbar",
    category: "editor",
    file: MOD_EDITOR,
    attribute: "data-rm-editor-toolbar",
    summary: "A real toolbar: one tab stop, arrows inside it.",
    notes:
      "A toolbar built as a plain row of buttons puts fifteen tab stops between the text and whatever follows it, which is why nobody who works by keyboard uses one. This is role=\"toolbar\" with a roving tabindex: exactly one button is reachable with Tab, the arrow keys move within the group, and Home and End jump to the ends. Any button that already carries aria-pressed is treated as a toggle and flipped on click, so \"bold is on\" is a fact an assistive technology can report rather than a shade of grey. The press feedback is a scale on the button itself, so the row never reflows as states change and a neighbouring control never moves out from under the pointer.",
    example: "<div data-rm-editor-toolbar data-rm-label=\"Text formatting\">\n  <button type=\"button\" aria-pressed=\"false\"><b>B</b><span class=\"rm-editor-quiet\"> Bold</span></button>\n  <button type=\"button\" aria-pressed=\"false\"><i>I</i><span class=\"rm-editor-quiet\"> Italic</span></button>\n  <button type=\"button\" aria-pressed=\"true\">H2</button>\n  <button type=\"button\" aria-pressed=\"false\">Quote</button>\n  <button type=\"button\" aria-pressed=\"false\">Code</button>\n  <button type=\"button\">Link</button>\n</div>",
    usage: "import { editorToolbar } from \"@soyrageagency/rage-motion\";\neditorToolbar();",
    options: [
      option("label", "string", "\"Formatting\"", "Accessible name for the toolbar; data-rm-label per element."),
      option("orientation", "string", "\"horizontal\"", "\"horizontal\" or \"vertical\" - decides which arrow keys move between buttons; data-rm-orientation per element."),
      option("items", "string", "\"button\"", "Selector for the controls the roving tabindex governs."),
    ],
  },
  {
    name: "bubbleMenu",
    category: "editor",
    file: MOD_EDITOR,
    attribute: "data-rm-bubble-menu",
    summary: "Formatting at the selection, reachable without a mouse.",
    notes:
      "It appears above whatever is selected, positioned with a transform on a fixed element, so following the selection costs a composited transform rather than a layout and nothing in the document moves to make room. The part almost every version forgets is the keyboard: selecting with Shift and the arrow keys is how a great many people select anything, and a bar that only listens for mouseup simply never appears for them - so this listens to selectionchange, and Alt+F10, the key that reaches a toolbar in every desktop application, moves focus into it. Escape hands focus back to the exact spot in the text it came from. It is hidden from script on mount rather than from the stylesheet, so a page whose JavaScript failed shows a plain row of buttons instead of nothing.",
    example: "<div data-rm-editor-surface contenteditable=\"true\">\n  <p>Select any part of this sentence and the formatting bar appears above it.</p>\n</div>\n<div data-rm-bubble-menu data-rm-offset=\"12\">\n  <button type=\"button\" aria-pressed=\"false\">Bold</button>\n  <button type=\"button\" aria-pressed=\"false\">Italic</button>\n  <button type=\"button\" aria-pressed=\"false\">Link</button>\n  <button type=\"button\">Comment</button>\n</div>",
    usage: "import { bubbleMenu } from \"@soyrageagency/rage-motion\";\nbubbleMenu();",
    options: [
      option("surface", "string", "\"[data-rm-editor-surface]\"", "Selector for the writing surface, used when the attribute carries no id."),
      option("label", "string", "\"Formatting for the selection\"", "Accessible name for the bar; data-rm-label per element."),
      option("offset", "number", "10", "Pixels between the top of the selection and the bar; data-rm-offset per element."),
      option("items", "string", "\"button\"", "Selector for the buttons inside the bar."),
    ],
  },
  {
    name: "slashMenu",
    category: "editor",
    file: MOD_EDITOR,
    attribute: "data-rm-slash-menu",
    summary: "A command palette a character opens, filtering as you type.",
    notes:
      "The commands live in the markup as a real list, so they are readable content before any script runs and the filter is doing nothing more grand than hiding rows. The trigger only counts at the start of a word, which is the check that keeps a URL from opening a menu halfway through every path segment. Choosing a command takes the typed \"/heading\" back out of the document and fires rm-slash-pick with the command's value, and Escape closes the list while leaving the text exactly as typed, because sometimes a slash is a slash. The caret never leaves the surface: the list is driven by aria-activedescendant, since moving real focus into it would end the typing session, which is the flaw in every version built out of a menu of buttons.",
    example: "<textarea data-rm-editor-surface id=\"draft\" rows=\"6\">Type / on a new line</textarea>\n<ul data-rm-slash-menu=\"draft\" data-rm-trigger=\"/\" data-rm-label=\"Insert a block\">\n  <li data-rm-value=\"h2\">Heading</li>\n  <li data-rm-value=\"quote\">Quote</li>\n  <li data-rm-value=\"code\">Code block</li>\n  <li data-rm-value=\"list\">Bulleted list</li>\n  <li data-rm-value=\"table\">Table</li>\n  <li data-rm-value=\"divider\">Divider</li>\n</ul>",
    usage: "import { slashMenu } from \"@soyrageagency/rage-motion\";\nslashMenu();",
    options: [
      option("surface", "string", "\"[data-rm-editor-surface]\"", "Selector for the writing surface, used when the attribute carries no id."),
      option("trigger", "string", "\"/\"", "The character that opens the list; data-rm-trigger per element."),
      option("label", "string", "\"Commands\"", "Accessible name for the listbox; data-rm-label per element."),
      option("noMatch", "string", "\"No matching command\"", "Shown when the query matches nothing; data-rm-no-match per element."),
      option("offset", "number", "6", "Pixels between the caret and the list; data-rm-offset per element."),
      option("optionSelector", "string", "\"li, [role=\\\"option\\\"]\"", "Selector for the command rows inside the panel."),
    ],
  },
  {
    name: "mentionPicker",
    category: "editor",
    file: MOD_EDITOR,
    attribute: "data-rm-mention-picker",
    summary: "A real combobox that inserts the name it announced.",
    notes:
      "The same machinery as the slash menu with two differences that matter. The query may contain a space, because people have two names and a picker that closes at the first one can never find Nora Vale. And choosing somebody writes into the document rather than firing an event for the page to interpret: the text written is data-rm-value when it is there, so the document can carry a handle while the list shows a person and a job title. The combobox wiring is genuine - aria-controls, aria-expanded and aria-activedescendant on the surface, aria-selected on the row - which is what makes the highlighted person the person a screen reader reads, and a polite live region confirms who was inserted once the choice is made.",
    example: "<div data-rm-editor-surface id=\"reply\" contenteditable=\"true\">Ask @</div>\n<ul data-rm-mention-picker=\"reply\" data-rm-trigger=\"@\" data-rm-label=\"Mention somebody\">\n  <li data-rm-value=\"@nora\"><img src=\"/people/nora-vale.jpg\" alt=\"Nora Vale\"> Nora Vale &mdash; Design</li>\n  <li data-rm-value=\"@amina\"><img src=\"/people/amina-diaz.jpg\" alt=\"Amina Diaz\"> Amina Diaz &mdash; Engineering</li>\n  <li data-rm-value=\"@tomas\"><img src=\"/people/tomas-reid.jpg\" alt=\"Tomas Reid\"> Tomas Reid &mdash; Support</li>\n  <li data-rm-value=\"@priya\"><img src=\"/people/priya-nair.jpg\" alt=\"Priya Nair\"> Priya Nair &mdash; Legal</li>\n</ul>",
    usage: "import { mentionPicker } from \"@soyrageagency/rage-motion\";\nmentionPicker();",
    options: [
      option("surface", "string", "\"[data-rm-editor-surface]\"", "Selector for the writing surface, used when the attribute carries no id."),
      option("trigger", "string", "\"@\"", "The character that opens the list; data-rm-trigger per element."),
      option("label", "string", "\"People\"", "Accessible name for the listbox; data-rm-label per element."),
      option("noMatch", "string", "\"No matching person\"", "Shown when the query matches nobody; data-rm-no-match per element."),
      option("offset", "number", "6", "Pixels between the caret and the list; data-rm-offset per element."),
      option("optionSelector", "string", "\"li, [role=\\\"option\\\"]\"", "Selector for the person rows inside the panel."),
    ],
  },
  {
    name: "blockHandle",
    category: "editor",
    file: MOD_EDITOR,
    attribute: "data-rm-block-handle",
    summary: "Drag to reorder blocks, and move them from the keyboard.",
    notes:
      "The handle is a real button in the margin, absolutely positioned so it costs the paragraph no width, and it appears on focus as well as on hover - a grip that answers only the pointer is a grip half the audience never learns exists. Space picks a block up, the arrow keys move it, Space drops it and Escape puts it back where it started, which is the keyboard half of a drag that draggable=\"true\" does not have and cannot be given. Every move is a FLIP: the DOM order changes first and the blocks that shifted are played back from where they used to be, so nothing is ever animated by its position and the document is correct the instant the move happens. Each move is also announced - \"Moved to position 2 of 5\" - because a block quietly sliding half an inch is no information at all if you cannot see it.",
    example: "<div data-rm-block-handle data-rm-label=\"Move section\">\n  <h2>Findings</h2>\n  <p>Three quarters of the people we interviewed had already built the thing by hand.</p>\n  <p>Nobody could name the person who owned the spreadsheet.</p>\n  <blockquote>&ldquo;We send it out on Fridays and hope.&rdquo;</blockquote>\n  <p>The handover step is where the week is lost.</p>\n</div>",
    usage: "import { blockHandle } from \"@soyrageagency/rage-motion\";\nblockHandle();",
    options: [
      option("label", "string", "\"Move block\"", "Prefix for each handle's accessible name; data-rm-label per container."),
      option("duration", "number", "260", "Milliseconds for the FLIP that replays a reorder; data-rm-duration per container."),
      option("blocks", "string", "\":scope > *\"", "Selector for the blocks that get a handle."),
    ],
  },
  {
    name: "fencedCode",
    category: "editor",
    file: MOD_EDITOR,
    attribute: "data-rm-code-block",
    summary: "A fenced block with a language label and a copy button.",
    notes:
      "The label and the button are absolutely positioned over the corner of the block, so adding them does not shift a single column of the code beneath. The button holds both of its words - \"Copy\" and \"Copied\" - stacked in one grid cell, which means it is as wide as the longer of the two from the moment it mounts and confirming a copy never resizes the corner it sits in. The confirmation is announced once in a polite region, because a tick that appears for a second and a half is not a message. And when the clipboard is unavailable, on an insecure origin or in a locked-down browser, it selects the code and says which keys to press instead of failing silently, which is what a bare navigator.clipboard.writeText does.",
    example: "<pre data-rm-code-block data-rm-lang=\"JavaScript\" data-rm-numbers><code>import { editorToolbar, slashMenu } from \"@soyrageagency/rage-motion\";\n\nconst stop = editorToolbar();\nslashMenu(\"[data-rm-slash-menu]\", { trigger: \"/\" });\n\nwindow.addEventListener(\"beforeunload\", stop);</code></pre>",
    usage: "import { fencedCode } from \"@soyrageagency/rage-motion\";\nfencedCode();",
    options: [
      option("lang", "string", "\"\"", "Language shown in the corner label; data-rm-lang per block."),
      option("copy", "string", "\"Copy\"", "Resting label on the button; data-rm-label per block."),
      option("copied", "string", "\"Copied\"", "Label and announcement after a successful copy."),
      option("numbers", "boolean", "false", "Draw a line-number gutter; data-rm-numbers per block."),
    ],
  },
  {
    name: "markdownPreview",
    category: "editor",
    file: MOD_EDITOR,
    attribute: "data-rm-markdown-preview",
    summary: "Two panes, scroll linked, neither fighting the other.",
    notes:
      "The naive version listens for scroll on both panes and sets the other one's scrollTop from it, which is a feedback loop: setting the follower fires its own scroll event, which sets the leader back, and the result judders and fights the wheel. The fix here is a lease - whichever pane the visitor touched owns the link for a moment, and the follower's scroll events are ignored for as long as it holds. mode=\"block\" lines the panes up by matching block index rather than by fraction of total height, which is what stops a long code sample from throwing the preview half a page out. The preview is explicitly aria-live=\"off\", because making it a live region means every keystroke re-reads the whole document, and that is how a screen-reader user is driven out of an editor.",
    example: "<div data-rm-markdown-preview data-rm-mode=\"block\">\n  <textarea data-rm-md-source aria-label=\"Markdown source\" rows=\"14\">## Quarterly note\n\nWe shipped the importer on the 14th.\n\n- Two customers migrated in the first week\n- The CSV path is still the slow one\n</textarea>\n  <div data-rm-md-preview aria-label=\"Preview\">\n    <h2>Quarterly note</h2>\n    <p>We shipped the importer on the 14th.</p>\n    <ul>\n      <li>Two customers migrated in the first week</li>\n      <li>The CSV path is still the slow one</li>\n    </ul>\n  </div>\n</div>",
    usage: "import { markdownPreview } from \"@soyrageagency/rage-motion\";\nmarkdownPreview();",
    options: [
      option("source", "string", "\"[data-rm-md-source]\"", "Selector for the editing pane inside the wrapper."),
      option("preview", "string", "\"[data-rm-md-preview]\"", "Selector for the rendered pane inside the wrapper."),
      option("mode", "string", "\"fraction\"", "\"fraction\" maps by scroll position, \"block\" by matching block index; data-rm-mode per wrapper."),
      option("lease", "number", "120", "Milliseconds the pane that was touched keeps control of the link; data-rm-lease per wrapper."),
    ],
  },
  {
    name: "findReplace",
    category: "editor",
    file: MOD_EDITOR,
    attribute: "data-rm-find-replace",
    summary: "Search over the text without rewriting the text.",
    notes:
      "Highlighting matches by wrapping them in spans is the version everybody writes first, and it quietly destroys the document: the caret jumps, the undo stack fills with edits nobody made, and what gets saved has the search results embedded in it. This paints with the CSS Custom Highlight API instead - a Highlight of Range objects drawn by ::highlight() with not one node added - and falls back to selecting the match where that is unsupported, or where the surface is a textarea that ranges cannot reach. The match count is drawn immediately and spoken only once the typing settles, because a live region that counts out loud on every keystroke is a live region nobody can type past. Replace-all walks the matches backwards, so replacing one cannot move the offsets of the ones still to come.",
    example: "<div data-rm-editor-surface id=\"brief\">\n  <p>The brief went out on Monday. The brief came back on Thursday with the brief attached twice.</p>\n  <p>Every brief since has been sent as a link.</p>\n</div>\n<div data-rm-find-replace=\"brief\" data-rm-placeholder=\"Find in brief\" data-rm-case=\"off\"></div>",
    usage: "import { findReplace } from \"@soyrageagency/rage-motion\";\nfindReplace();",
    options: [
      option("surface", "string", "\"[data-rm-editor-surface]\"", "Selector for the searched surface, used when the attribute carries no id."),
      option("label", "string", "\"Find in document\"", "Accessible name for the search region; data-rm-label per panel."),
      option("placeholder", "string", "\"Find\"", "Label and placeholder on the search field; data-rm-placeholder per panel."),
      option("replace", "boolean", "true", "Build the replace row; data-rm-replace=\"off\" turns it off per panel."),
      option("settle", "number", "400", "Milliseconds of quiet before the match count is announced; data-rm-settle per panel."),
      option("caseSensitive", "string", "\"off\"", "data-rm-case=\"on\" makes the search respect capitals."),
    ],
  },
  {
    name: "commentThread",
    category: "editor",
    file: MOD_EDITOR,
    attribute: "data-rm-comment-thread",
    summary: "Anchored to a range, opened by a real disclosure.",
    notes:
      "The anchor is already in the markup as a mark around the words being discussed, so the comment survives the script not running and the passage still reads. The two are wired with aria-details, which is the one relationship that says \"there is a remark about this passage\" without pasting the entire thread into the paragraph's accessible description - aria-describedby, the usual choice, does exactly that. The panel opens with grid-template-rows 0fr to 1fr, the only honest way to transition to a height nobody can know in advance, and the button carries aria-expanded so the state is a fact rather than a rotating chevron. Resolving says \"resolved\" out loud, because a thread that merely goes grey has told half its readers nothing at all.",
    example: "<p>The handover step is where <mark id=\"para-3\">the week is lost</mark>, according to four of\nthe six teams we spoke to.</p>\n\n<aside data-rm-comment-thread=\"para-3\" data-rm-state=\"closed\">\n  <h3>Nora Vale</h3>\n  <p>Can we name the four teams here? &ldquo;Four of six&rdquo; reads as a survey we did not run.</p>\n  <p>Amina: agreed, I will pull the list from the interview notes.</p>\n</aside>",
    usage: "import { commentThread } from \"@soyrageagency/rage-motion\";\ncommentThread();",
    options: [
      option("open", "boolean", "false", "Start expanded; data-rm-state=\"open\" or \"closed\" per thread."),
      option("label", "string", "\"Comment\"", "Fallback name when the thread has no heading; data-rm-label per thread."),
      option("resolveLabel", "string", "\"Resolve\"", "Text on the resolve toggle; data-rm-resolve-label per thread."),
    ],
  },
  {
    name: "suggestion",
    category: "editor",
    file: MOD_EDITOR,
    attribute: "data-rm-suggestion",
    summary: "A tracked change with accept and reject.",
    notes:
      "The change itself is an ins or a del element in the markup, which is what those elements are for: a screen reader says \"insertion\" and \"deletion\" without being told, and the document still makes sense with the stylesheet switched off - a coloured span says nothing to anybody. This adds the two buttons, the group label naming whose change it is, and the arithmetic of applying it, which is the part people get backwards: accepting an insertion unwraps it and keeps the words, rejecting one takes them out, and a deletion is the same two answers the other way round. Applying a change reflows the paragraph, which is unavoidable and is the point, so the blocks after it are played from where they were with a FLIP rather than jumping. Cleanup removes the chrome but never un-applies a decision somebody made.",
    example: "<p>We shipped the importer in the\n<ins data-rm-suggestion=\"insert\" data-rm-author=\"Nora Vale\">second</ins>\n<del data-rm-suggestion=\"delete\" data-rm-author=\"Nora Vale\">final</del> week of March, ahead of\nthe <ins data-rm-suggestion=\"insert\" data-rm-author=\"Tomas Reid\">agreed</ins> date.</p>",
    usage: "import { suggestion } from \"@soyrageagency/rage-motion\";\nsuggestion();",
    options: [
      option("kind", "string", "\"insert\"", "\"insert\" or \"delete\"; normally read from data-rm-suggestion on each change."),
      option("author", "string", "\"Someone\"", "Named in the group label; data-rm-author per change."),
      option("accept", "string", "\"Accept\"", "Verb used in the accept button's accessible name."),
      option("reject", "string", "\"Reject\"", "Verb used in the reject button's accessible name."),
    ],
  },
  {
    name: "versionChip",
    category: "editor",
    file: MOD_EDITOR,
    attribute: "data-rm-version-chip",
    summary: "When this version was, in words that stay true.",
    notes:
      "\"2 minutes ago\" is a sentence with a shelf life, and the usual version writes it once on load and lets it rot until the page reloads, by which time it is saying two minutes about something from last Tuesday. This recomputes it on a timer, and the timer runs only while the chip is on screen and the tab is in front, so a sidebar of forty versions is not forty intervals ticking in a background tab. The exact moment lives in a real time element with a datetime attribute, so the machine-readable stamp is available even though the drawn text is relative, and the wording comes from Intl.RelativeTimeFormat rather than a date library or a hand-rolled pluraliser that only speaks English. The version being viewed carries aria-current=\"true\" rather than only a darker pill.",
    example: "<ul>\n  <li><button type=\"button\" data-rm-version-chip=\"2026-09-21T09:12:00Z\" aria-current=\"true\">Current draft</button></li>\n  <li><button type=\"button\" data-rm-version-chip=\"2026-09-20T17:40:00Z\">Before legal review</button></li>\n  <li><button type=\"button\" data-rm-version-chip=\"2026-09-18T08:05:00Z\">First pass</button></li>\n  <li><button type=\"button\" data-rm-version-chip=\"2026-08-30T11:22:00Z\">Outline</button></li>\n</ul>",
    usage: "import { versionChip } from \"@soyrageagency/rage-motion\";\nversionChip();",
    options: [
      option("locale", "string", "undefined", "Language for the relative wording; data-rm-locale per chip. Defaults to the browser's."),
      option("every", "number", "30000", "Milliseconds between recalculations while visible; data-rm-every per chip."),
      option("label", "string", "\"Version\"", "Fallback name when the chip has no text; data-rm-label per chip."),
    ],
  },
  {
    name: "outlinePane",
    category: "editor",
    file: MOD_EDITOR,
    attribute: "data-rm-outline-pane",
    summary: "The headings as a real tree, marking where you are.",
    notes:
      "It is built from the document's own headings, so the outline cannot drift out of step with the text the way a hand-maintained list always does. It is a genuine role=\"tree\": one tab stop, up and down to move between items, right and left to open and close a branch, aria-level on every item and aria-expanded on the ones with children - where the common version is a flat list of links with indentation applied by padding, which tells assistive technology nothing whatever about the structure it is drawing. Where you are is aria-current=\"location\", set by an IntersectionObserver on the headings themselves rather than by a scroll listener doing arithmetic on every frame. Ids generated for headings that had none are removed again on cleanup, so the document is left as it was found.",
    example: "<nav data-rm-outline-pane=\"report\" data-rm-label=\"In this report\"></nav>\n\n<article data-rm-editor-surface id=\"report\">\n  <h2>Summary</h2><p>Four of six teams lose a day a week to the handover.</p>\n  <h2>Method</h2><p>Eighteen interviews across three markets.</p>\n  <h3>Interviews</h3><p>Forty minutes each, unstructured after the first ten.</p>\n  <h3>Sampling</h3><p>Weighted towards teams of under twenty.</p>\n  <h2>Findings</h2><p>The spreadsheet is the product.</p>\n  <h3>Handover</h3><p>Nobody owns the Friday send.</p>\n  <h2>What we recommend</h2><p>Name an owner before buying a tool.</p>\n</article>",
    usage: "import { outlinePane } from \"@soyrageagency/rage-motion\";\noutlinePane();",
    options: [
      option("surface", "string", "\"[data-rm-editor-surface]\"", "Selector for the document, used when the attribute carries no id."),
      option("headings", "string", "\"h2, h3, h4\"", "Which headings become items; data-rm-headings per pane."),
      option("label", "string", "\"Document outline\"", "Accessible name for the tree; data-rm-label per pane."),
    ],
  },
  {
    name: "wordCount",
    category: "editor",
    file: MOD_EDITOR,
    attribute: "data-rm-word-count",
    summary: "Announced politely, and only once it starts to matter.",
    notes:
      "The count is drawn on every keystroke and said almost never, and that split is the whole component: a counter wrapped in aria-live narrates every letter typed and makes the editor unusable with a screen reader on - a bug you will never find unless you switch one on. So the number lives in an ordinary element, and a separate polite region receives a sentence only when the count crosses the threshold, reaches the limit or goes past it. With a limit set it also exposes role=\"meter\" with a real aria-valuenow and aria-valuetext, so the position is available as a value rather than as two numbers with a slash between them. Counting is a split on whitespace, which is the honest approximation, and it says \"words\" rather than claiming a precision it does not have.",
    example: "<textarea data-rm-editor-surface id=\"abstract\" rows=\"5\">An abstract of no more than three hundred words.</textarea>\n<p data-rm-word-count=\"abstract\" data-rm-limit=\"300\" data-rm-announce-at=\"0.9\"></p>",
    usage: "import { wordCount } from \"@soyrageagency/rage-motion\";\nwordCount();",
    options: [
      option("surface", "string", "\"[data-rm-editor-surface]\"", "Selector for the counted surface, used when the attribute carries no id."),
      option("limit", "number", "0", "The cap; 0 means count without one. data-rm-limit per meter."),
      option("announceAt", "number", "0.9", "Fraction of the limit at which it starts speaking; data-rm-announce-at per meter."),
      option("unit", "string", "\"words\"", "\"words\" or \"characters\"; data-rm-unit per meter."),
      option("settle", "number", "500", "Milliseconds of quiet before an announcement is made; data-rm-settle per meter."),
    ],
  },
  {
    name: "autosaveBadge",
    category: "editor",
    file: MOD_EDITOR,
    attribute: "data-rm-autosave-badge",
    summary: "Saving, saved, failed, as text rather than a colour.",
    notes:
      "All three words are laid out in the same grid cell from the moment it mounts, so the badge is as wide as the longest of them before anything happens and a state change is a crossfade rather than a reflow that nudges the header beside it; the version that sets textContent resizes the toolbar on every save. \"Saved\" is polite and \"could not save\" is assertive, because one is news and the other is an interruption worth making - and the live region's politeness is switched with the state rather than fixed once, which is the detail that makes a failure actually interrupt. The failed state grows a real retry button and fires rm-autosave-retry, since telling somebody their work did not save and offering them nothing to do about it is the cruellest pattern in software. Nothing here depends on the colour: the words are the message and the tint is the decoration.",
    example: "<header>\n  <h1>Quarterly note</h1>\n  <p data-rm-autosave-badge data-rm-state=\"saved\"></p>\n</header>",
    usage: "import { autosaveBadge } from \"@soyrageagency/rage-motion\";\nautosaveBadge();",
    options: [
      option("saving", "string", "\"Saving…\"", "Wording for the in-progress state."),
      option("saved", "string", "\"Saved\"", "Wording for the settled state."),
      option("failed", "string", "\"Could not save\"", "Wording for the failed state, announced assertively."),
      option("retry", "string", "\"Try again\"", "Text on the retry button; data-rm-retry-label per badge."),
      option("state", "string", "\"saved\"", "Starting state: \"saving\", \"saved\" or \"failed\"; data-rm-state per badge."),
    ],
  },
  {
    name: "selectionToolbar",
    category: "editor",
    file: MOD_EDITOR,
    attribute: "data-rm-selection-toolbar",
    summary: "Actions for selected text, docked rather than floating.",
    notes:
      "This is the opposite decision to the bubble menu, and on a reading surface it is the right one: a bar that follows the selection on a touch screen lands underneath the operating system's own selection handles and underneath the thumb holding them, which is why it is so often unusable on the device it was designed for. Docked to an edge it is always in the same place, always reachable and never covering what was just selected. It sits after the region in the markup, so Tab reaches it from the text with no shortcut nobody knows about, and Escape hides it and returns focus to the surface. A button marked data-rm-select-action=\"copy\" is wired up here; everything else is the page's own business and is handed the selected text through the rm-selection-action event.",
    example: "<article data-rm-editor-surface id=\"essay\">\n  <p>Select a sentence in this paragraph and the action bar docks to the bottom of the window.</p>\n  <p>It stays in one place whether you selected with a mouse, a thumb, or Shift and the arrow keys.</p>\n</article>\n\n<div data-rm-selection-toolbar=\"essay\" data-rm-dock-to=\"bottom\">\n  <button type=\"button\" data-rm-select-action=\"copy\">Copy</button>\n  <button type=\"button\" data-rm-select-action=\"quote\">Quote</button>\n  <button type=\"button\" data-rm-select-action=\"comment\">Comment</button>\n</div>",
    usage: "import { selectionToolbar } from \"@soyrageagency/rage-motion\";\nselectionToolbar();",
    options: [
      option("surface", "string", "\"[data-rm-editor-surface]\"", "Selector for the region whose selections count; used when the attribute carries no id."),
      option("label", "string", "\"Actions for the selected text\"", "Accessible name for the bar; data-rm-label per element."),
      option("dock", "string", "\"bottom\"", "\"bottom\" or \"top\" edge of the window; data-rm-dock-to per element."),
      option("items", "string", "\"button\"", "Selector for the buttons inside the bar."),
    ],
  },
  {
    name: "typewriterMode",
    category: "editor",
    file: MOD_EDITOR,
    attribute: "data-rm-typewriter",
    summary: "The caret line stays put and the page moves under it.",
    notes:
      "Typing normally pushes the caret down to the bottom edge of the window and leaves it there, which is the least comfortable line on the screen to read and the reason long drafting sessions feel like work. This keeps it at a fixed height by scrolling the container instead, and scroll position is not a layout property, so nothing reflows and nothing repaints beyond what scrolling already costs. Measuring the caret is the hard half: a textarea has no selection geometry at all, so an offscreen mirror wearing the same font, padding and width is built, measured and thrown away, rather than guessing from line-height times the number of newlines - a guess that is right until the first wrapped line and wrong for the rest of the document. The easing is a lerp on the kit's shared rAF that runs only while the surface is on screen and the tab is in front, and under reduced motion it snaps to the same place, because the point is where the line ends up, not the journey.",
    example: "<div data-rm-typewriter contenteditable=\"true\" data-rm-anchor=\"0.4\" data-rm-dim=\"on\">\n  <p>The caret line holds its height while the text scrolls beneath it.</p>\n  <p>Paragraphs away from the caret dim by opacity alone, so nothing moves and everything is\n  still selectable and still read aloud in full.</p>\n  <p>Keep typing and this paragraph rises to meet the same line.</p>\n</div>",
    usage: "import { typewriterMode } from \"@soyrageagency/rage-motion\";\ntypewriterMode();",
    options: [
      option("anchor", "number", "0.42", "Fraction down the scroller where the caret line is held; data-rm-anchor per surface."),
      option("glide", "number", "0.18", "Lerp factor per frame - lower glides for longer; data-rm-glide per surface."),
      option("dim", "boolean", "false", "Fade the paragraphs the caret is not in; data-rm-dim=\"on\" per surface."),
      option("scroller", "string", "\"\"", "Selector for the element that scrolls; data-rm-scroller per surface. Defaults to the surface, then the page."),
    ],
  },

  // ── Calendars and time ──
  {
    name: "monthGrid",
    category: "schedule",
    file: MOD_SCHEDULE,
    attribute: "data-rm-month-grid",
    summary: "A real month table walked with the arrow keys, with one selection marker that travels.",
    notes:
      "A month is genuinely a table — seven named columns, one row per week — so this enhances a real `<table>` with a real header row rather than building a pile of divs, and writes out the grid roles explicitly because the moment a table becomes `role=\"grid\"` its rows and cells need the grid's own roles instead of the table's. The keyboard is the part that is usually missing: arrows move a day, up and down move a week, Home and End reach the ends of the visible week, and PageUp and PageDown fire a cancelable `rm-month-change` carrying the delta so the page that owns the data can render the next month and call `preventDefault()`. Only one cell is ever in the tab order, which is what stops crossing a month from costing forty tab presses. The selection marker is one element FLIPped from the old cell to the new one; the usual version toggles a background on each cell, which is cheaper but reads as two unrelated flashes rather than as a selection that moved. Every cell's `aria-label` is formatted from its own `<time datetime>`, so what is announced is \"Tuesday, 3 March 2026\" and not a pair of coordinates.",
    example: "<table data-rm-month-grid data-rm-today=\"2026-03-17\" data-rm-label=\"March 2026\">\n  <caption>March 2026</caption>\n  <thead>\n    <tr><th scope=\"col\">Mon</th><th scope=\"col\">Tue</th><th scope=\"col\">Wed</th><th scope=\"col\">Thu</th><th scope=\"col\">Fri</th><th scope=\"col\">Sat</th><th scope=\"col\">Sun</th></tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td><time datetime=\"2026-03-09\">9</time></td>\n      <td><time datetime=\"2026-03-10\">10</time></td>\n      <td><time datetime=\"2026-03-11\">11</time></td>\n      <td><time datetime=\"2026-03-12\">12</time></td>\n      <td><time datetime=\"2026-03-13\">13</time></td>\n      <td><time datetime=\"2026-03-14\">14</time></td>\n      <td><time datetime=\"2026-03-15\">15</time></td>\n    </tr>\n    <tr>\n      <td><time datetime=\"2026-03-16\">16</time></td>\n      <td><time datetime=\"2026-03-17\">17</time></td>\n      <td><time datetime=\"2026-03-18\">18</time></td>\n      <td><time datetime=\"2026-03-19\">19</time></td>\n      <td><time datetime=\"2026-03-20\">20</time></td>\n      <td><time datetime=\"2026-03-21\">21</time></td>\n      <td><time datetime=\"2026-03-22\">22</time></td>\n    </tr>\n    <tr>\n      <td><time datetime=\"2026-03-23\">23</time></td>\n      <td><time datetime=\"2026-03-24\">24</time></td>\n      <td><time datetime=\"2026-03-25\">25</time></td>\n      <td><time datetime=\"2026-03-26\">26</time></td>\n      <td><time datetime=\"2026-03-27\">27</time></td>\n      <td><time datetime=\"2026-03-28\">28</time></td>\n      <td><time datetime=\"2026-03-29\">29</time></td>\n    </tr>\n  </tbody>\n</table>",
    usage: "import { monthGrid } from \"@soyrageagency/rage-motion\";\nmonthGrid();",
    options: [
      option("locale", "string", "\"\"", "BCP 47 tag used to speak each date. Empty means the browser's own."),
      option("label", "string", "\"Month\"", "Accessible name for the grid, from `data-rm-label`."),
      option("duration", "number", "260", "Milliseconds the selection marker takes to travel between cells."),
    ],
  },
  {
    name: "weekGrid",
    category: "schedule",
    file: MOD_SCHEDULE,
    attribute: "data-rm-week-grid",
    summary: "Seven day columns, chosen from the keyboard, with each day's event count said out loud.",
    notes:
      "A week view's real information is how much is on each day, and a column of stacked rectangles conveys that only to people who can see it — so each header gains a spoken count and reads as \"Tuesday 3 March, two events\". Picking a day is a roving tabindex across the seven headers, one tab stop for the week rather than seven, with Home and End for the ends. Today and the chosen day are two different states and get two different attributes: `aria-current=\"date\"` never moves, `aria-selected` follows the visitor. Highlighting the chosen column sets one class on the header and one on each cell in it rather than rewriting inline backgrounds, and the events in that column stagger in with a transform so nothing in the table is ever re-laid-out.",
    example: "<table data-rm-week-grid data-rm-today=\"2026-03-03\" data-rm-label=\"Week of 2 March\">\n  <thead>\n    <tr>\n      <th scope=\"col\"><time datetime=\"2026-03-02\">Mon 2</time></th>\n      <th scope=\"col\"><time datetime=\"2026-03-03\">Tue 3</time></th>\n      <th scope=\"col\"><time datetime=\"2026-03-04\">Wed 4</time></th>\n      <th scope=\"col\"><time datetime=\"2026-03-05\">Thu 5</time></th>\n      <th scope=\"col\"><time datetime=\"2026-03-06\">Fri 6</time></th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td><ul><li>Sprint planning</li></ul></td>\n      <td><ul><li>Client call</li><li>Design review</li></ul></td>\n      <td><ul><li>Deploy window</li></ul></td>\n      <td><ul></ul></td>\n      <td><ul><li>Retro</li><li>Invoices</li><li>1:1 with Ana</li></ul></td>\n    </tr>\n  </tbody>\n</table>",
    usage: "import { weekGrid } from \"@soyrageagency/rage-motion\";\nweekGrid();",
    options: [
      option("locale", "string", "\"\"", "BCP 47 tag used to speak each column's date."),
      option("label", "string", "\"Week\"", "Accessible name for the table, from `data-rm-label`."),
      option("item", "string", "\"li\"", "Selector for the events inside a column, counted and staggered."),
      option("stagger", "number", "60", "Milliseconds between each event arriving when a day is chosen."),
    ],
  },
  {
    name: "dayTimeline",
    category: "schedule",
    file: MOD_SCHEDULE,
    attribute: "data-rm-day-timeline",
    summary: "An hour ruler down the side with events placed from their own start and end times.",
    notes:
      "Every event is positioned from the `<time datetime>` pair it already contains, so the position and the spoken label come from one source and cannot drift apart — the usual version puts the offset in a style attribute and the time in the text, and they disagree the first time somebody edits one of them. Placement is a percentage of the declared hour window rather than pixels, which means the day rescales with its container without a line of JavaScript running on resize. The ruler is `aria-hidden` on purpose: the hours are a drawing, each event already states its own time in words, and reading the scale out as well is noise. Events wipe in from the top with a `clip-path`, staggered, which is the direction a day is read in and costs no layout.",
    example: "<div data-rm-day-timeline data-rm-hour-from=\"8\" data-rm-hour-to=\"18\" data-rm-label=\"Tuesday 3 March\">\n  <ol>\n    <li>\n      <time datetime=\"2026-03-03T09:00\">09:00</time>\n      <time datetime=\"2026-03-03T09:30\">09:30</time>\n      Stand-up\n    </li>\n    <li>\n      <time datetime=\"2026-03-03T10:00\">10:00</time>\n      <time datetime=\"2026-03-03T11:30\">11:30</time>\n      Workshop with the studio\n    </li>\n    <li>\n      <time datetime=\"2026-03-03T13:00\">13:00</time>\n      <time datetime=\"2026-03-03T14:00\">14:00</time>\n      Lunch\n    </li>\n    <li>\n      <time datetime=\"2026-03-03T15:30\">15:30</time>\n      <time datetime=\"2026-03-03T17:00\">17:00</time>\n      Rebrand review\n    </li>\n  </ol>\n</div>",
    usage: "import { dayTimeline } from \"@soyrageagency/rage-motion\";\ndayTimeline();",
    options: [
      option("hourFrom", "number", "8", "First hour drawn, from `data-rm-hour-from`."),
      option("hourTo", "number", "20", "Last hour drawn, from `data-rm-hour-to`."),
      option("item", "string", "\"li\"", "Selector for the events to place."),
      option("locale", "string", "\"\"", "BCP 47 tag used to speak each event's start and end."),
      option("label", "string", "\"Day\"", "Accessible name for the day, from `data-rm-label`."),
    ],
  },
  {
    name: "nowLine",
    category: "schedule",
    file: MOD_SCHEDULE,
    attribute: "data-rm-now-line",
    summary: "A line at the current minute that only appears on the day it actually belongs to.",
    notes:
      "This is one of the two components in the module allowed to read the clock, and the first thing it does with it is decide whether to exist: a \"now\" line drawn across next Tuesday is worse than no line, because it looks authoritative. It reads the day out of the markup, compares it to today, and hides otherwise — and because the stylesheet gives it a `display`, there is an explicit `[hidden]` rule to match, without which the line would still be laid out and still be in the way. The position updates through the kit's shared frame loop inside `whileVisible`, and the frame task returns immediately unless the minute has actually changed, so a calendar off screen or in a background tab costs nothing and a visible one recalculates once a minute rather than sixty times a second. It is a `role=\"separator\"` with a name rather than a live region, because a time that announces itself every sixty seconds makes a screen reader unusable.",
    example: "<div data-rm-day-timeline data-rm-hour-from=\"8\" data-rm-hour-to=\"18\" data-rm-date=\"2026-03-03\">\n  <ol>\n    <li>\n      <time datetime=\"2026-03-03T09:00\">09:00</time>\n      <time datetime=\"2026-03-03T10:00\">10:00</time>\n      Editorial planning\n    </li>\n    <li>\n      <time datetime=\"2026-03-03T14:00\">14:00</time>\n      <time datetime=\"2026-03-03T15:00\">15:00</time>\n      Photography brief\n    </li>\n  </ol>\n  <div data-rm-now-line data-rm-label=\"Now\"></div>\n</div>",
    usage: "import { nowLine } from \"@soyrageagency/rage-motion\";\nnowLine();",
    options: [
      option("hourFrom", "number", "8", "First hour of the window; read from the nearest ancestor that declares one."),
      option("hourTo", "number", "20", "Last hour of the window, from `data-rm-hour-to`."),
      option("locale", "string", "\"\"", "BCP 47 tag used to write the time into the line's accessible name."),
      option("label", "string", "\"Now\"", "Word placed before the time in the accessible name."),
    ],
  },
  {
    name: "miniCalendar",
    category: "schedule",
    file: MOD_SCHEDULE,
    attribute: "data-rm-mini-calendar",
    summary: "A dense read-only month with dots that say, in words, how much is on each day.",
    notes:
      "Three coloured circles under the 14th mean \"three meetings\" to somebody looking at them and nothing at all to anybody else, so the count comes from a real `data-rm-events` number in the markup and the cell's label states the whole truth — \"Saturday, 14 March 2026, 5 events\" — however many dots there was room to draw. At most a few dots are rendered and the overflow is marked with a plus rather than being silently dropped. It is deliberately read-only: a month this small cannot carry a usable hit target, and a calendar that is both tiny and clickable is one people mis-tap, so when a day has to be chosen `monthGrid` is the component with the keyboard. The dots pop in from their own centre with a spring, which changes nothing about the cell's box.",
    example: "<table data-rm-mini-calendar data-rm-today=\"2026-03-17\" data-rm-label=\"March at a glance\">\n  <thead>\n    <tr><th scope=\"col\">M</th><th scope=\"col\">T</th><th scope=\"col\">W</th><th scope=\"col\">T</th><th scope=\"col\">F</th><th scope=\"col\">S</th><th scope=\"col\">S</th></tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td data-rm-events=\"2\"><time datetime=\"2026-03-16\">16</time></td>\n      <td data-rm-events=\"5\"><time datetime=\"2026-03-17\">17</time></td>\n      <td><time datetime=\"2026-03-18\">18</time></td>\n      <td data-rm-events=\"1\"><time datetime=\"2026-03-19\">19</time></td>\n      <td data-rm-events=\"3\"><time datetime=\"2026-03-20\">20</time></td>\n      <td><time datetime=\"2026-03-21\">21</time></td>\n      <td><time datetime=\"2026-03-22\">22</time></td>\n    </tr>\n    <tr>\n      <td data-rm-events=\"1\"><time datetime=\"2026-03-23\">23</time></td>\n      <td><time datetime=\"2026-03-24\">24</time></td>\n      <td data-rm-events=\"4\"><time datetime=\"2026-03-25\">25</time></td>\n      <td data-rm-events=\"2\"><time datetime=\"2026-03-26\">26</time></td>\n      <td><time datetime=\"2026-03-27\">27</time></td>\n      <td><time datetime=\"2026-03-28\">28</time></td>\n      <td><time datetime=\"2026-03-29\">29</time></td>\n    </tr>\n  </tbody>\n</table>",
    usage: "import { miniCalendar } from \"@soyrageagency/rage-motion\";\nminiCalendar();",
    options: [
      option("locale", "string", "\"\"", "BCP 47 tag used to speak each date."),
      option("label", "string", "\"Month at a glance\"", "Accessible name for the table, from `data-rm-label`."),
      option("max", "number", "3", "How many dots to draw before the overflow mark, from `data-rm-max`."),
    ],
  },
  {
    name: "dateRange",
    category: "schedule",
    file: MOD_SCHEDULE,
    attribute: "data-rm-date-range",
    summary: "Two native date inputs kept in a real relationship, with the length stated in words.",
    notes:
      "Both halves are real `<input type=\"date\">` elements, so the native picker, the native keyboard, type-ahead and form submission all survive — everything the two-divs-and-a-popup rebuild throws away silently. What this adds is the relationship: the start's `max` is kept at the end's value and the end's `min` at the start's, so the browser refuses an impossible range in its own picker, in its own language, before any of this code runs. Attributes constrain the picker but not the keyboard, so a typed contradiction is caught separately, marked with `aria-invalid` and explained in a sentence rather than only turned red. The length is announced in a polite live region — \"5 nights, 3 March to 8 March 2026\" — because a highlighted band between two boxes is not a number anybody can read out, and the band itself is a `scaleX` so a range growing from two nights to nine reflows nothing.",
    example: "<div data-rm-date-range data-rm-max=\"21\" data-rm-min=\"2\" data-rm-label=\"Stay\">\n  <label for=\"stay-from\">Arriving</label>\n  <label for=\"stay-to\">Leaving</label>\n  <input id=\"stay-from\" type=\"date\" data-rm-unit=\"start\" name=\"from\" value=\"2026-03-03\">\n  <input id=\"stay-to\" type=\"date\" data-rm-unit=\"end\" name=\"to\" value=\"2026-03-08\">\n</div>",
    usage: "import { dateRange } from \"@soyrageagency/rage-motion\";\ndateRange();",
    options: [
      option("locale", "string", "\"\"", "BCP 47 tag used to write the spoken summary."),
      option("label", "string", "\"Dates\"", "Accessible name for the pair, from `data-rm-label`."),
      option("max", "number", "30", "Nights the band is drawn against, from `data-rm-max`."),
      option("min", "number", "1", "Shortest allowed stay in nights, from `data-rm-min`; a shorter one is explained."),
    ],
  },
  {
    name: "timePicker",
    category: "schedule",
    file: MOD_SCHEDULE,
    attribute: "data-rm-time-picker",
    summary: "A real time input with a drawn clock face beside it that can also be dragged.",
    notes:
      "The `<input type=\"time\">` is the control and the clock is a picture of it, in that order, because every keyboard, screen reader and phone already knows what a time input is and a drawn face knows nothing until it is taught. Dragging a hand is a pointer convenience layered on top: the input stays visible, stays focusable and stays the thing the form posts, which is why the face can be `aria-hidden` without anybody losing access to the control. The hands take the short way round — a hand driven straight from `rotate(minutes * 6deg)` unwinds almost all the way backwards when the clock passes the hour, because 354 degrees and minus 6 are the same place but not the same journey, so a running angle is kept and the smaller of the two deltas added. The face is drawn entirely in `currentColor` with `color: inherit`, so it is never a black clock on a dark page.",
    example: "<div data-rm-time-picker data-rm-step=\"5\" data-rm-label=\"Start time\">\n  <label for=\"call-at\">Start time</label>\n  <input id=\"call-at\" type=\"time\" name=\"start\" value=\"09:30\" step=\"300\">\n</div>",
    usage: "import { timePicker } from \"@soyrageagency/rage-motion\";\ntimePicker();",
    options: [
      option("step", "number", "5", "Minutes the dragged minute hand snaps to, from `data-rm-step`."),
      option("duration", "number", "420", "Milliseconds a hand takes to move to a new time."),
      option("label", "string", "\"Time\"", "Accessible name for the group, from `data-rm-label`."),
    ],
  },
  {
    name: "durationField",
    category: "schedule",
    file: MOD_SCHEDULE,
    attribute: "data-rm-duration-field",
    summary: "Hours and minutes as two real inputs, added into one posted number and said in words.",
    notes:
      "Two number inputs rather than a masked `hh:mm` text field, because \"90\" typed into a minutes box is how people actually enter an hour and a half and a mask fights them for it. The total is written into a hidden input as plain minutes, so the form posts one unambiguous integer instead of a string somebody has to parse on the server and guess the format of. The summary is the part usually left out: \"1 hour 30 minutes\" in a polite live region, plus a real `aria-valuetext` on the bar, so the running total is available to somebody who cannot see it. The bar is a `scaleX` against a declared maximum, which is why a duration running past the limit changes colour and clamps without the row changing size.",
    example: "<div data-rm-duration-field data-rm-max=\"480\" data-rm-name=\"meeting_minutes\" data-rm-label=\"Meeting length\">\n  <label for=\"dur-h\">Hours</label>\n  <label for=\"dur-m\">Minutes</label>\n  <input id=\"dur-h\" type=\"number\" data-rm-unit=\"hours\" min=\"0\" max=\"8\" value=\"1\">\n  <input id=\"dur-m\" type=\"number\" data-rm-unit=\"minutes\" min=\"0\" max=\"59\" step=\"15\" value=\"30\">\n</div>",
    usage: "import { durationField } from \"@soyrageagency/rage-motion\";\ndurationField();",
    options: [
      option("max", "number", "480", "Minutes the bar is drawn against, from `data-rm-max`; over it the field is marked."),
      option("name", "string", "\"duration\"", "Name of the hidden input carrying the total, from `data-rm-name`."),
      option("label", "string", "\"Duration\"", "Accessible name for the group, from `data-rm-label`."),
    ],
  },
  {
    name: "timezonePill",
    category: "schedule",
    file: MOD_SCHEDULE,
    attribute: "data-rm-timezone-pill",
    summary: "A time zone written as \"two hours ahead of you\" rather than as an offset.",
    notes:
      "\"+02:00\" is a fact about a database, not an answer to the question anybody is actually asking, which is always some version of \"is that before or after lunch for me\". This works out the real difference between the named zone and the reader's own at the specific instant in the markup — not at page load, which is wrong on either side of a daylight-saving change — and writes it in words. The offset is measured by formatting the same instant in both zones and subtracting, because no API hands you a zone's offset directly and the common shortcut of parsing `toLocaleString` output breaks in every locale that does not write dates the American way. An unrecognised zone name falls back to showing the zone rather than throwing and leaving an empty pill, which is the failure mode of the naive version.",
    example: "<p>\n  Kick-off is at\n  <span data-rm-timezone-pill=\"Europe/Madrid\"><time datetime=\"2026-03-03T14:00:00Z\">Madrid</time></span>\n  and\n  <span data-rm-timezone-pill=\"America/New_York\"><time datetime=\"2026-03-03T14:00:00Z\">New York</time></span>\n  and\n  <span data-rm-timezone-pill=\"Asia/Tokyo\"><time datetime=\"2026-03-03T14:00:00Z\">Tokyo</time></span>.\n</p>",
    usage: "import { timezonePill } from \"@soyrageagency/rage-motion\";\ntimezonePill();",
    options: [
      option("zone", "string", "\"UTC\"", "IANA zone name; normally written as the value of `data-rm-timezone-pill`."),
      option("locale", "string", "\"\"", "BCP 47 tag used to render the local time inside the pill."),
    ],
  },
  {
    name: "availabilityGrid",
    category: "schedule",
    file: MOD_SCHEDULE,
    attribute: "data-rm-availability-grid",
    summary: "A slot grid painted by dragging and, just as completely, picked with the keyboard.",
    notes:
      "Dragging across a grid is the fastest way to choose eleven half-hours and also the input method that excludes the most people, so the keyboard here is not a fallback: `role=\"grid\"` with a roving tabindex, arrows, Space to toggle, and Shift with an arrow to paint a run the way a drag does. Each cell's name is built from its own row and column headers, so it is heard as \"Tuesday 3 March, 09:00\" instead of as a coordinate, and the running total is announced after every change. The pointer is captured on the table, so a gesture that wanders off the edge still delivers its `pointerup` — leaving the grid stuck in painting mode forever is the single most common bug in hand-rolled versions. Painting is skipped for touch pointers, one tap toggling one cell, because the alternative is `touch-action: none` across the grid and a page that cannot be scrolled past it.",
    example: "<table data-rm-availability-grid data-rm-label=\"When are you free?\">\n  <thead>\n    <tr>\n      <td></td>\n      <th scope=\"col\"><time datetime=\"2026-03-02\">Mon</time></th>\n      <th scope=\"col\"><time datetime=\"2026-03-03\">Tue</time></th>\n      <th scope=\"col\"><time datetime=\"2026-03-04\">Wed</time></th>\n      <th scope=\"col\"><time datetime=\"2026-03-05\">Thu</time></th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr><th scope=\"row\"><time datetime=\"2026-03-02T09:00\">09:00</time></th><td></td><td></td><td></td><td></td></tr>\n    <tr><th scope=\"row\"><time datetime=\"2026-03-02T10:00\">10:00</time></th><td></td><td></td><td></td><td></td></tr>\n    <tr><th scope=\"row\"><time datetime=\"2026-03-02T11:00\">11:00</time></th><td></td><td></td><td></td><td></td></tr>\n    <tr><th scope=\"row\"><time datetime=\"2026-03-02T12:00\">12:00</time></th><td></td><td></td><td></td><td></td></tr>\n  </tbody>\n</table>",
    usage: "import { availabilityGrid } from \"@soyrageagency/rage-motion\";\navailabilityGrid();",
    options: [
      option("locale", "string", "\"\"", "BCP 47 tag used to build each cell's spoken name from its headers."),
      option("label", "string", "\"Availability\"", "Accessible name for the grid, from `data-rm-label`."),
    ],
  },
  {
    name: "bookingSlots",
    category: "schedule",
    file: MOD_SCHEDULE,
    attribute: "data-rm-booking-slots",
    summary: "Bookable times as real radios, with the full ones still reachable from the keyboard.",
    notes:
      "Every slot is an `<input type=\"radio\">` in one named group, so the arrow keys work, the form submits a value and voice control can say \"click ten o'clock\". The interesting decision is the unavailable ones: they are marked `aria-disabled` and left in the tab order rather than given the `disabled` attribute, because `disabled` removes a control from the keyboard entirely — a keyboard visitor then tabs from 09:30 straight to 11:00 and is never told that 10:00 exists and is taken. Selection is refused in the change handler instead, the previous choice is restored, and the refusal is spoken rather than only shaken. \"Full\" is a word appended to the accessible name, not a shade of grey, and the arrival stagger is a transform so a list of twenty times does not reflow twenty times.",
    example: "<fieldset data-rm-booking-slots data-rm-label=\"Tuesday 3 March\">\n  <legend>Tuesday 3 March</legend>\n  <label><input type=\"radio\" name=\"slot\" value=\"09:00\"><time datetime=\"2026-03-03T09:00\">09:00</time></label>\n  <label data-rm-full=\"true\"><input type=\"radio\" name=\"slot\" value=\"09:30\"><time datetime=\"2026-03-03T09:30\">09:30</time></label>\n  <label><input type=\"radio\" name=\"slot\" value=\"10:00\"><time datetime=\"2026-03-03T10:00\">10:00</time></label>\n  <label><input type=\"radio\" name=\"slot\" value=\"10:30\"><time datetime=\"2026-03-03T10:30\">10:30</time></label>\n  <label data-rm-full=\"true\"><input type=\"radio\" name=\"slot\" value=\"11:00\"><time datetime=\"2026-03-03T11:00\">11:00</time></label>\n  <label><input type=\"radio\" name=\"slot\" value=\"11:30\"><time datetime=\"2026-03-03T11:30\">11:30</time></label>\n</fieldset>",
    usage: "import { bookingSlots } from \"@soyrageagency/rage-motion\";\nbookingSlots();",
    options: [
      option("locale", "string", "\"\"", "BCP 47 tag used to speak each slot's day and time."),
      option("label", "string", "\"Available times\"", "Accessible name for the radio group, from `data-rm-label`."),
      option("stagger", "number", "45", "Milliseconds between each slot arriving, from `data-rm-stagger`."),
    ],
  },
  {
    name: "recurrenceBuilder",
    category: "schedule",
    file: MOD_SCHEDULE,
    attribute: "data-rm-recurrence",
    summary: "\"Every two weeks on Tuesday and Thursday\", built from real selects and checkboxes.",
    notes:
      "The controls are created here rather than taken from the markup, and this is the one place in the module where that is right: the sentence and the RRULE are generated from the values, so an author-written option reading \"fortnightly\" would produce a rule nothing could render. What the markup supplies is the starting configuration, so a saved rule can be handed straight back. The weekday row only applies to a weekly rule and collapses with `grid-template-rows: 0fr → 1fr`, the one honest way to animate a box of unknown height without touching `height` — and the inner box needs `min-height: 0` or the track can never reach zero, which is why this technique is so often reported as broken. Collapsed, the row is also `inert`, which takes it out of the tab order and the accessibility tree together; hiding it with overflow alone leaves seven invisible checkboxes a keyboard still walks through. The weekday names come from `Intl`, so a Spanish page is not offered \"Mon\".",
    example: "<form>\n  <fieldset>\n    <legend>Repeat this booking</legend>\n    <div data-rm-recurrence data-rm-freq=\"weekly\" data-rm-interval=\"2\" data-rm-days=\"2,4\"\n         data-rm-name=\"rrule\" data-rm-week-start=\"1\" data-rm-label=\"Repeat\"></div>\n  </fieldset>\n  <button type=\"submit\">Save</button>\n</form>",
    usage: "import { recurrenceBuilder } from \"@soyrageagency/rage-motion\";\nrecurrenceBuilder();",
    options: [
      option("locale", "string", "\"\"", "BCP 47 tag for the weekday names and the sentence, from `data-rm-locale`."),
      option("label", "string", "\"Repeat\"", "Accessible name for the group, from `data-rm-label`."),
      option("name", "string", "\"rrule\"", "Name of the hidden input carrying the RRULE, from `data-rm-name`."),
      option("weekStart", "number", "1", "Day the weekday row starts on, 0 for Sunday, from `data-rm-week-start`."),
    ],
  },
  {
    name: "agendaList",
    category: "schedule",
    file: MOD_SCHEDULE,
    attribute: "data-rm-agenda-list",
    summary: "Events grouped under real day headings that know when they have become stuck.",
    notes:
      "Each day is a `<section>` with a real heading, so the agenda has a document outline and a screen reader can move day to day instead of scrolling through one long list. The relative words — Today, Tomorrow, Yesterday — are added in front of the existing heading rather than replacing it, so \"3 March\" is still there for somebody reading the page a week later, and the comparison is made against `data-rm-today` when the page declares one, which is what lets a cached or server-rendered agenda be right. There is no `:stuck` selector in CSS, so the class on a pinned heading comes from an IntersectionObserver watching a zero-height sentinel above it: when the sentinel leaves the top, the heading has taken its place. The usual version listens to `scroll` and measures, which is a forced layout on every frame of every scroll.",
    example: "<div data-rm-agenda-list data-rm-today=\"2026-03-03\" data-rm-label=\"This week\">\n  <section>\n    <h3><time datetime=\"2026-03-03\">Tuesday 3 March</time></h3>\n    <ol>\n      <li><time datetime=\"2026-03-03T09:00\">09:00</time> Stand-up</li>\n      <li><time datetime=\"2026-03-03T11:00\">11:00</time> Brand workshop</li>\n      <li><time datetime=\"2026-03-03T16:30\">16:30</time> Send the estimate</li>\n    </ol>\n  </section>\n  <section>\n    <h3><time datetime=\"2026-03-04\">Wednesday 4 March</time></h3>\n    <ol>\n      <li><time datetime=\"2026-03-04T10:00\">10:00</time> Photography at the warehouse</li>\n      <li><time datetime=\"2026-03-04T15:00\">15:00</time> Deploy window</li>\n    </ol>\n  </section>\n  <section>\n    <h3><time datetime=\"2026-03-05\">Thursday 5 March</time></h3>\n    <ol>\n      <li><time datetime=\"2026-03-05T12:00\">12:00</time> Lunch with the printer</li>\n    </ol>\n  </section>\n</div>",
    usage: "import { agendaList } from \"@soyrageagency/rage-motion\";\nagendaList();",
    options: [
      option("group", "string", "\"section\"", "Selector for each day's group, from `data-rm-group`."),
      option("item", "string", "\"li\"", "Selector for the events inside a group, from `data-rm-item`."),
      option("locale", "string", "\"\"", "BCP 47 tag used to say Today, Tomorrow and Yesterday in the page's own language, from `data-rm-locale`."),
      option("stagger", "number", "50", "Milliseconds between each event arriving, from `data-rm-stagger`."),
      option("label", "string", "\"Agenda\"", "Accessible name for the region, from `data-rm-label`."),
    ],
  },
  {
    name: "deadlinePill",
    category: "schedule",
    file: MOD_SCHEDULE,
    attribute: "data-rm-deadline-pill",
    summary: "A due date whose tone changes as it approaches and which says in words why it changed.",
    notes:
      "An amber pill means \"soon\" to the person who designed it and nothing at all to anybody else, so the words come first: \"due in 2 days\", \"overdue by 3 hours\", generated with `Intl.RelativeTimeFormat` in the page's own language and appended as real text. The colour is then allowed to agree with the sentence, which is the right order for those two decisions and the opposite of the usual one. The deadline itself is read from a `<time datetime>` and never computed, so the pill renders identically on the server and in the browser and only the comparison against now is live. It re-checks once a minute and only while on screen, because a page of forty deadlines does not need forty timers running in a background tab, and the unit is chosen by size so a deadline six weeks out is not announced as a thousand hours.",
    example: "<ul>\n  <li>Invoice 2026-0042 <span data-rm-deadline-pill data-rm-soon=\"72\" data-rm-urgent=\"12\"><time datetime=\"2026-03-05T17:00\">5 March, 17:00</time></span></li>\n  <li>Brand guidelines <span data-rm-deadline-pill data-rm-soon=\"72\" data-rm-urgent=\"12\"><time datetime=\"2026-03-19T12:00\">19 March, 12:00</time></span></li>\n  <li>Domain renewal <span data-rm-deadline-pill data-rm-soon=\"72\" data-rm-urgent=\"12\"><time datetime=\"2026-02-28T09:00\">28 February, 09:00</time></span></li>\n</ul>",
    usage: "import { deadlinePill } from \"@soyrageagency/rage-motion\";\ndeadlinePill();",
    options: [
      option("soon", "number", "72", "Hours before the deadline at which the tone becomes \"soon\", from `data-rm-soon`."),
      option("urgent", "number", "12", "Hours before the deadline at which it becomes urgent, from `data-rm-urgent`."),
      option("locale", "string", "\"\"", "BCP 47 tag used for the relative phrase."),
    ],
  },
  {
    name: "eventChip",
    category: "schedule",
    file: MOD_SCHEDULE,
    attribute: "data-rm-event-chip",
    summary: "Overlapping events laid out side by side in lanes instead of stacked on top of each other.",
    notes:
      "Placing an event by time is arithmetic anybody can do; the part that is routinely skipped is what happens when two of them touch, and the naive version gives every event the full column width so a ten o'clock meeting vanishes behind a nine-thirty one. This does the sweep: events are sorted by start, grouped into clusters that genuinely overlap, and each is given the first lane in its cluster that is free by the time it begins, with the cluster's lane count written alongside so the CSS can divide the column. Lane and width are set once as custom properties and never animated — the entrance is a transform from a stacked position into the lane, which is why eleven colliding events settle without a single reflow. An event whose end is missing or earlier than its start is treated as half an hour long rather than dropped, because a bad end time is still somebody's real appointment.",
    example: "<ol data-rm-event-chip data-rm-hour-from=\"9\" data-rm-hour-to=\"18\">\n  <li><time datetime=\"2026-03-03T09:30\">09:30</time><time datetime=\"2026-03-03T11:00\">11:00</time> Client kick-off</li>\n  <li><time datetime=\"2026-03-03T10:00\">10:00</time><time datetime=\"2026-03-03T10:45\">10:45</time> Supplier call</li>\n  <li><time datetime=\"2026-03-03T10:30\">10:30</time><time datetime=\"2026-03-03T12:00\">12:00</time> Studio photography</li>\n  <li><time datetime=\"2026-03-03T13:00\">13:00</time><time datetime=\"2026-03-03T14:00\">14:00</time> Lunch</li>\n  <li><time datetime=\"2026-03-03T15:00\">15:00</time><time datetime=\"2026-03-03T16:30\">16:30</time> Rebrand review</li>\n  <li><time datetime=\"2026-03-03T16:00\">16:00</time><time datetime=\"2026-03-03T17:00\">17:00</time> Invoicing</li>\n</ol>",
    usage: "import { eventChip } from \"@soyrageagency/rage-motion\";\neventChip();",
    options: [
      option("hourFrom", "number", "8", "First hour of the window, from `data-rm-hour-from`."),
      option("hourTo", "number", "20", "Last hour of the window, from `data-rm-hour-to`."),
      option("item", "string", "\"li\"", "Selector for the chips to lay out, from `data-rm-item`."),
      option("locale", "string", "\"\"", "BCP 47 tag used to speak each chip's start and end."),
      option("duration", "number", "460", "Milliseconds each chip takes to settle into its lane."),
    ],
  },
  {
    name: "weekStrip",
    category: "schedule",
    file: MOD_SCHEDULE,
    attribute: "data-rm-week-strip",
    summary: "A horizontal run of days that scrolls the strip to the chosen day and nothing else.",
    notes:
      "A strip of days is one choice from a set, so it is a real radio group: `role=\"radiogroup\"`, `role=\"radio\"` on each day, arrows, Home and End, and one tab stop for the whole strip. The days are `<button>` elements, so they are clickable and focusable without any of the div-and-tabindex arrangements that quietly lose the Enter key. Keeping the chosen day visible uses the kit's `keepInView` rather than `scrollIntoView`, and that is the entire reason the helper exists: `scrollIntoView` walks up and scrolls every scrollable ancestor including the document, so a strip that highlights today on mount throws the whole page down to wherever the strip happens to be. The fades at the ends are masks driven by two classes recalculated on scroll and on resize, because a strip that fades at an edge it has already reached is claiming there is more to see when there is not.",
    example: "<div data-rm-week-strip data-rm-today=\"2026-03-03\" data-rm-label=\"Pick a day\">\n  <ul>\n    <li><button type=\"button\"><time datetime=\"2026-03-02\">Mon 2</time><span>3 events</span></button></li>\n    <li><button type=\"button\"><time datetime=\"2026-03-03\">Tue 3</time><span>5 events</span></button></li>\n    <li><button type=\"button\"><time datetime=\"2026-03-04\">Wed 4</time><span>2 events</span></button></li>\n    <li><button type=\"button\"><time datetime=\"2026-03-05\">Thu 5</time><span>Free</span></button></li>\n    <li><button type=\"button\"><time datetime=\"2026-03-06\">Fri 6</time><span>4 events</span></button></li>\n    <li><button type=\"button\"><time datetime=\"2026-03-07\">Sat 7</time><span>Free</span></button></li>\n    <li><button type=\"button\"><time datetime=\"2026-03-08\">Sun 8</time><span>1 event</span></button></li>\n    <li><button type=\"button\"><time datetime=\"2026-03-09\">Mon 9</time><span>2 events</span></button></li>\n  </ul>\n</div>",
    usage: "import { weekStrip } from \"@soyrageagency/rage-motion\";\nweekStrip();",
    options: [
      option("locale", "string", "\"\"", "BCP 47 tag used to speak each day's full date."),
      option("label", "string", "\"Choose a day\"", "Accessible name for the radio group, from `data-rm-label`."),
      option("item", "string", "\"button\"", "Selector for the day controls inside the strip, from `data-rm-item`."),
    ],
  },

  // ── Admin consoles and data tables ──
  {
    name: "dataGrid",
    category: "console",
    file: MOD_CONSOLE,
    attribute: "data-rm-data-grid",
    summary: "A real table with sticky headers, columns you can resize with the pointer or the keyboard, and row selection that is announced.",
    notes:
      "The sticky header is `position: sticky` on the header cells rather than a second cloned table floating above the first, which is what most grid libraries still do — a clone has to be kept in sync with every resize, sort and re-render, is announced twice by a screen reader, and drifts by a pixel at any zoom level other than 100%. Column widths are written into a real `<colgroup>` as custom properties, and the moment the first column is dragged every column is frozen at its current width before `table-layout: fixed` is switched on; set one width without freezing the rest and the browser redistributes the remainder, so dragging one edge visibly jerks the four columns beside it. The drag is deliberately not eased — a resize handle that lags behind the pointer reads as broken — but pointer moves are coalesced into the kit's shared frame loop, so a fast drag costs one layout per frame instead of one per event. Every handle is a real button with the column's name in its label and responds to the arrow keys and Home, because a column only a mouse can resize is a column half an operations team cannot resize. Selection is a roving tabindex over the rows with `aria-selected` and a polite count, and it is also written to `data-rm-selected`, which is how bulkBar finds out without either component knowing the other exists.",
    example: "<div data-rm-data-grid data-rm-label=\"Open orders\" data-rm-mode=\"multiple\" data-rm-min=\"90\">\n  <table>\n    <thead>\n      <tr><th scope=\"col\">Order</th><th scope=\"col\">Customer</th><th scope=\"col\">Status</th><th scope=\"col\">Total</th></tr>\n    </thead>\n    <tbody>\n      <tr><td>#4821</td><td>Marta Ibáñez</td><td>Packing</td><td>€248.00</td></tr>\n      <tr><td>#4822</td><td>Hendrik Voss</td><td>Awaiting payment</td><td>€1,940.50</td></tr>\n      <tr><td>#4823</td><td>Aoife Brennan</td><td>Shipped</td><td>€76.20</td></tr>\n      <tr><td>#4824</td><td>Rui Cardoso</td><td>Packing</td><td>€512.00</td></tr>\n      <tr><td>#4825</td><td>Lena Ostrowska</td><td>Refunded</td><td>€96.99</td></tr>\n    </tbody>\n  </table>\n</div>",
    usage: "import { dataGrid } from \"@soyrageagency/rage-motion\";\ndataGrid();",
    options: [
      option("label", "string", "\"Data grid\"", "data-rm-label: names the scrollable region the grid lives in."),
      option("min", "number", "72", "data-rm-min: the narrowest a column may be dragged, in pixels."),
      option("step", "number", "16", "data-rm-step: pixels per arrow-key press on a resize handle; Shift multiplies it by four."),
      option("mode", "\"multiple\" | \"single\" | \"none\"", "\"multiple\"", "data-rm-mode: how many rows may be selected at once, or none at all."),
      option("selected", "\"true\" | \"false\"", "\"false\"", "data-rm-selected on each `<tbody>` row: whether that row starts selected. The grid keeps the attribute current as the selection changes, and bulkBar watches it with a MutationObserver — which is how the two find each other without either knowing the other exists."),
    ],
  },
  {
    name: "columnPicker",
    category: "console",
    file: MOD_CONSOLE,
    attribute: "data-rm-column-picker",
    summary: "A disclosure of real checkboxes deciding which columns of a named table are showing.",
    notes:
      "The checkboxes are genuine `<input type=\"checkbox\">` elements inside a real `<fieldset>` with a `<legend>`, so the panel works in a screen reader's forms mode, with voice control and with a keyboard — none of which is true of the div-and-`aria-checked` rebuild this control is nearly always given. Hiding a column means hiding every cell in it: the common shortcut is to set the `<col>` element to `display: none` and then be surprised that the data is still on screen, because a column element can only paint backgrounds and borders and has no power over the cells that sit in it. The panel is absolutely positioned out of the flow, so opening it never pushes the table it describes down the page, and the last visible column cannot be switched off because a table with no columns looks broken rather than filtered. The trigger keeps a running count in its own label, which is the cheapest possible way to answer \"am I looking at everything?\" without opening anything. Each box is initialised from the column's real state rather than being asserted as ticked, so a column the author shipped hidden is not reported as showing; and because the trigger's text is taken over to carry the count, the author's own wording is kept and put back when the component is unmounted.",
    example: "<div data-rm-column-picker=\"orders-grid\" data-rm-label=\"Columns\">\n  <button type=\"button\">Columns</button>\n</div>\n\n<div data-rm-data-grid id=\"orders-grid\" data-rm-label=\"Open orders\">\n  <table>\n    <thead><tr><th scope=\"col\">Order</th><th scope=\"col\">Customer</th><th scope=\"col\">Region</th><th scope=\"col\">Total</th></tr></thead>\n    <tbody>\n      <tr><td>#4821</td><td>Marta Ibáñez</td><td>Iberia</td><td>€248.00</td></tr>\n      <tr><td>#4822</td><td>Hendrik Voss</td><td>DACH</td><td>€1,940.50</td></tr>\n      <tr><td>#4823</td><td>Aoife Brennan</td><td>Ireland</td><td>€76.20</td></tr>\n    </tbody>\n  </table>\n</div>",
    usage: "import { columnPicker } from \"@soyrageagency/rage-motion\";\ncolumnPicker();",
    options: [
      option("label", "string", "\"Columns\"", "data-rm-label: the legend inside the panel and the stem of the trigger's label."),
      option("duration", "number", "240", "data-rm-duration: milliseconds for the panel's fade and settle."),
      option("onChange", "(column, shown, table) => void", "undefined", "Called after each column is switched on or off."),
    ],
  },
  {
    name: "bulkBar",
    category: "console",
    file: MOD_CONSOLE,
    attribute: "data-rm-bulk-bar",
    summary: "A real toolbar that appears when rows are selected and says how many, in words.",
    notes:
      "It learns about the selection by watching `data-rm-selected` with a MutationObserver rather than by being handed a callback, so the same bar works above a dataGrid, a hand-rolled table or a wall of cards and neither side has to import the other. It is a real `role=\"toolbar\"` with one tab stop and arrow keys inside, which matters more here than almost anywhere: a bulk bar appears while your hands are already on the keyboard, and eight separately tabbable buttons between the table and the rest of the page is eight presses nobody asked for. The count is written out — \"3 rows selected\" — and spoken politely, because the usual implementation communicates the number only through the width of a blue pill. The bar is fixed over the content and centred by the box model rather than by a transform, so the entrance animation has the transform to itself; centring with `translateX(-50%)` and then animating transform is how these bars end up jumping sideways on the way in.",
    example: "<div data-rm-bulk-bar=\"orders-grid\" data-rm-unit=\"order\" hidden>\n  <button type=\"button\">Mark as packed</button>\n  <button type=\"button\">Print labels</button>\n  <button type=\"button\">Export selected</button>\n</div>\n\n<div data-rm-data-grid id=\"orders-grid\" data-rm-label=\"Open orders\">\n  <table>\n    <thead><tr><th scope=\"col\">Order</th><th scope=\"col\">Customer</th><th scope=\"col\">Total</th></tr></thead>\n    <tbody>\n      <tr><td>#4821</td><td>Marta Ibáñez</td><td>€248.00</td></tr>\n      <tr><td>#4822</td><td>Hendrik Voss</td><td>€1,940.50</td></tr>\n      <tr><td>#4823</td><td>Aoife Brennan</td><td>€76.20</td></tr>\n    </tbody>\n  </table>\n</div>",
    usage: "import { bulkBar } from \"@soyrageagency/rage-motion\";\nbulkBar();",
    options: [
      option("label", "string", "\"Bulk actions\"", "data-rm-label: the toolbar's accessible name."),
      option("noun", "string", "\"row\"", "data-rm-unit: what is being counted — \"order\", \"user\", \"invoice\". Pluralised for you."),
      option("duration", "number", "260", "data-rm-duration: milliseconds for the bar to rise and fall."),
    ],
  },
  {
    name: "savedViews",
    category: "console",
    file: MOD_CONSOLE,
    attribute: "data-rm-saved-views",
    summary: "The filter views somebody keeps, with the current one marked by aria-current rather than only by colour.",
    notes:
      "These are not tabs and must not be built as tabs: they do not each own a panel, they all reconfigure the same table, and `aria-current=\"true\"` is the attribute that exists for exactly this — one of several similar things being the one you are looking at. The underline is a single 100-pixel element moved with `translateX` and `scaleX`, which is why it is exact rather than approximate: scaling from a known base width makes the arithmetic trivial and keeps the whole switch to one composited animation instead of a repaint of every chip's border. Adding and removing views FLIPs the chips that remain, so the row visibly closes up and you can see which one went, and a ResizeObserver re-places the marker when the window changes width — the usual version measures once on mount and the underline is a centimetre adrift the first time the page is resized. The chips share a roving tabindex, so Tab steps over the whole set in one press.",
    example: "<div data-rm-saved-views data-rm-label=\"Saved views\">\n  <button type=\"button\" aria-current=\"true\">All orders</button>\n  <button type=\"button\">Needs packing</button>\n  <button type=\"button\">Awaiting payment</button>\n  <button type=\"button\">Refund requests</button>\n  <button type=\"button\">High value</button>\n</div>",
    usage: "import { savedViews } from \"@soyrageagency/rage-motion\";\nsavedViews();",
    options: [
      option("label", "string", "\"Saved views\"", "data-rm-label: names the group of views."),
      option("duration", "number", "320", "data-rm-duration: milliseconds for the marker slide and the FLIP."),
      option("onSelect", "(name, button) => void", "undefined", "Called with the view's name each time one is chosen."),
    ],
  },
  {
    name: "queryBar",
    category: "console",
    file: MOD_CONSOLE,
    attribute: "data-rm-query-bar",
    summary: "A filter expression built from real selects and inputs, with a plain-language summary of what it says.",
    notes:
      "This deliberately refuses the free-text query box. A field written as `<select>` cannot be misspelled, an operator written as `<select>` is discoverable without documentation, and the whole thing submits as an ordinary form with no JavaScript at all; a box that accepts `status:open AND amount>500` looks clever in a screenshot and costs every user a syntax error the first four times they use it. New conditions are cloned from the first row in the markup, and every `id` in the clone is rewritten along with the `for`, `aria-describedby` and `aria-labelledby` that point at it — the usual implementation clones the row and quietly leaves five labels all aimed at the first row's input, which is invisible to the eye and fatal to a screen reader. Rows arriving and leaving move their neighbours with a FLIP rather than letting the list snap, and focus is placed deliberately on both: into the new row's first control when one is added, onto the neighbouring row when one is removed. The last condition cannot be deleted, because an empty filter form gives you nothing to start from.",
    example: "<form data-rm-query-bar data-rm-label=\"Filter orders\" data-rm-mode=\"and\">\n  <ol>\n    <li>\n      <label for=\"q1-field\">Field</label>\n      <select id=\"q1-field\"><option>Status</option><option>Total</option><option>Region</option></select>\n      <label for=\"q1-op\">Operator</label>\n      <select id=\"q1-op\"><option>is</option><option>is not</option><option>is more than</option></select>\n      <label for=\"q1-value\">Value</label>\n      <input id=\"q1-value\" type=\"text\" value=\"Awaiting payment\">\n    </li>\n  </ol>\n</form>",
    usage: "import { queryBar } from \"@soyrageagency/rage-motion\";\nqueryBar();",
    options: [
      option("label", "string", "\"Filter\"", "data-rm-label: names the search region the conditions live in."),
      option("addLabel", "string", "\"Add condition\"", "Text on the button that appends another condition."),
      option("duration", "number", "280", "data-rm-duration: milliseconds for the FLIP when a row is added or removed."),
      option("onChange", "(summary, form) => void", "undefined", "Called with the expression in plain language after every edit."),
      option("mode", "\"and\" | \"or\"", "\"and\"", "data-rm-mode on the root: the word that joins the conditions in the spoken summary, so \"status is open or status is pending\" reads correctly rather than being asserted as an \"and\"."),
    ],
  },
  {
    name: "keyboardMap",
    category: "console",
    file: MOD_CONSOLE,
    attribute: "data-rm-keyboard-map",
    summary: "A shortcut sheet built at open time from the bindings the page itself declares.",
    notes:
      "The list is assembled from every element carrying `data-rm-binding`, using that element's own accessible name as the description, so the sheet cannot drift from the application. A hand-written help screen is a second copy of the truth, and it starts lying the first week somebody changes a binding and forgets it exists. It is a real modal and behaves like one: the rest of the page is `inert` rather than merely `aria-hidden`, which is the difference between Tab staying inside the dialog and Tab walking straight out into the page behind it; Escape closes, and focus goes back to whatever opened it. The hotkey is ignored while the focus is in a text field or a contenteditable, because a console with a single-key shortcut that fires inside the search box is a console you cannot search in. Bindings written with spaces are rendered as a sequence — \"g then o\" — so a chord and a sequence are not shown as the same thing.",
    example: "<div data-rm-keyboard-map hidden></div>\n\n<button type=\"button\" data-rm-binding=\"g o\" data-rm-group=\"Go to\">Orders</button>\n<button type=\"button\" data-rm-binding=\"g c\" data-rm-group=\"Go to\">Customers</button>\n<button type=\"button\" data-rm-binding=\"g s\" data-rm-group=\"Go to\">Settings</button>\n<button type=\"button\" data-rm-binding=\"/\" data-rm-group=\"Actions\">Search</button>\n<button type=\"button\" data-rm-binding=\"e\" data-rm-group=\"Actions\">Export the current view</button>\n<button type=\"button\" data-rm-binding=\"shift+r\" data-rm-group=\"Actions\">Retry failed jobs</button>",
    usage: "import { keyboardMap } from \"@soyrageagency/rage-motion\";\nkeyboardMap();",
    options: [
      option("label", "string", "\"Keyboard shortcuts\"", "data-rm-label: the dialog's heading and its accessible name."),
      option("hotkey", "string", "\"?\"", "data-rm-hotkey: the key that opens and closes the sheet, ignored while you are typing."),
      option("source", "string", "\"[data-rm-binding]\"", "Selector for the elements whose bindings the sheet reads."),
      option("binding", "string", "\"\"", "data-rm-binding on any element anywhere on the page: the keys, as \"ctrl+k\" for a chord or \"g o\" for a sequence. This is what the sheet is built from; an element without it is skipped, and its accessible name becomes the description."),
      option("group", "string", "\"General\"", "data-rm-group on the same element: the heading it is filed under. Everything without one collects under \"General\"."),
    ],
  },
  {
    name: "logStream",
    category: "console",
    file: MOD_CONSOLE,
    attribute: "data-rm-log-stream",
    summary: "Appended log lines that follow the tail only while you are already at the tail.",
    notes:
      "The whole component is one rule: scroll to the bottom only if the viewer is already at the bottom. Scroll up to read something and the stream stops moving, a real button appears saying how many lines have arrived since, and pressing it takes you back down and re-attaches — every log viewer that scrolls unconditionally becomes unusable the moment anything is actually happening. The subtle half is trimming: when the oldest lines are dropped to keep the buffer bounded, the content above the viewport shrinks and the browser silently drags the scroll position with it, so the line you were reading walks up the screen. The height removed is measured and subtracted from `scrollTop`, which holds it exactly still. The container is `role=\"log\"` with `aria-live=\"off\"` by default and on purpose: a thousand lines a minute in a live region is not accessibility, it is a denial of service — switch it to polite and only errors are spoken.",
    example: "<div data-rm-log-stream data-rm-max=\"400\" data-rm-label=\"Deploy log\" data-rm-announce=\"polite\">\n  <ol>\n    <li class=\"rm-log-stream-line is-info\"><time datetime=\"2026-03-04T09:14:02Z\">09:14:02</time><span class=\"rm-log-stream-level\">info</span><span class=\"rm-log-stream-text\">Build 4821 started</span></li>\n    <li class=\"rm-log-stream-line is-info\"><time datetime=\"2026-03-04T09:14:19Z\">09:14:19</time><span class=\"rm-log-stream-level\">info</span><span class=\"rm-log-stream-text\">Dependencies resolved in 17s</span></li>\n    <li class=\"rm-log-stream-line is-warn\"><time datetime=\"2026-03-04T09:15:41Z\">09:15:41</time><span class=\"rm-log-stream-level\">warn</span><span class=\"rm-log-stream-text\">Image assets exceed the 2 MB budget</span></li>\n    <li class=\"rm-log-stream-line is-error\"><time datetime=\"2026-03-04T09:16:08Z\">09:16:08</time><span class=\"rm-log-stream-level\">error</span><span class=\"rm-log-stream-text\">Migration 0042 failed: column already exists</span></li>\n  </ol>\n</div>",
    usage: "import { logStream } from \"@soyrageagency/rage-motion\";\nlogStream();",
    options: [
      option("max", "number", "500", "data-rm-max: how many lines are kept before the oldest are trimmed."),
      option("threshold", "number", "24", "data-rm-threshold: how many pixels from the bottom still counts as being at the tail."),
      option("announce", "boolean", "false", "data-rm-announce: \"polite\" speaks error lines; the default, \"off\", speaks none of them."),
      option("label", "string", "\"Log\"", "data-rm-label: the accessible name of the log region."),
    ],
  },
  {
    name: "metricTile",
    category: "console",
    file: MOD_CONSOLE,
    attribute: "data-rm-metric-tile",
    summary: "One figure with its change written out in words, rolled up once when it arrives on screen.",
    notes:
      "The number lives in the markup and stays there; the roll is decoration laid over the top of it. While it is rolling the drawn figure is `aria-hidden` and the real value sits in a visually hidden span, so a screen reader is told \"1,284\" once rather than being read a stream of intermediate numbers as they tick past — which is exactly what happens when the animated element is also the live one. The delta is a sentence: \"Up 12.4% on the previous period\", not a green triangle, because a triangle's meaning is a colour convention and the convention is not universal; in several markets a red arrow pointing up is good news. The roll runs on the kit's shared frame loop and only while the tile is on screen, so a dashboard of forty tiles costs one requestAnimationFrame and no work at all for the thirty below the fold. The figure is set in tabular numerals, without which the tile visibly shuffles its own width sixty times a second.",
    example: "<div class=\"dashboard\">\n  <article data-rm-metric-tile data-rm-delta=\"12.4\" data-rm-about=\"on last week\">\n    <h3>Orders</h3><strong>1,284</strong>\n  </article>\n  <article data-rm-metric-tile data-rm-delta=\"-3.1\" data-rm-about=\"on last week\">\n    <h3>Refund rate</h3><strong>2.4%</strong>\n  </article>\n  <article data-rm-metric-tile data-rm-delta=\"0\" data-rm-duration=\"1200\">\n    <h3>Average basket</h3><strong>€84.50</strong>\n  </article>\n</div>",
    usage: "import { metricTile } from \"@soyrageagency/rage-motion\";\nmetricTile();",
    options: [
      option("figure", "string", "\"strong\"", "Selector for the element holding the number inside the tile."),
      option("duration", "number", "900", "data-rm-duration: milliseconds for the roll from the starting value to the real one."),
      option("locale", "string", "undefined", "BCP 47 tag for grouping and decimal separators; the browser's own by default."),
      option("delta", "number", "none", "data-rm-delta on the tile: the percentage change, signed. Positive reads \"Up 12.4%\", negative \"Down 12.4%\", zero \"No change\". Leave it off and no delta line is added at all."),
      option("about", "string", "\"on the previous period\"", "data-rm-about on the tile: what the delta is measured against, so the line reads \"Up 12.4% on last week\" rather than a number with no frame of reference."),
      option("from", "number", "0", "data-rm-from on the tile: the number the roll counts up from. Rolling every figure from zero is wrong for anything that never was zero — a churn rate rolling 0 → 2.1% claims a catastrophe that resolves itself."),
    ],
  },
  {
    name: "healthGrid",
    category: "console",
    file: MOD_CONSOLE,
    attribute: "data-rm-health-grid",
    summary: "Many services at a glance, each stating its condition in a word as well as a colour.",
    notes:
      "A status board is the canonical place where colour is used as the only signal, and the canonical place that fails — red and green are the commonest pair of colours people cannot separate, and a wall of fifty dots is precisely the situation where you need to be certain. So every tile says operational, degraded, outage or unknown, and the colour is the second copy of that. A summary line above the grid counts the states and is spoken politely for good news and assertively when something is actually down, which is one of the few events in a console worth interrupting somebody for. With `data-rm-sort=\"worst\"` a failing service moves to the front and the tiles it displaces animate with a FLIP, so you can see which one moved and where it came from; a grid that silently reorders itself has to be re-read from the top every time you glance at it.",
    example: "<ul data-rm-health-grid data-rm-sort=\"worst\" data-rm-label=\"Platform health\">\n  <li data-rm-state=\"up\" data-rm-name=\"API\">API</li>\n  <li data-rm-state=\"up\" data-rm-name=\"Checkout\">Checkout</li>\n  <li data-rm-state=\"degraded\" data-rm-name=\"Search\">Search</li>\n  <li data-rm-state=\"up\" data-rm-name=\"Webhooks\">Webhooks</li>\n  <li data-rm-state=\"down\" data-rm-name=\"PDF export\">PDF export</li>\n  <li data-rm-state=\"up\" data-rm-name=\"Email\">Email</li>\n  <li data-rm-state=\"unknown\" data-rm-name=\"Legacy sync\">Legacy sync</li>\n  <li data-rm-state=\"up\" data-rm-name=\"CDN\">CDN</li>\n</ul>",
    usage: "import { healthGrid } from \"@soyrageagency/rage-motion\";\nhealthGrid();",
    options: [
      option("label", "string", "\"Service health\"", "data-rm-label: names the list of services."),
      option("duration", "number", "340", "data-rm-duration: milliseconds for the FLIP when the grid re-sorts."),
      option("sort", "\"none\" | \"worst\"", "\"none\"", "data-rm-sort: \"worst\" keeps outages and degradations at the front."),
      option("state", "\"up\" | \"degraded\" | \"down\" | \"unknown\"", "\"unknown\"", "data-rm-state on each child: the service's condition. It picks the colour, the word printed beside it, and the sort position when data-rm-sort=\"worst\"."),
      option("name", "string", "the child's first text node", "data-rm-name on each child: the name rmSet() addresses it by. Without it the component falls back to the element's leading text, which is fragile the moment the markup gains a wrapper."),
    ],
  },
  {
    name: "auditRow",
    category: "console",
    file: MOD_CONSOLE,
    attribute: "data-rm-audit-row",
    summary: "An audit entry whose time is relative on screen, absolute in its title and machine-readable in its datetime.",
    notes:
      "Time is the whole problem with an audit log. \"2 hours ago\" is what you want to read and useless for anything else; a timestamp is what you want to paste into a ticket and impossible to scan down a page of four hundred rows. So all three exist at once: the machine value stays in `<time datetime>` where a parser can reach it, the visible text becomes relative and refreshes itself, and the absolute formatted time is put in `title` for the pointer *and* in a `role=\"note\"` wired up with `aria-describedby` — because `title` is a hover affordance and nothing else, so a keyboard-only operator would otherwise never see the timestamp this component claims to be offering. The `<time>` is therefore focusable, the note opens on `focusin` as well as `pointerenter`, and Escape closes it. The relative text refreshes only while the row is on screen, because an audit page is a thousand rows long and a thousand timers rewriting text nobody is looking at is a fan spinning up for nothing. A row that has just arrived can flash its background through `rmFlash()` — a colour animation, so no layout is touched and the rows beneath it do not move a pixel, which is the failure mode of the usual \"new!\" badge that inserts itself into the row and shoves everything sideways.",
    example: "<ol class=\"audit\">\n  <li data-rm-audit-row data-rm-level=\"danger\">\n    <strong>alex@northwind.co</strong> deleted the <em>EU pricing</em> rule\n    <time datetime=\"2026-03-04T08:41:00Z\">08:41</time>\n  </li>\n  <li data-rm-audit-row data-rm-level=\"warning\">\n    <strong>ci-bot</strong> rotated the <em>staging</em> API key\n    <time datetime=\"2026-03-04T07:12:00Z\">07:12</time>\n  </li>\n  <li data-rm-audit-row data-rm-level=\"info\">\n    <strong>marta@northwind.co</strong> invited <em>rui@northwind.co</em> as Editor\n    <time datetime=\"2026-03-03T16:58:00Z\">16:58</time>\n  </li>\n</ol>",
    usage: "import { auditRow } from \"@soyrageagency/rage-motion\";\nauditRow();",
    options: [
      option("locale", "string", "undefined", "BCP 47 tag for the absolute time shown in the title and in the note reached on focus; the browser's own by default."),
      option("every", "number", "30000", "Milliseconds between refreshes of the relative time, while the row is on screen."),
      option("level", "\"info\" | \"warning\" | \"danger\"", "\"info\"", "data-rm-level on the row: the severity, drawn as an inset rule down the leading edge. It is read, never written back — echoing it onto the author's own attribute is how a mount/unmount cycle ends up deleting markup."),
    ],
  },
  {
    name: "envSwitch",
    category: "console",
    file: MOD_CONSOLE,
    attribute: "data-rm-env-switch",
    summary: "An environment picker that reverts first and asks second, with production confirmed by typing its name.",
    notes:
      "The ordering is the entire component. The usual guard lets the change fire, then puts a dialog on top, and if you cancel it tries to put the control back — by which time the application has already switched environment, a request has gone out, and the select is displaying something that is not true. Here the change event is caught, the previous value is restored immediately, and only a confirmed answer applies the new one, so the control can never show a state the application is not in. Confirmation is a typed environment name rather than an OK button, because an OK button on a dialog you have seen forty times is a button you press without reading, and typing \"production\" cannot be done by reflex. The dialog is a real `alertdialog` with the rest of the page inert, focus on the safe answer, the destructive button disabled until the name matches, Escape cancelling and focus returned to the select either way.",
    example: "<div data-rm-env-switch data-rm-guard=\"production,eu-production\" data-rm-label=\"Environment\">\n  <label for=\"env\">Environment</label>\n  <select id=\"env\">\n    <option value=\"development\">Development</option>\n    <option value=\"staging\" selected>Staging</option>\n    <option value=\"eu-production\">EU production</option>\n    <option value=\"production\">Production</option>\n  </select>\n</div>",
    usage: "import { envSwitch } from \"@soyrageagency/rage-motion\";\nenvSwitch();",
    options: [
      option("guarded", "string", "\"production\"", "data-rm-guard: comma-separated option values that have to be confirmed before they apply."),
      option("label", "string", "\"Environment\"", "data-rm-label: the select's accessible name when the markup has no label for it."),
      option("onChange", "(value, select) => void", "undefined", "Called only once a switch has actually happened, guarded or not."),
    ],
  },
  {
    name: "roleBadge",
    category: "console",
    file: MOD_CONSOLE,
    attribute: "data-rm-role-badge",
    summary: "A permission role written as a word, with what it may actually do revealed on hover and on focus.",
    notes:
      "\"Editor\" tells nobody anything useful on its own, so the badge carries the permissions behind it — and the catch is that the usual version shows them on hover alone, which means the information does not exist for anybody using a keyboard, a screen reader or a touch screen. That is three audiences, one of which is most of them. So a badge with something to say becomes a real `<button type=\"button\">`, the note opens on focus as well as on pointer, `aria-expanded` reports the state, `aria-describedby` wires the note to the badge, and Escape closes it. A badge with nothing to say stays a plain span and never becomes a button that does nothing when pressed. The note is absolutely positioned, so a table of forty people does not reflow every time one badge is reached, and its colours are set on the badge rather than on the text inside it, so the role's colour and the note's contrast are independent.",
    example: "<table>\n  <thead><tr><th scope=\"col\">Person</th><th scope=\"col\">Role</th></tr></thead>\n  <tbody>\n    <tr><td>marta@northwind.co</td><td><span data-rm-role-badge=\"owner\" data-rm-about=\"Full access, including billing and deleting the workspace.\">Owner</span></td></tr>\n    <tr><td>alex@northwind.co</td><td><span data-rm-role-badge=\"admin\" data-rm-about=\"Can manage members, roles and integrations. Cannot delete the workspace.\">Admin</span></td></tr>\n    <tr><td>rui@northwind.co</td><td><span data-rm-role-badge=\"editor\" data-rm-about=\"Can create and publish content. Cannot change members or billing.\">Editor</span></td></tr>\n    <tr><td>aoife@northwind.co</td><td><span data-rm-role-badge=\"viewer\" data-rm-about=\"Read-only access to everything except billing.\">Viewer</span></td></tr>\n  </tbody>\n</table>",
    usage: "import { roleBadge } from \"@soyrageagency/rage-motion\";\nroleBadge();",
    options: [
      option("tone", "\"owner\" | \"admin\" | \"editor\" | \"viewer\" | \"billing\"", "\"neutral\"", "data-rm-role-badge: the role, which picks the badge's colour; the visible word is your own text."),
      option("about", "string", "\"\"", "data-rm-about on the badge: the permissions behind the role, in a sentence. This is the whole component — without it the badge is only given its colour class and stays a plain span, rather than becoming a button that does nothing when pressed."),
    ],
  },
  {
    name: "quotaMeter",
    category: "console",
    file: MOD_CONSOLE,
    attribute: "data-rm-quota-meter",
    summary: "Usage against a limit, with the band it has reached named out loud rather than only coloured.",
    notes:
      "A bar is a rectangle. What somebody needs to know is \"820 of 1,000 API calls — 82%, approaching the limit\", and that whole sentence is what goes into `aria-valuetext`, because `aria-valuenow=\"82\"` on its own is read as a bare number with no unit and no judgement attached to it. The three bands each have a name as well as a colour, and crossing into the last one is announced assertively while crossing back down is polite — running out of quota is one of the few things in a console that genuinely earns an interruption, and being told about it going back to normal does not. The fill is `scaleX` from the left on a full-width track driven by a unitless custom property, so nothing else in the row is re-laid-out as the number moves; a width transition here reflows the label beside it on every frame for exactly the same picture. The first paint sets the band silently, so a page that loads already over quota does not shout at somebody who has only just arrived.",
    example: "<div class=\"quotas\">\n  <div data-rm-quota-meter data-rm-used=\"820\" data-rm-limit=\"1000\" data-rm-unit=\"API calls\"></div>\n  <div data-rm-quota-meter data-rm-used=\"47\" data-rm-limit=\"50\" data-rm-unit=\"seats\" data-rm-warn=\"70\" data-rm-critical=\"90\"></div>\n  <div data-rm-quota-meter data-rm-used=\"12400\" data-rm-limit=\"100000\" data-rm-unit=\"emails this month\"></div>\n</div>",
    usage: "import { quotaMeter } from \"@soyrageagency/rage-motion\";\nquotaMeter();",
    options: [
      option("unit", "string", "\"units\"", "data-rm-unit: what is being counted, used in the sentence and the label."),
      option("warn", "number", "75", "data-rm-warn: the percentage at which the meter starts saying \"approaching the limit\"."),
      option("critical", "number", "90", "data-rm-critical: the percentage at which it says \"over the safe limit\", assertively."),
      option("duration", "number", "520", "data-rm-duration: milliseconds for the fill to travel to its new value."),
      option("locale", "string", "undefined", "BCP 47 tag for the numbers in the sentence; the browser's own by default."),
      option("used", "number", "0", "data-rm-used: the consumption to draw on the first paint. rmSet() moves it afterwards."),
      option("limit", "number", "100", "data-rm-limit: the allowance the usage is measured against. Clamped to at least 1, because a limit of zero makes every percentage infinite."),
    ],
  },
  {
    name: "jobQueue",
    category: "console",
    file: MOD_CONSOLE,
    attribute: "data-rm-job-queue",
    summary: "Running, queued, failed and finished jobs, each with a word, a real progress bar and a retry that works.",
    notes:
      "A job with a known percentage gets a `role=\"progressbar\"` with a real `aria-valuenow`; a job that is running without one gets no `aria-valuenow` at all, only an `aria-valuetext` of \"running\". This is the detail everybody gets wrong: an indeterminate bar reporting `aria-valuenow=\"0\"` is announced as \"0 percent\", which is an outright lie about a job that is progressing perfectly well. The queue re-sorts so failures are impossible to miss and running jobs sit above waiting ones, and the rows that move do it with a FLIP so you can follow a single job from the queue into the running set instead of watching the list teleport. Failures are announced assertively and offer a real retry button named after the job it retries, rather than an icon that says \"retry\" to nobody. Under reduced motion the indeterminate sweep simply stops — the word beside it was always the thing carrying the meaning, so nothing is lost and nothing is hidden.",
    example: "<ul data-rm-job-queue data-rm-label=\"Background jobs\">\n  <li data-rm-state=\"running\" data-rm-value=\"62\">Rebuild search index</li>\n  <li data-rm-state=\"running\">Reconcile Stripe payouts</li>\n  <li data-rm-state=\"failed\" data-rm-value=\"38\">Nightly CSV export</li>\n  <li data-rm-state=\"queued\">Recompute customer lifetime value</li>\n  <li data-rm-state=\"queued\">Warm the CDN cache</li>\n  <li data-rm-state=\"done\" data-rm-value=\"100\">Import supplier catalogue</li>\n</ul>",
    usage: "import { jobQueue } from \"@soyrageagency/rage-motion\";\njobQueue();",
    options: [
      option("label", "string", "\"Jobs\"", "data-rm-label: names the list of jobs."),
      option("duration", "number", "320", "data-rm-duration: milliseconds for the FLIP when a job changes state and moves."),
      option("onRetry", "(name, item) => void", "undefined", "Called with the job's name when its retry button is pressed."),
      option("state", "\"running\" | \"queued\" | \"failed\" | \"done\"", "\"queued\"", "data-rm-state on each job: where it has got to. It picks the word, the colour, whether the Retry button is shown, and the sort position — failures first, because a failed job is the only one anybody needs to act on."),
      option("value", "number", "none", "data-rm-value on each job: percent complete. Leave it off and the bar is marked indeterminate rather than claiming a figure — aria-valuenow is removed instead of being set to 0, because \"0% complete\" and \"we do not know\" are different statements."),
    ],
  },
  {
    name: "diffTable",
    category: "console",
    file: MOD_CONSOLE,
    attribute: "data-rm-diff-table",
    summary: "Before and after, with the kind of each change written into a real cell rather than carried by red and green.",
    notes:
      "Every diff view in existence uses red and green and nothing else, and every one of them is unreadable to the eight percent of men who cannot separate those two colours — in a table whose entire content is the difference between them. So each row gets a real cell saying Added, Removed, Changed or Unchanged, and the colour stays on as the second signal it should always have been. The old value is struck through visually and prefixed with a spoken \"was\", because `text-decoration: line-through` has no spoken equivalent at all: a struck price is simply read out as the price, which is worse than saying nothing. Unchanged rows sit behind a real toggle with `aria-pressed`, and when they appear the rows below FLIP into place rather than the table jumping four hundred pixels under the pointer. The component also inserts a matching `<th>` into the header, which the naive version forgets — one extra cell per body row and every column below the header is one place out.",
    example: "<table data-rm-diff-table>\n  <thead><tr><th scope=\"col\">Field</th><th scope=\"col\">Before</th><th scope=\"col\">After</th></tr></thead>\n  <tbody>\n    <tr data-rm-change=\"changed\"><td>Plan</td><td data-rm-before>Team</td><td>Business</td></tr>\n    <tr data-rm-change=\"changed\"><td>Seats</td><td data-rm-before>12</td><td>40</td></tr>\n    <tr data-rm-change=\"added\"><td>SSO domain</td><td></td><td>northwind.co</td></tr>\n    <tr data-rm-change=\"removed\"><td>Trial ends</td><td data-rm-before>2026-03-18</td><td></td></tr>\n    <tr data-rm-change=\"same\"><td>Billing email</td><td>billing@northwind.co</td><td>billing@northwind.co</td></tr>\n    <tr data-rm-change=\"same\"><td>Region</td><td>eu-west-1</td><td>eu-west-1</td></tr>\n  </tbody>\n</table>",
    usage: "import { diffTable } from \"@soyrageagency/rage-motion\";\ndiffTable();",
    options: [
      option("label", "string", "\"Changes\"", "data-rm-label: the table's accessible name."),
      option("duration", "number", "300", "data-rm-duration: milliseconds for the FLIP when unchanged rows appear or go."),
      option("showUnchanged", "boolean", "false", "data-rm-mode: \"all\" starts with the unchanged rows showing, \"changed\" with them folded away."),
      option("change", "\"added\" | \"removed\" | \"changed\" | \"same\"", "\"same\"", "data-rm-change on each `<tbody>` row: the kind of change, which becomes the word in the leading cell as well as the colour. An unrecognised value falls back to \"same\" for the count, the class and the word alike."),
      option("before", "string", "none", "data-rm-before on an element inside a changed row: marks the old value, which is struck through visually and prefixed with a spoken \"was\" — `line-through` has no spoken equivalent at all, so a struck price is otherwise simply read as the price."),
    ],
  },
  {
    name: "exportMenu",
    category: "console",
    file: MOD_CONSOLE,
    attribute: "data-rm-export-menu",
    summary: "A real menu of export formats, with arrow keys, type-ahead, and the work that follows announced.",
    notes:
      "`role=\"menu\"` over real `menuitem` buttons, with arrow keys, Home and End, first-letter type-ahead, Escape back to the trigger and a click anywhere else to dismiss. A `<div>` with a click handler has none of that, and an export control is exactly where somebody in a hurry reaches for the keyboard rather than the mouse. The more important half is what happens after the choice: exporting takes seconds, so the trigger is given `aria-busy`, the live region says \"Preparing the CSV export\", and `rmDone()` says when the file is ready — the usual version closes the menu and then nothing happens at all for four seconds, which is indistinguishable from a broken button and gets pressed three more times. The format buttons live in your markup rather than being generated, so with no JavaScript at all the page still shows a working list of export links, and the panel is positioned out of the flow so opening it never pushes the table it belongs to down the page.",
    example: "<div data-rm-export-menu data-rm-label=\"Export format\">\n  <button type=\"button\">Export</button>\n  <ul>\n    <li><button type=\"button\" data-rm-format=\"CSV\">CSV</button></li>\n    <li><button type=\"button\" data-rm-format=\"JSON\">JSON</button></li>\n    <li><button type=\"button\" data-rm-format=\"XLSX\">Excel workbook</button></li>\n    <li><button type=\"button\" data-rm-format=\"PDF\">PDF report</button></li>\n  </ul>\n</div>",
    usage: "import { exportMenu } from \"@soyrageagency/rage-motion\";\nexportMenu();",
    options: [
      option("label", "string", "\"Export\"", "data-rm-label: the menu's accessible name."),
      option("duration", "number", "200", "data-rm-duration: milliseconds for the menu to open and close."),
      option("onExport", "(format, item) => void", "undefined", "Called with the chosen format; call rmDone() when the file is ready."),
      option("format", "string", "the item's own text", "data-rm-format on each menu item: the identifier handed to onExport and spoken in \"Preparing the CSV export\". Without it the button's visible text is used, which ties your handler to your copy."),
    ],
  },

  // ── Media playback ──
  {
    name: "playerBar",
    category: "player",
    file: MOD_PLAYER,
    attribute: "data-rm-player-bar",
    summary: "A control bar over a real video, where every control is a real button.",
    notes:
      "The bar is a role=\"group\" of <button type=\"button\"> elements positioned over the video rather than beside it, so it costs no layout and the video never resizes when it appears or leaves. When the pointer goes still during playback the bar translates out of the frame and fades — it is never display:none and never visibility:hidden, because both of those take it out of the tab order and out of the accessibility tree, which is how nearly every hand-built player loses its controls for keyboard users the moment the mouse stops moving. Native controls are stood down rather than destroyed: the component remembers whether `controls` was set, offers a button that hands them straight back, and restores the original value on cleanup, so a player broken in a browser nobody tested is an inconvenience rather than an unwatchable video. The drawn clock is aria-hidden on purpose, because a time that updates four times a second inside a live region talks over the film; the scrubber's aria-valuetext is where the position is actually available. The caption belongs outside the mounting element: the bar is appended to it as its last child and positioned against its box, so a <figcaption> in there would both break the content model and put the caption underneath the controls. Under reduced motion the bar never retreats at all.",
    example: "<figure data-rm-player-bar data-rm-skip=\"10\" data-rm-idle=\"2600\" data-rm-label=\"Kiln opening\">\n  <video id=\"kiln\" src=\"/film/kiln-opening.mp4\" poster=\"/film/kiln-opening.jpg\" preload=\"metadata\" controls playsinline>\n    <track kind=\"captions\" srclang=\"en\" label=\"English\" src=\"/film/kiln-opening.en.vtt\" default>\n  </video>\n</figure>\n<p class=\"film-caption\">Opening the kiln after a thirty-hour firing.</p>",
    usage: "import { playerBar } from \"@soyrageagency/rage-motion\";\nplayerBar();",
    options: [
      option("for", "string", "\"\"", "data-rm-for: the id of the media element to drive. Omitted, it uses the <video> or <audio> inside, then the nearest one above."),
      option("skip", "number", "10", "data-rm-skip: how many seconds the back and forward buttons move, and what their accessible names say."),
      option("idle", "number", "2600", "data-rm-idle: milliseconds of stillness before the bar retreats. 0 keeps it out permanently."),
      option("label", "string", "\"Video player\"", "data-rm-label: names the control group, so it is announced as something rather than as a row of buttons."),
    ],
  },
  {
    name: "scrubber",
    category: "player",
    file: MOD_PLAYER,
    attribute: "data-rm-scrubber",
    summary: "A real seek slider that announces a time rather than a percentage.",
    notes:
      "The control is an <input type=\"range\"> whose unit is seconds, so one arrow press is a seek of a known size, Home and End reach both ends, and the browser's own touch target, focus ring and pointer handling all come free. aria-valuetext is rewritten on every change to \"3 minutes 42 seconds of 8 minutes 10 seconds\" — the default announcement for a range is a bare number, and a bare number is not a place in a film, which is the single most common accessibility failure in this entire category. The input's own step is \"any\" and the coarse arrow increment is done by hand, because a range snaps every value written to it onto min + n*step — a five-second step would quietly store a currentTime of 12.4s as 10, so the accent fill would glide while the native thumb hopped beside it and aria-valuetext would announce a time the player is not at. The slider is only written to from the media when nobody is dragging it: without that guard, timeupdate fights the pointer and the thumb snaps backwards mid-drag. The played and buffered stretches are scaleX on elements already at full width, driven by custom properties updated on the shared frame loop and only while the slider is on screen, so a video playing in a scrolled-away section repaints nothing. The hover preview appears on focus as well, because a keyboard seek deserves to show where it landed and not only say it.",
    example: "<video id=\"kiln\" src=\"/film/kiln-opening.mp4\" poster=\"/film/kiln-opening.jpg\" controls playsinline></video>\n<div data-rm-scrubber data-rm-for=\"kiln\" data-rm-step=\"5\" data-rm-label=\"Seek through the film\"></div>",
    usage: "import { scrubber } from \"@soyrageagency/rage-motion\";\nscrubber();",
    options: [
      option("for", "string", "\"\"", "data-rm-for: the id of the media element. Otherwise the nearest one containing this control."),
      option("step", "number", "5", "data-rm-step: seconds moved by one arrow press. It is not the input's step, which stays at \"any\" so that no programmatic write is rounded onto a grid."),
      option("label", "string", "\"Seek\"", "data-rm-label: the slider's accessible name."),
    ],
  },
  {
    name: "waveform",
    category: "player",
    file: MOD_PLAYER,
    attribute: "data-rm-waveform",
    summary: "An audio waveform drawn from peaks in the markup, so it costs nothing.",
    notes:
      "The usual implementation fetches the audio file a second time, decodes it with the Web Audio API on the main thread and then draws it — which downloads megabytes nobody asked for, blocks the thread for the length of the decode, and cannot start until the whole file has arrived. Peaks are cheap to produce once at build time and they are a hundred numbers, so they live in a data attribute and this component only draws. Each bar is a full-height element scaled with scaleY from its own base, so a hundred bars are a hundred composited transforms and not a hundred height changes, and the played copy is the same row again clipped with clip-path. It is role=\"img\" with a written label rather than a live region: a waveform that announced itself four times a second would make the track unlistenable for exactly the people it was meant to help. With no usable peaks it draws a flat rail rather than nothing, which is honest about carrying no detail.",
    example: "<audio id=\"talk\" src=\"/audio/wedging-the-clay.mp3\" controls preload=\"metadata\"></audio>\n<div data-rm-waveform data-rm-for=\"talk\" data-rm-amp=\"1.1\"\n     data-rm-label=\"Waveform of Wedging the clay\"\n     data-rm-peaks=\"6,14,31,58,72,64,40,22,35,61,88,94,70,44,26,18,30,52,77,91,83,58,33,19,12,28,47,69,85,96,74,50,29,16,9,21,44,66,81,72,55,34,20,11,7,15,27,41\"></div>",
    usage: "import { waveform } from \"@soyrageagency/rage-motion\";\nwaveform();",
    options: [
      option("for", "string", "\"\"", "data-rm-for: the id of the media element whose progress clips the played copy."),
      option("peaks", "string", "\"\"", "data-rm-peaks: comma or space separated amplitudes. Any scale works; they are normalised against the loudest."),
      option("amp", "number", "1", "data-rm-amp: multiplies every bar, clamped to 0.2–2, for a quiet recording that would otherwise draw as a line."),
      option("label", "string", "\"Audio waveform\"", "data-rm-label: the accessible name of the image."),
    ],
  },
  {
    name: "chapterList",
    category: "player",
    file: MOD_PLAYER,
    attribute: "data-rm-chapter-list",
    summary: "A chapter list of real buttons that seek, with the current one marked.",
    notes:
      "Each row becomes a <button type=\"button\"> wrapped around the text that was already in the markup, so the list is a readable table of contents with no script and an operable one with it — and the original nodes, their markup and their language attributes all survive the wrapping and are put back on cleanup. The current chapter carries aria-current=\"true\", which is what actually tells somebody where they are; a background colour on its own tells nobody. The moving marker is a single absolutely positioned one-pixel box translated to the row and scaled to its height, because animating height between rows relayouts the whole list on every frame while a translate and a scale move nothing at all. Each button's accessible name includes the start time in words — \"Wedging, starts at 1 minute 36 seconds\" — since a timestamp rendered as 1:36 is read out as two unrelated numbers — and it is added in a visually hidden span inside the button rather than as an aria-label, because a label replaces the computed name outright and would throw away the emphasis, abbreviations and lang attributes the wrapping was performed to keep. Chapters are sorted by their start time rather than trusted to be in document order.",
    example: "<video id=\"kiln\" src=\"/film/kiln-opening.mp4\" poster=\"/film/kiln-opening.jpg\" controls playsinline></video>\n<ol data-rm-chapter-list data-rm-for=\"kiln\" data-rm-label=\"Chapters\">\n  <li data-rm-at=\"0\">Digging the clay</li>\n  <li data-rm-at=\"96\">Wedging</li>\n  <li data-rm-at=\"245\">Throwing the beaker</li>\n  <li data-rm-at=\"512\">Trimming the foot</li>\n  <li data-rm-at=\"734\">Loading the kiln</li>\n  <li data-rm-at=\"1018\">Opening, thirty hours later</li>\n</ol>",
    usage: "import { chapterList } from \"@soyrageagency/rage-motion\";\nchapterList();",
    options: [
      option("for", "string", "\"\"", "data-rm-for: the id of the media element the chapters seek."),
      option("at", "number", "0", "data-rm-at on each row: the chapter's start, in seconds. A row without it is left alone entirely."),
      option("label", "string", "\"Chapters\"", "data-rm-label: names the list."),
    ],
  },
  {
    name: "captionToggle",
    category: "player",
    file: MOD_PLAYER,
    attribute: "data-rm-caption-toggle",
    summary: "A captions button that keeps one name and carries aria-pressed.",
    notes:
      "Captions are a state, not an action, so the button is always called \"Captions\" and the state lives in aria-pressed. The common version flips its label between \"Show captions\" and \"Hide captions\", which renames the control the instant you use it: voice control users lose the phrase they just said, and anybody re-reading the button hears a different one. It drives textTrack.mode on the real <track> rather than painting its own subtitles, so the browser's caption styling and the operating system's caption preferences keep working, and turning one track on quietly disables the others because two showing tracks stack on top of each other. When the media carries no caption track the button is hidden outright — a toggle that cannot do anything is worse than no toggle — and the stylesheet carries the matching [hidden] rule, since the class's own display would otherwise beat the user agent's. An unrecognised data-rm-track falls back to the first caption track instead of to nothing.",
    example: "<video id=\"kiln\" src=\"/film/kiln-opening.mp4\" poster=\"/film/kiln-opening.jpg\" controls playsinline>\n  <track kind=\"captions\" srclang=\"en\" label=\"English\" src=\"/film/kiln-opening.en.vtt\" default>\n  <track kind=\"captions\" srclang=\"es\" label=\"Español\" src=\"/film/kiln-opening.es.vtt\">\n</video>\n<button data-rm-caption-toggle data-rm-for=\"kiln\" data-rm-track=\"es\">Subtítulos</button>",
    usage: "import { captionToggle } from \"@soyrageagency/rage-motion\";\ncaptionToggle();",
    options: [
      option("for", "string", "\"\"", "data-rm-for: the id of the media element whose tracks it drives."),
      option("track", "string", "\"\"", "data-rm-track: a language code or track label to pick. Unknown values fall back to the first caption track."),
      option("label", "string", "\"Captions\"", "data-rm-label: the button's steady name, used when the markup left it empty."),
    ],
  },
  {
    name: "rateMenu",
    category: "player",
    file: MOD_PLAYER,
    attribute: "data-rm-rate-menu",
    summary: "Playback speed as a real menu, with real focus management.",
    notes:
      "The list is a role=\"menu\" of role=\"menuitemradio\" buttons sharing one roving tabindex, so Tab enters and leaves the menu once rather than walking through six separate speeds, and the arrow keys, Home and End move between them the way every desktop menu has behaved for thirty years. Escape closes it and puts focus back on the button that opened it, not on the body — which is where a closing menu usually drops focus, leaving the next Tab starting again from the top of the page. The panel is hidden when closed and the stylesheet carries the explicit .rm-rate-menu-list[hidden] rule, because the class sets display:grid and an author display outranks the user agent's rule for [hidden]; without it the menu is invisible, still laid out and still swallowing the clicks meant for the play button underneath. The button's accessible name states the current rate in words rather than relying on the \"1.5×\" glyph, which is read as \"one point five times\" only if you are lucky. It listens for ratechange as well as its own clicks, so a rate set from anywhere else stays truthful.",
    example: "<audio id=\"talk\" src=\"/audio/wedging-the-clay.mp3\" controls preload=\"metadata\"></audio>\n<div data-rm-rate-menu data-rm-for=\"talk\" data-rm-rates=\"0.75,1,1.25,1.5,2\" data-rm-label=\"Playback speed\"></div>",
    usage: "import { rateMenu } from \"@soyrageagency/rage-motion\";\nrateMenu();",
    options: [
      option("for", "string", "\"\"", "data-rm-for: the id of the media element whose playbackRate it sets."),
      option("rates", "string", "\"0.5,0.75,1,1.25,1.5,2\"", "data-rm-rates: the speeds offered. Anything unparseable is dropped; an empty result falls back to a single 1×."),
      option("label", "string", "\"Playback speed\"", "data-rm-label: names the menu and forms the button's spoken name."),
    ],
  },
  {
    name: "volumeDial",
    category: "player",
    file: MOD_PLAYER,
    attribute: "data-rm-volume-dial",
    summary: "A volume ring you can read, with a real slider as the actual control.",
    notes:
      "A knob you turn by dragging in a circle is unusable from a keyboard, has no value to announce and cannot be reached by voice, so here the ring is aria-hidden decoration driven by one custom property and the real control beneath it is the browser's own <input type=\"range\">. aria-valuetext reads \"Volume 40 percent\", or simply \"Muted\", which is the one case where a percentage is the right unit and a time would be nonsense. Muting is a separate button with aria-pressed rather than a volume of zero, because they are genuinely different states: unmuting has to return to the level you had, and a slider dragged to zero has forgotten it. Moving the slider upward unmutes, since that is unambiguously a statement that you want to hear something. Cleanup restores both the volume and the muted flag exactly as it found them.",
    example: "<audio id=\"talk\" src=\"/audio/wedging-the-clay.mp3\" controls preload=\"metadata\"></audio>\n<div data-rm-volume-dial data-rm-for=\"talk\" data-rm-volume=\"70\" data-rm-label=\"Volume\"></div>",
    usage: "import { volumeDial } from \"@soyrageagency/rage-motion\";\nvolumeDial();",
    options: [
      option("for", "string", "\"\"", "data-rm-for: the id of the media element."),
      option("volume", "number", "100", "data-rm-volume: the starting level, 0–100, applied on mount and undone on cleanup."),
      option("label", "string", "\"Volume\"", "data-rm-label: the slider's accessible name and the word used in its spoken value."),
    ],
  },
  {
    name: "pipToggle",
    category: "player",
    file: MOD_PLAYER,
    attribute: "data-rm-pip-toggle",
    summary: "A picture-in-picture button that is honest about not being available.",
    notes:
      "Three things must be true before this button means anything: the document allows picture-in-picture, the element is a <video> rather than an <audio>, and that video has not opted out with disablePictureInPicture. When any of them is false the button is hidden rather than disabled, because a disabled control is still announced and a control announced as permanently unavailable is pure noise — and the stylesheet carries the [hidden] rule to match the class's own display. State comes from the enterpictureinpicture and leavepictureinpicture events rather than from what the button thinks it did, because the floating window can be closed from the operating system's own chrome, at which point a button tracking its own clicks is immediately lying. The label ships in the markup and data-rm-label overrides it rather than supplies it, because a button whose text only arrives with the script is a nameless empty box until then — and a control announced as something other than the word printed on it costs voice control the phrase on screen. The request returns a promise a browser is entitled to reject, so the rejection is caught and said out loud in a polite live region instead of landing in the console as an unhandled error.",
    example: "<video id=\"kiln\" src=\"/film/kiln-opening.mp4\" poster=\"/film/kiln-opening.jpg\" controls playsinline></video>\n<button data-rm-pip-toggle data-rm-for=\"kiln\">Float this video</button>",
    usage: "import { pipToggle } from \"@soyrageagency/rage-motion\";\npipToggle();",
    options: [
      option("for", "string", "\"\"", "data-rm-for: the id of the <video> to float."),
      option("label", "string", "\"Picture in picture\"", "data-rm-label: overrides the button's own text as its name. Left off, the markup's text is the name; an empty button falls back to \"Picture in picture\"."),
    ],
  },
  {
    name: "queueList",
    category: "player",
    file: MOD_PLAYER,
    attribute: "data-rm-queue-list",
    summary: "A play queue that reorders from the pointer and from the keyboard alike.",
    notes:
      "Drag and drop that only works with a pointer is a feature half the audience does not have, so the handle is a real button and the arrow keys move the row immediately while it is focused — no grab mode to remember, no modifier to discover, nothing to be told about. Each move is announced as \"Moved Wedging the clay to 2 of 5\", because the only feedback a pointer drag gives is visual, and a keyboard reorder with no announcement is a list that silently rearranges itself. The rows that shift do so with a FLIP: the DOM order changes first, then every displaced row is animated from where it used to be back to zero with one transform, so nothing animates a height and nothing is taken out of flow. Focus follows the handle across the move, which is the part everybody forgets — the node survives a DOM move but the browser drops focus to the body, so the next arrow press goes nowhere. The live region is inserted after the list rather than inside it, since a <p> is not a valid child of <ol> and an invalid child is one some screen readers drop from the list altogether.",
    example: "<ol data-rm-queue-list data-rm-label=\"Play queue\" data-rm-duration=\"260\">\n  <li>Digging the clay — 4:12</li>\n  <li>Wedging — 2:48</li>\n  <li>Throwing the beaker — 7:31</li>\n  <li>Trimming the foot — 3:55</li>\n  <li>Loading the kiln — 5:02</li>\n</ol>",
    usage: "import { queueList } from \"@soyrageagency/rage-motion\";\nqueueList();",
    options: [
      option("label", "string", "\"Play queue\"", "data-rm-label: names the list, so it is announced as a queue rather than as five list items."),
      option("duration", "number", "260", "data-rm-duration: the FLIP each displaced row plays, in milliseconds. Clamped to a minimum of 80."),
    ],
  },
  {
    name: "nowPlaying",
    category: "player",
    file: MOD_PLAYER,
    attribute: "data-rm-now-playing",
    summary: "Title and artist, scrolling only when they genuinely do not fit.",
    notes:
      "A marquee that runs on every track is a decoration; one that runs only when the text overflows is a solution. A ResizeObserver compares the title's own scroll width against its box and adds the scrolling class only when it must, so a short title sits perfectly still, and a real pause button with aria-pressed appears beside a title that does drift: hover is nothing to a keyboard and :focus-within never matches a card holding a cover, a heading and a line of text, so a marquee whose only stop is a CSS pseudo-class is a movement of well over five seconds that half the audience cannot turn off. The travel is a translateX of a measured distance held in a custom property, never an animated margin or left, and the duration is derived from that distance so a long title and a short one move at the same speed rather than taking the same time. The markup carries the real heading and the real artist, so the block reads correctly with no script at all; rmSet only rewrites what is already there. A track change is announced once, politely, as a whole sentence — \"Now playing: Wedging the clay, by Marta Ruiz\" — rather than by wrapping the title in a live region that would then re-announce on every resize.",
    example: "<div data-rm-now-playing data-rm-speed=\"40\" data-rm-label=\"Now playing\">\n  <img src=\"/covers/wedging-the-clay.jpg\" alt=\"Cover art: hands folding grey clay on a plaster bench\">\n  <h3>Wedging the clay, and why most people do it backwards</h3>\n  <p>Marta Ruiz</p>\n</div>",
    usage: "import { nowPlaying } from \"@soyrageagency/rage-motion\";\nnowPlaying();",
    options: [
      option("speed", "number", "40", "data-rm-speed: pixels per second of drift, used to derive the duration so long and short titles move alike."),
      option("label", "string", "\"Now playing\"", "data-rm-label: names the group."),
    ],
  },
  {
    name: "transcriptSync",
    category: "player",
    file: MOD_PLAYER,
    attribute: "data-rm-transcript-sync",
    summary: "A transcript whose current line is marked, and where every line seeks.",
    notes:
      "Each line becomes a real button and carries aria-current=\"location\" while it is the one being spoken, so the position is in the accessibility tree rather than only in a highlight colour — and clicking any line seeks to it, which turns a wall of text into the fastest navigation a long recording has. The part that is usually wrong is the auto-scroll: a transcript that always scrolls to the current line fights anybody trying to read ahead, and the fight is unwinnable because the page wins every second. So following is a real toggle with aria-pressed, and any scroll the visitor makes themselves switches it off and says so, compared against the position this component last set rather than against a timer. It scrolls only this box, using keepInView rather than scrollIntoView, because scrollIntoView walks up and scrolls every scrollable ancestor including the page — which is how a transcript in a sidebar throws the whole document around every few seconds. The \"Play from 7 seconds\" part of each button's name is a visually hidden span inside it rather than an aria-label over it: a label would flatten the line into one string and lose its inline markup and its lang attributes, so a Spanish phrase inside an English transcript would come back read in English. Lines are sorted by their timestamp rather than trusted to be in document order.",
    example: "<audio id=\"talk\" src=\"/audio/wedging-the-clay.mp3\" controls preload=\"metadata\"></audio>\n<div data-rm-transcript-sync data-rm-for=\"talk\" data-rm-stick=\"true\" data-rm-label=\"Transcript\">\n  <p data-rm-at=\"0\">We start at the clay pit, which is four fields behind the workshop.</p>\n  <p data-rm-at=\"7.5\">It has to be wedged before anything else happens to it.</p>\n  <p data-rm-at=\"15.2\">Most people wedge to mix. You wedge to get the air out.</p>\n  <p data-rm-at=\"24.8\">A single bubble will take the pot apart in the kiln.</p>\n  <p data-rm-at=\"33.1\">Sixty turns, and then you stop, because over-wedging stiffens it.</p>\n</div>",
    usage: "import { transcriptSync } from \"@soyrageagency/rage-motion\";\ntranscriptSync();",
    options: [
      option("for", "string", "\"\"", "data-rm-for: the id of the media element the lines seek."),
      option("at", "number", "0", "data-rm-at on each line: when it is spoken, in seconds. Decimals are kept."),
      option("stick", "boolean", "true", "data-rm-stick=\"false\" starts with following switched off, for a transcript meant to be read rather than followed."),
      option("label", "string", "\"Transcript\"", "data-rm-label: names the region."),
    ],
  },
  {
    name: "thumbStrip",
    category: "player",
    file: MOD_PLAYER,
    attribute: "data-rm-thumb-strip",
    summary: "A strip of preview frames that seek, and that scroll only themselves.",
    notes:
      "Each thumbnail is a real button carrying its own timestamp in its accessible name, so the strip is navigable from the keyboard in the same order it reads on screen. There is deliberately no roving tabindex here: these are independent destinations rather than one composite control, so swallowing Tab would make the strip harder to use rather than easier. The photograph's alt text is moved onto the button and the image is then marked aria-hidden, because leaving both means every frame is announced twice — and cleanup puts back the exact alt that shipped, captured before it was blanked rather than reconstructed from the label afterwards — which would cut \"The kiln door — open on finished pots\" at the dash and hand an image the author deliberately marked decorative some alt text this kit invented. The active frame is brought into view with keepInView, which does the arithmetic on this one scroller; scrollIntoView walks up and scrolls every scrollable ancestor including the page, so a strip that highlights its first frame on mount throws the whole document down to wherever the strip happens to be. The hover and focus lift is a scale, so neighbouring frames never move and nothing is ever clicked by accident.",
    example: "<video id=\"kiln\" src=\"/film/kiln-opening.mp4\" poster=\"/film/kiln-opening.jpg\" controls playsinline></video>\n<ol data-rm-thumb-strip data-rm-for=\"kiln\" data-rm-label=\"Preview frames\">\n  <li data-rm-at=\"0\"><img src=\"/film/kiln-000.jpg\" alt=\"The clay pit at dawn\"></li>\n  <li data-rm-at=\"96\"><img src=\"/film/kiln-096.jpg\" alt=\"Hands folding clay on a plaster bench\"></li>\n  <li data-rm-at=\"245\"><img src=\"/film/kiln-245.jpg\" alt=\"A beaker rising on the wheel\"></li>\n  <li data-rm-at=\"512\"><img src=\"/film/kiln-512.jpg\" alt=\"A trimming tool cutting the foot ring\"></li>\n  <li data-rm-at=\"734\"><img src=\"/film/kiln-734.jpg\" alt=\"Shelves being stacked inside the kiln\"></li>\n  <li data-rm-at=\"1018\"><img src=\"/film/kiln-1018.jpg\" alt=\"The kiln door open on finished pots\"></li>\n</ol>",
    usage: "import { thumbStrip } from \"@soyrageagency/rage-motion\";\nthumbStrip();",
    options: [
      option("for", "string", "\"\"", "data-rm-for: the id of the media element the frames seek."),
      option("at", "number", "0", "data-rm-at on each frame: the moment it shows, in seconds. A row without it is left alone."),
      option("label", "string", "\"Preview frames\"", "data-rm-label: names the strip."),
    ],
  },
  {
    name: "liveBadge",
    category: "player",
    file: MOD_PLAYER,
    attribute: "data-rm-live-badge",
    summary: "Live, or how far behind live, with a real button back to the edge.",
    notes:
      "\"LIVE\" in red is a claim, and on a stream somebody paused twenty minutes ago it is a false one — so this compares the current position against the end of the seekable range and switches between two honest states: at the edge it says live, and behind it says how far behind, in words, and reveals a real button that jumps forward. The pulsing dot is decoration and the word beside it is the message, because a status carried only by a colour reaches only part of the audience, and a red dot means nothing at all to somebody who cannot see it. The badge is drawn text and not a live region. Behind live its words are a distance that changes about once a second, and a polite region wrapped round them re-announces every value: somebody who paused three minutes ago would hear \"3 minutes 21 seconds behind\", then 22, then 23, for the rest of the broadcast. So only the two crossings — fallen behind, back at the edge — are spoken, from a region of the component's own, and whatever role or aria-live the markup already carried is left untouched. It updates from timeupdate rather than from the frame loop on purpose: the distance behind live changes by a second at a time, so four samples a second is already more than the number can use and a per-frame recalculation would be battery spent on nothing. A duration of Infinity — which is what a genuinely unbounded stream reports — is treated as live rather than as a broken number, which is where the naive arithmetic produces NaN and renders an empty badge.",
    example: "<video id=\"stream\" src=\"/live/workshop.m3u8\" poster=\"/live/workshop.jpg\" controls playsinline></video>\n<p data-rm-live-badge data-rm-for=\"stream\" data-rm-behind=\"10\" data-rm-label=\"Live\"></p>",
    usage: "import { liveBadge } from \"@soyrageagency/rage-motion\";\nliveBadge();",
    options: [
      option("for", "string", "\"\"", "data-rm-for: the id of the streaming media element."),
      option("behind", "number", "8", "data-rm-behind: seconds of slack still counted as live, since a stream is never exactly at its own edge."),
      option("label", "string", "\"Live\"", "data-rm-label: the word shown while at the edge."),
    ],
  },
  {
    name: "bufferRing",
    category: "player",
    file: MOD_PLAYER,
    attribute: "data-rm-buffer-ring",
    summary: "A buffering ring that waits before it appears, so short stalls never flash.",
    notes:
      "A waiting event fires for a stall of forty milliseconds as readily as for one of four seconds, and a spinner that flashes on every one of them makes a perfectly healthy stream look broken. So there is a delay: the ring only appears if the stall outlives it, which removes almost every flash without losing a single real wait. \"Buffering\" is said once, politely, from a live region that sits outside the ring — a live region inside a hidden element is never rendered and so is never spoken, which is the quiet way this announcement fails, while re-announcing on every progress event is the loud way. The ring itself is aria-hidden, spins from a CSS animation rather than a script, and the arc showing how much is buffered ahead is a stroke-dashoffset on a circle with pathLength=\"100\", so the dash values are read as percentages and the arithmetic does not depend on the radius. It is hidden with the hidden property and the stylesheet carries the matching .rm-buffer-ring[hidden] rule, because the class sets display:grid and would otherwise keep the ring laid out and clickable while invisible. Inside a player frame it is taken out of the flow and centred with inset:0 and margin:auto, because a 3rem block appearing and disappearing in normal flow grows and shrinks the figure on every stall and reflows the page beneath it — a buffering indicator that resizes the article is worse than none. Under reduced motion it does not spin, and the word — which was carrying the meaning anyway — stays.",
    example: "<figure data-rm-player-bar>\n  <video id=\"stream\" src=\"/live/workshop.m3u8\" poster=\"/live/workshop.jpg\" controls playsinline></video>\n  <div data-rm-buffer-ring data-rm-for=\"stream\" data-rm-delay=\"320\" data-rm-label=\"Buffering\"></div>\n</figure>",
    usage: "import { bufferRing } from \"@soyrageagency/rage-motion\";\nbufferRing();",
    options: [
      option("for", "string", "\"\"", "data-rm-for: the id of the media element to watch."),
      option("delay", "number", "320", "data-rm-delay: milliseconds a stall must outlive before the ring appears. 0 shows it immediately."),
      option("label", "string", "\"Buffering\"", "data-rm-label: the announced word, read but never drawn."),
    ],
  },
  {
    name: "miniPlayer",
    category: "player",
    file: MOD_PLAYER,
    attribute: "data-rm-mini-player",
    summary: "A docked player that appears when the real one scrolls away, and can be got rid of.",
    notes:
      "It appears when the real player leaves the viewport and something is playing, slides in on a transform, and goes away again when the player comes back — an IntersectionObserver on the media element itself, so no scroll listener is involved and nothing is measured on the main thread. It is a role=\"region\" with a name, its arrival is announced politely once, and a real close button dismisses it, after which it stays away until the main player has been seen again: a dock that returns thirty seconds after you dismissed it is a dock nobody can get rid of, and that alone is why people install blockers. It is deliberately not a dialog and deliberately not modal — the page behind it is still readable and still operable, so sealing it with inert or cycling Tab inside it would take a convenience and turn it into a cage. The only focus it ever moves is its own: closing it while focus is inside hands focus to the main media element rather than dropping it on the body, and the temporary tabindex that makes that possible is removed on cleanup. An unrecognised corner falls back to bottom-right rather than producing an unpositioned box.",
    example: "<video id=\"kiln\" src=\"/film/kiln-opening.mp4\" poster=\"/film/kiln-opening.jpg\" controls playsinline></video>\n<aside data-rm-mini-player data-rm-for=\"kiln\" data-rm-corner=\"bottom-right\" data-rm-label=\"Mini player\">\n  <p>Kiln opening — Marta Ruiz</p>\n</aside>",
    usage: "import { miniPlayer } from \"@soyrageagency/rage-motion\";\nminiPlayer();",
    options: [
      option("for", "string", "\"\"", "data-rm-for: the id of the media element it docks for."),
      option("corner", "top-left | top-right | bottom-left | bottom-right", "\"bottom-right\"", "data-rm-corner: where it docks, and which direction it arrives from. Anything else falls back to bottom-right."),
      option("label", "string", "\"Mini player\"", "data-rm-label: the region's name, and the phrase used when it docks and when it is dismissed."),
    ],
  },
  {
    name: "keyboardHints",
    category: "player",
    file: MOD_PLAYER,
    attribute: "data-rm-keyboard-hints",
    summary: "The player's keyboard shortcuts, listed and implemented.",
    notes:
      "A player with keyboard shortcuts nobody has been told about is a player with no keyboard shortcuts, so this is both halves: a <dl> listing every key, and the handler that implements them. The panel opens from a real button and from the ? key, and it is a non-modal role=\"dialog\" — Escape closes it and focus returns to the button, but nothing is made inert and nothing traps Tab, because a help panel is the last thing on a page that should be able to lock somebody out of it. The important half is what the handler refuses to do: it ignores every key while focus is in a text field, a <select> or anything contenteditable, so typing \"l\" into a comment box does not skip the film forward, and it leaves Space alone whenever focus is on a button or a link, whose own activation key that is. Keys are only handled while focus is somewhere inside the player's own region, because a document-wide listener stealing the arrow keys is how one embedded video breaks scrolling for an entire article — and that includes ? and Escape, which are the two branches usually hoisted above the guard, where they take both keys from the whole page, open every player's panel at once and drag the reader's focus onto the hints button from wherever they actually were. The panel sets a display, so the stylesheet carries the explicit [hidden] rule that keeps a closed panel from covering the controls it is describing.",
    example: "<figure data-rm-player-bar>\n  <video id=\"kiln\" src=\"/film/kiln-opening.mp4\" poster=\"/film/kiln-opening.jpg\" controls playsinline>\n    <track kind=\"captions\" srclang=\"en\" label=\"English\" src=\"/film/kiln-opening.en.vtt\" default>\n  </video>\n</figure>\n<div data-rm-keyboard-hints data-rm-for=\"kiln\" data-rm-skip=\"5\" data-rm-jump=\"10\" data-rm-label=\"Keyboard shortcuts\"></div>",
    usage: "import { keyboardHints } from \"@soyrageagency/rage-motion\";\nkeyboardHints();",
    options: [
      option("for", "string", "\"\"", "data-rm-for: the id of the media element the shortcuts drive."),
      option("skip", "number", "5", "data-rm-skip: seconds moved by the left and right arrows, and the figure printed in the list."),
      option("jump", "number", "10", "data-rm-jump: seconds moved by J and L, the larger of the two seeks."),
      option("label", "string", "\"Keyboard shortcuts\"", "data-rm-label: the button's text and the panel's accessible name."),
    ],
  },

  // ── Galleries, the twenty ─────────────────────────────────────────────────
  {
    name: "masonry",
    category: "gallery",
    file: GALLERIES,
    attribute: "data-rm-masonry",
    summary: "A column grid that settles with a FLIP when it reflows.",
    notes:
      "Balanced by height rather than dealt round-robin, so the columns end level instead of one running long — trivial arithmetic, and the whole difference between a masonry that looks composed and one that looks like a bug. When the column count changes, every tile that moves plays a FLIP from where it was, so a resize reads as a rearrangement rather than a jump cut.",
    example: "<div data-rm-masonry data-rm-columns=\"3\">…</div>",
    usage: "import { masonry } from \"@soyrageagency/rage-motion\";\nmasonry();",
    options: [
      option("columns", "number", "3", "The most columns it will use."),
      option("min", "number", "220", "Narrowest a column may get before dropping one."),
      option("gap", "number", "14", "Space between tiles, in pixels."),
    ],
  },
  {
    name: "swipeStack",
    category: "gallery",
    file: GALLERIES,
    attribute: "data-rm-swipe-stack",
    summary: "A pile you throw away, by hand or by keyboard.",
    notes:
      "The card follows the hand while it is held and leaves in the direction it was travelling, so the throw is the gesture rather than a canned animation played after one. Left and right arrows do the same thing, and a live region announces what is on top — a stack you can only operate by dragging is a stack half your visitors cannot use.",
    example: "<div data-rm-swipe-stack><article>…</article></div>",
    usage: "import { swipeStack } from \"@soyrageagency/rage-motion\";\nswipeStack();",
    options: [
      option("throwAt", "number", "110", "How far a drag must go to count as a throw."),
      option("lift", "number", "12", "Offset between the cards in the pile."),
    ],
  },
  {
    name: "filmstrip",
    category: "gallery",
    file: GALLERIES,
    attribute: "data-rm-filmstrip",
    summary: "A strip with sprocket holes and real inertia.",
    notes:
      "Native scrolling underneath, so it keeps momentum, snapping, the trackpad, the scrollbar and every affordance the platform provides, with a drag added on top for the mouse. The sprocket holes are one repeating gradient rather than two hundred elements.",
    example: "<div data-rm-filmstrip><img src=\"/plate-01.jpg\" alt=\"Plate one\">…</div>",
    usage: "import { filmstrip } from \"@soyrageagency/rage-motion\";\nfilmstrip();",
    options: [
      option("label", "string", "\"Film strip\"", "The region's accessible name."),
    ],
  },
  {
    name: "hoverPeek",
    category: "gallery",
    file: GALLERIES,
    attribute: "data-rm-hover-peek",
    summary: "A list of titles that floats its picture by the pointer.",
    notes:
      "One shared image element with the source swapped as you move, rather than one per row — a hundred-row index costs one node and one decode at a time. The picture lags the pointer, which is what makes it feel attached rather than teleported, and focus shows it too, pinned beside the focused row instead of at a pointer that is not there.",
    example: "<ul data-rm-hover-peek><li data-rm-peek-src=\"/a.jpg\">Title</li></ul>",
    usage: "import { hoverPeek } from \"@soyrageagency/rage-motion\";\nhoverPeek();",
    options: [
      option("attribute", "string", "\"data-rm-peek-src\"", "Where each row's picture is named."),
      option("ease", "number", "0.16", "How closely the picture follows."),
    ],
  },
  {
    name: "polaroids",
    category: "gallery",
    file: GALLERIES,
    attribute: "data-rm-polaroids",
    summary: "Scattered prints that straighten when you reach them.",
    notes:
      "The scatter is seeded from each print's position in the set rather than random, so the wall is the same on every load — a gallery that reshuffles itself on reload draws attention to its own cleverness. Reaching one lifts it, squares it up and brings it to the front, by pointer or by keyboard.",
    example: "<div data-rm-polaroids><figure>…</figure></div>",
    usage: "import { polaroids } from \"@soyrageagency/rage-motion\";\npolaroids();",
    options: [
      option("spread", "number", "7", "Most degrees of scatter."),
      option("shift", "number", "10", "Most pixels of vertical drift."),
    ],
  },
  {
    name: "foldGallery",
    category: "gallery",
    file: GALLERIES,
    attribute: "data-rm-fold",
    summary: "Panels that open sideways, one at a time.",
    notes:
      "The widths are flex-grow on a flex row, so the browser distributes the space and the panels always exactly fill the strip however many there are. The version that sets percentage widths has to be told the count and is one rounding error from a gap at the end. Focus opens a panel just as hovering does.",
    example: "<div data-rm-fold><figure>…</figure></div>",
    usage: "import { foldGallery } from \"@soyrageagency/rage-motion\";\nfoldGallery();",
    options: [
      option("open", "number", "3", "How many times its share an open panel takes."),
    ],
  },
  {
    name: "gridZoom",
    category: "gallery",
    file: GALLERIES,
    attribute: "data-rm-grid-zoom",
    summary: "A tile that grows to fill the grid, and comes back.",
    notes:
      "A FLIP in both directions: the tile is promoted, the layout settles at the new size, and only then is it animated from where it was. Nothing animates a width, so the grid never reflows mid-flight and the picture never squashes. Escape closes it and focus goes back to the tile that opened.",
    example: "<div data-rm-grid-zoom><button><img src=\"/plate-01.jpg\" alt=\"Plate one\"></button></div>",
    usage: "import { gridZoom } from \"@soyrageagency/rage-motion\";\ngridZoom();",
    options: [
      option("duration", "number", "480", "How long the growth takes."),
    ],
  },
  {
    name: "crossfade",
    category: "gallery",
    file: GALLERIES,
    attribute: "data-rm-crossfade",
    summary: "A slideshow that is really a tablist.",
    notes:
      "The frames cross-fade on opacity and the dots are real tabs — arrow keys, Home and End, aria-selected, one tab stop for the set. A slideshow whose controls are anonymous divs is a slideshow a keyboard cannot operate, which is most of them. It advances only while it is on screen.",
    example: "<div data-rm-crossfade><img src=\"/plate-01.jpg\" alt=\"Plate one\"><img src=\"/plate-01.jpg\" alt=\"Plate one\"></div>",
    usage: "import { crossfade } from \"@soyrageagency/rage-motion\";\ncrossfade();",
    options: [
      option("interval", "number", "4200", "Time on each frame, in ms."),
      option("duration", "number", "700", "The cross-fade itself."),
    ],
  },
  {
    name: "parallaxGrid",
    category: "gallery",
    file: GALLERIES,
    attribute: "data-rm-parallax-grid",
    summary: "Tiles drifting at their own rates as you scroll.",
    notes:
      "One scroll read for the whole grid and one transform per tile, with the rates assigned by column so the drift reads as depth rather than as noise. It runs only while the grid is on screen.",
    example: "<div data-rm-parallax-grid><img src=\"/plate-01.jpg\" alt=\"Plate one\">…</div>",
    usage: "import { parallaxGrid } from \"@soyrageagency/rage-motion\";\nparallaxGrid();",
    options: [
      option("travel", "number", "40", "Most pixels of drift."),
      option("columns", "number", "3", "Used to assign the rates."),
    ],
  },
  {
    name: "tiltGrid",
    category: "gallery",
    file: GALLERIES,
    attribute: "data-rm-tilt-grid",
    summary: "Every tile leaning toward the pointer.",
    notes:
      "One listener on the grid and one shared frame for all of it. The usual version gives forty tiles forty listeners and forty rAF loops, which is exactly why those grids stutter.",
    example: "<div data-rm-tilt-grid><figure>…</figure></div>",
    usage: "import { tiltGrid } from \"@soyrageagency/rage-motion\";\ntiltGrid();",
    options: [
      option("lean", "number", "9", "Most degrees of tilt."),
      option("ease", "number", "0.16", "How quickly a tile follows."),
    ],
  },
  {
    name: "maskReveal",
    category: "gallery",
    file: GALLERIES,
    attribute: "data-rm-mask-reveal",
    summary: "A picture uncovered by a shape as you scroll.",
    notes:
      "clip-path on the image itself, so the picture is never moved, scaled or duplicated — what changes is how much of it you are allowed to see. circle, wipe, bars and corner are the same one property with different values.",
    example: "<figure data-rm-mask-reveal=\"circle\"><img src=\"/plate-01.jpg\" alt=\"Plate one\"></figure>",
    usage: "import { maskReveal } from \"@soyrageagency/rage-motion\";\nmaskReveal();",
    options: [
      option("shape", "string", "\"circle\"", "circle · wipe · bars · corner."),
    ],
  },
  {
    name: "slats",
    category: "gallery",
    file: GALLERIES,
    attribute: "data-rm-slats",
    summary: "A picture assembled from vertical strips.",
    notes:
      "The image is drawn once per slat as a background at an offset, so there is one download and no cropping arithmetic in the markup. The original img stays in the document — hidden from the layout but not from the page — so the alt text, indexing and a no-script view all survive.",
    example: "<div data-rm-slats=\"8\" data-rm-src=\"/photo.jpg\"><img src=\"/photo.jpg\" alt=\"…\"></div>",
    usage: "import { slats } from \"@soyrageagency/rage-motion\";\nslats();",
    options: [
      option("count", "number", "8", "Clamped to 2–24."),
      option("stagger", "number", "70", "Delay between slats, in ms."),
    ],
  },
  {
    name: "zoomStrip",
    category: "gallery",
    file: GALLERIES,
    attribute: "data-rm-zoom-strip",
    summary: "A row where whatever is centred is largest.",
    notes:
      "Scale from the distance to the middle of the frame, read once a frame for the whole row. Native scrolling underneath, so the momentum, the snapping and the scrollbar are the platform's rather than an imitation of them.",
    example: "<div data-rm-zoom-strip><img src=\"/plate-01.jpg\" alt=\"Plate one\">…</div>",
    usage: "import { zoomStrip } from \"@soyrageagency/rage-motion\";\nzoomStrip();",
    options: [
      option("grow", "number", "0.22", "How much bigger the centred item gets."),
    ],
  },
  {
    name: "spiralGallery",
    category: "gallery",
    file: GALLERIES,
    attribute: "data-rm-spiral",
    summary: "Items on a spiral that turns with the page.",
    notes:
      "Each item is placed by angle and radius from its index, so the shape is arithmetic rather than a hundred hand-set positions and adding an item extends the spiral for free. The items counter-rotate, so they stay upright while the spiral turns.",
    example: "<div data-rm-spiral><img src=\"/plate-01.jpg\" alt=\"Plate one\">…</div>",
    usage: "import { spiralGallery } from \"@soyrageagency/rage-motion\";\nspiralGallery();",
    options: [
      option("turns", "number", "1.6", "How many times round."),
      option("radius", "number", "190", "The outermost reach, in pixels."),
      option("spin", "number", "90", "Degrees turned across the scroll."),
    ],
  },
  {
    name: "imageWall",
    category: "gallery",
    file: GALLERIES,
    attribute: "data-rm-image-wall",
    summary: "A wall you drag around, with weight.",
    notes:
      "Two axes of drag on one transform, and the throw keeps its velocity and eases out rather than stopping dead under your finger. The arrow keys move it too, because a wall that can only be dragged is a wall a keyboard cannot see.",
    example: "<div data-rm-image-wall><div><img src=\"/plate-01.jpg\" alt=\"Plate one\">…</div></div>",
    usage: "import { imageWall } from \"@soyrageagency/rage-motion\";\nimageWall();",
    options: [
      option("friction", "number", "0.92", "How quickly a throw slows."),
      option("step", "number", "90", "Pixels moved per arrow press."),
    ],
  },
  {
    name: "flipGrid",
    category: "gallery",
    file: GALLERIES,
    attribute: "data-rm-flip-grid",
    summary: "Cards turning over in sequence as they arrive.",
    notes:
      "Both faces are in the markup and both are real content, so the back of a card is text a search engine and a screen reader can read. The turn is rotateY on a preserved-3d parent, which is one transform rather than a cross-fade between two absolutely positioned copies.",
    example: "<div data-rm-flip-grid><article><div>front</div><div>back</div></article></div>",
    usage: "import { flipGrid } from \"@soyrageagency/rage-motion\";\nflipGrid();",
    options: [
      option("duration", "number", "700", "One card's turn."),
      option("stagger", "number", "110", "Delay between cards."),
    ],
  },
  {
    name: "peelStack",
    category: "gallery",
    file: GALLERIES,
    attribute: "data-rm-peel",
    summary: "A pile you peel through, one print at a time.",
    notes:
      "The top print lifts and slides away to the back, so the pile never empties and the order is preserved. A real button does the same thing and the pile announces which print is showing — the gesture is the flourish, not the only way in.",
    example: "<div data-rm-peel><figure>…</figure></div>",
    usage: "import { peelStack } from \"@soyrageagency/rage-motion\";\npeelStack();",
    options: [
      option("offset", "number", "9", "Pixels between prints in the pile."),
      option("duration", "number", "520", "One peel."),
    ],
  },
  {
    name: "focusGrid",
    category: "gallery",
    file: GALLERIES,
    attribute: "data-rm-focus-grid",
    summary: "Reach for one tile and the rest stand back.",
    notes:
      "The others dim and shrink slightly rather than the reached one growing, so the grid never changes size and nothing reflows — the emphasis comes from everything else giving way, which is both cheaper and calmer. Focus does it too, so tabbing reads the same as pointing.",
    example: "<div data-rm-focus-grid><figure>…</figure></div>",
    usage: "import { focusGrid } from \"@soyrageagency/rage-motion\";\nfocusGrid();",
    options: [
      option("dim", "number", "0.42", "Opacity of the tiles standing back."),
      option("shrink", "number", "0.04", "How much they give way."),
    ],
  },
  {
    name: "ribbon",
    category: "gallery",
    file: GALLERIES,
    attribute: "data-rm-ribbon",
    summary: "Pictures along a curve, moving with the scroll.",
    notes:
      "offset-path puts each item on a real path and offset-distance moves it along, so the curve is one declaration and the items follow it exactly, corners included. The version with hand-computed positions has to be redone every time the shape changes.",
    example: "<div data-rm-ribbon><img src=\"/plate-01.jpg\" alt=\"Plate one\">…</div>",
    usage: "import { ribbon } from \"@soyrageagency/rage-motion\";\nribbon();",
    options: [
      option("travel", "number", "55", "How far along the path the scroll slides them."),
      option("spread", "number", "70", "How much of the path the set occupies."),
    ],
  },
  {
    name: "contactSheet",
    category: "gallery",
    file: GALLERIES,
    attribute: "data-rm-contact-sheet",
    summary: "A sheet of frames, one of which opens.",
    notes:
      "The sheet stays exactly where it is and the chosen frame is drawn over it from its own position — a FLIP, so the sheet never reflows and the frame appears to grow out of where it was rather than fading in on top. It is a dialog while open: focus goes in, the rest is inert, Escape closes it and focus comes back.",
    example: "<div data-rm-contact-sheet><button><img src=\"/plate-01.jpg\" alt=\"Plate one\"></button></div>",
    usage: "import { contactSheet } from \"@soyrageagency/rage-motion\";\ncontactSheet();",
    options: [
      option("duration", "number", "460", "The growth."),
    ],
  },

  // ── Playful cursors ──────────────────────────────────────────────────────
  {
    name: "cartoonCursor",
    category: "cursor",
    file: CURSORS2,
    attribute: null,
    summary: "A gloved cartoon hand that points, grabs and squashes.",
    notes:
      "Drawn once as SVG and then only ever transformed: it leans into the " +
      "direction of travel, squashes and stretches along that direction when " +
      "it moves fast, and curls into a fist while the button is down. Squash " +
      "and stretch is the oldest trick in hand-drawn animation and here it is " +
      "two scales and a rotation, which costs nothing. Like every cursor in " +
      "the kit it leaves touch devices alone and only takes the real pointer " +
      "away once the hand is on screen and moving.",
    example: 'import { cartoonCursor } from "@soyrageagency/rage-motion";\ncartoonCursor();',
    usage: 'import { cartoonCursor } from "@soyrageagency/rage-motion";\ncartoonCursor({ size: 42 });',
    options: [
      option("size", "number", "42", "How big the hand is, in pixels."),
      option("ease", "number", "0.24", "How closely it follows; lower lags more."),
      option("squash", "number", "0.3", "How much it deforms at speed."),
    ],
  },
  {
    name: "blobCursor",
    category: "cursor",
    file: CURSORS2,
    attribute: null,
    summary: "A blob that lags, stretches along its velocity and settles.",
    notes:
      "The stretch is computed from how far the blob itself moved this frame " +
      "rather than from the pointer's speed, so it eases out on its own after " +
      "the hand stops — the shape is the physics rather than an imitation of " +
      "it. It is one element with `mix-blend-mode: difference`, so it stays " +
      "legible over any colour without knowing what is underneath.",
    example: 'import { blobCursor } from "@soyrageagency/rage-motion";\nblobCursor();',
    usage: 'import { blobCursor } from "@soyrageagency/rage-motion";\nblobCursor({ size: 34 });',
    options: [
      option("size", "number", "34", "Diameter at rest, in pixels."),
      option("ease", "number", "0.15", "How closely it follows."),
      option("stretch", "number", "0.55", "How far it deforms at speed."),
    ],
  },
  {
    name: "trailCursor",
    category: "cursor",
    file: CURSORS2,
    attribute: null,
    summary: "A comet of dots, each chasing the one in front.",
    notes:
      "A chain rather than a history buffer: the first dot follows the " +
      "pointer, the second follows the first, and so on. That is a handful of " +
      "numbers a frame instead of a queue of past positions, and it keeps its " +
      "shape at any frame rate — a recorded trail bunches up the moment a " +
      "frame is dropped. The real cursor is kept, because the trail is an " +
      "ornament beside it rather than a replacement for it.",
    example: 'import { trailCursor } from "@soyrageagency/rage-motion";\ntrailCursor();',
    usage: 'import { trailCursor } from "@soyrageagency/rage-motion";\ntrailCursor({ count: 8 });',
    options: [
      option("count", "number", "8", "Clamped to 2–24."),
      option("size", "number", "14", "The leading dot; the rest taper."),
      option("ease", "number", "0.32", "How tightly each link follows."),
    ],
  },
  {
    name: "sayCursor",
    category: "cursor",
    file: CURSORS2,
    attribute: "data-rm-say",
    summary: "The cursor becomes a word over anything that has one.",
    notes:
      "A pill reading \"drag\", \"play\", \"open\" — whatever the element says in " +
      "data-rm-say. The word is read from the markup rather than configured " +
      "in a script, and the element keeps whatever accessible name it already " +
      "had: this is a flourish for people using a pointer, never the only " +
      "place an affordance is stated. The real cursor stays.",
    example: '<figure data-rm-say="drag">…</figure>',
    usage: 'import { sayCursor } from "@soyrageagency/rage-motion";\nsayCursor();',
    options: [
      option("attribute", "string", '"data-rm-say"', "Where the word is read from."),
      option("ease", "number", "0.2", "How closely the pill follows."),
    ],
  },
  {
    name: "spotlightCursor",
    category: "cursor",
    file: CURSORS2,
    attribute: null,
    summary: "The page dims except where you are pointing.",
    notes:
      "One fixed layer with a radial-gradient mask following two custom " +
      "properties, so the whole effect is two numbers a frame over a single " +
      "composited layer — no canvas, and no hole punched by redrawing " +
      "anything. It never reaches full opacity, because a spotlight that hides " +
      "the page is a page nobody can read while they hunt for the switch.",
    example: 'import { spotlightCursor } from "@soyrageagency/rage-motion";\nspotlightCursor();',
    usage: 'import { spotlightCursor } from "@soyrageagency/rage-motion";\nspotlightCursor({ radius: 190 });',
    options: [
      option("radius", "number", "190", "The lit circle, in pixels."),
      option("dim", "number", "0.62", "Darkness outside it, capped at 0.85."),
    ],
  },
  {
    name: "arrowCursor",
    category: "cursor",
    file: CURSORS2,
    attribute: null,
    summary: "A sharp arrow that points the way you are moving.",
    notes:
      "The heading is smoothed across frames and held below a minimum speed, " +
      "because a raw angle from a nearly-still pointer is noise and the arrow " +
      "spins. It also turns the short way round, so it never unwinds through " +
      "350 degrees to travel ten. Those two details are the difference between " +
      "an arrow that feels deliberate and one that looks nervous.",
    example: 'import { arrowCursor } from "@soyrageagency/rage-motion";\narrowCursor();',
    usage: 'import { arrowCursor } from "@soyrageagency/rage-motion";\narrowCursor({ size: 26 });',
    options: [
      option("size", "number", "26", "The arrow, in pixels."),
      option("turn", "number", "0.2", "How quickly the heading catches up."),
    ],
  },
  {
    name: "lensCursor",
    category: "cursor",
    file: CURSORS2,
    attribute: null,
    summary: "A circle that magnifies whatever is under it.",
    notes:
      "backdrop-filter over the real page, so it magnifies live text and live " +
      "video rather than a second copy — there is no duplicate DOM to keep in " +
      "sync and nothing to go stale. The zoom is modest on purpose: a lens " +
      "that magnifies heavily has to be placed precisely, and a lens attached " +
      "to the pointer never can be.",
    example: 'import { lensCursor } from "@soyrageagency/rage-motion";\nlensCursor();',
    usage: 'import { lensCursor } from "@soyrageagency/rage-motion";\nlensCursor({ zoom: 1.35 });',
    options: [
      option("size", "number", "120", "The lens, in pixels."),
      option("zoom", "number", "1.35", "Clamped to 1–2."),
    ],
  },

  // ── Text boxes ───────────────────────────────────────────────────────────
  {
    name: "inputKit",
    category: "form",
    file: INPUTS,
    attribute: "data-rm-input",
    summary: "Twenty-four named looks for a text field.",
    notes:
      "One component with a named look rather than twenty-four components, so " +
      "they share their guarantees. None replaces the control, intercepts a " +
      "keystroke or rewrites a value, which is why autofill, paste, undo, " +
      "spellcheck, a password manager and the native validation bubble all " +
      "still work — most of what a text box is for. Every look moves a colour, " +
      "a shadow, a transform or a clip-path; none animates padding, width or " +
      "font size, so a field cannot reflow the text being typed into it or " +
      "shove the rest of the form around. All of them answer :focus-within as " +
      "well as :hover.\n\n" +
      "The looks: outline · underline · filled · soft · glass · inset · " +
      "brutal · notch · bracket · terminal · glow · gradient · dashed · lift · " +
      "slot · pill · sweep · corner · shadow · ghost · stamp · rail · frame · " +
      "caret. Import INPUT_LOOKS for the list.",
    example: '<label data-rm-input="terminal"><span>Command</span><input></label>',
    usage:
      'import { inputKit, INPUT_LOOKS } from "@soyrageagency/rage-motion";\n' +
      "inputKit();",
    options: [option("look", "string", '"outline"', "The look when the markup does not name one.")],
  },
  {
    name: "searchField",
    category: "form",
    file: INPUTS,
    attribute: "data-rm-search",
    summary: "A search that opens out of its own icon.",
    notes:
      "The field is always present at its full width; what moves is a " +
      "clip-path over it and a transform on the icon. So the header never " +
      "reflows when the search opens, nothing beside it jumps, and the input " +
      "can be typed into the instant it is reachable rather than after a width " +
      "transition finishes. It stays open while it holds a value — closing a " +
      "search that found something throws away the visitor's work — and Escape " +
      "clears it and closes it. Shut, the field leaves the tab order.",
    example: "<form data-rm-search><button type=\"button\">Search</button><input></form>",
    usage: 'import { searchField } from "@soyrageagency/rage-motion";\nsearchField();',
    options: [option("label", "string", '"Search"', "The accessible name for both parts.")],
  },
  {
    name: "tagsField",
    category: "form",
    file: INPUTS,
    attribute: "data-rm-tags",
    summary: "Chips you can add and remove from the keyboard.",
    notes:
      "Enter or a comma commits, Backspace in an empty field removes the last " +
      "chip, and every chip has a real remove button. The chips are not " +
      "decoration around a hidden value: they are kept in sync with a real " +
      "hidden input, so the form submits what is on the screen. Additions and " +
      "removals go through a polite live region — a tag that only appears " +
      "visually is a tag some of your visitors just lost. Anything already in " +
      "the field at load becomes chips, so a server-filled form works.",
    example: '<div data-rm-tags data-rm-name="topics"><input></div>',
    usage: 'import { tagsField } from "@soyrageagency/rage-motion";\ntagsField();',
    options: [
      option("name", "string", '"tags"', "The name the hidden input submits under."),
      option("separator", "string", '","', "Commits a chip, and joins the value."),
      option("max", "number", "12", "How many chips are allowed."),
    ],
  },
  {
    name: "selectField",
    category: "form",
    file: INPUTS,
    attribute: "data-rm-select",
    summary: "A listbox drawn over a real select.",
    notes:
      "The select stays, keeps the value and submits with the form; what is " +
      "drawn is a face showing the current option. Clicking it opens the " +
      "native menu, so a phone gets its own wheel and a screen reader gets the " +
      "control it already knows — the drawn part is only ever the part you " +
      "could safely lose. This is the opposite of the usual custom select, " +
      "which reimplements the whole thing in divs and then spends a thousand " +
      "lines failing to be a select.",
    example: "<label data-rm-select><span>Plan</span><select><option>Studio</option></select></label>",
    usage: 'import { selectField } from "@soyrageagency/rage-motion";\nselectField();',
    options: [option("placeholder", "string", '"Choose"', "Shown until something is chosen.")],
  },
  {
    name: "clearable",
    category: "form",
    file: INPUTS,
    attribute: "data-rm-clearable",
    summary: "A clear button that is there only when it can do something.",
    notes:
      "It appears when the field has a value and goes when it does not, so it " +
      "never offers to undo nothing, and it leaves the tab order while it is " +
      "hidden. Clearing dispatches input and change, because a programmatic " +
      "change fires neither and everything else watching the field — a " +
      "counter, a validator, a filter — is waiting for them. The button is " +
      "type=\"button\", which is the whole bug in most hand-rolled versions: " +
      "inside a form, a button without a type submits it.",
    example: "<div data-rm-clearable><input></div>",
    usage: 'import { clearable } from "@soyrageagency/rage-motion";\nclearable();',
    options: [option("label", "string", '"Clear"', "The button's accessible name.")],
  },
  {
    name: "maskField",
    category: "form",
    file: INPUTS,
    attribute: "data-rm-mask",
    summary: "Formatting that does not fight the caret.",
    notes:
      "Grouped numbers are far easier to check, and every naive version makes " +
      "them impossible to edit: it rewrites the value and the caret jumps to " +
      "the end, so correcting the second digit of a card number means retyping " +
      "the rest. This counts the real characters before the caret, reformats, " +
      "then puts the caret back after that many real characters — so typing in " +
      "the middle, deleting in the middle and pasting all keep their place.",
    example: '<input data-rm-mask="#### #### #### ####" inputmode="numeric">',
    usage: 'import { maskField } from "@soyrageagency/rage-motion";\nmaskField();',
    options: [option("pattern", "string", '"#### #### #### ####"', "# is a character slot; anything else is literal.")],
  },
  {
    name: "inlineEdit",
    category: "form",
    file: INPUTS,
    attribute: "data-rm-inline-edit",
    summary: "Text that becomes a field where it stands.",
    notes:
      "The field takes the text's own typeface and box, so nothing moves when " +
      "editing begins — the word you clicked stays exactly where you clicked " +
      "it, which is the entire point of editing in place and the thing the " +
      "differently-sized-input version loses. Enter commits, Escape restores, " +
      "blur commits. What starts it is a real button, so it is reachable and " +
      "announced rather than being a div waiting for a click.",
    example: "<div data-rm-inline-edit><button>Untitled project</button></div>",
    usage: 'import { inlineEdit } from "@soyrageagency/rage-motion";\ninlineEdit();',
    options: [option("label", "string", '"Edit"', "Prefixes the accessible name.")],
  },

  // ── Menu shapes ──────────────────────────────────────────────────────────
  {
    name: "circleNav",
    category: "navigation",
    file: MENUS,
    attribute: "data-rm-circle-nav",
    summary: "Items that fan out on an arc from their trigger.",
    notes:
      "The arc is real geometry: each item is placed at its own angle and " +
      "radius with a transform, so the fan opens from the button rather than a " +
      "panel appearing beside it, and nothing around it moves while it does. " +
      "Underneath it is a plain role=\"menu\" — arrow keys walk the ring in " +
      "source order, Escape closes it, focus goes back to the trigger and the " +
      "rest of the page is inert while it is open. Take the shape away and a " +
      "working menu is still there, which is the test.",
    example:
      '<div data-rm-circle-nav data-rm-radius="120">\n' +
      '  <button data-rm-circle-trigger>Menu</button>\n' +
      '  <ul><li><a href="#a">One</a></li><li><a href="#b">Two</a></li></ul>\n' +
      "</div>",
    usage: 'import { circleNav } from "@soyrageagency/rage-motion";\ncircleNav();',
    options: [
      option("radius", "number", "120", "How far the items travel, in pixels."),
      option("from", "number", "-90", "The angle the arc starts at, in degrees."),
      option("spread", "number", "180", "How much of a circle the arc covers."),
      option("stagger", "number", "40", "Delay between items, in ms."),
    ],
  },
  {
    name: "curtainNav",
    category: "navigation",
    file: MENUS,
    attribute: "data-rm-curtain-nav",
    summary: "A full-screen menu that falls in columns.",
    notes:
      "Each column is uncovered with its own clip-path inset rather than by " +
      "moving a panel, so the links never travel — the covering falls away " +
      "from text that was always exactly where it ends up. Text that slides " +
      "into place is text you cannot read while it arrives. Focus enters the " +
      "panel, the rest of the page goes inert, Tab is trapped, and Escape " +
      "returns focus to the button that opened it.",
    example:
      '<button data-rm-curtain-trigger="site-menu">Menu</button>\n' +
      '<div id="site-menu" data-rm-curtain-nav>\n' +
      '  <div data-rm-curtain-column><a href="#work">Work</a></div>\n' +
      "</div>",
    usage: 'import { curtainNav } from "@soyrageagency/rage-motion";\ncurtainNav();',
    options: [
      option("duration", "number", "620", "How long one column takes to fall."),
      option("stagger", "number", "90", "Delay between columns, in ms."),
    ],
  },
  {
    name: "hoverSpread",
    category: "navigation",
    file: MENUS,
    attribute: "data-rm-hover-spread",
    summary: "A row of links that parts around the pointer.",
    notes:
      "Every item is pushed away from the pointer by a squared falloff, so the " +
      "one you are heading for opens up before you reach it. It is translate " +
      "on the one shared frame callback, never margin — margin would reflow " +
      "the row sixty times a second and drag the rest of the header with it. " +
      "Keyboard focus produces the same spread, so it is not an effect only " +
      "mouse users are told about.",
    example: '<nav data-rm-hover-spread><a href="#a">Work</a><a href="#b">About</a></nav>',
    usage: 'import { hoverSpread } from "@soyrageagency/rage-motion";\nhoverSpread();',
    options: [
      option("push", "number", "14", "Maximum shove, in pixels."),
      option("reach", "number", "150", "How far the pointer is felt, in pixels."),
      option("selector", "string", '"a, button"', "What counts as an item."),
    ],
  },
  {
    name: "breadcrumbs",
    category: "navigation",
    file: MENUS,
    attribute: "data-rm-breadcrumbs",
    summary: "A trail that collapses its middle and can open it.",
    notes:
      "Long trails are usually truncated with CSS, which hides where you have " +
      "been without offering it back. This folds the middle behind a real " +
      "button, and expanding it is a FLIP: the crumbs that stay put do not " +
      "move, so the eye keeps its place while the row grows. The last crumb " +
      "carries aria-current=\"page\", which is the part of a breadcrumb that " +
      "actually does something.",
    example:
      '<nav data-rm-breadcrumbs data-rm-keep="1">\n' +
      '  <ol><li><a href="/">Home</a></li><li><a href="/kit">Kit</a></li></ol>\n' +
      "</nav>",
    usage: 'import { breadcrumbs } from "@soyrageagency/rage-motion";\nbreadcrumbs();',
    options: [
      option("keep", "number", "1", "How many crumbs stay at the front."),
      option("max", "number", "4", "Below this many crumbs, nothing folds."),
      option("label", "string", '"Breadcrumb"', "The nav's accessible name."),
    ],
  },
  {
    name: "treeNav",
    category: "navigation",
    file: MENUS,
    attribute: "data-rm-tree",
    summary: "A nested tree that opens to its own height.",
    notes:
      "The height is animated with grid-template-rows: 0fr to 1fr, so a branch " +
      "opens to exactly the height of what is inside it with nobody measuring " +
      "anything — no scrollHeight read, no stale height when the content " +
      "changes, no jump at the end. It is a real role=\"tree\" with a roving " +
      "tabindex: one tab stop for the whole thing, arrows to walk it, Right to " +
      "open a branch and Left to close it.",
    example:
      "<ul data-rm-tree>\n" +
      '  <li><button>Components</button><ul><li><a href="#a">reveal</a></li></ul></li>\n' +
      "</ul>",
    usage: 'import { treeNav } from "@soyrageagency/rage-motion";\ntreeNav();',
    options: [
      option("duration", "number", "320", "How long a branch takes to open."),
      option("label", "string", '"Tree"', "The tree's accessible name."),
    ],
  },
  {
    name: "splitNav",
    category: "navigation",
    file: MENUS,
    attribute: "data-rm-split-nav",
    summary: "A header that parts to reveal what is behind it.",
    notes:
      "The two halves slide apart on translate and the menu underneath is " +
      "uncovered. Nothing fades, so the header text stays legible for the " +
      "whole movement, and both halves move by the same number in opposite " +
      "directions rather than needing two sets of keyframes. What is behind " +
      "is inert while it is covered, so it cannot be tabbed into through a " +
      "header that is still shut.",
    example:
      "<div data-rm-split-nav>\n" +
      '  <div data-rm-split-back><a href="#a">Work</a></div>\n' +
      "  <div data-rm-split-half>Left</div><div data-rm-split-half>Right</div>\n" +
      "  <button data-rm-split-trigger>Menu</button>\n" +
      "</div>",
    usage: 'import { splitNav } from "@soyrageagency/rage-motion";\nsplitNav();',
    options: [
      option("travel", "number", "100", "How far each half moves, in per cent."),
      option("duration", "number", "560", "How long the parting takes."),
    ],
  },
  {
    name: "stackNav",
    category: "navigation",
    file: MENUS,
    attribute: "data-rm-stack-nav",
    summary: "A deck of items that deals itself out.",
    notes:
      "Shut, the items sit on top of each other with an offset and a little " +
      "rotation — a deck. Open, they deal down into a list. Every state is a " +
      "transform on items that are always in the flow at their final " +
      "positions, so the deck is an arrangement of the real list rather than a " +
      "different DOM, and the links leave the tab order while it is shut " +
      "because a pile is not somewhere a keyboard should land.",
    example:
      "<div data-rm-stack-nav>\n" +
      "  <button data-rm-stack-trigger>Links</button>\n" +
      '  <ul><li><a href="#a">One</a></li><li><a href="#b">Two</a></li></ul>\n' +
      "</div>",
    usage: 'import { stackNav } from "@soyrageagency/rage-motion";\nstackNav();',
    options: [
      option("lift", "number", "8", "Offset between stacked items, in pixels."),
      option("tilt", "number", "3", "Rotation of the alternating cards, in degrees."),
      option("stagger", "number", "60", "Delay between items as they deal."),
    ],
  },
  {
    name: "dotNav",
    category: "navigation",
    file: MENUS,
    attribute: "data-rm-dot-nav",
    summary: "A column of dots that knows which section you are in.",
    notes:
      "One IntersectionObserver over the sections rather than a scroll handler " +
      "measuring all of them every frame. The label beside each dot is real " +
      "text, shown on hover and on focus and always available to a screen " +
      "reader, and aria-current marks the section you are in — so the state is " +
      "never carried by the size of a dot alone.",
    example: '<nav data-rm-dot-nav><a href="#intro" data-rm-dot-label="Intro"></a></nav>',
    usage: 'import { dotNav } from "@soyrageagency/rage-motion";\ndotNav();',
    options: [
      option("label", "string", '"Sections"', "The nav's accessible name."),
      option("threshold", "number", "0.5", "How much of a section counts as being in it."),
    ],
  },

  // ── Texture ──────────────────────────────────────────────────────────────
  {
    name: "rings",
    category: "decoration",
    file: TEXTURE,
    attribute: "data-rm-rings",
    summary: "Rings that expand outward from a point and fade.",
    notes:
      "Concentric circles on one CSS animation at different negative delays, " +
      "so all of them are phases of a single rule rather than a stack of " +
      "keyframes, and the field is full on the first frame instead of filling " +
      "up. They scale rather than change radius, which keeps the whole thing " +
      "on the compositor; animating width would repaint the parent every frame.",
    example: '<section data-rm-rings="4">…</section>',
    usage: 'import { rings } from "@soyrageagency/rage-motion";\nrings();',
    options: [
      option("rings", "number", "4", "Clamped to 8."),
      option("size", "number", "220", "The full radius, in pixels."),
      option("speed", "number", "4200", "One ring's whole journey, in ms."),
      option("color", "string", '"rgba(42,167,228,0.30)"', "The ring stroke."),
    ],
  },
  {
    name: "hexGrid",
    category: "decoration",
    file: TEXTURE,
    attribute: "data-rm-hex",
    summary: "A honeycomb lattice that lights up near the pointer.",
    notes:
      "The lattice is one SVG pattern — one node however large the panel is — " +
      "and the light is a radial-gradient mask following two custom " +
      "properties. Two numbers a frame, written to a layer with nothing else " +
      "in it, instead of a class toggled on hundreds of cells. Off the pointer " +
      "and under reduced motion the lattice is simply there: the pattern is " +
      "the decoration, the light is the bonus.",
    example: '<div data-rm-hex data-rm-size="26">…</div>',
    usage: 'import { hexGrid } from "@soyrageagency/rage-motion";\nhexGrid();',
    options: [
      option("size", "number", "26", "Hexagon side, clamped to 8–120px."),
      option("glow", "number", "180", "Radius of the light, in pixels."),
      option("color", "string", '"rgba(255,255,255,0.10)"', "The lattice stroke."),
    ],
  },
  {
    name: "plusGrid",
    category: "decoration",
    file: TEXTURE,
    attribute: "data-rm-plus",
    summary: "A field of small plus marks.",
    notes:
      "Two crossed gradients cut down to short arms by a mask, which is the " +
      "whole component: no nodes, no frames, no canvas. It drifts by " +
      "background position, which the compositor handles on its own thread.",
    example: '<section data-rm-plus data-rm-gap="34">…</section>',
    usage: 'import { plusGrid } from "@soyrageagency/rage-motion";\nplusGrid();',
    options: [
      option("gap", "number", "34", "Distance between marks, in pixels."),
      option("arm", "number", "5", "Length of each arm, in pixels."),
      option("color", "string", '"rgba(255,255,255,0.14)"', "The mark colour."),
    ],
  },
  {
    name: "diagonals",
    category: "decoration",
    file: TEXTURE,
    attribute: "data-rm-diagonals",
    summary: "Hatching that travels, with a soft edge.",
    notes:
      "stripes fills its element edge to edge; this one is masked to fade out " +
      "at both ends, so it can sit under real text without the text landing on " +
      "a hard boundary. Same one-gradient cost, and it stops completely under " +
      "reduced motion.",
    example: '<div data-rm-diagonals data-rm-width="14">…</div>',
    usage: 'import { diagonals } from "@soyrageagency/rage-motion";\ndiagonals();',
    options: [
      option("width", "number", "14", "Distance between lines, in pixels."),
      option("angle", "number", "135", "The hatch angle, in degrees."),
      option("fade", "number", "22", "How much of each end fades out, in per cent."),
    ],
  },
  {
    name: "topography",
    category: "decoration",
    file: TEXTURE,
    attribute: "data-rm-topography",
    summary: "Contour lines, drifting.",
    notes:
      "Concentric rounded paths built once from a seeded wobble, then moved as " +
      "a whole. Seeded rather than random, so the same panel draws the same " +
      "map on every load — a background that is different on every reload is a " +
      "background that draws attention to itself, which is the one thing it " +
      "must not do.",
    example: '<section data-rm-topography data-rm-contours="9">…</section>',
    usage: 'import { topography } from "@soyrageagency/rage-motion";\ntopography();',
    options: [
      option("contours", "number", "9", "Clamped to 2–24."),
      option("seed", "number", "7", "Change it for a different map."),
      option("speed", "number", "34000", "One drift, in ms."),
    ],
  },
  {
    name: "circuit",
    category: "decoration",
    file: TEXTURE,
    attribute: "data-rm-circuit",
    summary: "Traces with pulses running along them.",
    notes:
      "The pulse is a short stroke-dasharray segment moved by " +
      "stroke-dashoffset along the trace's own path, so it follows every " +
      "corner exactly — no keyframed coordinates to keep in step with the " +
      "shape, and changing the trace changes the route for free. It runs only " +
      "while the panel is on screen; a board animating in a section nobody has " +
      "scrolled to is battery spent on nothing.",
    example: '<div data-rm-circuit data-rm-traces="5">…</div>',
    usage: 'import { circuit } from "@soyrageagency/rage-motion";\ncircuit();',
    options: [
      option("traces", "number", "5", "Up to six fixed routes."),
      option("speed", "number", "3200", "One pulse's journey, in ms."),
      option("pulse", "string", '"rgba(42,167,228,0.95)"', "The lit segment."),
    ],
  },
  {
    name: "vignette",
    category: "decoration",
    file: TEXTURE,
    attribute: "data-rm-vignette",
    summary: "An edge darkening that deepens as you scroll in.",
    notes:
      "A single inset shadow whose strength follows how centred the element " +
      "is, read off the shared scroll frame rather than taking its own " +
      "measurement. Under reduced motion it settles at its mid strength " +
      "instead of vanishing: a vignette is contrast, and contrast is not " +
      "motion.",
    example: '<section data-rm-vignette data-rm-strength="0.55">…</section>',
    usage: 'import { vignette } from "@soyrageagency/rage-motion";\nvignette();',
    options: [
      option("strength", "number", "0.55", "Darkness at the deepest point."),
      option("spread", "number", "34", "How far in it reaches, in per cent."),
    ],
  },
  {
    name: "halftone",
    category: "decoration",
    file: TEXTURE,
    attribute: "data-rm-halftone",
    summary: "A dot matrix whose dots grow toward the pointer.",
    notes:
      "The classic halftone as one radial-gradient layer, with the growth done " +
      "by a mask centred on the pointer. One element and two numbers a frame — " +
      "the version made of a thousand spans costs a thousand style " +
      "recalculations to do the same thing.",
    example: '<div data-rm-halftone data-rm-gap="12">…</div>',
    usage: 'import { halftone } from "@soyrageagency/rage-motion";\nhalftone();',
    options: [
      option("gap", "number", "12", "Distance between dots, in pixels."),
      option("dot", "number", "1.6", "Dot radius, in pixels."),
      option("reach", "number", "190", "How far the pointer is felt, in pixels."),
    ],
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
