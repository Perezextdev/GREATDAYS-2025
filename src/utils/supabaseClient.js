// src/utils/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// Service role key is not used on client side for security
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
