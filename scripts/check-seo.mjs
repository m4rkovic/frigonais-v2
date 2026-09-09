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
  'build/assets/site.css',
  'build/assets/site.js',
  'build/assets/lang-routing.js',
  'build/assets/i18n.js',
  'build/assets/legacy-source-truth.js'
];
for (const file of files) await access(file);

const [home, products, srHome, srProducts, zhHome, zhProducts, arHome, arProducts, sitemap, headers, redirects, builtI18n, builtCss, builtSite, builtRouting] = await Promise.all([
  readFile('build/index.html', 'utf8'),
  readFile('build/products.html', 'utf8'),
  readFile('build/sr/index.html', 'utf8'),
  readFile('build/sr/products/index.html', 'utf8'),
  readFile('build/zh/index.html', 'utf8'),
  readFile('build/zh/products/index.html', 'utf8'),
  readFile('build/ar/index.html', 'utf8'),
  readFile('build/ar/products/index.html', 'utf8'),
  readFile('build/sitemap.xml', 'utf8'),
  readFile('build/_headers', 'utf8'),
  readFile('build/_redirects', 'utf8'),
  readFile('build/assets/i18n.js', 'utf8'),
  readFile('build/assets/site.css', 'utf8'),
  readFile('build/assets/site.js', 'utf8'),
  readFile('build/assets/lang-routing.js', 'utf8')
]);

const visibleHome = home.replace(/<!--[\s\S]*?-->/g, '');

