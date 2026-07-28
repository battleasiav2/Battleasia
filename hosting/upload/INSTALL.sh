#!/bin/bash
set -e
HOME_DIR=/home/nixbazar
PKG_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "==> 1. Website to public_html"
mkdir -p "$HOME_DIR/public_html"
cp -a "$PKG_DIR/public_html/." "$HOME_DIR/public_html/"

echo "==> 2. API to /home/nixbazar/api"
rm -rf "$HOME_DIR/api"
mkdir -p "$HOME_DIR/api"
cp -a "$PKG_DIR/api/." "$HOME_DIR/api/"

echo "==> 3. npm install + start API port 5051"
cd "$HOME_DIR/api"
npm install --omit=dev
pkill -f "$HOME_DIR/api/dist/index.js" 2>/dev/null || true
sleep 1
nohup node "$HOME_DIR/api/dist/index.js" > "$HOME_DIR/api/api.log" 2>&1 &
sleep 5

echo "==> 4. Health check"
curl -s http://127.0.0.1:5051/health || true
echo ""
echo "==> Log:"
tail -40 "$HOME_DIR/api/api.log" || true
echo ""
echo "DONE"
echo "Site:  https://nixbazar.com/"
echo "API:   https://nixbazar.com/api/health"
echo "Admin: https://nixbazar.com/admin/"
echo "Login: admin@nixbazar.com / Admin@123456"
