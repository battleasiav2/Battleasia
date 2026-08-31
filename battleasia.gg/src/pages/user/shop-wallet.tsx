import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { ShopWalletView } from 'src/sections/user/shop/shop-wallet-view';

// ----------------------------------------------------------------------

const metadata = { title: `${CONFIG.appName} | Shop Wallet` };

export default function ShopWalletPage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <ShopWalletView />
    </>
  );
}
