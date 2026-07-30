#!/usr/bin/env bash
# Seed demo users, games, feed, shop data into production MongoDB (idempotent — safe to re-run).
#
# Usage (Webuzo SSH):
#   bash /home/nixbazar/Battleasia/deploy/seed-all.sh
#
# Requires: LIVE_API/.env with MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET
#
set -euo pipefail

REPO_DIR="${REPO_DIR:-/home/nixbazar/Battleasia}"
LIVE_API="${LIVE_API:-/home/nixbazar/api}"
API_SRC="${API_SRC:-$REPO_DIR/api}"

if [[ ! -f "$LIVE_API/.env" ]]; then
  echo "ERROR: Missing $LIVE_API/.env"
  exit 1
fi

if [[ ! -d "$API_SRC" ]]; then
  echo "ERROR: API source not found at $API_SRC"
  exit 1
fi

echo "==> Seed demo data (MongoDB from $LIVE_API/.env)"
cd "$API_SRC"

echo "==> Install API deps (tsx for seed scripts)..."
npm install --include=dev

echo "==> Load env..."
set -a
# shellcheck disable=SC1091
source "$LIVE_API/.env"
set +a

if [[ -z "${MONGODB_URI:-}" ]]; then
  echo "ERROR: MONGODB_URI not set in $LIVE_API/.env"
  exit 1
fi

echo "==> Running seed scripts..."
npm run seed
npm run seed:games
npm run seed:dashboard
npm run seed:feed
npm run seed:social
npm run seed:demo

echo ""
echo "==> Demo login (after seed):"
echo "  Admin:  ${ADMIN_EMAIL:-admin@battleasia.gg} / (ADMIN_PASSWORD from .env)"
echo "  Player: player@battleasia.local / Player@123456"
echo "  Player: nixhyip@gmail.com / Nix@7777"
echo ""
echo "Seed complete."
