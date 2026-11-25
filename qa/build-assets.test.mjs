import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function filesUnder(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const current = path.join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(current) : [current];
  });
}

function bytesUnder(directory) {
  return filesUnder(directory).reduce((total, file) => total + fs.statSync(file).size, 0);
}

const gp = path.join(root, "frontend", "dist-gp");
const un = path.join(root, "frontend", "dist-un");
const assembledAdmin = path.join(root, "dist-site", "mockup", "sowind_crm");
const gpBytes = bytesUnder(gp);
const unBytes = bytesUnder(un);

assert(gpBytes < 8 * 1024 * 1024, `GP runtime package exceeded 8 MiB: ${gpBytes}`);
assert(unBytes < 30 * 1024 * 1024, `UN runtime package exceeded 30 MiB: ${unBytes}`);

for (const [label, directory] of [["GP", gp], ["UN", un]]) {
  const legacyRasters = filesUnder(directory).filter(file => /\.(png|jpeg)$/i.test(file));
  assert.deepEqual(legacyRasters, [], `${label} runtime package should contain only optimized WebP or losslessly optimized JPEG assets`);
}

assert(fs.existsSync(path.join(assembledAdmin, "sowind-sidebar-logo.webp")), "Admin optimized logo should be assembled");
assert(!fs.existsSync(path.join(assembledAdmin, "sowind-sidebar-logo.png")), "Admin legacy logo should be excluded from the release");

const appSource = fs.readFileSync(path.join(root, "frontend", "src", "figma", "FigmaMobileApp.tsx"), "utf8");
assert(!appSource.includes('go("works")'), "Retired works route must not remain navigable");
assert(!appSource.includes('page==="works"'), "Retired works page must not remain renderable");

console.log(`PASS: optimized runtime assets (GP ${(gpBytes / 1024 / 1024).toFixed(1)} MiB, UN ${(unBytes / 1024 / 1024).toFixed(1)} MiB), no legacy works route`);
