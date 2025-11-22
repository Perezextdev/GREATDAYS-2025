import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function setupTable() {
    console.log('Setting up admin_users table...');

    // Read SQL file
    const sql = readFileSync(resolve(__dirname, 'setupAdminTable.sql'), 'utf8');

    // Execute SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
        console.error('Error executing SQL:', error);
        console.log('\nTrying alternative method...');

        // If RPC doesn't work, we'll need to guide the user to run it manually
        console.log('\nPlease run the following SQL in your Supabase SQL Editor:');
        console.log('File location: scripts/setupAdminTable.sql');
        console.log('\nOr copy this SQL:\n');
        console.log(sql);
    } else {
        console.log('Table setup complete!');
    }
}

setupTable();
