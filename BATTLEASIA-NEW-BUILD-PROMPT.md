# BattleAsia — Single New-Build Prompt

> **This is the only prompt file.** Paste this whole document to rebuild BattleAsia **from scratch with a new look**. It contains **everything**: product, API, player web, shop, admin (including enterprise ops), Flutter APK, Instagram-style social, unique extra-earn + flags, Aurora Arena design, infra, env, polish, and checklists. There are **no companion prompt files**.

---

## 0. Mission

Rebuild **BattleAsia** as a **new visual product** with the **same (and expanded) product**.

A **mobile-esports tournament platform** (PUBG, Free Fire, COD, MLBB, Valorant). Players join paid matches, win in-app coin **BAC**, cash out, socialize (Instagram-style feed), earn extra (create / watch / predict / refer), and admins run everything. Four clients, **one API**.

| Keep exactly | Invent new |
|--------------|------------|
| All features, money flows, models, routes, auth, sockets | Colors, type, layout, hero, motion, art |
| Shop as a **separate app** | Brand wordmark / logo |
| Web ↔ APK parity (auth / shop / after-login) | Empty / loading / error / success treatments |
| Lighthouse 90+, LCP < 2.5s, CLS < 0.1, TBT < 150ms | Nav chrome (all destinations still reachable) |
| Release-keystore APK signing | Light + dark, accent presets |

**Rule:** a player of the old app must find **every feature** in the new one — plus the social, extra-earn, and admin-ops listed here. Redesign = new skin + new layout, **not** lost scope.

---

## 1. Design brief (locked for this rebuild)

**Direction: Aurora Arena** — premium esports × modern fintech. Clean, high-contrast, international-legible. **Not** a gold-glass PUBG clone.

- **Vibe:** confident, airy, expensive — not neon overload.
- **Dark base:** `#0E0F14` (indigo-charcoal, not pure black). Surfaces `#171922`. Hairline border `white @ 8%`. Text `#F4F5F7` / muted `#A0A4B8`.
- **Light base (REQUIRED toggle):** `#F7F8FB` page, `#FFFFFF` cards, ink `#12131A`, soft gray borders `#E6E8EF`.
- **Signature accent:** violet → cyan gradient `#7C5CFF → #21D4FD` on CTAs, active tabs, live/stat highlights only. Status: success `#28E0A0`, danger `#FF5C7A`, warning `#FFC24B`.
- **Accent switcher (REQUIRED):** 8 user presets (lime, gold, ember, jade, cyan, violet, rose, sky — restyle to the new brand). CSS vars, persist `ba-accent` (web `localStorage`, APK `SharedPreferences`), bootstrap **before first paint** (no color flash). Picker in header, logged-out and logged-in, web + APK.
- **Type:** geometric display (Space Grotesk / Clash Display) + clean body (Inter / General Sans). Self-hosted WOFF2, `font-display: optional`. Tabular numerals for money/stats. Gradient text on one key word/number. Tight tracking on big headlines.
- **Shape:** 16–20px radius, **flat luminous cards** (not heavy glass except sticky nav), 8pt grid, one shadow-tier scale.
- **Motif:** hex / angular shield on dividers, progress, live dots, game frames.
- **Motion:** count-up, progress fill, hover lift, button shimmer, skeleton shimmer, win burst — all **off LCP path** (dynamic import).
- **Hero:** new `BATTLE ASIA 2.0` wordmark; 3D/parallax character or layered photo; optional short video behind poster.
- **Game art:** 5 unique covers, hex-framed icons, consistent duotone overlay (not random screenshots). Rank badges Bronze → Elite.

**Premium polish (mandatory):** aurora mesh glow behind hero/key cards; glass sticky nav; grain; empty-state illustrations; bento-grid landing; LIVE pulse; season-pass ring. Full list in §14.

### 1.1 Shared design system (all apps)

One token set so web, shop, admin, and APK feel like one product:

- **Tokens:** color roles, spacing scale, radii, shadows/borders, typography scale, z-index, breakpoints.
- **Core components:** button (primary / secondary / ghost / danger, loading, disabled), input / select / textarea / phone / OTP, checkbox / switch / radio, card / surface, modal / dialog / bottom-sheet, drawer, tabs, table / data-grid, chip / badge, avatar, tooltip, accordion, carousel, pagination, breadcrumb.
- **App shell:** top header (logo, balance pill, notifications, account, language, accent), primary nav, footer / bottom-nav, page shell / container.
- **States (design ALL):** loading skeletons, empty states, error states, success / confirmation, toasts, inline validation, offline banner.
- **Data viz:** stat tiles, live counters, progress bars, leaderboards, charts.
- **Brand loader:** one light boot/splash loader across every page/session (logo + thin bar, no percent spam).

---

## 2. Architecture / monorepo

```
battleasianew/
├── api/                  Node + Express + TypeScript (ESM) + MongoDB (Mongoose) + Socket.IO   :5050
├── battleasia.gg/        Player web — React 18 + Vite 6 + MUI 6 + Redux Toolkit               :8081
├── shop.battleasia.gg/   Coin shop — SAME stack, SEPARATE app + login gate                     :8082
├── admin.battleasia.gg/  Admin — CRA (react-scripts 5) + React 18 + MUI 5 + MUI X DataGrid    :3000/3001
├── battleasia-app/       Flutter/Dart Android app (native, same API)
├── docker/               Dockerfiles + nginx configs (dev + prod)
├── deploy/               Coolify / Hostinger / VPS scripts + Bengali guides
├── local-dev/proxy.mjs   Unified single-domain dev proxy                                      :8080
├── backups/              MongoDB dumps (gitignored)
├── docker-compose.yml            local docker dev (fe+shop+admin+nginx, API on host)
├── docker-compose.prod.yml       manual VPS (api+fe+shop+admin+nginx+certbot)
├── docker-compose.coolify.yml    Coolify prod (mongo+api+fe+shop+admin, Traefik SSL)
└── docker-compose.yaml           alias of coolify compose (Coolify default path)
```

**Live (Coolify + Cloudflare):**

- `https://battleasia.gg/` → player web
- `https://shop.battleasia.gg/` → shop web
- `https://admin.battleasia.gg/` → admin web
- `https://battleasia.gg/api/*`, `/uploads/*`, `/socket.io/*` → API (path prefix, not a subdomain)

Player web: React Router 7, redux-persist (**strip token on write**), RHF + zod, Axios Bearer, i18next **en / bn / zh / hi / ur**, Tailwind preflight off. Proxy `/api /uploads /socket.io` → API.

