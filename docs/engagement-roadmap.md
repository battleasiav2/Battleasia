# BattleAsia Engagement & Rewards — 15-Phase Roadmap

Admin-controlled gamification for BAC earn, streaks, missions, and achievements.  
Web only until site is complete (no APK parity for home/engagement).

Design tokens: `#0a0a0a` bg, `#161618` cards, gold `#f5c518`, glass `HomeBlurPanel` / `UserGlassCard`.

---

## Phase 1 — Foundation (current)
- MongoDB: `EngagementMission`, `UserEngagementProgress`
- `AppSettings.engagement` global toggles & economy rates
- Admin: Mission CRUD + Engagement Settings
- User: Wallet **Earn** tab — list missions, progress, claim BAC
- Balance ledger: `detail.reason: 'engagement_reward'`

## Phase 2 — Daily login streak ✅
- `UserEngagementStreak` model + sync on login / Earn visit
- Streak counter, 7-day calendar, claim BAC (base + streak bonus)
- Admin: streak rates in Engagement Settings
- Replaces separate daily-login mission when streak is enabled

## Phase 3 — Daily missions (3 rotating tasks) ✅
- Auto-progress: join match, win match, kill milestones, profile complete
- Admin: daily pool toggle, missions/day (1–5), reset hour (BD)
- Deterministic daily rotation from pool (`inDailyPool` on missions)

## Phase 4 — Welcome & first-time bonuses ✅
- Signup, first match, complete profile, first deposit milestones
- Admin: per-milestone enable, BAC, title, description, icon
- Claim from Wallet → Earn welcome section

## Phase 5 — Wallet Earn hub polish ✅
- Sub-tabs: Earn | Streak | History inside Wallet → Earn
- Summary stat tiles (ready / streak / missions)
- Earn history filtered to engagement rewards
- Mobile-first cards, claim animations (CSS only)

## Phase 6 — Achievement badges (kills & wins) ✅
- `EngagementBadge` + `UserEngagementBadge` models
- Admin CRUD: Engagement → Badges
- Auto-unlock on match finalize (total kills / total wins)
- Profile badge showcase (own: progress + locked; public: unlocked only)
- Settings toggle: `badgesEnabled`

## Phase 7 — Referral milestones 2.0 ✅
- Tier rewards at 5 / 10 / 25 referred signups (admin-configurable thresholds + BAC)
- `UserEngagementReferral` claim state + sync on signup
- Referral dashboard + Wallet → Earn tier cards
- Ledger: `engagement_referral_reward`
- Admin: Engagement → Settings → Referral milestones

## Phase 8 — Weekly arena challenge ✅
- Admin weekly goal (team type + win target + BAC reward)
- BD calendar week tracking via `UserEngagementWeekly`
- Mini leaderboard snippet in Wallet → Earn
- Claim route + ledger `engagement_weekly_reward`

## Phase 9 — Smart reward notifications ✅
- In-app + Socket.IO alerts for mission complete, claim ready, badge unlock, streak at risk
- Admin toggles: `smartNotificationsEnabled`, `streakAtRiskHoursBeforeReset`
- Deduped 24h per event key; client toast on engagement notification types
- Lightweight `/api/v2/engagement/alerts` scan (no separate cron)

## Phase 10 — Light level / XP ✅
- `UserEngagementLevel` + admin `levelSystem` (XP rates + title ladder)
- XP from match join / win / kills + mission claims
- Level progress + title strip in Wallet → Earn
- Synced via engagement `/home` payload

## Phase 11 — Share-to-earn ✅
- Post-match share card on match result page (Web Share / copy)
- Optional BAC on verified share (participant + completed match, 1x per match)
- Admin `shareToEarn` settings + Wallet → Earn tip panel
- Ledger: `engagement_share_reward`

## Phase 12 — Deposit bonus days ✅
- Admin-scheduled % bonus window (`depositBonusDays`)
- Auto-applied on deposit approval (not on principal referral base)
- Wallet → Earn tip when window is active
- Ledger: `engagement_deposit_bonus`

## Phase 13 — Lucky spin (transparent odds) ✅
- Admin prize table with weights → public probabilities
- Daily free spin(s) via `UserEngagementSpin` audit log
- Wallet → Earn CSS wheel + odds table
- `GET/POST /api/v2/engagement/spin`
- Ledger: `engagement_spin_reward` when BAC > 0

## Phase 14 — Clan / team challenges ✅
- Lightweight invite-code squads (create/join/leave)
- Shared weekly win progress when enough squad members are in the same winning match
- Settings: `squadChallenge` (team type, target wins, min members, max size, reward)
- Models: `EngagementSquad`, `UserEngagementSquad`, `EngagementSquadWeekly`, `EngagementSquadWeeklyClaim`
- API: `POST /api/v2/engagement/squad/create|join|leave|claim` + home sync
- Web: `wallet-squad-challenge-panel.tsx` in Wallet → Earn
- Ledger: `engagement_squad_reward`

## Phase 15 — Season pass / Plus perks ✅
- Dual-track season pass: free rewards + Premium Plus track
- Admin `seasonPass` config: season key, schedule window, XP rates, tier ladder
- Model: `UserEngagementSeason` (xp + claimed free/plus levels per season)
- XP from match join, win, and mission claim
- `POST /api/v2/engagement/season/claim` + home sync payload
- Web: `wallet-season-pass-panel.tsx` in Wallet → Earn
- Ledger: `engagement_season_pass_reward`

---

## Admin nav (Phase 1+)
**Engagement** → Missions | Badges | Settings | (later: Streaks, Seasons)

## Permissions
- `engagement.view` — read missions & user progress
- `engagement.edit` — CRUD missions & settings
