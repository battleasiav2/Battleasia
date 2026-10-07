# BattleAsia — Master Prompt (Post-Login Player Arena)

> **Use case:** One-shot brief for AI/site builders to recreate **battleasia.gg** after sign-in: the **player HUD** (Play, Feed, Earn, account, referrals, labs). Assumes **auth + landing** exist separately (see `docs/demo-master-prompt-home-auth-landing.md`). **Admin** and full **shop.battleasia.gg checkout** are out of scope here — shop/transfer/wallet **hand off** to the shop domain.

---

## 0. Mission

Build a **mobile-first, dark esports player app** shell with **BAC balance**, **real-time toasts**, and routes below. Match **feature set and flow**; visuals can be demo-polished, not pixel-perfect.

**Brand:** BATTLE ASIA · tournament arena · BAC coins · PUBG-first multi-game.

**Design DNA:** Ink background (`~#0a0b0f`), cards (`~#161618`), borders white ~8%, **gold/lime accent** (ThemeDock accent chip only). Typography and spacing like a compact game launcher, not a casino site.

**Performance:** WebP covers, lazy below fold, code-split heavy pages (feed reels, win burst). **No Framer/Three on critical path.** Reserve space for cards/skeletons (CLS).

**Auth gate:** All `/user/*` and protected `/profile/*` require session; redirect to `/auth/sign-in?returnTo=…` on 401.

---

## 1. Routes (reference product)

| Route | Purpose |
|-------|---------|
| `/user/play` | Game picker hub |
| `/user/play/:gameId` | Match list for one game |
| `/user/play/:matchId/detail` | Match detail + lobby (join, room, chat, ready) |
| `/user/play/:matchId/result` | Published results + placements + share-to-feed earn |
| `/user/feed` | Social feed home |
| `/user/feed/explore` | Explore grid + search |
| `/user/feed/saved` | Saved posts |
| `/user/feed/reels` | Vertical reels stage |
| `/user/feed/messages` | DM inbox + thread |
| `/user/feed/:postId` | Single post deep link |
| `/user/hashtag/:tag` | Hashtag feed |
| `/user/earn` | Earn hub (`?tab=…`) |
| `/user/shop` | Shop **hub** (CTAs → external shop) |
| `/user/wallet` | Redirect hub → shop wallet URL |
| `/user/transfer` | Redirect hub → shop transfer URL |
| `/user/referral` | Referral program |
| `/user/labs` | P2 experiments index |
| `/user/labs/:feature` | Single lab (`live`, `watch`, `clans`, `fantasy`, `duel`, `cosmetics`, `ocr`, …) |
| `/user/account/*` | Account sidebar layout (see §7) |
| `/profile/:userId` | Public profile |
| `/profile/:userId/followers` | Followers list |
| `/profile/:userId/following` | Following list |

**Entry after login:** default product sends users to **`/user/play`** (or `returnTo` from auth).

---

## 2. Global chrome — `UserShell`

Persistent layout wrapping all routes above (Outlet).

### 2.1 Top HUD (desktop + mobile)

- **Brand** → `/dashboard` (marketing home; player can leave arena)
- **Primary nav:**
  - **Play** → `/user/play`
  - **Shop** → opens **shop domain** (not in-app checkout)
  - **Earn** → `/user/earn`
  - **Transfer** → opens shop transfer URL
  - **Feed** → `/user/feed`
- **More** popover:
  - **Labs** (only if any P2 flag on)
  - **Referral**
- **Account** popover:
  - Profile, Matches, Orders, Stats, Referrals, Notifications, Leaderboard, Support (account routes)
  - Sign out
- **Balance pill:** BAC amount + coin icon; tap opens shop entry; **hide balance** toggle (persists `ba-hide-balance`)
- **Notifications bell:** unread count; → `/user/account/notifications`
- **Avatar** → account menu
- **ThemeDock:** accent picker only
- **Locale select:** EN, BN, HI, UR, ZH

### 2.2 Mobile (≤820px)

- **Burger** opens full-screen **drawer** mirroring nav + account links + balance row
- Close drawer on route change
- Bottom-safe areas; 44px tap targets
- Feed/play use **`play.css` + `phone.css`** patterns: horizontal tab scroll, bottom sheets for join/comments

### 2.3 Realtime & session

- On mount: **`fetchMe`** refresh user + balance
- **Socket** (when authed): `balance-updated`, `user-stats-updated`, `new-notification` → update balance + toast + badge count
- **Presence ping** ~45s
- **Deferred support chat** lazy-loaded in shell footer

### 2.4 HUD toast + keyboard shortcuts

Global toast strip; **`?`** opens **shortcuts sheet**:

