#!/usr/bin/env bash
# Initialize Let's Encrypt certificates for BattleAsia production.
# Usage: ./deploy/init-ssl.sh
# Requires: docker compose, domains pointing to this server, .env.production loaded

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ -f .env.production ]; then
  set -a
  # shellcheck disable=SC1091
  source .env.production
  set +a
fi

EMAIL="${SSL_EMAIL:?Set SSL_EMAIL in .env.production}"
DOMAINS="${SSL_DOMAINS:-battleasia.net,www.battleasia.net,shop.battleasia.net,admin.battleasia.net}"
PRIMARY_DOMAIN="${DOMAINS%%,*}"

echo "Starting nginx for ACME challenge..."
docker compose -f docker-compose.prod.yml up -d nginx

DOMAIN_ARGS=""
IFS=',' read -ra DOMAIN_LIST <<< "$DOMAINS"
for d in "${DOMAIN_LIST[@]}"; do
  DOMAIN_ARGS="$DOMAIN_ARGS -d ${d// /}"
done

echo "Requesting certificate for: $DOMAINS"
docker compose -f docker-compose.prod.yml run --rm certbot \
  certbot certonly --webroot \
  -w /var/www/certbot \
  --email "$EMAIL" \
  --agree-tos --no-eff-email \
  $DOMAIN_ARGS \
  --cert-name "$PRIMARY_DOMAIN"

echo "Switching nginx to HTTPS config..."
export NGINX_CONFIG=nginx.prod.conf
docker compose -f docker-compose.prod.yml --env-file .env.production up -d nginx

echo "Done. Certificate stored at /etc/letsencrypt/live/$PRIMARY_DOMAIN/"
echo "Enable auto-renew: docker compose -f docker-compose.prod.yml --profile ssl up -d certbot"
