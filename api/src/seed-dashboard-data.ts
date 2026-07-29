import bcrypt from 'bcryptjs';
import { User } from './models/User.js';
import { Role } from './models/Role.js';
import { Game } from './models/Game.js';
import { Match } from './models/Match.js';
import { MatchParticipant } from './models/MatchParticipant.js';

const TARGET_TOTAL_WINNINGS = 5_314_735.6;
const PROCESSED_MATCH_COUNT = 125;

/** FE public paths — unique profile icons for each bot player */
export const FAKE_PLAYERS = [
  { email: 'shadow@battleasia.local', username: 'ShadowHunter', pubgId: '5184729103', balance: 12450, avatar: '/assets/images/mock/avatar/avatar-1.webp' },
  { email: 'dragon@battleasia.local', username: 'DragonSlayer', pubgId: '6283910472', balance: 8920, avatar: '/assets/images/mock/avatar/avatar-2.webp' },
  { email: 'pubgking@battleasia.local', username: 'PUBGKing', pubgId: '7392048156', balance: 22100, avatar: '/assets/images/mock/avatar/avatar-3.webp' },
  { email: 'ninja@battleasia.local', username: 'NinjaWarrior', pubgId: '8401937265', balance: 5670, avatar: '/assets/images/mock/avatar/avatar-4.webp' },
  { email: 'sniper@battleasia.local', username: 'SniperElite', pubgId: '9510283746', balance: 15800, avatar: '/assets/images/mock/avatar/avatar-5.webp' },
  { email: 'bangla@battleasia.local', username: 'BanglaBoss', pubgId: '1628394057', balance: 9340, avatar: '/assets/images/mock/avatar/avatar-6.webp' },
  { email: 'desi@battleasia.local', username: 'DesiGamer', pubgId: '2739405168', balance: 4120, avatar: '/assets/images/mock/avatar/avatar-7.webp' },
  { email: 'asia@battleasia.local', username: 'AsiaChamp', pubgId: '3840516279', balance: 18750, avatar: '/assets/images/mock/avatar/avatar-8.webp' },
  { email: 'victor@battleasia.local', username: 'VictorRoyale', pubgId: '4951627380', balance: 10320, avatar: '/assets/images/mock/avatar/avatar-9.webp' },
  { email: 'killer@battleasia.local', username: 'KillerBee', pubgId: '5062738491', balance: 6780, avatar: '/assets/images/mock/avatar/avatar-10.webp' },
  { email: 'storm@battleasia.local', username: 'StormRider', pubgId: '6173849502', balance: 14560, avatar: '/assets/images/mock/avatar/avatar-11.webp' },
  { email: 'phantom@battleasia.local', username: 'PhantomX', pubgId: '7284950613', balance: 7890, avatar: '/assets/images/mock/avatar/avatar-12.webp' },
  { email: 'royal@battleasia.local', username: 'RoyalFlush', pubgId: '8395061724', balance: 11200, avatar: '/assets/images/mock/avatar/avatar-13.webp' },
  { email: 'cyber@battleasia.local', username: 'CyberWolf', pubgId: '9406172835', balance: 5340, avatar: '/assets/images/mock/avatar/avatar-14.webp' },
  { email: 'tiger@battleasia.local', username: 'TigerClaw', pubgId: '0517283946', balance: 19990, avatar: '/assets/images/mock/avatar/avatar-15.webp' },
];

export const DEMO_PROFILE_AVATARS = {
  nixhyip: '/assets/images/mock/avatar/avatar-16.webp',
  testplayer: '/assets/images/mock/avatar/avatar-17.webp',
  referredDemo: '/assets/images/mock/avatar/avatar-18.webp',
} as const;

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
        avatar: profile.avatar,
      });
      console.log(`  Created player: ${profile.username}`);
    } else if (!user.avatar || user.avatar !== profile.avatar) {
      user.avatar = profile.avatar;
      await user.save();
      console.log(`  Updated avatar: ${profile.username}`);
    }
    players.push(user);
  }

  const testPlayer = await User.findOne({ email: 'player@battleasia.local' });
  if (testPlayer) {
    if (!testPlayer.avatar || testPlayer.avatar !== DEMO_PROFILE_AVATARS.testplayer) {
      testPlayer.avatar = DEMO_PROFILE_AVATARS.testplayer;
      await testPlayer.save();
      console.log('  Updated avatar: testplayer');
    }
    players.push(testPlayer);
  }

  return players;
}

