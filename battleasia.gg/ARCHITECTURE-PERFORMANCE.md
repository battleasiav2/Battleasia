# Performance-first architecture

This package is built **performance-first**. Visual polish is allowed only when it does not break Core Web Vitals.

## Budgets (ship gate)

| Metric | Target |
|--------|--------|
| Lighthouse Performance | **90–98+** |
| LCP | **< 2.5s** |
| CLS | **< 0.1** |
| TBT | **< 150ms** |

Fail any budget → not ready to ship.

## Architecture layers

```
┌─────────────────────────────────────────────┐
│  HTML shell (index.html)                    │
│  - meta/SEO, preconnect, LCP image preload  │
├─────────────────────────────────────────────┤
│  Critical JS (main + react + route shell)   │
│  - header/logo, hero LCP image, CTA         │
│  - NO framer-motion / three / heavy charts  │
├─────────────────────────────────────────────┤
│  Deferred JS (dynamic import / idle)        │
│  - below-fold sections, widgets, motion     │
│  - auth forms chunk, i18n extras            │
├─────────────────────────────────────────────┤
│  Media                                      │
│  - WebP/AVIF, fixed aspect boxes, lazy      │
└─────────────────────────────────────────────┘
```

## Code map

| Concern | Location |
|---------|----------|
| Budgets + conventions | `src/perf/budgets.ts` |
| Native lazy-in-view (no FM) | `src/perf/use-in-view.ts` |
| Safe media wrapper | `src/perf/media.tsx` |
| Lazy motion (never sync) | `src/perf/lazy-motion.tsx` |
| SEO page meta | `src/perf/page-meta.tsx` |
| Below-fold section gate | `src/perf/lazy-section.tsx` |
| Sitemap / robots | `public/sitemap.xml`, `public/robots.txt` |
| Delivery checklist | `PERFORMANCE-CHECKLIST.md` |

## Rules of engagement

1. **LCP element** = first hero image or brand title — preload in `index.html`, `fetchpriority="high"`, fixed dimensions.
2. **Animations** = CSS first. Framer Motion only via `src/perf/lazy-motion.tsx` after paint / below fold.
3. **Three.js** = never on home critical path; route-level `lazy()` only.
4. **Images** = WebP preferred; always set `width`/`height` or CSS `aspect-ratio`; non-LCP = `loading="lazy"`.
5. **Fonts** = limited families; `font-display: swap`; avoid blocking webfont cascades.
6. **JS** = route + section code splitting; keep vendor chunks (already in `vite.config.ts`); do not add libraries without removing an existing one when possible.
7. **API** = no blocking fetch for first paint; cache + pagination + indexes on backend; secrets never in client env beyond public URLs.
8. **CLS** = skeletons/min-heights for async UI; no late-injected banners without reserved space.
9. **SEO** = semantic landmarks (`header`, `main`, `nav`, `footer`), unique title/description per page, sitemap entry for public URLs.
10. **QA** = Lighthouse mobile + desktop + GTmetrix before release.

## CDN / cache (Phase E)

| Layer | Policy |
|-------|--------|
| Hashed `/assets/*` | `public, max-age=31536000, immutable` |
| Static media (webp/png/woff2) | `public, max-age=2592000` |
| HTML (`index.html`) | `no-cache` |
| `/uploads/*` | `public, max-age=604800` (7d) |
| `GET /api/v3/public/dashboard` | In-memory 45s + `max-age=30, s-maxage=45, stale-while-revalidate=60` |

Enable Cloudflare/Hostinger CDN on apex + www + shop. Bypass `/api/*` (or honor Cache-Control). Purge CDN after each FE deploy.

**DB indexes:** Match (`status` + schedule/entryFee/createdAt, `gameId` + createdAt), Feed (`status` + createdAt/views, author timelines), MatchParticipant (`userId` + createdAt).

## Auth & security (public package)

- Public routes only in this package.
- Auth forms may call API but never embed secrets (`JWT_SECRET`, DB URIs, payment keys).
- Validate all inputs server-side; client validation is UX only.

## Do / Don't

| Do | Don't |
|----|--------|
| CSS keyframes for hero polish | Sync `import from 'framer-motion'` in hero |
| `lazy(() => import('./Section'))` | Eager-load all home sections |
| Preload only the LCP image | Preload every slide |
| Aspect-ratio boxes | Images without size → layout jump |
| Test mobile Lighthouse first | Ship on desktop-only scores |
