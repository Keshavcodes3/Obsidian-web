# Workspace Module

The Workspace module is responsible for managing workspaces within Lattice.

A workspace represents the highest level container in the application. Every vault, note, folder, member, and future collaboration feature belongs to a workspace.

---

# Responsibilities

The Workspace module handles:

- Creating workspaces
- Updating workspace information
- Deleting workspaces
- Fetching user workspaces
- Managing workspace ownership
- Workspace settings
- Publishing workspace events

---

# Architecture

```
Route
    ↓
Controller
    ↓
Service
    ↓
Repository
    ↓
MongoDB
```

The module follows the Modular Monolith architecture.

Business logic never exists inside controllers or repositories.

---

# Folder Structure

```
workspaces/

├── controllers/
├── dtos/
├── enums/
├── events/
├── models/
├── repositories/
├── routes/
├── services/
├── types/
├── utils/
├── validators/
└── policies/
```

---

# Database Model

Workspace

```
Workspace
│
├── _id
├── name
├── slug
├── description
├── ownerId
├── visibility
├── members[]
├── settings{}
├── createdAt
└── updatedAt
```

Member

```
WorkspaceMember

userId
role
joinedAt
```

Settings

```
WorkspaceSettings

allowInvites
defaultVaultName
```

---

# Relationships

```
User
 │
 │ owns
 ▼
Workspace
 │
 ├── Members
 ├── Vaults
 ├── Settings
 └── Invitations (Future)
```

Future

```
Workspace
    │
    ├── Vaults
    │      └── Notes
    │
    ├── Members
    │
    ├── Invitations
    │
    └── Analytics
```

---

# API Endpoints

## Create Workspace

```
POST /api/v1/workspaces
```

Creates a new workspace.

---

## Get My Workspaces

```
GET /api/v1/workspaces
```

Returns all workspaces owned by the authenticated user.

---

## Get Workspace

```
GET /api/v1/workspaces/:workspaceId
```

Returns a single workspace.

---

## Update Workspace

```
PATCH /api/v1/workspaces/:workspaceId
```

Updates workspace information.

---

## Delete Workspace

```
DELETE /api/v1/workspaces/:workspaceId
```

Deletes a workspace.

---

# Business Rules

- Every workspace has exactly one owner.
- Workspace names are normalized before storage.
- Every workspace receives a unique slug.
- Creator automatically becomes the OWNER.
- Default settings are initialized during creation.
- Only authorized users may modify or delete a workspace.
- Workspace creation publishes an event.

---

# Events

Published events

```
workspace.created
workspace.updated
workspace.deleted
```

Example

```
Workspace Created

        │
        ▼
workspace.created

        │
        ├── Create Default Vault
        ├── Analytics
        ├── Notifications
        └── Audit Log
```

The Workspace module never knows which modules consume its events.

---

# Repository Responsibilities

Repositories only perform database operations.

Examples

- create()
- findById()
- findBySlug()
- findByOwner()
- updateById()
- deleteById()

Repositories never:

- Generate slugs
- Validate permissions
- Publish events
- Contain business logic

---

# Service Responsibilities

Services contain business logic.

Examples

- Normalize workspace names
- Generate unique slugs
- Initialize default settings
- Assign owner
- Publish events
- Validate business rules

---

# Controller Responsibilities

Controllers remain thin.

Responsibilities

- Read request
- Call service
- Return ApiSuccess
- Delegate errors

Controllers never contain business logic.

---

# Utilities

Current utilities

```
generateSlug.ts
normalizeWorkspaceName.ts
```

Utilities must remain pure functions.

They never access:

- Database
- Events
- Services

---

# Future Features

- Workspace Invitations
- Member Management
- Role Management
- Workspace Templates
- Archive Workspace
- Restore Workspace
- Workspace Analytics
- Audit Logs
- Shared Workspaces
- Workspace Activity Feed

---

# Design Principles

- Modular Monolith
- Thin Controllers
- Rich Services
- Small Repositories
- Event Driven Communication
- Explicit Dependencies
- No Cross Repository Access
- Production Grade Architecture

---

# Future Module Communication

```
Workspace Created

        │
        ▼
workspace.created

        │
        ├── Vault Module
        │      └── Create Default Vault
        │
        ├── Notification Module
        │
        ├── Analytics Module
        │
        └── History Module
```

The Workspace module only publishes events.

Consumers decide how to react.
