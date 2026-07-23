import { Helmet } from 'react-helmet-async';
import { UserHistoryView } from 'src/sections/users/history';

export default function Page() {
  return (
    <>
      <Helmet>
        <title>User History</title>
      </Helmet>

      <UserHistoryView />
    </>
  );
}

