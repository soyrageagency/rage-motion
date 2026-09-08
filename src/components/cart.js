/**
 * Ecommerce — cart, checkout and order.
 *
 *   • cartDrawer()      — the basket as a real dialog, trapped and restored.
 *   • cartLine()        — a line item with a stepper and a remove button.
 *   • cartTotals()      — a subtotal that recomputes, rolls and is announced.
 *   • cartEmpty()       — the basket with nothing in it, said out loud.
 *   • cartBadge()       — a count on the cart icon that rolls.
 *   • miniCart()        — a preview that opens on hover and on focus.
 *   • freeShippingBar() — progress towards a threshold, with the gap in words.
 *   • couponField()     — a code field with an applied and a rejected state.
 *   • checkoutSteps()   — a multi-step form made of real fieldsets.
 *   • orderSummary()    — the figures, foldable, without a height animation.
 *   • paymentMethods()  — real radios that choose a method and nothing else.
 *   • addressForm()     — a real form with a real error summary.
 *   • deliveryOptions() — speeds and prices, announced when they change.
 *   • giftNote()        — an optional message, revealed without a jump.
 *   • orderConfirm()    — the success state, focused and announced.
 *   • orderTracking()   — a stepped tracker with words, not just ticks.
 *   • returnRequest()   — a reason, a note and a fictional reference.
 *   • invoiceRow()      — a table row that opens to show its detail.
 *   • saveForLater()    — an item moving between two lists, by FLIP.
 *   • recentlyViewed()  — a rail that scrolls itself and nothing else.
 *
 * A basket is the one part of a site where a mistake costs money, so the
 * discipline here is heavier than usual. Every quantity control is a real
 * button and a real input rather than a pair of clickable arrows. Every figure
 * that changes is announced politely once the visitor has stopped pressing,
 * never on each keystroke, because a total that reads itself out four times
 * while you hold the plus key is worse than one that says nothing. Removing a
 * line moves the lines below it with a FLIP, so the list never jumps under a
 * pointer that is about to press remove again, and focus is placed on the next
 * sensible control rather than being dropped on the body. The drawer is a
 * dialog: focus trapped, Escape closes, the page behind it inert, focus handed
 * back to whatever opened it.
 *
 * The hard boundary: these are presentation components. Nothing here collects,
 * stores, transmits or validates a card number, a CVV or a bank detail, and
 * nothing here imitates a real shop or a real payment provider. The payment
 * picker chooses a *method* — a radio group, the same as choosing a delivery
 * speed — and stops. Every price, code, order reference and shop name in the
 * examples is invented on purpose.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import {
  clamp, dataNumber, dataString, EASE, keepInView, lerp, onFrame,
  prefersReducedMotion, resolveElements, whileVisible,
} from "../core/motion.js";

/*
 * The two events these components speak to each other with.
 *
 * They are plain strings rather than an exported constant so that anything
 * outside this module can listen without importing it — `rm-cart-change`
 * bubbles from a line that changed or left, and `rm-cart-total` fires on
 * `document` once a totals row has recomputed, carrying the count, the subtotal
 * and the currency. A badge in a header and a free-delivery bar in a drawer
 * therefore stay right without either one knowing the other exists.
 */
const CART_CHANGE = "rm-cart-change";
const CART_TOTAL = "rm-cart-total";

/*
 * Every totals row currently mounted, module-wide.
 *
 * A totals row writes its figures into the page, and a row watching the page
 * for new lines sees that write as a mutation. One row can filter out its own
 * writes; two rows cannot, because row A's paint is a foreign mutation to row
 * B, which recounts and paints, which hands row A a foreign mutation straight
 * back — a microtask loop with no frame in the middle of it, which locks the
 * tab outright. And two rows is the ordinary case: one in the drawer, one on
 * the checkout page. So the filter is the set rather than the row. A mutation
 * inside *any* mounted totals row belongs to this module and is never a reason
 * to recount.
 */
const totalsRows = new Set();

/** Anything that can hold focus inside a trapped panel. */
const FOCUSABLE = [
  "a[href]", "button:not([disabled])", "input:not([disabled]):not([type=hidden])",
  "select:not([disabled])", "textarea:not([disabled])", "[tabindex]:not([tabindex='-1'])",
].join(",");

/** A short unique id, for the aria-* wiring that needs one. */
const uid = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

/** A live region that is created once and reused. */
function speaker(holder, tone = "polite") {
  const said = document.createElement("p");
  said.className = "rm-cart-live";
  said.setAttribute("aria-live", tone);
  said.setAttribute("role", tone === "assertive" ? "alert" : "status");
  holder.appendChild(said);
  return said;
}

/**
 * Format money the way the visitor's own device does.
 *
 * `Intl` is native and already knows where the symbol goes, which separator to
 * use and how many decimals the currency has — hard-coding "£" in front of a
 * number is wrong in half of Europe and wrong for every zero-decimal currency.
 */
function money(amount, currency = "GBP") {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/**
 * Measure, mutate, invert, play.
 *
 * The only honest way to animate a list that genuinely changes size. Removing a
 * line really does move everything below it; animating a height would be a lie
 * and a reflow per frame. Instead the change happens instantly, then the
 * elements that moved are put back where they were with a transform and let go.
 * The browser lays out once and the compositor does the rest.
 */
function flip(nodes, mutate, duration = 320) {
  const before = nodes.map((node) => [node, node.getBoundingClientRect()]);
  mutate();
  if (prefersReducedMotion()) return;
  for (const [node, was] of before) {
    if (!node.isConnected) continue;
    const now = node.getBoundingClientRect();
    const dx = was.left - now.left;
    const dy = was.top - now.top;
    if (!dx && !dy) continue;
    node.animate(
      [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }],
      { duration, easing: EASE.out },
    );
  }
}

/**
 * Make everything outside `panel` inert. Returns the undo.
 *
 * `keep` is the list of things that belong to the panel without living inside
 * it — a scrim, usually. Sealing the scrim by accident is a classic: the
 * overlay is still painted, still looks clickable, and silently does nothing.
 *
 * The walk goes all the way up to the body rather than sealing the body's own
 * children and stopping. A drawer nested inside a wrapper — which is where a
 * drawer usually ends up — has an ancestor that contains it, so that ancestor
 * is spared and every sibling inside it stays live. `keepTabInside` still holds
 * the Tab key, but a screen reader's virtual cursor, a pointer, find-in-page
 * and Safari's rotor all walk straight into the product grid the visitor can no
 * longer see, which is precisely the failure this is here to prevent.
 *
 * Only nodes that were not already inert are recorded, so the undo restores the
 * page rather than un-sealing something the page had deliberately sealed for
 * its own reasons.
 */
function sealPage(panel, keep = []) {
  const spare = [panel, ...keep];
  const sealed = [];
  for (let node = panel; node && node !== document.body && node.parentElement; node = node.parentElement) {
    for (const sibling of node.parentElement.children) {
      if (sibling === node || sibling.inert) continue;
      if (spare.some((one) => sibling === one || sibling.contains(one))) continue;
      sibling.inert = true;
      sealed.push(sibling);
    }
  }
  return () => sealed.forEach((node) => { node.inert = false; });
}