/** Sync bot/demo profile icons onto User + denormalized match snapshots */
export async function ensurePlayerProfileAvatars() {
  const [playerRole] = await Promise.all([Role.findOne({ type: 'player', name: 'Player' })]);
  if (!playerRole) {
    console.log('Player role missing — skip avatar sync');
    return;
  }

  const players = await ensureFakePlayers(playerRole);

  const demoUser = await User.findOne({ email: 'nixhyip@gmail.com' });
  if (demoUser && (!demoUser.avatar || demoUser.avatar !== DEMO_PROFILE_AVATARS.nixhyip)) {
    demoUser.avatar = DEMO_PROFILE_AVATARS.nixhyip;
    await demoUser.save();
    console.log('  Updated avatar: nixhyip');
  }

  const referred = await User.findOne({ email: 'referred.demo@battleasia.local' });
  if (referred && (!referred.avatar || referred.avatar !== DEMO_PROFILE_AVATARS.referredDemo)) {
    referred.avatar = DEMO_PROFILE_AVATARS.referredDemo;
    await referred.save();
    console.log('  Updated avatar: ReferredDemo');
  }

  const avatarByUserId = new Map<string, string>();
  for (const user of players) {
    if (user.avatar) avatarByUserId.set(user._id.toString(), user.avatar);
  }
  if (demoUser?.avatar) avatarByUserId.set(demoUser._id.toString(), demoUser.avatar);
  if (referred?.avatar) avatarByUserId.set(referred._id.toString(), referred.avatar);

  let participantUpdates = 0;
  for (const [userId, avatar] of avatarByUserId) {
    const res = await MatchParticipant.updateMany({ userId }, { $set: { avatar } });
    participantUpdates += res.modifiedCount;
  }

  const seededParticipants = await MatchParticipant.find({
    userId: { $in: [...avatarByUserId.keys()] },
  }).select('_id userId');

  const avatarByParticipantId = new Map<string, string>();
  for (const p of seededParticipants) {
    const avatar = avatarByUserId.get(p.userId.toString());
    if (avatar) avatarByParticipantId.set(p._id.toString(), avatar);
  }

  const matches = await Match.find({ 'results.0': { $exists: true } }).select('_id results');
  let matchUpdates = 0;
  for (const match of matches) {
    let changed = false;
    for (const row of match.results || []) {
      const avatar = avatarByParticipantId.get(row.participantId?.toString?.() || '');
      if (avatar && row.avatar !== avatar) {
        row.avatar = avatar;
        changed = true;
      }
    }
    if (changed) {
      match.markModified('results');
      await match.save();
      matchUpdates += 1;
    }
  }

  console.log(`Avatar sync done — participants: ${participantUpdates}, matches: ${matchUpdates}`);
}

export { ensureFakePlayers };

async function logDemoPlayUrls() {
  const liveMatch = await Match.findOne({ status: 'start' }).select('_id matchName').lean();
  const resultMatch = await Match.findOne({ 'results.0': { $exists: true } }).select('_id matchName').lean();
  const pubgGame = await Game.findOne({ packageName: 'com.tencent.ig' }).select('_id name').lean();

  if (pubgGame?._id) {
    console.log(`  Demo game matches: http://localhost:8081/user/play/${pubgGame._id}`);
  }
  if (liveMatch?._id) {
    console.log(`  Demo match detail: http://localhost:8081/user/play/${liveMatch._id}/detail (${liveMatch.matchName})`);
  }
  if (resultMatch?._id) {
    console.log(`  Demo match result: http://localhost:8081/user/play/${resultMatch._id}/result (${resultMatch.matchName})`);
  }
}

export async function seedDashboardData() {
  const existing = await Match.countDocuments({ roomId: /^SEED-/ });
  if (existing >= PROCESSED_MATCH_COUNT + 1) {
    console.log('Dashboard seed data already exists, skipping');
    await logDemoPlayUrls();
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
  await logDemoPlayUrls();
}
