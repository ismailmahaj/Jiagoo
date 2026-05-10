# syntax=docker/dockerfile:1
# Image de production — Next.js + Prisma (Fondation Hassen Jiagoo)
#
# Railway (prêt) :
#   - Service : Root Directory = dossier contenant ce Dockerfile (souvent « web »).
#   - Variables : DATABASE_URL, AUTH_SECRET, NEXT_PUBLIC_APP_URL, AUTH_URL (recommandé),
#     clés Stripe, etc. (voir .env.example). Railway définit PORT (ex. 8080) : l’app doit l’utiliser telle quelle.
#   - Schéma BDD : une commande Release / one-shot « npx prisma db push » (ou migrate deploy),
#     car l’image finale ne contient pas la CLI Prisma.
#   - Healthcheck : railway.json pointe sur /api/health (sans Postgres).
#   - PDF uploads/ : disque conteneur éphémère — ajouter un volume Railway sur /app/uploads si besoin.
#
# Local : docker build -t fhj-web .
#         docker run --rm -p 3000:3000 -e DATABASE_URL=... -e AUTH_SECRET=... -e NEXT_PUBLIC_APP_URL=... fhj-web

FROM node:20-bookworm-slim AS base
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
# postinstall = prisma generate : le schéma n’est pas encore copié ici → ignorer les scripts.
RUN npm ci --ignore-scripts

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Prisma lit DATABASE_URL au generate ; valeur factice suffisante pour le build.
ARG DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build?schema=public
ENV DATABASE_URL=${DATABASE_URL}
RUN npx prisma generate && npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Dossier uploads (PDF livres) — monter un volume en prod si besoin de persistance
RUN mkdir -p uploads/books && chown -R nextjs:nodejs uploads

USER nextjs
# Métadonnée seulement. Le port réel = variable PORT au runtime (Railway injecte souvent 8080) — c’est voulu.
EXPOSE 3000
ENV HOSTNAME=0.0.0.0
# Ne pas forcer --port ici : Next écoute sur parseInt(process.env.PORT, 10) || 3000 (voir .next/standalone/server.js).
CMD ["node", "server.js"]
