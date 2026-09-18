# BattleAsia — Single New-Build Prompt

> **This is the one prompt to use.** Paste this whole file to rebuild BattleAsia **from scratch with a new look** — API + player web + shop web + admin web + Flutter APK. Nothing about product, money, social, extra-earn, or admin-ops should be missed.
>
> Old split files (`BATTLEASIA-MASTER-PROMPT.md`, `BATTLEASIA-REDESIGN-PROMPT.md`, `BATTLEASIA-ADMIN-ENTERPRISE-PROMPT.md`) are archives. **Use this file.**

---

## 0. Mission

Rebuild **BattleAsia** as a **new visual product** with the **same (and expanded) product**.

A **mobile-esports tournament platform** (PUBG, Free Fire, COD, MLBB, Valorant). Players join paid matches, win in-app coin **BAC**, cash out, socialize (Instagram-style feed), earn extra (create / watch / predict / refer), and admins run everything. Four clients, **one API**.

| Keep exactly | Invent new |
|--------------|------------|
| All features, money flows, models, routes, auth, sockets | Colors, type, layout, hero, motion, art |
| Shop as a **separate app** | Brand wordmark / logo |
| Web ↔ APK parity (auth/shop/after-login) | Empty/loading/error/success treatments |
| Lighthouse 90+, LCP&lt;2.5s, CLS&lt;0.1, TBT&lt;150ms | Nav chrome (all destinations still reachable) |
| Release-keystore APK signing | Light + dark, accent presets |

**Rule:** a player of the old app must find **every feature** in the new one — plus the new social/earn/admin-ops listed here.

---

## 1. Design brief (locked for this rebuild)

**Direction: Aurora Arena** — premium esports × modern fintech. Clean, high-contrast, international-legible. Not gold-glass PUBG clone.

- **Vibe:** confident, airy, expensive — not neon overload.
- **Dark base:** `#0E0F14` (indigo-charcoal, not pure black). Surfaces `#171922`. Hairline border `white @ 8%`. Text `#F4F5F7` / muted `#A0A4B8`.
- **Light base (REQUIRED toggle):** `#F7F8FB` page, `#FFFFFF` cards, ink `#12131A`, soft gray borders `#E6E8EF`.
- **Signature accent:** violet → cyan gradient `#7C5CFF → #21D4FD` on CTAs, active tabs, live/stat highlights only. Status: success `#28E0A0`, danger `#FF5C7A`, warning `#FFC24B`.
- **Accent switcher (REQUIRED):** 8 user presets (lime, gold, ember, jade, cyan, violet, rose, sky — restyle to the new brand). CSS vars, persist `ba-accent` (web localStorage, APK SharedPreferences), bootstrap **before first paint**. Picker in header, logged-out and logged-in, web + APK.
- **Type:** geometric display (Space Grotesk / Clash Display) + clean body (Inter / General Sans). Self-hosted WOFF2, `font-display: optional`. Tabular numerals for money/stats. Gradient text on one key word/number.
- **Shape:** 16–20px radius, **flat luminous cards** (not heavy glass except sticky nav), 8pt grid, one shadow-tier scale.
- **Motif:** hex / angular shield used on dividers, progress, live dots, game frames.
- **Motion:** count-up, progress fill, hover lift, button shimmer, skeleton shimmer, win burst — all **off LCP path** (dynamic import).
- **Hero:** new `BATTLE ASIA 2.0` wordmark; 3D/parallax character or layered photo; optional short video behind poster.
- **Game art:** 5 unique covers, hex-framed icons, consistent duotone overlay (not random screenshots). Rank badges Bronze → Elite.

**Premium polish (mandatory):** aurora mesh glow behind hero/key cards; glass sticky nav; grain; empty-state illustrations; bento-grid landing; LIVE pulse; season-pass ring. See §12.

---

## 2. Architecture

