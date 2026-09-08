/**
 * Cursor effects.
 *
 *   • cursor()   — a custom cursor that trails, grows over links, and can
 *                  invert whatever is beneath it.
 *   • splash()   — a fluid trail of blobs that follow at different rates.
 *   • magnetic() — elements that lean towards the pointer as it approaches.
 *
 * Three rules these follow that most custom cursors do not:
 *
 *   • The real cursor is only hidden once the replacement is actually moving.
 *     Hiding it up front means a page where the pointer has vanished if the
 *     script fails or the visitor never moves the mouse.
 *   • Touch devices are left alone entirely. There is no pointer to follow, and
 *     a fixed dot in the corner of a phone is pure noise.
 *   • Reduced motion disables the trail and the magnetism, which are the parts
 *     that move independently of the hand controlling them.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import { clamp, dataNumber, lerp, onFrame, prefersReducedMotion, resolveElements } from "../core/motion.js";

/** Is there a real pointer to follow? */
function hasFinePointer() {
  return typeof matchMedia === "function" && matchMedia("(pointer: fine)").matches;
}

/**
 * A custom cursor: an inner dot that tracks exactly, and an outer ring that
 * lags behind it. The lag is the whole effect — it reads as weight.
 */
export function cursor(options = {}) {
  if (!hasFinePointer()) return () => {};

  const {
    size = 10,
    ringSize = 38,
    ease = 0.16,
    hoverScale = 2.4,
    hoverTargets = "a, button, [data-rm-cursor-hover], input[type='submit']",
    blend = "difference",
    color = "#fff",
  } = options;

  const root = document.createElement("div");
  root.className = "rm-cursor";
  root.setAttribute("aria-hidden", "true");
  root.innerHTML = '<span class="rm-cursor-dot"></span><span class="rm-cursor-ring"></span>';
  root.style.setProperty("--rm-cursor-size", `${size}px`);
  root.style.setProperty("--rm-cursor-ring", `${ringSize}px`);
  root.style.setProperty("--rm-cursor-color", color);
  root.style.mixBlendMode = blend;
  document.body.appendChild(root);

  const dot = root.querySelector(".rm-cursor-dot");
  const ring = root.querySelector(".rm-cursor-ring");

  const pointer = { x: innerWidth / 2, y: innerHeight / 2 };
  const trail = { x: pointer.x, y: pointer.y };
  let scale = 1;
  let targetScale = 1;
  let awake = false;

  const onMove = (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    if (!awake) {
      awake = true;
      // Only now is it safe to take the real cursor away.
      document.documentElement.classList.add("rm-cursor-active");
      root.classList.add("is-visible");
    }
  };

  const onOver = (event) => {
    targetScale = event.target.closest?.(hoverTargets) ? hoverScale : 1;
  };
  const onDown = () => { targetScale *= 0.75; };
  const onUp = () => { targetScale = targetScale / 0.75; };
  const onLeave = () => root.classList.remove("is-visible");
  const onEnter = () => awake && root.classList.add("is-visible");

  addEventListener("pointermove", onMove, { passive: true });
  addEventListener("pointerover", onOver, { passive: true });
  addEventListener("pointerdown", onDown, { passive: true });
  addEventListener("pointerup", onUp, { passive: true });
  document.addEventListener("pointerleave", onLeave);
  document.addEventListener("pointerenter", onEnter);

  const reduced = prefersReducedMotion();
  const stopFrame = onFrame(() => {
    // Under reduced motion the ring tracks exactly, so nothing moves on its
    // own accord.
    const follow = reduced ? 1 : ease;
    trail.x = lerp(trail.x, pointer.x, follow);
    trail.y = lerp(trail.y, pointer.y, follow);
    scale = lerp(scale, targetScale, 0.2);

    dot.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0) translate(-50%, -50%)`;
    ring.style.transform = `translate3d(${trail.x}px, ${trail.y}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`;
  });

  return () => {
    stopFrame();
    removeEventListener("pointermove", onMove);
    removeEventListener("pointerover", onOver);
    removeEventListener("pointerdown", onDown);
    removeEventListener("pointerup", onUp);
    document.removeEventListener("pointerleave", onLeave);
    document.removeEventListener("pointerenter", onEnter);
    document.documentElement.classList.remove("rm-cursor-active");
    root.remove();
  };
}

/**
 * A fluid trail: several blobs chasing the pointer at decreasing speeds.
 *
 * Rendered to a canvas rather than as DOM nodes. Twenty absolutely-positioned
 * divs updating every frame is twenty style recalculations; one canvas is one
 * paint, and it can use a blur filter that would be far more expensive in CSS.
 */
export function splash(options = {}) {
  if (!hasFinePointer() || prefersReducedMotion()) return () => {};

  const {
    count = 18,
    radius = 26,
    ease = 0.22,
    blur = 14,
    colors = ["#3b9ef0", "#7b5cf0", "#f05c9e"],
    blend = "screen",
  } = options;

  const canvas = document.createElement("canvas");
  canvas.className = "rm-splash";
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.mixBlendMode = blend;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  let dpr = Math.min(devicePixelRatio || 1, 2);
  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  addEventListener("resize", resize);

  const pointer = { x: innerWidth / 2, y: innerHeight / 2 };
  const blobs = Array.from({ length: count }, (_, i) => ({
    x: pointer.x,
    y: pointer.y,
    // Later blobs lag more and shrink, which is what makes it read as a tail
    // rather than a swarm.
    ease: ease * (1 - i / (count * 1.4)),
    radius: radius * (1 - i / (count * 1.25)),
    color: colors[i % colors.length],
  }));

  const onMove = (event) => { pointer.x = event.clientX; pointer.y = event.clientY; };
  addEventListener("pointermove", onMove, { passive: true });

  const stopFrame = onFrame(() => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ctx.filter = `blur(${blur}px)`;
    let lead = pointer;
    for (const blob of blobs) {
      blob.x = lerp(blob.x, lead.x, blob.ease);
      blob.y = lerp(blob.y, lead.y, blob.ease);
      ctx.beginPath();
      ctx.fillStyle = blob.color;
      ctx.arc(blob.x, blob.y, Math.max(0, blob.radius), 0, Math.PI * 2);
      ctx.fill();
      lead = blob;
    }
    ctx.filter = "none";
  });

  return () => {
    stopFrame();
    removeEventListener("pointermove", onMove);
    removeEventListener("resize", resize);
    canvas.remove();
  };
}

/**
 * Magnetic elements: they lean towards the pointer while it is near.
 *
 * The pull is capped well below the distance travelled, so the element never
 * outruns the cursor — that looks like a bug rather than an effect.
 */
export function magnetic(target = "[data-rm-magnetic]", options = {}) {
  const elements = resolveElements(target);
  if (!elements.length || !hasFinePointer() || prefersReducedMotion()) return () => {};

  const { strength = 0.35, radius = 120, ease = 0.18 } = options;
  const cleanups = [];

  for (const element of elements) {
    const pull = dataNumber(element, "rmMagnetic", strength);
    const reach = dataNumber(element, "rmRadius", radius);
    const current = { x: 0, y: 0 };
    const goal = { x: 0, y: 0 };

    const onMove = (event) => {
      const box = element.getBoundingClientRect();
      const dx = event.clientX - (box.left + box.width / 2);
      const dy = event.clientY - (box.top + box.height / 2);
      const distance = Math.hypot(dx, dy);
      const influence = clamp(1 - distance / (reach + Math.max(box.width, box.height) / 2));
      goal.x = dx * pull * influence;
      goal.y = dy * pull * influence;
    };

    addEventListener("pointermove", onMove, { passive: true });
    const stopFrame = onFrame(() => {
      current.x = lerp(current.x, goal.x, ease);
      current.y = lerp(current.y, goal.y, ease);
      if (Math.abs(current.x) < 0.01 && Math.abs(current.y) < 0.01) {
        element.style.transform = "";
        return;
      }
      element.style.transform = `translate3d(${current.x.toFixed(2)}px, ${current.y.toFixed(2)}px, 0)`;
    });

    cleanups.push(() => {
      stopFrame();
      removeEventListener("pointermove", onMove);
      element.style.transform = "";
    });
  }

  return () => cleanups.forEach((stop) => stop());
}
