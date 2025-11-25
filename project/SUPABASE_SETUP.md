# Supabase Setup Guide for Smart Campus Companion

## Quick Start

### 1. Supabase Project Setup

Create a Supabase project at [supabase.com](https://supabase.com). You'll need:
- **Project URL** → `REACT_APP_SUPABASE_URL`
- **Anon Key** → `REACT_APP_SUPABASE_ANON_KEY`

### 2. Environment Variables

Create `.env` in `/project` folder:
```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Create Database Tables

**Quick way (Recommended):**
1. Open Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy entire contents of `SETUP_TABLES.sql` from this project
4. Paste into the SQL Editor
5. Click "Run"

All tables will be created automatically.

**What gets created:**
- `users` — user profiles (id = auth user id)
- `announcements` — announcements with audience targeting
- `events` — campus events
- `timetables` — timetable items per user
- `notes` — uploaded file metadata

If you see errors about tables already existing, that's fine — the script uses `IF NOT EXISTS`.

### 4. Configure Authentication

**Email Confirmation (Choose one):**

**Option A: Allow login without email confirmation (Easier for development)**
- Go to Supabase Dashboard → Authentication → Providers → Email
- Turn OFF "Confirm email" toggle
- Users can log in immediately after signup

**Option B: Require email confirmation (More secure)**
- Keep "Confirm email" ON
- After signup, users must click email link to verify
- The app will redirect unconfirmed logins to `/verify-email` page
- Users click "Refresh status" after verifying to complete login

### 5. Configure OAuth (Optional - for Google Sign-in)

1. Go to Google Cloud Console and create OAuth 2.0 credentials
2. In Supabase → Authentication → Providers → Google:
   - Add Client ID and Client Secret
   - Add authorized redirect URL (Supabase will show you the exact URL)

### 6. Setup Storage Bucket for Notes

In Supabase → Storage:
1. Create a new bucket named `notes`
2. Choose **Public** if you want direct file URLs, or **Private** for signed URLs
3. (Optional) Set a file size limit (e.g., 50MB)

### 7. Enable Realtime (for live updates)

In Supabase Dashboard:
1. Go to **Database** → **Replication**
2. Toggle ON for these tables:
   - `announcements` (for live announcement updates)
   - `events` (for live event updates)
   - `timetables` (for live timetable updates)
   - `notes` (for live notes list)

This enables real-time subscriptions in the app.

### 8. (Optional) Enable Row-Level Security

For production, uncomment and run the RLS examples in `supabase_schema.sql`:

```sql
-- Users can only read/update their own profile
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_owns_data" ON public.users
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can only see their own notes
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notes_user_access" ON public.notes
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

## Running the App

```bash
cd project
npm install
npm start
```

Visit http://localhost:3000

## Troubleshooting

### "Email not confirmed" error at login
- **Development:** Turn off "Confirm email" in Authentication settings (easiest)
- **With verification:** After signup, check spam folder for verification email. Click link, return to app, click "Refresh status" on verify page

### Upload fails with 403 Forbidden
- Check that `notes` bucket exists in Storage
- If bucket is private, users need signed URLs (app uses public URLs by default)

### Announcements/events not updating in real-time
- Enable Realtime for those tables in Supabase Dashboard → Database → Replication

### "Invalid API key" error
- Verify `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` are set in `.env`
- Keys must be from the same Supabase project

## Environment Variables Reference

| Variable | Source | Example |
|----------|--------|---------|
| `REACT_APP_SUPABASE_URL` | Supabase Dashboard → Settings → API | `https://abcxyz.supabase.co` |
| `REACT_APP_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API (Anon public) | `eyJhbGc...` |

---

**Note:** Do not commit `.env` to git. Add it to `.gitignore` (already done in this project).
