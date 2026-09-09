import { readFile, writeFile } from 'node:fs/promises';

const marker = '/* FRIGONAIS_LEGACY_SOURCE_TRUTH */';
const i18nUrl = new URL('../assets/i18n.js', import.meta.url);
const legacyUrl = new URL('../assets/legacy-source-truth.js', import.meta.url);

let i18n = await readFile(i18nUrl, 'utf8');
let legacy = await readFile(legacyUrl, 'utf8');

// Keep source provenance out of the public-facing prose while preserving the facts.
legacy = legacy
  .replaceAll('The original Frigonais site states annual exports of around five million euros.', 'Annual exports are around five million euros.')
  .replaceAll('Na originalnom sajtu naveden je godišnji izvoz u vrednosti od oko pet miliona evra.', 'Godišnji izvoz iznosi oko pet miliona evra.')
  .replaceAll('Frigonais 原网站注明年出口额约为500万欧元。', '年出口额约为500万欧元。')
  .replaceAll('يذكر موقع Frigonais الأصلي أن قيمة الصادرات السنوية تبلغ نحو خمسة ملايين يورو.', 'تبلغ قيمة الصادرات السنوية نحو خمسة ملايين يورو.')
  .replaceAll('The Frigonais site presents FSSC, HACCP and Kosher certifications.', 'Frigonais certifications include FSSC, HACCP and Kosher.')
  .replaceAll('Na Frigonais sajtu prikazani su FSSC, HACCP i Kosher sertifikati.', 'Frigonais poseduje FSSC, HACCP i Kosher sertifikate.')
  .replaceAll('Frigonais 网站展示了 FSSC、HACCP 和 Kosher 认证。', 'Frigonais 拥有 FSSC、HACCP 和 Kosher 认证。')
  .replaceAll('يعرض موقع Frigonais شهادات FSSC وHACCP وKosher.', 'تمتلك Frigonais شهادات FSSC وHACCP وKosher.');

if (!i18n.includes(marker)) {
  i18n = `${i18n.trimEnd()}\n\n${marker}\n${legacy}\n`;
  await writeFile(i18nUrl, i18n);
}

const trustSection = `<!-- ==================== TRUST STRIP ==================== -->
<section class="relative z-20 -mt-8 px-6" aria-label="Frigonais company facts">
  <div class="trust-strip max-w-5xl mx-auto bg-white rounded-2xl border border-neutral-200 px-5 sm:px-7 py-4 flex gap-5 sm:gap-8 items-center justify-between overflow-x-auto">
    <div class="trust-item flex items-center gap-2 text-sm font-semibold text-neutral-700"><span class="w-7 h-7 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center">✓</span>FSSC</div>
    <div class="trust-item flex items-center gap-2 text-sm font-semibold text-neutral-700"><span class="w-7 h-7 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center">✓</span>HACCP</div>
    <div class="trust-item flex items-center gap-2 text-sm font-semibold text-neutral-700"><span class="w-7 h-7 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center">✓</span>Kosher</div>
    <div class="trust-item flex items-center gap-2 text-sm font-semibold text-neutral-700"><span class="w-7 h-7 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center">✓</span>120+ employees</div>
    <div class="trust-item flex items-center gap-2 text-sm font-semibold text-neutral-700"><span class="w-7 h-7 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center">✓</span>≈ €5M exports / year</div>
  </div>
</section>`;

