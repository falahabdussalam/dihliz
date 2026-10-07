FROM node:24-alpine AS base

WORKDIR /app
RUN apk add --no-cache openssl
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS dependencies

COPY package.json package-lock.json ./
# npm ci runs the project's Prisma generate postinstall hook.
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci

FROM base AS builder

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/generated ./generated
COPY . .
# Prisma is imported during Next.js compilation. No live database is needed.
ENV DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build
RUN npm run build

FROM dependencies AS production-dependencies

# Prisma stays installed so the entrypoint can deploy migrations offline.
RUN npm prune --omit=dev --ignore-scripts

FROM base AS runner

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

COPY --from=production-dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
COPY --chown=node:node prisma/schema.prisma ./prisma/schema.prisma
COPY --chown=node:node prisma/migrations-postgresql ./prisma/migrations-postgresql
COPY --chown=node:node prisma.config.ts ./
COPY --chmod=755 entrypoint.sh /usr/local/bin/entrypoint.sh

USER node
EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["node", "server.js"]
