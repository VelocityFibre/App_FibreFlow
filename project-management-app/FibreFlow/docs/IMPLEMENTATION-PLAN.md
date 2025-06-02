# FibreFlow Project Hierarchy Implementation Plan

## 🎯 Executive Summary

This plan outlines how to transform FibreFlow from its current basic 3-level hierarchy (Projects → Phases → Tasks) into a comprehensive 4-level fiber project management system (Projects → Phases → Steps → Tasks) with advanced drag-and-drop management, workflow automation, and industry-specific features.

## 📊 Current State Analysis

### What We Have:
- ✅ Basic project management (projects, phases, tasks)
- ✅ Task assignment system
- ✅ Audit logging
- ✅ Performance optimization infrastructure
- ✅ Analytics dashboard
- ✅ Feature flag system
- ✅ React Query for data management

### What We Need to Build:
- ❌ 4-level hierarchy with Steps layer
- ❌ 6 industry-specific phases (Planning, IP, WIP, Handover, HOC, FAC)
- ❌ Drag-and-drop hierarchy management
- ❌ Dynamic CRUD for phases/steps/tasks
- ❌ Workflow automation engine
- ❌ Resource management system
- ❌ Client portal
- ❌ Mobile app support

## 🏗️ Implementation Phases

### **Phase 1: Database & Core Structure (Weeks 1-3)**

#### Week 1: Database Schema Evolution
```sql
-- 1. Create new steps table
CREATE TABLE steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phase_id UUID REFERENCES phases(id) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    archived_at TIMESTAMPTZ,
    UNIQUE(phase_id, order_index)
);

-- 2. Modify tasks table to reference steps
ALTER TABLE tasks ADD COLUMN step_id UUID REFERENCES steps(id);
-- Migrate existing tasks to default steps
-- Update foreign key constraints

-- 3. Create industry-specific phases
INSERT INTO phases (name, description, order_index, is_standard) VALUES
('Planning', 'Initial project scoping and design', 1, true),
('Initiate Project', 'Project setup and approval', 2, true),
('Work in Progress', 'Active construction/installation', 3, true),
('Handover', 'Completion and client transition', 4, true),
('Handover Complete', 'Final delivery confirmation', 5, true),
('Final Acceptance Certificate', 'Project closure and sign-off', 6, true);

-- 4. Create hierarchy management tables
CREATE TABLE hierarchy_templates (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    project_type VARCHAR(100),
    template_data JSONB
);

CREATE TABLE drag_drop_history (
    id UUID PRIMARY KEY,
    user_id UUID,
    action_type VARCHAR(50),
    source_data JSONB,
    target_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Week 2: API Layer Enhancement
- Create RESTful endpoints for 4-level hierarchy
- Implement GraphQL for complex hierarchy queries
- Add batch operations support
- Create drag-drop API endpoints

**New API Routes:**
```typescript
// Hierarchy Management
POST   /api/projects/:id/phases
PUT    /api/phases/:id/reorder
DELETE /api/phases/:id

POST   /api/phases/:id/steps
PUT    /api/steps/:id/reorder
DELETE /api/steps/:id

POST   /api/steps/:id/tasks
PUT    /api/tasks/:id/move
DELETE /api/tasks/:id

// Bulk Operations
POST   /api/bulk/tasks
PUT    /api/bulk/reorder
DELETE /api/bulk/delete
```

#### Week 3: Core UI Components
- Build hierarchical tree component
- Implement drag-drop system
- Create CRUD modals
- Add context menus

**Key Components:**
```typescript
// src/components/hierarchy/
├── ProjectTree.tsx          // Main tree view
├── DragDropProvider.tsx     // DnD context
├── PhaseCard.tsx           // Draggable phase
├── StepCard.tsx            // Draggable step
├── TaskCard.tsx            // Draggable task
├── ContextMenu.tsx         // Right-click menu
└── BulkActionBar.tsx       // Multi-select toolbar
```

### **Phase 2: Drag-Drop & Dynamic Management (Weeks 4-6)**

#### Week 4: Drag-Drop Implementation
```typescript
// Using @dnd-kit/sortable for performance
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

// Features to implement:
- Visual drop zones
- Multi-item selection
- Cross-level dragging
- Undo/redo system
- Animation feedback
```

#### Week 5: Dynamic CRUD System
- Phase/Step/Task creation forms
- Inline editing capabilities
- Validation system
- Template management

#### Week 6: Advanced Ordering
- Custom numbering system
- Dependency visualization
- Order templates
- Version control for changes

### **Phase 3: Workflow Engine (Weeks 7-9)**

#### Week 7: Phase Progression Rules
```typescript
// Workflow Engine
interface PhaseRule {
  phaseId: string;
  conditions: Condition[];
  actions: Action[];
  gates: ApprovalGate[];
}

