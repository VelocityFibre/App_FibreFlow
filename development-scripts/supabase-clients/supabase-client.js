/**
 * Supabase Client
 * 
 * A proper implementation of the Supabase client using environment variables
 * for secure API key storage.
 */

// Load environment variables from .env file
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Get Supabase URL and API key from environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://eutwrybevqvatgecsypw.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;

// Check if API key is available
if (!supabaseKey) {
  console.error('Error: SUPABASE_KEY is not set in environment variables');
  console.error('Please add your Supabase API key to the .env file');
  process.exit(1);
}

// Initialize the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Test the connection
async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Get user information to verify connection
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Connection successful!');
    
    // Try to access a table (this will depend on your database structure)
    console.log('\nAttempting to query a table...');
    const { data, error: queryError } = await supabase
      .from('users')  // Replace with an actual table in your database
      .select('*')
      .limit(5);
    
    if (queryError) {
      console.log(`Note: Could not query table: ${queryError.message}`);
      console.log('This is normal if the table doesn\'t exist or you don\'t have permission.');
    } else {
      console.log('✅ Successfully queried table!');
      console.log('Data:', data);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }
}

// Example function to create a table
async function createTable(tableName, columns) {
  try {
    console.log(`Creating table: ${tableName}`);
    
    // Using SQL query through RPC to create a table
    // Note: This requires proper permissions and may not work with anon key
    const { error } = await supabase.rpc('create_table', { 
      table_name: tableName,
      columns_def: columns 
    });
    
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
async function insertData(tableName, data) {
  try {
    console.log(`Inserting data into ${tableName}`);
    
    const { data: result, error } = await supabase
      .from(tableName)
      .insert([data]);
    
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
async function queryData(tableName, columns = '*', limit = 10) {
  try {
    console.log(`Querying data from ${tableName}`);
    
    const { data, error } = await supabase
      .from(tableName)
      .select(columns)
      .limit(limit);
    
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

// Export the client and functions
module.exports = {
  supabase,
  testConnection,
  createTable,
  insertData,
  queryData
};

// If this file is run directly, test the connection
if (require.main === module) {
  testConnection()
    .then(connected => {
      if (connected) {
        console.log('\nYou can now use the supabase client to interact with your database!');
        console.log('To use this client in other files:');
        console.log('const { supabase } = require(\'./supabase-client\');');
      } else {
        console.log('\nTroubleshooting tips:');
        console.log('1. Check if your Supabase API key is correct in the .env file');
        console.log('2. Ensure you have network connectivity to Supabase');
        console.log('3. Verify that your IP is allowed in Supabase network settings');
        console.log('   (Go to Supabase Dashboard > Project Settings > API > JWT Settings)');
        console.log('4. Make sure you\'re using the correct API key type (anon/public or service_role)');
      }
    });
}
