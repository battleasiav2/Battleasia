import { Role } from './models/Role.js';
import { User } from './models/User.js';
import { FeedCategory } from './models/FeedCategory.js';
import { Feed } from './models/Feed.js';
import { Reel } from './models/Reel.js';
import { Story } from './models/Story.js';
import { Follow } from './models/Follow.js';
import { FeedLike } from './models/FeedLike.js';
import { ensureFakePlayers } from './seed-dashboard-data.js';

// ----------------------------------------------------------------------

const DEMO_MARKER = 'SOCIAL-DEMO';

const POST_IMAGES = [
  '/assets/images/shop/1.webp',
  '/assets/images/shop/2.webp',
  '/assets/images/shop/3.webp',
  '/assets/images/shop/4.webp',
  '/assets/images/shop/5.webp',
  '/assets/images/shop/6.webp',
  '/assets/images/shop/7.webp',
  '/assets/images/shop/8.webp',
  '/assets/images/shop/9.webp',
  '/assets/images/games/art/pubg-mobile.png',
  '/assets/images/games/art/free-fire.png',
  '/assets/images/games/art/mobile-legends.png',
  '/assets/images/games/art/valorant.png',
  '/assets/images/hero-banner-pubg.png',
  '/assets/images/home/modes/mode-solo.png',
  '/assets/images/home/modes/mode-squad.png',
  '/assets/images/home/modes/mode-duo.png',
  '/assets/images/home/modes/mode-tdm.png',
];

const DEMO_REEL_VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
];

type BotPostSeed = {
  marker: string;
  playerIndex: number;
  description: string;
  hashtags: string[];
  postType: 'text' | 'image' | 'gallery';
  coverUrl?: string;
  mediaUrls?: string[];
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  daysAgo: number;
};

