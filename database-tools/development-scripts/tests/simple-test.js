/**
 * Simple Supabase Connection Test
 * 
 * This script tests the connection to Supabase using the pg library directly,
 * without the complexity of the connection pool setup.
 */

const { Client } = require('pg');

// Connection configuration
const config = {
  // Transaction pooler connection (IPv4 compatible)
  connectionString: 'postgresql://postgres.eutwrybevqvatgecsypw:sbp_ddbef40ce8f65d943bc212b202338a48ebc1040a@aws-0-eu-central-1.pooler.supabase.com:6543/postgres',
  ssl: {
    rejectUnauthorized: false // Allow self-signed certificates
  },
  // Set a reasonable timeout
  connectionTimeoutMillis: 10000,
  query_timeout: 10000
};

async function testConnection() {
  console.log('Testing Supabase connection...');
  console.log('Using Transaction Pooler (IPv4 compatible)');
  console.log('----------------------------------------');
  
  const client = new Client(config);
  
  try {
    // Connect to the database
    console.log('Connecting to Supabase...');
    await client.connect();
    console.log('✅ Connection successful!');
    
    // Run a simple query
    console.log('\nRunning test query...');
    const result = await client.query('SELECT NOW() as current_time');
    console.log(`✅ Query successful! Server time: ${result.rows[0].current_time}`);
    
    // Get database info
    console.log('\nGetting database information...');
    const dbInfo = await client.query('SELECT current_database() as database, current_user as user');
    console.log(`Database: ${dbInfo.rows[0].database}`);
    console.log(`User: ${dbInfo.rows[0].user}`);
    
    return true;
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error(error.message);
    return false;
  } finally {
    // Close the connection
    try {
      await client.end();
      console.log('\nConnection closed.');
    } catch (e) {
      // Ignore errors on close
    }
  }
}

// Run the test
testConnection()
  .then(success => {
    if (!success) {
      console.log('\nTroubleshooting tips:');
      console.log('1. Check if the access token is correct');
      console.log('2. Ensure you have network connectivity to Supabase');
      console.log('3. Try using the Session Pooler instead if Transaction Pooler fails');
      console.log('4. Verify that your IP is allowed in Supabase network settings');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
