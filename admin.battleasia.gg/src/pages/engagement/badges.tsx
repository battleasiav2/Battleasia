import { Helmet } from 'react-helmet-async';
import EngagementBadgesView from 'src/sections/engagement/badges/view';

export default function EngagementBadgesPage() {
  return (
    <>
      <Helmet>
        <title>Engagement Badges | BattleAsia Admin</title>
      </Helmet>
      <EngagementBadgesView />
    </>
  );
}
