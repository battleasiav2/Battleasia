import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { SignInView } from 'src/sections/auth';

// ----------------------------------------------------------------------

const metadata = { title: `${CONFIG.appName} | Sign in` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <SignInView />
    </>
  );
}
