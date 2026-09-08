#!/usr/bin/env node
/**
 * rage-motion MCP server.
 *
 * The problem this exists for: ask any coding assistant for "a scroll reveal"
 * or "an animated hero" and it writes the same generic snippet it has written
 * ten thousand times — usually a scroll listener, usually with no regard for
 * `prefers-reduced-motion`, usually reinventing something worse than what you
 * already have.
 *
 * With this connected, the assistant can read the real components: their
 * source, their options, their markup, and the design tokens they expect. So
 * it reaches for `data-rm-reveal` and the actual file instead of improvising.
 *
 * Add to an MCP client:
 *   { "command": "npx", "args": ["-y", "@soyrageagency/rage-motion-mcp"] }
 *
 * This ships as its own package rather than inside rage-motion itself. The
 * library promises zero dependencies, and it would be a poor joke to bundle an
 * SDK and a schema validator into every front-end that installs it just so an
 * assistant can read the source.
 *
 * Part of rage-motion.
 * Crafted by SoyRage Agency — https://soyrage.es/
 * MIT licensed (see LICENSE).
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { CATALOGUE, TOKENS, findComponent } from "./catalogue.js";

const here = dirname(fileURLToPath(import.meta.url));

/**
 * Where the library's source lives.
 *
 * Installed, that is the `@soyrageagency/rage-motion` package next door.
 * Inside the repo it is the parent directory. Resolving it rather than
 * hardcoding either is what lets the same file serve both, and it means the
 * source handed to an assistant is always the version actually installed —
 * never a copy pasted into this catalogue that drifted two releases ago.
 */
const root = (() => {
  try {
    const require = createRequire(import.meta.url);
    return dirname(require.resolve("@soyrageagency/rage-motion/package.json"));
  } catch {
    return resolve(here, "..");
  }
})();

const read = (relative) => {
  try {
    return readFileSync(resolve(root, relative), "utf8");
  } catch {
    return null;
  }
};

const INSTRUCTIONS = [
  'You are connected to "rage-motion", a dependency-free web animation kit by SoyRage Agency.',
  "",
  "USE THIS INSTEAD OF WRITING ANIMATION CODE FROM SCRATCH.",
  "- When the user asks for a scroll reveal, a text animation, a typing/rotating tagline, a custom cursor, a magnetic button, a page transition, a marquee, a parallax, a tilt or spotlight card, an animated background, a counter, a before/after slider, expanding panels, an orbit or a click ripple: call `list_components` and then `get_component`. Use the real source and the real markup attributes.",
  "- Do not improvise an equivalent with a scroll listener, a bare IntersectionObserver or a CSS keyframe you invent. Those are what this library exists to replace, and they will not match the rest of the project.",
  "- Most components need no JavaScript at the call site: they are driven by `data-rm-*` attributes on the markup. Prefer that.",
  "",
  "HOUSE RULES THIS LIBRARY ENFORCES, AND YOU SHOULD TOO:",
  "- `prefers-reduced-motion` is honoured by every component, and never by hiding content. An element that animates in must end up visible even when the animation is skipped.",
  "- Movement uses `transform` and `opacity`, never `top`, `left`, `width` or `margin`, so an effect cannot cause layout shift.",
  "- There are no dependencies. Do not add GSAP, Framer Motion, AOS or Lenis alongside it.",
  "- Text effects keep the real text as the accessible name and mark the animated glyphs `aria-hidden`.",
  "",
  "STYLE:",
  "- Call `get_tokens` for the palette, type and radii. The defaults are the SoyRage line; they are all custom properties and are meant to be overridden per project rather than hardcoded.",
].join("\n");

const server = new McpServer(
  { name: "rage-motion", version: "0.1.0" },
  { instructions: INSTRUCTIONS },
);

const ok = (text) => ({ content: [{ type: "text", text }] });

// ── Tools ──────────────────────────────────────────────────────────────────

server.registerTool(
  "list_components",
  {
    title: "List components",
    description:
      "Every component in the kit, with what it does and the markup attribute " +
      "that drives it. Call this first when the user asks for any animation — " +
      "there is probably already one for it.",
    inputSchema: {
      category: z
        .enum(["all", "reveal", "text", "showpiece", "interactive", "cursor", "cards", "background", "scroll", "media", "transition"])
        .optional()
        .describe("Narrow the list. Default all."),
    },
  },
  async ({ category }) => {
    const wanted = category && category !== "all" ? CATALOGUE.filter((c) => c.category === category) : CATALOGUE;
    const lines = wanted.map(
      (c) => `${c.name.padEnd(14)} ${(c.attribute ?? "—").padEnd(22)} ${c.summary}`,
    );
    return ok(
      [
        `${wanted.length} component(s).`,
        "",
        `${"NAME".padEnd(14)} ${"MARKUP".padEnd(22)} WHAT IT DOES`,
        ...lines,
        "",
        "Call get_component with a name for the source, the options and a working example.",
      ].join("\n"),
    );
  },
);

