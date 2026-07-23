import { ShopView } from 'src/sections/shop/coinlist';
import { Helmet } from 'react-helmet-async';

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Coin List</title>
      </Helmet>
      <ShopView />
    </>
  );
}

