# BattleAsia — Redesign Prompt (New Look, Same Product)

> Goal: rebuild BattleAsia with a **brand-new visual design** while keeping **100% of the product** — same features, data, API, flows, and infra. This prompt is **design-agnostic**: it tells you *what every screen must do and contain*, but the *look* is yours to invent. Nothing functional should be lost in the redesign.
>
> For the exhaustive technical spec (every model, endpoint, env var), read the companion file `BATTLEASIA-MASTER-PROMPT.md`. This file focuses on **what to redesign and the UI requirements per surface**.

---

## 0. What stays vs. what changes


| Keep exactly (do NOT change)                                      | Redesign freely (NEW)                                      |
| ----------------------------------------------------------------- | ---------------------------------------------------------- |
| Backend API, all endpoints (v1–v4), 52 data models                | Full visual language: colors, typography, spacing, shapes  |
| Auth (JWT), roles, RBAC                                           | Layout of every page, component styling                    |
| BAC currency + money flows (deposit/withdraw/match/transfer)      | Landing/home story, hero, section order & style            |
| All routes, screens, and features (nothing removed)               | Iconography, illustrations, motion, imagery                |
| Socket.IO realtime events                                         | Navigation pattern (as long as all destinations reachable) |
| Web ↔ APK feature parity rule                                     | Empty/loading/error/success visual treatments              |
| Performance budget (Lighthouse 90+, LCP<2.5s, CLS<0.1, TBT<150ms) | Whether accent is user-selectable, dark/light, etc.        |


**Rule:** a user of the old app must find **every feature** in the new one. Redesign = new skin + new layout, **not** new scope.

---



## 1. Design brief (fill this in before building)

Define the new identity up front so the redesign is intentional, not random:

- **Brand vibe:** (e.g. premium esports / clean fintech / neon arcade / minimal dark / bold sporty) → `______`
- **Color system:** primary, accent, success/danger/warning, surfaces, text tiers → `______`
- **Dark / light / both:** `______`
- **Accent color switcher (REQUIRED):** users can pick their accent from multiple color presets (keep this feature from the current product — see §2.1). Choose the preset palette → `______`
- **Typography:** display/heading font + body font (WebP/WOFF2 self-hosted for perf) → `______`
- **Shape language:** corner radius, border style, elevation/glass/flat → `______`
- **Motion:** subtle/none/expressive (must stay off the LCP critical path) → `______`
- **Imagery:** photography / 3D / illustration / game art treatment → `______`
- **Logo + wordmark:** new `BATTLE ASIA` treatment → `______`

Everything below must be expressed **through** this new brief.

---



## 2. Global design system to build (all apps)

Design one shared component/token set so web, shop, admin, and APK feel like one product:

- **Tokens:** color roles, spacing scale, radii, shadows/borders, typography scale, z-index, breakpoints.
- **Core components:** button (primary/secondary/ghost/danger, loading, disabled), input/select/textarea/phone/OTP, checkbox/switch/radio, card/surface, modal/dialog/bottom-sheet, drawer, tabs, table/data-grid, chip/badge, avatar, tooltip, accordion, carousel, pagination, breadcrumb.
- **App shell:** top header (logo, balance pill, notifications, account, language, accent), primary nav, footer/bottom-nav, page shell/container.

### 2.1 Accent color switcher (REQUIRED — keep from current product)
- Users select their **accent color** from several presets (current app ships 8: lime, gold, ember, jade, cyan, violet, rose, sky). Redesign the presets to fit the new brand, but the **feature must remain** on both web and APK.
- Implement with CSS variables (`--ba-gold*` equivalent) so the whole UI recolors instantly; persist the choice (web `localStorage: ba-accent`, APK `SharedPreferences: ba-accent`) and bootstrap it before first paint (no color flash).
- The accent picker lives in the header (a small color/theme popover), available logged-out and logged-in.
- **State treatments (design ALL of them):** loading skeletons, empty states, error states, success/confirmation, toasts, inline validation, offline banner.
- **Data viz:** stat tiles, live counters, progress bars, leaderboards, charts.
- **Brand loader:** boot/splash loader (must be light; one consistent loader across every page/session).

---



