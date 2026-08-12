#!/usr/bin/env bash
# Cron-safe auto deploy: skip if GitHub has no new commits; log everything; prevent overlap.
#
# Install once:
#   bash /home/nixbazar/Battleasia/deploy/install-webuzo-cron.sh
#
# Manual test:
#   bash /home/nixbazar/Battleasia/deploy/webuzo-cron-deploy.sh
#
set -euo pipefail

REPO_DIR="${REPO_DIR:-/home/nixbazar/Battleasia}"
LIVE_MAIN="${LIVE_MAIN:-/home/nixbazar/battleasia.gg}"
LIVE_API="${LIVE_API:-/home/nixbazar/api}"
MAIN_DOMAIN="${MAIN_DOMAIN:-https://battleasia.gg}"
BRANCH="${BRANCH:-main}"
LOG_DIR="${LOG_DIR:-/home/nixbazar/logs}"
LOG_FILE="${LOG_FILE:-$LOG_DIR/battleasia-deploy.log}"
LOCK_FILE="${LOCK_FILE:-/tmp/battleasia-deploy.lock}"

mkdir -p "$LOG_DIR"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  log "SKIP: deploy already running (lock $LOCK_FILE)"
  exit 0
fi

if [[ ! -d "$REPO_DIR/.git" ]]; then
  log "ERROR: git repo missing at $REPO_DIR"
  exit 1
fi

cd "$REPO_DIR"
git fetch origin "$BRANCH" >>"$LOG_FILE" 2>&1

LOCAL_SHA="$(git rev-parse HEAD)"
REMOTE_SHA="$(git rev-parse "origin/$BRANCH")"

if [[ "$LOCAL_SHA" == "$REMOTE_SHA" ]]; then
  log "OK: no new commits on origin/$BRANCH ($LOCAL_SHA)"
  exit 0
fi

log "START deploy $LOCAL_SHA -> $REMOTE_SHA"

export REPO_DIR LIVE_MAIN LIVE_API MAIN_DOMAIN
DEPLOY_SCRIPT="${DEPLOY_SCRIPT:-webuzo-git-deploy.sh}"
if bash "$REPO_DIR/deploy/$DEPLOY_SCRIPT" >>"$LOG_FILE" 2>&1; then
  log "DONE: deploy success — $MAIN_DOMAIN"
  exit 0
fi

log "FAIL: deploy script exited with error — see $LOG_FILE"
exit 1