const assertions = [
  [!home.includes('cdn.tailwindcss.com'), 'production home must not load Tailwind browser CDN'],
  [!products.includes('cdn.tailwindcss.com'), 'production products page must not load Tailwind browser CDN'],
  [home.includes('href="/assets/tailwind.css"') && products.includes('href="/assets/tailwind.css"'), 'production pages must use compiled Tailwind CSS'],
  [home.includes('<link rel="canonical" href="https://www.frigonais.com/"'), 'home canonical must be self-referencing'],
  [products.includes('<link rel="canonical" href="https://www.frigonais.com/products.html"'), 'products canonical must be self-referencing'],
  [srHome.includes('<html lang="sr"') && srHome.includes('href="https://www.frigonais.com/sr/"'), 'Serbian page must be localized and self-canonical'],
  [zhHome.includes('<html lang="zh-CN"') && zhHome.includes('href="https://www.frigonais.com/zh/"'), 'Chinese page must be localized and self-canonical'],
  [arHome.includes('<html lang="ar" dir="rtl"') && arHome.includes('href="https://www.frigonais.com/ar/"'), 'Arabic page must be RTL and self-canonical'],

  [home.includes('Nature and Us') && home.includes('more than 120 employees') && home.includes('around five million euros'), 'English home must preserve the old-site company facts'],
  [srHome.includes('Priroda i mi') && srHome.includes('više od 120 zaposlenih') && srHome.includes('oko pet miliona evra'), 'Serbian home must preserve the old-site company facts'],
  [home.includes('4,500') && srHome.includes('4.500') && home.includes('wastewater treatment') && srHome.includes('preradu otpadnih voda'), 'sustainability facts must match the old website'],
  [home.includes('FSSC') && home.includes('HACCP') && home.includes('Kosher'), 'old-site certification set must be present'],
  [!home.includes('Organic') && !home.includes('SEDEX') && !home.includes('SMETA'), 'certifications not present in the old repo must not be added'],
  [!home.includes('6,000') && !home.includes('2007') && !home.includes('France') && !home.includes('North America') && !home.includes('Middle East'), 'facts not present in the old repo must not remain in production copy'],

  [products.includes('Frozen Fruit') && products.includes('Fruit Purée') && products.includes('Jam') && products.includes('Thermostable Masses') && products.includes('Fruit-Yogurt Preparations') && products.includes('Fruit Fillings'), 'English catalogue must follow the old production program'],
  [srProducts.includes('smrznuto voće') && srProducts.includes('Voćni pire') && srProducts.includes('Pekmez') && srProducts.includes('Termostabilne mase') && srProducts.includes('Mase za voćni jogurt') && srProducts.includes('Voćni nadevi'), 'Serbian catalogue must use the old production terminology'],
  [srProducts.includes('višnja, šljiva, malina, kupina, borovnica i kajsija'), 'Serbian frozen-fruit range must contain the approved six fruits'],
  [srProducts.includes('višnja, šljiva, suva šljiva, šipurak, kupina, malina i kajsija'), 'Serbian purée range must contain the approved seven fruits'],
  [products.includes('sour cherry, plum, raspberry, blackberry, blueberry and apricot'), 'English frozen-fruit range must contain the approved six fruits'],
  [products.includes('sour cherry, plum, prune, rosehip, blackberry, raspberry and apricot'), 'English purée range must contain the approved seven fruits'],
  [zhProducts.includes('酸樱桃、李子、覆盆子、黑莓、蓝莓和杏') && zhProducts.includes('酸樱桃、李子、西梅、玫瑰果、黑莓、覆盆子和杏'), 'Chinese product ranges must accurately preserve the approved fruits'],
  [arProducts.includes('الكرز الحامض، البرقوق، توت العليق، التوت الأسود، التوت الأزرق والمشمش') && arProducts.includes('الكرز الحامض، البرقوق، القراصيا، ثمر الورد، التوت الأسود، توت العليق والمشمش'), 'Arabic product ranges must accurately preserve the approved fruits'],
  [products.includes('<!-- Prod 2 -->\n            <div style="order:3"') && products.includes('<!-- Prod 3 -->\n            <div style="order:2"'), 'fruit purée must render as the second product category'],
  [!(/\bpremium\b/i.test(home)) && !(/\bpremium\b/i.test(products)) && !(/\bpremium\b/i.test(srHome)) && !(/\bpremium\b/i.test(srProducts)), 'production copy should avoid premium marketing language'],
  [products.includes('data-i18n="p1_name">IQF Frozen Fruit</') && srProducts.includes('data-i18n="p1_name">IQF smrznuto voće</') && zhProducts.includes('data-i18n="p1_name">IQF 速冻水果</') && arProducts.includes('data-i18n="p1_name">فاكهة مجمدة IQF</'), 'IQF must be restored specifically on the frozen-fruit product in all languages'],

  [home.includes('<!-- INDUSTRIES SECTION HIDDEN FOR NOW') && !visibleHome.includes('data-i18n="ind_label"'), 'Industries We Serve must stay preserved in source but hidden on the landing page'],
  [home.includes('bg-accent-500 border border-accent-400') && home.includes('text-accent-600') && home.includes('bg-accent-500 w-12 mb-6 sep-line'), 'landing page must include restrained red accent elements'],
  [builtCss.includes('FRIGONAIS_LANDING_RED_ACCENTS') && builtCss.includes('#B82D37'), 'landing stylesheet must include restrained red trust-strip accents'],

  [builtI18n.includes('FRIGONAIS_LEGACY_SOURCE_TRUTH') && builtI18n.includes('FRIGONAIS_PRODUCT_RANGE_PRIORITY'), 'runtime translations must include final source-of-truth and product-range layers'],
  [builtI18n.includes("value_fruit_list: 'Višnja, šljiva, malina, kupina, borovnica, kajsija'") && builtI18n.includes("value_single_blended: 'Višnja, šljiva, suva šljiva, šipurak, kupina, malina, kajsija'"), 'product modal values must use the approved ranges'],

  [builtRouting.includes('window.frigonaisNavigateLanguage = navigateLanguage') && builtRouting.includes("params.delete('lang')") && !builtRouting.includes("addEventListener('click'"), 'language switching must have one canonical router without a competing click listener'],
  [builtSite.includes("typeof window.frigonaisNavigateLanguage === 'function'") && !builtSite.includes("url.searchParams.set('lang', lang)"), 'site.js must delegate language URL changes to the canonical router'],
  [headers.includes('Cache-Control: public, max-age=0, must-revalidate'), 'mutable static assets must revalidate so stale language JavaScript cannot survive a deploy'],

  [home.includes('more than 120 employees and annual exports of around €5 million'), 'English SEO metadata must preserve old-site company facts'],
  [srHome.includes('više od 120 zaposlenih i godišnji izvoz od oko pet miliona evra'), 'Serbian SEO metadata must preserve old-site company facts'],
  [home.includes('"areaServed": "Worldwide"') || home.includes('"areaServed":"Worldwide"'), 'structured data must only claim worldwide reach stated by the old site'],
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
