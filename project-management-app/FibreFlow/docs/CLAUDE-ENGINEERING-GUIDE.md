# FibreFlow Claude Prompt Engineering Guide

Looking at this FibreFlow project management module plan through the lens of Claude prompt engineering principles, here's how to restructure it for maximum effectiveness with Claude Code and other AI assistants.

## 1. **Start with Identity and Stable Context**

```markdown
# FibreFlow Project Management Module - Development Specification

## System Identity
You are developing a project management module for FibreFlow, a fiber optic infrastructure management system.
- Stack: Next.js + Supabase + Tailwind CSS
- Current Performance: 92-93% optimization achieved, sub-50ms response times
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
2. Test with feature flags on/off
3. Verify error boundaries catch all failures
4. Document any deviations from plan

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

```markdown
## Feature Implementation Policy

### IF core CRUD feature → implement immediately
### IF involves AI → implement behind feature flag  
### IF affects > 10 users → require admin approval
### IF changes data model → update TypeScript types first
### IF adds new dependency → justify in PR description
### IF performance impact unknown → benchmark first
```

## 10. **FibreFlow-Specific Prompt Templates**

### Template for New Feature Implementation

```markdown
I need to implement [FEATURE NAME] for FibreFlow project management.

CONTEXT:
- Current stack: Next.js + Supabase + Tailwind + React Query
- Performance requirement: < 50ms response time
- Feature flags required for all new features
- Must maintain existing patterns

REQUIREMENTS:
1. [Specific requirement 1]
2. [Specific requirement 2]

CONSTRAINTS:
- NEVER break existing functionality
- ALWAYS use React Query for data fetching
- NEVER exceed performance budget

Please implement with:
1. TypeScript types first
2. Database schema if needed
3. API endpoints with RLS
4. React components with loading/error states
5. Feature flag integration
```

### Template for Bug Fixes

```markdown
FibreFlow bug report: [ISSUE DESCRIPTION]

CURRENT BEHAVIOR:
[What happens now]

EXPECTED BEHAVIOR:
[What should happen]

REPRODUCTION STEPS:
1. [Step 1]
2. [Step 2]

CONSTRAINTS:
- Fix must not impact performance (< 50ms)
- Maintain backward compatibility
- Add tests for the fix

Please provide:
1. Root cause analysis
2. Minimal fix
3. Test cases
4. Performance impact assessment
```

### Template for Performance Optimization

```markdown
Optimize [COMPONENT/FEATURE] in FibreFlow.

CURRENT METRICS:
- Response time: [X]ms
- Bundle size: [X]KB

TARGET METRICS:
- Response time: < 50ms
- Bundle size: < 50KB

CONSTRAINTS:
- Maintain all existing functionality
- Use feature flags for risky changes
- Document performance improvements

Optimization approach:
1. Profile current implementation
2. Identify bottlenecks
3. Implement optimizations
4. Measure improvements
5. Document changes
```

## 11. **Integration with Existing FibreFlow Features**

This prompt engineering approach integrates with:

1. **Feature Flag System**: All prompts assume feature flag usage
2. **Performance Monitoring**: Built-in performance checkpoints
3. **AI-Ready Architecture**: Prompts follow AI-friendly patterns
4. **GraphRAG System**: Structured data for knowledge graphs

## 12. **Best Practices for Claude Code Sessions**

```markdown
## Starting a Claude Code Session

1. ALWAYS start with:
   "I'm working on FibreFlow, a fiber optic project management system with these constraints:
   - Sub-50ms response times
   - Feature flags for all new features
   - React Query for data management"

2. PROVIDE context files:
   - Current component/feature code
   - Related TypeScript types
   - Supabase schema if relevant

3. BE SPECIFIC about success criteria:
   - Performance requirements
   - User experience goals
   - Error handling needs

4. AVOID vague requests like:
   - "Make it better"
   - "Optimize everything"
   - "Add some features"
```

This restructured document follows defensive programming principles, making it much clearer for Claude Code or any AI assistant to understand exactly what to do and, more importantly, what NOT to do. The binary rules, explicit edge cases, and constant reinforcement of critical constraints will lead to more consistent and higher-quality implementation.