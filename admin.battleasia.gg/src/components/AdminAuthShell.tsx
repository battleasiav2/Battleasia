import { ASSETS } from '../lib/assets';
import { LocaleSelect } from './LocaleSelect';
import { HeroVideo } from './HeroVideo';
import { ThemeDock } from './ThemeDock';
import type { ReactNode } from 'react';

const PLAYER = (import.meta.env.VITE_PLAYER_URL as string | undefined) || 'https://battleasia.gg';

export function AdminAuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="auth-shell">
      <section className="auth-form-pane">
        <div className="auth-toolbar">
          <a className="brand" href={PLAYER}>
            <img src={ASSETS.logo} width={40} height={40} alt="BattleAsia" />
            <div className="brand-name">
              BATTLE ASIA <span>ADMIN</span>
            </div>
          </a>
          <div className="auth-toolbar-right">
            <LocaleSelect />
            <ThemeDock />
          </div>
        </div>
        <h1>{title}</h1>
        {subtitle ? <p className="auth-sub">{subtitle}</p> : null}
        {children}
      </section>
      <aside className="auth-hero" aria-hidden>
        <HeroVideo className="hero-media" />
        <div className="auth-hero-copy">
          <small>STAFF</small>
          <p>BattleAsia Admin</p>
        </div>
      </aside>
    </div>
  );
}
