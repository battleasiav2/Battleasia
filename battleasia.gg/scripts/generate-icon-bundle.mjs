/**
 * Scans src/ for Iconify icon names and builds a minimal offline bundle.
 * Run: node scripts/generate-icon-bundle.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getIcons } from '@iconify/utils';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const outputFile = path.join(rootDir, 'src/components/iconify/iconify-bundle.generated.json');

const COLLECTIONS = {
  solar: '@iconify-json/solar/icons.json',
  eva: '@iconify-json/eva/icons.json',
  mingcute: '@iconify-json/mingcute/icons.json',
  'game-icons': '@iconify-json/game-icons/icons.json',
  carbon: '@iconify-json/carbon/icons.json',
  hugeicons: '@iconify-json/hugeicons/icons.json',
  'line-md': '@iconify-json/line-md/icons.json',
  ph: '@iconify-json/ph/icons.json',
};

/** Icons referenced in nav/theme that are not always picked up by string scan. */
const EXTRA_ICONS = [
  'eva:arrow-ios-downward-fill',
  'eva:arrow-ios-forward-fill',
  'eva:info-outline',
  'eva:search-fill',
  'solar:home-angle-bold-duotone',
  'solar:notes-bold-duotone',
  'solar:shield-keyhole-bold-duotone',
  'solar:settings-bold-duotone',
];

/** Map legacy/missing icon names to icons that exist in bundled JSON sets. */
const ICON_ALIASES = {
  'solar:trophy-bold': 'solar:medal-ribbon-star-bold',
  'solar:trophy-bold-duotone': 'solar:medal-ribbon-star-bold-duotone',
  'solar:story-bold': 'solar:document-bold',
};

function resolveIconName(fullName) {
  return ICON_ALIASES[fullName] ?? fullName;
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function collectIconNames() {
  // Matches any quoted "<known-prefix>:<name>" so JSX attributes, object properties,
  // arrays and lookup maps are all picked up.
  const prefixes = Object.keys(COLLECTIONS).join('|');
  const iconPattern = new RegExp(`["'\`]((?:${prefixes}):[a-z0-9-]+)["'\`]`, 'g');
  const names = new Set(EXTRA_ICONS);

  for (const file of walk(srcDir)) {
    const content = fs.readFileSync(file, 'utf8');
    let match = iconPattern.exec(content);

    while (match) {
      names.add(match[1]);
      match = iconPattern.exec(content);
    }
  }

  return names;
}

function groupByPrefix(iconNames) {
  const groups = {};
  const aliasTargets = new Map();

  for (const fullName of iconNames) {
    const resolvedName = resolveIconName(fullName);
    const [prefix, name] = resolvedName.split(':');

    if (!prefix || !name || !COLLECTIONS[prefix]) {
      console.warn(`Skipping unknown icon prefix: ${fullName}`);
      continue;
    }

    groups[prefix] ??= new Set();
    groups[prefix].add(name);

    if (resolvedName !== fullName) {
      aliasTargets.set(fullName, resolvedName);
    }
  }

  return { groups, aliasTargets };
}

async function loadCollection(relativePath) {
  const modulePath = path.join(rootDir, 'node_modules', relativePath);
  const content = fs.readFileSync(modulePath, 'utf8');
  return JSON.parse(content);
}

async function main() {
  const iconNames = collectIconNames();
  const { groups, aliasTargets } = groupByPrefix(iconNames);
  const bundle = [];

  for (const [prefix, names] of Object.entries(groups)) {
    const source = await loadCollection(COLLECTIONS[prefix]);
    const subset = getIcons(source, [...names]);

    if (!subset?.icons) {
      console.warn(`No icons found for prefix "${prefix}"`);
      continue;
    }

    const icons = Object.fromEntries(
      Object.entries(subset.icons).filter(([, value]) => value != null)
    );

    for (const [aliasName, targetName] of aliasTargets.entries()) {
      const [aliasPrefix, aliasIconName] = aliasName.split(':');
      const [, targetIconName] = targetName.split(':');

      if (aliasPrefix !== prefix || !targetIconName) {
        continue;
      }

      if (icons[targetIconName]) {
        icons[aliasIconName] = icons[targetIconName];
      }
    }

    const missing = [...names].filter((name) => !icons[name]);
    if (missing.length) {
      console.warn(`${prefix}: missing icons -> ${missing.join(', ')}`);
    }

    if (Object.keys(icons).length === 0) {
      continue;
    }

    bundle.push({ ...subset, icons });
    console.log(`${prefix}: ${Object.keys(icons).length} icons`);
  }

  fs.writeFileSync(outputFile, `${JSON.stringify(bundle, null, 2)}\n`);
  console.log(`\nWrote ${bundle.length} collections to ${path.relative(rootDir, outputFile)}`);
  console.log(`Total icons: ${iconNames.size}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
