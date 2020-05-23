FROM node:alpine

WORKDIR /app
COPY . .

RUN npm i --unsafe-perm --only=prod

ENV PORT=8080

CMD [ "npm", "run", "start" ]