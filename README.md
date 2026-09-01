# 19 Bonnes Tables Sarthoises

Application Next.js (App Router) + PostgreSQL + Prisma reproduisant et remplaçant le site
[19bonnes-tables-sarthoises.fr](https://19bonnes-tables-sarthoises.fr/), hébergé auparavant sur B12.
Aucune dépendance à B12 : le site fonctionne intégralement sur votre propre infrastructure
(base de données, médias, authentification).

## Sommaire

- [Stack technique](#stack-technique)
- [Installation](#installation)
- [Variables d'environnement](#variables-denvironnement)
- [PostgreSQL](#postgresql)
- [Prisma](#prisma)
- [Migration](#migration)
- [Seed](#seed)
- [Création du premier administrateur](#création-du-premier-administrateur)
- [Développement](#développement)
- [Build](#build)
- [Production (sans Docker)](#production-sans-docker)
- [Docker](#docker)
- [Déploiement VPS](#déploiement-vps)
- [Domaine](#domaine)
- [HTTPS](#https)
- [Sauvegardes](#sauvegardes)
- [Mise à jour](#mise-à-jour)
- [Restauration](#restauration)
- [Tests](#tests)
- [Architecture](#architecture)
- [Migration des données depuis B12](#migration-des-données-depuis-b12)

## Stack technique

- Next.js 15 (App Router) + TypeScript strict + Tailwind CSS
- PostgreSQL + Prisma ORM
- Auth.js (NextAuth v5) — authentification par identifiants, sessions JWT
- Zod pour toute validation serveur
- Tiptap pour l'édition de contenu riche (pages, actualités, restaurants)
- Stockage médias abstrait (driver `local` par défaut, `s3` en option)
- Vitest pour les tests

## Installation

Prérequis : Node.js ≥ 20, npm, un serveur PostgreSQL (local, Docker, ou managé).

```bash
npm install
cp .env.example .env
# éditer .env avec vos propres valeurs (voir section suivante)
```

## Variables d'environnement

Toutes les variables sont documentées dans [`.env.example`](.env.example). Points importants :

- `DATABASE_URL` : chaîne de connexion PostgreSQL.
- `AUTH_SECRET` : secret de session, à générer avec `npx auth secret` ou `openssl rand -base64 32`.
  **Ne jamais commiter de valeur réelle.**
- `STORAGE_DRIVER` : `local` (fichiers sur disque, servis via `/media/[...key]`) ou `s3`
  (bucket compatible S3 — OVH Object Storage, Scaleway, MinIO, Cloudflare R2, AWS S3...).
- `SMTP_*` : optionnel, active l'envoi d'email de notification à chaque message de contact.
- `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` : compte SUPER_ADMIN créé par le seed.

Aucun secret réel ne doit être versionné : `.env` est dans `.gitignore`.

## PostgreSQL

En local sans Docker, un simple `postgres` (via l'installeur officiel, Homebrew, ou
`docker run -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16-alpine`) suffit. Créez une base :

```sql
CREATE DATABASE bonnes_tables;
```

Puis renseignez `DATABASE_URL` dans `.env` en conséquence.

## Prisma

Le schéma complet est dans [`prisma/schema.prisma`](prisma/schema.prisma) : Restaurant, Page,
Article/Category, BoardMember, Partner, Media, GalleryAlbum/GalleryItem, NavigationItem,
ContactMessage, SiteSetting, Redirect, User, AuditLog.

```bash
npm run prisma:generate   # régénère le client Prisma après une modif du schéma
npm run prisma:studio     # interface graphique pour explorer/éditer les données
```

## Migration

```bash
npm run prisma:migrate    # dev : crée et applique une migration à partir du schéma
npm run prisma:deploy     # prod : applique les migrations existantes sans en créer
```

En Docker, `prisma migrate deploy` est exécuté automatiquement au démarrage du conteneur
(voir `docker-entrypoint.sh`).

## Seed

Le fichier [`prisma/seed.ts`](prisma/seed.ts) importe les données réelles extraites de l'audit
du site B12 existant (les 10 restaurants, le bureau, les partenaires, la page d'accueil, les
bons cadeaux, la navigation). Il est **idempotent** (`upsert`) : peut être relancé sans dupliquer.

```bash
npm run db:seed
```

Ce que le seed **ne fait pas** (volontairement, pour ne rien inventer) :

- Il ne migre **aucune photo** : les médias de l'ancien site vivent sur `cdn.b12.io` et
  appartiennent à B12. Récupérez-les manuellement (elles restent accessibles tant que B12
  n'est pas coupé) et uploadez-les depuis `/admin` sur chaque restaurant/album concerné.
- Il laisse en **brouillon** les pages légales (mentions légales, politique de confidentialité)
  qui n'existaient pas du tout sur l'ancien site — à rédiger avant la mise en ligne.
- Plusieurs champs restent vides quand l'information était introuvable sur l'ancien site
  (ex. coordonnées de l'Hôtel Restaurant La Renaissance) — recherchez-les avant publication.
  Chaque cas est signalé par un commentaire `TODO audit` dans `prisma/seed.ts`.

## Création du premier administrateur

Le premier compte SUPER_ADMIN est créé par le seed, avec l'email/mot de passe définis dans
`.env` (`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`). **Changez ce mot de passe immédiatement**
après la première connexion sur `/admin/login`, depuis `/admin/administrateurs`.

Pour créer un administrateur supplémentaire sans passer par le seed, connectez-vous en
SUPER_ADMIN et utilisez `/admin/administrateurs`.

## Développement

```bash
npm run prisma:migrate
npm run db:seed
npm run dev
```

- Site public : http://localhost:3000
- Administration : http://localhost:3000/admin/login

## Build

```bash
npm run build
npm start
```

Le build nécessite un `DATABASE_URL` valide dans l'environnement (pas de requête réelle
n'est faite pendant le build : toutes les pages consommant la base sont en rendu dynamique,
`DATABASE_URL` sert seulement à `prisma generate`).

## Production (sans Docker)

1. `npm run build`
2. `npm run prisma:deploy`
3. `npm start` (idéalement derrière un process manager — voir `pm2`, ou un service systemd)
4. Placez un reverse proxy (Nginx, Caddy) devant le port 3000 pour le HTTPS et le domaine.

## Docker

```bash
cp .env.example .env   # puis éditez, notamment POSTGRES_PASSWORD et AUTH_SECRET
docker compose up -d --build
docker compose exec app npm run db:seed   # une seule fois, après le premier démarrage
```

Le `docker-compose.yml` fournit deux services : `db` (PostgreSQL 16) et `app` (l'application,
build via le `Dockerfile` multi-stage). Les migrations Prisma s'appliquent automatiquement à
chaque démarrage du conteneur `app`. Les médias uploadés en driver `local` sont persistés dans
le volume `media_uploads`.

## Déploiement VPS

1. Installez Docker + Docker Compose sur le VPS (ou Node.js 20 + PostgreSQL si vous n'utilisez
   pas Docker).
2. Copiez le projet sur le VPS (`git clone` ou `rsync`), créez et remplissez `.env`.
3. `docker compose up -d --build`, puis `docker compose exec app npm run db:seed` au premier
   démarrage.
4. Configurez un reverse proxy (Nginx ou Caddy) pointant vers `127.0.0.1:3000`, avec HTTPS
   (voir ci-dessous).
5. Uploadez les médias récupérés de l'ancien site depuis `/admin`.
6. Vérifiez `/admin/redirections` et `next.config.ts` (`redirects()`) : les anciennes URLs B12
   connues sont déjà redirigées en 301.

## Domaine

Pointez les enregistrements DNS de `19bonnes-tables-sarthoises.fr` et
`www.19bonnes-tables-sarthoises.fr` vers l'IP du VPS (enregistrements `A`/`AAAA`, ou `CNAME`
pour le sous-domaine `www` si votre hébergeur DNS le permet). `NEXT_PUBLIC_SITE_URL` et
`NEXTAUTH_URL` doivent correspondre au domaine final (`https://19bonnes-tables-sarthoises.fr`).
Choisissez une version canonique (avec ou sans `www`) et redirigez l'autre — un reverse proxy
Nginx/Caddy fait cela en une règle.

## HTTPS

Avec Caddy (recommandé pour sa simplicité, HTTPS automatique via Let's Encrypt) :

```
19bonnes-tables-sarthoises.fr, www.19bonnes-tables-sarthoises.fr {
    redir https://19bonnes-tables-sarthoises.fr{uri} 301  # si www -> non-www choisi comme canonique, adapter
    reverse_proxy 127.0.0.1:3000
}
```

Avec Nginx + Certbot : configuration reverse proxy classique vers `127.0.0.1:3000`, puis
`certbot --nginx -d 19bonnes-tables-sarthoises.fr -d www.19bonnes-tables-sarthoises.fr`.

## Sauvegardes

**PostgreSQL** (via Docker Compose) :

```bash
docker compose exec db pg_dump -U $POSTGRES_USER $POSTGRES_DB > backup-$(date +%Y%m%d).sql
```

Automatisez avec un cron quotidien appelant ce script et conservez les archives hors du VPS
(stockage objet, autre serveur).

**Médias** (driver `local`) : le volume Docker `media_uploads` (ou le dossier
`storage/uploads` hors Docker) doit être sauvegardé avec la même fréquence, par exemple :

```bash
docker run --rm -v 19bonnes-tables-sarthoisesfr_media_uploads:/data -v $(pwd):/backup \
  alpine tar czf /backup/media-$(date +%Y%m%d).tar.gz -C /data .
```

Si vous utilisez le driver `s3`, la sauvegarde des médias est déléguée à votre fournisseur de
stockage objet (activez la réplication/versioning côté bucket).

## Mise à jour

```bash
git pull
docker compose up -d --build   # rebuild l'image, réapplique les migrations au démarrage
```

Sans Docker : `git pull && npm install && npm run build && npm run prisma:deploy && pm2 restart app`
(ou l'équivalent de votre process manager).

## Restauration

**Base de données** :

```bash
cat backup-YYYYMMDD.sql | docker compose exec -T db psql -U $POSTGRES_USER $POSTGRES_DB
```

**Médias** :

```bash
docker run --rm -v 19bonnes-tables-sarthoisesfr_media_uploads:/data -v $(pwd):/backup \
  alpine sh -c "cd /data && tar xzf /backup/media-YYYYMMDD.tar.gz"
```

## Tests

```bash
npm run test        # une passe
npm run test:watch  # mode watch
```

Couverture actuelle : validation des formulaires (contact, restaurant), génération et
unicité des slugs, permissions par rôle (ADMIN / SUPER_ADMIN), publication/dépublication
d'un restaurant. À étendre au fil du développement (voir `tests/`).

## Architecture

```
prisma/               schéma, migrations, seed
src/
  app/
    (public)/          pages publiques (accueil, [slug], contact, galerie, actualités...)
    admin/
      login/            page de connexion (hors garde d'authentification)
      (dashboard)/       tout le back-office, protégé par le layout + middleware
    api/
      admin/             routes API du CMS (protégées, Zod + permissions)
      auth/               route NextAuth
    media/[...key]/      sert les fichiers du driver de stockage "local"
    sitemap.ts, robots.ts
  components/
    admin/                composants du back-office (formulaires, media picker, éditeur riche...)
    public/                composants du site public (header, footer, formulaire de contact...)
    ui/                     primitives partagées (bouton, champ, badge)
  lib/
    auth/                  config NextAuth (edge-safe + complète), permissions par rôle
    db/                     client Prisma singleton
    services/               logique métier (un fichier par entité), seule couche qui touche Prisma
    storage/                abstraction stockage médias (local / s3)
    validation/             schémas Zod par entité
tests/                    tests Vitest (validation, permissions, slugs, services)
```

Principe : les composants ne contiennent jamais de logique métier ni de requête Prisma
directe côté serveur en dehors de `lib/services`. Les routes `app/api/admin/**` valident avec
Zod, vérifient les permissions (`lib/auth/permissions.ts`) puis délèguent aux services.

## Migration des données depuis B12

L'audit complet du site B12 existant (pages, contenus, URLs, incohérences relevées) a servi de
base à `prisma/seed.ts`. Points d'attention avant de couper B12 :

1. **Médias** : téléchargez toutes les photos utiles depuis `cdn.b12.io/client_media/NL65DUor/...`
   (visible dans le HTML de l'ancien site) et re-uploadez-les via `/admin` — aucune image de ce
   nouveau site ne doit jamais pointer vers `cdn.b12.io`.
2. **SEO** : les URLs de restaurants (`/le-cheval-blanc`, etc.), `/le-bureau`, `/partenaires`,
   `/galerie` et `/bon-cadeaux` sont conservées à l'identique — aucune redirection nécessaire
   pour elles. Les autres URLs connues de l'ancien site (galeries `/galerie-*`, doublons, pages
   B12 résiduelles) sont redirigées en 301 depuis `next.config.ts`. Ajoutez toute redirection
   supplémentaire découverte a posteriori depuis `/admin/redirections`.
3. **Contenus manquants** : voir les commentaires `TODO audit` dans `prisma/seed.ts` et la
   section "Zones d'incertitude" de l'audit — plusieurs informations (téléphone/adresse de
   l'association, coordonnées de l'Hôtel La Renaissance, horaires de plusieurs restaurants)
   n'existaient pas ou semblaient erronées sur l'ancien site et doivent être confirmées auprès
   des restaurateurs avant publication.
4. Une fois le contenu vérifié et les médias migrés, pointez le DNS du domaine vers le VPS et
   coupez B12.
