import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { FeedView } from 'src/sections/user/feed';

// ----------------------------------------------------------------------

const metadata = { title: `${CONFIG.appName} | Feed` };

export default function FeedPage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <FeedView />
    </>
  );
}

