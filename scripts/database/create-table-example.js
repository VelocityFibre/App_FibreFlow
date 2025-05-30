/**
 * Supabase Table Creation and Data Example
 * 
 * This script demonstrates how to create a table and insert data
 * using the Supabase JavaScript client.
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
 * Create a table using SQL query through RPC
 * Note: This might not work with the anon key due to permissions
 */
async function createTable() {
  try {
    console.log('Attempting to create a customers table...');
    
    // SQL to create the table
    const sql = `
      CREATE TABLE IF NOT EXISTS customers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        phone TEXT,
        status TEXT DEFAULT 'active'
      );
    `;
    
    // Execute SQL through RPC
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Table created successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to create table:', error.message);
    console.log('\nNote: Creating tables usually requires the service_role key or');
    console.log('needs to be done through the Supabase dashboard.');
    return false;
  }
}

/**
 * Insert data into the customers table
 */
async function insertData() {
  try {
    console.log('Inserting sample data into customers table...');
    
    const { data, error } = await supabase
      .from('customers')
      .insert([
        {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890'
        },
        {
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+0987654321'
        }
      ])
      .select();
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Data inserted successfully!');
    console.log('Inserted records:', data);
    return data;
  } catch (error) {
    console.error('❌ Failed to insert data:', error.message);
    return null;
  }
}

/**
 * Query data from the customers table
 */
async function queryData() {
  try {
    console.log('Querying data from customers table...');
    
    const { data, error } = await supabase
      .from('customers')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    if (data && data.length > 0) {
      console.log('✅ Data retrieved successfully!');
      console.table(data);
    } else {
      console.log('No records found in customers table.');
    }
    
    return data;
  } catch (error) {
    console.error('❌ Failed to query data:', error.message);
    return null;
  }
}

/**
 * Run all operations
 */
async function runExample() {
  console.log('Supabase Table and Data Example');
  console.log('===============================\n');
  
  // Try to create the table
  await createTable();
  
  // Try to insert data
  await insertData();
  
  // Query the data
  await queryData();
  
  console.log('\nNote: If you encountered errors, you might need to:');
  console.log('1. Create the table through the Supabase dashboard first');
  console.log('2. Use the service_role key for admin operations');
  console.log('3. Set up proper Row Level Security (RLS) policies');
}

// Run the example
runExample()
  .catch(err => {
    console.error('Unexpected error:', err);
  });
