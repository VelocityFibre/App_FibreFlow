import { createClient } from '@supabase/supabase-js';

// Hardcoded values from the .env file
const supabaseUrl = 'https://eutwrybevqvatgecsypw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1dHdyeWJldnF2YXRnZWNzeXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczOTQ0NDcsImV4cCI6MjA2Mjk3MDQ0N30.s4XnYMdT2n0Jzg94DHu3K6kD2zOcMooDszg7woMcVgk';

// Create a Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