## 3. Player web (`battleasia.gg`) — surfaces to redesign



### Landing / home (`/dashboard`) — new hero + sections

Redesign the story, but keep these blocks (anchors `#home #about-us #how-to-play #rules`):

1. **Hero** — brand wordmark, primary CTA (Enter Arena), **APK download** CTA, trust signals. (New look; old was PUBG-style — invent your own.)
2. **Live pulse** — live stats, top players, high-prize/ongoing matches (data from public API + socket).
3. **Play your game** — PUBG, Free Fire, COD, MLBB, Valorant (coming soon) with live counts.
4. **About** — story + stats.
5. **How to play / modes** — Solo, Duo, Squad, TDM.
6. **Rules / FAQ** — accordion (fair-play, match-ops, prizes, payment rules).
7. **Footer** — partners, socials, payment methods (bKash/Nagad/crypto), legal links.



### Auth pages

Sign-in, sign-up (2-step: credentials → PUBG ID/phone/game server/terms), forgot-password, reset-password, email-verification.

### After-login user area (all `/user/*`)

- **Play:** game picker → match list (per game) → match detail + join → match result. Show entry fee, prize, spots progress, room ID/password after join.
- **Wallet + Earn:** balance, withdrawable, balance history, engagement/earn hub (missions, streak, welcome, referral, weekly, squad, spin, season). Withdraw flow.
- **Shop (in-app):** marketing + coin packs; heavy store links to shop app.
- **Referral:** code/link share, network, commissions.
- **Feed / social hub** — **must look and feel like Instagram** (see §3A for the full spec): profiles, posts, stories, reels, live, and direct messaging.
- **Profile:** own profile/edit + public profile (follow/block/report, followers/following, suggested, premium activation).
- **Account pages:** my-matches, my-orders, my-statistics, my-referrals, notifications, leaderboard, customer-support (tickets + chat).
- Public: `/profile/:userId`, `/privacy-policy`, `/terms-and-conditions`, `/support`.

**Functional constraints:** JWT auth guard on `/user/`*; email-verify + password-reset flows; `returnTo` redirect; `?ref=` capture; live updates via socket (balance, notifications, matches, messages).

### 3A. Social feed — Instagram-style (web + APK, full parity)

The whole social area must **look and behave like Instagram**, adapted for a gaming/esports brand. Same familiar patterns players already know.

