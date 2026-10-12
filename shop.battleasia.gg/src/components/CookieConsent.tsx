import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../lib/i18n';
import { readCookieConsent, writeCookieConsent, type CookieConsentChoice } from '../lib/cookie-consent';
import { bootSentry } from '../lib/sentry';

export function CookieConsent() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const choice = readCookieConsent();
    if (choice === 'all') bootSentry();
    else if (!choice) setOpen(true);

    function onConsent(e: Event) {
      const next = (e as CustomEvent<CookieConsentChoice>).detail;
      if (next === 'all') bootSentry();
      setOpen(false);
    }
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener('ba-cookie-consent', onConsent);
    window.addEventListener('ba-cookie-consent-open', onOpen);
    return () => {
      window.removeEventListener('ba-cookie-consent', onConsent);
      window.removeEventListener('ba-cookie-consent-open', onOpen);
    };
  }, []);

  function pick(choice: CookieConsentChoice) {
    writeCookieConsent(choice);
    if (choice === 'all') bootSentry();
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="cookie-consent" role="dialog" aria-labelledby="cookie-consent-title" aria-live="polite">
      <div className="cookie-consent-inner">
        <p id="cookie-consent-title" className="cookie-consent-copy">
          {t('cookies.lead')}{' '}
          <Link to="/privacy-policy">{t('cookies.privacy')}</Link>
        </p>
        <div className="cookie-consent-actions">
          <button className="btn btn-ghost cookie-consent-cancel" type="button" onClick={() => pick('essential')}>
            {t('cookies.essentialOnly')}
          </button>
          <button className="btn btn-primary" type="button" onClick={() => pick('all')}>
            {t('cookies.acceptAll')}
          </button>
        </div>
      </div>
    </div>
  );
}
