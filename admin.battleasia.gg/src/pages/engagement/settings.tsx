import { Helmet } from 'react-helmet-async';
import EngagementSettingsView from 'src/sections/engagement/settings/view';

export default function EngagementSettingsPage() {
  return (
    <>
      <Helmet>
        <title>Engagement Settings | BattleAsia Admin</title>
      </Helmet>
      <EngagementSettingsView />
    </>
  );
}