Shop persist key **`battleasia-shop`** (isolated). Admin: JWT `v3` auth + optional OTP; RBAC hides nav; `admin` bypasses.

APK: Flutter SDK ≥ 3.8, `provider`, `http` / `ApiClient`, sockets, SharedPreferences, easy_localization. `applicationId net.battleasia.app`, minSdk 24, target 36, ABIs `arm64-v8a, armeabi-v7a, x86_64`. **Release keystore only** (`key.properties` + `.jks`, gitignored). Build: `build-release-apk.ps1` → `api/uploads/app/BattleAsia.apk`.

---

## 3. Backend API (`api/`)

**Stack:** TypeScript (ESM), Express 4, Mongoose 8, MongoDB, Socket.IO 4, JWT (`jsonwebtoken`, 7-day), `bcryptjs`, `multer` uploads (local disk `api/uploads/`), `nodemailer`, `helmet` / `cors` / `rate-limit` / `compression` / `cookie-parser`. Dev fallback: `mongodb-memory-server` with auto-restore from a backup dump when the DB is empty.

**Route versioning** (all under `/api`; the app rewrites `/vN/...` → `/api/vN/...` when a proxy strips `/api`):

- `v1` → file uploads
- `v2` → player-facing (web + APK)
- `v3` → admin auth + admin CRUD + some public / shared
- `v4` → shop + payments

### 3.1 Auth & roles

- Stateless **JWT**; token via `Authorization: Bearer` OR httpOnly cookie (`battleasia_token` for players, `webet_token` for admin). Admin sign-in also writes `Session` + `LoginHistory`.
- Optional admin **email OTP** (`ADMIN_LOGIN_OTP=true`).
- Roles: `admin`, `official`, `agent` (all pass admin gate), `player`. 26 granular permission keys exist for UI RBAC, but API gate is role-type based (`requireAdmin`).
- Rate limit: 100 req / 15 min on auth paths.

### 3.2 Data models (52 collections — must all exist, plus new as needed)

- **Users / auth:** `User` (email, username, password, status, avatar, cover, bio, **`balance` BAC**, embedded `role`{type, permissions}, `roleRef`, `pubgId`, `gameServer`, `referralCode`, `referredBy`, `emailVerified`, premium fields, `privacy`), `Role`, `Session`, `LoginHistory`, `VerificationCode`, **`AuditLog`**.
- **Games / matches:** `Game`, `Match` (gameId, gameMode classic / tdm, roomId / password, schedule, entryFee, totalPlayer, teamType, perKill, map, banner, premiumOnly, platformFeePercent, status, results[], winningsDistributed, entriesRefunded), `MatchParticipant`.
- **Wallet / payments (BAC):** `BalanceHistory`, `DepositHistory`, `WithdrawalHistory`, `PaymentChannel`, `BusinessWallet`, `CoinRate` (global / bangladesh / india / pakistan), `CoingoTransaction`, `ShopItem`, `ShopOrder`, `UserTransferHistory`, `ReferralHistory`.
- **Social / feed:** `Feed`, `FeedCategory`, `FeedLike`, `FeedComment`, `SavedPost`, `Reel`, `Story` (TTL expiry), `Follow`, `UserBlock`, `DirectConversation`, `DirectMessage`, `SocialReport`.
- **Notifications / support:** `Notification`, `NotificationRead`, `SupportConversation`, `SupportMessage`.
- **Engagement (gamification):** `EngagementMission`, `EngagementBadge`, `UserEngagementProgress`, `UserEngagementBadge`, `UserEngagementLevel`, `UserEngagementStreak`, `UserEngagementWelcome`, `UserEngagementReferral`, `UserEngagementWeekly`, `UserEngagementSeason`, `UserEngagementSpin`, `UserEngagementShare`, `UserEngagementSquad`, `EngagementSquad`, `EngagementSquadWeekly`, `EngagementSquadWeeklyClaim`.
- **Config:** `AppSettings` (single `key:'global'` doc: premium price / duration, commissionRate, transferSettings, liveChat, messaging, profileSocial, mail, appDownload, full engagement config, **feature flags** for every unique module).

### 3.3 Endpoint groups (must all be present)

- **`/api/v1/files`** — `POST /upload/:folder`, `/upload/:folder/multi`, `DELETE /` (5MB default, 100MB reels / stories).
- **`/api/v2/users`** — signup, signin, logout; email verify (send / verify / verify-signup / resend); password reset (forgot / verify-code / reset); `GET/PUT /me`; leaderboard; withdrawable-amount; balance-history; referrals + settings + stats + commissions; premium details / activate; match history; follow / unfollow / block / followers / following / suggested / mutual.
- **`/api/v2/users/transfer`** — settings, P2P transfer, history.
- **`/api/v2/games`** — games list; matches list / detail / result / room; check-join; join; history (me + by user).
- **`/api/v2/feed`** — categories, list, create, explore, saved, comments, like, save, view, by-user.
- **`/api/v2/social`** — stories CRUD / view; reels CRUD / view (+ admin); reports; DM conversations / messages; user search; messaging + profile-social settings.
- **`/api/v2/engagement`** — home, badges, alerts; claim missions / streak / welcome / referral / weekly / squad / share / spin / season.
- **`/api/v2/notifications`** — list, mark read, read-all.
- **`/api/v2/customer-support`** — conversation CRUD, tickets, messages, live-chat settings.
- **`/api/v2/app-settings`** — mail settings (admin); APK download config + upload.
- **`/api/v3/users/auth`** — admin signin, verify-otp, logout, me, profile.
- **`/api/v3/users/{list, roles, permissions, histories, sessions, premium, referral-settings, transfer-settings, referral-history}`** — admin user management + RBAC.
- **`/api/v3/dashboard`** (admin stats) + **`/api/v3/public/dashboard`** (cached public live stats).
- **`/api/v3/games/{list, matches, participants-history}`** — admin game / match CRUD, results, distribute winnings, refunds.
- **`/api/v3/feed/{list, categories}`**, **`/api/v3/engagement/{missions, badges, settings}`**, **`/api/v3/notifications`** (broadcast).
- **`/api/v3/shop/orders`** (checkout, me), **`/api/v3/shop/coins`** (public rates + legacy Coingo payout).
- **`/api/v3/audit-logs`** — list / filter / export audit trail.
- **`/api/v4/payments`** — `balance-histories`, `payment-channels` (+ public), `business-wallets` (+ public), `deposit-history` (submit / my-history / approve / reject / stats / pending + **bulk**), `withdrawal-history` (submit / my-history / approve / complete / reject / stats + **bulk**), `coingo` (collection start + status, payout + status).
- **`/api/v4/shop`** — `items` (list / get + admin CRUD), `coins` (rates + admin CRUD), `orders` (admin list).
- **Additive admin (new, do not break existing contracts):** bulk user status, bulk feed hide / delete, `DELETE /api/v3/users/sessions/:sessionId`, `POST /api/v3/users/auth/verify-password`.
- **`/health`, `/ready`, `/uploads/*`** (serves images + `uploads/app/BattleAsia.apk`).

