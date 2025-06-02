/**
 * Supabase Database Connection Utility
 * 
 * This module provides functions to connect to and interact with the Supabase PostgreSQL database.
 */

const { Pool } = require('pg');
const config = require('./config');

// Connection pool instances for different connection types
const pools = {};

/**
 * Get a database pool for the specified connection type
 * @param {string} connectionType - The type of connection to use (from config.CONNECTION_TYPES)
 * @returns {Pool} A PostgreSQL connection pool
 */
function getPool(connectionType = config.DEFAULT_CONNECTION_TYPE) {
  // Create the pool if it doesn't exist
  if (!pools[connectionType]) {
    const connectionString = config.getConnectionString(connectionType);
    
    pools[connectionType] = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false // Allow self-signed certificates in the chain
      }
    });
    
    // Add event listeners for the pool
    pools[connectionType].on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }
  
  return pools[connectionType];
}

/**
 * Execute a query using the specified connection type
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @param {string} connectionType - The type of connection to use
 * @returns {Promise} Query result
 */
async function query(text, params = [], connectionType = config.DEFAULT_CONNECTION_TYPE) {
  const pool = getPool(connectionType);
  const start = Date.now();
  
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Error executing query', { text, error });
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 * Note: Transaction pooler doesn't support PREPARE statements
 * @param {string} connectionType - The type of connection to use
 * @returns {Promise} Client object
 */
async function getClient(connectionType = config.DEFAULT_CONNECTION_TYPE) {
  const pool = getPool(connectionType);
  const client = await pool.connect();
  
  // Monkey patch the client to keep track of queries
  const query = client.query;
  const release = client.release;
  
  // Set a timeout of 5 seconds to automatically release the client
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for too long!');
    console.error(`The last executed query was: ${client.lastQuery}`);
    client.release(true); // Force release the client
  }, 5000);
  
  // Override client.query
  client.query = (...args) => {
    client.lastQuery = args;
    return query.apply(client, args);
  };
  
  // Override client.release
  client.release = () => {
    clearTimeout(timeout);
    client.query = query;
    client.release = release;
    return release.apply(client);
  };
  
  return client;
}

/**
 * Close all database pools
 * @returns {Promise} Promise that resolves when all pools are ended
 */
async function closeAllPools() {
  const promises = Object.values(pools).map(pool => pool.end());
  return Promise.all(promises);
}

/**
 * Test the database connection
 * @param {string} connectionType - The type of connection to use
 * @returns {Promise} Connection test result
 */
async function testConnection(connectionType = config.DEFAULT_CONNECTION_TYPE) {
  try {
    const result = await query('SELECT NOW() as current_time', [], connectionType);
    return {
      success: true,
      message: `Connection successful using ${connectionType}`,
      timestamp: result.rows[0].current_time
    };
  } catch (error) {
    return {
      success: false,
      message: `Connection failed using ${connectionType}`,
      error: error.message
    };
  }
}

module.exports = {
  query,
  getClient,
  getPool,
  closeAllPools,
  testConnection,
  CONNECTION_TYPES: config.CONNECTION_TYPES
};
