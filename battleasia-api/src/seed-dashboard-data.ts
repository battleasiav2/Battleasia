import bcrypt from 'bcryptjs';
import { User } from './models/User.js';
import { Role } from './models/Role.js';
import { Game } from './models/Game.js';
import { Match } from './models/Match.js';
import { MatchParticipant } from './models/MatchParticipant.js';

const TARGET_TOTAL_WINNINGS = 5_314_735.6;
const PROCESSED_MATCH_COUNT = 125;

export const FAKE_PLAYERS = [
  { email: 'shadow@battleasia.local', username: 'ShadowHunter', pubgId: '5184729103', balance: 12450 },
  { email: 'dragon@battleasia.local', username: 'DragonSlayer', pubgId: '6283910472', balance: 8920 },
  { email: 'pubgking@battleasia.local', username: 'PUBGKing', pubgId: '7392048156', balance: 22100 },
  { email: 'ninja@battleasia.local', username: 'NinjaWarrior', pubgId: '8401937265', balance: 5670 },
  { email: 'sniper@battleasia.local', username: 'SniperElite', pubgId: '9510283746', balance: 15800 },
  { email: 'bangla@battleasia.local', username: 'BanglaBoss', pubgId: '1628394057', balance: 9340 },
  { email: 'desi@battleasia.local', username: 'DesiGamer', pubgId: '2739405168', balance: 4120 },
  { email: 'asia@battleasia.local', username: 'AsiaChamp', pubgId: '3840516279', balance: 18750 },
  { email: 'victor@battleasia.local', username: 'VictorRoyale', pubgId: '4951627380', balance: 10320 },
  { email: 'killer@battleasia.local', username: 'KillerBee', pubgId: '5062738491', balance: 6780 },
  { email: 'storm@battleasia.local', username: 'StormRider', pubgId: '6173849502', balance: 14560 },
  { email: 'phantom@battleasia.local', username: 'PhantomX', pubgId: '7284950613', balance: 7890 },
  { email: 'royal@battleasia.local', username: 'RoyalFlush', pubgId: '8395061724', balance: 11200 },
  { email: 'cyber@battleasia.local', username: 'CyberWolf', pubgId: '9406172835', balance: 5340 },
  { email: 'tiger@battleasia.local', username: 'TigerClaw', pubgId: '0517283946', balance: 19990 },
];

const MAPS = ['Erangel', 'Miramar', 'Sanhok', 'Vikendi', 'Livik'];

function pickPlayers<T>(pool: T[], count: number): T[] {
  const copy = [...pool];
  const picked: T[] = [];
  while (picked.length < count && copy.length) {
    const idx = Math.floor(Math.random() * copy.length);
    picked.push(copy.splice(idx, 1)[0]);
  }
  return picked;
}

function distributeWinnings(total: number, count: number): number[] {
  if (count === 1) return [total];
  const weights = Array.from({ length: count }, () => Math.random() + 0.2);
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const amounts = weights.map((w) => Math.round((total * (w / weightSum)) * 10) / 10);
  const diff = Math.round((total - amounts.reduce((a, b) => a + b, 0)) * 10) / 10;
  amounts[0] = Math.round((amounts[0] + diff) * 10) / 10;
  return amounts;
}

async function ensureFakePlayers(playerRole: InstanceType<typeof Role>) {
  const passwordHash = await bcrypt.hash('Player@123456', 10);
  const players: InstanceType<typeof User>[] = [];

  for (const profile of FAKE_PLAYERS) {
    let user = await User.findOne({ email: profile.email });
    if (!user) {
      user = await User.create({
        email: profile.email,
        username: profile.username,
        password: passwordHash,
        status: true,
        emailVerified: true,
        balance: profile.balance,
        referralCode: profile.username.slice(0, 6).toUpperCase(),
        pubgId: profile.pubgId,
        gameServer: 'asia',
        roleRef: playerRole._id,
        role: { type: 'player', name: 'Player', permissions: [] },
      });
      console.log(`  Created player: ${profile.username}`);
    }
    players.push(user);
  }

  const testPlayer = await User.findOne({ email: 'player@battleasia.local' });
  if (testPlayer) players.push(testPlayer);

  return players;
}

export { ensureFakePlayers };

