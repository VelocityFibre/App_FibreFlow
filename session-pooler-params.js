/**
 * Supabase Session Pooler Connection Parameters and Test
 * 
 * This script displays the connection parameters for the Session Pooler
 * and tests the connection.
 */

const { Client } = require('pg');

// Replace with your actual password
const password = 'Xoouphae2415!';

// Connection parameters for Session Pooler
const connectionParams = {
  host: 'aws-0-eu-central-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.eutwrybevqvatgecsypw',
  password: password,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 15000,
  query_timeout: 10000
};

// Connection string
const connectionString = `postgresql://postgres.eutwrybevqvatgecsypw:${password}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`;

// Display connection parameters
console.log('Session Pooler Connection Parameters:');
console.log('----------------------------------');
console.log(`Host: ${connectionParams.host}`);
console.log(`Port: ${connectionParams.port}`);
console.log(`Database: ${connectionParams.database}`);
console.log(`User: ${connectionParams.user}`);
console.log(`SSL: Enabled (rejectUnauthorized: ${connectionParams.ssl.rejectUnauthorized})`);
console.log(`Connection Timeout: ${connectionParams.connectionTimeoutMillis}ms`);
console.log(`Query Timeout: ${connectionParams.query_timeout}ms`);
console.log('----------------------------------');
console.log(`Connection String: ${connectionString}`);
console.log('----------------------------------\n');

async function testConnection() {
  console.log('Testing Session Pooler Connection...');
  console.log('----------------------------------');
  
  // First, test DNS resolution
  console.log('Testing DNS resolution...');
  try {
    const dns = require('dns');
    const { promisify } = require('util');
    const lookup = promisify(dns.lookup);
    
    const host = connectionParams.host;
    const result = await lookup(host);
    
    console.log(`✅ DNS resolution successful: ${result.address} (${result.family === 4 ? 'IPv4' : 'IPv6'})`);
  } catch (err) {
    console.error(`❌ DNS resolution failed: ${err.message}`);
  }
  
  console.log('\nConnecting to Supabase...');
  
  // Create client using explicit parameters
  const client = new Client(connectionParams);
  
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
      console.log('4. Check if your firewall allows outbound connections on port 5432');
      console.log('5. The database might be temporarily unavailable or under maintenance');
    }
    
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
