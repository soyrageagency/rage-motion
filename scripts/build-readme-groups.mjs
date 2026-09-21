/*
 * Writes the README's component list from the catalogue.
 *
 * Group by group, and only the groups that are not already there. The first
 * version of this appended the whole block before its anchor without checking,
 * so running it twice — once for one batch and once for the next — put the
 * entire list in the README twice. Checking the whole block was no better: the
 * first group matching made it skip every new one.
 *
 *   node scripts/build-readme-groups.mjs
 *
 * Crafted by SoyRage Agency — https://soyrage.es/
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const { CATALOGUE } = await import(`file:///${resolve(root, "mcp/catalogue.js").replace(/\\/g, "/")}`);

/** Category → the heading and the sentence that introduces it. */
const GROUPS = [
  ["notify", "Notifications", "Twenty ways to tell somebody something, every one announced as well as drawn."],
  ["tasks", "Task lists and boards", "Checkable, reorderable, filterable — all keyboard-operable."],
  ["metrics", "More numbers, drawn", "Twenty more charts, each reading its figures out of the markup."],
  ["forms2", "More creative forms", "Eleven more, including the error summary that links to each field."],
  ["profile", "Profile and identity", "Avatars, cards, menus and presence."],
  ["scroll2", "More scroll animation", "Fifteen more, one scroll read a frame between them."],
  ["shop", "Ecommerce — product", "Cards, galleries, variants, reviews. Presentation only."],
  ["cart", "Ecommerce — cart and checkout", "Drawers, totals, steps and orders. No payment data, ever."],
  ["storefront", "Ecommerce — storefront", "Merchandising: banners, lookbooks, bundles, guides."],
  ["account", "Ecommerce — account and support", "Orders, subscriptions, reviews and help."],
  ["editor", "Writing and editing", "The chrome around a writing surface: toolbars, slash menus, suggestions."],
  ["schedule", "Calendars and time", "Month, week and day grids, ranges, availability, recurrence."],
  ["console", "Admin and data tables", "Grids, bulk actions, queries, logs, quotas, job queues."],
  ["player", "Media playback", "Wrapping the real video and audio elements, keyboard-complete."],
  ["spark", "Showpiece backgrounds", "Bubbles, fireworks, gravity, tunnels — one layer or one canvas each."],
  ["flourish", "Showpiece controls", "Liquid fills, morphing icons, pin lists, preview cards."],
  ["extras", "Thirty more", "Pricing, testimonials, help, onboarding, tables, docs, status and layout."],
];

const path = resolve(root, "README.md");
let readme = readFileSync(path, "utf8");

const anchor = "**Pages** — `pageTransition` · `transitionTo`";
if (!readme.includes(anchor)) throw new Error("README anchor missing");

let added = "";
let skipped = 0;
for (const [key, title, blurb] of GROUPS) {
  const names = CATALOGUE.filter((c) => c.category === key).map((c) => `\`${c.name}\``);
  if (!names.length) continue;
  // Per group, not per block: one group already present must not hide the rest.
  if (readme.includes(`**${title}** —`)) { skipped += 1; continue; }
  added += `**${title}** — ${blurb}\n${names.join(" · ")}\n\n`;
}

if (added) {
  writeFileSync(path, readme.replace(anchor, added + anchor));
  console.log(`${added.split("\n\n").length - 1} groups added, ${skipped} already there`);
} else {
  console.log(`nothing to add; all ${skipped} groups already in the README`);
}
