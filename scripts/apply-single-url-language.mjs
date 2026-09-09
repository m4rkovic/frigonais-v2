import { readFile, writeFile } from 'node:fs/promises';

const siteUrl = new URL('../assets/site.js', import.meta.url);
const routingUrl = new URL('../assets/lang-routing.js', import.meta.url);
const redirectsUrl = new URL('../_redirects', import.meta.url);

let site = await readFile(siteUrl, 'utf8');

site = site.replace(
  /function setLanguage\(lang, persist = true\) \{[\s\S]*?\n  \}\n\n  window\.setLanguage = setLanguage;/,
`function setLanguage(lang, persist = true) {
    applyLanguage(lang);
    if (persist) {
      try { localStorage.setItem('frigonais-lang', lang); } catch (_) {}
    }
  }

  window.setLanguage = setLanguage;`
);

const routing = `(() => {
  'use strict';

  const supported = new Set(['en', 'sr', 'zh', 'ar']);

  // Language is UI state on the existing page, not a physical route.
  // Legacy redirects may arrive with ?lang=xx; persist it and clean the URL.
  const url = new URL(location.href);
  const requested = url.searchParams.get('lang');
  if (supported.has(requested)) {
    try { localStorage.setItem('frigonais-lang', requested); } catch (_) {}
    url.searchParams.delete('lang');
    history.replaceState({}, '', url.pathname + url.search + url.hash);
  }
})();
`;

const redirects = `/api/contact /.netlify/functions/contact 200
/en / 301!
/en/ / 301!
/en/products /products.html 301!
/en/products/ /products.html 301!
/sr /?lang=sr 302!
/sr/ /?lang=sr 302!
/zh /?lang=zh 302!
/zh/ /?lang=zh 302!
/ar /?lang=ar 302!
/ar/ /?lang=ar 302!
/sr/products /products.html?lang=sr 302!
/sr/products/ /products.html?lang=sr 302!
/zh/products /products.html?lang=zh 302!
/zh/products/ /products.html?lang=zh 302!
/ar/products /products.html?lang=ar 302!
/ar/products/ /products.html?lang=ar 302!
`;

await Promise.all([
  writeFile(siteUrl, site),
  writeFile(routingUrl, routing),
  writeFile(redirectsUrl, redirects)
]);

console.log('Configured language switching on the current URL and safe legacy redirects.');
