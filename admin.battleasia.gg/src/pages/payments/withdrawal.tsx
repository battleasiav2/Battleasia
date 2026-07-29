import { Helmet } from 'react-helmet-async';
import WithdrawalView from 'src/sections/payments/withdrawal/view';

export default function WithdrawalPage() {
  return (
    <>
      <Helmet>
        <title>Withdrawal | Battle Asia Admin</title>
      </Helmet>

      <WithdrawalView />
    </>
  );
}
