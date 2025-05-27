/**
 * Comprehensive Supabase Connection Test
 * 
 * This script tests multiple methods of connecting to Supabase:
 * 1. Transaction Pooler (PostgreSQL client)
 * 2. Session Pooler (PostgreSQL client)
 * 3. REST API (direct HTTP requests)
 */

const { Client } = require('pg');
const https = require('https');

// Database connection details
const DB_PASSWORD = 'Xoouphae2415!';
const SUPABASE_URL = 'https://eutwrybevqvatgecsypw.supabase.co';

// Connection configurations
const configs = {
  transactionPooler: {
    name: 'Transaction Pooler (port 6543)',
    connectionString: `postgresql://postgres.eutwrybevqvatgecsypw:${DB_PASSWORD}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000
  },
  sessionPooler: {
    name: 'Session Pooler (port 5432)',
    connectionString: `postgresql://postgres.eutwrybevqvatgecsypw:${DB_PASSWORD}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000
  }
};

// Test PostgreSQL connection
async function testPgConnection(configName) {
  const config = configs[configName];
  console.log(`\n[TEST] ${config.name}`);
  console.log('----------------------------------------');
  
  const client = new Client(config);
  
  try {
    // Connect to the database
    await client.connect();
    
    // Test the connection with a simple query
    const result = await client.query('SELECT current_timestamp as time, current_database() as db');
    
    console.log('✅ Connection successful!');
    console.log(`Server time: ${result.rows[0].time}`);
    console.log(`Database: ${result.rows[0].db}`);
    
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
    await client.end();
  }
}

// Test REST API connection
function testRestApi() {
  return new Promise((resolve) => {
    console.log('\n[TEST] REST API');
    console.log('----------------------------------------');
    console.log('Attempting to connect via REST API...');
    
    // Try to access the health endpoint
    const options = {
      hostname: new URL(SUPABASE_URL).hostname,
      path: '/rest/v1/',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': DB_PASSWORD,
        'Authorization': `Bearer ${DB_PASSWORD}`
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`Status code: ${res.statusCode}`);
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Connection successful!');
          try {
            const parsedData = JSON.parse(data);
            console.log('Response data:', parsedData);
          } catch (e) {
            console.log('Response data:', data);
          }
          resolve(true);
        } else {
          console.error('❌ Connection failed with status code:', res.statusCode);
          try {
            const parsedData = JSON.parse(data);
            console.error('Response data:', parsedData);
          } catch (e) {
            console.error('Response data:', data);
          }
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Connection failed:');
      console.error(error.message);
      resolve(false);
    });
    
    req.end();
  });
}

// Run all tests
async function runAllTests() {
  console.log('COMPREHENSIVE SUPABASE CONNECTION TEST');
  console.log('=====================================');
  console.log('Testing multiple connection methods...\n');
  
  // Test all connection methods
  const results = {
    transactionPooler: await testPgConnection('transactionPooler'),
    sessionPooler: await testPgConnection('sessionPooler'),
    restApi: await testRestApi()
  };
  
  // Print summary
  console.log('\n\nTEST SUMMARY');
  console.log('===========');
  Object.entries(results).forEach(([test, success]) => {
    console.log(`${test}: ${success ? '✅ SUCCESS' : '❌ FAILED'}`);
  });
  
  // Provide troubleshooting advice
  if (!Object.values(results).some(Boolean)) {
    console.log('\nAll connection methods failed. Here are some troubleshooting tips:');
    console.log('1. Verify that the database password is correct');
    console.log('2. Check if your IP is allowed in Supabase network settings');
    console.log('3. For API access, you need an API key from the Supabase dashboard (not the database password)');
    console.log('4. For PostgreSQL connections, ensure your network allows outbound connections on ports 5432 and 6543');
    console.log('5. Consider checking the Supabase status page to ensure the service is operational');
  } else if (!results.restApi) {
    console.log('\nAPI access failed but PostgreSQL connection succeeded.');
    console.log('This suggests you need a separate API key for REST API access.');
    console.log('Visit your Supabase dashboard to obtain an API key.');
  }
  
  // Exit with appropriate code
  process.exit(Object.values(results).some(Boolean) ? 0 : 1);
}

runAllTests().catch(err => {
  console.error('Unexpected error during tests:', err);
  process.exit(1);
});
