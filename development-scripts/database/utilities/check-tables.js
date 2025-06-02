const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function checkTables() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
  );

  console.log('Listing all tables in the database...');
  
  try {
    // List all tables in the public schema
    const { data: tables, error } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');
    
    if (error) throw error;
    
    console.log('\n=== Tables in your Supabase database ===');
    console.log(tables.map(t => t.tablename).join('\n'));
    
    // Check if stock_movements has the comments column
    console.log('\n=== Checking stock_movements columns ===');
    const { data: columns } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'stock_movements');
      
    console.log(columns);
    
  } catch (err) {
    console.error('Error checking tables:', err);
  }
}

checkTables();
