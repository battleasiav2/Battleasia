# BattleAsia — Full Product Master Prompt

> Single source-of-truth prompt to rebuild the **entire BattleAsia platform** (API + Player web + Shop web + Admin web + Flutter APK + infra). Give this whole file to an AI/developer and nothing about scope, features, or wiring should be missed. Your own visual **design** (exact pixels, brand art, copy) is layered on top of this — this prompt defines behavior, architecture, data, and features.

---

## 0. What BattleAsia is

A **mobile-games esports tournament platform** (PUBG, Free Fire, COD, MLBB, Valorant). Players join paid matches, win in-app coin **BAC**, and cash out. Social (feed, reels, stories, DMs), engagement (missions, streaks, squads, spin, season), coin **shop**, and **admin**.

**Two player products (both required in every rebuild):**

| Client | What it is |
|--------|------------|
| **PC Web** | Full **desktop** app at `battleasia.gg` + `shop.battleasia.gg`. Designed for **computer** (wide HUD, sidebar, hover, keyboard §16). This is **not** a phone website. |
| **Native Android** | Flutter APK `net.battleasia.app`. This is the **phone** product (bottom nav, touch, bottom sheets). |

**Entry (strict):**

- **PC Web:** **Landing first.** `/` → `/dashboard` (hero, games, APK download). From there Sign in / Enter Arena → `/auth/*` → `/user/play`. Do **not** skip landing on a cold visit.
- **Native APK:** **Auth only — no landing.** Splash → Sign In (or Sign Up if they tap create). Logged-in → Play. **Do not** build a marketing home / landing / hero on the APK. Phone landing = the PC site.

Same account, same API. Paid Play/Shop still require auth on both.

Admin web is also **PC-only**. One API serves all.

**One shared backend API** serves all four clients. Currency = **BAC** stored on `User.balance`; every movement is logged.

### 0.2 Running site + admin — A–Z inventory (must all exist)

This is the **live product today**. A rebuild must include **every row**. Extra items later in this prompt (Aurora, ledger, FCM, unique earn) are **additive**.

**PC player (`battleasia.gg`):** `/` → `/dashboard` landing (7 blocks) · privacy · terms · `/profile/:userId` · `/support` · `/auth/{sign-in,sign-up,forgot-password,reset-password,email-verification}` (**6-digit OTP visible** on verify + reset — §3.6) · `/user/play` · `/user/play/:gameId` · `/user/play/:matchId/detail` · `/user/play/:matchId/result` · `/user/shop` · `/user/shop/wallet` · `/user/referral` · `/user/feed` · `/user/feed/:id` · explore/saved/reels/messages → feed tabs · `/user/account/{profile, wallet, my-matches, my-orders, my-statistics, my-referrals, notifications, leader-board, customer-support}` · `/user/earn` → wallet.

**PC shop:** `/auth/*` (same 5) · `/user/shop` · `/user/wallet` · `/user/transfer` · `/user/withdrawal`.

**Admin (`admin.battleasia.gg`) — every nav item live now:**
- Auth: `/auth/login` (+ optional OTP). No public register.
- Dashboard `/dashboard`
- Users: list, role, history, online, premium, referral-settings, transfer-settings, referral-history
- Games: list, matches, `matches/:id/result`, participants-history
- Balance: balance-histories
- Payments: wallet, deposit, withdrawal
- Notifications
- Feed: list, categories, profile-social-settings, social-reports, reels-moderation
- Support: list, `:conversationId`, live-chat-settings, messaging-provider-settings
- Shop: coinlist, coinrate
- Engagement: missions, badges, settings
- System: mail-settings, app-download
- Profile `/profile` · 404

**RBAC keys (UI hide; `admin` bypasses):** `users.view|create|edit|delete` · `matches.view|create|edit|delete|result` · `payments.view|manage` · `notifications.send` · `feed.view|create|edit|delete` · `customer-support.view|reply|close` · `shop.view|create|edit|delete` · `engagement.view|edit`.

**APK after-login** mirrors player `/user/*` (no landing). Shop on APK = native Shop/Wallet/Transfer/Withdraw.

### 0.3 Footer, socials, live chat (copy running site — seed allowed)

Copy `battleasia.gg/src/layouts/core/footer-section.tsx`, `support-chat.tsx`, `deferred-support-chat.tsx`, `social-links-fab.tsx`, and `api/src/models/AppSettings.ts` (`DEFAULT_LIVE_CHAT_SETTINGS` + `DEFAULT_MESSAGING_SETTINGS`) **A–Z**. Seed may load these defaults. Links stay **real** (they must open those URLs). Admin → Live Chat Settings / Messaging providers can edit after seed. Do **not** drop a network.

#### Footer (PC landing + logged-in dashboard shell)

Source: `FooterSection`. Show on `/dashboard` **and** after-login layout. Lazy footer bg image + dark gradient overlay (must not block LCP). Top hairline + centered chevron. Three columns (stack on mobile):

1. **Follow the arena** — circular icon buttons (46px), `target=_blank`, hover fill gold + lift `-3px`. Networks: Facebook, Discord, TikTok, Instagram, YouTube, Telegram (footer row URLs below).
2. **Brand center** — logo 72×72, wordmark (`2.0` in accent), tagline, then legal/jump nav: Privacy `/privacy-policy`, Terms `/terms-and-conditions`, Rules → `#rules` / `/dashboard/rules`, How to play → `#how-to-play`, About → `#about-us`. Copyright `{year}`.
3. **User support** — `mailto:support@battleasia.gg`, **Live support relay** button (gold border, pulse live-dot animation) → `/support` (opens live chat). Hover inverts to gold fill.

Bottom bar (blur): **Payments** chips with logos — bKash, Nagad, Crypto. **Trusted partners** pills (new tab): `https://battleasia.com`, `https://baccoin.shop`, `https://battleasia.net`, `https://www.pubg.com`, `https://www.bkash.com`, `https://nagadwallet.net`.

#### Social URLs (keep every unique href)

| Network | Where | Default URL |
|---------|--------|-------------|
| Facebook | Footer | `https://www.facebook.com/share/14XUaoaUgUL/?mibextid=wwXIfr` |
| Facebook | Live-chat seed + social FAB | `https://www.facebook.com/share/1HQV9D33ic/?mibextid=wwXIfr` |
| Discord | Footer | `https://discord.gg/battleasia` |
| TikTok | Footer | `https://www.tiktok.com/@battleasia?_r=1&_t=ZN-93nBYQnjiGU` |
| TikTok | Live-chat seed + social FAB | `https://www.tiktok.com/@battleasia?_r=1&_t=ZN-91f9vFOUJcc` |
| Instagram | Footer | `https://www.instagram.com/battleasia` |
| YouTube | Footer | `https://www.youtube.com/@BattleAsia` |
| YouTube | Live-chat seed + social FAB | `https://youtube.com/@battleasia?si=9ROsHqQNc3mVFMvl` |
| Telegram | Footer | `https://t.me/battleasiaofficial` |
| WhatsApp | Live-chat seed + social FAB | `https://whatsapp.com/channel/0029VbBDBVtGpLHQgYC7WM44` |

Footer row = 6 networks (no WhatsApp). Chat/FAB seed = Facebook, YouTube, WhatsApp, TikTok. Rebuild must expose **all 7 networks** (Instagram + Discord + Telegram on footer; WhatsApp on chat/FAB). Keep both Facebook share IDs (footer vs seed). Admin can override `AppSettings.liveChat.socialLinks`.

