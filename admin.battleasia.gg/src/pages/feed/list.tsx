import { Helmet } from 'react-helmet-async';
import FeedListView from 'src/sections/feed/list';

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Feed List</title>
      </Helmet>

      <FeedListView />
    </>
  );
}

