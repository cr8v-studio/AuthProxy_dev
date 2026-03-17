# AuthProxy_dev

Static marketing site for AuthProxy, built with HTML, CSS, and vanilla JavaScript.

## Overview

This repository contains a single-page website that presents AuthProxy as a production-grade authentication and edge routing platform. The project has no build step and can be deployed directly as static files.

## Project Structure

```text
.
├── assets/          # Brand assets, illustrations, icons, and motion script
├── docs/            # Design-system and component inventory notes
├── scripts/         # Site interaction and component registry scripts
├── styles/          # Tokens, typography, components, and page styles
└── index.html       # Main entry point
```

## Local Run

No package installation is required.

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deployment Notes

- Deploy as a static site to GitHub Pages, Netlify, Vercel static hosting, Cloudflare Pages, or any standard web server.
- Keep the repository root structure unchanged so the relative asset paths remain valid.
- The site loads the `Lexend` font from Google Fonts.
- Scroll and reveal animations are loaded from jsDelivr ESM endpoints inside `assets/js/animations.js`, so production hosting must allow outbound browser requests to those CDNs.

## Audit Notes

- HTML, CSS, and JavaScript references are relative and static-hosting friendly.
- The landing page uses `.webp` assets for the main design illustrations in `assets/figma/`.
- The `scripts/components.js` and `scripts/icons.js` files are kept as implementation support files referenced by the design inventory, even though the live page renders from static HTML.
