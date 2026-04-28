# Build stage
FROM maven:3.8.4-openjdk-17-slim AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies first to leverage Docker caching
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM openjdk:17-jdk-slim
WORKDIR /app
# Match the server.port from application.yml
EXPOSE 8092
COPY --from=build /app/target/auth-module-0.0.1-SNAPSHOT.jar app.jar

# Run the jar with standard production flags
ENTRYPOINT ["java", "-Xmx512m", "-jar", "app.jar"]
