import { readFile, writeFile } from 'node:fs/promises';

const marker = '/* FRIGONAIS_ORIGINAL_SITE_CONTENT */';
const i18nUrl = new URL('../assets/i18n.js', import.meta.url);
const sourceUrl = new URL('../assets/original-site-content.js', import.meta.url);

let i18nSource = await readFile(i18nUrl, 'utf8');
const source = await readFile(sourceUrl, 'utf8');
if (!i18nSource.includes(marker)) {
  i18nSource = `${i18nSource.trimEnd()}\n\n${marker}\n${source}\n`;
  await writeFile(i18nUrl, i18nSource);
}

const homeUrl = new URL('../index.html', import.meta.url);
let home = await readFile(homeUrl, 'utf8');

// Keep the new visual system, but make the visible facts match the original Frigonais profile.
home = home
  .replaceAll('FSSC 22000 · Organic · HACCP · Kosher', 'HACCP')
  .replaceAll('FSSC 22000 · Organic · HACCP · SEDEX · Kosher', 'HACCP')
  .replace('<span class="text-white/60 text-xs">FSSC 22000</span>', '<span class="text-white/60 text-xs">Since 1996</span>')
  .replace('<span class="text-white/60 text-xs">Organic</span>', '<span class="text-white/60 text-xs">Kuršumlija</span>')
  .replace('<span class="text-white/60 text-xs">SEDEX/SMETA</span>', '<span class="text-white/60 text-xs">HACCP</span>')
  .replace('<div class="text-3xl font-bold text-white">120<span class="text-brand-300 text-lg">+</span></div>', '<div class="text-3xl font-bold text-white">6,000<span class="text-brand-300 text-lg"> t</span></div>')
  .replace('<div class="text-3xl font-bold text-white">€5M<span class="text-brand-300 text-lg">+</span></div>', '<div class="text-3xl font-bold text-white">2007</div>')
  .replace('<div class="text-3xl font-bold text-white">15<span class="text-brand-300 text-lg">+</span></div>', '<div class="text-3xl font-bold text-white">HACCP</div>')
  .replace('<div class="text-brand-700 text-3xl font-bold">15+</div>', '<div class="text-brand-700 text-3xl font-bold">5</div>')
  .replace('+381 18 259 044<br>+381 63 657 099', '+381 18 259 044');

const trustSection = `<!-- ==================== TRUST STRIP ==================== -->
<section class="relative z-20 -mt-8 px-6" aria-label="Frigonais company facts">
    <div class="trust-strip max-w-5xl mx-auto bg-white rounded-2xl border border-neutral-200 px-5 sm:px-7 py-4 flex gap-5 sm:gap-8 items-center justify-between overflow-x-auto">
        <div class="trust-item flex items-center gap-2 text-sm font-semibold text-neutral-700"><span class="w-7 h-7 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center">✓</span>1996</div>
        <div class="trust-item flex items-center gap-2 text-sm font-semibold text-neutral-700"><span class="w-7 h-7 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center">✓</span>Kuršumlija</div>
        <div class="trust-item flex items-center gap-2 text-sm font-semibold text-neutral-700"><span class="w-7 h-7 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center">✓</span>Hot &amp; Cold Processing</div>
        <div class="trust-item flex items-center gap-2 text-sm font-semibold text-neutral-700"><span class="w-7 h-7 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center">✓</span>6,000 t / year</div>
        <div class="trust-item flex items-center gap-2 text-sm font-semibold text-neutral-700"><span class="w-7 h-7 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center">✓</span>HACCP</div>
    </div>
</section>`;

home = home.replace(
  /<!-- ==================== TRUST STRIP ==================== -->[\s\S]*?<\/section>/,
  trustSection
);

