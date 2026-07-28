#!/bin/bash
# Fix "Failed to load live stats" + broken home CSS on nixbazar.com
# Run on server as nixbazar user:
#   bash FIX-LIVE-STATS.sh
set -euo pipefail

WEBROOT="${WEBROOT:-/home/nixbazar/public_html}"
API_DIR="${API_DIR:-/home/nixbazar/public_html/api}"

echo "==> 1) Clean broken CSS in index.html"
cd "$WEBROOT"
python3 - << 'PY'
from pathlib import Path
import re
p = Path('index.html')
html = p.read_text(encoding='utf-8', errors='ignore')
html = re.sub(r'(?s)\s*<style>.*?</style>', '', html)
fix = '''
<style>
html,body{margin:0!important;padding:0!important;width:100%!important;max-width:100%!important;min-height:100%!important;background:#000!important;overflow-x:hidden!important}
#root,#root__layout{width:100%!important;max-width:100%!important;margin:0!important;padding:0!important;min-height:100vh!important}
</style>
'''
if '</head>' not in html:
    raise SystemExit('ERROR: </head> missing')
p.write_text(html.replace('</head>', fix + '</head>', 1), encoding='utf-8')
t = p.read_text(encoding='utf-8', errors='ignore')
print('CSS:', 'OK' if ('background:#000' in t and '#aa14' not in t) else 'CHECK')
PY

echo "==> 2) Verify public dashboard API"
code=$(curl -sS -o /tmp/ba-dash.json -w '%{http_code}' --max-time 15 \
  -H 'Accept: application/json' \
  'http://127.0.0.1:30017/api/v3/public/dashboard' || true)
echo "localhost:30017 -> HTTP $code"
if [ "$code" != "200" ]; then
  code2=$(curl -sS -o /tmp/ba-dash.json -w '%{http_code}' --max-time 15 \
    -H 'Accept: application/json' \
    'https://nixbazar.com/api/v3/public/dashboard' || true)
  echo "public URL -> HTTP $code2"
fi
head -c 180 /tmp/ba-dash.json 2>/dev/null || true
echo

echo "==> 3) CORS_ORIGINS check in API .env"
if [ -f "$API_DIR/.env" ]; then
  grep -E '^CORS_ORIGINS=|^PORT=|^NODE_ENV=' "$API_DIR/.env" || true
  if ! grep -q 'nixbazar.com' "$API_DIR/.env"; then
    echo "WARN: add to $API_DIR/.env :"
    echo 'CORS_ORIGINS=https://nixbazar.com,https://www.nixbazar.com'
  fi
else
  echo "WARN: missing $API_DIR/.env"
fi

echo "==> 4) Restart Passenger app (if available)"
if command -v cloudlinux-selector >/dev/null 2>&1; then
  cloudlinux-selector restart --json --interpreter node --app-root "$API_DIR" || true
elif [ -f "$API_DIR/tmp/restart.txt" ] || mkdir -p "$API_DIR/tmp"; then
  touch "$API_DIR/tmp/restart.txt"
  echo "Touched $API_DIR/tmp/restart.txt"
fi

echo "Done. Hard-refresh browser (Ctrl+Shift+R) and open:"
echo "  https://nixbazar.com/dashboard"
echo "DevTools → Network → filter 'public/dashboard' → Status should be 200"
