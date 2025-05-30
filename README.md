# FibreFlow Project Management System

A comprehensive fiber optic infrastructure management system built with Next.js and Supabase.

## Project Structure

```
FibreFlow/
├── scripts/                    # Database & Testing Tools (42 files)
│   ├── database/              # Database connection & setup (16 scripts)
│   ├── migration/             # SQL migrations & data import (12 scripts)
│   └── testing/               # Connection & API tests (14 scripts)
├── docs/                      # Project documentation (8 files)
├── project-management-app/    # Main Next.js application (81 source files)
│   ├── src/                   # Application source code
│   ├── docs/                  # App-specific documentation  
│   ├── scripts/               # App testing utilities
│   └── supabase/              # Database migrations
├── tools/                     # Development utilities
├── package.json              # Root dependencies (database tools)
└── .env                      # Environment configuration
```

## Architecture Overview

This project uses a **monorepo structure** with clear separation of concerns:

- **Root Level**: Database tooling, migrations, and project coordination
- **App Level**: Frontend project management interface and app-specific utilities
- **Dual Package Management**: Separate dependency management for database tools vs frontend

## Quick Start

### Database Operations
```bash
# Test database connection
cd scripts/database && node config.js

# Run migrations  
cd scripts/migration && node import-data.js

# Test connections
cd scripts/testing && node test-connection.js
```

### Application Development
```bash
cd project-management-app
npm install
npm run dev         # Start development server
npm run build       # Build for production
npm run lint        # Run linting
```

## Documentation

- **File Structure Guidelines**: `docs/claude.md`
- **Database Schema**: `docs/SCHEMA.md` 
- **Collaboration Guide**: `docs/COLLABORATION.md`
- **Project Plan**: `docs/FiberFlow-Project-Plan.md`

## Performance Targets

- Response Time: < 50ms
- Memory Usage: < 76MB
- Built with React Query caching and feature flags

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Supabase, PostgreSQL
- **State Management**: React Query
- **Charts**: Nivo, Recharts
- **UI Components**: Headless UI, Heroicons