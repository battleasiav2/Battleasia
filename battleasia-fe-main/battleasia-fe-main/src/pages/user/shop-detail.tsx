import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';
import { ShopDetailView } from 'src/sections/user/shop';

// ----------------------------------------------------------------------

const metadata = { title: `${CONFIG.appName} | Shop Details` };

export default function ShopDetailPage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <ShopDetailView />
    </>
  );
}
