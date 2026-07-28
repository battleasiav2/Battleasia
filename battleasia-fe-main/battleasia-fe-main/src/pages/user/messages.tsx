import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { MessagesView } from 'src/sections/user/messages';

// ----------------------------------------------------------------------

const metadata = { title: `${CONFIG.appName} | Messages` };

export default function MessagesPage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <MessagesView />
    </>
  );
}
