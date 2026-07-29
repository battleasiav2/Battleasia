# Deploy scripts

| File | Purpose |
|------|---------|
| `build.ps1` / `build.sh` | Build all apps in-place + copy `.htaccess` |
| `deploy.sh` | Hostinger SSH: git pull, build, rsync, pm2 restart |
| `htaccess/` | Apache rules for battleasia.gg, shop, admin |
| `HOSTINGER-SETUP.md` | Full Hostinger guide |
| `backup-mongo.ps1` / `backup-mongo.sh` | MongoDB backup |
| `init-ssl.sh` | VPS SSL (Docker only) |

Quick build:

```powershell
npm run build
```
