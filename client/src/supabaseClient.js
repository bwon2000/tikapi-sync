// src/supabaseClient.js

import { createClient } from '@supabase/supabase-js';

// ✅ Use environment variables for flexibility and security
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://yxeksrbkwqvnmbhrlakg.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4ZWtzcmJrd3F2bm1iaHJsYWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4NDAxODIsImV4cCI6MjA1ODQxNjE4Mn0.lIZN4NpKc8RlEzunUh71p-hP1yi9BwMXO_NWVEiN0oc';

// Development mode warning
if (process.env.NODE_ENV === 'development' && !process.env.REACT_APP_SUPABASE_URL) {
  console.warn('⚠️ Using demo Supabase instance. Set REACT_APP_SUPABASE_URL in .env for your own database.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
