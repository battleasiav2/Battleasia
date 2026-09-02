import type { PaletteColorNoChannels } from './core/palette';

export const ACCENT_STORAGE_KEY = 'ba-accent';

export const ACCENT_IDS = ['gold', 'ember', 'jade', 'cyan', 'violet', 'rose', 'sky'] as const;

export type AccentId = (typeof ACCENT_IDS)[number];

export type AccentPalette = {
  id: AccentId;
  label: string;
  gold: string;
  goldLight: string;
  goldDark: string;
  ink: string;
  rgb: string;
  lightRgb: string;
  darkRgb: string;
  gradient: string;
  gradientHover: string;
  primary: PaletteColorNoChannels;
};

const hexRgb = (hex: string) => {
  const n = hex.replace('#', '');
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
};

function makePalette(
  id: AccentId,
  label: string,
  gold: string,
  goldLight: string,
  goldDark: string,
  ink: string,
  primary: PaletteColorNoChannels
): AccentPalette {
  return {
    id,
    label,
    gold,
    goldLight,
    goldDark,
    ink,
    rgb: hexRgb(gold),
    lightRgb: hexRgb(goldLight),
    darkRgb: hexRgb(goldDark),
    gradient: `linear-gradient(180deg, ${goldLight} 0%, ${gold} 52%, ${goldDark} 100%)`,
    gradientHover: `linear-gradient(180deg, ${goldLight} 0%, ${gold} 48%, ${gold} 100%)`,
    primary,
  };
}

/** Seven accents tuned for black glass UI — readable on #000 / #161618. */
export const ACCENT_PALETTES: Record<AccentId, AccentPalette> = {
  gold: makePalette('gold', 'Gold', '#f5c518', '#fbbf24', '#d97706', '#111111', {
    lighter: '#FEF4D4',
    light: '#FDE68A',
    main: '#f5c518',
    dark: '#d97706',
    darker: '#92400e',
    contrastText: '#111111',
  }),
  ember: makePalette('ember', 'Ember', '#ff8a1a', '#ffb347', '#e05d00', '#111111', {
    lighter: '#FFE8CC',
    light: '#FFC078',
    main: '#ff8a1a',
    dark: '#e05d00',
    darker: '#9a3b00',
    contrastText: '#111111',
  }),
  jade: makePalette('jade', 'Jade', '#34d399', '#6ee7b7', '#059669', '#042f1e', {
    lighter: '#D1FAE5',
    light: '#6EE7B7',
    main: '#34d399',
    dark: '#059669',
    darker: '#065f46',
    contrastText: '#042f1e',
  }),
  cyan: makePalette('cyan', 'Cyan', '#22d3ee', '#67e8f9', '#0891b2', '#082f38', {
    lighter: '#CFFAFE',
    light: '#67E8F9',
    main: '#22d3ee',
    dark: '#0891b2',
    darker: '#155e75',
    contrastText: '#082f38',
  }),
  violet: makePalette('violet', 'Violet', '#a78bfa', '#c4b5fd', '#7c3aed', '#1e1038', {
    lighter: '#EDE9FE',
    light: '#C4B5FD',
    main: '#a78bfa',
    dark: '#7c3aed',
    darker: '#5b21b6',
    contrastText: '#1e1038',
  }),
  rose: makePalette('rose', 'Rose', '#fb7185', '#fda4af', '#e11d48', '#3f0a14', {
    lighter: '#FFE4E6',
    light: '#FDA4AF',
    main: '#fb7185',
    dark: '#e11d48',
    darker: '#9f1239',
    contrastText: '#3f0a14',
  }),
  sky: makePalette('sky', 'Sky', '#38bdf8', '#7dd3fc', '#0284c7', '#0b2838', {
    lighter: '#E0F2FE',
    light: '#7DD3FC',
    main: '#38bdf8',
    dark: '#0284c7',
    darker: '#075985',
    contrastText: '#0b2838',
  }),
};

const LEGACY_PRIMARY_MAP: Record<string, AccentId> = {
  default: 'gold',
  preset1: 'sky',
  preset2: 'violet',
  preset3: 'cyan',
  preset4: 'ember',
  preset5: 'rose',
};

export function isAccentId(value: unknown): value is AccentId {
  return typeof value === 'string' && (ACCENT_IDS as readonly string[]).includes(value);
}

export function resolveAccentId(value?: string | null): AccentId {
  if (isAccentId(value)) return value;
  if (value && LEGACY_PRIMARY_MAP[value]) return LEGACY_PRIMARY_MAP[value];
  return 'gold';
}

export function getAccentPalette(id?: string | null): AccentPalette {
  return ACCENT_PALETTES[resolveAccentId(id)];
}

export function goldAlpha(opacity: number) {
  return `rgba(var(--ba-gold-rgb), ${opacity})`;
}

export function applyAccentToDocument(id?: string | null) {
  if (typeof document === 'undefined') return;
  const p = getAccentPalette(id);
  const root = document.documentElement;
  root.style.setProperty('--ba-gold', p.gold);
  root.style.setProperty('--ba-gold-light', p.goldLight);
  root.style.setProperty('--ba-gold-dark', p.goldDark);
  root.style.setProperty('--ba-gold-ink', p.ink);
  root.style.setProperty('--ba-gold-rgb', p.rgb);
  root.style.setProperty('--ba-gold-light-rgb', p.lightRgb);
  root.style.setProperty('--ba-gold-dark-rgb', p.darkRgb);
  root.dataset.accent = p.id;
}

export function readStoredAccentId(): AccentId {
  if (typeof window === 'undefined') return 'gold';
  try {
    const dedicated = window.localStorage.getItem(ACCENT_STORAGE_KEY);
    if (isAccentId(dedicated)) return dedicated;
    const raw = window.localStorage.getItem('app-settings');
    if (raw) {
      const parsed = JSON.parse(raw) as { primaryColor?: string };
      return resolveAccentId(parsed.primaryColor);
    }
  } catch {
    // ignore
  }
  return 'gold';
}

export function persistAccentId(id: AccentId) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ACCENT_STORAGE_KEY, id);
  } catch {
    // ignore
  }
}
