import { Helmet } from 'react-helmet-async';
import { ReelsModerationView } from 'src/sections/feed/reels-moderation';

export default function ReelsModerationPage() {
  return (
    <>
      <Helmet>
        <title>Reels Moderation</title>
      </Helmet>
      <ReelsModerationView />
    </>
  );
}
