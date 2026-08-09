import { assetPath } from 'src/utils/asset-path';

function localFlag(file: string): string {
  return assetPath(`/assets/images/flags/${file}`);
}

/** Prefer local flags under /admin/assets, then flagcdn, then github SVG. */
const LOCAL_FLAG_MAP: Record<string, string> = {
  GB: localFlag('gb.png'),
  US: localFlag('us.png'),
  FR: localFlag('fr.png'),
  VN: localFlag('vn.png'),
  CN: localFlag('cn.png'),
  SA: localFlag('sa.png'),
  BD: localFlag('bdt.webp'),
  IN: localFlag('in.gif'),
  PK: localFlag('pk.gif'),
};

export function getFlagSources(code?: string): string[] {
  if (!code) return [];

  const upper = code.toUpperCase();
  const sources: string[] = [];

  const local = LOCAL_FLAG_MAP[upper];
  if (local) {
    sources.push(local);
  } else {
    sources.push(localFlag(`${upper.toLowerCase()}.png`));
  }

  sources.push(`https://flagcdn.com/w40/${upper.toLowerCase()}.png`);
  sources.push(
    `https://purecatamphetamine.github.io/country-flag-icons/3x2/${upper}.svg`
  );

  return Array.from(new Set(sources));
}
