# FibreFlow Codebase Context Document

## 🎯 Purpose
This document serves as a comprehensive reference for understanding the FibreFlow codebase architecture, patterns, and implementation details for efficient development and maintenance.

## 🏗️ Architecture Overview

### Technology Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript 5.8
- **Styling**: Tailwind CSS 4.1 with custom CSS variables
- **Database**: Supabase (PostgreSQL) with real-time capabilities
- **State Management**: TanStack React Query v5 for server state
- **Charts**: Nivo, Recharts, D3.js for analytics
- **UI Components**: Headless UI, React Icons, React Hot Toast
- **Build**: Next.js with TypeScript strict mode

### Core Design Principles
- **Modular Architecture**: Feature-based organization
- **Performance First**: <50ms response targets, React Query caching
- **Type Safety**: Comprehensive TypeScript implementation
- **Progressive Enhancement**: Feature flag-driven development
- **Audit Trail**: Complete operation logging
- **Soft Delete**: Never permanently delete data

## 📁 Project Structure

```
FibreFlow/
├── project-management-app/          # Main Next.js application
│   ├── src/
│   │   ├── app/                     # Next.js 15 App Router pages
│   │   │   ├── admin/               # Administrative features
│   │   │   ├── analytics/           # Analytics with dedicated layout
│   │   │   ├── projects/            # Core project management
│   │   │   │   └── [id]/            # Dynamic project routes
│   │   │   ├── dashboard/           # Main dashboard
│   │   │   └── [other-modules]/     # Feature modules
│   │   ├── components/              # Reusable UI components
│   │   │   ├── analytics/           # Chart components library
│   │   │   └── [shared]/            # Common components
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── lib/                     # Core utilities & business logic
│   │   └── contexts/                # React contexts
│   ├── public/                      # Static assets
│   └── [config files]               # Next.js, TypeScript, Tailwind configs
├── docs/                            # Project documentation
├── scripts/                         # Database & utility scripts
└── [project files]                 # Package.json, README, etc.
```

## 🔧 Core Systems & Patterns

### 1. State Management Strategy

**Server State (TanStack React Query)**:
```typescript
// Standard query configuration
const queryConfig = {
  staleTime: 5 * 60 * 1000,      // 5 minutes
  gcTime: 10 * 60 * 1000,        // 10 minutes (was cacheTime)
  retry: 3,
  refetchOnWindowFocus: false
}

// Conditional queries based on feature flags
const { data } = useQuery({
  queryKey: ['projects'],
  queryFn: fetchProjects,
  enabled: featureFlags.ProjectManagement
})
```

**Client State (React Hooks)**:
- `useState` for UI state (modals, forms, loading states)
- `useEffect` for side effects and cleanup
- Custom hooks for reusable stateful logic

### 2. Database Integration Patterns

**Supabase Client Setup**:
```typescript
// Located in src/lib/supabase.ts and src/lib/supabaseClient.ts
// Currently hardcoded credentials (needs environment variables)
const supabase = createClient(url, anonKey)
```

**Soft Delete Pattern**:
```typescript
// All tables include archived_at timestamp
interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
  archived_at: string | null  // NULL = active, timestamp = archived
}

// Query utilities
import { excludeArchived, onlyArchived } from '@/lib/softDelete'
const activeRecords = await excludeArchived(supabase.from('projects').select('*'))
```

**Audit Logging**:
```typescript
// Automatic audit trail for all operations
await createAuditLog(
  AuditAction.UPDATE,
  AuditResourceType.PROJECT,
  projectId,
  changes,
  userId
)
```

### 3. Component Architecture

**Layout Patterns**:
```typescript
// Standard module layout
<ModuleOverviewLayout
  title="Analytics Dashboard"
  description="Comprehensive project analytics and reporting"
  children={<DashboardContent />}
/>
```

**Theme Integration**:
```typescript
// CSS variables for consistent theming
:root {
  --primary: 0 48 73;        // #003049
  --secondary: 247 127 0;    // #f77f00
  --accent: 214 40 40;       // #d62828
}

// Tailwind classes use CSS variables
className="bg-primary text-primary-foreground"
```

### 4. Performance Monitoring

**Singleton Pattern**:
```typescript
// Located in src/lib/performance-monitor.ts
class PerformanceMonitor {
  private static instance: PerformanceMonitor
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }
  
  // Async measurement for API calls
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T>
  
  // Sync measurement for operations
  measureSync<T>(name: string, fn: () => T): T
}
```

