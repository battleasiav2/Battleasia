#!/bin/bash
# Fix broken injected CSS on nixbazar.com home (causes broken layout / "data not show")
# Run on server: bash FIX-HOME-CSS.sh
set -e
cd /home/nixbazar/public_html || cd "$(dirname "$0")"

python3 - << 'PY'
from pathlib import Path
import re

p = Path('index.html')
html = p.read_text(encoding='utf-8', errors='ignore')

# Remove ALL injected <style>...</style> blocks in <head> (keep vite CSS <link>)
html2 = re.sub(r'(?s)\s*<style>.*?</style>', '', html)

fix = '''
        <style>
html, body {
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  max-width: 100% !important;
  min-height: 100% !important;
  background: #000000 !important;
  overflow-x: hidden !important;
}
#root, #root__layout {
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  min-height: 100vh !important;
}
</style>
'''

if '</head>' not in html2:
    raise SystemExit('ERROR: no </head> in index.html')

html2 = html2.replace('</head>', fix + '\n  </head>', 1)

# Point prefetch at same-origin API (optional cleanup)
html2 = html2.replace('https://api.battleasia.com', 'https://nixbazar.com')

p.write_text(html2, encoding='utf-8')
check = p.read_text(encoding='utf-8', errors='ignore')
ok = (
    'background: #000000' in check
    and '#aa14' not in check
    and 'rgba(,,,.' not in check
    and 'margin:!important' not in check
)
print('OK - home CSS cleaned' if ok else 'CHECK - verify index.html manually')
print('Test API: curl -s https://nixbazar.com/api/v3/public/dashboard | head -c 120')
PY
