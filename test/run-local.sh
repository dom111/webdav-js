#!/bin/bash

dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )";

if [ "$(docker ps -a | grep webdav-js-app)" ]; then
    docker stop webdav-js-app > /dev/null;
    docker rm webdav-js-app > /dev/null;
fi

# additional test files
tmpDir=$(cd "$dir/../tmp" && pwd);
if [[ ! -d $tmpDir ]]; then
    mkdir $tmpDir;
fi

volumes="-v $dir/../:/var/www/webdav-js:ro -v $dir/../examples/apache-directory-list-local/webdav.conf:/etc/apache2/sites-enabled/webdav.conf:ro -v $dir/../src/webdav.js:/var/www/html/source.js:ro -v $dir/../assets/css/style.css:/var/www/html/style.css:ro";

# Hide missing ServerName error
if [[ ! -e $tmpDir/server.conf ]]; then
    echo 'ServerName localhost' > $tmpDir/server.conf;
fi

volumes="$volumes -v $tmpDir/server.conf:/etc/apache2/sites-enabled/server.conf:ro";

# get random images for testing
echo -n "Downloading images... ";

for (( i = 0; i < 10; i++ )); do
    if [[ ! -e "$tmpDir/$i.jpg" ]]; then
        curl -sL -o "$tmpDir/$i.jpg" "https://source.unsplash.com/random/";
    fi

    volumes="$volumes -v $tmpDir/$i.jpg:/var/www/html/image_$i.jpg:ro";
done

echo 'Done!';

# get fonts for testing
echo -n "Downloading fonts... ";

for font in notoserif/NotoSerif-Regular.ttf unlock/Unlock-Regular.ttf blackandwhitepicture/BlackAndWhitePicture-Regular.ttf indieflower/IndieFlower-Regular.ttf; do
    fontName="$(basename $font)";

    if [[ ! -e "$tmpDir/$fontName" ]]; then
        curl -s -o "$tmpDir/$fontName" "https://cdn.jsdelivr.net/gh/google/fonts/ofl/$font";
    fi

    volumes="$volumes -v $tmpDir/$fontName:/var/www/html/$fontName:ro";
done

echo 'Done!';

# get video for testing
echo -n "Downloading video... ";

if [[ ! -e "$tmpDir/video.mp4" ]]; then
    curl -s -o "$tmpDir/video.mp4" "http://techslides.com/demos/sample-videos/small.mp4";
fi

volumes="$volumes -v $tmpDir/video.mp4:/var/www/html/video.mp4:ro";
echo 'Done!';

docker run -dit \
--name webdav-js-app \
-p 8080:80 \
$volumes \
webdav-js sleep infinity;

docker exec -it webdav-js-app /bin/bash -c "\
chown www-data -R /var/www/html 2> /dev/null; \
rm /etc/apache2/sites-enabled/000-default.conf; \
apachectl start || apachectl restart \
";

echo 'This can be tested on http://localhost:8080';
