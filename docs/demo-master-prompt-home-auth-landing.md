# BattleAsia — Master Prompt (Home + Landing + Auth Only)

> **Use case:** One-shot brief for AI/site builders to recreate **battleasia.gg** public surface: **home landing page + full authentication**. No logged-in player app (wallet, feed, play HUD, shop checkout, admin).

---

## 0. Mission

Build a **mobile-first, dark esports landing** for **BattleAsia** with **complete auth flows** (sign-in, sign-up, email OTP, password reset, Google/Discord OAuth entry points). Match the **feature set** below; visual can be polished demo, not pixel-perfect clone.

**Brand:** BATTLE ASIA · mobile tournament arena · BAC coins · Bangladesh/Asia · PUBG-first, multi-game.

**Design DNA:** Dark ink background (`~#0a0b0f`), elevated cards (`~#161618`), hairline borders (white ~8%), **gold/lime accent** (user-pickable accent chip), no casino/neon clutter. Performance: WebP/AVIF, lazy below fold, hero LCP optimized (poster + video optional), **no Framer/Three on critical path**.

---

## 1. Routes (reference product)

| Route | Purpose |
|-------|---------|
| `/` or `/dashboard` | Home landing (single long page, hash sections) |
| `/support` | Same landing, support chat open |
| `/auth/sign-in` | Sign in |
| `/auth/sign-up` | Register (2 steps) |
| `/auth/email-verification` | Post-signup email OTP |
| `/auth/forgot-password` | Request reset code |
| `/auth/reset-password` | OTP + new password |
| `/auth/oauth` | OAuth return handler |
| `/terms-and-conditions`, `/privacy-policy` | Linked from sign-up |

**One-page demo variant:** Keep hash sections on one URL; auth as **modals / drawers** with same fields and step order.

---

## 2. Global chrome (landing + auth)

### 2.1 Top bar (sticky)

- Logo + **BATTLE ASIA** wordmark
- Anchor nav: **Home** `#home`, **About** `#about-us`, **Play** `#play`, **Rules** `#rules`
- Actions:
  - Guest: **Sign in** (ghost), **Sign up / Join** (primary)
  - Signed-in (optional demo state): user **avatar**, **Sign out**, primary → **Enter arena** (`/user/play` or demo placeholder)
- **Theme dock:** accent color picker only (no sun/moon mode in current product)
- **Locale select:** EN, BN, HI, UR, ZH (all copy i18n-keyed)

### 2.2 Mobile (≤820px)

- **Burger** → **drawer** with:
  - Same nav links (close on click)
  - Quick cards: Sign in / Arena / Account (if logged in)
  - **APK download** card (version + size if known)
  - Settings row: theme + locale
  - Footer: Sign in + primary Sign up
- 44px min tap targets, `overflow-x: clip` on body

### 2.3 Auth shell (all auth pages)

- **Back:** ← Home (landing)
- **Desktop split:**
  - **Left brand:** logo, 2-line promo, illustration (`auth-login` hero art), short footer line
  - **Right panel:** title, subtitle, form, **trust row**
- **Mobile:** stack brand (compact) then full-width form
- **Trust row (3 items):** Secure login · Fair play · Real payouts (icons + labels)

---

## 3. Home / landing — sections (top → bottom)

### 3.1 Hero — `#home`

- Background: **looping hero video** OR static poster + gradient (LCP = poster/image, video non-blocking)
- Title: **BATTLE ASIA** + eyebrow (i18n tagline)
- CTAs:
  - Primary: **Sign up** (guest) or **Enter arena** (signed-in)
  - Secondary: **Download APK** (href from API; show version + MB; disabled label if APK off)
- **Live row:** pulsing LIVE pill + count-up:
  - Players online
  - Matches today
- **Side card:** Arena/Stadium — seats + capacity stats + sign-up CTA

**Data source (live or mock):** public pulse/dashboard — `playersOnline`, `matchesToday`, `stadiumLive`, `inSeats`; refresh ~45s; optional socket for live updates.

### 3.2 Battle Arena board (Pulse)

- Header: **BattleArena** + live dot
- **4 KPI tiles:**
  1. Today’s joins  
  2. Total matches  
  3. Ongoing (animated dot)  
  4. Total winnings (**BAC coin** icon + animated number)
- **Two leaderboards** (lazy load):
  - Top profit  
  - Top killers  
  (rank, avatar, username, score)

### 3.3 Match battle rail

