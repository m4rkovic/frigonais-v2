import { readFile, access } from 'node:fs/promises';

const required = [
  'index.html', 'products.html', 'assets/site.css', 'assets/site.js', 'assets/i18n.js',
  'assets/frigonais-logo-green.svg', 'assets/og-image.png', 'api/contact.js', 'robots.txt', 'sitemap.xml', 'vercel.json'
];
for (const file of required) await access(file);

const [home, products, site] = await Promise.all([
  readFile('index.html', 'utf8'),
  readFile('products.html', 'utf8'),
  readFile('assets/site.js', 'utf8')
]);

const assertions = [
  [!home.includes('cdn.tailwindcss.com'), 'landing must not use Tailwind browser CDN'],
  [!products.includes('cdn.tailwindcss.com'), 'products must not use Tailwind browser CDN'],
  [!home.includes('const translations ='), 'landing translations must be external'],
  [!products.includes('const translations ='), 'products translations must be external'],
  [(home.match(/data-product-id=/g) || []).length === 3, 'landing must expose exactly three product modal triggers'],
  [(products.match(/index\.html\?product=/g) || []).length === 6, 'catalogue must preserve product selection in RFQ links'],
  [home.includes('frigonaiskursumlija@gmail.com'), 'Kuršumlija production contact must be present'],
  [home.includes('30 Years of'), '30-year company copy must be present'],
  [home.includes('for="name"') && home.includes('id="name"'), 'form labels must be associated with controls'],
  [site.includes('setMobileMenu(false)'), 'shared mobile menu close handling must exist']
];

const failures = assertions.filter(([ok]) => !ok).map(([, message]) => message);
if (failures.length) {
  console.error('Quality checks failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('Frigonais static quality checks passed.');
