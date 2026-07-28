import { Helmet } from 'react-helmet-async';
import { SocialReportsView } from 'src/sections/feed/social-reports';

export default function SocialReportsPage() {
  return (
    <>
      <Helmet>
        <title>Social Reports</title>
      </Helmet>
      <SocialReportsView />
    </>
  );
}
