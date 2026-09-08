/**
 * Forms.
 *
 *   • floatLabel()     — a label that rises out of the field.
 *   • autoGrow()       — a textarea that grows without measuring anything.
 *   • charCount()      — a live counter that is announced, not just shown.
 *   • passwordToggle() — show and hide, as a real pressed button.
 *   • validate()       — inline validation wired to the field.
 *   • rangeFill()      — a range input with a filled track.
 *   • fileDrop()       — a drop zone that is still a file input.
 *   • stepper()        — a multi-step form with a progress line.
 *   • fieldFocus()     — a focus ring that draws itself.
 *   • submitState()    — a submit button that shows it is working.
 *
 * A form is the one place on a page where a decorative rewrite has a cost you
 * can measure in lost customers. So nothing here replaces an input: every
 * component decorates the real control, keeps its name and its value, keeps it
 * in the tab order, and keeps whatever the browser already does — validation,
 * autofill, password managers, the mobile keyboard that matches the type.
 *
 * The other rule: anything a sighted user is told, an assistive technology is
 * told too. A counter that only appears, an error that is only red, a toggle
 * whose state is only a change of icon — each of those is information that
 * simply does not exist for some of the people filling in the form.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import { dataNumber, dataString, prefersReducedMotion, resolveElements } from "../core/motion.js";

/** The control inside a wrapper, whatever kind it is. */
const controlIn = (element, selector) =>
  element.matches?.("input, textarea, select") ? element : element.querySelector(selector);

/**
 * A label that rises out of the field.
 *
 * It moves on focus and stays up while there is a value, which is the whole
 * difficulty: a label that drops back over typed text is the version everyone
 * ships. The label element is untouched — still a `<label>`, still associated
 * with the field — so clicking it still focuses the input and a screen reader
 * still reads it as the field's name.
 *
 *   <div data-rm-float>
 *     <input id="email" type="email" placeholder=" ">
 *     <label for="email">Email</label>
 *   </div>
 */
