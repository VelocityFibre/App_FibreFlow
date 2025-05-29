import { createClient } from '@supabase/supabase-js';

// Use explicit values for Supabase connection
// For development purposes only - in production use environment variables
const supabaseUrl = 'https://eutwrybevqvatgecsypw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1dHdyeWJldnF2YXRnZWNzeXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYzODk2NjcsImV4cCI6MjAzMTk2NTY2N30.7f_gABGi_flOERJFxM9ckVcGLRYjOLy-J0UmY2Wxb7c';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);