const goalsSection = `<!-- ==================== WHY FRIGONAIS ==================== -->
<section class="py-18 lg:py-22 bg-neutral-50 border-y border-neutral-100">
  <div class="max-w-7xl mx-auto px-6 lg:px-8 py-16">
    <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10 reveal">
      <div class="max-w-2xl">
        <div class="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3" data-i18n="why_label">Goals</div>
        <h2 class="text-3xl lg:text-4xl font-bold text-neutral-900 leading-tight" data-i18n="why_title" data-i18n-html="true">Development with <span class="font-serif italic font-normal text-brand-700">clear goals</span></h2>
      </div>
      <p class="text-neutral-500 max-w-md leading-relaxed" data-i18n="why_desc">Frigonais continues to introduce new technologies and sustainable energy sources while keeping the focus on quality and healthy products.</p>
    </div>
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <article class="why-card bg-white rounded-xl p-6 border border-neutral-200 reveal"><div class="w-10 h-10 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center text-lg">↗</div><h3 class="font-bold text-neutral-900 mt-4" data-i18n="why1_title">Innovation</h3><p class="text-sm text-neutral-500 mt-2 leading-relaxed" data-i18n="why1_desc">The company introduces new technologies year after year.</p></article>
      <article class="why-card bg-white rounded-xl p-6 border border-neutral-200 reveal"><div class="w-10 h-10 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center text-lg">☀</div><h3 class="font-bold text-neutral-900 mt-4" data-i18n="why2_title">Sustainable energy</h3><p class="text-sm text-neutral-500 mt-2 leading-relaxed" data-i18n="why2_desc">New sustainable energy sources are an important part of the company’s development.</p></article>
      <article class="why-card bg-white rounded-xl p-6 border border-neutral-200 reveal"><div class="w-10 h-10 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center text-lg">⚡</div><h3 class="font-bold text-neutral-900 mt-4" data-i18n="why3_title">Fleet electrification</h3><p class="text-sm text-neutral-500 mt-2 leading-relaxed" data-i18n="why3_desc">One of the key goals is complete electrification of the vehicle fleet.</p></article>
      <article class="why-card bg-white rounded-xl p-6 border border-neutral-200 reveal"><div class="w-10 h-10 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center text-lg">●</div><h3 class="font-bold text-neutral-900 mt-4" data-i18n="why4_title">Quality and healthy products</h3><p class="text-sm text-neutral-500 mt-2 leading-relaxed" data-i18n="why4_desc">The vision is to make quality, healthy products available to every consumer.</p></article>
    </div>
  </div>
</section>`;

const qualitySection = `<!-- ==================== QUALITY ==================== -->
<section id="quality" class="py-20 lg:py-28 bg-white">
  <div class="max-w-7xl mx-auto px-6 lg:px-8">
    <div class="grid lg:grid-cols-2 gap-16 items-start">
      <div class="reveal">
        <div class="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3" data-i18n="qual_label">Certifications</div>
        <h2 class="text-3xl lg:text-4xl font-bold text-neutral-900 leading-tight mb-6" data-i18n="qual_title" data-i18n-html="true">FSSC · HACCP · <span class="font-serif italic font-normal text-brand-700">Kosher</span></h2>
        <p class="text-neutral-500 leading-relaxed mb-8" data-i18n="qual_desc">Frigonais certifications include FSSC, HACCP and Kosher.</p>
        <div class="grid sm:grid-cols-3 gap-3 max-w-xl">
          <div class="bg-brand-50 rounded-xl border border-brand-100 p-5 text-center"><div class="font-bold text-brand-800 text-lg">FSSC</div></div>
          <div class="bg-brand-50 rounded-xl border border-brand-100 p-5 text-center"><div class="font-bold text-brand-800 text-lg">HACCP</div></div>
          <div class="bg-brand-50 rounded-xl border border-brand-100 p-5 text-center"><div class="font-bold text-brand-800 text-lg">Kosher</div></div>
        </div>
      </div>
      <div class="reveal">
        <div class="bg-neutral-50 rounded-2xl border border-neutral-200 p-8 lg:p-10">
          <div class="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-8" data-i18n="proc_label">Production Program</div>
          <div class="space-y-5">
            <div><div class="font-bold text-neutral-800" data-i18n="step1_title">Hot and cold processing</div><div class="text-neutral-500 text-sm mt-1" data-i18n="step1_desc">The production program combines hot and cold fruit processing.</div></div>
            <div><div class="font-bold text-neutral-800" data-i18n="step2_title">Frozen fruit</div><div class="text-neutral-500 text-sm mt-1" data-i18n="step2_desc">Frozen fruit is one of the main product groups.</div></div>
            <div><div class="font-bold text-neutral-800" data-i18n="step3_title">Fruit purée and jam</div><div class="text-neutral-500 text-sm mt-1" data-i18n="step3_desc">Fruit purée and jam are part of the main production program.</div></div>
            <div><div class="font-bold text-neutral-800" data-i18n="step4_title">Thermostable masses and fruit-yogurt preparations</div><div class="text-neutral-500 text-sm mt-1" data-i18n="step4_desc">Both product groups are listed in the Frigonais production program.</div></div>
            <div><div class="font-bold text-neutral-800" data-i18n="step5_title">Fruit fillings</div><div class="text-neutral-500 text-sm mt-1" data-i18n="step5_desc">Fruit fillings complete the main product groups listed by Frigonais.</div></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`;

