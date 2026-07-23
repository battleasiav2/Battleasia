# VPS / Docker deploy (recommended)

Use the files at the repository root:

  docker-compose.prod.yml
  .env.production.example  → copy to .env.production
  deploy/README.md
  deploy/init-ssl.sh

Quick start on Ubuntu VPS:

  git clone https://github.com/sumon626000/battleasiafibal.git
  cd battleasiafibal
  cp .env.production.example .env.production
  # edit .env.production
  docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

Domains (default):
  battleasia.net       → Player frontend
  shop.battleasia.net  → Coin shop
  admin.battleasia.net → Admin panel
  /api/                → API (proxied by nginx)

See deploy/README.md for SSL, MongoDB Atlas, backups, and monitoring.
