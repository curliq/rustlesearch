FROM node:12-alpine
WORKDIR /app
COPY package.json yarn.lock channels.txt ./
COPY api ./api
RUN yarn install --frozen-lockfile --production && \
        chown -R node:node /app

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
        CMD node api/healthcheck.js

USER node
CMD node api/start.js
