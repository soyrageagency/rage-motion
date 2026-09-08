/**
 * Ecommerce — storefront and merchandising.
 *
 *   • heroBanner()        — a campaign banner with a real heading, not a picture of one.
 *   • collectionGrid()    — a grid that arrives in order and filters by FLIP.
 *   • lookbook()          — shoppable hotspots that are genuinely buttons.
 *   • categoryTiles()     — tiles whose accessible name is the category.
 *   • saleCountdown()     — a countdown that says what happens at zero.
 *   • bundleBuilder()     — pick several, see one price and the saving in words.
 *   • sizeGuide()         — a dialog with a real table and real scopes.
 *   • stockNotify()       — "tell me when it is back", as a real form.
 *   • productVideo()      — a muted loop with a poster and a real pause.
 *   • swatchGallery()     — the photograph changes with the chosen colour.
 *   • badgeStack()        — new, sale, low stock, as real text in priority order.
 *   • trustRow()          — delivery and returns promises that keep their list role.
 *   • shippingEstimate()  — real dates, working days counted, labelled an estimate.
 *   • recentlyBought()    — social proof that is visibly illustrative and pausable.
 *   • crossSell()         — a rail you can page from the keyboard.
 *   • upsellRow()         — real radios, with the difference stated in money.
 *   • giftCard()          — an amount and a message, and never a code.
 *   • loyaltyPoints()     — a balance, the gap to the next tier, both spoken.
 *   • referralBox()       — a link, a copy button whose name never changes.
 *   • subscribeBox()      — a real form with a real label and a real error summary.
 *
 * The storefront is the shop's shop window, which makes it the part most often
 * built out of pictures: a hero that is one flattened JPEG, a badge that is a
 * coloured dot, a countdown that is a row of divs, a hotspot that is a click
 * handler on an absolutely positioned square. Every one of those is content
 * that only exists for somebody looking straight at it. So the rule running
 * through this file is that the merchandising message is text first — the
 * heading is a heading, the badge says "only 3 left", the countdown says what
 * happens when it reaches zero, and the hotspot is a `<button>` with a name.
 *
 * The second rule is that nothing here reflows. A grid filtering, a badge
 * folding out, a swatch changing the photograph, a bundle total changing by
 * eleven euros: all of it is transform, opacity and clip-path over the top of
 * the layout rather than through it. A storefront is scanned, not read, and a
 * card that moves while somebody is reaching for it is a card clicked by
 * accident.
 *
 * The third is that anything which moves on its own can be stopped. The
 * countdown, the video and the social-proof rotator each carry a real control
 * and each stop entirely once they scroll away, because a page of decorative
 * motion with no pause is a page some people simply cannot use.
 *
 * The hard boundary: these are presentation components. Nothing here collects,
 * stores, transmits or validates a card number, a CVV, a bank detail or a
 * credential; the two forms in this file own an email address that never leaves
 * the page unless the author gave the form a real `action` of their own. The
 * gift card picks an amount and writes a message — it never mints, reads or
 * checks a code, because a gift card code is real money. The social proof
 * refuses to invent anybody: it rotates the notices the author wrote and stamps
 * them as illustrative in text that cannot be switched off. Every price, name,
 * place and link in the examples is fictional on purpose.
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
  said.className = "rm-storefront-live";
  said.setAttribute("aria-live", tone);
  said.setAttribute("role", tone === "assertive" ? "alert" : "status");
  holder.appendChild(said);
  return said;
}

/** Text that is read but not drawn — the spoken half of a purely visual signal. */
function said(text) {
  const span = document.createElement("span");
  span.className = "rm-storefront-said";
  span.textContent = text;
  return span;
}

/**
 * Move an element from where it was to where it now is, using only transform.
 *
 * The invert half of a FLIP: the layout change has already happened and the
 * element is already in its final place, so this plays the difference. It is
 * how a grid closes a gap and a badge stack unfolds without a single frame of
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
    // than throwing and leaving a price blank on a shop page.
    const drawn = String(value);
    return { drawn, spoken: drawn };
  }
}

/** The page's language, which is what the author actually wants to format in. */
const here = () => document.documentElement.lang || navigator.language || "en-GB";

/**
 * A campaign banner with a real heading, not a picture of one.
 *
 * The start state is written from JavaScript and cleared the moment the
 * entrance finishes, so a banner whose script never loads is a banner that is
 * simply already there. The commonplace version puts `opacity: 0` on the copy
 * in the stylesheet and reveals it with a class, which turns a failed script,
 * a slow network or a blocked bundle into a blank hero — the single most
 * expensive thing that can go wrong at the top of a shop.
 *
 * The artwork drifts a few pixels against the scroll on the shared frame loop,
 * inside `whileVisible` so it costs nothing once it has passed. The copy is
 * excluded from that drift on purpose: text sliding under its own headline is
 * the effect that makes a hero feel cheap, and it is unreadable while it moves.
 *
 *   <section data-rm-hero-banner data-rm-depth="26">
 *     <img src="/shop/atelier-window.jpg" alt="A workbench of unglazed beakers by a window">
 *     <h1>The winter table</h1>
 *     <p>Stoneware thrown in small batches.</p>
 *     <a href="/collections/winter-table">See the collection</a>
 *   </section>
 */
