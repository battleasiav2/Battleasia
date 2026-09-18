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

### 0.1 Two player products (PC Web + Native Android)

Rebuild **both**. Phone users use the **APK**. Computer users use **web**. Do not replace the native app with a mobile website.

| | **PC Web** (`battleasia.gg` + shop) | **Native Android** (`battleasia-app`) |
|--|--------------------------------------|----------------------------------------|
| Role | Full **desktop** product | Full **phone** product |
| Shell | Wide canvas, left/top HUD, hover, **keyboard §16** | Bottom nav, drawers, bottom sheets, haptics |
| **First screen** | **Landing** (`/` → `/dashboard`) | **Auth** (Splash → Sign In / Sign Up) |
| Then | Landing CTA → `/auth/*` → `/user/play` | After login → Play (no landing in between) |
| Auth screens | PC split layout | Native widgets, remember email+password |
| Shop | PC shop app + its auth | Native shop + `ShopAuthGate` |
| Landing / hero | **Required on PC** (incl. APK download CTA) | **Forbidden on APK** — do not clone the website home |

**PC = landing dia dhuke. APK = sudhu auth dia dhuke.** Same account + API. Layout native to each.

---



## 1. Design brief (LOCKED — Aurora Arena)

Do **not** leave these blank. This is the new look for the rebuild:

- **Brand vibe:** premium esports × modern fintech — confident, airy, international-legible. **Not** gold-glass PUBG clone.
- **Color system:** Dark page `#0E0F14`, surface `#171922`, text `#F4F5F7`, muted `#A0A4B8`. Light page `#F7F8FB`, cards `#FFFFFF`, ink `#12131A`. Accent gradient `#7C5CFF → #21D4FD`. Success `#28E0A0`, danger `#FF5C7A`, warning `#FFC24B`. Hairline white 8–14%.
- **Dark / light / both:** **Both required.** Toggle + 8 accent presets.
- **Accent switcher:** lime, gold, ember, jade, cyan, violet, rose, sky — CSS `--ba-accent`, `--ba-accent-glow`, `--ba-accent-hover`; persist `ba-accent`; **before first paint**.
- **Typography:** headings Space Grotesk / Clash Display / Barlow / Syne (bold condensed). Body Inter / Public Sans / Poppins. **Tabular numerals** for BAC.
- **Shape:** 8pt grid only; cards 12–16px radius; buttons/inputs 8–12px; chips pill. Flat luminous cards; glass only on sticky nav.
- **Motion:** count-up, slot progress, hover lift, shimmer — **off LCP** (dynamic import). Honor `prefers-reduced-motion`.
- **Imagery:** hex game frames, duotone covers, aurora mesh behind hero/winners. 5 unique game arts, PUBG first.
- **Logo + wordmark:** new `BATTLE ASIA 2.0` (gradient on one word). PC landing hero; **not** on APK (APK has no landing).

### 1.1 No Figma / no manual design (REQUIRED)

The operator will **not** draw in Figma or supply a custom icon set. The rebuild **generates** the visual system in code:

| Surface | How (automatic) |
|---------|-----------------|
| **Buttons / inputs / cards** | One component kit from §17 tokens. Primary / secondary / ghost / danger + 5 states. No per-page one-off buttons. |
| **Icons** | One **SVG icon set** in-repo (line + gradient, hex where needed). Lucide-style or custom paths — **not** PNGs from a designer. Same set on web + APK (flutter_svg or generated). |
| **Logo / wordmark** | SVG + CSS gradient text. Favicon + Android adaptive icon generated from the mark. |
| **Hero / game / mode / empty-state art** | AI-generated **WebP** (unique per game, PUBG first) + hex/duotone overlay. If a generator is unavailable, use **CSS aurora + licensed-free geometric/photo fallback**, never a broken image. Compress; fixed aspect-ratio. |
| **Pay chips** | Simple brand-colored SVG (bKash/Nagad/crypto) — not screenshots. |

**Do not block the build waiting for Figma.** Tokens in §1 + §17 are the source of truth.

### 1.2 Five games — high-quality new images + generate everywhere + fast load (REQUIRED)

The platform has **exactly these 5 titles** (order on landing and Play picker):

1. **PUBG** (first, largest/featured)
2. **Free Fire**
3. **COD**
4. **MLBB**
5. **Valorant** (coming soon — still a unique cover, card disabled)

**Landing** “Play your game” **must use new high-quality generated covers** — not the old repo screenshots, not random Google crops, not one reused poster for all five. Each game = its own atmosphere (maps/operators/colors) + consistent Aurora hex/duotone overlay so the row still looks like one product.

**Anywhere else an image is needed, generate it in the same pass** (do not leave placeholders or ask the operator):

- PC landing: hero still/poster, atmosphere/pulse bg, 5 game covers, Solo/Duo/Squad/TDM mode arts
- Auth (PC) side art
- Play grid + match cards (same 5 covers, smaller crops)
- Empty states, rank badges, APK game tiles (same files, resized)
- Shop/pay: SVG chips; optional generated pack banners
- Admin can stay UI-only (no marketing hero)