const qualitySection = `<!-- ==================== QUALITY ==================== -->
<section id="quality" class="py-20 lg:py-28 bg-white">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-16 items-start">
            <div class="reveal">
                <div class="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3" data-i18n="qual_label">Quality</div>
                <h2 class="text-3xl lg:text-4xl font-bold text-neutral-900 leading-tight mb-6" data-i18n="qual_title" data-i18n-html="true">Quality Confirmed by<br><span class="font-serif italic font-normal text-brand-700">HACCP</span></h2>
                <p class="text-neutral-500 leading-relaxed mb-8" data-i18n="qual_desc">The company profile states that the high quality of Frigonais products is confirmed by the HACCP standard.</p>
                <div class="flex items-center gap-4 p-5 bg-brand-50 rounded-xl border border-brand-100 max-w-lg">
                    <div class="w-14 h-14 bg-white rounded-lg flex items-center justify-center shadow-sm border border-brand-100 flex-shrink-0"><span class="font-bold text-brand-700 text-xs">HACCP</span></div>
                    <div><div class="font-bold text-neutral-900">HACCP</div><div class="text-neutral-500 text-sm mt-1" data-i18n="cert_haccp">HACCP food-safety standard</div></div>
                </div>
            </div>
            <div class="reveal">
                <div class="bg-neutral-50 rounded-2xl border border-neutral-200 p-8 lg:p-10">
                    <div class="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-8" data-i18n="proc_label">Production program</div>
                    <div class="space-y-0">
                        <div class="flex gap-4"><div class="flex flex-col items-center"><div class="w-10 h-10 rounded-full bg-brand-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">1</div><div class="w-px h-full bg-brand-200 my-2"></div></div><div class="pb-8"><div class="font-bold text-neutral-800" data-i18n="step1_title">Fruit &amp; forest fruit</div><div class="text-neutral-500 text-sm mt-1" data-i18n="step1_desc">The production program starts with purchased fruit and forest fruit from the region.</div></div></div>
                        <div class="flex gap-4"><div class="flex flex-col items-center"><div class="w-10 h-10 rounded-full bg-brand-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">2</div><div class="w-px h-full bg-brand-200 my-2"></div></div><div class="pb-8"><div class="font-bold text-neutral-800" data-i18n="step2_title">Freezing &amp; drying</div><div class="text-neutral-500 text-sm mt-1" data-i18n="step2_desc">Frigonais freezes and dries different kinds of fruit as part of its production program.</div></div></div>
                        <div class="flex gap-4"><div class="flex flex-col items-center"><div class="w-10 h-10 rounded-full bg-brand-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">3</div><div class="w-px h-full bg-brand-200 my-2"></div></div><div class="pb-8"><div class="font-bold text-neutral-800" data-i18n="step3_title">Hot &amp; cold processing</div><div class="text-neutral-500 text-sm mt-1" data-i18n="step3_desc">Production combines hot and cold processing methods.</div></div></div>
                        <div class="flex gap-4"><div class="flex flex-col items-center"><div class="w-10 h-10 rounded-full bg-brand-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">4</div><div class="w-px h-full bg-brand-200 my-2"></div></div><div class="pb-8"><div class="font-bold text-neutral-800" data-i18n="step4_title">Purée, jam &amp; yogurt ingredients</div><div class="text-neutral-500 text-sm mt-1" data-i18n="step4_desc">A dedicated line for fruit purée, jam and ingredients for fruit yogurts was introduced in 2007.</div></div></div>
                        <div class="flex gap-4"><div class="flex flex-col items-center"><div class="w-10 h-10 rounded-full bg-accent-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">5</div></div><div><div class="font-bold text-neutral-800" data-i18n="step5_title">European customers</div><div class="text-neutral-500 text-sm mt-1" data-i18n="step5_desc">Products are supplied to established buyers in Western Europe.</div></div></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>`;

home = home.replace(
  /<!-- ==================== QUALITY ==================== -->[\s\S]*?(?=<!-- ==================== GLOBAL REACH ==================== -->)/,
  `${qualitySection}\n\n`
);

