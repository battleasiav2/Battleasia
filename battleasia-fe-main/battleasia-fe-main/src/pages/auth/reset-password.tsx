import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { ResetPasswordView } from 'src/sections/auth';

// ----------------------------------------------------------------------

const metadata = { title: `${CONFIG.appName} | Reset Password` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <ResetPasswordView />
    </>
  );
}
