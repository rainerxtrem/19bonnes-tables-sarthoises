#!/bin/sh
set -e

# Le volume de stockage média peut être monté par la plateforme après le
# build de l'image, avec une propriété différente (souvent root) de celle
# fixée dans le Dockerfile — on la réapplique à chaque démarrage pour que
# l'utilisateur applicatif (non-root) puisse y écrire.
if [ -d /app/storage ]; then
  chown -R nextjs:nodejs /app/storage || true
fi

echo "→ Application des migrations Prisma..."
npx prisma migrate deploy

echo "→ Démarrage de l'application (utilisateur non-root : nextjs)..."
exec su-exec nextjs "$@"
