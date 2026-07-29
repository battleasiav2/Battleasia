import { ReferralDashboard } from '../referral/referral-dashboard';

export function MyReferralsView() {
  return <ReferralDashboard showInviteSection={false} defaultTab="network" />;
}
