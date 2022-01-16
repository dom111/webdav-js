FROM alpine:latest

RUN \
  apk add --upgrade --update-cache lighttpd lighttpd-mod_webdav curl && \
  mkdir -p /var/www/html && \
\
  echo "Generating content..." && \
\
  # add images
  for i in 0 1 2 3 4 5 6 7 8 9; do \
    curl -sL -o "/var/www/html/$i.jpg" "https://picsum.photos/1280/960"; \
    echo "Added $i.jpg."; \
  done && \
\
  # add transparent png
  curl -s -o /var/www/html/transparent-test.png "https://www.w3.org/Graphics/PNG/alphatest.png" && \
  echo "Added transparent-test.png." && \
\
  # add fonts
  for font in notoserif/NotoSerif-Regular.ttf unlock/Unlock-Regular.ttf blackandwhitepicture/BlackAndWhitePicture-Regular.ttf indieflower/IndieFlower-Regular.ttf; do \
    curl -s -o "/var/www/html/$(basename $font)" "https://cdn.jsdelivr.net/gh/google/fonts/ofl/$font"; \
    echo "Added $font."; \
  done && \
\
  # add video
  curl -s -o /var/www/html/video.mp4 "http://techslides.com/demos/sample-videos/small.mp4" && \
  echo "Added small.mp4." && \
\
  # add PDF
  curl -s -o /var/www/html/dummy.pdf "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" && \
  echo "Added dummy.pdf." && \
\
  # set ownership properly
  chown -R lighttpd:lighttpd /var/www && \
\
  # create some inaccessible files for testing
  mkdir -p /var/www/html/inaccessible-dir && \
  curl -sL -o "/var/www/html/inaccessible-image.jpg" "https://picsum.photos/1280/960" && \
  echo 'Lorem upsum dolor sit amet' > /var/www/html/inaccessible-text-file.txt && \
  > /var/www/html/inaccessible-file && \
  chmod 700 /var/www/html/inaccessible* && \
\
  mkdir -p /var/run/lighttpd && \
  chown lighttpd:lighttpd /var/run/lighttpd && \
  chmod a+w /dev/stderr && \
\
  sed -i -e 's/#    "mod_webdav",/    "mod_webdav",/' /etc/lighttpd/lighttpd.conf && \
  sed -i -e 's/#    "mod_alias",/    "mod_alias",/' /etc/lighttpd/lighttpd.conf && \
  sed -i -e 's!server.document-root = var.basedir + "/htdocs"!server.document-root = "/var/www/html"!' /etc/lighttpd/lighttpd.conf && \
\
  echo >> /etc/lighttpd/lighttpd.conf && \
  echo 'alias.url = ( "/webdav-js" => "/var/www/webdav-js" )' >> /etc/lighttpd/lighttpd.conf && \
  echo 'webdav.activate = "enable"' >> /etc/lighttpd/lighttpd.conf && \
  echo 'webdav.is-readonly = "disable"' >> /etc/lighttpd/lighttpd.conf && \
  echo 'dir-listing.activate = "enable"' >> /etc/lighttpd/lighttpd.conf && \
  echo 'dir-listing.external-css = "/webdav-js/assets/css/style-min.css"' >> /etc/lighttpd/lighttpd.conf && \
  echo 'dir-listing.external-js = "/webdav-js/src/webdav-min.js"' >> /etc/lighttpd/lighttpd.conf && \
  echo 'dir-listing.encoding = "utf-8"' >> /etc/lighttpd/lighttpd.conf && \
  echo 'webdav.sqlite-db-name = "/var/run/lighttpd/lighttpd.webdav_lock.db"' >> /etc/lighttpd/lighttpd.conf && \
\
  # clean up
  apk del curl;

EXPOSE 80

CMD ["lighttpd", "-D", "-f", "/etc/lighttpd/lighttpd.conf"]