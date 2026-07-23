import { Helmet } from 'react-helmet-async';
import { BalanceHistoryView } from 'src/sections/payments/balance-history';

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Balance History</title>
      </Helmet>

      <BalanceHistoryView />
    </>
  );
}


