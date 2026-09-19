import { useEffect } from 'react';
import { useHudPage } from '../../hooks/useHudPage';
import { useI18n } from '../../lib/i18n';
import { getBacShopTransferUrl, openBacShop } from '../../lib/wallet';

/** Transfer lives only on the shop domain — same as live battleasianew. */
export function TransferPage() {
  const { t } = useI18n();

  useHudPage();

  useEffect(() => {
    window.location.replace(getBacShopTransferUrl());
  }, []);

  return (
    <main className="play-main">
      <header className="play-head">
        <div>
          <p className="eyebrow">{t('nav.transfer')}</p>
          <h1>{t('xfer.hubTitle')}</h1>
          <p className="play-lead">{t('xfer.hubLead')}</p>
        </div>
      </header>
      <section className="room-card shop-hub-links">
        <p>{t('xfer.redirecting')}</p>
        <div className="shop-hub-link-row">
          <button type="button" className="btn btn-primary" onClick={() => openBacShop('transfer')}>
            {t('xfer.openShop')}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => openBacShop('entry')}>
            {t('shop.goToBacShop')}
          </button>
        </div>
      </section>
    </main>
  );
}