**Fast load (non-negotiable):**

- Export **WebP** (AVIF extra if easy); no raw PNG/JPEG in the critical path.
- **Max bytes:** hero ≤ ~150–200KB; game cover ≤ ~40–80KB; thumb/mode ≤ ~20–40KB. Re-compress until under cap.
- **Fixed width/height or `aspect-ratio`** on every `<img>` — **CLS = 0**.
- Landing **LCP:** only the hero (or first PUBG cover if that is LCP) gets `fetchPriority="high"`; everything else `loading="lazy"` + `decoding="async"`.
- **srcset** 1x/2x for game cards; don’t ship a 1920px file in a 280px tile.
- Same asset URLs on web + APK (or pre-resized APK copies) — don’t duplicate uncompressed blobs.
- No autoplay video on first paint; poster first. Optional short hero video **below** LCP, muted, `preload="none"`.
- CDN/`/uploads` with cache headers; Cloudflare Polish on if available.

Locked finish numbers: **§17**.

---



## 2. Global design system to build (all apps)

Design one shared component/token set so web, shop, admin, and APK feel like one product. **Locked numbers: §17.**

- **Tokens:** color roles, **8pt spacing only**, radii scale, hairline borders, typography scale, z-index, breakpoints.
- **Core components:** button (primary/secondary/ghost/danger, loading, disabled), input/select/textarea/phone/OTP, checkbox/switch/radio, card/surface, **desktop modal / mobile bottom-sheet**, drawer, tabs, table/data-grid, chip/badge, avatar, tooltip, accordion, carousel, pagination, breadcrumb.
- **App shell:** top header (logo, balance pill, notifications, account, language, accent), primary nav, footer/bottom-nav, page shell/container.

### 2.1 Accent color switcher (REQUIRED — keep from current product)
- Users select their **accent color** from several presets (current app ships 8: lime, gold, ember, jade, cyan, violet, rose, sky). Redesign the presets to fit the new brand, but the **feature must remain** on both web and APK.
- CSS root variables: **`--ba-accent`**, **`--ba-accent-glow`**, **`--ba-accent-hover`** (plus `--ba-gold*` aliases if needed). Persist `ba-accent` (web `localStorage`, APK `SharedPreferences`) and bootstrap **before first paint** (inline script / Flutter theme before first frame — **no color flash**).
- The accent picker lives in the header (a small color/theme popover), available logged-out and logged-in.
- **Five universal states** on every button, input, card, table: Default · Hover/Active · Loading · Empty · Error — see §17.2.
- **Data viz:** stat tiles, live counters, progress bars, leaderboards, charts. **Tabular numerals** for BAC/stats.
- **Brand loader:** boot/splash loader (must be light; one consistent loader across every page/session).

---



## 3. Player web (`battleasia.gg`) — **full PC / desktop app**

This surface is a **computer product**: min useful layout ~1280px, dense HUD, side navigation or top+subnav, hover, keyboard shortcuts (§16). It must still not explode if the window is narrower, but **do not design the web app as a phone UI**. Phone = APK.

### Auth pages (the entry into the product)

Full **PC auth** screens (split art + form is fine): Sign-in, sign-up (2-step: credentials → PUBG ID/phone/game server/terms), forgot-password, reset-password, email-verification. After success → `/user/play` (or `returnTo`). `?ref=` captured.



### Landing / home (`/dashboard`) — new hero + sections

Redesign the story, but keep these blocks (anchors `#home #about-us #how-to-play #rules`):

1. **Hero** — brand wordmark, primary CTA (Enter Arena), **APK download** CTA, trust signals. (New look; old was PUBG-style — invent your own.)
2. **Live pulse** — live stats, top players, high-prize/ongoing matches (data from public API + socket).
3. **Play your game** — **5 unique generated high-quality covers** in order: PUBG, Free Fire, COD, MLBB, Valorant (coming soon). See §1.2 (WebP, lazy except LCP, hex overlay).
4. **About** — story + stats.
5. **How to play / modes** — Solo, Duo, Squad, TDM.
6. **Rules / FAQ** — accordion (fair-play, match-ops, prizes, payment rules).
7. **Footer** — partners, socials, payment methods (bKash/Nagad/crypto), legal links.

### After-login user area (all `/user/*`)

- **Play:** game picker → match list → detail + **J join** → lobby (**R ready**, **Enter chat**, **C room** when released, **L leave** before start = refund) → result.
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



## 4. Shop web (`shop.battleasia.gg`) — **PC shop app**

**This is a SEPARATE desktop app** on `shop.battleasia.gg` — **not** a page on the main site, **not** a phone site. Phone shop = **native APK** shop screens. Own codebase, own **auth pages** + tab-scoped gate.

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
- **Feature flags** — every unique module on/off + rates.
- **Integrity** — ledger, fraud holds, KYC, fingerprints, match reports, disputes, **audit logs**.
- **Profile**, 404.

