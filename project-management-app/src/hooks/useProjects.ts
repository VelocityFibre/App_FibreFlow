import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { measureAsync } from '@/lib/performance';

// Define project type based on the current implementation
export type Project = {
  id: string;
  name?: string;
  project_name?: string;
  created_at?: string;
  customer_id?: string;
  start_date?: string;
  location_id?: string;
  province?: string;
  region?: string;
  current_phase?: string;
};

// Optimized function to fetch projects
async function fetchProjects(limit?: number): Promise<Project[]> {
  return measureAsync('fetchProjects', async () => {
    let query = supabase
      .from("new_projects")
      .select("id, name, project_name, created_at, customer_id, start_date, location_id, province, region, current_phase")
      .order("created_at", { ascending: false });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching projects:", error);
      throw error;
    }
    
    return data || [];
  });
}

// Optimized hook always uses React Query (graduated from feature flag)
export function useProjects(limit?: number) {
  // Always use React Query with optimized queries
  const queryResult = useQuery({
    queryKey: ['projects', { limit }],
    queryFn: () => fetchProjects(limit),
  });
  
  return {
    projects: queryResult.data || [],
    isLoading: queryResult.isLoading,
    error: queryResult.error instanceof Error ? queryResult.error : null,
    refetch: queryResult.refetch,
  };
}
