import { Helmet } from 'react-helmet-async';
import CustomerSupportDetailView from 'src/sections/customer-support/detail';

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Customer Support - Conversation</title>
      </Helmet>

      <CustomerSupportDetailView />
    </>
  );
}

