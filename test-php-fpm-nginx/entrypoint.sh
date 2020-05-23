#!/bin/sh

php-fpm &

if [[ -z ${1} ]]; then
  echo "Starting nginx..."
  exec $(which nginx) -c /etc/nginx/nginx.conf -g "daemon off;"
else
  exec "$@"
fi