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
  'build/assets/lang-routing.js',
  'build/assets/i18n.js',
  'build/assets/original-site-content.js'
];

for (const file of files) await access(file);

const [home, products, srHome, srProducts, zhHome, arHome, sitemap, headers, redirects, builtI18n] = await Promise.all([
  readFile('build/index.html', 'utf8'),
  readFile('build/products.html', 'utf8'),
  readFile('build/sr/index.html', 'utf8'),
  readFile('build/sr/products/index.html', 'utf8'),
  readFile('build/zh/index.html', 'utf8'),
  readFile('build/ar/index.html', 'utf8'),
  readFile('build/sitemap.xml', 'utf8'),
  readFile('build/_headers', 'utf8'),
  readFile('build/_redirects', 'utf8'),
  readFile('build/assets/i18n.js', 'utf8')
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

  [home.includes('Family-owned fruit processor from Serbia') && home.includes('Fruit Processing') && home.includes('Since 1996'), 'English home must pre-render the original company positioning'],
  [srHome.includes('Porodična kompanija za preradu voća iz Srbije') && srHome.includes('1996'), 'Serbian home must pre-render the original company positioning'],
  [home.includes('6,000') && home.includes('2007') && home.includes('HACCP'), 'home must show original profile milestones'],
  [srHome.includes('6,000') && srHome.includes('Francuske') && srHome.includes('Austrije') && srHome.includes('Grčke'), 'Serbian export section must use the original profile markets'],

  [home.includes('Frozen Fruit') && home.includes('Jams & Fruit Spreads') && home.includes('Fruit Purées'), 'homepage must lead with the original production-program product categories'],
  [products.includes('Frozen Fruit') && products.includes('Thermostable Mass') && products.includes('Fruit Yogurt Ingredients') && products.includes('Fruit Fillings'), 'catalogue must retain the original six main product groups'],
  [srProducts.includes('Smrznuto voće') && srProducts.includes('Termostabilna masa') && srProducts.includes('Sastojci za voćni jogurt') && srProducts.includes('Voćna punjenja'), 'Serbian catalogue must match the original production program'],
  [srProducts.includes('višnju') && srProducts.includes('šljivu') && !srProducts.includes('Trešnja'), 'Serbian frozen-fruit copy must use višnja and šljiva'],

  [home.includes('HACCP') && !home.includes('FSSC 22000') && !home.includes('SEDEX / SMETA') && !home.includes('Kosher certified'), 'production home must not present unsupported certification claims'],
  [!home.includes('€5M') && !home.includes('15+ Countries') && !home.includes('120<span'), 'production home must not present unsupported commercial metrics'],
  [!home.includes('North America') && !home.includes('Middle East'), 'original-profile export section must not add unsupported regions'],
  [home.includes('France') && home.includes('Italy') && home.includes('Germany') && home.includes('Austria') && home.includes('Greece'), 'original-profile export countries must be present'],

  [builtI18n.includes('FRIGONAIS_ORIGINAL_SITE_CONTENT'), 'runtime translations must include the original-site content layer'],
  [builtI18n.includes("p1_name: 'Smrznuto voće'") && builtI18n.includes("p3_name: 'Voćni pire'") && builtI18n.includes("qual_desc: 'U profilu kompanije"), 'Serbian runtime copy must reflect the original company profile'],

  [home.includes('Family-owned Serbian fruit processor founded in 1996') && !home.includes('IQF frozen fruit'), 'English SEO metadata must match the original profile and remove IQF positioning'],
  [home.includes('"areaServed"') && home.includes('Austria') && !home.includes('North America'), 'structured data must use source-backed export markets'],
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
