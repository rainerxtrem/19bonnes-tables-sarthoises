# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
# su-exec : permet de démarrer le conteneur en root (nécessaire pour
# corriger les permissions du volume monté à l'exécution) puis de basculer
# vers l'utilisateur non-root avant de lancer l'application — voir
# docker-entrypoint.sh.
RUN apk add --no-cache libc6-compat openssl su-exec
WORKDIR /app

# ---------------------------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json* ./
# Le schéma doit être présent avant `npm ci` : le postinstall (`prisma
# generate`) en a besoin, sinon npm ci échoue (schema.prisma introuvable).
COPY prisma ./prisma
RUN npm ci

# ---------------------------------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Valeur bidon uniquement nécessaire pour que `next build` puisse s'exécuter
# (aucune requête DB n'est faite au build ; la vraie valeur vient du .env en prod).
ENV DATABASE_URL="postgresql://user:password@localhost:5432/db"
RUN npx prisma generate
RUN npm run build

# ---------------------------------------------------------------------------
# node_modules de production (plus léger que le node_modules complet du
# builder, mais garde `prisma` et `tsx` — utiles pour exécuter les
# migrations et le seed directement depuis le conteneur en production).
FROM base AS prod-deps
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci --omit=dev

# ---------------------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN mkdir -p /app/storage/uploads && chown -R nextjs:nodejs /app/storage /app/.next
RUN chmod +x ./docker-entrypoint.sh

# Pas de USER ici : un volume monté par la plateforme à l'exécution (ex.
# Railway) écrase la propriété fixée ci-dessus par `chown`, généralement en
# root. L'entrypoint démarre donc en root pour ré-appliquer le chown sur le
# volume réel, puis bascule vers `nextjs` via su-exec avant de lancer
# l'application (jamais de code applicatif exécuté en root).
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "start"]