export function floatLabel(target = "[data-rm-float]", options = {}) {
  const wrappers = resolveElements(target);
  if (!wrappers.length) return () => {};

  const { control = "input, textarea, select", duration = 220 } = options;
  const cleanups = [];

  for (const wrapper of wrappers) {
    const field = controlIn(wrapper, control);
    const label = wrapper.querySelector("label");
    if (!field || !label) continue;

    wrapper.classList.add("rm-float");
    wrapper.style.setProperty("--rm-float-duration", `${prefersReducedMotion() ? 0 : duration}ms`);
    label.classList.add("rm-float-label");

    // A placeholder of a single space is what lets `:placeholder-shown` answer
    // "is this empty?" in CSS, so the filled state needs no JavaScript at all.
    if (field.tagName !== "SELECT" && !field.getAttribute("placeholder")) {
      field.setAttribute("placeholder", " ");
    }

    const sync = () => wrapper.classList.toggle("is-filled", Boolean(field.value));
    sync();
    field.addEventListener("input", sync);
    field.addEventListener("change", sync);

    cleanups.push(() => {
      field.removeEventListener("input", sync);
      field.removeEventListener("change", sync);
      wrapper.classList.remove("rm-float", "is-filled");
      label.classList.remove("rm-float-label");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A textarea that grows with its content.
 *
 * The wrapper is a grid whose row is sized by an invisible copy of the text,
 * and the textarea is stretched to fill it. Nothing is measured, so it is
 * correct on the first paint, after a font swap, after a paste, and at every
 * width — where the `scrollHeight` version is a frame late on all four and
 * fights the scrollbar at the boundary.
 *
 *   <div data-rm-grow><textarea rows="2"></textarea></div>
 */
export function autoGrow(target = "[data-rm-grow]", options = {}) {
  const wrappers = resolveElements(target);
  if (!wrappers.length) return () => {};

  const { control = "textarea" } = options;
  const cleanups = [];

  for (const wrapper of wrappers) {
    const field = controlIn(wrapper, control);
    if (!field) continue;

    wrapper.classList.add("rm-grow");
    field.classList.add("rm-grow-field");

    /*
     * The mirror has to have the field's box, not the other way round.
     *
     * Forcing `padding: inherit; border: inherit` onto the field is the usual
     * shortcut and it silently destroys whatever the page styled the textarea
     * with — the padding, the border, the rounded corner, all gone, with the
     * text landing hard against the edge. So the field keeps its own styling
     * and the mirror is told to match it.
     */
    const matchBox = () => {
      const box = getComputedStyle(field);
      wrapper.style.setProperty("--rm-grow-pad", box.padding);
      wrapper.style.setProperty("--rm-grow-border", box.borderWidth);
      wrapper.style.setProperty("--rm-grow-leading", box.lineHeight);
    };
    matchBox();

    const sync = () => {
      // The trailing space keeps the mirror a line tall while the last line is
      // still being typed, so the box does not bounce on every word wrap.
      wrapper.dataset.rmGrowValue = `${field.value} `;
    };
    sync();
    field.addEventListener("input", sync);

    cleanups.push(() => {
      field.removeEventListener("input", sync);
      delete wrapper.dataset.rmGrowValue;
      wrapper.style.removeProperty("--rm-grow-pad");
      wrapper.style.removeProperty("--rm-grow-border");
      wrapper.style.removeProperty("--rm-grow-leading");
      field.classList.remove("rm-grow-field");
      wrapper.classList.remove("rm-grow");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A live character counter.
 *
 * `aria-live="polite"` so it is announced, and only when it starts to matter —
 * it stays quiet until the field is near its limit, because a counter that
 * speaks on every keystroke is unusable with a screen reader on.
 */
export function charCount(target = "[data-rm-count-chars]", options = {}) {
  const fields = resolveElements(target);
  if (!fields.length) return () => {};

  const { warnAt = 0.8 } = options;
  const cleanups = [];

  for (const field of fields) {
    const max = Number(field.getAttribute("maxlength")) || dataNumber(field, "rmCountChars", 0);
    if (!max) continue;

    const readout = document.createElement("span");
    readout.className = "rm-charcount";
    readout.setAttribute("aria-live", "polite");
    field.after(readout);
    field.classList.add("rm-charcount-field");

    let announced = false;
    const sync = () => {
      const used = field.value.length;
      readout.textContent = `${used} / ${max}`;
      const near = used / max >= warnAt;
      readout.classList.toggle("is-near", near);
      readout.classList.toggle("is-full", used >= max);
      // Silent until it matters, then it starts speaking and keeps speaking.
      if (near && !announced) { announced = true; readout.setAttribute("aria-live", "polite"); }
      if (!near && !announced) readout.setAttribute("aria-live", "off");
    };
    sync();
    field.addEventListener("input", sync);

    cleanups.push(() => {
      field.removeEventListener("input", sync);
      readout.remove();
      field.classList.remove("rm-charcount-field");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Show and hide a password.
 *
 * A real button with `aria-pressed`, so its state is announced rather than
 * implied by an icon. Focus and the caret position are restored after the type
 * changes, because switching `type` resets the selection and losing your place
 * mid-password is exactly the moment you did not want it.
 */
export function passwordToggle(target = "[data-rm-password]", options = {}) {
  const wrappers = resolveElements(target);
  if (!wrappers.length) return () => {};

  const { show = "Show password", hide = "Hide password" } = options;
  const cleanups = [];

  for (const wrapper of wrappers) {
    const field = controlIn(wrapper, 'input[type="password"], input[type="text"]');
    if (!field) continue;

    wrapper.classList.add("rm-password");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "rm-password-toggle";
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", dataString(wrapper, "rmShow", show));
    button.textContent = "👁";
    wrapper.appendChild(button);

    const toggle = () => {
      const shown = field.type === "text";
      const at = field.selectionStart;
      field.type = shown ? "password" : "text";
      button.setAttribute("aria-pressed", String(!shown));
      button.setAttribute("aria-label", shown ? dataString(wrapper, "rmShow", show) : hide);
      field.focus();
      try { field.setSelectionRange(at, at); } catch { /* not a text field any more */ }
    };
    button.addEventListener("click", toggle);

    cleanups.push(() => {
      button.removeEventListener("click", toggle);
      button.remove();
      wrapper.classList.remove("rm-password");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Inline validation, wired to the field.
 *
 * It uses the browser's own constraint validation — `required`, `type`,
 * `pattern`, `minlength` — rather than a second set of rules that will drift
 * from the ones the server enforces. The message is linked with
 * `aria-describedby` and the field is marked `aria-invalid`, so the error is
 * part of the field rather than red text near it.
 *
 * It validates on blur and then on every input, never on the first keystroke:
 * telling someone their email is invalid after they have typed one letter is
 * technically true and completely useless.
 */
export function validate(target = "[data-rm-validate]", options = {}) {
  const forms = resolveElements(target);
  if (!forms.length) return () => {};

  const { control = "input, textarea, select" } = options;
  const cleanups = [];
  let uid = 0;

  for (const form of forms) {
    const fields = [...form.querySelectorAll(control)].filter((one) => one.willValidate);
    if (!fields.length) continue;
    form.classList.add("rm-validate");
    form.setAttribute("novalidate", "");

    for (const field of fields) {
      const message = document.createElement("p");
      message.className = "rm-validate-message";
      message.id = `rm-error-${++uid}`;
      message.hidden = true;
      (field.closest("[data-rm-field]") ?? field).after(message);

      let touched = false;

      const check = () => {
        const ok = field.checkValidity();
        field.setAttribute("aria-invalid", String(!ok));
        field.classList.toggle("is-invalid", !ok);
        message.textContent = ok ? "" : field.validationMessage;
        message.hidden = ok;
        if (ok) field.removeAttribute("aria-describedby");
        else field.setAttribute("aria-describedby", message.id);
      };

      const onBlur = () => { touched = true; check(); };
      const onInput = () => { if (touched) check(); };

      field.addEventListener("blur", onBlur);
      field.addEventListener("input", onInput);
      cleanups.push(() => {
        field.removeEventListener("blur", onBlur);
        field.removeEventListener("input", onInput);
        message.remove();
        field.classList.remove("is-invalid");
        field.removeAttribute("aria-invalid");
        field.removeAttribute("aria-describedby");
      });
    }

    const onSubmit = (event) => {
      const bad = fields.find((one) => !one.checkValidity());
      if (!bad) return;
      event.preventDefault();
      bad.dispatchEvent(new Event("blur"));
      bad.focus();
    };
    form.addEventListener("submit", onSubmit);
    cleanups.push(() => {
      form.removeEventListener("submit", onSubmit);
      form.removeAttribute("novalidate");
      form.classList.remove("rm-validate");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A range input with a filled track.
 *
 * The input is untouched: still a range, still keyboard-operable, still
 * announced with its value. A custom property carries how far along it is, and
 * the stylesheet paints the fill — so there is no second element pretending to
 * be a slider and no drag handling to get wrong.
 */
export function rangeFill(target = "[data-rm-range]", options = {}) {
  const fields = resolveElements(target);
  if (!fields.length) return () => {};

  const { output = true } = options;
  const cleanups = [];

  for (const field of fields) {
    if (field.type !== "range") continue;
    field.classList.add("rm-range");

    let readout = null;
    if (output) {
      readout = document.createElement("output");
      readout.className = "rm-range-output";
      field.after(readout);
    }

    const sync = () => {
      const min = Number(field.min || 0);
      const max = Number(field.max || 100);
      const ratio = max === min ? 0 : (Number(field.value) - min) / (max - min);
      field.style.setProperty("--rm-range-fill", `${(ratio * 100).toFixed(2)}%`);
      if (readout) readout.textContent = field.value;
    };
    sync();
    field.addEventListener("input", sync);

    cleanups.push(() => {
      field.removeEventListener("input", sync);
      readout?.remove();
      field.classList.remove("rm-range");
      field.style.removeProperty("--rm-range-fill");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A drop zone that is still a file input.
 *
 * Dragging is added on top; the input keeps its own button, so the field can
 * be reached with a keyboard and opened with Enter. A drop zone with the input
 * hidden behind `display: none` is a control nobody can use without a mouse,
 * and it is the usual shape of this component.
 */
export function fileDrop(target = "[data-rm-drop]", options = {}) {
  const zones = resolveElements(target);
  if (!zones.length) return () => {};

  const { control = 'input[type="file"]', empty = "No file chosen" } = options;
  const cleanups = [];

  for (const zone of zones) {
    const field = controlIn(zone, control);
    if (!field) continue;

    zone.classList.add("rm-drop");
    const readout = document.createElement("p");
    readout.className = "rm-drop-readout";
    readout.setAttribute("aria-live", "polite");
    readout.textContent = empty;
    zone.appendChild(readout);

    const describe = () => {
      const files = [...(field.files ?? [])];
      readout.textContent = files.length
        ? files.map((one) => one.name).join(", ")
        : empty;
    };

    const over = (event) => { event.preventDefault(); zone.classList.add("is-over"); };
    const out = () => zone.classList.remove("is-over");
    const drop = (event) => {
      event.preventDefault();
      zone.classList.remove("is-over");
      if (!event.dataTransfer?.files?.length) return;
      // Hand the files to the real input, so the form submits them normally.
      field.files = event.dataTransfer.files;
      field.dispatchEvent(new Event("change", { bubbles: true }));
    };

    zone.addEventListener("dragover", over);
    zone.addEventListener("dragleave", out);
    zone.addEventListener("drop", drop);
    field.addEventListener("change", describe);

    cleanups.push(() => {
      zone.removeEventListener("dragover", over);
      zone.removeEventListener("dragleave", out);
      zone.removeEventListener("drop", drop);
      field.removeEventListener("change", describe);
      readout.remove();
      zone.classList.remove("rm-drop", "is-over");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A multi-step form with a progress line.
 *
 * Each step is a `<fieldset>` that is genuinely hidden when inactive, so a
 * screen reader cannot wander into step three while you are on step one, and
 * the browser will not try to validate a field nobody can see. Moving forward
 * runs the browser's own validation on the current step first.
 *
 *   <form data-rm-steps>
 *     <fieldset data-rm-step>…</fieldset>
 *     <fieldset data-rm-step>…</fieldset>
 *     <button data-rm-step-back>Back</button>
 *     <button data-rm-step-next>Next</button>
 *   </form>
 */
export function stepper(target = "[data-rm-steps]", options = {}) {
  const forms = resolveElements(target);
  if (!forms.length) return () => {};

  const {
    step = "[data-rm-step]",
    next = "[data-rm-step-next]",
    back = "[data-rm-step-back]",
    duration = 320,
  } = options;
  const cleanups = [];

  for (const form of forms) {
    const steps = [...form.querySelectorAll(step)];
    const forward = form.querySelector(next);
    const backward = form.querySelector(back);
    if (steps.length < 2 || !forward) continue;

    form.classList.add("rm-steps");
    form.style.setProperty("--rm-steps-duration", `${prefersReducedMotion() ? 0 : duration}ms`);
    form.style.setProperty("--rm-steps-count", String(steps.length));

    const bar = document.createElement("div");
    bar.className = "rm-steps-bar";
    bar.setAttribute("aria-hidden", "true");
    bar.innerHTML = '<i class="rm-steps-fill"></i>';
    form.prepend(bar);

    const status = document.createElement("p");
    status.className = "rm-steps-status";
    status.setAttribute("aria-live", "polite");
    bar.after(status);

    let at = 0;
    const show = (index, direction = 1) => {
      at = Math.max(0, Math.min(index, steps.length - 1));
      steps.forEach((one, i) => {
        one.hidden = i !== at;
        one.classList.toggle("is-current", i === at);
      });
      form.style.setProperty("--rm-steps-at", String(at + 1));
      status.textContent = `Step ${at + 1} of ${steps.length}`;
      if (backward) backward.disabled = at === 0;
      if (!prefersReducedMotion()) {
        steps[at].animate(
          [{ opacity: 0, transform: `translateX(${direction * 22}px)` }, { opacity: 1, transform: "translateX(0)" }],
          { duration, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
        );
      }
      steps[at].querySelector("input, textarea, select")?.focus({ preventScroll: true });
    };
    show(0);

    const onNext = (event) => {
      event.preventDefault();
      // Only the current step is checked, because the later ones are hidden
      // and asking the browser to validate them would be nonsense.
      const bad = [...steps[at].querySelectorAll("input, textarea, select")]
        .find((one) => one.willValidate && !one.checkValidity());
      if (bad) { bad.reportValidity(); return; }
      if (at < steps.length - 1) show(at + 1, 1);
      else form.requestSubmit?.();
    };
    const onBack = (event) => { event.preventDefault(); show(at - 1, -1); };

    forward.addEventListener("click", onNext);
    backward?.addEventListener("click", onBack);

    cleanups.push(() => {
      forward.removeEventListener("click", onNext);
      backward?.removeEventListener("click", onBack);
      bar.remove();
      status.remove();
      steps.forEach((one) => { one.hidden = false; one.classList.remove("is-current"); });
      form.classList.remove("rm-steps");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A focus ring that draws itself around the field.
 *
 * Decoration on top of the real focus outline, never instead of it: the ring
 * is drawn when the browser says `:focus-visible`, so it appears for the
 * keyboard and stays out of the way of the mouse, and removing this component
 * leaves the field's own focus style intact.
 */
export function fieldFocus(target = "[data-rm-field-focus]", options = {}) {
  const fields = resolveElements(target);
  if (!fields.length) return () => {};

  const { color = "#2aa7e4", duration = 260 } = options;

  for (const field of fields) {
    field.classList.add("rm-field-focus");
    field.style.setProperty("--rm-field-focus-color", dataString(field, "rmColor", color));
    field.style.setProperty("--rm-field-focus-duration", `${prefersReducedMotion() ? 0 : duration}ms`);
  }

  return () => fields.forEach((field) => field.classList.remove("rm-field-focus"));
}

/**
 * A submit button that shows it is working.
 *
 * `aria-busy` and a disabled state while the form is in flight, so a second
 * click cannot double-submit and the wait is announced rather than only
 * spinning. The label is restored whether the promise resolves or rejects,
 * because a button stuck on "Sending…" after a failure is worse than no
 * feedback at all.
 */
export function submitState(target = "[data-rm-submit]", options = {}) {
  const buttons = resolveElements(target);
  if (!buttons.length) return () => {};

  const { busy = "Working…", done = "Done" } = options;
  const cleanups = [];

  for (const button of buttons) {
    const label = button.textContent ?? "";
    button.classList.add("rm-submit");

    const form = button.closest("form");
    if (!form) continue;

    const onSubmit = () => {
      button.disabled = true;
      button.setAttribute("aria-busy", "true");
      button.textContent = dataString(button, "rmBusy", busy);
    };

    /** Call when the request finishes, however it finished. */
    const settle = (ok = true) => {
      button.disabled = false;
      button.removeAttribute("aria-busy");
      button.textContent = ok ? dataString(button, "rmDone", done) : label;
      setTimeout(() => { button.textContent = label; }, 1600);
    };
    button.rmSettle = settle;

    form.addEventListener("submit", onSubmit);
    cleanups.push(() => {
      form.removeEventListener("submit", onSubmit);
      delete button.rmSettle;
      button.textContent = label;
      button.disabled = false;
      button.classList.remove("rm-submit");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A face that covers its eyes while you type your password.
 *
 * The one everybody knows from Telegram, and it earns its place: it makes the
 * most anxious field on any form say, in a way you feel rather than read, that
 * nobody is looking. It watches while you type your email, hides when the
 * password takes focus, and peeks when you press show — so the animation is
 * telling you the truth about the field's state rather than playing a loop.
 *
 * Drawn as inline SVG, so it inherits the page's colour and needs no asset.
 *
 *   <div data-rm-mascot>
 *     <input type="email"> <input type="password">
 *   </div>
 */
export function mascot(target = "[data-rm-mascot]", options = {}) {
  const wrappers = resolveElements(target);
  if (!wrappers.length) return () => {};

  const {
    watch = 'input[type="email"], input[type="text"]',
    secret = 'input[type="password"], [data-rm-secret]',
    size = 96,
  } = options;
  const cleanups = [];

  for (const wrapper of wrappers) {
    const eyes = wrapper.querySelector(watch);
    const hidden = wrapper.querySelector(secret);
    if (!eyes && !hidden) continue;

    const face = document.createElement("div");
    face.className = "rm-mascot";
    face.setAttribute("aria-hidden", "true");
    face.style.setProperty("--rm-mascot-size", `${dataNumber(wrapper, "rmSize", size)}px`);
    face.innerHTML =
      '<svg viewBox="0 0 120 130" fill="none">' +
      '<circle class="rm-mascot-ear" cx="24" cy="44" r="14"/>' +
      '<circle class="rm-mascot-ear" cx="96" cy="44" r="14"/>' +
      '<circle class="rm-mascot-head" cx="60" cy="62" r="40"/>' +
      '<g class="rm-mascot-eyes">' +
      '<circle class="rm-mascot-eye" cx="46" cy="58" r="5"/>' +
      '<circle class="rm-mascot-eye" cx="74" cy="58" r="5"/>' +
      "</g>" +
      '<path class="rm-mascot-mouth" d="M50 78 Q60 86 70 78" stroke-width="3" stroke-linecap="round"/>' +
      '<g class="rm-mascot-hands">' +
      '<ellipse class="rm-mascot-hand" cx="38" cy="118" rx="20" ry="16"/>' +
      '<ellipse class="rm-mascot-hand" cx="82" cy="118" rx="20" ry="16"/>' +
      "</g></svg>";
    wrapper.prepend(face);

    // The eyes drift along the field as it fills, so the face is reacting to
    // you rather than running a loop next to you.
    const look = () => {
      if (!eyes) return;
      const filled = Math.min(1, eyes.value.length / 22);
      face.style.setProperty("--rm-mascot-look", (filled * 7 - 3.5).toFixed(2));
    };

    const cover = () => face.classList.add("is-hiding");
    const uncover = () => face.classList.remove("is-hiding");

    eyes?.addEventListener("input", look);
    eyes?.addEventListener("focus", uncover);
    hidden?.addEventListener("focus", cover);
    hidden?.addEventListener("blur", uncover);

    // Where there is a show/hide toggle, peeking is exactly what it means.
    const toggle = wrapper.querySelector(".rm-password-toggle");
    const onToggle = () =>
      face.classList.toggle("is-peeking", toggle.getAttribute("aria-pressed") === "true");
    const onToggleClick = () => setTimeout(onToggle, 0);
    toggle?.addEventListener("click", onToggleClick);

    cleanups.push(() => {
      eyes?.removeEventListener("input", look);
      eyes?.removeEventListener("focus", uncover);
      hidden?.removeEventListener("focus", cover);
      hidden?.removeEventListener("blur", uncover);
      toggle?.removeEventListener("click", onToggleClick);
      face.remove();
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A submit button that collapses into a tick.
 *
 * The label goes, the button pulls in to a circle, and a tick draws itself
 * with `stroke-dashoffset` — a real path being drawn rather than an icon
 * fading in, which is the difference between the moment landing and it merely
 * happening.
 *
 * It stays a real button throughout: `aria-busy` while it works, the result
 * announced through a live region, and the whole thing reversible, because a
 * button stuck as a dead circle after a failure is worse than no feedback.
 *
 *   <button data-rm-success>Create account</button>
 *   // when your request settles:
 *   button.rmSuccess();   // or button.rmFail()
 */
export function successButton(target = "[data-rm-success]", options = {}) {
  const buttons = resolveElements(target);
  if (!buttons.length) return () => {};

  const { duration = 520, hold = 1800, announce = "Done", failed = "That did not work" } = options;
  const cleanups = [];

  for (const button of buttons) {
    const label = button.textContent ?? "";
    const original = button.innerHTML;
    button.classList.add("rm-success");

    const face = document.createElement("span");
    face.className = "rm-success-label";
    face.textContent = label;

    const mark = document.createElement("span");
    mark.className = "rm-success-mark";
    mark.setAttribute("aria-hidden", "true");
    mark.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none"><path d="M4 12.5 L9.5 18 L20 6.5" ' +
      'stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    const live = document.createElement("span");
    live.className = "rm-success-live";
    live.setAttribute("aria-live", "polite");

    button.replaceChildren(face, mark, live);
    button.style.setProperty("--rm-success-duration", `${prefersReducedMotion() ? 0 : duration}ms`);

    const reset = () => {
      button.classList.remove("is-done", "is-failed", "is-busy");
      button.disabled = false;
      button.removeAttribute("aria-busy");
      live.textContent = "";
    };

    button.rmBusy = () => {
      button.classList.add("is-busy");
      button.disabled = true;
      button.setAttribute("aria-busy", "true");
    };
    button.rmSuccess = () => {
      button.classList.remove("is-busy");
      button.classList.add("is-done");
      button.disabled = true;
      button.removeAttribute("aria-busy");
      live.textContent = dataString(button, "rmAnnounce", announce);
      setTimeout(reset, hold);
    };
    button.rmFail = () => {
      button.classList.remove("is-busy");
      button.classList.add("is-failed");
      button.disabled = false;
      button.removeAttribute("aria-busy");
      live.textContent = failed;
      setTimeout(reset, hold);
    };

    cleanups.push(() => {
      delete button.rmBusy;
      delete button.rmSuccess;
      delete button.rmFail;
      button.classList.remove("rm-success", "is-done", "is-failed", "is-busy");
      button.innerHTML = original;
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A one-time code, one box per digit.
 *
 * Typing advances, Backspace on an empty box steps back, the arrows move, and
 * pasting a whole code fills every box at once — which is what people actually
 * do with a code, and what almost every implementation of this drops on the
 * floor.
 *
 * Each box is a real input with `inputmode="numeric"`, and the first carries
 * `autocomplete="one-time-code"`, so a phone offers the code straight from the
 * message.
 *
 *   <div data-rm-otp data-rm-length="6"></div>
 */
export function otp(target = "[data-rm-otp]", options = {}) {
  const wrappers = resolveElements(target);
  if (!wrappers.length) return () => {};

  const { length = 6, name = "code" } = options;
  const cleanups = [];

  for (const wrapper of wrappers) {
    const count = Math.max(2, Math.min(10, dataNumber(wrapper, "rmLength", length)));
    wrapper.classList.add("rm-otp");
    wrapper.setAttribute("role", "group");
    if (!wrapper.hasAttribute("aria-label")) wrapper.setAttribute("aria-label", "One-time code");

    const boxes = [];
    for (let i = 0; i < count; i++) {
      const box = document.createElement("input");
      box.className = "rm-otp-box";
      box.type = "text";
      box.inputMode = "numeric";
      box.maxLength = 1;
      box.autocomplete = i === 0 ? "one-time-code" : "off";
      box.setAttribute("aria-label", `Digit ${i + 1} of ${count}`);
      wrapper.appendChild(box);
      boxes.push(box);
    }

    const hidden = document.createElement("input");
    hidden.type = "hidden";
    hidden.name = dataString(wrapper, "rmName", name);
    wrapper.appendChild(hidden);

    const collect = () => { hidden.value = boxes.map((one) => one.value).join(""); };

    const onInput = (index) => {
      const box = boxes[index];
      box.value = box.value.replace(/[^0-9]/g, "").slice(-1);
      box.classList.toggle("is-filled", Boolean(box.value));
      collect();
      if (box.value && index < boxes.length - 1) boxes[index + 1].focus();
    };

    const onKey = (event, index) => {
      if (event.key === "Backspace" && !boxes[index].value && index > 0) {
        event.preventDefault();
        const previous = boxes[index - 1];
        previous.focus();
        previous.value = "";
        previous.classList.remove("is-filled");
        collect();
        return;
      }
      const moves = { ArrowLeft: -1, ArrowRight: 1 };
      if (event.key in moves) {
        event.preventDefault();
        boxes[Math.max(0, Math.min(boxes.length - 1, index + moves[event.key]))].focus();
      }
    };

    // A pasted code lands in every box, not only the one you were in.
    const onPaste = (event) => {
      const text = (event.clipboardData?.getData("text") ?? "").replace(/[^0-9]/g, "");
      if (!text) return;
      event.preventDefault();
      boxes.forEach((box, i) => {
        box.value = text[i] ?? "";
        box.classList.toggle("is-filled", Boolean(box.value));
      });
      collect();
      boxes[Math.min(text.length, boxes.length - 1)].focus();
    };

    const handlers = boxes.map((box, index) => {
      const input = () => onInput(index);
      const key = (event) => onKey(event, index);
      box.addEventListener("input", input);
      box.addEventListener("keydown", key);
      box.addEventListener("paste", onPaste);
      return () => {
        box.removeEventListener("input", input);
        box.removeEventListener("keydown", key);
        box.removeEventListener("paste", onPaste);
      };
    });

    cleanups.push(() => {
      handlers.forEach((off) => off());
      wrapper.replaceChildren();
      wrapper.classList.remove("rm-otp");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A padlock that opens when the answer is right, and clamps shut when it is
 * not.
 *
 * The shackle lifts and swings, the body gives a little kick, and the whole
 * thing settles — or it slams down and the field shakes. Two states, both
 * physical, because "correct" and "wrong" are the two things this control has
 * to say and a colour change says neither of them loudly enough.
 *
 * The lock is decoration: `aria-hidden`, with the real result announced
 * through a live region, so it is never the only way to know what happened.
 *
 *   <div data-rm-lock>
 *     <input type="password">
 *   </div>
 *   // when you know:
 *   wrapper.rmUnlock();   // or wrapper.rmDeny()
 */
export function padlock(target = "[data-rm-lock]", options = {}) {
  const wrappers = resolveElements(target);
  if (!wrappers.length) return () => {};

  const {
    control = "input",
    size = 68,
    opened = "Unlocked",
    denied = "That is not it",
    hold = 2200,
  } = options;
  const cleanups = [];

  for (const wrapper of wrappers) {
    const field = controlIn(wrapper, control);

    wrapper.classList.add("rm-lock");
    wrapper.style.setProperty("--rm-lock-size", `${dataNumber(wrapper, "rmSize", size)}px`);

    const lock = document.createElement("div");
    lock.className = "rm-lock-body";
    lock.setAttribute("aria-hidden", "true");
    lock.innerHTML =
      '<svg viewBox="0 0 64 76" fill="none">' +
      // The shackle is its own group so it can lift and swing about the hinge.
      '<g class="rm-lock-shackle">' +
      '<path d="M18 32 V22 a14 14 0 0 1 28 0 V32" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>' +
      "</g>" +
      '<rect class="rm-lock-case" x="8" y="32" width="48" height="38" rx="9"/>' +
      '<circle class="rm-lock-pin" cx="32" cy="48" r="4"/>' +
      '<rect class="rm-lock-pin" x="30" y="50" width="4" height="10" rx="2"/>' +
      "</svg>";
    wrapper.prepend(lock);

    const live = document.createElement("span");
    live.className = "rm-lock-live";
    live.setAttribute("aria-live", "polite");
    wrapper.appendChild(live);

    const reset = () => {
      wrapper.classList.remove("is-open", "is-denied");
      live.textContent = "";
    };

    wrapper.rmUnlock = () => {
      wrapper.classList.remove("is-denied");
      wrapper.classList.add("is-open");
      live.textContent = dataString(wrapper, "rmOpened", opened);
    };

    wrapper.rmDeny = () => {
      wrapper.classList.remove("is-open");
      // Restart the shake even when it is already running: re-adding a class
      // does not replay an animation, so the frame in between is the point.
      wrapper.classList.remove("is-denied");
      void wrapper.offsetWidth;
      wrapper.classList.add("is-denied");
      live.textContent = dataString(wrapper, "rmDenied", denied);
      field?.focus();
      field?.select?.();
      setTimeout(reset, hold);
    };

    // Typing again puts it back to neutral: the last answer is no longer the
    // answer on screen.
    const onInput = () => {
      if (wrapper.classList.contains("is-denied")) reset();
    };
    field?.addEventListener("input", onInput);

    cleanups.push(() => {
      field?.removeEventListener("input", onInput);
      delete wrapper.rmUnlock;
      delete wrapper.rmDeny;
      lock.remove();
      live.remove();
      wrapper.classList.remove("rm-lock", "is-open", "is-denied");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}
