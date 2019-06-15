FROM node:12-alpine AS builder
WORKDIR /build
COPY . .
RUN yarn install --frozen-lockfile
RUN yarn build:api

FROM node:12-alpine
WORKDIR /app
COPY --from=builder /build/api-dist ./api-dist
COPY package.json yarn.lock channels.txt ./
RUN yarn install --frozen-lockfile --production && \
        chown -R node:node /app

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
        CMD node api-dist/healthcheck.js

USER node
EXPOSE $APP_PORT
CMD yarn start:api:production
