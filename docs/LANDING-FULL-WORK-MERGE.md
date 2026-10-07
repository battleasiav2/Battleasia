# BattleAsia-full-work.zip → Running site (design merge)

**Goal:** Landing + auth **look like** `BattleAsia-full-work.zip`, while **all** existing API flows stay (pulse, match rail, games, APK, i18n, `/auth/*` routes, support chat, OAuth, etc.).

**Zip source (extracted):** `_import-full-work/` from `E:\bbbb\bbbb\BattleAsia-full-work.zip`

**Static reference:** `_import-full-work/index.html` + `css/styles.css` + `js/app.js`

---

## Rules (non‑negotiable)

1. Do **not** remove or stub API calls (`fetchPublicDashboard`, `fetchGames`, `MatchBattleRail`, `fetchAppDownload`, auth APIs, etc.).
2. Landing CTAs stay **routes**: `/auth/sign-in`, `/auth/sign-up`, `/user/play` — zip **modals** are visual reference only unless product explicitly wants modal auth later.
3. Keep lazy-loaded sections (footer, chat, social fab, match rail, leaderboards).
4. Performance: hero poster LCP, video non-blocking; no new blocking scripts from zip `app.js` on production bundle.

---

## Progress

| Step | Status |
|------|--------|
| Extract zip to `_import-full-work/` | Done |
| Copy assets → `battleasia.gg/public/assets/fw/` | Done |
| Generate scoped CSS → `src/styles/landing-full-work.css` | Done (`.landing-fw` scope) |
| Replace `Landing.tsx` markup to zip sections + wire APIs | **In progress** |
| Reskin `AuthShell` to zip modal split panel | **In progress** |
| Bridge components (`MatchBattleRail`, `PulseLeaderboards`, games grid) to zip classes | Pending |
| Champion section (API or pulse top player) | Pending |
| FAQ chips + zip accordion styling | Pending |
| Footer / payment strip vs `SiteFooter` | Pending |
| Flutter APK parity | Not required for home (workspace rule) |

---

## Asset map

| Zip | Production |
|-----|------------|
| `assets/logo-battleasia.png` | `/assets/fw/logo-battleasia.png` |
| `assets/hero-pubg.mp4` | `/assets/fw/hero-pubg.mp4` |
| `assets/hero-poster.jpg` | `/assets/fw/hero-poster.jpg` |
| `assets/bac-coin.webp` | `/assets/fw/bac-coin.webp` |
| `assets/game-*.jpg` | `/assets/fw/` |
| `assets/auth-brand.jpg` | Auth brand panel (optional) |

---

## CSS strategy

- `landing-full-work.css` — from zip `styles.css`, paths → `/assets/fw/`, `body` → `.landing-fw`.
- Auth pages: wrapper `.auth-page-fw` + reuse modal panel classes (`modal-brand-panel`, `modal-form-wrap`).
- `landing.css` — retire section-by-section as markup moves to zip class names; avoid loading both long-term (conflicts).

---

## Component class mapping (zip → React)

| Zip | React |
|-----|--------|
| `#pulse` KPI + `#lb-profit` | Pulse stats in `Landing.tsx` + `PulseLeaderboards` |
| `#match-rail` | `MatchBattleRail` → classes `match-rail`, `match-card` |
| `#games-grid` | Games section → `games-grid`, `game-tile` |
| `#faq-list` | Existing FAQ state + zip `faq-item` markup |
| `#champion-card` | New block: top profit player from `stats.topProfit[0]` or static fallback |

---

## Test checklist

- [ ] `/dashboard` — hero video, live counts from API, arena ring uses `stadiumLive` / capacity
- [ ] Match tabs + cards link to sign-in or match detail
- [ ] Games show open match counts from pulse
- [ ] `/auth/sign-in`, sign-up, OTP, forgot, reset — same API behavior, zip layout
- [ ] Theme accent + locale EN/BN unchanged
- [ ] Mobile drawer + 44px targets
- [ ] Lighthouse: no CLS on hero

---

## Do not commit

- `_import-full-work/` (full zip extract + nested `battleasia-full-project/node_modules`)
- User may add `_import-full-work` to `.gitignore` locally

Commit when ready: `battleasia.gg/public/assets/fw/*`, `src/styles/landing-full-work.css`, Landing/Auth changes only.
