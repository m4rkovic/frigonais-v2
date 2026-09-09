import { access, readFile, stat } from 'node:fs/promises';

const required = [
  'build/index.html',
  'build/products.html',
  'build/sitemap.xml',
  'build/_redirects',
  'build/_headers',
  'build/assets/site.js',
  'build/assets/i18n.js',
  'build/assets/site.css',
  'build/assets/tailwind.css',
  'build/assets/og-image.png'
];

for (const file of required) await access(file);

const [home, products, sitemap, redirects, headers, site, i18n] = await Promise.all([
  readFile('build/index.html', 'utf8'),
  readFile('build/products.html', 'utf8'),
  readFile('build/sitemap.xml', 'utf8'),
  readFile('build/_redirects', 'utf8'),
  readFile('build/_headers', 'utf8'),
  readFile('build/assets/site.js', 'utf8'),
  readFile('build/assets/i18n.js', 'utf8')
]);

async function doesNotExist(path) {
  try {
    await access(path);
    return false;
  } catch {
    return true;
  }
}

const [noSr, noZh, noAr, noRoutingAsset, noRuntimeConfig] = await Promise.all([
  doesNotExist('build/sr'),
  doesNotExist('build/zh'),
  doesNotExist('build/ar'),
  doesNotExist('build/assets/lang-routing.js'),
  doesNotExist('build/assets/runtime-config.js')
]);

const urlCount = (sitemap.match(/<url>/g) || []).length;
const assertions = [
  [home.includes('name="contact"') && home.includes('data-netlify="true"') && home.includes('netlify-honeypot="website"'), 'contact form must be registered with Netlify Forms'],
  [home.includes('name="form-name" value="contact"'), 'contact form must include the Netlify form-name field'],
  [site.includes("fetch('/', {") && site.includes("application/x-www-form-urlencoded") && site.includes("encoded.set('form-name'"), 'contact runtime must submit to Netlify Forms'],
  [!site.includes("fetch('/api/contact'") && !site.includes('turnstileWidgetId') && !site.includes('frigonaisTurnstileReady'), 'production contact runtime must not depend on the old function or Turnstile'],
  [!home.includes('challenges.cloudflare.com/turnstile') && !home.includes('runtime-config.js') && !products.includes('runtime-config.js'), 'production pages must not load unused Turnstile/runtime config'],
  [!home.includes('lang-routing.js') && !products.includes('lang-routing.js') && noRoutingAsset, 'dead language router must not ship in production'],

  [home.includes('<link rel="canonical" href="https://www.frigonais.com/"'), 'home canonical must point to the real home URL'],
  [products.includes('<link rel="canonical" href="https://www.frigonais.com/products.html"'), 'products canonical must point to the real catalogue URL'],
  [!home.includes('hreflang=') && !products.includes('hreflang='), 'redirect-only language URLs must not be published as hreflang alternates'],
  [!home.includes('og:locale:alternate') && !products.includes('og:locale:alternate'), 'Open Graph locale alternates must not point at redirect-only language pages'],
  [urlCount === 2 && sitemap.includes('https://www.frigonais.com/</loc>') && sitemap.includes('https://www.frigonais.com/products.html</loc>'), 'sitemap must contain only the two canonical pages'],
  [!sitemap.includes('/sr/') && !sitemap.includes('/zh/') && !sitemap.includes('/ar/'), 'sitemap must not contain redirect-only localized paths'],
  [noSr && noZh && noAr, 'redirect-only localized page directories must not be published'],
  [redirects.includes('/sr/ / 301!') && redirects.includes('/zh/ / 301!') && redirects.includes('/ar/ / 301!') && redirects.includes('/sr/products/ /products.html 301!'), 'legacy language URLs must redirect to real pages'],

  [home.includes('/assets/site.js?v=') && home.includes('/assets/i18n.js?v=') && home.includes('/assets/site.css?v=') && home.includes('/assets/tailwind.css?v='), 'critical static assets must use content-versioned URLs'],
  [headers.includes("connect-src 'self'") && headers.includes("frame-src 'none'") && !headers.includes('challenges.cloudflare.com'), 'CSP must match the simplified production runtime'],
  [noRuntimeConfig, 'unused runtime config asset must not ship'],

  [home.includes('120+ employees') && home.includes('€5M'), 'original Frigonais company facts must remain on the landing page'],
  [home.includes('FSSC') && home.includes('HACCP') && home.includes('Kosher'), 'original certification set must remain visible'],
  [products.includes('IQF Frozen Fruit'), 'IQF must remain on the frozen-fruit category'],
  [products.includes('sour cherry, plum, raspberry, blackberry, blueberry and apricot'), 'approved frozen-fruit range must remain intact'],
  [products.includes('sour cherry, plum, prune, rosehip, blackberry, raspberry and apricot'), 'approved purée range must remain intact'],
  [i18n.includes("Višnja, šljiva, malina, kupina, borovnica, kajsija") && i18n.includes("Višnja, šljiva, suva šljiva, šipurak, kupina, malina, kajsija"), 'Serbian approved product ranges must remain in runtime translations']
];

const failures = assertions.filter(([ok]) => !ok).map(([, message]) => message);

const sizes = {};
for (const path of ['build/assets/site.js', 'build/assets/i18n.js', 'build/assets/site.css', 'build/assets/tailwind.css', 'build/assets/og-image.png']) {
  sizes[path] = (await stat(path)).size;
}
const firstPartyRuntimeBytes = sizes['build/assets/site.js'] + sizes['build/assets/i18n.js'] + sizes['build/assets/site.css'] + sizes['build/assets/tailwind.css'];

if (sizes['build/assets/site.js'] > 20_000) failures.push('site.js exceeds the 20 KB performance budget');
if (sizes['build/assets/i18n.js'] > 200_000) failures.push('i18n.js exceeds the 200 KB performance budget');
if (sizes['build/assets/og-image.png'] > 200_000) failures.push('OG image exceeds the 200 KB performance budget');
if (firstPartyRuntimeBytes > 250_000) failures.push('combined first-party JS/CSS exceeds the 250 KB performance budget');

console.log('Production asset sizes:');
for (const [path, bytes] of Object.entries(sizes)) console.log(`- ${path}: ${(bytes / 1024).toFixed(1)} KB`);
console.log(`- first-party JS/CSS total: ${(firstPartyRuntimeBytes / 1024).toFixed(1)} KB`);

if (failures.length) {
  console.error('Final production checks failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Final production checks passed: contact form, canonical SEO and performance budgets are healthy.');
