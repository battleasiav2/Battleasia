import { useState } from 'react';
import { useHudPage } from '../../hooks/useHudPage';
import { useI18n } from '../../lib/i18n';
import { getBacShopEntryUrl } from '../../lib/wallet';
import '../../styles/bac-gate.css';

const SLIDES = [
  { src: '/assets/games/pubg.webp', title: 'PUBG Mobile' },
  { src: '/assets/games/freefire.webp', title: 'Free Fire' },
  { src: '/assets/games/cod.webp', title: 'COD Mobile' },
  { src: '/assets/games/mlbb.webp', title: 'Mobile Legends' },
  { src: '/assets/games/valorant.webp', title: 'Valorant' },
] as const;

function BacMark() {
  return (
    <span className="bac-mark" aria-hidden>
      <svg viewBox="0 0 72 72" fill="none">
        <circle cx="36" cy="36" r="34" fill="#12140A" stroke="#D4E82A" strokeWidth="2.5" />
        <circle cx="36" cy="36" r="26" stroke="#D4E82A" strokeOpacity="0.45" strokeWidth="1" />
        <path d="M28 24h12.2c4.6 0 7.6 2.5 7.6 6.3 0 2.7-1.6 4.8-4.1 5.7 3.1.8 5 3.2 5 6.4 0 4.2-3.3 7.1-8.3 7.1H28V24Zm6.2 9.2h5.2c1.8 0 2.9-1 2.9-2.4s-1.1-2.3-2.9-2.3h-5.2v4.7Zm0 10.6h6c2 0 3.3-1 3.3-2.6s-1.3-2.6-3.3-2.6h-6v5.2Z" fill="#D4E82A" />
      </svg>
    </span>
  );
}

export function ShopPage() {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const [note, setNote] = useState('');
  const slide = SLIDES[index];
  const facts = [
    ['bac.factRoom', 'bac.factRoomBody'],
    ['bac.factPrize', 'bac.factPrizeBody'],
    ['bac.factHour', 'bac.factHourBody'],
  ] as const;

  useHudPage();

  function step(dir: number) {
    setIndex((n) => (n + dir + SLIDES.length) % SLIDES.length);
  }

  function goShop() {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setNote(t('bac.needNet'));
      return;
    }
    window.location.assign(getBacShopEntryUrl('/user/shop'));
  }

  return (
    <main className="bac-gate">
      <div className="bac-gate-layout">
        <header className="bac-gate-head">
          <BacMark />
          <h1>{t('bac.title')}</h1>
          <p className="bac-gate-lead">{t('bac.lead')}</p>
        </header>
        <section className="bac-gate-card" aria-roledescription="carousel" aria-label={t('bac.title')}>
          <div className="bac-gate-stage">
            <img src={slide.src} alt="" width={720} height={900} />
          </div>
          <div className="bac-gate-caption">
            <span>{slide.title}</span>
            <div className="bac-gate-pager">
              <button type="button" aria-label="Previous" onClick={() => step(-1)}>‹</button>
              <span>{index + 1}/{SLIDES.length}</span>
              <button type="button" aria-label="Next" onClick={() => step(1)}>›</button>
            </div>
          </div>
          <div className="bac-gate-thumbs" role="tablist">
            {SLIDES.map((item, i) => (
              <button
                key={item.title}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={item.title}
                className={i === index ? 'on' : ''}
                onClick={() => setIndex(i)}
              >
                <img src={item.src} alt="" width={120} height={72} />
              </button>
            ))}
          </div>
          <div className="bac-gate-dots">
            {SLIDES.map((item, i) => (
              <button key={item.title} type="button" className={i === index ? 'on' : ''} aria-label={item.title} onClick={() => setIndex(i)} />
            ))}
          </div>
        </section>
        <div className="bac-gate-panel">
          <ul className="bac-facts">
            {facts.map(([title, body]) => (
              <li key={title}><b>{t(title)}</b><span>{t(body)}</span></li>
            ))}
          </ul>
          {note ? <p className="bac-gate-note">{note}</p> : null}
          <button className="bac-gate-go" type="button" onClick={goShop}>{t('bac.go')}</button>
        </div>
      </div>
    </main>
  );
}
