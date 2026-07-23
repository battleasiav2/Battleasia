import { Helmet } from 'react-helmet-async';
import { MatchResultView } from 'src/sections/games/matches';

export default function MatchResultPage() {
  return (
    <>
      <Helmet>
        <title>Update Match Results</title>
      </Helmet>

      <MatchResultView />
    </>
  );
}


