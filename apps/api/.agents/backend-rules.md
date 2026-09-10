
# AI Agent Directives: NestJS Backend Engineering Standards

This document defines the strict architectural and coding standards for building, maintaining, and scaling a NestJS (TypeScript) backend. As an AI agent, you must adhere to these rules when generating, refactoring, or reviewing code for this system.

## 1. Tech Stack & Environment
* **Framework:** NestJS (Express under the hood).
* **Language:** TypeScript (Strict mode enabled).
* **Database:** PostgreSQL via Prisma ORM.
* **Package Manager:** `pnpm` (Workspace/Monorepo compatible).
* **Caching & Queues:** Redis, BullMQ.

---

## 2. Database Modeling & Prisma ORM

### 2.1 Schema Design
* Use `cuid()` or `uuid()` for primary keys to prevent enumeration attacks and simplify distributed data merging.
* Enforce referential integrity using explicit relations.
* Always include `createdAt` and `updatedAt` on every model.

### 2.2 Indexing Properly
* Add `@index` on fields frequently used in `WHERE`, `ORDER BY`, or `GROUP BY` clauses.
* Always index foreign keys used in relations to speed up joins.
* Use composite unique constraints (`@@unique([field1, field2])`) when logical uniqueness spans multiple columns.

### 2.3 Migrations
* **Local Development:** Always use `pnpm prisma migrate dev --name <descriptive_name>` to generate and apply migrations. Never manually edit the database schema.
* **Production Deployment:** Run `pnpm prisma migrate deploy` in the deployment pipeline (e.g., CI/CD, Docker entrypoint) to apply pending migrations safely without resetting data.

---

## 3. Data Operations & Query Optimization

### 3.1 Fetching & Avoiding N+1 Queries
* **Never** fetch records in a loop.
* Use Prisma's `include` to fetch related records in a single query (JOIN).
* Use Prisma's `select` to retrieve only the necessary columns, minimizing memory footprint and network transfer.
* Always implement pagination (limit/offset or cursor-based) for endpoints returning collections.

### 3.2 Update & Upsert
* Use `update` for patching specific fields.
* Use `upsert` when a record must be created if it does not exist, reducing database roundtrips and avoiding race conditions.

### 3.3 Deletion Strategies
* **Soft Delete:** Implement soft deletes via a `deletedAt` DateTime field. Queries must globally filter out records where `deletedAt: { not: null }` (managed via Prisma middleware or client extensions).
* **Hard Delete:** Reserve hard deletes (`prisma.model.delete`) only for data privacy compliance (e.g., GDPR) or clearing temporary/orphan records.

---

## 4. Performance: Time & Space Complexity
* **Time Complexity:** Optimize algorithmic operations. Prefer O(1) lookups using Maps or Sets instead of O(N) array `.find()` or `.filter()` operations on large datasets.
* **Space Complexity:** Stream large payloads instead of buffering them in memory. Avoid loading thousands of database rows into memory simultaneously; use batch processing.
* **Background Tasks:** Offload heavy computations or external API calls to BullMQ/Redis message queues to keep HTTP response times low.

---

## 5. Caching & Invalidation
* Implement `@nestjs/cache-manager` with a Redis store for frequently accessed, infrequently changing data (e.g., configurations, product catalogs).
* **Invalidation:** Cache must be explicitly invalidated upon data mutation. 
  * Use Cache Interceptors for GET endpoints.
  * Use event-driven invalidation or explicit cache service calls (`await this.cacheManager.del('key')`) within `create`, `update`, and `delete` service methods.

---

## 6. Security & Data Protection

### 6.1 HTTP-Only Cookies
* Use `cookie-parser` middleware.
* Store JWTs or session identifiers in HTTP-only, secure cookies to prevent XSS attacks.
* Configuration:
  ```typescript
  res.cookie('access_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // or 'strict'
    maxAge: 1000 * 60 * 15, // 15 minutes
  });