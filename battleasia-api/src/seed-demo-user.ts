import bcrypt from 'bcryptjs';
import { User } from './models/User.js';
import { Role } from './models/Role.js';
import { Game } from './models/Game.js';
import { Match } from './models/Match.js';
import { MatchParticipant } from './models/MatchParticipant.js';
import { BalanceHistory } from './models/BalanceHistory.js';
import { Notification } from './models/Notification.js';
import { ShopItem } from './models/ShopItem.js';
import { ShopOrder } from './models/ShopOrder.js';
import { ReferralHistory } from './models/ReferralHistory.js';
import { SupportConversation } from './models/SupportConversation.js';
import { SupportMessage } from './models/SupportMessage.js';
import { DepositHistory } from './models/DepositHistory.js';
import { WithdrawalHistory } from './models/WithdrawalHistory.js';
import { PaymentChannel } from './models/PaymentChannel.js';
import { getMapBannerPath } from './utils/map-banner.js';
import { ensureFakePlayers, FAKE_PLAYERS } from './seed-dashboard-data.js';

const DEMO_EMAIL = 'nixhyip@gmail.com';
const DEMO_PASSWORD = 'Nix@7777';
const DEMO_BALANCE = 500;

type DemoMatchConfig = {
  roomId: string;
  matchName: string;
  map: string;
  status: 'active' | 'start' | 'complete';
  entryFee: number;
  teamType: string;
  scheduleOffsetHours: number;
  joinDemoUser?: boolean;
  completeWithResults?: boolean;
  premiumOnly?: boolean;
  gameMode?: 'classic' | 'tdm';
};

const DEMO_MATCHES: DemoMatchConfig[] = [
  {
    roomId: 'DEMO-0001',
    matchName: 'Erangel Solo Classic — Join Now',
    map: 'Erangel',
    status: 'active',
    entryFee: 20,
    teamType: 'solo',
    scheduleOffsetHours: 2,
  },
  {
    roomId: 'DEMO-0002',
    matchName: 'Miramar Squad Live Battle',
    map: 'Miramar',
    status: 'start',
    entryFee: 30,
    teamType: 'squad',
    scheduleOffsetHours: -1,
    joinDemoUser: true,
  },
  {
    roomId: 'DEMO-0003',
    matchName: 'Sanhok Duo — Completed Win',
    map: 'Sanhok',
    status: 'complete',
    entryFee: 25,
    teamType: 'duo',
    scheduleOffsetHours: -48,
    joinDemoUser: true,
    completeWithResults: true,
  },
  {
    roomId: 'DEMO-0004',
    matchName: 'Vikendi Solo — Completed',
    map: 'Vikendi',
    status: 'complete',
    entryFee: 15,
    teamType: 'solo',
    scheduleOffsetHours: -72,
    joinDemoUser: true,
    completeWithResults: true,
  },
  {
    roomId: 'DEMO-0005',
    matchName: 'Livik Fast Rush — Upcoming',
    map: 'Livik',
    status: 'active',
    entryFee: 10,
    teamType: 'solo',
    scheduleOffsetHours: 6,
    premiumOnly: false,
  },
  {
    roomId: 'DEMO-0006',
    matchName: 'Erangel TDM Warehouse Clash',
    map: 'Erangel',
    status: 'complete',
    entryFee: 20,
    teamType: 'squad',
    scheduleOffsetHours: -24,
    joinDemoUser: true,
    completeWithResults: true,
    gameMode: 'tdm',
  },
];

