import { Helmet } from 'react-helmet-async';
import DepositView from 'src/sections/payments/deposit/view';

export default function DepositPage() {
  return (
    <>
      <Helmet>
        <title>Deposit | Battle Asia Admin</title>
      </Helmet>

      <DepositView />
    </>
  );
}
