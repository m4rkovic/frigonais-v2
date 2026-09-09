import { readFile, writeFile } from 'node:fs/promises';

const legacyUrl = new URL('../assets/legacy-source-truth.js', import.meta.url);
const siteUrl = new URL('../assets/site.js', import.meta.url);
const routingUrl = new URL('../assets/lang-routing.js', import.meta.url);
const headersUrl = new URL('../_headers', import.meta.url);

let legacy = await readFile(legacyUrl, 'utf8');
let site = await readFile(siteUrl, 'utf8');
let headers = await readFile(headersUrl, 'utf8');

// IQF belongs only to the frozen-fruit product naming, not the wider company copy.
legacy = legacy
  .replaceAll("core_iqf: 'Frozen Fruit'", "core_iqf: 'IQF Frozen Fruit'")
  .replaceAll("p1_name: 'Frozen Fruit'", "p1_name: 'IQF Frozen Fruit'")
  .replaceAll("core_iqf: 'Smrznuto voće'", "core_iqf: 'IQF smrznuto voće'")
  .replaceAll("p1_name: 'Smrznuto voće'", "p1_name: 'IQF smrznuto voće'")
  .replaceAll("core_iqf: '冷冻水果'", "core_iqf: 'IQF 速冻水果'")
  .replaceAll("p1_name: '冷冻水果'", "p1_name: 'IQF 速冻水果'")
  .replaceAll("core_iqf: 'فاكهة مجمدة'", "core_iqf: 'فاكهة مجمدة IQF'")
  .replaceAll("p1_name: 'فاكهة مجمدة'", "p1_name: 'فاكهة مجمدة IQF'");

// site.js no longer mutates ?lang= itself. The canonical router owns language URL changes.
const oldSetLanguage = `  function setLanguage(lang, persist = true) {\n    applyLanguage(lang);\n    if (persist) {\n      try { localStorage.setItem('frigonais-lang', lang); } catch (_) {}\n      const url = new URL(location.href);\n      url.searchParams.set('lang', lang);\n      history.replaceState({}, '', url);\n    }\n  }`;

const newSetLanguage = `  function setLanguage(lang, persist = true) {\n    if (persist && typeof window.frigonaisNavigateLanguage === 'function') {\n      window.frigonaisNavigateLanguage(lang);\n      return;\n    }\n    applyLanguage(lang);\n    if (persist) {\n      try { localStorage.setItem('frigonais-lang', lang); } catch (_) {}\n    }\n  }`;

if (site.includes(oldSetLanguage)) site = site.replace(oldSetLanguage, newSetLanguage);

// One router, one click flow. No capture-phase listener fighting site.js anymore.
const routing = [
  "(() => {",
  "  'use strict';",
  "",
  "  const supported = new Set(['en', 'sr', 'zh', 'ar']);",
  "  window.FRIGONAIS_LANG_ROUTER_ACTIVE = true;",
  "",
  "  function isProductsPage() {",
  "    return document.body?.dataset.page === 'products' || /\\/products(?:\\/|\\.html)?$/.test(location.pathname);",
  "  }",
  "",
  "  function canonicalPath(lang) {",
  "    const products = isProductsPage();",
  "    if (lang === 'en') return products ? '/products.html' : '/';",
  "    return products ? '/' + lang + '/products/' : '/' + lang + '/';",
  "  }",
  "",
  "  function queryAndHashWithoutLanguage() {",
  "    const params = new URLSearchParams(location.search);",
  "    params.delete('lang');",
  "    const query = params.toString();",
  "    return (query ? '?' + query : '') + (location.hash || '');",
  "  }",
  "",
  "  function navigateLanguage(lang) {",
  "    if (!supported.has(lang)) return;",
  "    try { localStorage.setItem('frigonais-lang', lang); } catch (_) {}",
  "    const target = canonicalPath(lang) + queryAndHashWithoutLanguage();",
  "    const current = location.pathname + location.search + location.hash;",
  "    if (current !== target) location.assign(target);",
  "  }",
  "",
  "  window.frigonaisNavigateLanguage = navigateLanguage;",
  "",
  "  // Migrate old ?lang= links to the real localized static URL.",
  "  const requested = new URLSearchParams(location.search).get('lang');",
  "  if (supported.has(requested)) {",
  "    const target = canonicalPath(requested) + queryAndHashWithoutLanguage();",
  "    const current = location.pathname + location.search + location.hash;",
  "    if (current !== target) location.replace(target);",
  "  }",
  "})();",
  ""
].join('\n');

// Assets currently use stable filenames. Revalidate them so an old JS bundle cannot fight a new HTML deploy.
headers = headers.replace(
  'Cache-Control: public, max-age=86400, stale-while-revalidate=604800',
  'Cache-Control: public, max-age=0, must-revalidate'
);

await Promise.all([
  writeFile(legacyUrl, legacy),
  writeFile(siteUrl, site),
  writeFile(routingUrl, routing),
  writeFile(headersUrl, headers)
]);

console.log('Restored IQF frozen-fruit labels and unified canonical language switching.');
