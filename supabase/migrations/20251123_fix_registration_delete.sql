-- Fix Registration Deletion Issues

-- 1. Allow authenticated users (admins) to delete registrations
-- Check if policy exists first to avoid error (optional, but good practice)
DROP POLICY IF EXISTS "Allow admin delete" ON registrations;
CREATE POLICY "Allow admin delete" ON registrations FOR DELETE TO authenticated USING (true);

-- 2. Update support_requests foreign key to CASCADE delete
ALTER TABLE support_requests DROP CONSTRAINT IF EXISTS support_requests_registration_id_fkey;
ALTER TABLE support_requests ADD CONSTRAINT support_requests_registration_id_fkey 
    FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE;

-- 3. Update email_logs foreign key to CASCADE delete
ALTER TABLE email_logs DROP CONSTRAINT IF EXISTS email_logs_registration_id_fkey;
ALTER TABLE email_logs ADD CONSTRAINT email_logs_registration_id_fkey 
    FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE;

SELECT 'Registration deletion fix applied successfully! 🎉' AS message;