### 3.4 Money flows (critical logic)

- **Deposit (manual):** player picks channel (bKash / Nagad / crypto) → gets business-wallet address / QR → submits proof (`deposit-history/submit`) → admin approves → credits BAC + `BalanceHistory` + referral commission + welcome / deposit bonuses + socket events. **Alt:** Coingo gateway (auto in mock).
- **Withdrawal:** check withdrawable (**70% of match-bet BAC** rule) → submit → admin approve → processing → complete / reject.
- **Match economy:** join deducts entry fee; admin distributes winnings / refunds from v3 match admin. **UI must block payout if distributed > collected fees.**
- **P2P transfer:** fee% + min / max from `AppSettings.transferSettings`.
- **Coin rates:** per region; shop packs have fiat price + `paymentOptions` (bKash / Nagad / crypto).

### 3.5 Realtime (Socket.IO, path `/socket.io`, JWT in handshake)

- Rooms: `user:{id}` (auto), `admin-room`, `game:{id}`, `conversation:{id}`.
- Client → server: `join-admin-room`, `join-game`, `join-conversation`, `typing`, and leaves.
- Server → client: `pending-deposits-count`, `pending-withdrawals-count`, `new-deposit`, `new-withdrawal`, `new-notification`, `new-message`, `balance-updated`, `user-stats-updated`, `match-created`, `match-updated`, `dashboard-stats-updated`, `user-typing`.
- Extend for social live / like / follow as those modules ship.

### 3.6 Services & seeding

- Email (SMTP or `AppSettings.mail`), Coingo gateway, disk uploads, APK distribution, in-memory cache for public dashboard, referral engine, engagement engine. **No cron / background workers** — side effects run inline.
- Seed (`npm run seed`): roles, admin + sample player, 5 platform games, AppSettings, bKash / Nagad channels + wallet, coin rates, 14 BAC packs, sample deposit / withdrawal / feed / notification / support. Partial seeds: games / dashboard / feed / social / demo. Auto-restore from `backups/…/mongo/battleasia` when embedded Mongo starts empty.
- Demo: `player@battleasia.local / Player@123456`. Admin from env.

---

## 4. Player web (`battleasia.gg`)

**Stack:** React 18 + TS + Vite 6 (SWC), React Router 7, MUI 6, Redux Toolkit + redux-persist (auth persisted, **token stripped** on write), react-hook-form + zod, Axios (Bearer + toast interceptors, 401 → logout, 403 → email-verify), socket.io-client (dynamic import), i18next (en / bn / zh / hi / ur), Tailwind (preflight off) + Emotion. Dev port **8081**; proxies `/api`, `/uploads`, `/socket.io` → `VITE_SERVER_URL` (default `:5050`).

### 4.1 Routes

- **Public:** `/` → `/dashboard` (landing / home), `/privacy-policy`, `/terms-and-conditions`, `/profile/:userId` (public profile), `/support`.
- **Auth (unguarded):** `/auth/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`, `/email-verification`.
- **Protected (`AuthGuard` + `UserLayout`, all `/user/*`):**
  - `play`, `play/:gameId`, `play/:matchId/detail`, `play/:matchId/result`
  - `shop`, `shop/wallet` (BAC hub; heavy shop links out to `VITE_BAC_SHOP_URL`)
  - `referral`
  - `feed`, `feed/:id`; `explore | saved | reels | messages` redirect to feed `?tab=`
  - `account/{profile, profile/:userId, wallet, my-matches, my-orders, my-statistics, my-referrals, notifications, leader-board, customer-support}`

Default after login: `/user/play`. JWT; boot re-validates `GET v2/users/me`; sign-in → `loginAction` → redirect `returnTo` (safe `/user/*` or `/dashboard/*`) else `/user/play`; email-verify + password-reset; `?ref=` captured to `localStorage: battleasia_ref`.

### 4.2 Landing / home (`/dashboard`)

New art, same jobs. Anchors `#home #about-us #how-to-play #rules`:

1. **Hero** — brand wordmark, primary CTA (Enter Arena), **APK download** CTA, trust signals. (New Aurora look; do **not** clone old Teko / gold-glass PUBG hero.)
2. **Live pulse** — live stats, top players, high-prize / ongoing matches (public API + socket).
3. **Play your game** — PUBG, Free Fire, COD, MLBB, Valorant (coming soon) with live counts.
4. **About** — story + env-driven stats.
5. **How to play / modes** — Solo, Duo, Squad, TDM.
6. **Rules / FAQ** — accordion (fair-play, match-ops, prizes, payment rules).
7. **Footer** — partners, socials, **payment chips** (bKash / Nagad / crypto), legal links.

### 4.3 After-login features → API (must map exactly)

Play / matches (`v2/games`), Wallet + earn / engagement (`v2/users`, `v2/engagement`, `v4/payments/withdrawal`), in-app shop (`v4/shop`, `v3/shop/orders`) + external BAC store link, Feed / social (`v2/feed`, `v2/social`: stories, reels, DMs with attachments, search, reports), Profile + social graph (follow / block / followers / premium), Referrals, Notifications (poll + socket), Leaderboard, Customer support (tickets / chat), File uploads (`v1/files`), Public live pulse (`v3/public/dashboard`), APK settings.

**Play UX:** game picker → match list (per game) → match detail + join → match result. Show entry fee, prize, spots progress, room ID / password after join. PUBG is game #1.

### 4.4 Performance (ship gate — mandatory)

- Lighthouse 90+, LCP < 2.5s, CLS < 0.1, TBT < 150ms.
- All routes `lazy()` + Suspense; below-fold home sections + feed tabs lazy; framer-motion / socket.io / embla / Three.js **never** on critical path (dynamic import only); NProgress-style thin top bar; boot `#boot-shell` loader (logo + bar, once / session, unified across app); image preload only for hero; `font-display: optional`; manual vendor chunks; lazy-retry on chunk error.
- Images: WebP / AVIF, fixed dimensions or aspect-ratio, lazy except LCP hero. Mobile-first; reserve space (no CLS).

