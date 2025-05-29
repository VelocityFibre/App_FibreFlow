import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
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

// Optimized hook always uses React Query (graduated from feature flag)
export function useTasks(projectId?: string) {
  // Always use React Query with optimized queries
  const queryResult = useQuery({
    queryKey: ['tasks', { projectId }],
    queryFn: () => fetchTasks(projectId),
  });
  
  return {
    tasks: queryResult.data || [],
    isLoading: queryResult.isLoading,
    error: queryResult.error instanceof Error ? queryResult.error : null,
    refetch: queryResult.refetch,
  };
}