### 5.1 Admin enterprise (required — not a later add-on)

All list views (Users, Matches, Deposits, Withdrawals, Feed, Balance):

- Checkbox select-all (page **or** filtered set) + floating bulk toolbar.
- Bulk: deposits/withdrawals Approve + Reject (reason); users Ban/Suspend + status; feed/reels Delete/Hide.
- Export CSV + Excel; **Print** branded ledger (`@media print` hides chrome).
- Date chips: Today / Yesterday / Last 7 / This Month / custom. Column visibility + density.
- Game/Match forms: **auto slug** + override; **Generate Room ID / Password**.
- Results: live gross / fee% / net; **block if payout > collected fees**.
- Deposit receipt lightbox (zoom/pan/rotate) + copy TrxID / phone.
- High-value (≥ 1000 BAC): password or 2FA confirm.
- Profile: current password + **strength meter**; sessions list; revoke one or all others.
- Audit page: who, action, target, IP, time; filter/export.
- Socket **chime** on `new-deposit` / `new-withdrawal` + header **mute**.
- **Ctrl+K and Cmd+K** command palette; Esc closes dialogs.
- Skeleton + illustrated empty.

Additive APIs only: bulk payment/user/feed, `DELETE /sessions/:sessionId`, `POST /auth/verify-password`. If rebuilding this repo, wire existing `AdminDataGrid` rather than reinvent.

---



## 6. Flutter APK (`battleasia-app`) — **native Android product**

This is the **phone app**, not a WebView of the PC site. Same design tokens and **all features**, native patterns.

**Entry:** Splash → **Sign In / Sign Up only** (no landing, no marketing home). Authed → Play. Remember email+password. Forgot/reset/verify exist as extra auth screens, not as a website clone.

Header: logo, balance, notifications, account drawer, language, accent. Bottom nav: Play, Shop, Referral, Feed.

Keep all 30 screens:
- Play / match list / detail / result.
- Shop (login gate) + shop nav (Shop/Wallet/Transfer/Withdraw) + buy flow.
- Wallet (Overview/Earn/History).
- Feed hub (Feed/Explore/Reels/Saved/Messages) + stories, composer, reel create/player, DM (new chat, attachments, block/report, external fallback).
- Profile/account + public profile (follow/block/report, follower lists, suggested).
- My-matches/orders/statistics/referrals, referral hub, notifications (socket live), leaderboard, customer support.

**Keep technical:** same API (`AppConfig`), socket events, `net.battleasia.app`, minSdk 24 / target 36, ABIs arm64+armv7+x86_64, **release-keystore signing** (never debug), build via `build-release-apk.ps1` → publish `api/uploads/app/BattleAsia.apk`.

---



## 7. Cross-cutting requirements (still mandatory in the new design)

1. **PC Web ↔ Native APK feature parity** — after-login flows on both. **PC opens on landing. APK opens on auth only (no landing).**
2. **Performance gate** — Lighthouse 90+, LCP<2.5s, CLS<0.1, TBT<150ms. Heavy libs (framer-motion, three.js, socket.io, carousel) dynamic-imported, never on LCP path. WebP/AVIF, fixed dimensions, lazy below-fold, route code-split, one light boot loader.
3. **PC web is desktop-first**; **APK is mobile-first**. Bottom sheets / 44px / safe-area are **required on Android** (and if web is squeezed). Do not ship a phone-only website as the PC product.
4. **Accessibility** — contrast, focus states, labels, keyboard nav (web HUD §16).
5. **All states designed** — loading/empty/error/success everywhere, not just the happy path.
6. **i18n-ready** — layouts must survive en/bn/zh/hi/ur text lengths.

---



## 8. Deliverables checklist (so nothing is missed)

- [ ] Design brief (Section 1) **Aurora Arena — already locked**
- [ ] Admin enterprise (Section 5.1)
- [ ] Ship phases (Section 18): P0 live before P1/P2 unique earn
- [ ] Global tokens + component library (Section 2) for web + APK
- [ ] PC Web: **starts on landing** → auth → desktop `/user/*` + shop web
- [ ] Native Android APK: **starts on auth only** (no landing/home) → then 30 screens
- [ ] Admin web (PC): every section in Section 5
- [ ] All component states (loading/empty/error/success/toast)
- [ ] Micro-interactions + edge cases (Section 12) + production quality bar (Section 13) + security hardening (Section 14) + ledger/fraud/DR/tests (Section 15)
- [ ] Player keyboard HUD shortcuts (Section 16) on web; APK equivalent buttons
- [ ] Locked visual system (Section 17): 8pt grid, 5 states, mobile/CLS, esports polish, IG feed polish, shop trust, ship gate
- [ ] No Figma: generated SVG icon/logo kit + WebP art (§1.1)
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

See **§13.1** for the full production form bar (trim, mask, dirty, unsaved, first-error focus, etc.). Minimum here: required / format / min-max / OTP length — inline; password show/hide; phone / PUBG ID rules; paste-trim TrxID / room codes; unsaved leave confirm; autofill `autocomplete` attributes.

