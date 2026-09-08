(() => {
  'use strict';

  const supported = new Set(['en', 'sr', 'zh', 'ar']);

  function isProductsPage() {
    return document.body?.dataset.page === 'products' || /\/products(?:\/|\.html)?$/.test(location.pathname);
  }

  function canonicalPath(lang) {
    const products = isProductsPage();
    if (lang === 'en') return products ? '/products.html' : '/';
    return products ? `/${lang}/products/` : `/${lang}/`;
  }

  function queryAndHashWithoutLanguage() {
    const params = new URLSearchParams(location.search);
    params.delete('lang');
    const query = params.toString();
    return `${query ? `?${query}` : ''}${location.hash || ''}`;
  }

  document.addEventListener('click', (event) => {
    const option = event.target.closest('[data-lang-select]');
    if (!option) return;

    const lang = option.dataset.langSelect;
    if (!supported.has(lang)) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    try { localStorage.setItem('frigonais-lang', lang); } catch (_) {}
    location.assign(`${canonicalPath(lang)}${queryAndHashWithoutLanguage()}`);
  }, true);

  const requested = new URLSearchParams(location.search).get('lang');
  const pathLang = location.pathname.split('/').filter(Boolean)[0];
  if (supported.has(requested) && !supported.has(pathLang)) {
    const target = `${canonicalPath(requested)}${queryAndHashWithoutLanguage()}`;
    if (`${location.pathname}${location.search}${location.hash}` !== target) location.replace(target);
  }
})();
