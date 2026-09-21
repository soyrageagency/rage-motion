/**
 * Media playback — sixteen pieces that wrap a real player rather than replace one.
 *
 *   • playerBar()      — a control bar over a real video, every control a real button.
 *   • scrubber()       — a real slider that announces a time, not a percentage.
 *   • waveform()       — peaks from the markup, so it costs nothing to draw.
 *   • chapterList()    — real buttons that seek, with the current one marked.
 *   • captionToggle()  — the one control the whole category gets wrong.
 *   • rateMenu()       — playback speed as a real menu with real focus management.
 *   • volumeDial()     — a ring you can read and a slider you can actually use.
 *   • pipToggle()      — picture-in-picture, feature-detected and honest about it.
 *   • queueList()      — a play queue reorderable by pointer and by keyboard.
 *   • nowPlaying()     — title and artist, scrolling only when they overflow.
 *   • transcriptSync() — the current line marked, every line a seek.
 *   • thumbStrip()     — preview frames that seek, and scroll only themselves.
 *   • liveBadge()      — live, or how far behind live, with a way back.
 *   • bufferRing()     — a spinner that waits before it appears.
 *   • miniPlayer()     — docked, dismissible, announced, and never a focus trap.
 *   • keyboardHints()  — the shortcuts, and the shortcuts themselves.
 *
 * Fourteen of these attach to a real `<video>` or `<audio>` element and ask it
 * questions; `queueList` and `nowPlaying` are driven by the page instead, since
 * a queue and a title card outlive any one media element. Nothing here
 * reimplements playback, decodes audio, or swaps the
 * media element for a canvas: the browser's player already handles codecs,
 * hardware decoding, captions, AirPlay, the system media keys and the lock
 * screen, and every one of those is lost the moment a kit decides to draw its
 * own. What the browser does *not* give you is a control bar that matches the
 * page, so that — and only that — is what this file builds.
 *
 * Native controls are never destroyed, only stood down. `playerBar` remembers
 * whether `controls` was set, turns it off while its own bar is mounted, offers
 * a button that turns it straight back on, and restores the original value on
 * cleanup. A custom player that has broken in a browser you did not test is a
 * video nobody can watch; a custom player that has broken with the native
 * controls one button away is an inconvenience.
 *
 * Media players are the worst category on the web for accessibility and it is
 * always the same three failures. Controls that are divs, so there is no
 * keyboard path and no accessible name. A scrubber that announces "47 percent",
 * which is not a place in a film. And a modal that grabs focus and will not give
 * it back. So: every control here is a `<button type="button">` or a real
 * `<input type="range">`, every slider carries an `aria-valuetext` in minutes
 * and seconds, and nothing in this file traps focus — the hints panel and the
 * mini player are both deliberately non-modal for exactly that reason.
 *
 * Only transform, opacity, clip-path and colour move. The control bar retreats
 * by translating out of the frame rather than being hidden, so it stays
 * focusable and comes back the moment anything inside it is reached.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import {
  clamp, dataNumber, dataString, EASE, keepInView, onFrame, prefersReducedMotion,
  resolveElements, whileVisible,
} from "../core/motion.js";

/** An id for `aria-` wiring that needs one, without demanding it in markup. */
const uid = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

/** Is this a media element we can actually drive? */
const isMedia = (node) => node instanceof HTMLMediaElement;

/**
 * Find the media element a control belongs to.
 *
 * `data-rm-for` wins, then a media element inside the control, then the nearest
 * ancestor that contains one. The walk upwards matters: the lazy version is
 * `document.querySelector("video")`, which on a page with two players wires
 * every control on the second one to the first, and does it silently.
 */
function mediaFor(element) {
  const id = dataString(element, "rmFor", "");
  if (id) {
    const named = document.getElementById(id);
    if (isMedia(named)) return named;
  }
  const inside = element.querySelector("video, audio");
  if (isMedia(inside)) return inside;
  for (let node = element.parentElement; node; node = node.parentElement) {
    const near = node.querySelector("video, audio");
    if (isMedia(near)) return near;
  }
  return null;
}

/** A live region owned by one component and removed with it. */
function announcer(holder, tone = "polite") {
  const said = document.createElement("p");
  said.className = "rm-player-live";
  said.setAttribute("aria-live", tone);
  said.setAttribute("role", tone === "assertive" ? "alert" : "status");
  // A `<p>` is not allowed inside a list, and an invalid child of `<ol>` is a
  // child some screen readers drop from the list entirely.
  if (holder.tagName === "OL" || holder.tagName === "UL" || holder.tagName === "DL") {
    holder.insertAdjacentElement("afterend", said);
  } else {
    holder.appendChild(said);
  }
  return said;
}

/** 3:42, or 1:02:03 once it needs an hour. What the eye reads. */
function clockTime(seconds) {
  const safe = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  const pad = (n) => String(n).padStart(2, "0");
  const s = safe % 60;
  const m = Math.floor(safe / 60) % 60;
  const h = Math.floor(safe / 3600);
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/**
 * The same instant in words: "3 minutes 42 seconds".
 *
 * A screen reader given "3:42" says "three colon forty two" or "three forty
 * two" depending on which one it is, and neither is a duration. The whole point
 * of `aria-valuetext` on a seek bar is that the spoken form is allowed to
 * differ from the drawn one, and this is the case it was invented for.
 */
function spokenTime(seconds) {
  const safe = Number.isFinite(seconds) && seconds > 0 ? Math.round(seconds) : 0;
  const s = safe % 60;
  const m = Math.floor(safe / 60) % 60;
  const h = Math.floor(safe / 3600);
  const parts = [];
  if (h) parts.push(`${h} hour${h === 1 ? "" : "s"}`);
  if (m) parts.push(`${m} minute${m === 1 ? "" : "s"}`);
  if (s || !parts.length) parts.push(`${s} second${s === 1 ? "" : "s"}`);
  return parts.join(" ");
}

/** How long the media runs, in a form that survives a live stream. */
function runtimeOf(media) {
  if (!media) return 0;
  if (Number.isFinite(media.duration) && media.duration > 0) return media.duration;
  if (media.seekable && media.seekable.length) return media.seekable.end(media.seekable.length - 1);
  return 0;
}

/** How much is buffered ahead of where we are, as a fraction of the runtime. */
function bufferedAhead(media) {
  const total = runtimeOf(media);
  if (!media || !total || !media.buffered || !media.buffered.length) return 0;
  const at = media.currentTime;
  for (let i = 0; i < media.buffered.length; i++) {
    if (media.buffered.start(i) <= at && media.buffered.end(i) >= at) {
      return clamp(media.buffered.end(i) / total, 0, 1);
    }
  }
  return 0;
}

/**
 * Wrap an element's own children in a button, and hand back the undo.
 *
 * Chapters, transcript lines and queue rows all arrive as plain text in the
 * markup, which is the point — the list reads perfectly with no script. Making
 * each one operable means putting a real button around what is already there
 * rather than rewriting the row, so the text, its markup and its language
 * attributes all survive.
 *
 * That only holds if callers then leave the accessible name alone. An
 * `aria-label` on the wrapper replaces the whole computed name with one flat
 * string, throwing away the emphasis, the abbreviations and the `lang` of every
 * phrase inside — a Spanish clause in an English line comes back read in
 * English. So anything a row needs to add goes in a visually hidden span
 * *inside* the button, where it joins the name rather than replacing it.
 */
function buttonise(row, className) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  const original = [...row.childNodes];
  button.append(...original);
  row.appendChild(button);
  return {
    button,
    undo() {
      row.append(...original);
      button.remove();
    },
  };
}

/** Is the keyboard currently somewhere that owns its own arrow keys? */
function typingSomewhere(node) {
  if (!(node instanceof Element)) return false;
  if (node.isContentEditable) return true;
  const tag = node.tagName;
  if (tag === "TEXTAREA" || tag === "SELECT") return true;
  return tag === "INPUT";
}

/**
 * A control bar over a real video, with every control a real button.
 *
 * The bar is a `role="group"` of `<button type="button">` elements sitting over
 * the video, not beside it, so it costs no layout and the video never resizes
 * when it appears. When the pointer goes still during playback the bar
 * *translates out of the frame* and fades; it is never `display: none` and
 * never `visibility: hidden`, because a hidden control bar is one a keyboard
 * cannot reach, and the whole reason people build custom players badly is that
 * they solve the idle problem with `display`. Anything inside it taking focus
 * brings it straight back.
 *
 * Native controls are stood down, not destroyed. The bar carries a "Browser
 * controls" toggle that hands them back at any moment, and cleanup restores
 * whatever `controls` was before. Under reduced motion the bar never retreats
 * at all — a control that vanishes on a timer is exactly the kind of movement
 * that preference is asking you to stop.
 *
 *   <figure data-rm-player-bar data-rm-skip="10">
 *     <video src="/film/kiln.mp4" poster="/film/kiln.jpg" controls></video>
 *   </figure>
 */
