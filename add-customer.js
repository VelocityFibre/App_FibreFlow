const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function addCustomer() {
  console.log('Adding fibertime™ customer to database...');
  
  // First, let's check the structure of the customers table
  const { data: tableInfo, error: tableError } = await supabase
    .from('customers')
    .select('*')
    .limit(1);
  
  if (tableError) {
    console.error('Error fetching table structure:', tableError);
    return;
  }
  
  console.log('Table structure sample:', tableInfo);
  
  // Now let's add a basic customer with just the name
  const { data, error } = await supabase
    .from('customers')
    .insert([{ name: 'fibertime™' }]);
  
  if (error) {
    console.error('Error adding customer:', error);
  } else {
    console.log('Customer added successfully!');
  }
}

addCustomer();
