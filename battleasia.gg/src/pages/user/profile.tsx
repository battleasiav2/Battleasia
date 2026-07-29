import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { ProfileView } from 'src/sections/user/profile/profile-view';

// ----------------------------------------------------------------------

const metadata = { title: `${CONFIG.appName} | Profile` };

export default function ProfilePage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <ProfileView />
    </>
  );
}

