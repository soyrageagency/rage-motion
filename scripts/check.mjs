/*
 * Runs the demo in a real browser and checks that the components actually did
 * something.
 *
 * Unit tests cannot catch what breaks here: a selector that matches nothing, a
 * component that throws on a page it has never seen, an element left at
 * opacity 0 because a reveal never fired. So this loads the page, fails on any
 * console error, and then asserts against the live DOM.
 *
 * The invariant it holds the page to is the one a visitor actually experiences:
 * whatever is on screen must be readable. It checks that after a full scroll
 * pass, again with reduced motion forced on, and once more after jumping
 * straight to the bottom without scrolling through the middle.
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

/**
 * Runs in the page: the elements that are substantially on screen and still
 * invisible.
 *
 * "Substantially" is doing real work here. A reveal has a threshold — it fires
 * once enough of the element is inside the viewport — so a forty-pixel sliver
 * poking in at the edge has legitimately not triggered yet, and will the
 * instant the visitor scrolls a little further. Flagging those turns a motion
 * check into flaky noise. Half the element on screen and still blank is a
 * defect, and that is what this reports.
 */
function INVISIBLE_ON_SCREEN() {
  const found = [];
  const watched = "[data-rm-reveal], [data-rm-text], [data-rm-count]";
  for (const element of document.querySelectorAll(watched)) {
    const box = element.getBoundingClientRect();
    if (!box.height) continue; // not laid out at all
    const onScreen = Math.max(0, Math.min(box.bottom, innerHeight) - Math.max(box.top, 0));
    if (onScreen / box.height < 0.5) continue;
    if (Number(getComputedStyle(element).opacity) >= 0.99) continue;
    found.push(element.outerHTML.slice(0, 90));
  }
  return found;
}

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
    // Half a viewport at a time, and two frames per step. A loaded machine can
    // skip rendering opportunities entirely, and an observer that never got to
    // sample is a flaky test rather than a real finding.
    const step = innerHeight * 0.5;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      scrollTo(0, y);
      await new Promise((done) =>
        requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(done, 90))),
      );
    }
    scrollTo(0, 0);
  });
  await wait(1400);

  const invisible = await page.evaluate(INVISIBLE_ON_SCREEN);
  check(`${label}: everything on screen is visible after scrolling`, invisible.length === 0, invisible[0]);

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

/**
 * Load the page and jump straight to the bottom, without ever scrolling
 * through the middle.
 *
 * This is what a link to an anchor does, what a reloaded page with a restored
 * scroll position does, and what a hard flick on a slow phone amounts to. The
 * footer never crossed the viewport gradually, so the observer never saw it
 * arrive — and if a reveal depends on having seen that, the visitor lands on
 * a blank screen.
 */
async function jump(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(URL_BASE, { waitUntil: "networkidle" });

  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await wait(1600);

  const invisible = await page.evaluate(INVISIBLE_ON_SCREEN);

  console.log("\njumped straight to the bottom");
  check("jumped: everything that landed on screen is visible", invisible.length === 0, invisible[0]);

  await context.close();
}

try {
  await ready();
  const browser = await chromium.launch();
  await run(browser, { reducedMotion: false });
  await run(browser, { reducedMotion: true });
  await jump(browser);
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
