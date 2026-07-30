#!/usr/bin/env bash
# Run ON THE WEBUZO SERVER after git pull — builds player + store + admin, keeps API on pm2.
# Paths: adjust SITE_ROOT / API_ROOT if your Webuzo layout differs.

set -euo pipefail

SITE_ROOT="${SITE_ROOT:-/home/nixbazar/battleasia.gg/public_html}"
API_ROOT="${API_ROOT:-/home/nixbazar/api}"
REPO_ROOT="${REPO_ROOT:-/home/nixbazar/Battleasia}"
BRANCH="${BRANCH:-main}"

echo "==> Pull latest from GitHub ($BRANCH)"
cd "$REPO_ROOT"
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

echo "==> Install & build (production uses MONGODB_URI from $API_ROOT/.env — NOT Docker)"
cd "$REPO_ROOT"
npm ci --omit=dev 2>/dev/null || npm install
npm run build:prod 2>/dev/null || npm run build

echo "==> Sync static sites"
rsync -a --delete "$REPO_ROOT/battleasia.gg/dist/" "$SITE_ROOT/"
rsync -a --delete "$REPO_ROOT/shop.battleasia.gg/dist/" "$SITE_ROOT/store/"
rsync -a --delete "$REPO_ROOT/admin.battleasia.gg/dist/" "$SITE_ROOT/admin/"

if [ -f "$REPO_ROOT/deploy/htaccess/single-domain.htaccess" ]; then
  cp "$REPO_ROOT/deploy/htaccess/single-domain.htaccess" "$SITE_ROOT/.htaccess"
fi

echo "==> API"
cd "$API_ROOT"
npm ci --omit=dev 2>/dev/null || npm install
npm run build 2>/dev/null || true
pm2 restart battleasia-api || pm2 start dist/index.js --name battleasia-api

echo "==> Uploads symlink"
rm -rf "$SITE_ROOT/uploads"
ln -sfn "$API_ROOT/uploads" "$SITE_ROOT/uploads"

echo "Deploy complete: https://battleasia.gg"
