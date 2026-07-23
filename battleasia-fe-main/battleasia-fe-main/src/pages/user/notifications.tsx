import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { NotificationsView } from 'src/sections/user/notifications';

// ----------------------------------------------------------------------

const metadata = { title: `${CONFIG.appName} | Notifications` };

export default function NotificationsPage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <NotificationsView />
    </>
  );
}