const BOT_POSTS: BotPostSeed[] = [
  {
    marker: 'POST-001',
    playerIndex: 0,
    description: '16-kill chicken dinner on Erangel! Final circle clutch was insane.',
    hashtags: ['pubgmobile', 'chickendinner', 'battleasia'],
    postType: 'image',
    coverUrl: POST_IMAGES[0],
    mediaUrls: [POST_IMAGES[0]],
    totalViews: 1840,
    totalLikes: 96,
    totalComments: 14,
    daysAgo: 0,
  },
  {
    marker: 'POST-002',
    playerIndex: 1,
    description: 'Squad wipe in Sanhok — one mag, four knocks. Who wants the next room?',
    hashtags: ['squad', 'sanhok', 'gaming'],
    postType: 'image',
    coverUrl: POST_IMAGES[9],
    mediaUrls: [POST_IMAGES[9]],
    totalViews: 920,
    totalLikes: 58,
    totalComments: 9,
    daysAgo: 1,
  },
  {
    marker: 'POST-003',
    playerIndex: 2,
    description: 'Just hit Diamond tier. Grind never stops on BattleAsia.',
    hashtags: ['ranked', 'pubgmobile', 'grind'],
    postType: 'gallery',
    coverUrl: POST_IMAGES[1],
    mediaUrls: [POST_IMAGES[1], POST_IMAGES[10], POST_IMAGES[13]],
    totalViews: 1320,
    totalLikes: 112,
    totalComments: 21,
    daysAgo: 1,
  },
  {
    marker: 'POST-004',
    playerIndex: 3,
    description: 'Miramar long-range snipes only. Tag your duo partner below.',
    hashtags: ['miramar', 'sniper', 'duo'],
    postType: 'image',
    coverUrl: POST_IMAGES[14],
    mediaUrls: [POST_IMAGES[14]],
    totalViews: 760,
    totalLikes: 44,
    totalComments: 6,
    daysAgo: 2,
  },
  {
    marker: 'POST-005',
    playerIndex: 4,
    description: 'TDM Warehouse clutch — 1v4 and we still took the win.',
    hashtags: ['tdm', 'clutch', 'battleasia'],
    postType: 'image',
    coverUrl: POST_IMAGES[17],
    mediaUrls: [POST_IMAGES[17]],
    totalViews: 540,
    totalLikes: 37,
    totalComments: 5,
    daysAgo: 2,
  },
  {
    marker: 'POST-006',
    playerIndex: 5,
    description: 'Free Fire squad scrim highlights from last night.',
    hashtags: ['freefire', 'squad', 'esports'],
    postType: 'image',
    coverUrl: POST_IMAGES[10],
    mediaUrls: [POST_IMAGES[10]],
    totalViews: 680,
    totalLikes: 49,
    totalComments: 8,
    daysAgo: 3,
  },
  {
    marker: 'POST-007',
    playerIndex: 6,
    description: 'New loadout drop. SMG rush meta is back.',
    hashtags: ['loadout', 'meta', 'pubgmobile'],
    postType: 'gallery',
    coverUrl: POST_IMAGES[2],
    mediaUrls: [POST_IMAGES[2], POST_IMAGES[3]],
    totalViews: 410,
    totalLikes: 28,
    totalComments: 4,
    daysAgo: 3,
  },
  {
    marker: 'POST-008',
    playerIndex: 7,
    description: 'Bangladesh server ping finally stable — time to push leaderboard.',
    hashtags: ['bangladesh', 'leaderboard', 'battleasia'],
    postType: 'text',
    coverUrl: POST_IMAGES[13],
    mediaUrls: [],
    totalViews: 890,
    totalLikes: 71,
    totalComments: 11,
    daysAgo: 4,
  },
  {
    marker: 'POST-009',
    playerIndex: 8,
    description: 'Valorant warm-up before PUBG rooms. Aim feeling sharp today.',
    hashtags: ['valorant', 'aim', 'gaming'],
    postType: 'image',
    coverUrl: POST_IMAGES[12],
    mediaUrls: [POST_IMAGES[12]],
    totalViews: 620,
    totalLikes: 41,
    totalComments: 7,
    daysAgo: 4,
  },
  {
    marker: 'POST-010',
    playerIndex: 9,
    description: 'Mobile Legends mythic rank push — support diff.',
    hashtags: ['mobilelegends', 'mythic', 'support'],
    postType: 'image',
    coverUrl: POST_IMAGES[11],
    mediaUrls: [POST_IMAGES[11]],
    totalViews: 510,
    totalLikes: 33,
    totalComments: 5,
    daysAgo: 5,
  },
  {
    marker: 'POST-011',
    playerIndex: 10,
    description: 'Weekend tournament prep with the squad. Room ID drops soon.',
    hashtags: ['tournament', 'weekend', 'battleasia'],
    postType: 'gallery',
    coverUrl: POST_IMAGES[15],
    mediaUrls: [POST_IMAGES[15], POST_IMAGES[16], POST_IMAGES[4]],
    totalViews: 1150,
    totalLikes: 88,
    totalComments: 16,
    daysAgo: 5,
  },
  {
    marker: 'POST-012',
    playerIndex: 11,
    description: 'First BAC coin win of the month. Who is joining the next paid match?',
    hashtags: ['baccoins', 'win', 'battleasia'],
    postType: 'image',
    coverUrl: POST_IMAGES[5],
    mediaUrls: [POST_IMAGES[5]],
    totalViews: 970,
    totalLikes: 64,
    totalComments: 10,
    daysAgo: 6,
  },
];

type BotStorySeed = {
  marker: string;
  playerIndex: number;
  caption: string;
  imageIndex: number;
  hoursAgo: number;
};

