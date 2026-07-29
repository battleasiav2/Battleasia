import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { LeaderBoardView } from 'src/sections/user/leader-board';

// ----------------------------------------------------------------------

const metadata = { title: `${CONFIG.appName} | Leader Board` };

export default function LeaderBoardPage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <LeaderBoardView />
    </>
  );
}

