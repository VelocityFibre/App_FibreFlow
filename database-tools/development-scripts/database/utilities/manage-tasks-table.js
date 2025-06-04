// Usage: node manage-tasks-table.js
// This script lists all tables in your Supabase Postgres DB and creates a 'tasks' table if it doesn't exist.
require('dotenv').config({ path: './.env.local' });
const { Client } = require('pg');

const CONNECTION_STRING = process.env.SUPABASE_DB_URL || process.env.SUPABASE_DB_CONNECTION_STRING || process.env.DATABASE_URL;
if (!CONNECTION_STRING) {
  console.error('No connection string found. Please set SUPABASE_DB_URL or SUPABASE_DB_CONNECTION_STRING in .env.local');
  process.exit(1);
}

const client = new Client({ connectionString: CONNECTION_STRING });

async function listTables() {
  const res = await client.query(`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`);
  return res.rows.map(r => r.tablename);
}

async function createTasksTable() {
  await client.query(`
    CREATE TABLE public.tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status VARCHAR(32) NOT NULL DEFAULT 'todo',
      assigned_to INTEGER,
      due_date DATE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  `);
}

(async () => {
  try {
    await client.connect();
    const tables = await listTables();
    console.log('Tables:', tables);
    if (!tables.includes('tasks')) {
      console.log("'tasks' table not found. Creating...");
      await createTasksTable();
      console.log("'tasks' table created.");
    } else {
      console.log("'tasks' table already exists.");
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
})();
