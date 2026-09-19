import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const pub = path.resolve('public');

async function webp(src, dest, size, quality = 80) {
  const img = sharp(src);
  const pipeline = size ? img.resize(size.w, size.h, { fit: 'cover' }) : img;
  await pipeline.webp({ quality, effort: 6 }).toFile(dest);
  const kb = (fs.statSync(dest).size / 1024).toFixed(1);
  console.log(path.relative(pub, dest), kb, 'KB');
}

async function webpUnder(src, dest, size, maxKb, startQuality = 78) {
  let quality = startQuality;
  let kb = Infinity;
  while (quality >= 42) {
    await webp(src, dest, size, quality);
    kb = fs.statSync(dest).size / 1024;
    if (kb <= maxKb) break;
    quality -= 8;
  }
  if (kb > maxKb) console.warn('OVER CAP', path.relative(pub, dest), kb.toFixed(1), 'KB >', maxKb);
}

await sharp(path.join(pub, 'logo/logo.png')).resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 86, effort: 6 }).toFile(path.join(pub, 'logo/logo.webp'));
await webp(path.join(pub, 'assets/images/currency.jpg'), path.join(pub, 'assets/images/currency.webp'), { w: 256, h: 256 }, 82);
await webp(path.join(pub, 'assets/hero/hero-poster.png'), path.join(pub, 'assets/hero/hero-poster.webp'), { w: 1600, h: 900 }, 72);
await webp(path.join(pub, 'assets/hero/hero-poster.png'), path.join(pub, 'assets/hero/hero-poster-sm.webp'), { w: 960, h: 540 }, 62);
await sharp(path.join(pub, 'logo/logo.png')).resize(96, 96, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 84, effort: 6 }).toFile(path.join(pub, 'logo/logo-sm.webp'));
for (const name of ['pubg', 'freefire', 'cod', 'mlbb', 'valorant']) {
  await webp(path.join(pub, `assets/games/${name}.png`), path.join(pub, `assets/games/${name}.webp`), { w: 512, h: 512 }, 78);
  await webpUnder(path.join(pub, `covers/${name}.png`), path.join(pub, `covers/${name}.webp`), { w: 720, h: 720 }, 80);
  await webpUnder(path.join(pub, `covers/${name}.png`), path.join(pub, `covers/${name}-sm.webp`), { w: 360, h: 360 }, 28);
}
for (const name of ['solo', 'duo', 'squad', 'tdm']) {
  await webpUnder(path.join(pub, `covers/modes/${name}.png`), path.join(pub, `covers/modes/${name}.webp`), { w: 960, h: 420 }, 40);
  await webpUnder(path.join(pub, `covers/modes/${name}.png`), path.join(pub, `covers/modes/${name}-sm.webp`), { w: 480, h: 210 }, 18);
}
