/**
 * Supabase Transaction Pooler Connection Test
 * 
 * This script tests the connection to Supabase using the transaction pooler,
 * which is IPv4 compatible and ideal for stateless applications.
 */

const { Client } = require('pg');

// Connection configuration for Transaction Pooler
const config = {
  // Transaction pooler connection (IPv4 compatible)
  connectionString: 'postgresql://postgres.eutwrybevqvatgecsypw:Xoouphae2415!@aws-0-eu-central-1.pooler.supabase.com:6543/postgres',
  ssl: {
    rejectUnauthorized: false // Allow self-signed certificates
  },
  // Set a reasonable timeout
  connectionTimeoutMillis: 15000,
  query_timeout: 10000
};

async function testConnection() {
  console.log('Testing Supabase connection...');
  console.log('Using Transaction Pooler (IPv4 compatible, port 6543)');
  console.log('----------------------------------------');
  
  // First, test DNS resolution
  console.log('Testing DNS resolution...');
  try {
    const dns = require('dns');
    const { promisify } = require('util');
    const lookup = promisify(dns.lookup);
    
    const host = 'aws-0-eu-central-1.pooler.supabase.com';
    const result = await lookup(host);
    
    console.log(`✅ DNS resolution successful: ${result.address} (${result.family === 4 ? 'IPv4' : 'IPv6'})`);
  } catch (err) {
    console.error(`❌ DNS resolution failed: ${err.message}`);
  }
  
  console.log('\nConnecting to Supabase...');
  
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
    console.log('\nConnection closed.');
    await client.end();
  }
}

// Run the test
testConnection()
  .then(success => {
    if (!success) {
      console.log('\nTroubleshooting tips:');
      console.log('1. Check if the password is correct');
      console.log('2. Ensure you have network connectivity to Supabase');
      console.log('3. Try using a direct IP address if DNS resolution is failing');
      console.log('4. Verify that your IP is allowed in Supabase network settings');
      console.log('5. Check if your network allows outbound connections on port 6543');
    }
    
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
