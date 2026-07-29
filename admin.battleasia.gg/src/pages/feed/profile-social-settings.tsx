import { Helmet } from 'react-helmet-async';
import { ProfileSocialSettingsView } from 'src/sections/feed/profile-social-settings';

export default function ProfileSocialSettingsPage() {
  return (
    <>
      <Helmet>
        <title>Profile Social Settings</title>
      </Helmet>
      <ProfileSocialSettingsView />
    </>
  );
}
