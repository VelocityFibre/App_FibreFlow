/**
 * Supabase Session Pooler Connection Test
 * 
 * This script tests the connection to Supabase using the session pooler,
 * which is IPv4 compatible and recommended for IPv4 networks.
 */

const { Client } = require('pg');

// Connection configuration for Session Pooler
const config = {
  // Session pooler connection (IPv4 compatible)
  connectionString: 'postgresql://postgres.eutwrybevqvatgecsypw:Xoouphae2415!@aws-0-eu-central-1.pooler.supabase.com:5432/postgres',
  ssl: {
    rejectUnauthorized: false // Allow self-signed certificates
  },
  // Set a reasonable timeout
  connectionTimeoutMillis: 15000,
  query_timeout: 10000
};

async function testConnection() {
  console.log('Testing Supabase connection...');
  console.log('Using Session Pooler (IPv4 compatible, port 5432)');
  console.log('----------------------------------------');
  
  const client = new Client(config);
  
  try {
    // Test DNS resolution first
    console.log('Testing DNS resolution...');
    const dns = require('dns');
    const util = require('util');
    const lookup = util.promisify(dns.lookup);
    
    try {
      const { address, family } = await lookup('aws-0-eu-central-1.pooler.supabase.com');
      console.log(`✅ DNS resolution successful: ${address} (IPv${family})`);
    } catch (dnsError) {
      console.error('❌ DNS resolution failed:', dnsError.message);
      console.log('Attempting connection anyway...');
    }
    
    // Connect to the database
    console.log('\nConnecting to Supabase...');
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
    
    // Provide more detailed error information
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    
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
      console.log('3. Try using a direct IP address if DNS resolution is failing');
      console.log('4. Verify that your IP is allowed in Supabase network settings');
      console.log('5. Check if your network allows outbound connections on port 5432');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
