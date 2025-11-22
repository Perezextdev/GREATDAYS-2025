import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugLogin() {
    console.log('1. Attempting login...');
    const email = 'glory@greatdays.com';
    const password = 'GD2025@!';

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error('Login failed:', error.message);
        return;
    }

    console.log('Login successful. User ID:', data.user.id);

    console.log('2. Fetching admin profile...');
    try {
        const { data: profile, error: profileError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', email)
            .eq('is_active', true)
            .single();

        if (profileError) {
            console.error('Profile fetch error:', profileError.message);
            console.error('Error details:', profileError);
        } else {
            console.log('Profile fetched successfully:', profile);
        }

        console.log('3. Attempting to update last_login...');
        const { error: updateError } = await supabase
            .from('admin_users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', data.user.id);

        if (updateError) {
            console.error('Update last_login error:', updateError.message);
        } else {
            console.log('last_login updated successfully');
        }

    } catch (err) {
        console.error('Unexpected error during profile operations:', err);
    }
}

debugLogin();
