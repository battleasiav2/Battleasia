import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { SignUpView } from 'src/sections/auth';

// ----------------------------------------------------------------------

const metadata = { title: `${CONFIG.appName} | Sign up` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <SignUpView />
    </>
  );
}
