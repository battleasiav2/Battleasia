import { readFileSync } from 'node:fs';

const r = JSON.parse(readFileSync(new URL('../lighthouse-landing.json', import.meta.url), 'utf8'));
const aud = r.audits;
console.log(
  'keys',
  Object.keys(aud).filter((k) => /lcp|render-block|unused|image-delivery|network-req|prioritize|bootup|dom-size|font/i.test(k)),
);
for (const id of [
  'largest-contentful-paint-element',
  'lcp-lazy-loaded',
  'prioritize-lcp-image',
  'render-blocking-resources',
  'unused-javascript',
  'unused-css-rules',
  'uses-responsive-images',
  'modern-image-formats',
  'offscreen-images',
  'font-display',
  'preload-lcp-image',
]) {
  const a = aud[id];
  if (!a) continue;
  console.log('\n====', id, 'score', a.score, a.displayValue || '');
  if (a.details) console.log(JSON.stringify(a.details, null, 2).slice(0, 2200));
}

const net = aud['network-requests'];
const items = (net?.details?.items || [])
  .slice()
  .sort((a, b) => b.transferSize - a.transferSize)
  .slice(0, 18)
  .map((i) => ({
    url: String(i.url).replace('http://127.0.0.1:4180', ''),
    kb: Math.round(i.transferSize / 1024),
    mime: i.mimeType,
    prio: i.priority,
  }));
console.log('\n==== NETWORK');
console.log(JSON.stringify(items, null, 2));
