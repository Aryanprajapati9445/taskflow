# Scalability Notes — TaskFlow API

## Current Architecture

TaskFlow uses a **modular monolith** architecture — all features live in one deployable unit but are organized as independent modules (`auth/`, `user/`, `task/`). This gives us the simplicity of a monolith with the structural readiness for microservices.

## Horizontal Scaling Strategy

### 1. Stateless API Design
The API is fully **stateless** — no server-side sessions. JWTs carry all auth context in the token itself. This means any instance can handle any request, making horizontal scaling trivial.

```
                  ┌──────────────┐
                  │ Load Balancer│
                  └──────┬───────┘
              ┌──────────┼──────────┐
              ▼          ▼          ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ API #1   │ │ API #2   │ │ API #3   │
        └────┬─────┘ └────┬─────┘ └────┬─────┘
             └─────────────┼─────────────┘
                      ┌────▼────┐
                      │ MongoDB │
                      │ Replica │
                      └─────────┘
```

### 2. Caching Layer (Redis)
Add Redis for:
- **Token blacklisting** — Revoke JWTs without DB queries on every request
- **Rate limiting storage** — Distributed rate limits across multiple API instances
- **Query caching** — Cache frequently accessed task lists (invalidate on write)

### 3. Database Scaling
- **MongoDB Replica Set** — Read replicas for query distribution
- **Sharding** — Shard by `createdBy` field for even distribution across users
- **Indexes** — Already optimized with compound indexes on `createdBy + status`

### 4. Microservices Extraction Path
The modular structure makes extraction straightforward:

| Module | Microservice | When to Extract |
|--------|-------------|----------------|
| `auth/` | Auth Service | When auth logic grows (OAuth, SAML, MFA) |
| `task/` | Task Service | When task features expand (comments, attachments) |
| `user/` | User Service | When user management gets complex (teams, orgs) |

Communication between services via **message queues** (RabbitMQ/SQS) for async operations, and **REST/gRPC** for sync calls.

### 5. Deployment Pipeline
```
GitHub Push → CI/CD Pipeline → Docker Build → Container Registry
                                                    │
                                              ┌─────▼─────┐
                                              │ Kubernetes │
                                              │    / ECS   │
                                              └────────────┘
```

- **Containerized** — Dockerfile ready for any container orchestrator
- **Zero-downtime deploys** — Rolling updates with health checks (`/health` endpoint)
- **Auto-scaling** — CPU/memory-based scaling policies in K8s or ECS

### 6. Monitoring & Observability
- **Winston logging** — Structured JSON logs ready for ELK/Datadog ingestion
- **Health endpoint** — `/health` for load balancer health checks
- **Error tracking** — Global error handler catches all unhandled errors

## Performance Optimizations Already In Place
- MongoDB compound indexes for common query patterns
- Pagination on all list endpoints (prevents full collection scans)
- Request body size limits (10KB) to prevent abuse
- Parallel `Promise.all()` for count + find queries
