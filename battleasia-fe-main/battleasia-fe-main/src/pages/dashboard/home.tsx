import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { HomeView } from 'src/sections/home/view';

// ----------------------------------------------------------------------

const metadata = { title: `${CONFIG.appName} | Dashboard` };

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <HomeView />
    </>
  );
}
