import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import enJson from '../locales/en.json' with { type: 'json' };

const en: Record<string, string> = enJson;

export const LOCALES = ['en', 'bn', 'zh', 'hi', 'ur'] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_META: Record<
  Locale,
  { label: string; countryCode: string; flag: string }
> = {
  en: { label: 'English', countryCode: 'GB', flag: '/assets/flags/gb.gif' },
  bn: { label: 'বাংলা', countryCode: 'BD', flag: '/assets/flags/bd.webp' },
  zh: { label: '中文', countryCode: 'CN', flag: '/assets/flags/cn.png' },
  hi: { label: 'हिन्दी', countryCode: 'IN', flag: '/assets/flags/in.gif' },
  ur: { label: 'اردو', countryCode: 'PK', flag: '/assets/flags/pk.gif' },
};

const loaders = import.meta.glob('../locales/*.json') as Record<
  string,
  () => Promise<{ default: Record<string, string> }>
>;

function loadLocale(id: Locale) {
  const path = `../locales/${id}.json`;
  return loaders[path]?.().then((m) => m.default);
}

const extra: Partial<Record<Locale, Record<string, string>>> = {};

function dictFor(locale: Locale): Record<string, string> {
  if (locale === 'en') return en;
  return extra[locale] || en;
}

const KEY = 'ba-lang';

function readLocale(): Locale {
  try {
    const raw = localStorage.getItem(KEY) as Locale | null;
    if (raw && LOCALES.includes(raw)) return raw;
  } catch {
    /* ignore */
  }
  return 'en';
}

type Ctx = { locale: Locale; t: (key: string) => string; setLocale: (id: Locale) => void };

const I18nContext = createContext<Ctx>({
  locale: 'en',
  t: (key) => en[key] || key,
  setLocale: () => undefined,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readLocale);
  const [tick, setTick] = useState(0);
  if (typeof document !== 'undefined' && document.documentElement.lang !== locale) {
    document.documentElement.lang = locale;
    document.documentElement.setAttribute('translate', 'no');
  }

  useEffect(() => {
    if (locale === 'en' || extra[locale]) return;
    void loadLocale(locale)?.then((dict) => {
      if (dict) {
        extra[locale] = dict;
        setTick((n) => n + 1);
      }
    });
  }, [locale]);

  const value = useMemo<Ctx>(() => {
    const dict = dictFor(locale);
    return {
      locale,
      t: (key) => dict[key] || en[key] || key,
      setLocale: (id) => {
        localStorage.setItem(KEY, id);
        document.documentElement.lang = id;
        if (id !== 'en' && !extra[id]) {
          void loadLocale(id)?.then((dict) => {
            if (dict) {
              extra[id] = dict;
              setTick((n) => n + 1);
            }
          });
        }
        setLocaleState(id);
      },
    };
  }, [locale, tick]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
