#!/usr/bin/env bash
# Hostinger deploy: pull, build in repo folders, sync to live paths.
#
# First-time:
#   git clone https://github.com/battleasiav2/Battleasia.git ~/Battleasia
#   cp api/.env.example ~/api/.env   # edit MongoDB, JWT, etc.
#   bash ~/Battleasia/deploy/deploy.sh
#
set -euo pipefail

REPO_DIR="${REPO_DIR:-$HOME/Battleasia}"
MAIN_DOMAIN="${MAIN_DOMAIN:-https://battleasia.gg}"
SHOP_DOMAIN="${SHOP_DOMAIN:-https://shop.battleasia.gg}"
ADMIN_DOMAIN="${ADMIN_DOMAIN:-https://admin.battleasia.gg}"

MAIN_HOST="$(echo "$MAIN_DOMAIN" | sed -E 's~^https?://~~; s~/.*$~~')"
USER_HOME="${HOME}"

LIVE_MAIN="${LIVE_MAIN:-$USER_HOME/domains/$MAIN_HOST/public_html}"
LIVE_SHOP="${LIVE_SHOP:-$USER_HOME/domains/shop.$MAIN_HOST/public_html}"
LIVE_ADMIN="${LIVE_ADMIN:-$USER_HOME/domains/admin.$MAIN_HOST/public_html}"
LIVE_API="${LIVE_API:-$USER_HOME/api}"

echo "==> BattleAsia deploy"
echo "    Repo:  $REPO_DIR"
echo "    Main:  $LIVE_MAIN"
echo "    Shop:  $LIVE_SHOP"
echo "    Admin: $LIVE_ADMIN"
echo "    API:   $LIVE_API"

cd "$REPO_DIR"
echo "==> Git pull..."
git fetch origin main
git reset --hard origin/main

export MAIN_DOMAIN SHOP_DOMAIN ADMIN_DOMAIN
bash deploy/build.sh

echo "==> Sync battleasia.gg..."
rsync -a --delete "$REPO_DIR/battleasia.gg/dist/" "$LIVE_MAIN/"

echo "==> Sync shop.battleasia.gg..."
rsync -a --delete "$REPO_DIR/shop.battleasia.gg/dist/" "$LIVE_SHOP/"

echo "==> Sync admin.battleasia.gg..."
rsync -a --delete "$REPO_DIR/admin.battleasia.gg/build/" "$LIVE_ADMIN/"

echo "==> Sync api..."
mkdir -p "$LIVE_API"
rsync -a "$REPO_DIR/api/dist/" "$LIVE_API/dist/"
rsync -a "$REPO_DIR/api/package.json" "$REPO_DIR/api/package-lock.json" "$LIVE_API/" 2>/dev/null || \
  rsync -a "$REPO_DIR/api/package.json" "$LIVE_API/"

if [[ ! -f "$LIVE_API/.env" ]]; then
  echo "ERROR: Missing $LIVE_API/.env — create before first deploy."
  exit 1
fi

cd "$LIVE_API"
echo "==> npm install (api)..."
npm install --omit=dev

echo "==> Restart API..."
if command -v pm2 >/dev/null 2>&1; then
  pm2 restart battleasia-api 2>/dev/null || pm2 start dist/index.js --name battleasia-api
  pm2 save
else
  pkill -f "node dist/index.js" 2>/dev/null || true
  sleep 1
  nohup node dist/index.js > api.log 2>&1 &
fi

sleep 2
if curl -sf "http://127.0.0.1:5050/health" >/dev/null; then
  echo "SUCCESS: API healthy"
  echo "Live: $MAIN_DOMAIN | Shop: $SHOP_DOMAIN | Admin: $ADMIN_DOMAIN"
else
  echo "WARNING: API health check failed — check $LIVE_API/api.log"
  exit 1
fi
