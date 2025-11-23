import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

console.log('[supabaseClient] Initializing Supabase client with URL:', supabaseUrl);

// Memory storage implementation to test if LocalStorage is the issue
class MemoryStorage {
    constructor() { this.store = {}; }
    getItem(key) { return this.store[key] || null; }
    setItem(key, value) { this.store[key] = value; }
    removeItem(key) { delete this.store[key]; }
}

// Create Supabase client with explicit configuration and memory storage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false, // Disable persistence for now
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storage: new MemoryStorage()
    }
});

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
    return Boolean(supabaseUrl && supabaseAnonKey);
};
