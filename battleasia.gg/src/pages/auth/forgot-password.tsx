import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { ForgotPasswordView } from 'src/sections/auth';

// ----------------------------------------------------------------------

const metadata = { title: `${CONFIG.appName} | Forgot Password` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <ForgotPasswordView />
    </>
  );
}
