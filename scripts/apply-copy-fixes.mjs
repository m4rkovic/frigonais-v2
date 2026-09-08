import { readFile, writeFile } from 'node:fs/promises';

const baseMarker = '/* FRIGONAIS_BUILD_COPY_FIXES */';
const finalMarker = '/* FRIGONAIS_BUILD_COPY_FINAL */';
const i18nUrl = new URL('../assets/i18n.js', import.meta.url);
const copyFixesUrl = new URL('../assets/copy-fixes.js', import.meta.url);
const copyFinalUrl = new URL('../assets/copy-final.js', import.meta.url);

let i18nSource = await readFile(i18nUrl, 'utf8');
const [copyFixesSource, copyFinalSource] = await Promise.all([
  readFile(copyFixesUrl, 'utf8'),
  readFile(copyFinalUrl, 'utf8')
]);

if (!i18nSource.includes(baseMarker)) {
  i18nSource = `${i18nSource.trimEnd()}\n\n${baseMarker}\n${copyFixesSource}\n`;
}
if (!i18nSource.includes(finalMarker)) {
  i18nSource = `${i18nSource.trimEnd()}\n\n${finalMarker}\n${copyFinalSource}\n`;
}
await writeFile(i18nUrl, i18nSource);

const pages = ['index.html', 'products.html'];
const oldDescription = 'Individually Quick Frozen cherries, raspberries, strawberries, blackberries, and blueberries. Preserves peak freshness, nutrition, and natural flavor profile.';
const newDescription = 'Individually Quick Frozen sour cherries, raspberries, strawberries, blackberries, blueberries and plums. IQF processing helps preserve freshness, nutritional value and natural flavor.';
const oldCherry = 'data-i18n="tag_cherry">Cherry</span>';
const newCherry = 'data-i18n="tag_cherry">Sour cherry</span>';
const blackberryChip = '<span class="text-[11px] px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-600 font-medium" data-i18n="tag_blackberry">Blackberry</span>';
const plumChip = '<span class="text-[11px] px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-600 font-medium" data-i18n="tag_plum">Plum</span>';

for (const page of pages) {
  const url = new URL(`../${page}`, import.meta.url);
  let html = await readFile(url, 'utf8');
  html = html.replaceAll(oldDescription, newDescription).replaceAll(oldCherry, newCherry);
  if (!html.includes('data-i18n="tag_plum"')) {
    html = html.replace(blackberryChip, `${blackberryChip}\n                        ${plumChip}`);
  }
  await writeFile(url, html);
}

console.log('Applied Frigonais copy proofing and IQF fruit corrections.');
