# FibreFlow Team Labor Division & Task Assignments

## Team Overview

### Human Team Members
- **Louis** - Technical Lead
  - Most technical background & IDE experience
  - Architecture decisions & code review
  - Complex integrations & performance optimization
  
- **Hein** - Product Owner (VelocityFibre COO)
  - Practical project management expertise
  - UI/UX design vision
  - Requirements & feature prioritization

### AI Assistants
- **2x Claude 3.7 Sonnet** - Analysis & Planning
  - Documentation & specifications
  - Code analysis & architecture
  - Complex problem solving
  
- **2x Claude Code** - Implementation
  - Rapid prototyping
  - Component development
  - Testing & debugging

---

## 🎯 Immediate Task Assignments (Sprint 1: Week 1-2)

### Louis (Technical Lead) - Core Architecture & Review
**Primary Focus**: Database schema, architecture decisions, code review

**Immediate Tasks**:
1. **Set up database schema** (Day 1-2)
   ```sql
   -- Create and validate the 4-level hierarchy schema
   -- projects → phases → steps → tasks
   ```
   - Review `docs/PROJECT_MANAGEMENT_MODULE_SPEC.md` schema
   - Create migrations in `scripts/migration/`
   - Set up Supabase RLS policies
   - Test foreign key relationships

2. **Architecture setup** (Day 3)
   - Create base React Query hooks structure
   - Set up feature flags for new module
   - Define TypeScript interfaces for hierarchy
   - Create error boundary structure

3. **Code review pipeline** (Ongoing)
   - Review all PR submissions daily
   - Ensure performance budgets (<50ms)
   - Validate React Query patterns
   - Check for security issues

**Tools**: VS Code, Supabase Dashboard, React DevTools

---

### Hein (Product Owner) - Requirements & Design
**Primary Focus**: UI/UX design, feature specifications, user stories

**Immediate Tasks**:
1. **Finalize UI mockups** (Day 1-2)
   - Project hierarchy visualization
   - Drag-drop interaction design
   - Mobile responsive layouts
   - Color schemes & branding
   
2. **Create user stories** (Day 2-3)
   - Define acceptance criteria for each phase type
   - Document workflow for each user role
   - Specify notification requirements
   - Client portal feature list

3. **Design review sessions** (Daily, 30 min)
   - Review implemented components
   - Provide feedback on UX
   - Validate against business needs
   

**Tools**:  FibreFlow staging environment

**Tech Constraints Reminder for Hein**:
- ⚠️ Max 100 items visible without scrolling (virtualization)
- ⚠️ Max 3 levels of nesting in UI (performance)
- ⚠️ Mobile-first design required
- ⚠️ Dark mode must be supported

---

### Claude 3.7 Sonnet #1 - Planning & Analysis
**Primary Focus**: Technical documentation, API design, test planning

**Immediate Tasks**:
1. **Create detailed API specifications** ✅ COMPLETED
   - RESTful endpoints for CRUD operations
   - GraphQL schema if needed
   - Request/response formats
   - Error handling patterns

2. **Write comprehensive test plans** ✅ COMPLETED
   - Unit test specifications
   - Integration test scenarios
   - E2E test workflows
   - Performance test criteria

3. **Document component architecture** ✅ COMPLETED
   - Component hierarchy diagram
   - Props interface documentation
   - State management flow
   - Event handling patterns

**Deliverables**:
- `docs/API_SPECIFICATION.md` ✅ COMPLETED
- `docs/TEST_PLAN.md` ✅ COMPLETED
- `docs/COMPONENT_ARCHITECTURE.md` ✅ COMPLETED

---

### Claude 3.7 Sonnet #2 - Business Logic & Workflows
**Primary Focus**: Workflow automation, business rules, validation logic

**Immediate Tasks**:
1. **Define workflow automation rules** ✅ COMPLETED
   - Phase progression conditions
   - Task dependency logic
   - Notification triggers
   - Approval gate specifications

2. **Create validation rule documentation** ✅ COMPLETED
   - Circular dependency prevention algorithm
   - Business constraint validations
   - Data integrity rules
   - Permission matrices

3. **Design offline sync strategy**
   - Conflict resolution rules
   - Queue prioritization
   - Sync error handling
   - Data consistency guarantees

