// Supabase Database Setup Script
// Run this once to create all tables and configurations

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dzdwusjzvnivsxcdeheq.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6ZHd1c2p6dm5pdnN4Y2RlaGVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzcxMjI5MywiZXhwIjoyMDc5Mjg4MjkzfQ.Y9V4udfkcJg_M9WlfyZwNOyolf035mXSkah2o7m1130'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
    console.log('🚀 Starting Supabase setup...\n')

    try {
        // Step 1: Create custom types
        console.log('📝 Creating custom types...')
        const { error: typeError } = await supabase.rpc('exec_sql', {
            sql: `
        DO $$ BEGIN
          CREATE TYPE title_enum AS ENUM (
            'Reverend', 'Pastor', 'Deacon', 'Deaconess', 'Mr', 'Mrs', 'Miss'
          );
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;

        DO $$ BEGIN
          CREATE TYPE unit_enum AS ENUM (
            'PASTOR', 'LOC', 'VOC', 'USHER', 'PROTOCOL', 'HELPDESK', 
            'MEDIA', 'TECHNICAL', 'CHILDRENS_DEPARTMENT', 
            'PROTOCOL_SECURITY', 'TRANSPORT_LOGISTICS', 'SANCTUARY'
          );
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;

        DO $$ BEGIN
          CREATE TYPE branch_enum AS ENUM (
            'FDIM-LAGOS', 'FDIM-ABUJA', 'FDIM-ENUGU', 'FDIM-TARABA',
            'FDIM-JALINGO', 'FDIM-KADUNA', 'FDIM-HEADQUARTERS', 'FDIM-KANO'
          );
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `
        })

        if (typeError && !typeError.message.includes('already exists')) {
            console.error('❌ Error creating types:', typeError)
        } else {
            console.log('✅ Custom types created\n')
        }

        // Step 2: Create registrations table
        console.log('📝 Creating registrations table...')
        const { error: tableError } = await supabase.rpc('exec_sql', {
            sql: `
        CREATE TABLE IF NOT EXISTS registrations (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          
          title title_enum NOT NULL,
          full_name TEXT NOT NULL,
          phone_number TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          profile_photo_url TEXT,
          
          church_ministry TEXT,
          church_unit unit_enum NOT NULL,
          
          is_member BOOLEAN NOT NULL,
          branch branch_enum,
          
          participation_mode TEXT NOT NULL CHECK (participation_mode IN ('Online', 'Onsite')),
          location_type TEXT NOT NULL CHECK (location_type IN ('Within Zaria', 'Outside Zaria')),
          
          needs_accommodation BOOLEAN DEFAULT false,
          accommodation_type TEXT CHECK (accommodation_type IN ('General', 'Hotel', NULL)),
          arrival_date DATE,
          
          CONSTRAINT check_member_branch CHECK (
            (is_member = true AND branch IS NOT NULL) OR 
            (is_member = false AND branch IS NULL)
          ),
          CONSTRAINT check_non_member_church CHECK (
            (is_member = false AND church_ministry IS NOT NULL AND church_ministry != '') OR 
            (is_member = true)
          )
        );
        
        CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
        CREATE INDEX IF NOT EXISTS idx_registrations_is_member ON registrations(is_member);
        CREATE INDEX IF NOT EXISTS idx_registrations_branch ON registrations(branch);
        CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at);
      `
        })

        if (tableError) {
            console.error('❌ Error creating table:', tableError)
        } else {
            console.log('✅ Registrations table created\n')
        }

        // Step 3: Enable RLS and create policies
        console.log('📝 Setting up Row Level Security...')
        const { error: rlsError } = await supabase.rpc('exec_sql', {
            sql: `
        ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Allow public registration" ON registrations;
        CREATE POLICY "Allow public registration" 
        ON registrations 
        FOR INSERT 
        TO anon 
        WITH CHECK (true);
        
        DROP POLICY IF EXISTS "Users can view registrations" ON registrations;
        CREATE POLICY "Users can view registrations" 
        ON registrations 
        FOR SELECT 
        TO anon 
        USING (true);
      `
        })

        if (rlsError) {
            console.error('❌ Error setting up RLS:', rlsError)
        } else {
            console.log('✅ Row Level Security enabled\n')
        }

        // Step 4: Create storage bucket
        console.log('📝 Creating storage bucket for profile photos...')
        const { error: bucketError } = await supabase.storage.createBucket('profile-photos', {
            public: true,
            fileSizeLimit: 5242880 // 5MB
        })

        if (bucketError && !bucketError.message.includes('already exists')) {
            console.error('❌ Error creating bucket:', bucketError)
        } else {
            console.log('✅ Storage bucket created\n')
        }

        // Step 5: Verify setup
        console.log('🔍 Verifying setup...')
        const { data: tables, error: verifyError } = await supabase
            .from('registrations')
            .select('*')
            .limit(0)

        if (verifyError) {
            console.error('❌ Verification failed:', verifyError)
        } else {
            console.log('✅ Database verified successfully!\n')
        }

        console.log('🎉 Setup complete! Your registration system is ready to use.')
        console.log('\n📊 Next steps:')
        console.log('   1. Open http://localhost:5173')
        console.log('   2. Click "Register Now"')
        console.log('   3. Fill out and submit the form')
        console.log('   4. Check your Supabase dashboard to see the data!\n')

    } catch (error) {
        console.error('❌ Unexpected error:', error)
    }
}

setupDatabase()
