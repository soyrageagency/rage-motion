/*
 * Builds the published demo into `dist/`.
 *
 * There is no bundler and no transform: the demo is copied as it is, the
 * library's `src/` is copied beside it, and one import prefix is rewritten
 * because the page moves up a directory. That is the whole build.
 *
 * Keeping it this literal is the point. The page that ships is byte-for-byte
 * the page that runs locally, so a demo that works cannot become a site that
 * does not — and `npm run check:dist` runs the same browser checks against the
 * built output to prove it.
 *
 *   npm run build:demo
 *
 * Crafted by SoyRage Agency — https://soyrage.es/
 */

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

// GitHub Pages runs Jekyll over the artifact unless told not to, and Jekyll
// silently drops files and folders whose names start with an underscore.
await writeFile(join(dist, ".nojekyll"), "");

const listing = await readdir(dist);
console.log(`dist/ built: ${listing.sort().join(", ")}`);
