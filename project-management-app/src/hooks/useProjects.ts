import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { measureAsync } from '@/lib/performance';
import { excludeArchived, includeArchived } from '@/lib/softDelete';

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
  archived_at?: string | null;
};

// Optimized function to fetch projects
async function fetchProjects(limit?: number, includeArchived?: boolean): Promise<Project[]> {
  return measureAsync('fetchProjects', async () => {
    let query = supabase
      .from("projects")
      .select("id, name, project_name, created_at, customer_id, start_date, location_id, province, region, current_phase, archived_at")
      .order("created_at", { ascending: false });
    
    // By default, exclude archived records unless specifically requested
    if (!includeArchived) {
      query = excludeArchived(query);
    }
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching projects:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }
    
    // Map to consistent format, handling both name and project_name fields
    return (data || []).map(project => ({
      ...project,
      name: project.name || project.project_name || 'Unnamed Project'
    }));
  });
}

// Optimized hook always uses React Query (graduated from feature flag)
export function useProjects(limit?: number, includeArchived?: boolean) {
  // Always use React Query with optimized queries
  const queryResult = useQuery({
    queryKey: ['projects', { limit, includeArchived }],
    queryFn: () => fetchProjects(limit, includeArchived),
  });
  
  return {
    projects: queryResult.data || [],
    isLoading: queryResult.isLoading,
    error: queryResult.error instanceof Error ? queryResult.error : null,
    refetch: queryResult.refetch,
  };
}
