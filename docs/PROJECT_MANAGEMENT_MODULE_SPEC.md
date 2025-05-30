# FibreFlow Project Management Module - Implementation Specification

## System Identity
You are implementing a hierarchical project management module for FibreFlow, a fiber optic infrastructure management system.
- **Stack**: Next.js 15 + Supabase + Tailwind CSS + React Query
- **Performance Requirements**: <50ms response, <76MB memory
- **Architecture**: Projects → Phases → Steps → Tasks hierarchy
- **Core Principle**: Every feature behind feature flags for gradual rollout

## Core Constraints (Never Violate)
- NEVER exceed 50ms response time for any user interaction
- NEVER delete records - use soft delete with archived_at
- NEVER implement features without feature flags
- NEVER render > 100 items without virtualization
- NEVER make > 3 parallel API calls
- ALWAYS use React Query for server state
- ALWAYS implement optimistic updates

---

## 🏗️ Project Hierarchy Implementation

### Database Schema (Supabase)

```sql
-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  client_id UUID REFERENCES customers(id),
  project_manager_id UUID REFERENCES staff(id),
  start_date DATE,
  end_date DATE,
  budget DECIMAL(12,2),
  status TEXT CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
  progress_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  archived_at TIMESTAMP NULL
);

-- Phases table (6 standard phases)
CREATE TABLE phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phase_type TEXT CHECK (phase_type IN ('planning', 'ip', 'wip', 'handover', 'hoc', 'fac')),
  order_index INTEGER NOT NULL,
  status TEXT DEFAULT 'not_started',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  archived_at TIMESTAMP NULL
);

-- Steps table (phase-specific groupings)
CREATE TABLE steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id UUID REFERENCES phases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  status TEXT DEFAULT 'not_started',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  archived_at TIMESTAMP NULL
);

-- Tasks table (granular work items)
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID REFERENCES steps(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES staff(id),
  secondary_assignee UUID REFERENCES staff(id),
  status TEXT DEFAULT 'not_started',
  progress_percentage INTEGER DEFAULT 0,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  start_date DATE,
  due_date DATE,
  completed_at TIMESTAMP,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  archived_at TIMESTAMP NULL
);

-- Task dependencies
CREATE TABLE task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(task_id, depends_on_task_id)
);
```

---

## 📋 Implementation by Feature (Following claude.md)

### Phase 1: Core Structure Implementation

#### 1.1 Basic CRUD Operations (Core Feature - Implement Immediately)

```typescript
// ✅ CORRECT: Using React Query for all operations
// Location: project-management-app/src/hooks/useProjectHierarchy.ts

export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          phases (
            *,
            steps (
              *,
              tasks (*)
            )
          )
        `)
        .is('archived_at', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ✅ CORRECT: Optimistic updates for mutations
export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (project: NewProject) => {
      const { data, error } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onMutate: async (newProject) => {
      await queryClient.cancelQueries(['projects']);
      const previousProjects = queryClient.getQueryData(['projects']);
      
      queryClient.setQueryData(['projects'], (old: any[]) => [
        { ...newProject, id: 'temp-id', created_at: new Date() },
        ...old
      ]);
      
      return { previousProjects };
    },
    onError: (err, newProject, context) => {
      queryClient.setQueryData(['projects'], context.previousProjects);
      toast.error('Failed to create project');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
    }
  });
};
```

#### 1.2 Soft Delete Implementation

```typescript
// Location: project-management-app/src/lib/softDelete.ts

export const softDelete = async (table: string, id: string) => {
  const { error } = await supabase
    .from(table)
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id);
  
  if (error) throw error;
  
  // Create audit log
  await createAuditLog(
    AuditAction.ARCHIVE,
    table.toUpperCase() as AuditResourceType,
    id,
    { archived_at: new Date().toISOString() }
  );
};

// Add to all queries
const baseQuery = supabase.from('projects').select().is('archived_at', null);
```

### Phase 2: Dynamic Hierarchy Management

#### 2.1 Drag-and-Drop with Circular Dependency Prevention (Enhanced Feature - Implement + Flag)

```typescript
// Location: project-management-app/src/components/ProjectHierarchy/DragDropManager.tsx

interface DragDropManagerProps {
  onReorder: (result: DropResult) => void;
  checkCircularDependency: (taskId: string, targetId: string) => boolean;
}

export const DragDropManager: React.FC<DragDropManagerProps> = ({
  onReorder,
  checkCircularDependency
}) => {
  // IF drag-and-drop would create circular dependencies
  // THEN prevent drop and show visual indicator
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    // Check for circular dependencies
    if (result.type === 'task') {
      const isCircular = checkCircularDependency(
        result.draggableId,
        result.destination.droppableId
      );
      
      if (isCircular) {
        toast.error("This would create a circular dependency");
        return;
      }
    }
    
    onReorder(result);
  };
  
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      {/* Hierarchy components */}
    </DragDropContext>
  );
};

