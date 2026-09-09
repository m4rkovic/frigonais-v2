import { readFile, writeFile } from 'node:fs/promises';

const legacyUrl = new URL('../assets/legacy-source-truth.js', import.meta.url);
const siteUrl = new URL('../assets/site.js', import.meta.url);
const routingUrl = new URL('../assets/lang-routing.js', import.meta.url);
const headersUrl = new URL('../_headers', import.meta.url);

let legacy = await readFile(legacyUrl, 'utf8');
let site = await readFile(siteUrl, 'utf8');
let headers = await readFile(headersUrl, 'utf8');

// IQF belongs only to the frozen-fruit product label.
legacy = legacy
  .replaceAll("core_iqf: 'Frozen Fruit'", "core_iqf: 'IQF Frozen Fruit'")
  .replaceAll("p1_name: 'Frozen Fruit'", "p1_name: 'IQF Frozen Fruit'")
  .replaceAll("core_iqf: 'Smrznuto voće'", "core_iqf: 'IQF smrznuto voće'")
  .replaceAll("p1_name: 'Smrznuto voće'", "p1_name: 'IQF smrznuto voće'")
  .replaceAll("core_iqf: '冷冻水果'", "core_iqf: 'IQF 速冻水果'")
  .replaceAll("p1_name: '冷冻水果'", "p1_name: 'IQF 速冻水果'")
  .replaceAll("core_iqf: 'فاكهة مجمدة'", "core_iqf: 'فاكهة مجمدة IQF'")
  .replaceAll("p1_name: 'فاكهة مجمدة'", "p1_name: 'فاكهة مجمدة IQF'");

// The canonical language router is the only code that changes language URLs.
const oldSetLanguage = `  function setLanguage(lang, persist = true) {\n    applyLanguage(lang);\n    if (persist) {\n      try { localStorage.setItem('frigonais-lang', lang); } catch (_) {}\n      const url = new URL(location.href);\n      url.searchParams.set('lang', lang);\n      history.replaceState({}, '', url);\n    }\n  }`;
const newSetLanguage = `  function setLanguage(lang, persist = true) {\n    if (persist && typeof window.frigonaisNavigateLanguage === 'function') {\n      window.frigonaisNavigateLanguage(lang);\n      return;\n    }\n    applyLanguage(lang);\n    if (persist) {\n      try { localStorage.setItem('frigonais-lang', lang); } catch (_) {}\n    }\n  }`;
if (site.includes(oldSetLanguage)) site = site.replace(oldSetLanguage, newSetLanguage);

const routing = `(() => {\n  'use strict';\n\n  const supported = new Set(['en', 'sr', 'zh', 'ar']);\n  window.FRIGONAIS_LANG_ROUTER_ACTIVE = true;\n\n  function isProductsPage() {\n    return document.body?.dataset.page === 'products' || /\\/products(?:\\/|\\.html)?$/.test(location.pathname);\n  }\n\n  function canonicalPath(lang) {\n    const products = isProductsPage();\n    if (lang === 'en') return products ? '/products.html' : '/';\n    return products ? \\`/\\${lang}/products/\\` : \\`/\\${lang}/\\`;\n  }\n\n  function queryAndHashWithoutLanguage() {\n    const params = new URLSearchParams(location.search);\n    params.delete('lang');\n    const query = params.toString();\n    return \\`\\${query ? \\`?\\${query}\\` : ''}\\${location.hash || ''}\\`;\n  }\n\n  function navigateLanguage(lang) {\n    if (!supported.has(lang)) return;\n    try { localStorage.setItem('frigonais-lang', lang); } catch (_) {}\n    const target = \\`\\${canonicalPath(lang)}\\${queryAndHashWithoutLanguage()}\\`;\n    const current = \\`\\${location.pathname}\\${location.search}\\${location.hash}\\`;\n    if (current !== target) location.assign(target);\n  }\n\n  window.frigonaisNavigateLanguage = navigateLanguage;\n\n  // Clean up legacy ?lang= URLs and route them to the canonical localized path.\n  const requested = new URLSearchParams(location.search).get('lang');\n  if (supported.has(requested)) {\n    const target = \\`\\${canonicalPath(requested)}\\${queryAndHashWithoutLanguage()}\\`;\n    const current = \\`\\${location.pathname}\\${location.search}\\${location.hash}\\`;\n    if (current !== target) location.replace(target);\n  }\n})();\n`;

// Mutable JS/CSS use stable URLs, so force revalidation to avoid stale language code after deploys.
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
