FROM maven:3.9.9-eclipse-temurin-17-alpine

WORKDIR /app

# نسخ الـ pom.xml باش نتيليشارجيوا المكتبات أول مرة
COPY pom.xml .
RUN mvn dependency:go-offline -B

# نسخ الكود كامل
COPY src ./src

# تشغيل السيرفر في وضع التطوير
CMD ["mvn", "spring-boot:run"]