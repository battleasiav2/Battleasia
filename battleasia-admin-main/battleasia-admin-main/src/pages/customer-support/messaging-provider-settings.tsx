import { Helmet } from 'react-helmet-async';
import { MessagingProviderSettingsView } from 'src/sections/customer-support/messaging-provider-settings';

export default function MessagingProviderSettingsPage() {
  return (
    <>
      <Helmet>
        <title>Messaging Providers | BattleAsia Admin</title>
      </Helmet>
      <MessagingProviderSettingsView />
    </>
  );
}
