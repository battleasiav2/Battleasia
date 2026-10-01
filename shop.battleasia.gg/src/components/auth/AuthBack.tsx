import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../lib/i18n';

export function AuthBack({ to }: { to: string }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const label = (
    <>
      <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
        <path
          d="M12.5 4.5 7 10l5.5 5.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{t('auth.back')}</span>
    </>
  );

  if (to.startsWith('http')) {
    return (
      <a className="signin-back" href={to}>
        {label}
      </a>
    );
  }

  return (
    <button className="signin-back" type="button" onClick={() => navigate(to)}>
      {label}
    </button>
  );
}
