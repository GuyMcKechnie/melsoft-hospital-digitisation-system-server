**PRD — Backend Server Handlers (Node.js + Express)**

**Goal**: Provide a complete set of server-side handlers and supporting services so the frontend api clients (`auth.ts`, `users.ts`, `patients.ts`, `services.ts`, `appointments.ts`, `index.ts`) function correctly and securely.

**Global conventions**

- **Base URL**: `/api`
- **Response envelope**: `{ success: boolean, data?: any, error?: { code?: string, message: string, details?: any } }`
- **HTTP status codes**: 200/201 for success, 204 for no-content, 400 for validation, 401/403 for auth, 404 for not-found, 409 for conflict, 422 for semantically invalid, 429 for rate limit, 500 for server error.
- **Auth**: JWT access tokens in `Authorization: Bearer <token>` header; refresh tokens in secure HTTP-only cookie (or endpoint-returned token if frontend manages it).
- **Content types**: `application/json`. File uploads: `multipart/form-data`.

**1) Authentication handlers (`auth.ts` client)**

- POST `/api/auth/signup`
    - Purpose: create account (user role default e.g., `user`)
    - Request: { name, email, password, [role?] }
    - Response: 201 { user, tokens: { accessToken, refreshToken } }
    - Behavior: validate, hash password (bcrypt/argon2), create user, send verification email (async).
- POST `/api/auth/login`
    - Request: { email, password }
    - Response: 200 { user, tokens }
    - Behavior: validate, compare password, issue JWT and refresh token, record lastLogin.
- POST `/api/auth/logout`
    - Request: refresh token (cookie or body)
    - Response: 200 success
    - Behavior: revoke refresh token (DB or token blacklist).
- POST `/api/auth/refresh`
    - Request: refresh token
    - Response: 200 { accessToken, refreshToken? }
    - Behavior: verify refresh token, rotate token, issue new access token.
- POST `/api/auth/forgot-password`
    - Request: { email }
    - Response: 200
    - Behavior: generate password reset token, email link (no leak of account existence).
- POST `/api/auth/reset-password`
    - Request: { token, newPassword }
    - Response: 200
    - Behavior: validate token, set new hashed password, revoke active sessions if needed.
- GET `/api/auth/me`
    - Auth required
    - Response: 200 { user }
    - Behavior: return current user profile and roles/permissions.

**2) Users handlers (`users.ts` client)**

- GET `/api/users` (admin only)
    - Query: pagination (page, limit), search, sort, filter by role/status
    - Response: 200 { items: [], meta: { total, page, limit } }
- POST `/api/users` (admin)
    - Create user (admin creates other users)
    - Request: { name, email, role, ... }
    - Response: 201 { user }
- GET `/api/users/:id`
    - Auth: admin or owner
    - Response: 200 { user }
- PUT `/api/users/:id`
    - Auth: admin or owner (restricted fields)
    - Request: partial update
    - Response: 200 { user }
- DELETE `/api/users/:id` (admin)
    - Response: 204
    - Behavior: soft-delete preferred; audit trail.
- PATCH `/api/users/:id/password` (owner or admin)
    - Request: { currentPassword?, newPassword }
    - Response: 200

**3) Patients handlers (`patients.ts` client)**

- GET `/api/patients`
    - Query: pagination, search (name, id), filters (dob, gender), sort
    - Response: 200 { items, meta }
- POST `/api/patients`
    - Request: patient demographic payload (name, dob, contact, address, identifiers, notes)
    - Response: 201 { patient }
    - Behavior: optional attachments (file upload), deduplication/identifier checks.
- GET `/api/patients/:id`
    - Response: 200 { patient, relatedRecords? }
- PUT `/api/patients/:id`
    - Request: full update or partial (PATCH)
    - Response: 200 { patient }
- DELETE `/api/patients/:id`
    - Response: 204 (soft-delete), with audit log
- Additional:
    - GET `/api/patients/:id/appointments`
    - GET `/api/patients/search` (advanced fuzzy search)
    - POST `/api/patients/:id/attachments` for file uploads

**4) Services handlers (`services.ts` client)**

- GET `/api/services`
    - List services offered (pagination optional)
    - Response: 200 { items }
- POST `/api/services` (admin)
    - Create service (name, code, duration, price, department, active)
    - Response: 201 { service }
- GET `/api/services/:id`, PUT, DELETE similar to users (admin-only where appropriate)

**5) Appointments handlers (`appointments.ts` client)**

- GET `/api/appointments`
    - Query: date range, provider, patientId, status, paging
    - Response: 200 { items, meta }
