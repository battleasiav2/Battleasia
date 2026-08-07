import { PageMeta } from 'src/perf';

import { SignInView } from 'src/sections/auth';

export default function Page() {
  return (
    <>
      <PageMeta
        title="Sign in"
        description="Sign in to BattleAsia to join mobile esports tournaments and manage your account."
        path="/auth/sign-in"
        noIndex
      />
      <SignInView />
    </>
  );
}