### 12.10 Device / a11y edges

- Slow 2G: skeletons + compressed images; no autoplay video (hero poster first).
- Notch / safe-area; APK JOIN / shop CTA never clipped.
- Landscape web ok; APK portrait-only (existing) — don’t break.
- RTL-unneeded but **long bn/ur strings** must not overflow buttons.
- Color not the only error signal (icon + text). Contrast WCAG AA.
- Tap targets ≥ 44px on mobile.

**Done for this section:** a QA pass that hits every table row on web + shop + APK (admin rows on admin). If a state has no UI, it is not shipped.

---

## 13. Production quality bar (100% ready — not optional)

This is the **ship gate** for a complete product. Apply on **player web, shop, admin, APK, and API**. Overlaps §12 on purpose: §12 is product cases; this section is the **engineering checklist** that must exist as shared utilities, not one-off hacks.

### 13.1 Forms — input quality

| Requirement | Behavior (all apps) |
|-------------|---------------------|
| **Input trimming & sanitization** | Trim leading/trailing whitespace on blur **and** before submit (email, username, TrxID, room ID, referral, wallet address, PUBG ID). Collapse internal double-spaces on single-line fields. Strip control chars. Server must trim again — never trust the client. Sanitize rich text (support, captions, bio) against XSS; store safe HTML or plain text. |
| **Inline real-time validation** | Validate on change (debounced ~300ms) + blur + submit. Show the first relevant message under the field. Schema = same zod/Yup/RHF rules as API. |
| **Auto-focus first error field** | On failed submit, `scrollIntoView` + `focus()` the first invalid field (web) / `requestFocus` (APK). Don’t only toast. |
| **Double-submit prevention** | In-flight lock on the form: ignore extra clicks/Enter until the request settles. Unmount-safe (no setState after dispose). |
| **Button loading states** | Spinner **inside** the submit button; label becomes “Signing in…” / “Joining…” / “Sending…”; button `disabled`. Never a blank freeze. |
| **Dirty state tracking** | Track `isDirty` vs initial values (react-hook-form / Flutter Form). Disable Save when clean. |
| **Unsaved changes warning** | If dirty: browser `beforeunload`; in-app route change confirm; APK `WillPopScope` / back confirm. Covers profile, match create/edit, deposit proof, admin settings. |
| **Password visibility toggle** | Eye icon on every password field (sign-in, sign-up, reset, admin login, change-password). |
| **Input masking** | Phone: BD `01XXXXXXXXX` (and IN/PK where used). Amounts: numeric, 2-decimal where fiat, integer BAC. OTP: N boxed digits. Card/crypto address: grouped display, store raw. |
| **Character counter & maxLength** | Bio, caption, report reason, support message, transfer note, reject reason — live `n / max`. Enforce `maxLength` in UI **and** API. |

Shared form kit (web + shop + admin) and matching Flutter widgets — do not reimplement per page.

### 13.2 System resilience & error handling

| Requirement | Behavior |
|-------------|----------|
| **Global error boundaries** | React `ErrorBoundary` around root **and** each route; Flutter `FlutterError` / zone + error widget. Crash = branded “Something went wrong” + Reload / Home — **never a white screen**. Log to console/server; no stack traces for users. |
| **Dynamic 404 & empty routes** | Unknown path → branded 404. Missing `:matchId` / `:userId` / `:feedId` → not-found state inside the layout, not a crash. Admin unknown section → admin 404. |
| **API timeout & network failure** | Client timeout (e.g. 15s, match APK `ApiClient`). On timeout / `ERR_NETWORK` / DNS: human copy + Retry. Money POSTs: Retry must **check history / status** first (no blind resend). |
| **Graceful degradation** | If one widget fails (live pulse, socket, stories, Coingo), the rest of the page still works. Feature-flag OFF or endpoint 503 → hide that module, don’t block Play/Wallet. |
| **Offline / reconnect detection** | `online`/`offline` (web) + connectivity (APK). Sticky non-modal banner: “You’re offline” → “Back online”. Socket: silent reconnect, then “Reconnecting…” chip, then refresh balance / badges. Do not enqueue duplicate money submits while offline. |

### 13.3 Authentication & security edge-cases

