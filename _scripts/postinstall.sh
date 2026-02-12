#!/usr/bin/env bash
set -euo pipefail

DB_PATH="/opt/brainwave/prod.db"
DATABASE_URL="file:${DB_PATH}"

# Only deploy migrations if the DB exists
echo "Running Prisma migrations..."
sudo -u brainwave touch "$DB_PATH"
sudo -u brainwave -H bash -c '
  export DATABASE_URL="file:/opt/brainwave/prod.db"
  cd /opt/brainwave
  npx prisma migrate deploy --config prisma/prisma.config.mjs
'