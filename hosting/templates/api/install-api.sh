#!/bin/bash
# BattleAsia API — Webuzo one-click install
# Run: bash install-api.sh

set -e
cd "$(dirname "$0")"

echo "==> Installing API dependencies..."
npm install --omit=dev

echo "==> Stopping old process (if any)..."
pkill -f "node dist/index.js" 2>/dev/null || true
sleep 1

echo "==> Starting API on port 5050..."
nohup node dist/index.js > api.log 2>&1 &
sleep 2

echo "==> Health check..."
if curl -sf http://127.0.0.1:5050/health > /dev/null; then
  echo "SUCCESS! API is running."
  echo "Test: https://nixbazar.com/api/health"
else
  echo "WARNING: API may not have started. Check: cat api.log"
  tail -20 api.log 2>/dev/null || true
fi

echo ""
echo "Admin login: admin@nixbazar.com / Admin@123456"
echo "Logs: tail -f $(pwd)/api.log"
