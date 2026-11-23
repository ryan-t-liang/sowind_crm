import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "dist-site");
const mockup = path.join(output, "mockup");

await fs.rm(output, { recursive: true, force: true });
await fs.mkdir(mockup, { recursive: true });
await fs.cp(path.join(root, "site", "index.html"), path.join(output, "index.html"));
await fs.cp(path.join(root, "frontend", "dist-gp"), path.join(mockup, "girard-perregaux"), { recursive: true });
await fs.cp(path.join(root, "frontend", "dist-un"), path.join(mockup, "ulysse-nardin"), { recursive: true });
await fs.cp(path.join(root, "admin"), path.join(mockup, "sowind_crm"), { recursive: true });

console.log(`Assembled static site at ${output}`);