---

## 5. Instagram-style social (web + APK, full parity)

The whole social area must **look and behave like Instagram**, adapted for a gaming / esports brand. Same familiar patterns players already know. Lives **inside Feed**; main app nav stays **Play / Shop / Referral / Feed**.

### 5.1 Layout & navigation

- **Home feed:** vertical scroll of posts; **stories tray** pinned at the top.
- Mobile bottom tabs (IG-style): **Home · Explore / Search · Create (＋) · Reels · Profile**; a **DM / inbox icon** top-right of the feed.
- Desktop: centered feed column + right rail (suggested players to follow, trending).

### 5.2 Posts

- Image / video posts, multi-image **carousel** (swipe dots), caption with **#hashtags** and **@mentions**.
- Actions: **like (double-tap + heart), comment, share / send, save / bookmark**; like count, view count.
- Comments: threaded replies, @mentions, emoji, like-a-comment.
- Post detail page; report / hide / mute; edit / delete own post.

### 5.3 Stories

- Circular avatars with gradient ring; tap = full-screen 5s auto-advance, tap to skip, hold to pause, swipe for next user.
- Create: photo / video, **text + stickers**, **poll / quiz sticker**; **reply to a story via DM**; **story reactions**; viewers list; auto-expire (24h); optional **highlights** pinned on profile.

### 5.4 Reels

- Full-screen vertical swipe player; like / comment / share / save; caption + hashtags; creator follow button; view tracking.
- Create: upload / record video, cover pick, caption; optional music / sound label.

### 5.5 Live (P2)

- Players can **go live**; viewers join, see live viewer count, send live chat comments and reactions (hearts). Host can end; optionally save the replay as a reel.
- A **LIVE** ring / badge on the creator's story avatar while live; "LIVE" section in Explore.

### 5.6 Direct Messages

- Inbox list, 1:1 **and group / squad chats**; text, **media / attachments**, emoji, message reactions, reply-to-message, read receipts, typing indicator (realtime socket).
- **New message** (user search), **message requests** (spam control), share a post / reel / profile into DM, online presence dot, block / report / mute.

### 5.7 Profiles

- Avatar, username + **verified badge**, bio, links, **stats row: posts / followers / following** (+ gaming stats: matches, wins, rank / tier).
- **Follow / Message** buttons; **grid of posts** (tabs: Posts · Reels · Tagged); story **highlights** row; pinned posts.
- Public profile at `/profile/:userId`; own profile editable.

### 5.8 Discovery

- **Explore / Search:** search users / hashtags; grid of trending posts / reels; suggested creators; follow topics / games.

### 5.9 Esports flavor

- **Match highlight / clip** posts; **victory auto-post** ("Won 2000 BAC 🏆" — tie to match / wallet); **achievement / badge / streak** share; game-tagged posts and per-game feed filter.

**Realtime:** new post / like / comment / follow / DM / live events via socket; social notifications (likes, comments, follows, mentions, DMs).

### 5.10 Build order (nothing lost)

**P0 — core IG parity (ship first, mostly existing API + UI):**

- Feed with posts (image / video, multi-image carousel), like / comment / save / share, threaded comments, @mention, #hashtag.
- Stories (create / view, text + stickers, viewers, 24h expire, reply-via-DM, reactions).
- Reels (vertical player + create).
- DMs (1:1, media attachments, read receipts, typing, block / report, new-message search).
- IG-style profile (avatar, verified, posts / followers / following stats, post grid, Follow / Message).
- Explore / search (users, hashtags, trending grid, suggested creators).
- Reactions beyond like (🔥 GG 👏), save collections / folders, hashtag pages, nice empty / loading states.

**P1 — esports differentiators:**

- Match highlight / clip posts; victory auto-post tied to match / wallet.
- Achievement / badge / streak share; game-tagged posts + per-game feed filter; **tournament feed** ("following your games").
- Story poll / quiz stickers; story highlights pinned on profile; pinned posts.
- Group / squad chat; share a post / reel / profile into DM; message reactions + reply-to-message; online presence dot; message requests.

**P2 — bigger (new backend, later):**

- Live (go-live, live chat + heart reactions, viewer count, LIVE ring, save replay as reel) + **watch party** for live matches.
- **"For You"** ranked feed; **top creators leaderboard**.
- **Voice notes** in DM; media gallery per chat; keyword filter / mute words.
- External share (WhatsApp / Telegram) + deep links; duet / stitch-lite for reels; music / sounds library.

---

## 6. Shop web — SEPARATE APP (`shop.battleasia.gg`)

**This is a SEPARATE app** on its own subdomain. Own codebase, own persist, **tab-scoped login** (`sessionStorage: ba_shop_gate`). **Not** a page on the main site. Same account / API. Main site links via `VITE_BAC_SHOP_URL`. `VITE_MAIN_APP_URL` back to player.

Same stack / design family as player web (Vite 6 + MUI 6 + Redux Toolkit, persist key **`battleasia-shop`**). Dev port **8082**.

- **Routes:** `/auth/*` (full set); protected `/user` (= shop), `/user/shop`, `/user/wallet`, `/user/transfer`, `/user/withdrawal`; 404.
- **Auth model (not seamless SSO):** same account + API as main site, Bearer token + `withCredentials`; **tab-scoped gate** `sessionStorage: ba_shop_gate` set on sign-in; `AuthGuard` forces re-login if gate missing / offline / logged out; isolated persist key; token stripped on rehydrate. Do **not** call sign-out on the main API just because the shop tab lost its gate.
- **Shop:** coin packs (`v4/shop/items`), rates (`v4/shop/coins`), public channels / wallets; buy = **manual deposit submit** (`v4/payments/deposit-history/submit`) with premium discounts; Coingo PayIn API exists but manual is the active path. Waiting-for-admin-approval state after submit.
- **Wallet:** total BAC + fiat (BDT / INR / PKR / USD), withdrawable, **transaction history** (`v2/users/balance-history`) enriched with deposit / withdrawal status — this is the de-facto order history (no separate orders page).
- **Transfer:** `v2/users/transfer` (settings / submit / history) — recipient, amount, fee, note.
- **Withdrawal:** withdrawable + rates; payout via `v4/payments/coingo/payout` (bKash / Nagad / Crypto) + manual submit.
- Env: `VITE_SERVER_URL`, `VITE_BASE_PATH` (e.g. `/store/`), `VITE_MAIN_APP_URL`.

