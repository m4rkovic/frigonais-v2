import { readFile, writeFile } from 'node:fs/promises';

const homeUrl = new URL('../index.html', import.meta.url);
const cssUrl = new URL('../assets/site.css', import.meta.url);

let home = await readFile(homeUrl, 'utf8');
let css = await readFile(cssUrl, 'utf8');

// Keep the old Industries section in source for possible later use, but do not render it.
const hiddenMarker = 'INDUSTRIES SECTION HIDDEN FOR NOW';
if (!home.includes(hiddenMarker)) {
  const startToken = '        <!-- Industries -->';
  const outerSectionEnd = '\n    </div>\n</section>';
  const start = home.indexOf(startToken);
  if (start !== -1) {
    const end = home.indexOf(outerSectionEnd, start);
    if (end !== -1) {
      const preserved = home
        .slice(start, end)
        .replace('<!-- Industries -->', 'Industries section preserved for possible future use');
      home = `${home.slice(0, start)}        <!-- ${hiddenMarker}\n${preserved}\n        -->${home.slice(end)}`;
    }
  }
}

// Landing page only: red is a secondary Frigonais accent, while green remains dominant.
home = home
  .replace(
    '<a href="#contact" class="border border-white/30 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-white/10 transition-all" data-i18n="hero_cta2">',
    '<a href="#contact" class="bg-accent-500 border border-accent-400 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-accent-600 hover:border-accent-500 transition-all shadow-lg shadow-black/10" data-i18n="hero_cta2">'
  )
  .replace(
    'class="h-px bg-brand-600 w-12 mb-6 sep-line"',
    'class="h-px bg-accent-500 w-12 mb-6 sep-line"'
  )
  .replace(
    'class="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3" data-i18n="why_label"',
    'class="text-xs font-semibold uppercase tracking-widest text-accent-600 mb-3" data-i18n="why_label"'
  )
  .replace(
    'class="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3" data-i18n="sus_label"',
    'class="text-xs font-semibold uppercase tracking-widest text-accent-600 mb-3" data-i18n="sus_label"'
  );

const cssMarker = '/* FRIGONAIS_LANDING_RED_ACCENTS */';
if (!css.includes(cssMarker)) {
  css = `${css.trimEnd()}\n\n${cssMarker}\nbody[data-page="home"] .trust-strip .trust-item:nth-child(2) > span,\nbody[data-page="home"] .trust-strip .trust-item:nth-child(4) > span {\n  background: #FFF5F5;\n  color: #B82D37;\n}\n\nbody[data-page="home"] .trust-strip .trust-item:nth-child(2),\nbody[data-page="home"] .trust-strip .trust-item:nth-child(4) {\n  border-color: rgba(214, 58, 69, 0.12);\n}\n`;
}

await Promise.all([
  writeFile(homeUrl, home),
  writeFile(cssUrl, css)
]);

console.log('Hidden Industries section and added restrained red accents to the landing page.');
