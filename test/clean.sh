#!/bin/bash

if [ "$(docker ps -a | grep webdav-js-app)" ]; then
	docker stop webdav-js-app
	docker rm webdav-js-app
fi

if [ -z "$(docker images -q webdav-js 2> /dev/null)" ]; then
	docker rmi webdav-js
fi
