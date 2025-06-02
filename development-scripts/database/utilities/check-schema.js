const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function checkSchema() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
  );

  console.log('Checking database schema...');
  
  try {
    // Check if staff table exists
    const { data: staffData, error: staffError } = await supabase
      .from('staff')
      .select('*')
      .limit(1);
    
    console.log('Staff table exists:', !staffError);
    if (staffData) console.log('Staff count:', staffData.length);
    
    // Check if stock_movements has comments column
    try {
      const { data: movements, error: movError } = await supabase
        .from('stock_movements')
        .select('comments')
        .limit(1);
      
      console.log('Stock movements table has comments column:', !movError);
    } catch (e) {
      console.log('Stock movements table does not have comments column');
    }
    
  } catch (err) {
    console.error('Error checking schema:', err);
  }
}

checkSchema();
