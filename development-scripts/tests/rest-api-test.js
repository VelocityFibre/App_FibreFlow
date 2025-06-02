/**
 * Supabase REST API Test
 * 
 * This script tests the connection to Supabase using the REST API.
 */

const https = require('https');

// Supabase project URL and API key
const SUPABASE_URL = 'https://eutwrybevqvatgecsypw.supabase.co';
const SUPABASE_KEY = 'Xoouphae2415!'; // Database password

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SUPABASE_URL);
    
    const requestOptions = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        ...options.headers
      }
    };
    
    const req = https.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: parsedData });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function testRestApi() {
  console.log('Testing Supabase connection using REST API...');
  console.log('----------------------------------------');
  
  try {
    // Test the REST API by making a simple request
    console.log('Making a test request to the REST API...');
    
    // Try to access the health endpoint
    const response = await makeRequest('/rest/v1/');
    
    console.log(`Status code: ${response.statusCode}`);
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      console.log('✅ Connection successful!');
      console.log('Response data:', response.data);
      return true;
    } else {
      console.error('❌ Connection failed with status code:', response.statusCode);
      console.error('Response data:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error(error.message);
    return false;
  }
}

// Run the test
testRestApi()
  .then(success => {
    if (!success) {
      console.log('\nTroubleshooting tips:');
      console.log('1. Check if the API key is correct');
      console.log('2. Ensure you have network connectivity to Supabase');
      console.log('3. Verify that your IP is allowed in Supabase network settings');
      console.log('4. The token provided might be a database password, not an API key');
      console.log('5. You might need to get the actual API key from the Supabase dashboard');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
