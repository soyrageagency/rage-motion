/**
 * Showpiece backgrounds and entrances.
 *
 *   • bubbleField()  — bubbles rising with real buoyancy.
 *   • fireworks()    — shells that burst on click and on an interval.
 *   • gravityStars() — a star field that leans toward the pointer.
 *   • holeTunnel()   — rings receding to a vanishing point, driven by scroll.
 *   • radialIntro()  — a circle opening over content that is already there.
 *   • lightRays()    — god rays from a source off the edge of the panel.
 *   • prismSplit()   — a chromatic split on the edges of a panel.
 *   • driftShapes()  — a few large soft shapes on slow paths.
 *   • noiseWave()    — a horizon deformed by a seeded noise function.
 *   • linkWeb()      — points joined when they come within range.
 *   • ripplePool()   — expanding rings where the pointer has been.
 *   • glowOrbs()     — soft orbs whose light overlaps additively.
 *
 * These are the loud ones, which makes the performance rule the first rule
 * rather than a footnote. A field of things is either one canvas or one painted
 * layer; it is never one DOM node per particle. A hundred spans each carrying
 * its own animation is the version that looks fine on the machine it was built
 * on and stutters on a phone, because the browser has to composite a hundred
 * layers and style-recalculate a hundred subtrees every frame. Five of these
 * twelve paint on a single canvas, five are one layer of gradients handed to
 * the compositor, one is a single SVG path, and one is a clip-path on the
 * element it reveals. Nothing here holds a node per point.
 *
 * The second rule is that none of it runs off screen. Every per-frame
 * component is wrapped in `whileVisible`, so a decorative field in a section
 * nobody has scrolled to costs nothing at all — a battery spent painting
 * bubbles two screens below the fold is a battery spent on nothing.
 *
 * The third is that the entrance is the only one carrying content, and it is
 * the only one that behaves differently under reduced motion: it jumps to the
 * finished, unclipped state. The other eleven are ornament, so they either
 * hold one still frame (the fields, which are a texture text sits on and would
 * be missed if they vanished) or stop entirely (the bursts and the ripples,
 * where a frozen frame is a smudge).
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import {
  animate, clamp, dataNumber, dataString, EASE, lerp, onFrame, prefersReducedMotion,
  resolveElements, watch, whileVisible,
} from "../core/motion.js";

const SVG = "http://www.w3.org/2000/svg";

/**
 * Deterministic pseudo-random.
 *
 * A field laid out with `Math.random()` is a different field on every reload,
 * which makes it impossible to judge a composition and impossible to reproduce
 * a complaint about one. Seeded, the same panel always draws the same sky.
 */
function seeded(seed) {
  let value = Math.abs(Math.trunc(seed)) % 2147483647 || 1;
  return () => {
    value = (value * 1103515245 + 12345) % 2147483648;
    return value / 2147483648;
  };
}

/** An `aria-hidden` painted layer behind an element's own content. */
function layerFor(element, className, still) {
  element.classList.add(`${className}-host`);
  const layer = document.createElement("div");
  layer.className = className;
  layer.setAttribute("aria-hidden", "true");
  if (still) layer.classList.add("is-still");
  element.prepend(layer);
  return layer;
}

/**
 * A canvas sized to its host, at a sane pixel ratio.
 *
 * The device pixel ratio is capped at 2 on purpose. A phone reporting 3 would
 * otherwise ask for nine times the pixels of a CSS-pixel canvas, for a field
 * of soft shapes nobody is going to inspect at 100% — that is the single
 * easiest way to turn a decorative background into a dropped frame.
 *
 * A `ResizeObserver` rather than a window resize listener, because a panel can
 * change size without the window doing anything: a sidebar opening, a font
 * arriving, a grid track reflowing.
 */
