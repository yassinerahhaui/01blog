# 01Blog

01Blog is a social blogging platform where users can publish posts with media, follow other users, react and comment, report content, and manage moderation flows through admin features.

## Tech stack

| Layer | Technologies |
| --- | --- |
| Backend | Java 17, Spring Boot 4, Spring Security, Spring Data JPA, JWT |
| Frontend | Angular 21, TypeScript, RxJS, Bootstrap 5, SCSS |
| Database | PostgreSQL 16 |
| Object storage | MinIO (S3-compatible) |
| Tooling | Docker, Docker Compose, Maven Wrapper, npm |

## Core features

- JWT-based authentication and authorization
- Create, update, and delete posts with media upload
- Likes, comments, follow/unfollow interactions
- User and post reporting workflows
- Admin moderation for users, posts, and reports
- Infinite-scroll feeds on Home and Profile

## Prerequisites

- Docker and Docker Compose
- For local app execution: Java 17+, Node.js 20+, npm

## Run with Docker Compose (recommended)

1. Build and start all services:

```bash
docker compose up -d --build
```

2. Create the MinIO bucket (run once after first startup):

```bash
docker exec minio-server sh -c "mc alias set myminio http://localhost:9000 yassine_admin SuperSecretPassword123 && mc mb myminio/01blog-images --ignore-existing && mc anonymous set download myminio/01blog-images"
```

3. Open the services:

| Service | URL |
| --- | --- |
| Frontend | http://0.0.0.0:4200 |
| Backend API | http://localhost:8080/api |
| MinIO API | http://localhost:9000 |
| MinIO Console | http://localhost:9001 |

## Local development (app local, infra in Docker)

1. Start only PostgreSQL and MinIO:

```bash
docker compose up -d db minio-server
```

2. Start backend:

```bash
cd backend
./mvnw spring-boot:run
```

3. Start frontend:

```bash
cd frontend
npm install
npm start
```

4. Open http://0.0.0.0:4200.

## Useful commands

### Backend

```bash
cd backend
./mvnw test
./mvnw -DskipTests compile
./mvnw spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm start
npm run build
npm test
```

## Project structure

```text
01blog/
|- backend/
|  `- src/main/java/com/yrcode/_blog/
|     |- controllers/
|     |- services/
|     |- repositories/
|     |- entities/
|     |- security/
|     |- dtos/
|     |- configurations/
|     `- shared/
|- frontend/
|  `- src/app/
|     |- pages/
|     |- components/
|     `- core/
|- docker-compose.yml
`- README.md
```

## Configuration notes

- Frontend API base URL: `frontend/src/environments/environment*.ts` (`http://localhost:8080/api`)
- Backend datasource defaults: `backend/src/main/resources/application.properties`
- MinIO defaults are defined in backend properties and overridden by Docker Compose where applicable
