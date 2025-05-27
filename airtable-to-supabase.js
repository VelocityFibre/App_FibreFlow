/**
 * Airtable to Supabase One-Time Import Script
 * 
 * This script imports all tables from an Airtable base into Supabase.
 * It creates matching tables in Supabase and copies all data.
 */

require('dotenv').config();
const Airtable = require('airtable');
const { createClient } = require('@supabase/supabase-js');

// Airtable configuration
const AIRTABLE_API_KEY = 'patrJ09HyqgfkREvS.2c2f4631927c4f5cf6e2c451dce3a851605b5f479745ccad5b0e524f93a7176e';
const AIRTABLE_BASE_ID = 'appkYMgaK0cHVu4Zg';

// Supabase configuration
const SUPABASE_URL = 'https://eutwrybevqvatgecsypw.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

// Initialize clients
const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Get all table names from Airtable base
 */
async function getAirtableTables() {
  try {
    // This is a workaround since Airtable API doesn't directly expose table list
    // We'll make a request to the base metadata
    const axios = require('axios');
    const response = await axios.get(
      `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`,
      { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } }
    );
    
    return response.data.tables.map(table => ({
      id: table.id,
      name: table.name,
      // Convert to snake_case for Supabase
      supabaseName: table.name.toLowerCase().replace(/\s+/g, '_')
    }));
  } catch (error) {
    console.error('Error getting Airtable tables:', error.message);
    
    // Fallback: Return some common table names to try
    console.log('Falling back to manual table specification...');
    return [
      { name: 'Customers', supabaseName: 'customers' },
      { name: 'Orders', supabaseName: 'orders' },
      { name: 'Products', supabaseName: 'products' }
      // Add more tables as needed
    ];
  }
}

/**
 * Get Airtable field types and create equivalent Supabase schema
 */
async function getTableSchema(tableName) {
  try {
    // Get one record to analyze the field structure
    const records = await base(tableName).select({ maxRecords: 1 }).all();
    
    if (records.length === 0) {
      console.log(`Table ${tableName} is empty, using default schema`);
      return {
        id: { type: 'text', primary: true },
        created_at: { type: 'timestamp with time zone', default: 'now()' }
      };
    }
    
    const record = records[0];
    const fields = record.fields;
    const schema = {
      id: { type: 'text', primary: true },
      created_at: { type: 'timestamp with time zone', default: 'now()' }
    };
    
    // Map Airtable fields to Supabase types
    Object.keys(fields).forEach(field => {
      const value = fields[field];
      const fieldName = field.toLowerCase().replace(/\s+/g, '_');
      
      if (typeof value === 'number') {
        schema[fieldName] = { type: Number.isInteger(value) ? 'integer' : 'numeric' };
      } else if (typeof value === 'boolean') {
        schema[fieldName] = { type: 'boolean' };
      } else if (value instanceof Date) {
        schema[fieldName] = { type: 'timestamp with time zone' };
      } else if (Array.isArray(value)) {
        schema[fieldName] = { type: 'jsonb' };
      } else {
        schema[fieldName] = { type: 'text' };
      }
    });
    
    return schema;
  } catch (error) {
    console.error(`Error getting schema for ${tableName}:`, error.message);
    // Return a basic schema as fallback
    return {
      id: { type: 'text', primary: true },
      created_at: { type: 'timestamp with time zone', default: 'now()' },
      data: { type: 'jsonb' }
    };
  }
}

/**
 * Create a table in Supabase
 */
async function createSupabaseTable(tableName, schema) {
  try {
    console.log(`Creating table ${tableName} in Supabase...`);
    
    // Generate SQL for table creation
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        ${Object.entries(schema).map(([column, def]) => {
          const constraints = [];
          if (def.primary) constraints.push('PRIMARY KEY');
          if (def.default) constraints.push(`DEFAULT ${def.default}`);
          
          return `${column} ${def.type} ${constraints.join(' ')}`.trim();
        }).join(',\n        ')}
      );
    `;
    
    // Execute SQL through Supabase
    const { error } = await supabase.rpc('execute_sql', { sql: createTableSQL });
    
    if (error) {
      // If RPC fails, try alternative approach
      console.log('RPC failed, trying REST API...');
      throw new Error('RPC method not available');
    }
    
    console.log(`✅ Table ${tableName} created successfully!`);
    return true;
  } catch (error) {
    console.error(`Error creating table ${tableName}:`, error.message);
    console.log('You may need to create the table manually in the Supabase dashboard.');
    
    // Ask user if they want to continue anyway
    console.log('Continuing with data import...');
    return false;
  }
}

/**
 * Import data from Airtable to Supabase
 */
async function importTableData(airtableTableName, supabaseTableName) {
  try {
    console.log(`Importing data from ${airtableTableName} to ${supabaseTableName}...`);
    
    // Get all records from Airtable
    const records = await base(airtableTableName).select().all();
    console.log(`Found ${records.length} records in Airtable`);
    
    if (records.length === 0) {
      console.log('No records to import');
      return true;
    }
    
    // Process records in batches to avoid API limits
    const BATCH_SIZE = 100;
    let successCount = 0;
    
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${i/BATCH_SIZE + 1} of ${Math.ceil(records.length/BATCH_SIZE)}`);
      
      // Transform Airtable records to Supabase format
      const data = batch.map(record => {
        const result = { id: record.id };
        
        // Convert field names to snake_case and add to result
        Object.entries(record.fields).forEach(([key, value]) => {
          const fieldName = key.toLowerCase().replace(/\s+/g, '_');
          result[fieldName] = value;
        });
        
        return result;
      });
      
      // Insert into Supabase
      const { error } = await supabase.from(supabaseTableName).upsert(data);
      
      if (error) {
        console.error(`Error inserting batch:`, error.message);
        
        // Try inserting records one by one to identify problematic records
        console.log('Trying individual record insertion...');
        for (const record of data) {
          const { error: individualError } = await supabase.from(supabaseTableName).upsert([record]);
          if (!individualError) {
            successCount++;
          } else {
            console.error(`Error inserting record ${record.id}:`, individualError.message);
          }
        }
      } else {
        successCount += batch.length;
      }
    }
    
    console.log(`✅ Imported ${successCount} of ${records.length} records to ${supabaseTableName}`);
    return true;
  } catch (error) {
    console.error(`Error importing data for ${airtableTableName}:`, error.message);
    return false;
  }
}

/**
 * Main function to import all tables
 */
async function importAllTables() {
  console.log('Starting Airtable to Supabase import...');
  console.log('----------------------------------------');
  
  // Check if Airtable package is installed
  try {
    require.resolve('airtable');
  } catch (e) {
    console.error('Airtable package not found. Installing...');
    console.log('Please run: npm install airtable axios');
    process.exit(1);
  }
  
  // Get all tables from Airtable
  const tables = await getAirtableTables();
  console.log(`Found ${tables.length} tables in Airtable:`, tables.map(t => t.name).join(', '));
  
  // Process each table
  for (const table of tables) {
    console.log(`\nProcessing table: ${table.name} -> ${table.supabaseName}`);
    
    // Get table schema
    const schema = await getTableSchema(table.name);
    
    // Create table in Supabase
    await createSupabaseTable(table.supabaseName, schema);
    
    // Import data
    await importTableData(table.name, table.supabaseName);
  }
  
  console.log('\n----------------------------------------');
  console.log('Import process completed!');
  console.log('Check your Supabase database for the imported tables.');
}

// Run the import
importAllTables()
  .catch(error => {
    console.error('Unexpected error:', error);
  });
