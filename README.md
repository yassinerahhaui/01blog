# 01Blog

01Blog is a social blogging platform where users can publish posts with media, follow other users, react/comment, and report content. Admins have dedicated moderation tools.

## Used Technologies

| Layer | Technologies |
|---|---|
| Backend | Java 17, Spring Boot 4, Spring Security, Spring Data JPA, JWT |
| Frontend | Angular 21, TypeScript, RxJS, Bootstrap 5, SCSS |
| Database | PostgreSQL 16 |
| Object Storage | MinIO (S3-compatible) |
| DevOps | Docker, Docker Compose |
| Build tools | Maven Wrapper, npm |

## Main Features

- Authentication and authorization with JWT.
- Create, update, and delete posts with media upload.
- Like and comment interactions.
- Follow and unfollow users.
- User and post reporting workflows.
- Admin dashboard for moderation and access management.
- Infinite-scroll feeds on Home and Profile pages.

## Setup Instructions

### Prerequisites

- Docker and Docker Compose.
- For local (non-container) app execution: Java 17+, Node.js 20+, npm.

### Option 1: Run Everything with Docker Compose

1. From the project root, build and start all services:

```bash
docker compose up --build
```

2. Create the MinIO bucket (run once after the first start):

```bash
docker exec minio-server sh -c "mc alias set myminio http://localhost:9000 yassine_admin SuperSecretPassword123 && mc mb myminio/01blog-images --ignore-existing && mc anonymous set download myminio/01blog-images"
```

3. Access the services:

- Frontend: http://0.0.0.0:4200
- Backend API: http://localhost:8080
- MinIO API: http://localhost:9000
- MinIO Console: http://localhost:9001

### Option 2: Local Development (Frontend and Backend), Infra in Docker

1. Start infrastructure services only:

```bash
docker compose up db minio-server
```

2. Run backend:

```bash
cd backend
./mvnw spring-boot:run
```

3. Run frontend:

```bash
cd frontend
npm install
npm start
```

4. Open the application at http://0.0.0.0:4200.

## Useful Commands

### Backend

```bash
cd backend
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

## Project Structure

```text
01blog/
|- backend/
|  |- src/main/java/com/yrcode/_blog/
|  |  |- controllers/
|  |  |- services/
|  |  |- repositories/
|  |  |- entities/
|  |  |- security/
|  |  |- dtos/
|  |  |- configurations/
|  |  `- shared/
|- frontend/
|  `- src/app/
|     |- pages/
|     |- components/
|     `- core/
|- docker-compose.yml
`- README.md
```

## Notes

- Frontend API base URL is configured as http://localhost:8080/api.
- Backend default database points to PostgreSQL on localhost:5432.
- MinIO defaults are configured in backend application properties and overridden in Docker where needed.
