/**
 * Ecommerce — account, orders and support.
 *
 *   • orderList()         — a list of orders that filters by FLIP, not by reflow.
 *   • orderCard()         — one order, opening to its items without a height animation.
 *   • orderStatusPill()   — a state with the word written down beside the colour.
 *   • trackingMap()       — an abstract route, drawn and then said in full.
 *   • deliverySlot()      — real radios, and a full slot actually said out loud.
 *   • addressBook()       — choosing a default, with the list closing up by FLIP.
 *   • addressCard()       — actions that fade on hover and stay reachable on focus.
 *   • paymentCards()      — saved methods as radios, and never a digit collected.
 *   • subscriptionCard()  — how far through a cycle, in a bar and in words.
 *   • pauseSubscription() — a disclosure that asks how long, then says until when.
 *   • invoiceList()       — a year filter made of a real select, totalled aloud.
 *   • downloadRow()       — a determinate bar that does not read itself out.
 *   • wishlistGrid()      — removing one item without losing the keyboard's place.
 *   • reviewForm()        — a real form, a real rating input, a real error summary.
 *   • reviewCard()        — a clamped body that expands from a measurement.
 *   • questionAnswer()    — answers that re-sort by vote, moved by transform.
 *   • supportTicket()     — a thread and a reply, both with focus handed back.
 *   • chatBubble()        — a log that only follows you when you were following it.
 *   • refundStatus()      — three stages, filled by clip-path and said in one line.
 *   • accountNav()        — aria-current, a sliding marker, and counts in words.
 *
 * The account area is where somebody goes when something has already gone
 * slightly wrong: a parcel is late, a refund has not landed, a subscription is
 * charging for something they meant to pause. That changes the priorities. None
 * of these components is trying to sell anything, so none of them interrupts;
 * every live region here is `polite` except the one that reports a form error,
 * which is the only genuinely urgent thing in the file.
 *
 * The second rule is that a state is never only a colour. An amber pill, a green
 * tick and a half-filled bar are three pictures, and a picture is a message half
 * the audience never receives — so every status carries its own word, every meter
 * carries an `aria-valuetext` in the unit a person would use, and every route is
 * accompanied by the ordered list of places it passes through.
 *
 * The third is that lists here change while you are looking at them. Filtering an
 * order history, removing a saved item, promoting an address to default and
 * re-sorting answers by vote all move rows past each other, and all four do it by
 * measuring, mutating and then playing the difference on a transform. Nothing in
 * this file animates a height, and nothing drops focus on `<body>` after removing
 * the element that had it.
 *
 * The hard boundary, and it is not negotiable: these are presentation components.
 * Nothing here collects, stores, transmits or validates a card number, a CVV, a
 * bank detail or a credential, and nothing imitates a real shop, bank or payment
 * provider. `paymentCards()` chooses a saved *method* — a radio group, the same
 * shape as choosing a delivery slot — and it will not draw a digit string longer
 * than four characters even if the markup hands it one. Every reference, amount,
 * masked stub and merchant name in the examples is invented on purpose.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import {
  clamp, dataNumber, dataString, EASE, keepInView, lerp, onFrame,
  prefersReducedMotion, resolveElements, watch, whileVisible,
} from "../core/motion.js";

/** A short unique id, for the `aria-` wiring that needs one. */
const uid = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * A live region owned by one component and removed with it.
 *
 * It is created empty and stays empty until the visitor does something. A region
 * that is already in the document announces its first fill like any other change,
 * so writing to it on mount interrupts the page to report a state nobody has
 * touched yet.
 */
function speaker(holder, tone = "polite", beside = false) {
  const region = document.createElement("p");
  region.className = "rm-account-live";
  region.setAttribute("aria-live", tone);
  region.setAttribute("role", tone === "assertive" ? "alert" : "status");
  // A list has a content model, and a `<p>` is not in it. Dropping a stray flow
  // element among the `<li>`s makes several screen readers stop reporting the
  // list role or miscount "list, 8 items" — which undoes the very announcement
  // the region exists to make. So a list gets its region as a sibling.
  if (beside) holder.after(region);
  else holder.appendChild(region);
  return region;
}

/** Text that is read but not drawn — the spoken half of a purely visual signal. */
function said(text) {
  const span = document.createElement("span");
  span.className = "rm-account-said";
  span.textContent = text;
  return span;
}

/**
 * Measure, mutate, invert, play.
 *
 * The only honest way to animate a list that really does change size. Hiding a
 * filtered-out order genuinely moves everything below it; animating a height
 * would be a lie and a full layout pass on every frame. So the change happens at
 * once, the survivors are put back where they were with a transform, and they are
 * let go. The browser lays out once and the compositor does the rest.
 *
 * The subtlety, and the one that is wrong in most hand-rolled FLIPs: a row that
 * was `hidden` at measure time has no box at all, so its "before" rectangle is
 * `{0, 0, 0, 0}` — the top-left corner of the viewport. Inverting from that
 * throws a row that has just been *revealed* in from the corner of the screen,
 * which is the opposite of the calm the technique is for. So visibility is
 * recorded alongside the rectangle, and a row that was hidden before the
 * mutation is not FLIPped at all; it arrives on its own short fade instead,
 * because it was never anywhere to move from.
 */
