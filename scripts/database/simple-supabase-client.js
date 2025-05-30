/**
 * Simple Supabase Client
 * 
 * A straightforward way to connect to Supabase and perform basic operations.
 */

const { createClient } = require('@supabase/supabase-js');

// Your Supabase URL and anon key (public)
const supabaseUrl = 'https://eutwrybevqvatgecsypw.supabase.co';
const supabaseKey = 'Xoouphae2415!';

// Initialize the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Simple function to test the connection
async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Simple query to check connection
    const { data, error } = await supabase.from('_test').select('*').limit(1);
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }
}

// Example function to create a table
async function createTable() {
  try {
    console.log('Creating a test table...');
    
    // Using SQL query through RPC to create a table
    const { error } = await supabase.rpc('create_test_table');
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Table created successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to create table:', error.message);
    return false;
  }
}

// Example function to insert data
async function insertData(name, email) {
  try {
    console.log(`Inserting data: ${name}, ${email}`);
    
    const { data, error } = await supabase
      .from('users')
      .insert([{ name, email }]);
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Data inserted successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to insert data:', error.message);
    return false;
  }
}

// Example function to query data
async function queryData() {
  try {
    console.log('Querying data...');
    
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Data retrieved successfully!');
    console.log(data);
    return data;
  } catch (error) {
    console.error('❌ Failed to query data:', error.message);
    return null;
  }
}

// Run a simple test
async function runTest() {
  const connected = await testConnection();
  
  if (connected) {
    console.log('\nYou can now use the supabase client to interact with your database!');
    console.log('Here are some example operations:');
    console.log('1. Create a table: await createTable()');
    console.log('2. Insert data: await insertData("John Doe", "john@example.com")');
    console.log('3. Query data: await queryData()');
  } else {
    console.log('\nTroubleshooting tips:');
    console.log('1. Check if your Supabase URL and API key are correct');
    console.log('2. Ensure you have network connectivity to Supabase');
    console.log('3. Verify that your IP is allowed in Supabase network settings');
    console.log('   (Go to Supabase Dashboard > Project Settings > API > JWT Settings)');
    console.log('4. Make sure you\'re using the correct API key type (anon/public or service_role)');
  }
}

// Export functions for use in other files
module.exports = {
  supabase,
  testConnection,
  createTable,
  insertData,
  queryData
};

// If this file is run directly, run the test
if (require.main === module) {
  runTest();
}
