/*
 * Generates the repository's images.
 *
 *   demo/assets/social.png   1200×630 — the Open Graph card
 *   assets/hero.png          1440×900 — the README screenshot, of the real page
 *
 * The hero shot is a screenshot of the demo actually running rather than a
 * mockup, so the README can never show something the page does not do.
 *
 *   npm run assets
 *
 * Crafted by SoyRage Agency — https://soyrage.es/
 */

import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const PORT = 4401;
const root = resolve(fileURLToPath(new URL("../", import.meta.url)));
const wait = (ms) => new Promise((done) => setTimeout(done, ms));

const CARD = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
  * { box-sizing: border-box; margin: 0; }
  body {
    width: 1200px; height: 630px; display: flex; flex-direction: column;
    justify-content: space-between; padding: 72px;
    background: #0e0e0e; color: #f1eee9;
    font-family: "Bricolage Grotesque", system-ui, sans-serif;
    position: relative; overflow: hidden;
  }
  .glow {
    position: absolute; width: 720px; height: 720px; right: -180px; top: -260px;
    background: radial-gradient(circle, rgba(42,167,228,0.38), transparent 68%);
  }
  .top { display: flex; align-items: center; gap: 14px; position: relative; }
  .dot { width: 16px; height: 16px; border-radius: 50%; background: #2aa7e4; }
  .name { font-size: 26px; font-weight: 600; letter-spacing: -0.01em; }
  .headline { position: relative; }
  h1 {
    font-size: 112px; font-weight: 800; line-height: 0.9;
    letter-spacing: -0.05em; max-width: 13ch;
  }
  h1 em { font-style: normal; color: #2aa7e4; }
  .sub { margin-top: 22px; font-size: 30px; font-weight: 600; color: #b8b3a8; letter-spacing: -0.01em; }
  .bottom { display: flex; justify-content: space-between; align-items: flex-end; position: relative; }
  .tags { display: flex; gap: 10px; flex-wrap: nowrap; }
  .tag {
    font-family: "JetBrains Mono", monospace; font-size: 15px; white-space: nowrap;
    padding: 8px 16px; border: 1px solid #2e2e2e; border-radius: 999px; color: #b8b3a8;
  }
  .tag.on { border-color: #2aa7e4; color: #2aa7e4; }
  .url { font-family: "JetBrains Mono", monospace; font-size: 19px; color: #6c695f; white-space: nowrap; }
</style></head>
<body>
  <div class="glow"></div>
  <div class="top"><span class="dot"></span><span class="name">rage-motion</span></div>
  <div class="headline">
    <h1>Movimiento <em>de premio</em>.</h1>
    <p class="sub">Animación para la web, sin dependencias.</p>
  </div>
  <div class="bottom">
    <div class="tags">
      <span class="tag">33 componentes</span>
      <span class="tag">0 dependencias</span>
      <span class="tag">prefers-reduced-motion</span>
      <span class="tag on">servidor MCP</span>
    </div>
    <span class="url">soyrage.es</span>
  </div>
</body></html>`;

const server = spawn(
  process.execPath,
  [fileURLToPath(new URL("./serve.mjs", import.meta.url))],
  { env: { ...process.env, PORT: String(PORT) }, stdio: "ignore" },
);

try {
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      if ((await fetch(`http://localhost:${PORT}/demo/index.html`)).ok) break;
    } catch { /* not up yet */ }
    await wait(120);
  }

  await mkdir(resolve(root, "assets"), { recursive: true });
  const browser = await chromium.launch();

  // The social card.
  const cardPage = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await cardPage.setContent(CARD, { waitUntil: "networkidle" });
  await cardPage.screenshot({ path: resolve(root, "demo/assets/social.png") });
  console.log("demo/assets/social.png");

  // The README shot — the real page, with motion finished rather than mid-flight.
  const shot = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await shot.goto(`http://localhost:${PORT}/demo/index.html`, { waitUntil: "networkidle" });
  await wait(2600);
  await shot.screenshot({ path: resolve(root, "assets/hero.png") });
  console.log("assets/hero.png");

  await browser.close();
} finally {
  server.kill();
}
