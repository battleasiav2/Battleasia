import { CoinRateView } from 'src/sections/shop/coinrate';

import { Helmet } from 'react-helmet-async';

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Coin Rates</title>
      </Helmet>

      <CoinRateView />

    </>
  );
}