const BOT_STORIES: BotStorySeed[] = [
  { marker: 'STORY-001', playerIndex: 0, caption: 'Warm-up lobby — see you in Erangel', imageIndex: 0, hoursAgo: 2 },
  { marker: 'STORY-002', playerIndex: 1, caption: 'Squad locked in for tonight', imageIndex: 9, hoursAgo: 3 },
  { marker: 'STORY-003', playerIndex: 2, caption: 'Rank push starts now', imageIndex: 1, hoursAgo: 4 },
  { marker: 'STORY-004', playerIndex: 3, caption: 'Miramar drops only', imageIndex: 14, hoursAgo: 5 },
  { marker: 'STORY-005', playerIndex: 4, caption: 'TDM warehouse grind', imageIndex: 17, hoursAgo: 6 },
  { marker: 'STORY-006', playerIndex: 5, caption: 'Scrim night with the boys', imageIndex: 10, hoursAgo: 7 },
  { marker: 'STORY-007', playerIndex: 6, caption: 'New loadout who dis?', imageIndex: 2, hoursAgo: 8 },
  { marker: 'STORY-008', playerIndex: 7, caption: 'Climbing leaderboard tonight', imageIndex: 13, hoursAgo: 9 },
  { marker: 'STORY-009', playerIndex: 8, caption: 'Aim training before rooms', imageIndex: 12, hoursAgo: 10 },
  { marker: 'STORY-010', playerIndex: 9, caption: 'MLBB mythic queue', imageIndex: 11, hoursAgo: 11 },
  { marker: 'STORY-011', playerIndex: 10, caption: 'Tournament day energy', imageIndex: 15, hoursAgo: 12 },
  { marker: 'STORY-012', playerIndex: 11, caption: 'BAC coin win streak', imageIndex: 5, hoursAgo: 13 },
  { marker: 'STORY-013', playerIndex: 12, caption: 'Late night custom rooms', imageIndex: 6, hoursAgo: 14 },
  { marker: 'STORY-014', playerIndex: 13, caption: 'Duo queue only tonight', imageIndex: 16, hoursAgo: 15 },
  { marker: 'STORY-015', playerIndex: 14, caption: 'Final circle clutch incoming', imageIndex: 8, hoursAgo: 16 },
];

type BotReelSeed = {
  marker: string;
  playerIndex: number;
  caption: string;
  musicTitle: string;
  videoIndex: number;
  totalViews: number;
  totalLikes: number;
  daysAgo: number;
};

const BOT_REELS: BotReelSeed[] = [
  {
    marker: 'REEL-001',
    playerIndex: 0,
    caption: 'Ace clip from yesterday\'s room #pubgmobile',
    musicTitle: 'Battle Beat — ShadowHunter',
    videoIndex: 0,
    totalViews: 2400,
    totalLikes: 186,
    daysAgo: 0,
  },
  {
    marker: 'REEL-002',
    playerIndex: 1,
    caption: 'Squad wipe montage #squad #battleasia',
    musicTitle: 'Dragon Fire',
    videoIndex: 1,
    totalViews: 1820,
    totalLikes: 142,
    daysAgo: 1,
  },
  {
    marker: 'REEL-003',
    playerIndex: 2,
    caption: 'Rank push highlights — Diamond soon',
    musicTitle: 'PUBG King Anthem',
    videoIndex: 2,
    totalViews: 1560,
    totalLikes: 119,
    daysAgo: 1,
  },
  {
    marker: 'REEL-004',
    playerIndex: 3,
    caption: 'Ninja movement only',
    musicTitle: 'Stealth Run',
    videoIndex: 3,
    totalViews: 980,
    totalLikes: 77,
    daysAgo: 2,
  },
  {
    marker: 'REEL-005',
    playerIndex: 4,
    caption: 'Long-range one taps compilation',
    musicTitle: 'Scope Down',
    videoIndex: 4,
    totalViews: 870,
    totalLikes: 68,
    daysAgo: 2,
  },
  {
    marker: 'REEL-006',
    playerIndex: 5,
    caption: 'Bangla squad comms gone wrong',
    musicTitle: 'Desi Drop',
    videoIndex: 5,
    totalViews: 1340,
    totalLikes: 101,
    daysAgo: 3,
  },
  {
    marker: 'REEL-007',
    playerIndex: 6,
    caption: 'Loadout tour 2026',
    musicTitle: 'Meta Shift',
    videoIndex: 6,
    totalViews: 720,
    totalLikes: 54,
    daysAgo: 3,
  },
  {
    marker: 'REEL-008',
    playerIndex: 7,
    caption: 'Asia server domination',
    musicTitle: 'Champion Loop',
    videoIndex: 7,
    totalViews: 1090,
    totalLikes: 92,
    daysAgo: 4,
  },
];

