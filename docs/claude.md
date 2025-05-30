# FibreFlow Project - File Structure Guidelines

## Project Organization
This project follows a structured approach with two main components:
1. **Database/Migration Scripts** (root level)
2. **Next.js Application** (project-management-app/)

## File Structure Best Practices

### Current Directory Structure (Post-Reorganization)
```
FibreFlow/                          # Root project container
├── scripts/                        # Database & Testing Tools (42 files)
│   ├── database/                  # Database connection & setup (16 scripts)
│   ├── migration/                 # SQL migrations & data import (12 scripts)
│   └── testing/                   # Connection & API tests (14 scripts)
├── docs/                          # Project documentation (8 files)
├── tools/                         # Development utilities
├── backup/                        # Backup files  
├── project-management-app/        # Main Next.js application (81 source files)
│   ├── src/                       # Application source code
│   │   ├── app/                   # Next.js App Router pages
│   │   ├── components/            # Reusable UI components
│   │   ├── hooks/                 # Custom React hooks
│   │   └── lib/                   # Utilities & configurations
│   ├── docs/                      # App-specific documentation (6 files)
│   ├── scripts/                   # App testing utilities (9 files)
│   └── supabase/                  # Database migrations (2 files)
├── package.json                   # Root dependencies (database tools)
└── .env                          # Environment configuration
```

### AI Agent Guidelines

#### For Database Operations
- **Location**: All database scripts in `scripts/database/`
- **Testing**: All connection tests in `scripts/testing/`
- **Migrations**: All SQL files in `scripts/migration/`
- **Pattern**: Use existing Supabase patterns from `scripts/database/supabase-client.js`

#### For Application Development  
- **Location**: All app code in `project-management-app/src/`
- **Components**: Follow existing component patterns in `src/components/`
- **Performance**: Maintain sub-50ms response times
- **State**: Use React Query for all server state
- **Styling**: Use existing Tailwind patterns

#### Critical Rules for AI Agents

**File Placement Rules:**
- NEVER create files in root directory unless for database/migration purposes
- Database scripts → `scripts/database/` (16 existing scripts)
- Migration scripts → `scripts/migration/` (12 existing scripts)  
- Test scripts → `scripts/testing/` (14 existing scripts)
- App components → `project-management-app/src/components/`
- App utilities → `project-management-app/src/lib/`

**Code Pattern Rules:**
- ALWAYS use existing patterns from similar files
- ALWAYS check `scripts/database/supabase-client.js` for database connection patterns
- ALWAYS use React Query patterns from `project-management-app/src/lib/react-query.ts`
- ALWAYS follow component patterns in `project-management-app/src/components/`
- ALWAYS use feature flags for new functionality (see `project-management-app/src/lib/feature-flags.ts`)

**Performance Rules:**
- NEVER exceed performance budgets (50ms response, 76MB memory)
- ALWAYS use React Query for server state management
- ALWAYS implement optimistic updates for mutations
- ALWAYS include loading and error states

---

# Original Development Guidelines

Looking at this FibreFlow project management module plan through the lens of the Claude prompt engineering principles we discussed, I can suggest several improvements to make it more effective for Claude Code. Here's how to restructure it:

## 1. **Start with Identity and Stable Context**

```markdown
# FibreFlow Project Management Module - Development Specification

## System Identity
You are developing a project management module for FibreFlow, a fiber optic infrastructure management system.
- Stack: Next.js + Supabase + Tailwind CSS
- Current Performance: 92-93% optimization achieved, sub-50ms response times
- Memory Target: ~76MB usage
- Architecture: React Query caching, feature flags, PowerBI-like analytics
- Date: May 30, 2025

## Core Constraints (Never Violate)
- NEVER exceed 50ms response time for any user interaction
- NEVER store sensitive data in localStorage or sessionStorage
- NEVER implement features without feature flags
- NEVER break existing Supabase patterns or authentication
- NEVER create components outside the established design system
```

## 2. **Add Explicit Edge Cases and Failure Modes**

```markdown
## Critical Edge Cases

### IF user attempts to delete a phase with active tasks
THEN display error: "Cannot delete phase with active tasks. Archive or reassign tasks first."

### IF drag-and-drop would create circular dependencies
THEN prevent drop and show visual indicator: "This would create a circular dependency"

### IF offline mode is active during mobile task update
THEN queue changes locally and sync when connection restored

### IF AI recommendation confidence < 0.70
THEN do not auto-apply, only suggest with warning

### IF bulk operation affects > 100 items
THEN require explicit confirmation with count display
```

## 3. **Three-Tier Implementation Routing**

```markdown
## Implementation Decision Tree

### For each feature request, classify as:

1. **Core Features (Implement Immediately)**
   - Basic CRUD operations
   - Project hierarchy display
   - Status tracking
   - User assignments

2. **Enhanced Features (Implement + Flag)**
   - AI recommendations
   - Drag-and-drop reordering
   - Bulk operations
   - Real-time collaboration
   Flag these behind feature flags for gradual rollout

3. **Advanced Features (Design First, Implement Later)**
   - Weather integration
   - Predictive analytics
   - Automated scheduling
   - Mobile offline sync
   Create interfaces but stub implementations
```

