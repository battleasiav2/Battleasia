#!/usr/bin/env bash
# Webuzo deploy with Passenger (no PM2) — lower idle RAM.
#
# First time:
#   git clone https://github.com/battleasiav2/Battleasia.git /home/nixbazar/Battleasia
#   cp api/.env.example /home/nixbazar/api/.env
#   pm2 delete battleasia-api 2>/dev/null || true
#   bash /home/nixbazar/Battleasia/deploy/webuzo-passenger-deploy.sh
#
# Guide: deploy/WEBUZO-PASSENGER-BN.md
#
set -euo pipefail

REPO_DIR="${REPO_DIR:-/home/nixbazar/Battleasia}"
LIVE_MAIN="${LIVE_MAIN:-/home/nixbazar/battleasia.gg}"
LIVE_API="${LIVE_API:-/home/nixbazar/api}"
MAIN_DOMAIN="${MAIN_DOMAIN:-https://battleasia.gg}"

export REPO_DIR LIVE_MAIN LIVE_API MAIN_DOMAIN

if [[ ! -d "$REPO_DIR/.git" ]]; then
  echo "ERROR: Repo not found at $REPO_DIR"
  exit 1
fi

if [[ ! -f "$LIVE_API/.env" ]]; then
  echo "ERROR: Missing $LIVE_API/.env"
  exit 1
fi

echo "==> BattleAsia Passenger deploy (no PM2)"
cd "$REPO_DIR"
git fetch origin main
git reset --hard origin/main

export MAIN_DOMAIN
bash "$REPO_DIR/deploy/build.sh"

echo "==> Sync site..."
mkdir -p "$LIVE_MAIN"
rsync -a --delete "$REPO_DIR/deploy/output/public_html/" "$LIVE_MAIN/"

echo "==> Sync api..."
mkdir -p "$LIVE_API"
rsync -a "$REPO_DIR/api/dist/" "$LIVE_API/dist/"
rsync -a "$REPO_DIR/api/package.json" "$REPO_DIR/api/package-lock.json" "$LIVE_API/" 2>/dev/null || \
  rsync -a "$REPO_DIR/api/package.json" "$LIVE_API/"

cd "$LIVE_API"
npm install --omit=dev

echo "==> Restart Passenger app..."
if command -v passenger-config >/dev/null 2>&1; then
  passenger-config restart-app "$LIVE_API" --ignore-app-not-running 2>/dev/null || \
    passenger-config restart-app "$(pwd)" --ignore-app-not-running 2>/dev/null || \
    echo "NOTE: Configure Passenger in Apache vhost — see deploy/passenger/webuzo-passenger.conf.example"
elif command -v passenger >/dev/null 2>&1; then
  passenger stop 2>/dev/null || true
  passenger start --daemonize --port 5050 --environment production --max-pool-size 1 --pool-idle-time 300
else
  echo "WARNING: Passenger not found. Install Passenger or use webuzo-git-deploy.sh (PM2)."
  exit 1
fi

sleep 2
if curl -sf "http://127.0.0.1:5050/health" >/dev/null 2>&1 || \
   curl -sf "${MAIN_DOMAIN}/api/health" >/dev/null 2>&1; then
  echo "SUCCESS: API healthy — $MAIN_DOMAIN"
else
  echo "WARNING: Health check failed — verify Passenger vhost + .env"
  exit 1
fi

SEED_MARKER="${SEED_MARKER:-/home/nixbazar/.battleasia-demo-seeded}"
if [[ "${RUN_SEED:-}" == "1" ]] || [[ ! -f "$SEED_MARKER" ]]; then
  echo "==> Seeding demo data..."
  if bash "$REPO_DIR/deploy/seed-all.sh"; then
    touch "$SEED_MARKER"
  fi
fi
