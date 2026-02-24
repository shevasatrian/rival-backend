# RivalBlog — Backend

REST API for RivalBlog, a fullstack blog platform. Built with NestJS, Prisma, and PostgreSQL.

---

## 🔗 Links

| | URL |
|---|---|
| **Live API** | `https://rival-backend-production.up.railway.app` |
| **Frontend Repository** | `https://github.com/shevasatrian` |

---

## 🛠️ Tech Stack

- **NestJS** — Node.js framework
- **Prisma** — ORM
- **PostgreSQL** — Database
- **JWT** — Authentication
- **@nestjs/throttler** — Rate limiting

---

## 🚀 Setup Instructions

### Prerequisites

- Node.js >= 18
- PostgreSQL database

### Installation

```bash
# 1. Clone repository
git clone https://github.com/yourusername/rivalblog-backend.git
cd rivalblog-backend

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env
```

Fill in `.env`:

```env
DATABASE_URL="postgresql://user:password@host:5432/rivalblog"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3000
```

```bash
# 4. Run database migrations
npx prisma migrate deploy

# 5. Start development server
npm run start:dev
```

API will run on `http://localhost:8000`.

---

## 📁 Project Structure

```
src/
├── main.ts                        # App entry point
├── app.module.ts                  # Root module
├── auth/
│   ├── auth.controller.ts         # POST /auth/register, /auth/login
│   ├── auth.service.ts            # Register & login logic
│   └── dto/
├── blogs/
│   ├── blogs.controller.ts        # Protected blog routes
│   ├── blogs.service.ts           # Blog business logic
│   └── dto/
├── public/
│   ├── public.controller.ts       # Public feed & blog detail
│   └── public.module.ts
├── prisma/
│   └── prisma.service.ts
└── common/
    ├── guards/
        └── jwt-auth.guard.ts

```

---

## 📋 API Endpoints

### Public (no auth required)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/public/feed` | Get paginated published blogs |
| `GET` | `/public/blogs/:slug` | Get blog detail by slug |

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register new user |
| `POST` | `/auth/login` | Login, returns JWT |

### Blogs (JWT required)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/blogs/my` | Get current user's blogs |
| `GET` | `/blogs/:id` | Get blog by ID (owner only) |
| `POST` | `/blogs` | Create new blog |
| `PATCH` | `/blogs/:id` | Update blog (owner only) |
| `DELETE` | `/blogs/:id` | Delete blog (owner only) |
| `POST` | `/blogs/:id/like` | Like a blog |
| `DELETE` | `/blogs/:id/like` | Unlike a blog |
| `GET` | `/blogs/:id/like/status` | Check if current user liked |
| `GET` | `/blogs/:id/comments` | Get comments |
| `POST` | `/blogs/:id/comments` | Post a comment |

---

## 🛡️ Rate Limiting

| Endpoint | Limit |
|---|---|
| `POST /auth/login` | 5 requests / minute |
| `POST /auth/register` | 3 requests / minute |
| `GET /public/feed` | 3 requests / second, 30 / minute |
| `GET /public/blogs/:slug` | 3 requests / second, 30 / minute |
| All other endpoints | 5 requests / second, 100 / minute |


---

## 🏗️ Architecture Notes

**Route Structure**

Two controller groups are used intentionally:
- `/public/*` — unauthenticated routes accessible by anyone
- `/blogs/*` — protected routes behind `JwtAuthGuard`

This separation makes access control explicit and easy to audit.

**Slug Generation**

Slugs are auto-generated from blog titles using `slugify`, with a counter suffix appended if a slug already exists (`my-blog` → `my-blog-1` → `my-blog-2`).

**Ownership Checks**

All mutating blog operations (`update`, `delete`, `getById`) verify that the requesting user owns the resource before proceeding, returning `403 Forbidden` if not.

---

## ⚖️ Tradeoffs Made

| Decision | What was chosen | What was sacrificed |
|---|---|---|
| JWT in localStorage (frontend) | Simple implementation | Vulnerable to XSS; httpOnly cookies safer |
| No refresh token | Simpler auth flow | Users get logged out when token expires |
| `_count` for likes/comments | Single query efficiency | Count is not real-time (requires page reload) |
| No pagination on comments | Simpler implementation | Could be slow on blogs with many comments |

---

## 🔧 What I Would Improve

- Stronger password validation on register currently only requires minimum 6 characters, would add regex validation to enforce at least one uppercase letter, one number, and one symbol for better security
- Add Swagger documentation (`@nestjs/swagger`)
- Search on public feed would add a q query parameter to filter blogs by title keyword using Prisma's contains filter
- Add structured logging with Pino
- Soft delete for blogs instead of permanently deleting blogs, would add an isDeleted boolean field in the schema and filter it out in queries, making recovery possible
- Add updatedAt to feed response currently only createdAt is returned, showing updatedAt gives readers more accurate information about content freshness

---

## 📈 How I'd Scale to 1 Million Users

**Database**
- Add read replicas — direct all `SELECT` queries to replicas, writes to primary
- Connection pooling with PgBouncer
- Indexes on `slug`, `userId`, `createdAt`, `isPublished`
- Partition `likes` and `comments` tables by `blogId` range for large datasets

**Caching**
- Cache public feed in Redis with short TTL (30 seconds) — eliminates the majority of DB reads since feed is the most visited endpoint
- Cache blog detail pages at CDN level using `stale-while-revalidate`

**API**
- Horizontal scaling behind a load balancer
- Rate limiting per user ID instead of IP only to prevent abuse from shared IPs
- Replace live like counting with precomputed counters updated via background jobs

**Background Jobs**
- BullMQ + Redis for async processing (notifications, summary generation, counter updates)
- Decouples slow operations from the HTTP request cycle

**Observability**
- Structured logging with Pino shipped to a log aggregator
- Distributed tracing to identify bottlenecks
- Alerting on p99 latency and error rates

---
