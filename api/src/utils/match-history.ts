import { Game } from '../models/Game.js';
import { Match } from '../models/Match.js';
import { MatchParticipant } from '../models/MatchParticipant.js';

async function getGameNameMap(gameIds: string[]) {
  const games = await Game.find({ _id: { $in: gameIds } });
  return new Map(games.map((g) => [g._id.toString(), g.name]));
}

export async function buildMyMatchHistory(userId: string) {
  const participations = await MatchParticipant.find({ userId }).sort({ joinedAt: -1 });
  const matchIds = participations.map((p) => p.matchId);
  const matches = await Match.find({ _id: { $in: matchIds }, status: 'complete' });
  const gameMap = await getGameNameMap(matches.map((m) => m.gameId.toString()));
  const matchMap = new Map(matches.map((m) => [m._id.toString(), m]));

  return participations
    .map((p) => {
      const match = matchMap.get(p.matchId.toString());
      if (!match) return null;

      const resultEntry = (match.results || []).find(
        (r) => r.participantId?.toString() === p._id.toString()
      );
      const winnings =
        (Number(resultEntry?.winPrize) || 0) +
        (Number(resultEntry?.bonus) || 0) +
        (Number(resultEntry?.placePoint) || 0);

      return {
        _id: p._id.toString(),
        id: p._id.toString(),
        matchId: match._id.toString(),
        matchName: match.matchName,
        matchType: match.matchType,
        teamType: match.teamType,
        map: match.map,
        matchSchedule: match.matchSchedule,
        entryFee: p.entryFee,
        banner: match.banner || '',
        gameName: gameMap.get(match.gameId.toString()) || '',
        status: match.status,
        kills: p.kills ?? resultEntry?.kills ?? 0,
        rank: p.placement ?? resultEntry?.placement ?? null,
        amountWon: winnings,
        winnings,
        createdAt: p.joinedAt,
        joinedAt: p.joinedAt,
        match: {
          id: match._id.toString(),
          matchName: match.matchName,
          matchType: match.matchType,
          teamType: match.teamType,
          map: match.map,
          matchSchedule: match.matchSchedule,
          entryFee: match.entryFee,
          banner: match.banner || '',
          gameName: gameMap.get(match.gameId.toString()) || '',
          status: match.status,
        },
      };
    })
    .filter(Boolean);
}

export async function buildUserMatchHistory(userId: string) {
  const participations = await MatchParticipant.find({ userId }).sort({ joinedAt: -1 });
  const matchIds = participations.map((p) => p.matchId);
  const matches = await Match.find({ _id: { $in: matchIds } });
  const matchMap = new Map(matches.map((m) => [m._id.toString(), m]));

  return participations.map((p) => {
    const match = matchMap.get(p.matchId.toString());
    return {
      _id: p._id.toString(),
      id: p._id.toString(),
      matchId: p.matchId.toString(),
      matchName: match?.matchName || '',
      entryFee: p.entryFee,
      kills: p.kills ?? 0,
      placement: p.placement,
      joinedAt: p.joinedAt,
    };
  });
}