```
api/                  Node + Express + TS (ESM) + MongoDB/Mongoose + Socket.IO     :5050
battleasia.gg/        Player web — React 18 + Vite 6 + MUI 6 + Redux Toolkit       :8081
shop.battleasia.gg/   Coin shop — SAME stack, SEPARATE app + login gate            :8082
admin.battleasia.gg/  Admin — React 18 + MUI + MUI X DataGrid                      :3000/3001
battleasia-app/       Flutter APK, same API, same visual language
```

**Live:** `https://battleasia.gg` (player) · `https://shop.battleasia.gg` (shop) · `https://admin.battleasia.gg` (admin) · `https://battleasia.gg/api|uploads|socket.io` (API). Coolify + Cloudflare; git push `main` auto-deploys.

Player web: React Router 7, redux-persist (**strip token on write**), RHF + zod, Axios Bearer, i18next **en/bn/zh/hi/ur**, Tailwind preflight off. Proxy `/api /uploads /socket.io` → API.

Shop persist key **`battleasia-shop`** (isolated). Admin: JWT `v3` auth + optional OTP; RBAC hides nav; `admin` bypasses.

APK: Flutter SDK ≥3.8, `provider`, `http`/`ApiClient`, sockets, SharedPreferences, easy_localization. `applicationId net.battleasia.app`, minSdk 24, target 36, ABIs `arm64-v8a, armeabi-v7a, x86_64`. **Release keystore only** (`key.properties` + `.jks`, gitignored). Build: `build-release-apk.ps1` → `api/uploads/app/BattleAsia.apk`.

---

## 3. Backend (must exist)

**Auth:** JWT 7d, Bearer or httpOnly cookie (`battleasia_token` player, `webet_token` admin). Roles `admin|official|agent|player`. Rate-limit auth 100/15min. Optional `ADMIN_LOGIN_OTP`.

**Models (52 + new as needed):**
- Users/auth: `User` (email, username, password, status, avatar, cover, bio, **`balance` BAC**, role, pubgId, gameServer, referralCode, referredBy, emailVerified, premium, privacy), `Role`, `Session`, `LoginHistory`, `VerificationCode`, **`AuditLog`**.
- Games: `Game`, `Match` (modes classic/tdm, roomId/password, entryFee, totalPlayer, teamType, perKill, map, banner, premiumOnly, platformFeePercent, results, winningsDistributed, entriesRefunded), `MatchParticipant`.
- Wallet: `BalanceHistory`, `DepositHistory`, `WithdrawalHistory`, `PaymentChannel`, `BusinessWallet`, `CoinRate` (global/BD/IN/PK), `CoingoTransaction`, `ShopItem`, `ShopOrder`, `UserTransferHistory`, `ReferralHistory`.
- Social: `Feed`, `FeedCategory`, `FeedLike`, `FeedComment`, `SavedPost`, `Reel`, `Story` (TTL), `Follow`, `UserBlock`, `DirectConversation`, `DirectMessage`, `SocialReport`.
- Notify/support: `Notification`, `NotificationRead`, `SupportConversation`, `SupportMessage`.
- Engagement: missions, badges, progress, level, streak, welcome, referral, weekly, season, spin, share, squad (+ weekly/claim).
- Config: `AppSettings` (`key:'global'`) — premium, commissions, transfer, liveChat, messaging, mail, appDownload, engagement, **feature flags** for every unique module.

**Routes:**
- `v1/files` upload (5MB; 100MB reels/stories)
- `v2/users` signup/signin/logout, email verify, password reset, me, leaderboard, withdrawable, balance-history, referrals, premium, social graph, **transfer**
- `v2/games` list/matches/join/room/result/history
- `v2/feed` + `v2/social` (stories, reels, DMs, search, reports, settings)
- `v2/engagement`, `v2/notifications`, `v2/customer-support`, `v2/app-settings` (mail + APK)
- `v3` admin auth, users/roles/sessions/premium/referral/transfer, dashboard + **public dashboard**, games/matches (results, distribute, refund), feed CMS, engagement CMS, notifications, shop orders/coins, **audit-logs**
- `v4/payments` channels, wallets, deposit submit/approve/reject (+ **bulk**), withdrawal submit/approve/complete/reject (+ **bulk**), coingo
- `v4/shop` items, coins, orders
- Additive admin: bulk user status, bulk feed hide/delete, `DELETE /sessions/:sessionId`, `POST /auth/verify-password`
- `/health` `/ready` `/uploads/*` (incl. APK)

