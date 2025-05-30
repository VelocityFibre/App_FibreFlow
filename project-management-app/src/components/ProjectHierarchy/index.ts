/**
 * Project Hierarchy Components
 * 
 * Complete 4-level hierarchy implementation: Project → Phases → Steps → Tasks
 * 
 * Features:
 * - Simple rendering for current scale (10 projects, no virtualization)
 * - Expandable/collapsible hierarchy levels
 * - Status indicators and progress tracking
 * - Real-time updates ready (when subscriptions are integrated)
 * - Dark mode support
 * - Mobile responsive design
 */

// Main components
export { default as ProjectList } from './ProjectList';
export { default as ProjectCard } from './ProjectCard';
export { default as ProjectHierarchyView } from './ProjectHierarchyView';

// Hierarchy level components
export { default as PhaseAccordion } from './PhaseAccordion';
export { default as StepContainer } from './StepContainer';
export { default as TaskCard } from './TaskCard';

// Export types for convenience
export type { Project } from '@/hooks/useProjects';
export type { 
  ProjectHierarchy, 
  PhaseHierarchy, 
  StepHierarchy, 
  TaskHierarchy 
} from '@/lib/rpcFunctions';