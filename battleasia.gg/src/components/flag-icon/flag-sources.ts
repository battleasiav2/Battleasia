const LOCAL_FLAG_MAP: Record<string, string> = {
  GB: '/assets/images/flags/us.gif',
  US: '/assets/images/flags/us.gif',
  BD: '/assets/images/flags/bdt.webp',
  IN: '/assets/images/flags/in.gif',
  PK: '/assets/images/flags/pk.gif',
};

export function getFlagSources(code?: string): string[] {
  if (!code) return [];

  const upper = code.toUpperCase();
  const sources: string[] = [];

  const local = LOCAL_FLAG_MAP[upper];
  if (local) {
    sources.push(local);
  }

  sources.push(`https://flagcdn.com/w40/${upper.toLowerCase()}.png`);
  sources.push(
    `https://purecatamphetamine.github.io/country-flag-icons/3x2/${upper}.svg`
  );

  return [...new Set(sources)];
}
