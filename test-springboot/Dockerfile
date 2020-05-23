FROM gradle:5.4.1-jdk8-alpine AS build

COPY --chown=gradle:gradle . /home/gradle/src

WORKDIR /home/gradle/src

RUN gradle bootJar --no-daemon

# ---

FROM openjdk:8-jre-alpine3.9

WORKDIR /app

COPY ./html ./html

COPY --from=build /home/gradle/src/build/libs/demo-0.0.1-SNAPSHOT.jar app.jar

ENV STATIC_PATH="/app/html"

CMD ["/usr/bin/java", "-jar", "app.jar"]
