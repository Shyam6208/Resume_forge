# ResumeForge — Agent Rules & Context

## Project
ResumeForge is a free, professional resume builder.
No AI APIs. No watermark. Completely free.
Supabase SQL schema is ALREADY CREATED — do not recreate it.

## Tech Stack
- Framework: Next.js 15 (App Router, NOT pages router)
- Language: TypeScript strict mode (no `any` types ever)
- Styling: Tailwind CSS + shadcn/ui components
- State: Zustand with persist middleware
- Forms: React Hook Form + Zod (always together)
- Database: Supabase PostgreSQL (use @supabase/supabase-js)
- Auth: Supabase Auth (Google OAuth + Magic Link + Anonymous)
- Drag & Drop: @dnd-kit/core + @dnd-kit/sortable
- PDF Export: Puppeteer (server-side API route only)
- DOCX Export: docx npm package
- QR Codes: qrcode npm package
- Animations: Framer Motion
- Charts: Chart.js + react-chartjs-2
- Image Upload: Cloudinary (next-cloudinary package)
- Icons: lucide-react
- Notifications: react-hot-toast
- Hosting: Vercel

## Database Tables (ALREADY EXIST in Supabase)
- profiles (id, name, email, avatar_url, username, user_type, is_admin, is_guest)
- resumes (id, user_id, title, slug, template_id, data JSONB, theme JSONB, section_order TEXT[], is_public, target_job, download_count)
- cover_letters (id, user_id, resume_id, company_name, position, content, template_id)
- templates (id, name, slug, category, preview_image, ats_rating, is_active, tags)
- job_applications (id, user_id, resume_id, job_title, company, status, applied_date)
- RLS is enabled on all tables

## Supabase Client Rules
- Browser components: use createBrowserClient from @supabase/ssr
- Server components & API routes: use createServerClient from @supabase/ssr
- NEVER use service role key in client-side code
- NEVER trust client session — always verify with supabase.auth.getUser() server-side

## Cloudinary Rules
- Use next-cloudinary CldUploadWidget for photo uploads
- Upload preset name: "resumeforge_profiles" (unsigned)
- Face detection crop: c_fill,g_face,w_400,h_400
- Max file size: 2MB
- Formats: jpg, png, webp only

## Critical Feature Rules
1. EMPTY SECTIONS NEVER RENDER — use SectionWrapper component
2. Resume preview updates on EVERY keystroke — no refresh
3. ATS score recalculates live — debounce 800ms
4. Resume score recalculates live — debounce 500ms
5. Auto-save every 3 seconds when isDirty is true
6. Fresher/Student: No penalty for missing experience
7. All templates must use SectionWrapper on every section
8. Mobile: Tab-based editor (Edit tab | Preview tab)
9. A4 size maintained in preview (210mm x 297mm)
10. No AI API calls anywhere in the project

## Code Style
- Named exports only (no default exports except page.tsx files)
- Async/await only (no .then() chains)
- Error boundaries on all major components
- Loading skeletons on all data fetches
- Max 150 lines per component file — split if larger
- Use @/ absolute imports always
- zod schema defined before the form component

## Folder Structure
src/app/(landing|auth|dashboard|editor|onboarding|portfolio|admin)/
src/components/(editor|forms|preview|templates|sections|ats|score|
  smart-library|cover-letter|dashboard|customizer|onboarding|navbar|footer|ui)/
src/store/ src/hooks/ src/lib/supabase/ src/utils/ src/types/ src/data/
src/config/ src/styles/
