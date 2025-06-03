import { supabase } from './supabaseClient';
import { createAuditLog, AuditAction, AuditResourceType } from './auditLogger';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

/**
 * Soft delete utilities for FibreFlow
 * 
 * These utilities implement the project requirement to never delete records
 * but instead use soft delete with archived_at timestamp.
 */

// Type for tables that support soft delete
export type SoftDeleteTable = 
  | 'projects'
  | 'new_customers'
  | 'phases'
  | 'project_phases'
  | 'project_tasks'
  | 'tasks'
  | 'locations'
  | 'staff'
  | 'audit_logs';

// Map table names to their corresponding audit resource types
const tableToResourceType: Record<SoftDeleteTable, AuditResourceType> = {
  'projects': AuditResourceType.PROJECT,
  'new_customers': AuditResourceType.CUSTOMER,
  'phases': AuditResourceType.PHASE,
  'project_phases': AuditResourceType.PROJECT_PHASE,
  'project_tasks': AuditResourceType.PROJECT_TASK,
  'tasks': AuditResourceType.TASK,
  'locations': AuditResourceType.LOCATION,
  'staff': AuditResourceType.USER,
  'audit_logs': AuditResourceType.SYSTEM
};

/**
 * Archives a record by setting its archived_at timestamp
 * 
 * @param table The table containing the record
 * @param id The ID of the record to archive
 * @param details Optional details about the archiving action
 * @returns The result of the operation
 */
export async function archiveRecord(
  table: SoftDeleteTable,
  id: string,
  details?: Record<string, unknown>
) {
  try {
    // Set the archived_at timestamp to the current time
    const { data, error } = await supabase
      .from(table)
      .update({ archived_at: new Date().toISOString() })
      .eq('id', id)
      .select();

    if (error) {
      console.error(`Error archiving record in ${table}:`, error);
      return { success: false, error };
    }

    // Log the archive action in the audit trail
    await createAuditLog(
      AuditAction.DELETE, // We use DELETE as the action type for archiving
      tableToResourceType[table],
      id,
      {
        action: 'archive',
        ...details
      }
    );

    return { success: true, data };
  } catch (error) {
    console.error(`Unexpected error archiving record in ${table}:`, error);
    return { success: false, error };
  }
}

/**
 * Unarchives a record by clearing its archived_at timestamp
 * 
 * @param table The table containing the record
 * @param id The ID of the record to unarchive
 * @param details Optional details about the unarchiving action
 * @returns The result of the operation
 */
export async function unarchiveRecord(
  table: SoftDeleteTable,
  id: string,
  details?: Record<string, unknown>
) {
  try {
    // Clear the archived_at timestamp
    const { data, error } = await supabase
      .from(table)
      .update({ archived_at: null })
      .eq('id', id)
      .select();

    if (error) {
      console.error(`Error unarchiving record in ${table}:`, error);
      return { success: false, error };
    }

    // Log the unarchive action in the audit trail
    await createAuditLog(
      AuditAction.UPDATE,
      tableToResourceType[table],
      id,
      {
        action: 'unarchive',
        ...details
      }
    );

    return { success: true, data };
  } catch (error) {
    console.error(`Unexpected error unarchiving record in ${table}:`, error);
    return { success: false, error };
  }
}

/**
 * Utility function to add the "exclude archived records" filter to any query
 * 
 * @param query The Supabase query builder
 * @returns The query builder with the filter applied
 */
export function excludeArchived<T>(query: PostgrestFilterBuilder<any, any, T[]>) {
  return query.is('archived_at', null);
}

/**
 * Utility function to only include archived records in a query
 * 
 * @param query The Supabase query builder
 * @returns The query builder with the filter applied
 */
export function onlyArchived<T>(query: PostgrestFilterBuilder<any, any, T[]>) {
  return query.not('archived_at', 'is', null);
}

/**
 * Utility function to include both active and archived records in a query
 * This is useful when you want to see everything regardless of archive status
 * 
 * @param query The Supabase query builder
 * @returns The same query builder without any archive filtering
 */
export function includeArchived<T>(query: PostgrestFilterBuilder<any, any, T[]>) {
  return query;
}

/**
 * Bulk archive multiple records
 * 
 * @param table The table containing the records
 * @param ids Array of IDs to archive
 * @param details Optional details about the bulk archiving action
 * @returns The result of the operation
 */
export async function bulkArchiveRecords(
  table: SoftDeleteTable,
  ids: string[],
  details?: Record<string, unknown>
) {
  try {
    // Validate that we're not trying to bulk archive too many records at once
    // This follows the project rule to always require confirmation for bulk operations affecting > 100 items
    if (ids.length > 100) {
      return { 
        success: false, 
        error: new Error('Bulk archive operations are limited to 100 records at a time for safety') 
      };
    }

    // Set the archived_at timestamp for all specified records
    const { data, error } = await supabase
      .from(table)
      .update({ archived_at: new Date().toISOString() })
      .in('id', ids)
      .select();

    if (error) {
      console.error(`Error bulk archiving records in ${table}:`, error);
      return { success: false, error };
    }

    // Log the bulk archive action in the audit trail
    await createAuditLog(
      AuditAction.DELETE,
      tableToResourceType[table],
      'bulk-operation',
      {
        action: 'bulk-archive',
        count: ids.length,
        ids,
        ...details
      }
    );

    return { success: true, data };
  } catch (error) {
    console.error(`Unexpected error bulk archiving records in ${table}:`, error);
    return { success: false, error };
  }
}
