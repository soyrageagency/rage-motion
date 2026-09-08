/**
 * Light and weather for a panel.
 *
 *   • meteors()  — streaks falling across a section.
 *   • sparkles() — points that twinkle and drift over an element.
 *   • lamp()     — a cone of light thrown from one edge.
 *   • beams()    — vertical shafts sweeping through a dark panel.
 *
 * All four are decoration with no content in them, so all four disappear
 * entirely under reduced motion rather than freezing mid-effect: there is no
 * end state worth preserving, and a frozen meteor is a smudge.
 *
 * They are also all built from a handful of elements on CSS animations rather
 * than from a canvas. A canvas would be a frame budget spent on something the
 * eye reads as texture; these run on the compositor and cost nothing once the
 * page has laid out.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import { dataNumber, dataString, prefersReducedMotion, resolveElements } from "../core/motion.js";

/** Deterministic pseudo-random, so a reload does not reshuffle the sky. */
function seeded(seed) {
  let value = seed;
  return () => {
    value = (value * 1103515245 + 12345) % 2147483648;
    return value / 2147483648;
  };
}

/**
 * Streaks falling across a section.
 *
 * Each meteor gets its own delay, duration and length from a seeded sequence,
 * so the shower never lines up into a visible pattern — which is what happens
 * when they all share one animation and only the position differs.
 */
