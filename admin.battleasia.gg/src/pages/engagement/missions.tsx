import { Helmet } from 'react-helmet-async';
import EngagementMissionsView from 'src/sections/engagement/missions/view';

export default function EngagementMissionsPage() {
  return (
    <>
      <Helmet>
        <title>Engagement Missions | BattleAsia Admin</title>
      </Helmet>
      <EngagementMissionsView />
    </>
  );
}