/** One joinable demo match per platform game (admin match-create uses same fields as PUBG). */
const PER_GAME_DEMO_MATCHES: Record<string, DemoMatchConfig> = {
  PUBG: {
    roomId: 'DEMO-PUBG-001',
    matchName: 'PUBG Erangel Classic Demo',
    map: 'Erangel',
    status: 'active',
    entryFee: 20,
    teamType: 'solo',
    scheduleOffsetHours: 2,
  },
  FF: {
    roomId: 'DEMO-FF-001',
    matchName: 'Free Fire Clash Squad Demo',
    map: 'Bermuda',
    status: 'active',
    entryFee: 15,
    teamType: 'squad',
    scheduleOffsetHours: 3,
  },
  COD: {
    roomId: 'DEMO-COD-001',
    matchName: 'COD Mobile Domination Demo',
    map: 'Summit',
    status: 'active',
    entryFee: 25,
    teamType: 'squad',
    scheduleOffsetHours: 4,
  },
  VAL: {
    roomId: 'DEMO-VAL-001',
    matchName: 'Valorant Team Deathmatch Demo',
    map: 'Ascent',
    status: 'active',
    entryFee: 20,
    teamType: 'squad',
    scheduleOffsetHours: 5,
  },
  ML: {
    roomId: 'DEMO-ML-001',
    matchName: 'Mobile Legends Ranked Demo',
    map: 'Land of Dawn',
    status: 'active',
    entryFee: 10,
    teamType: 'squad',
    scheduleOffsetHours: 6,
  },
};

const PUBG_MAP_BANNERS = new Set(['Erangel', 'Miramar', 'Sanhok', 'Vikendi', 'Livik']);

function resolveDemoBanner(map: string, fallbackImage?: string) {
  if (PUBG_MAP_BANNERS.has(map)) return getMapBannerPath(map);
  return fallbackImage || '';
}

function hoursFromNow(hours: number) {
  return new Date(Date.now() + hours * 3_600_000).toISOString();
}

async function ensureDemoUser(playerRole: InstanceType<typeof Role>) {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  let user = await User.findOne({ email: DEMO_EMAIL });

  if (!user) {
    user = await User.create({
      email: DEMO_EMAIL,
      username: 'nixhyip',
      password: passwordHash,
      status: true,
      emailVerified: true,
      balance: DEMO_BALANCE,
      referralCode: 'NIXHY1',
      pubgId: '5192837465',
      gameServer: 'asia',
      countryCode: '880',
      mobileNo: '1712345678',
      roleRef: playerRole._id,
      role: { type: 'player', name: 'Player', permissions: [] },
    });
    console.log(`  Created demo user: ${DEMO_EMAIL}`);
  } else {
    user.balance = DEMO_BALANCE;
    user.pubgId = user.pubgId || '5192837465';
    user.status = true;
    user.emailVerified = true;
    user.password = passwordHash;
    await user.save();
    console.log(`  Updated demo user: ${DEMO_EMAIL} (balance: ${DEMO_BALANCE} BAC)`);
  }

  return user;
}

async function createDemoMatchFromConfig(
  game: InstanceType<typeof Game>,
  config: DemoMatchConfig,
  demoUser: InstanceType<typeof User> | null,
  fakePlayers: InstanceType<typeof User>[]
) {
  const exists = await Match.findOne({ roomId: config.roomId });
  if (exists) {
    console.log(`  Match ${config.roomId} already exists, skipping`);
    return;
  }

  const match = await Match.create({
    gameId: game._id,
    gameMode: config.gameMode || 'classic',
    roomId: config.roomId,
    password: 'demo99',
    matchName: config.matchName,
    matchUrl: 'https://battleasia.com',
    matchSchedule: hoursFromNow(config.scheduleOffsetHours),
    killRateType: 'automatic',
    entryFee: config.entryFee,
    totalPlayer: 100,
    teamType: config.teamType,
    perKill: 3,
    matchType: config.entryFee > 0 ? 'paid' : 'free',
    map: config.map,
    totalKills: config.gameMode === 'tdm' ? 40 : undefined,
    banner: resolveDemoBanner(config.map, game.image),
    prizeDescription: `${game.name} — ${config.map} demo match`,
    matchSponsor: 'Battle Asia Demo',
    matchDescription: `Demo match for ${game.name} on ${config.map}.`,
    matchPrivateDescription: 'Room ID and password visible after join.',
    premiumOnly: config.premiumOnly ?? false,
    platformFeePercent: 5,
    status: config.status,
    winningsDistributed: config.completeWithResults ?? false,
    results: [],
  });

  const pool = demoUser ? [demoUser, ...fakePlayers.slice(0, 8)] : fakePlayers.slice(0, 8);
  const participantUsers = pool.slice(0, config.completeWithResults ? 6 : 4);
  const results = [];

  for (let i = 0; i < participantUsers.length; i++) {
    const user = participantUsers[i];
    const shouldJoinDemo = demoUser && user._id.equals(demoUser._id) ? config.joinDemoUser : true;
    if (demoUser && user._id.equals(demoUser._id) && !shouldJoinDemo) continue;

    const isDemoUser = demoUser ? user._id.equals(demoUser._id) : false;
    const isWinner = config.completeWithResults && isDemoUser && config.roomId === 'DEMO-0003';
    const kills = isDemoUser ? 5 : Math.floor(Math.random() * 6) + 1;
    const winPrize = isWinner ? 120 : config.completeWithResults && i === 0 ? 90 : 0;
    const bonus = isWinner ? 30 : config.completeWithResults && i === 0 ? 20 : kills * 3;

    const participant = await MatchParticipant.create({
      matchId: match._id,
      userId: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar || '',
      pubgId: user.pubgId || '',
      entryFee: config.entryFee,
      kills,
      points: kills * 3 + (isWinner ? 10 : 0),
      placement: i + 1,
      joinedAt: new Date(match.matchSchedule),
    });

    if (config.completeWithResults) {
      results.push({
        participantId: participant._id,
        pubgId: user.pubgId || '',
        playerName: user.username,
        avatar: user.avatar || '',
        status: (isWinner || i === 0 ? 'winner' : 'lose') as 'winner' | 'lose',
        placement: i + 1,
        kills,
        points: kills * 3,
        winPrize,
        bonus,
        refund: 0,
      });
    }
  }

  if (config.completeWithResults) {
    match.results = results;
    match.winningsDistributed = true;
    await match.save();
  }

  console.log(`  Created demo match: ${config.roomId} (${game.name}, ${config.status})`);
}