const companySection = `<!-- ==================== GLOBAL REACH ==================== -->
<section id="exports" class="py-20 lg:py-28 bg-brand-950 text-white relative overflow-hidden">
  <div class="absolute inset-0 opacity-20" style="background: radial-gradient(ellipse at 70% 50%, rgba(45,110,45,0.3) 0%, transparent 60%);"></div>
  <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
    <div class="text-center mb-14 reveal">
      <div class="text-xs font-semibold uppercase tracking-widest text-brand-400 mb-3" data-i18n="exp_label">Frigonais Today</div>
      <h2 class="text-3xl lg:text-4xl font-bold leading-tight mb-4" data-i18n="exp_title" data-i18n-html="true">From 1996 to<br><span class="font-serif italic font-normal text-brand-200">More Than 120 Employees</span></h2>
      <p class="text-white/55 max-w-2xl mx-auto" data-i18n="exp_desc">Our quality is recognized around the world, with annual exports worth around five million euros.</p>
    </div>
    <div class="grid md:grid-cols-3 gap-4 mb-10 reveal">
      <div class="bg-white/5 border border-white/10 rounded-xl p-6"><div class="text-3xl font-bold text-white">120+</div><div class="text-sm font-semibold text-white/85 mt-2" data-i18n="metric_markets">Employees</div><div class="text-xs text-white/45 mt-1" data-i18n="metric_markets_desc">More than 120 employees</div></div>
      <div class="bg-white/5 border border-white/10 rounded-xl p-6"><div class="text-3xl font-bold text-white">≈ €5M</div><div class="text-sm font-semibold text-white/85 mt-2" data-i18n="metric_continents">Annual exports</div><div class="text-xs text-white/45 mt-1" data-i18n="metric_continents_desc">Around five million euros</div></div>
      <div class="bg-white/5 border border-white/10 rounded-xl p-6"><div class="text-2xl font-bold text-white">Niš / Kuršumlija</div><div class="text-sm font-semibold text-white/85 mt-2" data-i18n="metric_exports">Locations</div><div class="text-xs text-white/45 mt-1" data-i18n="metric_exports_desc">Headquarters in Niš, production in Kuršumlija</div></div>
    </div>
    <div class="text-center reveal"><p class="text-white/45 text-sm" data-i18n="trade_presence">Frigonais has grown continuously since 1996.</p></div>
  </div>
</section>`;

