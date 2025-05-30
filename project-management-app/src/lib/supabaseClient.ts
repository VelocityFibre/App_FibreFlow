import { createClient } from '@supabase/supabase-js';

// Hardcoded values from the .env file
const supabaseUrl = 'https://eutwrybevqvatgecsypw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1dHdyeWJldnF2YXRnZWNzeXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczOTQ0NDcsImV4cCI6MjA2Mjk3MDQ0N30.s4XnYMdT2n0Jzg94DHu3K6kD2zOcMooDszg7woMcVgk';

// Create a Supabase client with explicit error handling
let supabaseInstance;

try {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key must be provided');
  }
  
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  
  console.log('Supabase client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  // Provide a fallback client that will show a clear error message when used
  supabaseInstance = {
    from: () => {
      throw new Error('Supabase client failed to initialize. Check your configuration.');
    },
    auth: {
      signIn: () => {
        throw new Error('Supabase client failed to initialize. Check your configuration.');
      },
      signOut: () => {
        throw new Error('Supabase client failed to initialize. Check your configuration.');
      },
    },
    storage: {
      from: () => {
        throw new Error('Supabase client failed to initialize. Check your configuration.');
      },
    },
  };
}

export const supabase = supabaseInstance;