// Circular dependency detection algorithm
export const detectCircularDependency = (
  taskId: string,
  targetId: string,
  dependencies: TaskDependency[]
): boolean => {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  
  const hasCycle = (id: string): boolean => {
    visited.add(id);
    recursionStack.add(id);
    
    const deps = dependencies.filter(d => d.task_id === id);
    
    for (const dep of deps) {
      if (!visited.has(dep.depends_on_task_id)) {
        if (hasCycle(dep.depends_on_task_id)) return true;
      } else if (recursionStack.has(dep.depends_on_task_id)) {
        return true;
      }
    }
    
    recursionStack.delete(id);
    return false;
  };
  
  return hasCycle(taskId);
};
```

#### 2.2 Virtualization for Large Lists

```typescript
// Location: project-management-app/src/components/ProjectHierarchy/VirtualizedList.tsx

import { FixedSizeList } from 'react-window';

export const VirtualizedTaskList = ({ tasks, stepId }) => {
  // IF rendering > 100 items
  // THEN implement virtualization
  if (tasks.length > 100) {
    return (
      <FixedSizeList
        height={600}
        itemCount={tasks.length}
        itemSize={80}
        width="100%"
      >
        {({ index, style }) => (
          <div style={style}>
            <TaskItem task={tasks[index]} />
          </div>
        )}
      </FixedSizeList>
    );
  }
  
  // Regular rendering for small lists
  return tasks.map(task => <TaskItem key={task.id} task={task} />);
};
```

### Phase 3: Advanced Features

#### 3.0 GraphRAG Integration for Relationship Intelligence

```typescript
// Location: project-management-app/src/lib/graph/graphClient.ts

import neo4j from 'neo4j-driver';

export class GraphClient {
  private driver: neo4j.Driver;
  
  constructor() {
    this.driver = neo4j.driver(
      process.env.NEO4J_URI!,
      neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!)
    );
  }

  // Sync project hierarchy to graph
  async syncProjectToGraph(project: Project) {
    const session = this.driver.session();
    
    try {
      await session.run(`
        MERGE (p:Project {id: $projectId})
        SET p.name = $name, p.status = $status
      `, {
        projectId: project.id,
        name: project.name,
        status: project.status
      });
      
      // Sync phases, steps, tasks, and relationships
      for (const phase of project.phases) {
        await this.syncPhaseToGraph(session, project.id, phase);
      }
    } finally {
      await session.close();
    }
  }

  // Natural language query processing
  async askProjectQuestion(question: string, projectId?: string) {
    // Convert natural language to Cypher
    const cypher = await this.generateCypherFromNL(question);
    
    const session = this.driver.session();
    try {
      const result = await session.run(cypher, { projectId });
      return this.formatQueryResult(result);
    } finally {
      await session.close();
    }
  }

  // Find critical paths and bottlenecks
  async analyzeDependencies(projectId: string) {
    const session = this.driver.session();
    
    try {
      // Find tasks with most dependencies
      const bottlenecks = await session.run(`
        MATCH (t:Task)-[:BLOCKS]->(blocked:Task)
        WHERE t.projectId = $projectId
        RETURN t.id, t.title, COUNT(blocked) as blockedCount
        ORDER BY blockedCount DESC
        LIMIT 10
      `, { projectId });
      
      // Find longest dependency chains
      const criticalPaths = await session.run(`
        MATCH path = (start:Task)-[:DEPENDS_ON*]->(end:Task)
        WHERE start.projectId = $projectId 
        AND NOT (end)-[:DEPENDS_ON]->()
        RETURN path, length(path) as pathLength
        ORDER BY pathLength DESC
        LIMIT 5
      `, { projectId });
      
      return {
        bottlenecks: bottlenecks.records,
        criticalPaths: criticalPaths.records
      };
    } finally {
      await session.close();
    }
  }

  // Collaborative pattern analysis
  async analyzeCollaborationPatterns(staffId: string) {
    const session = this.driver.session();
    
    try {
      const result = await session.run(`
        MATCH (s1:Staff {id: $staffId})-[:WORKED_WITH]->(s2:Staff)
        MATCH (s1)-[:WORKED_ON]->(t:Task)<-[:WORKED_ON]-(s2)
        WHERE t.completedAt < t.dueDate
        RETURN s2.id, s2.name, COUNT(t) as successfulCollaborations
        ORDER BY successfulCollaborations DESC
      `, { staffId });
      
      return result.records;
    } finally {
      await session.close();
    }
  }
}

