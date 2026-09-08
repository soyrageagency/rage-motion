/**
 * Ecommerce — the product and catalogue side.
 *
 *   • productCard()      — a product, with one link and everything else clickable.
 *   • productGallery()   — thumbnails and a main image, complete from the keyboard.
 *   • productZoom()      — the real photograph magnified in place, not a second copy.
 *   • colourSwatches()   — real radios, with the colour written down.
 *   • sizePicker()       — real radios, and out of stock actually said out loud.
 *   • priceTag()         — a price with a struck original that is not only struck.
 *   • discountBadge()    — a percentage, popped in from its own centre.
 *   • stockMeter()       — how many are left, drawn and announced.
 *   • ratingStars()      — a read-only score, with the number in text beside it.
 *   • reviewSummary()    — the distribution, as bars that grow by transform.
 *   • addToCart()        — a button that confirms and comes back, at one width.
 *   • wishlistHeart()    — a toggle button with `aria-pressed`, and a steady name.
 *   • compareTray()      — a shelf that slides over the page rather than into it.
 *   • quickView()        — a dialog that traps focus and gives it back.
 *   • productTabs()      — description, details, reviews, with a sliding underline.
 *   • variantPicker()    — several choices combined into one announced answer.
 *   • breadcrumbTrail()  — a trail that folds its middle into a button, not an ellipsis.
 *   • sortBar()          — a real `<select>`, because nothing beats it.
 *   • filterPanel()      — a disclosure with real checkboxes and no reflow.
 *   • resultCount()      — "42 products", announced once the filtering settles.
 *
 * A shop is the one kind of page where a broken control costs somebody money,
 * so the discipline here is duller than usual and deliberately so. Every choice
 * is a real `<input type="radio">` or `<input type="checkbox">` inside a real
 * group, every action is a `<button type="button">`, and the sort control is
 * the browser's own `<select>` — the div-based rebuilds of all four lose form
 * submission, type-ahead, voice control and the native picker on a phone, and
 * they lose them silently.
 *
 * The second rule is that nothing in a catalogue may reflow. Prices update,
 * stock drops, filters change the result count, a tray slides in from the
 * bottom: all of it moves by transform, opacity and clip-path over the top of
 * the grid rather than through it. A card that resizes while you are reaching
 * for it is a card you click by accident, and a grid that reflows as its
 * filters settle is a grid that loses your place ten times a minute.
 *
 * The third is that a number drawn is a number half the audience never
 * receives. A strike-through is a visual effect with no spoken equivalent, a
 * row of stars is a row of glyphs, and a bar is a rectangle — so the price says
 * "now 24 euros, was 40", the rating says "4.3 out of 5", and the meter carries
 * a real `aria-valuetext`.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import {
  clamp, dataNumber, dataString, EASE, keepInView, onFrame, prefersReducedMotion,
  resolveElements, watch, whileVisible,
} from "../core/motion.js";

/** An id for the `aria-` wiring that needs one, without demanding it in markup. */
const uid = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

/** A live region owned by one component and removed with it. */
function announcer(holder, tone = "polite") {
  const said = document.createElement("p");
  said.className = "rm-shop-live";
  said.setAttribute("aria-live", tone);
  said.setAttribute("role", tone === "assertive" ? "alert" : "status");
  holder.appendChild(said);
  return said;
}

/** Text that is read but not drawn — the spoken half of a purely visual signal. */
function said(text) {
  const span = document.createElement("span");
  span.className = "rm-shop-said";
  span.textContent = text;
  return span;
}

/**
 * Move an element from where it was to where it now is, using only transform.
 *
 * The invert half of a FLIP: the layout change has already happened, the
 * element is already in its final place, and this plays the difference. It is
 * how anything in this file appears to grow or slide without a single frame of
 * animated width.
 */
