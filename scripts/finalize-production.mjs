import { createHash } from 'node:crypto';
import { readFile, writeFile, rm } from 'node:fs/promises';

const BUILD_DIR = new URL('../build/', import.meta.url);
const fileUrl = (path) => new URL(path, BUILD_DIR);

let [home, products, site, i18n, siteCss, tailwindCss] = await Promise.all([
  readFile(fileUrl('index.html'), 'utf8'),
  readFile(fileUrl('products.html'), 'utf8'),
  readFile(fileUrl('assets/site.js'), 'utf8'),
  readFile(fileUrl('assets/i18n.js'), 'utf8'),
  readFile(fileUrl('assets/site.css'), 'utf8'),
  readFile(fileUrl('assets/tailwind.css'), 'utf8')
]);

// Contact submissions use Netlify Forms. This removes the dependency on an
// external mail API key while still accepting and storing real inquiries.
home = home.replace(/<form id="contactForm"([^>]*)>/, (_match, attrs) => {
  const cleaned = attrs
    .replace(/\sname="[^"]*"/g, '')
    .replace(/\smethod="[^"]*"/g, '')
    .replace(/\sdata-netlify="[^"]*"/g, '')
    .replace(/\snetlify-honeypot="[^"]*"/g, '');
  return `<form id="contactForm" name="contact" method="POST" data-netlify="true" netlify-honeypot="website"${cleaned}>`;
});

if (!home.includes('name="form-name" value="contact"')) {
  home = home.replace(
    /(<form id="contactForm"[^>]*>)/,
    '$1\n                    <input type="hidden" name="form-name" value="contact">'
  );
}

home = home.replace(/\s*<div id="turnstileContainer"[\s\S]*?<\/p>\s*<\/div>/g, '');

function removeUnusedRuntime(html) {
  return html
    .replace(/\s*<script src="\/?assets\/runtime-config\.js(?:\?[^\"]*)?" defer><\/script>/g, '')
    .replace(/\s*<script src="\/?assets\/lang-routing\.js(?:\?[^\"]*)?" defer><\/script>/g, '')
    .replace(/\s*<script src="https:\/\/challenges\.cloudflare\.com\/turnstile\/v0\/api\.js[^\"]*" defer><\/script>/g, '');
}

home = removeUnusedRuntime(home);
products = removeUnusedRuntime(products);

// The language is UI state on the canonical pages. Localized path variants are
// redirects, so publishing hreflang entries for those redirect URLs is invalid.
function cleanSeoAlternates(html) {
  return html
    .replace(/\s*<link rel="alternate" hreflang="[^"]+" href="[^"]+" \/>/g, '')
    .replace(/\s*<meta property="og:locale:alternate" content="[^"]+" \/>/g, '');
}

home = cleanSeoAlternates(home);
products = cleanSeoAlternates(products);

// Strip the dead Turnstile runtime and make site.js the only contact owner.
site = site
  .replace(/\n\s*let turnstileWidgetId = null;?/g, '')
  .replace(/\n\s*\/\/ Turnstile is enabled[\s\S]*?window\.addEventListener\('load', initTurnstile\);\n/g, '\n');

const contactStart = site.indexOf('  // Contact form ->');
const wrapperEnd = site.lastIndexOf('})();');
if (contactStart === -1 || wrapperEnd === -1 || wrapperEnd <= contactStart) {
  throw new Error('Unable to locate the contact form runtime block.');
}