async function seedDemoMatches(
  game: InstanceType<typeof Game>,
  demoUser: InstanceType<typeof User>,
  fakePlayers: InstanceType<typeof User>[]
) {
  for (const config of DEMO_MATCHES) {
    await createDemoMatchFromConfig(game, config, demoUser, fakePlayers);
  }
}

/** Ensures one active demo match per game (PUBG, FF, COD, VAL, ML). */
export async function seedPerGameDemoMatches(games?: InstanceType<typeof Game>[]) {
  const playerRole = await Role.findOne({ type: 'player', name: 'Player' });
  if (!playerRole) {
    console.log('  Player role missing — skip per-game demo matches');
    return;
  }

  const gameList =
    games?.length ?
      games
    : await Game.find({
        idPrefix: { $in: Object.keys(PER_GAME_DEMO_MATCHES) },
        status: true,
      });

  const demoUser = await User.findOne({ email: DEMO_EMAIL });
  const fakePlayers = await ensureFakePlayers(playerRole);

  for (const game of gameList) {
    const config = PER_GAME_DEMO_MATCHES[game.idPrefix];
    if (!config) continue;
    await createDemoMatchFromConfig(game, config, demoUser, fakePlayers);
  }
}

async function seedDemoHistory(demoUser: InstanceType<typeof User>, admin?: InstanceType<typeof User> | null) {
  const existingHistory = await BalanceHistory.countDocuments({ userId: demoUser._id });
  if (existingHistory >= 5) {
    console.log('  Demo balance history already exists, skipping');
    return;
  }

  let balance = 0;
  const records = [
    { amount: 200, type: 'deposit' as const, reason: 'deposit', note: 'bKash deposit' },
    { amount: 30, type: 'withdraw' as const, reason: 'match_entry_fee', note: 'Miramar Squad Live' },
    { amount: 25, type: 'withdraw' as const, reason: 'match_entry_fee', note: 'Sanhok Duo' },
    { amount: 85, type: 'deposit' as const, reason: 'match_winnings', note: 'Sanhok Duo victory' },
    { amount: 15, type: 'withdraw' as const, reason: 'match_entry_fee', note: 'Vikendi Solo' },
    { amount: 50, type: 'withdraw' as const, reason: 'withdraw', note: 'Withdrawal request' },
  ];

  for (const record of records) {
    const balanceBefore = balance;
    balance = record.type === 'deposit' ? balance + record.amount : balance - record.amount;
    await BalanceHistory.create({
      userId: demoUser._id,
      username: demoUser.username,
      email: demoUser.email,
      avatar: demoUser.avatar || '',
      amount: record.amount,
      type: record.type,
      balanceBefore,
      balanceAfter: balance,
      detail: { reason: record.reason, note: record.note },
    });
  }

  demoUser.balance = DEMO_BALANCE;
  await demoUser.save();
  console.log('  Seeded balance history for demo user');
}

