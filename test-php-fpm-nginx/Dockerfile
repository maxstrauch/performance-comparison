FROM php:7.4-fpm-alpine

WORKDIR /app
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

RUN apk add nginx

RUN mkdir -p /run/nginx/ ; mkdir -p /usr/share/nginx/html/

COPY default.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html/
COPY html/ .

EXPOSE 80

CMD [ "/app/entrypoint.sh" ]