---

## 7. Admin web (`admin.battleasia.gg`) — ops + enterprise

**Stack:** Create React App (react-scripts 5) + React 18 + React Router 6 + MUI 5 + MUI X DataGrid 7 + Redux Toolkit + redux-persist + react-hook-form / Yup + Axios (Bearer, `withCredentials`) + socket.io-client + react-quill. Dev port **3000 / 3001**. Env: `REACT_APP_API_URL`, `REACT_APP_BASENAME` / `PUBLIC_URL` (for `/admin`).

**Auth:** `v3/users/auth/signin` (+ optional OTP step) → JWT; RBAC hides unauthorized nav; `admin` role bypasses checks.

**Every section is required, new Aurora look, enterprise table / ops included in this rebuild (not a later add-on):**

- **Dashboard** `/dashboard` — overview stats.
- **Users** `/users/{list, role, history, online, premium, referral-settings, transfer-settings, referral-history}` — CRUD, balance adjust, status, RBAC roles / permissions.
- **Games** `/games/{list, matches, matches/:id/result, participants-history}` — game / match CRUD, results.
- **Balance** `/balance/balance-histories` — platform-wide ledger.
- **Payments** `/payments/{wallet, deposit, withdrawal}` — channel + business-wallet CRUD; approve / reject deposits; approve / process / complete withdrawals. Live pending badges via socket.
- **Shop** `/shop/{coinlist, coinrate}` — BAC pack CRUD + fiat rates. (`listOrders` API exists, add the page.)
- **Notifications** `/notifications` — broadcast / targeted push.
- **Feed** `/feed/{list, categories, profile-social-settings, social-reports, reels-moderation}`.
- **Customer support** `/customer-support/{list, :id, live-chat-settings, messaging-provider-settings}`.
- **Engagement** `/engagement/{missions, badges, settings}`.
- **Feature flags** — on / off + rates / fees / caps for **every unique module**.
- **System** `/system/{mail-settings, app-download}` — SMTP config; **APK upload** + version + enable / disable download (`v2/app-settings/app-download/upload`).
- **Audit logs** — who, action, target, IP, time; filter / export.
- **Profile** `/profile`; **404**.

### 7.1 Enterprise utilities (all list views: Users, Matches, Deposits, Withdrawals, Feed, Balance)

1. **Multi-selection & checkbox controls**
   - Header `Select All` for the current page **or** the entire filtered dataset.
   - Dynamic floating action toolbar when 1+ rows are selected.
2. **Bulk actions**
   - **Deposits / Withdrawals:** `Bulk Approve` and `Bulk Reject` (reject requires a reason dialog).
   - **Users:** `Bulk Ban / Suspend` and `Bulk Status Toggle` (Active / Inactive).
   - **Feed posts / Reels:** `Bulk Delete / Hide` for spam moderation.
3. **Export & print-ready views**
   - `Export to CSV` and `Export to Excel (.xlsx / .xls)`.
   - Dedicated `Print` button using CSS `@media print` — hide admin sidebar, navbars, and action buttons; render a clean branded ledger / receipt page.
4. **Advanced filters & date-range picker**
   - Quick filters: **Today**, **Yesterday**, **Last 7 Days**, **This Month**, plus custom date-time range.
   - Column visibility toggle and density switcher (Compact / Standard / Comfortable).
5. **Form utilities**
   - Game and Match create forms: **auto SEO slug** from title (e.g. `PUBG Mobile Squad Tournament` → `pubg-mobile-squad-tournament`), with **manual override**.
   - “Generate Random” next to Match **Room ID** and **Room Password**.
6. **Live payout & fee preview**
   - On match results / winnings distribution, live preview of: gross prize pool, platform fee %, net BAC per winner / kill.
   - **Block submit** if distributed total exceeds collected entry fees.
7. **Receipt image lightbox & zoom**
   - Manual deposit verification: click screenshot → high-res modal with zoom in / out, pan, 90° rotate.
   - One-click copy of **TrxID** and **phone / from address** with “Copied!” feedback.
8. **Double confirmation on high-value operations**
   - Withdrawal approval or manual balance adjust **above threshold (default 1,000 BAC)** must open a confirm modal requiring **admin password** (or 2FA if enabled) before the API call.
9. **Password change with strength meter** (`/profile`)
   - Current password required. New password visual strength meter (uppercase, lowercase, numbers, special chars, min length).
10. **Active sessions & remote logout**
    - List current sessions: device / OS, IP, last active.
    - Terminate one session **or** “Logout from all other devices”.
11. **Audit logs (activity tracking)**
    - Central tracker: who, target entity ID, action type (`BALANCE_ADJUST`, `MATCH_RESULT_SUBMIT`, `USER_BAN`, `DEPOSIT_APPROVE` / `REJECT`, `WITHDRAWAL_APPROVE` / `COMPLETE` / `REJECT`, `USER_STATUS_TOGGLE`, …), IP, timestamp.
    - Admin page to filter / search / export these logs.
12. **Realtime audio chime for pending queues**
    - Socket.IO: `new-deposit`, `new-withdrawal`. Subtle professional chime; **mute toggle in the top bar**.
13. **Command palette / keyboard shortcuts**
    - Global **Ctrl+K and Cmd+K** to jump to any section, search users by ID / username, or search matches.
    - `Esc` closes open dialogs and drawers.
14. **State consistency**
    - Skeleton loaders for tables, metric cards, charts (not generic spinners).
    - Empty states with icon + clear CTA when filters match nothing.

**Implementation guidelines:** clean modular React; custom hooks for filters; **reusable DataGrid wrapper**. Do **not** remove or alter existing endpoints or data schemas; add UI logic and **new additive APIs** only (bulk, verify-password, single-session revoke). New unique product features elsewhere stay **admin on / off**.

### 7.2 Codebase anchors (if rebuilding on existing repo vs greenfield)

If starting from this repo rather than a blank folder, these pieces already exist and must be **wired**, not reinvented:

**Admin app — `admin.battleasia.gg`**

