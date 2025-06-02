import { supabase } from './supabaseClient';

// Function to test Supabase connection
export async function testSupabaseConnection() {
  try {
    // Try a simple query to check connection - avoid using aggregate functions
    const { data, error } = await supabase.from('customers').select('id').limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return { success: false, error };
    }
    
    console.log('Supabase connection successful:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error in Supabase connection test:', error);
    return { success: false, error };
  }
}

// Function to test if projects table exists and is accessible
export async function testProjectsTable() {
  try {
    // Try a simple query on the projects table - avoid using aggregate functions
    const { data, error } = await supabase.from('projects').select('id').limit(1);
    
    if (error) {
      console.error('Projects table test failed:', error);
      return { success: false, error };
    }
    
    console.log('Projects table test successful:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error in projects table test:', error);
    return { success: false, error };
  }
}