- Toggle tabs: **High prize battles** | **Live / ongoing battles**
- Horizontal scroll **~5 cards**: match name, game, entry fee, prize pool, progress bar (filled/cap), status (Open / Full / Complete)
- Prev/next scroll buttons
- Click: guest → **sign-in** with `returnTo` match/play URL; signed-in → match detail path
- “View all” → play hub (link only in full product)

### 3.4 Games — `#play`

- Section head + lead
- **Game tiles** (hex or card grid):
  - PUBG Mobile — **Popular** badge  
  - Free Fire, COD Mobile, MLBB — clickable  
  - Valorant Mobile — **Coming soon** (disabled, no navigation)
- Each: WebP cover, title, **“N open matches”** from pulse by game name
- Guest click → sign-in with return to that game play URL

**Fallback slugs if no API:** pubg, freefire, cod, mlbb, valorant + local `/covers/*.webp` art.

### 3.5 About — `#about-us`

- Eyebrow, logo, brand name
- H2 + 2 body paragraphs
- CTAs: Sign up + anchor to Play
- **5 bullet points** (trust, payouts, fair rooms, community, support)

### 3.6 Modes — `#how-to-play`

- 4 cards with images + index **01–04:**
  - Solo, Duo, Squad, TDM  
- Each: title + short description (i18n)

### 3.7 Rules / FAQ — `#rules`

- Intro: eyebrow, title, lead, note
- **4 topic chips** (payments, fair play, rooms, account)
- **10 FAQ items** (accordion, one open at a time):
  1. Fair play  
  2. Operations / staff  
  3. Room ID & passwords  
  4. Prizes  
  5. Payments (bKash, Nagad, crypto)  
  6. Withdraw  
  7. Referral  
  8. Account  
  9. Support  
  10. Age / eligibility  
- **Support CTA** block (email / chat relay)

### 3.8 Footer

- Social icons (API or fallback: FB, Discord, YouTube, etc.)
- Brand + tagline + © year
- `support@battleasia.gg`
- Columns: Support, Legal (Terms, Privacy), quick links
- Partner / payment strip (bKash, Nagad, crypto badges)
- Optional footer car / brand art (product has decorative asset)

### 3.9 Floating (lazy, below fold)

- **Social FAB** — quick outbound links  
- **Support chat** — floating panel; `/support` opens landing with chat expanded  

### 3.10 Optional QA

- `?mock=1` — design overlay + opacity slider (internal QA; skip in public demo)

---

## 4. Auth — flows & fields

### 4.1 Sign in (`/auth/sign-in`)

| Element | Behavior |
|---------|----------|
| Email | Required, trim/sanitize |
| Password | Required, show/hide toggle |
| Remember me | Persist email locally |
| Submit | API login → redirect `returnTo` query or `/user/play` |
| Unverified | HTTP 403 → email verification with email param |
| Rate limit | 429 → countdown button text |
| Forgot | Link → forgot password |
| Social | Google + Discord buttons → OAuth URLs with `returnTo` |
| OAuth errors | `?oauth=denied\|disabled\|email\|app` → form error |
| Footer link | Create account → sign-up |
| Referral | Capture ref from URL on page load |

### 4.2 Sign up (`/auth/sign-up`) — 2 steps

**Step indicator:** Step 1 · Step 2 (clickable when allowed)

**Step 1 — Account**

- Email + **async availability check** (debounced): checking / available ✓ / taken  
- Password + **strength meter & hints**  
- Confirm password (live mismatch error)  
- Button: **Continue** (validates step 1)

**Step 2 — In-game**

- In-game username  
- PUBG / game ID  
- Phone: **country code** dropdown (default BD +880) + mobile number  
- Game server: Europe, Asia, South America, Middle East, KR/JP  
- **Terms** checkbox + links Terms & Privacy  
- Back + **Create account**  
- Show **referral code applied** banner if captured  
- Success → **email verification** (not full login until OTP)

### 4.3 Email verification

- Query: `?email=`  
- Masked email display (`j***@domain.com`)  
- **6-digit OTP** (individual inputs or single field)  
- Verify → establish session → redirect play hub  
- **Resend** with 60s cooldown  
- Missing email → back to sign-in  

### 4.4 Forgot password

- Email → send code → navigate to reset with email in query  

### 4.5 Reset password

- Requires `?email=` else CTA back to forgot  
- 6-digit OTP + new password + confirm (min 8, must match)  
- Resend OTP cooldown  
- Success → sign-in  

### 4.6 OAuth finish

- Complete OAuth cookie/session handoff  
- Success → arena; fail → sign-in with message  

### 4.7 Shared auth UX