### 5. Feature Flag System

**Simple Enum-Based Flags**:
```typescript
// Located in src/lib/feature-flags.ts
export const featureFlags = {
  ProjectManagement: true,
  Analytics: true,
  RealTimeNotifications: true,
  ErrorBoundaries: false,  // Not yet implemented
  AdminFeatures: true
} as const
```

## 🧩 Key Components Reference

### Project Management Hierarchy
```typescript
// 4-level structure: Project → Phases → Steps → Tasks
<ProjectHierarchyView 
  projectId={projectId} 
  defaultExpanded={true}
/>

// Individual components
<ProjectList />           // Lists all projects
<ProjectCard />          // Individual project card
<PhaseAccordion />       // Expandable phases
<StepContainer />        // Step visualization
<TaskCard />             // Task details with assignments
```

### Analytics Components
```typescript
// Chart library in src/components/analytics/charts/
<BarChart data={data} />
<LineChart data={data} />
<PieChart data={data} />
<GaugeChart value={percentage} />
<HeatMapChart data={matrix} />
<CalendarChart data={timeData} />
```

### Utility Components
```typescript
// Common patterns
<Sidebar />              // Feature-flag driven navigation
<ThemeToggle />          // Theme switching
<ErrorBoundary />        // Error handling (feature flagged)
<ModuleOverviewCard />   // Standard module cards
```

## 🔌 API Integration Patterns

### Database Operations
```typescript
// Standard CRUD with soft delete
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .is('archived_at', null)  // Exclude archived by default

// Archive instead of delete
await archiveRecord('projects', projectId, { reason: 'Completed' })

// Restore archived records
await unarchiveRecord('projects', projectId, { reason: 'Reactivated' })
```

### React Query Integration
```typescript
// Standard hook pattern
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .is('archived_at', null)
      
      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000
  })
}

// Mutation with optimistic updates
export function useUpdateProject() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateProjectFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    }
  })
}
```

## 🎨 Styling Conventions

### Tailwind CSS Patterns
```css
/* Common layout patterns */
.container-standard: "max-w-7xl mx-auto p-6"
.card-standard: "bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700"
.button-primary: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"

/* Theme-aware utilities */
.text-primary: "text-gray-900 dark:text-white"
.bg-surface: "bg-white dark:bg-gray-800"
.border-default: "border-gray-200 dark:border-gray-700"
```

### CSS Variable System
```css
/* Global theme variables */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 0 48 73;
  --primary-foreground: 210 40% 98%;
  /* ... additional theme variables */
}

[data-theme="dark"] {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark theme overrides */
}
```

## 📊 Data Models & Types

### Core Entities
```typescript
// Project hierarchy types
interface Project {
  id: string
  project_name: string
  customer_id?: string
  status: string
  start_date?: string
  created_at: string
  archived_at: string | null
}

interface ProjectPhase {
  id: string
  project_id: string
  phase_id: string
  status: string
  assigned_to?: string
  order_index: number
  archived_at: string | null
}

interface ProjectTask {
  id: string
  project_phase_id: string
  task_id: number
  status: string
  assigned_to?: string
  archived_at: string | null
}
```

### Audit System Types
```typescript
enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE', 
  DELETE = 'DELETE'
}

enum AuditResourceType {
  PROJECT = 'PROJECT',
  TASK = 'TASK',
  USER = 'USER',
  // ... other types
}
```

## 🧪 Testing Patterns

### Database Testing
```typescript
// Comprehensive test suites available
import { runComprehensiveSoftDeleteTests } from '@/lib/softDeleteTest'
import { TestDataGenerator } from '@/lib/softDeleteTest'

// Quick development testing
await quickSoftDeleteTest()

// Full test suite with reporting
const results = await runComprehensiveSoftDeleteTests()
```

### Performance Testing
```typescript
// Built-in performance monitoring
const monitor = PerformanceMonitor.getInstance()

// Measure async operations
const data = await monitor.measureAsync('fetchProjects', fetchProjects)

// Measure sync operations  
const result = monitor.measureSync('processData', () => processData(input))
```

## 🚀 Recent Implementations

