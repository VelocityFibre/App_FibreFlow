import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { FeatureFlag, isFeatureEnabled } from '@/lib/feature-flags';
import { shouldUseReactQuery } from '@/lib/react-query';
import { measureAsync } from '@/lib/performance';

// Define task type based on the current implementation
export type Task = {
  id: number;
  name: string;
  description?: string;
  status: 'not_started' | 'in_progress' | 'pending' | 'completed';
  assigned_to?: string;
  project_id?: string;
  created_at?: string;
  updated_at?: string;
  days_assigned?: number;
  delay_reason?: string;
};

// Optimized function to fetch tasks
async function fetchTasks(projectId?: string): Promise<Task[]> {
  return measureAsync('fetchTasks', async () => {
    let query = supabase
      .from("project_tasks")
      .select("id, name, description, status, assigned_to, project_id, created_at, updated_at");
    
    if (projectId) {
      query = query.eq("project_id", projectId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
    
    return data || [];
  });
}

// Hook that works with or without React Query based on feature flag
export function useTasks(projectId?: string) {
  // State for traditional approach
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Check if we should use optimized queries
  const useOptimizedQueries = isFeatureEnabled(FeatureFlag.OPTIMIZED_TASK_QUERIES);
  
  // Only use React Query if both flags are enabled
  const useReactQueryForTasks = shouldUseReactQuery() && useOptimizedQueries;
  
  // React Query implementation
  const queryResult = useQuery({
    queryKey: ['tasks', { projectId }],
    queryFn: () => fetchTasks(projectId),
    enabled: useReactQueryForTasks,
  });
  
  // Traditional fetch implementation
  useEffect(() => {
    if (!useReactQueryForTasks) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const data = await fetchTasks(projectId);
          setTasks(data);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchData();
    }
  }, [projectId, useReactQueryForTasks]);
  
  // Return a unified interface regardless of which implementation is used
  if (useReactQueryForTasks) {
    return {
      tasks: queryResult.data || [],
      isLoading: queryResult.isLoading,
      error: queryResult.error instanceof Error ? queryResult.error : null,
      refetch: queryResult.refetch,
    };
  }
  
  return {
    tasks,
    isLoading,
    error,
    refetch: async () => {
      setIsLoading(true);
      try {
        const data = await fetchTasks(projectId);
        setTasks(data);
        setError(null);
        return { data };
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
  };
}
