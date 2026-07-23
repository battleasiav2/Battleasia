import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { MyOrdersView } from 'src/sections/user/my-orders';

// ----------------------------------------------------------------------

const metadata = { title: `${CONFIG.appName} | My Orders` };

export default function MyOrdersPage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <MyOrdersView />
    </>
  );
}

