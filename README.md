# Frigonais website V2

This package contains the revised single-page Frigonais presentation site plus vector logo assets and a Vercel-compatible contact endpoint.

## Included improvements

- Recreated Frigonais logos as resolution-independent SVG assets.
- Branded navigation/footer logos and a subtle hero logo watermark.
- Stronger B2B hero copy and product-category scannability.
- Certification trust strip.
- New "Why Frigonais" proof section using facts already present in the supplied site.
- Product cards use custom vector illustrations instead of emojis.
- Product specification modal with application/processing facts already supported by the supplied copy.
- Improved Global Reach presentation with visual market map + existing country list.
- Removed stale hard-coded 2025 trade-fair block.
- Real contact form flow through `/api/contact`, with honeypot spam protection and graceful email fallback.
- SEO metadata, canonical, Open Graph, hreflang hints and Organization structured data.
- Accessibility improvements: focus states, reduced-motion support, ARIA state for mobile navigation, Escape handling, scroll offsets.
- Fixed the old `href="#"` logo/smooth-scroll selector bug.
- Footer copyright year now updates automatically.
- Language choice is persisted in localStorage and reflected in `?lang=`.

## Contact form setup on Vercel

The included `api/contact.js` uses the Resend HTTP API without npm dependencies.

Add these environment variables in Vercel:

- `RESEND_API_KEY`
- `CONTACT_FROM` — must use a sender/domain verified in Resend
- `CONTACT_TO` — destination mailbox

See `.env.example`.

Without those variables, the page does not fake a successful submission. It shows the visitor a direct email fallback instead.

## Production note

The supplied site still uses Tailwind's browser CDN because the original project is a standalone HTML file. That is fine for preview/prototyping. For a final production build, move Tailwind to a normal build pipeline so unused CSS can be purged and the browser does not compile Tailwind at runtime.

## Photography

No real factory/product photography was supplied. The redesign therefore uses clean vector product artwork rather than inventing stock imagery. Real Frigonais production, fruit, cold-storage, packaging and laboratory photos would be the next biggest visual upgrade.

## Latest structure update
- `index.html` now shows only the first three product categories on the landing page.
- `products.html` is the dedicated full catalogue page with all six product categories.
- The abstract export-map illustration was removed in favor of explicit export metrics and the country list.
- Horizontal SVG logos received extra viewBox padding and safer responsive sizing to prevent clipping in navigation/footer containers.