const contactRuntime = `  // Contact form -> Netlify Forms.\n  const contactForm = byId('contactForm');\n  const formStatus = byId('formStatus');\n  contactForm?.addEventListener('submit', async (event) => {\n    event.preventDefault();\n    if (!contactForm.reportValidity()) return;\n\n    const button = contactForm.querySelector('.submit-btn');\n    const original = button?.innerHTML || '';\n    if (button) {\n      button.disabled = true;\n      button.classList.add('opacity-60', 'cursor-not-allowed');\n      button.textContent = t('form_sending', 'Sending…');\n    }\n    if (formStatus) formStatus.hidden = true;\n\n    const encoded = new URLSearchParams();\n    new FormData(contactForm).forEach((value, key) => encoded.append(key, String(value)));\n    encoded.set('form-name', contactForm.getAttribute('name') || 'contact');\n\n    try {\n      const response = await fetch('/', {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },\n        body: encoded.toString()\n      });\n      if (!response.ok) throw new Error(\`Netlify Forms returned \${response.status}\`);\n\n      if (formStatus) {\n        formStatus.className = 'form-status text-sm rounded-lg px-4 py-3 mt-5 bg-brand-50 border border-brand-100 text-brand-800';\n        formStatus.textContent = t('form_sent', 'Inquiry received. Thank you.');\n        formStatus.hidden = false;\n      }\n      contactForm.reset();\n      if (productParam && productSelect && productData[productParam]) productSelect.value = productParam;\n    } catch (error) {\n      console.error('Frigonais form submission failed:', error?.message || 'unknown error');\n      if (formStatus) {\n        formStatus.className = 'form-status text-sm rounded-lg px-4 py-3 mt-5 bg-accent-50 border border-accent-100 text-accent-800';\n        formStatus.textContent = t('form_error_fallback', 'The inquiry could not be sent. Please email frigonais@gmail.com.');\n        formStatus.hidden = false;\n      }\n    } finally {\n      if (button) {\n        button.disabled = false;\n        button.classList.remove('opacity-60', 'cursor-not-allowed');\n        button.innerHTML = original;\n      }\n    }\n  });\n`;

site = `${site.slice(0, contactStart)}${contactRuntime}\n})();\n`;

// Use a content-derived version so every code/CSS change gets a new browser URL
// while unchanged assets can remain efficiently cached.
const assetVersion = createHash('sha256')
  .update(site)
  .update(i18n)
  .update(siteCss)
  .update(tailwindCss)
  .digest('hex')
  .slice(0, 12);

function versionAsset(html, assetPath) {
  const escaped = assetPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return html.replace(new RegExp(`${escaped}(?:\\?[^\"']*)?`, 'g'), `${assetPath}?v=${assetVersion}`);
}

for (const assetPath of ['/assets/tailwind.css', '/assets/site.css', '/assets/i18n.js', '/assets/site.js']) {
  home = versionAsset(home, assetPath);
  products = versionAsset(products, assetPath);
}

const lastmod = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://www.frigonais.com/</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>1.0</priority>\n  </url>\n  <url>\n    <loc>https://www.frigonais.com/products.html</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.9</priority>\n  </url>\n</urlset>\n`;

const redirects = `/en / 301!\n/en/ / 301!\n/en/products /products.html 301!\n/en/products/ /products.html 301!\n/sr / 301!\n/sr/ / 301!\n/zh / 301!\n/zh/ / 301!\n/ar / 301!\n/ar/ / 301!\n/sr/products /products.html 301!\n/sr/products/ /products.html 301!\n/zh/products /products.html 301!\n/zh/products/ /products.html 301!\n/ar/products /products.html 301!\n/ar/products/ /products.html 301!\n`;

const headers = `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: DENY\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; frame-src 'none'; form-action 'self'; upgrade-insecure-requests\n\n/assets/*\n  Cache-Control: public, max-age=86400, stale-while-revalidate=604800\n`;

await Promise.all([
  writeFile(fileUrl('index.html'), home),
  writeFile(fileUrl('products.html'), products),
  writeFile(fileUrl('assets/site.js'), site),
  writeFile(fileUrl('sitemap.xml'), sitemap),
  writeFile(fileUrl('_redirects'), redirects),
  writeFile(fileUrl('_headers'), headers),
  rm(fileUrl('sr/'), { recursive: true, force: true }),
  rm(fileUrl('zh/'), { recursive: true, force: true }),
  rm(fileUrl('ar/'), { recursive: true, force: true }),
  rm(fileUrl('assets/lang-routing.js'), { force: true }),
  rm(fileUrl('assets/runtime-config.js'), { force: true })
]);

console.log(`Finalized production: Netlify Forms, canonical-only SEO and asset version ${assetVersion}.`);
