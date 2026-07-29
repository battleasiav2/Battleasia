import { Helmet } from 'react-helmet-async';
import FeedCategoriesPage from 'src/sections/feed/categories';

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Feed Categories</title>
      </Helmet>

      <FeedCategoriesPage />
    </>
  );
}