## 4. **Show Right and Wrong Implementation Examples**

```markdown
## Implementation Examples

### ✅ CORRECT: Hierarchy Management
```typescript
// CORRECT: Use React Query for state management
const { data: projects, mutate } = useQuery({
  queryKey: ['projects', filters],
  queryFn: () => fetchProjects(filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// CORRECT: Optimistic updates with rollback
const moveTask = useMutation({
  mutationFn: updateTaskPosition,
  onMutate: async (newData) => {
    await queryClient.cancelQueries(['tasks']);
    const previous = queryClient.getQueryData(['tasks']);
    queryClient.setQueryData(['tasks'], optimisticUpdate);
    return { previous };
  },
  onError: (err, newData, context) => {
    queryClient.setQueryData(['tasks'], context.previous);
    toast.error('Failed to move task');
  }
});
```

### ❌ WRONG: Direct State Manipulation
```typescript
// WRONG: Don't use useState for server data
const [projects, setProjects] = useState([]);

// WRONG: Don't fetch without React Query
useEffect(() => {
  fetch('/api/projects').then(res => res.json()).then(setProjects);
}, []);

// WRONG: Don't mutate without optimistic updates
const moveTask = async (taskId, newPosition) => {
  await updateTaskPosition(taskId, newPosition);
  refetch(); // Creates loading state
};
```
```

## 5. **Binary Rules for Implementation**

```markdown
## Non-Negotiable Implementation Rules

### Database Operations
- ALWAYS use Supabase Row Level Security
- ALWAYS include created_at and updated_at timestamps
- NEVER delete records - use soft delete with archived_at
- ALWAYS validate foreign key constraints

### Component Creation
- ALWAYS extend existing Tailwind components
- NEVER create new color schemes - use existing palette
- ALWAYS include loading and error states
- NEVER render > 100 items without virtualization

### API Design
- ALWAYS return data in the specified JSON format
- NEVER return raw database errors to users
- ALWAYS include metadata in responses
- NEVER expose internal IDs in URLs - use slugs

### Performance
- ALWAYS lazy load components > 50KB
- NEVER load > 50 items without pagination
- ALWAYS debounce search inputs (300ms)
- NEVER make > 3 parallel API calls
```

## 6. **Positional Reinforcement Throughout**

Add reminders at key sections:

```markdown
## Phase 1: Core Module Foundation

[Implementation details...]

### ⚠️ CRITICAL REMINDER
- Maintain sub-50ms response times
- Use existing Supabase patterns
- Test with feature flags disabled

## Phase 2: Advanced Workflow Management

[Implementation details...]

### ⚠️ CRITICAL REMINDER  
- All drag-drop must prevent circular dependencies
- Optimistic updates required for all mutations
- Feature flag every new capability

## Phase 3: AI Integration

[Implementation details...]

### ⚠️ CRITICAL REMINDER
- AI confidence < 0.70 = suggestion only
- All AI operations must be explicable
- Never auto-apply without user consent
```

## 7. **Post-Implementation Reflection Points**

```markdown
## Implementation Checkpoints

### After each component completion:
1. Run performance profiler - verify < 50ms
2. Check memory usage - verify < 76MB total
3. Test with feature flags on/off
4. Verify error boundaries catch all failures
5. Document any deviations from plan

### After each API endpoint:
1. Verify response format matches specification
2. Test error cases with invalid data
3. Confirm RLS policies are applied
4. Check query performance in Supabase dashboard
5. Add to API documentation

### After drag-drop implementation:
1. Test circular dependency prevention
2. Verify optimistic updates work correctly
3. Test with 1000+ items for performance
4. Confirm undo/redo functionality
5. Test on mobile devices
```

## 8. **Failure Mode Prevention**

Add a new section specifically for failure modes:

```markdown
## Failure Mode Prevention

### Common Implementation Pitfalls

1. **State Management Failures**
   - IF tempted to use useState for server data → USE React Query
   - IF tempted to fetch in useEffect → USE React Query
   - IF tempted to store in localStorage → USE Supabase

2. **Performance Failures**
   - IF rendering > 100 items → IMPLEMENT virtualization
   - IF API call > 50ms → ADD caching or optimize query
   - IF component > 50KB → IMPLEMENT code splitting

3. **User Experience Failures**
   - IF operation > 1 second → SHOW progress indicator
   - IF destructive action → REQUIRE confirmation
   - IF error occurs → SHOW user-friendly message

4. **Security Failures**
   - IF exposing internal IDs → USE public slugs
   - IF missing validation → ADD both client and server
   - IF no RLS → STOP and implement before proceeding
```

## 9. **Simplified Decision Framework**

Replace complex descriptions with clear policies:

```markdown
## Feature Implementation Policy

### IF core CRUD feature → implement immediately
### IF involves AI → implement behind feature flag  
### IF affects > 10 users → require admin approval
### IF changes data model → update TypeScript types first
### IF adds new dependency → justify in PR description
### IF performance impact unknown → benchmark first
```

This restructured document follows the defensive programming approach, making it much clearer for Claude Code or any AI assistant to understand exactly what to do and, more importantly, what NOT to do. The binary rules, explicit edge cases, and constant reinforcement of critical constraints will lead to more consistent and higher-quality implementation.