import { Helmet } from 'react-helmet-async';
import { UserRoleView } from 'src/sections/users/role';

export default function Page() {
  return (
    <>
      <Helmet>
        <title>User Roles</title>
      </Helmet>

      <UserRoleView />
    </>
  );
}

