import { useEffect, useState } from 'react';
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
      <img src="/assets/bac-coin.webp" alt="" width={72} height={72} />
    </span>
  );
}

export function ShopPage() {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const [clock, setClock] = useState(0);
  const [note, setNote] = useState('');
  const slide = SLIDES[index];
  const facts = [
    ['bac.factRoom', 'bac.factRoomBody'],
    ['bac.factPrize', 'bac.factPrizeBody'],
    ['bac.factHour', 'bac.factHourBody'],
  ] as const;

  useHudPage();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setIndex((n) => (n + 1) % SLIDES.length), 5000);
    return () => window.clearInterval(id);
  }, [clock]);

  function pick(next: number) {
    setIndex(next);
    setClock((n) => n + 1);
  }

  function step(dir: number) {
    setIndex((n) => (n + dir + SLIDES.length) % SLIDES.length);
    setClock((n) => n + 1);
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
            <img key={slide.src} src={slide.src} alt="" width={720} height={900} />
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
                onClick={() => pick(i)}
              >
                <img src={item.src} alt="" width={120} height={72} />
              </button>
            ))}
          </div>
          <div className="bac-gate-dots">
            {SLIDES.map((item, i) => (
              <button key={item.title} type="button" className={i === index ? 'on' : ''} aria-label={item.title} onClick={() => pick(i)} />
            ))}
          </div>
        </section>
        <div className="bac-gate-panel">
          <div className="bac-gate-domain" role="note">
            <strong>{t('shop.onShopDomain')}</strong>
            <span>{t('shop.onShopDomainLead')}</span>
          </div>
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
