#!/usr/bin/env bash
# Webuzo wrapper — same as deploy/seed-all.sh
set -euo pipefail
REPO_DIR="${REPO_DIR:-/home/nixbazar/Battleasia}"
LIVE_API="${LIVE_API:-/home/nixbazar/api}"
export REPO_DIR LIVE_API
bash "$REPO_DIR/deploy/seed-all.sh"
