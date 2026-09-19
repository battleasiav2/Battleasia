import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export function RouteProgress() {
  const location = useLocation();
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(true);
    const t = window.setTimeout(() => setOn(false), 420);
    return () => window.clearTimeout(t);
  }, [location.pathname]);

  return <div className={on ? 'route-bar is-on' : 'route-bar'} aria-hidden />;
}
