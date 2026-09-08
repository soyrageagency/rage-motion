<div align="center">

<a href="https://soyrage.es/">
  <img src="https://raw.githubusercontent.com/soyrageagency/rage-motion/main/assets/soyrage-banner.svg" alt="SoyRage Agency — soyrage.es" width="100%">
</a>

<br/>

# 🤖 rage-motion for AI assistants

**Stop your assistant inventing animations. Give it good ones.**

[![npm](https://img.shields.io/npm/v/%40soyrageagency%2Frage-motion-mcp?color=2aa7e4&label=npm)](https://www.npmjs.com/package/@soyrageagency/rage-motion-mcp)
[![MCP](https://img.shields.io/badge/MCP-server-0e0e0e)](https://modelcontextprotocol.io)
[![License](https://img.shields.io/badge/license-MIT-f4d738)](../LICENSE)

An [MCP](https://modelcontextprotocol.io) server that hands Claude, Cursor and
anything else that speaks the protocol the real
[rage-motion](https://github.com/soyrageagency/rage-motion) components — source,
markup, options and design tokens.

### Designed, built & maintained by **[SoyRage Agency](https://soyrage.es/)** · **https://soyrage.es/**

</div>

---

## The problem

Ask any assistant for "a scroll reveal" and you get the same thing you have got
a thousand times before:

```js
window.addEventListener("scroll", () => {
  document.querySelectorAll(".fade").forEach((el) => {
    if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("show");
  });
});
```

A layout read per element per scroll event. No `prefers-reduced-motion`. And a
`.fade { opacity: 0 }` in the stylesheet, so the day the script fails to load
the page is blank rather than merely still.

It is not that the model is careless. It has no idea what is already in your
project, so it writes the most average thing that could possibly work.

## What this changes

Connected, the assistant can read what you actually have. Ask for a scroll
reveal now and it looks first, finds `data-rm-reveal`, and writes markup:

```html
<div data-rm-reveal="up" data-rm-delay="120">…</div>
```

Same for headlines, carousels, navbars, buttons, cursors, generative
backgrounds and page transitions — 64 components in all. It gets the real file when it needs the implementation, the real palette
when it needs a colour, and the reasoning behind each component so it stops
"simplifying" the parts that are load-bearing.

## Install

**Claude Code**

```bash
claude mcp add rage-motion -- npx -y @soyrageagency/rage-motion-mcp
```

**Claude Desktop** — `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "rage-motion": {
      "command": "npx",
      "args": ["-y", "@soyrageagency/rage-motion-mcp"]
    }
  }
}
```

**Cursor** — `.cursor/mcp.json`, same shape as above.

**VS Code**

```bash
code --add-mcp '{"name":"rage-motion","command":"npx","args":["-y","@soyrageagency/rage-motion-mcp"]}'
```

Nothing to configure, no key, no account. The server only reads files from the
installed package — it makes no network requests at all.

## What it exposes

### Tools

| Tool | What it does |
| --- | --- |
| `list_components` | Every component, its markup attribute and what it does. Filterable by category. |
| `get_component` | One component: full source, options, markup and a working example. |
| `get_tokens` | The palette, type stack, radii and easing curves, as custom properties. |
| `get_stylesheet` | The kit's CSS, whole or one section. |
| `about` | What the kit is, and what it refuses to do. |

### Prompt

`animate-this` — a brief that tells the assistant to look before it writes,
prefer markup attributes to JavaScript, and be sparing. A page where everything
moves reads as a template; the effect that lands is the one that is the only
one on screen.

### Resource

`rage-motion://catalogue` — the component list, for clients that prefer to
attach context rather than call a tool.

## Try it

> **You:** add a hero animation to `index.html`

> **Assistant:** *calls `list_components`, then `get_component("textReveal")`*
> Using `data-rm-text="chars"` with the `rise` effect — it splits the headline
> but keeps the whole string as the accessible name, and the stagger is
> budgeted so a long headline still finishes under a second.

Ask it why it chose something and it will tell you, because the reasoning ships
with the component.

## The source is never a copy

`get_component` reads the file out of the installed `@soyrageagency/rage-motion`
package at the moment you ask. There is no snapshot of the code in this server
to fall out of date — upgrade the library and the assistant sees the new
version the same minute.

## House rules it passes on

The server tells the assistant the same things the library enforces, so
whatever it writes around the components matches them:

- `prefers-reduced-motion` is honoured everywhere, and never by hiding content.
- Movement is `transform` and `opacity` only, so no effect can shift layout.
- No dependencies — and none to be added alongside.
- Split text keeps its accessible name; the glyphs are `aria-hidden`.

## Related

- **[rage-motion](https://github.com/soyrageagency/rage-motion)** — the library itself.
- **[seo-mcp-server](https://github.com/soyrageagency/seo-mcp-server)** — chat with your site's SEO.
- **[Live demo](https://soyrageagency.github.io/rage-motion/)** — every component, running.

---

## 💙 Support the project

Free and MIT licensed. If it saves you time, you can [support development on PayPal](https://www.paypal.com/paypalme/soyrageagency) — a ⭐ on the repo helps just as much.

---

## 🖋️ Credits & License

<div align="center">

**Designed, built and maintained by [SoyRage Agency](https://soyrage.es/) — https://soyrage.es/**

</div>

Released under the **[MIT License](../LICENSE)** — use it, modify it, ship it commercially.

<div align="center">

**© 2026 SoyRage Agency — https://soyrage.es/** · Made with care in Valencia, Spain.

</div>