async function ensureCommunityCategory() {
  let category = await FeedCategory.findOne({ slug: 'community' });
  if (!category) {
    category = await FeedCategory.create({ name: 'Community', slug: 'community' });
    console.log('  Created feed category: Community');
  }
  return category;
}

async function seedBotPosts(players: InstanceType<typeof User>[], categoryId: InstanceType<typeof FeedCategory>['_id']) {
  let created = 0;

  for (const post of BOT_POSTS) {
    const markerTitle = `${DEMO_MARKER}-${post.marker}`;
    const displayTitle = post.description.length > 90 ? `${post.description.slice(0, 87)}...` : post.description;

    const legacy = await Feed.findOne({ title: markerTitle });
    if (legacy) {
      legacy.title = displayTitle;
      await legacy.save();
      continue;
    }

    const player = players[post.playerIndex % players.length];
    if (!player) continue;

    const exists = await Feed.findOne({
      authorId: player._id,
      description: `<p>${post.description}</p>`,
    });
    if (exists) continue;

    const createdAt = new Date(Date.now() - post.daysAgo * 86_400_000);

    await Feed.create({
      categoryId,
      title: displayTitle,
      description: `<p>${post.description}</p>`,
      coverUrl: post.coverUrl || post.mediaUrls?.[0] || '',
      postType: post.postType,
      mediaUrls: post.mediaUrls || [],
      hashtags: post.hashtags,
      visibility: 'public',
      status: 'published',
      premiumOnly: false,
      authorId: player._id,
      authorName: player.username,
      authorAvatar: player.avatar || '',
      totalViews: post.totalViews,
      totalComments: post.totalComments,
      totalLikes: post.totalLikes,
      totalShares: Math.floor(post.totalLikes / 8),
      createdAt,
      updatedAt: createdAt,
    });

    created += 1;
  }

  return created;
}

async function seedBotStories(players: InstanceType<typeof User>[]) {
  let created = 0;

  for (const story of BOT_STORIES) {
    const player = players[story.playerIndex % players.length];
    if (!player) continue;

    const mediaUrl = POST_IMAGES[story.imageIndex % POST_IMAGES.length];
    const markerCaption = `${DEMO_MARKER}-${story.marker}`;
    const legacy = await Story.findOne({ caption: markerCaption });
    if (legacy) {
      legacy.caption = story.caption;
      await legacy.save();
      continue;
    }

    const exists = await Story.findOne({ userId: player._id, mediaUrl, caption: story.caption });
    if (exists) continue;

    const createdAt = new Date(Date.now() - story.hoursAgo * 3_600_000);
    const expiresAt = new Date(Date.now() + 7 * 86_400_000);

    await Story.create({
      userId: player._id,
      username: player.username,
      avatar: player.avatar || '',
      mediaType: 'image',
      mediaUrl,
      caption: story.caption,
      expiresAt,
      totalViews: 20 + story.playerIndex * 7,
      createdAt,
    });

    created += 1;
  }

  return created;
}

async function seedBotReels(players: InstanceType<typeof User>[]) {
  let created = 0;

  for (const reel of BOT_REELS) {
    const player = players[reel.playerIndex % players.length];
    if (!player) continue;

    const videoUrl = DEMO_REEL_VIDEOS[reel.videoIndex % DEMO_REEL_VIDEOS.length];
    const markerCaption = `${DEMO_MARKER}-${reel.marker}`;
    const legacy = await Reel.findOne({ caption: markerCaption });
    if (legacy) {
      legacy.caption = reel.caption;
      await legacy.save();
      continue;
    }

    const exists = await Reel.findOne({ userId: player._id, videoUrl, caption: reel.caption });
    if (exists) continue;

    const createdAt = new Date(Date.now() - reel.daysAgo * 86_400_000);

    await Reel.create({
      userId: player._id,
      username: player.username,
      avatar: player.avatar || '',
      videoUrl,
      caption: reel.caption,
      musicTitle: reel.musicTitle,
      status: 'published',
      totalViews: reel.totalViews,
      totalLikes: reel.totalLikes,
      totalComments: Math.floor(reel.totalLikes / 12),
      createdAt,
      updatedAt: createdAt,
    });

    created += 1;
  }

  return created;
}

