import { Helmet } from 'react-helmet-async';
import CustomerSupportListView from 'src/sections/customer-support/list';

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Customer Support</title>
      </Helmet>

      <CustomerSupportListView />
    </>
  );
}

