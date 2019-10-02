FROM httpd:2.4.37-alpine

RUN \
  apk add --upgrade --update-cache curl && \
  mkdir -p /var/www/html && \
  mkdir -p /var/www/conf && \
  #
  for i in 0 1 2 3 4 5 6 7 8 9; do \
    curl -sL -o "/var/www/html/$i.jpg" "https://source.unsplash.com/random/"; \
  done && \
  #
  for font in notoserif/NotoSerif-Regular.ttf unlock/Unlock-Regular.ttf blackandwhitepicture/BlackAndWhitePicture-Regular.ttf indieflower/IndieFlower-Regular.ttf; do \
    curl -s -o "/var/www/html/$(basename $font)" "https://cdn.jsdelivr.net/gh/google/fonts/ofl/$font"; \
  done && \
  #
  curl -s -o /var/www/html/video.mp4 "http://techslides.com/demos/sample-videos/small.mp4" && \
  #
  apk del curl && \
  #
  echo >> /usr/local/apache2/conf/httpd.conf && \
  echo 'LoadModule dav_module modules/mod_dav.so' >> /usr/local/apache2/conf/httpd.conf && \
  echo 'LoadModule dav_fs_module modules/mod_dav_fs.so' >> /usr/local/apache2/conf/httpd.conf && \
  echo 'LoadModule dav_lock_module modules/mod_dav_lock.so' >> /usr/local/apache2/conf/httpd.conf && \
  echo >> /usr/local/apache2/conf/httpd.conf && \
  echo 'Include /var/www/conf/*.conf' >> /usr/local/apache2/conf/httpd.conf && \
  #
  mkdir -p /usr/local/apache2/var && \
  chown -R daemon:daemon /usr/local/apache2/var && \
  chmod -R 755 /usr/local/apache2/var && \
  #
  echo 'DavLockDB "/usr/local/apache2/var/DavLock"' >> /var/www/conf/location.conf && \
  echo >> /var/www/conf/location.conf && \
  echo '<Directory /var/www>' >> /var/www/conf/location.conf && \
  echo '  Dav On' >> /var/www/conf/location.conf && \
  echo '  Require all granted' >> /var/www/conf/location.conf && \
  echo '</Directory>' >> /var/www/conf/location.conf && \
  #
  chown -R daemon:daemon /var/www && \
  true;

EXPOSE 80
