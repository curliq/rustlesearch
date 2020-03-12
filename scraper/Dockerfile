FROM node:12-alpine

ENV PUID 1000
ENV PGID 100

RUN apk add --no-cache git shadow curl xz

RUN mkdir -p /workspace/data /workspace/app && chown -R $PUID:$PGID /workspace

COPY . /workspace/app
WORKDIR /workspace/app

USER $PUID:$PGID

CMD npm install && npm run start
