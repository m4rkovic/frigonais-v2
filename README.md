# Frigonais website V2

Static presentation website for Frigonais D.O.O., with a dedicated product catalogue and a Netlify Functions contact endpoint.

## Content source of truth

The production build keeps the new visual design, but company information is intentionally aligned with the original Frigonais website/company profile rather than later speculative marketing copy.

Source-backed company facts used in the build:

- family-owned company founded in Niš in 1996
- fruit-processing production in Kuršumlija
- production based on hot and cold processing
- processing of fruit and forest fruit, including freezing and drying
- a new line introduced in 2007 for fruit purée, jam and ingredients for fruit yogurt
- main product groups: frozen fruit, jam, fruit purée, thermostable mass, fruit-yogurt ingredients and fruit fillings
- original company profile lists France, Italy, Germany, Austria and Greece among the main buyers
- original profile states yearly processing of about 6,000 tonnes of purchased fruit and forest fruit
- HACCP is the quality standard explicitly supported by the original company profile

The build deliberately does **not** present previously added claims such as `120+ employees`, `€5M+ exports`, `15+ markets`, FSSC 22000, Organic, SEDEX/SMETA or Kosher unless Frigonais later supplies a current authoritative source for them.

## Contact details

### Headquarters

Frigonais D.O.O.  
Ulica Mladih 4  
18000 Niš, Serbia  
+381 18 259 044  
frigonais@gmail.com

### Production

Frigonais Production  
Kuršumlija, Serbia  
+381 27 381 751  
frigonaiskursumlija@gmail.com

## Current structure

- `index.html` — landing-page visual template
- `products.html` — six-category product catalogue template
- `assets/i18n.js` — EN / SR / ZH / AR translations
- `assets/original-site-content.js` — final source-backed company/product copy
- `scripts/apply-original-content.mjs` — replaces unsupported landing-page sections and metrics
- `scripts/apply-original-final.mjs` — final navigation/catalogue/contact cleanup
- `scripts/patch-seo-original.mjs` — aligns metadata and structured data with the same source-backed facts
- `scripts/seo-build.mjs` — generates localized static pages and SEO output
- `netlify/functions/contact.js` — Netlify RFQ/contact endpoint
- `netlify.toml` — Netlify build configuration

## Local setup

```bash
npm install
npm run build
npm run check
npm run check:seo
```

## Netlify deployment

- Build command: `npm run build`
- Publish directory: `build`
- Functions directory: `netlify/functions`
- Node version: 22

`/api/contact` is rewritten internally to the Netlify contact function.

## Netlify environment variables

### Resend

- `RESEND_API_KEY`
- `CONTACT_FROM`
- `CONTACT_TO` — defaults to `frigonais@gmail.com`

### Cloudflare Turnstile

- `TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`

## SEO

The build generates canonical/hreflang tags, localized EN/SR/ZH/AR pages, Organization/Product structured data, sitemap, Open Graph metadata and Twitter metadata. SEO descriptions use the same original-profile company and product facts instead of unsupported commercial metrics.

## Photography

The site currently uses vector product artwork. Real Frigonais production, cold-storage, fruit and packaging photography can replace it later without changing the content model.
