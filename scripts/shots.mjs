/*
 * The README's screenshots, taken from the real demo.
 *
 * Hand-cropped screenshots go stale the moment the page changes, and a README
 * showing a design that no longer exists is worse than one showing none. These
 * are taken from the running page at a fixed width, so re-running this is the
 * whole update.
 *
 *   npm run demo   (in another terminal)
 *   node scripts/shots.mjs
 */
import { chromium } from "playwright";

const OUT = "assets";
const browser = await chromium.launch();

const shot = async (name, prepare, clip) => {
  const page = await browser.newPage({ viewport: { width: 1600, height: 950 }, deviceScaleFactor: 2 });
  await page.goto("http://localhost:4321/demo/index.html", { waitUntil: "networkidle" });
  // Long enough for the hero's own entrances and the logo draw to settle.
  await page.waitForTimeout(5200);
  await prepare(page);
  await page.screenshot({ path: `${OUT}/${name}.png`, ...(clip ? { clip } : {}) });
  console.log(`${OUT}/${name}.png`);
  await page.close();
};

await shot("hero", async () => {});

await shot("catalogue", async (page) => {
  const rail = page.locator(".rail", { hasText: "All 52 button looks" }).first();
  await rail.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1400);
});

await shot("palette", async (page) => {
  await page.locator("[data-rm-command-open]").first().scrollIntoViewIfNeeded();
  await page.locator("[data-rm-command-open]").first().click();
  await page.waitForTimeout(400);
  await page.locator("[data-rm-command-input]").fill("scroll");
  await page.waitForTimeout(400);
});

await shot("showpiece", async (page) => {
  const rail = page.locator(".rail", { hasText: "Showpiece backgrounds" }).first();
  await rail.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1600);
});

await browser.close();
