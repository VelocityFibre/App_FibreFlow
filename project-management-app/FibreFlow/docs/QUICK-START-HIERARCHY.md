# Quick Start: Building the 4-Level Hierarchy System

## 🚀 Day 1: Database Setup (2-3 hours)

### Step 1: Create the Steps Table
```sql
-- Run this in Supabase SQL Editor
CREATE TABLE steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phase_id UUID REFERENCES phases(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    archived_at TIMESTAMPTZ
);

-- Add indexes for performance
CREATE INDEX idx_steps_phase_id ON steps(phase_id);
CREATE INDEX idx_steps_order ON steps(phase_id, order_index);

-- Update tasks table to reference steps
ALTER TABLE tasks 
ADD COLUMN step_id UUID REFERENCES steps(id) ON DELETE SET NULL;

-- Create trigger for updated_at
CREATE TRIGGER update_steps_updated_at BEFORE UPDATE ON steps
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Step 2: Insert Industry-Specific Phases
```sql
-- Clear existing test phases (be careful in production!)
DELETE FROM phases WHERE is_standard = true;

-- Insert the 6 standard fiber project phases
INSERT INTO phases (name, description, order_index, is_standard) VALUES
('Planning', 'Initial project scoping and design', 1, true),
('Initiate Project', 'Project setup and approval (IP)', 2, true),
('Work in Progress', 'Active construction/installation (WIP)', 3, true),
('Handover', 'Completion and client transition', 4, true),
('Handover Complete', 'Final delivery confirmation (HOC)', 5, true),
('Final Acceptance Certificate', 'Project closure and sign-off (FAC)', 6, true);
```

### Step 3: Create Default Steps for Each Phase
```sql
-- Get phase IDs (run this query first to get the IDs)
SELECT id, name FROM phases ORDER BY order_index;

-- Then insert steps for each phase (replace UUID values with actual IDs)
-- IP Phase Steps
INSERT INTO steps (phase_id, name, order_index) VALUES
('[IP_PHASE_ID]', 'Planning', 1),
('[IP_PHASE_ID]', 'Budget Approval', 2),
('[IP_PHASE_ID]', 'Kick-off Meeting', 3),
('[IP_PHASE_ID]', 'Resource Allocation', 4),
('[IP_PHASE_ID]', 'Permits & Approvals', 5);

-- WIP Phase Steps
INSERT INTO steps (phase_id, name, order_index) VALUES
('[WIP_PHASE_ID]', 'Civils', 1),
('[WIP_PHASE_ID]', 'Optical', 2),
('[WIP_PHASE_ID]', 'Testing & Commissioning', 3),
('[WIP_PHASE_ID]', 'Documentation', 4),
('[WIP_PHASE_ID]', 'Quality Assurance', 5);
```

## 🛠️ Day 2: API Routes (3-4 hours)

### Step 1: Create Hierarchy API Route
Create `src/app/api/hierarchy/[projectId]/route.ts`:

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Fetch complete hierarchy for a project
  const { data: project, error } = await supabase
    .from('projects')
    .select(`
      *,
      project_phases!inner(
        *,
        phase:phases(
          *,
          steps(
            *,
            tasks:tasks(*)
          )
        )
      )
    `)
    .eq('id', params.projectId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(project);
}
```

### Step 2: Create Steps CRUD API
Create `src/app/api/steps/route.ts`:

```typescript
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const body = await request.json();
  
  const { data, error } = await supabase
    .from('steps')
    .insert(body)
    .select()
    .single();
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const body = await request.json();
  const { id, ...updates } = body;
  
  const { data, error } = await supabase
    .from('steps')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}
```

## 🎨 Day 3: Basic UI Components (4-5 hours)

### Step 1: Create the Hierarchy Hook
Create `src/hooks/useProjectHierarchy.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useProjectHierarchy(projectId: string) {
  return useQuery({
    queryKey: ['project-hierarchy', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/hierarchy/${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch hierarchy');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateStep() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (step: any) => {
      const response = await fetch('/api/steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(step),
      });
      if (!response.ok) throw new Error('Failed to create step');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-hierarchy'] });
    },
  });
}
```

