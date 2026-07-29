import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { MyStatisticsView } from 'src/sections/user/my-statistics';

// ----------------------------------------------------------------------

const metadata = { title: `${CONFIG.appName} | My Statistics` };

export default function MyStatisticsPage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <MyStatisticsView />
    </>
  );
}

