import { readFile, writeFile } from 'node:fs/promises';

const marker = '/* FRIGONAIS_ORIGINAL_SITE_FINAL_LABELS */';
const i18nUrl = new URL('../assets/i18n.js', import.meta.url);
let i18n = await readFile(i18nUrl, 'utf8');

if (!i18n.includes(marker)) {
  i18n += `\n\n${marker}\nObject.assign(window.translations.en, {nav_quality:'Quality',nav_global:'Export',nav_sustain:'Production',c_at:'Austria',products_page_title:'Frigonais Production Program',catalogue_eyebrow:'Complete production program',catalogue_title:'Main Frigonais product groups',catalogue_desc:'Frozen fruit, jam, fruit purée, thermostable mass, fruit-yogurt ingredients and fruit fillings are listed among the main Frigonais products.',catalogue_cta_label:'Need product information?',catalogue_cta_title:'Contact the Frigonais team.'});\nObject.assign(window.translations.sr, {nav_quality:'Kvalitet',nav_global:'Izvoz',nav_sustain:'Proizvodnja',c_at:'Austrija',products_page_title:'Proizvodni Program Frigonaisa',catalogue_eyebrow:'Kompletan proizvodni program',catalogue_title:'Glavne grupe proizvoda Frigonaisa',catalogue_desc:'Smrznuto voće, džem, voćni pire, termostabilna masa, sastojci za voćni jogurt i voćna punjenja navedeni su među glavnim proizvodima Frigonaisa.',catalogue_cta_label:'Potrebne su vam informacije o proizvodu?',catalogue_cta_title:'Kontaktirajte tim Frigonaisa.'});\nObject.assign(window.translations.zh, {nav_quality:'质量',nav_global:'出口',nav_sustain:'生产',c_at:'奥地利',products_page_title:'Frigonais 生产计划',catalogue_eyebrow:'完整生产计划',catalogue_title:'Frigonais 主要产品类别',catalogue_desc:'主要产品包括冷冻水果、果酱、果泥、耐热水果制品、水果酸奶配料和水果馅料。',catalogue_cta_label:'需要产品信息？',catalogue_cta_title:'联系 Frigonais 团队。'});\nObject.assign(window.translations.ar, {nav_quality:'الجودة',nav_global:'التصدير',nav_sustain:'الإنتاج',c_at:'النمسا',products_page_title:'برنامج إنتاج Frigonais',catalogue_eyebrow:'برنامج الإنتاج الكامل',catalogue_title:'مجموعات منتجات Frigonais الرئيسية',catalogue_desc:'تشمل المنتجات الرئيسية الفاكهة المجمدة والمربى وهريس الفاكهة والكتلة المستقرة حرارياً ومكونات زبادي الفاكهة وحشوات الفاكهة.',catalogue_cta_label:'هل تحتاج إلى معلومات عن المنتج؟',catalogue_cta_title:'تواصل مع فريق Frigonais.'});\n`;
  await writeFile(i18nUrl, i18n);
}

const productsUrl = new URL('../products.html', import.meta.url);
let products = await readFile(productsUrl, 'utf8');
products = products
  .replaceAll('FSSC 22000 · Organic · HACCP · Kosher', 'HACCP')
  .replace('+381 18 259 044 · +381 63 657 099', '+381 18 259 044');
await writeFile(productsUrl, products);

console.log('Applied final original-profile navigation, catalogue and contact labels.');
