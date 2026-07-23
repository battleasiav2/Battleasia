import { Helmet } from 'react-helmet-async';
import { MatchView } from 'src/sections/games/matches';

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Matches</title>
      </Helmet>

      <MatchView />
    </>
  );
}