async function seedDemoNotifications(demoUser: InstanceType<typeof User>, admin?: InstanceType<typeof User> | null) {
  const marker = 'DEMO-NOTIF';
  const existing = await Notification.countDocuments({ title: new RegExp(marker) });
  if (existing >= 3) return;

  const items = [
    { title: `${marker}: Welcome`, message: 'Welcome to Battle Asia! Your account has 500 BAC coins.', type: 'general', category: 'General' },
    { title: `${marker}: Match Ready`, message: 'Your joined match Miramar Squad Live is now running.', type: 'match', category: 'Match' },
    { title: `${marker}: Winnings`, message: 'You won 85 BAC from Sanhok Duo match!', type: 'reward', category: 'Wallet' },
  ];

  for (const item of items) {
    await Notification.create({
      title: item.title,
      subject: item.title,
      message: item.message,
      category: item.category,
      type: item.type,
      target: 'selected',
      recipients: [demoUser._id],
      createdBy: admin?._id,
    });
  }
  console.log('  Seeded notifications for demo user');
}

async function seedDemoShopOrder(demoUser: InstanceType<typeof User>) {
  const existing = await ShopOrder.findOne({ email: DEMO_EMAIL, status: 'completed' });
  if (existing) return;

  const item = await ShopItem.findOne({ isActive: true });
  if (!item) return;

  await ShopOrder.create({
    userId: demoUser._id,
    username: demoUser.username,
    email: demoUser.email,
    itemId: item._id,
    amount: item.amount,
    price: item.price,
    symbol: item.symbol,
    paymentMethod: 'bkash',
    status: 'completed',
  });

  await ShopOrder.create({
    userId: demoUser._id,
    username: demoUser.username,
    email: demoUser.email,
    itemId: item._id,
    amount: item.amount,
    price: item.price,
    symbol: item.symbol,
    paymentMethod: 'nagad',
    status: 'pending',
  });

  console.log('  Seeded shop orders for demo user');
}

async function seedDemoReferrals(demoUser: InstanceType<typeof User>, playerRole: InstanceType<typeof Role>) {
  const existing = await ReferralHistory.countDocuments({ referrerId: demoUser._id });
  if (existing >= 2) return;

  const passwordHash = await bcrypt.hash('Player@123456', 10);
  const referredProfiles = FAKE_PLAYERS.slice(0, 3);

  for (const profile of referredProfiles) {
    let referred = await User.findOne({ email: profile.email });
    if (!referred) continue;

    const dup = await ReferralHistory.findOne({ referrerId: demoUser._id, referredUserId: referred._id });
    if (dup) continue;

    await ReferralHistory.create({
      referrerId: demoUser._id,
      referredUserId: referred._id,
      depositAmount: 100,
      commissionRate: 10,
      commissionAmount: 10,
      status: 'paid',
    });
  }

  // Ensure one referred user created via demo referral code
  let extraReferred = await User.findOne({ email: 'referred.demo@battleasia.local' });
  if (!extraReferred) {
    extraReferred = await User.create({
      email: 'referred.demo@battleasia.local',
      username: 'ReferredDemo',
      password: passwordHash,
      status: true,
      emailVerified: true,
      balance: 50,
      referralCode: 'REFD01',
      pubgId: '6123456789',
      gameServer: 'asia',
      roleRef: playerRole._id,
      role: { type: 'player', name: 'Player', permissions: [] },
    });
  }

  const extraDup = await ReferralHistory.findOne({ referrerId: demoUser._id, referredUserId: extraReferred._id });
  if (!extraDup) {
    await ReferralHistory.create({
      referrerId: demoUser._id,
      referredUserId: extraReferred._id,
      depositAmount: 200,
      commissionRate: 10,
      commissionAmount: 20,
      status: 'paid',
    });
  }

  console.log('  Seeded referral history for demo user');
}

