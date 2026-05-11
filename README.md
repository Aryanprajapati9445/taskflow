# TaskFlow — Scalable REST API with Authentication & RBAC

A production-ready REST API built with **Node.js**, **Express**, and **MongoDB**, featuring JWT authentication, role-based access control, full CRUD operations, and a React frontend.

## 🏗️ Architecture

```
project-root/
├── backend/                    # Express REST API
│   └── src/
│       ├── config/             # DB, env, Swagger config
│       ├── common/             # Shared middleware, utils, constants
│       └── modules/            # Feature-based modules
│           ├── auth/           # Register, login, refresh, logout
│           ├── user/           # Admin user management
│           └── task/           # Task CRUD
├── frontend/                   # React (Vite) SPA
│   └── src/
│       ├── components/         # Navbar, TaskModal, PrivateRoute
│       ├── context/            # AuthContext (JWT state)
│       ├── pages/              # Login, Register, Dashboard, Admin
│       └── services/           # Axios API layer
└── docker-compose.yml
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local, Docker, or Atlas)

### Backend Setup
```bash
cd backend
cp .env.example .env          # Edit with your MongoDB URI
npm install
npm run dev                   # Starts on http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev                   # Starts on http://localhost:5173
```

### Docker (Full Stack)
```bash
docker compose up --build     # Starts MongoDB + Backend + Frontend
```

## 📚 API Documentation

Interactive Swagger docs available at: **http://localhost:5000/api-docs**

### Endpoints Overview

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/v1/auth/register` | Public | Register user |
| `POST` | `/api/v1/auth/login` | Public | Login (returns JWT) |
| `POST` | `/api/v1/auth/refresh` | Public | Refresh access token |
| `POST` | `/api/v1/auth/logout` | Auth | Invalidate refresh token |
| `GET` | `/api/v1/tasks` | Auth | List my tasks (paginated) |
| `POST` | `/api/v1/tasks` | Auth | Create task |
| `GET` | `/api/v1/tasks/:id` | Auth | Get task by ID |
| `PUT` | `/api/v1/tasks/:id` | Auth | Update task |
| `DELETE` | `/api/v1/tasks/:id` | Auth | Delete task |
| `GET` | `/api/v1/tasks/all` | Admin | List all tasks |
| `GET` | `/api/v1/users` | Admin | List all users |
| `GET` | `/api/v1/users/:id` | Admin | Get user details |
| `PATCH` | `/api/v1/users/:id/role` | Admin | Change user role |
| `DELETE` | `/api/v1/users/:id` | Admin | Deactivate user |

### Standardized Responses
```json
// Success
{ "success": true, "message": "...", "data": {...}, "meta": { "page": 1, "total": 42 } }

// Error
{ "success": false, "message": "...", "errors": [{ "field": "email", "message": "..." }] }
```

## 🔐 Security Features

- **Password Hashing** — bcrypt with 12 salt rounds
- **JWT Authentication** — Short-lived access tokens (15min) + refresh tokens (7d)
- **Refresh Token Rotation** — Stored as bcrypt hash, rotated on every refresh
- **RBAC Middleware** — `authorize('admin')` guards admin routes
- **Input Validation** — express-validator on every endpoint
- **NoSQL Injection Protection** — express-mongo-sanitize
- **Security Headers** — Helmet (HSTS, CSP, X-Frame-Options)
- **Rate Limiting** — 20 req/15min for auth, 200 req/15min general
- **CORS** — Whitelisted frontend origin only

## 👑 Admin Setup

New users register with `role: user` by default. To create the first admin:

```bash
cd backend
npm run seed:admin            # Creates admin from .env credentials
```

Default admin credentials (change in `.env`):
- **Email:** `admin@taskflow.com`
- **Password:** `Admin@123`

Once the first admin exists, they can promote other users via:
- **Admin Panel UI** → Users tab → Role dropdown
- **API:** `PATCH /api/v1/users/:id/role` with `{ "role": "admin" }`

## 🧪 Testing

1. Run `npm run seed:admin` to create the admin user
2. Visit **http://localhost:5000/api-docs** for interactive API testing
3. Login with admin credentials → Use the returned JWT in the Authorize button
4. Register a regular user via the frontend → Login → Test CRUD on tasks
5. Login as admin → Open Admin Panel → Manage users and view all tasks

## 📄 Environment Variables

See `.env.example` for all required variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | — |
| `JWT_SECRET` | JWT signing secret (64+ chars) | — |
| `JWT_ACCESS_EXPIRY` | Access token lifetime | `15m` |
| `JWT_REFRESH_EXPIRY` | Refresh token lifetime | `7d` |
| `CLIENT_URL` | Frontend URL (CORS) | `http://localhost:5173` |
| `ADMIN_NAME` | Initial admin name | `Admin` |
| `ADMIN_EMAIL` | Initial admin email | `admin@taskflow.com` |


## 📖 License

MIT