const sustainabilitySection = `<!-- ==================== SUSTAINABILITY ==================== -->
<section id="sustainability" class="py-20 lg:py-28 bg-white">
  <div class="max-w-7xl mx-auto px-6 lg:px-8">
    <div class="grid lg:grid-cols-2 gap-16 items-center">
      <div class="reveal">
        <div class="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3" data-i18n="sus_label">Goals & Sustainability</div>
        <h2 class="text-3xl lg:text-4xl font-bold text-neutral-900 leading-tight mb-6" data-i18n="sus_title" data-i18n-html="true">Practical Steps Toward<br><span class="font-serif italic font-normal text-brand-700">More Sustainable Production</span></h2>
        <p class="text-neutral-500 leading-relaxed mb-4" data-i18n="sus_p1">Solar panels cover 4,500 square meters of roof area, and the plan is for the entire production operation to be supplied with electricity from sustainable sources in the future.</p>
        <p class="text-neutral-500 leading-relaxed" data-i18n="sus_p2">The company also has a pool for wastewater treatment. Complete electrification of the vehicle fleet is one of the key goals.</p>
      </div>
      <div class="grid sm:grid-cols-2 gap-4 reveal">
        <div class="bg-brand-50 rounded-xl border border-brand-100 p-6"><div class="text-2xl font-bold text-brand-800">4,500 m²</div><div class="font-bold text-neutral-900 mt-3" data-i18n="sus1_title">4,500 m² of solar panels</div><div class="text-neutral-500 text-sm mt-2" data-i18n="sus1_desc">Solar panels cover 4,500 square meters of roof area.</div></div>
        <div class="bg-brand-50 rounded-xl border border-brand-100 p-6"><div class="text-2xl">☀</div><div class="font-bold text-neutral-900 mt-3" data-i18n="sus2_title">Sustainable electricity</div><div class="text-neutral-500 text-sm mt-2" data-i18n="sus2_desc">The goal is to supply the entire production operation with electricity from sustainable sources.</div></div>
        <div class="bg-brand-50 rounded-xl border border-brand-100 p-6"><div class="text-2xl">≈</div><div class="font-bold text-neutral-900 mt-3" data-i18n="sus3_title">Wastewater treatment</div><div class="text-neutral-500 text-sm mt-2" data-i18n="sus3_desc">The company has a pool for wastewater treatment.</div></div>
        <div class="bg-brand-50 rounded-xl border border-brand-100 p-6"><div class="text-2xl">⚡</div><div class="font-bold text-neutral-900 mt-3" data-i18n="sus4_title">Vehicle fleet</div><div class="text-neutral-500 text-sm mt-2" data-i18n="sus4_desc">Complete electrification of the vehicle fleet is one of the key goals.</div></div>
      </div>
    </div>
  </div>
</section>`;

const homeUrl = new URL('../index.html', import.meta.url);
let home = await readFile(homeUrl, 'utf8');

home = home
  .replaceAll('FSSC 22000 · Organic · HACCP · Kosher', 'FSSC · HACCP · Kosher')
  .replaceAll('FSSC 22000 · Organic · HACCP · SEDEX · Kosher', 'FSSC · HACCP · Kosher')
  .replaceAll('<span class="text-white/60 text-xs">Since 1996</span>', '<span class="text-white/60 text-xs">FSSC</span>')
  .replaceAll('<span class="text-white/60 text-xs">Kuršumlija</span>', '<span class="text-white/60 text-xs">HACCP</span>')
  .replaceAll('<span class="text-white/60 text-xs">SEDEX/SMETA</span>', '<span class="text-white/60 text-xs">Kosher</span>')
  .replace('<div class="text-3xl font-bold text-white">6,000<span class="text-brand-300 text-lg"> t</span></div>', '<div class="text-3xl font-bold text-white">120<span class="text-brand-300 text-lg">+</span></div>')
  .replace('<div class="text-3xl font-bold text-white">2007</div>', '<div class="text-3xl font-bold text-white">≈€5M</div>')
  .replace('<div class="stat-block pl-4"><div class="text-3xl font-bold text-white">HACCP</div><div class="text-white/50 text-sm mt-1" data-i18n="stat_mkt">', '<div class="stat-block pl-4"><div class="text-xl font-bold text-white">Kuršumlija</div><div class="text-white/50 text-sm mt-1" data-i18n="stat_mkt">')
  .replaceAll('+381 18 259 044<br>+381 63 657 099', '+381 18 259 044')
  .replaceAll('+381 18 259 044 · +381 63 657 099', '+381 18 259 044');

