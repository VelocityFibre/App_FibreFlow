/**
 * Rate-Limited Supabase Client
 * 
 * Wraps Supabase operations with rate limiting to prevent abuse
 */

import { supabase } from './supabase';
import { RATE_LIMITS, withRateLimitCheck } from './rateLimiter';

// Get current user ID for rate limiting
// TODO: Replace with actual auth context when implemented
function getCurrentUserId(): string {
  // For now, use a placeholder - in production this should come from auth context
  if (typeof window !== 'undefined') {
    return localStorage.getItem('temp_user_id') || 'anonymous';
  }
  return 'server';
}

/**
 * Rate-limited database read operations
 */
export const rateLimitedSupabase = {
  // READ operations (less restrictive)
  async select<T = any>(table: string, query?: string): Promise<{ data: T[] | null; error: any }> {
    const userId = getCurrentUserId();
    
    return withRateLimitCheck(
      userId,
      RATE_LIMITS.DATABASE_READ,
      async () => {
        if (query) {
          return supabase.from(table).select(query);
        }
        return supabase.from(table).select('*');
      }
    );
  },

  // WRITE operations (more restrictive)
  async insert<T = any>(
    table: string, 
    data: any, 
    options?: { select?: string }
  ): Promise<{ data: T | null; error: any }> {
    const userId = getCurrentUserId();
    
    return withRateLimitCheck(
      userId,
      RATE_LIMITS.DATABASE_WRITE,
      async () => {
        let query = supabase.from(table).insert(data);
        if (options?.select) {
          query = query.select(options.select);
        }
        return query;
      }
    );
  },

  async update<T = any>(
    table: string,
    data: any,
    filter: { column: string; value: any },
    options?: { select?: string }
  ): Promise<{ data: T | null; error: any }> {
    const userId = getCurrentUserId();
    
    return withRateLimitCheck(
      userId,
      RATE_LIMITS.DATABASE_WRITE,
      async () => {
        let query = supabase.from(table).update(data).eq(filter.column, filter.value);
        if (options?.select) {
          query = query.select(options.select);
        }
        return query;
      }
    );
  },

  async upsert<T = any>(
    table: string,
    data: any,
    options?: { select?: string; onConflict?: string }
  ): Promise<{ data: T | null; error: any }> {
    const userId = getCurrentUserId();
    
    return withRateLimitCheck(
      userId,
      RATE_LIMITS.DATABASE_WRITE,
      async () => {
        let query = supabase.from(table).upsert(data, { onConflict: options?.onConflict });
        if (options?.select) {
          query = query.select(options.select);
        }
        return query;
      }
    );
  },

  async delete<T = any>(
    table: string,
    filter: { column: string; value: any }
  ): Promise<{ data: T | null; error: any }> {
    const userId = getCurrentUserId();
    
    return withRateLimitCheck(
      userId,
      RATE_LIMITS.DATABASE_WRITE,
      async () => {
        return supabase.from(table).delete().eq(filter.column, filter.value);
      }
    );
  },

  // BULK operations (most restrictive)
  async bulkInsert<T = any>(
    table: string,
    data: any[],
    options?: { select?: string }
  ): Promise<{ data: T[] | null; error: any }> {
    const userId = getCurrentUserId();
    
    // Additional validation for bulk operations
    if (data.length > 100) {
      throw new Error('Bulk operations are limited to 100 records at a time for safety');
    }
    
    return withRateLimitCheck(
      userId,
      RATE_LIMITS.DATABASE_BULK,
      async () => {
        let query = supabase.from(table).insert(data);
        if (options?.select) {
          query = query.select(options.select);
        }
        return query;
      }
    );
  },

  async bulkUpdate<T = any>(
    table: string,
    updates: Array<{ filter: { column: string; value: any }; data: any }>,
    options?: { select?: string }
  ): Promise<Array<{ data: T | null; error: any }>> {
    const userId = getCurrentUserId();
    
    if (updates.length > 100) {
      throw new Error('Bulk operations are limited to 100 records at a time for safety');
    }
    
    return withRateLimitCheck(
      userId,
      RATE_LIMITS.DATABASE_BULK,
      async () => {
        // Execute all updates in parallel but within rate limit
        const results = await Promise.all(
          updates.map(async ({ filter, data }) => {
            let query = supabase.from(table).update(data).eq(filter.column, filter.value);
            if (options?.select) {
              query = query.select(options.select);
            }
            return query;
          })
        );
        return results;
      }
    );
  },

  // RPC operations (function calls)
  async rpc<T = any>(
    functionName: string,
    params?: Record<string, any>
  ): Promise<{ data: T | null; error: any }> {
    const userId = getCurrentUserId();
    
    return withRateLimitCheck(
      userId,
      RATE_LIMITS.DATABASE_READ, // RPC functions are often read-heavy
      async () => {
        return supabase.rpc(functionName, params);
      }
    );
  },

  // Real-time subscriptions
  async subscribe(
    table: string,
    callback: (payload: any) => void,
    options?: { event?: string; filter?: string }
  ): Promise<{ unsubscribe: () => void }> {
    const userId = getCurrentUserId();
    
    return withRateLimitCheck(
      userId,
      RATE_LIMITS.REALTIME_SUBSCRIBE,
      async () => {
        const channel = supabase.channel(`${table}_${Date.now()}`);
        
        let subscription = channel.on(
          'postgres_changes' as any,
          {
            event: options?.event || '*',
            schema: 'public',
            table,
            filter: options?.filter
          },
          callback
        );

        await channel.subscribe();

        return {
          unsubscribe: () => {
            supabase.removeChannel(channel);
          }
        };
      }
    );
  },

  // File upload operations
  async uploadFile(
    bucket: string,
    path: string,
    file: File | Blob,
    options?: { contentType?: string; upsert?: boolean }
  ): Promise<{ data: any; error: any }> {
    const userId = getCurrentUserId();
    
    return withRateLimitCheck(
      userId,
      RATE_LIMITS.FILE_UPLOAD,
      async () => {
        return supabase.storage.from(bucket).upload(path, file, {
          contentType: options?.contentType,
          upsert: options?.upsert
        });
      }
    );
  },

  // Direct access to original client for advanced usage
  get client() {
    return supabase;
  }
};

/**
 * Higher-order function to add rate limiting to existing Supabase queries
 */
export function withRateLimit<T extends (...args: any[]) => Promise<any>>(
  operation: T,
  limitType: keyof typeof RATE_LIMITS = 'DATABASE_READ'
): T {
  return (async (...args: any[]) => {
    const userId = getCurrentUserId();
    
    return withRateLimitCheck(
      userId,
      RATE_LIMITS[limitType],
      () => operation(...args)
    );
  }) as T;
}

/**
 * Utility to check current rate limit status
 */
export function getRateLimitStatus(limitType: keyof typeof RATE_LIMITS = 'DATABASE_READ') {
  const userId = getCurrentUserId();
  const { rateLimiter } = require('./rateLimiter');
  
  return rateLimiter.getUsage(userId, RATE_LIMITS[limitType]);
}

// Export for convenience
export { RATE_LIMITS } from './rateLimiter';

// Example usage in components:
/*
import { rateLimitedSupabase } from '@/lib/supabaseRateLimited';

// Instead of:
// const { data } = await supabase.from('projects').select('*');

// Use:
const { data } = await rateLimitedSupabase.select('projects');

// For bulk operations:
const { data } = await rateLimitedSupabase.bulkInsert('projects', projectsArray);

// For RPC functions:
const { data } = await rateLimitedSupabase.rpc('get_project_hierarchy', { project_id: id });
*/