========================================
  nixbazar.com — WEBUZO UPLOAD PACKAGE
  BattleAsia Full Stack (Ready)
========================================

SERVER PATHS:
  Website → /home/nixbazar/public_html/
  API     → /home/nixbazar/battleasia-api/

========================================
  ZIP 1: nixbazar-public_html.zip
========================================
Upload to: /home/nixbazar/public_html/
Action: Extract (overwrite old files)

Contains:
  index.html, assets/, store/, admin/, .htaccess
  MongoDB/API proxy already configured in .htaccess

Test: https://nixbazar.com/

========================================
  ZIP 2: nixbazar-api.zip
========================================
Upload to: /home/nixbazar/battleasia-api/
Action: Extract

Contains:
  dist/, package.json, .env (MongoDB Atlas READY)
  install-api.sh — one command start

========================================
  AFTER UPLOAD — ONLY 1 COMMAND (SSH/Terminal)
========================================

  cd /home/nixbazar/battleasia-api
  bash install-api.sh

Done! Test these URLs:
  https://nixbazar.com/
  https://nixbazar.com/store/auth/sign-in
  https://nixbazar.com/admin/
  https://nixbazar.com/api/health

Admin login:
  Email: admin@nixbazar.com
  Password: Admin@123456

Player test:
  nixhyip@gmail.com / Nix@7777  (if seeded)
  or Sign Up on site

========================================
  MongoDB Atlas (already configured in .env)
========================================
Cluster: cluster0.gm1xhbe.mongodb.net
Database: battleasia

IMPORTANT: MongoDB Atlas → Network Access
  Add IP: 161.248.189.80
  (or 0.0.0.0/0 for testing)

If /api/health fails with 502/500:
  Webuzo support: enable mod_proxy for Apache

========================================