export function playerBar(target = "[data-rm-player-bar]", options = {}) {
  const frames = resolveElements(target);
  if (!frames.length) return () => {};

  const { idle = 2600, skip = 10, label = "Video player" } = options;
  const cleanups = [];

  for (const frame of frames) {
    const media = mediaFor(frame);
    if (!media) continue;

    const jump = Math.max(1, dataNumber(frame, "rmSkip", skip));
    const rest = Math.max(0, dataNumber(frame, "rmIdle", idle));
    const name = dataString(frame, "rmLabel", label);

    frame.classList.add("rm-player-bar");
    const hadControls = media.controls;
    media.controls = false;

    const bar = document.createElement("div");
    bar.className = "rm-player-bar-controls";
    bar.setAttribute("role", "group");
    bar.setAttribute("aria-label", `${name} controls`);

    const make = (className, text, accessibleName) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `rm-player-bar-button ${className}`;
      button.innerHTML = text;
      // Icon-only controls get their name from an attribute; the glyph is
      // decoration and is marked as such by being inside an aria-hidden span.
      button.setAttribute("aria-label", accessibleName);
      bar.appendChild(button);
      return button;
    };

    const glyph = (path) =>
      `<span aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false">${path}</svg></span>`;

    const back = make(
      "is-back",
      glyph('<path d="M11 5 4 12l7 7M20 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'),
      `Back ${jump} seconds`,
    );
    const toggle = make("is-toggle", "", "Play");
    const forward = make(
      "is-forward",
      glyph('<path d="M13 5l7 7-7 7M4 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'),
      `Forward ${jump} seconds`,
    );

    const time = document.createElement("p");
    time.className = "rm-player-bar-time";
    // Drawn, not announced. A clock that updates four times a second inside a
    // live region is a screen reader talking over the film; the seek slider's
    // aria-valuetext is where the time is actually available.
    time.setAttribute("aria-hidden", "true");
    bar.appendChild(time);

    const native = make(
      "is-native",
      '<span aria-hidden="true">⚙</span>',
      "Use the browser's own controls",
    );
    native.setAttribute("aria-pressed", "false");

    let full = null;
    if (frame.requestFullscreen) {
      full = make(
        "is-full",
        glyph('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'),
        "Full screen",
      );
      full.setAttribute("aria-pressed", "false");
    }

    frame.appendChild(bar);

    const PLAY = glyph('<path d="M8 5l11 7-11 7Z" fill="currentColor"/>');
    const PAUSE = glyph('<path d="M8 5h3v14H8zM13 5h3v14h-3z" fill="currentColor"/>');

    const paint = () => {
      const running = !media.paused && !media.ended;
      toggle.innerHTML = running ? PAUSE : PLAY;
      // The *action* changes here, so the name changes with it. A wishlist
      // heart is the opposite case: the state changes, so the name stays put
      // and aria-pressed carries it.
      toggle.setAttribute("aria-label", running ? "Pause" : "Play");
      frame.classList.toggle("is-playing", running);
      time.textContent = `${clockTime(media.currentTime)} / ${clockTime(runtimeOf(media))}`;
    };

    const start = () => {
      const attempt = media.play();
      if (attempt && typeof attempt.catch === "function") attempt.catch(paint);
    };

    const onToggle = () => { if (media.paused) start(); else media.pause(); };
    const onBack = () => { media.currentTime = Math.max(0, media.currentTime - jump); };
    const onForward = () => {
      media.currentTime = Math.min(runtimeOf(media) || media.currentTime + jump, media.currentTime + jump);
    };
    const onNative = () => {
      const on = native.getAttribute("aria-pressed") !== "true";
      native.setAttribute("aria-pressed", String(on));
      media.controls = on;
      frame.classList.toggle("is-standby", on);
    };
    const onFull = () => {
      if (document.fullscreenElement === frame) document.exitFullscreen?.();
      else frame.requestFullscreen?.().catch(() => {});
    };
    const onFullChange = () => {
      full?.setAttribute("aria-pressed", String(document.fullscreenElement === frame));
    };

    toggle.addEventListener("click", onToggle);
    back.addEventListener("click", onBack);
    forward.addEventListener("click", onForward);
    native.addEventListener("click", onNative);
    full?.addEventListener("click", onFull);
    document.addEventListener("fullscreenchange", onFullChange);
    media.addEventListener("play", paint);
    media.addEventListener("pause", paint);
    media.addEventListener("timeupdate", paint);
    media.addEventListener("loadedmetadata", paint);
    paint();

    // The bar retreats on a timer, and only ever visually. Focus inside it,
    // a paused video, or a reduced-motion preference all keep it put.
    let timer = 0;
    const wake = () => {
      clearTimeout(timer);
      frame.classList.remove("is-idle");
      if (!rest || prefersReducedMotion()) return;
      timer = setTimeout(() => {
        if (media.paused || bar.contains(document.activeElement)) return;
        frame.classList.add("is-idle");
      }, rest);
    };
    const onLeave = () => {
      clearTimeout(timer);
      if (!rest || prefersReducedMotion() || media.paused) return;
      if (!bar.contains(document.activeElement)) frame.classList.add("is-idle");
    };

    frame.addEventListener("pointermove", wake);
    frame.addEventListener("pointerleave", onLeave);
    frame.addEventListener("focusin", wake);
    frame.addEventListener("focusout", onLeave);
    wake();

    cleanups.push(() => {
      clearTimeout(timer);
      toggle.removeEventListener("click", onToggle);
      back.removeEventListener("click", onBack);
      forward.removeEventListener("click", onForward);
      native.removeEventListener("click", onNative);
      full?.removeEventListener("click", onFull);
      document.removeEventListener("fullscreenchange", onFullChange);
      media.removeEventListener("play", paint);
      media.removeEventListener("pause", paint);
      media.removeEventListener("timeupdate", paint);
      media.removeEventListener("loadedmetadata", paint);
      frame.removeEventListener("pointermove", wake);
      frame.removeEventListener("pointerleave", onLeave);
      frame.removeEventListener("focusin", wake);
      frame.removeEventListener("focusout", onLeave);
      bar.remove();
      media.controls = hadControls;
      frame.classList.remove("rm-player-bar", "is-playing", "is-idle", "is-standby");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A real slider that announces a time, not a percentage.
 *
 * The control is an `<input type="range">` whose unit is seconds, so a single
 * arrow press is a real seek of a known size, Home and End reach both ends, and
 * the browser's own touch target and focus ring come free. `aria-valuetext` is
 * rewritten on every change to "3 minutes 42 seconds of 8 minutes 10 seconds",
 * because the default announcement for a range is a bare number and a bare
 * number is not a place in a film.
 *
 * Two details decide whether this feels broken. The slider is only written to
 * from the media when nobody is dragging it — otherwise `timeupdate` fights the
 * pointer and the thumb snaps backwards mid-drag, which is the single most
 * common bug in a hand-built player. And the buffered stretch is drawn behind
 * the fill as a `scaleX`, updated on the shared frame loop and only while the
 * slider is on screen, so a video playing in a scrolled-away section is not
 * repainting a bar nobody can see.
 *
 *   <div data-rm-scrubber data-rm-for="kiln" data-rm-step="5"></div>
 */
export function scrubber(target = "[data-rm-scrubber]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { step = 5, label = "Seek" } = options;
  const cleanups = [];

  for (const holder of holders) {
    const media = mediaFor(holder);
    if (!media) continue;

    holder.classList.add("rm-scrubber");

    const range = document.createElement("input");
    range.type = "range";
    range.className = "rm-scrubber-range";
    range.min = "0";
    range.max = "0";
    // `step="any"`, deliberately. A range input snaps its value to `min + n *
    // step`, so a five-second grain would quietly store `paint()`'s write of
    // 12.4s as 10: the accent fill, driven by the unsnapped fraction, would
    // glide while the native thumb hopped beside it in five-second jerks, and
    // `aria-valuetext` would announce a time the player is not at. The grain
    // was only ever meant to size an arrow press, so that is all it now does.
    range.step = "any";
    const grain = Math.max(0.1, dataNumber(holder, "rmStep", step));
    range.value = "0";
    range.setAttribute("aria-label", dataString(holder, "rmLabel", label));

    const rail = document.createElement("span");
    rail.className = "rm-scrubber-rail";
    rail.setAttribute("aria-hidden", "true");
    rail.innerHTML = '<i class="rm-scrubber-buffered"></i><i class="rm-scrubber-played"></i>';

    const peek = document.createElement("output");
    peek.className = "rm-scrubber-peek";
    // The slider already says the time; this is the pointer's copy of it.
    peek.setAttribute("aria-hidden", "true");
    peek.hidden = true;

    holder.append(rail, range, peek);

    let dragging = false;

    const describe = (at, total) => {
      range.setAttribute(
        "aria-valuetext",
        total ? `${spokenTime(at)} of ${spokenTime(total)}` : spokenTime(at),
      );
    };

    const paint = () => {
      const total = runtimeOf(media);
      if (total && range.max !== String(total)) range.max = String(total);
      range.disabled = !total;
      const at = dragging ? Number(range.value) : media.currentTime;
      if (!dragging) range.value = String(at);
      holder.style.setProperty("--rm-scrubber-at", total ? clamp(at / total, 0, 1).toFixed(4) : "0");
      holder.style.setProperty("--rm-scrubber-buffered", bufferedAhead(media).toFixed(4));
      describe(at, total);
    };

    const onInput = () => {
      dragging = true;
      const total = runtimeOf(media);
      const at = Number(range.value);
      holder.style.setProperty("--rm-scrubber-at", total ? clamp(at / total, 0, 1).toFixed(4) : "0");
      describe(at, total);
    };
    const onCommit = () => {
      media.currentTime = Number(range.value);
      dragging = false;
    };

    const place = (clientX) => {
      const box = holder.getBoundingClientRect();
      const share = clamp((clientX - box.left) / (box.width || 1), 0, 1);
      peek.textContent = clockTime(share * runtimeOf(media));
      holder.style.setProperty("--rm-scrubber-peek", share.toFixed(4));
    };
    const onHover = (event) => {
      if (!runtimeOf(media)) return;
      peek.hidden = false;
      place(event.clientX);
    };
    const onAway = () => { if (document.activeElement !== range) peek.hidden = true; };
    const onFocus = () => {
      const total = runtimeOf(media);
      if (!total) return;
      // The same preview the pointer gets, so a keyboard seek shows where it
      // has landed rather than only saying it.
      peek.hidden = false;
      peek.textContent = clockTime(Number(range.value));
      holder.style.setProperty("--rm-scrubber-peek", clamp(Number(range.value) / total, 0, 1).toFixed(4));
    };

    const onKey = (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const way = event.key === "ArrowLeft" || event.key === "ArrowDown" ? -1
        : event.key === "ArrowRight" || event.key === "ArrowUp" ? 1 : 0;
      if (!way) return;
      // With `step="any"` the browser's own arrow press moves by a hundredth of
      // the runtime, which on a long film is a fraction of a second. So the
      // coarse seek is taken over here; Home, End, Page Up and Page Down are
      // left alone, because the browser already gets those right.
      event.preventDefault();
      const total = runtimeOf(media);
      const at = clamp(Number(range.value) + way * grain, 0, total || Number(range.value));
      range.value = String(at);
      media.currentTime = at;
      onFocus();
      paint();
    };

    range.addEventListener("keydown", onKey);
    range.addEventListener("input", onInput);
    range.addEventListener("change", onCommit);
    range.addEventListener("pointerup", onCommit);
    range.addEventListener("keyup", onCommit);
    range.addEventListener("focus", onFocus);
    range.addEventListener("blur", onAway);
    holder.addEventListener("pointermove", onHover);
    holder.addEventListener("pointerleave", onAway);
    media.addEventListener("loadedmetadata", paint);
    paint();

    cleanups.push(whileVisible(holder, () => onFrame(paint)));
    cleanups.push(() => {
      range.removeEventListener("keydown", onKey);
      range.removeEventListener("input", onInput);
      range.removeEventListener("change", onCommit);
      range.removeEventListener("pointerup", onCommit);
      range.removeEventListener("keyup", onCommit);
      range.removeEventListener("focus", onFocus);
      range.removeEventListener("blur", onAway);
      holder.removeEventListener("pointermove", onHover);
      holder.removeEventListener("pointerleave", onAway);
      media.removeEventListener("loadedmetadata", paint);
      rail.remove();
      range.remove();
      peek.remove();
      holder.style.removeProperty("--rm-scrubber-at");
      holder.style.removeProperty("--rm-scrubber-buffered");
      holder.style.removeProperty("--rm-scrubber-peek");
      holder.classList.remove("rm-scrubber");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * Peaks from the markup, so the waveform costs nothing to draw.
 *
 * The usual build fetches the whole audio file a second time, decodes it with
 * the Web Audio API on the main thread and then draws it — which downloads
 * megabytes nobody asked for, blocks the thread for as long as the decode
 * takes, and cannot start until the file has finished arriving. The peaks are
 * cheap to produce once, at build time, and they are a hundred numbers. So they
 * live in the markup, and this component only draws.
 *
 * Each bar is a full-height element scaled with `scaleY` from its own base, so
 * a hundred bars are a hundred transforms and not a hundred height changes, and
 * the progress overlay is a second copy clipped with `clip-path`. It is
 * `role="img"` with a written label rather than a live region: a waveform that
 * announced itself four times a second would make the track unlistenable for
 * the people it was supposed to help.
 *
 *   <div data-rm-waveform data-rm-for="talk" data-rm-peaks="8,22,64,…"></div>
 */
export function waveform(target = "[data-rm-waveform]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { peaks = "", amp = 1, label = "Audio waveform" } = options;
  const cleanups = [];

  for (const holder of holders) {
    const media = mediaFor(holder);
    const raw = dataString(holder, "rmPeaks", peaks);
    const values = raw
      .split(/[\s,]+/)
      .map((n) => Number(n))
      .filter((n) => Number.isFinite(n));
    // No usable peaks is not a reason to draw nothing — a flat rail still reads
    // as a track, and it is honest about carrying no detail.
    const heights = values.length ? values : new Array(48).fill(22);
    const loudest = Math.max(...heights, 1);
    const lift = clamp(dataNumber(holder, "rmAmp", amp), 0.2, 2);

    holder.classList.add("rm-waveform");
    // A page may well have shipped its own `role="img"` and a label naming this
    // particular recording; both are better than anything invented here, and
    // both have to come back untouched, so they are kept before being written.
    const hadRole = holder.getAttribute("role");
    const hadLabel = holder.getAttribute("aria-label");
    holder.setAttribute("role", "img");
    holder.setAttribute("aria-label", dataString(holder, "rmLabel", hadLabel ?? label));

    const build = (className) => {
      const row = document.createElement("span");
      row.className = className;
      for (const value of heights) {
        const bar = document.createElement("i");
        bar.style.setProperty(
          "--rm-waveform-peak",
          clamp((Math.abs(value) / loudest) * lift, 0.04, 1).toFixed(3),
        );
        row.appendChild(bar);
      }
      return row;
    };

    const base = build("rm-waveform-row is-base");
    const played = build("rm-waveform-row is-played");
    holder.append(base, played);

    const paint = () => {
      const total = runtimeOf(media);
      holder.style.setProperty(
        "--rm-waveform-at",
        total ? clamp(media.currentTime / total, 0, 1).toFixed(4) : "0",
      );
    };
    paint();

    if (media) cleanups.push(whileVisible(holder, () => onFrame(paint)));

    cleanups.push(() => {
      base.remove();
      played.remove();
      holder.style.removeProperty("--rm-waveform-at");
      if (hadRole === null) holder.removeAttribute("role");
      else holder.setAttribute("role", hadRole);
      if (hadLabel === null) holder.removeAttribute("aria-label");
      else holder.setAttribute("aria-label", hadLabel);
      holder.classList.remove("rm-waveform");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * Real buttons that seek, with the current chapter marked.
 *
 * Every row becomes a `<button type="button">` wrapped around the text that was
 * already there, so the list is a readable table of contents with no script and
 * an operable one with it. The current chapter carries `aria-current="true"`,
 * which is what tells somebody where they are — a background colour alone tells
 * nobody.
 *
 * The moving marker is one absolutely positioned element that translates and
 * scales into place. Scaling a one-pixel bar to the row's height is a transform,
 * where the obvious version animates `height` and relayouts the list on every
 * frame; and one marker means the rows themselves never change, so nothing in
 * the list shifts as playback crosses a boundary.
 *
 *   <ol data-rm-chapter-list data-rm-for="kiln">
 *     <li data-rm-at="0">Digging the clay</li>
 *     <li data-rm-at="96">Wedging</li>
 *   </ol>
 */
export function chapterList(target = "[data-rm-chapter-list]", options = {}) {
  const lists = resolveElements(target);
  if (!lists.length) return () => {};

  const { label = "Chapters" } = options;
  const cleanups = [];

  for (const list of lists) {
    const media = mediaFor(list);
    const rows = [...list.children].filter((row) => row.dataset.rmAt !== undefined);
    if (!media || !rows.length) continue;

    list.classList.add("rm-chapter-list");
    const hadLabel = list.getAttribute("aria-label");
    list.setAttribute("aria-label", dataString(list, "rmLabel", hadLabel ?? label));

    const marker = document.createElement("i");
    marker.className = "rm-chapter-list-marker";
    marker.setAttribute("aria-hidden", "true");
    marker.hidden = true;
    list.appendChild(marker);

    const chapters = rows.map((row) => {
      const at = dataNumber(row, "rmAt", 0);
      row.classList.add("rm-chapter-list-row");
      const wrapped = buttonise(row, "rm-chapter-list-seek");
      const stamp = document.createElement("span");
      stamp.className = "rm-chapter-list-time";
      stamp.textContent = clockTime(at);
      wrapped.button.appendChild(stamp);
      // The spoken start time goes *inside* the button rather than into an
      // `aria-label`. A label would flatten the chapter title into one string
      // and lose whatever emphasis, abbreviation or `lang` the author wrote it
      // with; a hidden span joins the computed name instead. "1:36" itself is
      // left to the eye, since the words beside it say the same thing better.
      stamp.setAttribute("aria-hidden", "true");
      const said = document.createElement("span");
      said.className = "rm-player-said";
      said.textContent = `, starts at ${spokenTime(at)}`;
      wrapped.button.appendChild(said);
      const go = () => { media.currentTime = at; };
      wrapped.button.addEventListener("click", go);
      return { row, at, ...wrapped, stamp, said, go };
    }).sort((a, b) => a.at - b.at);

    let current = -1;
    const place = (index) => {
      const chapter = chapters[index];
      if (!chapter) { marker.hidden = true; return; }
      const box = chapter.row.getBoundingClientRect();
      const host = list.getBoundingClientRect();
      marker.hidden = false;
      // translate to the row, then scale a one-pixel bar to its height.
      marker.style.transform =
        `translateY(${(box.top - host.top) + list.scrollTop}px) scaleY(${Math.max(1, box.height)})`;
    };

    const paint = () => {
      const at = media.currentTime;
      let found = -1;
      for (let i = 0; i < chapters.length; i++) if (chapters[i].at <= at + 0.01) found = i;
      if (found === current) return;
      if (current >= 0) {
        chapters[current].button.removeAttribute("aria-current");
        chapters[current].row.classList.remove("is-current");
      }
      current = found;
      if (current >= 0) {
        chapters[current].button.setAttribute("aria-current", "true");
        chapters[current].row.classList.add("is-current");
      }
      place(current);
    };

    media.addEventListener("timeupdate", paint);
    media.addEventListener("loadedmetadata", paint);
    paint();

    cleanups.push(() => {
      media.removeEventListener("timeupdate", paint);
      media.removeEventListener("loadedmetadata", paint);
      for (const chapter of chapters) {
        chapter.button.removeEventListener("click", chapter.go);
        chapter.stamp.remove();
        chapter.said.remove();
        chapter.undo();
        chapter.row.classList.remove("rm-chapter-list-row", "is-current");
        // No `row.removeAttribute("aria-current")`: this component only ever
        // set it on the button, and the button has just gone with `undo()`.
        // Clearing it here would strip an author's own from the list item.
      }
      marker.remove();
      if (hadLabel === null) list.removeAttribute("aria-label");
      else list.setAttribute("aria-label", hadLabel);
      list.classList.remove("rm-chapter-list");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * The one control the whole category gets wrong.
 *
 * Captions are a *state*, not an action, so the button keeps one name —
 * "Captions" — and carries `aria-pressed`. The common version flips the label
 * between "Show captions" and "Hide captions", which means the control renames
 * itself the instant you use it: voice control users lose the phrase they just
 * said, and anybody re-reading the button hears a different control.
 *
 * It drives `textTrack.mode` on the real `<track>` rather than painting its own
 * subtitles, so the browser's caption styling, the operating system's caption
 * preferences and the user's chosen size all keep working. If the media has no
 * caption track the button is `hidden` outright — a toggle that cannot do
 * anything is worse than no toggle — and the stylesheet has the matching
 * `[hidden]` rule, because a class with a `display` beats the user agent's.
 *
 *   <button data-rm-caption-toggle data-rm-for="kiln" data-rm-track="en"></button>
 */
export function captionToggle(target = "[data-rm-caption-toggle]", options = {}) {
  const buttons = resolveElements(target);
  if (!buttons.length) return () => {};

  const { label = "Captions", track = "" } = options;
  const cleanups = [];

  for (const button of buttons) {
    const media = mediaFor(button);
    if (!media) continue;

    button.classList.add("rm-caption-toggle");
    if (button.tagName === "BUTTON") button.type = "button";
    const name = dataString(button, "rmLabel", label);
    const wanted = dataString(button, "rmTrack", track).toLowerCase();

    const tracks = [...(media.textTracks || [])]
      .filter((t) => t.kind === "subtitles" || t.kind === "captions");
    // An unrecognised language falls back to the first caption track rather
    // than to nothing at all.
    const chosen = tracks.find(
      (t) => wanted && (t.language?.toLowerCase() === wanted || t.label?.toLowerCase() === wanted),
    ) || tracks[0] || null;

    if (!chosen) {
      button.hidden = true;
      cleanups.push(() => {
        button.hidden = false;
        button.classList.remove("rm-caption-toggle");
      });
      continue;
    }

    const wasMode = chosen.mode;
    const others = tracks.filter((t) => t !== chosen).map((t) => [t, t.mode]);

    // A word written into an author's empty button is a word this component
    // owns, so it is kept and taken away again: otherwise an unmounted
    // `<button data-rm-caption-toggle>` is left reading "Captions" for good.
    const added = button.textContent.trim() ? null : document.createTextNode(name);
    if (added) button.append(added);
    button.setAttribute("aria-label", `${name}, ${chosen.label || chosen.language || "subtitles"}`);

    const paint = () => {
      button.setAttribute("aria-pressed", String(chosen.mode === "showing"));
      button.classList.toggle("is-on", chosen.mode === "showing");
    };
    const onClick = () => {
      chosen.mode = chosen.mode === "showing" ? "disabled" : "showing";
      // Two visible caption tracks stack on top of each other, so the rest go
      // quiet whenever this one comes on.
      if (chosen.mode === "showing") for (const [other] of others) other.mode = "disabled";
      paint();
    };

    button.addEventListener("click", onClick);
    media.textTracks?.addEventListener?.("change", paint);
    paint();

    cleanups.push(() => {
      button.removeEventListener("click", onClick);
      media.textTracks?.removeEventListener?.("change", paint);
      chosen.mode = wasMode;
      for (const [other, mode] of others) other.mode = mode;
      added?.remove();
      button.removeAttribute("aria-pressed");
      button.removeAttribute("aria-label");
      button.classList.remove("rm-caption-toggle", "is-on");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Playback speed as a real menu with real focus management.
 *
 * The list is `role="menu"` of `role="menuitemradio"` buttons with one roving
 * tabindex, so Tab enters and leaves the menu once rather than walking through
 * six speeds, and the arrow keys move between them the way every desktop menu
 * has behaved for thirty years. Escape closes it and puts focus back on the
 * button that opened it — not on the body, which is where a closing menu
 * usually drops it, leaving the next Tab starting again from the top of the
 * page.
 *
 * The panel is `hidden` when closed, and because `.rm-rate-menu-list` sets a
 * `display`, the stylesheet carries the explicit `[hidden]` rule. Without it
 * the menu is invisible, still laid out and still takes clicks.
 *
 *   <div data-rm-rate-menu data-rm-for="talk" data-rm-rates="0.75,1,1.25,1.5,2"></div>
 */
export function rateMenu(target = "[data-rm-rate-menu]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { rates = "0.5,0.75,1,1.25,1.5,2", label = "Playback speed" } = options;
  const cleanups = [];

  for (const holder of holders) {
    const media = mediaFor(holder);
    if (!media) continue;

    const speeds = dataString(holder, "rmRates", rates)
      .split(/[\s,]+/)
      .map(Number)
      .filter((n) => Number.isFinite(n) && n > 0);
    const list = speeds.length ? speeds : [1];
    const name = dataString(holder, "rmLabel", label);

    holder.classList.add("rm-rate-menu");

    const button = document.createElement("button");
    button.type = "button";
    button.className = "rm-rate-menu-button";
    button.setAttribute("aria-haspopup", "true");
    button.setAttribute("aria-expanded", "false");

    const panel = document.createElement("ul");
    panel.className = "rm-rate-menu-list";
    panel.id = uid("rm-rate-menu");
    panel.setAttribute("role", "menu");
    panel.setAttribute("aria-label", name);
    panel.hidden = true;
    button.setAttribute("aria-controls", panel.id);

    const items = list.map((speed) => {
      const slot = document.createElement("li");
      slot.setAttribute("role", "none");
      const item = document.createElement("button");
      item.type = "button";
      item.className = "rm-rate-menu-item";
      item.setAttribute("role", "menuitemradio");
      item.setAttribute("aria-checked", "false");
      item.tabIndex = -1;
      item.textContent = `${speed}×`;
      item.setAttribute("aria-label", `${speed} times normal speed`);
      slot.appendChild(item);
      panel.appendChild(slot);
      return { item, speed };
    });

    holder.append(button, panel);

    const paintButton = () => {
      const now = media.playbackRate;
      button.textContent = `${now}×`;
      button.setAttribute("aria-label", `${name}, currently ${now} times normal`);
      for (const { item, speed } of items) {
        const on = Math.abs(speed - now) < 0.001;
        item.setAttribute("aria-checked", String(on));
        item.classList.toggle("is-on", on);
      }
    };

    let rove = 0;
    const focusItem = (index) => {
      rove = (index + items.length) % items.length;
      items.forEach(({ item }, i) => { item.tabIndex = i === rove ? 0 : -1; });
      items[rove].item.focus();
    };

    const open = () => {
      if (!panel.hidden) return;
      panel.hidden = false;
      button.setAttribute("aria-expanded", "true");
      const checked = items.findIndex(({ item }) => item.getAttribute("aria-checked") === "true");
      focusItem(checked < 0 ? 0 : checked);
      if (!prefersReducedMotion()) {
        panel.animate(
          [{ opacity: 0, transform: "translateY(6px) scale(0.98)" }, { opacity: 1, transform: "none" }],
          { duration: 200, easing: EASE.out },
        );
      }
    };
    const close = (restore = true) => {
      if (panel.hidden) return;
      panel.hidden = true;
      button.setAttribute("aria-expanded", "false");
      if (restore) button.focus();
    };

    const onButton = () => { if (panel.hidden) open(); else close(); };
    const onPick = (event) => {
      const hit = items.find(({ item }) => item === event.target);
      if (!hit) return;
      media.playbackRate = hit.speed;
      paintButton();
      close();
    };
    const onKey = (event) => {
      if (panel.hidden) return;
      if (event.key === "Escape") { event.preventDefault(); close(); return; }
      if (event.key === "ArrowDown") { event.preventDefault(); focusItem(rove + 1); }
      else if (event.key === "ArrowUp") { event.preventDefault(); focusItem(rove - 1); }
      else if (event.key === "Home") { event.preventDefault(); focusItem(0); }
      else if (event.key === "End") { event.preventDefault(); focusItem(items.length - 1); }
    };
    const onOutside = (event) => {
      if (panel.hidden || holder.contains(event.target)) return;
      close(false);
    };

    button.addEventListener("click", onButton);
    panel.addEventListener("click", onPick);
    holder.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onOutside);
    media.addEventListener("ratechange", paintButton);
    paintButton();

    cleanups.push(() => {
      button.removeEventListener("click", onButton);
      panel.removeEventListener("click", onPick);
      holder.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onOutside);
      media.removeEventListener("ratechange", paintButton);
      button.remove();
      panel.remove();
      holder.classList.remove("rm-rate-menu");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A ring you can read and a slider you can actually use.
 *
 * The dial is the drawing; the control is an `<input type="range">`. A volume
 * knob built as a div you drag in a circle is unusable from a keyboard, has no
 * value to announce and cannot be reached by voice — so here the ring is
 * `aria-hidden` decoration driven by one custom property, and the real control
 * underneath it is the browser's own slider with an `aria-valuetext` of
 * "Volume 40 percent".
 *
 * Muting is a separate button with `aria-pressed`, not a volume of zero,
 * because those are genuinely different states: unmuting has to return to the
 * level you had, and a slider dragged to zero has forgotten it. Cleanup puts
 * both the volume and the muted flag back exactly as it found them.
 *
 *   <div data-rm-volume-dial data-rm-for="talk" data-rm-volume="70"></div>
 */
export function volumeDial(target = "[data-rm-volume-dial]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { volume = 100, label = "Volume" } = options;
  const cleanups = [];

  for (const holder of holders) {
    const media = mediaFor(holder);
    if (!media) continue;

    holder.classList.add("rm-volume-dial");
    const name = dataString(holder, "rmLabel", label);
    const wasVolume = media.volume;
    const wasMuted = media.muted;

    const ring = document.createElement("span");
    ring.className = "rm-volume-dial-ring";
    ring.setAttribute("aria-hidden", "true");

    const mute = document.createElement("button");
    mute.type = "button";
    mute.className = "rm-volume-dial-mute";
    mute.setAttribute("aria-pressed", "false");
    mute.setAttribute("aria-label", "Mute");
    mute.innerHTML = '<span aria-hidden="true">🔊</span>';

    const range = document.createElement("input");
    range.type = "range";
    range.className = "rm-volume-dial-range";
    range.min = "0";
    range.max = "100";
    range.step = "5";
    range.setAttribute("aria-label", name);

    holder.append(ring, mute, range);

    media.volume = clamp(dataNumber(holder, "rmVolume", volume), 0, 100) / 100;

    const paint = () => {
      const level = Math.round(media.volume * 100);
      range.value = String(level);
      range.setAttribute(
        "aria-valuetext",
        media.muted ? "Muted" : `${name} ${level} percent`,
      );
      holder.style.setProperty("--rm-volume-dial-at", media.muted ? "0" : (level / 100).toFixed(3));
      mute.setAttribute("aria-pressed", String(media.muted));
      mute.setAttribute("aria-label", media.muted ? "Unmute" : "Mute");
      mute.innerHTML = `<span aria-hidden="true">${media.muted ? "🔇" : "🔊"}</span>`;
      holder.classList.toggle("is-muted", media.muted);
    };

    const onInput = () => {
      media.volume = clamp(Number(range.value), 0, 100) / 100;
      // Moving the slider is a statement that you want to hear something.
      if (media.muted && media.volume > 0) media.muted = false;
      paint();
    };
    const onMute = () => { media.muted = !media.muted; paint(); };

    range.addEventListener("input", onInput);
    mute.addEventListener("click", onMute);
    media.addEventListener("volumechange", paint);
    paint();

    cleanups.push(() => {
      range.removeEventListener("input", onInput);
      mute.removeEventListener("click", onMute);
      media.removeEventListener("volumechange", paint);
      ring.remove();
      mute.remove();
      range.remove();
      media.volume = wasVolume;
      media.muted = wasMuted;
      holder.style.removeProperty("--rm-volume-dial-at");
      holder.classList.remove("rm-volume-dial", "is-muted");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Picture-in-picture, feature-detected and honest about it.
 *
 * Three things have to be true before this button means anything: the document
 * allows picture-in-picture, the element is a `<video>`, and that video has not
 * opted out with `disablePictureInPicture`. When any of them is false the button
 * is `hidden` rather than disabled — a disabled control is still announced, and
 * a control announced as permanently unavailable is noise. The stylesheet
 * carries the `[hidden]` rule to match the class's own `display`.
 *
 * State comes from the `enterpictureinpicture` and `leavepictureinpicture`
 * events, never from what the button thinks it did, because the window can be
 * closed from the operating system's own chrome and a button tracking its own
 * clicks is immediately lying. The request is a promise that a browser is
 * entitled to reject, so the rejection is caught and said out loud rather than
 * landing in the console.
 *
 *   <button data-rm-pip-toggle data-rm-for="kiln"></button>
 */
export function pipToggle(target = "[data-rm-pip-toggle]", options = {}) {
  const buttons = resolveElements(target);
  if (!buttons.length) return () => {};

  const { label = "Picture in picture" } = options;
  const cleanups = [];

  for (const button of buttons) {
    const media = mediaFor(button);
    const usable = media instanceof HTMLVideoElement
      && document.pictureInPictureEnabled === true
      && typeof media.requestPictureInPicture === "function"
      && !media.disablePictureInPicture;

    button.classList.add("rm-pip-toggle");
    if (button.tagName === "BUTTON") button.type = "button";
    // The markup's own text wins, and `data-rm-label` overrides it rather than
    // supplying it. A button announced as something other than the word printed
    // on it costs voice control the phrase on screen, and a page that ships the
    // label reads correctly whether this script ever runs or not.
    const shipped = button.textContent.trim();
    const name = dataString(button, "rmLabel", shipped || label);

    if (!usable) {
      button.hidden = true;
      cleanups.push(() => {
        button.hidden = false;
        button.classList.remove("rm-pip-toggle");
      });
      continue;
    }

    // Only written when the markup left the button empty, and removed again on
    // cleanup — a node this component added is a node it has to take back.
    const added = shipped ? null : document.createTextNode(name);
    if (added) button.append(added);
    button.setAttribute("aria-label", name);
    button.setAttribute("aria-pressed", "false");
    const live = announcer(button.parentElement || button, "polite");

    const paint = () => {
      const on = document.pictureInPictureElement === media;
      button.setAttribute("aria-pressed", String(on));
      button.classList.toggle("is-on", on);
    };

    const onClick = () => {
      if (document.pictureInPictureElement === media) {
        document.exitPictureInPicture?.().catch(() => {});
        return;
      }
      media.requestPictureInPicture().catch(() => {
        live.textContent = "This browser would not open the floating window.";
      });
    };

    button.addEventListener("click", onClick);
    media.addEventListener("enterpictureinpicture", paint);
    media.addEventListener("leavepictureinpicture", paint);
    paint();

    cleanups.push(() => {
      button.removeEventListener("click", onClick);
      media.removeEventListener("enterpictureinpicture", paint);
      media.removeEventListener("leavepictureinpicture", paint);
      if (document.pictureInPictureElement === media) document.exitPictureInPicture?.().catch(() => {});
      live.remove();
      added?.remove();
      button.removeAttribute("aria-pressed");
      button.removeAttribute("aria-label");
      button.classList.remove("rm-pip-toggle", "is-on");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A play queue reorderable by pointer and by keyboard.
 *
 * Drag and drop that only works with a pointer is a feature half the audience
 * does not have, so the handle is a real button and the arrow keys move the row
 * immediately while it is focused — no grab mode to remember, no modifier to
 * discover. Each move is announced as "Moved Kiln opening to 2 of 5", because
 * the only feedback a pointer drag gives is visual and a keyboard reorder with
 * no announcement is a list that silently rearranges itself.
 *
 * The rows that shift do so with a FLIP: the DOM order changes first, then each
 * displaced row is animated from where it used to be back to zero with a single
 * transform. Nothing animates a height, nothing is absolutely positioned, and
 * the list is a real `<ol>` the entire time. Focus follows the handle across
 * the move, which is the part everyone forgets — after a DOM move the node
 * still exists but the browser has dropped focus to the body.
 *
 *   <ol data-rm-queue-list>
 *     <li>Kiln opening</li>
 *     <li>Wedging the clay</li>
 *   </ol>
 */
export function queueList(target = "[data-rm-queue-list]", options = {}) {
  const lists = resolveElements(target);
  if (!lists.length) return () => {};

  const { label = "Play queue", duration = 260 } = options;
  const cleanups = [];

  for (const list of lists) {
    const rows = [...list.children];
    if (rows.length < 2) continue;

    list.classList.add("rm-queue-list");
    list.setAttribute("aria-label", dataString(list, "rmLabel", label));
    const order = [...rows];
    const live = announcer(list, "polite");
    const span = Math.max(80, dataNumber(list, "rmDuration", duration));

    const hint = document.createElement("p");
    hint.className = "rm-player-said";
    hint.id = uid("rm-queue-hint");
    hint.textContent = "Press the up or down arrow key to move this item.";
    live.insertAdjacentElement("beforebegin", hint);

    const nameOf = (row) => row.textContent.trim().slice(0, 80) || "item";

    const announce = (row) => {
      const at = [...list.children].indexOf(row);
      live.textContent = `Moved ${nameOf(row)} to ${at + 1} of ${list.children.length}`;
    };

    /** Measure, move, invert, play — for every row that actually shifted. */
    const flip = (boxes) => {
      if (prefersReducedMotion()) return;
      for (const [row, was] of boxes) {
        const now = row.getBoundingClientRect();
        const dy = was.top - now.top;
        if (!dy) continue;
        row.animate(
          [{ transform: `translateY(${dy}px)` }, { transform: "none" }],
          { duration: span, easing: EASE.out },
        );
      }
    };

    const move = (row, step) => {
      const siblings = [...list.children].filter((node) => node.tagName === row.tagName);
      const at = siblings.indexOf(row);
      const to = at + step;
      if (at < 0 || to < 0 || to >= siblings.length) return false;
      const boxes = siblings.map((node) => [node, node.getBoundingClientRect()]);
      if (step < 0) list.insertBefore(row, siblings[to]);
      else list.insertBefore(row, siblings[to].nextSibling);
      flip(boxes);
      announce(row);
      return true;
    };

    const handles = rows.map((row) => {
      row.classList.add("rm-queue-list-row");
      const handle = document.createElement("button");
      handle.type = "button";
      handle.className = "rm-queue-list-handle";
      handle.setAttribute("aria-label", `Reorder ${nameOf(row)}`);
      handle.setAttribute("aria-describedby", hint.id);
      handle.innerHTML =
        '<span aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false">'
        + '<path d="M9 7h1M9 12h1M9 17h1M14 7h1M14 12h1M14 17h1" stroke="currentColor" '
        + 'stroke-width="2.4" stroke-linecap="round"/></svg></span>';
      row.prepend(handle);

      const onKey = (event) => {
        const step = event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0;
        if (!step) return;
        event.preventDefault();
        // The node survives the move, but focus does not: put it back.
        if (move(row, step)) handle.focus();
      };

      let from = 0;
      let shift = 0;
      let holding = false;
      const onDown = (event) => {
        if (event.button > 0) return;
        holding = true;
        from = event.clientY;
        shift = 0;
        row.classList.add("is-dragging");
        handle.setPointerCapture?.(event.pointerId);
      };
      const onMove = (event) => {
        if (!holding) return;
        shift = event.clientY - from;
        row.style.transform = `translateY(${shift}px)`;
        const box = row.getBoundingClientRect();
        const middle = box.top + box.height / 2;
        const next = shift > 0 ? row.nextElementSibling : row.previousElementSibling;
        if (!next || next.tagName !== row.tagName) return;
        const other = next.getBoundingClientRect();
        const crossed = shift > 0 ? middle > other.top + other.height / 2
          : middle < other.top + other.height / 2;
        if (!crossed) return;
        row.style.transform = "";
        if (move(row, shift > 0 ? 1 : -1)) {
          from = event.clientY;
          shift = 0;
        }
      };
      const onUp = (event) => {
        if (!holding) return;
        holding = false;
        handle.releasePointerCapture?.(event.pointerId);
        row.classList.remove("is-dragging");
        row.style.transform = "";
      };

      handle.addEventListener("keydown", onKey);
      handle.addEventListener("pointerdown", onDown);
      handle.addEventListener("pointermove", onMove);
      handle.addEventListener("pointerup", onUp);
      handle.addEventListener("pointercancel", onUp);

      return { row, handle, onKey, onDown, onMove, onUp };
    });

    cleanups.push(() => {
      for (const entry of handles) {
        entry.handle.removeEventListener("keydown", entry.onKey);
        entry.handle.removeEventListener("pointerdown", entry.onDown);
        entry.handle.removeEventListener("pointermove", entry.onMove);
        entry.handle.removeEventListener("pointerup", entry.onUp);
        entry.handle.removeEventListener("pointercancel", entry.onUp);
        entry.handle.remove();
        entry.row.style.transform = "";
        entry.row.classList.remove("rm-queue-list-row", "is-dragging");
      }
      // Every reorder was this component's doing, so unmounting undoes them.
      for (const row of order) list.appendChild(row);
      hint.remove();
      live.remove();
      list.removeAttribute("aria-label");
      list.classList.remove("rm-queue-list");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Title and artist, scrolling only when they overflow.
 *
 * A marquee that runs on every track is a decoration; one that runs only when
 * the text genuinely does not fit is a solution. A `ResizeObserver` compares
 * the title's own width against its box and adds the scrolling class only when
 * it must, so a short title sits perfectly still — and a real pause button
 * appears beside it whenever it does drift. Hover is nothing to a keyboard and
 * `:focus-within` never matches a cover, a heading and a line of text, so a
 * marquee whose only stop is a CSS pseudo-class is a movement half the audience
 * cannot turn off; the reduced-motion preference covers the people who set it
 * and nobody else.
 *
 * The travel is a `translateX` of a measured distance, never an animated
 * `margin` or `left`. The track change is announced once, politely, as a whole
 * sentence — "Now playing: Wedging the clay, by Marta Ruiz" — rather than by
 * putting a live region around a title that then re-announces on every resize.
 *
 *   <div data-rm-now-playing>
 *     <img src="/covers/kiln.jpg" alt="Cover art: a kiln at dusk">
 *     <h3>Wedging the clay</h3>
 *     <p>Marta Ruiz</p>
 *   </div>
 */
export function nowPlaying(target = "[data-rm-now-playing]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { speed = 40, label = "Now playing" } = options;
  const cleanups = [];

  for (const holder of holders) {
    holder.classList.add("rm-now-playing");
    // Kept before they are written, because a card that shipped its own role
    // and label must get them back exactly, not have them deleted.
    const hadRole = holder.getAttribute("role");
    const hadLabel = holder.getAttribute("aria-label");
    holder.setAttribute("role", "group");
    holder.setAttribute("aria-label", dataString(holder, "rmLabel", hadLabel ?? label));

    const art = holder.querySelector("img");
    const titleEl = holder.querySelector("h1, h2, h3, h4, h5, h6") || holder.querySelector("strong");
    const artistEl = holder.querySelector("p, span");
    const pace = Math.max(8, dataNumber(holder, "rmSpeed", speed));

    art?.classList.add("rm-now-playing-art");
    artistEl?.classList.add("rm-now-playing-artist");

    let scroller = null;
    if (titleEl) {
      titleEl.classList.add("rm-now-playing-title");
      scroller = document.createElement("span");
      scroller.className = "rm-now-playing-scroll";
      scroller.append(...titleEl.childNodes);
      titleEl.appendChild(scroller);
    }

    const live = announcer(holder, "polite");

    // The stop for the drift. It has to be a real control: the movement runs
    // for well over five seconds and repeats for as long as the track plays,
    // and neither `:hover` nor `:focus-within` can be reached from a keyboard
    // here because nothing else in the card takes focus. It appears only when
    // the title genuinely overflows — a pause for a movement that is not
    // happening is a control that lies about what the card is doing.
    const rest = document.createElement("button");
    rest.type = "button";
    rest.className = "rm-now-playing-pause";
    rest.setAttribute("aria-pressed", "false");
    rest.setAttribute("aria-label", "Pause the scrolling title");
    rest.innerHTML = '<span aria-hidden="true">❚❚</span>';
    rest.hidden = true;
    holder.appendChild(rest);

    let held = false;

    const measure = () => {
      if (!titleEl || !scroller) { rest.hidden = true; return; }
      const over = scroller.scrollWidth - titleEl.clientWidth;
      const runs = over > 2 && !prefersReducedMotion();
      titleEl.classList.toggle("is-scrolling", runs && !held);
      rest.hidden = !runs;
      titleEl.style.setProperty("--rm-now-playing-shift", `${-Math.max(0, over) - 12}px`);
      titleEl.style.setProperty("--rm-now-playing-span", `${((over + 12) / pace).toFixed(2)}s`);
    };

    // Pausing is a state, not an action, so the name stays put and
    // `aria-pressed` carries it — the same shape as the transcript's follow
    // toggle. Flipping the label to "Resume" would rename the control the
    // instant it is used, which costs voice control the phrase on screen; the
    // pressed look is a colour change in the stylesheet, and the glyph is
    // decoration either way.
    const onRest = () => {
      held = !held;
      rest.setAttribute("aria-pressed", String(held));
      measure();
    };
    rest.addEventListener("click", onRest);

    let watcher = null;
    if (typeof ResizeObserver === "function") {
      watcher = new ResizeObserver(measure);
      watcher.observe(holder);
      if (titleEl) watcher.observe(titleEl);
    }
    measure();

    holder.rmSet = ({ title, artist, src, alt } = {}) => {
      if (title !== undefined && scroller) scroller.textContent = title;
      if (artist !== undefined && artistEl) artistEl.textContent = artist;
      if (src !== undefined && art) art.src = src;
      if (alt !== undefined && art) art.alt = alt;
      measure();
      const now = scroller?.textContent.trim() ?? "";
      const by = artistEl?.textContent.trim() ?? "";
      live.textContent = by ? `Now playing: ${now}, by ${by}` : `Now playing: ${now}`;
    };

    cleanups.push(() => {
      watcher?.disconnect();
      rest.removeEventListener("click", onRest);
      rest.remove();
      delete holder.rmSet;
      if (titleEl && scroller) {
        titleEl.append(...scroller.childNodes);
        scroller.remove();
        titleEl.classList.remove("rm-now-playing-title", "is-scrolling");
        titleEl.style.removeProperty("--rm-now-playing-shift");
        titleEl.style.removeProperty("--rm-now-playing-span");
      }
      art?.classList.remove("rm-now-playing-art");
      artistEl?.classList.remove("rm-now-playing-artist");
      live.remove();
      if (hadRole === null) holder.removeAttribute("role");
      else holder.setAttribute("role", hadRole);
      if (hadLabel === null) holder.removeAttribute("aria-label");
      else holder.setAttribute("aria-label", hadLabel);
      holder.classList.remove("rm-now-playing");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * The current line marked, every line a seek.
 *
 * Each line becomes a real button and carries `aria-current="location"` while it
 * is the one being spoken, so the position is in the accessibility tree rather
 * than only in a highlight colour. Clicking any line seeks to it, which turns a
 * transcript from a wall of text into the fastest navigation a long recording
 * has.
 *
 * The part that is usually wrong is the auto-scroll. A transcript that always
 * scrolls to the current line fights anybody trying to read ahead, and the fight
 * is unwinnable because the page wins every second. So following is a real
 * toggle with `aria-pressed`, it scrolls only this box and never the page —
 * `keepInView`, not `scrollIntoView` — and any scroll the visitor makes
 * themselves switches it off and says so.
 *
 *   <div data-rm-transcript-sync data-rm-for="talk">
 *     <p data-rm-at="0">We start at the clay pit.</p>
 *     <p data-rm-at="7.5">It has to be wedged before anything else.</p>
 *   </div>
 */
export function transcriptSync(target = "[data-rm-transcript-sync]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { stick = true, label = "Transcript" } = options;
  const cleanups = [];

  for (const holder of holders) {
    const media = mediaFor(holder);
    const rows = [...holder.querySelectorAll("[data-rm-at]")];
    if (!media || !rows.length) continue;

    holder.classList.add("rm-transcript-sync");
    const hadRole = holder.getAttribute("role");
    const hadLabel = holder.getAttribute("aria-label");
    holder.setAttribute("role", "region");
    holder.setAttribute("aria-label", dataString(holder, "rmLabel", hadLabel ?? label));

    const live = announcer(holder, "polite");

    const follow = document.createElement("button");
    follow.type = "button";
    follow.className = "rm-transcript-sync-follow";
    follow.textContent = "Follow along";
    let sticking = dataString(holder, "rmStick", String(stick)) !== "false";
    follow.setAttribute("aria-pressed", String(sticking));
    holder.prepend(follow);

    const lines = rows.map((row) => {
      const at = dataNumber(row, "rmAt", 0);
      row.classList.add("rm-transcript-sync-line");
      const wrapped = buttonise(row, "rm-transcript-sync-seek");
      const go = () => { media.currentTime = at; };
      wrapped.button.addEventListener("click", go);
      // Added to the accessible name, not substituted for it. An `aria-label`
      // of the flattened line would throw away the inline markup and the `lang`
      // attributes the wrapping was performed to keep, so a Spanish phrase in
      // an English transcript would come back read in English — for the sake of
      // a trailing clause a hidden span inside the button carries just as well.
      const said = document.createElement("span");
      said.className = "rm-player-said";
      said.textContent = `. Play from ${spokenTime(at)}`;
      wrapped.button.appendChild(said);
      return { row, at, go, said, ...wrapped };
    }).sort((a, b) => a.at - b.at);

    let current = -1;
    let expected = holder.scrollTop;

    const paint = () => {
      const at = media.currentTime;
      let found = -1;
      for (let i = 0; i < lines.length; i++) if (lines[i].at <= at + 0.01) found = i;
      if (found === current) return;
      if (current >= 0) {
        lines[current].button.removeAttribute("aria-current");
        lines[current].row.classList.remove("is-current");
      }
      current = found;
      if (current < 0) return;
      lines[current].button.setAttribute("aria-current", "location");
      lines[current].row.classList.add("is-current");
      if (!sticking) return;
      keepInView(holder, lines[current].row, prefersReducedMotion() ? "auto" : "smooth");
      expected = holder.scrollTop;
    };

    const onFollow = () => {
      sticking = !sticking;
      follow.setAttribute("aria-pressed", String(sticking));
      live.textContent = sticking ? "Following the transcript." : "Following paused.";
      if (sticking && current >= 0) {
        keepInView(holder, lines[current].row, "auto");
        expected = holder.scrollTop;
      }
    };
    const onScroll = () => {
      // A scroll this component did not ask for is the visitor reading ahead.
      if (!sticking || Math.abs(holder.scrollTop - expected) < 6) return;
      sticking = false;
      follow.setAttribute("aria-pressed", "false");
      live.textContent = "Following paused — you scrolled.";
    };

    follow.addEventListener("click", onFollow);
    holder.addEventListener("scroll", onScroll, { passive: true });
    media.addEventListener("timeupdate", paint);
    paint();

    cleanups.push(() => {
      follow.removeEventListener("click", onFollow);
      holder.removeEventListener("scroll", onScroll);
      media.removeEventListener("timeupdate", paint);
      for (const line of lines) {
        line.button.removeEventListener("click", line.go);
        line.said.remove();
        line.undo();
        line.row.classList.remove("rm-transcript-sync-line", "is-current");
        // `aria-current` only ever went on the button, which `undo()` has just
        // removed; an author's own on the paragraph is theirs to keep.
      }
      follow.remove();
      live.remove();
      if (hadRole === null) holder.removeAttribute("role");
      else holder.setAttribute("role", hadRole);
      if (hadLabel === null) holder.removeAttribute("aria-label");
      else holder.setAttribute("aria-label", hadLabel);
      holder.classList.remove("rm-transcript-sync");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Preview frames that seek, and scroll only themselves.
 *
 * Each thumbnail is a real button with its own timestamp in the accessible
 * name, so the strip is navigable from the keyboard in the same order it reads
 * on screen — no roving tabindex here on purpose, because these are independent
 * destinations rather than one composite control, and swallowing Tab would make
 * the strip harder to use, not easier.
 *
 * The active thumbnail is brought into view with `keepInView`, which does the
 * arithmetic on this one scroller. `scrollIntoView` walks up and scrolls every
 * scrollable ancestor including the page, so a strip that highlights its first
 * frame on mount throws the whole document down to wherever the strip happens
 * to be. The hover and focus lift is a `scale`, so neighbouring frames never
 * move.
 *
 *   <ol data-rm-thumb-strip data-rm-for="kiln">
 *     <li data-rm-at="0"><img src="/film/kiln-000.jpg" alt="The clay pit at dawn"></li>
 *   </ol>
 */
export function thumbStrip(target = "[data-rm-thumb-strip]", options = {}) {
  const strips = resolveElements(target);
  if (!strips.length) return () => {};

  const { label = "Preview frames" } = options;
  const cleanups = [];

  for (const strip of strips) {
    const media = mediaFor(strip);
    const rows = [...strip.children].filter((row) => row.dataset.rmAt !== undefined);
    if (!media || !rows.length) continue;

    strip.classList.add("rm-thumb-strip");
    const hadLabel = strip.getAttribute("aria-label");
    strip.setAttribute("aria-label", dataString(strip, "rmLabel", hadLabel ?? label));

    const frames = rows.map((row) => {
      const at = dataNumber(row, "rmAt", 0);
      row.classList.add("rm-thumb-strip-frame");
      const wrapped = buttonise(row, "rm-thumb-strip-seek");
      const stamp = document.createElement("span");
      stamp.className = "rm-thumb-strip-time";
      stamp.textContent = clockTime(at);
      wrapped.button.appendChild(stamp);
      const picture = wrapped.button.querySelector("img");
      // Kept before it is blanked, because it cannot be read back out of the
      // label afterwards: an alt of "The kiln door — open on finished pots"
      // would come back cut at the dash, and an `alt=""` the author marked
      // decorative on purpose would come back carrying words invented here.
      const hadAlt = picture ? picture.alt : "";
      wrapped.button.setAttribute(
        "aria-label",
        `${picture?.alt?.trim() || "Preview frame"} — play from ${spokenTime(at)}`,
      );
      // The alt is now on the button; leaving it on the image repeats it.
      if (picture) { picture.alt = ""; picture.setAttribute("aria-hidden", "true"); }
      const go = () => { media.currentTime = at; };
      wrapped.button.addEventListener("click", go);
      return { row, at, go, picture, hadAlt, stamp, ...wrapped };
    }).sort((a, b) => a.at - b.at);

    let current = -1;
    const paint = () => {
      const at = media.currentTime;
      let found = -1;
      for (let i = 0; i < frames.length; i++) if (frames[i].at <= at + 0.01) found = i;
      if (found === current || found < 0) return;
      if (current >= 0) {
        frames[current].button.removeAttribute("aria-current");
        frames[current].row.classList.remove("is-current");
      }
      current = found;
      frames[current].button.setAttribute("aria-current", "true");
      frames[current].row.classList.add("is-current");
      keepInView(strip, frames[current].row, prefersReducedMotion() ? "auto" : "smooth");
    };

    media.addEventListener("timeupdate", paint);
    paint();

    cleanups.push(() => {
      media.removeEventListener("timeupdate", paint);
      for (const frame of frames) {
        frame.button.removeEventListener("click", frame.go);
        frame.stamp.remove();
        if (frame.picture) {
          frame.picture.alt = frame.hadAlt;
          frame.picture.removeAttribute("aria-hidden");
        }
        frame.undo();
        frame.row.classList.remove("rm-thumb-strip-frame", "is-current");
        // `aria-current` lived on the button, which `undo()` has just taken
        // away; an author's own on the list item is theirs to keep.
      }
      if (hadLabel === null) strip.removeAttribute("aria-label");
      else strip.setAttribute("aria-label", hadLabel);
      strip.classList.remove("rm-thumb-strip");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Live, or how far behind live, with a way back.
 *
 * "LIVE" in red is a claim, and on a stream somebody paused twenty minutes ago
 * it is a false one. This compares the position against the end of the seekable
 * range and switches between two honest states: at the edge it says live, and
 * behind it says how far behind and reveals a real button that jumps forward.
 * The dot is decoration — the word beside it is the message, because a status
 * carried only by a colour reaches only part of the audience.
 *
 * The badge is drawn text, not a live region. Behind live the words are a
 * distance that changes about once a second, and a region wrapped round them
 * announces the new value every time it changes: a viewer who paused three
 * minutes ago would hear "3 minutes 21 seconds behind", then 22, then 23, for
 * the rest of the broadcast. Only two things here are news — having fallen
 * behind, and being back at the edge — so only those are spoken, from a region
 * of this component's own. Whatever `role` or `aria-live` the markup already
 * carried is left exactly as it was.
 *
 * It updates from `timeupdate` rather than the frame loop on purpose. The
 * distance behind live changes by a second at a time, so four samples a second
 * is already more than the number can use, and a per-frame recalculation of a
 * value that changes once a second is a battery cost with nothing to show.
 *
 *   <p data-rm-live-badge data-rm-for="stream" data-rm-behind="10"></p>
 */
export function liveBadge(target = "[data-rm-live-badge]", options = {}) {
  const badges = resolveElements(target);
  if (!badges.length) return () => {};

  const { behind = 8, label = "Live" } = options;
  const cleanups = [];

  for (const badge of badges) {
    const media = mediaFor(badge);
    if (!media) continue;

    const tolerance = Math.max(1, dataNumber(badge, "rmBehind", behind));
    const name = dataString(badge, "rmLabel", label);

    badge.classList.add("rm-live-badge");

    const said = announcer(badge.parentElement || badge, "polite");

    const dot = document.createElement("i");
    dot.className = "rm-live-badge-dot";
    dot.setAttribute("aria-hidden", "true");
    if (prefersReducedMotion()) dot.classList.add("is-still");

    const word = document.createElement("span");
    word.className = "rm-live-badge-word";
    word.textContent = name;

    const jump = document.createElement("button");
    jump.type = "button";
    jump.className = "rm-live-badge-jump";
    jump.textContent = "Go live";
    jump.hidden = true;

    badge.append(dot, word, jump);

    const edgeOf = () => (media.seekable && media.seekable.length
      ? media.seekable.end(media.seekable.length - 1)
      : media.duration);

    let wasAtEdge = null;
    const paint = () => {
      const edge = edgeOf();
      if (!Number.isFinite(edge)) { badge.classList.add("is-live"); return; }
      const gap = edge - media.currentTime;
      const atEdge = gap <= tolerance;
      badge.classList.toggle("is-live", atEdge);
      badge.classList.toggle("is-behind", !atEdge);
      word.textContent = atEdge ? name : `${spokenTime(gap)} behind`;
      jump.hidden = atEdge;
      if (wasAtEdge === atEdge) return;
      // Only the crossing is announced, and the very first pass is a starting
      // position rather than a change, so it says nothing at all.
      if (wasAtEdge !== null) {
        said.textContent = atEdge
          ? `Back at the ${name.toLowerCase()} edge.`
          : "Behind live. There is a button here to jump back to the edge.";
      }
      wasAtEdge = atEdge;
    };

    const onJump = () => {
      const edge = edgeOf();
      if (Number.isFinite(edge)) media.currentTime = Math.max(0, edge - 0.5);
      paint();
    };

    jump.addEventListener("click", onJump);
    media.addEventListener("timeupdate", paint);
    media.addEventListener("progress", paint);
    paint();

    cleanups.push(() => {
      jump.removeEventListener("click", onJump);
      media.removeEventListener("timeupdate", paint);
      media.removeEventListener("progress", paint);
      dot.remove();
      word.remove();
      jump.remove();
      said.remove();
      badge.classList.remove("rm-live-badge", "is-live", "is-behind");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * A spinner that waits before it appears.
 *
 * A `waiting` event fires for a stall of forty milliseconds as readily as for
 * one of four seconds, and a spinner that flashes on every one of them makes a
 * perfectly healthy stream look broken. So there is a delay: the ring only
 * appears if the stall outlives it, which removes almost every flash without
 * losing a single real wait.
 *
 * "Buffering" is said once, politely, from a live region that sits *outside*
 * the ring — a live region inside a `hidden` element is not rendered, so
 * nothing in it is ever spoken, which is the quiet way this announcement
 * usually fails. The ring itself is `aria-hidden`, spins from a CSS animation
 * rather than a script, and the arc
 * showing how much is buffered ahead is a `stroke-dashoffset` updated on the
 * shared frame loop and only while the ring is on screen. Under reduced motion
 * it does not spin; the word stays, which is the part that was carrying the
 * meaning anyway.
 *
 *   <div data-rm-buffer-ring data-rm-for="stream" data-rm-delay="320"></div>
 */
export function bufferRing(target = "[data-rm-buffer-ring]", options = {}) {
  const rings = resolveElements(target);
  if (!rings.length) return () => {};

  const { delay = 320, label = "Buffering" } = options;
  const cleanups = [];

  for (const ring of rings) {
    const media = mediaFor(ring);
    if (!media) continue;

    const wait = Math.max(0, dataNumber(ring, "rmDelay", delay));
    const name = dataString(ring, "rmLabel", label);

    ring.classList.add("rm-buffer-ring");
    ring.setAttribute("aria-hidden", "true");
    ring.hidden = true;
    // The announcement lives outside the ring on purpose: a live region inside
    // a `hidden` element is not rendered, so nothing inside it is ever spoken.
    const live = announcer(ring.parentElement || ring, "polite");
    if (prefersReducedMotion()) ring.classList.add("is-still");

    const art = document.createElement("span");
    art.className = "rm-buffer-ring-art";
    art.setAttribute("aria-hidden", "true");
    art.innerHTML =
      '<svg viewBox="0 0 48 48" focusable="false">'
      + '<circle class="rm-buffer-ring-track" cx="24" cy="24" r="20" fill="none" stroke="currentColor" stroke-width="3"/>'
      + '<circle class="rm-buffer-ring-arc" cx="24" cy="24" r="20" fill="none" stroke="currentColor" '
      + 'stroke-width="3" stroke-linecap="round" pathLength="100"/></svg>';

    ring.appendChild(art);

    let timer = 0;
    const show = () => {
      clearTimeout(timer);
      if (!ring.hidden) return;
      timer = setTimeout(() => {
        ring.hidden = false;
        live.textContent = name;
      }, wait);
    };
    const hide = () => {
      clearTimeout(timer);
      if (!ring.hidden) live.textContent = "";
      ring.hidden = true;
    };

    const paint = () => {
      if (ring.hidden) return;
      ring.style.setProperty("--rm-buffer-ring-ahead", bufferedAhead(media).toFixed(3));
    };

    media.addEventListener("waiting", show);
    media.addEventListener("stalled", show);
    media.addEventListener("playing", hide);
    media.addEventListener("canplay", hide);
    media.addEventListener("seeked", hide);
    media.addEventListener("error", hide);

    cleanups.push(whileVisible(ring, () => onFrame(paint)));
    cleanups.push(() => {
      clearTimeout(timer);
      media.removeEventListener("waiting", show);
      media.removeEventListener("stalled", show);
      media.removeEventListener("playing", hide);
      media.removeEventListener("canplay", hide);
      media.removeEventListener("seeked", hide);
      media.removeEventListener("error", hide);
      art.remove();
      live.remove();
      ring.hidden = false;
      ring.removeAttribute("aria-hidden");
      ring.style.removeProperty("--rm-buffer-ring-ahead");
      ring.classList.remove("rm-buffer-ring", "is-still");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * Docked, dismissible, announced, and never a focus trap.
 *
 * It appears when the real player scrolls out of view and something is playing,
 * slides in on a transform, and goes away again when the player comes back. It
 * is a `role="region"` with a name, its arrival is announced politely once, and
 * a real close button dismisses it — after which it stays away until the main
 * player has been seen again, because a dock that returns thirty seconds after
 * you dismissed it is a dock nobody can get rid of.
 *
 * It is deliberately not a dialog and deliberately not modal. The page behind
 * it is still readable and still operable, so sealing it with `inert` or
 * cycling Tab inside it would take a convenience and turn it into a cage. The
 * only focus it moves is its own: if you close it while focus is inside, focus
 * goes to the main player rather than to the top of the document.
 *
 *   <aside data-rm-mini-player data-rm-for="kiln" data-rm-corner="bottom-right">
 *     <p>Kiln opening — Marta Ruiz</p>
 *   </aside>
 */
export function miniPlayer(target = "[data-rm-mini-player]", options = {}) {
  const docks = resolveElements(target);
  if (!docks.length) return () => {};

  const CORNERS = {
    "top-left": "translate(-24px, -24px)",
    "top-right": "translate(24px, -24px)",
    "bottom-left": "translate(-24px, 24px)",
    "bottom-right": "translate(24px, 24px)",
  };

  const { corner = "bottom-right", label = "Mini player" } = options;
  const cleanups = [];

  for (const dock of docks) {
    const media = mediaFor(dock);
    if (!media) continue;

    const askedFor = dataString(dock, "rmCorner", corner);
    // An unrecognised corner falls back rather than producing an unstyled dock.
    const where = CORNERS[askedFor] ? askedFor : "bottom-right";
    const name = dataString(dock, "rmLabel", label);

    dock.classList.add("rm-mini-player", `is-${where}`);
    // An `<aside>` may already be a named region in the markup; both values are
    // kept so cleanup can put them back rather than delete them.
    const hadRole = dock.getAttribute("role");
    const hadLabel = dock.getAttribute("aria-label");
    dock.setAttribute("role", "region");
    dock.setAttribute("aria-label", name);
    dock.hidden = true;

    const live = announcer(dock.parentElement || dock, "polite");

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "rm-mini-player-toggle";
    toggle.setAttribute("aria-label", "Pause");

    const shut = document.createElement("button");
    shut.type = "button";
    shut.className = "rm-mini-player-close";
    shut.setAttribute("aria-label", `Dismiss the ${name}`);
    shut.textContent = "×";

    dock.append(toggle, shut);

    const hadTabIndex = media.getAttribute("tabindex");
    let dismissed = false;
    // The dismissal fade, held onto so it can be cancelled. See `hide()`.
    let leaving = null;

    const paint = () => {
      const running = !media.paused && !media.ended;
      toggle.setAttribute("aria-label", running ? "Pause" : "Play");
      toggle.innerHTML = running
        ? '<span aria-hidden="true">❚❚</span>'
        : '<span aria-hidden="true">▶</span>';
    };

    const show = () => {
      if (!dock.hidden || dismissed) return;
      leaving?.cancel();
      dock.hidden = false;
      live.textContent = `${name} docked.`;
      if (prefersReducedMotion()) return;
      dock.animate(
        [{ opacity: 0, transform: CORNERS[where] }, { opacity: 1, transform: "none" }],
        { duration: 340, easing: EASE.out },
      );
    };
    const hide = (announce = false) => {
      if (dock.hidden) return;
      const inside = dock.contains(document.activeElement);
      const done = () => {
        dock.hidden = true;
        if (!inside) return;
        // Focus was in here; hand it somewhere sensible, not to the body.
        media.setAttribute("tabindex", "-1");
        media.focus({ preventScroll: true });
      };
      if (announce) live.textContent = `${name} dismissed.`;
      if (prefersReducedMotion()) { done(); return; }
      // No `fill: "forwards"`, and the animation is kept. A forwards fill goes
      // on applying `opacity: 0` and a 24px offset to the dock for the life of
      // the page: the next `show()` fades in, finishes, and the fill takes over
      // again while `hidden` is false, leaving a `position: fixed` panel at
      // `z-index: 60` invisible and still swallowing every click in the corner.
      // What actually holds the finished state is `dock.hidden = true` below.
      leaving?.cancel();
      leaving = dock.animate(
        [{ opacity: 1, transform: "none" }, { opacity: 0, transform: CORNERS[where] }],
        { duration: 220, easing: EASE.inOut },
      );
      leaving.finished.then(done, done);
    };

    const onToggle = () => {
      if (media.paused) {
        const attempt = media.play();
        if (attempt && typeof attempt.catch === "function") attempt.catch(paint);
      } else media.pause();
    };
    const onShut = () => { dismissed = true; hide(true); };

    toggle.addEventListener("click", onToggle);
    shut.addEventListener("click", onShut);
    media.addEventListener("play", paint);
    media.addEventListener("pause", paint);
    paint();

    let observer = null;
    if (typeof IntersectionObserver === "function") {
      observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          // The player is back on screen, so the dock's job is done — and
          // whatever was dismissed may be offered again next time.
          dismissed = false;
          hide();
        } else if (!media.paused) show();
      }, { threshold: 0.1 });
      observer.observe(media);
    }

    const onPlay = () => {
      if (observer && dock.hidden && !dismissed) {
        const box = media.getBoundingClientRect();
        if (box.bottom < 0 || box.top > innerHeight) show();
      }
    };
    media.addEventListener("play", onPlay);

    cleanups.push(() => {
      observer?.disconnect();
      toggle.removeEventListener("click", onToggle);
      shut.removeEventListener("click", onShut);
      media.removeEventListener("play", paint);
      media.removeEventListener("pause", paint);
      media.removeEventListener("play", onPlay);
      toggle.remove();
      shut.remove();
      live.remove();
      if (hadTabIndex === null) media.removeAttribute("tabindex");
      else media.setAttribute("tabindex", hadTabIndex);
      // Unmounting part-way through the fade would otherwise leave the aside
      // stranded at opacity 0 and offset, with nothing left running to finish.
      leaving?.cancel();
      dock.hidden = false;
      if (hadRole === null) dock.removeAttribute("role");
      else dock.setAttribute("role", hadRole);
      if (hadLabel === null) dock.removeAttribute("aria-label");
      else dock.setAttribute("aria-label", hadLabel);
      dock.classList.remove("rm-mini-player", `is-${where}`);
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * The shortcuts, and the shortcuts themselves.
 *
 * A player with keyboard shortcuts nobody has been told about is a player with
 * no keyboard shortcuts, so this is both: a `<dl>` listing every key, and the
 * handler that implements them. It opens from a real button and from `?`, and
 * it is a non-modal `role="dialog"` — Escape closes it and focus goes back to
 * the button, but the page behind stays operable and nothing is made `inert`,
 * because a help panel is the last thing that should be able to lock somebody
 * out of the page.
 *
 * The important half is what the handler refuses to do. It ignores every key
 * while focus is in a text field, a `<select>` or anything contenteditable, so
 * typing "l" into a comment box does not skip the film forward; and it leaves
 * Space alone whenever the focus is on a button or a link, whose own activation
 * key that is. Keys are only handled while focus is somewhere inside the player
 * region — a document-wide listener stealing the arrow keys is how a video
 * embedded halfway down an article breaks scrolling for the whole page.
 *
 *   <div data-rm-keyboard-hints data-rm-for="kiln" data-rm-skip="10"></div>
 */
export function keyboardHints(target = "[data-rm-keyboard-hints]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { skip = 5, jump = 10, label = "Keyboard shortcuts" } = options;
  const cleanups = [];

  for (const holder of holders) {
    const media = mediaFor(holder);
    if (!media) continue;

    const near = Math.max(1, dataNumber(holder, "rmSkip", skip));
    const far = Math.max(1, dataNumber(holder, "rmJump", jump));
    const name = dataString(holder, "rmLabel", label);
    // The region the shortcuts belong to: the media's own box, not the page.
    const region = media.closest("[data-rm-player-bar], figure, section, article") || media.parentElement || holder;

    holder.classList.add("rm-keyboard-hints");

    const button = document.createElement("button");
    button.type = "button";
    button.className = "rm-keyboard-hints-button";
    button.textContent = name;
    button.setAttribute("aria-expanded", "false");

    const panel = document.createElement("div");
    panel.className = "rm-keyboard-hints-panel";
    panel.id = uid("rm-keyboard-hints");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", name);
    panel.hidden = true;
    button.setAttribute("aria-controls", panel.id);

    const KEYS = [
      ["Space or K", "Play or pause"],
      ["← and →", `Back or forward ${near} seconds`],
      ["J and L", `Back or forward ${far} seconds`],
      ["Home / End", "Start or end"],
      ["M", "Mute or unmute"],
      ["C", "Captions on or off"],
      ["F", "Full screen"],
      ["?", "Show or hide this list"],
      ["Escape", "Close this list"],
    ];
    const listing = document.createElement("dl");
    listing.className = "rm-keyboard-hints-list";
    for (const [key, what] of KEYS) {
      const term = document.createElement("dt");
      term.innerHTML = `<kbd>${key}</kbd>`;
      const detail = document.createElement("dd");
      detail.textContent = what;
      listing.append(term, detail);
    }
    panel.appendChild(listing);
    holder.append(button, panel);

    const open = () => {
      if (!panel.hidden) return;
      panel.hidden = false;
      button.setAttribute("aria-expanded", "true");
      if (prefersReducedMotion()) return;
      panel.animate(
        [{ opacity: 0, transform: "translateY(8px) scale(0.98)" }, { opacity: 1, transform: "none" }],
        { duration: 220, easing: EASE.out },
      );
    };
    const close = (restore = true) => {
      if (panel.hidden) return;
      panel.hidden = true;
      button.setAttribute("aria-expanded", "false");
      if (restore) button.focus();
    };
    const onButton = () => { if (panel.hidden) open(); else close(false); };

    const captionTrack = () => [...(media.textTracks || [])]
      .find((t) => t.kind === "subtitles" || t.kind === "captions") || null;

    const onKey = (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const where = event.target;
      if (typingSomewhere(where)) {
        // One exception: the help panel's own Escape still works from anywhere
        // inside it, because being unable to close a panel is worse.
        if (event.key === "Escape" && panel.contains(where)) { event.preventDefault(); close(); }
        return;
      }
      const inside = region.contains(where) || holder.contains(where) || where === media;
      if (!inside) return;

      // `?` and Escape sit below the guard with every other key, not above it.
      // Handled document-wide they take both keys away from the whole page,
      // open every player's panel at once on a page carrying two, and — since
      // `close()` restores focus by default — haul the reader's focus onto this
      // button from wherever they actually were. Focus only goes back to the
      // button when it came from inside the panel in the first place.
      if (event.key === "Escape") {
        if (!panel.hidden) { event.preventDefault(); close(panel.contains(where)); }
        return;
      }
      if (event.key === "?") {
        event.preventDefault();
        if (panel.hidden) open();
        else close(panel.contains(where));
        return;
      }

      const isButtonish = where instanceof Element
        && (where.tagName === "BUTTON" || where.tagName === "A" || where.tagName === "SUMMARY");
      const total = runtimeOf(media);
      const seek = (by) => {
        media.currentTime = clamp(media.currentTime + by, 0, total || media.currentTime + by);
      };

      switch (event.key) {
        case " ":
          if (isButtonish) return;
          event.preventDefault();
          if (media.paused) media.play()?.catch?.(() => {});
          else media.pause();
          break;
        case "k": case "K":
          event.preventDefault();
          if (media.paused) media.play()?.catch?.(() => {});
          else media.pause();
          break;
        case "ArrowLeft": event.preventDefault(); seek(-near); break;
        case "ArrowRight": event.preventDefault(); seek(near); break;
        case "j": case "J": event.preventDefault(); seek(-far); break;
        case "l": case "L": event.preventDefault(); seek(far); break;
        case "Home": event.preventDefault(); media.currentTime = 0; break;
        case "End": if (total) { event.preventDefault(); media.currentTime = total; } break;
        case "m": case "M": event.preventDefault(); media.muted = !media.muted; break;
        case "c": case "C": {
          const track = captionTrack();
          if (!track) return;
          event.preventDefault();
          track.mode = track.mode === "showing" ? "disabled" : "showing";
          break;
        }
        case "f": case "F": {
          const box = region.requestFullscreen ? region : null;
          if (!box) return;
          event.preventDefault();
          if (document.fullscreenElement === box) document.exitFullscreen?.();
          else box.requestFullscreen?.().catch(() => {});
          break;
        }
        default: break;
      }
    };

    button.addEventListener("click", onButton);
    document.addEventListener("keydown", onKey);

    cleanups.push(() => {
      button.removeEventListener("click", onButton);
      document.removeEventListener("keydown", onKey);
      button.remove();
      panel.remove();
      holder.classList.remove("rm-keyboard-hints");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}