export async function seedDashboardData() {
  const existing = await Match.countDocuments({ roomId: /^SEED-/ });
  if (existing >= PROCESSED_MATCH_COUNT + 1) {
    console.log('Dashboard seed data already exists, skipping');
    return;
  }

  const [game, playerRole] = await Promise.all([
    Game.findOne({ packageName: 'com.tencent.ig' }),
    Role.findOne({ type: 'player', name: 'Player' }),
  ]);

  if (!game || !playerRole) {
    console.log('Game or player role missing — run main seed first');
    return;
  }

  console.log('Seeding dashboard stats (fake users + matches)...');
  const players = await ensureFakePlayers(playerRole);

  let runningTotal = 0;
  const basePerMatch = TARGET_TOTAL_WINNINGS / PROCESSED_MATCH_COUNT;

  for (let i = 1; i <= PROCESSED_MATCH_COUNT; i++) {
    const isLast = i === PROCESSED_MATCH_COUNT;
    const matchTotal = isLast
      ? Math.round((TARGET_TOTAL_WINNINGS - runningTotal) * 10) / 10
      : Math.round(basePerMatch * (0.88 + Math.random() * 0.24) * 10) / 10;
    runningTotal += matchTotal;

    const entryFee = 10 + (i % 8) * 5;
    const perKill = 2 + (i % 4);
    const daysAgo = PROCESSED_MATCH_COUNT - i + 1;
    const schedule = new Date(Date.now() - daysAgo * 86_400_000).toISOString();

    const match = await Match.create({
      gameId: game._id,
      roomId: `SEED-${String(i).padStart(4, '0')}`,
      password: 'battle',
      matchName: `PUBG Solo Rush #${i}`,
      matchUrl: '',
      matchSchedule: schedule,
      killRateType: 'automatic',
      entryFee,
      totalPlayer: 100,
      teamType: 'solo',
      perKill,
      matchType: entryFee > 0 ? 'paid' : 'free',
      map: MAPS[i % MAPS.length],
      banner: '',
      prizeDescription: `Winner takes ${Math.round(matchTotal * 0.45)} coins`,
      matchSponsor: 'Battle Asia',
      matchDescription: 'Seeded tournament match for dashboard stats',
      status: 'complete',
      winningsDistributed: true,
      results: [],
    });

    const matchPlayers = pickPlayers(players, 6);
    const prizeShares = distributeWinnings(matchTotal, matchPlayers.length);
    const results = [];

    for (let p = 0; p < matchPlayers.length; p++) {
      const user = matchPlayers[p];
      const kills = Math.max(0, Math.floor(Math.random() * 8) + (p === 0 ? 4 : 0));
      const isWinner = p === 0;
      const winPrize = isWinner ? Math.round(prizeShares[p] * 0.65 * 10) / 10 : 0;
      const bonus = isWinner
        ? Math.round(prizeShares[p] * 0.35 * 10) / 10
        : Math.round(prizeShares[p] * 10) / 10;

      const participant = await MatchParticipant.create({
        matchId: match._id,
        userId: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar || '',
        pubgId: user.pubgId || '',
        entryFee,
        kills,
        points: kills * perKill + (isWinner ? 10 : 0),
        placement: p + 1,
        joinedAt: new Date(schedule),
      });

      results.push({
        participantId: participant._id,
        pubgId: user.pubgId || '',
        playerName: user.username,
        avatar: user.avatar || '',
        status: isWinner ? ('winner' as const) : ('lose' as const),
        placement: p + 1,
        kills,
        points: kills * perKill,
        winPrize,
        bonus,
        refund: 0,
      });
    }

    match.results = results;
    match.totalKills = results.reduce((sum, r) => sum + (r.kills || 0), 0);
    await match.save();
  }

  const liveExists = await Match.findOne({ roomId: 'SEED-LIVE' });
  if (!liveExists) {
    const liveMatch = await Match.create({
      gameId: game._id,
      roomId: 'SEED-LIVE',
      password: 'live99',
      matchName: 'PUBG Premium Squad Live',
      matchUrl: '',
      matchSchedule: new Date(Date.now() + 3_600_000).toISOString(),
      killRateType: 'automatic',
      entryFee: 50,
      totalPlayer: 100,
      teamType: 'squad',
      perKill: 5,
      matchType: 'paid',
      map: 'Erangel',
      banner: '',
      prizeDescription: 'Live premium squad — 5000 coin pool',
      matchSponsor: 'Battle Asia 2.0',
      matchDescription: 'Ongoing live match for public dashboard',
      status: 'start',
      results: [],
    });

    const livePlayers = pickPlayers(players, 8);
    for (const user of livePlayers) {
      await MatchParticipant.create({
        matchId: liveMatch._id,
        userId: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar || '',
        pubgId: user.pubgId || '',
        entryFee: liveMatch.entryFee,
        joinedAt: new Date(),
      });
    }
    console.log('  Created 1 ongoing live match');
  }

  console.log(`  Created ${PROCESSED_MATCH_COUNT} processed matches`);
  console.log(`  Target total winnings: ${TARGET_TOTAL_WINNINGS.toLocaleString()}`);
  console.log(`  Fake players available in admin: ${FAKE_PLAYERS.length}`);
}