| Piece | Path | Notes |
|-------|------|--------|
| List views (still raw `DataGrid`) | `src/sections/users/list/view.tsx`, `games/matches/view.tsx`, `payments/deposit/view.tsx`, `payments/withdrawal/view.tsx`, `feed/list/view.tsx`, `payments/balance-history/view.tsx` | Wire the wrapper below |
| Reusable grid (exists, **not wired**) | `src/components/admin-data-grid/index.tsx` | Select, bulk bar, date presets, CSV / Excel / Print |
| Export / print utils | `src/utils/admin-data-tools.ts` | SpreadsheetML `.xls` (no `xlsx` dep yet) |
| Date presets hook | `src/hooks/use-date-range-filter.ts` | |
| Password-gated confirm (unused) | `src/components/confirm-action-dialog/index.tsx` | Use for ≥ 1000 BAC |
| Receipt lightbox (imported, **not rendered**) | `src/components/receipt-lightbox/index.tsx` | Deposit screenshots |
| Copy button | `src/components/copy-button/index.tsx` | TrxID / phone |
| Room ID / password generators (**not in form**) | `src/utils/generate-credentials.ts` | Wire `matches/form.tsx` |
| Slug helper | `src/utils/slugify.ts` | Wire Game + Match forms |
| Prize pool math (exists) | `src/sections/games/matches/result-view.tsx` | Add over-distribution block |
| Searchbar | `src/layouts/_common/searchbar/searchbar.tsx` | Today **⌘K / metaKey only** — add **Ctrl+K** |
| Header (mute toggle goes here) | `src/layouts/dashboard/header.tsx` | |
| Socket pending queues | `src/contexts/SocketContext.tsx` | `new-deposit`, `new-withdrawal` — **no chime yet** |
| Profile password | `src/sections/profile/view.tsx` | Add strength meter; sessions currently on Users → Online |
| Sessions UI | `src/sections/users/online/view.tsx` | Per-user + logout-all; **no single session revoke** |

**API — `api/`**

| Need | Exists today? | Add |
|------|----------------|-----|
| Deposit approve / reject | `PATCH /api/v4/payments/deposit-history/:id/approve\|reject` | **Bulk** `PATCH .../bulk/approve` + `/bulk/reject` `{ ids, rejection_reason? }` |
| Withdrawal approve / complete / reject | `PATCH /api/v4/payments/withdrawal-history/:id/...` | **Bulk** approve / reject |
| User status toggle | `PATCH /api/v3/users/list/:id/status` `{ status: boolean }` — no separate ban entity | **Bulk** `PATCH .../bulk/status` `{ ids, status }` |
| User balance adjust | `PATCH /api/v3/users/list/:id/balance` | Client high-value confirm; optional verify-password |
| Feed delete / hide | `DELETE /api/v3/feed/list/:id`; hide = `PUT` `status: 'draft'` | **Bulk** delete / hide |
| Reels | `DELETE /api/v2/social/reels/:id` only | Bulk delete |
| Sessions | `GET /api/v3/users/sessions`, `DELETE .../all`, `DELETE .../user/:userId` | **`DELETE .../:sessionId`** |
| Admin password change | `PATCH /api/v3/users/auth/profile` `{ currentPassword, newPassword }` | Optional `POST .../verify-password` for high-value confirm |
| Audit log **model + GET** | `api/src/models/AuditLog.ts`, `GET /api/v3/audit-logs`, `recordAudit()` | **Admin page** + log more actions (match CRUD, feed, session revoke, password change) |
| Receipt image on deposit | **No field today** | Lightbox on any image URL if present; do not break schema |
| High-value threshold | **Not in AppSettings** | UI constant 1000 BAC first; later optional admin setting |

Audit actions already written in some payment / user / match routes: `DEPOSIT_APPROVE/REJECT`, `WITHDRAWAL_APPROVE/COMPLETE/REJECT`, `USER_STATUS_TOGGLE`, `BALANCE_ADJUST`, `MATCH_RESULT_SUBMIT`.

**Suggested admin-ops build order (inside this rebuild):**

1. Wire `AdminDataGrid` into Deposits + Withdrawals (export, filters, bulk + new bulk APIs).
2. Same grid on Users, Matches, Feed, Balance histories.
3. Form utilities (slug, room generate, payout over-cap).
4. Receipt lightbox + copy + high-value password confirm.
5. Password meter, profile / session revoke, Audit Logs page.
6. Audio chime + mute, Ctrl+K, skeletons, empty states.

---

## 8. Flutter APK (`battleasia-app`) — same product, same look

**Stack:** Flutter / Dart (SDK ≥ 3.8, FVM 3.32.4), `provider` (AuthProvider, AccentProvider), `http` via central `ApiClient` (15s), `socket_io_client`, `cached_network_image` / `image_picker` / `video_player` / `chewie`, `shared_preferences`, `easy_localization` (en / bn / zh / hi / ur), `flutter_dotenv`, `url_launcher`, `intl_phone_field`, `flutter_html`. Fonts: match Aurora (not gold-only Poppins-only). Imperative `Navigator` (no go_router). Package `battleasia_app` v1.0.1+2.

**Architecture:** `core/` (config, constants, providers, 10 services, theme, utils) + `data/models/` (28 models) + `presentation/{screens(30), widgets(59)}`. No domain layer.

**Entry:** `main.dart` → SplashScreen → **AuthWrapper** (authed → PlayScreen; guest → SignInScreen). Bottom nav: **Play, Shop, Referral, Feed**. Header: logo, balance, notifications, account, language, accent.

**Screens (30) mirror web after-login:**

- Auth (sign-in with **remember email + password** via SharedPreferences `ba_remember_*`, sign-up 2-step with PUBG ID / phone / server, email-verify, forgot / reset).
- Play / match list / detail / result (JOIN buttons full-width, not clipped; 5 unique game arts, PUBG first).
- **Shop with `ShopAuthGate`** + shop footer nav (Shop / Wallet / Transfer / Withdraw) + buy flow.
- Wallet (Overview / Earn / History).
- Feed hub (Feed / Explore / Reels / Saved / Messages) with stories, composer, reel create / player, DM (new chat, attachments, block / report, external-messaging fallback) — **Instagram-style**, same as web §5.
- Profile / account + public profile (follow / block / report, follower lists, suggested).
- My-matches / orders / statistics / referrals; referral hub; notifications (socket live); leaderboard; customer support (chat + attachments).
- Marketing Home screen exists but is **not** the APK entry. Landing / home on web does **not** need APK parity unless asked.

**API config (`core/config/app_config.dart`):** priority `--dart-define=API_BASE_URL` → `--dart-define=SITE_URL` → bundled `.env` → fallback `https://battleasia.gg`. `getImageUrl` maps `/uploads` → `/api/uploads`. Socket to `serverUrl` (events: balance-updated, new-notification, new-message). Mirrors `/api/v2`, `/v3/public`, `/v4/shop`, `/v4/payments`, `/v1/files`.

