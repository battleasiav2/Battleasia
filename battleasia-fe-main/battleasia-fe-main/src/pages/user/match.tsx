import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { MatchView } from 'src/sections/user/play/match-view';

// ----------------------------------------------------------------------

const metadata = { title: `${CONFIG.appName} | Match Details` };

export default function MatchDetailsPage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <MatchView />
    </>
  );
}

