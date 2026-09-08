/**
 * Scroll animation, the second set.
 *
 *   • scrollCounter()    — a figure that counts as you arrive, and keeps its value.
 *   • scrollRotate()     — something that turns upright as it reaches reading height.
 *   • scrollScale()      — a block that settles into its own size.
 *   • scrollBlur()       — focus pulled as an image arrives.
 *   • scrollColour()     — a section that shifts palette as you pass through it.
 *   • pinSteps()         — a pinned panel that steps through its content.
 *   • scrollDraw()       — an SVG path drawn by scroll position.
 *   • depthLayers()      — several layers at different rates from one scroll read.
 *   • scrollSnapSections() — full-height sections that snap, with a real nav.
 *   • revealMaskScroll() — a clip-path wipe tied to the scroll, not to a timer.
 *   • marqueeScroll()    — a strip whose speed *is* the scroll.
 *   • scrollGradient()   — a gradient that turns and crossfades as you descend.
 *   • scrollSplit()      — two halves that part to show what is behind them.
 *   • scrollZoomPin()    — a pinned figure that settles out of an over-scale.
 *   • scrollTypeScale()  — a headline that shrinks into its line without reflowing.
 *
 * Every component here obeys the same three rules, because scroll effects are
 * where a page's frame budget is usually lost.
 *
 * One read per frame. Each component reads exactly one `getBoundingClientRect`
 * (or one `scrollTop`) inside a single shared rAF task and then only writes —
 * and it writes only to `transform`, `opacity`, `filter`, `clip-path` and
 * colour, so the write cannot invalidate the layout the next component is
 * about to read. The version that goes wrong is the one with a `scroll`
 * listener per element: scroll events fire faster than frames on some
 * machines and slower on others, each handler measures again, and the page
 * spends its whole budget in layout before anything is painted.
 *
 * Nothing runs off screen. Every loop is inside `whileVisible`, so a page with
 * a dozen of these has at most the handful of tasks that are actually in view,
 * and none at all in a background tab.
 *
 * Reduced motion jumps to the end, never to nothing. A scroll effect is
 * hostile to anyone who gets ill from movement, and the honest response is not
 * to hide the content — it is to draw the finished frame at mount. Counters
 * show their total, masks are open, blurs are sharp, pinned panels stop
 * pinning and become an ordinary column of readable steps.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import {
  clamp, dataNumber, dataString, lerp, onFrame, prefersReducedMotion, resolveElements, whileVisible,
} from "../core/motion.js";

/** An option from a fixed set. Anything unrecognised falls back, never through. */
function pick(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

/** A short unique id, for wiring one element to another by attribute. */
const uid = () => Math.random().toString(36).slice(2, 8);

/**
 * The scroll band an element animates across, as two viewport fractions.
 *
 * `1` is the bottom edge of the screen and `0` is the top, so the default band
 * of 0.92 → 0.45 means "start as the top edge appears, finish once it has
 * climbed a little past the middle". Authors override it with `data-rm-start`
 * and `data-rm-end`, and both a degenerate band (the two the same, which
 * divides by zero) and an inverted one (the end above the start, which makes
 * the denominator negative and plays every component backwards) fall back to
 * the component's own defaults rather than through.
 */
function band(element, start, end) {
  const head = dataNumber(element, "rmStart", start);
  const foot = dataNumber(element, "rmEnd", end);
  return head <= foot ? [start, end] : [head, foot];
}

/** One read: how far this element has crossed its band, 0 to 1. */
function bandProgress(element, head, foot) {
  const box = element.getBoundingClientRect();
  const view = window.innerHeight || 1;
  return clamp((head - box.top / view) / (head - foot));
}

/**
 * One read: how far a tall section has been scrolled through.
 *
 * This is the measure a sticky panel wants — 0 when the section's top reaches
 * the top of the screen, 1 when its bottom does — and it is arithmetic on the
 * section's own box rather than on `scrollY`, so it is correct inside a nested
 * scroller and correct after any reflow, with no cached offsets to go stale.
 * A section shorter than the viewport has no pinned travel at all, so it falls
 * back to a plain pass across the screen instead of dividing by a negative.
 */
function pinProgress(element) {
  const box = element.getBoundingClientRect();
  const view = window.innerHeight || 1;
  const travel = box.height - view;
  return travel > 0 ? clamp(-box.top / travel) : clamp((view - box.top) / view);
}

/**
 * Wire a per-frame update to one element, on the shared loop.
 *
 * `update(progress)` is called once immediately so the start state comes from
 * JavaScript rather than from the stylesheet — the page is correct before this
 * ever runs and correct the instant it does — and then once per frame while
 * the element is on screen. Under reduced motion, and on a browser with no
 * `IntersectionObserver` to tell us when to stop, it is called once with 1:
 * the finished frame, drawn and left alone.
 */
function drive(element, read, update) {
  if (prefersReducedMotion() || typeof IntersectionObserver !== "function") {
    update(1);
    return () => {};
  }
  update(read());
  return whileVisible(element, () => onFrame(() => update(read())));
}

/** Parse `#abc`, `#aabbcc` or `rgb()` into channels. Anything else is refused. */
function toRgb(value, fallback) {
  const text = String(value ?? "").trim();
  const hex = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(text);
  if (hex) {
    const digits = hex[1].length === 3 ? [...hex[1]].map((c) => c + c).join("") : hex[1];
    return [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16));
  }
  const fn = /^rgba?\(([^)]+)\)$/i.exec(text);
  if (fn) {
    const parts = fn[1].split(/[\s,/]+/).map(Number).filter(Number.isFinite);
    if (parts.length >= 3) return parts.slice(0, 3);
  }
  return fallback;
}

