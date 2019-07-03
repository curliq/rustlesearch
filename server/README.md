# RustleSearch

## testing
Start a dev container: `docker-compose up -f docker-compose.yml docker-compose.test.yml`

## indexing
Make sure to run `yarn run:esinit` before indexing

## production

Make sure to:
- set the variables properly in .env for any overrides
- allow 80 and 443 on your firewall for letsencrypt

