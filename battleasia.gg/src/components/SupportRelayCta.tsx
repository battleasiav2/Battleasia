import { Link } from 'react-router-dom';
import { useI18n } from '../lib/i18n';

export function SupportRelayCta() {
  const { t } = useI18n();
  return (
    <div className="support-block reveal glass">
      <div>
        <strong>{t('footer.questions')}</strong>
        <p className="text-muted text-muted--sm">support@battleasia.gg</p>
      </div>
      <div className="btn-row">
        <a href="mailto:support@battleasia.gg" className="btn btn-ghost">
          Email support
        </a>
        <Link className="btn btn-primary" to="/support">
          {t('footer.contactSupport')}
        </Link>
      </div>
    </div>
  );
}