- POST `/api/appointments`
    - Request: { patientId, serviceId, providerId, startTime, endTime?, notes, status }
    - Response: 201 { appointment }
    - Behavior: validate service duration, check provider availability (conflict detection), transactional creation.
- GET `/api/appointments/:id`
    - Response: 200 { appointment }
- PUT `/api/appointments/:id` / PATCH
    - Update appointment (reschedule, cancel)
    - Behavior: conflict checks, send notifications on change.
- POST `/api/appointments/:id/cancel`
    - Request: { reason }
    - Response: 200
    - Behavior: set status, optionally free slot, trigger notifications.
- POST `/api/appointments/:id/confirm` / `/check-in` etc.
- Background jobs: reminders (email/SMS), status transitions.

**6) Misc / index / client handlers (`api.ts`, `index.ts`, `client.ts`)**

- Provide root metadata: GET `/api/` or `/api/meta` for version, health, available endpoints (optional).
- Health check: GET `/api/health` returns service ready/info.

**7) Cross-cutting concerns**

- Validation: use schema validation (Joi, Zod, Yup) per endpoint; return standardized 422/400 errors with field messages.
- Auth & RBAC:
    - Roles: `admin`, `staff`, `user` (example).
    - Middleware: `authenticateJWT`, `authorize(...roles|permissions)`.
    - Protect sensitive fields (e.g., password).
- Rate limiting & brute-force protection:
    - Global rate limit and per-route (esp. login, password reset).
- Security:
    - Hash passwords (bcrypt/argon2) with proper cost.
    - Use HTTPS, set secure cookie flags, CORS configured for client origin.
    - Input sanitization and parameterized DB queries to prevent injection.
- Session & token management:
    - Store refresh tokens (DB or Redis) with rotation and revocation support.
- Logging & monitoring:
    - Structured logs (request id, user id, route), error stack traces to Sentry/Log service, metrics (Prometheus).
- Error handling:
    - Centralized error handler middleware, map known errors to status codes and consistent messages.
- Auditing:
    - Audit user actions (create/update/delete) for `patients`, `appointments`, `users`.
- Transactions:
    - Use DB transactions for multi-step operations (appointment booking, patient merges).
- File storage:
    - Attachments stored in S3-compatible storage or blob store; store metadata in DB. Validate file types and sizes.
- Background processing:
    - Queue (BullMQ/Redis, or similar) for email, SMS, reminders, heavy tasks.
- Testing:
    - Unit tests for controllers, integration tests for critical flows (auth, appointment booking).
- Data privacy & retention:
    - Soft deletes, GDPR-ready export and delete endpoints for user data.

**8) Data model sketch (minimum fields)**

- User: id, name, email (unique), passwordHash, role, status, createdAt, updatedAt, lastLogin
- Patient: id, name, dob, gender, contact, identifiers[], address, notes, createdBy, createdAt, updatedAt, deletedAt
- Service: id, name, code, durationMinutes, price, department, active
- Appointment: id, patientId, serviceId, providerId, startTime, endTime, status (booked/confirmed/cancelled/completed), createdBy, createdAt, updatedAt
- Token store: refreshToken, userId, expiresAt, revoked

**9) Example Express handler signatures**

- app.post('/api/auth/login', validateLogin, async (req, res) => { /_ verify, issue tokens _/ })
- app.get('/api/patients', authenticate, authorize(['staff','admin']), validateQuery, async (req, res) => { /_ list _/ })
- app.post('/api/appointments', authenticate, authorize(['staff','admin','user']), validateAppointment, async (req, res) => { /_ availability check + create in transaction _/ })

**10) Operational & deployment**

- Environment: Node 18+, use process.env for secrets
- DB: Postgres (recommended) with migrations (knex/TypeORM/Prisma)
- Caching: Redis for rate-limit, sessions, queues
- CI/CD: run tests, lint, deploy containerized service
- Secrets: store in vault or CI secrets; rotate periodically.

**11) API documentation & contracts**

- Provide OpenAPI (Swagger) spec matching the handlers.
- Include example requests/responses in `docs` or inline route comments.
- Versioning: prefix routes with `/api/v1` if future-breaking changes expected.

**Acceptance criteria**

- Frontend `src/api/*.ts` clients can call routes as documented and receive expected status codes and response envelopes.
- Auth flows (signup/login/refresh/logout, forgot/reset) fully implemented and secure.
- CRUD operations for `users`, `patients`, `services`, `appointments` implemented with validation, RBAC, and transactional safety where needed.
- Background tasks (email reminders) offloaded to queueing system.
- Logging, monitoring, and error handling present.
- OpenAPI spec generated and sample Postman collection available.
