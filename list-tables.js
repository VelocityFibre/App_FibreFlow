/**
 * List Tables in Supabase Database
 * 
 * This script lists all tables in your Supabase database using the anon key.
 */

// Load environment variables from .env file
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Get Supabase URL and anon key from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Initialize the Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * List all tables in the database using metadata query
 */
async function listTables() {
  try {
    console.log('Listing tables in your Supabase database...');
    
    // Query the PostgreSQL information_schema to get table information
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_schema, table_name, table_type')
      .eq('table_schema', 'public')
      .order('table_name');
    
    if (error) {
      throw error;
    }
    
    if (data && data.length > 0) {
      console.log('✅ Found tables:');
      console.table(data.map(table => ({
        schema: table.table_schema,
        name: table.table_name,
        type: table.table_type
      })));
      return data;
    } else {
      console.log('No tables found in the public schema.');
      console.log('You might need to create some tables first.');
    }
    
    return [];
  } catch (error) {
    console.error('❌ Failed to list tables:', error.message);
    
    // Try an alternative approach if the first one fails
    try {
      console.log('\nTrying alternative approach...');
      
      // Query using pg_tables instead
      const { data, error } = await supabase
        .from('pg_catalog.pg_tables')
        .select('schemaname, tablename')
        .eq('schemaname', 'public');
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log('✅ Found tables:');
        console.table(data.map(table => ({
          schema: table.schemaname,
          name: table.tablename
        })));
        return data;
      } else {
        console.log('No tables found in the public schema.');
      }
      
      return [];
    } catch (altError) {
      console.error('❌ Alternative approach failed:', altError.message);
      
      console.log('\nIt seems you might not have permission to view database metadata with the anon key.');
      console.log('This is expected with Row Level Security. You have a few options:');
      console.log('1. Use the service_role key instead (recommended for admin operations)');
      console.log('2. Create a custom RPC function in Supabase to list tables');
      console.log('3. Create tables directly through the Supabase dashboard');
      
      return null;
    }
  }
}

// Run the function
listTables()
  .catch(err => {
    console.error('Unexpected error:', err);
  });
