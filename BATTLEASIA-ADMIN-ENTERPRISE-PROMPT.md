# BattleAsia Admin Panel — Enterprise UI/UX & Advanced Utilities Prompt

> **Status: spec only — do not implement until asked.** Main build comes later.
>
> Upgrade **`admin.battleasia.gg`** with enterprise-grade data management, operational utilities, security controls, and UX — across Users, Matches, Payments, Feed, Support, and System — **without breaking existing business logic or API contracts**.
>
> Companion docs: `BATTLEASIA-MASTER-PROMPT.md` (full product/API), `BATTLEASIA-REDESIGN-PROMPT.md` (new look + unique features). This file is **admin-ops only**.

---

You are an expert full-stack developer specializing in React 18, Material UI (MUI 5/6), MUI X DataGrid, Node.js, Express, and MongoDB.

---

## 1. Data Tables & Bulk Actions (MUI X DataGrid)

Apply across all list views: **Users, Matches, Deposits, Withdrawals, Feed Posts, Transactions / Balance Histories**.

1. **Multi-selection & checkbox controls**
   - Header `Select All` for the current page **or** the entire filtered dataset.
   - Dynamic floating action toolbar when 1+ rows are selected.
2. **Bulk actions**
   - **Deposits / Withdrawals:** `Bulk Approve` and `Bulk Reject` (reject requires a reason dialog).
   - **Users:** `Bulk Ban/Suspend` and `Bulk Status Toggle` (Active/Inactive).
   - **Feed posts / Reels:** `Bulk Delete/Hide` for spam moderation.
3. **Export & print-ready views**
   - `Export to CSV` and `Export to Excel (.xlsx / .xls)`.
   - Dedicated `Print` button using CSS `@media print` — hide admin sidebar, navbars, and action buttons; render a clean branded ledger/receipt page.
4. **Advanced filters & date-range picker**
   - Quick filters: **Today**, **Yesterday**, **Last 7 Days**, **This Month**, plus custom date-time range.
   - Column visibility toggle and density switcher (Compact / Standard / Comfortable).

---

## 2. Form Utilities & Content Management

1. **Auto-slug generator**
   - Game and Match create forms: auto SEO slug from title (e.g. `PUBG Mobile Squad Tournament` → `pubg-mobile-squad-tournament`), with **manual override**.
2. **Room ID & password quick-generator**
   - “Generate Random” next to Match **Room ID** and **Room Password**.
3. **Live payout & fee preview**
   - On match results / winnings distribution, live preview of:
     - Gross prize pool
     - Platform fee deduction (%)
     - Net BAC per winner/kill
   - **Block submit** if distributed total exceeds collected entry fees.

---

## 3. Financial & Payment Verification Tools

1. **Receipt image lightbox & zoom**
   - Manual deposit verification: click screenshot → high-res modal with zoom in/out, pan, 90° rotate.
   - One-click copy of **TrxID** and **phone/from address** with “Copied!” feedback.
2. **Double confirmation on high-value operations**
   - Withdrawal approval or manual balance adjust **above threshold (default 1,000 BAC)** must open a confirm modal requiring **admin password** (or 2FA if enabled) before the API call.

---

## 4. Security & Account Governance

1. **Password change with strength meter** (`/profile`)
   - Current password required.
   - New password visual strength meter (uppercase, lowercase, numbers, special chars, min length).
2. **Active sessions & remote logout**
   - List current sessions: device/OS, IP, last active.
   - Terminate one session **or** “Logout from all other devices”.
3. **Audit logs (activity tracking)**
   - Central tracker: who, target entity ID, action type (`BALANCE_ADJUST`, `MATCH_RESULT_SUBMIT`, `USER_BAN`, deposit/withdrawal approve/reject, etc.), IP, timestamp.
   - Admin page to filter/search/export these logs.

---

## 5. UI Polish, Audio Chimes & Keyboard Shortcuts

1. **Realtime audio chime for pending queues**
   - Socket.IO: `new-deposit`, `new-withdrawal`.
   - Subtle professional chime; **mute toggle in the top bar**.
2. **Command palette / keyboard shortcuts**
   - Global `Ctrl + K` **and** `Cmd + K` to jump to any section, search users by ID/username, or search matches.
   - `Esc` closes open dialogs and drawers.
3. **State consistency**
   - Skeleton loaders for tables, metric cards, charts (not generic spinners).
   - Empty states with icon + clear CTA when filters match nothing.

---

## Implementation guidelines

- Clean modular React: custom hooks for filters, **reusable DataGrid wrapper**.
- Do **not** remove or alter existing endpoints or data schemas; add UI logic and **new additive APIs** only (bulk, verify-password, single-session revoke).
- Dark theme + esports/fintech aesthetic.
- Every new unique product feature elsewhere stays **admin on/off** (`BATTLEASIA-REDESIGN-PROMPT.md` §11).