export function heroBanner(target = "[data-rm-hero-banner]", options = {}) {
  const banners = resolveElements(target);
  if (!banners.length) return () => {};

  const { duration = 760, stagger = 90, depth = 24, lift = 18 } = options;
  const cleanups = [];

  for (const banner of banners) {
    banner.classList.add("rm-hero-banner");

    // A labelled region, but only if this is not already a landmark of its own
    // — a second role on a <section> the author wrote is noise in the tree.
    const heading = banner.querySelector("h1, h2, h3");
    const hadRole = banner.hasAttribute("role");
    const addRole = !hadRole && !["SECTION", "ASIDE", "HEADER", "MAIN"].includes(banner.tagName);
    if (heading) {
      if (!heading.id) heading.id = uid("rm-hero-banner-title");
      banner.setAttribute("aria-labelledby", heading.id);
      if (addRole) banner.setAttribute("role", "region");
    }

    const art = banner.querySelector("img, picture, video, canvas, svg");
    art?.classList.add("rm-hero-banner-art");

    const copy = [...banner.children].filter((child) => child !== art && !child.contains(art));
    copy.forEach((child) => child.classList.add("rm-hero-banner-copy"));

    const speed = dataNumber(banner, "rmDuration", duration);
    const step = dataNumber(banner, "rmStagger", stagger);
    const travel = dataNumber(banner, "rmLift", lift);
    const range = dataNumber(banner, "rmDepth", depth);

    const arm = () => {
      if (prefersReducedMotion()) return;
      copy.forEach((child) => {
        child.style.opacity = "0";
        child.style.transform = `translateY(${travel}px)`;
      });
    };

    const play = () => {
      copy.forEach((child, i) => {
        // Cleared first, so the element's resting state is the one the author
        // wrote; `fill: "backwards"` holds the start pose through the delay.
        child.style.opacity = "";
        child.style.transform = "";
        if (prefersReducedMotion()) return;
        child.animate(
          [
            { opacity: 0, transform: `translateY(${travel}px)` },
            { opacity: 1, transform: "none" },
          ],
          { duration: speed, delay: i * step, easing: EASE.out, fill: "backwards" },
        );
      });
    };

    arm();
    cleanups.push(watch(banner, play, { threshold: 0.2, once: true }));

    if (art && range > 0 && !prefersReducedMotion()) {
      cleanups.push(whileVisible(banner, () => onFrame(() => {
        const box = banner.getBoundingClientRect();
        const middle = box.top + box.height / 2;
        const share = clamp((middle - innerHeight / 2) / innerHeight, -1, 1);
        art.style.transform = `translate3d(0, ${(share * range).toFixed(2)}px, 0) scale(1.08)`;
      })));
    }

    cleanups.push(() => {
      copy.forEach((child) => {
        child.style.opacity = "";
        child.style.transform = "";
        child.classList.remove("rm-hero-banner-copy");
      });
      if (art) {
        art.style.transform = "";
        art.classList.remove("rm-hero-banner-art");
      }
      banner.removeAttribute("aria-labelledby");
      if (addRole) banner.removeAttribute("role");
      banner.classList.remove("rm-hero-banner");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * A grid that arrives in order and filters by FLIP.
 *
 * Filtering a catalogue is the moment a grid normally throws away the visitor's
 * place: cards vanish, the survivors snap into new cells, and whatever somebody
 * was reading is now four rows further up. Here the removed cards are hidden,
 * every survivor is measured before and after, and each one is played from
 * where it used to be — so the grid closes up in one composited pass and the
 * eye can follow a card across the change.
 *
 * The arrival stagger is a one-shot on `watch`, not `whileVisible`: a grid that
 * re-animates from nothing every time you scroll back up looks like a page that
 * keeps reloading itself. The new count is announced politely once, because the
 * result of pressing a filter is a number and nobody should have to go and look
 * for it.
 *
 *   <div data-rm-collection-grid data-rm-min="240" data-rm-stagger="60">
 *     <article data-tone="ochre"><img src="/shop/beaker-ochre.jpg" alt="Ochre beaker"><h3>Ochre beaker</h3></article>
 *     <article data-tone="ink"><img src="/shop/beaker-ink.jpg" alt="Ink beaker"><h3>Ink beaker</h3></article>
 *   </div>
 *   grid.rmFilter((card) => card.dataset.tone === "ochre");
 */
export function collectionGrid(target = "[data-rm-collection-grid]", options = {}) {
  const grids = resolveElements(target);
  if (!grids.length) return () => {};

  const { stagger = 60, duration = 620, min = 220, noun = "products" } = options;
  const cleanups = [];

  for (const grid of grids) {
    const items = [...grid.children];
    if (!items.length) continue;

    grid.classList.add("rm-collection-grid");
    grid.style.setProperty("--rm-collection-grid-min", `${dataNumber(grid, "rmMin", min)}px`);
    const step = dataNumber(grid, "rmStagger", stagger);
    const speed = dataNumber(grid, "rmDuration", duration);
    const word = dataString(grid, "rmNoun", noun);
    const live = announcer(grid);
    items.forEach((item) => item.classList.add("rm-collection-grid-item"));

    if (!prefersReducedMotion()) {
      items.forEach((item) => {
        item.style.opacity = "0";
        item.style.transform = "translateY(14px)";
      });
    }

    const play = () => {
      items.forEach((item, i) => {
        item.style.opacity = "";
        item.style.transform = "";
        if (prefersReducedMotion()) return;
        item.animate(
          [{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }],
          { duration: speed, delay: i * step, easing: EASE.out, fill: "backwards" },
        );
      });
    };
    cleanups.push(watch(grid, play, { threshold: 0.15, once: true }));

    const settle = () => {
      const shown = items.filter((item) => !item.hidden).length;
      live.textContent = `${shown} of ${items.length} ${word} shown`;
    };

    grid.rmFilter = (predicate) => {
      // Measured before anything changes: this is the F and the L of the FLIP,
      // and skipping it is why most filtered grids jump.
      const boxes = items.map((item) => [item, item.hidden ? null : item.getBoundingClientRect()]);
      items.forEach((item, i) => {
        item.hidden = typeof predicate === "function" ? !predicate(item, i) : false;
      });
      boxes.forEach(([item, was]) => {
        if (!item.hidden && was) flip(item, was, speed);
        else if (!item.hidden && !prefersReducedMotion()) {
          item.animate(
            [{ opacity: 0, transform: "scale(0.94)" }, { opacity: 1, transform: "none" }],
            { duration: speed, easing: EASE.out },
          );
        }
      });
      settle();
    };
    grid.rmShowAll = () => grid.rmFilter(null);

    cleanups.push(() => {
      delete grid.rmFilter;
      delete grid.rmShowAll;
      live.remove();
      items.forEach((item) => {
        item.hidden = false;
        item.style.opacity = "";
        item.style.transform = "";
        item.classList.remove("rm-collection-grid-item");
      });
      grid.style.removeProperty("--rm-collection-grid-min");
      grid.classList.remove("rm-collection-grid");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * Shoppable hotspots that are genuinely buttons.
 *
 * The whole point of a lookbook is that the picture is the navigation, which is
 * exactly why it is usually inaccessible: an absolutely positioned `<div>` with
 * a click handler has no name, no role, no tab stop and no keyboard. Here every
 * hotspot is a `<button type="button">` carrying the product name as text that
 * stays on screen, with `aria-expanded` and `aria-controls` pointing at a real
 * card, arrow keys moving between spots under a roving tabindex, and Escape
 * handing focus back to the spot that opened the card.
 *
 * Position comes from `data-rm-at="x,y"` as percentages, written once as `left`
 * and `top` — that is placement, not animation. Everything that moves after
 * that is a transform: the dot's pulse ring, and the card scaling up out of its
 * own hotspot. The card is `hidden` between openings rather than shifted off
 * screen, because a card that is only translated away still takes clicks and
 * still collects a Tab press from nowhere.
 *
 *   <figure data-rm-lookbook>
 *     <img src="/shop/lookbook-window.jpg" alt="A table set with stoneware beside a window">
 *     <button type="button" data-rm-at="34,58" aria-controls="look-beaker">Ochre beaker</button>
 *     <div id="look-beaker"><h3>Ochre beaker</h3><p>Stoneware, 300ml. €24.</p></div>
 *   </figure>
 */
export function lookbook(target = "[data-rm-lookbook]", options = {}) {
  const scenes = resolveElements(target);
  if (!scenes.length) return () => {};

  const { duration = 320, label = "Shop this picture" } = options;
  const cleanups = [];

  for (const scene of scenes) {
    const spots = [...scene.querySelectorAll("button[data-rm-at]")];
    if (!spots.length) continue;

    scene.classList.add("rm-lookbook");
    scene.setAttribute("role", "group");
    const hadLabel = scene.getAttribute("aria-label");
    scene.setAttribute("aria-label", dataString(scene, "rmLabel", hadLabel ?? label));
    const speed = dataNumber(scene, "rmDuration", duration);
    scene.querySelector("img")?.classList.add("rm-lookbook-image");

    const cards = spots.map((spot) => {
      const wanted = spot.getAttribute("aria-controls");
      return wanted ? document.getElementById(wanted) : null;
    });

    let at = 0;
    let open = -1;

    const shut = (moveFocus) => {
      if (open < 0) return;
      const card = cards[open];
      const spot = spots[open];
      spot.setAttribute("aria-expanded", "false");
      spot.classList.remove("is-open");
      if (card) card.hidden = true;
      if (moveFocus) spot.focus();
      open = -1;
    };

    // The single home of the roving tab stop. Both routes in — arrow keys and
    // a pointer press — go through here, because a rail where clicking the
    // third hotspot leaves `tabindex="0"` on the first sends somebody who tabs
    // away and back to the wrong end of the picture.
    const mark = (index) => {
      at = (index + spots.length) % spots.length;
      spots.forEach((spot, i) => { spot.tabIndex = i === at ? 0 : -1; });
    };

    const show = (index) => {
      const card = cards[index];
      if (!card) return;
      mark(index);
      if (open === index) { shut(true); return; }
      shut(false);
      open = index;
      spots[index].setAttribute("aria-expanded", "true");
      spots[index].classList.add("is-open");
      card.hidden = false;
      if (prefersReducedMotion()) return;
      card.animate(
        [
          { opacity: 0, transform: "scale(0.9) translateY(6px)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: speed, easing: EASE.out },
      );
    };

    const roam = (index) => {
      mark(index);
      spots[at].focus();
    };

    const onClick = (event) => show(spots.indexOf(event.currentTarget));
    const onKey = (event) => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
      if (step) { event.preventDefault(); roam(at + step); return; }
      if (event.key === "Home") { event.preventDefault(); roam(0); return; }
      if (event.key === "End") { event.preventDefault(); roam(spots.length - 1); return; }
      if (event.key === "Escape" && open >= 0) { event.preventDefault(); shut(true); }
    };

    spots.forEach((spot, i) => {
      spot.type = "button";
      spot.classList.add("rm-lookbook-spot");
      spot.tabIndex = i === 0 ? 0 : -1;
      const [x, y] = dataString(spot, "rmAt", "50,50").split(",").map(Number);
      spot.style.left = `${clamp(Number.isFinite(x) ? x : 50, 0, 100)}%`;
      spot.style.top = `${clamp(Number.isFinite(y) ? y : 50, 0, 100)}%`;

      // The name stays as drawn text beside the dot. A bare dot with the name
      // hidden away in an aria-label is a control nobody sighted can identify
      // either, which is a different failure with the same cause.
      const name = document.createElement("span");
      name.className = "rm-lookbook-name";
      name.append(...spot.childNodes);
      const dot = document.createElement("i");
      dot.className = "rm-lookbook-dot";
      dot.setAttribute("aria-hidden", "true");
      spot.replaceChildren(dot, name);

      if (cards[i]) {
        cards[i].classList.add("rm-lookbook-card");
        cards[i].hidden = true;
        spot.setAttribute("aria-expanded", "false");
        if (!spot.id) spot.id = uid("rm-lookbook-spot");
        cards[i].setAttribute("aria-labelledby", spot.id);
      }
      spot.addEventListener("click", onClick);
      spot.addEventListener("keydown", onKey);
    });

    cleanups.push(() => {
      spots.forEach((spot, i) => {
        spot.removeEventListener("click", onClick);
        spot.removeEventListener("keydown", onKey);
        const name = spot.querySelector(".rm-lookbook-name");
        if (name) spot.replaceChildren(...name.childNodes);
        spot.classList.remove("rm-lookbook-spot", "is-open");
        spot.removeAttribute("aria-expanded");
        spot.style.left = "";
        spot.style.top = "";
        spot.tabIndex = 0;
        if (cards[i]) {
          cards[i].hidden = false;
          cards[i].classList.remove("rm-lookbook-card");
          cards[i].removeAttribute("aria-labelledby");
        }
      });
      scene.querySelector("img")?.classList.remove("rm-lookbook-image");
      scene.classList.remove("rm-lookbook");
      scene.removeAttribute("role");
      if (hadLabel === null) scene.removeAttribute("aria-label");
      else scene.setAttribute("aria-label", hadLabel);
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Tiles whose accessible name is the category.
 *
 * Each tile is one `<a>` containing a photograph and a heading, and the link is
 * pointed at the heading with `aria-labelledby` — so it is announced as
 * "Stoneware, link" rather than as the alt text, the heading, the count and the
 * word "shop" run together, which is what a link wrapped round a whole tile
 * produces. The photograph's `alt` is emptied when the heading already says the
 * same thing, because a picture next to its own caption is decoration.
 *
 * The zoom is a scale on the image inside a clipped frame, on hover *and* on
 * focus. `background-size` is the usual choice and it is a paint-and-layout
 * operation on a large bitmap every frame; a transform on a layer is neither.
 * The tile for the page you are on gets `aria-current="page"`, which costs one
 * line and is the only way a listener can tell where they are.
 *
 *   <nav data-rm-category-tiles data-rm-zoom="1.08">
 *     <a href="/collections/stoneware"><img src="/shop/tile-stoneware.jpg" alt=""><h3>Stoneware</h3></a>
 *     <a href="/collections/linen"><img src="/shop/tile-linen.jpg" alt=""><h3>Linen</h3></a>
 *   </nav>
 */
export function categoryTiles(target = "[data-rm-category-tiles]", options = {}) {
  const groups = resolveElements(target);
  if (!groups.length) return () => {};

  const { zoom = 1.07, stagger = 70, duration = 620 } = options;
  const cleanups = [];

  for (const group of groups) {
    const tiles = [...group.querySelectorAll("a[href]")];
    if (!tiles.length) continue;

    group.classList.add("rm-category-tiles");
    group.style.setProperty("--rm-category-tiles-zoom", String(dataNumber(group, "rmZoom", zoom)));
    const step = dataNumber(group, "rmStagger", stagger);
    const speed = dataNumber(group, "rmDuration", duration);
    const emptied = [];
    const named = [];
    // Only the tiles this component marked. An author who wrote
    // `aria-current="page"` themselves keeps it through a teardown.
    const marked = [];

    tiles.forEach((tile) => {
      tile.classList.add("rm-category-tiles-tile");
      const heading = tile.querySelector("h1, h2, h3, h4, h5, h6, .rm-category-tiles-name");
      if (heading) {
        if (!heading.id) heading.id = uid("rm-category-tile");
        tile.setAttribute("aria-labelledby", heading.id);
        named.push(tile);
        const image = tile.querySelector("img");
        // The heading is now the name; the same words in the alt would be read
        // out twice for one link.
        if (image && image.alt && image.alt.trim() === heading.textContent.trim()) {
          emptied.push([image, image.alt]);
          image.alt = "";
        }
        image?.classList.add("rm-category-tiles-image");
      }
      try {
        if (new URL(tile.href, location.href).pathname === location.pathname
          && !tile.hasAttribute("aria-current")) {
          tile.setAttribute("aria-current", "page");
          marked.push(tile);
        }
      } catch {
        // A malformed href is the author's business, not a reason to throw.
      }
    });

    if (!prefersReducedMotion()) {
      tiles.forEach((tile) => {
        tile.style.opacity = "0";
        tile.style.transform = "translateY(12px)";
      });
    }
    cleanups.push(watch(group, () => {
      tiles.forEach((tile, i) => {
        tile.style.opacity = "";
        tile.style.transform = "";
        if (prefersReducedMotion()) return;
        tile.animate(
          [{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "none" }],
          { duration: speed, delay: i * step, easing: EASE.out, fill: "backwards" },
        );
      });
    }, { threshold: 0.15, once: true }));

    cleanups.push(() => {
      emptied.forEach(([image, alt]) => { image.alt = alt; });
      named.forEach((tile) => tile.removeAttribute("aria-labelledby"));
      marked.forEach((tile) => tile.removeAttribute("aria-current"));
      tiles.forEach((tile) => {
        tile.style.opacity = "";
        tile.style.transform = "";
        tile.querySelector("img")?.classList.remove("rm-category-tiles-image");
        tile.classList.remove("rm-category-tiles-tile");
      });
      group.style.removeProperty("--rm-category-tiles-zoom");
      group.classList.remove("rm-category-tiles");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * A countdown that says what happens at zero.
 *
 * Most sale clocks are four numbers and no sentence, which tells a shopper that
 * something is running out but never what. So this one keeps the author's own
 * promise as the heading, draws the clock beneath it, and always carries a
 * plain line saying what changes when it reaches zero — and at zero it swaps to
 * that sentence rather than sitting at four zeroes forever.
 *
 * The announcement is the part that is almost always wrong. A live region wired
 * to a clock says a number every second, which blocks every other message on
 * the page and makes a screen reader useless for as long as the banner is on
 * screen. Here the digits are `aria-hidden` and a polite region speaks once a
 * minute by default, in words, plus once when the offer ends. The tick itself
 * is one task on the shared frame loop inside `whileVisible`, and it only
 * rewrites a cell when that cell's number has actually changed.
 *
 *   <p data-rm-sale-countdown data-rm-ends="2027-01-06T09:00:00Z"
 *      data-rm-over="The winter sale has ended. Prices are back to full.">Winter sale ends in</p>
 */
export function saleCountdown(target = "[data-rm-sale-countdown]", options = {}) {
  const clocks = resolveElements(target);
  if (!clocks.length) return () => {};

  const {
    ends = "",
    over = "This offer has ended. Prices are back to full.",
    note = "When the clock reaches zero the sale prices come off.",
    announce = 60,
  } = options;
  const cleanups = [];

  for (const clock of clocks) {
    const when = Date.parse(dataString(clock, "rmEnds", ends));
    // An unreadable date leaves the author's own sentence exactly as written
    // rather than replacing it with a clock counting down from nothing.
    if (!Number.isFinite(when)) continue;

    const original = clock.innerHTML;
    clock.classList.add("rm-sale-countdown");
    const gap = Math.max(5, dataNumber(clock, "rmAnnounce", announce)) * 1000;
    const overText = dataString(clock, "rmOver", over);

    const head = document.createElement("span");
    head.className = "rm-sale-countdown-head";
    head.append(...clock.childNodes);

    const face = document.createElement("span");
    face.className = "rm-sale-countdown-clock";
    face.setAttribute("aria-hidden", "true");
    const units = ["days", "hours", "minutes", "seconds"].map((name) => {
      const cell = document.createElement("span");
      cell.className = "rm-sale-countdown-unit";
      const value = document.createElement("b");
      value.textContent = "00";
      const word = document.createElement("small");
      word.textContent = name;
      cell.append(value, word);
      face.appendChild(cell);
      return { value, was: "00" };
    });

    const ending = document.createElement("span");
    ending.className = "rm-sale-countdown-over";
    ending.textContent = overText;
    ending.hidden = true;

    const smallPrint = document.createElement("span");
    smallPrint.className = "rm-sale-countdown-note";
    smallPrint.textContent = dataString(clock, "rmNote", note);

    const live = announcer(clock);
    clock.replaceChildren(head, face, ending, smallPrint, live);

    const pad = (n) => String(n).padStart(2, "0");
    const write = (cell, text) => {
      if (cell.was === text) return;
      cell.was = text;
      cell.value.textContent = text;
      if (prefersReducedMotion()) return;
      cell.value.animate(
        [{ transform: "translateY(-60%)", opacity: 0 }, { transform: "none", opacity: 1 }],
        { duration: 260, easing: EASE.out },
      );
    };

    let spokeAt = 0;
    let finished = false;
    const tick = () => {
      const left = when - Date.now();
      if (left <= 0) {
        if (finished) return;
        finished = true;
        face.hidden = true;
        ending.hidden = false;
        clock.classList.add("is-over");
        // Polite, not assertive. A sale ending is news, not an emergency, and
        // an alert here would cut across whatever the visitor was reading.
        live.textContent = overText;
        return;
      }
      const seconds = Math.floor(left / 1000);
      write(units[0], pad(Math.floor(seconds / 86400)));
      write(units[1], pad(Math.floor(seconds / 3600) % 24));
      write(units[2], pad(Math.floor(seconds / 60) % 60));
      write(units[3], pad(seconds % 60));

      const now = Date.now();
      if (now - spokeAt < gap) return;
      spokeAt = now;
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor(seconds / 3600) % 24;
      const minutes = Math.floor(seconds / 60) % 60;
      const parts = [];
      if (days) parts.push(`${days} day${days === 1 ? "" : "s"}`);
      if (hours) parts.push(`${hours} hour${hours === 1 ? "" : "s"}`);
      if (!days) parts.push(`${minutes} minute${minutes === 1 ? "" : "s"}`);
      live.textContent = `${parts.join(", ")} left. ${smallPrint.textContent}`;
    };

    tick();
    spokeAt = Date.now();
    cleanups.push(whileVisible(clock, () => onFrame(tick)));

    cleanups.push(() => {
      clock.classList.remove("rm-sale-countdown", "is-over");
      clock.innerHTML = original;
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * Pick several, see one price and the saving in words.
 *
 * The choices are real `<input type="checkbox">` in a real `<fieldset>` with a
 * `<legend>`, and nothing is ever disabled. The tempting shortcut is to switch
 * off the remaining boxes once a bundle is full, which leaves a shopper with a
 * row of dead controls and no explanation; saying "three chosen, add one more
 * to save 15%" costs a sentence and tells them what to do next.
 *
 * The total repaints on every tick but is only *spoken* once the pressing
 * stops, because a live region reads every value it is given and a shopper
 * ticking six boxes would hear six totals over each other. The figure rolls on
 * a transform inside a cell whose width is fixed by tabular figures, so the
 * saving beside it never shifts sideways mid-read.
 *
 *   <fieldset data-rm-bundle-builder data-rm-min="3" data-rm-save="15" data-rm-currency="EUR">
 *     <legend>Build a bundle</legend>
 *     <label><input type="checkbox" data-rm-price="24" checked> Ochre beaker — €24</label>
 *     <label><input type="checkbox" data-rm-price="18"> Linen cloth — €18</label>
 *     <label><input type="checkbox" data-rm-price="32"> Stoneware jug — €32</label>
 *   </fieldset>
 */
export function bundleBuilder(target = "[data-rm-bundle-builder]", options = {}) {
  const builders = resolveElements(target);
  if (!builders.length) return () => {};

  const {
    currency = "EUR", locale = undefined, min = 3, save = 10, delay = 420, duration = 300,
  } = options;
  const cleanups = [];

  for (const builder of builders) {
    const boxes = [...builder.querySelectorAll('input[type="checkbox"]')];
    if (!boxes.length) continue;

    builder.classList.add("rm-bundle-builder");
    const unit = dataString(builder, "rmCurrency", currency);
    const where = dataString(builder, "rmLocale", locale ?? here());
    const need = Math.max(1, Math.round(dataNumber(builder, "rmMin", min)));
    const off = clamp(dataNumber(builder, "rmSave", save), 0, 90);
    const wait = dataNumber(builder, "rmDelay", delay);
    const speed = dataNumber(builder, "rmDuration", duration);
    boxes.forEach((box) => (box.closest("label") ?? box.parentElement)?.classList.add("rm-bundle-builder-pick"));

    const out = document.createElement("output");
    out.className = "rm-bundle-builder-total";
    // `<output>` carries an implicit `role="status"`, which is a polite live
    // region in its own right — so without this the browser would read the
    // whole total on every single tick, and the debounced region beside it
    // would then say the same sentence again a moment later. Politeness is
    // taken from the nearest element that declares it, so this has to be set
    // on the output itself. The figure is drawn here and spoken over there.
    out.setAttribute("aria-live", "off");
    const figure = document.createElement("strong");
    figure.className = "rm-bundle-builder-figure";
    figure.setAttribute("aria-hidden", "true");
    const saving = document.createElement("span");
    saving.className = "rm-bundle-builder-saving";
    saving.setAttribute("aria-hidden", "true");
    const advice = document.createElement("span");
    advice.className = "rm-bundle-builder-advice";
    out.append(figure, saving, advice);
    const live = announcer(builder);
    builder.append(out, live);

    let timer = 0;
    const paint = (roll) => {
      const chosen = boxes.filter((box) => box.checked);
      const full = chosen.reduce((sum, box) => sum + dataNumber(box, "rmPrice", 0), 0);
      const earned = chosen.length >= need && off > 0;
      const total = earned ? full * (1 - off / 100) : full;
      const cut = full - total;

      const shown = money(total, unit, where);
      const previous = figure.textContent;
      figure.textContent = shown.drawn;
      saving.textContent = earned ? `you save ${money(cut, unit, where).drawn}` : "";
      saving.hidden = !earned;
      builder.classList.toggle("is-earned", earned);

      const short = need - chosen.length;
      advice.textContent = earned
        ? `${chosen.length} chosen. Bundle price ${shown.spoken}, you save ${money(cut, unit, where).spoken} (${off}%).`
        : chosen.length === 0
          ? `Nothing chosen yet. Pick ${need} to save ${off}%.`
          : `${chosen.length} chosen, ${shown.spoken}. Add ${short} more to save ${off}%.`;

      if (!roll || prefersReducedMotion() || previous === figure.textContent) return;
      figure.animate(
        [{ transform: "translateY(0.45em)", opacity: 0 }, { transform: "none", opacity: 1 }],
        { duration: speed, easing: EASE.out },
      );
    };

    const onChange = () => {
      paint(true);
      clearTimeout(timer);
      // Painted at once, spoken when the pressing stops.
      timer = setTimeout(() => { live.textContent = advice.textContent; }, wait);
    };
    builder.addEventListener("change", onChange);
    paint(false);

    cleanups.push(() => {
      clearTimeout(timer);
      builder.removeEventListener("change", onChange);
      boxes.forEach((box) => (box.closest("label") ?? box.parentElement)?.classList.remove("rm-bundle-builder-pick"));
      out.remove();
      live.remove();
      builder.classList.remove("rm-bundle-builder", "is-earned");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A dialog with a real table and real scopes.
 *
 * A size guide is a table, and a table only works if the browser can tell which
 * cell belongs to which heading — so this fills in the `scope` attributes the
 * markup is missing, `col` across the head and `row` down the first column. A
 * guide built from divs and a grid, which is the fashionable version, is read
 * cell by cell with no idea which measurement belongs to which size, and there
 * is no attribute you can add later to fix it.
 *
 * The dialog itself is opened from any `[aria-controls]` button, makes the rest
 * of the page `inert` — which removes it from the tab order, the virtual cursor
 * and find-in-page together, none of which a hand-rolled Tab trap does — closes
 * on Escape or the backdrop, and hands focus back to the button that opened it.
 * If the table carries several `<tbody data-rm-unit>` bodies, a real radio group
 * switches between them rather than converting numbers behind the visitor's
 * back.
 *
 *   <button type="button" aria-controls="guide-1">Size guide</button>
 *   <div id="guide-1" data-rm-size-guide>
 *     <h2>Size guide</h2>
 *     <table>
 *       <thead><tr><th>Size</th><th>Chest</th></tr></thead>
 *       <tbody data-rm-unit="cm"><tr><th>S</th><td>96</td></tr></tbody>
 *       <tbody data-rm-unit="in"><tr><th>S</th><td>38</td></tr></tbody>
 *     </table>
 *   </div>
 */
export function sizeGuide(target = "[data-rm-size-guide]", options = {}) {
  const panels = resolveElements(target);
  if (!panels.length) return () => {};

  const { label = "Size guide", duration = 320, unit = "" } = options;
  const cleanups = [];

  for (const panel of panels) {
    if (!panel.id) panel.id = uid("rm-size-guide");
    panel.classList.add("rm-size-guide");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.hidden = true;

    const heading = panel.querySelector("h1, h2, h3");
    if (heading) {
      if (!heading.id) heading.id = uid("rm-size-guide-title");
      panel.setAttribute("aria-labelledby", heading.id);
    } else {
      panel.setAttribute("aria-label", dataString(panel, "rmLabel", label));
    }

    // The scopes are the whole reason a size guide is a table at all.
    const table = panel.querySelector("table");
    const scoped = [];
    table?.querySelectorAll("th").forEach((cell) => {
      if (cell.hasAttribute("scope")) return;
      cell.setAttribute("scope", cell.closest("thead") ? "col" : "row");
      scoped.push(cell);
    });
    table?.classList.add("rm-size-guide-table");

    const veil = document.createElement("div");
    veil.className = "rm-size-guide-veil";
    veil.hidden = true;
    panel.before(veil);

    const shut = document.createElement("button");
    shut.type = "button";
    shut.className = "rm-size-guide-close";
    shut.setAttribute("aria-label", "Close size guide");
    shut.textContent = "×";
    panel.prepend(shut);

    // Units, when the author supplied more than one body of figures.
    const bodies = table ? [...table.querySelectorAll("tbody[data-rm-unit]")] : [];
    let switcher = null;
    if (bodies.length > 1) {
      switcher = document.createElement("fieldset");
      switcher.className = "rm-size-guide-units";
      const legend = document.createElement("legend");
      legend.textContent = "Units";
      switcher.appendChild(legend);
      const group = uid("rm-size-guide-unit");
      const wanted = dataString(panel, "rmUnit", unit) || dataString(bodies[0], "rmUnit", "cm");
      bodies.forEach((body) => {
        const name = dataString(body, "rmUnit", "cm");
        const choice = document.createElement("label");
        const input = document.createElement("input");
        input.type = "radio";
        input.name = group;
        input.value = name;
        input.checked = name === wanted;
        choice.append(input, document.createTextNode(` ${name}`));
        switcher.appendChild(choice);
        body.hidden = name !== wanted;
      });
      switcher.addEventListener("change", (event) => {
        bodies.forEach((body) => { body.hidden = dataString(body, "rmUnit", "cm") !== event.target.value; });
      });
      table.before(switcher);
    }

    let opener = null;
    let sealed = [];
    const openers = [...document.querySelectorAll(`[aria-controls="${panel.id}"]`)];
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
        [{ opacity: 0, transform: "translateY(16px) scale(0.98)" }, { opacity: 1, transform: "none" }],
        { duration: duration + 80, easing: EASE.out },
      );
    };

    const onKey = (event) => {
      if (panel.hidden) return;
      if (event.key === "Escape") { event.preventDefault(); close(); return; }
      if (event.key !== "Tab") return;
      const stops = focusable(panel);
      if (!stops.length) return;
      const first = stops[0];
      const last = stops[stops.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };

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
      scoped.forEach((cell) => cell.removeAttribute("scope"));
      bodies.forEach((body) => { body.hidden = false; });
      switcher?.remove();
      delete panel.rmOpen;
      delete panel.rmClose;
      shut.remove();
      veil.remove();
      table?.classList.remove("rm-size-guide-table");
      panel.hidden = false;
      panel.classList.remove("rm-size-guide");
      ["role", "aria-modal", "aria-labelledby", "aria-label"].forEach((name) => panel.removeAttribute(name));
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * "Tell me when it is back", as a real form.
 *
 * The form and its confirmation are two faces in one grid cell, so the box is
 * already as tall as the taller of them and confirming does not shove the
 * product page down by eighty pixels. The inactive face is `visibility: hidden`
 * rather than `display: none`, which takes it out of the tab order and the
 * accessibility tree while it keeps holding the space open.
 *
 * Validation is the browser's own — `checkValidity` on a real
 * `<input type="email" required>` — but the *message* is ours, put in a
 * `role="alert"` and wired with `aria-describedby` and `aria-invalid`. The
 * native bubble is the thing to avoid: it vanishes on the next click, is not
 * reliably read by assistive technology, and cannot be styled or translated.
 *
 * Nothing is transmitted. With no `action` on the form the submit is prevented
 * and the confirmation is drawn locally; give the form a real `action` and the
 * component gets out of the way and lets it submit.
 *
 *   <form data-rm-stock-notify data-rm-name="Ochre beaker">
 *     <label for="back-1">Email address</label>
 *     <input id="back-1" type="email" name="email" autocomplete="email" required>
 *     <button type="submit">Tell me when it is back</button>
 *   </form>
 */
export function stockNotify(target = "[data-rm-stock-notify]", options = {}) {
  const forms = resolveElements(target);
  if (!forms.length) return () => {};

  const {
    doneText = "Thank you. We will email you once it is back.",
    errorText = "Enter an email address so we know where to write.",
    name = "",
  } = options;
  const cleanups = [];

  for (const form of forms) {
    const field = form.querySelector('input[type="email"], input[type="text"]');
    if (!field) continue;

    form.classList.add("rm-stock-notify");
    const hadNoValidate = form.noValidate;
    // Ours to report, so the browser's own bubble stays out of it.
    form.noValidate = true;
    const product = dataString(form, "rmName", name);

    const body = document.createElement("div");
    body.className = "rm-stock-notify-face is-on";
    body.append(...form.childNodes);

    const done = document.createElement("p");
    done.className = "rm-stock-notify-face rm-stock-notify-done";
    done.tabIndex = -1;
    done.textContent = dataString(form, "rmDone", doneText);

    const problem = document.createElement("p");
    problem.className = "rm-stock-notify-error";
    problem.id = uid("rm-stock-notify-error");
    problem.setAttribute("role", "alert");
    problem.hidden = true;
    body.appendChild(problem);

    const live = announcer(form);
    form.replaceChildren(body, done, live);

    const hadDescribedBy = field.getAttribute("aria-describedby");
    const hadAutocomplete = field.getAttribute("autocomplete");
    if (!hadAutocomplete) field.setAttribute("autocomplete", "email");

    const fail = (message) => {
      problem.textContent = message;
      problem.hidden = false;
      field.setAttribute("aria-invalid", "true");
      field.setAttribute("aria-describedby", [hadDescribedBy, problem.id].filter(Boolean).join(" "));
      field.focus();
    };

    const clear = () => {
      problem.hidden = true;
      problem.textContent = "";
      field.removeAttribute("aria-invalid");
      if (hadDescribedBy) field.setAttribute("aria-describedby", hadDescribedBy);
      else field.removeAttribute("aria-describedby");
    };

    const onSubmit = (event) => {
      if (!field.checkValidity()) {
        event.preventDefault();
        fail(dataString(form, "rmError", errorText));
        return;
      }
      clear();
      // A form with a real action is the author's, and it submits.
      if (form.getAttribute("action")) return;
      event.preventDefault();
      body.classList.remove("is-on");
      done.classList.add("is-on");
      live.textContent = product ? `${done.textContent} ${product}.` : done.textContent;
      done.focus();
      if (prefersReducedMotion()) return;
      done.animate(
        [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }],
        { duration: 320, easing: EASE.out },
      );
    };

    const onInput = () => { if (!problem.hidden) clear(); };
    form.addEventListener("submit", onSubmit);
    field.addEventListener("input", onInput);

    cleanups.push(() => {
      form.removeEventListener("submit", onSubmit);
      field.removeEventListener("input", onInput);
      clear();
      if (hadAutocomplete === null) field.removeAttribute("autocomplete");
      form.noValidate = hadNoValidate;
      form.replaceChildren(...body.childNodes);
      problem.remove();
      form.classList.remove("rm-stock-notify");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A muted loop with a poster and a real pause.
 *
 * Autoplay is only allowed to be silent, so the component sets `muted`, `loop`
 * and `playsinline` itself rather than trusting the markup — `playsinline` is
 * the one everybody forgets, and without it an iPhone takes the video full
 * screen the instant it starts, over the top of the product page. The `play()`
 * promise is caught, because a browser is entitled to refuse and a rejected
 * promise there is an uncaught error in the console for a feature that was
 * always optional.
 *
 * A loop longer than five seconds must be stoppable, so there is a real button.
 * Its label changes between "Play" and "Pause" — the opposite of the rule for a
 * wishlist toggle, and deliberately: a heart's *state* changes, so the name
 * stays put and `aria-pressed` carries the state, while here the *action*
 * changes, so the name has to change with it. Under reduced motion nothing
 * plays: the video rests on its poster, which is a picture, not a blank box.
 *
 *   <figure data-rm-product-video>
 *     <video src="/shop/throwing-a-beaker.mp4" poster="/shop/throwing-a-beaker.jpg"></video>
 *     <figcaption>The ochre beaker, thrown and trimmed.</figcaption>
 *   </figure>
 */
export function productVideo(target = "[data-rm-product-video]", options = {}) {
  const frames = resolveElements(target);
  if (!frames.length) return () => {};

  const { play = true, label = "product video" } = options;
  const cleanups = [];

  for (const frame of frames) {
    const video = frame.querySelector("video");
    if (!video) continue;

    frame.classList.add("rm-product-video");
    video.classList.add("rm-product-video-media");
    const was = {
      muted: video.muted, loop: video.loop, playsInline: video.playsInline, controls: video.controls,
    };
    const hadPreload = video.getAttribute("preload");
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute("preload", "metadata");
    const name = dataString(frame, "rmLabel", label);
    const wanted = dataString(frame, "rmPlay", String(play)) !== "false" && !prefersReducedMotion();

    const button = document.createElement("button");
    button.type = "button";
    button.className = "rm-product-video-toggle";
    frame.appendChild(button);

    const paint = () => {
      const running = !video.paused && !video.ended;
      button.textContent = running ? `Pause ${name}` : `Play ${name}`;
      frame.classList.toggle("is-playing", running);
    };

    const start = () => {
      const attempt = video.play();
      // A refusal is normal, not an error: the button is still there.
      if (attempt && typeof attempt.catch === "function") attempt.catch(() => paint());
    };
    const onToggle = () => { if (video.paused) start(); else video.pause(); };

    let auto = wanted;
    const onPlay = () => paint();
    const onPause = () => paint();
    button.addEventListener("click", () => { auto = video.paused; onToggle(); });
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    paint();

    // Off screen it stops entirely, and it only resumes if it was auto-playing
    // — a video somebody deliberately paused stays paused.
    cleanups.push(whileVisible(frame, () => {
      if (auto) start();
      return () => video.pause();
    }));

    cleanups.push(() => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      button.remove();
      video.pause();
      video.muted = was.muted;
      video.loop = was.loop;
      video.playsInline = was.playsInline;
      video.controls = was.controls;
      if (hadPreload === null) video.removeAttribute("preload");
      else video.setAttribute("preload", hadPreload);
      video.classList.remove("rm-product-video-media");
      frame.classList.remove("rm-product-video", "is-playing");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * The photograph changes with the chosen colour.
 *
 * One `<img>`, one `alt`, and a real radio group driving both. The usual build
 * stacks one `<img>` per colour and toggles `display`, which downloads every
 * variant before anybody has chosen one and leaves five copies of nearly the
 * same alt text in the accessibility tree. Swapping the source of a single
 * element keeps the picture to one node and one description.
 *
 * The next file is decoded before it is swapped in, so the frame never blanks
 * between colours — assigning `src` straight away is what produces the white
 * flash people mistake for a slow server. The alt is rewritten to name the
 * colour, and the change is announced politely, because a control whose only
 * effect is a picture changing does nothing at all for somebody who cannot see
 * the picture.
 *
 *   <div data-rm-swatch-gallery>
 *     <img src="/shop/beaker-ochre.jpg" alt="Ceramic beaker in ochre">
 *     <fieldset>
 *       <legend>Colour</legend>
 *       <label><input type="radio" name="beaker" value="ochre" checked data-rm-color="#c9922f"
 *              data-rm-src="/shop/beaker-ochre.jpg" data-rm-alt="Ceramic beaker in ochre"> Ochre</label>
 *       <label><input type="radio" name="beaker" value="ink" data-rm-color="#101014"
 *              data-rm-src="/shop/beaker-ink.jpg" data-rm-alt="Ceramic beaker in ink"> Ink</label>
 *     </fieldset>
 *   </div>
 */
export function swatchGallery(target = "[data-rm-swatch-gallery]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { duration = 380 } = options;
  const cleanups = [];

  for (const holder of holders) {
    const inputs = [...holder.querySelectorAll('input[type="radio"]')];
    const main = holder.querySelector("img");
    if (!inputs.length || !main) continue;

    holder.classList.add("rm-swatch-gallery");
    main.classList.add("rm-swatch-gallery-image");
    const speed = dataNumber(holder, "rmDuration", duration);
    const live = announcer(holder);
    const firstSrc = main.getAttribute("src");
    const firstAlt = main.alt;

    const dots = inputs.map((input) => {
      const label = input.closest("label") ?? input.parentElement;
      label?.classList.add("rm-swatch-gallery-chip");
      const dot = document.createElement("i");
      dot.className = "rm-swatch-gallery-dot";
      dot.setAttribute("aria-hidden", "true");
      dot.style.background = dataString(input, "rmColor", "currentColor");
      input.after(dot);
      return dot;
    });

    const show = (input, announce) => {
      const source = dataString(input, "rmSrc", "");
      const label = input.closest("label")?.textContent.trim() ?? input.value;
      const description = dataString(input, "rmAlt", `${firstAlt}, ${label}`);
      if (!source || main.getAttribute("src") === source) {
        if (announce) live.textContent = `${label} selected`;
        return;
      }

      const swap = () => {
        main.src = source;
        main.alt = description;
        if (prefersReducedMotion()) return;
        main.animate(
          [{ opacity: 0.25, transform: "scale(1.02)" }, { opacity: 1, transform: "none" }],
          { duration: speed, easing: EASE.out },
        );
      };
      // Decoded first: a swap that waits is invisible, a swap that does not
      // shows a hole where the product used to be.
      const preload = new Image();
      preload.src = source;
      (preload.decode?.() ?? Promise.resolve()).then(swap, swap);
      if (announce) live.textContent = `${label} selected. ${description}.`;
    };

    const onChange = (event) => {
      show(event.target, true);
      if (prefersReducedMotion()) return;
      dots[inputs.indexOf(event.target)]?.animate(
        [{ transform: "scale(0.8)" }, { transform: "scale(1)" }],
        { duration: 280, easing: EASE.spring },
      );
    };
    holder.addEventListener("change", onChange);

    // Silent on mount: the live region is already in the document, so its first
    // fill would be announced as though somebody had just chosen something.
    const chosen = inputs.find((input) => input.checked);
    if (chosen) show(chosen, false);

    cleanups.push(() => {
      holder.removeEventListener("change", onChange);
      dots.forEach((dot) => dot.remove());
      inputs.forEach((input) => {
        (input.closest("label") ?? input.parentElement)?.classList.remove("rm-swatch-gallery-chip");
      });
      live.remove();
      if (firstSrc !== null) main.setAttribute("src", firstSrc);
      main.alt = firstAlt;
      main.classList.remove("rm-swatch-gallery-image");
      holder.classList.remove("rm-swatch-gallery");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * New, sale, low stock, as real text in priority order.
 *
 * Every badge is a real `<li>` with a real sentence in it — "only 3 left", not
 * a red dot; "30% off this week", not a slash through a price. Colour is the
 * decoration on top of the words rather than the message itself, which is the
 * whole difference between a badge somebody can act on and a badge that is a
 * coloured rectangle to about one shopper in twelve.
 *
 * Cards have room for two labels and shops always have four, so the stack sorts
 * by urgency — stock first, then price, then novelty — shows the ones that fit,
 * and folds the rest behind a real `<button aria-expanded>`. Unfolding is a
 * FLIP, so the row grows without a single frame of animated width and the card
 * beneath it never jumps. The naive fix is `overflow: hidden`, which throws the
 * remaining labels away for everybody while leaving them in the tree to be read
 * out anyway.
 *
 *   <ul data-rm-badge-stack data-rm-max="2">
 *     <li data-rm-tone="new">New in</li>
 *     <li data-rm-tone="sale">30% off this week</li>
 *     <li data-rm-tone="low">Only 3 left</li>
 *   </ul>
 */
export function badgeStack(target = "[data-rm-badge-stack]", options = {}) {
  const stacks = resolveElements(target);
  if (!stacks.length) return () => {};

  const { max = 2, stagger = 80, duration = 420, label = "Labels" } = options;
  const rank = { low: 0, sale: 1, offer: 1, new: 2, info: 3 };
  const cleanups = [];

  for (const stack of stacks) {
    const badges = [...stack.children];
    if (!badges.length) continue;

    stack.classList.add("rm-badge-stack");
    const hadRole = stack.getAttribute("role");
    // Safari drops the list role from a list with no bullets, which is exactly
    // what every badge row is styled as.
    stack.setAttribute("role", "list");
    const hadLabel = stack.getAttribute("aria-label");
    stack.setAttribute("aria-label", dataString(stack, "rmLabel", hadLabel ?? label));

    const order = [...badges];
    const show = Math.max(1, Math.round(dataNumber(stack, "rmMax", max)));
    const step = dataNumber(stack, "rmStagger", stagger);
    const speed = dataNumber(stack, "rmDuration", duration);

    const sorted = [...badges].sort((a, b) => {
      const left = rank[dataString(a, "rmTone", "info")] ?? 3;
      const right = rank[dataString(b, "rmTone", "info")] ?? 3;
      return left - right;
    });
    // What the tone actually added, badge by badge. Stripping `is-sale` and
    // friends by pattern on teardown cannot tell our class from one the author
    // shipped, so a card written as `<li class="badge is-new" data-rm-tone="low">`
    // would lose its own styling hook the moment the component was unmounted.
    const toned = new Map();
    sorted.forEach((badge) => {
      badge.classList.add("rm-badge-stack-item");
      badge.setAttribute("role", "listitem");
      const tone = `is-${dataString(badge, "rmTone", "info")}`;
      if (!badge.classList.contains(tone)) {
        badge.classList.add(tone);
        toned.set(badge, tone);
      }
      stack.appendChild(badge);
    });

    const extra = sorted.slice(show);
    const more = document.createElement("li");
    more.className = "rm-badge-stack-more";
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-expanded", "false");
    button.textContent = `${extra.length} more`;
    button.setAttribute("aria-label", `Show ${extra.length} more labels`);
    more.appendChild(button);
    more.hidden = extra.length === 0;
    stack.appendChild(more);

    let folded = extra.length > 0;
    const fold = (on, animated) => {
      const boxes = sorted.map((badge) => [badge, badge.hidden ? null : badge.getBoundingClientRect()]);
      folded = on;
      extra.forEach((badge) => { badge.hidden = on; });
      // The button stays put in both states. Hiding the row that holds it on
      // expand is the classic disclosure bug: focus falls to `<body>`, the
      // control carrying `aria-expanded="true"` is the one now display:none,
      // and the labels can never be folded back again.
      more.hidden = extra.length === 0;
      button.setAttribute("aria-expanded", String(!on));
      button.textContent = on ? `${extra.length} more` : "Show fewer";
      button.setAttribute("aria-label", on ? `Show ${extra.length} more labels` : "Show fewer labels");
      if (!animated) return;
      boxes.forEach(([badge, was]) => { if (!badge.hidden && was) flip(badge, was, speed); });
      if (prefersReducedMotion()) return;
      extra.forEach((badge, i) => {
        if (badge.hidden) return;
        badge.animate(
          [{ opacity: 0, transform: "scale(0.7)" }, { opacity: 1, transform: "none" }],
          { duration: speed, delay: i * 60, easing: EASE.spring, fill: "backwards" },
        );
      });
    };
    fold(folded, false);

    // A disclosure toggles. Focus stays on the button that was pressed, because
    // the badges it reveals are plain `<li>` text with no tab stop of their own
    // and `focus()` on a non-focusable element quietly does nothing at all.
    const onMore = () => fold(!folded, true);
    button.addEventListener("click", onMore);

    // Once, as it arrives. Popping from the centre means the card behind never
    // reflows as the labels land on it.
    cleanups.push(watch(stack, () => {
      if (prefersReducedMotion()) return;
      sorted.filter((badge) => !badge.hidden).forEach((badge, i) => {
        badge.animate(
          [{ opacity: 0, transform: "scale(0.6)" }, { opacity: 1, transform: "none" }],
          { duration: speed, delay: i * step, easing: EASE.spring, fill: "backwards" },
        );
      });
    }, { threshold: 0.4, once: true }));

    cleanups.push(() => {
      button.removeEventListener("click", onMore);
      more.remove();
      sorted.forEach((badge) => {
        badge.hidden = false;
        badge.removeAttribute("role");
        badge.classList.remove("rm-badge-stack-item");
        const tone = toned.get(badge);
        if (tone) badge.classList.remove(tone);
        if (!badge.className.trim()) badge.removeAttribute("class");
      });
      order.forEach((badge) => stack.appendChild(badge));
      stack.classList.remove("rm-badge-stack");
      if (hadRole === null) stack.removeAttribute("role");
      else stack.setAttribute("role", hadRole);
      if (hadLabel === null) stack.removeAttribute("aria-label");
      else stack.setAttribute("aria-label", hadLabel);
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * Delivery and returns promises that keep their list role.
 *
 * Three or four promises in a row is the most-copied pattern in ecommerce and
 * the one most often built as bare `<div>`s with an icon and four words. Two
 * things go wrong. The first is that `list-style: none` makes Safari drop the
 * list role, so "3 promises" becomes three unrelated sentences — hence the
 * explicit `role="list"` and `role="listitem"` put back here. The second is
 * that the icon carries the meaning: a lorry means nothing spoken, so every
 * icon inside a promise is marked `aria-hidden` and the text has to say it.
 *
 * The row arrives once, staggered, from a small translate — never on a loop.
 * A trust row that keeps re-animating each time it scrolls past reads as an
 * advert rather than as a fact about the shop.
 *
 *   <ul data-rm-trust-row>
 *     <li><strong>Free delivery over €60</strong><span>Standard post, 2–4 working days.</span></li>
 *     <li><strong>60-day returns</strong><span>Unused and in its box, we pay the label.</span></li>
 *   </ul>
 */
export function trustRow(target = "[data-rm-trust-row]", options = {}) {
  const rows = resolveElements(target);
  if (!rows.length) return () => {};

  const { stagger = 90, duration = 620, label = "Our promises" } = options;
  const cleanups = [];

  for (const row of rows) {
    const items = [...row.children];
    if (!items.length) continue;

    row.classList.add("rm-trust-row");
    const hadRole = row.getAttribute("role");
    const hadLabel = row.getAttribute("aria-label");
    row.setAttribute("role", "list");
    row.setAttribute("aria-label", dataString(row, "rmLabel", hadLabel ?? label));
    const step = dataNumber(row, "rmStagger", stagger);
    const speed = dataNumber(row, "rmDuration", duration);
    const muted = [];

    items.forEach((item) => {
      item.classList.add("rm-trust-row-item");
      item.setAttribute("role", "listitem");
      item.querySelectorAll("svg, img").forEach((mark) => {
        if (mark.hasAttribute("aria-hidden")) return;
        mark.setAttribute("aria-hidden", "true");
        // An empty alt was written here, so it has to be taken away again on
        // teardown; leaving one behind changes how the author's own image is
        // treated for as long as the page lives.
        const emptied = mark.tagName === "IMG" && !mark.hasAttribute("alt");
        if (emptied) mark.alt = "";
        muted.push([mark, emptied]);
      });
      if (!prefersReducedMotion()) {
        item.style.opacity = "0";
        item.style.transform = "translateY(10px)";
      }
    });

    cleanups.push(watch(row, () => {
      items.forEach((item, i) => {
        item.style.opacity = "";
        item.style.transform = "";
        if (prefersReducedMotion()) return;
        item.animate(
          [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }],
          { duration: speed, delay: i * step, easing: EASE.out, fill: "backwards" },
        );
      });
    }, { threshold: 0.25, once: true }));

    cleanups.push(() => {
      muted.forEach(([mark, emptied]) => {
        mark.removeAttribute("aria-hidden");
        if (emptied) mark.removeAttribute("alt");
      });
      items.forEach((item) => {
        item.style.opacity = "";
        item.style.transform = "";
        item.removeAttribute("role");
        item.classList.remove("rm-trust-row-item");
      });
      row.classList.remove("rm-trust-row");
      if (hadRole === null) row.removeAttribute("role");
      else row.setAttribute("role", hadRole);
      if (hadLabel === null) row.removeAttribute("aria-label");
      else row.setAttribute("aria-label", hadLabel);
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * Real dates, working days counted, labelled an estimate.
 *
 * "Ships in 2–4 days" is the answer to a question nobody asked. What a shopper
 * actually wants to know is whether it arrives before Saturday, so this counts
 * the author's lead time in working days from a real cut-off hour, skips
 * weekends, and writes the answer as dates: "arrives between Tuesday 10 and
 * Thursday 12 March". Each one is a `<time datetime>` so the machine-readable
 * date is there beside the human one.
 *
 * It says the word "estimate" in text that cannot be configured away, because a
 * date printed with confidence is a promise and this component has no idea what
 * the courier is doing. The countdown to the cut-off refreshes on a slow
 * interval inside `whileVisible` rather than a frame loop — nothing here changes
 * faster than once a minute, and a per-frame timer for that is pure battery.
 *
 *   <p data-rm-shipping-estimate data-rm-min="2" data-rm-max="4" data-rm-cutoff="15"></p>
 */
export function shippingEstimate(target = "[data-rm-shipping-estimate]", options = {}) {
  const rows = resolveElements(target);
  if (!rows.length) return () => {};

  const { min = 2, max = 4, cutoff = 15, locale = undefined } = options;
  const cleanups = [];

  const workingDaysOn = (from, days) => {
    const date = new Date(from.getTime());
    let left = Math.max(0, days);
    while (left > 0) {
      date.setDate(date.getDate() + 1);
      const day = date.getDay();
      if (day !== 0 && day !== 6) left -= 1;
    }
    return date;
  };

  for (const row of rows) {
    const original = row.innerHTML;
    row.classList.add("rm-shipping-estimate");
    const soonest = Math.max(0, Math.round(dataNumber(row, "rmMin", min)));
    const latest = Math.max(soonest, Math.round(dataNumber(row, "rmMax", max)));
    const hour = clamp(dataNumber(row, "rmCutoff", cutoff), 0, 23);
    const where = dataString(row, "rmLocale", locale ?? here());

    const sentence = document.createElement("span");
    sentence.className = "rm-shipping-estimate-line";
    const caveat = document.createElement("span");
    caveat.className = "rm-shipping-estimate-caveat";
    caveat.textContent = "Estimate only — it depends on the courier.";
    const live = announcer(row);
    row.replaceChildren(sentence, caveat, live);

    let format;
    try {
      format = new Intl.DateTimeFormat(where, { weekday: "long", day: "numeric", month: "long" });
    } catch {
      format = new Intl.DateTimeFormat(undefined, { weekday: "long", day: "numeric", month: "long" });
    }
    const stamp = (date) => {
      const el = document.createElement("time");
      el.dateTime = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      el.textContent = format.format(date);
      return el;
    };

    let spoken = "";
    const paint = () => {
      const now = new Date();
      const deadline = new Date(now.getTime());
      deadline.setHours(hour, 0, 0, 0);
      const inTime = now < deadline && now.getDay() !== 0 && now.getDay() !== 6;
      const dispatch = inTime ? now : workingDaysOn(now, 1);

      const first = workingDaysOn(dispatch, soonest);
      const last = workingDaysOn(dispatch, latest);
      const minutes = Math.max(0, Math.round((deadline - now) / 60000));
      const hours = Math.floor(minutes / 60);

      const lead = inTime
        ? `Order within ${hours ? `${hours} hour${hours === 1 ? "" : "s"} ` : ""}${minutes % 60} minutes and it should arrive between `
        : "Ordered now, it should arrive between ";

      const from = stamp(first);
      const to = stamp(last);
      sentence.replaceChildren(
        document.createTextNode(lead),
        from,
        document.createTextNode(" and "),
        to,
        document.createTextNode("."),
      );

      // Only the part that changes meaning is compared. The visible line
      // carries a minutes-to-cut-off counter, so comparing the whole sentence
      // would differ on every single tick and the region would read all thirty
      // words back once a minute for as long as the paragraph was on screen —
      // which is the failure this guard exists to prevent. The dates are what
      // a shopper needs to hear again, and they only move when the dispatch day
      // rolls over or the cut-off passes.
      const next = `Arriving between ${from.textContent} and ${to.textContent}. ${caveat.textContent}`;
      if (next === spoken) return;
      spoken = next;
      live.textContent = next;
    };
    paint();
    // Silent on mount for the same reason every other component here is.
    live.textContent = "";

    cleanups.push(whileVisible(row, () => {
      const timer = setInterval(paint, 60000);
      return () => clearInterval(timer);
    }));

    cleanups.push(() => {
      row.classList.remove("rm-shipping-estimate");
      row.innerHTML = original;
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * Social proof that is visibly illustrative and pausable.
 *
 * This component never invents anybody. It rotates the notices the author wrote
 * into the markup and it stamps the row with a visible line saying the examples
 * are illustrative — a note that is text, not a tooltip, and that is added even
 * when the author forgot it. Presenting a made-up name and town as a real order
 * is a lie about another person's purchase, and a shop that does it is one
 * complaint away from finding out it is also illegal in most of Europe.
 *
 * The rotation is a real problem for accessibility, so it is solved twice: a
 * `<button>` pauses it, because anything moving for more than five seconds must
 * be stoppable, and a second button shows every notice at once and stops the
 * rotation for good — otherwise a screen reader gets whichever single notice
 * happened to be showing. The list is explicitly `aria-live="off"`: a rotator
 * wired to a live region interrupts the page every few seconds with an advert.
 *
 *   <div data-rm-recently-bought data-rm-interval="6000">
 *     <ul>
 *       <li>Someone in Bristol chose the Ochre Beaker — about an hour ago</li>
 *       <li>Someone in Leeds chose the Linen Cloth — this morning</li>
 *     </ul>
 *   </div>
 */
export function recentlyBought(target = "[data-rm-recently-bought]", options = {}) {
  const rows = resolveElements(target);
  if (!rows.length) return () => {};

  const {
    interval = 6000,
    note = "Illustrative examples, not real orders.",
    label = "Recent activity, illustrative",
  } = options;
  const cleanups = [];

  for (const row of rows) {
    const list = row.querySelector("ul, ol");
    const items = list ? [...list.children] : [];
    if (items.length < 1) continue;

    row.classList.add("rm-recently-bought");
    row.setAttribute("role", "region");
    const hadLabel = row.getAttribute("aria-label");
    row.setAttribute("aria-label", dataString(row, "rmLabel", hadLabel ?? label));
    list.classList.add("rm-recently-bought-list");
    // Never a live region. The visitor came for a product, not for a ticker.
    const hadListLive = list.getAttribute("aria-live");
    list.setAttribute("aria-live", "off");
    items.forEach((item) => item.classList.add("rm-recently-bought-item"));

    const gap = Math.max(2000, dataNumber(row, "rmInterval", interval));
    const controls = document.createElement("p");
    controls.className = "rm-recently-bought-controls";
    const pause = document.createElement("button");
    pause.type = "button";
    pause.className = "rm-recently-bought-pause";
    const all = document.createElement("button");
    all.type = "button";
    all.className = "rm-recently-bought-all";
    all.textContent = "Show all";
    all.setAttribute("aria-expanded", "false");
    controls.append(pause, all);

    const caveat = document.createElement("p");
    caveat.className = "rm-recently-bought-note";
    caveat.textContent = dataString(row, "rmNote", note);
    row.append(controls, caveat);

    let at = 0;
    let paused = false;
    let expanded = false;

    const paint = () => {
      items.forEach((item, i) => { item.hidden = !expanded && i !== at; });
      pause.textContent = paused ? "Resume" : "Pause";
      pause.disabled = expanded;
      all.textContent = expanded ? "Show one at a time" : "Show all";
      all.setAttribute("aria-expanded", String(expanded));
    };

    const advance = () => {
      if (paused || expanded || items.length < 2) return;
      at = (at + 1) % items.length;
      paint();
      if (prefersReducedMotion()) return;
      items[at].animate(
        [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }],
        { duration: 320, easing: EASE.out },
      );
    };

    pause.addEventListener("click", () => { paused = !paused; paint(); });
    all.addEventListener("click", () => { expanded = !expanded; paused = expanded || paused; paint(); });

    const hold = () => { row.classList.add("is-held"); };
    const release = () => { row.classList.remove("is-held"); };
    // Focus moving between the pause button and the list is not a departure, so
    // this is named rather than inline — both because it has to check where the
    // focus went, and because an anonymous listener can never be removed.
    const onFocusOut = (event) => { if (!row.contains(event.relatedTarget)) release(); };
    row.addEventListener("pointerenter", hold);
    row.addEventListener("pointerleave", release);
    row.addEventListener("focusin", hold);
    row.addEventListener("focusout", onFocusOut);
    paint();

    cleanups.push(whileVisible(row, () => {
      const timer = setInterval(() => { if (!row.classList.contains("is-held")) advance(); }, gap);
      return () => clearInterval(timer);
    }));

    cleanups.push(() => {
      row.removeEventListener("pointerenter", hold);
      row.removeEventListener("pointerleave", release);
      row.removeEventListener("focusin", hold);
      row.removeEventListener("focusout", onFocusOut);
      controls.remove();
      caveat.remove();
      items.forEach((item) => {
        item.hidden = false;
        item.classList.remove("rm-recently-bought-item");
      });
      if (hadListLive === null) list.removeAttribute("aria-live");
      else list.setAttribute("aria-live", hadListLive);
      list.classList.remove("rm-recently-bought-list");
      row.classList.remove("rm-recently-bought", "is-held");
      row.removeAttribute("role");
      if (hadLabel === null) row.removeAttribute("aria-label");
      else row.setAttribute("aria-label", hadLabel);
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * A rail you can page from the keyboard.
 *
 * A horizontal strip of "goes well with" is a scroll container, and a scroll
 * container with no tab stop is content a keyboard cannot reach at all — so the
 * rail itself gets `tabindex="0"` and a label, which is the fix most carousels
 * are missing. On top of that sit two real buttons that page by the rail's own
 * width and go `disabled` at each end, kept honest by a passive scroll listener
 * and a `ResizeObserver` rather than by arithmetic done once on mount.
 *
 * Focus moving into an item that is off screen is handled with `keepInView`,
 * which scrolls the one box that should move. `scrollIntoView` is the reflex
 * here and it walks every scrollable ancestor including the page, so tabbing
 * through a cross-sell rail throws the whole product page around. The position
 * is announced politely once scrolling settles, never during it.
 *
 *   <section data-rm-cross-sell>
 *     <h2>Goes well with</h2>
 *     <ul>
 *       <li><a href="/p/linen-cloth"><img src="/shop/linen-cloth.jpg" alt="Folded linen cloth"><span>Linen cloth</span></a></li>
 *       <li><a href="/p/stoneware-jug"><img src="/shop/stoneware-jug.jpg" alt="Stoneware jug"><span>Stoneware jug</span></a></li>
 *     </ul>
 *   </section>
 */
export function crossSell(target = "[data-rm-cross-sell]", options = {}) {
  const rails = resolveElements(target);
  if (!rails.length) return () => {};

  const { label = "Goes well with", delay = 350 } = options;
  const cleanups = [];

  for (const holder of rails) {
    const list = holder.querySelector("ul, ol");
    const items = list ? [...list.children] : [];
    if (items.length < 2) continue;

    holder.classList.add("rm-cross-sell");
    list.classList.add("rm-cross-sell-rail");
    const name = dataString(holder, "rmLabel", holder.querySelector("h1, h2, h3")?.textContent.trim() || label);
    // A scrollable box needs a tab stop of its own, or its overflow is
    // unreachable without a pointer.
    const hadTabIndex = list.getAttribute("tabindex");
    const hadListRole = list.getAttribute("role");
    const hadListLabel = list.getAttribute("aria-label");
    list.tabIndex = 0;
    list.setAttribute("role", "group");
    list.setAttribute("aria-label", name);
    items.forEach((item) => item.classList.add("rm-cross-sell-item"));

    const nav = document.createElement("p");
    nav.className = "rm-cross-sell-nav";
    const back = document.createElement("button");
    back.type = "button";
    back.className = "rm-cross-sell-page";
    back.setAttribute("aria-label", `Previous ${name}`);
    back.textContent = "←";
    const on = document.createElement("button");
    on.type = "button";
    on.className = "rm-cross-sell-page";
    on.setAttribute("aria-label", `Next ${name}`);
    on.textContent = "→";
    nav.append(back, on);
    const live = announcer(holder);
    holder.append(nav, live);

    const wait = dataNumber(holder, "rmDelay", delay);
    let timer = 0;

    const sync = () => {
      const room = list.scrollWidth - list.clientWidth;
      back.disabled = list.scrollLeft <= 1;
      on.disabled = list.scrollLeft >= room - 1;
    };

    const settle = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const box = list.getBoundingClientRect();
        const seen = items.filter((item) => {
          const at = item.getBoundingClientRect();
          return at.right > box.left + 4 && at.left < box.right - 4;
        });
        if (!seen.length) return;
        const first = items.indexOf(seen[0]) + 1;
        const last = items.indexOf(seen[seen.length - 1]) + 1;
        live.textContent = first === last
          ? `Item ${first} of ${items.length}`
          : `Items ${first} to ${last} of ${items.length}`;
      }, wait);
    };

    const page = (direction) => {
      list.scrollBy({
        left: direction * Math.max(160, list.clientWidth * 0.85),
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
      settle();
    };

    const onScroll = () => { sync(); settle(); };
    const onFocusIn = (event) => {
      const item = event.target.closest(".rm-cross-sell-item");
      if (item) keepInView(list, item, prefersReducedMotion() ? "auto" : "smooth");
    };
    const onBack = () => page(-1);
    const onOn = () => page(1);

    back.addEventListener("click", onBack);
    on.addEventListener("click", onOn);
    list.addEventListener("scroll", onScroll, { passive: true });
    list.addEventListener("focusin", onFocusIn);
    const watcher = new ResizeObserver(sync);
    watcher.observe(list);
    sync();

    cleanups.push(() => {
      clearTimeout(timer);
      watcher.disconnect();
      back.removeEventListener("click", onBack);
      on.removeEventListener("click", onOn);
      list.removeEventListener("scroll", onScroll);
      list.removeEventListener("focusin", onFocusIn);
      nav.remove();
      live.remove();
      items.forEach((item) => item.classList.remove("rm-cross-sell-item"));
      // Restore, never blindly remove: the author may well have written their
      // own name on this list, and wiping it on teardown leaves the rail worse
      // off than if the component had never run.
      if (hadTabIndex === null) list.removeAttribute("tabindex");
      else list.setAttribute("tabindex", hadTabIndex);
      if (hadListRole === null) list.removeAttribute("role");
      else list.setAttribute("role", hadListRole);
      if (hadListLabel === null) list.removeAttribute("aria-label");
      else list.setAttribute("aria-label", hadListLabel);
      list.classList.remove("rm-cross-sell-rail");
      holder.classList.remove("rm-cross-sell");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Real radios, with the difference stated in money.
 *
 * An upsell row is a choice between tiers, so it is a radio group — not three
 * clickable cards, which is what it usually is. Cards give you no group
 * semantics, no arrow keys, no value in the form and no way to tell which one
 * is chosen without looking at a border. Here every tier is an
 * `<input type="radio">` and the ring marking the choice FLIPs between them, so
 * what looks like a box growing is a measured transform with no layout work.
 *
 * The upgrade is priced as a difference against the cheapest tier — "18 euros
 * more than Standard" — because the number a shopper is deciding about is the
 * gap, not the total, and reading two totals and subtracting them is work the
 * page should have done. Any "our pick" flag comes from the markup and is
 * rendered as words, so it is a recommendation somebody wrote rather than a
 * coloured border implying one.
 *
 *   <fieldset data-rm-upsell-row data-rm-currency="EUR">
 *     <legend>Choose your finish</legend>
 *     <label><input type="radio" name="finish" value="standard" checked data-rm-price="48"> Standard glaze</label>
 *     <label><input type="radio" name="finish" value="reactive" data-rm-price="66" data-rm-pick="true"> Reactive glaze</label>
 *   </fieldset>
 */
export function upsellRow(target = "[data-rm-upsell-row]", options = {}) {
  const rows = resolveElements(target);
  if (!rows.length) return () => {};

  const { currency = "EUR", locale = undefined, duration = 340, pickText = "Our pick" } = options;
  const cleanups = [];

  for (const row of rows) {
    const inputs = [...row.querySelectorAll('input[type="radio"]')];
    if (inputs.length < 2) continue;

    row.classList.add("rm-upsell-row");
    const unit = dataString(row, "rmCurrency", currency);
    const where = dataString(row, "rmLocale", locale ?? here());
    const speed = dataNumber(row, "rmDuration", duration);
    const live = announcer(row);

    const prices = inputs.map((input) => dataNumber(input, "rmPrice", 0));
    const floor = Math.min(...prices);
    const base = inputs[prices.indexOf(floor)];
    const baseName = base.closest("label")?.textContent.trim() ?? base.value;

    const marks = [];
    const tiers = inputs.map((input, i) => {
      const label = input.closest("label") ?? input.parentElement;
      label?.classList.add("rm-upsell-row-tier");
      const gap = prices[i] - floor;
      const difference = document.createElement("span");
      difference.className = "rm-upsell-row-diff";
      difference.textContent = gap > 0 ? `${money(gap, unit, where).drawn} more` : "Included";
      label?.appendChild(difference);
      marks.push(difference);
      // The flag's words come from the marked tier, or from the row's own
      // `data-rm-pick-text`. They emphatically do not come from the row's
      // `data-rm-label`: everywhere else in this library that attribute names
      // the group, so an author writing `data-rm-label="Choose your finish"` on
      // the fieldset — the obvious thing to write — would find the whole
      // question printed on one tier as a recommendation.
      const pick = dataString(input, "rmPick", "");
      if (pick && pick !== "false") {
        const flag = document.createElement("span");
        flag.className = "rm-upsell-row-pick";
        flag.textContent = pick === "true" ? dataString(row, "rmPickText", pickText) : pick;
        label?.appendChild(flag);
        marks.push(flag);
      }
      return { input, label, gap };
    });

    const ring = document.createElement("i");
    ring.className = "rm-upsell-row-ring";
    ring.setAttribute("aria-hidden", "true");
    ring.hidden = true;
    row.appendChild(ring);

    const place = (animated) => {
      const chosen = tiers.find(({ input }) => input.checked);
      if (!chosen?.label) { ring.hidden = true; return; }
      const was = ring.hidden ? null : ring.getBoundingClientRect();
      const box = chosen.label.getBoundingClientRect();
      const home = row.getBoundingClientRect();
      ring.hidden = false;
      ring.style.width = `${box.width}px`;
      ring.style.height = `${box.height}px`;
      ring.style.left = `${box.left - home.left}px`;
      ring.style.top = `${box.top - home.top}px`;
      if (animated && was) flip(ring, was, speed);
    };

    const onChange = (event) => {
      place(true);
      const tier = tiers.find(({ input }) => input === event.target);
      const name = tier?.label?.textContent.trim() ?? event.target.value;
      live.textContent = tier && tier.gap > 0
        ? `${name} selected, ${money(tier.gap, unit, where).spoken} more than ${baseName}.`
        : `${name} selected.`;
    };
    row.addEventListener("change", onChange);

    // The ring is placed from measurement, so it is re-measured when the row
    // wraps onto a second line.
    const watcher = new ResizeObserver(() => place(false));
    watcher.observe(row);
    place(false);

    cleanups.push(() => {
      watcher.disconnect();
      row.removeEventListener("change", onChange);
      marks.forEach((mark) => mark.remove());
      tiers.forEach(({ label }) => label?.classList.remove("rm-upsell-row-tier"));
      ring.remove();
      live.remove();
      row.classList.remove("rm-upsell-row");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * An amount and a message, and never a code.
 *
 * A gift card code is money, so this component has no idea what one looks like:
 * it does not mint, read, store or check one, and there is no field for it. It
 * chooses an amount from a real radio group and carries a short message, which
 * is the entire presentational job.
 *
 * The preview is `aria-hidden` and the whole state is spoken once, debounced,
 * by a polite region — a preview that updates on every keystroke and is also in
 * the accessibility tree reads the message back one character at a time. The
 * character counter is deliberately silent for the same reason, and only speaks
 * when the limit is actually reached, which is the one moment it is news. The
 * card turns on `rotateY` alone, so nothing around it reflows as the amount
 * changes.
 *
 *   <form data-rm-gift-card data-rm-currency="EUR">
 *     <fieldset>
 *       <legend>Amount</legend>
 *       <label><input type="radio" name="amount" value="25" checked> €25</label>
 *       <label><input type="radio" name="amount" value="50"> €50</label>
 *     </fieldset>
 *     <label for="gift-message">Message (optional)</label>
 *     <textarea id="gift-message" maxlength="120" rows="3"></textarea>
 *   </form>
 */
export function giftCard(target = "[data-rm-gift-card]", options = {}) {
  const cards = resolveElements(target);
  if (!cards.length) return () => {};

  const { currency = "EUR", locale = undefined, delay = 500, duration = 520 } = options;
  const cleanups = [];

  for (const card of cards) {
    const amounts = [...card.querySelectorAll('input[type="radio"]')];
    if (!amounts.length) continue;
    const message = card.querySelector("textarea");

    card.classList.add("rm-gift-card");
    const unit = dataString(card, "rmCurrency", currency);
    const where = dataString(card, "rmLocale", locale ?? here());
    const wait = dataNumber(card, "rmDelay", delay);
    const speed = dataNumber(card, "rmDuration", duration);

    const preview = document.createElement("div");
    preview.className = "rm-gift-card-preview";
    preview.setAttribute("aria-hidden", "true");
    const face = document.createElement("div");
    face.className = "rm-gift-card-face";
    const figure = document.createElement("strong");
    figure.className = "rm-gift-card-figure";
    const words = document.createElement("p");
    words.className = "rm-gift-card-words";
    face.append(figure, words);
    preview.appendChild(face);

    const counter = document.createElement("p");
    counter.className = "rm-gift-card-counter";
    counter.setAttribute("aria-hidden", "true");
    const limit = message ? Number(message.getAttribute("maxlength")) || 0 : 0;
    // The preview itself is `aria-hidden`, so this is the only place the effect
    // of typing is described at all — read, never drawn, because sighted
    // visitors can simply watch the card fill in.
    const hint = said(limit
      ? `Up to ${limit} characters. The message is shown on the card preview.`
      : "The message is shown on the card preview.");
    hint.id = uid("rm-gift-card-hint");
    const hadDescribedBy = message?.getAttribute("aria-describedby") ?? null;
    if (message) message.setAttribute("aria-describedby", [hadDescribedBy, hint.id].filter(Boolean).join(" "));

    const live = announcer(card);
    card.append(preview, counter, hint, live);

    let timer = 0;
    let toldLimit = false;

    const paint = (turn) => {
      const chosen = amounts.find((input) => input.checked);
      const value = Number(chosen?.value ?? 0);
      const shown = money(Number.isFinite(value) ? value : 0, unit, where);
      figure.textContent = shown.drawn;
      const text = message?.value.trim() ?? "";
      words.textContent = text;
      if (limit && message) {
        const left = limit - message.value.length;
        counter.textContent = `${left} characters left`;
        if (left === 0 && !toldLimit) { toldLimit = true; live.textContent = "Message is full."; }
        if (left > 0) toldLimit = false;
      }
      if (!turn || prefersReducedMotion()) return;
      face.animate(
        [{ transform: "rotateY(-90deg)" }, { transform: "none" }],
        { duration: speed, easing: EASE.out },
      );
    };

    const speak = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const chosen = amounts.find((input) => input.checked);
        const value = Number(chosen?.value ?? 0);
        const text = message?.value.trim() ?? "";
        live.textContent = text
          ? `${money(value, unit, where).spoken} gift card. Message: ${text}`
          : `${money(value, unit, where).spoken} gift card, no message.`;
      }, wait);
    };

    const onChange = () => { paint(true); speak(); };
    const onType = () => { paint(false); speak(); };
    card.addEventListener("change", onChange);
    message?.addEventListener("input", onType);
    paint(false);

    cleanups.push(() => {
      clearTimeout(timer);
      card.removeEventListener("change", onChange);
      message?.removeEventListener("input", onType);
      if (message) {
        if (hadDescribedBy) message.setAttribute("aria-describedby", hadDescribedBy);
        else message.removeAttribute("aria-describedby");
      }
      preview.remove();
      counter.remove();
      hint.remove();
      live.remove();
      card.classList.remove("rm-gift-card");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A balance, the gap to the next tier, both spoken.
 *
 * A real `role="progressbar"` with `aria-valuenow`, `aria-valuemax` and, the one
 * that matters, `aria-valuetext` — so it reads "320 of 500 points, 180 to free
 * delivery" instead of "64 percent". Nobody has ever wanted a percentage of a
 * loyalty scheme; the useful number is the gap, and the gap is the thing a bar
 * on its own can never say.
 *
 * The fill is a `scaleX` on a bar that is already full width, so awarding points
 * costs one composited frame rather than a re-layout of the panel, and the
 * balance rolls behind a fixed-width cell of tabular figures. Any tiers written
 * into the markup become real text pinned along the track with `aria-current` on
 * the next one to reach — the version drawn as unlabelled notches tells a
 * sighted visitor there is something to aim at and everybody else nothing at all.
 *
 *   <div data-rm-loyalty-points data-rm-value="320" data-rm-max="500" data-rm-reward="free delivery">
 *     <ul><li data-rm-value="250">Free postcard</li><li data-rm-value="500">Free delivery</li></ul>
 *   </div>
 */
export function loyaltyPoints(target = "[data-rm-loyalty-points]", options = {}) {
  const meters = resolveElements(target);
  if (!meters.length) return () => {};

  const { value = 0, max = 500, reward = "your next reward", duration = 620 } = options;
  const cleanups = [];

  for (const meter of meters) {
    const tierList = meter.querySelector("ul, ol");
    const tiers = tierList ? [...tierList.children] : [];
    meter.classList.add("rm-loyalty-points");
    meter.setAttribute("role", "progressbar");
    meter.setAttribute("aria-valuemin", "0");

    const total = Math.max(1, dataNumber(meter, "rmMax", max));
    const goal = dataString(meter, "rmReward", reward);
    const speed = dataNumber(meter, "rmDuration", duration);
    meter.setAttribute("aria-valuemax", String(total));
    meter.style.setProperty(
      "--rm-loyalty-points-duration",
      `${prefersReducedMotion() ? 0 : speed}ms`,
    );

    const head = document.createElement("p");
    head.className = "rm-loyalty-points-head";
    const figure = document.createElement("strong");
    figure.className = "rm-loyalty-points-figure";
    figure.setAttribute("aria-hidden", "true");
    const words = document.createElement("span");
    words.className = "rm-loyalty-points-words";
    head.append(figure, words);

    const track = document.createElement("span");
    track.className = "rm-loyalty-points-track";
    track.setAttribute("aria-hidden", "true");
    const fill = document.createElement("i");
    track.appendChild(fill);

    tierList?.classList.add("rm-loyalty-points-tiers");
    tiers.forEach((tier) => {
      tier.classList.add("rm-loyalty-points-tier");
      const at = clamp(dataNumber(tier, "rmValue", 0) / total, 0, 1);
      tier.style.setProperty("--rm-loyalty-points-at", String(at));
    });
    meter.prepend(head, track);

    let shown = clamp(dataNumber(meter, "rmValue", value), 0, Number.MAX_SAFE_INTEGER);

    const paint = (roll) => {
      const held = Math.max(0, Math.round(shown));
      const share = clamp(held / total, 0, 1);
      meter.style.setProperty("--rm-loyalty-points-value", String(share));
      meter.setAttribute("aria-valuenow", String(held));

      const next = tiers
        .map((tier) => ({ tier, need: dataNumber(tier, "rmValue", 0) }))
        .filter(({ need }) => need > held)
        .sort((a, b) => a.need - b.need)[0];
      tiers.forEach((tier) => {
        const need = dataNumber(tier, "rmValue", 0);
        tier.classList.toggle("is-reached", held >= need);
        if (next && tier === next.tier) tier.setAttribute("aria-current", "true");
        else tier.removeAttribute("aria-current");
      });

      const need = next ? next.need : total;
      const label = next ? next.tier.textContent.trim() : goal;
      const sentence = held >= need
        ? `${held} points. Every reward unlocked.`
        : `${held} of ${need} points, ${need - held} to ${label}`;
      words.textContent = sentence;
      meter.setAttribute("aria-valuetext", sentence);

      const previous = figure.textContent;
      figure.textContent = String(held);
      if (!roll || prefersReducedMotion() || previous === figure.textContent) return;
      const up = Number(previous || 0) < held;
      const leaving = figure.cloneNode(true);
      leaving.textContent = previous;
      leaving.classList.add("is-leaving");
      head.insertBefore(leaving, figure);
      leaving.animate(
        [{ transform: "none", opacity: 1 }, { transform: `translateY(${up ? -90 : 90}%)`, opacity: 0 }],
        { duration: 320, easing: EASE.out, fill: "forwards" },
      ).finished.then(() => leaving.remove(), () => leaving.remove());
      figure.animate(
        [{ transform: `translateY(${up ? 90 : -90}%)`, opacity: 0 }, { transform: "none", opacity: 1 }],
        { duration: 320, easing: EASE.out },
      );
    };
    paint(false);

    meter.rmSet = (next) => { shown = Number(next) || 0; paint(true); };

    // The bar fills as it arrives, once. `whileVisible` would refill it from
    // zero every time the panel scrolled back, which makes a settled balance
    // look like it is being earned live.
    cleanups.push(watch(meter, () => {
      if (prefersReducedMotion()) return;
      fill.animate(
        [{ transform: "scaleX(0)" }, { transform: `scaleX(${clamp(shown / total, 0, 1)})` }],
        { duration: speed, easing: EASE.out },
      );
    }, { threshold: 0.35, once: true }));

    cleanups.push(() => {
      delete meter.rmSet;
      head.remove();
      track.remove();
      tierList?.classList.remove("rm-loyalty-points-tiers");
      tiers.forEach((tier) => {
        tier.classList.remove("rm-loyalty-points-tier", "is-reached");
        tier.removeAttribute("aria-current");
        tier.style.removeProperty("--rm-loyalty-points-at");
      });
      ["role", "aria-valuemin", "aria-valuemax", "aria-valuenow", "aria-valuetext"]
        .forEach((name) => meter.removeAttribute(name));
      meter.style.removeProperty("--rm-loyalty-points-value");
      meter.style.removeProperty("--rm-loyalty-points-duration");
      meter.classList.remove("rm-loyalty-points");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * A link, a copy button whose name never changes.
 *
 * The button is always called "Copy link". The version everybody writes swaps
 * the label to "Copied!" for two seconds, which changes the button's accessible
 * name underneath a live region that has just said the same thing — so the
 * result is announced twice — and leaves anybody who tabs back to it a second
 * later reading a label that describes the past rather than what pressing it
 * will do. The confirmation belongs in the polite region and the tick beside it.
 *
 * The clipboard API needs a secure context and a real user gesture, and it can
 * still refuse, so the fallback is not silence: the field is selected and the
 * region says which keys to press. The link itself is a readonly `<input>` with
 * a real `<label>`, because it has to be selectable and readable by a screen
 * reader before it is copyable.
 *
 *   <div data-rm-referral-box>
 *     <label for="referral-1">Your referral link</label>
 *     <input id="referral-1" readonly value="https://example.test/r/fictional-code">
 *   </div>
 */
export function referralBox(target = "[data-rm-referral-box]", options = {}) {
  const boxes = resolveElements(target);
  if (!boxes.length) return () => {};

  const { label = "Copy link", doneText = "Link copied to the clipboard.", hold = 2400 } = options;
  const cleanups = [];

  for (const box of boxes) {
    const field = box.querySelector("input");
    if (!field) continue;

    box.classList.add("rm-referral-box");
    field.classList.add("rm-referral-box-field");
    const wasReadOnly = field.readOnly;
    field.readOnly = true;
    const name = dataString(box, "rmLabel", label);
    const done = dataString(box, "rmDone", doneText);
    const wait = dataNumber(box, "rmHold", hold);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "rm-referral-box-copy";
    button.textContent = name;
    const tick = document.createElement("i");
    tick.className = "rm-referral-box-tick";
    tick.setAttribute("aria-hidden", "true");
    tick.textContent = "✓";
    button.appendChild(tick);
    field.after(button);
    const live = announcer(box);

    let timer = 0;
    const flash = () => {
      box.classList.add("is-copied");
      clearTimeout(timer);
      timer = setTimeout(() => box.classList.remove("is-copied"), wait);
      if (prefersReducedMotion()) return;
      tick.animate(
        [{ transform: "scale(0.4)", opacity: 0 }, { transform: "none", opacity: 1 }],
        { duration: 320, easing: EASE.spring },
      );
    };

    const onCopy = () => {
      const value = field.value;
      const fallback = () => {
        field.select();
        field.setSelectionRange(0, value.length);
        live.textContent = "The link is selected. Press the copy shortcut for your system to copy it.";
      };
      if (!navigator.clipboard?.writeText) { fallback(); return; }
      navigator.clipboard.writeText(value).then(
        () => { live.textContent = done; flash(); },
        fallback,
      );
    };
    button.addEventListener("click", onCopy);

    cleanups.push(() => {
      clearTimeout(timer);
      button.removeEventListener("click", onCopy);
      button.remove();
      live.remove();
      field.classList.remove("rm-referral-box-field");
      field.readOnly = wasReadOnly;
      box.classList.remove("rm-referral-box", "is-copied");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A real form with a real label and a real error summary.
 *
 * Native validation is turned off and reimplemented on purpose, which sounds
 * backwards until you watch somebody use the browser's own bubble: it appears
 * on one field at a time, disappears at the next click, is not reliably read by
 * assistive technology, cannot be translated and cannot be styled. So the form
 * is `novalidate`, `checkValidity` still does the actual judging, and the
 * verdict goes into a `role="alert"` summary listing each problem as a link
 * straight to the field it belongs to — the pattern government services settled
 * on because it is the only one that works on a form with more than one error.
 *
 * The consent box is a real `<input type="checkbox" required>` with the promise
 * written beside it as text, never a pre-ticked box and never a sentence buried
 * in a link. Nothing is transmitted: with no `action` the submit is prevented
 * and the confirmation is drawn in place, in a face that shares a grid cell with
 * the form so the page below it does not move.
 *
 *   <form data-rm-subscribe-box>
 *     <label for="letter-1">Email address</label>
 *     <input id="letter-1" type="email" name="email" autocomplete="email" required>
 *     <label><input type="checkbox" name="consent" required> Yes, send me the letter. Unsubscribe any time.</label>
 *     <button type="submit">Subscribe</button>
 *   </form>
 */
export function subscribeBox(target = "[data-rm-subscribe-box]", options = {}) {
  const forms = resolveElements(target);
  if (!forms.length) return () => {};

  const {
    doneText = "You are on the list. Look out for the first letter.",
    errorText = "There is a problem",
    label = "Newsletter",
  } = options;
  const cleanups = [];

  for (const form of forms) {
    const fields = [...form.querySelectorAll("input, select, textarea")]
      .filter((field) => field.type !== "submit" && field.type !== "button");
    if (!fields.length) continue;

    form.classList.add("rm-subscribe-box");
    const hadNoValidate = form.noValidate;
    form.noValidate = true;
    const hadLabel = form.getAttribute("aria-label");
    form.setAttribute("aria-label", dataString(form, "rmLabel", hadLabel ?? label));

    const body = document.createElement("div");
    body.className = "rm-subscribe-box-face is-on";
    body.append(...form.childNodes);

    const summary = document.createElement("div");
    summary.className = "rm-subscribe-box-summary";
    summary.setAttribute("role", "alert");
    summary.tabIndex = -1;
    summary.hidden = true;
    body.prepend(summary);

    const done = document.createElement("p");
    done.className = "rm-subscribe-box-face rm-subscribe-box-done";
    done.tabIndex = -1;
    done.textContent = dataString(form, "rmDone", doneText);

    const live = announcer(form);
    form.replaceChildren(body, done, live);

    const named = (field) => {
      const own = field.labels?.[0]?.textContent.trim();
      return own || field.getAttribute("aria-label") || field.name || "This field";
    };

    const clear = () => {
      summary.hidden = true;
      summary.replaceChildren();
      fields.forEach((field) => field.removeAttribute("aria-invalid"));
    };

    const report = (bad) => {
      const title = document.createElement("p");
      title.className = "rm-subscribe-box-summary-title";
      title.textContent = `${dataString(form, "rmError", errorText)}: ${bad.length} to fix.`;
      const list = document.createElement("ul");
      bad.forEach((field) => {
        if (!field.id) field.id = uid("rm-subscribe-box-field");
        field.setAttribute("aria-invalid", "true");
        const row = document.createElement("li");
        const link = document.createElement("a");
        link.href = `#${field.id}`;
        link.textContent = field.validationMessage
          ? `${named(field)} — ${field.validationMessage}`
          : `${named(field)} needs an answer`;
        // Focus rather than a jump: the anchor is how it is announced, moving
        // focus is how it is actually reached.
        link.addEventListener("click", (event) => { event.preventDefault(); field.focus(); });
        row.appendChild(link);
        list.appendChild(row);
      });
      summary.replaceChildren(title, list);
      summary.hidden = false;
      summary.focus();
      if (prefersReducedMotion()) return;
      summary.animate(
        [{ opacity: 0, transform: "translateY(-6px)" }, { opacity: 1, transform: "none" }],
        { duration: 260, easing: EASE.out },
      );
    };

    const onSubmit = (event) => {
      const bad = fields.filter((field) => !field.checkValidity());
      if (bad.length) { event.preventDefault(); clear(); report(bad); return; }
      clear();
      if (form.getAttribute("action")) return;
      event.preventDefault();
      body.classList.remove("is-on");
      done.classList.add("is-on");
      live.textContent = done.textContent;
      done.focus();
      if (prefersReducedMotion()) return;
      done.animate(
        [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }],
        { duration: 320, easing: EASE.out },
      );
    };
    const onInput = (event) => {
      if (!summary.hidden && event.target.checkValidity()) event.target.removeAttribute("aria-invalid");
    };

    form.addEventListener("submit", onSubmit);
    form.addEventListener("input", onInput);

    cleanups.push(() => {
      form.removeEventListener("submit", onSubmit);
      form.removeEventListener("input", onInput);
      clear();
      summary.remove();
      form.noValidate = hadNoValidate;
      form.replaceChildren(...body.childNodes);
      form.classList.remove("rm-subscribe-box");
      if (hadLabel === null) form.removeAttribute("aria-label");
      else form.setAttribute("aria-label", hadLabel);
    });
  }

  return () => cleanups.forEach((stop) => stop());
}
