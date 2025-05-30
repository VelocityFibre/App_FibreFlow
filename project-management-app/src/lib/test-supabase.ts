import { supabase } from './supabaseClient';

async function testSupabaseConnection() {
  try {
    // Simple query to test connection
    const { data, error } = await supabase.from('projects').select('count()', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    console.log('Supabase connection successful!');
    console.log('Projects count:', data);
    return true;
  } catch (err) {
    console.error('Unexpected error testing Supabase connection:', err);
    return false;
  }
}

// Execute the test
testSupabaseConnection()
  .then(success => {
    console.log('Test completed. Connection successful:', success);
  })
  .catch(err => {
    console.error('Test failed with error:', err);
  });