**Money:**
- Deposit: channel → wallet/QR → submit proof → **admin approve** → credit BAC + history + referral + bonuses + sockets. Coingo optional.
- Withdraw: 70% of match-bet BAC rule → submit → approve → processing → complete/reject.
- Match: join deducts fee; admin distributes / refunds. **UI must block payout if distributed &gt; collected fees.**
- P2P transfer: fee% min/max from settings.
- Shop packs: fiat + `paymentOptions` bkash/nagad/crypto.

**Sockets (`/socket.io`, JWT handshake):** rooms `user:{id}`, `admin-room`, `game:{id}`, `conversation:{id}`. Events: pending deposit/withdrawal counts, new-deposit/withdrawal, notification, message, typing, balance-updated, user-stats, match-created/updated, dashboard-stats. Extend for social live/like/follow as built.

**Seed:** roles, admin, sample player, 5 games, channels, rates, shop packs. Demo: `player@battleasia.local / Player@123456`.

---

## 4. Player web — surfaces

**Public:** `/` → `/dashboard` landing; privacy; terms; `/profile/:userId`; `/support`.  
**Auth:** sign-in, **2-step sign-up** (credentials → PUBG ID/phone/server/terms), forgot/reset, email-verify. JWT; `returnTo`; `?ref=` → `battleasia_ref`. Default after login `/user/play`.

**Landing blocks** (anchors `#home #about-us #how-to-play #rules`) — new art, same jobs:
1. Hero — wordmark, Enter Arena, **Download APK**, trust
2. Live pulse — stats, top players, high-prize/ongoing (public API + socket)
3. Play your game — 5 titles, Valorant coming soon
4. About + stats
5. Modes Solo/Duo/Squad/TDM
6. Rules/FAQ accordion
7. Footer — partners, socials, pay chips (bKash/Nagad/crypto), legal

**After-login `/user/*`:** Play (picker → list → detail/join → result: fee, prize, spots, room after join) · Wallet + Earn (missions, streak, welcome, referral, weekly, squad, spin, season, withdraw) · in-app shop teaser → **external shop app** · Referral · **Instagram-style Feed** · Profile · my-matches/orders/statistics/referrals, notifications, leaderboard, support.

### 4.1 Instagram-style social (web + APK)

Inside Feed; main app nav stays Play / Shop / Referral / Feed.

- Home: vertical posts + **stories tray**. Mobile social tabs: Home · Explore · Create ＋ · Reels · Profile; DM icon top-right. Desktop: center feed + right rail (suggested/trending).
- **Posts:** image/video, carousel, caption #hashtag @mention, double-tap like, comment/share/save, threaded comments, report/hide.
- **Stories:** gradient ring, 5s, stickers, poll/quiz, reply-via-DM, reactions, viewers, 24h, **highlights**.
- **Reels:** full-screen vertical swipe, create + cover.
- **Live (P2):** go-live, viewer count, live chat + hearts, LIVE ring, replay→reel.
- **DMs:** 1:1 + group/squad, media, reactions, reply, read receipts, typing, requests, share-to-DM, online dot, block/report.
- **Profiles:** avatar, verified, bio, **posts/followers/following** + gaming stats/rank, Follow/Message, grid Posts·Reels·Tagged, highlights, pinned. `/profile/:userId`.
- **Explore:** users/hashtags, trending grid, suggested, game topics.
- Esports: match clips, **victory auto-post** (“Won 2000 BAC 🏆”), achievement/streak share, game-tagged feed.

