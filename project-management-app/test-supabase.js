// Simple script to test Supabase connection
const { createClient } = require('@supabase/supabase-js');

// Using the same hardcoded values from supabaseClient.ts
const supabaseUrl = 'https://eutwrybevqvatgecsypw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1dHdyeWJldnF2YXRnZWNzeXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczOTQ0NDcsImV4cCI6MjA2Mjk3MDQ0N30.s4XnYMdT2n0Jzg94DHu3K6kD2zOcMooDszg7woMcVgk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Simple query to test connection
    const { count, error } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Connection error:', error);
      return;
    }
    
    console.log('Connection successful!');
    console.log('Projects count:', count);
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testConnection();
