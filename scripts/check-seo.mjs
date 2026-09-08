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
  'build/assets/copy-fixes.js',
  'build/assets/copy-final.js',
  'build/assets/product-focus.js'
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
  [srHome.includes('Pouzdan B2B dobavljač voćnih sastojaka'), 'Serbian HTML must use proofread pre-rendered copy'],
  [srHome.includes('30 godina') && srHome.includes('Ovo jedinstveno podneblje') && !srHome.includes('terroir'), 'Serbian company copy must be proofread and natural'],
  [home.includes('Frozen Sour Cherry') && home.includes('Frozen Diced Apple') && home.includes('Machine-Cut Plum') && home.includes('Plum &amp; Prune Purées'), 'homepage must lead with the priority frozen fruit and puree products'],
  [!home.includes('data-i18n="core_thermostable"') && !srHome.includes('od IQF smrznutog voća do termostabilnih pekarskih punjenja'), 'homepage positioning must not lead with bakery fillings'],
  [products.includes('sour cherry') && products.includes('Frozen diced apple') && products.includes('Machine-cut plum'), 'English frozen fruit card must prioritize sour cherry, diced apple and machine-cut plum'],
  [srProducts.includes('smrznuta jabuka na kockice') && srProducts.includes('mašinski sečena šljiva') && srProducts.includes('U IQF programu posebno izdvajamo višnju i šljivu'), 'Serbian frozen fruit copy must prioritize sour cherry, diced apple and machine-cut plum'],
  [srProducts.includes('pire od šljive i suve šljive') && srProducts.includes('pirea od višnje') && srProducts.includes('Pire od suve šljive'), 'Serbian puree copy must include plum, prune and sour cherry'],
  [builtI18n.includes('FRIGONAIS_BUILD_COPY_FIXES') && builtI18n.includes('FRIGONAIS_BUILD_COPY_FINAL') && builtI18n.includes('FRIGONAIS_BUILD_PRODUCT_FOCUS'), 'runtime translations must include all production copy layers'],
  [builtI18n.includes("value_fruit_list: 'Višnja, smrznuta jabuka na kockice, mašinski sečena šljiva'") && builtI18n.includes("value_single_blended: 'Šljiva, suva šljiva i višnja'"), 'product modals must reflect priority frozen fruit and puree range'],
  [home.includes('frozen diced apple') && home.includes('machine-cut plum') && home.includes('plum and prune purées'), 'homepage metadata must reflect the priority product range'],
  [home.includes('"@type": "WebSite"') && home.includes('"@type": "Organization"'), 'home structured data must include WebSite and Organization'],
  [products.includes('"@type": "CollectionPage"') && products.includes('"@type": "BreadcrumbList"') && products.includes('"@type": "ItemList"'), 'products structured data must include collection, breadcrumbs and item list'],
  [srProducts.includes('Među najvažnijim smrznutim proizvodima') && srProducts.includes('Voćni pirei sa posebnim fokusom'), 'Serbian structured/product content must use the prioritized product descriptions'],
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
