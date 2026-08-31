import express from 'express';

import cors from 'cors';

import compression from 'compression';

import helmet from 'helmet';

import cookieParser from 'cookie-parser';

import rateLimit from 'express-rate-limit';

import path from 'path';

import { fileURLToPath } from 'url';

import { createServer } from 'http';

import { Server } from 'socket.io';

import authRoutes from './routes/v3/auth.js';

import dashboardRoutes from './routes/v3/dashboard.js';

import publicDashboardRoutes from './routes/v3/public/dashboard.js';

import paymentsRoutes from './routes/v4/payments/index.js';

import shopRoutes from './routes/v4/shop/index.js';

import usersListRoutes from './routes/v3/users/list.js';

import usersRolesRoutes from './routes/v3/users/roles.js';

import usersPermissionsRoutes from './routes/v3/users/permissions.js';

import usersHistoriesRoutes from './routes/v3/users/histories.js';

import usersSessionsRoutes from './routes/v3/users/sessions.js';

import usersPremiumRoutes from './routes/v3/users/premium.js';

import usersReferralSettingsRoutes from './routes/v3/users/referral-settings.js';
import usersTransferSettingsRoutes from './routes/v3/users/transfer-settings.js';

import usersReferralHistoryRoutes from './routes/v3/users/referral-history.js';

import gamesListRoutes from './routes/v3/games/list.js';

import gamesMatchesRoutes from './routes/v3/games/matches.js';

import gamesParticipantsHistoryRoutes from './routes/v3/games/participants-history.js';

import feedListRoutes from './routes/v3/feed/list.js';

import feedCategoriesRoutes from './routes/v3/feed/categories.js';

import engagementMissionsRoutes from './routes/v3/engagement/missions.js';

import engagementBadgesRoutes from './routes/v3/engagement/badges.js';

import engagementSettingsRoutes from './routes/v3/engagement/settings.js';

import notificationsRoutes from './routes/v3/notifications.js';

import customerSupportRoutes from './routes/v2/customer-support.js';

import appSettingsRoutes from './routes/v2/app-settings.js';

import v2UsersRoutes from './routes/v2/users.js';
import v2UserTransferRoutes from './routes/v2/user-transfer.js';

import v2GamesRoutes from './routes/v2/games.js';

import v2NotificationsRoutes from './routes/v2/notifications.js';

import v2FeedRoutes from './routes/v2/feed.js';

import v2EngagementRoutes from './routes/v2/engagement.js';

import v2SocialRoutes from './routes/v2/social.js';

import v3ShopOrdersRoutes from './routes/v3/shop/orders.js';

import v3ShopCoinsRoutes from './routes/v3/shop/coins.js';

import filesRoutes from './routes/v1/files.js';

import { verifyToken } from './utils/jwt.js';

import { requireAdmin } from './middleware/admin.js';

import { emitPendingPaymentCounts } from './utils/socket.js';

import { env } from './config/env.js';

import { User } from './models/User.js';

import { SupportConversation } from './models/SupportConversation.js';

import { isAdminRole } from './utils/admin-role.js';

import { getHealthStatus } from './utils/health.js';
import { uploadsRoot } from './utils/uploads-path.js';



const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);