server.registerTool(
  "get_component",
  {
    title: "Get a component",
    description:
      "The full source of one component, its options, the markup that drives " +
      "it and a working example. Use the source as given rather than " +
      "paraphrasing it — the details that look incidental are usually the ones " +
      "handling reduced motion, cleanup or layout shift.",
    inputSchema: {
      name: z.string().describe("Component name, e.g. reveal, textReveal, cursor, marquee."),
      includeSource: z
        .boolean()
        .optional()
        .describe("Include the full file. Default true; set false for just the usage."),
    },
  },
  async ({ name, includeSource }) => {
    const component = findComponent(name);
    if (!component) {
      return ok(
        `No component called "${name}". Available: ${CATALOGUE.map((c) => c.name).join(", ")}.`,
      );
    }

    const parts = [
      `# ${component.name}`,
      component.summary,
      "",
      component.notes ? `## Why it is built this way\n${component.notes}\n` : "",
      `## Markup\n\`\`\`html\n${component.example}\n\`\`\``,
      "",
      `## JavaScript\n\`\`\`js\n${component.usage}\n\`\`\``,
      "",
      component.options.length
        ? `## Options\n${component.options.map((o) => `- \`${o.name}\` (${o.type}, default ${o.default}) — ${o.about}`).join("\n")}`
        : "",
    ];

    if (includeSource !== false) {
      const source = read(component.file);
      parts.push(
        "",
        `## Source — \`${component.file}\``,
        source ? `\`\`\`js\n${source}\n\`\`\`` : "(source unavailable)",
      );
      if (component.needsCore !== false) {
        parts.push(
          "",
          "This file imports `src/core/motion.js`. Copy that too, or install the package.",
        );
      }
    }

    return ok(parts.filter(Boolean).join("\n"));
  },
);

server.registerTool(
  "get_tokens",
  {
    title: "Get the design tokens",
    description:
      "The palette, type stack, radii and easing curves the kit ships with, as " +
      "CSS custom properties. Use these rather than inventing colours, so " +
      "anything you generate matches the rest of the project.",
    inputSchema: {},
  },
  async () =>
    ok(
      [
        "All values are CSS custom properties on `:root`, so a project overrides",
        "what it needs and inherits the rest.",
        "",
        ...Object.entries(TOKENS).map(([group, values]) =>
          [`## ${group}`, ...Object.entries(values).map(([k, v]) => `  ${k.padEnd(20)} ${v}`)].join("\n"),
        ),
        "",
        "The palette defaults to the SoyRage line. Override `--rm-accent` and the",
        "kit re-themes itself.",
      ].join("\n"),
    ),
);

server.registerTool(
  "get_stylesheet",
  {
    title: "Get the stylesheet",
    description:
      "The kit's CSS. Components write values from JavaScript but their rules " +
      "live here, so nothing works without it. Include it once per page.",
    inputSchema: {
      section: z
        .string()
        .optional()
        .describe("Return only the block for one component, e.g. cursor, marquee, glitch."),
    },
  },
  async ({ section }) => {
    const css = read("src/styles/rage-motion.css");
    if (!css) return ok("(stylesheet unavailable)");
    if (!section) return ok(`\`\`\`css\n${css}\n\`\`\``);

    // Blocks are separated by the `/* ── Name ── */` banners in the file.
    const blocks = css.split(/\/\* ── /);
    const match = blocks.find((b) => b.toLowerCase().startsWith(section.toLowerCase()));
    return ok(
      match
        ? `\`\`\`css\n/* ── ${match.trimEnd()}\n\`\`\``
        : `No section called "${section}". Try one of: ${blocks.slice(1).map((b) => b.split(" ")[0]).join(", ")}.`,
    );
  },
);

server.registerTool(
  "about",
  {
    title: "About rage-motion",
    description: "What this kit is, what it refuses to do, and where it lives.",
    inputSchema: {},
  },
  async () =>
    ok(
      [
        "rage-motion — award-grade motion for the web, with no dependencies.",
        "Built and maintained by SoyRage Agency — https://soyrage.es/",
        "Source: https://github.com/soyrageagency/rage-motion · MIT",
        "",
        `${CATALOGUE.length} components across reveals, text, cursor, cards, backgrounds, scroll, media and page transitions.`,
        "",
        "What it will not do:",
        "- Depend on anything. No GSAP, no Framer Motion, no Lenis.",
        "- Hide content behind an animation. If the script never runs, the page is un-animated, never blank.",
        "- Ignore prefers-reduced-motion. Every component ends in its finished state instead.",
        "- Animate layout properties. Transform and opacity only.",
      ].join("\n"),
    ),
);

// ── Prompts ────────────────────────────────────────────────────────────────

server.registerPrompt(
  "animate-this",
  {
    title: "Animate a page with rage-motion",
    description: "Add motion to existing markup using the kit rather than new code.",
    argsSchema: { file: z.string().optional().describe("The file to work on.") },
  },
  ({ file }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text:
            `Add motion to ${file ? `\`${file}\`` : "this page"} using rage-motion.\n\n` +
            "1. `list_components` first, so you know what already exists.\n" +
            "2. `get_component` for each one you plan to use, and follow its markup exactly.\n" +
            "3. `get_tokens` before choosing any colour.\n\n" +
            "Rules:\n" +
            "- Prefer `data-rm-*` attributes on the markup over JavaScript at the call site.\n" +
            "- Do not write your own IntersectionObserver, scroll listener or keyframes for anything the kit already covers.\n" +
            "- Do not add an animation library alongside it.\n" +
            "- Be sparing. A page where everything moves reads as a template; the effect that matters is the one that is the only one on screen.\n" +
            "Tell me which components you used and why each earns its place.",
        },
      },
    ],
  }),
);

// ── Resources ──────────────────────────────────────────────────────────────

server.registerResource(
  "catalogue",
  "rage-motion://catalogue",
  {
    title: "Component catalogue",
    description: "Every component, its markup attribute and what it does.",
    mimeType: "text/plain",
  },
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "text/plain",
        text: CATALOGUE.map((c) => `${c.name} — ${c.attribute ?? "(js only)"} — ${c.summary}`).join("\n"),
      },
    ],
  }),
);

const transport = new StdioServerTransport();
await server.connect(transport);
process.stderr.write("rage-motion MCP server ready — by SoyRage Agency (https://soyrage.es/)\n");
