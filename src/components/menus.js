/**
 * Navigation, the shapes.
 *
 *   • circleNav()   — items that fan out on an arc from their trigger.
 *   • curtainNav()  — a full-screen menu that falls in columns.
 *   • hoverSpread() — a row of links that parts around the pointer.
 *   • breadcrumbs() — a trail that collapses its middle and can open it.
 *   • treeNav()     — a nested tree that opens to its own height.
 *   • splitNav()    — a header that parts to reveal what is behind it.
 *   • stackNav()    — a deck of items that deals itself out.
 *   • dotNav()      — a column of dots that knows which section you are in.
 *
 * `nav.js` has the small indicators and `navbars.js` the large panels; these
 * are the ones with a shape of their own. A menu with an unusual shape is
 * still a menu, so every one of these is built on the semantics first — a real
 * `role="menu"` or `role="tree"`, `aria-expanded` on whatever opens it,
 * `aria-current` on the item you are on — and the shape is applied on top. The
 * order matters: the arc, the curtain and the deck are all things you can take
 * away without breaking anything, which is the test.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

/* eslint-env browser */

import {
  clamp, dataNumber, dataString, EASE, onFrame, prefersReducedMotion, resolveElements,
} from "../core/motion.js";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Make everything except one element unreachable, and give it back.
 *
 * `inert` rather than `aria-hidden`: it takes the subtree out of the tab order
 * as well as out of the accessibility tree, which is the half that a menu
 * built with `aria-hidden` alone always forgets.
 */
function sealPage(except) {
  const sealed = [...document.body.children].filter((node) => node !== except && !node.contains(except));
  sealed.forEach((node) => { node.inert = true; });
  return () => sealed.forEach((node) => { node.inert = false; });
}

/**
 * Items that fan out on an arc from their trigger.
 *
 * The arc is real geometry — each item is placed at its own angle and radius
 * with a transform, so the fan opens from the button rather than a panel
 * appearing beside it. Because it is a transform, nothing around the menu
 * moves while it opens, which is what lets it live inside a toolbar.
 *
 * It is a genuine `role="menu"`: the arrow keys walk the ring in the order the
 * items are written, Escape closes it and focus goes back to the trigger. The
 * shape is decoration on top of a menu, not a replacement for one.
 *
 *   <div data-rm-circle-nav data-rm-radius="120">
 *     <button data-rm-circle-trigger>Menu</button>
 *     <ul><li><a href="#a">One</a></li></ul>
 *   </div>
 */
