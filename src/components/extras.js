/**
 * The rest of the page — pricing, proof, docs, tables and the furniture.
 *
 *   • pricingTable()  — plans side by side, with one of them recommended out loud.
 *   • planToggle()    — monthly or yearly, as a real radio group.
 *   • featureMatrix() — a comparison table you can follow across.
 *   • savingsBadge()  — "save 20%", said as well as shown.
 *   • quoteCard()     — a testimonial that is a real blockquote.
 *   • logoWall()      — the customer logos, arriving in a diagonal wave.
 *   • ratingRow()     — four and a bit stars out of five, exactly.
 *   • faqList()       — questions that open, and a filter that counts.
 *   • helpTip()       — a "why?" that stays open long enough to read.
 *   • shortcutSheet() — the keyboard shortcuts, on "?".
 *   • tourStep()      — a product tour that points at real elements.
 *   • checklistCard() — getting started, with honest progress.
 *   • welcomeCard()   — the first-run card, dismissed properly.
 *   • footerColumns() — footer links that fold up on a phone.
 *   • announcementRow() — a strip that rotates without resizing.
 *   • megaFooter()    — the big wordmark footer that moves as you reach it.
 *   • sortableTable() — click a header, and watch the rows move.
 *   • stickyHeaderTable() — a header that stays, and knows when it is stuck.
 *   • rowExpand()     — a table row with more underneath it.
 *   • tableEmpty()    — no results, without breaking the table.
 *   • codeBlock()     — code, with a copy button that says it copied.
 *   • diffView()      — added and removed lines, not only red and green.
 *   • apiRow()        — one endpoint in a reference, linkable and expandable.
 *   • uptimeDots()    — ninety days of status in one line.
 *   • changelogFeed() — dated entries down a rail that draws itself.
 *   • bentoGrid()     — tiles that arrive in order and step back for the one you want.
 *   • splitPanel()    — a divider you can drag, and also nudge with arrows.
 *   • stickyAside()   — a sidebar that sticks, and stops before the footer.
 *   • dividerMark()   — a rule that draws itself, and is a real separator.
 *   • sectionMark()   — a numbered label that knows which section you are in.
 *
 * This is the half of a product site that usually gets built twice: once
 * quickly, and then again a year later when somebody discovers the pricing
 * table is unreadable on a screen reader and the docs table cannot be sorted
 * without a mouse. So the discipline here is semantic before it is visual.
 * Every table stays a table, every disclosure is a button with `aria-expanded`
 * pointing at the thing it controls, every rating and every uptime strip
 * carries a sentence for anyone who cannot see the shape, and colour is never
 * the only carrier of meaning — an added line in a diff says "added" as well
 * as being green.
 *
 * Nothing in here animates a size. Where something appears to grow — a row
 * opening, a footer column unfolding, a sorted table rearranging itself — it is
 * either a `grid-template-rows: 0fr → 1fr` (which needs no measurement at all)
 * or a FLIP: measure, change, invert with a transform, play. The splitter is
 * the sharpest case: dragging it moves a ghost line by transform and commits
 * the real column widths once, on release, rather than reflowing two panes and
 * everything inside them sixty times a second.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import {
  clamp, dataNumber, dataString, EASE, mapRange, onFrame, prefersReducedMotion,
  resolveElements, watch, whileVisible,
} from "../core/motion.js";

/** A short unique id, for wiring `aria-controls` to something real. */
const uid = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

/** Text that exists for screen readers and takes up no room on the page. */
function saidOnly(text) {
  const span = document.createElement("span");
  span.className = "rm-extras-said";
  span.textContent = text;
  return span;
}

/**
 * Plans side by side, with one of them recommended out loud.
 *
 * The recommended plan is the whole point of a pricing table, and it is
 * normally marked by being bigger and a different colour — which says nothing
 * to anybody using the page without seeing it. Here it carries
 * `aria-current="true"` and a real word in its heading, and the visual lift is
 * a transform on the card so the grid rows never re-measure when it is applied.
 *
 * Cards arrive in a stagger when the section is reached, from a start state
 * written by this function rather than by the stylesheet: with the script
 * absent the prices are simply there, which is the one thing a pricing table
 * must never get wrong.
 *
 *   <div data-rm-pricing>
 *     <article data-rm-plan>…</article>
 *     <article data-rm-plan="recommended">…</article>
 *   </div>
 */
