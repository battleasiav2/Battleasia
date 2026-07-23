import { Helmet } from 'react-helmet-async';
import { GameListView } from 'src/sections/games/list';

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Games</title>
      </Helmet>

      <GameListView />
    </>
  );
}

