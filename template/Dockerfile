FROM node:18 AS builder

WORKDIR /build

COPY . .
RUN npm ci && npm run build

FROM node:18-slim

COPY --chown=node:node --from=builder /build/lib/ /runtime/lib/
COPY --chown=node:node --from=builder /build/package.json /runtime
COPY --chown=node:node --from=builder /build/package-lock.json /runtime

USER node
WORKDIR /runtime
ENV NODE_ENV=production

RUN npm ci --omit=dev

CMD [ "npm", "run", "--silent", "serve" ]
