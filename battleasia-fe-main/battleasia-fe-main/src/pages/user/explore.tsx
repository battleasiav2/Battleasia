import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/global-config';
import { ExploreView } from 'src/sections/user/feed/explore-view';

export default function ExplorePage() {
  return (
    <>
      <Helmet>
        <title>{`${CONFIG.appName} | Explore`}</title>
      </Helmet>
      <ExploreView />
    </>
  );
}