| Key | Action (contextual via page handlers) |
|-----|----------------------------------------|
| J | Quick join match |
| C | Copy room ID/password |
| R | Toggle ready in lobby |
| L | Leave match (confirm) |
| M | Scroll/focus match details |
| B | Open BAC shop entry |
| T | Open transfer on shop |
| H | Hide/show balance |
| Enter | Focus/open chat |
| Tab | Leaderboard / result shortcut |
| F | Follow (profile/feed focus) |
| S | Share link |
| U | Mute/unmute HUD sounds |
| Esc | Close sheets |
| ? | Toggle help sheet |

Pages register handlers via **HudContext** (`register({ quickJoin, copyRoom, … })`).

---

## 3. Play hub — `/user/play`

- Load **games** from API (fallback: PUBG, Free Fire, COD, MLBB, Valorant coming soon)
- Each tile: WebP cover, title, **“N open matches”** (joinable count)
- **Watch live** link (YouTube/social from site config)
- HUD shortcuts show toasts until user is in a match context
- Click game → `/user/play/:gameId`

---

## 4. Match list — `/user/play/:gameId`

- Header: game name + back to play hub
- **Filter chips:** All · Joined · Open · High prize · Low prize · Free
- **Match cards:** cover (map/game art), name, schedule, team type, entry fee, prize pool estimate, **SpotBar** (filled/total), joined badge
- **Join flow:**
  1. Select card → highlight
  2. **Join** opens **bottom sheet / dialog** (`MatchJoinDialog`): hero cover, stats grid (game, schedule, team, map, type, entry, per-kill, balance), spot bar, warnings (insufficient BAC, full, demo disabled)
  3. Confirm → API join → update balance → navigate to **`/user/play/:matchId/detail`**
- Keyboard **J** triggers join on selected match when handler registered
- Demo match IDs: show disabled message, no real join

---

## 5. Match detail & lobby — `/user/play/:matchId/detail`

### 5.1 Pre-join

- Hero banner, title, meta (team · map · time), participant count
- Prize pool, rules section (scroll target for **M**)
- **Join** → same join sheet; `?join=1` auto-prompts join once

### 5.2 Post-join (`#match-room`)

- **Room credentials:** Room ID, password (copy buttons → clipboard toast)
- **Ready** toggle per player; participant list with ready states
- **Lobby chat:** message list + compose (poll/fetch chat API)
- **Leave** with confirmation sheet
- **Watch party** link/button when P2 `watchParty` flag on
- **Report match** action
- Link to **results** when status complete → `/user/play/:matchId/result`

### 5.3 Premium / spots

- Respect `isPremiumUser` where product gates UI (badges, join eligibility from API)

---

## 6. Match results — `/user/play/:matchId/result`

- Placement table: rank, player, kills, prize BAC, tier badge
- Winner highlight; optional **WinBurst** animation (lazy)
- **Share victory** / IG-style highlight post when P1 flags allow; **share earn** claim if API says eligible
- Back links to match detail or play hub
- **Tab** shortcut from lobby registers navigation here

---

## 7. Account area — `/user/account/*`

**Layout:** left sidebar (desktop) / stacked nav (mobile) with icons:

| Path | Page features |
|------|----------------|
| `profile` | Same **Profile** component with `own` — edit mode |
| `my-matches` | History of joined matches, status, links to detail/result |
| `my-orders` | Shop order history (BAC purchases; may link out to shop) |
| `my-statistics` | Player stats charts/summary |
| `my-referrals` | Referral page embedded in account |
| `notifications` | In-app notification list, read/unread |
| `leader-board` | Period tabs + ranked players (profit/kills/etc. from API) |
| `customer-support` | Support tickets / chat entry |

---

## 8. Profile — `/profile/:userId` & own edit

### 8.1 Public view

- Avatar, username, verified badge, rank/tier from wins
- Stats row: followers, following, posts, wins, tips received
- **Follow / Unfollow**, **Message** (start DM), **Tip BAC** (wallet API)
- **Block / Report**
- Tabs: **Posts · Reels · Highlights · Match history**
- Grid of feed media; links to `/user/feed/:postId`

### 8.2 Own profile (`/user/account/profile`)

- **Edit** toggle: username, email, country/mobile, PUBG ID, game server, referral code (read-only if locked), bio, social URLs
- Avatar upload
- Unsaved-changes guard
- Validation: username alphanumeric, PUBG ID pattern, URL fields

### 8.3 Social lists

- `/profile/:userId/followers` and `/following` — searchable lists, follow back

---

## 9. Feed — `/user/feed` (+ tabs)