export function createApp() {

  const app = express();

  app.set('trust proxy', 1);

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  app.use(compression());

  app.use(cookieParser());

  app.use(
    cors({
      origin(origin, callback) {
        // Never throw — a thrown Error becomes HTTP 500 and breaks the browser fetch.
        if (!origin || env.corsOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(null, false);
      },
      credentials: true,
    })
  );

  // Coolify/Traefik domain path `/api` often strips the prefix before Node.
  // Restore `/api` so `/v3/...` still hits `/api/v3/...`.
  app.use((req, _res, next) => {
    const pathOnly = req.path || '';
    if (pathOnly.startsWith('/api/') || pathOnly === '/api') {
      next();
      return;
    }
    if (/^\/v\d+\//.test(pathOnly)) {
      req.url = `/api${req.url}`;
    }
    next();
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: false, message: 'Too many requests, please try again later' },
  });

  app.use('/api/v2/users/auth', authLimiter);
  app.use('/api/v3/users/auth', authLimiter);

  app.use(express.json({ limit: '2mb' }));

  app.use(express.urlencoded({ extended: true }));

  const uploadsStatic = express.static(uploadsRoot, {
    maxAge: env.isProduction ? '7d' : 0,
    etag: true,
    setHeaders(res, filePath) {
      if (String(filePath).toLowerCase().endsWith('.apk')) {
        res.setHeader('Content-Type', 'application/vnd.android.package-archive');
        res.setHeader('Content-Disposition', 'attachment; filename="BattleAsia.apk"');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        return;
      }
      if (env.isProduction) {
        // Uploads are content-stable URLs; allow CDN/browser cache for a week
        res.setHeader('Cache-Control', 'public, max-age=604800');
      }
    },
  });
  // Direct path (nginx /uploads proxy, Coolify domain path /uploads)
  app.use('/uploads', uploadsStatic);
  // Coolify path /api keeps prefix for some routes — APK/media via /api/uploads/*
  app.use('/api/uploads', uploadsStatic);



  app.get('/health', async (_req, res) => {
    const health = await getHealthStatus();
    const code = health.status === 'ok' ? 200 : 503;
    return res.status(code).json(health);
  });

  // Alias for reverse-proxy / Passenger that keep the /api prefix
  app.get('/api/health', async (_req, res) => {
    const health = await getHealthStatus();
    const code = health.status === 'ok' ? 200 : 503;
    return res.status(code).json(health);
  });

  app.get('/ready', async (_req, res) => {
    const health = await getHealthStatus();
    if (health.checks.database !== 'ok') {
      return res.status(503).json({ status: false, message: 'Database not ready' });
    }
    return res.json({ status: true, message: 'Ready' });
  });

  app.get('/api/ready', async (_req, res) => {
    const health = await getHealthStatus();
    if (health.checks.database !== 'ok') {
      return res.status(503).json({ status: false, message: 'Database not ready' });
    }
    return res.json({ status: true, message: 'Ready' });
  });



  app.use('/api/v1/files', filesRoutes);

  app.use('/api/v3/users/auth', authRoutes);

  app.use('/api/v3/users/list', requireAdmin, usersListRoutes);

  app.use('/api/v3/users/roles', requireAdmin, usersRolesRoutes);

  app.use('/api/v3/users/permissions', requireAdmin, usersPermissionsRoutes);

  app.use('/api/v3/users/histories', requireAdmin, usersHistoriesRoutes);

  app.use('/api/v3/users/sessions', requireAdmin, usersSessionsRoutes);

  app.use('/api/v3/users/premium', requireAdmin, usersPremiumRoutes);

  app.use('/api/v3/users/referral-settings', requireAdmin, usersReferralSettingsRoutes);
  app.use('/api/v3/users/transfer-settings', requireAdmin, usersTransferSettingsRoutes);

  app.use('/api/v3/users/referral-history', requireAdmin, usersReferralHistoryRoutes);

  app.use('/api/v3/dashboard', requireAdmin, dashboardRoutes);

  app.use('/api/v3/public/dashboard', publicDashboardRoutes);
  // Alias when Passenger/proxy strips the /api prefix
  app.use('/v3/public/dashboard', publicDashboardRoutes);

  app.use('/api/v3/games/list', requireAdmin, gamesListRoutes);

  app.use('/api/v3/games/matches', requireAdmin, gamesMatchesRoutes);

  app.use('/api/v3/games/participants-history', requireAdmin, gamesParticipantsHistoryRoutes);

  app.use('/api/v3/feed/list', requireAdmin, feedListRoutes);

  app.use('/api/v3/feed/categories', requireAdmin, feedCategoriesRoutes);

  app.use('/api/v3/engagement/missions', requireAdmin, engagementMissionsRoutes);

  app.use('/api/v3/engagement/badges', requireAdmin, engagementBadgesRoutes);

  app.use('/api/v3/engagement/settings', requireAdmin, engagementSettingsRoutes);

  app.use('/api/v3/notifications', requireAdmin, notificationsRoutes);

  app.use('/api/v2/customer-support', customerSupportRoutes);

  app.use('/api/v2/app-settings', appSettingsRoutes);

  app.use('/api/v2/users', v2UsersRoutes);
  app.use('/api/v2/users/transfer', v2UserTransferRoutes);

  app.use('/api/v2/games', v2GamesRoutes);

  app.use('/api/v2/notifications', v2NotificationsRoutes);

  app.use('/api/v2/feed', v2FeedRoutes);

  app.use('/api/v2/social', v2SocialRoutes);

  app.use('/api/v2/engagement', v2EngagementRoutes);

  app.use('/api/v3/shop/orders', v3ShopOrdersRoutes);

  app.use('/api/v3/shop/coins', v3ShopCoinsRoutes);

  app.use('/api/v4/payments', paymentsRoutes);

  app.use('/api/v4/shop', shopRoutes);



  return app;

}



export function createSocketServer(app: express.Express) {

  const httpServer = createServer(app);

  const io = new Server(httpServer, {

    path: '/socket.io',
    cors: {
      origin: env.corsOrigins,
      credentials: true,
    },

  });



  io.use((socket, next) => {

    const token = (socket.handshake.auth?.token as string) || '';

    const payload = verifyToken(token);

    if (!payload?.userId) {

      return next(new Error('Unauthorized'));

    }

    socket.data.userId = payload.userId;

    return next();

  });



  io.on('connection', (socket) => {

    socket.on('join-admin-room', async () => {

      const user = await User.findById(socket.data.userId as string);

      if (!isAdminRole(user)) {

        return;

      }

      socket.join('admin-room');

      await emitPendingPaymentCounts();

    });



    socket.on('leave-admin-room', () => {

      socket.leave('admin-room');

    });



    socket.on('join-game', (gameId: string) => {

      if (gameId) socket.join(`game:${gameId}`);

    });



    socket.on('leave-game', (gameId: string) => {

      if (gameId) socket.leave(`game:${gameId}`);

    });



    socket.on('join-conversation', async (conversationId: string) => {

      if (!conversationId) return;

      const userId = socket.data.userId as string;

      const [user, conversation] = await Promise.all([

        User.findById(userId),

        SupportConversation.findById(conversationId),

      ]);

      if (!conversation) return;

      if (!isAdminRole(user) && conversation.userId.toString() !== userId) return;

      socket.join(`conversation:${conversationId}`);

    });



    socket.on('leave-conversation', (conversationId: string) => {

      if (conversationId) {

        socket.leave(`conversation:${conversationId}`);

      }

    });



    socket.on('typing', (data: { conversationId?: string; isTyping?: boolean }) => {

      if (data?.conversationId) {

        socket.to(`conversation:${data.conversationId}`).emit('user-typing', data);

      }

    });



    const userId = socket.data.userId as string;

    if (userId) {

      socket.join(`user:${userId}`);

    }

  });



  return { httpServer, io };

}


