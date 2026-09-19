export const ACCENTS = [
  { id: 'violet', color: '#7C5CFF' },
  { id: 'cyan', color: '#21D4FD' },
  { id: 'sky', color: '#38BDF8' },
  { id: 'lime', color: '#CBFB24' },
  { id: 'ember', color: '#FF8A1A' },
  { id: 'jade', color: '#34D399' },
  { id: 'rose', color: '#FB7185' },
] as const;

export type AccentId = (typeof ACCENTS)[number]['id'];
export type ThemeId = 'dark' | 'light';

export function readAccent(): AccentId {
  try {
    const id = localStorage.getItem('ba-accent');
    if (ACCENTS.some((a) => a.id === id)) return id as AccentId;
  } catch {
    /* ignore */
  }
  return 'violet';
}

export function readTheme(): ThemeId {
  try {
    return localStorage.getItem('ba-theme') === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function applyAccent(id: string) {
  document.documentElement.dataset.accent = id;
  try {
    localStorage.setItem('ba-accent', id);
  } catch {
    /* ignore */
  }
}

export function applyTheme(id: ThemeId) {
  document.documentElement.dataset.theme = id;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', id === 'light' ? '#F7F8FB' : '#0E0F14');
  try {
    localStorage.setItem('ba-theme', id);
  } catch {
    /* ignore */
  }
}

export function toggleTheme() {
  applyTheme(readTheme() === 'light' ? 'dark' : 'light');
}
