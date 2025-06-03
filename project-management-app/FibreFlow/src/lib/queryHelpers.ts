import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { supabase } from './supabaseClient';

/**
 * Helper functions for common query patterns
 * These utilities help standardize database queries across the application
 * and ensure that soft-deleted (archived) records are properly handled.
 */

/**
 * Enhances a Supabase query to exclude archived records
 * 
 * @param query The Supabase query to enhance
 * @returns The query with archived records excluded
 */
export function withoutArchived<T>(query: PostgrestFilterBuilder<any, any, T[]>) {
  return query.is('archived_at', null);
}

/**
 * Enhances a Supabase query to only include archived records
 * 
 * @param query The Supabase query to enhance
 * @returns The query with only archived records included
 */
export function onlyArchived<T>(query: PostgrestFilterBuilder<any, any, T[]>) {
  return query.not('archived_at', 'is', null);
}

/**
 * Creates a standard select query for a table with archived records excluded by default
 * 
 * @param table The table to query
 * @param columns The columns to select (default: "*")
 * @param includeArchived Whether to include archived records (default: false)
 * @returns A Supabase query builder
 */
export function selectFrom(
  table: string,
  columns: string = "*",
  includeArchived: boolean = false
) {
  const query = supabase.from(table).select(columns);
  return includeArchived ? query : withoutArchived(query);
}

/**
 * Creates a standard select query for a specific record by ID
 * 
 * @param table The table to query
 * @param id The ID of the record to select
 * @param columns The columns to select (default: "*")
 * @param includeArchived Whether to include archived records (default: false)
 * @returns A Supabase query builder
 */
export function selectById(
  table: string,
  id: string,
  columns: string = "*",
  includeArchived: boolean = false
) {
  const query = selectFrom(table, columns, includeArchived);
  return query.eq('id', id);
}

/**
 * Creates a standard update query for a specific record by ID
 * 
 * @param table The table to update
 * @param id The ID of the record to update
 * @param updates The updates to apply
 * @returns A Supabase query builder
 */
export function updateById(
  table: string,
  id: string,
  updates: Record<string, any>
) {
  // Add updated_at timestamp if not provided
  if (!updates.updated_at) {
    updates.updated_at = new Date().toISOString();
  }
  
  return supabase.from(table).update(updates).eq('id', id);
}

/**
 * Creates a standard insert query with timestamps
 * 
 * @param table The table to insert into
 * @param data The data to insert
 * @returns A Supabase query builder
 */
export function insertInto(
  table: string,
  data: Record<string, any> | Record<string, any>[]
) {
  const now = new Date().toISOString();
  
  // Add timestamps to each record
  if (Array.isArray(data)) {
    data = data.map(record => ({
      ...record,
      created_at: record.created_at || now,
      updated_at: record.updated_at || now
    }));
  } else {
    data = {
      ...data,
      created_at: data.created_at || now,
      updated_at: data.updated_at || now
    };
  }
  
  return supabase.from(table).insert(data);
}
