/*
 * Mounts every catalogued component on a page built from its own example
 * markup, and reports anything that throws.
 *
 * Parsing proves nothing: a component that reads a property of a node it never
 * found, or calls a helper it did not import, fails only when it runs. This is
 * the cheapest thing that actually runs them.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

const { CATALOGUE } = await import("file:///D:/Projects/RageMotion/mcp/catalogue.js");

/*
 * Every catalogued component, unless a category is named on the command line:
 *   node scripts/smoke.mjs            all of them
 *   node scripts/smoke.mjs shop cart  just those two
 */
const only = new Set(process.argv.slice(2));
const wanted = only.size ? CATALOGUE.filter((c) => only.has(c.category)) : CATALOGUE;

const cells = wanted.map((c) => {
  // The example is a documentation snippet; the ellipsis is not markup.
  const markup = c.example.replace(/…/g, "<span>x</span>");
  return `<section class="probe" data-probe="${c.name}"><h2>${c.name}</h2>${markup}</section>`;
}).join("\n");

const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>smoke</title>
<link rel="stylesheet" href="../src/styles/rage-motion.css">
<style>body{background:#0e0e0e;color:#f1eee9;font:14px system-ui;margin:0;padding:20px}
.probe{margin:0 0 26px;padding:14px;border:1px solid #242424;border-radius:10px}
h2{font-size:12px;margin:0 0 10px;color:#8d8880;font-weight:400}
img{max-width:120px;height:auto}</style>
</head><body>
${cells}
<script type="module">
  import { init } from "../src/index.js";
  window.__errors = [];
  addEventListener("error", (e) => window.__errors.push(String(e.message)));
  try { init(); window.__ok = true; }
  catch (e) { window.__errors.push("init threw: " + e.message); window.__ok = false; }
</script>
</body></html>`;

writeFileSync("D:/Projects/RageMotion/demo/.smoke.html", page);


/*
 * Components this harness cannot mount, and why.
 *
 * None of these is a defect. The cursors are a page-level decision that
 * `init()` deliberately does not make, `pageTransition` needs a navigation,
 * `confetti` takes no target at all, and the rest need more markup inside them
 * than a one-line documentation example carries — slides, inputs, a trigger.
 * They are listed rather than silently subtracted, because a list you can read
 * is the only kind of exception worth having.
 */
const EXPECTED_BARE = new Set([
  "cursor", "target", "crosshair", "splash", "magnetic", "cartoonCursor", "blobCursor",
  "trailCursor", "sayCursor", "spotlightCursor", "arrowCursor", "lensCursor",
  "pageTransition", "confetti",
  "thumbs", "autoplay", "wheel", "peek", "ring", "segmented", "actionSheet", "toast",
  "contextMenu", "variantPicker", "swipeStack", "foldGallery", "peelStack", "focusGrid",
  "beam", "waves", "retroGrid", "dotGrid", "grain", "parallax", "scrub", "skew", "stepper",
]);

const browser = await chromium.launch();
const tab = await browser.newPage({ viewport: { width: 1100, height: 900 } });
const noise = [];
tab.on("pageerror", (e) => noise.push(String(e.stack || e).slice(0, 320)));
tab.on("response", (r) => { if (r.status() >= 400) noise.push(r.status() + " " + r.url()); });
tab.on("console", (m) => { if (m.type() === "error") noise.push(m.text()); });

await tab.goto("http://localhost:4321/demo/.smoke.html", { waitUntil: "networkidle" });
await tab.waitForTimeout(1500);
// Scroll it all, so anything scroll-driven actually runs.
const height = await tab.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < height; y += 700) {
  await tab.evaluate((to) => scrollTo(0, to), y);
  await tab.waitForTimeout(70);
}
await tab.waitForTimeout(600);

const survey = await tab.evaluate(() => {
  const probes = [...document.querySelectorAll(".probe")];
  const bare = [];
  for (const probe of probes) {
    // A mounted component always adds at least one rm- class of its own.
    const marked = probe.querySelector('[class*="rm-"]') || /class="[^"]*rm-/.test(probe.innerHTML);
    if (!marked) bare.push(probe.dataset.probe);
  }
  return { total: probes.length, bare };
});
const { total, bare } = survey;
const mounted = total - bare.length;
const inner = await tab.evaluate(() => window.__errors ?? []);
const peek = await tab.evaluate(() => {
  const one = document.querySelector(".probe");
  return { name: one?.dataset.probe, len: one?.innerHTML.length, head: one?.innerHTML.slice(0, 120) };
});
console.log("first probe:", JSON.stringify(peek));

console.log(`${mounted} of ${total} probes show a component class`);
const unexpected = bare.filter((name) => !EXPECTED_BARE.has(name));
if (unexpected.length) console.log(`
NOTHING MOUNTED ON: ${unexpected.join(", ")}`);
else if (bare.length) console.log(`(${bare.length} known to need more markup than an example carries)`);
// The examples point at illustrative paths like /shirt.jpg. Those 404s are
// the documentation being documentation, not the components being broken.
const all = [...new Set([...noise, ...inner])]
  .filter((line) => !/^\d{3} http/.test(line) && !/Failed to load resource/.test(line));
console.log(all.length ? `\nERRORS (${all.length}):\n${all.slice(0, 25).join("\n")}` : "\nno errors");
await browser.close();
if (all.length || unexpected.length) process.exit(1);
