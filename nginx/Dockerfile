FROM nginx:1.17-alpine
RUN apk add --update --no-cache curl

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl --fail --insecure https://localhost:443/healthcheck

EXPOSE 443
