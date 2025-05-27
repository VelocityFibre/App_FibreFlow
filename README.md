# VelocityFibre Supabase Database Utilities

This package provides utilities for connecting to and interacting with the Supabase PostgreSQL database.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set your database password:
   - Option 1: Set the `SUPABASE_DB_PASSWORD` environment variable
   - Option 2: Edit the `config.js` file and replace `[YOUR-PASSWORD]` with your actual password (not recommended for production)

## Connection Types

The utility supports three different connection types:

1. **Direct Connection**
   - Ideal for applications with persistent, long-lived connections
   - Not IPv4 compatible

2. **Transaction Pooler**
   - Ideal for stateless applications (serverless functions)
   - IPv4 compatible
   - Does not support PREPARE statements

3. **Session Pooler**
   - Alternative to Direct Connection for IPv4 networks
   - IPv4 compatible

## Testing the Connection

Run the test script to verify your database connection:

```bash
npm test
```

This will test all three connection types and display the results.

## Usage

```javascript
const db = require('./db');

// Basic query
async function getUsers() {
  const result = await db.query('SELECT * FROM users LIMIT 10');
  return result.rows;
}

// Using a specific connection type
async function getProducts() {
  const result = await db.query(
    'SELECT * FROM products LIMIT 10', 
    [], 
    db.CONNECTION_TYPES.DIRECT
  );
  return result.rows;
}

// Using transactions
async function transferFunds(fromAccount, toAccount, amount) {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');
    await client.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [amount, fromAccount]);
    await client.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [amount, toAccount]);
    await client.query('COMMIT');
    return true;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
```

## Files

- `config.js` - Configuration settings for the database connection
- `db.js` - Database connection utility functions
- `test-connection.js` - Script to test the database connection
- `supabase-connection-info.md` - Original connection information
