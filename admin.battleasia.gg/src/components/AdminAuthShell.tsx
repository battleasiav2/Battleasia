import type { ReactNode } from 'react';
import { useI18n } from '../lib/i18n';
import { LocaleSelect } from './LocaleSelect';
import { ThemeDock } from './ThemeDock';

const PLAYER = (import.meta.env.VITE_PLAYER_URL as string | undefined) || 'https://battleasia.gg';

export function AdminAuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="ops-gate">
      <section className="ops-card">
        <header className="ops-top">
          <div className="ops-id">
            <span className="ops-mark" aria-hidden>OPS</span>
            <div>
              <strong>{t('login.staffPill')}</strong>
              <small>Restricted</small>
            </div>
          </div>
          <div className="ops-tools">
            <LocaleSelect />
            <ThemeDock />
          </div>
        </header>
        <h1>{title}</h1>
        {subtitle ? <p className="ops-lead">{subtitle}</p> : null}
        {children}
        <p className="ops-foot">
          {t('login.arena')} <a href={PLAYER}>player site</a>
        </p>
      </section>
    </div>
  );
}
