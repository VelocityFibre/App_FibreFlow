/**
 * Supabase Database Configuration
 * 
 * This file contains configuration for connecting to the Supabase PostgreSQL database.
 * IMPORTANT: In production, store sensitive information in environment variables.
 */

// Connection types
const CONNECTION_TYPES = {
  DIRECT: 'direct',           // For persistent connections (VMs, containers)
  TRANSACTION_POOLER: 'transaction_pooler', // For stateless applications (serverless)
  SESSION_POOLER: 'session_pooler',    // Alternative to direct for IPv4 networks
};

// Default to transaction pooler as it's most versatile
const DEFAULT_CONNECTION_TYPE = CONNECTION_TYPES.TRANSACTION_POOLER;

// Configuration object
const config = {
  // Base connection details
  database: {
    host: 'db.eutwrybevqvatgecsypw.supabase.co',
    poolerHost: 'aws-0-eu-central-1.pooler.supabase.com',
    database: 'postgres',
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD || 'Xoouphae2415!', // Database password
    ssl: true,
  },
  
  // Connection strings for different connection types
  connectionStrings: {
    [CONNECTION_TYPES.DIRECT]: 'postgresql://postgres:Xoouphae2415!@db.eutwrybevqvatgecsypw.supabase.co:5432/postgres?sslmode=require',
    [CONNECTION_TYPES.TRANSACTION_POOLER]: 'postgresql://postgres.eutwrybevqvatgecsypw:Xoouphae2415!@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require',
    [CONNECTION_TYPES.SESSION_POOLER]: 'postgresql://postgres.eutwrybevqvatgecsypw:Xoouphae2415!@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require',
  },
  
  // Get a connection string with the password filled in
  getConnectionString: function(type = DEFAULT_CONNECTION_TYPE) {
    const password = process.env.SUPABASE_DB_PASSWORD || this.database.password;
    return this.connectionStrings[type].replace('[YOUR-PASSWORD]', password);
  },
  
  // Connection options and recommendations
  connectionNotes: {
    [CONNECTION_TYPES.DIRECT]: {
      description: 'Ideal for applications with persistent, long-lived connections',
      suitable: 'Virtual machines, long-standing containers',
      ipv4Compatible: false,
      notes: 'Each client has a dedicated connection to Postgres',
    },
    [CONNECTION_TYPES.TRANSACTION_POOLER]: {
      description: 'Ideal for stateless applications with brief database interactions',
      suitable: 'Serverless functions, short-lived connections',
      ipv4Compatible: true,
      notes: 'Does not support PREPARE statements, pre-warmed connection pool',
    },
    [CONNECTION_TYPES.SESSION_POOLER]: {
      description: 'Alternative to Direct Connection for IPv4 networks',
      suitable: 'IPv4 networks requiring persistent connections',
      ipv4Compatible: true,
      notes: 'Use Direct Connection if connecting via IPv6',
    },
  },
};

// Export both the config object and the CONNECTION_TYPES constant
module.exports = {
  ...config,
  CONNECTION_TYPES,
  DEFAULT_CONNECTION_TYPE
};
