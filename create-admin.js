// Script to create the initial admin user
import { createClient } from '@supabase/supabase-js';

// You need to provide these values when running the script
// or set them in your environment
const supabaseUrl = 'https://dzdwusjzvnivsxcdeheq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6ZHd1c2p6dm5pdnN4Y2RlaGVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzcxMjI5MywiZXhwIjoyMDc5Mjg4MjkzfQ.Y9V4udfkcJg_M9WlfyZwNOyolf035mXSkah2o7m1130';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
    console.log('🚀 Creating admin user...');

    const email = 'admin@greatdays.com';
    const password = 'Admin123!';
    const fullName = 'Super Admin';
    const role = 'super_admin';

    try {
        // 1. Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName }
        });

        if (authError) {
            console.log('⚠️ Auth user might already exist:', authError.message);
            // If user exists, we might want to update password or just proceed
        } else {
            console.log('✅ Auth user created:', authData.user.id);
        }

        // 2. Create user in admin_users table
        const { data: tableData, error: tableError } = await supabase
            .from('admin_users')
            .upsert({
                email,
                full_name: fullName,
                role: role
            }, { onConflict: 'email' })
            .select();

        if (tableError) {
            throw tableError;
        }

        console.log('✅ Admin user record created/updated:', tableData);
        console.log('\n🎉 Admin setup complete!');
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
        console.log('   Login at: http://localhost:5173/admin/login');

    } catch (error) {
        console.error('❌ Error creating admin user:', error);
    }
}

createAdminUser();
