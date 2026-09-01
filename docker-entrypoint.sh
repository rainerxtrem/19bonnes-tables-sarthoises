#!/bin/sh
set -e

echo "→ Application des migrations Prisma..."
npx prisma migrate deploy

exec "$@"
