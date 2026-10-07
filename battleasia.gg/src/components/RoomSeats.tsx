import { UserAvatar } from './UserAvatar';

export type SeatPlayer = {
  id: string;
  userId?: string;
  username: string;
  avatar?: string;
};

type Props = {
  total: number;
  players: SeatPlayer[];
  openLabel: string;
  onReport?: (userId: string) => void;
  reportLabel?: string;
  selfId?: string;
};

export function RoomSeats({ total, players, openLabel, onReport, reportLabel, selfId }: Props) {
  const cap = Math.max(total, players.length, 0);
  const seats = Array.from({ length: cap }, (_, index) => players[index] || null);

  if (!seats.length) {
    return null;
  }

  return (
    <div className="ba-seats" role="list">
      {seats.map((player, index) =>
        player ? (
          <div key={player.id || index} className="ba-seat is-filled" role="listitem">
            <UserAvatar src={player.avatar} name={player.username} size={44} />
            <span className="ba-seat-name" title={player.username}>
              {player.username}
            </span>
            {onReport && player.userId && player.userId !== selfId ? (
              <button type="button" className="ba-seat-report" onClick={() => onReport(player.userId as string)}>
                {reportLabel}
              </button>
            ) : null}
          </div>
        ) : (
          <div key={`open-${index}`} className="ba-seat is-open" role="listitem">
            <span className="ba-seat-mark" aria-hidden>
              {index + 1}
            </span>
            <span className="ba-seat-name">{openLabel}</span>
          </div>
        ),
      )}
    </div>
  );
}
