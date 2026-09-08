import { access, readFile } from 'node:fs/promises';

const files = [
  'build/index.html',
  'build/products.html',
  'build/sr/index.html',
  'build/sr/products/index.html',
  'build/zh/index.html',
  'build/ar/index.html',
  'build/sitemap.xml',
  'build/assets/tailwind.css',
  'build/assets/lang-routing.js',
  'build/assets/i18n.js',
  'build/assets/original-site-content.js',
  'build/assets/product-range-priority.js'
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

  [home.includes('Frozen Fruit') && home.includes('Fruit Purées') && home.includes('Jams &amp; Fruit Spreads'), 'homepage must retain the main production-program categories'],
  [products.includes('Frozen Fruit') && products.includes('Thermostable Mass') && products.includes('Fruit Yogurt Ingredients') && products.includes('Fruit Fillings'), 'catalogue must retain the original six main product groups'],
  [srProducts.includes('Smrznuto voće') && srProducts.includes('Termostabilna masa') && srProducts.includes('Sastojci za voćni jogurt') && srProducts.includes('Voćna punjenja'), 'Serbian catalogue must match the original production program'],

  [srProducts.includes('višnja, šljiva, malina, kupina, borovnica i kajsija'), 'Serbian frozen-fruit range must contain the approved six fruits'],
  [srProducts.includes('višnja, šljiva, suva šljiva, šipurak, kupina, malina i kajsija'), 'Serbian purée range must contain the approved seven fruits'],
  [products.includes('sour cherry, plum, raspberry, blackberry, blueberry and apricot'), 'English frozen-fruit range must contain the approved six fruits'],
  [products.includes('sour cherry, plum, prune, rosehip, blackberry, raspberry and apricot'), 'English purée range must contain the approved seven fruits'],
  [products.includes('data-i18n="tag_blueberry"') && products.includes('data-i18n="tag_apricot"'), 'frozen-fruit chips must include blueberry and apricot'],
  [products.includes('data-i18n="tag_puree_rosehip"') && products.includes('data-i18n="tag_puree_prune"'), 'purée chips must include rosehip and prune'],
  [products.includes('<!-- Prod 2 -->\n            <div style="order:3"') && products.includes('<!-- Prod 3 -->\n            <div style="order:2"'), 'fruit purées must render as the second product category'],
  [!(/\bpremium\b/i.test(home)) && !(/\bpremium\b/i.test(products)) && !(/\bpremium\b/i.test(srHome)) && !(/\bpremium\b/i.test(srProducts)), 'production copy should avoid premium marketing language'],
  [!(/\bIQF\b/.test(home)) && !(/\bIQF\b/.test(products)) && !(/\bIQF\b/.test(srHome)) && !(/\bIQF\b/.test(srProducts)), 'IQF must not appear as visible production copy'],

  [home.includes('HACCP') && !home.includes('FSSC 22000') && !home.includes('SEDEX / SMETA') && !home.includes('Kosher certified'), 'production home must not present unsupported certification claims'],
  [!home.includes('€5M') && !home.includes('15+ Countries') && !home.includes('120<span'), 'production home must not present unsupported commercial metrics'],
  [!home.includes('North America') && !home.includes('Middle East'), 'original-profile export section must not add unsupported regions'],
  [home.includes('France') && home.includes('Italy') && home.includes('Germany') && home.includes('Austria') && home.includes('Greece'), 'original-profile export countries must be present'],

  [builtI18n.includes('FRIGONAIS_ORIGINAL_SITE_CONTENT') && builtI18n.includes('FRIGONAIS_PRODUCT_RANGE_PRIORITY'), 'runtime translations must include original content and final product-range layers'],
  [builtI18n.includes("value_fruit_list: 'Višnja, šljiva, malina, kupina, borovnica, kajsija'") && builtI18n.includes("value_single_blended: 'Višnja, šljiva, suva šljiva, šipurak, kupina, malina, kajsija'"), 'product modal values must use the approved ranges'],

  [home.includes('Family-owned Serbian fruit processor founded in 1996') && !home.includes('IQF frozen fruit'), 'English SEO metadata must match the original profile and remove IQF positioning'],
  [products.includes('production program led by frozen fruit and fruit purées'), 'English product metadata must prioritize frozen fruit and purées'],
  [srProducts.includes('predvode smrznuto voće i voćni pirei'), 'Serbian product metadata must prioritize frozen fruit and purées'],
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
