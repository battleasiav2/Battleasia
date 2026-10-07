import { useState } from 'react';
import { useHudPage } from '../../hooks/useHudPage';
import { ASSETS } from '../../lib/assets';
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

export function ShopPage() {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const [note, setNote] = useState('');
  const slide = SLIDES[index];

  useHudPage();

  function goShop() {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setNote(t('bac.needNet'));
      return;
    }
    window.location.assign(getBacShopEntryUrl('/user/shop'));
  }

  return (
    <main className="bac-gate">
      <h1>{t('bac.title')}</h1>
      <p className="bac-gate-lead">{t('bac.lead')}</p>
      <section className="bac-gate-card" aria-roledescription="carousel" aria-label={t('bac.title')}>
        <div className="bac-gate-stage">
          <img src={slide.src} alt="" width={960} height={540} />
          <span className="bac-gate-badge" aria-hidden>
            <img src={ASSETS.coin} alt="" width={36} height={36} />
          </span>
          <div className="bac-gate-copy">
            <p>{t('bac.newSkins')}</p>
            <h2>{slide.title}</h2>
          </div>
          <div className="bac-gate-pager">
            <button type="button" aria-label="Previous" onClick={() => setIndex((n) => (n + SLIDES.length - 1) % SLIDES.length)}>
              ‹
            </button>
            <span>
              {index + 1}/{SLIDES.length}
            </span>
            <button type="button" aria-label="Next" onClick={() => setIndex((n) => (n + 1) % SLIDES.length)}>
              ›
            </button>
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
              <img src={item.src} alt="" width={72} height={48} />
            </button>
          ))}
        </div>
      </section>
      {note ? <p className="bac-gate-note">{note}</p> : null}
      <button className="bac-gate-go" type="button" onClick={goShop}>
        {t('bac.go')}
      </button>
    </main>
  );
}
