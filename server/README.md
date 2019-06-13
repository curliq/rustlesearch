# RustleSearch

TODO: all of this

## Testing
You need to have elasticsearch running and have it a little seeded for the tests to work

## Production

Make sure to:
- set the hostname properly in .env, nginx.conf, nginx-tls.conf
- fill in the elastic location in .env
- allow 80 and 443 on your firewall
- set port inside nginx to same as in .env

then, just run ./init-letsencrypt.sh and it should be fine.  
try it out in staging mode first to not hit letsencrypt rate limits
