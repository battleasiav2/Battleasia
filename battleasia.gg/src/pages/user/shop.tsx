import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { ShopView } from 'src/sections/user/shop';

// ----------------------------------------------------------------------

const metadata = { title: `${CONFIG.appName} | Shop` };

export default function ShopPage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <ShopView />
    </>
  );
}

