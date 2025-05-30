import { supabase } from './supabaseClient';

/**
 * TypeScript client for Supabase RPC functions
 * Provides type-safe access to database stored procedures
 */

// Types for RPC function responses
export interface ProjectHierarchy {
  id: string;
  name: string;
  client_id: string;
  project_manager_id: string;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  status: string;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
  phases: PhaseHierarchy[];
}

export interface PhaseHierarchy {
  id: string;
  name: string;
  phase_type: string;
  order_index: number;
  status: string;
  created_at: string;
  updated_at: string;
  steps: StepHierarchy[];
}

export interface StepHierarchy {
  id: string;
  name: string;
  order_index: number;
  status: string;
  created_at: string;
  updated_at: string;
  tasks: TaskHierarchy[];
}

export interface TaskHierarchy {
  id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  secondary_assignee: string | null;
  status: string;
  progress_percentage: number;
  priority: string;
  start_date: string | null;
  due_date: string | null;
  completed_at: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
  assignee_info: AssigneeInfo | null;
  secondary_assignee_info: AssigneeInfo | null;
  dependencies: TaskDependency[];
}

export interface AssigneeInfo {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface TaskDependency {
  id: string;
  depends_on_task_id: string;
  depends_on_task_title: string;
}

export interface ReorderResult {
  success: boolean;
  message: string;
  step_id: string;
}

export interface BulkUpdateResult {
  success: boolean;
  requested_count: number;
  updated_count: number;
  new_status: string;
  message: string;
}

export interface DependencyTreeNode {
  id: string;
  title: string;
  status: string;
  depth: number;
}

/**
 * Retrieves the complete project hierarchy including all phases, steps, and tasks
 * @param projectId The ID of the project to retrieve
 * @returns The complete project hierarchy or null if not found
 */
export async function getProjectHierarchy(projectId: string): Promise<ProjectHierarchy | null> {
  const { data, error } = await supabase
    .rpc('get_project_hierarchy', { p_project_id: projectId });

  if (error) {
    console.error('Error fetching project hierarchy:', error);
    throw new Error(`Failed to fetch project hierarchy: ${error.message}`);
  }

  return data;
}

/**
 * Reorders tasks within a step
 * @param taskIds Array of task IDs in the desired order
 * @param newPositions Array of new position indices (must match taskIds length)
 * @returns Result of the reorder operation
 */
export async function reorderTasks(
  taskIds: string[], 
  newPositions: number[]
): Promise<ReorderResult> {
  if (taskIds.length !== newPositions.length) {
    throw new Error('Task IDs and positions arrays must have the same length');
  }

  const { data, error } = await supabase
    .rpc('reorder_tasks', { 
      p_task_ids: taskIds,
      p_new_positions: newPositions 
    });

  if (error) {
    console.error('Error reordering tasks:', error);
    throw new Error(`Failed to reorder tasks: ${error.message}`);
  }

  return data;
}

/**
 * Checks if adding a dependency would create a circular dependency
 * @param taskId The task that would have the dependency
 * @param dependsOnTaskId The task that would be depended upon
 * @returns true if it would create a circular dependency, false otherwise
 */
export async function checkCircularDependency(
  taskId: string, 
  dependsOnTaskId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('check_circular_dependency', { 
      p_task_id: taskId,
      p_depends_on_task_id: dependsOnTaskId 
    });

  if (error) {
    console.error('Error checking circular dependency:', error);
    throw new Error(`Failed to check circular dependency: ${error.message}`);
  }

  return data;
}

/**
 * Updates the status of multiple tasks in a single operation
 * Limited to 100 tasks at a time for safety
 * @param taskIds Array of task IDs to update
 * @param newStatus The new status to apply
 * @returns Result of the bulk update operation
 */
export async function bulkUpdateStatus(
  taskIds: string[], 
  newStatus: 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'cancelled'
): Promise<BulkUpdateResult> {
  if (taskIds.length === 0) {
    throw new Error('Task IDs array cannot be empty');
  }

  if (taskIds.length > 100) {
    throw new Error('Bulk operations are limited to 100 tasks at a time for safety');
  }

  const { data, error } = await supabase
    .rpc('bulk_update_status', { 
      p_task_ids: taskIds,
      p_new_status: newStatus 
    });

  if (error) {
    console.error('Error bulk updating task status:', error);
    throw new Error(`Failed to bulk update status: ${error.message}`);
  }

  return data;
}

/**
 * Gets the dependency tree for a task
 * @param taskId The task ID to get dependencies for
 * @returns Array of tasks in the dependency tree
 */
export async function getTaskDependencyTree(taskId: string): Promise<DependencyTreeNode[]> {
  const { data, error } = await supabase
    .rpc('get_task_dependency_tree', { p_task_id: taskId });

  if (error) {
    console.error('Error fetching task dependency tree:', error);
    throw new Error(`Failed to fetch dependency tree: ${error.message}`);
  }

  return data || [];
}

/**
 * Calculates and updates the progress percentage for a project
 * @param projectId The project ID to calculate progress for
 * @returns The calculated progress percentage
 */
export async function calculateProjectProgress(projectId: string): Promise<number> {
  const { data, error } = await supabase
    .rpc('calculate_project_progress', { p_project_id: projectId });

  if (error) {
    console.error('Error calculating project progress:', error);
    throw new Error(`Failed to calculate project progress: ${error.message}`);
  }

  return data;
}

/**
 * Helper function to generate new positions for drag and drop reordering
 * @param items Array of items with current order_index
 * @param dragIndex Index of the dragged item
 * @param dropIndex Index where the item was dropped
 * @returns Object with taskIds and newPositions arrays
 */
export function generateReorderPositions<T extends { id: string; order_index: number }>(
  items: T[],
  dragIndex: number,
  dropIndex: number
): { taskIds: string[]; newPositions: number[] } {
  const reorderedItems = [...items];
  const [draggedItem] = reorderedItems.splice(dragIndex, 1);
  reorderedItems.splice(dropIndex, 0, draggedItem);

  const taskIds = reorderedItems.map(item => item.id);
  const newPositions = reorderedItems.map((_, index) => index);

  return { taskIds, newPositions };
}

/**
 * Validates task dependencies before adding them
 * @param taskId The task that would have the dependency
 * @param dependencyIds Array of task IDs to depend on
 * @returns Object with validation results
 */
export async function validateTaskDependencies(
  taskId: string,
  dependencyIds: string[]
): Promise<{ valid: boolean; circular: string[]; errors: string[] }> {
  const circular: string[] = [];
  const errors: string[] = [];

  // Check each dependency for circular references
  for (const depId of dependencyIds) {
    if (depId === taskId) {
      errors.push('A task cannot depend on itself');
      continue;
    }

    try {
      const isCircular = await checkCircularDependency(taskId, depId);
      if (isCircular) {
        circular.push(depId);
      }
    } catch (error) {
      errors.push(`Failed to validate dependency ${depId}: ${error}`);
    }
  }

  return {
    valid: circular.length === 0 && errors.length === 0,
    circular,
    errors
  };
}