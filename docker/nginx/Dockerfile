FROM alpine

# This chunk copied from https://github.com/duxlong/webdav/blob/main/Dockerfile
RUN apk update && \
  apk add --no-cache pcre libxml2 libxslt apache2-utils \
    gcc make libc-dev pcre-dev zlib-dev libxml2-dev libxslt-dev && \
  cd /tmp && \
  wget https://github.com/nginx/nginx/archive/refs/tags/release-1.23.1.zip -O nginx.zip && \
  unzip nginx.zip && \
  wget https://github.com/arut/nginx-dav-ext-module/archive/refs/tags/v3.0.0.zip -O dav-ext-module.zip && \
  unzip dav-ext-module.zip && \
  wget https://github.com/aperezdc/ngx-fancyindex/archive/refs/tags/v0.5.2.zip -O ngx-fancyindex.zip && \
  unzip ngx-fancyindex.zip && \
  cd nginx-release-1.23.1 && \
  ./auto/configure --prefix=/opt/nginx --with-http_dav_module --add-module=/tmp/nginx-dav-ext-module-3.0.0 --add-module=/tmp/ngx-fancyindex-0.5.2 && \
  make && make install && \
  cd /root && \
  apk del gcc make libc-dev pcre-dev zlib-dev libxml2-dev libxslt-dev && \
  rm -rf /var/cache/apk/* && \
  rm -rf /tmp/*

EXPOSE 80

RUN apk -U upgrade && \
  apk add --no-cache curl && \
  mkdir -p /var/www/html && \
  mkdir -p /var/www/conf && \
\
  # add images
  for i in 0 1 2 3 4 5 6 7 8 9; do \
    while ! curl -m 2 -L -o "/var/www/html/$i.jpg" "https://picsum.photos/1280/960"; do \
      sleep 1; \
    done \
  done && \
\
  # add transparent png
  while ! curl -m 2 -o /var/www/html/transparent-test.png "https://www.w3.org/Graphics/PNG/alphatest.png"; do \
    sleep 1; \
  done && \
\
  # add fonts
  for font in notoserif/NotoSerif-Regular.ttf unlock/Unlock-Regular.ttf blackandwhitepicture/BlackAndWhitePicture-Regular.ttf indieflower/IndieFlower-Regular.ttf; do \
    while ! curl -m 10 -L -o "/var/www/html/$(basename $font)" "https://cdn.jsdelivr.net/gh/google/fonts/ofl/$font"; do \
      sleep 1; \
    done \
  done && \
\
  # add video
  while ! curl -m 10 -L -o /var/www/html/video.mp4 "https://ik.imagekit.io/demo/sample-video.mp4"; do \
    sleep 1; \
  done && \
\
  # add PDF
  while ! curl -m 2 -L -o /var/www/html/dummy.pdf "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"; do \
    sleep 1; \
  done && \
\
  # create som inaccessible files for testing
  mkdir -p /var/www/html/inaccessible-dir && \
\
  while ! curl -m 2 -L -o /var/www/html/inaccessible-image.jpg "https://picsum.photos/1280/960"; do \
    sleep 1; \
  done && \
\
  echo 'Lorem ipsum dolor sit amet' > /var/www/html/inaccessible-text-file.txt && \
  > /var/www/html/inaccessible-file && \
\
  # set ownership properly
  chown -R daemon:daemon /var/www && \
  chown nobody:nobody /var/www/html/inaccessible* && \
  chmod 700 /var/www/html/inaccessible* && \
\
  # clean up
  apk del curl;

ENTRYPOINT ["/opt/nginx/sbin/nginx", "-g", "daemon off;"]

EXPOSE 80
