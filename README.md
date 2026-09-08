# Frigonais website V2

Static B2B presentation website for Frigonais D.O.O., with a dedicated product catalogue and a Vercel serverless contact endpoint.

## Current structure

- `index.html` — landing page; shows the first three product categories and the main company/quality/export/contact story.
- `products.html` — full six-category B2B product catalogue.
- `assets/site.css` — shared custom CSS.
- `assets/site.js` — shared navigation, language, modal, RFQ and Turnstile behavior.
- `assets/i18n.js` — shared EN / SR / ZH / AR copy.
- `assets/frigonais-logo-*.svg` — resolution-independent logos. Horizontal wordmarks are converted to SVG paths so browser fonts cannot alter the logo.
- `api/contact.js` — Vercel-compatible RFQ/contact API using Resend.
- `src/input.css` + `tailwind.config.js` — Tailwind production build input/config.
- `robots.txt`, `sitemap.xml`, `vercel.json` — production SEO/routing/security plumbing.

## Company contact details used on the site

### Headquarters

Frigonais D.O.O.  
Ulica Mladih 4  
18000 Niš, Serbia  
+381 18 259 044  
+381 63 657 099  
frigonais@gmail.com

### Production

Frigonais Production  
Kuršumlija, Serbia  
+381 27 381 751  
frigonaiskursumlija@gmail.com

The Kuršumlija production contact was restored from the company's existing public website.

## Local setup

```bash
npm install
npm run build
```

Then serve the repository root with any static HTTP server. Do not open the HTML files directly before running the build because production Tailwind CSS is generated into `assets/tailwind.css`.

Useful check:

```bash
npm run check
```

## Vercel environment variables

Copy `.env.example` as a reference and configure the values in Vercel.

### Resend

- `RESEND_API_KEY`
- `CONTACT_FROM` — sender on a domain verified in Resend
- `CONTACT_TO` — destination mailbox; defaults to `frigonais@gmail.com` if omitted

### Cloudflare Turnstile

- `TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`

`TURNSTILE_SITE_KEY` is public and is written into `assets/runtime-config.js` during the Vercel build. The secret key is used only by `/api/contact`.

If Resend is not configured, the site does not fake a successful submission and shows the visitor the direct Frigonais email fallback instead.

## Contact endpoint protections

The endpoint includes:

- required-field and email validation
- input length limits
- product/volume allow-lists
- HTML escaping for email content
- honeypot bot field
- Cloudflare Turnstile verification when configured
- a basic per-IP warm-instance rate limit (5 submissions / 15 minutes)

The in-memory rate limit is intentionally only an extra serverless layer; Turnstile is the primary anti-abuse control because serverless instances do not share memory globally.

## Language routes

Vercel rewrites provide:

- `/en/`, `/sr/`, `/zh/`, `/ar/`
- `/en/products`, `/sr/products`, `/zh/products`, `/ar/products`

The shared i18n runtime also preserves the selected language in local storage and supports the older `?lang=` form.

## SEO / production

- canonical and hreflang hints
- Organization structured data with both Niš HQ and Kuršumlija production contacts
- `robots.txt`
- multilingual-aware `sitemap.xml`
- 1200×630 Open Graph image
- security headers through `vercel.json`
- Tailwind compiled at build time instead of browser CDN

## Content status

The company copy now says **30 years of fruit processing experience**, based on the 1996 founding year and the current 2026 site revision.

Before the final public domain switch, Frigonais should still confirm any externally sensitive commercial claims such as employee count, export value, export-market count, and current certification scope/validity.

## Photography

The site still uses clean vector product artwork because real Frigonais production photography has not been supplied. Authentic photos of fruit, production lines, cold storage, packaging and laboratory work remain the largest available visual upgrade.
