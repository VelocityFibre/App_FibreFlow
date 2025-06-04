/**
 * Enhanced Supabase Client
 * 
 * This client supports both anonymous and service role authentication
 * for different use cases.
 */

// Load environment variables from .env file
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Get Supabase URL from environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://eutwrybevqvatgecsypw.supabase.co';

// Get API keys from environment variables
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

// Check if at least one key is available
if (!anonKey && !serviceKey) {
  console.error('Error: Neither SUPABASE_ANON_KEY nor SUPABASE_SERVICE_KEY is set in environment variables');
  console.error('Please add at least one of your Supabase API keys to the .env file');
  process.exit(1);
}

// Create clients with both keys if available
const supabaseAnon = anonKey ? createClient(supabaseUrl, anonKey) : null;
const supabaseService = serviceKey ? createClient(supabaseUrl, serviceKey) : null;

// Default to service client if available, otherwise use anon client
const supabase = supabaseService || supabaseAnon;

/**
 * Test the connection to Supabase
 * @param {string} clientType - 'anon' or 'service'
 */
async function testConnection(clientType = 'both') {
  console.log('Testing Supabase connection...');
  
  if (clientType === 'both' || clientType === 'anon') {
    if (supabaseAnon) {
      console.log('\nTesting Anonymous Client (Row Level Security applies):');
      try {
        const { data, error } = await supabaseAnon.from('users').select('*').limit(5);
        
        if (error) {
          console.log('❌ Anonymous client test failed:', error.message);
        } else {
          console.log('✅ Anonymous client connected successfully!');
          if (data && data.length > 0) {
            console.log(`Found ${data.length} records in users table`);
          } else {
            console.log('No records found or no access to users table (expected with RLS)');
          }
        }
      } catch (error) {
        console.error('❌ Anonymous client error:', error.message);
      }
    } else {
      console.log('⚠️ Anonymous client not configured (SUPABASE_ANON_KEY not set)');
    }
  }
  
  if (clientType === 'both' || clientType === 'service') {
    if (supabaseService) {
      console.log('\nTesting Service Client (Full access, bypasses RLS):');
      try {
        const { data, error } = await supabaseService.from('users').select('*').limit(5);
        
        if (error) {
          console.log('❌ Service client test failed:', error.message);
        } else {
          console.log('✅ Service client connected successfully!');
          if (data && data.length > 0) {
            console.log(`Found ${data.length} records in users table`);
          } else {
            console.log('No records found in users table (table might be empty or not exist)');
          }
        }
      } catch (error) {
        console.error('❌ Service client error:', error.message);
      }
    } else {
      console.log('⚠️ Service client not configured (SUPABASE_SERVICE_KEY not set)');
    }
  }
}

/**
 * List all tables in the database (requires service role)
 */
async function listTables() {
  if (!supabaseService) {
    console.error('❌ Service client required for this operation (SUPABASE_SERVICE_KEY not set)');
    return null;
  }
  
  try {
    console.log('Listing all tables (using service role)...');
    
    // Query to list all tables
    const { data, error } = await supabaseService.rpc('list_tables');
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Tables retrieved successfully!');
    console.table(data);
    return data;
  } catch (error) {
    // Try an alternative approach if RPC fails
    try {
      console.log('Trying alternative approach to list tables...');
      
      const { data, error } = await supabaseService.from('information_schema.tables')
        .select('table_schema, table_name')
        .eq('table_schema', 'public');
      
      if (error) {
        throw error;
      }
      
      console.log('✅ Tables retrieved successfully!');
      console.table(data);
      return data;
    } catch (altError) {
      console.error('❌ Failed to list tables:', altError.message);
      return null;
    }
  }
}

/**
 * Create a new table (requires service role)
 * @param {string} tableName - Name of the table to create
 * @param {Object} schema - Table schema definition
 */
async function createTable(tableName, schema) {
  if (!supabaseService) {
    console.error('❌ Service client required for this operation (SUPABASE_SERVICE_KEY not set)');
    return false;
  }
  
  try {
    console.log(`Creating table: ${tableName}`);
    
    // SQL to create the table
    const sql = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        ${Object.entries(schema).map(([column, type]) => `${column} ${type}`).join(',\n        ')}
      );
    `;
    
    const { error } = await supabaseService.rpc('execute_sql', { sql });
    
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

/**
 * Insert data into a table
 * @param {string} tableName - Name of the table
 * @param {Object|Array} data - Data to insert
 * @param {boolean} useServiceRole - Whether to use service role client
 */
async function insertData(tableName, data, useServiceRole = false) {
  const client = useServiceRole ? supabaseService : supabaseAnon;
  
  if (!client) {
    console.error(`❌ Required client not available`);
    return false;
  }
  
  try {
    console.log(`Inserting data into ${tableName}`);
    
    const { data: result, error } = await client
      .from(tableName)
      .insert(data)
      .select();
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Data inserted successfully!');
    console.log('Inserted records:', result);
    return result;
  } catch (error) {
    console.error('❌ Failed to insert data:', error.message);
    return false;
  }
}

/**
 * Query data from a table
 * @param {string} tableName - Name of the table
 * @param {string} columns - Columns to select
 * @param {Object} filters - Query filters
 * @param {boolean} useServiceRole - Whether to use service role client
 */
async function queryData(tableName, columns = '*', filters = {}, useServiceRole = false) {
  const client = useServiceRole ? supabaseService : supabaseAnon;
  
  if (!client) {
    console.error(`❌ Required client not available`);
    return null;
  }
  
  try {
    console.log(`Querying data from ${tableName}`);
    
    let query = client
      .from(tableName)
      .select(columns);
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Data retrieved successfully!');
    console.log('Records:', data);
    return data;
  } catch (error) {
    console.error('❌ Failed to query data:', error.message);
    return null;
  }
}

// Export the clients and functions
module.exports = {
  supabase,
  supabaseAnon,
  supabaseService,
  testConnection,
  listTables,
  createTable,
  insertData,
  queryData
};

// If this file is run directly, test the connection
if (require.main === module) {
  testConnection()
    .then(() => {
      console.log('\n=== Usage Examples ===');
      console.log('1. List all tables:');
      console.log('   const { listTables } = require(\'./enhanced-supabase-client\');');
      console.log('   await listTables();');
      
      console.log('\n2. Create a new table:');
      console.log('   const { createTable } = require(\'./enhanced-supabase-client\');');
      console.log('   await createTable(\'contacts\', {');
      console.log('     name: \'TEXT NOT NULL\',');
      console.log('     email: \'TEXT UNIQUE\',');
      console.log('     phone: \'TEXT\'');
      console.log('   });');
      
      console.log('\n3. Insert data:');
      console.log('   const { insertData } = require(\'./enhanced-supabase-client\');');
      console.log('   await insertData(\'contacts\', {');
      console.log('     name: \'John Doe\',');
      console.log('     email: \'john@example.com\',');
      console.log('     phone: \'+1234567890\'');
      console.log('   }, true); // true = use service role');
      
      console.log('\n4. Query data:');
      console.log('   const { queryData } = require(\'./enhanced-supabase-client\');');
      console.log('   await queryData(\'contacts\', \'*\', { name: \'John Doe\' }, true);');
    });
}
