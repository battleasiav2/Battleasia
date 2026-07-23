import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { WalletView } from 'src/sections/user/wallet';

// ----------------------------------------------------------------------

const metadata = { title: `${CONFIG.appName} | Wallet` };

export default function WalletPage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <WalletView />
    </>
  );
}

