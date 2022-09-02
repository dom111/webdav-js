SHELL = /bin/bash

.PHONY: build
build: node_modules
	npm run build

.PHONY: watch
watch: node_modules
	npm run watch

.PHONY: test
test: node_modules
	docker-compose run --rm -e BASE_URL=http://webdav test npm run test

node_modules:
	npm install
