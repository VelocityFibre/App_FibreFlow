const { createClient } = require('@supabase/supabase-js');

// Use the same credentials as the app
const supabaseUrl = 'https://eutwrybevqvatgecsypw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1dHdyeWJldnF2YXRnZWNzeXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczOTQ0NDcsImV4cCI6MjA2Mjk3MDQ0N30.s4XnYMdT2n0Jzg94DHu3K6kD2zOcMooDszg7woMcVgk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyDatabase() {
  try {
    // 1. Check if staff table has any data
    console.log('1. Checking staff table...');
    const { data: staff, error: staffError, count } = await supabase
      .from('staff')
      .select('*', { count: 'exact' })
      .limit(5);
    
    if (staffError) {
      console.error('Error fetching staff:', staffError);
    } else {
      console.log(`   - Total staff records: ${count || 0}`);
      if (staff && staff.length > 0) {
        console.log('   - Sample staff member:', {
          id: staff[0].id,
          name: staff[0].name,
          id_type: typeof staff[0].id
        });
      } else {
        console.log('   - WARNING: No staff members found! This will cause foreign key errors.');
      }
    }

    // 2. Check project_tasks table structure by inserting and deleting a test record
    console.log('\n2. Testing project_tasks table...');
    
    // First, we need a valid project_phase_id and task_id
    const { data: phases } = await supabase
      .from('project_phases')
      .select('id')
      .limit(1);
    
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id')
      .limit(1);
    
    if (phases && phases.length > 0 && tasks && tasks.length > 0) {
      // Try to insert a test record without assigned_to
      const testData = {
        project_phase_id: phases[0].id,
        task_id: tasks[0].id,
        status: 'test'
      };
      
      const { data: inserted, error: insertError } = await supabase
        .from('project_tasks')
        .insert(testData)
        .select();
      
      if (insertError) {
        console.log('   - Error inserting without assigned_to:', insertError.message);
      } else {
        console.log('   - Successfully inserted without assigned_to');
        // Clean up
        if (inserted && inserted[0]) {
          await supabase
            .from('project_tasks')
            .delete()
            .eq('id', inserted[0].id);
        }
      }
      
      // Try with a staff member (if any exist)
      if (staff && staff.length > 0) {
        const testDataWithStaff = {
          ...testData,
          assigned_to: staff[0].id
        };
        
        const { error: insertError2 } = await supabase
          .from('project_tasks')
          .insert(testDataWithStaff)
          .select();
        
        if (insertError2) {
          console.log('   - Error inserting with assigned_to:', insertError2.message);
          console.log('   - This suggests the column types are incompatible');
        } else {
          console.log('   - Successfully inserted with assigned_to');
        }
      }
    } else {
      console.log('   - Cannot test project_tasks: no phases or tasks found');
    }

    // 3. Provide recommendations
    console.log('\n3. Recommendations:');
    if (!count || count === 0) {
      console.log('   - CRITICAL: Populate the staff table with at least one staff member');
      console.log('   - Or temporarily remove the foreign key constraint');
    }
    console.log('   - Run the migration to change assigned_to column type to TEXT');
    console.log('   - Migration file: supabase/migrations/fix-project-tasks-assigned-to.sql');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

verifyDatabase();