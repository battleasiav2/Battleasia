import { LOCALES, useI18n, type Locale } from '../../lib/i18n';

const LABEL: Record<Locale, string> = {
  en: 'EN',
  bn: 'BN',
  zh: 'ZH',
  hi: 'HI',
  ur: 'UR',
};

/** Native select so the zip `.locale-select` styles apply. */
export function ZipLocaleSelect() {
  const { locale, setLocale } = useI18n();
  return (
    <select
      className="locale-select"
      aria-label="Language"
      value={locale}
      onChange={(e) => setLocale(e.target.value as Locale)}
    >
      {LOCALES.map((id) => (
        <option key={id} value={id}>
          {LABEL[id]}
        </option>
      ))}
    </select>
  );
}
