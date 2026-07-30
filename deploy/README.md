# Deploy scripts (single domain: battleasia.gg)

| File | Purpose |
|------|---------|
| `build.ps1` / `build.sh` | Build all apps + assemble `deploy/output/public_html/` |
| `assemble-single-domain.ps1` / `.sh` | Merge player + `/store/` + `/admin/` into one folder |
| `deploy.sh` | Hostinger SSH: git pull, build, rsync, pm2 restart |
| `htaccess/single-domain.htaccess` | Apache SPA routing for one domain |
| `HOSTINGER-SETUP.md` | Full Hostinger guide |
| `backup-mongo.ps1` / `backup-mongo.sh` | MongoDB backup |

Quick build:

```powershell
npm run build
```

Output: `deploy/output/public_html/` → upload to Hostinger `public_html`