**Android build (`android/app/build.gradle`):** `applicationId net.battleasia.app`, minSdk **24**, target / compileSdk **36**, NDK 28.2, ABIs `arm64-v8a, armeabi-v7a, x86_64`, minify + shrink + ProGuard, multidex, desugaring. **Signing:** reads `android/key.properties` (gitignored) → release keystore `battleasia-release.jks`; if missing, falls back to debug (**do NOT ship debug-signed** — many devices refuse to install). Manifest perms: INTERNET, CAMERA, READ_MEDIA_IMAGES / VIDEO, legacy READ_EXTERNAL_STORAGE (≤ API 32); cleartext for local dev IPs only.

**Release build:** `build-release-apk.ps1` → copies `.env.production` → `.env`, `flutter clean && pub get`, `flutter build apk --release --dart-define=API_BASE_URL=https://battleasia.gg --dart-define=SITE_URL=...`, output `build/app/outputs/flutter-apk/app-release.apk` (~71MB), publishes to `api/uploads/app/BattleAsia.apk`. Live download via Admin → System → App Download.

---

## 9. Unique features & extra earn

Turn the product into **play + earn + social**. **Every module is admin on / off** in `AppSettings` + Admin Feature Flags. OFF = hide UI **and** block API. Default **OFF** until ready. Admin also sets rates / fees / caps.

### A. Extra earn — new income for users

- **Creator earning + live gifting** — earn BAC from reel / post performance; viewers send **BAC gifts** during live, creator withdraws (platform cut % — admin set).
- **Watch-to-earn** — small BAC for watching live matches / reels / sponsored clips (daily cap — admin set).
- **Match prediction / fantasy** — predict winners or draft a fantasy squad → BAC reward pool (skill-based, not betting).
- **1v1 / wager challenge** — challenge a friend for a BAC stake; auto result; platform fee %.
- **Task / quest marketplace** — sponsored tasks (follow, install, survey) pay BAC.
- **Tip / gift players** — tip a favorite player or gift during live.
- **Deeper referral / affiliate** — multi-tier + sub-affiliate, referral leaderboard / contests.
- **Cashback + deposit-bonus days** — enrich existing bonus logic.

### B. Unique competitive layer

- **Ranked seasons + divisions (MMR)** — Bronze → Elite, season rewards.
- **Clans / Teams + Clan Wars** — clan treasury, clan leaderboard, team pages.
- **Auto bracket / knockout tournaments** — single / double elimination.
- **Scrim / custom-room hosting** — host a room for a fee.
- **Faster results** — screenshot / OCR or game-API assisted result entry (less manual admin, faster payout).

### C. Economy health — BAC sinks (required if earn grows)

- **Profile customization store** — animated avatars, **profile frames**, name colors, banners, card skins (bought with BAC).
- **Collectible cosmetic badges** + season-pass premium track.
- **Boosts** — entry-fee discount, XP boost, post spotlight (BAC).

### D. Retention / delight

- **Daily scratch card + tiered lucky wheel** (enrich existing spin).
- **Achievements + milestone rewards**, streak calendar.
- **Community events / giveaways**, **clip-of-the-week** contest with prize.
- **Ambassador / campus-leader** program.

### E. Trust & safety (rare in this market = differentiator)

- **Fast KYC + instant payout**, transparent result proof, **fair-play score**, anti-cheat reporting, **provably-fair spin**.
- **Dispute center** inside support.

### Ship first unique set (highest impact)

1. Live streaming + gifting (creator earn)
2. Match prediction / fantasy (extra earn, low risk)
3. Clans + Clan Wars (retention + competitive)
4. Profile customization store (BAC sink → healthy economy)
5. 1v1 wager challenge (viral, unique)

**Net effect:** users earn by **playing, creating, referring, and watching** — while cosmetic sinks keep BAC valuable — and admin can switch any module on / off and tune every rate / fee / limit.

---

## 10. Infra, deploy & env

**Local dev:** `npm run dev` (root) runs api(5050) + fe(8081) + shop(8082) + admin(3000) + proxy(8080). Browser → `localhost:8080`: `/` → fe, `/store/` → shop, `/admin/` → admin, `/api /uploads /socket.io` → api. MongoDB local `:27017` (or `api/docker-compose.yml`, or embedded memory-server with auto-restore).

**Docker:** `docker-compose.yml` (local dev, nginx :8088, API on host), `docker-compose.prod.yml` (VPS: api + fe + shop + admin + nginx + certbot SSL), `docker-compose.coolify.yml` / `docker-compose.yaml` (Coolify: mongo + api + fe + shop + admin, Traefik SSL, no bundled nginx). Per-app Dockerfiles + nginx SPA configs in `docker/`.

**Coolify (primary prod):** Docker Compose resource from GitHub `battleasiav2/Battleasia` branch `main`, compose path `/docker-compose.yaml`; env vars set in Coolify UI; **git push to `main` → GitHub App webhook → auto rebuild / redeploy** (no GitHub Actions). PC helpers: `deploy/ship.ps1`, `auto-ship-watch.ps1`, `git-push.ps1`. Cloudflare SSL Full (strict) + WebSockets on.

**Env vars (per app):**

- API: `PORT, NODE_ENV, MONGODB_URI, JWT_SECRET*, ADMIN_EMAIL / PASSWORD* / USERNAME, SYNC_ADMIN_PASSWORD, CORS_ORIGINS, COINGO_MOCK, LOG_AUTH_CODES, ADMIN_LOGIN_OTP, APP_URL, CDN_URL, SMTP_*, MAIL_FROM*` (+ `MONGO_DUMP_PATH`, `APP_APK_MAX_MB`).
- Player fe: `VITE_PORT, VITE_SERVER_URL, VITE_BAC_SHOP_URL, VITE_CDN_URL, VITE_STAT_*`.
- Shop: `VITE_PORT, VITE_SERVER_URL, VITE_MAIN_APP_URL, VITE_BASE_PATH`.
- Admin: `PORT, REACT_APP_API_URL, REACT_APP_BASENAME, PUBLIC_URL`.
- Flutter: `API_BASE_URL, SITE_URL` (profiles `.env.emulator / .device / .production`).
- Coolify required: `JWT_SECRET`, `ADMIN_PASSWORD` (compose fails without). CORS includes all three domains.

