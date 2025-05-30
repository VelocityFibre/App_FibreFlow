const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eutwrybevqvatgecsypw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1dHdyeWJldnF2YXRnZWNzeXB3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjk5NDM4MSwiZXhwIjoyMDQ4NTcwMzgxfQ.Bp-_qTGgmBz9qJl94j9G4TqKmEaVVLmpuAhHFgNkUW0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchemaTypes() {
  try {
    // Check staff table structure
    console.log('Checking staff table structure...');
    const { data: staffColumns, error: staffError } = await supabase
      .rpc('get_table_columns', { table_name: 'staff' });
    
    if (staffError) {
      console.log('Error getting staff columns, trying alternative method...');
      // Try a simple query to get column info
      const { data: staffSample, error: sampleError } = await supabase
        .from('staff')
        .select('*')
        .limit(1);
      
      if (!sampleError && staffSample && staffSample.length > 0) {
        console.log('Staff table sample:', staffSample[0]);
        console.log('Staff ID type:', typeof staffSample[0].id);
      }
    } else {
      console.log('Staff columns:', staffColumns);
    }

    // Check project_tasks table structure
    console.log('\nChecking project_tasks table structure...');
    const { data: tasksColumns, error: tasksError } = await supabase
      .rpc('get_table_columns', { table_name: 'project_tasks' });
    
    if (tasksError) {
      console.log('Error getting project_tasks columns, trying alternative method...');
      // Try a simple query
      const { data: tasksSample, error: sampleError } = await supabase
        .from('project_tasks')
        .select('*')
        .limit(1);
      
      if (!sampleError) {
        console.log('Project tasks sample:', tasksSample);
      }
    } else {
      console.log('Project tasks columns:', tasksColumns);
    }

    // Try to query the information schema directly
    console.log('\nQuerying information schema...');
    const { data: schemaInfo, error: schemaError } = await supabase
      .from('information_schema.columns')
      .select('table_name, column_name, data_type')
      .in('table_name', ['staff', 'project_tasks'])
      .in('column_name', ['id', 'assigned_to']);

    if (!schemaError) {
      console.log('Schema information:', schemaInfo);
    } else {
      console.log('Could not query information schema:', schemaError.message);
    }

  } catch (error) {
    console.error('Error checking schema:', error);
  }
}

checkSchemaTypes();