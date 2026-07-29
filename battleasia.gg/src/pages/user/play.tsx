import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { PlayView } from 'src/sections/user/play/play-view';

// ----------------------------------------------------------------------

const metadata = { title: `${CONFIG.appName} | Play` };

export default function PlayPage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <PlayView />
    </>
  );
}