function flipList(nodes, mutate, duration = 320) {
  const before = nodes.map((node) => [node, node.hidden, node.getBoundingClientRect()]);
  mutate();
  if (prefersReducedMotion()) return;
  for (const [node, wasHidden, was] of before) {
    if (!node.isConnected || node.hidden) continue;
    if (wasHidden) {
      node.animate(
        [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }],
        { duration: Math.round(duration * 0.75), easing: EASE.out },
      );
      continue;
    }
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
 * The invert half of a FLIP for one element that has already been moved.
 *
 * Used by the markers and indicators: the element is placed by measurement, so
 * it is already in its final position by the time this runs, and this plays the
 * gap between where it was and where it now is.
 */
function flipTo(element, was, duration = 320) {
  if (prefersReducedMotion() || !was) return;
  const now = element.getBoundingClientRect();
  if (!now.width || !was.width) return;
  const dx = was.left - now.left;
  const dy = was.top - now.top;
  const sx = was.width / now.width;
  if (!dx && !dy && Math.abs(sx - 1) < 0.002) return;
  element.animate(
    [
      { transform: `translate(${dx}px, ${dy}px) scaleX(${sx})`, transformOrigin: "0 0" },
      { transform: "none", transformOrigin: "0 0" },
    ],
    { duration, easing: EASE.out },
  );
}

/**
 * Money, formatted the way the visitor's own device does it.
 *
 * `Intl` already knows where the symbol goes, which separator to use and how many
 * decimals a currency has. Hard-coding "£" in front of a number is wrong in most
 * of Europe and wrong for every zero-decimal currency.
 */
function money(amount, currency = "GBP") {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/** The states an order, a ticket or a return can be in, and what each is called. */
const STATES = {
  placed: { word: "Order placed", tone: "waiting" },
  packed: { word: "Being packed", tone: "waiting" },
  shipped: { word: "On its way", tone: "moving" },
  delivered: { word: "Delivered", tone: "done" },
  cancelled: { word: "Cancelled", tone: "stopped" },
  refunded: { word: "Refunded", tone: "stopped" },
  open: { word: "Open", tone: "moving" },
  answered: { word: "Answered", tone: "waiting" },
  resolved: { word: "Resolved", tone: "done" },
};

/**
 * A list of orders that filters by FLIP, not by reflow.
 *
 * Filtering an order history is a list that genuinely changes length, so there is
 * nothing to fade: the rows that survive are measured, hidden rows are taken out
 * in one mutation, and the survivors are played from their old positions with a
 * transform. The version that transitions each row's height instead re-lays-out
 * the whole page on every frame, and it does it while the visitor is still
 * reading the row that did not move.
 *
 * Rows arrive staggered the first time the list is seen and never again —
 * `watch` with `once`, not `whileVisible`, because a settled order history that
 * re-animates every time you scroll back to it looks like data still loading.
 * The count is announced politely afterwards, since a filter that silently
 * removes eleven rows is a control that appears to have done nothing.
 *
 *   <ul data-rm-order-list data-rm-stagger="70">
 *     <li data-rm-state="delivered">Order RM-0031 — delivered</li>
 *     <li data-rm-state="shipped">Order RM-0032 — on its way</li>
 *   </ul>
 *   list.rmFilter("shipped");
 */
export function orderList(target = "[data-rm-order-list]", options = {}) {
  const lists = resolveElements(target);
  if (!lists.length) return () => {};

  const { stagger = 70, duration = 460, label = "Your orders" } = options;
  const cleanups = [];

  for (const list of lists) {
    const rows = [...list.children];
    if (!rows.length) continue;

    list.classList.add("rm-order-list");
    // The list belongs to the page. Whatever name it already carried goes back
    // on the way out rather than being deleted.
    const hadLabel = list.getAttribute("aria-label");
    list.setAttribute("aria-label", dataString(list, "rmLabel", hadLabel ?? label));

    const gap = Math.max(0, dataNumber(list, "rmStagger", stagger));
    const speed = dataNumber(list, "rmDuration", duration);
    const live = speaker(list, "polite", true);
    rows.forEach((row) => row.classList.add("rm-order-list-row"));

    const play = () => {
      if (prefersReducedMotion()) return;
      rows.filter((row) => !row.hidden).forEach((row, i) => {
        row.animate(
          [{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }],
          { duration: speed, delay: i * gap, easing: EASE.out, fill: "backwards" },
        );
      });
    };
    cleanups.push(watch(list, play, { threshold: 0.2, once: true }));

    list.rmFilter = (state = "all") => {
      const wanted = String(state).toLowerCase();
      flipList(rows, () => {
        rows.forEach((row) => {
          const own = dataString(row, "rmState", "").toLowerCase();
          row.hidden = wanted !== "all" && own !== wanted;
        });
      }, 320);
      const shown = rows.filter((row) => !row.hidden).length;
      live.textContent = `${shown} ${shown === 1 ? "order" : "orders"} shown`;
    };

    cleanups.push(() => {
      delete list.rmFilter;
      rows.forEach((row) => {
        row.hidden = false;
        row.classList.remove("rm-order-list-row");
      });
      live.remove();
      list.classList.remove("rm-order-list");
      if (hadLabel === null) list.removeAttribute("aria-label");
      else list.setAttribute("aria-label", hadLabel);
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * One order, opening to its items without a height animation.
 *
 * The detail is toggled with `hidden` and revealed with a clip-path wipe and a
 * small translate, so the layout changes exactly once — on the frame the panel
 * appears — instead of on every frame of a three-hundred-millisecond height
 * transition. The `0fr`-to-`1fr` grid trick that has replaced height animations
 * has the same cost and the same symptom: everything below the card judders for
 * the length of the animation.
 *
 * The trigger is a real `<button aria-expanded aria-controls>` and the summary
 * stays readable while it is shut, because the whole point of an order history is
 * scanning it. Before the script runs the detail is simply visible, in order,
 * which is what an order looks like with no JavaScript at all.
 *
 *   <article data-rm-order-card data-rm-more="Show items">
 *     <h3>Order RM-0031</h3>
 *     <p>Placed 4 April 2031 · £48.00</p>
 *     <div data-rm-detail><ul><li>Kelp mug × 2</li></ul></div>
 *   </article>
 */
export function orderCard(target = "[data-rm-order-card]", options = {}) {
  const cards = resolveElements(target);
  if (!cards.length) return () => {};

  const { duration = 320, moreText = "Show items", lessText = "Hide items" } = options;
  const cleanups = [];

  for (const card of cards) {
    const detail = card.querySelector("[data-rm-detail]");
    if (!detail) continue;

    card.classList.add("rm-order-card");
    detail.classList.add("rm-order-card-detail");
    if (!detail.id) detail.id = uid("rm-order-detail");

    const speed = dataNumber(card, "rmDuration", duration);
    const openWord = dataString(card, "rmMore", moreText);
    const shutWord = dataString(card, "rmLess", lessText);
    const name = card.querySelector("h1,h2,h3,h4,h5,h6")?.textContent?.trim() ?? "this order";

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "rm-order-card-toggle";
    toggle.setAttribute("aria-controls", detail.id);
    detail.before(toggle);

    let open = dataString(card, "rmOpen", "false") === "true";

    const paint = (animated) => {
      toggle.setAttribute("aria-expanded", String(open));
      // The name says which order, because a page of these is otherwise a column
      // of buttons all called "Show items".
      toggle.textContent = open ? shutWord : openWord;
      toggle.setAttribute("aria-label", `${open ? shutWord : openWord} for ${name}`);
      card.classList.toggle("is-open", open);
      detail.hidden = !open;
      if (!open || !animated || prefersReducedMotion()) return;
      detail.animate(
        [
          { opacity: 0, transform: "translateY(-6px)", clipPath: "inset(0 0 100% 0)" },
          { opacity: 1, transform: "none", clipPath: "inset(0 0 0 0)" },
        ],
        { duration: speed, easing: EASE.out },
      );
    };
    paint(false);

    const onClick = () => { open = !open; paint(true); };
    toggle.addEventListener("click", onClick);
    card.rmToggle = (next = !open) => { open = Boolean(next); paint(true); };

    cleanups.push(() => {
      toggle.removeEventListener("click", onClick);
      delete card.rmToggle;
      toggle.remove();
      detail.hidden = false;
      detail.classList.remove("rm-order-card-detail");
      card.classList.remove("rm-order-card", "is-open");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A state with the word written down beside the colour.
 *
 * Amber for packing and green for delivered is a convention that reaches roughly
 * nobody who needs it most: it is invisible to a screen reader, unreliable for
 * the eight percent of men with a colour vision deficiency, and gone entirely in
 * a high-contrast theme. So the pill's own text is the word, the dot is
 * `aria-hidden`, and the shape changes as well as the hue.
 *
 * It is a `role="status"`, which announces changes and stays silent on load, and
 * the words "Order status" are carried by a span that is read but not drawn — so
 * an update is heard as "Order status: on its way" rather than as one bare word
 * arriving from nowhere. An unrecognised state falls back to the first one rather
 * than rendering an empty pill.
 *
 *   <span data-rm-order-status data-rm-state="shipped"></span>
 *   pill.rmSet("delivered");
 */
export function orderStatusPill(target = "[data-rm-order-status]", options = {}) {
  const pills = resolveElements(target);
  if (!pills.length) return () => {};

  const { state = "placed", prefix = "Order status" } = options;
  const cleanups = [];

  for (const pill of pills) {
    const original = pill.innerHTML;
    pill.classList.add("rm-order-status");
    pill.setAttribute("role", "status");
    pill.setAttribute("aria-live", "polite");

    const dot = document.createElement("i");
    dot.className = "rm-order-status-dot";
    dot.setAttribute("aria-hidden", "true");
    const word = document.createElement("span");
    word.className = "rm-order-status-word";
    pill.replaceChildren(said(`${dataString(pill, "rmPrefix", prefix)}: `), dot, word);

    let tone = "";
    const paint = (next, roll) => {
      // An unknown value is a typo in the markup, not a licence to draw nothing.
      const key = String(next).toLowerCase();
      const found = STATES[key] ?? STATES[state] ?? STATES.placed;
      if (tone) pill.classList.remove(`is-${tone}`);
      tone = found.tone;
      pill.classList.add(`is-${tone}`);
      word.textContent = found.word;
      if (!roll || prefersReducedMotion()) return;
      word.animate(
        [{ opacity: 0, transform: "translateY(0.45em)" }, { opacity: 1, transform: "none" }],
        { duration: 280, easing: EASE.out },
      );
      dot.animate(
        [{ transform: "scale(0.4)" }, { transform: "scale(1)" }],
        { duration: 420, easing: EASE.spring },
      );
    };
    paint(dataString(pill, "rmState", state), false);

    pill.rmSet = (next) => paint(next, true);

    cleanups.push(() => {
      delete pill.rmSet;
      ["role", "aria-live"].forEach((name) => pill.removeAttribute(name));
      pill.classList.remove("rm-order-status", `is-${tone}`);
      pill.innerHTML = original;
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * An abstract route, drawn and then said in full.
 *
 * This deliberately embeds no map service. A parcel tracker does not need a
 * street plan, and dropping a third-party map into an account page costs a
 * megabyte of script, an API key and a request to somebody else's servers
 * carrying the visitor's address — for a picture of a line with four dots on it.
 * So the line is one inline SVG with no dependency and no network at all, and the
 * real content is the ordered list of stops that the author wrote, which stays in
 * the document and carries `aria-current="step"` on the stop reached so far.
 *
 * The completed part of the route is a second, coloured copy of the same line
 * clipped with `clip-path`, and the marker rides along it on a transform eased on
 * the shared frame loop — so the whole animation is two composited properties and
 * no layout. The loop is wrapped in `whileVisible`, so a page listing six parcels
 * costs nothing once it has scrolled away, and under reduced motion the marker is
 * placed at its destination immediately rather than not being drawn.
 *
 *   <div data-rm-tracking-map data-rm-at="2">
 *     <ol><li>Collected</li><li>At the depot</li><li>Out for delivery</li><li>Delivered</li></ol>
 *   </div>
 *   map.rmSet(3);
 */
export function trackingMap(target = "[data-rm-tracking-map]", options = {}) {
  const maps = resolveElements(target);
  if (!maps.length) return () => {};

  const { at = 0, follow = 0.08, label = "Delivery route" } = options;
  const cleanups = [];

  for (const map of maps) {
    const list = map.querySelector("ol, ul");
    const stops = list ? [...list.children] : [];
    if (stops.length < 2) continue;

    map.classList.add("rm-tracking-map");
    map.setAttribute("role", "group");
    const hadLabel = map.getAttribute("aria-label");
    map.setAttribute("aria-label", dataString(map, "rmLabel", hadLabel ?? label));
    list.classList.add("rm-tracking-map-stops");
    stops.forEach((stop) => stop.classList.add("rm-tracking-map-stop"));

    const rate = clamp(dataNumber(map, "rmGlide", follow), 0.01, 1);
    const live = speaker(map);

    // Normalised points across a wandering line. The wander is decorative and
    // fixed, so the same order always draws the same route.
    const points = stops.map((_, i) => ({
      x: 0.06 + (i * 0.88) / (stops.length - 1),
      y: 0.5 + (i % 2 === 0 ? -0.22 : 0.22) * (i === 0 || i === stops.length - 1 ? 0.4 : 1),
    }));
    const path = points.map((p, i) => `${i ? "L" : "M"}${(p.x * 100).toFixed(2)} ${(p.y * 100).toFixed(2)}`).join(" ");
    const line = (cls) =>
      `<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" class="${cls}">`
      + `<path d="${path}" fill="none" stroke="currentColor" stroke-width="2.4" `
      + 'stroke-linecap="round" stroke-linejoin="round"/></svg>';

    const frame = document.createElement("div");
    frame.className = "rm-tracking-map-frame";
    frame.setAttribute("aria-hidden", "true");
    frame.innerHTML = line("rm-tracking-map-route");

    const done = document.createElement("div");
    done.className = "rm-tracking-map-done";
    done.innerHTML = line("rm-tracking-map-route");

    const marker = document.createElement("i");
    marker.className = "rm-tracking-map-marker";
    frame.append(done, marker);
    map.prepend(frame);

    // Measured once and again whenever the frame changes size: the marker moves
    // by transform, which needs pixels, and the frame is fluid.
    let box = { width: 0, height: 0 };
    const measure = () => {
      const rect = frame.getBoundingClientRect();
      box = { width: rect.width, height: rect.height };
    };
    const watcher = new ResizeObserver(measure);
    watcher.observe(frame);
    measure();

    let goal = clamp(dataNumber(map, "rmAt", at), 0, stops.length - 1);
    let shown = goal;

    const draw = () => {
      const share = shown / (stops.length - 1);
      done.style.clipPath = `inset(0 ${((1 - share) * 100).toFixed(2)}% 0 0)`;
      const span = clamp(shown, 0, stops.length - 1.0001);
      const first = Math.floor(span);
      const mix = span - first;
      const a = points[first];
      const b = points[Math.min(first + 1, points.length - 1)];
      marker.style.transform =
        `translate(${(lerp(a.x, b.x, mix) * box.width).toFixed(1)}px, `
        + `${(lerp(a.y, b.y, mix) * box.height).toFixed(1)}px)`;
    };

    const mark = () => {
      stops.forEach((stop, i) => {
        stop.classList.toggle("is-reached", i <= goal);
        if (i === goal) stop.setAttribute("aria-current", "step");
        else stop.removeAttribute("aria-current");
      });
    };
    mark();
    draw();

    // One task on the shared loop, and only while the route is on screen.
    const stopLoop = whileVisible(frame, () => onFrame(() => {
      if (Math.abs(goal - shown) < 0.001) return;
      shown = lerp(shown, goal, rate);
      if (Math.abs(goal - shown) < 0.004) shown = goal;
      draw();
    }));

    map.rmSet = (next) => {
      goal = clamp(Math.round(next), 0, stops.length - 1);
      mark();
      // Reduced motion jumps to the finished state: the marker still arrives, it
      // simply does not travel.
      if (prefersReducedMotion()) { shown = goal; draw(); }
      live.textContent = `${stops[goal].textContent.trim()}. Stop ${goal + 1} of ${stops.length}.`;
    };

    cleanups.push(() => {
      stopLoop();
      watcher.disconnect();
      delete map.rmSet;
      frame.remove();
      live.remove();
      stops.forEach((stop) => {
        stop.classList.remove("rm-tracking-map-stop", "is-reached");
        stop.removeAttribute("aria-current");
      });
      list.classList.remove("rm-tracking-map-stops");
      map.classList.remove("rm-tracking-map");
      map.removeAttribute("role");
      if (hadLabel === null) map.removeAttribute("aria-label");
      else map.setAttribute("aria-label", hadLabel);
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Real radios, and a full slot actually said out loud.
 *
 * A delivery slot picker is a radio group and nothing more exotic, so it is built
 * from `<input type="radio">` inside a labelled `<fieldset>` — which brings arrow
 * key cycling, a focus ring, a form value and a group name for free. The grid of
 * clickable divs that usually replaces it has none of those, and the failure is
 * silent: the visitor picks a slot, the form submits without one, and the parcel
 * arrives on a day nobody chose.
 *
 * A slot with nothing left is `disabled`, which removes it from the arrow-key
 * cycle for free, *and* carries the words "fully booked" as text that is read but
 * not drawn. That second half is the part everybody forgets — a greyed-out tile
 * is announced as "Thursday, dimmed" and the visitor is left to guess why.
 *
 *   <fieldset data-rm-delivery-slot>
 *     <legend>Choose a delivery slot</legend>
 *     <label><input type="radio" name="slot" value="thu-am"> Thursday, 9am to 12pm</label>
 *     <label><input type="radio" name="slot" value="thu-pm" data-rm-full="true"> Thursday, 1pm to 6pm</label>
 *   </fieldset>
 */
export function deliverySlot(target = "[data-rm-delivery-slot]", options = {}) {
  const groups = resolveElements(target);
  if (!groups.length) return () => {};

  const { fullText = "fully booked" } = options;
  const cleanups = [];

  for (const group of groups) {
    const inputs = [...group.querySelectorAll('input[type="radio"]')];
    if (!inputs.length) continue;

    group.classList.add("rm-delivery-slot");
    const live = speaker(group);
    const notes = [];
    // Only the ones this component switched off, so the cleanup cannot re-enable
    // a slot the author had disabled for reasons of their own.
    const stopped = [];

    for (const input of inputs) {
      const label = input.closest("label") ?? input.parentElement;
      label?.classList.add("rm-delivery-slot-option");
      if (dataString(input, "rmFull", "false") !== "true") continue;
      if (!input.disabled) { input.disabled = true; stopped.push(input); }
      label?.classList.add("is-full");
      const note = said(`, ${dataString(input, "rmLabel", fullText)}`);
      label?.appendChild(note);
      notes.push(note);
    }

    const onChange = (event) => {
      const label = event.target.closest("label");
      live.textContent = `${label?.textContent.trim() ?? event.target.value} selected`;
      if (prefersReducedMotion()) return;
      label?.animate(
        [{ transform: "scale(0.95)" }, { transform: "scale(1)" }],
        { duration: 300, easing: EASE.spring },
      );
    };
    group.addEventListener("change", onChange);

    cleanups.push(() => {
      group.removeEventListener("change", onChange);
      notes.forEach((note) => note.remove());
      stopped.forEach((input) => { input.disabled = false; });
      inputs.forEach((input) => {
        const label = input.closest("label") ?? input.parentElement;
        label?.classList.remove("rm-delivery-slot-option", "is-full");
      });
      live.remove();
      group.classList.remove("rm-delivery-slot");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Choosing a default, with the list closing up by FLIP.
 *
 * The addresses are one radio group, so exactly one can be the default, the
 * arrow keys move between them and the choice submits with the form. Choosing a
 * new default moves that card to the top of the list — which is genuinely useful,
 * because the default is the one you look for — and the cards it passes are
 * measured first and played back from where they were, so a re-order that really
 * happens looks like one movement rather than a jump.
 *
 * The chosen card carries the word "Default" as text and not only as a border,
 * and the announcement names the address rather than saying "selected", because
 * "selected" on its own is useless in a list of five places you have lived.
 *
 *   <fieldset data-rm-address-book data-rm-promote="true">
 *     <legend>Delivery addresses</legend>
 *     <label><input type="radio" name="address" value="home" checked> Flat 2, 14 Bracken Row, Leeds</label>
 *     <label><input type="radio" name="address" value="work"> Unit 9, Kelp Yard, Hull</label>
 *   </fieldset>
 */
export function addressBook(target = "[data-rm-address-book]", options = {}) {
  const books = resolveElements(target);
  if (!books.length) return () => {};

  const { promote = true, duration = 360, defaultWord = "Default" } = options;
  const cleanups = [];

  for (const book of books) {
    const inputs = [...book.querySelectorAll('input[type="radio"]')];
    if (!inputs.length) continue;

    book.classList.add("rm-address-book");
    const live = speaker(book);
    const speed = dataNumber(book, "rmDuration", duration);
    const lift = dataString(book, "rmPromote", String(promote)) === "true";
    const word = dataString(book, "rmDefaultWord", defaultWord);

    const cards = inputs.map((input) => input.closest("label") ?? input.parentElement).filter(Boolean);
    const parent = cards[0]?.parentElement;
    // Where each card started, so the cleanup can put the list back in the order
    // the author wrote rather than in whatever order the visitor left it.
    const order = parent ? [...parent.children] : [];
    const flags = [];

    cards.forEach((card) => {
      card.classList.add("rm-address-book-card");
      const flag = said(`, ${word}`);
      flag.classList.add("rm-address-book-flag");
      card.appendChild(flag);
      flags.push(flag);
    });

    const paint = () => {
      inputs.forEach((input, i) => {
        cards[i]?.classList.toggle("is-default", input.checked);
        flags[i].hidden = !input.checked;
      });
    };
    paint();

    const onChange = (event) => {
      const at = inputs.indexOf(event.target);
      const card = cards[at];
      if (!card || !parent) return;
      flipList(order.filter((node) => node.isConnected), () => {
        if (lift) parent.prepend(card);
        paint();
      }, speed);
      live.textContent = `${card.textContent.trim()} is now your default address`;
    };
    book.addEventListener("change", onChange);

    cleanups.push(() => {
      book.removeEventListener("change", onChange);
      order.forEach((node) => parent?.appendChild(node));
      flags.forEach((flag) => flag.remove());
      cards.forEach((card) => card.classList.remove("rm-address-book-card", "is-default"));
      live.remove();
      book.classList.remove("rm-address-book");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Actions that fade on hover and stay reachable on focus.
 *
 * Edit and remove buttons that appear on hover are everywhere, and they are
 * almost always built by giving them `display: none` until the card is hovered.
 * That deletes them for every visitor who is not using a pointer: a keyboard tab
 * skips them, a touch screen has no hover state to offer, and a screen reader is
 * never told the card can be edited at all.
 *
 * Here the buttons are always in the document and always in the tab order. The
 * script adds one class, and the stylesheet fades them out only under that class
 * and brings them straight back on `:hover` *and* `:focus-within` — so with the
 * script absent, or reduced motion on, the card is a plain block with two visible
 * buttons, which is the state everything else degrades to anyway.
 *
 *   <article data-rm-address-card data-rm-default="true">
 *     <h3>Home</h3>
 *     <address>Flat 2, 14 Bracken Row, Leeds LS0 0AA</address>
 *     <button type="button">Edit</button>
 *     <button type="button">Remove</button>
 *   </article>
 */
export function addressCard(target = "[data-rm-address-card]", options = {}) {
  const cards = resolveElements(target);
  if (!cards.length) return () => {};

  const { quiet = true, defaultWord = "Default address" } = options;
  const cleanups = [];

  for (const card of cards) {
    const buttons = [...card.querySelectorAll("button")];
    card.classList.add("rm-address-card");
    buttons.forEach((button) => {
      button.type = "button";
      button.classList.add("rm-address-card-action");
    });

    // The fade is opt-out, and it is applied from here rather than from the
    // stylesheet so that a page whose script never runs shows the actions. A
    // visitor on reduced motion never gets the class at all: a control that is
    // only readable once you have hovered it is a movement-dependent interface,
    // and the promise in the doc above is that they simply see both buttons.
    const hush = dataString(card, "rmQuiet", String(quiet)) === "true" && buttons.length > 0;
    if (hush && !prefersReducedMotion()) card.classList.add("is-quiet");

    const name = card.querySelector("h1,h2,h3,h4,h5,h6")?.textContent?.trim();
    // "Edit" three times in a column is three identical buttons. Each one says
    // which address it edits, and says it only in the accessible name so the
    // drawn label stays short.
    const named = [];
    if (name) {
      buttons.forEach((button) => {
        if (button.hasAttribute("aria-label")) return;
        button.setAttribute("aria-label", `${button.textContent.trim()} ${name}`);
        named.push(button);
      });
    }

    let flag = null;
    if (dataString(card, "rmDefault", "false") === "true") {
      card.classList.add("is-default");
      flag = document.createElement("p");
      flag.className = "rm-address-card-flag";
      flag.textContent = dataString(card, "rmDefaultWord", defaultWord);
      card.prepend(flag);
    }

    cleanups.push(() => {
      flag?.remove();
      named.forEach((button) => button.removeAttribute("aria-label"));
      buttons.forEach((button) => button.classList.remove("rm-address-card-action"));
      card.classList.remove("rm-address-card", "is-quiet", "is-default");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Saved methods as radios, and never a digit collected.
 *
 * This picks a saved *method*. It is a radio group — the same shape as choosing a
 * delivery slot — and it has no input for a card number, no expiry field, no
 * security code and nowhere to type one. That is a deliberate hard boundary, not
 * an omission: a component kit has no business anywhere near a real card, and a
 * demo that looks like a payment form teaches the wrong pattern to whoever pastes
 * it next.
 *
 * The guard is enforced rather than documented. Whatever `data-rm-masked`
 * contains is reduced to its last four digits behind bullets before it is drawn,
 * so an author who pastes a full sixteen-digit string into the markup gets four
 * characters back and nothing else reaches the page. The brand is written as a
 * word beside the stub, because a bare logo is unreadable to a screen reader and
 * indistinguishable from the next logo at small sizes.
 *
 *   <fieldset data-rm-payment-cards>
 *     <legend>Pay with a saved method</legend>
 *     <label><input type="radio" name="method" value="a" data-rm-brand="Fable Bank debit" data-rm-masked="0000" checked></label>
 *     <label><input type="radio" name="method" value="b" data-rm-brand="Kelp Credit Union" data-rm-masked="0001"></label>
 *   </fieldset>
 */
export function paymentCards(target = "[data-rm-payment-cards]", options = {}) {
  const groups = resolveElements(target);
  if (!groups.length) return () => {};

  const { label = "Saved payment methods" } = options;
  const cleanups = [];

  /*
   * Reduce anything digit-shaped to a stub.
   *
   * At most four digits survive, and they are drawn behind bullets. This runs on
   * every value the markup supplies precisely so that the component cannot be
   * turned into a card display by an author in a hurry.
   */
  const mask = (raw) => {
    const digits = String(raw).replace(/\D/g, "").slice(-4);
    return digits ? `•••• ${digits}` : "•••• ••••";
  };

  for (const group of groups) {
    const inputs = [...group.querySelectorAll('input[type="radio"]')];
    if (!inputs.length) continue;

    group.classList.add("rm-payment-cards");
    const hadLabel = group.getAttribute("aria-label");
    if (!group.querySelector("legend")) {
      group.setAttribute("aria-label", dataString(group, "rmLabel", hadLabel ?? label));
    }
    const live = speaker(group);
    const parts = [];

    for (const input of inputs) {
      const row = input.closest("label") ?? input.parentElement;
      row?.classList.add("rm-payment-cards-row");

      const brand = document.createElement("span");
      brand.className = "rm-payment-cards-brand";
      brand.textContent = dataString(input, "rmBrand", "Saved method");

      const stub = document.createElement("span");
      stub.className = "rm-payment-cards-stub";
      stub.textContent = mask(dataString(input, "rmMasked", ""));
      // The bullets are decoration; "ending 0000" is the sentence.
      stub.setAttribute("aria-hidden", "true");

      const spoken = said(`, ending ${mask(dataString(input, "rmMasked", "")).replace(/\D/g, "") || "unknown"}`);
      row?.append(brand, stub, spoken);
      parts.push(brand, stub, spoken);
    }

    const onChange = (event) => {
      const row = event.target.closest("label");
      live.textContent = `${row?.textContent.trim() ?? "Method"} selected`;
      if (prefersReducedMotion()) return;
      row?.animate(
        [{ transform: "translateX(-4px)" }, { transform: "none" }],
        { duration: 260, easing: EASE.out },
      );
    };
    group.addEventListener("change", onChange);

    cleanups.push(() => {
      group.removeEventListener("change", onChange);
      parts.forEach((node) => node.remove());
      inputs.forEach((input) => {
        (input.closest("label") ?? input.parentElement)?.classList.remove("rm-payment-cards-row");
      });
      live.remove();
      group.classList.remove("rm-payment-cards");
      if (hadLabel === null) group.removeAttribute("aria-label");
      else group.setAttribute("aria-label", hadLabel);
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * How far through a cycle, in a bar and in words.
 *
 * The bar is a `role="progressbar"` whose fill is a `scaleX` on an element that
 * is already full width, so moving it costs one composited frame rather than a
 * re-layout of the card. What matters more is the `aria-valuetext`: read as a
 * percentage, "forty per cent" tells a subscriber nothing at all, whereas
 * "day 12 of 30, next delivery on the 4th" is the entire answer they came for.
 *
 * Skipping the next delivery is a real toggle button with `aria-pressed` and a
 * name that never changes, so it is announced as "Skip the next delivery,
 * pressed" rather than as a button that has renamed itself and left the visitor
 * guessing what pressing it again would do.
 *
 *   <article data-rm-subscription-card data-rm-day="12" data-rm-cycle="30" data-rm-next="4 May">
 *     <h3>Kelp coffee, every month (invented)</h3>
 *   </article>
 */
export function subscriptionCard(target = "[data-rm-subscription-card]", options = {}) {
  const cards = resolveElements(target);
  if (!cards.length) return () => {};

  const {
    day = 0, cycle = 30, duration = 620,
    skipLabel = "Skip the next delivery", cycleLabel = "Subscription cycle",
  } = options;
  const cleanups = [];

  for (const card of cards) {
    card.classList.add("rm-subscription-card");
    const total = Math.max(1, dataNumber(card, "rmCycle", cycle));
    const when = dataString(card, "rmNext", "");
    const speed = dataNumber(card, "rmDuration", duration);

    const bar = document.createElement("div");
    bar.className = "rm-subscription-card-bar";
    bar.setAttribute("role", "progressbar");
    // A meter without a name is announced as "progress bar, day 12 of 30" and
    // the listener is left to work out which of the card's numbers it belongs
    // to. Every other bar in this library names itself; so does this one.
    bar.setAttribute("aria-label", dataString(card, "rmCycleLabel", cycleLabel));
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", String(total));
    const fill = document.createElement("i");
    fill.setAttribute("aria-hidden", "true");
    bar.appendChild(fill);

    const words = document.createElement("p");
    words.className = "rm-subscription-card-words";

    const skip = document.createElement("button");
    skip.type = "button";
    skip.className = "rm-subscription-card-skip";
    skip.textContent = dataString(card, "rmSkipLabel", skipLabel);
    skip.setAttribute("aria-pressed", "false");

    const live = speaker(card);
    card.append(bar, words, skip, live);

    let at = clamp(dataNumber(card, "rmDay", day), 0, total);
    let skipped = false;

    const paint = (grow) => {
      const share = at / total;
      fill.style.transform = `scaleX(${share})`;
      bar.setAttribute("aria-valuenow", String(Math.round(at)));
      const sentence = skipped
        ? `Next delivery skipped. Day ${Math.round(at)} of ${total}.`
        : `Day ${Math.round(at)} of ${total}${when ? `, next delivery ${when}` : ""}.`;
      words.textContent = sentence;
      bar.setAttribute("aria-valuetext", sentence);
      card.classList.toggle("is-skipped", skipped);
      if (!grow || prefersReducedMotion()) return;
      fill.animate(
        [{ transform: "scaleX(0)" }, { transform: `scaleX(${share})` }],
        { duration: speed, easing: EASE.out },
      );
    };
    paint(false);

    // Once, on arrival. `whileVisible` would re-fill the bar from zero every
    // time the card came back on screen, which makes a settled cycle look like
    // live data.
    cleanups.push(watch(card, () => paint(true), { threshold: 0.3, once: true }));

    const onSkip = () => {
      skipped = !skipped;
      skip.setAttribute("aria-pressed", String(skipped));
      paint(false);
      live.textContent = skipped
        ? `Next delivery skipped${when ? `. The one after is still due ${when}` : ""}.`
        : "Next delivery back on.";
    };
    skip.addEventListener("click", onSkip);
    card.rmSet = (next) => { at = clamp(next, 0, total); paint(true); };

    cleanups.push(() => {
      skip.removeEventListener("click", onSkip);
      delete card.rmSet;
      bar.remove();
      words.remove();
      skip.remove();
      live.remove();
      card.classList.remove("rm-subscription-card", "is-skipped");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * A disclosure that asks how long, then says until when.
 *
 * Pausing a subscription is one of the few destructive-feeling controls in an
 * account, so it is a two-step disclosure rather than a single button: press,
 * choose a length from real radios, confirm. The panel is toggled with `hidden`
 * and opens with a clip-path wipe, so the card beneath it does not judder through
 * a height transition, and Escape closes it and hands focus back to the trigger
 * it came from.
 *
 * The confirmation is a date, not a state. "Paused" tells you nothing you can
 * act on; "paused until 4 August, deliveries resume automatically" is the whole
 * message, and it is announced politely because it is the answer to something the
 * visitor just did rather than an interruption.
 *
 *   <div data-rm-pause-subscription data-rm-months="2">
 *     <p>Kelp coffee, every month (invented)</p>
 *   </div>
 */
export function pauseSubscription(target = "[data-rm-pause-subscription]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { months = 1, choices = [1, 2, 3], duration = 300, onPause } = options;
  const cleanups = [];

  for (const holder of holders) {
    holder.classList.add("rm-pause-subscription");
    const speed = dataNumber(holder, "rmDuration", duration);
    const preferred = clamp(Math.round(dataNumber(holder, "rmMonths", months)), 1, 12);
    const name = uid("rm-pause");

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "rm-pause-subscription-trigger";
    trigger.textContent = "Pause deliveries";
    trigger.setAttribute("aria-expanded", "false");

    const panel = document.createElement("div");
    panel.className = "rm-pause-subscription-panel";
    panel.id = uid("rm-pause-panel");
    panel.hidden = true;
    trigger.setAttribute("aria-controls", panel.id);

    const group = document.createElement("fieldset");
    group.className = "rm-pause-subscription-choices";
    const legend = document.createElement("legend");
    legend.textContent = "Pause for how long?";
    group.appendChild(legend);

    for (const count of choices) {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = name;
      input.value = String(count);
      input.checked = count === preferred;
      label.append(input, document.createTextNode(` ${count} month${count === 1 ? "" : "s"}`));
      group.appendChild(label);
    }

    const confirm = document.createElement("button");
    confirm.type = "button";
    confirm.className = "rm-pause-subscription-confirm";
    confirm.textContent = "Confirm pause";
    panel.append(group, confirm);

    const live = speaker(holder);
    holder.append(trigger, panel, live);

    let open = false;
    let paused = false;

    const show = (next, animated) => {
      open = next;
      trigger.setAttribute("aria-expanded", String(open));
      panel.hidden = !open;
      if (!open || !animated || prefersReducedMotion()) return;
      panel.animate(
        [
          { opacity: 0, transform: "translateY(-6px)", clipPath: "inset(0 0 100% 0)" },
          { opacity: 1, transform: "none", clipPath: "inset(0 0 0 0)" },
        ],
        { duration: speed, easing: EASE.out },
      );
    };

    const onTrigger = () => {
      if (paused) {
        paused = false;
        holder.classList.remove("is-paused");
        trigger.textContent = "Pause deliveries";
        // It is a disclosure again, so it says so again.
        trigger.setAttribute("aria-controls", panel.id);
        trigger.setAttribute("aria-expanded", "false");
        live.textContent = "Deliveries resumed. The next one is back on its usual date.";
        return;
      }
      show(!open, true);
      if (open) group.querySelector("input:checked, input")?.focus();
    };

    const onConfirm = () => {
      const chosen = Number(group.querySelector("input:checked")?.value ?? preferred);
      const until = new Date();
      until.setMonth(until.getMonth() + chosen);
      const when = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "long" }).format(until);
      paused = true;
      holder.classList.add("is-paused");
      // The trigger genuinely does a different thing now, so its name changes.
      // A toggle whose name stays put is right when the action is symmetrical;
      // this one is not.
      trigger.textContent = "Resume deliveries";
      show(false, false);
      // And it is no longer a disclosure at all: pressing it now resumes the
      // subscription and will never open the panel again. Leaving `aria-expanded`
      // on would have it announced as "Resume deliveries, collapsed, button",
      // promising a panel that does not exist any more.
      trigger.removeAttribute("aria-expanded");
      trigger.removeAttribute("aria-controls");
      trigger.focus();
      live.textContent = `Paused until ${when}. Deliveries resume automatically.`;
      onPause?.(chosen, holder);
      if (prefersReducedMotion()) return;
      trigger.animate(
        [{ transform: "scale(0.96)" }, { transform: "scale(1)" }],
        { duration: 320, easing: EASE.spring },
      );
    };

    const onKey = (event) => {
      if (event.key !== "Escape" || !open) return;
      event.preventDefault();
      show(false, false);
      trigger.focus();
    };

    trigger.addEventListener("click", onTrigger);
    confirm.addEventListener("click", onConfirm);
    holder.addEventListener("keydown", onKey);

    cleanups.push(() => {
      trigger.removeEventListener("click", onTrigger);
      confirm.removeEventListener("click", onConfirm);
      holder.removeEventListener("keydown", onKey);
      trigger.remove();
      panel.remove();
      live.remove();
      holder.classList.remove("rm-pause-subscription", "is-paused");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A year filter made of a real select, totalled aloud.
 *
 * The filter is the browser's own `<select>`, built from the years actually
 * present in the markup. That is deliberate: a native select brings type-ahead,
 * Home and End, the platform picker on a phone and voice control on a desktop,
 * and every div-and-listbox rebuild gives up at least two of those — usually the
 * two nobody tested. The options cannot go stale either, because they are read
 * from the rows rather than written twice.
 *
 * Filtering FLIPs the surviving rows so the table closes up in one movement, and
 * the running total is recomputed and announced politely once, rather than the
 * rows announcing themselves one at a time as they disappear.
 *
 *   <div data-rm-invoice-list data-rm-currency="GBP">
 *     <ul>
 *       <li data-rm-year="2031" data-rm-amount="48">RM-0031 — 4 April 2031</li>
 *       <li data-rm-year="2030" data-rm-amount="112.5">RM-0022 — 9 November 2030</li>
 *     </ul>
 *   </div>
 */
export function invoiceList(target = "[data-rm-invoice-list]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { currency = "GBP", label = "Filter by year", allWord = "All years" } = options;
  const cleanups = [];

  for (const holder of holders) {
    const rows = [...holder.querySelectorAll("[data-rm-year]")];
    if (!rows.length) continue;

    holder.classList.add("rm-invoice-list");
    const unit = dataString(holder, "rmCurrency", currency);
    const word = dataString(holder, "rmLabel", label);
    rows.forEach((row) => row.classList.add("rm-invoice-list-row"));

    const bar = document.createElement("div");
    bar.className = "rm-invoice-list-bar";
    const caption = document.createElement("label");
    caption.textContent = word;
    caption.htmlFor = uid("rm-invoice-year");

    const select = document.createElement("select");
    select.className = "rm-invoice-list-select";
    select.id = caption.htmlFor;
    const years = [...new Set(rows.map((row) => dataString(row, "rmYear", "")).filter(Boolean))]
      .sort((a, b) => Number(b) - Number(a));
    for (const value of ["all", ...years]) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value === "all" ? allWord : value;
      select.appendChild(option);
    }

    const total = document.createElement("p");
    total.className = "rm-invoice-list-total";
    const live = speaker(holder);
    bar.append(caption, select, total);
    holder.prepend(bar);

    const tally = (announce) => {
      const shown = rows.filter((row) => !row.hidden);
      const sum = shown.reduce((amount, row) => amount + dataNumber(row, "rmAmount", 0), 0);
      const sentence = `${shown.length} ${shown.length === 1 ? "invoice" : "invoices"}, ${money(sum, unit)}`;
      total.textContent = sentence;
      if (announce) live.textContent = sentence;
    };

    const onChange = () => {
      const wanted = select.value;
      flipList(rows, () => {
        rows.forEach((row) => {
          row.hidden = wanted !== "all" && dataString(row, "rmYear", "") !== wanted;
        });
      }, 320);
      tally(true);
    };
    select.addEventListener("change", onChange);
    tally(false);

    cleanups.push(() => {
      select.removeEventListener("change", onChange);
      bar.remove();
      live.remove();
      rows.forEach((row) => {
        row.hidden = false;
        row.classList.remove("rm-invoice-list-row");
      });
      holder.classList.remove("rm-invoice-list");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A determinate bar that does not read itself out.
 *
 * The bar is a real `role="progressbar"` with `aria-valuenow`, and that is
 * precisely why it is *not* inside a live region. A percentage in a live region
 * is announced on every value it is given, so a download that ticks from 1 to 100
 * interrupts a screen reader a hundred times and drowns out everything else on
 * the page. A progressbar is polled, not announced; only the start and the finish
 * are spoken, which is the whole of what anybody needs to hear.
 *
 * The fill is a `scaleX` on a track that is already full width, so nothing about
 * the row reflows as it advances, and the file's size and type are written as
 * text beside the name rather than left to an icon — "PDF, 284 KB" is information,
 * a red rectangle is not.
 *
 *   <li data-rm-download-row data-rm-file="statement-april.pdf" data-rm-size="PDF, 284 KB">
 *     <h3>April statement (invented)</h3>
 *   </li>
 *   row.rmProgress(0.4);
 */
export function downloadRow(target = "[data-rm-download-row]", options = {}) {
  const rows = resolveElements(target);
  if (!rows.length) return () => {};

  const { buttonText = "Download", onDownload } = options;
  const cleanups = [];

  for (const row of rows) {
    row.classList.add("rm-download-row");
    const file = dataString(row, "rmFile", "");
    const size = dataString(row, "rmSize", "");
    const name = row.querySelector("h1,h2,h3,h4,h5,h6")?.textContent?.trim() || file || "this file";

    let note = null;
    if (size) {
      note = document.createElement("p");
      note.className = "rm-download-row-size";
      note.textContent = size;
      row.appendChild(note);
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "rm-download-row-button";
    button.textContent = dataString(row, "rmButton", buttonText);
    button.setAttribute("aria-label", `${dataString(row, "rmButton", buttonText)} ${name}`);

    const bar = document.createElement("div");
    bar.className = "rm-download-row-bar";
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", "100");
    bar.setAttribute("aria-label", `${name} download progress`);
    bar.hidden = true;
    const fill = document.createElement("i");
    fill.setAttribute("aria-hidden", "true");
    bar.appendChild(fill);

    const live = speaker(row);
    row.append(button, bar, live);

    const set = (share) => {
      const value = clamp(share, 0, 1);
      bar.hidden = false;
      fill.style.transform = `scaleX(${value})`;
      bar.setAttribute("aria-valuenow", String(Math.round(value * 100)));
      bar.setAttribute("aria-valuetext", `${Math.round(value * 100)} per cent of ${name}`);
      if (value < 1) return;
      // Spoken once, at the end. Everything between is for the eye.
      live.textContent = `${name} ready.`;
      row.classList.add("is-done");
    };

    const go = () => {
      row.classList.remove("is-done");
      set(0);
      live.textContent = `Preparing ${name}.`;
      const result = onDownload?.(row);
      if (result && typeof result.then === "function") result.then(() => set(1), () => set(1));
    };
    button.addEventListener("click", go);
    row.rmProgress = set;

    cleanups.push(() => {
      button.removeEventListener("click", go);
      delete row.rmProgress;
      button.remove();
      bar.remove();
      note?.remove();
      live.remove();
      row.classList.remove("rm-download-row", "is-done");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Removing one item without losing the keyboard's place.
 *
 * Deleting a card from a grid is where keyboard users are most often dropped: the
 * element holding focus is removed, focus falls back to `<body>`, and the next
 * Tab press starts again from the top of a page of forty saved products. So focus
 * is moved deliberately — to the next item's remove button, or to the previous
 * one at the end of the list, or to the empty-state message when the last item
 * goes.
 *
 * The survivors FLIP into their new positions rather than snapping, which is the
 * only way to make a grid re-flow legible, and the removal is announced with the
 * item's name and the new count. The empty state is toggled with `hidden` from
 * JavaScript, never sat behind `display: none` in the stylesheet, so a page whose
 * script fails shows the real grid instead of nothing.
 *
 *   <ul data-rm-wishlist-grid>
 *     <li><img src="/photos/kelp-mug.jpg" alt="Kelp mug, glazed stoneware"><h3>Kelp mug</h3></li>
 *   </ul>
 */
export function wishlistGrid(target = "[data-rm-wishlist-grid]", options = {}) {
  const grids = resolveElements(target);
  if (!grids.length) return () => {};

  const { duration = 340, label = "Saved items", emptyText = "Nothing saved yet." } = options;
  const cleanups = [];

  for (const grid of grids) {
    const items = [...grid.children];
    if (!items.length) continue;

    grid.classList.add("rm-wishlist-grid");
    const hadLabel = grid.getAttribute("aria-label");
    grid.setAttribute("aria-label", dataString(grid, "rmLabel", hadLabel ?? label));
    const speed = dataNumber(grid, "rmDuration", duration);
    const live = speaker(grid, "polite", true);

    const empty = document.createElement("p");
    empty.className = "rm-wishlist-grid-empty";
    empty.textContent = dataString(grid, "rmEmptyText", emptyText);
    empty.tabIndex = -1;
    empty.hidden = true;
    grid.after(empty);

    const drops = [];
    const alive = () => items.filter((item) => item.isConnected);

    const remove = (item) => {
      const list = alive();
      const at = list.indexOf(item);
      if (at < 0) return;
      const name = item.querySelector("h1,h2,h3,h4,h5,h6")?.textContent?.trim() ?? "Item";
      // Where focus goes next, decided before the element holding it is removed.
      const next = list[at + 1] ?? list[at - 1] ?? null;

      flipList(list, () => item.remove(), speed);
      const left = alive().length;
      live.textContent = `${name} removed. ${left} ${left === 1 ? "item" : "items"} saved.`;
      empty.hidden = left > 0;
      if (next) next.querySelector(".rm-wishlist-grid-drop")?.focus();
      else empty.focus();
    };

    for (const item of items) {
      item.classList.add("rm-wishlist-grid-item");
      const name = item.querySelector("h1,h2,h3,h4,h5,h6")?.textContent?.trim() ?? "this item";

      const drop = document.createElement("button");
      drop.type = "button";
      drop.className = "rm-wishlist-grid-drop";
      drop.setAttribute("aria-label", `Remove ${name} from saved items`);
      drop.textContent = "×";
      drop.addEventListener("click", () => remove(item));
      item.appendChild(drop);
      drops.push(drop);
    }

    grid.rmRemove = remove;

    cleanups.push(() => {
      delete grid.rmRemove;
      drops.forEach((drop) => drop.remove());
      items.forEach((item) => item.classList.remove("rm-wishlist-grid-item"));
      empty.remove();
      live.remove();
      grid.classList.remove("rm-wishlist-grid");
      if (hadLabel === null) grid.removeAttribute("aria-label");
      else grid.setAttribute("aria-label", hadLabel);
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A real form, a real rating input, a real error summary.
 *
 * The rating is five `<input type="radio">` in a `<fieldset>` with a `<legend>`,
 * clipped rather than `display: none` so they keep their focus ring, their arrow
 * keys and their form value. Every label says "3 stars" in text; the glyphs are
 * `aria-hidden` decoration. The row of clickable spans that usually stands in for
 * this cannot be reached by a keyboard, cannot be submitted, and is announced as
 * five identical images.
 *
 * On a failed submit an error summary appears at the top with a link to each
 * offending field and takes focus, which is the pattern that actually works: an
 * error message rendered quietly beside a control forty lines down is one nobody
 * finds. It is the single `assertive` region in this file, because an error is
 * the one thing here worth interrupting for.
 *
 *   <form data-rm-review-form data-rm-limit="600">
 *     <label for="review-body">Your review</label>
 *     <textarea id="review-body" name="body"></textarea>
 *     <button type="submit">Post review</button>
 *   </form>
 */
export function reviewForm(target = "[data-rm-review-form]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { scale = 5, limit = 600, glyph = "★", onSubmit } = options;
  const cleanups = [];

  for (const holder of holders) {
    const form = holder.tagName === "FORM" ? holder : holder.querySelector("form");
    const body = holder.querySelector("textarea");
    if (!form) continue;

    form.classList.add("rm-review-form");
    const stars = Math.max(1, Math.round(dataNumber(holder, "rmScale", scale)));
    const cap = Math.max(0, dataNumber(holder, "rmLimit", limit));
    const name = uid("rm-review-rating");

    const errors = document.createElement("div");
    errors.className = "rm-review-form-errors";
    errors.setAttribute("role", "alert");
    errors.tabIndex = -1;
    errors.hidden = true;

    const group = document.createElement("fieldset");
    group.className = "rm-review-form-rating";
    const legend = document.createElement("legend");
    legend.textContent = dataString(holder, "rmRatingLabel", "Your rating");
    group.appendChild(legend);
    group.id = uid("rm-review-rating-group");

    for (let i = 1; i <= stars; i += 1) {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = name;
      input.value = String(i);
      const mark = document.createElement("span");
      mark.setAttribute("aria-hidden", "true");
      mark.textContent = glyph.repeat(i);
      label.append(input, mark, said(` ${i} ${i === 1 ? "star" : "stars"}`));
      group.appendChild(label);
    }
    form.prepend(errors, group);

    // Both of these belong to the page, not to this component: the counter's id
    // is appended to whatever description the textarea already carried, and a
    // failed submit gives the textarea an id so the error summary can link to
    // it. Neither may survive teardown — a dangling `aria-describedby` points at
    // an element that no longer exists, and a second mount would append a second
    // id to the first one's leftovers.
    const hadDescribedBy = body ? body.getAttribute("aria-describedby") : null;
    const hadBodyId = body ? body.id : "";

    let counter = null;
    const onType = () => {
      if (!counter || !body) return;
      const left = cap - body.value.length;
      counter.textContent = `${left} characters left`;
      counter.classList.toggle("is-over", left < 0);
    };

    if (body && cap > 0) {
      body.classList.add("rm-review-form-body");
      counter = document.createElement("p");
      counter.className = "rm-review-form-count";
      counter.id = uid("rm-review-count");
      // A polite region, not assertive: a running count that interrupts on every
      // keystroke is unusable, and the browser only reads it when typing pauses.
      counter.setAttribute("aria-live", "polite");
      body.after(counter);
      body.setAttribute("aria-describedby", [body.getAttribute("aria-describedby"), counter.id].filter(Boolean).join(" "));
      onType();
      body.addEventListener("input", onType);
    }

    const onSend = (event) => {
      event.preventDefault();
      const faults = [];
      const chosen = group.querySelector("input:checked");
      if (!chosen) faults.push([group.id, "Choose a rating from one to five stars."]);
      if (body && !body.value.trim()) faults.push([body.id || (body.id = uid("rm-review-body")), "Write a few words about the product."]);
      if (body && cap > 0 && body.value.length > cap) {
        faults.push([body.id, `Shorten your review to ${cap} characters or fewer.`]);
      }

      errors.replaceChildren();
      if (faults.length) {
        const title = document.createElement("p");
        title.textContent = `There ${faults.length === 1 ? "is 1 problem" : `are ${faults.length} problems`} with this review`;
        const list = document.createElement("ul");
        for (const [id, message] of faults) {
          const row = document.createElement("li");
          const link = document.createElement("a");
          link.href = `#${id}`;
          link.textContent = message;
          link.addEventListener("click", (jump) => {
            jump.preventDefault();
            const field = document.getElementById(id);
            (field?.querySelector("input") ?? field)?.focus();
          });
          row.appendChild(link);
          list.appendChild(row);
        }
        errors.append(title, list);
        errors.hidden = false;
        errors.focus();
        return;
      }

      errors.hidden = true;
      onSubmit?.({ rating: Number(chosen.value), body: body?.value ?? "" }, form);
      if (prefersReducedMotion()) return;
      group.animate(
        [{ transform: "scale(0.99)" }, { transform: "scale(1)" }],
        { duration: 300, easing: EASE.spring },
      );
    };
    form.addEventListener("submit", onSend);

    cleanups.push(() => {
      form.removeEventListener("submit", onSend);
      body?.removeEventListener("input", onType);
      counter?.remove();
      if (body) {
        if (hadDescribedBy === null) body.removeAttribute("aria-describedby");
        else body.setAttribute("aria-describedby", hadDescribedBy);
        if (hadBodyId) body.id = hadBodyId;
        else body.removeAttribute("id");
      }
      body?.classList.remove("rm-review-form-body");
      group.remove();
      errors.remove();
      form.classList.remove("rm-review-form");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A clamped body that expands from a measurement.
 *
 * A long review is clamped to a few lines and opened by a real
 * `<button aria-expanded>` — but only when there is genuinely something hidden.
 * The component measures the body's full height against its clamped height and
 * removes the button entirely when the review is short, because a "read more"
 * that reveals nothing is a control that teaches people to stop trusting the
 * control.
 *
 * Expanding is deliberately not a FLIP. Removing the clamp moves neither the
 * card's top-left corner nor its width — only its height — and the one thing a
 * FLIP cannot honestly invert is a height: a `scaleY` would squash every line of
 * the text on the way open. So the clamp comes off, the layout settles in a
 * single pass, and the newly revealed text is played in with an opacity and
 * `clip-path` wipe, exactly the way `orderCard()` reveals its detail. Nothing
 * animates a height, so the reviews below it move once instead of on every frame.
 * "Helpful" is a toggle button with `aria-pressed` and a count that rolls in place
 * at a fixed width.
 *
 *   <article data-rm-review-card data-rm-clamp="4" data-rm-helpful="12">
 *     <h3>Sturdier than it looks</h3>
 *     <p>Bought this for the studio and it has survived a winter of abuse…</p>
 *   </article>
 */
export function reviewCard(target = "[data-rm-review-card]", options = {}) {
  const cards = resolveElements(target);
  if (!cards.length) return () => {};

  const { clampLines = 4, duration = 340, helpfulLabel = "Mark this review helpful" } = options;
  const cleanups = [];

  for (const card of cards) {
    const body = card.querySelector("p");
    if (!body) continue;

    card.classList.add("rm-review-card");
    body.classList.add("rm-review-card-body");
    const lines = Math.max(1, Math.round(dataNumber(card, "rmClamp", clampLines)));
    body.style.setProperty("--rm-review-card-lines", String(lines));
    const speed = dataNumber(card, "rmDuration", duration);
    if (!body.id) body.id = uid("rm-review-body");

    let open = false;
    card.classList.add("is-clamped");

    const more = document.createElement("button");
    more.type = "button";
    more.className = "rm-review-card-more";
    more.setAttribute("aria-controls", body.id);
    more.setAttribute("aria-expanded", "false");
    more.textContent = "Read the whole review";
    body.after(more);

    // Only worth a button if something is actually cut off. Measured, not
    // guessed from a character count, which is wrong at every other font size.
    const overflows = () => body.scrollHeight > body.clientHeight + 2;
    const check = () => { more.hidden = open ? false : !overflows(); };
    const watcher = new ResizeObserver(check);
    watcher.observe(body);
    check();

    const onMore = () => {
      // The clamped height, taken before the class comes off, is where the wipe
      // starts: the lines that were already readable do not flash, and only the
      // part that has just been revealed is played.
      const clamped = body.clientHeight;
      open = !open;
      card.classList.toggle("is-clamped", !open);
      more.setAttribute("aria-expanded", String(open));
      more.textContent = open ? "Show less" : "Read the whole review";
      check();
      // Only on the way open. Wiping the text back shut would animate a
      // paragraph the clamp is about to cut off mid-sentence anyway, which
      // reads as a glitch rather than as a closing.
      if (!open || prefersReducedMotion()) return;
      const full = body.clientHeight;
      if (full <= clamped) return;
      const from = ((full - clamped) / full) * 100;
      body.animate(
        [
          { clipPath: `inset(0 0 ${from}% 0)`, opacity: 0.55 },
          { clipPath: "inset(0 0 0 0)", opacity: 1 },
        ],
        { duration: speed, easing: EASE.out },
      );
    };
    more.addEventListener("click", onMore);

    const helpful = document.createElement("button");
    helpful.type = "button";
    helpful.className = "rm-review-card-helpful";
    helpful.setAttribute("aria-pressed", "false");
    // The name never changes, so it is announced as "…, pressed" rather than as
    // a button that renamed itself and left the state to be inferred.
    helpful.setAttribute("aria-label", dataString(card, "rmHelpfulLabel", helpfulLabel));
    const face = document.createElement("span");
    face.className = "rm-review-card-tally";
    let votes = Math.max(0, Math.round(dataNumber(card, "rmHelpful", 0)));
    face.textContent = String(votes);
    helpful.append(document.createTextNode("Helpful "), face);
    card.appendChild(helpful);

    let pressed = false;
    const onHelpful = () => {
      pressed = !pressed;
      votes += pressed ? 1 : -1;
      helpful.setAttribute("aria-pressed", String(pressed));
      face.textContent = String(votes);
      if (prefersReducedMotion()) return;
      face.animate(
        [{ transform: `translateY(${pressed ? 60 : -60}%)`, opacity: 0 }, { transform: "none", opacity: 1 }],
        { duration: 280, easing: EASE.out },
      );
    };
    helpful.addEventListener("click", onHelpful);

    cleanups.push(() => {
      watcher.disconnect();
      more.removeEventListener("click", onMore);
      helpful.removeEventListener("click", onHelpful);
      more.remove();
      helpful.remove();
      body.style.removeProperty("--rm-review-card-lines");
      body.classList.remove("rm-review-card-body");
      card.classList.remove("rm-review-card", "is-clamped");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Answers that re-sort by vote, moved by transform.
 *
 * A question with several answers is a list whose order is the information, so a
 * vote that changes the order has to show the change happening — otherwise the
 * page silently rearranges itself and the visitor loses the answer they were
 * reading. The re-order is a FLIP: the answers are measured, moved in the DOM in
 * one mutation, and played back from where they were.
 *
 * The vote is a real toggle button with `aria-pressed` and a fixed accessible
 * name, and the outcome is announced as a position — "moved to position 1 of 4,
 * 13 votes" — because a number quietly incrementing somewhere off screen is not
 * feedback. The seller's own answer keeps its place at the top regardless, marked
 * in words rather than only by a badge colour.
 *
 *   <section data-rm-question-answer>
 *     <h3>Does the lid fit the older size?</h3>
 *     <ul>
 *       <li data-rm-votes="8">Yes, mine fits the 2029 one.</li>
 *       <li data-rm-votes="3" data-rm-seller="true">The lid is shared across both sizes.</li>
 *     </ul>
 *   </section>
 */
export function questionAnswer(target = "[data-rm-question-answer]", options = {}) {
  const blocks = resolveElements(target);
  if (!blocks.length) return () => {};

  const { duration = 380, voteLabel = "Mark this answer useful", sellerWord = "Answer from the seller" } = options;
  const cleanups = [];

  for (const block of blocks) {
    const list = block.querySelector("ol, ul");
    const answers = list ? [...list.children] : [];
    if (!answers.length) continue;

    block.classList.add("rm-question-answer");
    const speed = dataNumber(block, "rmDuration", duration);
    const live = speaker(block);
    list.classList.add("rm-question-answer-list");
    const order = [...list.children];

    const scores = new Map();
    const added = [];

    for (const answer of answers) {
      answer.classList.add("rm-question-answer-item");
      scores.set(answer, { votes: Math.max(0, dataNumber(answer, "rmVotes", 0)), pressed: false });

      if (dataString(answer, "rmSeller", "false") === "true") {
        answer.classList.add("is-seller");
        const flag = document.createElement("p");
        flag.className = "rm-question-answer-flag";
        flag.textContent = dataString(block, "rmSellerWord", sellerWord);
        answer.prepend(flag);
        added.push(flag);
      }

      const vote = document.createElement("button");
      vote.type = "button";
      vote.className = "rm-question-answer-vote";
      vote.setAttribute("aria-pressed", "false");
      vote.setAttribute("aria-label", dataString(block, "rmVoteLabel", voteLabel));
      const count = document.createElement("span");
      count.className = "rm-question-answer-count";
      count.textContent = String(scores.get(answer).votes);
      vote.append(document.createTextNode("Useful "), count);
      answer.appendChild(vote);
      added.push(vote);

      vote.addEventListener("click", () => {
        const score = scores.get(answer);
        score.pressed = !score.pressed;
        score.votes += score.pressed ? 1 : -1;
        vote.setAttribute("aria-pressed", String(score.pressed));
        count.textContent = String(score.votes);

        // Seller answers stay put; the rest sort by vote, highest first.
        const sorted = [...answers].sort((a, b) => {
          const sellerA = a.classList.contains("is-seller") ? 1 : 0;
          const sellerB = b.classList.contains("is-seller") ? 1 : 0;
          if (sellerA !== sellerB) return sellerB - sellerA;
          return scores.get(b).votes - scores.get(a).votes;
        });
        flipList(answers, () => sorted.forEach((node) => list.appendChild(node)), speed);
        live.textContent =
          `Moved to position ${sorted.indexOf(answer) + 1} of ${answers.length}, ${score.votes} votes.`;
      });
    }

    cleanups.push(() => {
      added.forEach((node) => node.remove());
      order.forEach((node) => list.appendChild(node));
      answers.forEach((answer) => answer.classList.remove("rm-question-answer-item", "is-seller"));
      list.classList.remove("rm-question-answer-list");
      live.remove();
      block.classList.remove("rm-question-answer");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A thread and a reply, both with focus handed back.
 *
 * Two disclosures on one card, and the whole component is really about where
 * focus goes. Opening the reply moves focus into the textarea, because a reply
 * box that appears and leaves the cursor forty elements away is a reply box
 * nobody types into; Escape closes it and puts focus back on the button that
 * opened it, because being dropped at the top of a ticket list is the fastest way
 * to lose a support conversation.
 *
 * The "updated 3 hours ago" line is `Intl.RelativeTimeFormat` from a plain number
 * of hours, so it is translated by the platform rather than hard-coded in English,
 * and the raw wording is carried in a `<time>` element's `datetime` for anything
 * parsing the page. The reference is fictional and the ticket state is a word, not
 * a colour.
 *
 *   <article data-rm-support-ticket data-rm-ref="RM-TKT-0044" data-rm-state="open" data-rm-since="3">
 *     <h3>Parcel marked delivered but not here</h3>
 *     <div data-rm-thread><p>Thanks for getting in touch…</p></div>
 *   </article>
 */
export function supportTicket(target = "[data-rm-support-ticket]", options = {}) {
  const tickets = resolveElements(target);
  if (!tickets.length) return () => {};

  const { duration = 300, onReply } = options;
  const cleanups = [];

  for (const ticket of tickets) {
    ticket.classList.add("rm-support-ticket");
    const speed = dataNumber(ticket, "rmDuration", duration);
    const reference = dataString(ticket, "rmRef", "");
    const hours = dataNumber(ticket, "rmSince", 0);
    const state = STATES[dataString(ticket, "rmState", "open").toLowerCase()] ?? STATES.open;

    const meta = document.createElement("p");
    meta.className = "rm-support-ticket-meta";
    if (reference) meta.append(`Reference ${reference} · `);
    const badge = document.createElement("span");
    badge.className = `rm-support-ticket-state is-${state.tone}`;
    badge.textContent = state.word;
    meta.appendChild(badge);

    if (hours > 0) {
      const stamp = document.createElement("time");
      const days = Math.round(hours / 24);
      try {
        const relative = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
        stamp.textContent = ` · updated ${days >= 2 ? relative.format(-days, "day") : relative.format(-Math.round(hours), "hour")}`;
      } catch {
        stamp.textContent = ` · updated ${Math.round(hours)} hours ago`;
      }
      const when = new Date(Date.now() - hours * 3600000);
      stamp.dateTime = when.toISOString();
      meta.appendChild(stamp);
    }
    ticket.prepend(meta);

    const thread = ticket.querySelector("[data-rm-thread]");
    const buttons = [];
    let threadToggle = null;

    if (thread) {
      thread.classList.add("rm-support-ticket-thread");
      if (!thread.id) thread.id = uid("rm-ticket-thread");
      threadToggle = document.createElement("button");
      threadToggle.type = "button";
      threadToggle.className = "rm-support-ticket-toggle";
      threadToggle.setAttribute("aria-controls", thread.id);
      threadToggle.setAttribute("aria-expanded", "false");
      threadToggle.textContent = "Show the conversation";
      thread.before(threadToggle);
      buttons.push(threadToggle);
      thread.hidden = true;

      threadToggle.addEventListener("click", () => {
        const open = thread.hidden;
        thread.hidden = !open;
        threadToggle.setAttribute("aria-expanded", String(open));
        threadToggle.textContent = open ? "Hide the conversation" : "Show the conversation";
        if (!open || prefersReducedMotion()) return;
        thread.animate(
          [
            { opacity: 0, transform: "translateY(-6px)", clipPath: "inset(0 0 100% 0)" },
            { opacity: 1, transform: "none", clipPath: "inset(0 0 0 0)" },
          ],
          { duration: speed, easing: EASE.out },
        );
      });
    }

    const replyToggle = document.createElement("button");
    replyToggle.type = "button";
    replyToggle.className = "rm-support-ticket-toggle";
    replyToggle.setAttribute("aria-expanded", "false");
    replyToggle.textContent = "Reply";

    const panel = document.createElement("div");
    panel.className = "rm-support-ticket-reply";
    panel.id = uid("rm-ticket-reply");
    panel.hidden = true;
    replyToggle.setAttribute("aria-controls", panel.id);

    const label = document.createElement("label");
    label.htmlFor = uid("rm-ticket-message");
    label.textContent = "Your message";
    const field = document.createElement("textarea");
    field.id = label.htmlFor;
    field.rows = 3;
    const send = document.createElement("button");
    send.type = "button";
    send.className = "rm-support-ticket-send";
    send.textContent = "Send reply";
    panel.append(label, field, send);

    const live = speaker(ticket);
    ticket.append(replyToggle, panel, live);
    buttons.push(replyToggle, send);

    const showReply = (open) => {
      panel.hidden = !open;
      replyToggle.setAttribute("aria-expanded", String(open));
      if (!open) return;
      field.focus();
      if (prefersReducedMotion()) return;
      panel.animate(
        [
          { opacity: 0, transform: "translateY(-6px)", clipPath: "inset(0 0 100% 0)" },
          { opacity: 1, transform: "none", clipPath: "inset(0 0 0 0)" },
        ],
        { duration: speed, easing: EASE.out },
      );
    };

    const onReplyToggle = () => showReply(panel.hidden);
    const onSend = () => {
      const text = field.value.trim();
      if (!text) { field.focus(); live.textContent = "Write a message before sending."; return; }
      onReply?.(text, ticket);
      field.value = "";
      showReply(false);
      replyToggle.focus();
      live.textContent = "Reply added to the conversation.";
    };
    const onKey = (event) => {
      if (event.key !== "Escape" || panel.hidden) return;
      event.preventDefault();
      showReply(false);
      replyToggle.focus();
    };

    replyToggle.addEventListener("click", onReplyToggle);
    send.addEventListener("click", onSend);
    ticket.addEventListener("keydown", onKey);

    cleanups.push(() => {
      replyToggle.removeEventListener("click", onReplyToggle);
      send.removeEventListener("click", onSend);
      ticket.removeEventListener("keydown", onKey);
      buttons.forEach((button) => { if (button !== threadToggle) button.remove(); });
      threadToggle?.remove();
      panel.remove();
      meta.remove();
      live.remove();
      if (thread) {
        thread.hidden = false;
        thread.classList.remove("rm-support-ticket-thread");
      }
      ticket.classList.remove("rm-support-ticket");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A log that only follows you when you were following it.
 *
 * This mounts on the thread rather than on one bubble, because a bubble cannot
 * answer the question that matters: was the reader at the bottom when the message
 * arrived? A thread that scrolls to the newest message unconditionally yanks the
 * page away from somebody reading six messages back, every time — which is the
 * single most complained-about behaviour in every support chat ever shipped. So
 * the pin is checked first, and a reader who has scrolled up is offered a button
 * instead.
 *
 * The scroll is done with `keepInView`, which moves this container and nothing
 * else; `scrollIntoView` walks up and scrolls every scrollable ancestor including
 * the page. The thread is a `role="log"` with `aria-live="polite"`, so arriving
 * messages are read in order without interrupting, and each bubble names its
 * author in text rather than relying on which side of the column it sits on.
 *
 *   <ul data-rm-chat-bubble data-rm-label="Conversation about RM-TKT-0044">
 *     <li data-rm-from="them" data-rm-author="Ines at support">Thanks for the photograph.</li>
 *     <li data-rm-from="you" data-rm-author="You">No problem — the box was empty.</li>
 *   </ul>
 */
export function chatBubble(target = "[data-rm-chat-bubble]", options = {}) {
  const threads = resolveElements(target);
  if (!threads.length) return () => {};

  const { duration = 320, label = "Conversation", newText = "New message" } = options;
  const cleanups = [];

  for (const thread of threads) {
    thread.classList.add("rm-chat-bubble");
    thread.setAttribute("role", "log");
    thread.setAttribute("aria-live", "polite");
    thread.setAttribute("aria-relevant", "additions");
    const hadLabel = thread.getAttribute("aria-label");
    thread.setAttribute("aria-label", dataString(thread, "rmLabel", hadLabel ?? label));
    const speed = dataNumber(thread, "rmDuration", duration);
    // The thread is the guaranteed landing site for focus when the jump button
    // hides itself. An author's own `<li>` is not focusable, so `focus()` on it
    // is a no-op and the browser drops focus on `<body>` — the reader is thrown
    // back to the top of the document by pressing "New message".
    const hadTabIndex = thread.getAttribute("tabindex");
    thread.setAttribute("tabindex", "-1");
    const pushed = new Set();

    const dress = (bubble) => {
      bubble.classList.add("rm-chat-bubble-item");
      const from = dataString(bubble, "rmFrom", "them") === "you" ? "you" : "them";
      bubble.classList.add(`is-${from}`);
      const author = dataString(bubble, "rmAuthor", "");
      // Which side of the column a bubble sits on is invisible to a screen
      // reader and ambiguous at a glance in a long thread, so the author is
      // written down.
      if (author && !bubble.querySelector(".rm-chat-bubble-author")) {
        const who = document.createElement("span");
        who.className = "rm-chat-bubble-author";
        who.textContent = author;
        bubble.prepend(who);
      }
    };
    [...thread.children].forEach(dress);

    const jump = document.createElement("button");
    jump.type = "button";
    jump.className = "rm-chat-bubble-jump";
    jump.textContent = dataString(thread, "rmNewText", newText);
    jump.hidden = true;
    thread.after(jump);

    const pinned = () =>
      thread.scrollHeight - thread.scrollTop - thread.clientHeight < 48;

    const toEnd = () => {
      const last = thread.lastElementChild;
      if (last) keepInView(thread, last, prefersReducedMotion() ? "auto" : "smooth");
      jump.hidden = true;
    };

    const onScroll = () => { if (pinned()) jump.hidden = true; };
    // Focus moves first and hiding comes second. Doing it the other way round
    // hides the element that currently has focus, and the browser has nowhere to
    // put it but `<body>`. The newest bubble is given `tabindex="-1"` when this
    // component appends it, so it can be landed on; a bubble that came from the
    // author's markup has none, and the thread takes the focus instead.
    const onJump = () => {
      const last = thread.lastElementChild;
      (last?.hasAttribute("tabindex") ? last : thread).focus();
      toEnd();
    };
    thread.addEventListener("scroll", onScroll);
    jump.addEventListener("click", onJump);

    thread.rmPush = (text, { from = "them", author = "" } = {}) => {
      const wasPinned = pinned();
      const bubble = document.createElement("li");
      bubble.tabIndex = -1;
      pushed.add(bubble);
      bubble.dataset.rmFrom = from;
      if (author) bubble.dataset.rmAuthor = author;
      const line = document.createElement("p");
      line.textContent = text;
      bubble.appendChild(line);
      thread.appendChild(bubble);
      dress(bubble);

      if (!prefersReducedMotion()) {
        bubble.animate(
          [
            { opacity: 0, transform: `translate(${from === "you" ? 12 : -12}px, 8px) scale(0.96)` },
            { opacity: 1, transform: "none" },
          ],
          { duration: speed, easing: EASE.out },
        );
      }
      // Only follow a reader who was already at the bottom.
      if (wasPinned) toEnd();
      else jump.hidden = false;
      return bubble;
    };

    cleanups.push(() => {
      thread.removeEventListener("scroll", onScroll);
      jump.removeEventListener("click", onJump);
      delete thread.rmPush;
      jump.remove();
      thread.querySelectorAll(".rm-chat-bubble-author").forEach((who) => who.remove());
      [...thread.children].forEach((bubble) => {
        bubble.classList.remove("rm-chat-bubble-item", "is-you", "is-them");
        // Only the ones this component made; an author's own bubble may have
        // carried a tabindex of its own.
        if (pushed.has(bubble)) bubble.removeAttribute("tabindex");
      });
      thread.classList.remove("rm-chat-bubble");
      ["role", "aria-live", "aria-relevant"].forEach((name) => thread.removeAttribute(name));
      if (hadTabIndex === null) thread.removeAttribute("tabindex");
      else thread.setAttribute("tabindex", hadTabIndex);
      if (hadLabel === null) thread.removeAttribute("aria-label");
      else thread.setAttribute("aria-label", hadLabel);
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Three stages, filled by clip-path and said in one line.
 *
 * A refund is the most anxious thing in an account, so the component's whole job
 * is to say one complete sentence: what stage it is at, how much, where the money
 * goes back to and roughly when. A row of ticks alone answers none of those, and a
 * bare "processing" answers the least useful one.
 *
 * The bar is a coloured copy of the same three-stage track revealed with a
 * `clip-path` inset, which is a paint-only property — the usual version animates
 * the fill's `width`, which re-lays-out the row on every frame and, on a page
 * listing several refunds, on every frame for each of them. Where the money
 * returns to is described as "the method you paid with", never as a card number,
 * because this component has no business knowing one.
 *
 *   <div data-rm-refund-status data-rm-stage="approved" data-rm-amount="48" data-rm-days="5"></div>
 *   panel.rmSet("paid");
 */
export function refundStatus(target = "[data-rm-refund-status]", options = {}) {
  const panels = resolveElements(target);
  if (!panels.length) return () => {};

  const { stage = "requested", currency = "GBP", days = 5, duration = 620 } = options;
  const cleanups = [];

  const ORDER = ["requested", "approved", "paid"];
  const WORDS = {
    requested: "Refund requested",
    approved: "Refund approved",
    paid: "Refund sent back to the method you paid with",
  };

  for (const panel of panels) {
    const original = panel.innerHTML;
    panel.classList.add("rm-refund-status");
    panel.setAttribute("role", "status");
    panel.setAttribute("aria-live", "polite");

    const unit = dataString(panel, "rmCurrency", currency);
    const amount = dataNumber(panel, "rmAmount", 0);
    const wait = Math.max(0, Math.round(dataNumber(panel, "rmDays", days)));
    const speed = dataNumber(panel, "rmDuration", duration);

    const track = document.createElement("div");
    track.className = "rm-refund-status-track";
    track.setAttribute("aria-hidden", "true");
    const marks = ORDER.map(() => {
      const dot = document.createElement("i");
      track.appendChild(dot);
      return dot;
    });
    const fill = document.createElement("div");
    fill.className = "rm-refund-status-fill";
    fill.setAttribute("aria-hidden", "true");
    ORDER.forEach(() => fill.appendChild(document.createElement("i")));
    track.appendChild(fill);

    const words = document.createElement("p");
    words.className = "rm-refund-status-words";
    panel.replaceChildren(track, words);

    let at = 0;
    const paint = (grow) => {
      const share = ORDER.length > 1 ? at / (ORDER.length - 1) : 1;
      fill.style.clipPath = `inset(0 ${((1 - share) * 100).toFixed(2)}% 0 0)`;
      marks.forEach((dot, i) => dot.classList.toggle("is-done", i <= at));
      panel.classList.toggle("is-paid", at === ORDER.length - 1);
      const sum = amount > 0 ? `, ${money(amount, unit)}` : "";
      const when = at === ORDER.length - 1
        ? ` It should appear within ${wait} working ${wait === 1 ? "day" : "days"}.`
        : "";
      words.textContent = `${WORDS[ORDER[at]]}${sum}.${when}`;
      if (!grow || prefersReducedMotion()) return;
      fill.animate(
        [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: `inset(0 ${((1 - share) * 100).toFixed(2)}% 0 0)` }],
        { duration: speed, easing: EASE.out },
      );
    };

    // An unrecognised stage falls back to the first rather than drawing nothing.
    const found = ORDER.indexOf(dataString(panel, "rmStage", stage).toLowerCase());
    at = found < 0 ? 0 : found;
    paint(false);
    cleanups.push(watch(panel, () => paint(true), { threshold: 0.3, once: true }));

    panel.rmSet = (next) => {
      const index = ORDER.indexOf(String(next).toLowerCase());
      at = index < 0 ? at : index;
      paint(true);
    };

    cleanups.push(() => {
      delete panel.rmSet;
      ["role", "aria-live"].forEach((name) => panel.removeAttribute(name));
      panel.classList.remove("rm-refund-status", "is-paid");
      panel.innerHTML = original;
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * `aria-current`, a sliding marker, and counts in words.
 *
 * The current page is marked with `aria-current="page"`, which is the attribute
 * that actually tells anybody where they are; a class called `is-active` is a
 * paint job and nothing more. When no `data-rm-current` is given the component
 * matches the links against the document's own path, so the nav is right on every
 * page without the markup being edited per page.
 *
 * The marker is one element that FLIPs from link to link — measured, then moved
 * with translate and scale — rather than a bar whose `top` and `height` are
 * transitioned, which is a layout animation on every frame of a decoration. A
 * ResizeObserver re-measures when the column reflows, since a position taken from
 * a measurement is only correct until the container changes. Unread counts are
 * drawn as a number and read as "3 new", because a bare "3" beside "Orders" could
 * mean anything.
 *
 *   <nav data-rm-account-nav data-rm-current="/account/orders">
 *     <a href="/account">Overview</a>
 *     <a href="/account/orders" data-rm-tally="3">Orders</a>
 *   </nav>
 */
export function accountNav(target = "[data-rm-account-nav]", options = {}) {
  const navs = resolveElements(target);
  if (!navs.length) return () => {};

  const { duration = 340, label = "Account", word = "new" } = options;
  const cleanups = [];

  for (const nav of navs) {
    const links = [...nav.querySelectorAll("a[href]")];
    if (!links.length) continue;

    nav.classList.add("rm-account-nav");
    const hadLabel = nav.getAttribute("aria-label");
    // A landmark role added to a plain <div> has to come off again; a <nav>
    // already has one.
    const addedRole = nav.tagName !== "NAV" && !nav.hasAttribute("role");
    if (addedRole) nav.setAttribute("role", "navigation");
    nav.setAttribute("aria-label", dataString(nav, "rmLabel", hadLabel ?? label));
    const speed = dataNumber(nav, "rmDuration", duration);

    const marker = document.createElement("i");
    marker.className = "rm-account-nav-marker";
    marker.setAttribute("aria-hidden", "true");
    marker.hidden = true;
    nav.appendChild(marker);

    const tallies = [];
    for (const link of links) {
      link.classList.add("rm-account-nav-link");
      const count = Math.round(dataNumber(link, "rmTally", 0));
      if (count <= 0) continue;
      const badge = document.createElement("span");
      badge.className = "rm-account-nav-tally";
      badge.setAttribute("aria-hidden", "true");
      badge.textContent = String(count);
      link.append(badge, said(`, ${count} ${dataString(link, "rmWord", word)}`));
      tallies.push(badge, link.lastElementChild);
    }

    const wanted = dataString(nav, "rmCurrent", "");
    const here = typeof location === "object" ? location.pathname : "";
    let current = links.find((link) => link.getAttribute("href") === wanted)
      ?? links.find((link) => link.getAttribute("aria-current"))
      ?? (wanted ? null : links.find((link) => {
        try { return new URL(link.href, location.href).pathname === here; } catch { return false; }
      }))
      ?? null;

    const place = (animated) => {
      if (!current) { marker.hidden = true; return; }
      const was = marker.hidden ? null : marker.getBoundingClientRect();
      const box = current.getBoundingClientRect();
      const home = nav.getBoundingClientRect();
      marker.hidden = false;
      marker.style.width = `${box.width}px`;
      marker.style.height = `${box.height}px`;
      marker.style.left = `${box.left - home.left}px`;
      marker.style.top = `${box.top - home.top + nav.scrollTop}px`;
      if (animated) flipTo(marker, was, speed);
    };

    const mark = () => {
      links.forEach((link) => {
        const on = link === current;
        link.classList.toggle("is-current", on);
        if (on) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      });
    };
    mark();
    place(false);

    const watcher = new ResizeObserver(() => place(false));
    watcher.observe(nav);

    nav.rmSet = (href) => {
      current = links.find((link) => link.getAttribute("href") === href) ?? current;
      mark();
      place(true);
    };

    cleanups.push(() => {
      watcher.disconnect();
      delete nav.rmSet;
      tallies.forEach((node) => node?.remove());
      marker.remove();
      links.forEach((link) => {
        link.classList.remove("rm-account-nav-link", "is-current");
        link.removeAttribute("aria-current");
      });
      nav.classList.remove("rm-account-nav");
      if (addedRole) nav.removeAttribute("role");
      if (hadLabel === null) nav.removeAttribute("aria-label");
      else nav.setAttribute("aria-label", hadLabel);
    });
  }

  return () => cleanups.forEach((stop) => stop());
}
