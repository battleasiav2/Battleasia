import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { MatchResultView } from 'src/sections/user/play/match-result-view';

// ----------------------------------------------------------------------

const metadata = { title: `${CONFIG.appName} | Match Result` };

export default function MatchResultPage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <MatchResultView />
    </>
  );
}
