import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { CustomerSupportView } from 'src/sections/user/customer-support';

// ----------------------------------------------------------------------

const metadata = { title: `${CONFIG.appName} | Customer Support` };

export default function CustomerSupportPage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <CustomerSupportView />
    </>
  );
}

