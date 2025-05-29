import { supabase } from './supabase';

// Function to inspect the schema of a table
export async function inspectTableSchema(tableName: string) {
  try {
    // Use system tables to get column information
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      console.error(`Error inspecting ${tableName} schema:`, error);
      return { success: false, error };
    }
    
    // If we got data, we can see what columns are available from the first row
    if (data && data.length > 0) {
      const columns = Object.keys(data[0]);
      console.log(`${tableName} schema columns:`, columns);
      return { success: true, columns };
    } else {
      // If no data, try to get column info from the error message when selecting a non-existent column
      const { error } = await supabase
        .from(tableName)
        .select('__non_existent_column__')
        .limit(1);
      
      if (error && error.message) {
        console.log(`${tableName} error info:`, error);
        return { success: false, error, message: 'No data available to inspect schema' };
      }
      
      return { success: false, message: 'Unable to determine schema' };
    }
  } catch (error) {
    console.error(`Unexpected error inspecting ${tableName} schema:`, error);
    return { success: false, error };
  }
}
