import { PageMeta } from 'src/perf';

import { ForgotPasswordView } from 'src/sections/auth';

export default function Page() {
  return (
    <>
      <PageMeta title="Forgot Password" description="Reset your BattleAsia account password." path="/auth/forgot-password" noIndex />
      <ForgotPasswordView />
    </>
  );
}
