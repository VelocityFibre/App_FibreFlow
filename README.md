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

- **Implementation Roadmap**: `docs/IMPLEMENTATION_ROADMAP.md` 📋
- **Project Management Module**: `docs/PROJECT_MANAGEMENT_MODULE_SPEC.md` 🏗️
- **Team Labor Division**: `docs/TEAM_LABOR_DIVISION.md` 👥
- **Immediate Tasks**: `docs/IMMEDIATE_TASKS.md` 🚀
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
- **Real-time**: Supabase Realtime subscriptions
- **Charts**: Nivo, Recharts
- **UI Components**: Headless UI, Heroicons

## ✨ Key Features

### 🏗️ Project Management Hierarchy (NEW!)
- **4-Level Structure**: Project → Phases → Steps → Tasks with complete visualization
- **Status Tracking**: Color-coded progress indicators across all hierarchy levels  
- **Phase Types**: Planning, IP, WIP, Handover, HOC, FAC with specialized workflows
- **Smart Progress**: Automatic progress calculation and rollup across project levels
- **Expandable Views**: Collapsible hierarchy for optimal screen real estate

### ⚡ Real-time Collaboration
- **Live Updates**: Project changes sync instantly across all connected users
- **Presence Tracking**: See who's viewing/editing projects and tasks in real-time
- **Smart Notifications**: Real-time alerts for task assignments, phase progressions, and comments
- **Collaborative Editing**: Conflict prevention when multiple users edit the same items
- **Automatic Reconnection**: Robust connection handling with exponential backoff

### 🗃️ Data Management
- **Soft Delete System**: Archive/restore functionality with full audit trails
  - Safe deletion with recovery options across all entity types
  - Bulk archive/restore operations with 100-record safety limits
  - Comprehensive test suite with 9 test scenarios and performance benchmarking
  - Query filtering utilities: `excludeArchived()`, `onlyArchived()`, `includeArchived()`
- **Performance Optimized**: <50ms response times with React Query caching
- **Audit Logging**: Comprehensive change tracking across all operations