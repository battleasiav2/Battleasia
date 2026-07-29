import { Helmet } from 'react-helmet-async';
import { LiveChatSettingsView } from 'src/sections/customer-support/live-chat-settings';

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Live Chat Settings</title>
      </Helmet>

      <LiveChatSettingsView />
    </>
  );
}
