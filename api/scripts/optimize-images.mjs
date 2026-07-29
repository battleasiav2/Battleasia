import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '../..');

const TARGETS = [
  {
    dir: 'battleasia.gg/public',
    maxWidth: 1920,
    quality: 78,
    patterns: [
      /hero-banner-pubg\.png$/i,
      /hero-banner-pubg-drop\.png$/i,
      /hero-banner-pubg-pan\.png$/i,
      /hero-banner-war-gaming\.png$/i,
      /about-pubg-black\.png$/i,
      /dashboard-pubg-black\.png$/i,
    ],
  },
  {
    dir: 'battleasia.gg/public',
    maxWidth: 800,
    quality: 80,
    patterns: [/home[/\\]modes[/\\]mode-.*\.png$/i],
  },
  {
    dir: 'battleasia.gg/public',
    maxWidth: 512,
    quality: 82,
    patterns: [/games[/\\]art[/\\].*\.png$/i],
  },
  {
    dir: 'battleasia.gg/public',
    maxWidth: 640,
    quality: 82,
    patterns: [/hero-title-battleasia\.png$/i],
  },
  {
    dir: 'shop.battleasia.gg/public',
    maxWidth: 1920,
    quality: 78,
    patterns: [/shop[/\\]bac-store-hero\.png$/i, /shop[/\\]shop-hero\.png$/i, /shop[/\\]bac-coin-pack\.png$/i],
  },
  {
    dir: 'battleasia.gg/public',
    maxWidth: 256,
    quality: 82,
    patterns: [/flags[/\\].*\.png$/i, /bkash\.png$/i, /nagad\.png$/i, /usdt\.png$/i],
  },
  {
    dir: 'shop.battleasia.gg/public',
    maxWidth: 256,
    quality: 82,
    patterns: [/flags[/\\].*\.png$/i, /bkash\.png$/i, /nagad\.png$/i, /usdt\.png$/i],
  },
  {
    dir: 'battleasia.gg/public',
    maxWidth: 512,
    quality: 80,
    patterns: [/foot_car-new\.png$/i, /foot_car-transparent\.png$/i],
  },
  {
    dir: 'shop.battleasia.gg/public',
    maxWidth: 512,
    quality: 80,
    patterns: [/foot_car-new\.png$/i, /foot_car-transparent\.png$/i],
  },
];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(png|jpe?g)$/i.test(entry.name)) files.push(full);
  }
  return files;
}

function formatKb(bytes) {
  return `${Math.round(bytes / 1024)}KB`;
}

let saved = 0;
let converted = 0;

for (const target of TARGETS) {
  const baseDir = path.join(ROOT, target.dir);
  const files = walk(baseDir).filter((file) =>
    target.patterns.some((pattern) => pattern.test(file.replace(/\\/g, '/')))
  );

  for (const file of files) {
    const before = fs.statSync(file).size;
    const webpPath = file.replace(/\.(png|jpe?g)$/i, '.webp');

    await sharp(file)
      .rotate()
      .resize({ width: target.maxWidth, withoutEnlargement: true })
      .webp({ quality: target.quality, effort: 4 })
      .toFile(webpPath);

    const after = fs.statSync(webpPath).size;
    saved += Math.max(0, before - after);
    converted += 1;
    console.log(`${path.relative(ROOT, file)} -> ${path.relative(ROOT, webpPath)} (${formatKb(before)} -> ${formatKb(after)})`);
  }
}

console.log(`Done: ${converted} images, saved ~${formatKb(saved)}`);
