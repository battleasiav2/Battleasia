import { useEffect, useState } from 'react';
import { ACCENTS, applyAccent, applyTheme, readAccent, readTheme } from '../lib/theme';

export function ThemeDock() {
  const [accentId, setAccentId] = useState(readAccent);
  const [open, setOpen] = useState(false);
  const current = ACCENTS.find((a) => a.id === accentId) || ACCENTS[0];

  useEffect(() => {
    applyAccent(accentId);
    applyTheme(readTheme());
  }, [accentId]);

  useEffect(() => {
    function sync() {
      setAccentId(readAccent());
      applyTheme(readTheme());
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
    </div>
  );
}
