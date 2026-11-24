# Sowind after-sales prototype

This repository contains three frontend-only static prototypes: GP consumer H5, UN consumer H5, and the Sowind CRM admin with members, leads, and after-sales service.

- Do not add a backend, database, real authentication, payment, logistics, email, or file-upload service.
- Keep GP and UN ticket data isolated by brand. Visual assets must follow the approved Figma: the user explicitly requested retaining the GP assets shown in UN account/detail designs on 2026-11-24.
- The admin prototype persists after-sales changes only in browser LocalStorage.
- Run `npm run verify` before handoff.
- Build and publish the exact committed revision; preserve a recoverable copy of the prior deployed site.
