import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { EmailVerificationView } from 'src/sections/auth/email-verification-view';

// ----------------------------------------------------------------------

const metadata = { title: `Email Verification - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <EmailVerificationView />
    </>
  );
}
