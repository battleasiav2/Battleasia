import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { MatchDetailView } from 'src/sections/user/play/match-detail-view';

// ----------------------------------------------------------------------

const metadata = { title: `${CONFIG.appName} | Match Detail` };

export default function MatchCardDetailPage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <MatchDetailView />
    </>
  );
}

