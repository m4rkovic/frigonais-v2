import { mkdir, readFile, writeFile } from 'node:fs/promises';
import vm from 'node:vm';

const BASE_URL = 'https://www.frigonais.com';
const BUILD_DIR = new URL('../build/', import.meta.url);
const I18N_FILE = new URL('../assets/i18n.js', import.meta.url);
const LANGS = ['en', 'sr', 'zh', 'ar'];

const localeMeta = {
  en: {
    htmlLang: 'en',
    ogLocale: 'en_US',
    homeTitle: 'Frigonais | B2B Fruit Ingredients from Serbia Since 1996',
    homeDescription: 'Serbian B2B fruit ingredient producer supplying IQF frozen fruit, fruit purées, jams, thermostable fillings and custom fruit preparations to food manufacturers worldwide.',
    productsTitle: 'IQF Frozen Fruit, Purées & Fillings | Frigonais',
    productsDescription: 'Explore Frigonais B2B fruit ingredients from Serbia: IQF frozen fruit, jams, fruit purées, thermostable preparations, yogurt fruit bases and custom fruit fillings.'
  },
  sr: {
    htmlLang: 'sr',
    ogLocale: 'sr_RS',
    homeTitle: 'Frigonais | B2B Voćni Sastojci iz Srbije od 1996.',
    homeDescription: 'Srpski B2B proizvođač voćnih sastojaka: IQF smrznuto voće, voćni pirei, džemovi, termostabilna punjenja i preparati po meri za prehrambenu industriju.',
    productsTitle: 'IQF Smrznuto Voće, Pirei i Punjenja | Frigonais',
    productsDescription: 'Pogledajte Frigonais B2B asortiman iz Srbije: IQF smrznuto voće, džemove, voćne piree, termostabilne preparate, baze za jogurt i voćna punjenja.'
  },
  zh: {
    htmlLang: 'zh-CN',
    ogLocale: 'zh_CN',
    homeTitle: 'Frigonais｜塞尔维亚 B2B 水果原料供应商｜始于1996',
    homeDescription: '塞尔维亚 B2B 水果原料生产商，为全球食品制造商供应 IQF 速冻水果、果泥、果酱、耐烘焙水果馅料和定制水果配料。',
    productsTitle: 'IQF速冻水果、果泥和水果馅料 | Frigonais',
    productsDescription: '了解 Frigonais 塞尔维亚 B2B 水果原料系列：IQF 速冻水果、果酱、果泥、耐热水果制品、酸奶水果基料和定制馅料。'
  },
  ar: {
    htmlLang: 'ar',
    ogLocale: 'ar_SA',
    homeTitle: 'Frigonais | مكونات فاكهة B2B من صربيا منذ 1996',
    homeDescription: 'منتج صربي لمكونات الفاكهة B2B يورد الفاكهة المجمدة IQF وهريس الفاكهة والمربى والحشوات المقاومة للحرارة وتحضيرات الفاكهة المخصصة لمصنعي الأغذية.',
    productsTitle: 'فواكه IQF مجمدة وهريس وحشوات | Frigonais',
    productsDescription: 'اكتشف مجموعة Frigonais لمكونات الفاكهة B2B من صربيا: فواكه IQF مجمدة، مربى، هريس، تحضيرات مقاومة للحرارة، قواعد فاكهة للزبادي وحشوات مخصصة.'
  }
};

const productIds = ['iqf', 'jams', 'purees', 'thermostable', 'yogurt', 'fillings'];
const productKeys = [
  ['p1_name', 'p1_desc'],
  ['p2_name', 'p2_desc'],
  ['p3_name', 'p3_desc'],
  ['p4_name', 'p4_desc'],
  ['p5_name', 'p5_desc'],
  ['p6_name', 'p6_desc']
];

function pagePaths(lang) {
  if (lang === 'en') return { home: '/', products: '/products.html' };
  return { home: `/${lang}/`, products: `/${lang}/products/` };
}

function absoluteUrl(path) {
  return `${BASE_URL}${path}`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function loadTranslations(source) {
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { filename: 'assets/i18n.js' });
  return sandbox.window.translations || {};
}

