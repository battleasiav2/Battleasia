#!/usr/bin/env bash
# Build all BattleAsia apps in-place (no duplicate output folders).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

MAIN_DOMAIN="${MAIN_DOMAIN:-https://battleasia.gg}"
SHOP_DOMAIN="${SHOP_DOMAIN:-https://shop.battleasia.gg}"
ADMIN_DOMAIN="${ADMIN_DOMAIN:-https://admin.battleasia.gg}"

echo "==> BattleAsia build ($MAIN_DOMAIN)"
echo "Root: $ROOT"

echo "==> API..."
(cd api && npm run build)

echo "==> Player FE (battleasia.gg)..."
(
  cd battleasia.gg
  export VITE_SERVER_URL=''
  export VITE_BAC_SHOP_URL="${SHOP_DOMAIN}/user/shop"
  export VITE_CDN_URL=''
  npm run build:prod || npm run build
)

echo "==> Shop (shop.battleasia.gg)..."
(
  cd shop.battleasia.gg
  export VITE_SERVER_URL=''
  export VITE_MAIN_APP_URL="$MAIN_DOMAIN"
  export VITE_BASE_PATH='/'
  export VITE_CDN_URL=''
  npm run build
)

echo "==> Admin (admin.battleasia.gg)..."
(
  cd admin.battleasia.gg
  export REACT_APP_API_URL="$MAIN_DOMAIN"
  npm run build
)

HTACCESS="$ROOT/deploy/htaccess"
cp "$HTACCESS/battleasia.gg.htaccess" "$ROOT/battleasia.gg/dist/.htaccess"
cp "$HTACCESS/shop.battleasia.gg.htaccess" "$ROOT/shop.battleasia.gg/dist/.htaccess"
cp "$HTACCESS/admin.battleasia.gg.htaccess" "$ROOT/admin.battleasia.gg/build/.htaccess"

echo "Done. Deploy outputs:"
echo "  battleasia.gg/dist/       → public_html"
echo "  shop.battleasia.gg/dist/  → shop public_html"
echo "  admin.battleasia.gg/build/ → admin public_html"
echo "  api/dist/                 → ~/api/"
