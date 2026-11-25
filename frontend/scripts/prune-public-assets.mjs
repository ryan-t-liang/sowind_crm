import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distName = process.argv[2];

if (!/^(dist-gp|dist-un)$/.test(distName || "")) {
  throw new Error("Expected a generated frontend directory: dist-gp or dist-un");
}

const dist = path.join(root, distName);
const source = path.join(root, "public", "figma");
const target = path.join(dist, "figma");

const isGp = distName === "dist-gp";
const rootWebp = isGp
  ? ["gp-avatar-logo.webp", "gp-home.webp", "gp-logo-white.webp", "gp-monogram.webp", "gp-service-hero.webp", "gp-watchmaker.webp"]
  : ["gp-logo-white.webp", "un-home.webp", "un-logo.webp", "un-service-hero.webp"];

const currentAssets = isGp
  ? ["01854.webp", "abb57.webp", "gp-product.webp"]
  : ["01854.webp", "28222.jpg", "626e9.webp", "925c7.webp", "un-product.webp"];

async function copy(relative) {
  const from = path.join(source, relative);
  const to = path.join(target, relative);
  await fs.mkdir(path.dirname(to), { recursive: true });
  await fs.copyFile(from, to);
}

await fs.rm(target, { recursive: true, force: true });
await Promise.all(rootWebp.map(copy));
await Promise.all(currentAssets.map(name => copy(path.join("current", name))));

for (const name of await fs.readdir(path.join(source, "current"))) {
  if (name.endsWith(".svg")) await copy(path.join("current", name));
}

for (const name of await fs.readdir(path.join(source, "articles"))) {
  const needed = name.endsWith(".svg") || (isGp ? name === "9831a.jpg" : name.endsWith(".webp"));
  if (needed) await copy(path.join("articles", name));
}

await fs.rm(path.join(dist, "assets", "sowind-logo.png"), { force: true });

console.log(`Pruned ${distName} to runtime-only lossless assets`);
