import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  getProjectHierarchy,
  reorderTasks,
  checkCircularDependency,
  bulkUpdateStatus,
  getTaskDependencyTree,
  calculateProjectProgress,
  ProjectHierarchy,
  ReorderResult,
  BulkUpdateResult,
  DependencyTreeNode
} from '@/lib/rpcFunctions';

/**
 * React Query hooks for project hierarchy management
 * Provides optimistic updates and caching for all RPC operations
 */

/**
 * Hook to fetch and cache project hierarchy
 */
export function useProjectHierarchy(projectId: string | undefined) {
  return useQuery<ProjectHierarchy | null>({
    queryKey: ['project-hierarchy', projectId],
    queryFn: () => projectId ? getProjectHierarchy(projectId) : null,
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to reorder tasks with optimistic updates
 */
export function useReorderTasks() {
  const queryClient = useQueryClient();

  return useMutation<ReorderResult, Error, { taskIds: string[]; newPositions: number[]; projectId: string }>({
    mutationFn: ({ taskIds, newPositions }) => reorderTasks(taskIds, newPositions),
    
    onMutate: async ({ taskIds, newPositions, projectId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['project-hierarchy', projectId] });

      // Snapshot the previous value
      const previousHierarchy = queryClient.getQueryData<ProjectHierarchy>(['project-hierarchy', projectId]);

      // Optimistically update the hierarchy
      if (previousHierarchy) {
        const updatedHierarchy = { ...previousHierarchy };
        
        // Find and update the affected tasks
        updatedHierarchy.phases.forEach(phase => {
          phase.steps.forEach(step => {
            const affectedTasks = step.tasks.filter(task => taskIds.includes(task.id));
            if (affectedTasks.length > 0) {
              // Create a map of taskId to new position
              const positionMap = new Map(taskIds.map((id, index) => [id, newPositions[index]]));
              
              // Update order_index for affected tasks
              step.tasks = step.tasks.map(task => {
                const newPosition = positionMap.get(task.id);
                return newPosition !== undefined 
                  ? { ...task, order_index: newPosition }
                  : task;
              }).sort((a, b) => a.order_index - b.order_index);
            }
          });
        });

        queryClient.setQueryData(['project-hierarchy', projectId], updatedHierarchy);
      }

      return { previousHierarchy };
    },

    onError: (err, variables, context) => {
      // Revert to the previous value on error
      if (context?.previousHierarchy) {
        queryClient.setQueryData(['project-hierarchy', variables.projectId], context.previousHierarchy);
      }
      toast.error(`Failed to reorder tasks: ${err.message}`);
    },

    onSuccess: (data) => {
      toast.success(data.message);
    },

    onSettled: (_, __, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['project-hierarchy', variables.projectId] });
    },
  });
}

/**
 * Hook to check for circular dependencies
 */
export function useCheckCircularDependency() {
  return useMutation<boolean, Error, { taskId: string; dependsOnTaskId: string }>({
    mutationFn: ({ taskId, dependsOnTaskId }) => checkCircularDependency(taskId, dependsOnTaskId),
  });
}

/**
 * Hook to bulk update task statuses with optimistic updates
 */
export function useBulkUpdateStatus() {
  const queryClient = useQueryClient();

  return useMutation<
    BulkUpdateResult, 
    Error, 
    { 
      taskIds: string[]; 
      newStatus: 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';
      projectId: string;
    }
  >({
    mutationFn: ({ taskIds, newStatus }) => bulkUpdateStatus(taskIds, newStatus),
    
    onMutate: async ({ taskIds, newStatus, projectId }) => {
      await queryClient.cancelQueries({ queryKey: ['project-hierarchy', projectId] });

      const previousHierarchy = queryClient.getQueryData<ProjectHierarchy>(['project-hierarchy', projectId]);

      if (previousHierarchy) {
        const updatedHierarchy = { ...previousHierarchy };
        
        // Update status for all affected tasks
        updatedHierarchy.phases.forEach(phase => {
          phase.steps.forEach(step => {
            step.tasks = step.tasks.map(task => {
              if (taskIds.includes(task.id)) {
                return {
                  ...task,
                  status: newStatus,
                  progress_percentage: newStatus === 'completed' ? 100 : 
                                     newStatus === 'not_started' ? 0 : 
                                     task.progress_percentage,
                  completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
                };
              }
              return task;
            });
          });
        });

        queryClient.setQueryData(['project-hierarchy', projectId], updatedHierarchy);
      }

      return { previousHierarchy };
    },

    onError: (err, variables, context) => {
      if (context?.previousHierarchy) {
        queryClient.setQueryData(['project-hierarchy', variables.projectId], context.previousHierarchy);
      }
      toast.error(`Failed to update task statuses: ${err.message}`);
    },

    onSuccess: (data) => {
      toast.success(data.message);
    },

    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-hierarchy', variables.projectId] });
      // Also invalidate the project progress
      queryClient.invalidateQueries({ queryKey: ['project-progress', variables.projectId] });
    },
  });
}

/**
 * Hook to fetch task dependency tree
 */
export function useTaskDependencyTree(taskId: string | undefined) {
  return useQuery<DependencyTreeNode[]>({
    queryKey: ['task-dependency-tree', taskId],
    queryFn: () => taskId ? getTaskDependencyTree(taskId) : [],
    enabled: !!taskId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to calculate and update project progress
 */
export function useCalculateProjectProgress() {
  const queryClient = useQueryClient();

  return useMutation<number, Error, string>({
    mutationFn: (projectId) => calculateProjectProgress(projectId),
    
    onSuccess: (progress, projectId) => {
      // Update the cached project data with new progress
      queryClient.setQueryData(['project-progress', projectId], progress);
      
      // Invalidate project queries to reflect the new progress
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      
      toast.success(`Project progress updated: ${progress}%`);
    },

    onError: (err) => {
      toast.error(`Failed to calculate project progress: ${err.message}`);
    },
  });
}

/**
 * Hook to get cached project progress
 */
export function useProjectProgress(projectId: string | undefined) {
  return useQuery<number>({
    queryKey: ['project-progress', projectId],
    queryFn: () => projectId ? calculateProjectProgress(projectId) : 0,
    enabled: !!projectId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}