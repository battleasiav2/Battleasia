#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/deploy/output/public_html"

echo "==> Assemble single-domain public_html..."

rm -rf "$OUT"
mkdir -p "$OUT"

cp -a "$ROOT/battleasia.gg/dist/." "$OUT/"
mkdir -p "$OUT/store"
cp -a "$ROOT/shop.battleasia.gg/dist/." "$OUT/store/"
mkdir -p "$OUT/admin"
cp -a "$ROOT/admin.battleasia.gg/build/." "$OUT/admin/"
cp "$ROOT/deploy/htaccess/single-domain.htaccess" "$OUT/.htaccess"

echo "Done: deploy/output/public_html/"
echo "  /         player"
echo "  /store/   shop"
echo "  /admin/   admin"
