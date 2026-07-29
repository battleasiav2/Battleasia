import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/global-config';
import { ReelsView } from 'src/sections/user/feed/reels-view';

export default function ReelsPage() {
  return (
    <>
      <Helmet>
        <title>{`${CONFIG.appName} | Reels`}</title>
      </Helmet>
      <ReelsView />
    </>
  );
}
