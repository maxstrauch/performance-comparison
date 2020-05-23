FROM openresty/openresty:alpine

COPY nginx.conf /usr/local/openresty/nginx/conf/nginx.conf

WORKDIR /var/www/html/
COPY html/ .

EXPOSE 80