home = home.replace(/<!-- ==================== TRUST STRIP ==================== -->[\s\S]*?<\/section>/, trustSection);
home = home.replace(/<!-- ==================== WHY FRIGONAIS ==================== -->[\s\S]*?(?=<!-- ==================== PRODUCTS ==================== -->)/, `${goalsSection}\n\n`);
home = home.replace(/<!-- ==================== QUALITY ==================== -->[\s\S]*?(?=<!-- ==================== GLOBAL REACH ==================== -->)/, `${qualitySection}\n\n`);
home = home.replace(/<!-- ==================== GLOBAL REACH ==================== -->[\s\S]*?(?=<!-- ==================== SUSTAINABILITY ==================== -->)/, `${companySection}\n\n`);
home = home.replace(/<!-- ==================== SUSTAINABILITY ==================== -->[\s\S]*?(?=<!-- ==================== CONTACT ==================== -->)/, `${sustainabilitySection}\n\n`);
await writeFile(homeUrl, home);

const productsUrl = new URL('../products.html', import.meta.url);
let products = await readFile(productsUrl, 'utf8');
products = products
  .replaceAll('FSSC 22000 · Organic · HACCP · Kosher', 'FSSC · HACCP · Kosher')
  .replaceAll('+381 18 259 044 · +381 63 657 099', '+381 18 259 044')
  .replaceAll('Premium fruit ingredient supplier', 'Fruit-processing company');
await writeFile(productsUrl, products);

const seoUrl = new URL('./seo-build.mjs', import.meta.url);
let seo = await readFile(seoUrl, 'utf8');

