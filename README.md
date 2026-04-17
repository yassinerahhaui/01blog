# 01Blog

A social blogging platform where students share their learning experiences, discoveries, and progress. Users can create posts with media, follow each other, like and comment on content, and report inappropriate behavior. Admins have a full moderation dashboard.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Java 17, Spring Boot 3, Spring Security, JWT |
| **Frontend** | Angular 21, TypeScript, Bootstrap 5, SCSS |
| **Database** | PostgreSQL 16 |
| **File Storage** | MinIO (S3-compatible) |
| **Containerization** | Docker, Docker Compose |

## Features

- **Authentication** — Register, login, JWT-based session, role-based access (USER / ADMIN)
- **Posts** — Create, edit, delete posts with image/video upload and markdown support
- **Social** — Follow/unfollow users, like and comment on posts, notifications
- **Profiles** — Public user profiles with paginated post feeds and infinite scroll
- **Reporting** — Report users or posts with reason and details
- **Admin Dashboard** — Sidebar navigation with user management, post moderation, and report review
- **Dark Mode** — Toggle between light and dark themes
- **Responsive** — Mobile-friendly layout using Bootstrap 5

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- (For local dev) Java 17+, Node.js 20+, npm

## Quick Start with Docker

```bash
# Clone the repository
git clone <repository-url>
cd 01blog

# Start all services (PostgreSQL, MinIO, Backend, Frontend)
docker compose up --build

# Create the MinIO bucket (run once after first start)
docker exec minio-server sh -c "mc alias set myminio http://localhost:9000 yassine_admin SuperSecretPassword123 && mc mb myminio/01blog-images --ignore-existing && mc anonymous set download myminio/01blog-images"
```

The app will be available at:
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:8080
- **MinIO Console**: http://localhost:9001

## Running Locally (Development)

### Database & Storage

```bash
# Start only PostgreSQL and MinIO
docker compose up db minio-server
```

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

The API starts on `http://localhost:8080`.

### Frontend

```bash
cd frontend
npm install
npm start
```

The dev server starts on `http://localhost:4200`.

## Project Structure

```
01blog/
├── backend/                     # Spring Boot API
│   └── src/main/java/com/yrcode/_blog/
│       ├── controllers/         # REST controllers
│       ├── services/            # Business logic
│       ├── abstracts/           # Service interfaces
│       ├── entities/            # JPA entities
│       ├── repositories/        # Spring Data repos
│       ├── dtos/                # Request/response DTOs
│       ├── enums/               # Role, Access, MediaType, etc.
│       ├── security/            # JWT filter, helper, utils
│       ├── configurations/      # Security, MinIO, app config
│       └── shared/              # Global response, exceptions
├── frontend/                    # Angular app
│   └── src/app/
│       ├── pages/               # Route pages (home, profile, dashboard, etc.)
│       ├── components/          # Reusable components (navbar, post-card, etc.)
│       └── core/                # Services, guards, models, interceptors
├── docker-compose.yml           # Multi-service orchestration
└── README.md
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/post/all` | Get all posts |
| GET | `/api/post/{id}` | Get single post |
| POST | `/api/post/create` | Create post (multipart) |
| PUT | `/api/post/update` | Update a post |
| DELETE | `/api/post/{id}` | Delete a post |
| POST | `/api/post/{id}/like` | Toggle like |
| GET | `/api/post/{id}/comments` | Get comments |
| POST | `/api/post/{id}/comments` | Add comment |
| POST | `/api/post/{id}/report` | Report a post |

### Users & Profiles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/{id}` | Get user details |
| PUT | `/api/user/update` | Update user profile |
| POST | `/api/profile/{id}/follow` | Toggle follow |
| GET | `/api/profile/{id}/posts` | Get user posts (paginated) |
| GET | `/api/profile/{id}/followers` | Get followers list |
| GET | `/api/profile/{id}/following` | Get following list |
| POST | `/api/profile/{id}/report` | Report a user |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get current user notifications |
| PUT | `/api/notifications/{id}/read` | Mark one as read |
| PUT | `/api/notifications/read-all` | Mark all as read |

### Admin (requires ADMIN role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| PUT | `/api/admin/users/{id}/access` | Ban/unban user |
| DELETE | `/api/admin/users/{id}` | Delete user |
| GET | `/api/admin/posts` | List all posts |
| DELETE | `/api/admin/posts/{id}` | Delete post |
| GET | `/api/admin/reports` | List all reports |
