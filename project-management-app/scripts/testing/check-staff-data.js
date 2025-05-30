const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://eutwrybevqvatgecsypw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1dHdyeWJldnF2YXRnZWNzeXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5OTQzODEsImV4cCI6MjA0ODU3MDM4MX0.gD-kzkEKZUuMwjE-0u7HsuM7BH54TkjILvx6qUMWF-c';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkData() {
  try {
    // Check if staff table has any data
    console.log('Fetching staff data...');
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('*')
      .limit(5);
    
    if (staffError) {
      console.error('Error fetching staff:', staffError);
    } else {
      console.log('Staff count:', staff?.length || 0);
      if (staff && staff.length > 0) {
        console.log('First staff member:', staff[0]);
        console.log('Staff ID type:', typeof staff[0].id);
        console.log('Staff ID value:', staff[0].id);
      } else {
        console.log('No staff members found in the database');
      }
    }

    // Check project_tasks structure
    console.log('\nFetching project_tasks data...');
    const { data: tasks, error: tasksError } = await supabase
      .from('project_tasks')
      .select('*')
      .limit(1);
    
    if (tasksError) {
      console.error('Error fetching project_tasks:', tasksError);
    } else {
      console.log('Sample project task:', tasks?.[0] || 'No tasks found');
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkData();