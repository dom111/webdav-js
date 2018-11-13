#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

if [ "$(docker ps -a | grep webdav-js-app)" ]; then
	docker stop webdav-js-app
	docker rm webdav-js-app
fi
# npm run build

docker run -dit \
--name webdav-js-app \
-p 8080:80 \
-v $DIR/../examples/apache-directory-list/webdav.conf:/etc/apache2/sites-enabled/webdav.conf:ro \
-v $DIR/../:/var/www/webdav-js:ro \
webdav-js sleep infinity

docker exec -it webdav-js-app /bin/bash -c "\
chown www-data -R /var/www/html 2> /dev/null; \
rm /etc/apache2/sites-enabled/000-default.conf; \
apachectl start || apachectl restart \
"

echo 'This can be tested on http://localhost:8080'
