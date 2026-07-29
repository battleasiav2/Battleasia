import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { WithdrawalView } from 'src/sections/user/withdrawal';

// ----------------------------------------------------------------------

export default function WithdrawalPage() {
  return (
    <>
      <Helmet>
        <title> {`Withdrawal - ${CONFIG.appName}`}</title>
      </Helmet>

      <WithdrawalView />
    </>
  );
}
