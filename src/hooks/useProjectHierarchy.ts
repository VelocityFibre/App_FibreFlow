import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types for the 4-level hierarchy
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'blocked' | 'complete' | 'cancelled';
  order_index: number;
  assignee_id?: string;
  estimated_hours?: number;
  actual_hours?: number;
  step_id: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface Step {
  id: string;
  name: string;
  description?: string;
  order_index: number;
  phase_id: string;
  tasks: Task[];
}

export interface Phase {
  id: string;
  name: string;
  description?: string;
  order_index: number;
  is_standard: boolean;
  project_phase_id: string;
  steps: Step[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectHierarchy {
  project: Project;
  phases: Phase[];
}

// Hook to fetch complete project hierarchy
export function useProjectHierarchy(projectId: string) {
  return useQuery<ProjectHierarchy>({
    queryKey: ['project-hierarchy', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/hierarchy/${projectId}`);
      const data = await response.json();
      
      if (!response.ok) {
        // Include the error data in the thrown error
        const error = new Error(data.error || `Failed to fetch hierarchy: ${response.statusText}`);
        (error as any).data = data;
        throw error;
      }
      
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!projectId,
  });
}

// Hook to create a new step
export function useCreateStep() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (stepData: { 
      phase_id: string; 
      name: string; 
      description?: string;
      order_index?: number;
    }) => {
      const response = await fetch('/api/steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stepData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create step');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate project hierarchy queries to refetch
      queryClient.invalidateQueries({ queryKey: ['project-hierarchy'] });
    },
  });
}

// Hook to update a step
export function useUpdateStep() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (stepData: { 
      id: string;
      name?: string;
      description?: string;
      order_index?: number;
    }) => {
      const response = await fetch('/api/steps', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stepData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update step');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-hierarchy'] });
    },
  });
}

// Hook to delete a step
export function useDeleteStep() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (stepId: string) => {
      const response = await fetch(`/api/steps?id=${stepId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete step');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-hierarchy'] });
    },
  });
}

// Hook to reorder steps within a phase
export function useReorderSteps() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reorderData: {
      phase_id: string;
      step_orders: { id: string; order_index: number }[];
    }) => {
      const response = await fetch('/api/steps/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reorderData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reorder steps');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-hierarchy'] });
    },
  });
}

// Hook to move tasks between steps or reorder within step
export function useMoveTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (moveData: {
      task_id?: string;
      new_step_id?: string;
      new_order_index?: number;
      task_orders?: { id: string; order_index: number; step_id?: string }[];
    }) => {
      const response = await fetch('/api/tasks/move', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(moveData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to move task');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-hierarchy'] });
    },
  });
}

// Hook to get steps for a specific phase
export function useSteps(phaseId?: string) {
  return useQuery({
    queryKey: ['steps', phaseId],
    queryFn: async () => {
      const url = phaseId ? `/api/steps?phase_id=${phaseId}` : '/api/steps';
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch steps');
      }
      
      return response.json();
    },
    enabled: !!phaseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to update task status
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (taskData: { 
      id: string;
      status: 'pending' | 'in_progress' | 'blocked' | 'complete' | 'cancelled';
    }) => {
      console.log('Updating task:', taskData);
      
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        
        throw new Error(errorData.error || errorData.details || 'Failed to update task status');
      }
      
      const result = await response.json();
      console.log('Success response:', result);
      return result;
    },
    onSuccess: () => {
      // Invalidate project hierarchy queries to refetch
      queryClient.invalidateQueries({ queryKey: ['project-hierarchy'] });
    },
  });
}