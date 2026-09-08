import { readFile, writeFile } from 'node:fs/promises';

const marker = '/* FRIGONAIS_BUILD_PRODUCT_FOCUS */';
const i18nUrl = new URL('../assets/i18n.js', import.meta.url);
const focusUrl = new URL('../assets/product-focus.js', import.meta.url);

let i18nSource = await readFile(i18nUrl, 'utf8');
const focusSource = await readFile(focusUrl, 'utf8');
if (!i18nSource.includes(marker)) {
  i18nSource = `${i18nSource.trimEnd()}\n\n${marker}\n${focusSource}\n`;
  await writeFile(i18nUrl, i18nSource);
}

const sharedReplacements = [
  [
    'Individually Quick Frozen sour cherries, raspberries, strawberries, blackberries, blueberries and plums. IQF processing helps preserve freshness, nutritional value and natural flavor.',
    'Key frozen products include sour cherry, frozen diced apple and machine-cut plum. IQF sour cherry and plum are available alongside additional frozen fruit formats.'
  ],
  [
    'Smooth, consistent purées optimized for the beverage, dairy, and confectionery industries. Single-fruit and blended formats available.',
    'Fruit purées with a focus on plum and prune (dried plum), with sour cherry purée also available for industrial food applications.'
  ],
  ['data-i18n="tag_raspberry">Raspberry</span>', 'data-i18n="tag_diced_apple">Frozen diced apple</span>'],
  ['data-i18n="tag_strawberry">Strawberry</span>', 'data-i18n="tag_cut_plum">Machine-cut plum</span>'],
  ['                        <span class="text-[11px] px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-600 font-medium" data-i18n="tag_blackberry">Blackberry</span>\n', ''],
  ['                        <span class="text-[11px] px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-600 font-medium" data-i18n="tag_plum">Plum</span>\n', '']
];

const pureeParagraph = '<p class="text-neutral-500 text-sm mt-2 leading-relaxed" data-i18n="p3_desc">Fruit purées with a focus on plum and prune (dried plum), with sour cherry purée also available for industrial food applications.</p>';
const pureeTags = `${pureeParagraph}\n                    <div class="flex flex-wrap gap-1.5 mt-4">\n                        <span class="text-[11px] px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-600 font-medium" data-i18n="tag_puree_plum">Plum purée</span>\n                        <span class="text-[11px] px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-600 font-medium" data-i18n="tag_puree_prune">Prune purée</span>\n                        <span class="text-[11px] px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-600 font-medium" data-i18n="tag_puree_sour_cherry">Sour cherry purée</span>\n                    </div>`;

