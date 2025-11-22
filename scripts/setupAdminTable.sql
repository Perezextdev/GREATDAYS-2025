-- Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'coordinator', 'support_agent', 'viewer')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add is_active column if it doesn't exist (for existing tables)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'admin_users' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.admin_users ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow service role full access to admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow anon to read admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow users to update own last_login" ON public.admin_users;
DROP POLICY IF EXISTS "Allow users to insert own profile" ON public.admin_users;

-- Policy: Allow ANY authenticated user to read admin_users (needed for login flow)
CREATE POLICY "Allow authenticated users to read admin_users"
ON public.admin_users
FOR SELECT
TO authenticated, anon
USING (true);

-- Policy: Allow authenticated users to update their own last_login
CREATE POLICY "Allow users to update own last_login"
ON public.admin_users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy: Allow authenticated users to insert their own profile (for signup)
CREATE POLICY "Allow users to insert own profile"
ON public.admin_users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy: Allow service role full access (for admin operations)
CREATE POLICY "Allow service role full access to admin_users"
ON public.admin_users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.admin_users;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
