#!/bin/bash
set -e
ROOT=/mnt/c/Users/sumon/Desktop/battleasianew
OUT="$ROOT/hosting/upload"
STAGE="$OUT/_full_stage"

rm -rf "$STAGE"
mkdir -p "$STAGE/public_html" "$STAGE/api"

cp -a "$ROOT/hosting/domains/nixbazar.com/." "$STAGE/public_html/"
sed -i 's/127.0.0.1:5050/127.0.0.1:5051/g' "$STAGE/public_html/.htaccess"
rm -f "$STAGE/public_html/UPLOAD-HERE.txt"

cp -a "$ROOT/hosting/api/." "$STAGE/api/"
rm -rf "$STAGE/api/node_modules"
grep -v '^PORT=' "$STAGE/api/.env" > "$STAGE/api/.env.tmp"
echo 'PORT=5051' >> "$STAGE/api/.env.tmp"
mv "$STAGE/api/.env.tmp" "$STAGE/api/.env"

cp "$OUT/INSTALL.sh" "$STAGE/INSTALL.sh"
cp "$OUT/README-BN.txt" "$STAGE/README-BN.txt"
chmod +x "$STAGE/INSTALL.sh"

cd "$STAGE"
rm -f "$OUT/nixbazar-FULL.tar.gz" "$OUT/nixbazar-api.tar.gz"
tar -czf "$OUT/nixbazar-FULL.tar.gz" public_html api INSTALL.sh README-BN.txt
tar -czf "$OUT/nixbazar-api.tar.gz" -C api .

echo "VERIFY:"
tar -tzf "$OUT/nixbazar-FULL.tar.gz" | grep 'routes/v3/auth.js'
tar -tzf "$OUT/nixbazar-FULL.tar.gz" | grep 'INSTALL.sh'
ls -lh "$OUT/nixbazar-FULL.tar.gz" "$OUT/nixbazar-api.tar.gz"

rm -rf "$STAGE"
echo "DONE"
