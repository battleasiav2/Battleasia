import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { TransferView } from 'src/sections/user/wallet/transfer-view';

// ----------------------------------------------------------------------

const metadata = { title: `${CONFIG.appName} | Transfer BAC` };

export default function TransferPage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <TransferView />
    </>
  );
}