export function meteors(target = "[data-rm-meteors]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length || prefersReducedMotion()) return () => {};

  const { count = 14, color = "#ffffff", speed = 4200, angle = 215 } = options;
  const cleanups = [];

  for (const element of elements) {
    const many = Math.min(40, dataNumber(element, "rmMeteors", count));
    element.classList.add("rm-meteors");
    element.style.setProperty("--rm-meteor-angle", `${dataNumber(element, "rmAngle", angle)}deg`);

    const layer = document.createElement("div");
    layer.className = "rm-meteors-layer";
    layer.setAttribute("aria-hidden", "true");

    const random = seeded(many * 31 + 7);
    for (let i = 0; i < many; i++) {
      const meteor = document.createElement("i");
      meteor.style.left = `${(random() * 130 - 15).toFixed(1)}%`;
      meteor.style.top = `${(random() * 60 - 30).toFixed(1)}%`;
      meteor.style.setProperty("--rm-meteor-length", `${(60 + random() * 120).toFixed(0)}px`);
      meteor.style.animationDuration = `${(speed * (0.6 + random() * 0.9)).toFixed(0)}ms`;
      meteor.style.animationDelay = `${(random() * speed * 1.6).toFixed(0)}ms`;
      meteor.style.background =
        `linear-gradient(90deg, ${dataString(element, "rmColor", color)}, transparent)`;
      layer.appendChild(meteor);
    }

    element.prepend(layer);

    // How far a meteor travels has to come from the box it is crossing. A
    // viewport-sized distance looks right on a full-bleed section and makes
    // them flash past a card in a single frame, which reads as nothing at all.
    const measure = () => {
      const box = element.getBoundingClientRect();
      element.style.setProperty(
        "--rm-meteor-travel",
        `${Math.round(Math.hypot(box.width, box.height) * 1.3)}px`,
      );
    };
    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(element);

    cleanups.push(() => {
      resizeObserver.disconnect();
      layer.remove();
      element.classList.remove("rm-meteors");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Points that twinkle and drift over an element.
 *
 * The trick to sparkles not looking like dust is that they scale and fade on
 * different phases: a point at full brightness should be a different size from
 * its neighbour. One animation with staggered negative delays does that for
 * free, without a timer per point.
 */
export function sparkles(target = "[data-rm-sparkles]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length || prefersReducedMotion()) return () => {};

  const { count = 26, color = "#f4d738", size = 3, speed = 2600 } = options;
  const cleanups = [];

  for (const element of elements) {
    const many = Math.min(60, dataNumber(element, "rmSparkles", count));
    element.classList.add("rm-sparkles");

    const layer = document.createElement("div");
    layer.className = "rm-sparkles-layer";
    layer.setAttribute("aria-hidden", "true");

    const random = seeded(many * 17 + 3);
    for (let i = 0; i < many; i++) {
      const spark = document.createElement("i");
      const scale = 0.5 + random() * 1.4;
      spark.style.left = `${(random() * 100).toFixed(1)}%`;
      spark.style.top = `${(random() * 100).toFixed(1)}%`;
      spark.style.width = spark.style.height = `${(size * scale).toFixed(1)}px`;
      spark.style.background = dataString(element, "rmColor", color);
      spark.style.animationDuration = `${(speed * (0.7 + random() * 0.8)).toFixed(0)}ms`;
      // Negative delays start each point part-way through, so the field is
      // already alive on the first frame instead of blinking on together.
      spark.style.animationDelay = `${(-random() * speed * 2).toFixed(0)}ms`;
      layer.appendChild(spark);
    }

    element.appendChild(layer);
    cleanups.push(() => {
      layer.remove();
      element.classList.remove("rm-sparkles");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A cone of light thrown from one edge.
 *
 * Two mirrored conic gradients meeting at a hairline, which is what gives the
 * light a hard source and a soft spill. Done with a single blurred radial
 * gradient it reads as a smudge in the corner; the cone is the whole point.
 */
export function lamp(target = "[data-rm-lamp]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { color = "#2aa7e4", spread = 42, from = "top", intensity = 0.55 } = options;
  const cleanups = [];

  for (const element of elements) {
    element.classList.add("rm-lamp", `is-${dataString(element, "rmLamp", from) === "bottom" ? "bottom" : "top"}`);
    element.style.setProperty("--rm-lamp-color", dataString(element, "rmColor", color));
    element.style.setProperty("--rm-lamp-spread", `${dataNumber(element, "rmSpread", spread)}%`);
    element.style.setProperty("--rm-lamp-intensity", String(intensity));

    const layer = document.createElement("div");
    layer.className = "rm-lamp-layer";
    layer.setAttribute("aria-hidden", "true");
    layer.innerHTML = '<i class="rm-lamp-cone"></i><i class="rm-lamp-line"></i>';
    if (prefersReducedMotion()) layer.classList.add("is-still");
    element.prepend(layer);

    cleanups.push(() => {
      layer.remove();
      element.classList.remove("rm-lamp", "is-top", "is-bottom");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Vertical shafts sweeping through a dark panel.
 *
 * Each shaft has its own width, opacity and period, and they are masked to
 * fade at both ends so they read as light rather than as stripes. The mask is
 * what separates this from a set of moving divs.
 */
export function beams(target = "[data-rm-beams]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length) return () => {};

  const { count = 7, color = "#2aa7e4", speed = 7000, tilt = 12 } = options;
  const cleanups = [];

  for (const element of elements) {
    const many = Math.min(20, dataNumber(element, "rmBeams", count));
    element.classList.add("rm-beams");
    element.style.setProperty("--rm-beams-tilt", `${tilt}deg`);

    const layer = document.createElement("div");
    layer.className = "rm-beams-layer";
    layer.setAttribute("aria-hidden", "true");

    const random = seeded(many * 41 + 11);
    for (let i = 0; i < many; i++) {
      const shaft = document.createElement("i");
      shaft.style.left = `${((i + random() * 0.6) / many * 100).toFixed(1)}%`;
      shaft.style.width = `${(30 + random() * 90).toFixed(0)}px`;
      shaft.style.background =
        `linear-gradient(180deg, transparent, ${dataString(element, "rmColor", color)}, transparent)`;
      shaft.style.opacity = (0.08 + random() * 0.22).toFixed(2);
      shaft.style.animationDuration = `${(speed * (0.7 + random())).toFixed(0)}ms`;
      shaft.style.animationDelay = `${(-random() * speed).toFixed(0)}ms`;
      layer.appendChild(shaft);
    }

    if (prefersReducedMotion()) layer.classList.add("is-still");
    element.prepend(layer);

    cleanups.push(() => {
      layer.remove();
      element.classList.remove("rm-beams");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}
