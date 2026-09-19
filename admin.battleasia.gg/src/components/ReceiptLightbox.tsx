import { useRef, useState, type PointerEvent, type WheelEvent } from 'react';
import { useI18n } from '../lib/i18n';

type Props = {
  src: string;
  trx?: string;
  phone?: string;
  onClose: () => void;
  onCopy: (text: string) => void;
};

export function ReceiptLightbox({ src, trx, phone, onClose, onCopy }: Props) {
  const { t } = useI18n();
  const [zoom, setZoom] = useState(1);
  const [rot, setRot] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  function onWheel(e: WheelEvent) {
    e.preventDefault();
    setZoom((z) => Math.min(4, Math.max(0.4, z + (e.deltaY > 0 ? -0.12 : 0.12))));
  }

  function onDown(e: PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: pos.x, y: pos.y, px: e.clientX, py: e.clientY };
  }

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    setPos({
      x: drag.current.x + (e.clientX - drag.current.px),
      y: drag.current.y + (e.clientY - drag.current.py),
    });
  }

  function onUp() {
    drag.current = null;
  }

  return (
    <div className="lightbox" role="dialog" aria-label={t('lightbox.receipt')}>
      <div className="lightbox-tools">
        <button className="btn btn-ghost" type="button" onClick={() => setZoom((z) => Math.min(4, z + 0.2))}>
          {t('lightbox.zoomIn')}
        </button>
        <button className="btn btn-ghost" type="button" onClick={() => setZoom((z) => Math.max(0.4, z - 0.2))}>
          {t('lightbox.zoomOut')}
        </button>
        <button className="btn btn-ghost" type="button" onClick={() => setRot((r) => r + 90)}>
          {t('lightbox.rotate')}
        </button>
        <button
          className="btn btn-ghost"
          type="button"
          onClick={() => {
            setZoom(1);
            setRot(0);
            setPos({ x: 0, y: 0 });
          }}
        >
          {t('lightbox.reset')}
        </button>
        {trx ? (
          <button className="btn btn-ghost" type="button" onClick={() => onCopy(trx)}>
            {t('lightbox.copyTrx')}
          </button>
        ) : null}
        {phone ? (
          <button className="btn btn-ghost" type="button" onClick={() => onCopy(phone)}>
            {t('lightbox.copyPhone')}
          </button>
        ) : null}
        <button className="btn btn-primary" type="button" onClick={onClose}>
          {t('chrome.close')}
        </button>
      </div>
      <div
        className="lightbox-stage"
        onWheel={onWheel}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <img
          src={src}
          alt={t('lightbox.receipt')}
          draggable={false}
          style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom}) rotate(${rot}deg)` }}
        />
      </div>
    </div>
  );
}