| Requirement | Behavior |
|-------------|----------|
| **Token expiry & auto-refresh** | Global interceptor. **401:** if a refresh token/endpoint exists, one silent refresh then retry the original **GET**; **never** auto-retry POST join/deposit/transfer/withdraw. If refresh fails or is not shipped yet, clear session → sign-in with `returnTo`. Boot always `GET /me`. Additive `POST /v2/users/refresh` (and admin equivalent) is in-scope for 100% ready. Shop 401 ≠ main-site logout. |
| **Rate limiting & throttling** | Keep API **100 req / 15 min on auth**. Also throttle resend-OTP, forgot-password, join, transfer. UI: disable + countdown on 429. |
| **OTP / resend countdown** | Email verify, reset, admin OTP: live timer (e.g. 60s) before Resend enabled. Expired/used code → specific error + resend. |
| **Email & data masking** | Public/admin lists: `j***@gmail.com`, `017****1234`, truncated Tx hashes. Full value on copy (authorized) or own profile. Never log passwords, OTP, JWT in client logs. |
| **Remember Me persistence** | APK: `ba_remember_*` email+password (existing). Web: optional remember **email** (not raw password in `localStorage`). **JWT is not stored in plaintext localStorage** — httpOnly cookie and/or memory; redux-persist **strips token on write**. Shop: tab `ba_shop_gate` only. |
| **RBAC** | Admin nav hidden by permission; `admin` bypass. Deep link to forbidden page → 403, not an empty crash. Player cannot hit `v3` admin APIs. APK has no admin. |

### 13.4 UI states & visual feedback

| Requirement | Behavior |
|-------------|----------|
| **Skeleton shimmer loading** | Content-shaped skeletons (match cards, table rows, story rings, wallet tiles). Route-level spinner only for first boot bar. Shimmer off if `prefers-reduced-motion`. |
| **Descriptive empty states** | Icon + short copy + **one CTA** (e.g. empty wallet → Buy BAC; empty feed → Explore; empty table → Clear filters). Empty ≠ error. |
| **Optimistic UI updates** | Like, save, follow, unread marks: update immediately; **rollback + toast** on fail. **Not** optimistic for join, deposit, withdraw, transfer, admin approve — wait for API. |
| **Toast & alert feedback** | Success / error / warning / info. One at a time; optional action. Confirm dialogs for destructive/money (copy names the action). |
| **Copy to clipboard feedback** | One-click copy (referral, room ID/password, TrxID, wallet). Toast “Copied” ~1.5s; fallback select+copy if Clipboard API blocked. |

### 13.5 Data integrity & concurrency (API — money-critical)

BAC, match slots, and payouts **must not double-apply**. MongoDB with transactions (replica set in prod; document the local-dev fallback).

| Requirement | Behavior |
|-------------|----------|
| **Atomic transactions (ACID)** | MongoDB `session.withTransaction()` wrapping balance deductions and entry writes. Same txn: match **join** (slot + `balance` debit + `MatchParticipant` + `BalanceHistory`); **deposit approve**; **withdraw approve/complete**; **P2P transfer**; **distribute winnings / refund**. Abort = no partial debit. |
| **Server-side balance validation** | Re-fetch wallet **inside** the transaction. Never trust client-sent balance. Confirm `balance >= amount` (and 70% withdrawable for cash-out) before any status change. |
| **Race & double-spend protection** | Unique participant `(matchId, userId)`; conditional slot update; atomic `$inc` with `balance >= amount`. Parallel debit/payout of the same funds: one wins, one fails. |
| **Optimistic / pessimistic locking** | Limited match slots = **conditional update**. Admin distribute: `winningsDistributed` / `entriesRefunded` so two admins cannot pay twice. |
| **Idempotency keys** | `Idempotency-Key` UUID on join, deposit submit, withdraw submit, transfer, shop order. Duplicate hits discarded / return original result. Retry reuses the same key. |
| **High-value withdrawal approval** | ≥ **1000 BAC** (admin-tunable): extra admin/2FA review before mutate. Normal withdraw still admin-reviewed. |

Every BAC change still writes `BalanceHistory` (Master rule 1) **inside** the same transaction. Full API/auth/upload/Cloudflare hardening: **§14**.

### 13.6 Performance & code quality

| Requirement | Behavior |
|-------------|----------|
| **Route code-splitting & lazy loading** | Every route `lazy()` + Suspense (web/shop/admin). APK: don’t parse unused screens at first frame if practical. Below-fold landing + feed tabs lazy. Framer / Three / socket / carousel **dynamic import only**. |
| **Asset optimization & compression** | Images WebP/AVIF (fallback), fixed dimensions / aspect-ratio, lazy except LCP hero. Compress uploads server-side where possible. Fonts WOFF2 `font-display: optional`. |
| **Debounced search** | User search, feed explore, admin user/match search, command palette: debounce **300–400ms**, cancel in-flight, min 2 chars, empty query = no spam. |
| **Global response interceptors** | Axios (web/shop/admin) + APK `ApiClient`: attach Bearer; map 400 → field errors; **401** → §13.3; 403 email-verify; 429 countdown; 5xx toast + retry. Normalize `{ message }` — never show raw JSON to users. |

Lighthouse gate still applies (90+, LCP < 2.5s, CLS < 0.1, TBT < 150ms).

### 13.7 Shared implementation notes

- One **form primitive**, one **toast**, one **empty-state**, one **error-boundary**, one **http client** per app — then screens compose them.
- i18n all user-visible strings (en/bn/zh/hi/ur).
- QA: scripted pass of §12 tables, §13 table, **§14, and §15** before calling the rebuild done.