function surface(element, className) {
  element.classList.add(`${className}-host`);
  const canvas = document.createElement("canvas");
  canvas.className = className;
  canvas.setAttribute("aria-hidden", "true");
  element.prepend(canvas);
  const ctx = canvas.getContext("2d");

  let width = 1;
  let height = 1;
  const fit = () => {
    const box = element.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    width = Math.max(1, box.width);
    height = Math.max(1, box.height);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    // Draw in CSS pixels; the transform does the scaling once, so no maths
    // downstream has to know about the ratio.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  fit();

  const resizeObserver = new ResizeObserver(fit);
  resizeObserver.observe(element);

  return {
    canvas,
    ctx,
    fit,
    get width() { return width; },
    get height() { return height; },
    stop() {
      resizeObserver.disconnect();
      canvas.remove();
      element.classList.remove(`${className}-host`);
    },
  };
}

/**
 * A comma-separated colour list.
 *
 * Split on every comma and `rgba(42,167,228,0.85)` becomes four colours, none
 * of them valid — the field then paints nothing at all and the cause is three
 * files away from the symptom. So the split only counts commas at depth zero,
 * which leaves the ones inside a function alone.
 *
 * An empty or unusable list falls back to the default rather than drawing
 * nothing.
 */
function palette(raw, fallback) {
  const parts = [];
  let depth = 0;
  let current = "";
  for (const letter of String(raw)) {
    if (letter === "(") depth += 1;
    else if (letter === ")") depth = Math.max(0, depth - 1);
    else if (letter === "," && depth === 0) { parts.push(current); current = ""; continue; }
    current += letter;
  }
  parts.push(current);
  const colours = parts.map((one) => one.trim()).filter(Boolean);
  return colours.length ? colours : fallback;
}

/**
 * A `"50% 30%"` point, as fractions.
 *
 * Anything that is not two readable numbers falls back to the default, so a
 * typo in the markup gives you the designed composition rather than a field
 * collapsed into the top-left corner.
 */
function point(raw, fallbackX, fallbackY) {
  const parts = String(raw).trim().split(/\s+/);
  if (parts.length !== 2) return { x: fallbackX, y: fallbackY };
  const read = (text, fallback) => {
    const value = parseFloat(text);
    return Number.isFinite(value) ? value / 100 : fallback;
  };
  return { x: read(parts[0], fallbackX), y: read(parts[1], fallbackY) };
}

/** Pointer position inside an element, in CSS pixels, plus whether it is in. */
function pointerWithin(element, onUpdate) {
  const onMove = (event) => {
    const box = element.getBoundingClientRect();
    onUpdate(event.clientX - box.left, event.clientY - box.top, true);
  };
  const onLeave = () => onUpdate(0, 0, false);
  element.addEventListener("pointermove", onMove, { passive: true });
  element.addEventListener("pointerleave", onLeave);
  return () => {
    element.removeEventListener("pointermove", onMove);
    element.removeEventListener("pointerleave", onLeave);
  };
}

/**
 * Bubbles rising with real buoyancy, on one canvas.
 *
 * The physics is the whole component. A bubble's rise speed comes from its
 * radius — drag grows with surface area while buoyancy grows with volume, so
 * in water the big ones go up faster — and its horizontal wander is inversely
 * proportional to radius, because a large bubble has too much momentum to be
 * pushed about by the little eddies that throw a small one around. Give every
 * bubble the same speed and the same wobble and you get falling snow played
 * backwards, which is the version everyone recognises as fake without being
 * able to say why.
 *
 * Positions are kept as fractions of the box and converted to pixels at paint
 * time, so a panel that changes size keeps its field instead of dumping every
 * bubble outside the new bounds.
 *
 *   <section data-rm-bubble-field data-rm-many="34">…</section>
 */
export function bubbleField(target = "[data-rm-bubble-field]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { count = 26, size = 26, speed = 1, color = "rgba(255,255,255,0.5)" } = options;
  const cleanups = [];

  for (const element of elements) {
    const many = Math.round(clamp(dataNumber(element, "rmMany", count), 3, 80));
    const largest = clamp(dataNumber(element, "rmSize", size), 6, 90);
    const rate = clamp(dataNumber(element, "rmSpeed", speed), 0.1, 4);
    const tint = dataString(element, "rmColor", color);

    const view = surface(element, "rm-bubble-field");
    const { ctx } = view;
    const random = seeded(many * 7919 + 13);

    const bubbles = Array.from({ length: many }, () => {
      // Skewed toward the small end: a tank of identically sized bubbles is
      // the other thing that gives the trick away.
      const grade = random() ** 1.7;
      const radius = 2.5 + grade * largest;
      return {
        x: random(),
        y: random(),
        radius,
        // Pixels per second, converted to a fraction of the height at paint.
        rise: (16 + radius * 2.2) * rate,
        // Pixels of sideways wander: small bubbles get thrown about, big ones
        // barely notice.
        wobble: 30 / (3 + radius),
        phase: random() * Math.PI * 2,
        pace: 0.4 + random() * 0.8,
      };
    });

    const paint = (step, time) => {
      const { width, height } = view;
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1;

      for (const bubble of bubbles) {
        bubble.y -= (bubble.rise * step) / height;
        if (bubble.y < -0.1) {
          bubble.y = 1.1;
          bubble.x = random();
        }
        const x = bubble.x * width + Math.sin(time * 0.001 * bubble.pace + bubble.phase) * bubble.wobble;
        const y = bubble.y * height;

        ctx.globalAlpha = clamp(0.9 - bubble.radius / (largest * 1.6), 0.18, 0.9);
        ctx.strokeStyle = tint;
        ctx.beginPath();
        ctx.arc(x, y, bubble.radius, 0, Math.PI * 2);
        ctx.stroke();

        // One highlight, up and to the left, which is what makes a ring read
        // as a sphere rather than a circle.
        ctx.globalAlpha *= 0.8;
        ctx.fillStyle = tint;
        ctx.beginPath();
        ctx.arc(x - bubble.radius * 0.34, y - bubble.radius * 0.34, Math.max(0.6, bubble.radius * 0.2), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    if (prefersReducedMotion()) {
      // Ornament, but ornament text sits on: one still frame keeps the panel
      // looking designed instead of suddenly empty.
      paint(0, 0);
      cleanups.push(() => view.stop());
      continue;
    }

    const stop = whileVisible(element, () => {
      let last = performance.now();
      return onFrame((now) => {
        // Clamped, because a tab returning from the background hands you a
        // gap of several seconds and every bubble would teleport.
        const step = Math.min(0.05, (now - last) / 1000);
        last = now;
        paint(step, now);
      });
    });

    cleanups.push(() => { stop(); view.stop(); });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Shells that burst on click and on an interval, on one canvas.
 *
 * Every spark is a point with a velocity, gravity pulling it down and drag
 * taking its speed away — which is why the burst is a sphere that turns into a
 * weeping willow instead of an expanding ring that stops. Drag is applied as a
 * per-second factor raised to the frame time, not multiplied once per frame,
 * so the shape of a burst does not change with the frame rate.
 *
 * Sparks are drawn additively as short segments from where each was to where
 * it is now. That gives motion blur and overlapping brightness for free; the
 * usual dot-per-spark version needs three times as many particles to look like
 * anything, and that is where the frame budget goes.
 *
 * The whole thing is one canvas with a hard cap on live sparks, because a
 * visitor who discovers that clicking launches a shell will click twenty times
 * in four seconds and the panel must not care.
 *
 *   <section data-rm-fireworks data-rm-every="2400">…</section>
 */
export function fireworks(target = "[data-rm-fireworks]", options = {}) {
  const elements = resolveElements(target);
  // Pure ornament with nothing to preserve. A frozen burst is a smudge, so
  // under reduced motion there is simply no firework.
  if (!elements.length || prefersReducedMotion()) return () => {};

  const {
    count = 48, every = 2600, gravity = 52, drag = 0.55,
    color = "#f4d738,#2aa7e4,#d28c65,#f1eee9",
  } = options;
  const LIMIT = 900;
  const cleanups = [];

  for (const element of elements) {
    const many = Math.round(clamp(dataNumber(element, "rmMany", count), 8, 160));
    const beat = Math.max(0, dataNumber(element, "rmEvery", every));
    const pull = clamp(dataNumber(element, "rmGravity", gravity), 0, 400);
    const slow = clamp(dataNumber(element, "rmFriction", drag), 0, 0.98);
    const colours = palette(dataString(element, "rmColor", color), ["#f4d738"]);

    const view = surface(element, "rm-fireworks");
    const { ctx } = view;
    const random = seeded(many * 104729 + 17);
    let sparks = [];

    const burst = (x, y) => {
      const tint = colours[Math.floor(random() * colours.length) % colours.length];
      const reach = 90 + random() * 140;
      for (let i = 0; i < many && sparks.length < LIMIT; i++) {
        // Even angles with a jitter: pure randomness clumps, and a clumped
        // shell reads as a splatter rather than a burst.
        const angle = (i / many) * Math.PI * 2 + random() * 0.24;
        const power = reach * (0.45 + random() * 0.55);
        sparks.push({
          x, y, px: x, py: y,
          vx: Math.cos(angle) * power,
          vy: Math.sin(angle) * power,
          life: 0,
          span: 0.9 + random() * 0.9,
          tint,
        });
      }
    };

    const paint = (step) => {
      const { width, height } = view;
      ctx.clearRect(0, 0, width, height);
      // Additive, so two sparks crossing are brighter than either — the thing
      // that makes a firework look like light rather than paint.
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";

      const keep = [];
      for (const spark of sparks) {
        spark.life += step;
        if (spark.life > spark.span) continue;

        const kept = (1 - slow) ** step;
        spark.vx *= kept;
        spark.vy = spark.vy * kept + pull * step;
        spark.px = spark.x;
        spark.py = spark.y;
        spark.x += spark.vx * step;
        spark.y += spark.vy * step;

        const fade = 1 - spark.life / spark.span;
        ctx.globalAlpha = fade * fade;
        ctx.strokeStyle = spark.tint;
        ctx.lineWidth = 1 + fade;
        ctx.beginPath();
        ctx.moveTo(spark.px, spark.py);
        ctx.lineTo(spark.x, spark.y);
        ctx.stroke();
        keep.push(spark);
      }
      sparks = keep;

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    // The canvas never takes the pointer, so this listens on the host: a click
    // that lands on a button inside the panel still reaches the button, and
    // nothing here calls preventDefault.
    const onDown = (event) => {
      const box = element.getBoundingClientRect();
      burst(event.clientX - box.left, event.clientY - box.top);
    };
    element.addEventListener("pointerdown", onDown);

    const stop = whileVisible(element, () => {
      let last = performance.now();
      const frame = onFrame((now) => {
        const step = Math.min(0.05, (now - last) / 1000);
        last = now;
        paint(step);
      });
      // A shell on arrival, then on the interval, and only while the section
      // is on screen — an unseen panel launches nothing.
      const shell = () => burst(view.width * (0.2 + random() * 0.6), view.height * (0.15 + random() * 0.4));
      shell();
      const timer = beat > 0 ? setInterval(shell, beat) : 0;
      return () => { frame(); clearInterval(timer); };
    });

    cleanups.push(() => {
      stop();
      element.removeEventListener("pointerdown", onDown);
      sparks = [];
      view.stop();
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A star field that leans toward the pointer.
 *
 * Every star has a home and is pulled from it toward the pointer by an amount
 * that falls off with the square of the distance, capped well below 1 so it
 * can never arrive. That cap is the difference between a field that deforms —
 * which is what gravity looks like — and a swarm that follows the mouse, which
 * is what happens when the pull is unbounded and every star ends up in a knot
 * under the cursor.
 *
 * The pointer itself is eased toward its target and its influence fades in and
 * out, so entering and leaving the panel are not two discontinuities. Stars
 * twinkle on their own phase, which stops the field reading as a flat texture.
 *
 *   <section data-rm-gravity-stars data-rm-pull="0.34">…</section>
 */
export function gravityStars(target = "[data-rm-gravity-stars]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { count = 90, size = 1.6, radius = 260, pull = 0.3, color = "#f1eee9" } = options;
  const cleanups = [];

  for (const element of elements) {
    const many = Math.round(clamp(dataNumber(element, "rmMany", count), 8, 400));
    const scale = clamp(dataNumber(element, "rmSize", size), 0.4, 6);
    const reach = clamp(dataNumber(element, "rmRadius", radius), 40, 1200);
    const force = clamp(dataNumber(element, "rmPull", pull), 0, 0.6);
    const tint = dataString(element, "rmColor", color);

    const view = surface(element, "rm-gravity-stars");
    const { ctx } = view;
    const random = seeded(many * 6151 + 29);
    const stars = Array.from({ length: many }, () => ({
      x: random(),
      y: random(),
      radius: scale * (0.4 + random() ** 2 * 1.6),
      phase: random() * Math.PI * 2,
      pace: 0.6 + random() * 1.4,
    }));

    const aim = { x: 0, y: 0, on: 0 };
    const at = { x: 0, y: 0, on: 0 };
    const stopPointer = pointerWithin(element, (x, y, inside) => {
      if (inside) { aim.x = x; aim.y = y; }
      aim.on = inside ? 1 : 0;
    });

    const paint = (time, live) => {
      const { width, height } = view;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = tint;

      if (live) {
        at.x = lerp(at.x, aim.x, 0.18);
        at.y = lerp(at.y, aim.y, 0.18);
        at.on = lerp(at.on, aim.on, 0.07);
      }

      for (const star of stars) {
        const homeX = star.x * width;
        const homeY = star.y * height;
        let x = homeX;
        let y = homeY;

        if (at.on > 0.01) {
          const dx = at.x - homeX;
          const dy = at.y - homeY;
          // Squared falloff, and never more than the cap: the field bends
          // toward the pointer, it does not collapse into it.
          const grip = (force * at.on) / (1 + (dx * dx + dy * dy) / (reach * reach));
          x += dx * grip;
          y += dy * grip;
        }

        const twinkle = live ? 0.55 + 0.45 * Math.sin(time * 0.001 * star.pace + star.phase) : 0.8;
        ctx.globalAlpha = twinkle;
        ctx.beginPath();
        ctx.arc(x, y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    if (prefersReducedMotion()) {
      stopPointer();
      paint(0, false);
      cleanups.push(() => view.stop());
      continue;
    }

    const stop = whileVisible(element, () => onFrame((now) => paint(now, true)));

    cleanups.push(() => { stop(); stopPointer(); view.stop(); });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Rings receding to a vanishing point, driven by scroll.
 *
 * Depth is the only idea here: ring radius grows as a power of how near the
 * ring is, so the gaps between rings open up as they come toward you and close
 * to nothing at the vanishing point. Space them evenly and you get a target,
 * not a tunnel — even spacing is exactly the cue the eye uses to decide a thing
 * is flat.
 *
 * Scroll supplies the depth, read once per frame from the element's own box
 * rather than from a scroll event. Scroll events fire faster than frames and
 * every one of them would be a layout read; one read per frame inside the
 * shared loop is the same information at a tenth of the cost, and it stops
 * completely when the panel leaves the screen.
 *
 *   <section data-rm-hole-tunnel data-rm-origin="50% 42%">…</section>
 */
export function holeTunnel(target = "[data-rm-hole-tunnel]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { count = 18, depth = 2.4, origin = "50% 45%", color = "rgba(42,167,228,0.55)" } = options;
  const cleanups = [];

  for (const element of elements) {
    const many = Math.round(clamp(dataNumber(element, "rmMany", count), 4, 60));
    const turns = clamp(dataNumber(element, "rmDepth", depth), 0.2, 12);
    const eye = point(dataString(element, "rmOrigin", origin), 0.5, 0.45);
    const tint = dataString(element, "rmColor", color);

    const view = surface(element, "rm-hole-tunnel");
    const { ctx } = view;

    const paint = (progress) => {
      const { width, height } = view;
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = tint;

      const cx = width * eye.x;
      const cy = height * eye.y;
      // Far enough to clear the corner furthest from the vanishing point, or
      // the outermost ring stops short of the edge and the illusion ends in a
      // visible circle.
      const far = Math.hypot(Math.max(cx, width - cx), Math.max(cy, height - cy)) * 1.15;

      for (let i = 0; i < many; i++) {
        const z = ((i / many) + progress) % 1;
        const radius = far * z ** 2.7;
        if (radius < 0.6) continue;
        // Bright in the middle distance, fading into the vanishing point and
        // again as it passes the frame.
        ctx.globalAlpha = Math.sin(z * Math.PI) ** 0.7;
        ctx.lineWidth = 0.6 + z * 2.4;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    // How far through its own pass across the viewport the panel is: 0 as its
    // top edge enters from below, 1 as its bottom edge leaves at the top.
    const progressNow = () => {
      const box = element.getBoundingClientRect();
      const view0 = innerHeight || 1;
      return clamp((view0 - box.top) / (view0 + box.height));
    };

    if (prefersReducedMotion()) {
      paint(progressNow() * turns);
      cleanups.push(() => view.stop());
      continue;
    }

    const stop = whileVisible(element, () => {
      let drawn = -1;
      return onFrame(() => {
        const at = progressNow() * turns;
        // Nothing moved enough to see: skip the paint entirely.
        if (Math.abs(at - drawn) < 0.0004) return;
        drawn = at;
        paint(at);
      });
    });

    cleanups.push(() => { stop(); view.stop(); });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A circle opening over content that is already there.
 *
 * The content is never faded in. It is laid out, painted and readable from the
 * first frame, and the entrance is a `clip-path` circle growing from a point
 * you choose — so a script that fails, a browser without `clip-path` and a
 * visitor who has asked for less movement all see a finished panel rather than
 * a blank one. That is the whole argument for doing it this way instead of the
 * usual opacity ramp, which needs the content to start invisible and therefore
 * has a failure mode where it stays that way.
 *
 * The clip is removed the moment it finishes. A `clip-path` left on an element
 * for the life of the page is a trap: anything that later overflows it — a
 * dropdown, a tooltip, a focus ring — is silently cut off, and the cause is
 * three components away from the symptom.
 *
 *   <section data-rm-radial-intro data-rm-origin="20% 80%">…</section>
 */
export function radialIntro(target = "[data-rm-radial-intro]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { duration = 1000, delay = 0, origin = "50% 50%" } = options;
  const cleanups = [];

  for (const element of elements) {
    const where = dataString(element, "rmOrigin", origin);
    const spot = point(where, 0.5, 0.5);
    const at = `${(spot.x * 100).toFixed(1)}% ${(spot.y * 100).toFixed(1)}%`;
    const span = Math.max(0, dataNumber(element, "rmDuration", duration));
    const wait = Math.max(0, dataNumber(element, "rmDelay", delay));

    element.classList.add("rm-radial-intro");

    let playing = null;
    const play = () => {
      const run = animate(
        element,
        [{ clipPath: `circle(0% at ${at})` }, { clipPath: `circle(141% at ${at})` }],
        { duration: span, delay: wait, easing: EASE.out, fill: "both" },
      );
      // `animate` returns null under reduced motion, having already written
      // the finished state — which for this component means fully open.
      if (!run) { element.style.clipPath = ""; return; }
      playing = run;
      const clear = () => { element.style.clipPath = ""; };
      run.finished.then(clear, clear);
    };

    // Already on screen when the script runs? Then it is an entrance and it
    // plays now. Below the fold it waits, because a reveal that finished
    // before you arrived is a reveal nobody saw — and `watch` guarantees the
    // panel is revealed even when the observer never fires.
    const box = element.getBoundingClientRect();
    const seen = box.top < (innerHeight || 0) && box.bottom > 0;
    let stop = () => {};
    if (seen) play();
    else stop = watch(element, play, { threshold: 0.2, once: true });

    cleanups.push(() => {
      stop();
      // Only the animation this component started. Cancelling everything on
      // the element would take an author's own keyframes with it.
      playing?.cancel();
      element.style.clipPath = "";
      element.classList.remove("rm-radial-intro");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * God rays from a source off the edge of the panel.
 *
 * One element, one `repeating-conic-gradient` from the source point, one mask
 * that fades the rays out with distance, and a slow rotation about that same
 * point. The gradient is the trick: a conic repeat gives you every ray at once
 * as a single paint, where a shaft-per-ray build is a dozen skewed divs each
 * with its own blur and its own layer.
 *
 * The source sits outside the box, which is what makes the light feel like it
 * comes from somewhere rather than from the middle of the panel, and only
 * `transform` and `opacity` are animated, so the whole effect lives on the
 * compositor and never repaints.
 *
 *   <section data-rm-light-rays data-rm-origin="18% -20%">…</section>
 */
export function lightRays(target = "[data-rm-light-rays]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const {
    count = 16, spread = 1.4, angle = 0, speed = 26000, origin = "50% -14%",
    color = "rgba(255,255,255,0.3)",
  } = options;
  const cleanups = [];

  for (const element of elements) {
    const still = prefersReducedMotion();
    const layer = layerFor(element, "rm-light-rays", still);

    const many = Math.round(clamp(dataNumber(element, "rmMany", count), 3, 60));
    const thick = clamp(dataNumber(element, "rmSpread", spread), 0.1, 6);
    const spot = point(dataString(element, "rmOrigin", origin), 0.5, -0.14);
    const step = 360 / many;

    const fan = document.createElement("i");
    fan.className = "rm-light-rays-fan";
    // A hard-edged repeat, softened once by a static blur in the stylesheet.
    // Blurring per frame would be a filter recalculated every frame; blurring
    // once and then only rotating is a texture the compositor moves for free.
    fan.style.background =
      `repeating-conic-gradient(from 0deg at ${(spot.x * 100).toFixed(1)}% ${(spot.y * 100).toFixed(1)}%, ` +
      `transparent 0deg, ${dataString(element, "rmColor", color)} ${(step * 0.04 * thick).toFixed(3)}deg, ` +
      `transparent ${(step * 0.42).toFixed(3)}deg, transparent ${step.toFixed(3)}deg)`;
    fan.style.setProperty("--rm-rays-x", `${(spot.x * 100).toFixed(1)}%`);
    fan.style.setProperty("--rm-rays-y", `${(spot.y * 100).toFixed(1)}%`);
    fan.style.setProperty("--rm-rays-tilt", `${dataNumber(element, "rmAngle", angle)}deg`);
    fan.style.setProperty("--rm-rays-speed", `${Math.max(1000, dataNumber(element, "rmSpeed", speed))}ms`);
    layer.appendChild(fan);

    const glow = document.createElement("i");
    glow.className = "rm-light-rays-glow";
    glow.style.setProperty("--rm-rays-x", `${(spot.x * 100).toFixed(1)}%`);
    glow.style.setProperty("--rm-rays-y", `${(spot.y * 100).toFixed(1)}%`);
    layer.appendChild(glow);

    cleanups.push(() => {
      layer.remove();
      element.classList.remove("rm-light-rays-host");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A chromatic split on the edges of a panel.
 *
 * Two copies of the panel's own edge, offset in opposite directions along an
 * angle you choose, blended additively — which is exactly what a lens does
 * when its colour channels disagree, and it costs two painted borders.
 *
 * What it deliberately does not do is copy the content. The obvious build
 * clones the panel twice and tints each clone, which paints everything inside
 * three times, duplicates every string for assistive technology and doubles
 * the cost of anything animating within. The fringe only ever appears at the
 * edges anyway, so the edge is the only thing worth copying. A filter chain is
 * the other tempting route, and a chain of two offsets plus a blend is a new
 * raster of the whole subtree on every frame it changes.
 *
 * Hover and focus both widen the split — focus, because a keyboard visitor
 * reaching the panel deserves the same answer as a pointer arriving on it.
 *
 *   <article data-rm-prism-split data-rm-shift="4">…</article>
 */
export function prismSplit(target = "[data-rm-prism-split]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const {
    shift = 3, angle = 12, blend = "plus-lighter", width = 1.5,
    color = "rgba(42,167,228,0.85),rgba(210,140,101,0.85)",
  } = options;
  const BLENDS = ["plus-lighter", "screen", "difference", "exclusion", "normal"];
  const cleanups = [];

  for (const element of elements) {
    const still = prefersReducedMotion();
    const layer = layerFor(element, "rm-prism-split", still);

    const distance = clamp(dataNumber(element, "rmShift", shift), 0, 24);
    const heading = (dataNumber(element, "rmAngle", angle) * Math.PI) / 180;
    // An unrecognised blend falls back to the default rather than being passed
    // through to CSS, where a typo silently means `normal` and the whole
    // effect quietly turns into two coloured borders.
    const asked = dataString(element, "rmBlend", blend);
    const mode = BLENDS.includes(asked) ? asked : blend;
    const [first, second] = palette(dataString(element, "rmColor", color), ["rgba(42,167,228,0.85)", "rgba(210,140,101,0.85)"]);

    layer.style.setProperty("--rm-prism-dx", `${(Math.cos(heading) * distance).toFixed(2)}px`);
    layer.style.setProperty("--rm-prism-dy", `${(Math.sin(heading) * distance).toFixed(2)}px`);
    layer.style.setProperty("--rm-prism-blend", mode);
    layer.style.setProperty("--rm-prism-width", `${clamp(dataNumber(element, "rmSize", width), 0.5, 8)}px`);

    for (const [name, tint] of [["is-a", first], ["is-b", second ?? first]]) {
      const ghost = document.createElement("i");
      ghost.className = `rm-prism-split-ghost ${name}`;
      ghost.style.setProperty("--rm-prism-tint", tint);
      layer.appendChild(ghost);
    }

    cleanups.push(() => {
      layer.remove();
      element.classList.remove("rm-prism-split-host");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A few large soft shapes on slow paths — the quiet background.
 *
 * Four or five blurred blobs, one layer, no canvas and no per-frame
 * JavaScript. Each shape gets its own waypoints, scales and timing written as
 * custom properties, and they all share a single keyframe rule that reads
 * those properties — so ten shapes are one animation definition with ten
 * parameter sets rather than ten sets of keyframes for the style engine to
 * hold.
 *
 * The blur is applied once, statically. Animating a blur radius is the classic
 * way to make a soft background expensive: every frame is a fresh
 * gaussian pass over a large surface, and it is the one property here that
 * cannot be composited.
 *
 *   <section data-rm-drift-shapes data-rm-many="4">…</section>
 */
export function driftShapes(target = "[data-rm-drift-shapes]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const {
    count = 4, size = 46, speed = 34000, soft = 60,
    color = "rgba(210,140,101,0.5),rgba(42,167,228,0.42),rgba(244,215,56,0.34)",
  } = options;
  const cleanups = [];

  for (const element of elements) {
    const still = prefersReducedMotion();
    const layer = layerFor(element, "rm-drift-shapes", still);

    const many = Math.round(clamp(dataNumber(element, "rmMany", count), 1, 10));
    const span = clamp(dataNumber(element, "rmSize", size), 10, 140);
    const cycle = Math.max(4000, dataNumber(element, "rmSpeed", speed));
    const colours = palette(dataString(element, "rmColor", color), ["rgba(210,140,101,0.5)"]);
    layer.style.setProperty("--rm-drift-soft", `${clamp(dataNumber(element, "rmSoft", soft), 0, 160)}px`);

    const random = seeded(many * 3571 + 41);
    for (let i = 0; i < many; i++) {
      const blob = document.createElement("i");
      const scale = 0.7 + random() * 0.7;
      blob.style.width = `${(span * scale).toFixed(1)}%`;
      blob.style.aspectRatio = (0.75 + random() * 0.6).toFixed(2);
      blob.style.left = `${(random() * 100 - span * scale * 0.4).toFixed(1)}%`;
      blob.style.top = `${(random() * 100 - span * scale * 0.4).toFixed(1)}%`;
      blob.style.background = `radial-gradient(circle at 34% 30%, ${colours[i % colours.length]}, transparent 68%)`;
      blob.style.borderRadius = `${(40 + random() * 30).toFixed(0)}% ${(40 + random() * 30).toFixed(0)}% ` +
        `${(40 + random() * 30).toFixed(0)}% ${(40 + random() * 30).toFixed(0)}% / ` +
        `${(40 + random() * 30).toFixed(0)}% ${(40 + random() * 30).toFixed(0)}% ` +
        `${(40 + random() * 30).toFixed(0)}% ${(40 + random() * 30).toFixed(0)}%`;
      // Two waypoints each, so no two shapes trace the same loop even though
      // every one of them is on the same keyframe rule.
      blob.style.setProperty("--rm-drift-ax", `${(random() * 24 - 12).toFixed(1)}%`);
      blob.style.setProperty("--rm-drift-ay", `${(random() * 20 - 10).toFixed(1)}%`);
      blob.style.setProperty("--rm-drift-bx", `${(random() * 24 - 12).toFixed(1)}%`);
      blob.style.setProperty("--rm-drift-by", `${(random() * 20 - 10).toFixed(1)}%`);
      blob.style.setProperty("--rm-drift-sa", (0.9 + random() * 0.3).toFixed(2));
      blob.style.setProperty("--rm-drift-sb", (0.9 + random() * 0.3).toFixed(2));
      blob.style.animationDuration = `${Math.round(cycle * (0.7 + random() * 0.8))}ms`;
      blob.style.animationDelay = `${Math.round(-random() * cycle)}ms`;
      layer.appendChild(blob);
    }

    cleanups.push(() => {
      layer.remove();
      element.classList.remove("rm-drift-shapes-host");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A horizon deformed by a seeded noise function, as one SVG path.
 *
 * The noise is value noise built by hand: a ring of seeded values, sampled
 * with a smoothstep between neighbours, then a second octave at a little over
 * twice the frequency and a third of the weight. That is what gives a ridge
 * line its big shape and its small detail at once. A sum of sines cannot do it
 * — sines are periodic, so the horizon visibly repeats, and everybody spots
 * the loop within a few seconds.
 *
 * The whole horizon is one `<path>` whose `d` is rewritten each frame. One
 * attribute on one node, sampled about every ten pixels; the alternative of a
 * node per segment is hundreds of elements for the same line.
 *
 *   <section data-rm-noise-wave data-rm-shade="solid">…</section>
 */
export function noiseWave(target = "[data-rm-noise-wave]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const {
    amp = 34, seed = 7, speed = 0.04, shade = "line", color = "rgba(42,167,228,0.7)",
  } = options;
  const cleanups = [];

  for (const element of elements) {
    const height = clamp(dataNumber(element, "rmAmp", amp), 2, 400);
    const grain = dataNumber(element, "rmSeed", seed);
    const pace = clamp(dataNumber(element, "rmSpeed", speed), 0, 1);
    const asked = dataString(element, "rmShade", shade);
    const solid = asked === "solid";
    const tint = dataString(element, "rmColor", color);

    element.classList.add("rm-noise-wave-host");
    const svg = document.createElementNS(SVG, "svg");
    // `className` on an SVG element is a read-only `SVGAnimatedString`, so the
    // class has to be set as an attribute.
    svg.setAttribute("class", "rm-noise-wave");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("preserveAspectRatio", "none");

    const id = `rm-noise-wave-${Math.random().toString(36).slice(2, 8)}`;
    svg.innerHTML =
      `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0" stop-color="${tint}"/><stop offset="1" stop-color="${tint}" stop-opacity="0"/>` +
      "</linearGradient></defs>";

    const path = document.createElementNS(SVG, "path");
    path.setAttribute("fill", solid ? `url(#${id})` : "none");
    path.setAttribute("stroke", tint);
    path.setAttribute("stroke-width", "1.4");
    path.setAttribute("stroke-linejoin", "round");
    svg.appendChild(path);
    element.prepend(svg);

    const random = seeded(grain * 2654435761 + 11);
    const lattice = Array.from({ length: 256 }, random);
    const at = (x) => {
      const i = Math.floor(x);
      const t = x - i;
      const a = lattice[((i % 256) + 256) % 256];
      const b = lattice[(((i + 1) % 256) + 256) % 256];
      // Smoothstep, so the lattice points are not visible as kinks.
      return lerp(a, b, t * t * (3 - 2 * t));
    };
    const ridge = (x) => at(x) * 0.68 + at(x * 2.3 + 37) * 0.32;

    let width = 1;
    let tall = 1;
    const fit = () => {
      const box = element.getBoundingClientRect();
      width = Math.max(1, Math.round(box.width));
      tall = Math.max(1, Math.round(box.height));
      svg.setAttribute("viewBox", `0 0 ${width} ${tall}`);
    };
    fit();
    const resizeObserver = new ResizeObserver(fit);
    resizeObserver.observe(element);

    const paint = (phase) => {
      const step = Math.max(6, Math.round(width / 120));
      const base = tall * 0.62;
      let d = "";
      for (let x = 0; x <= width + step; x += step) {
        const y = base + (ridge(x / 180 + phase) - 0.5) * 2 * height;
        d += `${x === 0 ? "M" : "L"}${x} ${y.toFixed(1)}`;
      }
      // Shaded, the path closes *outside* the viewBox: the same single path
      // then carries both the fill and the stroke, and the three segments that
      // close it are clipped away instead of drawing a box round the panel.
      if (solid) d += `L${width + step} ${tall + 8}L-8 ${tall + 8}L-8 ${base.toFixed(1)}Z`;
      path.setAttribute("d", d);
    };
    paint(0);

    const undo = () => {
      resizeObserver.disconnect();
      svg.remove();
      element.classList.remove("rm-noise-wave-host");
    };

    if (prefersReducedMotion()) {
      cleanups.push(undo);
      continue;
    }

    const stop = whileVisible(element, () => onFrame((now) => paint(now * 0.001 * pace)));
    cleanups.push(() => { stop(); undo(); });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Points joined when they come within range, on one canvas.
 *
 * The constellation, done honestly: a real distance check between every pair,
 * with the line's opacity falling from one at touching to zero at the range
 * limit, so links fade in and out instead of snapping on. The comparison is
 * done on squared distances, which removes one square root per pair — at
 * seventy points that is nearly two and a half thousand pairs a frame, and
 * `Math.hypot` is the single most expensive thing in the loop.
 *
 * That quadratic is also why the count is capped. Seventy points is a handsome
 * web; four hundred is eighty thousand pairs a frame and a phone that gets
 * warm. The pointer joins in as one more node, which is the part that makes
 * the field feel like it noticed you.
 *
 *   <section data-rm-link-web data-rm-radius="150">…</section>
 */
export function linkWeb(target = "[data-rm-link-web]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { count = 64, radius = 140, speed = 14, size = 2, color = "rgba(241,238,233,0.75)" } = options;
  const cleanups = [];

  for (const element of elements) {
    const many = Math.round(clamp(dataNumber(element, "rmMany", count), 4, 120));
    const reach = clamp(dataNumber(element, "rmRadius", radius), 20, 500);
    const rate = clamp(dataNumber(element, "rmSpeed", speed), 0, 120);
    const dot = clamp(dataNumber(element, "rmSize", size), 0.5, 8);
    const tint = dataString(element, "rmColor", color);

    const view = surface(element, "rm-link-web");
    const { ctx } = view;
    const random = seeded(many * 8191 + 53);
    const nodes = Array.from({ length: many }, () => ({
      x: random(),
      y: random(),
      vx: (random() - 0.5) * 2,
      vy: (random() - 0.5) * 2,
      px: 0,
      py: 0,
    }));

    const pointer = { x: 0, y: 0, on: false };
    const stopPointer = pointerWithin(element, (x, y, inside) => {
      pointer.x = x;
      pointer.y = y;
      pointer.on = inside;
    });

    const paint = (step) => {
      const { width, height } = view;
      ctx.clearRect(0, 0, width, height);
      const limit = reach * reach;

      for (const node of nodes) {
        node.x += (node.vx * rate * step) / width;
        node.y += (node.vy * rate * step) / height;
        // Bounce rather than wrap: a point crossing the edge and reappearing
        // opposite drags its links across the whole panel as it goes.
        if (node.x < 0 || node.x > 1) { node.vx *= -1; node.x = clamp(node.x); }
        if (node.y < 0 || node.y > 1) { node.vy *= -1; node.y = clamp(node.y); }
        node.px = node.x * width;
        node.py = node.y * height;
      }

      ctx.strokeStyle = tint;
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].px - nodes[j].px;
          const dy = nodes[i].py - nodes[j].py;
          const gap = dx * dx + dy * dy;
          if (gap > limit) continue;
          ctx.globalAlpha = (1 - gap / limit) * 0.5;
          ctx.beginPath();
          ctx.moveTo(nodes[i].px, nodes[i].py);
          ctx.lineTo(nodes[j].px, nodes[j].py);
          ctx.stroke();
        }
      }

      if (pointer.on) {
        for (const node of nodes) {
          const dx = node.px - pointer.x;
          const dy = node.py - pointer.y;
          const gap = dx * dx + dy * dy;
          if (gap > limit) continue;
          ctx.globalAlpha = (1 - gap / limit) * 0.8;
          ctx.beginPath();
          ctx.moveTo(node.px, node.py);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 0.9;
      ctx.fillStyle = tint;
      for (const node of nodes) {
        ctx.beginPath();
        ctx.arc(node.px, node.py, dot, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    if (prefersReducedMotion()) {
      stopPointer();
      paint(0);
      cleanups.push(() => view.stop());
      continue;
    }

    const stop = whileVisible(element, () => {
      let last = performance.now();
      return onFrame((now) => {
        const step = Math.min(0.05, (now - last) / 1000);
        last = now;
        paint(step);
      });
    });

    cleanups.push(() => { stop(); stopPointer(); view.stop(); });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Expanding rings where the pointer has been, on one canvas.
 *
 * A ring is spawned by distance travelled, not by pointer event: the browser
 * will happily deliver several hundred `pointermove` events a second on a
 * high-rate mouse, and one ring each is a wall of overlapping circles that
 * arrive faster than they can fade. Every twenty-odd pixels of travel gives an
 * evenly spaced wake instead, at whatever speed the hand is moving.
 *
 * Rings are drawn, not elements. A DOM node per ripple means a node created
 * and removed dozens of times a second, each one its own layer and its own
 * animation — and the garbage collector notices long before the visitor stops
 * moving the mouse.
 *
 * Focus counts as a visit: moving through the panel with a keyboard drops a
 * ring at whatever has just been focused, so the effect is not one that only
 * exists for people holding a mouse.
 *
 *   <section data-rm-ripple-pool data-rm-color="rgba(42,167,228,0.6)">…</section>
 */
export function ripplePool(target = "[data-rm-ripple-pool]", options = {}) {
  const elements = resolveElements(target);
  // Ornament with no resting state: rings that do not expand are just circles
  // sitting where a pointer used to be.
  if (!elements.length || prefersReducedMotion()) return () => {};

  const { life = 1400, speed = 150, count = 24, spacing = 22, color = "rgba(241,238,233,0.6)" } = options;
  const cleanups = [];

  for (const element of elements) {
    const span = Math.max(200, dataNumber(element, "rmLife", life));
    const grow = clamp(dataNumber(element, "rmSpeed", speed), 20, 900);
    const most = Math.round(clamp(dataNumber(element, "rmMany", count), 4, 80));
    const every = clamp(dataNumber(element, "rmSpacing", spacing), 4, 200);
    const tint = dataString(element, "rmColor", color);

    const view = surface(element, "rm-ripple-pool");
    const { ctx } = view;
    let rings = [];
    let lastX = -9999;
    let lastY = -9999;

    const drop = (x, y) => {
      rings.push({ x, y, born: performance.now() });
      if (rings.length > most) rings.shift();
    };

    const stopPointer = pointerWithin(element, (x, y, inside) => {
      if (!inside) { lastX = -9999; lastY = -9999; return; }
      if (Math.hypot(x - lastX, y - lastY) < every) return;
      lastX = x;
      lastY = y;
      drop(x, y);
    });

    const onDown = (event) => {
      const box = element.getBoundingClientRect();
      drop(event.clientX - box.left, event.clientY - box.top);
    };
    const onFocus = (event) => {
      const box = element.getBoundingClientRect();
      const spot = event.target.getBoundingClientRect?.();
      if (!spot) return;
      drop(spot.left + spot.width / 2 - box.left, spot.top + spot.height / 2 - box.top);
    };
    element.addEventListener("pointerdown", onDown);
    element.addEventListener("focusin", onFocus);

    const stop = whileVisible(element, () => onFrame((now) => {
      const { width, height } = view;
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = tint;

      const keep = [];
      for (const ring of rings) {
        const age = (now - ring.born) / span;
        if (age >= 1) continue;
        // Radius eases out while the line thins and fades — a ring at constant
        // speed and constant width reads as a mechanical circle, not water.
        const radius = grow * (1 - (1 - age) ** 2) * (span / 1000);
        ctx.globalAlpha = (1 - age) ** 1.6;
        ctx.lineWidth = 0.5 + 2 * (1 - age);
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, Math.max(0.5, radius), 0, Math.PI * 2);
        ctx.stroke();
        keep.push(ring);
      }
      rings = keep;
      ctx.globalAlpha = 1;
    }));

    cleanups.push(() => {
      stop();
      stopPointer();
      element.removeEventListener("pointerdown", onDown);
      element.removeEventListener("focusin", onFocus);
      rings = [];
      view.stop();
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Soft orbs whose light overlaps additively.
 *
 * The point of this one is what happens where two orbs meet. Blended with
 * `plus-lighter` the overlap is the sum of both, so crossing orbs brighten the
 * way real light does; blended normally the one in front simply covers the one
 * behind and the whole thing looks like coloured paper. `screen` is the
 * fallback where `plus-lighter` is not supported — not the same maths, but the
 * same idea, and better than flat.
 *
 * Each orb is one radial gradient on one element, drifting on a shared
 * keyframe rule parameterised per orb, and the layer isolates itself so the
 * additive blending stops at the panel instead of leaking onto whatever is
 * behind it.
 *
 *   <section data-rm-glow-orbs data-rm-many="3">…</section>
 */
export function glowOrbs(target = "[data-rm-glow-orbs]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const {
    count = 3, size = 40, speed = 18000,
    color = "rgba(42,167,228,0.75),rgba(244,215,56,0.6),rgba(210,140,101,0.7)",
  } = options;
  const cleanups = [];

  for (const element of elements) {
    const still = prefersReducedMotion();
    const layer = layerFor(element, "rm-glow-orbs", still);

    const many = Math.round(clamp(dataNumber(element, "rmMany", count), 1, 8));
    const span = clamp(dataNumber(element, "rmSize", size), 8, 120);
    const cycle = Math.max(3000, dataNumber(element, "rmSpeed", speed));
    const colours = palette(dataString(element, "rmColor", color), ["rgba(42,167,228,0.75)"]);

    const random = seeded(many * 5441 + 67);
    for (let i = 0; i < many; i++) {
      const orb = document.createElement("i");
      const scale = 0.75 + random() * 0.6;
      // Width plus `aspect-ratio`, never a percentage height: a percentage
      // height resolves against the panel, so on a wide short section the orb
      // becomes an ellipse and the round falloff is cut off flat top and
      // bottom. `closest-side` then finishes the gradient inside the box.
      orb.style.width = `${(span * scale).toFixed(1)}%`;
      orb.style.aspectRatio = "1";
      orb.style.left = `${(8 + random() * 74).toFixed(1)}%`;
      orb.style.top = `${(8 + random() * 68).toFixed(1)}%`;
      orb.style.background =
        `radial-gradient(circle closest-side, ${colours[i % colours.length]} 0%, transparent 100%)`;
      orb.style.setProperty("--rm-orb-ax", `${(random() * 30 - 15).toFixed(1)}%`);
      orb.style.setProperty("--rm-orb-ay", `${(random() * 26 - 13).toFixed(1)}%`);
      orb.style.setProperty("--rm-orb-bx", `${(random() * 30 - 15).toFixed(1)}%`);
      orb.style.setProperty("--rm-orb-by", `${(random() * 26 - 13).toFixed(1)}%`);
      orb.style.animationDuration = `${Math.round(cycle * (0.75 + random() * 0.7))}ms`;
      // A negative delay puts each orb somewhere in the middle of its own
      // path, so the field is composed on the first frame rather than all
      // starting from the same corner.
      orb.style.animationDelay = `${Math.round(-random() * cycle)}ms`;
      layer.appendChild(orb);
    }

    cleanups.push(() => {
      layer.remove();
      element.classList.remove("rm-glow-orbs-host");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}
