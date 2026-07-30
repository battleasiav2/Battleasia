#!/usr/bin/env bash
# Webuzo / single-server deploy — git pull, build, sync to public_html + api.
#
# First time:
#   git clone https://github.com/battleasiav2/Battleasia.git /home/nixbazar/Battleasia
#   cp .env.production.example /home/nixbazar/api/.env   # edit MONGODB_URI, JWT, etc.
#   chmod +x /home/nixbazar/Battleasia/deploy/webuzo-git-deploy.sh
#   /home/nixbazar/Battleasia/deploy/webuzo-git-deploy.sh
#
set -euo pipefail

REPO_DIR="${REPO_DIR:-/home/nixbazar/Battleasia}"
LIVE_MAIN="${LIVE_MAIN:-/home/nixbazar/battleasia.gg/public_html}"
LIVE_API="${LIVE_API:-/home/nixbazar/api}"
MAIN_DOMAIN="${MAIN_DOMAIN:-https://battleasia.gg}"

export REPO_DIR LIVE_MAIN LIVE_API MAIN_DOMAIN

if [[ ! -d "$REPO_DIR/.git" ]]; then
  echo "ERROR: Repo not found at $REPO_DIR — run: git clone https://github.com/battleasiav2/Battleasia.git $REPO_DIR"
  exit 1
fi

if [[ ! -f "$LIVE_API/.env" ]]; then
  echo "ERROR: Missing $LIVE_API/.env (MONGODB_URI + JWT_SECRET required for production)."
  exit 1
fi

bash "$REPO_DIR/deploy/deploy.sh"
