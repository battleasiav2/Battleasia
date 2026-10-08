import { useEffect, useState } from 'react';
import { applyAccent, readTheme, toggleTheme } from '../lib/theme';

export function ThemeDock() {
  const [theme, setTheme] = useState(readTheme);

  useEffect(() => {
    applyAccent('lime');
  }, []);

  return (
    <div className="theme-dock">
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
