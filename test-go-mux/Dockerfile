FROM golang:alpine AS builder

RUN apk update && apk add --no-cache git

WORKDIR /app

COPY . .

RUN go get -d -v

RUN go build -o /app/app

# ---

FROM alpine:latest

WORKDIR /app
COPY --from=builder /app/app ./app
COPY ./html ./html

CMD [ "/app/app" ]