- Inline **field errors** + top **form error** banner  
- **PasswordField:** toggle visibility; sign-up adds meter  
- **OtpInputs:** 6 cells, paste-friendly  
- Icons in email fields  
- Focus first invalid field on submit  
- Push token registration after login (web) — optional in demo  

---

## 5. Guest vs signed-in behavior (landing)

| Action | Guest | Signed-in |
|--------|-------|-----------|
| Primary header CTA | Sign up | Enter arena |
| Game tile click | Sign-in + returnTo play | Go to play/game |
| Match card click | Sign-in + returnTo detail | Match detail |
| Hero / about CTAs | Sign up | Play hub |
| Header | Sign in link | Avatar + sign out |

---

## 6. API touchpoints (full product; mock in demo)

| Endpoint / area | Used for |
|-----------------|----------|
| Public dashboard / pulse | Hero stats, arena board, leaderboards, open matches by game |
| Games list | Game tiles, coming soon flags, cover URLs |
| App download info | APK URL, version, size, enabled flag |
| Site social links | Footer + FAB |
| `POST` sign-in / sign-up / verify / forgot / reset | Auth |
| `GET` email availability | Sign-up step 1 |
| OAuth `/api/v2/users/oauth/{google\|discord}` | Social login |

**Demo:** static JSON fixtures with realistic numbers; animate count-ups from fixture values.

---

## 7. One-page demo assembly (recommended)

```
┌─────────────────────────────────────────┐
│ Sticky header + mobile drawer           │
├─────────────────────────────────────────┤
│ #home Hero                              │
│ Pulse board + leaderboards              │
│ Match rail                              │
│ #play Games                             │
│ #about-us                               │
│ #how-to-play Modes                      │
│ #rules FAQ + support CTA                │
│ Footer                                  │
├─────────────────────────────────────────┤
│ Modals: SignIn | SignUp(1/2) | OTP |   │
│         Forgot | Reset                  │
│ FAB: Social + Chat                      │
└─────────────────────────────────────────┘
```

- Toggle **“Preview logged in”** in demo toolbar to swap header CTAs and link behavior.
- Do **not** implement post-login app; show toast or `#demo-arena` stub: “Arena is outside this demo.”

---

## 8. Copy & i18n (minimum)

Provide **English + Bengali** for: nav, CTAs, hero, pulse labels, games, about, modes, FAQ (10 Q&A), footer, all auth labels/errors, trust row, OTP/resend strings.

Key CTA strings: Sign in, Sign up, Join, Download APK, Enter arena, Remember me, Continue, Create account, Verify, Send code, Resend in {n}s.

---

## 9. Acceptance checklist

- [ ] All landing sections present in order with hash navigation
- [ ] Mobile drawer + sticky header + safe areas
- [ ] Count-up stats (mock or live)
- [ ] Match rail tabs + horizontal scroll
- [ ] 5 games with one “coming soon”
- [ ] 10 FAQ accordions
- [ ] Footer social + legal + payments
- [ ] Sign-in with remember + social + forgot link
- [ ] Sign-up 2 steps with email check + strength + terms
- [ ] Email OTP + resend cooldown
- [ ] Forgot → reset OTP flow
- [ ] Auth trust row on every auth view
- [ ] Guest CTAs route to auth (modal or page)
- [ ] Lighthouse: no layout shift on hero; lazy below fold

---

## 10. Reference code (this repo)

| Area | Path |
|------|------|
| Landing | `battleasia.gg/src/pages/Landing.tsx` |
| Sign in | `battleasia.gg/src/pages/auth/SignIn.tsx` |
| Sign up | `battleasia.gg/src/pages/auth/SignUp.tsx` |
| Email OTP | `battleasia.gg/src/pages/auth/EmailVerification.tsx` |
| Forgot / reset | `battleasia.gg/src/pages/auth/ForgotPassword.tsx`, `ResetPassword.tsx` |
| OAuth finish | `battleasia.gg/src/pages/auth/OAuthFinish.tsx` |
| Auth UI | `battleasia.gg/src/components/auth/*` |
| Routes | `battleasia.gg/src/App.tsx` |
| Styles | `battleasia.gg/src/styles/landing.css`, `auth.css`, `phone.css` |

---

## 11. Local demo credentials (API connected only)

- Player (not admin): `player@battleasia.local` / `Player@123456`  
- Admin is **out of scope** for this prompt.

---

**End of master prompt.** Copy sections 0–9 (or entire file) into your builder AI as the single source of truth for **Home + Landing + Auth**.