async function seedBotFollows(players: InstanceType<typeof User>[]) {
  let created = 0;

  const demoUsers = await User.find({
    email: { $in: ['nixhyip@gmail.com', 'player@battleasia.local'] },
  });

  for (let i = 0; i < players.length; i += 1) {
    const follower = players[i];
    const following = players[(i + 3) % players.length];
    if (follower._id.equals(following._id)) continue;

    const exists = await Follow.findOne({ followerId: follower._id, followingId: following._id });
    if (!exists) {
      await Follow.create({ followerId: follower._id, followingId: following._id });
      created += 1;
    }
  }

  for (const demoUser of demoUsers) {
    for (let i = 0; i < Math.min(6, players.length); i += 1) {
      const target = players[i];
      const exists = await Follow.findOne({ followerId: demoUser._id, followingId: target._id });
      if (!exists) {
        await Follow.create({ followerId: demoUser._id, followingId: target._id });
        created += 1;
      }
    }
  }

  return created;
}

async function seedBotLikes(players: InstanceType<typeof User>[]) {
  const demoPosts = await Feed.find({ title: new RegExp(`^${DEMO_MARKER}-POST-`) }).select('_id');
  if (demoPosts.length === 0) return 0;

  let created = 0;

  for (const post of demoPosts) {
    const likers = players.slice(0, 4 + (created % 5));
    for (const liker of likers) {
      const exists = await FeedLike.findOne({ userId: liker._id, feedId: post._id });
      if (exists) continue;
      await FeedLike.create({ userId: liker._id, feedId: post._id });
      created += 1;
    }
  }

  return created;
}

async function logDemoFeedUrl() {
  let samplePost = await Feed.findOne({ title: new RegExp(`^${DEMO_MARKER}-POST-`) })
    .sort({ createdAt: -1 })
    .select('_id title')
    .lean();

  if (!samplePost) {
    const firstPost = BOT_POSTS[0];
    samplePost = await Feed.findOne({
      description: `<p>${firstPost.description}</p>`,
    })
      .select('_id title')
      .lean();
  }

  if (samplePost?._id) {
    console.log(`  Demo feed detail: http://localhost:8081/user/feed/${samplePost._id} (${samplePost.title})`);
  }
}

export async function seedSocialContent() {
  const playerRole = await Role.findOne({ type: 'player', name: 'Player' });
  if (!playerRole) {
    console.log('Player role missing — run main seed first');
    return;
  }

  const players = await ensureFakePlayers(playerRole);
  if (players.length === 0) {
    console.log('No bot players found — run dashboard seed first');
    return;
  }

  console.log('Seeding bot social content (posts, stories, reels)...');

  const category = await ensureCommunityCategory();
  const postsCreated = await seedBotPosts(players, category._id);
  const [storiesCreated, reelsCreated, followsCreated] = await Promise.all([
    seedBotStories(players),
    seedBotReels(players),
    seedBotFollows(players),
  ]);
  const likesCreated = await seedBotLikes(players);

  if (postsCreated + storiesCreated + reelsCreated + followsCreated + likesCreated === 0) {
    console.log('  Bot social demo content already exists, skipping');
    await logDemoFeedUrl();
    return;
  }

  console.log(`  Created ${postsCreated} bot posts`);
  console.log(`  Created ${storiesCreated} bot stories`);
  console.log(`  Created ${reelsCreated} bot reels`);
  console.log(`  Created ${followsCreated} follow links`);
  console.log(`  Created ${likesCreated} feed likes`);
  await logDemoFeedUrl();
}
