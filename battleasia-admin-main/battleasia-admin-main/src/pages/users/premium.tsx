import { Helmet } from 'react-helmet-async';
import { UserPremiumView } from 'src/sections/users/premium';

export default function Page() {
  return (
    <>
      <Helmet>
        <title>User Premium</title>
      </Helmet>

      <UserPremiumView />
    </>
  );
}

