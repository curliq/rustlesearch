FROM node:12-alpine
WORKDIR /app
COPY package.json yarn.lock channels.txt ./
COPY src ./src
RUN yarn install --frozen-lockfile --production && \
        chown -R node:node /app

USER node
CMD node src/start.js
