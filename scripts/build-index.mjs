/*
 * Writes the demo's index from the catalogue.
 *
 * It was hand-maintained, and by 480 components it listed about a third of
 * them — every batch since has been invisible there. This is the third place in
 * this project where a hand-typed list drifted from the thing it described, so
 * it is generated like the others: one source, no second copy to forget.
 *
 * Grouping follows the catalogue's own categories, with a readable title for
 * each, so a new module appears here the moment it is catalogued.
 *
 *   node scripts/build-index.mjs
 *
 * Crafted by SoyRage Agency — https://soyrage.es/
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const { CATALOGUE } = await import(`file:///${resolve(root, "mcp/catalogue.js").replace(/\\/g, "/")}`);

/** Category → the heading the index shows. Order is the order on the page. */
const TITLES = [
  ["reveal", "Entrances"],
  ["text", "Text"],
  ["showpiece", "Showpiece text"],
  ["cursor", "Cursors"],
  ["cards", "Cards"],
  ["surface", "Surfaces"],
  ["background", "Fields and decoration"],
  ["decoration", "Texture"],
  ["scroll", "Scroll"],
  ["scroll2", "More scroll"],
  ["media", "Media"],
  ["gallery", "Galleries"],
  ["button", "Buttons"],
  ["nav", "Navigation"],
  ["navigation", "Menu shapes"],
  ["disclosure", "Things that open"],
  ["chrome", "Chrome"],
  ["form", "Forms"],
  ["forms2", "More forms"],
  ["feedback", "Feedback"],
  ["notify", "Notifications"],
  ["data", "Numbers"],
  ["metrics", "More numbers"],
  ["tasks", "Tasks and boards"],
  ["profile", "Profile"],
  ["editor", "Writing and editing"],
  ["schedule", "Calendars and time"],
  ["console", "Admin and tables"],
  ["player", "Media playback"],
  ["shop", "Shop — product"],
  ["cart", "Shop — cart"],
  ["storefront", "Shop — storefront"],
  ["account", "Shop — account"],
  ["spark", "Showpiece backgrounds"],
  ["flourish", "Showpiece controls"],
  ["extras", "Everything else"],
  ["transition", "Pages"],
];

const escape = (text) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

let families = "";
let counted = 0;
for (const [key, title] of TITLES) {
  const parts = CATALOGUE.filter((c) => c.category === key);
  if (!parts.length) continue;
  counted += parts.length;
  const rows = parts
    .map((c) => {
      // No attribute means the component is called rather than mounted; the
      // index says so instead of leaving the column blank.
      const how = c.attribute ? `<code>${escape(c.attribute)}</code>` : "<code>js</code>";
      return `          <li><b>${escape(c.name)}</b>${how}</li>`;
    })
    .join("\n");
  families += `      <div class="index-family">\n        <h3>${escape(title)}</h3>\n        <ul>\n${rows}\n        </ul>\n      </div>\n`;
}

const missing = CATALOGUE.filter((c) => !TITLES.some(([k]) => k === c.category));
if (missing.length) {
  const names = [...new Set(missing.map((c) => c.category))].join(", ");
  throw new Error(`no index title for ${missing.length} components in: ${names}`);
}

const path = resolve(root, "demo/index.html");
let html = readFileSync(path, "utf8");

const OPEN = '    <div class="index-grid" id="index-grid">';
const CLOSE = "    </div><!-- /index-grid -->";
const block = `${OPEN}\n${families}${CLOSE}`;

const from = html.indexOf(OPEN);
if (from >= 0) {
  const to = html.indexOf(CLOSE) + CLOSE.length;
  html = html.slice(0, from) + block + html.slice(to);
} else {
  // First run: replace the hand-written grid wherever it currently sits.
  const start = html.indexOf('<div class="index-grid">');
  if (start < 0) throw new Error("could not find the index grid");
  // Walk to its matching close, counting nested divs.
  let depth = 0;
  let end = -1;
  for (let i = start; i < html.length; i++) {
    if (html.startsWith("<div", i)) depth += 1;
    else if (html.startsWith("</div>", i)) {
      depth -= 1;
      if (depth === 0) { end = i + "</div>".length; break; }
    }
  }
  if (end < 0) throw new Error("could not find the end of the index grid");
  html = html.slice(0, start) + block.trimStart() + html.slice(end);
}

writeFileSync(path, html);
console.log(`${counted} components across ${families.split("index-family").length - 1} families`);
