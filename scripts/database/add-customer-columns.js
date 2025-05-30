const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function executeSQL() {
  console.log('Adding columns to customers table...');
  
  // Using the SQL API to add columns to the customers table
  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      ALTER TABLE customers 
      ADD COLUMN IF NOT EXISTS name TEXT,
      ADD COLUMN IF NOT EXISTS email TEXT,
      ADD COLUMN IF NOT EXISTS phone TEXT,
      ADD COLUMN IF NOT EXISTS status TEXT;
    `
  });
  
  if (error) {
    console.error('Error adding columns:', error);
  } else {
    console.log('Columns added successfully!');
    
    // Now insert the customer
    const { data: insertData, error: insertError } = await supabase
      .from('customers')
      .insert([{ 
        name: 'fibertime™', 
        email: 'info@fibertime.com',
        phone: '+27123456789',
        status: 'Active'
      }]);
      
    if (insertError) {
      console.error('Error adding customer:', insertError);
    } else {
      console.log('Customer added successfully!');
    }
  }
}

executeSQL();
