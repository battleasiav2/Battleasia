import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { FeedDetailView } from 'src/sections/user/feed';

// ----------------------------------------------------------------------

const metadata = { title: `${CONFIG.appName} | Feed Detail` };

export default function FeedDetailPage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <FeedDetailView />
    </>
  );
}