// Implement:
- Rule builder UI
- Condition evaluator
- Action executor
- Gate management
```

#### Week 8: Automation System
- Task auto-assignment
- Notification triggers
- Status transitions
- Deadline management

#### Week 9: Integration Layer
- Calendar sync
- Document management
- GPS tracking
- Photo uploads

### **Phase 4: Advanced Features (Weeks 10-12)**

#### Week 10: Resource Management
- Staff allocation system
- Skill matching
- Workload balancing
- Availability tracking

#### Week 11: Reporting & Analytics
- Gantt chart view
- Resource heatmaps
- Performance metrics
- Custom dashboards

#### Week 12: Client Portal
- Read-only project view
- Progress tracking
- Document access
- Communication channel

## 🚀 Quick Start Implementation (Week 1 Focus)

### Day 1-2: Database Migration
```bash
# 1. Create migration files
npm run supabase migration new add_steps_table
npm run supabase migration new update_hierarchy

# 2. Run migrations
npm run supabase db push

# 3. Seed industry phases
npm run seed:phases
```

### Day 3-4: Basic API Setup
```typescript
// src/app/api/hierarchy/route.ts
export async function GET(request: Request) {
  // Return full hierarchy tree
}

export async function POST(request: Request) {
  // Create new hierarchy item
}

export async function PUT(request: Request) {
  // Reorder hierarchy items
}
```

### Day 5-7: Core UI Component
```typescript
// src/components/ProjectHierarchy.tsx
export function ProjectHierarchy({ projectId }: Props) {
  const { data: hierarchy } = useProjectHierarchy(projectId);
  
  return (
    <DndContext onDragEnd={handleDragEnd}>
      <TreeView>
        {hierarchy.phases.map(phase => (
          <PhaseNode key={phase.id} phase={phase}>
            {phase.steps.map(step => (
              <StepNode key={step.id} step={step}>
                {step.tasks.map(task => (
                  <TaskNode key={task.id} task={task} />
                ))}
              </StepNode>
            ))}
          </PhaseNode>
        ))}
      </TreeView>
    </DndContext>
  );
}
```

## 📋 Development Checklist

### Immediate Actions (This Week):
- [ ] Create `steps` table in Supabase
- [ ] Update task relationships
- [ ] Create hierarchy API endpoints
- [ ] Build basic tree view component
- [ ] Implement phase CRUD operations
- [ ] Add feature flag for new hierarchy

### Next Sprint:
- [ ] Implement drag-drop functionality
- [ ] Build step management UI
- [ ] Create bulk operations
- [ ] Add undo/redo system
- [ ] Implement ordering system

### Future Sprints:
- [ ] Workflow automation engine
- [ ] Resource management
- [ ] Mobile app development
- [ ] Client portal
- [ ] Advanced analytics

## 🔧 Technical Stack Additions

### New Dependencies:
```json
{
  "@dnd-kit/core": "^6.0.0",
  "@dnd-kit/sortable": "^7.0.0",
  "@tanstack/react-table": "^8.0.0",
  "react-complex-tree": "^2.0.0",
  "react-hook-form": "^7.0.0",
  "zod": "^3.0.0"
}
```

### Performance Considerations:
- Use virtualization for large hierarchies
- Implement optimistic updates
- Cache hierarchy data aggressively
- Lazy load deep tree branches
- Batch API calls for bulk operations

## 🎯 Success Metrics

### Week 1 Goals:
- ✅ 4-level hierarchy database structure
- ✅ Basic CRUD for all levels
- ✅ Tree view rendering
- ✅ Feature flag protection

### Month 1 Goals:
- ✅ Full drag-drop functionality
- ✅ Dynamic phase/step management
- ✅ Basic workflow rules
- ✅ 80% faster than current system

### Quarter Goals:
- ✅ Complete workflow automation
- ✅ Mobile app beta
- ✅ Client portal launch
- ✅ 20% reduction in project time

## 🚦 Risk Mitigation

### Technical Risks:
- **Performance with large hierarchies**: Use virtualization
- **Complex drag-drop logic**: Implement incrementally
- **Data migration**: Create rollback procedures
- **User adoption**: Provide training materials

### Mitigation Strategies:
1. Use feature flags for gradual rollout
2. Maintain backward compatibility
3. Create comprehensive test suite
4. Build migration tools
5. Provide user documentation

## 📝 Next Steps

1. **Today**: Review this plan with team
2. **Tomorrow**: Start database migrations
3. **This Week**: Complete Phase 1, Week 1
4. **Next Week**: Begin drag-drop implementation
5. **Month 1**: Launch beta with feature flags

This implementation plan transforms FibreFlow into a world-class fiber project management system while building on the solid foundation already in place.