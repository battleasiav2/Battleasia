import { Helmet } from 'react-helmet-async';
import { MailSettingsView } from 'src/sections/system/mail-settings';

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Mail Settings</title>
      </Helmet>

      <MailSettingsView />
    </>
  );
}
