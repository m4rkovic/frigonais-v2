import { cp, mkdir, rm } from 'node:fs/promises';

const outDir = new URL('../build/', import.meta.url);

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const files = [
  'index.html',
  'products.html',
  'robots.txt',
  'sitemap.xml',
  '_redirects',
  '_headers'
];

for (const file of files) {
  await cp(new URL(`../${file}`, import.meta.url), new URL(`../build/${file}`, import.meta.url));
}

await cp(
  new URL('../assets/', import.meta.url),
  new URL('../build/assets/', import.meta.url),
  { recursive: true }
);

console.log('Prepared Netlify publish directory: build/');
