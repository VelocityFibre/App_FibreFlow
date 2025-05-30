/**
 * Supabase Direct Connection Test
 * 
 * This script tests the direct connection to Supabase PostgreSQL database.
 * Ideal for applications with persistent, long-lived connections (VMs, containers).
 */

const { Client } = require('pg');

// Replace with your actual password
const password = 'Xoouphae2415!';

// Connection configuration for Direct Connection
const config = {
  connectionString: `postgresql://postgres:${password}@db.eutwrybevqvatgecsypw.supabase.co:5432/postgres`,
  ssl: {
    rejectUnauthorized: false // For testing purposes
  },
  // Set reasonable timeouts
  connectionTimeoutMillis: 15000,
  query_timeout: 10000
};

// Display connection parameters
console.log('Connection Parameters:');
console.log('---------------------');
console.log(`Host: db.eutwrybevqvatgecsypw.supabase.co`);
console.log(`Port: 5432`);
console.log(`Database: postgres`);
console.log(`User: postgres`);
console.log(`SSL: Enabled (rejectUnauthorized: false)`);
console.log(`Connection Timeout: ${config.connectionTimeoutMillis}ms`);
console.log(`Query Timeout: ${config.query_timeout}ms`);
console.log('---------------------\n');

async function testConnection() {
  console.log('Testing Direct Connection to Supabase...');
  console.log('----------------------------------------');
  
  // First, test DNS resolution
  console.log('Testing DNS resolution...');
  try {
    const dns = require('dns');
    const { promisify } = require('util');
    const lookup = promisify(dns.lookup);
    
    const host = 'db.eutwrybevqvatgecsypw.supabase.co';
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
    console.log('\nClosing connection...');
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
      console.log('3. Verify that your IP is allowed in Supabase network settings');
      console.log('4. If you\'re on an IPv4-only network, direct connection might not work');
      console.log('   Consider using the Session Pooler instead');
      console.log('5. Check if your firewall allows outbound connections on port 5432');
    }
    
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
