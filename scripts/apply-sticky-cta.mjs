import { readFile, writeFile } from 'node:fs/promises';

const homeUrl = new URL('../index.html', import.meta.url);
const cssUrl = new URL('../assets/site.css', import.meta.url);
const jsUrl = new URL('../assets/site.js', import.meta.url);

let home = await readFile(homeUrl, 'utf8');
let css = await readFile(cssUrl, 'utf8');
let js = await readFile(jsUrl, 'utf8');

home = home.replace(
  '<a href="#contact" class="hidden lg:inline-flex btn-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold" data-i18n="nav_quote">',
  '<a href="#contact" id="stickyQuoteCta" class="hidden lg:inline-flex sticky-quote-cta text-white rounded-lg text-sm font-semibold" data-i18n="nav_quote">'
);

const cssMarker = '/* FRIGONAIS_STICKY_QUOTE_CTA */';
if (!css.includes(cssMarker)) {
  css = `${css.trimEnd()}\n\n${cssMarker}\nbody[data-page="home"] .sticky-quote-cta {\n  max-width: 0;\n  opacity: 0;\n  overflow: hidden;\n  white-space: nowrap;\n  pointer-events: none;\n  padding: 0;\n  transform: translateY(-5px);\n  background: #D63A45;\n  border: 1px solid #E8505B;\n  transition: max-width .3s ease, opacity .22s ease, transform .22s ease, padding .3s ease, background .2s ease;\n}\nbody[data-page="home"] .sticky-quote-cta.is-visible {\n  max-width: 13rem;\n  opacity: 1;\n  pointer-events: auto;\n  padding: .625rem 1.25rem;\n  transform: translateY(0);\n}\nbody[data-page="home"] .sticky-quote-cta.is-visible:hover {\n  background: #B82D37;\n}\n`;
}

const oldStickyBlock = `  // Sticky nav subtle elevation.\n  const navbar = byId('navbar') || document.querySelector('nav.sticky');\n  if (navbar) {\n    const onScroll = () => navbar.classList.toggle('nav-scrolled', window.scrollY > 12);\n    onScroll();\n    window.addEventListener('scroll', onScroll, { passive: true });\n  }`;

const newStickyBlock = `  // Sticky nav elevation + delayed desktop CTA after the hero has been passed.\n  const navbar = byId('navbar') || document.querySelector('nav.sticky');\n  const stickyQuoteCta = byId('stickyQuoteCta');\n  const heroSection = document.querySelector('[aria-labelledby="hero-title"]');\n  if (navbar) {\n    const onScroll = () => {\n      navbar.classList.toggle('nav-scrolled', window.scrollY > 12);\n      if (stickyQuoteCta && heroSection && document.body.dataset.page === 'home') {\n        const heroPassed = heroSection.getBoundingClientRect().bottom <= navbar.offsetHeight + 8;\n        stickyQuoteCta.classList.toggle('is-visible', heroPassed);\n        stickyQuoteCta.setAttribute('aria-hidden', String(!heroPassed));\n        stickyQuoteCta.tabIndex = heroPassed ? 0 : -1;\n      }\n    };\n    onScroll();\n    window.addEventListener('scroll', onScroll, { passive: true });\n    window.addEventListener('resize', onScroll, { passive: true });\n  }`;

if (js.includes(oldStickyBlock)) js = js.replace(oldStickyBlock, newStickyBlock);

await Promise.all([
  writeFile(homeUrl, home),
  writeFile(cssUrl, css),
  writeFile(jsUrl, js)
]);

console.log('Configured delayed red sticky CTA after the landing hero.');
