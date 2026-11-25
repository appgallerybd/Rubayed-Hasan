-- Rubayed Hasan portfolio: production security migration
-- Run in Supabase SQL Editor AFTER confirming these tables and bucket exist.
-- Assign admin role only to trusted accounts; never expose the service_role key.

-- 1) Grant the Admin role to the intended account (replace the email).
-- UPDATE auth.users
-- SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
-- WHERE email = 'YOUR_ADMIN_EMAIL@example.com';

-- 2) Helper expression used by policies: (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
-- Enable RLS and allow public reads; writes are admin-only.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['site_settings','social_links','stats','projects','blog_posts','services','faqs','chatbot_qa']
  LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      EXECUTE format('DROP POLICY IF EXISTS "public read %I" ON public.%I', t, t);
      EXECUTE format('DROP POLICY IF EXISTS "admin manage %I" ON public.%I', t, t);
      EXECUTE format('CREATE POLICY "public read %I" ON public.%I FOR SELECT TO anon, authenticated USING (true)', t, t);
      EXECUTE format('CREATE POLICY "admin manage %I" ON public.%I FOR ALL TO authenticated USING ((auth.jwt() -> ''app_metadata'' ->> ''role'') = ''admin'') WITH CHECK ((auth.jwt() -> ''app_metadata'' ->> ''role'') = ''admin'')', t, t);
    END IF;
  END LOOP;
END $$;

-- 3) Storage bucket: public image reads, Admin-only uploads/updates/deletes.
-- Keep the bucket public so portfolio images remain visible without login.
UPDATE storage.buckets SET public = true WHERE id = 'site-assets';

DROP POLICY IF EXISTS "public read site-assets" ON storage.objects;
CREATE POLICY "public read site-assets" ON storage.objects
FOR SELECT TO anon, authenticated USING (bucket_id = 'site-assets');

DROP POLICY IF EXISTS "admin upload site-assets" ON storage.objects;
CREATE POLICY "admin upload site-assets" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'site-assets'
  AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

DROP POLICY IF EXISTS "admin update site-assets" ON storage.objects;
CREATE POLICY "admin update site-assets" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'site-assets' AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
WITH CHECK (bucket_id = 'site-assets' AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin delete site-assets" ON storage.objects;
CREATE POLICY "admin delete site-assets" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'site-assets' AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- IMPORTANT:
-- Review existing policies before running this migration. Existing permissive policies
-- can OR together with these policies. Remove obsolete broad write policies manually.
-- If the project intentionally allows public chatbot Q&A reads, the policy above preserves it.
