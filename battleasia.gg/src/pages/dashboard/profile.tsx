import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { PublicProfileView } from 'src/sections/user/profile/public-profile-view';

// ----------------------------------------------------------------------

const metadata = { title: `${CONFIG.appName} | Profile` };

export default function PublicProfilePage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <PublicProfileView />
    </>
  );
}