**Deliverables**:
- `docs/WORKFLOW_RULES.md` ✅ COMPLETED
- `docs/VALIDATION_LOGIC.md` ✅ COMPLETED
- `docs/OFFLINE_SYNC_STRATEGY.md`

---

### Claude Code #1 - Frontend Implementation
**Primary Focus**: React components, UI implementation, drag-drop functionality

**Immediate Tasks**:
1. **Implement base hierarchy components** (Day 1-3)
   ```typescript
   // Components to create:
   - ProjectList.tsx (with virtualization)
   - PhaseAccordion.tsx
   - StepContainer.tsx
   - TaskCard.tsx
   - DragDropWrapper.tsx
   ```

2. **Create React Query hooks** (Day 4-5)
   ```typescript
   // Hooks to implement:
   - useProjects()
   - useProjectHierarchy(projectId)
   - useCreateTask()
   - useUpdateTaskOrder()
   - useBulkOperations()
   ```

3. **Implement drag-drop with validation** (Day 5-7)
   - Use @hello-pangea/dnd
   - Add circular dependency checks
   - Visual feedback for invalid drops
   - Optimistic updates

**Working Directory**: `project-management-app/src/`

---

### Claude Code #2 - Backend & Integration
**Primary Focus**: Supabase integration, API endpoints, data layer

**Immediate Tasks**:
1. **Create Supabase functions** (Day 1-3) ✅ COMPLETED
   ```sql
   -- RPC functions to create:
   - get_project_hierarchy(project_id)
   - reorder_tasks(task_ids, new_positions)
   - check_circular_dependency(task_id, target_id)
   - bulk_update_status(task_ids, new_status)
   ```

2. **Implement soft delete utilities** (Day 3-4) ✅ COMPLETED
   ```typescript
   // Create in lib/softDelete.ts:
   - softDeleteRecord(table, id)
   - restoreRecord(table, id)
   - permanentlyDelete(table, id)
   - Add to all queries: .is('archived_at', null)
   ```

3. **Set up real-time subscriptions** (Day 5-7)
   - Project updates channel
   - Task assignment notifications
   - Progress tracking updates
   - Collaborative editing

**Working Directory**: `scripts/database/` and `project-management-app/src/lib/`

---

## 📊 Daily Workflow

### Morning Sync (15 min)
1. **Louis** reviews overnight AI work
2. **Hein** presents any new requirements/designs
3. AI assistants report blockers
4. Assign day's priorities

### Midday Check-in (10 min)
1. Progress updates
2. Blocker resolution
3. Adjust assignments if needed

### End of Day (20 min)
1. **Louis** code review of day's work
2. **Hein** UX review of implemented features
3. Plan next day's tasks
4. Update `IMPLEMENTATION_ROADMAP.md`

---

## 🚀 Week 1 Deliverables

### By End of Day 3:
- ✅ Complete database schema deployed
- ✅ Base component structure created
- ✅ API specifications documented
- ✅ Initial UI mockups approved

### By End of Week 1:
- ✅ Basic CRUD operations working
- ✅ Drag-drop prototype functional
- ✅ Soft delete implemented
- ✅ Initial performance benchmarks

---

## 💡 Collaboration Tips

### For Louis:
- Delegate repetitive tasks to Claude Code
- Focus on architecture & difficult problems
- Set clear code standards early
- Create reusable patterns for AI to follow

### For Hein:
- Provide visual examples when possible
- Think in terms of user stories
- Ask "is this technically feasible?" before requesting
- Focus on MVP features first

### For AI Assistants:
- Ask for clarification when requirements unclear
- Flag performance concerns immediately
- Suggest alternatives when hitting constraints
- Document all assumptions made

---

## 🔄 Parallel Work Streams

To maximize efficiency, run these in parallel:

**Stream 1**: Database & Backend (Louis + Claude Code #2)
**Stream 2**: Frontend Components (Claude Code #1)
**Stream 3**: Documentation & Planning (Claude 3.5 #1 & #2)
**Stream 4**: Design & Requirements (Hein)

---

## 📈 Success Metrics for Week 1

- [ ] 20+ components created
- [ ] 100% test coverage planned
- [ ] <50ms response on all endpoints
- [ ] 5+ user stories documented
- [ ] Drag-drop working with 500+ items

Remember: **Feature flags ON** for all new development!