/** Keep Tab inside `panel`. Call from a keydown handler. */
function keepTabInside(panel, event) {
  if (event.key !== "Tab") return;
  const stops = [...panel.querySelectorAll(FOCUSABLE)].filter((node) => node.offsetParent !== null);
  if (!stops.length) return;
  const first = stops[0];
  const last = stops[stops.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}

/**
 * The basket as a real dialog, trapped and restored.
 *
 * A cart drawer is a modal whether or not anyone admits it: while it is open,
 * the page behind it must not be reachable, or a Tab press walks a screen
 * reader out of the basket and into a product grid it can no longer see. So
 * this is `role="dialog"` with `aria-modal`, the rest of the body is `inert`,
 * Tab cycles inside, Escape closes, and focus goes back to the button that
 * opened it rather than to the top of the document.
 *
 * It slides on a transform, so opening the basket never reflows the page
 * underneath and the product list keeps its scroll position exactly.
 *
 *   <button aria-controls="basket">Basket</button>
 *   <aside id="basket" data-rm-cart-drawer data-rm-label="Your basket">…</aside>
 */
export function cartDrawer(target = "[data-rm-cart-drawer]", options = {}) {
  const drawers = resolveElements(target);
  if (!drawers.length) return () => {};

  const { side = "right", label = "Your basket", duration = 380 } = options;
  const cleanups = [];

  for (const drawer of drawers) {
    const where = dataString(drawer, "rmSide", side) === "left" ? "left" : "right";
    const madeId = !drawer.id;
    if (madeId) drawer.id = uid("rm-cart-drawer");

    // The drawer belongs to the page, not to this component. Whatever name it
    // already carried is put back on the way out rather than deleted.
    const hadLabel = drawer.getAttribute("aria-label");

    drawer.classList.add("rm-cart-drawer", `is-${where}`);
    drawer.setAttribute("role", "dialog");
    drawer.setAttribute("aria-modal", "true");
    drawer.setAttribute("aria-label", dataString(drawer, "rmLabel", label));
    // The start state comes from here, never from the stylesheet: a drawer that
    // is hidden in CSS is a drawer that is invisible to a visitor whose
    // JavaScript never arrives.
    drawer.hidden = true;

    const shut = document.createElement("button");
    shut.type = "button";
    shut.className = "rm-cart-drawer-close";
    shut.setAttribute("aria-label", "Close the basket");
    shut.textContent = "×";
    drawer.prepend(shut);

    const scrim = document.createElement("div");
    scrim.className = "rm-cart-drawer-scrim";
    scrim.hidden = true;
    drawer.after(scrim);

    const triggers = [...document.querySelectorAll(`[aria-controls="${drawer.id}"]`)];
    triggers.forEach((button) => button.setAttribute("aria-expanded", "false"));

    let opener = null;
    let unseal = null;

    const open = () => {
      if (!drawer.hidden) return;
      opener = document.activeElement;
      drawer.hidden = false;
      scrim.hidden = false;
      unseal = sealPage(drawer, [scrim]);
      triggers.forEach((button) => button.setAttribute("aria-expanded", "true"));
      shut.focus();
      if (prefersReducedMotion()) return;
      const away = where === "left" ? "-100%" : "100%";
      drawer.animate(
        [{ transform: `translateX(${away})` }, { transform: "none" }],
        { duration, easing: EASE.out },
      );
      scrim.animate([{ opacity: 0 }, { opacity: 1 }], { duration, easing: EASE.out });
    };

    const close = () => {
      if (drawer.hidden) return;
      const done = () => {
        drawer.hidden = true;
        scrim.hidden = true;
        unseal?.();
        unseal = null;
        triggers.forEach((button) => button.setAttribute("aria-expanded", "false"));
        // Back where it came from. Anything else loses the visitor's place.
        opener?.focus?.();
        opener = null;
      };
      if (prefersReducedMotion()) { done(); return; }
      const away = where === "left" ? "-100%" : "100%";
      scrim.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 240, easing: EASE.inOut });
      drawer.animate(
        [{ transform: "none" }, { transform: `translateX(${away})` }],
        { duration: 240, easing: EASE.inOut },
      ).finished.then(done, done);
    };

    const onTrigger = (event) => { event.preventDefault(); open(); };
    triggers.forEach((button) => button.addEventListener("click", onTrigger));
    shut.addEventListener("click", close);
    scrim.addEventListener("click", close);

    const onKey = (event) => {
      if (drawer.hidden) return;
      if (event.key === "Escape") { event.preventDefault(); close(); return; }
      keepTabInside(drawer, event);
    };
    document.addEventListener("keydown", onKey);

    drawer.rmOpen = open;
    drawer.rmClose = close;
    if (dataString(drawer, "rmOpen", "") === "true") open();

    cleanups.push(() => {
      document.removeEventListener("keydown", onKey);
      triggers.forEach((button) => {
        button.removeEventListener("click", onTrigger);
        button.removeAttribute("aria-expanded");
      });
      unseal?.();
      shut.remove();
      scrim.remove();
      delete drawer.rmOpen;
      delete drawer.rmClose;
      drawer.hidden = false;
      if (madeId) drawer.removeAttribute("id");
      drawer.classList.remove("rm-cart-drawer", `is-${where}`);
      drawer.removeAttribute("role");
      drawer.removeAttribute("aria-modal");
      if (hadLabel === null) drawer.removeAttribute("aria-label");
      else drawer.setAttribute("aria-label", hadLabel);
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A line item with a stepper and a remove button.
 *
 * The stepper is two real buttons around a real `<input type="number">`, which
 * means it can be typed into, arrowed, and read as "quantity, 2" — the usual
 * pair of clickable spans is none of those things. The buttons disable
 * themselves at the ends of the range rather than silently doing nothing, so
 * the limit is visible before it is hit.
 *
 * The line's own price is a polite live region and the total is not, because
 * the button you just pressed should report itself immediately while the
 * running total waits until you have stopped pressing. Removing the line FLIPs
 * the lines below it and then moves focus to the next remove button, since
 * dropping focus on `<body>` after a deletion is how keyboard users lose the
 * list entirely.
 *
 *   <li data-rm-cart-line data-rm-price="24" data-rm-qty="2">
 *     <h3>Rage Motion tee (invented)</h3>
 *   </li>
 */
export function cartLine(target = "[data-rm-cart-line]", options = {}) {
  const lines = resolveElements(target);
  if (!lines.length) return () => {};

  const { currency = "GBP", min = 0, max = 99 } = options;
  const cleanups = [];

  for (const line of lines) {
    const unit = dataNumber(line, "rmPrice", 0);
    const money3 = dataString(line, "rmCurrency", currency);
    const floor = dataNumber(line, "rmMin", min);
    const ceiling = dataNumber(line, "rmMax", max);
    const name = line.querySelector("h1,h2,h3,h4,h5,h6")?.textContent?.trim() ?? "this item";
    let qty = clamp(dataNumber(line, "rmQty", 1), floor, ceiling);

    line.classList.add("rm-cart-line");

    const stepper = document.createElement("div");
    stepper.className = "rm-cart-line-stepper";

    const less = document.createElement("button");
    less.type = "button";
    less.className = "rm-cart-line-step";
    less.setAttribute("aria-label", `One fewer ${name}`);
    less.textContent = "−";

    const field = document.createElement("input");
    field.type = "number";
    field.className = "rm-cart-line-qty";
    field.min = String(floor);
    field.max = String(ceiling);
    field.step = "1";
    field.value = String(qty);
    field.setAttribute("aria-label", `Quantity of ${name}`);

    const more = document.createElement("button");
    more.type = "button";
    more.className = "rm-cart-line-step";
    more.setAttribute("aria-label", `One more ${name}`);
    more.textContent = "+";

    const cost = document.createElement("p");
    cost.className = "rm-cart-line-cost";
    cost.setAttribute("aria-live", "polite");

    const drop = document.createElement("button");
    drop.type = "button";
    drop.className = "rm-cart-line-remove";
    drop.setAttribute("aria-label", `Remove ${name}`);
    drop.textContent = "Remove";

    stepper.append(less, field, more);
    line.append(stepper, cost, drop);

    const draw = () => {
      field.value = String(qty);
      line.dataset.rmQty = String(qty);
      cost.textContent = money(unit * qty, money3);
      less.disabled = qty <= floor;
      more.disabled = qty >= ceiling;
      line.dispatchEvent(new CustomEvent(CART_CHANGE, {
        bubbles: true,
        detail: { name, unit, qty, currency: money3, line },
      }));
    };

    const set = (next) => {
      const want = clamp(Math.round(next), floor, ceiling);
      if (want === qty) return;
      qty = want;
      draw();
      if (prefersReducedMotion()) return;
      cost.animate(
        [{ transform: "translateY(6px)", opacity: 0.4 }, { transform: "none", opacity: 1 }],
        { duration: 260, easing: EASE.out },
      );
    };

    const onLess = () => set(qty - 1);
    const onMore = () => set(qty + 1);
    const onType = () => set(Number(field.value));
    less.addEventListener("click", onLess);
    more.addEventListener("click", onMore);
    field.addEventListener("change", onType);

    const onDrop = () => {
      const list = line.parentElement;
      const after = [...(list?.children ?? [])].filter((node) => node !== line);
      // Focus first, while the line is still in the document, so the browser
      // never has a moment with nothing focused. The next remove button is the
      // right landing place: it is where the visitor's hand already was.
      const neighbour = line.nextElementSibling ?? line.previousElementSibling;
      const land = neighbour?.querySelector(".rm-cart-line-remove");
      if (land) land.focus();
      flip(after, () => {
        line.remove();
        list?.dispatchEvent(new CustomEvent(CART_CHANGE, {
          bubbles: true,
          detail: { name, unit, qty: 0, currency: money3, line, removed: true },
        }));
      });
    };
    drop.addEventListener("click", onDrop);

    draw();
    line.rmSet = set;
    line.rmQuantity = () => qty;

    cleanups.push(() => {
      less.removeEventListener("click", onLess);
      more.removeEventListener("click", onMore);
      field.removeEventListener("change", onType);
      drop.removeEventListener("click", onDrop);
      stepper.remove();
      cost.remove();
      drop.remove();
      delete line.rmSet;
      delete line.rmQuantity;
      line.classList.remove("rm-cart-line");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A subtotal that recomputes, rolls and is announced.
 *
 * The figure counts from the old amount to the new one on the shared frame loop
 * rather than snapping, because a total that jumps from £48 to £72 gives no
 * sense of which direction it went. The count runs inside `whileVisible`, so a
 * totals row scrolled off screen stops burning frames and simply writes the
 * final figure instead.
 *
 * The announcement is debounced. Holding the plus button fires a dozen changes
 * a second, and a live region that repeats every one of them is unusable, so
 * the sentence is spoken once the pressing stops. A `MutationObserver` watches
 * for lines being added or removed, so the total is right even when the markup
 * is replaced by something this module never saw. It watches the list the lines
 * live in rather than the whole document, and a burst of changes costs one
 * recount on the next frame instead of one per record batch.
 *
 *   <div data-rm-cart-totals data-rm-shipping="4.95" data-rm-currency="GBP"></div>
 */
export function cartTotals(target = "[data-rm-cart-totals]", options = {}) {
  const rows = resolveElements(target);
  if (!rows.length) return () => {};

  const { scope = null, lines = "[data-rm-cart-line]", currency = "GBP", settle = 700 } = options;
  const cleanups = [];

  for (const row of rows) {
    const money3 = dataString(row, "rmCurrency", currency);
    const post = dataNumber(row, "rmShipping", 0);
    /*
     * Where the lines are, and therefore where to watch.
     *
     * Observing `document.body` with `subtree: true` puts every unrelated change
     * on the page through a document-wide `querySelectorAll` and a broadcast —
     * a toast arriving, a marquee cloning itself, a framework re-render, this
     * module's own badge swapping a digit. So the default root is the list the
     * lines actually sit in, found once at mount. An explicit `scope` wins; a
     * mistyped one falls back rather than throwing, because a bad selector
     * should cost accuracy, not the page.
     */
    const seed = [...document.body.querySelectorAll(lines)];
    const where = (scope && document.querySelector(scope))
      || seed[0]?.closest("ul, ol, table, form")
      || document.body;
    row.classList.add("rm-cart-totals");
    totalsRows.add(row);

    const figures = document.createElement("dl");
    figures.className = "rm-cart-totals-figures";
    const build = (term) => {
      const dt = document.createElement("dt");
      dt.textContent = term;
      const dd = document.createElement("dd");
      figures.append(dt, dd);
      return dd;
    };
    const subFace = build("Subtotal");
    const shipFace = build("Delivery");
    const totalFace = build("Total");
    totalFace.classList.add("is-total");
    row.appendChild(figures);
    const said = speaker(row, "polite");

    let shown = 0;
    let wanted = 0;
    let tween = null;
    let timer = 0;

    // Written only when the string has actually changed. Assigning the same
    // text is still a childList mutation, which wakes every observer on the
    // page for nothing — and during a count that is three of them a frame.
    const write = (face, text) => { if (face.textContent !== text) face.textContent = text; };
    const paint = (value) => {
      write(subFace, money(value, money3));
      write(shipFace, post > 0 ? money(post, money3) : "Free");
      write(totalFace, money(value + post, money3));
    };

    const count = () => {
      // Only ever a transform on the text? No — this is a number, so the text
      // itself changes. It is not a layout animation because the figure sits in
      // a fixed-width tabular column; nothing around it can move.
      const step = () => {
        shown = lerp(shown, wanted, 0.22);
        if (Math.abs(wanted - shown) < 0.01) { shown = wanted; paint(shown); return true; }
        paint(shown);
        return false;
      };
      if (tween) return;
      tween = onFrame(() => { if (step()) { tween?.(); tween = null; } });
    };

    let running = false;
    const stopWatching = whileVisible(row, () => {
      running = true;
      return () => { running = false; tween?.(); tween = null; };
    });
    cleanups.push(stopWatching);

    const recount = () => {
      const found = [...where.querySelectorAll(lines)];
      let sum = 0;
      let items = 0;
      for (const line of found) {
        const qty = dataNumber(line, "rmQty", 1);
        sum += dataNumber(line, "rmPrice", 0) * qty;
        items += qty;
      }
      wanted = sum;
      if (running && !prefersReducedMotion()) count();
      else { shown = wanted; paint(shown); }

      document.dispatchEvent(new CustomEvent(CART_TOTAL, {
        detail: { count: items, subtotal: sum, total: sum + post, currency: money3 },
      }));

      // Said once, after the pressing stops.
      clearTimeout(timer);
      timer = setTimeout(() => {
        said.textContent = `${items} ${items === 1 ? "item" : "items"}, total ${money(sum + post, money3)}`;
      }, settle);
    };

    /*
     * At most one recount per frame, never one per mutation record batch.
     *
     * A burst of changes — a list replaced wholesale, a dozen lines appended in
     * a loop — arrives as many callbacks, and recounting on each one means
     * walking the list and broadcasting a total for every intermediate state
     * nobody will ever see. The task unsubscribes itself the moment it runs, so
     * the shared loop stops again rather than idling.
     */
    let pending = null;
    const schedule = () => {
      if (pending) return;
      pending = onFrame(() => {
        pending?.();
        pending = null;
        recount();
      });
    };

    const onChange = () => schedule();
    where.addEventListener(CART_CHANGE, onChange);

    /*
     * The observer has to ignore this module's own writes.
     *
     * Painting a figure replaces a text node, which is a childList mutation,
     * which would schedule another recount — and with a second totals row on
     * the page each row's paint is a foreign mutation to the other, so the two
     * of them recount each other forever. Testing against every mounted row
     * rather than only this one is what actually breaks that: a mutation inside
     * any totals row is ours, and ours is never news.
     */
    const watcher = new MutationObserver((records) => {
      const mine = (record) => [...totalsRows].some((one) => one.contains(record.target));
      if (records.every(mine)) return;
      schedule();
    });
    watcher.observe(where, { childList: true, subtree: true });

    recount();
    shown = wanted;
    paint(shown);
    row.rmRefresh = recount;

    cleanups.push(() => {
      watcher.disconnect();
      totalsRows.delete(row);
      where.removeEventListener(CART_CHANGE, onChange);
      clearTimeout(timer);
      pending?.();
      pending = null;
      tween?.();
      figures.remove();
      said.remove();
      delete row.rmRefresh;
      row.classList.remove("rm-cart-totals");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * The basket with nothing in it, said out loud.
 *
 * An empty basket is a state change, not a page: the list emptied while the
 * visitor was standing there, so this is `role="status"` and the sentence is
 * announced. A `MutationObserver` on the list means it is right regardless of
 * what emptied it — this component, a framework re-render, or a fetch that
 * replaced the markup wholesale.
 *
 * The panel is hidden from JavaScript on mount, so a basket with items in it is
 * never briefly shown an empty message by a stylesheet that loaded first.
 *
 *   <ul id="basket-lines">…</ul>
 *   <div data-rm-cart-empty="#basket-lines">Nothing here yet.</div>
 */
export function cartEmpty(target = "[data-rm-cart-empty]", options = {}) {
  const panels = resolveElements(target);
  if (!panels.length) return () => {};

  const { duration = 420 } = options;
  const cleanups = [];

  for (const panel of panels) {
    const listId = dataString(panel, "rmCartEmpty", "");
    const list = listId ? document.querySelector(listId) : panel.previousElementSibling;
    if (!list) continue;

    const hadLive = panel.getAttribute("aria-live");
    panel.classList.add("rm-cart-empty");
    panel.setAttribute("role", "status");
    panel.setAttribute("aria-live", "polite");

    let empty = null;
    const sync = () => {
      const isEmpty = list.children.length === 0;
      if (isEmpty === empty) return;
      empty = isEmpty;
      panel.hidden = !isEmpty;
      list.hidden = isEmpty;
      if (!isEmpty || prefersReducedMotion()) return;
      panel.animate(
        [{ opacity: 0, transform: "translateY(10px) scale(0.98)" }, { opacity: 1, transform: "none" }],
        { duration, easing: EASE.out },
      );
    };

    const watcher = new MutationObserver(sync);
    watcher.observe(list, { childList: true });
    sync();

    cleanups.push(() => {
      watcher.disconnect();
      panel.hidden = false;
      list.hidden = false;
      panel.classList.remove("rm-cart-empty");
      panel.removeAttribute("role");
      if (hadLive === null) panel.removeAttribute("aria-live");
      else panel.setAttribute("aria-live", hadLive);
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A count on the cart icon that rolls.
 *
 * Two faces on the same spot: the old number leaves upward and the new one
 * arrives from below, so going from 2 to 3 reads as an increase rather than a
 * redraw. The digits sit in a tabular, fixed-width slot, which is why nothing
 * around the badge shifts when the count reaches ten.
 *
 * The accessible name carries the whole sentence — "Basket, 3 items" — because
 * a bare "3" beside an icon tells a screen reader three of what. It listens for
 * the totals event, so a badge in the header stays right without being wired up
 * by hand.
 *
 *   <a href="/basket" data-rm-cart-badge="0">Basket</a>
 */
export function cartBadge(target = "[data-rm-cart-badge]", options = {}) {
  const badges = resolveElements(target);
  if (!badges.length) return () => {};

  const { label = "Basket", duration = 320 } = options;
  const cleanups = [];

  for (const badge of badges) {
    const word = dataString(badge, "rmLabel", label);
    const step = dataNumber(badge, "rmDuration", duration);
    // A cart link may well have been named by the page already. The sentence
    // this writes replaces that name for as long as the badge is mounted, and
    // hands it back afterwards rather than deleting somebody else's work.
    const hadLabel = badge.getAttribute("aria-label");
    badge.classList.add("rm-cart-badge");

    const pill = document.createElement("span");
    pill.className = "rm-cart-badge-pill";
    pill.setAttribute("aria-hidden", "true");
    const face = document.createElement("span");
    face.className = "rm-cart-badge-face";
    pill.appendChild(face);
    badge.appendChild(pill);

    let value = Number(dataString(badge, "rmCartBadge", "0")) || 0;

    const say = () => {
      badge.setAttribute("aria-label", value === 0
        ? `${word}, empty`
        : `${word}, ${value} ${value === 1 ? "item" : "items"}`);
    };

    const set = (next) => {
      const want = Math.max(0, Math.round(next));
      if (want === value) return;
      const up = want > value;
      value = want;
      say();
      pill.hidden = value === 0;
      if (prefersReducedMotion()) { face.textContent = String(value); return; }

      const leaving = face.cloneNode(true);
      leaving.classList.add("is-leaving");
      pill.appendChild(leaving);
      leaving.animate(
        [{ transform: "none", opacity: 1 }, { transform: `translateY(${up ? -110 : 110}%)`, opacity: 0 }],
        { duration: step, easing: EASE.out, fill: "forwards" },
      ).finished.then(() => leaving.remove(), () => leaving.remove());

      face.textContent = String(value);
      face.animate(
        [{ transform: `translateY(${up ? 110 : -110}%)`, opacity: 0 }, { transform: "none", opacity: 1 }],
        { duration: step, easing: EASE.out },
      );
      pill.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.18)" }, { transform: "scale(1)" }],
        { duration: step + 160, easing: EASE.out },
      );
    };

    face.textContent = String(value);
    pill.hidden = value === 0;
    say();

    const onTotal = (event) => set(event.detail?.count ?? value);
    document.addEventListener(CART_TOTAL, onTotal);
    badge.rmSet = set;

    cleanups.push(() => {
      document.removeEventListener(CART_TOTAL, onTotal);
      pill.remove();
      delete badge.rmSet;
      if (hadLabel === null) badge.removeAttribute("aria-label");
      else badge.setAttribute("aria-label", hadLabel);
      badge.classList.remove("rm-cart-badge");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A preview that opens on hover and on focus.
 *
 * Every hover behaviour here is also a focus behaviour, because a preview that
 * only exists under a pointer does not exist on a keyboard or a touchscreen.
 * The trigger is a real button with `aria-expanded` and `aria-controls`, so the
 * panel is announced as a thing that opened rather than as content that
 * appeared out of nowhere.
 *
 * The close is delayed by a grace period. The pointer has to cross a gap
 * between the trigger and the panel, and a preview that shuts the instant the
 * cursor leaves the button is a preview nobody can reach. Escape closes it and
 * returns focus to the trigger.
 *
 *   <div data-rm-mini-cart>
 *     <button aria-controls="peek">Basket</button>
 *     <div id="peek">…</div>
 *   </div>
 */
export function miniCart(target = "[data-rm-mini-cart]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { delay = 220, duration = 240 } = options;
  const cleanups = [];

  for (const holder of holders) {
    const trigger = holder.querySelector("button");
    if (!trigger) continue;
    const wantedId = trigger.getAttribute("aria-controls");
    const panel = wantedId ? document.getElementById(wantedId) : holder.querySelector(":scope > :not(button)");
    if (!panel) continue;

    const madeId = !panel.id;
    if (madeId) panel.id = uid("rm-mini-cart");
    // Two separate facts: whether the id was minted here, and whether the
    // trigger already pointed at something. A panel that arrived with its own
    // id would otherwise leave `aria-controls` behind for good.
    const hadControls = trigger.getAttribute("aria-controls");
    trigger.setAttribute("aria-controls", panel.id);
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-haspopup", "true");

    holder.classList.add("rm-mini-cart");
    panel.classList.add("rm-mini-cart-panel");
    panel.hidden = true;

    const grace = dataNumber(holder, "rmDelay", delay);
    let timer = 0;

    const open = () => {
      clearTimeout(timer);
      if (!panel.hidden) return;
      panel.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      if (prefersReducedMotion()) return;
      panel.animate(
        [{ opacity: 0, transform: "translateY(-8px) scale(0.98)" }, { opacity: 1, transform: "none" }],
        { duration, easing: EASE.out },
      );
    };

    const close = () => {
      clearTimeout(timer);
      if (panel.hidden) return;
      panel.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
    };

    /*
     * The pair, not just the holder.
     *
     * `aria-controls` may point at a panel that lives elsewhere in the document
     * — a popover parked at the end of the body, so it is not clipped by a
     * header's `overflow`. Every handler therefore reasons about both boxes: a
     * pointer heading from the trigger into the panel cancels the close timer
     * instead of watching it run out, focus landing inside the panel does not
     * read as focus leaving, and Escape is bound to the document so it arrives
     * wherever focus happens to be sitting.
     */
    const inside = (node) => Boolean(node) && (holder.contains(node) || panel.contains(node));

    const soon = () => { clearTimeout(timer); timer = setTimeout(close, grace); };
    const onEnter = () => open();
    const onLeave = () => soon();
    const onFocusIn = () => open();
    const onFocusOut = (event) => { if (!inside(event.relatedTarget)) close(); };
    const onClick = (event) => { event.preventDefault(); if (panel.hidden) open(); else close(); };
    const onKey = (event) => {
      if (event.key !== "Escape" || panel.hidden) return;
      event.preventDefault();
      close();
      trigger.focus();
    };

    holder.addEventListener("pointerenter", onEnter);
    holder.addEventListener("pointerleave", onLeave);
    holder.addEventListener("focusin", onFocusIn);
    holder.addEventListener("focusout", onFocusOut);
    panel.addEventListener("pointerenter", onEnter);
    panel.addEventListener("pointerleave", onLeave);
    panel.addEventListener("focusin", onFocusIn);
    panel.addEventListener("focusout", onFocusOut);
    trigger.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);

    cleanups.push(() => {
      clearTimeout(timer);
      holder.removeEventListener("pointerenter", onEnter);
      holder.removeEventListener("pointerleave", onLeave);
      holder.removeEventListener("focusin", onFocusIn);
      holder.removeEventListener("focusout", onFocusOut);
      panel.removeEventListener("pointerenter", onEnter);
      panel.removeEventListener("pointerleave", onLeave);
      panel.removeEventListener("focusin", onFocusIn);
      panel.removeEventListener("focusout", onFocusOut);
      trigger.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
      trigger.removeAttribute("aria-expanded");
      trigger.removeAttribute("aria-haspopup");
      if (hadControls === null) trigger.removeAttribute("aria-controls");
      else trigger.setAttribute("aria-controls", hadControls);
      if (madeId) panel.removeAttribute("id");
      panel.hidden = false;
      panel.classList.remove("rm-mini-cart-panel");
      holder.classList.remove("rm-mini-cart");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Progress towards a threshold, with the gap in words.
 *
 * A real `role="progressbar"`, and the part that matters is `aria-valuetext`:
 * "£14.00 to go for free delivery" is the message, while `aria-valuenow` alone
 * would announce "62" and mean nothing. The fill is a `scaleX` from the left
 * edge rather than a width, so the bar animates on the compositor and cannot
 * reflow the row it lives in.
 *
 * The threshold moment gets one pulse and one polite announcement, not a
 * repeated celebration on every subsequent change — the usual version re-fires
 * its confetti each time a quantity nudges upward.
 *
 *   <div data-rm-free-shipping data-rm-threshold="50" data-rm-total="36"></div>
 */
export function freeShippingBar(target = "[data-rm-free-shipping]", options = {}) {
  const bars = resolveElements(target);
  if (!bars.length) return () => {};

  const { threshold = 50, currency = "GBP", label = "Free delivery progress" } = options;
  const cleanups = [];

  for (const bar of bars) {
    const goal = Math.max(0.01, dataNumber(bar, "rmThreshold", threshold));
    const money3 = dataString(bar, "rmCurrency", currency);
    bar.classList.add("rm-free-shipping");

    const note = document.createElement("p");
    note.className = "rm-free-shipping-note";
    const track = document.createElement("div");
    track.className = "rm-free-shipping-track";
    track.setAttribute("role", "progressbar");
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", String(goal));
    track.setAttribute("aria-label", dataString(bar, "rmLabel", label));
    const fill = document.createElement("i");
    track.appendChild(fill);
    bar.append(note, track);
    const said = speaker(bar, "polite");

    let reached = false;
    const set = (amount) => {
      const spent = Math.max(0, amount);
      const left = Math.max(0, goal - spent);
      const ratio = clamp(spent / goal, 0, 1);
      track.style.setProperty("--rm-free-shipping-fill", String(ratio));
      track.setAttribute("aria-valuenow", String(Math.round(spent * 100) / 100));
      const sentence = left > 0
        ? `${money(left, money3)} to go for free delivery`
        : "Free delivery unlocked";
      track.setAttribute("aria-valuetext", sentence);
      note.textContent = sentence;
      bar.classList.toggle("is-reached", left === 0);

      if (left === 0 && !reached) {
        reached = true;
        said.textContent = sentence;
        if (!prefersReducedMotion()) {
          bar.animate(
            [{ transform: "scale(1)" }, { transform: "scale(1.02)" }, { transform: "scale(1)" }],
            { duration: 520, easing: EASE.out },
          );
        }
      } else if (left > 0) {
        reached = false;
      }
    };

    set(dataNumber(bar, "rmTotal", 0));
    const onTotal = (event) => set(event.detail?.subtotal ?? 0);
    document.addEventListener(CART_TOTAL, onTotal);
    bar.rmSet = set;

    cleanups.push(() => {
      document.removeEventListener(CART_TOTAL, onTotal);
      note.remove();
      track.remove();
      said.remove();
      delete bar.rmSet;
      bar.classList.remove("rm-free-shipping", "is-reached");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A code field with an applied and a rejected state.
 *
 * The two outcomes are announced differently on purpose: a code that worked is
 * polite news, a code that was rejected is an `alert`, because it is a thing
 * the visitor must act on before they can continue. The field keeps focus after
 * a rejection with `aria-invalid` set and the message wired through
 * `aria-describedby`, so the reason is read as part of the field rather than as
 * a stray red sentence somewhere above it.
 *
 * The shake is a transform and nothing else, and it is skipped entirely under
 * reduced motion — the message does all the work either way. The accepted codes
 * are a demonstration list on the element; real validation belongs on a server.
 *
 *   <form data-rm-coupon data-rm-codes="RAGE10,SPRINGDEMO"></form>
 */
export function couponField(target = "[data-rm-coupon]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { codes = "", label = "Discount code", placeholder = "Enter a code" } = options;
  const cleanups = [];

  for (const holder of holders) {
    const accepted = dataString(holder, "rmCodes", codes)
      .split(",").map((code) => code.trim().toUpperCase()).filter(Boolean);
    holder.classList.add("rm-coupon");

    const row = document.createElement("div");
    row.className = "rm-coupon-row";

    const name = document.createElement("label");
    name.className = "rm-coupon-label";
    name.textContent = dataString(holder, "rmLabel", label);
    const field = document.createElement("input");
    field.type = "text";
    field.className = "rm-coupon-field";
    field.id = uid("rm-coupon");
    field.autocomplete = "off";
    field.placeholder = dataString(holder, "rmPlaceholder", placeholder);
    name.htmlFor = field.id;

    const apply = document.createElement("button");
    apply.type = "submit";
    apply.className = "rm-coupon-apply";
    apply.textContent = "Apply";

    const message = document.createElement("p");
    message.className = "rm-coupon-message";
    message.id = uid("rm-coupon-message");
    message.setAttribute("role", "status");
    message.setAttribute("aria-live", "polite");
    field.setAttribute("aria-describedby", message.id);

    row.append(name, field, apply);
    holder.append(row, message);

    const clear = document.createElement("button");
    clear.type = "button";
    clear.className = "rm-coupon-clear";
    clear.textContent = "Remove code";
    clear.hidden = true;
    holder.appendChild(clear);

    const reject = (code) => {
      holder.classList.remove("is-applied");
      holder.classList.add("is-rejected");
      field.setAttribute("aria-invalid", "true");
      // An error must interrupt; anything else must not.
      message.setAttribute("aria-live", "assertive");
      message.setAttribute("role", "alert");
      message.textContent = `${code} is not a code we recognise.`;
      field.focus();
      if (prefersReducedMotion()) return;
      row.animate(
        [
          { transform: "translateX(0)" }, { transform: "translateX(-6px)" },
          { transform: "translateX(5px)" }, { transform: "translateX(-3px)" },
          { transform: "translateX(0)" },
        ],
        { duration: 380, easing: EASE.out },
      );
    };

    const accept = (code) => {
      holder.classList.remove("is-rejected");
      holder.classList.add("is-applied");
      field.removeAttribute("aria-invalid");
      message.setAttribute("aria-live", "polite");
      message.setAttribute("role", "status");
      message.textContent = `${code} applied.`;
      clear.hidden = false;
      field.disabled = true;
      apply.disabled = true;
      if (prefersReducedMotion()) return;
      message.animate(
        [{ opacity: 0, transform: "translateY(-6px)" }, { opacity: 1, transform: "none" }],
        { duration: 280, easing: EASE.out },
      );
    };

    const onSubmit = (event) => {
      event.preventDefault();
      const code = field.value.trim().toUpperCase();
      if (!code) { reject("An empty code"); return; }
      if (accepted.includes(code)) accept(code);
      else reject(code);
    };

    const onClear = () => {
      holder.classList.remove("is-applied", "is-rejected");
      field.disabled = false;
      apply.disabled = false;
      field.value = "";
      message.textContent = "Code removed.";
      clear.hidden = true;
      field.focus();
    };

    // A real form submits on Enter for free. Mounted on anything else, Enter in
    // a text field does nothing at all, which is why so many coupon boxes can
    // only be used with the mouse — so the key is handled explicitly.
    const isForm = holder.tagName === "FORM";
    const onKey = (event) => { if (event.key === "Enter") onSubmit(event); };
    const onApply = (event) => { if (!isForm) onSubmit(event); };
    if (isForm) holder.addEventListener("submit", onSubmit);
    else field.addEventListener("keydown", onKey);
    apply.addEventListener("click", onApply);
    clear.addEventListener("click", onClear);

    cleanups.push(() => {
      if (isForm) holder.removeEventListener("submit", onSubmit);
      else field.removeEventListener("keydown", onKey);
      apply.removeEventListener("click", onApply);
      clear.removeEventListener("click", onClear);
      row.remove();
      message.remove();
      clear.remove();
      holder.classList.remove("rm-coupon", "is-applied", "is-rejected");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A multi-step form made of real fieldsets.
 *
 * Each step is a `<fieldset>` with a `<legend>`, which is what makes the group
 * announce itself when focus enters it. Moving on runs the browser's own
 * `checkValidity()` on that fieldset only, so nobody is told about a mistake on
 * a step they have not reached yet, and focus lands on the new step's legend
 * rather than staying on a Next button that has just moved.
 *
 * The tallest step is measured once and every step is given that minimum
 * height, so the page does not lurch as the form changes shape. That is a
 * layout property set a single time — never animated — and a `ResizeObserver`
 * re-measures it when the column width changes rather than on every frame.
 *
 *   <form data-rm-checkout-steps>
 *     <fieldset><legend>Contact</legend>…</fieldset>
 *     <fieldset><legend>Delivery</legend>…</fieldset>
 *   </form>
 */
export function checkoutSteps(target = "[data-rm-checkout-steps]", options = {}) {
  const forms = resolveElements(target);
  if (!forms.length) return () => {};

  const { duration = 320, label = "Checkout" } = options;
  const cleanups = [];

  for (const form of forms) {
    const steps = [...form.querySelectorAll(":scope > fieldset")];
    if (steps.length < 2) continue;

    form.classList.add("rm-checkout-steps");
    // Saved, not assumed. A form that already opted out of native validation
    // must still be opted out once this is unmounted.
    const hadNoValidate = form.noValidate;
    if (form.tagName === "FORM") form.noValidate = true;

    const rail = document.createElement("ol");
    rail.className = "rm-checkout-steps-rail";
    rail.setAttribute("aria-label", `${dataString(form, "rmLabel", label)} progress`);
    const marks = steps.map((step, i) => {
      const mark = document.createElement("li");
      mark.className = "rm-checkout-steps-mark";
      mark.textContent = step.querySelector("legend")?.textContent?.trim() ?? `Step ${i + 1}`;
      rail.appendChild(mark);
      return mark;
    });
    form.prepend(rail);

    const nav = document.createElement("div");
    nav.className = "rm-checkout-steps-nav";
    const back = document.createElement("button");
    back.type = "button";
    back.className = "rm-checkout-steps-back";
    back.textContent = "Back";
    const next = document.createElement("button");
    next.type = "button";
    next.className = "rm-checkout-steps-next";
    next.textContent = "Continue";
    nav.append(back, next);
    form.appendChild(nav);
    const said = speaker(form, "polite");

    let at = clamp(dataNumber(form, "rmStep", 1) - 1, 0, steps.length - 1);

    const show = (index, moveFocus = true) => {
      at = clamp(index, 0, steps.length - 1);
      steps.forEach((step, i) => {
        step.hidden = i !== at;
        // Hidden is enough for the tree, but inert also stops a stray
        // programmatic focus landing on a field nobody can see.
        step.inert = i !== at;
      });
      marks.forEach((mark, i) => {
        mark.classList.toggle("is-done", i < at);
        mark.classList.toggle("is-current", i === at);
        if (i === at) mark.setAttribute("aria-current", "step");
        else mark.removeAttribute("aria-current");
      });
      back.disabled = at === 0;
      next.textContent = at === steps.length - 1 ? "Place order" : "Continue";

      const legend = steps[at].querySelector("legend");
      said.textContent = `Step ${at + 1} of ${steps.length}, ${legend?.textContent?.trim() ?? ""}`;
      if (moveFocus && legend) {
        legend.tabIndex = -1;
        legend.focus();
      }
      if (prefersReducedMotion()) return;
      steps[at].animate(
        [{ opacity: 0, transform: "translateX(18px)" }, { opacity: 1, transform: "none" }],
        { duration, easing: EASE.out },
      );
    };

    const onNext = () => {
      const step = steps[at];
      const fields = [...step.querySelectorAll("input, select, textarea")];
      const bad = fields.find((field) => !field.checkValidity());
      if (bad) {
        bad.setAttribute("aria-invalid", "true");
        bad.focus();
        said.textContent = `${bad.labels?.[0]?.textContent?.trim() ?? "A field"} needs attention.`;
        return;
      }
      fields.forEach((field) => field.removeAttribute("aria-invalid"));
      if (at === steps.length - 1) { said.textContent = "Order placed. This is a demonstration."; return; }
      show(at + 1);
    };
    const onBack = () => show(at - 1);
    next.addEventListener("click", onNext);
    back.addEventListener("click", onBack);

    // One static measurement of the tallest step, so the form never resizes.
    let lastWidth = 0;
    const measure = () => {
      let tallest = 0;
      for (const step of steps) {
        const was = step.hidden;
        step.hidden = false;
        tallest = Math.max(tallest, step.offsetHeight);
        step.hidden = was;
      }
      form.style.setProperty("--rm-checkout-steps-min", `${tallest}px`);
    };
    const sizer = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width);
      if (width === lastWidth) return;
      lastWidth = width;
      measure();
    });
    sizer.observe(form);

    show(at, false);
    measure();
    form.rmStep = (index) => show(index - 1);

    cleanups.push(() => {
      sizer.disconnect();
      next.removeEventListener("click", onNext);
      back.removeEventListener("click", onBack);
      rail.remove();
      nav.remove();
      said.remove();
      steps.forEach((step) => {
        step.hidden = false;
        step.inert = false;
        // The legend was only made focusable so a step change could land on it,
        // and a field was only marked invalid by this component's own check.
        step.querySelector("legend")?.removeAttribute("tabindex");
        step.querySelectorAll("[aria-invalid]").forEach((field) => field.removeAttribute("aria-invalid"));
      });
      form.style.removeProperty("--rm-checkout-steps-min");
      form.noValidate = hadNoValidate;
      delete form.rmStep;
      form.classList.remove("rm-checkout-steps");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * The figures, foldable, without a height animation.
 *
 * The disclosure button lives inside the heading, which is the pattern that
 * keeps the heading in the document outline while making it operable. Opening
 * and closing does not animate a height: the panel is shown or hidden outright
 * and everything below it is moved back into place with a FLIP, which is both
 * cheaper and honest about the fact that the page really did change size.
 *
 * The figures themselves are a `<dl>`, so each label is bound to its amount.
 * A grid of divs looks identical and reads as a wall of unattached numbers.
 *
 *   <section data-rm-order-summary><h2>Order summary</h2>…</section>
 */
export function orderSummary(target = "[data-rm-order-summary]", options = {}) {
  const panels = resolveElements(target);
  if (!panels.length) return () => {};

  const { open = true, duration = 300 } = options;
  const cleanups = [];

  for (const panel of panels) {
    const heading = panel.querySelector("h1,h2,h3,h4,h5,h6");
    if (!heading) continue;

    panel.classList.add("rm-order-summary");
    const body = document.createElement("div");
    body.className = "rm-order-summary-body";
    body.id = uid("rm-order-summary");
    const moved = [...panel.children].filter((node) => node !== heading);
    body.append(...moved);
    panel.appendChild(body);

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "rm-order-summary-toggle";
    toggle.setAttribute("aria-controls", body.id);
    const words = heading.textContent.trim();
    toggle.textContent = words;
    heading.textContent = "";
    heading.appendChild(toggle);

    const chevron = document.createElement("i");
    chevron.className = "rm-order-summary-chevron";
    chevron.setAttribute("aria-hidden", "true");
    toggle.appendChild(chevron);

    let shown = dataString(panel, "rmOpen", String(open)) !== "false";

    const draw = (next, animated) => {
      const below = [];
      for (let node = panel.nextElementSibling; node; node = node.nextElementSibling) below.push(node);
      const move = () => {
        shown = next;
        body.hidden = !shown;
        toggle.setAttribute("aria-expanded", String(shown));
        panel.classList.toggle("is-open", shown);
      };
      if (!animated) { move(); return; }
      flip(below, move, duration);
      if (shown && !prefersReducedMotion()) {
        body.animate(
          [{ opacity: 0, transform: "translateY(-8px)" }, { opacity: 1, transform: "none" }],
          { duration, easing: EASE.out },
        );
      }
    };

    const onToggle = () => draw(!shown, true);
    toggle.addEventListener("click", onToggle);
    draw(shown, false);
    panel.rmToggle = (next) => draw(next ?? !shown, true);

    cleanups.push(() => {
      toggle.removeEventListener("click", onToggle);
      heading.textContent = words;
      panel.append(...moved);
      body.remove();
      delete panel.rmToggle;
      panel.classList.remove("rm-order-summary", "is-open");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Real radios that choose a method and nothing else.
 *
 * This picks a *method* — the same kind of choice as a delivery speed. It never
 * asks for, holds or checks a card number, a CVV or a bank detail, and the
 * names in any demonstration are invented. Anything that needs real card data
 * belongs in a payment provider's own hosted field, never in a component kit.
 *
 * Underneath the card styling there is a genuine radio group, so arrow keys
 * move between options, the group announces "2 of 4", and a form submits the
 * chosen value with no JavaScript at all. The selected card is marked by an
 * indicator that FLIPs from the previous card to the new one, so the eye
 * follows the choice instead of hunting for which box changed colour — and the
 * choice is never carried by colour alone.
 *
 *   <fieldset data-rm-payment-methods>
 *     <legend>How would you like to pay?</legend>
 *     <label><input type="radio" name="method" value="card"> Card</label>
 *   </fieldset>
 */
export function paymentMethods(target = "[data-rm-payment-methods]", options = {}) {
  const groups = resolveElements(target);
  if (!groups.length) return () => {};

  const { label = "Payment method", duration = 320 } = options;
  const cleanups = [];

  for (const group of groups) {
    const radios = [...group.querySelectorAll("input[type=radio]")];
    if (!radios.length) continue;

    group.classList.add("rm-payment-methods");
    const hadLabel = group.getAttribute("aria-label");
    if (group.tagName !== "FIELDSET" && !group.querySelector("legend")) {
      group.setAttribute("role", "radiogroup");
      group.setAttribute("aria-label", dataString(group, "rmLabel", label));
    }

    const cards = radios.map((radio) => radio.closest("label") ?? radio.parentElement);
    cards.forEach((card) => card?.classList.add("rm-payment-methods-card"));
    const said = speaker(group, "polite");

    const marker = document.createElement("i");
    marker.className = "rm-payment-methods-marker";
    marker.setAttribute("aria-hidden", "true");
    marker.hidden = true;
    group.appendChild(marker);

    const place = (card, animated) => {
      if (!card) return;
      const was = marker.getBoundingClientRect();
      const box = card.getBoundingClientRect();
      const home = group.getBoundingClientRect();
      marker.hidden = false;
      marker.style.setProperty("--rm-payment-marker-x", `${box.left - home.left}px`);
      marker.style.setProperty("--rm-payment-marker-y", `${box.top - home.top}px`);
      marker.style.setProperty("--rm-payment-marker-w", `${box.width}px`);
      marker.style.setProperty("--rm-payment-marker-h", `${box.height}px`);
      if (!animated || prefersReducedMotion() || !was.width) return;
      const now = marker.getBoundingClientRect();
      marker.animate(
        [
          { transform: `translate(${was.left - now.left}px, ${was.top - now.top}px)` },
          { transform: "none" },
        ],
        { duration, easing: EASE.out },
      );
    };

    const sync = (animated) => {
      const chosen = radios.findIndex((radio) => radio.checked);
      cards.forEach((card, i) => card?.classList.toggle("is-chosen", i === chosen));
      if (chosen < 0) { marker.hidden = true; return; }
      place(cards[chosen], animated);
      const word = cards[chosen]?.textContent?.trim() ?? radios[chosen].value;
      said.textContent = `${word} selected`;
    };

    const onChange = () => sync(true);
    group.addEventListener("change", onChange);

    const sizer = new ResizeObserver(() => sync(false));
    sizer.observe(group);
    sync(false);

    cleanups.push(() => {
      sizer.disconnect();
      group.removeEventListener("change", onChange);
      marker.remove();
      said.remove();
      cards.forEach((card) => card?.classList.remove("rm-payment-methods-card", "is-chosen"));
      group.classList.remove("rm-payment-methods");
      group.removeAttribute("role");
      if (hadLabel === null) group.removeAttribute("aria-label");
      else group.setAttribute("aria-label", hadLabel);
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A real form with a real error summary.
 *
 * The browser's own validation bubble appears next to one field, vanishes on
 * the next click and is announced inconsistently, which is why every serious
 * checkout replaces it. Here `novalidate` turns it off and the errors are
 * gathered into a summary at the top of the form: a `role="alert"` list of
 * links, each pointing at the field it describes, with focus moved to the
 * summary so the whole list is read at once.
 *
 * Each field also gets `aria-invalid` and an `aria-describedby` pointing at its
 * own message, so the reason is available again when the visitor arrives at the
 * field. The error clears as soon as the field is edited, because leaving a red
 * border on something somebody has just fixed teaches them to ignore red.
 *
 *   <form data-rm-address-form>
 *     <label for="line1">Address line 1</label>
 *     <input id="line1" name="line1" required>
 *   </form>
 */
export function addressForm(target = "[data-rm-address-form]", options = {}) {
  const forms = resolveElements(target);
  if (!forms.length) return () => {};

  const { label = "There is a problem" } = options;
  const cleanups = [];

  for (const form of forms) {
    form.classList.add("rm-address-form");
    const hadNoValidate = form.noValidate;
    if (form.tagName === "FORM") form.noValidate = true;

    const summary = document.createElement("div");
    summary.className = "rm-address-form-summary";
    summary.tabIndex = -1;
    summary.hidden = true;
    const title = document.createElement("h2");
    title.className = "rm-address-form-summary-title";
    title.textContent = dataString(form, "rmSummary", label);
    const list = document.createElement("ul");
    summary.append(title, list);
    form.prepend(summary);
    const said = speaker(form, "polite");

    const fields = [...form.querySelectorAll("input, select, textarea")]
      .filter((field) => field.type !== "hidden" && field.type !== "submit");

    /*
     * What each field looked like before this touched it.
     *
     * A field can already have a description — a hint, a format example — and
     * overwriting `aria-describedby` with an error message deletes it
     * permanently. So the original is kept, the error id is appended to it
     * rather than replacing it, and the cleanup puts the original back.
     */
    const was = new Map(fields.map((field) => [field, {
      describedBy: field.getAttribute("aria-describedby"),
      hadId: Boolean(field.id),
    }]));

    const noteFor = (field) => {
      if (!field.id) field.id = uid("rm-address");
      const existing = form.querySelector(`#${CSS.escape(`${field.id}-note`)}`);
      if (existing) return existing;
      const note = document.createElement("p");
      note.className = "rm-address-form-note";
      note.id = `${field.id}-note`;
      field.insertAdjacentElement("afterend", note);
      return note;
    };

    const clearOne = (field) => {
      field.removeAttribute("aria-invalid");
      field.classList.remove("is-wrong");
      const note = form.querySelector(`#${CSS.escape(`${field.id}-note`)}`);
      if (note) note.textContent = "";
    };

    const check = () => {
      const bad = [];
      for (const field of fields) {
        if (field.checkValidity()) { clearOne(field); continue; }
        const note = noteFor(field);
        const word = field.labels?.[0]?.textContent?.trim() ?? field.name ?? "This field";
        note.textContent = field.validationMessage || `${word} is required.`;
        field.setAttribute("aria-invalid", "true");
        const before = was.get(field)?.describedBy;
        field.setAttribute("aria-describedby", before ? `${before} ${note.id}` : note.id);
        field.classList.add("is-wrong");
        bad.push([field, word, note.textContent]);
      }

      list.replaceChildren(...bad.map(([field, word, why]) => {
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href = `#${field.id}`;
        link.textContent = `${word}: ${why}`;
        link.addEventListener("click", (event) => { event.preventDefault(); field.focus(); });
        item.appendChild(link);
        return item;
      }));

      summary.hidden = bad.length === 0;
      if (bad.length) {
        summary.setAttribute("role", "alert");
        summary.focus();
        if (!prefersReducedMotion()) {
          summary.animate(
            [{ opacity: 0, transform: "translateY(-8px)" }, { opacity: 1, transform: "none" }],
            { duration: 280, easing: EASE.out },
          );
        }
      } else {
        summary.removeAttribute("role");
      }
      return bad.length === 0;
    };

    const onSubmit = (event) => {
      event.preventDefault();
      if (check()) said.textContent = "Address saved. This is a demonstration form.";
    };
    const onInput = (event) => { if (fields.includes(event.target)) clearOne(event.target); };
    form.addEventListener("submit", onSubmit);
    form.addEventListener("input", onInput);
    form.rmCheck = check;

    cleanups.push(() => {
      form.removeEventListener("submit", onSubmit);
      form.removeEventListener("input", onInput);
      fields.forEach((field) => {
        clearOne(field);
        form.querySelector(`#${CSS.escape(`${field.id}-note`)}`)?.remove();
        const before = was.get(field);
        if (before?.describedBy) field.setAttribute("aria-describedby", before.describedBy);
        else field.removeAttribute("aria-describedby");
        if (!before?.hadId) field.removeAttribute("id");
      });
      summary.remove();
      said.remove();
      form.noValidate = hadNoValidate;
      delete form.rmCheck;
      form.classList.remove("rm-address-form");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Speeds and prices, announced when they change.
 *
 * Another real radio group, because the arrow-key behaviour, the "3 of 3" and
 * the form submission all come free with the right element and have to be
 * rebuilt badly with the wrong one. What this adds is the consequence: choosing
 * a speed changes the arrival date and the price, and both are announced
 * politely, since a visitor who cannot see the card highlight otherwise has no
 * idea that anything happened.
 *
 * The dates are computed from today rather than hard-coded, so a demonstration
 * never shows a delivery date in the past.
 *
 *   <fieldset data-rm-delivery-options data-rm-currency="GBP">
 *     <legend>Delivery</legend>
 *     <label><input type="radio" name="ship" data-rm-price="0" data-rm-days="5"> Standard</label>
 *   </fieldset>
 */
export function deliveryOptions(target = "[data-rm-delivery-options]", options = {}) {
  const groups = resolveElements(target);
  if (!groups.length) return () => {};

  const { currency = "GBP", label = "Delivery speed" } = options;
  const cleanups = [];

  for (const group of groups) {
    const radios = [...group.querySelectorAll("input[type=radio]")];
    if (!radios.length) continue;

    const money3 = dataString(group, "rmCurrency", currency);
    group.classList.add("rm-delivery-options");
    const hadLabel = group.getAttribute("aria-label");
    if (group.tagName !== "FIELDSET" && !group.querySelector("legend")) {
      group.setAttribute("role", "radiogroup");
      group.setAttribute("aria-label", dataString(group, "rmLabel", label));
    }

    const said = speaker(group, "polite");
    const cards = radios.map((radio) => radio.closest("label") ?? radio.parentElement);
    cards.forEach((card) => card?.classList.add("rm-delivery-options-card"));

    const dates = radios.map((radio) => {
      // `data-rm-days`, not `data-rm-step`: this is a number of days, and a
      // checkout form a few sections up reads `data-rm-step` as which step to
      // start on. One attribute meaning two unrelated things inside one module
      // is a trap for anyone reading the markup back.
      const days = dataNumber(radio, "rmDays", 3);
      const when = new Date();
      when.setDate(when.getDate() + days);
      const stamp = when.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
      const cost = dataNumber(radio, "rmPrice", 0);
      const eta = document.createElement("span");
      eta.className = "rm-delivery-options-eta";
      eta.textContent = `Arrives ${stamp} · ${cost > 0 ? money(cost, money3) : "Free"}`;
      radio.closest("label")?.appendChild(eta);
      return { stamp, cost };
    });

    const sync = (announce) => {
      const chosen = radios.findIndex((radio) => radio.checked);
      cards.forEach((card, i) => card?.classList.toggle("is-chosen", i === chosen));
      if (chosen < 0) return;
      const { stamp, cost } = dates[chosen];
      const word = radios[chosen].closest("label")?.firstChild?.textContent?.trim() || radios[chosen].value;
      group.dispatchEvent(new CustomEvent(CART_CHANGE, {
        bubbles: true,
        detail: { delivery: word, cost, arrives: stamp, currency: money3 },
      }));
      if (!announce) return;
      said.textContent = `${word}. Arrives ${stamp}. ${cost > 0 ? money(cost, money3) : "Free"}.`;
      if (prefersReducedMotion()) return;
      cards[chosen]?.animate(
        [{ transform: "scale(0.985)" }, { transform: "none" }],
        { duration: 260, easing: EASE.out },
      );
    };

    const onChange = () => sync(true);
    group.addEventListener("change", onChange);
    sync(false);

    cleanups.push(() => {
      group.removeEventListener("change", onChange);
      group.querySelectorAll(".rm-delivery-options-eta").forEach((eta) => eta.remove());
      said.remove();
      cards.forEach((card) => card?.classList.remove("rm-delivery-options-card", "is-chosen"));
      group.classList.remove("rm-delivery-options");
      group.removeAttribute("role");
      if (hadLabel === null) group.removeAttribute("aria-label");
      else group.setAttribute("aria-label", hadLabel);
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * An optional message, revealed without a jump.
 *
 * A checkbox that shows a textarea, done properly: the checkbox carries
 * `aria-expanded` and `aria-controls`, the textarea is genuinely removed from
 * the tab order when it is hidden, and everything below the box is FLIPped back
 * into place rather than having its height animated.
 *
 * The character counter is the interesting part. Announcing every keystroke
 * makes a live region unbearable, so this one is silent until the last stretch
 * and then speaks only at intervals — the count is always visible, but it is
 * only spoken when it has become news.
 *
 *   <div data-rm-gift-note data-rm-max="200"></div>
 */
export function giftNote(target = "[data-rm-gift-note]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { max = 200, label = "Add a gift message", placeholder = "Your message" } = options;
  const cleanups = [];

  for (const holder of holders) {
    const limit = dataNumber(holder, "rmMax", max);
    holder.classList.add("rm-gift-note");

    const row = document.createElement("p");
    row.className = "rm-gift-note-row";
    const box = document.createElement("input");
    box.type = "checkbox";
    box.id = uid("rm-gift-note");
    box.className = "rm-gift-note-box";
    const name = document.createElement("label");
    name.htmlFor = box.id;
    name.textContent = dataString(holder, "rmLabel", label);
    row.append(box, name);

    const panel = document.createElement("div");
    panel.className = "rm-gift-note-panel";
    panel.id = `${box.id}-panel`;
    const note = document.createElement("textarea");
    note.className = "rm-gift-note-text";
    note.id = `${box.id}-text`;
    note.maxLength = limit;
    note.rows = 3;
    note.placeholder = dataString(holder, "rmPlaceholder", placeholder);
    note.setAttribute("aria-label", dataString(holder, "rmLabel", label));
    const tally = document.createElement("p");
    tally.className = "rm-gift-note-tally";
    tally.id = `${box.id}-tally`;
    note.setAttribute("aria-describedby", tally.id);
    panel.append(note, tally);

    holder.append(row, panel);
    const said = speaker(holder, "polite");

    box.setAttribute("aria-controls", panel.id);
    box.setAttribute("aria-expanded", "false");
    panel.hidden = true;

    const count = () => {
      const left = limit - note.value.length;
      tally.textContent = `${left} characters left`;
      // Only news gets announced: the last stretch, and then in steps.
      if (left <= 20 && left % 5 === 0) said.textContent = `${left} characters left`;
    };

    const onToggle = () => {
      const below = [];
      for (let node = holder.nextElementSibling; node; node = node.nextElementSibling) below.push(node);
      flip(below, () => {
        panel.hidden = !box.checked;
        box.setAttribute("aria-expanded", String(box.checked));
      });
      if (box.checked) {
        note.focus();
        if (!prefersReducedMotion()) {
          panel.animate(
            [{ opacity: 0, transform: "translateY(-10px)" }, { opacity: 1, transform: "none" }],
            { duration: 300, easing: EASE.out },
          );
        }
      }
    };

    box.addEventListener("change", onToggle);
    note.addEventListener("input", count);
    count();

    cleanups.push(() => {
      box.removeEventListener("change", onToggle);
      note.removeEventListener("input", count);
      row.remove();
      panel.remove();
      said.remove();
      holder.classList.remove("rm-gift-note");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * The success state, focused and announced.
 *
 * The end of a checkout is the one moment where moving focus is correct: the
 * page has effectively changed, so focus goes to the confirmation heading, and
 * the panel is a polite `role="status"` so the outcome is read even to somebody
 * who was already looking elsewhere.
 *
 * The tick draws itself with `stroke-dashoffset`, which is geometry rather than
 * layout, and under reduced motion it is simply already drawn. A success state
 * that depends on an animation finishing is a success state that is blank for
 * anyone who asked for less movement. The reference shown is deliberately
 * fictional.
 *
 *   <div data-rm-order-confirm hidden><h2>Order placed</h2></div>
 *   panel.rmShow("RM-DEMO-4821");
 */
export function orderConfirm(target = "[data-rm-order-confirm]", options = {}) {
  const panels = resolveElements(target);
  if (!panels.length) return () => {};

  const { duration = 720 } = options;
  const cleanups = [];

  for (const panel of panels) {
    const hadLive = panel.getAttribute("aria-live");
    panel.classList.add("rm-order-confirm");
    panel.setAttribute("role", "status");
    panel.setAttribute("aria-live", "polite");

    const tick = document.createElement("span");
    tick.className = "rm-order-confirm-tick";
    tick.setAttribute("aria-hidden", "true");
    tick.innerHTML =
      '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" ' +
      'stroke-width="2.5"/><path d="M14 25l7 7 13-15" fill="none" stroke="currentColor" ' +
      'stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    panel.prepend(tick);

    const reference = document.createElement("p");
    reference.className = "rm-order-confirm-reference";
    panel.appendChild(reference);

    const heading = panel.querySelector("h1,h2,h3,h4,h5,h6");
    if (heading) heading.tabIndex = -1;

    /*
     * The dash is applied here, not in the stylesheet.
     *
     * A `stroke-dasharray` in CSS means the tick is an invisible line before
     * any script has run — the same mistake as starting at opacity 0, and with
     * the same result if the script never arrives. So the mark is drawn in full
     * by default and only cut into a dash at the moment something is going to
     * animate it back.
     */
    const play = () => {
      const ring = tick.querySelector("circle");
      const mark = tick.querySelector("path");
      if (prefersReducedMotion() || !ring || !mark) return;
      ring.style.strokeDasharray = "140";
      mark.style.strokeDasharray = "34";
      ring.animate(
        [{ strokeDashoffset: 140 }, { strokeDashoffset: 0 }],
        { duration: duration * 0.6, easing: EASE.out, fill: "forwards" },
      );
      mark.animate(
        [{ strokeDashoffset: 34 }, { strokeDashoffset: 0 }],
        { duration: duration * 0.5, delay: duration * 0.4, easing: EASE.out, fill: "forwards" },
      );
    };

    panel.rmShow = (order = dataString(panel, "rmOrder", "RM-DEMO-0000")) => {
      reference.textContent = `Reference ${order}`;
      panel.hidden = false;
      heading?.focus();
      play();
    };

    if (!panel.hidden) { reference.textContent = `Reference ${dataString(panel, "rmOrder", "RM-DEMO-0000")}`; play(); }

    cleanups.push(() => {
      tick.remove();
      reference.remove();
      delete panel.rmShow;
      if (heading) heading.removeAttribute("tabindex");
      panel.classList.remove("rm-order-confirm");
      panel.removeAttribute("role");
      if (hadLive === null) panel.removeAttribute("aria-live");
      else panel.setAttribute("aria-live", hadLive);
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A stepped tracker with words, not just ticks.
 *
 * Every stage renders its state as text — done, in progress, still to come —
 * because a row of coloured circles is a picture of a status rather than a
 * status. The current stage carries `aria-current="step"`, which is what lets
 * assistive technology jump straight to where the parcel actually is.
 *
 * The connecting line fills with a `scaleX` from its left edge, so the tracker
 * animates without touching layout and a change of stage cannot nudge the
 * addresses printed beneath it.
 *
 *   <ol data-rm-order-tracking data-rm-stage="2">
 *     <li>Ordered</li><li>Packed</li><li>Out for delivery</li><li>Delivered</li>
 *   </ol>
 */
export function orderTracking(target = "[data-rm-order-tracking]", options = {}) {
  const trackers = resolveElements(target);
  if (!trackers.length) return () => {};

  const { stage = 1, label = "Order progress" } = options;
  const WORDS = ["done", "in progress", "still to come"];
  const cleanups = [];

  for (const tracker of trackers) {
    const stages = [...tracker.children];
    if (!stages.length) continue;

    const hadLabel = tracker.getAttribute("aria-label");
    tracker.classList.add("rm-order-tracking");
    tracker.setAttribute("aria-label", dataString(tracker, "rmLabel", label));

    const line = document.createElement("i");
    line.className = "rm-order-tracking-line";
    line.setAttribute("aria-hidden", "true");
    tracker.prepend(line);
    const said = speaker(tracker, "polite");

    // Read the stage names before anything is added to them, so the
    // announcement says "Packed" rather than "Packed — in progress".
    const names = stages.map((step) => step.textContent.trim());
    const states = stages.map((step) => {
      step.classList.add("rm-order-tracking-stage");
      const dot = document.createElement("i");
      dot.className = "rm-order-tracking-dot";
      dot.setAttribute("aria-hidden", "true");
      step.prepend(dot);
      const state = document.createElement("span");
      state.className = "rm-order-tracking-state";
      step.appendChild(state);
      return state;
    });

    let at = clamp(dataNumber(tracker, "rmStage", stage) - 1, 0, stages.length - 1);

    const draw = (announce) => {
      stages.forEach((step, i) => {
        const kind = i < at ? 0 : i === at ? 1 : 2;
        step.classList.toggle("is-done", kind === 0);
        step.classList.toggle("is-current", kind === 1);
        if (kind === 1) step.setAttribute("aria-current", "step");
        else step.removeAttribute("aria-current");
        states[i].textContent = ` — ${WORDS[kind]}`;
      });
      const ratio = stages.length > 1 ? at / (stages.length - 1) : 1;
      tracker.style.setProperty("--rm-order-tracking-fill", String(ratio));
      if (!announce) return;
      said.textContent = `${names[at]}, step ${at + 1} of ${stages.length}`;
    };

    draw(false);
    tracker.rmSet = (index) => { at = clamp(index - 1, 0, stages.length - 1); draw(true); };

    cleanups.push(() => {
      line.remove();
      said.remove();
      stages.forEach((step, i) => {
        step.firstElementChild?.remove();
        states[i].remove();
        step.classList.remove("rm-order-tracking-stage", "is-done", "is-current");
        step.removeAttribute("aria-current");
      });
      delete tracker.rmSet;
      tracker.style.removeProperty("--rm-order-tracking-fill");
      tracker.classList.remove("rm-order-tracking");
      if (hadLabel === null) tracker.removeAttribute("aria-label");
      else tracker.setAttribute("aria-label", hadLabel);
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A reason, a note and a fictional reference.
 *
 * A returns form is where a shop usually resorts to a `<div>` masquerading as a
 * dropdown. This is a `<fieldset>` of radios with a legend, and the free-text
 * box appears only for the reason that needs one — revealed with a FLIP, and
 * focused, so a keyboard user is not left wondering where the new field went.
 *
 * Submitting swaps the form for a confirmation and moves focus to it, then
 * makes the form itself `inert` so a stray Shift+Tab cannot wander back into
 * controls that no longer apply. The reference is obviously invented.
 *
 *   <form data-rm-return-request data-rm-reasons="Too small,Faulty,Other"></form>
 */
export function returnRequest(target = "[data-rm-return-request]", options = {}) {
  const forms = resolveElements(target);
  if (!forms.length) return () => {};

  const { reasons = "Too small,Not as described,Faulty,Other", label = "Why are you returning it?" } = options;
  const cleanups = [];

  for (const form of forms) {
    const words = dataString(form, "rmReasons", reasons).split(",").map((word) => word.trim()).filter(Boolean);
    if (!words.length) continue;

    form.classList.add("rm-return-request");
    const hadNoValidate = form.noValidate;
    if (form.tagName === "FORM") form.noValidate = true;

    const set = document.createElement("fieldset");
    set.className = "rm-return-request-set";
    const legend = document.createElement("legend");
    legend.textContent = dataString(form, "rmLabel", label);
    set.appendChild(legend);

    const group = uid("rm-return");
    const radios = words.map((word, i) => {
      const wrap = document.createElement("label");
      wrap.className = "rm-return-request-choice";
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = group;
      radio.value = word;
      radio.required = i === 0;
      wrap.append(radio, document.createTextNode(` ${word}`));
      set.appendChild(wrap);
      return radio;
    });

    const panel = document.createElement("div");
    panel.className = "rm-return-request-panel";
    panel.id = `${group}-panel`;
    const more = document.createElement("textarea");
    more.className = "rm-return-request-more";
    more.rows = 3;
    more.setAttribute("aria-label", "Tell us more");
    panel.appendChild(more);
    panel.hidden = true;

    const send = document.createElement("button");
    send.type = "submit";
    send.className = "rm-return-request-send";
    send.textContent = "Request a return";

    const done = document.createElement("div");
    done.className = "rm-return-request-done";
    done.setAttribute("role", "status");
    done.setAttribute("aria-live", "polite");
    done.tabIndex = -1;
    done.hidden = true;

    form.append(set, panel, send, done);

    const onChange = () => {
      const other = radios.find((radio) => radio.checked)?.value.toLowerCase() === "other";
      const below = [send];
      flip(below, () => { panel.hidden = !other; });
      if (other) {
        more.focus();
        if (!prefersReducedMotion()) {
          panel.animate(
            [{ opacity: 0, transform: "translateY(-8px)" }, { opacity: 1, transform: "none" }],
            { duration: 280, easing: EASE.out },
          );
        }
      }
    };

    const onSubmit = (event) => {
      event.preventDefault();
      const chosen = radios.find((radio) => radio.checked);
      if (!chosen) { radios[0].focus(); return; }
      done.textContent = `Return requested — reference RM-DEMO-${Math.floor(Math.random() * 9000) + 1000}. `
        + "This is a demonstration and nothing was sent.";
      done.hidden = false;
      set.inert = true;
      send.hidden = true;
      done.focus();
    };

    form.addEventListener("change", onChange);
    form.addEventListener("submit", onSubmit);

    cleanups.push(() => {
      form.removeEventListener("change", onChange);
      form.removeEventListener("submit", onSubmit);
      set.remove();
      panel.remove();
      send.remove();
      done.remove();
      form.noValidate = hadNoValidate;
      form.classList.remove("rm-return-request");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A table row that opens to show its detail.
 *
 * Kept inside a real `<table>`, because an invoice is tabular data and a grid
 * of divs loses every row and column relationship the moment it is read out.
 * The detail is a second `<tr>` toggled with `hidden`; the button that opens it
 * carries `aria-expanded` and `aria-controls`, and the rows below are FLIPped
 * into place rather than sliding a height.
 *
 * The status is a word first and a colour second. "Paid" in green is fine;
 * green on its own is a status only the sighted half of your visitors receive.
 * An unrecognised state falls back to the default rather than being printed
 * raw, so the word and the colour can never disagree.
 *
 * The detail row is the next sibling only when that sibling is not itself an
 * invoice row: a table where every `<tr>` carries the attribute gets no
 * disclosure, rather than every row after the first being hidden.
 *
 *   <tr data-rm-invoice-row data-rm-state="paid"><td>INV-DEMO-004</td></tr>
 *   <tr>…the detail…</tr>
 */
export function invoiceRow(target = "[data-rm-invoice-row]", options = {}) {
  const rows = resolveElements(target);
  if (!rows.length) return () => {};

  const { state = "paid", duration = 300 } = options;
  const WORDS = { paid: "Paid", due: "Due", overdue: "Overdue", refunded: "Refunded" };
  const cleanups = [];

  for (const row of rows) {
    /*
     * The next row is only the detail if it is not an invoice in its own right.
     *
     * A list of invoices with nothing to expand is written as a table where
     * every `<tr>` carries the attribute, and taking the next sibling on faith
     * hides every row after the first — two invoices out of three simply
     * vanish, which is a far worse failure than a missing disclosure.
     */
    const after = row.nextElementSibling;
    const mounted = (node) => rows.includes(node)
      || node.hasAttribute("data-rm-invoice-row")
      || (typeof target === "string" && node.matches(target));
    const detail = after && !mounted(after) ? after : null;
    row.classList.add("rm-invoice-row");

    /*
     * One normalisation, used everywhere.
     *
     * The word and the class have to agree. Reading the attribute twice with
     * two different fallbacks is how a row ends up classed `is-cancelled`,
     * matching none of the stylesheet's status rules, while its pill cheerfully
     * reads "Paid". An unrecognised state lands on the default here, once.
     */
    const asked = dataString(row, "rmState", state);
    let kind = asked in WORDS ? asked : state;

    const pill = document.createElement("span");
    pill.className = "rm-invoice-row-pill";
    pill.textContent = WORDS[kind];
    row.classList.add(`is-${kind}`);
    (row.lastElementChild ?? row).appendChild(pill);

    let toggle = null;
    const madeDetailId = Boolean(detail) && !detail.id;
    if (detail) {
      if (madeDetailId) detail.id = uid("rm-invoice-detail");
      detail.classList.add("rm-invoice-row-detail");
      detail.hidden = true;

      toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "rm-invoice-row-toggle";
      toggle.setAttribute("aria-controls", detail.id);
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", `Show the detail for ${row.firstElementChild?.textContent?.trim() ?? "this invoice"}`);
      toggle.textContent = "Detail";
      (row.firstElementChild ?? row).prepend(toggle);

      const onToggle = () => {
        const below = [];
        for (let node = detail.nextElementSibling; node; node = node.nextElementSibling) below.push(node);
        const open = detail.hidden;
        flip(below, () => {
          detail.hidden = !open;
          toggle.setAttribute("aria-expanded", String(open));
          row.classList.toggle("is-open", open);
        }, duration);
        if (open && !prefersReducedMotion()) {
          detail.animate([{ opacity: 0 }, { opacity: 1 }], { duration, easing: EASE.out });
        }
      };
      toggle.addEventListener("click", onToggle);
      cleanups.push(() => toggle.removeEventListener("click", onToggle));
    }

    row.rmSet = (next) => {
      row.classList.remove(`is-${kind}`);
      // Same normalisation as the mount: an unknown state falls back rather
      // than being printed raw into the pill.
      kind = next in WORDS ? next : state;
      row.classList.add(`is-${kind}`);
      pill.textContent = WORDS[kind];
      if (prefersReducedMotion()) return;
      pill.animate(
        [{ transform: "scale(0.9)", opacity: 0.4 }, { transform: "none", opacity: 1 }],
        { duration: 260, easing: EASE.out },
      );
    };

    cleanups.push(() => {
      pill.remove();
      toggle?.remove();
      if (detail) {
        detail.hidden = false;
        detail.classList.remove("rm-invoice-row-detail");
        if (madeDetailId) detail.removeAttribute("id");
      }
      delete row.rmSet;
      row.classList.remove("rm-invoice-row", "is-open", `is-${kind}`);
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * An item moving between two lists, by FLIP.
 *
 * The move is the whole component, and it is the thing the naive version gets
 * wrong twice: it animates the item's height in both lists, and it leaves focus
 * on a button that no longer exists. Here the item is measured, moved,
 * inverted and released, so it appears to travel from one list to the other
 * while the browser only lays out once — and focus is deliberately placed on
 * the same item's button in its new home, so a keyboard user follows it across.
 *
 * The move is announced politely, since otherwise the only feedback is a card
 * disappearing from under the pointer.
 *
 *   <div data-rm-save-for-later>
 *     <ul id="basket">…<button data-rm-save>Save for later</button>…</ul>
 *     <ul id="saved"></ul>
 *   </div>
 */
export function saveForLater(target = "[data-rm-save-for-later]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { toggle = "[data-rm-save]", duration = 380 } = options;
  const cleanups = [];

  for (const holder of holders) {
    const lists = [...holder.querySelectorAll("ul, ol")];
    if (lists.length < 2) continue;
    const [basket, saved] = lists;

    holder.classList.add("rm-save-for-later");
    const said = speaker(holder, "polite");
    // What each button said before this component started rewriting it, so the
    // cleanup can genuinely put the markup back.
    const wording = new Map();

    const onClick = (event) => {
      const button = event.target.closest(toggle);
      if (!button || !holder.contains(button)) return;
      const item = button.closest("li");
      if (!item) return;

      const home = item.parentElement === basket ? saved : basket;
      const word = item.querySelector("h1,h2,h3,h4,h5,h6")?.textContent?.trim()
        ?? item.textContent.trim().slice(0, 40);
      const moving = [item, ...basket.children, ...saved.children].filter((node, i, all) => all.indexOf(node) === i);

      if (!wording.has(button)) {
        wording.set(button, [button.textContent, button.getAttribute("aria-label")]);
      }

      flip(moving, () => {
        home.appendChild(item);
        button.textContent = home === saved ? "Move to basket" : "Save for later";
        button.setAttribute("aria-label", `${button.textContent}: ${word}`);
        item.classList.toggle("is-saved", home === saved);
      }, duration);

      // The button travelled with the item, so focus follows it there.
      button.focus();
      said.textContent = home === saved ? `${word} saved for later` : `${word} moved back to your basket`;
      item.dispatchEvent(new CustomEvent(CART_CHANGE, { bubbles: true, detail: { name: word, saved: home === saved } }));
    };

    holder.addEventListener("click", onClick);

    cleanups.push(() => {
      holder.removeEventListener("click", onClick);
      said.remove();
      wording.forEach(([text, aria], button) => {
        button.textContent = text;
        if (aria === null) button.removeAttribute("aria-label");
        else button.setAttribute("aria-label", aria);
      });
      holder.querySelectorAll(".is-saved").forEach((item) => item.classList.remove("is-saved"));
      holder.classList.remove("rm-save-for-later");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A rail that scrolls itself and nothing else.
 *
 * Tabbing to a card that is off the right-hand edge has to bring it into view,
 * and `scrollIntoView` does that by scrolling every scrollable ancestor
 * including the page — so focusing a thumbnail throws the whole document to
 * wherever the rail happens to be. `keepInView` does the arithmetic on the one
 * box that should move, which is the difference between a rail that behaves and
 * a page that jumps.
 *
 * The arrow buttons are real buttons with real labels, and their disabled state
 * and the edge fades are read from `scrollLeft` on the shared frame loop,
 * inside `whileVisible` so a rail below the fold costs nothing at all.
 *
 *   <ul data-rm-recently-viewed data-rm-label="Recently viewed">…</ul>
 */
export function recentlyViewed(target = "[data-rm-recently-viewed]", options = {}) {
  const rails = resolveElements(target);
  if (!rails.length) return () => {};

  const { label = "Recently viewed", step = 0.8 } = options;
  const cleanups = [];

  for (const rail of rails) {
    const items = [...rail.children];
    if (!items.length) continue;

    const hadLabel = rail.getAttribute("aria-label");
    rail.classList.add("rm-recently-viewed");
    rail.setAttribute("role", "region");
    rail.setAttribute("aria-label", dataString(rail, "rmLabel", label));
    items.forEach((item) => item.classList.add("rm-recently-viewed-item"));

    const nav = document.createElement("div");
    nav.className = "rm-recently-viewed-nav";
    const back = document.createElement("button");
    back.type = "button";
    back.className = "rm-recently-viewed-arrow is-back";
    back.setAttribute("aria-label", "Scroll back");
    back.textContent = "‹";
    const on = document.createElement("button");
    on.type = "button";
    on.className = "rm-recently-viewed-arrow is-on";
    on.setAttribute("aria-label", "Scroll forward");
    on.textContent = "›";
    nav.append(back, on);
    rail.after(nav);

    const nudge = (way) => rail.scrollBy({ left: way * rail.clientWidth * step, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    const onBack = () => nudge(-1);
    const onOn = () => nudge(1);
    back.addEventListener("click", onBack);
    on.addEventListener("click", onOn);

    // Tab lands on a card off screen: bring it in, and move nothing else.
    const onFocusIn = (event) => {
      const item = items.find((node) => node.contains(event.target));
      if (item) keepInView(rail, item, prefersReducedMotion() ? "auto" : "smooth");
    };
    rail.addEventListener("focusin", onFocusIn);

    let lastLeft = -1;
    cleanups.push(whileVisible(rail, () => onFrame(() => {
      const left = rail.scrollLeft;
      if (left === lastLeft) return;
      lastLeft = left;
      const end = rail.scrollWidth - rail.clientWidth;
      back.disabled = left <= 1;
      on.disabled = left >= end - 1;
      rail.style.setProperty("--rm-recently-viewed-start", left > 1 ? "1" : "0");
      rail.style.setProperty("--rm-recently-viewed-end", left < end - 1 ? "1" : "0");
    })));

    cleanups.push(() => {
      back.removeEventListener("click", onBack);
      on.removeEventListener("click", onOn);
      rail.removeEventListener("focusin", onFocusIn);
      nav.remove();
      items.forEach((item) => item.classList.remove("rm-recently-viewed-item"));
      rail.classList.remove("rm-recently-viewed");
      rail.removeAttribute("role");
      if (hadLabel === null) rail.removeAttribute("aria-label");
      else rail.setAttribute("aria-label", hadLabel);
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}
