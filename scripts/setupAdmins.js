import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials (URL or Service Role Key) in .env file');
    process.exit(1);
}

// Initialize Supabase with Service Role Key for Admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const admins = [
    {
        email: 'glory@greatdays.com',
        password: 'GD2025@!',
        full_name: 'Super Admin',
        role: 'super_admin'
    },
    {
        email: 'praise@greatdays.com',
        password: 'Praise25!',
        full_name: 'Coordinator',
        role: 'coordinator'
    },
    {
        email: 'help@greatdays.com',
        password: 'Helper25!',
        full_name: 'Support Agent',
        role: 'support_agent'
    },
    {
        email: 'view@greatdays.com',
        password: 'Viewer25!',
        full_name: 'Viewer',
        role: 'viewer'
    }
];

async function setupAdmins() {
    console.log('Starting admin setup with Service Role Key...');

    for (const admin of admins) {
        console.log(`Processing ${admin.email}...`);
        let userId;

        // 1. Try to create the user (auto-confirms by default with admin API)
        const { data: createData, error: createError } = await supabase.auth.admin.createUser({
            email: admin.email,
            password: admin.password,
            email_confirm: true,
            user_metadata: { full_name: admin.full_name }
        });

        if (createError) {
            // If user already exists, find them and update
            if (createError.message.includes('already registered') || createError.status === 422) {
                console.log(`User ${admin.email} already exists. Updating...`);

                // Find user by email (listUsers doesn't filter by email directly in all versions, but we can iterate or use specific method if available)
                // Better: just try to update by email if possible, or list and find.
                // Actually, listUsers allows filtering? No, not directly in JS client usually.
                // But we can use `getUserById` if we knew it.
                // Workaround: List users and find.

                const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
                if (listError) {
                    console.error(`Error listing users: ${listError.message}`);
                    continue;
                }

                const existingUser = users.find(u => u.email === admin.email);
                if (existingUser) {
                    userId = existingUser.id;
                    // Update password and confirm email
                    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
                        password: admin.password,
                        email_confirm: true,
                        user_metadata: { full_name: admin.full_name }
                    });

                    if (updateError) {
                        console.error(`Error updating user ${admin.email}: ${updateError.message}`);
                    } else {
                        console.log(`Updated auth for ${admin.email}`);
                    }
                } else {
                    console.error(`Could not find existing user ${admin.email} in list.`);
                }
            } else {
                console.error(`Error creating user ${admin.email}: ${createError.message}`);
            }
        } else {
            userId = createData.user.id;
            console.log(`Created new user ${admin.email}`);
        }

        if (userId) {
            // 2. Insert/Update Admin Profile in public table
            const { error: profileError } = await supabase
                .from('admin_users')
                .upsert({
                    id: userId,
                    email: admin.email,
                    full_name: admin.full_name,
                    role: admin.role,
                    is_active: true,
                    last_login: new Date().toISOString()
                }, { onConflict: 'id' });

            if (profileError) {
                console.error(`Error updating profile for ${admin.email}: ${profileError.message}`);
            } else {
                console.log(`Successfully set up profile for ${admin.role}: ${admin.email}`);
            }
        }
    }

    console.log('Admin setup complete!');
}

setupAdmins();
