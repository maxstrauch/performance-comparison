FROM node:alpine AS builder

WORKDIR /app
COPY . .

RUN npm i --unsafe-perm

RUN npm run build

# ---

FROM node:alpine

WORKDIR /app

COPY --from=builder /app/dist dist/
COPY --from=builder /app/html html/
COPY --from=builder /app/package.json .
COPY --from=builder /app/package-lock.json .

RUN npm i --unsafe-perm --only=prod

ENV PORT=8080

CMD [ "npm", "run", "start" ]