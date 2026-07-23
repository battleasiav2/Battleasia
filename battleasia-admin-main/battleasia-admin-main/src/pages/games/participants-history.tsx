import { Helmet } from 'react-helmet-async';
import { ParticipantsHistoryView } from 'src/sections/games/participants-history';

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Participants History</title>
      </Helmet>

      <ParticipantsHistoryView />
    </>
  );
}


