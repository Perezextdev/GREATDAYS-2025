-- Additional GREAT DAYS tables and storage bucket

-- TESTIMONIALS table
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT,
    church_branch TEXT,
    role_title TEXT,
    profile_photo_url TEXT,
    testimonial_text TEXT NOT NULL CHECK (char_length(testimonial_text) BETWEEN 50 AND 500),
    star_rating INTEGER NOT NULL CHECK (star_rating BETWEEN 1 AND 5),
    year_of_attendance INTEGER,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    admin_notes TEXT,
    approved_by TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for testimonials
CREATE INDEX IF NOT EXISTS idx_testimonials_email ON testimonials(email);
CREATE INDEX IF NOT EXISTS idx_testimonials_status ON testimonials(status);
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON testimonials(created_at);

-- SUPPORT_REQUESTS table
CREATE TABLE IF NOT EXISTS support_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    registration_id UUID REFERENCES registrations(id),
    attendee_email TEXT NOT NULL,
    attendee_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','in_progress','pending_response','completed')),
    priority TEXT NOT NULL DEFAULT 'low' CHECK (priority IN ('low','medium','high','urgent')),
    assigned_to TEXT,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for support_requests
CREATE INDEX IF NOT EXISTS idx_support_requests_status ON support_requests(status);
CREATE INDEX IF NOT EXISTS idx_support_requests_priority ON support_requests(priority);
CREATE INDEX IF NOT EXISTS idx_support_requests_created_at ON support_requests(created_at);

-- EMAIL_LOGS table
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    registration_id UUID REFERENCES registrations(id) NOT NULL,
    email_type TEXT NOT NULL CHECK (email_type IN ('confirmation','reminder','welcome','completion')),
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    delivery_status TEXT NOT NULL CHECK (delivery_status IN ('sent','delivered','bounced','failed')),
    opened_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for email_logs
CREATE INDEX IF NOT EXISTS idx_email_logs_registration_id ON email_logs(registration_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_email_type ON email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);

-- ADMIN_USERS table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('super_admin','coordinator','support_agent','viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for admin_users email
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- Storage bucket for event files (profile photos, badges, documents)
INSERT INTO storage.buckets (id, name, public) VALUES ('event-files','event-files',true) ON CONFLICT (id) DO NOTHING;

-- Storage policies (public read for objects in event-files bucket)
CREATE POLICY "public_event_files_read" ON storage.objects FOR SELECT TO public USING (bucket_id = 'event-files');
CREATE POLICY "admin_event_files_write" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'event-files');

-- RLS policies for new tables
-- Testimonials: public insert, public read approved & visible, admin full access
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_testimonial_insert" ON testimonials FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "public_testimonial_read" ON testimonials FOR SELECT TO anon USING (status = 'approved' AND is_visible = true);
CREATE POLICY "admin_testimonial_all" ON testimonials FOR ALL TO authenticated USING (true);

-- Support requests: public insert, admin full access
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_support_insert" ON support_requests FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "admin_support_all" ON support_requests FOR ALL TO authenticated USING (true);

-- Email logs: admin only
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_email_logs_all" ON email_logs FOR ALL TO authenticated USING (true);

-- Admin users: admin only (super_admin can modify)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_users_read" ON admin_users FOR SELECT TO authenticated USING (true);
CREATE POLICY "super_admin_modify_admin_users" ON admin_users FOR ALL TO authenticated USING (auth.role() = 'super_admin');

SELECT 'Additional tables and storage bucket created successfully! 🎉' AS message;