const seoReplacements = [
  ["homeTitle: 'Frigonais | Fruit Processing Company from Serbia Since 1996'", "homeTitle: 'Frigonais | Fruit Processing from Serbia Since 1996'"],
  ["homeDescription: 'Family-owned Serbian fruit processor founded in 1996, with production in Kuršumlija. The program includes frozen and dried fruit, fruit purée, jam and ingredients for fruit yogurt.'", "homeDescription: 'Frigonais has operated since 1996, with headquarters in Niš and production in Kuršumlija. The company has more than 120 employees and annual exports of around €5 million.'"],
  ["productsTitle: 'Frozen Fruit, Fruit Purée, Jam & Fruit Products | Frigonais'", "productsTitle: 'Frozen Fruit, Fruit Purée & Fruit Products | Frigonais'"],
  ["productsDescription: 'Frigonais production program led by frozen fruit and fruit purées, with sour cherry and plum among key products, plus jam and other processed fruit products.'", "productsDescription: 'Frigonais production program: frozen fruit, fruit purée, jam, thermostable masses, fruit-yogurt preparations and fruit fillings. Frozen fruit and purée ranges include sour cherry, plum and apricot.'"],

  ["homeTitle: 'Frigonais | Prerada Voća u Srbiji od 1996.'", "homeTitle: 'Frigonais | Prerada voća iz Srbije od 1996.'"],
  ["homeDescription: 'Porodična kompanija za preradu voća osnovana 1996. godine, sa proizvodnjom u Kuršumliji. Program obuhvata smrznuto i sušeno voće, voćni pire, džem i sastojke za voćni jogurt.'", "homeDescription: 'Frigonais posluje od 1996. godine, sa sedištem u Nišu i proizvodnjom u Kuršumliji. Kompanija ima više od 120 zaposlenih i godišnji izvoz od oko pet miliona evra.'"],
  ["productsTitle: 'Smrznuto Voće, Voćni Pire i Džem | Frigonais'", "productsTitle: 'Smrznuto voće, voćni pire i proizvodi od voća | Frigonais'"],
  ["productsDescription: 'Proizvodni program Frigonaisa predvode smrznuto voće i voćni pirei, sa višnjom i šljivom među važnim proizvodima, uz džem i druge prerađene voćne proizvode.'", "productsDescription: 'Proizvodni program Frigonaisa: smrznuto voće, voćni pire, pekmez, termostabilne mase, mase za voćni jogurt i voćni nadevi. Asortiman smrznutog voća i pirea uključuje višnju, šljivu i kajsiju.'"],

  ["homeTitle: 'Frigonais｜塞尔维亚水果加工企业｜始于1996'", "homeTitle: 'Frigonais｜塞尔维亚水果加工｜始于1996'"],
  ["homeDescription: 'Frigonais 是一家1996年创立的塞尔维亚家族水果加工企业，生产位于库尔舒姆利亚，产品包括冷冻和干燥水果、果泥、果酱及水果酸奶配料。'", "homeDescription: 'Frigonais 自1996年运营，总部位于尼什，生产位于库尔舒姆利亚。公司拥有120多名员工，年出口额约500万欧元。'"],
  ["productsTitle: '冷冻水果、果泥、果酱及水果制品 | Frigonais'", "productsTitle: '冷冻水果、果泥及水果制品 | Frigonais'"],
  ["productsDescription: 'Frigonais 产品包括冷冻水果、果酱、果泥、耐热水果制品、水果酸奶配料、水果馅料和干果。'", "productsDescription: 'Frigonais 生产项目包括冷冻水果、水果果泥、果酱、耐热水果制品、水果酸奶配料和水果馅料。冷冻水果和果泥包括酸樱桃、李子和杏等。'"],

  ["homeTitle: 'Frigonais | شركة صربية لمعالجة الفاكهة منذ 1996'", "homeTitle: 'Frigonais | معالجة الفاكهة في صربيا منذ 1996'"],
  ["homeDescription: 'Frigonais شركة عائلية صربية لمعالجة الفاكهة تأسست عام 1996، ويقع الإنتاج في كورشومليا. يشمل البرنامج الفاكهة المجمدة والمجففة والهريس والمربى ومكونات زبادي الفاكهة.'", "homeDescription: 'تعمل Frigonais منذ عام 1996، ويقع المقر في نيش والإنتاج في كورشومليا. تضم الشركة أكثر من 120 موظفاً وتبلغ قيمة الصادرات السنوية نحو خمسة ملايين يورو.'"],
  ["productsTitle: 'فاكهة مجمدة وهريس ومربى ومنتجات فاكهة | Frigonais'", "productsTitle: 'فاكهة مجمدة وهريس ومنتجات فاكهة | Frigonais'"],
  ["productsDescription: 'يشمل برنامج Frigonais الفاكهة المجمدة والمربى والهريس والكتل المستقرة حرارياً ومكونات زبادي الفاكهة وحشوات الفاكهة والفاكهة المجففة.'", "productsDescription: 'يشمل برنامج إنتاج Frigonais الفاكهة المجمدة وهريس الفاكهة والمربى والكتل الثابتة حرارياً وتحضيرات زبادي الفاكهة وحشوات الفاكهة. وتشمل مجموعة الفاكهة المجمدة والهريس الكرز الحامض والبرقوق والمشمش.'"]
];
for (const [from, to] of seoReplacements) seo = seo.replace(from, to);

seo = seo
  .replace("    areaServed: ['France', 'Italy', 'Germany', 'Austria', 'Greece'],", "    areaServed: 'Worldwide',")
  .replace(
`    knowsAbout: [
      'frozen fruit',
      'fruit purée',
      'fruit processing',
      'fruit drying',
      'jam',
      'thermostable mass',
      'fruit yogurt ingredients',
      'fruit fillings'
    ],`,
`    knowsAbout: [
      'frozen fruit',
      'fruit purée',
      'jam',
      'thermostable masses',
      'fruit-yogurt preparations',
      'fruit fillings'
    ],`
  );

await writeFile(seoUrl, seo);
console.log('Applied legacy Frigonais source-of-truth facts, corrected wording and final multilingual copy.');
