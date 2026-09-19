import { useI18n } from '../../lib/i18n';

export function AuthTrustRow() {
  const { t } = useI18n();
  const items = [
    {
      key: 'secure',
      label: t('auth.trustSecure'),
      icon: (
        <path
          d="M12 3.2 19 6v8.8c0 4.6-3 7.8-7 9.4-4-1.6-7-4.8-7-9.4V6L12 3.2Zm-2.2 9.3 1.7 1.7 3.8-3.9"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ),
    },
    {
      key: 'fair',
      label: t('auth.trustFair'),
      icon: (
        <path
          d="M8.2 17.2 12 5.5l3.8 11.7M9.5 13h5M7 19.5h10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ),
    },
    {
      key: 'cash',
      label: t('auth.trustCash'),
      icon: (
        <path
          d="M4.5 8.5h15v9.2a1.8 1.8 0 0 1-1.8 1.8H6.3A1.8 1.8 0 0 1 4.5 17.7V8.5Zm2.2-3h10.6l1.2 3H5.5l1.2-3Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      ),
    },
  ] as const;

  return (
    <ul className="auth-trust" aria-label={t('auth.trustLabel')}>
      {items.map((item) => (
        <li key={item.key}>
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
            {item.icon}
          </svg>
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
