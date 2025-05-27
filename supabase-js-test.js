/**
 * Supabase JavaScript Client Test
 * 
 * This script tests the connection to Supabase using the official JavaScript client
 * with the database password for authentication.
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase project URL and password
const SUPABASE_URL = 'https://eutwrybevqvatgecsypw.supabase.co';
const SUPABASE_PASSWORD = 'Xoouphae2415!';

// Create a custom fetch implementation that includes the password as a header
const customFetch = (url, options = {}) => {
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${SUPABASE_PASSWORD}`,
    'apikey': SUPABASE_PASSWORD
  };
  
  return fetch(url, { ...options, headers });
};

// Initialize the Supabase client with custom fetch
const supabase = createClient(SUPABASE_URL, SUPABASE_PASSWORD, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    fetch: customFetch
  }
});

async function testSupabaseConnection() {
  console.log('Testing Supabase connection using the JavaScript client...');
  console.log('----------------------------------------');
  
  try {
    // Test the connection by making a simple query
    console.log('Making a test query to the database...');
    
    // Try to query public tables
    const { data, error } = await supabase
      .from('pg_catalog.pg_tables')
      .select('schemaname, tablename')
      .limit(5);
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Connection successful!');
    console.log('Tables found:');
    console.table(data);
    
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

// Run the test
testSupabaseConnection()
  .then(success => {
    if (!success) {
      console.log('\nTroubleshooting tips:');
      console.log('1. Check if the password is correct');
      console.log('2. Ensure you have network connectivity to Supabase');
      console.log('3. Verify that your IP is allowed in Supabase network settings');
      console.log('4. The password provided might not be an API key');
      console.log('5. You might need to get an API key from the Supabase dashboard');
    }
    
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
