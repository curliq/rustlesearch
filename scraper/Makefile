load:
	docker-compose -f docker-compose.test.yml up -d --remove-orphans

unload:
	docker-compose -f docker-compose.test.yml stop
test:
	docker-compose -f docker-compose.test.yml up -d --remove-orphans
	npx wait-port http://:9200
	yarn test -v --serial

stop-test:
	docker-compose -f docker-compose.test.yml stop