**Social FAB** (`social-links-fab.tsx`): fixed bottom-right; click/hover fans out brand-color buttons (Facebook, YouTube, WhatsApp, TikTok). Do not cover the live-chat FAB (offset). Optional if live-chat panel already shows the same four; URLs still required in seed.

#### Live chat (PC landing + after-login; APK: same features in support + optional FAB)

Copy **every** inner feature of running `support-chat.tsx`. Load **after idle** (`DeferredSupportChat`, `requestIdleCallback` ~4.5s) so it never blocks LCP.

**FAB icon (hover + drag):**
- Fixed, default bottom-right, size 52. Icon `solar:chat-round-call-bold`; when open → close icon.
- **Hover:** scale ~1.04, gold border/fill. Cursor grab. Title: “Drag to move · Click to open”.
- **Drag:** pointer capture, 8px threshold, clamp to viewport; persist `{x,y}` in `localStorage` key `ba-support-chat-pos`. Resize reclamps. Mobile: extra bottom clearance (~84px) so it sits above bottom nav.
- Click (not a drag) toggles panel. If `liveChat.enabled === false`: toast “live chat offline”, do **not** open / hide FAB when closed.

**Panel (Grow open, origin bottom-right or top-right if FAB is low on screen):**
- Dark card ~300×380 (mobile `min(52vh, 360)`), gold edge shadow, close button (hover scale).
- Header: agent avatar/logo, **agentName** (“BattleAsia Support”), green online dot + **agentTitle** (“Live Support”).
- Welcome card: seeded `welcomeMessage`.
- **Guest:** copy “Sign in to chat…” + Sign In CTA → `/auth/sign-in`; composer placeholder “Sign in to chat…”. Sending/uploading while guest → toast + redirect sign-in. Welcome + **in-panel social buttons** still visible.
- **Authed:** `getOrCreateConversation` + last 40 messages; loading spinner; bubbles (me = gold tint, agent = muted + agent name); auto-scroll to bottom.
- **Realtime:** Socket.IO join conversation; `onNewMessage` append (dedupe by id); leave on close.
- **Attachments:** gallery button, `accept=image/*` multiple, max **4**, folder `support`; pending thumbs + remove; send with message (body may be space if image-only); render image thumbs (click open new tab) or file label.
- Composer: attach + input + send (Enter to send, Shift+Enter newline). Hover scale on attach/send. Disabled while sending/uploading/offline. Sending spinner.
- In-panel **socialLinks** row (from settings): brand-color icon buttons, `target=_blank`, hover lift.
- Hide entire widget when disabled and panel closed.

**Seed `AppSettings.liveChat` (exact running defaults):**
```
enabled: true
agentName: BattleAsia Support
agentTitle: Live Support
agentAvatar: ""
logoUrl: /logo/logo.webp
welcomeMessage: Hi! How can we help you today? Chat with our team or reach us on social.
socialLinks: Facebook / YouTube / WhatsApp / TikTok (URLs + mingcute icons + brand colors from table above)
```

**Seed `AppSettings.messaging`:** builtin “BattleAsia Chat” ON as default; WhatsApp / Telegram / Facebook / Discord providers present, default **enabled: false**, `openInNewTab: true`, `allowUserChoice: true`. Admin: `/customer-support/live-chat-settings` + `messaging-provider-settings`. Public GET: `/api/v2/customer-support/live-chat-settings`. Authed chat: `/api/v2/customer-support` conversations + messages + uploads.

**APK:** same conversation/messages/attachments/welcome/socials in native support; optional draggable FAB. No marketing landing.

Seed may also load 10 face users + 5 games. Footer/chat copy comes from seed; URLs remain the live ones.

---

## 1. Monorepo layout

```
battleasianew/
├── api/                  Node + Express + TypeScript + MongoDB (Mongoose) + Socket.IO   :5050
├── battleasia.gg/        Player web — React 18 + Vite 6 + MUI 6 + Redux Toolkit          :8081
├── shop.battleasia.gg/   Coin shop web — React 18 + Vite 6 + MUI 6 + Redux Toolkit       :8082
├── admin.battleasia.gg/  Admin web — CRA (react-scripts 5) + React 18 + MUI 5           :3000/3001
├── battleasia-app/       Flutter/Dart Android app (native, same API)
├── docker/               Dockerfiles + nginx configs (dev + prod)
├── deploy/               Coolify/Hostinger/VPS scripts + Bengali guides
├── local-dev/proxy.mjs   Unified single-domain dev proxy                                 :8080
├── backups/              MongoDB dumps (gitignored)
├── docker-compose.yml            local docker dev (fe+shop+admin+nginx, API on host)
├── docker-compose.prod.yml       manual VPS (api+fe+shop+admin+nginx+certbot)
├── docker-compose.coolify.yml    Coolify prod (mongo+api+fe+shop+admin, Traefik SSL)
└── docker-compose.yaml           alias of coolify compose (Coolify default path)
```

Production domains (Coolify + Cloudflare):
- `https://battleasia.gg/` → player web
- `https://shop.battleasia.gg/` → shop web
- `https://admin.battleasia.gg/` → admin web
- `https://battleasia.gg/api/*`, `/uploads/*`, `/socket.io/*` → API (path prefix, not a subdomain)

---

## 2. Backend API (`api/`)

**Stack:** TypeScript (ESM), Express 4, Mongoose 8, MongoDB, Socket.IO 4, JWT (`jsonwebtoken`, 7-day), `bcryptjs`, `multer` uploads (local disk `api/uploads/`), `nodemailer`, `helmet`/`cors`/`rate-limit`/`compression`/`cookie-parser`. Dev fallback: `mongodb-memory-server` with auto-restore from a backup dump when the DB is empty.

**Route versioning** (all under `/api`; the app rewrites `/vN/...` → `/api/vN/...` when a proxy strips `/api`):
- `v1` → file uploads
- `v2` → player-facing (web + APK)
- `v3` → admin auth + admin CRUD + some public/shared
- `v4` → shop + payments

### 2.1 Auth & roles
- Stateless **JWT**; token via `Authorization: Bearer` OR httpOnly cookie (`battleasia_token` for players, `webet_token` for admin). Payload includes `tokenVersion` (see §2.8). Admin sign-in also writes `Session` + `LoginHistory`.
- Optional admin **email OTP** (`ADMIN_LOGIN_OTP=true`).
- Roles: `admin`, `official`, `agent` (all pass admin gate), `player`. **RBAC keys** listed in §0.2. API gate is still role-type (`requireAdmin`); UI hides by permission.
- Rate limit: 100 req / 15 min on auth paths.