### Step 2: Create the Hierarchy Tree Component
Create `src/components/hierarchy/ProjectHierarchyTree.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, Plus, MoreVertical } from 'lucide-react';
import { useProjectHierarchy } from '@/hooks/useProjectHierarchy';

interface ProjectHierarchyTreeProps {
  projectId: string;
}

export function ProjectHierarchyTree({ projectId }: ProjectHierarchyTreeProps) {
  const { data: hierarchy, isLoading } = useProjectHierarchy(projectId);
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  if (isLoading) {
    return <div className="p-4">Loading hierarchy...</div>;
  }

  const togglePhase = (phaseId: string) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phaseId)) {
      newExpanded.delete(phaseId);
    } else {
      newExpanded.add(phaseId);
    }
    setExpandedPhases(newExpanded);
  };

  const toggleStep = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Project Hierarchy</h2>
        <button className="btn btn-primary btn-sm">
          <Plus className="w-4 h-4 mr-1" />
          Add Phase
        </button>
      </div>

      <div className="space-y-2">
        {hierarchy?.project_phases?.map((projectPhase: any) => {
          const phase = projectPhase.phase;
          const isPhaseExpanded = expandedPhases.has(phase.id);

          return (
            <div key={phase.id} className="border border-border rounded-lg">
              {/* Phase Header */}
              <div className="flex items-center p-3 hover:bg-muted/50 cursor-pointer"
                   onClick={() => togglePhase(phase.id)}>
                <button className="mr-2">
                  {isPhaseExpanded ? 
                    <ChevronDown className="w-4 h-4" /> : 
                    <ChevronRight className="w-4 h-4" />
                  }
                </button>
                <div className="flex-1">
                  <h3 className="font-medium">{phase.name}</h3>
                  <p className="text-sm text-muted-foreground">{phase.description}</p>
                </div>
                <button className="p-1 hover:bg-muted rounded">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              {/* Steps */}
              {isPhaseExpanded && (
                <div className="pl-8 pr-3 pb-3">
                  {phase.steps?.map((step: any) => {
                    const isStepExpanded = expandedSteps.has(step.id);

                    return (
                      <div key={step.id} className="mt-2 border border-border/50 rounded">
                        {/* Step Header */}
                        <div className="flex items-center p-2 hover:bg-muted/30 cursor-pointer"
                             onClick={() => toggleStep(step.id)}>
                          <button className="mr-2">
                            {isStepExpanded ? 
                              <ChevronDown className="w-3 h-3" /> : 
                              <ChevronRight className="w-3 h-3" />
                            }
                          </button>
                          <span className="flex-1 text-sm">{step.name}</span>
                          <span className="text-xs text-muted-foreground mr-2">
                            {step.tasks?.length || 0} tasks
                          </span>
                        </div>

                        {/* Tasks */}
                        {isStepExpanded && (
                          <div className="pl-8 pr-2 pb-2">
                            {step.tasks?.map((task: any) => (
                              <div key={task.id} 
                                   className="flex items-center p-1 text-sm hover:bg-muted/20 rounded">
                                <span className="flex-1">{task.title}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  task.status === 'complete' ? 'bg-green-500/20 text-green-500' :
                                  task.status === 'in_progress' ? 'bg-blue-500/20 text-blue-500' :
                                  'bg-gray-500/20 text-gray-500'
                                }`}>
                                  {task.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  <button className="mt-2 w-full p-2 border border-dashed border-border 
                                   hover:border-primary hover:bg-muted/30 rounded text-sm">
                    <Plus className="w-3 h-3 inline mr-1" />
                    Add Step
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### Step 3: Add to Project Page
Update `src/app/projects/[id]/page.tsx`:

```typescript
import { ProjectHierarchyTree } from '@/components/hierarchy/ProjectHierarchyTree';

export default function ProjectPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      {/* Existing project header */}
      
      {/* Add the hierarchy tree */}
      <ProjectHierarchyTree projectId={params.id} />
      
      {/* Existing project content */}
    </div>
  );
}
```

## 🎯 Next Steps

### Day 4-5: Drag & Drop
- Install `@dnd-kit/sortable`
- Add drag handles to phases/steps/tasks
- Implement reordering logic
- Add visual feedback

### Day 6-7: CRUD Operations
- Add modals for creating/editing
- Implement delete with confirmation
- Add validation
- Create bulk operations

### Week 2: Advanced Features
- Template system
- Workflow automation
- Progress tracking
- Reporting

## 🚦 Testing Checklist

- [ ] Steps table created successfully
- [ ] Can fetch full hierarchy via API
- [ ] Tree view renders all levels
- [ ] Expand/collapse works
- [ ] Performance with 100+ tasks
- [ ] Mobile responsive

## 🎉 Success Criteria

By end of Day 3, you should have:
1. ✅ 4-level hierarchy in database
2. ✅ API endpoints working
3. ✅ Basic tree view rendering
4. ✅ Expandable/collapsible UI
5. ✅ Foundation for drag-drop

This gives you a working 4-level hierarchy system to build upon!