export function circleNav(target = "[data-rm-circle-nav]", options = {}) {
  const roots = resolveElements(target);
  if (!roots.length) return () => {};

  const {
    radius = 120, from = -90, spread = 180, duration = 420, stagger = 40,
  } = options;
  const cleanups = [];

  for (const root of roots) {
    const trigger = root.querySelector("[data-rm-circle-trigger]") ?? root.querySelector("button");
    const list = root.querySelector("ul, ol, [data-rm-circle-items]");
    if (!trigger || !list) continue;

    const items = [...list.children];
    if (!items.length) continue;

    const arc = dataNumber(root, "rmSpread", spread);
    const start = dataNumber(root, "rmFrom", from);
    const reach = dataNumber(root, "rmRadius", radius);
    const step = items.length > 1 ? arc / (items.length - 1) : 0;

    root.classList.add("rm-circle-nav");
    list.classList.add("rm-circle-nav-items");
    list.setAttribute("role", "menu");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-haspopup", "true");

    const places = items.map((item, i) => {
      const angle = ((start + step * i) * Math.PI) / 180;
      item.classList.add("rm-circle-nav-item");
      item.setAttribute("role", "none");
      const link = item.querySelector("a, button") ?? item;
      link.setAttribute("role", "menuitem");
      link.tabIndex = -1;
      return { item, link, x: Math.cos(angle) * reach, y: Math.sin(angle) * reach };
    });

    // Closed is the start state, and it is applied here rather than in the
    // stylesheet — the page is never mid-animation before the script runs.
    const settle = (open) => {
      places.forEach(({ item, x, y }) => {
        item.style.transform = open
          ? `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`
          : "translate(0px, 0px) scale(0.4)";
        item.style.opacity = open ? "1" : "0";
      });
    };
    settle(false);
    list.hidden = true;

    let open = false;
    let giveBack = null;

    const show = () => {
      if (open) return;
      open = true;
      list.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      root.classList.add("is-open");
      settle(true);

      if (!prefersReducedMotion()) {
        places.forEach(({ item, x, y }, i) => {
          item.animate(
            [
              { transform: "translate(0px, 0px) scale(0.4)", opacity: 0 },
              { transform: `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`, opacity: 1 },
            ],
            { duration, delay: i * stagger, easing: EASE.out, fill: "backwards" },
          );
        });
      }

      places[0].link.focus?.();
      giveBack = sealPage(root);
    };

    const hide = (restore = true) => {
      if (!open) return;
      open = false;
      trigger.setAttribute("aria-expanded", "false");
      root.classList.remove("is-open");
      giveBack?.();
      giveBack = null;

      const done = () => { list.hidden = true; settle(false); };
      if (prefersReducedMotion()) done();
      else {
        let waiting = places.length;
        const land = () => { if (--waiting === 0) done(); };
        places.forEach(({ item, x, y }, i) => {
          const back = item.animate(
            [
              { transform: `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`, opacity: 1 },
              { transform: "translate(0px, 0px) scale(0.4)", opacity: 0 },
            ],
            {
              duration: duration * 0.7,
              delay: (places.length - 1 - i) * (stagger / 2),
              easing: EASE.inOut,
              fill: "forwards",
            },
          );
          back.finished.then(land, land);
        });
      }
      if (restore) trigger.focus();
    };

    const onTrigger = () => (open ? hide() : show());
    const onKey = (event) => {
      if (!open) return;
      if (event.key === "Escape") { event.preventDefault(); hide(); return; }
      const at = places.findIndex(({ link }) => link === document.activeElement);
      if (at < 0) return;
      const move = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
      if (!move) return;
      event.preventDefault();
      places[(at + move + places.length) % places.length].link.focus();
    };
    const onOutside = (event) => { if (open && !root.contains(event.target)) hide(false); };

    trigger.addEventListener("click", onTrigger);
    root.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onOutside);

    cleanups.push(() => {
      trigger.removeEventListener("click", onTrigger);
      root.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onOutside);
      giveBack?.();
      list.hidden = false;
      places.forEach(({ item, link }) => {
        item.style.transform = "";
        item.style.opacity = "";
        item.classList.remove("rm-circle-nav-item");
        link.tabIndex = 0;
      });
      root.classList.remove("rm-circle-nav", "is-open");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A full-screen menu that falls in columns.
 *
 * Each column is revealed with its own `clip-path` inset rather than by moving
 * a panel, so the links inside never travel — the covering falls away from
 * text that was always exactly where it will end up. Text that slides into
 * place is text you cannot read while it arrives.
 *
 * Focus goes to the first link, the rest of the page goes `inert`, Escape
 * closes it and focus returns to the button that opened it.
 *
 *   <button data-rm-curtain-trigger="site-menu">Menu</button>
 *   <div id="site-menu" data-rm-curtain-nav>
 *     <div data-rm-curtain-column>…</div>
 *   </div>
 */
export function curtainNav(target = "[data-rm-curtain-nav]", options = {}) {
  const panels = resolveElements(target);
  if (!panels.length) return () => {};

  const { duration = 620, stagger = 90 } = options;
  const cleanups = [];

  for (const panel of panels) {
    const id = panel.id;
    const triggers = id ? [...document.querySelectorAll(`[data-rm-curtain-trigger="${id}"]`)] : [];
    if (!triggers.length) continue;

    const columns = [...panel.querySelectorAll("[data-rm-curtain-column]")];
    const parts = columns.length ? columns : [panel];

    panel.classList.add("rm-curtain-nav");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.hidden = true;
    triggers.forEach((one) => {
      one.setAttribute("aria-expanded", "false");
      one.setAttribute("aria-controls", id);
    });

    let open = false;
    let opener = null;
    let giveBack = null;

    const show = (button) => {
      if (open) return;
      open = true;
      opener = button;
      panel.hidden = false;
      panel.classList.add("is-open");
      triggers.forEach((one) => one.setAttribute("aria-expanded", "true"));

      if (!prefersReducedMotion()) {
        parts.forEach((part, i) => {
          part.animate(
            [{ clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)" }],
            { duration, delay: i * stagger, easing: EASE.out, fill: "backwards" },
          );
        });
      }

      (panel.querySelector(FOCUSABLE) ?? panel).focus?.();
      giveBack = sealPage(panel);
    };

    const hide = () => {
      if (!open) return;
      open = false;
      panel.classList.remove("is-open");
      triggers.forEach((one) => one.setAttribute("aria-expanded", "false"));
      giveBack?.();
      giveBack = null;

      const done = () => { panel.hidden = true; };
      if (prefersReducedMotion()) done();
      else {
        let waiting = parts.length;
        const land = () => { if (--waiting === 0) done(); };
        parts.forEach((part, i) => {
          const away = part.animate(
            [{ clipPath: "inset(0 0 0% 0)" }, { clipPath: "inset(100% 0 0 0)" }],
            {
              duration: duration * 0.66,
              delay: (parts.length - 1 - i) * (stagger / 2),
              easing: EASE.inOut,
              fill: "forwards",
            },
          );
          away.finished.then(land, land);
        });
      }
      opener?.focus();
      opener = null;
    };

    const onKey = (event) => {
      if (!open) return;
      if (event.key === "Escape") { event.preventDefault(); hide(); return; }
      if (event.key !== "Tab") return;
      // A dialog that lets Tab out is a dialog in name only.
      const stops = [...panel.querySelectorAll(FOCUSABLE)];
      if (!stops.length) return;
      const first = stops[0];
      const last = stops[stops.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };

    const wired = triggers.map((one) => {
      const go = () => (open ? hide() : show(one));
      one.addEventListener("click", go);
      return () => one.removeEventListener("click", go);
    });
    document.addEventListener("keydown", onKey);

    cleanups.push(() => {
      wired.forEach((stop) => stop());
      document.removeEventListener("keydown", onKey);
      giveBack?.();
      panel.hidden = false;
      panel.classList.remove("rm-curtain-nav", "is-open");
      panel.removeAttribute("role");
      panel.removeAttribute("aria-modal");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A row of links that parts around the pointer.
 *
 * Every item is pushed away from the pointer by a falling-off amount, so the
 * one you are heading for opens up before you reach it. It is the dock idea
 * applied to text, and it is done with `translate` on one shared frame
 * callback — never with margin, which would reflow the row sixty times a
 * second and drag the rest of the header along with it.
 *
 * Keyboard focus produces the same spread, so the effect is not something only
 * a mouse user is told about.
 *
 *   <nav data-rm-hover-spread><a href="#">Work</a><a href="#">About</a></nav>
 */
export function hoverSpread(target = "[data-rm-hover-spread]", options = {}) {
  const rows = resolveElements(target);
  if (!rows.length) return () => {};

  const { push = 14, reach = 150, selector = "a, button" } = options;
  const cleanups = [];

  for (const row of rows) {
    const items = [...row.querySelectorAll(selector)];
    if (items.length < 2) continue;

    row.classList.add("rm-hover-spread");
    if (prefersReducedMotion()) {
      cleanups.push(() => row.classList.remove("rm-hover-spread"));
      continue;
    }

    const strength = dataNumber(row, "rmPush", push);
    const range = dataNumber(row, "rmReach", reach);

    let pointer = null;
    let centres = [];
    let dirty = true;
    let resting = true;

    const measure = () => {
      centres = items.map((item) => {
        const box = item.getBoundingClientRect();
        return box.left + box.width / 2;
      });
      dirty = false;
    };

    const stop = onFrame(() => {
      if (pointer === null) {
        if (resting) return;
        items.forEach((item) => { item.style.transform = ""; });
        resting = true;
        return;
      }
      if (dirty) measure();
      resting = false;
      items.forEach((item, i) => {
        const away = centres[i] - pointer;
        const near = clamp(1 - Math.abs(away) / range, 0, 1);
        // Squared, so the falloff is a curve rather than a cone.
        const shove = Math.sign(away) * near * near * strength;
        item.style.transform = `translateX(${shove.toFixed(2)}px)`;
      });
    });

    const onMove = (event) => { pointer = event.clientX; };
    const onLeave = () => { pointer = null; };
    const onFocus = (event) => {
      const box = event.target.getBoundingClientRect();
      pointer = box.left + box.width / 2;
    };
    const onResize = () => { dirty = true; };

    row.addEventListener("pointermove", onMove);
    row.addEventListener("pointerleave", onLeave);
    row.addEventListener("focusin", onFocus);
    row.addEventListener("focusout", onLeave);
    window.addEventListener("resize", onResize);

    cleanups.push(() => {
      stop();
      row.removeEventListener("pointermove", onMove);
      row.removeEventListener("pointerleave", onLeave);
      row.removeEventListener("focusin", onFocus);
      row.removeEventListener("focusout", onLeave);
      window.removeEventListener("resize", onResize);
      items.forEach((item) => { item.style.transform = ""; });
      row.classList.remove("rm-hover-spread");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A trail that collapses its middle and can open it.
 *
 * Long trails are usually solved by truncating with CSS, which hides where you
 * have been without offering it back. This collapses the middle behind a real
 * button instead, and expanding it is a FLIP — the crumbs that stay put do not
 * move, so the eye keeps its place while the row grows.
 *
 * The last crumb carries `aria-current="page"`, which is the part of a
 * breadcrumb that actually does something.
 *
 *   <nav data-rm-breadcrumbs data-rm-keep="1"><ol><li><a href="/">Home</a></li></ol></nav>
 */
export function breadcrumbs(target = "[data-rm-breadcrumbs]", options = {}) {
  const trails = resolveElements(target);
  if (!trails.length) return () => {};

  const { keep = 1, max = 4, label = "Breadcrumb", duration = 380 } = options;
  const cleanups = [];

  for (const trail of trails) {
    const list = trail.querySelector("ol, ul");
    if (!list) continue;
    const crumbs = [...list.children];
    if (!crumbs.length) continue;

    trail.classList.add("rm-breadcrumbs");
    if (trail.tagName === "NAV") trail.setAttribute("aria-label", dataString(trail, "rmLabel", label));

    const last = crumbs[crumbs.length - 1];
    const here = last.querySelector("a") ?? last;
    here.setAttribute("aria-current", "page");

    const front = Math.max(1, dataNumber(trail, "rmKeep", keep));
    const limit = Math.max(2, dataNumber(trail, "rmMax", max));
    const folded = crumbs.slice(front, crumbs.length - 1);

    if (crumbs.length <= limit || !folded.length) {
      cleanups.push(() => {
        here.removeAttribute("aria-current");
        trail.classList.remove("rm-breadcrumbs");
      });
      continue;
    }

    const more = document.createElement("li");
    more.className = "rm-breadcrumbs-more";
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "…";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", `Show ${folded.length} hidden step${folded.length === 1 ? "" : "s"}`);
    more.appendChild(button);
    folded[0].before(more);
    folded.forEach((crumb) => { crumb.hidden = true; });

    const expand = () => {
      // FLIP: read where the crumbs that stay are, change the DOM, then put
      // them back where they were and let them travel.
      const staying = crumbs.filter((crumb) => !crumb.hidden);
      const before = staying.map((crumb) => crumb.getBoundingClientRect().left);

      folded.forEach((crumb) => { crumb.hidden = false; });
      button.setAttribute("aria-expanded", "true");
      more.remove();

      if (!prefersReducedMotion()) {
        staying.forEach((crumb, i) => {
          const shift = before[i] - crumb.getBoundingClientRect().left;
          if (!shift) return;
          crumb.animate(
            [{ transform: `translateX(${shift.toFixed(2)}px)` }, { transform: "none" }],
            { duration, easing: EASE.out },
          );
        });
        folded.forEach((crumb, i) => {
          crumb.animate(
            [{ opacity: 0, transform: "translateY(-6px)" }, { opacity: 1, transform: "none" }],
            { duration, delay: i * 50, easing: EASE.out, fill: "backwards" },
          );
        });
      }
      (folded[0].querySelector("a, button") ?? folded[0]).focus?.();
    };

    button.addEventListener("click", expand);

    cleanups.push(() => {
      button.removeEventListener("click", expand);
      more.remove();
      folded.forEach((crumb) => { crumb.hidden = false; });
      here.removeAttribute("aria-current");
      trail.classList.remove("rm-breadcrumbs");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A nested tree that opens to its own height.
 *
 * The height is animated with `grid-template-rows: 0fr → 1fr`, so a branch
 * opens to exactly the height of what is inside it without anyone measuring
 * anything — no `scrollHeight` read, no stale height when the content changes,
 * no jump at the end.
 *
 * It is a real `role="tree"` with a roving tabindex: one tab stop for the whole
 * tree, arrow keys to walk it, Right to open a branch and Left to close it —
 * which is what a keyboard user expects from anything shaped like this.
 *
 *   <ul data-rm-tree>
 *     <li><button>Components</button><ul><li><a href="#">reveal</a></li></ul></li>
 *   </ul>
 */
export function treeNav(target = "[data-rm-tree]", options = {}) {
  const trees = resolveElements(target);
  if (!trees.length) return () => {};

  const { duration = 320, label = "Tree" } = options;
  const cleanups = [];

  for (const tree of trees) {
    const rows = [...tree.querySelectorAll("li")];
    if (!rows.length) continue;

    tree.classList.add("rm-tree");
    tree.setAttribute("role", "tree");
    tree.setAttribute("aria-label", dataString(tree, "rmLabel", label));
    tree.style.setProperty("--rm-tree-duration", `${prefersReducedMotion() ? 0 : duration}ms`);

    const stops = [];
    const shells = [];

    for (const row of rows) {
      row.setAttribute("role", "treeitem");
      const branch = row.querySelector(":scope > ul, :scope > ol");
      const handle = row.querySelector(":scope > button, :scope > a") ?? row;
      handle.tabIndex = -1;
      stops.push({ row, handle });

      if (!branch) continue;
      branch.setAttribute("role", "group");
      const shell = document.createElement("div");
      shell.className = "rm-tree-shell";
      branch.before(shell);
      shell.appendChild(branch);
      shells.push({ shell, branch });
      row.classList.add("rm-tree-branch");
      row.setAttribute("aria-expanded", "false");
      if (handle !== row) handle.setAttribute("aria-expanded", "false");
    }

    stops[0].handle.tabIndex = 0;

    const setOpen = (row, open) => {
      row.classList.toggle("is-open", open);
      row.setAttribute("aria-expanded", String(open));
      row.querySelector(":scope > button, :scope > a")?.setAttribute("aria-expanded", String(open));
    };

    // Only the rows whose every ancestor branch is open can be walked to.
    const visible = () => stops.filter(({ row }) => {
      let parent = row.parentElement?.closest("li");
      while (parent && tree.contains(parent)) {
        if (parent.classList.contains("rm-tree-branch") && !parent.classList.contains("is-open")) return false;
        parent = parent.parentElement?.closest("li");
      }
      return true;
    });

    const focusAt = (list, index) => {
      const next = list[clamp(index, 0, list.length - 1)];
      if (!next) return;
      stops.forEach(({ handle }) => { handle.tabIndex = -1; });
      next.handle.tabIndex = 0;
      next.handle.focus();
    };

    const onClick = (event) => {
      const row = event.target.closest("li.rm-tree-branch");
      if (!row || !tree.contains(row)) return;
      const handle = row.querySelector(":scope > button, :scope > a");
      if (!handle || !handle.contains(event.target)) return;
      if (handle.tagName === "BUTTON") event.preventDefault();
      setOpen(row, !row.classList.contains("is-open"));
    };

    const onKey = (event) => {
      const list = visible();
      const at = list.findIndex(({ handle }) => handle === document.activeElement);
      if (at < 0) return;
      const { row } = list[at];
      const isBranch = row.classList.contains("rm-tree-branch");
      const isOpen = row.classList.contains("is-open");

      if (event.key === "ArrowDown") { event.preventDefault(); focusAt(list, at + 1); }
      else if (event.key === "ArrowUp") { event.preventDefault(); focusAt(list, at - 1); }
      else if (event.key === "Home") { event.preventDefault(); focusAt(list, 0); }
      else if (event.key === "End") { event.preventDefault(); focusAt(list, list.length - 1); }
      else if (event.key === "ArrowRight") {
        event.preventDefault();
        if (isBranch && !isOpen) setOpen(row, true);
        else focusAt(visible(), at + 1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        if (isBranch && isOpen) setOpen(row, false);
        else {
          const parent = row.parentElement?.closest("li");
          const back = list.findIndex((one) => one.row === parent);
          if (back >= 0) focusAt(list, back);
        }
      }
    };

    tree.addEventListener("click", onClick);
    tree.addEventListener("keydown", onKey);

    cleanups.push(() => {
      tree.removeEventListener("click", onClick);
      tree.removeEventListener("keydown", onKey);
      shells.forEach(({ shell, branch }) => { shell.before(branch); shell.remove(); });
      stops.forEach(({ row, handle }) => {
        row.classList.remove("rm-tree-branch", "is-open");
        row.removeAttribute("role");
        row.removeAttribute("aria-expanded");
        handle.tabIndex = 0;
      });
      tree.classList.remove("rm-tree");
      tree.removeAttribute("role");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A header that parts to reveal what is behind it.
 *
 * The two halves of the bar slide apart on `translate` and the menu underneath
 * is uncovered — nothing fades, so the header text stays legible for the whole
 * movement. Both halves move by the same amount in opposite directions, which
 * is one number rather than two sets of keyframes.
 *
 * What is behind is `inert` while it is covered, so it cannot be tabbed into
 * from a header that is still closed.
 *
 *   <div data-rm-split-nav>
 *     <div data-rm-split-back>…</div>
 *     <div data-rm-split-half>…</div>
 *     <div data-rm-split-half>…</div>
 *     <button data-rm-split-trigger>Menu</button>
 *   </div>
 */
export function splitNav(target = "[data-rm-split-nav]", options = {}) {
  const bars = resolveElements(target);
  if (!bars.length) return () => {};

  const { duration = 560, travel = 100 } = options;
  const cleanups = [];

  for (const bar of bars) {
    const halves = [...bar.querySelectorAll("[data-rm-split-half]")];
    const trigger = bar.querySelector("[data-rm-split-trigger]");
    const behind = bar.querySelector("[data-rm-split-back]");
    if (halves.length !== 2 || !trigger) continue;

    const far = dataNumber(bar, "rmTravel", travel);
    bar.classList.add("rm-split-nav");
    trigger.setAttribute("aria-expanded", "false");
    if (behind) {
      behind.classList.add("rm-split-nav-back");
      behind.inert = true;
    }

    let open = false;
    let at = 0;

    const move = (to) => {
      halves.forEach((half, i) => {
        const was = `translateX(${((i === 0 ? -1 : 1) * at).toFixed(2)}%)`;
        const now = `translateX(${((i === 0 ? -1 : 1) * to).toFixed(2)}%)`;
        if (!prefersReducedMotion()) {
          half.animate([{ transform: was }, { transform: now }], {
            duration, easing: EASE.inOut, fill: "forwards",
          });
        }
        half.style.transform = now;
      });
      at = to;
    };
    move(0);

    const toggle = () => {
      open = !open;
      bar.classList.toggle("is-open", open);
      trigger.setAttribute("aria-expanded", String(open));
      if (behind) behind.inert = !open;
      move(open ? far : 0);
      if (open) (behind?.querySelector(FOCUSABLE) ?? trigger).focus?.();
    };

    const onKey = (event) => {
      if (event.key === "Escape" && open) { event.preventDefault(); toggle(); trigger.focus(); }
    };

    trigger.addEventListener("click", toggle);
    bar.addEventListener("keydown", onKey);

    cleanups.push(() => {
      trigger.removeEventListener("click", toggle);
      bar.removeEventListener("keydown", onKey);
      halves.forEach((half) => { half.style.transform = ""; });
      if (behind) { behind.inert = false; behind.classList.remove("rm-split-nav-back"); }
      bar.classList.remove("rm-split-nav", "is-open");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A deck of items that deals itself out.
 *
 * Closed, the items sit on top of each other with a little offset and rotation
 * — a deck. Open, they deal down into a list. Every state is a transform on
 * items that are always in the flow at their final positions, so the closed
 * deck is an arrangement of the real list rather than a different DOM.
 *
 * The links are taken out of the tab order while the deck is shut, because a
 * pile of stacked items is not somewhere a keyboard should land.
 *
 *   <div data-rm-stack-nav>
 *     <button data-rm-stack-trigger>Links</button>
 *     <ul><li><a href="#">One</a></li></ul>
 *   </div>
 */
export function stackNav(target = "[data-rm-stack-nav]", options = {}) {
  const decks = resolveElements(target);
  if (!decks.length) return () => {};

  const { duration = 520, stagger = 60, lift = 8, tilt = 3 } = options;
  const cleanups = [];

  for (const deck of decks) {
    const trigger = deck.querySelector("[data-rm-stack-trigger]") ?? deck.querySelector("button");
    const list = deck.querySelector("ul, ol");
    if (!trigger || !list) continue;
    const items = [...list.children];
    if (!items.length) continue;

    deck.classList.add("rm-stack-nav");
    list.classList.add("rm-stack-nav-items");
    trigger.setAttribute("aria-expanded", "false");

    // Measured once, off the layout the browser has already done.
    const cards = items.map((item, i) => {
      item.classList.add("rm-stack-nav-item");
      const offset = item.offsetTop - items[0].offsetTop;
      return { item, shut: `translateY(${(i * lift - offset).toFixed(2)}px) rotate(${(i ? (i % 2 ? tilt : -tilt) : 0)}deg)` };
    });

    const reach = (open) => {
      items.forEach((item) => {
        const link = item.querySelector("a, button");
        if (link) link.tabIndex = open ? 0 : -1;
      });
      list.setAttribute("aria-hidden", String(!open));
    };

    // Paint order runs down the DOM, so a pile would show its last card on
    // top. Reversed while it is shut, cleared once it is dealt.
    const pile = (on) => cards.forEach(({ item }, i) => {
      item.style.zIndex = on ? String(cards.length - i) : "";
    });

    cards.forEach(({ item, shut }) => { item.style.transform = shut; });
    pile(true);
    reach(false);

    let open = false;
    const toggle = () => {
      open = !open;
      deck.classList.toggle("is-open", open);
      trigger.setAttribute("aria-expanded", String(open));
      pile(!open);
      reach(open);

      cards.forEach(({ item, shut }, i) => {
        item.style.transform = open ? "none" : shut;
        if (prefersReducedMotion()) return;
        item.animate(
          open ? [{ transform: shut }, { transform: "none" }] : [{ transform: "none" }, { transform: shut }],
          {
            duration,
            delay: (open ? i : cards.length - 1 - i) * stagger,
            easing: EASE.out,
            fill: "backwards",
          },
        );
      });
    };

    trigger.addEventListener("click", toggle);

    cleanups.push(() => {
      trigger.removeEventListener("click", toggle);
      cards.forEach(({ item }) => {
        item.style.transform = "";
        item.style.zIndex = "";
        item.classList.remove("rm-stack-nav-item");
        const link = item.querySelector("a, button");
        if (link) link.tabIndex = 0;
      });
      list.removeAttribute("aria-hidden");
      list.classList.remove("rm-stack-nav-items");
      deck.classList.remove("rm-stack-nav", "is-open");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}

/**
 * A column of dots that knows which section you are in.
 *
 * One `IntersectionObserver` over the sections rather than a scroll handler
 * measuring all of them every frame, and the label beside each dot is real
 * text — shown on hover and on focus, and always available to a screen reader.
 * `aria-current` marks the section you are in, so the state is not carried by
 * the size of a dot alone.
 *
 *   <nav data-rm-dot-nav>
 *     <a href="#intro" data-rm-dot-label="Intro"></a>
 *   </nav>
 */
export function dotNav(target = "[data-rm-dot-nav]", options = {}) {
  const navs = resolveElements(target);
  if (!navs.length) return () => {};

  const { label = "Sections", threshold = 0.5 } = options;
  const cleanups = [];

  for (const nav of navs) {
    const links = [...nav.querySelectorAll('a[href^="#"]')];
    if (!links.length) continue;

    nav.classList.add("rm-dot-nav");
    if (nav.tagName === "NAV") nav.setAttribute("aria-label", dataString(nav, "rmLabel", label));

    const marks = links.map((link) => {
      link.classList.add("rm-dot-nav-link");
      const name = link.getAttribute("data-rm-dot-label") ?? link.textContent.trim();
      link.textContent = "";

      const dot = document.createElement("i");
      dot.className = "rm-dot-nav-dot";
      dot.setAttribute("aria-hidden", "true");
      const text = document.createElement("span");
      text.className = "rm-dot-nav-text";
      text.textContent = name;
      link.append(dot, text);

      return { link, section: document.querySelector(link.getAttribute("href")) };
    }).filter(({ section }) => section);

    if (!marks.length) {
      cleanups.push(() => nav.classList.remove("rm-dot-nav"));
      continue;
    }

    const mark = (which) => {
      marks.forEach(({ link }) => {
        const on = link === which;
        link.classList.toggle("is-current", on);
        if (on) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    };

    const seen = new Map();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => seen.set(entry.target, entry.intersectionRatio));
      let best = null;
      let most = 0;
      marks.forEach(({ link, section }) => {
        const ratio = seen.get(section) ?? 0;
        if (ratio > most) { most = ratio; best = link; }
      });
      if (best) mark(best);
    }, { threshold: [0, threshold, 1] });

    marks.forEach(({ section }) => observer.observe(section));

    cleanups.push(() => {
      observer.disconnect();
      marks.forEach(({ link }) => {
        link.classList.remove("rm-dot-nav-link", "is-current");
        link.removeAttribute("aria-current");
      });
      nav.classList.remove("rm-dot-nav");
    });
  }

  return () => cleanups.forEach((stop) => stop());
}