function localizeBody(html, lang, translations) {
  if (lang === 'en') return html;
  const values = translations[lang] || {};

  for (const [key, value] of Object.entries(values)) {
    const escaped = escapeRegExp(key);
    const elementPattern = new RegExp(`(<([a-zA-Z][\\w:-]*)\\b[^>]*\\bdata-i18n="${escaped}"[^>]*>)([\\s\\S]*?)(<\\/\\2>)`, 'g');
    html = html.replace(elementPattern, (_match, open, _tag, _old, close) => `${open}${value}${close}`);

    const placeholderPattern = new RegExp(`(<[a-zA-Z][^>]*\\bdata-i18n-placeholder="${escaped}"[^>]*>)`, 'g');
    html = html.replace(placeholderPattern, (tag) => {
      const escapedValue = String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      if (/\\bplaceholder="[^"]*"/.test(tag)) return tag.replace(/\\bplaceholder="[^"]*"/, `placeholder="${escapedValue}"`);
      return tag.replace(/>$/, ` placeholder="${escapedValue}">`);
    });
  }

  return html;
}

function normalizeAssetUrls(html) {
  return html
    .replace(/href="assets\//g, 'href="/assets/')
    .replace(/src="assets\//g, 'src="/assets/');
}

function removeTailwindRuntime(html) {
  html = html.replace(/\s*<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>\s*<script>\s*tailwind\.config\s*=\s*[\s\S]*?<\/script>/, '\n    <link rel="stylesheet" href="/assets/tailwind.css" />');
  if (!html.includes('/assets/tailwind.css')) {
    html = html.replace(/<link rel="stylesheet" href="\/assets\/site\.css" \/>/, '<link rel="stylesheet" href="/assets/tailwind.css" />\n    <link rel="stylesheet" href="/assets/site.css" />');
  }
  return html;
}

function removeProductsTurnstile(html, page) {
  if (page !== 'products') return html;
  return html.replace(/\s*<script src="https:\/\/challenges\.cloudflare\.com\/turnstile\/v0\/api\.js\?[^\"]+" defer><\/script>/, '');
}

function rewriteInternalLinks(html, lang) {
  const paths = pagePaths(lang);
  return html.replace(/href="([^"]+)"/g, (match, href) => {
    if (href.startsWith('index.html')) return `href="${paths.home}${href.slice('index.html'.length)}"`;
    if (href.startsWith('products.html')) return `href="${paths.products}${href.slice('products.html'.length)}"`;
    return match;
  });
}

function hreflangMarkup(page) {
  const key = page === 'home' ? 'home' : 'products';
  return [
    `<link rel="alternate" hreflang="en" href="${absoluteUrl(pagePaths('en')[key])}" />`,
    `<link rel="alternate" hreflang="sr" href="${absoluteUrl(pagePaths('sr')[key])}" />`,
    `<link rel="alternate" hreflang="zh" href="${absoluteUrl(pagePaths('zh')[key])}" />`,
    `<link rel="alternate" hreflang="ar" href="${absoluteUrl(pagePaths('ar')[key])}" />`,
    `<link rel="alternate" hreflang="x-default" href="${absoluteUrl(pagePaths('en')[key])}" />`
  ].map((line) => `    ${line}`).join('\n');
}

