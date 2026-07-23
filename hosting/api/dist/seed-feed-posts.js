import { Feed } from './models/Feed.js';
import { FeedCategory } from './models/FeedCategory.js';
import { User } from './models/User.js';
import { env } from './config/env.js';
const FEED_POSTS = [
    {
        marker: 'FEED-DEMO-001',
        title: 'BattleAsia 2.0 Is Live — Play & Win BAC Coins',
        categorySlug: 'news',
        description: '<p>Welcome to the new <strong>BattleAsia</strong> platform! Join PUBG Mobile tournaments, climb the leaderboard, and earn <strong>BAC coins</strong> from every match.</p><p>Deposit via bKash/Nagad and start competing today.</p>',
        coverUrl: '/assets/images/hero-banner-pubg.png',
        totalViews: 2840,
        totalComments: 18,
        totalLikes: 142,
        daysAgo: 1,
    },
    {
        marker: 'FEED-DEMO-002',
        title: 'Erangel Solo Rush — 5000 BAC Prize Pool This Weekend',
        categorySlug: 'tournaments',
        description: '<p>Our biggest <strong>Erangel Solo</strong> event of the month is here. Entry fee starts at 20 BAC with per-kill rewards and a champion bonus.</p><p>Room opens 30 minutes before match time. Good luck, warriors!</p>',
        coverUrl: '/assets/images/map/Erangel.webp',
        totalViews: 1920,
        totalComments: 24,
        totalLikes: 98,
        daysAgo: 2,
    },
    {
        marker: 'FEED-DEMO-003',
        title: 'Beginner Guide: How to Join Your First Paid Match',
        categorySlug: 'guides',
        description: '<p>New to BattleAsia? Follow these steps:</p><ol><li>Set your <strong>PUBG ID</strong> in profile</li><li>Deposit BAC coins to your wallet</li><li>Go to <strong>Play</strong> and pick an active match</li><li>Tap <strong>Join</strong> and wait for room credentials</li></ol>',
        coverUrl: '/assets/images/game2.webp',
        totalViews: 3560,
        totalComments: 31,
        totalLikes: 210,
        daysAgo: 4,
    },
    {
        marker: 'FEED-DEMO-004',
        title: 'Miramar & Sanhok Added to Weekly Map Rotation',
        categorySlug: 'updates',
        description: '<p>We expanded the map pool! Expect more variety in squad and duo rooms with <strong>Miramar</strong> desert fights and fast-paced <strong>Sanhok</strong> action.</p>',
        coverUrl: '/assets/images/map/Miramar.webp',
        totalViews: 980,
        totalComments: 9,
        totalLikes: 54,
        daysAgo: 6,
    },
    {
        marker: 'FEED-DEMO-005',
        title: 'Pro Tips: Dominate End-Zone Fights in TDM',
        categorySlug: 'guides',
        description: '<p><strong>Premium insight:</strong> Position early, conserve smokes, and coordinate flanks. Top players average 6+ kills in TDM Warehouse clashes.</p><p>Upgrade to premium for exclusive strategy posts every week.</p>',
        coverUrl: '/assets/images/game.webp',
        premiumOnly: true,
        totalViews: 640,
        totalComments: 12,
        totalLikes: 77,
        daysAgo: 3,
    },
];
const CATEGORY_DEFS = [
    { name: 'News', slug: 'news' },
    { name: 'Tournaments', slug: 'tournaments' },
    { name: 'Guides', slug: 'guides' },
    { name: 'Updates', slug: 'updates' },
];
async function ensureCategories() {
    const map = new Map();
    for (const def of CATEGORY_DEFS) {
        let category = await FeedCategory.findOne({ slug: def.slug });
        if (!category) {
            category = await FeedCategory.create({ name: def.name, slug: def.slug });
            console.log(`  Created feed category: ${def.name}`);
        }
        map.set(def.slug, category);
    }
    return map;
}
export async function seedFeedPosts() {
    const admin = await User.findOne({ email: env.adminEmail.toLowerCase() });
    if (!admin) {
        console.log('Admin user missing — run main seed first');
        return;
    }
    const categories = await ensureCategories();
    let created = 0;
    for (const post of FEED_POSTS) {
        const exists = await Feed.findOne({ title: new RegExp(post.marker) });
        if (exists)
            continue;
        const category = categories.get(post.categorySlug);
        if (!category)
            continue;
        const createdAt = new Date(Date.now() - post.daysAgo * 86_400_000);
        const feed = await Feed.create({
            categoryId: category._id,
            title: `${post.marker}: ${post.title}`,
            description: post.description,
            coverUrl: post.coverUrl,
            status: 'published',
            premiumOnly: post.premiumOnly ?? false,
            authorId: admin._id,
            authorName: admin.username,
            authorAvatar: admin.avatar || '',
            totalViews: post.totalViews,
            totalComments: post.totalComments,
            totalLikes: post.totalLikes,
            totalShares: 0,
            createdAt,
            updatedAt: createdAt,
        });
        created += 1;
        console.log(`  Created feed post: ${post.title}`);
    }
    if (created === 0) {
        console.log('  Feed demo posts already exist, skipping');
    }
    else {
        console.log(`  Seeded ${created} feed posts`);
    }
}
