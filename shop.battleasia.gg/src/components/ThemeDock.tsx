import { useEffect, useState } from 'react';
import { ACCENTS, applyAccent, applyTheme, readAccent, readTheme, toggleTheme } from '../lib/theme';

function SunIcon() {
  return (
    <svg className="theme-sun" viewBox="0 0 24 24" width="16" height="16" aria-hidden>
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.1 5.1l1.6 1.6M17.3 17.3l1.6 1.6M5.1 18.9l1.6-1.6M17.3 6.7l1.6-1.6" />
      </g>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="theme-moon" viewBox="0 0 24 24" width="16" height="16" aria-hidden>
      <path
        fill="currentColor"
        d="M16.4 14.2A6.8 6.8 0 0 1 9.8 7.6a6.5 6.5 0 0 0-.4 2.2 6.8 6.8 0 0 0 8.4 6.6 6.5 6.5 0 0 1-1.4-2.2Z"
      />
    </svg>
  );
}

export function ThemeDock() {
  const [accentId, setAccentId] = useState(readAccent);
  const [theme, setTheme] = useState(readTheme);
  const [open, setOpen] = useState(false);
  const current = ACCENTS.find((a) => a.id === accentId) || ACCENTS[0];

  useEffect(() => {
    applyAccent(accentId);
    applyTheme(theme);
  }, [accentId, theme]);

  useEffect(() => {
    function sync() {
      setAccentId(readAccent());
      setTheme(readTheme());
    }
    window.addEventListener('storage', sync);
    window.addEventListener('ba-theme-change', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('ba-theme-change', sync);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function onDoc() {
      setOpen(false);
    }
    document.addEventListener('pointerdown', onDoc);
    return () => document.removeEventListener('pointerdown', onDoc);
  }, [open]);

  return (
    <div className={`theme-dock${open ? ' is-open' : ''}`} onPointerDown={(e) => e.stopPropagation()}>
      <button
        className="theme-chip"
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Accent color"
        title={current.id}
        onClick={() => setOpen((v) => !v)}
      >
        <i className="accent-dot" style={{ background: current.color }} aria-hidden />
      </button>
      {open ? (
        <div className="theme-pop" role="listbox" aria-label="Accents">
          {ACCENTS.map((accent) => (
            <button
              key={accent.id}
              type="button"
              role="option"
              aria-selected={accentId === accent.id}
              style={{ background: accent.color }}
              title={accent.id}
              className={accentId === accent.id ? 'on' : undefined}
              onClick={() => {
                applyAccent(accent.id);
                setAccentId(accent.id);
                window.dispatchEvent(new Event('ba-theme-change'));
                setOpen(false);
              }}
            />
          ))}
        </div>
      ) : null}
      <button
        className="theme-mode"
        type="button"
        title={theme === 'light' ? 'Dark mode' : 'Light mode'}
        aria-label={theme === 'light' ? 'Dark mode' : 'Light mode'}
        onClick={() => {
          toggleTheme();
          setTheme(readTheme());
          window.dispatchEvent(new Event('ba-theme-change'));
        }}
      >
        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
      </button>
    </div>
  );
}
