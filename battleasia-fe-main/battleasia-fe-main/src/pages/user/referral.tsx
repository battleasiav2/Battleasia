import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { ReferralView } from 'src/sections/user/referral';

// ----------------------------------------------------------------------

const metadata = { title: `${CONFIG.appName} | Referral` };

export default function ReferralPage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <ReferralView />
    </>
  );
}

