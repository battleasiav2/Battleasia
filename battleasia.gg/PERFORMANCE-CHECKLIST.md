# Performance delivery checklist

**Ship only if all gates pass.** Targets: Performance **90–98+**, LCP **< 2.5s**, CLS **< 0.1**, TBT **< 150ms**.

## Before coding a feature

- [ ] Will this run on the LCP path (hero / header / first paint)?
- [ ] If yes: CSS only, no Framer Motion / Three.js / heavy charts
- [ ] If no: `lazy()` + `LazySection` / dynamic import
- [ ] Images: WebP/AVIF + width/height or aspect-ratio
- [ ] No new third-party script without explicit approval
- [ ] No secrets in client env

## Before merge

- [ ] No sync `import … from 'framer-motion'` in hero/header/Image
- [ ] Below-fold sections code-split
- [ ] Public page has `PageMeta` (title + description + canonical)
- [ ] New public URL added to `public/sitemap.xml`
- [ ] Layout reserved for async UI (minHeight / skeleton)

## Phase E — CDN / API cache (code done)

- [x] Long-cache hashed `/assets/*`; no-cache HTML (`docker/nginx/*.conf`)
- [x] `/uploads` Cache-Control 7d (API + nginx prod)
- [x] `GET /api/v3/public/dashboard` memory cache 45s + HTTP Cache-Control
- [x] Hot-list indexes on Match / Feed / MatchParticipant
- [ ] **Ops:** Enable Cloudflare or Hostinger CDN; purge after deploy

## Phase F — Measure gate (required before ship)

Run **mobile** Lighthouse on **`/dashboard`** (not `/` — that only redirects).

| URL | Local preview (2026-08-08) | Gate |
|-----|----------------------------|------|
| `/dashboard` | Perf ~53, LCP ~6–7s (throttled SPA), **CLS 0**, TBT ~500ms | CLS pass; Perf/LCP/TBT need prod CDN + JS budget |
| `/auth/sign-in` | Perf ~62, CLS 0, LCP ~6.5s, TBT ~250ms | CLS pass |
| `/user/*` | not run (auth) | retest after deploy |

```bash
npm run build && npm run start -- --host 127.0.0.1 --port 8081
npx lighthouse http://127.0.0.1:8081/dashboard --form-factor=mobile --only-categories=performance --chrome-flags="--headless --no-sandbox"
```

## Phase E todos in plan
- Done in code (API cache headers, indexes, nginx). Ops CDN still manual.

## Phase F local results (mobile, Vite preview)
- **CLS: 0** (was 0.76) — gate pass for layout
- Perf / LCP / TBT still above budget locally (MUI SPA + 4× throttle); retest on production after CDN

## Commands

```bash
npm run build
npm run start
# Lighthouse against http://localhost:8081/dashboard
```

See `ARCHITECTURE-PERFORMANCE.md` and `src/perf/`.
