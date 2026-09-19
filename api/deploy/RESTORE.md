# Mongo backup / restore

Local dumps land in `api/backups/` (gitignored). Keep 7 local copies.

## Daily backup

```bash
cd api
npm run backup:mongo
```

Windows daily task (03:15, current user):

```powershell
cd api
npm run backup:install-task
# or: powershell -File scripts/install-backup-task.ps1
```

Remove: `powershell -File scripts/uninstall-backup-task.ps1`.

Linux cron: `scripts/backup-daily.sh`. Coolify: `deploy/coolify-compose.yaml` + `deploy/Dockerfile`.

Each successful dump writes `backups/.last.json` (admin Integrity ops / dashboard chips).

## Encryption + off-site

Set in `api/.env` (never commit):

```
BACKUP_ENCRYPT_PASSPHRASE=long-random
BACKUP_S3_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com
BACKUP_S3_BUCKET=battleasia-backups
BACKUP_S3_ACCESS_KEY=
BACKUP_S3_SECRET=
BACKUP_S3_REGION=auto
```

Optional extra copy: `BACKUP_OFFSITE_CMD` with `{file}` placeholder (rclone, aws cli, scp).

Retention: 7 local. Off-site lifecycle (30 days) is configured on the bucket.

## Restore

1. Stop API writers if this is production.
2. Replica-set URI in `MONGODB_URI`.
3. Decrypt + restore:

```bash
npm run restore:mongo -- backups/mongo-YYYY-MM-DDTHH-mm-ss.tgz
# or encrypted:
BACKUP_ENCRYPT_PASSPHRASE=... npm run restore:mongo -- backups/mongo-....tgz.enc
```

Seed-only empty DB: `npm run restore-db -- path/to/bson-dir` (legacy BSON folder import).
