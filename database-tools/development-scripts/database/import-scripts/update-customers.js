const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function updateCustomersTable() {
  try {
    // First, let's create a customers table if it doesn't exist
    console.log("Creating customers table if it doesn't exist...");
    
    // This will create a new customers table with our desired structure
    // We'll use a simple structure with just id, name, and email to start
    const { error: createError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS customers (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT,
          email TEXT
        );
      `
    });
    
    if (createError) {
      console.error("Error creating table:", createError);
      return;
    }
    
    // Now let's insert our fibertime™ customer
    console.log("Adding fibertime™ customer...");
    const { error: insertError } = await supabase
      .from('customers')
      .insert([{ 
        name: 'fibertime™', 
        email: 'info@fibertime.com'
      }]);
    
    if (insertError) {
      console.error("Error inserting customer:", insertError);
    } else {
      console.log("Customer added successfully!");
    }
    
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

updateCustomersTable();
