import { readFileSync, writeFileSync } from 'node:fs';

const srcPath = new URL('../src/styles/landing-full-work.css', import.meta.url);
const outPath = new URL('../src/styles/landing-fw-scoped.css', import.meta.url);
const src = readFileSync(srcPath, 'utf8');

function prefixSelector(sel) {
  const raw = sel.trim();
  if (!raw || raw.startsWith('@')) return raw;
  if (raw === 'from' || raw === 'to' || /^\d/.test(raw)) return raw;
  if (raw.includes('.landing-fw') || raw.includes('.auth-page-fw')) return raw;
  if (raw.startsWith('html')) return raw.replace(/^html/, 'html:has(.landing-fw)');
  if (/^\.(grain|modal-open|is-mock)\b/.test(raw)) return `.landing-fw${raw}`;
  return `.landing-fw ${raw}`;
}

function prefixList(list) {
  return list
    .split(',')
    .map((part) => prefixSelector(part))
    .join(',\n');
}

let i = 0;
const len = src.length;
let out = '/* Zip styles scoped to .landing-fw so arena CSS cannot override the landing. */\n';

function skipSpace(buf) {
  let n = 0;
  while (i + n < len && /\s/.test(src[i + n])) n += 1;
  if (buf) out += src.slice(i, i + n);
  i += n;
}

function readComment() {
  const end = src.indexOf('*/', i + 2);
  const chunk = src.slice(i, end + 2);
  i = end + 2;
  return chunk;
}

function readUntilBrace() {
  let chunk = '';
  while (i < len) {
    if (src.startsWith('/*', i)) {
      chunk += readComment();
      continue;
    }
    if (src[i] === '{') return chunk;
    chunk += src[i];
    i += 1;
  }
  return chunk;
}

function readBalanced() {
  let depth = 1;
  let chunk = '';
  i += 1;
  while (i < len && depth > 0) {
    if (src.startsWith('/*', i)) {
      chunk += readComment();
      continue;
    }
    const ch = src[i];
    if (ch === '{') depth += 1;
    else if (ch === '}') depth -= 1;
    if (depth === 0) {
      i += 1;
      return chunk;
    }
    chunk += ch;
    i += 1;
  }
  return chunk;
}

function transformBlock(scopePrefix) {
  while (i < len) {
    skipSpace(true);
    if (i >= len) return;
    if (src[i] === '}') {
      out += '}';
      i += 1;
      return;
    }
    if (src.startsWith('/*', i)) {
      out += readComment();
      continue;
    }
    if (src.startsWith('@keyframes', i) || src.startsWith('@-webkit-keyframes', i)) {
      const head = readUntilBrace();
      const body = readBalanced();
      out += `${head}{${body}}`;
      continue;
    }
    if (src[i] === '@') {
      const head = readUntilBrace();
      out += `${head}{`;
      i += 1;
      transformBlock(true);
      continue;
    }
    const selector = readUntilBrace();
    const body = readBalanced();
    const prefixed = scopePrefix ? prefixList(selector) : selector.trim();
    out += `${prefixed}{${body}}`;
  }
}

transformBlock(true);
writeFileSync(outPath, out);
console.log('bytes', out.length);
