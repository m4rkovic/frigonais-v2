import { writeFile } from 'node:fs/promises';

const publicConfig = {
  turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || ''
};

await writeFile(
  new URL('../assets/runtime-config.js', import.meta.url),
  `window.FRIGONAIS_CONFIG = ${JSON.stringify(publicConfig)};\n`,
  'utf8'
);
