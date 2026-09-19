import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const poster = path.resolve('public/assets/hero/hero-poster.webp');
const out = path.resolve('public/assets/hero/hero-loop.mp4');
const ffmpeg =
  process.env.FFMPEG ||
  'ffmpeg';

const args = [
  '-y',
  '-loop',
  '1',
  '-i',
  poster,
  '-t',
  '6',
  '-vf',
  "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,zoompan=z='min(zoom+0.0012,1.06)':d=150:s=1280x720:fps=25,format=yuv420p",
  '-an',
  '-c:v',
  'libx264',
  '-preset',
  'slow',
  '-crf',
  '28',
  '-movflags',
  '+faststart',
  out,
];

const child = spawn(ffmpeg, args, { stdio: 'inherit', windowsHide: true });
child.on('exit', (code) => {
  if (code === 0 && fs.existsSync(out)) {
    console.log('hero-loop.mp4', (fs.statSync(out).size / 1024).toFixed(1), 'KB');
  }
  process.exit(code ?? 1);
});
