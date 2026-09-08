/*
 * A static server for the demo.
 *
 * The demo loads the library as real ES modules from `src/`, which the browser
 * will not do over `file://`. This serves the repository root so those imports
 * resolve exactly as they will in a real project — no bundler, no copy step,
 * nothing that could make the demo pass while the package fails.
 *
 *   npm run demo
 *
 * Crafted by SoyRage Agency — https://soyrage.es/
 */

import { createServer } from "node:http";
import { createReadStream, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// SERVE_ROOT lets the same server check the built dist/ as well as the repo.
const root = resolve(fileURLToPath(new URL("../", import.meta.url)), process.env.SERVE_ROOT ?? ".");
const port = Number(process.env.PORT) || 4321;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

const server = createServer((request, response) => {
  const url = new URL(request.url, "http://localhost");
  let path = decodeURIComponent(url.pathname);
  if (path === "/") path = process.env.SERVE_INDEX ?? "/demo/index.html";
  if (path.endsWith("/")) path += "index.html";

  // Normalise before joining, so "../" in a request cannot escape the root.
  const target = join(root, normalize(path));
  if (!target.startsWith(root)) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  try {
    const stats = statSync(target);
    if (stats.isDirectory()) throw new Error("directory");
    response.writeHead(200, {
      "content-type": TYPES[extname(target)] ?? "application/octet-stream",
      "cache-control": "no-cache",
    });
    createReadStream(target).pipe(response);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end(`Not found: ${path}`);
  }
});

server.listen(port, () => {
  console.log(`rage-motion demo → http://localhost:${port}/`);
});
