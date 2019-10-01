FROM httpd:2.4.37-alpine

RUN \
  apk add --no-cache \
    # db \
    apr-util \
    apache2-utils \
    apache2-webdav \
    curl \
  && \
  true;

RUN \
  mkdir -p /var/www/html && \
  true;

RUN \
  mkdir -p /var/www/conf && \
  true;

RUN \
  for i in 0 1 2 3 4 5 6 7 8 9; do \
    curl -sL -o "/var/www/html/$i.jpg" "https://source.unsplash.com/random/"; \
  done && \
  true;

RUN \
  for font in notoserif/NotoSerif-Regular.ttf unlock/Unlock-Regular.ttf blackandwhitepicture/BlackAndWhitePicture-Regular.ttf indieflower/IndieFlower-Regular.ttf; do \
    curl -s -o "/var/www/html/$(basename $font)" "https://cdn.jsdelivr.net/gh/google/fonts/ofl/$font"; \
  done && \
  true;

RUN \
  curl -s -o /var/www/html/video.mp4 "http://techslides.com/demos/sample-videos/small.mp4" && \
  true;

RUN \
  apk del curl && \
  true;

RUN \
  echo >> /usr/local/apache2/conf/httpd.conf && \
  # echo 'LoadModule auth_digest_module modules/mod_auth_digest.so' >> /usr/local/apache2/conf/httpd.conf && \
  echo 'LoadModule dav_module modules/mod_dav.so' >> /usr/local/apache2/conf/httpd.conf && \
  echo 'LoadModule dav_fs_module modules/mod_dav_fs.so' >> /usr/local/apache2/conf/httpd.conf && \
  echo 'LoadModule dav_lock_module modules/mod_dav_lock.so' >> /usr/local/apache2/conf/httpd.conf && \
  # echo >> /usr/local/apache2/conf/httpd.conf && \
  # echo 'Include conf/extra/httpd-dav.conf' >> /usr/local/apache2/conf/httpd.conf && \
  echo >> /usr/local/apache2/conf/httpd.conf && \
  echo 'Include /var/www/conf/*.conf' >> /usr/local/apache2/conf/httpd.conf && \
  true;

RUN \
  mkdir -p /usr/local/apache2/var && \
  > /usr/local/apache2/var/DavLock && \
  chown -R daemon:daemon /usr/local/apache2/var && \
  chmod -R 755 /usr/local/apache2/var && \
#   > /tmp/DavLock && \
#   chown daemon:daemon /tmp/DavLock && \
  true;

RUN \
  # echo 'User daemon' >> /var/www/conf/location.conf && \
  # echo 'Group daemon' >> /var/www/conf/location.conf && \
  echo 'DavLockDB "/usr/local/apache2/var/DavLock"' >> /var/www/conf/location.conf && \
  # echo 'DavGenericLockDB "/usr/local/apache2/var/DavLock"' >> /var/www/conf/location.conf && \
  echo >> /var/www/conf/location.conf && \
  echo '<Directory /var/www>' >> /var/www/conf/location.conf && \
  echo '  Dav On' >> /var/www/conf/location.conf && \
  echo '  Require all granted' >> /var/www/conf/location.conf && \
  echo '</Directory>' >> /var/www/conf/location.conf && \
  true;

RUN \
  chown -R daemon:daemon /var/www && \
  true;

EXPOSE 80
