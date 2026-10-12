import { useI18n } from '../lib/i18n';
import { openCookiePreferences } from '../lib/cookie-consent';

type Props = {
  className?: string;
};

export function CookiePreferencesButton({ className = 'cookie-pref-btn' }: Props) {
  const { t } = useI18n();
  return (
    <button type="button" className={className} onClick={() => openCookiePreferences()}>
      {t('cookies.preferences')}
    </button>
  );
}
