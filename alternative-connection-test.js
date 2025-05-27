/**
 * Supabase Alternative Connection Test
 * 
 * This script tests alternative connection configurations to Supabase.
 */

const { Client } = require('pg');

// Password is correct according to user
const password = 'Xoouphae2415!';

// Connection configurations to try
const configurations = [
  {
    name: "Session Pooler (Explicit Parameters)",
    config: {
      host: 'aws-0-eu-central-1.pooler.supabase.com',
      port: 5432,
      database: 'postgres',
      user: 'postgres.eutwrybevqvatgecsypw',
      password: password,
      ssl: {
        rejectUnauthorized: false
      },
      connectionTimeoutMillis: 15000
    }
  },
  {
    name: "Transaction Pooler (Explicit Parameters)",
    config: {
      host: 'aws-0-eu-central-1.pooler.supabase.com',
      port: 6543,
      database: 'postgres',
      user: 'postgres.eutwrybevqvatgecsypw',
      password: password,
      ssl: {
        rejectUnauthorized: false
      },
      connectionTimeoutMillis: 15000
    }
  },
  {
    name: "Session Pooler (No SSL Verification)",
    config: {
      connectionString: `postgresql://postgres.eutwrybevqvatgecsypw:${password}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=no-verify`,
      connectionTimeoutMillis: 15000
    }
  },
  {
    name: "Transaction Pooler (No SSL Verification)",
    config: {
      connectionString: `postgresql://postgres.eutwrybevqvatgecsypw:${password}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=no-verify`,
      connectionTimeoutMillis: 15000
    }
  },
  {
    name: "Session Pooler (Require SSL)",
    config: {
      connectionString: `postgresql://postgres.eutwrybevqvatgecsypw:${password}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require`,
      connectionTimeoutMillis: 15000
    }
  }
];

async function testConnection(name, config) {
  console.log(`\nTesting ${name}...`);
  console.log('----------------------------------------');
  
  const client = new Client(config);
  
  try {
    // Connect to the database
    console.log('Connecting...');
    await client.connect();
    
    // Run a simple query
    console.log('Running test query...');
    const result = await client.query('SELECT NOW() as current_time');
    
    console.log('✅ Connection successful!');
    console.log(`Server time: ${result.rows[0].current_time}`);
    
    return true;
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error(error.message);
    
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    
    return false;
  } finally {
    // Close the connection
    try {
      await client.end();
      console.log('Connection closed.');
    } catch (e) {
      // Ignore errors on close
    }
  }
}

async function runTests() {
  console.log('Supabase Alternative Connection Tests');
  console.log('====================================');
  
  const results = {};
  
  // Test each configuration
  for (const { name, config } of configurations) {
    results[name] = await testConnection(name, config);
  }
  
  // Summary
  console.log('\n====================================');
  console.log('Connection Test Results:');
  console.log('====================================');
  
  let anySuccess = false;
  
  for (const name in results) {
    console.log(`${name}: ${results[name] ? '✅ SUCCESS' : '❌ FAILED'}`);
    if (results[name]) {
      anySuccess = true;
    }
  }
  
  if (!anySuccess) {
    console.log('\nTroubleshooting tips:');
    console.log('1. Verify that your IP is allowed in Supabase network settings');
    console.log('2. Check if your network allows outbound connections to ports 5432 and 6543');
    console.log('3. The password might have been changed recently');
    console.log('4. There might be network restrictions or firewall rules blocking the connection');
    console.log('5. Try connecting from a different network if possible');
  }
  
  return anySuccess;
}

// Run all tests
runTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
