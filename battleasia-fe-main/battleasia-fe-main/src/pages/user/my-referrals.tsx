import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { MyReferralsView } from 'src/sections/user/my-referrals';

// ----------------------------------------------------------------------

const metadata = { title: `${CONFIG.appName} | My Referrals` };

export default function MyReferralsPage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <MyReferralsView />
    </>
  );
}

