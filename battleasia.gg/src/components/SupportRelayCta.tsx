import { Link } from 'react-router-dom';
import { useI18n } from '../lib/i18n';

/** Support CTA — taken from footer relay, placed above footer like live Rules band. */
export function SupportRelayCta() {
  const { t } = useI18n();
  return (
    <aside className="support-relay" aria-label={t('footer.support')}>
      <div className="support-relay-copy">
        <h3>{t('footer.questions')}</h3>
        <p>{t('footer.questionsLead')}</p>
      </div>
      <Link className="support-relay-btn" to="/support">
        {t('footer.contactSupport')} <span aria-hidden>→</span>
      </Link>
    </aside>
  );
}
