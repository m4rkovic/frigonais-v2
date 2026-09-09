import { readFile, writeFile } from 'node:fs/promises';

const siteUrl = new URL('../assets/site.js', import.meta.url);
const routingUrl = new URL('../assets/lang-routing.js', import.meta.url);
const redirectsUrl = new URL('../_redirects', import.meta.url);
const checkSeoUrl = new URL('../scripts/check-seo.mjs', import.meta.url);

let site = await readFile(siteUrl, 'utf8');
let checkSeo = await readFile(checkSeoUrl, 'utf8');

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

checkSeo = checkSeo
  .replace(
    `[builtRouting.includes('window.frigonaisNavigateLanguage = navigateLanguage') && builtRouting.includes("params.delete('lang')") && !builtRouting.includes("addEventListener('click'"), 'language switching must have one canonical router without a competing click listener'],`,
    `[builtRouting.includes("history.replaceState") && builtRouting.includes("localStorage.setItem('frigonais-lang', requested)") && !builtRouting.includes('location.assign') && !builtRouting.includes('location.replace'), 'language selection must stay on the current page URL'],`
  )
  .replace(
    `[builtSite.includes("typeof window.frigonaisNavigateLanguage === 'function'") && !builtSite.includes("url.searchParams.set('lang', lang)"), 'site.js must delegate language URL changes to the canonical router'],`,
    `[builtSite.includes("localStorage.setItem('frigonais-lang', lang)") && !builtSite.includes('frigonaisNavigateLanguage') && !builtSite.includes("url.searchParams.set('lang', lang)"), 'site.js must switch language in place without changing routes'],`
  )
  .replace(
    `[!redirects.includes('/sr/ /index.html?lang=sr 200'), 'localized pages must be real static pages, not query-string rewrites']`,
    `[redirects.includes('/sr/ /?lang=sr 302!') && redirects.includes('/zh/ /?lang=zh 302!') && redirects.includes('/ar/ /?lang=ar 302!') && redirects.includes('/sr/products/ /products.html?lang=sr 302!'), 'legacy localized routes must safely return to the real page URLs']`
  );

await Promise.all([
  writeFile(siteUrl, site),
  writeFile(routingUrl, routing),
  writeFile(redirectsUrl, redirects),
  writeFile(checkSeoUrl, checkSeo)
]);

console.log('Configured language switching on the current URL and safe legacy redirects.');
