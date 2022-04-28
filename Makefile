SHELL = /bin/bash

.PHONY: build
build: docker-compose.override.yml
	docker-compose run --rm web npm run build

.PHONY: test
test: docker-compose.override.yml
	docker-compose run --rm test npm run test

docker-compose.override.yml:
	@echo "version: '3'" > docker-compose.override.yml
	@echo >> docker-compose.override.yml
	@echo "services:" >> docker-compose.override.yml
	@echo "  web:" >> docker-compose.override.yml
	@echo "    user: `id -u`:`id -g`" >> docker-compose.override.yml

dist/js/app.js:
dist/js/app.js: build