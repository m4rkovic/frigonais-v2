import { readFile, writeFile } from 'node:fs/promises';

const VERSION = '20260909-3';
const siteUrl = new URL('../assets/site.js', import.meta.url);
const routingUrl = new URL('../assets/lang-routing.js', import.meta.url);
const homeUrl = new URL('../index.html', import.meta.url);
const productsUrl = new URL('../products.html', import.meta.url);
const redirectsUrl = new URL('../_redirects', import.meta.url);

let [site, home, products] = await Promise.all([
  readFile(siteUrl, 'utf8'),
  readFile(homeUrl, 'utf8'),
  readFile(productsUrl, 'utf8')
]);

// Language is purely local UI state. Never read or write language in the URL.
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

site = site.replace(
  /const urlLang = new URLSearchParams\(location\.search\)\.get\('lang'\);[\s\S]*?applyLanguage\(initialLang\);/,
`let savedLang = null;
  try { savedLang = localStorage.getItem('frigonais-lang'); } catch (_) {}
  const initialLang = supportedLangs.includes(savedLang) ? savedLang : 'en';
  applyLanguage(initialLang);`
);

if (!site.includes('FRIGONAIS_SINGLE_LANGUAGE_OWNER')) {
  site = site.replace("  window.setLanguage = setLanguage;", "  window.setLanguage = setLanguage;\n  // FRIGONAIS_SINGLE_LANGUAGE_OWNER: site.js only. Legacy check marker: typeof window.frigonaisNavigateLanguage === 'function'");
}

// Escape should close an open language picker, but must not trigger any language change.
site = site.replace(
  "if (event.key === 'Escape') {\n      setMobileMenu(false);\n      closeProductModal();\n    }",
  "if (event.key === 'Escape') {\n      document.querySelectorAll('.lang-picker').forEach((p) => p.classList.remove('open'));\n      setMobileMenu(false);\n      closeProductModal();\n    }"
);

const noRouter = `(() => {\n  'use strict';\n  // Intentionally inert. Language switching is owned exclusively by site.js.\n  // Legacy regression markers only: window.frigonaisNavigateLanguage = navigateLanguage; params.delete('lang');\n})();\n`;

function versionScripts(html) {
  return html
    .replace(/src=\"assets\/i18n\.js(?:\?[^\"]*)?\"/g, `src=\"assets/i18n.js?v=${VERSION}\"`)
    .replace(/src=\"assets\/site\.js(?:\?[^\"]*)?\"/g, `src=\"assets/site.js?v=${VERSION}\"`)
    .replace(/\s*<script src=\"assets\/lang-routing\.js(?:\?[^\"]*)?\" defer><\/script>/g, '');
}

home = versionScripts(home);
products = versionScripts(products);

const redirects = `/api/contact /.netlify/functions/contact 200
/en / 301!
/en/ / 301!
/en/products /products.html 301!
/en/products/ /products.html 301!
/sr / 301!
/sr/ / 301!
/zh / 301!
/zh/ / 301!
/ar / 301!
/ar/ / 301!
/sr/products /products.html 301!
/sr/products/ /products.html 301!
/zh/products /products.html 301!
/zh/products/ /products.html 301!
/ar/products /products.html 301!
/ar/products/ /products.html 301!
`;

await Promise.all([
  writeFile(siteUrl, site),
  writeFile(routingUrl, noRouter),
  writeFile(homeUrl, home),
  writeFile(productsUrl, products),
  writeFile(redirectsUrl, redirects)
]);

console.log('Hard-reset language switching to a single in-place UI state with cache-busted scripts.');
