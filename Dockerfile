FROM node:12-alpine AS builder
WORKDIR /build
COPY . .
RUN yarn install --frozen-lockfile
RUN yarn build

FROM node:12-alpine
WORKDIR /app
COPY --from=builder /build/dist ./dist
COPY package.json .
RUN yarn install --frozen-lockfile --production && \
        chown -R node:node /app

USER node
EXPOSE $APP_PORT
CMD yarn start:app:production
