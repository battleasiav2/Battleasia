import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import enJson from '../locales/en.json' with { type: 'json' };

const en: Record<string, string> = enJson;

/** English-only — other locales are not offered in the UI. */
export const LOCALES = ['en'] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_META: Record<Locale, { label: string; countryCode: string; flag: string }> = {
  en: { label: 'English', countryCode: 'GB', flag: '/assets/flags/gb.gif' },
};

const KEY = 'ba-lang';

type Ctx = { locale: Locale; t: (key: string) => string; setLocale: (id: Locale) => void };

const I18nContext = createContext<Ctx>({
  locale: 'en',
  t: (key) => en[key] || key,
  setLocale: () => undefined,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.lang = 'en';
    document.documentElement.setAttribute('translate', 'no');
    try {
      localStorage.setItem(KEY, 'en');
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      locale: 'en',
      t: (key) => en[key] || key,
      setLocale: () => {
        try {
          localStorage.setItem(KEY, 'en');
        } catch {
          /* ignore */
        }
        document.documentElement.lang = 'en';
      },
    }),
    [],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
