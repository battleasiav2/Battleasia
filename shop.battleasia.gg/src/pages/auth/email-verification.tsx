import { PageMeta } from 'src/perf';

import { EmailVerificationView } from 'src/sections/auth';

export default function Page() {
  return (
    <>
      <PageMeta title="Email Verification" description="Verify your BattleAsia email address." path="/auth/email-verification" noIndex />
      <EmailVerificationView />
    </>
  );
}
