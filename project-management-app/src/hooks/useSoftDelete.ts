import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  archiveRecord, 
  unarchiveRecord, 
  bulkArchiveRecords,
  SoftDeleteTable 
} from '@/lib/softDelete';
import { createAuditLog, AuditAction, AuditResourceType } from '@/lib/auditLogger';

/**
 * Custom hook for managing soft delete operations
 * 
 * This hook provides a consistent interface for archiving and unarchiving records
 * across the application, with built-in error handling and loading states.
 */
export function useSoftDelete() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();

  /**
   * Archive a record (soft delete)
   * 
   * @param table The table containing the record
   * @param id The ID of the record to archive
   * @param options Additional options
   * @returns Promise resolving to the operation result
   */
  const archive = async (
    table: SoftDeleteTable,
    id: string,
    options?: {
      details?: Record<string, unknown>;
      invalidateQueries?: string[];
    }
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await archiveRecord(table, id, options?.details);
      
      // Invalidate relevant queries to refresh data
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(query => {
          queryClient.invalidateQueries({ queryKey: [query] });
        });
      } else {
        // By default, invalidate queries for the table
        queryClient.invalidateQueries({ queryKey: [table] });
      }
      
      setLoading(false);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      setLoading(false);
      return { success: false, error };
    }
  };

  /**
   * Unarchive a record (restore from soft delete)
   * 
   * @param table The table containing the record
   * @param id The ID of the record to unarchive
   * @param options Additional options
   * @returns Promise resolving to the operation result
   */
  const unarchive = async (
    table: SoftDeleteTable,
    id: string,
    options?: {
      details?: Record<string, unknown>;
      invalidateQueries?: string[];
    }
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await unarchiveRecord(table, id, options?.details);
      
      // Invalidate relevant queries to refresh data
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(query => {
          queryClient.invalidateQueries({ queryKey: [query] });
        });
      } else {
        // By default, invalidate queries for the table
        queryClient.invalidateQueries({ queryKey: [table] });
      }
      
      setLoading(false);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      setLoading(false);
      return { success: false, error };
    }
  };

  /**
   * Bulk archive multiple records
   * 
   * @param table The table containing the records
   * @param ids Array of IDs to archive
   * @param options Additional options
   * @returns Promise resolving to the operation result
   */
  const bulkArchive = async (
    table: SoftDeleteTable,
    ids: string[],
    options?: {
      details?: Record<string, unknown>;
      invalidateQueries?: string[];
    }
  ) => {
    // Implement project rule #38: Always require confirmation for bulk operations affecting > 100 items
    if (ids.length > 100) {
      setError(new Error('Bulk archive operations are limited to 100 records at a time for safety'));
      return { 
        success: false, 
        error: new Error('Bulk archive operations are limited to 100 records at a time for safety') 
      };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await bulkArchiveRecords(table, ids, options?.details);
      
      // Invalidate relevant queries to refresh data
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(query => {
          queryClient.invalidateQueries({ queryKey: [query] });
        });
      } else {
        // By default, invalidate queries for the table
        queryClient.invalidateQueries({ queryKey: [table] });
      }
      
      setLoading(false);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      setLoading(false);
      return { success: false, error };
    }
  };

  return {
    archive,
    unarchive,
    bulkArchive,
    loading,
    error
  };
}
