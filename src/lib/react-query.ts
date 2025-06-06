import { 
  QueryClient, 
  QueryKey, 
  UseQueryOptions 
} from '@tanstack/react-query';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// React Query is now always enabled (graduated from feature flag)
export function shouldUseReactQuery(): boolean {
  return true;
}

// Type for conditional query options
export type ConditionalQueryOptions<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
> = UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> & {
  // Add any additional options specific to our conditional queries
  enabled?: boolean;
};

// Helper function to invalidate queries by prefix
export function invalidateQueriesByPrefix(prefix: string) {
  return queryClient.invalidateQueries({ queryKey: [prefix] });
}

// Helper function to reset the query client (useful for logout)
export function resetQueryClient() {
  return queryClient.clear();
}
