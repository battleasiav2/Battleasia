import { PageMeta } from 'src/perf';

import { SignUpView } from 'src/sections/auth';

export default function Page() {
  return (
    <>
      <PageMeta
        title="Sign up"
        description="Create a BattleAsia account and start playing free mobile tournaments."
        path="/auth/sign-up"
        noIndex
      />
      <SignUpView />
    </>
  );
}
