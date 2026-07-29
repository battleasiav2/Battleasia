import { Helmet } from 'react-helmet-async';

import { UserReferralHistoryView } from 'src/sections/users/referral-history';

// ----------------------------------------------------------------------

export default function UserReferralHistoryPage() {
  return (
    <>
      <Helmet>
        <title>Referral History | Admin</title>
      </Helmet>

      <UserReferralHistoryView />
    </>
  );
}
