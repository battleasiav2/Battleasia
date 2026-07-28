#!/bin/bash
cd "$(dirname "$0")"
pkill -f "node dist/index.js" 2>/dev/null || true
sleep 1
nohup node dist/index.js > api.log 2>&1 &
echo "API restarted. Log: tail -f api.log"