### Major Features (May 2025)
1. **Project Hierarchy System**: Complete 4-level structure with RPC functions
2. **Real-time Collaboration**: Live updates, presence tracking, notifications
3. **Soft Delete Enhancement**: Comprehensive test suite with 9 scenarios
4. **Analytics Dashboard**: Feature-flagged with performance monitoring
5. **Theme System Overhaul**: CSS variables with custom theme support

### Current Implementation Status
- ✅ **Project Management**: Full hierarchy with CRUD operations
- ✅ **Real-time Features**: Supabase subscriptions with React Query integration
- ✅ **Soft Delete**: Production-ready with comprehensive testing
- ✅ **Analytics**: Performance-monitored charts and dashboards
- ✅ **Theme System**: Dark/light modes with custom branding
- 🚧 **Authentication**: Placeholder implementation (needs proper auth context)
- 🚧 **Error Boundaries**: Feature-flagged but not implemented

## ⚠️ Known Technical Debt

### Security & Configuration
- **Hardcoded Credentials**: Supabase URL/key need environment variables
- **Auth Context**: Currently using 'system' placeholder, needs proper implementation
- **Rate Limiting**: No current rate limiting for database operations

### Performance Opportunities
- **Code Splitting**: Consider React.lazy for large components
- **Bundle Optimization**: Potential for tree shaking improvements
- **Database Queries**: Watch for N+1 query patterns in hierarchy loading

### Code Quality Improvements
- **Naming Consistency**: Mix of PascalCase/camelCase in component files
- **Error Boundaries**: Feature-flagged but not implemented
- **Type Definitions**: Some `any` types could be more specific

### Architecture Enhancements
- **Feature Flag System**: Could be more robust (database-driven vs code-based)
- **Caching Strategy**: Consider Redis for high-frequency operations
- **Real-time Scaling**: Monitor Supabase real-time connection limits

## 📚 Development Guidelines

### Adding New Features
1. **Feature Flag First**: Add feature flag before implementation
2. **TypeScript Strict**: Maintain strict type checking
3. **Soft Delete Support**: All entities should support archiving
4. **Audit Logging**: Log all data changes
5. **Performance Monitoring**: Wrap expensive operations
6. **Test Coverage**: Include test scenarios for critical paths

### Code Conventions
```typescript
// File naming
components/ComponentName.tsx     // PascalCase for components
lib/utilityName.ts              // camelCase for utilities
hooks/useCustomHook.ts          // camelCase with 'use' prefix

// Import organization
import React from 'react'        // External libraries first
import { NextPage } from 'next'  // Framework imports
import { Component } from '@/components/Component'  // Internal imports (absolute paths)
import './styles.css'            // Styles last
```

### Database Conventions
```sql
-- Table naming: snake_case
CREATE TABLE project_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  archived_at TIMESTAMP NULL      -- Soft delete support
);

-- Index naming: idx_table_column
CREATE INDEX idx_projects_archived_at ON projects(archived_at);
```

## 🔧 Development Tools

### Key Scripts & Utilities
```bash
# Development
npm run dev                    # Start development server
npm run build                  # Production build
npm run lint                   # ESLint checking

# Database utilities (in scripts/ directory)
node scripts/database/config.js           # Test database connection
node scripts/testing/test-connection.js   # Comprehensive connection test
node scripts/migration/import-data.js     # Data migration utilities
```

### Testing Utilities
```typescript
// Quick tests for development
import { quickSoftDeleteTest } from '@/lib/softDeleteTest'
import { testDatabaseConnection } from '@/scripts/testing/test-connection'

// Performance monitoring
import { PerformanceMonitor } from '@/lib/performance-monitor'
const monitor = PerformanceMonitor.getInstance()
```

## 📈 Future Roadmap Considerations

### Planned Enhancements
- **AI-Powered Recommendations**: Task sequencing and resource allocation
- **GraphRAG Integration**: Natural language project queries with Neo4j
- **Advanced Analytics**: Predictive project completion and bottleneck analysis
- **Mobile Optimization**: Progressive Web App capabilities
- **Offline Support**: Service worker implementation for critical operations

### Scalability Considerations
- **Database Sharding**: For multi-tenant scaling
- **CDN Integration**: For global asset delivery
- **Microservices**: Consider breaking apart large modules
- **Caching Layer**: Redis for high-frequency data

This context document should serve as a comprehensive reference for understanding and working with the FibreFlow codebase efficiently. Keep it updated as the architecture evolves.