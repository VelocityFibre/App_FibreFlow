# FibreFlow Collaboration Plan

## Overview
This document outlines our strategy for collaborative development on the FibreFlow project, focusing on modular architecture, API-driven development, and GitHub workflow best practices.

## Table of Contents
1. [GitHub Collaboration Workflow](#1-github-collaboration-workflow)
2. [API-Driven Modular Architecture](#2-api-driven-modular-architecture)
3. [Feature Flags for Collaborative Development](#3-feature-flags-for-collaborative-development)
4. [Monorepo Structure](#4-monorepo-structure)
5. [GitHub Actions for CI/CD](#5-github-actions-for-cicd)
6. [Database Change Management](#6-database-change-management)
7. [Implementation Plan](#7-implementation-plan)

## 1. GitHub Collaboration Workflow

### Branch Protection Rules
- Set up branch protection for `main` branch
- Require pull request reviews before merging
- Require status checks to pass before merging
- Consider using GitHub Actions for automated testing

### GitHub Issues for Task Management
- Create issues for features/bugs
- Use labels for categorization (e.g., `database`, `frontend`, `api`)
- Link issues to pull requests
- Use milestones for tracking progress

### GitHub Projects
- Set up a project board for visual task management
- Track work in progress
- Assign tasks to team members

## 2. API-Driven Modular Architecture

### Backend API Layer

Create a dedicated API layer that serves as the contract between frontend and backend:

```
/src/app/api
  ├── customers/
  │   ├── route.ts       # GET/POST/PUT for customers
  │   └── [id]/route.ts  # Operations on a specific customer
  ├── projects/
  │   ├── route.ts
  │   └── [id]/route.ts
  └── audit-logs/
      └── route.ts
```

This way:
- Team members can work on different APIs independently
- The API contract remains stable even if the underlying implementation changes
- Each API endpoint can be tested independently

### Example API Implementation

```typescript
// src/app/api/projects/route.ts
import { NextResponse } from 'next/server';
import { createProject, getProjects } from '@/lib/projectUtils';

export async function GET() {
  const projects = await getProjects();
  return NextResponse.json(projects);
}

export async function POST(request) {
  const data = await request.json();
  const result = await createProject(data);
  return NextResponse.json(result);
}
```

### Frontend Service Layer

Create a service layer that consumes these APIs:

```typescript
// src/services/projectService.ts
export async function fetchProjects() {
  const response = await fetch('/api/projects');
  return response.json();
}

export async function createProject(projectData) {
  const response = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData)
  });
  return response.json();
}
```

## 3. Feature Flags for Collaborative Development

Implement feature flags to enable/disable features in development:

```typescript
// src/config/features.ts
export const FEATURES = {
  NEW_CUSTOMER_FORM: process.env.NEXT_PUBLIC_FEATURE_NEW_CUSTOMER_FORM === 'true',
  PROJECT_PHASES: process.env.NEXT_PUBLIC_FEATURE_PROJECT_PHASES === 'true',
};
```

This allows you to:
- Merge incomplete features without affecting production
- Test new features in isolation
- Gradually roll out changes

## 4. Monorepo Structure

Consider restructuring as a monorepo using npm workspaces:

```
/
├── packages/
│   ├── database/       # Database utilities and migrations
│   ├── api/            # API endpoints
│   ├── ui/             # Shared UI components
│   └── core/           # Core business logic
└── apps/
    └── web/            # Next.js web application
```

Benefits:
- Clear separation of concerns
- Independent versioning of components
- Easier to test in isolation
- Can be deployed separately

## 5. GitHub Actions for CI/CD

Set up GitHub Actions workflows:

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
```

```yaml
# .github/workflows/database-check.yml
name: Database Schema Check
on: [push, pull_request]
jobs:
  check-schema:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: node scripts/check-schema.js
```

## 6. Database Change Management

### Migration Scripts
- Create numbered migration scripts (like `001_create_customers.sql`, `002_add_customer_fields.sql`)
- Document each change with comments
- Store these in a dedicated `/migrations` directory
- Run migrations in sequence when pulling new changes

Example structure:
```
/migrations
  ├── 001_initial_schema.sql
  ├── 002_add_customer_id_to_projects.sql
  └── 003_create_audit_logs.sql
```

### Schema Documentation
- Create a `schema.md` file documenting all tables, their relationships, and required fields
- Update this document whenever schema changes are made
- Include diagrams if possible (using tools like dbdiagram.io)

### Pull Request Templates
Create a PR template that requires documenting database changes:

```markdown
## Changes
- [x] Code changes
- [ ] Database schema changes

## Database Changes
<!-- If you made database changes, describe them here -->
```

## 7. Implementation Plan

1. **First Phase: API Layer**
   - Create API routes for existing functionality
   - Update frontend to use these APIs
   - Document API contracts in README files

2. **Second Phase: Modularization**
   - Move business logic to dedicated utility files
   - Create service layer for frontend
   - Add feature flags for in-progress work

3. **Third Phase: CI/CD**
   - Set up GitHub Actions for testing
   - Implement database schema validation
   - Create PR templates and documentation

## Immediate Next Steps

1. Create the consolidated schema for the projects table
2. Document the current schema in a `schema.md` file
3. Move database operations to utility files
4. Set up a proper migration system
5. Establish a code review process with your collaborator

## Resources

- [Next.js API Routes Documentation](https://nextjs.org/docs/api-routes/introduction)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Feature Flags Best Practices](https://launchdarkly.com/blog/best-practices-feature-flags/)
- [Monorepo Tools](https://monorepo.tools/)