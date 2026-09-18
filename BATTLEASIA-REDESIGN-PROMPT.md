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
- **Feed / social hub** (tabbed): Feed, Explore, Reels, Saved, Messages — with stories bar, post composer, reel create/player, DMs (new chat, attachments, block/report).
- **Profile:** own profile/edit + public profile (follow/block/report, followers/following, suggested, premium activation).
- **Account pages:** my-matches, my-orders, my-statistics, my-referrals, notifications, leaderboard, customer-support (tickets + chat).
- Public: `/profile/:userId`, `/privacy-policy`, `/terms-and-conditions`, `/support`.

**Functional constraints:** JWT auth guard on `/user/`*; email-verify + password-reset flows; `returnTo` redirect; `?ref=` capture; live updates via socket (balance, notifications, matches, messages).

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