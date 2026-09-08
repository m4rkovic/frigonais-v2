import { readFile, writeFile } from 'node:fs/promises';

const seoUrl = new URL('./seo-build.mjs', import.meta.url);
let source = await readFile(seoUrl, 'utf8');

const replacements = [
  ["homeTitle: 'Frigonais | B2B Fruit Ingredients from Serbia Since 1996'", "homeTitle: 'Frigonais | Fruit Processing Company from Serbia Since 1996'"],
  ["homeDescription: 'Serbian B2B fruit ingredient producer supplying IQF frozen fruit, fruit purées, jams, thermostable fillings and custom fruit preparations to food manufacturers worldwide.'", "homeDescription: 'Family-owned Serbian fruit processor founded in 1996, with production in Kuršumlija. The program includes frozen and dried fruit, fruit purée, jam and ingredients for fruit yogurt.'"],
  ["productsTitle: 'IQF Frozen Fruit, Purées & Fillings | Frigonais'", "productsTitle: 'Frozen Fruit, Fruit Purée, Jam & Fruit Products | Frigonais'"],
  ["productsDescription: 'Explore Frigonais B2B fruit ingredients from Serbia: IQF frozen fruit, jams, fruit purées, thermostable preparations, yogurt fruit bases and custom fruit fillings.'", "productsDescription: 'Frigonais production program: frozen fruit, jam, fruit purée, thermostable mass, ingredients for fruit yogurt, fruit fillings and dried fruit.'"],

  ["homeTitle: 'Frigonais | B2B Voćni Sastojci iz Srbije od 1996.'", "homeTitle: 'Frigonais | Prerada Voća u Srbiji od 1996.'"],
  ["homeDescription: 'Srpski B2B proizvođač voćnih sastojaka: IQF smrznuto voće, voćni pirei, džemovi, termostabilna punjenja i preparati po meri za prehrambenu industriju.'", "homeDescription: 'Porodična kompanija za preradu voća osnovana 1996. godine, sa proizvodnjom u Kuršumliji. Program obuhvata smrznuto i sušeno voće, voćni pire, džem i sastojke za voćni jogurt.'"],
  ["productsTitle: 'IQF Smrznuto Voće, Pirei i Punjenja | Frigonais'", "productsTitle: 'Smrznuto Voće, Voćni Pire i Džem | Frigonais'"],
  ["productsDescription: 'Pogledajte Frigonais B2B asortiman iz Srbije: IQF smrznuto voće, džemove, voćne piree, termostabilne preparate, baze za jogurt i voćna punjenja.'", "productsDescription: 'Proizvodni program Frigonaisa: smrznuto voće, džem, voćni pire, termostabilna masa, sastojci za voćni jogurt, voćna punjenja i sušeno voće.'"],

  ["homeTitle: 'Frigonais｜塞尔维亚 B2B 水果原料供应商｜始于1996'", "homeTitle: 'Frigonais｜塞尔维亚水果加工企业｜始于1996'"],
  ["homeDescription: '塞尔维亚 B2B 水果原料生产商，为全球食品制造商供应 IQF 速冻水果、果泥、果酱、耐烘焙水果馅料和定制水果配料。'", "homeDescription: 'Frigonais 是一家1996年创立的塞尔维亚家族水果加工企业，生产位于库尔舒姆利亚，产品包括冷冻和干燥水果、果泥、果酱及水果酸奶配料。'"],
  ["productsTitle: 'IQF速冻水果、果泥和水果馅料 | Frigonais'", "productsTitle: '冷冻水果、果泥、果酱及水果制品 | Frigonais'"],
  ["productsDescription: '了解 Frigonais 塞尔维亚 B2B 水果原料系列：IQF 速冻水果、果酱、果泥、耐热水果制品、酸奶水果基料和定制馅料。'", "productsDescription: 'Frigonais 产品包括冷冻水果、果酱、果泥、耐热水果制品、水果酸奶配料、水果馅料和干果。'"],

  ["homeTitle: 'Frigonais | مكونات فاكهة B2B من صربيا منذ 1996'", "homeTitle: 'Frigonais | شركة صربية لمعالجة الفاكهة منذ 1996'"],
  ["homeDescription: 'منتج صربي لمكونات الفاكهة B2B يورد الفاكهة المجمدة IQF وهريس الفاكهة والمربى والحشوات المقاومة للحرارة وتحضيرات الفاكهة المخصصة لمصنعي الأغذية.'", "homeDescription: 'Frigonais شركة عائلية صربية لمعالجة الفاكهة تأسست عام 1996، ويقع الإنتاج في كورشومليا. يشمل البرنامج الفاكهة المجمدة والمجففة والهريس والمربى ومكونات زبادي الفاكهة.'"],
  ["productsTitle: 'فواكه IQF مجمدة وهريس وحشوات | Frigonais'", "productsTitle: 'فاكهة مجمدة وهريس ومربى ومنتجات فاكهة | Frigonais'"],
  ["productsDescription: 'اكتشف مجموعة Frigonais لمكونات الفاكهة B2B من صربيا: فواكه IQF مجمدة، مربى، هريس، تحضيرات مقاومة للحرارة، قواعد فاكهة للزبادي وحشوات مخصصة.'", "productsDescription: 'يشمل برنامج Frigonais الفاكهة المجمدة والمربى والهريس والكتل المستقرة حرارياً ومكونات زبادي الفاكهة وحشوات الفاكهة والفاكهة المجففة.'"]
];

for (const [from, to] of replacements) source = source.replace(from, to);

// Pre-render English from the same final translation source instead of leaving stale source copy in HTML.
source = source.replace("  if (lang === 'en') return html;\n", '');

source = source.replace(
  "    areaServed: ['Europe', 'North America', 'Middle East'],",
  "    areaServed: ['France', 'Italy', 'Germany', 'Austria', 'Greece'],"
);

source = source.replace(
`    knowsAbout: [
      'IQF frozen fruit',
      'fruit purées',
      'jams and fruit spreads',
      'thermostable fruit preparations',
      'fruit yogurt preparations',
      'fruit fillings'
    ],`,
`    knowsAbout: [
      'frozen fruit',
      'fruit and forest fruit processing',
      'fruit drying',
      'fruit purée',
      'jam',
      'thermostable mass',
      'fruit yogurt ingredients',
      'fruit fillings'
    ],`
);

await writeFile(seoUrl, source);
console.log('Patched SEO metadata and structured data to match the original Frigonais company profile.');
