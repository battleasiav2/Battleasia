import { Helmet } from 'react-helmet-async';
import { UserReferralSettingsView } from 'src/sections/users/referral-settings';

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Referral Settings</title>
      </Helmet>

      <UserReferralSettingsView />
    </>
  );
}