**Build order:** P0 core IG → P1 esports (clips, victory post, highlights, squad chat, message requests) → P2 live, For You, voice notes, external share.

---

## 5. Shop web — SEPARATE APP

`shop.battleasia.gg` is **not** a page on the main site. Own codebase, own persist, **tab-scoped login** (`sessionStorage ba_shop_gate`). Same account/API. Main site links via `VITE_BAC_SHOP_URL`. `VITE_MAIN_APP_URL` back to player.

Routes: `/auth/*` · `/user/shop` · `/user/wallet` · `/user/transfer` · `/user/withdrawal`.

- Shop: packs, channel+currency, premium discount, **manual deposit submit**, waiting-for-admin state.
- Wallet: BAC + fiat BDT/INR/PKR/USD, withdrawable, **balance history = order history**.
- Transfer: recipient, amount, fee, note, history.
- Withdraw: rates + Coingo/manual (bKash/Nagad/crypto).

---

## 6. Admin web — ops + enterprise

Every section, new look, **enterprise table/ops included in this rebuild** (not a later add-on):

Dashboard · Users (CRUD, balance, status, RBAC, history, online, premium, referral/transfer settings, referral history) · Games/matches/results/participants · Balance ledger · Payments (channels, wallets, deposit approve/reject, withdrawal approve/process/complete, live badges) · Shop packs + rates · Notifications · Feed CMS + reports + reels · Support inbox + live-chat/messaging settings · Engagement missions/badges/settings · **Feature flags** (on/off + rates for every unique module) · System mail + **APK upload** · **Audit logs** · Profile · 404.

### 6.1 Enterprise utilities (all list views: Users, Matches, Deposits, Withdrawals, Feed, Balance)

- Checkbox select-all (page **or** filtered set) + floating bulk toolbar.
- Bulk: deposits/withdrawals Approve + Reject (reason); users Ban/Suspend + status toggle; feed/reels Delete/Hide.
- Export CSV + Excel; **Print** branded ledger (`@media print` hides chrome).
- Date chips: Today / Yesterday / Last 7 / This Month / custom range. Column visibility + density.
- Game/Match forms: **auto slug** with override; match **Generate Room ID / Password**.
- Results: live gross pool, fee %, net per winner/kill; **block if payout &gt; collected fees**.
- Deposit receipt lightbox (zoom/pan/rotate) + copy TrxID / phone.
- High-value (≥ **1000 BAC** withdraw approve or balance adjust): password (or 2FA) confirm.
- Profile: current-password + **strength meter**; session list (device, IP, last active); revoke one **or** all others.
- Audit log page: who, action (`DEPOSIT_APPROVE`, `BALANCE_ADJUST`, `USER_BAN`, `MATCH_RESULT_SUBMIT`, …), target, IP, time; filter/export.
- Socket chime on `new-deposit` / `new-withdrawal` + **header mute**.
- **Ctrl+K and Cmd+K** command palette (sections, user, match); Esc closes dialogs.
- Skeleton loaders + illustrated empty states.

New APIs only additive: bulk payment/user/feed, `DELETE /sessions/:id`, `POST /auth/verify-password`. Do not break existing contracts.

---

## 7. Flutter APK — same product, same look

Splash → AuthWrapper (authed → Play, guest → Sign In). Bottom nav **Play · Shop · Referral · Feed**. Header: logo, balance, notifications, account, language, accent.

All 30 screens: auth (**remember email+password**), play/match/detail/result, shop gate + Shop/Wallet/Transfer/Withdraw, wallet Overview/Earn/History, IG feed hub, profile + public profile, my-matches/orders/stats/referrals, notifications, leaderboard, support.

`AppConfig`: dart-define `API_BASE_URL` / `SITE_URL` → `.env` → `https://battleasia.gg`. Never ship debug-signed APK.

---

## 8. Unique features & extra earn

