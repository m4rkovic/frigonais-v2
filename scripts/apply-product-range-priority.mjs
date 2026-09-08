import { readFile, writeFile } from 'node:fs/promises';

const marker = '/* FRIGONAIS_PRODUCT_RANGE_PRIORITY */';
const i18nUrl = new URL('../assets/i18n.js', import.meta.url);
const priorityUrl = new URL('../assets/product-range-priority.js', import.meta.url);

let i18nSource = await readFile(i18nUrl, 'utf8');
const prioritySource = await readFile(priorityUrl, 'utf8');
if (!i18nSource.includes(marker)) {
  i18nSource = `${i18nSource.trimEnd()}\n\n${marker}\n${prioritySource}\n`;
  await writeFile(i18nUrl, i18nSource);
}

const frozenTags = `<div class="flex flex-wrap gap-1.5 mt-4">
                        <span class="text-[11px] px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-600 font-medium" data-i18n="tag_cherry">Sour cherry</span>
                        <span class="text-[11px] px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-600 font-medium" data-i18n="tag_plum">Plum</span>
                        <span class="text-[11px] px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-600 font-medium" data-i18n="tag_raspberry">Raspberry</span>
                        <span class="text-[11px] px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-600 font-medium" data-i18n="tag_blackberry">Blackberry</span>
                        <span class="text-[11px] px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-600 font-medium" data-i18n="tag_blueberry">Blueberry</span>
                        <span class="text-[11px] px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-600 font-medium" data-i18n="tag_apricot">Apricot</span>
                    </div>`;

const pureeTags = `<div class="flex flex-wrap gap-1.5 mt-4">
                        <span class="text-[11px] px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-600 font-medium" data-i18n="tag_puree_cherry">Sour cherry</span>
                        <span class="text-[11px] px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-600 font-medium" data-i18n="tag_puree_plum">Plum</span>
                        <span class="text-[11px] px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-600 font-medium" data-i18n="tag_puree_prune">Prune</span>
                        <span class="text-[11px] px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-600 font-medium" data-i18n="tag_puree_rosehip">Rosehip</span>
                        <span class="text-[11px] px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-600 font-medium" data-i18n="tag_puree_blackberry">Blackberry</span>
                        <span class="text-[11px] px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-600 font-medium" data-i18n="tag_puree_raspberry">Raspberry</span>
                        <span class="text-[11px] px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-600 font-medium" data-i18n="tag_puree_apricot">Apricot</span>
                    </div>`;

const orderMap = { 1: 1, 2: 3, 3: 2, 4: 4, 5: 5, 6: 6 };

for (const page of ['index.html', 'products.html']) {
  const url = new URL(`../${page}`, import.meta.url);
  let html = await readFile(url, 'utf8');

  html = html.replace(
    /(<p[^>]*data-i18n="p1_desc"[^>]*>[\s\S]*?<\/p>)\s*<div class="flex flex-wrap gap-1\.5 mt-4">[\s\S]*?<\/div>/g,
    `$1\n                    ${frozenTags}`
  );

  html = html.replace(
    /(<p[^>]*data-i18n="p3_desc"[^>]*>[\s\S]*?<\/p>)(?:\s*<div class="flex flex-wrap gap-1\.5 mt-4">[\s\S]*?<\/div>)?/g,
    `$1\n                    ${pureeTags}`
  );

  for (const [productNumber, order] of Object.entries(orderMap)) {
    const pattern = new RegExp(`(<!-- Prod ${productNumber} -->\\s*<div)(?![^>]*\\bstyle=)`, 'g');
    html = html.replace(pattern, `$1 style="order:${order}"`);
  }

  html = html
    .replaceAll('Premium fruit ingredient supplier', 'Fruit-processing company')
    .replaceAll('Premium Fruit Ingredients', 'Fruit Ingredients')
    .replaceAll('premium-grade fruit', 'selected fruit');

  await writeFile(url, html);
}

const seoUrl = new URL('./seo-build.mjs', import.meta.url);
let seo = await readFile(seoUrl, 'utf8');
seo = seo
  .replace(
    "const productIds = ['iqf', 'jams', 'purees', 'thermostable', 'yogurt', 'fillings'];",
    "const productIds = ['iqf', 'purees', 'jams', 'thermostable', 'yogurt', 'fillings'];"
  )
  .replace(
    "  ['p1_name', 'p1_desc'],\n  ['p2_name', 'p2_desc'],\n  ['p3_name', 'p3_desc'],",
    "  ['p1_name', 'p1_desc'],\n  ['p3_name', 'p3_desc'],\n  ['p2_name', 'p2_desc'],"
  )
  .replace(
    "productsDescription: 'Frigonais production program: frozen fruit, jam, fruit purée, thermostable mass, ingredients for fruit yogurt, fruit fillings and dried fruit.'",
    "productsDescription: 'Frigonais production program led by frozen fruit and fruit purées, with sour cherry and plum among key products, plus jam and other processed fruit products.'"
  )
  .replace(
    "productsDescription: 'Proizvodni program Frigonaisa: smrznuto voće, džem, voćni pire, termostabilna masa, sastojci za voćni jogurt, voćna punjenja i sušeno voće.'",
    "productsDescription: 'Proizvodni program Frigonaisa predvode smrznuto voće i voćni pirei, sa višnjom i šljivom među važnim proizvodima, uz džem i druge prerađene voćne proizvode.'"
  )
  .replace(
    "      'frozen fruit',\n      'fruit and forest fruit processing',\n      'fruit drying',\n      'fruit purée',",
    "      'frozen fruit',\n      'fruit purée',\n      'fruit processing',\n      'fruit drying',"
  );
await writeFile(seoUrl, seo);

console.log('Applied Frigonais frozen-fruit and purée ranges, product priority and restrained marketing copy.');