### 9.1 Tab bar

Home · Explore · Saved · Reels · Messages (route or path segment)

### 9.2 Home

- **Stories row:** avatars, composer (image/video), viewer modal with seen list
- **Composer:** text, media upload, hashtags
- **Feed posts:** author, time, caption, **preview image** (`-sm.webp` lazy), like, comment count, save, share
- **Comments (Instagram-style):** tap 💬 → **bottom sheet** (`FeedCommentsSheet`): thread, replies (`parentId`), like comment, compose, no full-page navigation
- Infinite scroll / load more
- Socket updates for likes/DMs optional in full product

### 9.3 Explore

- Search users/posts/hashtags
- Masonry or grid of trending media
- Suggested follows sidebar/cards

### 9.4 Saved

- Grid of bookmarked posts

### 9.5 Reels

- Full-viewport vertical swipe stage; like, comment, share overlays

### 9.6 Messages

- Conversation list (accept requests)
- Split pane on desktop; stacked on mobile
- Thread: bubbles, reactions, read receipts, image send
- **Report / block** from thread menu

### 9.7 Hashtag & single post

- `/user/hashtag/:tag` — posts with tag
- `/user/feed/:postId` — focused post + comments sheet

---

## 10. Earn — `/user/earn?tab=…`

Tabs (query `tab`):

| Tab | Features |
|-----|----------|
| overview | Summary cards, quick links, today’s progress |
| missions | Daily/weekly missions, claim BAC |
| streak | Login streak, claim |
| spin | Daily spin wheel, cooldown |
| squad | Create/join squad, squad chat, squad rewards |
| season | Season pass progress, tier claim |
| badges | Earned badges grid |
| claims | Balance history rows for earn claims |

- Claims update **balance** in shell via outlet context
- Toasts on success/failure
- Optional **create post** from victory/mission promos (social API)

---

## 11. Referral — `/user/referral`

- Personal **referral link** (`/auth/sign-up?ref=username`)
- Copy link / copy code toasts
- Stats: total referrals, active, lifetime commission (BAC)
- Referred users table (status: active/pending/inactive)
- Commission history
- **Milestone claim** buttons when API allows

---

## 12. Shop / wallet / transfer (player domain)

**Not a full storefront on battleasia.gg** — pattern:

| Player route | Behavior |
|--------------|----------|
| `/user/shop` | Marketing hub: BAC stats, feature cards, buttons **Go to BAC shop**, **Open wallet** |
| `/user/wallet` | `location.replace` to **`shop.battleasia.gg/user/wallet`** (or local `:8083`) |
| `/user/transfer` | Same → shop transfer URL |

**Session handoff:** append tokens in URL **hash** (`ba_a`, `ba_r`) so shop subdomain receives session (ports don’t share storage). Preserve **theme query** from player app.

**Nav Shop / Transfer** and shortcuts **B / T** call `openBacShop(...)`.

Demo builder: either stub shop in new tab with “Demo shop” page or iframe placeholder — document that production uses separate origin.

---

## 13. Labs — `/user/labs` (feature-flagged)

Index grid of experiments; each card shows **ON/OFF** from **`fetchP2Flags`**.

| Path | Lab | Demo behavior |
|------|-----|----------------|
| `live` | Live + gifting | Room list, hearts, gift BAC |
| `watch` | Watch party | Spectate + lobby chat |
| `clans` | Clans / wars | Roster, war actions |
| `fantasy` | Fantasy lineups | Pick lineup, score |
| `duel` | 1v1 duels | Challenge, wager |
| `cosmetics` | Customization store | Catalog stub |
| `ocr` | OCR results | Screenshot upload ingest |

When flag **off**, show “coming soon” / disabled state but keep route for QA. **More → Labs** hidden until at least one flag true.

---

## 14. Cross-cutting UI components

- **CoinValue** — BAC formatting + icon sizes
- **SpotBar** — participant fill bar
- **UserAvatar** — image URL helper
- **VerifiedBadge**, **RankBadge**
- **FilePick** — media picker for posts/stories/labs
- **ErrorBoundary** around outlet
- **MobileDrawer** icons for bottom nav variants where used

---

## 15. Data & mock strategy

**Live API (recommended):** Express API `5050` — games, matches, join, chat, social feed, earn, referrals, wallet tip, notifications.

**Mock/demo fallback:**

- Static game list + 3–5 matches per game with joinable status
- Feed: 8–15 posts with WebP `/covers/` previews; comment sheet with local state
- Balance: single number in context, decrement on join
- Shop: alert “Opens shop.battleasia.gg”
- Labs: all flags on for demo

