import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { supabase } from './supabaseClient';
import { excludeArchived } from './softDelete';

/**
 * Utility functions for database queries
 * 
 * These functions help standardize query patterns across the application
 * and ensure that soft-deleted records are properly handled.
 */

/**
 * Creates a standard query for a table that excludes archived records by default
 * 
 * @param table The table to query
 * @param columns The columns to select (default: "*")
 * @param includeArchived Whether to include archived records (default: false)
 * @returns A Supabase query builder with appropriate filters
 */
export function createStandardQuery(
  table: string,
  columns: string = "*",
  includeArchived: boolean = false
) {
  let query = supabase.from(table).select(columns);
  
  // Exclude archived records by default unless specifically requested
  if (!includeArchived) {
    query = excludeArchived(query);
  }
  
  return query;
}

/**
 * Fetches a record by ID with standard error handling
 * 
 * @param table The table to query
 * @param id The ID of the record to fetch
 * @param columns The columns to select (default: "*")
 * @param includeArchived Whether to include archived records (default: false)
 * @returns The fetched record or null if not found
 */
export async function fetchById(
  table: string,
  id: string,
  columns: string = "*",
  includeArchived: boolean = false
) {
  try {
    let query = createStandardQuery(table, columns, includeArchived);
    
    const { data, error } = await query.eq('id', id).single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Record not found
        return null;
      }
      console.error(`Error fetching ${table} by ID:`, error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`Unexpected error in fetchById for ${table}:`, error);
    throw error;
  }
}

/**
 * Fetches all records from a table with standard filtering
 * 
 * @param table The table to query
 * @param columns The columns to select (default: "*")
 * @param options Additional query options
 * @returns An array of fetched records
 */
export async function fetchAll(
  table: string,
  columns: string = "*",
  options: {
    includeArchived?: boolean;
    orderBy?: string;
    ascending?: boolean;
    limit?: number;
    filters?: Record<string, any>;
  } = {}
) {
  try {
    const {
      includeArchived = false,
      orderBy,
      ascending = false,
      limit,
      filters = {}
    } = options;
    
    let query = createStandardQuery(table, columns, includeArchived);
    
    // Apply ordering if specified
    if (orderBy) {
      query = query.order(orderBy, { ascending });
    }
    
    // Apply limit if specified
    if (limit) {
      query = query.limit(limit);
    }
    
    // Apply additional filters
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // If value is an array, use "in" filter
        query = query.in(key, value);
      } else if (value === null) {
        // If value is null, use "is" filter
        query = query.is(key, null);
      } else {
        // Otherwise use equality filter
        query = query.eq(key, value);
      }
    });
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`Error fetching all ${table}:`, error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error(`Unexpected error in fetchAll for ${table}:`, error);
    throw error;
  }
}

/**
 * Updates a record with standard error handling and validation
 * 
 * @param table The table containing the record
 * @param id The ID of the record to update
 * @param updates The updates to apply
 * @returns The updated record
 */
export async function updateRecord(
  table: string,
  id: string,
  updates: Record<string, any>
) {
  try {
    // Add updated_at timestamp if not provided
    if (!updates.updated_at) {
      updates.updated_at = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error(`Error updating ${table}:`, error);
      throw error;
    }
    
    return data?.[0] || null;
  } catch (error) {
    console.error(`Unexpected error in updateRecord for ${table}:`, error);
    throw error;
  }
}

/**
 * Creates a new record with standard error handling
 * 
 * @param table The table to insert into
 * @param record The record to insert
 * @returns The created record
 */
export async function createRecord(
  table: string,
  record: Record<string, any>
) {
  try {
    // Add timestamps if not provided
    const now = new Date().toISOString();
    if (!record.created_at) {
      record.created_at = now;
    }
    if (!record.updated_at) {
      record.updated_at = now;
    }
    
    const { data, error } = await supabase
      .from(table)
      .insert(record)
      .select();
    
    if (error) {
      console.error(`Error creating ${table}:`, error);
      throw error;
    }
    
    return data?.[0] || null;
  } catch (error) {
    console.error(`Unexpected error in createRecord for ${table}:`, error);
    throw error;
  }
}
