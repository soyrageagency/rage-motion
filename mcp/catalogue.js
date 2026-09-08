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
const TRANSITIONS = "src/components/transitions.js";

const option = (name, type, dflt, about) => ({ name, type, default: dflt, about });

export const CATALOGUE = [
  // ── Entrances ────────────────────────────────────────────────────────────
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
