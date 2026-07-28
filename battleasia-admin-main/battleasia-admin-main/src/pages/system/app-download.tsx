import { Helmet } from 'react-helmet-async';
import { AppDownloadSettingsView } from 'src/sections/system/app-download';

export default function Page() {
  return (
    <>
      <Helmet>
        <title>App Download</title>
      </Helmet>

      <AppDownloadSettingsView />
    </>
  );
}
