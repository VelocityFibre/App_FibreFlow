/**
 * Supabase Database Connection Test
 * 
 * This script tests the connection to the Supabase PostgreSQL database
 * using different connection types.
 */

const db = require('./db');
const config = require('./config');

async function runTests() {
  console.log('Testing Supabase Database Connections...');
  console.log('----------------------------------------');
  
  try {
    // Test each connection type
    for (const connectionType of Object.values(config.CONNECTION_TYPES)) {
      console.log(`\nTesting ${connectionType} connection:`);
      
      // Display connection notes
      const notes = config.connectionNotes[connectionType];
      console.log(`- ${notes.description}`);
      console.log(`- Suitable for: ${notes.suitable}`);
      console.log(`- IPv4 Compatible: ${notes.ipv4Compatible ? 'Yes' : 'No'}`);
      console.log(`- Notes: ${notes.notes}`);
      
      // Test the connection
      const result = await db.testConnection(connectionType);
      
      if (result.success) {
        console.log(`✅ SUCCESS: ${result.message}`);
        console.log(`  Server time: ${result.timestamp}`);
        
        // Run a simple query to test functionality
        console.log('\nRunning test query...');
        const queryResult = await db.query(
          'SELECT current_database() as database, current_user as user', 
          [], 
          connectionType
        );
        console.log('Query result:', queryResult.rows[0]);
      } else {
        console.log(`❌ FAILED: ${result.message}`);
        console.log(`  Error: ${result.error}`);
      }
      
      console.log('----------------------------------------');
    }
  } catch (error) {
    console.error('An error occurred during testing:', error);
  } finally {
    // Close all database connections
    await db.closeAllPools();
    console.log('\nAll database connections closed.');
  }
}

// Run the tests
runTests().catch(console.error);
