import fs from 'node:fs/promises';
const source = new URL('../shared/service-model.js', import.meta.url);
for (const target of ['../frontend/public/service-model.js', '../admin/service-model.js']) {
  await fs.copyFile(source, new URL(target, import.meta.url));
}