**Media:** prefer `-sm.webp` preview URLs; lazy `loading="lazy"`; aspect-ratio boxes.

**Seed (dev):** `npm run seed:social` in API repo for feed content.

---

## 16. One-page / multi-view demo layout

For a **single HTML demo**, use a small SPA router:

```
┌─────────────────────────────────────────┐
│ UserShell (nav + balance + bell)        │
├─────────────────────────────────────────┤
│ Active view: Play | List | Detail |     │
│ Feed | Earn | Referral | Account        │
├─────────────────────────────────────────┤
│ Overlays: Join sheet | Comments sheet | │
│ Shortcuts (?) | Leave confirm           │
└─────────────────────────────────────────┘
```

Minimum demo path: **Play → PUBG list → Join sheet → Lobby mock → Feed with comment sheet**.

---

## 17. Copy & i18n (minimum)

English + Bengali for: nav, HUD shortcuts, match join/errors, feed tabs, comment sheet, earn tab names, referral, account sidebar, profile actions, empty states.

Key strings: Play, Shop, Earn, Transfer, Feed, More, Labs, Referral, Join, Ready, Leave, Room copied, Insufficient balance, No comments, Reply, Saved, Explore, Messages.

---

## 18. Acceptance checklist

- [ ] RequireAuth wraps all player routes; returnTo preserved
- [ ] UserShell nav + balance + hide balance + notifications badge
- [ ] Mobile drawer nav; feed/play responsive sheets
- [ ] Play hub with open-match counts
- [ ] Match list filters + join dialog with balance check
- [ ] Match detail: join, room copy, ready, chat, leave
- [ ] Result page with placement table
- [ ] Feed tabs; stories row; IG-style comment bottom sheet with replies
- [ ] DM list + thread on mobile
- [ ] Earn tabs with at least overview + missions mock
- [ ] Referral link copy + stats table
- [ ] Shop hub + wallet/transfer redirect or stub
- [ ] Account sidebar + profile edit validation
- [ ] Public profile follow/message/tip
- [ ] Keyboard shortcuts sheet (?)
- [ ] Theme accent dock; no light/dark toggle required
- [ ] Lazy images; no CLS on match cards

---

## 19. Reference code (this repo)

| Area | Path |
|------|------|
| Routes + auth gate | `battleasia.gg/src/App.tsx` |
| Shell / HUD | `battleasia.gg/src/components/user/UserShell.tsx` |
| Account layout | `battleasia.gg/src/components/user/AccountLayout.tsx` |
| Play / list / detail / result | `battleasia.gg/src/pages/user/Play.tsx`, `MatchList.tsx`, `MatchDetail.tsx`, `MatchResult.tsx` |
| Join sheet | `battleasia.gg/src/components/MatchJoinDialog.tsx` |
| Feed | `battleasia.gg/src/pages/user/Feed.tsx`, `FeedPost.tsx` |
| Comments sheet | `battleasia.gg/src/components/feed/FeedCommentsSheet.tsx`, `FeedMedia.tsx` |
| Feed previews | `battleasia.gg/src/lib/feedMedia.ts` |
| Profile | `battleasia.gg/src/pages/user/Profile.tsx` |
| Earn | `battleasia.gg/src/pages/user/Earn.tsx` |
| Referral | `battleasia.gg/src/pages/user/Referral.tsx` |
| Labs | `battleasia.gg/src/pages/user/Labs.tsx`, `battleasia.gg/src/lib/p2.ts` |
| Shop handoff | `battleasia.gg/src/pages/user/Shop.tsx`, `Wallet.tsx`, `Transfer.tsx`, `battleasia.gg/src/lib/wallet.ts` |
| HUD context | `battleasia.gg/src/contexts/HudContext.tsx` |
| Styles | `battleasia.gg/src/styles/play.css`, `phone.css`, `phone-hub.css`, `tokens.css` |
| APK parity | `battleasia-app/lib/presentation/screens/` (play, feed, auth) |

---

## 20. Local demo credentials (API connected)

- Player: `player@battleasia.local` / `Player@123456`
- Shop dev origin: `http://localhost:8083` (`VITE_BAC_SHOP_URL`)
- Player dev: typically `8082`; API `5050`

---

## 21. Out of scope (explicit)

- Landing marketing sections (separate master prompt)
- Full auth flows (separate master prompt)
- **Admin panel** (`localhost:3000` admin app)
- Complete **shop checkout**, withdrawal KYC, payment gateways on player domain
- Pixel-perfect parity with Flutter APK (use repo for behavior reference)

---

**End of master prompt.** Copy sections **0–18** (or entire file) into your builder AI as the single source of truth for **Post-login Player Arena**.