**Layout & navigation**
- **Home feed:** vertical scroll of posts; **stories tray** pinned at the top.
- Mobile bottom tabs (IG-style): **Home · Explore/Search · Create (＋) · Reels · Profile**; a **DM/inbox icon** top-right of the feed. (This social nav is inside the Feed area; the app's main nav stays Play/Shop/Referral/Feed.)
- Desktop: centered feed column + right rail (suggested players to follow, trending).

**Posts (like IG posts)**
- Image/video posts, multi-image **carousel** (swipe dots), caption with **#hashtags** and **@mentions**.
- Actions: **like (double-tap + heart), comment, share/send, save/bookmark**; like count, view count.
- Comments: threaded replies, @mentions, emoji, like-a-comment.
- Post detail page; report/hide/mute; edit/delete own post.

**Stories (like IG stories)**
- Circular avatars with gradient ring; tap = full-screen 5s auto-advance, tap to skip, hold to pause, swipe for next user.
- Create: photo/video, **text + stickers**, **poll/quiz sticker**; **reply to a story via DM**; **story reactions**; viewers list; auto-expire (24h); optional **highlights** pinned on profile.

**Reels (like IG reels)**
- Full-screen vertical swipe player; like/comment/share/save; caption + hashtags; creator follow button; view tracking.
- Create: upload/record video, cover pick, caption; optional music/sound label.

**Live (like IG live)**
- Players can **go live**; viewers join, see live viewer count, send live chat comments and reactions (hearts). Host can end; optionally save the replay as a reel.
- A **LIVE** ring/badge on the creator's story avatar while live; "LIVE" section in Explore.

**Direct Messages (like IG DMs)**
- Inbox list, 1:1 **and group/squad chats**; text, **media/attachments**, emoji, message reactions, reply-to-message, read receipts, typing indicator (realtime socket).
- **New message** (user search), **message requests** (spam control), share a post/reel/profile into DM, online presence dot, block/report/mute.

**Profiles (Instagram-style player profile)**
- Avatar, username + **verified badge**, bio, links, **stats row: posts / followers / following** (+ gaming stats: matches, wins, rank/tier).
- **Follow / Message** buttons; **grid of posts** (tabs: Posts · Reels · Tagged); story **highlights** row; pinned posts.
- Public profile at `/profile/:userId`; own profile editable.

**Discovery**
- **Explore/Search:** search users/hashtags; grid of trending posts/reels; suggested creators; follow topics/games.

**Esports flavor (keep the gaming identity on top of IG patterns)**
- **Match highlight / clip** posts; **victory auto-post** ("Won 2000 BAC 🏆" — tie to match/wallet); **achievement/badge/streak** share; game-tagged posts and per-game feed filter.

**Realtime:** new post/like/comment/follow/DM/live events via socket; social notifications (likes, comments, follows, mentions, DMs).

### 3B. Social — full idea list (build order)

Everything discussed, grouped so nothing is lost. Build **P0 → P1 → P2**.

**P0 — core IG parity (ship first, mostly existing API + UI):**
- Feed with posts (image/video, multi-image carousel), like/comment/save/share, threaded comments, @mention, #hashtag.
- Stories (create/view, text + stickers, viewers, 24h expire, reply-via-DM, reactions).
- Reels (vertical player + create).
- DMs (1:1, media attachments, read receipts, typing, block/report, new-message search).
- IG-style profile (avatar, verified, posts/followers/following stats, post grid, Follow/Message).
- Explore/search (users, hashtags, trending grid, suggested creators).
- Reactions beyond like (🔥 GG 👏), save collections/folders, hashtag pages, nice empty/loading states.

**P1 — esports differentiators (makes it unique):**
- **Match highlight / clip** posts; **victory auto-post** ("Won 2000 BAC 🏆", tied to match/wallet).
- **Achievement / badge / streak** share; game-tagged posts + per-game feed filter; **tournament feed** ("following your games").
- **Story poll/quiz stickers**; story **highlights** pinned on profile; pinned posts.
- **Group / squad chat**; share a post/reel/profile into DM; message **reactions** + reply-to-message; online presence dot; **message requests** (spam control).

**P2 — bigger (new backend, later):**
- **Live** (go-live, live chat + heart reactions, viewer count, LIVE ring, save replay as reel) + **watch party** for live matches.
- **"For You"** ranked feed; **top creators leaderboard**.
- **Voice notes** in DM; media gallery per chat; keyword filter / mute words.
- External share (WhatsApp/Telegram) + deep links; duet/stitch-lite for reels; music/sounds library.

---



## 4. Shop web (`shop.battleasia.gg`) — surfaces to redesign

**This is a SEPARATE app** on its own subdomain `shop.battleasia.gg` (its own codebase, its own login/session gate) — **not** a page inside the main site. The main site's in-app "shop/wallet" links out to this app (`VITE_BAC_SHOP_URL`). It shares the same account/API but requires a fresh sign-in per shop tab session (tab-scoped gate). Keep this separation.

Dedicated **BAC coin store**. Redesign but keep:

- Auth pages (full set) + **tab-scoped login gate** (must sign in per shop tab session).
- **Shop:** coin packs, payment channel + currency select, premium discount, buy = manual deposit submit (address/QR + transaction proof) with "waiting for admin approval" state.
- **Wallet:** total BAC + fiat equivalents, withdrawable, transaction history (this is the order/purchase history surface).
- **Transfer:** P2P BAC (recipient, amount, fee, note, history).
- **Withdrawal:** withdrawable + rates, payout (bKash/Nagad/crypto) + history.

---



## 5. Admin web (`admin.battleasia.gg`) — surfaces to redesign

Redesign the admin UI (dense, data-heavy, tables/forms) but keep every section:

- **Auth:** login + optional OTP.
- **Dashboard:** overview stats.
- **Users:** list/CRUD, balance adjust, status, roles/permissions (RBAC), history, online, premium, referral-settings, transfer-settings, referral-history.
- **Games:** game CRUD, matches CRUD + results, participants history.
- **Balance:** platform-wide ledger.
- **Payments:** channels + business wallets CRUD; deposits approve/reject; withdrawals approve/process/complete (live pending badges).
- **Shop:** coin pack CRUD, coin rates.
- **Notifications:** broadcast/targeted push.
- **Feed:** posts, categories, profile-social-settings, social-reports, reels-moderation.
- **Customer support:** inbox, thread reply, live-chat + messaging-provider settings.
- **Engagement:** missions, badges, settings.
- **System:** mail settings, **App Download (APK upload + version + toggle)**.
- **Profile**, 404.

---



## 6. Flutter APK (`battleasia-app`) — surfaces to redesign

Native Android app — apply the **same new design language** as web (parity). Keep all 30 screens:

- Splash → auth wrapper (authed → Play, guest → Sign In). Bottom nav: Play, Shop, Referral, Feed. Header: logo, balance, notifications, account drawer, language, accent.
- Auth (sign-in with **remember email+password**, 2-step sign-up, verify, forgot/reset).
- Play / match list / detail / result.
- Shop (login gate) + shop nav (Shop/Wallet/Transfer/Withdraw) + buy flow.
- Wallet (Overview/Earn/History).
- Feed hub (Feed/Explore/Reels/Saved/Messages) + stories, composer, reel create/player, DM (new chat, attachments, block/report, external fallback).
- Profile/account + public profile (follow/block/report, follower lists, suggested).
- My-matches/orders/statistics/referrals, referral hub, notifications (socket live), leaderboard, customer support.

**Keep technical:** same API (`AppConfig`), socket events, `net.battleasia.app`, minSdk 24 / target 36, ABIs arm64+armv7+x86_64, **release-keystore signing** (never debug), build via `build-release-apk.ps1` → publish `api/uploads/app/BattleAsia.apk`.

---



## 7. Cross-cutting requirements (still mandatory in the new design)

1. **Web ↔ APK parity** — every auth/shop/after-login screen must match in behavior and visual intent on both.
2. **Performance gate** — Lighthouse 90+, LCP<2.5s, CLS<0.1, TBT<150ms. Heavy libs (framer-motion, three.js, socket.io, carousel) dynamic-imported, never on LCP path. WebP/AVIF, fixed dimensions, lazy below-fold, route code-split, one light boot loader.
3. **Responsive + mobile-first**, reserve space (no layout shift).
4. **Accessibility** — contrast, focus states, labels, keyboard nav.
5. **All states designed** — loading/empty/error/success everywhere, not just the happy path.
6. **i18n-ready** — layouts must survive en/bn/zh/hi/ur text lengths.

---



## 8. Deliverables checklist (so nothing is missed)

- [ ] Design brief (Section 1) filled in
- [ ] Global tokens + component library (Section 2) for web + APK
- [ ] Player web: landing (7 blocks) + all auth + all `/user/*` pages
- [ ] Shop web: auth + shop + wallet + transfer + withdrawal
- [ ] Admin web: every section in Section 5
- [ ] Flutter APK: all 30 screens re-skinned, parity verified
- [ ] All component states (loading/empty/error/success/toast)
- [ ] Micro-interactions + edge cases + error handling (Section 12) on web, shop, admin, APK
- [ ] New brand assets (logo, wordmark, hero media, game art, fonts, favicon, app icon)
- [ ] Performance + parity + a11y verified before "done"

---



## 9. New assets you must create (old ones are being replaced)

Since this is a new look, you will produce fresh: brand logo + `BATTLE ASIA` wordmark, hero image/video + poster, 5 game cover arts, mode art (solo/duo/squad/tdm), payment icons, favicon, Android adaptive app icon, fonts, and any illustrations. Everything **functional/technical stays** as in `BATTLEASIA-MASTER-PROMPT.md`; only the **skin** is new.

---

## 10. Premium polish — how to make it "wow" (not just clean)

Apply these to lift the design from good to premium. All must respect the performance gate (Section 7): motion/particles are dynamic-imported and off the LCP critical path; images WebP/AVIF.

### 10.1 Depth & light
- Subtle **aurora gradient mesh glow** (accent color) blurred behind hero + key cards only — not flat.
- **Glass top nav**: background blur + thin gradient border; sticky on scroll.
- Two-tier soft shadows + faint **noise/grain** texture for an "expensive" feel.
- Accent-only glow (buttons, live dot); everything else stays neutral.

### 10.2 Motion & micro-interaction (perf-safe)
- Number **count-up** (balance, prize, players); animated **progress-bar fill**.
- Card **hover lift + cursor spotlight** (desktop); **gradient shimmer/pulse** on primary buttons.
- **Skeleton shimmer** loading; smooth page/tab transitions.
- **Win celebration** (coin burst / confetti); **streak flame** animation.

### 10.3 Signature hero
- **3D character cutout** or parallax layers (subject vs background move independently).
- **Animated gradient wordmark** + light spark/particle FX (lightweight canvas), or short **hero video** loop behind a poster.

### 10.4 Typography craft
- Strong display↔body contrast; tight tracking on big headlines.
- **Gradient text** on one key word/number (e.g. prize, "ASIA").
- **Tabular/mono numerals** for stats and balances (clean alignment).

### 10.5 Iconography & game-art treatment
- Custom **line + gradient icon set**; **hexagon-framed** game icons.
- Consistent **duotone/gradient overlay** on all game banners so every card looks premium (not random screenshots).
- **Rank/tier badge** system (Bronze → Elite) on profile, leaderboard, match cards.

### 10.6 Delight & richness
- **Custom illustrations** for empty states (not bare text).
- **Bento-grid** (asymmetric card sizes) on landing for a modern, unique layout.
- Live **pulse** on "LIVE" dots; animated leaderboard rows.
- Achievement/badge showcase, streak calendar, season-pass **progress ring**.

### 10.7 Consistency (the silent 80%)
- Strict **8pt grid**; one radius scale + one shadow-tier scale used everywhere. Without this, nothing feels "beautiful".

---

## 11. Unique features & extra-earn roadmap

Goal: turn BattleAsia from "play & withdraw" into a **play + earn + social ecosystem**. Build **P0 → P1 → P2**.

> **HARD REQUIREMENT — every feature below must be admin on/off toggleable.** Each is a module with an enable flag (default OFF for anything not yet ready), stored in the global config (`AppSettings`, same pattern as existing engagement/transfer/messaging settings) and surfaced in the **Admin panel** (grouped "Feature Flags" / per-module settings). Clients must **hide the entire UI + block the API** when a feature is OFF. Where relevant, admin also controls the numbers (rates, fees, reward amounts, limits, min/max).

### A. Extra earn — new income for users
- **Creator earning + live gifting** — earn BAC from reel/post performance; viewers send **BAC gifts** during live, creator withdraws (platform cut % — admin set).
- **Watch-to-earn** — small BAC for watching live matches / reels / sponsored clips (daily cap — admin set).
- **Match prediction / fantasy** — predict winners or draft a fantasy squad → BAC reward pool (skill-based, not betting).
- **1v1 / wager challenge** — challenge a friend for a BAC stake; auto result; platform fee %.
- **Task / quest marketplace** — sponsored tasks (follow, install, survey) pay BAC.
- **Tip / gift players** — tip a favorite player or gift during live.
- **Deeper referral / affiliate** — multi-tier + sub-affiliate, referral leaderboard/contests.
- **Cashback + deposit-bonus days** — enrich existing bonus logic.

### B. Unique competitive layer
- **Ranked seasons + divisions (MMR)** — Bronze→Elite, season rewards.
- **Clans / Teams + Clan Wars** — clan treasury, clan leaderboard, team pages.
- **Auto bracket / knockout tournaments** — single/double elimination.
- **Scrim / custom-room hosting** — host a room for a fee.
- **Faster results** — screenshot/OCR or game-API assisted result entry (less manual admin, faster payout).

### C. Economy health — BAC sinks (must balance the earn side)
> More earning needs more spending or the coin loses value. These are the sinks.
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

### Recommended first unique set (highest impact)
1. Live streaming + gifting (creator earn)
2. Match prediction / fantasy (extra earn, low risk)
3. Clans + Clan Wars (retention + competitive)
4. Profile customization store (BAC sink → healthy economy)
5. 1v1 wager challenge (viral, unique)

**Net effect:** users earn by **playing, creating, referring, and watching** — while cosmetic sinks keep BAC valuable — and admin can switch any module on/off and tune every rate/fee/limit.

---

## 12. UI/UX micro-interactions, edge cases & error handling

**Required on player web, shop web, admin, and APK** (same intent; platform-native motion). Happy path is not enough. Every screen in this prompt must have loading, empty, error, success, and the edge cases below. Motion stays **off the LCP path** (CSS / lightweight; no blocking libraries).

### 12.1 Shared interaction language

- **Press:** buttons compress slightly; disabled = no press, tooltip *why* (e.g. “Match full”, “Need 50 BAC”).
- **Focus:** visible keyboard ring; Enter submits the focused form; Esc closes dialog / sheet / lightbox.
- **Copy:** TrxID, room ID, password, referral, wallet address → “Copied” toast 1.5s.
- **Numbers:** BAC / prize / spots **count-up** on first view; header balance **ticks** on `balance-updated`.
- **Progress:** join spots, season pass, upload %, withdrawable — fill animation, not a jump.
- **Like / save / follow:** optimistic UI; heart pop; undo if API fails (rollback + toast).
- **Pull-to-refresh** on APK lists (play, feed, wallet, notifications); web: refresh control or stale-while-revalidate.
- **Haptics (APK):** light on tap, success on join/deposit submit, error on fail. Respect system reduce-motion / haptics off.
- **Toasts:** success / info / warning / error; one at a time; action link when useful (“Open wallet”). Never block the CTA.
- **Dialogs:** confirm destructive / money actions (join paid match, transfer, withdraw, admin approve/reject/ban). Confirm labels name the action (“Join for 50 BAC”), not generic “OK”.
- **Offline banner** (sticky, non-modal) when network drops; auto-hide on reconnect; queue-safe: do not double-submit money on retry.
- **Reduce motion:** honor `prefers-reduced-motion` / OS setting — skip count-up, burst, shimmer; keep state changes instant.

### 12.2 Global loading & boot

- One **brand boot bar** (logo + thin bar, no fake percent) once per session; then **skeletons** matching layout (cards, rows, story rings) — not a full-page spinner on every route.
- Button loading: spinner **inside** the button, label “Joining…” / “Sending…”; prevent double-click.
- Uploads (receipt, avatar, reel, story): progress + cancel; fail → retry, file stays selected.
- Pagination / infinite scroll: footer spinner; end-of-list line; no duplicate page fetch.
- Socket reconnect: silent reconnect; if > few seconds, “Reconnecting…” chip; after recover, refresh pending badges / balance.

### 12.3 Auth edge cases

| Case | UI |
|------|----|
| Empty / invalid email, weak password | Inline field error, not only toast |
| Wrong password | “Incorrect email or password” + forgot-password link; do **not** reveal which field |
| Unverified email | 403 → verify screen; resend with **cooldown timer** |
| Expired / used reset or verify code | Clear “code expired” + resend |
| Rate limit (100/15 min) | Wait-N-seconds message; disable submit |
| Session expired / 401 | Sign-in with `returnTo`; no data loss of typed forms if possible |
| Shop tab missing `ba_shop_gate` | Shop sign-in only — **do not** sign out the main site |
| Remember-me APK | Prefill email+password from `ba_remember_*`; still allow edit |
| `?ref=` | Capture silently; show applied referral on sign-up success |
| 2-step sign-up back | Keep step-1 values; don’t wipe on validation fail |

### 12.4 Play / match edge cases

| Case | UI |
|------|----|
| No games / no matches | Illustrated empty + “Check back” / notify |
| Valorant coming soon | Disabled card, not a dead click |
| Match full / already started / cancelled | Badge + Join disabled + reason |
| Already joined | “Joined” + room reveal (ID/password) + copy |
| Insufficient BAC | Join opens “Need X BAC” → Shop / Wallet CTA |
| Premium-only match | Lock + Premium activate path |
| Join in-flight | Button locked; on fail restore + toast (balance unchanged) |
| Room not yet published | “Room drops at start” waiting state, then socket reveal |
| Result pending | Skeleton/placeholder “Results soon” — never fake winners |
| After result | Win burst **once**; loss = calm summary; winnings in history |
| Feature flag OFF | Hide Play module / mode entirely |

### 12.5 Wallet, shop, deposit, withdraw, transfer

| Case | UI |
|------|----|
| BAC = 0 | Empty wallet illustration + first-deposit CTA |
| Deposit waiting admin | Persistent “Pending review” (not a one-shot toast) |
| Deposit rejected | Reason + resubmit |
| Duplicate submit | Idempotent; “Already submitted” |
| Missing receipt / TrxID | Inline required; cannot submit |
| Withdraw > withdrawable (70% match-bet rule) | Live remaining + why locked |
| Withdraw / transfer below min or above max | Inline limit from settings |
| Transfer to self / unknown user | Block with copy |
| Fee preview | Amount + fee + **net** before confirm |
| Channel / wallet missing | “Payments paused” — no broken QR |
| Coingo fail / timeout | Retry + fallback to manual |
| High-value (admin ≥ 1000 BAC) | Password / 2FA confirm |
| Socket `balance-updated` | Header + wallet tick; no full remount |

Money actions: **disable submit until the response**; never double-charge on retry; success screen with amount + “View history”.

### 12.6 Feed / social / DM

| Case | UI |
|------|----|
| Empty feed | Suggested follows + Explore CTA |
| Failed image / video | Broken-media placeholder + retry |
| Story expired | Skip; ring gone |
| Mute / hidden / blocked | Removed from feed; blocked profile = limited view |
| Message request | Requests inbox; not in main DM until accept |
| Send fail | Unsent with retry (no silent drop) |
| Live ended | “Live ended” → replay/reel if any |
| Report / hide | Confirm + “Thanks, we’ll review” |
| Upload too large | Size cap message (5MB default, 100MB reel/story) |
| Notifications empty | Calm empty, not error |

Optimistic like/follow/save; rollback on error.

### 12.7 Admin ops edge cases

| Case | UI |
|------|----|
| Empty table / filter no rows | Icon + “Clear filters” |
| Bulk with 0 selected | Toolbar hidden |
| Bulk reject | Reason required |
| Payout > collected fees | **Block submit** + numbers |
| Receipt missing | Copy still works; lightbox no-op with “No image” |
| Audit / export large | Progress; don’t freeze UI |
| Permission denied | Hide nav; 403 page if deep-linked |
| Chime flood | Mute in header; no stacked audio |

### 12.8 HTTP & system errors (map every API call)

| Signal | Player-facing |
|--------|----------------|
| 400 / validation | Field-level messages from API |
| 401 | Re-auth, keep `returnTo` |
| 403 email | Verify flow |
| 403 other | “You can’t do that” + support |
| 404 resource | Illustrated not-found + back |
| 409 conflict (already joined, duplicate) | Specific copy |
| 413 upload | File too large |
| 429 | Cooldown timer |
| 5xx / network | Retry button; APK offline illustration |
| Timeout | Retry; money endpoints extra caution (check history before resubmit) |

**Copy rules:** human, i18n (en/bn/zh/hi/ur), no raw stack traces, no “undefined”. Support link on persistent failures.

### 12.9 Form & input edges

- Required / format / min-max / OTP length — inline, on blur + submit.
- Password show/hide; strength meter on change-password (admin + player).
- Phone / PUBG ID: server + region rules.
- Paste TrxID / room codes: trim whitespace.
- Unsaved form leave: confirm (profile, match create, deposit proof).
- Autofill-friendly auth fields; `autocomplete` attributes.

### 12.10 Device / a11y edges

- Slow 2G: skeletons + compressed images; no autoplay video (hero poster first).
- Notch / safe-area; APK JOIN / shop CTA never clipped.
- Landscape web ok; APK portrait-only (existing) — don’t break.
- RTL-unneeded but **long bn/ur strings** must not overflow buttons.
- Color not the only error signal (icon + text). Contrast WCAG AA.
- Tap targets ≥ 44px on mobile.

**Done for this section:** a QA pass that hits every table row on web + shop + APK (admin rows on admin). If a state has no UI, it is not shipped.