function structuredData(lang, page, translations) {
  const paths = pagePaths(lang);
  const pagePath = page === 'home' ? paths.home : paths.products;
  const url = absoluteUrl(pagePath);
  const t = translations[lang] || translations.en || {};
  const meta = localeMeta[lang];
  const title = page === 'home' ? meta.homeTitle : meta.productsTitle;
  const description = page === 'home' ? meta.homeDescription : meta.productsDescription;

  const organization = {
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: 'Frigonais D.O.O.',
    legalName: 'Frigonais D.O.O.',
    url: `${BASE_URL}/`,
    logo: `${BASE_URL}/assets/frigonais-logo-green.svg`,
    image: `${BASE_URL}/assets/og-image.png`,
    description: meta.homeDescription,
    foundingDate: '1996',
    email: 'frigonais@gmail.com',
    telephone: '+381 18 259 044',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Ulica Mladih 4',
      postalCode: '18000',
      addressLocality: 'Niš',
      addressCountry: 'RS'
    },
    location: [
      {
        '@type': 'Place',
        name: 'Frigonais Headquarters',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Ulica Mladih 4',
          postalCode: '18000',
          addressLocality: 'Niš',
          addressCountry: 'RS'
        }
      },
      {
        '@type': 'Place',
        name: 'Frigonais Production',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Kuršumlija',
          addressCountry: 'RS'
        }
      }
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        telephone: '+381 18 259 044',
        email: 'frigonais@gmail.com',
        availableLanguage: ['English', 'Serbian', 'Chinese', 'Arabic']
      },
      {
        '@type': 'ContactPoint',
        contactType: 'production',
        telephone: '+381 27 381 751',
        email: 'frigonaiskursumlija@gmail.com'
      }
    ],
    areaServed: ['Europe', 'North America', 'Middle East'],
    knowsAbout: [
      'IQF frozen fruit',
      'fruit purées',
      'jams and fruit spreads',
      'thermostable fruit preparations',
      'fruit yogurt preparations',
      'fruit fillings'
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: t.prod_title || 'Fruit Ingredient Solutions',
      itemListElement: productKeys.map(([nameKey, descKey], index) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: t[nameKey] || translations.en?.[nameKey],
          description: t[descKey] || translations.en?.[descKey],
          url: `${absoluteUrl(paths.products)}#${productIds[index]}`
        }
      }))
    }
  };

  const website = {
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: `${BASE_URL}/`,
    name: 'Frigonais',
    alternateName: 'Frigonais D.O.O.',
    publisher: { '@id': `${BASE_URL}/#organization` },
    inLanguage: ['en', 'sr', 'zh-CN', 'ar']
  };

  const webpage = {
    '@type': page === 'products' ? 'CollectionPage' : 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: title,
    description,
    inLanguage: meta.htmlLang,
    isPartOf: { '@id': `${BASE_URL}/#website` },
    about: { '@id': `${BASE_URL}/#organization` }
  };

  const graph = [organization, website, webpage];

  if (page === 'products') {
    const breadcrumb = {
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: t.nav_about ? 'Frigonais' : 'Frigonais', item: absoluteUrl(paths.home) },
        { '@type': 'ListItem', position: 2, name: t.nav_products || 'Products', item: url }
      ]
    };
    const itemList = {
      '@type': 'ItemList',
      '@id': `${url}#products`,
      name: t.prod_title || 'Frigonais Product Range',
      numberOfItems: productIds.length,
      itemListElement: productKeys.map(([nameKey, descKey], index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: t[nameKey] || translations.en?.[nameKey],
          description: t[descKey] || translations.en?.[descKey],
          url: `${url}#${productIds[index]}`,
          brand: { '@id': `${BASE_URL}/#organization` },
          manufacturer: { '@id': `${BASE_URL}/#organization` }
        }
      }))
    };
    webpage.breadcrumb = { '@id': `${url}#breadcrumb` };
    webpage.mainEntity = { '@id': `${url}#products` };
    graph.push(breadcrumb, itemList);
  }

  return `<script type="application/ld+json">\n${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2)}\n    </script>`;
}

