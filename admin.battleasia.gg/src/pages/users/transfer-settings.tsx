import { Helmet } from 'react-helmet-async';
import { UserTransferSettingsView } from 'src/sections/users/transfer-settings';

export default function UserTransferSettingsPage() {
  return (
    <>
      <Helmet>
        <title>Transfer Settings | BattleAsia Admin</title>
      </Helmet>
      <UserTransferSettingsView />
    </>
  );
}
