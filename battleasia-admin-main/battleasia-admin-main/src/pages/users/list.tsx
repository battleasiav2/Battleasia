import { Helmet } from 'react-helmet-async';
import { UserListView } from 'src/sections/users/list';

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Users</title>
      </Helmet>

      <UserListView />
    </>
  );
}

