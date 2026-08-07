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

## Before “final delivery”

- [ ] Lighthouse **mobile** (primary) + desktop
- [ ] GTmetrix or WebPageTest cross-check
- [ ] Fix any LCP/CLS/TBT regression before marking complete
- [ ] Prefer deleting a visual effect over missing the budget

## Commands

```bash
yarn build
yarn start
# then run Lighthouse against http://localhost:8081
```

See `ARCHITECTURE-PERFORMANCE.md` and `src/perf/`.