Turn the product into **play + earn + social**. **Every module is admin on/off** in `AppSettings` + Admin Feature Flags. OFF = hide UI **and** block API. Default **OFF** until ready. Admin also sets rates/fees/caps.

**A. Extra earn:** creator + **live gifting**; watch-to-earn (daily cap); match **prediction/fantasy**; **1v1 wager**; task marketplace; tip/gift; multi-tier affiliate; cashback / deposit-bonus days.

**B. Competitive:** ranked seasons MMR Bronze→Elite; **clans + clan wars**; auto brackets; paid scrim hosting; OCR/API-assisted results.

**C. BAC sinks (required if earn grows):** profile frames/skins/name color store; cosmetic badges; season-pass premium; boosts (fee discount, XP, post spotlight).

**D. Retention:** scratch card + wheel; achievements; events/giveaways; clip-of-the-week; ambassador program.

**E. Trust:** fast KYC + instant payout, fair-play score, anti-cheat, provably-fair spin, dispute center.

**Ship first unique set:** (1) live + gifting (2) prediction/fantasy (3) clans/wars (4) customization store (5) 1v1 wager.

Net: earn by playing, creating, referring, watching — sinks keep BAC valuable.

---

## 9. Infra & env

Local: `npm run dev` → fe 8081, shop 8082, admin 3000, api 5050, proxy 8080 (`/ /store/ /admin/ /api`). Mongo 27017 or memory-server + dump restore.

Coolify compose `docker-compose.yaml`; required `JWT_SECRET`, `ADMIN_PASSWORD`. CORS includes all three domains.

Env (essentials): API `MONGODB_URI JWT_SECRET ADMIN_* CORS_ORIGINS APP_URL SMTP_*`; FE `VITE_SERVER_URL VITE_BAC_SHOP_URL`; Shop `VITE_MAIN_APP_URL VITE_BASE_PATH`; Admin `REACT_APP_API_URL`; Flutter `API_BASE_URL SITE_URL`.

Never commit `.env*`, `key.properties`, `*.jks`, tokens, `backups/`.

---

## 10. Non-negotiable rules

1. BAC lives on `User.balance`; every move → `BalanceHistory`.
2. Deposits admin-reviewed unless Coingo auto.
3. Web ↔ APK parity for auth/shop/after-login (landing exempt unless asked).
4. Performance gate; no heavy lib on LCP.
5. Feature flags for every unique module.
6. Accent switcher + dark/light on web and APK.
7. Shop stays a **separate app**.
8. APK **release-signed**.
9. i18n layouts survive en/bn/zh/hi/ur. WCAG AA contrast, big tap targets.

---

## 11. Hand over separately (not in this text)

- New brand assets (logo, wordmark, hero, 5 game arts, mode arts, pay icons, fonts, favicon, adaptive icon).
- Secrets + **release keystore**.
- Live Mongo dump (seed is structure, not production users).
- Domain / Coolify / Cloudflare / Coingo / SMTP accounts.

---

## 12. Premium polish checklist

Aurora glow · glass nav · grain · accent-only glow · count-up · progress fill · hover spotlight · shimmer · win burst · parallax/3D hero · gradient wordmark · hex game frames · rank badges · empty illustrations · bento landing · LIVE pulse · 8pt grid.

---

## 13. Done when

- [ ] Aurora Arena tokens + light/dark + accent presets on web, shop, admin, APK
- [ ] Landing 7 blocks + all auth + all `/user/*`
- [ ] Shop app: shop/wallet/transfer/withdraw + tab login gate
- [ ] Admin: all sections + feature flags + enterprise grid/bulk/export/print/filters + slug/room gen + payout cap + lightbox + high-value confirm + password meter + sessions + audit + chime + Ctrl+K
- [ ] APK: 30 screens, parity, release-signed
- [ ] IG feed P0 shipped; P1/P2 flagged
- [ ] Unique earn modules flagged OFF until ready
- [ ] Lighthouse/a11y/empty-error states pass
