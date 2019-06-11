FROM node:12-alpine AS builder
WORKDIR /build
COPY . .
RUN yarn install --frozen-lockfile
RUN yarn build

FROM node:12-alpine
WORKDIR /app
COPY --from=builder /build/dist ./dist
COPY package.json yarn.lock .
RUN yarn install --frozen-lockfile --production && \
        chown -R node:node /app

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
        CMD node dist/lib/healthcheck.js

USER node
EXPOSE $APP_PORT
CMD yarn start:app:production
