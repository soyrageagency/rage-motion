<div align="center">

<a href="https://soyrage.es/">
  <img src="https://raw.githubusercontent.com/soyrageagency/rage-motion/main/assets/soyrage-banner.svg" alt="SoyRage Agency — Full-Stack Developer × Infrastructure Engineer · soyrage.es" width="100%">
</a>

<br/>

# ✦ rage-motion

<a href="https://soyrage.es/">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/soyrageagency/rage-motion/main/assets/soyrage-mark-dark.svg">
    <img src="https://raw.githubusercontent.com/soyrageagency/rage-motion/main/assets/soyrage-mark.svg" alt="SoyRage Agency" width="64">
  </picture>
</a>

**Award-grade motion for the web, with zero dependencies.** 127 animation components with actual technique behind them — variable-font pressure, word morphing with a real FLIP, draggable carousels built on native scrolling, liquid navigation, generative fields, page transitions. Take one file, or install the lot.

*"A headline that reacts to the cursor." · "A carousel that works with a keyboard." · "A menu that traps focus properly." · "A counter that rolls like an odometer."*

<br/>

<img src="https://raw.githubusercontent.com/soyrageagency/rage-motion/main/assets/hero.png" alt="The rage-motion demo — a hero headline whose variable-font weight follows the pointer, over a generative wave field" width="88%">

<sub>🎛️ The live demo is the documentation: every component running, with the markup to copy. <a href="https://soyrageagency.github.io/rage-motion/">Open it ↗</a></sub>

<br/><br/>