for (const page of ['index.html', 'products.html']) {
  const url = new URL(`../${page}`, import.meta.url);
  let html = await readFile(url, 'utf8');
  for (const [from, to] of sharedReplacements) html = html.replaceAll(from, to);
  if (!html.includes('data-i18n="tag_puree_plum"')) html = html.replaceAll(pureeParagraph, pureeTags);

  html = html
    .replaceAll('data-i18n="dd_puree_sub">For dairy, bakery & beverage', 'data-i18n="dd_puree_sub">For beverage, dairy & food production')
    .replaceAll('data-i18n="p3_name">Purées & Fillings', 'data-i18n="p3_name">Fruit Purées');

  if (page === 'index.html') {
    html = html
      .replaceAll(
        'IQF frozen fruit, fruit purées, jams, thermostable fillings and custom preparations for food manufacturers across 15+ international markets.',
        'Frozen sour cherry, frozen diced apple, machine-cut plum, fruit purées and other fruit preparations for food manufacturers across 15+ international markets.'
      )
      .replaceAll('data-i18n="core_iqf">IQF Fruit', 'data-i18n="core_frozen_cherry">Frozen Sour Cherry')
      .replaceAll('data-i18n="core_purees">Fruit Purées', 'data-i18n="core_diced_apple">Frozen Diced Apple')
      .replaceAll('data-i18n="core_thermostable">Thermostable Fillings', 'data-i18n="core_cut_plum">Machine-Cut Plum')
      .replaceAll('data-i18n="core_custom">Custom Formulations', 'data-i18n="core_plum_prune_purees">Plum & Prune Purées')
      .replaceAll(
        'Through both hot and cold processing methods, we transform locally sourced fruits into a comprehensive range of B2B ingredients: frozen fruit (IQF), jams, fruit purées, thermostable masses, yogurt fruit preparations, and custom fruit fillings — serving food manufacturers, bakeries, dairies, and distributors worldwide.',
        'Through hot and cold processing, we transform locally sourced fruit into B2B ingredients including frozen fruit, fruit purées, jams and custom fruit preparations for food manufacturers, dairies and distributors worldwide.'
      )
      .replaceAll(
        'State-of-the-art hot and cold processing lines enabling frozen, ambient, and heat-stable product formats.',
        'Modern hot and cold processing lines support frozen, puréed and custom fruit formats for industrial food production.'
      )
      .replaceAll(
        'A broad processing portfolio supports frozen, ambient, thermostable and custom fruit formats.',
        'A broad processing portfolio supports frozen fruit, purées, jams and custom fruit preparations.'
      )
      .replaceAll(
        'Our product portfolio covers the full spectrum of processed fruit ingredients — from IQF frozen fruit to heat-stable bakery fillings — all produced to the highest international quality standards.',
        'Our portfolio focuses on frozen fruit, fruit purées, jams and other processed fruit ingredients produced to high international quality standards.'
      )
      .replaceAll(
        'Frigonais is a Serbian B2B fruit ingredient producer supplying IQF frozen fruit, fruit purées, jams, thermostable fillings and custom fruit preparations to international food manufacturers.',
        'Frigonais is a Serbian B2B fruit ingredient producer supplying frozen sour cherry, frozen diced apple, machine-cut plum, fruit purées and other fruit preparations to international food manufacturers.'
      )
      .replaceAll(
        'Certified B2B fruit ingredients for food manufacturers worldwide. IQF fruit, purées, jams, thermostable fillings and custom formulations.',
        'B2B fruit ingredients for food manufacturers worldwide, with a focus on frozen sour cherry, frozen diced apple, machine-cut plum and plum and prune purées.'
      );
  }

  await writeFile(url, html);
}

const seoUrl = new URL('./seo-build.mjs', import.meta.url);
let seoSource = await readFile(seoUrl, 'utf8');
const seoReplacements = [
  [
    "homeDescription: 'Serbian B2B fruit ingredient producer supplying IQF frozen fruit, fruit purées, jams, thermostable fillings and custom fruit preparations to food manufacturers worldwide.'",
    "homeDescription: 'Serbian B2B fruit ingredient producer focused on frozen sour cherry, frozen diced apple, machine-cut plum, plum and prune purées, and other fruit preparations for food manufacturers worldwide.'"
  ],
  [
    "homeDescription: 'Srpski B2B proizvođač voćnih sastojaka: IQF smrznuto voće, voćni pirei, džemovi, termostabilna punjenja i preparati po meri za prehrambenu industriju.'",
    "homeDescription: 'Srpski B2B proizvođač voćnih sastojaka sa fokusom na smrznutu višnju, smrznutu jabuku na kockice, mašinski sečenu šljivu, pire od šljive i suve šljive i druge voćne preparate.'"
  ],
  [
    "homeDescription: '塞尔维亚 B2B 水果原料生产商，为全球食品制造商供应 IQF 速冻水果、果泥、果酱、耐烘焙水果馅料和定制水果配料。'",
    "homeDescription: '塞尔维亚 B2B 水果原料生产商，重点供应冷冻酸樱桃、冷冻苹果丁、机械切割李子、李子和西梅果泥及其他水果配料。'"
  ],
  [
    "homeDescription: 'منتج صربي لمكونات الفاكهة B2B يورد الفاكهة المجمدة IQF وهريس الفاكهة والمربى والحشوات المقاومة للحرارة وتحضيرات الفاكهة المخصصة لمصنعي الأغذية.'",
    "homeDescription: 'منتج صربي لمكونات الفاكهة B2B يركز على الكرز الحامض المجمد ومكعبات التفاح المجمدة والبرقوق المقطع آلياً وهريس البرقوق والقراصيا وتحضيرات الفاكهة الأخرى.'"
  ]
];
for (const [from, to] of seoReplacements) seoSource = seoSource.replace(from, to);
await writeFile(seoUrl, seoSource);

console.log('Applied priority fruit focus and removed bakery fillings from homepage positioning.');