---

## Codebase anchors (for the later build)

### Admin app — `admin.battleasia.gg`

| Piece | Path | Notes |
|-------|------|--------|
| List views (still raw `DataGrid`) | `src/sections/users/list/view.tsx`, `games/matches/view.tsx`, `payments/deposit/view.tsx`, `payments/withdrawal/view.tsx`, `feed/list/view.tsx`, `payments/balance-history/view.tsx` | Wire the wrapper below |
| Reusable grid (exists, **not wired**) | `src/components/admin-data-grid/index.tsx` | Select, bulk bar, date presets, CSV/Excel/Print |
| Export/print utils | `src/utils/admin-data-tools.ts` | SpreadsheetML `.xls` (no `xlsx` dep yet) |
| Date presets hook | `src/hooks/use-date-range-filter.ts` | |
| Password-gated confirm (unused) | `src/components/confirm-action-dialog/index.tsx` | Use for ≥1000 BAC |
| Receipt lightbox (imported, **not rendered**) | `src/components/receipt-lightbox/index.tsx` | Deposit screenshots |
| Copy button | `src/components/copy-button/index.tsx` | TrxID / phone |
| Room ID/password generators (**not in form**) | `src/utils/generate-credentials.ts` | Wire `matches/form.tsx` |
| Slug helper | `src/utils/slugify.ts` | Wire Game + Match forms |
| Prize pool math (exists) | `src/sections/games/matches/result-view.tsx` | Add over-distribution block |
| Searchbar | `src/layouts/_common/searchbar/searchbar.tsx` | Today **⌘K / metaKey only** — add **Ctrl+K** |
| Header (mute toggle goes here) | `src/layouts/dashboard/header.tsx` | |
| Socket pending queues | `src/contexts/SocketContext.tsx` | `new-deposit`, `new-withdrawal` — **no chime yet** |
| Profile password | `src/sections/profile/view.tsx` | Add strength meter; sessions currently on Users → Online |
| Sessions UI | `src/sections/users/online/view.tsx` | Per-user + logout-all; **no single session revoke** |

### API — `api/`

| Need | Exists today? | Add later |
|------|----------------|-----------|
| Deposit approve/reject | `PATCH /api/v4/payments/deposit-history/:id/approve\|reject` | **Bulk** `PATCH .../bulk/approve` + `/bulk/reject` `{ ids, rejection_reason? }` |
| Withdrawal approve/complete/reject | `PATCH /api/v4/payments/withdrawal-history/:id/...` | **Bulk** approve/reject |
| User status toggle | `PATCH /api/v3/users/list/:id/status` `{ status: boolean }` — no separate ban entity | **Bulk** `PATCH .../bulk/status` `{ ids, status }` |
| User balance adjust | `PATCH /api/v3/users/list/:id/balance` | Client high-value confirm; optional verify-password |
| Feed delete / hide | `DELETE /api/v3/feed/list/:id`; hide = `PUT` `status: 'draft'` | **Bulk** delete/hide |
| Reels | `DELETE /api/v2/social/reels/:id` only | Bulk delete |
| Sessions | `GET /api/v3/users/sessions`, `DELETE .../all`, `DELETE .../user/:userId` | **`DELETE .../:sessionId`** |
| Admin password change | `PATCH /api/v3/users/auth/profile` `{ currentPassword, newPassword }` | Optional `POST .../verify-password` for high-value confirm |
| Audit log **model + GET** | `api/src/models/AuditLog.ts`, `GET /api/v3/audit-logs`, `recordAudit()` | **Admin page** + log more actions (match CRUD, feed, session revoke, password change) |
| Receipt image on deposit | **No field today** | Lightbox on any image URL if present; do not break schema |
| High-value threshold | **Not in AppSettings** | UI constant 1000 BAC first; later optional admin setting |

Audit actions already written in some payment/user/match routes: `DEPOSIT_APPROVE/REJECT`, `WITHDRAWAL_APPROVE/COMPLETE/REJECT`, `USER_STATUS_TOGGLE`, `BALANCE_ADJUST`, `MATCH_RESULT_SUBMIT`.

---

## Suggested build order (when implementation starts)

1. Wire `AdminDataGrid` into Deposits + Withdrawals (export, filters, bulk + new bulk APIs).
2. Same grid on Users, Matches, Feed, Balance histories.
3. Form utilities (slug, room generate, payout over-cap).
4. Receipt lightbox + copy + high-value password confirm.
5. Password meter, profile/session revoke, Audit Logs page.
6. Audio chime + mute, Ctrl+K, skeletons, empty states.

**Do not start this list until the user explicitly asks to implement.**