// Hook for natural language queries
export const useGraphQuery = (enabled = true) => {
  const [query, setQuery] = useState('');
  const graphClient = useMemo(() => new GraphClient(), []);
  
  const { data, isLoading } = useQuery({
    queryKey: ['graph-query', query],
    queryFn: async () => {
      if (!query) return null;
      return await graphClient.askProjectQuestion(query);
    },
    enabled: enabled && query.length > 0,
    staleTime: 5 * 60 * 1000
  });
  
  return { setQuery, data, isLoading };
};

// Component for natural language interface
export const ProjectQueryInterface: React.FC = () => {
  const { setQuery, data, isLoading } = useGraphQuery();
  const [input, setInput] = useState('');
  
  const exampleQueries = [
    "Which tasks are blocking the most other tasks?",
    "Show me all tasks assigned to John that are overdue",
    "What's the critical path for Project X?",
    "Which contractors have the best on-time completion rate?"
  ];
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Ask a Question</h3>
      
      <div className="mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              setQuery(input);
            }
          }}
          placeholder="Ask about your projects in natural language..."
          className="w-full p-3 border rounded-lg"
        />
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Example queries:</p>
        <div className="flex flex-wrap gap-2">
          {exampleQueries.map((example) => (
            <button
              key={example}
              onClick={() => {
                setInput(example);
                setQuery(example);
              }}
              className="text-xs bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
      
      {isLoading && <div>Analyzing...</div>}
      
      {data && (
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <QueryResults results={data} />
        </div>
      )}
    </div>
  );
};
```

#### 3.1 AI Task Recommendations (Enhanced Feature - Behind Flag)

```typescript
// Location: project-management-app/src/lib/ai/taskRecommendations.ts

interface TaskRecommendation {
  taskId: string;
  recommendation: string;
  confidence: number;
  type: 'sequence' | 'resource' | 'timeline';
}

export const useAIRecommendations = (projectId: string) => {
  const { data: featureEnabled } = useFeatureFlag('ai_recommendations');
  
  return useQuery({
    queryKey: ['ai-recommendations', projectId],
    queryFn: async () => {
      const recommendations = await fetchAIRecommendations(projectId);
      
      // IF AI recommendation confidence < 0.70
      // THEN do not auto-apply, only suggest with warning
      return recommendations.filter(rec => rec.confidence >= 0.70);
    },
    enabled: featureEnabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const AIRecommendationBadge: React.FC<{ recommendation: TaskRecommendation }> = ({
  recommendation
}) => {
  if (recommendation.confidence < 0.70) {
    return (
      <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
        ⚠️ Low confidence suggestion: {recommendation.recommendation}
      </div>
    );
  }
  
  return (
    <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
      ✓ Recommended: {recommendation.recommendation}
    </div>
  );
};
```

#### 3.2 Bulk Operations with Confirmation

```typescript
// Location: project-management-app/src/components/BulkOperations.tsx

export const BulkOperationsBar = ({ selectedItems, onBulkAction }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // IF bulk operation affects > 100 items
  // THEN require explicit confirmation with count display
  const handleBulkAction = (action: string) => {
    if (selectedItems.length > 100) {
      setShowConfirmation(true);
      return;
    }
    
    performBulkAction(action, selectedItems);
  };
  
  return (
    <>
      <div className="bg-blue-50 p-4 flex justify-between items-center">
        <span>{selectedItems.length} items selected</span>
        <div className="space-x-2">
          <button onClick={() => handleBulkAction('assign')}>
            Bulk Assign
          </button>
          <button onClick={() => handleBulkAction('status')}>
            Update Status
          </button>
          <button onClick={() => handleBulkAction('delete')} className="text-red-600">
            Archive Selected
          </button>
        </div>
      </div>
      
      {showConfirmation && (
        <ConfirmationDialog
          title="Bulk Operation Warning"
          message={`This will affect ${selectedItems.length} items. Are you sure?`}
          onConfirm={() => {
            performBulkAction(action, selectedItems);
            setShowConfirmation(false);
          }}
          onCancel={() => setShowConfirmation(false)}
        />
      )}
    </>
  );
};
```

### Phase 4: Offline Mode Support

```typescript
// Location: project-management-app/src/lib/offline/syncQueue.ts

// IF offline mode is active during mobile task update
// THEN queue changes locally and sync when connection restored
export const useOfflineQueue = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queue, setQueue] = useState<QueuedMutation[]>([]);
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      processQueue();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const queueMutation = (mutation: QueuedMutation) => {
    if (!isOnline) {
      setQueue(prev => [...prev, mutation]);
      // Store in IndexedDB for persistence
      addToIndexedDB(mutation);
      toast.info('Changes queued for sync when online');
    }
  };
  
  const processQueue = async () => {
    const pending = await getQueueFromIndexedDB();
    
    for (const mutation of pending) {
      try {
        await executeMutation(mutation);
        await removeFromIndexedDB(mutation.id);
      } catch (error) {
        console.error('Failed to sync:', error);
      }
    }
  };
  
  return { isOnline, queueMutation, queueLength: queue.length };
};
```

---

## 🚦 Implementation Checkpoints

### After each component completion:
1. Run performance profiler - verify < 50ms
2. Check memory usage - verify < 76MB total
3. Test with feature flags on/off
4. Verify error boundaries catch all failures
5. Test virtualization with 1000+ items

### After drag-drop implementation:
1. Test circular dependency prevention
2. Verify optimistic updates work correctly
3. Test with 1000+ items for performance
4. Confirm undo/redo functionality
5. Test on mobile devices

### After each API endpoint:
1. Verify response format matches specification
2. Test error cases with invalid data
3. Confirm RLS policies are applied
4. Check query performance in Supabase dashboard
5. Verify soft delete is working

---

## 📊 Success Metrics Implementation

```typescript
// Location: project-management-app/src/lib/analytics/projectMetrics.ts

export const useProjectMetrics = () => {
  return useQuery({
    queryKey: ['project-metrics'],
    queryFn: async () => {
      // Implement success metrics tracking
      const metrics = await supabase.rpc('calculate_project_metrics');
      
      return {
        avgCompletionTime: metrics.avg_completion_time,
        onTimeDeliveryRate: metrics.on_time_rate,
        communicationOverhead: metrics.communication_overhead,
        clientSatisfaction: metrics.avg_satisfaction,
        budgetOverruns: metrics.budget_overrun_rate
      };
    }
  });
};
```

---

## 🚫 Common Implementation Pitfalls

### State Management Failures
- IF tempted to use useState for hierarchy data → USE React Query
- IF tempted to fetch in useEffect → USE React Query hooks
- IF tempted to store in localStorage → USE Supabase + offline queue

### Performance Failures
- IF rendering entire hierarchy → IMPLEMENT virtualization
- IF API call > 50ms → ADD caching or optimize query
- IF component > 50KB → IMPLEMENT code splitting

### User Experience Failures
- IF drag operation > 1 second → SHOW loading indicator
- IF destructive action → REQUIRE confirmation
- IF error occurs → SHOW user-friendly message with recovery action

---

## 📁 File Structure for Module

```
project-management-app/src/
├── app/
│   └── projects/
│       ├── page.tsx                    # Projects list with virtualization
│       ├── [id]/
│       │   ├── page.tsx               # Project detail with hierarchy
│       │   ├── phases/
│       │   │   └── [phaseId]/
│       │   │       └── page.tsx       # Phase detail view
│       │   └── gantt/
│       │       └── page.tsx           # Gantt chart view
├── components/
│   └── ProjectHierarchy/
│       ├── DragDropManager.tsx         # Drag-drop with validation
│       ├── VirtualizedList.tsx        # List virtualization
│       ├── TaskCard.tsx               # Individual task component
│       ├── PhaseAccordion.tsx         # Collapsible phase view
│       └── BulkOperations.tsx         # Bulk selection toolbar
├── hooks/
│   ├── useProjectHierarchy.ts         # React Query hooks
│   ├── useTaskDependencies.ts         # Dependency management
│   └── useOfflineSync.ts              # Offline queue management
└── lib/
    ├── ai/
    │   └── taskRecommendations.ts     # AI recommendation engine
    ├── offline/
    │   └── syncQueue.ts               # Offline sync logic
    └── validation/
        └── circularDependency.ts      # Validation algorithms
```

---

## 🔗 GraphRAG Integration Benefits

### Why GraphRAG for FibreFlow?

The hierarchical nature of fiber optic projects (Projects → Phases → Steps → Tasks) combined with complex relationships (dependencies, assignments, equipment, locations) makes it a perfect fit for graph-based analysis.

### Key Use Cases:

1. **Dependency Analysis**
   - Visualize cascading impacts of delays
   - Identify critical paths automatically
   - Prevent circular dependencies

2. **Resource Optimization**
   - Find optimal staff combinations based on past success
   - Predict equipment conflicts before they occur
   - Balance workload across teams

3. **Natural Language Insights**
   ```
   User: "Which trenching tasks in Johannesburg are blocking aerial work?"
   System: Returns specific tasks with their dependencies visualized
   ```

4. **Pattern Recognition**
   - Identify recurring bottlenecks across projects
   - Detect collaboration patterns that lead to success
   - Predict phase delays based on historical data

5. **Risk Management**
   - See how equipment failures propagate through projects
   - Identify single points of failure in task chains
   - Quantify impact of weather delays on dependent tasks

### Implementation Benefits:

- **Performance**: Graph queries for relationships are faster than complex SQL joins
- **Flexibility**: Easy to add new relationship types without schema changes
- **Intelligence**: AI can traverse the graph to find non-obvious insights
- **Scalability**: Handles millions of relationships efficiently

This implementation follows all claude.md principles while building the comprehensive project management module for FibreFlow.