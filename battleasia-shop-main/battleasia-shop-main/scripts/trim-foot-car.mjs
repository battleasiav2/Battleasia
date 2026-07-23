import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const src = process.argv[2] || 'public/assets/images/foot_car.webp';
const outs = [
  'public/assets/images/foot_car-transparent.png',
  '../../battleasia-fe-main/battleasia-fe-main/public/assets/images/foot_car-transparent.png',
];

function isBlackBackground(r, g, b, a) {
  if (a < 16) return true;
  return r < 42 && g < 42 && b < 42;
}

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height } = info;

let minX = width;
let minY = height;
let maxX = 0;
let maxY = 0;

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const i = (y * width + x) * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (isBlackBackground(r, g, b, a)) {
      data[i + 3] = 0;
      continue;
    }

    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
}

const pad = 4;
minX = Math.max(0, minX - pad);
minY = Math.max(0, minY - pad);
maxX = Math.min(width - 1, maxX + pad);
maxY = Math.min(height - 1, maxY + pad);

const cropW = maxX - minX + 1;
const cropH = maxY - minY + 1;

const cropped = await sharp(data, { raw: { width, height, channels: 4 } })
  .extract({ left: minX, top: minY, width: cropW, height: cropH })
  .png()
  .toBuffer();

for (const out of outs) {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, cropped);
}

console.log(`Saved ${cropW}x${cropH} from ${path.basename(src)}`);