const exportSection = `<!-- ==================== GLOBAL REACH ==================== -->
<section id="exports" class="py-20 lg:py-28 bg-brand-950 text-white relative overflow-hidden">
    <div class="absolute inset-0 opacity-20" style="background: radial-gradient(ellipse at 70% 50%, rgba(45,110,45,0.3) 0%, transparent 60%);"></div>
    <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div class="text-center mb-14 reveal">
            <div class="text-xs font-semibold uppercase tracking-widest text-brand-400 mb-3" data-i18n="exp_label">Export</div>
            <h2 class="text-3xl lg:text-4xl font-bold leading-tight mb-4" data-i18n="exp_title" data-i18n-html="true">Long-Standing Customers in<br><span class="font-serif italic font-normal text-brand-200">Western Europe</span></h2>
            <p class="text-white/50 max-w-2xl mx-auto" data-i18n="exp_desc">The original Frigonais company profile lists France, Italy, Germany, Austria and Greece among the main buyers.</p>
        </div>
        <div class="grid md:grid-cols-3 gap-4 mb-10 reveal">
            <div class="bg-white/5 border border-white/10 rounded-xl p-6"><div class="text-3xl font-bold text-white">5</div><div class="text-sm font-semibold text-white/85 mt-2" data-i18n="metric_markets">Main export countries</div><div class="text-xs text-white/40 mt-1" data-i18n="metric_markets_desc">France, Italy, Germany, Austria and Greece</div></div>
            <div class="bg-white/5 border border-white/10 rounded-xl p-6"><div class="text-3xl font-bold text-white">6,000 <span class="text-brand-300 text-xl">t</span></div><div class="text-sm font-semibold text-white/85 mt-2" data-i18n="metric_continents">Annual processing</div><div class="text-xs text-white/40 mt-1" data-i18n="metric_continents_desc">Fruit and forest fruit</div></div>
            <div class="bg-white/5 border border-white/10 rounded-xl p-6"><div class="text-3xl font-bold text-white">2007</div><div class="text-sm font-semibold text-white/85 mt-2" data-i18n="metric_exports">Fruit-processing line</div><div class="text-xs text-white/40 mt-1" data-i18n="metric_exports_desc">Purée, jam and fruit-yogurt ingredients since 2007</div></div>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 reveal">
            <div class="bg-white/5 border border-white/10 rounded-lg px-4 py-3 flex items-center gap-3"><span class="text-xl">🇫🇷</span><span class="text-sm font-medium text-white/80" data-i18n="c_fr">France</span></div>
            <div class="bg-white/5 border border-white/10 rounded-lg px-4 py-3 flex items-center gap-3"><span class="text-xl">🇮🇹</span><span class="text-sm font-medium text-white/80" data-i18n="c_it">Italy</span></div>
            <div class="bg-white/5 border border-white/10 rounded-lg px-4 py-3 flex items-center gap-3"><span class="text-xl">🇩🇪</span><span class="text-sm font-medium text-white/80" data-i18n="c_de">Germany</span></div>
            <div class="bg-white/5 border border-white/10 rounded-lg px-4 py-3 flex items-center gap-3"><span class="text-xl">🇦🇹</span><span class="text-sm font-medium text-white/80" data-i18n="c_at">Austria</span></div>
            <div class="bg-white/5 border border-white/10 rounded-lg px-4 py-3 flex items-center gap-3"><span class="text-xl">🇬🇷</span><span class="text-sm font-medium text-white/80" data-i18n="c_gr">Greece</span></div>
        </div>
        <div class="mt-10 text-center reveal"><p class="text-white/45 text-sm mb-4" data-i18n="trade_presence">Main export destinations listed in the original company profile</p><div class="inline-flex items-center bg-white/5 border border-white/10 rounded-xl px-8 py-4"><div class="text-center"><div class="font-bold text-white text-sm" data-i18n="region_europe">Western Europe</div><div class="text-white/40 text-xs" data-i18n="region_europe_desc">Established buyers for processed fruit products</div></div></div></div>
    </div>
</section>`;

home = home.replace(
  /<!-- ==================== GLOBAL REACH ==================== -->[\s\S]*?(?=<!-- ==================== SUSTAINABILITY ==================== -->)/,
  `${exportSection}\n\n`
);

const productionEnvironmentSection = `<!-- ==================== SUSTAINABILITY ==================== -->
<section id="sustainability" class="py-20 lg:py-28 bg-white">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
            <div class="reveal">
                <div class="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3" data-i18n="sus_label">Production environment</div>
                <h2 class="text-3xl lg:text-4xl font-bold text-neutral-900 leading-tight mb-6" data-i18n="sus_title" data-i18n-html="true">Production in<br><span class="font-serif italic font-normal text-brand-700">Kuršumlija</span></h2>
                <p class="text-neutral-500 leading-relaxed mb-4" data-i18n="sus_p1">Frigonais production facilities are located in Kuršumlija, an area described in the company profile as ecologically clean and known for fruit growing.</p>
                <p class="text-neutral-500 leading-relaxed" data-i18n="sus_p2">The local fruit-growing environment supports the company’s core activity: purchasing, processing, freezing and drying fruit and forest fruit.</p>
            </div>
            <div class="grid sm:grid-cols-2 gap-4 reveal">
                <div class="bg-brand-50 rounded-xl border border-brand-100 p-6"><div class="font-bold text-neutral-900" data-i18n="sus1_title">Kuršumlija</div><div class="text-sm text-neutral-500 mt-2" data-i18n="sus1_desc">Production location in southern Serbia</div></div>
                <div class="bg-brand-50 rounded-xl border border-brand-100 p-6"><div class="font-bold text-neutral-900" data-i18n="sus2_title">Fruit growing</div><div class="text-sm text-neutral-500 mt-2" data-i18n="sus2_desc">Area known for fruit-growing conditions</div></div>
                <div class="bg-neutral-50 rounded-xl border border-neutral-200 p-6"><div class="font-bold text-neutral-900" data-i18n="sus3_title">Freezing &amp; drying</div><div class="text-sm text-neutral-500 mt-2" data-i18n="sus3_desc">Part of the established production program</div></div>
                <div class="bg-neutral-50 rounded-xl border border-neutral-200 p-6"><div class="font-bold text-neutral-900" data-i18n="sus4_title">Family company</div><div class="text-sm text-neutral-500 mt-2" data-i18n="sus4_desc">Founded in Niš in 1996</div></div>
            </div>
        </div>
    </div>
</section>`;

home = home.replace(
  /<!-- ==================== SUSTAINABILITY ==================== -->[\s\S]*?(?=<!-- ==================== CONTACT ==================== -->)/,
  `${productionEnvironmentSection}\n\n`
);

await writeFile(homeUrl, home);

console.log('Applied original Frigonais company information to the production build source.');
