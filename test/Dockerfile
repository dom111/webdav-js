FROM debian:stretch

RUN apt-get update -y && apt-get install -y apache2 php7.0

RUN a2enmod \
  proxy \
  proxy_ajp \
  proxy_http \
  rewrite \
  deflate \
  headers \
  proxy_balancer \
  proxy_connect \
  xml2enc \
  proxy_html \
  dav \
  dav_fs \
  ssl

EXPOSE 80
