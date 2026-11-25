# Rubayed Hasan Portfolio

Static portfolio website built with HTML, CSS, JavaScript and Supabase.

## Deployment

1. Publish the repository with GitHub Pages (branch: `main`, folder: `/`).
2. In Supabase, confirm the project URL and publishable key in `js/main.js` and `js/admin.js`.
3. Create/confirm the tables used by the website: `site_settings`, `social_links`, `stats`, `projects`, `blog_posts`, `services`, `faqs`, `chatbot_qa`.
4. Create a public Storage bucket named `site-assets`.
5. Open `supabase/production-security.sql` in Supabase SQL Editor. Review existing policies first, then run the migration.
6. Assign the Admin role to the intended account by editing the commented SQL statement in that file and running it. This writes `role=admin` into the user's **app_metadata**. Do not use user_metadata for authorization.
7. Sign out and sign in again so the refreshed JWT includes the Admin role.
8. Test public pages in a private/incognito window and test admin login with both an Admin and a normal user.

## Admin access

Open `admin.html`. Only accounts with `app_metadata.role = admin` (or `app_metadata.is_admin = true`) can enter. Create users through Supabase Auth; never put the Supabase service-role key in this repository or any browser code.

## Security notes

- The browser uses only the Supabase publishable key. This key is designed to be public; database and Storage policies are the security boundary.
- The SQL migration enables RLS and grants public SELECT plus Admin-only writes on the site's content tables. Review any pre-existing permissive policies because PostgreSQL permissive policies are combined with OR.
- The migration assumes the listed public tables already exist and that `site_settings.key` is unique for upsert.
- Public content rendering should only accept trusted/admin-managed content. For a strict production deployment, review all existing Supabase policies and content-rendering paths before launch.
