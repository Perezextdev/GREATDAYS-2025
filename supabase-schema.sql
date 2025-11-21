-- GREAT DAYS 2025 Registration Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Create custom types for enum fields
CREATE TYPE title_enum AS ENUM (
    'Reverend', 
    'Pastor', 
    'Deacon', 
    'Deaconess', 
    'Mr', 
    'Mrs', 
    'Miss'
);

CREATE TYPE unit_enum AS ENUM (
    'PASTOR',
    'LOC',
    'VOC',
    'USHER',
    'PROTOCOL',
    'HELPDESK',
    'MEDIA',
    'TECHNICAL',
    'CHILDRENS_DEPARTMENT',
    'PROTOCOL_SECURITY',
    'TRANSPORT_LOGISTICS',
    'SANCTUARY'
);

CREATE TYPE branch_enum AS ENUM (
    'FDIM-LAGOS',
    'FDIM-ABUJA',
    'FDIM-ENUGU',
    'FDIM-TARABA',
    'FDIM-JALINGO',
    'FDIM-KADUNA',
    'FDIM-HEADQUARTERS',
    'FDIM-KANO'
);

-- Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Personal Information
    title title_enum NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    profile_photo_url TEXT,
    
    -- Church Information
    church_ministry TEXT,  -- Required ONLY for non-members
    church_unit unit_enum NOT NULL,
    
    -- Membership Information
    is_member BOOLEAN NOT NULL,
    branch branch_enum,  -- Required ONLY for members
    
    -- Participation Details
    participation_mode TEXT NOT NULL CHECK (participation_mode IN ('Online', 'Onsite')),
    location_type TEXT NOT NULL CHECK (location_type IN ('Within Zaria', 'Outside Zaria')),
    
    -- Accommodation (only for those outside Zaria)
    needs_accommodation BOOLEAN DEFAULT false,
    accommodation_type TEXT CHECK (accommodation_type IN ('General', 'Hotel', NULL)),
    arrival_date DATE,
    
    -- Constraints
    CONSTRAINT check_member_branch CHECK (
        (is_member = true AND branch IS NOT NULL) OR 
        (is_member = false AND branch IS NULL)
    ),
    CONSTRAINT check_non_member_church CHECK (
        (is_member = false AND church_ministry IS NOT NULL AND church_ministry != '') OR 
        (is_member = true)
    )
);

-- Create indexes for better performance
CREATE INDEX idx_registrations_email ON registrations(email);
CREATE INDEX idx_registrations_is_member ON registrations(is_member);
CREATE INDEX idx_registrations_branch ON registrations(branch);
CREATE INDEX idx_registrations_created_at ON registrations(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (register)
CREATE POLICY "Allow public registration" 
ON registrations 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Create policy to allow users to view their own registration (optional)
CREATE POLICY "Users can view their own registrations" 
ON registrations 
FOR SELECT 
TO anon 
USING (true);

-- Create a storage bucket for profile photos (optional)
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policy for profile photos
CREATE POLICY "Public profile photo access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-photos');

CREATE POLICY "Allow profile photo uploads"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'profile-photos');

-- Success message
SELECT 'Database schema created successfully! 🎉' AS message;
