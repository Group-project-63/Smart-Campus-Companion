# Fix for Announcements Not Saving Issue

## The Problem
When trying to add announcements, you get "Failed to publish. Try again." error.

## Root Cause
This is usually caused by **Row-Level Security (RLS) policies** that prevent inserts to the announcements table.

---

## Solution

### Quick Fix (Development - Fastest Way)

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Click **"New Query"**
4. Copy and paste this SQL:

```sql
ALTER TABLE public.announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetables DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades DISABLE ROW LEVEL SECURITY;
```

5. Click **"Run"**
6. Try adding an announcement again

✅ This should fix the issue immediately!

---

### Proper Fix (Production - More Secure)

If you want proper Row-Level Security policies:

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Click **"New Query"**
4. Copy the entire contents of `SETUP_RLS_POLICIES.sql` from this project
5. Paste into the SQL Editor
6. Click **"Run"**
7. Try adding an announcement again

This sets up proper security policies that allow:
- ✓ Public reads for announcements, events, and user profiles
- ✓ Authenticated users (admins) to create/update/delete announcements and events
- ✓ Users can only manage their own timetables, notes, and grades

---

## Verification

After applying either fix:

1. Go to the Admin Dashboard
2. Click on "Manage Announcements"
3. Fill in:
   - **Title**: Test Announcement
   - **Body**: This is a test
   - Leave department and year as "All"
4. Click **"Publish"**

You should see: **"✓ Announcement published and saved to database!"**

---

## If Still Not Working

Check the browser console for detailed error messages:

1. Open your browser **Developer Tools** (F12 or Right-click → Inspect)
2. Go to the **Console** tab
3. Try adding an announcement again
4. Look for error messages that start with "Announcement insert error:"
5. Share the exact error message from the console

---

## Common Error Messages & Fixes

| Error | Fix |
|-------|-----|
| `policy violation` | Disable RLS using the Quick Fix above |
| `NOT NULL violation on title` | Make sure title field is filled |
| `NOT NULL violation on body` | Make sure body field is filled |
| `Invalid API key` | Check your Supabase URL and keys in `.env` file |
| `relation "announcements" does not exist` | Run `SETUP_TABLES.sql` first |

---

## Technical Details

**What Changed:**
- Added better error logging in `AdminAnnouncements.js`
- Created `SETUP_RLS_POLICIES.sql` with flexible RLS configuration
- Added this troubleshooting guide

**The Issue Was:**
Supabase tables might have had RLS (Row-Level Security) enabled from a previous configuration, which blocks inserts unless proper policies are defined. This is a security feature, but needs configuration.

---

## Questions?

If the announcements still don't work after these steps:
1. Check that the `announcements` table exists in your Supabase Database
2. Verify your `.env` file has correct `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`
3. Check browser console (F12) for the exact error message
4. Ensure you're logged in as an admin user (role should be 'admin' or authenticated user)