**Backups / seed:** `npm run backup:mongo` (mongodump → `backups/`, keeps 7); restore via `api npm run restore-db` or embedded auto-restore; `deploy/seed-all.sh` (`npm run seed:server`) runs seed → games → dashboard → feed → social → demo.

Never commit `.env*`, `key.properties`, `*.jks`, tokens, `backups/`.

---

## 11. Non-negotiable rules

1. **BAC is the single currency** on `User.balance`; every change writes `BalanceHistory`.
2. **Deposits are admin-reviewed** (submit → approve) unless Coingo auto.
3. **Web ↔ APK parity:** any change to auth / shop / after-login UI or flow on web must be mirrored in the Flutter app the same turn (home / landing exempt unless asked).
4. **Performance first:** hit the Lighthouse gate; heavy libs dynamic-imported; no CLS; WebP / AVIF images.
5. **Feature flags** for every unique module. Clients hide UI **and** API blocks when OFF. Default OFF until ready.
6. **Accent switcher + dark / light** on web and APK.
7. **Shop stays a separate app.**
8. **Ship APK signed with the real release keystore** (never debug) so every device can install and future updates keep the same signature.
9. **i18n** layouts survive en / bn / zh / hi / ur. WCAG AA contrast, big tap targets, focus states, labels, keyboard nav.
10. **Secrets server-side / gitignored:** `.env*`, `key.properties`, `*.jks`, `deploy/.github-token.local`, `backups/`.
11. **All states designed** — loading / empty / error / success everywhere, not just the happy path.
12. **Responsive + mobile-first**, reserve space (no layout shift).

---

## 12. Hand over separately (not in this text)

Taking “everything” still leaves these outside the text prompt — provide them alongside:

- **Brand / design assets:** new logo, wordmark, hero image / video + poster, 5 game cover arts, mode art (solo / duo / squad / tdm), payment icons, fonts, favicon, Android adaptive app icon, empty-state illustrations. Old assets are being replaced.
- **Secrets & keystore:** real `.env` values, `JWT_SECRET`, admin password, SMTP creds, `battleasia-release.jks` + `key.properties` (password), GitHub token. Lose the keystore = cannot update the APK.
- **Database content:** the Mongo dump / `backups/` seed data (users, matches, settings) — code seeds structure, not production users.
- **Exact copy / i18n text** beyond what the components define (locale JSON per app).
- **Third-party accounts:** domain / Cloudflare, Coolify server, Coingo gateway credentials, mail provider.

Aurora mockups (reference, not in git): dark `aurora-01-landing-hero.png` … `aurora-05-feed-social-mobile.png`; light `aurora-light-01-landing-hero.png` … `aurora-light-05-feed-social-mobile.png`.

---

## 13. New assets you must create

Since this is a new look, produce fresh: brand logo + `BATTLE ASIA` wordmark, hero image / video + poster, 5 game cover arts, mode art (solo / duo / squad / tdm), payment icons, favicon, Android adaptive app icon, fonts, and any illustrations. Everything **functional / technical stays**; only the **skin** is new.

---

## 14. Premium polish checklist (mandatory)

Apply these to lift the design from good to premium. All must respect the performance gate: motion / particles are dynamic-imported and off the LCP critical path; images WebP / AVIF.

### 14.1 Depth & light

- Subtle **aurora gradient mesh glow** (accent color) blurred behind hero + key cards only — not flat.
- **Glass top nav**: background blur + thin gradient border; sticky on scroll.
- Two-tier soft shadows + faint **noise / grain** texture for an “expensive” feel.
- Accent-only glow (buttons, live dot); everything else stays neutral.

### 14.2 Motion & micro-interaction (perf-safe)

- Number **count-up** (balance, prize, players); animated **progress-bar fill**.
- Card **hover lift + cursor spotlight** (desktop); **gradient shimmer / pulse** on primary buttons.
- **Skeleton shimmer** loading; smooth page / tab transitions.
- **Win celebration** (coin burst / confetti); **streak flame** animation.

### 14.3 Signature hero

- **3D character cutout** or parallax layers (subject vs background move independently).
- **Animated gradient wordmark** + light spark / particle FX (lightweight canvas), or short **hero video** loop behind a poster.

### 14.4 Typography craft

- Strong display ↔ body contrast; tight tracking on big headlines.
- **Gradient text** on one key word / number (e.g. prize, “ASIA”).
- **Tabular / mono numerals** for stats and balances (clean alignment).

### 14.5 Iconography & game-art treatment

- Custom **line + gradient icon set**; **hexagon-framed** game icons.
- Consistent **duotone / gradient overlay** on all game banners so every card looks premium (not random screenshots).
- **Rank / tier badge** system (Bronze → Elite) on profile, leaderboard, match cards.

### 14.6 Delight & richness

- **Custom illustrations** for empty states (not bare text).
- **Bento-grid** (asymmetric card sizes) on landing for a modern, unique layout.
- Live **pulse** on “LIVE” dots; animated leaderboard rows.
- Achievement / badge showcase, streak calendar, season-pass **progress ring**.

### 14.7 Consistency (the silent 80%)

- Strict **8pt grid**; one radius scale + one shadow-tier scale used everywhere. Without this, nothing feels “beautiful”.

**Short list:** aurora glow · glass nav · grain · accent-only glow · count-up · progress fill · hover spotlight · shimmer · win burst · parallax / 3D hero · gradient wordmark · hex game frames · rank badges · empty illustrations · bento landing · LIVE pulse · 8pt grid.

---

## 15. Done when

- [ ] Aurora Arena tokens + light / dark + accent presets on web, shop, admin, APK
- [ ] Global tokens + component library for web + APK
- [ ] Landing 7 blocks + all auth + all `/user/*`
- [ ] Shop app: auth + shop / wallet / transfer / withdraw + tab login gate
- [ ] Admin: all sections + feature flags + enterprise grid / bulk / export / print / filters + slug / room gen + payout cap + lightbox + high-value confirm + password meter + sessions + audit + chime + Ctrl+K
- [ ] APK: 30 screens, parity, release-signed
- [ ] IG feed P0 shipped; P1 / P2 flagged
- [ ] Unique earn modules flagged OFF until ready
- [ ] All component states (loading / empty / error / success / toast)
- [ ] New brand assets (logo, wordmark, hero media, game art, fonts, favicon, app icon)
- [ ] Lighthouse / a11y / empty-error states pass
- [ ] Performance + parity + a11y verified before “done”
