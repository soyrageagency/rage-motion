/**
 * Profile and identity — fifteen ways to show who somebody is.
 *
 *   • avatar()          — a picture, with initials underneath it when there isn't one.
 *   • avatarUpload()    — drag a picture in, or press a button and choose one.
 *   • profileCard()     — a card that opens in place, measured rather than guessed.
 *   • profileHeader()   — a cover that drifts behind a face that stays put.
 *   • userMenu()        — a real menu hanging off an avatar.
 *   • accountSwitcher() — which of your accounts is this, and switch it.
 *   • presenceRing()    — a ring that says online, in a word as well as a colour.
 *   • followButton()    — follow, following, unfollow: a state machine that speaks.
 *   • bioReveal()       — a bio that opens to whatever height it happens to be.
 *   • socialRow()       — icon links that are not anonymous squares.
 *   • statsRow()        — followers and posts, counting up, values never lost.
 *   • badgeRow()        — achievements with titles rather than mystery pictures.
 *   • profileTabs()     — a real tablist over the sections of a profile.
 *   • coverParallax()   — a cover image with depth and no exposed edge.
 *   • identityChip()    — a compact pill that tells you more when you reach it.
 *
 * A profile is somebody's name, face and reputation, so the failure modes here
 * are not cosmetic. A broken image must never leave a grey square where a
 * person was; a status carried only by the colour of a ring is a status half
 * your visitors never receive; a follow button whose label changes silently
 * leaves a screen reader user pressing it twice to find out what happened. So
 * every component in this file renders a word for anything a colour is doing,
 * keeps the real value of a number in the accessibility tree while the visible
 * digits are still counting, and puts state on the control itself with
 * `aria-pressed`, `aria-expanded`, `aria-current` or `aria-selected` rather
 * than in a class name.
 *
 * Nothing here animates a box. Cards that appear to grow are measured before
 * and after and played back as a transform (a FLIP), rings and marks move by
 * `translate`, and the one disclosure that genuinely changes the height of the
 * page — the bio — says so and does it on purpose.
 *
 * The demo names throughout are invented. Never dress a component up in a real
 * person's identity.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import {
  clamp, dataNumber, dataString, EASE, onFrame, prefersReducedMotion, resolveElements, watch,
  whileVisible,
} from "../core/motion.js";

/** Two initials from a name, taken by code point so an emoji or an accent survives. */
function initialsFrom(name) {
  const parts = String(name ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  const first = [...parts[0]][0] ?? "";
  const last = parts.length > 1 ? [...parts[parts.length - 1]][0] ?? "" : "";
  return (first + last).toLocaleUpperCase();
}

/**
 * A stable tone index for a name.
 *
 * Random colours mean the same person is a different colour on every page, so
 * this hashes the name instead: Nora Vale is always the same swatch, which is
 * half of what makes an initials avatar recognisable at all.
 */
function toneFor(name, count = 4) {
  let hash = 0;
  for (const ch of String(name ?? "")) hash = (hash * 31 + ch.codePointAt(0)) % 1000003;
  return hash % count;
}

/** Real text with no visual weight: content for anything that reads the page. */
function quietly(text) {
  const span = document.createElement("span");
  span.className = "rm-profile-quiet";
  span.textContent = text;
  return span;
}

/** A live region created once per component and reused for every announcement. */
function speaker(holder, tone = "polite") {
  const said = document.createElement("p");
  said.className = "rm-profile-quiet";
  said.setAttribute("aria-live", tone);
  said.setAttribute("role", tone === "assertive" ? "alert" : "status");
  holder.appendChild(said);
  return said;
}

/** Number formatting in the visitor's own locale, from the platform, no library. */
const numbers = new Intl.NumberFormat(
  typeof navigator === "object" ? navigator.language || "en-GB" : "en-GB",
);

/**
 * A picture, with initials underneath it when there isn't one.
 *
 * The initials are not a fallback that swaps in after a failure — they are
 * drawn first and the image is laid over them, so a slow image reveals a
 * legible circle rather than a hole, and an image that 404s simply never
 * covers them. The naive avatar is a `background-image` on a div: it has no
 * alt text, no error event to react to, and when the URL is wrong it leaves a
 * grey disc that says nothing about who it was meant to be.
 *
 * The wrapper carries the name as `role="img"` with an `aria-label`, and the
 * inner `<img>` is given an empty alt so the person is announced exactly once
 * however the picture ends up.
 *
 *   <span data-rm-avatar="/faces/nora.jpg" data-rm-name="Nora Vale"></span>
 */
export function avatar(target = "[data-rm-avatar]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { size = 48, name = "Unnamed person", duration = 320, tones = 4 } = options;
  const cleanups = [];

  for (const holder of holders) {
    const who = dataString(holder, "rmName", name);
    const src = dataString(holder, "rmAvatar", dataString(holder, "rmSrc", ""));
    const kept = [...holder.childNodes];
    const hadRole = holder.getAttribute("role");
    const tone = toneFor(who, tones);

    holder.classList.add("rm-avatar", `is-tone-${tone}`);
    holder.style.setProperty("--rm-avatar-size", `${dataNumber(holder, "rmSize", size)}px`);
    holder.setAttribute("role", "img");
    holder.setAttribute("aria-label", who);

    const marks = document.createElement("span");
    marks.className = "rm-avatar-initials";
    marks.setAttribute("aria-hidden", "true");
    marks.textContent = initialsFrom(who);
    holder.replaceChildren(marks);

    let picture = null;
    if (src) {
      picture = document.createElement("img");
      picture.className = "rm-avatar-image";
      picture.alt = "";
      picture.decoding = "async";
      picture.loading = "lazy";
      // The start state comes from here, not from the stylesheet: with the
      // script gone the image is simply visible.
      picture.style.opacity = "0";
      picture.addEventListener("load", () => {
        picture.style.opacity = "1";
        if (prefersReducedMotion()) return;
        picture.animate(
          [{ opacity: 0, transform: "scale(1.06)" }, { opacity: 1, transform: "none" }],
          { duration, easing: EASE.out },
        );
      });
      // A missing picture is not an error state, it is an avatar with initials.
      picture.addEventListener("error", () => picture.remove());
      picture.src = src;
      holder.appendChild(picture);
    }

    cleanups.push(() => {
      picture?.remove();
      marks.remove();
      holder.replaceChildren(...kept);
      holder.style.removeProperty("--rm-avatar-size");
      if (hadRole) holder.setAttribute("role", hadRole);
      else holder.removeAttribute("role");
      holder.removeAttribute("aria-label");
      holder.classList.remove("rm-avatar", `is-tone-${tone}`);
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Drag a picture in, or press a button and choose one.
 *
 * The drop zone is the flourish; the button is how most people will actually
 * do it, and it is a real `<input type="file">` driven by a real `<button>`
 * rather than a div with a `drop` listener — that version is unusable from the
 * keyboard, which is the single most common bug in an upload control.
 *
 * The preview box is a fixed square that is present before anything is chosen,
 * so putting a picture in it swaps a source and crossfades rather than
 * inserting an element and shoving the form down the page. Every outcome is
 * announced: a chosen file politely, a rejected one assertively.
 *
 *   <div data-rm-avatar-upload data-rm-name="Nora Vale"></div>
 */
export function avatarUpload(target = "[data-rm-avatar-upload]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { label = "Choose a picture", accept = "image/*", size = 96 } = options;
  const cleanups = [];

  for (const holder of holders) {
    holder.classList.add("rm-avatar-upload");
    holder.style.setProperty("--rm-avatar-upload-size", `${dataNumber(holder, "rmSize", size)}px`);

    const frame = document.createElement("div");
    frame.className = "rm-avatar-upload-frame";
    const marks = document.createElement("span");
    marks.className = "rm-avatar-upload-initials";
    marks.setAttribute("aria-hidden", "true");
    marks.textContent = initialsFrom(dataString(holder, "rmName", "New person"));
    const preview = document.createElement("img");
    preview.className = "rm-avatar-upload-preview";
    preview.alt = "";
    preview.hidden = true;
    frame.append(marks, preview);

    const field = document.createElement("input");
    field.type = "file";
    field.className = "rm-avatar-upload-field";
    field.accept = dataString(holder, "rmAccept", accept);
    // The input is the mechanism, the button is the control. Leaving both in
    // the tab order gives one job two stops and no way to tell them apart, so
    // the input steps out and the button does the pressing.
    field.tabIndex = -1;
    field.setAttribute("aria-hidden", "true");

    const button = document.createElement("button");
    button.type = "button";
    button.className = "rm-avatar-upload-button";
    button.textContent = dataString(holder, "rmLabel", label);
    button.addEventListener("click", () => field.click());

    const hint = document.createElement("p");
    hint.className = "rm-avatar-upload-hint";
    hint.textContent = "or drop an image here";

    holder.append(frame, field, button, hint);
    const said = speaker(holder);
    const alarm = speaker(holder, "assertive");

    let url = "";
    const take = (file) => {
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        alarm.textContent = `${file.name} is not an image. Choose a JPEG, PNG or WebP.`;
        holder.classList.add("is-refused");
        setTimeout(() => holder.classList.remove("is-refused"), 600);
        return;
      }
      if (url) URL.revokeObjectURL(url);
      url = URL.createObjectURL(file);
      preview.src = url;
      preview.hidden = false;
      said.textContent = `${file.name} chosen as the profile picture.`;
      if (prefersReducedMotion()) return;
      preview.animate(
        [{ opacity: 0, transform: "scale(1.08)" }, { opacity: 1, transform: "none" }],
        { duration: 380, easing: EASE.out },
      );
    };

    const onPick = () => take(field.files?.[0]);
    const onOver = (event) => { event.preventDefault(); holder.classList.add("is-over"); };
    const onOut = () => holder.classList.remove("is-over");
    const onDrop = (event) => {
      event.preventDefault();
      holder.classList.remove("is-over");
      take(event.dataTransfer?.files?.[0]);
    };

    field.addEventListener("change", onPick);
    holder.addEventListener("dragover", onOver);
    holder.addEventListener("dragleave", onOut);
    holder.addEventListener("drop", onDrop);

    cleanups.push(() => {
      field.removeEventListener("change", onPick);
      holder.removeEventListener("dragover", onOver);
      holder.removeEventListener("dragleave", onOut);
      holder.removeEventListener("drop", onDrop);
      if (url) URL.revokeObjectURL(url);
      frame.remove();
      field.remove();
      button.remove();
      hint.remove();
      said.remove();
      alarm.remove();
      holder.style.removeProperty("--rm-avatar-upload-size");
      holder.classList.remove("rm-avatar-upload", "is-over", "is-refused");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A card that opens in place, measured rather than guessed.
 *
 * Opening is a FLIP: the card is measured, the detail is un-hidden, the card
 * is measured again, and the difference is played back as a transform from the
 * old box to the new one. Nothing animates a height, so the browser lays the
 * card out exactly once and the animation itself is free. The version that
 * transitions `max-height` has to invent a number bigger than the content, so
 * it either clips somebody's job title or spends the first half of the
 * animation moving through empty space.
 *
 * The children are wrapped in one inner element purely so it can carry the
 * inverse scale — without it a card that grows 1.6× stretches the name inside
 * it like a funhouse mirror on the way.
 *
 *   <article data-rm-profile-card>
 *     <h3>Nora Vale</h3>
 *     <div data-rm-card-detail>Field recordist, Lisbon.</div>
 *   </article>
 */
export function profileCard(target = "[data-rm-profile-card]", options = {}) {
  const cards = resolveElements(target);
  if (!cards.length) return () => {};

  const {
    detail: detailSelector = "[data-rm-card-detail]",
    toggle: toggleSelector = "[data-rm-card-toggle]",
    duration = 520,
    open: openLabel = "More about this person",
    close: closeLabel = "Less",
  } = options;
  const cleanups = [];

  for (const card of cards) {
    const detail = card.querySelector(detailSelector);
    if (!detail) continue;

    const kept = [...card.childNodes];
    card.classList.add("rm-profile-card");

    const inner = document.createElement("div");
    inner.className = "rm-profile-card-inner";
    inner.append(...kept);
    card.appendChild(inner);
    detail.classList.add("rm-profile-card-detail");

    let button = inner.querySelector(toggleSelector);
    let made = null;
    if (!button) {
      made = document.createElement("button");
      made.className = "rm-profile-card-toggle";
      made.textContent = dataString(card, "rmLabel", openLabel);
      inner.appendChild(made);
      button = made;
    }
    if (button.tagName === "BUTTON") button.type = "button";
    if (!detail.id) detail.id = `rm-card-detail-${Math.random().toString(36).slice(2, 8)}`;
    // An author's own toggle survives teardown, so whatever we wrote on it has
    // to come off again: `made?.remove()` only disposes of the button we built
    // ourselves, and a leftover `aria-expanded` describes a disclosure that is
    // no longer there.
    const hadOnToggle = {
      controls: button.getAttribute("aria-controls"),
      expanded: button.getAttribute("aria-expanded"),
    };
    button.setAttribute("aria-controls", detail.id);
    button.setAttribute("aria-expanded", "false");

    // Closed from JavaScript, so the detail is readable with the script gone.
    detail.hidden = true;
    let open = false;

    const flip = () => {
      const was = card.getBoundingClientRect();
      open = !open;
      detail.hidden = !open;
      card.classList.toggle("is-open", open);
      button.setAttribute("aria-expanded", String(open));
      if (made) made.textContent = open ? closeLabel : dataString(card, "rmLabel", openLabel);
      if (prefersReducedMotion()) return;

      const now = card.getBoundingClientRect();
      const sx = was.width / (now.width || 1);
      const sy = was.height / (now.height || 1);
      if (!Number.isFinite(sx) || !Number.isFinite(sy)) return;

      card.animate(
        [
          { transformOrigin: "top left", transform: `scale(${sx || 1}, ${sy || 1})` },
          { transformOrigin: "top left", transform: "none" },
        ],
        { duration, easing: EASE.out },
      );
      // The counter-scale is what keeps the text the right shape throughout.
      inner.animate(
        [
          { transformOrigin: "top left", transform: `scale(${1 / (sx || 1)}, ${1 / (sy || 1)})` },
          { transformOrigin: "top left", transform: "none" },
        ],
        { duration, easing: EASE.out },
      );
      if (open) {
        detail.animate(
          [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }],
          { duration, delay: duration * 0.25, easing: EASE.out, fill: "backwards" },
        );
      }
    };

    button.addEventListener("click", flip);

    cleanups.push(() => {
      button.removeEventListener("click", flip);
      made?.remove();
      if (!made) {
        if (hadOnToggle.controls) button.setAttribute("aria-controls", hadOnToggle.controls);
        else button.removeAttribute("aria-controls");
        if (hadOnToggle.expanded) button.setAttribute("aria-expanded", hadOnToggle.expanded);
        else button.removeAttribute("aria-expanded");
      }
      detail.hidden = false;
      detail.classList.remove("rm-profile-card-detail");
      card.replaceChildren(...kept);
      inner.remove();
      card.classList.remove("rm-profile-card", "is-open");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A cover that drifts behind a face that stays put.
 *
 * Two layers moving at different rates on the same scroll, both by transform,
 * and the cover is overscaled by exactly the distance it will travel so an
 * empty strip can never appear at its edge — that gap is the giveaway of every
 * parallax banner built by transforming an image that fits its frame exactly.
 *
 * The per-frame work runs through the shared loop and only while the header is
 * on screen, so scrolling to the bottom of a long profile costs nothing. Under
 * reduced motion no listener is attached at all and both layers sit where they
 * belong.
 *
 *   <header data-rm-profile-header data-rm-name="Nora Vale">
 *     <img data-rm-header-cover src="…" alt="">
 *     <span data-rm-avatar data-rm-name="Nora Vale"></span>
 *   </header>
 */
export function profileHeader(target = "[data-rm-profile-header]", options = {}) {
  const headers = resolveElements(target);
  if (!headers.length) return () => {};

  const {
    cover: coverSelector = "[data-rm-header-cover]",
    face: faceSelector = "[data-rm-avatar]",
    depth = 48,
    lift = 14,
  } = options;
  const cleanups = [];

  for (const header of headers) {
    const cover = header.querySelector(coverSelector);
    const face = header.querySelector(faceSelector);
    header.classList.add("rm-profile-header");
    header.setAttribute("role", "region");
    header.setAttribute("aria-label", `${dataString(header, "rmName", "Profile")} header`);

    const travel = dataNumber(header, "rmDepth", depth);
    const rise = dataNumber(header, "rmLift", lift);

    if (cover && !prefersReducedMotion()) {
      cover.classList.add("rm-profile-header-cover");
      const draw = () => {
        const box = header.getBoundingClientRect();
        const view = window.innerHeight || document.documentElement.clientHeight || 1;
        // −1 above the fold, +1 below it: one number that drives both layers.
        const through = clamp((box.top + box.height / 2 - view / 2) / view, -1, 1);
        // Scaled by however far it is about to move, so no edge is ever exposed.
        const grow = 1 + (travel * 2) / Math.max(box.height, 1);
        cover.style.transform = `translate3d(0, ${(-through * travel).toFixed(2)}px, 0) scale(${grow.toFixed(4)})`;
        if (face) face.style.transform = `translate3d(0, ${(through * rise).toFixed(2)}px, 0)`;
      };
      draw();
      cleanups.push(whileVisible(header, () => onFrame(draw)));
    }

    cleanups.push(() => {
      cover?.classList.remove("rm-profile-header-cover");
      if (cover) cover.style.transform = "";
      if (face) face.style.transform = "";
      header.removeAttribute("role");
      header.removeAttribute("aria-label");
      header.classList.remove("rm-profile-header");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * A real menu hanging off an avatar.
 *
 * `aria-haspopup="menu"` on the trigger, `role="menu"` on the list, every item
 * a `role="menuitem"` at `tabindex="-1"` with the arrow keys moving focus, so
 * the whole thing behaves the way the platform menu it imitates behaves. Home
 * and End jump to the ends, a letter jumps to the next item starting with it,
 * Escape closes and puts focus back on the avatar, and Tab closes and carries
 * on out of the menu rather than trapping anybody inside a dropdown.
 *
 * Any `<li>` between the menu and its items is given `role="none"` first,
 * because a menu may only own menuitems and an intervening listitem quietly
 * breaks the count of how many items the menu has.
 *
 * The usual version is a div that toggles a class: it announces nothing, it
 * cannot be driven from the keyboard, and focus is left behind on the page
 * when it closes.
 *
 *   <div data-rm-user-menu>
 *     <button type="button"><span data-rm-avatar data-rm-name="Nora Vale"></span></button>
 *     <ul data-rm-menu-list><li><a href="/settings">Settings</a></li></ul>
 *   </div>
 */
export function userMenu(target = "[data-rm-user-menu]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { list: listSelector = "[data-rm-menu-list]", duration = 220, label = "Account menu" } = options;
  const cleanups = [];

  for (const holder of holders) {
    const trigger = holder.querySelector("button");
    const menu = holder.querySelector(listSelector) ?? trigger?.nextElementSibling;
    if (!trigger || !menu) continue;

    holder.classList.add("rm-user-menu");
    trigger.type = "button";
    trigger.classList.add("rm-user-menu-trigger");
    trigger.setAttribute("aria-haspopup", "menu");
    trigger.setAttribute("aria-expanded", "false");
    // Only a trigger with no name of its own gets one, and we remember that we
    // were the ones who gave it so teardown does not eat the author's label.
    const namedTrigger = !trigger.hasAttribute("aria-label");
    if (namedTrigger) trigger.setAttribute("aria-label", dataString(holder, "rmLabel", label));

    menu.classList.add("rm-user-menu-list");
    const hadMenuLabel = menu.getAttribute("aria-label");
    menu.setAttribute("role", "menu");
    menu.setAttribute("aria-label", dataString(holder, "rmLabel", label));
    menu.hidden = true;

    const items = [...menu.querySelectorAll("a, button")];
    // A `role="menu"` may only own menuitems, groups or nothing at all, so the
    // `<li>` most people wrap their links in has to stop being a listitem
    // first. Leave the implicit role in place and the ownership chain breaks:
    // the menu is announced with no items in it, which is the quiet way this
    // pattern fails everywhere it is written by hand.
    const wrappers = [];
    items.forEach((item) => {
      const wrap = item.closest("li");
      if (wrap && menu.contains(wrap) && !wrap.hasAttribute("role")) {
        wrap.setAttribute("role", "none");
        wrappers.push(wrap);
      }
      item.setAttribute("role", "menuitem");
      item.tabIndex = -1;
      if (item.tagName === "BUTTON") item.type = "button";
    });

    let open = false;
    const focusAt = (index) => {
      if (!items.length) return;
      const at = (index + items.length) % items.length;
      items[at].focus();
    };

    const show = () => {
      if (open || !items.length) return;
      open = true;
      menu.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      focusAt(0);
      if (prefersReducedMotion()) return;
      menu.animate(
        [
          { opacity: 0, transform: "translateY(-6px) scale(0.97)" },
          { opacity: 1, transform: "none" },
        ],
        { duration, easing: EASE.out },
      );
    };

    const hide = (restore = true) => {
      if (!open) return;
      open = false;
      menu.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
      if (restore) trigger.focus();
    };

    const onTrigger = () => (open ? hide() : show());
    const onTriggerKey = (event) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        show();
        focusAt(event.key === "ArrowDown" ? 0 : items.length - 1);
      }
    };

    const onMenuKey = (event) => {
      const at = items.indexOf(document.activeElement);
      if (event.key === "ArrowDown") { event.preventDefault(); focusAt(at + 1); }
      else if (event.key === "ArrowUp") { event.preventDefault(); focusAt(at - 1); }
      else if (event.key === "Home") { event.preventDefault(); focusAt(0); }
      else if (event.key === "End") { event.preventDefault(); focusAt(items.length - 1); }
      else if (event.key === "Escape") { event.preventDefault(); hide(); }
      else if (event.key === "Tab") {
        // Focus has to leave the menu before the menu leaves the page. Hiding
        // an ancestor of the focused element blurs it and drops focus on
        // `<body>`, so the Tab the browser is about to perform would start
        // again from the top of the document. Putting focus on the trigger
        // first means Tab carries on to whatever follows the menu, which is
        // what a menu is supposed to do.
        trigger.focus();
        hide(false);
      }
      else if (event.key.length === 1 && /\S/.test(event.key)) {
        // Typeahead: the same first letter walks forward through the matches.
        const letter = event.key.toLowerCase();
        const order = items.map((_, i) => items[(at + 1 + i) % items.length]);
        const hit = order.find((item) => item.textContent.trim().toLowerCase().startsWith(letter));
        if (hit) { event.preventDefault(); hit.focus(); }
      }
    };

    const onOutside = (event) => { if (!holder.contains(event.target)) hide(false); };

    trigger.addEventListener("click", onTrigger);
    trigger.addEventListener("keydown", onTriggerKey);
    menu.addEventListener("keydown", onMenuKey);
    document.addEventListener("pointerdown", onOutside);

    cleanups.push(() => {
      trigger.removeEventListener("click", onTrigger);
      trigger.removeEventListener("keydown", onTriggerKey);
      menu.removeEventListener("keydown", onMenuKey);
      document.removeEventListener("pointerdown", onOutside);
      items.forEach((item) => { item.removeAttribute("role"); item.removeAttribute("tabindex"); });
      wrappers.forEach((wrap) => wrap.removeAttribute("role"));
      menu.hidden = false;
      menu.removeAttribute("role");
      if (hadMenuLabel) menu.setAttribute("aria-label", hadMenuLabel);
      else menu.removeAttribute("aria-label");
      menu.classList.remove("rm-user-menu-list");
      trigger.removeAttribute("aria-haspopup");
      trigger.removeAttribute("aria-expanded");
      if (namedTrigger) trigger.removeAttribute("aria-label");
      trigger.classList.remove("rm-user-menu-trigger");
      holder.classList.remove("rm-user-menu");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Which of your accounts is this, and switch it.
 *
 * A `role="listbox"` of accounts rather than a menu, because one of them is
 * always the current answer and `aria-selected` is the attribute that says so.
 * The mark that shows which is current is a single element that slides from
 * the old row to the new one by `translateY` — drawing a tick in each row and
 * fading between two of them loses the one thing the movement was there to
 * explain, which is that the selection went from there to here.
 *
 * Switching is announced politely, because changing account under somebody
 * without telling them is how people post from the wrong one. The trigger's
 * own text is rewritten too: whatever it says on mount is wrapped in a
 * `.rm-account-switcher-face` span so there is one element to rewrite, and the
 * wrapping is undone on teardown. Write that span yourself if you want the
 * name to sit beside an avatar rather than replacing the whole label.
 *
 *   <div data-rm-account-switcher>
 *     <button type="button">Nora Vale</button>
 *     <ul data-rm-account-list><li data-rm-account="nora" aria-selected="true">…</li></ul>
 *   </div>
 */
export function accountSwitcher(target = "[data-rm-account-switcher]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const {
    list: listSelector = "[data-rm-account-list]",
    option: optionSelector = "[data-rm-account]",
    duration = 320,
    label = "Switch account",
  } = options;
  const cleanups = [];

  for (const holder of holders) {
    const trigger = holder.querySelector("button");
    const list = holder.querySelector(listSelector);
    const rows = list ? [...list.querySelectorAll(optionSelector)] : [];
    if (!trigger || !list || !rows.length) continue;

    holder.classList.add("rm-account-switcher");
    trigger.type = "button";
    trigger.classList.add("rm-account-switcher-trigger");
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");

    // The trigger has to say which account is current, so something inside it
    // has to be replaceable text. Rather than making the author remember a
    // class, whatever the button already says is wrapped in one on mount and
    // unwrapped again on teardown. A switcher that moves the mark and
    // announces the change while the button still reads the old name is worse
    // than no switcher, because the visible answer is the wrong one.
    const keptFace = [...trigger.childNodes];
    let face = trigger.querySelector(".rm-account-switcher-face");
    const hadFaceText = face?.textContent ?? "";
    let madeFace = null;
    if (!face) {
      madeFace = document.createElement("span");
      madeFace.className = "rm-account-switcher-face";
      madeFace.append(...keptFace);
      trigger.appendChild(madeFace);
      face = madeFace;
    }

    list.classList.add("rm-account-switcher-list");
    const hadListLabel = list.getAttribute("aria-label");
    list.setAttribute("role", "listbox");
    list.setAttribute("aria-label", dataString(holder, "rmLabel", label));
    list.hidden = true;

    const mark = document.createElement("i");
    mark.className = "rm-account-switcher-mark";
    mark.setAttribute("aria-hidden", "true");
    list.appendChild(mark);

    let current = Math.max(0, rows.findIndex((row) => row.getAttribute("aria-selected") === "true"));
    const said = speaker(holder);

    // What each row said before we started managing the selection, so teardown
    // hands the author's own markup back rather than whichever account happened
    // to be chosen last.
    const hadSelected = rows.map((row) => row.getAttribute("aria-selected"));

    rows.forEach((row, i) => {
      row.classList.add("rm-account-switcher-row");
      row.setAttribute("role", "option");
      row.setAttribute("aria-selected", String(i === current));
      row.tabIndex = i === current ? 0 : -1;
    });

    const placeMark = (animated) => {
      const row = rows[current];
      const from = mark.style.transform;
      mark.style.setProperty("--rm-account-mark-height", `${row.offsetHeight}px`);
      mark.style.transform = `translateY(${row.offsetTop}px)`;
      if (!animated || prefersReducedMotion() || !from) return;
      mark.animate(
        [{ transform: from }, { transform: mark.style.transform }],
        { duration, easing: EASE.out },
      );
    };

    const choose = (index, announce = true) => {
      const at = clamp(index, 0, rows.length - 1);
      rows[current].setAttribute("aria-selected", "false");
      rows[current].tabIndex = -1;
      current = at;
      rows[current].setAttribute("aria-selected", "true");
      rows[current].tabIndex = 0;
      placeMark(true);
      const who = rows[current].textContent.trim();
      if (announce) said.textContent = `Switched to ${who}.`;
      face.textContent = who;
    };

    const show = () => {
      list.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      placeMark(false);
      rows[current].focus();
      if (prefersReducedMotion()) return;
      list.animate(
        [{ opacity: 0, transform: "translateY(-6px)" }, { opacity: 1, transform: "none" }],
        { duration: 200, easing: EASE.out },
      );
    };
    const hide = (restore = true) => {
      list.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
      if (restore) trigger.focus();
    };

    const onTrigger = () => (list.hidden ? show() : hide());
    const onKey = (event) => {
      const at = rows.indexOf(document.activeElement);
      if (event.key === "ArrowDown") { event.preventDefault(); rows[Math.min(rows.length - 1, at + 1)].focus(); }
      else if (event.key === "ArrowUp") { event.preventDefault(); rows[Math.max(0, at - 1)].focus(); }
      else if (event.key === "Home") { event.preventDefault(); rows[0].focus(); }
      else if (event.key === "End") { event.preventDefault(); rows[rows.length - 1].focus(); }
      else if (event.key === "Enter" || event.key === " ") { event.preventDefault(); choose(at); hide(); }
      else if (event.key === "Escape") { event.preventDefault(); hide(); }
    };
    const onClick = (event) => {
      const row = event.target.closest(optionSelector);
      if (!row) return;
      choose(rows.indexOf(row));
      hide();
    };
    const onOutside = (event) => { if (!holder.contains(event.target)) hide(false); };

    trigger.addEventListener("click", onTrigger);
    list.addEventListener("keydown", onKey);
    list.addEventListener("click", onClick);
    document.addEventListener("pointerdown", onOutside);

    cleanups.push(() => {
      trigger.removeEventListener("click", onTrigger);
      list.removeEventListener("keydown", onKey);
      list.removeEventListener("click", onClick);
      document.removeEventListener("pointerdown", onOutside);
      mark.remove();
      said.remove();
      rows.forEach((row, i) => {
        row.classList.remove("rm-account-switcher-row");
        row.removeAttribute("role");
        row.removeAttribute("tabindex");
        if (hadSelected[i]) row.setAttribute("aria-selected", hadSelected[i]);
        else row.removeAttribute("aria-selected");
      });
      list.hidden = false;
      list.removeAttribute("role");
      if (hadListLabel) list.setAttribute("aria-label", hadListLabel);
      else list.removeAttribute("aria-label");
      list.classList.remove("rm-account-switcher-list");
      if (madeFace) trigger.replaceChildren(...keptFace);
      else face.textContent = hadFaceText;
      trigger.removeAttribute("aria-haspopup");
      trigger.removeAttribute("aria-expanded");
      trigger.classList.remove("rm-account-switcher-trigger");
      holder.classList.remove("rm-account-switcher");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A ring that says online, in a word as well as a colour.
 *
 * The ring is a separate layer sitting over the avatar, so the pulse scales
 * the ring and never the face — a status indicator that makes somebody's
 * picture throb is a status indicator you look away from. Only the states that
 * are genuinely live pulse at all; away and offline are still, which is itself
 * information.
 *
 * The word is always rendered. It is visually hidden by default because a ring
 * is a compact thing, but it is real text inside the element, so "Nora Vale,
 * online" is what gets announced rather than "Nora Vale" and a colour nobody
 * mentioned. `data-rm-word="visible"` shows it as a caption.
 *
 *   <span data-rm-presence-ring="online" data-rm-name="Nora Vale">…avatar…</span>
 */
export function presenceRing(target = "[data-rm-presence-ring]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { state = "online", words = {} } = options;
  const WORDS = {
    online: "online", away: "away", busy: "do not disturb", offline: "offline", ...words,
  };
  const LIVE = new Set(["online", "busy"]);
  const cleanups = [];

  for (const holder of holders) {
    const raw = dataString(holder, "rmPresenceRing", state);
    // An unrecognised state falls back rather than becoming a class nobody styled.
    const kind = WORDS[raw] ? raw : state;
    holder.classList.add("rm-presence-ring", `is-${kind}`);

    const ring = document.createElement("i");
    ring.className = "rm-presence-ring-ring";
    ring.setAttribute("aria-hidden", "true");
    const pulse = document.createElement("i");
    pulse.className = "rm-presence-ring-pulse";
    pulse.setAttribute("aria-hidden", "true");

    const word = quietly(`, ${WORDS[kind]}`);
    word.classList.add("rm-presence-ring-word");
    if (dataString(holder, "rmWord", "hidden") === "visible") word.classList.add("is-shown");

    holder.append(ring, pulse, word);
    if (LIVE.has(kind) && !prefersReducedMotion()) holder.classList.add("is-pulsing");

    cleanups.push(() => {
      ring.remove();
      pulse.remove();
      word.remove();
      holder.classList.remove("rm-presence-ring", `is-${kind}`, "is-pulsing");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Follow, following, unfollow: a state machine that speaks.
 *
 * Three labels live in the same grid cell, stacked on top of each other, so
 * the button is as wide as its widest state from the moment it mounts and
 * switching between them moves nothing on the row. The usual implementation
 * swaps `textContent`, and a row of profile cards visibly reflows every time
 * anybody follows anyone.
 *
 * State is carried by `aria-pressed` on a button whose accessible name never
 * changes, which is the pattern screen readers announce correctly. The
 * "Unfollow" that appears when you hover or focus a followed button is purely
 * visual — pressing it is still the same toggle — and the outcome goes out
 * through a polite live region so nobody has to press it twice to find out
 * what it did.
 *
 *   <button type="button" data-rm-follow data-rm-name="Nora Vale">Follow</button>
 */
export function followButton(target = "[data-rm-follow]", options = {}) {
  const buttons = resolveElements(target);
  if (!buttons.length) return () => {};

  const {
    follow = "Follow", following = "Following", unfollow = "Unfollow", name = "this person",
    duration = 260, onChange,
  } = options;
  const cleanups = [];

  for (const button of buttons) {
    const who = dataString(button, "rmName", name);
    const kept = [...button.childNodes];
    button.classList.add("rm-follow-button");
    // What the author had before we borrowed the element, so teardown can put
    // it back. An `<a>` left permanently announced as a button, permanently in
    // the tab order and with no handler behind it lies about itself, which is
    // worse than having no control at all.
    const had = { role: button.getAttribute("role"), tabindex: button.getAttribute("tabindex") };
    if (button.tagName === "BUTTON") button.type = "button";
    else { button.setAttribute("role", "button"); button.tabIndex = 0; }

    const faces = {};
    const stack = document.createElement("span");
    stack.className = "rm-follow-button-stack";
    stack.setAttribute("aria-hidden", "true");
    const words = {
      follow: dataString(button, "rmFollowWord", follow),
      following: dataString(button, "rmFollowingWord", following),
      unfollow: dataString(button, "rmUnfollowWord", unfollow),
    };
    for (const [key, text] of Object.entries(words)) {
      const face = document.createElement("span");
      face.className = `rm-follow-button-face is-${key}`;
      face.textContent = text;
      stack.appendChild(face);
      faces[key] = face;
    }

    button.replaceChildren(stack);
    // The name is the accessible name and it never moves; the state is the
    // attribute. Swapping the name under a focused button is how a screen
    // reader ends up reading a different control than the one being pressed.
    button.setAttribute("aria-label", `${words.follow} ${who}`);
    const said = document.createElement("span");
    said.className = "rm-profile-quiet";
    said.setAttribute("aria-live", "polite");
    button.after(said);

    let on = dataString(button, "rmFollow", "no") === "yes";
    const paint = () => {
      button.setAttribute("aria-pressed", String(on));
      button.classList.toggle("is-following", on);
    };
    paint();

    const toggle = () => {
      on = !on;
      paint();
      said.textContent = on ? `Following ${who}.` : `No longer following ${who}.`;
      onChange?.(on, button);
      if (prefersReducedMotion()) return;
      const arriving = on ? faces.following : faces.follow;
      arriving.animate(
        [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }],
        { duration, easing: EASE.out },
      );
      button.animate(
        [{ transform: "scale(0.96)" }, { transform: "none" }],
        { duration: duration + 120, easing: EASE.spring },
      );
    };

    const onKey = (event) => {
      if (button.tagName === "BUTTON") return;
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); toggle(); }
    };

    button.addEventListener("click", toggle);
    button.addEventListener("keydown", onKey);

    cleanups.push(() => {
      button.removeEventListener("click", toggle);
      button.removeEventListener("keydown", onKey);
      said.remove();
      button.replaceChildren(...kept);
      button.removeAttribute("aria-pressed");
      button.removeAttribute("aria-label");
      if (button.tagName !== "BUTTON") {
        if (had.role) button.setAttribute("role", had.role);
        else button.removeAttribute("role");
        if (had.tabindex) button.setAttribute("tabindex", had.tabindex);
        else button.removeAttribute("tabindex");
      }
      button.classList.remove("rm-follow-button", "is-following");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A bio that opens to whatever height it happens to be.
 *
 * `grid-template-rows` from `0fr` to `1fr` is the one honest way to animate to
 * a height nobody knows in advance: the browser interpolates the track, the
 * text is never clipped at a guessed `max-height`, and the paragraph can be
 * any length at any width. It does move the page below it — that is what a
 * disclosure is for, and it is the one place in this file where something
 * other than a transform changes.
 *
 * While closed the body is `inert`, so a link inside a bio nobody can see is
 * not a focus stop somebody tabs into and gets lost in. `aria-expanded` and
 * `aria-controls` tie the button to the region it opens.
 *
 *   <div data-rm-bio>
 *     <p>Nora Vale records rivers. She has been doing it since 2016.</p>
 *   </div>
 */
export function bioReveal(target = "[data-rm-bio]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const { open: openLabel = "Read full bio", close: closeLabel = "Show less", duration = 420 } = options;
  const cleanups = [];

  for (const holder of holders) {
    const kept = [...holder.childNodes];
    holder.classList.add("rm-bio-reveal");

    const pane = document.createElement("div");
    pane.className = "rm-bio-reveal-window";
    const body = document.createElement("div");
    body.className = "rm-bio-reveal-body";
    body.append(...kept);
    body.id = `rm-bio-${Math.random().toString(36).slice(2, 8)}`;
    pane.appendChild(body);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "rm-bio-reveal-toggle";
    button.textContent = dataString(holder, "rmLabel", openLabel);
    button.setAttribute("aria-controls", body.id);
    button.setAttribute("aria-expanded", "false");

    holder.replaceChildren(pane, button);
    holder.style.setProperty("--rm-bio-duration", `${prefersReducedMotion() ? 0 : duration}ms`);
    body.inert = true;

    let open = false;
    const toggle = () => {
      open = !open;
      holder.classList.toggle("is-open", open);
      body.inert = !open;
      button.setAttribute("aria-expanded", String(open));
      button.textContent = open ? closeLabel : dataString(holder, "rmLabel", openLabel);
      if (prefersReducedMotion() || !open) return;
      body.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration, easing: EASE.out },
      );
    };
    button.addEventListener("click", toggle);

    cleanups.push(() => {
      button.removeEventListener("click", toggle);
      body.inert = false;
      holder.replaceChildren(...kept);
      holder.style.removeProperty("--rm-bio-duration");
      holder.classList.remove("rm-bio-reveal", "is-open");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * Icon links that are not anonymous squares.
 *
 * Every link gets a name built from the network and the person — "Nora Vale on
 * Mastodon" — because a row of icon links with no text is, to anything that
 * reads a page, a row of links called "link". Anything opening in a new tab
 * says so in its own name and gets `rel="noopener noreferrer"`, which is the
 * security half of the same courtesy.
 *
 * The lift happens on focus exactly as it does on hover, so keyboard users see
 * the same feedback rather than none, and the row plays in with a small
 * stagger the first time it is scrolled to.
 *
 *   <ul data-rm-social data-rm-name="Nora Vale">
 *     <li><a href="https://example.org/@nora" data-rm-network="Mastodon"></a></li>
 *   </ul>
 */
export function socialRow(target = "[data-rm-social]", options = {}) {
  const rows = resolveElements(target);
  if (!rows.length) return () => {};

  const { name = "this person", duration = 420, stagger = 60, label = "Elsewhere" } = options;
  const cleanups = [];

  for (const row of rows) {
    const who = dataString(row, "rmName", name);
    const links = [...row.querySelectorAll("a")];
    if (!links.length) continue;

    row.classList.add("rm-social-row");
    row.setAttribute("role", "list");
    row.setAttribute("aria-label", dataString(row, "rmLabel", label));

    const touched = [];
    for (const link of links) {
      const network = dataString(link, "rmNetwork", "the web");
      const away = link.target === "_blank";
      const had = { label: link.getAttribute("aria-label"), rel: link.getAttribute("rel") };
      link.classList.add("rm-social-row-link");
      link.setAttribute(
        "aria-label",
        had.label ?? `${who} on ${network}${away ? " (opens in a new tab)" : ""}`,
      );
      if (away) link.setAttribute("rel", "noopener noreferrer");

      // A given icon is left exactly as the author wrote it. Only an empty
      // link gets a mark, and it is a neutral one — brand glyphs are somebody
      // else's trademark, not ours to ship.
      let mark = null;
      if (!link.childNodes.length) {
        mark = document.createElement("span");
        mark.className = "rm-social-row-mark";
        mark.setAttribute("aria-hidden", "true");
        mark.textContent = initialsFrom(network)[0] ?? "•";
        link.appendChild(mark);
      }
      touched.push({ link, had, mark });
    }

    if (!prefersReducedMotion()) {
      links.forEach((link) => { link.style.opacity = "0"; });
      cleanups.push(watch(row, () => {
        links.forEach((link, i) => {
          link.style.opacity = "";
          link.animate(
            [{ opacity: 0, transform: "translateY(10px) scale(0.9)" }, { opacity: 1, transform: "none" }],
            { duration, delay: i * stagger, easing: EASE.out, fill: "backwards" },
          );
        });
      }, { threshold: 0.3 }));
    }

    cleanups.push(() => {
      touched.forEach(({ link, had, mark }) => {
        mark?.remove();
        link.style.opacity = "";
        if (had.label) link.setAttribute("aria-label", had.label);
        else link.removeAttribute("aria-label");
        if (had.rel) link.setAttribute("rel", had.rel);
        else link.removeAttribute("rel");
        link.classList.remove("rm-social-row-link");
      });
      row.removeAttribute("role");
      row.removeAttribute("aria-label");
      row.classList.remove("rm-social-row");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * Followers and posts, counting up, values never lost.
 *
 * The real figure is put on the stat as an `aria-label` before a single frame
 * runs and the counting digits are `aria-hidden`, so a screen reader hears
 * "12,480 followers" once instead of every intermediate number on the way
 * there. That is the bug in almost every count-up on the web: it is a slot
 * machine wired directly into a live region.
 *
 * The digits are set in tabular figures so the row does not jitter as the
 * numbers change width, the loop is the shared one and it only runs while the
 * row is on screen, and under reduced motion the figures are simply there.
 *
 *   <dl data-rm-stats>
 *     <div><dt>Followers</dt><dd data-rm-stat-value>12480</dd></div>
 *   </dl>
 */
export function statsRow(target = "[data-rm-stats]", options = {}) {
  const rows = resolveElements(target);
  if (!rows.length) return () => {};

  const { value: valueSelector = "[data-rm-stat-value]", duration = 1200, stagger = 120 } = options;
  const cleanups = [];

  for (const row of rows) {
    const cells = [...row.querySelectorAll(valueSelector)];
    if (!cells.length) continue;
    row.classList.add("rm-stats-row");

    const wait = dataNumber(row, "rmDuration", duration);
    const prepared = cells.map((cell, i) => {
      const to = dataNumber(cell, "rmValue", Number(String(cell.textContent).replace(/[^\d.-]/g, "")) || 0);
      const suffix = dataString(cell, "rmSuffix", "");
      // The word beside the figure, so the label reads "12,480 followers"
      // rather than a bare number floating in the accessibility tree.
      const named = dataString(cell, "rmLabel", cell.previousElementSibling?.textContent.trim() ?? "");
      cell.classList.add("rm-stats-row-value");

      const face = document.createElement("span");
      face.className = "rm-stats-row-face";
      // The digits are decoration. The label below carries the real figure.
      face.setAttribute("aria-hidden", "true");
      face.textContent = numbers.format(to) + suffix;
      cell.replaceChildren(face, quietly(`${numbers.format(to)}${suffix}`));
      cell.setAttribute("aria-label", `${numbers.format(to)}${suffix} ${named}`.trim());
      return { cell, face, to, suffix, delay: i * stagger };
    });

    if (!prefersReducedMotion()) {
      prepared.forEach(({ face, to, suffix, delay }) => {
        face.textContent = numbers.format(0) + suffix;
        // Counted once. Scrolling back to a stat that has already arrived must
        // not send it back to zero — the number is a fact, not a loop.
        let counted = false;
        cleanups.push(whileVisible(face, () => {
          if (counted) return () => {};
          let began = 0;
          const stop = onFrame((now) => {
            if (!began) began = now + delay;
            const t = clamp((now - began) / wait, 0, 1);
            const eased = 1 - (1 - t) ** 3;
            face.textContent = numbers.format(Math.round(to * eased)) + suffix;
            if (t >= 1) { counted = true; stop(); }
          });
          return stop;
        }));
      });
    }

    cleanups.push(() => {
      prepared.forEach(({ cell, to, suffix }) => {
        cell.textContent = numbers.format(to) + suffix;
        cell.removeAttribute("aria-label");
        cell.classList.remove("rm-stats-row-value");
      });
      row.classList.remove("rm-stats-row");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * Achievements with titles rather than mystery pictures.
 *
 * Each badge is a real button carrying its own title, so the caption appears on
 * focus exactly as it does on hover and the whole row can be tabbed through.
 * The caption is absolutely positioned, so showing it never pushes the badges
 * around, and it exists in the markup either way — the title is the badge's
 * accessible name whether or not anybody hovers it.
 *
 * Locked badges are desaturated with a filter *and* say "locked" in their
 * name, because grey and colour are the same badge to a good number of people.
 *
 *   <ul data-rm-badges>
 *     <li data-rm-title="Thousand rivers" data-rm-locked="no">🏅</li>
 *   </ul>
 */
export function badgeRow(target = "[data-rm-badges]", options = {}) {
  const rows = resolveElements(target);
  if (!rows.length) return () => {};

  const { duration = 460, stagger = 70, label = "Achievements" } = options;
  const cleanups = [];

  for (const row of rows) {
    const badges = [...row.children];
    if (!badges.length) continue;

    row.classList.add("rm-badge-row");
    row.setAttribute("role", "list");
    row.setAttribute("aria-label", dataString(row, "rmLabel", label));

    const made = badges.map((badge) => {
      const title = dataString(badge, "rmTitle", badge.textContent.trim() || "Badge");
      const locked = dataString(badge, "rmLocked", "no") === "yes";
      badge.classList.add("rm-badge-row-badge");
      badge.setAttribute("role", "listitem");
      if (locked) badge.classList.add("is-locked");

      const mark = document.createElement("button");
      mark.type = "button";
      mark.className = "rm-badge-row-mark";
      mark.append(...badge.childNodes);
      mark.setAttribute("aria-label", locked ? `${title}, locked` : title);

      const caption = document.createElement("span");
      caption.className = "rm-badge-row-caption";
      caption.setAttribute("aria-hidden", "true");
      caption.textContent = title;

      badge.append(mark, caption);
      return { badge, mark, caption };
    });

    if (!prefersReducedMotion()) {
      made.forEach(({ mark }) => { mark.style.opacity = "0"; });
      cleanups.push(watch(row, () => {
        made.forEach(({ mark }, i) => {
          mark.style.opacity = "";
          mark.animate(
            [
              { opacity: 0, transform: "scale(0.6) rotate(-8deg)" },
              { opacity: 1, transform: "none" },
            ],
            { duration, delay: i * stagger, easing: EASE.spring, fill: "backwards" },
          );
        });
      }, { threshold: 0.25 }));
    }

    cleanups.push(() => {
      made.forEach(({ badge, mark, caption }) => {
        badge.append(...mark.childNodes);
        mark.remove();
        caption.remove();
        badge.removeAttribute("role");
        badge.classList.remove("rm-badge-row-badge", "is-locked");
      });
      row.removeAttribute("role");
      row.removeAttribute("aria-label");
      row.classList.remove("rm-badge-row");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * A real tablist over the sections of a profile.
 *
 * The full pattern: `role="tablist"`, one `tabindex="0"` among the tabs and
 * the rest at `-1`, arrows moving both focus and selection, Home and End at
 * the ends, and each panel tied to its tab in both directions. Panels are
 * hidden with the `hidden` property from JavaScript, so with the script gone
 * every section is simply on the page.
 *
 * The underline is one element that translates and scales between tabs rather
 * than a bar whose `left` and `width` are animated. Those two properties are
 * layout, so the browser reflows the whole tab strip on every frame of what
 * looks like a decoration.
 *
 *   <div data-rm-profile-tabs>
 *     <div data-rm-profile-tablist><button data-rm-profile-tab>Posts</button></div>
 *     <section data-rm-profile-panel>…</section>
 *   </div>
 */
export function profileTabs(target = "[data-rm-profile-tabs]", options = {}) {
  const holders = resolveElements(target);
  if (!holders.length) return () => {};

  const {
    list: listSelector = "[data-rm-profile-tablist]",
    tab: tabSelector = "[data-rm-profile-tab]",
    panel: panelSelector = "[data-rm-profile-panel]",
    duration = 380,
    label = "Profile sections",
    base = 100,
  } = options;
  const cleanups = [];

  for (const holder of holders) {
    const list = holder.querySelector(listSelector);
    const tabs = [...holder.querySelectorAll(tabSelector)];
    const panels = [...holder.querySelectorAll(panelSelector)];
    if (!list || tabs.length < 2 || panels.length !== tabs.length) continue;

    holder.classList.add("rm-profile-tabs");
    list.classList.add("rm-profile-tabs-list");
    const hadListLabel = list.getAttribute("aria-label");
    list.setAttribute("role", "tablist");
    list.setAttribute("aria-label", dataString(holder, "rmLabel", label));

    const bar = document.createElement("i");
    bar.className = "rm-profile-tabs-bar";
    bar.setAttribute("aria-hidden", "true");
    bar.style.setProperty("--rm-profile-tabs-base", `${base}px`);
    list.appendChild(bar);

    let current = Math.max(0, tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true"));

    tabs.forEach((tab, i) => {
      if (tab.tagName === "BUTTON") tab.type = "button";
      tab.classList.add("rm-profile-tabs-tab");
      tab.setAttribute("role", "tab");
      if (!tab.id) tab.id = `rm-tab-${Math.random().toString(36).slice(2, 7)}-${i}`;
      const panel = panels[i];
      if (!panel.id) panel.id = `${tab.id}-panel`;
      panel.classList.add("rm-profile-tabs-panel");
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tab.id);
      panel.tabIndex = 0;
      tab.setAttribute("aria-controls", panel.id);
    });

    const placeBar = (animated) => {
      const tab = tabs[current];
      const from = bar.style.transform;
      const x = tab.offsetLeft;
      const scale = (tab.offsetWidth || base) / base;
      bar.style.transform = `translateX(${x}px) scaleX(${scale.toFixed(4)})`;
      if (!animated || prefersReducedMotion() || !from) return;
      bar.animate(
        [{ transform: from }, { transform: bar.style.transform }],
        { duration, easing: EASE.out },
      );
    };

    const select = (index, moveFocus = true) => {
      const at = (index + tabs.length) % tabs.length;
      tabs.forEach((tab, i) => {
        const on = i === at;
        tab.setAttribute("aria-selected", String(on));
        tab.tabIndex = on ? 0 : -1;
        panels[i].hidden = !on;
      });
      const back = at > current;
      current = at;
      placeBar(true);
      if (moveFocus) tabs[at].focus();
      if (prefersReducedMotion()) return;
      panels[at].animate(
        [
          { opacity: 0, transform: `translateX(${back ? 16 : -16}px)` },
          { opacity: 1, transform: "none" },
        ],
        { duration, easing: EASE.out },
      );
    };

    select(current, false);
    placeBar(false);

    const onClick = (event) => {
      const tab = event.target.closest(tabSelector);
      if (tab && tabs.includes(tab)) select(tabs.indexOf(tab));
    };
    const onKey = (event) => {
      const at = tabs.indexOf(document.activeElement);
      if (at < 0) return;
      if (event.key === "ArrowRight") { event.preventDefault(); select(at + 1); }
      else if (event.key === "ArrowLeft") { event.preventDefault(); select(at - 1); }
      else if (event.key === "Home") { event.preventDefault(); select(0); }
      else if (event.key === "End") { event.preventDefault(); select(tabs.length - 1); }
    };
    // The bar is measured, so it has to be re-measured when the strip resizes.
    const sizes = new ResizeObserver(() => placeBar(false));
    sizes.observe(list);

    list.addEventListener("click", onClick);
    list.addEventListener("keydown", onKey);

    cleanups.push(() => {
      sizes.disconnect();
      list.removeEventListener("click", onClick);
      list.removeEventListener("keydown", onKey);
      bar.remove();
      // The wiring goes as well as the roles. `aria-controls` and
      // `aria-labelledby` left pointing at a tablist that no longer exists
      // describe a component the page has not got.
      tabs.forEach((tab) => {
        tab.classList.remove("rm-profile-tabs-tab");
        tab.removeAttribute("role");
        tab.removeAttribute("tabindex");
        tab.removeAttribute("aria-selected");
        tab.removeAttribute("aria-controls");
      });
      panels.forEach((panel) => {
        panel.hidden = false;
        panel.removeAttribute("role");
        panel.removeAttribute("tabindex");
        panel.removeAttribute("aria-labelledby");
        panel.classList.remove("rm-profile-tabs-panel");
      });
      list.removeAttribute("role");
      if (hadListLabel) list.setAttribute("aria-label", hadListLabel);
      else list.removeAttribute("aria-label");
      list.classList.remove("rm-profile-tabs-list");
      holder.classList.remove("rm-profile-tabs");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A cover image with depth and no exposed edge.
 *
 * The image is scaled by precisely the distance it is going to travel before
 * it moves at all, which is the whole trick: a cover that is transformed at
 * its natural size slides a strip of background in at the top or bottom, and
 * every parallax banner that flickers a white line as you scroll past it has
 * forgotten this arithmetic.
 *
 * One shared frame loop, running only while the frame is on screen, reading
 * the box once per frame and writing a `translate3d` — no scroll listener, no
 * layout thrash, and nothing at all attached under reduced motion, where the
 * cover sits still and fully visible.
 *
 *   <div data-rm-cover data-rm-depth="60"><img src="/covers/river.jpg" alt=""></div>
 */
export function coverParallax(target = "[data-rm-cover]", options = {}) {
  const frames = resolveElements(target);
  if (!frames.length) return () => {};

  const { image: imageSelector = "img", depth = 60 } = options;
  const cleanups = [];

  for (const frame of frames) {
    // Nothing is written to the frame until there is an image to move, because
    // a class added before a `continue` is a class no cleanup can ever take off
    // again — and this one carries `overflow: hidden` and a radius.
    const image = frame.querySelector(imageSelector);
    if (!image) continue;
    frame.classList.add("rm-cover-parallax");
    image.classList.add("rm-cover-parallax-image");

    if (prefersReducedMotion()) {
      cleanups.push(() => {
        image.classList.remove("rm-cover-parallax-image");
        frame.classList.remove("rm-cover-parallax");
      });
      continue;
    }

    const travel = Math.abs(dataNumber(frame, "rmDepth", depth));
    const draw = () => {
      const box = frame.getBoundingClientRect();
      const view = window.innerHeight || document.documentElement.clientHeight || 1;
      const through = clamp((box.top + box.height / 2 - view / 2) / view, -1, 1);
      const grow = 1 + (travel * 2) / Math.max(box.height, 1);
      image.style.transform =
        `translate3d(0, ${(-through * travel).toFixed(2)}px, 0) scale(${grow.toFixed(4)})`;
    };
    draw();

    cleanups.push(whileVisible(frame, () => onFrame(draw)));
    cleanups.push(() => {
      image.style.transform = "";
      image.classList.remove("rm-cover-parallax-image");
      frame.classList.remove("rm-cover-parallax");
    });
  }

  return () => cleanups.forEach((stop) => stop?.());
}

/**
 * A compact pill that tells you more when you reach it.
 *
 * The card is absolutely positioned above the chip, inside a wrapper the
 * component adds around it, so revealing it moves nothing in the sentence or
 * table row the chip is sitting in — the version that expands the pill itself
 * reflows every line around it and pushes the thing you were about to click.
 * The wrapper also keeps the card out of the chip's own contents, which is
 * what stops a link's accessible name swelling to the whole card the moment
 * the card is up.
 *
 * It opens on hover and on focus, on the same delay, and Escape closes it: a
 * hovercard that only answers to a pointer is a piece of information keyboard
 * users are simply not given. The card is `aria-describedby` from the chip, so
 * the extra detail is part of the chip's description whether it is on screen
 * or not.
 *
 *   <a data-rm-identity href="/nora" data-rm-name="Nora Vale"
 *      data-rm-handle="@nora" data-rm-note="Field recordist, Lisbon">Nora Vale</a>
 */
export function identityChip(target = "[data-rm-identity]", options = {}) {
  const chips = resolveElements(target);
  if (!chips.length) return () => {};

  const { delay = 180, duration = 220, name = "Unnamed person" } = options;
  const cleanups = [];

  for (const chip of chips) {
    const who = dataString(chip, "rmName", name);
    const handle = dataString(chip, "rmHandle", "");
    const note = dataString(chip, "rmNote", "");
    const kept = [...chip.childNodes];

    chip.classList.add("rm-identity-chip");
    // The card is a sibling of the chip inside a positioned wrapper, never a
    // child of it. The documented chip is an `<a>`, and a link's accessible
    // name is computed from its own contents: put the card inside and the link
    // stops being called "Nora Vale" the instant the card is shown and becomes
    // the whole card, which `aria-describedby` then repeats straight after it.
    // A hidden element referenced directly is still a perfectly good
    // description, so the reference carries on working from outside the link.
    const wrap = document.createElement("span");
    wrap.className = "rm-identity-chip-wrap";
    chip.replaceWith(wrap);
    wrap.append(chip);

    const face = document.createElement("span");
    face.className = "rm-identity-chip-face";
    face.setAttribute("aria-hidden", "true");
    face.textContent = initialsFrom(who);
    face.classList.add(`is-tone-${toneFor(who)}`);
    chip.prepend(face);

    const card = document.createElement("span");
    card.className = "rm-identity-chip-card";
    card.id = `rm-identity-${Math.random().toString(36).slice(2, 8)}`;
    card.hidden = true;
    const line = document.createElement("strong");
    line.textContent = who;
    card.append(line);
    if (handle) {
      const tag = document.createElement("span");
      tag.className = "rm-identity-chip-handle";
      tag.textContent = handle;
      card.append(tag);
    }
    if (note) {
      const said = document.createElement("span");
      said.className = "rm-identity-chip-note";
      said.textContent = note;
      card.append(said);
    }
    wrap.append(card);
    chip.setAttribute("aria-describedby", card.id);

    let timer = 0;
    const show = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        card.hidden = false;
        if (prefersReducedMotion()) return;
        card.animate(
          [
            { opacity: 0, transform: "translateY(6px) scale(0.97)" },
            { opacity: 1, transform: "none" },
          ],
          { duration, easing: EASE.out },
        );
      }, delay);
    };
    const hide = () => { clearTimeout(timer); card.hidden = true; };
    const onKey = (event) => { if (event.key === "Escape") hide(); };

    chip.addEventListener("pointerenter", show);
    chip.addEventListener("pointerleave", hide);
    chip.addEventListener("focus", show);
    chip.addEventListener("blur", hide);
    chip.addEventListener("keydown", onKey);

    cleanups.push(() => {
      clearTimeout(timer);
      chip.removeEventListener("pointerenter", show);
      chip.removeEventListener("pointerleave", hide);
      chip.removeEventListener("focus", show);
      chip.removeEventListener("blur", hide);
      chip.removeEventListener("keydown", onKey);
      card.remove();
      face.remove();
      chip.removeAttribute("aria-describedby");
      chip.replaceChildren(...kept);
      chip.classList.remove("rm-identity-chip");
      wrap.replaceWith(chip);
    });
  }

  return () => cleanups.forEach((stop) => stop());
}
