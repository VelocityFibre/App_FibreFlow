import { 
  QueryClient, 
  QueryClientProvider, 
  QueryKey, 
  UseQueryOptions 
} from '@tanstack/react-query';
import { ReactNode } from 'react';
import { FeatureFlag, useFeatureFlags } from './feature-flags';

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

// Conditional QueryClientProvider that only wraps children if the feature flag is enabled
export function ConditionalQueryClientProvider({ children }: { children: ReactNode }) {
  const { isEnabled } = useFeatureFlags();
  const useReactQuery = isEnabled(FeatureFlag.USE_REACT_QUERY);

  if (useReactQuery) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return <>{children}</>;
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
