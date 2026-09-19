import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

export type HudHandlers = {
  quickJoin: () => void;
  copyRoom: () => void;
  ready: () => void;
  leave: () => void;
  matchDetails: () => void;
  openChat: () => void;
  share: () => void;
  leaderboard: () => void;
  follow: () => void;
};

const defaults: HudHandlers = {
  quickJoin: () => undefined,
  copyRoom: () => undefined,
  ready: () => undefined,
  leave: () => undefined,
  matchDetails: () => undefined,
  openChat: () => undefined,
  share: () => undefined,
  leaderboard: () => undefined,
  follow: () => undefined,
};

type HudContextValue = {
  toast: (message: string) => void;
  toastText: string;
  handlers: HudHandlers;
  register: (partial: Partial<HudHandlers>) => () => void;
};

const HudContext = createContext<HudContextValue | null>(null);

export function HudProvider({ children }: { children: ReactNode }) {
  const [toastText, setToastText] = useState('');
  const timer = useRef(0);
  const [handlers, setHandlers] = useState<HudHandlers>(defaults);

  const toast = useCallback((message: string) => {
    setToastText(message);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToastText(''), 2800);
  }, []);

  const register = useCallback((partial: Partial<HudHandlers>) => {
    setHandlers((prev) => ({ ...prev, ...partial }));
    return () => {
      setHandlers((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(partial) as (keyof HudHandlers)[]) {
          next[key] = defaults[key];
        }
        return next;
      });
    };
  }, []);

  const value = useMemo(
    () => ({ toast, toastText, handlers, register }),
    [toast, toastText, handlers, register]
  );

  return <HudContext.Provider value={value}>{children}</HudContext.Provider>;
}

export function useHud() {
  const ctx = useContext(HudContext);
  if (!ctx) throw new Error('useHud must be inside HudProvider');
  return ctx;
}