### 2.2 Data models (52 collections — must all exist)
- **Users/auth:** `User` (email, username, password, status, avatar, cover, bio, `balance` BAC, embedded `role`{type,permissions}, `roleRef`, `pubgId`, `gameServer`, `referralCode`, `referredBy`, `emailVerified`, premium fields, `privacy`, **`tokenVersion`** integer default 0 — bump on password change / suspend / logout-all), `Role`, `Session`, `LoginHistory`, `VerificationCode`.
- **Games/matches:** `Game`, `Match` (gameId, gameMode classic/tdm, roomId/password, schedule, entryFee, totalPlayer, teamType, perKill, map, banner, premiumOnly, platformFeePercent, status, results[], winningsDistributed, entriesRefunded, **slug**), `MatchParticipant` (**ready** boolean, unique `{matchId,userId}`), `MatchChatMessage` (matchId, userId, body, createdAt).
- **Wallet/payments (BAC):** `BalanceHistory`, `DepositHistory`, `WithdrawalHistory`, `PaymentChannel`, `BusinessWallet`, `CoinRate` (global/bangladesh/india/pakistan), `CoingoTransaction`, `ShopItem`, `ShopOrder`, `UserTransferHistory`, `ReferralHistory`.
- **Social/feed:** `Feed`, `FeedCategory`, `FeedLike`, `FeedComment`, `SavedPost`, `Reel`, `Story` (TTL expiry), `Follow`, `UserBlock`, `DirectConversation`, `DirectMessage`, `SocialReport`.
- **Notifications/support:** `Notification`, `NotificationRead`, `SupportConversation`, `SupportMessage`.
- **Engagement (gamification):** `EngagementMission`, `EngagementBadge`, `UserEngagementProgress`, `UserEngagementBadge`, `UserEngagementLevel`, `UserEngagementStreak`, `UserEngagementWelcome`, `UserEngagementReferral`, `UserEngagementWeekly`, `UserEngagementSeason`, `UserEngagementSpin`, `UserEngagementShare`, `UserEngagementSquad`, `EngagementSquad`, `EngagementSquadWeekly`, `EngagementSquadWeeklyClaim`.
- **Config:** `AppSettings` (single `key:'global'` doc: premium price/duration, commissionRate, transferSettings, liveChat, messaging, profileSocial, mail, appDownload, full engagement config, **feature flags**, **maintenanceMode** {enabled, message, resumeAt}, **kycRequiredForWithdraw**, **highValueWithdrawBac**, **velocityLimits**, **reserveAlert**).
- **Integrity (new, required):** `LedgerEntry` (debitAccount, creditAccount, amount, userId, refType/refId, idempotencyKey — **never deleted**), `DeviceFingerprint` (userId, hash, ip, ua, lastSeen), `FraudHold`, `KycRecord`, `MatchReport`, `Dispute`, **`AuditLog`**, **`DevicePushToken`** (userId, token, platform `android|web`).