async function seedDemoSupport(demoUser: InstanceType<typeof User>, admin?: InstanceType<typeof User> | null) {
  let conversation = await SupportConversation.findOne({ userId: demoUser._id });
  if (conversation) return;

  conversation = await SupportConversation.create({
    userId: demoUser._id,
    status: 'open',
    lastMessageAt: new Date(),
  });

  await SupportMessage.create({
    conversationId: conversation._id,
    body: 'আমার 500 BAC ব্যালেন্স দেখাচ্ছে কিন্তু ম্যাচ জয়েন করতে সমস্যা হচ্ছে।',
    senderId: demoUser._id,
    senderName: demoUser.username,
    senderAvatar: demoUser.avatar || '',
    isAdmin: false,
  });

  if (admin) {
    await SupportMessage.create({
      conversationId: conversation._id,
      body: 'আপনার অ্যাকাউন্ট ঠিক আছে। PUBG ID সেট করা আছে কিনা চেক করুন।',
      senderId: admin._id,
      senderName: admin.username,
      senderAvatar: admin.avatar || '',
      isAdmin: true,
    });
  }

  console.log('  Seeded support conversation for demo user');
}

async function seedDemoPayments(demoUser: InstanceType<typeof User>) {
  const bkash = await PaymentChannel.findOne({ channel_name: 'bKash' });
  if (!bkash) return;

  const depositExists = await DepositHistory.findOne({ user_email: DEMO_EMAIL, transaction_id: 'DEMO-DEP-001' });
  if (!depositExists) {
    await DepositHistory.create({
      userId: demoUser._id,
      user_email: demoUser.email,
      username: demoUser.username,
      transaction_id: 'DEMO-DEP-001',
      coin_amount: 200,
      payment_currency: 'BDT',
      payment_amount: 240,
      from_address: '01799887766',
      payment_channel: bkash._id,
      to_wallet_address: '01700000000',
      status: 'completed',
    });
  }

  const withdrawExists = await WithdrawalHistory.findOne({ user_email: DEMO_EMAIL, wallet_address: '01766554433' });
  if (!withdrawExists) {
    await WithdrawalHistory.create({
      userId: demoUser._id,
      user_email: demoUser.email,
      username: demoUser.username,
      coin_amount: 50,
      wallet_type: 'bkash',
      wallet_address: '01766554433',
      currency_type: 'BDT',
      currency_amount: 275,
      description: 'Demo withdrawal',
      status: 'completed',
    });
  }
}

export async function seedDemoUser() {
  const [pubgGame, playerRole, admin] = await Promise.all([
    Game.findOne({ packageName: 'com.tencent.ig' }),
    Role.findOne({ type: 'player', name: 'Player' }),
    User.findOne({ 'role.type': 'admin' }),
  ]);

  if (!pubgGame || !playerRole) {
    console.log('Game or player role missing — run main seed first (npm run seed)');
    return;
  }

  console.log('Seeding demo user & preview data...');

  const fakePlayers = await ensureFakePlayers(playerRole);
  console.log(`  Leaderboard fake players ready: ${fakePlayers.length} (incl. ${FAKE_PLAYERS.length} seeded profiles)`);

  const demoUser = await ensureDemoUser(playerRole);
  await seedDemoMatches(pubgGame, demoUser, fakePlayers);

  const allGames = await Game.find({
    idPrefix: { $in: ['PUBG', 'FF', 'COD', 'VAL', 'ML'] },
    status: true,
  });
  await seedPerGameDemoMatches(allGames);
  await seedDemoHistory(demoUser, admin);
  await seedDemoNotifications(demoUser, admin);
  await seedDemoShopOrder(demoUser);
  await seedDemoReferrals(demoUser, playerRole);
  await seedDemoSupport(demoUser, admin);
  await seedDemoPayments(demoUser);

  console.log('');
  console.log('Demo login credentials:');
  console.log(`  Email:    ${DEMO_EMAIL}`);
  console.log(`  Password: ${DEMO_PASSWORD}`);
  console.log(`  Balance:  ${DEMO_BALANCE} BAC`);
  console.log(`  PUBG preview matches: ${DEMO_MATCHES.length} (DEMO-0001 … DEMO-0006)`);
  console.log(`  Per-game demos: ${Object.keys(PER_GAME_DEMO_MATCHES).join(', ')}`);
}