---

## 14. Security hardening (100% ready — money, API, match, files, edge)

Companion detail: `BATTLEASIA-MASTER-PROMPT.md` §2.7–2.8 and Cloudflare in §7. **Do not ship without this.**

### 14.1 Money path (server is the only authority)

| Requirement | Spec |
|-------------|------|
| **Atomic transactions (ACID)** | `session.withTransaction()` around debit + entry writes. Join, deposit approve, withdraw, transfer, distribute/refund. |
| **Server-side balance validation** | Re-read `User.balance` (and withdrawable) on the server immediately before confirm. Client amounts are a hint only. |
| **Double-spend protection** | DB unique constraints + atomic decrements / conditional `$inc`. No two parallel joins/payouts for the same slot or the same BAC. |
| **Idempotency keys** | Unique key on payment and transfer submissions; duplicate HTTP hits discarded. |
| **High-value withdrawal approval** | Over threshold → mandatory manual verification + admin review (+ password/2FA). Default 1000 BAC, tunable. |

### 14.2 API & server hardening

| Requirement | Spec |
|-------------|------|
| **Rate limiting & throttling** | `express-rate-limit` on auth, OTP, and payment routes (and join). Burst / brute-force → 429. |
| **NoSQL injection prevention** | `express-mongo-sanitize` on payloads; never interpolate user JSON into queries. |
| **XSS protection & input sanitization** | Clean incoming strings; **helmet** security headers. (`xss-clean` is unmaintained — use a maintained sanitizer.) |
| **CORS whitelisting** | API responds only to platform domains (player, shop, admin + local dev). No wildcard. |

### 14.3 Authentication & session governance

| Requirement | Spec |
|-------------|------|
| **HttpOnly & Secure cookies** | Session JWT cookies not readable by JS; `Secure` in production. APK uses Bearer. |
| **JWT invalidation (`tokenVersion`)** | Bump on password change or account suspension → all devices invalid immediately. |
| **Strong password hashing** | `bcryptjs` salt + hash. |
| **2FA / OTP** | Secondary codes on **admin login** and **high-value admin actions**. Player verify/reset OTP with countdown (see §13.3). |

### 14.4 Game operations & anti-tampering

| Requirement | Spec |
|-------------|------|
| **Room credential concealment** | Room ID/password **absent** from responses until the scheduled release threshold. |
| **Participant-only authorization** | Credentials only for validated **paid** entries. 403 otherwise. |
| **Server-authoritative match results** | Admin verification (or signed/OCR-assisted proof). **Never** trust client-submitted results as payout truth. |

### 14.5 Storage & file upload security

| Requirement | Spec |
|-------------|------|
| **MIME-type & magic-byte validation** | Inspect binary headers on upload; do not trust extensions. |
| **Execution prevention** | Public `/uploads` is static-only; no script/binary execution. |
| **File quota enforcement** | Hard-cap multer/JSON bodies (5MB default, 100MB reel/story, APK cap) to prevent memory exhaustion. |

### 14.6 Cloud, network & infrastructure

| Requirement | Spec |
|-------------|------|
| **Cloudflare WAF** | Block known exploits and injection payloads at the edge. |
| **DDoS mitigation & rate limiting** | Filter spikes **before** the origin host. |
| **Bot Fight Mode** | Challenge headless browsers and scrapers. |
| **Origin IP masking** | Origin only behind reverse proxy (Cloudflare / Traefik); origin IP not in public DNS. |

---

## 15. Ledger, fraud, scale, DR & tests (100% ready)

Companion: `BATTLEASIA-MASTER-PROMPT.md` §2.9. Modules that can wait on ops (KYC, fingerprint enforcement) still **exist** and are **admin on/off**.

### 15.1 Money integrity (accounting)

| Requirement | Spec |
|-------------|------|
| **Double-entry ledger** | Every balance change posts **debit + credit** (`LedgerEntry` + `BalanceHistory`) in the same transaction. Accounts include user wallet, match pool, platform fee, platform liability, pending-withdraw. |
| **Immutable accounting / reversal** | **No delete, no silent edit.** Wrong deposit/payout/join fee = **reversal entry** (negative/contra) linked to the original. Admin balance adjust is a posted pair. |
| **Platform liability vs reserve** | Admin monitor: total user BAC vs real fiat/crypto reserves on business wallets. Alert when liability exceeds reserve (or safety %). |
| **Suspicious transaction velocity** | Too-fast withdraw/transfer/drain → **temporary hold** + admin queue. Player sees “Under review”. Limits in `AppSettings`. |

### 15.2 Anti-fraud & match integrity

| Requirement | Spec |
|-------------|------|
| **Device fingerprint & multi-account** | Track IP + device/fingerprint on signup, login, join, withdraw. Detect fake rings and referral abuse. Admin review / ban. Flag default OFF until tuned. |
| **Collusion & win-trading** | Report players in a match (kill-share / boost). Admin queue. Optional auto-flag same device/IP in one match. |
| **KYC & age verification** | When flag ON: identity + **18+** required **before withdraw approval**. Unverified users cannot cash out. |

