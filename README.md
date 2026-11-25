# Rubayed Hasan — Portfolio CMS

Premium static portfolio built with HTML, CSS, vanilla JavaScript and Supabase. The public pages are rendered from one CMS document; the Admin Panel manages all editable content without changing website source files.

## Pages
- `index.html` — Home, hero, profile, statistics, social links, services, featured projects, latest blogs and contact CTA.
- `about.html` — Profile, biography, services, workflow and toolkit.
- `portfolio.html` — Statistics and responsive project gallery. Select a project card to expand its details.
- `services.html` — Service cards and expandable FAQs.
- `blogs.html` — Published posts, category filters and category counts.
- `blog-detail.html?id=...` — Article, reading time, share/copy actions and scroll progress.
- `contact.html` — Contact details, Google Maps embed and contact form.
- `admin.html` — Admin-only CMS and contact inbox.

## Setup — required before deployment

1. Open the Supabase project used by the site.
2. Open **SQL Editor** and run the complete file `supabase/portfolio-cms-v2.sql`.
3. In Supabase Authentication, create the intended administrator account.
4. In SQL Editor, set the Admin role in `auth.users.raw_app_meta_data` for that exact account. The commented SQL at the bottom of the migration is a template; replace the email and execute it. Never grant admin through user-editable `user_metadata`.
5. Sign out and sign in again so the JWT contains `app_metadata.role = admin`.
6. Confirm the `site-assets` Storage bucket exists and is public for portfolio image display. The migration creates/configures it and restricts uploads to Admins.
7. Test the public site and Admin Panel on the feature branch before merging to `main`.

## Using the CMS

1. Visit `admin.html` and sign in with the Admin account.
2. Choose a section from the left navigation.
3. Edit the JSON content in that section. Text values are ordinary strings; repeatable sections (projects, services, blogs, social links, workflow, tools and FAQs) are JSON arrays. Add, edit, reorder or remove array items as needed.
4. Click **Save Changes**. Public pages read the saved CMS document from Supabase.
5. For images, use **Media Library · Upload Image**. The uploader validates image MIME type and a 5 MB size limit, uploads to Supabase Storage, and copies the public URL. Paste that URL into the appropriate `image`, `profileImage`, `logo` or `mapUrl` field.
6. Blog rich text tags: `[B]bold[/B]`, `[I]italic[/I]`, `[U]underline[/U]`, `[H]highlight[/H]`. Set highlight foreground/background colours in the Blogs section.
7. Social links are independently configured for homepage (`socialTop`) and footer (`socialFooter`). Keep `enabled: true` and add a valid `url` to display an item.
8. Chat assistant quick replies are managed under **WhatsApp Assistant**. Each item has `question`, `answer` and `enabled`.
9. Contact form submissions appear under **Contact Inbox**.

## CMS JSON examples

Project:
```json
{"id":"project-01","title":"Brand Identity — Noor","category":"Branding","description":"Complete visual identity system for a modern brand.","image":"https://YOUR-PUBLIC-IMAGE-URL","url":"","featured":true,"enabled":true}
```

Blog:
```json
{"id":"blog-01","title":"How I Build a Brand Identity","category":"Design","excerpt":"A practical look at my creative process.","content":"A strong identity starts with [B]clear strategy[/B]. Use [H]highlighted ideas[/H] to guide the reader.","image":"https://YOUR-PUBLIC-IMAGE-URL","readTime":"4 min read","published":true}
```

Service:
```json
{"title":"Brand Identity Design","description":"A coherent identity system for your business.","icon":"✦","enabled":true}
```

Social link:
```json
{"name":"WhatsApp","url":"https://wa.me/8801XXXXXXXXX","icon":"whatsapp","enabled":true}
```

FAQ:
```json
{"question":"How do I start a project?","answer":"Send a message through the contact form and describe your requirements.","enabled":true}
```

## Security

- Browser code contains only the Supabase publishable key. Never expose a service-role or secret key.
- RLS protects `portfolio_content`, `contact_messages` and Storage. Public visitors can read portfolio content and submit contact messages; Admins can edit CMS data and manage inbox messages.
- The Admin Panel checks `app_metadata.role`; the database policies enforce the same role independently.
- Review any existing broad Supabase policies before launch. PostgreSQL permissive policies are combined with OR, so a pre-existing public write policy could weaken these restrictions.
- For high-volume public forms, add CAPTCHA/Turnstile and server-side rate limiting before production. A static client cannot reliably prevent automated spam.
- The current CMS editor is a structured JSON editor for repeatable collections. Keep valid JSON and retain unique `id` values for projects and blog posts.

## Important launch checklist

- Run the SQL migration before publishing the new frontend.
- Assign the Admin role and test both Admin and ordinary-user accounts.
- Upload a test image and verify the public URL loads.
- Submit a test contact message and verify it appears in the inbox.
- Test each page on a phone and desktop.
- Verify the correct Google Maps **embed URL** is used for `contact.mapUrl`.
- Merge the CMS branch into `main` only after the Supabase migration and manual smoke tests are complete.
