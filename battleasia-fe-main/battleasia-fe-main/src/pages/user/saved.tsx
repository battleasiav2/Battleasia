import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/global-config';
import { SavedFeedsView } from 'src/sections/user/feed/saved-view';

export default function SavedPage() {
  return (
    <>
      <Helmet>
        <title>{`${CONFIG.appName} | Saved`}</title>
      </Helmet>
      <SavedFeedsView />
    </>
  );
}
