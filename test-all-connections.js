/**
 * Supabase Connection Test Script
 * 
 * This script tests all three connection methods to Supabase:
 * 1. Direct Connection
 * 2. Transaction Pooler
 * 3. Session Pooler
 * 
 * Usage: node test-all-connections.js <your-password>
 */

const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');

// Get password from command line argument
const password = process.argv[2];

if (!password) {
  console.error('Error: Password is required');
  console.error('Usage: node test-all-connections.js <your-password>');
  process.exit(1);
}

// Connection configurations
const directConfig = {
  connectionString: `postgresql://postgres:${password}@db.eutwrybevqvatgecsypw.supabase.co:5432/postgres`,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 15000,
  query_timeout: 10000
};

const transactionPoolerConfig = {
  connectionString: `postgresql://postgres.eutwrybevqvatgecsypw:${password}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 15000,
  query_timeout: 10000
};

const sessionPoolerConfig = {
  connectionString: `postgresql://postgres.eutwrybevqvatgecsypw:${password}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 15000,
  query_timeout: 10000
};

// Supabase JS client config
const SUPABASE_URL = 'https://eutwrybevqvatgecsypw.supabase.co';
const customFetch = (url, options = {}) => {
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${password}`,
    'apikey': password
  };
  
  return fetch(url, { ...options, headers });
};

// Initialize the Supabase client with custom fetch
const supabase = createClient(SUPABASE_URL, password, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    fetch: customFetch
  }
});

/**
 * Test a PostgreSQL connection
 */
async function testPgConnection(config, connectionType) {
  console.log(`\nTesting ${connectionType}...`);
  console.log('----------------------------------------');
  
  const client = new Client(config);
  
  try {
    // Connect to the database
    await client.connect();
    
    // Test the connection by running a simple query
    const result = await client.query('SELECT current_timestamp as time, current_database() as db, version() as version');
    
    console.log('✅ Connection successful!');
    console.log(`Server time: ${result.rows[0].time}`);
    console.log(`Database: ${result.rows[0].db}`);
    console.log(`PostgreSQL version: ${result.rows[0].version}`);
    
    // Test listing tables
    const tablesResult = await client.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema') 
      LIMIT 5
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log('\nAvailable tables:');
      tablesResult.rows.forEach(row => {
        console.log(`- ${row.table_schema}.${row.table_name}`);
      });
    } else {
      console.log('\nNo user tables found.');
    }
    
    return true;
  } catch (err) {
    console.error(`❌ Connection failed:`);
    console.error(err.message);
    
    if (err.code) {
      console.error(`Error code: ${err.code}`);
    }
    
    return false;
  } finally {
    // Always close the connection
    try {
      await client.end();
    } catch (e) {
      // Ignore errors during disconnect
    }
  }
}

/**
 * Test Supabase JS client connection
 */
async function testSupabaseJsConnection() {
  console.log('\nTesting Supabase JavaScript Client...');
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

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('Supabase Connection Tests');
  console.log('========================\n');
  
  // Test DNS resolution first
  console.log('Testing DNS resolution...');
  try {
    const dns = require('dns');
    const { promisify } = require('util');
    const lookup = promisify(dns.lookup);
    
    const directHost = 'db.eutwrybevqvatgecsypw.supabase.co';
    const poolerHost = 'aws-0-eu-central-1.pooler.supabase.com';
    
    const directResult = await lookup(directHost).catch(() => null);
    const poolerResult = await lookup(poolerHost).catch(() => null);
    
    if (directResult) {
      console.log(`✅ Direct connection DNS resolution: ${directResult.address} (${directResult.family === 4 ? 'IPv4' : 'IPv6'})`);
    } else {
      console.error('❌ Direct connection DNS resolution failed');
    }
    
    if (poolerResult) {
      console.log(`✅ Pooler DNS resolution: ${poolerResult.address} (${poolerResult.family === 4 ? 'IPv4' : 'IPv6'})`);
    } else {
      console.error('❌ Pooler DNS resolution failed');
    }
  } catch (err) {
    console.error(`❌ DNS resolution error: ${err.message}`);
  }
  
  // Test all connection methods
  const results = {
    direct: false,
    transaction: false,
    session: false,
    supabaseJs: false
  };
  
  try {
    // Try direct connection (may fail on IPv4-only networks)
    results.direct = await testPgConnection(directConfig, 'Direct Connection (port 5432)');
  } catch (e) {
    console.error('Error testing direct connection:', e.message);
  }
  
  try {
    // Try transaction pooler
    results.transaction = await testPgConnection(transactionPoolerConfig, 'Transaction Pooler (port 6543)');
  } catch (e) {
    console.error('Error testing transaction pooler:', e.message);
  }
  
  try {
    // Try session pooler
    results.session = await testPgConnection(sessionPoolerConfig, 'Session Pooler (port 5432)');
  } catch (e) {
    console.error('Error testing session pooler:', e.message);
  }
  
  try {
    // Try Supabase JS client
    results.supabaseJs = await testSupabaseJsConnection();
  } catch (e) {
    console.error('Error testing Supabase JS client:', e.message);
  }
  
  // Summary
  console.log('\n========================');
  console.log('Connection Test Results:');
  console.log('========================');
  console.log(`Direct Connection: ${results.direct ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`Transaction Pooler: ${results.transaction ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`Session Pooler: ${results.session ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`Supabase JS Client: ${results.supabaseJs ? '✅ SUCCESS' : '❌ FAILED'}`);
  
  // Recommendations
  console.log('\nRecommendations:');
  if (results.direct || results.transaction || results.session || results.supabaseJs) {
    console.log('✅ At least one connection method worked! Use the successful method(s) for your application.');
    
    if (results.direct) {
      console.log('- Direct Connection: Best for persistent applications (VMs, containers)');
    }
    if (results.transaction) {
      console.log('- Transaction Pooler: Best for stateless applications (serverless functions)');
    }
    if (results.session) {
      console.log('- Session Pooler: Alternative to Direct Connection for IPv4 networks');
    }
    if (results.supabaseJs) {
      console.log('- Supabase JS Client: Best for frontend applications or when using Supabase features');
    }
  } else {
    console.log('❌ All connection methods failed. Check the following:');
    console.log('1. Verify your password is correct');
    console.log('2. Check your network connectivity to Supabase');
    console.log('3. Verify your IP is allowed in Supabase network settings');
    console.log('4. For API key issues, check the Supabase dashboard');
  }
}

// Run all tests
runAllTests()
  .catch(err => {
    console.error('Unexpected error:', err);
  })
  .finally(() => {
    // Exit when done
    setTimeout(() => process.exit(), 1000);
  });
