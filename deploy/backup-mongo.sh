#!/usr/bin/env bash
# MongoDB backup — works with Atlas URI or local mongo
# Usage: MONGODB_URI="mongodb+srv://..." ./deploy/backup-mongo.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="${ROOT}/backups"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
TARGET="${OUT_DIR}/battleasia-${TIMESTAMP}"
URI="${MONGODB_URI:-mongodb://127.0.0.1:27017/battleasia}"

mkdir -p "$OUT_DIR"

echo "Backing up to ${TARGET} ..."
docker run --rm \
  -v "${OUT_DIR}:/backup" \
  mongo:7 \
  mongodump --uri="$URI" --out="/backup/battleasia-${TIMESTAMP}"

echo "Backup complete: ${TARGET}"

# Keep last 7 backups
ls -dt "${OUT_DIR}"/battleasia-* 2>/dev/null | tail -n +8 | xargs -r rm -rf

echo "Old backups trimmed (keeping latest 7)."
