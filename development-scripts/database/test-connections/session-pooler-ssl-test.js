/**
 * Supabase Session Pooler Connection Test with Different SSL Options
 * 
 * This script tests the Session Pooler connection with various SSL configurations.
 */

const { Client } = require('pg');

// Replace with your actual password
const password = 'Xoouphae2415!';

// Base connection parameters
const baseParams = {
  host: 'aws-0-eu-central-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.eutwrybevqvatgecsypw',
  password: password,
  connectionTimeoutMillis: 15000,
  query_timeout: 10000
};

// Different SSL configurations to try
const sslConfigs = [
  {
    name: "SSL Mode: require (Connection String)",
    config: {
      connectionString: `postgresql://postgres.eutwrybevqvatgecsypw:${password}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require`
    }
  },
  {
    name: "SSL Mode: prefer (Connection String)",
    config: {
      connectionString: `postgresql://postgres.eutwrybevqvatgecsypw:${password}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=prefer`
    }
  },
  {
    name: "SSL Mode: verify-ca (Connection String)",
    config: {
      connectionString: `postgresql://postgres.eutwrybevqvatgecsypw:${password}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=verify-ca`
    }
  },
  {
    name: "SSL Disabled",
    config: {
      ...baseParams,
      ssl: false
    }
  },
  {
    name: "SSL Enabled with rejectUnauthorized: false",
    config: {
      ...baseParams,
      ssl: {
        rejectUnauthorized: false
      }
    }
  },
  {
    name: "SSL Enabled with rejectUnauthorized: true",
    config: {
      ...baseParams,
      ssl: {
        rejectUnauthorized: true
      }
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
  console.log('Supabase Session Pooler SSL Configuration Tests');
  console.log('=============================================');
  
  const results = {};
  
  // Test each SSL configuration
  for (const { name, config } of sslConfigs) {
    results[name] = await testConnection(name, config);
  }
  
  // Summary
  console.log('\n=============================================');
  console.log('Connection Test Results:');
  console.log('=============================================');
  
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
    console.log('   - Go to Supabase Dashboard > Project Settings > Database > Network Restrictions');
    console.log('   - Add your current IP address to the allowed list');
    console.log('2. The database might be temporarily unavailable or under maintenance');
    console.log('3. There might be network restrictions or firewall rules blocking the connection');
    console.log('4. Try connecting from a different network if possible');
    console.log('5. Contact Supabase support if the issue persists');
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
