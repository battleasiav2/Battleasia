import { useEffect, useState } from 'react';
import '../styles/gaming-cursor.css';

const canUseGamingCursor = () =>
  typeof window !== 'undefined' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const INTERACTIVE =
  'a, button, [role="button"], .join-btn, .match-tab, .topic-chip, .game-card, .play-card, .room-card, .match-card, .mode-card, .oauth-btn, .drawer-card, label.checkline';

export function GamingCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);
  const [hover, setHover] = useState(false);
  const [textMode, setTextMode] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (!canUseGamingCursor()) return;

    document.documentElement.classList.add('has-gaming-cursor');

    const updateMode = (target: EventTarget | null) => {
      if (!(target instanceof Element)) {
        setHover(false);
        setTextMode(false);
        return;
      }
      if (target.closest('input, textarea, select, [contenteditable="true"]')) {
        setTextMode(true);
        setHover(false);
        return;
      }
      setTextMode(false);
      setHover(Boolean(target.closest(INTERACTIVE)));
    };

    const onMove = (event: PointerEvent) => {
      setPos({ x: event.clientX, y: event.clientY });
      setVisible(true);
      updateMode(event.target);
    };
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerdown', onDown, { passive: true });
    document.addEventListener('pointerup', onUp, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    document.documentElement.addEventListener('mouseenter', onEnter);

    return () => {
      document.documentElement.classList.remove('has-gaming-cursor');
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointerup', onUp);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      document.documentElement.removeEventListener('mouseenter', onEnter);
    };
  }, []);

  if (!canUseGamingCursor()) return null;

  return (
    <div
      className={`gaming-cursor ${visible ? 'is-visible' : ''} ${hover ? 'is-hover' : ''} ${textMode ? 'is-text' : ''} ${pressed ? 'is-pressed' : ''}`}
      style={{ left: pos.x, top: pos.y }}
      aria-hidden="true"
    >
      <span className="gaming-cursor-glow" />
      <span className="gaming-cursor-ring" />
      <span className="gaming-cursor-ring gaming-cursor-ring--inner" />
      <span className="gaming-cursor-tick gaming-cursor-tick--n" />
      <span className="gaming-cursor-tick gaming-cursor-tick--e" />
      <span className="gaming-cursor-tick gaming-cursor-tick--s" />
      <span className="gaming-cursor-tick gaming-cursor-tick--w" />
      <span className="gaming-cursor-dot" />
      <span className="gaming-cursor-beam" />
    </div>
  );
}
