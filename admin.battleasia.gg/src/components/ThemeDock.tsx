import { useEffect, useState } from 'react';
import { ACCENTS, applyAccent, applyTheme, readAccent, readTheme, toggleTheme } from '../lib/theme';

export function ThemeDock() {
  const [accentId, setAccentId] = useState(readAccent);
  const [theme, setTheme] = useState(readTheme);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    applyAccent(accentId);
    applyTheme(theme);
  }, [accentId, theme]);

  useEffect(() => {
    if (!open) return;
    function onDoc() {
      setOpen(false);
    }
    document.addEventListener('pointerdown', onDoc);
    return () => document.removeEventListener('pointerdown', onDoc);
  }, [open]);

  return (
    <div className="theme-dock" onPointerDown={(e) => e.stopPropagation()}>
      <div className="accent-dots">
        {ACCENTS.slice(0, 3).map((accent) => (
          <button
            key={accent.id}
            type="button"
            style={{ background: accent.color }}
            title={accent.id}
            className={accentId === accent.id ? 'on' : ''}
            onClick={() => {
              applyAccent(accent.id);
              setAccentId(accent.id);
            }}
          />
        ))}
      </div>
      <button className="lang" type="button" aria-expanded={open} aria-label="More accents" onClick={() => setOpen((v) => !v)}>
        +
      </button>
      {open ? (
        <div className="accent-pop">
          {ACCENTS.map((accent) => (
            <button
              key={accent.id}
              type="button"
              style={{ background: accent.color }}
              title={accent.id}
              className={accentId === accent.id ? 'on' : ''}
              onClick={() => {
                applyAccent(accent.id);
                setAccentId(accent.id);
                setOpen(false);
              }}
            />
          ))}
        </div>
      ) : null}
      <button
        className="lang"
        type="button"
        title={theme === 'light' ? 'Dark' : 'Light'}
        onClick={() => {
          toggleTheme();
          setTheme(readTheme());
        }}
      >
        Aa
      </button>
    </div>
  );
}
