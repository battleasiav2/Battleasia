import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import en from '../locales/en.json' with { type: 'json' };
import bn from '../locales/bn.json' with { type: 'json' };
import zh from '../locales/zh.json' with { type: 'json' };
import hi from '../locales/hi.json' with { type: 'json' };
import ur from '../locales/ur.json' with { type: 'json' };

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

const DICTS: Record<Locale, Record<string, string>> = { en, bn, zh, hi, ur };

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
  t: (key) => DICTS.en[key] || key,
  setLocale: () => undefined,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readLocale);
  if (typeof document !== 'undefined' && document.documentElement.lang !== locale) {
    document.documentElement.lang = locale;
    document.documentElement.setAttribute('translate', 'no');
  }

  const value = useMemo<Ctx>(() => {
    const dict = DICTS[locale] || DICTS.en;
    return {
      locale,
      t: (key) => dict[key] || DICTS.en[key] || key,
      setLocale: (id) => {
        localStorage.setItem(KEY, id);
        document.documentElement.lang = id;
        setLocaleState(id);
      },
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