### 2.3 Endpoint groups (must all be present)
- **`/api/v1/files`** — `POST /upload/:folder`, `/upload/:folder/multi`, `DELETE /` (5MB default, 100MB reels/stories).
- **`/api/v2/games`** — games list; matches list/detail/result/**room** (participant-only); check-join; **join**; **leave** (before start → fee reversal); **ready** `{ ready: boolean }`; **lobby chat** GET/POST `/matches/:id/chat`; history (me + by user).
- **`/api/v2/users`** — signup, signin, logout; email verify; password reset; `GET/PUT /me`; **`POST /refresh`**; **`POST /me/push-token`** `{ token, platform }`; leaderboard; withdrawable-amount; balance-history; referrals; premium; match history; follow/unfollow/block/followers/following/suggested/mutual.
- **`/api/v2/users/transfer`** — settings, P2P transfer, history.
- **`/api/v2/feed`** — categories, list, create, explore, saved, comments, like, save, view, by-user.
- **`/api/v2/social`** — stories CRUD/view; reels CRUD/view (+admin); reports; DM conversations/messages; user search; messaging + profile-social settings.
- **`/api/v2/engagement`** — home, badges, alerts; claim missions/streak/welcome/referral/weekly/squad/share/spin/season.
- **`/api/v2/notifications`** — list, mark read, read-all.
- **`/api/v2/customer-support`** — conversation CRUD, tickets, messages, live-chat settings.
- **`/api/v2/app-settings`** — mail settings (admin); APK download config + upload; **public maintenance** payload (enabled, message, resumeAt).
- **`/api/v3/users/auth`** — admin signin, verify-otp, logout, me, profile.
- **`/api/v3/users/{list,roles,permissions,histories,sessions,premium,referral-settings,transfer-settings,referral-history}`** — + **bulk status**, `DELETE /sessions/:sessionId`, `POST /auth/verify-password`.
- **`/api/v3/audit-logs`** — list/filter/export.
- **`/api/v4/payments`** — `balance-histories`, `payment-channels` (+public), `business-wallets` (+public), `deposit-history` (submit/my-history/approve/reject/stats/pending + **bulk**), `withdrawal-history` (submit/my-history/approve/complete/reject/stats + **bulk**), `coingo` (collection start + status, payout + status).
- **`/api/v3/dashboard`** (admin stats: `totalUsers`, `totalMatches`, payments — **same Mongo**) + **`/api/v3/public/dashboard`** (cached public live stats for landing: `platform.todayJoinedUsers`, `processedMatches`, `ongoingMatches`, `totalWinnings`, `liveCountByGame`, charts/rails). **Landing tiles/charts must use this public API.** Do not use env fake stats (`VITE_STAT_*`) for join/match/player counts.
- **`/api/v3/integrity/{ledger, fraud-holds, kyc, fingerprints, match-reports, disputes}`** — admin queues; player KYC submit + match report under v2.
- **`/api/v3/games/{list,matches,participants-history}`** — admin game/match CRUD, results, distribute winnings, refunds.
- **`/api/v3/feed/{list,categories}`**, **`/api/v3/engagement/{missions,badges,settings}`**, **`/api/v3/notifications`** (broadcast).
- **`/api/v3/shop/orders`** (checkout, me), **`/api/v3/shop/coins`** (public rates + legacy Coingo payout).
- **`/api/v4/shop`** — `items` (list/get + admin CRUD), `coins` (rates + admin CRUD), `orders` (admin list).
- **`/health`, `/ready`, `/uploads/*`** (serves images + `uploads/app/BattleAsia.apk`).

### 2.4 Money flows (critical logic)
- **Deposit (manual):** player picks channel (bKash/Nagad/crypto) → gets business-wallet address/QR → submits proof (`deposit-history/submit`) → admin approves → credits BAC + `BalanceHistory` + referral commission + welcome/deposit bonuses + socket events. **Alt:** Coingo gateway (auto in mock).
- **Withdrawal:** check withdrawable (70% of match-bet BAC rule) → submit → admin approve→processing→complete/reject.
- **Match economy:** join deducts entry fee; **leave before start** refunds via reversal ledger; **ready** is lobby-only (does not move BAC); admin distributes winnings / refunds from v3.
- **P2P transfer:** fee% + min/max from `AppSettings.transferSettings`.
- **Coin rates:** per region; shop packs have fiat price + `paymentOptions`.

### 2.5 Realtime (Socket.IO, path `/socket.io`, JWT in handshake)
- Rooms: `user:{id}` (auto), `admin-room`, `game:{id}`, `conversation:{id}`.
- Client→server: `join-admin-room`, `join-game`, `join-conversation`, `typing`, and leaves.
- Server→client: `pending-deposits-count`, `pending-withdrawals-count`, `new-deposit`, `new-withdrawal`, `new-notification`, `new-message`, `balance-updated`, `user-stats-updated`, `match-created`, `match-updated`, `dashboard-stats-updated`, `user-typing`, **`match-chat-message`**, **`match-ready-updated`**, **`match-participant-left`**.
- Push: in-app `Notification` **and FCM** when APK token registered (deposit result, match starting, DM). Web may use same API no-op if no token.

### 2.6 Services & seeding
- Email (SMTP or `AppSettings.mail`), Coingo gateway, disk uploads, APK distribution, in-memory cache for public dashboard, referral engine, engagement engine. **No cron/background workers** — side effects run inline.
- Seed (`npm run seed`): roles, admin, **10 face players**, 5 platform games, AppSettings including **`liveChat` + `messaging` social URLs from the running site**, bKash/Nagad channels + wallet, coin rates, 14 BAC packs, sample matches/results, sample deposit/withdrawal/feed/notification/support. Partial seeds: games/dashboard/feed/social/demo. Auto-restore from `backups/…/mongo/battleasia` when embedded Mongo starts empty.

**10 face users (required seed — look “fake” on landing, real in Admin):**
- Create **10** `User` documents, `role.type: player`, unique usernames, generated **face avatars** (WebP), optional bio. They are **real DB users** — Admin → Users list shows all 10 (edit/ban/balance like anyone). **Do not** hardcode faces only in React.
- Use them to **fill** landing pulse, top players, leaderboard, suggested follows, empty-ish feed — because the API returns them, not because the UI invents names.
- Give a few completed match results / BAC so counts and charts are non-zero after seed. Still **API-backed**.
- Demo login stays `player@battleasia.local / Player@123456` (can be one of the 10 or extra). Seed faces: **not** usernames `testplayer` / `demouser` (those are filtered from public pulse today).
- Optional internal tag `seedFace: true` for ops; **never hide from admin**.

### 2.7 Money integrity (required for 100% ready)
- **Atomic transactions (ACID):** wrap balance deductions and entry writes in MongoDB `session.withTransaction()` (replica set in prod). One transaction for: match **join** (slot + debit + `MatchParticipant` + `BalanceHistory`); **deposit approve**; **withdraw approve/complete**; **P2P transfer**; **distribute winnings / refund**. Any step fails → full abort.
- **Server-side balance validation:** never trust client-sent balance or “I can afford this”. Inside the transaction, **re-fetch** the user wallet and re-check `balance >= amount` (and withdrawable 70% rule for withdrawals) **before** any state change.
- **Double-spend protection:** unique index `(matchId, userId)` on participants; conditional `findOneAndUpdate` only if slots remain and match is joinable; atomic `$inc` with `balance >= amount` (or equivalent filter). Parallel debit/payout of the same funds must fail one request. `winningsDistributed` / `entriesRefunded` flags prevent a second payout.
- **Idempotency keys:** client sends `Idempotency-Key` (UUID) on join, deposit submit, withdraw submit, transfer, shop order. Persist key → duplicate hits return the **first** result, no second debit. UI retries reuse the same key.
- **High-value withdrawal approval:** withdrawals (and manual balance adjusts) **above a threshold** (default **1000 BAC**, admin-tunable in `AppSettings`) require **mandatory extra verification**: queued for senior/admin review, password or **2FA/OTP** confirm before the API mutates. Below-threshold still follows normal admin approve→processing→complete. Deposits remain admin-reviewed at all amounts unless Coingo auto.

### 2.8 API, auth, match & upload hardening (required)

**API & server**
- **Rate limit / throttle** (`express-rate-limit`): auth **100 / 15 min**; tighter on OTP send/resend, forgot-password, join, deposit/withdraw/transfer. 429 → UI countdown.
- **NoSQL injection:** `express-mongo-sanitize` (strip `$` / `.` operators from req body/query/params). Never pass raw user objects into Mongo filters.
- **XSS & headers:** sanitize incoming strings (maintained sanitizer; `xss-clean` is unmaintained — use `xss` / DOMPurify-equivalent on the server). **`helmet`** strict CSP, `X-Content-Type-Options`, `Referrer-Policy`, frame ancestors none. Do not serve user HTML unsanitized.
- **CORS whitelist:** `CORS_ORIGINS` only — `https://battleasia.gg`, `https://shop.battleasia.gg`, `https://admin.battleasia.gg` (+ localhost in dev). No `*`. Credentials allowed only for those origins.

**Auth & session**
- **HttpOnly + Secure cookies:** `battleasia_token` (player), `webet_token` (admin) — `httpOnly`, `secure` in prod, `sameSite` appropriate (Lax/Strict; None only if cross-site shop needs it **and** Secure). JWT also accepted as Bearer for APK. Never put JWT in `localStorage`.
- **JWT invalidation via `tokenVersion`:** embed `tokenVersion` in the access token. On **password change, account suspend/ban, logout-all**, increment `User.tokenVersion` so all devices fail auth immediately. Middleware rejects mismatched version.
- **Password hashing:** `bcryptjs` with salt (cost ≥ 10). Never log or return hashes.
- **2FA / OTP:** admin login OTP (`ADMIN_LOGIN_OTP`); also require OTP/2FA on **high-value admin money actions** (withdraw approve ≥ threshold, balance adjust). Player email-verify / reset already use `VerificationCode`.

**Game ops & anti-tampering**
- **Room credential concealment:** `roomId` / `roomPassword` **omitted** from public and pre-join match payloads. Reveal only after: user is a **paid participant** AND scheduled release time (match start / admin publish). List/detail APIs must not leak credentials.
- **Participant-only authorization:** `GET .../room` (or equivalent) 403 unless `MatchParticipant` exists for that user with paid/joined status.
- **Server-authoritative results:** only **admin v3** result submit / distribute. Ignore client-posted kill counts as truth unless an admin (or signed/OCR-assisted pipeline) verifies. No player can set their own winnings.

**Uploads**
- **MIME + magic-byte validation:** inspect file headers (e.g. `file-type`), not the client extension/`Content-Type` alone. Allowlist images (and video for reels/stories). Reject HTML/JS/SVG-as-script, exe, php.
- **Execution prevention:** serve `/uploads` as **static only** — `Content-Disposition` / `X-Content-Type-Options: nosniff`; nginx/Coolify must **not** execute scripts under the upload path. No `.html` execution.
- **File quota:** multer **memory/disk limits** — 5MB default, 100MB reels/stories, APK cap `APP_APK_MAX_MB`. Hard-cap buffers so a huge body cannot exhaust RAM (`limit` on JSON + multipart).

### 2.9 Ledger, fraud, scale, backup, tests (required for 100% ready)

**Double-entry ledger**
- Every BAC change writes **immutable** `BalanceHistory` **and** a matching **double-entry** `LedgerEntry`: debit one account, credit another (e.g. `user:{id}:wallet` ↔ `platform:liability` / `match:{id}:pool` / `platform:fee` / `reserve:pending-withdraw`). Amounts must balance (sum debit = sum credit) inside the same `withTransaction()`.
- **Never delete or edit** a posted entry. Fix mistakes with a **reversal** (negative/contra entry) that references the original `refId`. Admin “adjust balance” = ledger pair + history, not a silent `$set`.

**Platform liability vs reserve**
- Admin dashboard widget: **sum of all `User.balance` (liability)** vs **fiat/crypto on `BusinessWallet` + pending deposits/withdrawals** (reserve). Alert (email + UI badge) if liability > reserve (or below a safety %). Feature-flag + thresholds in `AppSettings`.

**Suspicious velocity**
- If a user exceeds admin-set limits (e.g. N withdrawals / transfers / joins in T minutes, or rapid drain of a fresh deposit), **auto-hold**: freeze withdraw/transfer, queue `FraudHold`, notify admin. Player sees “Under review”, not a generic 500.

**Anti-fraud & match integrity**
- **Device fingerprint + multi-account:** on signup/signin/join/withdraw store IP + UA + (APK) device id / (web) fingerprint hash. Flag same device/IP ringing multiple accounts or referral abuse (referredBy loops, same fingerprint claiming many bonuses). Admin list + force-link/ban. Admin on/off.
- **Collusion / win-trading:** players (and admins) can **report** participants on a match (kill-sharing, boosting). Queue in admin with match + users. Optional auto-flag: same fingerprint/IP on opposing/winning sides of one match.
- **KYC & age:** before **first withdraw** (or above a BAC threshold), require KYC + **age 18+** when the KYC flag is ON. Admin reviews docs; unverified = withdraw blocked with CTA. Default OFF until ops ready (rule 8).

**Database & traffic**
- **Compound indexes (minimum):** `MatchParticipant { matchId:1, userId:1 }` unique; `{ userId:1, createdAt:-1 }`; `BalanceHistory`/`LedgerEntry` `{ userId:1, createdAt:-1 }`, `{ refType:1, refId:1 }`; deposits/withdrawals `{ status:1, createdAt:-1 }`; `Match { gameId:1, status:1, schedule:1 }`; fingerprints `{ hash:1 }`, `{ ip:1, createdAt:-1 }`.
- **Mongoose connection pool:** set `maxPoolSize` / `minPoolSize` (e.g. 10–50) for many concurrent joins; timeouts; no one-connection-per-request.
- **In-memory cache for live stats:** keep/extend public dashboard cache (`v3/public/dashboard`) with short TTL; invalidate on match-created/updated sockets. Home live pulse must not hit aggregations every page view.

**Compliance, backup, DR**
- **Automated off-site backups:** daily (or more) mongodump, **encrypted**, uploaded to a **separate cloud** (S3/R2/B2 — not only local `backups/`). Retention policy (e.g. 7 local + 30 off-site). Restore runbook in `deploy/`.
- **Graceful maintenance mode:** `AppSettings.maintenanceMode` — player/shop/APK show branded banner + **countdown to resumeAt**; mutating player APIs return 503 + `Retry-After`; **admin stays up**. No mid-join debit without completing the transaction (drain or reject new joins).
- **Dispute & evidence:** support tickets can attach **screenshot/video** tied to `matchId`; admin dispute queue reviews evidence before result/refund changes. Reversal ledger if payout was wrong.

**Tests (automated, CI)**
- Unit + integration for: deposit approve/reject, withdraw submit/approve/complete, join entry-fee debit, insufficient balance, **double join**, match full, **leave/refund**, **ready**, distribute winnings, **idempotency replay**, **reversal** (not delete), velocity hold. Fail CI if money tests fail.

### 2.10 Critical API JSON (envelope + money/match)

All JSON APIs return `{ "success": true, "data": ... }` or `{ "success": false, "message": "human i18n key or English fallback", "errors": { "field": "msg" } }`. Auth: `Authorization: Bearer` and/or cookie. Money mutating POSTs send header **`Idempotency-Key`**: UUID.

| Call | Body (in) | `data` (out, typical) |
|------|-----------|------------------------|
| `POST /api/v2/users/signin` | `{ email, password }` | `{ token, user: { _id, email, username, balance, role, emailVerified } }` |
| `POST /api/v2/users/signup` | `{ email, username, password, pubgId?, phone?, gameServer?, referralCode? }` | `{ emailVerificationRequired: true, email }` → client **shows OTP page** |
| `POST /api/v2/users/verify-email-signup` | `{ email, code }` | `{ emailVerified, session, user }` |
| `POST /api/v2/users/resend-verification-code` | `{ email }` | `{ status: true }` |
| `POST /api/v2/users/forgot-password` | `{ email }` | `{ status: true }` (always generic; then **show OTP** on reset page) |
| `POST /api/v2/users/reset-password` | `{ email, code, password }` | `{ status: true }` |
| `POST /api/v2/users/refresh` | cookie/refresh | `{ token }` |
| `GET /api/v2/users/me` | — | user + `withdrawableAmount` |
| `POST /api/v2/games/matches/:id/join` | `{}` | `{ participant, balance, spotsLeft }` — **no room** until released |
| `POST /api/v2/games/matches/:id/leave` | `{}` | `{ refunded, balance }` — **403** if match started |
| `PATCH /api/v2/games/matches/:id/ready` | `{ ready: true }` | `{ ready, userId, matchId }` |
| `GET /api/v2/games/matches/:id/room` | — | `{ roomId, password }` — **403** if not participant or too early |
| `GET/POST /api/v2/games/matches/:id/chat` | POST `{ body }` | `{ messages[] }` / `{ message }` |
| `POST /api/v4/payments/deposit-history/submit` | `{ channelId, amount, trxId, proofUrl, walletId? }` | `{ _id, status: "pending" }` |
| `POST /api/v2/users/transfer` | `{ recipient, amount, note? }` | `{ transfer, fee, balance }` |
| `POST /api/v4/payments/withdrawal-history/submit` | `{ amount, method, destination }` | `{ _id, status }` |
| `POST /api/v2/users/me/push-token` | `{ token, platform: "android"\|"web" }` | `{ ok: true }` |
| Bulk admin | `{ ids: string[], rejection_reason? }` | `{ updated: n }` |

List/detail match payloads **omit** `roomId`/`password` unless room endpoint. Errors: 401, 403, 404, 409 (already joined), 422 validation, 429.

### 2.11 Observability, email, SEO, i18n, FCM

- **Sentry (or equivalent):** `SENTRY_DSN` on API + player web + shop + admin + Flutter. Capture 5xx and client ErrorBoundary. No PII in breadcrumbs (no password/OTP/JWT).
- **Logs:** structured JSON on API (request id, user id, route). Never log tokens or card/Trx secrets in full.
- **Email HTML templates** (SMTP): verify email, reset password, deposit approved/rejected, withdraw complete/reject, match starting (optional). Same i18n locales.
- **SEO (PC landing only):** unique title/description, Open Graph, `robots.txt`, `sitemap.xml` for public routes. `/user/*` `noindex`.
- **i18n files** (en, bn, zh, hi, ur) namespaces: `common`, `auth`, `play`, `wallet`, `shop`, `feed`, `errors`, `admin`. **No hardcoded user-visible English** in components. Auth/play/wallet/error strings must exist in all 5 locales before ship.
- **FCM:** Android `google-services.json` gitignored; register token after login; server send on notification insert. Fail open if FCM unset in dev.
- **Analytics (optional):** no blocking third-party on LCP. If added, consent + after load.

---

## 3. Player web (`battleasia.gg`) — **PC / desktop** landing + dashboard

**Desktop-first.** Auth pages are the gate into `/user/*`. Keyboard HUD §16. Phone users are expected to use the **APK**.

**Stack:** React 18 + TS + Vite 6 (SWC), React Router 7, MUI 6, Redux Toolkit + redux-persist (auth persisted, **token stripped** on write), react-hook-form + zod, Axios (Bearer + toast interceptors, 401→logout, 403→email-verify), socket.io-client (dynamic import), i18next (en/bn/zh/hi/ur), Tailwind (preflight off) + Emotion. Dev port **8081**; proxies `/api`,`/uploads`,`/socket.io` → `VITE_SERVER_URL` (default `:5050`).

### 3.1 Routes
- **Public:** `/` → `/dashboard` (landing/home), `/privacy-policy`, `/terms-and-conditions`, `/profile/:userId` (public profile), `/support`.
- **Auth (unguarded):** `/auth/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`, `/email-verification`.
- **Protected (`AuthGuard` + `UserLayout`, all `/user/*`):**
  - `play`, `play/:gameId`, `play/:matchId/detail`, `play/:matchId/result`
  - `shop`, `shop/wallet` (BAC hub; heavy shop links out to `VITE_BAC_SHOP_URL`)
  - `referral`
  - `feed`, `feed/:id`; `explore|saved|reels|messages` redirect to feed `?tab=`
  - `account/{profile, profile/:userId, wallet, my-matches, my-orders, my-statistics, my-referrals, notifications, leader-board, customer-support}`

### 3.2 Landing/home sections (at `/dashboard`, scroll anchors `#home #about-us #how-to-play #rules`)
1. **Hero** — video/poster, `BATTLE ASIA 2.0` PUBG-style wordmark, APK download CTA, sticky CTA, trust row, gaming HUD/FX.
2. **Live Pulse dashboard** (lazy) — **real admin/DB counts** via `GET /api/v3/public/dashboard` + sockets (joins, total/ongoing matches, charts, top players, live match rails). **Not** `VITE_STAT_*` fake headlines.
3. **Play your game** — PUBG, Free Fire, COD, MLBB, Valorant (coming soon), live counts. **New unique WebP covers** (redesign §1.2), not old art.
4. **About BattleAsia** — story + env-driven stats.
5. **How to play / modes** — Solo, Duo, Squad, TDM.
6. **Tournament rules / FAQ** — accordion (fair-play, match-ops, prizes, payment rules).
7. **Footer + live chat** — **running-site A–Z** (Master §0.3): 3-col footer, all 7 socials, pay chips, partners, support email, Live support relay, **chat FAB** (hover/drag/attach/seed).

### 3.3 After-login features → API (must map exactly)
Play/matches (`v2/games`), Wallet + earn/engagement (`v2/users`, `v2/engagement`, `v4/payments/withdrawal`), in-app shop (`v4/shop`, `v3/shop/orders`) + external BAC store link, Feed/social (`v2/feed`, `v2/social`: stories, reels, DMs with attachments, search, reports), Profile + social graph (follow/block/followers/premium), Referrals, Notifications (poll + socket), Leaderboard, Customer support (tickets/chat), File uploads (`v1/files`), Public live pulse (`v3/public/dashboard`), APK settings. **Player HUD hotkeys:** `BATTLEASIA-REDESIGN-PROMPT.md` §16 (J/C/R/L/M, W/B/T/H, Enter/Tab/F/S, U/Space/Esc).

### 3.4 Design system
- Dark esports/HUD: ink `#060607`/`#0b0b0d`, glass panels `rgba(22,22,24,0.38)`, hairline borders white 8–14%.
- **User-selectable accent** via CSS vars `--ba-gold*` (8 presets: lime default, gold, ember, jade, cyan, violet, rose, sky), persisted `localStorage: ba-accent`, bootstrapped inline before paint.
- Fonts: Public Sans (body), Barlow/Syne (headings), landing display Satoshi/Clash Display/**Teko** (PUBG hero). Default dark MUI theme.

### 3.5 Performance (ship gate — mandatory)
- Lighthouse 90+, LCP < 2.5s, CLS < 0.1, TBT < 150ms.
- All routes `lazy()`+Suspense; below-fold home sections + feed tabs lazy; framer-motion/socket.io/embla **never** on critical path (dynamic import only); NProgress gold top bar; boot `#boot-shell` loader (logo + gold bar, once/session, unified across app); image preload only for hero; `font-display: optional`; manual vendor chunks; lazy-retry on chunk error.

### 3.6 Auth flow + **OTP on the auth page (must be visible)**

JWT; boot re-validates `GET v2/users/me`; sign-in → `loginAction` → redirect `returnTo` (safe `/user/*` or `/dashboard/*`) else `/user/play`; `?ref=` captured to `localStorage: battleasia_ref`.

**OTP must appear on the auth screens — not email-only, not hidden.** Same on **PC web, shop web, and APK**. Copy running `/auth/email-verification` + `/auth/reset-password` + `_ref-auth-zip/auth/email-verification.html`.

| When | What the user **sees** |
|------|-------------------------|
| Sign-up success | Immediately `/auth/email-verification?email=` (APK: Email Verification screen). **6 OTP boxes (or 6-digit code field) are on screen** + “sent to {email}” + timer + Resend + Verify. Never a dead “check your inbox” page with no input. |
| Sign-in, email not verified | Same OTP screen (do not stay on password form). |
| Forgot password | Email submit → `/auth/reset-password?email=` with **OTP field visible** + new password + confirm. |
| Admin login if `ADMIN_LOGIN_OTP=true` | After password, **OTP step shows on the same login page** (6 digits + resend). |

**OTP UI (all clients):**
- 6 numeric cells (or one `maxLength=6` field styled as OTP): `inputmode=numeric`, `autocomplete=one-time-code`, paste fills all cells, auto-advance, auto-submit when complete (optional).
- Countdown (running site: 15 min TTL; Resend disabled until timer ends). Expired/wrong/used → inline error, keep the OTP UI.
- Resend → `POST /api/v2/users/resend-verification-code` `{ email }`. 429 → countdown.
- Verify signup → `POST /api/v2/users/verify-email-signup` `{ email, code }` → session + `/user/play`.
- Reset → `POST /api/v2/users/forgot-password` then `POST /api/v2/users/reset-password` `{ email, code, password }`.
- SMTP HTML email still sends the code. **Production: never print the secret OTP on the page.** Non-prod / `LOG_AUTH_CODES=true`: code in **server logs only**.
- Missing `?email=` → “email missing” + Go to Sign Up (running site).
- Shop: same 5 auth pages + OTP. APK: same OTP screens after splash (no landing).

Password sign-in stays email+password (player is **not** passwordless). OTP is **verify + reset** (+ admin 2FA). Seed 10 face users are already `emailVerified` so they skip OTP; **new** signups always hit the OTP screen.

---

## 4. Shop web (`shop.battleasia.gg`) — **PC shop**

**Desktop shop app** (phone shop is native APK). Same stack/design family as player web (Vite 6 + MUI 6 + Redux Toolkit, persist key **`battleasia-shop`**). Dev port **8082**. Purpose: dedicated **BAC coin store + wallet + transfer + withdraw**. **Entry = shop auth pages.**

- **Routes:** `/auth/*` (full set); protected `/user` (=shop), `/user/shop`, `/user/wallet`, `/user/transfer`, `/user/withdrawal`; 404.
- **Auth model (not seamless SSO):** same account + API as main site, Bearer token + `withCredentials`; **tab-scoped gate** `sessionStorage: ba_shop_gate` set on sign-in; `AuthGuard` forces re-login if gate missing / offline / logged out; isolated persist key; token stripped on rehydrate. `VITE_MAIN_APP_URL` links back to main site.
- **Shop:** coin packs (`v4/shop/items`), rates (`v4/shop/coins`), public channels/wallets; buy = **manual deposit submit** (`v4/payments/deposit-history/submit`) with premium discounts; Coingo PayIn API exists but manual is the active path.
- **Wallet:** total BAC + fiat (BDT/INR/PKR/USD), withdrawable, **transaction history** (`v2/users/balance-history`) enriched with deposit/withdrawal status — this is the de-facto order history (no separate orders page).
- **Transfer:** `v2/users/transfer` (settings/submit/history).
- **Withdrawal:** withdrawable + rates; payout via `v4/payments/coingo/payout` (bKash/Nagad/Crypto) + manual submit.
- Env: `VITE_SERVER_URL`, `VITE_BASE_PATH` (e.g. `/store/`), `VITE_MAIN_APP_URL`.

---

## 5. Admin web (`admin.battleasia.gg`)

**Stack:** Create React App (react-scripts 5) + React 18 + React Router 6 + MUI 5 + MUI X DataGrid 7 + Redux Toolkit + redux-persist + react-hook-form/Yup + Axios (Bearer, `withCredentials`) + socket.io-client + react-quill. Dev port **3000/3001**. Env: `REACT_APP_API_URL`, `REACT_APP_BASENAME`/`PUBLIC_URL` (for `/admin`).

**Auth:** `v3/users/auth/signin` (+ optional OTP step) → JWT; RBAC hides unauthorized nav; `admin` role bypasses checks.

**Sections (all required):**
- **Dashboard** `/dashboard` — overview stats.
- **Users** `/users/{list, role, history, online, premium, referral-settings, transfer-settings, referral-history}` — CRUD, balance adjust, status, RBAC roles/permissions.
- **Games** `/games/{list, matches, matches/:id/result, participants-history}` — game/match CRUD, results.
- **Balance** `/balance/balance-histories` — platform-wide ledger.
- **Payments** `/payments/{wallet, deposit, withdrawal}` — channel + business-wallet CRUD; approve/reject deposits; approve/process/complete withdrawals. Live pending badges via socket.
- **Shop** `/shop/{coinlist, coinrate}` — BAC pack CRUD + fiat rates. (`listOrders` API exists, no page yet.)
- **Notifications** `/notifications` — broadcast/targeted push.
- **Feed** `/feed/{list, categories, profile-social-settings, social-reports, reels-moderation}`.
- **Customer support** `/customer-support/{list, :id, live-chat-settings, messaging-provider-settings}`.
- **Engagement** `/engagement/{missions, badges, settings}`.
- **System** `/system/{mail-settings, app-download}` — SMTP; **APK upload**.
- **Feature flags** — unique modules on/off + rates.
- **Integrity / audit** — ledger, fraud, KYC, fingerprints, reports, disputes, **audit logs**.
- **Profile** `/profile`; **404**.

**Enterprise ops (required):** bulk DataGrid, CSV/Excel/Print, date chips, slug + room generate, payout cap block, receipt lightbox, high-value 2FA, password meter, session revoke, audit page, deposit/withdraw **chime + mute**, **Ctrl+K and Cmd+K**. See redesign §5.1.

---

## 6. Flutter Android app (`battleasia-app`) — **native phone product**

Not a WebView. **No landing.** Splash → Sign In (or Sign Up). Already logged in → Play.

**Stack:** Flutter/Dart (SDK ≥3.8, FVM 3.32.4), `provider` (AuthProvider, AccentProvider), `http` via central `ApiClient` (15s), `socket_io_client`, `cached_network_image`/`image_picker`/`video_player`/`chewie`, `shared_preferences`, `easy_localization` (en/bn/zh/hi/ur), `flutter_dotenv`, `url_launcher`, `intl_phone_field`, `flutter_html`. Fonts: Poppins. Imperative `Navigator` (no go_router). Package `battleasia_app` v1.0.1+2.

**Architecture:** `core/` (config, constants, providers, 10 services, theme, utils) + `data/models/` (28 models) + `presentation/{screens(30), widgets(59)}`. No domain layer.

**Entry:** `main.dart` → SplashScreen → **AuthWrapper** (authed → PlayScreen; **guest → SignInScreen only** — never a Home/landing). Bottom nav after login: **Play, Shop, Referral, Feed**.

**Screens (30) mirror web after-login (not web landing):** auth first for guests; then play/match list/detail/result; **shop with `ShopAuthGate`** + shop footer nav (Shop/Wallet/Transfer/Withdraw) + buy flow; wallet (Overview/Earn/History); feed hub; profile; my-matches/orders/statistics/referrals; referral hub; notifications; leaderboard; customer support. **No marketing Home / landing screen on APK — delete it if present.**

**API config (`core/config/app_config.dart`):** priority `--dart-define=API_BASE_URL` → `--dart-define=SITE_URL` → bundled `.env` → fallback `https://battleasia.gg`. `getImageUrl` maps `/uploads`→`/api/uploads`. Socket to `serverUrl` (events: balance-updated, new-notification, new-message). Mirrors `/api/v2`, `/v3/public`, `/v4/shop`, `/v4/payments`, `/v1/files`.

**Design:** dark Material 3, transparent scaffold; `AppColors` gold `#F5C518`, surface `#161618`, bg `#060607`, placeholder `#9CA3AF`, borders white ~8%; 8 accent palettes persisted `ba-accent`; glass cards + gold buttons; portrait-only, edge-to-edge.

**Android build (`android/app/build.gradle`):** `applicationId net.battleasia.app`, minSdk **24**, target/compileSdk **36**, NDK 28.2, ABIs `arm64-v8a, armeabi-v7a, x86_64`, minify + shrink + ProGuard, multidex, desugaring. **Signing:** reads `android/key.properties` (gitignored) → release keystore `battleasia-release.jks`; if missing, falls back to debug (do NOT ship debug-signed — many devices refuse to install). Manifest perms: INTERNET, CAMERA, READ_MEDIA_IMAGES/VIDEO, legacy READ_EXTERNAL_STORAGE (≤API 32); cleartext for local dev IPs only.

**Release build:** `build-release-apk.ps1` → copies `.env.production`→`.env`, `flutter clean && pub get`, `flutter build apk --release --dart-define=API_BASE_URL=https://battleasia.gg --dart-define=SITE_URL=...`, output `build/app/outputs/flutter-apk/app-release.apk` (~71MB), publishes to `api/uploads/app/BattleAsia.apk`. Live download via Admin → System → App Download.

---

## 7. Infra, deploy & env

**Local dev:** `npm run dev` (root) runs api(5050)+fe(8081)+shop(8082)+admin(3000)+proxy(8080). Browser → `localhost:8080`: `/`→fe, `/store/`→shop, `/admin/`→admin, `/api /uploads /socket.io`→api. MongoDB local `:27017` (or `api/docker-compose.yml`, or embedded memory-server with auto-restore).

**Docker:** `docker-compose.yml` (local dev, nginx :8088, API on host), `docker-compose.prod.yml` (VPS: api+fe+shop+admin+nginx+certbot SSL), `docker-compose.coolify.yml` / `docker-compose.yaml` (Coolify: mongo+api+fe+shop+admin, Traefik SSL, no bundled nginx). Per-app Dockerfiles + nginx SPA configs in `docker/`.

**Coolify (primary prod):** Docker Compose resource from GitHub `battleasiav2/Battleasia` branch `main`, compose path `/docker-compose.yaml`; env vars set in Coolify UI; **git push to `main` → GitHub App webhook → auto rebuild/redeploy** (no GitHub Actions). PC helpers: `deploy/ship.ps1`, `auto-ship-watch.ps1`, `git-push.ps1`.

**Cloudflare (required in prod):**
- SSL **Full (strict)** + WebSockets on.
- **WAF** — managed rules to block known exploits and injection payloads.
- **DDoS** + rate limiting at the edge (before origin).
- **Bot Fight Mode** — challenge headless / scraper traffic.
- **Origin IP masking** — traffic only via Cloudflare/Traefik reverse proxy; origin not published in DNS; firewall allows Cloudflare (and deploy IPs) only.

---

**Env vars (per app):**
- API: `PORT, NODE_ENV, MONGODB_URI, JWT_SECRET*, ADMIN_EMAIL/PASSWORD*/USERNAME, SYNC_ADMIN_PASSWORD, CORS_ORIGINS, COINGO_MOCK, LOG_AUTH_CODES, ADMIN_LOGIN_OTP, APP_URL, CDN_URL, SMTP_*, MAIL_FROM*` (+ `MONGO_DUMP_PATH`, `APP_APK_MAX_MB`, `SENTRY_DSN`, `FCM_SERVER_KEY` / Firebase, `BACKUP_S3_*`).
- Player fe: `VITE_PORT, VITE_SERVER_URL, VITE_BAC_SHOP_URL, VITE_CDN_URL, VITE_SENTRY_DSN`. **Do not use `VITE_STAT_*` for live counters.**
- Shop: `VITE_PORT, VITE_SERVER_URL, VITE_MAIN_APP_URL, VITE_BASE_PATH`, `VITE_SENTRY_DSN`.
- Admin: `PORT, REACT_APP_API_URL, REACT_APP_BASENAME, PUBLIC_URL`, `REACT_APP_SENTRY_DSN`.
- Flutter: `API_BASE_URL, SITE_URL`, Sentry DSN via dart-define or `.env`.
- Coolify required: `JWT_SECRET`, `ADMIN_PASSWORD` (compose fails without).

**Backups/seed:** `npm run backup:mongo` (mongodump → `backups/`, keeps 7) **plus encrypted off-site daily copy** (§2.9); restore via `api npm run restore-db` or embedded auto-restore; `deploy/seed-all.sh` (`npm run seed:server`) runs seed→games→dashboard→feed→social→demo. Demo logins: admin from env; `player@battleasia.local / Player@123456`.

---

## 8. Non-negotiable rules (apply throughout)
1. **BAC is the single currency** on `User.balance`; every change writes `BalanceHistory`.
2. **Deposits are admin-reviewed** (submit → approve) unless Coingo auto.
3. **Web (PC) ↔ APK (native) feature parity:** every auth / shop / after-login **flow** exists on both. Layout is **platform-native**. **Landing is PC-only.** APK has **no** home/landing — first screen after splash is Sign In.
4. **Performance first:** hit the Lighthouse gate; heavy libs dynamic-imported; no CLS; WebP/AVIF images.
5. **Secrets server-side / gitignored:** `.env*`, `key.properties`, `*.jks`, `deploy/.github-token.local`, `backups/`. Never commit them.
6. **Ship APK signed with the real release keystore** (never debug) so every device can install and future updates keep the same signature.
7. Accent color is user-selectable across web + APK; dark gaming aesthetic everywhere.
8. **Every feature is admin on/off toggleable** — each module has an enable flag in `AppSettings` (global config, same pattern as engagement/transfer/messaging settings), surfaced in the Admin panel as feature flags, with admin-tunable rates/fees/limits. Clients hide the UI **and** the API blocks a feature when it is OFF. New unique/earn features (see `BATTLEASIA-REDESIGN-PROMPT.md` §11: live gifting, watch-to-earn, prediction/fantasy, 1v1 wager, clans, customization store, etc.) all follow this rule and default OFF until ready.
9. **Every screen has loading / empty / error / success** plus the micro-interactions and edge cases in `BATTLEASIA-REDESIGN-PROMPT.md` §12 (auth, play, money, social, admin, HTTP). No double-submit on money; optimistic social with rollback; human i18n errors, never raw API dumps.
10. **Production quality bar** in `BATTLEASIA-REDESIGN-PROMPT.md` §13 is mandatory for a 100% ready rebuild: form trim/sanitize, first-error focus, dirty/unsaved, password toggle, masks/counters, error boundaries, 404s, timeouts, graceful degradation, offline/reconnect, token refresh + interceptors, OTP countdown, data masking, Remember Me (no JWT in localStorage), RBAC, skeletons/empty/toasts/copy, ACID + locks + idempotency, lazy routes, WebP/AVIF, debounced search.
11. **Security hardening** in this file §2.7–2.8 and `BATTLEASIA-REDESIGN-PROMPT.md` §14 is mandatory: `session.withTransaction()`, server-side balance re-fetch, double-spend constraints, idempotency keys, high-value withdraw review, rate-limit, mongo-sanitize, XSS + helmet, CORS whitelist, HttpOnly Secure cookies, `tokenVersion` JWT kill, bcryptjs, admin 2FA/OTP, room secrets participant-only, server-authoritative results, magic-byte uploads + no execute + quotas, Cloudflare WAF / DDoS / Bot Fight / origin masking.
12. **Ledger, fraud, scale, DR, tests** in this file §2.9 and `BATTLEASIA-REDESIGN-PROMPT.md` §15: double-entry + **no delete / reversal only**, liability vs reserve monitor, velocity holds, device fingerprint / multi-account, collusion reports, KYC+age before withdraw (flagged), compound indexes, mongoose pool, live-stats cache, encrypted off-site backups, maintenance countdown, dispute evidence, automated money tests.
13. **Player HUD keyboard shortcuts** in `BATTLEASIA-REDESIGN-PROMPT.md` §16: **J** quick-join, **C** copy room, **R** ready, **L** leave/refund-before-start, **M** match details, **W** wallet, **B** buy BAC, **T** transfer, **H** hide balance, **Enter** chat, **Tab** leaderboard (not in inputs), **F** follow/like, **S** share match, **U** mute, **Space** reel/live pause, **Esc** close overlays. APK = same actions as buttons.
14. **Locked visual system** in `BATTLEASIA-REDESIGN-PROMPT.md` §17: 8pt spacing only (4/8/16/24/32), radius scale, `--ba-accent` trio before first paint, 5 component states, mobile bottom sheets, 44px targets, safe-area, glass+aurora, IG stories/carousel/heart/chat bubbles, Copied chip + BAC(fiat) + receipt lightbox, Lighthouse 90+ / LCP / TBT, dynamic heavy libs, WebP/AVIF.
15. **Two player clients:** **PC Web starts on landing**; **APK starts on auth only** (no APK landing). See `BATTLEASIA-REDESIGN-PROMPT.md` §0.1.
16. **Fill the remaining gaps:** Aurora brief locked (redesign §1); admin enterprise (redesign §5.1); Ready/Leave/lobby-chat + JSON contracts (this file §2.10); FCM + Sentry + email templates + SEO + i18n namespaces (§2.11); ship **P0 before P1/P2** (redesign §18).
17. **No Figma:** buttons/icons/logo from the code kit; **5 new high-quality game WebPs** (PUBG first) plus generate any other needed art; **fast-load caps** (`BATTLEASIA-REDESIGN-PROMPT.md` §1.1–1.2). Do not wait for a designer. Do not reuse old screenshots.
18. **Landing KPIs are live:** join/total/ongoing matches, charts, per-game counts = `GET /api/v3/public/dashboard` (same DB as admin). No fake `VITE_STAT_*` on those tiles.
19. **10 seed face users** are real `User` docs (Admin can see them). They only “fill” landing/leaderboard/feed via the API — never fake faces in the frontend only.

---

## 9. What this prompt does NOT contain (hand these over separately)
Taking "everything" still leaves these outside the text prompt — provide them alongside:
- **New brand assets** (logo, wordmark, hero media, game art, fonts, favicon, app icon) — **AI/code generated** per redesign §1.1 if the operator does not hand over art. Fonts: self-hosted open/licensed WOFF2 (Clash/Inter/etc.), not a designer pack.
- **Secrets & keystore:** real `.env` values, `JWT_SECRET`, admin password, SMTP creds, `battleasia-release.jks` + `key.properties` (password), GitHub token. (Gitignored — lose the keystore = can't update the APK.)
- **Database content:** the Mongo dump/`backups/` seed data (users, matches, settings) — code seeds structure, not your live data.
- **Exact i18n copy** for marketing paragraphs beyond locale namespaces in §2.11 (en/bn/zh/hi/ur JSON still must cover auth/play/wallet/errors).
- **Third-party accounts:** domain/Cloudflare, Coolify server, Coingo gateway credentials, mail provider.

Everything else — architecture, all 52 models, every route, every screen, flows, realtime, infra, build — is captured above.
