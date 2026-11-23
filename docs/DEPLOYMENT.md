# Deployment

Production static targets:

| Package | URL | Server directory |
|---|---|---|
| Sowind CRM admin | `https://gridworks.cn/mockup/sowind_crm/` | `/var/www/gridworks/mockup/sowind_crm` |
| GP Girard-Perregaux H5 | `https://gridworks.cn/mockup/girard-perregaux/` | `/var/www/gridworks/mockup/girard-perregaux` |
| UN Ulysse Nardin H5 | `https://gridworks.cn/mockup/ulysse-nardin/` | `/var/www/gridworks/mockup/ulysse-nardin` |

Build the exact committed revision with `npm run build && npm run assemble`. Publish the matching directories under `dist-site/mockup/` using a temporary upload and an atomic, backup-first directory switch. Verify each public HTTPS entry and its referenced assets after publication.
