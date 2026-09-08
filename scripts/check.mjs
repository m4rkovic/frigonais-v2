import { readFile, access } from 'node:fs/promises';

const required = [
  'index.html', 'products.html', 'assets/site.css', 'assets/site.js', 'assets/i18n.js',
  'assets/frigonais-logo-green.svg', 'assets/og-image.png', 'netlify/functions/contact.js',
  'robots.txt', 'sitemap.xml', 'netlify.toml', '_redirects', '_headers'
];
for (const file of required) await access(file);

const [home, products, site, css, netlify, redirects, headers, contact] = await Promise.all([
  readFile('index.html', 'utf8'),
  readFile('products.html', 'utf8'),
  readFile('assets/site.js', 'utf8'),
  readFile('assets/site.css', 'utf8'),
  readFile('netlify.toml', 'utf8'),
  readFile('_redirects', 'utf8'),
  readFile('_headers', 'utf8'),
  readFile('netlify/functions/contact.js', 'utf8')
]);

const assertions = [
  [!home.includes('const translations ='), 'landing translations must be external'],
  [!products.includes('const translations ='), 'products translations must be external'],
  [(home.match(/data-product-id=/g) || []).length === 3, 'landing must expose exactly three product modal triggers'],
  [(products.match(/index\.html\?product=/g) || []).length === 6, 'catalogue must preserve product selection in RFQ links'],
  [home.includes('frigonaiskursumlija@gmail.com'), 'Kuršumlija production contact must be present'],
  [home.includes('30 Years of'), '30-year company copy must be present'],
  [home.includes('for="name"') && home.includes('id="name"'), 'form labels must be associated with controls'],
  [site.includes('setMobileMenu(false)'), 'shared mobile menu close handling must exist'],
  [site.includes("fetch('/api/contact'"), 'frontend contact form must use the stable /api/contact endpoint'],
  [netlify.includes('functions = "netlify/functions"'), 'Netlify functions directory must be configured'],
  [redirects.includes('/api/contact /.netlify/functions/contact 200'), 'Netlify must rewrite /api/contact to the contact function'],
  [redirects.includes('/sr/products /products.html?lang=sr 200') && redirects.includes('/ar/products /products.html?lang=ar 200'), 'localized product routes must be configured for Netlify'],
  [headers.includes('Content-Security-Policy:') && headers.includes('Cache-Control:'), 'Netlify security and asset headers must be present'],
  [contact.includes('exports.handler'), 'contact endpoint must use the Netlify Functions handler format'],
  [css.includes('overflow-x: clip') && css.includes('.trust-strip'), 'mobile horizontal-overflow hardening must be present']
];

const failures = assertions.filter(([ok]) => !ok).map(([, message]) => message);
if (failures.length) {
  console.error('Quality checks failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('Frigonais static quality checks passed.');
