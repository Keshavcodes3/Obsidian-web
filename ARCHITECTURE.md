# 🏛️ Lattice Architecture

> **Version:** 1.0.0
>
> This document defines the architecture, engineering principles, coding conventions, and development guidelines for Lattice.

---

# Philosophy

Lattice follows a **Modular Monolith Architecture**.

The goal is to create a backend that is:

* Scalable
* Maintainable
* Testable
* Extensible
* Production Ready

Every module is treated as an independent subsystem with clear boundaries.

The architecture is designed so modules can later be extracted into microservices with minimal changes.

---

# Architecture Overview

```
                Client
                   │
                   ▼
              Route Layer
                   │
                   ▼
            Controller Layer
                   │
                   ▼
             Service Layer
                   │
                   ▼
          Repository Layer
                   │
                   ▼
               MongoDB
```

---

# Layer Responsibilities

## Route

Responsible for

* Registering endpoints
* Applying middleware
* Authentication
* Authorization
* Validation

Routes should never contain business logic.

---

## Controller

Responsible for

* Reading request
* Calling service
* Returning response

Controllers should remain extremely thin.

Example:

```ts
export const createNote = asyncHandler(async (req, res) => {
    const note = await noteService.create(req.user.id, req.body);

    return ApiResponse.created(res, note);
});
```

---

## Service

This is the heart of the application.

Responsible for

* Business rules
* Validation
* Permission checks
* Transactions
* Events

Services should never know about Express.

Services should only work with data.

---

## Repository

Responsible for

* Database queries
* Aggregations
* Pagination
* Search

Repositories should never contain business rules.

---

## Database

MongoDB only stores data.

No business logic belongs inside schemas.

---

# Dependency Rule

Allowed

```
Route
 ↓
Controller
 ↓
Service
 ↓
Repository
 ↓
Database
```

Forbidden

```
Repository → Service
Controller → Repository
Route → Repository
Controller → Database
```

---

# Module Independence

Every module owns everything related to itself.

Example

```
note/

controllers/
services/
repositories/
routes/
models/
dto/
validators/
events/
policies/
constants/
utils/
```

No module should access another module's repository.

Instead

```
GraphService

↓

NoteService

↓

NoteRepository
```

Never

```
GraphRepository

↓

NoteRepository
```

---

# Module Communication

Modules communicate using either

## Direct Service Calls

Used when immediate response is required.

Example

```
WorkspaceService

↓

VaultService
```

---

## Events

Used when the action is asynchronous.

Example

```
NoteCreated

↓

Graph

↓

Search

↓

Analytics

↓

History
```

The publisher should never know who consumes the event.

---

# Common Folder

Only generic code belongs here.

```
common

errors
responses
middleware
helpers
validators
constants
types
logger
enums
interfaces
decorators
utils
```

No feature-specific logic belongs here.

---

# Configuration

Everything configurable belongs inside

```
config/

env.ts
database.ts
jwt.ts
redis.ts
logger.ts
cors.ts
helmet.ts
storage.ts
queue.ts
```

Never hardcode secrets.

---

# Error Handling

Every error extends

```
ApiError
```

Example

```
ValidationError

UnauthorizedError

ForbiddenError

ConflictError

NotFoundError
```

Errors are handled globally.

No try/catch inside controllers unless necessary.

---

# Response Format

Every API returns

```json
{
  "success": true,
  "message": "Note created successfully.",
  "data": {}
}
```

Errors

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": []
}
```

---

# Naming Convention

Folders

```
kebab-case
```

Files

```
note.controller.ts

note.service.ts

note.repository.ts
```

Variables

```
camelCase
```

Classes

```
PascalCase
```

Constants

```
UPPER_SNAKE_CASE
```

Enums

```
PascalCase
```

Interfaces

```
INote

IUser

IVault
```

---

# Folder Rules

Never create

```
utils.ts
helper.ts
service.ts
```

Always create descriptive names

```
note-search.service.ts

create-note.service.ts

restore-note.service.ts
```

Small files are preferred over huge files.

---

# Validation

Validation occurs before services.

Libraries

* Zod

DTO should never contain business logic.

---

# Logging

Every request receives

* Request ID
* User ID
* Response Time

Use structured logging.

Never use

```ts
console.log()
```

---

# Authentication

JWT Access Token

JWT Refresh Token

Cookies preferred.

Every protected route must pass through

```
Auth Middleware

↓

Permission Middleware

↓

Controller
```

---

# Authorization

RBAC

Example

```
Owner

Admin

Editor

Viewer
```

Permissions should live inside policies.

---

# Events

Naming

```
note.created

note.updated

note.deleted

workspace.created

vault.created
```

Past tense.

Not

```
create-note
```

---

# Background Jobs

BullMQ

Queues

```
email

analytics

search-index

cleanup

notifications

thumbnails
```

Never block the request waiting for jobs.

---

# Caching

Redis

Examples

* Search
* Recent Notes
* Graph
* Templates

Cache invalidation should happen through events.

---

# Search

Repository performs search.

Search service ranks results.

Future

* MongoDB Atlas Search
* Elasticsearch
* Meilisearch

---

# Versioning

Every note update creates

```
Revision

↓

Snapshot

↓

History
```

Restoring a revision creates a new version.

Never overwrite history.

---

# Security

Helmet

Rate Limiter

Input Validation

XSS Protection

CORS

CSRF Protection

Secure Cookies

Password Hashing

Refresh Token Rotation

Audit Logs

---

# Testing Strategy

```
Unit Tests

↓

Integration Tests

↓

End-to-End Tests
```

Business logic should be tested before controllers.

---

# Git Strategy

Feature Branches

```
feature/auth

feature/graph

feature/search

feature/canvas
```

Bug Fixes

```
fix/auth

fix/editor

fix/cache
```

---

# Commit Convention

```
feat:

fix:

refactor:

perf:

docs:

test:

chore:

style:

ci:
```

Example

```
feat(note): implement note versioning

fix(search): improve ranking algorithm

refactor(graph): optimize traversal
```

---

# Engineering Principles

* Thin Controllers
* Fat Services
* Clean Repositories
* Modular Features
* Single Responsibility
* Explicit Naming
* No Circular Dependencies
* Composition over Inheritance
* Event-Driven Where Appropriate
* Keep Modules Independent
* Optimize for Readability First
* Build for the Next Developer

---

# Final Rule

> **Every line of code should make the next feature easier to build, not harder.**

Lattice is not just another clone. It is a long-term engineering project designed to explore clean architecture, scalable backend systems, and thoughtful software design.
