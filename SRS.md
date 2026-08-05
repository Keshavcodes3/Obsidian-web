# 📑 Software Requirements Specification (SRS)

# Lattice

**Version:** 1.0.0

---

# 1. Introduction

## 1.1 Purpose

This Software Requirements Specification (SRS) defines the functional and non-functional requirements for **Lattice**, a web-first knowledge management platform inspired by connected note-taking applications.

This document serves as the single source of truth for the project and guides design, development, testing, and future enhancements.

---

## 1.2 Goals

Lattice aims to provide users with a powerful environment for creating, organizing, connecting, and visualizing knowledge.

The platform focuses on:

* Fast note-taking
* Knowledge graphs
* Markdown editing
* Structured databases
* Visual canvases
* Powerful search
* Productivity workflows

---

## 1.3 Scope

Users can:

* Create notes
* Organize notes into folders
* Connect notes
* Visualize relationships
* Search instantly
* Build databases
* Create templates
* Use keyboard-first workflows

Future versions will include:

* Collaboration
* Plugin system
* AI features
* Publishing
* Offline sync

---

# 2. Stakeholders

## Primary Users

* Students
* Developers
* Researchers
* Writers
* Teams
* Knowledge Workers

---

# 3. Functional Requirements

---

## Authentication

### User Registration

The system shall allow users to create accounts.

Requirements

* Email
* Password
* Email verification
* Password hashing

---

### Login

The system shall authenticate users using JWT.

Requirements

* Access Token
* Refresh Token
* Secure Cookies
* Session Management

---

### Password Reset

Users shall reset passwords using email verification.

---

# Workspace Module

Users shall manage multiple workspaces.

Requirements

* Create Workspace
* Rename Workspace
* Delete Workspace
* Invite Members
* Workspace Settings

---

# Vault Module

Requirements

* Create Vault
* Rename Vault
* Delete Vault
* Archive Vault

---

# Folder Module

Requirements

* Nested folders
* Move folders
* Rename folders
* Delete folders

Unlimited nesting.

---

# Notes Module

Requirements

* Create Note
* Update Note
* Delete Note
* Archive Note
* Favorite Note
* Pin Note
* Duplicate Note
* Move Note

---

# Markdown Editor

Requirements

* Markdown Support
* Live Preview
* Auto Save
* Code Blocks
* Tables
* Images
* Lists
* Checklists

---

# Wiki Links

Requirements

Users can create

```text
[[Backend]]
```

The system shall

* Resolve links
* Create backlinks
* Suggest notes
* Detect broken links

---

# Graph View

Requirements

Display

* Notes
* Connections
* Clusters
* Linked Notes

Users can

* Zoom
* Pan
* Filter
* Highlight

---

# Search

Requirements

* Instant Search
* Fuzzy Search
* Full Text Search
* Search by Tag
* Search by Folder
* Search by Property

---

# Templates

Requirements

* Create Template
* Edit Template
* Apply Template

---

# Daily Notes

Requirements

* Automatic Daily Note
* Calendar Navigation
* Previous / Next Day

---

# Command Palette

Requirements

Users shall execute commands using keyboard shortcuts.

Example

* Create Note
* Delete Note
* Search
* Open Graph
* Open Canvas

---

# Quick Switcher

Requirements

Users shall instantly switch between notes.

Keyboard Shortcut

```text
Ctrl + O
```

---

# Canvas

Requirements

Users can

* Add Cards
* Connect Cards
* Drag Cards
* Zoom
* Pan

---

# Bases

Requirements

Support

* Table View
* Kanban View
* Gallery View
* Calendar View

Properties

* Text
* Number
* Date
* Boolean
* Select
* Multi Select
* Relation

---

# Attachments

Requirements

Upload

* Images
* PDFs
* Videos
* Audio

---

# Version History

Requirements

Every save creates a revision.

Users can

* Compare
* Restore
* Delete revisions

---

# Notifications

Requirements

System notifications

Future

Team notifications

---

# Settings

Requirements

* Theme
* Font
* Language
* Shortcuts
* Editor Preferences

---

# Analytics

Requirements

Track

* Notes Created
* Daily Activity
* Writing Time
* Graph Size
* Vault Statistics

---

# 4. Non-Functional Requirements

## Performance

* API Response < 300ms
* Search < 150ms
* Graph Rendering < 1 second

---

## Scalability

Support

* Millions of Notes
* Thousands of Vaults
* Horizontal Scaling

---

## Security

* JWT
* Refresh Tokens
* Password Hashing
* Rate Limiting
* Helmet
* CORS
* Input Validation
* Secure Cookies

---

## Reliability

Target uptime

99.9%

---

## Maintainability

Architecture

Modular Monolith

Every feature must remain independently maintainable.

---

## Testability

Coverage goals

* Unit Tests
* Integration Tests
* End-to-End Tests

---

## Accessibility

Support

* Keyboard Navigation
* Screen Readers
* High Contrast
* Responsive Design

---

# 5. Assumptions

* Stable internet connection
* Modern browser
* JavaScript enabled

---

# 6. Constraints

* Web-first platform
* MongoDB database
* Express.js backend
* React frontend
* TypeScript across the stack

---

# 7. Future Enhancements

* Plugin SDK
* AI Assistant
* Semantic Search
* Collaboration
* Offline Mode
* Mobile Applications
* Public Publishing
* Marketplace
* Webhooks
* Integrations

---

# 8. Success Criteria

The project will be considered successful when:

* Users can manage multiple vaults
* Markdown editing is stable
* Wiki links and backlinks work reliably
* Graph View accurately represents note relationships
* Search is fast and relevant
* The architecture remains modular and maintainable
* The application is suitable for daily use

---

# 9. Revision History

| Version | Date    | Description     |
| ------- | ------- | --------------- |
| 1.0.0   | Initial | First SRS Draft |

---

> **Guiding Principle:** Build a web-first knowledge management platform that is fast, modular, extensible, and enjoyable to use while maintaining production-grade engineering standards.
