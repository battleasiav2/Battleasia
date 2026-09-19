import { useEffect, useState } from 'react';
import { useI18n } from '../lib/i18n';

export function OfflineBanner() {
  const { t } = useI18n();
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  if (online) return null;
  return (
    <div className="net-banner" role="status">
      {t('net.offline')}
    </div>
  );
}
