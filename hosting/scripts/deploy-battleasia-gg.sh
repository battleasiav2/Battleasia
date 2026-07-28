#!/bin/bash
# BattleAsia — server-side deploy script (run on Hostinger via SSH)
# Pulls latest code, builds, copies to live folders, restarts API.
#
# First-time setup:
#   git clone https://github.com/battleasiav2/Battleasia.git ~/repos/Battleasia
#   cp battleasia-api/.env.example ~/battleasia-api/.env   # edit with real values
#   bash hosting/scripts/deploy-battleasia-gg.sh
#
# Usage:
#   bash hosting/scripts/deploy-battleasia-gg.sh

set -euo pipefail

REPO_DIR="${REPO_DIR:-$HOME/repos/Battleasia}"
MAIN_DOMAIN="${MAIN_DOMAIN:-https://battleasia.gg}"
SHOP_DOMAIN="${SHOP_DOMAIN:-https://shop.battleasia.gg}"
ADMIN_DOMAIN="${ADMIN_DOMAIN:-https://admin.battleasia.gg}"

MAIN_HOST="$(echo "$MAIN_DOMAIN" | sed -E 's~^https?://~~; s~/.*$~~')"
USER_HOME="${HOME}"

LIVE_MAIN="${LIVE_MAIN:-$USER_HOME/domains/$MAIN_HOST/public_html}"
LIVE_SHOP="${LIVE_SHOP:-$USER_HOME/domains/shop.$MAIN_HOST/public_html}"
LIVE_ADMIN="${LIVE_ADMIN:-$USER_HOME/domains/admin.$MAIN_HOST/public_html}"
LIVE_API="${LIVE_API:-$USER_HOME/battleasia-api}"

echo "==> BattleAsia deploy ($MAIN_HOST)"
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
bash hosting/scripts/build-for-hosting.sh

echo "==> Sync Player FE..."
rsync -a --delete "$REPO_DIR/hosting/domains/$MAIN_HOST/" "$LIVE_MAIN/"

echo "==> Sync Shop..."
rsync -a --delete "$REPO_DIR/hosting/domains/shop.$MAIN_HOST/" "$LIVE_SHOP/"

echo "==> Sync Admin..."
rsync -a --delete "$REPO_DIR/hosting/domains/admin.$MAIN_HOST/" "$LIVE_ADMIN/"

echo "==> Sync API..."
mkdir -p "$LIVE_API"
rsync -a "$REPO_DIR/hosting/api/dist/" "$LIVE_API/dist/"
rsync -a "$REPO_DIR/hosting/api/package.json" "$REPO_DIR/hosting/api/package-lock.json" "$LIVE_API/" 2>/dev/null || \
  rsync -a "$REPO_DIR/hosting/api/package.json" "$LIVE_API/"

if [[ ! -f "$LIVE_API/.env" ]]; then
  echo "ERROR: Missing $LIVE_API/.env — create it before first deploy."
  exit 1
fi

cd "$LIVE_API"
echo "==> npm install (API)..."
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
  echo "Live: $MAIN_DOMAIN"
  echo "Shop: $SHOP_DOMAIN"
  echo "Admin: $ADMIN_DOMAIN"
else
  echo "WARNING: API health check failed — check $LIVE_API/api.log or pm2 logs battleasia-api"
  exit 1
fi
