import { Helmet } from 'react-helmet-async';
import WalletView from 'src/sections/payments/wallet/view';

export default function WalletPage() {
  return (
    <>
      <Helmet>
        <title>Wallet | Battle Asia Admin</title>
      </Helmet>

      <WalletView />
    </>
  );
}
