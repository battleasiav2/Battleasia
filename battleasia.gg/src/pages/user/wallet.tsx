import { useEffect } from 'react';
import { useHudPage } from '../../hooks/useHudPage';
import { useI18n } from '../../lib/i18n';
import { getBacShopWalletUrl, openBacShop } from '../../lib/wallet';

/** Wallet lives only on the shop domain — same pattern as Transfer. */
export function WalletPage() {
  const { t } = useI18n();

  useHudPage();

  useEffect(() => {
    window.location.replace(getBacShopWalletUrl());
  }, []);

  return (
    <main className="play-main">
      <header className="play-head">
        <div>
          <p className="eyebrow">{t('nav.wallet')}</p>
          <h1>{t('wallet.hubTitle')}</h1>
          <p className="play-lead">{t('wallet.hubLead')}</p>
        </div>
      </header>
      <section className="room-card shop-hub-links">
        <p>{t('wallet.redirecting')}</p>
        <div className="shop-hub-link-row">
          <button type="button" className="btn btn-primary" onClick={() => openBacShop('wallet')}>
            {t('wallet.openShop')}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => openBacShop('entry')}>
            {t('shop.goToBacShop')}
          </button>
        </div>
      </section>
    </main>
  );
}
