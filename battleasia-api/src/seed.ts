import bcrypt from 'bcryptjs';
import { connectDb } from './db/connect.js';
import { User } from './models/User.js';
import { Role } from './models/Role.js';
import { AppSettings } from './models/AppSettings.js';
import { PaymentChannel } from './models/PaymentChannel.js';
import { BusinessWallet } from './models/BusinessWallet.js';
import { CoinRate } from './models/CoinRate.js';
import { ShopItem } from './models/ShopItem.js';
import { DepositHistory } from './models/DepositHistory.js';
import { WithdrawalHistory } from './models/WithdrawalHistory.js';
import { FeedCategory } from './models/FeedCategory.js';
import { Feed } from './models/Feed.js';
import { Notification } from './models/Notification.js';
import { SupportConversation } from './models/SupportConversation.js';
import { SupportMessage } from './models/SupportMessage.js';
import { env } from './config/env.js';
import { ALL_PERMISSIONS } from './constants/permissions.js';
import { seedDashboardData } from './seed-dashboard-data.js';
import { seedDemoUser } from './seed-demo-user.js';
import { seedFeedPosts } from './seed-feed-posts.js';
import { seedSocialContent } from './seed-social-content.js';
import { ensurePlatformGames } from './utils/ensure-games.js';

async function seed() {
  await connectDb();

  const allPermissionKeys = ALL_PERMISSIONS.map((p) => p.key);

  let adminRole = await Role.findOne({ type: 'admin' });
  if (!adminRole) {
    adminRole = await Role.create({
      name: 'Admin',
      description: 'Full system administrator',
      type: 'admin',
      permissions: allPermissionKeys,
      level: 0,
    });
    console.log('Created Admin role');
  }

  let playerRole = await Role.findOne({ type: 'player', name: 'Player' });
  if (!playerRole) {
    playerRole = await Role.create({
      name: 'Player',
      description: 'Default player role',
      type: 'player',
      permissions: [],
      level: 1,
      parent: adminRole._id,
    });
    console.log('Created Player role');
  }

  let agentRole = await Role.findOne({ type: 'agent' });
  if (!agentRole) {
    agentRole = await Role.create({
      name: 'Agent',
      description: 'Support agent role',
      type: 'agent',
      permissions: ['users.view', 'matches.view', 'customer-support.view', 'customer-support.reply'],
      level: 1,
      parent: adminRole._id,
    });
    console.log('Created Agent role');
  }

  const existingAdmin = await User.findOne({ email: env.adminEmail.toLowerCase() });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(env.adminPassword, 10);
    await User.create({
      email: env.adminEmail.toLowerCase(),
      username: env.adminUsername,
      password: passwordHash,
      status: true,
      emailVerified: true,
      balance: 0,
      roleRef: adminRole._id,
      role: {
        type: 'admin',
        name: 'Admin',
        permissions: allPermissionKeys,
      },
    });
    console.log('Admin user created:');
    console.log(`  Email:    ${env.adminEmail}`);
    console.log(`  Password: ${env.adminPassword}`);
  } else {
    existingAdmin.password = await bcrypt.hash(env.adminPassword, 10);
    existingAdmin.status = true;
    existingAdmin.emailVerified = true;
    existingAdmin.role = {
      type: 'admin',
      name: 'Admin',
      permissions: allPermissionKeys,
    };
    existingAdmin.roleRef = adminRole._id;
    await existingAdmin.save();
    console.log(`Admin password synced from .env: ${env.adminEmail}`);
  }

  console.log('Ensuring platform games (PUBG, Free Fire, COD, Valorant, ML)...');
  await ensurePlatformGames();

  const existingPlayer = await User.findOne({ email: 'player@battleasia.local' });
  if (!existingPlayer) {
    const passwordHash = await bcrypt.hash('Player@123456', 10);
    await User.create({
      email: 'player@battleasia.local',
      username: 'testplayer',
      password: passwordHash,
      status: true,
      emailVerified: true,
      balance: 500,
      referralCode: 'TEST01',
      pubgId: '1234567890',
      gameServer: 'asia',
      roleRef: playerRole._id,
      role: {
        type: 'player',
        name: 'Player',
        permissions: [],
      },
    });
    console.log('Sample player created: player@battleasia.local / Player@123456');
  }

  const settings = await AppSettings.findOne({ key: 'global' });
  if (!settings) {
    await AppSettings.create({ key: 'global' });
    console.log('Default app settings created');
  }

  const player = await User.findOne({ email: 'player@battleasia.local' });

  let bkashChannel = await PaymentChannel.findOne({ channel_name: 'bKash' });
  if (!bkashChannel) {
    bkashChannel = await PaymentChannel.create({
      channel_name: 'bKash',
      description: 'Mobile financial service',
      icon: '/assets/images/bkash.png',
      enabled: true,
    });
    console.log('Payment channel created: bKash');
  } else if (!bkashChannel.icon) {
    bkashChannel.icon = '/assets/images/bkash.png';
    await bkashChannel.save();
  }

  let nagadChannel = await PaymentChannel.findOne({ channel_name: 'Nagad' });
  if (!nagadChannel) {
    nagadChannel = await PaymentChannel.create({
      channel_name: 'Nagad',
      description: 'Digital financial service',
      icon: '/assets/images/nagad.png',
      enabled: true,
    });
    console.log('Payment channel created: Nagad');
  } else if (!nagadChannel.icon) {
    nagadChannel.icon = '/assets/images/nagad.png';
    await nagadChannel.save();
  }

  const existingWallet = await BusinessWallet.findOne({ wallet_address: '01700000000' });
  if (!existingWallet && bkashChannel) {
    await BusinessWallet.create({
      channel_id: bkashChannel._id,
      wallet_address: '01700000000',
      currency_type: 'BDT',
      enabled: true,
    });
    console.log('Business wallet created for bKash');
  }

  const globalRate = await CoinRate.findOne({ region: 'global', currency: 'USD' });
  if (!globalRate) {
    await CoinRate.create({ region: 'global', currency: 'USD', rate: 0.01, isActive: true });
    console.log('Coin rate created: global/USD');
  }

  const bdRate = await CoinRate.findOne({ region: 'bangladesh', currency: 'BDT' });
  if (!bdRate) {
    await CoinRate.create({ region: 'bangladesh', currency: 'BDT', rate: 1.2, isActive: true });
    console.log('Coin rate created: bangladesh/BDT');
  }

  const existingShopItem = await ShopItem.findOne({ amount: 100 });
  if (!existingShopItem) {
    await ShopItem.create({
      amount: 100,
      badge: 'Popular',
      price: 1,
      originalPrice: 1,
      discountPercent: 0,
      symbol: 'BAC',
      paymentOptions: ['bkash', 'nagad'],
      image: '/assets/images/currency.webp',
      isActive: true,
      status: 'available',
    });
    console.log('Shop item created: 100 BAC pack');
  } else if (existingShopItem.image !== '/assets/images/currency.webp') {
    existingShopItem.image = '/assets/images/currency.webp';
    await existingShopItem.save();
  }

  await ShopItem.updateMany(
    { image: { $regex: /bac-coin/i } },
    { $set: { image: '/assets/images/currency.webp' } }
  );

  if (player && bkashChannel) {
    const existingDeposit = await DepositHistory.findOne({ transaction_id: 'TXN-SEED-001' });
    if (!existingDeposit) {
      await DepositHistory.create({
        userId: player._id,
        user_email: player.email,
        username: player.username,
        transaction_id: 'TXN-SEED-001',
        coin_amount: 50,
        payment_currency: 'BDT',
        payment_amount: 60,
        from_address: '01711111111',
        payment_channel: bkashChannel._id,
        to_wallet_address: '01700000000',
        status: 'pending',
      });
      console.log('Sample pending deposit created');
    }

    const existingWithdrawal = await WithdrawalHistory.findOne({ wallet_address: '0xSEED123456' });
    if (!existingWithdrawal) {
      await WithdrawalHistory.create({
        userId: player._id,
        user_email: player.email,
        username: player.username,
        coin_amount: 25,
        wallet_type: 'crypto',
        wallet_address: '0xSEED123456',
        currency_type: 'USDT',
        currency_amount: 25,
        description: 'Seed withdrawal request',
        status: 'pending',
      });
      console.log('Sample pending withdrawal created');
    }
  }

  const admin = await User.findOne({ email: env.adminEmail.toLowerCase() });

  let newsCategory = await FeedCategory.findOne({ slug: 'news' });
  if (!newsCategory) {
    newsCategory = await FeedCategory.create({ name: 'News', slug: 'news' });
    console.log('Feed category created: News');
  }

  const existingFeed = await Feed.findOne({ title: 'Welcome to BattleAsia' });
  if (!existingFeed && newsCategory && admin) {
    await Feed.create({
      categoryId: newsCategory._id,
      title: 'Welcome to BattleAsia',
      description: '<p>Your local BattleAsia platform is ready. Start creating matches and managing players!</p>',
      coverUrl: '',
      status: 'published',
      premiumOnly: false,
      authorId: admin._id,
      authorName: admin.username,
      authorAvatar: admin.avatar || '',
      totalViews: 12,
    });
    console.log('Sample feed post created');
  }

  const existingNotification = await Notification.findOne({ title: 'Welcome Notification' });
  if (!existingNotification) {
    await Notification.create({
      title: 'Welcome Notification',
      subject: 'Welcome Notification',
      message: 'Welcome to the BattleAsia admin panel!',
      category: 'General',
      type: 'general',
      target: 'all',
      recipients: [],
      createdBy: admin?._id,
    });
    console.log('Sample notification created');
  }

  if (player) {
    let conversation = await SupportConversation.findOne({ userId: player._id });
    if (!conversation) {
      conversation = await SupportConversation.create({
        userId: player._id,
        status: 'open',
        lastMessageAt: new Date(),
      });

      await SupportMessage.create({
        conversationId: conversation._id,
        body: 'Hello, I need help with my deposit.',
        senderId: player._id,
        senderName: player.username,
        senderAvatar: player.avatar || '',
        isAdmin: false,
      });

      if (admin) {
        await SupportMessage.create({
          conversationId: conversation._id,
          body: 'Hi! We are here to help. Please share your transaction ID.',
          senderId: admin._id,
          senderName: admin.username,
          senderAvatar: admin.avatar || '',
          isAdmin: true,
        });
      }

      console.log('Sample support conversation created');
    }
  }

  await seedDashboardData();
  await seedDemoUser();
  await seedFeedPosts();
  await seedSocialContent();

  process.exit(0);
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
