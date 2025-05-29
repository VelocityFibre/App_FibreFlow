import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { FeatureFlag, useFeatureFlags } from '@/lib/feature-flags';
import { Project } from './useProjects';

// Optimized function to fetch a single project
async function fetchProject(id: string): Promise<Project | null> {
  if (!id) return null;
  
  const { data, error } = await supabase
    .from("new_projects")
    .select("id, name, project_name, created_at, customer_id, start_date, location_id, province, region, current_phase")
    .eq("id", id)
    .single();
  
  if (error) {
    console.error("Error fetching project:", error);
    throw error;
  }
  
  return data;
}

// Hook that works with or without React Query based on feature flag
export function useProject(id: string | undefined) {
  // State for traditional approach
  const [project, setProject] = useState<Project | null>(null);
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
    queryKey: ['project', id],
    queryFn: () => fetchProject(id || ''),
    enabled: shouldUseReactQuery && !!id,
  });
  
  // Traditional fetch implementation
  useEffect(() => {
    if (!shouldUseReactQuery && id) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const data = await fetchProject(id);
          setProject(data);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchData();
    }
  }, [id, shouldUseReactQuery]);
  
  // Return a unified interface regardless of which implementation is used
  if (shouldUseReactQuery) {
    return {
      project: queryResult.data,
      isLoading: queryResult.isLoading,
      error: queryResult.error instanceof Error ? queryResult.error : null,
      refetch: queryResult.refetch,
    };
  }
  
  return {
    project,
    isLoading,
    error,
    refetch: async () => {
      if (!id) return { data: null };
      
      setIsLoading(true);
      try {
        const data = await fetchProject(id);
        setProject(data);
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
