# FibreFlow Component Architecture

## Table of Contents
1. [Introduction](#introduction)
2. [Component Hierarchy](#component-hierarchy)
3. [Props Interface Documentation](#props-interface-documentation)
4. [State Management Flow](#state-management-flow)
5. [Event Handling Patterns](#event-handling-patterns)
6. [Component Best Practices](#component-best-practices)
7. [Performance Considerations](#performance-considerations)

## Introduction

This document outlines the component architecture for the FibreFlow application, a Next.js 14 fiber optic infrastructure management system. It provides guidance on component organization, props interfaces, state management, and event handling patterns to ensure consistency and maintainability across the codebase.

FibreFlow follows a component-based architecture using React and Next.js 14 with the App Router. The application uses Tailwind CSS for styling with a custom color palette (#003049, #00406a, #f0f5f9) and implements React Query for server state management alongside React hooks for local state.

## Component Hierarchy

### Overall Application Structure

```
App
├── RootLayout
│   ├── Providers
│   │   ├── SupabaseProvider
│   │   ├── ReactQueryProvider
│   │   └── FeatureFlagProvider
│   ├── Header
│   ├── Sidebar
│   └── MainContent
│       ├── ModuleOverviewLayout
│       │   └── ModuleOverviewCard
│       └── PageContent
└── ErrorBoundary
```

### Module-Specific Component Hierarchies

#### Project Management Module

```
ProjectsModule
├── ProjectsList
│   ├── ProjectFilters
│   ├── ProjectCard
│   └── Pagination
├── ProjectDetails
│   ├── ProjectHeader
│   ├── ProjectTabs
│   │   ├── OverviewTab
│   │   │   ├── ProjectSummary
│   │   │   └── ProjectMetrics
│   │   ├── PhasesTab
│   │   │   ├── PhasesList
│   │   │   │   └── PhaseCard
│   │   │   └── PhaseDetails
│   │   │       ├── StepsList
│   │   │       │   └── StepCard
│   │   │       └── StepDetails
│   │   │           └── TasksList
│   │   │               └── TaskCard
│   │   ├── GanttTab
│   │   │   └── GanttChart
│   │   └── DocumentsTab
│   │       └── DocumentsList
│   └── ProjectActions
└── ProjectForm
    ├── FormFields
    └── FormActions
```

#### Analytics Dashboard Module

```
AnalyticsDashboard
├── DashboardHeader
│   └── DashboardFilter
├── DashboardTabs
│   ├── MainDashboard
│   │   ├── KPICards
│   │   ├── BarChart
│   │   ├── LineChart
│   │   └── PieChart
│   ├── ProjectsAnalytics
│   │   ├── ProjectsPerformanceChart
│   │   ├── ProjectsStatusDistribution
│   │   └── ProjectsTimeline
│   ├── TasksAnalytics
│   │   ├── TasksCompletionChart
│   │   ├── TasksAssignmentDistribution
│   │   └── TasksStatusBreakdown
│   ├── LocationsAnalytics
│   │   ├── LocationMap
│   │   └── LocationMetrics
│   └── AuditTrailAnalytics
│       ├── ActivityTimeline
│       └── UserActivityBreakdown
└── PerformanceMonitor
```

#### Audit Trail Module

```
AuditTrailModule
├── AuditLogsList
│   ├── AuditLogsFilter
│   ├── AuditLogItem
│   └── Pagination
└── AuditLogDetails
    ├── ActionDetails
    ├── ResourceDetails
    └── UserDetails
```

## Props Interface Documentation

### Core Components

#### ModuleOverviewLayout

```typescript
interface ModuleOverviewLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: {
    label: string;
    href: string;
  }[];
  isLoading?: boolean;
}
```

#### ModuleOverviewCard

```typescript
interface ModuleOverviewCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  href: string;
  stats?: {
    label: string;
    value: string | number;
  }[];
  status?: 'active' | 'completed' | 'pending' | 'warning' | 'error';
  onClick?: (e: React.MouseEvent) => void;
}
```

#### ActionButton

```typescript
interface ActionButtonProps {
  label: string;
  onClick: (e: React.MouseEvent) => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  confirmMessage?: string;
  requireConfirmation?: boolean;
}
```

### Project Management Components

#### ProjectCard

```typescript
interface ProjectCardProps {
  id: string;
  name: string;
  clientName: string;
  projectManagerName: string;
  startDate: string;
  endDate?: string;
  budget: number;
  progressPercentage: number;
  location?: {
    id: string;
    name: string;
  };
  status: 'not_started' | 'in_progress' | 'on_hold' | 'completed';
  onClick?: (id: string) => void;
}
```

#### PhaseCard

```typescript
interface PhaseCardProps {
  id: string;
  name: string;
  phaseType: string;
  orderIndex: number;
  status: 'not_started' | 'in_progress' | 'on_hold' | 'completed';
  stepCount: number;
  completedStepCount: number;
  isExpanded?: boolean;
  onToggleExpand?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
}
```

#### TaskCard

```typescript
interface TaskCardProps {
  id: string;
  title: string;
  description?: string;
  assignedTo?: {
    id: string;
    name: string;
    avatar?: string;
  };
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'not_started' | 'in_progress' | 'blocked' | 'completed';
  progressPercentage: number;
  dependencies?: {
    id: string;
    title: string;
    status: string;
  }[];
  onStatusChange?: (id: string, status: string) => void;
  onProgressChange?: (id: string, progress: number) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  isDraggable?: boolean;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetId: string) => void;
}
```

### Analytics Components

#### BarChart

```typescript
interface BarChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
    }[];
  };
  options?: Record<string, any>;
  height?: number;
  width?: number;
  isLoading?: boolean;
  emptyStateMessage?: string;
}
```

#### LineChart

```typescript
interface LineChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor?: string;
      tension?: number;
      fill?: boolean;
    }[];
  };
  options?: Record<string, any>;
  height?: number;
  width?: number;
  isLoading?: boolean;
  emptyStateMessage?: string;
}
```

#### DashboardFilter

```typescript
interface DashboardFilterProps {
  filters: {
    dateRange: {
      startDate: Date | null;
      endDate: Date | null;
    };
    projects: string[];
    locations: string[];
    users: string[];
    status: string[];
  };
  availableProjects: { id: string; name: string }[];
  availableLocations: { id: string; name: string }[];
  availableUsers: { id: string; name: string }[];
  availableStatuses: { value: string; label: string }[];
  onFilterChange: (filters: any) => void;
  onReset: () => void;
  isLoading?: boolean;
}
```

### Audit Trail Components

#### AuditLogItem

```typescript
interface AuditLogItemProps {
  id: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'other';
  resourceType: string;
  resourceId: string;
  resourceName?: string;
  userId: string;
  userName: string;
  timestamp: string;
  details?: Record<string, any>;
  onClick?: (id: string) => void;
}
```

## State Management Flow

FibreFlow implements a hybrid state management approach:

1. **Server State**: Managed with React Query
2. **Local UI State**: Managed with React hooks (useState, useReducer)
3. **Feature Flags**: Managed through a central FeatureFlagProvider

### Server State Management

```typescript
// Example of server state management with React Query
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabaseClient } from '@/lib/supabaseClient';

// Query hook for fetching projects
export function useProjects(filters = {}, options = {}) {
  return useQuery(
    ['projects', filters],
    async () => {
      const { data, error } = await supabaseClient
        .from('projects')
        .select('*')
        .match(filters)
        .is('archived_at', null);
      
      if (error) throw error;
      return data;
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      ...options,
    }
  );
}

// Mutation hook for creating a project
export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation(
    async (projectData) => {
      const { data, error } = await supabaseClient
        .from('projects')
        .insert(projectData)
        .single();
      
      if (error) throw error;
      return data;
    },
    {
      onSuccess: () => {
        // Invalidate and refetch projects list
        queryClient.invalidateQueries('projects');
      },
    }
  );
}
```

### Local State Management

```typescript
// Example of local state management with useState and useReducer
import { useState, useReducer } from 'react';

// Simple state with useState
function ProjectForm({ initialData, onSubmit }) {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    client_id: '',
    project_manager_id: '',
    start_date: null,
    end_date: null,
    budget: 0,
    location_id: '',
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  // Form submission logic
}

// Complex state with useReducer
function taskReducer(state, action) {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload, isLoading: false };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? { ...task, ...action.payload } : task
        ),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
}

function TasksManager() {
  const [state, dispatch] = useReducer(taskReducer, {
    tasks: [],
    isLoading: true,
    error: null,
  });
  
  // Task management logic
}
```

### Feature Flag Management

```typescript
// Feature flag provider
import { createContext, useContext, useState, useEffect } from 'react';
import { supabaseClient } from '@/lib/supabaseClient';

const FeatureFlagContext = createContext({});

export function FeatureFlagProvider({ children }) {
  const [flags, setFlags] = useState({
    ANALYTICS_DASHBOARD: false,
    PERFORMANCE_MONITORING: false,
  });
  
  useEffect(() => {
    async function loadFeatureFlags() {
      const { data, error } = await supabaseClient
        .from('feature_flags')
        .select('*');
      
      if (!error && data) {
        const flagsObject = data.reduce((acc, flag) => {
          acc[flag.name] = flag.enabled;
          return acc;
        }, {});
        
        setFlags((prev) => ({ ...prev, ...flagsObject }));
      }
    }
    
    loadFeatureFlags();
  }, []);
  
  return (
    <FeatureFlagContext.Provider value={flags}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlags() {
  return useContext(FeatureFlagContext);
}
```

## Event Handling Patterns

### Form Submission

```typescript
// Standard form submission pattern
function ProjectForm({ onSubmit }) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) {
      newErrors.name = 'Project name is required';
    }
    
    if (!formData.client_id) {
      newErrors.client_id = 'Client is required';
    }
    
    // More validation rules
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      // Success handling
    } catch (error) {
      // Error handling
      setErrors((prev) => ({ ...prev, form: error.message }));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Form rendering
}
```

### Drag and Drop

```typescript
// Drag and drop pattern for task reordering
function TaskList({ tasks, onReorder }) {
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  
  const handleDrop = async (e, targetTaskId) => {
    e.preventDefault();
    const draggedTaskId = e.dataTransfer.getData('taskId');
    
    if (draggedTaskId === targetTaskId) {
      return;
    }
    
    // Check for circular dependencies before reordering
    const { data: hasCircular } = await checkCircularDependency(draggedTaskId, targetTaskId);
    
    if (hasCircular) {
      // Show visual feedback for circular dependency
      return;
    }
    
    // Find indices for reordering
    const draggedIndex = tasks.findIndex((task) => task.id === draggedTaskId);
    const targetIndex = tasks.findIndex((task) => task.id === targetTaskId);
    
    onReorder(draggedTaskId, targetTaskId, draggedIndex, targetIndex);
  };
  
  return (
    <div className="task-list">
      {tasks.map((task) => (
        <div
          key={task.id}
          draggable
          onDragStart={(e) => handleDragStart(e, task.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, task.id)}
          className="task-item"
        >
          {task.title}
        </div>
      ))}
    </div>
  );
}
```

### Confirmation Dialogs

```typescript
// Confirmation dialog pattern for destructive actions
function DeleteConfirmation({ isOpen, onClose, onConfirm, itemName }) {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent>
        Are you sure you want to delete {itemName}? This action cannot be undone.
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outline">
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="danger">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Usage
function ProjectActions({ project }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const handleDelete = async () => {
    try {
      await deleteProject(project.id);
      // Success handling
    } catch (error) {
      // Error handling
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };
  
  return (
    <>
      <Button
        variant="danger"
        onClick={() => setIsDeleteDialogOpen(true)}
      >
        Delete Project
      </Button>
      
      <DeleteConfirmation
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        itemName={project.name}
      />
    </>
  );
}
```

### Debounced Search

```typescript
// Debounced search pattern
import { useState, useEffect } from 'react';
import { debounce } from 'lodash';

function SearchInput({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Create debounced search function
  const debouncedSearch = debounce((term) => {
    onSearch(term);
  }, 300);
  
  useEffect(() => {
    debouncedSearch(searchTerm);
    
    // Cleanup
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, debouncedSearch]);
  
  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
      className="search-input"
    />
  );
}
```

## Component Best Practices

### Component Structure

1. **Atomic Design Methodology**
   - Atoms: Basic UI elements (buttons, inputs, icons)
   - Molecules: Groups of atoms (form fields, cards)
   - Organisms: Groups of molecules (forms, lists)
   - Templates: Page layouts
   - Pages: Specific instances of templates

2. **Component Organization**
   - Each component in its own directory
   - Include index.ts for clean exports
   - Co-locate related files (component, styles, tests)

```
/components
  /ui
    /Button
      Button.tsx
      Button.test.tsx
      index.ts
  /project
    /ProjectCard
      ProjectCard.tsx
      ProjectCard.test.tsx
      index.ts
```

### Performance Optimization

1. **Memoization**
   - Use React.memo for expensive renders
   - Use useMemo for expensive calculations
   - Use useCallback for event handlers passed to child components

```typescript
// Memoization example
import { memo, useMemo, useCallback } from 'react';

const ProjectList = memo(function ProjectList({ projects, onSelect }) {
  // Memoize expensive calculations
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => a.name.localeCompare(b.name));
  }, [projects]);
  
  // Memoize event handlers
  const handleSelect = useCallback((id) => {
    onSelect(id);
  }, [onSelect]);
  
  return (
    <div>
      {sortedProjects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
});
```

2. **Lazy Loading**
   - Lazy load components larger than 50KB
   - Use Suspense for loading states

```typescript
// Lazy loading example
import { lazy, Suspense } from 'react';

const AnalyticsDashboard = lazy(() => import('@/components/analytics/AnalyticsDashboard'));

function AnalyticsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AnalyticsDashboard />
    </Suspense>
  );
}
```

### Error Handling

1. **Error Boundaries**
   - Implement error boundaries to catch and handle component errors
   - Provide fallback UI for failed components

```typescript
// Error boundary component
import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  fallback?: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to monitoring service
    console.error('Component error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong. Please try again.</div>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

## Performance Considerations

### Rendering Optimization

1. **Virtualization for Long Lists**
   - Use virtualization for lists with more than 100 items
   - Implement with react-window or react-virtualized

```typescript
// Virtualized list example
import { FixedSizeList } from 'react-window';

function VirtualizedTaskList({ tasks }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <TaskCard task={tasks[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={500}
      width="100%"
      itemCount={tasks.length}
      itemSize={80}
    >
      {Row}
    </FixedSizeList>
  );
}
```

2. **Code Splitting**
   - Split code by routes
   - Split large components into smaller chunks

```typescript
// Code splitting by routes in Next.js App Router
// app/projects/page.tsx
export default function ProjectsPage() {
  return <ProjectsList />;
}

// app/projects/[id]/page.tsx
export default function ProjectDetailsPage({ params }) {
  return <ProjectDetails id={params.id} />;
}
```

### State Management Optimization

1. **Selective Re-rendering**
   - Use context selectors to prevent unnecessary re-renders
   - Split contexts by domain to minimize re-renders

```typescript
// Context selector example
import { createContext, useContext, useReducer, useMemo } from 'react';

const ProjectsStateContext = createContext();
const ProjectsDispatchContext = createContext();

export function ProjectsProvider({ children }) {
  const [state, dispatch] = useReducer(projectsReducer, initialState);
  
  // Memoize the value to prevent unnecessary re-renders
  const dispatchValue = useMemo(() => dispatch, []);
  
  return (
    <ProjectsStateContext.Provider value={state}>
      <ProjectsDispatchContext.Provider value={dispatchValue}>
        {children}
      </ProjectsDispatchContext.Provider>
    </ProjectsStateContext.Provider>
  );
}

// Selective context hooks
export function useProjectsState() {
  return useContext(ProjectsStateContext);
}

export function useProjectsDispatch() {
  return useContext(ProjectsDispatchContext);
}

// Usage with selective re-rendering
function ProjectCount() {
  // Only re-renders when the count changes
  const { count } = useProjectsState();
  return <div>Total Projects: {count}</div>;
}

function ProjectList() {
  // Only re-renders when the projects array changes
  const { projects } = useProjectsState();
  return <div>{projects.map(p => <ProjectCard key={p.id} project={p} />)}</div>;
}
```

2. **Optimistic Updates**
   - Implement optimistic updates with rollback for mutations
   - Update UI immediately before API call completes

```typescript
// Optimistic update example
function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  
  return useMutation(
    async ({ taskId, status }) => {
      return await updateTaskStatus(taskId, status);
    },
    {
      // Optimistically update the cache
      onMutate: async ({ taskId, status }) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries(['task', taskId]);
        
        // Snapshot the previous value
        const previousTask = queryClient.getQueryData(['task', taskId]);
        
        // Optimistically update the cache
        queryClient.setQueryData(['task', taskId], old => ({
          ...old,
          status,
        }));
        
        // Return the snapshot for rollback
        return { previousTask };
      },
      // On error, roll back to the previous value
      onError: (err, { taskId }, context) => {
        queryClient.setQueryData(
          ['task', taskId],
          context.previousTask
        );
      },
      // Always refetch after error or success
      onSettled: (data, error, { taskId }) => {
        queryClient.invalidateQueries(['task', taskId]);
      },
    }
  );
}
```

### Network Optimization

1. **Request Batching**
   - Batch multiple API calls when possible
   - Implement request deduplication

2. **Caching Strategy**
   - Implement appropriate cache times for different data types
   - Use stale-while-revalidate pattern

```typescript
// Caching strategy example
function useProjects(filters) {
  return useQuery(
    ['projects', filters],
    () => fetchProjects(filters),
    {
      // Keep data fresh for 1 minute
      staleTime: 60 * 1000,
      // Keep cached data for 5 minutes
      cacheTime: 5 * 60 * 1000,
      // Refetch on window focus
      refetchOnWindowFocus: true,
      // Retry failed requests 3 times
      retry: 3,
    }
  );
}
```
