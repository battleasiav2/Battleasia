import { useEffect, useRef, useState } from 'react';
import { LOCALES, LOCALE_META, useI18n, type Locale } from '../lib/i18n';

export function LocaleSelect({ className = '' }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const current = LOCALE_META[locale];

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDoc);
    return () => document.removeEventListener('pointerdown', onDoc);
  }, [open]);

  const pick = (id: Locale) => {
    setLocale(id);
    setOpen(false);
  };

  return (
    <div className={`locale-select${open ? ' is-open' : ''} ${className}`.trim()} ref={wrapRef}>
      <button
        className="lang locale-btn"
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t('locale.label')}
        onClick={() => setOpen((v) => !v)}
      >
        <img className="locale-flag" src={current.flag} alt="" width={22} height={15} />
        <span className="locale-code">{locale.toUpperCase()}</span>
        <span className="locale-caret" aria-hidden>
          ▾
        </span>
      </button>
      {open ? (
        <div className="accent-pop lang-pop" role="listbox" aria-label={t('locale.list')}>
          {LOCALES.map((id) => {
            const meta = LOCALE_META[id];
            const active = id === locale;
            return (
              <button
                key={id}
                type="button"
                role="option"
                aria-selected={active}
                className={active ? 'is-active' : undefined}
                onClick={() => pick(id)}
              >
                <img className="locale-flag" src={meta.flag} alt="" width={22} height={15} />
                <span className="locale-label">{meta.label}</span>
                <span className="locale-code-sm">{id.toUpperCase()}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
