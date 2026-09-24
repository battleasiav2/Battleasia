import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { mediaUrl } from './UserAvatar';
import { useI18n } from '../lib/i18n';
import {
  fetchSiteNotice,
  readDismissedNoticeVersion,
  writeDismissedNoticeVersion,
  type SiteNotice,
} from '../lib/site-notice';

function isInternalPath(url: string) {
  return url.startsWith('/') && !url.startsWith('//');
}

export function SiteNoticeModal() {
  const { t } = useI18n();
  const [notice, setNotice] = useState<SiteNotice | null>(null);
  const [open, setOpen] = useState(false);

  const apply = useCallback((next: SiteNotice | null) => {
    if (!next) {
      setNotice(null);
      setOpen(false);
      return;
    }
    const dismissed = readDismissedNoticeVersion();
    if (next.dismissible && dismissed >= next.version) {
      setNotice(null);
      setOpen(false);
      return;
    }
    setNotice(next);
    setOpen(true);
  }, []);

  useEffect(() => {
    let live = true;
    const load = () => {
      void fetchSiteNotice().then((n) => {
        if (live) apply(n);
      });
    };
    const boot = window.setTimeout(load, 600);
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    return () => {
      live = false;
      window.clearTimeout(boot);
      window.removeEventListener('focus', onFocus);
    };
  }, [apply]);

  function dismiss(persist: boolean) {
    if (!notice) return;
    if (persist && notice.dismissible) writeDismissedNoticeVersion(notice.version);
    setOpen(false);
  }

  if (!open || !notice) return null;

  const img = mediaUrl(notice.imageUrl);
  const cta = notice.ctaLabel && notice.ctaUrl ? { label: notice.ctaLabel, url: notice.ctaUrl } : null;
  const canPersistDismiss = notice.dismissible;
  const showGotIt = canPersistDismiss || !cta;

  return (
    <div className="site-notice" role="dialog" aria-modal="true" aria-labelledby="site-notice-title">
      <button
        className="site-notice-bg"
        type="button"
        aria-label={t('notice.close')}
        onClick={() => {
          if (canPersistDismiss) dismiss(true);
        }}
      />
      <div className={`site-notice-card ${img ? 'has-media' : ''}`}>
        {img ? (
          <div className="site-notice-media">
            <img src={img} alt="" />
            <div className="site-notice-media-fade" aria-hidden />
          </div>
        ) : null}
        <div className="site-notice-body">
          <p className="site-notice-eyebrow">{t('notice.eyebrow')}</p>
          {notice.title ? (
            <h2 id="site-notice-title">{notice.title}</h2>
          ) : (
            <h2 id="site-notice-title">{t('notice.eyebrow')}</h2>
          )}
          {notice.message ? <p className="site-notice-copy">{notice.message}</p> : null}
          <div className="site-notice-actions">
            {cta ? (
              isInternalPath(cta.url) ? (
                <Link className="btn btn-primary" to={cta.url} onClick={() => dismiss(true)}>
                  {cta.label}
                </Link>
              ) : (
                <a
                  className="btn btn-primary"
                  href={cta.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => dismiss(true)}
                >
                  {cta.label}
                </a>
              )
            ) : null}
            {showGotIt ? (
              <button
                className={`btn ${cta ? 'btn-ghost' : 'btn-primary'}`}
                type="button"
                onClick={() => dismiss(canPersistDismiss)}
              >
                {t('notice.gotIt')}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