function flip(element, was, duration = 320) {
  if (prefersReducedMotion()) return;
  const now = element.getBoundingClientRect();
  if (!now.width || !now.height || !was.width || !was.height) return;
  const dx = was.left - now.left;
  const dy = was.top - now.top;
  const sx = was.width / now.width;
  const sy = was.height / now.height;
  if (!dx && !dy && Math.abs(sx - 1) < 0.002 && Math.abs(sy - 1) < 0.002) return;
  element.animate(
    [
      { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`, transformOrigin: "0 0" },
      { transform: "none", transformOrigin: "0 0" },
    ],
    { duration, easing: EASE.out },
  );
}

/** Every element inside `root` that a Tab press can reach. */
function focusable(root) {
  return [...root.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), '
    + 'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )].filter((el) => el.offsetParent !== null || el === document.activeElement);
}

/** Money, formatted twice: once for the eye and once to be read aloud. */
function money(value, currency, locale) {
  try {
    const drawn = new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
    const spoken = new Intl.NumberFormat(locale, {
      style: "currency", currency, currencyDisplay: "name",
    }).format(value);
    return { drawn, spoken };
  } catch {
    // An unrecognised currency or locale falls back to the plain number rather
    // than throwing and leaving the price blank.
    const drawn = String(value);
    return { drawn, spoken: drawn };
  }
}

/**
 * A product, with one link and everything else still clickable.
 *
 * The whole card is the hit area, but the accessible name is the product title
 * alone: the title's own anchor is stretched over the card with a pseudo
 * element, and the price, badge and quick-add sit on a higher layer so they
 * keep their own clicks. Wrapping the entire card in one `<a>` instead — the
 * usual shortcut — produces a link whose name is the title, the price, the
 * rating and the word "Add", read out in full, and it makes the quick-add
 * button illegal markup inside it.
 *
 * The second photograph is swapped into the same `<img>` rather than stacked
 * behind it, so there is one element and one alt text; it is preloaded first so
 * the swap cannot flash white. It happens on focus as well as on hover, because
 * a keyboard visitor is entitled to the same second look.
 *
 *   <article data-rm-product-card data-rm-image="/back.jpg">
 *     <img src="/front.jpg" alt="Linen shirt, front">
 *     <h3><a href="/p/linen-shirt">Linen shirt</a></h3>
 *     <p>€68</p>
 *     <button type="button">Add to bag</button>
 *   </article>
 */
export function productCard(target = "[data-rm-product-card]", options = {}) {
  const cards = resolveElements(target);
  if (!cards.length) return () => {};

  const { lift = 6, duration = 420 } = options;
  const cleanups = [];

  for (const card of cards) {
    card.classList.add("rm-product-card");
    card.style.setProperty("--rm-product-card-lift", `${-dataNumber(card, "rmLift", lift)}px`);
    card.style.setProperty(
      "--rm-product-card-duration",
      `${prefersReducedMotion() ? 0 : dataNumber(card, "rmDuration", duration)}ms`,
    );

    // The first anchor is the product; everything else stays on top of it.
    const link = card.querySelector("a[href]");
    link?.classList.add("rm-product-card-link");

    const image = card.querySelector("img");
    const alternate = dataString(card, "rmImage", "");
    const original = image?.getAttribute("src") ?? "";
    let ready = false;

    if (image && alternate) {
      const preload = new Image();
      preload.addEventListener("load", () => { ready = true; });
      preload.src = alternate;
    }

    const show = (src) => {
      if (!image || !src || image.getAttribute("src") === src) return;
      if (prefersReducedMotion()) { image.setAttribute("src", src); return; }
      image.animate(
        [{ opacity: 1 }, { opacity: 0.55 }, { opacity: 1 }],
        { duration: 320, easing: EASE.inOut },
      );
      image.setAttribute("src", src);
    };

    const enter = () => { card.classList.add("is-lifted"); if (ready) show(alternate); };
    const leave = () => { card.classList.remove("is-lifted"); show(original); };

    // Focus moving between two children of the card is not a departure, so the
    // handler is named rather than inline — both because it has to check where
    // the focus went, and because an anonymous listener can never be removed.
    const onFocusOut = (event) => {
      if (!card.contains(event.relatedTarget)) leave();
    };

    card.addEventListener("pointerenter", enter);
    card.addEventListener("pointerleave", leave);
    card.addEventListener("focusin", enter);
    card.addEventListener("focusout", onFocusOut);

    cleanups.push(() => {
      card.removeEventListener("pointerenter", enter);
      card.removeEventListener("pointerleave", leave);
      card.removeEventListener("focusin", enter);
      card.removeEventListener("focusout", onFocusOut);
      if (image && original) image.setAttribute("src", original);
      link?.classList.remove("rm-product-card-link");
      card.classList.remove("rm-product-card", "is-lifted");
      card.style.removeProperty("--rm-product-card-lift");
      card.style.removeProperty("--rm-product-card-duration");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Thumbnails and a main image, complete from the keyboard.
 *
 * The thumbnails are a real list of buttons under a roving tabindex: one stop
 * for the whole strip, arrows to move between frames, Home and End for the ends,
 * and `aria-current` on the one being shown. The version made of clickable divs
 * has either no tab stops at all or one per photograph, and neither is what
 * anybody wants at the top of a product page.
 *
 * The large file is decoded before it is swapped in, so the main image never
 * blanks between frames — the naive version assigns `src` and you watch the
 * previous photograph disappear while the next one downloads. The change is
 * announced as "image 3 of 6" with the alt text, because a silent swap is a
 * control that appears to do nothing.
 *
 *   <div data-rm-product-gallery>
 *     <img src="/large-1.jpg" alt="Linen shirt, front">
 *     <ul>
 *       <li><button type="button" data-rm-src="/large-1.jpg"><img src="/t1.jpg" alt="Front"></button></li>
 *       <li><button type="button" data-rm-src="/large-2.jpg"><img src="/t2.jpg" alt="Back"></button></li>
 *     </ul>
 *   </div>
 */
export function productGallery(target = "[data-rm-product-gallery]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { duration = 360, label = "Product images" } = options;
  const cleanups = [];

  for (const holder of holders) {
    const thumbs = [...holder.querySelectorAll("button")].filter((b) => b.querySelector("img"));
    const main = [...holder.querySelectorAll("img")].find((img) => !img.closest("button"));
    if (!thumbs.length || !main) continue;

    holder.classList.add("rm-product-gallery");
    holder.setAttribute("role", "group");
    const hadLabel = holder.getAttribute("aria-label");
    holder.setAttribute("aria-label", dataString(holder, "rmLabel", hadLabel ?? label));
    main.classList.add("rm-product-gallery-main");

    const strip = thumbs[0].closest("ul, ol, div") ?? holder;
    strip.classList.add("rm-product-gallery-strip");
    const live = announcer(holder);
    const speed = dataNumber(holder, "rmDuration", duration);

    // What was in the markup before the first swap, so the cleanup can put the
    // photograph the author shipped back rather than whichever frame happened
    // to be showing when the caller let go.
    const firstSrc = main.getAttribute("src");
    const firstAlt = main.alt;

    let at = 0;
    const paint = (next, moveFocus, announce) => {
      const index = clamp(next, 0, thumbs.length - 1);
      const button = thumbs[index];
      const source = dataString(button, "rmSrc", button.querySelector("img")?.src ?? "");
      const description = button.querySelector("img")?.alt ?? `Image ${index + 1}`;

      thumbs.forEach((thumb, i) => {
        thumb.classList.toggle("is-current", i === index);
        thumb.tabIndex = i === index ? 0 : -1;
        if (i === index) thumb.setAttribute("aria-current", "true");
        else thumb.removeAttribute("aria-current");
      });
      at = index;
      if (moveFocus) button.focus();
      keepInView(strip, button, prefersReducedMotion() ? "auto" : "smooth");

      const swap = () => {
        main.src = source;
        main.alt = description;
        if (prefersReducedMotion()) return;
        main.animate(
          [{ opacity: 0.3, transform: "scale(1.015)" }, { opacity: 1, transform: "none" }],
          { duration: speed, easing: EASE.out },
        );
      };

      // Decode first: a swap that waits is invisible, a swap that does not
      // shows a hole where the photograph used to be.
      if (source && main.src !== source) {
        const preload = new Image();
        preload.src = source;
        (preload.decode?.() ?? Promise.resolve()).then(swap, swap);
      }
      // Only when the visitor moved: the region is already in the document, so
      // writing to it on mount would interrupt the page to say which
      // photograph was showing before anybody touched anything.
      if (announce) live.textContent = `Image ${index + 1} of ${thumbs.length}. ${description}`;
    };

    const onClick = (event) => {
      const button = event.currentTarget;
      paint(thumbs.indexOf(button), false, true);
    };
    const onKey = (event) => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
      if (step) { event.preventDefault(); paint(at + step, true, true); return; }
      if (event.key === "Home") { event.preventDefault(); paint(0, true, true); }
      if (event.key === "End") { event.preventDefault(); paint(thumbs.length - 1, true, true); }
    };

    thumbs.forEach((thumb) => {
      thumb.type = "button";
      thumb.classList.add("rm-product-gallery-thumb");
      thumb.addEventListener("click", onClick);
      thumb.addEventListener("keydown", onKey);
    });
    paint(0, false, false);

    cleanups.push(() => {
      thumbs.forEach((thumb) => {
        thumb.removeEventListener("click", onClick);
        thumb.removeEventListener("keydown", onKey);
        thumb.classList.remove("rm-product-gallery-thumb", "is-current");
        thumb.removeAttribute("aria-current");
        thumb.tabIndex = 0;
      });
      live.remove();
      if (firstSrc !== null) main.setAttribute("src", firstSrc);
      main.alt = firstAlt;
      main.classList.remove("rm-product-gallery-main");
      strip.classList.remove("rm-product-gallery-strip");
      holder.classList.remove("rm-product-gallery");
      holder.removeAttribute("role");
      if (hadLabel === null) holder.removeAttribute("aria-label");
      else holder.setAttribute("aria-label", hadLabel);
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * The real photograph magnified in place, not a second copy of it.
 *
 * The frame is the lens: it clips, and the one `<img>` already inside it scales
 * around the point under the pointer. There is no floating panel and no second
 * `<img src="…-2000.jpg">`, which is what the usual implementation does — that
 * downloads the picture twice, doubles the memory on a phone, and puts a second
 * copy of the alt text into the accessibility tree for no gain.
 *
 * The focal point is eased on the shared frame loop rather than written
 * straight from the pointer event, so a fast flick glides instead of snapping,
 * and the loop is wrapped in `whileVisible` so a gallery of these costs nothing
 * once it has scrolled away. It is a real toggle button, so the magnifier can
 * be turned on from the keyboard and panned with the arrow keys.
 *
 *   <figure data-rm-product-zoom data-rm-zoom="2.4">
 *     <img src="/shirt.jpg" alt="Linen shirt, close weave">
 *   </figure>
 */
export function productZoom(target = "[data-rm-product-zoom]", options = {}) {
  const frames = resolveElements(target);
  if (!frames.length) return () => {};

  const { zoom = 2.2, follow = 0.18, label = "Magnify image" } = options;
  const cleanups = [];

  for (const frame of frames) {
    const image = frame.querySelector("img");
    if (!image) continue;

    frame.classList.add("rm-product-zoom");
    image.classList.add("rm-product-zoom-image");
    const scale = Math.max(1, dataNumber(frame, "rmZoom", zoom));
    const rate = clamp(dataNumber(frame, "rmGlide", follow), 0.02, 1);

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "rm-product-zoom-toggle";
    toggle.textContent = dataString(frame, "rmLabel", label);
    toggle.setAttribute("aria-pressed", "false");
    frame.appendChild(toggle);

    const hint = document.createElement("p");
    hint.className = "rm-shop-said";
    hint.id = uid("rm-zoom-hint");
    hint.textContent = "When on, the arrow keys move the magnified area.";
    frame.appendChild(hint);
    toggle.setAttribute("aria-describedby", hint.id);

    let on = false;
    let wantX = 0.5;
    let wantY = 0.5;
    let atX = 0.5;
    let atY = 0.5;

    const draw = () => {
      image.style.transformOrigin = `${atX * 100}% ${atY * 100}%`;
      image.style.transform = on ? `scale(${scale})` : "none";
    };

    // One task on the shared loop, and only while the frame is on screen.
    const stopLoop = whileVisible(frame, () => onFrame(() => {
      if (!on && Math.abs(atX - 0.5) < 0.001 && Math.abs(atY - 0.5) < 0.001) return;
      const goalX = on ? wantX : 0.5;
      const goalY = on ? wantY : 0.5;
      atX += (goalX - atX) * rate;
      atY += (goalY - atY) * rate;
      draw();
    }));

    const set = (next) => {
      on = next;
      frame.classList.toggle("is-zoomed", on);
      toggle.setAttribute("aria-pressed", String(on));
      if (prefersReducedMotion()) { atX = on ? wantX : 0.5; atY = on ? wantY : 0.5; draw(); }
    };

    const onMove = (event) => {
      const box = frame.getBoundingClientRect();
      wantX = clamp((event.clientX - box.left) / box.width, 0, 1);
      wantY = clamp((event.clientY - box.top) / box.height, 0, 1);
      if (!on) set(true);
    };
    const onLeave = () => set(false);
    const onToggle = () => { set(!on); if (on) frame.focus(); };
    const onKey = (event) => {
      const step = 0.06;
      const moves = {
        ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step],
      };
      if (event.key === "Escape" && on) { event.preventDefault(); set(false); toggle.focus(); return; }
      const move = moves[event.key];
      if (!move || !on) return;
      event.preventDefault();
      wantX = clamp(wantX + move[0], 0, 1);
      wantY = clamp(wantY + move[1], 0, 1);
      if (prefersReducedMotion()) { atX = wantX; atY = wantY; draw(); }
    };

    frame.tabIndex = -1;
    frame.addEventListener("pointermove", onMove);
    frame.addEventListener("pointerleave", onLeave);
    frame.addEventListener("keydown", onKey);
    toggle.addEventListener("click", onToggle);

    cleanups.push(() => {
      stopLoop();
      frame.removeEventListener("pointermove", onMove);
      frame.removeEventListener("pointerleave", onLeave);
      frame.removeEventListener("keydown", onKey);
      toggle.remove();
      hint.remove();
      frame.removeAttribute("tabindex");
      image.style.transform = "";
      image.style.transformOrigin = "";
      image.classList.remove("rm-product-zoom-image");
      frame.classList.remove("rm-product-zoom", "is-zoomed");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Real radios, with the colour written down.
 *
 * The chips are `<input type="radio">` inside a labelled group, hidden with a
 * clip rather than `display: none` so they keep their focus ring, their arrow
 * keys and their form value. Every label carries the colour's name as text, not
 * only as a background — a swatch is a colour, and a colour is not a name to
 * somebody who cannot see it or cannot separate two of them.
 *
 * One ring marks the choice and FLIPs from the old chip to the new one, so what
 * looks like a growing outline is a measured transform with no layout work at
 * all. Animating the ring's own width and position instead makes the browser
 * re-lay-out the whole row on every frame of a decoration.
 *
 *   <fieldset data-rm-swatches>
 *     <legend>Colour</legend>
 *     <label><input type="radio" name="colour" value="ochre" data-rm-color="#c9922f" checked> Ochre</label>
 *     <label><input type="radio" name="colour" value="ink" data-rm-color="#101014"> Ink</label>
 *   </fieldset>
 */
export function colourSwatches(target = "[data-rm-swatches]", options = {}) {
  const groups = resolveElements(target);
  if (!groups.length) return () => {};

  const { duration = 340 } = options;
  const cleanups = [];

  for (const group of groups) {
    const inputs = [...group.querySelectorAll('input[type="radio"]')];
    if (!inputs.length) continue;

    group.classList.add("rm-swatches");
    const speed = dataNumber(group, "rmDuration", duration);
    const live = announcer(group);

    const ring = document.createElement("i");
    ring.className = "rm-swatches-ring";
    ring.setAttribute("aria-hidden", "true");
    ring.hidden = true;
    group.appendChild(ring);

    const chips = inputs.map((input) => {
      const label = input.closest("label") ?? input.parentElement;
      label?.classList.add("rm-swatches-chip");
      const dot = document.createElement("i");
      dot.className = "rm-swatches-dot";
      dot.setAttribute("aria-hidden", "true");
      dot.style.background = dataString(input, "rmColor", "currentColor");
      input.after(dot);
      return { input, label, dot };
    });

    const place = (animated) => {
      const chosen = chips.find(({ input }) => input.checked);
      if (!chosen?.label) { ring.hidden = true; return; }
      const was = ring.hidden ? null : ring.getBoundingClientRect();
      const box = chosen.label.getBoundingClientRect();
      const home = group.getBoundingClientRect();

      ring.hidden = false;
      ring.style.width = `${box.width}px`;
      ring.style.height = `${box.height}px`;
      ring.style.left = `${box.left - home.left}px`;
      ring.style.top = `${box.top - home.top}px`;
      if (animated && was) flip(ring, was, speed);
    };

    const onChange = (event) => {
      place(true);
      const chosen = event.target.closest("label");
      live.textContent = `${chosen?.textContent.trim() ?? event.target.value} selected`;
      if (!prefersReducedMotion()) {
        const dot = chips.find(({ input }) => input === event.target)?.dot;
        dot?.animate(
          [{ transform: "scale(0.82)" }, { transform: "scale(1)" }],
          { duration: 260, easing: EASE.spring },
        );
      }
    };
    group.addEventListener("change", onChange);

    // The ring is placed from measurement, so it has to be re-measured when the
    // row wraps to a new line.
    const watcher = new ResizeObserver(() => place(false));
    watcher.observe(group);
    place(false);

    cleanups.push(() => {
      watcher.disconnect();
      group.removeEventListener("change", onChange);
      chips.forEach(({ label, dot }) => { dot.remove(); label?.classList.remove("rm-swatches-chip"); });
      ring.remove();
      live.remove();
      group.classList.remove("rm-swatches");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Real radios, and out of stock actually said out loud.
 *
 * A size that has sold out is `disabled`, which takes it out of the arrow-key
 * cycle for free, and it also gets the words "out of stock" as text that is read
 * but not drawn. That second half is the part everybody forgets: a diagonal
 * line through "M" is a visual convention with no spoken equivalent, so without
 * it a screen reader simply announces "M, dimmed" and leaves the visitor to
 * guess why.
 *
 * Choosing a size announces the size, and pressing a sold-out one is impossible
 * rather than merely discouraged.
 *
 *   <fieldset data-rm-size-picker>
 *     <legend>Size</legend>
 *     <label><input type="radio" name="size" value="s"> S</label>
 *     <label><input type="radio" name="size" value="m" data-rm-sold-out="true"> M</label>
 *   </fieldset>
 */
export function sizePicker(target = "[data-rm-size-picker]", options = {}) {
  const groups = resolveElements(target);
  if (!groups.length) return () => {};

  const { soldOutText = "out of stock" } = options;
  const cleanups = [];

  for (const group of groups) {
    const inputs = [...group.querySelectorAll('input[type="radio"]')];
    if (!inputs.length) continue;

    group.classList.add("rm-size-picker");
    const live = announcer(group);
    const notes = [];
    // Only the ones this component disabled, so the cleanup cannot re-enable a
    // size the author had switched off for reasons of their own.
    const stopped = [];

    for (const input of inputs) {
      const label = input.closest("label") ?? input.parentElement;
      label?.classList.add("rm-size-picker-option");
      const gone = dataString(input, "rmSoldOut", "false") === "true";
      if (!gone) continue;

      if (!input.disabled) { input.disabled = true; stopped.push(input); }
      label?.classList.add("is-gone");
      const note = said(`, ${dataString(input, "rmLabel", soldOutText)}`);
      label?.appendChild(note);
      notes.push(note);
    }

    const onChange = (event) => {
      const label = event.target.closest("label");
      live.textContent = `Size ${label?.textContent.trim() ?? event.target.value} selected`;
      if (prefersReducedMotion()) return;
      label?.animate(
        [{ transform: "scale(0.94)" }, { transform: "scale(1)" }],
        { duration: 280, easing: EASE.spring },
      );
    };
    group.addEventListener("change", onChange);

    cleanups.push(() => {
      group.removeEventListener("change", onChange);
      notes.forEach((note) => note.remove());
      stopped.forEach((input) => { input.disabled = false; });
      inputs.forEach((input) => {
        const label = input.closest("label") ?? input.parentElement;
        label?.classList.remove("rm-size-picker-option", "is-gone");
      });
      live.remove();
      group.classList.remove("rm-size-picker");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A price with a struck original that is not only struck.
 *
 * `text-decoration: line-through` is drawn and nothing more: to a screen reader
 * "40" and "24" are two numbers in a row with no relationship, which is exactly
 * the wrong impression to give about money. So the tag builds its own name —
 * "now 24 euros, was 40 euros, save 40 percent" — from `Intl.NumberFormat` with
 * `currencyDisplay: "name"`, and marks the parts `aria-hidden` so the number is
 * announced once rather than three times.
 *
 * Updating the price rolls the new figure in and the old one out on transforms
 * alone, at a width that does not change, so a live price in a variant picker
 * never nudges the button beside it.
 *
 *   <p data-rm-price-tag data-rm-price="24" data-rm-was="40" data-rm-currency="EUR"></p>
 *   tag.rmSet(19.5);
 */
export function priceTag(target = "[data-rm-price-tag]", options = {}) {
  const tags = resolveElements(target);
  if (!tags.length) return () => {};

  const { currency = "EUR", locale = undefined, duration = 300 } = options;
  const cleanups = [];

  for (const tag of tags) {
    const original = tag.innerHTML;
    tag.classList.add("rm-price-tag");
    const unit = dataString(tag, "rmCurrency", currency);
    const where = dataString(tag, "rmLocale", locale ?? navigator.language ?? "en-GB");

    const now = document.createElement("strong");
    now.className = "rm-price-tag-now";
    now.setAttribute("aria-hidden", "true");
    const before = document.createElement("s");
    before.className = "rm-price-tag-was";
    before.setAttribute("aria-hidden", "true");
    tag.replaceChildren(now, before);

    let price = dataNumber(tag, "rmPrice", 0);
    let was = dataNumber(tag, "rmWas", 0);

    const paint = (roll) => {
      const cheap = money(price, unit, where);
      const full = was > price ? money(was, unit, where) : null;
      const off = full ? Math.round((1 - price / was) * 100) : 0;

      now.textContent = cheap.drawn;
      before.textContent = full ? full.drawn : "";
      before.hidden = !full;
      tag.classList.toggle("is-reduced", Boolean(full));
      tag.setAttribute(
        "aria-label",
        full ? `Now ${cheap.spoken}, was ${full.spoken}, save ${off} percent` : cheap.spoken,
      );

      if (!roll || prefersReducedMotion()) return;
      now.animate(
        [{ transform: "translateY(0.5em)", opacity: 0 }, { transform: "none", opacity: 1 }],
        { duration, easing: EASE.out },
      );
    };
    paint(false);

    tag.rmSet = (next, previous = was) => {
      price = next;
      was = previous;
      paint(true);
    };

    cleanups.push(() => {
      delete tag.rmSet;
      tag.removeAttribute("aria-label");
      tag.classList.remove("rm-price-tag", "is-reduced");
      tag.innerHTML = original;
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A percentage, popped in from its own centre.
 *
 * It scales out of nothing rather than growing a box, so the card it is pinned
 * to never reflows as it appears — a badge that changes the flow is a badge that
 * shoves the price sideways at the moment somebody is reading it.
 *
 * The label spells out what the number means. "-40%" beside a price is a
 * convention that reads, out loud, as "minus forty percent", which is not what
 * the shop is offering.
 *
 *   <span data-rm-discount-badge="40"></span>
 */
export function discountBadge(target = "[data-rm-discount-badge]", options = {}) {
  const badges = resolveElements(target);
  if (!badges.length) return () => {};

  const { percent = 0, label = "off", duration = 480 } = options;
  const cleanups = [];

  for (const badge of badges) {
    const original = badge.textContent;
    badge.classList.add("rm-discount-badge");

    let value = dataNumber(badge, "rmDiscountBadge", percent);
    const word = dataString(badge, "rmLabel", label);

    const paint = (pop) => {
      badge.textContent = `−${Math.round(value)}%`;
      badge.setAttribute("aria-label", `${Math.round(value)} percent ${word}`);
      badge.hidden = value <= 0;
      if (!pop || prefersReducedMotion() || badge.hidden) return;
      badge.animate(
        [
          { transform: "scale(0.4) rotate(-8deg)", opacity: 0 },
          { transform: "none", opacity: 1 },
        ],
        { duration, easing: EASE.spring },
      );
    };
    paint(true);

    badge.rmSet = (next) => { value = next; paint(true); };

    cleanups.push(() => {
      delete badge.rmSet;
      badge.hidden = false;
      badge.removeAttribute("aria-label");
      badge.textContent = original;
      badge.classList.remove("rm-discount-badge");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * How many are left, drawn and announced.
 *
 * A real `role="progressbar"` with `aria-valuenow`, `aria-valuemax` and — the
 * one that matters — `aria-valuetext`, so it is read as "3 of 20 left" rather
 * than "15 percent". A percentage is the wrong unit for scarcity; nobody buys
 * faster because a bar is fifteen percent full.
 *
 * The fill is a `scaleX` on a bar that is already full width, so dropping the
 * stock costs one composited frame instead of a re-layout of the row. Low stock
 * changes the colour and the wording together, because a colour on its own is a
 * warning only some people receive.
 *
 *   <div data-rm-stock-meter data-rm-left="3" data-rm-max="20" data-rm-low="5"></div>
 *   meter.rmSet(2);
 */
export function stockMeter(target = "[data-rm-stock-meter]", options = {}) {
  const meters = resolveElements(target);
  if (!meters.length) return () => {};

  const { left = 0, max = 10, low = 3, duration = 520 } = options;
  const cleanups = [];

  for (const meter of meters) {
    meter.classList.add("rm-stock-meter");
    meter.setAttribute("role", "progressbar");
    meter.setAttribute("aria-valuemin", "0");

    const total = Math.max(1, dataNumber(meter, "rmMax", max));
    const threshold = dataNumber(meter, "rmLow", low);
    meter.setAttribute("aria-valuemax", String(total));
    meter.style.setProperty(
      "--rm-stock-meter-duration",
      `${prefersReducedMotion() ? 0 : dataNumber(meter, "rmDuration", duration)}ms`,
    );

    const track = document.createElement("span");
    track.className = "rm-stock-meter-track";
    track.setAttribute("aria-hidden", "true");
    const fill = document.createElement("i");
    track.appendChild(fill);
    const words = document.createElement("span");
    words.className = "rm-stock-meter-words";
    meter.append(track, words);

    const set = (value) => {
      const remaining = clamp(Math.round(value), 0, total);
      const scarce = remaining > 0 && remaining <= threshold;
      meter.style.setProperty("--rm-stock-meter-value", String(remaining / total));
      meter.setAttribute("aria-valuenow", String(remaining));
      meter.classList.toggle("is-low", scarce);
      meter.classList.toggle("is-gone", remaining === 0);

      const sentence = remaining === 0
        ? "Out of stock"
        : scarce ? `Only ${remaining} left` : `${remaining} of ${total} left`;
      words.textContent = sentence;
      meter.setAttribute("aria-valuetext", sentence);
    };
    set(dataNumber(meter, "rmLeft", left));
    meter.rmSet = set;

    cleanups.push(() => {
      delete meter.rmSet;
      track.remove();
      words.remove();
      ["role", "aria-valuemin", "aria-valuemax", "aria-valuenow", "aria-valuetext"]
        .forEach((name) => meter.removeAttribute(name));
      meter.classList.remove("rm-stock-meter", "is-low", "is-gone");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A read-only score, with the number in text beside it.
 *
 * Five glyphs and a `clip-path` over a coloured copy of them, so 4.3 stars is
 * genuinely four and a third rather than a rounded four — and the clip is on a
 * layer of its own, which means the partial star costs nothing to redraw. The
 * stars themselves are `aria-hidden`; the score is a sentence.
 *
 * The mistake worth avoiding is labelling the row "★★★★☆": read aloud that is
 * either five identical words or nothing at all, and it hides the decimal that
 * the number actually contains. "4.3 out of 5, 128 reviews" is the whole
 * message in one line.
 *
 *   <p data-rm-rating-stars data-rm-score="4.3" data-rm-out-of="5"></p>
 */
export function ratingStars(target = "[data-rm-rating-stars]", options = {}) {
  const rows = resolveElements(target);
  if (!rows.length) return () => {};

  const { score = 0, outOf = 5, glyph = "★" } = options;
  const cleanups = [];

  for (const row of rows) {
    const original = row.innerHTML;
    row.classList.add("rm-rating-stars");

    const total = Math.max(1, Math.round(dataNumber(row, "rmOutOf", outOf)));
    let value = clamp(dataNumber(row, "rmScore", score), 0, total);

    const shape = document.createElement("span");
    shape.className = "rm-rating-stars-shape";
    shape.setAttribute("aria-hidden", "true");
    const back = document.createElement("span");
    back.className = "rm-rating-stars-back";
    back.textContent = glyph.repeat(total);
    const front = document.createElement("span");
    front.className = "rm-rating-stars-front";
    front.textContent = glyph.repeat(total);
    shape.append(back, front);

    const number = document.createElement("span");
    number.className = "rm-rating-stars-number";
    row.replaceChildren(shape, number);

    const paint = (grow) => {
      const share = value / total;
      front.style.clipPath = `inset(0 ${(1 - share) * 100}% 0 0)`;
      number.textContent = `${Number(value.toFixed(2))} out of ${total}`;
      if (!grow || prefersReducedMotion()) return;
      front.animate(
        [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: `inset(0 ${(1 - share) * 100}% 0 0)` }],
        { duration: 640, easing: EASE.out },
      );
    };
    paint(false);

    row.rmSet = (next) => { value = clamp(next, 0, total); paint(true); };

    // It fills as it arrives, once. `watch` with `once: true` is the primitive
    // for that; `whileVisible` re-runs its task every time the element comes
    // back on screen and every time the tab returns to the front, which would
    // have a settled score re-filling from zero each time you scrolled past it.
    cleanups.push(watch(row, () => paint(true), { threshold: 0.35, once: true }));

    cleanups.push(() => {
      delete row.rmSet;
      row.classList.remove("rm-rating-stars");
      row.innerHTML = original;
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * The distribution, as bars that grow by transform.
 *
 * Each row is "5 stars, 128 reviews, 62 percent" in text with the bar marked
 * `aria-hidden` beside it, because a bar chart with no numbers is a picture. The
 * bars grow with `scaleX` from a left origin when the block comes into view, so
 * a chart of five rows animates without touching layout once.
 *
 * The percentage is taken from the total, not from the largest row. Scaling to
 * the biggest bar makes every product look like it has one dominant rating,
 * which is a flattering lie a shop should not tell.
 *
 *   <ul data-rm-review-summary>
 *     <li data-rm-value="128">5</li>
 *     <li data-rm-value="40">4</li>
 *   </ul>
 */
export function reviewSummary(target = "[data-rm-review-summary]", options = {}) {
  const charts = resolveElements(target);
  if (!charts.length) return () => {};

  const { duration = 760, label = "Rating distribution" } = options;
  const cleanups = [];

  for (const chart of charts) {
    const rows = [...chart.children];
    if (!rows.length) continue;

    // Each row's own text is the star number, and it is read and then thrown
    // away as the row is rebuilt — so the whole chart is stashed first and put
    // back whole, exactly as priceTag and resultCount do with theirs.
    const original = chart.innerHTML;
    chart.classList.add("rm-review-summary");
    chart.setAttribute("role", "group");
    const hadLabel = chart.getAttribute("aria-label");
    chart.setAttribute("aria-label", dataString(chart, "rmLabel", hadLabel ?? label));

    const counts = rows.map((row) => Math.max(0, dataNumber(row, "rmValue", 0)));
    const total = counts.reduce((sum, n) => sum + n, 0) || 1;
    const speed = dataNumber(chart, "rmDuration", duration);
    const bars = [];

    rows.forEach((row, i) => {
      const stars = row.textContent.trim();
      row.classList.add("rm-review-summary-row");
      const share = counts[i] / total;

      const bar = document.createElement("span");
      bar.className = "rm-review-summary-bar";
      bar.setAttribute("aria-hidden", "true");
      const fill = document.createElement("i");
      fill.style.setProperty("--rm-review-summary-share", String(share));
      bar.appendChild(fill);

      row.textContent = "";
      row.append(
        Object.assign(document.createElement("span"), {
          className: "rm-review-summary-label", textContent: `${stars} stars`,
        }),
        bar,
        Object.assign(document.createElement("span"), {
          className: "rm-review-summary-count",
          textContent: `${counts[i]} (${Math.round(share * 100)}%)`,
        }),
      );
      bars.push({ fill, share });
    });

    const play = () => {
      if (prefersReducedMotion()) return;
      bars.forEach(({ fill, share }, i) => {
        fill.animate(
          [{ transform: "scaleX(0)" }, { transform: `scaleX(${share})` }],
          { duration: speed, delay: i * 70, easing: EASE.out, fill: "backwards" },
        );
      });
    };

    // Once, on arrival. `whileVisible` would re-grow every bar from zero each
    // time the chart came back into view or the tab was brought forward, which
    // makes a static distribution look like live data.
    cleanups.push(watch(chart, () => play(), { threshold: 0.35, once: true }));
    cleanups.push(() => {
      chart.classList.remove("rm-review-summary");
      chart.removeAttribute("role");
      if (hadLabel === null) chart.removeAttribute("aria-label");
      else chart.setAttribute("aria-label", hadLabel);
      chart.innerHTML = original;
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * A button that confirms and comes back, at one width.
 *
 * The three faces — the label, the wait and the tick — are stacked in the same
 * grid cell, so the button is already as wide as its widest state before
 * anything happens and switching between them is opacity and transform only.
 * Swapping `textContent` instead, which is what everyone does first, resizes the
 * button mid-click and slides it out from under the pointer.
 *
 * While it is working it is `aria-disabled` rather than `disabled`: a disabled
 * button loses focus, and losing focus at the moment of the click drops a
 * keyboard visitor back to the top of the document.
 *
 * The three faces are `aria-hidden` and the button keeps one fixed
 * `aria-label`, so the result is announced by the live region beside it and by
 * nothing else. Left visible to the accessibility tree the faces *are* the
 * button's computed name — the inactive ones are `visibility: hidden`, which
 * takes them out of it — so the name would change from "Add to bag" to
 * "Adding…" to "Added" underneath the live region, and the visitor would hear
 * the same event announced twice.
 *
 *   <button type="button" data-rm-add-to-cart data-rm-done="Added">Add to bag</button>
 */
export function addToCart(target = "[data-rm-add-to-cart]", options = {}) {
  const buttons = resolveElements(target);
  if (!buttons.length) return () => {};

  const { busyText = "Adding…", doneText = "Added", hold = 1800, onAdd } = options;
  const cleanups = [];

  for (const button of buttons) {
    const original = button.innerHTML;
    const hadLabel = button.getAttribute("aria-label");
    const name = hadLabel ?? button.textContent.trim();
    const doneWord = dataString(button, "rmDone", doneText);
    button.type = "button";
    button.classList.add("rm-add-to-cart");

    const idle = document.createElement("span");
    idle.className = "rm-add-to-cart-face is-on";
    idle.innerHTML = original;
    const busy = document.createElement("span");
    busy.className = "rm-add-to-cart-face";
    busy.textContent = dataString(button, "rmHint", busyText);
    const done = document.createElement("span");
    done.className = "rm-add-to-cart-face";
    done.textContent = `✓ ${doneWord}`;
    [idle, busy, done].forEach((one) => one.setAttribute("aria-hidden", "true"));
    button.replaceChildren(idle, busy, done);
    // The name is now fixed, because nothing left inside the button is in the
    // accessibility tree to supply one.
    button.setAttribute("aria-label", name);

    const live = document.createElement("span");
    live.className = "rm-shop-live";
    live.setAttribute("role", "status");
    live.setAttribute("aria-live", "polite");
    button.after(live);

    const wait = dataNumber(button, "rmHold", hold);
    let state = "idle";
    let timer = 0;

    const face = (which) => {
      [idle, busy, done].forEach((one) => one.classList.remove("is-on"));
      which.classList.add("is-on");
      if (prefersReducedMotion()) return;
      which.animate(
        [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }],
        { duration: 260, easing: EASE.out },
      );
    };

    const settle = () => {
      state = "done";
      face(done);
      live.textContent = `${doneWord}.`;
      button.setAttribute("aria-disabled", "false");
      if (!prefersReducedMotion()) {
        button.animate(
          [{ transform: "scale(1)" }, { transform: "scale(1.04)" }, { transform: "scale(1)" }],
          { duration: 420, easing: EASE.spring },
        );
      }
      timer = setTimeout(() => { state = "idle"; face(idle); }, wait);
    };

    const go = () => {
      // aria-disabled, never disabled: the button must keep the focus it has.
      if (state !== "idle") return;
      state = "busy";
      face(busy);
      button.setAttribute("aria-disabled", "true");
      const result = onAdd?.(button);
      if (result && typeof result.then === "function") result.then(settle, settle);
      else settle();
    };
    button.addEventListener("click", go);
    button.rmAdd = go;

    cleanups.push(() => {
      clearTimeout(timer);
      button.removeEventListener("click", go);
      delete button.rmAdd;
      live.remove();
      button.removeAttribute("aria-disabled");
      if (hadLabel === null) button.removeAttribute("aria-label");
      button.classList.remove("rm-add-to-cart");
      button.innerHTML = original;
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A toggle button with `aria-pressed`, and a name that stays still.
 *
 * The accessible name never changes — it is always "Save for later" — and the
 * state lives entirely in `aria-pressed`. Swapping the label to "Saved" as well,
 * which is the common version, has a screen reader announce "Saved, pressed",
 * so the visitor is told the same thing twice and told nothing about what the
 * button will do next.
 *
 * The pop is a scale on the heart plus one ring expanding out of it, both on
 * their own layers, so the row of cards behind never moves. Under reduced motion
 * the heart simply fills, which is the whole message.
 *
 *   <button type="button" data-rm-wishlist aria-label="Save for later"></button>
 */
export function wishlistHeart(target = "[data-rm-wishlist]", options = {}) {
  const buttons = resolveElements(target);
  if (!buttons.length) return () => {};

  const { label = "Save for later", onToggle } = options;
  const cleanups = [];

  for (const button of buttons) {
    const original = button.innerHTML;
    button.type = "button";
    button.classList.add("rm-wishlist");
    button.setAttribute("aria-label", dataString(button, "rmLabel", button.getAttribute("aria-label") ?? label));

    const heart = document.createElement("span");
    heart.className = "rm-wishlist-heart";
    heart.setAttribute("aria-hidden", "true");
    heart.innerHTML =
      '<svg viewBox="0 0 24 24"><path d="M12 20.4 3.9 12.6a4.9 4.9 0 0 1 0-7 4.6 4.6 0 0 1 6.6 0l1.5 1.5 '
      + '1.5-1.5a4.6 4.6 0 0 1 6.6 0 4.9 4.9 0 0 1 0 7Z" fill="none" stroke="currentColor" '
      + 'stroke-width="1.7" stroke-linejoin="round"/></svg>';
    const ring = document.createElement("i");
    ring.className = "rm-wishlist-ring";
    ring.setAttribute("aria-hidden", "true");
    button.replaceChildren(heart, ring);

    let on = dataString(button, "rmPressed", "false") === "true";
    const paint = () => {
      button.setAttribute("aria-pressed", String(on));
      button.classList.toggle("is-on", on);
    };
    paint();

    const flipIt = () => {
      on = !on;
      paint();
      onToggle?.(on, button);
      if (prefersReducedMotion() || !on) return;
      heart.animate(
        [{ transform: "scale(1)" }, { transform: "scale(0.78)" }, { transform: "scale(1.18)" }, { transform: "scale(1)" }],
        { duration: 560, easing: EASE.spring },
      );
      ring.animate(
        [{ transform: "scale(0.5)", opacity: 0.65 }, { transform: "scale(2.1)", opacity: 0 }],
        { duration: 620, easing: EASE.out },
      );
    };
    button.addEventListener("click", flipIt);
    button.rmSet = (next) => { on = Boolean(next); paint(); };

    cleanups.push(() => {
      button.removeEventListener("click", flipIt);
      delete button.rmSet;
      button.removeAttribute("aria-pressed");
      button.classList.remove("rm-wishlist", "is-on");
      button.innerHTML = original;
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A shelf that slides over the page rather than into it.
 *
 * The tray is fixed and translates up from below, so adding the first product
 * does not push the catalogue up by seventy pixels and take the row somebody was
 * reading with it. When it is empty it is `hidden` and `inert` together, because
 * a tray that is only transformed off screen is still in the tab order and still
 * collects focus from nowhere.
 *
 * Removing an item FLIPs the survivors from their old positions, so the row
 * closes up instead of jumping, and the count is announced politely — a compare
 * tray is a side effect of a click somewhere else, so it should never interrupt.
 *
 *   <div data-rm-compare-tray data-rm-max="4"></div>
 *   tray.rmAdd("sku-1", { label: "Linen shirt", image: "/t1.jpg" });
 */
export function compareTray(target = "[data-rm-compare-tray]", options = {}) {
  const trays = resolveElements(target);
  if (!trays.length) return () => {};

  const { max = 4, label = "Compare", duration = 320 } = options;
  const cleanups = [];

  for (const tray of trays) {
    tray.classList.add("rm-compare-tray");
    tray.setAttribute("role", "region");
    tray.setAttribute("aria-label", dataString(tray, "rmLabel", label));
    const limit = Math.max(1, dataNumber(tray, "rmMax", max));

    const list = document.createElement("ul");
    list.className = "rm-compare-tray-list";
    const live = announcer(tray);
    tray.append(list, live);

    const shut = () => {
      tray.hidden = true;
      tray.inert = true;
    };
    const open = () => {
      if (!tray.hidden) return;
      tray.hidden = false;
      tray.inert = false;
      if (prefersReducedMotion()) return;
      tray.animate(
        [{ transform: "translateY(100%)", opacity: 0 }, { transform: "none", opacity: 1 }],
        { duration: 380, easing: EASE.out },
      );
    };
    shut();

    const items = new Map();
    const announce = () => {
      live.textContent = items.size
        ? `${items.size} of ${limit} selected to compare`
        : "Compare list empty";
    };

    tray.rmRemove = (id) => {
      const row = items.get(id);
      if (!row) return;
      const boxes = [...list.children].map((node) => [node, node.getBoundingClientRect()]);
      items.delete(id);
      row.remove();
      boxes.forEach(([node, was]) => { if (node.isConnected) flip(node, was, duration); });
      announce();
      if (!items.size) shut();
    };

    tray.rmAdd = (id, { label: name = String(id), image = "" } = {}) => {
      if (items.has(id) || items.size >= limit) return null;
      const row = document.createElement("li");
      row.className = "rm-compare-tray-item";

      if (image) {
        const thumb = document.createElement("img");
        thumb.src = image;
        thumb.alt = "";
        row.appendChild(thumb);
      }
      const text = document.createElement("span");
      text.textContent = name;
      const drop = document.createElement("button");
      drop.type = "button";
      drop.className = "rm-compare-tray-drop";
      drop.setAttribute("aria-label", `Remove ${name} from compare`);
      drop.textContent = "×";
      drop.addEventListener("click", () => tray.rmRemove(id));
      row.append(text, drop);

      list.appendChild(row);
      items.set(id, row);
      open();
      announce();
      if (!prefersReducedMotion()) {
        row.animate(
          [{ opacity: 0, transform: "translateY(10px) scale(0.94)" }, { opacity: 1, transform: "none" }],
          { duration, easing: EASE.out },
        );
      }
      return row;
    };

    cleanups.push(() => {
      delete tray.rmAdd;
      delete tray.rmRemove;
      list.remove();
      live.remove();
      tray.inert = false;
      tray.hidden = false;
      tray.classList.remove("rm-compare-tray");
      tray.removeAttribute("role");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A dialog that traps focus and gives it back.
 *
 * Openers are found by `aria-controls` pointing at the dialog, so the wiring is
 * the same attribute that tells assistive technology what the button does — no
 * second bespoke attribute, and no way for the two to disagree. The rest of the
 * page is `inert` while it is open, which removes it from the tab order, from
 * the screen reader's virtual cursor and from find-in-page all at once; the
 * hand-rolled Tab-wrapping trap does only the first of those.
 *
 * Escape closes it, the backdrop closes it, and focus goes back to the button
 * that opened it. Losing the return is the failure people notice most: you close
 * a quick view and find yourself at the top of a catalogue of two hundred cards.
 *
 *   <button type="button" aria-controls="quick-1">Quick view</button>
 *   <div id="quick-1" data-rm-quick-view hidden><h2>Linen shirt</h2>…</div>
 */
export function quickView(target = "[data-rm-quick-view]", options = {}) {
  const panels = resolveElements(target);
  if (!panels.length) return () => {};

  const { label = "Quick view", duration = 320 } = options;
  const cleanups = [];

  for (const panel of panels) {
    if (!panel.id) panel.id = uid("rm-quick-view");
    panel.classList.add("rm-quick-view");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.hidden = true;

    const heading = panel.querySelector("h1, h2, h3");
    if (heading) {
      if (!heading.id) heading.id = uid("rm-quick-view-title");
      panel.setAttribute("aria-labelledby", heading.id);
    } else {
      panel.setAttribute("aria-label", dataString(panel, "rmLabel", label));
    }

    const veil = document.createElement("div");
    veil.className = "rm-quick-view-veil";
    veil.hidden = true;
    panel.before(veil);

    const shut = document.createElement("button");
    shut.type = "button";
    shut.className = "rm-quick-view-close";
    shut.setAttribute("aria-label", "Close");
    shut.textContent = "×";
    panel.prepend(shut);

    let opener = null;
    let sealed = [];
    let openers = [];

    // The trigger has to say which way round the dialog is. A button stuck at
    // aria-expanded="false" while its dialog is open tells anyone who tabs back
    // to it, or is returned to it on close, the opposite of the truth — which
    // is worse than never having claimed anything.
    const expanded = (state) => openers.forEach((b) => b.setAttribute("aria-expanded", String(state)));

    const close = () => {
      if (panel.hidden) return;
      panel.hidden = true;
      veil.hidden = true;
      sealed.forEach((node) => { node.inert = false; });
      sealed = [];
      expanded(false);
      opener?.focus();
      opener = null;
    };

    const open = (from) => {
      if (!panel.hidden) return;
      opener = from ?? document.activeElement;
      panel.hidden = false;
      veil.hidden = false;
      expanded(true);

      sealed = [...document.body.children]
        .filter((node) => node !== panel && node !== veil && !node.contains(panel));
      sealed.forEach((node) => { node.inert = true; });

      (focusable(panel)[0] ?? panel).focus();
      if (prefersReducedMotion()) return;
      veil.animate([{ opacity: 0 }, { opacity: 1 }], { duration, easing: EASE.out });
      panel.animate(
        [{ opacity: 0, transform: "translateY(18px) scale(0.98)" }, { opacity: 1, transform: "none" }],
        { duration: duration + 80, easing: EASE.out },
      );
    };

    const onKey = (event) => {
      if (panel.hidden) return;
      if (event.key === "Escape") { event.preventDefault(); close(); return; }
      if (event.key !== "Tab") return;
      // `inert` already keeps the page out of reach; this keeps the loop tight
      // inside the dialog rather than escaping to the browser chrome.
      const stops = focusable(panel);
      if (!stops.length) return;
      const first = stops[0];
      const last = stops[stops.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };

    openers = [...document.querySelectorAll(`[aria-controls="${panel.id}"]`)];
    const onOpen = (event) => { event.preventDefault(); open(event.currentTarget); };
    openers.forEach((button) => {
      button.setAttribute("aria-haspopup", "dialog");
      button.setAttribute("aria-expanded", "false");
      button.addEventListener("click", onOpen);
    });

    shut.addEventListener("click", close);
    veil.addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    panel.rmOpen = open;
    panel.rmClose = close;

    cleanups.push(() => {
      document.removeEventListener("keydown", onKey);
      openers.forEach((button) => {
        button.removeEventListener("click", onOpen);
        button.removeAttribute("aria-haspopup");
        button.removeAttribute("aria-expanded");
      });
      sealed.forEach((node) => { node.inert = false; });
      delete panel.rmOpen;
      delete panel.rmClose;
      shut.remove();
      veil.remove();
      panel.hidden = false;
      panel.classList.remove("rm-quick-view");
      ["role", "aria-modal", "aria-labelledby"].forEach((name) => panel.removeAttribute(name));
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Description, details, reviews, with an underline that slides.
 *
 * A proper `tablist`: one tab stop for the whole set, arrows to move between
 * tabs, Home and End for the ends, `aria-selected` on the chosen one and
 * `aria-controls` pointing at a real panel. Buttons that merely toggle a class
 * are announced as buttons, in a row, with no hint that they are alternatives
 * for one region.
 *
 * The underline is a single element that FLIPs from tab to tab — measured, then
 * moved with translate and scaleX — rather than a bar whose `left` and `width`
 * are transitioned, which is a layout animation on every frame. Panels are
 * toggled with `hidden`, so before the script runs all of the content is simply
 * there, in order, and nothing is invisible.
 *
 *   <div data-rm-product-tabs>
 *     <div role="tablist"><button type="button" aria-controls="p1">Details</button></div>
 *     <section id="p1">…</section>
 *   </div>
 */
export function productTabs(target = "[data-rm-product-tabs]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { duration = 340, label = "Product information" } = options;
  const cleanups = [];

  for (const holder of holders) {
    const tabs = [...holder.querySelectorAll("button[aria-controls]")];
    const panels = tabs.map((tab) => document.getElementById(tab.getAttribute("aria-controls")));
    if (!tabs.length || panels.some((panel) => !panel)) continue;

    holder.classList.add("rm-product-tabs");
    const bar = tabs[0].parentElement;
    bar.classList.add("rm-product-tabs-bar");
    bar.setAttribute("role", "tablist");
    bar.setAttribute("aria-label", dataString(holder, "rmLabel", label));
    const speed = dataNumber(holder, "rmDuration", duration);

    const line = document.createElement("i");
    line.className = "rm-product-tabs-line";
    line.setAttribute("aria-hidden", "true");
    line.hidden = true;
    bar.appendChild(line);

    let at = 0;
    const place = (animated) => {
      const tab = tabs[at];
      const was = line.hidden ? null : line.getBoundingClientRect();
      const box = tab.getBoundingClientRect();
      const home = bar.getBoundingClientRect();
      line.hidden = false;
      line.style.width = `${box.width}px`;
      line.style.left = `${box.left - home.left + bar.scrollLeft}px`;
      if (animated && was) flip(line, was, speed);
    };

    const paint = (next, moveFocus) => {
      at = clamp(next, 0, tabs.length - 1);
      tabs.forEach((tab, i) => {
        const on = i === at;
        tab.setAttribute("aria-selected", String(on));
        tab.tabIndex = on ? 0 : -1;
        tab.classList.toggle("is-current", on);
        panels[i].hidden = !on;
      });
      if (moveFocus) tabs[at].focus();
      place(true);
      if (prefersReducedMotion()) return;
      panels[at].animate(
        [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }],
        { duration: speed, easing: EASE.out },
      );
    };

    const onClick = (event) => paint(tabs.indexOf(event.currentTarget), false);
    const onKey = (event) => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
      if (step) {
        event.preventDefault();
        paint((at + step + tabs.length) % tabs.length, true);
        return;
      }
      if (event.key === "Home") { event.preventDefault(); paint(0, true); }
      if (event.key === "End") { event.preventDefault(); paint(tabs.length - 1, true); }
    };

    tabs.forEach((tab, i) => {
      tab.type = "button";
      tab.setAttribute("role", "tab");
      tab.classList.add("rm-product-tabs-tab");
      if (!tab.id) tab.id = uid("rm-product-tab");
      panels[i].setAttribute("role", "tabpanel");
      panels[i].setAttribute("aria-labelledby", tab.id);
      panels[i].tabIndex = 0;
      panels[i].classList.add("rm-product-tabs-panel");
      tab.addEventListener("click", onClick);
      tab.addEventListener("keydown", onKey);
    });

    const initial = tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true");
    paint(initial < 0 ? 0 : initial, false);

    const watcher = new ResizeObserver(() => place(false));
    watcher.observe(bar);

    cleanups.push(() => {
      watcher.disconnect();
      tabs.forEach((tab, i) => {
        tab.removeEventListener("click", onClick);
        tab.removeEventListener("keydown", onKey);
        tab.classList.remove("rm-product-tabs-tab", "is-current");
        ["role", "aria-selected"].forEach((name) => tab.removeAttribute(name));
        tab.tabIndex = 0;
        panels[i].hidden = false;
        panels[i].classList.remove("rm-product-tabs-panel");
        ["role", "aria-labelledby"].forEach((name) => panels[i].removeAttribute(name));
        panels[i].removeAttribute("tabindex");
      });
      line.remove();
      bar.classList.remove("rm-product-tabs-bar");
      bar.removeAttribute("role");
      holder.classList.remove("rm-product-tabs");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Several choices combined into one announced answer.
 *
 * Colour and size are two radio groups; what a shopper actually needs to know
 * is whether *this* pair exists and what it costs. So the picker watches every
 * group inside it, assembles the combination, asks the page whether it is
 * available, and says the whole sentence once — "Ochre, medium. In stock, 68
 * euros" — instead of leaving two separate announcements and a price that
 * changed silently somewhere else.
 *
 * Combinations that do not exist are marked `aria-disabled` rather than
 * `disabled`, deliberately: a shopper should still be able to land on "ochre,
 * medium" and be told it is unavailable, which is information. A `disabled`
 * radio is skipped by the arrow keys and the reason is never given.
 *
 *   <div data-rm-variant-picker>
 *     <fieldset><legend>Colour</legend>…</fieldset>
 *     <fieldset><legend>Size</legend>…</fieldset>
 *   </div>
 */
export function variantPicker(target = "[data-rm-variant-picker]", options = {}) {
  const pickers = resolveElements(target);
  if (!pickers.length) return () => {};

  const { available, label = "Options" } = options;
  const cleanups = [];

  for (const picker of pickers) {
    const inputs = [...picker.querySelectorAll('input[type="radio"]')];
    if (!inputs.length) continue;

    picker.classList.add("rm-variant-picker");
    picker.setAttribute("role", "group");
    picker.setAttribute("aria-label", dataString(picker, "rmLabel", label));
    const live = announcer(picker);

    const chosen = () => {
      const parts = {};
      for (const input of inputs) {
        if (input.checked) parts[input.name] = dataString(input, "rmValue", input.value);
      }
      return parts;
    };

    const review = (announce) => {
      const parts = chosen();
      const names = Object.values(parts);
      const groups = new Set(inputs.map((input) => input.name));
      if (names.length < groups.size) {
        // Silent on mount. The live region is already in the document, so its
        // first fill is announced like any other change, and a product page
        // carrying a picker and a gallery would otherwise interrupt itself
        // twice on load with news nobody asked for.
        if (announce) live.textContent = "Choose every option to see availability.";
        return;
      }

      // Unknown means available: a picker that hides everything until the page
      // tells it otherwise is a picker that looks broken on first paint.
      const answer = available ? available(parts) : true;
      const ok = answer === true || answer?.inStock === true;
      const price = typeof answer === "object" ? answer.price : undefined;

      // Which chip is chosen is drawn by the chips themselves, from
      // `:has(input:checked)` — there is no class to keep in step here, and one
      // toggled on every arrow-key press for no rule to match would be work
      // that shows up in a profile and nowhere on the screen.
      picker.classList.toggle("is-unavailable", !ok);
      if (!announce) return;
      live.textContent = ok
        ? `${names.join(", ")}. In stock${price !== undefined ? `, ${price}` : ""}.`
        : `${names.join(", ")}. This combination is unavailable.`;
    };

    const onChange = () => review(true);
    picker.addEventListener("change", onChange);
    review(false);

    picker.rmMark = (unavailable = []) => {
      // Disabled would remove them from the arrow keys, and with them the
      // explanation of why they cannot be chosen.
      inputs.forEach((input) => {
        const key = dataString(input, "rmValue", input.value);
        const off = unavailable.includes(key);
        input.setAttribute("aria-disabled", String(off));
        (input.closest("label") ?? input.parentElement)?.classList.toggle("is-off", off);
      });
    };

    cleanups.push(() => {
      picker.removeEventListener("change", onChange);
      delete picker.rmMark;
      inputs.forEach((input) => {
        input.removeAttribute("aria-disabled");
        (input.closest("label") ?? input.parentElement)?.classList.remove("is-off");
      });
      live.remove();
      picker.classList.remove("rm-variant-picker", "is-unavailable");
      picker.removeAttribute("role");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A trail that folds its middle into a button, not an ellipsis.
 *
 * When the row runs out of room the middle steps collapse behind a real
 * `<button>` with `aria-expanded`, so the hidden levels can be got back. The
 * usual fix is `text-overflow: ellipsis`, which throws the information away for
 * everyone and leaves a screen reader reading the full string anyway — the worst
 * of both.
 *
 * Expanding is a FLIP: the hidden steps are un-hidden, everything is measured in
 * its new place, and each surviving crumb is played from where it used to be. No
 * width is ever animated, so a trail that doubles in length does it in one
 * composited pass. The last crumb carries `aria-current="page"`, which is what
 * tells anyone listening where they actually are.
 *
 *   <nav data-rm-breadcrumb-trail data-rm-keep="1">
 *     <ol><li><a href="/">Home</a></li><li><a href="/shirts">Shirts</a></li><li>Linen shirt</li></ol>
 *   </nav>
 */
export function breadcrumbTrail(target = "[data-rm-breadcrumb-trail]", options = {}) {
  const trails = resolveElements(target);
  if (!trails.length) return () => {};

  const { keep = 1, label = "Breadcrumb", duration = 320 } = options;
  const cleanups = [];

  for (const trail of trails) {
    const list = trail.querySelector("ol, ul") ?? trail;
    const crumbs = [...list.children];
    if (crumbs.length < 2) continue;

    trail.classList.add("rm-breadcrumb-trail");
    // Undo only what was actually added: a landmark role put on a plain <div>
    // has to come off again, and a label the author wrote is theirs to keep.
    const hadLabel = trail.getAttribute("aria-label");
    const addedRole = trail.tagName !== "NAV" && !trail.hasAttribute("role");
    trail.setAttribute("aria-label", dataString(trail, "rmLabel", hadLabel ?? label));
    if (addedRole) trail.setAttribute("role", "navigation");
    list.classList.add("rm-breadcrumb-trail-list");

    const first = Math.max(1, dataNumber(trail, "rmKeep", keep));
    const last = crumbs[crumbs.length - 1];
    last.classList.add("is-current");
    const anchor = last.querySelector("a");
    (anchor ?? last).setAttribute("aria-current", "page");

    const middle = crumbs.slice(first, crumbs.length - 1);
    let folded = false;

    const more = document.createElement("li");
    more.className = "rm-breadcrumb-trail-more";
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "…";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", `Show ${middle.length} hidden levels`);
    more.appendChild(button);

    const fold = (on) => {
      if (on === folded || !middle.length) return;
      const boxes = crumbs.map((crumb) => [crumb, crumb.getBoundingClientRect()]);
      folded = on;
      middle.forEach((crumb) => { crumb.hidden = on; });
      if (on && !more.isConnected) crumbs[first].before(more);
      if (!on) more.remove();
      button.setAttribute("aria-expanded", String(!on));
      boxes.forEach(([crumb, was]) => { if (!crumb.hidden) flip(crumb, was, duration); });
    };

    button.addEventListener("click", () => {
      fold(false);
      middle[0]?.querySelector("a")?.focus();
    });

    // Measured, not guessed at a breakpoint: the trail folds when this row is
    // genuinely too wide for this container, whatever the screen is doing.
    const watcher = new ResizeObserver(() => {
      if (folded) return;
      if (list.scrollWidth > list.clientWidth + 1) fold(true);
    });
    watcher.observe(list);

    cleanups.push(() => {
      watcher.disconnect();
      more.remove();
      middle.forEach((crumb) => { crumb.hidden = false; });
      last.classList.remove("is-current");
      (anchor ?? last).removeAttribute("aria-current");
      list.classList.remove("rm-breadcrumb-trail-list");
      trail.classList.remove("rm-breadcrumb-trail");
      if (addedRole) trail.removeAttribute("role");
      if (hadLabel === null) trail.removeAttribute("aria-label");
      else trail.setAttribute("aria-label", hadLabel);
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A real `<select>`, because nothing beats it.
 *
 * This deliberately does not rebuild the control. The native `<select>` already
 * has type-ahead, Home and End, the platform picker on a phone, voice control
 * on a desktop and a value that submits with the form; every div-and-listbox
 * replacement gives up at least two of those, and usually the two nobody tested.
 * The component styles the wrapper, keeps the label wired, and stays out of the
 * way.
 *
 * What it adds is the missing half: the new sort order is announced politely,
 * because changing a `<select>` re-orders a grid somewhere below and by default
 * nothing says so.
 *
 *   <div data-rm-sort-bar>
 *     <label for="sort">Sort by</label>
 *     <select id="sort"><option>Newest</option><option>Price, low to high</option></select>
 *   </div>
 */
export function sortBar(target = "[data-rm-sort-bar]", options = {}) {
  const bars = resolveElements(target);
  if (!bars.length) return () => {};

  const { label = "Sorted by", onSort } = options;
  const cleanups = [];

  for (const bar of bars) {
    const select = bar.querySelector("select");
    if (!select) continue;

    bar.classList.add("rm-sort-bar");
    select.classList.add("rm-sort-bar-select");
    if (!select.labels?.length && !select.getAttribute("aria-label")) {
      select.setAttribute("aria-label", dataString(bar, "rmLabel", label));
    }
    const live = announcer(bar);
    const word = dataString(bar, "rmLabel", label);

    const onChange = () => {
      const chosen = select.options[select.selectedIndex]?.text ?? select.value;
      live.textContent = `${word}: ${chosen}`;
      onSort?.(select.value, select);
      if (prefersReducedMotion()) return;
      select.animate(
        [{ transform: "translateY(-2px)" }, { transform: "none" }],
        { duration: 220, easing: EASE.out },
      );
    };
    select.addEventListener("change", onChange);

    cleanups.push(() => {
      select.removeEventListener("change", onChange);
      live.remove();
      select.classList.remove("rm-sort-bar-select");
      bar.classList.remove("rm-sort-bar");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A disclosure with real checkboxes and no reflow.
 *
 * The panel is on its own layer rather than in the flow, and it opens with
 * clip-path and a small translate. That is the whole point: the popular version
 * animates `height` from 0 to auto, or `grid-template-rows` from `0fr` to `1fr`,
 * and both of those re-lay-out every product below the filter on every frame of
 * the animation. Here the catalogue does not move at all.
 *
 * The trigger is a `<button aria-expanded aria-controls>`, the choices are real
 * `<input type="checkbox">` inside a labelled group, Escape closes and hands
 * focus back to the trigger, and the number of active filters is kept on the
 * button so it is readable while the panel is shut.
 *
 *   <div data-rm-filter-panel>
 *     <button type="button" aria-controls="f1">Size</button>
 *     <div id="f1"><label><input type="checkbox" value="s"> Small</label></div>
 *   </div>
 */
export function filterPanel(target = "[data-rm-filter-panel]", options = {}) {
  const panels = resolveElements(target);
  if (!panels.length) return () => {};

  const { duration = 280, onChange } = options;
  const cleanups = [];

  for (const holder of panels) {
    const button = holder.querySelector("button");
    const wanted = button?.getAttribute("aria-controls");
    const body = wanted ? document.getElementById(wanted) : button?.nextElementSibling;
    if (!button || !body) continue;

    holder.classList.add("rm-filter-panel");
    button.type = "button";
    button.classList.add("rm-filter-panel-trigger");
    if (!body.id) body.id = uid("rm-filter-panel-body");
    button.setAttribute("aria-controls", body.id);
    body.classList.add("rm-filter-panel-body");
    body.setAttribute("role", "group");
    body.setAttribute("aria-label", `${button.textContent.trim()} filters`);

    const count = document.createElement("span");
    count.className = "rm-filter-panel-count";
    button.appendChild(count);

    const boxes = [...body.querySelectorAll('input[type="checkbox"]')];
    const speed = dataNumber(holder, "rmDuration", duration);
    let open = dataString(holder, "rmOpen", "false") === "true";

    const tally = () => {
      const on = boxes.filter((box) => box.checked).length;
      count.textContent = on ? String(on) : "";
      count.hidden = on === 0;
      button.setAttribute(
        "aria-label",
        on ? `${button.firstChild?.textContent?.trim() ?? "Filter"}, ${on} selected` : "",
      );
      if (!on) button.removeAttribute("aria-label");
    };

    const paint = (animated) => {
      button.setAttribute("aria-expanded", String(open));
      holder.classList.toggle("is-open", open);
      body.hidden = !open;
      if (!open || !animated || prefersReducedMotion()) return;
      body.animate(
        [
          { opacity: 0, transform: "translateY(-6px)", clipPath: "inset(0 0 100% 0)" },
          { opacity: 1, transform: "none", clipPath: "inset(0 0 0 0)" },
        ],
        { duration: speed, easing: EASE.out },
      );
    };
    paint(false);

    const toggle = () => { open = !open; paint(true); };
    const onKey = (event) => {
      if (event.key === "Escape" && open) { event.preventDefault(); open = false; paint(false); button.focus(); }
    };
    const onAway = (event) => {
      if (open && !holder.contains(event.target)) { open = false; paint(false); }
    };
    const onPick = () => { tally(); onChange?.(boxes.filter((box) => box.checked).map((box) => box.value)); };

    button.addEventListener("click", toggle);
    holder.addEventListener("keydown", onKey);
    body.addEventListener("change", onPick);
    document.addEventListener("pointerdown", onAway);
    tally();

    cleanups.push(() => {
      button.removeEventListener("click", toggle);
      holder.removeEventListener("keydown", onKey);
      body.removeEventListener("change", onPick);
      document.removeEventListener("pointerdown", onAway);
      count.remove();
      body.hidden = false;
      body.classList.remove("rm-filter-panel-body");
      body.removeAttribute("role");
      button.classList.remove("rm-filter-panel-trigger");
      button.removeAttribute("aria-expanded");
      holder.classList.remove("rm-filter-panel", "is-open");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * "42 products", announced once the filtering has settled.
 *
 * The number is a polite `role="status"`, and every update is debounced. That
 * debounce is the whole component: dragging a price slider fires a change on
 * every pixel, and a live region takes every one of them literally, so an
 * undebounced count reads out forty numbers in a row and blocks anything more
 * useful from being said. Waiting until the value stops moving turns that into
 * one sentence.
 *
 * The digits roll on a transform inside a box whose width does not change, so
 * the toolbar around it stays exactly where it was.
 *
 *   <p data-rm-result-count data-rm-value="42" data-rm-noun="products"></p>
 *   count.rmSet(18);
 */
export function resultCount(target = "[data-rm-result-count]", options = {}) {
  const counts = resolveElements(target);
  if (!counts.length) return () => {};

  const { value = 0, noun = "products", delay = 400, duration = 300 } = options;
  const cleanups = [];

  for (const holder of counts) {
    const original = holder.innerHTML;
    holder.classList.add("rm-result-count");
    holder.setAttribute("role", "status");
    holder.setAttribute("aria-live", "polite");

    const word = dataString(holder, "rmNoun", noun);
    const wait = dataNumber(holder, "rmDelay", delay);
    const speed = dataNumber(holder, "rmDuration", duration);

    const face = document.createElement("span");
    face.className = "rm-result-count-face";
    const rest = document.createElement("span");
    rest.className = "rm-result-count-noun";
    holder.replaceChildren(face, rest);

    let shown = clamp(dataNumber(holder, "rmValue", value), 0, Number.MAX_SAFE_INTEGER);
    let timer = 0;

    const paint = (next, roll) => {
      const up = next > shown;
      shown = next;
      rest.textContent = ` ${word}`;
      if (!roll || prefersReducedMotion()) { face.textContent = String(next); return; }

      const leaving = face.cloneNode(true);
      leaving.classList.add("is-leaving");
      holder.insertBefore(leaving, face);
      leaving.animate(
        [{ transform: "none", opacity: 1 }, { transform: `translateY(${up ? -90 : 90}%)`, opacity: 0 }],
        { duration: speed, easing: EASE.out, fill: "forwards" },
      ).finished.then(() => leaving.remove(), () => leaving.remove());

      face.textContent = String(next);
      face.animate(
        [{ transform: `translateY(${up ? 90 : -90}%)`, opacity: 0 }, { transform: "none", opacity: 1 }],
        { duration: speed, easing: EASE.out },
      );
    };
    paint(shown, false);

    // Debounced, because a live region says every value it is given.
    holder.rmSet = (next) => {
      clearTimeout(timer);
      timer = setTimeout(() => paint(Math.max(0, Math.round(next)), true), wait);
    };

    cleanups.push(() => {
      clearTimeout(timer);
      delete holder.rmSet;
      ["role", "aria-live"].forEach((name) => holder.removeAttribute(name));
      holder.classList.remove("rm-result-count");
      holder.innerHTML = original;
    });
  }

  return () => cleanups.forEach((stop) => stop());
}
