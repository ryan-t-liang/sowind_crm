# Deployment

Production static targets:

| Package | URL | Server directory |
|---|---|---|
| Sowind CRM admin | `https://gridworks.cn/mockup/sowind_crm/` | `/var/www/gridworks/mockup/sowind_crm` |
| GP Girard-Perregaux H5 | `https://gridworks.cn/mockup/girard-perregaux/` | `/var/www/gridworks/mockup/girard-perregaux` |
| UN Ulysse Nardin H5 | `https://gridworks.cn/mockup/ulysse-nardin/` | `/var/www/gridworks/mockup/ulysse-nardin` |

Build the exact committed revision with `npm run build && npm run assemble`. Publish the matching directories under `dist-site/mockup/` using a temporary upload and an atomic, backup-first directory switch. Verify each public HTTPS entry and its referenced assets after publication.

The root build runs `scripts/sync-service-model.mjs` first to copy the canonical shared model to each independent static package. The generated copies are ignored in Git; do not publish the raw admin directory without this build step. Publish GitHub first, then build and deploy that commit. Each deployed directory carries a `release.json` identifying the source revision.

All three packages must use the same origin for the browser-only ticket demo to synchronize. Different devices/browsers have separate demo data. This is not a server API or production customer database.
