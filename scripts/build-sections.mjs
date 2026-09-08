/*
 * Builds the demo's sections for a set of catalogue categories.
 *
 * The markup comes from each component's own catalogue example, which is the
 * only copy of it that is already tested: `mcp/catalogue.test.js` checks that
 * the attribute a component claims appears in its example and that the example
 * is markup rather than script, and `scripts/smoke.mjs` mounts every one of
 * them in a browser. Writing a second, hand-typed copy into the demo would be
 * a second thing to keep correct, and the first thing to go stale.
 *
 * What this does add is the demo's own furniture — the cell, the name, the copy
 * button — and real pictures in place of the illustrative paths the examples
 * point at.
 *
 *   node scripts/build-sections.mjs
 *
 * Crafted by SoyRage Agency — https://soyrage.es/
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const { CATALOGUE } = await import(`file:///${resolve(root, "mcp/catalogue.js").replace(/\\/g, "/")}`);

/** The sections to build, in the order they appear on the page. */
const SECTIONS = [
  ["notify", "Notifications"],
  ["tasks", "Task lists and boards"],
  ["metrics", "Numbers, drawn — twenty more"],
  ["forms2", "Forms, eleven more"],
  ["profile", "Profile and identity"],
  ["scroll2", "Scroll, fifteen more"],
  ["shop", "Ecommerce — product"],
  ["cart", "Ecommerce — cart and checkout"],
  ["extras", "Thirty more"],
];

/*
 * The examples point at illustrative paths — /shirt.jpg, /faces/nora.jpg. On
 * the demo they become the plates that are actually in the repository, so the
 * page has no broken images and no 404s in the console.
 */
const TILES = ["01", "02", "03", "04", "05", "06"];
let served = 0;
const plate = () => `./assets/tiles/${TILES[served++ % TILES.length]}.svg`;

/*
 * Anything that looks like a picture the repository does not have.
 *
 * Relative as well as absolute: an example is free to write src="acme.svg",
 * and on the demo that is a 404 in the console like any other. Anything
 * already pointing inside ./assets is left exactly as it is.
 */
const realPictures = (markup) =>
  markup.replace(
    /(src|data-rm-image|data-rm-src)="([^"]*\.(?:jpe?g|png|webp|avif|svg|gif))"/g,
    (whole, attribute, path) =>
      (path.includes("assets/") ? whole : `${attribute}="${plate()}"`),
  );

/*
 * An ellipsis is documentation shorthand for "your content goes here", and on
 * a page it renders as a literal "…" sitting in an empty box. The demo needs
 * something in the box, and what belongs there depends entirely on the element
 * it is in: a list wants items, a fieldset wants labelled controls, a select
 * wants options. Anything else gets a line of ordinary prose.
 */
const FILLERS = [
  [/<(ul|ol)([^>]*)>\s*…\s*<\/>/g,
    (_, tag, attrs) => `<${tag}${attrs}><li>Selected work</li><li>Archive</li><li>Index</li></${tag}>`],
  [/<fieldset([^>]*)>\s*…\s*<\/fieldset>/g,
    (_, attrs) => `<fieldset${attrs}><label><input type="radio" name="pick" checked> One</label>` +
      `<label><input type="radio" name="pick"> Two</label></fieldset>`],
  [/<select([^>]*)>\s*…\s*<\/select>/g,
    (_, attrs) => `<select${attrs}><option>Newest</option><option>Price</option></select>`],
  [/<(legend|h[1-6]|dt|dd|caption|summary)([^>]*)>\s*…\s*<\/>/g,
    (_, tag, attrs) => `<${tag}${attrs}>Label</${tag}>`],
  // Whatever is left: a container asking for a paragraph.
  [/…/g, () => "<p>The content this wraps around.</p>"],
];

const filled = (markup) => FILLERS.reduce((out, [find, put]) => out.replace(find, put), markup);

/** Markup is written into an attribute, so it has to survive being one. */
const asAttribute = (markup) =>
  markup
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n\s*/g, " ");

const cell = (component) => {
  const markup = filled(realPictures(component.example))
    .split("\n")
    .map((line) => `        ${line}`)
    .join("\n");
  // A wide cell for the ones whose markup is genuinely wide.
  const wide = /data-rm-(product-gallery|checkout-steps|kanban|feature-matrix|pricing-table|sortable-table|order-tracking|mega-footer|footer-columns|bento|form-progress|heat-calendar|timeline-chart|compare-bars|split-panel)/
    .test(component.example);
  return `    <article class="cell${wide ? " cell-wide" : ""}">
      <p class="cell-name">${component.name}</p>
      <div class="cell-body built-body">
${markup}
      </div>
      <button class="cell-copy" data-copy="${asAttribute(component.example)}">copy</button>
    </article>`;
};

let out = "";
for (const [category, title] of SECTIONS) {
  const parts = CATALOGUE.filter((c) => c.category === category);
  if (!parts.length) continue;
  out += `\n  <!-- ${title} -->\n`;
  out += `  <div class="shell rail"><span class="rail-name">${title}</span></div>\n`;
  out += `  <div class="shell cells">\n${parts.map(cell).join("\n\n")}\n  </div>\n`;
}

const path = resolve(root, "demo/index.html");
let html = readFileSync(path, "utf8");

const OPEN = "  <!-- built:sections -->";
const CLOSE = "  <!-- /built:sections -->";
const block = `${OPEN}\n${out}${CLOSE}`;

if (html.includes(OPEN)) {
  const from = html.indexOf(OPEN);
  const to = html.indexOf(CLOSE) + CLOSE.length;
  html = html.slice(0, from) + block + html.slice(to);
} else {
  // First run: put them before the last rail on the page.
  const anchor = `  <div class="shell rail"><span class="rail-name">Texture</span></div>`;
  if (!html.includes(anchor)) throw new Error("could not find where to put the sections");
  html = html.replace(anchor, `${block}\n${anchor}`);
}

writeFileSync(path, html);
const built = SECTIONS.reduce((n, [c]) => n + CATALOGUE.filter((x) => x.category === c).length, 0);
console.log(`${built} cells across ${SECTIONS.length} sections`);
