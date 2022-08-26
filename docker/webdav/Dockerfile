FROM httpd:2.4.43-alpine

RUN \
  apk add --upgrade --update-cache curl apr-util && \
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
  while ! curl -o /var/www/html/transparent-test.png "https://www.w3.org/Graphics/PNG/alphatest.png"; do \
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
  # set up apache
  echo >> /usr/local/apache2/conf/httpd.conf && \
  echo 'LoadModule dav_module modules/mod_dav.so' >> /usr/local/apache2/conf/httpd.conf && \
  echo 'LoadModule dav_fs_module modules/mod_dav_fs.so' >> /usr/local/apache2/conf/httpd.conf && \
  echo 'LoadModule dav_lock_module modules/mod_dav_lock.so' >> /usr/local/apache2/conf/httpd.conf && \
  echo >> /usr/local/apache2/conf/httpd.conf && \
  echo 'Include /var/www/conf/*.conf' >> /usr/local/apache2/conf/httpd.conf && \
\
  echo 'DavLockDB "/usr/local/apache2/var/DavLock"' >> /var/www/conf/location.conf && \
  echo >> /var/www/conf/location.conf && \
  echo '<Directory /var/www>' >> /var/www/conf/location.conf && \
  echo '  Dav On' >> /var/www/conf/location.conf && \
  echo '  Require all granted' >> /var/www/conf/location.conf && \
  echo '</Directory>' >> /var/www/conf/location.conf && \
\
  mkdir -p /usr/local/apache2/var && \
  chown -R daemon:daemon /usr/local/apache2/var && \
  chmod -R 755 /usr/local/apache2/var && \
\
  # set ownership properly
  chown -R daemon:daemon /var/www && \
  chown nobody:nobody /var/www/html/inaccessible* && \
  chmod 700 /var/www/html/inaccessible* && \
\
  # clean up
  apk del curl;

EXPOSE 80