### 15.3 Database & high traffic

| Requirement | Spec |
|-------------|------|
| **Compound indexing** | Unique `(matchId, userId)` participants; user+time on ledger/history; status+time on deposits/withdrawals; game+status+schedule on matches. |
| **Connection pooling** | Mongoose `maxPoolSize` sized for concurrent joins; no connection stampede. |
| **In-memory cache for live stats** | Public home / live pulse from cache (TTL + socket invalidation), not a full aggregation per hit. |

### 15.4 Compliance, backup, DR, support

| Requirement | Spec |
|-------------|------|
| **Automated off-site backups** | Daily encrypted dump to a **separate** cloud bucket, plus local rotation. Documented restore. |
| **Graceful maintenance mode** | Banner + **live countdown**; player writes 503; admin remains; don’t cut mid-transaction. |
| **Dispute & evidence** | Support: attach screenshot/video for match results; admin verifies before refund/result change. |

### 15.5 Operational tests

| Requirement | Spec |
|-------------|------|
| **Automated unit & integration tests** | Deposit, withdraw, entry fee, refund, double-join, insufficient BAC, idempotency, **reversal**. CI must run these. |

---

## 16. Player keyboard HUD shortcuts (required)

**These were missing — they are now in-scope.** Desktop/web player (and shop for W/B/T/H). **Do not fire letter shortcuts while focus is in an input / textarea / OTP / contenteditable.** APK: same **actions** as HUD buttons (don’t fight Android Back / volume). `?` opens a **cheatsheet**. Admin **Ctrl+K / Cmd+K** stays on admin only.

Quick Join had no letter in the source list → bind **J**.

### 16.1 Match / join

| Key | Action |
|-----|--------|
| **J** | **Quick Join** — join window for the selected / next **open** match. If none: toast “No open matches”. |
| **C** | **Copy Room ID / Pass** — only if paid participant **and** room released (§14.4). Else toast “Room not available yet”. |
| **R** | **Ready / Confirm** — player or squad ready in lobby. Disabled until joined. Roster shows ready ticks. |
| **L** | **Leave / Cancel entry** — before start only; refund fee via **reversal ledger** (§15). After start: blocked. Confirm dialog. |
| **M** | **Match details** — rules, map, prize pool, fee, spots. |

### 16.2 Coin & shop

| Key | Action |
|-----|--------|
| **W** | **Open Wallet** — balance + history. |
| **B** | **Buy BAC** — shop / deposit (`VITE_BAC_SHOP_URL`). |
| **T** | **Transfer BAC** — P2P transfer window. |
| **H** | **Hide / show balance** — mask as `**** BAC`. Persist `ba-hide-balance`. |

### 16.3 Social & communication

| Key | Action |
|-----|--------|
| **Enter** | **Open chat** (lobby / live). If chat input already focused, Enter **sends** (Shift+Enter = newline). |
| **Tab** | **Leaderboard** — live score / rank. **Only when focus is not in a form** (don’t break a11y Tab). |
| **F** | **Follow / Like** — follow focused profile or like focused post (optimistic). |
| **S** | **Share match** — copy invite / deep link; toast “Link copied”. |

### 16.4 Media & HUD

| Key | Action |
|-----|--------|
| **U** (or system Mute) | **Audio toggle** — in-app / live mute. Persist preference. |
| **Space** | **Play / Pause** reels or live **only when a media surface is active** (don’t steal page scroll). |
| **Esc** | **Back / Exit** — close pop-up, modal, drawer, lightbox, join window, cheatsheet. |

Disabled / flagged-off actions: short toast, never a crash.

---

## 17. Locked visual system (design tokens, 5 states, mobile, polish, ship gate)

**Required on player web, shop, admin, APK.** This is the exact UI/UX finish — not optional “nice to have”. Overlaps §2, §7, §10, §3A, §13 on purpose: those sections name the jobs; **these numbers are the law**.

### 17.1 Design tokens & shell

**8pt grid — spacing is only 4 / 8 / 16 / 24 / 32 px** (and multiples: 40, 48, 64). **No random padding** (no 13px, 15px, 27px, etc.). Margin, gap, and padding come from this scale.

**Radius & border**
- Cards / surfaces: `rounded-xl` or `rounded-2xl` (**12–16px**).
- Buttons & inputs: `rounded-lg` or `rounded-xl` (**8–12px**).
- Badges & chips: `rounded-full` (pill).
- Hairline border on dark: **white 8–14%** (`border-white/10` ≈ 10%). Same 8% language on APK.

**Accent architecture**
- 8 presets on `:root`: `--ba-accent`, `--ba-accent-glow`, `--ba-accent-hover`.
- Load from storage **before first paint** (no flash on reload).

**Typography**
- Headings: Barlow / Syne **or** Clash Display — bold, condensed esports.
- Body & UI copy: Public Sans **or** Poppins — readable.
- Balance & status numbers: **tabular / monospace numerals** so digits don’t jump.

