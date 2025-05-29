import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { FeatureFlag, useFeatureFlags } from '@/lib/feature-flags';

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
}

// Hook that works with or without React Query based on feature flag
export function useProjects(limit?: number) {
  // State for traditional approach
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Access feature flags
  const { isEnabled } = useFeatureFlags();
  const useReactQuery = isEnabled(FeatureFlag.USE_REACT_QUERY);
  const useOptimizedQueries = isEnabled(FeatureFlag.OPTIMIZED_PROJECT_QUERIES);
  
  // Only use React Query if both flags are enabled
  const shouldUseReactQuery = useReactQuery && useOptimizedQueries;
  
  // React Query implementation
  const queryResult = useQuery({
    queryKey: ['projects', { limit }],
    queryFn: () => fetchProjects(limit),
    enabled: shouldUseReactQuery,
  });
  
  // Traditional fetch implementation
  useEffect(() => {
    if (!shouldUseReactQuery) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const data = await fetchProjects(limit);
          setProjects(data);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchData();
    }
  }, [limit, shouldUseReactQuery]);
  
  // Return a unified interface regardless of which implementation is used
  if (shouldUseReactQuery) {
    return {
      projects: queryResult.data || [],
      isLoading: queryResult.isLoading,
      error: queryResult.error instanceof Error ? queryResult.error : null,
      refetch: queryResult.refetch,
    };
  }
  
  return {
    projects,
    isLoading,
    error,
    refetch: async () => {
      setIsLoading(true);
      try {
        const data = await fetchProjects(limit);
        setProjects(data);
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
