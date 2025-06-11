import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://smqnaddacvwwuehxymbr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtcW5hZGRhY3Z3d3VlaHh5bWJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0NTUzOTcsImV4cCI6MjA2NTAzMTM5N30.W-JJIpw3lTKgfimUHpFbBOP5r1qmDuCB-mMO_KIuXlY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 