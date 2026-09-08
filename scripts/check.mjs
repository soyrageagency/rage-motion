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
 * It also drives the overlay menu with the keyboard, because the accessibility
 * of that component is its entire justification and nothing else here would
 * notice it regressing.
 *
 *   npm run check
 *   npm run check:dist
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
  const watched = "[data-rm-reveal], [data-rm-text], [data-rm-odometer]";
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
  await wait(1000);

  const label = reducedMotion ? "reduced motion" : "full motion";
  console.log(`\n${label}`);
  check(`${label}: no console errors`, problems.length === 0, problems[0]);

  // Every component leaves a class or an element behind when it starts. If a
  // selector matched nothing, this is where it shows.
  const started = await page.evaluate(() => ({
    split: document.querySelectorAll(".rm-split").length,
    glare: document.querySelectorAll(".rm-glare").length,
    morph: document.querySelectorAll(".rm-morph-stage").length,
    odometer: document.querySelectorAll(".rm-odometer-column").length,
    highlight: document.querySelectorAll(".rm-highlight-word").length,
    lines: document.querySelectorAll(".rm-lines i").length,
    orbit: document.querySelectorAll(".rm-orbit-item").length,
    carousel: document.querySelectorAll(".rm-carousel-item").length,
    ringItems: document.querySelectorAll(".rm-ring-item").length,
    deck: document.querySelectorAll(".rm-deck-card").length,
    dock: document.querySelectorAll(".rm-dock-item").length,
    pill: document.querySelectorAll(".rm-pill-indicator").length,
    gooey: document.querySelectorAll(".rm-gooey-blob").length,
    tabs: document.querySelectorAll('[role="tab"]').length,
    compare: document.querySelectorAll('.rm-compare-handle[role="slider"]').length,
    progress: document.querySelectorAll(".rm-progress").length,
    waves: document.querySelectorAll(".rm-waves").length,
    tracing: document.querySelectorAll(".rm-tracing-line").length,
    fill: document.querySelectorAll(".rm-fill-sheet").length,
    swap: document.querySelectorAll(".rm-swap-face").length,
  }));

  check(`${label}: text was split`, started.split > 0, JSON.stringify(started));
  check(`${label}: glare surfaces initialised`, started.glare >= 6, String(started.glare));
  check(`${label}: morph mounted`, started.morph === 2, String(started.morph));
  check(`${label}: odometer built its digit columns`, started.odometer >= 8, String(started.odometer));
  check(`${label}: highlight split its paragraph`, started.highlight > 20, String(started.highlight));
  check(`${label}: line field built`, started.lines === 55, String(started.lines));
  check(`${label}: orbit placed its items`, started.orbit === 4, String(started.orbit));
  check(`${label}: carousel took its slides`, started.carousel === 6, String(started.carousel));
  check(`${label}: ring placed its faces`, started.ringItems === 6, String(started.ringItems));
  check(`${label}: deck stacked its cards`, started.deck === 3, String(started.deck));
  check(`${label}: dock took its items`, started.dock === 5, String(started.dock));
  check(`${label}: pill indicators mounted`, started.pill === 2, String(started.pill));
  check(`${label}: gooey built two blobs`, started.gooey === 2, String(started.gooey));
  check(`${label}: tabs are a real tablist`, started.tabs === 3, String(started.tabs));
  check(`${label}: compare is a real slider`, started.compare === 1, String(started.compare));
  check(`${label}: progress bar mounted`, started.progress === 1, String(started.progress));
  check(`${label}: the hero field is drawing`, started.waves === 1, String(started.waves));
  check(`${label}: tracing drew its path`, started.tracing === 1, String(started.tracing));
  check(`${label}: directional fills mounted`, started.fill >= 3, String(started.fill));
  check(`${label}: swap has both faces`, started.swap === 2, String(started.swap));

  // Scroll the whole page, then check nothing readable is left invisible.
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
    const h2 = document.querySelector("h2[data-rm-text]");
    return { label: h2?.getAttribute("aria-label") ?? "", text: h2?.textContent?.trim() ?? "" };
  });
  check(
    `${label}: split headline keeps its accessible name`,
    headline.label === "Everything here is running",
    headline.label,
  );
  check(
    `${label}: split headline keeps its text for copy-paste`,
    headline.text.replace(/\s+/g, " ") === "Everything here is running",
    headline.text,
  );

  // An odometer replaces its text with digit columns, so the value has to
  // survive somewhere a screen reader can reach.
  const counted = await page.evaluate(
    () => document.querySelector("[data-rm-odometer]")?.getAttribute("aria-label") ?? "",
  );
  check(`${label}: the counter still announces its value`, counted === "64", counted);

  // The rotating words are decoration; the list of them is the content.
  const morphLabel = await page.evaluate(
    () => document.querySelector("[data-rm-morph]")?.getAttribute("aria-label") ?? "",
  );
  check(
    `${label}: morph announces every word, not just the visible one`,
    morphLabel.includes("portfolios") && morphLabel.includes("launches"),
    morphLabel,
  );

  await context.close();
  return problems;
}

/**
 * Drive the full-screen menu with the keyboard.
 *
 * This component is only worth shipping because of its accessibility, and none
 * of the checks above would notice that regressing: the menu would still open,
 * still look right, and quietly become a trap.
 */
async function menu(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(URL_BASE, { waitUntil: "networkidle" });

  console.log("\noverlay menu");

  const trigger = page.locator("[data-rm-overlay-open]");
  await trigger.scrollIntoViewIfNeeded();
  check("menu: starts closed and says so", (await trigger.getAttribute("aria-expanded")) === "false");

  await trigger.click();
  await wait(700);

  const opened = await page.evaluate(() => {
    const panel = document.querySelector("[data-rm-overlay]");
    return {
      hidden: panel.hidden,
      focusInside: panel.contains(document.activeElement),
      expanded: document.querySelector("[data-rm-overlay-open]").getAttribute("aria-expanded"),
      siblingsInert: [...document.body.children]
        .filter((el) => el !== panel && !el.contains(document.querySelector("[data-rm-overlay-open]")))
        .every((el) => el.inert || el === panel),
    };
  });
  check("menu: opens", opened.hidden === false);
  check("menu: moves focus inside", opened.focusInside === true);
  check("menu: reports itself expanded", opened.expanded === "true");
  check("menu: makes the rest of the page inert", opened.siblingsInert === true);

  await page.keyboard.press("Escape");
  await wait(700);

  const closed = await page.evaluate(() => {
    const panel = document.querySelector("[data-rm-overlay]");
    const button = document.querySelector("[data-rm-overlay-open]");
    return {
      hidden: panel.hidden,
      focusReturned: document.activeElement === button,
      expanded: button.getAttribute("aria-expanded"),
      inertCleared: [...document.body.children].every((el) => !el.inert),
    };
  });
  check("menu: Escape closes it", closed.hidden === true);
  check("menu: focus goes back to the button", closed.focusReturned === true);
  check("menu: reports itself collapsed", closed.expanded === "false");
  check("menu: the page is usable again", closed.inertCleared === true);

  await context.close();
}

/**
 * Load the page and jump straight to the bottom, without ever scrolling
 * through the middle.
 *
 * This is what a link to an anchor does, what a reloaded page with a restored
 * scroll position does, and what a hard flick on a slow phone amounts to. The
 * footer never crossed the viewport gradually, so the observer never saw it
 * arrive — and if a reveal depends on having seen that, the visitor lands on a
 * blank screen.
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
  await menu(browser);
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
