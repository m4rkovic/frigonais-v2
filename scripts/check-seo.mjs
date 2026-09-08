import { access, readFile } from 'node:fs/promises';

const files = [
  'build/index.html',
  'build/products.html',
  'build/sr/index.html',
  'build/sr/products/index.html',
  'build/zh/index.html',
  'build/zh/products/index.html',
  'build/ar/index.html',
  'build/ar/products/index.html',
  'build/sitemap.xml',
  'build/assets/tailwind.css',
  'build/assets/lang-routing.js'
];

for (const file of files) await access(file);

const [home, products, srHome, zhHome, arHome, sitemap, headers, redirects] = await Promise.all([
  readFile('build/index.html', 'utf8'),
  readFile('build/products.html', 'utf8'),
  readFile('build/sr/index.html', 'utf8'),
  readFile('build/zh/index.html', 'utf8'),
  readFile('build/ar/index.html', 'utf8'),
  readFile('build/sitemap.xml', 'utf8'),
  readFile('build/_headers', 'utf8'),
  readFile('build/_redirects', 'utf8')
]);

const assertions = [
  [!home.includes('cdn.tailwindcss.com'), 'production home must not load Tailwind browser CDN'],
  [!products.includes('cdn.tailwindcss.com'), 'production products page must not load Tailwind browser CDN'],
  [home.includes('href="/assets/tailwind.css"'), 'production home must use compiled Tailwind CSS'],
  [products.includes('href="/assets/tailwind.css"'), 'production products page must use compiled Tailwind CSS'],
  [home.includes('<link rel="canonical" href="https://www.frigonais.com/"'), 'home canonical must be self-referencing'],
  [products.includes('<link rel="canonical" href="https://www.frigonais.com/products.html"'), 'products canonical must be self-referencing'],
  [srHome.includes('<html lang="sr"') && srHome.includes('href="https://www.frigonais.com/sr/"'), 'Serbian page must be localized and self-canonical'],
  [zhHome.includes('<html lang="zh-CN"') && zhHome.includes('href="https://www.frigonais.com/zh/"'), 'Chinese page must be localized and self-canonical'],
  [arHome.includes('<html lang="ar" dir="rtl"') && arHome.includes('href="https://www.frigonais.com/ar/"'), 'Arabic page must be RTL and self-canonical'],
  [srHome.includes('Pouzdan B2B Dobavljač Voćnih Sastojaka'), 'Serbian HTML must be pre-rendered instead of English-only source'],
  [home.includes('"@type": "WebSite"') && home.includes('"@type": "Organization"'), 'home structured data must include WebSite and Organization'],
  [products.includes('"@type": "CollectionPage"') && products.includes('"@type": "BreadcrumbList"') && products.includes('"@type": "ItemList"'), 'products structured data must include collection, breadcrumbs and item list'],
  [home.includes('property="og:image:width"') && home.includes('name="twitter:image"'), 'social metadata must include image dimensions and Twitter image'],
  [sitemap.includes('https://www.frigonais.com/sr/') && sitemap.includes('https://www.frigonais.com/zh/products/') && sitemap.includes('https://www.frigonais.com/ar/products/'), 'sitemap must include canonical localized URLs'],
  [sitemap.includes('<lastmod>'), 'sitemap must include lastmod dates'],
  [!headers.includes('cdn.tailwindcss.com'), 'CSP must not allow obsolete Tailwind CDN'],
  [redirects.includes('/en / 301!') && redirects.includes('/en/products /products.html 301!'), 'duplicate English language routes must redirect to canonical English URLs'],
  [!redirects.includes('/sr/ /index.html?lang=sr 200'), 'localized pages must be real static pages, not query-string rewrites']
];

const failures = assertions.filter(([ok]) => !ok).map(([, message]) => message);
if (failures.length) {
  console.error('SEO build checks failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Frigonais SEO build checks passed.');