export function pricingTable(target = "[data-rm-pricing]", options = {}) {
  const tables = resolveElements(target);
  if (!tables.length) return () => {};

  const { stagger = 90, duration = 620, label = "Pricing plans" } = options;
  const cleanups = [];

  for (const table of tables) {
    table.classList.add("rm-pricing");
    table.setAttribute("role", "list");
    table.setAttribute("aria-label", dataString(table, "rmLabel", label));

    const cards = [...table.querySelectorAll("[data-rm-plan]")];
    const plans = cards.length ? cards : [...table.children];
    if (!plans.length) continue;

    const step = dataNumber(table, "rmDelay", stagger);
    const marks = [];

    plans.forEach((plan) => {
      plan.classList.add("rm-pricing-plan");
      plan.setAttribute("role", "listitem");

      // "recommended" is a claim about the plan, so it goes in the accessibility
      // tree, not only in the paint.
      if (plan.getAttribute("data-rm-plan") === "recommended") {
        plan.classList.add("is-recommended");
        plan.setAttribute("aria-current", "true");
        const said = saidOnly(" (recommended)");
        (plan.querySelector("h1, h2, h3, h4") ?? plan).appendChild(said);
        marks.push(said);
      }
    });

    if (prefersReducedMotion()) {
      cleanups.push(() => {
        marks.forEach((said) => said.remove());
        plans.forEach((plan) => {
          plan.classList.remove("rm-pricing-plan", "is-recommended");
          plan.removeAttribute("role");
          plan.removeAttribute("aria-current");
        });
        table.classList.remove("rm-pricing");
        table.removeAttribute("role");
        table.removeAttribute("aria-label");
      });
      continue;
    }

    plans.forEach((plan) => { plan.style.opacity = "0"; });

    const stop = watch(table, () => {
      plans.forEach((plan, i) => {
        plan.style.opacity = "";
        plan.animate(
          [{ opacity: 0, transform: "translateY(20px) scale(0.985)" }, { opacity: 1, transform: "none" }],
          { duration, delay: i * step, easing: EASE.out, fill: "backwards" },
        );
      });
    }, { threshold: 0.2, once: true });

    cleanups.push(() => {
      stop();
      marks.forEach((said) => said.remove());
      plans.forEach((plan) => {
        plan.style.opacity = "";
        plan.classList.remove("rm-pricing-plan", "is-recommended");
        plan.removeAttribute("aria-current");
        plan.removeAttribute("role");
      });
      table.classList.remove("rm-pricing");
      // The container was a plain grid before this ran. Leaving `role="list"`
      // behind would have it asserting a structure nothing else maintains.
      table.removeAttribute("role");
      table.removeAttribute("aria-label");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Monthly or yearly, as a real radio group.
 *
 * The usual version is two divs and a class, which means it cannot be reached
 * by keyboard and announces nothing. This is a `role="radiogroup"` with roving
 * tabindex: one Tab lands on the group, the arrow keys move between the two
 * choices, and `aria-checked` says which one is live. The travelling pill
 * behind them is measured and moved with `translateX` and `scaleX`, so the
 * buttons themselves never move and the row's width never changes.
 *
 * Prices swap by rewriting the text of anything marked `data-rm-price`, reading
 * the two figures off that element, so the page shows a real price before any
 * script runs.
 *
 *   <div data-rm-plan-toggle>
 *     <button type="button">Monthly</button><button type="button">Yearly</button>
 *   </div>
 *   <span data-rm-price data-rm-monthly="£12" data-rm-yearly="£120">£12</span>
 */
export function planToggle(target = "[data-rm-plan-toggle]", options = {}) {
  const groups = resolveElements(target);
  if (!groups.length) return () => {};

  const { label = "Billing period", duration = 340 } = options;
  const cleanups = [];

  for (const group of groups) {
    const choices = [...group.querySelectorAll("button")];
    if (choices.length < 2) continue;

    group.classList.add("rm-plan-toggle");
    group.setAttribute("role", "radiogroup");
    group.setAttribute("aria-label", dataString(group, "rmLabel", label));

    const pill = document.createElement("i");
    pill.className = "rm-plan-toggle-pill";
    pill.setAttribute("aria-hidden", "true");
    group.prepend(pill);

    // Scope the prices to the nearest section, so two toggles on one page do
    // not fight over each other's figures.
    const scope = group.closest("[data-rm-pricing], section, main") ?? document;
    const prices = [...scope.querySelectorAll("[data-rm-price]")];
    const original = prices.map((price) => price.textContent);

    let at = Math.max(0, choices.findIndex((choice) => choice.getAttribute("aria-checked") === "true"));

    const place = (animated) => {
      const box = group.getBoundingClientRect();
      const now = choices[at].getBoundingClientRect();
      if (!box.width || !now.width) return;
      // A 1px-wide pill scaled to the button's width: no layout, ever.
      const to = `translateX(${now.left - box.left}px) scaleX(${now.width})`;
      if (animated && !prefersReducedMotion()) {
        pill.animate([{ transform: pill.style.transform || to }, { transform: to }], {
          duration, easing: EASE.out,
        });
      }
      pill.style.transform = to;
      pill.style.height = `${now.height}px`;
    };

    const select = (next, moveFocus) => {
      at = (next + choices.length) % choices.length;
      choices.forEach((choice, i) => {
        choice.setAttribute("aria-checked", i === at ? "true" : "false");
        choice.tabIndex = i === at ? 0 : -1;
        choice.classList.toggle("is-on", i === at);
      });
      const key = at === 0 ? "monthly" : "yearly";
      prices.forEach((price) => {
        const value = price.getAttribute(`data-rm-${key}`);
        if (value !== null) price.textContent = value;
      });
      place(true);
      if (moveFocus) choices[at].focus();
    };

    choices.forEach((choice, i) => {
      choice.type = "button";
      choice.setAttribute("role", "radio");
      choice.classList.add("rm-plan-toggle-choice");
      choice.addEventListener("click", () => select(i, false));
    });

    const onKey = (event) => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
      if (!step) return;
      event.preventDefault();
      select(at + step, true);
    };
    group.addEventListener("keydown", onKey);

    select(at, false);
    place(false);

    // The pill is measured, so it has to be re-measured when the row reflows.
    const sizes = new ResizeObserver(() => place(false));
    sizes.observe(group);

    cleanups.push(() => {
      sizes.disconnect();
      group.removeEventListener("keydown", onKey);
      pill.remove();
      choices.forEach((choice) => {
        choice.removeAttribute("role");
        choice.removeAttribute("aria-checked");
        choice.tabIndex = 0;
        choice.classList.remove("rm-plan-toggle-choice", "is-on");
      });
      prices.forEach((price, i) => { price.textContent = original[i]; });
      group.removeAttribute("role");
      group.classList.remove("rm-plan-toggle");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A comparison table you can follow across.
 *
 * The failure mode of a feature matrix is losing your place: eleven columns of
 * ticks, and by the third row you no longer know which plan you are reading.
 * The fix is a column beam — one absolutely positioned bar, moved with
 * `translateX` and stretched with `scaleX` to the hovered or focused column, so
 * highlighting a column costs one transform rather than a class on ninety
 * cells.
 *
 * The ticks themselves get real words. `✓` is punctuation to a screen reader,
 * and a table of punctuation is not a comparison of anything, so every mark is
 * given "Included" or "Not included" and the glyph is hidden.
 *
 *   <table data-rm-feature-matrix>…</table>
 */
export function featureMatrix(target = "[data-rm-feature-matrix]", options = {}) {
  const tables = resolveElements(target);
  if (!tables.length) return () => {};

  const { yes = "Included", no = "Not included" } = options;
  const cleanups = [];

  for (const table of tables) {
    table.classList.add("rm-feature-matrix");

    const head = table.querySelector("thead tr");
    head?.querySelectorAll("th").forEach((cell) => {
      if (!cell.hasAttribute("scope")) cell.setAttribute("scope", "col");
    });
    // The first cell of every body row names the feature, which makes it a row
    // header, not a data cell. Screen readers use it to announce the row.
    const stubs = [...table.querySelectorAll("tbody tr > *:first-child")];
    stubs.forEach((cell) => {
      cell.classList.add("rm-feature-matrix-stub");
      if (cell.tagName === "TH" && !cell.hasAttribute("scope")) cell.setAttribute("scope", "row");
    });

    const marked = [];
    for (const cell of table.querySelectorAll("tbody td")) {
      const text = cell.textContent.trim();
      const isYes = text === "✓" || text === "✔" || text === "yes";
      const isNo = text === "—" || text === "-" || text === "×" || text === "no";
      if (!isYes && !isNo) continue;
      const glyph = document.createElement("span");
      glyph.className = `rm-feature-matrix-mark is-${isYes ? "yes" : "no"}`;
      glyph.setAttribute("aria-hidden", "true");
      glyph.textContent = isYes ? "✓" : "—";
      // Keep what the author wrote verbatim. The detector accepts six spellings
      // and the glyph only ever renders two of them, so rebuilding the cell
      // from the glyph on the way out would quietly rewrite a table authored
      // with "yes"/"no" into "✓"/"—". Cleanup has to give back what it took.
      marked.push({ cell, was: cell.innerHTML });
      cell.replaceChildren(glyph, saidOnly(isYes ? yes : no));
    }

    /*
     * The beam is absolutely positioned, so it needs a containing block that
     * coincides with the table. A sibling placed before the table has no such
     * thing: the nearest positioned ancestor is whatever the page happens to
     * provide, usually nothing, so the offsets measured against the table land
     * the bar somewhere near the top of the document. A shell the component
     * owns fixes the frame of reference and unwinds in one line.
     */
    const shell = document.createElement("div");
    shell.className = "rm-feature-matrix-shell";
    table.parentElement?.insertBefore(shell, table);
    shell.appendChild(table);

    const beam = document.createElement("div");
    beam.className = "rm-feature-matrix-beam";
    beam.setAttribute("aria-hidden", "true");
    shell.insertBefore(beam, table);

    const lightColumn = (cell) => {
      if (!cell || cell.cellIndex === undefined) { beam.style.opacity = "0"; return; }
      const box = table.getBoundingClientRect();
      const now = cell.getBoundingClientRect();
      beam.style.transform = `translateX(${now.left - box.left}px) scaleX(${now.width})`;
      beam.style.height = `${box.height}px`;
      beam.style.opacity = cell.cellIndex === 0 ? "0" : "1";
    };

    const onOver = (event) => lightColumn(event.target.closest("td, th"));
    const onOut = () => { beam.style.opacity = "0"; };
    table.addEventListener("pointerover", onOver);
    table.addEventListener("pointerleave", onOut);
    // Keyboard reading of a table moves focus through links and buttons inside
    // it; the beam should follow that too, not only the pointer.
    table.addEventListener("focusin", onOver);
    table.addEventListener("focusout", onOut);

    cleanups.push(() => {
      table.removeEventListener("pointerover", onOver);
      table.removeEventListener("pointerleave", onOut);
      table.removeEventListener("focusin", onOver);
      table.removeEventListener("focusout", onOut);
      beam.remove();
      shell.parentElement?.insertBefore(table, shell);
      shell.remove();
      marked.forEach(({ cell, was }) => { cell.innerHTML = was; });
      stubs.forEach((cell) => cell.classList.remove("rm-feature-matrix-stub"));
      table.classList.remove("rm-feature-matrix");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * "Save 20%", said as well as shown.
 *
 * It sits next to a plan toggle, so it changes at the moment the visitor
 * switches — which means it is news, and news that is only drawn is news half
 * the audience misses. It is a polite live region, and the pop is a scale on
 * the badge alone so the price beside it never shifts a pixel.
 *
 *   <span data-rm-savings="20" data-rm-unit="%">Save 20%</span>
 *   badge.rmSet(25);
 */
export function savingsBadge(target = "[data-rm-savings]", options = {}) {
  const badges = resolveElements(target);
  if (!badges.length) return () => {};

  const { prefix = "Save ", unit = "%", duration = 520 } = options;
  const cleanups = [];

  for (const badge of badges) {
    badge.classList.add("rm-savings");
    badge.setAttribute("role", "status");
    badge.setAttribute("aria-live", "polite");

    const suffix = dataString(badge, "rmUnit", unit);
    const lead = dataString(badge, "rmPrefix", prefix);
    const start = badge.textContent;
    const value = dataNumber(badge, "rmSavings", NaN);

    const write = (amount) => { badge.textContent = `${lead}${amount}${suffix}`; };
    if (Number.isFinite(value)) write(value);

    badge.rmSet = (amount) => {
      write(amount);
      if (prefersReducedMotion()) return;
      badge.animate(
        [{ transform: "scale(0.86)" }, { transform: "scale(1.06)" }, { transform: "none" }],
        { duration, easing: EASE.spring },
      );
    };

    badge.rmHide = (away) => {
      badge.classList.toggle("is-away", away === true);
      badge.setAttribute("aria-hidden", away === true ? "true" : "false");
    };

    cleanups.push(() => {
      delete badge.rmSet;
      delete badge.rmHide;
      badge.textContent = start;
      badge.removeAttribute("aria-hidden");
      badge.classList.remove("rm-savings", "is-away");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A testimonial that is a real blockquote.
 *
 * Quotation marks drawn as huge decorative glyphs are the standard here, and
 * they are also the standard way to have a screen reader read `"` out loud
 * before every testimonial on the page — so the mark is `aria-hidden` and the
 * structure underneath is a genuine `<blockquote>` with its attribution in a
 * `<cite>`, which is what makes the quote quotable.
 *
 * The reveal is a `clip-path` wipe rather than a fade, because a wipe reads as
 * a card being uncovered while a fade reads as a page still loading. The
 * attribution follows a beat later, which is the order you read it in anyway.
 *
 *   <figure data-rm-quote><blockquote>…</blockquote><figcaption>…</figcaption></figure>
 */
export function quoteCard(target = "[data-rm-quote]", options = {}) {
  const cards = resolveElements(target);
  if (!cards.length) return () => {};

  const { duration = 780, mark = "“" } = options;
  const cleanups = [];

  for (const card of cards) {
    card.classList.add("rm-quote");

    const glyph = document.createElement("span");
    glyph.className = "rm-quote-mark";
    glyph.setAttribute("aria-hidden", "true");
    glyph.textContent = dataString(card, "rmMark", mark);
    card.prepend(glyph);

    const body = card.querySelector("blockquote") ?? card.firstElementChild;
    const who = card.querySelector("figcaption, cite");
    body?.classList.add("rm-quote-body");
    who?.classList.add("rm-quote-who");

    if (prefersReducedMotion()) {
      cleanups.push(() => {
        glyph.remove();
        card.classList.remove("rm-quote");
      });
      continue;
    }

    card.style.opacity = "0";
    const stop = watch(card, () => {
      card.style.opacity = "";
      card.animate(
        [
          { clipPath: "inset(0 100% 0 0)", opacity: 0.4 },
          { clipPath: "inset(0 0 0 0)", opacity: 1 },
        ],
        { duration, easing: EASE.out },
      );
      who?.animate(
        [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }],
        { duration: 460, delay: duration * 0.45, easing: EASE.out, fill: "backwards" },
      );
    }, { threshold: 0.25, once: true });

    cleanups.push(() => {
      stop();
      glyph.remove();
      card.style.opacity = "";
      body?.classList.remove("rm-quote-body");
      who?.classList.remove("rm-quote-who");
      card.classList.remove("rm-quote");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * The customer logos, arriving in a diagonal wave.
 *
 * The delay for each logo is worked out from where it actually landed — its
 * measured x plus y — rather than from its index, so the wave still runs
 * diagonally when the grid wraps to two columns on a phone. An index-based
 * stagger looks correct on the desktop mock and turns into a meaningless
 * flicker on every other width.
 *
 * Logos rest muted and come up to full strength on hover *and* on focus, since
 * they are usually links and a link that only reacts to a pointer is a link
 * with no keyboard state at all.
 *
 *   <ul data-rm-logo-wall><li><img alt="Acme"></li></ul>
 */
export function logoWall(target = "[data-rm-logo-wall]", options = {}) {
  const walls = resolveElements(target);
  if (!walls.length) return () => {};

  const { duration = 620, speed = 0.55, label = "Customers" } = options;
  const cleanups = [];

  for (const wall of walls) {
    wall.classList.add("rm-logo-wall");
    wall.setAttribute("aria-label", dataString(wall, "rmLabel", label));

    const logos = [...wall.children];
    if (!logos.length) continue;
    logos.forEach((logo) => logo.classList.add("rm-logo-wall-item"));

    if (prefersReducedMotion()) {
      cleanups.push(() => {
        logos.forEach((logo) => logo.classList.remove("rm-logo-wall-item"));
        wall.classList.remove("rm-logo-wall");
        wall.removeAttribute("aria-label");
      });
      continue;
    }

    const pace = dataNumber(wall, "rmSpeed", speed);
    logos.forEach((logo) => { logo.style.opacity = "0"; });

    const stop = watch(wall, () => {
      const box = wall.getBoundingClientRect();
      for (const logo of logos) {
        const now = logo.getBoundingClientRect();
        // Distance along the diagonal from the top-left corner of the wall.
        const along = (now.left - box.left) + (now.top - box.top);
        logo.style.opacity = "";
        logo.animate(
          [{ opacity: 0, transform: "translateY(14px) scale(0.94)" }, { opacity: 1, transform: "none" }],
          { duration, delay: along * pace, easing: EASE.out, fill: "backwards" },
        );
      }
    }, { threshold: 0.2, once: true });

    cleanups.push(() => {
      stop();
      logos.forEach((logo) => {
        logo.style.opacity = "";
        logo.classList.remove("rm-logo-wall-item");
      });
      wall.classList.remove("rm-logo-wall");
      wall.removeAttribute("aria-label");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Four and a bit stars out of five, exactly.
 *
 * A rating of 4.3 rendered as four stars and a shrug is a rating rounded away.
 * Here the filled row sits over the empty row and is cut with a `clip-path`
 * inset, so any fraction draws precisely, and the whole thing is one
 * `role="img"` labelled "4.3 out of 5" — five separate star elements would be
 * read as five things rather than one score.
 *
 * This is deliberately not an input. Use `stars()` from data.js when the
 * visitor is the one doing the rating; use this when the number is a fact.
 *
 *   <span data-rm-rating-row data-rm-score="4.3">4.3</span>
 */
export function ratingRow(target = "[data-rm-rating-row]", options = {}) {
  const rows = resolveElements(target);
  if (!rows.length) return () => {};

  const { outOf = 5, score = 0, duration = 720 } = options;
  const STAR = "★";
  const cleanups = [];

  for (const row of rows) {
    const total = Math.max(1, Math.round(dataNumber(row, "rmOutOf", outOf)));
    const value = clamp(dataNumber(row, "rmScore", score), 0, total);
    const start = row.textContent;

    row.classList.add("rm-rating-row");
    row.setAttribute("role", "img");
    row.setAttribute("aria-label", `${value} out of ${total}`);

    const empty = document.createElement("span");
    empty.className = "rm-rating-row-empty";
    empty.setAttribute("aria-hidden", "true");
    empty.textContent = STAR.repeat(total);

    const full = document.createElement("span");
    full.className = "rm-rating-row-full";
    full.setAttribute("aria-hidden", "true");
    full.textContent = STAR.repeat(total);

    const number = document.createElement("span");
    number.className = "rm-rating-row-number";
    number.setAttribute("aria-hidden", "true");
    number.textContent = start.trim() || String(value);

    row.replaceChildren(empty, full, number);

    const cut = (fraction) => { full.style.clipPath = `inset(0 ${100 - fraction * 100}% 0 0)`; };
    const share = value / total;

    if (prefersReducedMotion()) cut(share);
    else {
      cut(0);
      cleanups.push(watch(row, () => {
        cut(share);
        full.animate(
          [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: `inset(0 ${100 - share * 100}% 0 0)` }],
          { duration, easing: EASE.out },
        );
      }, { threshold: 0.4, once: true }));
    }

    cleanups.push(() => {
      row.textContent = start;
      row.removeAttribute("role");
      row.removeAttribute("aria-label");
      row.classList.remove("rm-rating-row");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * Questions that open, and a filter that counts.
 *
 * Two things are usually wrong with an FAQ. The question is a `<div>` with a
 * click handler, so it cannot be reached or operated by keyboard; and the
 * answer's height is animated by writing measured pixels, which breaks the
 * moment the text reflows. Here the question keeps its heading — the button is
 * put *inside* the heading rather than replacing it, so the page outline
 * survives — and the answer opens with `grid-template-rows: 0fr → 1fr`, which
 * needs no measurement at all.
 *
 * The optional filter is why this is not just an accordion: it reports "3 of 12
 * questions" into a polite live region, because a search box that silently
 * removes rows tells a non-sighted visitor nothing about what happened.
 *
 *   <div data-rm-faq>
 *     <input data-rm-faq-filter type="search">
 *     <div><h3 data-rm-faq-q>Question</h3><div data-rm-faq-a>Answer</div></div>
 *   </div>
 */
export function faqList(target = "[data-rm-faq]", options = {}) {
  const lists = resolveElements(target);
  if (!lists.length) return () => {};

  const { single = true, duration = 320 } = options;
  const cleanups = [];

  for (const list of lists) {
    list.classList.add("rm-faq");
    const onlyOne = dataString(list, "rmSingle", single ? "true" : "false") !== "false";

    const filter = list.querySelector("[data-rm-faq-filter]");
    const items = [...list.children].filter((item) => item !== filter && item.children.length >= 2);
    if (!items.length) continue;

    const said = document.createElement("p");
    said.className = "rm-extras-said";
    said.setAttribute("aria-live", "polite");
    list.appendChild(said);

    const wired = [];
    for (const item of items) {
      const question = item.querySelector("[data-rm-faq-q]") ?? item.firstElementChild;
      const answer = item.querySelector("[data-rm-faq-a]") ?? item.lastElementChild;
      if (!question || !answer || question === answer) continue;

      item.classList.add("rm-faq-item");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "rm-faq-q";
      button.setAttribute("aria-expanded", "false");
      if (!answer.id) answer.id = uid("rm-faq-a");
      button.setAttribute("aria-controls", answer.id);
      // Move the heading's own children into the button so the heading stays a
      // heading and the operable thing is a button, as the pattern requires.
      button.append(...question.childNodes);
      question.appendChild(button);

      const shell = document.createElement("div");
      shell.className = "rm-faq-a";
      answer.parentElement.insertBefore(shell, answer);
      shell.appendChild(answer);
      answer.classList.add("rm-faq-a-inner");

      const set = (open) => {
        button.setAttribute("aria-expanded", open ? "true" : "false");
        item.classList.toggle("is-open", open);
      };
      const onClick = () => {
        const open = button.getAttribute("aria-expanded") !== "true";
        if (open && onlyOne) wired.forEach((other) => other.set(false));
        set(open);
      };
      button.addEventListener("click", onClick);
      wired.push({ item, question, button, shell, answer, set });
    }

    list.style.setProperty("--rm-faq-duration", `${prefersReducedMotion() ? 0 : duration}ms`);

    let onFilter = null;
    if (filter) {
      onFilter = () => {
        const needle = filter.value.trim().toLowerCase();
        let shown = 0;
        for (const entry of wired) {
          const hit = !needle || entry.item.textContent.toLowerCase().includes(needle);
          entry.item.hidden = !hit;
          if (hit) shown += 1;
        }
        said.textContent = needle
          ? `${shown} of ${wired.length} questions match ${filter.value.trim()}`
          : `${wired.length} questions`;
      };
      filter.addEventListener("input", onFilter);
    }

    cleanups.push(() => {
      if (filter && onFilter) filter.removeEventListener("input", onFilter);
      said.remove();
      for (const entry of wired) {
        entry.question.append(...entry.button.childNodes);
        entry.button.remove();
        entry.shell.parentElement?.insertBefore(entry.answer, entry.shell);
        entry.shell.remove();
        entry.answer.classList.remove("rm-faq-a-inner");
        entry.item.hidden = false;
        entry.item.classList.remove("rm-faq-item", "is-open");
      }
      list.classList.remove("rm-faq");
      list.style.removeProperty("--rm-faq-duration");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A "why?" that stays open long enough to read.
 *
 * A tooltip that closes when the pointer leaves the trigger is unusable for
 * anything longer than three words and impossible on a touch screen, so this is
 * a disclosure rather than a tooltip: a real button with `aria-expanded`
 * pointing at the bubble, opened by click or Enter, closed by Escape or by a
 * click outside, and left open while you read it.
 *
 * The bubble is measured after it opens and flipped with a transform if it
 * would otherwise run off the side of the window. Position is decided from real
 * geometry rather than from a guess about which edge of the screen the
 * component is near.
 *
 *   <span data-rm-help-tip="Prices exclude VAT.">Total</span>
 */
export function helpTip(target = "[data-rm-help-tip]", options = {}) {
  const tips = resolveElements(target);
  if (!tips.length) return () => {};

  const { label = "More information", glyph = "?" } = options;
  const cleanups = [];

  for (const tip of tips) {
    tip.classList.add("rm-help-tip");

    const button = document.createElement("button");
    button.type = "button";
    button.className = "rm-help-tip-button";
    button.textContent = glyph;
    button.setAttribute("aria-label", dataString(tip, "rmLabel", label));
    button.setAttribute("aria-expanded", "false");

    const bubble = document.createElement("div");
    bubble.className = "rm-help-tip-bubble";
    bubble.id = uid("rm-help");
    bubble.textContent = dataString(tip, "rmHelpTip", "");
    bubble.hidden = true;
    button.setAttribute("aria-controls", bubble.id);

    tip.append(button, bubble);

    const close = () => {
      if (bubble.hidden) return;
      bubble.hidden = true;
      button.setAttribute("aria-expanded", "false");
    };

    const open = () => {
      bubble.hidden = false;
      button.setAttribute("aria-expanded", "true");
      bubble.style.transform = "";
      // Measure once it is in the layout, then push it back inside the window.
      const now = bubble.getBoundingClientRect();
      const overflowRight = now.right - (window.innerWidth - 12);
      const overflowLeft = 12 - now.left;
      const shift = overflowRight > 0 ? -overflowRight : (overflowLeft > 0 ? overflowLeft : 0);
      bubble.style.transform = `translateX(${shift}px)`;
      if (prefersReducedMotion()) return;
      bubble.animate(
        [
          { opacity: 0, transform: `translateX(${shift}px) translateY(-6px) scale(0.97)` },
          { opacity: 1, transform: `translateX(${shift}px)` },
        ],
        { duration: 220, easing: EASE.out },
      );
    };

    const onClick = () => { if (bubble.hidden) open(); else close(); };
    const onKey = (event) => {
      if (event.key === "Escape" && !bubble.hidden) { event.stopPropagation(); close(); button.focus(); }
    };
    const onOutside = (event) => { if (!tip.contains(event.target)) close(); };

    button.addEventListener("click", onClick);
    tip.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onOutside);

    cleanups.push(() => {
      button.removeEventListener("click", onClick);
      tip.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onOutside);
      button.remove();
      bubble.remove();
      tip.classList.remove("rm-help-tip");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * The keyboard shortcuts, on "?".
 *
 * Every product that has shortcuts needs this sheet, and the sheet itself is
 * usually the least accessible thing in the product: a div that appears, traps
 * nothing, and cannot be closed without the mouse. This is a real
 * `role="dialog"` with `aria-modal`, the rest of the page made `inert` while it
 * is up, Tab cycling inside it, Escape closing it and focus returned to
 * whatever was focused before.
 *
 * It also refuses to open while you are typing. A shortcut sheet that appears
 * every time somebody types a question mark into a search field is a bug with a
 * keyboard hint attached.
 *
 *   <div data-rm-shortcuts hidden><dl><dt>Search</dt><dd>/</dd></dl></div>
 */
export function shortcutSheet(target = "[data-rm-shortcuts]", options = {}) {
  const sheets = resolveElements(target);
  if (!sheets.length) return () => {};

  const { key = "?", label = "Keyboard shortcuts" } = options;
  const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';
  const cleanups = [];

  for (const sheet of sheets) {
    sheet.classList.add("rm-shortcuts");
    sheet.setAttribute("role", "dialog");
    sheet.setAttribute("aria-modal", "true");
    sheet.setAttribute("aria-label", dataString(sheet, "rmLabel", label));
    // The documented markup ships `hidden`, so unhiding blindly on the way out
    // would leave a fixed, centred dialog parked over the page. Remember what
    // the author wrote and put that back instead.
    const wasHidden = sheet.hidden;
    sheet.hidden = true;

    // Shortcut keys read as `<kbd>`, which is both correct and the reason they
    // can be styled as keys without a class on every one of them.
    const keyed = [];
    for (const dd of sheet.querySelectorAll("dd")) {
      if (dd.querySelector("kbd")) continue;
      const kbd = document.createElement("kbd");
      kbd.append(...dd.childNodes);
      dd.appendChild(kbd);
      keyed.push(dd);
    }

    const shut = document.createElement("button");
    shut.type = "button";
    shut.className = "rm-shortcuts-close";
    shut.setAttribute("aria-label", "Close shortcuts");
    shut.textContent = "×";
    sheet.appendChild(shut);

    let opener = null;
    let sealed = [];
    const wanted = dataString(sheet, "rmKey", key);

    const close = () => {
      if (sheet.hidden) return;
      sheet.hidden = true;
      sealed.forEach((node) => { node.inert = false; });
      sealed = [];
      opener?.focus?.();
      opener = null;
    };

    const open = () => {
      if (!sheet.hidden) return;
      opener = document.activeElement;
      sheet.hidden = false;
      sealed = [...document.body.children].filter((node) => node !== sheet && !node.contains(sheet));
      sealed.forEach((node) => { node.inert = true; });
      (sheet.querySelector(FOCUSABLE) ?? shut).focus();
      if (prefersReducedMotion()) return;
      sheet.animate(
        [{ opacity: 0, transform: "scale(0.97) translateY(10px)" }, { opacity: 1, transform: "none" }],
        { duration: 300, easing: EASE.out },
      );
    };

    const typing = (node) =>
      node instanceof HTMLElement &&
      (node.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(node.tagName));

    const onKey = (event) => {
      if (event.key === "Escape" && !sheet.hidden) { event.preventDefault(); close(); return; }
      if (event.key === wanted && sheet.hidden && !typing(document.activeElement) && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        open();
        return;
      }
      if (event.key !== "Tab" || sheet.hidden) return;
      const stops = [...sheet.querySelectorAll(FOCUSABLE)].filter((node) => node.offsetParent !== null);
      if (!stops.length) return;
      const first = stops[0];
      const last = stops[stops.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };

    shut.addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    sheet.rmOpen = open;
    sheet.rmClose = close;

    cleanups.push(() => {
      document.removeEventListener("keydown", onKey);
      sealed.forEach((node) => { node.inert = false; });
      shut.remove();
      keyed.forEach((dd) => {
        const kbd = dd.querySelector("kbd");
        if (kbd) { dd.append(...kbd.childNodes); kbd.remove(); }
      });
      delete sheet.rmOpen;
      delete sheet.rmClose;
      sheet.hidden = wasHidden;
      sheet.removeAttribute("role");
      sheet.removeAttribute("aria-modal");
      sheet.classList.remove("rm-shortcuts");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A product tour that points at real elements.
 *
 * The hole in the dimming layer is a `clip-path` cut around the anchor's
 * measured box rather than a resized element, which matters because the anchor
 * can move: a sticky header settles, an image finishes loading, the visitor
 * scrolls. The cut-out is refreshed on the shared frame loop while the tour is
 * up, so it never drifts off the thing it is describing.
 *
 * The panel is a `role="dialog"` with a live step count ("Step 2 of 4"),
 * Escape ends the tour, and focus is returned to whatever opened it. A tour
 * that hijacks focus and cannot be escaped is a modal with a nicer name.
 *
 *   <div data-rm-tour hidden>
 *     <div data-rm-tour-step data-rm-anchor="#save">Save your work here.</div>
 *   </div>
 */
export function tourStep(target = "[data-rm-tour]", options = {}) {
  const tours = resolveElements(target);
  if (!tours.length) return () => {};

  const { pad = 8, label = "Product tour" } = options;
  const cleanups = [];

  for (const tour of tours) {
    const steps = [...tour.querySelectorAll("[data-rm-tour-step]")];
    if (!steps.length) continue;

    tour.classList.add("rm-tour");
    tour.setAttribute("role", "dialog");
    tour.setAttribute("aria-modal", "false");
    tour.setAttribute("aria-label", dataString(tour, "rmLabel", label));
    // Same reasoning as the shortcut sheet: the documented markup ships
    // `hidden`, and a tour veil restored to visible would cover the page.
    const wasHidden = tour.hidden;
    tour.hidden = true;

    const veil = document.createElement("div");
    veil.className = "rm-tour-veil";
    veil.setAttribute("aria-hidden", "true");

    const panel = document.createElement("div");
    panel.className = "rm-tour-panel";

    const count = document.createElement("p");
    count.className = "rm-tour-count";
    count.setAttribute("aria-live", "polite");

    const body = document.createElement("div");
    body.className = "rm-tour-body";

    const row = document.createElement("div");
    row.className = "rm-tour-row";
    const back = document.createElement("button");
    back.type = "button";
    back.className = "rm-tour-back";
    back.textContent = "Back";
    const next = document.createElement("button");
    next.type = "button";
    next.className = "rm-tour-next";
    next.textContent = "Next";
    const end = document.createElement("button");
    end.type = "button";
    end.className = "rm-tour-end";
    end.textContent = "End tour";
    row.append(back, next, end);

    panel.append(count, body, row);
    tour.append(veil, panel);
    steps.forEach((step) => { step.hidden = true; });

    let at = 0;
    let opener = null;
    let anchor = null;
    const room = dataNumber(tour, "rmPad", pad);

    /*
     * The anchor is resolved once per step and cached, for two reasons. A
     * selector typed by hand into an attribute can be malformed — `#2col`, a
     * stray comma — and `querySelector` throws a SyntaxError on those. `draw`
     * runs as a task on the shared frame loop, and a throw inside that loop
     * stops every other component's per-frame work on the page, permanently,
     * because the loop only re-schedules itself after the tasks have run. The
     * second reason is plainer: the anchor does not change between steps, so
     * querying the document sixty times a second for it is work for nothing.
     */
    const findAnchor = (step) => {
      const selector = step.getAttribute("data-rm-anchor");
      if (!selector) return null;
      try {
        return document.querySelector(selector);
      } catch {
        return null;
      }
    };

    const draw = () => {
      if (!anchor) { veil.style.clipPath = ""; return; }
      const box = anchor.getBoundingClientRect();
      const left = box.left - room;
      const top = box.top - room;
      const right = box.right + room;
      const bottom = box.bottom + room;
      // An outer rectangle with an inner one cut from it, wound the other way:
      // the even-odd shape that gives a hole without a second element.
      veil.style.clipPath =
        `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${left}px ${top}px, ` +
        `${left}px ${bottom}px, ${right}px ${bottom}px, ${right}px ${top}px, ${left}px ${top}px)`;
      // The panel travels by transform, so it never reflows the page it covers.
      const x = clamp(box.left, 12, Math.max(12, window.innerWidth - panel.offsetWidth - 12));
      const below = bottom + 12;
      const y = below + panel.offsetHeight > window.innerHeight ? Math.max(12, top - panel.offsetHeight - 12) : below;
      panel.style.transform = `translate(${x}px, ${y}px)`;
    };

    const show = () => {
      anchor = findAnchor(steps[at]);
      count.textContent = `Step ${at + 1} of ${steps.length}`;
      body.replaceChildren(...steps.map((step, i) => {
        const copy = step.cloneNode(true);
        copy.hidden = i !== at;
        return copy;
      }));
      back.disabled = at === 0;
      next.textContent = at === steps.length - 1 ? "Finish" : "Next";
      draw();
    };

    const close = () => {
      if (tour.hidden) return;
      tour.hidden = true;
      opener?.focus?.();
      opener = null;
    };

    tour.rmStart = (from = 0) => {
      opener = document.activeElement;
      at = clamp(from, 0, steps.length - 1);
      tour.hidden = false;
      show();
      next.focus();
    };

    const go = (delta) => {
      if (at + delta >= steps.length) { close(); return; }
      at = clamp(at + delta, 0, steps.length - 1);
      show();
    };

    const onNext = () => go(1);
    const onBack = () => go(-1);
    const onKey = (event) => { if (event.key === "Escape" && !tour.hidden) { event.preventDefault(); close(); } };

    next.addEventListener("click", onNext);
    back.addEventListener("click", onBack);
    end.addEventListener("click", close);
    document.addEventListener("keydown", onKey);

    // Only while the tour is actually on screen: a hidden panel does not
    // intersect, so this loop is dead the moment the tour is closed.
    const stopFrames = whileVisible(panel, () => onFrame(draw));

    cleanups.push(() => {
      stopFrames();
      document.removeEventListener("keydown", onKey);
      next.removeEventListener("click", onNext);
      back.removeEventListener("click", onBack);
      end.removeEventListener("click", close);
      veil.remove();
      panel.remove();
      steps.forEach((step) => { step.hidden = false; });
      delete tour.rmStart;
      tour.hidden = wasHidden;
      tour.removeAttribute("role");
      tour.removeAttribute("aria-modal");
      tour.removeAttribute("aria-label");
      tour.classList.remove("rm-tour");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Getting started, with honest progress.
 *
 * The bar is a `role="progressbar"` carrying `aria-valuenow`, and it fills by
 * `scaleX` on a full-width layer rather than by animating a width — a width
 * transition on a bar inside a card is a reflow of the card on every frame of
 * it. The tick draws itself with `stroke-dashoffset`, which is the one way to
 * draw a check mark that still looks drawn at any size.
 *
 * Each item states "done" or "to do" in text. A list where completion is
 * carried by a green circle is a list that reads identically at 0% and 100% to
 * anyone using it without sight.
 *
 *   <ul data-rm-checklist>
 *     <li data-rm-done>Create an account</li><li>Invite your team</li>
 *   </ul>
 */
export function checklistCard(target = "[data-rm-checklist]", options = {}) {
  const cards = resolveElements(target);
  if (!cards.length) return () => {};

  const { label = "Getting started", duration = 520 } = options;
  const cleanups = [];

  for (const card of cards) {
    const items = [...card.children];
    if (!items.length) continue;

    card.classList.add("rm-checklist");
    card.setAttribute("role", "list");
    card.setAttribute("aria-label", dataString(card, "rmLabel", label));

    const bar = document.createElement("div");
    bar.className = "rm-checklist-bar";
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", "100");
    bar.setAttribute("aria-label", `${dataString(card, "rmLabel", label)} progress`);
    const fill = document.createElement("i");
    fill.setAttribute("aria-hidden", "true");
    bar.appendChild(fill);
    // Outside the list, not prepended into it. A `<ul>` may contain only `<li>`
    // and script-supporting elements, and `role="list"` expects every child to
    // be a `listitem`; a stray progressbar child makes the item count and the
    // structure undefined for anyone reading it with assistive technology.
    card.parentElement?.insertBefore(bar, card);

    // The fill's travel time is a CSS transition, so the duration option has to
    // reach CSS. A custom property is how faqList and rowExpand do the same
    // job. It goes on the bar rather than the list because the bar now sits
    // outside the list and would not inherit anything set there.
    bar.style.setProperty("--rm-checklist-duration", `${prefersReducedMotion() ? 0 : duration}ms`);

    const wired = items.map((item) => {
      item.classList.add("rm-checklist-item");
      item.setAttribute("role", "listitem");
      const box = document.createElement("span");
      box.className = "rm-checklist-box";
      box.setAttribute("aria-hidden", "true");
      box.innerHTML =
        '<svg viewBox="0 0 24 24"><path d="M5 12.5 10 17.5 19 7" fill="none" stroke="currentColor" ' +
        'stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      const said = saidOnly("");
      item.prepend(box);
      item.appendChild(said);
      return { item, box, said, path: box.querySelector("path") };
    });

    const paint = () => {
      let done = 0;
      for (const entry of wired) {
        const on = entry.item.hasAttribute("data-rm-done");
        if (on) done += 1;
        entry.item.classList.toggle("is-done", on);
        entry.said.textContent = on ? " — done" : " — to do";
        if (entry.path) {
          entry.path.style.strokeDasharray = "24";
          entry.path.style.strokeDashoffset = on ? "0" : "24";
        }
      }
      const share = done / wired.length;
      fill.style.transform = `scaleX(${share})`;
      bar.setAttribute("aria-valuenow", String(Math.round(share * 100)));
      bar.setAttribute("aria-valuetext", `${done} of ${wired.length} complete`);
    };

    card.rmTick = (index, done = true) => {
      const entry = wired[index];
      if (!entry) return;
      if (done) entry.item.setAttribute("data-rm-done", "");
      else entry.item.removeAttribute("data-rm-done");
      paint();
      if (done && !prefersReducedMotion()) {
        entry.box.animate(
          [{ transform: "scale(0.7)" }, { transform: "scale(1.12)" }, { transform: "none" }],
          { duration: 460, easing: EASE.spring },
        );
      }
    };

    paint();

    cleanups.push(() => {
      delete card.rmTick;
      bar.remove();
      wired.forEach(({ item, box, said }) => {
        box.remove();
        said.remove();
        item.removeAttribute("role");
        item.classList.remove("rm-checklist-item", "is-done");
      });
      card.removeAttribute("role");
      card.classList.remove("rm-checklist");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * The first-run card, dismissed properly.
 *
 * Its contents arrive in a stagger on a spring, from a start state written here
 * rather than in the stylesheet — so if the script never runs, the welcome is
 * simply visible instead of being an invisible block a new visitor cannot find.
 *
 * Dismissing it is the part that is normally wrong. The card is often the thing
 * holding focus when it goes, which drops the visitor at the top of the
 * document; this one puts focus back on whatever preceded it, or on the next
 * heading, so the keyboard does not lose its place.
 *
 *   <section data-rm-welcome><h2>Welcome</h2><p>…</p></section>
 */
export function welcomeCard(target = "[data-rm-welcome]", options = {}) {
  const cards = resolveElements(target);
  if (!cards.length) return () => {};

  const { stagger = 90, duration = 720, dismissible = true } = options;
  const cleanups = [];

  for (const card of cards) {
    card.classList.add("rm-welcome");
    card.setAttribute("role", "region");
    card.setAttribute("aria-label", dataString(card, "rmLabel", "Welcome"));

    const parts = [...card.children];
    let shut = null;

    if (dismissible) {
      shut = document.createElement("button");
      shut.type = "button";
      shut.className = "rm-welcome-close";
      shut.setAttribute("aria-label", "Dismiss the welcome message");
      shut.textContent = "×";
      card.appendChild(shut);
    }

    card.rmDismiss = () => {
      // Hand focus on before hiding: focus inside a hidden element is lost focus.
      const after = card.nextElementSibling?.querySelector?.("h1, h2, h3, a, button") ?? document.body;
      const done = () => {
        card.hidden = true;
        if (after instanceof HTMLElement && after !== document.body) after.focus?.();
      };
      if (prefersReducedMotion()) { done(); return; }
      card.animate(
        [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-10px) scale(0.985)" }],
        { duration: 280, easing: EASE.inOut, fill: "forwards" },
      ).finished.then(done, done);
    };
    shut?.addEventListener("click", card.rmDismiss);

    if (!prefersReducedMotion()) {
      const step = dataNumber(card, "rmDelay", stagger);
      parts.forEach((part) => { part.style.opacity = "0"; });
      parts.forEach((part, i) => {
        part.style.opacity = "";
        part.animate(
          [{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "none" }],
          { duration, delay: i * step, easing: EASE.spring, fill: "backwards" },
        );
      });
    }

    cleanups.push(() => {
      shut?.remove();
      delete card.rmDismiss;
      parts.forEach((part) => { part.style.opacity = ""; });
      card.hidden = false;
      card.removeAttribute("role");
      card.classList.remove("rm-welcome");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Footer links that fold up on a phone.
 *
 * The trap here is building two footers — a wide one and a stack of
 * accordions — and shipping both, so a screen reader meets every link twice.
 * This is one footer that changes behaviour: below the breakpoint each column
 * heading becomes a real button with `aria-expanded`; above it the button is
 * unwound and the headings are headings again, with every column open and no
 * `aria-expanded` left lying about claiming something is collapsed when it is
 * not.
 *
 * The fold is `grid-template-rows: 0fr → 1fr`, so nothing is measured and a
 * column with eleven links opens exactly as smoothly as one with three.
 *
 *   <div data-rm-footer-columns>
 *     <div><h3>Product</h3><ul>…</ul></div>
 *   </div>
 */
export function footerColumns(target = "[data-rm-footer-columns]", options = {}) {
  const footers = resolveElements(target);
  if (!footers.length) return () => {};

  const { breakpoint = 720, duration = 300 } = options;
  const cleanups = [];

  for (const footer of footers) {
    const columns = [...footer.children].filter((column) => column.children.length >= 2);
    if (!columns.length) continue;

    footer.classList.add("rm-footer-columns");
    footer.style.setProperty("--rm-footer-columns-duration", `${prefersReducedMotion() ? 0 : duration}ms`);

    const wired = columns.map((column) => {
      column.classList.add("rm-footer-columns-col");
      const heading = column.firstElementChild;
      const list = column.lastElementChild;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "rm-footer-columns-head";
      button.append(...heading.childNodes);
      heading.appendChild(button);

      const shell = document.createElement("div");
      shell.className = "rm-footer-columns-shell";
      column.insertBefore(shell, list);
      shell.appendChild(list);
      if (!list.id) list.id = uid("rm-footer-col");
      button.setAttribute("aria-controls", list.id);

      const onClick = () => {
        const open = button.getAttribute("aria-expanded") !== "true";
        button.setAttribute("aria-expanded", open ? "true" : "false");
        column.classList.toggle("is-open", open);
      };
      button.addEventListener("click", onClick);
      return { column, heading, button, shell, list, onClick };
    });

    const narrow = matchMedia(`(max-width: ${dataNumber(footer, "rmBreakpoint", breakpoint)}px)`);
    const sync = () => {
      footer.classList.toggle("is-folded", narrow.matches);
      for (const entry of wired) {
        if (narrow.matches) {
          entry.button.setAttribute("aria-expanded", entry.column.classList.contains("is-open") ? "true" : "false");
          entry.button.disabled = false;
        } else {
          // Wide: nothing is collapsed, so nothing may claim to be.
          entry.button.removeAttribute("aria-expanded");
          entry.button.disabled = true;
          entry.column.classList.remove("is-open");
        }
      }
    };
    sync();
    narrow.addEventListener("change", sync);

    cleanups.push(() => {
      narrow.removeEventListener("change", sync);
      for (const entry of wired) {
        entry.button.removeEventListener("click", entry.onClick);
        entry.heading.append(...entry.button.childNodes);
        entry.button.remove();
        entry.shell.parentElement?.insertBefore(entry.list, entry.shell);
        entry.shell.remove();
        entry.column.classList.remove("rm-footer-columns-col", "is-open");
      }
      footer.classList.remove("rm-footer-columns", "is-folded");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A strip that rotates without resizing.
 *
 * Every message is stacked in the same grid cell and swapped with
 * `visibility`, so the strip is as tall as its tallest message from the first
 * frame and rotating never nudges the page down. The naive version swaps the
 * text node, which means the header changes height when a longer sentence
 * comes round and everything below it jumps. Hiding the others with `hidden`
 * is the same mistake wearing a hat: `display: none` takes a child out of the
 * grid's track sizing, so the cell shrinks back to whichever message happens
 * to be showing.
 *
 * It rotates only while it is on screen and the tab is in front, pauses on
 * hover and on focus so a link inside it can actually be clicked, and announces
 * politely — an announcement bar is news, not an emergency.
 *
 *   <div data-rm-announcement>
 *     <p>Free shipping this week</p><p>New: dark mode</p>
 *   </div>
 */
export function announcementRow(target = "[data-rm-announcement]", options = {}) {
  const rows = resolveElements(target);
  if (!rows.length) return () => {};

  const { interval = 5200, duration = 420, label = "Announcements" } = options;
  const cleanups = [];

  for (const row of rows) {
    const messages = [...row.children];
    if (!messages.length) continue;

    row.classList.add("rm-announcement");
    row.setAttribute("role", "region");
    row.setAttribute("aria-live", "polite");
    row.setAttribute("aria-label", dataString(row, "rmLabel", label));

    /*
     * `hidden` would undo the whole point of this component. It computes to
     * `display: none`, and a `display: none` grid child contributes nothing to
     * the track it sits in — so the strip would be exactly as tall as the one
     * message currently showing, and rotating to a longer sentence would push
     * the document down, which is the failure this is here to avoid. Worse, it
     * would move twice per rotation, because the arriving message is revealed
     * before the leaving one goes.
     *
     * `visibility` still sizes the track, so every message contributes its
     * height from the first frame. It also takes the hidden ones out of the
     * accessibility tree; `aria-hidden` alongside it makes that explicit, so
     * the live region announces exactly one sentence.
     */
    const conceal = (message) => {
      message.style.visibility = "hidden";
      message.setAttribute("aria-hidden", "true");
    };
    const reveal = (message) => {
      message.style.visibility = "visible";
      message.removeAttribute("aria-hidden");
    };

    messages.forEach((message, i) => {
      message.classList.add("rm-announcement-message");
      if (i === 0) reveal(message); else conceal(message);
    });

    let at = 0;
    let paused = false;

    const go = () => {
      if (paused || messages.length < 2) return;
      const leaving = messages[at];
      at = (at + 1) % messages.length;
      const arriving = messages[at];
      // Its own exit, from the last time round, was filled forwards. Clear it
      // or the entrance below finishes and the message drops back to opacity 0.
      arriving.getAnimations().forEach((animation) => animation.cancel());
      reveal(arriving);
      leaving.setAttribute("aria-hidden", "true");
      const settle = () => { leaving.style.visibility = "hidden"; };
      if (prefersReducedMotion()) { settle(); return; }
      leaving.animate(
        [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-60%)" }],
        { duration, easing: EASE.inOut, fill: "forwards" },
      ).finished.then(settle, settle);
      arriving.animate(
        [{ opacity: 0, transform: "translateY(60%)" }, { opacity: 1, transform: "none" }],
        { duration, easing: EASE.out },
      );
    };

    const hold = () => { paused = true; };
    const release = () => { paused = false; };
    row.addEventListener("pointerenter", hold);
    row.addEventListener("pointerleave", release);
    row.addEventListener("focusin", hold);
    row.addEventListener("focusout", release);

    const every = dataNumber(row, "rmInterval", interval);
    const stopTimer = whileVisible(row, () => {
      const timer = setInterval(go, every);
      return () => clearInterval(timer);
    });

    cleanups.push(() => {
      stopTimer();
      row.removeEventListener("pointerenter", hold);
      row.removeEventListener("pointerleave", release);
      row.removeEventListener("focusin", hold);
      row.removeEventListener("focusout", release);
      messages.forEach((message) => {
        message.getAnimations().forEach((animation) => animation.cancel());
        message.style.removeProperty("visibility");
        message.removeAttribute("aria-hidden");
        message.classList.remove("rm-announcement-message");
      });
      row.removeAttribute("role");
      row.classList.remove("rm-announcement");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * The big wordmark footer that moves as you reach it.
 *
 * The oversized name rises and settles as the footer comes into view, driven by
 * the footer's own position in the viewport on the shared frame loop rather
 * than by a scroll listener — one rAF for the whole page, and the work stops
 * entirely once the footer is behind you.
 *
 * The wordmark is `aria-hidden` and the real site name stays in a heading
 * above it. A three-hundred-pixel logotype is decoration; repeating the
 * company's name to a screen reader at the end of every page is noise.
 *
 *   <footer data-rm-mega-footer data-rm-word="SoyRage">…</footer>
 */
export function megaFooter(target = "[data-rm-mega-footer]", options = {}) {
  const footers = resolveElements(target);
  if (!footers.length) return () => {};

  const { travel = 70, word = "" } = options;
  const cleanups = [];

  for (const footer of footers) {
    footer.classList.add("rm-mega-footer");

    const text = dataString(footer, "rmWord", word);
    let mark = footer.querySelector("[data-rm-mega-footer-word]");
    let made = null;
    if (!mark && text) {
      made = document.createElement("div");
      made.className = "rm-mega-footer-word";
      made.textContent = text;
      footer.appendChild(made);
      mark = made;
    }
    if (!mark) continue;
    mark.classList.add("rm-mega-footer-word");
    mark.setAttribute("aria-hidden", "true");

    if (prefersReducedMotion()) {
      cleanups.push(() => {
        made?.remove();
        mark.classList.remove("rm-mega-footer-word");
        footer.classList.remove("rm-mega-footer");
      });
      continue;
    }

    const far = dataNumber(footer, "rmTravel", travel);
    const stop = whileVisible(footer, () => onFrame(() => {
      const box = footer.getBoundingClientRect();
      // 0 when the footer's top first touches the bottom of the window, 1 once
      // its top has climbed to the middle of it.
      const shown = mapRange(box.top, window.innerHeight, window.innerHeight * 0.4, 0, 1);
      mark.style.transform = `translateY(${(1 - shown) * far}px)`;
      mark.style.opacity = String(clamp(shown, 0, 1));
    }));

    cleanups.push(() => {
      stop();
      mark.style.transform = "";
      mark.style.opacity = "";
      made?.remove();
      mark.classList.remove("rm-mega-footer-word");
      footer.classList.remove("rm-mega-footer");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Click a header, and watch the rows move.
 *
 * Sorting is the moment a table stops being trustworthy: the rows change
 * instantly and you cannot tell whether your row moved or vanished. So this
 * FLIPs — every row's position is measured, the DOM is reordered, and each row
 * is animated from where it used to be to where it now is. Nothing changes
 * size; only `translateY` runs.
 *
 * The header is a real `<button>` inside the `<th>` (a `th` with a click
 * handler is not operable by keyboard) and the `th` carries `aria-sort`, which
 * is the attribute assistive technology actually reads to say "sorted
 * ascending". The comparison type comes from `data-rm-sort` on the header, and
 * an unrecognised value falls back to comparing as text.
 *
 *   <table data-rm-sortable>
 *     <thead><tr><th data-rm-sort="text">Name</th><th data-rm-sort="number">MRR</th></tr></thead>
 *   </table>
 */
export function sortableTable(target = "[data-rm-sortable]", options = {}) {
  const tables = resolveElements(target);
  if (!tables.length) return () => {};

  const { duration = 420 } = options;
  const KINDS = ["text", "number", "date"];
  const cleanups = [];

  for (const table of tables) {
    const head = table.querySelector("thead tr");
    const body = table.querySelector("tbody");
    if (!head || !body) continue;

    table.classList.add("rm-sortable");
    const said = document.createElement("caption");
    said.className = "rm-extras-said";
    said.setAttribute("aria-live", "polite");
    table.prepend(said);

    const headers = [...head.children];
    const wired = [];

    const value = (row, index, kind) => {
      const cell = row.children[index];
      const raw = cell?.getAttribute("data-rm-value") ?? cell?.textContent.trim() ?? "";
      if (kind === "number") {
        const number = Number(raw.replace(/[^0-9.eE+-]/g, ""));
        return Number.isFinite(number) ? number : Number.NEGATIVE_INFINITY;
      }
      if (kind === "date") {
        const time = Date.parse(raw);
        return Number.isFinite(time) ? time : Number.NEGATIVE_INFINITY;
      }
      return raw.toLowerCase();
    };

    const sortBy = (index, kind, ascending) => {
      const rows = [...body.rows];
      const was = rows.map((row) => row.getBoundingClientRect().top);

      rows
        .slice()
        .sort((a, b) => {
          const left = value(a, index, kind);
          const right = value(b, index, kind);
          if (left === right) return 0;
          return (left < right ? -1 : 1) * (ascending ? 1 : -1);
        })
        .forEach((row) => body.appendChild(row));

      headers.forEach((header, i) => {
        header.setAttribute("aria-sort", i === index ? (ascending ? "ascending" : "descending") : "none");
      });
      said.textContent = `Sorted by ${headers[index].textContent.trim()}, ${ascending ? "ascending" : "descending"}`;

      if (prefersReducedMotion()) return;
      rows.forEach((row, i) => {
        const now = row.getBoundingClientRect().top;
        const dy = was[i] - now;
        if (!dy) return;
        row.animate([{ transform: `translateY(${dy}px)` }, { transform: "none" }], {
          duration, easing: EASE.inOut,
        });
      });
    };

    headers.forEach((header, index) => {
      const want = header.getAttribute("data-rm-sort");
      if (want === null) return;
      const kind = KINDS.includes(want) ? want : "text";
      header.setAttribute("aria-sort", "none");
      if (!header.hasAttribute("scope")) header.setAttribute("scope", "col");

      const button = document.createElement("button");
      button.type = "button";
      button.className = "rm-sortable-head";
      button.append(...header.childNodes);
      const arrow = document.createElement("i");
      arrow.setAttribute("aria-hidden", "true");
      button.appendChild(arrow);
      header.appendChild(button);

      let ascending = true;
      const onClick = () => {
        ascending = header.getAttribute("aria-sort") === "ascending" ? false : true;
        sortBy(index, kind, ascending);
      };
      button.addEventListener("click", onClick);
      wired.push({ header, button, onClick });
    });

    cleanups.push(() => {
      said.remove();
      for (const entry of wired) {
        entry.button.removeEventListener("click", entry.onClick);
        entry.button.querySelector("i")?.remove();
        entry.header.append(...entry.button.childNodes);
        entry.button.remove();
        entry.header.removeAttribute("aria-sort");
      }
      table.classList.remove("rm-sortable");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A header that stays, and knows when it is stuck.
 *
 * `position: sticky` does the sticking; the only thing JavaScript adds is
 * knowing *when* it stuck, so the shadow appears at the moment the header
 * detaches rather than always being there. That is done with a one-pixel
 * sentinel and an IntersectionObserver — no scroll listener, no per-frame work,
 * nothing running while the table is off screen.
 *
 * It also repairs the semantics on the way past: header cells get `scope="col"`
 * if they are missing it, which is what lets a screen reader say the column
 * name before each value instead of reading a grid of bare numbers.
 *
 *   <table data-rm-sticky-head>…</table>
 */
export function stickyHeaderTable(target = "[data-rm-sticky-head]", options = {}) {
  const tables = resolveElements(target);
  if (!tables.length) return () => {};

  const { top = 0 } = options;
  const cleanups = [];

  for (const table of tables) {
    const head = table.querySelector("thead");
    if (!head) continue;

    table.classList.add("rm-sticky-head");
    table.style.setProperty("--rm-sticky-head-top", `${dataNumber(table, "rmTop", top)}px`);
    head.querySelectorAll("th").forEach((cell) => {
      if (!cell.hasAttribute("scope")) cell.setAttribute("scope", "col");
    });

    const sentinel = document.createElement("div");
    sentinel.className = "rm-sticky-head-sentinel";
    sentinel.setAttribute("aria-hidden", "true");
    table.parentElement?.insertBefore(sentinel, table);

    const observer = new IntersectionObserver(([entry]) => {
      table.classList.toggle("is-stuck", !entry.isIntersecting);
    }, { rootMargin: `-${dataNumber(table, "rmTop", top) + 1}px 0px 0px 0px`, threshold: 0 });
    observer.observe(sentinel);

    cleanups.push(() => {
      observer.disconnect();
      sentinel.remove();
      table.classList.remove("rm-sticky-head", "is-stuck");
      table.style.removeProperty("--rm-sticky-head-top");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A table row with more underneath it.
 *
 * The detail row lives in the table's own markup, so it is real content that
 * exists without JavaScript and sits in the correct place in the reading order
 * — the common alternative, building a floating panel on click, puts the detail
 * outside the table entirely and orphans it from the row it belongs to.
 *
 * Opening is a `grid-template-rows: 0fr → 1fr` inside the detail cell, so the
 * row grows without anything measuring a height, and the trigger is a real
 * button whose `aria-controls` and `aria-expanded` point at the detail row's
 * id.
 *
 *   <table data-rm-row-expand>
 *     <tbody><tr data-rm-row>…</tr><tr data-rm-row-detail><td colspan="4">…</td></tr></tbody>
 *   </table>
 */
export function rowExpand(target = "[data-rm-row-expand]", options = {}) {
  const tables = resolveElements(target);
  if (!tables.length) return () => {};

  const { duration = 300, label = "Show details" } = options;
  const cleanups = [];

  for (const table of tables) {
    table.classList.add("rm-row-expand");
    table.style.setProperty("--rm-row-expand-duration", `${prefersReducedMotion() ? 0 : duration}ms`);

    const wired = [];
    for (const row of table.querySelectorAll("tr[data-rm-row]")) {
      const detail = row.nextElementSibling;
      if (!detail?.hasAttribute("data-rm-row-detail")) continue;
      const cell = detail.firstElementChild;
      if (!cell) continue;

      detail.classList.add("rm-row-expand-detail");
      if (!detail.id) detail.id = uid("rm-row-detail");
      /*
       * Three boxes, and each earns its place. The shell is the `0fr → 1fr`
       * grid, the clip is the `overflow: hidden` child that row needs, and the
       * pad carries the detail's own breathing room permanently. Putting that
       * padding on the clip and toggling it with the open class is the obvious
       * shortcut and it is wrong: on the way closed the class goes in the same
       * frame the row starts collapsing, the padding vanishes at once, and the
       * content jumps up before anything has moved. Padding that never changes
       * is simply part of the height the row is animating.
       */
      const shell = document.createElement("div");
      shell.className = "rm-row-expand-shell";
      const inner = document.createElement("div");
      inner.className = "rm-row-expand-clip";
      const pad = document.createElement("div");
      pad.className = "rm-row-expand-pad";
      pad.append(...cell.childNodes);
      inner.appendChild(pad);
      shell.appendChild(inner);
      cell.appendChild(shell);

      const button = document.createElement("button");
      button.type = "button";
      button.className = "rm-row-expand-toggle";
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-controls", detail.id);
      button.setAttribute("aria-label", dataString(row, "rmLabel", label));
      button.innerHTML = '<span aria-hidden="true">▾</span>';
      row.firstElementChild?.prepend(button);

      const onClick = () => {
        const open = button.getAttribute("aria-expanded") !== "true";
        button.setAttribute("aria-expanded", open ? "true" : "false");
        row.classList.toggle("is-open", open);
        detail.classList.toggle("is-open", open);
      };
      button.addEventListener("click", onClick);
      wired.push({ row, detail, cell, shell, pad, button, onClick });
    }

    cleanups.push(() => {
      for (const entry of wired) {
        entry.button.removeEventListener("click", entry.onClick);
        entry.button.remove();
        entry.cell.append(...entry.pad.childNodes);
        entry.shell.remove();
        entry.row.classList.remove("is-open");
        entry.detail.classList.remove("rm-row-expand-detail", "is-open");
      }
      table.classList.remove("rm-row-expand");
      table.style.removeProperty("--rm-row-expand-duration");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * No results, without breaking the table.
 *
 * An empty state built by hiding the table and showing a div beside it loses
 * the header, which is exactly the information somebody needs to understand
 * what was searched. This keeps the table intact and puts one row inside the
 * existing `<tbody>` with a `colspan` counted from the real header, so the
 * message spans the table properly at any column count.
 *
 * The message is announced politely, since "no results" is the answer to
 * something the visitor just did and it must not be a silent redraw.
 *
 *   <table data-rm-table-empty>…</table>
 *   table.rmEmpty("No invoices match that filter");
 */
export function tableEmpty(target = "[data-rm-table-empty]", options = {}) {
  const tables = resolveElements(target);
  if (!tables.length) return () => {};

  const { message = "Nothing to show" } = options;
  const cleanups = [];

  for (const table of tables) {
    const body = table.querySelector("tbody");
    if (!body) continue;

    table.classList.add("rm-table-empty");
    const columns = table.querySelector("thead tr")?.children.length ?? 1;
    let kept = null;
    let row = null;

    table.rmEmpty = (text = dataString(table, "rmTableEmpty", message)) => {
      if (row) { row.querySelector("p").textContent = text; return; }
      kept = [...body.children];
      const empty = document.createElement("tr");
      empty.className = "rm-table-empty-row";
      const cell = document.createElement("td");
      cell.colSpan = columns;
      const note = document.createElement("p");
      note.setAttribute("role", "status");
      note.setAttribute("aria-live", "polite");
      note.textContent = text;
      cell.appendChild(note);
      empty.appendChild(cell);
      body.replaceChildren(empty);
      row = empty;
      if (prefersReducedMotion()) return;
      note.animate(
        [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }],
        { duration: 420, easing: EASE.out },
      );
    };

    table.rmRestore = () => {
      if (!kept) return;
      body.replaceChildren(...kept);
      kept = null;
      row = null;
    };

    cleanups.push(() => {
      table.rmRestore();
      delete table.rmEmpty;
      delete table.rmRestore;
      table.classList.remove("rm-table-empty");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Code, with a copy button that says it copied.
 *
 * Two details separate this from the usual snippet block. The confirmation goes
 * into a live region, because a tick that only changes shape confirms nothing
 * to somebody who cannot see the button — and the copy is the whole point of
 * the control. And the `<pre>` is given `tabindex="0"` with a label, because a
 * horizontally scrolling code block that cannot be focused is a block a keyboard
 * user cannot scroll at all.
 *
 * Line numbers, when asked for, go in an `aria-hidden` gutter that is not part
 * of the text, so copying gives you the code rather than the code with a column
 * of digits welded to the front of every line.
 *
 *   <div data-rm-code data-rm-lang="js"><pre><code>…</code></pre></div>
 */
export function codeBlock(target = "[data-rm-code]", options = {}) {
  const blocks = resolveElements(target);
  if (!blocks.length) return () => {};

  const { label = "Copy code", numbers = false, said = "Copied to clipboard" } = options;
  const cleanups = [];

  for (const block of blocks) {
    const pre = block.querySelector("pre");
    const code = block.querySelector("code") ?? pre;
    if (!pre || !code) continue;

    block.classList.add("rm-code");
    const language = dataString(block, "rmLang", "");
    if (language) {
      const tag = document.createElement("span");
      tag.className = "rm-code-lang";
      tag.setAttribute("aria-hidden", "true");
      tag.textContent = language;
      block.prepend(tag);
      cleanups.push(() => tag.remove());
    }

    pre.classList.add("rm-code-pre");
    pre.tabIndex = 0;
    pre.setAttribute("role", "region");
    pre.setAttribute("aria-label", language ? `${language} code sample` : "Code sample");

    let gutter = null;
    if (dataString(block, "rmNumbers", numbers ? "true" : "false") === "true") {
      gutter = document.createElement("div");
      gutter.className = "rm-code-gutter";
      gutter.setAttribute("aria-hidden", "true");
      const lines = code.textContent.replace(/\n$/, "").split("\n").length;
      gutter.textContent = Array.from({ length: lines }, (_, i) => i + 1).join("\n");
      pre.parentElement.insertBefore(gutter, pre);
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "rm-code-copy";
    button.textContent = "Copy";
    button.setAttribute("aria-label", dataString(block, "rmLabel", label));

    const live = document.createElement("p");
    live.className = "rm-extras-said";
    live.setAttribute("role", "status");
    live.setAttribute("aria-live", "polite");
    block.append(button, live);

    const confirm = () => {
      live.textContent = said;
      button.classList.add("is-copied");
      button.textContent = "Copied";
      setTimeout(() => {
        button.classList.remove("is-copied");
        button.textContent = "Copy";
        live.textContent = "";
      }, 2000);
      if (prefersReducedMotion()) return;
      button.animate(
        [{ transform: "scale(0.9)" }, { transform: "scale(1.06)" }, { transform: "none" }],
        { duration: 420, easing: EASE.spring },
      );
    };

    const onClick = async () => {
      const text = code.textContent;
      try {
        await navigator.clipboard.writeText(text);
        confirm();
      } catch {
        // Clipboard access is refused on insecure origins and in some embeds.
        // The old selection trick still works there, and a copy button that
        // silently does nothing is worse than an ugly fallback.
        const scratch = document.createElement("textarea");
        scratch.value = text;
        scratch.setAttribute("readonly", "");
        scratch.className = "rm-extras-said";
        document.body.appendChild(scratch);
        scratch.select();
        try { document.execCommand("copy"); confirm(); } catch { live.textContent = "Copy failed"; }
        scratch.remove();
      }
    };
    button.addEventListener("click", onClick);

    cleanups.push(() => {
      button.removeEventListener("click", onClick);
      button.remove();
      live.remove();
      gutter?.remove();
      pre.removeAttribute("tabindex");
      pre.removeAttribute("role");
      pre.removeAttribute("aria-label");
      pre.classList.remove("rm-code-pre");
      block.classList.remove("rm-code");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Added and removed lines, not only red and green.
 *
 * A diff carried by two background colours is a diff that is unreadable to a
 * large minority of the people looking at it, and unreadable to everybody using
 * a screen reader. So every changed line gets a word — "added", "removed" — for
 * assistive technology, and a `+` or `−` in a gutter that is hidden from it, so
 * the sign is visible without being read aloud twice.
 *
 * The reveal runs down the block one line at a time using a transform and
 * opacity, which reads as a patch being applied. Nothing about the block's size
 * changes, so a long diff does not push the page around while it plays.
 *
 *   <div data-rm-diff>
 *     <div data-rm-line="add">const a = 1;</div><div data-rm-line="del">let a = 1;</div>
 *   </div>
 */
export function diffView(target = "[data-rm-diff]", options = {}) {
  const views = resolveElements(target);
  if (!views.length) return () => {};

  const { stagger = 26, duration = 320, label = "Changes" } = options;
  const WORDS = { add: "added", del: "removed", ctx: "unchanged" };
  const cleanups = [];

  for (const view of views) {
    const lines = [...view.children];
    if (!lines.length) continue;

    view.classList.add("rm-diff");
    view.setAttribute("role", "group");
    view.setAttribute("aria-label", dataString(view, "rmLabel", label));

    const marks = [];
    lines.forEach((line) => {
      const raw = line.getAttribute("data-rm-line");
      const kind = WORDS[raw] ? raw : "ctx";
      line.classList.add("rm-diff-line", `is-${kind}`);
      const sign = document.createElement("span");
      sign.className = "rm-diff-sign";
      sign.setAttribute("aria-hidden", "true");
      sign.textContent = kind === "add" ? "+" : kind === "del" ? "−" : " ";
      line.prepend(sign);
      if (kind !== "ctx") {
        const said = saidOnly(`${WORDS[kind]}: `);
        line.insertBefore(said, sign.nextSibling);
        marks.push(said);
      }
      marks.push(sign);
    });

    if (!prefersReducedMotion()) {
      const step = dataNumber(view, "rmDelay", stagger);
      lines.forEach((line) => { line.style.opacity = "0"; });
      cleanups.push(watch(view, () => {
        lines.forEach((line, i) => {
          line.style.opacity = "";
          line.animate(
            [{ opacity: 0, transform: "translateX(-8px)" }, { opacity: 1, transform: "none" }],
            { duration, delay: i * step, easing: EASE.out, fill: "backwards" },
          );
        });
      }, { threshold: 0.15, once: true }));
    }

    cleanups.push(() => {
      marks.forEach((mark) => mark.remove());
      lines.forEach((line) => {
        line.style.opacity = "";
        line.className = line.className.replace(/\brm-diff-line\b|\bis-(add|del|ctx)\b/g, "").trim();
      });
      view.removeAttribute("role");
      view.classList.remove("rm-diff");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * One endpoint in a reference, linkable and expandable.
 *
 * API documentation is read by people arriving from a link somebody sent them,
 * so the row gives itself a stable id from its method and path and opens
 * automatically when the page's hash matches it — arriving at
 * `#post-v1-charges` and finding a closed accordion is the single most annoying
 * thing a reference can do.
 *
 * The method is a coloured badge with the word still in it, because "POST" in
 * orange and "DELETE" in red are the same shape to anybody who cannot separate
 * those two colours, and the row's summary and its details are wired together
 * with `aria-controls` rather than being two elements that merely sit near each
 * other.
 *
 *   <div data-rm-api-row data-rm-method="post" data-rm-path="/v1/charges">
 *     <div data-rm-api-detail>…</div>
 *   </div>
 */
export function apiRow(target = "[data-rm-api-row]", options = {}) {
  const rows = resolveElements(target);
  if (!rows.length) return () => {};

  const { duration = 300, methods = ["get", "post", "put", "patch", "delete"] } = options;
  const cleanups = [];

  for (const row of rows) {
    const detail = row.querySelector("[data-rm-api-detail]") ?? row.lastElementChild;
    if (!detail) continue;

    const want = dataString(row, "rmMethod", "get").toLowerCase();
    const method = methods.includes(want) ? want : "get";
    const path = dataString(row, "rmPath", "");

    row.classList.add("rm-api-row");
    row.style.setProperty("--rm-api-row-duration", `${prefersReducedMotion() ? 0 : duration}ms`);
    if (!row.id) row.id = `${method}-${path}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const button = document.createElement("button");
    button.type = "button";
    button.className = "rm-api-row-head";
    button.setAttribute("aria-expanded", "false");

    const badge = document.createElement("span");
    badge.className = `rm-api-row-method is-${method}`;
    badge.textContent = method.toUpperCase();

    const name = document.createElement("code");
    name.className = "rm-api-row-path";
    name.textContent = path;

    button.append(badge, name);
    if (!detail.id) detail.id = `${row.id}-detail`;
    button.setAttribute("aria-controls", detail.id);

    const shell = document.createElement("div");
    shell.className = "rm-api-row-shell";
    detail.parentElement.insertBefore(shell, detail);
    shell.appendChild(detail);
    detail.classList.add("rm-api-row-detail");
    row.prepend(button);

    const set = (open) => {
      button.setAttribute("aria-expanded", open ? "true" : "false");
      row.classList.toggle("is-open", open);
    };
    const onClick = () => set(button.getAttribute("aria-expanded") !== "true");
    button.addEventListener("click", onClick);

    // Somebody followed a link straight to this endpoint. Open it.
    const onHash = () => { if (decodeURIComponent(location.hash.slice(1)) === row.id) set(true); };
    onHash();
    window.addEventListener("hashchange", onHash);

    cleanups.push(() => {
      window.removeEventListener("hashchange", onHash);
      button.removeEventListener("click", onClick);
      button.remove();
      shell.parentElement?.insertBefore(detail, shell);
      shell.remove();
      detail.classList.remove("rm-api-row-detail");
      row.classList.remove("rm-api-row", "is-open");
      row.style.removeProperty("--rm-api-row-duration");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Ninety days of status in one line.
 *
 * Ninety separate elements is ninety things for a screen reader to walk
 * through, which is why the strip is one `role="img"` with a summary label —
 * "99.6% uptime over the last 90 days" is the sentence somebody actually wants,
 * and the individual bars stay decorative underneath it.
 *
 * The bars grow with `scaleY` from the baseline rather than by animating a
 * height, staggered across the strip so it fills left to right. Hovering a bar
 * reads out that day; from the keyboard the strip takes one tab stop and the
 * arrow keys walk a cursor along it, Home and End going to the ends, with the
 * same sentence written into a polite live region. Without that cursor the
 * per-day detail is a pointer-only feature, which is the usual state of these
 * strips and the reason they are decoration rather than information.
 *
 *   <div data-rm-uptime data-rm-days="90" data-rm-value="99.6"></div>
 */
export function uptimeDots(target = "[data-rm-uptime]", options = {}) {
  const strips = resolveElements(target);
  if (!strips.length) return () => {};

  const { days = 90, duration = 520, label = "Uptime" } = options;
  const cleanups = [];

  for (const strip of strips) {
    const total = Math.max(1, Math.round(dataNumber(strip, "rmDays", days)));
    const share = clamp(dataNumber(strip, "rmValue", 100), 0, 100);
    const name = dataString(strip, "rmLabel", label);

    strip.classList.add("rm-uptime");
    strip.setAttribute("role", "img");
    strip.setAttribute("aria-label", `${name}: ${share}% over the last ${total} days`);
    strip.tabIndex = 0;

    // Days are read from the markup where it exists, so the real history is in
    // the page rather than invented by a script.
    const written = [...strip.children];
    const bars = [];
    const holder = document.createElement("div");
    holder.className = "rm-uptime-bars";
    holder.setAttribute("aria-hidden", "true");

    // A day's state is interpolated straight into a class name, so it has to be
    // one of the two the stylesheet knows about. A typo used to produce an
    // unstyled bar with no background at all; now it falls back to what the
    // percentage implies, which is the same discipline the sort, diff and
    // method options already follow.
    const states = ["up", "down"];

    for (let i = 0; i < total; i++) {
      const bar = document.createElement("i");
      const asked = written[i]?.getAttribute("data-rm-state");
      const state = states.includes(asked) ? asked : (i / total < share / 100 ? "up" : "down");
      bar.className = `rm-uptime-bar is-${state}`;
      bar.dataset.rmDay = String(total - i);
      holder.appendChild(bar);
      bars.push(bar);
    }
    written.forEach((day) => { day.hidden = true; });
    strip.appendChild(holder);

    const read = document.createElement("p");
    read.className = "rm-uptime-read";
    read.setAttribute("aria-live", "polite");
    strip.appendChild(read);

    const sayDay = (bar) =>
      `${bar.dataset.rmDay} days ago — ${bar.classList.contains("is-up") ? "operational" : "incident"}`;

    /*
     * The pointer can reach any single day; the keyboard has to be able to as
     * well, and a summary repeated on focus is not that — it is the same
     * sentence the strip's own label already carries. So the strip keeps a
     * cursor: one index moved with the arrow keys, Home and End, marked with a
     * class that paints exactly as `:hover` does and read out into the polite
     * region that was already here. The bars stay `aria-hidden` decoration, so
     * there is nothing extra to tab through — one stop, and the detail is in
     * the live region rather than in ninety focusable elements.
     */
    let cursor = -1;
    const dropCursor = () => {
      bars[cursor]?.classList.remove("is-cursor");
      cursor = -1;
    };
    const moveTo = (index) => {
      if (!bars.length) return;
      bars[cursor]?.classList.remove("is-cursor");
      cursor = Math.round(clamp(index, 0, bars.length - 1));
      bars[cursor].classList.add("is-cursor");
      read.textContent = sayDay(bars[cursor]);
    };

    const onOver = (event) => {
      const bar = event.target.closest(".rm-uptime-bar");
      if (!bar) return;
      read.textContent = sayDay(bar);
    };
    // Leaving with the pointer must not wipe out a cursor the keyboard put
    // there; it only takes back what the pointer itself was saying.
    const onOut = () => { read.textContent = cursor >= 0 ? sayDay(bars[cursor]) : ""; };
    const onFocus = () => { read.textContent = `${share}% over ${total} days`; };
    const onBlur = () => { dropCursor(); read.textContent = ""; };
    const onKey = (event) => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
      if (step !== undefined) {
        event.preventDefault();
        moveTo(cursor < 0 ? (step > 0 ? 0 : bars.length - 1) : cursor + step);
        return;
      }
      if (event.key === "Home") { event.preventDefault(); moveTo(0); }
      else if (event.key === "End") { event.preventDefault(); moveTo(bars.length - 1); }
    };

    strip.addEventListener("pointerover", onOver);
    strip.addEventListener("pointerleave", onOut);
    strip.addEventListener("focus", onFocus);
    strip.addEventListener("blur", onBlur);
    strip.addEventListener("keydown", onKey);

    if (!prefersReducedMotion()) {
      bars.forEach((bar) => { bar.style.transform = "scaleY(0.08)"; });
      cleanups.push(watch(strip, () => {
        bars.forEach((bar, i) => {
          bar.style.transform = "";
          bar.animate([{ transform: "scaleY(0.08)" }, { transform: "none" }], {
            duration, delay: (i / bars.length) * 420, easing: EASE.out, fill: "backwards",
          });
        });
      }, { threshold: 0.3, once: true }));
    }

    cleanups.push(() => {
      strip.removeEventListener("pointerover", onOver);
      strip.removeEventListener("pointerleave", onOut);
      strip.removeEventListener("focus", onFocus);
      strip.removeEventListener("blur", onBlur);
      strip.removeEventListener("keydown", onKey);
      holder.remove();
      read.remove();
      written.forEach((day) => { day.hidden = false; });
      strip.removeAttribute("role");
      strip.removeAttribute("aria-label");
      strip.removeAttribute("tabindex");
      strip.classList.remove("rm-uptime");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * Dated entries down a rail that draws itself.
 *
 * The rail's fill is a `scaleY` tied to how far the feed has travelled through
 * the viewport, computed on the shared frame loop and only while the feed is on
 * screen — so a long changelog is not running a scroll handler for the whole
 * page. Entries reveal as they arrive rather than all at once, which is what
 * makes the rail read as a timeline instead of a decorative line.
 *
 * Dates become real `<time datetime>` elements when the markup gives a machine
 * date, because "3 Sept" is ambiguous to a parser and to half the world.
 *
 *   <ol data-rm-changelog>
 *     <li data-rm-when="2026-09-03"><h3>v2.1</h3><p>…</p></li>
 *   </ol>
 */
export function changelogFeed(target = "[data-rm-changelog]", options = {}) {
  const feeds = resolveElements(target);
  if (!feeds.length) return () => {};

  const { duration = 560, label = "Changelog" } = options;
  const cleanups = [];

  for (const feed of feeds) {
    const entries = [...feed.children];
    if (!entries.length) continue;

    feed.classList.add("rm-changelog");
    feed.setAttribute("aria-label", dataString(feed, "rmLabel", label));

    /*
     * The rail goes in a shell around the feed, not inside it. An `<ol>` may
     * contain only `<li>` and script-supporting elements, and the list role
     * expects every child to be a `listitem`, so an `<i>` prepended into the
     * list gives a screen reader a list of undefined length and shape. The
     * shell also carries the positioning the rail needs, which the list was
     * doing before and can go on doing for its own bullets.
     */
    const shell = document.createElement("div");
    shell.className = "rm-changelog-shell";
    feed.parentElement?.insertBefore(shell, feed);
    shell.appendChild(feed);

    const rail = document.createElement("i");
    rail.className = "rm-changelog-rail";
    rail.setAttribute("aria-hidden", "true");
    shell.prepend(rail);

    const swapped = [];
    entries.forEach((entry) => {
      entry.classList.add("rm-changelog-entry");
      const when = entry.getAttribute("data-rm-when");
      const holder = entry.querySelector("[data-rm-date]");
      if (when && holder && holder.tagName !== "TIME") {
        const time = document.createElement("time");
        time.dateTime = when;
        time.className = "rm-changelog-date";
        time.append(...holder.childNodes);
        holder.appendChild(time);
        swapped.push({ holder, time });
      }
    });

    if (prefersReducedMotion()) {
      rail.style.transform = "scaleY(1)";
    } else {
      rail.style.transform = "scaleY(0)";
      cleanups.push(whileVisible(feed, () => onFrame(() => {
        const box = feed.getBoundingClientRect();
        const through = mapRange(box.top, window.innerHeight * 0.9, -box.height * 0.4, 0, 1);
        rail.style.transform = `scaleY(${clamp(through, 0, 1)})`;
      })));

      entries.forEach((entry) => { entry.style.opacity = "0"; });
      cleanups.push(watch(entries, (entry) => {
        entry.style.opacity = "";
        entry.animate(
          [{ opacity: 0, transform: "translateY(18px)" }, { opacity: 1, transform: "none" }],
          { duration, easing: EASE.out },
        );
      }, { threshold: 0.25, once: true }));
    }

    cleanups.push(() => {
      rail.remove();
      shell.parentElement?.insertBefore(feed, shell);
      shell.remove();
      swapped.forEach(({ holder, time }) => { holder.append(...time.childNodes); time.remove(); });
      entries.forEach((entry) => {
        entry.style.opacity = "";
        entry.classList.remove("rm-changelog-entry");
      });
      feed.classList.remove("rm-changelog");
      feed.removeAttribute("aria-label");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * Tiles that arrive in order and step back for the one you want.
 *
 * The arrival stagger is measured, not indexed: each tile's delay comes from
 * where it actually sits, so the wave still sweeps top-left to bottom-right
 * after the grid reflows to one column. Hovering or focusing a tile dims the
 * others by putting one class on the *grid* and letting CSS fade the siblings,
 * which is a single style recalculation rather than a transform written to
 * eleven elements on every pointer move.
 *
 * Focus is treated exactly like hover, since the tiles are almost always links
 * and a bento grid that only responds to a pointer has no keyboard state at
 * all.
 *
 *   <div data-rm-bento><a class="tile">…</a></div>
 */
export function bentoGrid(target = "[data-rm-bento]", options = {}) {
  const grids = resolveElements(target);
  if (!grids.length) return () => {};

  const { duration = 640, speed = 0.5 } = options;
  const cleanups = [];

  for (const grid of grids) {
    const tiles = [...grid.children];
    if (!tiles.length) continue;

    grid.classList.add("rm-bento");
    tiles.forEach((tile) => {
      tile.classList.add("rm-bento-tile");
      // The value lands in `grid-column: span var(--rm-bento-span, 1)`, and a
      // non-integer makes that whole declaration invalid at computed-value
      // time — so a typo does not fall back to one column, it falls back to
      // `auto`, which is a different layout. Read it as a number, round and
      // clamp it, and a bad value genuinely means one.
      if (tile.hasAttribute("data-rm-span")) {
        const span = Math.round(clamp(dataNumber(tile, "rmSpan", 1), 1, 12));
        tile.style.setProperty("--rm-bento-span", String(span));
      }
    });

    const focus = (tile) => {
      grid.classList.toggle("is-focused", Boolean(tile));
      tiles.forEach((other) => other.classList.toggle("is-lit", other === tile));
    };
    const onOver = (event) => focus(tiles.find((tile) => tile.contains(event.target)) ?? null);
    const onOut = () => focus(null);

    grid.addEventListener("pointerover", onOver);
    grid.addEventListener("pointerleave", onOut);
    grid.addEventListener("focusin", onOver);
    grid.addEventListener("focusout", onOut);

    let stop = () => {};
    if (!prefersReducedMotion()) {
      const pace = dataNumber(grid, "rmSpeed", speed);
      tiles.forEach((tile) => { tile.style.opacity = "0"; });
      stop = watch(grid, () => {
        const box = grid.getBoundingClientRect();
        for (const tile of tiles) {
          const now = tile.getBoundingClientRect();
          const along = (now.left - box.left) + (now.top - box.top);
          tile.style.opacity = "";
          tile.animate(
            [{ opacity: 0, transform: "translateY(22px) scale(0.97)" }, { opacity: 1, transform: "none" }],
            { duration, delay: along * pace, easing: EASE.out, fill: "backwards" },
          );
        }
      }, { threshold: 0.15, once: true });
    }

    cleanups.push(() => {
      stop();
      grid.removeEventListener("pointerover", onOver);
      grid.removeEventListener("pointerleave", onOut);
      grid.removeEventListener("focusin", onOver);
      grid.removeEventListener("focusout", onOut);
      tiles.forEach((tile) => {
        tile.style.opacity = "";
        tile.style.removeProperty("--rm-bento-span");
        tile.classList.remove("rm-bento-tile", "is-lit");
      });
      grid.classList.remove("rm-bento", "is-focused");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A divider you can drag, and also nudge with arrows.
 *
 * Dragging a splitter normally rewrites the column widths on every pointer
 * move, which reflows both panes and everything inside them sixty times a
 * second — on a pane holding a table or an editor that is visibly janky. Here
 * the drag moves a ghost line by `translateX` alone and the real split is
 * committed once, on release: the layout changes exactly one time per drag.
 *
 * The handle is a real `role="separator"` with `aria-valuenow`, `aria-valuemin`
 * and `aria-valuemax`, focusable, moved by the arrow keys and sent to the
 * extremes by Home and End. A splitter that only answers to a pointer is a
 * layout nobody using a keyboard can adjust.
 *
 *   <div data-rm-split-panel><div>left</div><div data-rm-split-handle></div><div>right</div></div>
 */
export function splitPanel(target = "[data-rm-split-panel]", options = {}) {
  const panels = resolveElements(target);
  if (!panels.length) return () => {};

  const { at = 50, min = 15, max = 85, step = 2, label = "Resize panels" } = options;
  const cleanups = [];

  for (const panel of panels) {
    const handle = panel.querySelector("[data-rm-split-handle]");
    if (!handle) continue;

    panel.classList.add("rm-split-panel");
    handle.classList.add("rm-split-panel-handle");
    handle.setAttribute("role", "separator");
    handle.setAttribute("aria-orientation", "vertical");
    handle.setAttribute("aria-label", dataString(panel, "rmLabel", label));
    handle.tabIndex = 0;

    const low = clamp(dataNumber(panel, "rmMin", min), 0, 100);
    const high = clamp(dataNumber(panel, "rmMax", max), low, 100);
    let where = clamp(dataNumber(panel, "rmAt", at), low, high);

    const ghost = document.createElement("i");
    ghost.className = "rm-split-panel-ghost";
    ghost.setAttribute("aria-hidden", "true");
    ghost.hidden = true;
    panel.appendChild(ghost);

    const commit = (next) => {
      where = clamp(next, low, high);
      panel.style.setProperty("--rm-split-panel-at", `${where}%`);
      handle.setAttribute("aria-valuenow", String(Math.round(where)));
      handle.setAttribute("aria-valuemin", String(Math.round(low)));
      handle.setAttribute("aria-valuemax", String(Math.round(high)));
      handle.setAttribute("aria-valuetext", `${Math.round(where)}% to the first panel`);
    };
    commit(where);

    let dragging = false;
    let preview = where;

    const percentAt = (clientX) => {
      const box = panel.getBoundingClientRect();
      return box.width ? ((clientX - box.left) / box.width) * 100 : where;
    };

    const onDown = (event) => {
      if (event.button > 0) return;
      dragging = true;
      preview = where;
      ghost.hidden = false;
      ghost.style.transform = "translateX(0px)";
      handle.setPointerCapture?.(event.pointerId);
      panel.classList.add("is-dragging");
    };
    const onMove = (event) => {
      if (!dragging) return;
      preview = clamp(percentAt(event.clientX), low, high);
      // Only the ghost moves. The panes are untouched until the pointer lifts.
      const box = panel.getBoundingClientRect();
      ghost.style.transform = `translateX(${((preview - where) / 100) * box.width}px)`;
    };
    const onUp = (event) => {
      if (!dragging) return;
      dragging = false;
      handle.releasePointerCapture?.(event.pointerId);
      panel.classList.remove("is-dragging");
      ghost.hidden = true;
      commit(preview);
    };

    const nudge = dataNumber(panel, "rmStep", step);
    const onKey = (event) => {
      const move = { ArrowLeft: -nudge, ArrowRight: nudge, Home: -100, End: 100 }[event.key];
      if (move === undefined) return;
      event.preventDefault();
      commit(event.key === "Home" ? low : event.key === "End" ? high : where + move);
    };

    handle.addEventListener("pointerdown", onDown);
    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onUp);
    handle.addEventListener("pointercancel", onUp);
    handle.addEventListener("keydown", onKey);

    cleanups.push(() => {
      handle.removeEventListener("pointerdown", onDown);
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
      handle.removeEventListener("pointercancel", onUp);
      handle.removeEventListener("keydown", onKey);
      ghost.remove();
      handle.removeAttribute("role");
      handle.removeAttribute("tabindex");
      // The value attributes have to go with the role. An element that is no
      // longer a separator, no longer focusable and no longer draggable, but
      // still telling assistive technology it sits at "50% to the first panel",
      // is worse than one that says nothing — it is read out.
      for (const name of [
        "aria-orientation", "aria-label", "aria-valuenow",
        "aria-valuemin", "aria-valuemax", "aria-valuetext",
      ]) handle.removeAttribute(name);
      handle.classList.remove("rm-split-panel-handle");
      panel.style.removeProperty("--rm-split-panel-at");
      panel.classList.remove("rm-split-panel", "is-dragging");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A sidebar that sticks, and stops before the footer.
 *
 * `position: sticky` handles the sticking on its own; the two things it cannot
 * do are know how far down the page begins under a fixed header, and know when
 * it has reached the end of its column. Both are supplied here — the offset as
 * a custom property, the end with a sentinel and an IntersectionObserver — so
 * there is no scroll listener and no per-frame work anywhere in the component.
 *
 * The aside is given a label and, when it holds a list of links, `aria-current`
 * is left alone: this component positions, it does not decide what is current.
 * That belongs to whatever knows about the page.
 *
 *   <aside data-rm-sticky-aside data-rm-top="88">…</aside>
 */
export function stickyAside(target = "[data-rm-sticky-aside]", options = {}) {
  const asides = resolveElements(target);
  if (!asides.length) return () => {};

  const { top = 24, label = "Section navigation" } = options;
  const cleanups = [];

  for (const aside of asides) {
    aside.classList.add("rm-sticky-aside");
    const offset = dataNumber(aside, "rmTop", top);
    aside.style.setProperty("--rm-sticky-aside-top", `${offset}px`);
    // It already checks whether the author wrote a label; it has to remember
    // the answer, or cleanup takes away a label it never added.
    const labelled = aside.hasAttribute("aria-label");
    if (!labelled) {
      aside.setAttribute("aria-label", dataString(aside, "rmLabel", label));
    }

    const sentinel = document.createElement("div");
    sentinel.className = "rm-sticky-aside-sentinel";
    sentinel.setAttribute("aria-hidden", "true");
    aside.parentElement?.insertBefore(sentinel, aside);

    const stuck = new IntersectionObserver(([entry]) => {
      aside.classList.toggle("is-stuck", !entry.isIntersecting);
    }, { rootMargin: `-${offset + 1}px 0px 0px 0px` });
    stuck.observe(sentinel);

    // The end of the column: once it is in view the aside stops travelling, so
    // it never rides over the footer.
    const tail = aside.parentElement?.lastElementChild ?? null;
    let ended = null;
    if (tail && tail !== aside) {
      ended = new IntersectionObserver(([entry]) => {
        aside.classList.toggle("is-ended", entry.isIntersecting);
      }, { rootMargin: "0px 0px -60% 0px" });
      ended.observe(tail);
    }

    cleanups.push(() => {
      stuck.disconnect();
      ended?.disconnect();
      sentinel.remove();
      aside.style.removeProperty("--rm-sticky-aside-top");
      if (!labelled) aside.removeAttribute("aria-label");
      aside.classList.remove("rm-sticky-aside", "is-stuck", "is-ended");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A rule that draws itself, and is a real separator.
 *
 * The line is an SVG stroke drawn with `stroke-dashoffset`, which keeps its
 * weight constant for the whole animation — the version that scales a div from
 * zero width has a line that is the wrong thickness on the way in, and on a
 * hairline that is visible.
 *
 * It is also given `role="separator"` with an orientation, so it divides the
 * document rather than merely looking like it does. A decorative hairline
 * between two sections is a section break that assistive technology never hears
 * about.
 *
 *   <div data-rm-divider data-rm-mark="§"></div>
 */
export function dividerMark(target = "[data-rm-divider]", options = {}) {
  const rules = resolveElements(target);
  if (!rules.length) return () => {};

  const { duration = 900, mark = "" } = options;
  const cleanups = [];

  for (const rule of rules) {
    rule.classList.add("rm-divider");
    rule.setAttribute("role", "separator");
    rule.setAttribute("aria-orientation", "horizontal");

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "rm-divider-line");
    svg.setAttribute("viewBox", "0 0 100 2");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", "0");
    line.setAttribute("y1", "1");
    line.setAttribute("x2", "100");
    line.setAttribute("y2", "1");
    svg.appendChild(line);

    const glyph = dataString(rule, "rmMark", mark);
    let badge = null;
    if (glyph) {
      badge = document.createElement("span");
      badge.className = "rm-divider-mark";
      badge.setAttribute("aria-hidden", "true");
      badge.textContent = glyph;
    }
    rule.append(svg, ...(badge ? [badge] : []));

    if (!prefersReducedMotion()) {
      line.style.strokeDasharray = "100";
      line.style.strokeDashoffset = "100";
      cleanups.push(watch(rule, () => {
        line.style.strokeDashoffset = "0";
        line.animate([{ strokeDashoffset: 100 }, { strokeDashoffset: 0 }], {
          duration: dataNumber(rule, "rmDuration", duration), easing: EASE.inOut,
        });
        badge?.animate([{ opacity: 0, transform: "scale(0.7)" }, { opacity: 1, transform: "none" }], {
          duration: 480, delay: duration * 0.5, easing: EASE.spring, fill: "backwards",
        });
      }, { threshold: 0.4, once: true }));
    }

    cleanups.push(() => {
      svg.remove();
      badge?.remove();
      rule.removeAttribute("role");
      rule.removeAttribute("aria-orientation");
      rule.classList.remove("rm-divider");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * A numbered label that knows which section you are in.
 *
 * The numbers are counted from document order rather than written into the
 * markup, so inserting a section in the middle does not mean renumbering
 * everything after it by hand — the commonest source of a page that says "01,
 * 02, 02, 04".
 *
 * The number itself is `aria-hidden`; a screen reader gets the section's own
 * heading, not "zero three" in front of it. What it does get is
 * `aria-current="true"` on the mark for the section in view, which is a real
 * statement about where you are rather than a colour change.
 *
 *   <span data-rm-section-mark>Work</span>
 */
export function sectionMark(target = "[data-rm-section-mark]", options = {}) {
  const marks = resolveElements(target);
  if (!marks.length) return () => {};

  const { pad = 2, from = 1 } = options;
  const cleanups = [];
  const numbers = [];

  marks.forEach((mark, i) => {
    mark.classList.add("rm-section-mark");
    const width = Math.max(1, Math.round(dataNumber(mark, "rmPad", pad)));
    const number = document.createElement("span");
    number.className = "rm-section-mark-number";
    number.setAttribute("aria-hidden", "true");
    number.textContent = String(i + from).padStart(width, "0");
    mark.prepend(number);
    numbers.push(number);

    const section = mark.closest("section, article") ?? mark.parentElement;
    if (!section) return;

    const observer = new IntersectionObserver(([entry]) => {
      const here = entry.isIntersecting;
      mark.classList.toggle("is-current", here);
      if (here) mark.setAttribute("aria-current", "true");
      else mark.removeAttribute("aria-current");
      if (here && !prefersReducedMotion()) {
        number.animate(
          [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }],
          { duration: 420, easing: EASE.out },
        );
      }
    }, { rootMargin: "-30% 0px -50% 0px" });
    observer.observe(section);
    cleanups.push(() => observer.disconnect());
  });

  return () => {
    cleanups.forEach((stop) => stop());
    numbers.forEach((number) => number.remove());
    marks.forEach((mark) => {
      mark.removeAttribute("aria-current");
      mark.classList.remove("rm-section-mark", "is-current");
    });
  };
}