Dark page ink may remain `#060607` / `#0E0F14` (Aurora) with glass cards `backdrop-blur-md` + `bg-white/[0.03]`.

### 17.2 Five universal states (every button, input, card, table)

| State | Spec |
|-------|------|
| **Default** | Resting look from tokens. |
| **Hover / Active** | Light lift (`-translate-y-0.5`), accent glow or surface change. Pressed scale on tap. Disabled = no hover, tooltip why. |
| **Loading** | Button: spinner inside. Regions: **content-shaped shimmer skeleton** (animated gradient), not a blank spinner page. |
| **Empty** | Never a raw blank screen. Relevant **3D/vector illustration** + short copy + **one CTA** (e.g. “Join your first match”). |
| **Error** | Field: **red border** + clear red text under the field. Page: error boundary + **Reload** (never a white crash). |

### 17.3 Layout shift & Android (PC web stays desktop)

**PC web:** desktop HUD; hover; keyboard. CLS still &lt; 0.1 (fixed aspect-ratio on images).

**Native APK (and tiny web windows):**

| Rule | Spec |
|------|------|
| **Zero CLS** | Images/banners have **fixed aspect-ratio** (`aspect-video`, `aspect-square`, or explicit width/height) **before** load. |
| **Bottom sheet over center modal** | Join / confirm / filters / menus = **bottom-sheet**. Desktop web may keep centered dialog. |
| **Touch targets** | **≥ 44×44px** on APK. |
| **Safe area** | `safe-area-inset-*` / Flutter SafeArea. JOIN/CTAs never under the system bar. |

### 17.4 Esports polish (off LCP path)

- **Glass + depth** on dark `#060607`: `backdrop-blur-md bg-white/[0.03]`.
- **Subtle aurora mesh glow** behind hero and winner banners — accent-colored blur, **not** neon overload.
- **Micro-animations** (dynamic import, `prefers-reduced-motion` off):
  - Balance / prize **count-up** (e.g. 0 → 2000 BAC).
  - Join spots **progress bar** fill in realtime.
  - Notification **pulse / blinking dot**.

### 17.5 Social / feed (Instagram-level)

- **Stories tray:** tap → full screen; **5s** progress bar; **hold to pause**.
- **Feed carousel:** swipe + **dots**; smooth horizontal snap.
- **Double-tap heart:** two taps on media → heart scales in the center, fades out; optimistic like.
- **Chat bubbles:** own messages **accent, right**; others **dark surface, left**; **typing dots**.

### 17.6 Finance & shop (trust)

- **Copyable values:** TrxID, referral, room credentials — click → small animated **“Copied!”** chip.
- **Fiat next to BAC:** e.g. `500 BAC (৳500 BDT)` in smaller type (region from coin rates).
- **Receipt lightbox:** deposit screenshot → fullscreen **zoom + rotate**.

### 17.7 Ship gate (do not call done without)

- Lighthouse **Performance 90+**, **LCP &lt; 2.5s**, **TBT &lt; 150ms**, **CLS &lt; 0.1**.
- **Framer Motion, Three.js, Socket.IO** (and carousels) **never** on the main LCP bundle — **dynamic import** after first paint.
- All banners, icons, photos: **WebP or AVIF**, compressed.

---

## 18. Ship phases (100% product vs later)

Do **not** block P0 on clans/live/gifting. Flags default **OFF** for P1/P2.

### P0 — must be live (this is “100% ready BattleAsia”)

- PC landing → auth → desktop `/user/*` + shop PC + admin PC (incl. **§5.1 enterprise**)
- APK: splash → **auth only** → native after-login (no landing)
- Money: deposit/withdraw/join/leave-refund/transfer + ACID + idempotency + double-entry
- Room hide + participant-only + server results
- Ready + lobby chat + keyboard §16 (web)
- IG **P0** (posts, stories, reels, DM, profile, explore)
- Engagement that already exists (missions, streak, referral, spin, season, squad)
- Security §14 baseline (rate limit, sanitize, helmet, CORS, cookies, tokenVersion, bcrypt, magic-byte uploads)
- FCM register + send for core notifications; Sentry; email templates; landing SEO; 5 locale namespaces for auth/play/wallet/errors
- Lighthouse ship gate; tests in §2.9

### P1 — next (flags on when ready)

- IG P1 (victory auto-post, highlights, squad chat extras, message requests)
- KYC + age before withdraw; velocity holds tuned; fingerprint admin UI
- Admin liability vs reserve alerts; off-site backup automation live
- Unique earn that is small: cashback days, tip (if wanted)

### P2 — later (new backend)

- Live + gifting, watch-to-earn, fantasy, 1v1, clans/wars, customization store, OCR results
- IG P2 (For You, voice notes, watch party)

**Handover still required (not in markdown):** brand assets, secrets, keystore, live Mongo, Coolify/Cloudflare/Coingo/SMTP/Firebase accounts.