#!/usr/bin/env bash
# One-time: register auto-deploy cron on Webuzo (every 5 minutes).
set -euo pipefail

REPO_DIR="${REPO_DIR:-/home/nixbazar/Battleasia}"
CRON_SCRIPT="$REPO_DIR/deploy/webuzo-cron-deploy.sh"
CRON_LINE="*/5 * * * * /bin/bash $CRON_SCRIPT"

chmod +x "$REPO_DIR/deploy/webuzo-git-deploy.sh" \
  "$REPO_DIR/deploy/webuzo-passenger-deploy.sh" \
  "$CRON_SCRIPT" \
  "$REPO_DIR/deploy/seed-all.sh" \
  "$REPO_DIR/deploy/webuzo-seed-demo.sh"

mkdir -p /home/nixbazar/logs

if crontab -l 2>/dev/null | grep -Fq "$CRON_SCRIPT"; then
  echo "Cron already installed:"
  crontab -l | grep "$CRON_SCRIPT"
  exit 0
fi

( crontab -l 2>/dev/null; echo "$CRON_LINE" ) | crontab -

echo "Installed cron (every 5 minutes):"
echo "  $CRON_LINE"
echo ""
echo "Logs: /home/nixbazar/logs/battleasia-deploy.log"
echo "Test now: bash $CRON_SCRIPT"
