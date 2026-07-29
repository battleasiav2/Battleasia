import { Helmet } from 'react-helmet-async';
import { UserOnlineView } from 'src/sections/users/online';

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Online Users</title>
      </Helmet>

      <UserOnlineView />
    </>
  );
}

