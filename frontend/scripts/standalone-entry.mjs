import fs from "node:fs/promises";
import path from "node:path";

const [distDir, sourceName] = process.argv.slice(2);
if (!distDir || !sourceName) {
  throw new Error("Usage: node scripts/standalone-entry.mjs <dist-dir> <source-html>");
}

const source = path.join(distDir, sourceName);
const target = path.join(distDir, "index.html");
await fs.rm(target, { force: true });
await fs.rename(source, target);

// Vite copies the complete public directory. Remove the other client brand's
// photographic references from the GP-only runtime package.
if (distDir.endsWith("dist-gp")) {
  const assetsDir = path.join(distDir, "assets");
  const assets = await fs.readdir(assetsDir);
  await Promise.all(
    assets
      .filter((name) => name.startsWith("un-") || name.startsWith("reference-un-"))
      .map((name) => fs.rm(path.join(assetsDir, name), { force: true })),
  );
}

if (distDir.endsWith("dist-un")) {
  const assetsDir = path.join(distDir, "assets");
  const assets = await fs.readdir(assetsDir);
  await Promise.all(
    assets
      .filter((name) => name.startsWith("gp-") || name.startsWith("reference-gp-"))
      .map((name) => fs.rm(path.join(assetsDir, name), { force: true })),
  );
}

if (distDir.endsWith("dist-admin")) {
  const assetsDir = path.join(distDir, "assets");
  const assets = await fs.readdir(assetsDir);
  await Promise.all(
    assets
      .filter(
        (name) =>
          name.startsWith("reference-") ||
          name.startsWith("un-") ||
          name === "gp-profile.png",
      )
      .map((name) => fs.rm(path.join(assetsDir, name), { force: true })),
  );
}
