FROM openjdk:8-jre-alpine3.9

WORKDIR /app

COPY out/artifacts/test_tomcat_plain_jar/test-tomcat-plain.jar app.jar
COPY ./html ./html

ENV STATIC_PATH="/app/html"

CMD ["/usr/bin/java", "-jar", "app.jar"]
