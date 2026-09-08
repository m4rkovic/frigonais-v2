import { readFile, access } from 'node:fs/promises';

const required = [
  'index.html', 'products.html', 'assets/site.css', 'assets/site.js', 'assets/i18n.js',
  'assets/lang-routing.js', 'assets/original-site-content.js', 'assets/frigonais-logo-green.svg', 'assets/og-image.png',
  'netlify/functions/contact.js', 'robots.txt', 'sitemap.xml', 'netlify.toml', '_redirects', '_headers',
  'scripts/apply-original-content.mjs', 'scripts/patch-seo-original.mjs', 'scripts/prepare-deploy.mjs',
  'scripts/seo-build.mjs', 'scripts/check-seo.mjs'
];
for (const file of required) await access(file);

const [home, products, site, css, netlify, redirects, headers, contact, originalCopy, seoPatch, deployScript, seoScript] = await Promise.all([
  readFile('index.html', 'utf8'),
  readFile('products.html', 'utf8'),
  readFile('assets/site.js', 'utf8'),
  readFile('assets/site.css', 'utf8'),
  readFile('netlify.toml', 'utf8'),
  readFile('_redirects', 'utf8'),
  readFile('_headers', 'utf8'),
  readFile('netlify/functions/contact.js', 'utf8'),
  readFile('assets/original-site-content.js', 'utf8'),
  readFile('scripts/patch-seo-original.mjs', 'utf8'),
  readFile('scripts/prepare-deploy.mjs', 'utf8'),
  readFile('scripts/seo-build.mjs', 'utf8')
]);

const assertions = [
  [!home.includes('const translations ='), 'landing translations must be external'],
  [!products.includes('const translations ='), 'products translations must be external'],
  [(home.match(/data-product-id=/g) || []).length === 3, 'landing must expose exactly three product modal triggers'],
  [(products.match(/index\.html\?product=/g) || []).length === 6, 'catalogue must preserve product selection in RFQ links'],
  [home.includes('frigonaiskursumlija@gmail.com'), 'Kuršumlija production contact must be present'],
  [originalCopy.includes('Frigonais was founded in 1996') && originalCopy.includes('Kuršumlija') && originalCopy.includes('HACCP') && originalCopy.includes('France, Italy, Germany, Austria and Greece'), 'original company profile content source must be present'],
  [originalCopy.includes("p1_name: 'Smrznuto voće'") && originalCopy.includes("p3_name: 'Voćni pire'"), 'Serbian original production-program copy must be present'],
  [home.includes('for="name"') && home.includes('id="name"'), 'form labels must be associated with controls'],
  [site.includes('setMobileMenu(false)'), 'shared mobile menu close handling must exist'],
  [site.includes("fetch('/api/contact'"), 'frontend contact form must use the stable /api/contact endpoint'],
  [netlify.includes('command = "npm run build"'), 'Netlify must run the production build'],
  [netlify.includes('publish = "build"'), 'Netlify publish directory must be build'],
  [netlify.includes('functions = "netlify/functions"'), 'Netlify functions directory must be configured'],
  [deployScript.includes("../build/assets/"), 'build script must copy static assets into the publish directory'],
  [deployScript.includes("'_redirects'") && deployScript.includes("'_headers'"), 'build script must copy Netlify routing/header files'],
  [seoPatch.includes('Family-owned Serbian fruit processor founded in 1996') && seoPatch.includes("areaServed: ['France', 'Italy', 'Germany', 'Austria', 'Greece']"), 'SEO source patch must use original profile facts'],
  [seoScript.includes('localized pages') || seoScript.includes('SEO build complete'), 'SEO build generator must be configured'],
  [redirects.includes('/api/contact /.netlify/functions/contact 200'), 'Netlify must rewrite /api/contact to the contact function'],
  [redirects.includes('/en / 301!') && redirects.includes('/en/products /products.html 301!'), 'duplicate English routes must redirect to canonical English URLs'],
  [redirects.includes('/sr /sr/ 301!') && redirects.includes('/ar/products /ar/products/ 301!'), 'localized routes must normalize trailing slashes'],
  [!redirects.includes('?lang=sr 200'), 'localized SEO routes must not depend on query-string rewrites'],
  [headers.includes('Content-Security-Policy:') && headers.includes('Cache-Control:'), 'Netlify security and asset headers must be present'],
  [!headers.includes('cdn.tailwindcss.com'), 'production CSP must not allow obsolete Tailwind browser CDN'],
  [contact.includes('exports.handler'), 'contact endpoint must use the current deployed Netlify handler format'],
  [css.includes('overflow-x: clip') && css.includes('.trust-strip'), 'mobile horizontal-overflow hardening must be present']
];

const failures = assertions.filter(([ok]) => !ok).map(([, message]) => message);
if (failures.length) {
  console.error('Quality checks failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('Frigonais static quality checks passed.');
