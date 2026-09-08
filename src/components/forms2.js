/**
 * Creative forms, the second set.
 *
 *   • strengthMeter()   — a password strength bar that is announced, not just coloured.
 *   • sliderPair()      — a two-handle range made of two real range inputs.
 *   • ratingSlider()    — stars drawn over a real slider, so the keyboard works.
 *   • colourField()     — a real colour input with a drawn swatch.
 *   • dateField()       — a real date input with a drawn face.
 *   • signaturePad()    — draw with a pointer, or type your name instead.
 *   • switchRow()       — a labelled switch row that is a real checkbox.
 *   • quantityStepper() — plus and minus around a real number input.
 *   • consentBox()      — a checkbox that must be reached, with the terms readable.
 *   • formProgress()    — multi-step progress over real fieldsets.
 *   • errorSummary()    — a list of errors at the top that links to each field.
 *
 * Every one of these is a decoration wrapped around a real form control, and
 * that is the whole argument. The usual creative form component throws the
 * native control away — a div with a click handler instead of a checkbox, a
 * hand-built calendar instead of `<input type="date">`, two absolutely
 * positioned handles instead of a range — and in doing so throws away the
 * keyboard, the form submission, the autofill, the mobile keypad, the operating
 * system's own picker and every assistive technology that knows what a
 * checkbox is. What you get back is a nicer rectangle. It is a bad trade and it
 * is made constantly.
 *
 * So the control here is always real and always focusable. It is made visually
 * transparent while keeping its box, and the drawing sits behind it, which
 * means hit areas, focus, `:focus-visible`, form values and validation all
 * still belong to the browser. Nothing is hidden with `display: none`, because
 * a control behind that is a control nobody can reach.
 *
 * Nothing animates a width, a height or a padding. Bars fill by `scaleX`,
 * stars fill by `clip-path`, knobs travel by `translateX`, and where a panel
 * appears to grow the room is reserved once at mount from a real measurement
 * rather than being animated into existence. Values change often in a form, so
 * every live region here is debounced and announces only when the meaning
 * changes — a meter that speaks on every keystroke is a meter people switch
 * off.
 *
 * These are interface components. None of them transmits, stores or persists
 * anything anybody types; the strength meter in particular reads the value,
 * scores it and forgets it.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import {
  clamp, dataNumber, dataString, EASE, onFrame, prefersReducedMotion, resolveElements, whileVisible,
} from "../core/motion.js";

/** Ids have to be stable within a page and unique across it. */
let seed = 0;
const uid = (prefix) => `rm-${prefix}-${(seed += 1).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/**
 * Pick from a fixed set, falling back rather than silently doing nothing.
 *
 * A typo in `data-rm-format="mediumm"` should give you the default, not an
 * empty face and no clue why.
 */
const oneOf = (value, allowed, fallback) => (allowed.includes(value) ? value : fallback);

/**
 * Announce something, but only when it has actually changed and only once the
 * typing has stopped.
 *
 * A live region wired straight to an `input` event is read out on every
 * keystroke, which turns a helpful meter into a stutter. This holds the last
 * thing said, ignores repeats, and waits for a pause.
 */
function announcer(node, wait = 550) {
  let timer = 0;
  let last = "";
  const say = (message) => {
    if (message === last) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      last = message;
      node.textContent = message;
    }, wait);
  };
  say.now = (message) => {
    clearTimeout(timer);
    last = message;
    node.textContent = message;
  };
  say.stop = () => clearTimeout(timer);
  return say;
}

/** A polite live region that carries text and nothing else. */
function liveNote(className, tone = "polite") {
  const note = document.createElement("p");
  note.className = className;
  note.setAttribute("aria-live", tone);
  note.setAttribute("role", tone === "assertive" ? "alert" : "status");
  return note;
}

/** Add an id to a field's `aria-describedby` and hand back the undo. */
function describe(field, id) {
  const had = field.getAttribute("aria-describedby");
  field.setAttribute("aria-describedby", had ? `${had} ${id}` : id);
  return () => {
    if (had) field.setAttribute("aria-describedby", had);
    else field.removeAttribute("aria-describedby");
  };
}

/** A five-pointed star, as a path, because an image is not text. */
const STAR_PATH = "M12 2.6l2.9 5.9 6.5.95-4.7 4.6 1.1 6.5L12 17.5l-5.8 3.05 1.1-6.5-4.7-4.6 6.5-.95z";

/**
 * A password strength bar that is announced, not just coloured.
 *
 * Almost every strength meter in the wild is a coloured bar and nothing else,
 * which means the one group of people who most need to be told their password
 * is weak — anyone who cannot see the colour — is told nothing at all. Here the
 * bar is a real `role="progressbar"` with an `aria-valuetext` that says the
 * word rather than the number, the word is also printed beside it as text, and
 * the whole thing is wired to the field with `aria-describedby` so it is read
 * as part of the field rather than as a stray sentence.
 *
 * The segments fill with `scaleX` from the left, so the meter never changes the
 * height of the form and nothing below it moves as you type. The announcement
 * is debounced and only fires when the level itself changes: a meter that
 * speaks on every keystroke is one people turn off.
 *
 * The value is read, scored and discarded. Nothing is kept and nothing is sent.
 *
 *   <input type="password" data-rm-strength-meter>
 */
export function strengthMeter(target = "[data-rm-strength-meter]", options = {}) {
  const fields = resolveElements(target);
  if (!fields.length) return () => {};

  const {
    levels = 4,
    label = "Password strength",
    words = ["Too short", "Weak", "Fair", "Good", "Strong"],
    duration = 380,
  } = options;
  const cleanups = [];

  /*
   * Length first, variety second, and a hard ceiling for anything that is one
   * character repeated. Scoring by character classes alone happily calls
   * "Aa1!" strong, which it is not.
   *
   * The ceiling is passed in rather than closed over, because the number of
   * segments is read per field from `data-rm-levels` and the scorer has to
   * agree with it. Score out of a fixed four while the bar draws six and the
   * best password on earth can never light the last two cells or reach the
   * word "Strong", which is the one thing the component exists to say.
   */
  const gauge = (value, top) => {
    if (!value) return 0;
    if (/^(.)\1*$/.test(value)) return 1;
    let score = 0;
    if (value.length >= 8) score += 1;
    if (value.length >= 12) score += 1;
    if (value.length >= 16) score += 1;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
    if (/\d/.test(value)) score += 1;
    if (/[^\p{L}\p{N}]/u.test(value)) score += 1;
    return Math.max(1, Math.ceil((score / 6) * top));
  };

  for (const field of fields) {
    const count = Math.max(2, Math.min(6, Math.round(dataNumber(field, "rmLevels", levels))));
    const name = dataString(field, "rmLabel", label);

    const meter = document.createElement("div");
    meter.className = "rm-strength-meter";
    meter.style.setProperty(
      "--rm-strength-meter-duration",
      `${prefersReducedMotion() ? 0 : dataNumber(field, "rmDuration", duration)}ms`,
    );

    const bar = document.createElement("div");
    bar.className = "rm-strength-meter-bar";
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-label", name);
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", String(count));
    bar.setAttribute("aria-valuenow", "0");

    const segments = [];
    for (let i = 0; i < count; i += 1) {
      const cell = document.createElement("i");
      cell.className = "rm-strength-meter-cell";
      const fill = document.createElement("b");
      cell.appendChild(fill);
      bar.appendChild(cell);
      segments.push(cell);
    }

    const word = document.createElement("p");
    word.className = "rm-strength-meter-word";
    word.id = uid("strength");
    word.textContent = words[0];

    const live = liveNote("rm-strength-meter-live");
    const say = announcer(live);

    meter.append(bar, word, live);
    field.insertAdjacentElement("afterend", meter);
    const undescribe = describe(field, word.id);

    let level = -1;
    const read = () => {
      const next = clamp(gauge(field.value, count), 0, count);
      if (next === level) return;
      level = next;
      // The word list is written for five levels; stretch it over however many
      // segments the author asked for so the last one is always "Strong".
      const at = next === 0 ? 0 : Math.round(((next - 1) / Math.max(1, count - 1)) * (words.length - 2)) + 1;
      const said = words[Math.min(at, words.length - 1)];

      segments.forEach((cell, i) => cell.classList.toggle("is-on", i < next));
      meter.className = `rm-strength-meter is-level-${next}`;
      meter.style.setProperty(
        "--rm-strength-meter-duration",
        `${prefersReducedMotion() ? 0 : dataNumber(field, "rmDuration", duration)}ms`,
      );
      word.textContent = said;
      bar.setAttribute("aria-valuenow", String(next));
      bar.setAttribute("aria-valuetext", `${said}, ${next} of ${count}`);
      say(`${name}: ${said}`);
    };

    field.addEventListener("input", read);
    read();

    cleanups.push(() => {
      say.stop();
      field.removeEventListener("input", read);
      undescribe();
      meter.remove();
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A two-handle range made of two real range inputs.
 *
 * The common version is two divs and a lot of pointer arithmetic, which gives
 * you a control that cannot be tabbed to, cannot be nudged with an arrow key,
 * submits nothing with the form and announces nothing at all. This one is two
 * genuine `<input type="range">` elements laid over the same track: the arrow
 * keys, Home, End, Page Up and the mobile behaviour are all the browser's, and
 * both values post with the form.
 *
 * Two details make the difference between this working and merely looking like
 * it works. The inputs are `pointer-events: none` with only their thumbs
 * clickable, otherwise the upper input swallows every click meant for the lower
 * one. And the input nearest the pointer is raised on top before the press
 * lands, because once both handles sit at the same end the top one covers the
 * other and the pair sticks there forever — the single most common bug in this
 * widget.
 *
 * The selection between the handles is drawn with `translateX` and `scaleX`, so
 * dragging never touches layout.
 *
 *   <div data-rm-slider-pair data-rm-min-gap="5">
 *     <input type="range" min="0" max="100" value="20">
 *     <input type="range" min="0" max="100" value="80">
 *   </div>
 */
export function sliderPair(target = "[data-rm-slider-pair]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { minGap = 0, label = "Range", unit = "" } = options;
  const cleanups = [];

  for (const holder of holders) {
    const inputs = [...holder.querySelectorAll('input[type="range"]')];
    if (inputs.length < 2) continue;

    const [low, high] = inputs;
    const name = dataString(holder, "rmLabel", label);
    const suffix = dataString(holder, "rmUnit", unit);
    const gap = Math.max(0, dataNumber(holder, "rmMinGap", minGap));

    holder.classList.add("rm-slider-pair");
    holder.setAttribute("role", "group");
    holder.setAttribute("aria-label", name);

    const track = document.createElement("div");
    track.className = "rm-slider-pair-track";
    track.setAttribute("aria-hidden", "true");
    const fill = document.createElement("i");
    track.appendChild(fill);
    holder.prepend(track);

    const live = liveNote("rm-slider-pair-live");
    const say = announcer(live, 420);
    holder.appendChild(live);

    const hadLowLabel = low.getAttribute("aria-label");
    const hadHighLabel = high.getAttribute("aria-label");
    low.setAttribute("aria-label", hadLowLabel ?? `${name}, minimum`);
    high.setAttribute("aria-label", hadHighLabel ?? `${name}, maximum`);
    low.classList.add("rm-slider-pair-input", "is-low");
    high.classList.add("rm-slider-pair-input", "is-high");

    const floor = () => Number(low.min || 0);
    const ceiling = () => Number(low.max || 100);
    const span = () => Math.max(1, ceiling() - floor());
    const pct = (value) => ((value - floor()) / span()) * 100;

    const draw = () => {
      const from = pct(Number(low.value));
      const to = pct(Number(high.value));
      holder.style.setProperty("--rm-slider-pair-from", `${from}%`);
      holder.style.setProperty("--rm-slider-pair-span", String(Math.max(0, to - from) / 100));
      const text = `${low.value}${suffix} to ${high.value}${suffix}`;
      low.setAttribute("aria-valuetext", `${low.value}${suffix}, minimum`);
      high.setAttribute("aria-valuetext", `${high.value}${suffix}, maximum`);
      say(`${name}: ${text}`);
    };

    // Whichever one moved gives way; pushing the other would mean an arrow key
    // silently dragging a handle the visitor is not holding.
    const settle = (moved) => {
      const a = Number(low.value);
      const b = Number(high.value);
      if (a > b - gap) {
        if (moved === low) low.value = String(Math.min(a, b - gap));
        else high.value = String(Math.max(b, a + gap));
      }
      draw();
    };

    const onLow = () => settle(low);
    const onHigh = () => settle(high);
    low.addEventListener("input", onLow);
    high.addEventListener("input", onHigh);

    /*
     * Raise the handle the pointer is closest to before the press is delivered.
     * Without this, both handles at the maximum leave the lower one buried and
     * unreachable with a mouse for the rest of the session.
     */
    const onHover = (event) => {
      const box = holder.getBoundingClientRect();
      if (!box.width) return;
      const at = floor() + (clamp((event.clientX - box.left) / box.width, 0, 1) * span());
      const nearLow = Math.abs(at - Number(low.value)) <= Math.abs(at - Number(high.value));
      low.classList.toggle("is-on-top", nearLow);
      high.classList.toggle("is-on-top", !nearLow);
    };
    holder.addEventListener("pointermove", onHover);

    // Focus does the same job for the keyboard: the handle being driven is the
    // one on top, so its thumb is never drawn behind the other's.
    const onFocusLow = () => { low.classList.add("is-on-top"); high.classList.remove("is-on-top"); };
    const onFocusHigh = () => { high.classList.add("is-on-top"); low.classList.remove("is-on-top"); };
    low.addEventListener("focus", onFocusLow);
    high.addEventListener("focus", onFocusHigh);

    holder.rmGet = () => [Number(low.value), Number(high.value)];
    holder.rmSet = (from, to) => {
      low.value = String(clamp(from, floor(), ceiling()));
      high.value = String(clamp(to, floor(), ceiling()));
      settle(high);
      say.now(`${name}: ${low.value}${suffix} to ${high.value}${suffix}`);
    };

    settle(high);
    say.now("");

    cleanups.push(() => {
      say.stop();
      low.removeEventListener("input", onLow);
      high.removeEventListener("input", onHigh);
      low.removeEventListener("focus", onFocusLow);
      high.removeEventListener("focus", onFocusHigh);
      holder.removeEventListener("pointermove", onHover);
      delete holder.rmGet;
      delete holder.rmSet;
      track.remove();
      live.remove();
      for (const input of [low, high]) {
        input.classList.remove("rm-slider-pair-input", "is-low", "is-high", "is-on-top");
        input.removeAttribute("aria-valuetext");
      }
      if (hadLowLabel === null) low.removeAttribute("aria-label");
      if (hadHighLabel === null) high.removeAttribute("aria-label");
      holder.removeAttribute("role");
      holder.removeAttribute("aria-label");
      // The holder belongs to the author, so the two inline custom properties
      // painted onto it have to come off with everything else.
      holder.style.removeProperty("--rm-slider-pair-from");
      holder.style.removeProperty("--rm-slider-pair-span");
      holder.classList.remove("rm-slider-pair");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Stars drawn over a real slider, so the keyboard works.
 *
 * Star ratings are nearly always built as a row of buttons or, worse, a row of
 * spans with click handlers. A range input gets the whole thing for free:
 * arrow keys, Home and End, a touch target that drags, and a value that posts
 * with the form. The stars are decoration painted on top of it.
 *
 * The filled row is revealed with `clip-path`, not by changing a width, so
 * moving between four and five stars costs no layout at all. `aria-valuetext`
 * carries the sentence — "4 out of 5, Good" — because `aria-valuenow` on its
 * own announces "4", which in a form full of numbers means nothing. Hovering
 * draws a faint preview row, because a pointer has to hover somewhere before it
 * commits; the keyboard needs no preview at all, since an arrow key commits the
 * value outright and the lit row and the spoken sentence both follow it
 * immediately.
 *
 *   <input type="range" data-rm-rating-slider min="0" max="5" step="1" value="3">
 */
export function ratingSlider(target = "[data-rm-rating-slider]", options = {}) {
  const fields = resolveElements(target);
  if (!fields.length) return () => {};

  const {
    label = "Rating",
    words = ["Not rated", "Poor", "Fair", "Good", "Great", "Excellent"],
  } = options;
  const cleanups = [];

  for (const field of fields) {
    const most = Math.max(1, Math.round(dataNumber(field, "rmScale", Number(field.max) || 5)));
    const name = dataString(field, "rmLabel", label);
    const said = dataString(field, "rmWords", "")
      ? dataString(field, "rmWords", "").split(",").map((part) => part.trim())
      : words;

    // These two decide what the control actually posts, so they are recorded
    // before being touched. A range with no `step` reports `""`, which means
    // essentially every mount writes one, and leaving it behind hands the
    // author back a field with value semantics they never wrote.
    const hadMax = field.getAttribute("max");
    const hadStep = field.getAttribute("step");
    field.max = String(most);
    if (!field.step) field.step = "1";

    const wrap = document.createElement("span");
    wrap.className = "rm-rating-slider";
    field.replaceWith(wrap);
    wrap.appendChild(field);
    field.classList.add("rm-rating-slider-input");
    const hadLabel = field.getAttribute("aria-label");
    if (!hadLabel) field.setAttribute("aria-label", name);

    // Two identical rows: the dim one underneath, the bright one clipped to the
    // current value. One row of markup, no per-star state to keep in sync.
    const row = (className) => {
      const bank = document.createElement("span");
      bank.className = className;
      bank.setAttribute("aria-hidden", "true");
      bank.innerHTML = Array.from({ length: most }, () =>
        `<svg viewBox="0 0 24 24"><path d="${STAR_PATH}" fill="currentColor"/></svg>`).join("");
      return bank;
    };
    // Three rows, not two: the dim one always shows every star, the ghost
    // previews what a click would give, the lit one is the committed value.
    // Clipping the dim row for the preview would make the unrated stars
    // vanish, which is the version of this bug you see everywhere.
    const dim = row("rm-rating-slider-bank is-dim");
    const ghost = row("rm-rating-slider-bank is-ghost");
    const lit = row("rm-rating-slider-bank is-lit");
    wrap.append(dim, ghost, lit);

    const live = liveNote("rm-rating-slider-live");
    const say = announcer(live, 400);
    wrap.appendChild(live);

    let shown = -1;
    const draw = () => {
      const value = clamp(Number(field.value) || 0, 0, most);
      wrap.style.setProperty("--rm-rating-slider-at", `${(value / most) * 100}%`);
      const at = Math.round((value / most) * (said.length - 1));
      const phrase = said[clamp(at, 0, said.length - 1)] ?? "";
      field.setAttribute("aria-valuetext", `${value} out of ${most}${phrase ? `, ${phrase}` : ""}`);
      say(`${name}: ${value} out of ${most}${phrase ? `, ${phrase}` : ""}`);

      // The star that just lit up pops, and only that one: a whole row bouncing
      // on every arrow press is noise.
      if (!prefersReducedMotion() && value > shown && shown >= 0) {
        const star = lit.children[Math.ceil(value) - 1];
        star?.animate(
          [{ transform: "scale(1)" }, { transform: "scale(1.28)" }, { transform: "scale(1)" }],
          { duration: 340, easing: EASE.out },
        );
      }
      shown = value;
    };

    const onInput = () => { wrap.style.removeProperty("--rm-rating-slider-ghost"); draw(); };
    field.addEventListener("input", onInput);

    const onHover = (event) => {
      const box = wrap.getBoundingClientRect();
      if (!box.width) return;
      const at = Math.ceil(clamp((event.clientX - box.left) / box.width, 0, 1) * most);
      wrap.style.setProperty("--rm-rating-slider-ghost", `${(at / most) * 100}%`);
    };
    const offHover = () => wrap.style.removeProperty("--rm-rating-slider-ghost");
    wrap.addEventListener("pointermove", onHover);
    wrap.addEventListener("pointerleave", offHover);
    field.addEventListener("blur", offHover);

    draw();
    say.now("");

    cleanups.push(() => {
      say.stop();
      field.removeEventListener("input", onInput);
      field.removeEventListener("blur", offHover);
      wrap.removeEventListener("pointermove", onHover);
      wrap.removeEventListener("pointerleave", offHover);
      field.classList.remove("rm-rating-slider-input");
      field.removeAttribute("aria-valuetext");
      if (hadLabel === null) field.removeAttribute("aria-label");
      if (hadMax === null) field.removeAttribute("max");
      else field.setAttribute("max", hadMax);
      if (hadStep === null) field.removeAttribute("step");
      else field.setAttribute("step", hadStep);
      wrap.replaceWith(field);
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A real colour input with a drawn swatch.
 *
 * `<input type="color">` looks different in every browser and cannot be styled,
 * so the usual response is `display: none` on the input and a div people click
 * instead — which removes the only thing on the page that opens the operating
 * system's colour picker with a keyboard. Here the input keeps its box and its
 * focus; it is merely made transparent, with the swatch painted behind it and
 * the focus ring driven by `:focus-within`, so pressing Tab and then Enter
 * still opens the real picker.
 *
 * The hex value is printed as text on the swatch, and the ink colour is chosen
 * from the swatch's own relative luminance, so the value stays readable on
 * black and on yellow alike. The announcement is on `change`, never on `input`:
 * dragging inside a colour picker fires hundreds of `input` events and a live
 * region wired to them is unusable.
 *
 *   <label data-rm-colour>Accent <input type="color" value="#e0533d"></label>
 */
export function colourField(target = "[data-rm-colour]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { label = "Colour", format = "hex" } = options;
  const cleanups = [];

  for (const holder of holders) {
    const field = holder.querySelector('input[type="color"]');
    if (!field) continue;

    const name = dataString(holder, "rmLabel", label);
    const shape = oneOf(dataString(holder, "rmFormat", format), ["hex", "rgb"], "hex");

    holder.classList.add("rm-colour-field");
    field.classList.add("rm-colour-field-input");

    const swatch = document.createElement("span");
    swatch.className = "rm-colour-field-swatch";
    swatch.setAttribute("aria-hidden", "true");
    const value = document.createElement("span");
    value.className = "rm-colour-field-value";
    swatch.appendChild(value);
    field.insertAdjacentElement("beforebegin", swatch);

    const live = liveNote("rm-colour-field-live");
    const say = announcer(live, 260);
    holder.appendChild(live);

    /*
     * The formatted value is a description, not a name. Putting it in
     * `aria-label` overrides the wrapping `<label>` outright, so a swatch whose
     * visible text reads "Accent" announces as "Colour, #e0533d" — the visible
     * words are gone from the accessible name, which fails WCAG 2.5.3 and means
     * somebody saying "click Accent" to their voice control hits nothing. So it
     * goes through `aria-describedby` instead, where an extra sentence belongs.
     */
    const note = document.createElement("span");
    note.className = "rm-colour-field-note";
    note.id = uid("colour");
    holder.appendChild(note);
    const undescribe = describe(field, note.id);

    /*
     * A name is only supplied when nothing already provides one — a wrapping
     * label, an `aria-labelledby`, or the author's own `aria-label`, which is
     * recorded either way so cleanup can put it back exactly as it was.
     */
    const hadLabel = field.getAttribute("aria-label");
    const named = hadLabel !== null
      || field.hasAttribute("aria-labelledby")
      || Boolean(field.labels?.length);
    if (!named) field.setAttribute("aria-label", name);

    const parts = (hex) => [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16));

    const draw = (announce) => {
      const hex = (field.value || "#000000").toLowerCase();
      const [r, g, b] = parts(hex);
      const text = shape === "rgb" ? `rgb(${r}, ${g}, ${b})` : hex;
      // Rec. 709 luminance, which is what "is this dark?" actually means.
      const light = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.55;
      swatch.style.setProperty("--rm-colour-field-fill", hex);
      swatch.classList.toggle("is-light", light);
      value.textContent = text;
      note.textContent = text;
      if (announce) say(`${name} set to ${text}`);
    };

    const onChange = () => {
      draw(true);
      if (prefersReducedMotion()) return;
      swatch.animate(
        [{ transform: "scale(0.9)" }, { transform: "scale(1)" }],
        { duration: 320, easing: EASE.spring },
      );
    };
    // `input` keeps the swatch honest while the picker is open; `change` is the
    // only one that speaks.
    const onInput = () => draw(false);
    field.addEventListener("input", onInput);
    field.addEventListener("change", onChange);
    draw(false);

    cleanups.push(() => {
      say.stop();
      field.removeEventListener("input", onInput);
      field.removeEventListener("change", onChange);
      undescribe();
      if (!named) field.removeAttribute("aria-label");
      field.classList.remove("rm-colour-field-input");
      swatch.remove();
      note.remove();
      live.remove();
      holder.classList.remove("rm-colour-field");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A real date input with a drawn face.
 *
 * Hand-built calendars are the most expensive accessibility mistake in forms:
 * a grid of divs with no `role="grid"`, no arrow-key navigation, no month
 * announcement and no way to simply type "03/10/2025", which is how most people
 * enter a date they already know. `<input type="date">` has all of that,
 * localised, plus the platform picker on a phone.
 *
 * So the input stays exactly as the browser made it, and a small calendar card
 * is drawn beside it and kept in step. The card is `aria-hidden` decoration —
 * the real announcement is the full written date in a polite live region, so
 * "2025-10-03" is confirmed back as "Friday, 3 October 2025" and a
 * transposed day and month is caught before submission rather than after.
 *
 * The card's top sheet turns over on `rotateX` when the date changes, which is
 * a transform on a fixed box and moves nothing around it.
 *
 *   <label data-rm-date-field>Delivery <input type="date"></label>
 */
export function dateField(target = "[data-rm-date-field]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { label = "Date", format = "long", locale = undefined } = options;
  const cleanups = [];

  for (const holder of holders) {
    const field = holder.querySelector('input[type="date"]');
    if (!field) continue;

    const name = dataString(holder, "rmLabel", label);
    const style = oneOf(dataString(holder, "rmFormat", format), ["full", "long", "medium", "short"], "long");
    const where = dataString(holder, "rmLocale", locale);

    holder.classList.add("rm-date-field");
    field.classList.add("rm-date-field-input");

    const face = document.createElement("span");
    face.className = "rm-date-field-face";
    face.setAttribute("aria-hidden", "true");
    const month = document.createElement("b");
    const day = document.createElement("strong");
    face.append(month, day);
    field.insertAdjacentElement("beforebegin", face);

    const live = liveNote("rm-date-field-live");
    const say = announcer(live, 500);
    holder.appendChild(live);

    // Seeded to something no input can hold, so the very first call always
    // falls through and paints the empty face. Starting at `""` means an unset
    // date matches on mount, returns early, and leaves the card blank rather
    // than showing the dash it was designed to show.
    let last = null;
    const draw = () => {
      const raw = field.value;
      if (raw === last) return;
      const turned = last !== null && last !== "";
      last = raw;

      if (!raw) {
        month.textContent = "—";
        day.textContent = "";
        face.classList.remove("is-set");
        say("");
        return;
      }

      // Built from the parts rather than `new Date(raw)`, which reads a bare
      // date as UTC and can land on the previous day west of Greenwich.
      const [y, m, d] = raw.split("-").map(Number);
      const when = new Date(y, (m || 1) - 1, d || 1);
      month.textContent = when.toLocaleDateString(where, { month: "short" });
      day.textContent = String(when.getDate());
      face.classList.add("is-set");

      const written = when.toLocaleDateString(where, { dateStyle: style });
      say(`${name}: ${written}`);

      if (turned && !prefersReducedMotion()) {
        face.animate(
          [{ transform: "rotateX(-72deg)" }, { transform: "rotateX(0deg)" }],
          { duration: 420, easing: EASE.out },
        );
      }
    };

    field.addEventListener("input", draw);
    field.addEventListener("change", draw);
    draw();
    say.now("");

    cleanups.push(() => {
      say.stop();
      field.removeEventListener("input", draw);
      field.removeEventListener("change", draw);
      field.classList.remove("rm-date-field-input");
      face.remove();
      live.remove();
      holder.classList.remove("rm-date-field");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Draw with a pointer, or type your name instead.
 *
 * A canvas you sign with a finger is inherently a pointer-only control, and
 * shipping one on its own excludes everybody using a keyboard, a switch or a
 * screen reader. The answer is not to bolt on a warning; it is to provide a
 * second, equal route — a real text input that renders the typed name into the
 * same canvas in the same hand — so both paths end in the same artefact and
 * neither is the apology version.
 *
 * The drawing itself is coalesced: pointer moves are collected and flushed once
 * per frame through the shared loop rather than painting inside the event, so a
 * stylus reporting at 240Hz does not force 240 paints a second. The loop runs
 * only while the pad is on screen. The canvas is scaled by the device pixel
 * ratio through a ResizeObserver, which is the difference between a crisp line
 * and a blurred one on every phone made in the last decade.
 *
 *   <div data-rm-signature></div>
 */
export function signaturePad(target = "[data-rm-signature]", options = {}) {
  const pads = resolveElements(target);
  if (!pads.length) return () => {};

  const { label = "Signature", ink = "#1b1b1b", weight = 2.4 } = options;
  const cleanups = [];

  for (const pad of pads) {
    const name = dataString(pad, "rmLabel", label);
    const line = dataString(pad, "rmPen", ink);
    const thick = dataNumber(pad, "rmWeight", weight);

    pad.classList.add("rm-signature-pad");
    pad.setAttribute("role", "group");
    pad.setAttribute("aria-label", name);

    const canvas = document.createElement("canvas");
    canvas.className = "rm-signature-pad-canvas";
    canvas.setAttribute("aria-hidden", "true");
    const context = canvas.getContext("2d");

    const hint = document.createElement("p");
    hint.className = "rm-signature-pad-hint";
    hint.textContent = "Sign in the box, or type your name below.";

    const row = document.createElement("div");
    row.className = "rm-signature-pad-row";

    const typed = document.createElement("input");
    typed.type = "text";
    typed.className = "rm-signature-pad-typed";
    typed.id = uid("sign");
    typed.autocomplete = "name";
    const typedLabel = document.createElement("label");
    typedLabel.className = "rm-signature-pad-typed-label";
    typedLabel.htmlFor = typed.id;
    typedLabel.textContent = "Type your name";

    const wipe = document.createElement("button");
    wipe.type = "button";
    wipe.className = "rm-signature-pad-clear";
    wipe.textContent = "Clear";

    const live = liveNote("rm-signature-pad-live");
    const say = announcer(live, 350);

    row.append(typedLabel, typed, wipe);
    pad.append(canvas, hint, row, live);

    /** Strokes are kept in CSS pixels so a resize can simply repaint them. */
    let strokes = [];
    let current = null;
    let pending = [];
    let signed = "";

    const paint = () => {
      const box = canvas.getBoundingClientRect();
      if (!box.width || !box.height || !context) return;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      const ratio = canvas.width / box.width;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.strokeStyle = line;
      context.lineWidth = thick;
      context.lineCap = "round";
      context.lineJoin = "round";

      for (const stroke of strokes) {
        if (stroke.length < 2) continue;
        context.beginPath();
        context.moveTo(stroke[0].x, stroke[0].y);
        // Quadratic through the midpoints: a polyline of raw samples looks
        // like a seismograph, not a signature.
        for (let i = 1; i < stroke.length - 1; i += 1) {
          const mid = { x: (stroke[i].x + stroke[i + 1].x) / 2, y: (stroke[i].y + stroke[i + 1].y) / 2 };
          context.quadraticCurveTo(stroke[i].x, stroke[i].y, mid.x, mid.y);
        }
        context.lineTo(stroke[stroke.length - 1].x, stroke[stroke.length - 1].y);
        context.stroke();
      }

      if (signed) {
        // Canvas has no idea what a custom property is, so the token is read
        // off the element and handed over as a literal font stack.
        const face = getComputedStyle(pad).getPropertyValue("--rm-display").trim() || "Georgia, serif";
        context.font = `italic ${Math.round(box.height * 0.42)}px ${face}`;
        context.fillStyle = line;
        context.textBaseline = "middle";
        context.fillText(signed, box.width * 0.08, box.height * 0.58);
      }
    };

    const size = () => {
      const box = canvas.getBoundingClientRect();
      if (!box.width || !box.height) return;
      const ratio = Math.min(3, window.devicePixelRatio || 1);
      canvas.width = Math.round(box.width * ratio);
      canvas.height = Math.round(box.height * ratio);
      paint();
    };

    const observer = new ResizeObserver(size);
    observer.observe(canvas);

    const at = (event) => {
      const box = canvas.getBoundingClientRect();
      return { x: event.clientX - box.left, y: event.clientY - box.top };
    };

    const onDown = (event) => {
      if (event.button > 0) return;
      canvas.setPointerCapture?.(event.pointerId);
      current = [at(event)];
      strokes.push(current);
    };
    const onMove = (event) => {
      if (!current) return;
      // Coalesced events give every sample the device actually took, without
      // one callback each.
      const samples = event.getCoalescedEvents?.() ?? [event];
      for (const sample of samples) pending.push(at(sample));
    };
    const onUp = (event) => {
      if (!current) return;
      canvas.releasePointerCapture?.(event.pointerId);
      // Whatever arrived after the last frame still belongs to this stroke.
      current.push(...pending);
      pending = [];
      // A tap that never moved is a dot nobody meant to draw.
      if (current.length < 2) strokes.pop();
      current = null;
      paint();
      say("Signature captured.");
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    // One flush per frame, and only while the pad is actually on screen.
    cleanups.push(whileVisible(pad, () => onFrame(() => {
      if (!pending.length) return;
      if (current) current.push(...pending);
      pending = [];
      paint();
    })));

    const onTyped = () => { signed = typed.value.trim(); paint(); };
    typed.addEventListener("input", onTyped);

    const clear = () => {
      strokes = [];
      current = null;
      pending = [];
      signed = "";
      typed.value = "";
      paint();
      say.now("Signature cleared.");
    };
    wipe.addEventListener("click", clear);

    pad.rmClear = clear;
    pad.rmIsEmpty = () => strokes.length === 0 && signed === "";
    pad.rmToDataURL = (type = "image/png") => canvas.toDataURL(type);

    size();

    cleanups.push(() => {
      say.stop();
      observer.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      typed.removeEventListener("input", onTyped);
      wipe.removeEventListener("click", clear);
      delete pad.rmClear;
      delete pad.rmIsEmpty;
      delete pad.rmToDataURL;
      canvas.remove();
      hint.remove();
      row.remove();
      live.remove();
      pad.removeAttribute("role");
      pad.removeAttribute("aria-label");
      pad.classList.remove("rm-signature-pad");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A labelled switch row that is a real checkbox.
 *
 * The switch is the control most often faked, and faking it costs more than it
 * looks: a div with `role="switch"` and a click handler does not submit with
 * the form, does not respond to a label being clicked, does not restore on a
 * back navigation, and usually forgets that Space has to toggle it. This is a
 * genuine `<input type="checkbox">` given `role="switch"`, which is the one
 * substitution the specification actually blesses.
 *
 * The state is written as a word beside the track as well as drawn, because a
 * switch read only by the position of its knob is a control with no label for
 * anyone who cannot see the knob. The knob travels on `translateX`, so nothing
 * in the row reflows as it moves, and the whole row is inside the `<label>` so
 * the tap target is the row rather than a fourteen pixel circle.
 *
 *   <label data-rm-switch-row><input type="checkbox"> Email me</label>
 */
export function switchRow(target = "[data-rm-switch-row]", options = {}) {
  const rows = resolveElements(target);
  if (!rows.length) return () => {};

  const { on = "On", off = "Off", duration = 260 } = options;
  const cleanups = [];

  for (const row of rows) {
    const field = row.querySelector('input[type="checkbox"]');
    if (!field) continue;

    const yes = dataString(row, "rmOn", on);
    const no = dataString(row, "rmOff", off);

    row.classList.add("rm-switch-row");
    row.style.setProperty(
      "--rm-switch-row-duration",
      `${prefersReducedMotion() ? 0 : dataNumber(row, "rmDuration", duration)}ms`,
    );
    field.classList.add("rm-switch-row-input");
    const hadRole = field.getAttribute("role");
    field.setAttribute("role", "switch");

    const track = document.createElement("span");
    track.className = "rm-switch-row-track";
    track.setAttribute("aria-hidden", "true");
    track.appendChild(document.createElement("i"));
    field.insertAdjacentElement("afterend", track);

    const word = document.createElement("span");
    word.className = "rm-switch-row-word";
    row.appendChild(word);

    const draw = () => {
      // `role="switch"` maps a checkbox's checked state to aria-checked in
      // every current engine, but stating it costs nothing and closes the gap
      // on the ones that lag.
      field.setAttribute("aria-checked", String(field.checked));
      row.classList.toggle("is-on", field.checked);
      word.textContent = field.checked ? yes : no;
    };

    field.addEventListener("change", draw);
    draw();

    cleanups.push(() => {
      field.removeEventListener("change", draw);
      field.removeAttribute("aria-checked");
      if (hadRole) field.setAttribute("role", hadRole);
      else field.removeAttribute("role");
      field.classList.remove("rm-switch-row-input");
      track.remove();
      word.remove();
      row.classList.remove("rm-switch-row", "is-on");
      row.style.removeProperty("--rm-switch-row-duration");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Plus and minus around a real number input.
 *
 * Keeping the `<input type="number">` is what makes this work on a phone — it
 * is the reason the numeric keypad appears — and what makes it work with a
 * keyboard, since the up and down arrows already step it. The buttons exist for
 * the thumb, not instead of the field, so they are real `<button type="button">`
 * elements rather than divs; inside a form, a bare `<button>` submits it, which
 * is how a quantity control ends up placing an order.
 *
 * `min`, `max` and `step` are read from the input itself rather than from data
 * attributes, so the browser's validation and this component can never disagree
 * about the bounds. Holding a button repeats with acceleration, and the value is
 * announced politely and debounced, with "minimum" or "maximum" appended at the
 * ends so the reason a button stopped working is spoken rather than merely
 * drawn in grey.
 *
 *   <div data-rm-quantity><input type="number" min="1" max="9" value="1"></div>
 */
export function quantityStepper(target = "[data-rm-quantity]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { label = "Quantity", delay = 420, repeat = 110 } = options;
  const cleanups = [];

  for (const holder of holders) {
    const field = holder.querySelector('input[type="number"]');
    if (!field) continue;

    const name = dataString(holder, "rmLabel", label);
    const hold = Math.max(120, dataNumber(holder, "rmHold", delay));
    const rate = Math.max(30, dataNumber(holder, "rmRepeat", repeat));

    holder.classList.add("rm-quantity-stepper");
    holder.setAttribute("role", "group");
    holder.setAttribute("aria-label", name);
    field.classList.add("rm-quantity-stepper-input");

    const button = (kind, glyph, aria) => {
      const control = document.createElement("button");
      control.type = "button";
      control.className = `rm-quantity-stepper-button is-${kind}`;
      control.textContent = glyph;
      control.setAttribute("aria-label", aria);
      return control;
    };
    const less = button("less", "−", `Decrease ${name.toLowerCase()}`);
    const more = button("more", "+", `Increase ${name.toLowerCase()}`);
    field.insertAdjacentElement("beforebegin", less);
    field.insertAdjacentElement("afterend", more);

    const live = liveNote("rm-quantity-stepper-live");
    const say = announcer(live, 480);
    holder.appendChild(live);

    const low = () => (field.min === "" ? -Infinity : Number(field.min));
    const high = () => (field.max === "" ? Infinity : Number(field.max));
    const stride = () => Math.abs(Number(field.step) || 1);

    const draw = () => {
      const value = Number(field.value);
      const bottom = Number.isFinite(value) && value <= low();
      const top = Number.isFinite(value) && value >= high();
      less.disabled = bottom;
      more.disabled = top;
      let edge = "";
      if (bottom) edge = ", minimum";
      if (top) edge = ", maximum";
      say(`${name} ${field.value}${edge}`);
    };

    const nudge = (direction, source) => {
      const value = Number(field.value) || 0;
      const next = clamp(value + direction * stride(), low(), high());
      // Reaching a bound ends the repeat here rather than waiting for a
      // `pointerup`, because `draw()` disables the button at the bound and a
      // disabled control is sent no pointer events at all — the release that
      // would have stopped the chain is never delivered, and it reschedules
      // itself silently for the life of the page.
      if (next === value) { stop(); return; }
      field.value = String(Number(next.toFixed(6)));
      // A real `input` event, so anything else listening to the field — a
      // running total, a framework binding — hears about it.
      field.dispatchEvent(new Event("input", { bubbles: true }));
      field.dispatchEvent(new Event("change", { bubbles: true }));
      draw();
      if (prefersReducedMotion() || !source) return;
      source.animate(
        [{ transform: "scale(1)" }, { transform: "scale(0.86)" }, { transform: "scale(1)" }],
        { duration: 220, easing: EASE.out },
      );
    };

    let timer = 0;
    const stop = () => { clearTimeout(timer); timer = 0; };
    const start = (direction, source) => {
      stop();
      nudge(direction, source);
      // Slower the first time, then quickening: an immediate fast repeat makes
      // a single deliberate press overshoot.
      let wait = hold;
      const again = () => {
        nudge(direction, null);
        wait = Math.max(rate * 0.5, wait * 0.72);
        timer = setTimeout(again, wait);
      };
      timer = setTimeout(again, hold);
    };

    const holdLess = (event) => { if (event.button === 0) start(-1, less); };
    const holdMore = (event) => { if (event.button === 0) start(1, more); };
    less.addEventListener("pointerdown", holdLess);
    more.addEventListener("pointerdown", holdMore);
    for (const control of [less, more]) {
      control.addEventListener("pointerup", stop);
      control.addEventListener("pointerleave", stop);
      control.addEventListener("pointercancel", stop);
      control.addEventListener("blur", stop);
    }

    // Keyboard activation arrives as a click with no pointer press behind it,
    // so it gets one clean step rather than a repeat that never stops.
    const clickLess = (event) => { if (event.detail === 0) nudge(-1, less); };
    const clickMore = (event) => { if (event.detail === 0) nudge(1, more); };
    less.addEventListener("click", clickLess);
    more.addEventListener("click", clickMore);

    const onInput = () => draw();
    field.addEventListener("input", onInput);
    draw();
    say.now("");

    cleanups.push(() => {
      stop();
      say.stop();
      less.removeEventListener("pointerdown", holdLess);
      more.removeEventListener("pointerdown", holdMore);
      for (const control of [less, more]) {
        control.removeEventListener("pointerup", stop);
        control.removeEventListener("pointerleave", stop);
        control.removeEventListener("pointercancel", stop);
        control.removeEventListener("blur", stop);
      }
      less.removeEventListener("click", clickLess);
      more.removeEventListener("click", clickMore);
      field.removeEventListener("input", onInput);
      field.classList.remove("rm-quantity-stepper-input");
      less.remove();
      more.remove();
      live.remove();
      holder.removeAttribute("role");
      holder.removeAttribute("aria-label");
      holder.classList.remove("rm-quantity-stepper");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A checkbox that must be reached, with the terms readable.
 *
 * The scroll-to-agree gate is usually implemented as "unlock when
 * `scrollTop + clientHeight >= scrollHeight`", and that single line locks out
 * everybody who never scrolls: a screen reader reads a panel by moving a
 * virtual cursor, a switch user tabs, and neither necessarily moves the
 * scrollbar at all. They reach the end of the terms and the checkbox is still
 * disabled, with no way to find out why.
 *
 * So the gate here opens on either of two signals: an end marker becoming
 * visible inside the panel, or that same marker taking focus. The marker is a
 * real focusable sentence — "You have reached the end of the terms" — which
 * means tabbing through the panel opens the gate as reliably as dragging it
 * does. The panel itself gets `tabindex="0"` so it can be scrolled from the
 * keyboard, a label, and a fade at the bottom that is a mask rather than a
 * height change.
 *
 *   <div data-rm-consent>
 *     <div data-rm-consent-terms>…</div>
 *     <label><input type="checkbox"> I agree</label>
 *   </div>
 */
export function consentBox(target = "[data-rm-consent]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const {
    terms = "[data-rm-consent-terms]",
    label = "Terms and conditions",
    reach = "scroll",
    locked = "Read to the end of the terms to continue.",
  } = options;
  const cleanups = [];

  for (const holder of holders) {
    const field = holder.querySelector('input[type="checkbox"]');
    const panel = holder.querySelector(terms) ?? holder.firstElementChild;
    if (!field || !panel || panel.contains(field)) continue;

    const name = dataString(holder, "rmLabel", label);
    const gate = oneOf(dataString(holder, "rmReach", reach), ["scroll", "open"], "scroll");

    holder.classList.add("rm-consent-box");
    panel.classList.add("rm-consent-box-terms");
    panel.tabIndex = 0;
    panel.setAttribute("role", "region");
    panel.setAttribute("aria-label", name);

    const end = document.createElement("p");
    end.className = "rm-consent-box-end";
    end.tabIndex = 0;
    end.textContent = "You have reached the end of the terms.";
    panel.appendChild(end);

    const note = document.createElement("p");
    note.className = "rm-consent-box-note";
    note.id = uid("consent");
    note.textContent = dataString(holder, "rmLockedNote", locked);

    const live = liveNote("rm-consent-box-live");
    const say = announcer(live, 200);
    holder.append(note, live);

    const undescribe = describe(field, note.id);
    const wasDisabled = field.disabled;

    let open = gate === "open";
    const unlock = () => {
      if (open) return;
      open = true;
      field.disabled = wasDisabled;
      // Both classes have to move together, or the box sits there claiming to
      // be locked and open at once and anything keying off `.is-locked` — a
      // consumer stylesheet, a test — is told a lie by the DOM.
      holder.classList.remove("is-locked");
      holder.classList.add("is-open");
      note.textContent = "You can now agree.";
      say.now("You have reached the end of the terms. You can now agree.");
      if (prefersReducedMotion()) return;
      note.animate(
        [{ opacity: 0, transform: "translateY(-4px)" }, { opacity: 1, transform: "none" }],
        { duration: 260, easing: EASE.out },
      );
    };

    let observer = null;
    if (!open) {
      field.disabled = true;
      holder.classList.add("is-locked");
      observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) unlock();
      }, { root: panel, threshold: 0.9 });
      observer.observe(end);
      end.addEventListener("focus", unlock);
    } else {
      holder.classList.add("is-open");
      note.textContent = "";
    }

    // More text below is a mask, not a size change: the panel stays exactly the
    // same box whether or not the fade is drawn.
    const shade = () => {
      const more = panel.scrollHeight - panel.scrollTop - panel.clientHeight > 8;
      panel.classList.toggle("is-more", more);
    };
    panel.addEventListener("scroll", shade, { passive: true });
    shade();

    cleanups.push(() => {
      say.stop();
      observer?.disconnect();
      end.removeEventListener("focus", unlock);
      panel.removeEventListener("scroll", shade);
      undescribe();
      field.disabled = wasDisabled;
      end.remove();
      note.remove();
      live.remove();
      panel.removeAttribute("tabindex");
      panel.removeAttribute("role");
      panel.removeAttribute("aria-label");
      panel.classList.remove("rm-consent-box-terms", "is-more");
      holder.classList.remove("rm-consent-box", "is-locked", "is-open");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Multi-step progress over real fieldsets.
 *
 * Steps are `<fieldset>` elements with a `<legend>`, which is not decoration:
 * the legend is what names the group to a screen reader, and it is what this
 * reads to build the progress bar's `aria-valuetext`, so "Step 2 of 4,
 * Delivery" is announced rather than a bare "50%". The inactive steps are
 * genuinely `hidden` and `inert`, so nobody tabs into a step they have not
 * reached.
 *
 * Neither of those exempts a field from constraint validation, whatever the
 * word "hidden" suggests: only `disabled`, `readonly` and a handful of barred
 * input types take a control out of the browser's own check. So each step is
 * validated on the way out by `rmNext()`, and a form whose `required` fields
 * are spread across steps wants `errorSummary()` mounted beside it — that turns
 * the native submit-time check off and reports every problem in one list.
 * Without it, submitting from the last step can fail on an empty field in a
 * hidden earlier one, and because the browser cannot focus what it cannot
 * show, the submit dies with the reason in the console and nothing on screen.
 *
 * The markers are a roving tabindex group: one Tab stop for the whole journey,
 * arrow keys and Home and End to move along it, `aria-current="step"` on the
 * one you are on. Steps you have not reached are focusable but `aria-disabled`,
 * because being able to see how far there is to go is the point of a progress
 * indicator and a marker you cannot even land on tells you nothing.
 *
 * Steps are different heights, so the room for the tallest is measured once at
 * mount, while everything is still visible, and reserved. That is a layout
 * decision taken once rather than a height animated on every move, which is how
 * these normally make the page jump.
 *
 *   <form data-rm-form-progress>
 *     <fieldset data-rm-form-step><legend>Details</legend>…</fieldset>
 *     <fieldset data-rm-form-step><legend>Delivery</legend>…</fieldset>
 *   </form>
 */
export function formProgress(target = "[data-rm-form-progress]", options = {}) {
  const forms = resolveElements(target);
  if (!forms.length) return () => {};

  const { step = "[data-rm-form-step]", label = "Progress", duration = 360 } = options;
  const cleanups = [];

  for (const form of forms) {
    const steps = [...form.querySelectorAll(step)];
    if (steps.length < 2) continue;

    const name = dataString(form, "rmLabel", label);
    form.classList.add("rm-form-progress");

    // Measured now, while every step is still in the layout at its natural
    // size. Once one is hidden this number is unobtainable without a reflow.
    const tallest = Math.max(...steps.map((one) => one.getBoundingClientRect().height));
    form.style.setProperty("--rm-form-progress-floor", `${Math.round(tallest)}px`);

    const rail = document.createElement("div");
    rail.className = "rm-form-progress-rail";
    rail.setAttribute("role", "group");
    rail.setAttribute("aria-label", `${name} steps`);

    const line = document.createElement("i");
    line.className = "rm-form-progress-line";
    line.setAttribute("aria-hidden", "true");
    rail.appendChild(line);

    const bar = document.createElement("div");
    bar.className = "rm-form-progress-bar";
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-label", name);
    bar.setAttribute("aria-valuemin", "1");
    bar.setAttribute("aria-valuemax", String(steps.length));

    const titles = steps.map((one, i) => one.querySelector("legend")?.textContent?.trim() || `Step ${i + 1}`);
    const markers = steps.map((one, i) => {
      const mark = document.createElement("button");
      mark.type = "button";
      mark.className = "rm-form-progress-mark";
      mark.tabIndex = -1;
      mark.innerHTML = `<span class="rm-form-progress-num">${i + 1}</span>`;
      const text = document.createElement("span");
      text.className = "rm-form-progress-name";
      text.textContent = titles[i];
      mark.appendChild(text);
      rail.appendChild(mark);
      return mark;
    });

    rail.appendChild(bar);
    form.prepend(rail);

    const live = liveNote("rm-form-progress-live");
    const say = announcer(live, 260);
    form.appendChild(live);

    let at = 0;
    let furthest = 0;

    const show = (index, moveFocus) => {
      const was = at;
      at = clamp(index, 0, steps.length - 1);
      furthest = Math.max(furthest, at);

      steps.forEach((one, i) => {
        one.classList.add("rm-form-progress-step");
        one.hidden = i !== at;
        one.inert = i !== at;
      });

      markers.forEach((mark, i) => {
        mark.classList.toggle("is-done", i < at);
        mark.classList.toggle("is-now", i === at);
        mark.tabIndex = i === at ? 0 : -1;
        if (i === at) mark.setAttribute("aria-current", "step");
        else mark.removeAttribute("aria-current");
        const ahead = i > furthest;
        mark.setAttribute("aria-disabled", String(ahead));
        mark.classList.toggle("is-ahead", ahead);
      });

      rail.style.setProperty("--rm-form-progress-at", String(at / Math.max(1, steps.length - 1)));
      bar.setAttribute("aria-valuenow", String(at + 1));
      bar.setAttribute("aria-valuetext", `Step ${at + 1} of ${steps.length}, ${titles[at]}`);
      say(`Step ${at + 1} of ${steps.length}, ${titles[at]}`);

      if (moveFocus) {
        // Focus lands on the step's own legend, so the group is named the
        // moment it appears rather than the visitor being dropped mid-form.
        const legend = steps[at].querySelector("legend");
        if (legend) {
          legend.tabIndex = -1;
          legend.focus({ preventScroll: true });
        }
      }

      if (was !== at && !prefersReducedMotion()) {
        steps[at].animate(
          [
            { opacity: 0, transform: `translateX(${at > was ? 18 : -18}px)` },
            { opacity: 1, transform: "none" },
          ],
          { duration: dataNumber(form, "rmDuration", duration), easing: EASE.out },
        );
      }
    };

    /** Every control in a fieldset, checked by the browser's own rules. */
    const valid = (one) => {
      const controls = [...one.querySelectorAll("input, select, textarea")];
      const bad = controls.find((control) => !control.disabled && !control.checkValidity());
      if (!bad) return true;
      bad.reportValidity();
      return false;
    };

    form.rmGo = (index) => show(index, true);
    form.rmNext = () => { if (valid(steps[at])) show(at + 1, true); };
    form.rmBack = () => show(at - 1, true);
    form.rmIndex = () => at;

    const onMark = (event) => {
      const mark = event.currentTarget;
      const index = markers.indexOf(mark);
      if (index > furthest) {
        say.now(`Step ${index + 1}, ${titles[index]}, not reached yet.`);
        return;
      }
      // Going forward still has to pass the steps in between.
      if (index > at && !valid(steps[at])) return;
      show(index, true);
    };

    // Roving tabindex: the rail is one stop in the tab order and the arrows
    // walk it, which is how a group of related controls is meant to behave.
    const onKey = (event) => {
      const from = markers.indexOf(event.currentTarget);
      if (from < 0) return;
      const to = {
        ArrowRight: from + 1, ArrowDown: from + 1,
        ArrowLeft: from - 1, ArrowUp: from - 1,
        Home: 0, End: markers.length - 1,
      }[event.key];
      if (to === undefined) return;
      event.preventDefault();
      const next = clamp(to, 0, markers.length - 1);
      markers.forEach((mark, i) => { mark.tabIndex = i === next ? 0 : -1; });
      markers[next].focus();
    };

    for (const mark of markers) {
      mark.addEventListener("click", onMark);
      mark.addEventListener("keydown", onKey);
    }

    show(0, false);
    say.now("");

    cleanups.push(() => {
      say.stop();
      for (const mark of markers) {
        mark.removeEventListener("click", onMark);
        mark.removeEventListener("keydown", onKey);
      }
      delete form.rmGo;
      delete form.rmNext;
      delete form.rmBack;
      delete form.rmIndex;
      rail.remove();
      bar.remove();
      live.remove();
      steps.forEach((one) => {
        one.hidden = false;
        one.inert = false;
        one.classList.remove("rm-form-progress-step");
        one.querySelector("legend")?.removeAttribute("tabindex");
      });
      form.style.removeProperty("--rm-form-progress-floor");
      form.classList.remove("rm-form-progress");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A list of errors at the top that links to each field.
 *
 * This is the single most useful accessibility pattern in forms and the one
 * most often left out. Colouring six fields red tells you that something is
 * wrong somewhere below the fold; a summary tells you what, how many, and takes
 * you there. Each entry is a real `<a href="#id">`, so it works before any
 * JavaScript has run and lands focus on the field rather than merely scrolling
 * near it — and for a radio group it lands on the first radio, which is the
 * thing that is actually focusable.
 *
 * The summary takes focus itself when it appears, and it is deliberately *not*
 * `role="alert"`. Doing both makes a screen reader read the whole list twice,
 * once as an interruption and once on arrival, which is why the pattern so
 * often gets a reputation for being noisy. The count alone goes to a polite
 * live region.
 *
 * Native validation is turned off on the form while this is mounted, because
 * the browser's own bubble appears on one field, vanishes on the next keypress
 * and cannot be read back — and it is restored exactly as it was on cleanup.
 *
 *   <div data-rm-error-summary></div>
 *   <form>…</form>
 */
export function errorSummary(target = "[data-rm-error-summary]", options = {}) {
  const panels = resolveElements(target);
  if (!panels.length) return () => {};

  const { heading = "There is a problem", label = "Errors" } = options;
  const cleanups = [];

  for (const panel of panels) {
    const formId = panel.getAttribute("data-rm-error-summary");
    const form = (formId && document.getElementById(formId)) || panel.closest("form")
      || panel.parentElement?.querySelector("form");
    if (!form) continue;

    const title = dataString(panel, "rmHeading", heading);
    const name = dataString(panel, "rmLabel", label);

    panel.classList.add("rm-error-summary");
    panel.setAttribute("role", "region");
    panel.setAttribute("aria-label", name);
    panel.tabIndex = -1;
    panel.hidden = true;

    const head = document.createElement("h2");
    head.className = "rm-error-summary-title";
    head.textContent = title;
    const list = document.createElement("ol");
    list.className = "rm-error-summary-list";
    const live = liveNote("rm-error-summary-live");
    const say = announcer(live, 200);
    panel.append(head, list, live);

    const hadNoValidate = form.noValidate;
    form.noValidate = true;

    /** Everything restored on cleanup, keyed by the element we touched. */
    const touched = [];
    const forget = () => {
      for (const undo of touched.splice(0)) undo();
    };

    const nameOf = (field) => {
      const own = field.labels?.[0]?.textContent?.trim();
      if (own) return own;
      const group = field.closest("fieldset")?.querySelector("legend")?.textContent?.trim();
      return group || field.getAttribute("aria-label") || field.name || "This field";
    };

    const showErrors = (problems) => {
      forget();
      list.replaceChildren();

      if (!problems.length) {
        panel.hidden = true;
        say.now("");
        return;
      }

      for (const { field, message } of problems) {
        const row = document.createElement("li");
        const link = document.createElement("a");
        if (!field.id) {
          const made = uid("field");
          field.id = made;
          touched.push(() => { if (field.id === made) field.removeAttribute("id"); });
        }
        link.href = `#${field.id}`;
        link.textContent = message;
        // The anchor already goes to the right place without script; this only
        // makes sure focus, not just the scroll position, ends up on the field.
        link.addEventListener("click", (event) => {
          event.preventDefault();
          field.focus();
        });
        row.appendChild(link);
        list.appendChild(row);

        const hadInvalid = field.getAttribute("aria-invalid");
        field.setAttribute("aria-invalid", "true");
        touched.push(() => {
          if (hadInvalid) field.setAttribute("aria-invalid", hadInvalid);
          else field.removeAttribute("aria-invalid");
        });

        row.id = uid("problem");
        touched.push(describe(field, row.id));
      }

      panel.hidden = false;
      say.now(`${problems.length} ${problems.length === 1 ? "error" : "errors"} to fix.`);
      // Focus, not an alert. Both together announces the list twice.
      panel.focus();

      if (!prefersReducedMotion()) {
        panel.animate(
          [{ opacity: 0, transform: "translateY(-10px)" }, { opacity: 1, transform: "none" }],
          { duration: 320, easing: EASE.out },
        );
      }
    };

    const gather = () => {
      const seenGroups = new Set();
      const problems = [];
      for (const field of form.elements) {
        if (!field.willValidate || field.disabled) continue;
        if (field.checkValidity()) continue;
        // One entry per radio group, pointing at the first radio.
        if (field.type === "radio") {
          if (seenGroups.has(field.name)) continue;
          seenGroups.add(field.name);
        }
        const message = dataString(field, "rmError", "")
          || `${nameOf(field)}: ${field.validationMessage}`;
        problems.push({ field, message });
      }
      return problems;
    };

    const onSubmit = (event) => {
      const problems = gather();
      if (!problems.length) { showErrors([]); return; }
      event.preventDefault();
      showErrors(problems);
    };
    form.addEventListener("submit", onSubmit);

    panel.rmShow = (problems) => showErrors(
      (problems ?? []).map(({ field, message }) => ({
        field: typeof field === "string" ? document.getElementById(field) : field,
        message,
      })).filter((one) => one.field instanceof Element),
    );
    panel.rmCheck = () => { showErrors(gather()); };
    panel.rmClear = () => showErrors([]);

    cleanups.push(() => {
      say.stop();
      forget();
      form.removeEventListener("submit", onSubmit);
      form.noValidate = hadNoValidate;
      delete panel.rmShow;
      delete panel.rmCheck;
      delete panel.rmClear;
      head.remove();
      list.remove();
      live.remove();
      panel.hidden = false;
      panel.removeAttribute("tabindex");
      panel.removeAttribute("role");
      panel.removeAttribute("aria-label");
      panel.classList.remove("rm-error-summary");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}
