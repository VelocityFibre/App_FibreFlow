/**
 * Supabase Client Library Test
 * 
 * This script tests the connection to Supabase using the official Supabase JavaScript client.
 * This approach is recommended over direct PostgreSQL connections.
 */

// First, let's install the required dependencies
// You'll need to run: npm install @supabase/supabase-js

const { createClient } = require('@supabase/supabase-js');

// Supabase project URL and API key
const SUPABASE_URL = 'https://eutwrybevqvatgecsypw.supabase.co';
const SUPABASE_KEY = 'Xoouphae2415!'; // Database password

// Initialize the Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testSupabaseConnection() {
  console.log('Testing Supabase connection using the Supabase client library...');
  console.log('----------------------------------------');
  
  try {
    // Test the connection by making a simple query
    console.log('Making a test query to the database...');
    
    // Query the current timestamp from Postgres
    const { data, error } = await supabase.rpc('get_timestamp');
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Connection successful!');
    console.log(`Server timestamp: ${data}`);
    
    // Test fetching some data
    console.log('\nTesting data access...');
    const { data: tables, error: tablesError } = await supabase
      .from('pg_catalog.pg_tables')
      .select('schemaname, tablename')
      .limit(5);
    
    if (tablesError) {
      console.error('❌ Error fetching tables:', tablesError.message);
    } else {
      console.log('✅ Successfully fetched table information:');
      console.table(tables);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error(error.message);
    
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    
    return false;
  }
}

// Create a stored procedure for getting the timestamp
async function createTimestampFunction() {
  try {
    // First check if the function exists
    console.log('Setting up test function...');
    
    // Create a temporary client to create the function
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: `postgresql://postgres.eutwrybevqvatgecsypw:${SUPABASE_KEY}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    try {
      // Try to create the function
      await pool.query(`
        CREATE OR REPLACE FUNCTION get_timestamp()
        RETURNS TIMESTAMP WITH TIME ZONE
        LANGUAGE SQL
        AS $$
          SELECT NOW();
        $$;
      `);
      console.log('✅ Test function created successfully');
    } catch (err) {
      console.log('Note: Could not create test function. Will try to use it anyway.');
    } finally {
      await pool.end();
    }
  } catch (err) {
    console.log('Could not set up test function. Continuing with test...');
  }
}

// Run the tests
async function runTests() {
  try {
    await createTimestampFunction();
    const success = await testSupabaseConnection();
    
    if (!success) {
      console.log('\nTroubleshooting tips:');
      console.log('1. Check if the API key is correct');
      console.log('2. Ensure you have network connectivity to Supabase');
      console.log('3. Verify that your IP is allowed in Supabase network settings');
      console.log('4. Check if you need to use a different authentication method');
      console.log('5. Try using the REST API endpoint instead');
    }
    
    process.exit(success ? 0 : 1);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

runTests();
