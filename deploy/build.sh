#!/usr/bin/env bash
# Build all BattleAsia apps for single-domain deploy (battleasia.gg).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

MAIN_DOMAIN="${MAIN_DOMAIN:-https://battleasia.gg}"
MAIN_DOMAIN="${MAIN_DOMAIN%/}"
SHOP_PATH="${SHOP_PATH:-/store}"
ADMIN_PATH="${ADMIN_PATH:-/admin}"
ADMIN_PATH="${ADMIN_PATH%/}"

echo "==> BattleAsia build — single domain ($MAIN_DOMAIN)"
echo "Root: $ROOT"

echo "==> API..."
(
  cd api
  # Hostinger sets NODE_ENV=production and skips devDependencies (tsc lives there).
  npm install --include=dev
  npx tsc
)

echo "==> Player FE (battleasia.gg)..."
(
  cd battleasia.gg
  npm install --include=dev
  export VITE_SERVER_URL=''
  export VITE_BAC_SHOP_URL="${MAIN_DOMAIN}${SHOP_PATH}/user/shop"
  export VITE_CDN_URL=''
  npm run build:prod || npm run build
)

echo "==> Shop (${SHOP_PATH}/)..."
(
  cd shop.battleasia.gg
  npm install --include=dev
  export VITE_SERVER_URL=''
  export VITE_MAIN_APP_URL="$MAIN_DOMAIN"
  export VITE_BASE_PATH="${SHOP_PATH}/"
  export VITE_CDN_URL=''
  npm run build
)

echo "==> Admin (${ADMIN_PATH}/)..."
(
  cd admin.battleasia.gg
  npm install --include=dev
  export REACT_APP_API_URL="$MAIN_DOMAIN"
  export REACT_APP_BASENAME="$ADMIN_PATH"
  export PUBLIC_URL="$ADMIN_PATH"
  npm run build
)

bash "$ROOT/deploy/assemble-single-domain.sh"

echo "Done. Deploy output:"
echo "  deploy/output/public_html/  -> battleasia.gg public_html"
echo "  api/dist/                   -> ~/api/"
