#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

MAIN_DOMAIN="${MAIN_DOMAIN:-https://battleasia.gg}"
SHOP_DOMAIN="${SHOP_DOMAIN:-https://shop.battleasia.gg}"
ADMIN_DOMAIN="${ADMIN_DOMAIN:-https://admin.battleasia.gg}"

MAIN_HOST="$(echo "$MAIN_DOMAIN" | sed -E 's~^https?://~~; s~/.*$~~')"

echo "==> BattleAsia hosting build"
echo "Root: $ROOT"

copy_tree() {
  local src="$1"
  local dest="$2"
  shift 2
  local keep=("$@")
  mkdir -p "$dest"
  for name in "${keep[@]}"; do
    if [[ -f "$dest/$name" ]]; then
      cp "$dest/$name" "/tmp/ba-keep-$name"
    fi
  done
  rm -rf "$dest"
  mkdir -p "$dest"
  cp -a "$src/." "$dest/"
  for name in "${keep[@]}"; do
    if [[ -f "/tmp/ba-keep-$name" ]]; then
      cp "/tmp/ba-keep-$name" "$dest/$name"
    fi
  done
}

echo "==> Building API..."
(cd battleasia-api && npm run build)

echo "==> Building Player FE..."
(
  cd battleasia-fe-main/battleasia-fe-main
  export VITE_SERVER_URL=''
  export VITE_BAC_SHOP_URL="${SHOP_DOMAIN}/user/shop"
  export VITE_CDN_URL=''
  npm run build:prod || npm run build
)

echo "==> Building Shop..."
(
  cd battleasia-shop-main/battleasia-shop-main
  export VITE_SERVER_URL=''
  export VITE_MAIN_APP_URL="$MAIN_DOMAIN"
  export VITE_BASE_PATH='/'
  export VITE_CDN_URL=''
  npm run build
)

echo "==> Building Admin..."
(
  cd battleasia-admin-main/battleasia-admin-main
  export REACT_APP_API_URL="$MAIN_DOMAIN"
  npm run build
)

DOMAINS="$ROOT/hosting/domains"
API_DEST="$ROOT/hosting/api"
MAIN_DEST="$DOMAINS/$MAIN_HOST"
SHOP_DEST="$DOMAINS/shop.$MAIN_HOST"
ADMIN_DEST="$DOMAINS/admin.$MAIN_HOST"

copy_tree battleasia-fe-main/battleasia-fe-main/dist "$MAIN_DEST" .htaccess UPLOAD-HERE.txt
copy_tree battleasia-shop-main/battleasia-shop-main/dist "$SHOP_DEST" .htaccess UPLOAD-HERE.txt
copy_tree battleasia-admin-main/battleasia-admin-main/build "$ADMIN_DEST" .htaccess UPLOAD-HERE.txt

mkdir -p "$API_DEST/dist"
cp -a battleasia-api/dist/. "$API_DEST/dist/"
cp battleasia-api/package.json "$API_DEST/"
[[ -f battleasia-api/package-lock.json ]] && cp battleasia-api/package-lock.json "$API_DEST/"
cp .env.production.example "$ROOT/hosting/env/.env.production.example"

HTACCESS_TPL="$ROOT/hosting/templates/battleasia.gg"
if [[ -d "$HTACCESS_TPL" ]]; then
  cp "$HTACCESS_TPL/.htaccess" "$MAIN_DEST/.htaccess"
  cp "$HTACCESS_TPL/shop.htaccess" "$SHOP_DEST/.htaccess"
  cp "$HTACCESS_TPL/admin.htaccess" "$ADMIN_DEST/.htaccess"
fi

echo "Done! Upload:"
echo "  $MAIN_DEST"
echo "  $SHOP_DEST"
echo "  $ADMIN_DEST"
echo "  $API_DEST"
