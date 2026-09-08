/*
 * Runs the demo in a real browser and checks that the components actually did
 * something.
 *
 * Unit tests cannot catch what breaks here: a selector that matches nothing, a
 * component that throws on a page it has never seen, an element left at
 * opacity 0 because a reveal never fired. So this loads the page, fails on any
 * console error, and then asserts against the live DOM.
 *
 * It also runs the whole page a second time with reduced motion forced on, and
 * asserts that nothing ends up invisible — which is the failure this library
 * exists to avoid, and the one nobody notices until someone complains.
 *
 *   npm run check
 *
 * Crafted by SoyRage Agency — https://soyrage.es/
 */

import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const PORT = 4399;
// `--dist` checks the built output instead of the working tree, so what gets
// published is verified rather than assumed.
const onDist = process.argv.includes("--dist");
const PAGE = onDist ? "/index.html" : "/demo/index.html";
const URL_BASE = `http://localhost:${PORT}${PAGE}`;

const failures = [];
const check = (label, condition, detail = "") => {
  if (condition) {
    console.log(`  ok    ${label}`);
  } else {
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
    failures.push(label);
  }
};

const server = spawn(
  process.execPath,
  [fileURLToPath(new URL("./serve.mjs", import.meta.url))],
  {
    env: { ...process.env, PORT: String(PORT), SERVE_ROOT: onDist ? "dist" : "." },
    stdio: "ignore",
  },
);

const wait = (ms) => new Promise((done) => setTimeout(done, ms));

async function ready() {
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      const response = await fetch(URL_BASE);
      if (response.ok) return;
    } catch { /* not up yet */ }
    await wait(120);
  }
  throw new Error("the demo server never came up");
}

async function run(browser, { reducedMotion }) {
  const context = await browser.newContext({
    reducedMotion: reducedMotion ? "reduce" : "no-preference",
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const problems = [];
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(message.text());
  });
  page.on("pageerror", (error) => problems.push(String(error)));

  await page.goto(URL_BASE, { waitUntil: "networkidle" });
  await wait(900);

  const label = reducedMotion ? "reduced motion" : "full motion";
  console.log(`\n${label}`);
  check(`${label}: no console errors`, problems.length === 0, problems[0]);

  // Every component leaves a class or an element behind when it starts. If a
  // selector matched nothing, this is where it shows.
  const started = await page.evaluate(() => ({
    split: document.querySelectorAll(".rm-split").length,
    spotlight: document.querySelectorAll(".rm-spotlight").length,
    marquee: document.querySelectorAll(".rm-marquee-track").length,
    lines: document.querySelectorAll(".rm-lines i").length,
    orbit: document.querySelectorAll(".rm-orbit-item").length,
    compare: document.querySelectorAll('.rm-compare-handle[role="slider"]').length,
    type: document.querySelectorAll(".rm-type-text").length,
    progress: document.querySelectorAll(".rm-progress").length,
  }));

  check(`${label}: text was split`, started.split > 0, JSON.stringify(started));
  check(`${label}: spotlight cards initialised`, started.spotlight >= 6);
  check(`${label}: marquee built a track`, started.marquee === 1);
  check(`${label}: line fields built`, started.lines > 100);
  check(`${label}: orbit placed its items`, started.orbit === 4);
  check(`${label}: compare is a real slider`, started.compare === 1);
  check(`${label}: typewriter mounted`, started.type === 2);
  check(`${label}: progress bar mounted`, started.progress === 1);

  // Scroll the whole page, then check that nothing that should be readable is
  // still invisible. This is the one that catches a broken reveal.
  await page.evaluate(async () => {
    const step = innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      scrollTo(0, y);
      await new Promise((done) => requestAnimationFrame(() => setTimeout(done, 60)));
    }
    scrollTo(0, 0);
  });
  await wait(1400);

  const invisible = await page.evaluate(() =>
    [...document.querySelectorAll("[data-rm-reveal], [data-rm-text], [data-rm-count]")]
      .filter((element) => {
        const box = element.getBoundingClientRect();
        if (!box.width && !box.height) return false; // genuinely not laid out
        return Number(getComputedStyle(element).opacity) < 0.99;
      })
      .map((element) => element.outerHTML.slice(0, 90)),
  );
  check(`${label}: nothing left invisible after scrolling`, invisible.length === 0, invisible[0]);

  // The accessible name has to survive text splitting.
  const headline = await page.evaluate(() => {
    const h1 = document.querySelector("h1[data-rm-text]");
    return { label: h1?.getAttribute("aria-label") ?? "", text: h1?.textContent?.trim() ?? "" };
  });
  check(`${label}: split headline keeps its accessible name`, headline.label === "Movimiento de premio", headline.label);
  check(`${label}: split headline keeps its text for copy-paste`, headline.text.replace(/\s+/g, " ") === "Movimiento de premio", headline.text);

  const counted = await page.evaluate(
    () => document.querySelector("[data-rm-count]")?.textContent?.trim() ?? "",
  );
  check(`${label}: counter finished on its real value`, counted === "0", counted);

  await context.close();
  return problems;
}

try {
  await ready();
  const browser = await chromium.launch();
  await run(browser, { reducedMotion: false });
  await run(browser, { reducedMotion: true });
  await browser.close();
} finally {
  server.kill();
}

console.log("");
if (failures.length) {
  console.log(`${failures.length} check(s) failed.`);
  process.exit(1);
}
console.log("All checks passed.");