[![CI](https://github.com/soyrageagency/rage-motion/actions/workflows/ci.yml/badge.svg)](https://github.com/soyrageagency/rage-motion/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@soyrageagency/rage-motion?logo=npm&color=CB3837)](https://www.npmjs.com/package/@soyrageagency/rage-motion)
[![Dependencies](https://img.shields.io/badge/dependencies-0-2aa7e4)](https://github.com/soyrageagency/rage-motion/blob/main/package.json)
[![Node](https://img.shields.io/badge/Node-%3E%3D18-3c873a?logo=node.js&logoColor=white)](https://nodejs.org)
[![MCP](https://img.shields.io/badge/MCP-server%20included-6E56CF)](https://github.com/soyrageagency/rage-motion/tree/main/mcp)
[![Reduced motion](https://img.shields.io/badge/prefers--reduced--motion-honoured-2aa7e4)](#the-three-rules)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](https://github.com/soyrageagency/rage-motion/blob/main/LICENSE)

### Designed, built & maintained by **[SoyRage Agency](https://soyrage.es/)** · **https://soyrage.es/**

**⚡ New here? → [See it running](https://soyrageagency.github.io/rage-motion/) · [Install](#install) · [Teach it to your AI](#-teach-it-to-your-ai)**

</div>

> 🤖 There is a **[Model Context Protocol server](https://github.com/soyrageagency/rage-motion/tree/main/mcp)** in this repo. Connect it and Claude, Cursor or Zed will reach for *these* components instead of improvising a scroll listener.

---

## ✨ What makes it different

| | | |
| :--: | --- | --- |
| 🪶 | **Zero dependencies, permanently** | Web Animations API, IntersectionObserver, CSS. Nothing else, and nothing new later — the day this package has a non-empty `dependencies` it stops being what it is. |
| 👁️ | **It never hides your content** | The starting state is written from JavaScript, never from the stylesheet. If a script fails to load, the page arrives un-animated rather than blank — which is the failure mode of every `.fade { opacity: 0 }` reveal on the web. |
| ♿ | **`prefers-reduced-motion` for real** | Each component ends in its finished state instead of being switched off. No blanket `* { animation: none }`, because that leaves invisible everything whose visible state *is* the end of an animation. |
| 🧩 | **One file at a time** | Every component depends only on `core/motion.js`. Copy the two into your project and you are done. That is how most people will use this, and it is designed for it. |
| 🤖 | **Your AI can read it** | An MCP server that serves the real source, markup and tokens, so an assistant stops writing the same generic snippet it has written ten thousand times. |

See the [**roadmap**](https://github.com/soyrageagency/rage-motion/blob/main/ROADMAP.md) for what comes next.

---

## The three rules

Every component in the kit holds to these. They are not settings — they are the architecture.

1. **The start state comes from JavaScript, never CSS.** No script, no animation, but the content is still there.
2. **Only `transform` and `opacity` move.** No effect in this library can cause layout shift. Nothing animates `top`, `left`, `width` or `margin`.
3. **One scroll read per frame, shared.** Every scroll-driven component subscribes to a single cached position. Four effects cost one layout read, not four.

---

## Install

```bash
npm i @soyrageagency/rage-motion
```

```js
import { init } from "@soyrageagency/rage-motion";
import "@soyrageagency/rage-motion/css";

init();   // starts everything driven by markup attributes
```

No build step, straight from a folder or a CDN:

```html
<link rel="stylesheet" href="/vendor/rage-motion.css">
<script type="module">
  import { init } from "/vendor/rage-motion/index.js";
  init();
</script>
```

**Or take one file.** Each component imports only `src/core/motion.js`. Copy both and go.

---

## Use it

Most of the kit is driven from the markup, with no JavaScript at the call site:

```html
<div data-rm-reveal="up" data-rm-delay="120">Enters as you scroll</div>

<h1 data-rm-pressure>Variable-font weight follows the pointer</h1>

<span data-rm-morph="Design|Motion|Craft"></span>

<strong data-rm-odometer>128,400</strong>

<div data-rm-carousel>
  <article>…</article><article>…</article>
</div>

<nav data-rm-pill>
  <a href="/" aria-current="page">Work</a><a href="/about">About</a>
</nav>
```

And when you want control, every component is a function that returns its own `stop`:

```js
import { cursor, waves, pageTransition } from "@soyrageagency/rage-motion";

const stop = cursor({ blend: "difference" });
waves("#hero", { lines: 22 });
pageTransition({ duration: 520 });

stop();   // puts everything back exactly as it was
```

---

## The 127 components

**Entrances** — `reveal`, with **50 named start states**: up · down · left · right and their `-far` variants · glide · fade · scale · zoom · shrink · pop · rise · drop · spring-up · spring-left · blur · blur-only · blur-up · blur-scale · drift-left · drift-right · tilt-left · tilt-right · roll-left · roll-right · swing · twist · spin · skew-x · skew-y · flip-x · flip-y · unfold · fold-up · door · door-right · corner · lift-3d · curtain-up · curtain-down · curtain-left · curtain-right · iris · wipe-diagonal · mask · slat · none

**Text** — `textReveal` · `decrypt` · `glitch` · `shiny` · `countUp` · `outline` · `rollText` · `countdown` · `split`

**Typography with technique** — `pressure` · `morph` · `curve` · `odometer` · `highlight`

**Showpiece** — `typewriter` · `waveText` · `magnetLines` · `ripple`

**Cursors** — `cursor` · `target` · `crosshair` · `splash` · `magnetic`

**Cards** — `spotlight` · `tilt` · `border` · `layers` · `edgeLight` · `fan` · `cardParallax`, plus `cardKit` with **24 named looks**

**Surfaces** — `beam` · `trail` · `glare` · `electric` · `blurEdge`

**Light** — `meteors` · `sparkles` · `lamp` · `beams`

**Decoration** — `mesh` · `starfield` · `dots` · `stripes` · `scanline` · `corners`

**Page chrome** — `scrollbar` · `dropdown` · `tooltip` · `toggle`

**Forms** — `floatLabel` · `autoGrow` · `charCount` · `passwordToggle` · `validate` · `rangeFill` · `fileDrop` · `stepper` · `fieldFocus` · `submitState` · `mascot` · `successButton` · `otp` · `padlock`

**Things that open** — `accordion` · `flip` · `expand` · `lightbox`

**Fields** — `waves` · `retroGrid` · `dotGrid` · `grain`

**Scroll** — `parallax` · `progress` · `horizontal` · `stack` · `scrub` · `skew`

**Scroll set pieces** — `tracing` · `flatten` · `sticky` · `mosaic` · `zoomOut` · `lineByLine` · `textMask` · `timeline` · `splitScroll` · `revealGrid` · `pinnedGallery`

**Media** — `imageReveal` · `pixelate` · `hoverPreview` · `marquee`

**Carousels & galleries** — `carousel` · `ring` · `deck` · `imageTrail` · `scratch` · `dock` · `compare` · `panels` · `orbit` · `drag` · `shuffle`

**Buttons** — `fill` · `shimmer` · `spark` · `swap` · `confetti` · `underline` · `press` · `halo` · `strokeDraw`, plus `buttonKit` with **52 named looks**: solid · outline · ghost · soft · glass · inset · depth · brutal · brutal-move · fill-up · fill-down · fill-left · fill-right · fill-center · fill-diagonal · fill-split · curtain · glow · neon · neon-flicker · sweep · shine · gradient · scan · pulse · border-grow · border-dash · corner-cut · double · notch · lift · sink · squish · jelly · wobble · tilt3d · nudge · rotate-in · slide-up · slide-down · slide-left · slice · arrow · track · caps · strike · caret · loading-bar · rail-grow · progress · dots · stripes

**Navigation** — `pill` · `gooey` · `condense` · `overlay` · `tabs` · `scrollSpy` · `progressRing` · `command` · `sidebar` · `rail` · `bottomNav` · `mega`

**Pages** — `pageTransition` · `transitionTo`

All of them running, with copyable markup, in the **[live demo](https://soyrageagency.github.io/rage-motion/)**.

---

## 🤖 Teach it to your AI

Ask any assistant for a scroll reveal and you get the same thing you have got a thousand times:

```js
window.addEventListener("scroll", () => {          /* a layout read per element */
  document.querySelectorAll(".fade").forEach(…);   /* and per event             */
});
```

It is not careless. It has no idea what is already in your project, so it writes the most average thing that could possibly work.

The **[MCP server](https://github.com/soyrageagency/rage-motion/tree/main/mcp)** fixes that. Connected, the assistant reads the real components — source, markup, options, design tokens — and reaches for `data-rm-reveal` instead of improvising.

```bash
claude mcp add rage-motion -- npx -y @soyrageagency/rage-motion-mcp
```

No key, no account, no network: the server only reads files from the installed package. [Cursor, Claude Desktop and VS Code setup →](https://github.com/soyrageagency/rage-motion/tree/main/mcp)

---

## Design tokens

The default palette is the SoyRage line, and everything is a custom property — override `--rm-accent` once and the whole kit re-themes.

```css
:root {
  --rm-ink: #0e0e0e;      --rm-cream: #f1eee9;      --rm-muted: #6c695f;
  --rm-accent: #2aa7e4;   --rm-terracotta: #d28c65; --rm-yellow: #f4d738;

  --rm-radius-sm: 4px;    --rm-radius: 24px;        --rm-radius-lg: 36px;
  --rm-ease-out: cubic-bezier(0.22, 1, 0.36, 1);
}
```

---

## Development

```bash
npm install
npm run demo         # the demo at http://localhost:4321
npm test             # unit tests
npm run test:mcp     # the MCP server, speaking the real protocol over stdio
npm run check        # the demo in a real browser, with and without reduced motion
npm run check:dist   # the same, against what actually gets published
npm run assets       # regenerate the images
```

`npm run check` is the one that matters. It loads the page in Chromium, fails on any console error, drives the overlay menu with the keyboard to prove focus is trapped and returned, and asserts that after scrolling the whole page nothing on screen is left invisible — including with `prefers-reduced-motion` forced on.

---

## 🧰 More from SoyRage

rage-motion is part of a family of open-source tools built with the same care — same design language, same defaults, same refusal to ship something that only works in the happy path:

| Project | What it does |
| --- | --- |
| ✦ **[rage-motion](https://github.com/soyrageagency/rage-motion)** | *(you are here)* Award-grade web animation with zero dependencies, plus an MCP server so your AI uses these components instead of generic ones. |
| 🔎 **[SEO MCP Server](https://github.com/soyrageagency/seo-mcp-server)** | Chat with your site's SEO — crawl, audit on-page factors, read real Search Console data and Core Web Vitals, and compare against competitors. |
| 🖧 **[Proxmox MCP Server](https://github.com/soyrageagency/proxmox-mcp-server)** | Chat with your Proxmox VE cluster — nodes, VMs and LXC, snapshots and full guest CRUD, plus a tabbed terminal dashboard. |
| 🐳 **[Docker MCP Server](https://github.com/soyrageagency/docker-mcp-server)** | Chat with your Docker host — containers, logs, Compose, a live web panel and a TUI with an AI copilot. |
| 🔐 **[RageVault](https://github.com/soyrageagency/ragevault)** | Secrets management that stays out of your way — encrypted at rest, injected at run time, never written to a shell history. |
| 🚚 **[VMware → Proxmox Toolkit](https://github.com/soyrageagency/vmware-to-proxmox)** | Inventory vCenter, score compatibility, estimate cost and time, and export a professional PDF migration assessment. |

---

## 💙 Support the project

rage-motion is free and MIT licensed. If it saves you an afternoon, you can [support development on PayPal](https://www.paypal.com/paypalme/soyrageagency) — a ⭐ on the repo helps just as much.

---

## 🖋️ Credits & License

<div align="center">

**Designed, built and maintained by [SoyRage Agency](https://soyrage.es/) — https://soyrage.es/**

</div>

Released under the **[MIT License](https://github.com/soyrageagency/rage-motion/blob/main/LICENSE)** — use it, modify it, ship it commercially.

If you build something on top of it, a link back to [soyrage.es](https://soyrage.es/) is appreciated but never required.

<div align="center">

**© 2026 SoyRage Agency — https://soyrage.es/** · Made with care in Valencia, Spain.

</div>
