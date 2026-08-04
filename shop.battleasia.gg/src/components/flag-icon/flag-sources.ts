const BASE = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

function localFlag(file: string): string {
  return `${BASE}/assets/images/flags/${file}`;
}

/** Prefer local PNGs (shipped under /store/assets), then flagcdn, then github SVG. */
const LOCAL_FLAG_MAP: Record<string, string> = {
  GB: localFlag('gb.png'),
  US: localFlag('us.png'),
  FR: localFlag('fr.png'),
  VN: localFlag('vn.png'),
  CN: localFlag('cn.png'),
  SA: localFlag('sa.png'),
  BD: localFlag('bdt.webp'),
  IN: localFlag('inr.webp'),
  PK: localFlag('pkr.webp'),
};

export function getFlagSources(code?: string): string[] {
  if (!code) return [];

  const upper = code.toUpperCase();
  const sources: string[] = [];

  const local = LOCAL_FLAG_MAP[upper];
  if (local) {
    sources.push(local);
  }

  // Generic local file by code (e.g. gb.png) if not in map
  if (!local) {
    sources.push(localFlag(`${upper.toLowerCase()}.png`));
  }

  sources.push(`https://flagcdn.com/w40/${upper.toLowerCase()}.png`);
  sources.push(
    `https://purecatamphetamine.github.io/country-flag-icons/3x2/${upper}.svg`
  );

  return [...new Set(sources)];
}