/** Mix two parsed colours. Plain sRGB, which is what a browser paints anyway. */
const mixRgb = (from, to, amount) =>
  `rgb(${Math.round(lerp(from[0], to[0], amount))} ${Math.round(lerp(from[1], to[1], amount))} ` +
  `${Math.round(lerp(from[2], to[2], amount))})`;

/**
 * A figure that counts as you arrive, and keeps its value.
 *
 * The number is tied to scroll position rather than to a duration, so it
 * cannot finish while it is still below the fold and cannot be halfway through
 * when you have already read past it. It ratchets by default: scrolling back
 * up does not rewind the total, because a statistic that runs backwards reads
 * as a bug rather than as an effect.
 *
 * The counting itself is hidden from assistive technology and the settled
 * total is announced once, four hundred milliseconds after the last change.
 * The naive version puts `aria-live="polite"` on the digits themselves, which
 * queues several hundred intermediate numbers for a screen reader to read out
 * one at a time — the single most hostile thing a counter can do. The digits
 * also sit on tabular figures in the stylesheet, so the box never twitches as
 * the glyphs change width.
 *
 *   <p data-rm-scroll-count data-rm-to="1240" data-rm-suffix=" projects"></p>
 */
export function scrollCounter(target = "[data-rm-scroll-count]", options = {}) {
  const figures = resolveElements(target);
  if (!figures.length) return () => {};

  const { from = 0, to = 100, decimals = 0, start = 0.92, end = 0.45 } = options;
  const cleanups = [];

  for (const figure of figures) {
    const first = dataNumber(figure, "rmFrom", from);
    const total = dataNumber(figure, "rmTo", to);
    const places = clamp(Math.round(dataNumber(figure, "rmDecimals", decimals)), 0, 6);
    const prefix = dataString(figure, "rmPrefix", "");
    const suffix = dataString(figure, "rmSuffix", "");
    const rewinds = pick(dataString(figure, "rmRewind", "no"), ["yes", "no"], "no") === "yes";
    const [head, foot] = band(figure, start, end);

    const was = figure.textContent;
    figure.classList.add("rm-scroll-count");

    const face = document.createElement("span");
    face.className = "rm-scroll-count-face";
    face.setAttribute("aria-hidden", "true");

    const said = document.createElement("span");
    said.className = "rm-scroll-count-said";
    said.setAttribute("aria-live", "polite");
    figure.replaceChildren(face, said);

    const shape = (value) => prefix + value.toLocaleString(undefined, {
      minimumFractionDigits: places, maximumFractionDigits: places,
    }) + suffix;

    let held = 0;
    let settle = 0;
    const update = (progress) => {
      held = rewinds ? progress : Math.max(held, progress);
      const text = shape(lerp(first, total, held));
      if (text === face.textContent) return;
      face.textContent = text;
      clearTimeout(settle);
      settle = setTimeout(() => { said.textContent = text; }, 400);
    };

    cleanups.push(drive(figure, () => bandProgress(figure, head, foot), update));
    cleanups.push(() => {
      clearTimeout(settle);
      figure.textContent = was;
      figure.classList.remove("rm-scroll-count");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Something that turns upright as it reaches reading height.
 *
 * It starts tilted and ends square, which is the right way round: the resting
 * state is the finished state, so reduced motion and a browser that never
 * fires the observer both land on a page that looks deliberately typeset
 * rather than knocked askew. A card that ends rotated is a card somebody has
 * to read at an angle forever.
 *
 * `data-rm-axis` swaps the flat turn for a hinge on x or y, with the
 * perspective written into the element's own transform rather than onto a
 * parent, so the effect never depends on markup the author did not add.
 *
 *   <figure data-rm-scroll-rotate data-rm-angle="-12">…</figure>
 */
export function scrollRotate(target = "[data-rm-scroll-rotate]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { angle = 10, axis = "z", start = 1, end = 0.4 } = options;
  const cleanups = [];

  for (const element of elements) {
    const turn = dataNumber(element, "rmAngle", angle);
    const way = pick(dataString(element, "rmAxis", axis), ["x", "y", "z"], axis);
    const [head, foot] = band(element, start, end);
    element.classList.add("rm-scroll-rotate");

    const update = (progress) => {
      const left = turn * (1 - progress);
      element.style.transform = way === "z"
        ? `rotate(${left.toFixed(2)}deg)`
        : `perspective(900px) rotate${way.toUpperCase()}(${left.toFixed(2)}deg)`;
    };

    cleanups.push(drive(element, () => bandProgress(element, head, foot), update));
    cleanups.push(() => {
      element.style.transform = "";
      element.classList.remove("rm-scroll-rotate");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A block that settles into its own size.
 *
 * Scale, not width and height. The element's layout box never changes, so
 * nothing around it reflows and the effect costs a composite rather than a
 * full layout pass — the version built on width animates the entire subtree
 * below it on every frame, which is why it stutters on a phone.
 *
 * It ends at scale 1, so the rest state is the element at its real size and
 * nothing is left permanently magnified or shrunken.
 *
 *   <div data-rm-scroll-scale data-rm-from="0.88">…</div>
 */
export function scrollScale(target = "[data-rm-scroll-scale]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { from = 0.9, origin = "center", start = 0.95, end = 0.45 } = options;
  const ORIGINS = { left: "left center", center: "center", centre: "center", right: "right center", top: "center top", bottom: "center bottom" };
  const cleanups = [];

  for (const element of elements) {
    const smallest = dataNumber(element, "rmFrom", from);
    const anchor = ORIGINS[dataString(element, "rmOrigin", origin)] ?? ORIGINS[origin];
    const [head, foot] = band(element, start, end);

    element.classList.add("rm-scroll-scale");
    element.style.transformOrigin = anchor;

    const update = (progress) => {
      element.style.transform = `scale(${lerp(smallest, 1, progress).toFixed(4)})`;
    };

    cleanups.push(drive(element, () => bandProgress(element, head, foot), update));
    cleanups.push(() => {
      element.style.transform = "";
      element.style.transformOrigin = "";
      element.classList.remove("rm-scroll-scale");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Focus pulled as an image arrives.
 *
 * `filter: blur()` on the element itself, ending at zero. Two things are
 * usually got wrong here. The first is reaching for `backdrop-filter`, which
 * blurs everything painted behind the element and costs far more than blurring
 * the element alone. The second is leaving opacity out of it entirely and then
 * blurring text, which is unreadable rather than atmospheric — so this is
 * meant for media, and the blur radius is capped at a value that stays cheap.
 *
 * Note that a filtered element becomes a containing block for fixed
 * descendants, so do not put a sticky child inside one.
 *
 *   <img data-rm-scroll-blur data-rm-blur="14" src="…" alt="…">
 */
export function scrollBlur(target = "[data-rm-scroll-blur]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { blur = 12, start = 1, end = 0.5 } = options;
  const cleanups = [];

  for (const element of elements) {
    const radius = clamp(dataNumber(element, "rmBlur", blur), 0, 40);
    const [head, foot] = band(element, start, end);
    element.classList.add("rm-scroll-blur");

    const update = (progress) => {
      const left = radius * (1 - progress);
      // Below a twentieth of a pixel the filter is doing nothing but keeping
      // the element on its own layer, so it is dropped entirely at the end.
      element.style.filter = left < 0.05 ? "" : `blur(${left.toFixed(2)}px)`;
    };

    cleanups.push(drive(element, () => bandProgress(element, head, foot), update));
    cleanups.push(() => {
      element.style.filter = "";
      element.classList.remove("rm-scroll-blur");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A section that shifts palette as you pass through it.
 *
 * Two custom properties are interpolated and written to the section — a ground
 * and an ink — and the stylesheet spends them. Doing it this way means one
 * write per frame drives the whole subtree, including borders and rules, and
 * an author can opt any descendant in by naming the property rather than by
 * being enumerated in JavaScript.
 *
 * The ink is interpolated alongside the ground rather than being left fixed,
 * which is the mistake that turns a dark-to-light section into three seconds
 * of black text on a nearly black field. Colours that cannot be parsed fall
 * back to the defaults instead of writing `rgb(NaN NaN NaN)` and blanking the
 * section.
 *
 *   <section data-rm-scroll-colour data-rm-from="#f7f3ec" data-rm-to="#1b1b1b"
 *            data-rm-ink-from="#1b1b1b" data-rm-ink-to="#f7f3ec">…</section>
 */
export function scrollColour(target = "[data-rm-scroll-colour]", options = {}) {
  const sections = resolveElements(target);
  if (!sections.length) return () => {};

  const {
    from = "#f6f1e7", to = "#1c1b19", inkFrom = "#1c1b19", inkTo = "#f6f1e7",
    start = 0.85, end = 0.15,
  } = options;
  const cleanups = [];

  for (const section of sections) {
    const groundA = toRgb(dataString(section, "rmFrom", from), toRgb(from, [246, 241, 231]));
    const groundB = toRgb(dataString(section, "rmTo", to), toRgb(to, [28, 27, 25]));
    const inkA = toRgb(dataString(section, "rmInkFrom", inkFrom), groundB);
    const inkB = toRgb(dataString(section, "rmInkTo", inkTo), groundA);
    const [head, foot] = band(section, start, end);

    section.classList.add("rm-scroll-colour");

    const update = (progress) => {
      section.style.setProperty("--rm-scroll-colour-ground", mixRgb(groundA, groundB, progress));
      section.style.setProperty("--rm-scroll-colour-ink", mixRgb(inkA, inkB, progress));
    };

    cleanups.push(drive(section, () => bandProgress(section, head, foot), update));
    cleanups.push(() => {
      section.style.removeProperty("--rm-scroll-colour-ground");
      section.style.removeProperty("--rm-scroll-colour-ink");
      section.classList.remove("rm-scroll-colour");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A pinned panel that steps through its content.
 *
 * The section is tall, the stage inside it is `position: sticky`, and the
 * scroll position picks which step is showing. The pin is CSS; there is no
 * fixed positioning and no scroll hijacking, so the scrollbar still means what
 * it says and a resize cannot leave the panel stranded.
 *
 * The steps that are not showing are `inert` as well as transparent, because a
 * transparent step is still in the tab order and sending focus to something
 * nobody can see is how a keyboard visitor gets lost. The active step carries
 * `aria-current="step"` and a polite live region says "Step 2 of 5" once per
 * change, which is discrete enough to announce without becoming chatter.
 *
 * Under reduced motion the stacking is abandoned altogether: the section stops
 * pinning and the steps become an ordinary readable column, because a stack of
 * absolutely positioned panels with only one visible is an accessibility
 * problem dressed up as an effect.
 *
 *   <section data-rm-pin-steps><article>…</article><article>…</article></section>
 */
export function pinSteps(target = "[data-rm-pin-steps]", options = {}) {
  const sections = resolveElements(target);
  if (!sections.length) return () => {};

  const { travel = 90 } = options;
  const cleanups = [];

  for (const section of sections) {
    const steps = [...section.children];
    if (steps.length < 2) continue;

    section.classList.add("rm-pin-steps");
    steps.forEach((step) => step.classList.add("rm-pin-steps-step"));
    // Each step is worth `travel` of viewport height of scrolling, which is
    // what makes the pin last long enough to read rather than flicking past.
    section.style.setProperty("--rm-pin-steps-travel", `${dataNumber(section, "rmTravel", travel)}vh`);
    section.style.setProperty("--rm-pin-steps-count", String(steps.length));

    const restore = () => {
      section.append(...steps);
      steps.forEach((step) => {
        step.classList.remove("rm-pin-steps-step", "is-current");
        step.style.opacity = "";
        step.style.transform = "";
        step.inert = false;
        step.removeAttribute("aria-current");
      });
      section.style.removeProperty("--rm-pin-steps-travel");
      section.style.removeProperty("--rm-pin-steps-count");
      section.classList.remove("rm-pin-steps", "is-flat");
    };

    if (prefersReducedMotion() || typeof IntersectionObserver !== "function") {
      section.classList.add("is-flat");
      cleanups.push(restore);
      continue;
    }

    const stage = document.createElement("div");
    stage.className = "rm-pin-steps-stage";
    stage.append(...steps);

    const said = document.createElement("p");
    said.className = "rm-pin-steps-said";
    said.setAttribute("aria-live", "polite");
    section.append(stage, said);

    let at = -1;
    const show = (index) => {
      if (index === at) return;
      at = index;
      steps.forEach((step, i) => {
        const here = i === index;
        step.classList.toggle("is-current", here);
        step.style.opacity = here ? "1" : "0";
        step.style.transform = here ? "none" : `translateY(${i < index ? -20 : 20}px)`;
        step.inert = !here;
        if (here) step.setAttribute("aria-current", "step");
        else step.removeAttribute("aria-current");
      });
      said.textContent = `Step ${index + 1} of ${steps.length}`;
    };
    show(0);

    cleanups.push(whileVisible(section, () => onFrame(() => {
      const progress = pinProgress(section);
      show(clamp(Math.floor(progress * steps.length), 0, steps.length - 1));
    })));
    cleanups.push(() => {
      restore();
      stage.remove();
      said.remove();
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * An SVG path drawn by scroll position.
 *
 * The line is measured with `getTotalLength()` and revealed by moving
 * `stroke-dashoffset`, which is a paint-only property on the shape: no
 * geometry changes, nothing reflows, and the drawing is exact rather than
 * approximated by a mask sliding over the top. Several shapes in one drawing
 * are staggered so they draw in document order instead of all at once, which
 * is what makes it read as a hand moving.
 *
 * The length is re-measured by a `ResizeObserver`, because a path in an SVG
 * without a fixed viewBox genuinely changes length when the box changes and a
 * dash array cached at load is then wrong for the rest of the session. Under
 * reduced motion the drawing is simply complete, and the dash attributes are
 * removed entirely on cleanup so an author's own dashes survive.
 *
 *   <svg data-rm-scroll-draw viewBox="0 0 200 80" aria-hidden="true">
 *     <path d="M4 60 C 60 4, 140 4, 196 60" fill="none" stroke="currentColor"/>
 *   </svg>
 */
export function scrollDraw(target = "[data-rm-scroll-draw]", options = {}) {
  const drawings = resolveElements(target);
  if (!drawings.length) return () => {};

  const { shapes = "path, polyline, line, circle, ellipse, rect", stagger = 0.25, start = 0.9, end = 0.35 } = options;
  const cleanups = [];

  for (const drawing of drawings) {
    const lines = [...drawing.querySelectorAll(shapes)].filter((el) => typeof el.getTotalLength === "function");
    if (!lines.length) continue;

    const overlap = clamp(dataNumber(drawing, "rmStagger", stagger), 0, 1);
    const [head, foot] = band(drawing, start, end);
    // The same test `drive` makes, hoisted, because the ResizeObserver below
    // has to agree with it: on the quiet branch the drawing is finished and
    // must stay finished, and a resize must not redraw it from the live band.
    const quiet = prefersReducedMotion() || typeof IntersectionObserver !== "function";
    drawing.classList.add("rm-scroll-draw");

    let lengths = [];
    const measure = () => {
      lengths = lines.map((line) => {
        // A zero-length or unmeasurable shape would give a NaN dash offset,
        // which browsers render as an invisible stroke. One is harmless.
        const length = line.getTotalLength();
        return Number.isFinite(length) && length > 0 ? length : 1;
      });
      lines.forEach((line, i) => { line.style.strokeDasharray = String(lengths[i]); });
    };
    measure();

    // Each shape gets its own slice of the band, overlapping by `stagger`.
    const share = 1 / lines.length;
    const update = (progress) => {
      lines.forEach((line, i) => {
        const from = i * share * (1 - overlap);
        const span = share + (1 - share) * overlap;
        const own = clamp((progress - from) / (span || 1));
        line.style.strokeDashoffset = String(lengths[i] * (1 - own));
      });
    };

    // A ResizeObserver always delivers one callback for a newly observed
    // element, and it arrives asynchronously — after `drive` has synchronously
    // drawn the finished frame. Re-measuring is always right, but redrawing
    // from the live band is only right when there is a loop to keep correcting
    // it: on the quiet branch a drawing below the fold would be handed a
    // progress of 0, which writes a full dash offset and an invisible stroke
    // that nothing ever puts back.
    let watcher = null;
    if (typeof ResizeObserver === "function") {
      watcher = new ResizeObserver(() => {
        measure();
        update(quiet ? 1 : bandProgress(drawing, head, foot));
      });
      watcher.observe(drawing);
    }

    cleanups.push(drive(drawing, () => bandProgress(drawing, head, foot), update));
    cleanups.push(() => {
      watcher?.disconnect();
      lines.forEach((line) => {
        line.style.strokeDasharray = "";
        line.style.strokeDashoffset = "";
      });
      drawing.classList.remove("rm-scroll-draw");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Several layers at different rates from one scroll read.
 *
 * The whole point is the arithmetic: one `getBoundingClientRect` on the frame,
 * then a transform written to each child at its own rate. The usual version
 * gives every layer its own scroll listener and its own measurement, so six
 * layers means six forced layouts per event on a handler that fires more often
 * than the screen refreshes.
 *
 * Rates default to the child's index, so a stack works with no configuration,
 * and `data-rm-rate` on any layer overrides it. Progress is measured from the
 * middle of the pass rather than the start, so every layer is at its resting
 * position when the frame is centred and the drift is symmetric either side.
 *
 *   <div data-rm-scroll-depth>
 *     <img data-rm-rate="0.2" …><img data-rm-rate="0.6" …>
 *   </div>
 */
export function depthLayers(target = "[data-rm-scroll-depth]", options = {}) {
  const frames = resolveElements(target);
  if (!frames.length) return () => {};

  const { travel = 90, axis = "y" } = options;
  const cleanups = [];

  for (const frame of frames) {
    const layers = [...frame.children];
    if (!layers.length) continue;

    const reach = dataNumber(frame, "rmTravel", travel);
    const way = pick(dataString(frame, "rmAxis", axis), ["x", "y"], axis);
    const rates = layers.map((layer, i) => dataNumber(layer, "rmRate", (i + 1) / layers.length));

    frame.classList.add("rm-scroll-depth");
    layers.forEach((layer) => layer.classList.add("rm-scroll-depth-layer"));

    const read = () => {
      const box = frame.getBoundingClientRect();
      const view = window.innerHeight || 1;
      // Where the frame's centre sits, 0 at the bottom edge and 1 at the top.
      return clamp((view - (box.top + box.height / 2)) / (view + box.height));
    };

    const update = (progress) => {
      const shift = (progress - 0.5) * 2;
      layers.forEach((layer, i) => {
        const move = -shift * rates[i] * reach;
        layer.style.transform = way === "y"
          ? `translate3d(0, ${move.toFixed(2)}px, 0)`
          : `translate3d(${move.toFixed(2)}px, 0, 0)`;
      });
    };

    // Reduced motion means every layer at rest, which is the middle of the
    // pass — not the end of it, which would leave the stack visibly offset.
    if (prefersReducedMotion() || typeof IntersectionObserver !== "function") {
      update(0.5);
    } else {
      update(read());
      cleanups.push(whileVisible(frame, () => onFrame(() => update(read()))));
    }

    cleanups.push(() => {
      layers.forEach((layer) => {
        layer.style.transform = "";
        layer.classList.remove("rm-scroll-depth-layer");
      });
      frame.classList.remove("rm-scroll-depth");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Full-height sections that snap, with a real nav.
 *
 * The snapping is CSS — `scroll-snap-type` on the frame, `scroll-snap-align`
 * on the panels — so the browser keeps ownership of the scroll and momentum,
 * inertia and trackpad feel are all native. Everything JavaScript does here is
 * to say where you are: one `scrollTop` read per frame against offsets cached
 * once and refreshed by a `ResizeObserver`, rather than measuring every panel
 * on every frame.
 *
 * The nav is a list of real buttons carrying the panels' own headings as text,
 * on a roving tabindex with arrow, Home and End keys, and the current one has
 * `aria-current="true"`. The version that goes wrong is a row of unlabelled
 * divs with click handlers, which is unreachable by keyboard and silent to a
 * screen reader. Under reduced motion the jumps are instant and the snapping
 * relaxes to `proximity`, because forced snapping is itself a kind of motion
 * nobody asked for.
 *
 *   <div data-rm-snap-sections><section>…</section><section>…</section></div>
 */
export function scrollSnapSections(target = "[data-rm-snap-sections]", options = {}) {
  const frames = resolveElements(target);
  if (!frames.length) return () => {};

  const { snap = "mandatory", label = "Sections" } = options;
  const cleanups = [];

  for (const frame of frames) {
    const panels = [...frame.children];
    if (!panels.length) continue;

    const quiet = prefersReducedMotion();
    const mode = quiet ? "proximity" : pick(dataString(frame, "rmSnap", snap), ["mandatory", "proximity", "none"], snap);
    frame.classList.add("rm-snap-sections", `is-${mode}`);
    panels.forEach((panel, i) => {
      panel.classList.add("rm-snap-sections-panel");
      if (!panel.id) panel.id = `rm-snap-${uid()}-${i}`;
    });

    const nav = document.createElement("nav");
    nav.className = "rm-snap-sections-nav";
    nav.setAttribute("aria-label", dataString(frame, "rmLabel", label));

    const dots = panels.map((panel, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "rm-snap-sections-dot";
      dot.setAttribute("aria-controls", panel.id);
      dot.tabIndex = i === 0 ? 0 : -1;
      const name = document.createElement("span");
      name.className = "rm-snap-sections-name";
      // The heading is the honest label; a number is the fallback, not the plan.
      name.textContent = panel.querySelector("h1, h2, h3, h4, h5, h6")?.textContent.trim() || `Section ${i + 1}`;
      dot.appendChild(name);
      nav.appendChild(dot);
      return dot;
    });

    const said = document.createElement("p");
    said.className = "rm-snap-sections-said";
    said.setAttribute("aria-live", "polite");
    // First child, and zero pixels tall in the stylesheet: it sticks from the
    // top of the scroller without displacing a single snap point.
    frame.prepend(nav);
    frame.append(said);

    const go = (index) => {
      const panel = panels[index];
      if (!panel) return;
      frame.scrollTo({ top: panel.offsetTop, behavior: quiet ? "auto" : "smooth" });
      dots[index].focus();
    };

    let offsets = panels.map((panel) => panel.offsetTop);
    let at = -1;
    const mark = (index) => {
      if (index === at) return;
      at = index;
      dots.forEach((dot, i) => {
        const here = i === index;
        dot.classList.toggle("is-current", here);
        dot.tabIndex = here ? 0 : -1;
        if (here) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
      said.textContent = `${dots[index].textContent}, ${index + 1} of ${panels.length}`;
    };

    const onClick = (event) => {
      const dot = event.target.closest(".rm-snap-sections-dot");
      if (dot) go(dots.indexOf(dot));
    };
    const onKey = (event) => {
      const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
      if (step) { event.preventDefault(); go(clamp(at + step, 0, panels.length - 1)); return; }
      if (event.key === "Home") { event.preventDefault(); go(0); }
      if (event.key === "End") { event.preventDefault(); go(panels.length - 1); }
    };
    nav.addEventListener("click", onClick);
    nav.addEventListener("keydown", onKey);

    // Observe the panels, not only the frame. The frame is a viewport-height
    // box, so it changes size when the window does and at no other time — but a
    // panel that grows after mount, from a late image or a swapped webfont,
    // moves every offset below it without the frame moving a pixel. Watching
    // only the frame leaves the nav highlighting the wrong section for the rest
    // of the session, and an arrow key then jumps to the wrong panel.
    let watcher = null;
    if (typeof ResizeObserver === "function") {
      watcher = new ResizeObserver(() => { offsets = panels.map((panel) => panel.offsetTop); });
      watcher.observe(frame);
      panels.forEach((panel) => watcher.observe(panel));
    }

    // Tracking where you are is not an animation, so it keeps running under
    // reduced motion: what changes is that nothing scrolls smoothly.
    const read = () => {
      const at2 = frame.scrollTop + frame.clientHeight * 0.35;
      let index = 0;
      for (let i = 0; i < offsets.length; i++) if (offsets[i] <= at2) index = i;
      return index;
    };
    mark(read());
    if (typeof IntersectionObserver === "function") {
      cleanups.push(whileVisible(frame, () => onFrame(() => mark(read()))));
    }

    cleanups.push(() => {
      watcher?.disconnect();
      nav.removeEventListener("click", onClick);
      nav.removeEventListener("keydown", onKey);
      nav.remove();
      said.remove();
      panels.forEach((panel) => panel.classList.remove("rm-snap-sections-panel"));
      frame.classList.remove("rm-snap-sections", `is-${mode}`);
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A clip-path wipe tied to the scroll, not to a timer.
 *
 * `clip-path: inset()` moves on the compositor and does not touch layout, so
 * the element below the wipe never shifts by a pixel while it plays. The inset
 * is driven by position rather than by a duration, which is what stops it
 * running to a schedule that has nothing to do with where the reader actually
 * is — the failure mode of every reveal built on a transition and an
 * `is-visible` class.
 *
 * A clip is a hiding mechanism, so this is the one component here that needs a
 * guard rather than a claim. The per-frame loop only runs while the element is
 * observed on screen, and an element can pass clean through the viewport
 * between two rendering opportunities on a slow device, or be skipped entirely
 * by a jump to an anchor or a restored scroll position — with no loop left to
 * reopen the clip. A second observer therefore opens it for good the moment the
 * element is reported above the fold, whether or not the wipe ever ran. Reduced
 * motion opens it at mount, and the stylesheet never clips anything by itself.
 *
 *   <figure data-rm-scroll-mask data-rm-direction="left">…</figure>
 */
export function revealMaskScroll(target = "[data-rm-scroll-mask]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { direction = "bottom", radius = 0, start = 0.95, end = 0.5 } = options;
  const SIDES = ["bottom", "top", "left", "right"];
  const cleanups = [];

  for (const element of elements) {
    const from = pick(dataString(element, "rmDirection", direction), SIDES, direction);
    const round = dataNumber(element, "rmRadius", radius);
    const [head, foot] = band(element, start, end);
    element.classList.add("rm-scroll-mask");

    const update = (progress) => {
      const shut = ((1 - progress) * 100).toFixed(2);
      const edges = {
        bottom: `${shut}% 0 0 0`,
        top: `0 0 ${shut}% 0`,
        left: `0 ${shut}% 0 0`,
        right: `0 0 0 ${shut}%`,
      }[from];
      // At the end the clip is dropped rather than set to zero, so the element
      // stops being a clipping container and box shadows spill properly again.
      element.style.clipPath = progress >= 1
        ? ""
        : `inset(${edges}${round ? ` round ${round}px` : ""})`;
    };

    cleanups.push(drive(element, () => bandProgress(element, head, foot), update));

    // The safety net. It only ever fires once the element's bottom edge has
    // passed the top of the screen, which is long after the band would have
    // finished, so it cannot open the clip early on an ordinary scroll — it
    // only catches the element the loop never got a frame for.
    let rescue = null;
    if (typeof IntersectionObserver === "function") {
      rescue = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting && entry.boundingClientRect.bottom <= 0) update(1);
      });
      rescue.observe(element);
    }

    cleanups.push(() => {
      rescue?.disconnect();
      element.style.clipPath = "";
      element.classList.remove("rm-scroll-mask");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A strip whose speed is the scroll.
 *
 * There is no animation and no timer: the belt moves by exactly the distance
 * the page moved, multiplied by a rate, so stopping the scroll stops the strip
 * dead and reversing it sends the strip the other way. That coupling is the
 * whole effect, and it is why this cannot be done with a CSS keyframe and a
 * `animation-play-state` toggle.
 *
 * The delta comes from the strip's own box rather than from `scrollY`, which
 * means it works identically inside a nested scroller. The content is
 * duplicated once for the seam, and the duplicate is both `aria-hidden` and
 * `inert` — a marquee that reads its own contents twice, and puts a second set
 * of unreachable links in the tab order, is the usual and entirely avoidable
 * bug. Under reduced motion the belt simply sits still and readable.
 *
 *   <div data-rm-scroll-marquee data-rm-speed="1.4"><span>…</span></div>
 */
export function marqueeScroll(target = "[data-rm-scroll-marquee]", options = {}) {
  const strips = resolveElements(target);
  if (!strips.length) return () => {};

  const { speed = 1, direction = "left" } = options;
  const cleanups = [];

  for (const strip of strips) {
    const rate = dataNumber(strip, "rmSpeed", speed);
    const way = pick(dataString(strip, "rmDirection", direction), ["left", "right"], direction) === "left" ? 1 : -1;

    const kept = [...strip.childNodes];
    strip.classList.add("rm-scroll-marquee");

    const belt = document.createElement("div");
    belt.className = "rm-scroll-marquee-belt";
    const track = document.createElement("div");
    track.className = "rm-scroll-marquee-track";
    track.append(...kept);
    const echo = track.cloneNode(true);
    echo.classList.add("is-echo");
    echo.setAttribute("aria-hidden", "true");
    echo.inert = true;
    belt.append(track, echo);
    strip.appendChild(belt);

    const restore = () => {
      strip.append(...kept);
      belt.remove();
      strip.classList.remove("rm-scroll-marquee");
    };

    if (prefersReducedMotion() || typeof IntersectionObserver !== "function") {
      cleanups.push(restore);
      continue;
    }

    let width = track.offsetWidth || 1;
    let watcher = null;
    if (typeof ResizeObserver === "function") {
      watcher = new ResizeObserver(() => { width = track.offsetWidth || 1; });
      watcher.observe(track);
    }

    let offset = 0;
    let previous = null;
    belt.style.transform = "translate3d(0, 0, 0)";

    cleanups.push(whileVisible(strip, () => {
      // The reference is dropped on the way out, so the belt does not lurch by
      // the whole distance the page moved while the strip was off screen.
      previous = null;
      return onFrame(() => {
        const top = strip.getBoundingClientRect().top;
        if (previous !== null) {
          offset = (offset + (previous - top) * rate * way) % width;
          if (offset < 0) offset += width;
          belt.style.transform = `translate3d(${-offset.toFixed(2)}px, 0, 0)`;
        }
        previous = top;
      });
    }));

    cleanups.push(() => {
      watcher?.disconnect();
      restore();
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A gradient that turns and crossfades as you descend.
 *
 * Two oversized gradient layers, one on top of the other, rotated by transform
 * and crossfaded by opacity. Both are compositor properties, so the effect
 * costs nothing per frame. The obvious implementation animates
 * `background-position` or the gradient's own angle, and both of those repaint
 * the entire painted area every single frame — on a full-bleed section that is
 * the most expensive thing on the page.
 *
 * The layers are `aria-hidden` decoration inserted as the first children, and
 * the section is given a stacking context in the stylesheet so real content
 * still sits above them without anybody having to set a z-index by hand.
 *
 *   <section data-rm-scroll-gradient data-rm-from="#e8623c" data-rm-to="#1b3a2f">…</section>
 */
export function scrollGradient(target = "[data-rm-scroll-gradient]", options = {}) {
  const sections = resolveElements(target);
  if (!sections.length) return () => {};

  const { from = "", to = "", angle = 0, turns = 60 } = options;
  const cleanups = [];

  for (const section of sections) {
    const head = dataNumber(section, "rmAngle", angle);
    const sweep = dataNumber(section, "rmTurns", turns);
    const first = dataString(section, "rmFrom", from);
    const second = dataString(section, "rmTo", to);

    section.classList.add("rm-scroll-gradient");
    const layers = ["a", "b"].map((which, i) => {
      const layer = document.createElement("i");
      layer.className = `rm-scroll-gradient-layer is-${which}`;
      layer.setAttribute("aria-hidden", "true");
      // A colour given in the markup wins; otherwise the stylesheet's tokens do.
      const colour = i === 0 ? first : second;
      if (colour) layer.style.setProperty("--rm-scroll-gradient-tint", colour);
      return layer;
    });
    section.prepend(...layers);

    const update = (progress) => {
      const turn = head + sweep * progress;
      layers[0].style.transform = `rotate(${turn.toFixed(2)}deg)`;
      layers[1].style.transform = `rotate(${(turn * -0.6).toFixed(2)}deg)`;
      layers[1].style.opacity = progress.toFixed(3);
    };

    cleanups.push(drive(section, () => pinProgress(section), update));
    cleanups.push(() => {
      layers.forEach((layer) => layer.remove());
      section.classList.remove("rm-scroll-gradient");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Two halves that part to show what is behind them.
 *
 * The first two children slide apart by a percentage of their own size, which
 * is a transform and therefore free; the third child onwards is whatever the
 * parting reveals and is never touched. Doing this with `width` or with a
 * negative margin would relayout the page on every frame and would fight any
 * text inside the halves, which would reflow line by line as they moved.
 *
 * The halves end fully apart, so the reduced-motion state is open with the
 * content behind it plainly visible. The failure to avoid is the one where the
 * finished state is closed and the revealed content is only ever seen mid
 * scroll.
 *
 *   <section data-rm-scroll-split><div>…</div><div>…</div><p>Behind</p></section>
 */
export function scrollSplit(target = "[data-rm-scroll-split]", options = {}) {
  const sections = resolveElements(target);
  if (!sections.length) return () => {};

  const { travel = 55, axis = "x", start = 0.85, end = 0.2 } = options;
  const cleanups = [];

  for (const section of sections) {
    const halves = [...section.children].slice(0, 2);
    if (halves.length < 2) continue;

    const reach = dataNumber(section, "rmTravel", travel);
    const way = pick(dataString(section, "rmAxis", axis), ["x", "y"], axis);
    const [head, foot] = band(section, start, end);

    // The axis has to reach the stylesheet as well as the transform, because
    // "part vertically" means the halves are stacked in the grid to begin with.
    // Moving two side-by-side columns up and down is not a vertical split; it
    // is a horizontal one sliding the wrong way.
    section.classList.add("rm-scroll-split", `is-${way}`);
    halves.forEach((half, i) => half.classList.add("rm-scroll-split-half", i === 0 ? "is-first" : "is-second"));

    const update = (progress) => {
      const move = reach * progress;
      halves.forEach((half, i) => {
        const sign = i === 0 ? -1 : 1;
        half.style.transform = way === "x"
          ? `translate3d(${(move * sign).toFixed(2)}%, 0, 0)`
          : `translate3d(0, ${(move * sign).toFixed(2)}%, 0)`;
      });
    };

    cleanups.push(drive(section, () => bandProgress(section, head, foot), update));
    cleanups.push(() => {
      halves.forEach((half) => {
        half.style.transform = "";
        half.classList.remove("rm-scroll-split-half", "is-first", "is-second");
      });
      section.classList.remove("rm-scroll-split", "is-x", "is-y");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A pinned figure that settles out of an over-scale.
 *
 * The section is tall, the frame inside it is sticky, and the artwork starts
 * larger than its frame and comes to rest at its natural size as the section
 * passes. Ending at scale 1 rather than at a zoomed-in state matters: the last
 * frame of the effect is also the state a visitor sits and looks at, and it
 * should be the composition the designer actually chose.
 *
 * The pin is `position: sticky`, so the page is never hijacked and no
 * placeholder has to be maintained to stop the layout collapsing — which is
 * what a `position: fixed` implementation spends most of its code doing, and
 * what it always gets wrong on a resize.
 *
 *   <section data-rm-scroll-zoom><div><img src="…" alt="…"></div></section>
 */
export function scrollZoomPin(target = "[data-rm-scroll-zoom]", options = {}) {
  const sections = resolveElements(target);
  if (!sections.length) return () => {};

  const { from = 1.35, travel = 160 } = options;
  const cleanups = [];

  for (const section of sections) {
    const frame = section.firstElementChild;
    if (!frame) continue;
    const art = frame.firstElementChild ?? frame;

    const biggest = Math.max(1, dataNumber(section, "rmFrom", from));
    section.classList.add("rm-scroll-zoom");
    section.style.setProperty("--rm-scroll-zoom-travel", `${dataNumber(section, "rmTravel", travel)}vh`);
    frame.classList.add("rm-scroll-zoom-frame");
    art.classList.add("rm-scroll-zoom-art");

    const update = (progress) => {
      art.style.transform = `scale(${lerp(biggest, 1, progress).toFixed(4)})`;
    };

    cleanups.push(drive(section, () => pinProgress(section), update));
    cleanups.push(() => {
      art.style.transform = "";
      art.classList.remove("rm-scroll-zoom-art");
      frame.classList.remove("rm-scroll-zoom-frame");
      section.style.removeProperty("--rm-scroll-zoom-travel");
      section.classList.remove("rm-scroll-zoom");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A headline that shrinks into its line without reflowing.
 *
 * Type that changes size on scroll is nearly always built by animating
 * `font-size`, and that is a layout pass per frame across the entire document
 * below it: the lines rebreak, the page height changes, and on a long page the
 * scroll position itself drifts under the reader. This does it with a
 * transform, so the element keeps exactly the box it was laid out in and only
 * the painted glyphs change size.
 *
 * It scales down to 1 rather than up from it, so the resting state is the
 * element at its typeset size and the overflow only ever happens while the
 * effect is running — which is also why the origin defaults to the left edge,
 * where the text is anchored in a left-aligned column.
 *
 *   <h2 data-rm-scroll-type data-rm-from="1.3">A larger idea</h2>
 */
export function scrollTypeScale(target = "[data-rm-scroll-type]", options = {}) {
  const headings = resolveElements(target);
  if (!headings.length) return () => {};

  const { from = 1.25, origin = "left", start = 1, end = 0.4 } = options;
  const ORIGINS = { left: "left center", centre: "center", center: "center", right: "right center" };
  const cleanups = [];

  for (const heading of headings) {
    const biggest = Math.max(0.25, dataNumber(heading, "rmFrom", from));
    const anchor = ORIGINS[dataString(heading, "rmOrigin", origin)] ?? ORIGINS[origin];
    const [head, foot] = band(heading, start, end);

    heading.classList.add("rm-scroll-type");
    heading.style.transformOrigin = anchor;

    const update = (progress) => {
      heading.style.transform = `scale(${lerp(biggest, 1, progress).toFixed(4)})`;
    };

    cleanups.push(drive(heading, () => bandProgress(heading, head, foot), update));
    cleanups.push(() => {
      heading.style.transform = "";
      heading.style.transformOrigin = "";
      heading.classList.remove("rm-scroll-type");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}
