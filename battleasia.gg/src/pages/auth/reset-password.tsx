import { PageMeta } from 'src/perf';

import { ResetPasswordView } from 'src/sections/auth';

export default function Page() {
  return (
    <>
      <PageMeta title="Reset Password" description="Set a new BattleAsia password." path="/auth/reset-password" noIndex />
      <ResetPasswordView />
    </>
  );
}
