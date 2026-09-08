/*
 * Builds the published demo into `dist/`.
 *
 * There is no bundler and no transform: the demo is copied as it is, the
 * library's `src/` is copied beside it, one import prefix is rewritten because
 * the page moves up a directory, and the stylesheets and entry script get a
 * fingerprint. That is the whole build.
 *
 * Keeping it this literal is the point. The page that ships is the page that
 * runs locally, so a demo that works cannot become a site that does not — and
 * `npm run check:dist` runs the same browser checks against the built output
 * to prove it.
 *
 *   npm run build:demo
 *
 * Crafted by SoyRage Agency — https://soyrage.es/
 */

import { createHash } from "node:crypto";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../", import.meta.url)));
const dist = join(root, "dist");

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

// The demo becomes the site root, and the library sits under it.
await cp(join(root, "demo"), dist, { recursive: true });
await cp(join(root, "src"), join(dist, "src"), { recursive: true });

// `../src/` only makes sense from inside demo/. At the root it would climb out
// of the published tree, so it becomes `./src/`.
const rewrite = async (name) => {
  const file = join(dist, name);
  const before = await readFile(file, "utf8");
  const after = before.replaceAll("../src/", "./src/");
  if (before === after) throw new Error(`${name}: nothing to rewrite — has the demo's import path changed?`);
  await writeFile(file, after);
};

await rewrite("index.html");
await rewrite("demo.js");

/*
 * Fingerprint what the page links to.
 *
 * GitHub Pages serves the HTML and its assets with the same ten-minute
 * max-age, so for ten minutes after a deploy a visitor can hold a fresh
 * document and a stale stylesheet — which renders as a page with no styling at
 * all, and looks exactly like a broken deploy. A hash in the query string ends
 * that: new content is a new URL, and old content can never be paired with a
 * document that did not ask for it.
 *
 * The files themselves keep their names, so the paths still make sense to
 * anyone reading the source.
 */
const fingerprint = async (name) => {
  const contents = await readFile(join(dist, name));
  const hash = createHash("sha256").update(contents).digest("hex").slice(0, 10);

  const page = join(dist, "index.html");
  const before = await readFile(page, "utf8");
  const after = before.replaceAll(`"./${name}"`, `"./${name}?v=${hash}"`);
  if (before === after) throw new Error(`${name}: nothing in index.html links to it`);
  await writeFile(page, after);
  return `${name}?v=${hash}`;
};

const stamped = [
  await fingerprint("demo.css"),
  await fingerprint("demo.js"),
  await fingerprint("src/styles/rage-motion.css"),
];

// GitHub Pages runs Jekyll over the artifact unless told not to, and Jekyll
// silently drops files and folders whose names start with an underscore.
await writeFile(join(dist, ".nojekyll"), "");

const listing = await readdir(dist);
console.log(`dist/ built: ${listing.sort().join(", ")}`);
console.log(`fingerprinted: ${stamped.join(", ")}`);
