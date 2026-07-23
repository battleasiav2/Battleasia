import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { MyMatchesView } from 'src/sections/user/my-matches';

// ----------------------------------------------------------------------

const metadata = { title: `${CONFIG.appName} | My Matches` };

export default function MyMatchesPage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <MyMatchesView />
    </>
  );
}

