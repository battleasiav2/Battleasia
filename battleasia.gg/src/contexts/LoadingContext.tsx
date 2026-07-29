import { useRef, useMemo, useState, useContext, useCallback, createContext } from 'react';

// ----------------------------------------------------------------------

type LoadingContextType = {
  /** Increment loading counter (show spinner) */
  showLoading: () => void;
  /** Decrement loading counter (hide spinner when counter reaches 0) */
  hideLoading: () => void;
  /** True when any loader is active */
  isLoading: boolean;
};

const LoadingContext = createContext<LoadingContextType | null>(null);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  // Use a counter so multiple concurrent callers are all accounted for
  const counterRef = useRef(0);
  const [isLoading, setIsLoading] = useState(false);

  const showLoading = useCallback(() => {
    counterRef.current += 1;
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    counterRef.current = Math.max(0, counterRef.current - 1);
    if (counterRef.current === 0) {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({ showLoading, hideLoading, isLoading }),
    [showLoading, hideLoading, isLoading]
  );

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
}

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error('useLoading must be used inside <LoadingProvider>');
  return ctx;
}