function setHeadMetadata(html, lang, page, translations) {
  const meta = localeMeta[lang];
  const paths = pagePaths(lang);
  const path = page === 'home' ? paths.home : paths.products;
  const canonical = absoluteUrl(path);
  const title = page === 'home' ? meta.homeTitle : meta.productsTitle;
  const description = page === 'home' ? meta.homeDescription : meta.productsDescription;
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  html = html.replace(/<html lang="[^"]+" dir="[^"]+">/, `<html lang="${meta.htmlLang}" dir="${dir}">`);
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${description}" />`);
  html = html.replace(/<link rel="canonical" href="[^"]+" \/>/, `<link rel="canonical" href="${canonical}" />`);

  html = html.replace(/\s*<link rel="alternate" hreflang="(?:en|sr|zh|ar|x-default)" href="[^"]+" \/>/g, '');
  html = html.replace(/(<link rel="canonical" href="[^"]+" \/>)/, `$1\n${hreflangMarkup(page)}`);

  html = html.replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${title}" />`);
  html = html.replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${description}" />`);
  html = html.replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${canonical}" />`);

  html = html.replace(/\s*<meta property="og:locale(?::alternate)?" content="[^"]*" \/>/g, '');
  const localeAlternates = LANGS.filter((value) => value !== lang)
    .map((value) => `    <meta property="og:locale:alternate" content="${localeMeta[value].ogLocale}" />`)
    .join('\n');
  html = html.replace(
    /(<meta property="og:site_name" content="Frigonais" \/>)/,
    `$1\n    <meta property="og:locale" content="${meta.ogLocale}" />\n${localeAlternates}`
  );

  if (!html.includes('property="og:image:width"')) {
    html = html.replace(
      /(<meta property="og:image" content="[^"]+" \/>)/,
      `$1\n    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />\n    <meta property="og:image:alt" content="Frigonais fruit ingredients from Serbia" />`
    );
  }

  html = html.replace(/\s*<meta name="twitter:title" content="[^"]*" \/>/g, '');
  html = html.replace(/\s*<meta name="twitter:description" content="[^"]*" \/>/g, '');
  html = html.replace(/\s*<meta name="twitter:image" content="[^"]*" \/>/g, '');
  html = html.replace(/\s*<meta name="twitter:image:alt" content="[^"]*" \/>/g, '');
  html = html.replace(
    /(<meta name="twitter:card" content="summary_large_image" \/>)/,
    `$1\n    <meta name="twitter:title" content="${title}" />\n    <meta name="twitter:description" content="${description}" />\n    <meta name="twitter:image" content="${BASE_URL}/assets/og-image.png" />\n    <meta name="twitter:image:alt" content="Frigonais fruit ingredients from Serbia" />`
  );

  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, structuredData(lang, page, translations));

  return html;
}

function injectLanguageRouting(html) {
  if (html.includes('/assets/lang-routing.js')) return html;
  return html.replace(
    '<script src="/assets/site.js" defer></script>',
    '<script src="/assets/lang-routing.js" defer></script>\n    <script src="/assets/site.js" defer></script>'
  );
}

function transform(html, lang, page, translations) {
  html = normalizeAssetUrls(html);
  html = removeTailwindRuntime(html);
  html = removeProductsTurnstile(html, page);
  html = localizeBody(html, lang, translations);
  html = rewriteInternalLinks(html, lang);
  html = setHeadMetadata(html, lang, page, translations);
  html = injectLanguageRouting(html);
  return html;
}

function sitemapXml() {
  const lastmod = new Date().toISOString().slice(0, 10);
  const groups = [
    { key: 'home', priority: '1.0' },
    { key: 'products', priority: '0.9' }
  ];

  const entries = [];
  for (const group of groups) {
    for (const lang of LANGS) {
      const loc = absoluteUrl(pagePaths(lang)[group.key]);
      const alternates = LANGS.map((altLang) => {
        const href = absoluteUrl(pagePaths(altLang)[group.key]);
        return `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${href}" />`;
      }).join('\n');
      const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl(pagePaths('en')[group.key])}" />`;
      entries.push(`  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${group.priority}</priority>\n${alternates}\n${xDefault}\n  </url>`);
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>\n`;
}

const [homeTemplate, productsTemplate, i18nSource] = await Promise.all([
  readFile(new URL('index.html', BUILD_DIR), 'utf8'),
  readFile(new URL('products.html', BUILD_DIR), 'utf8'),
  readFile(I18N_FILE, 'utf8')
]);

const translations = loadTranslations(i18nSource);

await writeFile(new URL('index.html', BUILD_DIR), transform(homeTemplate, 'en', 'home', translations));
await writeFile(new URL('products.html', BUILD_DIR), transform(productsTemplate, 'en', 'products', translations));

for (const lang of LANGS.filter((value) => value !== 'en')) {
  const homeDir = new URL(`${lang}/`, BUILD_DIR);
  const productsDir = new URL(`${lang}/products/`, BUILD_DIR);
  await mkdir(homeDir, { recursive: true });
  await mkdir(productsDir, { recursive: true });
  await writeFile(new URL('index.html', homeDir), transform(homeTemplate, lang, 'home', translations));
  await writeFile(new URL('index.html', productsDir), transform(productsTemplate, lang, 'products', translations));
}

await writeFile(new URL('sitemap.xml', BUILD_DIR), sitemapXml());

console.log('SEO build complete: localized pages, metadata, structured data, sitemap and production CSS wiring generated.');
