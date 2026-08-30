# yAI × moltH unified runtime image
FROM node:20-alpine AS builder

WORKDIR /app
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json* bun.lock* ./
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run build
RUN npm prune --omit=dev

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache curl dumb-init

ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=512 --max-semi-space-size=64 --no-warnings" \
    UV_THREADPOOL_SIZE=4 \
    MOLTH_INTERNAL_PORT=3000

RUN mkdir -p /app/.data && chown -R node:node /app
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/.data ./.data

USER node
EXPOSE 8080

HEALTHCHECK --interval=20s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f "http://127.0.0.1:${PORT:-8080}/health" || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/server-yai.cjs"]
