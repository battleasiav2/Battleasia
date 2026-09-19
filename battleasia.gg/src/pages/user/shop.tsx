import { useHudPage } from '../../hooks/useHudPage';
import { useI18n } from '../../lib/i18n';
import { openBacShop } from '../../lib/wallet';

const FEATURES = [
  { titleKey: 'shop.feat.buy', leadKey: 'shop.feat.buyLead' },
  { titleKey: 'shop.feat.rewards', leadKey: 'shop.feat.rewardsLead' },
  { titleKey: 'shop.feat.events', leadKey: 'shop.feat.eventsLead' },
  { titleKey: 'shop.feat.secure', leadKey: 'shop.feat.secureLead' },
] as const;

export function ShopPage() {
  const { t } = useI18n();

  useHudPage();

  return (
    <main className="play-main shop-hub">
      <header className="play-head shop-hub-hero">
        <div>
          <p className="eyebrow">{t('shop.eyebrow')}</p>
          <h1>{t('shop.hubTitle')}</h1>
          <p className="play-lead">{t('shop.hubLead')}</p>
          <div className="shop-hub-stats" aria-hidden>
            <span>
              <small>{t('shop.currency')}</small>
              <b>BAC</b>
            </span>
            <span>
              <small>{t('shop.settlement')}</small>
              <b>{t('shop.instant')}</b>
            </span>
            <span>
              <small>{t('shop.access')}</small>
              <b>24/7</b>
            </span>
          </div>
          <div className="shop-hub-ctas">
            <button type="button" className="btn btn-primary" onClick={() => openBacShop('entry')}>
              {t('shop.goToBacShop')}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => openBacShop('wallet')}>
              {t('shop.openWallet')}
            </button>
          </div>
        </div>
        <div className="shop-hub-art" aria-hidden>
          <img src="/assets/images/currency.webp" width={120} height={120} alt="" />
        </div>
      </header>

      <section className="shop-hub-grid" aria-label={t('shop.features')}>
        {FEATURES.map((f) => (
          <article key={f.titleKey} className="room-card shop-hub-card">
            <h2>{t(f.titleKey)}</h2>
            <p>{t(f.leadKey)}</p>
          </article>
        ))}
      </section>

      <section className="room-card shop-hub-links">
        <h2>{t('shop.onShopDomain')}</h2>
        <p className="play-muted">{t('shop.onShopDomainLead')}</p>
        <div className="shop-hub-link-row">
          <button type="button" className="btn btn-primary" onClick={() => openBacShop('shop')}>
            {t('shop.buyBac')}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => openBacShop('transfer')}>
            {t('nav.transfer')}
          </button>
        </div>
      </section>
    </main>
  );
}
